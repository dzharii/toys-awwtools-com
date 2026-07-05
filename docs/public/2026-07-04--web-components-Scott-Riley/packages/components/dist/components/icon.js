import { defineComponent, escapeHtml } from "../utils/html.js";
import { renderIcon } from "../utils/icons.js";

export class MyIcon extends HTMLElement {
  static observedAttributes = ["name", "label"];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const label = this.getAttribute("label") || "";
    this.dataset.component = "icon";
    this.innerHTML = renderIcon(this.getAttribute("name") || "info", escapeHtml(label));
  }
}

defineComponent("my-icon", MyIcon);
