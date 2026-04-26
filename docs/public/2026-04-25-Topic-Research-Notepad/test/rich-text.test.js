import { describe, expect, test } from "bun:test";
import { inlineHtmlToMarkdown, normalizeRichTextContent, plainTextFromHtml, sanitizeInlineHtml, textToSafeHtml } from "../src/rich-text.js";

describe("rich text helpers", () => {
  test("escapes legacy plain text into safe inline HTML", () => {
    expect(textToSafeHtml("<hello>\nworld")).toBe("&lt;hello&gt;<br>world");
  });

  test("preserves allowed inline tags and strips unsafe markup", () => {
    const html = sanitizeInlineHtml(`<p class="x" onclick="bad()">Hi <strong>there</strong><script>alert(1)</script><a href="javascript:alert(1)">bad</a><a href="https://example.com?a=1">ok</a></p>`);
    expect(html).toContain("<strong>there</strong>");
    expect(html).toContain(`href="https://example.com/?a=1"`);
    expect(html).not.toContain("script");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("class=");
  });

  test("normalizes rich content with derived plain text", () => {
    expect(normalizeRichTextContent({ html: "A <em>small</em> note" })).toEqual({
      html: "A <em>small</em> note",
      text: "A small note",
    });
  });

  test("converts inline HTML to markdown for export", () => {
    expect(inlineHtmlToMarkdown(`A <strong>bold</strong> <a href="https://example.com/">link</a>`)).toBe("A **bold** [link](https://example.com/)");
    expect(plainTextFromHtml("A<br>B")).toBe("A B");
  });
});
