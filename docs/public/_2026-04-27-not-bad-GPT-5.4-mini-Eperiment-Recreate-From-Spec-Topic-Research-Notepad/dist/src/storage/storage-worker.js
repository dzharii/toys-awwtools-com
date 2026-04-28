import "../../vendor-libs/dexie-4.2.0.js";
import { createLogger } from "../observability/worker-logger.js";
import {
  APP_DATA_FORMAT_VERSION,
  BLOCK_STORE,
  DB_NAME,
  DB_VERSION,
  OPERATIONS_STORE,
  PAGE_STORE,
  SEARCH_INDEX_STORE,
  SETTINGS_STORE,
  WORKER_PROTOCOL_VERSION
} from "../shared/constants.js";
import {
  cloneBlockRecord,
  clonePageRecord,
  createBlockRecord,
  createPageRecord,
  getBlockPlainText,
  getPagePlainText,
  normalizeBlockRecord,
  normalizePageRecord,
  sortBlocks,
  sortPages
} from "../shared/models.js";

const log = createLogger("StorageWorker");
const Dexie = globalThis.Dexie;

/** @type {Dexie | null} */
let db = null;

function makeError(code, message, detail = null) {
  return {
    code,
    message,
    detail
  };
}

function serializeError(error, code = "DB_ERROR") {
  return {
    code,
    message: error?.message || "Unknown error",
    detail: {
      name: error?.name || "Error",
      stack: error?.stack || ""
    }
  };
}

function ensureDexie() {
  if (!Dexie) {
    throw new Error("Dexie is not available in the worker.");
  }
}

function defineSchema(database) {
  database.version(DB_VERSION).stores({
    [PAGE_STORE]: "id, updatedAt, archivedAt, deletedAt, sortOrder, pinned",
    [BLOCK_STORE]: "id, pageId, [pageId+sortOrder], updatedAt, type, deletedAt",
    [SEARCH_INDEX_STORE]: "id, kind, pageId, blockId, updatedAt, sortOrder, text",
    [SETTINGS_STORE]: "key, updatedAt",
    [OPERATIONS_STORE]: "id, createdAt, kind"
  });
}

async function openDb() {
  if (db) return db;
  ensureDexie();
  log.info("Opening IndexedDB", { context: { dbName: DB_NAME, dbVersion: DB_VERSION } });
  db = new Dexie(DB_NAME);
  defineSchema(db);
  await db.open();
  log.info("IndexedDB ready", { context: { dbName: DB_NAME, stores: [PAGE_STORE, BLOCK_STORE, SEARCH_INDEX_STORE, SETTINGS_STORE] } });
  return db;
}

async function withDb(task) {
  const database = await openDb();
  return task(database);
}

async function reindexPage(database, pageId) {
  const page = await database.pages.get(pageId);
  const blocks = sortBlocks(await database.blocks.where("pageId").equals(pageId).toArray());
  const entries = [];

  if (page && !page.deletedAt) {
    entries.push({
      id: `page:${page.id}`,
      kind: "page",
      pageId: page.id,
      blockId: null,
      title: page.title,
      text: getPagePlainText(page),
      sortOrder: page.sortOrder,
      updatedAt: page.updatedAt
    });
  }

  for (const block of blocks) {
    if (block.deletedAt) continue;
    entries.push({
      id: `block:${block.id}`,
      kind: "block",
      pageId: block.pageId,
      blockId: block.id,
      title: block.type,
      text: getBlockPlainText(block),
      sortOrder: block.sortOrder,
      updatedAt: block.updatedAt
    });
  }

  await database.searchIndex.where("pageId").equals(pageId).delete();
  if (entries.length) await database.searchIndex.bulkPut(entries);
}

async function replacePageRecords(database, pages) {
  const normalized = sortPages(pages.map((page) => normalizePageRecord(page)));
  await database.transaction("rw", database.pages, database.searchIndex, async () => {
    await database.pages.bulkPut(normalized);
    for (const page of normalized) await reindexPage(database, page.id);
  });
  return normalized;
}

async function replacePageBlocks(database, pageId, blocks) {
  const normalized = sortBlocks(blocks.map((block) => normalizeBlockRecord({ ...block, pageId })));
  await database.transaction("rw", database.blocks, database.searchIndex, async () => {
    const existing = await database.blocks.where("pageId").equals(pageId).toArray();
    if (existing.length) {
      await database.blocks.bulkDelete(existing.map((block) => block.id));
    }
    if (normalized.length) await database.blocks.bulkPut(normalized);
    await reindexPage(database, pageId);
  });
  return normalized;
}

async function replacePageWorkspace(database, { pages = [], blocks = [] }) {
  const normalizedPages = sortPages(pages.map((page) => normalizePageRecord(page)));
  const normalizedBlocks = sortBlocks(blocks.map((block) => normalizeBlockRecord(block)));
  await database.transaction("rw", database.pages, database.blocks, database.searchIndex, async () => {
    await database.pages.clear();
    await database.blocks.clear();
    await database.searchIndex.clear();
    if (normalizedPages.length) await database.pages.bulkPut(normalizedPages);
    if (normalizedBlocks.length) await database.blocks.bulkPut(normalizedBlocks);
    const pageIds = new Set(normalizedPages.map((page) => page.id));
    for (const pageId of pageIds) await reindexPage(database, pageId);
  });
  return { pages: normalizedPages, blocks: normalizedBlocks };
}

async function getWorkspaceSnapshot(database) {
  const [pages, blocks, settings] = await Promise.all([
    database.pages.toArray(),
    database.blocks.toArray(),
    database.settings.toArray()
  ]);
  return {
    dataFormatVersion: APP_DATA_FORMAT_VERSION,
    pages: sortPages(pages.map((page) => normalizePageRecord(page))),
    blocks: sortBlocks(blocks.map((block) => normalizeBlockRecord(block))),
    settings
  };
}

async function updateSetting(database, key, value) {
  const next = {
    key: String(key),
    value,
    updatedAt: new Date().toISOString()
  };
  await database.settings.put(next);
  return next;
}

async function getSetting(database, key, fallback = null) {
  const record = await database.settings.get(String(key));
  return record ? record.value : fallback;
}

async function search(database, query) {
  const needle = String(query ?? "").trim().toLowerCase();
  if (!needle) return [];
  const entries = await database.searchIndex.toArray();
  return entries
    .filter((entry) => String(entry.text || "").toLowerCase().includes(needle) || String(entry.title || "").toLowerCase().includes(needle))
    .sort((a, b) => String(a.kind).localeCompare(String(b.kind)) || Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || String(a.id).localeCompare(String(b.id)))
    .slice(0, 60)
    .map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      pageId: entry.pageId,
      blockId: entry.blockId,
      title: entry.title,
      snippet: String(entry.text || "").slice(0, 180),
      sortOrder: entry.sortOrder,
      updatedAt: entry.updatedAt
    }));
}

function success(requestId, type, data = null) {
  return {
    requestId,
    ok: true,
    type,
    protocolVersion: WORKER_PROTOCOL_VERSION,
    data
  };
}

function failure(requestId, type, error) {
  return {
    requestId,
    ok: false,
    type,
    protocolVersion: WORKER_PROTOCOL_VERSION,
    error: error && typeof error === "object" && "code" in error ? error : serializeError(error)
  };
}

async function handleRequest(message) {
  const { requestId, type, protocolVersion, payload = {} } = message || {};
  if (protocolVersion !== WORKER_PROTOCOL_VERSION) {
    return failure(requestId, `${type}:error`, makeError("PROTOCOL_VERSION_MISMATCH", `Expected protocol ${WORKER_PROTOCOL_VERSION}, received ${protocolVersion}.`));
  }

  try {
    switch (type) {
      case "hello":
        await openDb();
        return success(requestId, "hello:result", {
          dbName: DB_NAME,
          dbVersion: DB_VERSION,
          dataFormatVersion: APP_DATA_FORMAT_VERSION,
          protocolVersion: WORKER_PROTOCOL_VERSION
        });

      case "getWorkspace":
        return success(requestId, "getWorkspace:result", await getWorkspaceSnapshot(await openDb()));

      case "listPages": {
        const pages = await (await openDb()).pages.toArray();
        return success(requestId, "listPages:result", sortPages(pages.map((page) => normalizePageRecord(page))).filter((page) => !page.deletedAt && !page.archivedAt));
      }

      case "createPage": {
        const database = await openDb();
        const page = createPageRecord(payload.page || payload);
        const initialBlocks = Array.isArray(payload.initialBlocks) && payload.initialBlocks.length
          ? payload.initialBlocks.map((block, index) => createBlockRecord({ ...block, pageId: page.id, sortOrder: (index + 1) * 1000 }))
          : [];
        await database.transaction("rw", database.pages, database.blocks, database.searchIndex, async () => {
          await database.pages.put(page);
          if (initialBlocks.length) await database.blocks.bulkPut(initialBlocks);
          await reindexPage(database, page.id);
        });
        return success(requestId, "createPage:result", { page, blocks: initialBlocks });
      }

      case "updatePage": {
        const database = await openDb();
        const existing = await database.pages.get(payload.id);
        if (!existing) throw makeError("NOT_FOUND", `Page ${payload.id} not found.`);
        const page = clonePageRecord(existing, payload.patch || {});
        await database.transaction("rw", database.pages, database.searchIndex, async () => {
          await database.pages.put(page);
          await reindexPage(database, page.id);
        });
        return success(requestId, "updatePage:result", page);
      }

      case "replacePages": {
        const database = await openDb();
        return success(requestId, "replacePages:result", await replacePageRecords(database, payload.pages || []));
      }

      case "createBlock": {
        const database = await openDb();
        const block = createBlockRecord(payload.block || payload);
        const pageId = block.pageId;
        await database.transaction("rw", database.blocks, database.searchIndex, async () => {
          await database.blocks.put(block);
          await reindexPage(database, pageId);
        });
        return success(requestId, "createBlock:result", block);
      }

      case "updateBlock": {
        const database = await openDb();
        const existing = await database.blocks.get(payload.id);
        if (!existing) throw makeError("NOT_FOUND", `Block ${payload.id} not found.`);
        const block = cloneBlockRecord(existing, payload.patch || {});
        await database.transaction("rw", database.blocks, database.searchIndex, async () => {
          await database.blocks.put(block);
          await reindexPage(database, block.pageId);
        });
        return success(requestId, "updateBlock:result", block);
      }

      case "deleteBlock": {
        const database = await openDb();
        const existing = await database.blocks.get(payload.id);
        if (!existing) throw makeError("NOT_FOUND", `Block ${payload.id} not found.`);
        const block = cloneBlockRecord(existing, { deletedAt: new Date().toISOString() });
        await database.transaction("rw", database.blocks, database.searchIndex, async () => {
          await database.blocks.put(block);
          await reindexPage(database, block.pageId);
        });
        return success(requestId, "deleteBlock:result", block);
      }

      case "replacePageBlocks": {
        const database = await openDb();
        return success(requestId, "replacePageBlocks:result", await replacePageBlocks(database, payload.pageId, payload.blocks || []));
      }

      case "updateBlocks": {
        const database = await openDb();
        const updated = [];
        await database.transaction("rw", database.blocks, database.searchIndex, async () => {
          for (const item of payload.blocks || []) {
            const existing = await database.blocks.get(item.id);
            if (!existing) continue;
            const block = cloneBlockRecord(existing, item.patch || {});
            await database.blocks.put(block);
            updated.push(block);
            await reindexPage(database, block.pageId);
          }
        });
        return success(requestId, "updateBlocks:result", updated);
      }

      case "reorderPages": {
        const database = await openDb();
        const pages = payload.pages || [];
        await database.transaction("rw", database.pages, database.searchIndex, async () => {
          for (const item of pages) {
            const existing = await database.pages.get(item.id);
            if (!existing) continue;
            const page = clonePageRecord(existing, { sortOrder: item.sortOrder });
            await database.pages.put(page);
            await reindexPage(database, page.id);
          }
        });
        return success(requestId, "reorderPages:result", { ok: true });
      }

      case "reorderBlocks": {
        const database = await openDb();
        const blocks = payload.blocks || [];
        const updated = [];
        await database.transaction("rw", database.blocks, database.searchIndex, async () => {
          for (const item of blocks) {
            const existing = await database.blocks.get(item.id);
            if (!existing) continue;
            const block = cloneBlockRecord(existing, { sortOrder: item.sortOrder });
            await database.blocks.put(block);
            updated.push(block);
            await reindexPage(database, block.pageId);
          }
        });
        return success(requestId, "reorderBlocks:result", updated);
      }

      case "updateSetting":
        return success(requestId, "updateSetting:result", await updateSetting(await openDb(), payload.key, payload.value));

      case "getSetting":
        return success(requestId, "getSetting:result", await getSetting(await openDb(), payload.key, payload.fallback ?? null));

      case "search":
        return success(requestId, "search:result", await search(await openDb(), payload.query));

      case "getPage":
        {
          const database = await openDb();
          const page = await database.pages.get(payload.id);
          return success(requestId, "getPage:result", page ? normalizePageRecord(page) : null);
        }

      case "getBlocksForPage": {
        const database = await openDb();
        const blocks = await database.blocks.where("pageId").equals(payload.pageId).toArray();
        return success(requestId, "getBlocksForPage:result", sortBlocks(blocks.map((block) => normalizeBlockRecord(block))).filter((block) => !block.deletedAt));
      }

      case "replaceWorkspace":
        return success(requestId, "replaceWorkspace:result", await replacePageWorkspace(await openDb(), payload));

      default:
        throw makeError("UNKNOWN_MESSAGE_TYPE", `Unknown storage request: ${type}`);
    }
  } catch (error) {
    const normalized = error && typeof error === "object" && "code" in error ? error : serializeError(error);
    log.error("Storage request failed", { context: { type, requestId, error: normalized } });
    return failure(requestId, `${type}:error`, normalized);
  }
}

if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
  self.addEventListener("message", async (event) => {
    const response = await handleRequest(event.data);
    self.postMessage(response);
  });
}

log.info("Worker initialized", {
  context: {
    protocolVersion: WORKER_PROTOCOL_VERSION,
    dbName: DB_NAME,
    dbVersion: DB_VERSION
  }
});
