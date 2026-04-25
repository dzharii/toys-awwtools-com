import {
  plainDateFromZoned,
  plainDateToEpochDay,
  plainDateToString,
  zonedDateTimeToLocalParts,
  zonedToIsoString,
} from "./timezone.js";
import { formatCompactDuration, formatDurationWords, formatUnitCount, monthName, ordinal } from "./humanize.js";

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value));
}

export function formatDuration(duration) {
  const sign = duration.amount < 0 ? "-" : "";
  const absolute = Math.abs(duration.amount);

  switch (duration.unit) {
    case "years":
      return `${sign}P${formatNumber(absolute)}Y`;
    case "months":
      return `${sign}P${formatNumber(absolute)}M`;
    case "weeks":
      return `${sign}P${formatNumber(absolute)}W`;
    case "days":
      return `${sign}P${formatNumber(absolute)}D`;
    case "businessDays":
      return `${sign}P${formatNumber(absolute)}BD`;
    case "hours":
      return `${sign}PT${formatNumber(absolute)}H`;
    case "minutes":
      return `${sign}PT${formatNumber(absolute)}M`;
    case "seconds":
      return `${sign}PT${formatNumber(absolute)}S`;
    case "milliseconds": {
      const seconds = (absolute / 1000).toFixed(3).replace(/\.000$/, "").replace(/0+$/, "").replace(/\.$/, "");
      return `${sign}PT${seconds}S`;
    }
    default:
      throw new TypeError(`Unsupported duration unit '${duration.unit}'.`);
  }
}

function assertDuration(value, label) {
  if (value?.kind !== "Duration") {
    throw new TypeError(`${label} requires a duration value.`);
  }
}

function assertDateLike(value, label) {
  if (value?.kind !== "PlainDate" && value?.kind !== "ZonedDateTime") {
    throw new TypeError(`${label} requires a date/time value.`);
  }
}

function formatRelativeMilliseconds(deltaMs) {
  const sign = deltaMs < 0 ? -1 : deltaMs > 0 ? 1 : 0;
  if (sign === 0) {
    return "now";
  }

  const absolute = Math.abs(deltaMs);
  const units = [
    ["weeks", 7 * 24 * 60 * 60 * 1000],
    ["days", 2 * 24 * 60 * 60 * 1000],
    ["hours", 60 * 60 * 1000],
    ["minutes", 60 * 1000],
    ["seconds", 1000],
    ["milliseconds", 1],
  ];
  const [unit, threshold] = units.find(([, unitMs]) => absolute >= unitMs && absolute % (unitMs === 2 * 24 * 60 * 60 * 1000 ? 24 * 60 * 60 * 1000 : unitMs) === 0) ?? units.find(([, unitMs]) => absolute >= unitMs);
  const ms = unit === "days" ? 24 * 60 * 60 * 1000 : threshold;
  const amount = Math.floor(absolute / ms);
  const phrase = formatUnitCount(amount, unit);
  return sign < 0 ? `${phrase} ago` : `${phrase} from now`;
}

function formatRelativePlainDate(value, context) {
  const today = plainDateFromZoned(context.now, context.timeZoneId);
  const deltaDays = plainDateToEpochDay(value) - plainDateToEpochDay(today);
  if (deltaDays === 0) {
    return "now";
  }
  const phrase = formatUnitCount(Math.abs(deltaDays), "days");
  return deltaDays < 0 ? `${phrase} ago` : `${phrase} from now`;
}

function formatRelativeDateTime(value, context) {
  const now = context.now;
  const valueParts = zonedDateTimeToLocalParts(value, context.timeZoneId);
  const nowParts = zonedDateTimeToLocalParts(now, context.timeZoneId);
  const valueDate = plainDateFromZoned(value, context.timeZoneId);
  const nowDate = plainDateFromZoned(now, context.timeZoneId);
  const localDayDelta = plainDateToEpochDay(valueDate) - plainDateToEpochDay(nowDate);
  const sameWallClock =
    valueParts.hour === nowParts.hour &&
    valueParts.minute === nowParts.minute &&
    valueParts.second === nowParts.second &&
    valueParts.millisecond === nowParts.millisecond;

  if (sameWallClock && localDayDelta !== 0) {
    const phrase = formatUnitCount(Math.abs(localDayDelta), "days");
    return localDayDelta < 0 ? `${phrase} ago` : `${phrase} from now`;
  }

  return formatRelativeMilliseconds(value.epochMs - now.epochMs);
}

function formatOrdinalDate(value, context) {
  assertDateLike(value, "Ordinal date transform");
  const date = value.kind === "PlainDate" ? value : plainDateFromZoned(value, context.timeZoneId);
  return `${monthName(date.month)} ${ordinal(date.day)}, ${date.year}`;
}

const CLOCK_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
  "twenty-one",
  "twenty-two",
  "twenty-three",
  "twenty-four",
  "twenty-five",
  "twenty-six",
  "twenty-seven",
  "twenty-eight",
  "twenty-nine",
];

function clockHourName(hour) {
  const twelveHour = hour % 12 || 12;
  return CLOCK_WORDS[twelveHour];
}

function formatClock(value, context) {
  if (value?.kind !== "ZonedDateTime") {
    throw new TypeError("Clock transform requires a time-of-day value.");
  }
  const parts = zonedDateTimeToLocalParts(value, context.timeZoneId);
  if (parts.minute === 0) {
    return `${clockHourName(parts.hour)} o'clock`;
  }
  if (parts.minute === 15) {
    return `a quarter past ${clockHourName(parts.hour)}`;
  }
  if (parts.minute === 30) {
    return `half past ${clockHourName(parts.hour)}`;
  }
  if (parts.minute === 45) {
    return `a quarter to ${clockHourName(parts.hour + 1)}`;
  }
  if (parts.minute < 30) {
    return `${CLOCK_WORDS[parts.minute]} past ${clockHourName(parts.hour)}`;
  }
  return `${CLOCK_WORDS[60 - parts.minute]} to ${clockHourName(parts.hour + 1)}`;
}

export function formatValue(value, transform, context = {}) {
  const mode = transform || null;

  if (!mode) {
    if (value?.kind === "PlainDate") {
      return plainDateToString(value);
    }
    if (value?.kind === "ZonedDateTime") {
      return zonedToIsoString(value);
    }
    if (value?.kind === "Duration") {
      return formatDuration(value);
    }
    return String(value);
  }

  if (mode === "iso") {
    if (value?.kind === "PlainDate") {
      return plainDateToString(value);
    }
    if (value?.kind === "ZonedDateTime") {
      return zonedToIsoString(value);
    }
    if (value?.kind === "Duration") {
      return formatDuration(value);
    }
    return String(value);
  }

  if (mode === "date") {
    if (value?.kind === "PlainDate") {
      return plainDateToString(value);
    }
    if (value?.kind === "ZonedDateTime") {
      const parts = zonedDateTimeToLocalParts(value, context.timeZoneId);
      return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
    }
    throw new TypeError("Date transform requires PlainDate or ZonedDateTime.");
  }

  if (mode === "time") {
    if (value?.kind === "ZonedDateTime") {
      const parts = zonedDateTimeToLocalParts(value, context.timeZoneId);
      return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}:${String(parts.second).padStart(2, "0")}`;
    }
    throw new TypeError("Time transform requires a time-of-day value.");
  }

  if (mode === "durationWords") {
    assertDuration(value, "Duration words transform");
    return formatDurationWords(value);
  }

  if (mode === "duration") {
    assertDuration(value, "Duration transform");
    return formatDurationWords(value, { maxParts: 2 });
  }

  if (mode === "compactDuration") {
    assertDuration(value, "Compact duration transform");
    return formatCompactDuration(value);
  }

  if (mode === "relative") {
    assertDateLike(value, "Relative transform");
    if (!context.now?.kind) {
      throw new TypeError("Relative transform requires a sampled context now.");
    }
    return value.kind === "PlainDate" ? formatRelativePlainDate(value, context) : formatRelativeDateTime(value, context);
  }

  if (mode === "ordinal") {
    if (!Number.isInteger(value) || value < 0) {
      throw new TypeError("Ordinal transform requires a non-negative integer.");
    }
    return ordinal(value);
  }

  if (mode === "ordinalDate") {
    return formatOrdinalDate(value, context);
  }

  if (mode === "clock") {
    return formatClock(value, context);
  }

  throw new TypeError(`Unsupported transform '${transform}'.`);
}

export function getValueType(value) {
  if (value?.kind === "PlainDate") {
    return "PlainDate";
  }
  if (value?.kind === "ZonedDateTime") {
    return value.zoneKind === "offset" ? "OffsetDateTime" : "ZonedDateTime";
  }
  if (value?.kind === "Duration") {
    return "Duration";
  }
  if (typeof value === "number") {
    return "Number";
  }
  if (typeof value === "boolean") {
    return "Boolean";
  }
  if (typeof value === "string") {
    return "String";
  }
  return "Unknown";
}
