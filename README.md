# Devices for Antigravity

A local plugin for the standalone Antigravity App. Open a conversation and select **+ → Plugins → Devices** to pick a simulator or emulator. Open additional devices via **All devices**.

## Develop and install

Prerequisites are macOS, Node.js 22+, Bun, and the Antigravity App with the `agy` CLI. iOS previews use Xcode and the `serve-sim` copy installed by Paseo Devices. Android needs Android SDK Platform-Tools, the emulator, and at least one AVD. The optional accelerated Android path uses T3 Code’s local Expo Device Hub 0.19.1, FFmpeg with VideoToolbox, and an already authenticated emulator gRPC endpoint. The bundled streamer works without that setup.

```sh
bun install --frozen-lockfile
bun run build
bun run validate
bun run install:local
```

The build produces `dist/plugin`. Installation copies that package into `~/.gemini/config/plugins/ios-simulator` and records the current machine’s Node executable for the desktop app. After installing an update, close and reopen the Devices panel. For server changes, restart **preview** under **Customizations → Installed → Devices → MCP**.

## Source

- `scripts/preview.html` contains the device picker and tabs.
- `scripts/server.mjs` exposes the Antigravity MCP App.
- `scripts/devices.mjs` discovers devices and launches previews.
- `scripts/ios-preview.mjs` wraps the `serve-sim` iOS preview in compact Antigravity chrome.
- `scripts/android-preview.mjs` selects the accelerated Android path or the bundled fallback.
- `patches/serve-emu-compact.patch` contains the Android preview layout changes against the pinned upstream package. The build applies it and rebuilds that package’s UI.
