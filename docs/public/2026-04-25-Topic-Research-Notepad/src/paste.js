import { BLOCK_TYPES } from "./constants.js";
import { createBlock, createId, deriveDomain } from "./models.js";
import { createLogger } from "./observability/logger.js";

const logger = createLogger("Paste");

/**
 * Converts untrusted clipboard input into internal block records. HTML is parsed
 * in a detached document and only semantic text/table/list/code/link data is kept.
 *
 * @param {{ pageId: string, html?: string, text?: string }} input
 * @returns {import("./models.js").ResearchBlock[]}
 */
export function blocksFromClipboard({ pageId, html = "", text = "" }) {
  if (html && typeof DOMParser !== "undefined") {
    logger.debug("Converting HTML clipboard payload", { context: { pageId, htmlLength: html.length, textLength: text.length } });
    return blocksFromHtml({ pageId, html });
  }
  if (html && typeof DOMParser === "undefined") logger.warn("DOMParser unavailable; falling back to stripped plain text", { context: { pageId, htmlLength: html.length } });
  return blocksFromPlainText({ pageId, text: text || stripTags(html) });
}

export function blocksFromPlainText({ pageId, text }) {
  const chunks = String(text || "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const blocks = (chunks.length ? chunks : [""]).map((part, index) => createBlock({
    pageId,
    type: looksLikeCode(part) ? BLOCK_TYPES.code : BLOCK_TYPES.paragraph,
    sortOrder: (index + 1) * 1000,
    content: looksLikeCode(part) ? { language: "", text: part } : { text: part },
    source: null,
  }));
  logger.debug("Converted plain text clipboard payload", { context: { pageId, chunkCount: chunks.length, blockCount: blocks.length } });
  return blocks;
}

function blocksFromHtml({ pageId, html }) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const unsafeNodes = doc.querySelectorAll("script,style,iframe,object,embed,link,meta");
  unsafeNodes.forEach((node) => node.remove());
  const blocks = [];
  for (const child of doc.body.children) {
    const converted = elementToBlock(pageId, child);
    if (converted) blocks.push(...(Array.isArray(converted) ? converted : [converted]));
  }
  if (!blocks.length) {
    logger.warn("HTML clipboard produced no semantic blocks; falling back to plain text", { context: { pageId, removedNodeCount: unsafeNodes.length } });
    return blocksFromPlainText({ pageId, text: doc.body.textContent || "" });
  }
  logger.info("Converted HTML clipboard payload", { context: { pageId, removedNodeCount: unsafeNodes.length, blockCount: blocks.length } });
  return blocks.map((block, index) => ({ ...block, sortOrder: (index + 1) * 1000 }));
}

function elementToBlock(pageId, element) {
  const tag = element.tagName.toLowerCase();
  const text = collapseText(element.textContent || "");
  if (!text && tag !== "table") return null;
  if (/^h[1-6]$/.test(tag)) {
    return createBlock({ pageId, type: BLOCK_TYPES.heading, content: { level: Math.min(3, Number(tag.slice(1))), text } });
  }
  if (tag === "blockquote") {
    return createBlock({ pageId, type: BLOCK_TYPES.quote, content: { text, attribution: "", sourceUrl: "" } });
  }
  if (tag === "pre" || tag === "code") {
    return createBlock({ pageId, type: BLOCK_TYPES.code, content: { language: "", text: element.textContent || "" } });
  }
  if (tag === "ul" || tag === "ol") {
    const items = [...element.querySelectorAll(":scope > li")].map((li) => ({ id: createId("item"), text: collapseText(li.textContent || "") })).filter((item) => item.text);
    return createBlock({ pageId, type: BLOCK_TYPES.list, content: { ordered: tag === "ol", items } });
  }
  if (tag === "table") {
    const rows = [...element.querySelectorAll("tr")].map((tr) => [...tr.children].map((cell) => collapseText(cell.textContent || ""))).filter((row) => row.length);
    if (!rows.length) return null;
    const first = rows[0];
    const columns = first.map((label, index) => ({ id: createId("col"), label: label || `Column ${index + 1}` }));
    return createBlock({
      pageId,
      type: BLOCK_TYPES.table,
      content: {
        columns,
        rows: rows.slice(1).map((row) => ({
          id: createId("row"),
          cells: Object.fromEntries(columns.map((col, index) => [col.id, row[index] || ""])),
        })),
      },
    });
  }
  const link = element.matches("a[href]") ? element : element.querySelector("a[href]");
  if (link && text === collapseText(link.textContent || "")) {
    const url = link.getAttribute("href") || "";
    return createBlock({
      pageId,
      type: BLOCK_TYPES.sourceLink,
      content: { url, title: text, note: "", domain: deriveDomain(url), capturedText: "", capturedAt: new Date().toISOString() },
    });
  }
  if (["p", "div", "section", "article", "main"].includes(tag)) {
    return createBlock({ pageId, type: BLOCK_TYPES.paragraph, content: { text } });
  }
  return createBlock({ pageId, type: BLOCK_TYPES.paragraph, content: { text } });
}

function collapseText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}

function looksLikeCode(value) {
  return /[{}`;]|^\s*(const|let|function|class|import|export|SELECT|curl)\b/m.test(value);
}
