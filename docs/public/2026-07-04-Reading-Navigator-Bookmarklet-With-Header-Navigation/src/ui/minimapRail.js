/**
 * Minimap rail. A compact vertical heatmap of the readable document.
 *
 * Built once per content version (bucketed for large pages to cap DOM nodes)
 * and updated cheaply via state diffs. Shows segment read states, the current
 * viewport window, the last reading position, and the manual mark. Clicking a
 * region jumps to the corresponding segment.
 */

import { CONFIG } from "../config.js";
import { el, clearChildren } from "../utils/dom.js";

// Higher number = higher visual priority when aggregating a bucket.
const STATE_PRIORITY = {
  unseen: 0,
  seen: 1,
  skimmed: 2,
  "probably-read": 3,
  reread: 4,
  active: 5,
};

const LEGEND = [
  ["Unseen", "var(--rn-unseen)"],
  ["Seen", "var(--rn-seen)"],
  ["Skimmed", "var(--rn-skimmed)"],
  ["Probably read", "var(--rn-read)"],
  ["Active", "var(--rn-active)"],
  ["Last focus", "var(--rn-lastfocus)"],
  ["Marked", "var(--rn-mark)"],
];

export function createMinimapRail(actions) {
  const element = el("div", { class: "rn-section" });
  const title = el("p", { class: "rn-section-title", text: "Reading map" });
  const wrap = el("div", { class: "rn-minimap-wrap" });
  const rail = el("div", { class: "rn-minimap", role: "slider", "aria-label": "Reading progress map", tabindex: "0" });
  const legend = el("div", { class: "rn-legend" });

  const viewportMarker = el("div", { class: "rn-mini-viewport" });
  const lastFocusMarker = el("div", { class: "rn-mini-marker rn-lf" });
  const manualMarker = el("div", { class: "rn-mini-marker rn-mk" });

  buildLegend();

  wrap.appendChild(rail);
  wrap.appendChild(legend);
  element.appendChild(title);
  element.appendChild(wrap);

  let buckets = [];
  let bucketBySegmentId = new Map();
  let lastStateByBucket = [];

  function buildLegend() {
    clearChildren(legend);
    for (const [label, color] of LEGEND) {
      const item = el("div", { class: "rn-legend-item" });
      const sw = el("span", { class: "rn-legend-swatch" });
      sw.style.background = color;
      item.appendChild(sw);
      item.appendChild(el("span", { text: label }));
      legend.appendChild(item);
    }
  }

  function build(segments) {
    clearChildren(rail);
    buckets = [];
    bucketBySegmentId = new Map();
    lastStateByBucket = [];

    if (!segments || !segments.length) {
      rail.appendChild(el("div", { class: "rn-empty-state", text: "" }));
      return;
    }

    const perBucket = Math.max(1, Math.ceil(segments.length / CONFIG.maxMinimapNodes));
    for (let i = 0; i < segments.length; i += perBucket) {
      const group = segments.slice(i, i + perBucket);
      const startRatio = group[0].scrollStartRatio || 0;
      const endRatio = group[group.length - 1].scrollEndRatio || startRatio + 0.01;
      const segmentIds = group.map((s) => s.id);
      const node = el("div", { class: "rn-mini-seg s-unseen" });
      const topPct = Math.max(0, Math.min(100, startRatio * 100));
      const hPct = Math.max(0.4, Math.min(100 - topPct, (endRatio - startRatio) * 100));
      node.style.top = topPct + "%";
      node.style.height = hPct + "%";
      const bucketIndex = buckets.length;
      node.addEventListener("click", () => actions.jumpToSegment(segmentIds[0]));
      rail.appendChild(node);
      buckets.push({ node, segmentIds, startRatio, endRatio });
      lastStateByBucket.push("unseen");
      for (const id of segmentIds) bucketBySegmentId.set(id, bucketIndex);
    }

    rail.appendChild(viewportMarker);
    rail.appendChild(lastFocusMarker);
    rail.appendChild(manualMarker);
  }

  function aggregateState(segmentIds, statesById, currentSegmentId) {
    let best = "unseen";
    let bestPriority = -1;
    for (const id of segmentIds) {
      let st = statesById.get(id) || "unseen";
      if (id === currentSegmentId) st = "active";
      const p = STATE_PRIORITY[st] != null ? STATE_PRIORITY[st] : 0;
      if (p > bestPriority) {
        bestPriority = p;
        best = st;
      }
    }
    return best;
  }

  function update(vm) {
    const mm = vm.minimap;
    if (!mm) return;
    const statesById = mm.statesById || new Map();

    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i];
      const state = aggregateState(b.segmentIds, statesById, mm.currentSegmentId);
      if (state !== lastStateByBucket[i]) {
        b.node.className = "rn-mini-seg s-" + state;
        lastStateByBucket[i] = state;
      }
    }

    // Viewport window.
    if (mm.viewport) {
      const topPct = Math.max(0, Math.min(100, mm.viewport.topRatio * 100));
      const hPct = Math.max(1, Math.min(100 - topPct, (mm.viewport.bottomRatio - mm.viewport.topRatio) * 100));
      viewportMarker.style.top = topPct + "%";
      viewportMarker.style.height = hPct + "%";
      viewportMarker.style.display = "block";
    }

    positionMarker(lastFocusMarker, mm.lastFocusSegmentId);
    positionMarker(manualMarker, mm.manualMarkSegmentId);
  }

  function positionMarker(marker, segmentId) {
    if (segmentId == null || !bucketBySegmentId.has(segmentId)) {
      marker.style.display = "none";
      return;
    }
    const b = buckets[bucketBySegmentId.get(segmentId)];
    marker.style.top = Math.max(0, Math.min(100, b.startRatio * 100)) + "%";
    marker.style.display = "block";
  }

  return { element, build, update };
}
