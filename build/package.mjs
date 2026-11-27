import { execFileSync } from "node:child_process";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });
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
