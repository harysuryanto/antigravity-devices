# Devices for Antigravity (`antigravity-devices`)

Preview and interact with local iOS simulators and Android emulators directly beside an Antigravity conversation on macOS (Apple Silicon and Intel). Open a conversation and select **+ → Plugins → Devices** to pick a device, or open additional devices in persistent tabs via **All devices**.

The plugin also bundles an agent rule (`rules/AGENTS.md`) that tells Antigravity to automatically open the Devices side panel whenever you ask it to test, run, or inspect a mobile app (for example alongside `agent-device`).

## Prerequisites

- **macOS** (Apple Silicon `arm64` or Intel `x86_64`) with the standalone Antigravity App and `agy` CLI
- **Node.js 22+** (resolved automatically from `PATH` or common macOS paths such as Homebrew, nvm, fnm, volta, asdf, mise; override with `ANTIGRAVITY_DEVICES_NODE`)
- **iOS:** Xcode and Simulator runtimes (uses the bundled universal `serve-sim` package)
- **Android:** Android SDK Platform-Tools (`adb`), Android Emulator, and at least one AVD. Uses the bundled `serve-emu` streamer out of the box, or optionally accelerates via T3 Code’s local Expo Device Hub 0.19.1 + FFmpeg with VideoToolbox when available.

## Install from GitHub Release

Download the latest `antigravity-devices-v<version>.tar.gz` from [GitHub Releases](https://github.com/harysuryanto/antigravity-devices/releases), extract it, and install with `agy`:

```sh
tar -xzf antigravity-devices-v0.5.0.tar.gz
agy plugin install ./antigravity-devices
```

Then open **+ → Plugins → Devices** in an Antigravity conversation. After installing an update, close and reopen the Devices panel (and restart **preview** under **Customizations → Installed → Devices → MCP** if the MCP server changed).

## Develop from source

Building from source additionally requires [Bun](https://bun.sh/).

```sh
bun install --frozen-lockfile
bun run build
bun run validate
bun run install:local
```

To create release archives (`dist/release/antigravity-devices-v<version>.tar.gz`, `.zip`, and `SHA256SUMS.txt`):

```sh
bun run package:release
```

## Source layout

- `bin/launch-server.sh` resolves Node.js 22+ portably for GUI-launched MCP sessions.
- `rules/AGENTS.md` is the bundled plugin rule that opens the Devices panel automatically during mobile tasks.
- `scripts/preview.html` contains the device picker and tabs.
- `scripts/server.mjs` exposes the Antigravity MCP App (`open_devices`, `list_devices`, `open_device`).
- `scripts/devices.mjs` discovers devices and launches previews.
- `scripts/ios-preview.mjs` wraps the `serve-sim` iOS preview in compact Antigravity chrome.
- `scripts/android-preview.mjs` selects the accelerated Android path or the bundled fallback.
- `patches/serve-emu-compact.patch` contains the Android preview layout changes against the pinned upstream package. The build applies it and rebuilds that package’s UI.

## License

MIT — see [LICENSE](LICENSE). Bundles `serve-sim` and `serve-emu` (both Apache-2.0).
