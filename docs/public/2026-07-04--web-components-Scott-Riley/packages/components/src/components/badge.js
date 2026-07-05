import { defineComponent, escapeHtml, getInitialText } from "../utils/html.js";

export class MyBadge extends HTMLElement {
  static observedAttributes = ["variant"];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    this.dataset.component = "badge";
    this.dataset.variant = this.getAttribute("variant") || "neutral";
    this.innerHTML = `<span class="my-badge">${escapeHtml(getInitialText(this))}</span>`;
  }
}

defineComponent("my-badge", MyBadge);
