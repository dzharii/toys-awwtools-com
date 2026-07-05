import { defineComponent } from "../utils/html.js";

export class MyCard extends HTMLElement {
  static observedAttributes = ["tone"];

  connectedCallback() {
    this.syncState();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.syncState();
    }
  }

  syncState() {
    this.dataset.component = "card";
    this.dataset.tone = this.getAttribute("tone") || "default";
    this.setAttribute("role", this.getAttribute("role") || "group");
  }
}

defineComponent("my-card", MyCard);
