import { ROOT_Z_INDEX } from "../core/constants.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const DESKTOP_ROOT_STYLES = css`
  :host {
    position: fixed;
    inset: 0;
    z-index: ${ROOT_Z_INDEX};
    pointer-events: none;
    display: block;
    contain: layout style;
    background: var(--awwbookmarklet-workspace-bg, transparent);
  }

  #layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  ::slotted(awwbookmarklet-window),
  ::slotted(awwbookmarklet-menubar),
  ::slotted(awwbookmarklet-menu) {
    pointer-events: auto;
  }
`;

export class AwwDesktopRoot extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, DESKTOP_ROOT_STYLES]);

    shadow.innerHTML = `
      <div id="layer" part="layer">
        <slot></slot>
      </div>
    `;
  }
}
