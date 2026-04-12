import { describe, expect, test } from "bun:test";
import {
  applicableHeuristics,
  buildSelectorState,
  chooseAutomaticHeuristic,
  getHeuristicMetadata,
  scoreSelectorCandidate,
  validateSelectorCandidate,
} from "../src/selectors.js";
import { makeQueryContext } from "./helpers.js";

function controlObject() {
  return {
    id: "send-button",
    name: "sendButton",
    kind: "control",
    inferredType: "button",
    parentId: "composer",
    features: {
      tagName: "button",
      role: "",
      id: "send-button",
      classList: ["css-1ab29d", "send-button"],
      dataAttributes: { "data-testid": "send-button" },
      ariaAttributes: { "aria-label": "Send message" },
      name: "",
      title: "Send message",
      placeholder: "",
      href: "",
      accessibleName: "Send message",
      textSnippet: "Send",
      parentSummary: { identity: "composer", tagName: "form" },
    },
    collection: null,
  };
}

describe("selectors", () => {
  test("chooses automatic heuristic based on object context", () => {
    expect(chooseAutomaticHeuristic(controlObject())).toBe("regionScopedSemantic");
    expect(
      chooseAutomaticHeuristic({
        ...controlObject(),
        kind: "collection",
        parentId: null,
      }),
    ).toBe("collectionItem");
    expect(
      chooseAutomaticHeuristic({
        ...controlObject(),
        parentId: null,
        features: { ...controlObject().features, dataAttributes: {}, id: "" },
      }),
    ).toBe("shortUniqueCss");
  });

  test("prefers stable attributes over brittle class paths", () => {
    const objectModel = controlObject();
    const context = makeQueryContext({
      'css:[data-testid="send-button"]': 1,
      "css:button.send-button": 1,
      "css:form button.send-button": 1,
      "xpath://*[contains(normalize-space(.), \"Send message\")]": 1,
    });
    const state = buildSelectorState(objectModel, {
      ...context,
      heuristicId: "stableAttributesFirst",
      parentObject: { id: "composer", name: "composer" },
    });
    expect(state.preferred.selector).toBe('[data-testid="send-button"]');
    expect(state.preferred.score).toBeGreaterThan(30);
    expect(state.alternatives.length).toBeGreaterThan(0);
  });

  test("supports manual selectors without overwriting them", () => {
    const objectModel = controlObject();
    const state = buildSelectorState(objectModel, {
      ...makeQueryContext({ "css:.manual-send": 1 }),
      manualSelector: ".manual-send",
      manualSelectorType: "css",
    });
    expect(state.heuristicId).toBe("manualSelector");
    expect(state.preferred.selector).toBe(".manual-send");
  });

  test("scores selector candidates with stability penalties", () => {
    const strong = scoreSelectorCandidate(
      {
        selector: '[data-testid="send-button"]',
        selectorType: "css",
        explanation: "stable selector",
        matchCount: 1,
      },
      controlObject(),
    );
    const weak = scoreSelectorCandidate(
      {
        selector: "/html/body/div[4]/div[9]/button[2]",
        selectorType: "xpath",
        explanation: "absolute path",
        matchCount: 1,
      },
      controlObject(),
    );
    expect(strong).toBeGreaterThan(weak);
  });

  test("covers heuristic metadata and non-default selector strategies", () => {
    expect(getHeuristicMetadata("textAnchored").label).toBe("Text Anchored");
    expect(applicableHeuristics("collection").some((item) => item.id === "collectionItem")).toBe(true);

    const queryContext = makeQueryContext({
      "css:form button": 1,
      'xpath://*[contains(normalize-space(.), "Send message")]': 1,
      'css:button[role="button"]': 1,
      'css:[role="button"][aria-label="Send message"]': 1,
      "css:article": 3,
      "css:form button.send-button": 1,
    });

    const roleState = buildSelectorState(
      {
        ...controlObject(),
        parentId: null,
        features: {
          ...controlObject().features,
          id: "",
          dataAttributes: {},
          ariaAttributes: { "aria-label": "Send message" },
          role: "button",
        },
      },
      { ...queryContext, heuristicId: "accessibleRoleAndName" },
    );
    expect(roleState.preferred.heuristicId).toBe("accessibleRoleAndName");

    const textState = buildSelectorState(
      {
        ...controlObject(),
        parentId: null,
        features: { ...controlObject().features, id: "", dataAttributes: {}, classList: [], role: "", title: "Send message" },
      },
      { ...queryContext, heuristicId: "textAnchored" },
    );
    expect(textState.preferred.selectorType).toBe("xpath");

    const collectionState = buildSelectorState(
      {
        id: "messages",
        name: "messageItems",
        kind: "collection",
        inferredType: "messageItems",
        parentId: null,
        features: { tagName: "section", role: "", dataAttributes: {}, classList: [], parentSummary: { tagName: "main" } },
        collection: {
          sampleEntries: [{ features: { tagName: "article", dataAttributes: {}, classList: [], parentSummary: { tagName: "section" } } }],
        },
      },
      { ...queryContext, heuristicId: "collectionItem" },
    );
    expect(collectionState.preferred.selector).toBe("article");
  });

  test("validates selector candidates through css and xpath query engines", () => {
    const cssValidated = validateSelectorCandidate(
      {
        selector: "button.send-button",
        selectorType: "css",
      },
      makeQueryContext({ "css:button.send-button": 2 }),
    );
    expect(cssValidated.matchCount).toBe(2);

    const xpathValidated = validateSelectorCandidate(
      {
        selector: '//*[@role="button"]',
        selectorType: "xpath",
      },
      {
        document: {
          XPathResult: { ORDERED_NODE_SNAPSHOT_TYPE: 7 },
          evaluate() {
            return { snapshotLength: 4 };
          },
        },
      },
    );
    expect(xpathValidated.matchCount).toBe(4);

    const invalidCss = validateSelectorCandidate(
      {
        selector: "button[",
        selectorType: "css",
      },
      {
        scope: {
          querySelectorAll() {
            throw new Error("bad selector");
          },
        },
      },
    );
    expect(invalidCss.matchCount).toBe(0);
  });

  test("covers placeholder, href, resilient path, and empty fallbacks", () => {
    const placeholderObject = {
      id: "search-input",
      name: "searchInput",
      kind: "control",
      inferredType: "input",
      parentId: null,
      features: {
        tagName: "input",
        role: "",
        id: "",
        classList: [],
        dataAttributes: {},
        ariaAttributes: {},
        name: "search-input",
        title: "",
        placeholder: "Search conversations",
        href: "",
        accessibleName: "",
        textSnippet: "",
        parentSummary: { tagName: "header" },
      },
      collection: null,
    };
    const linkObject = {
      ...placeholderObject,
      id: "thread-link",
      kind: "content",
      inferredType: "link",
      features: {
        ...placeholderObject.features,
        tagName: "a",
        name: "",
        href: "/thread/123",
        textSnippet: "Thread Alpha",
        parentSummary: null,
      },
    };

    const placeholderState = buildSelectorState(placeholderObject, {
      ...makeQueryContext({
        'css:input[name="search-input"]': 1,
        'css:input[placeholder="Search conversations"]': 1,
        "css:header input": 1,
      }),
      heuristicId: "stableAttributesFirst",
    });
    expect(placeholderState.alternatives.some((item) => item.selector.includes("placeholder"))).toBe(true);

    const linkState = buildSelectorState(linkObject, {
      ...makeQueryContext({
        'css:a[href="/thread/123"]': 1,
        'xpath://*[contains(normalize-space(.), "Thread Alpha")]': 1,
      }),
      heuristicId: "stableAttributesFirst",
    });
    expect(linkState.preferred.selector).toBe('a[href="/thread/123"]');

    const resilientState = buildSelectorState(
      {
        ...controlObject(),
        parentId: null,
        features: {
          ...controlObject().features,
          dataAttributes: {},
          id: "",
          classList: ["send-button"],
          parentSummary: { tagName: "form" },
        },
      },
      { ...makeQueryContext({ "css:form button.send-button": 1 }), heuristicId: "resilientCssPath" },
    );
    expect(resilientState.preferred.selector).toBe("form button.send-button");

    const emptyState = buildSelectorState(
      {
        id: "empty",
        name: "empty",
        kind: "region",
        inferredType: "panel",
        parentId: null,
        features: {
          tagName: "",
          role: "",
          id: "",
          classList: [],
          dataAttributes: {},
          ariaAttributes: {},
          name: "",
          title: "",
          placeholder: "",
          href: "",
          accessibleName: "",
          textSnippet: "",
          parentSummary: null,
        },
        collection: null,
      },
      { heuristicId: "stableAttributesFirst" },
    );
    expect(emptyState.preferred.selector).toBe("");
  });
});
