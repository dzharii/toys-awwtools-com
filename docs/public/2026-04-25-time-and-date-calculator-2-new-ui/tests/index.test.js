import { describe, expect, test } from "bun:test";
import {
  businessCalendarFromNagerHolidays,
  businessCalendarFromUnitedStatesFederalHolidays,
  createBusinessCalendar,
  createDefaultBusinessCalendar,
  createDefaultContext,
  createUnitedStatesHolidayCalendar,
  evaluateAst,
  evaluateExpression,
  formatValue,
  getValueType,
  parse,
  resolveWeekday,
  tokenize,
  validateIanaTimeZone,
  zonedToIsoString,
} from "../lib/index.js";

describe("index facade", () => {
  test("exports the core public API", () => {
    expect(typeof tokenize).toBe("function");
    expect(typeof parse).toBe("function");
    expect(typeof evaluateAst).toBe("function");
    expect(typeof evaluateExpression).toBe("function");
    expect(typeof formatValue).toBe("function");
    expect(typeof getValueType).toBe("function");
    expect(typeof createDefaultContext).toBe("function");
    expect(typeof createBusinessCalendar).toBe("function");
    expect(typeof createDefaultBusinessCalendar).toBe("function");
    expect(typeof businessCalendarFromNagerHolidays).toBe("function");
    expect(typeof businessCalendarFromUnitedStatesFederalHolidays).toBe("function");
    expect(typeof createUnitedStatesHolidayCalendar).toBe("function");
    expect(typeof resolveWeekday).toBe("function");
    expect(typeof validateIanaTimeZone).toBe("function");
    expect(typeof zonedToIsoString).toBe("function");
  });

  test("evaluateExpression returns formatted success with diagnostics", () => {
    const result = evaluateExpression("now + 1d", {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-02-08T12:00:00-08:00[America/Los_Angeles]",
    });

    expect(result.ok).toBe(true);
    expect(result.valueType).toBe("ZonedDateTime");
    expect(result.formatted).toBe("2026-02-09T12:00:00-08:00[America/Los_Angeles]");
    expect(result.diagnostics.tokens.at(-1).type).toBe("EOF");
  });

  test("evaluateExpression carries token diagnostics on parse failure", () => {
    const result = evaluateExpression("02/08/2026 + 1d");

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe("E_PARSE_INVALID_DATE_LITERAL");
    expect(result.diagnostics.tokens[0].type).toBe("INVALID_DATE_SLASH");
  });
});
