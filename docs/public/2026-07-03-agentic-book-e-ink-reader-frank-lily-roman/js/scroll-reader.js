// Scroll-mode reading. A continuous column inside the scrollable stage.
// Position is preserved by scroll fraction across settings changes. Normal
// scrolling never triggers the E Ink flash (only major jumps do, coordinated
// by the app).

import { clamp } from "./utils.js";

export class ScrollReader {
  /**
   * @param {HTMLElement} scrollEl the scrolling container (stage)
   * @param {HTMLElement} hostEl   the element that holds the content column
   */
  constructor(scrollEl, hostEl) {
    this.scrollEl = scrollEl;
    this.host = hostEl;
    this.content = null;
  }

  /** Attach content for scroll reading. */
  layout(contentEl) {
    this.content = contentEl;
    contentEl.classList.remove("content--paged");
    contentEl.style.cssText = ""; // clear any paged inline styles
    this.host.replaceChildren(contentEl);
    this.scrollEl.scrollTop = 0;
  }

  /** Detach content and clear the host (used when closing a document). */
  detach() {
    this.content = null;
    this.host.replaceChildren();
    this.scrollEl.scrollTop = 0;
  }

  getAnchorFraction() {
    const max = this.scrollEl.scrollHeight - this.scrollEl.clientHeight;
    if (max <= 0) return 0;
    return clamp(this.scrollEl.scrollTop / max, 0, 1);
  }

  setAnchorFraction(frac) {
    const max = this.scrollEl.scrollHeight - this.scrollEl.clientHeight;
    this.scrollEl.scrollTop = clamp(frac, 0, 1) * Math.max(0, max);
  }

  scrollByPage(direction) {
    const amount = this.scrollEl.clientHeight * 0.9 * direction;
    this.scrollEl.scrollBy({ top: amount, behavior: "auto" });
  }

  toStart() {
    this.scrollEl.scrollTop = 0;
  }

  toEnd() {
    this.scrollEl.scrollTop = this.scrollEl.scrollHeight;
  }
}
