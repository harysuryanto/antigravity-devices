import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
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
const acceleratedRoot = fileURLToPath(new URL("../runtime-tools/accelerated-serve-emu/dist", import.meta.url));
const settingsPath = join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "antigravity-devices", "android-settings.json");

function readSavedSettings() {
  const defaults = { maxDimension: 800, h264Bitrate: 4_000_000 };
  try {
    const raw = JSON.parse(readFileSync(settingsPath, "utf8"));
    const maxDimension = Number.isInteger(raw?.maxDimension) && raw.maxDimension >= 0 && raw.maxDimension <= 4096
      ? raw.maxDimension
      : defaults.maxDimension;
    const h264Bitrate = Number.isInteger(raw?.h264Bitrate) && raw.h264Bitrate >= 100_000 && raw.h264Bitrate <= 50_000_000
      ? raw.h264Bitrate
      : defaults.h264Bitrate;
    return { maxDimension, h264Bitrate };
  } catch {
    return defaults;
  }
}

function saveSettings(settings) {
  try {
    mkdirSync(dirname(settingsPath), { recursive: true });
    writeFileSync(settingsPath, JSON.stringify({
      maxDimension: settings.maxDimension,
      h264Bitrate: settings.h264Bitrate
    }, null, 2) + "\n");
  } catch {
    // Ignore cache write errors; in-memory session settings still apply.
  }
}

const initialSettings = readSavedSettings();

function serveWithPluginUI(options) {
  const assets = new Set(readdirSync(join(uiRoot, "assets")));
  return Bun.serve({
    ...options,
    async fetch(request, server) {
      const url = new URL(request.url);
      const asset = url.pathname.slice("/assets/".length);
      const page = url.pathname === "/" || url.pathname === "/index.html";
      const localAsset = url.pathname.startsWith("/assets/") && assets.has(asset);
      if (request.method === "PATCH" && url.pathname === "/api/stream-settings") {
        const response = await options.fetch(request, server);
        if (response?.ok) {
          void response.clone().json().then((data) => {
            if (typeof data?.maxDimension === "number" && typeof data?.h264Bitrate === "number") {
              saveSettings(data);
            }
          }).catch(() => {});
        }
        return response;
      }
      if (!["GET", "HEAD"].includes(request.method) || !(page || localAsset)) {
        return options.fetch(request, server);
      }

      // Let the backend apply its own HTTP guards before replacing a static file.
      url.pathname = "/index.html";
      const response = await options.fetch(new Request(url, {
        headers: request.headers, method: request.method
      }), server);
      if (!response || (!response.ok && response.status !== 404)) return response;
      // The vendored gRPC streamer omits its HTML shell and returns 404 here.
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
  if (process.platform !== "darwin" || !existsSync(join(acceleratedRoot, "server.js"))) return;
  if (!process.env.SERVE_EMU_FFMPEG) {
    const ffmpeg = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/opt/local/bin/ffmpeg"]
      .find((candidate) => existsSync(candidate));
    if (ffmpeg) process.env.SERVE_EMU_FFMPEG = ffmpeg;
  }
  const { startServer } = await import(join(acceleratedRoot, "server.js"));
  const { findEmulatorGrpcEndpoint } = await import(join(acceleratedRoot, "emulator-grpc.js"));
  const { startGrpcSession } = await import(join(acceleratedRoot, "grpc-session.js"));
  const { startEmuSession } = await import(join(acceleratedRoot, "stream-session.js"));

  function existingEndpoint(target) {
    // Reuse an existing authenticated endpoint. Never enable an emulator endpoint.
    const endpoint = findEmulatorGrpcEndpoint(target);
    if (!endpoint?.port || !endpoint.token) throw new Error("No authenticated emulator gRPC endpoint.");
    return endpoint;
  }

  existingEndpoint(serial);
  return startServer({
    host, port, serial,
    streamMode: "grpc-screenshot", grpcImageMode: "mmap", encoder: "software",
    inputSource: "grpc", maxFps: 60, maxSize: initialSettings.maxDimension, bitRate: initialSettings.h264Bitrate
  }, {
    serve: serveWithPluginUI,
    openSession: (options) => options.mode === "grpc-screenshot"
      ? startGrpcSession(options, { runtime: { ensureEndpoint: existingEndpoint } })
      : startEmuSession(options)
  });
}

const preview = await openAcceleratedPreview().catch((error) => {
  console.error("Accelerated gRPC capture unavailable; using the bundled scrcpy streamer:", error.message);
});
if (preview) {
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, async () => {
      await preview.stop();
      process.exit(0);
    });
  }
} else {
  process.argv = [
    process.execPath, bundledCli,
    "--host", host, "--port", portText, "--serial", serial,
    "--max-fps", "60", "--max-size", String(initialSettings.maxDimension), "--bit-rate", String(initialSettings.h264Bitrate)
  ];
  await import(bundledCli);
}
