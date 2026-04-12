import { describe, expect, test } from "bun:test";
import { extractElementFeatures } from "../../src/features.js";
import { buildSelectorState, chooseAutomaticHeuristic } from "../../src/selectors.js";
import { makeChatPage } from "./fixtures/pages.js";

describe("selectors DOM integration", () => {
  test("validates stable-attribute selectors against real querySelectorAll", () => {
    const { composer, sendButton } = makeChatPage();
    const features = extractElementFeatures(sendButton);

    const objectModel = {
      id: "send-button",
      name: "sendButton",
      kind: "control",
      inferredType: "button",
      parentId: "composer",
      features,
      collection: null,
    };

    const state = buildSelectorState(objectModel, {
      scope: document,
      document,
      heuristicId: "stableAttributesFirst",
      parentObject: {
        id: "composer",
        features: extractElementFeatures(composer),
      },
    });

    expect(state.preferred.selector).toBe('[data-testid="send-button"]');
    expect(state.preferred.matchCount).toBe(1);
    expect(state.preferred.selectorType).toBe("css");
  });

  test("keeps manual selector mode and type detection", () => {
    const { sendButton } = makeChatPage();
    const objectModel = {
      id: "send-button",
      name: "sendButton",
      kind: "control",
      inferredType: "button",
      parentId: null,
      features: extractElementFeatures(sendButton),
      collection: null,
    };

    const state = buildSelectorState(objectModel, {
      scope: document,
      document,
      manualSelector: '//*[@id="send-button"]',
      manualSelectorType: "xpath",
    });

    expect(state.heuristicId).toBe("manualSelector");
    expect(state.preferred.selectorType).toBe("xpath");
    expect(state.preferred.matchCount).toBe(1);
    expect(chooseAutomaticHeuristic(objectModel)).toBe("stableAttributesFirst");
  });
});
