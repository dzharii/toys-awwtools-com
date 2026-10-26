// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

const TONES = new Set(["neutral", "info", "success", "warning", "danger"]);
const DENSITIES = new Set(["compact", "normal", "spacious"]);
const ALIGNMENTS = new Set(["start", "center", "end", "between"]);
const ORIENTATIONS = new Set(["horizontal", "vertical", "inline"]);

let idSerial = 0;

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";
export type Density = "compact" | "normal" | "spacious";
export type Alignment = "start" | "center" | "end" | "between";
export type Orientation = "horizontal" | "vertical" | "inline";

export function createId(prefix = "aww"): string {
  idSerial += 1;
  return `${prefix}-${idSerial}`;
}

export function normalizeTone(value: unknown, fallback: Tone = "neutral"): Tone {
  const normalized = String(value ?? "");
  return TONES.has(normalized) ? normalized as Tone : fallback;
}

export function normalizeDensity(value: unknown, fallback: Density = "normal"): Density {
  const normalized = String(value ?? "");
  return DENSITIES.has(normalized) ? normalized as Density : fallback;
}

export function normalizeAlignment(value: unknown, fallback: Alignment = "start"): Alignment {
  const normalized = String(value ?? "");
  return ALIGNMENTS.has(normalized) ? normalized as Alignment : fallback;
}

export function normalizeOrientation(value: unknown, fallback: Orientation = "horizontal"): Orientation {
  const normalized = String(value ?? "");
  return ORIENTATIONS.has(normalized) ? normalized as Orientation : fallback;
}

export function isFocusable(element: unknown): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  const candidate = element as HTMLElement & { disabled?: boolean };
  if (candidate.disabled || candidate.getAttribute?.("aria-disabled") === "true") return false;
  if (candidate.tabIndex >= 0) return true;
  return /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(candidate.tagName) && !candidate.hasAttribute("disabled");
}

export function getFocusableElements(root: ParentNode | null | undefined): HTMLElement[] {
  if (!root?.querySelectorAll) return [];
  return [...root.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter(isFocusable);
}

/** Emits the framework's default bubbling, composed custom event from a component host. */
export function dispatchComponentEvent(
  target: EventTarget,
  name: string,
  detail: unknown = {},
  options: { cancelable?: boolean } = {}
): boolean {
  return target.dispatchEvent(new CustomEvent(name, {
    bubbles: true,
    composed: true,
    cancelable: Boolean(options.cancelable),
    detail
  }));
}
