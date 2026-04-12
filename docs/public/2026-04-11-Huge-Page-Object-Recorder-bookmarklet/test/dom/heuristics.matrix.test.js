import { describe, expect, test } from "bun:test";
import { extractElementFeatures } from "../../src/features.js";
import { createObjectModel } from "../../src/heuristics.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "HE01",
    title: "Composer region classified from editable plus actions",
    description:
      "Composer container with editable field and action controls should be inferred as composer region with strong confidence.",
    fixture: "chat",
    mutate: { composerControl: "textarea", withAttachButton: true, sendButtonSignal: "data-testid" },
    alias: "composer",
    context: {},
    expect: { kind: "region", inferredType: "composer", confidenceMin: 0.7 },
  },
  {
    id: "HE02",
    title: "Transcript region classified from scrollable repeated messages",
    description:
      "Scrollable transcript with repeated message blocks should infer transcript region instead of generic content.",
    fixture: "chat",
    mutate: { transcriptScrollable: true, repeatCount: 6, timestampMessages: true },
    alias: "transcript",
    context: {},
    expect: { kind: "region", inferredType: "transcript" },
  },
  {
    id: "HE03",
    title: "Conversation rows become collection",
    description:
      "Sidebar with repeated conversation rows should infer collection semantics when repeated sample context is provided.",
    fixture: "chat",
    mutate: { sidebar: true, conversationRowCount: 5 },
    alias: "sidebar",
    context: { repeatedSampleCount: 5, regionType: "sidebar" },
    expect: { kind: "collection", inferredTypeAnyOf: ["conversationRows", "genericRepeatedList"] },
  },
  {
    id: "HE04",
    title: "Link-only navigation recognized as navigation region",
    description:
      "Shell navigation landmark with repeated links should map to a navigation region type.",
    fixture: "shell",
    mutate: { nav: true, repeatedLinks: 6 },
    alias: "navigation",
    context: {},
    expect: { kind: "region", inferredType: "navigation" },
  },
  {
    id: "HE05",
    title: "Status text becomes content not control",
    description:
      "Dialog status text containing sent/failed language but no interaction should classify as content status text.",
    fixture: "dialog",
    mutate: { includeStatusText: true },
    alias: "statusNode",
    context: {},
    expect: { kind: "content", inferredType: "statusText" },
  },
  {
    id: "HE06",
    title: "Menu-like button inferred as menu trigger control",
    description:
      "Toolbar button labeled More with no stable ids should remain a control and infer menu trigger semantics.",
    fixture: "shell",
    mutate: { toolbar: true, moreButtonText: "More" },
    alias: "moreButton",
    context: {},
    expect: { kind: "control", inferredType: "menuTrigger" },
  },
];

function runCase(row) {
  const { aliases } = buildFixture(row.fixture, row.mutate);
  const element = aliases[row.alias];
  if (!element) {
    throw new Error(`Missing alias ${row.alias} for ${row.id}`);
  }

  const model = createObjectModel({
    element,
    features: extractElementFeatures(element),
    context: row.context,
    existingNames: [],
  });

  return model;
}

function assertCase(model, expected) {
  if (expected.kind) {
    expect(model.kind).toBe(expected.kind);
  }
  if (expected.inferredType) {
    expect(model.inferredType).toBe(expected.inferredType);
  }
  if (expected.inferredTypeAnyOf) {
    expect(expected.inferredTypeAnyOf).toContain(model.inferredType);
  }
  if (expected.confidenceMin) {
    expect(model.confidence).toBeGreaterThanOrEqual(expected.confidenceMin);
  }
}

describe("heuristics matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, () => {
      const model = runCase(row);
      assertCase(model, row.expect);
      expect(row.description.length).toBeGreaterThan(20);
    });
  }
});
