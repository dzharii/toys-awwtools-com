// Rendering: applies typography/theme preferences to the DOM and turns the
// normalized document HTML into a content element. Document HTML is already
// safe (TXT escaped, Markdown sanitized); links are post-processed so they are
// subdued and never prefetched.

import { fontStackFor } from "./preferences.js";
import { log } from "./logging.js";

/**
 * Apply preferences to CSS custom properties and data attributes.
 * @param {object} prefs
 * @param {object} els { html, reader }
 * @param {boolean} reducedMotionSystem
 */
export function applyPreferences(prefs, els, reducedMotionSystem) {
  const html = els.html;
  const reader = els.reader;

  // Theme + contrast on <html>.
  html.setAttribute("data-theme", prefs.theme);
  html.setAttribute("data-contrast", prefs.contrast);

  // Typography custom properties.
  const root = html.style;
  root.setProperty("--reader-font", fontStackFor(prefs.fontFamily));
  root.setProperty("--reader-font-size", `${prefs.fontSize}px`);
  root.setProperty("--reader-line-height", String(prefs.lineHeight));
  root.setProperty("--reader-measure", `${prefs.measure}ch`);
  root.setProperty("--reader-para-spacing", `${prefs.paraSpacing}em`);
  root.setProperty("--reader-align", prefs.align === "justify" ? "justify" : "left");
  root.setProperty("--texture-strength", String(prefs.textureStrength));
  root.setProperty("--ghost-opacity", String((0.04 + prefs.ghosting * 0.2).toFixed(3)));

  if (reader) {
    reader.setAttribute("data-mode", prefs.readerMode);
    reader.setAttribute("data-eink", prefs.einkIntensity);
    reader.setAttribute("data-progress", prefs.showProgress ? "on" : "off");
    const effectiveMotion =
      prefs.motion === "reduced" || (prefs.motion === "system" && reducedMotionSystem)
        ? "reduced"
        : "full";
    reader.setAttribute("data-motion", effectiveMotion);
  }
}

/** Make links subdued, open on explicit click, and never prefetched. */
export function processLinks(container) {
  const anchors = container.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    // Only allow http(s), mailto and in-page anchors; neutralize anything else.
    if (!/^(https?:|mailto:|#)/i.test(href)) {
      a.removeAttribute("href");
      a.setAttribute("data-blocked-href", "1");
      return;
    }
    if (/^https?:/i.test(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      if (!a.getAttribute("title")) a.setAttribute("title", href);
    }
  });
}

/**
 * Build a content element from the document HTML.
 * @param {object} doc normalized document
 * @returns HTMLElement
 */
export function buildContent(doc) {
  const el = document.createElement("div");
  el.className = "content";
  el.setAttribute("lang", "en");
  // Safe: TXT is escaped, Markdown is sanitized by DOMPurify.
  el.innerHTML = doc.html;
  processLinks(el);
  log.info("renderer:complete", { blocks: el.childElementCount });
  return el;
}
