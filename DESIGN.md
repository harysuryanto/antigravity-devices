---
name: Devices for Antigravity
description: Antigravity Chat App Auxiliary Pane UI system for local iOS simulator and Android emulator discovery and live streaming.
colors:
  primary-focus: "#007acc"
  primary-focus-dark: "#4da3ff"
  surface-bg-light: "#f7f7f8"
  surface-card-light: "#ffffff"
  surface-muted-light: "#eff0f1"
  surface-bg-dark: "#131313"
  surface-card-dark: "#1a1a1c"
  surface-muted-dark: "#202023"
  ink-primary-light: "#1d1f21"
  ink-secondary-light: "#3d4348"
  ink-muted-light: "#555e66"
  ink-primary-dark: "#fafafa"
  ink-secondary-dark: "#d4d4d8"
  ink-muted-dark: "#9e9ea6"
  status-running-light: "#4d853b"
  status-running-dark: "#7aae66"
  status-starting-light: "#9c7b16"
  status-starting-dark: "#d4b844"
  status-error-light: "#c63737"
  status-error-dark: "#f06868"
typography:
  title:
    fontFamily: "\"Google Sans Flex\", \"Google Sans\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "\"Google Sans Flex\", \"Google Sans\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "\"Google Sans Flex\", \"Google Sans\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
  code:
    fontFamily: "\"Google Sans Code\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  device: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-open:
    backgroundColor: "color-mix(in srgb, currentColor 6.5%, transparent)"
    textColor: "{colors.ink-primary-light}"
    rounded: "{rounded.md}"
    padding: "0 11px"
    height: "1.75rem"
  button-start:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary-light}"
    rounded: "{rounded.md}"
    padding: "0 11px"
    height: "1.75rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted-light}"
    rounded: "{rounded.md}"
    padding: "0 8px"
    height: "1.75rem"
  card-group:
    backgroundColor: "{colors.surface-card-light}"
    rounded: "{rounded.lg}"
    padding: "0"
---

# Design System: Devices for Antigravity

## Overview

**Creative North Star: "The Native Auxiliary Pane"**

Devices sits directly inside the standalone Antigravity Chat App's Auxiliary Pane beside an active agent conversation. Rather than asserting an external brand or IDE workbench chrome, its visual language disappears into Antigravity's native monochrome toolkit: neutral paper and charcoal surfaces, foreground-driven tonal fills, hairline dividers, and dynamic inheritance of live MCP `hostContext` Appearance and typography variables.

Every screen prioritizes Operate-mode scanability and live device stage area. Color stays silent until state demands it—a 6px pulsing green status dot for booted devices, warm amber while booting or reconnecting, and restrained crimson for actionable boot errors.

**Key Characteristics:**
- Live synchronization with Antigravity `hostContext.theme` and `hostContext.styles.variables` across the picker shell, the wrapped iOS `serve-sim` preview, and the embedded Android `serve-emu` streamer.
- Monochrome action hierarchy (`Open` uses tonal fill; `Start` uses hairline outline; `--ag-primary` is reserved strictly for focus rings and selection).
- Elastic `rem` + `--font-text-*-size` sizing so window zoom and host font-size preferences scale controls without clipping.
- Unified `1.5px`-stroke geometric SVG iconography.

## Colors

A monochrome neutral surface ramp paired with live MCP host overrides and three restrained semantic status hues.

### Primary
- **Focus Accent Blue** (`#007acc` light / `#4da3ff` dark, overridden by `--color-ring-primary`): Reserved exclusively for `:focus-visible` rings, active input borders, and text selection (`28%` mix). Never used as a resting button text or fill color.

### Neutral
- **Aux Pane Ground** (`#f7f7f8` light / `#131313` dark, overridden by `--color-background-primary`): Base canvas for the picker scroll container, sticky headers, underline tab bar, and preview stage.
- **Elevated Card Surface** (`#ffffff` light / `#1a1a1c` dark, overridden by `--color-background-secondary`): Grouped device list containers, focused search input, and the floating **Android tools** popover.
- **Primary Ink** (`#1d1f21` light / `#fafafa` dark, overridden by `--color-text-primary`): Device names, active tab labels, and primary control labels.
- **Secondary Ink** (`#3d4348` light / `#d4d4d8` dark, overridden by `--color-text-secondary`): Platform section titles, stopped-device action labels, and hardware dock buttons.
- **Muted Metadata Ink** (`#555e66` light / `#9e9ea6` dark, overridden by `--color-text-tertiary`): OS runtime details, counts, search placeholders, and stream telemetry—maintaining >=4.5:1 contrast on both themes.
- **Tonal Fills & Hairlines** (`color-mix` from Primary Ink): Hover (`5%` light / `6.5%` dark), press (`9%` / `11%`), filled subtle controls (`6.5%` / `8.5%`), search fields (`4.8%` / `7%`), and row hairlines (`8%`).

### Secondary
- **Running Moss** (`#4d853b` light / `#7aae66` dark): 6px live status dots on running devices and open device tabs.
- **Starting Ochre** (`#9c7b16` light / `#d4b844` dark): Booting/connecting status indicators.
- **Alert Crimson** (`#c63737` light / `#f06868` dark): Inline boot/discovery error alerts (`1px` tinted border + `8%` card tint).

**The Monochrome Controls Rule.** Interactive buttons, tabs, and device tiles never use brand blue or status green for their resting fills or text; chromatic color appears only on 6px status dots, error alerts, and focus-visible rings.

## Typography

**Body & UI Font:** `Google Sans Flex`, `Google Sans` (falling back to `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`, overridden by `--font-sans`)
**Label / Mono Font:** `Google Sans Code` (falling back to `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`, overridden by `--font-mono`)

**Character:** Crisp, neutral, and compact—engineered to sit naturally beside Antigravity's chat stream and artifact panes while adapting to dynamic host font-size tokens.

### Hierarchy
- **Title** (`600`, `var(--font-text-md-size, 0.875rem)`, `1.3` line-height, `-0.01em` tracking): Pane heading (`Devices`).
- **Body** (`400–500`, `var(--font-text-sm-size, 0.8125rem)`, `1.35–1.45` line-height): Device names, Aux Pane tab labels, search input, and accordion headings.
- **Label** (`500–600`, `var(--font-text-xs-size, 0.75rem)`, `1.35` line-height): Platform group headers, row metadata, telemetry readouts, and action buttons.
- **Code / Shortcut** (`400`, `var(--font-text-xs-size, 0.6875rem)`, `1.3–1.4` line-height): Keyboard shortcut hint (`/`), ADB serials, foreground package IDs, and logcat output.

**The Elastic Control Rule.** Typography tokens resolve through MCP `--font-text-{xs,sm,md}-size` variables with `rem` fallbacks, and every interactive control uses `min-height` in `rem` rather than fixed pixel heights so larger font scales never clip labels.

**The Tabular Numerals Rule.** Counts (`1 running · 3`), FPS/latency telemetry, dimensions, and coordinates always set `font-variant-numeric: tabular-nums`.

## Layout

- **Picker Column:** Fluid width centered up to `44rem` (`704px`) with `1rem` horizontal padding (`0.75rem` below `320px` pane widths where device glyph tiles collapse automatically).
- **4px Rhythm:** Tight intra-row spacing (`2px` between device name and metadata, `6px` icon gaps) paired with clear inter-group separation (`20px` above platform headers vs. `7px` below).
- **Compact Preview Chrome (iOS & Android):** Shared `2.25rem` top utility bar (live status dot + device telemetry on the left, **Inspector** / **iOS tools** or **Android tools** on the right), centered live device stage, floating card popovers (`aside.right-3` on iOS, `.android-tools-content` on Android) with single-container flush accordions, and a `1px`-bordered `2.25rem` bottom action/hardware dock.

## Elevation & Depth

Surfaces are **flat and tonal at rest**, separated by `1px` hairlines (`--ag-card-border` and `--ag-line`) rather than drop shadows. Directional shadows appear only when an element genuinely floats over another surface or frames live media.

### Shadow Vocabulary
- **Floating Popover** (`0 10px 28px rgba(0, 0, 0, 0.14)` light / `0 14px 36px rgba(0, 0, 0, 0.5)` dark): Applied to `.android-tools-content` when open above the live stream canvas.
- **Active Stream Frame** (`0 8px 24px rgba(0, 0, 0, 0.12)` light / `0 12px 32px rgba(0, 0, 0, 0.42)` dark): Applied to `.compact-stage .device` once video dimensions are active.
- **Segmented Active Pill** (`0 1px 2px rgba(0, 0, 0, 0.1)`): Lifts the active choice inside `.segmented-row` and `.font-scale-row`.

**The Single-Container Accordion Rule.** Inside floating popovers such as **Android tools**, collapsible tool sections share one bordered flush group divided by `1px` hairlines—never separate nested cards.

## Shapes

- **Micro (`4px`):** Tab badges, keyboard shortcut chips, and inline close buttons.
- **Control (`6px`):** Action buttons (`Open`, `Start`, `Refresh`, `Android tools`), hardware dock buttons, and `28×28` monochrome device glyph tiles.
- **Surface (`8px`):** Grouped device list cards, search field, empty/alert containers, segmented tracks, and the **Android tools** popover.
- **Device Viewport (`16px`):** Rounded bezel framing the live Android `<canvas>`.

## Components

### Buttons
- **Shape:** Gently rounded (`6px` radius), `min-height: 1.75rem`, `140ms cubic-bezier(0.22, 1, 0.36, 1)` transitions.
- **Primary Row Action (`Open` / `Connect`):** Tonal fill (`--ag-fill`), primary ink (`--ag-fg`), deepens to `--ag-press` on hover/active.
- **Secondary Row Action (`Start`):** Transparent ground, `1px solid var(--ag-card-border)`, secondary ink (`--ag-fg-2`), shifts to `--ag-hover` and primary ink on hover.
- **Ghost Utility (`Refresh`, `Android tools`, Hardware Dock):** Transparent ground, muted/secondary ink, `14px` `1.5px`-stroke SVG icon + label, `--ag-hover` on hover.

### Navigation (Underline Aux Pane Tabs)
- Sticky top strip (`min-height: 2.25rem`, `1px solid var(--ag-line)` bottom rule) housing **All devices** (with open-tab count pill) on the left and scrollable open device tabs on the right.
- Active tab renders in `--ag-fg` with a `2px` bottom bar (`border-radius: 2px 2px 0 0` in `--ag-fg`); inactive tabs sit in `--ag-fg-muted` with a `6px` green running dot and a `1.375rem` hover close button.

### Inputs / Search Field
- Recessed tonal field (`--ag-field`, `8px` radius, `min-height: 2rem`) with search magnifier SVG, `/` shortcut chip, and clear button.
- On `:focus-within`, shifts to `--ag-card` with a `55%` `--ag-primary` border and `2px` `14%` `--ag-primary` halo.

### Cards / Grouped Device Rows
- `8px` radius container (`--ag-card`, `1px solid var(--ag-card-border)`) with `1px solid var(--ag-line)` row dividers, `28×28` monochrome platform glyph, title + `Tabbed` pill, status dot + OS runtime metadata, and right-aligned action button.

## Do's and Don'ts

### Do:
- **Do** read MCP `hostContext.theme` and `hostContext.styles.variables` on `ui/initialize` and `ui/notifications/host-context-changed`, and forward updates to embedded `127.0.0.1` iOS and Android preview frames via `postMessage`.
- **Do** keep iOS simulators and Android emulators in separate platform groups with running devices sorted first.
- **Do** draw all icons as inline SVGs with `1.5px` stroke, round caps, and round joins.

### Don't:
- **Don't** use blue text buttons, forest-green selected pills, or thick colored left-borders on alerts or rows.
- **Don't** nest bordered `.tool-section` cards inside an already-bordered popover container.
- **Don't** lock typography or button heights to rigid `px` values that clip when `--font-text-*-size` or OS font size increases.
