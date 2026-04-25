import { foldCase } from "./keywords.js";

export const TRANSFORM_PHRASES = new Map([
  ["iso", "iso"],
  ["date", "date"],
  ["time", "time"],
  ["relative", "relative"],
  ["duration", "duration"],
  ["duration words", "durationWords"],
  ["compact duration", "compactDuration"],
  ["ordinal", "ordinal"],
  ["ordinal date", "ordinalDate"],
  ["clock", "clock"],
]);

export const SUPPORTED_TRANSFORMS = new Set(TRANSFORM_PHRASES.values());

export function normalizeTransformPhrase(text) {
  return foldCase(text).trim().replace(/\s+/g, " ");
}

export function canonicalTransformName(text) {
  return TRANSFORM_PHRASES.get(normalizeTransformPhrase(text)) ?? null;
}

export function supportedTransformList() {
  return [...TRANSFORM_PHRASES.keys()].join(", ");
}
