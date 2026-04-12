import { describe, expect, test } from "bun:test";
import { createObjectModel } from "../../src/heuristics.js";
import { analyzeAreaSelection } from "../../src/regions.js";
import { scanDocument } from "../../src/scanner.js";
import { rectFrom } from "../../src/utils.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "RI01",
    title: "Tight drag on send button stays local",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid" },
    rectAlias: "sendButton",
    expect: { includesKind: "control", excludesFeatureId: "composer" },
  },
  {
    id: "RI02",
    title: "Single nav-row drag avoids whole nav container",
    fixture: "shell",
    mutate: { nav: true, toolbar: true },
    rectAlias: "firstNavLink",
    expect: { includesKind: "control", excludesFeatureId: "main-nav" },
  },
  {
    id: "RI03",
    title: "Intentional transcript panel drag can select region",
    fixture: "chat",
    mutate: { transcriptScrollable: true, repeatCount: 6 },
    rectAlias: "transcript",
    expect: { includesFeatureId: "transcript" },
  },
  {
    id: "RI04",
    title: "Wide wrapper text drag prefers local text footprint",
    fixture: "shell",
    mutate: { wideSummaryWrapper: true, nav: false, toolbar: false },
    rectAlias: "wideSummaryText",
    expect: { includesFeatureId: "wide-summary-text", excludesFeatureId: "wide-summary" },
  },
  {
    id: "RI05",
    title: "Tiny edge overlap is rejected",
    fixture: "shell",
    mutate: { nav: true, toolbar: true },
    rect: { left: 270, top: 95, width: 8, height: 8 },
    expect: { maxCount: 0 },
  },
];

function buildAreaRecords() {
  return scanDocument(document).map((record) => ({
    ...createObjectModel({
      element: record.element,
      features: record.features,
      context: { fromAreaSelection: true },
      existingNames: [],
    }),
    element: record.element,
  }));
}

function runCase(row) {
  const { aliases } = buildFixture(row.fixture, row.mutate);
  const areaRect = row.rectAlias
    ? rectFrom(aliases[row.rectAlias].getBoundingClientRect())
    : rectFrom(row.rect);
  const results = analyzeAreaSelection(buildAreaRecords(), areaRect);
  return { results };
}

function assertCase(actual, expected) {
  if (expected.includesKind) {
    expect(actual.results.some((item) => item.kind === expected.includesKind)).toBe(true);
  }
  if (expected.includesFeatureId) {
    expect(actual.results.some((item) => item.features?.id === expected.includesFeatureId)).toBe(true);
  }
  if (expected.excludesFeatureId) {
    expect(actual.results.some((item) => item.features?.id === expected.excludesFeatureId)).toBe(false);
  }
  if (typeof expected.maxCount === "number") {
    expect(actual.results.length).toBeLessThanOrEqual(expected.maxCount);
  }
}

describe("regions intent matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, () => {
      const actual = runCase(row);
      assertCase(actual, row.expect);
    });
  }
});
