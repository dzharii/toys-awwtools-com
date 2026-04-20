import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const BUTTON_STYLES = css`
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

export class AwwButton extends HTMLElement {
  static observedAttributes = ["disabled"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, BUTTON_STYLES]);
    shadow.innerHTML = `<button part="control" type="button"><slot></slot></button>`;

    this.control = shadow.querySelector("button");
    this.control.addEventListener("click", (event) => {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
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
