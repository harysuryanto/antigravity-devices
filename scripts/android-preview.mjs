import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const [portText, serial] = process.argv.slice(2);
const port = Number(portText);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || !/^emulator-\d+$/.test(serial ?? "")) {
  throw new Error("Expected a local preview port and Android emulator serial.");
}

const host = "127.0.0.1";
const packageRoot = fileURLToPath(new URL("../runtime-tools/node_modules/serve-emu", import.meta.url));
const bundledCli = join(packageRoot, "src/cli.ts");
const uiRoot = join(packageRoot, "dist/ui");
// This integration uses the API in the locally installed and tested T3 Code hub.
const hub = join(homedir(), ".t3/tools/expo-device-hub/0.19.1/node_modules/expo-device-hub/vendor/serve-emu/dist");

function serveWithPluginUI(options) {
  const assets = new Set(readdirSync(join(uiRoot, "assets")));
  return Bun.serve({
    ...options,
    async fetch(request, server) {
      const url = new URL(request.url);
      const asset = url.pathname.slice("/assets/".length);
      const page = url.pathname === "/" || url.pathname === "/index.html";
      const localAsset = url.pathname.startsWith("/assets/") && assets.has(asset);
      if (!["GET", "HEAD"].includes(request.method) || !(page || localAsset)) {
        return options.fetch(request, server);
      }

      // Let the backend apply its own HTTP guards before replacing a static file.
      url.pathname = "/index.html";
      const response = await options.fetch(new Request(url, {
        headers: request.headers, method: request.method
      }), server);
      if (!response || (!response.ok && response.status !== 404)) return response;
      // The hub's vendored library omits its HTML shell and returns 404 here.
      await response.body?.cancel();
      const file = Bun.file(page ? join(uiRoot, "index.html") : join(uiRoot, "assets", asset));
      const headers = new Headers(response.headers);
      headers.delete("Content-Length");
      headers.set("Content-Type", file.type);
      return new Response(request.method === "HEAD" ? null : file, { headers });
    }
  });
}

async function openAcceleratedPreview() {
  if (process.platform !== "darwin" || !existsSync(join(hub, "server.js"))) return;
  if (!process.env.SERVE_EMU_FFMPEG && existsSync("/opt/homebrew/bin/ffmpeg")) {
    process.env.SERVE_EMU_FFMPEG = "/opt/homebrew/bin/ffmpeg";
  }
  const { startServer } = await import(join(hub, "server.js"));
  const { findEmulatorGrpcEndpoint } = await import(join(hub, "emulator-grpc.js"));
  const { startGrpcSession } = await import(join(hub, "grpc-session.js"));
  const { startEmuSession } = await import(join(hub, "stream-session.js"));

  function existingEndpoint(target) {
    // Reuse an existing authenticated endpoint. Never enable an emulator endpoint.
    const endpoint = findEmulatorGrpcEndpoint(target);
    if (!endpoint?.port || !endpoint.token) throw new Error("No authenticated emulator gRPC endpoint.");
    return endpoint;
  }

  existingEndpoint(serial);
  return startServer({
    host, port, serial,
    streamMode: "grpc-screenshot", grpcImageMode: "mmap", encoder: "hardware",
    inputSource: "grpc", maxFps: 60, maxSize: 1280, bitRate: 6_000_000
  }, {
    serve: serveWithPluginUI,
    openSession: (options) => options.mode === "grpc-screenshot"
      ? startGrpcSession(options, { runtime: { ensureEndpoint: existingEndpoint } })
      : startEmuSession(options)
  });
}

const preview = await openAcceleratedPreview().catch((error) => {
  console.error("Hardware capture unavailable; using the bundled streamer:", error.message);
});
if (preview) {
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, async () => {
      await preview.stop();
      process.exit(0);
    });
  }
} else {
  process.argv = [process.execPath, bundledCli, "--host", host, "--port", portText, "--serial", serial, "--max-fps", "30"];
  await import(bundledCli);
}
