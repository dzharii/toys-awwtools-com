import { describe, expect, test } from "bun:test";
import { evaluateExpression, resolveWeekday } from "../lib/index.js";
import { createPlainDate } from "../lib/timezone.js";

describe("weekday", () => {
  test("resolves strict and inclusive weekday directions", () => {
    const tuesday = createPlainDate(2026, 2, 10);
    expect(resolveWeekday(tuesday, "tuesday", "bare")).toEqual(createPlainDate(2026, 2, 17));
    expect(resolveWeekday(tuesday, "wednesday", "bare")).toEqual(createPlainDate(2026, 2, 11));
    expect(resolveWeekday(tuesday, "tuesday", "next")).toEqual(createPlainDate(2026, 2, 17));
    expect(resolveWeekday(tuesday, "tuesday", "last")).toEqual(createPlainDate(2026, 2, 3));
    expect(resolveWeekday(tuesday, "tuesday", "this")).toEqual(createPlainDate(2026, 2, 10));
  });

  test("evaluates weekday expressions against context date", () => {
    const context = {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-02-10T12:00:00-08:00[America/Los_Angeles]",
    };

    expect(evaluateExpression("Tuesday", context).formatted).toBe("2026-02-17");
    expect(evaluateExpression("Wednesday", context).formatted).toBe("2026-02-11");
    expect(evaluateExpression("next Tuesday", context).formatted).toBe("2026-02-17");
    expect(evaluateExpression("last Tuesday", context).formatted).toBe("2026-02-03");
    expect(evaluateExpression("this Tuesday", context).formatted).toBe("2026-02-10");
  });

  test("weekday expressions compose with existing language", () => {
    const context = {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-02-10T12:00:00-08:00[America/Los_Angeles]",
    };

    expect(evaluateExpression("Monday + 2 days", context).formatted).toBe("2026-02-18");
    expect(evaluateExpression("Wednesday + 1 business day", context).formatted).toBe("2026-02-12");
    expect(evaluateExpression("business days between today and Friday", context).formatted).toBe("3");
    expect(evaluateExpression("start of day Monday", context).formatted).toBe("2026-02-16T00:00:00-08:00[America/Los_Angeles]");
  });
});
