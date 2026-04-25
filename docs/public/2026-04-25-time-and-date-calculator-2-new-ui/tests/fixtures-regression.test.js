import { describe, expect, test } from "bun:test";
import { evaluateExpression } from "../lib/index.js";
import { readJson } from "./helpers.js";

const expressionFixtures = readJson("reference_data/datecalc_reference_data/expression_fixtures.sample.json");
const dstFixtures = readJson("reference_data/datecalc_reference_data/dst_fixtures_la_2026.sample.json");

describe("fixture regression suite", () => {
  test("expression fixtures remain stable", () => {
    // Regression failures are signals that observable core functionality changed.
    // Investigate each failure: fix accidental regressions, or update fixtures deliberately
    // when a required breaking behavior change is intentional and documented.
    const context = {
      timeZoneId: expressionFixtures.context.timeZoneId,
      now: () => expressionFixtures.context.now,
    };

    for (const fixture of expressionFixtures.tests) {
      const result = evaluateExpression(fixture.expr, context);
      if (fixture.type.includes("Error")) {
        expect(result.ok, fixture.expr).toBe(false);
        expect(result.error.code, fixture.expr).toBe(fixture.expectedCode);
      } else {
        expect(result.ok, fixture.expr).toBe(true);
        expect(result.valueType, fixture.expr).toBe(fixture.type);
        expect(result.formatted, fixture.expr).toBe(String(fixture.expected));
      }
    }
  });

  test("DST fixtures distinguish calendar and timeline arithmetic", () => {
    for (const fixture of dstFixtures.cases) {
      const result = evaluateExpression(fixture.input, {
        timeZoneId: dstFixtures.contextZone,
        now: () => "2026-03-07T12:00:00-08:00[America/Los_Angeles]",
      });

      expect(result.ok, fixture.name).toBe(true);
      expect(result.formatted, fixture.name).toBe(fixture.expectedZonedDateTime);
    }
  });
});

