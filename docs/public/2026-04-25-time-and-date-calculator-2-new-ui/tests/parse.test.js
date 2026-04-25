import { describe, expect, test } from "bun:test";
import { parse } from "../lib/parse.js";
import { tokenize } from "../lib/tokenize.js";

function parseExpression(input) {
  const tokenized = tokenize(input);
  expect(tokenized.ok).toBe(true);
  return parse(tokenized.tokens, input);
}

describe("parse", () => {
  test("parses keywords, dates, timestamps, numbers, and durations", () => {
    expect(parseExpression("now").ast).toMatchObject({ type: "Keyword", name: "now" });
    expect(parseExpression("today").ast).toMatchObject({ type: "Keyword", name: "today" });
    expect(parseExpression("2026-02-08").ast).toMatchObject({ type: "PlainDateLiteral", value: "2026-02-08" });
    expect(parseExpression("2026-02-08T12:00:00-08:00").ast).toMatchObject({ type: "TimestampLiteral" });
    expect(parseExpression("10 business days").ast).toMatchObject({ type: "DurationLiteral", unit: "businessDays", amount: 10 });
  });

  test("parses arithmetic, comparisons, groups, anchors, functions, and transforms", () => {
    expect(parseExpression("now + 1d").ast).toMatchObject({ type: "BinaryExpression", operator: "+" });
    expect(parseExpression("(now + 1d) in America/New_York").ast).toMatchObject({
      type: "InModifier",
      zoneOrPlace: "America/New_York",
      target: { type: "GroupExpression" },
    });
    expect(parseExpression("now in Etc/GMT+5").ast).toMatchObject({
      type: "InModifier",
      zoneOrPlace: "Etc/GMT+5",
    });
    expect(parseExpression("now as date").ast).toMatchObject({ type: "TransformModifier", transformName: "date", operator: "as" });
    expect(parseExpression("now -> time").ast).toMatchObject({ type: "TransformModifier", transformName: "time", operator: "->" });
    expect(parseExpression("now as relative").ast).toMatchObject({ type: "TransformModifier", transformName: "relative" });
    expect(parseExpression("90 seconds as duration words").ast).toMatchObject({ type: "TransformModifier", transformName: "durationWords" });
    expect(parseExpression("90 seconds as compact duration").ast).toMatchObject({ type: "TransformModifier", transformName: "compactDuration" });
    expect(parseExpression("2026-02-08 as ordinal date").ast).toMatchObject({
      type: "TransformModifier",
      transformName: "ordinalDate",
      transformSpan: { startIndex: 14, endIndex: 26 },
    });
    expect(parseExpression("now AS Duration Words").ast).toMatchObject({ type: "TransformModifier", transformName: "durationWords" });
    expect(parseExpression("end of day 2026-02-08").ast).toMatchObject({ type: "AnchorExpression", anchorName: "endOfDay" });
    expect(parseExpression("start of day 2026-02-08").ast).toMatchObject({ type: "AnchorExpression", anchorName: "startOfDay" });
    expect(parseExpression("startOfDay(now, today)").ast).toMatchObject({ type: "FunctionCall", canonicalName: "startofday", args: [{}, {}] });
    expect(parseExpression("today == 2026-02-08").ast).toMatchObject({ type: "ComparisonExpression", operator: "==" });
    expect(parseExpression("today < tomorrow").ast).toMatchObject({ type: "ComparisonExpression", operator: "<" });
    expect(parseExpression("today > yesterday").ast).toMatchObject({ type: "ComparisonExpression", operator: ">" });
    expect(parseExpression("today >= yesterday").ast).toMatchObject({ type: "ComparisonExpression", operator: ">=" });
    expect(parseExpression("today != tomorrow").ast).toMatchObject({ type: "ComparisonExpression", operator: "!=" });
  });

  test("parses business-day range", () => {
    const result = parseExpression("business days between 2026-02-08 and 2026-02-23");

    expect(result.ok).toBe(true);
    expect(result.ast).toMatchObject({
      type: "BusinessDaysBetween",
      start: { type: "PlainDateLiteral", value: "2026-02-08" },
      end: { type: "PlainDateLiteral", value: "2026-02-23" },
    });
  });

  test("parses weekday expressions", () => {
    expect(parseExpression("Monday").ast).toMatchObject({ type: "WeekdayExpression", weekdayName: "monday", direction: "bare" });
    expect(parseExpression("next Tuesday").ast).toMatchObject({ type: "WeekdayExpression", weekdayName: "tuesday", direction: "next" });
    expect(parseExpression("last Friday").ast).toMatchObject({ type: "WeekdayExpression", weekdayName: "friday", direction: "last" });
    expect(parseExpression("this Wednesday").ast).toMatchObject({ type: "WeekdayExpression", weekdayName: "wednesday", direction: "this" });
  });

  test("parses holiday expressions", () => {
    expect(parseExpression("Thanksgiving 2026").ast).toMatchObject({ type: "HolidayExpression", holidayName: "thanksgiving", year: { value: 2026 } });
    expect(parseExpression("actual Independence Day 2026").ast).toMatchObject({ type: "HolidayExpression", mode: "actual" });
    expect(parseExpression("observed Independence Day 2026").ast).toMatchObject({ type: "HolidayExpression", mode: "observed" });
    expect(parseExpression("next holiday").ast).toMatchObject({ type: "HolidaySearchExpression", direction: "next", category: "federal" });
    expect(parseExpression("last holiday").ast).toMatchObject({ type: "HolidaySearchExpression", direction: "last", category: "federal" });
    expect(parseExpression("next observance").ast).toMatchObject({ type: "HolidaySearchExpression", direction: "next", category: "observance" });
    expect(parseExpression("Monday after Thanksgiving 2026").ast).toMatchObject({
      type: "WeekdayRelativeExpression",
      weekdayName: "monday",
      relation: "after",
      target: { type: "HolidayExpression" },
    });
    expect(parseExpression("first business day after Thanksgiving 2026").ast).toMatchObject({
      type: "BusinessDayRelativeExpression",
      selector: "first",
      relation: "after",
      target: { type: "HolidayExpression" },
    });
  });

  test("documents postfix binding for in modifier after duration literal", () => {
    const result = parseExpression("now + 1d in America/New_York");

    expect(result.ok).toBe(true);
    expect(result.ast).toMatchObject({
      type: "BinaryExpression",
      right: { type: "InModifier", target: { type: "DurationLiteral" } },
    });
  });

  test("returns useful parse errors", () => {
    expect(parseExpression("").error).toMatchObject({ code: "E_PARSE_EXPECTED_EXPRESSION" });
    expect(parseExpression("now +").error).toMatchObject({ code: "E_PARSE_EXPECTED_EXPRESSION" });
    expect(parseExpression("(now").error).toMatchObject({ code: "E_PARSE_EXPECTED_RPAREN" });
    expect(parseExpression("now today").error).toMatchObject({ code: "E_PARSE_UNEXPECTED_TOKEN" });
    expect(parseExpression("02/08/2026 + 1d").error).toMatchObject({ code: "E_PARSE_INVALID_DATE_LITERAL" });
    expect(parseExpression("2026-02-31").error).toMatchObject({ code: "E_PARSE_INVALID_DATE_LITERAL" });
    expect(parseExpression("2026-02-08T25:00").error).toMatchObject({ code: "E_PARSE_INVALID_TIMESTAMP_LITERAL" });
    expect(parseExpression("now in").error).toMatchObject({ code: "E_PARSE_EXPECTED_ZONE_OR_PLACE" });
    expect(parseExpression("now ->").error).toMatchObject({ code: "E_PARSE_EXPECTED_TRANSFORM" });
    expect(parseExpression("now as banana mode").error).toMatchObject({ code: "E_PARSE_UNKNOWN_TRANSFORM" });
    expect(parseExpression("banana").error).toMatchObject({ code: "E_PARSE_UNEXPECTED_TOKEN" });
    expect(parseExpression("1fortnight").error).toMatchObject({ code: "E_PARSE_UNKNOWN_UNIT" });
    expect(parseExpression("1 fortnight").error).toMatchObject({ code: "E_PARSE_UNKNOWN_UNIT" });
    expect(parseExpression("business days between 2026-02-08 2026-02-23").error).toMatchObject({
      code: "E_PARSE_EXPECTED_AND",
    });
  });
});
