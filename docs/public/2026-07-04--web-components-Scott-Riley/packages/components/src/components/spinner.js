import { defineComponent, escapeHtml } from "../utils/html.js";

export class MySpinner extends HTMLElement {
  static observedAttributes = ["label", "size"];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const label = this.getAttribute("label") || "Loading";
    this.dataset.component = "spinner";
    this.dataset.size = this.getAttribute("size") || "md";
    this.innerHTML = `<span class="my-spinner__mark" aria-hidden="true"></span><span class="my-visually-hidden">${escapeHtml(label)}</span>`;
    this.setAttribute("role", "status");
  }
}

defineComponent("my-spinner", MySpinner);
