/**
 * scrollToTarget: move the viewport to a target element or scroll offset in a
 * comfortable reading position, honoring reduced-motion. Falls back to
 * window.scrollTo if scrollIntoView is unavailable.
 */

import { prefersReducedMotion, getScrollTop } from "../utils/dom.js";

export function scrollToElement(element) {
  if (!element) return false;
  const behavior = prefersReducedMotion() ? "auto" : "smooth";
  try {
    if (typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ behavior, block: "center", inline: "nearest" });
      return true;
    }
  } catch (_e) {
    /* fall through */
  }
  try {
    const rect = element.getBoundingClientRect();
    const targetTop = rect.top + getScrollTop() - window.innerHeight * 0.35;
    window.scrollTo({ top: Math.max(0, targetTop), behavior });
    return true;
  } catch (_e2) {
    return false;
  }
}

export function scrollToOffset(scrollTop) {
  const behavior = prefersReducedMotion() ? "auto" : "smooth";
  try {
    window.scrollTo({ top: Math.max(0, scrollTop), behavior });
    return true;
  } catch (_e) {
    try {
      window.scrollTo(0, Math.max(0, scrollTop));
      return true;
    } catch (_e2) {
      return false;
    }
  }
}
