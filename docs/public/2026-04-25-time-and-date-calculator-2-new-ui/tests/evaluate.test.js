import { describe, expect, test } from "bun:test";
import { createBusinessCalendar } from "../lib/business-calendar.js";
import { evaluateAst } from "../lib/evaluate.js";
import { evaluateExpression, parse, tokenize } from "../lib/index.js";

const fixedContext = {
  timeZoneId: "America/Los_Angeles",
  now: () => "2026-02-08T12:00:00-08:00[America/Los_Angeles]",
};

describe("evaluate", () => {
  test("evaluates fixed now, date keywords, and anchors", () => {
    expect(evaluateExpression("now", fixedContext)).toMatchObject({
      ok: true,
      valueType: "ZonedDateTime",
      formatted: "2026-02-08T12:00:00-08:00[America/Los_Angeles]",
    });
    expect(evaluateExpression("today", fixedContext)).toMatchObject({ ok: true, valueType: "PlainDate", formatted: "2026-02-08" });
    expect(evaluateExpression("yesterday", fixedContext).formatted).toBe("2026-02-07");
    expect(evaluateExpression("tomorrow", fixedContext).formatted).toBe("2026-02-09");
    expect(evaluateExpression("start of day", fixedContext).formatted).toBe("2026-02-08T00:00:00-08:00[America/Los_Angeles]");
    expect(evaluateExpression("endOfDay(2026-02-08)", fixedContext).formatted).toBe("2026-02-08T23:59:59.999-08:00[America/Los_Angeles]");
    expect(evaluateExpression("end of day now", fixedContext).formatted).toBe("2026-02-08T23:59:59.999-08:00[America/Los_Angeles]");
    expect(evaluateExpression("start of day (2026-02-08 in America/New_York)", fixedContext).formatted).toBe(
      "2026-02-08T00:00:00-05:00[America/New_York]",
    );
  });

  test("evaluates calendar and timeline arithmetic across DST", () => {
    const context = {
      timeZoneId: "America/Los_Angeles",
      now: () => "2026-03-07T12:00:00-08:00[America/Los_Angeles]",
    };

    expect(evaluateExpression("now + 1 day", context).formatted).toBe("2026-03-08T12:00:00-07:00[America/Los_Angeles]");
    expect(evaluateExpression("now + 24 hours", context).formatted).toBe("2026-03-08T13:00:00-07:00[America/Los_Angeles]");
    expect(evaluateExpression("now - 2026-03-07T11:59:59-08:00", context).formatted).toBe("PT1S");
    expect(evaluateExpression("now - 2026-03-07T11:59:59.500-08:00", context).formatted).toBe("PT0.5S");
  });

  test("evaluates plain dates, comparisons, transforms, and numbers", () => {
    expect(evaluateExpression("2026-02-08 + 15 days", fixedContext).formatted).toBe("2026-02-23");
    expect(evaluateExpression("2026-02-08 - 2026-02-01", fixedContext).formatted).toBe("P7D");
    expect(evaluateExpression("today == 2026-02-08", fixedContext)).toMatchObject({ ok: true, valueType: "Boolean", formatted: "true" });
    expect(evaluateExpression("today < tomorrow", fixedContext).formatted).toBe("true");
    expect(evaluateExpression("tomorrow > today", fixedContext).formatted).toBe("true");
    expect(evaluateExpression("today <= today", fixedContext).formatted).toBe("true");
    expect(evaluateExpression("today >= today", fixedContext).formatted).toBe("true");
    expect(evaluateExpression("today != tomorrow", fixedContext).formatted).toBe("true");
    expect(evaluateExpression("1 + 2", fixedContext).formatted).toBe("3");
    expect(evaluateExpression("3 - 2", fixedContext).formatted).toBe("1");
    expect(evaluateExpression("now as date", fixedContext)).toMatchObject({ ok: true, valueType: "String", formatted: "2026-02-08" });
    expect(evaluateExpression("now -> time", fixedContext).formatted).toBe("12:00:00");
  });

  test("evaluates business-day shifting and counting with calendars", () => {
    const calendar = createBusinessCalendar({
      holidays: [{ date: "2026-02-16" }],
    });
    const context = { ...fixedContext, businessCalendar: calendar };

    expect(evaluateExpression("2026-02-13 + 1 business day", context).formatted).toBe("2026-02-17");
    expect(evaluateExpression("2026-02-17 - 1 business day", context).formatted).toBe("2026-02-13");
    expect(evaluateExpression("business days between 2026-02-13 and 2026-02-18", context)).toMatchObject({
      ok: true,
      valueType: "Number",
      formatted: "2",
    });
    expect(evaluateExpression("business days between 2026-02-18 and 2026-02-13", context).formatted).toBe("-2");
    expect(evaluateExpression("2026-02-13T12:00:00-08:00 + 1 business day", context)).toMatchObject({
      ok: true,
      valueType: "OffsetDateTime",
      formatted: "2026-02-17T12:00:00-08:00",
    });
  });

  test("resolves places when resolver is supplied", () => {
    const context = {
      ...fixedContext,
      placeResolver: (place) => ({ tzid: place === "Seattle" ? "America/Los_Angeles" : "America/New_York" }),
    };

    expect(evaluateExpression("now in Seattle", context).formatted).toBe("2026-02-08T12:00:00-08:00[America/Los_Angeles]");
    expect(evaluateExpression("now in London", context).formatted).toBe("2026-02-08T15:00:00-05:00[America/New_York]");
    expect(evaluateExpression("now in Portland", { ...fixedContext, placeResolver: () => ({ timeZoneId: "America/Los_Angeles" }) }).ok).toBe(true);
  });

  test("returns evaluation errors for invalid context and type mismatches", () => {
    expect(evaluateExpression("now", { timeZoneId: "Bad/Zone" }).error).toMatchObject({ code: "E_EVAL_INVALID_TIME_ZONE" });
    expect(evaluateExpression("now", { ...fixedContext, now: () => "not a timestamp" }).error).toMatchObject({
      code: "E_EVAL_INVALID_NOW",
    });
    expect(evaluateExpression("now", { ...fixedContext, now: () => ({ kind: "nope" }) }).error).toMatchObject({
      code: "E_EVAL_INVALID_NOW",
    });
    expect(evaluateExpression("now in Seattle", fixedContext).error).toMatchObject({ code: "E_EVAL_PLACE_RESOLVER_MISSING" });
    expect(evaluateExpression("now in Seattle", { ...fixedContext, placeResolver: () => { throw new Error("lookup failed"); } }).error).toMatchObject({
      code: "E_EVAL_PLACE_RESOLUTION_FAILED",
    });
    expect(evaluateExpression("now in Seattle", { ...fixedContext, placeResolver: () => "Bad/Zone" }).error).toMatchObject({
      code: "E_EVAL_PLACE_RESOLUTION_FAILED",
    });
    expect(evaluateExpression("2026-02-08 + 1 hour", fixedContext).error).toMatchObject({
      code: "E_EVAL_TIME_UNIT_REQUIRES_TIME",
    });
    expect(evaluateExpression("2026-02-08 as time", fixedContext).error).toMatchObject({
      code: "E_EVAL_TIME_FORMAT_REQUIRES_TIME",
    });
    expect(evaluateExpression("now as unknown", fixedContext).error).toMatchObject({ code: "E_EVAL_UNKNOWN_TRANSFORM" });
    expect(evaluateExpression("1 as date", fixedContext).error).toMatchObject({ code: "E_EVAL_TRANSFORM_FAILED" });
    expect(evaluateExpression("foo()", fixedContext).error).toMatchObject({ code: "E_EVAL_UNKNOWN_FUNCTION" });
    expect(evaluateExpression("2026-02-08T12:00[Bad/Zone]", fixedContext).error).toMatchObject({
      code: "E_EVAL_INVALID_TIME_ZONE",
    });
    expect(evaluateExpression("business days between 1 and 2", fixedContext).error).toMatchObject({
      code: "E_EVAL_TYPE_MISMATCH",
    });
    expect(evaluateExpression("1 == today", fixedContext).error).toMatchObject({ code: "E_EVAL_TYPE_MISMATCH" });
  });

  test("evaluateAst can run parsed AST directly", () => {
    const tokenized = tokenize("now + 1d");
    const parsed = parse(tokenized.tokens, "now + 1d");
    const result = evaluateAst(parsed.ast, fixedContext, "now + 1d");

    expect(result.ok).toBe(true);
    expect(result.formatted).toBe("2026-02-09T12:00:00-08:00[America/Los_Angeles]");
  });

  test("evaluateAst handles alternate now inputs and direct unsupported AST errors", () => {
    expect(evaluateAst({ type: "Keyword", name: "now", span: { startIndex: 0, endIndex: 3 } }, { ...fixedContext, now: new Date(0) }, "now")).toMatchObject({
      ok: true,
      formatted: "1969-12-31T16:00:00-08:00[America/Los_Angeles]",
    });
    expect(evaluateAst({ type: "Keyword", name: "now", span: { startIndex: 0, endIndex: 3 } }, { ...fixedContext, now: 0 }, "now")).toMatchObject({
      ok: true,
      formatted: "1969-12-31T16:00:00-08:00[America/Los_Angeles]",
    });
    expect(
      evaluateAst(
        { type: "Keyword", name: "now", span: { startIndex: 0, endIndex: 3 } },
        { ...fixedContext, now: { kind: "ZonedDateTime", epochMs: 0 } },
        "now",
      ),
    ).toMatchObject({ ok: true });
    expect(evaluateAst({ type: "Nope", span: { startIndex: 0, endIndex: 1 } }, fixedContext, "x").error).toMatchObject({
      code: "E_EVAL_UNSUPPORTED_NODE",
    });
    expect(evaluateAst({ type: "Keyword", name: "never", span: { startIndex: 0, endIndex: 5 } }, fixedContext, "never").error).toMatchObject({
      code: "E_EVAL_UNKNOWN_KEYWORD",
    });
  });
});
