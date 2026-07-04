/**
 * Status bar component. Shows tracking status and storage/save status as pills.
 */

import { el, clearChildren } from "../utils/dom.js";

const TRACKING_LABELS = {
  tracking: "Tracking",
  active: "Tracking",
  paused: "Paused",
  idle: "Idle",
  hidden: "Hidden",
  unfocused: "Unfocused",
  "session-only": "Session only",
};

const STORAGE_LABELS = {
  saved: "Saved",
  saving: "Saving",
  "session-only": "Session only",
  unavailable: "Restore unavailable",
  idle: "",
};

export function createStatusBar() {
  const element = el("div", { class: "rn-statusbar", role: "status", "aria-live": "polite" });

  function pill(text, cls) {
    return el("span", { class: "rn-pill " + cls, text });
  }

  function update(vm) {
    clearChildren(element);
    const tStatus = vm.trackingStatus || "tracking";
    const tLabel = TRACKING_LABELS[tStatus] || "Tracking";
    element.appendChild(pill(tLabel, "rn-" + tStatus));

    const sStatus = vm.storageStatus;
    const sLabel = STORAGE_LABELS[sStatus];
    if (sLabel) {
      element.appendChild(pill(sLabel, "rn-" + sStatus));
    }

    if (vm.segmentCount != null) {
      element.appendChild(pill(vm.segmentCount + " segments", "rn-info"));
    }
  }

  return { element, update };
}
