import { clampRect, rectToStyle } from "../core/geometry.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const WINDOW_STYLES = css`
  :host {
    position: fixed;
    display: block;
    pointer-events: auto;
    contain: layout style;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-window-bg, #eef1f5);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 12px 32px rgba(0, 0, 0, 0.18));
    border-radius: 0;
    min-width: 320px;
    min-height: 200px;
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
      var(--awwbookmarklet-titlebar-active-bg, rgba(46, 92, 142, 0.78))
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

  .system,
  .title-command {
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

  .system:focus-visible,
  .title-command:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .system:active,
  .title-command:active {
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

export class AwwWindow extends HTMLElement {
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
          <button class="system" part="system-button" type="button" aria-label="System menu">◫</button>
          <div class="title" part="title"></div>
          <div class="title-commands" part="title-commands">
            <button class="title-command close" part="close-button" type="button" aria-label="Close">×</button>
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
  }

  attributeChangedCallback(name) {
    if (name === "title") this.#syncTitle();
    if (name === "closable") this.#syncClosable();
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
    if (!this.isClosable()) return;

    const allowed = this.dispatchEvent(
      new CustomEvent("awwbookmarklet-window-close-request", { bubbles: true, composed: true, cancelable: true })
    );

    if (!allowed) return;
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
    const systemButton = shadow.querySelector(".system");
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
      detail: { anchor: this.shadowRoot.querySelector(".system") }
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
    if (!isPrimaryButton(event)) return;
    if (event.target.closest("button")) return;

    event.preventDefault();
    this.#manager?.focus(this);

    this.#drag = {
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startRect: this.getRect()
    };

    this.shadowRoot.querySelector(".titlebar").style.cursor = "grabbing";
    this.#attachPointerFlow();
  };

  #onPointerDownResize = (event) => {
    if (!isPrimaryButton(event)) return;
    event.preventDefault();

    const edge = closestEdge(event.currentTarget);
    if (!edge) return;

    this.#manager?.focus(this);

    this.#resize = {
      edge,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startRect: this.getRect(),
      previewRect: this.getRect()
    };

    this.#attachPointerFlow();
  };

  #attachPointerFlow() {
    window.addEventListener("pointermove", this.#onPointerMove, { passive: true });
    window.addEventListener("pointerup", this.#onPointerUp, { once: true });
    window.addEventListener("pointercancel", this.#onPointerUp, { once: true });
  }

  #teardownPointerFlow() {
    window.removeEventListener("pointermove", this.#onPointerMove);
    window.removeEventListener("pointerup", this.#onPointerUp);
    window.removeEventListener("pointercancel", this.#onPointerUp);

    if (this.#raf) {
      cancelAnimationFrame(this.#raf);
      this.#raf = 0;
    }

    this.style.transform = "";
    this.shadowRoot.querySelector(".titlebar").style.cursor = "grab";
  }

  #onPointerMove = (event) => {
    if (this.#drag) {
      this.#drag.currentX = event.clientX;
      this.#drag.currentY = event.clientY;
      this.#scheduleFrame();
      return;
    }

    if (this.#resize) {
      this.#resize.currentX = event.clientX;
      this.#resize.currentY = event.clientY;
      this.#scheduleFrame();
    }
  };

  #onPointerUp = () => {
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
    if (this.#raf) return;
    this.#raf = requestAnimationFrame(() => {
      this.#raf = 0;
      if (this.#drag) this.#flushDragFrame();
      if (this.#resize) this.#flushResizeFrame();
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

    let x = startRect.x;
    let y = startRect.y;
    let width = startRect.width;
    let height = startRect.height;

    if (edge.includes("e")) width = startRect.width + dx;
    if (edge.includes("s")) height = startRect.height + dy;
    if (edge.includes("w")) {
      width = startRect.width - dx;
      x = startRect.x + dx;
    }
    if (edge.includes("n")) {
      height = startRect.height - dy;
      y = startRect.y + dy;
    }

    const previewRect = clampRect({ x, y, width, height });
    this.#resize.previewRect = previewRect;
    Object.assign(this.style, rectToStyle(previewRect));
  }
}
