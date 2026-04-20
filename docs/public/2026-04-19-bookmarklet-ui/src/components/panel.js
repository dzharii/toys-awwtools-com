import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const PANEL_STYLES = css`
  :host {
    display: block;
    border: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-space-2, 8px);
  }
`;

export class AwwPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, PANEL_STYLES]);
    shadow.innerHTML = `<section part="panel"><slot></slot></section>`;
  }
}
