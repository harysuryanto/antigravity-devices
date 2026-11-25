import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: "inherit" });
mkdirSync(dist, { recursive: true });
const stage = mkdtempSync(join(dist, "package-"));

try {
  const runtime = join(stage, "android-tools");
  mkdirSync(runtime);
  for (const file of ["package.json", "bun.lock"]) cpSync(join(root, file), join(runtime, file));
  run("bun", ["install", "--production", "--frozen-lockfile", "--ignore-scripts"], runtime);
  const serveEmu = join(runtime, "node_modules/serve-emu");
  run("patch", ["-p1", "-i", join(root, "patches/serve-emu-compact.patch")], serveEmu);
  run(process.execPath, [
    join(root, "node_modules/vite/bin/vite.js"), "build",
    join(serveEmu, "src/ui"), "--config", join(root, "build/vite.config.mjs")
  ], root);

  cpSync(join(root, "scripts"), join(stage, "scripts"), { recursive: true });
  cpSync(join(root, "plugin.json"), join(stage, "plugin.json"));
  const mcp = JSON.parse(readFileSync(join(root, "mcp_config.json"), "utf8"));
  mcp.mcpServers.preview.command = process.execPath;
  writeFileSync(join(stage, "mcp_config.json"), JSON.stringify(mcp, null, 2) + "\n");

  const output = join(dist, "plugin");
  rmSync(output, { recursive: true, force: true });
  renameSync(stage, output);
  console.log("Built dist/plugin");
} finally {
  rmSync(stage, { recursive: true, force: true });
}
