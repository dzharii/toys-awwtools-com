import { describe, expect, test } from "bun:test";
import { exportJsonText, serializeSelectedObjects } from "../src/export.js";
import { isEligibleElement, scanDocument } from "../src/scanner.js";
import { makeDocument, makeElement } from "./helpers.js";

describe("export and scanner", () => {
  test("scans meaningful elements and skips ignored decorative nodes", () => {
    const button = makeElement({
      tagName: "button",
      attributes: { "aria-label": "Send message", id: "send-button" },
      textContent: "Send",
    });
    const icon = makeElement({
      tagName: "span",
      attributes: { "aria-hidden": "true" },
      rect: { left: 0, top: 0, width: 12, height: 12 },
    });
    const overlayNode = makeElement({
      tagName: "div",
      attributes: { "data-huge-page-object-recorder-ignore": "true" },
    });
    const body = makeElement({
      tagName: "body",
      children: [button, icon, overlayNode],
      rect: { left: 0, top: 0, width: 900, height: 900 },
    });
    const document = makeDocument({ body, elements: [button, icon, overlayNode] });
    button.ownerDocument = document;
    icon.ownerDocument = document;
    overlayNode.ownerDocument = document;
    const records = scanDocument(document);
    expect(records.some((record) => record.features.id === "send-button")).toBe(true);
    expect(records.some((record) => record.element === overlayNode)).toBe(false);
  });

  test("serializes stable export payloads with collection metadata", () => {
    const selectedObjects = [
      {
        id: "region-1",
        name: "composer",
        kind: "region",
        inferredType: "composer",
        confidence: 0.92,
        selector: '[data-testid="message-composer"]',
        selectorType: "css",
        selectorScore: 54,
        heuristicId: "stableAttributesFirst",
        alternativeSelectors: [],
        features: {
          boundingRect: { left: 0, top: 0, width: 700, height: 180 },
          tagName: "form",
          role: "",
          accessibleName: "Message composer",
          textSnippet: "",
          dataAttributes: { "data-testid": "message-composer" },
          ariaAttributes: {},
        },
        explanation: "composer region",
        parentId: null,
        children: ["control-1"],
        collection: null,
      },
      {
        id: "control-1",
        name: "sendButton",
        kind: "control",
        inferredType: "button",
        confidence: 0.84,
        selector: '[data-testid="send-button"]',
        selectorType: "css",
        selectorScore: 58,
        heuristicId: "regionScopedSemantic",
        alternativeSelectors: [
          {
            selector: 'button[aria-label="Send message"]',
            selectorType: "css",
            score: 46,
            heuristicId: "accessibleRoleAndName",
            explanation: "role + label",
            matchCount: 1,
          },
        ],
        features: {
          boundingRect: { left: 20, top: 20, width: 100, height: 48 },
          tagName: "button",
          role: "",
          accessibleName: "Send message",
          textSnippet: "Send",
          dataAttributes: { "data-testid": "send-button" },
          ariaAttributes: { "aria-label": "Send message" },
        },
        explanation: "send button",
        parentId: "region-1",
        children: [],
        collection: {
          itemSelector: "",
          itemSelectorScore: 0,
          itemChildren: [],
          sampleCount: 0,
          virtualizationSuspected: false,
        },
      },
    ];

    const serialized = serializeSelectedObjects(selectedObjects, {
      toolVersion: "0.1.0",
      url: "https://example.test/chat",
      title: "Chat",
      timestamp: "2026-04-11T12:00:00.000Z",
      viewport: { width: 1400, height: 900 },
    });

    expect(serialized.objects[1].alternativeSelectors[0].heuristicId).toBe("accessibleRoleAndName");
    expect(exportJsonText(selectedObjects).includes('"selectorScore": 58')).toBe(true);
  });

  test("rejects disabled, ignored, and parent-ignored nodes", () => {
    const disabled = {
      attributes: { disabled: "disabled" },
      getAttribute(name) {
        return this.attributes[name] ?? null;
      },
      getBoundingClientRect() {
        return { left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40 };
      },
      textContent: "Disabled",
      tagName: "BUTTON",
      classList: [],
      childElementCount: 0,
    };
    const parentIgnored = makeElement({
      tagName: "div",
      attributes: { "data-huge-page-object-recorder-ignore": "true" },
      children: [makeElement({ tagName: "button", textContent: "Child" })],
    });
    parentIgnored.children[0].parentElement = parentIgnored;
    const rawIgnored = {
      tagName: "DIV",
      attributes: { "data-huge-page-object-recorder-ignore": "true" },
      rect: { left: 0, top: 0, width: 100, height: 40 },
    };
    expect(isEligibleElement(disabled)).toBe(false);
    expect(isEligibleElement(parentIgnored.children[0])).toBe(false);
    expect(isEligibleElement(rawIgnored)).toBe(false);
  });
});
