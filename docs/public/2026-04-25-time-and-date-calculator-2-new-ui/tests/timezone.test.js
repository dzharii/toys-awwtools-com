import { describe, expect, test } from "bun:test";
import {
  addPlainDateCalendar,
  addPlainDateDays,
  addZonedCalendar,
  addZonedTimeline,
  buildZonedFromTimestampParts,
  comparePlainDate,
  createPlainDate,
  createZonedDateTime,
  daysInMonth,
  epochDayToPlainDate,
  epochFromLocalPartsFixedOffset,
  epochFromLocalPartsInZone,
  formatOffsetMinutes,
  getOffsetMinutesForZone,
  getRuntimeTimeZone,
  isLeapYear,
  isValidPlainDateParts,
  isValidTimeParts,
  localPartsInFixedOffset,
  localPartsInZone,
  parseIsoDateLiteral,
  parseIsoTimestampLiteral,
  plainDateFromZoned,
  plainDateToEpochDay,
  plainDateToString,
  startOfDayForPlainDate,
  startOfDayForZoned,
  validateIanaTimeZone,
  zonedDateTimeToLocalParts,
  zonedToIsoString,
} from "../lib/timezone.js";

describe("timezone", () => {
  test("validates IANA zones and formats offsets", () => {
    expect(typeof getRuntimeTimeZone()).toBe("string");
    expect(validateIanaTimeZone("America/Los_Angeles")).toBe(true);
    expect(validateIanaTimeZone("No/Such_Zone")).toBe(false);
    expect(formatOffsetMinutes(-480)).toBe("-08:00");
    expect(formatOffsetMinutes(330)).toBe("+05:30");
  });

  test("parses ISO date and timestamp literals", () => {
    expect(parseIsoDateLiteral("2026-02-08")).toEqual({ year: 2026, month: 2, day: 8 });
    expect(parseIsoDateLiteral("2026-02-31")).toBeNull();
    expect(parseIsoDateLiteral("not-date")).toBeNull();
    expect(parseIsoTimestampLiteral("2026-02-08T12:30:15.1-08:00[America/Los_Angeles]")).toMatchObject({
      year: 2026,
      month: 2,
      day: 8,
      hour: 12,
      minute: 30,
      second: 15,
      millisecond: 100,
      offsetMinutes: -480,
      bracketedZoneId: "America/Los_Angeles",
    });
    expect(parseIsoTimestampLiteral("2026-02-08T12:30Z")).toMatchObject({ offsetMinutes: 0 });
    expect(parseIsoTimestampLiteral("not-timestamp")).toBeNull();
    expect(parseIsoTimestampLiteral("2026-02-08T25:00")).toBeNull();
  });

  test("validates and shifts plain dates", () => {
    const date = createPlainDate(2024, 2, 29, "UTC");

    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2024, 13)).toBe(31);
    expect(isValidPlainDateParts(2026, 2, 29)).toBe(false);
    expect(isValidPlainDateParts(2026.5, 2, 1)).toBe(false);
    expect(isValidPlainDateParts(2026, 13, 1)).toBe(false);
    expect(isValidTimeParts(23, 59, 59)).toBe(true);
    expect(isValidTimeParts(24, 0, 0)).toBe(false);
    expect(isValidTimeParts(1.5, 0, 0)).toBe(false);
    expect(plainDateToString(date)).toBe("2024-02-29");
    expect(epochDayToPlainDate(plainDateToEpochDay(date), "UTC")).toEqual(date);
    expect(plainDateToString(addPlainDateDays(date, 1))).toBe("2024-03-01");
    expect(plainDateToString(addPlainDateCalendar(createPlainDate(2026, 1, 31), "months", 1))).toBe("2026-02-28");
    expect(plainDateToString(addPlainDateCalendar(createPlainDate(2024, 2, 29), "years", 1))).toBe("2025-02-28");
    expect(plainDateToString(addPlainDateCalendar(createPlainDate(2026, 2, 8), "weeks", 1))).toBe("2026-02-15");
    expect(addPlainDateCalendar(createPlainDate(2026, 2, 8), "unknown", 1)).toEqual(createPlainDate(2026, 2, 8));
    expect(comparePlainDate(createPlainDate(2026, 2, 8), createPlainDate(2026, 2, 9))).toBeLessThan(0);
  });

  test("converts fixed-offset and IANA local parts", () => {
    const offsetEpoch = epochFromLocalPartsFixedOffset({ year: 2026, month: 2, day: 8, hour: 12, minute: 0 }, -480);
    const zonedEpoch = epochFromLocalPartsInZone({ year: 2026, month: 2, day: 8, hour: 12, minute: 0 }, "America/Los_Angeles");

    expect(localPartsInFixedOffset(offsetEpoch, -480)).toMatchObject({ year: 2026, month: 2, day: 8, hour: 12 });
    expect(localPartsInZone(zonedEpoch, "America/Los_Angeles")).toMatchObject({ year: 2026, month: 2, day: 8, hour: 12 });
    expect(getOffsetMinutesForZone(zonedEpoch, "America/Los_Angeles")).toBe(-480);
  });

  test("builds and formats zoned and offset date-times", () => {
    const iana = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-02-08T12:00:00[America/Los_Angeles]"), "UTC");
    const offset = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-02-08T12:00:00-08:00"), "UTC");
    const offsetWithZone = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-02-08T12:00:00-08:00[America/Los_Angeles]"), "UTC");
    const contextZone = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-02-08T12:00:00"), "America/New_York");

    expect(zonedToIsoString(iana)).toBe("2026-02-08T12:00:00-08:00[America/Los_Angeles]");
    expect(zonedToIsoString(offset)).toBe("2026-02-08T12:00:00-08:00");
    expect(zonedToIsoString(offsetWithZone)).toBe("2026-02-08T12:00:00-08:00[America/Los_Angeles]");
    expect(zonedToIsoString(contextZone)).toBe("2026-02-08T12:00:00-05:00[America/New_York]");
    expect(plainDateFromZoned(iana, "UTC")).toEqual(createPlainDate(2026, 2, 8));
    expect(plainDateFromZoned(offset, "UTC")).toEqual(createPlainDate(2026, 2, 8));
    expect(zonedDateTimeToLocalParts(offset, "UTC")).toMatchObject({ zoneKind: "offset", offsetMinutes: -480, hour: 12 });
  });

  test("handles starts of day and DST calendar versus timeline arithmetic", () => {
    const noonBeforeDst = createZonedDateTime(Date.UTC(2026, 2, 7, 20, 0, 0), "America/Los_Angeles");
    const offsetNoon = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-03-07T12:00:00-08:00"), "UTC");

    expect(zonedToIsoString(startOfDayForPlainDate(createPlainDate(2026, 3, 8), "America/Los_Angeles"))).toBe(
      "2026-03-08T00:00:00-08:00[America/Los_Angeles]",
    );
    expect(zonedToIsoString(startOfDayForZoned(noonBeforeDst, "America/Los_Angeles"))).toBe(
      "2026-03-07T00:00:00-08:00[America/Los_Angeles]",
    );
    expect(zonedToIsoString(addZonedCalendar(noonBeforeDst, "days", 1, "America/Los_Angeles"))).toBe(
      "2026-03-08T12:00:00-07:00[America/Los_Angeles]",
    );
    expect(zonedToIsoString(addZonedTimeline(noonBeforeDst, 24 * 60 * 60 * 1000))).toBe(
      "2026-03-08T13:00:00-07:00[America/Los_Angeles]",
    );
    expect(zonedToIsoString(startOfDayForZoned(offsetNoon, "UTC"))).toBe("2026-03-07T00:00:00-08:00");
    expect(zonedToIsoString(addZonedCalendar(offsetNoon, "days", 1, "UTC"))).toBe("2026-03-08T12:00:00-08:00");
    expect(zonedToIsoString(addZonedTimeline(offsetNoon, 60_000))).toBe("2026-03-07T12:01:00-08:00");
  });
});
