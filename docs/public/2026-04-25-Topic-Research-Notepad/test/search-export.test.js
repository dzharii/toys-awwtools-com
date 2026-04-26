import { expect, test } from "bun:test";
import { pageToMarkdown, workspaceToBackup } from "../src/exporters.js";
import { textForBlock } from "../src/search.js";

const page = { id: "p1", title: "Payment API notes" };

test("extracts searchable text from supported block types", () => {
  expect(textForBlock({ type: "sourceLink", content: { title: "Docs", url: "https://example.com", note: "idempotency" } })).toContain("idempotency");
  expect(textForBlock({ type: "table", content: { columns: [{ id: "c1", label: "Tool" }], rows: [{ cells: { c1: "Dexie" } }] } })).toContain("Dexie");
  expect(textForBlock({ type: "list", content: { items: [{ text: "Check retry" }] } })).toContain("Check retry");
});

test("exports all MVP block types to Markdown", () => {
  const markdown = pageToMarkdown(page, [
    { type: "heading", content: { level: 2, text: "Authentication" } },
    { type: "paragraph", content: { text: "Use a stable token." } },
    { type: "quote", content: { text: "Tokens expire quickly.", attribution: "Docs", sourceUrl: "https://example.com" } },
    { type: "list", content: { ordered: false, items: [{ text: "Check refresh" }] } },
    { type: "table", content: { columns: [{ id: "c1", label: "Library" }], rows: [{ cells: { c1: "A" } }] } },
    { type: "code", content: { language: "js", text: "const ok = true;" } },
    { type: "sourceLink", content: { title: "Docs", url: "https://example.com", note: "Primary source" } },
  ]);
  expect(markdown).toContain("# Payment API notes");
  expect(markdown).toContain("## Authentication");
  expect(markdown).toContain("| Library |");
  expect(markdown).toContain("```js");
  expect(markdown).toContain("Primary source");
});

test("JSON backup includes explicit format metadata", () => {
  const backup = workspaceToBackup({ pages: [page], blocks: [] });
  expect(backup.format).toBe("topic-research-notepad-backup");
  expect(backup.exportFormatVersion).toBe(1);
  expect(backup.pages).toHaveLength(1);
});
