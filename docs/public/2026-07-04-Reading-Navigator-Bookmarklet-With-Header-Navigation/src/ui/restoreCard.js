/**
 * Restore card component. Shows saved-progress summary and restore actions.
 * The primary action is generic: "Jump to last reading position" (or "Jump to
 * marked position" when a manual mark exists). No vendor-specific labels.
 */

import { el, clearChildren } from "../utils/dom.js";
import { formatRelativeTime } from "../utils/time.js";

export function createRestoreCard(actions) {
  const element = el("div", { class: "rn-section" });
  const title = el("p", { class: "rn-section-title", text: "Restore" });
  const card = el("div", { class: "rn-card" });
  element.appendChild(title);
  element.appendChild(card);

  function row(label, value) {
    return el("div", { class: "rn-card-row" }, [
      el("span", { class: "rn-card-label", text: label }),
      el("span", { text: value }),
    ]);
  }

  function update(vm) {
    clearChildren(card);
    const r = vm.restore || {};

    if (!r.hasSaved) {
      card.className = "rn-card rn-empty";
      if (r.storageUnavailable) {
        card.appendChild(el("div", { text: "Restore after reload is unavailable (storage disabled). Progress is kept for this session only." }));
      } else {
        card.appendChild(el("div", { text: "No saved progress for this page yet. Keep reading and it will remember your place." }));
      }
      return;
    }

    card.className = "rn-card";

    if (r.lastSavedAt) {
      card.appendChild(row("Last saved", formatRelativeTime(r.lastSavedAt)));
    }
    if (r.lastContext) {
      card.appendChild(row("Last context", r.lastContext));
    }
    if (r.progressText) {
      card.appendChild(row("Progress", r.progressText));
    }
    if (r.confidenceLabel) {
      card.appendChild(row("Confidence", r.confidenceLabel));
    }
    if (r.fingerprintWarning) {
      card.appendChild(el("div", { class: "rn-card-warn", text: r.fingerprintWarning }));
    }

    // Actions.
    if (r.hasManualMark) {
      const primary = el("button", {
        class: "rn-btn rn-primary",
        type: "button",
        text: "Jump to marked position",
        onClick: () => actions.jumpToMark(),
      });
      const secondary = el("button", {
        class: "rn-btn",
        type: "button",
        text: "Jump to last reading position",
        onClick: () => actions.jumpToLastReading(),
      });
      card.appendChild(primary);
      card.appendChild(secondary);
    } else {
      const primary = el("button", {
        class: "rn-btn rn-primary",
        type: "button",
        text: "Jump to last reading position",
        onClick: () => actions.jumpToLastReading(),
      });
      card.appendChild(primary);
    }
  }

  return { element, update };
}
