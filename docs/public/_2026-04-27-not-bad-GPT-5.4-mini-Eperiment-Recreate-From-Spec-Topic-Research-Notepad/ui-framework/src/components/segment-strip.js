import { copyToClipboard } from "../core/clipboard.js";
import { dispatchComponentEvent } from "../core/component-utils.js";
import { getSegmentCopyValue, normalizeContextSegments, segmentsEqual } from "../core/context-segments.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const SEGMENT_STRIP_STYLES = css`
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
  if (segment.label && copyValue) return `Copy ${segment.label}: ${copyValue}`;
  if (copyValue) return `Copy segment: ${copyValue}`;
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

export class AwwSegmentStrip extends HTMLElement {
  static observedAttributes = ["value", "copy-behavior"];

  #segments = [];
  #previousByKey = new Map();
  #changedTimers = new Map();

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
    for (const timer of this.#changedTimers.values()) clearTimeout(timer);
    this.#changedTimers.clear();
  }

  attributeChangedCallback() {
    if (this.hasAttribute("value")) this.#segments = normalizeContextSegments(this.getAttribute("value"));
    this.#render();
  }

  get segments() {
    return this.#segments.map((segment) => ({ ...segment, actions: [...(segment.actions || [])] }));
  }

  set segments(value) {
    this.#segments = normalizeContextSegments(value);
    this.removeAttribute("value");
    this.#render();
  }

  #render() {
    if (!this.strip) return;

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
        node.setAttribute("aria-label", segment.copyable ? segmentLabel(segment) : (segment.label || segment.value));
        node.setAttribute("aria-disabled", segment.disabled ? "true" : "false");
      }

      const previous = this.#previousByKey.get(segment.key);
      if ((segment.changed || (previous && !segmentsEqual(previous, segment))) && !segment.disabled) {
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

  async #requestCopy(segment, anchor, originalEvent) {
    if (!segment || segment.disabled || !segment.copyable) return;
    const detail = eventDetail(segment, anchor, originalEvent);
    dispatchComponentEvent(this, "awwbookmarklet-segment-copy", detail);

    if (this.getAttribute("copy-behavior") === "clipboard") {
      const result = await copyToClipboard({ text: detail.copyValue });
      dispatchComponentEvent(this, "awwbookmarklet-segment-copy-result", { ...detail, result });
    }
  }

  #activate(segment, anchor, originalEvent) {
    if (!segment || segment.disabled) return;
    dispatchComponentEvent(this, "awwbookmarklet-segment-activate", eventDetail(segment, anchor, originalEvent));
  }

  #onClick = (event) => {
    const node = event.target.closest?.(".segment");
    const segment = this.#segmentFromNode(node);
    if (segment?.interactive || segment?.actions.length) this.#activate(segment, node, event);
  };

  #onDoubleClick = (event) => {
    const node = event.target.closest?.(".segment");
    this.#requestCopy(this.#segmentFromNode(node), node, event);
  };

  #onKeyDown = (event) => {
    const node = event.target.closest?.(".segment");
    const segment = this.#segmentFromNode(node);
    if (!segment) return;

    if (event.key === "Enter") {
      event.preventDefault();
      if (segment.copyable) this.#requestCopy(segment, node, event);
      else this.#activate(segment, node, event);
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
    if (!segment || segment.disabled) return;
    event.preventDefault();
    dispatchComponentEvent(this, "awwbookmarklet-segment-menu-request", eventDetail(segment, node, event));
  };
}
