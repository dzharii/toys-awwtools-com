/**
 * Controls panel. Pause/resume, mark spot, save now, rescan, clear progress.
 * Clear requires an inline confirmation before deleting saved progress.
 */

import { el, clearChildren } from "../utils/dom.js";

export function createControlsPanel(actions) {
  const element = el("div", { class: "rn-section" });
  const title = el("p", { class: "rn-section-title", text: "Controls" });
  const grid = el("div", { class: "rn-controls" });
  const confirmSlot = el("div");
  element.appendChild(title);
  element.appendChild(grid);
  element.appendChild(confirmSlot);

  const pauseBtn = el("button", { class: "rn-btn", type: "button", text: "Pause", onClick: () => actions.togglePause() });
  const markBtn = el("button", { class: "rn-btn", type: "button", text: "Mark this spot", onClick: () => actions.markSpot() });
  const saveBtn = el("button", { class: "rn-btn", type: "button", text: "Save now", onClick: () => actions.saveNow() });
  const rescanBtn = el("button", { class: "rn-btn", type: "button", text: "Rescan", onClick: () => actions.rescan() });
  const clearBtn = el("button", {
    class: "rn-btn rn-danger rn-wide",
    type: "button",
    text: "Clear page progress",
    onClick: () => showConfirm(),
  });

  grid.appendChild(pauseBtn);
  grid.appendChild(markBtn);
  grid.appendChild(saveBtn);
  grid.appendChild(rescanBtn);
  grid.appendChild(clearBtn);

  function showConfirm() {
    clearChildren(confirmSlot);
    const box = el("div", { class: "rn-confirm" });
    box.appendChild(el("div", { text: "Delete saved reading progress for this page? This cannot be undone." }));
    const row = el("div", { class: "rn-confirm-actions" });
    row.appendChild(
      el("button", {
        class: "rn-btn rn-danger",
        type: "button",
        text: "Delete",
        onClick: () => {
          clearChildren(confirmSlot);
          actions.clearProgress();
        },
      })
    );
    row.appendChild(
      el("button", {
        class: "rn-btn",
        type: "button",
        text: "Cancel",
        onClick: () => clearChildren(confirmSlot),
      })
    );
    box.appendChild(row);
    confirmSlot.appendChild(box);
  }

  function update(vm) {
    pauseBtn.textContent = vm.paused ? "Resume" : "Pause";
    const hasMark = vm.manualMarkSegmentId != null;
    markBtn.textContent = hasMark ? "Move mark here" : "Mark this spot";
  }

  return { element, update };
}
