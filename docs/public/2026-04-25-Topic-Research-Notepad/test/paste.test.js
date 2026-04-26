import { expect, test } from "bun:test";
import { blocksFromClipboard, blocksFromPlainText } from "../src/paste.js";

test("plain text paste becomes paragraph blocks split by blank lines", () => {
  const blocks = blocksFromPlainText({ pageId: "p1", text: "First\n\nSecond" });
  expect(blocks).toHaveLength(2);
  expect(blocks[0].type).toBe("paragraph");
  expect(blocks[1].content.text).toBe("Second");
});

test("plain text code-like paste becomes a code block", () => {
  const blocks = blocksFromPlainText({ pageId: "p1", text: "const value = true;" });
  expect(blocks[0].type).toBe("code");
});

test("HTML paste falls back to stripped text when DOMParser is unavailable", () => {
  const blocks = blocksFromClipboard({ pageId: "p1", html: "<script>alert(1)</script><p>Safe text</p>" });
  expect(blocks[0].content.text).toContain("Safe text");
  expect(blocks[0].content.text).not.toContain("<script>");
});
