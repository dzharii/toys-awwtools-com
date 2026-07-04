/**
 * Heading index.
 *
 * Collects visible h1..h6 inside the readable root, computes heading paths,
 * coordinates, and section ranges. Supports binary lookup by vertical
 * coordinate so the "current" heading can be found without a full scan.
 */

import { CONFIG } from "../config.js";
import {
  isElementVisible,
  isInsideAppHost,
  normalizeText,
  getScrollTop,
  computeDomPath,
} from "../utils/dom.js";
import { hashTextSample } from "../utils/hash.js";
import { lastIndexAtOrBelow } from "../utils/math.js";

export function buildHeadingIndex(root) {
  const scope = root || document.body;
  const scrollTop = getScrollTop();
  const nodes = scope.querySelectorAll("h1,h2,h3,h4,h5,h6");
  const headings = [];
  let counter = 0;

  for (const node of nodes) {
    if (isInsideAppHost(node)) continue;
    if (!isElementVisible(node)) continue;
    const text = normalizeText(node.textContent || "");
    if (!text) continue;

    const level = parseInt(node.tagName.charAt(1), 10);
    const rect = node.getBoundingClientRect();
    const id = "h_" + String(counter).padStart(5, "0");
    counter++;

    headings.push({
      id,
      element: node,
      level,
      text,
      textHash: hashTextSample(text, 80),
      top: rect.top + scrollTop,
      bottom: rect.bottom + scrollTop,
      path: [], // filled below
      domPath: computeDomPath(node, scope),
      sectionIndex: headings.length,
      anchor: {
        elementId: node.id || null,
        domPath: computeDomPath(node, scope),
      },
    });
  }

  // Compute heading paths by walking back through prior headings of lower level.
  for (let i = 0; i < headings.length; i++) {
    const path = [];
    let currentLevel = headings[i].level;
    for (let j = i - 1; j >= 0; j--) {
      if (headings[j].level < currentLevel) {
        path.unshift(headings[j].text);
        currentLevel = headings[j].level;
        if (currentLevel === 1) break;
      }
    }
    path.push(headings[i].text);
    headings[i].path = path;
  }

  return headings;
}

/** Refresh cached coordinates for all headings in-place. */
export function refreshHeadingGeometry(headings, scrollTop) {
  const st = typeof scrollTop === "number" ? scrollTop : getScrollTop();
  for (const heading of headings) {
    const rect = heading.element.getBoundingClientRect();
    heading.top = rect.top + st;
    heading.bottom = rect.bottom + st;
  }
}

/**
 * The current heading is the nearest heading at or above the reading
 * reference point. Headings must be sorted by top ascending.
 */
export function findCurrentHeading(headings, referenceY) {
  if (!headings.length) return null;
  const idx = lastIndexAtOrBelow(headings, referenceY);
  if (idx < 0) return headings[0];
  return headings[idx];
}

/**
 * Nearby headings: a window above and below the current heading index.
 */
export function nearbyHeadings(headings, currentId, above, below) {
  const a = typeof above === "number" ? above : 3;
  const b = typeof below === "number" ? below : 3;
  const index = headings.findIndex((h) => h.id === currentId);
  if (index < 0) return { above: [], below: [] };
  return {
    above: headings.slice(Math.max(0, index - a), index),
    below: headings.slice(index + 1, index + 1 + b),
  };
}

/**
 * Compute a section range for a heading: from the heading top down to the next
 * heading of the same or higher (lower number) level, else the root bottom.
 */
export function sectionRange(headings, index, rootBottom) {
  const heading = headings[index];
  if (!heading) return null;
  let endTop = rootBottom;
  for (let j = index + 1; j < headings.length; j++) {
    if (headings[j].level <= heading.level) {
      endTop = headings[j].top;
      break;
    }
  }
  return { start: heading.top, end: endTop };
}

export function referenceReadingY(scrollTop, viewportHeight) {
  return scrollTop + viewportHeight * CONFIG.currentHeadingRefRatio;
}
