import { describe, expect, test } from "bun:test";
import {
  foldCase,
  isBusinessDaysWord,
  isIdentifierPart,
  isIdentifierStart,
  isKeyword,
  isWhitespace,
  normalizeTokenSurface,
  normalizeUnitAlias,
  weekdayNameToIndex,
} from "../lib/keywords.js";

describe("keywords", () => {
  test("normalizes case and token surfaces", () => {
    expect(foldCase("Now")).toBe("now");
    expect(normalizeTokenSurface("Business Days")).toBe("businessdays");
    expect(isKeyword("TODAY", "today")).toBe(true);
  });

  test("normalizes unit aliases", () => {
    expect(normalizeUnitAlias("d")).toBe("days");
    expect(normalizeUnitAlias("weeks")).toBe("weeks");
    expect(normalizeUnitAlias("min")).toBe("minutes");
    expect(normalizeUnitAlias("business days")).toBe("businessDays");
    expect(normalizeUnitAlias("fortnights")).toBeNull();
  });

  test("detects business-day words and lexical characters", () => {
    expect(isBusinessDaysWord("businessDays")).toBe(true);
    expect(isIdentifierStart("_")).toBe(true);
    expect(isIdentifierStart("1")).toBe(false);
    expect(isIdentifierPart("/")).toBe(true);
    expect(isWhitespace("\n")).toBe(true);
  });

  test("maps weekday names", () => {
    expect(weekdayNameToIndex("SUNDAY")).toBe(0);
    expect(weekdayNameToIndex("Friday")).toBe(5);
    expect(weekdayNameToIndex("Funday")).toBeNull();
  });
});

