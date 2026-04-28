// ui-framework/dist/bookmarklet/index.js
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
var FORM_ARIA_ATTRIBUTES = ["aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"];
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
var serial = 0;
function nextOwner(prefix = "bookmarklet-tool") {
  serial += 1;
  return `${prefix}-${serial}`;
}
function defineBookmarkletComponent(tagName, ctor) {
  if (!String(tagName || "").startsWith("awwbookmarklet-")) {
    throw new Error("Custom bookmarklet component tags must use the awwbookmarklet- prefix.");
  }
  defineOnce(tagName, ctor);
  return customElements.get(tagName);
}
function createWindow({ title = "AWW Tool", rect = null, closable = true, content = null } = {}) {
  registerAllComponents();
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", title);
  if (closable === false)
    win.setAttribute("closable", "false");
  if (rect)
    win.setRect(rect);
  if (content) {
    if (typeof content === "string")
      win.innerHTML = sanitizeHtml(content);
    else
      win.append(content);
  }
  return win;
}
function openBookmarkletWindow(builder, { ownerPrefix = "bookmarklet-tool", rect = null, theme = null } = {}) {
  registerAllComponents();
  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);
  const win = typeof builder === "function" ? builder() : buildExampleToolWindow();
  if (theme)
    applyThemePatch(win, theme);
  if (rect)
    win.setRect(rect);
  record.root.append(win);
  let released = false;
  const release = () => {
    if (released)
      return;
    released = true;
    releaseDesktopRoot(owner);
  };
  win.addEventListener("awwbookmarklet-window-closed", release, { once: true });
  win.addEventListener("awwbookmarklet-window-disconnected", release, { once: true });
  win.addEventListener("awwbookmarklet-window-close-request", () => {
    queueMicrotask(() => {
      if (!win.isConnected)
        release();
    });
  });
  return win;
}
function mountWindow(win, { ownerPrefix = "bookmarklet-tool", rect = null, theme = null } = {}) {
  registerAllComponents();
  if (theme)
    applyThemePatch(win, theme);
  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);
  if (rect && typeof win.setRect === "function")
    win.setRect(rect);
  record.root.append(win);
  let released = false;
  const release = () => {
    if (released)
      return;
    released = true;
    releaseDesktopRoot(owner);
  };
  win.addEventListener("awwbookmarklet-window-closed", release, { once: true });
  win.addEventListener("awwbookmarklet-window-disconnected", release, { once: true });
  return win;
}
function bootstrapExampleTool() {
  return openBookmarkletWindow(() => buildExampleToolWindow({ title: "Page Extraction Tool" }), {
    ownerPrefix: "example-tool"
  });
}
function setTheme(themePatch, target = null) {
  if (target) {
    applyThemePatch(target, themePatch || {});
    return { ...defaultThemeService.tokens, ...themePatch || {} };
  }
  const tokens = defaultThemeService.setTheme(themePatch || {});
  const themeTarget = target || getDesktopRecord(FRAMEWORK_VERSION)?.root;
  if (themeTarget)
    defaultThemeService.applyTheme(themeTarget);
  return tokens;
}
function shutdownAll() {
  emergencyTeardown("*");
}
registerAllComponents();
globalThis.awwtools = globalThis.awwtools || {};
globalThis.awwtools.bookmarkletUi = {
  version: FRAMEWORK_VERSION,
  tags: TAGS,
  tokens: PUBLIC_TOKENS,
  geometry: DEFAULT_GEOMETRY,
  registerAllComponents,
  defineComponent: defineBookmarkletComponent,
  createWindow,
  openWindow: openBookmarkletWindow,
  mountWindow,
  bootstrapExampleTool,
  shutdownAll,
  acquireDesktopRoot,
  releaseDesktopRoot,
  getDesktopRecord,
  setTheme,
  themeService: defaultThemeService,
  ThemeService,
  applyThemePatch,
  copyPublicThemeContext,
  createTheme,
  CommandRegistry,
  contextSegments: {
    parse: parseContextSegments,
    normalize: normalizeContextSegments,
    normalizeOne: normalizeContextSegment,
    equal: segmentsEqual,
    copyValue: getSegmentCopyValue
  },
  styles: {
    adoptStyles,
    base: BASE_COMPONENT_STYLES,
    css
  },
  url: {
    buildSearchUrl,
    deriveHostname,
    isHttpUrl,
    normalizeSearchTemplate,
    resolveNavigationInput
  },
  sanitizeHtml,
  copyToClipboard,
  showToast
};
globalThis.awwbookmarklet = globalThis.awwtools.bookmarkletUi;

// src/constants.js
var DB_NAME = "TopicResearchNotepadDB";
var DB_VERSION = 1;
var APP_DATA_FORMAT_VERSION = 1;
var EXPORT_FORMAT_VERSION = 1;
var WORKER_PROTOCOL_VERSION = 1;
var AUTOSAVE_DELAY_MS = 550;
var BLOCK_TYPES = Object.freeze({
  paragraph: "paragraph",
  heading: "heading",
  quote: "quote",
  list: "list",
  table: "table",
  code: "code",
  sourceLink: "sourceLink"
});

// src/observability/logger.js
var loggingLevels = Object.freeze(["error", "warn", "info", "debug"]);
var loggingFormatterNames = Object.freeze(["plain", "segments"]);
var loggingStorageKey = "topicResearchNotepad.loggingSettings";
var levelWeight = { error: 0, warn: 1, info: 2, debug: 3 };
var levelColor = { error: "#b42318", warn: "#b54708", info: "#175cd3", debug: "#475467" };
var defaultLoggingSettings = Object.freeze({
  level: "debug",
  formatter: "segments",
  useLabelBackgrounds: true
});
var currentSettings = readSettings();
var listeners = new Set;
function createLogger(category, defaultSubcategory = "") {
  const emit = (level, message, options = {}) => {
    renderLog({
      level,
      category,
      subcategory: options.subcategory ?? defaultSubcategory,
      message,
      context: options.context ?? {},
      timestamp: new Date().toISOString()
    });
  };
  return {
    error: (message, options) => emit("error", message, options),
    warn: (message, options) => emit("warn", message, options),
    info: (message, options) => emit("info", message, options),
    debug: (message, options) => emit("debug", message, options),
    withSubcategory: (subcategory) => createLogger(category, subcategory)
  };
}
function getLoggingSettings() {
  return { ...currentSettings };
}
function setLoggingSettings(next) {
  currentSettings = normalizeSettings(next);
  persistSettings(currentSettings);
  listeners.forEach((listener) => listener(getLoggingSettings()));
  return getLoggingSettings();
}
function updateLoggingSettings(patch) {
  return setLoggingSettings({ ...currentSettings, ...patch });
}
function installDebugHook(extra = {}) {
  if (typeof window === "undefined")
    return;
  window.trnDebug = {
    ...window.trnDebug || {},
    getLoggingSettings,
    setLoggingSettings,
    updateLoggingSettings,
    ...extra
  };
}
function compactJson(value) {
  const seen = new WeakSet;
  try {
    return JSON.stringify(value, (_key, raw) => {
      if (typeof raw === "bigint")
        return raw.toString();
      if (raw instanceof Error)
        return normalizeError(raw);
      if (typeof raw === "string")
        return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
      if (Array.isArray(raw))
        return raw.length <= 20 ? raw : [...raw.slice(0, 20), `...(${raw.length - 20} more)`];
      if (raw && typeof raw === "object") {
        if (seen.has(raw))
          return "[Circular]";
        seen.add(raw);
        const entries = Object.entries(raw);
        if (entries.length <= 20)
          return raw;
        return Object.fromEntries([...entries.slice(0, 20), ["__moreKeys", entries.length - 20]]);
      }
      return raw;
    });
  } catch {
    return '{"context":"unserializable"}';
  }
}
function normalizeError(error) {
  return {
    name: error?.name || "Error",
    message: error?.message || String(error),
    code: error?.code,
    stack: error?.stack ? String(error.stack).split(`
`).slice(0, 6).join(" | ") : ""
  };
}
function renderLog(event) {
  const settings = currentSettings;
  if (!shouldRender(event.level, settings.level))
    return;
  const rendered = settings.formatter === "plain" ? formatPlain(event) : formatSegments(event, settings);
  console[event.level === "error" ? "error" : event.level === "warn" ? "warn" : "log"](...rendered);
}
function shouldRender(level, threshold) {
  return levelWeight[level] <= levelWeight[threshold];
}
function formatPlain(event) {
  const scope = [event.category, event.subcategory].filter(Boolean).join("/");
  return [`[TRN] ${event.level.toUpperCase()} ${scope} ${event.message} ${compactJson(event.context)} ${event.timestamp}`];
}
function formatSegments(event, settings) {
  const scope = [event.category, event.subcategory].filter(Boolean).join("/");
  return [
    "%c▣ TRN %c %s %c %s %c %s %c %s %c %s",
    segmentStyle("#315f99", settings.useLabelBackgrounds),
    segmentStyle(levelColor[event.level], settings.useLabelBackgrounds),
    event.level.toUpperCase(),
    segmentStyle("#0f766e", settings.useLabelBackgrounds),
    scope,
    "color:#121820;font-weight:700",
    event.message,
    "color:#344054",
    compactJson(event.context),
    "color:#667085",
    event.timestamp
  ];
}
function segmentStyle(color, withBackground) {
  return withBackground ? `background:${color};color:#fff;border-radius:2px;padding:1px 4px;font-weight:700` : `color:${color};font-weight:700`;
}
function readSettings() {
  const storage = getStorage();
  if (!storage)
    return { ...defaultLoggingSettings };
  try {
    return normalizeSettings(JSON.parse(storage.getItem(loggingStorageKey) || "{}"));
  } catch {
    return { ...defaultLoggingSettings };
  }
}
function persistSettings(settings) {
  const storage = getStorage();
  if (!storage)
    return;
  try {
    storage.setItem(loggingStorageKey, JSON.stringify(settings));
  } catch {}
}
function getStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
function normalizeSettings(value = {}) {
  return {
    level: loggingLevels.includes(value.level) ? value.level : defaultLoggingSettings.level,
    formatter: loggingFormatterNames.includes(value.formatter) ? value.formatter : defaultLoggingSettings.formatter,
    useLabelBackgrounds: typeof value.useLabelBackgrounds === "boolean" ? value.useLabelBackgrounds : defaultLoggingSettings.useLabelBackgrounds
  };
}

// src/storage-client.js
var logger = createLogger("StorageClient");
var autosaveLogger = logger.withSubcategory("Autosave");
var workerLogger = logger.withSubcategory("WorkerBridge");

class StorageClient extends EventTarget {
  constructor({ workerUrl = new URL("./storage-worker.js", import.meta.url) } = {}) {
    super();
    this.worker = new Worker(workerUrl, { type: "classic" });
    workerLogger.info("Storage worker created", { context: { workerUrl: String(workerUrl), workerType: "classic" } });
    this.nextId = 1;
    this.pending = new Map;
    this.debounced = new Map;
    this.requestStartedAt = new Map;
    this.worker.addEventListener("message", (event) => this.handleMessage(event.data));
    this.worker.addEventListener("error", (event) => {
      workerLogger.error("Storage worker error", { context: { message: event.message, filename: event.filename, lineno: event.lineno } });
      this.emitStatus("failed", event.message || "Storage worker failed");
    });
  }
  async hello() {
    workerLogger.info("Starting worker protocol handshake", { context: { protocolVersion: WORKER_PROTOCOL_VERSION } });
    return this.request("hello", { protocolVersion: WORKER_PROTOCOL_VERSION });
  }
  request(type, payload = {}) {
    const requestId = `req_${this.nextId++}`;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
    });
    this.requestStartedAt.set(requestId, performance.now());
    workerLogger.debug("Sending worker request", { context: { requestId, type, payload: summarizePayload(payload) } });
    this.worker.postMessage({ requestId, type, protocolVersion: WORKER_PROTOCOL_VERSION, payload });
    return promise;
  }
  saveBlockDebounced(block, delay = AUTOSAVE_DELAY_MS) {
    return this.schedule(`block:${block.id}`, () => this.request("updateBlock", { block }), delay);
  }
  savePageDebounced(page, delay = AUTOSAVE_DELAY_MS) {
    return this.schedule(`page:${page.id}`, () => this.request("updatePage", { page }), delay);
  }
  schedule(key, operation, delay) {
    autosaveLogger.debug("Scheduling debounced save", { context: { key, delayMs: delay, replacingExisting: this.debounced.has(key) } });
    this.emitStatus("dirty", "Unsaved local changes");
    const previous = this.debounced.get(key);
    if (previous)
      clearTimeout(previous.timer);
    let resolvePromise;
    let rejectPromise;
    const promise = previous?.promise || new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    const timer = setTimeout(async () => {
      this.debounced.delete(key);
      this.emitStatus("saving", "Saving locally");
      try {
        const result = await operation();
        autosaveLogger.debug("Debounced save completed", { context: { key } });
        this.emitStatus("saved", "Saved locally");
        (previous?.resolve || resolvePromise)?.(result);
      } catch (error) {
        autosaveLogger.error("Debounced save failed", { context: { key, error: normalizeError(error) } });
        this.emitStatus("failed", error.message);
        (previous?.reject || rejectPromise)?.(error);
      }
    }, delay);
    this.debounced.set(key, {
      timer,
      operation,
      promise,
      resolve: previous?.resolve || resolvePromise,
      reject: previous?.reject || rejectPromise
    });
    return promise;
  }
  async flush() {
    const entries = [...this.debounced.entries()];
    this.debounced.clear();
    if (!entries.length)
      return;
    autosaveLogger.info("Flushing pending saves", { context: { count: entries.length, keys: entries.map(([key]) => key) } });
    this.emitStatus("saving", "Saving locally");
    try {
      await Promise.all(entries.map(async ([, entry]) => {
        clearTimeout(entry.timer);
        const result = await entry.operation();
        entry.resolve?.(result);
      }));
      this.emitStatus("saved", "Saved locally");
    } catch (error) {
      entries.forEach(([, entry]) => entry.reject?.(error));
      autosaveLogger.error("Flush failed", { context: { count: entries.length, error: normalizeError(error) } });
      this.emitStatus("failed", error.message || "Save failed");
      throw error;
    }
  }
  handleMessage(message) {
    const pending = this.pending.get(message?.requestId);
    if (!pending)
      return;
    this.pending.delete(message.requestId);
    const startedAt = this.requestStartedAt.get(message.requestId);
    this.requestStartedAt.delete(message.requestId);
    const durationMs = startedAt ? Math.round(performance.now() - startedAt) : null;
    workerLogger.debug("Received worker response", { context: { requestId: message.requestId, type: message.type, ok: message.ok, durationMs } });
    if (message.ok)
      pending.resolve(message.data);
    else {
      const error = Object.assign(new Error(message.error?.message || "Storage request failed"), { code: message.error?.code });
      workerLogger.error("Worker request failed", { context: { requestId: message.requestId, type: message.type, error: normalizeError(error) } });
      pending.reject(error);
    }
  }
  emitStatus(state, detail) {
    logger.debug("Save status changed", { context: { state, detail } });
    this.dispatchEvent(new CustomEvent("save-status", { detail: { state, detail } }));
  }
}
function summarizePayload(payload) {
  if (!payload || typeof payload !== "object")
    return payload;
  return {
    keys: Object.keys(payload),
    pageId: payload.pageId || payload.page?.id,
    blockId: payload.blockId || payload.block?.id,
    blockType: payload.block?.type,
    blockCount: Array.isArray(payload.blocks) ? payload.blocks.length : undefined,
    pageCount: Array.isArray(payload.pages) ? payload.pages.length : undefined,
    query: payload.query,
    key: payload.key
  };
}

// src/rich-text.js
var logger2 = createLogger("RichText");
var ALLOWED_INLINE_TAGS = new Set(["A", "BR", "CODE", "EM", "MARK", "STRONG", "U"]);
var BLOCK_BREAK_TAGS = new Set(["DIV", "P", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"]);
function textToSafeHtml(text = "") {
  return escapeHtml(text).replace(/\n/g, "<br>");
}
function normalizeRichTextContent(content = {}) {
  const sourceHtml = typeof content.html === "string" && content.html ? content.html : textToSafeHtml(content.text || "");
  const html = sanitizeInlineHtml(sourceHtml);
  return { html, text: plainTextFromHtml(html) };
}
function sanitizeInlineHtml(html = "") {
  if (typeof document === "undefined") {
    return sanitizeInlineHtmlFallback(html);
  }
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const stats = { removedElements: 0, removedAttributes: 0 };
  const fragment = sanitizeChildren(template.content, stats);
  const wrapper = document.createElement("div");
  wrapper.append(fragment);
  const output = normalizeInlineHtml(wrapper.innerHTML);
  if (stats.removedElements || stats.removedAttributes)
    logger2.debug("Sanitized inline HTML", { context: stats });
  return output;
}
function plainTextFromHtml(html = "") {
  if (typeof document === "undefined")
    return stripTags(sanitizeInlineHtmlFallback(html)).replace(/\s+/g, " ").trim();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeInlineHtml(html);
  return wrapper.innerText?.replace(/\u00a0/g, " ").trim() || wrapper.textContent?.replace(/\s+/g, " ").trim() || "";
}
function inlineHtmlToMarkdown(html = "") {
  if (typeof document === "undefined")
    return inlineHtmlToMarkdownFallback(html);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeInlineHtml(html);
  return [...wrapper.childNodes].map(nodeToMarkdown).join("").replace(/\n{3,}/g, `

`).trim();
}
function safeLinkHref(value = "") {
  try {
    const url = new URL(value, globalThis.location?.href || "https://example.invalid/");
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
function sanitizeChildren(parent, stats) {
  const fragment = document.createDocumentFragment();
  for (const child of [...parent.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      fragment.append(document.createTextNode(child.textContent || ""));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE)
      continue;
    const tag = child.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "IFRAME" || tag === "OBJECT" || tag === "EMBED" || tag === "FORM" || tag === "INPUT" || tag === "BUTTON") {
      stats.removedElements += 1;
      continue;
    }
    if (tag === "B") {
      fragment.append(wrapAllowed("strong", child, stats));
      continue;
    }
    if (tag === "I") {
      fragment.append(wrapAllowed("em", child, stats));
      continue;
    }
    if (ALLOWED_INLINE_TAGS.has(tag)) {
      fragment.append(wrapAllowed(tag.toLowerCase(), child, stats));
      continue;
    }
    if (BLOCK_BREAK_TAGS.has(tag) && fragment.childNodes.length)
      fragment.append(document.createElement("br"));
    fragment.append(sanitizeChildren(child, stats));
    if (BLOCK_BREAK_TAGS.has(tag))
      fragment.append(document.createElement("br"));
    stats.removedElements += 1;
  }
  return fragment;
}
function wrapAllowed(tagName, source, stats) {
  const element = document.createElement(tagName);
  if (tagName === "a") {
    const href = safeLinkHref(source.getAttribute("href") || "");
    if (href) {
      element.setAttribute("href", href);
      element.setAttribute("rel", "noopener noreferrer");
      element.setAttribute("target", "_blank");
    }
  }
  stats.removedAttributes += Math.max(0, source.attributes.length - (tagName === "a" && element.hasAttribute("href") ? 1 : 0));
  element.append(sanitizeChildren(source, stats));
  if (tagName === "a" && !element.hasAttribute("href"))
    return document.createTextNode(element.textContent || "");
  return element;
}
function nodeToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE)
    return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE)
    return "";
  const inner = [...node.childNodes].map(nodeToMarkdown).join("");
  const tag = node.tagName;
  if (tag === "BR")
    return `
`;
  if (tag === "STRONG")
    return `**${inner}**`;
  if (tag === "EM")
    return `_${inner}_`;
  if (tag === "CODE")
    return `\`${inner.replace(/`/g, "\\`")}\``;
  if (tag === "MARK")
    return `==${inner}==`;
  if (tag === "U")
    return inner;
  if (tag === "A")
    return node.getAttribute("href") ? `[${inner}](${node.getAttribute("href")})` : inner;
  return inner;
}
function normalizeInlineHtml(html) {
  return String(html || "").replace(/(<br>\s*){3,}/g, "<br><br>").replace(/^(<br>\s*)+|(\s*<br>)+$/g, "").trim();
}
function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}
function sanitizeInlineHtmlFallback(html) {
  let output = String(html || "").replace(/<\s*(script|style|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "").replace(/<\s*br\s*\/?>/gi, "<br>").replace(/<\s*b(\s[^>]*)?>/gi, "<strong>").replace(/<\s*\/\s*b\s*>/gi, "</strong>").replace(/<\s*i(\s[^>]*)?>/gi, "<em>").replace(/<\s*\/\s*i\s*>/gi, "</em>");
  output = output.replace(/<\s*\/?\s*([a-z0-9]+)([^>]*)>/gi, (match, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    if (match.startsWith("</"))
      return ["strong", "em", "u", "code", "mark", "a"].includes(tag) ? `</${tag}>` : "";
    if (tag === "br")
      return "<br>";
    if (!["strong", "em", "u", "code", "mark", "a"].includes(tag))
      return "";
    if (tag !== "a")
      return `<${tag}>`;
    const hrefMatch = String(rawAttrs || "").match(/\shref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
    const href = hrefMatch ? hrefMatch[1].replace(/^['"]|['"]$/g, "") : "";
    const safeHref = safeLinkHref(href);
    return safeHref ? `<a href="${escapeHtml(safeHref)}" rel="noopener noreferrer" target="_blank">` : "";
  });
  return normalizeInlineHtml(output);
}
function inlineHtmlToMarkdownFallback(html) {
  return sanitizeInlineHtmlFallback(html).replace(/<br>/gi, `
`).replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**").replace(/<em>([\s\S]*?)<\/em>/gi, "_$1_").replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`").replace(/<mark>([\s\S]*?)<\/mark>/gi, "==$1==").replace(/<u>([\s\S]*?)<\/u>/gi, "$1").replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)").replace(/<[^>]*>/g, "").trim();
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

// src/models.js
var logger3 = createLogger("Models");
var nowIso = () => new Date().toISOString();
function createId2(prefix) {
  const value = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${value}`;
}
function createPage({ title = "Untitled research", sortOrder = 1000 } = {}) {
  const stamp = nowIso();
  return normalizePage({
    id: createId2("page"),
    title,
    createdAt: stamp,
    updatedAt: stamp,
    sortOrder
  });
}
function createBlock({ pageId, type = BLOCK_TYPES.paragraph, content, sortOrder = 1000, source = null } = {}) {
  const stamp = nowIso();
  return normalizeBlock({
    id: createId2("block"),
    pageId,
    type,
    sortOrder,
    content: content ?? defaultContentForType(type),
    source,
    createdAt: stamp,
    updatedAt: stamp
  });
}
function normalizePage(page = {}) {
  if (!isPlainObject(page))
    logger3.warn("Normalizing malformed page record", { context: { receivedType: typeof page } });
  const value = isPlainObject(page) ? page : {};
  return {
    id: String(value.id || createId2("page")),
    title: String(value.title || "Untitled research"),
    createdAt: value.createdAt || nowIso(),
    updatedAt: value.updatedAt || value.createdAt || nowIso(),
    archivedAt: value.archivedAt ?? null,
    deletedAt: value.deletedAt ?? null,
    sortOrder: Number.isFinite(value.sortOrder) ? value.sortOrder : 1000,
    pinned: Boolean(value.pinned),
    color: value.color ?? null,
    summary: String(value.summary || ""),
    metadata: isPlainObject(value.metadata) ? value.metadata : {},
    dataFormatVersion: value.dataFormatVersion ?? APP_DATA_FORMAT_VERSION
  };
}
function normalizeBlock(block = {}) {
  if (!isPlainObject(block))
    logger3.warn("Normalizing malformed block record", { context: { receivedType: typeof block } });
  const value = isPlainObject(block) ? block : {};
  const type = Object.values(BLOCK_TYPES).includes(value.type) ? value.type : String(value.type || "unknown");
  if (!Object.values(BLOCK_TYPES).includes(value.type))
    logger3.warn("Normalizing unknown block type", { context: { blockId: value.id, type } });
  return {
    id: String(value.id || createId2("block")),
    pageId: String(value.pageId || ""),
    type,
    sortOrder: Number.isFinite(value.sortOrder) ? value.sortOrder : 1000,
    content: normalizeContent(type, value.content),
    source: isPlainObject(value.source) ? value.source : null,
    createdAt: value.createdAt || nowIso(),
    updatedAt: value.updatedAt || value.createdAt || nowIso(),
    archivedAt: value.archivedAt ?? null,
    deletedAt: value.deletedAt ?? null,
    contentVersion: Number.isFinite(value.contentVersion) ? value.contentVersion : 1,
    metadata: isPlainObject(value.metadata) ? value.metadata : {}
  };
}
function defaultContentForType(type) {
  switch (type) {
    case BLOCK_TYPES.heading:
      return { level: 2, html: "", text: "" };
    case BLOCK_TYPES.quote:
      return { text: "", attribution: "", sourceUrl: "" };
    case BLOCK_TYPES.list:
      return { ordered: false, items: [{ id: createId2("item"), text: "" }] };
    case BLOCK_TYPES.table: {
      const c1 = createId2("col");
      const c2 = createId2("col");
      return {
        columns: [{ id: c1, label: "Column 1" }, { id: c2, label: "Column 2" }],
        rows: [{ id: createId2("row"), cells: { [c1]: "", [c2]: "" } }]
      };
    }
    case BLOCK_TYPES.code:
      return { language: "", text: "" };
    case BLOCK_TYPES.sourceLink:
      return { url: "", title: "", note: "", domain: "", capturedText: "", capturedAt: nowIso() };
    default:
      return { text: "" };
  }
}
function normalizeContent(type, content) {
  const value = isPlainObject(content) ? content : {};
  switch (type) {
    case BLOCK_TYPES.heading:
      return { level: clampHeading(value.level), ...normalizeRichTextContent(value) };
    case BLOCK_TYPES.quote:
      return { text: String(value.text || ""), attribution: String(value.attribution || ""), sourceUrl: String(value.sourceUrl || "") };
    case BLOCK_TYPES.list:
      return {
        ordered: Boolean(value.ordered),
        items: Array.isArray(value.items) && value.items.length ? value.items.map((item) => ({ id: String(item.id || createId2("item")), text: String(item.text || "") })) : [{ id: createId2("item"), text: "" }]
      };
    case BLOCK_TYPES.table:
      return normalizeTable(value);
    case BLOCK_TYPES.code:
      return { language: String(value.language || ""), text: String(value.text || "") };
    case BLOCK_TYPES.sourceLink:
      return normalizeSourceLink(value);
    case BLOCK_TYPES.paragraph:
      return normalizeRichTextContent(value);
    default:
      return { raw: value, text: String(value.text || "") };
  }
}
function normalizeSourceLink(value) {
  const url = String(value.url || "");
  return {
    url,
    title: String(value.title || ""),
    note: String(value.note || ""),
    domain: String(value.domain || deriveDomain(url)),
    capturedText: String(value.capturedText || ""),
    capturedAt: value.capturedAt || nowIso()
  };
}
function normalizeTable(value) {
  const columns = Array.isArray(value.columns) && value.columns.length ? value.columns.map((col, index) => ({ id: String(col.id || createId2("col")), label: String(col.label || `Column ${index + 1}`) })) : [{ id: createId2("col"), label: "Column 1" }];
  const rows = Array.isArray(value.rows) && value.rows.length ? value.rows : [{ cells: {} }];
  return {
    columns,
    rows: rows.map((row) => ({
      id: String(row.id || createId2("row")),
      cells: Object.fromEntries(columns.map((col) => [col.id, String(row.cells?.[col.id] ?? "")]))
    }))
  };
}
function deriveDomain(url) {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}
function sortByOrder(records) {
  return [...records].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}
function clampHeading(level) {
  const numeric = Number(level);
  return Number.isFinite(numeric) ? Math.min(3, Math.max(1, Math.round(numeric))) : 2;
}
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// src/paste.js
var logger4 = createLogger("Paste");
function blocksFromClipboard({ pageId, html = "", text = "" }) {
  if (html && typeof DOMParser !== "undefined") {
    logger4.debug("Converting HTML clipboard payload", { context: { pageId, htmlLength: html.length, textLength: text.length } });
    return blocksFromHtml({ pageId, html });
  }
  if (html && typeof DOMParser === "undefined")
    logger4.warn("DOMParser unavailable; falling back to stripped plain text", { context: { pageId, htmlLength: html.length } });
  return blocksFromPlainText({ pageId, text: text || stripTags2(html) });
}
function blocksFromPlainText({ pageId, text }) {
  const chunks = String(text || "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const blocks = (chunks.length ? chunks : [""]).map((part, index) => createBlock({
    pageId,
    type: looksLikeCode(part) ? BLOCK_TYPES.code : BLOCK_TYPES.paragraph,
    sortOrder: (index + 1) * 1000,
    content: looksLikeCode(part) ? { language: "", text: part } : { text: part },
    source: null
  }));
  logger4.debug("Converted plain text clipboard payload", { context: { pageId, chunkCount: chunks.length, blockCount: blocks.length } });
  return blocks;
}
function blocksFromHtml({ pageId, html }) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const unsafeNodes = doc.querySelectorAll("script,style,iframe,object,embed,link,meta");
  unsafeNodes.forEach((node) => node.remove());
  const blocks = [];
  for (const child of doc.body.children) {
    const converted = elementToBlock(pageId, child);
    if (converted)
      blocks.push(...Array.isArray(converted) ? converted : [converted]);
  }
  if (!blocks.length) {
    logger4.warn("HTML clipboard produced no semantic blocks; falling back to plain text", { context: { pageId, removedNodeCount: unsafeNodes.length } });
    return blocksFromPlainText({ pageId, text: doc.body.textContent || "" });
  }
  logger4.info("Converted HTML clipboard payload", { context: { pageId, removedNodeCount: unsafeNodes.length, blockCount: blocks.length } });
  return blocks.map((block, index) => ({ ...block, sortOrder: (index + 1) * 1000 }));
}
function elementToBlock(pageId, element) {
  const tag = element.tagName.toLowerCase();
  const text = collapseText(element.textContent || "");
  if (!text && tag !== "table")
    return null;
  if (/^h[1-6]$/.test(tag)) {
    return createBlock({ pageId, type: BLOCK_TYPES.heading, content: { level: Math.min(3, Number(tag.slice(1))), html: sanitizeInlineHtml(element.innerHTML), text } });
  }
  if (tag === "blockquote") {
    return createBlock({ pageId, type: BLOCK_TYPES.quote, content: { text, attribution: "", sourceUrl: "" } });
  }
  if (tag === "pre" || tag === "code") {
    return createBlock({ pageId, type: BLOCK_TYPES.code, content: { language: "", text: element.textContent || "" } });
  }
  if (tag === "ul" || tag === "ol") {
    const items = [...element.querySelectorAll(":scope > li")].map((li) => ({ id: createId2("item"), text: collapseText(li.textContent || "") })).filter((item) => item.text);
    return createBlock({ pageId, type: BLOCK_TYPES.list, content: { ordered: tag === "ol", items } });
  }
  if (tag === "table") {
    const rows = [...element.querySelectorAll("tr")].map((tr) => [...tr.children].map((cell) => collapseText(cell.textContent || ""))).filter((row) => row.length);
    if (!rows.length)
      return null;
    const first = rows[0];
    const columns = first.map((label, index) => ({ id: createId2("col"), label: label || `Column ${index + 1}` }));
    return createBlock({
      pageId,
      type: BLOCK_TYPES.table,
      content: {
        columns,
        rows: rows.slice(1).map((row) => ({
          id: createId2("row"),
          cells: Object.fromEntries(columns.map((col, index) => [col.id, row[index] || ""]))
        }))
      }
    });
  }
  const link = element.matches("a[href]") ? element : element.querySelector("a[href]");
  if (link && text === collapseText(link.textContent || "")) {
    const url = link.getAttribute("href") || "";
    return createBlock({
      pageId,
      type: BLOCK_TYPES.sourceLink,
      content: { url, title: text, note: "", domain: deriveDomain(url), capturedText: "", capturedAt: new Date().toISOString() }
    });
  }
  if (["p", "div", "section", "article", "main"].includes(tag)) {
    return createBlock({ pageId, type: BLOCK_TYPES.paragraph, content: normalizeRichTextContent({ html: element.innerHTML, text }) });
  }
  return createBlock({ pageId, type: BLOCK_TYPES.paragraph, content: normalizeRichTextContent({ html: element.innerHTML, text }) });
}
function collapseText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
function stripTags2(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}
function looksLikeCode(value) {
  return /[{}`;]|^\s*(const|let|function|class|import|export|SELECT|curl)\b/m.test(value);
}

// src/search.js
var logger5 = createLogger("Search", "Indexing");

// src/exporters.js
var logger6 = createLogger("Export");
function pageToMarkdown(page, blocks) {
  logger6.debug("Rendering page to Markdown", { context: { pageId: page?.id, blockCount: blocks.length } });
  const lines = [`# ${escapeMarkdown(page.title)}`, ""];
  for (const block of blocks) {
    const c = block.content || {};
    switch (block.type) {
      case "heading":
        lines.push(`${"#".repeat(Math.max(1, Math.min(6, c.level || 2)))} ${inlineHtmlToMarkdown(normalizeRichTextContent(c).html)}`, "");
        break;
      case "quote":
        lines.push(...String(c.text || "").split(`
`).map((line) => `> ${line}`));
        if (c.attribution)
          lines.push(`> -- ${c.attribution}`);
        if (c.sourceUrl)
          lines.push(`> Source: ${c.sourceUrl}`);
        lines.push("");
        break;
      case "list":
        (c.items || []).forEach((item, index) => lines.push(`${c.ordered ? `${index + 1}.` : "-"} ${item.text || ""}`));
        lines.push("");
        break;
      case "table":
        lines.push(...tableToMarkdown(c), "");
        break;
      case "code":
        lines.push(`\`\`\`${c.language || ""}`, c.text || "", "```", "");
        break;
      case "sourceLink":
        lines.push(`- Source: [${c.title || c.url || "Untitled source"}](${c.url || "#"})`);
        if (c.note)
          lines.push(`  - Note: ${c.note}`);
        if (c.capturedText)
          lines.push(`  - Captured: ${c.capturedText}`);
        lines.push("");
        break;
      case "paragraph":
        lines.push(inlineHtmlToMarkdown(normalizeRichTextContent(c).html), "");
        break;
      default:
        lines.push(`Unsupported block type: ${block.type}`, "```json", JSON.stringify(block.content, null, 2), "```", "");
    }
  }
  return `${lines.join(`
`).replace(/\n{3,}/g, `

`).trim()}
`;
}
function workspaceToBackup({ pages, blocks }) {
  logger6.debug("Rendering workspace backup", { context: { pageCount: pages.length, blockCount: blocks.length, exportFormatVersion: EXPORT_FORMAT_VERSION } });
  return {
    format: "topic-research-notepad-backup",
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    pages,
    blocks
  };
}
function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  logger6.info("Starting browser download", { context: { filename, type, byteLength: blob.size } });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
function tableToMarkdown(content) {
  const columns = content.columns || [];
  const rows = content.rows || [];
  if (!columns.length)
    return [];
  const header = `| ${columns.map((col) => escapeCell(col.label)).join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  return [
    header,
    sep,
    ...rows.map((row) => `| ${columns.map((col) => escapeCell(row.cells?.[col.id] || "")).join(" | ")} |`)
  ];
}
function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}
function escapeMarkdown(value) {
  return String(value || "").replace(/([\\`*_{}\[\]()#+\-.!])/g, "\\$1");
}
function filenameForPage(page, ext) {
  const slug = String(page.title || "research-page").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "research-page";
  return `${slug}.${ext}`;
}

// src/block-transforms.js
var BLOCK_TRANSFORMS = {
  [BLOCK_TYPES.paragraph]: [BLOCK_TYPES.heading, BLOCK_TYPES.quote, BLOCK_TYPES.list, BLOCK_TYPES.table, BLOCK_TYPES.code, BLOCK_TYPES.sourceLink],
  [BLOCK_TYPES.heading]: [BLOCK_TYPES.paragraph, BLOCK_TYPES.quote],
  [BLOCK_TYPES.quote]: [BLOCK_TYPES.paragraph],
  [BLOCK_TYPES.code]: [BLOCK_TYPES.paragraph],
  [BLOCK_TYPES.list]: [BLOCK_TYPES.paragraph],
  [BLOCK_TYPES.sourceLink]: [],
  [BLOCK_TYPES.table]: []
};
function canTransformBlock(fromType, toType) {
  return Boolean(BLOCK_TRANSFORMS[fromType]?.includes(toType));
}
function transformBlock(block, toType) {
  if (block.type === toType)
    return block;
  if (!canTransformBlock(block.type, toType))
    throw new Error(`Unsupported block transform: ${block.type} -> ${toType}`);
  const text = textFromBlock(block);
  const html = htmlFromBlock(block);
  block.type = toType;
  if (toType === BLOCK_TYPES.heading)
    block.content = { level: 2, html, text };
  else if (toType === BLOCK_TYPES.paragraph)
    block.content = { html, text };
  else if (toType === BLOCK_TYPES.quote)
    block.content = { text, attribution: "", sourceUrl: "" };
  else if (toType === BLOCK_TYPES.code)
    block.content = { language: "", text };
  else if (toType === BLOCK_TYPES.list) {
    const items = text.split(/\n+/).filter(Boolean).map((line) => ({ id: createId2("item"), text: line }));
    block.content = { ordered: false, items: items.length ? items : [{ id: createId2("item"), text: "" }] };
  } else if (toType === BLOCK_TYPES.table) {
    const col = createId2("col");
    block.content = { columns: [{ id: col, label: "Notes" }], rows: [{ id: createId2("row"), cells: { [col]: text } }] };
  } else if (toType === BLOCK_TYPES.sourceLink)
    block.content = { url: "", title: text, note: "", domain: "", capturedText: "", capturedAt: new Date().toISOString() };
  return block;
}
function textFromBlock(block) {
  const c = block.content || {};
  if (block.type === BLOCK_TYPES.heading || block.type === BLOCK_TYPES.paragraph)
    return normalizeRichTextContent(c).text;
  if (block.type === BLOCK_TYPES.quote)
    return c.text || "";
  if (block.type === BLOCK_TYPES.code)
    return c.text || "";
  if (block.type === BLOCK_TYPES.list)
    return (c.items || []).map((item) => item.text).join(`
`);
  return c.text || "";
}
function htmlFromBlock(block) {
  const c = block.content || {};
  if (block.type === BLOCK_TYPES.heading || block.type === BLOCK_TYPES.paragraph)
    return normalizeRichTextContent(c).html;
  return textToSafeHtml(textFromBlock(block));
}

// src/ui.js
var logger7 = createLogger("UI");
var searchLogger = createLogger("Search", "UI");
var exportLogger = createLogger("Export", "UI");

class TopicResearchApp {
  constructor({ root, storage }) {
    this.root = root;
    this.storage = storage;
    this.state = {
      pages: [],
      blocks: [],
      selectedPageId: null,
      searchResults: [],
      status: { state: "loading", detail: "Opening local storage" },
      error: "",
      focusedBlockId: "",
      keyboardCreatedEmptyBlockId: "",
      sidebarWidth: 280,
      slash: null
    };
    this.searchRun = 0;
    this.undoStack = [];
    this.storage.addEventListener("save-status", (event) => {
      this.state.status = event.detail;
      this.renderStatus();
    });
  }
  async start() {
    logger7.info("App start requested");
    this.renderShell();
    try {
      await this.storage.hello();
      const workspace = await this.storage.request("loadWorkspace");
      logger7.info("Workspace loaded", { context: { pageCount: workspace.pages.length, blockCount: workspace.blocks.length, selectedPageId: workspace.settings.selectedPageId } });
      this.state.pages = workspace.pages.map(normalizePage);
      this.state.blocks = workspace.blocks.map(normalizeBlock);
      this.state.selectedPageId = workspace.settings.selectedPageId || this.state.pages[0]?.id || null;
      this.state.sidebarWidth = normalizeSidebarWidth(workspace.settings.sidebarWidth);
      if (!this.state.pages.length)
        await this.createPage("Auth library comparison");
      this.state.status = { state: "saved", detail: "Local storage ready" };
      this.render();
      this.bindLifecycleFlush();
      logger7.info("App start completed", { context: this.getRuntimeSnapshot() });
    } catch (error) {
      logger7.error("App start failed", { context: { error: normalizeError(error) } });
      this.state.error = error.message;
      this.state.status = { state: "failed", detail: "Storage unavailable" };
      this.render();
    }
  }
  renderShell() {
    this.root.innerHTML = `
      <awwbookmarklet-app-shell class="trn-shell">
        <awwbookmarklet-titlebar slot="title" value="Topic Research Notepad"></awwbookmarklet-titlebar>
        <awwbookmarklet-toolbar slot="status" class="trn-commandbar" wrap density="compact">
          <div class="trn-commandbar-primary">
            <awwbookmarklet-button class="trn-button primary" variant="primary" data-action="new-page">New Page</awwbookmarklet-button>
            <awwbookmarklet-button class="trn-button" data-action="undo-structural" title="Undo last block move or delete">Undo</awwbookmarklet-button>
          </div>
          <div class="trn-commandbar-search" role="search" aria-label="Search local notes">
            <input class="trn-input" type="search" data-role="search" placeholder="Search local notes" />
            <awwbookmarklet-button class="trn-button" data-action="clear-search">Clear search</awwbookmarklet-button>
          </div>
          <div class="trn-commandbar-secondary">
            <awwbookmarklet-button class="trn-button" data-action="export-md">Export MD</awwbookmarklet-button>
            <awwbookmarklet-button class="trn-button" data-action="export-json">Backup JSON</awwbookmarklet-button>
          </div>
        </awwbookmarklet-toolbar>
        <main slot="body" class="trn-main">
          <awwbookmarklet-split-pane class="trn-layout-split" direction="horizontal" value="${this.state.sidebarWidth}" min-start="180" min-end="420" aria-label="Resize page sidebar">
          <awwbookmarklet-panel slot="start" class="trn-sidebar">
            <div slot="title">Pages</div>
            <div data-role="page-list"></div>
          </awwbookmarklet-panel>
          <awwbookmarklet-panel slot="end" class="trn-editor-panel">
            <div data-role="error"></div>
            <div data-role="search-results"></div>
            <div data-role="editor"></div>
          </awwbookmarklet-panel>
          </awwbookmarklet-split-pane>
        </main>
        <awwbookmarklet-statusbar slot="footer" class="trn-statusbar">
          <span data-role="status" aria-live="polite"></span>
        </awwbookmarklet-statusbar>
      </awwbookmarklet-app-shell>
    `;
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.root.addEventListener("keydown", (event) => this.handleKeydown(event));
    this.root.addEventListener("compositionstart", (event) => this.handleComposition(event, true));
    this.root.addEventListener("compositionend", (event) => this.handleComposition(event, false));
    this.root.addEventListener("blur", (event) => this.handleBlur(event), true);
    this.root.addEventListener("paste", (event) => this.handlePaste(event));
    this.root.addEventListener("awwbookmarklet-split-pane-resize-commit", (event) => this.handleSidebarResizeCommit(event));
  }
  render() {
    this.renderPages();
    this.renderEditor();
    this.renderSearchResults();
    this.renderStatus();
    this.renderError();
  }
  renderPages() {
    const list = this.root.querySelector('[data-role="page-list"]');
    list.innerHTML = sortByOrder(this.state.pages).map((page) => `
      <div class="trn-page-row ${page.id === this.state.selectedPageId ? "selected" : ""}" data-page-id="${escapeAttr(page.id)}">
        <awwbookmarklet-button class="trn-page-button" data-action="select-page" title="${escapeAttr(page.title)}" aria-label="Open page: ${escapeAttr(page.title)}">${escapeHtml2(page.title)}</awwbookmarklet-button>
        <div class="trn-page-actions" aria-label="Page actions">
        <awwbookmarklet-button class="trn-icon-button" data-action="page-up" title="Move page up" aria-label="Move page up">&#8593;</awwbookmarklet-button>
        <awwbookmarklet-button class="trn-icon-button" data-action="page-down" title="Move page down" aria-label="Move page down">&#8595;</awwbookmarklet-button>
        </div>
      </div>
    `).join("");
  }
  renderEditor() {
    const editor = this.root.querySelector('[data-role="editor"]');
    const page = this.selectedPage();
    if (!page) {
      editor.innerHTML = `<div class="trn-empty">Create a page to start collecting research.</div>`;
      return;
    }
    const blocks = this.blocksForPage(page.id);
    editor.innerHTML = `
      <div class="trn-page-head">
        <input class="trn-page-title-input" data-role="page-title" value="${escapeAttr(page.title)}" />
        <awwbookmarklet-toolbar class="trn-block-add" wrap density="compact" aria-label="Add content block">
          ${Object.values(BLOCK_TYPES).map((type) => `<awwbookmarklet-button class="trn-button" data-action="add-block" data-type="${type}">${labelForType(type)}</awwbookmarklet-button>`).join("")}
        </awwbookmarklet-toolbar>
      </div>
      <div class="trn-blocks" data-role="blocks">
        ${blocks.map((block) => this.renderBlock(block)).join("")}
      </div>
      <button class="trn-document-end-insert" data-action="add-paragraph-end" type="button">+ Add paragraph</button>
      <div class="trn-pastebin" data-role="pastebin" contenteditable="true" aria-hidden="true"></div>
      <div class="trn-slash-menu" data-role="slash-menu" hidden></div>
    `;
  }
  renderBlock(block) {
    return `
      <article class="trn-block ${block.id === this.state.focusedBlockId ? "is-focused" : ""}" data-block-id="${escapeAttr(block.id)}" data-type="${escapeAttr(block.type)}">
        <div class="trn-block-toolbar">
          <span class="trn-block-type-label">${labelForType(block.type)}</span>
          <awwbookmarklet-button class="trn-icon-button" data-action="block-up" title="Move block up" aria-label="Move block up">&#8593;</awwbookmarklet-button>
          <awwbookmarklet-button class="trn-icon-button" data-action="block-down" title="Move block down" aria-label="Move block down">&#8595;</awwbookmarklet-button>
          ${this.renderTransformMenu(block)}
          <awwbookmarklet-button class="trn-del-button" data-action="delete-block" title="Delete block" aria-label="Delete block">DEL</awwbookmarklet-button>
        </div>
        ${this.renderBlockBody(block)}
      </article>
    `;
  }
  renderTransformMenu(block) {
    const targets = validTransformsFor(block.type);
    if (!targets.length)
      return "";
    return `<details class="trn-transform-menu">
      <summary title="Turn block into another type" aria-label="Turn block into another type">Turn into</summary>
      <div class="trn-transform-options">
        ${targets.map((type) => `<button type="button" data-action="transform-block" data-type="${escapeAttr(type)}"> ${escapeHtml2(labelForType(type))}</button>`).join("")}
      </div>
    </details>`;
  }
  renderBlockBody(block) {
    const c = block.content || {};
    switch (block.type) {
      case BLOCK_TYPES.heading:
        return richTextEditable(block, "heading", "Heading");
      case BLOCK_TYPES.quote:
        return `<textarea class="trn-textarea quote" data-field="text" placeholder="Quote">${escapeHtml2(c.text)}</textarea>
          <input class="trn-input" data-field="attribution" value="${escapeAttr(c.attribution)}" placeholder="Attribution" />
          <input class="trn-input" data-field="sourceUrl" value="${escapeAttr(c.sourceUrl)}" placeholder="Source URL" />`;
      case BLOCK_TYPES.list:
        return `<div class="trn-list-items">
          ${(c.items || []).map((item) => `<div class="trn-list-item" data-item-id="${escapeAttr(item.id)}"><input class="trn-list-input" data-list-item="${escapeAttr(item.id)}" value="${escapeAttr(item.text)}" aria-label="List item" /></div>`).join("")}
          <awwbookmarklet-button class="trn-button trn-add-list-item" data-action="add-list-item">+ item</awwbookmarklet-button>
        </div>`;
      case BLOCK_TYPES.table:
        return `<div class="trn-table-wrap"><table class="trn-table">
          <thead><tr>${(c.columns || []).map((col) => `<th><input data-table-col="${escapeAttr(col.id)}" value="${escapeAttr(col.label)}" /></th>`).join("")}<th></th></tr></thead>
          <tbody>${(c.rows || []).map((row) => `<tr data-row-id="${escapeAttr(row.id)}">${(c.columns || []).map((col) => `<td><input data-table-cell="${escapeAttr(row.id)}:${escapeAttr(col.id)}" value="${escapeAttr(row.cells?.[col.id] || "")}" /></td>`).join("")}<td><awwbookmarklet-button class="trn-icon-button danger" tone="danger" data-action="delete-row" aria-label="Delete row">&times;</awwbookmarklet-button></td></tr>`).join("")}</tbody>
        </table></div><awwbookmarklet-toolbar class="trn-table-actions" wrap density="compact"><awwbookmarklet-button class="trn-button" data-action="add-row">Add row</awwbookmarklet-button><awwbookmarklet-button class="trn-button" data-action="add-column">Add column</awwbookmarklet-button></awwbookmarklet-toolbar>`;
      case BLOCK_TYPES.code:
        return `<input class="trn-input" data-field="language" value="${escapeAttr(c.language)}" placeholder="Language" />
          <textarea class="trn-textarea code" data-field="text" spellcheck="false">${escapeHtml2(c.text)}</textarea>`;
      case BLOCK_TYPES.sourceLink:
        return `<details class="trn-source-details">
          <summary>
            <span class="trn-source-title">${escapeHtml2(c.title || c.domain || c.url || "Untitled source")}</span>
            <span class="trn-source-domain">${escapeHtml2(c.domain || deriveDomain(c.url) || "")}</span>
            ${c.url ? `<a class="trn-source-link" href="${escapeAttr(safeUrl(c.url))}" target="_blank" rel="noreferrer">Open</a>` : ""}
          </summary>
          ${c.note ? `<p class="trn-source-note">${escapeHtml2(c.note)}</p>` : ""}
          <div class="trn-source-grid">
            <input class="trn-input" data-field="url" value="${escapeAttr(c.url)}" placeholder="URL" />
            <input class="trn-input" data-field="title" value="${escapeAttr(c.title)}" placeholder="Title" />
            <input class="trn-input" data-field="note" value="${escapeAttr(c.note)}" placeholder="Note" />
            <textarea class="trn-textarea" data-field="capturedText" placeholder="Captured text">${escapeHtml2(c.capturedText)}</textarea>
          </div>
        </details>`;
      case BLOCK_TYPES.paragraph:
        return richTextEditable(block, "paragraph", "Write a note");
      default:
        return `<div class="trn-unsupported">Unsupported block type: ${escapeHtml2(block.type)}<pre>${escapeHtml2(JSON.stringify(block.content, null, 2))}</pre></div>`;
    }
  }
  renderSearchResults() {
    const box = this.root.querySelector('[data-role="search-results"]');
    if (!this.state.searchResults.length) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = `<div class="trn-search-results">${this.state.searchResults.map((result) => `
      <button class="trn-search-result" data-action="open-search-result" data-page-id="${escapeAttr(result.pageId)}" data-block-id="${escapeAttr(result.blockId || "")}">
        <strong>${escapeHtml2(result.pageTitle)}</strong>
        <span>${escapeHtml2(result.rawPreview || result.kind)}</span>
      </button>
    `).join("")}</div>`;
  }
  renderStatus() {
    const status = this.root.querySelector('[data-role="status"]');
    if (status) {
      status.textContent = statusText(this.state.status);
      status.dataset.state = this.state.status.state;
    }
  }
  renderError() {
    const error = this.root.querySelector('[data-role="error"]');
    error.innerHTML = this.state.error ? `<div class="trn-error">${escapeHtml2(this.state.error)}</div>` : "";
  }
  async handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button)
      return;
    const action = button.dataset.action;
    logger7.debug("UI action received", { context: { action } });
    try {
      if (action === "new-page")
        await this.createPage(this.uniqueNewPageTitle(), { focusTitle: true });
      if (action === "select-page")
        await this.selectPage(button.closest("[data-page-id]").dataset.pageId);
      if (action === "add-block")
        await this.addBlock(button.dataset.type);
      if (action === "add-paragraph-end")
        await this.addParagraphAtEnd();
      if (action === "delete-block")
        await this.deleteBlock(button.closest("[data-block-id]").dataset.blockId);
      if (action === "block-up" || action === "block-down")
        await this.moveBlock(button.closest("[data-block-id]").dataset.blockId, action === "block-up" ? -1 : 1);
      if (action === "transform-block")
        await this.transformActiveBlock(button.closest("[data-block-id]").dataset.blockId, button.dataset.type);
      if (action === "page-up" || action === "page-down")
        await this.movePage(button.closest("[data-page-id]").dataset.pageId, action === "page-up" ? -1 : 1);
      if (action === "add-list-item")
        this.addListItem(button.closest("[data-block-id]").dataset.blockId);
      if (action === "add-row")
        this.addTableRow(button.closest("[data-block-id]").dataset.blockId);
      if (action === "add-column")
        this.addTableColumn(button.closest("[data-block-id]").dataset.blockId);
      if (action === "delete-row")
        this.deleteTableRow(button.closest("[data-block-id]").dataset.blockId, button.closest("[data-row-id]").dataset.rowId);
      if (action === "slash-command")
        await this.applySlashCommand(button.dataset.command);
      if (action === "export-md")
        await this.exportMarkdown();
      if (action === "export-json")
        await this.exportJson();
      if (action === "clear-search")
        this.clearSearch();
      if (action === "open-search-result")
        await this.openSearchResult(button.dataset.pageId, button.dataset.blockId);
      if (action === "undo-structural")
        await this.undoStructural();
    } catch (error) {
      logger7.error("UI action failed", { context: { action, error: normalizeError(error) } });
      this.showError(error);
    }
  }
  handleInput(event) {
    const target = event.target;
    if (target.matches('[data-role="search"]')) {
      searchLogger.debug("Search input changed", { context: { length: target.value.length } });
      this.search(target.value);
      return;
    }
    if (target.matches('[data-role="page-title"]')) {
      const page = this.selectedPage();
      page.title = target.value;
      page.updatedAt = nowIso();
      logger7.debug("Page title edited", { context: { pageId: page.id, titleLength: target.value.length } });
      this.queuePageSave(page);
      this.renderPages();
      return;
    }
    const blockEl = target.closest("[data-block-id]");
    if (!blockEl)
      return;
    const block = this.findBlock(blockEl.dataset.blockId);
    if (!block)
      return;
    this.applyBlockInput(block, target);
    block.updatedAt = nowIso();
    if (target.matches("[data-rich-text]") && block.id === this.state.keyboardCreatedEmptyBlockId && block.content.text.trim()) {
      this.state.keyboardCreatedEmptyBlockId = "";
    }
    logger7.debug("Block edit detected", { context: { blockId: block.id, pageId: block.pageId, type: block.type, field: target.dataset.field || target.dataset.listItem || target.dataset.tableCell || target.dataset.tableCol || target.dataset.richText } });
    this.queueBlockSave(block);
    if (target.matches("[data-rich-text]"))
      this.updateSlashMenu(target, block);
  }
  handleChange(event) {
    if (event.target.matches("[data-field], [data-list-item], [data-table-cell], [data-table-col]"))
      this.handleInput(event);
  }
  async handleBlur(event) {
    if (event.target.matches("input, textarea, [contenteditable='true']")) {
      await this.storage.flush().catch((error) => {
        this.showError(error);
      });
    }
  }
  async handleSidebarResizeCommit(event) {
    if (!event.target.matches("awwbookmarklet-split-pane"))
      return;
    const value = normalizeSidebarWidth(event.detail.value);
    this.state.sidebarWidth = value;
    logger7.info("Sidebar width resize committed", { context: { value } });
    await this.storage.request("setSetting", { key: "sidebarWidth", value }).catch((error) => this.showError(error));
  }
  handleComposition(event, composing) {
    const editable = event.target.closest("[data-rich-text]");
    if (editable)
      editable.dataset.composing = composing ? "true" : "false";
  }
  async handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !isTextEditingTarget(event.target)) {
      event.preventDefault();
      await this.undoStructural();
      return;
    }
    const editable = event.target.closest("[data-rich-text]");
    if (!editable)
      return;
    if (this.state.slash?.open) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.closeSlashMenu("escape");
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        this.moveSlashSelection(event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        await this.applySlashCommand(this.state.slash.commands[this.state.slash.index]?.command);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey && editable.dataset.richText === "paragraph") {
      event.preventDefault();
      await this.splitParagraphBlock(editable);
      return;
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      await this.handleRichTextArrowNavigation(event, editable);
    }
  }
  async handlePaste(event) {
    const blocksContainer = event.target.closest('[data-role="blocks"]');
    const blockEl = event.target.closest("[data-block-id]");
    if (!blocksContainer && !blockEl)
      return;
    const page = this.selectedPage();
    if (!page)
      return;
    const html = event.clipboardData?.getData("text/html") || "";
    const text = event.clipboardData?.getData("text/plain") || "";
    if (!html && !text)
      return;
    event.preventDefault();
    logger7.info("Paste event received", { context: { hasHtml: Boolean(html), hasText: Boolean(text), textLength: text.length, htmlLength: html.length } });
    const editable = event.target.closest("[data-rich-text]");
    if (editable && !looksLikeMultiBlockPaste(html, text)) {
      this.captureBodyguardPaste(html || text);
      const inlineHtml = sanitizeInlineHtml(html || textToHtml(text));
      document.execCommand("insertHTML", false, inlineHtml);
      const block = this.findBlock(blockEl.dataset.blockId);
      if (block) {
        this.applyBlockInput(block, editable);
        block.updatedAt = nowIso();
        this.queueBlockSave(block);
        logger7.info("Sanitized inline paste inserted", { context: { blockId: block.id, htmlLength: inlineHtml.length } });
      }
      this.clearBodyguardPaste();
      return;
    }
    this.captureBodyguardPaste(html || text);
    const newBlocks = blocksFromClipboard({ pageId: page.id, html, text });
    logger7.info("Paste converted to blocks", { context: { pageId: page.id, blockCount: newBlocks.length, byType: countByType(newBlocks) } });
    const current = this.blocksForPage(page.id);
    const insertAt = blockEl ? current.findIndex((block) => block.id === blockEl.dataset.blockId) + 1 : current.length;
    current.splice(insertAt, 0, ...newBlocks);
    current.forEach((block, index) => block.sortOrder = (index + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== page.id).concat(current);
    await this.storage.request("replaceBlocks", { pageId: page.id, blocks: current });
    logger7.info("Pasted blocks persisted", { context: { pageId: page.id, totalBlockCount: current.length } });
    this.clearBodyguardPaste();
    this.renderEditor();
  }
  applyBlockInput(block, target) {
    const c = block.content;
    if (target.dataset.richText) {
      const normalized = normalizeRichTextContent({ html: sanitizeInlineHtml(target.innerHTML) });
      block.content = { ...c, ...normalized };
      return;
    }
    if (target.dataset.field) {
      c[target.dataset.field] = target.value;
      if (block.type === BLOCK_TYPES.sourceLink && target.dataset.field === "url")
        c.domain = deriveDomain(target.value);
    }
    if (target.dataset.listItem) {
      const item = c.items.find((entry) => entry.id === target.dataset.listItem);
      if (item)
        item.text = target.value;
    }
    if (target.dataset.tableCol) {
      const col = c.columns.find((entry) => entry.id === target.dataset.tableCol);
      if (col)
        col.label = target.value;
    }
    if (target.dataset.tableCell) {
      const [rowId, colId] = target.dataset.tableCell.split(":");
      const row = c.rows.find((entry) => entry.id === rowId);
      if (row)
        row.cells[colId] = target.value;
    }
  }
  async createPage(title, options = {}) {
    const page = createPage({ title, sortOrder: (this.state.pages.length + 1) * 1000 });
    const block = createBlock({ pageId: page.id, type: BLOCK_TYPES.paragraph, content: { text: "" } });
    logger7.info("Creating page", { context: { title, pageId: page.id, initialBlockId: block.id } });
    await this.storage.request("createPage", { page, blocks: [block] });
    this.state.pages.push(page);
    this.state.blocks.push(block);
    this.state.selectedPageId = page.id;
    this.render();
    if (options.focusTitle)
      requestAnimationFrame(() => this.focusPageTitle({ select: true }));
    logger7.info("Page created", { context: { pageId: page.id, blockCount: 1 } });
  }
  uniqueNewPageTitle() {
    const base = "New research page";
    const titles = new Set(this.state.pages.map((page) => page.title.trim()));
    if (!titles.has(base))
      return base;
    let counter = 2;
    while (titles.has(`${base} ${counter}`))
      counter += 1;
    return `${base} ${counter}`;
  }
  async selectPage(pageId) {
    await this.storage.flush();
    this.state.selectedPageId = pageId;
    await this.storage.request("setSetting", { key: "selectedPageId", value: pageId });
    this.render();
    logger7.info("Page selected", { context: { pageId } });
  }
  async addBlock(type) {
    const page = this.selectedPage();
    const block = createBlock({ pageId: page.id, type, sortOrder: (this.blocksForPage(page.id).length + 1) * 1000 });
    logger7.info("Adding block", { context: { pageId: page.id, blockId: block.id, type } });
    this.state.blocks.push(block);
    await this.storage.request("updateBlock", { block });
    this.renderEditor();
    return block;
  }
  async addParagraphAtEnd(options = {}) {
    const block = await this.addBlock(BLOCK_TYPES.paragraph);
    if (options.fromKeyboard)
      this.state.keyboardCreatedEmptyBlockId = block.id;
    requestAnimationFrame(() => this.focusBlock(block?.id, "start"));
    return block;
  }
  async splitParagraphBlock(editable) {
    const blockEl = editable.closest("[data-block-id]");
    const block = this.findBlock(blockEl?.dataset.blockId);
    const page = this.selectedPage();
    if (!block || !page)
      return;
    this.applyBlockInput(block, editable);
    block.updatedAt = nowIso();
    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((entry) => entry.id === block.id);
    const next = createBlock({ pageId: page.id, type: BLOCK_TYPES.paragraph, sortOrder: (index + 2) * 1000 });
    blocks.splice(index + 1, 0, next);
    blocks.forEach((entry, order) => entry.sortOrder = (order + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((entry) => entry.pageId !== page.id).concat(blocks);
    logger7.info("Paragraph split into new block", { context: { blockId: block.id, nextBlockId: next.id, pageId: page.id } });
    await this.storage.request("replaceBlocks", { pageId: page.id, blocks });
    this.renderEditor();
    requestAnimationFrame(() => this.focusBlock(next.id));
  }
  async deleteBlock(blockId) {
    const block = this.findBlock(blockId);
    if (!block)
      return;
    this.pushBlockUndo(block.pageId, "deleteBlock");
    this.state.blocks = this.state.blocks.filter((entry) => entry.id !== blockId);
    logger7.info("Deleting block", { context: { blockId } });
    await this.storage.request("deleteBlock", { blockId });
    this.renderEditor();
  }
  async moveBlock(blockId, direction) {
    const page = this.selectedPage();
    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((block) => block.id === blockId);
    const swap = index + direction;
    if (swap < 0 || swap >= blocks.length)
      return;
    this.pushBlockUndo(page.id, "moveBlock");
    [blocks[index], blocks[swap]] = [blocks[swap], blocks[index]];
    blocks.forEach((block, order) => block.sortOrder = (order + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== page.id).concat(blocks);
    logger7.info("Moving block", { context: { blockId, pageId: page.id, direction } });
    await this.storage.request("reorderBlocks", { blocks });
    this.renderEditor();
  }
  async transformActiveBlock(blockId, type) {
    const block = this.findBlock(blockId);
    if (!block || block.type === type)
      return;
    this.pushBlockUndo(block.pageId, "transformBlock");
    transformBlock(block, type);
    block.updatedAt = nowIso();
    logger7.info("Transforming block from local menu", { context: { blockId, type } });
    await this.storage.request("updateBlock", { block });
    this.renderEditor();
    requestAnimationFrame(() => this.focusBlock(block.id));
  }
  async handleRichTextArrowNavigation(event, editable) {
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const atBoundary = direction > 0 ? isCaretOnLastVisualLine(editable) : isCaretOnFirstVisualLine(editable);
    if (!atBoundary)
      return;
    const blockEl = editable.closest("[data-block-id]");
    const blockId = blockEl?.dataset.blockId;
    const page = this.selectedPage();
    if (!blockId || !page)
      return;
    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index < 0)
      return;
    if (direction < 0) {
      const previous = blocks[index - 1];
      if (!previous)
        return;
      event.preventDefault();
      this.focusBlock(previous.id, "end");
      return;
    }
    const next = blocks[index + 1];
    if (next) {
      event.preventDefault();
      this.focusBlock(next.id, "start");
      return;
    }
    const current = blocks[index];
    if (!blockHasText(current) || current.id === this.state.keyboardCreatedEmptyBlockId)
      return;
    event.preventDefault();
    await this.addParagraphAtEnd({ fromKeyboard: true });
  }
  async movePage(pageId, direction) {
    const pages = sortByOrder(this.state.pages);
    const index = pages.findIndex((page) => page.id === pageId);
    const swap = index + direction;
    if (swap < 0 || swap >= pages.length)
      return;
    [pages[index], pages[swap]] = [pages[swap], pages[index]];
    pages.forEach((page, order) => page.sortOrder = (order + 1) * 1000);
    this.state.pages = pages;
    logger7.info("Moving page", { context: { pageId, direction } });
    await this.storage.request("reorderPages", { pages });
    this.renderPages();
  }
  addListItem(blockId) {
    const block = this.findBlock(blockId);
    if (!block)
      return;
    block.content.items.push({ id: createId2("item"), text: "" });
    this.queueBlockSave(block);
    this.renderEditor();
  }
  addTableRow(blockId) {
    const block = this.findBlock(blockId);
    if (!block)
      return;
    block.content.rows.push({ id: createId2("row"), cells: Object.fromEntries(block.content.columns.map((col) => [col.id, ""])) });
    this.queueBlockSave(block);
    this.renderEditor();
  }
  addTableColumn(blockId) {
    const block = this.findBlock(blockId);
    if (!block)
      return;
    const col = { id: createId2("col"), label: `Column ${block.content.columns.length + 1}` };
    block.content.columns.push(col);
    block.content.rows.forEach((row) => row.cells[col.id] = "");
    this.queueBlockSave(block);
    this.renderEditor();
  }
  deleteTableRow(blockId, rowId) {
    const block = this.findBlock(blockId);
    if (!block)
      return;
    block.content.rows = block.content.rows.filter((row) => row.id !== rowId);
    if (!block.content.rows.length) {
      block.content.rows.push({ id: createId2("row"), cells: Object.fromEntries(block.content.columns.map((col) => [col.id, ""])) });
    }
    this.queueBlockSave(block);
    this.renderEditor();
  }
  pushBlockUndo(pageId, reason) {
    const blocks = this.blocksForPage(pageId).map(cloneRecord);
    this.undoStack.push({ type: "restoreBlocks", pageId, reason, blocks });
    if (this.undoStack.length > 100)
      this.undoStack.shift();
    logger7.debug("Structural undo checkpoint created", { context: { pageId, reason, blockCount: blocks.length, depth: this.undoStack.length } });
  }
  async undoStructural() {
    const entry = this.undoStack.pop();
    if (!entry) {
      logger7.debug("Structural undo requested with empty stack");
      return;
    }
    if (entry.type !== "restoreBlocks")
      return;
    const restored = entry.blocks.map((block, index) => ({ ...cloneRecord(block), deletedAt: null, sortOrder: (index + 1) * 1000, updatedAt: nowIso() }));
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== entry.pageId).concat(restored);
    await this.storage.request("replaceBlocks", { pageId: entry.pageId, blocks: restored });
    logger7.info("Structural undo restored page blocks", { context: { pageId: entry.pageId, reason: entry.reason, blockCount: restored.length } });
    this.renderEditor();
  }
  async search(query) {
    const run = ++this.searchRun;
    if (!query.trim()) {
      this.state.searchResults = [];
      this.renderSearchResults();
      return;
    }
    const results = await this.storage.request("search", { query }).catch((error) => {
      searchLogger.error("Search failed", { context: { query, error: normalizeError(error) } });
      this.showError(error);
      return [];
    });
    if (run !== this.searchRun)
      return;
    this.state.searchResults = results;
    searchLogger.info("Search completed", { context: { query, resultCount: results.length } });
    this.renderSearchResults();
  }
  clearSearch() {
    this.searchRun++;
    this.root.querySelector('[data-role="search"]').value = "";
    this.state.searchResults = [];
    this.renderSearchResults();
    searchLogger.info("Search cleared");
  }
  async openSearchResult(pageId, blockId) {
    await this.selectPage(pageId);
    this.state.focusedBlockId = blockId || "";
    this.renderEditor();
    searchLogger.info("Search result opened", { context: { pageId, blockId } });
    if (blockId)
      requestAnimationFrame(() => this.root.querySelector(`[data-block-id="${CSS.escape(blockId)}"]`)?.scrollIntoView({ block: "center" }));
  }
  async exportMarkdown() {
    exportLogger.info("Markdown export requested", { context: { selectedPageId: this.state.selectedPageId } });
    await this.storage.flush();
    const page = this.selectedPage();
    if (!page)
      return;
    exportLogger.info("Markdown export prepared", { context: { pageId: page.id, blockCount: this.blocksForPage(page.id).length } });
    downloadText(filenameForPage(page, "md"), pageToMarkdown(page, this.blocksForPage(page.id)), "text/markdown");
  }
  async exportJson() {
    exportLogger.info("JSON backup requested");
    await this.storage.flush();
    const workspace = await this.storage.request("exportWorkspace");
    exportLogger.info("JSON backup prepared", { context: { pageCount: workspace.pages.length, blockCount: workspace.blocks.length } });
    downloadText("topic-research-notepad-backup.json", JSON.stringify(workspaceToBackup(workspace), null, 2), "application/json");
  }
  selectedPage() {
    return this.state.pages.find((page) => page.id === this.state.selectedPageId) || this.state.pages[0] || null;
  }
  blocksForPage(pageId) {
    return sortByOrder(this.state.blocks.filter((block) => block.pageId === pageId && !block.deletedAt));
  }
  findBlock(blockId) {
    return this.state.blocks.find((block) => block.id === blockId);
  }
  queuePageSave(page) {
    this.storage.savePageDebounced(page).catch((error) => this.showError(error));
  }
  queueBlockSave(block) {
    this.storage.saveBlockDebounced(block).catch((error) => this.showError(error));
  }
  showError(error) {
    logger7.error("User-visible error", { context: { error: normalizeError(error), selectedPageId: this.state.selectedPageId } });
    this.state.error = error?.message || String(error);
    this.renderError();
  }
  updateSlashMenu(editable, block) {
    if (editable.dataset.composing === "true" || block.type !== BLOCK_TYPES.paragraph)
      return;
    const text = editable.textContent.trim();
    const match = parseSlashCommandText(text);
    if (!match) {
      if (this.state.slash?.open)
        this.closeSlashMenu("non-command-text");
      return;
    }
    const commands = slashCommands().filter((entry) => entry.command.startsWith(match) || entry.aliases.some((alias) => alias.startsWith(match)));
    if (!commands.length) {
      this.closeSlashMenu("no-match");
      return;
    }
    this.state.slash = { open: true, blockId: block.id, commands, index: 0 };
    logger7.debug("Slash command menu opened", { context: { blockId: block.id, fragment: match, commandCount: commands.length } });
    this.renderSlashMenu();
  }
  renderSlashMenu() {
    const menu = this.root.querySelector('[data-role="slash-menu"]');
    if (!menu || !this.state.slash?.open)
      return;
    const blockEl = this.root.querySelector(`[data-block-id="${CSS.escape(this.state.slash.blockId)}"]`);
    const rect = blockEl?.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    menu.hidden = false;
    menu.style.left = `${Math.max(12, (rect?.left || rootRect.left) - rootRect.left + 18)}px`;
    menu.style.top = `${Math.max(12, (rect?.bottom || rootRect.top) - rootRect.top + 2)}px`;
    menu.innerHTML = this.state.slash.commands.map((entry, index) => `
      <button class="trn-slash-item ${index === this.state.slash.index ? "selected" : ""}" data-action="slash-command" data-command="${entry.command}">
        <strong>${entry.label}</strong><span>${entry.hint}</span>
      </button>
    `).join("");
  }
  moveSlashSelection(delta) {
    const slash = this.state.slash;
    if (!slash?.open)
      return;
    slash.index = (slash.index + delta + slash.commands.length) % slash.commands.length;
    this.renderSlashMenu();
  }
  closeSlashMenu(reason) {
    if (this.state.slash?.open)
      logger7.debug("Slash command menu closed", { context: { reason } });
    this.state.slash = null;
    const menu = this.root.querySelector('[data-role="slash-menu"]');
    if (menu) {
      menu.hidden = true;
      menu.innerHTML = "";
    }
  }
  async applySlashCommand(command) {
    const slash = this.state.slash;
    const targetType = slashCommands().find((entry) => entry.command === command)?.type;
    if (!slash?.blockId || !targetType)
      return;
    const block = this.findBlock(slash.blockId);
    if (!block)
      return;
    try {
      block.content = normalizeRichTextContent({ text: "" });
      transformBlock(block, targetType);
      block.updatedAt = nowIso();
      logger7.info("Slash command selected", { context: { blockId: block.id, command, targetType } });
      await this.storage.request("updateBlock", { block });
      this.closeSlashMenu("selected");
      this.renderEditor();
      requestAnimationFrame(() => this.focusBlock(block.id));
    } catch (error) {
      this.showError(error);
    }
  }
  focusPageTitle({ select = false } = {}) {
    const input = this.root.querySelector('[data-role="page-title"]');
    if (!input)
      return;
    input.focus();
    if (select)
      input.select();
  }
  focusBlock(blockId, position = "start") {
    const target = this.root.querySelector(`[data-block-id="${CSS.escape(blockId)}"] [data-rich-text], [data-block-id="${CSS.escape(blockId)}"] textarea, [data-block-id="${CSS.escape(blockId)}"] input`);
    if (!target)
      return;
    target.focus();
    setCaretPosition(target, position);
  }
  captureBodyguardPaste(html) {
    const pastebin = this.root.querySelector('[data-role="pastebin"]');
    if (!pastebin)
      return;
    pastebin.innerHTML = sanitizeInlineHtml(html);
    logger7.debug("Bodyguard pastebin captured payload", { context: { htmlLength: String(html || "").length, storedLength: pastebin.innerHTML.length } });
  }
  clearBodyguardPaste() {
    const pastebin = this.root.querySelector('[data-role="pastebin"]');
    if (pastebin)
      pastebin.innerHTML = "";
  }
  getRuntimeSnapshot() {
    return {
      storageMode: "worker",
      selectedPageId: this.state.selectedPageId,
      pageCount: this.state.pages.length,
      blockCount: this.state.blocks.length,
      status: this.state.status,
      lastError: this.state.error,
      undoDepth: this.undoStack.length
    };
  }
  bindLifecycleFlush() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden")
        this.storage.flush().catch((error) => this.showError(error));
    });
    window.addEventListener("pagehide", () => this.storage.flush().catch((error) => this.showError(error)));
  }
}
function countByType(blocks) {
  return blocks.reduce((counts, block) => {
    counts[block.type] = (counts[block.type] || 0) + 1;
    return counts;
  }, {});
}
function labelForType(type) {
  return {
    paragraph: "Paragraph",
    heading: "Heading",
    quote: "Quote",
    list: "List",
    table: "Table",
    code: "Code",
    sourceLink: "Source"
  }[type] || type;
}
function validTransformsFor(type) {
  return BLOCK_TRANSFORMS[type] || [];
}
function richTextEditable(block, variant, placeholder) {
  const content = normalizeRichTextContent(block.content || {});
  return `<div
    class="trn-rich-text trn-rich-text--${variant}"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    aria-label="${escapeAttr(placeholder)}"
    data-rich-text="${escapeAttr(variant)}"
    data-placeholder="${escapeAttr(placeholder)}"
  >${content.html}</div>`;
}
function parseSlashCommandText(text) {
  const trimmed = String(text || "").trim();
  return /^\/[a-z]*$/.test(trimmed) ? trimmed.slice(1) : null;
}
function slashCommands() {
  return [
    { command: "paragraph", aliases: ["p"], type: BLOCK_TYPES.paragraph, label: "Paragraph", hint: "Plain research text" },
    { command: "heading", aliases: ["h"], type: BLOCK_TYPES.heading, label: "Heading", hint: "Section heading" },
    { command: "quote", aliases: ["q"], type: BLOCK_TYPES.quote, label: "Quote", hint: "Quoted passage" },
    { command: "list", aliases: ["li"], type: BLOCK_TYPES.list, label: "List", hint: "Bullet list" },
    { command: "table", aliases: ["tbl"], type: BLOCK_TYPES.table, label: "Table", hint: "Simple research table" },
    { command: "code", aliases: ["pre"], type: BLOCK_TYPES.code, label: "Code", hint: "Code or command block" },
    { command: "source", aliases: ["src"], type: BLOCK_TYPES.sourceLink, label: "Source", hint: "Research reference" }
  ];
}
function looksLikeMultiBlockPaste(html, text) {
  if (html && /<(h[1-6]|p|div|blockquote|ul|ol|li|table|pre)\b/i.test(html))
    return true;
  return /\n\s*\n/.test(text || "");
}
function textToHtml(text) {
  return escapeHtml2(text).replace(/\n/g, "<br>");
}
function normalizeSidebarWidth(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(520, Math.max(180, Math.round(numeric))) : 280;
}
function statusText(status) {
  if (status?.state === "saved")
    return "saved locally";
  if (status?.state === "saving")
    return "saving locally";
  if (status?.state === "dirty")
    return "unsaved changes";
  if (status?.state === "failed")
    return "save failed";
  if (status?.state === "loading")
    return "opening local storage";
  return String(status?.detail || status?.state || "");
}
function cloneRecord(value) {
  return JSON.parse(JSON.stringify(value));
}
function isTextEditingTarget(target) {
  return Boolean(target?.closest?.("input, textarea, [contenteditable='true']"));
}
function blockHasText(block) {
  if (!block)
    return false;
  if (typeof block.content?.text === "string")
    return Boolean(block.content.text.trim());
  if (Array.isArray(block.content?.items))
    return block.content.items.some((item) => String(item.text || "").trim());
  return Boolean(Object.values(block.content || {}).some((value) => typeof value === "string" && value.trim()));
}
function setCaretPosition(target, position) {
  const atEnd = position === "end";
  if (target.matches("input, textarea")) {
    const valueLength = target.value.length;
    const offset = atEnd ? valueLength : 0;
    target.setSelectionRange?.(offset, offset);
    return;
  }
  if (!target.matches("[contenteditable='true']"))
    return;
  const selection = window.getSelection();
  if (!selection)
    return;
  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(!atEnd);
  selection.removeAllRanges();
  selection.addRange(range);
}
function isCaretOnFirstVisualLine(editable) {
  return isCaretOnVisualBoundary(editable, "first");
}
function isCaretOnLastVisualLine(editable) {
  return isCaretOnVisualBoundary(editable, "last");
}
function isCaretOnVisualBoundary(editable, boundary) {
  const selection = window.getSelection();
  if (!selection?.rangeCount || !selection.isCollapsed)
    return false;
  const activeRange = selection.getRangeAt(0);
  if (!editable.contains(activeRange.startContainer))
    return false;
  if (!editable.textContent.trim())
    return true;
  const caretRect = caretRectForRange(activeRange);
  if (!caretRect)
    return fallbackBoundaryByOffset(editable, activeRange, boundary);
  const contentRange = document.createRange();
  contentRange.selectNodeContents(editable);
  const rects = [...contentRange.getClientRects()].filter((rect) => rect.height > 0);
  contentRange.detach?.();
  if (!rects.length)
    return fallbackBoundaryByOffset(editable, activeRange, boundary);
  const firstTop = Math.min(...rects.map((rect) => rect.top));
  const lastBottom = Math.max(...rects.map((rect) => rect.bottom));
  const lineHeight = parseFloat(getComputedStyle(editable).lineHeight) || caretRect.height || 18;
  const tolerance = Math.max(3, Math.min(10, lineHeight * 0.45));
  return boundary === "first" ? caretRect.top <= firstTop + tolerance : caretRect.bottom >= lastBottom - tolerance;
}
function caretRectForRange(range) {
  const direct = range.getClientRects?.()[0] || null;
  if (direct && direct.height > 0)
    return direct;
  const marker = document.createElement("span");
  marker.textContent = "​";
  const selection = window.getSelection();
  const restored = range.cloneRange();
  range.insertNode(marker);
  const rect = marker.getBoundingClientRect();
  marker.remove();
  selection?.removeAllRanges();
  selection?.addRange(restored);
  return rect.height || rect.width ? rect : null;
}
function fallbackBoundaryByOffset(editable, range, boundary) {
  const probe = range.cloneRange();
  probe.selectNodeContents(editable);
  if (boundary === "first") {
    probe.setEnd(range.startContainer, range.startOffset);
    return !probe.toString();
  }
  probe.setStart(range.startContainer, range.startOffset);
  return !probe.toString();
}
function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}
function escapeHtml2(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function escapeAttr(value) {
  return escapeHtml2(value);
}

// src/main.js
var logger8 = createLogger("App", "Bootstrap");
logger8.info("App bootstrap start", {
  context: {
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    dataFormatVersion: APP_DATA_FORMAT_VERSION,
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    workerProtocolVersion: WORKER_PROTOCOL_VERSION,
    indexedDbAvailable: typeof indexedDB !== "undefined",
    workerAvailable: typeof Worker !== "undefined",
    cryptoUuidAvailable: Boolean(globalThis.crypto?.randomUUID)
  }
});
setTheme({
  [PUBLIC_TOKENS.workspaceBg]: "#cfd5dd",
  [PUBLIC_TOKENS.windowBg]: "#e9edf2",
  [PUBLIC_TOKENS.panelBg]: "#f4f6f8",
  [PUBLIC_TOKENS.selectionBg]: "#315f99",
  [PUBLIC_TOKENS.focusRing]: "#174f9c",
  [PUBLIC_TOKENS.radiusControl]: "2px",
  [PUBLIC_TOKENS.radiusSurface]: "4px",
  [PUBLIC_TOKENS.radiusWindow]: "4px"
});
var root = document.querySelector("#app");
var workerUrl = new URL(import.meta.url.includes("/assets/") ? "../storage-worker.js" : "./storage-worker.js", import.meta.url);
logger8.info("Creating storage client", { context: { workerUrl: workerUrl.href, storageMode: "worker" } });
var storage = new StorageClient({ workerUrl });
var app = new TopicResearchApp({ root, storage });
installDebugHook({
  getRuntimeSnapshot: () => app.getRuntimeSnapshot()
});
app.start();

//# debugId=46B6694DE4601B9964756E2164756E21
//# sourceMappingURL=main.js.map
