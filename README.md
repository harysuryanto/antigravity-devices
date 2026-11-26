# Devices for Antigravity (`antigravity-devices`)

A local plugin for the standalone Antigravity App on macOS. Open a conversation and select **+ → Plugins → Devices** to pick an iOS simulator or Android emulator. Open additional devices via **All devices**.

The plugin also bundles an agent rule (`rules/AGENTS.md`) that tells Antigravity to automatically open the Devices side panel whenever you ask it to test, run, or inspect a mobile app (for example alongside `agent-device`).

## Develop and install

Prerequisites are macOS, Node.js 22+, Bun, and the Antigravity App with the `agy` CLI. iOS previews use Xcode and the bundled `serve-sim` package. Android needs Android SDK Platform-Tools, the emulator, and at least one AVD. The optional accelerated Android path uses T3 Code’s local Expo Device Hub 0.19.1, FFmpeg with VideoToolbox, and an already authenticated emulator gRPC endpoint. The bundled streamer works without that setup.

```sh
bun install --frozen-lockfile
bun run build
bun run validate
bun run install:local
```

The build produces `dist/plugin`. Installation copies that package into `~/.gemini/config/plugins/antigravity-devices` and records the current machine’s Node executable for the desktop app. After installing an update, close and reopen the Devices panel. For server changes, restart **preview** under **Customizations → Installed → Devices → MCP**.

## Source

- `rules/AGENTS.md` is the bundled plugin rule that opens the Devices panel automatically during mobile tasks.
- `scripts/preview.html` contains the device picker and tabs.
- `scripts/server.mjs` exposes the Antigravity MCP App (`open_devices`, `list_devices`, `open_device`).
- `scripts/devices.mjs` discovers devices and launches previews.
- `scripts/android-preview.mjs` selects the accelerated Android path or the bundled fallback.
- `patches/serve-emu-compact.patch` contains the Android preview layout changes against the pinned upstream package. The build applies it and rebuilds that package’s UI.
