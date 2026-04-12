import { describe, expect, test } from "bun:test";
import { extractElementFeatures } from "../../src/features.js";
import { buildSelectorState } from "../../src/selectors.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "SEL01",
    title: "data-testid wins over generated classes",
    description:
      "Send button with data-testid in a noisy chat surface should prefer authored test attribute selectors.",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid", noiseProfile: "generated-classes" },
    act: "sendButton",
    expect: {
      preferredSelector: '[data-testid="send-button"]',
      preferredSelectorType: "css",
      matchCount: 1,
      disallowSelectorContains: ["css-", "jsx-", "sc-"],
    },
  },
  {
    id: "SEL02",
    title: "Meaningful id is accepted when stable",
    description:
      "Submit button with a human-authored semantic id should allow #id selectors when no better test attribute exists.",
    fixture: "form",
    mutate: { submitSignal: "stable-id" },
    act: "submitButton",
    expect: {
      preferredSelectorStartsWith: "#",
      preferredSelectorType: "css",
      matchCount: 1,
      disallowSelectorContains: ["css-", "jsx-", "react-"],
    },
  },
  {
    id: "SEL03",
    title: "Generated id rejected in favor of aria-label fallback",
    description:
      "Toolbar action with generated-looking id and aria-label should avoid unstable id selectors.",
    fixture: "shell",
    mutate: { actionSignal: "generated-id-plus-aria-label" },
    act: "toolbarAction",
    expect: {
      preferredSelectorContains: '[aria-label="Open settings"]',
      preferredSelectorType: "css",
      disallowSelectorContains: ["#css", "#jsx", "#react"],
    },
  },
  {
    id: "SEL04",
    title: "Parent-scoped child selector used inside region",
    description:
      "Text-only send button inside composer should still produce a parent-scoped semantic selector candidate.",
    fixture: "chat",
    mutate: { sendButtonSignal: "text-only" },
    act: "sendButtonWithParent",
    expect: {
      heuristicId: "regionScopedSemantic",
      scope: "parent",
    },
  },
  {
    id: "SEL05",
    title: "Collection selector matches repeated items",
    description:
      "Collection item selector should target repeated cards and return multi-match counts for list semantics.",
    fixture: "collection",
    mutate: { itemCount: 5, itemStableClass: true },
    act: "collectionItems",
    expect: {
      preferredSelectorType: "css",
      matchCount: 5,
    },
  },
  {
    id: "SEL06",
    title: "Manual selector overrides automatic ranking",
    description:
      "User-provided manual selector should become preferred even when automatic candidates exist.",
    fixture: "chat",
    mutate: { sendButtonSignal: "data-testid" },
    act: "sendButtonManual",
    expect: {
      heuristicId: "manualSelector",
      preferredSelector: 'button[aria-label="Send message"]',
      preferredSelectorType: "css",
    },
  },
];

function buildObjectFromAlias(alias, kind = "control") {
  return {
    id: alias.id || "object",
    name: alias.id || "object",
    kind,
    inferredType: kind === "collection" ? "messageItems" : "button",
    parentId: null,
    features: extractElementFeatures(alias),
    collection: null,
  };
}

function runCase(row) {
  const { aliases } = buildFixture(row.fixture, row.mutate);

  if (row.act === "collectionItems") {
    const sample = aliases.collectionItems[0];
    const objectModel = {
      id: "collection-1",
      name: "messageItems",
      kind: "collection",
      inferredType: "messageItems",
      parentId: null,
      features: extractElementFeatures(sample),
      collection: {
        sampleEntries: aliases.collectionItems.map((item) => ({ features: extractElementFeatures(item) })),
      },
    };

    return buildSelectorState(objectModel, {
      scope: document,
      document,
      heuristicId: "collectionItem",
    });
  }

  if (row.act === "sendButtonWithParent") {
    const objectModel = buildObjectFromAlias(aliases.sendButton);
    objectModel.parentId = "composer";

    return buildSelectorState(objectModel, {
      scope: document,
      document,
      heuristicId: "regionScopedSemantic",
      parentObject: {
        id: "composer",
        name: "composer",
        features: extractElementFeatures(aliases.composer),
      },
      parentScope: aliases.composer,
    });
  }

  if (row.act === "sendButtonManual") {
    const objectModel = buildObjectFromAlias(aliases.sendButton);
    return buildSelectorState(objectModel, {
      scope: document,
      document,
      manualSelector: 'button[aria-label="Send message"]',
      manualSelectorType: "css",
    });
  }

  const objectModel = buildObjectFromAlias(aliases[row.act]);
  return buildSelectorState(objectModel, {
    scope: document,
    document,
    heuristicId: "stableAttributesFirst",
  });
}

function assertCase(state, expected) {
  if (expected.preferredSelector) {
    expect(state.preferred.selector).toBe(expected.preferredSelector);
  }
  if (expected.preferredSelectorStartsWith) {
    expect(state.preferred.selector.startsWith(expected.preferredSelectorStartsWith)).toBe(true);
  }
  if (expected.preferredSelectorContains) {
    expect(state.preferred.selector.includes(expected.preferredSelectorContains)).toBe(true);
  }
  if (expected.preferredSelectorType) {
    expect(state.preferred.selectorType).toBe(expected.preferredSelectorType);
  }
  if (typeof expected.matchCount === "number") {
    expect(state.preferred.matchCount).toBe(expected.matchCount);
  }
  if (expected.heuristicId) {
    expect(state.heuristicId).toBe(expected.heuristicId);
  }
  if (expected.scope) {
    expect(state.testResult.scope).toBe(expected.scope);
  }
  if (expected.disallowSelectorContains) {
    for (const fragment of expected.disallowSelectorContains) {
      expect(state.preferred.selector.includes(fragment)).toBe(false);
    }
  }
}

describe("selector matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, () => {
      const state = runCase(row);
      assertCase(state, row.expect);
      expect(row.description.length).toBeGreaterThan(20);
    });
  }
});
