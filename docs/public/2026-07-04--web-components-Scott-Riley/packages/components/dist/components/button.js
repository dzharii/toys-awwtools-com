import { defineComponent, escapeHtml, getInitialText, hasBooleanAttribute } from "../utils/html.js";
import { renderIcon } from "../utils/icons.js";

const validButtonTypes = new Set(["button", "submit", "reset"]);

export class MyButton extends HTMLElement {
  static observedAttributes = [
    "variant",
    "size",
    "href",
    "target",
    "rel",
    "type",
    "disabled",
    "loading",
    "icon",
    "icon-only",
    "aria-label"
  ];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const label = getInitialText(this);
    const iconName = this.getAttribute("icon") ?? "";
    const isLoading = hasBooleanAttribute(this, "loading");
    const isDisabled = hasBooleanAttribute(this, "disabled") || isLoading;
    const isIconOnly = hasBooleanAttribute(this, "icon-only");
    const accessibleLabel = this.getAttribute("aria-label") || (isIconOnly ? label : "");
    const content = [
      isLoading ? '<span class="my-button__spinner" aria-hidden="true"></span>' : "",
      iconName && !isLoading ? `<span class="my-button__icon">${renderIcon(iconName)}</span>` : "",
      isIconOnly ? "" : `<span class="my-button__label">${escapeHtml(label)}</span>`
    ].join("");

    this.dataset.component = "button";
    this.dataset.variant = this.getAttribute("variant") || "default";
    this.dataset.size = this.getAttribute("size") || "md";

    if (this.hasAttribute("href")) {
      this.renderLink(content, isDisabled, accessibleLabel);
      return;
    }

    this.renderButton(content, isDisabled, accessibleLabel);
  }

  renderButton(content, isDisabled, accessibleLabel) {
    const requestedType = this.getAttribute("type") || "button";
    const buttonType = validButtonTypes.has(requestedType) ? requestedType : "button";
    const disabledAttribute = isDisabled ? " disabled" : "";
    const busyAttribute = hasBooleanAttribute(this, "loading") ? ' aria-busy="true"' : "";
    const labelAttribute = accessibleLabel ? ` aria-label="${escapeHtml(accessibleLabel)}"` : "";

    this.innerHTML = `<button class="my-button" type="${buttonType}"${disabledAttribute}${busyAttribute}${labelAttribute}>${content}</button>`;
  }

  renderLink(content, isDisabled, accessibleLabel) {
    const href = isDisabled ? undefined : this.getAttribute("href");
    const hrefAttribute = href ? ` href="${escapeHtml(href)}"` : "";
    const target = this.getAttribute("target");
    const targetAttribute = target ? ` target="${escapeHtml(target)}"` : "";
    const explicitRel = this.getAttribute("rel");
    const rel = explicitRel || (target === "_blank" ? "noopener noreferrer" : "");
    const relAttribute = rel ? ` rel="${escapeHtml(rel)}"` : "";
    const disabledAttributes = isDisabled ? ' aria-disabled="true" tabindex="-1"' : "";
    const labelAttribute = accessibleLabel ? ` aria-label="${escapeHtml(accessibleLabel)}"` : "";

    this.innerHTML = `<a class="my-button"${hrefAttribute}${targetAttribute}${relAttribute}${disabledAttributes}${labelAttribute}>${content}</a>`;
  }
}

defineComponent("my-button", MyButton);
