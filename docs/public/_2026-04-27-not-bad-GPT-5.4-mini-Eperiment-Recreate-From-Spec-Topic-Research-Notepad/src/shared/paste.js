import { htmlToText, plainTextToHtml, sanitizeInlineHtml } from "./html.js";
import { createBlockRecord } from "./models.js";

const BLOCK_TAGS = new Set(["P", "DIV", "BLOCKQUOTE", "UL", "OL", "TABLE", "PRE", "H1", "H2", "H3", "H4", "H5", "H6", "HR"]);
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

function parseHtml(html) {
  if (typeof DOMParser === "undefined") return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${String(html ?? "")}</div>`, "text/html");
  return doc.body.firstElementChild || doc.body;
}

function isBlockElement(node) {
  return node && node.nodeType === ELEMENT_NODE && BLOCK_TAGS.has(node.tagName.toUpperCase());
}

function flushParagraph(buffer, blocks) {
  const html = buffer.html.trim();
  const text = buffer.text.trim();
  if (!html && !text) return;
  blocks.push(createBlockRecord({
    type: buffer.type || "paragraph",
    content: {
      html: html || plainTextToHtml(text),
      text
    }
  }));
  buffer.html = "";
  buffer.text = "";
  buffer.type = "paragraph";
}

function tableFromElement(table) {
  const rows = [];
  let columns = [];
  for (const tr of table.querySelectorAll("tr")) {
    const cells = [...tr.querySelectorAll("th,td")].map((cell) => htmlToText(cell.innerHTML));
    if (!columns.length && tr.querySelectorAll("th").length) {
      columns = cells.length ? cells : [];
      continue;
    }
    if (cells.length) rows.push(cells);
  }
  if (!columns.length && rows[0]) {
    columns = rows[0].map((_, index) => `Column ${index + 1}`);
  }
  return { columns, rows };
}

function listFromElement(list) {
  return [...list.querySelectorAll(":scope > li")].map((item) => htmlToText(item.innerHTML));
}

function captureBlockFromElement(node, blocks, buffer) {
  const tag = node.tagName.toUpperCase();
  if (tag === "BR") {
    buffer.html += "<br>";
    buffer.text += "\n";
    return;
  }

  flushParagraph(buffer, blocks);

  if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4" || tag === "H5" || tag === "H6") {
    const level = Number(tag.slice(1));
    const text = htmlToText(node.innerHTML);
    blocks.push(createBlockRecord({
      type: "heading",
      content: { level, html: sanitizeInlineHtml(node.innerHTML), text }
    }));
    return;
  }

  if (tag === "P" || tag === "DIV") {
    const html = sanitizeInlineHtml(node.innerHTML);
    const text = htmlToText(node.innerHTML);
    if (html || text) {
      blocks.push(createBlockRecord({
        type: "paragraph",
        content: { html, text }
      }));
    }
    return;
  }

  if (tag === "BLOCKQUOTE") {
    const html = sanitizeInlineHtml(node.innerHTML);
    const text = htmlToText(node.innerHTML);
    blocks.push(createBlockRecord({
      type: "quote",
      content: { html, text }
    }));
    return;
  }

  if (tag === "UL" || tag === "OL") {
    blocks.push(createBlockRecord({
      type: "list",
      content: { items: listFromElement(node) }
    }));
    return;
  }

  if (tag === "TABLE") {
    blocks.push(createBlockRecord({
      type: "table",
      content: tableFromElement(node)
    }));
    return;
  }

  if (tag === "PRE") {
    blocks.push(createBlockRecord({
      type: "code",
      content: { text: node.textContent || "", language: "" }
    }));
    return;
  }

  if (tag === "HR") {
    blocks.push(createBlockRecord({
      type: "paragraph",
      content: { html: "<br>", text: "" }
    }));
    return;
  }

  const html = sanitizeInlineHtml(node.innerHTML);
  const text = htmlToText(node.innerHTML);
  if (html || text) {
    buffer.html += html;
    buffer.text += text;
  }
}

function plainTextToBlocks(text) {
  const normalized = String(text ?? "").replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n\s*\n+/).map((part) => part.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    return paragraphs.map((part) => createBlockRecord({
      type: "paragraph",
      content: { html: plainTextToHtml(part).replace(/\n/g, "<br>"), text: part }
    }));
  }

  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const listLike = lines.length > 1 && lines.every((line) => /^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line));
  if (listLike) {
    return [createBlockRecord({
      type: "list",
      content: {
        items: lines.map((line) => line.replace(/^[-*+]\s+|^\d+\.\s+/, "").trim())
      }
    })];
  }

  return [createBlockRecord({
    type: "paragraph",
    content: { html: plainTextToHtml(normalized), text: normalized }
  })];
}

export function clipboardPayloadToInsertions({ html = "", text = "" } = {}) {
  const dom = parseHtml(html);
  if (!dom) {
    return { mode: "blocks", blocks: plainTextToBlocks(text || htmlToText(html)) };
  }

  const blocks = [];
  const buffer = { html: "", text: "", type: "paragraph" };

  for (const node of [...dom.childNodes]) {
    if (node.nodeType === TEXT_NODE) {
      const value = htmlToText(node.textContent || "");
      if (value) {
        buffer.html += plainTextToHtml(value);
        buffer.text += value;
      }
      continue;
    }

    if (node.nodeType === ELEMENT_NODE && isBlockElement(node)) {
      captureBlockFromElement(node, blocks, buffer);
      continue;
    }

    if (node.nodeType === ELEMENT_NODE) {
      buffer.html += sanitizeInlineHtml(node.innerHTML || node.outerHTML || "");
      buffer.text += htmlToText(node.innerHTML || node.outerHTML || "");
    }
  }

  flushParagraph(buffer, blocks);

  if (blocks.length > 1) return { mode: "blocks", blocks };

  const inlineHtml = sanitizeInlineHtml(html);
  const inlineText = htmlToText(html) || text;
  if (inlineHtml || inlineText) return { mode: "inline", html: inlineHtml, text: inlineText };
  return { mode: "blocks", blocks: plainTextToBlocks(text || htmlToText(html)) };
}
