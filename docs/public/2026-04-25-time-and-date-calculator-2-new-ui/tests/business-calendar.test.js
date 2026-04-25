import { describe, expect, test } from "bun:test";
import {
  businessCalendarFromNagerHolidays,
  createBusinessCalendar,
  createDefaultBusinessCalendar,
  isBusinessDay,
} from "../lib/business-calendar.js";
import { createPlainDate } from "../lib/timezone.js";

describe("business-calendar", () => {
  test("default calendar treats Monday-Friday as business days", () => {
    const calendar = createDefaultBusinessCalendar();

    expect(isBusinessDay(createPlainDate(2026, 2, 6), "UTC", calendar)).toBe(true);
    expect(isBusinessDay(createPlainDate(2026, 2, 7), "UTC", calendar)).toBe(false);
    expect(isBusinessDay(createPlainDate(2026, 2, 8), "UTC", calendar)).toBe(false);
  });

  test("supports numeric and string weekend days plus holiday rows", () => {
    const calendar = createBusinessCalendar({
      weekendDays: [5, "SATURDAY"],
      holidays: ["2026-02-09", { date: "2026-02-10" }],
    });

    expect(isBusinessDay(createPlainDate(2026, 2, 6), "UTC", calendar)).toBe(false);
    expect(isBusinessDay(createPlainDate(2026, 2, 7), "UTC", calendar)).toBe(false);
    expect(isBusinessDay(createPlainDate(2026, 2, 9), "UTC", calendar)).toBe(false);
    expect(isBusinessDay(createPlainDate(2026, 2, 11), "UTC", calendar)).toBe(true);
  });

  test("falls back to Saturday/Sunday when weekend config is invalid", () => {
    const calendar = createBusinessCalendar({ weekendDays: ["noday", 9] });

    expect(isBusinessDay(createPlainDate(2026, 2, 6), "UTC", calendar)).toBe(true);
    expect(isBusinessDay(createPlainDate(2026, 2, 7), "UTC", calendar)).toBe(false);
  });

  test("custom predicate takes precedence", () => {
    const calendar = createBusinessCalendar({
      isBusinessDay: (date, zone) => date.day === 8 && zone === "UTC",
    });

    expect(isBusinessDay(createPlainDate(2026, 2, 8), "UTC", calendar)).toBe(true);
    expect(isBusinessDay(createPlainDate(2026, 2, 9), "UTC", calendar)).toBe(false);
  });

  test("Nager holiday adapter includes only public rows", () => {
    const calendar = businessCalendarFromNagerHolidays([
      { date: "2026-02-16", types: ["Public"] },
      { date: "2026-02-17", types: ["Observance"] },
      { date: "2026-02-18", types: ["Optional", "Public"] },
      { date: "2026-02-19", types: null },
    ]);

    expect(isBusinessDay(createPlainDate(2026, 2, 16), "UTC", calendar)).toBe(false);
    expect(isBusinessDay(createPlainDate(2026, 2, 17), "UTC", calendar)).toBe(true);
    expect(isBusinessDay(createPlainDate(2026, 2, 18), "UTC", calendar)).toBe(false);
    expect(isBusinessDay(createPlainDate(2026, 2, 19), "UTC", calendar)).toBe(true);
  });
});

