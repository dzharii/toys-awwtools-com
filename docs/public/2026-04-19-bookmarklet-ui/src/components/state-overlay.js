import { normalizeTone } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const STATE_STYLES = css`
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

const STATE_TONES = {
  loading: "info",
  empty: "neutral",
  error: "danger",
  blocked: "warning",
  success: "success",
  custom: "neutral"
};

export class AwwStateOverlay extends HTMLElement {
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

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  #sync() {
    const state = this.getAttribute("state") || "loading";
    const fallbackTone = STATE_TONES[state] || "neutral";
    this.dataset.tone = normalizeTone(this.getAttribute("tone"), fallbackTone);
    this.labelNode.textContent = this.getAttribute("label") || state;
    this.setAttribute("role", state === "error" || state === "blocked" ? "alert" : "status");
    this.setAttribute("aria-live", state === "error" || state === "blocked" ? "assertive" : "polite");
  }
}
