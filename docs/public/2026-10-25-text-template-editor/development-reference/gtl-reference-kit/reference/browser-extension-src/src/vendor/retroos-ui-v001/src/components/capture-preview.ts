// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

/**
 * awwbookmarklet-capture-preview
 *
 * Attributes:
 *   busy              — boolean
 *   busy-label        — string (overlay label)
 *   description-empty — boolean
 *   media-empty       — boolean
 *
 * Events:
 *   (none)
 *
 * Slots:
 *   meta              — source metadata line (date/link/domain)
 *   description       — editable or read-only description content
 *   description-empty — fallback text when description is empty
 *   media             — image or media preview node
 *   media-empty       — fallback text when media is empty
 *   actions           — contextual actions for the preview
 *
 * CSS parts:
 *   surface
 *   meta
 *   description
 *   media
 *   overlay
 *   empty
 */

const CAPTURE_PREVIEW_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .surface {
    position: relative;
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    min-width: 0;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
  }

  .meta {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.4;
    min-height: 18px;
  }

  .description,
  .media {
    min-width: 0;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-surface-inset-bg, #f2f5f8);
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
  }

  .description-body,
  .media-body {
    min-width: 0;
  }

  .empty {
    display: none;
    color: var(--awwbookmarklet-text-muted, #586272);
    font-style: italic;
  }

  :host([data-description-empty="true"]) .description-body {
    display: none;
  }

  :host([data-description-empty="true"]) .description-empty {
    display: block;
  }

  :host([data-media-empty="true"]) .media-body {
    display: none;
  }

  :host([data-media-empty="true"]) .media-empty {
    display: block;
  }

  .actions {
    display: none;
    min-width: 0;
  }

  :host([data-has-actions="true"]) .actions {
    display: block;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: var(--_surface-radius);
    background: color-mix(in srgb, var(--awwbookmarklet-surface-raised-bg, #fff) 70%, transparent);
    color: var(--awwbookmarklet-input-fg, #111720);
    font-weight: 700;
  }

  :host([busy]) .overlay {
    display: flex;
  }
`;

export class AwwCapturePreview extends HTMLElement {
  static observedAttributes = ["busy", "busy-label", "description-empty", "media-empty"];
  declare private readonly actionsSlot: HTMLSlotElement;
  declare private readonly descriptionEmptySlot: HTMLSlotElement;
  declare private readonly mediaEmptySlot: HTMLSlotElement;
  declare private readonly overlayLabel: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CAPTURE_PREVIEW_STYLES]);
    shadow.innerHTML = `
      <section class="surface" part="surface">
        <div class="meta" part="meta"><slot name="meta"></slot></div>
        <section class="description" part="description">
          <div class="description-body"><slot name="description"></slot></div>
          <div class="empty description-empty" part="empty"><slot name="description-empty"></slot></div>
        </section>
        <section class="media" part="media">
          <div class="media-body"><slot name="media"></slot></div>
          <div class="empty media-empty" part="empty"><slot name="media-empty"></slot></div>
        </section>
        <div class="actions"><slot name="actions"></slot></div>
        <div class="overlay" part="overlay"><span></span></div>
      </section>
    `;
    this.actionsSlot = (shadow.querySelector("slot[name='actions']") as HTMLSlotElement);
    this.descriptionEmptySlot = (shadow.querySelector("slot[name='description-empty']") as HTMLSlotElement);
    this.mediaEmptySlot = (shadow.querySelector("slot[name='media-empty']") as HTMLSlotElement);
    this.overlayLabel = (shadow.querySelector(".overlay span") as HTMLElement);
    this.actionsSlot.addEventListener("slotchange", () => this.#sync());
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    if (this.descriptionEmptySlot.assignedNodes({ flatten: true }).length === 0) {
      this.descriptionEmptySlot.textContent = "No description available.";
    }
    if (this.mediaEmptySlot.assignedNodes({ flatten: true }).length === 0) {
      this.mediaEmptySlot.textContent = "No media available.";
    }
    this.dataset.descriptionEmpty = this.hasAttribute("description-empty") ? "true" : "false";
    this.dataset.mediaEmpty = this.hasAttribute("media-empty") ? "true" : "false";
    this.dataset.hasActions = this.actionsSlot.assignedNodes({ flatten: true }).length > 0 ? "true" : "false";
    this.setAttribute("aria-busy", this.hasAttribute("busy") ? "true" : "false");
    this.overlayLabel.textContent = this.getAttribute("busy-label") || "Refreshing preview...";
  }
}
