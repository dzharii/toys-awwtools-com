const UNIT_ALIASES = new Map([
  ["d", "days"],
  ["day", "days"],
  ["days", "days"],
  ["w", "weeks"],
  ["week", "weeks"],
  ["weeks", "weeks"],
  ["month", "months"],
  ["months", "months"],
  ["year", "years"],
  ["years", "years"],
  ["h", "hours"],
  ["hour", "hours"],
  ["hours", "hours"],
  ["m", "minutes"],
  ["min", "minutes"],
  ["mins", "minutes"],
  ["minute", "minutes"],
  ["minutes", "minutes"],
  ["s", "seconds"],
  ["sec", "seconds"],
  ["secs", "seconds"],
  ["second", "seconds"],
  ["seconds", "seconds"],
  ["businessday", "businessDays"],
  ["businessdays", "businessDays"],
]);

export const TRANSFORMS = new Set(["iso", "date", "time"]);

export function foldCase(text) {
  return String(text).toLocaleLowerCase("en-US");
}

export function normalizeTokenSurface(text) {
  return foldCase(text).replace(/\s+/g, "");
}

export function normalizeUnitAlias(text) {
  return UNIT_ALIASES.get(normalizeTokenSurface(text)) ?? null;
}

export function isBusinessDaysWord(text) {
  const value = normalizeTokenSurface(text);
  return value === "businessday" || value === "businessdays";
}

export function isKeyword(text, expected) {
  return foldCase(text) === foldCase(expected);
}

export function isIdentifierStart(ch) {
  return /[A-Za-z_]/.test(ch);
}

export function isIdentifierPart(ch) {
  return /[A-Za-z0-9_./]/.test(ch);
}

export function isWhitespace(ch) {
  return /\s/.test(ch);
}

export function weekdayNameToIndex(name) {
  const normalized = foldCase(name);
  switch (normalized) {
    case "sunday":
      return 0;
    case "monday":
      return 1;
    case "tuesday":
      return 2;
    case "wednesday":
      return 3;
    case "thursday":
      return 4;
    case "friday":
      return 5;
    case "saturday":
      return 6;
    default:
      return null;
  }
}
