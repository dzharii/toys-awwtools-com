import { describe, expect, test } from "bun:test";
import { scanDocument } from "../../src/scanner.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "SC01",
    title: "Scanner finds major chat controls and regions",
    description:
      "Chat page should surface composer, transcript, and send button as meaningful candidates without flooding decorative descendants.",
    fixture: "chat",
    mutate: { sidebar: true, transcript: true, composer: true, withAttachButton: true },
    expect: { includesIds: ["composer", "transcript", "send-button"], minRecords: 5 },
  },
  {
    id: "SC02",
    title: "Scanner skips ignored subtree",
    description:
      "Button nested under the tool ignore attribute should not appear in scanner output.",
    fixture: "noise",
    mutate: { ignoredSubtreeContainsButton: true },
    expect: { excludesIds: ["ignored-button"], includesIds: ["main-action"] },
  },
  {
    id: "SC03",
    title: "Scanner skips decorative aria-hidden nodes",
    description:
      "Decorative aria-hidden icons should be filtered while preserving meaningful controls in the same page.",
    fixture: "noise",
    mutate: { decorativeIcons: true },
    expect: { excludesAriaHidden: true, includesIds: ["main-action"] },
  },
  {
    id: "SC04",
    title: "Scanner rejects disabled controls",
    description:
      "Disabled submit action should be excluded while enabled cancel action remains discoverable.",
    fixture: "form",
    mutate: { submitDisabled: true, cancelEnabled: true },
    expect: { excludesIds: ["submit-button"], includesIds: ["cancel-button"] },
  },
  {
    id: "SC05",
    title: "Scanner deduplicates promoted descendants",
    description:
      "Nested descendants inside a strong button should not create duplicate scanner records for the same meaningful ancestor.",
    fixture: "chat",
    mutate: { denseComposerDescendants: true },
    expect: { uniqueIdCount: { id: "send-button", count: 1 } },
  },
  {
    id: "SC06",
    title: "Scanner preserves signal in noisy shell",
    description:
      "Generated-class noise should not hide landmark navigation and toolbar candidates.",
    fixture: "shell",
    mutate: { noiseProfile: "generated-classes", toolbar: true, nav: true },
    expect: { includesIds: ["main-nav", "main-toolbar"], excludesAriaHidden: true },
  },
];

function runCase(row) {
  buildFixture(row.fixture, row.mutate);
  const records = scanDocument(document);
  const ids = records.map((record) => record.features.id).filter(Boolean);

  return {
    records,
    ids,
  };
}

function assertCase(actual, expected) {
  if (expected.minRecords) {
    expect(actual.records.length).toBeGreaterThanOrEqual(expected.minRecords);
  }
  if (expected.includesIds) {
    for (const id of expected.includesIds) {
      expect(actual.ids).toContain(id);
    }
  }
  if (expected.excludesIds) {
    for (const id of expected.excludesIds) {
      expect(actual.ids).not.toContain(id);
    }
  }
  if (expected.excludesAriaHidden) {
    expect(actual.records.some((record) => record.features.ariaAttributes["aria-hidden"] === "true")).toBe(false);
  }
  if (expected.uniqueIdCount) {
    const count = actual.ids.filter((id) => id === expected.uniqueIdCount.id).length;
    expect(count).toBe(expected.uniqueIdCount.count);
  }
}

describe("scanner matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, () => {
      const actual = runCase(row);
      assertCase(actual, row.expect);
      expect(row.description.length).toBeGreaterThan(20);
    });
  }
});
