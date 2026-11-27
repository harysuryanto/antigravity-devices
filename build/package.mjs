import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });
const tuneFile = (filePath, target, replacement) => {
  const source = readFileSync(filePath, "utf8");
  if (!source.includes(target)) {
    throw new Error(`Expected target snippet not found in ${filePath}`);
  }
  writeFileSync(filePath, source.replaceAll(target, replacement));
};

mkdirSync(dist, { recursive: true });
const stage = mkdtempSync(join(dist, "package-"));

try {
  const runtime = join(stage, "runtime-tools");
  mkdirSync(runtime);
  for (const file of ["package.json", "bun.lock"]) cpSync(join(root, file), join(runtime, file));
  run("bun", ["install", "--production", "--frozen-lockfile", "--ignore-scripts"], runtime);
  const serveEmu = join(runtime, "node_modules/serve-emu");
  run("patch", ["-p1", "-i", join(root, "patches/serve-emu-compact.patch")], serveEmu);
  run(process.execPath, [
    join(root, "node_modules/vite/bin/vite.js"), "build",
    join(serveEmu, "src/ui"), "--config", join(root, "build/vite.config.mjs")
  ], root);

  const accelerated = join(runtime, "accelerated-serve-emu");
  cpSync(join(root, "node_modules/expo-device-hub/vendor/serve-emu"), accelerated, { recursive: true });

  // Tune staged gRPC streamer for strict <=60 fps efficiency and minimal touch-to-display latency:
  // 1. Only chase frames before initial startup output; afterward H264OutputParser flushes trailing
  //    access units directly without injecting duplicate frames above 60 fps.
  tuneFile(
    join(accelerated, "dist/grpc-session.js"),
    "const ACCESS_UNIT_BOUNDARY_IDLE_INTERVALS = 1.5;\nconst ACCESS_UNIT_BOUNDARY_STARTUP_DELAY_MS = 100;\nconst ACCESS_UNIT_BOUNDARY_MAX_DELAY_MS = 250;",
    "const ACCESS_UNIT_BOUNDARY_IDLE_INTERVALS = 1.2;\nconst ACCESS_UNIT_BOUNDARY_STARTUP_DELAY_MS = 16;\nconst ACCESS_UNIT_BOUNDARY_MAX_DELAY_MS = 32;"
  );
  tuneFile(
    join(accelerated, "dist/grpc-session.js"),
    "needsEncoderFollowUp: (repeat, encoderHasOutput)=>!repeat || !encoderHasOutput",
    "needsEncoderFollowUp: (_repeat, encoderHasOutput)=>!encoderHasOutput"
  );
  // 2. Keep MMAP pacing strictly capped at maxFps (60) without dropping 60Hz frames arriving slightly early due to OS jitter.
  tuneFile(
    join(accelerated, "dist/grpc-session.js"),
    `if (this.#nextEmitAtMs !== null && now < this.#nextEmitAtMs) {`,
    `if (this.#nextEmitAtMs !== null && now + 1.5 < this.#nextEmitAtMs) {`
  );
  tuneFile(
    join(accelerated, "dist/grpc-session.js"),
    `        this.#nextEmitAtMs = now + this.#frameIntervalMs;`,
    `        this.#nextEmitAtMs = Math.max(now, this.#nextEmitAtMs ?? now) + this.#frameIntervalMs;`
  );
  // 3. Disable rawvideo input probing/buffering in ffmpeg and flush completed Annex-B frames in 1ms
  //    inside H264OutputParser instead of waiting for the next frame's AUD.
  tuneFile(
    join(accelerated, "dist/h264-encoder.js"),
    '    return [\n        "-f",\n        "rawvideo",',
    '    return [\n        "-probesize",\n        "32",\n        "-analyzeduration",\n        "0",\n        "-fflags",\n        "nobuffer",\n        "-flags",\n        "low_delay",\n        "-f",\n        "rawvideo",'
  );
  tuneFile(
    join(accelerated, "dist/h264-encoder.js"),
    "    #lastPts = 0n;\n    #lastConfig = null;",
    "    #lastPts = 0n;\n    #lastConfig = null;\n    #flushTimer = null;"
  );
  tuneFile(
    join(accelerated, "dist/h264-encoder.js"),
    "        this.#emitCompleteAccessUnits();\n    }",
    `        if (this.#flushTimer) {
            clearTimeout(this.#flushTimer);
            this.#flushTimer = null;
        }
        this.#emitCompleteAccessUnits();
        if (this.#nals[0]?.type === NAL_AUD && this.#nals.some((nal)=>nal.type === 1 || nal.type === NAL_IDR)) {
            this.#flushTimer = setTimeout(()=>this.#flushTrailingAccessUnit(), 1);
            this.#flushTimer.unref?.();
        }
    }
    clearFlushTimer() {
        if (this.#flushTimer) {
            clearTimeout(this.#flushTimer);
            this.#flushTimer = null;
        }
    }
    #flushTrailingAccessUnit() {
        this.#flushTimer = null;
        if (this.#nals[0]?.type !== NAL_AUD || !this.#nals.some((nal)=>nal.type === 1 || nal.type === NAL_IDR)) {
            return;
        }
        this.#emitAccessUnit(this.#nals.slice(1), this.#pending.length);
        this.#pending = Buffer.alloc(0);
        this.#nals = [];
        this.#scanFrom = 0;
    }`
  );
  tuneFile(
    join(accelerated, "dist/h264-encoder.js"),
    "    /** Idempotently stop ffmpeg, escalating to SIGKILL without hanging shutdown. */ close() {\n        if (this.#closeTask) return this.#closeTask;\n        this.#closed = true;",
    "    /** Idempotently stop ffmpeg, escalating to SIGKILL without hanging shutdown. */ close() {\n        if (this.#closeTask) return this.#closeTask;\n        this.#closed = true;\n        this.#parser.clearFlushTimer();"
  );
  // 4. Enable TCP_NODELAY on loopback scrcpy control sockets.
  tuneFile(
    join(accelerated, "dist/scrcpy.js"),
    '        const s = createConnection({\n            host: "127.0.0.1",\n            port\n        });',
    '        const s = createConnection({\n            host: "127.0.0.1",\n            port\n        });\n        s.setNoDelay(true);'
  );

  cpSync(join(root, "bin"), join(stage, "bin"), { recursive: true });
  chmodSync(join(stage, "bin/launch-server.sh"), 0o755);
  cpSync(join(root, "scripts"), join(stage, "scripts"), { recursive: true });
  cpSync(join(root, "rules"), join(stage, "rules"), { recursive: true });
  cpSync(join(root, "assets"), join(stage, "assets"), { recursive: true });
  cpSync(join(root, "docs", "images"), join(stage, "docs", "images"), { recursive: true });
  for (const file of ["plugin.json", "mcp_config.json", "README.md", "LICENSE"]) {
    cpSync(join(root, file), join(stage, file));
  }

  const output = join(dist, "plugin");
  rmSync(output, { recursive: true, force: true });
  renameSync(stage, output);
  console.log("Built dist/plugin");
} finally {
  rmSync(stage, { recursive: true, force: true });
}
