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
    expect(parseExpression("banana").error).toMatchObject({ code: "E_PARSE_UNEXPECTED_TOKEN" });
    expect(parseExpression("1fortnight").error).toMatchObject({ code: "E_PARSE_UNKNOWN_UNIT" });
    expect(parseExpression("1 fortnight").error).toMatchObject({ code: "E_PARSE_UNKNOWN_UNIT" });
    expect(parseExpression("business days between 2026-02-08 2026-02-23").error).toMatchObject({
      code: "E_PARSE_EXPECTED_AND",
    });
  });
});
