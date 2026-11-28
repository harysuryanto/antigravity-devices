# Contributing to Devices for Antigravity

Thank you for your interest in contributing to **Devices** (`antigravity-devices`)! This guide covers local setup, workflow, and verification expectations.

## Prerequisites

- **macOS** (Apple Silicon or Intel)
- **Antigravity desktop app** with the `agy` CLI enabled
- **Node.js 22+** and **[Bun](https://bun.sh/)**
- **Xcode** with at least one iOS Simulator runtime *(for iOS testing)*
- **Android SDK** (`adb`, `emulator`, and at least one AVD) *(for Android testing)*
- **FFmpeg** (`brew install ffmpeg`) *(optional, to test the accelerated Android `mmap` + `libx264` streaming path)*

## Local Development Setup

```sh
git clone https://github.com/harysuryanto/antigravity-devices.git
cd antigravity-devices
bun install --frozen-lockfile
```

### Build, Validate, and Test Locally

```sh
bun run build          # Stages runtime deps, patches serve-emu UI, builds dist/plugin
bun run validate       # Runs agy plugin validate --strict dist/plugin
bun run install:local  # Builds, validates, and installs locally into Antigravity
```

After running `bun run install:local`:
- Reopen **+ → Plugins → Devices** in an Antigravity conversation.
- If you changed the MCP server (`scripts/server.mjs` or `bin/launch-server.sh`), restart **preview** under **Customizations → Installed → Devices → MCP**.

> [!NOTE]
> Make edits in the source files at the repository root. Treat `dist/plugin`, `dist/release`, and `~/.gemini/config/plugins/antigravity-devices` as generated outputs.

## Source Map

| Path | Responsibility |
| --- | --- |
| `plugin.json`, `mcp_config.json` | Plugin manifest and portable MCP server configuration |
| `bin/launch-server.sh` | Portable Node.js 22+ launcher for macOS GUI sessions |
| `rules/AGENTS.md` | Bundled rule instructing agents to auto-open Devices during mobile tasks |
| `scripts/server.mjs` | Stdio MCP App server (`open_devices`, `list_devices`, `open_device`) |
| `scripts/preview.html` | Unified device picker, persistent tabs, and Antigravity theme bridge |
| `scripts/devices.mjs` | Simulator/AVD discovery, booting, port allocation, and worker reuse |
| `scripts/ios-preview.mjs` | Compact Antigravity chrome and theme wrapper around `serve-sim` |
| `scripts/android-preview.mjs` | Dual-engine Android streaming (`mmap` + `libx264` or `serve-emu` fallback) |
| `patches/serve-emu-compact.patch` | Compact Android UI patch applied to pinned `serve-emu@0.1.0` |
| `build/package.mjs`, `build/release.mjs` | Staging, patching, Vite UI build, and release archive packaging |

See [AGENTS.md](AGENTS.md) for detailed behavior invariants to preserve.

## Guidelines

- **Keep previews local:** HTTP and WebSocket listeners must bind strictly to `127.0.0.1`. Keep tokens and screen contents out of logs, and reserve MCP `stdout` for JSON-RPC (send diagnostics to `stderr`).
- **Preserve multi-device tabs:** Refreshing the picker must preserve open tabs, and closing a tab or restarting the MCP server must leave underlying simulators/emulators running.
- **Updating `serve-emu` UI:** Changes to the embedded Android UI should be captured in `patches/serve-emu-compact.patch` against the pinned `serve-emu` version in `package.json`.
- **Keep dependencies and build artifacts out of Git:** Never commit `node_modules/` or `dist/`.

## Verification Before Opening a PR

1. Run `bun run build` and `bun run validate` (must pass `agy plugin validate --strict` with 0 errors and 0 warnings).
2. For picker, tab, or lifecycle changes, smoke-test in Antigravity: refresh the list, open a running device on each affected platform, test tap/click input, switch tabs, and verify closing a tab leaves the device running.
3. For Android streaming changes, test both the accelerated (`ffmpeg` present) and fallback (`serve-emu` / `scrcpy`) paths.
4. In your PR description, clearly state which platforms and streaming paths you verified, and include before/after screenshots for UI changes.
