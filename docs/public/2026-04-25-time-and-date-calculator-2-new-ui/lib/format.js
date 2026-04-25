import { plainDateToString, zonedDateTimeToLocalParts, zonedToIsoString } from "./timezone.js";

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value));
}

export function formatDuration(duration) {
  const sign = duration.amount < 0 ? "-" : "";
  const absolute = Math.abs(duration.amount);

  if (duration.unit === "days") {
    return `${sign}P${formatNumber(absolute)}D`;
  }

  if (duration.unit === "seconds") {
    return `${sign}PT${formatNumber(absolute)}S`;
  }

  if (duration.unit === "milliseconds") {
    const seconds = (absolute / 1000).toFixed(3).replace(/\.000$/, "").replace(/0+$/, "").replace(/\.$/, "");
    return `${sign}PT${seconds}S`;
  }

  return `${sign}P${formatNumber(absolute)}D`;
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
    return "ZonedDateTime";
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
