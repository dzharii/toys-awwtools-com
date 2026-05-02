The initial code. 
2026-04-19

## Section 1: Plan

I will implement the project as a small browser-first framework with plain custom elements for the first working release, plus a **pinned Lit vendoring path** so the repository can keep third-party source inside the project without requiring npm at development or runtime. Official Lit docs recommend installing `lit` from npm, and the current npm package page lists `lit` at version **3.3.2**. For your preferred workflow, the repo will include a vendoring script that downloads the pinned Lit package source from the official npm package source, with GitHub releases also documented as a secondary official reference point. ([npm][1])

I am making these implementation decisions to resolve the remaining spec ambiguity:

1. **Vendoring policy**
   The repo will vendor Lit by script into `vendor/lit/` from the pinned official package source. The framework code will not depend on a CDN or npm-installed runtime dependency. The script pins the version and keeps the source in-repo after download. ([npm][1])

2. **Framework architecture**
   The base implementation will use:

   * one singleton `awwbookmarklet-desktop-root`
   * one window manager service
   * namespaced tokens
   * Shadow DOM on all core components
   * idempotent custom-element registration
   * a non-blocking overlay root with `pointer-events: none`, while windows and menus opt back into interaction

3. **Resolved interaction decisions**

   * open shadow roots for debuggability
   * viewport clamping uses `visualViewport` when available, else `window.innerWidth/innerHeight`
   * titlebar system affordance single-click dispatches a system-menu event, double-click closes
   * menubar uses roving focus and keyboard navigation
   * listbox is **single-select** in v1 with arrows, Home/End, and typeahead
   * tabs are generated from `awwbookmarklet-tab-panel[label]` children
   * `awwbookmarklet-input` and `awwbookmarklet-textarea` wrap native controls rather than using form-associated custom elements

4. **Visual decisions**

   * square geometry
   * zero radius by default
   * subtle titlebar translucency only
   * solid deterministic fallback when `backdrop-filter` is unsupported
   * restrained shadow and explicit borders
     Apple’s HIG describes materials as a way to create separation and hierarchy, which matches the narrow titlebar-only use here. ([Apple Developer][2])

5. **Demo / storybook decision**
   I will include an interactive **component catalog / playground** page. It will act like a lightweight storybook: browse components, open sample windows, test menus, tabs, listbox, inputs, and statusbars.

Files to create:

* `README.md`
* `package.json`
* `scripts/vendor-lit.mjs`
* `scripts/build.mjs`
* `demo/index.html`
* `src/bookmarklet/index.js`
* `src/core/constants.js`
* `src/core/define.js`
* `src/core/geometry.js`
* `src/core/styles.js`
* `src/core/theme.js`
* `src/core/window-manager.js`
* `src/core/commands.js`
* `src/components/titlebar.js`
* `src/components/desktop-root.js`
* `src/components/window.js`
* `src/components/menubar.js`
* `src/components/menu.js`
* `src/components/button.js`
* `src/components/icon-button.js`
* `src/components/input.js`
* `src/components/textarea.js`
* `src/components/statusbar.js`
* `src/components/tabs.js`
* `src/components/listbox.js`
* `src/components/register-all.js`
* `src/demo/catalog.js`

Confidence: **92%**

## Section 2: Implementation

````text
__FILE::README.md
# AWW Bookmarklet UI Framework

A reusable bookmarklet UI framework with a retro-modern Windows 3.x-inspired visual language.

## Goals

- Shadow-DOM isolated UI primitives for arbitrary host pages
- Floating desktop-like windows for bookmarklet tools
- Small stable component inventory for utility interfaces
- Bookmarklet-safe singleton desktop root
- Bun build pipeline
- Pinned vendoring path for Lit source without relying on npm at runtime

## Current architecture choice

This first working implementation uses plain custom elements for all shipped components, while keeping a pinned vendoring pipeline for Lit in `vendor/lit/` for future stateful/composite modules. This keeps the framework small, stable, and directly runnable in hostile page environments.

## Vendoring Lit

This project intentionally avoids requiring npm-managed Lit during normal repository use.

Run:

```bash
bun run vendor:lit
````

That downloads the pinned Lit package tarball and expands it into `vendor/lit/`.

You can change the pinned version inside `scripts/vendor-lit.mjs`.

## Run the demo catalog

```bash
bun run dev
```

Then open `demo/index.html` through your local static server, or run your preferred Bun-compatible static host.

## Build

```bash
bun run build
```

This emits bundled files into `dist/`.

## Project structure

* `src/core/` foundation services and styling
* `src/components/` web components
* `src/bookmarklet/` bookmarklet bootstrap entrypoint
* `src/demo/` interactive catalog / playground
* `scripts/` vendoring and build scripts
* `demo/` demo HTML shell

## Notes

* All public custom elements use the `awwbookmarklet-` prefix.
* All public CSS variables use the `--awwbookmarklet-` prefix.
* All components use open shadow roots for inspectability.
* Overlay root is non-blocking; windows and menus enable interaction locally.
* Repeated bootstrap calls are idempotent.

__FILE::package.json
{
"name": "awwbookmarklet-ui-framework",
"version": "0.1.0",
"private": true,
"type": "module",
"scripts": {
"vendor:lit": "bun run scripts/vendor-lit.mjs",
"build": "bun run scripts/build.mjs",
"dev": "bun --hot demo/index.html"
}
}

__FILE::scripts/vendor-lit.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { basename, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { tmpdir } from "node:os";

const PINNED_VERSION = "3.3.2";
const PACKAGE_NAME = "lit";
const TARBALL_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/-/${PACKAGE_NAME}-${PINNED_VERSION}.tgz`;

async function main() {
const targetDir = join(process.cwd(), "vendor", "lit");
await mkdir(targetDir, { recursive: true });

const tempTarball = join(tmpdir(), basename(TARBALL_URL));

console.log(`[vendor-lit] Downloading ${PACKAGE_NAME}@${PINNED_VERSION}`);
const response = await fetch(TARBALL_URL);

if (!response.ok || !response.body) {
throw new Error(`Failed to download tarball: ${response.status} ${response.statusText}`);
}

await pipeline(response.body, createWriteStream(tempTarball));
console.log(`[vendor-lit] Saved tarball to ${tempTarball}`);

const proc = Bun.spawn(["tar", "-xzf", tempTarball, "-C", targetDir, "--strip-components=1"], {
stdout: "inherit",
stderr: "inherit"
});

const exitCode = await proc.exited;
if (exitCode !== 0) {
throw new Error(`tar extraction failed with exit code ${exitCode}`);
}

const manifest = {
package: PACKAGE_NAME,
version: PINNED_VERSION,
tarball: TARBALL_URL,
fetchedAt: new Date().toISOString()
};

await writeFile(join(targetDir, "VENDORED_FROM.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(`[vendor-lit] Extracted to ${targetDir}`);
console.log(`[vendor-lit] Done`);
}

main().catch((error) => {
console.error("[vendor-lit] Error:", error);
process.exitCode = 1;
});

__FILE::scripts/build.mjs
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

async function build() {
const outdir = join(process.cwd(), "dist");
await mkdir(outdir, { recursive: true });

const result = await Bun.build({
entrypoints: [
join(process.cwd(), "src", "bookmarklet", "index.js"),
join(process.cwd(), "src", "demo", "catalog.js")
],
outdir,
target: "browser",
sourcemap: "external",
minify: false,
splitting: false,
naming: {
entry: "[dir]/[name].js"
}
});

if (!result.success) {
for (const log of result.logs) {
console.error(log);
}
process.exitCode = 1;
return;
}

console.log("[build] Success");
for (const output of result.outputs) {
console.log(`[build] ${output.path}`);
}
}

build().catch((error) => {
console.error("[build] Error:", error);
process.exitCode = 1;
});

__FILE::demo/index.html

<!doctype html>

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>AWW Bookmarklet UI Framework Demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html,
      body {
        margin: 0;
        min-height: 100%;
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 30%),
          linear-gradient(180deg, #23425f, #18293e 45%, #112033);
        color: #f2f5fa;
        font: 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

```
  body {
    padding: 24px;
  }

  .page {
    max-width: 1120px;
    margin: 0 auto;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 28px;
  }

  p {
    margin: 0 0 12px;
    max-width: 78ch;
  }

  .note {
    opacity: 0.85;
  }

  #catalog-root {
    margin-top: 24px;
  }
</style>
```

  </head>
  <body>
    <div class="page">
      <h1>AWW Bookmarklet UI Framework</h1>
      <p>
        Interactive catalog / playground for the retro-modern bookmarklet UI shell.
      </p>
      <p class="note">
        Open windows, test menus, tabs, listbox navigation, inputs, and status bars.
      </p>
      <div id="catalog-root"></div>
    </div>
    <script type="module" src="../src/demo/catalog.js"></script>
  </body>
</html>

__FILE::src/core/constants.js
export const PREFIX = "awwbookmarklet";
export const GLOBAL_ROOT_SYMBOL = Symbol.for("awwbookmarklet.desktopRoot");
export const GLOBAL_VERSION_SYMBOL = Symbol.for("awwbookmarklet.version");
export const VERSION = "0.1.0";

export const TAGS = {
desktopRoot: `${PREFIX}-desktop-root`,
window: `${PREFIX}-window`,
titlebar: `${PREFIX}-titlebar`,
menubar: `${PREFIX}-menubar`,
menu: `${PREFIX}-menu`,
button: `${PREFIX}-button`,
iconButton: `${PREFIX}-icon-button`,
input: `${PREFIX}-input`,
textarea: `${PREFIX}-textarea`,
tabs: `${PREFIX}-tabs`,
tabPanel: `${PREFIX}-tab-panel`,
listbox: `${PREFIX}-listbox`,
statusbar: `${PREFIX}-statusbar`
};

export const PUBLIC_CSS = {
workspaceBg: `--${PREFIX}-workspace-bg`,
windowBg: `--${PREFIX}-window-bg`,
panelBg: `--${PREFIX}-panel-bg`,
titlebarActiveBg: `--${PREFIX}-titlebar-active-bg`,
titlebarInactiveBg: `--${PREFIX}-titlebar-inactive-bg`,
titlebarFg: `--${PREFIX}-titlebar-fg`,
borderStrong: `--${PREFIX}-border-strong`,
borderSubtle: `--${PREFIX}-border-subtle`,
focusRing: `--${PREFIX}-focus-ring`,
buttonBg: `--${PREFIX}-button-bg`,
buttonFg: `--${PREFIX}-button-fg`,
buttonActiveBg: `--${PREFIX}-button-active-bg`,
inputBg: `--${PREFIX}-input-bg`,
inputFg: `--${PREFIX}-input-fg`,
menuBg: `--${PREFIX}-menu-bg`,
menuFg: `--${PREFIX}-menu-fg`,
selectionBg: `--${PREFIX}-selection-bg`,
selectionFg: `--${PREFIX}-selection-fg`,
statusbarBg: `--${PREFIX}-statusbar-bg`,
shadowDepth: `--${PREFIX}-shadow-depth`,
frostOpacity: `--${PREFIX}-frost-opacity`,
space1: `--${PREFIX}-space-1`,
space2: `--${PREFIX}-space-2`,
space3: `--${PREFIX}-space-3`,
sizeTitlebar: `--${PREFIX}-size-titlebar`,
sizeGrip: `--${PREFIX}-size-grip`
};

__FILE::src/core/define.js
export function safeDefine(tagName, ctor) {
if (!customElements.get(tagName)) {
customElements.define(tagName, ctor);
}
}

__FILE::src/core/geometry.js
function getViewportMetrics() {
const vv = window.visualViewport;
if (vv) {
return {
width: Math.max(320, Math.floor(vv.width)),
height: Math.max(240, Math.floor(vv.height)),
left: Math.floor(vv.offsetLeft),
top: Math.floor(vv.offsetTop)
};
}

return {
width: Math.max(320, window.innerWidth),
height: Math.max(240, window.innerHeight),
left: 0,
top: 0
};
}

export function clampRect(rect, minWidth = 280, minHeight = 180) {
const viewport = getViewportMetrics();
const width = Math.max(minWidth, Math.min(rect.width, viewport.width));
const height = Math.max(minHeight, Math.min(rect.height, viewport.height));
const minVisibleTitlebar = 48;

let x = rect.x;
let y = rect.y;

const maxX = viewport.left + viewport.width - minVisibleTitlebar;
const maxY = viewport.top + viewport.height - 32;
const minX = viewport.left - (width - minVisibleTitlebar);
const minY = viewport.top;

x = Math.min(maxX, Math.max(minX, x));
y = Math.min(maxY, Math.max(minY, y));

return { x, y, width, height };
}

export function nextSpawnRect(index = 0) {
const viewport = getViewportMetrics();
const width = Math.min(720, Math.max(360, Math.floor(viewport.width * 0.56)));
const height = Math.min(520, Math.max(240, Math.floor(viewport.height * 0.54)));
const offset = 24 * (index % 8);
const x = viewport.left + 40 + offset;
const y = viewport.top + 40 + offset;
return clampRect({ x, y, width, height });
}

export function applyDrag(rect, dx, dy) {
return { ...rect, x: rect.x + dx, y: rect.y + dy };
}

export function applyResize(rect, edge, dx, dy, minWidth = 280, minHeight = 180) {
let { x, y, width, height } = rect;

if (edge.includes("e")) {
width += dx;
}
if (edge.includes("s")) {
height += dy;
}
if (edge.includes("w")) {
x += dx;
width -= dx;
}
if (edge.includes("n")) {
y += dy;
height -= dy;
}

if (width < minWidth) {
if (edge.includes("w")) {
x -= minWidth - width;
}
width = minWidth;
}

if (height < minHeight) {
if (edge.includes("n")) {
y -= minHeight - height;
}
height = minHeight;
}

return clampRect({ x, y, width, height }, minWidth, minHeight);
}

__FILE::src/core/theme.js
import { PREFIX } from "./constants.js";

export const defaultTheme = {
[`--${PREFIX}-workspace-bg`]: "transparent",
[`--${PREFIX}-window-bg`]: "rgba(238, 239, 243, 0.96)",
[`--${PREFIX}-panel-bg`]: "rgba(249, 250, 252, 0.92)",
[`--${PREFIX}-titlebar-active-bg`]: "rgba(46, 92, 142, 0.78)",
[`--${PREFIX}-titlebar-inactive-bg`]: "rgba(136, 145, 160, 0.84)",
[`--${PREFIX}-titlebar-fg`]: "#f8fbff",
[`--${PREFIX}-border-strong`]: "#232a33",
[`--${PREFIX}-border-subtle`]: "#9ba5b3",
[`--${PREFIX}-focus-ring`]: "#154fbc",
[`--${PREFIX}-button-bg`]: "#eef1f5",
[`--${PREFIX}-button-fg`]: "#182028",
[`--${PREFIX}-button-active-bg`]: "#d8dee7",
[`--${PREFIX}-input-bg`]: "#ffffff",
[`--${PREFIX}-input-fg`]: "#111820",
[`--${PREFIX}-menu-bg`]: "rgba(246, 247, 250, 0.98)",
[`--${PREFIX}-menu-fg`]: "#111820",
[`--${PREFIX}-selection-bg`]: "#1f5eae",
[`--${PREFIX}-selection-fg`]: "#f8fbff",
[`--${PREFIX}-statusbar-bg`]: "#e5e8ee",
[`--${PREFIX}-shadow-depth`]: "0 12px 32px rgba(0,0,0,0.18)",
[`--${PREFIX}-frost-opacity`]: "0.68",
[`--${PREFIX}-space-1`]: "4px",
[`--${PREFIX}-space-2`]: "8px",
[`--${PREFIX}-space-3`]: "12px",
[`--${PREFIX}-size-titlebar`]: "32px",
[`--${PREFIX}-size-grip`]: "10px"
};

export function applyTheme(target, theme = defaultTheme) {
for (const [name, value] of Object.entries(theme)) {
target.style.setProperty(name, value);
}
}

__FILE::src/core/styles.js
let sharedSheet = null;
let sharedCssText = "";

function createSharedCssText() {
return `
:host, :host * {
box-sizing: border-box;
}

```
:host {
  font: 13px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--awwbookmarklet-input-fg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

[hidden] {
  display: none !important;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: default;
}

:host([inert]) {
  pointer-events: none;
}

.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

`;
}

export function ensureSharedSheet() {
if (sharedSheet || sharedCssText) {
return;
}

sharedCssText = createSharedCssText();

if ("adoptedStyleSheets" in Document.prototype && "replaceSync" in CSSStyleSheet.prototype) {
sharedSheet = new CSSStyleSheet();
sharedSheet.replaceSync(sharedCssText);
}
}

export function adoptStyles(shadowRoot, ...styleTexts) {
ensureSharedSheet();

if (sharedSheet && "adoptedStyleSheets" in shadowRoot) {
const extraSheets = styleTexts.map((text) => {
const sheet = new CSSStyleSheet();
sheet.replaceSync(text);
return sheet;
});

```
shadowRoot.adoptedStyleSheets = [sharedSheet, ...extraSheets];
return;
```

}

const style = document.createElement("style");
style.textContent = [sharedCssText, ...styleTexts].join("\n");
shadowRoot.appendChild(style);
}

__FILE::src/core/window-manager.js
import { applyDrag, applyResize, clampRect, nextSpawnRect } from "./geometry.js";

export class WindowManager {
constructor(rootElement) {
this.rootElement = rootElement;
this.windows = [];
this.activeWindow = null;
this.zCounter = 1000;
this.refCount = 0;

```
this.handleViewportChange = this.handleViewportChange.bind(this);
window.addEventListener("resize", this.handleViewportChange, { passive: true });

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", this.handleViewportChange, { passive: true });
  window.visualViewport.addEventListener("scroll", this.handleViewportChange, { passive: true });
}
```

}

retain() {
this.refCount += 1;
}

release() {
this.refCount = Math.max(0, this.refCount - 1);
return this.refCount;
}

destroy() {
window.removeEventListener("resize", this.handleViewportChange);
if (window.visualViewport) {
window.visualViewport.removeEventListener("resize", this.handleViewportChange);
window.visualViewport.removeEventListener("scroll", this.handleViewportChange);
}
}

register(win) {
if (this.windows.includes(win)) {
return;
}
this.windows.push(win);
if (!win.rect) {
win.setRect(nextSpawnRect(this.windows.length - 1));
} else {
win.setRect(clampRect(win.rect, win.minWidth, win.minHeight));
}
this.focus(win);
}

unregister(win) {
const index = this.windows.indexOf(win);
if (index >= 0) {
this.windows.splice(index, 1);
}
if (this.activeWindow === win) {
this.activeWindow = this.windows[this.windows.length - 1] ?? null;
if (this.activeWindow) {
this.activeWindow.setActive(true);
}
}
}

focus(win) {
if (!win) {
return;
}

```
if (this.activeWindow && this.activeWindow !== win) {
  this.activeWindow.setActive(false);
}

this.activeWindow = win;
win.setActive(true);
win.style.zIndex = String(++this.zCounter);
```

}

move(win, dx, dy) {
win.setRect(clampRect(applyDrag(win.rect, dx, dy), win.minWidth, win.minHeight));
}

resize(win, edge, dx, dy) {
win.setRect(applyResize(win.rect, edge, dx, dy, win.minWidth, win.minHeight));
}

handleViewportChange() {
for (const win of this.windows) {
if (win.rect) {
win.setRect(clampRect(win.rect, win.minWidth, win.minHeight));
}
}
}
}

__FILE::src/core/commands.js
export class CommandRegistry {
constructor() {
this.commands = new Map();
}

register(command) {
if (!command || typeof command.id !== "string" || typeof command.run !== "function") {
throw new TypeError("Command must include id and run(context)");
}
this.commands.set(command.id, command);
return command;
}

get(id) {
return this.commands.get(id) ?? null;
}

isEnabled(id, context = {}) {
const command = this.get(id);
if (!command) {
return false;
}
if (typeof command.isEnabled === "function") {
return Boolean(command.isEnabled(context));
}
return true;
}

isChecked(id, context = {}) {
const command = this.get(id);
if (!command) {
return false;
}
if (typeof command.isChecked === "function") {
return Boolean(command.isChecked(context));
}
return false;
}

async run(id, context = {}) {
const command = this.get(id);
if (!command) {
throw new Error(`Unknown command: ${id}`);
}
if (!this.isEnabled(id, context)) {
return false;
}
await command.run(context);
return true;
}
}

__FILE::src/components/titlebar.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: block;
min-height: var(--awwbookmarklet-size-titlebar);
}

.bar {
display: grid;
grid-template-columns: auto 1fr auto;
align-items: center;
min-height: var(--awwbookmarklet-size-titlebar);
border-bottom: 1px solid var(--awwbookmarklet-border-strong);
padding: 0 var(--awwbookmarklet-space-2);
color: var(--awwbookmarklet-titlebar-fg);
background:
linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02)),
color-mix(in srgb, var(--awwbookmarklet-titlebar-active-bg) calc(var(--awwbookmarklet-frost-opacity) * 100%), transparent);
backdrop-filter: blur(10px) saturate(1.05);
-webkit-backdrop-filter: blur(10px) saturate(1.05);
user-select: none;
gap: var(--awwbookmarklet-space-2);
}

:host([inactive]) .bar {
background:
linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.01)),
color-mix(in srgb, var(--awwbookmarklet-titlebar-inactive-bg) calc(var(--awwbookmarklet-frost-opacity) * 100%), transparent);
}

.left,
.right {
display: inline-flex;
align-items: center;
gap: var(--awwbookmarklet-space-1);
}

.center {
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;
font-weight: 700;
letter-spacing: 0.01em;
}
`;

class AwwBookmarkletTitlebar extends HTMLElement {
constructor() {
super();
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

```
const bar = document.createElement("div");
bar.className = "bar";
bar.innerHTML = `
  <div class="left"><slot name="left"></slot></div>
  <div class="center" part="titlebar"><slot name="title"></slot></div>
  <div class="right"><slot name="right"></slot></div>
`;
root.appendChild(bar);
```

}
}

safeDefine(TAGS.titlebar, AwwBookmarkletTitlebar);

__FILE::src/components/desktop-root.js
import { TAGS, GLOBAL_ROOT_SYMBOL, GLOBAL_VERSION_SYMBOL, VERSION } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";
import { applyTheme, defaultTheme } from "../core/theme.js";
import { WindowManager } from "../core/window-manager.js";

const styleText = `
:host {
position: fixed;
inset: 0;
z-index: 2147483000;
pointer-events: none;
display: block;
background: var(--awwbookmarklet-workspace-bg);
}

.desktop {
position: absolute;
inset: 0;
pointer-events: none;
overflow: clip;
}

::slotted(*) {
pointer-events: auto;
}
`;

class AwwBookmarkletDesktopRoot extends HTMLElement {
static ensure() {
let existing = window[GLOBAL_ROOT_SYMBOL];
if (existing?.isConnected) {
existing.manager?.retain();
return existing;
}

```
existing = document.createElement(TAGS.desktopRoot);
document.documentElement.appendChild(existing);
existing.manager?.retain();
return existing;
```

}

constructor() {
super();
this.manager = new WindowManager(this);
window[GLOBAL_ROOT_SYMBOL] = this;
window[GLOBAL_VERSION_SYMBOL] = VERSION;

```
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

const desktop = document.createElement("div");
desktop.className = "desktop";
desktop.innerHTML = `<slot></slot>`;
root.appendChild(desktop);
```

}

connectedCallback() {
applyTheme(this, defaultTheme);
this.addEventListener("pointerdown", (event) => {
const targetWindow = event.composedPath().find((node) => node?.tagName?.toLowerCase() === TAGS.window);
if (targetWindow && targetWindow.manager) {
targetWindow.manager.focus(targetWindow);
}
});
}

disconnectedCallback() {
if (window[GLOBAL_ROOT_SYMBOL] === this) {
delete window[GLOBAL_ROOT_SYMBOL];
}
this.manager.destroy();
}
}

safeDefine(TAGS.desktopRoot, AwwBookmarkletDesktopRoot);

export function ensureDesktopRoot() {
return AwwBookmarkletDesktopRoot.ensure();
}

__FILE::src/components/window.js
import "../components/titlebar.js";
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
position: fixed;
display: block;
min-width: 280px;
min-height: 180px;
pointer-events: auto;
color: var(--awwbookmarklet-input-fg);
}

.window {
position: absolute;
inset: 0;
display: grid;
grid-template-rows: auto auto auto 1fr auto;
background: var(--awwbookmarklet-window-bg);
border: 1px solid var(--awwbookmarklet-border-strong);
box-shadow: var(--awwbookmarklet-shadow-depth);
overflow: hidden;
outline: 1px solid rgba(255, 255, 255, 0.35);
outline-offset: -2px;
}

:host(:not([active])) .window {
filter: saturate(0.86) brightness(0.98);
}

.toolbar,
.menubar-wrap,
.status,
.body {
background: var(--awwbookmarklet-panel-bg);
}

.toolbar {
border-bottom: 1px solid var(--awwbookmarklet-border-subtle);
padding: var(--awwbookmarklet-space-2);
}

.menubar-wrap {
border-bottom: 1px solid var(--awwbookmarklet-border-subtle);
}

.body {
overflow: auto;
padding: var(--awwbookmarklet-space-3);
}

.status {
border-top: 1px solid var(--awwbookmarklet-border-subtle);
}

.system-button,
.title-button {
appearance: none;
border: 1px solid rgba(255,255,255,0.2);
background: rgba(255,255,255,0.08);
color: inherit;
min-width: 22px;
height: 22px;
padding: 0 6px;
display: inline-grid;
place-items: center;
}

.system-button:hover,
.title-button:hover {
background: rgba(255,255,255,0.14);
}

.system-button:active,
.title-button:active {
background: rgba(0,0,0,0.18);
}

.system-button:focus-visible,
.title-button:focus-visible {
outline: 2px solid rgba(255,255,255,0.9);
outline-offset: 1px;
}

.title-text {
pointer-events: none;
}

.resize-handle {
position: absolute;
z-index: 10;
}

.resize-handle[data-edge="n"] { top: 0; left: 10px; right: 10px; height: var(--awwbookmarklet-size-grip); cursor: n-resize; }
.resize-handle[data-edge="s"] { bottom: 0; left: 10px; right: 10px; height: var(--awwbookmarklet-size-grip); cursor: s-resize; }
.resize-handle[data-edge="w"] { top: 10px; bottom: 10px; left: 0; width: var(--awwbookmarklet-size-grip); cursor: w-resize; }
.resize-handle[data-edge="e"] { top: 10px; bottom: 10px; right: 0; width: var(--awwbookmarklet-size-grip); cursor: e-resize; }
.resize-handle[data-edge="nw"] { top: 0; left: 0; width: 14px; height: 14px; cursor: nw-resize; }
.resize-handle[data-edge="ne"] { top: 0; right: 0; width: 14px; height: 14px; cursor: ne-resize; }
.resize-handle[data-edge="sw"] { bottom: 0; left: 0; width: 14px; height: 14px; cursor: sw-resize; }
.resize-handle[data-edge="se"] { bottom: 0; right: 0; width: 14px; height: 14px; cursor: se-resize; }
`;

class AwwBookmarkletWindow extends HTMLElement {
static observedAttributes = ["title"];

constructor() {
super();
this.rect = null;
this.manager = null;
this.dragState = null;
this.minWidth = 280;
this.minHeight = 180;

```
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

const container = document.createElement("div");
container.className = "window";
container.innerHTML = `
  <awwbookmarklet-titlebar id="titlebar" part="titlebar">
    <button class="system-button" id="systemButton" slot="left" type="button" aria-label="Window menu">≡</button>
    <div class="title-text" id="titleText" slot="title"></div>
    <div slot="right">
      <button class="title-button" id="closeButton" type="button" aria-label="Close window">✕</button>
    </div>
  </awwbookmarklet-titlebar>
  <div class="menubar-wrap" hidden><slot name="menubar"></slot></div>
  <div class="toolbar" hidden><slot name="toolbar"></slot></div>
  <div class="body" part="body"><slot></slot></div>
  <div class="status" hidden><slot name="statusbar"></slot></div>
  <div class="resize-handle" data-edge="n"></div>
  <div class="resize-handle" data-edge="s"></div>
  <div class="resize-handle" data-edge="w"></div>
  <div class="resize-handle" data-edge="e"></div>
  <div class="resize-handle" data-edge="nw"></div>
  <div class="resize-handle" data-edge="ne"></div>
  <div class="resize-handle" data-edge="sw"></div>
  <div class="resize-handle" data-edge="se"></div>
`;
root.appendChild(container);

this.$titlebar = root.getElementById("titlebar");
this.$titleText = root.getElementById("titleText");
this.$systemButton = root.getElementById("systemButton");
this.$closeButton = root.getElementById("closeButton");
this.$menubarWrap = root.querySelector(".menubar-wrap");
this.$toolbarWrap = root.querySelector(".toolbar");
this.$statusWrap = root.querySelector(".status");

this.handlePointerMove = this.handlePointerMove.bind(this);
this.handlePointerUp = this.handlePointerUp.bind(this);
```

}

connectedCallback() {
this.updateTitle();
this.refreshOptionalRegions();

```
const root = this.getRootNode().host;
if (root?.tagName?.toLowerCase() === TAGS.desktopRoot) {
  this.manager = root.manager;
  this.manager.register(this);
}

this.shadowRoot.querySelectorAll("slot").forEach((slot) => {
  slot.addEventListener("slotchange", () => this.refreshOptionalRegions());
});

this.addEventListener("pointerdown", () => {
  this.manager?.focus(this);
});

this.$titlebar.addEventListener("pointerdown", (event) => {
  const composed = event.composedPath();
  if (composed.includes(this.$systemButton) || composed.includes(this.$closeButton)) {
    return;
  }
  this.startInteraction("move", "", event);
});

this.shadowRoot.querySelectorAll(".resize-handle").forEach((handle) => {
  handle.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    this.startInteraction("resize", handle.dataset.edge, event);
  });
});

this.$systemButton.addEventListener("click", () => {
  this.dispatchEvent(new CustomEvent("awwbookmarklet-window-systemmenu", {
    bubbles: true,
    composed: true,
    detail: { window: this }
  }));
});

this.$systemButton.addEventListener("dblclick", () => {
  this.close();
});

this.$closeButton.addEventListener("click", () => this.close());
```

}

disconnectedCallback() {
this.manager?.unregister(this);
this.manager = null;
this.dragState = null;
this.removeGlobalInteractionListeners();
}

attributeChangedCallback(name) {
if (name === "title") {
this.updateTitle();
}
}

refreshOptionalRegions() {
const menubarNodes = this.querySelectorAll('[slot="menubar"]');
const toolbarNodes = this.querySelectorAll('[slot="toolbar"]');
const statusNodes = this.querySelectorAll('[slot="statusbar"]');

```
this.$menubarWrap.hidden = menubarNodes.length === 0;
this.$toolbarWrap.hidden = toolbarNodes.length === 0;
this.$statusWrap.hidden = statusNodes.length === 0;
```

}

updateTitle() {
this.$titleText.textContent = this.getAttribute("title") || "Window";
}

setActive(active) {
this.toggleAttribute("active", Boolean(active));
this.$titlebar.toggleAttribute("inactive", !active);
}

setRect(rect) {
this.rect = { ...rect };
this.style.left = `${rect.x}px`;
this.style.top = `${rect.y}px`;
this.style.width = `${rect.width}px`;
this.style.height = `${rect.height}px`;
}

startInteraction(mode, edge, event) {
if (!this.manager) {
return;
}

```
this.manager.focus(this);
this.dragState = {
  mode,
  edge,
  pointerId: event.pointerId,
  startX: event.clientX,
  startY: event.clientY,
  rect: { ...this.rect }
};

event.preventDefault();
event.stopPropagation();

this.setPointerCapture(event.pointerId);
this.addGlobalInteractionListeners();
```

}

addGlobalInteractionListeners() {
window.addEventListener("pointermove", this.handlePointerMove, true);
window.addEventListener("pointerup", this.handlePointerUp, true);
window.addEventListener("pointercancel", this.handlePointerUp, true);
}

removeGlobalInteractionListeners() {
window.removeEventListener("pointermove", this.handlePointerMove, true);
window.removeEventListener("pointerup", this.handlePointerUp, true);
window.removeEventListener("pointercancel", this.handlePointerUp, true);
}

handlePointerMove(event) {
if (!this.dragState || !this.manager) {
return;
}

```
const dx = event.clientX - this.dragState.startX;
const dy = event.clientY - this.dragState.startY;

this.rect = { ...this.dragState.rect };

if (this.dragState.mode === "move") {
  this.manager.move(this, dx, dy);
} else {
  this.manager.resize(this, this.dragState.edge, dx, dy);
}
```

}

handlePointerUp(event) {
if (!this.dragState) {
return;
}

```
if (this.hasPointerCapture?.(this.dragState.pointerId)) {
  this.releasePointerCapture(this.dragState.pointerId);
}

if (event.pointerId === this.dragState.pointerId) {
  this.dragState = null;
  this.removeGlobalInteractionListeners();
}
```

}

close() {
this.dispatchEvent(new CustomEvent("awwbookmarklet-window-close", {
bubbles: true,
composed: true,
detail: { window: this }
}));
this.remove();
}
}

safeDefine(TAGS.window, AwwBookmarkletWindow);

__FILE::src/components/menubar.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: block;
}

.bar {
display: flex;
flex-wrap: nowrap;
gap: 1px;
padding: 2px;
background: var(--awwbookmarklet-panel-bg);
}

::slotted(button[data-menu]) {
appearance: none;
border: 1px solid transparent;
background: transparent;
color: var(--awwbookmarklet-input-fg);
padding: 4px 8px;
min-height: 28px;
white-space: nowrap;
}

::slotted(button[data-menu]:hover),
::slotted(button[data-menu][data-open="true"]) {
background: var(--awwbookmarklet-button-bg);
border-color: var(--awwbookmarklet-border-subtle);
}

::slotted(button[data-menu]:focus-visible) {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: -2px;
}

::slotted(awwbookmarklet-menu) {
position: absolute;
z-index: 10000;
}
`;

class AwwBookmarkletMenubar extends HTMLElement {
constructor() {
super();
this.activeIndex = 0;
this.buttons = [];
this.menus = new Map();

```
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

const bar = document.createElement("div");
bar.className = "bar";
bar.innerHTML = `<slot></slot>`;
root.appendChild(bar);
```

}

connectedCallback() {
this.refresh();
this.shadowRoot.querySelector("slot").addEventListener("slotchange", () => this.refresh());
this.addEventListener("keydown", (event) => this.onKeyDown(event));
document.addEventListener("pointerdown", this.handleDocumentPointerDown, true);
}

disconnectedCallback() {
document.removeEventListener("pointerdown", this.handleDocumentPointerDown, true);
}

handleDocumentPointerDown = (event) => {
if (!this.contains(event.target)) {
this.closeAll();
}
};

refresh() {
this.buttons = [...this.querySelectorAll('button[data-menu]')];
this.menus = new Map(
[...this.querySelectorAll(TAGS.menu)].map((menu) => [menu.getAttribute("name"), menu])
);

```
this.buttons.forEach((button, index) => {
  button.tabIndex = index === 0 ? 0 : -1;
  button.addEventListener("click", () => this.toggleMenu(index));
  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.openMenu(index, true);
    }
  });
});
```

}

onKeyDown(event) {
if (!this.buttons.length) {
return;
}

```
const currentIndex = Math.max(0, this.buttons.findIndex((button) => button.tabIndex === 0));

if (event.key === "ArrowRight") {
  event.preventDefault();
  this.focusButton((currentIndex + 1) % this.buttons.length, true);
} else if (event.key === "ArrowLeft") {
  event.preventDefault();
  this.focusButton((currentIndex - 1 + this.buttons.length) % this.buttons.length, true);
} else if (event.key === "Home") {
  event.preventDefault();
  this.focusButton(0, true);
} else if (event.key === "End") {
  event.preventDefault();
  this.focusButton(this.buttons.length - 1, true);
} else if (event.key === "Escape") {
  this.closeAll();
}
```

}

focusButton(index, openMenu = false) {
this.buttons.forEach((button, i) => {
button.tabIndex = i === index ? 0 : -1;
});
const button = this.buttons[index];
button.focus();
if (openMenu) {
this.openMenu(index, false);
}
}

toggleMenu(index) {
const button = this.buttons[index];
if (button.dataset.open === "true") {
this.closeAll();
return;
}
this.openMenu(index, true);
}

openMenu(index, focusFirstItem) {
this.closeAll();
const button = this.buttons[index];
const name = button.dataset.menu;
const menu = this.menus.get(name);

```
if (!menu) {
  return;
}

const rect = button.getBoundingClientRect();
button.dataset.open = "true";
menu.openAt(rect.left, rect.bottom + 1);
if (focusFirstItem) {
  queueMicrotask(() => menu.focusFirstItem());
}
```

}

closeAll() {
for (const button of this.buttons) {
delete button.dataset.open;
}
for (const menu of this.menus.values()) {
menu.close();
}
}
}

safeDefine(TAGS.menubar, AwwBookmarkletMenubar);

__FILE::src/components/menu.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: none;
min-width: 180px;
background: var(--awwbookmarklet-menu-bg);
border: 1px solid var(--awwbookmarklet-border-strong);
box-shadow: var(--awwbookmarklet-shadow-depth);
padding: 2px;
color: var(--awwbookmarklet-menu-fg);
}

:host([open]) {
display: block;
}

.menu {
display: flex;
flex-direction: column;
gap: 1px;
}

::slotted(button),
::slotted([role="menuitem"]) {
appearance: none;
border: 1px solid transparent;
background: transparent;
color: inherit;
padding: 6px 10px;
text-align: left;
min-height: 28px;
width: 100%;
display: flex;
align-items: center;
justify-content: space-between;
gap: 12px;
}

::slotted(button:hover),
::slotted(button:focus-visible),
::slotted([role="menuitem"]:hover),
::slotted([role="menuitem"]:focus-visible) {
background: var(--awwbookmarklet-selection-bg);
color: var(--awwbookmarklet-selection-fg);
outline: none;
}

::slotted(hr) {
border: 0;
border-top: 1px solid var(--awwbookmarklet-border-subtle);
margin: 3px 0;
}

::slotted([disabled]),
::slotted([aria-disabled="true"]) {
opacity: 0.55;
pointer-events: none;
}
`;

class AwwBookmarkletMenu extends HTMLElement {
constructor() {
super();
this.items = [];
this.typeahead = "";
this.typeaheadTimer = 0;

```
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

const menu = document.createElement("div");
menu.className = "menu";
menu.setAttribute("role", "menu");
menu.innerHTML = `<slot></slot>`;
root.appendChild(menu);
```

}

connectedCallback() {
this.shadowRoot.querySelector("slot").addEventListener("slotchange", () => this.refreshItems());
this.addEventListener("keydown", (event) => this.onKeyDown(event));
this.addEventListener("click", (event) => {
const button = event.target.closest("button,[role='menuitem']");
if (button) {
this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-select", {
bubbles: true,
composed: true,
detail: {
command: button.dataset.command || null,
label: button.textContent?.trim() || ""
}
}));
this.close();
}
});
this.refreshItems();
}

refreshItems() {
this.items = [...this.querySelectorAll("button,[role='menuitem']")];
this.items.forEach((item, index) => {
item.tabIndex = index === 0 ? 0 : -1;
});
}

openAt(left, top) {
this.style.left = `${Math.round(left)}px`;
this.style.top = `${Math.round(top)}px`;
this.setAttribute("open", "");
}

close() {
this.removeAttribute("open");
}

focusFirstItem() {
this.refreshItems();
const item = this.items[0];
if (item) {
item.tabIndex = 0;
item.focus();
}
}

focusItem(index) {
if (!this.items.length) {
return;
}
const normalized = (index + this.items.length) % this.items.length;
this.items.forEach((item, i) => {
item.tabIndex = i === normalized ? 0 : -1;
});
this.items[normalized].focus();
}

onKeyDown(event) {
if (!this.items.length) {
return;
}

```
const currentIndex = Math.max(0, this.items.findIndex((item) => item === document.activeElement));

if (event.key === "ArrowDown") {
  event.preventDefault();
  this.focusItem(currentIndex + 1);
} else if (event.key === "ArrowUp") {
  event.preventDefault();
  this.focusItem(currentIndex - 1);
} else if (event.key === "Home") {
  event.preventDefault();
  this.focusItem(0);
} else if (event.key === "End") {
  event.preventDefault();
  this.focusItem(this.items.length - 1);
} else if (event.key === "Escape") {
  event.preventDefault();
  this.close();
} else if (event.key === "Enter" || event.key === " ") {
  const active = document.activeElement;
  if (active && this.items.includes(active)) {
    event.preventDefault();
    active.click();
  }
} else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
  this.typeahead += event.key.toLowerCase();
  clearTimeout(this.typeaheadTimer);
  this.typeaheadTimer = setTimeout(() => {
    this.typeahead = "";
  }, 700);

  const index = this.items.findIndex((item) =>
    item.textContent.trim().toLowerCase().startsWith(this.typeahead)
  );
  if (index >= 0) {
    event.preventDefault();
    this.focusItem(index);
  }
}
```

}
}

safeDefine(TAGS.menu, AwwBookmarkletMenu);

__FILE::src/components/button.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: inline-block;
}

button {
appearance: none;
border: 1px solid var(--awwbookmarklet-border-strong);
background:
linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0)),
var(--awwbookmarklet-button-bg);
color: var(--awwbookmarklet-button-fg);
min-height: 30px;
min-width: 72px;
padding: 0 12px;
box-shadow:
inset 1px 1px 0 rgba(255,255,255,0.75),
inset -1px -1px 0 rgba(0,0,0,0.12);
}

button:hover {
background: color-mix(in srgb, var(--awwbookmarklet-button-bg) 78%, white 22%);
}

button:active {
background: var(--awwbookmarklet-button-active-bg);
box-shadow:
inset 1px 1px 0 rgba(0,0,0,0.12),
inset -1px -1px 0 rgba(255,255,255,0.55);
}

button:focus-visible {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: 1px;
}

button:disabled {
opacity: 0.6;
}
`;

class AwwBookmarkletButton extends HTMLElement {
static observedAttributes = ["disabled"];

constructor() {
super();
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

```
this.button = document.createElement("button");
this.button.type = "button";
this.button.part = "button";
this.button.innerHTML = `<slot></slot>`;
root.appendChild(this.button);

this.button.addEventListener("click", (event) => {
  if (this.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
});
```

}

get disabled() {
return this.hasAttribute("disabled");
}

set disabled(value) {
this.toggleAttribute("disabled", Boolean(value));
}

connectedCallback() {
this.sync();
}

attributeChangedCallback() {
this.sync();
}

sync() {
this.button.disabled = this.disabled;
}
}

safeDefine(TAGS.button, AwwBookmarkletButton);

__FILE::src/components/icon-button.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: inline-block;
}

button {
appearance: none;
border: 1px solid var(--awwbookmarklet-border-strong);
background:
linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0)),
var(--awwbookmarklet-button-bg);
color: var(--awwbookmarklet-button-fg);
min-width: 30px;
width: 30px;
height: 30px;
padding: 0;
display: grid;
place-items: center;
box-shadow:
inset 1px 1px 0 rgba(255,255,255,0.75),
inset -1px -1px 0 rgba(0,0,0,0.12);
}

button:focus-visible {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: 1px;
}

svg {
width: 14px;
height: 14px;
display: block;
}
`;

class AwwBookmarkletIconButton extends HTMLElement {
static observedAttributes = ["disabled"];

constructor() {
super();
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

```
this.button = document.createElement("button");
this.button.type = "button";
this.button.part = "button";
this.button.innerHTML = `<slot></slot>`;
root.appendChild(this.button);

this.button.addEventListener("click", (event) => {
  if (this.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
});
```

}

get disabled() {
return this.hasAttribute("disabled");
}

set disabled(value) {
this.toggleAttribute("disabled", Boolean(value));
}

connectedCallback() {
this.sync();
}

attributeChangedCallback() {
this.sync();
}

sync() {
this.button.disabled = this.disabled;
}
}

safeDefine(TAGS.iconButton, AwwBookmarkletIconButton);

__FILE::src/components/input.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: inline-block;
min-width: 180px;
}

input {
width: 100%;
min-height: 30px;
border: 1px solid var(--awwbookmarklet-border-strong);
background: var(--awwbookmarklet-input-bg);
color: var(--awwbookmarklet-input-fg);
padding: 0 8px;
box-shadow:
inset 1px 1px 0 rgba(0,0,0,0.05),
inset -1px -1px 0 rgba(255,255,255,0.65);
}

input:focus-visible {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: 1px;
}

input:disabled {
opacity: 0.6;
}
`;

class AwwBookmarkletInput extends HTMLElement {
static observedAttributes = ["value", "placeholder", "disabled", "type", "name"];

constructor() {
super();
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

```
this.input = document.createElement("input");
this.input.part = "input";
root.appendChild(this.input);

this.input.addEventListener("input", () => {
  this.setAttribute("value", this.input.value);
  this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
});

this.input.addEventListener("change", () => {
  this.setAttribute("value", this.input.value);
  this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
});
```

}

connectedCallback() {
this.sync();
}

attributeChangedCallback() {
this.sync();
}

get value() {
return this.input.value;
}

set value(nextValue) {
this.setAttribute("value", nextValue ?? "");
}

sync() {
this.input.type = this.getAttribute("type") || "text";
this.input.name = this.getAttribute("name") || "";
this.input.placeholder = this.getAttribute("placeholder") || "";
this.input.disabled = this.hasAttribute("disabled");

```
const nextValue = this.getAttribute("value") ?? "";
if (this.input.value !== nextValue) {
  this.input.value = nextValue;
}
```

}
}

safeDefine(TAGS.input, AwwBookmarkletInput);

__FILE::src/components/textarea.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: block;
min-width: 220px;
min-height: 96px;
}

textarea {
width: 100%;
min-height: 96px;
border: 1px solid var(--awwbookmarklet-border-strong);
background: var(--awwbookmarklet-input-bg);
color: var(--awwbookmarklet-input-fg);
padding: 8px;
resize: vertical;
box-shadow:
inset 1px 1px 0 rgba(0,0,0,0.05),
inset -1px -1px 0 rgba(255,255,255,0.65);
}

textarea:focus-visible {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: 1px;
}

textarea:disabled {
opacity: 0.6;
}
`;

class AwwBookmarkletTextarea extends HTMLElement {
static observedAttributes = ["value", "placeholder", "disabled", "name", "rows"];

constructor() {
super();
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

```
this.textarea = document.createElement("textarea");
this.textarea.part = "textarea";
root.appendChild(this.textarea);

this.textarea.addEventListener("input", () => {
  this.setAttribute("value", this.textarea.value);
  this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
});

this.textarea.addEventListener("change", () => {
  this.setAttribute("value", this.textarea.value);
  this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
});
```

}

connectedCallback() {
this.sync();
}

attributeChangedCallback() {
this.sync();
}

get value() {
return this.textarea.value;
}

set value(nextValue) {
this.setAttribute("value", nextValue ?? "");
}

sync() {
this.textarea.name = this.getAttribute("name") || "";
this.textarea.placeholder = this.getAttribute("placeholder") || "";
this.textarea.disabled = this.hasAttribute("disabled");
this.textarea.rows = Number(this.getAttribute("rows") || "5");

```
const nextValue = this.getAttribute("value") ?? "";
if (this.textarea.value !== nextValue) {
  this.textarea.value = nextValue;
}
```

}
}

safeDefine(TAGS.textarea, AwwBookmarkletTextarea);

__FILE::src/components/statusbar.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: block;
background: var(--awwbookmarklet-statusbar-bg);
color: var(--awwbookmarklet-input-fg);
}

.bar {
display: flex;
gap: 1px;
padding: 2px;
}

::slotted(*) {
display: inline-flex;
align-items: center;
min-height: 24px;
padding: 0 8px;
border: 1px solid var(--awwbookmarklet-border-subtle);
background: rgba(255,255,255,0.38);
}
`;

class AwwBookmarkletStatusbar extends HTMLElement {
constructor() {
super();
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

```
const bar = document.createElement("div");
bar.className = "bar";
bar.innerHTML = `<slot></slot>`;
root.appendChild(bar);
```

}
}

safeDefine(TAGS.statusbar, AwwBookmarkletStatusbar);

__FILE::src/components/tabs.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const tabsStyleText = `
:host {
display: block;
}

.tabs {
display: grid;
grid-template-rows: auto 1fr;
gap: 0;
}

.tablist {
display: flex;
gap: 2px;
align-items: end;
border-bottom: 1px solid var(--awwbookmarklet-border-strong);
padding-bottom: 2px;
}

.tab {
appearance: none;
border: 1px solid var(--awwbookmarklet-border-strong);
border-bottom: 0;
background: var(--awwbookmarklet-button-bg);
color: var(--awwbookmarklet-button-fg);
min-height: 28px;
padding: 0 12px;
}

.tab[aria-selected="true"] {
background: var(--awwbookmarklet-panel-bg);
position: relative;
top: 1px;
}

.tab:focus-visible {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: 1px;
}

.panels {
padding-top: var(--awwbookmarklet-space-3);
}
`;

class AwwBookmarkletTabPanel extends HTMLElement {}

safeDefine(TAGS.tabPanel, AwwBookmarkletTabPanel);

class AwwBookmarkletTabs extends HTMLElement {
constructor() {
super();
this.selectedIndex = 0;
this.panels = [];

```
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, tabsStyleText);

const wrapper = document.createElement("div");
wrapper.className = "tabs";
wrapper.innerHTML = `
  <div class="tablist" role="tablist" part="tablist"></div>
  <div class="panels"><slot></slot></div>
`;
root.appendChild(wrapper);

this.tablist = root.querySelector(".tablist");
this.slotElement = root.querySelector("slot");
```

}

connectedCallback() {
this.slotElement.addEventListener("slotchange", () => this.refresh());
this.refresh();
this.tablist.addEventListener("keydown", (event) => this.onKeyDown(event));
}

refresh() {
this.panels = [...this.querySelectorAll(TAGS.tabPanel)];
const selectedPanel = this.panels.findIndex((panel) => panel.hasAttribute("selected"));
this.selectedIndex = selectedPanel >= 0 ? selectedPanel : 0;

```
this.tablist.replaceChildren();

this.panels.forEach((panel, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tab";
  button.role = "tab";
  button.textContent = panel.getAttribute("label") || `Tab ${index + 1}`;
  button.setAttribute("aria-selected", String(index === this.selectedIndex));
  button.tabIndex = index === this.selectedIndex ? 0 : -1;
  button.addEventListener("click", () => this.select(index));
  this.tablist.appendChild(button);

  panel.hidden = index !== this.selectedIndex;
  if (index === this.selectedIndex) {
    panel.setAttribute("selected", "");
  } else {
    panel.removeAttribute("selected");
  }
});
```

}

select(index) {
this.selectedIndex = index;
this.refresh();
const button = this.tablist.children[index];
if (button) {
button.focus();
}
}

onKeyDown(event) {
if (!this.panels.length) {
return;
}
if (event.key === "ArrowRight") {
event.preventDefault();
this.select((this.selectedIndex + 1) % this.panels.length);
} else if (event.key === "ArrowLeft") {
event.preventDefault();
this.select((this.selectedIndex - 1 + this.panels.length) % this.panels.length);
} else if (event.key === "Home") {
event.preventDefault();
this.select(0);
} else if (event.key === "End") {
event.preventDefault();
this.select(this.panels.length - 1);
}
}
}

safeDefine(TAGS.tabs, AwwBookmarkletTabs);

__FILE::src/components/listbox.js
import { TAGS } from "../core/constants.js";
import { safeDefine } from "../core/define.js";
import { adoptStyles } from "../core/styles.js";

const styleText = `
:host {
display: block;
min-width: 180px;
}

.box {
border: 1px solid var(--awwbookmarklet-border-strong);
background: var(--awwbookmarklet-input-bg);
min-height: 120px;
padding: 2px;
overflow: auto;
}

::slotted([role="option"]) {
display: block;
padding: 6px 8px;
border: 1px solid transparent;
color: var(--awwbookmarklet-input-fg);
}

::slotted([role="option"][aria-selected="true"]) {
background: var(--awwbookmarklet-selection-bg);
color: var(--awwbookmarklet-selection-fg);
}

::slotted([role="option"]:focus-visible) {
outline: 2px solid var(--awwbookmarklet-focus-ring);
outline-offset: -2px;
}
`;

class AwwBookmarkletListbox extends HTMLElement {
constructor() {
super();
this.options = [];
this.selectedIndex = -1;
this.typeahead = "";
this.typeaheadTimer = 0;

```
const root = this.attachShadow({ mode: "open" });
adoptStyles(root, styleText);

const box = document.createElement("div");
box.className = "box";
box.setAttribute("role", "listbox");
box.innerHTML = `<slot></slot>`;
root.appendChild(box);

this.slotElement = root.querySelector("slot");
```

}

connectedCallback() {
this.slotElement.addEventListener("slotchange", () => this.refresh());
this.addEventListener("keydown", (event) => this.onKeyDown(event));
this.addEventListener("click", (event) => {
const option = event.target.closest('[role="option"]');
if (!option) {
return;
}
const index = this.options.indexOf(option);
if (index >= 0) {
this.select(index);
}
});
this.tabIndex = 0;
this.refresh();
}

refresh() {
this.options = [...this.querySelectorAll('[role="option"]')];
const selectedIndex = this.options.findIndex((option) => option.getAttribute("aria-selected") === "true");
this.selectedIndex = selectedIndex >= 0 ? selectedIndex : (this.options.length ? 0 : -1);

```
this.options.forEach((option, index) => {
  option.tabIndex = index === this.selectedIndex ? 0 : -1;
  option.setAttribute("aria-selected", String(index === this.selectedIndex));
});
```

}

select(index) {
if (index < 0 || index >= this.options.length) {
return;
}
this.selectedIndex = index;
this.refresh();
const option = this.options[index];
option.focus();
this.dispatchEvent(new CustomEvent("change", {
bubbles: true,
composed: true,
detail: {
index,
value: option.dataset.value ?? option.textContent.trim()
}
}));
}

onKeyDown(event) {
if (!this.options.length) {
return;
}

```
if (event.key === "ArrowDown") {
  event.preventDefault();
  this.select(Math.min(this.selectedIndex + 1, this.options.length - 1));
} else if (event.key === "ArrowUp") {
  event.preventDefault();
  this.select(Math.max(this.selectedIndex - 1, 0));
} else if (event.key === "Home") {
  event.preventDefault();
  this.select(0);
} else if (event.key === "End") {
  event.preventDefault();
  this.select(this.options.length - 1);
} else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
  this.typeahead += event.key.toLowerCase();
  clearTimeout(this.typeaheadTimer);
  this.typeaheadTimer = setTimeout(() => {
    this.typeahead = "";
  }, 700);

  const index = this.options.findIndex((option) =>
    option.textContent.trim().toLowerCase().startsWith(this.typeahead)
  );
  if (index >= 0) {
    event.preventDefault();
    this.select(index);
  }
}
```

}
}

safeDefine(TAGS.listbox, AwwBookmarkletListbox);

__FILE::src/components/register-all.js
import "./desktop-root.js";
import "./window.js";
import "./titlebar.js";
import "./menubar.js";
import "./menu.js";
import "./button.js";
import "./icon-button.js";
import "./input.js";
import "./textarea.js";
import "./statusbar.js";
import "./tabs.js";
import "./listbox.js";

__FILE::src/bookmarklet/index.js
import "../components/register-all.js";
import { ensureDesktopRoot } from "../components/desktop-root.js";
import { TAGS } from "../core/constants.js";
import { CommandRegistry } from "../core/commands.js";

function buildDemoWindow(commands) {
const win = document.createElement(TAGS.window);
win.setAttribute("title", "AWW Bookmarklet Tool");
win.setRect({ x: 72, y: 72, width: 720, height: 500 });

const menubar = document.createElement(TAGS.menubar);
menubar.slot = "menubar";
menubar.innerHTML = ` <button type="button" data-menu="file">File</button> <button type="button" data-menu="view">View</button> <button type="button" data-menu="help">Help</button>

```
<awwbookmarklet-menu name="file">
  <button type="button" data-command="tool.new">New</button>
  <button type="button" data-command="tool.close">Close</button>
</awwbookmarklet-menu>

<awwbookmarklet-menu name="view">
  <button type="button" data-command="tool.spawn">Open another window</button>
</awwbookmarklet-menu>

<awwbookmarklet-menu name="help">
  <button type="button" data-command="tool.about">About</button>
</awwbookmarklet-menu>
```

`;

const status = document.createElement(TAGS.statusbar);
status.slot = "statusbar";
status.innerHTML = `     <span>Ready</span>     <span>Bookmarklet shell</span>     <span>v0.1.0</span>
  `;

const tabs = document.createElement(TAGS.tabs);
tabs.innerHTML = ` <awwbookmarklet-tab-panel label="Overview" selected> <p>This window demonstrates the reusable bookmarklet shell.</p> <p>Drag it, resize it, use the menus, and switch tabs.</p> <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px;"> <awwbookmarklet-button id="spawnButton">Spawn window</awwbookmarklet-button> <awwbookmarklet-button id="aboutButton">About</awwbookmarklet-button> </div> </awwbookmarklet-tab-panel>

```
<awwbookmarklet-tab-panel label="Inputs">
  <div style="display:grid; gap:12px; max-width:340px;">
    <awwbookmarklet-input value="Bookmarklet input"></awwbookmarklet-input>
    <awwbookmarklet-textarea rows="6" value="This is a multiline note."></awwbookmarklet-textarea>
  </div>
</awwbookmarklet-tab-panel>

<awwbookmarklet-tab-panel label="List">
  <awwbookmarklet-listbox>
    <div role="option" aria-selected="true" data-value="alpha">Alpha</div>
    <div role="option" data-value="beta">Beta</div>
    <div role="option" data-value="gamma">Gamma</div>
    <div role="option" data-value="delta">Delta</div>
  </awwbookmarklet-listbox>
</awwbookmarklet-tab-panel>
```

`;

win.append(menubar, tabs, status);

menubar.addEventListener("awwbookmarklet-menu-select", async (event) => {
const commandId = event.detail.command;
if (!commandId) {
return;
}
await commands.run(commandId, { window: win });
});

queueMicrotask(() => {
const spawnButton = tabs.querySelector("#spawnButton");
const aboutButton = tabs.querySelector("#aboutButton");

```
spawnButton?.addEventListener("click", () => commands.run("tool.spawn", { window: win }));
aboutButton?.addEventListener("click", () => commands.run("tool.about", { window: win }));
```

});

return win;
}

function buildAboutWindow() {
const win = document.createElement(TAGS.window);
win.setAttribute("title", "About AWW Bookmarklet");
win.setRect({ x: 120, y: 100, width: 420, height: 260 });

const status = document.createElement(TAGS.statusbar);
status.slot = "statusbar";
status.innerHTML = `<span>Information</span>`;

const content = document.createElement("div");
content.innerHTML = `     <p>This is the reusable bookmarklet desktop shell demo.</p>     <p>It is isolated with Shadow DOM and designed to survive hostile host pages.</p>     <p>Double-click the left titlebar affordance to close a window.</p>
  `;

win.append(content, status);
return win;
}

export function bootstrapDemoTool() {
const root = ensureDesktopRoot();
const commands = new CommandRegistry();

commands.register({
id: "tool.new",
run: () => {
root.append(buildDemoWindow(commands));
}
});

commands.register({
id: "tool.close",
run: ({ window }) => {
window?.close();
}
});

commands.register({
id: "tool.spawn",
run: () => {
root.append(buildDemoWindow(commands));
}
});

commands.register({
id: "tool.about",
run: () => {
root.append(buildAboutWindow());
}
});

root.append(buildDemoWindow(commands));
return root;
}

if (typeof window !== "undefined") {
window.AwwBookmarklet = {
bootstrapDemoTool,
ensureDesktopRoot
};
}

__FILE::src/demo/catalog.js
import "../components/register-all.js";
import { ensureDesktopRoot } from "../components/desktop-root.js";
import { TAGS } from "../core/constants.js";
import { bootstrapDemoTool } from "../bookmarklet/index.js";

function iconSvg(path) {
return `     <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">
      ${path}     </svg>
  `;
}

function buildCard(title, description) {
const card = document.createElement("section");
card.style.background = "rgba(255,255,255,0.08)";
card.style.border = "1px solid rgba(255,255,255,0.18)";
card.style.padding = "16px";
card.style.backdropFilter = "blur(4px)";
card.style.marginBottom = "16px";
card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.18)";
card.innerHTML = `     <h2 style="margin:0 0 8px; font-size:18px;">${title}</h2>     <p style="margin:0 0 14px; opacity:0.9;">${description}</p>
  `;
return card;
}

function buildDemoSurface() {
const container = document.createElement("div");
container.style.display = "grid";
container.style.gridTemplateColumns = "repeat(auto-fit, minmax(320px, 1fr))";
container.style.gap = "16px";
return container;
}

function createCatalog() {
const root = document.getElementById("catalog-root") || document.body;
const surface = buildDemoSurface();

const introCard = buildCard(
"Desktop shell",
"Spawn live floating windows on a singleton bookmarklet desktop root."
);

const introActions = document.createElement("div");
introActions.style.display = "flex";
introActions.style.gap = "10px";
introActions.style.flexWrap = "wrap";
introActions.innerHTML = `     <awwbookmarklet-button id="openShell">Open demo shell</awwbookmarklet-button>     <awwbookmarklet-button id="openEmptyWindow">Open blank window</awwbookmarklet-button>
  `;
introCard.appendChild(introActions);

const controlsCard = buildCard(
"Controls",
"Core controls for utility interfaces."
);
controlsCard.innerHTML += `     <div style="display:grid; gap:12px;">       <div style="display:flex; gap:8px; flex-wrap:wrap;">         <awwbookmarklet-button>Primary</awwbookmarklet-button>         <awwbookmarklet-button disabled>Disabled</awwbookmarklet-button>         <awwbookmarklet-icon-button aria-label="Add">
          ${iconSvg('<path d="M8 3v10M3 8h10" />')}         </awwbookmarklet-icon-button>       </div>       <div style="display:grid; gap:8px; max-width:320px;">         <awwbookmarklet-input value="Sample input"></awwbookmarklet-input>         <awwbookmarklet-textarea rows="5" value="Sample multiline text."></awwbookmarklet-textarea>       </div>     </div>
  `;

const tabsCard = buildCard(
"Tabs and listbox",
"Keyboard-aware navigation primitives for small tools."
);
tabsCard.innerHTML += `     <awwbookmarklet-tabs>       <awwbookmarklet-tab-panel label="One" selected>         <p style="margin:0 0 12px;">First tab panel content.</p>       </awwbookmarklet-tab-panel>       <awwbookmarklet-tab-panel label="Two">         <awwbookmarklet-listbox>           <div role="option" aria-selected="true">First item</div>           <div role="option">Second item</div>           <div role="option">Third item</div>           <div role="option">Fourth item</div>         </awwbookmarklet-listbox>       </awwbookmarklet-tab-panel>     </awwbookmarklet-tabs>
  `;

const menuCard = buildCard(
"Menu bar",
"Menubar and menu behavior with pointer and keyboard support."
);
menuCard.innerHTML += ` <div style="position:relative; display:inline-block; min-width:280px;"> <awwbookmarklet-menubar id="inlineMenubar"> <button type="button" data-menu="file">File</button> <button type="button" data-menu="edit">Edit</button>

```
    <awwbookmarklet-menu name="file">
      <button type="button">New</button>
      <button type="button">Close</button>
    </awwbookmarklet-menu>

    <awwbookmarklet-menu name="edit">
      <button type="button">Copy</button>
      <button type="button">Paste</button>
    </awwbookmarklet-menu>
  </awwbookmarklet-menubar>
</div>
```

`;

const statusCard = buildCard(
"Status bar",
"Compact structural footer for tool feedback."
);
statusCard.innerHTML += `     <awwbookmarklet-statusbar>       <span>Ready</span>       <span>3 items</span>       <span>No errors</span>     </awwbookmarklet-statusbar>
  `;

surface.append(introCard, controlsCard, tabsCard, menuCard, statusCard);
root.appendChild(surface);

introCard.querySelector("#openShell")?.addEventListener("click", () => {
bootstrapDemoTool();
});

introCard.querySelector("#openEmptyWindow")?.addEventListener("click", () => {
const desktop = ensureDesktopRoot();
const win = document.createElement(TAGS.window);
win.setAttribute("title", "Blank Window");
win.setRect({ x: 96, y: 96, width: 420, height: 240 });

```
const status = document.createElement(TAGS.statusbar);
status.slot = "statusbar";
status.innerHTML = `<span>Blank shell</span>`;

const body = document.createElement("div");
body.innerHTML = `
  <p>This window proves the shell can be spawned independently.</p>
  <p>Drag, resize, focus, and close it.</p>
`;

win.append(body, status);
desktop.append(win);
```

});
}

createCatalog();

```
::contentReference[oaicite:3]{index=3}
```

[1]: https://www.npmjs.com/package/lit?utm_source=chatgpt.com "lit"
[2]: https://developer.apple.com/design/human-interface-guidelines/materials?utm_source=chatgpt.com "Materials | Apple Developer Documentation"

