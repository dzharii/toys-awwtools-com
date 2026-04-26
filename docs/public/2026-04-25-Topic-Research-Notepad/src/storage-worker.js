/* global Dexie */
try {
  importScripts("./vendor-libs/dexie-4.2.0.js");
} catch {
  importScripts("../vendor-libs/dexie-4.2.0.js");
}

const DB_NAME = "TopicResearchNotepadDB";
const DB_VERSION = 1;
const APP_DATA_FORMAT_VERSION = 1;
const WORKER_PROTOCOL_VERSION = 1;

const db = new Dexie(DB_NAME);
db.version(DB_VERSION).stores({
  pages: "id, updatedAt, archivedAt, sortOrder, pinned",
  blocks: "id, pageId, [pageId+sortOrder], updatedAt, type, deletedAt",
  searchIndex: "id, pageId, blockId, kind, blockType, updatedAt",
  settings: "key, updatedAt",
});

self.addEventListener("message", async (event) => {
  const { requestId, type, protocolVersion, payload = {} } = event.data || {};
  try {
    if (protocolVersion !== WORKER_PROTOCOL_VERSION) throw structuredError("PROTOCOL_VERSION_MISMATCH", "Storage worker protocol version mismatch.");
    const data = await handleRequest(type, payload);
    self.postMessage({ requestId, ok: true, type: `${type}:result`, protocolVersion: WORKER_PROTOCOL_VERSION, data });
  } catch (error) {
    self.postMessage({ requestId, ok: false, type: `${type}:error`, protocolVersion: WORKER_PROTOCOL_VERSION, error: toError(error) });
  }
});

async function handleRequest(type, payload) {
  switch (type) {
    case "hello":
      await db.open();
      return { dbName: DB_NAME, dbVersion: DB_VERSION, dataFormatVersion: APP_DATA_FORMAT_VERSION };
    case "loadWorkspace":
      return loadWorkspace();
    case "createPage":
      return createPage(payload.page, payload.blocks || []);
    case "updatePage":
      return updatePage(payload.page);
    case "updateBlock":
      return updateBlock(payload.block);
    case "replaceBlocks":
      return replaceBlocks(payload.pageId, payload.blocks || []);
    case "deleteBlock":
      return deleteBlock(payload.blockId);
    case "reorderPages":
      return reorderPages(payload.pages || []);
    case "reorderBlocks":
      return reorderBlocks(payload.blocks || []);
    case "setSetting":
      return setSetting(payload.key, payload.value);
    case "search":
      return search(payload.query || "");
    case "exportWorkspace":
      return loadWorkspace();
    default:
      throw structuredError("UNKNOWN_MESSAGE", `Unknown storage message: ${type}`);
  }
}

async function loadWorkspace() {
  const [pages, blocks, settings] = await Promise.all([
    db.pages.where("deletedAt").equals(null).catch(() => db.pages.toArray()),
    db.blocks.where("deletedAt").equals(null).catch(() => db.blocks.toArray()),
    db.settings.toArray(),
  ]);
  return {
    pages: pages.filter((page) => !page.deletedAt && !page.archivedAt).sort(byOrder),
    blocks: blocks.filter((block) => !block.deletedAt).sort(byOrder),
    settings: Object.fromEntries(settings.map((item) => [item.key, item.value])),
  };
}

async function createPage(page, blocks) {
  await db.transaction("rw", db.pages, db.blocks, db.searchIndex, db.settings, async () => {
    await db.pages.put(page);
    await db.blocks.bulkPut(blocks);
    await indexPage(page);
    await Promise.all(blocks.map(indexBlock));
    await setSetting("selectedPageId", page.id);
  });
  return { page, blocks };
}

async function updatePage(page) {
  await db.transaction("rw", db.pages, db.searchIndex, async () => {
    await db.pages.put(page);
    await indexPage(page);
  });
  return page;
}

async function updateBlock(block) {
  await db.transaction("rw", db.blocks, db.searchIndex, async () => {
    await db.blocks.put(block);
    await indexBlock(block);
  });
  return block;
}

async function replaceBlocks(pageId, blocks) {
  await db.transaction("rw", db.blocks, db.searchIndex, async () => {
    await db.blocks.bulkPut(blocks);
    await Promise.all(blocks.map(indexBlock));
  });
  return { pageId, blocks };
}

async function deleteBlock(blockId) {
  const updatedAt = new Date().toISOString();
  await db.transaction("rw", db.blocks, db.searchIndex, async () => {
    await db.blocks.update(blockId, { deletedAt: updatedAt, updatedAt });
    await db.searchIndex.delete(`block:${blockId}`);
  });
  return { blockId };
}

async function reorderPages(pages) {
  await db.pages.bulkPut(pages);
  return pages;
}

async function reorderBlocks(blocks) {
  await db.blocks.bulkPut(blocks);
  await Promise.all(blocks.map(indexBlock));
  return blocks;
}

async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: new Date().toISOString() });
  return { key, value };
}

async function search(query) {
  const needle = normalizeSearchText(query);
  if (!needle) return [];
  const [entries, pages] = await Promise.all([db.searchIndex.toArray(), db.pages.toArray()]);
  const pageById = new Map(pages.map((page) => [page.id, page]));
  return entries
    .filter((entry) => entry.text.includes(needle))
    .filter((entry) => !pageById.get(entry.pageId)?.archivedAt)
    .slice(0, 50)
    .map((entry) => ({ ...entry, pageTitle: pageById.get(entry.pageId)?.title || "Untitled research" }));
}

async function indexPage(page) {
  await db.searchIndex.put({
    id: `page:${page.id}`,
    pageId: page.id,
    blockId: null,
    kind: "pageTitle",
    blockType: null,
    text: normalizeSearchText(page.title),
    rawPreview: page.title,
    updatedAt: new Date().toISOString(),
  });
}

async function indexBlock(block) {
  await db.searchIndex.put({
    id: `block:${block.id}`,
    pageId: block.pageId,
    blockId: block.id,
    kind: "block",
    blockType: block.type,
    text: normalizeSearchText(textForBlock(block)),
    rawPreview: previewText(textForBlock(block)),
    updatedAt: new Date().toISOString(),
  });
}

function textForBlock(block) {
  const c = block.content || {};
  if (block.type === "list") return (c.items || []).map((item) => item.text).join(" ");
  if (block.type === "table") return [...(c.columns || []).map((col) => col.label), ...(c.rows || []).flatMap((row) => Object.values(row.cells || {}))].join(" ");
  if (block.type === "sourceLink") return [c.title, c.url, c.domain, c.note, c.capturedText].join(" ");
  if (block.type === "quote") return [c.text, c.attribution, c.sourceUrl].join(" ");
  if (block.type === "code") return [c.language, c.text].join(" ");
  return c.text || JSON.stringify(c);
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function previewText(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 159)}...` : text;
}

function byOrder(a, b) {
  return (a.sortOrder - b.sortOrder) || String(a.createdAt).localeCompare(String(b.createdAt));
}

function structuredError(code, message) {
  return Object.assign(new Error(message), { code });
}

function toError(error) {
  return { code: error.code || "STORAGE_ERROR", message: error.message || String(error) };
}
