/**
 * Document segmentation.
 *
 * Divides the readable root into trackable segments (the unit for reading
 * state, minimap, and restore). Rejects invisible / trivial / app-host
 * elements, prefers readable block elements, groups tiny adjacent blocks, and
 * virtually splits very tall blocks. Produces stable IDs for a content version.
 */

import { CONFIG } from "../config.js";
import {
  isElementVisible,
  isInsideAppHost,
  normalizeText,
  getScrollTop,
  getViewportHeight,
  getDocumentHeight,
} from "../utils/dom.js";
import { computeAnchors } from "./anchors.js";
import { lastIndexAtOrBelow } from "../utils/math.js";

const ATOMIC_SELECTOR = "p,li,blockquote,pre,figure,table,h1,h2,h3,h4,h5,h6,dd,dt";

function classifyType(element) {
  const tag = element.tagName;
  if (/^H[1-6]$/.test(tag)) return "heading";
  if (tag === "P") return "paragraph";
  if (tag === "LI" || tag === "DD" || tag === "DT") return "list-item";
  if (tag === "BLOCKQUOTE") return "blockquote";
  if (tag === "PRE") return "code";
  if (tag === "FIGURE") return "figure";
  if (tag === "TABLE") return "table";
  if (tag === "SECTION") return "section";
  return "unknown-block";
}

function textBucket(length) {
  if (length < 80) return "short";
  if (length < 400) return "medium";
  return "long";
}

/** Is `element` a descendant of any element in the set? */
function hasAncestorIn(element, set) {
  let node = element.parentElement;
  while (node) {
    if (set.has(node)) return true;
    node = node.parentElement;
  }
  return false;
}

function collectAtomics(root) {
  const all = Array.from(root.querySelectorAll(ATOMIC_SELECTOR));
  const kept = [];
  const keptSet = new Set();

  for (const node of all) {
    if (isInsideAppHost(node)) continue;
    if (!isElementVisible(node)) continue;
    // Skip nested atomics: keep the outermost readable block (e.g. keep <li>,
    // ignore a <p> inside it). Headings are always kept.
    if (node.tagName[0] !== "H" && hasAncestorIn(node, keptSet)) continue;
    const text = normalizeText(node.textContent || "");
    const hasMedia = node.querySelector("img,svg,canvas,video,picture");
    if (!text && !hasMedia) continue;
    kept.push(node);
    keptSet.add(node);
  }

  // Fallback: if we found very little, add text-bearing leaf containers.
  if (kept.length < 2) {
    for (const node of root.querySelectorAll("div,section")) {
      if (isInsideAppHost(node) || !isElementVisible(node)) continue;
      if (node.querySelector(ATOMIC_SELECTOR)) continue;
      const text = normalizeText(node.textContent || "");
      if (text.length < 20) continue;
      if (hasAncestorIn(node, keptSet)) continue;
      kept.push(node);
      keptSet.add(node);
    }
  }

  return kept;
}

export function segmentContent(root, headings) {
  const scope = root || document.body;
  const scrollTop = getScrollTop();
  const docHeight = getDocumentHeight() || 1;
  const viewportHeight = getViewportHeight() || 800;
  const headingList = headings || [];

  const atomics = collectAtomics(scope);

  // Build raw segments with document-space coordinates.
  const raw = [];
  for (const element of atomics) {
    const rect = element.getBoundingClientRect();
    const top = rect.top + scrollTop;
    const bottom = rect.bottom + scrollTop;
    const height = Math.max(0, bottom - top);
    if (height <= 0) continue;
    raw.push({
      element,
      type: classifyType(element),
      top,
      bottom,
      height,
      text: normalizeText(element.textContent || ""),
    });
  }

  raw.sort((a, b) => a.top - b.top || a.bottom - b.bottom);

  // Group tiny adjacent same-section, same-type blocks to avoid micro-segments.
  const grouped = [];
  for (const item of raw) {
    const prev = grouped[grouped.length - 1];
    const small = item.height < CONFIG.segmentGroupMinHeightPx;
    if (
      prev &&
      small &&
      prev._small &&
      prev.type === item.type &&
      item.type !== "heading" &&
      sameSection(headingList, prev.top, item.top)
    ) {
      prev.bottom = item.bottom;
      prev.height = prev.bottom - prev.top;
      prev.elements.push(item.element);
      prev.text = (prev.text + " " + item.text).slice(0, 600);
    } else {
      grouped.push({
        element: item.element,
        elements: [item.element],
        type: item.type,
        top: item.top,
        bottom: item.bottom,
        height: item.height,
        text: item.text,
        _small: small,
      });
    }
  }

  // Virtual-split very tall single-element blocks.
  const expanded = [];
  const splitLimit = viewportHeight * CONFIG.virtualSplitViewportMultiple;
  for (const seg of grouped) {
    if (seg.elements.length === 1 && seg.height > splitLimit) {
      const bands = Math.min(6, Math.ceil(seg.height / viewportHeight));
      for (let i = 0; i < bands; i++) {
        const fracStart = i / bands;
        const fracEnd = (i + 1) / bands;
        expanded.push({
          element: seg.element,
          elements: [seg.element],
          type: seg.type,
          top: seg.top + seg.height * fracStart,
          bottom: seg.top + seg.height * fracEnd,
          height: seg.height / bands,
          text: seg.text,
          virtual: true,
          virtualIndex: i,
          fracStart,
          fracEnd,
        });
      }
    } else {
      expanded.push(seg);
    }
  }

  // Cap total segments defensively.
  const limited = expanded.slice(0, CONFIG.maxSegments);

  // Assign a stable block index per distinct source block. Virtual bands that
  // share one element belong to the same block index.
  let blockCounter = -1;
  let prevBlockElement = null;
  let prevWasVirtual = false;
  for (const seg of limited) {
    const startsNewBlock =
      !seg.virtual ||
      seg.element !== prevBlockElement ||
      !prevWasVirtual ||
      seg.virtualIndex === 0;
    if (startsNewBlock) blockCounter++;
    seg._blockIndex = blockCounter;
    prevBlockElement = seg.element;
    prevWasVirtual = !!seg.virtual;
  }

  // Build final segment records with IDs, heading association, anchors.
  const segments = [];
  const sectionLocalCounters = {};

  for (let i = 0; i < limited.length; i++) {
    const seg = limited[i];
    const heading = nearestHeadingAbove(headingList, seg.top);
    const sectionIndex = heading ? heading.sectionIndex : -1;
    if (!(sectionIndex in sectionLocalCounters)) sectionLocalCounters[sectionIndex] = 0;
    const localIndex = sectionLocalCounters[sectionIndex]++;

    const baseId = "s_" + String(seg._blockIndex).padStart(5, "0");
    let id = baseId;
    let parentId = null;
    if (seg.virtual) {
      parentId = baseId;
      id = baseId + "_v" + String(seg.virtualIndex).padStart(2, "0");
    }

    const scrollStartRatio = seg.top / docHeight;
    const scrollEndRatio = seg.bottom / docHeight;

    const record = {
      id,
      parentId,
      element: seg.element,
      elements: seg.elements || [seg.element],
      type: seg.type,
      top: seg.top,
      bottom: seg.bottom,
      height: seg.height,
      virtual: !!seg.virtual,
      virtualIndex: seg.virtual ? seg.virtualIndex : null,
      fracStart: seg.virtual ? seg.fracStart : null,
      fracEnd: seg.virtual ? seg.fracEnd : null,
      scrollStartRatio,
      scrollEndRatio,
      headingId: heading ? heading.id : null,
      headingElementId: heading && heading.element ? heading.element.id || null : null,
      headingPath: heading ? heading.path.slice() : [],
      sectionIndex,
      localIndex,
      textLengthBucket: textBucket(seg.text.length),
      anchors: computeAnchors(seg.element, {
        root: scope,
        closestHeadingId: heading && heading.element ? heading.element.id || null : null,
        headingPath: heading ? heading.path : [],
        scrollRatio: scrollStartRatio,
      }),
    };
    segments.push(record);
  }

  return segments;
}

function nearestHeadingAbove(headings, y) {
  if (!headings.length) return null;
  const idx = lastIndexAtOrBelow(headings, y);
  if (idx < 0) return null;
  return headings[idx];
}

function sameSection(headings, topA, topB) {
  const a = nearestHeadingAbove(headings, topA);
  const b = nearestHeadingAbove(headings, topB);
  return a === b;
}

/** Refresh cached coordinates for segments in-place (batched read phase). */
export function refreshSegmentGeometry(segments, scrollTop, docHeight) {
  const st = typeof scrollTop === "number" ? scrollTop : getScrollTop();
  const dh = docHeight || getDocumentHeight() || 1;

  // Cache element rects once per element to avoid repeat layout reads for
  // grouped/virtual segments that share elements.
  const rectCache = new Map();
  function rectFor(element) {
    let r = rectCache.get(element);
    if (!r) {
      r = element.getBoundingClientRect();
      rectCache.set(element, r);
    }
    return r;
  }

  for (const seg of segments) {
    if (seg.virtual) {
      const r = rectFor(seg.element);
      const elemTop = r.top + st;
      const elemHeight = Math.max(0, r.bottom - r.top);
      seg.top = elemTop + elemHeight * seg.fracStart;
      seg.bottom = elemTop + elemHeight * seg.fracEnd;
      seg.height = Math.max(0, seg.bottom - seg.top);
    } else if (seg.elements && seg.elements.length > 1) {
      const first = rectFor(seg.elements[0]);
      const last = rectFor(seg.elements[seg.elements.length - 1]);
      seg.top = first.top + st;
      seg.bottom = last.bottom + st;
      seg.height = Math.max(0, seg.bottom - seg.top);
    } else {
      const r = rectFor(seg.element);
      seg.top = r.top + st;
      seg.bottom = r.bottom + st;
      seg.height = Math.max(0, seg.bottom - seg.top);
    }
    seg.scrollStartRatio = seg.top / dh;
    seg.scrollEndRatio = seg.bottom / dh;
  }

  segments.sort((a, b) => a.top - b.top);
}
