/**
 * App shell. Root layout: title bar (title, compact/expand, pause, close),
 * scrollable body composing the status bar, progress summary, restore card,
 * heading panel, minimap rail, controls, settings, and debug panel. Also owns
 * an ARIA live region for restore announcements.
 */

import { CONFIG } from "../config.js";
import { el, clearChildren } from "../utils/dom.js";
import { createStatusBar } from "./statusBar.js";
import { createRestoreCard } from "./restoreCard.js";
import { createHeadingPanel } from "./headingPanel.js";
import { createMinimapRail } from "./minimapRail.js";
import { createControlsPanel } from "./controlsPanel.js";
import { createSettingsPanel } from "./settingsPanel.js";
import { createDebugPanel } from "./debugPanel.js";

export function createAppShell(root, actions, initialSettings) {
  clearChildren(root);

  // Title bar.
  const titleText = el("span", { class: "rn-title", text: CONFIG.appName });
  const compactBtn = el("button", { class: "rn-iconbtn", type: "button", title: "Compact / expand", "aria-label": "Toggle compact mode", text: "▭", onClick: () => actions.toggleMode() });
  const pauseBtn = el("button", { class: "rn-iconbtn", type: "button", title: "Pause / resume", "aria-label": "Pause or resume tracking", text: "⏸", onClick: () => actions.togglePause() });
  const closeBtn = el("button", { class: "rn-iconbtn", type: "button", title: "Close", "aria-label": "Close Reading Navigator", text: "✕", onClick: () => actions.close() });
  const titlebar = el("div", { class: "rn-titlebar" }, [titleText, el("span", { class: "rn-titlebar-buttons" }, [pauseBtn, compactBtn, closeBtn])]);

  // Components.
  const statusBar = createStatusBar();
  const progressSummary = el("div", { class: "rn-progress-summary", title: "Reading progress" });
  const restoreCard = createRestoreCard(actions);
  const headingPanel = createHeadingPanel(actions);
  const minimap = createMinimapRail(actions);
  const controls = createControlsPanel(actions);
  const settings = createSettingsPanel(actions, initialSettings);
  const debug = createDebugPanel();

  const statusSection = el("div", { class: "rn-section" }, [statusBar.element, progressSummary]);

  // Body. Order: minimap (kept in compact), status, restore, heading, controls, settings, debug.
  const body = el("div", { class: "rn-body" }, [
    minimap.element,
    statusSection,
    wrapCollapsible(restoreCard.element),
    wrapCollapsible(headingPanel.element),
    wrapCollapsible(controls.element),
    settings.element,
    debug.element,
  ]);

  const live = el("div", { class: "rn-live", role: "status", "aria-live": "assertive" });
  const resizeHandle = el("div", { class: "rn-resize", title: "Resize" });

  root.appendChild(titlebar);
  root.appendChild(body);
  root.appendChild(live);
  root.appendChild(resizeHandle);

  function wrapCollapsible(node) {
    node.classList.add("rn-collapsible");
    return node;
  }

  function build(segments) {
    minimap.build(segments);
  }

  const components = [statusBar, restoreCard, headingPanel, minimap, controls, settings, debug];

  function update(vm) {
    for (const c of components) {
      try {
        c.update(vm);
      } catch (_e) {
        /* fail open per component */
      }
    }
    renderProgressSummary(vm.progress);
    pauseBtn.textContent = vm.paused ? "▶" : "⏸";
  }

  function renderProgressSummary(progress) {
    clearChildren(progressSummary);
    if (!progress) return;
    const parts = [
      [progress.probablyReadRatio, "var(--rn-read)"],
      [progress.skimmedRatio, "var(--rn-skimmed)"],
      [progress.seenRatio, "var(--rn-seen)"],
      [progress.unreadRatio, "var(--rn-unseen)"],
    ];
    for (const [ratio, color] of parts) {
      if (!ratio) continue;
      const span = el("span");
      span.style.width = Math.max(0, ratio * 100) + "%";
      span.style.background = color;
      progressSummary.appendChild(span);
    }
  }

  let lastAnnouncement = "";
  function announce(text) {
    if (!text || text === lastAnnouncement) return;
    lastAnnouncement = text;
    live.textContent = "";
    // Force re-announcement even for repeated content.
    setTimeout(() => {
      live.textContent = text;
    }, 30);
  }

  return {
    build,
    update,
    announce,
    settings,
    elements: { titlebar, resizeHandle },
  };
}
