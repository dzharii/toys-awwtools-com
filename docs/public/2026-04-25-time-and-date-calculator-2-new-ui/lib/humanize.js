export const MONTH_NAMES = [
  null,
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DURATION_UNITS = [
  ["weeks", 7 * 24 * 60 * 60 * 1000, "w"],
  ["days", 24 * 60 * 60 * 1000, "d"],
  ["hours", 60 * 60 * 1000, "h"],
  ["minutes", 60 * 1000, "m"],
  ["seconds", 1000, "s"],
  ["milliseconds", 1, "ms"],
];

const UNIT_MS = Object.fromEntries(DURATION_UNITS.map(([unit, ms]) => [unit, ms]));
const COMPACT_SYMBOLS = Object.fromEntries(DURATION_UNITS.map(([unit, , symbol]) => [unit, symbol]));

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatUnitCount(count, unit) {
  if (unit === "businessDays") {
    return pluralize(count, "business day");
  }
  const singular = unit.endsWith("s") ? unit.slice(0, -1) : unit;
  return pluralize(count, singular, unit);
}

export function joinEnglishList(parts) {
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

export function ordinal(number) {
  const value = Number(number);
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function monthName(month) {
  return MONTH_NAMES[month] ?? null;
}

function durationToMilliseconds(duration) {
  if (!Object.hasOwn(UNIT_MS, duration.unit)) {
    return null;
  }
  return duration.amount * UNIT_MS[duration.unit];
}

function decomposeDuration(duration) {
  const totalMs = durationToMilliseconds(duration);
  if (totalMs == null) {
    return {
      sign: duration.amount < 0 ? "-" : "",
      parts: [{ unit: duration.unit, count: Math.abs(duration.amount) }],
    };
  }

  const sign = totalMs < 0 ? "-" : "";
  let remaining = Math.abs(totalMs);
  const parts = [];
  const units = duration.unit === "days" ? DURATION_UNITS.filter(([unit]) => unit !== "weeks") : DURATION_UNITS;

  for (const [unit, ms] of units) {
    const count = Math.floor(remaining / ms);
    if (count > 0) {
      parts.push({ unit, count });
      remaining -= count * ms;
    }
  }

  return {
    sign,
    parts: parts.length > 0 ? parts : [{ unit: "seconds", count: 0 }],
  };
}

export function formatDurationWords(duration, options = {}) {
  const { sign, parts } = decomposeDuration(duration);
  const selected = options.maxParts ? parts.slice(0, options.maxParts) : parts;
  return `${sign}${joinEnglishList(selected.map((part) => formatUnitCount(part.count, part.unit)))}`;
}

export function formatCompactDuration(duration) {
  const { sign, parts } = decomposeDuration(duration);
  return `${sign}${parts.map((part) => `${part.count}${COMPACT_SYMBOLS[part.unit] ?? part.unit}`).join(" ")}`;
}
