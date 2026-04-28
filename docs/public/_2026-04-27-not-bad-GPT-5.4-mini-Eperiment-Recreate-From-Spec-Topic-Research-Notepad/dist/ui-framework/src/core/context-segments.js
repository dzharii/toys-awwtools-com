import { normalizeTone } from "./component-utils.js";

function splitUnescapedPipes(value) {
  const parts = [];
  let current = "";
  let escaping = false;

  for (const char of String(value ?? "")) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === "|") {
      parts.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (escaping) current += "\\";
  parts.push(current);
  return parts;
}

export function parseContextSegments(value) {
  return splitUnescapedPipes(value)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => ({
      key: `segment-${index}`,
      value: part,
      kind: "text",
      tone: "neutral",
      priority: index
    }));
}

export function normalizeContextSegment(segment, index = 0) {
  if (segment == null) return null;

  if (typeof segment !== "object") {
    const value = String(segment).trim();
    if (!value) return null;
    return {
      key: `segment-${index}`,
      value,
      kind: "text",
      tone: "neutral",
      priority: index,
      actions: []
    };
  }

  const value = String(segment.value ?? segment.shortValue ?? segment.label ?? "").trim();
  if (!value) return null;

  // Stable keys are the basis for changed-segment highlighting. Index fallback
  // keeps shorthand data useful, but dynamic structured data should pass keys.
  return {
    key: String(segment.key || `segment-${index}`),
    label: segment.label == null ? "" : String(segment.label),
    value,
    shortValue: segment.shortValue == null ? "" : String(segment.shortValue),
    copyValue: segment.copyValue == null ? "" : String(segment.copyValue),
    kind: segment.kind == null ? "text" : String(segment.kind),
    tone: normalizeTone(segment.tone, "neutral"),
    priority: Number.isFinite(Number(segment.priority)) ? Number(segment.priority) : index,
    title: segment.title == null ? "" : String(segment.title),
    source: segment.source == null ? "" : String(segment.source),
    stale: Boolean(segment.stale),
    changed: Boolean(segment.changed),
    disabled: Boolean(segment.disabled),
    copyable: Boolean(segment.copyable || segment.copyValue != null),
    interactive: Boolean(segment.interactive || segment.actions?.length),
    actions: Array.isArray(segment.actions)
      ? segment.actions.map((action) => ({
          id: String(action.id ?? ""),
          label: String(action.label ?? action.id ?? "")
        })).filter((action) => action.id)
      : []
  };
}

export function normalizeContextSegments(value) {
  if (typeof value === "string") return parseContextSegments(value).map(normalizeContextSegment).filter(Boolean);
  if (!Array.isArray(value)) return [];
  return value.map(normalizeContextSegment).filter(Boolean);
}

export function getSegmentCopyValue(segment) {
  if (!segment) return "";
  return String(segment.copyValue || segment.value || "");
}

export function segmentsEqual(prev, next) {
  if (!prev || !next) return false;
  return prev.key === next.key &&
    prev.value === next.value &&
    prev.shortValue === next.shortValue &&
    prev.copyValue === next.copyValue &&
    prev.label === next.label &&
    prev.kind === next.kind &&
    prev.tone === next.tone &&
    prev.disabled === next.disabled &&
    prev.stale === next.stale &&
    JSON.stringify(prev.actions || []) === JSON.stringify(next.actions || []);
}
