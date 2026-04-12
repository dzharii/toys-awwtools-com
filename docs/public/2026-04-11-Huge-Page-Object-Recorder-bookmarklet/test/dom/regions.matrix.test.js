import { describe, expect, test } from "bun:test";
import { createObjectModel } from "../../src/heuristics.js";
import { analyzeAreaSelection } from "../../src/regions.js";
import { scanDocument } from "../../src/scanner.js";
import { rectFrom } from "../../src/utils.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "RG01",
    title: "Selection over composer returns region plus child controls",
    description:
      "Area over composer should surface a strong region with child controls and assign parent linkage.",
    fixture: "chat",
    mutate: {},
    rectAlias: "composer",
    expect: { includesKinds: ["region", "control"], parentAssignedToControls: true },
  },
  {
    id: "RG02",
    title: "Selection over transcript detects repeated collection",
    description:
      "Area over repeated transcript items should surface a collection candidate with sufficient sample count.",
    fixture: "chat",
    mutate: { repeatCount: 6, transcriptScrollable: true },
    rectAlias: "transcript",
    expect: { includesKind: "collection", collectionSampleCountMin: 3 },
  },
  {
    id: "RG03",
    title: "Partial overlap still favors strong region",
    description:
      "Partial overlap that intersects both a region and weaker content should still rank the region first.",
    fixture: "shell",
    mutate: { nav: true, toolbar: true },
    rect: { left: 250, top: 96, width: 360, height: 160 },
    expect: { topResultKind: "region" },
  },
  {
    id: "RG04",
    title: "Nested dialog regions choose nearest parent",
    description:
      "Modal with nested footer region should parent controls to the nearest containing region when both are selected.",
    fixture: "dialog",
    mutate: { includeFooterRegion: true },
    rectAlias: "footerRegion",
    expect: { nearestNestedRegion: true },
  },
  {
    id: "RG05",
    title: "Crowded selection is capped to top eight",
    description:
      "Dense noisy overlap should return only the top-ranked subset and keep high-signal nodes.",
    fixture: "noise",
    mutate: { overlappingCount: 14 },
    rect: { left: 380, top: 100, width: 260, height: 180 },
    expect: { resultCount: 8 },
  },
  {
    id: "RG06",
    title: "Mixed repeated shapes do not over-merge",
    description:
      "Repeated cards with nearby non-matching promo blocks should produce a main collection without merging mismatched shapes.",
    fixture: "collection",
    mutate: { itemCount: 5, mixedRepeatedShapes: true },
    rectAlias: "collectionRoot",
    expect: { collectionSampleCount: 5 },
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
  if (expected.includesKinds) {
    for (const kind of expected.includesKinds) {
      expect(actual.results.some((item) => item.kind === kind)).toBe(true);
    }
  }
  if (expected.parentAssignedToControls) {
    expect(actual.results.some((item) => item.kind === "control" && Boolean(item.parentId))).toBe(true);
  }
  if (expected.includesKind) {
    expect(actual.results.some((item) => item.kind === expected.includesKind)).toBe(true);
  }
  if (expected.collectionSampleCountMin) {
    const collection = actual.results.find((item) => item.kind === "collection");
    expect(collection?.collection?.sampleCount ?? 0).toBeGreaterThanOrEqual(expected.collectionSampleCountMin);
  }
  if (expected.topResultKind) {
    expect(actual.results[0]?.kind).toBe(expected.topResultKind);
  }
  if (expected.nearestNestedRegion) {
    const byId = new Map(actual.results.map((item) => [item.id, item]));
    const control = actual.results.find((item) => item.kind === "control" && item.parentId);
    const parent = control ? byId.get(control.parentId) : null;
    expect(parent?.features?.id === "dialog-footer").toBe(true);
  }
  if (expected.resultCount) {
    expect(actual.results.length).toBe(expected.resultCount);
  }
  if (expected.collectionSampleCount) {
    const collection = actual.results.find((item) => item.kind === "collection");
    expect(collection?.collection?.sampleCount).toBe(expected.collectionSampleCount);
  }
}

describe("regions matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, () => {
      const actual = runCase(row);
      assertCase(actual, row.expect);
      expect(row.description.length).toBeGreaterThan(20);
    });
  }
});
