(() => {
  // src/storage-worker.js
  try {
    importScripts("./observability/worker-logger.js");
  } catch {
    importScripts("../observability/worker-logger.js");
  }
  var logger = self.TRNLogger.createLogger("StorageWorker");
  var persistenceLogger = self.TRNLogger.createLogger("Persistence");
  try {
    importScripts("./vendor-libs/dexie-4.2.0.js");
  } catch {
    importScripts("../vendor-libs/dexie-4.2.0.js");
  }
  var DB_NAME = "TopicResearchNotepadDB";
  var DB_VERSION = 1;
  var APP_DATA_FORMAT_VERSION = 1;
  var WORKER_PROTOCOL_VERSION = 1;
  var db = new Dexie(DB_NAME);
  logger.info("Storage worker script loaded", {
    context: {
      dexieAvailable: typeof Dexie !== "undefined",
      indexedDbAvailable: typeof indexedDB !== "undefined",
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      protocolVersion: WORKER_PROTOCOL_VERSION
    }
  });
  db.version(DB_VERSION).stores({
    pages: "id, updatedAt, archivedAt, sortOrder, pinned",
    blocks: "id, pageId, [pageId+sortOrder], updatedAt, type, deletedAt",
    searchIndex: "id, pageId, blockId, kind, blockType, updatedAt",
    settings: "key, updatedAt"
  });
  self.addEventListener("message", async (event) => {
    const { requestId, type, protocolVersion, payload = {} } = event.data || {};
    const startedAt = performance.now();
    logger.debug("Worker received request", { context: { requestId, type, protocolVersion, payload: summarizePayload(payload) } });
    try {
      if (protocolVersion !== WORKER_PROTOCOL_VERSION)
        throw structuredError("PROTOCOL_VERSION_MISMATCH", "Storage worker protocol version mismatch.");
      const data = await handleRequest(type, payload);
      logger.debug("Worker completed request", { context: { requestId, type, durationMs: Math.round(performance.now() - startedAt), result: summarizePayload(data) } });
      self.postMessage({ requestId, ok: true, type: `${type}:result`, protocolVersion: WORKER_PROTOCOL_VERSION, data });
    } catch (error) {
      logger.error("Worker request failed", { context: { requestId, type, durationMs: Math.round(performance.now() - startedAt), error: self.TRNLogger.normalizeError(error) } });
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
    persistenceLogger.debug("Loading workspace records", { context: { query: "toArray then filter", includeArchived: false } });
    const [pages, blocks, settings] = await Promise.all([db.pages.toArray(), db.blocks.toArray(), db.settings.toArray()]);
    persistenceLogger.info("Workspace records loaded", { context: { pageCount: pages.length, blockCount: blocks.length, settingsCount: settings.length } });
    return {
      pages: pages.filter((page) => !page.deletedAt && !page.archivedAt).sort(byOrder),
      blocks: blocks.filter((block) => !block.deletedAt).sort(byOrder),
      settings: Object.fromEntries(settings.map((item) => [item.key, item.value]))
    };
  }
  async function createPage(page, blocks) {
    persistenceLogger.info("Creating page transaction", { context: { pageId: page?.id, title: page?.title, blockCount: blocks.length } });
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
    persistenceLogger.debug("Updating page", { context: { pageId: page?.id, title: page?.title } });
    await db.transaction("rw", db.pages, db.searchIndex, async () => {
      await db.pages.put(page);
      await indexPage(page);
    });
    return page;
  }
  async function updateBlock(block) {
    persistenceLogger.debug("Updating block", { context: { blockId: block?.id, pageId: block?.pageId, type: block?.type } });
    await db.transaction("rw", db.blocks, db.searchIndex, async () => {
      await db.blocks.put(block);
      await indexBlock(block);
    });
    return block;
  }
  async function replaceBlocks(pageId, blocks) {
    persistenceLogger.info("Replacing page blocks", { context: { pageId, blockCount: blocks.length } });
    await db.transaction("rw", db.blocks, db.searchIndex, async () => {
      await db.blocks.bulkPut(blocks);
      await Promise.all(blocks.map(indexBlock));
    });
    return { pageId, blocks };
  }
  async function deleteBlock(blockId) {
    const updatedAt = new Date().toISOString();
    persistenceLogger.info("Soft deleting block", { context: { blockId } });
    await db.transaction("rw", db.blocks, db.searchIndex, async () => {
      await db.blocks.update(blockId, { deletedAt: updatedAt, updatedAt });
      await db.searchIndex.delete(`block:${blockId}`);
    });
    return { blockId };
  }
  async function reorderPages(pages) {
    persistenceLogger.info("Persisting page order", { context: { pageCount: pages.length } });
    await db.pages.bulkPut(pages);
    return pages;
  }
  async function reorderBlocks(blocks) {
    persistenceLogger.info("Persisting block order", { context: { blockCount: blocks.length, pageId: blocks[0]?.pageId } });
    await db.blocks.bulkPut(blocks);
    await Promise.all(blocks.map(indexBlock));
    return blocks;
  }
  async function setSetting(key, value) {
    persistenceLogger.debug("Writing setting", { context: { key, value } });
    await db.settings.put({ key, value, updatedAt: new Date().toISOString() });
    return { key, value };
  }
  async function search(query) {
    const needle = normalizeSearchText(query);
    if (!needle)
      return [];
    const [entries, pages] = await Promise.all([db.searchIndex.toArray(), db.pages.toArray()]);
    persistenceLogger.debug("Searching index", { context: { query, entryCount: entries.length, pageCount: pages.length } });
    const pageById = new Map(pages.map((page) => [page.id, page]));
    return entries.filter((entry) => entry.text.includes(needle)).filter((entry) => !pageById.get(entry.pageId)?.archivedAt).slice(0, 50).map((entry) => ({ ...entry, pageTitle: pageById.get(entry.pageId)?.title || "Untitled research" }));
  }
  async function indexPage(page) {
    persistenceLogger.debug("Indexing page", { context: { pageId: page?.id } });
    await db.searchIndex.put({
      id: `page:${page.id}`,
      pageId: page.id,
      blockId: null,
      kind: "pageTitle",
      blockType: null,
      text: normalizeSearchText(page.title),
      rawPreview: page.title,
      updatedAt: new Date().toISOString()
    });
  }
  async function indexBlock(block) {
    persistenceLogger.debug("Indexing block", { context: { blockId: block?.id, pageId: block?.pageId, type: block?.type } });
    await db.searchIndex.put({
      id: `block:${block.id}`,
      pageId: block.pageId,
      blockId: block.id,
      kind: "block",
      blockType: block.type,
      text: normalizeSearchText(textForBlock(block)),
      rawPreview: previewText(textForBlock(block)),
      updatedAt: new Date().toISOString()
    });
  }
  function textForBlock(block) {
    const c = block.content || {};
    if (block.type === "list")
      return (c.items || []).map((item) => item.text).join(" ");
    if (block.type === "table")
      return [...(c.columns || []).map((col) => col.label), ...(c.rows || []).flatMap((row) => Object.values(row.cells || {}))].join(" ");
    if (block.type === "sourceLink")
      return [c.title, c.url, c.domain, c.note, c.capturedText].join(" ");
    if (block.type === "quote")
      return [c.text, c.attribution, c.sourceUrl].join(" ");
    if (block.type === "code")
      return [c.language, c.text].join(" ");
    if (block.type === "paragraph" || block.type === "heading")
      return c.text || stripTags(c.html || "");
    return c.text || JSON.stringify(c);
  }
  function normalizeSearchText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }
  function previewText(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > 160 ? `${text.slice(0, 159)}...` : text;
  }
  function stripTags(value) {
    return String(value || "").replace(/<[^>]*>/g, " ");
  }
  function byOrder(a, b) {
    return a.sortOrder - b.sortOrder || String(a.createdAt).localeCompare(String(b.createdAt));
  }
  function structuredError(code, message) {
    return Object.assign(new Error(message), { code });
  }
  function toError(error) {
    return { code: error.code || "STORAGE_ERROR", message: error.message || String(error) };
  }
  function summarizePayload(payload) {
    if (!payload || typeof payload !== "object")
      return payload;
    return {
      keys: Object.keys(payload),
      pageId: payload.pageId || payload.page?.id,
      blockId: payload.blockId || payload.block?.id,
      blockType: payload.block?.type,
      blockCount: Array.isArray(payload.blocks) ? payload.blocks.length : undefined,
      pageCount: Array.isArray(payload.pages) ? payload.pages.length : undefined,
      query: payload.query,
      key: payload.key,
      dbName: payload.dbName,
      dbVersion: payload.dbVersion
    };
  }
})();

//# debugId=96C522CEE31756C264756E2164756E21
//# sourceMappingURL=storage-worker.js.map
