/**
 * Shadow DOM host.
 *
 * Creates the isolated host element (with a stable id so duplicate instances
 * can be detected), attaches an open shadow root, injects the scoped
 * stylesheet, and provides drag + resize behavior for the panel. Applies theme,
 * contrast, mode, font-scale, and opacity via host attributes / CSS variables.
 */

import { CONFIG } from "../config.js";
import { STYLES } from "./styles.css.js";
import { el } from "../utils/dom.js";

export function findExistingHost() {
  return document.getElementById(CONFIG.hostId);
}

export function createShadowHost() {
  const host = document.createElement("div");
  host.id = CONFIG.hostId;
  host.setAttribute(CONFIG.hostDataAttr, "host");
  host.setAttribute("data-mode", "expanded");
  host.setAttribute("data-theme", "light");
  host.setAttribute("data-contrast", "soft");
  // Host itself is a zero-size anchor; the panel inside is fixed-positioned.
  host.style.all = "initial";

  const shadowRoot = host.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = STYLES;
  shadowRoot.appendChild(styleEl);

  const root = el("div", { class: "rn-root", role: "region", "aria-label": CONFIG.appName });
  shadowRoot.appendChild(root);

  document.body.appendChild(host);

  const cleanups = [];

  function setMode(mode) {
    host.setAttribute("data-mode", mode === "compact" ? "compact" : "expanded");
  }
  function setTheme(theme) {
    host.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }
  function setContrast(contrast) {
    host.setAttribute("data-contrast", contrast === "high" ? "high" : "soft");
  }
  function setFontScale(scale) {
    root.style.setProperty("--rn-font-scale", String(scale));
  }
  function setOpacity(opacity) {
    root.style.setProperty("--rn-opacity", String(opacity));
  }

  // ---- Drag -----------------------------------------------------------------
  function enableDrag(handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      handle.classList.add("rn-dragging");
      const rect = root.getBoundingClientRect();
      // Switch to left/top positioning for dragging.
      root.style.left = rect.left + "px";
      root.style.top = rect.top + "px";
      root.style.right = "auto";
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const maxLeft = window.innerWidth - 60;
      const maxTop = window.innerHeight - 40;
      const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + (e.clientX - startX)));
      const nextTop = Math.min(maxTop, Math.max(0, startTop + (e.clientY - startY)));
      root.style.left = nextLeft + "px";
      root.style.top = nextTop + "px";
    };
    const onUp = () => {
      dragging = false;
      handle.classList.remove("rn-dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    handle.addEventListener("pointerdown", onDown);
    cleanups.push(() => {
      handle.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    });
  }

  // ---- Resize ---------------------------------------------------------------
  function enableResize(handle) {
    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startW = 0;
    let startH = 0;

    const onDown = (e) => {
      resizing = true;
      const rect = root.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startW = rect.width;
      startH = rect.height;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      e.preventDefault();
      e.stopPropagation();
    };
    const onMove = (e) => {
      if (!resizing) return;
      const nextW = Math.max(200, Math.min(window.innerWidth - 20, startW + (e.clientX - startX)));
      const nextH = Math.max(160, Math.min(window.innerHeight - 20, startH + (e.clientY - startY)));
      root.style.width = nextW + "px";
      root.style.height = nextH + "px";
      root.style.maxHeight = "none";
    };
    const onUp = () => {
      resizing = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    handle.addEventListener("pointerdown", onDown);
    cleanups.push(() => {
      handle.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    });
  }

  function destroy() {
    for (const fn of cleanups) {
      try {
        fn();
      } catch (_e) {
        /* ignore */
      }
    }
    cleanups.length = 0;
    if (host.parentNode) host.parentNode.removeChild(host);
  }

  return {
    host,
    shadowRoot,
    root,
    setMode,
    setTheme,
    setContrast,
    setFontScale,
    setOpacity,
    enableDrag,
    enableResize,
    destroy,
  };
}
