import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const SPLITTER_SIZE = 8;
const DEFAULT_VALUE = 280;

const SPLIT_PANE_STYLES = css`
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

/**
 * Clamps the start pane size so both panes remain usable when space allows.
 *
 * @param {number} value
 * @param {{ available: number, minStart?: number, minEnd?: number, maxStart?: number }} options
 * @returns {number}
 */
export function clampSplitValue(value, { available, minStart = 160, minEnd = 240, maxStart = Infinity } = {}) {
  const numericValue = toFiniteNumber(value, DEFAULT_VALUE);
  const usable = Math.max(0, toFiniteNumber(available, 0));
  const hardMin = Math.max(0, toFiniteNumber(minStart, 160));
  const hardMax = Math.max(0, usable - Math.max(0, toFiniteNumber(minEnd, 240)));
  const effectiveMax = Number.isFinite(maxStart) ? Math.min(hardMax, Math.max(0, maxStart)) : hardMax;
  if (effectiveMax < hardMin) return Math.max(0, Math.min(numericValue, hardMax));
  return Math.min(Math.max(numericValue, hardMin), effectiveMax);
}

/**
 * Calculates the next split value from pointer movement.
 *
 * @param {"horizontal"|"vertical"} direction
 * @param {{ startValue: number, startClientX: number, startClientY: number, clientX: number, clientY: number }} input
 * @returns {number}
 */
export function splitValueFromPointerDelta(direction, input) {
  return input.startValue + (direction === "vertical" ? input.clientY - input.startClientY : input.clientX - input.startClientX);
}

export function normalizeSplitDirection(value) {
  return value === "vertical" ? "vertical" : "horizontal";
}

/**
 * Generic two-pane resizable layout component.
 *
 * Attributes: direction, value, min-start, min-end, max-start, disabled.
 * Events: awwbookmarklet-split-pane-resize, awwbookmarklet-split-pane-resize-commit.
 */
const BaseHTMLElement = globalThis.HTMLElement || class {};

export class AwwSplitPane extends BaseHTMLElement {
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
    if (!this.hasAttribute("direction")) this.setAttribute("direction", "horizontal");
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
    if (this.getAttribute("direction") !== direction) this.setAttribute("direction", direction);
    this.#setValue(this.value, { emit: false, reflect: false });
    this.splitter?.setAttribute("aria-orientation", direction === "vertical" ? "horizontal" : "vertical");
    this.splitter?.setAttribute("aria-label", this.getAttribute("aria-label") || "Resize panels");
  }

  #setValue(value, { emit = true, commit = false, dragging = false, reflect = true } = {}) {
    const next = Math.round(this.#clamp(value));
    if (reflect && this.getAttribute("value") !== String(next)) this.setAttribute("value", String(next));
    this.style.setProperty("--_start-size", `${next}px`);
    this.style.setProperty("--_splitter-size", `${SPLITTER_SIZE}px`);
    this.#syncAria(next);
    if (emit) this.#emit(commit ? "awwbookmarklet-split-pane-resize-commit" : "awwbookmarklet-split-pane-resize", { value: next, direction: this.direction, dragging });
  }

  #clamp(value) {
    const rect = this.getBoundingClientRect();
    const available = (this.direction === "vertical" ? rect.height : rect.width) - SPLITTER_SIZE;
    return clampSplitValue(value, {
      available,
      minStart: toFiniteNumber(this.getAttribute("min-start"), 160),
      minEnd: toFiniteNumber(this.getAttribute("min-end"), 240),
      maxStart: this.hasAttribute("max-start") ? toFiniteNumber(this.getAttribute("max-start"), Infinity) : Infinity,
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
    if (this.hasAttribute("disabled")) return;
    event.preventDefault();
    this.drag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startValue: this.value,
    };
    this.splitter.setPointerCapture?.(event.pointerId);
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("pointercancel", this.onPointerUp);
  }

  #handlePointerMove(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    const next = splitValueFromPointerDelta(this.direction, { ...this.drag, clientX: event.clientX, clientY: event.clientY });
    this.#setValue(next, { dragging: true });
  }

  #finishPointer(event) {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    this.splitter.releasePointerCapture?.(event.pointerId);
    this.drag = null;
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("pointercancel", this.onPointerUp);
    this.#emit("awwbookmarklet-split-pane-resize-commit", { value: this.value, direction: this.direction });
  }

  #handleKeydown(event) {
    if (this.hasAttribute("disabled")) return;
    const step = event.shiftKey ? 50 : 10;
    const horizontal = this.direction === "horizontal";
    const max = Number(this.splitter.getAttribute("aria-valuemax")) || this.value;
    const min = Number(this.splitter.getAttribute("aria-valuemin")) || 0;
    let next = null;
    if (horizontal && event.key === "ArrowLeft") next = this.value - step;
    if (horizontal && event.key === "ArrowRight") next = this.value + step;
    if (!horizontal && event.key === "ArrowUp") next = this.value - step;
    if (!horizontal && event.key === "ArrowDown") next = this.value + step;
    if (event.key === "Home") next = min;
    if (event.key === "End") next = max;
    if (next === null) return;
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
