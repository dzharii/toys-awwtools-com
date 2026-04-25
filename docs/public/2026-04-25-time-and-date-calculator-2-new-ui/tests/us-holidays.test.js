import { describe, expect, test } from "bun:test";
import {
  businessCalendarFromUnitedStatesFederalHolidays,
  createBusinessCalendar,
  createUnitedStatesHolidayCalendar,
  evaluateExpression,
} from "../lib/index.js";

describe("US holidays and observances", () => {
  test("calculates federal holiday actual and observed dates", () => {
    const calendar = createUnitedStatesHolidayCalendar();

    expect(calendar.resolve("Thanksgiving", 2026).date).toMatchObject({ year: 2026, month: 11, day: 26 });
    expect(calendar.resolve("Memorial Day", 2026).date).toMatchObject({ year: 2026, month: 5, day: 25 });
    expect(calendar.resolve("Labor Day", 2026).date).toMatchObject({ year: 2026, month: 9, day: 7 });
    expect(calendar.resolve("Independence Day", 2026).date).toMatchObject({ year: 2026, month: 7, day: 3 });
    expect(calendar.resolve("Independence Day", 2026, "actual").date).toMatchObject({ year: 2026, month: 7, day: 4 });
    expect(calendar.resolve("Presidents Day", 2026).date).toMatchObject({ year: 2026, month: 2, day: 16 });
  });

  test("calculates common observances", () => {
    const calendar = createUnitedStatesHolidayCalendar();

    expect(calendar.resolve("Easter", 2026).date).toMatchObject({ year: 2026, month: 4, day: 5 });
    expect(calendar.resolve("Mother's Day", 2026).date).toMatchObject({ year: 2026, month: 5, day: 10 });
    expect(calendar.resolve("Father's Day", 2026).date).toMatchObject({ year: 2026, month: 6, day: 21 });
    expect(calendar.resolve("Halloween", 2026).date).toMatchObject({ year: 2026, month: 10, day: 31 });
    expect(calendar.resolve("Black Friday", 2026).date).toMatchObject({ year: 2026, month: 11, day: 27 });
    expect(calendar.resolve("Cyber Monday", 2026).date).toMatchObject({ year: 2026, month: 11, day: 30 });
    expect(calendar.resolve("Christmas Eve", 2026).date).toMatchObject({ year: 2026, month: 12, day: 24 });
    expect(calendar.resolve("New Year's Eve", 2026).date).toMatchObject({ year: 2026, month: 12, day: 31 });
  });

  test("evaluates holiday expressions and searches", () => {
    const context = {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-02-10T12:00:00-08:00[America/Los_Angeles]",
    };

    expect(evaluateExpression("Thanksgiving 2026", context).formatted).toBe("2026-11-26");
    expect(evaluateExpression("observed Independence Day 2026", context).formatted).toBe("2026-07-03");
    expect(evaluateExpression("actual Independence Day 2026", context).formatted).toBe("2026-07-04");
    expect(evaluateExpression("Presidents Day 2026", context).formatted).toBe("2026-02-16");
    expect(evaluateExpression("Easter 2026", context).formatted).toBe("2026-04-05");
    expect(evaluateExpression("Mother's Day 2026", context).formatted).toBe("2026-05-10");
    expect(evaluateExpression("Black Friday 2026", context).formatted).toBe("2026-11-27");
    expect(evaluateExpression("next holiday", context).formatted).toBe("2026-02-16");
    expect(evaluateExpression("next holiday", { ...context, now: () => "2026-02-16T12:00:00-08:00[America/Los_Angeles]" }).formatted).toBe("2026-05-25");
    expect(evaluateExpression("last holiday", { ...context, now: () => "2026-02-17T12:00:00-08:00[America/Los_Angeles]" }).formatted).toBe("2026-02-16");
    expect(evaluateExpression("next observance", context).formatted).toBe("2026-02-14");
    expect(evaluateExpression("Monday after Thanksgiving 2026", context).formatted).toBe("2026-11-30");
    expect(evaluateExpression("Friday before Memorial Day 2026", context).formatted).toBe("2026-05-22");
    expect(evaluateExpression("Monday after Easter 2026", context).formatted).toBe("2026-04-06");
    expect(evaluateExpression("Tuesday before Thanksgiving 2026", context).formatted).toBe("2026-11-24");
  });

  test("supports US federal holiday-aware business calendars", () => {
    const context = {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-02-10T12:00:00-08:00[America/Los_Angeles]",
      businessCalendar: businessCalendarFromUnitedStatesFederalHolidays([2026]),
    };

    expect(evaluateExpression("Memorial Day 2026 + 1 business day", context).formatted).toBe("2026-05-26");
    expect(evaluateExpression("Thanksgiving 2026 + 1 business day", context).formatted).toBe("2026-11-27");
    expect(evaluateExpression("first business day after Thanksgiving 2026", context).formatted).toBe("2026-11-27");
    expect(evaluateExpression("last business day before Christmas 2026", context).formatted).toBe("2026-12-24");

    const withBlackFridayClosure = {
      ...context,
      businessCalendar: createBusinessCalendar({
        holidays: [...context.businessCalendar.holidays, "2026-11-27"],
      }),
    };
    expect(evaluateExpression("first business day after Thanksgiving 2026", withBlackFridayClosure).formatted).toBe("2026-11-30");
  });

  test("reports missing holiday providers when explicitly disabled", () => {
    const context = {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-02-10T12:00:00-08:00[America/Los_Angeles]",
      holidayCalendar: null,
      observanceCalendar: null,
    };

    expect(evaluateExpression("Thanksgiving 2026", context).error).toMatchObject({ code: "E_EVAL_HOLIDAY_CALENDAR_MISSING" });
    expect(evaluateExpression("next observance", context).error).toMatchObject({ code: "E_EVAL_OBSERVANCE_CALENDAR_MISSING" });
  });
});
