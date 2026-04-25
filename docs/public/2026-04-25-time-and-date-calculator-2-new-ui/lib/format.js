import { plainDateToString, zonedDateTimeToLocalParts, zonedToIsoString } from "./timezone.js";

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

export function formatValue(value, transform, context = {}) {
  const mode = transform ? String(transform).toLocaleLowerCase("en-US") : null;

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
