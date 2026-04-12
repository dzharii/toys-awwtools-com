import { describe, expect, test } from "bun:test";
import { detectRepeatedCollections, analyzeAreaSelection } from "../src/regions.js";

function makeRecord(index, overrides = {}) {
  return {
    id: overrides.id ?? `record-${index}`,
    kind: overrides.kind ?? "content",
    inferredType: overrides.inferredType ?? "content",
    confidence: overrides.confidence ?? 0.6,
    features: {
      tagName: overrides.tagName ?? "article",
      role: overrides.role ?? "",
      classList: overrides.classList ?? ["message-row"],
      childCount: overrides.childCount ?? 3,
      parentSummary: overrides.parentSummary ?? { identity: "transcript", tagName: "section", role: "log", childCount: 3 },
      boundingRect:
        overrides.boundingRect ??
        {
          left: 20,
          top: 20 + index * 80,
          width: 600,
          height: 70,
          right: 620,
          bottom: 90 + index * 80,
        },
      repeatedChildTagNames: overrides.repeatedChildTagNames ?? [],
      scrollable: overrides.scrollable ?? false,
    },
    children: [],
  };
}

describe("regions", () => {
  test("detects repeated collections from sibling-like records", () => {
    const records = [makeRecord(1), makeRecord(2), makeRecord(3)];
    const collections = detectRepeatedCollections(records);
    expect(collections).toHaveLength(1);
    expect(collections[0].kind).toBe("collection");
    expect(collections[0].collection.sampleCount).toBe(3);
  });

  test("analyzes area selections and assigns parents", () => {
    const region = makeRecord(0, {
      id: "composer",
      kind: "region",
      inferredType: "composer",
      confidence: 0.9,
      tagName: "form",
      boundingRect: { left: 0, top: 300, width: 800, height: 180, right: 800, bottom: 480 },
    });
    const input = makeRecord(1, {
      kind: "control",
      inferredType: "textarea",
      confidence: 0.8,
      tagName: "textarea",
      boundingRect: { left: 20, top: 330, width: 620, height: 110, right: 640, bottom: 440 },
    });
    const send = makeRecord(2, {
      kind: "control",
      inferredType: "button",
      confidence: 0.78,
      tagName: "button",
      boundingRect: { left: 660, top: 360, width: 120, height: 48, right: 780, bottom: 408 },
    });
    const nestedRegion = makeRecord(3, {
      id: "toolbar",
      kind: "region",
      inferredType: "toolbar",
      confidence: 0.7,
      tagName: "div",
      boundingRect: { left: 640, top: 340, width: 150, height: 80, right: 790, bottom: 420 },
    });

    const results = analyzeAreaSelection(
      [region, input, send, nestedRegion],
      { left: 0, top: 300, width: 820, height: 200, right: 820, bottom: 500 },
    );
    const savedRegion = results.find((item) => item.inferredType === "composer");
    const savedInput = results.find((item) => item.inferredType === "textarea");
    expect(savedRegion).toBeTruthy();
    expect(savedInput.parentId).toBe(savedRegion.id);
    expect(results.some((item) => item.inferredType === "toolbar")).toBe(true);
  });
});
