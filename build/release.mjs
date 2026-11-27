import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const pluginDir = join(dist, "plugin");
const releaseDir = join(dist, "release");

const manifest = JSON.parse(readFileSync(join(pluginDir, "plugin.json"), "utf8"));
const baseName = `${manifest.name}-v${manifest.version}`;
const tarName = `${baseName}.tar.gz`;
const zipName = `${baseName}.zip`;

rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });

const stage = mkdtempSync(join(dist, "release-stage-"));
try {
  const namedDir = join(stage, manifest.name);
  cpSync(pluginDir, namedDir, { recursive: true });

  execFileSync("tar", ["-czf", join(releaseDir, tarName), "-C", stage, manifest.name], {
    stdio: "inherit",
  });
  execFileSync("zip", ["-rq", join(releaseDir, zipName), manifest.name], {
    cwd: stage,
    stdio: "inherit",
  });

  const shaLines = [tarName, zipName].map((file) => {
    const hash = createHash("sha256").update(readFileSync(join(releaseDir, file))).digest("hex");
    return `${hash}  ${file}`;
  });
  writeFileSync(join(releaseDir, "SHA256SUMS.txt"), shaLines.join("\n") + "\n");
  console.log(`Packaged release artifacts in dist/release:\n- ${tarName}\n- ${zipName}\n- SHA256SUMS.txt`);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
