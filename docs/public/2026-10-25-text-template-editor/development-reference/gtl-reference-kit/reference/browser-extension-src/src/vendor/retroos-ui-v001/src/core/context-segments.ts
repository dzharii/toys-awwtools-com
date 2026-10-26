// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { normalizeTone, type Tone } from "./component-utils.js";

export interface ContextSegmentAction {
  id: string;
  label: string;
}

export interface ContextSegment {
  key: string;
  label: string;
  value: string;
  shortValue: string;
  copyValue: string;
  kind: string;
  tone: Tone;
  priority: number;
  title: string;
  source: string;
  stale: boolean;
  changed: boolean;
  disabled: boolean;
  copyable: boolean;
  interactive: boolean;
  actions: ContextSegmentAction[];
}

export interface ParsedContextSegment {
  key: string;
  value: string;
  kind: string;
  tone: Tone;
  priority: number;
}

type RawContextSegment = Record<string, unknown>;

function splitUnescapedPipes(value: unknown): string[] {
  const parts: string[] = [];
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

/** Parses compact pipe-separated context into neutral text segments. */
export function parseContextSegments(value: unknown): ParsedContextSegment[] {
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

/** Normalizes shorthand or structured segment data into the full component contract. */
export function normalizeContextSegment(segment: unknown, index = 0): ContextSegment | null {
  if (segment == null) return null;

  if (typeof segment !== "object") {
    const value = String(segment).trim();
    if (!value) return null;
    return {
      key: `segment-${index}`,
      label: "",
      value,
      shortValue: "",
      copyValue: "",
      kind: "text",
      tone: "neutral",
      priority: index,
      title: "",
      source: "",
      stale: false,
      changed: false,
      disabled: false,
      copyable: false,
      interactive: false,
      actions: []
    };
  }

  const input = segment as RawContextSegment;
  const value = String(input.value ?? input.shortValue ?? input.label ?? "").trim();
  if (!value) return null;

  // Stable keys are the basis for changed-segment highlighting. Index fallback
  // keeps shorthand data useful, but dynamic structured data should pass keys.
  return {
    key: String(input.key || `segment-${index}`),
    label: input.label == null ? "" : String(input.label),
    value,
    shortValue: input.shortValue == null ? "" : String(input.shortValue),
    copyValue: input.copyValue == null ? "" : String(input.copyValue),
    kind: input.kind == null ? "text" : String(input.kind),
    tone: normalizeTone(input.tone, "neutral"),
    priority: Number.isFinite(Number(input.priority)) ? Number(input.priority) : index,
    title: input.title == null ? "" : String(input.title),
    source: input.source == null ? "" : String(input.source),
    stale: Boolean(input.stale),
    changed: Boolean(input.changed),
    disabled: Boolean(input.disabled),
    copyable: Boolean(input.copyable || input.copyValue != null),
    interactive: Boolean(input.interactive || (Array.isArray(input.actions) && input.actions.length > 0)),
    actions: Array.isArray(input.actions)
      ? input.actions.map((action) => {
          const record = action as RawContextSegment;
          return {
            id: String(record.id ?? ""),
            label: String(record.label ?? record.id ?? "")
          };
        }).filter((action) => action.id)
      : []
  };
}

function isContextSegment(segment: ContextSegment | null): segment is ContextSegment {
  return segment !== null;
}

export function normalizeContextSegments(value: unknown): ContextSegment[] {
  if (typeof value === "string") return parseContextSegments(value).map(normalizeContextSegment).filter(isContextSegment);
  if (!Array.isArray(value)) return [];
  return value.map(normalizeContextSegment).filter(isContextSegment);
}

export function getSegmentCopyValue(segment: ContextSegment | null | undefined): string {
  if (!segment) return "";
  return String(segment.copyValue || segment.value || "");
}

/** Compares segment fields that affect visible state and available actions. */
export function segmentsEqual(prev: ContextSegment | null | undefined, next: ContextSegment | null | undefined): boolean {
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
