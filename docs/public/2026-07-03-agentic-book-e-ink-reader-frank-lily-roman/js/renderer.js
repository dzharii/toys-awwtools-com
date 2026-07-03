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
 * Add line numbers to fenced code blocks.
 *
 * Runs on already-sanitized DOM (never on raw input), so it introduces no new
 * security surface. Each fenced block gets a non-selectable gutter with one
 * number per source line. The gutter shares the code font-size and line-height,
 * so number N lines up with source line N; the code keeps its own horizontal
 * scroll and indentation. Numbers restart at 1 for every block. No code text is
 * copied anywhere persistent — this is display-only DOM.
 */
export function enhanceCodeBlocks(container) {
  const blocks = container.querySelectorAll("pre > code");
  blocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre || pre.querySelector(".code-gutter")) return; // idempotent

    const raw = codeEl.textContent || "";
    const lines = raw.split("\n");
    // markdown-it emits a single trailing newline; drop it so the rendered row
    // count matches the gutter number count exactly.
    if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
    const lineCount = lines.length;
    if (lineCount < 1) return;

    // Re-set the code text without the trailing newline for exact alignment.
    codeEl.textContent = lines.join("\n");

    const cls = codeEl.getAttribute("class") || "";
    const langMatch = cls.match(/language-([A-Za-z0-9_+-]+)/);
    if (langMatch) pre.setAttribute("data-lang", langMatch[1]);

    const gutter = document.createElement("span");
    gutter.className = "code-gutter";
    gutter.setAttribute("aria-hidden", "true");
    for (let i = 1; i <= lineCount; i++) {
      const num = document.createElement("span");
      num.className = "code-line-number";
      num.textContent = String(i);
      gutter.appendChild(num);
    }
    pre.insertBefore(gutter, codeEl);
    pre.classList.add("code-block", "has-line-numbers");
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
  enhanceCodeBlocks(el);
  log.info("renderer:complete", { blocks: el.childElementCount });
  return el;
}
