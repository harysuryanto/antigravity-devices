## Summary

<!-- Briefly describe what this PR changes and why. -->

## Related Issue

<!-- Link any related issue, e.g. Closes #12 -->

## Verification

- [ ] `bun install --frozen-lockfile`
- [ ] `bun run build`
- [ ] `bun run validate` (`agy plugin validate --strict dist/plugin` passes with 0 errors and 0 warnings)
- [ ] Tested locally in Antigravity (`bun run install:local`)

### Platforms & Paths Verified

<!-- Check the ones you tested on a real macOS environment -->

- [ ] iOS Simulator (`serve-sim`)
- [ ] Android Emulator — accelerated path (`mmap` + `libx264` with `ffmpeg`)
- [ ] Android Emulator — fallback path (`serve-emu` / `scrcpy`)
- [ ] Device picker, tabs, and theme sync (Light / Dark)
- [ ] Documentation-only change

## Screenshots / Recordings (if UI changed)

<!-- Attach before/after screenshots or a short recording for UI/layout changes. -->
