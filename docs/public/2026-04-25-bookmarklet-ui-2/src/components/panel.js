import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const PANEL_STYLES = css`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-space-2, 8px);
  }

  section {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  .header {
    display: none;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-space-2, 8px);
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-bottom: 6px;
  }

  :host([data-has-header="true"]) .header {
    display: flex;
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .subtitle {
    color: var(--awwbookmarklet-text-muted, #586272);
    overflow-wrap: anywhere;
  }

  .body {
    min-width: 0;
  }

  .footer {
    display: none;
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: 6px;
  }

  :host([data-has-footer="true"]) .footer {
    display: block;
  }
`;

export class AwwPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, PANEL_STYLES]);
    shadow.innerHTML = `
      <section part="panel">
        <header class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="subtitle" part="subtitle"><slot name="subtitle"></slot></div>
          </div>
          <div part="actions"><slot name="actions"></slot></div>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
    this.titleSlot = shadow.querySelector("slot[name='title']");
    this.subtitleSlot = shadow.querySelector("slot[name='subtitle']");
    this.actionsSlot = shadow.querySelector("slot[name='actions']");
    this.footerSlot = shadow.querySelector("slot[name='footer']");
    [this.titleSlot, this.subtitleSlot, this.actionsSlot, this.footerSlot].forEach((slot) => {
      slot.addEventListener("slotchange", () => this.#sync());
    });
  }

  connectedCallback() {
    this.#sync();
  }

  #sync() {
    const hasHeader = [this.titleSlot, this.subtitleSlot, this.actionsSlot].some((slot) => slot.assignedNodes({ flatten: true }).length > 0);
    const hasFooter = this.footerSlot.assignedNodes({ flatten: true }).length > 0;
    this.dataset.hasHeader = hasHeader ? "true" : "false";
    this.dataset.hasFooter = hasFooter ? "true" : "false";
  }
}
