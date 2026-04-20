import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const RANGE_STYLES = css`
  :host { display: inline-block; min-width: 160px; }

  input[type="range"] {
    width: 100%;
    margin: 0;
    accent-color: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input[type="range"]:focus-visible { outline: none; box-shadow: var(--_ring); }
`;

const MIRRORED = ["min", "max", "step", "value", "disabled", "name"];

export class AwwRange extends HTMLElement {
  static observedAttributes = MIRRORED;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, RANGE_STYLES]);
    shadow.innerHTML = `<input type="range" part="control" />`;

    this.control = shadow.querySelector("input");
    this.control.addEventListener("input", () => {
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    });
  }

  attributeChangedCallback(name, _prev, next) {
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
