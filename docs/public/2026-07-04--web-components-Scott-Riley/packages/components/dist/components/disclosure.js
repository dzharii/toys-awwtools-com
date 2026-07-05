import { defineComponent, hasBooleanAttribute } from "../utils/html.js";

let disclosureIdCounter = 0;

export class MyDisclosure extends HTMLElement {
  static observedAttributes = ["summary", "open"];

  connectedCallback() {
    this.panelId = this.panelId || `my-disclosure-panel-${++disclosureIdCounter}`;
    if (!this.contentFragment) {
      this.contentFragment = document.createDocumentFragment();
      this.contentFragment.append(...this.childNodes);
    }
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const isOpen = hasBooleanAttribute(this, "open");
    const summary = this.getAttribute("summary") || "Details";
    const existingPanel = this.querySelector(".my-disclosure__panel");

    if (existingPanel) {
      this.contentFragment.append(...existingPanel.childNodes);
    }

    this.dataset.component = "disclosure";
    this.replaceChildren();

    const summaryButton = document.createElement("button");
    summaryButton.className = "my-disclosure__summary";
    summaryButton.type = "button";
    summaryButton.setAttribute("aria-expanded", String(isOpen));
    summaryButton.setAttribute("aria-controls", this.panelId);

    const summaryText = document.createElement("span");
    summaryText.textContent = summary;

    const summaryIcon = document.createElement("my-icon");
    summaryIcon.setAttribute("name", "arrow-right");

    const panel = document.createElement("div");
    panel.className = "my-disclosure__panel";
    panel.id = this.panelId;
    panel.hidden = !isOpen;
    panel.append(this.contentFragment);

    summaryButton.append(summaryText, summaryIcon);
    this.append(summaryButton, panel);

    this.querySelector("button")?.addEventListener("click", () => {
      this.contentFragment.append(...panel.childNodes);
      this.toggleAttribute("open");
    });
  }
}

defineComponent("my-disclosure", MyDisclosure);
