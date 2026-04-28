import { APP_DATA_FORMAT_VERSION, BLOCK_SORT_STEP, BLOCK_TYPES, DEFAULT_PAGE_SUMMARY, DEFAULT_PAGE_TITLE, PAGE_SORT_STEP } from "./constants.js";
import { htmlToText, plainTextToHtml } from "./html.js";

let tempCounter = 0;

export function nowIso() {
  return new Date().toISOString();
}

export function createStableId(prefix = "id") {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  tempCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${tempCounter.toString(36)}`;
}

export function asString(value, fallback = "") {
  if (value == null) return fallback;
  return String(value);
}

export function asFiniteNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function asBoolean(value, fallback = false) {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1";
  return Boolean(value);
}

export function asObject(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

export function createSortOrder(index = 0, step = PAGE_SORT_STEP) {
  return (index + 1) * step;
}

export function createPageRecord(partial = {}) {
  const createdAt = partial.createdAt || nowIso();
  const title = asString(partial.title, DEFAULT_PAGE_TITLE).trim() || DEFAULT_PAGE_TITLE;
  return normalizePageRecord({
    id: partial.id || createStableId("page"),
    title,
    createdAt,
    updatedAt: partial.updatedAt || createdAt,
    archivedAt: partial.archivedAt ?? null,
    deletedAt: partial.deletedAt ?? null,
    sortOrder: asFiniteNumber(partial.sortOrder, createSortOrder(0, PAGE_SORT_STEP)),
    pinned: asBoolean(partial.pinned, false),
    color: partial.color ?? null,
    summary: asString(partial.summary, DEFAULT_PAGE_SUMMARY),
    metadata: asObject(partial.metadata, {}),
    dataFormatVersion: partial.dataFormatVersion || APP_DATA_FORMAT_VERSION
  });
}

function normalizeRichContent(content = {}, fallbackText = "") {
  if (typeof content === "string") {
    return {
      html: sanitizeHtmlFromText(content),
      text: content,
      level: 1
    };
  }

  const html = asString(content.html, "");
  const text = asString(content.text, htmlToText(html || fallbackText));
  const level = asFiniteNumber(content.level, 1);
  return {
    html: html || plainTextToHtml(text),
    text,
    level: Math.min(6, Math.max(1, Math.round(level)))
  };
}

function sanitizeHtmlFromText(value) {
  return plainTextToHtml(asString(value, ""));
}

function normalizeListContent(content = {}) {
  const items = Array.isArray(content.items) ? content.items.map((item) => asString(item, "").trim()) : [];
  return { items: items.filter(Boolean) };
}

function normalizeTableContent(content = {}) {
  const columns = Array.isArray(content.columns) ? content.columns.map((item) => asString(item, "").trim()) : [];
  const rows = Array.isArray(content.rows)
    ? content.rows.map((row) => Array.isArray(row) ? row.map((cell) => asString(cell, "")) : []).filter((row) => row.length > 0)
    : [];
  return { columns, rows };
}

function normalizeSourceLinkContent(content = {}) {
  const url = asString(content.url, "").trim();
  const title = asString(content.title, "").trim();
  const domain = asString(content.domain, "").trim() || deriveDomain(url);
  const note = asString(content.note, "").trim();
  const capturedText = asString(content.capturedText, "").trim();
  return { url, title, domain, note, capturedText };
}

function deriveDomain(url) {
  if (!url) return "";
  try {
    return new URL(url, "https://example.invalid/").hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeCodeContent(content = {}) {
  return {
    text: asString(content.text, ""),
    language: asString(content.language, "")
  };
}

function normalizeUnsupportedContent(content = {}) {
  return {
    raw: content?.raw ?? content ?? null
  };
}

export function normalizePageRecord(record = {}) {
  return {
    id: asString(record.id, createStableId("page")),
    title: asString(record.title, DEFAULT_PAGE_TITLE).trim() || DEFAULT_PAGE_TITLE,
    createdAt: asString(record.createdAt, nowIso()),
    updatedAt: asString(record.updatedAt, asString(record.createdAt, nowIso())),
    archivedAt: record.archivedAt ?? null,
    deletedAt: record.deletedAt ?? null,
    sortOrder: asFiniteNumber(record.sortOrder, PAGE_SORT_STEP),
    pinned: asBoolean(record.pinned, false),
    color: record.color ?? null,
    summary: asString(record.summary, DEFAULT_PAGE_SUMMARY),
    metadata: asObject(record.metadata, {}),
    dataFormatVersion: asFiniteNumber(record.dataFormatVersion, APP_DATA_FORMAT_VERSION)
  };
}

export function createBlockRecord(partial = {}) {
  const createdAt = partial.createdAt || nowIso();
  const type = BLOCK_TYPES.includes(partial.type) ? partial.type : "paragraph";
  const record = {
    id: partial.id || createStableId("block"),
    pageId: asString(partial.pageId, ""),
    type,
    sortOrder: asFiniteNumber(partial.sortOrder, BLOCK_SORT_STEP),
    source: partial.source ?? null,
    createdAt,
    updatedAt: partial.updatedAt || createdAt,
    archivedAt: partial.archivedAt ?? null,
    deletedAt: partial.deletedAt ?? null,
    metadata: asObject(partial.metadata, {}),
    contentVersion: asFiniteNumber(partial.contentVersion, 1)
  };

  switch (type) {
    case "paragraph":
    case "heading":
    case "quote":
      record.content = normalizeRichContent(partial.content, partial.content?.text || "");
      break;
    case "list":
      record.content = normalizeListContent(partial.content);
      break;
    case "table":
      record.content = normalizeTableContent(partial.content);
      break;
    case "code":
      record.content = normalizeCodeContent(partial.content);
      break;
    case "sourceLink":
      record.content = normalizeSourceLinkContent(partial.content);
      break;
    default:
      record.type = "unsupported";
      record.content = normalizeUnsupportedContent(partial.content);
      break;
  }

  return normalizeBlockRecord(record);
}

export function normalizeBlockRecord(record = {}) {
  const type = BLOCK_TYPES.includes(record.type) ? record.type : "unsupported";
  const base = {
    id: asString(record.id, createStableId("block")),
    pageId: asString(record.pageId, ""),
    type,
    sortOrder: asFiniteNumber(record.sortOrder, BLOCK_SORT_STEP),
    source: record.source ?? null,
    createdAt: asString(record.createdAt, nowIso()),
    updatedAt: asString(record.updatedAt, asString(record.createdAt, nowIso())),
    archivedAt: record.archivedAt ?? null,
    deletedAt: record.deletedAt ?? null,
    metadata: asObject(record.metadata, {}),
    contentVersion: asFiniteNumber(record.contentVersion, 1)
  };

  switch (type) {
    case "paragraph":
    case "heading":
    case "quote":
      base.content = normalizeRichContent(record.content, record.content?.text || "");
      break;
    case "list":
      base.content = normalizeListContent(record.content);
      break;
    case "table":
      base.content = normalizeTableContent(record.content);
      break;
    case "code":
      base.content = normalizeCodeContent(record.content);
      break;
    case "sourceLink":
      base.content = normalizeSourceLinkContent(record.content);
      break;
    default:
      base.type = "unsupported";
      base.content = normalizeUnsupportedContent(record.content);
      break;
  }

  return base;
}

export function clonePageRecord(page, patch = {}) {
  return normalizePageRecord({ ...page, ...patch, updatedAt: nowIso() });
}

export function cloneBlockRecord(block, patch = {}) {
  return normalizeBlockRecord({ ...block, ...patch, updatedAt: nowIso() });
}

export function isRichTextBlock(block) {
  return block?.type === "paragraph" || block?.type === "heading" || block?.type === "quote";
}

export function getBlockPlainText(block) {
  if (!block) return "";
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return asString(block.content?.text, htmlToText(block.content?.html || ""));
    case "list":
      return (block.content?.items || []).join("\n");
    case "table":
      return [
        ...(block.content?.columns || []),
        ...((block.content?.rows || []).flat())
      ].join(" ");
    case "code":
      return asString(block.content?.text, "");
    case "sourceLink":
      return [
        block.content?.title,
        block.content?.url,
        block.content?.domain,
        block.content?.note,
        block.content?.capturedText
      ].filter(Boolean).join(" ");
    case "unsupported":
      return JSON.stringify(block.content?.raw ?? block.content ?? {});
    default:
      return "";
  }
}

export function getPagePlainText(page) {
  return [page?.title, page?.summary].filter(Boolean).join(" ");
}

export function compareBySortOrder(a, b) {
  return asFiniteNumber(a.sortOrder, 0) - asFiniteNumber(b.sortOrder, 0) || String(a.id).localeCompare(String(b.id));
}

export function sortPages(pages = []) {
  return [...pages].sort(compareBySortOrder);
}

export function sortBlocks(blocks = []) {
  return [...blocks].sort(compareBySortOrder);
}

export function nextSortOrder(items = [], step = PAGE_SORT_STEP) {
  if (!items.length) return step;
  return Math.max(...items.map((item) => asFiniteNumber(item.sortOrder, 0))) + step;
}
