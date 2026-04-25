import { describe, expect, test } from "bun:test";
import { tokenize } from "../lib/tokenize.js";

function tokenTypes(input) {
  return tokenize(input).tokens.map((token) => token.type);
}

describe("tokenize", () => {
  test("recognizes dates, timestamps, words, durations, comparisons, and transforms", () => {
    expect(tokenTypes("now + 1d -> date <= 2026-02-09")).toEqual([
      "WORD",
      "PLUS",
      "NUMBER",
      "WORD",
      "ARROW",
      "WORD",
      "LTE",
      "DATE",
      "EOF",
    ]);

    expect(tokenTypes("2026-02-08T12:30:15.123-08:00[America/Los_Angeles]")).toEqual(["TIMESTAMP", "EOF"]);
  });

  test("marks slash dates as a specific invalid date token", () => {
    const result = tokenize("02/08/2026 + 1d");

    expect(result.ok).toBe(true);
    expect(result.tokens[0]).toMatchObject({
      type: "INVALID_DATE_SLASH",
      text: "02/08/2026",
      start: 0,
      end: 10,
    });
  });

  test("case-folds word tokens", () => {
    const result = tokenize("Now In America/New_York");

    expect(result.tokens[0]).toMatchObject({ type: "WORD", text: "Now", canonical: "now" });
    expect(result.tokens[2]).toMatchObject({ type: "WORD", text: "America/New_York", canonical: "america/new_york" });
  });

  test("returns parse error for unexpected characters", () => {
    const result = tokenize("now @ UTC");

    expect(result.ok).toBe(false);
    expect(result.error).toMatchObject({
      kind: "parse",
      code: "E_PARSE_UNEXPECTED_CHARACTER",
      span: { startIndex: 4, endIndex: 5 },
    });
  });
});

