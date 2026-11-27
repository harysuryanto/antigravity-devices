# Changelog

All notable changes to `antigravity-devices` are documented here.

## [0.5.0] - 2026-11-27

### Added
- Antigravity Auxiliary Pane MCP App (`open_devices`) for discovering, booting, and streaming local iOS simulators and Android emulators on macOS (Apple Silicon & Intel).
- Multi-device tab bar with persistent tabs across list refreshes and non-destructive tab closing.
- Compact iOS (`serve-sim`) and Android (`serve-emu` fallback + optional accelerated T3 Hub gRPC path) preview UIs unified with Antigravity Light/Dark Appearance and resolution/FPS status bar.
- Bundled agent rule (`rules/AGENTS.md`) to automatically open the Devices panel during mobile app testing.
- Portable Node.js 22+ launcher (`bin/launch-server.sh`), plugin icon (`assets/logo.svg`), Marketplace metadata, and GitHub Release packaging workflow.
