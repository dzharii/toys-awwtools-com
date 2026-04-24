// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/constants.js
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
  statusbar: "awwbookmarklet-statusbar"
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/define.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/styles.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/desktop-root.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/geometry.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/window.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/commands.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/menubar.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/menu.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/button.js
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
`;

class AwwButton extends HTMLElement {
  static observedAttributes = ["disabled"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, BUTTON_STYLES]);
    shadow.innerHTML = `<button part="control" type="button"><slot></slot></button>`;
    this.control = shadow.querySelector("button");
    this.control.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.disabled) {
        event.preventDefault();
        return;
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
  attributeChangedCallback() {
    this.control.disabled = this.disabled;
  }
}

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/icon-button.js
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

  ::slotted(svg) {
    width: 16px;
    height: 16px;
    stroke-width: 1.5;
    stroke: currentColor;
    fill: none;
  }
`;

class AwwIconButton extends HTMLElement {
  static observedAttributes = ["disabled"];
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, ICON_BUTTON_STYLES]);
    shadow.innerHTML = `<button part="control" type="button"><slot></slot></button>`;
    this.control = shadow.querySelector("button");
    this.control.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.disabled) {
        event.preventDefault();
        return;
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
  attributeChangedCallback() {
    this.control.disabled = this.disabled;
  }
}

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/input.js
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
var MIRRORED_ATTRIBUTES = ["value", "placeholder", "disabled", "type", "name"];

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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/textarea.js
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
var MIRRORED_ATTRIBUTES2 = ["value", "placeholder", "disabled", "rows", "name"];

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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/checkbox.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/radio.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/select.js
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
var MIRRORED3 = ["disabled", "name", "value"];

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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/range.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/progress.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/tabs.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/listbox.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/group.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/panel.js
var PANEL_STYLES = css`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-space-2, 8px);
  }
`;

class AwwPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, PANEL_STYLES]);
    shadow.innerHTML = `<section part="panel"><slot></slot></section>`;
  }
}

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/statusbar.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/components/register-all.js
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
    [TAGS.statusbar, AwwStatusbar]
  ]);
}

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/themes/default-theme.js
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
  [PUBLIC_TOKENS.shadowDepth]: "0 12px 32px rgba(0, 0, 0, 0.18)",
  [PUBLIC_TOKENS.frostOpacity]: "0.9",
  [PUBLIC_TOKENS.space1]: "4px",
  [PUBLIC_TOKENS.space2]: "8px",
  [PUBLIC_TOKENS.space3]: "12px",
  [PUBLIC_TOKENS.controlHeight]: "30px",
  [PUBLIC_TOKENS.titleHeight]: "32px"
};

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/theme.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/window-manager.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/core/runtime.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/demo/example-tool.js
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

// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-04-19-bookmarklet-ui/src/bookmarklet/index.js
var serial = 0;
function nextOwner(prefix = "bookmarklet-tool") {
  serial += 1;
  return `${prefix}-${serial}`;
}
function openBookmarkletWindow(builder, { ownerPrefix = "bookmarklet-tool", rect = null } = {}) {
  registerAllComponents();
  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);
  const win = typeof builder === "function" ? builder() : buildExampleToolWindow();
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
function bootstrapExampleTool() {
  return openBookmarkletWindow(() => buildExampleToolWindow({ title: "Page Extraction Tool" }), {
    ownerPrefix: "example-tool"
  });
}
function shutdownAll() {
  emergencyTeardown("*");
}
registerAllComponents();
globalThis.awwtools = globalThis.awwtools || {};
globalThis.awwtools.bookmarkletUi = {
  openWindow: openBookmarkletWindow,
  bootstrapExampleTool,
  shutdownAll
};
globalThis.awwbookmarklet = globalThis.awwtools.bookmarkletUi;
export {
  shutdownAll,
  openBookmarkletWindow,
  bootstrapExampleTool
};

//# debugId=47F3945D9AF49B5864756E2164756E21
//# sourceMappingURL=index.js.map
