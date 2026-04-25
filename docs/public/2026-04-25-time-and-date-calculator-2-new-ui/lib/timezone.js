const DAY_MS = 24 * 60 * 60 * 1000;

const partFormatterCache = new Map();
const offsetFormatterCache = new Map();

function pad2(value) {
  return String(value).padStart(2, "0");
}

function pad3(value) {
  return String(value).padStart(3, "0");
}

function pad4(value) {
  return String(value).padStart(4, "0");
}

export function formatOffsetMinutes(offsetMinutes) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `${sign}${pad2(hours)}:${pad2(minutes)}`;
}

export function getRuntimeTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function validateIanaTimeZone(timeZoneId) {
  try {
    // eslint-disable-next-line no-new
    new Intl.DateTimeFormat("en-US", { timeZone: timeZoneId });
    return true;
  } catch {
    return false;
  }
}

function getPartFormatter(timeZoneId) {
  if (!partFormatterCache.has(timeZoneId)) {
    partFormatterCache.set(
      timeZoneId,
      new Intl.DateTimeFormat("en-US", {
        timeZone: timeZoneId,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    );
  }
  return partFormatterCache.get(timeZoneId);
}

function getOffsetFormatter(timeZoneId) {
  if (!offsetFormatterCache.has(timeZoneId)) {
    offsetFormatterCache.set(
      timeZoneId,
      new Intl.DateTimeFormat("en-US", {
        timeZone: timeZoneId,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "longOffset",
      }),
    );
  }
  return offsetFormatterCache.get(timeZoneId);
}

function parseOffsetName(name) {
  const source = name.replace("UTC", "GMT");
  if (source === "GMT") {
    return 0;
  }
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(source);
  if (!match) {
    return 0;
  }
  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return sign * (hours * 60 + minutes);
}

export function getOffsetMinutesForZone(epochMs, timeZoneId) {
  const formatter = getOffsetFormatter(timeZoneId);
  const parts = formatter.formatToParts(new Date(epochMs));
  const tzName = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  return parseOffsetName(tzName);
}

export function localPartsInZone(epochMs, timeZoneId) {
  const formatter = getPartFormatter(timeZoneId);
  const date = new Date(epochMs);
  const parts = formatter.formatToParts(date);
  const values = Object.create(null);
  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
    millisecond: ((epochMs % 1000) + 1000) % 1000,
  };
}

export function localPartsInFixedOffset(epochMs, offsetMinutes) {
  const shifted = new Date(epochMs + offsetMinutes * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    millisecond: shifted.getUTCMilliseconds(),
  };
}

function compareLocalDateTime(a, b) {
  const fields = ["year", "month", "day", "hour", "minute", "second", "millisecond"];
  for (const field of fields) {
    if (a[field] !== b[field]) {
      return a[field] - b[field];
    }
  }
  return 0;
}

function sameLocalDateTime(a, b) {
  return compareLocalDateTime(a, b) === 0;
}

export function epochFromLocalPartsFixedOffset(parts, offsetMinutes) {
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour ?? 0,
      parts.minute ?? 0,
      parts.second ?? 0,
      parts.millisecond ?? 0,
    ) -
    offsetMinutes * 60_000
  );
}

export function epochFromLocalPartsInZone(parts, timeZoneId) {
  let guess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0,
    parts.millisecond ?? 0,
  );

  for (let i = 0; i < 8; i += 1) {
    const offsetMinutes = getOffsetMinutesForZone(guess, timeZoneId);
    const candidate =
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour ?? 0,
        parts.minute ?? 0,
        parts.second ?? 0,
        parts.millisecond ?? 0,
      ) -
      offsetMinutes * 60_000;
    if (candidate === guess) {
      break;
    }
    guess = candidate;
  }

  const around = [];
  for (let step = -180; step <= 180; step += 1) {
    around.push(guess + step * 60_000);
  }

  for (const candidate of around) {
    const local = localPartsInZone(candidate, timeZoneId);
    if (sameLocalDateTime(local, parts)) {
      return candidate;
    }
  }

  // DST gap fallback: choose the first representable local time after the requested wall time.
  let candidate = guess;
  for (let i = 0; i < 360; i += 1) {
    const local = localPartsInZone(candidate, timeZoneId);
    if (compareLocalDateTime(local, parts) >= 0) {
      return candidate;
    }
    candidate += 60_000;
  }

  return guess;
}

export function createPlainDate(year, month, day, zoneHint) {
  return { kind: "PlainDate", year, month, day, zoneHint };
}

export function createZonedDateTime(epochMs, timeZoneId) {
  return { kind: "ZonedDateTime", epochMs, zoneKind: "iana", timeZoneId };
}

export function createOffsetDateTime(epochMs, offsetMinutes) {
  return { kind: "ZonedDateTime", epochMs, zoneKind: "offset", offsetMinutes };
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year, month) {
  const monthIndex = month - 1;
  if (monthIndex < 0 || monthIndex > 11) {
    return 31;
  }
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return monthLengths[monthIndex];
}

export function isValidPlainDateParts(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }
  const dim = daysInMonth(year, month);
  return day >= 1 && day <= dim;
}

export function isValidTimeParts(hour, minute, second) {
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || !Number.isInteger(second)) {
    return false;
  }
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59;
}

export function plainDateToString(dateValue) {
  return `${pad4(dateValue.year)}-${pad2(dateValue.month)}-${pad2(dateValue.day)}`;
}

export function plainDateToEpochDay(dateValue) {
  return Math.floor(Date.UTC(dateValue.year, dateValue.month - 1, dateValue.day) / DAY_MS);
}

export function epochDayToPlainDate(epochDay, zoneHint) {
  const date = new Date(epochDay * DAY_MS);
  return createPlainDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), zoneHint);
}

export function comparePlainDate(a, b) {
  const x = plainDateToEpochDay(a);
  const y = plainDateToEpochDay(b);
  return x - y;
}

export function addPlainDateDays(dateValue, days) {
  const epochDay = plainDateToEpochDay(dateValue);
  return epochDayToPlainDate(epochDay + days, dateValue.zoneHint);
}

export function addPlainDateMonths(dateValue, months) {
  const totalMonths = dateValue.year * 12 + (dateValue.month - 1) + months;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = (totalMonths % 12 + 12) % 12 + 1;
  const clampedDay = Math.min(dateValue.day, daysInMonth(nextYear, nextMonth));
  return createPlainDate(nextYear, nextMonth, clampedDay, dateValue.zoneHint);
}

export function addPlainDateYears(dateValue, years) {
  const nextYear = dateValue.year + years;
  const clampedDay = Math.min(dateValue.day, daysInMonth(nextYear, dateValue.month));
  return createPlainDate(nextYear, dateValue.month, clampedDay, dateValue.zoneHint);
}

export function addPlainDateCalendar(dateValue, unit, amount) {
  switch (unit) {
    case "days":
      return addPlainDateDays(dateValue, amount);
    case "weeks":
      return addPlainDateDays(dateValue, amount * 7);
    case "months":
      return addPlainDateMonths(dateValue, amount);
    case "years":
      return addPlainDateYears(dateValue, amount);
    default:
      return dateValue;
  }
}

export function plainDateDayOfWeek(dateValue) {
  const day = new Date(Date.UTC(dateValue.year, dateValue.month - 1, dateValue.day)).getUTCDay();
  return day;
}

export function plainDateFromZoned(value, fallbackTimeZoneId) {
  if (value.zoneKind === "offset") {
    const parts = localPartsInFixedOffset(value.epochMs, value.offsetMinutes);
    return createPlainDate(parts.year, parts.month, parts.day);
  }
  const zone = value.timeZoneId || fallbackTimeZoneId;
  const parts = localPartsInZone(value.epochMs, zone);
  return createPlainDate(parts.year, parts.month, parts.day);
}

export function zonedDateTimeToLocalParts(value, fallbackTimeZoneId) {
  if (value.zoneKind === "offset") {
    return {
      ...localPartsInFixedOffset(value.epochMs, value.offsetMinutes),
      zoneKind: "offset",
      offsetMinutes: value.offsetMinutes,
    };
  }
  const zone = value.timeZoneId || fallbackTimeZoneId;
  return {
    ...localPartsInZone(value.epochMs, zone),
    zoneKind: "iana",
    timeZoneId: zone,
  };
}

export function zonedToIsoString(value, options = {}) {
  const includeMilliseconds = Boolean(options.includeMilliseconds);
  let parts;
  let offsetMinutes;

  if (value.zoneKind === "offset") {
    parts = localPartsInFixedOffset(value.epochMs, value.offsetMinutes);
    offsetMinutes = value.offsetMinutes;
  } else {
    parts = localPartsInZone(value.epochMs, value.timeZoneId);
    offsetMinutes = getOffsetMinutesForZone(value.epochMs, value.timeZoneId);
  }

  const datePart = `${pad4(parts.year)}-${pad2(parts.month)}-${pad2(parts.day)}`;
  const timePart = `${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(parts.second)}`;
  const fraction = includeMilliseconds || parts.millisecond !== 0 ? `.${pad3(parts.millisecond)}` : "";
  const offsetPart = formatOffsetMinutes(offsetMinutes);
  const zoneSuffix = value.zoneKind === "iana" ? `[${value.timeZoneId}]` : "";
  return `${datePart}T${timePart}${fraction}${offsetPart}${zoneSuffix}`;
}

export function parseIsoDateLiteral(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidPlainDateParts(year, month, day)) {
    return null;
  }
  return { year, month, day };
}

function parseOffsetText(offsetText) {
  if (!offsetText) {
    return null;
  }
  if (offsetText === "Z") {
    return 0;
  }
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offsetText);
  if (!match) {
    return null;
  }
  const sign = match[1] === "+" ? 1 : -1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

export function parseIsoTimestampLiteral(text) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?(\[([A-Za-z_][A-Za-z0-9_./+-]*)\])?$/.exec(
      text,
    );
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");
  const fractionRaw = match[8] ?? "0";
  const millisecond = Number(fractionRaw.padEnd(3, "0"));
  const offsetMinutes = parseOffsetText(match[9]);
  const bracketedZoneId = match[11] ?? null;

  if (!isValidPlainDateParts(year, month, day) || !isValidTimeParts(hour, minute, second)) {
    return null;
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
    offsetMinutes,
    bracketedZoneId,
  };
}

export function buildZonedFromTimestampParts(parts, contextTimeZoneId) {
  const local = {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
    millisecond: parts.millisecond,
  };

  if (parts.bracketedZoneId) {
    const zoneId = parts.bracketedZoneId;
    if (parts.offsetMinutes == null) {
      const epochMs = epochFromLocalPartsInZone(local, zoneId);
      return createZonedDateTime(epochMs, zoneId);
    }
    const epochMs = epochFromLocalPartsFixedOffset(local, parts.offsetMinutes);
    return createZonedDateTime(epochMs, zoneId);
  }

  if (parts.offsetMinutes != null) {
    const epochMs = epochFromLocalPartsFixedOffset(local, parts.offsetMinutes);
    return createOffsetDateTime(epochMs, parts.offsetMinutes);
  }

  const epochMs = epochFromLocalPartsInZone(local, contextTimeZoneId);
  return createZonedDateTime(epochMs, contextTimeZoneId);
}

export function addZonedCalendar(value, unit, amount, fallbackTimeZoneId) {
  const parts = zonedDateTimeToLocalParts(value, fallbackTimeZoneId);
  const date = createPlainDate(parts.year, parts.month, parts.day);
  const shiftedDate = addPlainDateCalendar(date, unit, amount);
  const nextLocal = {
    year: shiftedDate.year,
    month: shiftedDate.month,
    day: shiftedDate.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
    millisecond: parts.millisecond,
  };

  if (value.zoneKind === "offset") {
    return createOffsetDateTime(epochFromLocalPartsFixedOffset(nextLocal, value.offsetMinutes), value.offsetMinutes);
  }

  const zone = value.timeZoneId || fallbackTimeZoneId;
  return createZonedDateTime(epochFromLocalPartsInZone(nextLocal, zone), zone);
}

export function startOfDayForPlainDate(dateValue, timeZoneId) {
  const local = {
    year: dateValue.year,
    month: dateValue.month,
    day: dateValue.day,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };
  return createZonedDateTime(epochFromLocalPartsInZone(local, timeZoneId), timeZoneId);
}

export function startOfDayForZoned(value, fallbackTimeZoneId) {
  if (value.zoneKind === "offset") {
    const local = localPartsInFixedOffset(value.epochMs, value.offsetMinutes);
    local.hour = 0;
    local.minute = 0;
    local.second = 0;
    local.millisecond = 0;
    return createOffsetDateTime(epochFromLocalPartsFixedOffset(local, value.offsetMinutes), value.offsetMinutes);
  }

  const zone = value.timeZoneId || fallbackTimeZoneId;
  const local = localPartsInZone(value.epochMs, zone);
  local.hour = 0;
  local.minute = 0;
  local.second = 0;
  local.millisecond = 0;
  return createZonedDateTime(epochFromLocalPartsInZone(local, zone), zone);
}

export function addZonedTimeline(value, milliseconds) {
  if (value.zoneKind === "offset") {
    return createOffsetDateTime(value.epochMs + milliseconds, value.offsetMinutes);
  }
  return createZonedDateTime(value.epochMs + milliseconds, value.timeZoneId);
}
