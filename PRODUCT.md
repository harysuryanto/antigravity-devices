# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mobile and cross-platform developers on macOS working inside the standalone Antigravity desktop chat application who need to inspect, boot, and interact with local iOS simulators and Android emulators directly beside an active agent conversation.

## Product Purpose

Devices (`antigravity-devices`) is an Auxiliary Pane MCP App plugin that lets users discover local iOS simulators and Android emulators, boot stopped devices or open running ones, switch between multiple live device previews in persistent tabs, and drive touch, keyboard, and Android hardware/emulator controls without leaving the Antigravity conversation window.

## Positioning

Native-feeling, zero-config local simulator and emulator streaming inside Antigravity's Auxiliary Pane over loopback (`127.0.0.1`), combining Paseo's `serve-sim` for iOS with bundled `expo-device-hub` shared-memory gRPC + zero-latency `libx264` encoding and a 60 fps `serve-emu` (`scrcpy`) fallback for Android under one unified picker and tab bar.

## Operating Context

- Launched from **+ → Plugins → Devices** (or via `open_devices`) in an Antigravity conversation's Auxiliary Pane, where width varies from compact ~300px side splits to wide ~760px+ splits.
- Used in both Light and Dark Antigravity Appearance modes and across dynamic window zoom / font-size scales alongside dense chat and code views.
- Operates on real Xcode `simctl` simulators and Android SDK AVDs/emulators where device lists routinely span 5–25 targets.

## Capabilities and Constraints

- Preserve plugin ID `antigravity-devices`, `open_devices` `aux_pane` entrypoint, and app-only `list_devices` and `open_device` tools.
- Start on the device picker with iOS simulators and Android emulators in separate groups; offer **Open** for running devices, **Connect** for starting devices, and **Start** for stopped devices.
- Preserve open device tabs across list refreshes; **All devices** returns to the picker without closing tabs; closing a tab or restarting the MCP server leaves the underlying simulator or emulator running.
- Keep both iOS and Android previews compact with primary device actions visible in a bottom dock (`Home`, `Rotate`, `Screenshot`, `Inspect` on iOS; `Back`, `Home`, `Recents`, `Power` on Android) and secondary controls grouped under **iOS tools** / **Inspector** and **Android tools**.
- Bind preview HTTP/WebSocket listeners strictly to `127.0.0.1`, enforce origin/path checks before loading iframe streams, reserve MCP stdout for JSON-RPC, and never log credentials or screen contents.

## Brand Commitments

Follow the standalone Antigravity Chat App (Antigravity 2.0) Auxiliary Pane UI language rather than Antigravity IDE: monochrome surface and text hierarchy, live MCP `hostContext` Appearance and typography synchronization, crisp `1.5px`-stroke iconography, and restrained status indicators.

## Evidence on Hand

- `scripts/preview.html`: MCP App picker, tab strip, iframe preview stage, and JSON-RPC `postMessage` bridge.
- `scripts/ios-preview.mjs`: Compact layout and live Appearance wrapper around Paseo's `serve-sim` iOS streamer.
- `patches/serve-emu-compact.patch`: Compact layout and styling patch applied to `serve-emu@0.1.0` for embedded Android streaming.
- `scripts/server.mjs`, `scripts/devices.mjs`, `scripts/android-preview.mjs`: MCP server, device discovery/booting, and loopback preview orchestration.

## Product Principles

1. **Disappear into the host pane:** Inherit Antigravity's live Appearance theme, font family, and typography scale so the plugin feels built into the chat app's Auxiliary Pane.
2. **Fast scanability at realistic list density:** Group iOS and Android clearly, surface running targets first with unmistakable status cues, and let developers filter large simulator/AVD inventories immediately.
3. **Non-destructive session control:** Switching views, refreshing lists, or closing tabs never kills a running simulator or drops open preview tabs unexpectedly.
4. **Compact stage priority:** Maximize live device canvas area in narrow side panes while keeping essential hardware keys one click away and advanced emulator tools tucked cleanly behind a single disclosure.
