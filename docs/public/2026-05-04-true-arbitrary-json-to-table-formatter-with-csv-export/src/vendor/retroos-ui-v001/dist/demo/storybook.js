// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/constants.js
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
  contextPanel: "awwbookmarklet-context-panel"
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/define.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/styles.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/desktop-root.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/geometry.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/window.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/commands.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/themes/default-theme.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/theme.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/menubar.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/menu.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/button.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/icon-button.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/form-attributes.js
var FORM_ARIA_ATTRIBUTES = ["aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"];

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/input.js
var INPUT_STYLES = css`
  :host { display: inline-block; min-width: 140px; }
  :host([wide]) { display: block; width: 100%; }

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
var MIRRORED_ATTRIBUTES = ["value", "placeholder", "disabled", "type", "name", "required", "min", "max", "step", "maxlength", "minlength", "autocomplete", "spellcheck", "list", ...FORM_ARIA_ATTRIBUTES];

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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/textarea.js
var TEXTAREA_STYLES = css`
  :host { display: inline-block; min-width: 220px; }
  :host([wide]) { display: block; width: 100%; }

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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/checkbox.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/radio.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/select.js
var SELECT_STYLES = css`
  :host { display: inline-block; min-width: 160px; }
  :host([wide]) { display: block; width: 100%; }

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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/range.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/progress.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/tabs.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/listbox.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/group.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/panel.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/statusbar.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/app-shell.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/component-utils.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/toolbar.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/field.js
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
    flex: 1;
    min-width: 0;
  }

  .main {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  /* Hidden by default — no dead space when no help/error text is active */
  .message {
    display: none;
    min-height: 0;
    color: var(--awwbookmarklet-text-help, #657184);
    font-size: 12px;
    line-height: 1.3;
  }

  /* Reveal when content is present */
  :host([help]) .message,
  :host([error]) .message,
  :host([data-invalid="true"]) .message {
    display: block;
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/status-line.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/alert.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/overlay.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/dialog.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/toast.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/empty-state.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/state-overlay.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/list.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/list-item.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/card.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/sanitize.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/rich-preview.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/browser-panel.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/manual-copy.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/command-palette.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/shortcut-help.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/url.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/url-picker.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/metric-card.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/clipboard.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/context-segments.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/segment-strip.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/context-bar.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/status-strip.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/titlebar.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/context-panel.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/components/register-all.js
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
    [TAGS.contextPanel, AwwContextPanel]
  ]);
}

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/icons/retro-icons.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/window-manager.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/core/runtime.js
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

// ../../../../../../C:/Home/my-github/unsafe-link-preview-browser-extension/src/vendor/retroos-ui-v001/src/demo/storybook.js
registerAllComponents();
function esc(html) {
  return String(html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function tag(name) {
  return `awwbookmarklet-${name}`;
}
var CATEGORIES = [
  {
    id: "primitives",
    label: "Primitive Controls",
    stories: [
      {
        id: "button",
        name: "Button",
        tag: tag("button"),
        category: "primitive",
        description: "A pressable control that fires a native click event and optionally dispatches a command request. Covers all use cases that a plain HTML button covers — form submission, dialog actions, toolbar actions — while staying themed by framework tokens.",
        usage: "Compose inside `awwbookmarklet-toolbar` or dialog footer slots. Use `variant='primary'` for the one dominant action per surface. Use `tone` only when semantic meaning (danger, warning, success) helps the user.",
        attrs: [
          { name: "variant", type: "string", default: "(default)", values: "primary | ghost | link", desc: "Visual weight. `primary` = filled; `ghost` = borderless; `link` = text-style." },
          { name: "tone", type: "string", values: "danger | warning | success", desc: "Semantic tint on the default variant. Affects border and text color." },
          { name: "disabled", type: "boolean", desc: "Prevents interaction and dims the control." },
          { name: "busy", type: "boolean", desc: "Shows progress cursor; suppresses clicks until cleared." },
          { name: "pressed", type: "boolean", desc: "Toggles aria-pressed and sunken-button visual state for toggle buttons." },
          { name: "command", type: "string", desc: "When set, clicking dispatches `awwbookmarklet-command-request` with this command ID bubbling up to a command registry listener." }
        ],
        events: [
          { name: "click", desc: "Native click re-dispatched as bubbling + composed. Blocked when disabled or busy." },
          { name: "awwbookmarklet-command-request", desc: "Bubbles when `command` attribute is set. `detail: { commandId, source }`." }
        ],
        slots: [{ name: "", desc: "Button label content (text or icon+text)." }],
        parts: [{ name: "control", desc: "The inner `<button>` element for padding/radius overrides." }],
        examples: [
          {
            label: "Variants",
            html: `<${tag("button")} variant="primary">Primary</${tag("button")}><${tag("button")}>Default</${tag("button")}><${tag("button")} variant="ghost">Ghost</${tag("button")}><${tag("button")} variant="link">Link</${tag("button")}>`
          },
          {
            label: "Tones",
            html: `<${tag("button")} tone="danger">Danger</${tag("button")}><${tag("button")} tone="warning">Warning</${tag("button")}><${tag("button")} tone="success">Success</${tag("button")}>`
          },
          {
            label: "States",
            html: `<${tag("button")} disabled>Disabled</${tag("button")}><${tag("button")} busy>Busy…</${tag("button")}><${tag("button")} pressed>Pressed</${tag("button")}>`
          }
        ]
      },
      {
        id: "icon-button",
        name: "Icon Button",
        tag: tag("icon-button"),
        category: "primitive",
        description: "A square icon-only button with an accessible label. Used in toolbars, titlebars, and browser toolbars. The inner SVG content is provided via slot; the `label` attribute becomes the aria-label.",
        usage: "Always provide `label` — it is the accessible name. Do not use icon buttons where a labelled text button is more appropriate. Use `pressed` for toggle actions (e.g., bold, fullscreen).",
        attrs: [
          { name: "label", type: "string", desc: "(required) Accessible label announced by screen readers." },
          { name: "disabled", type: "boolean", desc: "Prevents interaction." },
          { name: "pressed", type: "boolean", desc: "Toggles pressed/depressed visual state for toggles." },
          { name: "command", type: "string", desc: "Dispatches `awwbookmarklet-command-request` on click." }
        ],
        events: [
          { name: "click", desc: "Bubbling click. Blocked when disabled." },
          { name: "awwbookmarklet-command-request", desc: "Fires when `command` attribute is set." }
        ],
        slots: [{ name: "", desc: "SVG icon or icon component." }],
        parts: [{ name: "control", desc: "The inner `<button>` element." }],
        examples: [
          {
            label: "Default, pressed, disabled",
            html: `<${tag("icon-button")} label="Refresh">${iconSvg("refresh")}</${tag("icon-button")}><${tag("icon-button")} label="Star" pressed>${iconSvg("star")}</${tag("icon-button")}><${tag("icon-button")} label="Close" disabled>${iconSvg("close")}</${tag("icon-button")}>`
          }
        ]
      },
      {
        id: "input",
        name: "Input",
        tag: tag("input"),
        category: "primitive",
        description: "A single-line text input. Wraps a native `<input>` in Shadow DOM so it inherits framework tokens (height, border, padding, colors). Mirrors most native input attributes. Use `wide` to fill a field container.",
        usage: "Always wrap in `awwbookmarklet-field` when you need a visible label. Read `value` from the component property or listen to `input`/`change` events. Use `type='number'` or `type='password'` as with native inputs.",
        attrs: [
          { name: "value", type: "string", desc: "Current field value." },
          { name: "placeholder", type: "string", desc: "Placeholder text." },
          { name: "type", type: "string", default: "text", desc: "Any native input type (text, number, password, email, url, etc.)." },
          { name: "disabled", type: "boolean", desc: "Disables the control." },
          { name: "required", type: "boolean", desc: "Marks the field as required." },
          { name: "wide", type: "boolean", desc: "Switches to block display, fills parent width." },
          { name: "maxlength", type: "number", desc: "Maximum character count." },
          { name: "minlength", type: "number", desc: "Minimum character count." },
          { name: "min", type: "string", desc: "Minimum value (for numeric/date types)." },
          { name: "max", type: "string", desc: "Maximum value." },
          { name: "step", type: "string", desc: "Step increment (for numeric types)." },
          { name: "autocomplete", type: "string", desc: "Passed through to native input." },
          { name: "list", type: "string", desc: "ID of a `<datalist>` element for suggestions." }
        ],
        events: [
          { name: "input", desc: "Fires on every keystroke (value change). Bubbling + composed." },
          { name: "change", desc: "Fires on blur/commit. Bubbling + composed." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<input>` element." }],
        examples: [
          {
            label: "Text and placeholder",
            html: `<${tag("input")} value="hello" /><${tag("input")} placeholder="Enter URL…" type="url" />`
          },
          {
            label: "Number and disabled",
            html: `<${tag("input")} type="number" value="42" min="0" max="100" /><${tag("input")} value="read-only" disabled />`
          },
          {
            label: "Wide (fill container)",
            layout: "block",
            html: `<${tag("input")} wide placeholder="Full-width input…" />`
          }
        ]
      },
      {
        id: "textarea",
        name: "Textarea",
        tag: tag("textarea"),
        category: "primitive",
        description: "A multi-line text input. Mirrors native `<textarea>` attributes. Use `rows` to control visible height. Use `wide` to fill its container.",
        usage: "Pair with `awwbookmarklet-field` for labels. The `value` property reflects the current content; listen to `input` events for live changes.",
        attrs: [
          { name: "value", type: "string", desc: "Current text content." },
          { name: "placeholder", type: "string", desc: "Placeholder text." },
          { name: "rows", type: "number", default: "3", desc: "Visible row count." },
          { name: "disabled", type: "boolean", desc: "Disables the control." },
          { name: "required", type: "boolean", desc: "Marks field as required." },
          { name: "wide", type: "boolean", desc: "Block display, fills parent width." },
          { name: "maxlength", type: "number", desc: "Maximum character count." },
          { name: "minlength", type: "number", desc: "Minimum character count." }
        ],
        events: [
          { name: "input", desc: "Fires on every keystroke." },
          { name: "change", desc: "Fires on blur/commit." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<textarea>` element." }],
        examples: [
          {
            label: "Basic",
            html: `<${tag("textarea")} rows="3" placeholder="Enter notes…" />`
          },
          {
            label: "Wide + pre-filled",
            layout: "block",
            html: `<${tag("textarea")} wide rows="4" value="Multi-line
content here" />`
          }
        ]
      },
      {
        id: "select",
        name: "Select",
        tag: tag("select"),
        category: "primitive",
        description: "A styled dropdown select. Options are provided as child `<option>` elements (light DOM) — the component uses a MutationObserver to keep them in sync with the shadow `<select>`. Use `wide` to fill the container.",
        usage: "Listen for `change` events (not `input`) to detect selection. Reading `value` from the component property returns the selected option's value. Provide `<option>` children directly inside the element.",
        attrs: [
          { name: "value", type: "string", desc: "Currently selected value." },
          { name: "disabled", type: "boolean", desc: "Disables the dropdown." },
          { name: "required", type: "boolean", desc: "Marks field as required." },
          { name: "wide", type: "boolean", desc: "Block display, fills parent width." },
          { name: "name", type: "string", desc: "Field name for form submission." }
        ],
        events: [
          { name: "change", desc: "Fires when selection changes. Bubbling + composed." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<select>` element." }],
        examples: [
          {
            label: "Basic dropdown",
            html: `<${tag("select")}><option>Preview</option><option>Capture</option><option>Export</option></${tag("select")}>`
          },
          {
            label: "Wide + disabled",
            layout: "block",
            html: `<${tag("select")} wide disabled><option>Disabled option</option></${tag("select")}>`
          }
        ]
      },
      {
        id: "checkbox",
        name: "Checkbox",
        tag: tag("checkbox"),
        category: "primitive",
        description: "A styled checkbox with an inline label. The label text is slotted inside the element. Mirrors native `checked`, `disabled`, `name`, `value` attributes.",
        usage: "Use the `checked` attribute/property to control state programmatically. Listen to `change` events. For groups of checkboxes, wrap in `awwbookmarklet-group`.",
        attrs: [
          { name: "checked", type: "boolean", desc: "Checked state." },
          { name: "disabled", type: "boolean", desc: "Disables the control." },
          { name: "name", type: "string", desc: "Field name for form grouping." },
          { name: "value", type: "string", default: "on", desc: "Submitted value when checked." }
        ],
        events: [{ name: "change", desc: "Fires on check/uncheck. Bubbling + composed." }],
        slots: [{ name: "", desc: "Label text or content." }],
        parts: [{ name: "control", desc: "The inner `<input type='checkbox'>`." }, { name: "label", desc: "The label text span." }],
        examples: [
          {
            label: "Checked, unchecked, disabled",
            html: `<${tag("checkbox")} checked>Capture metadata</${tag("checkbox")}><${tag("checkbox")}>Include timestamps</${tag("checkbox")}><${tag("checkbox")} disabled>Unavailable option</${tag("checkbox")}>`
          }
        ]
      },
      {
        id: "radio",
        name: "Radio",
        tag: tag("radio"),
        category: "primitive",
        description: "A styled radio button with an inline label. Same API as `awwbookmarklet-checkbox` but renders as a radio input. Group multiple radios by giving them the same `name` attribute.",
        usage: "Give all options in a group the same `name`. Listen to `change` events on each radio or delegate to a parent element. Use `awwbookmarklet-group` to visually wrap the group.",
        attrs: [
          { name: "checked", type: "boolean", desc: "Selected state." },
          { name: "disabled", type: "boolean", desc: "Disables this radio." },
          { name: "name", type: "string", desc: "(required) Group name — must match across all options." },
          { name: "value", type: "string", desc: "The value associated with this option." }
        ],
        events: [{ name: "change", desc: "Fires when this radio is selected." }],
        slots: [{ name: "", desc: "Label text." }],
        parts: [{ name: "control", desc: "The inner `<input type='radio'>`." }, { name: "label", desc: "The label text span." }],
        examples: [
          {
            label: "Radio group",
            layout: "col",
            html: `<${tag("radio")} name="mode" value="visible" checked>Visible viewport</${tag("radio")}><${tag("radio")} name="mode" value="full">Full page</${tag("radio")}><${tag("radio")} name="mode" value="selection">Selection only</${tag("radio")}>`
          }
        ]
      },
      {
        id: "range",
        name: "Range",
        tag: tag("range"),
        category: "primitive",
        description: "A slider control for numeric ranges. Wraps a native `<input type='range'>` with framework accent color applied. Use `min`, `max`, `step` for constraint.",
        usage: "Listen to `input` for live updates as the user drags. Listen to `change` for the committed value. Pair with a value readout `<span>` updated via JS.",
        attrs: [
          { name: "value", type: "string", desc: "Current numeric value as string." },
          { name: "min", type: "string", default: "0", desc: "Minimum value." },
          { name: "max", type: "string", default: "100", desc: "Maximum value." },
          { name: "step", type: "string", default: "1", desc: "Step increment." },
          { name: "disabled", type: "boolean", desc: "Disables the slider." },
          { name: "name", type: "string", desc: "Field name." }
        ],
        events: [
          { name: "input", desc: "Fires on every drag move." },
          { name: "change", desc: "Fires on release/commit." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<input type='range'>`." }],
        examples: [
          {
            label: "Basic range",
            layout: "block",
            html: `<${tag("range")} value="60" min="0" max="100" />`
          }
        ]
      },
      {
        id: "progress",
        name: "Progress",
        tag: tag("progress"),
        category: "primitive",
        description: "A progress bar component. Wraps a native `<progress>` element with framework styling. Use for determinate (with `value`/`max`) or indeterminate (without `value`) progress.",
        usage: "For short operations, show the bar inline. For longer background work, show inside a dialog or status bar. Use `value` and `max` attributes to reflect completion percentage.",
        attrs: [
          { name: "value", type: "number", desc: "Current progress value. Omit for indeterminate." },
          { name: "max", type: "number", default: "100", desc: "Total value representing 100% completion." }
        ],
        events: [],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<progress>` element." }],
        examples: [
          {
            label: "Determinate and indeterminate",
            layout: "col",
            html: `<${tag("progress")} value="68" max="100"></${tag("progress")}><${tag("progress")}></${tag("progress")}>`
          }
        ]
      }
    ]
  },
  {
    id: "form",
    label: "Form Composition",
    stories: [
      {
        id: "field",
        name: "Field",
        tag: tag("field"),
        category: "compound",
        description: "A form field wrapper that pairs a label with any control component. Manages aria-labelledby, aria-describedby, aria-invalid, required/disabled propagation automatically. Supports vertical (default), horizontal, and inline layout orientations. The message row (help/error text) is hidden by default and only takes space when content is active.",
        usage: "Place any `awwbookmarklet-*` control or native input as the default slot child. Use `label` attribute for the text label, `help` for description, `error` to show validation messages. Add `wide` to both the field and the inner control to fill the container.",
        attrs: [
          { name: "label", type: "string", desc: "Label text (rendered in a `<label>` element)." },
          { name: "help", type: "string", desc: "Hint text shown below the control." },
          { name: "error", type: "string", desc: "Validation error message. Sets `aria-invalid` on the slotted control." },
          { name: "required", type: "boolean", desc: "Appends ` *` to label; mirrors `required` to slotted control." },
          { name: "disabled", type: "boolean", desc: "Dims field and mirrors `disabled` to slotted control." },
          { name: "orientation", type: "string", default: "vertical", values: "vertical | horizontal | inline", desc: "Layout of label vs control. `horizontal` uses a two-column grid; `inline` uses flex." },
          { name: "wide", type: "boolean", desc: "Block display, fills container width." },
          { name: "tone", type: "string", values: "info | success | warning | danger", desc: "Manual tone override (independent of `error`)." }
        ],
        events: [],
        slots: [
          { name: "", desc: "The main control (input, select, etc.)." },
          { name: "label", desc: "Override for label content (rich HTML labels)." },
          { name: "prefix", desc: "Content placed before the control in the control row." },
          { name: "suffix", desc: "Content placed after the control in the control row." },
          { name: "actions", desc: "Action buttons aligned to the far right of the control row." },
          { name: "help", desc: "Rich HTML help content (alternative to `help` attribute)." },
          { name: "error", desc: "Rich HTML error content (alternative to `error` attribute)." }
        ],
        parts: [
          { name: "field", desc: "The outer `<label>` element." },
          { name: "label", desc: "The label text span." },
          { name: "main", desc: "Grid wrapping control-row + message." },
          { name: "control-row", desc: "Flex row containing prefix, control, suffix, actions." },
          { name: "message", desc: "Help/error message container." }
        ],
        examples: [
          {
            label: "Vertical (default) with help text",
            layout: "block",
            html: `<${tag("field")} label="Page title" help="Used as the exported filename."><${tag("input")} wide value="Research notes" /></${tag("field")}>`
          },
          {
            label: "With error message",
            layout: "block",
            html: `<${tag("field")} label="Timeout (seconds)" error="Value must be between 1 and 60."><${tag("input")} wide type="number" value="120" /></${tag("field")}>`
          },
          {
            label: "Horizontal orientation",
            layout: "block",
            html: `<${tag("field")} label="Capture mode" orientation="horizontal" wide><${tag("select")} wide><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("field")} label="URL" orientation="horizontal" wide><${tag("input")} wide placeholder="https://…" /></${tag("field")}>`
          },
          {
            label: "Required + disabled",
            layout: "block",
            html: `<${tag("field")} label="Export name" required wide><${tag("input")} wide value="session_2026" /></${tag("field")}><${tag("field")} label="System path" disabled wide><${tag("input")} wide value="/tmp/exports" /></${tag("field")}>`
          }
        ]
      },
      {
        id: "group",
        name: "Group",
        tag: tag("group"),
        category: "compound",
        description: "A visual grouping container for related form fields or controls. Renders a titled section box with optional border and spacing. Use to organise a form into logical sections (e.g., 'Capture options', 'Export settings').",
        usage: "Place `awwbookmarklet-field` elements or any content inside. Set `label` for the group heading. Nest groups sparingly — one level of nesting is usually enough.",
        attrs: [
          { name: "label", type: "string", desc: "Section heading text." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Fields and controls inside the group." },
          { name: "title", desc: "Rich HTML group title (alternative to `label` attribute)." }
        ],
        parts: [
          { name: "group", desc: "The outer element." },
          { name: "title", desc: "The heading element." },
          { name: "body", desc: "The content area." }
        ],
        examples: [
          {
            label: "Group with fields",
            layout: "block",
            html: `<${tag("group")} label="Capture settings"><${tag("field")} label="Mode"><${tag("select")}><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("field")} label="Include images"><${tag("checkbox")} checked>Yes</${tag("checkbox")}></${tag("field")}></${tag("group")}>`
          }
        ]
      }
    ]
  },
  {
    id: "feedback",
    label: "Feedback & Status",
    stories: [
      {
        id: "alert",
        name: "Alert",
        tag: tag("alert"),
        category: "feedback",
        description: "An inline feedback banner for info, success, warning, or danger messages. Visible by default (`open` attribute set on connect). Supports optional dismiss button and a slot for action buttons.",
        usage: "Use `tone` to match the severity. Use `dismissible` to let the user clear transient messages. Listen to `awwbookmarklet-alert-dismiss` if you need to react when dismissed (e.g., re-enable a button).",
        attrs: [
          { name: "tone", type: "string", default: "info", values: "info | success | warning | danger", desc: "Color and semantic tone of the alert." },
          { name: "title", type: "string", desc: "Bold heading text shown above the message." },
          { name: "dismissible", type: "boolean", desc: "Shows an × close button." },
          { name: "open", type: "boolean", default: "true", desc: "Visibility. Auto-set to `open` on `connectedCallback`. Remove to hide." },
          { name: "compact", type: "boolean", desc: "Reduces internal padding." }
        ],
        events: [
          { name: "awwbookmarklet-alert-dismiss", desc: "Dispatched (cancelable) when dismiss button is clicked. Prevent default to keep the alert open." }
        ],
        slots: [
          { name: "", desc: "Message body text or rich HTML." },
          { name: "title", desc: "Rich HTML title override." },
          { name: "icon", desc: "Custom icon override." },
          { name: "actions", desc: "Inline buttons below the message." }
        ],
        parts: [
          { name: "alert", desc: "The outer container." },
          { name: "icon", desc: "Tone indicator icon area." },
          { name: "content", desc: "Title + message + actions wrapper." },
          { name: "title", desc: "Heading element." },
          { name: "message", desc: "Body text container." },
          { name: "close-button", desc: "The dismiss button." }
        ],
        examples: [
          {
            label: "All tones",
            layout: "col",
            html: `<${tag("alert")} tone="info" title="Note">Preview mode is active.</${tag("alert")}><${tag("alert")} tone="success" title="Exported">34 blocks written to /exports.</${tag("alert")}><${tag("alert")} tone="warning" title="Draft restored">A previous draft was restored.</${tag("alert")}><${tag("alert")} tone="danger" title="Upload failed">Policy blocked the request.</${tag("alert")}>`
          },
          {
            label: "Dismissible",
            layout: "block",
            html: `<${tag("alert")} tone="info" title="Tip" dismissible>Select content on the page before capturing.</${tag("alert")}>`
          }
        ]
      },
      {
        id: "status-line",
        name: "Status Line",
        tag: tag("status-line"),
        category: "feedback",
        description: "A compact single-line status message with a leading tone indicator. Lighter-weight than `awwbookmarklet-alert` — no title, no actions, no dismiss. Good for inline form feedback, panel footers, or status summaries.",
        usage: "Use inside panels, dialogs, or list items where a full alert would be too heavy. Prefer `alert` when the message needs a title or action buttons.",
        attrs: [
          { name: "tone", type: "string", default: "info", values: "info | success | warning | danger | neutral", desc: "Semantic color tone." }
        ],
        events: [],
        slots: [{ name: "", desc: "Status message text." }],
        parts: [{ name: "line", desc: "The outer container." }],
        examples: [
          {
            label: "All tones",
            layout: "col",
            html: `<${tag("status-line")} tone="info">Preview available</${tag("status-line")}><${tag("status-line")} tone="success">Export completed</${tag("status-line")}><${tag("status-line")} tone="warning">Connection unstable</${tag("status-line")}><${tag("status-line")} tone="danger">Permission denied</${tag("status-line")}><${tag("status-line")} tone="neutral">Idle</${tag("status-line")}>`
          }
        ]
      },
      {
        id: "toast",
        name: "Toast / showToast()",
        tag: tag("toast"),
        category: "feedback",
        description: "A non-blocking notification that appears in the bottom-right corner and auto-dismisses. The recommended way to show toasts is via the exported `showToast()` function rather than creating elements manually. `showToast` manages a per-key singleton (updating an existing toast instead of stacking duplicates).",
        usage: "Import `showToast` from the framework bundle. Call `showToast({ message, tone, timeout, key })`. Use `key` to avoid duplicate toast stacks for the same event category. Hovering the toast pauses the auto-dismiss timer.",
        attrs: [
          { name: "tone", type: "string", default: "info", values: "info | success | warning | danger", desc: "Color and semantic tone." },
          { name: "timeout", type: "number", default: "2800", desc: "Auto-dismiss delay in milliseconds. Set to 0 to disable auto-dismiss." }
        ],
        events: [],
        slots: [{ name: "", desc: "Toast message content." }],
        parts: [{ name: "toast", desc: "The outer container." }],
        examples: [
          {
            label: "Trigger toasts via showToast()",
            note: "Click the buttons to see toasts appear in the corner",
            layout: "row",
            html: `<button class="sb-demo-toast" data-tone="info" data-msg="Preview loaded">Info toast</button><button class="sb-demo-toast" data-tone="success" data-msg="Export completed">Success toast</button><button class="sb-demo-toast" data-tone="warning" data-msg="Draft restored">Warning toast</button><button class="sb-demo-toast" data-tone="danger" data-msg="Upload failed">Danger toast</button>`
          }
        ]
      },
      {
        id: "empty-state",
        name: "Empty State",
        tag: tag("empty-state"),
        category: "feedback",
        description: "A centred placeholder shown when a content area has no items. Accepts an icon, a heading, supporting text, and an optional action button. Use to communicate zero-data conditions rather than leaving a blank surface.",
        usage: "Show inside list areas, panels, or tab panels when there is nothing to display. Pair with a call-to-action button in the `actions` slot.",
        attrs: [
          { name: "icon", type: "string", desc: "Icon name from the icon set (displayed as SVG)." },
          { name: "title", type: "string", desc: "Primary heading text." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Supporting description text." },
          { name: "actions", desc: "Call-to-action buttons." }
        ],
        parts: [{ name: "empty", desc: "The container element." }],
        examples: [
          {
            label: "No captures yet",
            layout: "block",
            html: `<${tag("empty-state")} icon="noResults" title="No captures yet">Start by selecting content on the page.</${tag("empty-state")}>`
          }
        ]
      },
      {
        id: "state-overlay",
        name: "State Overlay",
        tag: tag("state-overlay"),
        category: "feedback",
        description: "An overlay layer that sits on top of a content area to show loading spinners, error states, or blocked-content messages without removing the underlying DOM. Useful when content takes time to load or is temporarily unavailable.",
        usage: "Wrap the target content in a `position: relative` container, then place `awwbookmarklet-state-overlay` as a sibling. Use `tone` and `title` to describe the state.",
        attrs: [
          { name: "active", type: "boolean", desc: "Shows the overlay when present." },
          { name: "tone", type: "string", default: "info", values: "info | warning | danger | neutral", desc: "Visual tone of the overlay message." },
          { name: "title", type: "string", desc: "Heading text in the overlay." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Description or action content shown in the overlay." }
        ],
        parts: [{ name: "overlay", desc: "The positioned overlay container." }],
        examples: [
          {
            label: "Loading and error overlays",
            layout: "col",
            html: `<${tag("state-overlay")} active tone="info" title="Loading…">Fetching content from the page.</${tag("state-overlay")}><${tag("state-overlay")} active tone="danger" title="Access blocked">The frame refused to load.</${tag("state-overlay")}>`
          }
        ]
      }
    ]
  },
  {
    id: "layout",
    label: "Layout & Navigation",
    stories: [
      {
        id: "panel",
        name: "Panel",
        tag: tag("panel"),
        category: "compound",
        description: "A content surface with optional title, subtitle, action buttons, and footer. The header row appears only when at least one of `title`, `subtitle`, or `actions` slots have content. The footer row appears only when the `footer` slot has content.",
        usage: "Use as the primary content container inside windows and dialogs. Group related fields and controls inside panels for visual separation. Stack multiple panels vertically inside an app shell.",
        attrs: [],
        events: [],
        slots: [
          { name: "", desc: "Body content (fields, lists, etc.)." },
          { name: "title", desc: "Panel heading text." },
          { name: "subtitle", desc: "Secondary heading text." },
          { name: "actions", desc: "Action buttons aligned to the right of the header." },
          { name: "footer", desc: "Footer content below the body." }
        ],
        parts: [
          { name: "panel", desc: "The outer `<section>`." },
          { name: "header", desc: "Title row." },
          { name: "heading", desc: "Title + subtitle wrapper." },
          { name: "title", desc: "Title element." },
          { name: "subtitle", desc: "Subtitle element." },
          { name: "body", desc: "Content area." },
          { name: "footer", desc: "Footer area." }
        ],
        examples: [
          {
            label: "Panel with title and body",
            layout: "block",
            html: `<${tag("panel")}><span slot="title">Capture settings</span><${tag("field")} label="Mode"><${tag("select")}><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("field")} label="Include images"><${tag("checkbox")} checked>Yes</${tag("checkbox")}></${tag("field")}></${tag("panel")}>`
          },
          {
            label: "Panel with actions + footer",
            layout: "block",
            html: `<${tag("panel")}><span slot="title">Results</span><${tag("button")} slot="actions" variant="ghost">Refresh</${tag("button")}><p style="margin:0;color:var(--awwbookmarklet-text-muted,#586272)">3 items found</p><${tag("status-line")} slot="footer" tone="success">All captures valid</${tag("status-line")}></${tag("panel")}>`
          }
        ]
      },
      {
        id: "tabs",
        name: "Tabs + Tab Panel",
        tag: `${tag("tabs")} / ${tag("tab-panel")}`,
        category: "compound",
        description: "A tab bar for switching between named content panels. `awwbookmarklet-tabs` is the container; each `awwbookmarklet-tab-panel` child provides `label` (tab button text) and `selected` (initially active tab). Keyboard-navigable (Arrow Left/Right, Home, End).",
        usage: "Place `awwbookmarklet-tab-panel` elements as direct children of `awwbookmarklet-tabs`. Set `selected` on the initially active panel. The component observes child mutations — add/remove panels dynamically and the tab list updates.",
        attrs: [
          { name: "— on awwbookmarklet-tab-panel —", type: "", desc: "" },
          { name: "label", type: "string", desc: "Text shown in the tab button." },
          { name: "selected", type: "boolean", desc: "Marks this panel as the initially active tab." }
        ],
        events: [],
        slots: [
          { name: "— on awwbookmarklet-tab-panel —", desc: "" },
          { name: "", desc: "Content of this tab panel." }
        ],
        parts: [
          { name: "tablist", desc: "The tab button row." },
          { name: "panels", desc: "The panel area." }
        ],
        examples: [
          {
            label: "Three tabs",
            layout: "block",
            html: `<${tag("tabs")}><${tag("tab-panel")} label="Preview" selected><p style="margin:0">Preview content goes here.</p></${tag("tab-panel")}><${tag("tab-panel")} label="Metadata"><p style="margin:0">Page title, URL, timestamp.</p></${tag("tab-panel")}><${tag("tab-panel")} label="Log"><p style="margin:0">Capture events and errors.</p></${tag("tab-panel")}></${tag("tabs")}>`
          }
        ]
      },
      {
        id: "toolbar",
        name: "Toolbar",
        tag: tag("toolbar"),
        category: "compound",
        description: "A horizontal strip for grouping action buttons, icon buttons, and controls. Supports `wrap` (allow line-wrapping) and `align` (end-aligns the content). Often placed in a window's `toolbar` slot or a dialog's footer slot.",
        usage: "Put `awwbookmarklet-button` and `awwbookmarklet-icon-button` elements inside. Use `align='end'` in dialog footers to right-align action buttons. Use `wrap` in wider toolbars that may overflow on small viewports.",
        attrs: [
          { name: "wrap", type: "boolean", desc: "Allows toolbar content to wrap to a second line." },
          { name: "align", type: "string", values: "start | end", desc: "Aligns content. `end` right-aligns buttons (useful for dialog footers)." }
        ],
        events: [],
        slots: [{ name: "", desc: "Buttons and controls." }],
        parts: [{ name: "bar", desc: "The inner flex container." }],
        examples: [
          {
            label: "Toolbar with buttons",
            html: `<${tag("toolbar")}><${tag("button")} variant="primary">Save</${tag("button")}><${tag("button")}>Preview</${tag("button")}><${tag("icon-button")} label="Refresh">${iconSvg("refresh")}</${tag("icon-button")}></${tag("toolbar")}>`
          },
          {
            label: "Right-aligned footer toolbar",
            html: `<${tag("toolbar")} align="end"><${tag("button")}>Cancel</${tag("button")}><${tag("button")} variant="primary">Confirm</${tag("button")}></${tag("toolbar")}>`
          }
        ]
      },
      {
        id: "list",
        name: "List + List Item",
        tag: `${tag("list")} / ${tag("list-item")}`,
        category: "compound",
        description: "`awwbookmarklet-list` is a container for a vertical list of `awwbookmarklet-list-item` rows. Each item can have a leading icon, primary text, secondary text, and trailing actions. Used for result lists, activity logs, and settings entries.",
        usage: "Use `awwbookmarklet-list-item` children for structured rows. For a simple un-styled list, use plain HTML `<ul>` instead. Use `selected` on an item to highlight the active entry.",
        attrs: [
          { name: "— on awwbookmarklet-list-item —", type: "", desc: "" },
          { name: "selected", type: "boolean", desc: "Highlights this row as the active/selected item." },
          { name: "disabled", type: "boolean", desc: "Dims and prevents interaction on the row." }
        ],
        events: [],
        slots: [
          { name: "— on awwbookmarklet-list-item —", desc: "" },
          { name: "", desc: "Primary row content (text)." },
          { name: "start", desc: "Leading content (icon or avatar)." },
          { name: "end", desc: "Trailing content (actions or metadata)." },
          { name: "secondary", desc: "Secondary text line below the primary." }
        ],
        parts: [],
        examples: [
          {
            label: "Basic list",
            layout: "block",
            html: `<${tag("list")}><${tag("list-item")} selected><span slot="start">${iconSvg("capture")}</span>Session Capture Console<span slot="secondary">Last opened 2m ago</span></${tag("list-item")}><${tag("list-item")}><span slot="start">${iconSvg("bookmark")}</span>Bookmark Manager<span slot="secondary">34 bookmarks</span></${tag("list-item")}><${tag("list-item")} disabled><span slot="start">${iconSvg("blocked")}</span>Screenshot Tool (unavailable)</${tag("list-item")}></${tag("list")}>`
          }
        ]
      },
      {
        id: "card",
        name: "Card",
        tag: tag("card"),
        category: "compound",
        description: "A bordered surface for displaying structured item data — title, metadata, and optional selection. Use in grid or list layouts to represent selectable content items, search results, or settings categories.",
        usage: "Use `selected` to highlight the active item. For a group of selectable cards, manage selection state in parent JS and toggle `selected` on the chosen card.",
        attrs: [
          { name: "selected", type: "boolean", desc: "Highlights the card as the selected/active item." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Card body content." },
          { name: "title", desc: "Card heading." },
          { name: "meta", desc: "Secondary metadata (date, type, etc.)." },
          { name: "actions", desc: "Action buttons shown on the card." }
        ],
        parts: [{ name: "card", desc: "The outer container." }],
        examples: [
          {
            label: "Cards (one selected)",
            layout: "col",
            html: `<${tag("card")} selected><span slot="title">Research notes 2026-04</span><span slot="meta">Captured 3m ago · 12 blocks</span>Summary of quarterly research findings.</${tag("card")}><${tag("card")}><span slot="title">Market analysis draft</span><span slot="meta">Last edited 1h ago · 8 blocks</span>Working draft for review.</${tag("card")}>`
          }
        ]
      },
      {
        id: "listbox",
        name: "Listbox",
        tag: tag("listbox"),
        category: "compound",
        description: "A keyboard-navigable listbox for single or multi-selection from a set of options. More accessible than a `<select>` for complex option content (icons, secondary text). Fires selection events for easy integration.",
        usage: "Use instead of a `<select>` when options need richer display (icons, descriptions). Each `<option>` or custom item child receives ARIA `role=option` automatically.",
        attrs: [
          { name: "value", type: "string", desc: "Currently selected option value." },
          { name: "disabled", type: "boolean", desc: "Disables the entire listbox." }
        ],
        events: [
          { name: "change", desc: "Fires when selection changes." }
        ],
        slots: [{ name: "", desc: "`<option>` elements or custom item elements." }],
        parts: [],
        examples: [
          {
            label: "Listbox selection",
            layout: "block",
            html: `<${tag("listbox")}><option value="preview" selected>Preview mode</option><option value="capture">Capture mode</option><option value="export">Export mode</option></${tag("listbox")}>`
          }
        ]
      }
    ]
  },
  {
    id: "commands",
    label: "Command Surfaces",
    stories: [
      {
        id: "menubar",
        name: "Menubar + Menu",
        tag: `${tag("menubar")} / ${tag("menu")}`,
        category: "compound",
        description: "`awwbookmarklet-menubar` is a horizontal menu strip placed in a window's `menubar` slot. Each `<button>` child with `data-menu` triggers the corresponding `awwbookmarklet-menu[name]`. Menus portal to the overlay layer and close on Escape or outside click.",
        usage: "Place button triggers inside `awwbookmarklet-menubar`. Give each button a `data-menu` matching the `name` attribute of its `awwbookmarklet-menu`. Menu item buttons should have `data-command` to integrate with the command registry.",
        attrs: [
          { name: "— on awwbookmarklet-menu —", type: "", desc: "" },
          { name: "name", type: "string", desc: "Identifier matching the `data-menu` attribute on the trigger button." }
        ],
        events: [
          { name: "awwbookmarklet-menu-open", desc: "Fires when a menu opens." },
          { name: "awwbookmarklet-menu-close", desc: "Fires when a menu closes." }
        ],
        slots: [
          { name: "— on awwbookmarklet-menubar —", desc: "" },
          { name: "", desc: "Trigger buttons (each with `data-menu`)." },
          { name: "— on awwbookmarklet-menu —", desc: "" },
          { name: "", desc: "Menu item buttons (with `data-command` or click listeners)." }
        ],
        parts: [],
        examples: [
          {
            label: "Menubar with two menus",
            layout: "block",
            html: `<div style="border:1px solid var(--awwbookmarklet-border-strong,#232a33);padding:2px 6px;background:var(--awwbookmarklet-panel-bg,#f8fafc)"><${tag("menubar")}><button type="button" data-menu="file">File</button><button type="button" data-menu="view">View</button><${tag("menu")} name="file"><button type="button" data-command="file.new">New capture</button><button type="button" data-command="file.export">Export…</button><button type="button" data-command="file.settings">Settings</button></${tag("menu")}><${tag("menu")} name="view"><button type="button" data-command="view.preview">Toggle preview</button><button type="button" data-command="view.fullscreen">Fullscreen</button></${tag("menu")}></${tag("menubar")}></div>`
          }
        ]
      },
      {
        id: "command-palette",
        name: "Command Palette",
        tag: tag("command-palette"),
        category: "compound",
        description: "A keyboard-first command search overlay. Type to filter commands, Arrow keys to navigate, Enter to execute, Escape to close. Commands are provided as an array via the `commands` property. Often triggered by Ctrl+K.",
        usage: "Set `commandPalette.commands = [...items]` in JS where each item has `{ id, title, description, keys? }`. Open with `.open()` and close with `.close()`. Listen to `awwbookmarklet-command-execute` to act on the selected command.",
        attrs: [
          { name: "open", type: "boolean", desc: "Shows/hides the palette." },
          { name: "placeholder", type: "string", desc: "Search input placeholder text." }
        ],
        events: [
          { name: "awwbookmarklet-command-execute", desc: "`detail: { commandId }` — fired when the user selects a command." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Note: requires JS initialization",
            note: "Use .commands = [...] and .open() in JS",
            layout: "block",
            html: `<p style="margin:0;font-size:12px;color:var(--awwbookmarklet-text-muted,#586272)">Use <code>commandPalette.commands = [...]</code> then <code>commandPalette.open()</code> to show the palette programmatically.</p>`
          }
        ]
      },
      {
        id: "url-picker",
        name: "URL Picker",
        tag: tag("url-picker"),
        category: "compound",
        description: "A URL input with a dropdown suggestion list. Shows recent/relevant URLs as the user types. Built for bookmarklet tools where the user needs to pick from a set of page URLs, history, or search results.",
        usage: "Set `urlPicker.suggestions = [...items]` in JS where each item has `{ url, title, kind }`. Listen to `awwbookmarklet-url-select` for the chosen URL. The input emits normal `input` events for live filtering.",
        attrs: [
          { name: "value", type: "string", desc: "Current input value." },
          { name: "placeholder", type: "string", desc: "Input placeholder text." }
        ],
        events: [
          { name: "awwbookmarklet-url-select", desc: "`detail: { url }` — fires when a suggestion is selected." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "URL picker (JS required for suggestions)",
            layout: "block",
            html: `<${tag("url-picker")} value="https://example.com/research"></${tag("url-picker")}>`
          }
        ]
      },
      {
        id: "shortcut-help",
        name: "Shortcut Help",
        tag: tag("shortcut-help"),
        category: "compound",
        description: "A keyboard shortcuts reference panel. Renders a structured list of key combinations and their descriptions. Set `shortcuts` property in JS to provide the list. Used in help dialogs and settings panels.",
        usage: "Set `shortcutHelp.shortcuts = [{ keys: ['Ctrl', 'K'], desc: 'Open command palette' }, ...]`. Optionally group shortcuts by category.",
        attrs: [],
        events: [],
        slots: [{ name: "", desc: "Fallback content or static shortcut list." }],
        parts: [],
        examples: [
          {
            label: "Rendered via JS property",
            note: "Set .shortcuts = [...] in JS",
            layout: "block",
            html: `<p style="margin:0;font-size:12px;color:var(--awwbookmarklet-text-muted,#586272)">Set <code>el.shortcuts = [{ keys: ['Ctrl', 'K'], desc: 'Open command palette' }]</code>.</p>`
          }
        ]
      }
    ]
  },
  {
    id: "data",
    label: "Data Display",
    stories: [
      {
        id: "rich-preview",
        name: "Rich Preview",
        tag: tag("rich-preview"),
        category: "compound",
        description: "A structured link/content preview card showing URL, title, and optional image. Used in capture results, bookmark entries, and link-hover previews.",
        usage: "Set `url`, `title`, `description`, and optionally `image` as attributes or properties. The component handles layout and image loading.",
        attrs: [
          { name: "url", type: "string", desc: "The target URL." },
          { name: "title", type: "string", desc: "Preview title." },
          { name: "description", type: "string", desc: "Short description or excerpt." },
          { name: "image", type: "string", desc: "URL of the preview thumbnail." }
        ],
        events: [],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Basic rich preview",
            layout: "block",
            html: `<${tag("rich-preview")} url="https://example.com/article" title="Understanding constrained environments" description="A guide to writing resilient bookmarklet tools."></${tag("rich-preview")}>`
          }
        ]
      },
      {
        id: "metric-card",
        name: "Metric Card",
        tag: tag("metric-card"),
        category: "compound",
        description: "A compact status register tile showing a label, primary numeric value, and supporting detail. Used in dashboards and status areas. Replaces ad-hoc 'KPI card' patterns with a consistent, token-driven component.",
        usage: "Use multiple metric cards in a CSS grid for a status register overview. Set `label`, `value`, and `detail` attributes.",
        attrs: [
          { name: "label", type: "string", desc: "Metric name." },
          { name: "value", type: "string", desc: "Primary value (shown large)." },
          { name: "detail", type: "string", desc: "Supporting context (e.g. '+4 this hour')." },
          { name: "tone", type: "string", values: "info | success | warning | danger | neutral", desc: "Color accent for the value." }
        ],
        events: [],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Metric cards",
            html: `<${tag("metric-card")} label="Captures" value="24" detail="+6 this hour"></${tag("metric-card")}><${tag("metric-card")} label="Errors" value="0" detail="No change" tone="success"></${tag("metric-card")}>`
          }
        ]
      },
      {
        id: "segment-strip",
        name: "Segment Strip",
        tag: tag("segment-strip"),
        category: "compound",
        description: "A compact one-line renderer for structured context segments — key-value pairs with optional tone, copyable values, and separator marks. Used as a building block for context bars and status strips. Segments are supplied via the `segments` property as an array.",
        usage: "Set `el.segments = [{key, label, value, tone, copyable, copyValue, kind}]`. Or use the `value` attribute with pipe-delimited shorthand: `value='App | Segment | Status'`. Listen to `awwbookmarklet-segment-copy` to handle clipboard events.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand: `'App | PR #42 | CI passing'`." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "`detail: { key, copyValue }` — fires when a copyable segment is clicked." },
          { name: "awwbookmarklet-segment-activate", desc: "Fires when a segment is activated (click/Enter)." },
          { name: "awwbookmarklet-segment-menu-request", desc: "Fires when a segment requests a context menu." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Shorthand value",
            layout: "block",
            html: `<${tag("segment-strip")} value="GitHub | PR #1824 | feature/context-bar | CI passing"></${tag("segment-strip")}>`
          }
        ]
      },
      {
        id: "context-bar",
        name: "Context Bar",
        tag: tag("context-bar"),
        category: "compound",
        description: "A top context surface combining a segment strip with optional leading/trailing slots, a busy indicator, and a quiet progress strip. Placed at the top of tool windows to show page context (app, object, status) at a glance.",
        usage: "Set `el.segments = [...]` (same format as `awwbookmarklet-segment-strip`) or use the `value` shorthand. Use `busy` to show an indeterminate progress indicator. Use `progress='68'` for a determinate strip.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand." },
          { name: "busy", type: "boolean", desc: "Shows an indeterminate progress strip." },
          { name: "progress", type: "number", desc: "0–100 for a determinate progress strip." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "Propagated from inner segment strip." }
        ],
        slots: [
          { name: "leading", desc: "Content placed before the segments (e.g., app icon)." },
          { name: "actions", desc: "Content placed after the segments (e.g., icon buttons)." }
        ],
        parts: [],
        examples: [
          {
            label: "Context bar with progress",
            layout: "block",
            html: `<${tag("context-bar")} value="GitHub | PR #1824 | feature/context-bar | CI passing" progress="68"></${tag("context-bar")}>`
          }
        ]
      },
      {
        id: "status-strip",
        name: "Status Strip",
        tag: tag("status-strip"),
        category: "compound",
        description: "A quieter variant of the context bar for footer/status regions. Shows the same segment data but with reduced visual weight — no busy indicator, no actions slot. Use at the bottom of panels or tool areas to display secondary status.",
        usage: "Use `value` shorthand or set `el.segments = [...]` for structured data. Prefer `status-strip` in footers; prefer `context-bar` in headers.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "Propagated from inner segment strip." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Status strip in footer",
            layout: "block",
            html: `<${tag("status-strip")} value="Review ready | 0 missing | Read-only | Saved 30s ago"></${tag("status-strip")}>`
          }
        ]
      },
      {
        id: "titlebar",
        name: "Titlebar",
        tag: tag("titlebar"),
        category: "compound",
        description: "A standalone titlebar surface that can render a title and optional segment data. Exposes a `drag-region` CSS part for future window integration. Used as a header strip in panels, dialogs, or custom windows outside the full window system.",
        usage: "Use when you need a title surface without the full `awwbookmarklet-window` system. Set `label` for the title text, `value` for segment data.",
        attrs: [
          { name: "label", type: "string", desc: "Title text." },
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand (shown alongside the title)." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Custom titlebar content." },
          { name: "actions", desc: "Trailing action buttons." }
        ],
        parts: [{ name: "drag-region", desc: "The draggable portion of the titlebar." }],
        examples: [
          {
            label: "Standalone titlebar",
            layout: "block",
            html: `<${tag("titlebar")} label="Capture Console" value="Session active | 14 items"></${tag("titlebar")}>`
          }
        ]
      },
      {
        id: "context-panel",
        name: "Context Panel",
        tag: tag("context-panel"),
        category: "compound",
        description: "An expanded label-value layout for the same segment data used by `awwbookmarklet-context-bar` and `awwbookmarklet-segment-strip`. Displays each segment on its own line with a label column and a value column — useful for detail sidebars and inspect panels.",
        usage: "Set `el.segments = [...]` (same schema as other context components). Do not use the `value` shorthand for this component — structured segments are required for the two-column layout.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand (basic mode)." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "Fires when a copyable segment value is clicked." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Context panel (structured data via JS)",
            note: "Set el.segments = [...] for label-value layout",
            layout: "block",
            html: `<${tag("context-panel")} value="Customer: Acme | Tenant: 918273 | Environment: Production"></${tag("context-panel")}>`
          }
        ]
      }
    ]
  },
  {
    id: "overlays",
    label: "Overlays",
    stories: [
      {
        id: "dialog",
        name: "Dialog",
        tag: tag("dialog"),
        category: "overlay",
        description: "A modal/non-modal dialog overlay. When opened, the element portals to `.awwbookmarklet-overlay-layer` (outside normal DOM flow) so it is unaffected by parent stacking contexts. CSS variables from ancestor elements do NOT cascade into the portaled dialog — use CSS custom properties set directly on the dialog element or `::part()` overrides for styling.",
        usage: "Call `.show()` to open, `.close(reason)` to close. Listen for `awwbookmarklet-dialog-close` to react to all close paths (button, Escape, backdrop, `.close()`). Set `close-on-backdrop` for light-dismiss. Set `modal` to trap Tab focus inside.",
        attrs: [
          { name: "open", type: "boolean", desc: "Controls visibility. Use `.show()` / `.close()` rather than setting this directly." },
          { name: "label", type: "string", default: "Dialog", desc: "Accessible name (`aria-label`) for the dialog panel." },
          { name: "modal", type: "boolean", desc: "Traps Tab focus inside the dialog." },
          { name: "close-on-backdrop", type: "boolean", desc: "Clicking the backdrop calls `.close('backdrop')`." },
          { name: "close-on-escape", type: "string", default: "(true)", desc: "Set to `'false'` to disable Escape key closing." }
        ],
        events: [
          { name: "awwbookmarklet-dialog-open", desc: "Fires after the dialog opens." },
          { name: "awwbookmarklet-dialog-cancel", desc: "Cancelable — fires before closing. Prevent default to keep open." },
          { name: "awwbookmarklet-dialog-close", desc: "`detail: { reason }` — fires after dialog closes. `reason` is 'button' | 'backdrop' | 'escape' | 'api'." }
        ],
        slots: [
          { name: "", desc: "Dialog body content." },
          { name: "title", desc: "Dialog title bar content." },
          { name: "footer", desc: "Footer area (typically a `awwbookmarklet-toolbar` with action buttons)." }
        ],
        parts: [
          { name: "panel", desc: "The dialog panel container (width/height overrides go here)." },
          { name: "header", desc: "Title bar row." },
          { name: "title", desc: "Title text area." },
          { name: "body", desc: "Scrollable content area." },
          { name: "footer", desc: "Footer slot container." },
          { name: "backdrop", desc: "The dim backdrop layer." },
          { name: "close-button", desc: "The × button in the header." }
        ],
        examples: [
          {
            label: "Open dialog via button",
            note: "Click button to open the dialog",
            layout: "row",
            html: `<button class="sb-open-dialog" data-dialog-id="sb-example-dialog">Open dialog</button><${tag("dialog")} id="sb-example-dialog" modal label="Example dialog" close-on-backdrop><span slot="title">Edit settings</span><${tag("field")} label="Capture name" wide style="margin-bottom:8px"><${tag("input")} wide value="Session 2026" /></${tag("field")}><${tag("field")} label="Mode" wide><${tag("select")} wide><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("toolbar")} slot="footer" align="end"><${tag("button")}>Cancel</${tag("button")}><${tag("button")} class="sb-close-dialog" variant="primary" data-dialog-id="sb-example-dialog">Save</${tag("button")}></${tag("toolbar")}></${tag("dialog")}>`
          }
        ]
      }
    ]
  },
  {
    id: "shell",
    label: "Application Shell",
    stories: [
      {
        id: "window",
        name: "Window",
        tag: tag("window"),
        category: "shell",
        description: "A movable, resizable floating window with titlebar, optional menubar, toolbar, scrollable body, and statusbar. The core shell of every bookmarklet tool. Created via `createWindow({title, content})` and mounted via `mountWindow(win, {ownerPrefix, theme})` from the framework API.",
        usage: "Do not manage the desktop root or overlay layers manually. Use `createWindow()` + `mountWindow()` from `bookmarklet/index.js`. Listen for `awwbookmarklet-window-closed` to clean up. Set `win.setRect({x, y, width, height})` before mounting for initial position.",
        attrs: [
          { name: "title", type: "string", desc: "Window titlebar text." },
          { name: "active", type: "boolean", desc: "Auto-managed by the window manager — marks the focused window." }
        ],
        events: [
          { name: "awwbookmarklet-window-closed", desc: "Fires when the user closes the window. Clean up desktop root ownership here." },
          { name: "awwbookmarklet-window-focused", desc: "Fires when the window gains focus." }
        ],
        slots: [
          { name: "", desc: "Body content (panels, lists, etc.)." },
          { name: "menubar", desc: "An `awwbookmarklet-menubar` element." },
          { name: "toolbar", desc: "An `awwbookmarklet-toolbar` element." },
          { name: "statusbar", desc: "An `awwbookmarklet-statusbar` element." }
        ],
        parts: [
          { name: "titlebar", desc: "The title row." },
          { name: "body", desc: "Scrollable content area." }
        ],
        examples: [
          {
            label: "Open a window (live demo)",
            note: "Click the button to launch a floating window",
            layout: "row",
            html: `<button class="sb-open-window">Launch sample window</button>`
          }
        ]
      },
      {
        id: "desktop-root",
        name: "Desktop Root",
        tag: tag("desktop-root"),
        category: "shell",
        description: "The host element that provides the shared overlay surface for all floating windows. Managed automatically by `acquireDesktopRoot(ownerKey)` and `releaseDesktopRoot(ownerKey)`. Multiple tools can share one desktop root via the global owner registry — the root is removed only when the last owner releases it.",
        usage: "Never create `awwbookmarklet-desktop-root` manually. Use `acquireDesktopRoot(ownerKey)` to get or create the shared root. Call `releaseDesktopRoot(ownerKey)` in cleanup. Use `mountWindow(win, { ownerPrefix })` to associate windows with an owner.",
        attrs: [],
        events: [],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Managed automatically — no direct HTML usage",
            note: "Use acquireDesktopRoot() / releaseDesktopRoot() from the framework API",
            layout: "block",
            html: `<pre style="margin:0;font-size:12px;padding:8px;background:var(--code-bg,#1e2330);color:var(--code-fg,#cdd6f4)">import { acquireDesktopRoot, releaseDesktopRoot, mountWindow } from "./bookmarklet/index.js";

const record = acquireDesktopRoot("my-tool");
mountWindow(win, { ownerPrefix: "my-tool" });
win.addEventListener("awwbookmarklet-window-closed",
  () => releaseDesktopRoot("my-tool"), { once: true });</pre>`
          }
        ]
      },
      {
        id: "app-shell",
        name: "App Shell",
        tag: tag("app-shell"),
        category: "shell",
        description: "A structured content area inside a window body. Provides a title, optional subtitle, an inset content region, and optional toolbar/actions slots. Use `awwbookmarklet-app-shell` as the primary layout component inside a window — it handles padding, scrolling, and heading structure.",
        usage: "Place inside an `awwbookmarklet-window`'s body. Use `title` and `subtitle` slots for the section heading. Nest `awwbookmarklet-panel` or form content in the default slot.",
        attrs: [],
        events: [],
        slots: [
          { name: "", desc: "Main content (panels, forms, lists)." },
          { name: "title", desc: "Section heading." },
          { name: "subtitle", desc: "Section subheading." },
          { name: "toolbar", desc: "An inline toolbar placed below the heading." },
          { name: "actions", desc: "Action buttons aligned to the right of the heading." }
        ],
        parts: [
          { name: "shell", desc: "The outer container." },
          { name: "header", desc: "Heading area." },
          { name: "body", desc: "Content area." }
        ],
        examples: [
          {
            label: "App shell with content",
            layout: "block",
            html: `<${tag("app-shell")}><span slot="title">Capture options</span><span slot="subtitle">Configure how content is captured from the current page.</span><${tag("panel")}><${tag("field")} label="Mode" wide><${tag("select")} wide><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}></${tag("panel")}></${tag("app-shell")}>`
          }
        ]
      },
      {
        id: "statusbar",
        name: "Statusbar",
        tag: tag("statusbar"),
        category: "shell",
        description: "A horizontal status bar for the bottom of a window. Each direct `<span>` child becomes a separated status cell. Use for concise status information: document state, selection count, connection status, etc.",
        usage: "Place in the `statusbar` slot of an `awwbookmarklet-window`. Use `<span>` children for individual cells — the first cell is typically the primary status, subsequent cells are secondary.",
        attrs: [],
        events: [],
        slots: [{ name: "", desc: "`<span>` elements, each rendered as a separated status cell." }],
        parts: [{ name: "bar", desc: "The statusbar container." }],
        examples: [
          {
            label: "Statusbar",
            layout: "block",
            html: `<${tag("statusbar")}><span>Ready</span><span>1,842 DOM nodes</span><span>Injection: active</span><span>Policy: limited</span></${tag("statusbar")}>`
          }
        ]
      },
      {
        id: "browser-panel",
        name: "Browser Panel",
        tag: tag("browser-panel"),
        category: "shell",
        description: "A panel that represents browser content with address bar, navigation controls, and a content area. Used in tools that display or control a web view — captures page state, shows blocked/error content, and exposes page action shortcuts.",
        usage: "Set `url` for the displayed address. Set `status` for the content state. Listen for navigation events from the toolbar controls. Use as a sub-panel inside an app shell.",
        attrs: [
          { name: "url", type: "string", desc: "Currently displayed URL in the address bar." },
          { name: "status", type: "string", values: "loading | ready | error | blocked", desc: "Content area state." },
          { name: "title", type: "string", desc: "Page title shown in the bar." }
        ],
        events: [
          { name: "awwbookmarklet-browser-navigate", desc: "`detail: { url }` — fires when the user submits a URL." }
        ],
        slots: [
          { name: "", desc: "Content to display inside the browser panel." },
          { name: "actions", desc: "Extra action buttons in the toolbar." }
        ],
        parts: [],
        examples: [
          {
            label: "Browser panel",
            layout: "block",
            html: `<${tag("browser-panel")} url="https://example.com/research" status="ready" title="Research workspace"><p style="margin:0;padding:8px;color:var(--awwbookmarklet-text-muted,#586272)">Page content appears here.</p></${tag("browser-panel")}>`
          }
        ]
      },
      {
        id: "manual-copy",
        name: "Manual Copy",
        tag: tag("manual-copy"),
        category: "shell",
        description: "A structured fallback copy panel for when automatic clipboard or capture APIs are unavailable. Presents a clear manual copy workflow: select → copy → paste. Treats the manual path as a resilient workflow, not a panic state.",
        usage: "Show when `navigator.clipboard.writeText()` fails or when the extension context is blocked. Set `value` to the text the user should copy. Use `label` to describe what is being copied.",
        attrs: [
          { name: "value", type: "string", desc: "The text content to be manually copied." },
          { name: "label", type: "string", desc: "Description of what this content is." }
        ],
        events: [
          { name: "awwbookmarklet-manual-copy-attempt", desc: "Fires when user clicks the copy button." }
        ],
        slots: [
          { name: "", desc: "Instructions or additional context." }
        ],
        parts: [],
        examples: [
          {
            label: "Manual copy fallback",
            layout: "block",
            html: `<${tag("manual-copy")} label="Markdown export" value="# Research Notes

Your captured content here.">Automatic copy is not available. Select the text below and press Ctrl+C to copy it manually.</${tag("manual-copy")}>`
          }
        ]
      }
    ]
  }
];
function renderAttrsTable(attrs) {
  if (!attrs || attrs.length === 0)
    return `<p class="sb-note">No observed attributes.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Attribute</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>${attrs.map((a) => a.name.startsWith("—") ? `<tr><td colspan="4" style="background:var(--surface-inset);font-size:11px;font-weight:700;color:var(--text-subtle)">${esc(a.name)}</td></tr>` : `<tr>
      <td class="sb-attr-name">${esc(a.name)}</td>
      <td class="sb-attr-type">${a.values ? a.values.split(" | ").map((v) => `<span style="white-space:nowrap">${esc(v)}</span>`).join(" | ") : esc(a.type || "")}</td>
      <td class="sb-attr-default">${esc(a.default || "")}</td>
      <td>${esc(a.desc)}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}
function renderEventsTable(events) {
  if (!events || events.length === 0)
    return `<p class="sb-note">No custom events.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Event</th><th>Description</th></tr></thead>
    <tbody>${events.map((e) => `<tr><td class="sb-attr-name">${esc(e.name)}</td><td>${esc(e.desc)}</td></tr>`).join("")}</tbody>
  </table>`;
}
function renderSlotsTable(slots) {
  if (!slots || slots.length === 0)
    return `<p class="sb-note">No slots.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Slot</th><th>Description</th></tr></thead>
    <tbody>${slots.map((s) => s.name.startsWith("—") ? `<tr><td colspan="2" style="background:var(--surface-inset);font-size:11px;font-weight:700;color:var(--text-subtle)">${esc(s.name)}</td></tr>` : `<tr>
      <td class="sb-attr-name">${s.name === "" ? `<em style="color:var(--text-subtle)">(default)</em>` : esc(s.name)}</td>
      <td>${esc(s.desc)}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}
function renderPartsTable(parts) {
  if (!parts || parts.length === 0)
    return `<p class="sb-note">No CSS parts.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Part</th><th>Description</th></tr></thead>
    <tbody>${parts.map((p) => `<tr><td class="sb-attr-name">::part(${esc(p.name)})</td><td>${esc(p.desc)}</td></tr>`).join("")}</tbody>
  </table>`;
}
function escapeHtml2(html) {
  return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderExamples(examples) {
  if (!examples || examples.length === 0)
    return "";
  return `<div class="sb-examples-grid">
    ${examples.map((ex) => `
      <div class="sb-example">
        <div class="sb-example-label">
          <span>${esc(ex.label)}</span>
          ${ex.note ? `<span class="sb-example-note">${esc(ex.note)}</span>` : ""}
        </div>
        <div class="sb-preview${ex.layout === "block" ? " block" : ex.layout === "col" ? " col" : ""}">${ex.html}</div>
        <details class="sb-code-toggle">
          <summary>HTML</summary>
          <pre class="sb-code">${escapeHtml2(ex.html.trim())}</pre>
        </details>
      </div>
    `).join("")}
  </div>`;
}
function renderStory(story) {
  return `<div class="sb-story" id="story-${esc(story.id)}" data-story="${esc(story.id)}">
    <div class="sb-story-header">
      <h2 class="sb-story-name">${esc(story.name)}</h2>
      <code class="sb-story-tag">&lt;${esc(story.tag)}&gt;</code>
      <span class="sb-story-badge ${esc(story.category)}">${esc(story.category)}</span>
    </div>
    <div class="sb-story-body">
      <p class="sb-description">${esc(story.description)}</p>
      ${story.usage ? `<div class="sb-usage-note"><strong>Usage:</strong> ${esc(story.usage)}</div>` : ""}

      <div class="sb-section-title">Examples</div>
      ${renderExamples(story.examples)}

      <div class="sb-section-title">Attributes</div>
      ${renderAttrsTable(story.attrs)}

      <div class="sb-section-title">Events</div>
      ${renderEventsTable(story.events)}

      <div class="sb-section-title">Slots</div>
      ${renderSlotsTable(story.slots)}

      <div class="sb-section-title">CSS Parts (::part)</div>
      ${renderPartsTable(story.parts)}
    </div>
  </div>`;
}
function countAllStories() {
  return CATEGORIES.reduce((sum, cat) => sum + cat.stories.length, 0);
}
function renderWelcome() {
  const total = countAllStories();
  return `<div class="sb-welcome">
    <h1>${iconSvg("logo")} RetroOS UI — Component Storybook</h1>
    <p>
      Developer and agent reference for every component in the framework.
      Select a component from the sidebar to view its description, API, and live examples.
    </p>
    <p>
      <strong>How to use this storybook:</strong> Each entry documents the component's
      purpose, all observed attributes, custom events, slots, and CSS parts.
      Live examples render directly in the page using the real web components.
      Code snippets are expandable below each example.
    </p>
    <p>
      <strong>Framework note:</strong> This is an editable vendored copy.
      The code lives at <code>src/vendor/retroos-ui-v001/</code> and belongs to this project.
      Agents and developers may extend, fix, or improve any component when the change
      is generic and reusable.
    </p>
    <div class="sb-welcome-grid">
      <div class="sb-stat-card"><strong>${total}</strong><span>Total components</span></div>
      <div class="sb-stat-card"><strong>${ICON_NAMES.length}</strong><span>Icon names</span></div>
      <div class="sb-stat-card"><strong>${CATEGORIES.length}</strong><span>Categories</span></div>
    </div>
    <div class="sb-welcome-grid" style="margin-top:8px">
      ${CATEGORIES.map((cat) => `<div class="sb-stat-card"><strong>${cat.stories.length}</strong><span>${cat.label}</span></div>`).join("")}
    </div>
  </div>`;
}
function renderSidebar(navTree) {
  let html = "";
  for (const cat of CATEGORIES) {
    html += `<div class="sb-cat-header" data-category="${cat.id}">${cat.label}</div>`;
    for (const story of cat.stories) {
      const badge = story.category;
      html += `<button class="sb-nav-item" data-story="${story.id}" aria-selected="false">
        ${esc(story.name)}
        <span class="sb-nav-badge">${esc(badge)}</span>
      </button>`;
    }
  }
  navTree.innerHTML = html;
}
function findStory(id) {
  for (const cat of CATEGORIES) {
    const s = cat.stories.find((s2) => s2.id === id);
    if (s)
      return s;
  }
  return null;
}
function showStory(id, content, navTree) {
  const story = findStory(id);
  if (!story)
    return;
  content.innerHTML = renderStory(story);
  content.scrollTop = 0;
  navTree.querySelectorAll(".sb-nav-item").forEach((btn) => {
    btn.setAttribute("aria-selected", btn.dataset.story === id ? "true" : "false");
  });
  history.replaceState(null, "", `#${id}`);
  wireExampleInteractions(content);
}
function showWelcome(content, navTree) {
  content.innerHTML = renderWelcome();
  navTree.querySelectorAll(".sb-nav-item").forEach((btn) => {
    btn.setAttribute("aria-selected", "false");
  });
  history.replaceState(null, "", "#");
}
function wireExampleInteractions(root) {
  root.querySelectorAll(".sb-demo-toast").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tone = btn.dataset.tone || "info";
      const msg = btn.dataset.msg || "Demo toast";
      showToast({ message: msg, tone, timeout: 2500, key: `sb-toast-${tone}` });
    });
  });
  root.querySelectorAll(".sb-open-dialog").forEach((btn) => {
    const dialogId = btn.dataset.dialogId;
    if (!dialogId)
      return;
    const dialog = root.querySelector(`#${dialogId}`);
    if (!dialog)
      return;
    btn.addEventListener("click", () => dialog.show());
  });
  root.querySelectorAll(".sb-close-dialog").forEach((btn) => {
    const dialogId = btn.dataset.dialogId;
    if (!dialogId)
      return;
    const dialog = root.closest(`#${dialogId}`) || document.getElementById(dialogId);
    if (dialog)
      btn.addEventListener("click", () => dialog.close("button"));
  });
  root.querySelectorAll(".sb-open-window").forEach((btn) => {
    btn.addEventListener("click", () => openSampleWindow());
  });
}
var windowSerial = 0;
function openSampleWindow() {
  windowSerial += 1;
  const owner = `storybook-win-${windowSerial}`;
  const record = acquireDesktopRoot(owner);
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", "Sample Window");
  win.innerHTML = `
    <${TAGS.toolbar} slot="toolbar">
      <${TAGS.button} variant="primary">Capture</${TAGS.button}>
      <${TAGS.button}>Preview</${TAGS.button}>
      <${TAGS.iconButton} label="Refresh">${iconSvg("refresh")}</${TAGS.iconButton}>
    </${TAGS.toolbar}>
    <${TAGS.appShell}>
      <span slot="title">Session Capture</span>
      <span slot="subtitle">Launched from the storybook window demo.</span>
      <${TAGS.panel}>
        <span slot="title">Settings</span>
        <${TAGS.field} label="Capture name" wide><${TAGS.input} wide value="session_2026" /></${TAGS.field}>
        <${TAGS.field} label="Mode" wide><${TAGS.select} wide><option>Visible viewport</option><option>Full page</option></${TAGS.select}></${TAGS.field}>
        <${TAGS.field} label="Include images"><${TAGS.checkbox} checked>Yes</${TAGS.checkbox}></${TAGS.field}>
      </${TAGS.panel}>
    </${TAGS.appShell}>
    <${TAGS.statusbar} slot="statusbar"><span>Ready</span><span>Storybook demo</span><span>Mode: preview</${TAGS.statusbar}>
  `;
  win.setRect({ x: 80 + windowSerial * 24, y: 80 + windowSerial * 24, width: 480, height: 380 });
  record.root.append(win);
  win.addEventListener("awwbookmarklet-window-closed", () => releaseDesktopRoot(owner), { once: true });
}
function filterSidebar(query, navTree) {
  const q = query.toLowerCase().trim();
  navTree.querySelectorAll(".sb-nav-item").forEach((btn) => {
    const name = (btn.textContent || "").toLowerCase();
    btn.hidden = q.length > 0 && !name.includes(q);
  });
  navTree.querySelectorAll(".sb-cat-header").forEach((header) => {
    const catId = header.dataset.category;
    const hasVisible = [...navTree.querySelectorAll(`.sb-nav-item[data-story]`)].some((btn) => {
      const story = findStory(btn.dataset.story);
      const cat = CATEGORIES.find((c) => c.stories.includes(story));
      return cat && cat.id === catId && !btn.hidden;
    });
    header.hidden = q.length > 0 && !hasVisible;
  });
}
function initStorybook() {
  const navTree = document.getElementById("sb-nav-tree");
  const content = document.getElementById("sb-content");
  const search = document.getElementById("sb-search");
  const countEl = document.getElementById("sb-component-count");
  if (!navTree || !content)
    return;
  renderSidebar(navTree);
  const total = countAllStories();
  if (countEl)
    countEl.textContent = `${total} components`;
  navTree.addEventListener("click", (e) => {
    const btn = e.target.closest(".sb-nav-item[data-story]");
    if (btn)
      showStory(btn.dataset.story, content, navTree);
  });
  navTree.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const btn = e.target.closest(".sb-nav-item[data-story]");
      if (btn) {
        e.preventDefault();
        showStory(btn.dataset.story, content, navTree);
      }
    }
  });
  search?.addEventListener("input", () => filterSidebar(search.value, navTree));
  const hash = window.location.hash.slice(1);
  if (hash && findStory(hash)) {
    showStory(hash, content, navTree);
  } else {
    showWelcome(content, navTree);
  }
  window.addEventListener("hashchange", () => {
    const h = window.location.hash.slice(1);
    if (h && findStory(h))
      showStory(h, content, navTree);
    else
      showWelcome(content, navTree);
  });
}
initStorybook();
