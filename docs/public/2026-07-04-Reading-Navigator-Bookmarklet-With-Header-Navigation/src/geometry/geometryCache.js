/**
 * Geometry cache.
 *
 * Owns the cached vertical coordinates of headings and segments so the sampler
 * never triggers layout during normal tracking. Recomputation is batched into
 * a read phase and is only triggered on startup, rescan, resize, or debounced
 * content mutation / layout shift.
 */

import { refreshHeadingGeometry } from "../content/headingIndex.js";
import { refreshSegmentGeometry } from "../content/segmenter.js";
import { getScrollTop, getDocumentHeight } from "../utils/dom.js";
import { lastIndexAtOrBelow } from "../utils/math.js";

export function createGeometryCache() {
  let headings = [];
  let segments = [];
  let version = 0;
  let lastRefreshMs = 0;

  function setData(nextHeadings, nextSegments) {
    headings = nextHeadings || [];
    segments = nextSegments || [];
    // Ensure sorted by top for binary search.
    segments.sort((a, b) => a.top - b.top);
    version += 1;
  }

  /**
   * Refresh cached coordinates. Reads layout in one pass; callers should run
   * this inside a scheduler read phase. Returns elapsed ms for instrumentation.
   */
  function refresh() {
    const start =
      typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const scrollTop = getScrollTop();
    const docHeight = getDocumentHeight() || 1;
    refreshHeadingGeometry(headings, scrollTop);
    refreshSegmentGeometry(segments, scrollTop, docHeight);
    segments.sort((a, b) => a.top - b.top);
    version += 1;
    const end =
      typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    lastRefreshMs = end - start;
    return lastRefreshMs;
  }

  /**
   * Return segments whose ranges may intersect [rangeTop, rangeBottom].
   * Uses binary search on the sorted `top` plus a small backward scan to catch
   * tall segments that start above the range.
   */
  function findSegmentsNearRange(rangeTop, rangeBottom) {
    if (!segments.length) return [];
    const startIdx = Math.max(0, lastIndexAtOrBelow(segments, rangeBottom));
    const result = [];
    // Scan backward from startIdx while segments can still overlap.
    for (let i = startIdx; i >= 0; i--) {
      const seg = segments[i];
      if (seg.bottom < rangeTop) {
        // Since segments can be tall, keep scanning a little to be safe, but
        // stop once we are clearly above the range by a margin.
        if (seg.top < rangeTop - 4000) break;
        continue;
      }
      if (seg.top > rangeBottom) continue;
      result.push(seg);
    }
    // Also include a few segments after startIdx (grouped/virtual ordering).
    for (let i = startIdx + 1; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.top > rangeBottom) break;
      result.push(seg);
    }
    return result;
  }

  function findSegmentAtY(y) {
    if (!segments.length) return null;
    const idx = lastIndexAtOrBelow(segments, y);
    if (idx < 0) return segments[0];
    // Prefer a segment that actually contains y.
    for (let i = idx; i >= 0 && i >= idx - 4; i--) {
      if (segments[i].top <= y && segments[i].bottom >= y) return segments[i];
    }
    return segments[idx];
  }

  return {
    setData,
    refresh,
    findSegmentsNearRange,
    findSegmentAtY,
    get headings() {
      return headings;
    },
    get segments() {
      return segments;
    },
    get version() {
      return version;
    },
    get lastRefreshMs() {
      return lastRefreshMs;
    },
  };
}
