import { defineComponent, escapeHtml, getInitialText } from "../utils/html.js";
import { renderIcon } from "../utils/icons.js";

const iconByVariant = {
  info: "info",
  success: "check",
  warning: "warning",
  danger: "warning"
};

export class MyAlert extends HTMLElement {
  static observedAttributes = ["variant", "heading"];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const variant = this.getAttribute("variant") || "info";
    const heading = this.getAttribute("heading") || "";
    const icon = iconByVariant[variant] || "info";

    this.dataset.component = "alert";
    this.dataset.variant = variant;
    this.innerHTML = `
      <div class="my-alert__icon">${renderIcon(icon)}</div>
      <div class="my-alert__content">
        ${heading ? `<p class="my-alert__heading">${escapeHtml(heading)}</p>` : ""}
        <p class="my-alert__message">${escapeHtml(getInitialText(this))}</p>
      </div>
    `;
    this.setAttribute("role", variant === "danger" ? "alert" : "status");
  }
}

defineComponent("my-alert", MyAlert);
