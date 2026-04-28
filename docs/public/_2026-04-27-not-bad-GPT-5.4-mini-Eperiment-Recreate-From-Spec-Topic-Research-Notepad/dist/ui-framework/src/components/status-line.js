import { normalizeTone } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const STATUS_LINE_STYLES = css`
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

export class AwwStatusLine extends HTMLElement {
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
    if (options.tone) this.setAttribute("tone", options.tone);
    if (options.live) this.setAttribute("live", options.live);
    this.textContent = String(message ?? "");
  }

  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
    const live = this.getAttribute("live") || "polite";
    this.setAttribute("aria-live", ["off", "polite", "assertive"].includes(live) ? live : "polite");
    this.setAttribute("aria-busy", this.hasAttribute("busy") ? "true" : "false");
  }
}
