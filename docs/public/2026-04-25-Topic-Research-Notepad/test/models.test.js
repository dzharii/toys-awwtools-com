import { expect, test } from "bun:test";
import { BLOCK_TYPES } from "../src/constants.js";
import { createBlock, createPage, normalizeBlock, normalizePage } from "../src/models.js";

test("creates normalized pages with stable metadata fields", () => {
  const page = createPage({ title: "Auth library comparison", sortOrder: 2000 });
  expect(page.id.startsWith("page_")).toBe(true);
  expect(page.title).toBe("Auth library comparison");
  expect(page.sortOrder).toBe(2000);
  expect(page.archivedAt).toBe(null);
});

test("normalizes missing page fields with safe defaults", () => {
  const page = normalizePage({ id: "p1", title: "" });
  expect(page.title).toBe("Untitled research");
  expect(page.metadata).toEqual({});
});

test("creates and normalizes table blocks defensively", () => {
  const block = createBlock({ pageId: "p1", type: BLOCK_TYPES.table });
  expect(block.content.columns.length).toBe(2);
  const malformed = normalizeBlock({ id: "b1", pageId: "p1", type: BLOCK_TYPES.table, content: { rows: [{ cells: { nope: 1 } }] } });
  expect(malformed.content.columns.length).toBe(1);
  expect(Object.keys(malformed.content.rows[0].cells)).toEqual([malformed.content.columns[0].id]);
});

test("unknown block types preserve raw content", () => {
  const block = normalizeBlock({ id: "b1", pageId: "p1", type: "diagram", content: { nodes: [1] } });
  expect(block.type).toBe("diagram");
  expect(block.content.raw).toEqual({ nodes: [1] });
});
