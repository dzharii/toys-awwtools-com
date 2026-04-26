import { APP_DATA_FORMAT_VERSION, BLOCK_TYPES } from "./constants.js";

export const nowIso = () => new Date().toISOString();

export function createId(prefix) {
  const value = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${value}`;
}

/**
 * @typedef {Object} ResearchPage
 * @property {string} id
 * @property {string} title
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} sortOrder
 * @property {string|null} archivedAt
 * @property {string|null} deletedAt
 * @property {boolean} pinned
 * @property {string|null} color
 * @property {string} summary
 * @property {Record<string, unknown>} metadata
 */

/**
 * @typedef {Object} ResearchBlock
 * @property {string} id
 * @property {string} pageId
 * @property {string} type
 * @property {number} sortOrder
 * @property {Record<string, unknown>} content
 * @property {Record<string, unknown>|null} source
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} archivedAt
 * @property {string|null} deletedAt
 * @property {number} contentVersion
 * @property {Record<string, unknown>} metadata
 */

export function createPage({ title = "Untitled research", sortOrder = 1000 } = {}) {
  const stamp = nowIso();
  return normalizePage({
    id: createId("page"),
    title,
    createdAt: stamp,
    updatedAt: stamp,
    sortOrder,
  });
}

export function createBlock({ pageId, type = BLOCK_TYPES.paragraph, content, sortOrder = 1000, source = null } = {}) {
  const stamp = nowIso();
  return normalizeBlock({
    id: createId("block"),
    pageId,
    type,
    sortOrder,
    content: content ?? defaultContentForType(type),
    source,
    createdAt: stamp,
    updatedAt: stamp,
  });
}

export function normalizePage(page = {}) {
  return {
    id: String(page.id || createId("page")),
    title: String(page.title || "Untitled research"),
    createdAt: page.createdAt || nowIso(),
    updatedAt: page.updatedAt || page.createdAt || nowIso(),
    archivedAt: page.archivedAt ?? null,
    deletedAt: page.deletedAt ?? null,
    sortOrder: Number.isFinite(page.sortOrder) ? page.sortOrder : 1000,
    pinned: Boolean(page.pinned),
    color: page.color ?? null,
    summary: String(page.summary || ""),
    metadata: isPlainObject(page.metadata) ? page.metadata : {},
    dataFormatVersion: page.dataFormatVersion ?? APP_DATA_FORMAT_VERSION,
  };
}

export function normalizeBlock(block = {}) {
  const type = Object.values(BLOCK_TYPES).includes(block.type) ? block.type : String(block.type || "unknown");
  return {
    id: String(block.id || createId("block")),
    pageId: String(block.pageId || ""),
    type,
    sortOrder: Number.isFinite(block.sortOrder) ? block.sortOrder : 1000,
    content: normalizeContent(type, block.content),
    source: isPlainObject(block.source) ? block.source : null,
    createdAt: block.createdAt || nowIso(),
    updatedAt: block.updatedAt || block.createdAt || nowIso(),
    archivedAt: block.archivedAt ?? null,
    deletedAt: block.deletedAt ?? null,
    contentVersion: Number.isFinite(block.contentVersion) ? block.contentVersion : 1,
    metadata: isPlainObject(block.metadata) ? block.metadata : {},
  };
}

export function defaultContentForType(type) {
  switch (type) {
    case BLOCK_TYPES.heading:
      return { level: 2, text: "" };
    case BLOCK_TYPES.quote:
      return { text: "", attribution: "", sourceUrl: "" };
    case BLOCK_TYPES.list:
      return { ordered: false, items: [{ id: createId("item"), text: "" }] };
    case BLOCK_TYPES.table: {
      const c1 = createId("col");
      const c2 = createId("col");
      return {
        columns: [{ id: c1, label: "Column 1" }, { id: c2, label: "Column 2" }],
        rows: [{ id: createId("row"), cells: { [c1]: "", [c2]: "" } }],
      };
    }
    case BLOCK_TYPES.code:
      return { language: "", text: "" };
    case BLOCK_TYPES.sourceLink:
      return { url: "", title: "", note: "", domain: "", capturedText: "", capturedAt: nowIso() };
    default:
      return { text: "" };
  }
}

export function normalizeContent(type, content) {
  const value = isPlainObject(content) ? content : {};
  switch (type) {
    case BLOCK_TYPES.heading:
      return { level: clampHeading(value.level), text: String(value.text || "") };
    case BLOCK_TYPES.quote:
      return { text: String(value.text || ""), attribution: String(value.attribution || ""), sourceUrl: String(value.sourceUrl || "") };
    case BLOCK_TYPES.list:
      return {
        ordered: Boolean(value.ordered),
        items: Array.isArray(value.items) && value.items.length
          ? value.items.map((item) => ({ id: String(item.id || createId("item")), text: String(item.text || "") }))
          : [{ id: createId("item"), text: "" }],
      };
    case BLOCK_TYPES.table:
      return normalizeTable(value);
    case BLOCK_TYPES.code:
      return { language: String(value.language || ""), text: String(value.text || "") };
    case BLOCK_TYPES.sourceLink:
      return normalizeSourceLink(value);
    case BLOCK_TYPES.paragraph:
      return { text: String(value.text || "") };
    default:
      return { raw: value, text: String(value.text || "") };
  }
}

export function normalizeSourceLink(value) {
  const url = String(value.url || "");
  return {
    url,
    title: String(value.title || ""),
    note: String(value.note || ""),
    domain: String(value.domain || deriveDomain(url)),
    capturedText: String(value.capturedText || ""),
    capturedAt: value.capturedAt || nowIso(),
  };
}

export function normalizeTable(value) {
  const columns = Array.isArray(value.columns) && value.columns.length
    ? value.columns.map((col, index) => ({ id: String(col.id || createId("col")), label: String(col.label || `Column ${index + 1}`) }))
    : [{ id: createId("col"), label: "Column 1" }];
  const rows = Array.isArray(value.rows) && value.rows.length ? value.rows : [{ cells: {} }];
  return {
    columns,
    rows: rows.map((row) => ({
      id: String(row.id || createId("row")),
      cells: Object.fromEntries(columns.map((col) => [col.id, String(row.cells?.[col.id] ?? "")])),
    })),
  };
}

export function deriveDomain(url) {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}

export function sortByOrder(records) {
  return [...records].sort((a, b) => (a.sortOrder - b.sortOrder) || a.createdAt.localeCompare(b.createdAt));
}

function clampHeading(level) {
  const numeric = Number(level);
  return Number.isFinite(numeric) ? Math.min(3, Math.max(1, Math.round(numeric))) : 2;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
