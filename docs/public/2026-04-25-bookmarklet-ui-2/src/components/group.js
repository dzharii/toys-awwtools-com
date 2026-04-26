import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const GROUP_STYLES = css`
  :host { display: block; }

  .group {
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 86%, #ffffff 14%);
    padding: var(--awwbookmarklet-group-padding, var(--awwbookmarklet-surface-padding, 10px));
  }

  .caption {
    font-weight: 600;
    margin-bottom: var(--awwbookmarklet-space-2, 8px);
    color: color-mix(in srgb, var(--awwbookmarklet-input-fg, #111720) 90%, #ffffff 10%);
  }

  .content {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
  }
`;

export class AwwGroup extends HTMLElement {
  static observedAttributes = ["caption"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, GROUP_STYLES]);
    shadow.innerHTML = `<section class="group" part="group"><div class="caption" part="caption"></div><div class="content" part="content"><slot></slot></div></section>`;
  }

  connectedCallback() { this.#syncCaption(); }
  attributeChangedCallback() { this.#syncCaption(); }

  #syncCaption() {
    const caption = this.getAttribute("caption") || "";
    const captionEl = this.shadowRoot.querySelector(".caption");
    captionEl.textContent = caption;
    captionEl.hidden = !caption;
  }
}
