/**
 * Debug panel. Shows performance and state diagnostics. Hidden unless debug
 * mode is enabled. Off by default.
 */

import { el } from "../utils/dom.js";

export function createDebugPanel() {
  const element = el("div", { class: "rn-section rn-collapsible" });
  element.appendChild(el("p", { class: "rn-section-title", text: "Debug" }));
  const pre = el("div", { class: "rn-debug" });
  element.appendChild(pre);
  element.style.display = "none";

  function update(vm) {
    if (!vm.debug || !vm.debug.enabled) {
      element.style.display = "none";
      return;
    }
    element.style.display = "";
    const d = vm.debug;
    const lines = [
      "version: " + d.appVersion,
      "root confidence: " + d.rootConfidence + " (" + d.rootReason + ")",
      "segments: " + d.segmentCount + "  headings: " + d.headingCount,
      "minimap nodes: " + d.minimapNodes,
      "last scan: " + fmt(d.lastScanMs) + " ms",
      "last geometry: " + fmt(d.lastGeometryMs) + " ms",
      "last sample: " + fmt(d.lastSampleMs) + " ms",
      "last save: " + fmt(d.lastSaveMs) + " ms",
      "velocity: " + fmt(d.velocity) + " px/s (" + d.velocityClass + ")",
      "storage: " + d.storageMode,
      "current: " + (d.currentSegmentId || "-"),
      "last focus: " + (d.lastFocusSegmentId || "-"),
      "errors: " + (d.errorCount || 0),
    ];
    if (d.lastError) lines.push("last error: " + d.lastError);
    pre.textContent = lines.join("\n");
  }

  function fmt(n) {
    return typeof n === "number" ? Math.round(n * 100) / 100 : "-";
  }

  return { element, update };
}
