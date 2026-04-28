import { createLogger } from "../observability/logger.js";
import { WORKER_PROTOCOL_VERSION } from "../shared/constants.js";

const log = createLogger("StorageClient", "WorkerBridge");

function clonePatch(patch) {
  return patch && typeof patch === "object" ? structuredClone(patch) : patch;
}

function nowMs() {
  return performance?.now ? performance.now() : Date.now();
}

export class StorageClient {
  constructor({ workerUrl, debounceMs = 500 } = {}) {
    this.workerUrl = workerUrl || new URL("./storage-worker.js", import.meta.url);
    this.debounceMs = debounceMs;
    this.worker = null;
    this.requestSeq = 0;
    this.pendingRequests = new Map();
    this.pagePatches = new Map();
    this.blockPatches = new Map();
    this.settingPatches = new Map();
    this.statusListeners = new Set();
    this.connected = false;
    this.workerReady = false;
    this.connectionState = "idle";
    this.handshake = null;
    this.pageTimers = new Map();
    this.blockTimers = new Map();
    this.settingTimers = new Map();
  }

  subscribe(listener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  emit(status) {
    for (const listener of this.statusListeners) {
      try {
        listener(status);
      } catch {
        // status listeners must not interrupt persistence.
      }
    }
  }

  async connect() {
    if (this.connected) return this.handshake;
    this.connectionState = "connecting";
    log.info("Creating worker bridge", { context: { workerUrl: String(this.workerUrl) } });

    const worker = new Worker(this.workerUrl, { type: "module", name: "TopicResearchNotepadStorage" });
    this.worker = worker;
    worker.addEventListener("message", (event) => this.#handleMessage(event.data));
    worker.addEventListener("error", (event) => {
      log.error("Worker error", { context: { message: event.message, filename: event.filename, lineno: event.lineno } });
      this.connectionState = "failed";
      this.emit({ state: "failed", scope: "worker", message: event.message || "Worker error" });
    });

    this.handshake = this.request("hello", {}, { timeoutMs: 10000 });
    const result = await this.handshake;
    if (result.protocolVersion !== WORKER_PROTOCOL_VERSION) {
      throw new Error(`Worker protocol mismatch: expected ${WORKER_PROTOCOL_VERSION}, received ${result.protocolVersion}.`);
    }
    this.connected = true;
    this.workerReady = true;
    this.connectionState = "ready";
    this.emit({ state: "ready", scope: "worker", message: "Worker connected" });
    return result;
  }

  async request(type, payload = {}, { timeoutMs = 15000 } = {}) {
    if (!this.worker) await this.connect();
    const requestId = `${type}:${++this.requestSeq}`;
    const message = {
      requestId,
      type,
      protocolVersion: WORKER_PROTOCOL_VERSION,
      payload: clonePatch(payload)
    };

    log.debug("Sending request", { context: { requestId, type, payload } });

    return new Promise((resolve, reject) => {
      const timeout = timeoutMs
        ? setTimeout(() => {
            this.pendingRequests.delete(requestId);
            reject(new Error(`Storage request timed out: ${type}`));
          }, timeoutMs)
        : null;

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });

      this.worker.postMessage(message);
    });
  }

  #handleMessage(message) {
    const pending = this.pendingRequests.get(message?.requestId);
    if (!pending) return;
    this.pendingRequests.delete(message.requestId);
    if (pending.timeout) clearTimeout(pending.timeout);

    log.debug("Received response", { context: { requestId: message.requestId, ok: message.ok, type: message.type } });

    if (message.ok) {
      pending.resolve(message.data);
      return;
    }

    const error = new Error(message.error?.message || "Storage request failed");
    error.code = message.error?.code || "DB_ERROR";
    error.detail = message.error?.detail || null;
    pending.reject(error);
    this.emit({ state: "failed", scope: "worker", message: error.message, error });
  }

  async getWorkspaceSnapshot() {
    return this.request("getWorkspace");
  }

  async listPages() {
    return this.request("listPages");
  }

  async createPage(page, initialBlocks = []) {
    return this.request("createPage", { page, initialBlocks });
  }

  async updatePage(id, patch) {
    return this.request("updatePage", { id, patch });
  }

  async replacePages(pages) {
    return this.request("replacePages", { pages });
  }

  async createBlock(block) {
    return this.request("createBlock", { block });
  }

  async updateBlock(id, patch) {
    return this.request("updateBlock", { id, patch });
  }

  async deleteBlock(id) {
    return this.request("deleteBlock", { id });
  }

  async replacePageBlocks(pageId, blocks) {
    return this.request("replacePageBlocks", { pageId, blocks });
  }

  async updateBlocks(blocks) {
    return this.request("updateBlocks", { blocks });
  }

  async reorderPages(pages) {
    return this.request("reorderPages", { pages });
  }

  async reorderBlocks(blocks) {
    return this.request("reorderBlocks", { blocks });
  }

  async updateSetting(key, value) {
    return this.request("updateSetting", { key, value });
  }

  async getSetting(key, fallback = null) {
    return this.request("getSetting", { key, fallback });
  }

  async search(query) {
    return this.request("search", { query });
  }

  schedulePagePatch(id, patch) {
    const next = { ...(this.pagePatches.get(id) || {}), ...clonePatch(patch) };
    this.pagePatches.set(id, next);
    this.emit({ state: "dirty", scope: "page", id });
    this.#debounceFlush(this.pageTimers, id, () => this.flushPagePatch(id));
  }

  scheduleBlockPatch(id, patch) {
    const next = { ...(this.blockPatches.get(id) || {}), ...clonePatch(patch) };
    this.blockPatches.set(id, next);
    this.emit({ state: "dirty", scope: "block", id });
    this.#debounceFlush(this.blockTimers, id, () => this.flushBlockPatch(id));
  }

  scheduleSettingPatch(key, value) {
    this.settingPatches.set(key, value);
    this.emit({ state: "dirty", scope: "settings", id: key });
    this.#debounceFlush(this.settingTimers, key, () => this.flushSettingPatch(key));
  }

  #debounceFlush(timerMap, id, callback) {
    const previous = timerMap.get(id);
    if (previous) clearTimeout(previous);
    const timeout = setTimeout(() => {
      timerMap.delete(id);
      callback().catch((error) => {
        log.error("Debounced flush failed", { context: { id, error } });
      });
    }, this.debounceMs);
    timerMap.set(id, timeout);
  }

  async flushPagePatch(id) {
    const patch = this.pagePatches.get(id);
    if (!patch) return null;
    this.pagePatches.delete(id);
    log.info("Flushing page patch", { context: { id, patch } });
    this.emit({ state: "saving", scope: "page", id });
    const result = await this.updatePage(id, patch);
    this.emit({ state: "saved", scope: "page", id, result });
    return result;
  }

  async flushBlockPatch(id) {
    const patch = this.blockPatches.get(id);
    if (!patch) return null;
    this.blockPatches.delete(id);
    log.info("Flushing block patch", { context: { id, patch } });
    this.emit({ state: "saving", scope: "block", id });
    const result = await this.updateBlock(id, patch);
    this.emit({ state: "saved", scope: "block", id, result });
    return result;
  }

  async flushSettingPatch(key) {
    if (!this.settingPatches.has(key)) return null;
    const value = this.settingPatches.get(key);
    this.settingPatches.delete(key);
    log.info("Flushing setting patch", { context: { key, value } });
    this.emit({ state: "saving", scope: "settings", id: key });
    const result = await this.updateSetting(key, value);
    this.emit({ state: "saved", scope: "settings", id: key, result });
    return result;
  }

  async flushAll() {
    const pageIds = [...this.pagePatches.keys()];
    const blockIds = [...this.blockPatches.keys()];
    const settingKeys = [...this.settingPatches.keys()];
    const results = [];

    for (const id of pageIds) results.push(this.flushPagePatch(id));
    for (const id of blockIds) results.push(this.flushBlockPatch(id));
    for (const key of settingKeys) results.push(this.flushSettingPatch(key));
    return Promise.all(results);
  }

  async shutdown() {
    await this.flushAll().catch(() => {});
    this.worker?.terminate();
    this.worker = null;
    this.connected = false;
  }
}

