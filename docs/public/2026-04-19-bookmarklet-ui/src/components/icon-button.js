import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const ICON_BUTTON_STYLES = css`
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

export class AwwIconButton extends HTMLElement {
  static observedAttributes = ["disabled"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, ICON_BUTTON_STYLES]);
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
