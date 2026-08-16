import { CACHE_TTL_MS, FETCH_TIMEOUT_MS, MAX_RECORD_REQUESTS } from "../shared/constants.js";
import { isValidId, pageRange, parseManifest, parseTargetUrl } from "../shared/core.js";
import { createDiagnostic, createLogger } from "../shared/diagnostics.js";

const PREFIX = "lnk-journal:";
const CACHE_VERSION = "1";

export class JournalData extends EventTarget {
  constructor({ debug = new URLSearchParams(location.search).has("debug") } = {}) {
    super();
    this.sessionId = `journal-${Math.random().toString(36).slice(2, 8)}`;
    this.logger = createLogger({ debug, correlationLabel: "Session", correlationId: this.sessionId });
    this.manifest = [];
    this.memory = new Map();
    this.inFlight = new Map();
    this.queue = [];
    this.active = 0;
    this.storage = this.#initStorage();
    this.lastManifestAt = 0;
    this.generation = 0;
  }

  #initStorage() {
    try {
      const storage = globalThis.localStorage;
      const current = storage.getItem(`${PREFIX}cache-version`);
      if (current !== CACHE_VERSION) {
        for (let index = storage.length - 1; index >= 0; index -= 1) {
          const key = storage.key(index);
          if (key?.startsWith(PREFIX)) storage.removeItem(key);
        }
        storage.setItem(`${PREFIX}cache-version`, CACHE_VERSION);
      }
      return storage;
    } catch (error) {
      this.logger.warn("cache", `Persistent journal cache is unavailable. Reason: ${error.name || error.message}. Fallback: in-memory cache for this session.`);
      return null;
    }
  }

  async loadManifest() {
    const started = performance.now();
    const url = new URL("links.txt", document.baseURI);
    let response;
    try {
      response = await timedFetch(url, { cache: "no-cache" });
    } catch (cause) {
      throw this.#error("MANIFEST_FETCH_FAILED", "manifest", "manifest fetch", "Manifest request failed", cause.name === "AbortError" ? "The request timed out after 15 seconds." : "The network request failed.", { URL: url.href }, cause);
    }
    if (!response.ok) throw this.#error("MANIFEST_FETCH_FAILED", "manifest", "manifest fetch", "Manifest request failed", `The server returned HTTP ${response.status}.`, { URL: url.href, "HTTP status": response.status });
    let ids;
    try { ids = parseManifest(await response.text()); }
    catch (cause) { throw this.#error(cause.code || "MANIFEST_INVALID", "manifest", "manifest validation", "Published manifest is invalid", cause.message, cause.context || {}, cause); }
    const previous = this.manifest;
    this.manifest = ids;
    this.generation += 1;
    this.lastManifestAt = Date.now();
    this.#removeDeletedCache(ids);
    this.logger.info("journal", `Journal manifest loaded: ${ids.length} link${ids.length === 1 ? "" : "s"}.`);
    this.logger.debug("journal", `Manifest fetch and parse: ${Math.round(performance.now() - started)}ms; generation=${this.generation}`);
    return { ids, changed: previous.join("\n") !== ids.join("\n"), previous };
  }

  get pageCount() { return this.manifest.length ? Math.ceil(this.manifest.length / 6) : 0; }

  pageIds(pageIndex) {
    const { start, end } = pageRange(pageIndex, this.manifest.length);
    return this.manifest.slice(start, end);
  }

  getPage(pageIndex, priority = "visible") {
    return this.pageIds(pageIndex).map((id, offset) => ({
      id,
      index: pageIndex * 6 + offset,
      promise: this.getEntry(id, priority).catch((error) => ({ id, status: "error", diagnostic: error.diagnostic || error }))
    }));
  }

  async getEntry(id, priority = "visible") {
    if (!isValidId(id) || !this.manifest.includes(id)) throw new Error(`Entry ${id} is not in the current manifest.`);
    const memory = this.memory.get(id);
    if (memory && isFresh(memory.cachedAt)) return { ...memory, status: "ready", source: "memory" };
    const cached = this.#readCache(id);
    if (cached && isFresh(cached.cachedAt)) {
      this.memory.set(id, cached);
      return { ...cached, status: "ready", source: "cache" };
    }
    if (this.inFlight.has(id)) return this.inFlight.get(id);
    const pending = this.#enqueue(() => this.#fetchEntry(id, cached), priority).finally(() => this.inFlight.delete(id));
    this.inFlight.set(id, pending);
    return pending;
  }

  prefetch(pageIndexes) {
    for (const page of pageIndexes) {
      if (page < 0 || page >= this.pageCount) continue;
      this.getPage(page, "prefetch").forEach(({ promise }) => promise.catch(() => {}));
    }
  }

  async #fetchEntry(id, stale) {
    const url = new URL(`lnk/${id}/index.html`, document.baseURI);
    const started = performance.now();
    let staleEligible = false;
    try {
      let response;
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          response = await timedFetch(url);
          if (response.ok) break;
          if (response.status !== 503 || attempt === 2) break;
        } catch (error) {
          if (attempt === 2) { staleEligible = true; throw error; }
        }
        this.logger.debug("record", `Retrying entry ${id}: attempt=2 reason=transient failure`);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (!response?.ok) {
        staleEligible = Boolean(response && response.status >= 500);
        throw new Error(response ? `The server returned HTTP ${response.status}.` : "The network request failed.");
      }
      const entry = parseRecord(await response.text(), id, url);
      entry.cachedAt = Date.now();
      this.memory.set(id, entry);
      this.#writeCache(id, entry);
      this.logger.debug("record", `Resolved ${id}: source=network durationMs=${Math.round(performance.now() - started)}`);
      return { ...entry, status: "ready", source: "network" };
    } catch (cause) {
      if (staleEligible && stale && validateCached(stale, id) && this.manifest.includes(id)) {
        this.logger.warn("cache", `Using stale entry after network failure. ID: ${id}; cache age: ${Math.round((Date.now() - stale.cachedAt) / 60000)}m; reason: ${cause.message}`);
        return { ...stale, status: "stale", source: "stale-cache" };
      }
      throw this.#error("RECORD_FETCH_FAILED", "record", "record fetch", "Journal record request failed", cause.message, { ID: id, URL: url.href }, cause);
    }
  }

  #enqueue(task, priority) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, rank: priority === "visible" ? 0 : priority === "adjacent" ? 1 : 2 });
      this.queue.sort((a, b) => a.rank - b.rank);
      this.#drain();
    });
  }

  #drain() {
    while (this.active < MAX_RECORD_REQUESTS && this.queue.length) {
      const item = this.queue.shift();
      this.active += 1;
      item.task().then(item.resolve, item.reject).finally(() => { this.active -= 1; this.#drain(); });
    }
  }

  #readCache(id) {
    if (!this.storage) return null;
    const key = `${PREFIX}entry:${id}`;
    try {
      const value = this.storage.getItem(key);
      if (!value) return null;
      const parsed = JSON.parse(value);
      if (!validateCached(parsed, id)) throw new Error("Cached value failed structural validation.");
      return parsed;
    } catch (error) {
      this.logger.warn("cache", `Invalid cached entry was discarded. ID: ${id}; cache key: ${key}; reason: ${error.message}`);
      try { this.storage.removeItem(key); } catch {}
      return null;
    }
  }

  #writeCache(id, entry) {
    if (!this.storage) return;
    try { this.storage.setItem(`${PREFIX}entry:${id}`, JSON.stringify(entry)); }
    catch (error) {
      this.logger.warn("cache", `Cache write failed for ${id}: ${error.message}. Continuing with in-memory cache.`);
      this.storage = null;
    }
  }

  #removeDeletedCache(ids) {
    if (!this.storage) return;
    const active = new Set(ids);
    try {
      for (let index = this.storage.length - 1; index >= 0; index -= 1) {
        const key = this.storage.key(index);
        if (key?.startsWith(`${PREFIX}entry:`) && !active.has(key.slice(`${PREFIX}entry:`.length))) this.storage.removeItem(key);
      }
    } catch (error) { this.logger.warn("cache", `Expired cache cleanup failed: ${error.message}`); }
  }

  #error(code, module, stage, summary, reason, context, cause) {
    const diagnostic = createDiagnostic({ code, module, stage, summary, reason, context, cause, userVisible: true });
    this.logger.error(diagnostic);
    const error = new Error(reason, { cause }); error.diagnostic = diagnostic; return error;
  }
}

export function isFresh(cachedAt) {
  const age = Date.now() - cachedAt;
  return Number.isFinite(age) && age >= -60_000 && age < CACHE_TTL_MS;
}

function validateCached(value, id) {
  return value && value.id === id && Number.isFinite(value.cachedAt) && typeof value.title === "string" && typeof value.description === "string" && typeof value.targetUrl === "string" && typeof value.previewUrl === "string" && typeof value.createdAt === "string";
}

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

export function parseRecord(html, expectedId, recordUrl) {
  const documentRecord = new DOMParser().parseFromString(html, "text/html");
  const meta = (selector) => documentRecord.querySelector(selector)?.getAttribute("content")?.trim() || "";
  const id = meta('meta[name="lnk:id"]');
  if (id !== expectedId) throw new Error(`Record identity mismatch: expected ${expectedId}, observed ${id || "missing"}.`);
  const targetUrl = parseTargetUrl(meta('meta[name="lnk:target"]'));
  const createdAt = meta('meta[name="lnk:created"]');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(createdAt) || Number.isNaN(Date.parse(createdAt))) throw new Error("Required metadata lnk:created is invalid.");
  const title = documentRecord.querySelector("title")?.textContent?.trim() || "";
  const description = meta('meta[name="description"]');
  const previewSource = meta('meta[property="og:image"]');
  if (!title || !description || !previewSource) throw new Error("Required title, description, or og:image metadata is missing.");
  const previewUrl = new URL(previewSource, recordUrl);
  const expectedPreview = new URL(`preview.jpg`, recordUrl);
  if (previewUrl.origin !== location.origin || previewUrl.pathname !== expectedPreview.pathname) throw new Error("Record preview does not resolve to its project-owned preview.jpg.");
  return { id, targetUrl, createdAt, title, description, previewUrl: previewUrl.href, shortUrl: new URL(`./`, recordUrl).href };
}
