import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const PROGRESS_STYLES = css`
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

const MIRRORED = ["value", "max"];

export class AwwProgress extends HTMLElement {
  static observedAttributes = MIRRORED;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, PROGRESS_STYLES]);
    shadow.innerHTML = `<progress part="control"></progress>`;
    this.control = shadow.querySelector("progress");
  }

  get value() { return this.control.value; }
  set value(nextValue) { this.setAttribute("value", String(nextValue ?? "")); }
  get max() { return this.control.max; }
  set max(nextValue) { this.setAttribute("max", String(nextValue ?? "")); }

  attributeChangedCallback(name, _prev, next) {
    if (name === "value") {
      if (next === null) this.control.removeAttribute("value");
      else this.control.value = Number(next);
      return;
    }

    if (name === "max") {
      if (next === null) this.control.removeAttribute("max");
      else this.control.max = Number(next);
      return;
    }

    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }

    this.control.setAttribute(name, next);
  }
}
