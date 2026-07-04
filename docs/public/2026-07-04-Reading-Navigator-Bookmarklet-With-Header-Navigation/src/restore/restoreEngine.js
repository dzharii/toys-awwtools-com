/**
 * Restore engine.
 *
 * Resolves a saved restore target (last reading focus or manual mark) into a
 * current page location using a fallback chain. It never assumes the page is
 * unchanged and always reports confidence. It does not know about the panel UI.
 *
 * Fallback order (design note X00):
 *   1 element id                    -> high
 *   2 closest heading id + offset    -> high/medium
 *   3 heading path hash + type       -> medium
 *   4 dom path from root             -> medium/low
 *   5 text fingerprint hash          -> medium/low
 *   6 approximate scroll ratio       -> low
 */

import { resolveDomPath, isInsideAppHost } from "../utils/dom.js";

function makeResult(ok, extra) {
  return Object.assign(
    {
      ok,
      confidence: "none",
      method: "none",
      targetSegmentId: null,
      targetElement: null,
      scrollTop: null,
      message: "",
    },
    extra || {}
  );
}

function segmentScrollTop(segment) {
  // Position so the segment sits comfortably (band area), not the very top.
  return Math.max(0, segment.top - window.innerHeight * 0.3);
}

export function resolveRestoreTarget(target, deps) {
  const { segmentsById, segments, root, docHeight } = deps;

  if (!target) {
    return makeResult(false, {
      message: "No saved reading position for this page.",
    });
  }

  const anchors = target.anchors || {};

  // 1. Same content version: stable segment id resolves directly.
  if (target.segmentId && segmentsById.has(target.segmentId)) {
    const seg = segmentsById.get(target.segmentId);
    return makeResult(true, {
      confidence: "high",
      method: "segment-id",
      targetSegmentId: seg.id,
      targetElement: seg.element,
      scrollTop: segmentScrollTop(seg),
      message: "Restored to your last reading position.",
    });
  }

  // 2. Existing element id.
  if (anchors.elementId) {
    const el = document.getElementById(anchors.elementId);
    if (el && !isInsideAppHost(el)) {
      const seg = findSegmentByElement(segments, el);
      return makeResult(true, {
        confidence: "high",
        method: "element-id",
        targetSegmentId: seg ? seg.id : null,
        targetElement: el,
        scrollTop: seg ? segmentScrollTop(seg) : elementScrollTop(el),
        message: "Restored to your last reading position.",
      });
    }
  }

  // 3. Closest heading id.
  if (anchors.closestHeadingId) {
    const headingEl = document.getElementById(anchors.closestHeadingId);
    if (headingEl && !isInsideAppHost(headingEl)) {
      // Prefer a segment inside that heading matching type / path.
      const seg = findSegmentUnderHeading(segments, anchors.closestHeadingId, target.segmentType);
      const el = seg ? seg.element : headingEl;
      return makeResult(true, {
        confidence: seg ? "high" : "medium",
        method: "closest-heading-id",
        targetSegmentId: seg ? seg.id : null,
        targetElement: el,
        scrollTop: seg ? segmentScrollTop(seg) : elementScrollTop(headingEl),
        message: "Restored near your last reading position.",
      });
    }
  }

  // 4. Heading path hash + segment type.
  if (anchors.headingPathHash) {
    const matches = segments.filter(
      (s) => s.anchors && s.anchors.headingPathHash === anchors.headingPathHash
    );
    const typed = target.segmentType
      ? matches.filter((s) => s.type === target.segmentType)
      : matches;
    const pool = typed.length ? typed : matches;
    if (pool.length) {
      const seg = nearestByScrollRatio(pool, target.scrollRatio);
      return makeResult(true, {
        confidence: pool.length === 1 ? "medium" : "medium",
        method: "heading-path-plus-index",
        targetSegmentId: seg.id,
        targetElement: seg.element,
        scrollTop: segmentScrollTop(seg),
        message: "Restored near your last reading position.",
      });
    }
  }

  // 5. DOM path from readable root.
  if (anchors.domPath) {
    const el = resolveDomPath(anchors.domPath, root);
    if (el && !isInsideAppHost(el)) {
      const seg = findSegmentByElement(segments, el);
      return makeResult(true, {
        confidence: "medium",
        method: "dom-path",
        targetSegmentId: seg ? seg.id : null,
        targetElement: el,
        scrollTop: seg ? segmentScrollTop(seg) : elementScrollTop(el),
        message: "Restored to an approximate reading position.",
      });
    }
  }

  // 6. Text fingerprint hash.
  if (anchors.textHash) {
    const matches = segments.filter((s) => s.anchors && s.anchors.textHash === anchors.textHash);
    if (matches.length) {
      const unique = matches.length === 1;
      const seg = unique ? matches[0] : nearestByScrollRatio(matches, target.scrollRatio);
      return makeResult(true, {
        confidence: unique ? "medium" : "low",
        method: "text-hash",
        targetSegmentId: seg.id,
        targetElement: seg.element,
        scrollTop: segmentScrollTop(seg),
        message: unique
          ? "Restored near your last reading position."
          : "Restored to an approximate reading position.",
      });
    }
  }

  // 7. Approximate scroll ratio (last resort).
  if (typeof target.scrollRatio === "number") {
    const scrollTop = Math.max(0, target.scrollRatio * (docHeight || 1) - window.innerHeight * 0.3);
    return makeResult(true, {
      confidence: "low",
      method: "scroll-ratio",
      targetSegmentId: null,
      targetElement: null,
      scrollTop,
      message: "Restored to an approximate scroll position. The page may have changed.",
    });
  }

  return makeResult(false, {
    message: "Saved progress exists, but the target could not be found on this page.",
  });
}

function findSegmentByElement(segments, element) {
  for (const s of segments) {
    if (s.element === element) return s;
    if (s.elements && s.elements.indexOf(element) !== -1) return s;
  }
  // Try ancestor containment.
  for (const s of segments) {
    if (s.element && s.element.contains && s.element.contains(element)) return s;
  }
  return null;
}

function findSegmentUnderHeading(segments, headingElementId, type) {
  const under = segments.filter((s) => s.headingElementId === headingElementId);
  if (!under.length) return null;
  if (type) {
    const typed = under.filter((s) => s.type === type);
    if (typed.length) return typed[0];
  }
  return under[0];
}

function nearestByScrollRatio(pool, scrollRatio) {
  if (typeof scrollRatio !== "number") return pool[0];
  let best = pool[0];
  let bestDelta = Infinity;
  for (const s of pool) {
    const delta = Math.abs((s.scrollStartRatio || 0) - scrollRatio);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = s;
    }
  }
  return best;
}

function elementScrollTop(element) {
  try {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    return Math.max(0, rect.top + scrollTop - window.innerHeight * 0.3);
  } catch (_e) {
    return 0;
  }
}

/** User-facing confidence label mapping. */
export function confidenceLabel(confidence) {
  switch (confidence) {
    case "high":
      return "Exact or near exact";
    case "medium":
      return "Likely";
    case "low":
      return "Approximate";
    default:
      return "Not available";
  }
}
