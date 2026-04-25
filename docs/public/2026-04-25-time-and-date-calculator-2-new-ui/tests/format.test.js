import { describe, expect, test } from "bun:test";
import { formatDuration, formatValue, getValueType } from "../lib/format.js";
import { buildZonedFromTimestampParts, createPlainDate, createZonedDateTime, parseIsoTimestampLiteral } from "../lib/timezone.js";

describe("format", () => {
  test("formats primitive and date/time values", () => {
    const zoned = createZonedDateTime(Date.UTC(2026, 1, 8, 20, 0, 0), "America/Los_Angeles");
    const offset = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-02-08T12:00:00-08:00"), "UTC");

    expect(formatValue(createPlainDate(2026, 2, 8))).toBe("2026-02-08");
    expect(formatValue(zoned)).toBe("2026-02-08T12:00:00-08:00[America/Los_Angeles]");
    expect(formatValue(offset)).toBe("2026-02-08T12:00:00-08:00");
    expect(formatValue({ kind: "Duration", unit: "hours", amount: 2 })).toBe("PT2H");
    expect(formatValue(3)).toBe("3");
    expect(formatValue(true)).toBe("true");
  });

  test("applies supported transforms", () => {
    const zoned = createZonedDateTime(Date.UTC(2026, 1, 8, 20, 30, 15), "America/Los_Angeles");

    expect(formatValue(zoned, "iso", { timeZoneId: "America/Los_Angeles" })).toBe("2026-02-08T12:30:15-08:00[America/Los_Angeles]");
    expect(formatValue(createPlainDate(2026, 2, 8), "iso")).toBe("2026-02-08");
    expect(formatValue({ kind: "Duration", unit: "days", amount: 2 }, "iso")).toBe("P2D");
    expect(formatValue(3, "iso")).toBe("3");
    expect(formatValue(zoned, "date", { timeZoneId: "America/Los_Angeles" })).toBe("2026-02-08");
    expect(formatValue(createPlainDate(2026, 2, 8), "date")).toBe("2026-02-08");
    expect(formatValue(zoned, "time", { timeZoneId: "America/Los_Angeles" })).toBe("12:30:15");
    expect(formatValue({ kind: "Duration", unit: "seconds", amount: 90 }, "durationWords")).toBe("1 minute and 30 seconds");
    expect(formatValue({ kind: "Duration", unit: "seconds", amount: 93784 }, "duration")).toBe("1 day and 2 hours");
    expect(formatValue({ kind: "Duration", unit: "seconds", amount: 90 }, "compactDuration")).toBe("1m 30s");
    expect(formatValue(121, "ordinal")).toBe("121st");
    expect(formatValue(createPlainDate(2026, 2, 8), "ordinalDate")).toBe("February 8th, 2026");
    expect(formatValue(zoned, "clock", { timeZoneId: "America/Los_Angeles" })).toBe("half past twelve");
    expect(() => formatValue(1, "date")).toThrow("Date transform");
    expect(() => formatValue(createPlainDate(2026, 2, 8), "time")).toThrow("Time transform");
    expect(() => formatValue(1, "unknown")).toThrow("Unsupported transform");
  });

  test("reports offset date-times distinctly", () => {
    const zoned = createZonedDateTime(0, "UTC");
    const offset = buildZonedFromTimestampParts(parseIsoTimestampLiteral("2026-02-08T12:00:00-08:00"), "UTC");

    expect(getValueType(createPlainDate(2026, 2, 8))).toBe("PlainDate");
    expect(getValueType(zoned)).toBe("ZonedDateTime");
    expect(getValueType(offset)).toBe("OffsetDateTime");
    expect(getValueType({ kind: "Duration", unit: "days", amount: 1 })).toBe("Duration");
    expect(getValueType(1)).toBe("Number");
    expect(getValueType("x")).toBe("String");
    expect(getValueType(false)).toBe("Boolean");
    expect(getValueType({})).toBe("Unknown");
  });

  test("formats all produced duration units explicitly", () => {
    expect(formatDuration({ unit: "years", amount: 2 })).toBe("P2Y");
    expect(formatDuration({ unit: "months", amount: 3 })).toBe("P3M");
    expect(formatDuration({ unit: "weeks", amount: 4 })).toBe("P4W");
    expect(formatDuration({ unit: "days", amount: -5 })).toBe("-P5D");
    expect(formatDuration({ unit: "businessDays", amount: 6 })).toBe("P6BD");
    expect(formatDuration({ unit: "hours", amount: 7 })).toBe("PT7H");
    expect(formatDuration({ unit: "minutes", amount: 8 })).toBe("PT8M");
    expect(formatDuration({ unit: "seconds", amount: 9 })).toBe("PT9S");
    expect(formatDuration({ unit: "milliseconds", amount: 1250 })).toBe("PT1.25S");
    expect(() => formatDuration({ unit: "fortnights", amount: 1 })).toThrow("Unsupported duration unit");
  });
});
