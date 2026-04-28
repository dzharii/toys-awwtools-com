const TONES = new Set(["neutral", "info", "success", "warning", "danger"]);
const DENSITIES = new Set(["compact", "normal", "spacious"]);
const ALIGNMENTS = new Set(["start", "center", "end", "between"]);
const ORIENTATIONS = new Set(["horizontal", "vertical", "inline"]);

let idSerial = 0;

export function createId(prefix = "aww") {
  idSerial += 1;
  return `${prefix}-${idSerial}`;
}

export function normalizeTone(value, fallback = "neutral") {
  return TONES.has(value) ? value : fallback;
}

export function normalizeDensity(value, fallback = "normal") {
  return DENSITIES.has(value) ? value : fallback;
}

export function normalizeAlignment(value, fallback = "start") {
  return ALIGNMENTS.has(value) ? value : fallback;
}

export function normalizeOrientation(value, fallback = "horizontal") {
  return ORIENTATIONS.has(value) ? value : fallback;
}

export function isFocusable(element) {
  if (!element || element.disabled || element.getAttribute?.("aria-disabled") === "true") return false;
  if (element.tabIndex >= 0) return true;
  return /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(element.tagName) && !element.hasAttribute("disabled");
}

export function getFocusableElements(root) {
  if (!root?.querySelectorAll) return [];
  return [...root.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter(isFocusable);
}

export function dispatchComponentEvent(target, name, detail = {}, options = {}) {
  return target.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    composed: true,
    cancelable: Boolean(options.cancelable),
    detail
  }));
}
