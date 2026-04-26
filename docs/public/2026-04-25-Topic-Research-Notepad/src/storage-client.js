import { AUTOSAVE_DELAY_MS, WORKER_PROTOCOL_VERSION } from "./constants.js";

/**
 * Main-thread client for the storage worker. It owns request IDs, maps worker
 * responses back to promises, and provides per-record debounced writes.
 */
export class StorageClient extends EventTarget {
  constructor({ workerUrl = new URL("./storage-worker.js", import.meta.url) } = {}) {
    super();
    this.worker = new Worker(workerUrl, { type: "classic" });
    this.nextId = 1;
    this.pending = new Map();
    this.debounced = new Map();
    this.worker.addEventListener("message", (event) => this.handleMessage(event.data));
    this.worker.addEventListener("error", (event) => this.emitStatus("failed", event.message || "Storage worker failed"));
  }

  async hello() {
    return this.request("hello", { protocolVersion: WORKER_PROTOCOL_VERSION });
  }

  request(type, payload = {}) {
    const requestId = `req_${this.nextId++}`;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
    });
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
    this.emitStatus("dirty", "Unsaved local changes");
    const previous = this.debounced.get(key);
    if (previous) clearTimeout(previous.timer);
    let resolvePromise;
    const promise = previous?.promise || new Promise((resolve) => {
      resolvePromise = resolve;
    });
    const timer = setTimeout(async () => {
      this.debounced.delete(key);
      this.emitStatus("saving", "Saving locally");
      try {
        const result = await operation();
        this.emitStatus("saved", "Saved locally");
        (previous?.resolve || resolvePromise)?.(result);
      } catch (error) {
        this.emitStatus("failed", error.message);
        (previous?.resolve || resolvePromise)?.(Promise.reject(error));
      }
    }, delay);
    this.debounced.set(key, { timer, operation, promise, resolve: previous?.resolve || resolvePromise });
    return promise;
  }

  async flush() {
    const entries = [...this.debounced.entries()];
    this.debounced.clear();
    if (!entries.length) return;
    this.emitStatus("saving", "Saving locally");
    await Promise.all(entries.map(async ([, entry]) => {
      clearTimeout(entry.timer);
      const result = await entry.operation();
      entry.resolve?.(result);
    }));
    this.emitStatus("saved", "Saved locally");
  }

  handleMessage(message) {
    const pending = this.pending.get(message?.requestId);
    if (!pending) return;
    this.pending.delete(message.requestId);
    if (message.ok) pending.resolve(message.data);
    else pending.reject(Object.assign(new Error(message.error?.message || "Storage request failed"), { code: message.error?.code }));
  }

  emitStatus(state, detail) {
    this.dispatchEvent(new CustomEvent("save-status", { detail: { state, detail } }));
  }
}
