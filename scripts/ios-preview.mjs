import { existsSync } from "node:fs";
import { Server } from "node:http";
import { pathToFileURL } from "node:url";

const udidPattern = /^[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}$/i;

export const AG_IOS_INJECTION = `
<style id="ag-ios-compact-style">
  :root {
    color-scheme: light dark;
    --ag-bg-fallback: #f7f7f8;
    --ag-card-fallback: #ffffff;
    --ag-muted-fallback: #eff0f1;
    --ag-fg-fallback: #1d1f21;
    --ag-fg-2-fallback: #3d4348;
    --ag-fg-muted-fallback: #555e66;
    --ag-border-fallback: rgba(0, 0, 0, 0.08);
    --ag-card-border-fallback: rgba(0, 0, 0, 0.11);
    --ag-primary-fallback: #007acc;
    --ag-error-fallback: #c63737;
    --ag-success-fallback: #4d853b;
    --ag-warning-fallback: #9c7b16;
    --hover-mix: 5%;
    --press-mix: 9%;
    --fill-mix: 6.5%;
    --field-mix: 4.8%;
    --popover-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
    --device-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

    --ag-bg: var(--color-background-primary, var(--background, var(--ag-bg-fallback)));
    --ag-card: var(--color-background-secondary, var(--card, var(--ag-card-fallback)));
    --ag-muted: var(--color-background-tertiary, var(--muted, var(--ag-muted-fallback)));
    --ag-fg: var(--color-text-primary, var(--foreground, var(--ag-fg-fallback)));
    --ag-fg-2: var(--color-text-secondary, var(--secondary-foreground, var(--ag-fg-2-fallback)));
    --ag-fg-muted: var(--color-text-tertiary, var(--muted-foreground, var(--ag-fg-muted-fallback)));
    --ag-border: var(--color-border-secondary, var(--border, var(--ag-border-fallback)));
    --ag-card-border: var(--color-border-primary, var(--card-border, var(--ag-card-border-fallback)));
    --ag-primary: var(--color-ring-primary, var(--primary, var(--ag-primary-fallback)));
    --ag-error: var(--color-text-danger, var(--error, var(--ag-error-fallback)));
    --ag-success: var(--color-text-success, var(--success, var(--ag-success-fallback)));
    --ag-warning: var(--color-text-warning, var(--warning, var(--ag-warning-fallback)));

    --ag-hover: color-mix(in srgb, var(--ag-fg) var(--hover-mix), transparent);
    --ag-press: color-mix(in srgb, var(--ag-fg) var(--press-mix), transparent);
    --ag-line: color-mix(in srgb, var(--ag-fg) 8%, transparent);
    --ag-fill: color-mix(in srgb, var(--ag-fg) var(--fill-mix), transparent);
    --ag-field: color-mix(in srgb, var(--ag-fg) var(--field-mix), transparent);
    --ag-ring: var(--color-ring-primary, color-mix(in srgb, var(--ag-primary) 72%, transparent));

    --ag-font: var(--font-sans, var(--font-family, "Google Sans Flex", "Google Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif));
    --ag-mono: var(--font-mono, var(--editor-font-family, "Google Sans Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace));
    --text-2xs: var(--font-text-xs-size, 0.6875rem);
    --text-xs: var(--font-text-xs-size, 0.75rem);
    --text-sm: var(--font-text-sm-size, 0.8125rem);
    --text-base: var(--font-text-md-size, 0.875rem);
    --weight-medium: var(--font-weight-medium, 500);
    --weight-semibold: var(--font-weight-semibold, 600);
    --r-sm: 4px;
    --r-md: 6px;
    --r-lg: 8px;
    --ease: cubic-bezier(0.22, 1, 0.36, 1);

    /* Remap serve-sim Tailwind v4 theme variables so all utility classes adapt to Light & Dark */
    --color-white: var(--ag-fg) !important;
    --color-page: var(--ag-bg) !important;
    --color-panel: var(--ag-bg) !important;
    --serve-sim-panel-bg: var(--ag-card) !important;
    --serve-sim-panel-bg-translucent: color-mix(in srgb, var(--ag-card) 92%, transparent) !important;
    --serve-sim-panel-bg-transparent: transparent !important;
    --color-panel-bg: var(--ag-card) !important;
    --color-panel-bg-translucent: color-mix(in srgb, var(--ag-card) 92%, transparent) !important;
    --color-panel-deep: var(--ag-field) !important;
    --color-panel-overlay: color-mix(in srgb, var(--ag-card) 88%, transparent) !important;
    --color-accent: var(--ag-primary) !important;
    --color-success-emerald: var(--ag-success) !important;
    --color-danger: var(--ag-error) !important;
    --color-danger-soft: var(--ag-error) !important;
    --color-warning: var(--ag-warning) !important;
    --color-warning-soft: var(--ag-warning) !important;
    --default-font-family: var(--ag-font) !important;
    --default-mono-font-family: var(--ag-mono) !important;
    --font-system: var(--ag-font) !important;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ag-bg-fallback: #131313;
      --ag-card-fallback: #1a1a1c;
      --ag-muted-fallback: #202023;
      --ag-fg-fallback: #fafafa;
      --ag-fg-2-fallback: #d4d4d8;
      --ag-fg-muted-fallback: #9e9ea6;
      --ag-border-fallback: rgba(255, 255, 255, 0.08);
      --ag-card-border-fallback: rgba(255, 255, 255, 0.11);
      --ag-primary-fallback: #4da3ff;
      --ag-error-fallback: #f06868;
      --ag-success-fallback: #7aae66;
      --ag-warning-fallback: #d4b844;
      --hover-mix: 6.5%;
      --press-mix: 11%;
      --fill-mix: 8.5%;
      --field-mix: 7%;
      --popover-shadow: 0 14px 36px rgba(0, 0, 0, 0.5);
      --device-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
    }
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
    --ag-bg-fallback: #131313;
    --ag-card-fallback: #1a1a1c;
    --ag-muted-fallback: #202023;
    --ag-fg-fallback: #fafafa;
    --ag-fg-2-fallback: #d4d4d8;
    --ag-fg-muted-fallback: #9e9ea6;
    --ag-border-fallback: rgba(255, 255, 255, 0.08);
    --ag-card-border-fallback: rgba(255, 255, 255, 0.11);
    --ag-primary-fallback: #4da3ff;
    --ag-error-fallback: #f06868;
    --ag-success-fallback: #7aae66;
    --ag-warning-fallback: #d4b844;
    --hover-mix: 6.5%;
    --press-mix: 11%;
    --fill-mix: 8.5%;
    --field-mix: 7%;
    --popover-shadow: 0 14px 36px rgba(0, 0, 0, 0.5);
    --device-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
  }

  :root[data-theme="light"] {
    color-scheme: light;
  }

  html, body {
    background: var(--ag-bg) !important;
    color: var(--ag-fg) !important;
    font-family: var(--ag-font) !important;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--ag-fg) 22%, transparent) transparent;
  }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--ag-fg) 20%, transparent);
    border: 3px solid transparent;
    background-clip: padding-box;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-track { background: transparent; }
  ::selection { background: color-mix(in srgb, var(--ag-primary) 28%, transparent); }

  /* Full-stage contain layout between the top utility bar and bottom hardware dock (matches Android) */
  #root > div.h-screen {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
    background: var(--ag-bg) !important;
    padding-top: calc(var(--ag-topbar-h, 2.3125rem) + 0.625rem + 2px) !important;
    padding-bottom: calc(var(--ag-dock-h, 2.5625rem) + 0.625rem + 2px) !important;
    padding-left: calc(0.75rem + 2px) !important;
    padding-right: calc(0.75rem + 2px) !important;
    gap: 0 !important;
    overflow: hidden !important;
  }
  #root > div.h-screen > div:has(> [data-device-chrome]) {
    container-type: size !important;
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    gap: 0 !important;
    display: grid !important;
    place-items: center !important;
  }
  #root [data-device-chrome] {
    width: min(100cqw, calc(100cqh * var(--ag-device-ar, 0.460187))) !important;
    height: min(100cqh, calc(100cqw / var(--ag-device-ar, 0.460187))) !important;
    max-width: 100cqw !important;
    max-height: 100cqh !important;
    transition: none !important;
  }
  #root [data-device-chrome="off"] img,
  #root [data-device-chrome="off"] canvas {
    box-shadow: var(--device-shadow) !important;
    border: 1px solid var(--ag-card-border) !important;
  }

  /* Hide stock serve-sim floating chrome while keeping React controls mounted for delegation */
  [data-simulator-toolbar],
  #root > div.h-screen > div > div:not([data-device-chrome]):has(> [data-simulator-toolbar]),
  div:has(> button[aria-label="Open devices sidebar"]),
  div:has(> button[aria-label="Open tools panel"]),
  aside.left-3,
  [style*="nwse-resize"],
  [aria-label="Resize simulators sidebar"],
  [aria-label="Resize tools panel"],
  [aria-label="Resize WebKit DevTools panel"] {
    position: fixed !important;
    left: -9999px !important;
    top: -9999px !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* Transform right Tools / WebKit DevTools drawer into Antigravity floating card popover */
  aside.right-3 {
    top: calc(2.25rem + 6px) !important;
    bottom: auto !important;
    right: 0.75rem !important;
    width: min(calc(100vw - 1.5rem), 25rem) !important;
    max-height: min(calc(100dvh - 5.75rem), 38rem) !important;
    border-radius: var(--r-lg) !important;
    background: var(--ag-card) !important;
    border: 1px solid var(--ag-card-border) !important;
    box-shadow: var(--popover-shadow) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    color: var(--ag-fg) !important;
    font-family: var(--ag-font) !important;
    overflow: hidden !important;
    z-index: 40 !important;
    transition: opacity 140ms var(--ease), transform 140ms var(--ease) !important;
  }
  aside.right-3:has(button[aria-label="Close WebKit DevTools"]) {
    height: min(calc(100dvh - 5.75rem), 32rem) !important;
  }
  aside.right-3 .bg-white {
    background-color: var(--ag-bg) !important;
  }
  aside.right-3[aria-hidden="true"] {
    opacity: 0 !important;
    transform: translateY(-4px) !important;
    pointer-events: none !important;
  }
  aside.right-3[aria-hidden="false"] {
    opacity: 1 !important;
    transform: translateY(0) !important;
    pointer-events: auto !important;
  }
  aside.right-3 > header {
    border-bottom: 1px solid var(--ag-line) !important;
    padding: 0.4375rem 0.625rem 0.4375rem 0.75rem !important;
  }
  /* Hide redundant Tools header while preserving DOM nodes for click delegation */
  aside.right-3:has(> div.overflow-y-auto) > header {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    border: 0 !important;
    overflow: hidden !important;
    clip-path: inset(50%) !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  aside.right-3 > header > span {
    font-size: var(--text-xs) !important;
    font-weight: var(--weight-semibold) !important;
    color: var(--ag-fg) !important;
    letter-spacing: 0 !important;
  }
  aside.right-3 button[aria-label="Close panel"],
  aside.right-3 button[aria-label="Close WebKit DevTools"] {
    width: 1.5rem !important;
    height: 1.5rem !important;
    color: var(--ag-fg-muted) !important;
    border-radius: var(--r-sm) !important;
  }
  aside.right-3 button[aria-label="Close panel"]:hover,
  aside.right-3 button[aria-label="Close WebKit DevTools"]:hover {
    background: var(--ag-hover) !important;
    color: var(--ag-fg) !important;
  }

  /* Flush single-container accordion group inside iOS tools (matches Android tools) */
  aside.right-3 > div.overflow-y-auto {
    padding: 0.5rem !important;
    gap: 0 !important;
  }
  aside.right-3 > div.overflow-y-auto > * {
    background: var(--ag-bg) !important;
    border: 1px solid var(--ag-line) !important;
    border-radius: 0 !important;
  }
  aside.right-3 > div.overflow-y-auto > *:first-child {
    border-top-left-radius: var(--r-md) !important;
    border-top-right-radius: var(--r-md) !important;
  }
  aside.right-3 > div.overflow-y-auto > *:last-child {
    border-bottom-left-radius: var(--r-md) !important;
    border-bottom-right-radius: var(--r-md) !important;
  }
  aside.right-3 > div.overflow-y-auto > * + * {
    border-top: 0 !important;
  }
  /* Fix upstream 3-column grid on Event Log summary so the chevron stays on one row */
  aside.right-3 details[data-event-log] > summary.lem-toggle {
    grid-template-columns: auto 1fr auto auto !important;
  }

  /* Monochrome range sliders & switches across Light and Dark modes */
  aside.right-3 input[type="range"] {
    --slider-track-rest: color-mix(in srgb, var(--ag-fg) 16%, transparent);
    --slider-active-fill: var(--ag-fg-2);
  }
  aside.right-3 input[type="range"]::-webkit-slider-runnable-track {
    height: 4px !important;
    border-radius: 999px !important;
    background: linear-gradient(
      to right,
      var(--slider-active-fill) var(--slider-fill, 50%),
      var(--slider-track-rest) var(--slider-fill, 50%)
    ) !important;
  }
  aside.right-3 input[type="range"]::-webkit-slider-thumb {
    background: var(--ag-card) !important;
    border: 1.5px solid var(--ag-fg-2) !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18) !important;
  }
  aside.right-3 input[type="range"]::-moz-range-track {
    height: 4px !important;
    border-radius: 999px !important;
    background: var(--slider-track-rest) !important;
  }
  aside.right-3 input[type="range"]::-moz-range-progress {
    height: 4px !important;
    border-radius: 999px !important;
    background: var(--slider-active-fill) !important;
  }
  aside.right-3 input[type="range"]::-moz-range-thumb {
    background: var(--ag-card) !important;
    border: 1.5px solid var(--ag-fg-2) !important;
  }
  aside.right-3 [role="switch"] {
    background-color: color-mix(in srgb, var(--ag-fg) 18%, transparent) !important;
  }
  aside.right-3 [role="switch"][aria-checked="true"] {
    background-color: var(--ag-fg-2) !important;
  }
  aside.right-3 [role="switch"] > span {
    background-color: var(--ag-bg) !important;
  }

  /* Antigravity Top Utility Bar (matches Android compact layout) */
  #ag-ios-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 45;
    min-height: 2.25rem;
    padding: 0.25rem 0.75rem;
    background: var(--ag-bg);
    border-bottom: 1px solid var(--ag-line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .ag-ios-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    font-size: var(--text-xs);
    color: var(--ag-fg-muted);
    font-variant-numeric: tabular-nums;
  }
  .ag-ios-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex: none;
    background: var(--ag-warning);
  }
  .ag-ios-dot[data-state="streaming"] {
    background: var(--ag-success);
  }
  .ag-ios-meta-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ag-ios-top-actions {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex: none;
  }

  /* Shared Antigravity Compact Buttons */
  .ag-ios-btn {
    font-family: var(--ag-font);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-height: 1.75rem;
    padding: 0 0.5625rem;
    border-radius: var(--r-md);
    border: 1px solid transparent;
    background: transparent;
    color: var(--ag-fg-2);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: background-color 140ms var(--ease), color 140ms var(--ease), border-color 140ms var(--ease);
  }
  .ag-ios-btn:hover:not(:disabled) {
    background: var(--ag-hover);
    color: var(--ag-fg);
  }
  .ag-ios-btn:active:not(:disabled) {
    background: var(--ag-press);
  }
  .ag-ios-btn[aria-pressed="true"],
  .ag-ios-btn[aria-expanded="true"] {
    background: var(--ag-fill);
    color: var(--ag-fg);
  }
  .ag-ios-btn:focus {
    outline: none;
  }
  .ag-ios-btn:focus-visible {
    outline: 2px solid var(--ag-ring);
    outline-offset: 1px;
  }
  .ag-ios-btn:disabled {
    opacity: 0.42;
    cursor: default;
  }
  .ag-ios-btn svg {
    width: 0.875rem;
    height: 0.875rem;
    flex: none;
  }
  .ag-ios-tools-icon circle {
    fill: var(--ag-bg);
  }
  .ag-ios-btn:hover .ag-ios-tools-icon circle,
  .ag-ios-btn[aria-expanded="true"] .ag-ios-tools-icon circle {
    fill: var(--ag-card);
  }
  .ag-ios-chevron {
    color: var(--ag-fg-muted);
    transition: transform 140ms var(--ease);
  }
  .ag-ios-btn[aria-expanded="true"] .ag-ios-chevron {
    transform: rotate(180deg);
  }

  /* Antigravity Bottom Hardware & Action Dock (matches Android compact layout) */
  #ag-ios-dock {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 45;
    min-height: 2.25rem;
    padding: 0.375rem 0.625rem;
    background: var(--ag-bg);
    border-top: 1px solid var(--ag-line);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
  }
  #ag-ios-dock [hidden] {
    display: none !important;
  }

  @media (max-width: 340px) {
    .ag-ios-dock-label,
    .ag-ios-inspector-label {
      display: none;
    }
    #ag-ios-dock .ag-ios-btn {
      padding-inline: 0.5rem;
    }
  }
</style>
<script id="ag-ios-compact-script">
(() => {
  const params = new URLSearchParams(window.location.search);
  const initialTheme = params.get("theme");
  if (initialTheme === "light" || initialTheme === "dark") {
    document.documentElement.dataset.theme = initialTheme;
    document.documentElement.style.colorScheme = initialTheme;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent) return;
    const data = event.data;
    if (!data || typeof data !== "object" || data.type !== "ag-theme") return;
    if (data.theme === "light" || data.theme === "dark") {
      document.documentElement.dataset.theme = data.theme;
      document.documentElement.style.colorScheme = data.theme;
    }
    const vars = data.variables;
    if (vars && typeof vars === "object") {
      for (const [key, value] of Object.entries(vars)) {
        if (typeof key === "string" && key.startsWith("--") && typeof value === "string") {
          document.documentElement.style.setProperty(key, value);
        }
      }
    }
  });

  let frameCount = 0;
  let lastFpsAt = performance.now();
  let currentFps = null;
  let hasVideoFrames = false;
  let streamWidth = 0;
  let streamHeight = 0;

  const origDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function patchedDrawImage(...args) {
    if (typeof VideoFrame === "function" && args[0] instanceof VideoFrame) {
      frameCount++;
      hasVideoFrames = true;
      streamWidth = args[0].displayWidth || 0;
      streamHeight = args[0].displayHeight || 0;
    }
    return origDrawImage.apply(this, args);
  };

  function mountShell() {
    if (document.getElementById("ag-ios-topbar")) return;

    const topbar = document.createElement("header");
    topbar.id = "ag-ios-topbar";
    topbar.innerHTML = \`
      <div class="ag-ios-meta">
        <span id="ag-ios-dot" class="ag-ios-dot" data-state="connecting" aria-hidden="true"></span>
        <span id="ag-ios-meta-text" class="ag-ios-meta-text">connecting…</span>
      </div>
      <div class="ag-ios-top-actions">
        <button id="ag-ios-devtools-btn" type="button" class="ag-ios-btn" aria-expanded="false" title="WebKit Inspector">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m5.25 5.25-2.75 2.75 2.75 2.75M10.75 5.25l2.75 2.75-2.75 2.75M8.75 3.5l-1.5 9" />
          </svg>
          <span class="ag-ios-inspector-label">Inspector</span>
        </button>
        <button id="ag-ios-tools-btn" type="button" class="ag-ios-btn" aria-expanded="false">
          <svg class="ag-ios-tools-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="5.5" cy="4.5" r="1.5" stroke="currentColor" stroke-width="1.5" />
            <circle cx="10.5" cy="8" r="1.5" stroke="currentColor" stroke-width="1.5" />
            <circle cx="6.5" cy="11.5" r="1.5" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <span>iOS tools</span>
          <svg class="ag-ios-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4.75 6.5 8 9.75 11.25 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    \`;

    const dock = document.createElement("footer");
    dock.id = "ag-ios-dock";
    dock.innerHTML = \`
      <button id="ag-ios-reload" type="button" class="ag-ios-btn" title="Reload React Native" hidden>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M13.25 8a5.25 5.25 0 1 1-1.38-3.55M13.25 2.75v2.5h-2.5" />
        </svg>
        <span class="ag-ios-dock-label">Reload</span>
      </button>
      <button id="ag-ios-home" type="button" class="ag-ios-btn" title="Home (Cmd+Shift+H)">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="8" cy="8" r="4.25" />
        </svg>
        <span class="ag-ios-dock-label">Home</span>
      </button>
      <button id="ag-ios-rotate" type="button" class="ag-ios-btn" title="Rotate simulator">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12.75 6.5A4.75 4.75 0 0 0 4.4 4.4L3.25 5.5M3.25 3v2.5h2.5" />
          <rect x="4.5" y="7.25" width="7" height="5.5" rx="1.25" />
        </svg>
        <span class="ag-ios-dock-label">Rotate</span>
      </button>
      <button id="ag-ios-screenshot" type="button" class="ag-ios-btn" title="Save screenshot">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2.75 5.5A1.5 1.5 0 0 1 4.25 4h1.1l.85-1.25h3.6l.85 1.25h1.1a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-7.5a1.5 1.5 0 0 1-1.5-1.5Z" />
          <circle cx="8" cy="8.5" r="2" />
        </svg>
        <span class="ag-ios-dock-label">Screenshot</span>
      </button>
      <button id="ag-ios-frame" type="button" class="ag-ios-btn" title="Toggle device bezel" hidden>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="4.25" y="1.75" width="7.5" height="12.5" rx="1.75" />
          <path d="M6.75 3.5h2.5" />
        </svg>
        <span class="ag-ios-dock-label">Bezel</span>
      </button>
      <button id="ag-ios-ax" type="button" class="ag-ios-btn" title="Toggle accessibility overlay">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="8" cy="8" r="5.5" />
          <circle cx="8" cy="5.5" r=".75" fill="currentColor" stroke="none" />
          <path d="M5.5 7.25h5M8 7.25v2.5M6.75 11.75 8 9.75l1.25 2" />
        </svg>
        <span class="ag-ios-dock-label">Inspect</span>
      </button>
    \`;

    document.body.append(topbar, dock);

    const updateBarHeights = () => {
      const topH = topbar.offsetHeight;
      const dockH = dock.offsetHeight;
      if (topH > 0) document.documentElement.style.setProperty("--ag-topbar-h", topH + "px");
      if (dockH > 0) document.documentElement.style.setProperty("--ag-dock-h", dockH + "px");
    };
    updateBarHeights();
    if (typeof ResizeObserver === "function") {
      const barRo = new ResizeObserver(updateBarHeights);
      barRo.observe(topbar);
      barRo.observe(dock);
    }

    const parseAspectRatio = (raw) => {
      if (!raw || raw === "auto") return null;
      const parts = String(raw).split("/");
      if (parts.length === 2) {
        const w = Number(parts[0].trim());
        const h = Number(parts[1].trim());
        return w > 0 && h > 0 ? w / h : null;
      }
      const n = Number(String(raw).trim());
      return Number.isFinite(n) && n > 0 ? n : null;
    };
    let lastDeviceAr = "";

    const q = (sel) => document.querySelector(sel);
    const delegate = (sel) => q(sel)?.click();

    document.getElementById("ag-ios-tools-btn").addEventListener("click", () => {
      const openAside = [...document.querySelectorAll("aside.right-3")].find((el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("header")?.textContent?.includes("Tools"));
      if (openAside) {
        openAside.querySelector('button[aria-label="Close panel"]')?.click();
      } else {
        delegate('button[aria-label="Open tools panel"]');
      }
    });

    document.getElementById("ag-ios-devtools-btn").addEventListener("click", () => {
      const openDev = [...document.querySelectorAll("aside.right-3")].find((el) => el.getAttribute("aria-hidden") === "false" && !el.querySelector("header")?.textContent?.includes("Tools"));
      if (openDev) {
        openDev.querySelector('button[aria-label="Close panel"]')?.click();
      } else {
        delegate('button[aria-label="Open WebKit DevTools"]');
      }
    });

    document.getElementById("ag-ios-reload").addEventListener("click", () => delegate('button[aria-label="Reload React Native bundle"]'));
    document.getElementById("ag-ios-home").addEventListener("click", () => delegate('button[aria-label="Home"]'));
    document.getElementById("ag-ios-rotate").addEventListener("click", () => delegate('button[aria-label="Rotate device"]'));
    document.getElementById("ag-ios-screenshot").addEventListener("click", () => delegate('button[aria-label="Screenshot"]'));
    document.getElementById("ag-ios-frame").addEventListener("click", () => delegate('button[aria-label="Hide device frame"], button[aria-label="Show device frame"]'));
    document.getElementById("ag-ios-ax").addEventListener("click", () => delegate('button[aria-label="Hide accessibility overlay"], button[aria-label="Show accessibility overlay"]'));

    const closeOpenRightDrawer = () => {
      const openDrawer = [...document.querySelectorAll("aside.right-3")].find((el) => el.getAttribute("aria-hidden") === "false");
      if (openDrawer) {
        openDrawer.querySelector('button[aria-label="Close panel"]')?.click();
        return true;
      }
      return false;
    };

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && closeOpenRightDrawer()) {
        event.preventDefault();
        document.getElementById("ag-ios-tools-btn")?.focus();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      const targetEl = event.target;
      if (!(targetEl instanceof Node)) return;
      if (topbar.contains(targetEl)) return;
      // Ignore clicks inside portal dropdowns (role="listbox" / role="option")
      if (targetEl instanceof Element && targetEl.closest('[role="listbox"], [role="option"], aside.right-3')) return;
      closeOpenRightDrawer();
    });

    const setAttrIfChanged = (el, name, val) => {
      if (el && el.getAttribute(name) !== val) el.setAttribute(name, val);
    };

    const syncUi = () => {
      const deviceEl = q("[data-device-chrome]");
      if (deviceEl) {
        const ar = parseAspectRatio(deviceEl.style.aspectRatio || getComputedStyle(deviceEl).aspectRatio);
        if (ar) {
          const nextAr = ar.toFixed(6);
          if (nextAr !== lastDeviceAr) {
            lastDeviceAr = nextAr;
            document.documentElement.style.setProperty("--ag-device-ar", nextAr);
          }
        }
      }

      const pill = q('[data-testid="stream-status-pill"]');
      const pillText = pill?.textContent?.trim() || "";
      const isLive = pillText === "live";
      if (!isLive) {
        currentFps = null;
        streamWidth = 0;
        streamHeight = 0;
      }
      const titleEl = q('[data-simulator-toolbar-title]');
      const simName = titleEl?.textContent?.trim() || "";
      const dot = document.getElementById("ag-ios-dot");
      const metaText = document.getElementById("ag-ios-meta-text");
      const nextState = isLive ? "streaming" : "connecting";
      if (dot && dot.dataset.state !== nextState) dot.dataset.state = nextState;
      if (metaText) {
        let nextText = "connecting…";
        if (isLive) {
          if (!streamWidth || !streamHeight) {
            const img = q('#root img[src*="stream.mjpeg"]');
            if (img?.naturalWidth && img?.naturalHeight) {
              streamWidth = img.naturalWidth;
              streamHeight = img.naturalHeight;
            }
          }
          if (streamWidth && streamHeight && currentFps !== null) {
            nextText = streamWidth + "×" + streamHeight + " · " + currentFps + " fps";
          } else if (streamWidth && streamHeight) {
            nextText = streamWidth + "×" + streamHeight;
          } else if (currentFps !== null) {
            nextText = currentFps + " fps";
          } else {
            nextText = "streaming";
          }
        }
        if (metaText.textContent !== nextText) metaText.textContent = nextText;
        metaText.title = simName && simName !== "No simulator" ? simName : "";
      }

      const toolsBtn = q('button[aria-label="Open tools panel"]');
      const devBtn = q('button[aria-label="Open WebKit DevTools"]');
      setAttrIfChanged(document.getElementById("ag-ios-tools-btn"), "aria-expanded", String(toolsBtn?.getAttribute("aria-pressed") === "true"));
      setAttrIfChanged(document.getElementById("ag-ios-devtools-btn"), "aria-expanded", String(devBtn?.getAttribute("aria-pressed") === "true"));

      const homeSrc = q('button[aria-label="Home"]');
      const rotateSrc = q('button[aria-label="Rotate device"]');
      const shotSrc = q('button[aria-label="Screenshot"]');
      const reloadSrc = q('button[aria-label="Reload React Native bundle"]');
      const frameSrc = q('button[aria-label="Hide device frame"], button[aria-label="Show device frame"]');
      const axSrc = q('button[aria-label="Hide accessibility overlay"], button[aria-label="Show accessibility overlay"]');

      const homeBtn = document.getElementById("ag-ios-home");
      const rotateBtn = document.getElementById("ag-ios-rotate");
      const shotBtn = document.getElementById("ag-ios-screenshot");
      const reloadBtn = document.getElementById("ag-ios-reload");
      const frameBtn = document.getElementById("ag-ios-frame");
      const axBtn = document.getElementById("ag-ios-ax");

      if (homeBtn) homeBtn.disabled = !homeSrc || homeSrc.disabled;
      if (rotateBtn) rotateBtn.disabled = !rotateSrc || rotateSrc.disabled;
      if (shotBtn) shotBtn.disabled = !shotSrc || shotSrc.disabled;
      if (reloadBtn) reloadBtn.hidden = !reloadSrc;
      if (frameBtn) {
        frameBtn.hidden = !frameSrc;
        setAttrIfChanged(frameBtn, "aria-pressed", String(frameSrc?.getAttribute("aria-label") === "Hide device frame"));
      }
      if (axBtn) {
        axBtn.disabled = !axSrc || axSrc.disabled;
        setAttrIfChanged(axBtn, "aria-pressed", String(axSrc?.getAttribute("aria-pressed") === "true"));
      }
    };

    let syncRaf = 0;
    const scheduleSync = () => {
      if (syncRaf) return;
      syncRaf = requestAnimationFrame(() => {
        syncRaf = 0;
        syncUi();
      });
    };

    syncUi();
    setInterval(() => {
      if (!hasVideoFrames) return;
      const now = performance.now();
      currentFps = Math.round((frameCount * 1000) / Math.max(1, now - lastFpsAt));
      frameCount = 0;
      lastFpsAt = now;
      syncUi();
    }, 1000);
    const rootTarget = document.getElementById("root") || document.body;
    const observer = new MutationObserver(scheduleSync);
    observer.observe(rootTarget, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountShell, { once: true });
  } else {
    mountShell();
  }
})();
</script>
`;

function wrapCompactHtmlResponse(req, res) {
  const origWriteHead = res.writeHead.bind(res);
  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  let intercept = false;
  const chunks = [];

  res.writeHead = function patchedWriteHead(statusCode, statusMessage, headers) {
    const hdrs = typeof statusMessage === "object" && statusMessage !== null ? statusMessage : headers;
    const ct = hdrs
      ? Object.entries(hdrs).find(([k]) => k.toLowerCase() === "content-type")?.[1]
      : res.getHeader("content-type");
    if (statusCode === 200 && typeof ct === "string" && ct.toLowerCase().includes("text/html")) {
      intercept = true;
      if (hdrs) {
        for (const key of Object.keys(hdrs)) {
          if (key.toLowerCase() === "content-length") delete hdrs[key];
        }
      }
      res.removeHeader("content-length");
    }
    return origWriteHead(statusCode, statusMessage, headers);
  };

  res.write = function patchedWrite(chunk, encoding, cb) {
    if (intercept && chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === "string" ? encoding : "utf8"));
      if (typeof encoding === "function") encoding();
      else if (typeof cb === "function") cb();
      return true;
    }
    return origWrite(chunk, encoding, cb);
  };

  res.end = function patchedEnd(chunk, encoding, cb) {
    if (!intercept) return origEnd(chunk, encoding, cb);
    if (chunk && typeof chunk !== "function") {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === "string" ? encoding : "utf8"));
    }
    const callback = typeof chunk === "function" ? chunk : typeof encoding === "function" ? encoding : cb;
    if (req.method === "HEAD") return origEnd(callback);
    let html = Buffer.concat(chunks).toString("utf8");
    const closeBody = html.lastIndexOf("</body>");
    html = closeBody !== -1
      ? html.slice(0, closeBody) + AG_IOS_INJECTION + html.slice(closeBody)
      : html + AG_IOS_INJECTION;
    return origEnd(html, "utf8", callback);
  };
}

// Only execute the server wrapper when invoked as the worker entry script
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const [serveSimCli, portText, target] = process.argv.slice(2);
  const port = Number(portText);
  if (!serveSimCli || !existsSync(serveSimCli) || !Number.isInteger(port) || port < 1024 || port > 65535 || !udidPattern.test(target ?? "")) {
    throw new Error("Expected a valid serve-sim CLI path, local preview port, and simulator UDID.");
  }

  const originalEmit = Server.prototype.emit;
  Server.prototype.emit = function patchedEmit(event, req, res, ...rest) {
    if (event === "request" && req && res && (req.method === "GET" || req.method === "HEAD")) {
      try {
        const parsed = new URL(req.url || "/", "http://127.0.0.1");
        if ((parsed.pathname === "/" || parsed.pathname === "/index.html") && parsed.searchParams.get("layout") === "compact") {
          wrapCompactHtmlResponse(req, res);
        }
      } catch {
        // Leave malformed URLs to the upstream handler.
      }
    }
    return originalEmit.call(this, event, req, res, ...rest);
  };

  process.argv = [process.execPath, serveSimCli, "--host", "127.0.0.1", "--port", String(port), "--panes", "none", "--fit", target];
  await import(pathToFileURL(serveSimCli).href);
}
