import { describe, expect, test } from "bun:test";
import {
  buildObjectName,
  createObjectModel,
  inferObjectFromFeatures,
  triggeredDiscoveryHeuristics,
} from "../src/heuristics.js";

describe("heuristics", () => {
  test("infers a send button control", () => {
    const features = {
      tagName: "button",
      role: "",
      type: "",
      id: "send-button",
      classList: [],
      dataAttributes: { "data-testid": "send-button" },
      ariaAttributes: { "aria-label": "Send message" },
      name: "",
      title: "Send message",
      placeholder: "",
      alt: "",
      href: "",
      textSnippet: "Send",
      accessibleName: "Send message",
      boundingRect: { left: 0, top: 0, width: 80, height: 40, right: 80, bottom: 40 },
      visible: true,
      disabled: false,
      contentEditable: false,
      tabIndex: 0,
      childCount: 0,
      parentSummary: { identity: "composer", tagName: "form", role: "", childCount: 2 },
      scrollable: false,
      localTextDensity: 0.003,
      descendantTagNames: [],
      descendantRoles: [],
      containsEditable: false,
      containsButtons: false,
      containsLinks: false,
      containsInputs: false,
      repeatedChildTagNames: [],
      hasActionWord: true,
      looksTimestamp: false,
      isNativeInteractable: true,
      hasInteractiveRole: false,
      hasLandmarkRole: false,
    };

    const inference = inferObjectFromFeatures(features);
    expect(inference.kind).toBe("control");
    expect(inference.inferredType).toBe("button");
    expect(triggeredDiscoveryHeuristics(features)).toContain("nativeInteractables");
  });

  test("infers composer and transcript regions", () => {
    const composerFeatures = {
      tagName: "form",
      role: "",
      accessibleName: "Message composer",
      textSnippet: "",
      placeholder: "Write message",
      visible: true,
      disabled: false,
      isNativeInteractable: false,
      hasInteractiveRole: false,
      hasLandmarkRole: false,
      contentEditable: false,
      tabIndex: -1,
      boundingRect: { left: 0, top: 0, width: 700, height: 160, right: 700, bottom: 160 },
      containsEditable: true,
      containsButtons: true,
      containsLinks: false,
      containsInputs: true,
      repeatedChildTagNames: [],
      scrollable: false,
      localTextDensity: 0.002,
    };
    const transcriptFeatures = {
      ...composerFeatures,
      tagName: "section",
      accessibleName: "Chat transcript",
      scrollable: true,
      containsEditable: false,
      containsButtons: false,
      repeatedChildTagNames: ["article"],
    };

    expect(inferObjectFromFeatures(composerFeatures).inferredType).toBe("composer");
    expect(inferObjectFromFeatures(transcriptFeatures).inferredType).toBe("transcript");
  });

  test("infers collection and content types", () => {
    const collectionFeatures = {
      tagName: "div",
      role: "",
      accessibleName: "Conversation list",
      textSnippet: "Conversation list",
      placeholder: "",
      visible: true,
      disabled: false,
      isNativeInteractable: false,
      hasInteractiveRole: false,
      hasLandmarkRole: false,
      contentEditable: false,
      tabIndex: -1,
      boundingRect: { left: 0, top: 0, width: 260, height: 520, right: 260, bottom: 520 },
      containsEditable: false,
      containsButtons: true,
      containsLinks: true,
      containsInputs: false,
      repeatedChildTagNames: ["div"],
      scrollable: true,
      localTextDensity: 0.005,
    };
    const timestampFeatures = {
      ...collectionFeatures,
      accessibleName: "",
      textSnippet: "8:42 PM",
      containsButtons: false,
      containsLinks: false,
      repeatedChildTagNames: [],
      scrollable: false,
      localTextDensity: 0.008,
      looksTimestamp: true,
    };
    expect(inferObjectFromFeatures(collectionFeatures, { repeatedSampleCount: 4, regionType: "sidebar" }).kind).toBe("collection");
    expect(inferObjectFromFeatures(timestampFeatures).inferredType).toBe("timestamp");
  });

  test("creates readable object names and models", () => {
    const features = {
      tagName: "textarea",
      role: "",
      type: "",
      id: "message-input",
      classList: [],
      dataAttributes: { "data-testid": "message-input" },
      ariaAttributes: {},
      name: "message-input",
      title: "",
      placeholder: "Write message",
      alt: "",
      href: "",
      textSnippet: "",
      accessibleName: "Message Input",
      boundingRect: { left: 0, top: 0, width: 200, height: 120, right: 200, bottom: 120 },
      visible: true,
      disabled: false,
      contentEditable: false,
      tabIndex: 0,
      childCount: 0,
      parentSummary: null,
      scrollable: false,
      localTextDensity: 0,
      descendantTagNames: [],
      descendantRoles: [],
      containsEditable: false,
      containsButtons: false,
      containsLinks: false,
      containsInputs: false,
      repeatedChildTagNames: [],
      hasActionWord: false,
      looksTimestamp: false,
      isNativeInteractable: true,
      hasInteractiveRole: false,
      hasLandmarkRole: false,
    };
    const model = createObjectModel({ features, existingNames: ["messageInput"] });
    expect(buildObjectName({ inferredType: "editable" }, features, ["messageInput"])).toBe("messageInput2");
    expect(model.name).toBe("messageInput2");
  });

  test("covers control, region, collection, and content variants", () => {
    const base = {
      role: "",
      type: "",
      id: "",
      classList: [],
      dataAttributes: {},
      ariaAttributes: {},
      name: "",
      title: "",
      placeholder: "",
      alt: "",
      href: "",
      textSnippet: "",
      accessibleName: "",
      boundingRect: { left: 0, top: 0, width: 120, height: 40, right: 120, bottom: 40 },
      visible: true,
      disabled: false,
      contentEditable: false,
      tabIndex: -1,
      childCount: 0,
      parentSummary: null,
      scrollable: false,
      localTextDensity: 0.005,
      descendantTagNames: [],
      descendantRoles: [],
      containsEditable: false,
      containsButtons: false,
      containsLinks: false,
      containsInputs: false,
      repeatedChildTagNames: [],
      hasActionWord: false,
      looksTimestamp: false,
      isNativeInteractable: false,
      hasInteractiveRole: false,
      hasLandmarkRole: false,
    };

    expect(inferObjectFromFeatures({ ...base, tagName: "input", type: "file", isNativeInteractable: true }).inferredType).toBe("fileInput");
    expect(inferObjectFromFeatures({ ...base, tagName: "select", isNativeInteractable: true }).inferredType).toBe("combobox");
    expect(inferObjectFromFeatures({ ...base, tagName: "div", role: "switch", hasInteractiveRole: true, textSnippet: "Toggle" }).inferredType).toBe("toggle");
    expect(inferObjectFromFeatures({ ...base, tagName: "button", isNativeInteractable: true, textSnippet: "More actions" }).inferredType).toBe("menuTrigger");
    expect(inferObjectFromFeatures({ ...base, tagName: "a", role: "link", href: "/chat", hasInteractiveRole: true }).inferredType).toBe("link");

    expect(inferObjectFromFeatures({ ...base, tagName: "nav", containsLinks: true, repeatedChildTagNames: ["a"], visible: true }).inferredType).toBe("navigation");
    expect(inferObjectFromFeatures({ ...base, tagName: "aside", containsButtons: true, accessibleName: "Sidebar" }).inferredType).toBe("sidebar");
    expect(inferObjectFromFeatures({ ...base, tagName: "div", role: "toolbar", hasLandmarkRole: true, containsButtons: true }).inferredType).toBe("toolbar");
    expect(inferObjectFromFeatures({ ...base, tagName: "dialog", role: "dialog", hasLandmarkRole: true }).inferredType).toBe("modal");
    expect(inferObjectFromFeatures({ ...base, tagName: "header", hasLandmarkRole: true }).inferredType).toBe("header");
    expect(inferObjectFromFeatures({ ...base, tagName: "footer", hasLandmarkRole: true }).inferredType).toBe("footer");
    expect(inferObjectFromFeatures({ ...base, tagName: "main", hasLandmarkRole: true }).inferredType).toBe("main");

    expect(inferObjectFromFeatures({ ...base, tagName: "div", repeatedChildTagNames: ["li"], textSnippet: "Menu items" }, { repeatedSampleCount: 4 }).inferredType).toBe("navigationLinks");
    expect(inferObjectFromFeatures({ ...base, tagName: "div", repeatedChildTagNames: ["article"], textSnippet: "Messages" }, { repeatedSampleCount: 4, regionType: "transcript" }).inferredType).toBe("messageItems");
    expect(inferObjectFromFeatures({ ...base, tagName: "div", repeatedChildTagNames: ["div"], textSnippet: "" }, { repeatedSampleCount: 4 }).inferredType).toBe("genericRepeatedList");

    expect(inferObjectFromFeatures({ ...base, tagName: "span", textSnippet: "Online status" }).inferredType).toBe("statusText");
    expect(inferObjectFromFeatures({ ...base, tagName: "span", textSnippet: "Unread badge" }).inferredType).toBe("badge");
    expect(inferObjectFromFeatures({ ...base, tagName: "h2", textSnippet: "Thread title" }).inferredType).toBe("title");
    expect(inferObjectFromFeatures({ ...base, tagName: "span", textSnippet: "Sender" }).inferredType).toBe("sender");
    expect(triggeredDiscoveryHeuristics({ ...base, tagName: "div", tabIndex: 0, repeatedChildTagNames: ["a"], containsLinks: true, role: "dialog", textSnippet: "Status", visible: true })).toEqual(
      expect.arrayContaining(["eventLikeControls", "visualRegions", "repeatedCollections", "navigationClusters", "modalSurface", "assertableContent"]),
    );
  });
});
