/**
 * Anchor computation for restore.
 *
 * Anchors are non-mutating metadata used to relocate a segment after reload or
 * layout change. We do NOT write generated IDs into the page. We store only
 * short hashes and structural descriptors.
 */

import { computeDomPath, normalizeText } from "../utils/dom.js";
import { hashTextSample, combineHashes } from "../utils/hash.js";

/**
 * Build anchor metadata for an element.
 *  root          - readable content root (for relative DOM path)
 *  closestHeading - nearest heading record above the element (or null)
 *  headingPath   - array of heading strings from root to this element
 *  scrollRatio   - element top / document height (0..1)
 */
export function computeAnchors(element, options) {
  const opts = options || {};
  const text = normalizeText(element.textContent || "");
  const headingPath = opts.headingPath || [];

  return {
    elementId: element.id || null,
    closestHeadingId: opts.closestHeadingId || null,
    headingPathHash: headingPath.length ? combineHashes(headingPath.map((h) => hashTextSample(h, 80))) : null,
    domPath: computeDomPath(element, opts.root),
    textHash: text ? hashTextSample(text, 160) : null,
    scrollRatio: typeof opts.scrollRatio === "number" ? opts.scrollRatio : null,
  };
}
