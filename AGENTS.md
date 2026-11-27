# AGENTS.md

## Scope

Devices (`antigravity-devices`) is a local MCP App for the standalone Antigravity desktop app on macOS. Open it from **+ → Plugins → Devices** in a conversation. The plugin ID is `antigravity-devices` and the primary entry point tool is `open_devices`.

Make changes in this checkout. Treat `dist/plugin`, the installed copy at `~/.gemini/config/plugins/antigravity-devices`, and other apps' managed files as build outputs or reference material. Keep generated bundles, dependencies, and machine-specific configuration out of version control.

## Source map

| File | Responsibility |
| --- | --- |
| `plugin.json`, `mcp_config.json` | Plugin manifest and portable MCP server configuration. |
| `bin/launch-server.sh` | Portable Node.js 22+ launcher invoked by `mcp_config.json` across macOS GUI environments. |
| `rules/AGENTS.md` | Bundled plugin rule packaged into `dist/plugin/rules/AGENTS.md` so agents automatically open the Devices panel during mobile testing. |
| `scripts/server.mjs` | MCP over stdio, the Antigravity side-panel entry point, and the panel's resource and tool declarations. `open_devices` loads the picker. `list_devices` and `open_device` are panel-only tools. |
| `scripts/preview.html` | Device picker, tabs, active preview iframe, and the MCP App messaging bridge. |
| `scripts/devices.mjs` | Device discovery through Xcode and the Android SDK, booting when requested, preview port allocation, worker reuse, and cleanup. iOS previews use the bundled `serve-sim` package. |
| `scripts/ios-preview.mjs` | Compact Antigravity chrome and live theme wrapper around the bundled `serve-sim` iOS preview. |
| `scripts/android-preview.mjs` | Accelerated Android streaming and input through the local T3 Code Expo Device Hub when available, with the bundled `serve-emu` streamer as a fallback. |
| `patches/serve-emu-compact.patch` | Compact Android controls against the pinned `serve-emu` release. Update this patch against that release when changing the embedded Android UI. |
| `build/package.mjs`, `build/release.mjs`, `build/vite.config.mjs` | Stage locked runtime dependencies, apply the Android patch, rebuild its UI, package the portable plugin (`dist/plugin`), and build release archives (`dist/release`). |

## Behavior to preserve

- Start on the device picker with iOS and Android in separate groups. Offer **Open** for running devices and **Start** for stopped devices. Refreshing the list should preserve open tabs.
- Keep multiple devices available as tabs with a single active preview. **All devices** returns to the picker without closing tabs. Closing a tab or restarting the MCP server should leave the underlying simulator or emulator running.
- Keep the Android preview compact. Leave hardware controls visible and group additional controls under **Android tools**. Keep both Android streaming paths on the same packaged UI.
- Keep preview HTTP and WebSocket listeners on `127.0.0.1`. Update the MCP iframe allowlist with any preview port changes. Preserve device ID checks, same-device preview reuse, and the streaming backend's HTTP and WebSocket guards. The accelerated Android path reuses an existing authenticated emulator gRPC endpoint.
- Reserve MCP stdout for JSON-RPC and send diagnostics to stderr. Keep authentication tokens and screen contents out of logs.

## Build and verify

See [README.md](README.md) for prerequisites. Run the following from the repository root after changes to the runtime, UI, packaging, or manifest.

```sh
bun install --frozen-lockfile
bun run build
bun run validate
```

`bun run validate` checks `dist/plugin` using `agy plugin validate --strict`. For a desktop smoke test, `bun run install:local` rebuilds, validates, and installs the package. Reopen **Devices** after installation. For MCP server changes, restart **preview** under **Customizations → Installed → Devices → MCP**.

- For changes to the picker or device lifecycle, open Devices from the Antigravity conversation menu, refresh the list, open a running device on each affected platform, and try a tap or click inside the preview. For tab changes, switch between devices and confirm that closing a tab leaves its device running. If boot behavior changed, also test **Start** with a stopped test device.
- For Android streaming changes, check the accelerated and fallback paths. For performance comparisons, repeat the same moving workload on the same emulator and distinguish stream FPS from touch-to-display latency.
- Report which platforms and paths were verified. For documentation-only changes, check links and commands against the source.
