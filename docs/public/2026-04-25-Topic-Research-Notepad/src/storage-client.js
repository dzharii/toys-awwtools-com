import { AUTOSAVE_DELAY_MS, WORKER_PROTOCOL_VERSION } from "./constants.js";
import { createLogger, normalizeError } from "./observability/logger.js";

const logger = createLogger("StorageClient");
const autosaveLogger = logger.withSubcategory("Autosave");
const workerLogger = logger.withSubcategory("WorkerBridge");

/**
 * Main-thread client for the storage worker. It owns request IDs, maps worker
 * responses back to promises, and provides per-record debounced writes.
 */
export class StorageClient extends EventTarget {
  constructor({ workerUrl = new URL("./storage-worker.js", import.meta.url) } = {}) {
    super();
    this.worker = new Worker(workerUrl, { type: "classic" });
    workerLogger.info("Storage worker created", { context: { workerUrl: String(workerUrl), workerType: "classic" } });
    this.nextId = 1;
    this.pending = new Map();
    this.debounced = new Map();
    this.requestStartedAt = new Map();
    this.worker.addEventListener("message", (event) => this.handleMessage(event.data));
    this.worker.addEventListener("error", (event) => {
      workerLogger.error("Storage worker error", { context: { message: event.message, filename: event.filename, lineno: event.lineno } });
      this.emitStatus("failed", event.message || "Storage worker failed");
    });
  }

  async hello() {
    workerLogger.info("Starting worker protocol handshake", { context: { protocolVersion: WORKER_PROTOCOL_VERSION } });
    return this.request("hello", { protocolVersion: WORKER_PROTOCOL_VERSION });
  }

  request(type, payload = {}) {
    const requestId = `req_${this.nextId++}`;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
    });
    this.requestStartedAt.set(requestId, performance.now());
    workerLogger.debug("Sending worker request", { context: { requestId, type, payload: summarizePayload(payload) } });
    this.worker.postMessage({ requestId, type, protocolVersion: WORKER_PROTOCOL_VERSION, payload });
    return promise;
  }

  saveBlockDebounced(block, delay = AUTOSAVE_DELAY_MS) {
    return this.schedule(`block:${block.id}`, () => this.request("updateBlock", { block }), delay);
  }

  savePageDebounced(page, delay = AUTOSAVE_DELAY_MS) {
    return this.schedule(`page:${page.id}`, () => this.request("updatePage", { page }), delay);
  }

  schedule(key, operation, delay) {
    autosaveLogger.debug("Scheduling debounced save", { context: { key, delayMs: delay, replacingExisting: this.debounced.has(key) } });
    this.emitStatus("dirty", "Unsaved local changes");
    const previous = this.debounced.get(key);
    if (previous) clearTimeout(previous.timer);
    let resolvePromise;
    let rejectPromise;
    const promise = previous?.promise || new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    const timer = setTimeout(async () => {
      this.debounced.delete(key);
      this.emitStatus("saving", "Saving locally");
      try {
        const result = await operation();
        autosaveLogger.debug("Debounced save completed", { context: { key } });
        this.emitStatus("saved", "Saved locally");
        (previous?.resolve || resolvePromise)?.(result);
      } catch (error) {
        autosaveLogger.error("Debounced save failed", { context: { key, error: normalizeError(error) } });
        this.emitStatus("failed", error.message);
        (previous?.reject || rejectPromise)?.(error);
      }
    }, delay);
    this.debounced.set(key, {
      timer,
      operation,
      promise,
      resolve: previous?.resolve || resolvePromise,
      reject: previous?.reject || rejectPromise,
    });
    return promise;
  }

  async flush() {
    const entries = [...this.debounced.entries()];
    this.debounced.clear();
    if (!entries.length) return;
    autosaveLogger.info("Flushing pending saves", { context: { count: entries.length, keys: entries.map(([key]) => key) } });
    this.emitStatus("saving", "Saving locally");
    try {
      await Promise.all(entries.map(async ([, entry]) => {
        clearTimeout(entry.timer);
        const result = await entry.operation();
        entry.resolve?.(result);
      }));
      this.emitStatus("saved", "Saved locally");
    } catch (error) {
      entries.forEach(([, entry]) => entry.reject?.(error));
      autosaveLogger.error("Flush failed", { context: { count: entries.length, error: normalizeError(error) } });
      this.emitStatus("failed", error.message || "Save failed");
      throw error;
    }
  }

  handleMessage(message) {
    const pending = this.pending.get(message?.requestId);
    if (!pending) return;
    this.pending.delete(message.requestId);
    const startedAt = this.requestStartedAt.get(message.requestId);
    this.requestStartedAt.delete(message.requestId);
    const durationMs = startedAt ? Math.round(performance.now() - startedAt) : null;
    workerLogger.debug("Received worker response", { context: { requestId: message.requestId, type: message.type, ok: message.ok, durationMs } });
    if (message.ok) pending.resolve(message.data);
    else {
      const error = Object.assign(new Error(message.error?.message || "Storage request failed"), { code: message.error?.code });
      workerLogger.error("Worker request failed", { context: { requestId: message.requestId, type: message.type, error: normalizeError(error) } });
      pending.reject(error);
    }
  }

  emitStatus(state, detail) {
    logger.debug("Save status changed", { context: { state, detail } });
    this.dispatchEvent(new CustomEvent("save-status", { detail: { state, detail } }));
  }
}

function summarizePayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  return {
    keys: Object.keys(payload),
    pageId: payload.pageId || payload.page?.id,
    blockId: payload.blockId || payload.block?.id,
    blockType: payload.block?.type,
    blockCount: Array.isArray(payload.blocks) ? payload.blocks.length : undefined,
    pageCount: Array.isArray(payload.pages) ? payload.pages.length : undefined,
    query: payload.query,
    key: payload.key,
  };
}
