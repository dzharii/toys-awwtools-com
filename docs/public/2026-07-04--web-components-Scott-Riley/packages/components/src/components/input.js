import { defineComponent, escapeHtml, hasBooleanAttribute } from "../utils/html.js";

let inputIdCounter = 0;

export class MyInput extends HTMLElement {
  static observedAttributes = ["label", "name", "value", "placeholder", "hint", "error", "required", "disabled"];

  connectedCallback() {
    this.inputId = this.inputId || `my-input-${++inputIdCounter}`;
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const label = this.getAttribute("label") || this.getAttribute("name") || "Text field";
    const hint = this.getAttribute("hint") || "";
    const error = this.getAttribute("error") || "";
    const describedByIds = [
      hint ? `${this.inputId}-hint` : "",
      error ? `${this.inputId}-error` : ""
    ].filter(Boolean);

    this.dataset.component = "input";
    this.dataset.invalid = String(Boolean(error));

    this.innerHTML = `
      <label class="my-input__label" for="${this.inputId}">
        ${escapeHtml(label)}${hasBooleanAttribute(this, "required") ? ' <span aria-hidden="true">*</span>' : ""}
      </label>
      <input
        class="my-input__control"
        id="${this.inputId}"
        name="${escapeHtml(this.getAttribute("name") || "")}"
        value="${escapeHtml(this.currentValue ?? this.getAttribute("value") ?? "")}"
        placeholder="${escapeHtml(this.getAttribute("placeholder") || "")}"
        ${hasBooleanAttribute(this, "required") ? "required" : ""}
        ${hasBooleanAttribute(this, "disabled") ? "disabled" : ""}
        ${error ? 'aria-invalid="true"' : ""}
        ${describedByIds.length ? `aria-describedby="${describedByIds.join(" ")}"` : ""}
      />
      ${hint ? `<p class="my-input__hint" id="${this.inputId}-hint">${escapeHtml(hint)}</p>` : ""}
      ${error ? `<p class="my-input__error" id="${this.inputId}-error">${escapeHtml(error)}</p>` : ""}
    `;

    this.inputElement = this.querySelector("input");
    this.inputElement?.addEventListener("input", (event) => {
      this.currentValue = event.currentTarget.value;
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
}

defineComponent("my-input", MyInput);
