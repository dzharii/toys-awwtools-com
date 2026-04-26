import { BLOCK_TYPES } from "./constants.js";
import { createId } from "./models.js";
import { normalizeRichTextContent, textToSafeHtml } from "./rich-text.js";

export const BLOCK_TRANSFORMS = {
  [BLOCK_TYPES.paragraph]: [BLOCK_TYPES.heading, BLOCK_TYPES.quote, BLOCK_TYPES.list, BLOCK_TYPES.table, BLOCK_TYPES.code, BLOCK_TYPES.sourceLink],
  [BLOCK_TYPES.heading]: [BLOCK_TYPES.paragraph, BLOCK_TYPES.quote],
  [BLOCK_TYPES.quote]: [BLOCK_TYPES.paragraph],
  [BLOCK_TYPES.code]: [BLOCK_TYPES.paragraph],
  [BLOCK_TYPES.list]: [BLOCK_TYPES.paragraph],
  [BLOCK_TYPES.sourceLink]: [],
  [BLOCK_TYPES.table]: [],
};

export function canTransformBlock(fromType, toType) {
  return Boolean(BLOCK_TRANSFORMS[fromType]?.includes(toType));
}

/**
 * Converts block content through explicit safe transformations only.
 *
 * @param {import("./models.js").ResearchBlock} block
 * @param {string} toType
 * @returns {import("./models.js").ResearchBlock}
 */
export function transformBlock(block, toType) {
  if (block.type === toType) return block;
  if (!canTransformBlock(block.type, toType)) throw new Error(`Unsupported block transform: ${block.type} -> ${toType}`);
  const text = textFromBlock(block);
  const html = htmlFromBlock(block);
  block.type = toType;
  if (toType === BLOCK_TYPES.heading) block.content = { level: 2, html, text };
  else if (toType === BLOCK_TYPES.paragraph) block.content = { html, text };
  else if (toType === BLOCK_TYPES.quote) block.content = { text, attribution: "", sourceUrl: "" };
  else if (toType === BLOCK_TYPES.code) block.content = { language: "", text };
  else if (toType === BLOCK_TYPES.list) {
    const items = text.split(/\n+/).filter(Boolean).map((line) => ({ id: createId("item"), text: line }));
    block.content = { ordered: false, items: items.length ? items : [{ id: createId("item"), text: "" }] };
  }
  else if (toType === BLOCK_TYPES.table) {
    const col = createId("col");
    block.content = { columns: [{ id: col, label: "Notes" }], rows: [{ id: createId("row"), cells: { [col]: text } }] };
  }
  else if (toType === BLOCK_TYPES.sourceLink) block.content = { url: "", title: text, note: "", domain: "", capturedText: "", capturedAt: new Date().toISOString() };
  return block;
}

function textFromBlock(block) {
  const c = block.content || {};
  if (block.type === BLOCK_TYPES.heading || block.type === BLOCK_TYPES.paragraph) return normalizeRichTextContent(c).text;
  if (block.type === BLOCK_TYPES.quote) return c.text || "";
  if (block.type === BLOCK_TYPES.code) return c.text || "";
  if (block.type === BLOCK_TYPES.list) return (c.items || []).map((item) => item.text).join("\n");
  return c.text || "";
}

function htmlFromBlock(block) {
  const c = block.content || {};
  if (block.type === BLOCK_TYPES.heading || block.type === BLOCK_TYPES.paragraph) return normalizeRichTextContent(c).html;
  return textToSafeHtml(textFromBlock(block));
}
