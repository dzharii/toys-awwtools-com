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
  metricCard: "awwbookmarklet-metric-card",
  segmentStrip: "awwbookmarklet-segment-strip",
  contextBar: "awwbookmarklet-context-bar",
  statusStrip: "awwbookmarklet-status-strip",
  titlebar: "awwbookmarklet-titlebar",
  contextPanel: "awwbookmarklet-context-panel",
  splitPane: "awwbookmarklet-split-pane"
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
  titleHeight: "--awwbookmarklet-size-title-h",
  radiusControl: "--awwbookmarklet-radius-control",
  radiusSurface: "--awwbookmarklet-radius-surface",
  radiusWindow: "--awwbookmarklet-radius-window",
  borderWidthControl: "--awwbookmarklet-border-width-control",
  borderWidthSurface: "--awwbookmarklet-border-width-surface",
  focusRingWidth: "--awwbookmarklet-focus-ring-width",
  controlPaddingX: "--awwbookmarklet-control-padding-x",
  controlPaddingY: "--awwbookmarklet-control-padding-y",
  controlMinWidth: "--awwbookmarklet-control-min-width",
  controlIconSize: "--awwbookmarklet-control-icon-size",
  inputPaddingX: "--awwbookmarklet-input-padding-x",
  inputPaddingY: "--awwbookmarklet-input-padding-y",
  buttonPaddingX: "--awwbookmarklet-button-padding-x",
  buttonPaddingY: "--awwbookmarklet-button-padding-y",
  buttonMinWidth: "--awwbookmarklet-button-min-width",
  buttonShadow: "--awwbookmarklet-button-shadow",
  buttonActiveShadow: "--awwbookmarklet-button-active-shadow",
  windowBodyPadding: "--awwbookmarklet-window-body-padding",
  titlebarPaddingX: "--awwbookmarklet-titlebar-padding-x",
  titlebarGap: "--awwbookmarklet-titlebar-gap",
  surfacePadding: "--awwbookmarklet-surface-padding",
  surfaceGap: "--awwbookmarklet-surface-gap",
  panelPadding: "--awwbookmarklet-panel-padding",
  cardPadding: "--awwbookmarklet-card-padding",
  groupPadding: "--awwbookmarklet-group-padding",
  menuPadding: "--awwbookmarklet-menu-padding",
  menuItemHeight: "--awwbookmarklet-menu-item-height",
  menuItemPaddingX: "--awwbookmarklet-menu-item-padding-x",
  menuItemGap: "--awwbookmarklet-menu-item-gap",
  controlInsetShadow: "--awwbookmarklet-control-inset-shadow"
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
      --_ring: 0 0 0 var(--awwbookmarklet-focus-ring-width, 2px) var(--awwbookmarklet-focus-ring, #154fbc);
      --_control-radius: var(--awwbookmarklet-radius-control, 0);
      --_surface-radius: var(--awwbookmarklet-radius-surface, 0);
      --_control-border-width: var(--awwbookmarklet-border-width-control, 1px);
      --_surface-border-width: var(--awwbookmarklet-border-width-surface, 1px);
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
    --_titlebar-active-top-bg: color-mix(in srgb, #f7f9fb calc(var(--awwbookmarklet-frost-opacity, 1) * 100%), var(--awwbookmarklet-titlebar-active-bg, #dce2e9));
    --_titlebar-inactive-top-bg: color-mix(in srgb, #eef2f6 calc(var(--awwbookmarklet-frost-opacity, 1) * 100%), var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd));
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 12px 32px rgba(0, 0, 0, 0.18));
    border-radius: var(--awwbookmarklet-radius-window, 0);
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
    gap: var(--awwbookmarklet-titlebar-gap, 6px);
    padding-block: 0;
    padding-inline: var(--awwbookmarklet-titlebar-padding-x, 6px);
    background: linear-gradient(180deg, var(--_titlebar-active-top-bg), var(--awwbookmarklet-titlebar-active-bg, #dce2e9));
    color: var(--awwbookmarklet-titlebar-fg, #121820);
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    cursor: grab;
    user-select: none;
  }

  :host([data-active="false"]) .titlebar {
    background: linear-gradient(180deg, var(--_titlebar-inactive-top-bg), var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd));
  }

  .system-menu-button,
  .window-command-button {
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-button-bg, #edf1f5);
    box-shadow: var(--awwbookmarklet-button-shadow, inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a8b0ba);
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
    background: var(--awwbookmarklet-button-active-bg, #d8dee6);
    box-shadow: var(--awwbookmarklet-button-active-shadow, inset 1px 1px 0 #8e98a4, inset -1px -1px 0 #ffffff);
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
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
  }

  .region[hidden] {
    display: none;
  }

  .body {
    overflow: auto;
    padding: var(--awwbookmarklet-window-body-padding, var(--awwbookmarklet-space-3, 12px));
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    min-height: 0;
  }

  .status {
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
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

// src/themes/default-theme.js
var DEFAULT_THEME = {
  [PUBLIC_TOKENS.workspaceBg]: "rgba(0, 0, 0, 0)",
  [PUBLIC_TOKENS.windowBg]: "#eef1f5",
  [PUBLIC_TOKENS.panelBg]: "#f3f5f7",
  [PUBLIC_TOKENS.titlebarActiveBg]: "#dce2e9",
  [PUBLIC_TOKENS.titlebarInactiveBg]: "#cfd5dd",
  [PUBLIC_TOKENS.titlebarFg]: "#121820",
  [PUBLIC_TOKENS.borderStrong]: "#4f5966",
  [PUBLIC_TOKENS.borderSubtle]: "#a8b0ba",
  [PUBLIC_TOKENS.focusRing]: "#174f9c",
  [PUBLIC_TOKENS.buttonBg]: "#edf1f5",
  [PUBLIC_TOKENS.buttonFg]: "#111720",
  [PUBLIC_TOKENS.buttonActiveBg]: "#d8dee6",
  [PUBLIC_TOKENS.inputBg]: "#f8f9fa",
  [PUBLIC_TOKENS.inputFg]: "#111720",
  [PUBLIC_TOKENS.menuBg]: "#f3f5f7",
  [PUBLIC_TOKENS.menuFg]: "#0e1621",
  [PUBLIC_TOKENS.selectionBg]: "#1f5eae",
  [PUBLIC_TOKENS.selectionFg]: "#f2f8ff",
  [PUBLIC_TOKENS.statusbarBg]: "#e2e7ed",
  [PUBLIC_TOKENS.appShellBg]: "#eef1f5",
  [PUBLIC_TOKENS.surfaceRaisedBg]: "#fbfcfd",
  [PUBLIC_TOKENS.surfaceInsetBg]: "#dfe4ea",
  [PUBLIC_TOKENS.textMuted]: "#44505f",
  [PUBLIC_TOKENS.textHelp]: "#5f6a78",
  [PUBLIC_TOKENS.dividerColor]: "#c7cdd5",
  [PUBLIC_TOKENS.infoBg]: "#e8f2ff",
  [PUBLIC_TOKENS.infoFg]: "#18549e",
  [PUBLIC_TOKENS.infoBorder]: "#8db4e8",
  [PUBLIC_TOKENS.successBg]: "#e7f4eb",
  [PUBLIC_TOKENS.successFg]: "#1e6a3a",
  [PUBLIC_TOKENS.successBorder]: "#86ba91",
  [PUBLIC_TOKENS.warningBg]: "#fff4d8",
  [PUBLIC_TOKENS.warningFg]: "#76520c",
  [PUBLIC_TOKENS.warningBorder]: "#d7ad4d",
  [PUBLIC_TOKENS.dangerBg]: "#fff0ee",
  [PUBLIC_TOKENS.dangerFg]: "#a12824",
  [PUBLIC_TOKENS.dangerBorder]: "#da7b73",
  [PUBLIC_TOKENS.overlayBackdrop]: "rgba(12, 18, 28, 0.38)",
  [PUBLIC_TOKENS.overlayShadow]: "0 18px 44px rgba(0, 0, 0, 0.24)",
  [PUBLIC_TOKENS.cardBg]: "#fbfcfe",
  [PUBLIC_TOKENS.cardSelectedBg]: "#e8f1ff",
  [PUBLIC_TOKENS.metricBg]: "#ffffff",
  [PUBLIC_TOKENS.codeBg]: "#e8edf4",
  [PUBLIC_TOKENS.codeFg]: "#172131",
  [PUBLIC_TOKENS.shadowDepth]: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #a8b0ba",
  [PUBLIC_TOKENS.frostOpacity]: "1",
  [PUBLIC_TOKENS.space1]: "4px",
  [PUBLIC_TOKENS.space2]: "8px",
  [PUBLIC_TOKENS.space3]: "12px",
  [PUBLIC_TOKENS.controlHeight]: "30px",
  [PUBLIC_TOKENS.titleHeight]: "32px",
  [PUBLIC_TOKENS.radiusControl]: "0",
  [PUBLIC_TOKENS.radiusSurface]: "0",
  [PUBLIC_TOKENS.radiusWindow]: "0",
  [PUBLIC_TOKENS.borderWidthControl]: "1px",
  [PUBLIC_TOKENS.borderWidthSurface]: "1px",
  [PUBLIC_TOKENS.focusRingWidth]: "2px",
  [PUBLIC_TOKENS.controlPaddingX]: "12px",
  [PUBLIC_TOKENS.controlPaddingY]: "0",
  [PUBLIC_TOKENS.controlMinWidth]: "72px",
  [PUBLIC_TOKENS.controlIconSize]: "16px",
  [PUBLIC_TOKENS.inputPaddingX]: "8px",
  [PUBLIC_TOKENS.inputPaddingY]: "0",
  [PUBLIC_TOKENS.buttonPaddingX]: "12px",
  [PUBLIC_TOKENS.buttonPaddingY]: "0",
  [PUBLIC_TOKENS.buttonMinWidth]: "72px",
  [PUBLIC_TOKENS.buttonShadow]: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 var(--awwbookmarklet-border-subtle, #9ba5b3)",
  [PUBLIC_TOKENS.buttonActiveShadow]: "inset 1px 1px 0 rgba(0, 0, 0, 0.18)",
  [PUBLIC_TOKENS.windowBodyPadding]: "12px",
  [PUBLIC_TOKENS.titlebarPaddingX]: "6px",
  [PUBLIC_TOKENS.titlebarGap]: "6px",
  [PUBLIC_TOKENS.surfacePadding]: "8px",
  [PUBLIC_TOKENS.surfaceGap]: "8px",
  [PUBLIC_TOKENS.panelPadding]: "8px",
  [PUBLIC_TOKENS.cardPadding]: "8px",
  [PUBLIC_TOKENS.groupPadding]: "10px",
  [PUBLIC_TOKENS.menuPadding]: "4px",
  [PUBLIC_TOKENS.menuItemHeight]: "29px",
  [PUBLIC_TOKENS.menuItemPaddingX]: "8px",
  [PUBLIC_TOKENS.menuItemGap]: "16px",
  [PUBLIC_TOKENS.controlInsetShadow]: "inset 1px 1px 0 #aab2bd, inset -1px -1px 0 #ffffff"
};

// src/core/theme.js
function applyThemePatch(target, themePatch = {}) {
  if (!target?.style)
    return;
  for (const [token, value] of Object.entries(themePatch || {})) {
    if (value == null)
      continue;
    target.style.setProperty(token, String(value));
  }
}
function copyPublicThemeContext(source, target, tokens = PUBLIC_TOKENS) {
  if (!source || !target?.style || typeof getComputedStyle === "undefined")
    return;
  const computed = getComputedStyle(source);
  for (const token of Object.values(tokens)) {
    const value = computed.getPropertyValue(token);
    if (value)
      target.style.setProperty(token, value.trim());
  }
}
function createTheme(baseTheme = DEFAULT_THEME, patch = {}) {
  return { ...baseTheme || {}, ...patch || {} };
}

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
    applyThemePatch(target, this.#theme);
  }
  applyThemePatch(target, themePatch) {
    applyThemePatch(target, themePatch);
  }
}
var defaultThemeService = new ThemeService(DEFAULT_THEME);

// src/components/menubar.js
var MENUBAR_STYLES = css`
  :host {
    display: block;
    pointer-events: auto;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 85%, #d8dee7 15%);
    padding: var(--awwbookmarklet-space-1, 4px);
  }

  #bar {
    display: flex;
    gap: var(--awwbookmarklet-space-1, 4px);
    align-items: center;
    min-height: 28px;
  }

  ::slotted([data-menu]) {
    height: 24px;
    border: var(--_control-border-width) solid transparent;
    background: transparent;
    font: inherit;
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-menu-item-padding-x, 8px);
    border-radius: var(--_control-radius);
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
    copyPublicThemeContext(trigger, menu);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_surface-radius);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 10px 20px rgba(0, 0, 0, 0.18));
    padding: var(--awwbookmarklet-menu-padding, 4px);
    z-index: 999999;
  }

  :host([open]) { display: block; }

  #panel {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
    max-height: min(60vh, 420px);
    overflow: auto;
  }

  ::slotted([data-separator]),
  ::slotted([role="separator"]) {
    display: block;
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    margin: 4px 2px;
    padding: 0;
    min-height: 0;
    height: 0;
  }

  ::slotted(button),
  ::slotted([role="menuitem"]) {
    height: var(--awwbookmarklet-menu-item-height, 29px);
    border: var(--_control-border-width) solid transparent;
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    text-align: left;
    padding-block: 0;
    padding-inline: var(--awwbookmarklet-menu-item-padding-x, 8px);
    font: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--awwbookmarklet-menu-item-gap, 16px);
    border-radius: var(--_control-radius);
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
    min-width: var(--awwbookmarklet-button-min-width, var(--awwbookmarklet-control-min-width, 72px));
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: linear-gradient(180deg, color-mix(in srgb, var(--awwbookmarklet-button-bg, #f1f4f8) 92%, #ffffff 8%), var(--awwbookmarklet-button-bg, #f1f4f8));
    color: var(--awwbookmarklet-button-fg, #111720);
    box-shadow: var(--awwbookmarklet-button-shadow, inset 1px 1px 0 #ffffff, inset -1px -1px 0 var(--awwbookmarklet-border-subtle, #9ba5b3));
    padding-block: var(--awwbookmarklet-button-padding-y, var(--awwbookmarklet-control-padding-y, 0));
    padding-inline: var(--awwbookmarklet-button-padding-x, var(--awwbookmarklet-control-padding-x, 12px));
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
    box-shadow: inset 1px 1px 0 color-mix(in srgb, var(--awwbookmarklet-selection-bg, #1f5eae) 68%, #ffffff 32%), inset -1px -1px 0 color-mix(in srgb, var(--awwbookmarklet-selection-bg, #1f5eae) 72%, #000000 28%);
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
    box-shadow: var(--awwbookmarklet-button-active-shadow, inset 1px 1px 0 rgba(0, 0, 0, 0.18));
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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    box-shadow: var(--awwbookmarklet-button-shadow, none);
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
    box-shadow: var(--awwbookmarklet-button-active-shadow, inset 1px 1px 0 rgba(0, 0, 0, 0.18));
  }

  ::slotted(svg) {
    width: var(--awwbookmarklet-control-icon-size, 16px);
    height: var(--awwbookmarklet-control-icon-size, 16px);
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

// src/core/form-attributes.js
var FORM_ARIA_ATTRIBUTES = ["aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"];

// src/components/input.js
var INPUT_STYLES = css`
  :host { display: inline-block; min-width: 140px; }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    box-shadow: var(--awwbookmarklet-control-inset-shadow, none);
    padding-block: var(--awwbookmarklet-input-padding-y, var(--awwbookmarklet-control-padding-y, 0));
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    font: inherit;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled { opacity: 0.65; }
`;
var MIRRORED_ATTRIBUTES = ["value", "placeholder", "disabled", "type", "name", "required", "min", "max", "step", "autocomplete", "spellcheck", "list", ...FORM_ARIA_ATTRIBUTES];

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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    box-shadow: var(--awwbookmarklet-control-inset-shadow, none);
    padding-block: var(--awwbookmarklet-input-padding-y, 8px);
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    font: inherit;
    resize: vertical;
  }

  textarea:focus-visible { outline: none; box-shadow: var(--_ring); }
  textarea:disabled { opacity: 0.65; }
`;
var MIRRORED_ATTRIBUTES2 = ["value", "placeholder", "disabled", "rows", "name", "required", "autocomplete", "spellcheck", ...FORM_ARIA_ATTRIBUTES];

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
    gap: var(--awwbookmarklet-space-2, 8px);
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: var(--_control-radius);
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
var MIRRORED = ["checked", "disabled", "name", "value", ...FORM_ARIA_ATTRIBUTES];

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
    gap: var(--awwbookmarklet-space-2, 8px);
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
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
var MIRRORED2 = ["checked", "disabled", "name", "value", ...FORM_ARIA_ATTRIBUTES];

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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    box-shadow: var(--awwbookmarklet-control-inset-shadow, none);
    padding-block: var(--awwbookmarklet-input-padding-y, var(--awwbookmarklet-control-padding-y, 0));
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px) calc(var(--awwbookmarklet-input-padding-x, 8px) + 20px);
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
var MIRRORED3 = ["disabled", "name", "value", "required", ...FORM_ARIA_ATTRIBUTES];

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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
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
  :host { display: block; border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3); border-radius: var(--_surface-radius); background: var(--awwbookmarklet-panel-bg, #f8fafc); }

  #tablist {
    display: flex;
    gap: var(--awwbookmarklet-space-1, 4px);
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: var(--awwbookmarklet-space-1, 4px) var(--awwbookmarklet-space-1, 4px) 0;
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    scrollbar-gutter: stable;
  }

  #tablist button {
    min-height: 28px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-bottom: 0;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 88%, #ced5df 12%);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-control-padding-x, 10px);
    font: inherit;
    font-weight: 400;
    border-radius: var(--_control-radius) var(--_control-radius) 0 0;
    white-space: nowrap;
  }

  #tablist button[aria-selected="true"] {
    background: var(--awwbookmarklet-window-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    font-weight: 700;
    border-color: var(--awwbookmarklet-border-strong, #4f5966);
    border-bottom-color: var(--awwbookmarklet-window-bg, #ffffff);
    box-shadow: inset 0 3px 0 var(--awwbookmarklet-selection-bg, #1f5eae);
    position: relative;
    top: 1px;
  }

  #tablist button:focus-visible { outline: none; box-shadow: var(--_ring); }
  #tablist button[aria-selected="true"]:focus-visible {
    box-shadow: inset 0 3px 0 var(--awwbookmarklet-selection-bg, #1f5eae), var(--_ring);
  }
  #panels { padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px)); }
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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    min-height: 120px;
    max-height: 260px;
    overflow: auto;
    padding: var(--awwbookmarklet-space-1, 4px);
  }

  ::slotted([role="option"]) {
    display: block;
    padding-block: var(--awwbookmarklet-space-2, 6px);
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    border: var(--_control-border-width) solid transparent;
    border-radius: var(--_control-radius);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 86%, #ffffff 14%);
    padding: var(--awwbookmarklet-group-padding, var(--awwbookmarklet-surface-padding, 10px));
  }

  .caption {
    font-weight: 600;
    margin-bottom: var(--awwbookmarklet-space-2, 8px);
    color: color-mix(in srgb, var(--awwbookmarklet-input-fg, #111720) 90%, #ffffff 10%);
  }

  .content {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-panel-padding, var(--awwbookmarklet-surface-padding, 8px));
  }

  section {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    min-width: 0;
  }

  .header {
    display: none;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-bottom: var(--awwbookmarklet-space-2, 8px);
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
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: var(--awwbookmarklet-space-2, 8px);
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
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    padding: var(--awwbookmarklet-window-body-padding, var(--awwbookmarklet-space-3, 12px));
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-3, 12px));
    min-width: 0;
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
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
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
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

  :host([data-density="compact"]) { --_gap: var(--awwbookmarklet-space-1, 4px); }
  :host([data-density="spacious"]) { --_gap: var(--awwbookmarklet-space-3, 12px); }

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
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  :host([wide]) {
    width: 100%;
  }

  .field {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  :host([orientation="horizontal"]) .field {
    grid-template-columns: minmax(120px, 0.38fr) minmax(0, 1fr);
    gap: var(--awwbookmarklet-space-2, 8px) var(--awwbookmarklet-space-3, 12px);
    align-items: start;
  }

  :host([orientation="inline"]) .field {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-2, 8px);
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
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  .control-row ::slotted(*) {
    min-width: 0;
  }

  .main {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
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
    gap: var(--awwbookmarklet-space-2, 6px);
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
    border: var(--_control-border-width) solid currentColor;
    border-radius: var(--_control-radius);
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
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--_bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
  }

  :host([compact]) .alert {
    padding: var(--awwbookmarklet-space-2, 6px);
  }

  .icon {
    width: 14px;
    height: 14px;
    border: var(--_control-border-width) solid currentColor;
    border-radius: var(--_control-radius);
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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
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
  copyPublicThemeContext(element, element);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    pointer-events: auto;
  }

  .header,
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .header {
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .footer {
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .title {
    font-weight: 700;
  }

  .body {
    min-height: 0;
    overflow: auto;
    padding: var(--awwbookmarklet-window-body-padding, var(--awwbookmarklet-space-3, 12px));
  }

  button {
    min-width: 28px;
    min-height: 26px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
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
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-strong, #232a33));
    border-radius: var(--_surface-radius);
    background: var(--_bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
  }

  :host([data-tone="info"]) { --_bg: var(--awwbookmarklet-info-bg, #e7f0ff); --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_bg: var(--awwbookmarklet-success-bg, #e5f5eb); --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_bg: var(--awwbookmarklet-warning-bg, #fff4d6); --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_bg: var(--awwbookmarklet-danger-bg, #ffe8e6); --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-surface-gap, 8px);
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
    border: var(--_surface-border-width) dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-3, 12px));
  }

  .empty {
    display: grid;
    place-items: center;
    gap: var(--awwbookmarklet-surface-gap, 6px);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    z-index: 2;
  }

  :host([hidden]) { display: none !important; }

  .surface {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, 8px);
    justify-items: center;
    max-width: min(420px, calc(100% - 24px));
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-3, 12px));
    text-align: center;
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  .indicator {
    width: 18px;
    height: 18px;
    border: var(--awwbookmarklet-focus-ring-width, 2px) solid currentColor;
    border-radius: var(--_control-radius);
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
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    align-items: start;
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-card-padding, var(--awwbookmarklet-surface-padding, 8px));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  :host([compact]) .item { padding: var(--awwbookmarklet-space-2, 6px); }
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
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-card-padding, var(--awwbookmarklet-surface-padding, 8px));
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
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
  .footer { border-top: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4); padding-top: var(--awwbookmarklet-space-2, 8px); }

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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .wrap {
    min-height: 96px;
    max-width: 100%;
    overflow: auto;
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-3, 12px));
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding: var(--awwbookmarklet-space-1, 4px) var(--awwbookmarklet-space-2, 6px);
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
    padding: var(--awwbookmarklet-surface-padding, 8px);
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
  }

  .content code {
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
    padding: 0 var(--awwbookmarklet-space-1, 3px);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_surface-radius);
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
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    padding: var(--awwbookmarklet-surface-padding, 6px);
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
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
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-warning-border, #d9ad3b);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-warning-bg, #fff4d6);
    color: var(--awwbookmarklet-warning-fg, #6d4b00);
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
  }

  .wrap {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, 6px);
  }

  .label {
    font-weight: 700;
  }

  textarea {
    min-height: 92px;
    width: 100%;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
    padding: var(--awwbookmarklet-input-padding-x, 8px);
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
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding-block: var(--awwbookmarklet-input-padding-y, var(--awwbookmarklet-control-padding-y, 0));
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
    max-height: 280px;
    overflow: auto;
  }

  .command {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-surface-gap, 8px);
    align-items: start;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-card-bg, #fbfcfe);
    padding: var(--awwbookmarklet-card-padding, 8px);
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
    border: var(--_surface-border-width) dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
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
function isHttpUrl(value) {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
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
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding-block: var(--awwbookmarklet-input-padding-y, var(--awwbookmarklet-control-padding-y, 0));
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
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
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_surface-radius);
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
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    padding: var(--awwbookmarklet-card-padding, 8px);
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
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-metric-bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    padding: var(--awwbookmarklet-card-padding, var(--awwbookmarklet-surface-padding, 8px));
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

// src/core/clipboard.js
function normalizePayload(payload = {}) {
  return {
    text: String(payload.text ?? ""),
    html: payload.html == null ? "" : String(payload.html),
    imageBlob: payload.imageBlob ?? null
  };
}
async function copyToClipboard(payload = {}, environment = globalThis) {
  const normalized = normalizePayload(payload);
  if (!normalized.text && !normalized.html && !normalized.imageBlob) {
    return { ok: false, status: "empty", reason: "No clipboard payload was provided.", fallbackText: "" };
  }
  const nav = environment.navigator;
  const clipboard = nav?.clipboard;
  const fallbackText = normalized.text || normalized.html;
  if (!clipboard) {
    return { ok: false, status: "fallback", reason: "Clipboard API is unavailable.", fallbackText };
  }
  try {
    if (normalized.html && typeof clipboard.write === "function" && typeof environment.ClipboardItem === "function") {
      const item = new environment.ClipboardItem({
        "text/html": new Blob([normalized.html], { type: "text/html" }),
        "text/plain": new Blob([normalized.text || normalized.html], { type: "text/plain" })
      });
      await clipboard.write([item]);
      return { ok: true, status: "success", method: "write" };
    }
    if (normalized.imageBlob && typeof clipboard.write === "function" && typeof environment.ClipboardItem === "function") {
      const item = new environment.ClipboardItem({ [normalized.imageBlob.type || "image/png"]: normalized.imageBlob });
      await clipboard.write([item]);
      return { ok: true, status: "success", method: "write" };
    }
    if (typeof clipboard.writeText === "function" && fallbackText) {
      await clipboard.writeText(fallbackText);
      return { ok: true, status: "success", method: "writeText" };
    }
    return { ok: false, status: "fallback", reason: "Clipboard API cannot write this payload.", fallbackText };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      reason: error?.message || "Clipboard write failed.",
      error,
      fallbackText
    };
  }
}

// src/core/context-segments.js
function splitUnescapedPipes(value) {
  const parts = [];
  let current = "";
  let escaping = false;
  for (const char of String(value ?? "")) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }
    if (char === "\\") {
      escaping = true;
      continue;
    }
    if (char === "|") {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (escaping)
    current += "\\";
  parts.push(current);
  return parts;
}
function parseContextSegments(value) {
  return splitUnescapedPipes(value).map((part) => part.trim()).filter(Boolean).map((part, index) => ({
    key: `segment-${index}`,
    value: part,
    kind: "text",
    tone: "neutral",
    priority: index
  }));
}
function normalizeContextSegment(segment, index = 0) {
  if (segment == null)
    return null;
  if (typeof segment !== "object") {
    const value2 = String(segment).trim();
    if (!value2)
      return null;
    return {
      key: `segment-${index}`,
      value: value2,
      kind: "text",
      tone: "neutral",
      priority: index,
      actions: []
    };
  }
  const value = String(segment.value ?? segment.shortValue ?? segment.label ?? "").trim();
  if (!value)
    return null;
  return {
    key: String(segment.key || `segment-${index}`),
    label: segment.label == null ? "" : String(segment.label),
    value,
    shortValue: segment.shortValue == null ? "" : String(segment.shortValue),
    copyValue: segment.copyValue == null ? "" : String(segment.copyValue),
    kind: segment.kind == null ? "text" : String(segment.kind),
    tone: normalizeTone(segment.tone, "neutral"),
    priority: Number.isFinite(Number(segment.priority)) ? Number(segment.priority) : index,
    title: segment.title == null ? "" : String(segment.title),
    source: segment.source == null ? "" : String(segment.source),
    stale: Boolean(segment.stale),
    changed: Boolean(segment.changed),
    disabled: Boolean(segment.disabled),
    copyable: Boolean(segment.copyable || segment.copyValue != null),
    interactive: Boolean(segment.interactive || segment.actions?.length),
    actions: Array.isArray(segment.actions) ? segment.actions.map((action) => ({
      id: String(action.id ?? ""),
      label: String(action.label ?? action.id ?? "")
    })).filter((action) => action.id) : []
  };
}
function normalizeContextSegments(value) {
  if (typeof value === "string")
    return parseContextSegments(value).map(normalizeContextSegment).filter(Boolean);
  if (!Array.isArray(value))
    return [];
  return value.map(normalizeContextSegment).filter(Boolean);
}
function getSegmentCopyValue(segment) {
  if (!segment)
    return "";
  return String(segment.copyValue || segment.value || "");
}
function segmentsEqual(prev, next) {
  if (!prev || !next)
    return false;
  return prev.key === next.key && prev.value === next.value && prev.shortValue === next.shortValue && prev.copyValue === next.copyValue && prev.label === next.label && prev.kind === next.kind && prev.tone === next.tone && prev.disabled === next.disabled && prev.stale === next.stale && JSON.stringify(prev.actions || []) === JSON.stringify(next.actions || []);
}

// src/components/segment-strip.js
var SEGMENT_STRIP_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    color: var(--awwbookmarklet-input-fg, #111720);
  }

  .strip {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
  }

  .segment {
    min-width: 0;
    max-width: 24ch;
    border: var(--_control-border-width) solid transparent;
    border-radius: var(--_control-radius);
    color: var(--_fg, inherit);
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-space-1, 4px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .segment[data-interactive="true"] {
    cursor: pointer;
  }

  .segment:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .segment[data-changed="true"] {
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
    border-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  .segment[data-stale="true"] {
    text-decoration: line-through;
    text-decoration-thickness: 1px;
  }

  .segment[data-tone="info"] { --_fg: var(--awwbookmarklet-info-fg, #123d7a); }
  .segment[data-tone="success"] { --_fg: var(--awwbookmarklet-success-fg, #195b34); }
  .segment[data-tone="warning"] { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); }
  .segment[data-tone="danger"] { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); font-weight: 700; }

  .separator {
    flex: 0 0 auto;
    width: 1px;
    height: 1.3em;
    margin-inline: var(--awwbookmarklet-space-1, 4px);
    background: var(--awwbookmarklet-border-subtle, #9ba5b3);
    box-shadow: 1px 0 0 color-mix(in srgb, var(--awwbookmarklet-surface-raised-bg, #fff) 80%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    .segment[data-changed="true"] {
      transition: background-color 160ms ease, border-color 160ms ease;
    }
  }
`;
function segmentLabel(segment) {
  const copyValue = getSegmentCopyValue(segment);
  if (segment.label && copyValue)
    return `Copy ${segment.label}: ${copyValue}`;
  if (copyValue)
    return `Copy segment: ${copyValue}`;
  return segment.label || segment.value;
}
function eventDetail(segment, source, originalEvent) {
  return {
    segment,
    key: segment.key,
    value: segment.value,
    copyValue: getSegmentCopyValue(segment),
    source,
    anchor: source,
    originalEvent
  };
}

class AwwSegmentStrip extends HTMLElement {
  static observedAttributes = ["value", "copy-behavior"];
  #segments = [];
  #previousByKey = new Map;
  #changedTimers = new Map;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, SEGMENT_STRIP_STYLES]);
    shadow.innerHTML = `<div class="strip" part="strip" role="list"></div>`;
    this.strip = shadow.querySelector(".strip");
    this.strip.addEventListener("click", this.#onClick);
    this.strip.addEventListener("dblclick", this.#onDoubleClick);
    this.strip.addEventListener("keydown", this.#onKeyDown);
    this.strip.addEventListener("contextmenu", this.#onContextMenu);
  }
  connectedCallback() {
    this.#render();
  }
  disconnectedCallback() {
    for (const timer of this.#changedTimers.values())
      clearTimeout(timer);
    this.#changedTimers.clear();
  }
  attributeChangedCallback() {
    if (this.hasAttribute("value"))
      this.#segments = normalizeContextSegments(this.getAttribute("value"));
    this.#render();
  }
  get segments() {
    return this.#segments.map((segment) => ({ ...segment, actions: [...segment.actions || []] }));
  }
  set segments(value) {
    this.#segments = normalizeContextSegments(value);
    this.removeAttribute("value");
    this.#render();
  }
  #render() {
    if (!this.strip)
      return;
    const nextByKey = new Map(this.#segments.map((segment) => [segment.key, segment]));
    this.strip.textContent = "";
    this.#segments.forEach((segment, index) => {
      if (index > 0) {
        const separator = document.createElement("span");
        separator.className = "separator";
        separator.setAttribute("part", "separator");
        separator.setAttribute("aria-hidden", "true");
        this.strip.append(separator);
      }
      const node = document.createElement("span");
      node.className = "segment";
      node.setAttribute("part", `segment segment-${segment.tone} segment-kind-${segment.kind}`);
      node.setAttribute("role", "listitem");
      node.dataset.key = segment.key;
      node.dataset.kind = segment.kind;
      node.dataset.tone = segment.tone;
      node.dataset.stale = String(segment.stale);
      node.dataset.interactive = String(this.#isInteractive(segment));
      node.textContent = segment.shortValue || segment.value;
      node.title = segment.title || (segment.label ? `${segment.label}: ${segment.value}` : segment.value);
      if (this.#isInteractive(segment)) {
        node.tabIndex = segment.disabled ? -1 : 0;
        node.setAttribute("role", "button");
        node.setAttribute("aria-label", segment.copyable ? segmentLabel(segment) : segment.label || segment.value);
        node.setAttribute("aria-disabled", segment.disabled ? "true" : "false");
      }
      const previous = this.#previousByKey.get(segment.key);
      if ((segment.changed || previous && !segmentsEqual(previous, segment)) && !segment.disabled) {
        node.dataset.changed = "true";
        clearTimeout(this.#changedTimers.get(segment.key));
        const timer = setTimeout(() => {
          node.dataset.changed = "false";
          this.#changedTimers.delete(segment.key);
        }, 1200);
        this.#changedTimers.set(segment.key, timer);
      }
      this.strip.append(node);
    });
    this.#previousByKey = nextByKey;
  }
  #segmentFromNode(node) {
    const key = node?.dataset?.key;
    return this.#segments.find((segment) => segment.key === key) || null;
  }
  #isInteractive(segment) {
    return !segment.disabled && (segment.copyable || segment.interactive || segment.actions.length > 0);
  }
  async#requestCopy(segment, anchor, originalEvent) {
    if (!segment || segment.disabled || !segment.copyable)
      return;
    const detail = eventDetail(segment, anchor, originalEvent);
    dispatchComponentEvent(this, "awwbookmarklet-segment-copy", detail);
    if (this.getAttribute("copy-behavior") === "clipboard") {
      const result = await copyToClipboard({ text: detail.copyValue });
      dispatchComponentEvent(this, "awwbookmarklet-segment-copy-result", { ...detail, result });
    }
  }
  #activate(segment, anchor, originalEvent) {
    if (!segment || segment.disabled)
      return;
    dispatchComponentEvent(this, "awwbookmarklet-segment-activate", eventDetail(segment, anchor, originalEvent));
  }
  #onClick = (event) => {
    const node = event.target.closest?.(".segment");
    const segment = this.#segmentFromNode(node);
    if (segment?.interactive || segment?.actions.length)
      this.#activate(segment, node, event);
  };
  #onDoubleClick = (event) => {
    const node = event.target.closest?.(".segment");
    this.#requestCopy(this.#segmentFromNode(node), node, event);
  };
  #onKeyDown = (event) => {
    const node = event.target.closest?.(".segment");
    const segment = this.#segmentFromNode(node);
    if (!segment)
      return;
    if (event.key === "Enter") {
      event.preventDefault();
      if (segment.copyable)
        this.#requestCopy(segment, node, event);
      else
        this.#activate(segment, node, event);
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      this.#activate(segment, node, event);
    }
  };
  #onContextMenu = (event) => {
    const node = event.target.closest?.(".segment");
    const segment = this.#segmentFromNode(node);
    if (!segment || segment.disabled)
      return;
    event.preventDefault();
    dispatchComponentEvent(this, "awwbookmarklet-segment-menu-request", eventDetail(segment, node, event));
  };
}

// src/components/context-bar.js
var CONTEXT_BAR_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .bar {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-surface-padding, 8px);
    overflow: hidden;
  }

  :host([data-density="compact"]) .bar {
    min-height: 24px;
    padding-inline: var(--awwbookmarklet-space-2, 6px);
  }

  :host([data-density="spacious"]) .bar {
    min-height: calc(var(--awwbookmarklet-size-control-h, 30px) + var(--awwbookmarklet-space-2, 8px));
  }

  :host([busy]) .bar {
    cursor: progress;
  }

  .leading,
  .actions {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  .leading:empty,
  .actions:empty {
    display: none;
  }

  awwbookmarklet-segment-strip {
    min-width: 0;
  }

  .progress {
    position: absolute;
    inset: auto 0 0;
    height: 2px;
    background: transparent;
    overflow: hidden;
  }

  .progress-fill {
    display: block;
    width: var(--_progress, 0%);
    height: 100%;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  :host([busy]:not([progress])) .progress-fill {
    width: 38%;
  }

  @media (prefers-reduced-motion: no-preference) {
    :host([busy]:not([progress])) .progress-fill {
      animation: aww-context-busy 1.1s steps(14, end) infinite;
    }
  }

  @keyframes aww-context-busy {
    from { translate: -100% 0; }
    to { translate: 260% 0; }
  }
`;

class AwwContextBar extends HTMLElement {
  static observedAttributes = ["value", "copy-behavior", "density", "busy", "progress", "max"];
  #segments = [];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CONTEXT_BAR_STYLES]);
    shadow.innerHTML = `
      <section class="bar" part="bar">
        <div class="leading" part="leading"><slot name="leading"></slot></div>
        <${TAGS.segmentStrip} part="segments"></${TAGS.segmentStrip}>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
        <div class="progress" part="progress"><span class="progress-fill" part="progress-fill"></span></div>
      </section>
    `;
    this.strip = shadow.querySelector(TAGS.segmentStrip);
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get segments() {
    return this.#segments;
  }
  set segments(value) {
    this.#segments = Array.isArray(value) ? value : [];
    this.removeAttribute("value");
    this.#sync();
  }
  get progress() {
    return Number(this.getAttribute("progress") || "0");
  }
  set progress(value) {
    this.setAttribute("progress", String(value ?? ""));
  }
  expand() {
    dispatchComponentEvent(this, "awwbookmarklet-context-bar-expand", { source: this });
  }
  collapse() {
    dispatchComponentEvent(this, "awwbookmarklet-context-bar-collapse", { source: this });
  }
  #sync() {
    if (!this.strip)
      return;
    this.dataset.density = normalizeDensity(this.getAttribute("density"));
    this.strip.setAttribute("copy-behavior", this.getAttribute("copy-behavior") || "event");
    if (this.hasAttribute("value"))
      this.strip.setAttribute("value", this.getAttribute("value") || "");
    else
      this.strip.segments = this.#segments;
    const max = Number(this.getAttribute("max") || "100");
    const value = Number(this.getAttribute("progress") || "0");
    const pct = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
    this.style.setProperty("--_progress", `${pct}%`);
    this.setAttribute("aria-busy", this.hasAttribute("busy") ? "true" : "false");
  }
}

// src/components/status-strip.js
var STATUS_STRIP_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    background: var(--awwbookmarklet-statusbar-bg, #e5e8ee);
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    color: var(--awwbookmarklet-text-muted, #586272);
  }

  .status {
    min-height: 24px;
    display: flex;
    align-items: center;
    padding-inline: var(--awwbookmarklet-space-2, 8px);
  }

  :host([data-density="compact"]) .status {
    min-height: 20px;
    font-size: 12px;
  }

  awwbookmarklet-segment-strip {
    width: 100%;
  }
`;

class AwwStatusStrip extends HTMLElement {
  static observedAttributes = ["value", "copy-behavior", "density", "live"];
  #segments = [];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, STATUS_STRIP_STYLES]);
    shadow.innerHTML = `<div class="status" part="status"><${TAGS.segmentStrip} part="segments"></${TAGS.segmentStrip}></div>`;
    this.strip = shadow.querySelector(TAGS.segmentStrip);
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get segments() {
    return this.#segments;
  }
  set segments(value) {
    this.#segments = Array.isArray(value) ? value : [];
    this.removeAttribute("value");
    this.#sync();
  }
  #sync() {
    if (!this.strip)
      return;
    this.dataset.density = normalizeDensity(this.getAttribute("density"));
    this.strip.setAttribute("copy-behavior", this.getAttribute("copy-behavior") || "event");
    if (this.hasAttribute("value"))
      this.strip.setAttribute("value", this.getAttribute("value") || "");
    else
      this.strip.segments = this.#segments;
    const live = this.getAttribute("live") || "polite";
    this.setAttribute("aria-live", ["off", "polite", "assertive"].includes(live) ? live : "polite");
  }
}

// src/components/titlebar.js
var TITLEBAR_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    min-height: var(--awwbookmarklet-size-title-h, 32px);
    background: linear-gradient(180deg, color-mix(in srgb, #f7f9fb calc(var(--awwbookmarklet-frost-opacity, 1) * 100%), var(--awwbookmarklet-titlebar-active-bg, #dce2e9)), var(--awwbookmarklet-titlebar-active-bg, #dce2e9));
    color: var(--awwbookmarklet-titlebar-fg, #121820);
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    user-select: none;
  }

  :host([inactive]) {
    background: linear-gradient(180deg, color-mix(in srgb, #eef2f6 calc(var(--awwbookmarklet-frost-opacity, 1) * 100%), var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd)), var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd));
  }

  .bar {
    min-height: inherit;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--awwbookmarklet-titlebar-gap, 6px);
    padding-inline: var(--awwbookmarklet-titlebar-padding-x, 6px);
  }

  .drag-region {
    min-width: 0;
    cursor: grab;
  }

  .system,
  .commands {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-1, 4px);
  }

  button {
    min-width: 22px;
    height: 22px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-button-bg, #edf1f5);
    color: inherit;
    font: inherit;
  }

  button:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }
`;

class AwwTitlebar extends HTMLElement {
  static observedAttributes = ["value", "title", "inactive"];
  #segments = [];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TITLEBAR_STYLES]);
    shadow.innerHTML = `
      <div class="bar" part="bar">
        <div class="system" part="system"><slot name="system"><button type="button" part="system-button" aria-label="System menu">◫</button></slot></div>
        <div class="drag-region" part="drag-region">
          <${TAGS.segmentStrip} part="segments"></${TAGS.segmentStrip}>
        </div>
        <div class="commands" part="commands"><slot name="commands"></slot></div>
      </div>
    `;
    this.strip = shadow.querySelector(TAGS.segmentStrip);
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get segments() {
    return this.#segments;
  }
  set segments(value) {
    this.#segments = Array.isArray(value) ? value : [];
    this.removeAttribute("value");
    this.#sync();
  }
  #sync() {
    if (!this.strip)
      return;
    const value = this.getAttribute("value") || this.getAttribute("title") || "";
    if (value)
      this.strip.setAttribute("value", value);
    else
      this.strip.segments = this.#segments;
  }
}

// src/components/context-panel.js
var CONTEXT_PANEL_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-panel-padding, var(--awwbookmarklet-surface-padding, 8px));
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--awwbookmarklet-surface-gap, 8px);
  }

  .item {
    min-width: 0;
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
    padding: var(--awwbookmarklet-card-padding, 8px);
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  .label {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.3;
  }

  .value {
    overflow-wrap: anywhere;
    font-weight: 650;
  }

  .item[data-copyable="true"] {
    cursor: pointer;
  }

  .item[data-tone="info"] { --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  .item[data-tone="success"] { --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  .item[data-tone="warning"] { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  .item[data-tone="danger"] { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

class AwwContextPanel extends HTMLElement {
  static observedAttributes = ["value"];
  #segments = [];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CONTEXT_PANEL_STYLES]);
    shadow.innerHTML = `<section class="grid" part="grid"></section>`;
    this.grid = shadow.querySelector(".grid");
    this.grid.addEventListener("dblclick", (event) => this.#copyFromEvent(event));
    this.grid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter")
        return;
      this.#copyFromEvent(event);
    });
  }
  connectedCallback() {
    this.#sync();
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get segments() {
    return this.#segments;
  }
  set segments(value) {
    this.#segments = normalizeContextSegments(value);
    this.removeAttribute("value");
    this.#render();
  }
  #sync() {
    if (this.hasAttribute("value"))
      this.#segments = normalizeContextSegments(this.getAttribute("value"));
    this.#render();
  }
  #render() {
    if (!this.grid)
      return;
    this.grid.textContent = "";
    for (const segment of this.#segments) {
      const item = document.createElement("article");
      item.className = "item";
      item.setAttribute("part", `item item-${segment.tone}`);
      item.dataset.key = segment.key;
      item.dataset.tone = segment.tone;
      item.dataset.copyable = String(segment.copyable);
      if (segment.copyable) {
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Copy ${segment.label || segment.key}: ${getSegmentCopyValue(segment)}`);
      }
      item.innerHTML = `
        <div class="label" part="label"></div>
        <div class="value" part="value"></div>
      `;
      item.querySelector(".label").textContent = segment.label || segment.kind || segment.key;
      item.querySelector(".value").textContent = segment.value;
      this.grid.append(item);
    }
  }
  #copyFromEvent(event) {
    const item = event.target.closest?.(".item");
    const segment = this.#segments.find((entry) => entry.key === item?.dataset?.key);
    if (!segment?.copyable)
      return;
    event.preventDefault();
    dispatchComponentEvent(this, "awwbookmarklet-segment-copy", {
      segment,
      key: segment.key,
      value: segment.value,
      copyValue: getSegmentCopyValue(segment),
      source: this,
      anchor: item,
      originalEvent: event
    });
  }
}

// src/components/split-pane.js
var SPLITTER_SIZE = 8;
var DEFAULT_VALUE = 280;
var SPLIT_PANE_STYLES = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .container {
    display: grid;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  :host([direction="horizontal"]) .container {
    grid-template-columns: var(--_start-size, 280px) var(--_splitter-size, 8px) minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
  }

  :host([direction="vertical"]) .container {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: var(--_start-size, 280px) var(--_splitter-size, 8px) minmax(0, 1fr);
  }

  .pane {
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  .splitter {
    display: grid;
    place-items: center;
    min-width: 0;
    min-height: 0;
    background: var(--awwbookmarklet-surface-inset-bg, #dfe4ea);
    border: 0 solid var(--awwbookmarklet-border-subtle, #a8b0ba);
    touch-action: none;
    user-select: none;
  }

  :host([direction="horizontal"]) .splitter {
    cursor: col-resize;
    border-inline-width: 1px;
  }

  :host([direction="vertical"]) .splitter {
    cursor: row-resize;
    border-block-width: 1px;
  }

  :host([disabled]) .splitter {
    cursor: default;
    opacity: 0.65;
  }

  .splitter:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
    z-index: 1;
  }

  .grip {
    width: 2px;
    height: 28px;
    background: var(--awwbookmarklet-border-subtle, #a8b0ba);
    box-shadow: 3px 0 0 var(--awwbookmarklet-border-subtle, #a8b0ba);
  }

  :host([direction="vertical"]) .grip {
    width: 28px;
    height: 2px;
    box-shadow: 0 3px 0 var(--awwbookmarklet-border-subtle, #a8b0ba);
  }
`;
function clampSplitValue(value, { available, minStart = 160, minEnd = 240, maxStart = Infinity } = {}) {
  const numericValue = toFiniteNumber(value, DEFAULT_VALUE);
  const usable = Math.max(0, toFiniteNumber(available, 0));
  const hardMin = Math.max(0, toFiniteNumber(minStart, 160));
  const hardMax = Math.max(0, usable - Math.max(0, toFiniteNumber(minEnd, 240)));
  const effectiveMax = Number.isFinite(maxStart) ? Math.min(hardMax, Math.max(0, maxStart)) : hardMax;
  if (effectiveMax < hardMin)
    return Math.max(0, Math.min(numericValue, hardMax));
  return Math.min(Math.max(numericValue, hardMin), effectiveMax);
}
function splitValueFromPointerDelta(direction, input) {
  return input.startValue + (direction === "vertical" ? input.clientY - input.startClientY : input.clientX - input.startClientX);
}
function normalizeSplitDirection(value) {
  return value === "vertical" ? "vertical" : "horizontal";
}
var BaseHTMLElement = globalThis.HTMLElement || class {
};

class AwwSplitPane extends BaseHTMLElement {
  static observedAttributes = ["direction", "value", "min-start", "min-end", "max-start", "disabled", "aria-label"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, SPLIT_PANE_STYLES]);
    shadow.innerHTML = `
      <div class="container" part="container">
        <div class="pane start" part="start-pane"><slot name="start"></slot></div>
        <div class="splitter" part="splitter" role="separator" tabindex="0">
          <div class="grip" part="splitter-grip"></div>
        </div>
        <div class="pane end" part="end-pane"><slot name="end"></slot></div>
      </div>
    `;
    this.splitter = shadow.querySelector(".splitter");
    this.drag = null;
    this.resizeObserver = null;
    this.onPointerMove = (event) => this.#handlePointerMove(event);
    this.onPointerUp = (event) => this.#finishPointer(event);
  }
  connectedCallback() {
    if (!this.hasAttribute("direction"))
      this.setAttribute("direction", "horizontal");
    this.#sync();
    this.splitter.addEventListener("pointerdown", (event) => this.#handlePointerDown(event));
    this.splitter.addEventListener("keydown", (event) => this.#handleKeydown(event));
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.#setValue(this.value, { emit: false, reflect: true }));
      this.resizeObserver.observe(this);
    } else {
      window.addEventListener("resize", () => this.#setValue(this.value, { emit: false, reflect: true }));
    }
  }
  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerUp);
  }
  attributeChangedCallback() {
    this.#sync();
  }
  get value() {
    return toFiniteNumber(this.getAttribute("value"), DEFAULT_VALUE);
  }
  set value(next) {
    this.#setValue(next, { emit: false, reflect: true });
  }
  get direction() {
    return normalizeSplitDirection(this.getAttribute("direction"));
  }
  #sync() {
    const direction = this.direction;
    if (this.getAttribute("direction") !== direction)
      this.setAttribute("direction", direction);
    this.#setValue(this.value, { emit: false, reflect: false });
    this.splitter?.setAttribute("aria-orientation", direction === "vertical" ? "horizontal" : "vertical");
    this.splitter?.setAttribute("aria-label", this.getAttribute("aria-label") || "Resize panels");
  }
  #setValue(value, { emit = true, commit = false, dragging = false, reflect = true } = {}) {
    const next = Math.round(this.#clamp(value));
    if (reflect && this.getAttribute("value") !== String(next))
      this.setAttribute("value", String(next));
    this.style.setProperty("--_start-size", `${next}px`);
    this.style.setProperty("--_splitter-size", `${SPLITTER_SIZE}px`);
    this.#syncAria(next);
    if (emit)
      this.#emit(commit ? "awwbookmarklet-split-pane-resize-commit" : "awwbookmarklet-split-pane-resize", { value: next, direction: this.direction, dragging });
  }
  #clamp(value) {
    const rect = this.getBoundingClientRect();
    const available = (this.direction === "vertical" ? rect.height : rect.width) - SPLITTER_SIZE;
    return clampSplitValue(value, {
      available,
      minStart: toFiniteNumber(this.getAttribute("min-start"), 160),
      minEnd: toFiniteNumber(this.getAttribute("min-end"), 240),
      maxStart: this.hasAttribute("max-start") ? toFiniteNumber(this.getAttribute("max-start"), Infinity) : Infinity
    });
  }
  #syncAria(value) {
    const rect = this.getBoundingClientRect();
    const available = Math.max(0, (this.direction === "vertical" ? rect.height : rect.width) - SPLITTER_SIZE);
    const min = Math.max(0, toFiniteNumber(this.getAttribute("min-start"), 160));
    const max = Math.max(0, available - Math.max(0, toFiniteNumber(this.getAttribute("min-end"), 240)));
    this.splitter?.setAttribute("aria-valuemin", String(Math.min(min, max)));
    this.splitter?.setAttribute("aria-valuemax", String(max));
    this.splitter?.setAttribute("aria-valuenow", String(value));
  }
  #handlePointerDown(event) {
    if (this.hasAttribute("disabled"))
      return;
    event.preventDefault();
    this.drag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startValue: this.value
    };
    this.splitter.setPointerCapture?.(event.pointerId);
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointercancel", this.onPointerUp);
  }
  #handlePointerMove(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId)
      return;
    const next = splitValueFromPointerDelta(this.direction, { ...this.drag, clientX: event.clientX, clientY: event.clientY });
    this.#setValue(next, { dragging: true });
  }
  #finishPointer(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId)
      return;
    this.splitter.releasePointerCapture?.(event.pointerId);
    this.drag = null;
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerUp);
    this.#emit("awwbookmarklet-split-pane-resize-commit", { value: this.value, direction: this.direction });
  }
  #handleKeydown(event) {
    if (this.hasAttribute("disabled"))
      return;
    const step = event.shiftKey ? 50 : 10;
    const horizontal = this.direction === "horizontal";
    const max = Number(this.splitter.getAttribute("aria-valuemax")) || this.value;
    const min = Number(this.splitter.getAttribute("aria-valuemin")) || 0;
    let next = null;
    if (horizontal && event.key === "ArrowLeft")
      next = this.value - step;
    if (horizontal && event.key === "ArrowRight")
      next = this.value + step;
    if (!horizontal && event.key === "ArrowUp")
      next = this.value - step;
    if (!horizontal && event.key === "ArrowDown")
      next = this.value + step;
    if (event.key === "Home")
      next = min;
    if (event.key === "End")
      next = max;
    if (next === null)
      return;
    event.preventDefault();
    this.#setValue(next, { dragging: false });
    this.#emit("awwbookmarklet-split-pane-resize-commit", { value: this.value, direction: this.direction });
  }
  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail }));
  }
}
function toFiniteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
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
    [TAGS.metricCard, AwwMetricCard],
    [TAGS.segmentStrip, AwwSegmentStrip],
    [TAGS.contextBar, AwwContextBar],
    [TAGS.statusStrip, AwwStatusStrip],
    [TAGS.titlebar, AwwTitlebar],
    [TAGS.contextPanel, AwwContextPanel],
    [TAGS.splitPane, AwwSplitPane]
  ]);
}

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
function getDesktopRecord(version = FRAMEWORK_VERSION) {
  return getGlobalMap().get(version) ?? null;
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

// src/icons/retro-icons.js
var BASE_ATTRS = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"`;
var ICONS = {
  logo: `<rect x="3" y="3" width="18" height="18" fill="currentColor" stroke="none"/><path d="M7 16V8h3l2 8 2-8h3v8" stroke="#f6f8fb"/><path d="M7 12h3M14 12h3" stroke="#f6f8fb"/>`,
  window: `<rect x="4" y="5" width="16" height="14"/><path d="M4 9h16M7 7h1M10 7h1"/>`,
  minimize: `<path d="M7 17h10"/>`,
  maximize: `<rect x="7" y="7" width="10" height="10"/><path d="M10 4h10v10"/>`,
  close: `<path d="M6 6l12 12M18 6L6 18"/>`,
  menu: `<path d="M5 7h14M5 12h14M5 17h14"/>`,
  panel: `<rect x="5" y="5" width="14" height="14"/><path d="M8 8h8M8 12h8M8 16h5"/>`,
  back: `<path d="M14 6l-6 6 6 6M9 12h10"/>`,
  forward: `<path d="M10 6l6 6-6 6M5 12h10"/>`,
  refresh: `<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>`,
  search: `<circle cx="10" cy="10" r="5"/><path d="M14 14l6 6"/>`,
  lock: `<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>`,
  url: `<rect x="4" y="6" width="16" height="12"/><path d="M7 10h10M7 14h7"/>`,
  link: `<path d="M10 8l2-2a4 4 0 0 1 6 6l-2 2M14 16l-2 2a4 4 0 0 1-6-6l2-2M9 15l6-6"/>`,
  external: `<rect x="5" y="7" width="12" height="12"/><path d="M12 5h7v7M19 5l-8 8"/>`,
  copyUrl: `<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10v-2"/>`,
  star: `<path d="M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>`,
  fullscreen: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5"/>`,
  more: `<circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>`,
  capture: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5M9 12h6"/>`,
  console: `<rect x="4" y="6" width="16" height="12"/><path d="M7 10l3 2-3 2M12 15h5"/>`,
  eye: `<path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2"/>`,
  upload: `<path d="M12 17V5M8 9l4-4 4 4M5 19h14"/>`,
  dialog: `<rect x="5" y="6" width="14" height="12"/><path d="M5 10h14M8 8h1"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>`,
  sliders: `<path d="M5 7h14M5 12h14M5 17h14"/><rect x="8" y="5" width="3" height="4"/><rect x="14" y="10" width="3" height="4"/><rect x="6" y="15" width="3" height="4"/>`,
  copy: `<rect x="8" y="5" width="10" height="14"/><path d="M6 8H4v11h10"/>`,
  paste: `<path d="M9 5h6l1 3H8z"/><rect x="6" y="8" width="12" height="12"/>`,
  cut: `<circle cx="7" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><path d="M9 8l9 9M9 16l9-9"/>`,
  edit: `<path d="M5 17l1 3 3-1 9-9-4-4zM13 7l4 4"/>`,
  trash: `<path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13M10 10v7M14 10v7"/>`,
  markdown: `<rect x="4" y="6" width="16" height="12"/><path d="M7 15V9l3 4 3-4v6M16 9v6M14 13l2 2 2-2"/>`,
  folder: `<path d="M3 8h7l2 2h9v9H3z"/>`,
  document: `<path d="M7 3h7l4 4v14H7zM14 3v5h4"/>`,
  article: `<path d="M7 4h10v16H7zM10 8h4M10 12h4M10 16h4"/>`,
  text: `<path d="M5 6h14M12 6v12M9 18h6"/>`,
  image: `<rect x="5" y="6" width="14" height="12"/><path d="M7 16l4-5 3 3 2-2 3 4"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>`,
  list: `<path d="M9 7h10M9 12h10M9 17h10"/><path d="M5 7h1M5 12h1M5 17h1"/>`,
  table: `<rect x="4" y="5" width="16" height="14"/><path d="M4 10h16M4 15h16M10 5v14M15 5v14"/>`,
  metrics: `<path d="M5 19V9M12 19V5M19 19v-7M3 19h18"/>`,
  code: `<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>`,
  note: `<path d="M6 4h12v14l-4 3H6zM14 18v3M9 8h6M9 12h6"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/>`,
  success: `<circle cx="12" cy="12" r="9"/><path d="M7 12l3 3 7-7"/>`,
  warning: `<path d="M12 4l9 16H3zM12 9v5M12 17h.01"/>`,
  error: `<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>`,
  neutral: `<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>`,
  selected: `<rect x="5" y="5" width="14" height="14"/><path d="M8 12l3 3 5-6"/>`,
  unselected: `<rect x="5" y="5" width="14" height="14"/>`,
  radioSelected: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>`,
  radio: `<circle cx="12" cy="12" r="8"/>`,
  progress: `<rect x="5" y="9" width="14" height="6"/><path d="M6 12h8"/>`,
  progressIndeterminate: `<rect x="5" y="9" width="14" height="6"/><path d="M7 14l4-4M12 14l4-4"/>`,
  sync: `<path d="M18 8a7 7 0 0 0-12-1M6 4v4h4M6 16a7 7 0 0 0 12 1M18 20v-4h-4"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>`,
  draft: `<path d="M6 4h12v16H6zM9 8h6M9 12h4"/><path d="M16 16l3 3"/>`,
  shield: `<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/>`,
  blocked: `<circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/>`,
  frameBlocked: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>`,
  accessBlocked: `<rect x="6" y="10" width="12" height="10"/><path d="M8 10V7a4 4 0 0 1 8 0v3M9 15h6"/>`,
  browserBlocked: `<rect x="4" y="6" width="16" height="12"/><path d="M4 10h16M8 14l8 0M9 17l6-6"/>`,
  noResults: `<circle cx="10" cy="10" r="5"/><path d="M14 14l5 5M5 19h14" stroke-dasharray="3 3"/>`,
  noCaptures: `<path d="M5 10V5h5M14 5h5v5M19 14v5h-5M10 19H5v-5" stroke-dasharray="4 3"/>`,
  noSelection: `<rect x="5" y="5" width="14" height="14" stroke-dasharray="4 3"/>`,
  retry: `<path d="M18 8a7 7 0 1 0 1 6M18 4v4h-4"/>`,
  permissions: `<path d="M9 19a5 5 0 0 1 6-8M12 4a4 4 0 1 1 0 8M16 16h5M18.5 13.5v5"/>`,
  grid: `<rect x="5" y="5" width="5" height="5"/><rect x="14" y="5" width="5" height="5"/><rect x="5" y="14" width="5" height="5"/><rect x="14" y="14" width="5" height="5"/>`,
  filter: `<path d="M4 6h16l-6 7v5l-4 2v-7z"/>`,
  sort: `<path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3"/>`,
  columns: `<rect x="4" y="5" width="16" height="14"/><path d="M10 5v14M16 5v14"/>`,
  pane: `<rect x="4" y="5" width="16" height="14"/><path d="M12 5v14"/>`
};
var ICON_NAMES = Object.freeze(Object.keys(ICONS));
function iconSvg(name, { label = "", className = "ui-icon" } = {}) {
  const body = ICONS[name] || ICONS.panel;
  const accessibility = label ? `role="img" aria-label="${escapeHtml(label)}"` : `aria-hidden="true"`;
  return `<svg class="${className}" ${BASE_ATTRS} ${accessibility}>${body}</svg>`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
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
function mountWindow(win, prefix, theme = null) {
  const owner = nextOwner(prefix);
  const record = acquireDesktopRoot(owner);
  if (theme)
    applyThemePatch(win, theme);
  record.root.append(win);
  win.addEventListener("awwbookmarklet-window-closed", () => releaseDesktopRoot(owner), { once: true });
  return win;
}
function openExample() {
  mountWindow(buildExampleToolWindow({ title: "Session Capture Console" }), "example");
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
  win.setRect({ x: 110, y: 80, width: 430, height: 270 });
  mountWindow(win, "blank");
}
var THEME_RECIPES = {
  default: {},
  accent: {
    [PUBLIC_TOKENS.selectionBg]: "#2f6f4e",
    [PUBLIC_TOKENS.selectionFg]: "#f4fff8",
    [PUBLIC_TOKENS.focusRing]: "#1f7a4a",
    [PUBLIC_TOKENS.titlebarActiveBg]: "#d8e6dc",
    [PUBLIC_TOKENS.windowBg]: "#f1f5f2",
    [PUBLIC_TOKENS.panelBg]: "#fbfdfb"
  },
  compact: {
    [PUBLIC_TOKENS.space1]: "3px",
    [PUBLIC_TOKENS.space2]: "6px",
    [PUBLIC_TOKENS.space3]: "8px",
    [PUBLIC_TOKENS.controlHeight]: "26px",
    [PUBLIC_TOKENS.titleHeight]: "28px",
    [PUBLIC_TOKENS.controlPaddingX]: "8px",
    [PUBLIC_TOKENS.buttonPaddingX]: "8px",
    [PUBLIC_TOKENS.inputPaddingX]: "6px",
    [PUBLIC_TOKENS.windowBodyPadding]: "8px",
    [PUBLIC_TOKENS.panelPadding]: "6px",
    [PUBLIC_TOKENS.cardPadding]: "6px",
    [PUBLIC_TOKENS.menuItemHeight]: "26px"
  },
  rounded: {
    [PUBLIC_TOKENS.radiusControl]: "4px",
    [PUBLIC_TOKENS.radiusSurface]: "6px",
    [PUBLIC_TOKENS.radiusWindow]: "8px",
    [PUBLIC_TOKENS.windowBg]: "#f4f2f0",
    [PUBLIC_TOKENS.panelBg]: "#fbfaf8",
    [PUBLIC_TOKENS.selectionBg]: "#725c3a",
    [PUBLIC_TOKENS.focusRing]: "#8a6d3b",
    [PUBLIC_TOKENS.buttonShadow]: "none"
  },
  highContrast: {
    [PUBLIC_TOKENS.windowBg]: "#ffffff",
    [PUBLIC_TOKENS.panelBg]: "#ffffff",
    [PUBLIC_TOKENS.surfaceRaisedBg]: "#ffffff",
    [PUBLIC_TOKENS.surfaceInsetBg]: "#eeeeee",
    [PUBLIC_TOKENS.inputBg]: "#ffffff",
    [PUBLIC_TOKENS.inputFg]: "#000000",
    [PUBLIC_TOKENS.textMuted]: "#222222",
    [PUBLIC_TOKENS.borderStrong]: "#000000",
    [PUBLIC_TOKENS.borderSubtle]: "#333333",
    [PUBLIC_TOKENS.dividerColor]: "#333333",
    [PUBLIC_TOKENS.selectionBg]: "#003b8e",
    [PUBLIC_TOKENS.selectionFg]: "#ffffff",
    [PUBLIC_TOKENS.focusRing]: "#ffbf00",
    [PUBLIC_TOKENS.focusRingWidth]: "3px"
  }
};
function buildThemeDemoWindow(label) {
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", `${label} Theme`);
  win.innerHTML = `
    <${TAGS.menubar} slot="menubar">
      <button type="button" data-menu="theme">Theme</button>
      <${TAGS.menu} name="theme">
        <button type="button" data-command="theme.apply">Apply recipe</button>
        <button type="button" data-command="theme.inspect">Inspect tokens</button>
      </${TAGS.menu}>
    </${TAGS.menubar}>
    <${TAGS.toolbar} slot="toolbar" wrap>
      <${TAGS.button} variant="primary">Primary</${TAGS.button}>
      <${TAGS.button}>Default</${TAGS.button}>
      <${TAGS.button} variant="ghost">Ghost</${TAGS.button}>
      <${TAGS.iconButton} label="Refresh">${iconSvg("refresh")}</${TAGS.iconButton}>
    </${TAGS.toolbar}>
    <${TAGS.appShell}>
      <span slot="title">${label} recipe</span>
      <span slot="subtitle">A real window-scoped theme using framework tokens.</span>
      <${TAGS.alert} tone="warning" title="Portal check">Open the Theme menu to verify the portaled menu keeps this window's theme.</${TAGS.alert}>
      <${TAGS.panel}>
        <span slot="title">Controls</span>
        <${TAGS.field} label="Search"><${TAGS.input} value="tokenized controls"></${TAGS.input}></${TAGS.field}>
        <${TAGS.field} label="Mode"><${TAGS.select}><option>Preview</option><option>Capture</option></${TAGS.select}></${TAGS.field}>
        <${TAGS.tabs}>
          <${TAGS.tabPanel} label="Cards" selected>
            <${TAGS.card} selected>
              <span slot="title">Selected card</span>
              <span slot="meta">Radius, padding, borders, and focus are token-driven.</span>
            </${TAGS.card}>
          </${TAGS.tabPanel}>
          <${TAGS.tabPanel} label="State">
            <${TAGS.statusLine} tone="success">Theme applied before visible mount.</${TAGS.statusLine}>
          </${TAGS.tabPanel}>
        </${TAGS.tabs}>
      </${TAGS.panel}>
    </${TAGS.appShell}>
    <${TAGS.statusbar} slot="statusbar"><span>${label}</span><span>window scoped</span><span>tokens</span></${TAGS.statusbar}>
  `;
  win.setRect({ x: 120 + serial * 18, y: 96 + serial * 18, width: 560, height: 460 });
  return win;
}
function openThemeDemo(name) {
  const label = name === "highContrast" ? "High Contrast" : name[0].toUpperCase() + name.slice(1);
  mountWindow(buildThemeDemoWindow(label), `theme-${name}`, THEME_RECIPES[name]);
}
function button(label, options = {}) {
  const { variant = "secondary", icon = "", id = "", disabled = false, aria = "" } = options;
  return `<button class="os-button os-button--${variant}"${id ? ` id="${id}"` : ""}${disabled ? " disabled" : ""}${aria ? ` aria-label="${aria}"` : ""}>${icon ? iconSvg(icon) : ""}<span>${label}</span></button>`;
}
function iconButton(label, name, options = {}) {
  const { id = "", pressed = false } = options;
  return `<button class="icon-button"${id ? ` id="${id}"` : ""} aria-label="${label}"${pressed ? ` aria-pressed="true"` : ""}>${iconSvg(name)}</button>`;
}
function keycap(text) {
  return `<kbd class="keycap">${text}</kbd>`;
}
function field(label, control, options = {}) {
  const { help = "", error = "", required = false, disabled = false } = options;
  return `
    <label class="field-row${disabled ? " is-disabled" : ""}${error ? " is-invalid" : ""}">
      <span class="field-label">${label}${required ? `<span aria-hidden="true">*</span>` : ""}</span>
      <span class="field-main">${control}${help ? `<small>${help}</small>` : ""}${error ? `<small class="field-error">${error}</small>` : ""}</span>
    </label>
  `;
}
function panel({ title, icon = "panel", meta = "", className = "", body = "", actions = "" }) {
  return `
    <section class="catalog-panel ${className}">
      <header class="panel-titlebar">
        <span class="panel-title">${iconSvg(icon)}<span>${title}</span></span>
        ${meta ? `<span class="panel-meta">${meta}</span>` : ""}
        ${actions ? `<span class="panel-actions">${actions}</span>` : ""}
      </header>
      <div class="panel-body">${body}</div>
    </section>
  `;
}
function miniWindow({ title, body, footer = "", className = "" }) {
  return `
    <div class="mini-window ${className}">
      <div class="mini-titlebar">
        <span>${iconSvg("window")} ${title}</span>
        <span class="window-controls" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
      <div class="mini-body">${body}</div>
      ${footer ? `<div class="mini-status">${footer}</div>` : ""}
    </div>
  `;
}
function stateCard(tone, icon, title, message, action = "") {
  return `
    <article class="state-card state-card--${tone}">
      <span class="state-icon">${iconSvg(icon)}</span>
      <span class="state-copy"><strong>${title}</strong><small>${message}</small></span>
      ${action ? `<span class="state-action">${action}</span>` : ""}
    </article>
  `;
}
function metricRegister(items) {
  return `<div class="metric-register">${items.map((item) => `
    <div><span>${item.label}</span><strong>${item.value}</strong><small>${item.detail}</small></div>
  `).join("")}</div>`;
}
function commandList(commands) {
  return `
    <div class="command-surface">
      <label class="search-box">${iconSvg("search")}<input value="" placeholder="Type a command or search..." aria-label="Command search" /><span>${keycap("Ctrl+K")}</span></label>
      <div class="command-list" role="listbox" aria-label="Commands">
        ${commands.map((cmd, index) => `
          <button class="command-row${index === 0 ? " is-selected" : ""}" type="button" role="option" aria-selected="${index === 0 ? "true" : "false"}">
            ${iconSvg(cmd.icon)}
            <span><strong>${cmd.title}</strong><small>${cmd.desc}</small></span>
            <span class="shortcut">${cmd.keys.map(keycap).join("")}</span>
          </button>
        `).join("")}
      </div>
      <footer class="command-footer"><span>${keycap("↑")} ${keycap("↓")} Navigate</span><span>${keycap("Enter")} Execute</span><span>${keycap("Esc")} Close</span></footer>
    </div>
  `;
}
function urlPicker() {
  const rows = [
    ["url", "https://example.com/research", "Current page"],
    ["article", "https://example.com/research/notes", "Recent page"],
    ["table", "https://example.com/research/data", "Recent page"],
    ["clock", "https://example.com/research/archive", "Visited 2d ago"],
    ["search", 'Search history for "research"', "Press Enter to search all history"]
  ];
  return `
    <div class="url-surface">
      <label class="select-like"><input value="https://example.com/research" aria-label="URL picker" /><button aria-label="Open URL suggestions">${iconSvg("menu")}</button></label>
      <div class="url-list" role="listbox" aria-label="URL suggestions">
        ${rows.map((row, index) => `
          <button class="url-row${index === 0 ? " is-selected" : ""}" type="button" role="option" aria-selected="${index === 0 ? "true" : "false"}">
            ${iconSvg(row[0])}<span><strong>${row[1]}</strong><small>${row[2]}</small></span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}
function browserToolbar(address = "https://example.com/research") {
  return `
    <div class="browser-toolbar">
      ${iconButton("Back", "back")}
      ${iconButton("Forward", "forward")}
      ${iconButton("Refresh", "refresh")}
      <label class="browser-address">${iconSvg("lock")}<input value="${address}" aria-label="Address" /></label>
      ${iconButton("Bookmark", "star")}
      ${iconButton("Fullscreen", "fullscreen", { pressed: true })}
      ${iconButton("More", "more")}
    </div>
  `;
}
function systemOverview() {
  return `
    <section class="system-overview">
      <div class="product-cell">
        <div class="app-logo">${iconSvg("logo", { label: "AWW" })}</div>
        <div>
          <h1>Component Catalog for Constrained Bookmarklet Tools</h1>
          <p>A curated set of primitives, patterns, and interaction tools for injection, capture, preview, commands, and resilient fallback paths.</p>
        </div>
        <div class="hero-actions">
          ${button("Open Sample Tool", { variant: "primary", id: "hero-example" })}
          ${button("Open Blank Window", { id: "hero-blank" })}
        </div>
      </div>
      ${miniWindow({
    title: "System Preview / Session Capture Console",
    className: "system-preview",
    body: `
          <div class="register-line"><span>Target</span><strong>https://example.org/reports</strong></div>
          <div class="register-line"><span>Mode</span><strong>Bookmarklet / constrained</strong></div>
          <div class="meter-row"><span>CPU</span><progress value="18" max="100"></progress><small>18%</small></div>
        `,
    footer: `<span>Ready</span><span>Policy: limited</span>`
  })}
      <div class="status-register">
        <fieldset>
          <legend>System Status</legend>
          <div><span>Environment</span><strong>Browser</strong></div>
          <div><span>Permissions</span><strong>Limited</strong></div>
          <div><span>Migration mode</span><strong>Enabled</strong></div>
          <div><span>Fallback mode</span><strong>Available</strong></div>
          <hr />
          <div><span>Last sync</span><strong>1m ago</strong></div>
          <div><span>Local cache</span><strong>128 items</strong></div>
        </fieldset>
      </div>
    </section>
  `;
}
function desktopShellPanel() {
  return panel({
    title: "Desktop Shell",
    icon: "window",
    meta: "runtime",
    body: `
      ${miniWindow({
      title: "Floating Shell",
      body: `
          <p class="inline-note">Window runtime, focus, drag, resize, and status behavior.</p>
          <div class="button-row">${button("Open Sample Tool", { variant: "primary", id: "open-example" })}${button("New Blank Window", { id: "open-blank" })}</div>
        `,
      footer: `<span>document: loaded</span><span>injection: active</span><span>mode: bookmarklet</span><span>statusbar: on</span>`
    })}
    `
  });
}
function controlsPanel() {
  return panel({
    title: "Control Primitives",
    icon: "sliders",
    meta: "forms",
    body: `
      <div class="tab-sample"><button class="is-active">Buttons</button><button>Inputs</button><button>Selects</button><button>Checks</button><button>Sliders</button><button>Misc</button></div>
      <div class="button-row">${button("Primary", { variant: "primary" })}${button("Default")}${button("Ghost", { variant: "ghost" })}${button("Danger", { variant: "danger" })}${button("Disabled", { disabled: true })}${iconButton("Add", "selected")}${iconButton("Remove", "minimize")}</div>
      <div class="control-grid">
        <input class="os-input" value="text input" aria-label="Text input" />
        <select class="os-input" aria-label="Select option"><option>Select option</option></select>
        <textarea class="os-input" rows="4" aria-label="Textarea">text area content...</textarea>
        <div class="range-stack"><label><input type="range" value="60" /> <span>60%</span></label><progress value="72" max="100"></progress></div>
      </div>
      <div class="button-row checks"><label><input type="checkbox" checked /> Checkbox</label><label><input type="radio" checked name="demo-radio" /> Radio A</label><label><input type="radio" name="demo-radio" /> Radio B</label></div>
    `
  });
}
function fieldMatrixPanel() {
  return panel({
    title: "Field Matrix",
    icon: "table",
    meta: "fields",
    body: `
      <div class="field-matrix">
        ${field("Label - required", `<input class="os-input" value="value" />`, { required: true })}
        ${field("URL picker", `<select class="os-input"><option>https://example.com</option></select>`)}
        ${field("Date and time", `<input class="os-input" type="datetime-local" value="2026-04-25T17:30" />`)}
        ${field("Capture mode", `<select class="os-input"><option>Visible viewport</option><option>Full page</option></select>`)}
        ${field("Reminder offset", `<input class="os-input" type="number" value="60" />`, { error: "Offset must be between 1 and 1680." })}
        ${field("Filename prefix", `<input class="os-input" value="session_" />`, { help: "Letters, numbers, dash and underscore." })}
        ${field("Disabled setting", `<label><input type="checkbox" disabled /> This option is disabled.</label>`, { disabled: true })}
        ${field("Help text", `<input class="os-input" value="readable" />`, { help: "Help text explains the expected value." })}
      </div>
    `
  });
}
function feedbackMatrixPanel() {
  return panel({
    title: "Feedback Matrix",
    icon: "info",
    meta: "states",
    body: `
      <div class="state-stack">
        ${stateCard("info", "info", "Private note saved", "Your private note was saved successfully.", button("View note"))}
        ${stateCard("warning", "warning", "Draft restored", "We restored a local draft from 2m ago.", button("Review"))}
        ${stateCard("success", "success", "Export completed", "Blocks exported to markdown.", button("Open folder"))}
        ${stateCard("danger", "error", "Upload denied", "Permissions policy blocked the upload.", button("Retry"))}
        ${stateCard("neutral", "selected", "Browser blocked frame", "The frame refused to load content.", button("Open externally"))}
      </div>
    `
  });
}
function appShellExamplePanel() {
  return panel({
    title: "Application Shell Example",
    icon: "console",
    meta: "workflow",
    className: "span-8",
    body: `
      ${miniWindow({
      title: "Session Capture Console",
      body: `
          <div class="menu-strip"><span>Console</span><span>Actions</span><span>View</span><span>Help</span><button>Collect</button><button>Refresh</button><button>Clear</button></div>
          ${stateCard("warning", "warning", "Draft available", "A previous capture draft can be restored before starting a new run.", button("Review"))}
          <div class="three-grid">
            <div class="group-box"><strong>Target</strong><input class="os-input" value="https://example.org/articles/12345" /><small>Mode: constrained<br />Viewport: 1280 x 800<br />Injected: active</small></div>
            <div class="group-box"><strong>Quick actions</strong>${button("Capture visible", { icon: "capture" })}${button("Open preview", { icon: "eye" })}${button("Copy as markdown", { icon: "markdown" })}</div>
            <div class="group-box"><strong>Activity log</strong><small>10:12:45 Capture completed<br />10:12:40 Preview opened<br />10:12:35 Commands loaded</small></div>
          </div>
        `,
      footer: `<span>Memory <progress value="34" max="100"></progress> 34%</span><span>DOM nodes: 1,842</span><span>Events: 24</span><span>Idle</span>`
    })}
    `
  });
}
function browserStatePanel() {
  return panel({
    title: "Browser State Preview",
    icon: "url",
    meta: "context",
    className: "span-4",
    body: `
      <div class="browser-panel-preview">
        ${browserToolbar("https://example.com/research")}
        <div class="metric-register three">
          <div>${iconSvg("info")}<span>Selected text</span><strong>142 chars</strong></div>
          <div>${iconSvg("image")}<span>Images found</span><strong>8</strong></div>
          <div>${iconSvg("link")}<span>Links found</span><strong>12</strong></div>
        </div>
        ${stateCard("warning", "warning", "Frame refused to load", "The frame blocked access to this resource.", button("Retry") + button("Open externally"))}
        <div class="mini-status"><span>Status: partially available</span><span>Policy: restricted</span></div>
      </div>
    `
  });
}
function contextChromePanel() {
  return panel({
    title: "Segment Context Chrome",
    icon: "panel",
    meta: "context",
    className: "span-8",
    body: `
      <div class="context-demo-stack">
        <${TAGS.contextBar} data-context-demo="github" busy progress="68"></${TAGS.contextBar}>
        <${TAGS.contextBar} value="Power BI | Finance | Sales Dashboard | Updated 09:42 | Live"></${TAGS.contextBar}>
        <${TAGS.statusStrip} value="Review ready | 0 missing | Read-only | Saved 30s ago"></${TAGS.statusStrip}>
        <${TAGS.contextPanel} data-context-demo="panel"></${TAGS.contextPanel}>
      </div>
    `
  });
}
function overviewScreen() {
  return `
    <div class="screen-heading"><strong>Overview / Shell & Primitives</strong><span>Foundational shell, controls, fields, feedback, command preview, and browser state inventory.</span></div>
    <div class="screen-grid">
      ${desktopShellPanel()}
      ${controlsPanel()}
      ${fieldMatrixPanel()}
      ${feedbackMatrixPanel()}
      ${contextChromePanel()}
      ${appShellExamplePanel()}
      ${browserStatePanel()}
    </div>
  `;
}
function primitivesScreen() {
  return `
    <div class="screen-heading"><strong>Primitives</strong><span>Strict control scale, field alignment, semantic feedback, state cues, and reusable pictogram assets.</span></div>
    <div class="screen-grid">
      ${desktopShellPanel()}
      ${controlsPanel()}
      ${fieldMatrixPanel()}
      ${feedbackMatrixPanel()}
      ${contextChromePanel()}
      ${panel({
    title: "Command Palette Preview",
    icon: "console",
    className: "span-6",
    body: commandList(baseCommands().slice(0, 5))
  })}
      ${panel({
    title: "Icon Grammar",
    icon: "grid",
    className: "span-6",
    body: `<div class="icon-preview-grid">${ICON_NAMES.slice(0, 30).map((name) => `<span title="${name}">${iconSvg(name)}<small>${name}</small></span>`).join("")}</div>`
  })}
    </div>
  `;
}
function appPatternsScreen() {
  const commands = baseCommands();
  return `
    <div class="screen-heading"><strong>Application Patterns</strong><span>Composed patterns that solve common workflows in constrained environments.</span></div>
    <div class="screen-grid">
      ${appShellExamplePanel()}
      ${panel({
    title: "Rows & Cards",
    icon: "list",
    meta: "results",
    className: "span-8",
    body: `
          <div class="results-toolbar"><input class="os-input" placeholder="Search results..." /><button>Filter</button><button>Sort: Newest</button>${iconButton("List view", "list", { pressed: true })}${iconButton("Grid view", "grid")}</div>
          <div class="result-grid">${["Article Header", "Author Block", "Published Date", "Hero Image", "Summary Section", "Related Links"].map((title, index) => `
            <article class="result-card"><label><input type="checkbox" ${index === 0 ? "checked" : ""}/> <strong>${title}</strong></label><small>Selector: ${index === 0 ? "h1:title" : ".capture-item"}<br />Text nodes: ${index + 1}</small><span class="ok-dot"></span> Captured · 10:1${index} AM</article>
          `).join("")}</div>
          <div class="pager"><span>Showing 1-6 of 34</span><button>|&lt;</button><button>&lt;</button><button class="is-active">1</button><button>2</button><button>3</button><button>&gt;</button><button>&gt;|</button></div>
        `
  })}
      ${panel({ title: "Command Palette Preview", icon: "console", className: "span-4", body: commandList(commands.slice(0, 5)) })}
      ${panel({
    title: "Preview Pane",
    icon: "eye",
    className: "span-4",
    body: `
          <div class="document-surface compact">
            <div class="tab-sample"><button class="is-active">Preview</button><button>HTML</button><button>Text</button><button>Markdown</button></div>
            <article><h3>Understanding Constrained Environments</h3><p>Constrained bookmarklet tools run inside the page, not the page. Design for resilience, minimal footprint, and graceful fallbacks.</p><div class="image-placeholder"></div></article>
            <div class="mini-status"><span>Viewport: 1280x800</span><span>Zoom: 100%</span><span>Theme: Auto</span></div>
          </div>
        `
  })}
      ${panel({ title: "Metrics & Status Compact", icon: "metrics", className: "span-4", body: metricRegister([
    { label: "Captures", value: "24", detail: "+6 this hour" },
    { label: "Preview opens", value: "18", detail: "+4 this hour" },
    { label: "Commands run", value: "31", detail: "+9 this hour" },
    { label: "Errors", value: "0", detail: "No change" },
    { label: "Uptime", value: "2h 14m", detail: "Session time" }
  ]) })}
      ${panel({
    title: "Feedback Matrix Inline",
    icon: "info",
    className: "span-8",
    body: `<div class="inline-states">${stateCard("info", "info", "Private note saved", "Saved successfully.")}${stateCard("success", "success", "Export completed", "Markdown exported.")}${stateCard("warning", "warning", "Browser blocked frame", "Retry opened externally.")}${stateCard("danger", "error", "Upload denied", "Policy blocked upload.")}</div>`
  })}
    </div>
  `;
}
function contentStatesScreen() {
  return `
    <div class="screen-grid">
      ${panel({
    title: "Browser Panel Preview",
    icon: "url",
    className: "span-6",
    body: `
          ${browserToolbar("https://example.com/research/market-trends")}
          <div class="metric-register three"><div>${iconSvg("info")}<span>Selected text</span><strong>218 chars</strong></div><div>${iconSvg("image")}<span>Images found</span><strong>14</strong></div><div>${iconSvg("link")}<span>Links found</span><strong>9</strong></div></div>
          ${stateCard("success", "success", "Capture completed", "Blocks exported to markdown.", button("Open folder"))}
          ${stateCard("warning", "warning", "Draft restored", "We restored your draft from 2m ago.", button("Review draft"))}
        `
  })}
      ${panel({
    title: "Content State Matrix",
    icon: "table",
    className: "span-6",
    actions: button("Legend"),
    body: `
          <table class="state-table">
            <thead><tr><th>State</th><th>Preview panel</th><th>Document surface</th><th>Browser panel</th></tr></thead>
            <tbody>
              ${stateRow("Success", "success", ["Content captured", "Research Notes", "Capture completed"])}
              ${stateRow("Warning", "warning", ["Partial capture", "Missing elements", "Draft restored"])}
              ${stateRow("Error", "danger", ["Capture failed", "Unable to load", "Upload failed"])}
              ${stateRow("Neutral", "neutral", ["No selection", "No content yet", "Idle"])}
              ${stateRow("Blocked", "blocked", ["Preview blocked", "Access blocked", "Browser blocked frame"])}
            </tbody>
          </table>
        `
  })}
      ${panel({
    title: "Preview / Document Surface",
    icon: "article",
    className: "span-6",
    body: `
          <div class="document-surface">
            <div class="editor-toolbar"><select><option>Markdown</option></select><button>B</button><button>I</button><button>H1</button><button>H2</button><button>•</button><button>Preview</button><button>Split</button></div>
            <div class="split-doc"><section><h3># Market Research Notes</h3><p>This document captures key findings from the current session.</p><ul><li>Customer segments and behaviors</li><li>Competitive landscape</li><li>Opportunities and risks</li></ul></section><section><h3>Market Research Notes</h3><p>This document captures key findings from the current session.</p><ul><li>Customer segments and behaviors</li><li>Competitive landscape</li><li>Opportunities and risks</li></ul></section></div>
            <div class="mini-status"><span>Words: 132</span><span>Chars: 871</span><span>All changes saved</span></div>
          </div>
        `
  })}
      ${panel({
    title: "Fallback Copy & Manual Path",
    icon: "copy",
    className: "span-6",
    actions: button("Options"),
    body: `
          ${stateCard("info", "info", "Automatic capture is not available", "Use manual copy or export your own content.")}
          <div class="manual-grid"><div class="group-box"><strong>Manual copy steps</strong><ol><li>Select the content in the page.</li><li>Copy it to your clipboard (${keycap("Ctrl+C")}).</li><li>Paste into the document editor.</li><li>Add notes and export.</li></ol>${button("Open editor")}</div><div class="group-box"><strong>Helpful shortcuts</strong><dl><dt>Copy</dt><dd>Ctrl+C</dd><dt>Paste</dt><dd>Ctrl+V</dd><dt>Open editor</dt><dd>Ctrl+E</dd><dt>Export markdown</dt><dd>Ctrl+M</dd></dl></div></div>
        `
  })}
      ${panel({ title: "Empty States", icon: "noResults", className: "span-4", body: `<div class="empty-grid">${emptyState("noCaptures", "No captures yet", "Start by capturing content from the browser.", "Capture now")}${emptyState("noResults", "No results found", "Try adjusting your search or filters.", "Clear filters")}${emptyState("folder", "Folder is empty", "Exports will appear here after capture.", "Open folder")}</div>` })}
      ${panel({ title: "Blocked Preview States", icon: "blocked", className: "span-4", body: `<div class="empty-grid blocked">${emptyState("browserBlocked", "Frame refused to load", "The frame blocked access to this content.", "Open externally")}${emptyState("accessBlocked", "Preview blocked", "Your policy prevents previewing this content.", "Learn more")}${emptyState("frameBlocked", "Cross-origin blocked", "This content can't be previewed here.", "Try manual copy")}</div>` })}
      ${panel({ title: "Feedback / Status Surfaces", icon: "info", className: "span-4", body: `<div class="state-stack">${stateCard("success", "success", "Export completed", "34 blocks exported successfully.", button("Open folder"))}${stateCard("warning", "warning", "Sync delayed", "We'll retry in the background.", button("Details"))}${stateCard("danger", "error", "Upload denied", "Permissions policy blocked upload.", button("Retry"))}${stateCard("neutral", "neutral", "Idle", "System is ready.", `<span class="ok-led"></span>`)}</div>` })}
    </div>
  `;
}
function stateRow(label, tone, values) {
  const icon = tone === "blocked" ? "blocked" : tone === "danger" ? "error" : tone === "neutral" ? "neutral" : tone;
  return `<tr><th>${iconSvg(icon)} ${label}</th>${values.map((value) => `<td><span class="matrix-cell matrix-cell--${tone}"><strong>${value}</strong><small>${tone === "blocked" ? "Structured fallback." : "State cue and message."}</small></span></td>`).join("")}</tr>`;
}
function emptyState(icon, title, copy, action) {
  return `<article class="empty-state">${iconSvg(icon)}<strong>${title}</strong><small>${copy}</small>${button(action)}</article>`;
}
function commandSurfacesScreen() {
  return `
    <div class="screen-grid">
      ${panel({ title: "Command Palette Preview", icon: "console", className: "span-6", body: commandList(baseCommands()) })}
      ${panel({ title: "URL Picker / Suggestions", icon: "url", className: "span-3", body: urlPicker() })}
      ${panel({
    title: "Keyboard Shortcuts",
    icon: "table",
    className: "span-3",
    body: `<dl class="shortcut-list">${[
      ["Ctrl + K", "Open command palette"],
      ["Ctrl + Shift + C", "Capture visible content"],
      ["Ctrl + Alt + O", "Open capture console"],
      ["Ctrl + Shift + P", "Toggle preview pane"],
      ["Ctrl + C", "Copy selected text"],
      ["Ctrl + E", "Export as markdown"],
      ["Ctrl + F", "Search in page"],
      ["Ctrl + ,", "Open settings"],
      ["Esc", "Close overlays"],
      ["Enter", "Confirm / Execute"]
    ].map(([keys, desc]) => `<div><dt>${keys.split(" + ").map(keycap).join("<span>+</span>")}</dt><dd>${desc}</dd></div>`).join("")}</dl>`
  })}
      ${panel({
    title: "Browser Action Surface",
    icon: "capture",
    className: "span-7",
    body: `${browserToolbar()}<div class="action-grid">${button("Capture", { icon: "capture" })}${button("Preview", { icon: "eye" })}${button("Console", { icon: "console" })}${button("Export", { icon: "upload" })}${button("More", { icon: "more" })}</div><div class="inline-states">${stateCard("success", "success", "Capture completed", "Blocks exported to markdown.")}${stateCard("warning", "warning", "Python not detected", "Some features will be limited.", button("Open console"))}</div>`
  })}
      ${panel({
    title: "Compact Shell Preview",
    icon: "window",
    className: "span-5",
    body: miniWindow({
      title: "Mini Capture Shell",
      body: `<div class="shell-register"><span>doc: loaded</span><span>injection: active</span><span>mode: bookmarklet</span><span>statusbar: on</span><span>items: 34</span><span>last sync: 1m ago</span></div><div class="button-row">${button("Capture")}${button("Preview")}${button("Export")}${button("Settings")}</div>`
    })
  })}
      ${panel({ title: "Feedback & Action Strip", icon: "info", className: "span-12", body: `<div class="action-strip">${stateCard("success", "success", "Success", "Operation completed.")}${stateCard("info", "info", "Info", "This is an informational note.")}${stateCard("warning", "warning", "Warn", "This action may have limits.")}${stateCard("danger", "error", "Error", "Something prevented this.")}<span class="strip-buttons">${button("Open dialog", { variant: "primary", id: "open-demo-dialog" })}${button("Toast", { id: "toast-success" })}${button("Warn", { id: "toast-warning" })}${button("Export")}${button("...", { aria: "More actions" })}</span></div>` })}
    </div>
  `;
}
function themeDemoScreen() {
  return `
    <div class="screen-heading"><strong>Theming</strong><span>Window-scoped recipes using public tokens for accent, density, radius, and contrast.</span></div>
    <div class="screen-grid">
      ${panel({
    title: "Theme Recipes",
    icon: "gear",
    className: "span-12",
    body: `
          <div class="action-grid">
            ${button("Open Default", { id: "theme-default" })}
            ${button("Open Accent", { variant: "primary", id: "theme-accent" })}
            ${button("Open Compact", { id: "theme-compact" })}
            ${button("Open Rounded", { id: "theme-rounded" })}
            ${button("Open High Contrast", { variant: "danger", id: "theme-highContrast" })}
          </div>
          <div class="inline-states">
            ${stateCard("info", "info", "Root themes", "Use setTheme(theme) when every tool in a suite should share one look.")}
            ${stateCard("success", "success", "Window themes", "Use mountWindow(win, { theme }) for independent tools on one desktop root.")}
            ${stateCard("warning", "warning", "Escape hatch", "::part is available for rare local overrides after tokens solve the common case.")}
          </div>
        `
  })}
      ${panel({
    title: "Recipe Tokens",
    icon: "table",
    className: "span-6",
    body: `
          <table class="state-table">
            <thead><tr><th>Recipe</th><th>Primary tokens</th></tr></thead>
            <tbody>
              <tr><th>Accent</th><td><span class="matrix-cell matrix-cell--success"><strong>selectionBg, focusRing, windowBg</strong><small>Tool identity without changing layout.</small></span></td></tr>
              <tr><th>Compact</th><td><span class="matrix-cell matrix-cell--info"><strong>space*, controlHeight, menuItemHeight</strong><small>Denser operation surfaces.</small></span></td></tr>
              <tr><th>Rounded</th><td><span class="matrix-cell matrix-cell--neutral"><strong>radiusControl, radiusSurface, radiusWindow</strong><small>Softer shape while preserving structure.</small></span></td></tr>
              <tr><th>High contrast</th><td><span class="matrix-cell matrix-cell--warning"><strong>border*, focusRingWidth, state colors</strong><small>Stronger visibility and keyboard focus.</small></span></td></tr>
            </tbody>
          </table>
        `
  })}
      ${panel({
    title: "Scoped Theme Behavior",
    icon: "window",
    className: "span-6",
    body: miniWindow({
      title: "Two tools / one root",
      body: `<div class="shell-register"><span>root: shared</span><span>tool A: accent</span><span>tool B: compact</span><span>menus: copied context</span></div><p class="inline-note">Each themed window receives CSS variables on the window host before it is appended to the desktop root.</p>`,
      footer: `<span>No root repaint</span><span>Portal context copied</span>`
    })
  })}
    </div>
  `;
}
function migrationProofScreen() {
  const cards = [
    ["Rich Text to Markdown", "Local editor chrome, preview tabs, markdown export, and manual copy fallback.", ["app shell", "preview", "manual copy"]],
    ["Page Screenshot", "Capture form with browser preview, export states, and retry paths.", ["browser panel", "state"]],
    ["Form Context Select", "Selectable content rows and saved-session dialog.", ["rows", "dialog"]],
    ["Session Snapshot", "Capture dashboard with warnings and ZIP export.", ["register", "progress"]],
    ["Notifications", "Reminder forms, disabled policy states, and grouped results.", ["field", "alert"]],
    ["Mini/Multi Browser", "Address bar, tile commands, iframe fallback, and shortcuts.", ["url picker", "commands"]],
    ["Bookmarklet", "Injection active status, mode register, and compact shell controls.", ["shell", "status"]],
    ["Browser Panel", "Policy, cross-origin, and open-external states.", ["browser", "blocked"]],
    ["Command Palette", "Keyboard-first command discovery with keycaps and selected rows.", ["commands", "keys"]],
    ["Fallback Copy", "Manual path as resilient workflow, not panic state.", ["fallback", "copy"]],
    ["Metrics", "Status-register counters replacing generic KPI cards.", ["register", "metrics"]]
  ];
  return `
    <div class="screen-grid">
      ${panel({
    title: "Mini Browser Composition",
    icon: "url",
    className: "span-6",
    body: `
          <div class="mini-browser-composition">
            ${browserToolbar("https://example.com/research")}
            <div class="loaded-page">
              <main><h3>Research workspace</h3><p>Mock loaded page with selected article regions and page-action feedback.</p><section class="selected-region"><strong>Selected article</strong><p>Lead paragraph, comparison table, and code snippet are ready for capture.</p></section><div class="data-table"><span>Heading</span><span>Captured</span><span>Quote</span><span>Review</span><span>Image</span><span>Skipped</span></div></main>
              <aside><strong>Page actions</strong>${button("Copy markdown", { icon: "markdown" })}${button("Open externally", { icon: "external" })}${button("Retry blocked frame", { icon: "retry" })}</aside>
            </div>
            <div class="mini-status"><span>Loaded example.com/research</span><span>Selected blocks: 4</span><span>Policy: limited</span></div>
          </div>
        `
  })}
      ${panel({
    title: "Migration Cards",
    icon: "panel",
    className: "span-6",
    body: `<div class="migration-grid">${cards.map(([title, copy, tags]) => `<article class="migration-card"><h3>${title}</h3><p>${copy}</p><div>${tags.map((tag) => `<span>${tag}</span>`).join("")}</div></article>`).join("")}</div>`
  })}
      ${panel({
    title: "Icon System Preview",
    icon: "grid",
    className: "span-12",
    body: `<div class="icon-preview-grid">${ICON_NAMES.map((name) => `<span title="${name}">${iconSvg(name)}<small>${name}</small></span>`).join("")}</div>`
  })}
    </div>
  `;
}
function baseCommands() {
  return [
    { icon: "capture", title: "Capture visible content", desc: "Capture the currently visible portion of the page", keys: ["Ctrl", "Shift", "C"] },
    { icon: "console", title: "Open capture console", desc: "Open the session capture console", keys: ["Ctrl", "Alt", "O"] },
    { icon: "eye", title: "Toggle preview pane", desc: "Show or hide the preview panel", keys: ["Ctrl", "Shift", "P"] },
    { icon: "copy", title: "Copy selected text", desc: "Copy text from selection to clipboard", keys: ["Ctrl", "C"] },
    { icon: "markdown", title: "Export as markdown", desc: "Export captured content as markdown", keys: ["Ctrl", "E"] },
    { icon: "search", title: "Search in page", desc: "Find text within the current page", keys: ["Ctrl", "F"] },
    { icon: "gear", title: "Open settings", desc: "Open bookmarklet settings", keys: ["Ctrl", ","] }
  ];
}
function buildPage() {
  const page = document.createElement("main");
  page.className = "catalog-app";
  page.innerHTML = `
    <section class="app-frame" aria-label="AWW Bookmarklet component catalog">
      <header class="app-titlebar">
        <div class="title-identity">${iconSvg("logo")}<span>Component Catalog for Constrained Bookmarklet Tools</span></div>
        <div class="build-meta"><span>Build 0.9.0</span><span>RetroOS 3.11</span></div>
        <div class="window-controls" aria-hidden="true"><i></i><i></i><i></i></div>
      </header>
      <nav class="menu-row" aria-label="Application menu"><button>File</button><button>Edit</button><button>View</button><button>Tools</button><button>Window</button><button>Help</button></nav>
      ${systemOverview()}
      <div class="catalog-tabs" role="tablist" aria-label="Catalog sections">
        ${[
    ["overview", "Overview"],
    ["primitives", "Primitives"],
    ["patterns", "App Patterns"],
    ["states", "Content States"],
    ["commands", "Command Surfaces"],
    ["themes", "Theming"],
    ["migration", "Migration Proof"]
  ].map(([id, label], index) => `<button id="tab-${id}" role="tab" aria-controls="panel-${id}" aria-selected="${index === 0 ? "true" : "false"}" tabindex="${index === 0 ? "0" : "-1"}" data-tab="${id}">${label}</button>`).join("")}
      </div>
      <section class="tab-panels">
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" data-panel="overview">${overviewScreen()}</div>
        <div id="panel-primitives" role="tabpanel" aria-labelledby="tab-primitives" data-panel="primitives" hidden>${primitivesScreen()}</div>
        <div id="panel-patterns" role="tabpanel" aria-labelledby="tab-patterns" data-panel="patterns" hidden>${appPatternsScreen()}</div>
        <div id="panel-states" role="tabpanel" aria-labelledby="tab-states" data-panel="states" hidden>${contentStatesScreen()}</div>
        <div id="panel-commands" role="tabpanel" aria-labelledby="tab-commands" data-panel="commands" hidden>${commandSurfacesScreen()}</div>
        <div id="panel-themes" role="tabpanel" aria-labelledby="tab-themes" data-panel="themes" hidden>${themeDemoScreen()}</div>
        <div id="panel-migration" role="tabpanel" aria-labelledby="tab-migration" data-panel="migration" hidden>${migrationProofScreen()}</div>
      </section>
      <footer class="bottom-status"><span>Ready</span><span>RetroOS 3.11</span><span>CAPS</span><span>NUM</span><span>SCRL</span></footer>
    </section>
    <${TAGS.dialog} id="demo-dialog" modal label="Demo dialog" close-on-backdrop>
      <span slot="title">System dialog</span>
      <p class="inline-note">The dialog uses the shared overlay path and inherits the retro system tokens.</p>
      <${TAGS.toolbar} slot="footer" align="end"><${TAGS.button} id="demo-dialog-close">Close</${TAGS.button}></${TAGS.toolbar}>
    </${TAGS.dialog}>
  `;
  return page;
}
function selectTab(root, id, focus = false) {
  const tabs = [...root.querySelectorAll("[role='tab'][data-tab]")];
  const panels = [...root.querySelectorAll("[role='tabpanel'][data-panel]")];
  tabs.forEach((tab) => {
    const selected = tab.dataset.tab === id;
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus)
      tab.focus();
  });
  panels.forEach((panelNode) => {
    panelNode.hidden = panelNode.dataset.panel !== id;
  });
}
function wireInteractions(root) {
  const githubSegments = [
    { key: "app", value: "GitHub", kind: "app" },
    { key: "pr", label: "PR", value: "#1824", copyValue: "1824", copyable: true, kind: "id" },
    { key: "branch", label: "Branch", value: "feature/context-bar", copyValue: "feature/context-bar", copyable: true, kind: "branch" },
    { key: "ci", value: "CI passing", tone: "success", kind: "status" },
    { key: "reviews", value: "2 approvals", tone: "info", kind: "status" }
  ];
  root.querySelectorAll('[data-context-demo="github"]').forEach((node) => {
    node.segments = githubSegments;
  });
  root.querySelectorAll('[data-context-demo="panel"]').forEach((node) => {
    node.segments = [
      { key: "customer", label: "Customer", value: "Acme Corporation", copyValue: "Acme Corporation", copyable: true },
      { key: "tenant", label: "Tenant", value: "918273", copyValue: "918273", copyable: true },
      { key: "environment", label: "Environment", value: "Production", tone: "warning" },
      { key: "saved", label: "Saved", value: "11:42", tone: "success" }
    ];
  });
  root.addEventListener("awwbookmarklet-segment-copy", (event) => {
    showToast({ key: "segment-copy", message: `Copy requested: ${event.detail.copyValue}`, tone: "info", timeout: 1800 });
  });
  root.querySelector("#hero-example")?.addEventListener("click", openExample);
  root.querySelector("#hero-blank")?.addEventListener("click", openBlank);
  root.querySelectorAll("#open-example").forEach((node) => node.addEventListener("click", openExample));
  root.querySelectorAll("#open-blank").forEach((node) => node.addEventListener("click", openBlank));
  root.addEventListener("click", (event) => {
    const tab = event.target.closest("[role='tab'][data-tab]");
    if (tab)
      selectTab(root, tab.dataset.tab, true);
    if (event.target.closest("#toast-success"))
      showToast({ key: "demo-toast", message: "Operation completed", tone: "success", timeout: 1800 });
    if (event.target.closest("#toast-warning"))
      showToast({ key: "demo-toast", message: "Manual fallback may be required", tone: "warning", timeout: 2200 });
    for (const name of Object.keys(THEME_RECIPES)) {
      if (event.target.closest(`#theme-${name}`))
        openThemeDemo(name);
    }
    if (event.target.closest("#open-demo-dialog"))
      root.querySelector("#demo-dialog")?.show();
    if (event.target.closest("#demo-dialog-close"))
      root.querySelector("#demo-dialog")?.close("demo");
  });
  root.querySelector(".catalog-tabs")?.addEventListener("keydown", (event) => {
    const tabs = [...root.querySelectorAll("[role='tab'][data-tab]")];
    const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    let next = current;
    if (event.key === "ArrowRight")
      next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home")
      next = 0;
    else if (event.key === "End")
      next = tabs.length - 1;
    else
      return;
    event.preventDefault();
    selectTab(root, tabs[next].dataset.tab, true);
  });
}
function initCatalog() {
  const root = document.getElementById("catalog-root") || document.body;
  const page = buildPage();
  root.append(page);
  wireInteractions(root);
}
initCatalog();
window.addEventListener("beforeunload", () => {
  releaseDesktopRoot(CATALOG_OWNER);
});
