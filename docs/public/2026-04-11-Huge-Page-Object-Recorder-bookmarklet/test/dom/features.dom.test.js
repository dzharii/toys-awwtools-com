import { describe, expect, test } from "bun:test";
import { extractElementFeatures, isElementDisabled, isElementVisible } from "../../src/features.js";
import { makeChatPage, makeNavigationPage, placeRect } from "./fixtures/pages.js";

describe("features DOM integration", () => {
  test("extracts authored attributes from real DOM nodes", () => {
    const { sendButton } = makeChatPage();

    const features = extractElementFeatures(sendButton);
    expect(features.id).toBe("send-button");
    expect(features.dataAttributes["data-testid"]).toBe("send-button");
    expect(features.ariaAttributes["aria-label"]).toBe("Send message");
    expect(features.accessibleName).toBe("Send message");
  });

  test("collects descendant summaries from querySelectorAll descendants", () => {
    const { composer } = makeChatPage();
    const features = extractElementFeatures(composer);

    expect(features.containsEditable).toBe(true);
    expect(features.containsButtons).toBe(true);
    expect(features.containsInputs).toBe(true);
  });

  test("detects repeated child tags with real navigation links", () => {
    const { nav } = makeNavigationPage();
    const features = extractElementFeatures(nav);

    expect(features.repeatedChildTagNames).toContain("a");
    expect(features.containsLinks).toBe(true);
  });

  test("treats present disabled attribute as disabled even when empty", () => {
    const button = placeRect(document.createElement("button"), {
      left: 0,
      top: 0,
      width: 120,
      height: 40,
    });
    button.setAttribute("disabled", "");
    document.body.append(button);

    expect(isElementDisabled(button)).toBe(true);
  });

  test("reads computed style when element.computedStyle is not provided", () => {
    const hidden = placeRect(document.createElement("div"), {
      left: 0,
      top: 0,
      width: 200,
      height: 40,
    });
    hidden.style.display = "none";
    document.body.append(hidden);

    expect(isElementVisible(hidden)).toBe(false);
  });
});
