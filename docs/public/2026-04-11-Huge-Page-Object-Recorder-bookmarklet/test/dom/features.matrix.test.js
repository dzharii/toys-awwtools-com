import { describe, expect, test } from "bun:test";
import {
  computeAccessibleName,
  extractElementFeatures,
  getMeaningfulAncestor,
  isElementVisible,
} from "../../src/features.js";
import { buildFixture } from "./fixtures/matrix-fixtures.js";

const cases = [
  {
    id: "FE01",
    title: "Textarea uses aria-label as accessible name",
    description:
      "Chat composer textarea has both aria-label and placeholder. Accessible name should come from aria-label.",
    fixture: "chat",
    mutate: { composerControl: "textarea", composerNameSource: "aria-label" },
    act: "extractFeatures:composerControl",
    expect: { accessibleName: "Message input", tagName: "textarea", contentEditable: false },
  },
  {
    id: "FE02",
    title: "Input falls back to associated label",
    description:
      "Form input has no aria-label and is labeled through for/id wiring. Accessible name should come from label text.",
    fixture: "form",
    mutate: { inputNameSource: "label-for" },
    act: "computeAccessibleName:primaryInput",
    expect: { accessibleName: "Email address" },
  },
  {
    id: "FE03",
    title: "Placeholder is used when no stronger label exists",
    description:
      "Form input with placeholder only should use placeholder text as accessible name fallback.",
    fixture: "form",
    mutate: { inputNameSource: "placeholder-only" },
    act: "extractFeatures:primaryInput",
    expect: { accessibleName: "Search docs", placeholder: "Search docs" },
  },
  {
    id: "FE04",
    title: "Hidden-style element is not visible",
    description:
      "Noise page includes a button hidden by computed style visibility and it should be reported as not visible.",
    fixture: "noise",
    mutate: { targetVisibility: "hidden-style" },
    act: "isElementVisible:hiddenButton",
    expect: { visible: false },
  },
  {
    id: "FE05",
    title: "Scrollable transcript detected from dimensions",
    description:
      "Chat transcript has repeated messages and scrollHeight larger than clientHeight, so scrollability should be true.",
    fixture: "chat",
    mutate: { transcriptScrollable: true, repeatCount: 8 },
    act: "extractFeatures:transcript",
    expect: { scrollable: true, repeatedChildTagNamesIncludes: "article" },
  },
  {
    id: "FE06",
    title: "Strong parent becomes meaningful ancestor",
    description:
      "A weak child inside composer should promote to a more meaningful ancestor with grouped edit and button signals.",
    fixture: "chat",
    mutate: { denseComposerDescendants: true },
    act: "getMeaningfulAncestor:weakComposerChild",
    expect: { ancestorId: "composer", ancestorContainsButtons: true, ancestorContainsEditable: true },
  },
];

function runCase(row) {
  const { aliases } = buildFixture(row.fixture, row.mutate);
  const [operation, alias] = row.act.split(":");
  const node = aliases[alias];

  if (!node) {
    throw new Error(`Missing alias ${alias} for ${row.id}`);
  }

  if (operation === "extractFeatures") {
    return extractElementFeatures(node);
  }
  if (operation === "computeAccessibleName") {
    return { accessibleName: computeAccessibleName(node) };
  }
  if (operation === "isElementVisible") {
    return { visible: isElementVisible(node) };
  }
  if (operation === "getMeaningfulAncestor") {
    const ancestor = getMeaningfulAncestor(node);
    const ancestorFeatures = extractElementFeatures(ancestor);
    return {
      ancestorId: ancestor?.id ?? "",
      ancestorContainsButtons: ancestorFeatures.containsButtons,
      ancestorContainsEditable: ancestorFeatures.containsEditable,
    };
  }

  throw new Error(`Unsupported operation ${operation}`);
}

function assertExpectations(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (key === "repeatedChildTagNamesIncludes") {
      expect(actual.repeatedChildTagNames).toContain(value);
      continue;
    }
    expect(actual[key]).toEqual(value);
  }
}

describe("feature matrix", () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, () => {
      const actual = runCase(row);
      assertExpectations(actual, row.expect);
      expect(row.description.length).toBeGreaterThan(20);
    });
  }
});
