import { describe, expect, test } from "bun:test";
import { createBlockRecord, createPageRecord, getBlockPlainText, normalizeBlockRecord, normalizePageRecord } from "../src/shared/models.js";
import { pageToMarkdown, workspaceToBackupJson } from "../src/shared/export.js";
import { searchWorkspace } from "../src/shared/search.js";

describe("shared models", () => {
  test("normalizes pages and derives source domains", () => {
    const page = normalizePageRecord({ title: "  Example  " });
    expect(page.title).toBe("Example");

    const source = createBlockRecord({
      type: "sourceLink",
      pageId: page.id,
      content: { url: "https://example.com/articles/1" }
    });

    expect(source.content.domain).toBe("example.com");
    expect(getBlockPlainText(source)).toContain("example.com");
  });

  test("normalizes rich text and search picks up page and block text", () => {
    const page = createPageRecord({ title: "Payment API notes" });
    const block = normalizeBlockRecord({
      id: "block-1",
      pageId: page.id,
      type: "paragraph",
      content: { html: "<strong>Retry</strong> logic", text: "Retry logic" }
    });

    const results = searchWorkspace({ pages: [page], blocks: [block] }, "retry");
    expect(results.some((result) => result.kind === "block")).toBe(true);
    expect(results.some((result) => result.kind === "page")).toBe(false);
  });

  test("exports markdown and backup json with supported blocks", () => {
    const page = createPageRecord({ title: "Research page" });
    const blocks = [
      createBlockRecord({ id: "b1", pageId: page.id, type: "heading", content: { level: 2, html: "Overview", text: "Overview" } }),
      createBlockRecord({ id: "b2", pageId: page.id, type: "paragraph", content: { html: "<strong>Key</strong> point", text: "Key point" } }),
      createBlockRecord({ id: "b3", pageId: page.id, type: "list", content: { items: ["One", "Two"] } }),
      createBlockRecord({ id: "b4", pageId: page.id, type: "table", content: { columns: ["A", "B"], rows: [["1", "2"]] } }),
      createBlockRecord({ id: "b5", pageId: page.id, type: "code", content: { text: "console.log(1);", language: "js" } })
    ];

    const markdown = pageToMarkdown(page, blocks);
    expect(markdown).toContain("# Research page");
    expect(markdown).toContain("## Overview");
    expect(markdown).toContain("Key point");
    expect(markdown).toContain("- One");
    expect(markdown).toContain("| A | B |");
    expect(markdown).toContain("```js");

    const backup = workspaceToBackupJson({ pages: [page], blocks, settings: [{ key: "sidebarWidth", value: 320 }] });
    expect(backup.exportFormatVersion).toBe(1);
    expect(backup.pages.length).toBe(1);
    expect(backup.blocks.length).toBe(5);
  });
});

test("app module can be imported and instantiated without bootstrapping", async () => {
  const { ResearchNotepadApp } = await import("../src/app.js");
  const root = { replaceChildren() {}, prepend() {} };
  const app = new ResearchNotepadApp(root);
  expect(app.selectedPageId).toBeNull();
});
