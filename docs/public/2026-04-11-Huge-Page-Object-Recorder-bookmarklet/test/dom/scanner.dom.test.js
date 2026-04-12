import { describe, expect, test } from "bun:test";
import { scanDocument } from "../../src/scanner.js";
import { makeChatPage, makeDecorativeIcon } from "./fixtures/pages.js";

describe("scanner DOM integration", () => {
  test("finds meaningful controls while skipping decorative and ignored nodes", () => {
    const { composer, sendButton, ignoredOverlay } = makeChatPage();
    composer.prepend(makeDecorativeIcon());

    const records = scanDocument(document);

    expect(records.some((record) => record.features.id === sendButton.id)).toBe(true);
    expect(records.some((record) => record.element === ignoredOverlay)).toBe(false);
    expect(records.some((record) => record.features.ariaAttributes["aria-hidden"] === "true")).toBe(false);
  });
});
