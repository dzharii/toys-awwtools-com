import { describe, expect, test } from "bun:test";
import { createEvaluationError, createParseError, normalizeSpan, spanToLineColumn } from "../lib/errors.js";

describe("errors", () => {
  test("normalizes missing and out-of-range spans", () => {
    expect(normalizeSpan(null, 5)).toEqual({ startIndex: 0, endIndex: 0 });
    expect(normalizeSpan({ startIndex: -10, endIndex: 20 }, 5)).toEqual({ startIndex: 0, endIndex: 5 });
    expect(normalizeSpan({ startIndex: 4, endIndex: 1 }, 5)).toEqual({ startIndex: 4, endIndex: 4 });
  });

  test("maps spans to one-based line and column positions", () => {
    expect(spanToLineColumn("one\ntwo\nthree", { startIndex: 4, endIndex: 7 })).toEqual({
      startLine: 2,
      startColumn: 1,
      endLine: 2,
      endColumn: 4,
    });
  });

  test("builds parse and evaluation errors with optional hints", () => {
    const parseError = createParseError("now\nbad", "E_PARSE_TEST", "Parse failed.", { startIndex: 4, endIndex: 7 }, ["hint"]);
    const evalError = createEvaluationError("now", "E_EVAL_TEST", "Eval failed.", { startIndex: 0, endIndex: 3 });

    expect(parseError).toMatchObject({
      kind: "parse",
      code: "E_PARSE_TEST",
      message: "Parse failed.",
      hints: ["hint"],
      lineColumn: { startLine: 2, startColumn: 1, endLine: 2, endColumn: 4 },
    });
    expect(evalError.hints).toBeUndefined();
    expect(evalError.kind).toBe("eval");
  });
});

