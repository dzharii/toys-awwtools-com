/**
 * main.js: idempotent runtime entry.
 *
 * Ensures only one app instance exists. If already running, a second trigger
 * toggles UI visibility rather than creating a duplicate panel or tracker.
 */

import { CONFIG } from "./config.js";
import { createApp } from "./app/createApp.js";

export function run() {
  try {
    // Already running: toggle visibility instead of duplicating.
    if (window.__readingNavigatorApp) {
      window.__readingNavigatorApp.toggleVisibility();
      return window.__readingNavigatorApp;
    }

    // Stale host with no live app object: remove before recreating.
    const staleHost = document.getElementById(CONFIG.hostId);
    if (staleHost && staleHost.parentNode) staleHost.parentNode.removeChild(staleHost);
    const staleOverlay = document.getElementById(CONFIG.hostId + "-overlays");
    if (staleOverlay && staleOverlay.parentNode) staleOverlay.parentNode.removeChild(staleOverlay);

    const app = createApp();
    window.__readingNavigatorApp = app;
    app.start();
    return app;
  } catch (err) {
    if (typeof console !== "undefined" && console.error) {
      console.error("[Reading Navigator] failed to start:", err);
    }
    return null;
  }
}

export default run;
