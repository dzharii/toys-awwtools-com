// Page-mode pagination using the CSS multi-column technique.
//
// The content element is given a fixed height and a column-width equal to the
// page width. With column-fill:auto, overflow content flows into new columns to
// the right, expanding scrollWidth. We reveal one page by translating the
// content horizontally. This is fast (no per-block DOM measurement loop) and
// stable across fonts and viewports.

import { clamp } from "./utils.js";
import { log } from "./logging.js";

const COLUMN_GAP = 48; // minimum px between page columns (widened per-measure below)
const V_MARGIN = 8; // extra vertical breathing room inside the viewport

export class Paginator {
  constructor(viewportEl) {
    this.viewport = viewportEl;
    this.content = null;
    this.pageWidth = 0;
    this.pageStride = 0;
    this.pageCount = 1;
    this.index = 0;
  }

  /** Attach a freshly built content element and measure pages. */
  layout(contentEl, measureCh) {
    this.attach(contentEl);
    this.measure(measureCh);
    return this.pageCount;
  }

  /** Attach content without measuring (measure once fonts are ready). */
  attach(contentEl) {
    this.content = contentEl;
    contentEl.classList.add("content--paged");
    this.viewport.replaceChildren(contentEl);
  }

  /** Detach content and clear the viewport (used when closing a document). */
  detach() {
    this.content = null;
    this.pageCount = 1;
    this.index = 0;
    this.viewport.replaceChildren();
  }

  /** Re-measure page geometry, preserving the current reading fraction. */
  measure(measureCh) {
    if (!this.content) return 1;
    const frac = this.getAnchorFraction();

    const vpW = this.viewport.clientWidth;
    const vpH = this.viewport.clientHeight;

    // Determine measure width in px from the ch-based preference, capped to vp.
    // Fall back to 0.5em-per-ch estimate if we cannot measure directly.
    const chPx = this._chWidthPx();
    const desiredW = measureCh ? measureCh * chPx : vpW;
    const pageWidth = Math.max(200, Math.min(desiredW, vpW - 8));
    const pageHeight = Math.max(120, vpH - V_MARGIN * 2);

    // The column gap must be wide enough that only one page is ever inside the
    // clipped viewport. The content column is centered, so the empty slack on
    // each side is (vpW - pageWidth) / 2. If the gap were smaller than that
    // slack, the *next* column would peek into the right margin (a visible text
    // bleed on wide screens where the measure is narrower than the viewport).
    // Making the gap at least the full slack guarantees the next column starts
    // at or beyond the right clip edge.
    const columnGap = Math.max(COLUMN_GAP, Math.ceil(vpW - pageWidth));

    this.pageWidth = pageWidth;
    this.pageStride = pageWidth + columnGap;

    const c = this.content;
    c.style.position = "absolute";
    c.style.top = `${V_MARGIN}px`;
    c.style.left = `${Math.max(0, (vpW - pageWidth) / 2)}px`;
    c.style.width = `${pageWidth}px`;
    c.style.height = `${pageHeight}px`;
    c.style.columnWidth = `${pageWidth}px`;
    c.style.columnGap = `${columnGap}px`;
    c.style.columnFill = "auto";

    // Force layout, then read the flowed width.
    const scrollW = c.scrollWidth;
    const count = Math.max(1, Math.round((scrollW + columnGap) / this.pageStride));
    this.pageCount = count;
    this.index = clamp(Math.round(frac * (count - 1)), 0, count - 1);
    this.applyTransform();

    log.info("pagination:complete", { pageCount: count });
    return count;
  }

  _chWidthPx() {
    // Measure the width of a run of characters in the current font.
    const probe = document.createElement("span");
    probe.textContent = "0000000000"; // 10 chars
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "pre";
    probe.style.font = getComputedStyle(this.content).font;
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width / 10;
    document.body.removeChild(probe);
    return w || 10;
  }

  applyTransform() {
    if (!this.content) return;
    const offset = -this.index * this.pageStride;
    this.content.style.transform = `translateX(${offset}px)`;
  }

  goToPage(index) {
    const next = clamp(index, 0, this.pageCount - 1);
    const changed = next !== this.index;
    this.index = next;
    this.applyTransform();
    return changed;
  }

  next() {
    return this.goToPage(this.index + 1);
  }

  prev() {
    return this.goToPage(this.index - 1);
  }

  atStart() {
    return this.index <= 0;
  }

  atEnd() {
    return this.index >= this.pageCount - 1;
  }

  getAnchorFraction() {
    if (this.pageCount <= 1) return 0;
    return this.index / (this.pageCount - 1);
  }

  setAnchorFraction(frac) {
    this.index = clamp(Math.round(frac * (this.pageCount - 1)), 0, this.pageCount - 1);
    this.applyTransform();
  }
}
