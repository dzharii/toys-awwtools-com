import { describe, expect, test } from "bun:test";
import {
  computeAccessibleName,
  extractElementFeatures,
  getMeaningfulAncestor,
  isElementDisabled,
  isElementVisible,
  isInteractiveRole,
  isLandmarkRole,
  isNativeInteractableTag,
  isScrollableElement,
  readAttribute,
  readRect,
} from "../src/features.js";
import { makeDocument, makeElement } from "./helpers.js";

describe("features", () => {
  test("computes accessible name from aria-label first", () => {
    const element = makeElement({
      tagName: "button",
      attributes: { "aria-label": "Send message" },
      textContent: "Ignored",
    });
    expect(computeAccessibleName(element)).toBe("Send message");
  });

  test("computes accessible name from labelledby and label", () => {
    const labelNode = makeElement({ tagName: "span", textContent: "Compose Note" });
    const fieldLabel = makeElement({ tagName: "label", textContent: "Message Input" });
    const input = makeElement({
      tagName: "textarea",
      attributes: { id: "message", "aria-labelledby": "composer-label" },
    });
    const document = makeDocument({
      nodesById: { "composer-label": labelNode, message: input },
      labelsByFor: { message: [fieldLabel] },
    });
    input.ownerDocument = document;
    expect(computeAccessibleName(input, document)).toBe("Compose Note");
    delete input.attributes["aria-labelledby"];
    expect(computeAccessibleName(input, document)).toBe("Message Input");
  });

  test("extracts features including descendant summaries", () => {
    const sendButton = makeElement({ tagName: "button", attributes: { "aria-label": "Send" } });
    const input = makeElement({
      tagName: "textarea",
      attributes: { id: "message-input", placeholder: "Write message" },
    });
    const composer = makeElement({
      tagName: "form",
      attributes: { id: "composer-form" },
      children: [input, sendButton],
      rect: { left: 0, top: 0, width: 500, height: 160 },
    });
    input.ownerDocument = makeDocument({ body: composer, elements: [composer, input, sendButton] });
    sendButton.ownerDocument = input.ownerDocument;
    composer.ownerDocument = input.ownerDocument;

    const features = extractElementFeatures(composer);
    expect(features.containsEditable).toBe(true);
    expect(features.containsButtons).toBe(true);
    expect(features.repeatedChildTagNames).toEqual([]);
    expect(features.parentSummary).toBe(null);
  });

  test("detects visibility and meaningful ancestor promotion", () => {
    const icon = makeElement({
      tagName: "span",
      rect: { left: 0, top: 0, width: 16, height: 16 },
    });
    const button = makeElement({
      tagName: "button",
      attributes: { "aria-label": "Attach file" },
      children: [icon],
    });
    icon.parentElement = button;
    expect(isElementVisible(button)).toBe(true);
    expect(getMeaningfulAncestor(icon)).toBe(button);
  });

  test("marks hidden zero-area elements as not visible", () => {
    const hidden = makeElement({
      rect: { left: 0, top: 0, width: 0, height: 0 },
      hidden: true,
    });
    expect(isElementVisible(hidden)).toBe(false);
  });

  test("supports attribute and geometry fallbacks", () => {
    expect(readRect({ rect: { left: 1, top: 2, width: 3, height: 4 } })).toEqual({
      left: 1,
      top: 2,
      width: 3,
      height: 4,
      right: 4,
      bottom: 6,
    });
    expect(readAttribute({ attributes: { title: "x" } }, "title")).toBe("x");
    expect(readAttribute({ title: "x" }, "title")).toBe("x");
    expect(readAttribute(null, "title")).toBe(null);
  });

  test("classifies roles, disabled state, and scrollability", () => {
    expect(isNativeInteractableTag("input")).toBe(true);
    expect(isInteractiveRole("menuitem")).toBe(true);
    expect(isLandmarkRole("dialog")).toBe(true);
    expect(isElementDisabled({ attributes: { "aria-disabled": "true" }, getAttribute(name) { return this.attributes[name]; } })).toBe(true);
    expect(isElementDisabled({ inert: true })).toBe(true);
    expect(
      isScrollableElement({
        rect: { left: 0, top: 0, width: 100, height: 100 },
        scrollHeight: 160,
        clientHeight: 100,
      }),
    ).toBe(true);
  });

  test("tracks repeated descendant tags and parent summaries", () => {
    const row1 = makeElement({ tagName: "a", attributes: { href: "/a" }, textContent: "Alpha" });
    const row2 = makeElement({ tagName: "a", attributes: { href: "/b" }, textContent: "Beta" });
    const row3 = makeElement({ tagName: "a", attributes: { href: "/c" }, textContent: "Gamma" });
    const sidebar = makeElement({
      tagName: "aside",
      children: [row1, row2, row3],
      rect: { left: 0, top: 0, width: 240, height: 500 },
      identity: "sidebar",
    });
    const shell = makeElement({
      tagName: "div",
      children: [sidebar],
      identity: "shell",
      rect: { left: 0, top: 0, width: 1000, height: 600 },
    });
    sidebar.parentElement = shell;
    const features = extractElementFeatures(sidebar);
    expect(features.containsLinks).toBe(true);
    expect(features.repeatedChildTagNames).toEqual(["a"]);
    expect(features.parentSummary.identity).toBe("shell");
  });
});
