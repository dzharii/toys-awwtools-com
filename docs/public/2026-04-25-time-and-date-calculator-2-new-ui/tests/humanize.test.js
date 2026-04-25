import { describe, expect, test } from "bun:test";
import { formatCompactDuration, formatDurationWords, formatUnitCount, joinEnglishList, monthName, ordinal } from "../lib/humanize.js";

describe("humanize", () => {
  test("pluralizes English unit labels", () => {
    expect(formatUnitCount(1, "days")).toBe("1 day");
    expect(formatUnitCount(2, "days")).toBe("2 days");
    expect(formatUnitCount(1, "businessDays")).toBe("1 business day");
    expect(formatUnitCount(3, "businessDays")).toBe("3 business days");
  });

  test("joins English lists without Oxford comma", () => {
    expect(joinEnglishList([])).toBe("");
    expect(joinEnglishList(["seconds"])).toBe("seconds");
    expect(joinEnglishList(["minutes", "seconds"])).toBe("minutes and seconds");
    expect(joinEnglishList(["days", "hours", "minutes"])).toBe("days, hours and minutes");
  });

  test("formats ordinals and month names", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 111, 121].map(ordinal)).toEqual([
      "1st",
      "2nd",
      "3rd",
      "4th",
      "11th",
      "12th",
      "13th",
      "21st",
      "111th",
      "121st",
    ]);
    expect(monthName(1)).toBe("January");
    expect(monthName(12)).toBe("December");
  });

  test("formats duration words and compact durations", () => {
    expect(formatDurationWords({ kind: "Duration", unit: "seconds", amount: 90 })).toBe("1 minute and 30 seconds");
    expect(formatDurationWords({ kind: "Duration", unit: "seconds", amount: 93784 })).toBe("1 day, 2 hours, 3 minutes and 4 seconds");
    expect(formatDurationWords({ kind: "Duration", unit: "seconds", amount: -90 })).toBe("-1 minute and 30 seconds");
    expect(formatCompactDuration({ kind: "Duration", unit: "seconds", amount: 90 })).toBe("1m 30s");
  });
});
