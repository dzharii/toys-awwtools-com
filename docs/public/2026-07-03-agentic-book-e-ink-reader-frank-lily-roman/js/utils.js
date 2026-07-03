// Small, dependency-free helpers shared across modules.

/** Clamp a number into an inclusive range. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Coerce to a finite number or return the fallback. */
export function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Escape text so it can be safely inserted as HTML text content. */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Trailing debounce. */
export function debounce(fn, wait) {
  let timer = null;
  return function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, wait);
  };
}

/** Session-only id. Never used to persist content. */
export function generateId() {
  return "s-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

/** Get a file extension in lower case, without the dot. */
export function fileExtension(name) {
  const match = /\.([a-z0-9]+)$/i.exec(name || "");
  return match ? match[1].toLowerCase() : "";
}

/** Resolve after the next paint (two rAFs) so layout/animation classes apply. */
export function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Wait for a fixed number of milliseconds. */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Rough word count without holding onto the text. */
export function estimateWords(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** True if the string looks like binary content (has null/control bytes). */
export function looksBinary(sample) {
  if (!sample) return false;
  let suspicious = 0;
  const len = Math.min(sample.length, 4000);
  for (let i = 0; i < len; i += 1) {
    const code = sample.charCodeAt(i);
    if (code === 0) return true;
    // control chars excluding tab, LF, CR, form feed
    if (code < 9 || (code > 13 && code < 32)) suspicious += 1;
  }
  return suspicious / Math.max(1, len) > 0.02;
}
