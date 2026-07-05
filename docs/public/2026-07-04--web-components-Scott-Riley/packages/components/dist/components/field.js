import { defineComponent, hasBooleanAttribute } from "../utils/html.js";

let fieldIdCounter = 0;

export class MyField extends HTMLElement {
  static observedAttributes = ["label", "hint", "error", "required"];

  connectedCallback() {
    this.fieldId = this.fieldId || `my-field-${++fieldIdCounter}`;
    if (!this.controlFragment) {
      this.controlFragment = document.createDocumentFragment();
      this.controlFragment.append(...this.childNodes);
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const label = this.getAttribute("label") || "Field";
    const hint = this.getAttribute("hint") || "";
    const error = this.getAttribute("error") || "";
    const existingControlWrapper = this.querySelector(".my-field__control");

    if (existingControlWrapper) {
      this.controlFragment.append(...existingControlWrapper.childNodes);
    }

    this.dataset.component = "field";
    this.dataset.invalid = String(Boolean(error));
    this.replaceChildren();

    const labelElement = document.createElement("label");
    labelElement.className = "my-field__label";
    labelElement.textContent = label;

    if (hasBooleanAttribute(this, "required")) {
      const requiredMarker = document.createElement("span");
      requiredMarker.setAttribute("aria-hidden", "true");
      requiredMarker.textContent = " *";
      labelElement.append(requiredMarker);
    }

    const controlWrapper = document.createElement("div");
    controlWrapper.className = "my-field__control";
    controlWrapper.append(this.controlFragment);

    this.append(labelElement, controlWrapper);

    if (hint) {
      const hintElement = document.createElement("p");
      hintElement.className = "my-field__hint";
      hintElement.id = `${this.fieldId}-hint`;
      hintElement.textContent = hint;
      this.append(hintElement);
    }

    if (error) {
      const errorElement = document.createElement("p");
      errorElement.className = "my-field__error";
      errorElement.id = `${this.fieldId}-error`;
      errorElement.textContent = error;
      this.append(errorElement);
    }

    const formControl = controlWrapper.querySelector("input, select, textarea");
    const describedByIds = [
      hint ? `${this.fieldId}-hint` : "",
      error ? `${this.fieldId}-error` : "",
    ].filter(Boolean);

    if (formControl && labelElement) {
      formControl.id ||= this.fieldId;
      labelElement.setAttribute("for", formControl.id);

      if (describedByIds.length > 0) {
        formControl.setAttribute("aria-describedby", describedByIds.join(" "));
      }

      if (error) {
        formControl.setAttribute("aria-invalid", "true");
      } else {
        formControl.removeAttribute("aria-invalid");
      }
    }
  }
}

defineComponent("my-field", MyField);
