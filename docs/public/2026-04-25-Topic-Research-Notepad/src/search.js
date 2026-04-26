import { BLOCK_TYPES } from "./constants.js";

export function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function textForBlock(block) {
  const c = block?.content || {};
  switch (block?.type) {
    case BLOCK_TYPES.heading:
    case BLOCK_TYPES.paragraph:
      return c.text || "";
    case BLOCK_TYPES.quote:
      return [c.text, c.attribution, c.sourceUrl].filter(Boolean).join(" ");
    case BLOCK_TYPES.list:
      return Array.isArray(c.items) ? c.items.map((item) => item.text).join(" ") : "";
    case BLOCK_TYPES.table:
      return [
        ...(c.columns || []).map((col) => col.label),
        ...(c.rows || []).flatMap((row) => Object.values(row.cells || {})),
      ].join(" ");
    case BLOCK_TYPES.code:
      return [c.language, c.text].filter(Boolean).join(" ");
    case BLOCK_TYPES.sourceLink:
      return [c.title, c.url, c.domain, c.note, c.capturedText].filter(Boolean).join(" ");
    default:
      return JSON.stringify(c);
  }
}

export function previewText(value, max = 160) {
  const collapsed = String(value || "").replace(/\s+/g, " ").trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}...` : collapsed;
}

export function indexEntriesForPage(page, blocks = [], stamp = new Date().toISOString()) {
  const pageText = page?.title || "";
  return [
    {
      id: `page:${page.id}`,
      pageId: page.id,
      blockId: null,
      kind: "pageTitle",
      blockType: null,
      text: normalizeSearchText(pageText),
      rawPreview: previewText(pageText),
      updatedAt: stamp,
    },
    ...blocks.map((block) => {
      const raw = textForBlock(block);
      return {
        id: `block:${block.id}`,
        pageId: block.pageId,
        blockId: block.id,
        kind: "block",
        blockType: block.type,
        text: normalizeSearchText(raw),
        rawPreview: previewText(raw),
        updatedAt: stamp,
      };
    }),
  ];
}
