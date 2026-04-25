// src/core/constants.js
var FRAMEWORK_VERSION = "0.1.0";
var TAGS = {
  desktopRoot: "awwbookmarklet-desktop-root",
  window: "awwbookmarklet-window",
  menubar: "awwbookmarklet-menubar",
  menu: "awwbookmarklet-menu",
  button: "awwbookmarklet-button",
  iconButton: "awwbookmarklet-icon-button",
  input: "awwbookmarklet-input",
  textarea: "awwbookmarklet-textarea",
  checkbox: "awwbookmarklet-checkbox",
  radio: "awwbookmarklet-radio",
  select: "awwbookmarklet-select",
  range: "awwbookmarklet-range",
  progress: "awwbookmarklet-progress",
  tabs: "awwbookmarklet-tabs",
  tabPanel: "awwbookmarklet-tab-panel",
  listbox: "awwbookmarklet-listbox",
  group: "awwbookmarklet-group",
  panel: "awwbookmarklet-panel",
  statusbar: "awwbookmarklet-statusbar",
  appShell: "awwbookmarklet-app-shell",
  toolbar: "awwbookmarklet-toolbar",
  field: "awwbookmarklet-field",
  statusLine: "awwbookmarklet-status-line",
  alert: "awwbookmarklet-alert",
  dialog: "awwbookmarklet-dialog",
  toast: "awwbookmarklet-toast",
  emptyState: "awwbookmarklet-empty-state",
  stateOverlay: "awwbookmarklet-state-overlay",
  list: "awwbookmarklet-list",
  listItem: "awwbookmarklet-list-item",
  card: "awwbookmarklet-card",
  richPreview: "awwbookmarklet-rich-preview",
  browserPanel: "awwbookmarklet-browser-panel",
  manualCopy: "awwbookmarklet-manual-copy",
  commandPalette: "awwbookmarklet-command-palette",
  shortcutHelp: "awwbookmarklet-shortcut-help",
  urlPicker: "awwbookmarklet-url-picker",
  metricCard: "awwbookmarklet-metric-card"
};
var GLOBAL_SYMBOLS = {
  rootsByVersion: Symbol.for("awwtools.bookmarkletUi.overlayRootsByVersion"),
  lastAcquiredRoot: Symbol.for("awwtools.bookmarkletUi.lastAcquiredRoot"),
  version: Symbol.for("awwtools.bookmarkletUi.frameworkVersion")
};
var ROOT_Z_INDEX = 2147481000;
var PUBLIC_TOKENS = {
  workspaceBg: "--awwbookmarklet-workspace-bg",
  windowBg: "--awwbookmarklet-window-bg",
  panelBg: "--awwbookmarklet-panel-bg",
  titlebarActiveBg: "--awwbookmarklet-titlebar-active-bg",
  titlebarInactiveBg: "--awwbookmarklet-titlebar-inactive-bg",
  titlebarFg: "--awwbookmarklet-titlebar-fg",
  borderStrong: "--awwbookmarklet-border-strong",
  borderSubtle: "--awwbookmarklet-border-subtle",
  focusRing: "--awwbookmarklet-focus-ring",
  buttonBg: "--awwbookmarklet-button-bg",
  buttonFg: "--awwbookmarklet-button-fg",
  buttonActiveBg: "--awwbookmarklet-button-active-bg",
  inputBg: "--awwbookmarklet-input-bg",
  inputFg: "--awwbookmarklet-input-fg",
  menuBg: "--awwbookmarklet-menu-bg",
  menuFg: "--awwbookmarklet-menu-fg",
  selectionBg: "--awwbookmarklet-selection-bg",
  selectionFg: "--awwbookmarklet-selection-fg",
  statusbarBg: "--awwbookmarklet-statusbar-bg",
  appShellBg: "--awwbookmarklet-app-shell-bg",
  surfaceRaisedBg: "--awwbookmarklet-surface-raised-bg",
  surfaceInsetBg: "--awwbookmarklet-surface-inset-bg",
  textMuted: "--awwbookmarklet-text-muted",
  textHelp: "--awwbookmarklet-text-help",
  dividerColor: "--awwbookmarklet-divider-color",
  infoBg: "--awwbookmarklet-info-bg",
  infoFg: "--awwbookmarklet-info-fg",
  infoBorder: "--awwbookmarklet-info-border",
  successBg: "--awwbookmarklet-success-bg",
  successFg: "--awwbookmarklet-success-fg",
  successBorder: "--awwbookmarklet-success-border",
  warningBg: "--awwbookmarklet-warning-bg",
  warningFg: "--awwbookmarklet-warning-fg",
  warningBorder: "--awwbookmarklet-warning-border",
  dangerBg: "--awwbookmarklet-danger-bg",
  dangerFg: "--awwbookmarklet-danger-fg",
  dangerBorder: "--awwbookmarklet-danger-border",
  overlayBackdrop: "--awwbookmarklet-overlay-backdrop",
  overlayShadow: "--awwbookmarklet-overlay-shadow",
  cardBg: "--awwbookmarklet-card-bg",
  cardSelectedBg: "--awwbookmarklet-card-selected-bg",
  metricBg: "--awwbookmarklet-metric-bg",
  codeBg: "--awwbookmarklet-code-bg",
  codeFg: "--awwbookmarklet-code-fg",
  shadowDepth: "--awwbookmarklet-shadow-depth",
  frostOpacity: "--awwbookmarklet-frost-opacity",
  space1: "--awwbookmarklet-space-1",
  space2: "--awwbookmarklet-space-2",
  space3: "--awwbookmarklet-space-3",
  controlHeight: "--awwbookmarklet-size-control-h",
  titleHeight: "--awwbookmarklet-size-title-h"
};
var DEFAULT_GEOMETRY = {
  minWidth: 320,
  minHeight: 200,
  minVisibleTitlebar: 36,
  spawnWidth: 520,
  spawnHeight: 420,
  spawnX: 60,
  spawnY: 60,
  cascadeStep: 28
};

// src/core/define.js
function defineOnce(tagName, ctor) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ctor);
  }
}
function defineMany(definitions) {
  for (const [tagName, ctor] of definitions) {
    defineOnce(tagName, ctor);
  }
}

// src/core/styles.js
var canAdoptSheets = typeof ShadowRoot !== "undefined" && "adoptedStyleSheets" in ShadowRoot.prototype && typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype;
var sheetCache = new Map;
var textCache = new Map;
function hashStyle(text) {
  let hash = 0;
  for (let i = 0;i < text.length; i += 1) {
    hash = hash * 31 + text.charCodeAt(i) | 0;
  }
  return `s${Math.abs(hash)}`;
}
function getSheet(text) {
  let sheet = sheetCache.get(text);
  if (!sheet) {
    sheet = new CSSStyleSheet;
    sheet.replaceSync(text);
    sheetCache.set(text, sheet);
  }
  return sheet;
}
function ensureStyleTag(shadowRoot, text) {
  const key = hashStyle(text);
  if (shadowRoot.querySelector(`style[data-aww-style='${key}']`))
    return;
  const style = document.createElement("style");
  style.dataset.awwStyle = key;
  style.textContent = text;
  shadowRoot.append(style);
}
function adoptStyles(shadowRoot, styleTexts) {
  if (canAdoptSheets) {
    const adopted = shadowRoot.adoptedStyleSheets;
    const next = [...adopted];
    for (const text of styleTexts) {
      const sheet = getSheet(text);
      if (!next.includes(sheet))
        next.push(sheet);
    }
    shadowRoot.adoptedStyleSheets = next;
    return;
  }
  for (const text of styleTexts)
    ensureStyleTag(shadowRoot, text);
}
function css(strings, ...values) {
  let output = "";
  for (let i = 0;i < strings.length; i += 1) {
    output += strings[i];
    if (i < values.length)
      output += String(values[i] ?? "");
  }
  if (!textCache.has(output))
    textCache.set(output, output);
  return textCache.get(output);
}
var BASE_COMPONENT_STYLES = css`
  @layer reset, tokens, base, components, states, utilities;

  @layer reset {
    :host {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      color: var(--awwbookmarklet-input-fg, #111720);
      text-rendering: optimizeLegibility;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
  }

  @layer base {
    :host([hidden]) {
      display: none !important;
    }

    :host {
      --_ring: 0 0 0 2px var(--awwbookmarklet-focus-ring, #154fbc);
    }

    ::selection {
      background: var(--awwbookmarklet-selection-bg, #1f5eae);
      color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    }
  }
`;

// src/components/desktop-root.js
var DESKTOP_ROOT_STYLES = css`
  :host {
    position: fixed;
    inset: 0;
    z-index: ${ROOT_Z_INDEX};
    pointer-events: none;
    display: block;
    contain: layout style;
    background: var(--awwbookmarklet-workspace-bg, transparent);
  }

  #layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  ::slotted(awwbookmarklet-window),
  ::slotted(awwbookmarklet-menubar),
  ::slotted(awwbookmarklet-menu) {
    pointer-events: auto;
  }
`;

class AwwDesktopRoot extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, DESKTOP_ROOT_STYLES]);
    shadow.innerHTML = `
      <div id="layer" part="layer">
        <slot></slot>
      </div>
    `;
  }
}

// src/core/geometry.js
function getViewportRect() {
  if (window.visualViewport) {
    return {
      x: window.visualViewport.offsetLeft,
      y: window.visualViewport.offsetTop,
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }
  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
  };
}
function clampRect(rect, viewport = getViewportRect(), options = DEFAULT_GEOMETRY) {
  const minWidth = options.minWidth ?? DEFAULT_GEOMETRY.minWidth;
  const minHeight = options.minHeight ?? DEFAULT_GEOMETRY.minHeight;
  const minVisibleTitlebar = options.minVisibleTitlebar ?? DEFAULT_GEOMETRY.minVisibleTitlebar;
  const effectiveMinWidth = Math.min(minWidth, viewport.width);
  const effectiveMinHeight = Math.min(minHeight, viewport.height);
  const width = Math.max(effectiveMinWidth, Math.min(rect.width, viewport.width));
  const height = Math.max(effectiveMinHeight, Math.min(rect.height, viewport.height));
  const maxX = viewport.x + viewport.width - minVisibleTitlebar;
  const minX = viewport.x - width + minVisibleTitlebar;
  const maxY = viewport.y + viewport.height - minVisibleTitlebar;
  const x = Math.min(Math.max(rect.x, minX), maxX);
  const y = Math.min(Math.max(rect.y, viewport.y), maxY);
  return { x, y, width, height };
}
function clampSize(value, min, max) {
  return Math.max(Math.min(min, max), Math.min(value, max));
}
function resizeRectFromEdges(startRect, edge, dx, dy, viewport = getViewportRect(), options = DEFAULT_GEOMETRY) {
  const minWidth = options.minWidth ?? DEFAULT_GEOMETRY.minWidth;
  const minHeight = options.minHeight ?? DEFAULT_GEOMETRY.minHeight;
  const effectiveMinWidth = Math.min(minWidth, viewport.width);
  const effectiveMinHeight = Math.min(minHeight, viewport.height);
  const right = startRect.x + startRect.width;
  const bottom = startRect.y + startRect.height;
  let x = startRect.x;
  let y = startRect.y;
  let width = startRect.width;
  let height = startRect.height;
  if (edge.includes("e"))
    width = clampSize(startRect.width + dx, effectiveMinWidth, viewport.width);
  if (edge.includes("s"))
    height = clampSize(startRect.height + dy, effectiveMinHeight, viewport.height);
  if (edge.includes("w")) {
    width = clampSize(startRect.width - dx, effectiveMinWidth, viewport.width);
    x = right - width;
  }
  if (edge.includes("n")) {
    height = clampSize(startRect.height - dy, effectiveMinHeight, viewport.height);
    y = bottom - height;
  }
  return clampRect({ x, y, width, height }, viewport, options);
}
function getSpawnRect(index = 0, viewport = getViewportRect(), options = DEFAULT_GEOMETRY) {
  const width = Math.min(options.spawnWidth, viewport.width - 12);
  const height = Math.min(options.spawnHeight, viewport.height - 12);
  const proposed = {
    x: viewport.x + options.spawnX + index * options.cascadeStep,
    y: viewport.y + options.spawnY + index * options.cascadeStep,
    width,
    height
  };
  return clampRect(proposed, viewport, options);
}
function rectToStyle(rect) {
  return {
    left: `${Math.round(rect.x)}px`,
    top: `${Math.round(rect.y)}px`,
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`
  };
}

// src/components/window.js
var WINDOW_STYLES = css`
  :host {
    position: fixed;
    display: block;
    pointer-events: auto;
    contain: layout style;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 12px 32px rgba(0, 0, 0, 0.18));
    border-radius: 0;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    color: var(--awwbookmarklet-input-fg, #111720);
    will-change: transform;
  }

  :host([data-active="false"]) {
    filter: saturate(0.88);
  }

  .shell {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: auto auto auto 1fr auto;
  }

  .titlebar {
    min-height: var(--awwbookmarklet-size-title-h, 32px);
    display: grid;
    grid-template-columns: 28px 1fr auto;
    align-items: center;
    gap: 6px;
    padding: 0 6px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--awwbookmarklet-titlebar-active-bg, rgba(46, 92, 142, 0.78)) 88%, #ffffff 12%),
      color-mix(in srgb, var(--awwbookmarklet-titlebar-active-bg, rgba(46, 92, 142, 0.78)) calc(var(--awwbookmarklet-frost-opacity, 0.9) * 100%), transparent)
    );
    color: var(--awwbookmarklet-titlebar-fg, #f8fbff);
    border-bottom: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    backdrop-filter: blur(6px) saturate(1.1);
    cursor: grab;
    user-select: none;
  }

  :host([data-active="false"]) .titlebar {
    background: var(--awwbookmarklet-titlebar-inactive-bg, rgba(136, 145, 160, 0.84));
  }

  .system-menu-button,
  .window-command-button {
    border: 1px solid color-mix(in srgb, var(--awwbookmarklet-border-strong, #232a33) 70%, #ffffff 30%);
    border-radius: 0;
    background: rgba(255, 255, 255, 0.08);
    color: inherit;
    height: 22px;
    min-width: 22px;
    padding: 0 4px;
    font: inherit;
    line-height: 1;
  }

  .system-menu-button:focus-visible,
  .window-command-button:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .system-menu-button:active,
  .window-command-button:active {
    background: rgba(0, 0, 0, 0.18);
  }

  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .title-commands {
    display: flex;
    gap: 4px;
  }

  .region {
    display: block;
    border-bottom: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
  }

  .region[hidden] {
    display: none;
  }

  .body {
    overflow: auto;
    padding: var(--awwbookmarklet-space-3, 12px);
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    min-height: 0;
  }

  .status {
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-bottom: 0;
  }

  .resize-handle {
    position: absolute;
    pointer-events: auto;
  }

  .resize-handle[data-edge="n"] { inset: -4px 8px auto; height: 8px; cursor: ns-resize; }
  .resize-handle[data-edge="s"] { inset: auto 8px -4px; height: 8px; cursor: ns-resize; }
  .resize-handle[data-edge="e"] { inset: 8px -4px 8px auto; width: 8px; cursor: ew-resize; }
  .resize-handle[data-edge="w"] { inset: 8px auto 8px -4px; width: 8px; cursor: ew-resize; }
  .resize-handle[data-edge="ne"] { inset: -4px -4px auto auto; width: 10px; height: 10px; cursor: nesw-resize; }
  .resize-handle[data-edge="nw"] { inset: -4px auto auto -4px; width: 10px; height: 10px; cursor: nwse-resize; }
  .resize-handle[data-edge="se"] { inset: auto -4px -4px auto; width: 10px; height: 10px; cursor: nwse-resize; }
  .resize-handle[data-edge="sw"] { inset: auto auto -4px -4px; width: 10px; height: 10px; cursor: nesw-resize; }
`;
function closestEdge(handle) {
  return handle?.dataset?.edge || "";
}
function isPrimaryButton(event) {
  return event.button === 0;
}

class AwwWindow extends HTMLElement {
  static observedAttributes = ["title", "closable"];
  #rect = null;
  #manager = null;
  #drag = null;
  #resize = null;
  #raf = 0;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, WINDOW_STYLES]);
    shadow.innerHTML = `
      <div class="shell" part="shell" role="dialog" aria-label="Bookmarklet window">
        <div class="titlebar" part="titlebar">
          <button class="system-menu-button" part="system-menu-button" type="button" aria-label="System menu">◫</button>
          <div class="title" part="title"></div>
          <div class="title-commands" part="title-commands">
            <button class="window-command-button close" part="close-button" type="button" aria-label="Close">×</button>
          </div>
        </div>
        <div class="region menubar" part="menubar-region" hidden><slot name="menubar"></slot></div>
        <div class="region toolbar" part="toolbar-region" hidden><slot name="toolbar"></slot></div>
        <div class="body" part="body"><slot></slot></div>
        <div class="region status" part="statusbar-region" hidden><slot name="statusbar"></slot></div>

        <div class="resize-handle" data-edge="n"></div>
        <div class="resize-handle" data-edge="s"></div>
        <div class="resize-handle" data-edge="e"></div>
        <div class="resize-handle" data-edge="w"></div>
        <div class="resize-handle" data-edge="ne"></div>
        <div class="resize-handle" data-edge="nw"></div>
        <div class="resize-handle" data-edge="se"></div>
        <div class="resize-handle" data-edge="sw"></div>
      </div>
    `;
    this.#bindInteractions();
  }
  connectedCallback() {
    if (!this.#rect) {
      this.#rect = { x: 72, y: 72, width: 520, height: 420 };
      this.#applyRect(this.#rect);
    }
    this.setAttribute("data-active", this.getAttribute("data-active") ?? "true");
    this.#syncTitle();
    this.#syncClosable();
    this.#syncSlots();
    const root = this.closest("awwbookmarklet-desktop-root");
    this.#manager = root?.__awwManager ?? null;
    this.#manager?.register(this);
    this.addEventListener("pointerdown", this.#onPointerDownHost);
  }
  disconnectedCallback() {
    this.#manager?.unregister(this);
    this.#manager = null;
    this.removeEventListener("pointerdown", this.#onPointerDownHost);
    this.#teardownPointerFlow();
    this.dispatchEvent(new CustomEvent("awwbookmarklet-window-disconnected"));
  }
  attributeChangedCallback(name) {
    if (name === "title")
      this.#syncTitle();
    if (name === "closable")
      this.#syncClosable();
  }
  getRect() {
    return this.#rect ? { ...this.#rect } : null;
  }
  setRect(nextRect) {
    this.#rect = clampRect(nextRect);
    this.#applyRect(this.#rect);
  }
  setActive(isActive) {
    this.setAttribute("data-active", String(Boolean(isActive)));
  }
  setZIndex(zIndex) {
    this.style.zIndex = String(zIndex);
  }
  requestClose() {
    if (!this.isClosable())
      return;
    const allowed = this.dispatchEvent(new CustomEvent("awwbookmarklet-window-close-request", { bubbles: true, composed: true, cancelable: true }));
    if (!allowed)
      return;
    this.remove();
    this.dispatchEvent(new CustomEvent("awwbookmarklet-window-closed", { bubbles: true, composed: true }));
  }
  isClosable() {
    const raw = this.getAttribute("closable");
    return raw === null ? true : raw !== "false";
  }
  #bindInteractions() {
    const shadow = this.shadowRoot;
    const titlebar = shadow.querySelector(".titlebar");
    const systemButton = shadow.querySelector(".system-menu-button");
    const closeButton = shadow.querySelector(".close");
    titlebar.addEventListener("pointerdown", this.#onPointerDownTitlebar);
    systemButton.addEventListener("click", this.#onSystemClick);
    systemButton.addEventListener("dblclick", this.#onSystemDoubleClick);
    systemButton.addEventListener("keydown", this.#onSystemKeyDown);
    closeButton.addEventListener("click", () => this.requestClose());
    for (const handle of shadow.querySelectorAll(".resize-handle")) {
      handle.addEventListener("pointerdown", this.#onPointerDownResize);
    }
    for (const slotName of ["menubar", "toolbar", "statusbar"]) {
      const slot = shadow.querySelector(`slot[name='${slotName}']`);
      slot.addEventListener("slotchange", () => this.#syncSlots());
    }
  }
  #syncTitle() {
    const title = this.getAttribute("title") || "AWW Tool";
    this.shadowRoot.querySelector(".title").textContent = title;
    this.shadowRoot.querySelector(".shell").setAttribute("aria-label", title);
  }
  #syncClosable() {
    this.shadowRoot.querySelector(".close").disabled = !this.isClosable();
  }
  #syncSlots() {
    const shadow = this.shadowRoot;
    const hasContent = (name) => shadow.querySelector(`slot[name='${name}']`).assignedElements({ flatten: true }).length > 0;
    shadow.querySelector(".menubar").hidden = !hasContent("menubar");
    shadow.querySelector(".toolbar").hidden = !hasContent("toolbar");
    shadow.querySelector(".status").hidden = !hasContent("statusbar");
  }
  #applyRect(rect) {
    Object.assign(this.style, rectToStyle(rect));
  }
  #onPointerDownHost = () => {
    this.#manager?.focus(this);
  };
  #onSystemClick = (event) => {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("awwbookmarklet-window-system-menu", {
      bubbles: true,
      composed: true,
      detail: { anchor: this.shadowRoot.querySelector(".system-menu-button") }
    }));
  };
  #onSystemDoubleClick = (event) => {
    event.stopPropagation();
    this.requestClose();
  };
  #onSystemKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.#onSystemClick(event);
    }
  };
  #onPointerDownTitlebar = (event) => {
    if (!isPrimaryButton(event))
      return;
    if (event.target.closest("button"))
      return;
    event.preventDefault();
    this.#manager?.focus(this);
    this.#drag = {
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startRect: this.getRect(),
      pointerId: event.pointerId,
      target: event.currentTarget
    };
    this.shadowRoot.querySelector(".titlebar").style.cursor = "grabbing";
    this.#attachPointerFlow(event.currentTarget, event.pointerId);
  };
  #onPointerDownResize = (event) => {
    if (!isPrimaryButton(event))
      return;
    event.preventDefault();
    const edge = closestEdge(event.currentTarget);
    if (!edge)
      return;
    this.#manager?.focus(this);
    this.#resize = {
      edge,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startRect: this.getRect(),
      previewRect: this.getRect(),
      pointerId: event.pointerId,
      target: event.currentTarget
    };
    this.#attachPointerFlow(event.currentTarget, event.pointerId);
  };
  #attachPointerFlow(target, pointerId) {
    try {
      target.setPointerCapture?.(pointerId);
    } catch {}
    window.addEventListener("pointermove", this.#onPointerMove, { passive: true });
    window.addEventListener("pointerup", this.#onPointerUp);
    window.addEventListener("pointercancel", this.#onPointerUp);
  }
  #teardownPointerFlow() {
    const pointerState = this.#drag || this.#resize;
    window.removeEventListener("pointermove", this.#onPointerMove);
    window.removeEventListener("pointerup", this.#onPointerUp);
    window.removeEventListener("pointercancel", this.#onPointerUp);
    if (pointerState?.target?.hasPointerCapture?.(pointerState.pointerId)) {
      try {
        pointerState.target.releasePointerCapture(pointerState.pointerId);
      } catch {}
    }
    if (this.#raf) {
      cancelAnimationFrame(this.#raf);
      this.#raf = 0;
    }
    this.style.transform = "";
    this.shadowRoot.querySelector(".titlebar").style.cursor = "grab";
  }
  #onPointerMove = (event) => {
    if (this.#drag) {
      if (event.pointerId !== this.#drag.pointerId)
        return;
      this.#drag.currentX = event.clientX;
      this.#drag.currentY = event.clientY;
      this.#scheduleFrame();
      return;
    }
    if (this.#resize) {
      if (event.pointerId !== this.#resize.pointerId)
        return;
      this.#resize.currentX = event.clientX;
      this.#resize.currentY = event.clientY;
      this.#scheduleFrame();
    }
  };
  #onPointerUp = (event) => {
    const pointerState = this.#drag || this.#resize;
    if (pointerState && event.pointerId !== pointerState.pointerId)
      return;
    if (pointerState?.target?.hasPointerCapture?.(pointerState.pointerId)) {
      try {
        pointerState.target.releasePointerCapture(pointerState.pointerId);
      } catch {}
    }
    if (this.#drag) {
      const dx = this.#drag.currentX - this.#drag.startX;
      const dy = this.#drag.currentY - this.#drag.startY;
      this.style.transform = "";
      this.setRect({
        ...this.#drag.startRect,
        x: this.#drag.startRect.x + dx,
        y: this.#drag.startRect.y + dy
      });
      this.#drag = null;
    }
    if (this.#resize) {
      this.style.transform = "";
      this.setRect(this.#resize.previewRect);
      this.#resize = null;
    }
    this.#teardownPointerFlow();
  };
  #scheduleFrame() {
    if (this.#raf)
      return;
    this.#raf = requestAnimationFrame(() => {
      this.#raf = 0;
      if (this.#drag)
        this.#flushDragFrame();
      if (this.#resize)
        this.#flushResizeFrame();
    });
  }
  #flushDragFrame() {
    const dx = this.#drag.currentX - this.#drag.startX;
    const dy = this.#drag.currentY - this.#drag.startY;
    this.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }
  #flushResizeFrame() {
    const { edge, startRect, startX, startY, currentX, currentY } = this.#resize;
    const dx = currentX - startX;
    const dy = currentY - startY;
    const previewRect = resizeRectFromEdges(startRect, edge, dx, dy);
    this.#resize.previewRect = previewRect;
    Object.assign(this.style, rectToStyle(previewRect));
  }
}

// src/core/commands.js
class CommandRegistry {
  #commands = new Map;
  register(command) {
    if (!command?.id || typeof command.run !== "function") {
      throw new TypeError("Command must include stable id and run(context)");
    }
    this.#commands.set(command.id, command);
    return () => this.#commands.delete(command.id);
  }
  has(id) {
    return this.#commands.has(id);
  }
  resolve(id) {
    return this.#commands.get(id) ?? null;
  }
  isEnabled(id, context = {}) {
    const command = this.resolve(id);
    if (!command)
      return false;
    return typeof command.isEnabled === "function" ? command.isEnabled(context) : true;
  }
  isChecked(id, context = {}) {
    const command = this.resolve(id);
    if (!command)
      return false;
    return typeof command.isChecked === "function" ? command.isChecked(context) : false;
  }
  run(id, context = {}) {
    const command = this.resolve(id);
    if (!command || !this.isEnabled(id, context))
      return false;
    command.run(context);
    return true;
  }
  toJSON(context = {}) {
    return [...this.#commands.values()].map((command) => ({
      id: command.id,
      label: command.label ?? command.id,
      shortcut: command.shortcut ?? "",
      enabled: typeof command.isEnabled === "function" ? command.isEnabled(context) : true,
      checked: typeof command.isChecked === "function" ? command.isChecked(context) : false
    }));
  }
}

// src/components/menubar.js
var MENUBAR_STYLES = css`
  :host {
    display: block;
    pointer-events: auto;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 85%, #d8dee7 15%);
    padding: 2px;
  }

  #bar {
    display: flex;
    gap: 2px;
    align-items: center;
    min-height: 28px;
  }

  ::slotted([data-menu]) {
    height: 24px;
    border: 1px solid transparent;
    background: transparent;
    font: inherit;
    padding: 0 8px;
    border-radius: 0;
    color: inherit;
  }

  ::slotted([data-menu]:focus-visible),
  ::slotted([data-menu][data-open="true"]),
  ::slotted([data-menu]:hover) {
    outline: none;
    border-color: var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
  }
`;

class AwwMenubar extends HTMLElement {
  #triggers = [];
  #menus = new Map;
  #wiredMenus = new WeakSet;
  #activeTrigger = -1;
  #openMenuName = "";
  #window = null;
  constructor() {
    super();
    this.commandRegistry = new CommandRegistry;
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MENUBAR_STYLES]);
    shadow.innerHTML = `<div id="bar" role="menubar" part="bar"><slot></slot></div>`;
    shadow.querySelector("slot").addEventListener("slotchange", () => this.#refresh());
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("click", this.#onClick);
  }
  connectedCallback() {
    this.#refresh();
    document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);
    this.#window = this.closest("awwbookmarklet-window");
    this.#window?.addEventListener("awwbookmarklet-window-system-menu", this.#onWindowSystemMenu);
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.#onDocumentPointerDown, true);
    this.#window?.removeEventListener("awwbookmarklet-window-system-menu", this.#onWindowSystemMenu);
    this.#window = null;
    this.closeAllMenus();
  }
  openFirstMenu() {
    if (!this.#triggers.length)
      return;
    this.#focusTrigger(0);
    this.#openFromTrigger(this.#triggers[0], true);
  }
  closeAllMenus() {
    for (const menu of this.#menus.values())
      menu.close();
    for (const trigger of this.#triggers)
      delete trigger.dataset.open;
    this.#openMenuName = "";
  }
  #refresh() {
    const children = [...this.children];
    const openMenus = [...this.#menus.entries()].filter(([, menu]) => menu.isConnected && menu.parentNode !== this);
    this.#triggers = children.filter((node) => node.hasAttribute("data-menu"));
    this.#menus = new Map(openMenus);
    for (const menu of children.filter((node) => node.tagName.toLowerCase() === "awwbookmarklet-menu")) {
      const name = menu.getAttribute("name") || "";
      if (name) {
        this.#menus.set(name, menu);
        this.#wireMenu(menu);
      }
    }
    this.#triggers.forEach((trigger, index) => {
      trigger.setAttribute("role", "menuitem");
      trigger.tabIndex = index === this.#activeTrigger ? 0 : -1;
    });
    if (this.#triggers.length && this.#activeTrigger === -1)
      this.#focusTrigger(0);
  }
  #openFromTrigger(trigger, focusMenu = false) {
    const menuName = trigger.getAttribute("data-menu");
    const menu = this.#menus.get(menuName);
    if (!menu)
      return;
    this.closeAllMenus();
    trigger.dataset.open = "true";
    const overlayRoot = this.closest("awwbookmarklet-window")?.closest("awwbookmarklet-desktop-root");
    menu.portalTo(overlayRoot);
    menu.openAtViewportRect(trigger.getBoundingClientRect());
    this.#openMenuName = menuName;
    if (focusMenu)
      menu.focusFirst();
  }
  #focusTrigger(index) {
    if (!this.#triggers.length)
      return;
    this.#activeTrigger = (index + this.#triggers.length) % this.#triggers.length;
    this.#triggers.forEach((trigger, triggerIndex) => {
      trigger.tabIndex = triggerIndex === this.#activeTrigger ? 0 : -1;
    });
    this.#triggers[this.#activeTrigger].focus();
  }
  #moveTrigger(step) {
    this.#focusTrigger(this.#activeTrigger + step);
    if (this.#openMenuName) {
      const trigger = this.#triggers[this.#activeTrigger];
      this.#openFromTrigger(trigger, true);
    }
  }
  #onClick = (event) => {
    const trigger = event.target.closest("[data-menu]");
    if (!trigger || !this.contains(trigger))
      return;
    const alreadyOpen = trigger.dataset.open === "true";
    if (alreadyOpen) {
      this.closeAllMenus();
      return;
    }
    this.#focusTrigger(this.#triggers.indexOf(trigger));
    this.#openFromTrigger(trigger, true);
  };
  #onKeyDown = (event) => {
    if (!this.#triggers.length)
      return;
    if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
      event.preventDefault();
      this.#moveTrigger(event.key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      this.#openFromTrigger(this.#triggers[this.#activeTrigger], true);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeAllMenus();
    }
  };
  #onDismissMenu = () => {
    this.closeAllMenus();
    if (this.#activeTrigger >= 0)
      this.#triggers[this.#activeTrigger]?.focus();
  };
  #onDocumentPointerDown = (event) => {
    const target = event.target;
    const insideMenu = [...this.#menus.values()].some((menu) => menu.contains(target));
    if (!this.contains(target) && !insideMenu)
      this.closeAllMenus();
  };
  #onRunCommand = (event) => {
    const commandId = event.detail?.commandId;
    if (!commandId)
      return;
    this.commandRegistry.run(commandId, {
      menubar: this,
      trigger: event.detail.source
    });
  };
  #onWindowSystemMenu = () => {
    this.openFirstMenu();
  };
  #wireMenu(menu) {
    if (this.#wiredMenus.has(menu))
      return;
    this.#wiredMenus.add(menu);
    menu.addEventListener("awwbookmarklet-menu-dismiss", this.#onDismissMenu);
    menu.addEventListener("awwbookmarklet-menu-select", this.#onDismissMenu);
    menu.addEventListener("awwbookmarklet-command", this.#onRunCommand);
  }
}

// src/components/menu.js
var MENU_STYLES = css`
  :host {
    position: fixed;
    display: none;
    min-width: 200px;
    pointer-events: auto;
    background: var(--awwbookmarklet-menu-bg, #f8fbff);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 10px 20px rgba(0, 0, 0, 0.18));
    padding: 4px;
    z-index: 999999;
  }

  :host([open]) { display: block; }

  #panel {
    display: grid;
    gap: 2px;
    max-height: min(60vh, 420px);
    overflow: auto;
  }

  ::slotted([data-separator]),
  ::slotted([role="separator"]) {
    display: block;
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    margin: 4px 2px;
    padding: 0;
    min-height: 0;
    height: 0;
  }

  ::slotted(button),
  ::slotted([role="menuitem"]) {
    height: 29px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    text-align: left;
    padding: 0 8px;
    font: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-radius: 0;
  }

  ::slotted(button:hover),
  ::slotted([role="menuitem"]:hover),
  ::slotted(button[data-highlighted="true"]),
  ::slotted([role="menuitem"][data-highlighted="true"]) {
    border-color: var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
  }

  ::slotted([disabled]),
  ::slotted([aria-disabled="true"]) {
    opacity: 0.5;
    pointer-events: none;
  }
`;
function isSeparator(node) {
  return node.hasAttribute("data-separator") || node.getAttribute("role") === "separator";
}
function isMenuItem(node) {
  return !isSeparator(node) && !node.hasAttribute("disabled") && node.getAttribute("aria-disabled") !== "true";
}

class AwwMenu extends HTMLElement {
  #activeIndex = -1;
  #typeahead = "";
  #typeaheadTimer = 0;
  #restoreParent = null;
  #restoreNextSibling = null;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MENU_STYLES]);
    shadow.innerHTML = `<div id="panel" part="panel" role="menu"><slot></slot></div>`;
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("click", this.#onClick);
    shadow.querySelector("slot").addEventListener("slotchange", () => this.#resetItems());
  }
  connectedCallback() {
    this.hidden = false;
    this.setAttribute("aria-hidden", this.hasAttribute("open") ? "false" : "true");
    this.#resetItems();
  }
  disconnectedCallback() {
    clearTimeout(this.#typeaheadTimer);
  }
  getItems() {
    return [...this.children].filter(isMenuItem);
  }
  portalTo(container) {
    if (!container || this.parentNode === container)
      return;
    if (!this.#restoreParent) {
      this.#restoreParent = this.parentNode;
      this.#restoreNextSibling = this.nextSibling;
    }
    container.append(this);
  }
  restorePortal() {
    if (!this.#restoreParent)
      return;
    const parent = this.#restoreParent;
    const nextSibling = this.#restoreNextSibling?.parentNode === parent ? this.#restoreNextSibling : null;
    this.#restoreParent = null;
    this.#restoreNextSibling = null;
    if (parent.isConnected)
      parent.insertBefore(this, nextSibling);
  }
  openAtViewportRect(anchorRect) {
    this.style.left = "-9999px";
    this.style.top = "-9999px";
    this.setAttribute("open", "");
    const width = Math.max(200, this.offsetWidth || 220);
    const viewport = window.visualViewport;
    const viewportX = viewport?.offsetLeft ?? 0;
    const viewportY = viewport?.offsetTop ?? 0;
    const viewportW = viewport?.width ?? window.innerWidth;
    const viewportH = viewport?.height ?? window.innerHeight;
    const menuHeight = this.offsetHeight || Math.min(viewportH * 0.5, 240);
    let left = anchorRect.left;
    let top = anchorRect.bottom + 2;
    if (left + width > viewportX + viewportW - 6)
      left = viewportX + viewportW - width - 6;
    if (top + menuHeight > viewportY + viewportH - 6)
      top = Math.max(viewportY + 6, anchorRect.top - menuHeight - 2);
    this.style.left = `${Math.max(viewportX + 6, left)}px`;
    this.style.top = `${Math.max(viewportY + 6, top)}px`;
    this.setAttribute("aria-hidden", "false");
    this.#activeIndex = -1;
  }
  close() {
    this.removeAttribute("open");
    this.setAttribute("aria-hidden", "true");
    this.#highlight(-1);
    this.restorePortal();
  }
  focusFirst() {
    const items = this.getItems();
    if (items.length === 0)
      return;
    this.#highlight(0);
    items[0].focus();
  }
  #resetItems() {
    for (const node of this.children) {
      if (isSeparator(node))
        continue;
      if (!node.hasAttribute("role"))
        node.setAttribute("role", "menuitem");
      node.tabIndex = -1;
    }
  }
  #onClick = (event) => {
    const target = event.target.closest("[role='menuitem']");
    if (!target || !isMenuItem(target))
      return;
    const command = target.getAttribute("data-command") || "";
    if (command) {
      this.dispatchEvent(new CustomEvent("awwbookmarklet-command", {
        bubbles: true,
        composed: true,
        detail: { commandId: command, source: target }
      }));
    }
    this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-select", { bubbles: true, composed: true }));
  };
  #onKeyDown = (event) => {
    const items = this.getItems();
    if (!items.length)
      return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (this.#activeIndex + 1 + items.length) % items.length;
      this.#highlight(next);
      items[next].focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = (this.#activeIndex - 1 + items.length) % items.length;
      this.#highlight(next);
      items[next].focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      this.#highlight(0);
      items[0].focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const last = items.length - 1;
      this.#highlight(last);
      items[last].focus();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-dismiss", { bubbles: true, composed: true }));
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key)) {
      this.#typeahead += event.key.toLowerCase();
      clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = setTimeout(() => {
        this.#typeahead = "";
      }, 450);
      const index = items.findIndex((item) => item.textContent.trim().toLowerCase().startsWith(this.#typeahead));
      if (index !== -1) {
        this.#highlight(index);
        items[index].focus();
      }
    }
    if (event.key === "Enter" || event.key === " ") {
      const target = items[this.#activeIndex];
      if (!target)
        return;
      event.preventDefault();
      target.click();
    }
  };
  #highlight(index) {
    const items = this.getItems();
    this.#activeIndex = index;
    items.forEach((item, itemIndex) => {
      if (itemIndex === index)
        item.dataset.highlighted = "true";
      else
        delete item.dataset.highlighted;
    });
  }
}

// src/components/button.js
var BUTTON_STYLES = css`
  :host { display: inline-block; }

  button {
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    min-width: 72px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: linear-gradient(180deg, color-mix(in srgb, var(--awwbookmarklet-button-bg, #f1f4f8) 92%, #ffffff 8%), var(--awwbookmarklet-button-bg, #f1f4f8));
    color: var(--awwbookmarklet-button-fg, #111720);
    padding: 0 12px;
    font: inherit;
    line-height: 1;
  }

  button:hover { background: color-mix(in srgb, var(--awwbookmarklet-button-bg, #f1f4f8) 86%, #ffffff 14%); }
  button:active { background: var(--awwbookmarklet-button-active-bg, #dbe3ee); }
  button:focus-visible { outline: none; box-shadow: var(--_ring); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }

  :host([variant="primary"]) button {
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
  }

  :host([variant="ghost"]) button {
    background: transparent;
  }

  :host([variant="link"]) button {
    min-width: 0;
    border-color: transparent;
    background: transparent;
    color: var(--awwbookmarklet-info-fg, #123d7a);
    text-decoration: underline;
    padding-inline: 4px;
  }

  :host([tone="danger"]) button {
    border-color: var(--awwbookmarklet-danger-border, #d46a60);
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  :host([tone="warning"]) button {
    border-color: var(--awwbookmarklet-warning-border, #d9ad3b);
    color: var(--awwbookmarklet-warning-fg, #6d4b00);
  }

  :host([tone="success"]) button {
    border-color: var(--awwbookmarklet-success-border, #72b98b);
    color: var(--awwbookmarklet-success-fg, #195b34);
  }

  :host([busy]) button {
    cursor: progress;
  }

  :host([pressed]) button {
    background: var(--awwbookmarklet-button-active-bg, #dbe3ee);
    box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.18);
  }
`;

class AwwButton extends HTMLElement {
  static observedAttributes = ["disabled", "busy", "pressed"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, BUTTON_STYLES]);
    shadow.innerHTML = `<button part="control" type="button"><slot></slot></button>`;
    this.control = shadow.querySelector("button");
    this.control.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.disabled || this.busy) {
        event.preventDefault();
        return;
      }
      const commandId = this.getAttribute("command");
      if (commandId) {
        this.dispatchEvent(new CustomEvent("awwbookmarklet-command-request", {
          bubbles: true,
          composed: true,
          detail: { commandId, source: this }
        }));
      }
      this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, cancelable: true }));
    });
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  get busy() {
    return this.hasAttribute("busy");
  }
  set busy(value) {
    this.toggleAttribute("busy", Boolean(value));
  }
  attributeChangedCallback() {
    this.control.disabled = this.disabled || this.busy;
    this.control.setAttribute("aria-pressed", this.hasAttribute("pressed") ? "true" : "false");
    this.control.setAttribute("aria-busy", this.busy ? "true" : "false");
  }
}

// src/components/icon-button.js
var ICON_BUTTON_STYLES = css`
  :host { display: inline-block; }

  button {
    width: var(--awwbookmarklet-size-control-h, 30px);
    height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    display: grid;
    place-items: center;
    padding: 0;
  }

  button:focus-visible { outline: none; box-shadow: var(--_ring); }
  button:active { background: var(--awwbookmarklet-button-active-bg, #dbe3ee); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }

  :host([tone="danger"]) button { border-color: var(--awwbookmarklet-danger-border, #d46a60); color: var(--awwbookmarklet-danger-fg, #8a1f17); }
  :host([tone="warning"]) button { border-color: var(--awwbookmarklet-warning-border, #d9ad3b); color: var(--awwbookmarklet-warning-fg, #6d4b00); }
  :host([tone="success"]) button { border-color: var(--awwbookmarklet-success-border, #72b98b); color: var(--awwbookmarklet-success-fg, #195b34); }
  :host([pressed]) button {
    background: var(--awwbookmarklet-button-active-bg, #dbe3ee);
    box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.18);
  }

  ::slotted(svg) {
    width: 16px;
    height: 16px;
    stroke-width: 1.5;
    stroke: currentColor;
    fill: none;
  }
`;

class AwwIconButton extends HTMLElement {
  static observedAttributes = ["disabled", "busy", "pressed", "label", "aria-label"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, ICON_BUTTON_STYLES]);
    shadow.innerHTML = `<button part="control" type="button"><slot></slot></button>`;
    this.control = shadow.querySelector("button");
    this.control.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.disabled || this.busy) {
        event.preventDefault();
        return;
      }
      const commandId = this.getAttribute("command");
      if (commandId) {
        this.dispatchEvent(new CustomEvent("awwbookmarklet-command-request", {
          bubbles: true,
          composed: true,
          detail: { commandId, source: this }
        }));
      }
      this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, cancelable: true }));
    });
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  get busy() {
    return this.hasAttribute("busy");
  }
  set busy(value) {
    this.toggleAttribute("busy", Boolean(value));
  }
  attributeChangedCallback() {
    this.control.disabled = this.disabled || this.busy;
    const label = this.getAttribute("label") || this.getAttribute("aria-label") || "";
    if (label)
      this.control.setAttribute("aria-label", label);
    this.control.setAttribute("aria-pressed", this.hasAttribute("pressed") ? "true" : "false");
    this.control.setAttribute("aria-busy", this.busy ? "true" : "false");
  }
}

// src/components/input.js
var INPUT_STYLES = css`
  :host { display: inline-block; min-width: 140px; }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled { opacity: 0.65; }
`;
var MIRRORED_ATTRIBUTES = ["value", "placeholder", "disabled", "type", "name", "required", "min", "max", "step", "autocomplete", "spellcheck"];

class AwwInput extends HTMLElement {
  static observedAttributes = MIRRORED_ATTRIBUTES;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, INPUT_STYLES]);
    shadow.innerHTML = `<input part="control" />`;
    this.control = shadow.querySelector("input");
    this.control.addEventListener("input", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    });
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  get value() {
    return this.control.value;
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }
    if (name === "required") {
      this.control.required = this.hasAttribute("required");
      return;
    }
    if (name === "value") {
      this.control.value = next ?? "";
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
}

// src/components/textarea.js
var TEXTAREA_STYLES = css`
  :host { display: inline-block; min-width: 220px; }

  textarea {
    width: 100%;
    min-height: 96px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 8px;
    font: inherit;
    resize: vertical;
  }

  textarea:focus-visible { outline: none; box-shadow: var(--_ring); }
  textarea:disabled { opacity: 0.65; }
`;
var MIRRORED_ATTRIBUTES2 = ["value", "placeholder", "disabled", "rows", "name", "required", "autocomplete", "spellcheck"];

class AwwTextarea extends HTMLElement {
  static observedAttributes = MIRRORED_ATTRIBUTES2;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TEXTAREA_STYLES]);
    shadow.innerHTML = `<textarea part="control"></textarea>`;
    this.control = shadow.querySelector("textarea");
    this.control.addEventListener("input", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    });
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  get value() {
    return this.control.value;
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }
    if (name === "required") {
      this.control.required = this.hasAttribute("required");
      return;
    }
    if (name === "value") {
      this.control.value = next ?? "";
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
}

// src/components/checkbox.js
var CHECKBOX_STYLES = css`
  :host { display: inline-block; }

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: 0;
    position: relative;
  }

  input:checked::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled + span { opacity: 0.6; }
`;
var MIRRORED = ["checked", "disabled", "name", "value"];

class AwwCheckbox extends HTMLElement {
  static observedAttributes = MIRRORED;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CHECKBOX_STYLES]);
    shadow.innerHTML = `<label><input type="checkbox" part="control" /><span part="label"><slot></slot></span></label>`;
    this.control = shadow.querySelector("input");
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.toggleAttribute("checked", this.control.checked);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    this.toggleAttribute("checked", Boolean(value));
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  get value() {
    return this.getAttribute("value") ?? "on";
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "checked") {
      this.control.checked = this.hasAttribute("checked");
      return;
    }
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
}

// src/components/radio.js
var RADIO_STYLES = css`
  :host { display: inline-block; }

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: 999px;
    position: relative;
  }

  input:checked::after {
    content: "";
    position: absolute;
    inset: 3px;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    border-radius: 999px;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled + span { opacity: 0.6; }
`;
var MIRRORED2 = ["checked", "disabled", "name", "value"];

class AwwRadio extends HTMLElement {
  static observedAttributes = MIRRORED2;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, RADIO_STYLES]);
    shadow.innerHTML = `<label><input type="radio" part="control" /><span part="label"><slot></slot></span></label>`;
    this.control = shadow.querySelector("input");
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.toggleAttribute("checked", this.control.checked);
      if (this.control.checked)
        this.#uncheckRadioGroupPeers();
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    this.toggleAttribute("checked", Boolean(value));
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  get value() {
    return this.getAttribute("value") ?? "on";
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "checked") {
      this.control.checked = this.hasAttribute("checked");
      if (this.control.checked)
        this.#uncheckRadioGroupPeers();
      return;
    }
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
  #uncheckRadioGroupPeers() {
    const name = this.getAttribute("name");
    if (!name)
      return;
    const root = this.getRootNode();
    const peers = root.querySelectorAll?.("awwbookmarklet-radio") ?? [];
    for (const peer of peers) {
      if (peer !== this && peer.getAttribute("name") === name)
        peer.removeAttribute("checked");
    }
  }
}

// src/components/select.js
var SELECT_STYLES = css`
  :host { display: inline-block; min-width: 160px; }

  .wrap { position: relative; }

  select {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 28px 0 8px;
    font: inherit;
    appearance: none;
  }

  .arrow {
    pointer-events: none;
    position: absolute;
    right: 8px;
    top: 50%;
    translate: 0 -50%;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid currentColor;
    opacity: 0.8;
  }

  select:focus-visible { outline: none; box-shadow: var(--_ring); }
  select:disabled { opacity: 0.65; }
`;
var MIRRORED3 = ["disabled", "name", "value", "required"];

class AwwSelect extends HTMLElement {
  static observedAttributes = MIRRORED3;
  #observer = null;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, SELECT_STYLES]);
    shadow.innerHTML = `<div class="wrap"><select part="control"></select><span class="arrow" aria-hidden="true"></span></div>`;
    this.control = shadow.querySelector("select");
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  connectedCallback() {
    this.#syncOptions();
    this.#observer = new MutationObserver(() => this.#syncOptions());
    this.#observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["selected", "disabled", "value"] });
  }
  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }
  get value() {
    return this.control.value;
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }
    if (name === "required") {
      this.control.required = this.hasAttribute("required");
      return;
    }
    if (name === "value") {
      this.control.value = next ?? "";
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
  #syncOptions() {
    const source = [...this.querySelectorAll("option")];
    this.control.textContent = "";
    for (const option of source) {
      const clone = document.createElement("option");
      clone.value = option.value;
      clone.textContent = option.textContent;
      clone.disabled = option.disabled;
      clone.selected = option.selected;
      this.control.append(clone);
    }
    const value = this.getAttribute("value");
    if (value !== null) {
      this.control.value = value;
    } else if (this.control.selectedIndex >= 0) {
      this.setAttribute("value", this.control.value);
    }
  }
}

// src/components/range.js
var RANGE_STYLES = css`
  :host { display: inline-block; min-width: 160px; }

  input[type="range"] {
    width: 100%;
    margin: 0;
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input[type="range"]:focus-visible { outline: none; box-shadow: var(--_ring); }
`;
var MIRRORED4 = ["min", "max", "step", "value", "disabled", "name"];

class AwwRange extends HTMLElement {
  static observedAttributes = MIRRORED4;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, RANGE_STYLES]);
    shadow.innerHTML = `<input type="range" part="control" />`;
    this.control = shadow.querySelector("input");
    this.control.addEventListener("input", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    });
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }
  get value() {
    return this.control.value;
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }
    if (name === "value") {
      this.control.value = next ?? "";
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
}

// src/components/progress.js
var PROGRESS_STYLES = css`
  :host { display: inline-block; min-width: 160px; }

  progress {
    width: 100%;
    height: 14px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }
`;
var MIRRORED5 = ["value", "max"];

class AwwProgress extends HTMLElement {
  static observedAttributes = MIRRORED5;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, PROGRESS_STYLES]);
    shadow.innerHTML = `<progress part="control"></progress>`;
    this.control = shadow.querySelector("progress");
  }
  get value() {
    return this.control.value;
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  get max() {
    return this.control.max;
  }
  set max(nextValue) {
    this.setAttribute("max", String(nextValue ?? ""));
  }
  attributeChangedCallback(name, _prev, next) {
    if (name === "value") {
      if (next === null)
        this.control.removeAttribute("value");
      else
        this.control.value = Number(next);
      return;
    }
    if (name === "max") {
      if (next === null)
        this.control.removeAttribute("max");
      else
        this.control.max = Number(next);
      return;
    }
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }
    this.control.setAttribute(name, next);
  }
}

// src/components/tabs.js
var TABS_STYLES = css`
  :host { display: block; border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3); background: var(--awwbookmarklet-panel-bg, #f8fafc); }

  #tablist {
    display: flex;
    gap: 2px;
    padding: 4px 4px 0;
    border-bottom: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
  }

  #tablist button {
    min-height: 28px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-bottom: 0;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 88%, #ced5df 12%);
    padding: 0 10px;
    font: inherit;
    border-radius: 0;
  }

  #tablist button[aria-selected="true"] {
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    position: relative;
    top: 1px;
  }

  #tablist button:focus-visible { outline: none; box-shadow: var(--_ring); }
  #panels { padding: var(--awwbookmarklet-space-2, 8px); }
`;
var TAB_PANEL_STYLES = css`
  :host { display: block; }
`;
var nextTabsId = 0;

class AwwTabPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TAB_PANEL_STYLES]);
    shadow.innerHTML = `<slot></slot>`;
  }
}

class AwwTabs extends HTMLElement {
  #tabs = [];
  #panels = [];
  #selected = 0;
  #observer = null;
  #internalUpdate = false;
  #idPrefix;
  constructor() {
    super();
    nextTabsId += 1;
    this.#idPrefix = `awwbookmarklet-tabs-${nextTabsId}`;
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TABS_STYLES]);
    shadow.innerHTML = `<div id="tablist" role="tablist" part="tablist"></div><div id="panels" part="panels"><slot></slot></div>`;
    shadow.querySelector("#tablist").addEventListener("keydown", this.#onKeyDown);
    shadow.querySelector("#tablist").addEventListener("click", this.#onClick);
  }
  connectedCallback() {
    this.#refresh();
    this.#observer = new MutationObserver(() => {
      if (!this.#internalUpdate)
        this.#refresh();
    });
    this.#observer.observe(this, { childList: true, attributes: true, subtree: true, attributeFilter: ["label", "selected"] });
  }
  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }
  #refresh() {
    this.#panels = [...this.children].filter((child) => child.tagName.toLowerCase() === TAGS.tabPanel);
    if (!this.#panels.length) {
      this.#tabs = [];
      this.shadowRoot.querySelector("#tablist").textContent = "";
      return;
    }
    const selectedIndex = this.#panels.findIndex((panel) => panel.hasAttribute("selected"));
    this.#selected = selectedIndex >= 0 ? selectedIndex : 0;
    const tablist = this.shadowRoot.querySelector("#tablist");
    tablist.textContent = "";
    this.#tabs = this.#panels.map((panel, index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${this.id || this.#idPrefix}-tab-${index}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `${this.id || this.#idPrefix}-panel-${index}`);
      tab.textContent = panel.getAttribute("label") || `Tab ${index + 1}`;
      tab.dataset.index = String(index);
      tab.tabIndex = index === this.#selected ? 0 : -1;
      tab.setAttribute("aria-selected", index === this.#selected ? "true" : "false");
      tablist.append(tab);
      return tab;
    });
    this.#applySelection(this.#selected, false);
  }
  #applySelection(index, focusTab = true) {
    if (!this.#tabs.length)
      return;
    this.#selected = (index + this.#tabs.length) % this.#tabs.length;
    this.#tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === this.#selected;
      tab.tabIndex = selected ? 0 : -1;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      if (focusTab && selected)
        tab.focus();
    });
    this.#internalUpdate = true;
    try {
      this.#panels.forEach((panel, panelIndex) => {
        panel.toggleAttribute("selected", panelIndex === this.#selected);
        panel.hidden = panelIndex !== this.#selected;
        panel.id = `${this.id || this.#idPrefix}-panel-${panelIndex}`;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", `${this.id || this.#idPrefix}-tab-${panelIndex}`);
      });
    } finally {
      queueMicrotask(() => {
        this.#internalUpdate = false;
      });
    }
  }
  #onClick = (event) => {
    const tab = event.target.closest("button[role='tab']");
    if (!tab)
      return;
    this.#applySelection(Number(tab.dataset.index), true);
  };
  #onKeyDown = (event) => {
    if (!this.#tabs.length)
      return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.#applySelection(this.#selected + 1, true);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.#applySelection(this.#selected - 1, true);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      this.#applySelection(0, true);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      this.#applySelection(this.#tabs.length - 1, true);
    }
  };
}

// src/components/listbox.js
var LISTBOX_STYLES = css`
  :host { display: block; }

  #list {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    min-height: 120px;
    max-height: 260px;
    overflow: auto;
    padding: 2px;
  }

  ::slotted([role="option"]) {
    display: block;
    padding: 6px 8px;
    border: 1px solid transparent;
    user-select: none;
  }

  ::slotted([role="option"][data-selected="true"]) {
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    border-color: var(--awwbookmarklet-border-strong, #232a33);
  }

  ::slotted([role="option"][aria-disabled="true"]) {
    opacity: 0.55;
  }
`;
var nextListboxId = 0;
function isEnabledOption(item) {
  return item.getAttribute("role") === "option" && item.getAttribute("aria-disabled") !== "true";
}

class AwwListbox extends HTMLElement {
  #options = [];
  #selected = -1;
  #typeahead = "";
  #typeaheadTimer = 0;
  #idPrefix;
  constructor() {
    super();
    nextListboxId += 1;
    this.#idPrefix = `awwbookmarklet-listbox-${nextListboxId}`;
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, LISTBOX_STYLES]);
    shadow.innerHTML = `<div id="list" role="listbox" part="list" tabindex="0"><slot></slot></div>`;
    shadow.querySelector("#list").addEventListener("keydown", this.#onKeyDown);
    shadow.querySelector("#list").addEventListener("click", this.#onClick);
    shadow.querySelector("slot").addEventListener("slotchange", () => this.#refresh());
  }
  connectedCallback() {
    this.#refresh();
  }
  #refresh() {
    this.#options = [...this.children].filter(isEnabledOption);
    if (!this.#options.length) {
      this.#selected = -1;
      this.shadowRoot.querySelector("#list").removeAttribute("aria-activedescendant");
      return;
    }
    this.#options.forEach((option, index) => {
      if (!option.id)
        option.id = `${this.#idPrefix}-option-${index}`;
    });
    this.#selected = this.#options.findIndex((item) => item.getAttribute("aria-selected") === "true");
    if (this.#selected < 0)
      this.#selected = 0;
    this.#applySelection(this.#selected, false);
  }
  #applySelection(index, emit = true) {
    if (!this.#options.length)
      return;
    this.#selected = (index + this.#options.length) % this.#options.length;
    this.#options.forEach((option, optionIndex) => {
      const selected = optionIndex === this.#selected;
      option.setAttribute("aria-selected", selected ? "true" : "false");
      option.dataset.selected = selected ? "true" : "false";
    });
    this.shadowRoot.querySelector("#list").setAttribute("aria-activedescendant", this.#options[this.#selected].id);
    if (emit) {
      const selectedOption = this.#options[this.#selected];
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: {
          index: this.#selected,
          value: selectedOption.getAttribute("data-value") ?? selectedOption.textContent?.trim() ?? ""
        }
      }));
    }
  }
  #onClick = (event) => {
    const target = event.target.closest("[role='option']");
    if (!target || target.getAttribute("aria-disabled") === "true")
      return;
    const index = this.#options.indexOf(target);
    if (index !== -1)
      this.#applySelection(index, true);
  };
  #onKeyDown = (event) => {
    if (!this.#options.length)
      return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.#applySelection(this.#selected + 1, true);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.#applySelection(this.#selected - 1, true);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      this.#applySelection(0, true);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      this.#applySelection(this.#options.length - 1, true);
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key)) {
      this.#typeahead += event.key.toLowerCase();
      clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = setTimeout(() => {
        this.#typeahead = "";
      }, 450);
      const index = this.#options.findIndex((option) => option.textContent?.trim().toLowerCase().startsWith(this.#typeahead));
      if (index !== -1)
        this.#applySelection(index, true);
    }
  };
}

// src/components/group.js
var GROUP_STYLES = css`
  :host { display: block; }

  .group {
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 86%, #ffffff 14%);
    padding: 10px;
  }

  .caption {
    font-weight: 600;
    margin-bottom: 8px;
    color: color-mix(in srgb, var(--awwbookmarklet-input-fg, #111720) 90%, #ffffff 10%);
  }

  .content {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }
`;

class AwwGroup extends HTMLElement {
  static observedAttributes = ["caption"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, GROUP_STYLES]);
    shadow.innerHTML = `<section class="group" part="group"><div class="caption" part="caption"></div><div class="content" part="content"><slot></slot></div></section>`;
  }
  connectedCallback() {
    this.#syncCaption();
  }
  attributeChangedCallback() {
    this.#syncCaption();
  }
  #syncCaption() {
    const caption = this.getAttribute("caption") || "";
    const captionEl = this.shadowRoot.querySelector(".caption");
    captionEl.textContent = caption;
    captionEl.hidden = !caption;
  }
}

// src/components/panel.js
var PANEL_STYLES = css`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  section {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  .header {
    display: none;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-bottom: 6px;
  }

  :host([data-has-header="true"]) .header {
    display: flex;
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .subtitle {
    color: var(--awwbookmarklet-text-muted, #586272);
    overflow-wrap: anywhere;
  }

  .body {
    min-width: 0;
  }

  .footer {
    display: none;
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: 6px;
  }

  :host([data-has-footer="true"]) .footer {
    display: block;
  }
`;

class AwwPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, PANEL_STYLES]);
    shadow.innerHTML = `
      <section part="panel">
        <header class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="subtitle" part="subtitle"><slot name="subtitle"></slot></div>
          </div>
          <div part="actions"><slot name="actions"></slot></div>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
    this.titleSlot = shadow.querySelector("slot[name='title']");
    this.subtitleSlot = shadow.querySelector("slot[name='subtitle']");
    this.actionsSlot = shadow.querySelector("slot[name='actions']");
    this.footerSlot = shadow.querySelector("slot[name='footer']");
    [this.titleSlot, this.subtitleSlot, this.actionsSlot, this.footerSlot].forEach((slot) => {
      slot.addEventListener("slotchange", () => this.#sync());
    });
  }
  connectedCallback() {
    this.#sync();
  }
  #sync() {
    const hasHeader = [this.titleSlot, this.subtitleSlot, this.actionsSlot].some((slot) => slot.assignedNodes({ flatten: true }).length > 0);
    const hasFooter = this.footerSlot.assignedNodes({ flatten: true }).length > 0;
    this.dataset.hasHeader = hasHeader ? "true" : "false";
    this.dataset.hasFooter = hasFooter ? "true" : "false";
  }
}

// src/components/statusbar.js
var STATUS_STYLES = css`
  :host {
    display: block;
    background: var(--awwbookmarklet-statusbar-bg, #e5e8ee);
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    min-height: 24px;
  }

  #bar {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  ::slotted(*) {
    min-height: 24px;
    padding: 4px 8px;
    border-right: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ::slotted(*:last-child) { border-right: 0; }
`;

class AwwStatusbar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, STATUS_STYLES]);
    shadow.innerHTML = `<div id="bar" role="status" part="bar"><slot></slot></div>`;
  }
}

// src/components/app-shell.js
var APP_SHELL_STYLES = css`
  :host {
    display: block;
    min-height: 0;
    background: var(--awwbookmarklet-app-shell-bg, #eef1f5);
    color: var(--awwbookmarklet-input-fg, #111720);
  }

  .shell {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    min-height: 0;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-3, 12px);
    min-width: 0;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-bottom: var(--awwbookmarklet-space-2, 8px);
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .subtitle {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    justify-content: end;
    min-width: min(100%, 180px);
  }

  .status ::slotted(*) { width: 100%; }

  .body {
    min-height: 0;
    overflow: auto;
  }

  .footer {
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: var(--awwbookmarklet-space-2, 8px);
  }

  @media (max-width: 520px) {
    .header {
      display: grid;
    }

    .actions {
      justify-content: start;
    }
  }
`;

class AwwAppShell extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, APP_SHELL_STYLES]);
    shadow.innerHTML = `
      <section class="shell" part="shell">
        <header class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="subtitle" part="subtitle"><slot name="subtitle"></slot></div>
          </div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </header>
        <div class="status" part="status"><slot name="status"></slot></div>
        <main class="body" part="body"><slot name="body"></slot><slot></slot></main>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
  }
}

// src/core/component-utils.js
var TONES = new Set(["neutral", "info", "success", "warning", "danger"]);
var DENSITIES = new Set(["compact", "normal", "spacious"]);
var ALIGNMENTS = new Set(["start", "center", "end", "between"]);
var ORIENTATIONS = new Set(["horizontal", "vertical", "inline"]);
var idSerial = 0;
function createId(prefix = "aww") {
  idSerial += 1;
  return `${prefix}-${idSerial}`;
}
function normalizeTone(value, fallback = "neutral") {
  return TONES.has(value) ? value : fallback;
}
function normalizeDensity(value, fallback = "normal") {
  return DENSITIES.has(value) ? value : fallback;
}
function normalizeAlignment(value, fallback = "start") {
  return ALIGNMENTS.has(value) ? value : fallback;
}
function normalizeOrientation(value, fallback = "horizontal") {
  return ORIENTATIONS.has(value) ? value : fallback;
}
function isFocusable(element) {
  if (!element || element.disabled || element.getAttribute?.("aria-disabled") === "true")
    return false;
  if (element.tabIndex >= 0)
    return true;
  return /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName) && !element.hasAttribute("disabled");
}
function getFocusableElements(root) {
  if (!root?.querySelectorAll)
    return [];
  return [...root.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter(isFocusable);
}
function dispatchComponentEvent(target, name, detail = {}, options = {}) {
  return target.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    composed: true,
    cancelable: Boolean(options.cancelable),
    detail
  }));
}

// src/components/toolbar.js
var TOOLBAR_STYLES = css`
  :host {
    display: flex;
    max-width: 100%;
    opacity: 1;
  }

  :host([hidden]) { display: none !important; }

  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--_gap, var(--awwbookmarklet-space-2, 8px));
    width: 100%;
    min-width: 0;
  }

  :host([orientation="vertical"]) .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  :host([wrap]) .toolbar {
    flex-wrap: wrap;
  }

  :host([data-align="center"]) .toolbar { justify-content: center; }
  :host([data-align="end"]) .toolbar { justify-content: flex-end; }
  :host([data-align="between"]) .toolbar { justify-content: space-between; }

  :host([data-density="compact"]) { --_gap: 4px; }
  :host([data-density="spacious"]) { --_gap: 12px; }

  :host([busy]) .toolbar {
    cursor: progress;
  }

  :host([disabled]),
  :host([busy]) {
    opacity: 0.72;
  }
`;

class AwwToolbar extends HTMLElement {
  static observedAttributes = ["density", "align", "orientation", "disabled", "busy"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TOOLBAR_STYLES]);
    shadow.innerHTML = `<div class="toolbar" part="toolbar"><slot></slot></div>`;
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    this.dataset.density = normalizeDensity(this.getAttribute("density"));
    this.dataset.align = normalizeAlignment(this.getAttribute("align"));
    const orientation = normalizeOrientation(this.getAttribute("orientation"), "horizontal");
    if (this.getAttribute("orientation") !== orientation)
      this.setAttribute("orientation", orientation);
    this.setAttribute("aria-disabled", this.hasAttribute("disabled") || this.hasAttribute("busy") ? "true" : "false");
  }
}

// src/components/field.js
var FIELD_STYLES = css`
  :host {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  :host([wide]) {
    width: 100%;
  }

  .field {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  :host([orientation="horizontal"]) .field {
    grid-template-columns: minmax(120px, 0.38fr) minmax(0, 1fr);
    gap: 8px 12px;
    align-items: start;
  }

  :host([orientation="inline"]) .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-weight: 650;
    line-height: 1.25;
  }

  .required {
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  .control-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
    min-width: 0;
  }

  .control-row ::slotted(*) {
    min-width: 0;
  }

  .main {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .message {
    min-height: 16px;
    color: var(--awwbookmarklet-text-help, #657184);
    font-size: 12px;
    line-height: 1.3;
  }

  :host([data-tone="danger"]) .message,
  :host([data-invalid="true"]) .message {
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  :host([disabled]) {
    opacity: 0.7;
  }
`;

class AwwField extends HTMLElement {
  static observedAttributes = ["label", "help", "error", "required", "tone", "orientation", "disabled"];
  #ids = {
    label: createId("aww-field-label"),
    help: createId("aww-field-help"),
    error: createId("aww-field-error")
  };
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, FIELD_STYLES]);
    shadow.innerHTML = `
      <label class="field" part="field">
        <span class="label" part="label" id="${this.#ids.label}"><slot name="label"></slot><span data-label-text></span><span class="required" aria-hidden="true"></span></span>
        <span class="main" part="main">
          <span class="control-row" part="control-row">
            <slot name="prefix"></slot>
            <slot></slot>
            <slot name="suffix"></slot>
            <slot name="actions"></slot>
          </span>
          <span class="message" part="message">
            <span id="${this.#ids.error}" data-error-text></span>
            <span id="${this.#ids.help}" data-help-text></span>
            <slot name="error"></slot>
            <slot name="help"></slot>
          </span>
        </span>
      </label>
    `;
    this.controlSlot = shadow.querySelector("slot:not([name])");
    this.labelText = shadow.querySelector("[data-label-text]");
    this.helpText = shadow.querySelector("[data-help-text]");
    this.errorText = shadow.querySelector("[data-error-text]");
    this.requiredMark = shadow.querySelector(".required");
    this.controlSlot.addEventListener("slotchange", () => this.#syncControl());
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    const orientation = normalizeOrientation(this.getAttribute("orientation"), "vertical");
    if (this.getAttribute("orientation") !== orientation)
      this.setAttribute("orientation", orientation);
    const error = this.getAttribute("error") || "";
    this.dataset.invalid = error ? "true" : "false";
    this.dataset.tone = error ? "danger" : normalizeTone(this.getAttribute("tone"));
    this.labelText.textContent = this.getAttribute("label") || "";
    this.helpText.textContent = error ? "" : this.getAttribute("help") || "";
    this.errorText.textContent = error;
    this.requiredMark.textContent = this.hasAttribute("required") ? " *" : "";
    this.#syncControl();
  }
  #syncControl() {
    const control = this.controlSlot.assignedElements({ flatten: true })[0];
    if (!control)
      return;
    if (!control.hasAttribute("aria-labelledby"))
      control.setAttribute("aria-labelledby", this.#ids.label);
    const descriptions = [];
    if (this.getAttribute("help"))
      descriptions.push(this.#ids.help);
    if (this.getAttribute("error"))
      descriptions.push(this.#ids.error);
    if (descriptions.length)
      control.setAttribute("aria-describedby", descriptions.join(" "));
    else
      control.removeAttribute("aria-describedby");
    control.toggleAttribute("required", this.hasAttribute("required"));
    control.toggleAttribute("disabled", this.hasAttribute("disabled"));
    control.setAttribute("aria-invalid", this.getAttribute("error") ? "true" : "false");
  }
}

// src/components/status-line.js
var STATUS_LINE_STYLES = css`
  :host {
    display: flex;
    align-items: center;
    min-height: 22px;
    gap: 6px;
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
  }

  :host([compact]) {
    min-height: 18px;
    font-size: 12px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border: 1px solid currentColor;
    background: currentColor;
    flex: 0 0 auto;
  }

  :host([busy]) .dot {
    animation: pulse 0.9s steps(2, end) infinite;
  }

  :host([data-tone="info"]) { color: var(--awwbookmarklet-info-fg, #123d7a); }
  :host([data-tone="success"]) { color: var(--awwbookmarklet-success-fg, #195b34); }
  :host([data-tone="warning"]) { color: var(--awwbookmarklet-warning-fg, #6d4b00); }
  :host([data-tone="danger"]) { color: var(--awwbookmarklet-danger-fg, #8a1f17); }

  @keyframes pulse {
    50% { opacity: 0.28; }
  }
`;

class AwwStatusLine extends HTMLElement {
  static observedAttributes = ["tone", "live", "busy"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, STATUS_LINE_STYLES]);
    shadow.innerHTML = `<span class="dot" part="indicator" aria-hidden="true"></span><span part="text"><slot></slot></span>`;
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  update(message, options = {}) {
    if (options.tone)
      this.setAttribute("tone", options.tone);
    if (options.live)
      this.setAttribute("live", options.live);
    this.textContent = String(message ?? "");
  }
  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
    const live = this.getAttribute("live") || "polite";
    this.setAttribute("aria-live", ["off", "polite", "assertive"].includes(live) ? live : "polite");
    this.setAttribute("aria-busy", this.hasAttribute("busy") ? "true" : "false");
  }
}

// src/components/alert.js
var ALERT_STYLES = css`
  :host {
    display: block;
  }

  :host(:not([open])) {
    display: none;
  }

  .alert {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-space-2, 8px);
    align-items: start;
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--_bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  :host([compact]) .alert {
    padding: 6px;
  }

  .icon {
    width: 14px;
    height: 14px;
    border: 1px solid currentColor;
    background: currentColor;
    margin-top: 2px;
  }

  .content {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
  }

  .message {
    line-height: 1.4;
  }

  .actions {
    margin-top: 4px;
  }

  button {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: transparent;
    color: inherit;
    font: inherit;
    min-width: 24px;
    height: 24px;
  }

  :host([data-tone="info"]) { --_bg: var(--awwbookmarklet-info-bg, #e7f0ff); --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_bg: var(--awwbookmarklet-success-bg, #e5f5eb); --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_bg: var(--awwbookmarklet-warning-bg, #fff4d6); --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_bg: var(--awwbookmarklet-danger-bg, #ffe8e6); --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

class AwwAlert extends HTMLElement {
  static observedAttributes = ["tone", "title", "dismissible", "open"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, ALERT_STYLES]);
    shadow.innerHTML = `
      <section class="alert" part="alert">
        <div class="icon" part="icon"><slot name="icon"></slot></div>
        <div class="content" part="content">
          <div class="title" part="title"><slot name="title"></slot><span data-title-text></span></div>
          <div class="message" part="message"><slot></slot></div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </div>
        <button type="button" part="close-button" aria-label="Dismiss" hidden>x</button>
      </section>
    `;
    this.closeButton = shadow.querySelector("button");
    this.titleText = shadow.querySelector("[data-title-text]");
    this.closeButton.addEventListener("click", () => this.dismiss());
  }
  connectedCallback() {
    if (!this.hasAttribute("open"))
      this.setAttribute("open", "");
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  dismiss() {
    const accepted = dispatchComponentEvent(this, "awwbookmarklet-alert-dismiss", { source: this }, { cancelable: true });
    if (accepted)
      this.removeAttribute("open");
  }
  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"), "info");
    this.closeButton.hidden = !this.hasAttribute("dismissible");
    this.titleText.textContent = this.getAttribute("title") || "";
    this.setAttribute("role", this.dataset.tone === "danger" ? "alert" : "status");
  }
}

// src/core/overlay.js
var OVERLAY_CLASS = "awwbookmarklet-overlay-layer";
function getOverlayLayer() {
  if (typeof document === "undefined")
    return null;
  const root = globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] || document.body || document.documentElement;
  let layer = root.querySelector?.(`:scope > .${OVERLAY_CLASS}`);
  if (!layer) {
    layer = document.createElement("div");
    layer.className = OVERLAY_CLASS;
    Object.assign(layer.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: String(ROOT_Z_INDEX + 5000)
    });
    root.append(layer);
  }
  return layer;
}
function portalElement(element) {
  const layer = getOverlayLayer();
  if (!layer || element.parentNode === layer)
    return null;
  const restore = { parent: element.parentNode, nextSibling: element.nextSibling };
  layer.append(element);
  return restore;
}
function restoreElement(element, restore) {
  if (!restore?.parent?.isConnected)
    return;
  const next = restore.nextSibling?.parentNode === restore.parent ? restore.nextSibling : null;
  restore.parent.insertBefore(element, next);
}

// src/components/dialog.js
var DIALOG_STYLES = css`
  :host {
    position: fixed;
    inset: 0;
    display: none;
    pointer-events: none;
    z-index: 1;
  }

  :host([open]) {
    display: grid;
    place-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--awwbookmarklet-overlay-backdrop, rgba(12, 18, 28, 0.38));
    pointer-events: auto;
  }

  .panel {
    position: relative;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(680px, calc(100vw - 32px));
    max-height: min(620px, calc(100vh - 32px));
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    pointer-events: auto;
  }

  .header,
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: var(--awwbookmarklet-space-2, 8px);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .header {
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .footer {
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .title {
    font-weight: 700;
  }

  .body {
    min-height: 0;
    overflow: auto;
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  button {
    min-width: 28px;
    min-height: 26px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    font: inherit;
  }
`;

class AwwDialog extends HTMLElement {
  static observedAttributes = ["open", "label", "modal"];
  #restore = null;
  #previousFocus = null;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, DIALOG_STYLES]);
    shadow.innerHTML = `
      <div class="backdrop" part="backdrop"></div>
      <section class="panel" part="panel" role="dialog" aria-modal="true" tabindex="-1">
        <header class="header" part="header">
          <div class="title" part="title"><slot name="title"></slot></div>
          <button type="button" part="close-button" aria-label="Close">x</button>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
    this.panel = shadow.querySelector(".panel");
    this.backdrop = shadow.querySelector(".backdrop");
    this.closeButton = shadow.querySelector("button");
    this.closeButton.addEventListener("click", () => this.close("button"));
    this.backdrop.addEventListener("click", () => {
      if (this.hasAttribute("close-on-backdrop"))
        this.close("backdrop");
    });
    this.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }
  connectedCallback() {
    this.#sync();
  }
  disconnectedCallback() {
    restoreElement(this, this.#restore);
  }
  attributeChangedCallback() {
    this.#sync();
  }
  show() {
    this.setAttribute("open", "");
  }
  close(reason = "api") {
    const accepted = dispatchComponentEvent(this, "awwbookmarklet-dialog-cancel", { reason }, { cancelable: true });
    if (!accepted)
      return false;
    this.removeAttribute("open");
    dispatchComponentEvent(this, "awwbookmarklet-dialog-close", { reason });
    return true;
  }
  #sync() {
    this.panel.setAttribute("aria-label", this.getAttribute("label") || "Dialog");
    if (this.hasAttribute("open")) {
      if (!this.#restore)
        this.#restore = portalElement(this);
      this.#previousFocus ||= document.activeElement;
      queueMicrotask(() => this.#focusInitial());
      dispatchComponentEvent(this, "awwbookmarklet-dialog-open", { source: this });
      return;
    }
    if (this.#restore) {
      const previous = this.#previousFocus;
      restoreElement(this, this.#restore);
      this.#restore = null;
      this.#previousFocus = null;
      if (previous?.focus)
        previous.focus();
    }
  }
  #focusInitial() {
    const focusable = getFocusableElements(this);
    (focusable[0] || this.closeButton || this.panel).focus();
  }
  #onKeyDown(event) {
    if (!this.hasAttribute("open"))
      return;
    if (event.key === "Escape" && this.getAttribute("close-on-escape") !== "false") {
      event.preventDefault();
      this.close("escape");
      return;
    }
    if (event.key !== "Tab" || !this.hasAttribute("modal"))
      return;
    const focusable = getFocusableElements(this);
    if (!focusable.length) {
      event.preventDefault();
      this.panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

// src/components/toast.js
var TOAST_STYLES = css`
  :host {
    display: block;
    pointer-events: auto;
    min-width: 220px;
    max-width: min(420px, calc(100vw - 24px));
    border: 1px solid var(--_border, var(--awwbookmarklet-border-strong, #232a33));
    background: var(--_bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  :host([data-tone="info"]) { --_bg: var(--awwbookmarklet-info-bg, #e7f0ff); --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_bg: var(--awwbookmarklet-success-bg, #e5f5eb); --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_bg: var(--awwbookmarklet-warning-bg, #fff4d6); --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_bg: var(--awwbookmarklet-danger-bg, #ffe8e6); --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }

  .toast {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;
var activeToasts = new Map;
function ensureStack() {
  const layer = getOverlayLayer();
  if (!layer)
    return null;
  let stack = layer.querySelector(":scope > [data-aww-toast-stack]");
  if (!stack) {
    stack = document.createElement("div");
    stack.dataset.awwToastStack = "true";
    Object.assign(stack.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      display: "grid",
      gap: "8px",
      justifyItems: "end",
      pointerEvents: "none"
    });
    layer.append(stack);
  }
  return stack;
}

class AwwToast extends HTMLElement {
  static observedAttributes = ["tone", "timeout"];
  #timer = 0;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TOAST_STYLES]);
    shadow.innerHTML = `<section class="toast" part="toast" role="status" aria-live="polite"><slot></slot></section>`;
    this.addEventListener("mouseenter", () => clearTimeout(this.#timer));
    this.addEventListener("mouseleave", () => this.startTimer());
  }
  connectedCallback() {
    this.#sync();
    this.startTimer();
  }
  disconnectedCallback() {
    clearTimeout(this.#timer);
  }
  attributeChangedCallback() {
    this.#sync();
  }
  startTimer() {
    clearTimeout(this.#timer);
    const timeout = Number(this.getAttribute("timeout") || "2800");
    if (timeout <= 0)
      return;
    this.#timer = setTimeout(() => this.remove(), timeout);
  }
  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"), "info");
  }
}
function showToast({ message = "", tone = "info", timeout = 2800, key = "" } = {}) {
  const stack = ensureStack();
  if (!stack)
    return null;
  let toast = key ? activeToasts.get(key) : null;
  if (!toast?.isConnected) {
    toast = document.createElement("awwbookmarklet-toast");
    if (key)
      activeToasts.set(key, toast);
    stack.append(toast);
  }
  toast.setAttribute("tone", tone);
  toast.setAttribute("timeout", String(timeout));
  toast.textContent = String(message ?? "");
  toast.startTimer?.();
  return toast;
}

// src/components/empty-state.js
var EMPTY_STYLES = css`
  :host {
    display: block;
    min-height: 96px;
    border: 1px dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  .empty {
    display: grid;
    place-items: center;
    gap: 6px;
    min-height: inherit;
    text-align: center;
  }

  .title {
    color: var(--awwbookmarklet-input-fg, #111720);
    font-weight: 700;
  }

  .description {
    line-height: 1.4;
  }

  .actions {
    margin-top: 4px;
  }
`;

class AwwEmptyState extends HTMLElement {
  static observedAttributes = ["title", "description"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, EMPTY_STYLES]);
    shadow.innerHTML = `
      <section class="empty" part="empty">
        <div class="title" part="title"></div>
        <div class="description" part="description"></div>
        <div class="content" part="content"><slot></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `;
    this.titleNode = shadow.querySelector(".title");
    this.descriptionNode = shadow.querySelector(".description");
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    this.titleNode.textContent = this.getAttribute("title") || "Nothing to show";
    this.descriptionNode.textContent = this.getAttribute("description") || "";
  }
}

// src/components/state-overlay.js
var STATE_STYLES = css`
  :host {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    min-height: 96px;
    background: color-mix(in srgb, var(--awwbookmarklet-surface-raised-bg, #fff) 86%, transparent);
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    z-index: 2;
  }

  :host([hidden]) { display: none !important; }

  .surface {
    display: grid;
    gap: 8px;
    justify-items: center;
    max-width: min(420px, calc(100% - 24px));
    padding: var(--awwbookmarklet-space-3, 12px);
    text-align: center;
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  .indicator {
    width: 18px;
    height: 18px;
    border: 2px solid currentColor;
    background: transparent;
  }

  :host([state="loading"]) .indicator {
    border-style: dashed;
    animation: spin 0.9s steps(8, end) infinite;
  }

  :host([data-tone="info"]) { --_fg: var(--awwbookmarklet-info-fg, #123d7a); }
  :host([data-tone="success"]) { --_fg: var(--awwbookmarklet-success-fg, #195b34); }
  :host([data-tone="warning"]) { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); }
  :host([data-tone="danger"]) { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); }

  @keyframes spin {
    to { rotate: 360deg; }
  }
`;
var STATE_TONES = {
  loading: "info",
  empty: "neutral",
  error: "danger",
  blocked: "warning",
  success: "success",
  custom: "neutral"
};

class AwwStateOverlay extends HTMLElement {
  static observedAttributes = ["state", "label", "tone"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, STATE_STYLES]);
    shadow.innerHTML = `
      <section class="surface" part="surface">
        <div class="indicator" part="indicator" aria-hidden="true"></div>
        <div class="label" part="label"></div>
        <div part="actions"><slot name="actions"></slot></div>
      </section>
    `;
    this.labelNode = shadow.querySelector(".label");
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    const state = this.getAttribute("state") || "loading";
    const fallbackTone = STATE_TONES[state] || "neutral";
    this.dataset.tone = normalizeTone(this.getAttribute("tone"), fallbackTone);
    this.labelNode.textContent = this.getAttribute("label") || state;
    this.setAttribute("role", state === "error" || state === "blocked" ? "alert" : "status");
    this.setAttribute("aria-live", state === "error" || state === "blocked" ? "assertive" : "polite");
  }
}

// src/components/list.js
var LIST_STYLES = css`
  :host {
    display: block;
  }

  .list {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }

  .empty[hidden] {
    display: none;
  }
`;

class AwwList extends HTMLElement {
  static observedAttributes = ["empty-text"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, LIST_STYLES]);
    shadow.innerHTML = `
      <div class="list" part="list" role="list"><slot></slot></div>
      <div class="empty" part="empty" hidden>
        <slot name="empty"></slot>
        <awwbookmarklet-empty-state></awwbookmarklet-empty-state>
      </div>
    `;
    this.slot = shadow.querySelector("slot:not([name])");
    this.empty = shadow.querySelector(".empty");
    this.emptyState = shadow.querySelector("awwbookmarklet-empty-state");
    this.slot.addEventListener("slotchange", () => this.#sync());
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    const items = this.slot.assignedElements({ flatten: true }).filter((node) => node.slot !== "empty");
    this.empty.hidden = items.length > 0;
    this.emptyState.setAttribute("title", this.getAttribute("empty-text") || "No items");
  }
}

// src/components/list-item.js
var LIST_ITEM_STYLES = css`
  :host {
    display: block;
  }

  .item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-space-2, 8px);
    align-items: start;
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-space-2, 8px);
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  :host([compact]) .item { padding: 6px; }
  :host([interactive]) .item,
  :host([selectable]) .item { cursor: pointer; }
  :host([selected]) .item { --_bg: var(--awwbookmarklet-card-selected-bg, #e8f1ff); --_border: var(--awwbookmarklet-selection-bg, #1f5eae); }
  :host([disabled]) .item { opacity: 0.58; cursor: not-allowed; }

  .main {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta,
  .description,
  .status {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    justify-content: end;
    min-width: 0;
  }

  :host([data-tone="info"]) { --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_border: var(--awwbookmarklet-danger-border, #d46a60); }

  @media (max-width: 520px) {
    .item {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .actions,
    .trailing {
      grid-column: 1 / -1;
      justify-content: start;
    }
  }
`;
function isActionClick(event) {
  const path = event.composedPath?.() || [];
  return path.some((node) => {
    if (!node?.slot)
      return false;
    return node.slot === "actions" || node.slot === "trailing";
  });
}

class AwwListItem extends HTMLElement {
  static observedAttributes = ["tone", "selected", "disabled", "interactive", "selectable"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, LIST_ITEM_STYLES]);
    shadow.innerHTML = `
      <article class="item" part="item" role="listitem" tabindex="-1">
        <div part="leading"><slot name="leading"></slot></div>
        <div class="main" part="main">
          <div class="title" part="title"><slot name="title"></slot></div>
          <div class="meta" part="meta"><slot name="meta"></slot></div>
          <div part="thumbnail"><slot name="thumbnail"></slot></div>
          <div class="description" part="description"><slot name="description"></slot><slot></slot></div>
          <div class="status" part="status"><slot name="status"></slot></div>
          <div part="footer"><slot name="footer"></slot></div>
        </div>
        <div class="trailing" part="trailing"><slot name="trailing"></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </article>
    `;
    this.surface = shadow.querySelector(".item");
    this.surface.addEventListener("click", (event) => this.#onClick(event));
    this.surface.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
    this.surface.tabIndex = this.hasAttribute("interactive") || this.hasAttribute("selectable") ? 0 : -1;
    this.surface.setAttribute("aria-selected", this.hasAttribute("selected") ? "true" : "false");
    this.surface.setAttribute("aria-disabled", this.hasAttribute("disabled") ? "true" : "false");
  }
  #onClick(event) {
    if (this.hasAttribute("disabled") || isActionClick(event))
      return;
    if (!this.hasAttribute("interactive") && !this.hasAttribute("selectable"))
      return;
    if (this.hasAttribute("selectable"))
      this.toggleAttribute("selected", !this.hasAttribute("selected"));
    dispatchComponentEvent(this, "awwbookmarklet-list-item-activate", {
      selected: this.hasAttribute("selected"),
      source: this
    });
  }
  #onKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ")
      return;
    event.preventDefault();
    this.surface.click();
  }
}

// src/components/card.js
var CARD_STYLES = css`
  :host {
    display: block;
  }

  .card {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title { font-weight: 700; overflow-wrap: anywhere; }
  .meta { color: var(--awwbookmarklet-text-muted, #586272); overflow-wrap: anywhere; }
  .body { min-width: 0; line-height: 1.4; }
  .footer { border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4); padding-top: 6px; }

  :host([selected]) .card { --_bg: var(--awwbookmarklet-card-selected-bg, #e8f1ff); --_border: var(--awwbookmarklet-selection-bg, #1f5eae); }
  :host([data-tone="info"]) { --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

class AwwCard extends HTMLElement {
  static observedAttributes = ["tone"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CARD_STYLES]);
    shadow.innerHTML = `
      <article class="card" part="card">
        <div class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="meta" part="meta"><slot name="meta"></slot></div>
          </div>
          <div part="actions"><slot name="actions"></slot></div>
        </div>
        <div part="media"><slot name="media"></slot></div>
        <div class="body" part="body"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </article>
    `;
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
  }
}

// src/core/sanitize.js
var ALLOWED_TAGS = new Set([
  "A",
  "ABBR",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DD",
  "DIV",
  "DL",
  "DT",
  "EM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HR",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "PRE",
  "S",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "U",
  "UL"
]);
var GLOBAL_ATTRS = new Set(["title", "aria-label", "aria-hidden", "role"]);
var TABLE_ATTRS = new Set(["colspan", "rowspan"]);
function isSafeUrl(value) {
  const trimmed = String(value ?? "").trim().replace(/[\u0000-\u001f\s]+/g, "");
  if (!trimmed)
    return true;
  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../"))
    return true;
  try {
    const url = new URL(trimmed, "https://example.invalid/");
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}
function sanitizeElement(element, options) {
  for (const child of [...element.children])
    sanitizeElement(child, options);
  if (!ALLOWED_TAGS.has(element.tagName)) {
    element.replaceWith(...element.childNodes);
    return;
  }
  if (element.tagName === "IMG" && options.images === "hidden") {
    element.remove();
    return;
  }
  for (const attr of [...element.attributes]) {
    const name = attr.name.toLowerCase();
    const value = attr.value;
    const isTableAttr = TABLE_ATTRS.has(name) && ["TD", "TH"].includes(element.tagName);
    const keep = GLOBAL_ATTRS.has(name) || isTableAttr || element.tagName === "A" && ["href", "target", "rel"].includes(name) || element.tagName === "IMG" && ["src", "alt", "width", "height"].includes(name);
    if (!keep || name.startsWith("on") || name === "style") {
      element.removeAttribute(attr.name);
      continue;
    }
    if ((name === "href" || name === "src") && !isSafeUrl(value)) {
      element.removeAttribute(attr.name);
    }
  }
  if (element.tagName === "A") {
    if (element.hasAttribute("href") && options.links !== "plain") {
      element.setAttribute("rel", "noopener noreferrer");
      element.setAttribute("target", "_blank");
    } else if (options.links === "plain") {
      element.removeAttribute("href");
    }
  }
}
function sanitizeWithDomParser(html, options) {
  const parser = new DOMParser;
  const doc = parser.parseFromString(`<div>${String(html ?? "")}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  sanitizeElement(root, options);
  return root.innerHTML;
}
function sanitizeWithoutDomParser(html) {
  return String(html ?? "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/\s(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]*/gi, "").replace(/<\/?(iframe|object|embed|form|input|button|meta|link)[^>]*>/gi, "");
}
function sanitizeHtml(html, options = {}) {
  const normalized = {
    links: options.links || "safe",
    images: options.images || "constrained"
  };
  if (typeof DOMParser !== "undefined")
    return sanitizeWithDomParser(html, normalized);
  return sanitizeWithoutDomParser(html);
}

// src/components/rich-preview.js
var RICH_PREVIEW_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .wrap {
    min-height: 96px;
    max-width: 100%;
    overflow: auto;
    padding: var(--awwbookmarklet-space-3, 12px);
  }

  .empty {
    color: var(--awwbookmarklet-text-muted, #586272);
    display: none;
  }

  :host([data-empty="true"]) .empty {
    display: block;
  }

  :host([data-empty="true"]) .content {
    display: none;
  }

  .content {
    color: var(--awwbookmarklet-input-fg, #111720);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .content h1,
  .content h2,
  .content h3,
  .content h4 {
    margin: 0.7em 0 0.35em;
    line-height: 1.2;
  }

  .content p,
  .content ul,
  .content ol,
  .content blockquote,
  .content pre,
  .content table {
    margin: 0 0 0.85em;
  }

  .content img {
    max-width: 100%;
    height: auto;
  }

  .content table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  .content th,
  .content td {
    border: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding: 4px 6px;
    vertical-align: top;
  }

  .content blockquote {
    border-left: 3px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    padding-left: 10px;
    color: var(--awwbookmarklet-text-muted, #586272);
  }

  .content pre {
    overflow: auto;
    max-width: 100%;
    padding: 8px;
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
  }

  .content code {
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
    padding: 0 3px;
  }

  .content pre code {
    padding: 0;
    background: transparent;
  }
`;

class AwwRichPreview extends HTMLElement {
  static observedAttributes = ["empty-text", "links", "images"];
  #html = "";
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, RICH_PREVIEW_STYLES]);
    shadow.innerHTML = `
      <section class="wrap" part="wrap">
        <div class="empty" part="empty"></div>
        <div class="content" part="content"></div>
      </section>
    `;
    this.emptyNode = shadow.querySelector(".empty");
    this.contentNode = shadow.querySelector(".content");
  }
  connectedCallback() {
    this.#render();
  }
  attributeChangedCallback() {
    this.#render();
  }
  get html() {
    return this.#html;
  }
  set html(value) {
    this.#html = sanitizeHtml(value, {
      links: this.getAttribute("links") || "safe",
      images: this.getAttribute("images") || "constrained"
    });
    this.#render();
  }
  setUnsafeHTML(value) {
    this.#html = String(value ?? "");
    this.#render();
  }
  #render() {
    if (!this.contentNode)
      return;
    this.emptyNode.textContent = this.getAttribute("empty-text") || "Nothing to preview.";
    this.contentNode.innerHTML = this.#html;
    this.dataset.empty = this.#html.trim() ? "false" : "true";
  }
}

// src/components/browser-panel.js
var BROWSER_PANEL_STYLES = css`
  :host {
    display: grid;
    min-height: 220px;
    min-width: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
  }

  .panel {
    position: relative;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-height: inherit;
    min-width: 0;
  }

  .chrome {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: 6px;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .address {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--awwbookmarklet-text-muted, #586272);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  iframe {
    width: 100%;
    height: 100%;
    min-height: 180px;
    border: 0;
    background: #fff;
  }

  .overlay {
    position: absolute;
    inset: 31px 0 0;
    display: none;
  }

  :host([loading]) .overlay,
  :host([error]) .overlay {
    display: block;
  }

  button {
    min-height: 26px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    font: inherit;
  }
`;

class AwwBrowserPanel extends HTMLElement {
  static observedAttributes = ["src", "sandbox", "referrerpolicy", "loading", "error", "title", "loading-label", "error-label"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, BROWSER_PANEL_STYLES]);
    shadow.innerHTML = `
      <section class="panel" part="panel">
        <div class="chrome" part="chrome">
          <div class="address" part="address"><slot name="address"></slot><span data-address></span></div>
          <div part="actions"><slot name="actions"></slot></div>
        </div>
        <iframe part="frame"></iframe>
        <div class="overlay" part="overlay">
          <awwbookmarklet-state-overlay></awwbookmarklet-state-overlay>
          <slot name="overlay"></slot>
        </div>
      </section>
    `;
    this.frame = shadow.querySelector("iframe");
    this.addressFallback = shadow.querySelector("[data-address]");
    this.overlay = shadow.querySelector("awwbookmarklet-state-overlay");
    this.frame.addEventListener("load", () => {
      this.removeAttribute("loading");
      dispatchComponentEvent(this, "awwbookmarklet-frame-load", { src: this.src });
    });
    this.frame.addEventListener("error", () => {
      this.setAttribute("error", "");
      dispatchComponentEvent(this, "awwbookmarklet-frame-error", { src: this.src });
    });
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get src() {
    return this.getAttribute("src") || "";
  }
  set src(value) {
    this.setAttribute("src", String(value ?? ""));
  }
  retry() {
    dispatchComponentEvent(this, "awwbookmarklet-frame-retry", { src: this.src });
    if (this.src) {
      this.setAttribute("loading", "");
      this.removeAttribute("error");
      this.frame.src = this.src;
    }
  }
  openExternally() {
    dispatchComponentEvent(this, "awwbookmarklet-frame-fallback-open", { src: this.src });
  }
  #sync() {
    if (!this.frame)
      return;
    const src = this.getAttribute("src") || "about:blank";
    if (this.frame.getAttribute("src") !== src)
      this.frame.setAttribute("src", src);
    this.frame.setAttribute("title", this.getAttribute("title") || "Browser panel");
    this.frame.setAttribute("sandbox", this.getAttribute("sandbox") || "allow-scripts allow-forms allow-same-origin");
    this.frame.setAttribute("referrerpolicy", this.getAttribute("referrerpolicy") || "no-referrer");
    this.addressFallback.textContent = this.getAttribute("src") || "No page loaded";
    const error = this.hasAttribute("error");
    this.overlay.setAttribute("state", error ? "blocked" : "loading");
    this.overlay.setAttribute("label", error ? this.getAttribute("error-label") || "This page could not be loaded here." : this.getAttribute("loading-label") || "Loading page");
  }
}

// src/components/manual-copy.js
var MANUAL_COPY_STYLES = css`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-warning-border, #d9ad3b);
    background: var(--awwbookmarklet-warning-bg, #fff4d6);
    color: var(--awwbookmarklet-warning-fg, #6d4b00);
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  .wrap {
    display: grid;
    gap: 6px;
  }

  .label {
    font-weight: 700;
  }

  textarea {
    min-height: 92px;
    width: 100%;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
    padding: 8px;
  }
`;

class AwwManualCopy extends HTMLElement {
  static observedAttributes = ["label", "value"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MANUAL_COPY_STYLES]);
    shadow.innerHTML = `
      <section class="wrap" part="wrap">
        <div class="label" part="label"></div>
        <div part="description"><slot>Automatic copy is unavailable. Select the text below and copy it manually.</slot></div>
        <textarea part="control" readonly></textarea>
      </section>
    `;
    this.labelNode = shadow.querySelector(".label");
    this.control = shadow.querySelector("textarea");
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get value() {
    return this.control.value;
  }
  set value(next) {
    this.setAttribute("value", String(next ?? ""));
  }
  selectText() {
    this.control.focus();
    this.control.select();
  }
  #sync() {
    this.labelNode.textContent = this.getAttribute("label") || "Manual copy required";
    this.control.value = this.getAttribute("value") || "";
  }
}

// src/components/command-palette.js
var COMMAND_PALETTE_STYLES = css`
  :host {
    display: block;
    min-width: min(100%, 320px);
  }

  .palette {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: grid;
    gap: 4px;
    max-height: 280px;
    overflow: auto;
  }

  .command {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: start;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-card-bg, #fbfcfe);
    padding: 7px 8px;
    text-align: left;
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
  }

  .command[aria-selected="true"] {
    border-color: var(--awwbookmarklet-selection-bg, #1f5eae);
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
  }

  .command:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .label {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta,
  .shortcut {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.35;
  }

  .shortcut {
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    white-space: nowrap;
  }

  .empty {
    border: 1px dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-space-3, 12px);
    text-align: center;
  }
`;

class AwwCommandPalette extends HTMLElement {
  static observedAttributes = ["placeholder", "empty-text"];
  #commands = [];
  #filtered = [];
  #activeIndex = 0;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, COMMAND_PALETTE_STYLES]);
    shadow.innerHTML = `
      <section class="palette" part="palette">
        <input part="input" type="search" autocomplete="off" spellcheck="false" aria-label="Filter commands" />
        <div class="list" part="list" role="listbox" aria-label="Commands"></div>
      </section>
    `;
    this.input = shadow.querySelector("input");
    this.list = shadow.querySelector(".list");
    this.input.addEventListener("input", () => this.#filter());
    this.input.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }
  connectedCallback() {
    this.#render();
  }
  attributeChangedCallback() {
    this.#render();
  }
  get commands() {
    return this.#commands;
  }
  set commands(value) {
    this.#commands = Array.isArray(value) ? value : [];
    this.#filter();
  }
  focusInput() {
    this.input?.focus();
  }
  #filter() {
    const query = this.input?.value.trim().toLowerCase() || "";
    this.#filtered = this.#commands.filter((command) => {
      if (!query)
        return true;
      return [command.label, command.group, command.shortcut, ...command.keywords || []].join(" ").toLowerCase().includes(query);
    });
    this.#activeIndex = Math.min(this.#activeIndex, Math.max(0, this.#filtered.length - 1));
    this.#renderList();
    dispatchComponentEvent(this, "awwbookmarklet-command-palette-filter", { query, count: this.#filtered.length });
  }
  #render() {
    if (!this.input)
      return;
    this.input.placeholder = this.getAttribute("placeholder") || "Type a command";
    this.#filter();
  }
  #renderList() {
    this.list.textContent = "";
    if (!this.#filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.setAttribute("part", "empty");
      empty.textContent = this.getAttribute("empty-text") || "No matching commands.";
      this.list.append(empty);
      return;
    }
    this.#filtered.forEach((command, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "command";
      button.setAttribute("part", "command");
      button.disabled = Boolean(command.disabled);
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", index === this.#activeIndex ? "true" : "false");
      button.innerHTML = `
        <span>
          <span class="label" part="label"></span>
          <span class="meta" part="meta"></span>
        </span>
        <span class="shortcut" part="shortcut"></span>
      `;
      button.querySelector(".label").textContent = String(command.label || command.id || "Untitled command");
      button.querySelector(".meta").textContent = [command.group, command.description].filter(Boolean).join(" - ");
      button.querySelector(".shortcut").textContent = String(command.shortcut || "");
      button.addEventListener("click", () => this.#execute(command));
      this.list.append(button);
    });
  }
  #onKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const count = this.#filtered.length;
      if (!count)
        return;
      this.#activeIndex = (this.#activeIndex + step + count) % count;
      this.#renderList();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = this.#filtered[this.#activeIndex];
      if (command)
        this.#execute(command);
    }
  }
  #execute(command) {
    if (command.disabled)
      return;
    dispatchComponentEvent(this, "awwbookmarklet-command-palette-execute", {
      commandId: command.id || "",
      command,
      source: this
    });
    if (typeof command.run === "function")
      command.run(command);
  }
}

// src/components/shortcut-help.js
var SHORTCUT_HELP_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .help {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }

  .group {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .group-title {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(88px, max-content) minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    min-width: 0;
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: 5px;
  }

  kbd {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    padding: 2px 5px;
    font: inherit;
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    white-space: nowrap;
  }

  .description {
    min-width: 0;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

class AwwShortcutHelp extends HTMLElement {
  static observedAttributes = ["empty-text"];
  #shortcuts = [];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, SHORTCUT_HELP_STYLES]);
    shadow.innerHTML = `<section class="help" part="help"></section>`;
    this.helpNode = shadow.querySelector(".help");
  }
  connectedCallback() {
    this.#render();
  }
  attributeChangedCallback() {
    this.#render();
  }
  get shortcuts() {
    return this.#shortcuts;
  }
  set shortcuts(value) {
    this.#shortcuts = Array.isArray(value) ? value : [];
    this.#render();
  }
  #render() {
    if (!this.helpNode)
      return;
    this.helpNode.textContent = "";
    if (!this.#shortcuts.length) {
      const empty = document.createElement("div");
      empty.setAttribute("part", "empty");
      empty.textContent = this.getAttribute("empty-text") || "No shortcuts available.";
      this.helpNode.append(empty);
      return;
    }
    const groups = new Map;
    for (const item of this.#shortcuts) {
      const group = String(item.group || "General");
      if (!groups.has(group))
        groups.set(group, []);
      groups.get(group).push(item);
    }
    for (const [group, items] of groups) {
      const section = document.createElement("section");
      section.className = "group";
      section.setAttribute("part", "group");
      const title = document.createElement("div");
      title.className = "group-title";
      title.setAttribute("part", "group-title");
      title.textContent = group;
      section.append(title);
      for (const item of items) {
        const row = document.createElement("div");
        row.className = "row";
        row.setAttribute("part", "row");
        const key = document.createElement("kbd");
        key.setAttribute("part", "shortcut");
        key.textContent = String(item.shortcut || "");
        const description = document.createElement("div");
        description.className = "description";
        description.setAttribute("part", "description");
        description.textContent = String(item.description || item.label || "");
        row.append(key, description);
        section.append(row);
      }
      this.helpNode.append(section);
    }
  }
}

// src/core/url.js
var DEFAULT_SEARCH_TEMPLATE = "https://www.google.com/search?q={query}";
var BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "file:", "chrome:", "about:"]);
function normalizeSearchTemplate(value, fallback = DEFAULT_SEARCH_TEMPLATE) {
  const template = String(value || "").trim();
  if (!template || !template.includes("{query}"))
    return fallback;
  try {
    const probe = template.replace("{query}", "test");
    const url = new URL(probe);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      return fallback;
    return template;
  } catch {
    return fallback;
  }
}
function buildSearchUrl(query, template = DEFAULT_SEARCH_TEMPLATE) {
  const normalized = normalizeSearchTemplate(template);
  return normalized.replace("{query}", encodeURIComponent(String(query ?? "").trim()));
}
function resolveNavigationInput(value, template = DEFAULT_SEARCH_TEMPLATE) {
  const input = String(value ?? "").trim();
  if (!input)
    return { kind: "ignore", input };
  try {
    const parsed = new URL(input);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { kind: "navigate_url", input, targetUrl: parsed.href };
    }
    if (BLOCKED_PROTOCOLS.has(parsed.protocol)) {
      return { kind: "blocked_protocol", input, protocol: parsed.protocol };
    }
  } catch {}
  if (/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(input)) {
    try {
      return { kind: "navigate_url", input, targetUrl: new URL(`https://${input}`).href };
    } catch {
      return { kind: "search", input, query: input, targetUrl: buildSearchUrl(input, template) };
    }
  }
  return { kind: "search", input, query: input, targetUrl: buildSearchUrl(input, template) };
}
function deriveHostname(value) {
  try {
    return new URL(String(value ?? "").trim()).hostname;
  } catch {
    return "";
  }
}

// src/components/url-picker.js
var URL_PICKER_STYLES = css`
  :host {
    display: block;
    min-width: min(100%, 260px);
  }

  .picker {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: none;
    max-height: 240px;
    overflow: auto;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-menu-bg, #f8fbff);
  }

  :host([open]) .list {
    display: grid;
  }

  .option {
    display: grid;
    gap: 2px;
    min-width: 0;
    border: 0;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    padding: 7px 8px;
    text-align: left;
    font: inherit;
  }

  .option[aria-selected="true"] {
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

class AwwUrlPicker extends HTMLElement {
  static observedAttributes = ["value", "placeholder", "search-template", "open"];
  #suggestions = [];
  #activeIndex = 0;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, URL_PICKER_STYLES]);
    shadow.innerHTML = `
      <section class="picker" part="picker">
        <input part="input" type="text" autocomplete="off" spellcheck="false" aria-label="URL or search query" />
        <div class="list" part="list" role="listbox"></div>
      </section>
    `;
    this.input = shadow.querySelector("input");
    this.list = shadow.querySelector(".list");
    this.input.addEventListener("input", () => this.#onInput());
    this.input.addEventListener("focus", () => this.#openIfUseful());
    this.input.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get value() {
    return this.input?.value || "";
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }
  get suggestions() {
    return this.#suggestions;
  }
  set suggestions(value) {
    this.#suggestions = Array.isArray(value) ? value : [];
    this.#renderList();
  }
  close() {
    this.removeAttribute("open");
  }
  #sync() {
    if (!this.input)
      return;
    const value = this.getAttribute("value") || "";
    if (this.input.value !== value)
      this.input.value = value;
    this.input.placeholder = this.getAttribute("placeholder") || "Type URL or search query";
    this.#renderList();
  }
  #onInput() {
    this.setAttribute("value", this.input.value);
    this.#activeIndex = 0;
    this.#openIfUseful();
    dispatchComponentEvent(this, "awwbookmarklet-url-picker-query", {
      query: this.input.value,
      decision: this.#decision()
    });
  }
  #openIfUseful() {
    if (this.#suggestions.length || this.input.value.trim())
      this.setAttribute("open", "");
  }
  #decision() {
    return resolveNavigationInput(this.input.value, this.getAttribute("search-template") || undefined);
  }
  #onKeyDown(event) {
    if (event.key === "Escape") {
      this.close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const count = this.#visibleItems().length;
      if (!count)
        return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      this.#activeIndex = (this.#activeIndex + step + count) % count;
      this.setAttribute("open", "");
      this.#renderList();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = this.#visibleItems()[this.#activeIndex];
      if (item)
        this.#apply(item);
      else
        this.#apply({ type: "direct", decision: this.#decision() });
    }
  }
  #visibleItems() {
    const decision = this.#decision();
    const direct = decision.kind === "ignore" || decision.kind === "blocked_protocol" ? [] : [{ type: "direct", decision }];
    return [...direct, ...this.#suggestions];
  }
  #renderList() {
    if (!this.list)
      return;
    this.list.textContent = "";
    const items = this.#visibleItems();
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.setAttribute("part", "option");
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", index === this.#activeIndex ? "true" : "false");
      const title = document.createElement("span");
      title.className = "title";
      title.setAttribute("part", "title");
      const meta = document.createElement("span");
      meta.className = "meta";
      meta.setAttribute("part", "meta");
      if (item.type === "direct") {
        title.textContent = item.decision.kind === "navigate_url" ? `Open ${item.decision.targetUrl}` : `Search for "${item.decision.query}"`;
        meta.textContent = item.decision.kind === "navigate_url" ? deriveHostname(item.decision.targetUrl) : item.decision.targetUrl;
      } else {
        title.textContent = String(item.title || item.label || item.url || "Untitled");
        meta.textContent = String(item.description || item.url || "");
      }
      button.append(title, meta);
      button.addEventListener("click", () => this.#apply(item));
      this.list.append(button);
    });
  }
  #apply(item) {
    const decision = item.type === "direct" ? item.decision : { kind: "navigate_url", input: item.url || "", targetUrl: item.url || "" };
    if (decision.kind === "blocked_protocol" || decision.kind === "ignore")
      return;
    this.value = decision.targetUrl || "";
    this.close();
    dispatchComponentEvent(this, "awwbookmarklet-url-picker-apply", { item, decision, source: this });
  }
}

// src/components/metric-card.js
var METRIC_CARD_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .metric {
    display: grid;
    gap: 4px;
    min-width: 0;
    border: 1px solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    background: var(--awwbookmarklet-metric-bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  .label,
  .description {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .value {
    font-size: 22px;
    font-weight: 750;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .delta {
    color: var(--_fg, var(--awwbookmarklet-text-muted, #586272));
    font-size: 12px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  :host([compact]) .value {
    font-size: 18px;
  }

  :host([data-tone="info"]) { --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

class AwwMetricCard extends HTMLElement {
  static observedAttributes = ["label", "value", "description", "delta", "tone"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, METRIC_CARD_STYLES]);
    shadow.innerHTML = `
      <section class="metric" part="metric">
        <div class="label" part="label"><slot name="label"></slot><span data-label></span></div>
        <div class="value" part="value"><slot name="value"></slot><span data-value></span></div>
        <div class="delta" part="delta"><slot name="delta"></slot><span data-delta></span></div>
        <div class="description" part="description"><slot name="description"></slot><span data-description></span><slot></slot></div>
      </section>
    `;
    this.labelNode = shadow.querySelector("[data-label]");
    this.valueNode = shadow.querySelector("[data-value]");
    this.deltaNode = shadow.querySelector("[data-delta]");
    this.descriptionNode = shadow.querySelector("[data-description]");
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
    this.labelNode.textContent = this.getAttribute("label") || "";
    this.valueNode.textContent = this.getAttribute("value") || "";
    this.deltaNode.textContent = this.getAttribute("delta") || "";
    this.descriptionNode.textContent = this.getAttribute("description") || "";
  }
}

// src/components/register-all.js
function registerAllComponents() {
  defineMany([
    [TAGS.desktopRoot, AwwDesktopRoot],
    [TAGS.window, AwwWindow],
    [TAGS.menubar, AwwMenubar],
    [TAGS.menu, AwwMenu],
    [TAGS.button, AwwButton],
    [TAGS.iconButton, AwwIconButton],
    [TAGS.input, AwwInput],
    [TAGS.textarea, AwwTextarea],
    [TAGS.checkbox, AwwCheckbox],
    [TAGS.radio, AwwRadio],
    [TAGS.select, AwwSelect],
    [TAGS.range, AwwRange],
    [TAGS.progress, AwwProgress],
    [TAGS.tabs, AwwTabs],
    [TAGS.tabPanel, AwwTabPanel],
    [TAGS.listbox, AwwListbox],
    [TAGS.group, AwwGroup],
    [TAGS.panel, AwwPanel],
    [TAGS.statusbar, AwwStatusbar],
    [TAGS.appShell, AwwAppShell],
    [TAGS.toolbar, AwwToolbar],
    [TAGS.field, AwwField],
    [TAGS.statusLine, AwwStatusLine],
    [TAGS.alert, AwwAlert],
    [TAGS.dialog, AwwDialog],
    [TAGS.toast, AwwToast],
    [TAGS.emptyState, AwwEmptyState],
    [TAGS.stateOverlay, AwwStateOverlay],
    [TAGS.list, AwwList],
    [TAGS.listItem, AwwListItem],
    [TAGS.card, AwwCard],
    [TAGS.richPreview, AwwRichPreview],
    [TAGS.browserPanel, AwwBrowserPanel],
    [TAGS.manualCopy, AwwManualCopy],
    [TAGS.commandPalette, AwwCommandPalette],
    [TAGS.shortcutHelp, AwwShortcutHelp],
    [TAGS.urlPicker, AwwUrlPicker],
    [TAGS.metricCard, AwwMetricCard]
  ]);
}

// src/themes/default-theme.js
var DEFAULT_THEME = {
  [PUBLIC_TOKENS.workspaceBg]: "rgba(0, 0, 0, 0)",
  [PUBLIC_TOKENS.windowBg]: "#eef1f5",
  [PUBLIC_TOKENS.panelBg]: "#f8fafc",
  [PUBLIC_TOKENS.titlebarActiveBg]: "rgba(46, 92, 142, 0.78)",
  [PUBLIC_TOKENS.titlebarInactiveBg]: "rgba(136, 145, 160, 0.84)",
  [PUBLIC_TOKENS.titlebarFg]: "#f8fbff",
  [PUBLIC_TOKENS.borderStrong]: "#232a33",
  [PUBLIC_TOKENS.borderSubtle]: "#9ba5b3",
  [PUBLIC_TOKENS.focusRing]: "#154fbc",
  [PUBLIC_TOKENS.buttonBg]: "#f1f4f8",
  [PUBLIC_TOKENS.buttonFg]: "#111720",
  [PUBLIC_TOKENS.buttonActiveBg]: "#dbe3ee",
  [PUBLIC_TOKENS.inputBg]: "#ffffff",
  [PUBLIC_TOKENS.inputFg]: "#111720",
  [PUBLIC_TOKENS.menuBg]: "#f8fbff",
  [PUBLIC_TOKENS.menuFg]: "#0e1621",
  [PUBLIC_TOKENS.selectionBg]: "#1f5eae",
  [PUBLIC_TOKENS.selectionFg]: "#f2f8ff",
  [PUBLIC_TOKENS.statusbarBg]: "#e5e8ee",
  [PUBLIC_TOKENS.appShellBg]: "#eef1f5",
  [PUBLIC_TOKENS.surfaceRaisedBg]: "#ffffff",
  [PUBLIC_TOKENS.surfaceInsetBg]: "#e7ebf1",
  [PUBLIC_TOKENS.textMuted]: "#586272",
  [PUBLIC_TOKENS.textHelp]: "#657184",
  [PUBLIC_TOKENS.dividerColor]: "#c3cad4",
  [PUBLIC_TOKENS.infoBg]: "#e7f0ff",
  [PUBLIC_TOKENS.infoFg]: "#123d7a",
  [PUBLIC_TOKENS.infoBorder]: "#7aa6e8",
  [PUBLIC_TOKENS.successBg]: "#e5f5eb",
  [PUBLIC_TOKENS.successFg]: "#195b34",
  [PUBLIC_TOKENS.successBorder]: "#72b98b",
  [PUBLIC_TOKENS.warningBg]: "#fff4d6",
  [PUBLIC_TOKENS.warningFg]: "#6d4b00",
  [PUBLIC_TOKENS.warningBorder]: "#d9ad3b",
  [PUBLIC_TOKENS.dangerBg]: "#ffe8e6",
  [PUBLIC_TOKENS.dangerFg]: "#8a1f17",
  [PUBLIC_TOKENS.dangerBorder]: "#d46a60",
  [PUBLIC_TOKENS.overlayBackdrop]: "rgba(12, 18, 28, 0.38)",
  [PUBLIC_TOKENS.overlayShadow]: "0 18px 44px rgba(0, 0, 0, 0.24)",
  [PUBLIC_TOKENS.cardBg]: "#fbfcfe",
  [PUBLIC_TOKENS.cardSelectedBg]: "#e8f1ff",
  [PUBLIC_TOKENS.metricBg]: "#ffffff",
  [PUBLIC_TOKENS.codeBg]: "#e8edf4",
  [PUBLIC_TOKENS.codeFg]: "#172131",
  [PUBLIC_TOKENS.shadowDepth]: "0 12px 32px rgba(0, 0, 0, 0.18)",
  [PUBLIC_TOKENS.frostOpacity]: "0.9",
  [PUBLIC_TOKENS.space1]: "4px",
  [PUBLIC_TOKENS.space2]: "8px",
  [PUBLIC_TOKENS.space3]: "12px",
  [PUBLIC_TOKENS.controlHeight]: "30px",
  [PUBLIC_TOKENS.titleHeight]: "32px"
};

// src/core/theme.js
class ThemeService {
  #theme;
  constructor(theme = DEFAULT_THEME) {
    this.#theme = { ...theme };
  }
  get tokens() {
    return { ...this.#theme };
  }
  setTheme(themePatch) {
    this.#theme = { ...this.#theme, ...themePatch };
    return this.tokens;
  }
  applyTheme(target) {
    for (const [token, value] of Object.entries(this.#theme)) {
      target.style.setProperty(token, value);
    }
  }
}
var defaultThemeService = new ThemeService(DEFAULT_THEME);

// src/core/window-manager.js
class WindowManager {
  #windows = new Set;
  #activeWindow = null;
  #nextZ = 1;
  #onViewportChange;
  #destroyed = false;
  constructor() {
    this.#onViewportChange = () => this.clampAll();
    window.addEventListener("resize", this.#onViewportChange, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.#onViewportChange, { passive: true });
      window.visualViewport.addEventListener("scroll", this.#onViewportChange, { passive: true });
    }
  }
  register(win) {
    if (this.#destroyed || this.#windows.has(win))
      return;
    this.#windows.add(win);
    const rect = win.getRect();
    if (!rect) {
      win.setRect(this.getSpawnRect());
    } else {
      win.setRect(clampRect(rect));
    }
    this.focus(win);
  }
  unregister(win) {
    if (!this.#windows.delete(win))
      return;
    if (this.#activeWindow === win) {
      this.#activeWindow = null;
      const fallback = [...this.#windows].at(-1) ?? null;
      if (fallback)
        this.focus(fallback);
    }
  }
  getSpawnRect() {
    return getSpawnRect(this.#windows.size, getViewportRect(), DEFAULT_GEOMETRY);
  }
  focus(win) {
    if (!this.#windows.has(win))
      return;
    if (this.#activeWindow && this.#activeWindow !== win) {
      this.#activeWindow.setActive(false);
    }
    this.#activeWindow = win;
    win.setActive(true);
    win.setZIndex(this.#nextZ++);
  }
  clampAll() {
    for (const win of this.#windows) {
      const rect = win.getRect();
      if (!rect)
        continue;
      win.setRect(clampRect(rect));
    }
  }
  destroy() {
    if (this.#destroyed)
      return;
    this.#destroyed = true;
    window.removeEventListener("resize", this.#onViewportChange);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", this.#onViewportChange);
      window.visualViewport.removeEventListener("scroll", this.#onViewportChange);
    }
    this.#windows.clear();
    this.#activeWindow = null;
  }
}

// src/core/runtime.js
function getGlobalMap() {
  if (!globalThis[GLOBAL_SYMBOLS.rootsByVersion]) {
    globalThis[GLOBAL_SYMBOLS.rootsByVersion] = new Map;
  }
  return globalThis[GLOBAL_SYMBOLS.rootsByVersion];
}
function createDesktopRecord(version = FRAMEWORK_VERSION) {
  const root = document.createElement(TAGS.desktopRoot);
  root.dataset.version = version;
  document.documentElement.append(root);
  defaultThemeService.applyTheme(root);
  const record = {
    version,
    root,
    manager: new WindowManager,
    owners: new Set,
    destroy() {
      this.manager.destroy();
      this.root.remove();
      this.owners.clear();
    }
  };
  root.__awwManager = record.manager;
  return record;
}
function acquireDesktopRoot(owner = "default-owner", version = FRAMEWORK_VERSION) {
  const roots = getGlobalMap();
  let record = roots.get(version);
  if (!record || !record.root.isConnected) {
    record = createDesktopRecord(version);
    roots.set(version, record);
  }
  record.owners.add(owner);
  globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] = record.root;
  globalThis[GLOBAL_SYMBOLS.version] = version;
  return record;
}
function releaseDesktopRoot(owner = "default-owner", version = FRAMEWORK_VERSION) {
  const roots = getGlobalMap();
  const record = roots.get(version);
  if (!record)
    return;
  record.owners.delete(owner);
  if (record.owners.size > 0)
    return;
  record.destroy();
  roots.delete(version);
  if (globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] === record.root) {
    delete globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot];
  }
}
function emergencyTeardown(version = FRAMEWORK_VERSION) {
  const roots = getGlobalMap();
  if (version === "*") {
    for (const [key, record2] of roots) {
      record2.destroy();
      roots.delete(key);
    }
    delete globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot];
    return;
  }
  const record = roots.get(version);
  if (!record)
    return;
  record.destroy();
  roots.delete(version);
  if (globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] === record.root) {
    delete globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot];
  }
}

// src/demo/example-tool.js
function iconPlus() {
  return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="square"/></svg>`;
}
function buildExampleToolWindow({ title = "Page Extraction Tool" } = {}) {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", title);
  const menubar = document.createElement(TAGS.menubar);
  menubar.slot = "menubar";
  menubar.innerHTML = `
    <button type="button" data-menu="file">File</button>
    <button type="button" data-menu="view">View</button>
    <button type="button" data-menu="help">Help</button>

    <${TAGS.menu} name="file">
      <button type="button" data-command="tool.run">Run</button>
      <button type="button" data-command="tool.reset">Reset</button>
      <div data-separator role="separator"></div>
      <button type="button" data-command="tool.close">Close</button>
    </${TAGS.menu}>

    <${TAGS.menu} name="view">
      <button type="button" data-command="view.compact">Compact Mode</button>
      <button type="button" data-command="view.normal">Normal Mode</button>
    </${TAGS.menu}>

    <${TAGS.menu} name="help">
      <button type="button" data-command="help.about">About</button>
    </${TAGS.menu}>
  `;
  const toolbar = document.createElement("div");
  toolbar.slot = "toolbar";
  toolbar.style.display = "flex";
  toolbar.style.flexWrap = "wrap";
  toolbar.style.gap = "8px";
  toolbar.style.padding = "6px 8px";
  toolbar.style.alignItems = "center";
  toolbar.innerHTML = `
    <${TAGS.iconButton} id="tool-refresh" aria-label="Refresh">${iconPlus()}</${TAGS.iconButton}>
    <${TAGS.button} id="tool-run">Run</${TAGS.button}>
    <${TAGS.button} id="tool-close">Close</${TAGS.button}>
  `;
  const status = document.createElement(TAGS.statusbar);
  status.slot = "statusbar";
  status.innerHTML = `<span id="status-main">Ready</span><span id="status-count">0 selected</span><span id="status-mode">Normal</span>`;
  const body = document.createElement("div");
  body.style.display = "grid";
  body.style.gap = "12px";
  body.innerHTML = `
    <${TAGS.group} caption="Target">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:8px; align-items:center;">
        <${TAGS.input} id="target-input" placeholder="CSS selector or current selection"></${TAGS.input}>
        <${TAGS.button} id="target-refresh">Refresh</${TAGS.button}>
        <${TAGS.button} id="target-pick">Pick Again</${TAGS.button}>
      </div>
    </${TAGS.group}>

    <${TAGS.panel}>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        <${TAGS.group} caption="Options">
          <div style="display:grid; gap:8px;">
            <${TAGS.checkbox} checked id="opt-trim">Trim whitespace</${TAGS.checkbox}>
            <${TAGS.checkbox} id="opt-links">Include links</${TAGS.checkbox}>
            <${TAGS.checkbox} checked id="opt-visible">Only visible nodes</${TAGS.checkbox}>
            <div style="display:grid; gap:6px; margin-top:4px;">
              <${TAGS.radio} name="mode" value="text" checked>Text</${TAGS.radio}>
              <${TAGS.radio} name="mode" value="html">HTML</${TAGS.radio}>
            </div>
          </div>
        </${TAGS.group}>

        <${TAGS.group} caption="Output">
          <${TAGS.tabs} id="output-tabs">
            <${TAGS.tabPanel} label="Result" selected>
              <${TAGS.textarea} id="result-output" rows="6" placeholder="Extraction result"></${TAGS.textarea}>
            </${TAGS.tabPanel}>
            <${TAGS.tabPanel} label="History">
              <${TAGS.listbox} id="history-list">
                <div role="option" aria-selected="true" data-value="run-1">Run #1</div>
                <div role="option" data-value="run-2">Run #2</div>
                <div role="option" data-value="run-3">Run #3</div>
              </${TAGS.listbox}>
            </${TAGS.tabPanel}>
          </${TAGS.tabs}>
        </${TAGS.group}>
      </div>
    </${TAGS.panel}>

    <${TAGS.group} caption="Actions">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; align-items:center;">
        <div style="display:grid; gap:8px;">
          <label style="display:grid; gap:4px;">Preset
            <${TAGS.select} id="preset-select">
              <option value="quick" selected>Quick</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full</option>
            </${TAGS.select}>
          </label>
          <label style="display:grid; gap:4px;">Confidence
            <${TAGS.range} id="confidence-range" min="0" max="100" value="65"></${TAGS.range}>
          </label>
        </div>
        <div style="display:grid; gap:8px;">
          <${TAGS.progress} id="run-progress" value="0" max="100"></${TAGS.progress}>
          <div style="display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px;">
            <${TAGS.button} id="action-run">Run</${TAGS.button}>
            <${TAGS.button} id="action-close">Close</${TAGS.button}>
          </div>
        </div>
      </div>
    </${TAGS.group}>
  `;
  win.append(menubar, toolbar, body, status);
  const statusMain = () => status.querySelector("#status-main");
  const statusCount = () => status.querySelector("#status-count");
  const statusMode = () => status.querySelector("#status-mode");
  const setStatus = (text) => {
    statusMain().textContent = text;
  };
  const setMode = (mode) => {
    statusMode().textContent = mode;
    body.dataset.mode = mode;
    if (mode === "Compact") {
      body.style.gap = "8px";
    } else {
      body.style.gap = "12px";
    }
  };
  const close = () => win.requestClose();
  const run = () => {
    setStatus("Running...");
    const progress = body.querySelector("#run-progress");
    let value = Number(progress.getAttribute("value") || "0");
    value = Math.min(100, value + 35);
    progress.setAttribute("value", String(value));
    const output = body.querySelector("#result-output");
    output.value = `Extracted ${value} records from ${body.querySelector("#target-input").value || "current page"}.`;
    statusCount().textContent = `${Math.ceil(value / 10)} selected`;
    setStatus(value >= 100 ? "Completed" : "Running step complete");
  };
  menubar.commandRegistry.register({ id: "tool.run", label: "Run", run });
  menubar.commandRegistry.register({ id: "tool.reset", label: "Reset", run: () => {
    body.querySelector("#run-progress").setAttribute("value", "0");
    body.querySelector("#result-output").value = "";
    setStatus("Ready");
    statusCount().textContent = "0 selected";
  } });
  menubar.commandRegistry.register({ id: "tool.close", label: "Close", run: close });
  menubar.commandRegistry.register({ id: "view.compact", label: "Compact", run: () => setMode("Compact") });
  menubar.commandRegistry.register({ id: "view.normal", label: "Normal", run: () => setMode("Normal") });
  menubar.commandRegistry.register({ id: "help.about", label: "About", run: () => setStatus("AWW Bookmarklet Framework v1") });
  toolbar.querySelector("#tool-run").addEventListener("click", run);
  toolbar.querySelector("#tool-close").addEventListener("click", close);
  toolbar.querySelector("#tool-refresh").addEventListener("click", () => setStatus("Refreshed target snapshot"));
  body.querySelector("#target-refresh").addEventListener("click", () => setStatus("Target refreshed"));
  body.querySelector("#target-pick").addEventListener("click", () => setStatus("Pick mode enabled"));
  body.querySelector("#action-run").addEventListener("click", run);
  body.querySelector("#action-close").addEventListener("click", close);
  body.querySelector("#history-list").addEventListener("change", (event) => {
    setStatus(`History selected: ${event.detail.value}`);
  });
  body.querySelectorAll(`${TAGS.radio}[name='mode']`).forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.hasAttribute("checked"))
        setStatus(`Mode switched to ${radio.getAttribute("value")}`);
    });
  });
  body.querySelector("#confidence-range").addEventListener("input", (event) => {
    statusCount().textContent = `${event.target.value}% confidence`;
  });
  return win;
}

// src/demo/catalog.js
registerAllComponents();
var CATALOG_OWNER = "catalog-page";
acquireDesktopRoot(CATALOG_OWNER);
var serial = 0;
function nextOwner(prefix) {
  serial += 1;
  return `${prefix}-${serial}`;
}
function icon(path) {
  return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${path}" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
}
function mountWindow(win, prefix) {
  const owner = nextOwner(prefix);
  const record = acquireDesktopRoot(owner);
  record.root.append(win);
  win.addEventListener("awwbookmarklet-window-closed", () => releaseDesktopRoot(owner), { once: true });
  return win;
}
function openExample() {
  mountWindow(buildExampleToolWindow({ title: "Example Tool" }), "example");
}
function openBlank() {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", "Blank Shell");
  win.innerHTML = `
    <${TAGS.panel}>
      <span slot="title">Empty workspace</span>
      <p class="inline-note">Movable, resizable shell with optional regions.</p>
      <p class="inline-note">Resize this window to check narrow layout behavior.</p>
    </${TAGS.panel}>
    <${TAGS.statusbar} slot="statusbar"><span>Ready</span><span>Blank</span><span>No errors</span></${TAGS.statusbar}>
  `;
  win.setRect({ x: 110, y: 80, width: 420, height: 260 });
  mountWindow(win, "blank");
}
function specimen({ title, description, tag, span = 6, body, variant = "default", tone = "", footerNote = "" }) {
  const node = document.createElement("section");
  node.className = `specimen specimen--${variant} span-${span}${tone ? ` specimen--${tone}` : ""}`;
  node.innerHTML = `
    <header class="specimen-header">
      <div>
        <h3 class="specimen-title">${title}</h3>
        ${description ? `<p class="specimen-desc">${description}</p>` : ""}
      </div>
      <p class="specimen-tag">${tag}</p>
    </header>
    <div class="specimen-body"></div>
    ${footerNote ? `<footer class="specimen-footer">${footerNote}</footer>` : ""}
  `;
  node.querySelector(".specimen-body").append(body);
  return node;
}
function section({ label, title, description, children }) {
  const node = document.createElement("section");
  node.className = "catalog-section section-band";
  node.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="section-label">${label}</p>
        <h2>${title}</h2>
      </div>
      <p>${description}</p>
    </div>
    <div class="specimen-grid"></div>
  `;
  node.querySelector(".specimen-grid").append(...children);
  return node;
}
function htmlNode(markup, className = "demo-stack") {
  const node = document.createElement("div");
  node.className = className;
  node.innerHTML = markup;
  return node;
}
function componentTagList(items) {
  return `<div class="component-tags">${items.map((item) => `<span>${item}</span>`).join("")}</div>`;
}
function showcaseFrame(markup) {
  return htmlNode(`<div class="showcase-frame">${markup}</div>`, "showcase-wrap");
}
function toolCard({ name, legacy, components }) {
  return `
    <article class="migration-card">
      <h4>${name}</h4>
      <p>${legacy}</p>
      ${componentTagList(components)}
    </article>
  `;
}
function stateMatrix(items) {
  return htmlNode(`
    <div class="state-matrix">
      ${items.map((item) => `
        <div class="state-cell">
          <${TAGS.stateOverlay} state="${item.state}" label="${item.label}">
            ${item.actions ? `<${TAGS.toolbar} slot="actions" density="compact" wrap>${item.actions}</${TAGS.toolbar}>` : ""}
          </${TAGS.stateOverlay}>
        </div>
      `).join("")}
    </div>
  `);
}
var mockArticleSrcdoc = `<!doctype html>
<html><head><style>
body{margin:0;font:14px system-ui,sans-serif;color:#1a2433;background:#fff}
.wrap{padding:18px;display:grid;gap:12px}
h1{font-size:21px;margin:0}
p{margin:0;line-height:1.45;color:#3f4b5c}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.card{border:1px solid #b9c2ce;background:#f5f7fa;padding:10px}
.bar{height:10px;background:#2f6fb7;margin-top:6px}
table{width:100%;border-collapse:collapse;font-size:12px}
td,th{border:1px solid #cbd3de;padding:5px;text-align:left}
</style></head><body><main class="wrap">
<h1>Research Capture</h1>
<p>Mock loaded document for iframe, overflow, and blocked-preview workflows.</p>
<div class="grid"><div class="card">Selected text<div class="bar" style="width:78%"></div></div><div class="card">Images found<div class="bar" style="width:42%"></div></div></div>
<table><tr><th>Block</th><th>Status</th></tr><tr><td>Article heading</td><td>Captured</td></tr><tr><td>Long quote</td><td>Needs review</td></tr></table>
</main></body></html>`;
function hydrateMockBrowser(panel) {
  queueMicrotask(() => {
    if (panel.addressFallback)
      panel.addressFallback.textContent = "";
    panel.frame?.setAttribute("srcdoc", mockArticleSrcdoc);
  });
}
function buildShellDemo() {
  return htmlNode(`
    <div class="demo-row">
      <${TAGS.button} id="open-example" variant="primary">Open Example Tool</${TAGS.button}>
      <${TAGS.button} id="open-blank">Open Blank Window</${TAGS.button}>
    </div>
    <div class="callout">Floating windows are intentionally tested outside the document flow. Open both shells, then drag, resize, focus, and close them.</div>
    <div class="token-strip">
      <span class="token">${TAGS.window}</span>
      <span class="token">${TAGS.menubar}</span>
      <span class="token">${TAGS.statusbar}</span>
    </div>
  `);
}
function buildControlDemo() {
  return htmlNode(`
    <div class="demo-row">
      <${TAGS.button} variant="primary">Primary</${TAGS.button}>
      <${TAGS.button}>Default</${TAGS.button}>
      <${TAGS.button} variant="ghost">Ghost</${TAGS.button}>
      <${TAGS.button} tone="danger">Danger</${TAGS.button}>
      <${TAGS.button} disabled>Disabled</${TAGS.button}>
      <${TAGS.iconButton} label="Add">${icon("M8 3v10M3 8h10")}</${TAGS.iconButton}>
      <${TAGS.iconButton} label="Remove" tone="danger">${icon("M4 8h8")}</${TAGS.iconButton}>
    </div>
    <div class="demo-two-col">
      <div class="demo-stack">
        <${TAGS.input} value="Inline input"></${TAGS.input}>
        <${TAGS.textarea} rows="4" value="Inline textarea"></${TAGS.textarea}>
      </div>
      <div class="demo-stack">
        <${TAGS.select}><option selected>Preset 1</option><option>Preset 2</option></${TAGS.select}>
        <${TAGS.range} min="0" max="100" value="45"></${TAGS.range}>
        <${TAGS.progress} value="45" max="100"></${TAGS.progress}>
      </div>
    </div>
    <div class="demo-row">
      <${TAGS.checkbox} checked>Remember choice</${TAGS.checkbox}>
      <${TAGS.radio} name="demo-inline" checked>Text</${TAGS.radio}>
      <${TAGS.radio} name="demo-inline">HTML</${TAGS.radio}>
    </div>
  `);
}
function buildLayoutDemo() {
  return htmlNode(`
    <${TAGS.group} caption="Compact settings">
      <${TAGS.tabs}>
        <${TAGS.tabPanel} label="Settings" selected>
          <${TAGS.listbox}>
            <div role="option" aria-selected="true">Mode A</div>
            <div role="option">Mode B</div>
            <div role="option">Mode C</div>
          </${TAGS.listbox}>
        </${TAGS.tabPanel}>
        <${TAGS.tabPanel} label="Status">
          <${TAGS.statusbar}><span>Ready</span><span>3 items</span><span>Stable</span></${TAGS.statusbar}>
        </${TAGS.tabPanel}>
      </${TAGS.tabs}>
    </${TAGS.group}>
    <${TAGS.panel}>
      <span slot="title">Panel with actions</span>
      <span slot="subtitle">Header regions stay separate from body content.</span>
      <${TAGS.toolbar} slot="actions" density="compact" wrap>
        <${TAGS.button}>Apply</${TAGS.button}>
        <${TAGS.button} variant="ghost">Reset</${TAGS.button}>
      </${TAGS.toolbar}>
      <p class="inline-note">This compact composition validates group, panel, tabs, listbox, toolbar, and status surfaces without hiding their boundaries.</p>
    </${TAGS.panel}>
  `);
}
function buildWorkflowDemo() {
  const wrap = showcaseFrame(`
    <${TAGS.appShell}>
      <span slot="title">Session Capture Console</span>
      <span slot="subtitle">Mock workflow for screenshot, reminder, and content-selection tools.</span>
      <${TAGS.toolbar} slot="actions" wrap density="compact" align="end">
        <${TAGS.button} variant="primary" command="capture.collect">Collect</${TAGS.button}>
        <${TAGS.button} variant="ghost">Refresh</${TAGS.button}>
        <${TAGS.button} tone="danger">Clear</${TAGS.button}>
      </${TAGS.toolbar}>
      <${TAGS.statusLine} slot="status" tone="success">Ready. 3 mock rows loaded.</${TAGS.statusLine}>
      <div slot="body" class="demo-stack">
        <${TAGS.alert} tone="warning" title="Draft available" dismissible>
          A previous capture draft can be restored before starting a new run.
          <${TAGS.toolbar} slot="actions" density="compact" wrap>
            <${TAGS.button}>Restore</${TAGS.button}>
            <${TAGS.button} variant="ghost">Start fresh</${TAGS.button}>
          </${TAGS.toolbar}>
        </${TAGS.alert}>

        <${TAGS.panel}>
          <span slot="title">Capture settings</span>
          <${TAGS.toolbar} slot="actions" density="compact" wrap>
            <${TAGS.button} id="demo-toast" variant="primary">Show toast</${TAGS.button}>
            <${TAGS.button} id="demo-dialog-btn">Open dialog</${TAGS.button}>
          </${TAGS.toolbar}>
          <div class="field-grid">
            <${TAGS.field} label="JPEG quality" help="Used by session screenshot exports." suffix="%" required>
              <${TAGS.input} type="number" min="1" max="100" value="80"></${TAGS.input}>
              <span slot="suffix">%</span>
            </${TAGS.field}>
            <${TAGS.field} label="Reminder delay" error="Delay must be at least 1 minute.">
              <${TAGS.input} type="number" value="0"></${TAGS.input}>
              <span slot="suffix">min</span>
            </${TAGS.field}>
          </div>
        </${TAGS.panel}>
      </div>
    </${TAGS.appShell}>

    <${TAGS.dialog} id="demo-dialog" modal label="Demo dialog" close-on-backdrop>
      <span slot="title">Command-like dialog</span>
      <p class="inline-note">This dialog uses the shared overlay and focus-restoration path.</p>
      <${TAGS.toolbar} slot="footer" align="end">
        <${TAGS.button} id="demo-dialog-close">Close</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.dialog}>
  `);
  wrap.querySelector("#demo-toast").addEventListener("click", () => {
    showToast({ key: "demo", message: "Saved mock draft", tone: "success", timeout: 1800 });
  });
  wrap.querySelector("#demo-dialog-btn").addEventListener("click", () => wrap.querySelector("#demo-dialog").show());
  wrap.querySelector("#demo-dialog-close").addEventListener("click", () => wrap.querySelector("#demo-dialog").close("demo"));
  return wrap;
}
function buildFieldMatrixDemo() {
  return htmlNode(`
    <div class="field-grid">
      <${TAGS.field} label="Due at" help="This is the event deadline time." required>
        <${TAGS.input} type="datetime-local" value="2026-04-25T17:30"></${TAGS.input}>
      </${TAGS.field}>
      <${TAGS.field} label="JPEG quality" help="Screenshot export quality." orientation="horizontal">
        <${TAGS.input} type="number" min="1" max="100" value="82"></${TAGS.input}>
        <span slot="suffix">%</span>
      </${TAGS.field}>
      <${TAGS.field} label="Reminder offset" error="Offset must be between 0 and 10080 minutes.">
        <${TAGS.input} type="number" value="-1"></${TAGS.input}>
        <span slot="suffix">min</span>
      </${TAGS.field}>
      <${TAGS.field} label="Capture mode" orientation="inline">
        <${TAGS.select}><option selected>Visible viewport</option><option>Full page</option><option>Selected region</option></${TAGS.select}>
      </${TAGS.field}>
      <${TAGS.field} label="Disabled setting" help="Inherited from browser policy." disabled>
        <${TAGS.checkbox} checked>Enable page toolbar</${TAGS.checkbox}>
      </${TAGS.field}>
      <${TAGS.field} label="Filename prefix">
        <span slot="prefix">session-</span>
        <${TAGS.input} value="research"></${TAGS.input}>
      </${TAGS.field}>
    </div>
  `);
}
function buildFeedbackMatrixDemo() {
  return htmlNode(`
    <div class="demo-stack">
      <div class="status-strip">
        <${TAGS.statusLine}>Idle</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="info" busy>Loading suggestions</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="success">Saved</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="warning">Needs fallback</${TAGS.statusLine}>
        <${TAGS.statusLine} tone="danger">Capture failed</${TAGS.statusLine}>
      </div>
      <${TAGS.alert} tone="info" title="Privacy note">Page content stays local until an explicit export action.</${TAGS.alert}>
      <${TAGS.alert} tone="success" title="Draft restored" dismissible>
        Previous session data is available.
        <${TAGS.toolbar} slot="actions" density="compact" wrap>
          <${TAGS.button}>Review</${TAGS.button}>
          <${TAGS.button} variant="ghost">Dismiss</${TAGS.button}>
        </${TAGS.toolbar}>
      </${TAGS.alert}>
      <${TAGS.alert} tone="warning" title="Browser blocked the preview">Open externally or retry after changing page policy.</${TAGS.alert}>
      <${TAGS.alert} tone="danger" title="Clipboard denied">Use manual copy to finish the operation.</${TAGS.alert}>
    </div>
  `);
}
function buildRowsDemo() {
  return htmlNode(`
    <${TAGS.list} empty-text="No captured pages">
      <${TAGS.listItem} selectable selected tone="success">
        <span slot="title">Current research page</span>
        <span slot="meta">example.com - captured just now</span>
        <span slot="description">A long captured page title and description wrap without breaking the row layout.</span>
        <${TAGS.statusLine} slot="status" tone="success" compact>Captured</${TAGS.statusLine}>
        <${TAGS.toolbar} slot="actions" density="compact">
          <${TAGS.iconButton} label="Copy">${icon("M5 3h7v9H5zM3 5h2v8h7")}</${TAGS.iconButton}>
          <${TAGS.iconButton} label="Delete" tone="danger">${icon("M4 5h8M6 5v7m4-7v7M6 3h4l1 2H5z")}</${TAGS.iconButton}>
        </${TAGS.toolbar}>
      </${TAGS.listItem}>
      <${TAGS.listItem} tone="warning">
        <span slot="title">Blocked iframe page</span>
        <span slot="meta">blocked.example</span>
        <span slot="description">The row keeps actions separate from row activation.</span>
        <${TAGS.statusLine} slot="status" tone="warning" compact>Needs fallback</${TAGS.statusLine}>
      </${TAGS.listItem}>
      <${TAGS.listItem} interactive tone="danger">
        <span slot="leading" class="token">404</span>
        <span slot="title">Untitled captured tab with a very long URL-only fallback title that still needs to wrap cleanly</span>
        <span slot="meta">https://example.invalid/research/very/long/path?with=query-string</span>
        <span slot="description">Failed captures, missing titles, and long URLs are normal data, not edge-case noise.</span>
        <${TAGS.statusLine} slot="status" tone="danger" compact>Failed</${TAGS.statusLine}>
      </${TAGS.listItem}>
    </${TAGS.list}>
    <${TAGS.card} tone="info">
      <span slot="title">Preview card</span>
      <span slot="meta">Reusable card shell</span>
      Cards provide a stable header, body, action, media, and footer surface for captured blocks or settings rows.
    </${TAGS.card}>
  `);
}
function buildMetricDemo() {
  return htmlNode(`
    <div class="metric-grid">
      <${TAGS.metricCard} label="Open tabs" value="9" delta="+2" tone="info" description="Browser surfaces in the workspace"></${TAGS.metricCard}>
      <${TAGS.metricCard} label="Captured blocks" value="34" delta="12 new" tone="success" description="Saved locally in this session"></${TAGS.metricCard}>
      <${TAGS.metricCard} label="Fallbacks" value="2" delta="Needs action" tone="warning" description="Iframe or clipboard policy issues"></${TAGS.metricCard}>
    </div>
  `);
}
function buildPreviewDemo() {
  const wrap = htmlNode(`
    <div class="preview-duo">
    <div class="surface-frame rich-preview-frame">
      <${TAGS.richPreview} id="kit-rich-preview" empty-text="No preview"></${TAGS.richPreview}>
    </div>
    <${TAGS.browserPanel} class="browser-demo" title="Mock browser panel" loading-label="Loading mock page">
      <span slot="address">https://example.com/research/capture</span>
      <${TAGS.toolbar} slot="actions" density="compact">
        <${TAGS.button} variant="ghost">Inspect</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.browserPanel}>
    </div>
  `);
  wrap.querySelector("#kit-rich-preview").html = `
    <h2>Quarterly research note</h2>
    <p>Captured content can include <a href="https://example.com">links</a>, tables, images, quotes, and code while staying inside the preview surface.</p>
    <table><tr><th>Page</th><th>Status</th></tr><tr><td>Very long table cell that should scroll instead of breaking the window</td><td>Captured</td></tr><tr><td>Follow-up checklist</td><td>Queued</td></tr></table>
    <blockquote>Imported page content is constrained by the component and remains readable beside browser chrome.</blockquote>
    <pre><code>const veryLongLine = "This code block is intentionally long so overflow stays inside the preview surface.";</code></pre>
  `;
  hydrateMockBrowser(wrap.querySelector(TAGS.browserPanel));
  return wrap;
}
function buildStateDemo() {
  const matrix = stateMatrix([
    { state: "empty", label: "No filtered results" },
    { state: "loading", label: "Loading page snapshot" },
    { state: "error", label: "Capture worker failed" },
    { state: "blocked", label: "Preview blocked by page policy", actions: `<${TAGS.button}>Retry</${TAGS.button}><${TAGS.button} variant="ghost">Open externally</${TAGS.button}>` }
  ]);
  matrix.insertAdjacentHTML("beforeend", `
    <${TAGS.manualCopy} label="Fallback copy" value="Manual fallback text from a failed clipboard write."></${TAGS.manualCopy}>
  `);
  return matrix;
}
function buildBrowserPanelStatesDemo() {
  const wrap = htmlNode(`
    <${TAGS.browserPanel} class="browser-demo" title="Loaded browser panel">
      <span slot="address">https://example.com/research</span>
      <${TAGS.toolbar} slot="actions" density="compact">
        <${TAGS.button} variant="ghost">Copy URL</${TAGS.button}>
        <${TAGS.button} variant="ghost">Open</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.browserPanel}>
    <div class="browser-state-grid">
      <div class="surface-frame">
        <${TAGS.stateOverlay} state="loading" label="Browser panel loading"></${TAGS.stateOverlay}>
      </div>
      <div class="surface-frame">
        <${TAGS.stateOverlay} state="blocked" label="Frame refused to load">
          <${TAGS.toolbar} slot="actions" density="compact" wrap>
            <${TAGS.button}>Retry</${TAGS.button}>
            <${TAGS.button} variant="ghost">Open externally</${TAGS.button}>
          </${TAGS.toolbar}>
        </${TAGS.stateOverlay}>
      </div>
    </div>
  `);
  hydrateMockBrowser(wrap.querySelector(TAGS.browserPanel));
  return wrap;
}
function buildCommandDemo() {
  const wrap = htmlNode(`
    <div class="command-showcase">
      <${TAGS.commandPalette} id="inline-command-palette" placeholder="Search workspace commands"></${TAGS.commandPalette}>
      <div class="demo-stack">
        <${TAGS.shortcutHelp} id="inline-shortcuts"></${TAGS.shortcutHelp}>
        <${TAGS.toolbar} density="compact" wrap>
          <${TAGS.button} id="open-palette" variant="primary">Open dialog</${TAGS.button}>
          <${TAGS.button} id="open-shortcuts">Shortcuts</${TAGS.button}>
          <${TAGS.button} id="toast-success">Toast</${TAGS.button}>
          <${TAGS.button} id="toast-warning" tone="warning">Warn</${TAGS.button}>
          <${TAGS.button} id="toast-danger" tone="danger">Fail</${TAGS.button}>
        </${TAGS.toolbar}>
      </div>
    </div>
    <${TAGS.dialog} id="palette-dialog" modal label="Command palette" close-on-backdrop>
      <span slot="title">Command palette</span>
      <div class="palette-dialog-body">
        <${TAGS.commandPalette} id="command-palette" placeholder="Type a command"></${TAGS.commandPalette}>
        <${TAGS.shortcutHelp} id="dialog-shortcuts"></${TAGS.shortcutHelp}>
      </div>
      <${TAGS.toolbar} slot="footer" align="end">
        <${TAGS.button} id="palette-close">Close</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.dialog}>
    <${TAGS.dialog} id="shortcut-dialog" modal label="Keyboard shortcuts" close-on-backdrop>
      <span slot="title">Keyboard shortcuts</span>
      <${TAGS.shortcutHelp} id="shortcut-help"></${TAGS.shortcutHelp}>
      <${TAGS.toolbar} slot="footer" align="end">
        <${TAGS.button} id="shortcut-close">Close</${TAGS.button}>
      </${TAGS.toolbar}>
    </${TAGS.dialog}>
  `);
  const commands = [
    { id: "tile.add", label: "Add tile", group: "Workspace", shortcut: "Alt+T", description: "Create a browser tile from the URL field.", keywords: ["browser", "url"] },
    { id: "layout.monocle", label: "Switch to monocle", group: "Layout", shortcut: "Alt+M", description: "Focus one tile at a time." },
    { id: "capture.copy", label: "Copy current capture", group: "Capture", shortcut: "Alt+Shift+C", description: "Copy selected page content." },
    { id: "danger.clear", label: "Clear workspace", group: "Workspace", shortcut: "", description: "Remove all tiles after confirmation.", disabled: true }
  ];
  const shortcuts = [
    { group: "Workspace", shortcut: "Alt+J", description: "Focus next tile" },
    { group: "Workspace", shortcut: "Alt+K", description: "Focus previous tile" },
    { group: "Layout", shortcut: "Alt+Enter", description: "Promote tile to master area" },
    { group: "Tools", shortcut: "Alt+P", description: "Open command palette" }
  ];
  wrap.querySelector("#inline-command-palette").commands = commands;
  wrap.querySelector("#command-palette").commands = commands;
  wrap.querySelector("#inline-shortcuts").shortcuts = shortcuts.slice(0, 3);
  wrap.querySelector("#dialog-shortcuts").shortcuts = shortcuts.slice(0, 3);
  wrap.querySelector("#shortcut-help").shortcuts = shortcuts;
  wrap.querySelector("#open-palette").addEventListener("click", () => {
    wrap.querySelector("#palette-dialog").show();
    queueMicrotask(() => wrap.querySelector("#command-palette").focusInput());
  });
  wrap.querySelector("#open-shortcuts").addEventListener("click", () => wrap.querySelector("#shortcut-dialog").show());
  wrap.querySelector("#palette-close").addEventListener("click", () => wrap.querySelector("#palette-dialog").close("demo"));
  wrap.querySelector("#shortcut-close").addEventListener("click", () => wrap.querySelector("#shortcut-dialog").close("demo"));
  wrap.querySelector("#toast-success").addEventListener("click", () => showToast({ key: "demo-toast", message: "Copied current URL", tone: "success", timeout: 1800 }));
  wrap.querySelector("#toast-warning").addEventListener("click", () => showToast({ key: "demo-toast", message: "Preview needs fallback", tone: "warning", timeout: 2200 }));
  wrap.querySelector("#toast-danger").addEventListener("click", () => showToast({ key: "demo-toast", message: "Command failed", tone: "danger", timeout: 2600 }));
  wrap.querySelector("#command-palette").addEventListener("awwbookmarklet-command-palette-execute", (event) => {
    showToast({ key: "command", message: `Command: ${event.detail.commandId}`, tone: "info", timeout: 1600 });
  });
  wrap.querySelector("#inline-command-palette").addEventListener("awwbookmarklet-command-palette-execute", (event) => {
    showToast({ key: "command", message: `Command: ${event.detail.commandId}`, tone: "info", timeout: 1600 });
  });
  return wrap;
}
function buildUrlPickerDemo() {
  const wrap = htmlNode(`
    <div class="url-picker-showcase">
      <${TAGS.toolbar} density="compact" wrap>
        <${TAGS.iconButton} label="Back">${icon("M10 4L6 8l4 4")}</${TAGS.iconButton}>
        <${TAGS.iconButton} label="Forward">${icon("M6 4l4 4-4 4")}</${TAGS.iconButton}>
        <${TAGS.urlPicker} id="demo-url-picker" open value="notes about iframe fallback" placeholder="Type URL or search query"></${TAGS.urlPicker}>
        <${TAGS.button} variant="primary">Add tile</${TAGS.button}>
      </${TAGS.toolbar}>
      <${TAGS.statusLine} compact tone="info">Search fallback preview with recent pages and bookmarks</${TAGS.statusLine}>
    </div>
  `);
  wrap.querySelector("#demo-url-picker").suggestions = [
    { title: "AWW tools dashboard", url: "https://example.com/tools", description: "Recent workspace page" },
    { title: "Bookmark: CSS reference", url: "https://developer.mozilla.org/en-US/docs/Web/CSS", description: "Manual bookmark" },
    { title: "Session snapshot notes", url: "https://example.com/sessions/current", description: "Open from saved session" }
  ];
  wrap.querySelector("#demo-url-picker").addEventListener("awwbookmarklet-url-picker-apply", (event) => {
    showToast({ key: "url-picker", message: `Navigate: ${event.detail.decision.targetUrl}`, tone: "info", timeout: 1800 });
  });
  return wrap;
}
function buildMiniBrowserSpecimen() {
  return showcaseFrame(`
    <div class="mini-browser-specimen">
      <${TAGS.toolbar} density="compact" wrap>
        <${TAGS.iconButton} label="Back">${icon("M10 4L6 8l4 4")}</${TAGS.iconButton}>
        <${TAGS.iconButton} label="Forward">${icon("M6 4l4 4-4 4")}</${TAGS.iconButton}>
        <${TAGS.urlPicker} id="mini-url-picker" value="https://example.com/research"></${TAGS.urlPicker}>
        <${TAGS.button} variant="ghost">Page actions</${TAGS.button}>
      </${TAGS.toolbar}>
      <${TAGS.statusLine} tone="success" compact>Loaded example.com/research</${TAGS.statusLine}>
      <div class="mini-browser-content">
        <div class="mini-browser-page">
          <header>
            <h4>Research workspace</h4>
            <p>Mock loaded page with selected article regions and page-action feedback.</p>
          </header>
          <div class="mini-browser-columns">
            <section>
              <strong>Captured blocks</strong>
              <p>Article heading, lead paragraph, comparison table, and code snippet.</p>
            </section>
            <section>
              <strong>Page actions</strong>
              <p>Copy markdown, open externally, pin tile, and retry blocked frame.</p>
            </section>
          </div>
          <div class="mini-browser-table">
            <span>Heading</span><span>Captured</span>
            <span>Quote</span><span>Review</span>
            <span>Image</span><span>Skipped</span>
          </div>
        </div>
      </div>
    </div>
  `);
}
function buildToolCoverageDemo() {
  return htmlNode(`
    <div class="migration-grid">
      ${toolCard({ name: "Rich Text to Markdown", legacy: "Local editor chrome and copy status.", components: ["app shell", "toolbar", "rich preview", "manual copy", "toast"] })}
      ${toolCard({ name: "Page Screenshot", legacy: "Capture form with preview and export states.", components: ["field", "status line", "browser panel", "state overlay"] })}
      ${toolCard({ name: "Page Content Select", legacy: "Selectable content rows and saved-session dialog.", components: ["list item", "card", "dialog", "rich preview"] })}
      ${toolCard({ name: "Session Snapshot", legacy: "Capture dashboard with warnings and ZIP export.", components: ["metric card", "alert", "field", "progress"] })}
      ${toolCard({ name: "Notifications", legacy: "Reminder forms, disabled policy states, and grouped results.", components: ["field", "alert", "list", "metric"] })}
      ${toolCard({ name: "Mini/Multi Browser", legacy: "Address bar, tile commands, iframe fallback, and shortcuts.", components: ["url picker", "browser panel", "command palette", "shortcut help"] })}
      ${toolCard({ name: "Bookmarks", legacy: "Searchable rows, setting forms, and danger confirmation.", components: ["toolbar", "list item", "empty state", "dialog"] })}
    </div>
  `);
}
function buildPage() {
  const componentCount = Object.keys(TAGS).length;
  const page = document.createElement("main");
  page.className = "catalog-page";
  page.innerHTML = `
    <header class="catalog-hero">
      <div>
        <p class="catalog-kicker">AWW Bookmarklet UI Framework</p>
        <h1 class="catalog-title">Component catalog for constrained bookmarklet tools</h1>
        <p class="catalog-lede">A compact retro desktop kit for bookmarklets and extension tools: primitives, app shells, content previews, command surfaces, and realistic fallback paths.</p>
      </div>
      <div class="hero-console" aria-hidden="true">
        <div class="hero-window-bar"><span></span><strong>Capture Console</strong><em>Ready</em></div>
        <div class="hero-window-body">
          <div class="hero-sidebar"><span></span><span></span><span></span></div>
          <div class="hero-panel">
            <div class="hero-line hero-line--wide"></div>
            <div class="hero-line"></div>
            <div class="hero-grid"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <${TAGS.button} id="hero-example" variant="primary">Open Tool</${TAGS.button}>
        <${TAGS.button} id="hero-blank">Open Shell</${TAGS.button}>
      </div>
    </header>
    <div class="coverage-rail">
      <span><strong>${componentCount}</strong> custom elements</span>
      <span>Primitives</span>
      <span>App patterns</span>
      <span>Content states</span>
      <span>Command surfaces</span>
      <span>Migration proof</span>
    </div>
  `;
  page.append(section({
    label: "Foundation",
    title: "Shell and primitive controls",
    description: "The first section keeps low-level pieces visible and uncluttered before introducing composed app surfaces.",
    children: [
      specimen({ title: "Desktop shell", description: "Window runtime, focus, drag, resize, and status behavior.", tag: "runtime", span: 5, variant: "compact", body: buildShellDemo() }),
      specimen({ title: "Control primitives", description: "Buttons, inputs, selection controls, range, and progress.", tag: "forms", span: 7, variant: "compact", body: buildControlDemo() }),
      specimen({ title: "Grouped layout", description: "Groups, tabs, listbox, panel actions, and status composition.", tag: "layout", span: 12, variant: "compact", body: buildLayoutDemo() }),
      specimen({ title: "Field matrix", description: "Labels, help, errors, units, disabled, horizontal, and inline layouts.", tag: "fields", span: 7, variant: "compact", body: buildFieldMatrixDemo() }),
      specimen({ title: "Feedback matrix", description: "Status lines and alerts across tones and actions.", tag: "feedback", span: 5, variant: "compact", body: buildFeedbackMatrixDemo() })
    ]
  }), section({
    label: "Application Patterns",
    title: "Workflow surfaces without crowding",
    description: "Higher-order components are split into scan-friendly states so developers can inspect each responsibility.",
    children: [
      specimen({ title: "Application shell", description: "The reference composition for migrated tools.", tag: "workflow", span: 12, variant: "showcase", tone: "primary", footerNote: "Includes dialog and toast actions without introducing app-specific CSS.", body: buildWorkflowDemo() }),
      specimen({ title: "Rows and cards", description: "Selectable rows, row actions, status tones, imperfect data, and reusable content cards.", tag: "data", span: 8, body: buildRowsDemo() }),
      specimen({ title: "Metrics", description: "Readable stat cards for session and browser state.", tag: "metrics", span: 4, variant: "compact", body: buildMetricDemo() })
    ]
  }), section({
    label: "Content States",
    title: "Preview, browser, and fallback states",
    description: "The messy realities of injected tools need first-class demos: rich imported HTML, iframe surfaces, blocked previews, empty states, and manual copy fallback.",
    children: [
      specimen({ title: "Preview surfaces", description: "Nonblank rich content and iframe surfaces with overflow pressure.", tag: "content", span: 8, variant: "showcase", body: buildPreviewDemo() }),
      specimen({ title: "Browser panel states", description: "Loaded, loading, blocked, retry, and external-open states.", tag: "browser", span: 4, body: buildBrowserPanelStatesDemo() }),
      specimen({ title: "Empty and blocked states", description: "Fallback UI grouped as routine states, plus manual copy.", tag: "fallback", span: 12, variant: "compact", body: buildStateDemo() })
    ]
  }), section({
    label: "Command Surfaces",
    title: "Navigation, commands, shortcuts, and feedback",
    description: "Overlay-heavy browser tools need URL entry, command discovery, shortcut help, and toast feedback before tile workspace migration is credible.",
    children: [
      specimen({ title: "URL picker", description: "Suggestions are open by default so the address behavior is visible.", tag: "navigation", span: 5, variant: "showcase", body: buildUrlPickerDemo() }),
      specimen({ title: "Command palette and shortcuts", description: "Inline command discovery plus the interactive dialog path.", tag: "commands", span: 7, variant: "showcase", body: buildCommandDemo() })
    ]
  }), section({
    label: "Migration Proof",
    title: "Reference-tool coverage map",
    description: "These specimens show how the old local UI patterns map into shared components without copying app-specific CSS.",
    children: [
      specimen({ title: "Mini Browser composition", description: "Toolbar, URL picker, status, and page surface assembled with the shared grammar.", tag: "browser app", span: 6, variant: "showcase", body: buildMiniBrowserSpecimen() }),
      specimen({ title: "Migration cards", description: "Reference tools mapped to replacement components.", tag: "coverage", span: 6, body: buildToolCoverageDemo() })
    ]
  }));
  return page;
}
function initCatalog() {
  const root = document.getElementById("catalog-root") || document.body;
  root.append(buildPage());
  root.querySelector("#hero-example").addEventListener("click", openExample);
  root.querySelector("#hero-blank").addEventListener("click", openBlank);
  root.querySelector("#open-example").addEventListener("click", openExample);
  root.querySelector("#open-blank").addEventListener("click", openBlank);
}
initCatalog();
window.addEventListener("beforeunload", () => {
  releaseDesktopRoot(CATALOG_OWNER);
});

//# debugId=EC9FCA86037F394464756E2164756E21
//# sourceMappingURL=catalog.js.map
