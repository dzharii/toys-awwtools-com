/**
 * Progress store.
 *
 * localStorage-backed persistence keyed by normalized page identity. Isolated
 * so the backend can change later. Detects availability, degrades to
 * session-only mode on failure, prunes old/oversized records, and never stores
 * page text or HTML (that is the serializer's contract).
 */

import { CONFIG } from "../config.js";
import { wallNow } from "../utils/time.js";

const INDEX_KEY = CONFIG.storagePrefix + "__index";

function detectStorage() {
  try {
    const testKey = CONFIG.storagePrefix + "__test";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (_e) {
    return null;
  }
}

export function createProgressStore() {
  let backend = detectStorage();
  // sessionData holds records when persistence is unavailable/disabled.
  const sessionData = new Map();
  let sessionOnly = !backend;

  function getMode() {
    if (sessionOnly) return "session-only";
    return "persistent";
  }

  function isAvailable() {
    return !sessionOnly && !!backend;
  }

  function enableSessionOnly() {
    sessionOnly = true;
  }

  function readIndex() {
    if (!backend) return {};
    try {
      const raw = backend.getItem(INDEX_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_e) {
      return {};
    }
  }

  function writeIndex(index) {
    if (!backend) return;
    try {
      backend.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (_e) {
      /* ignore */
    }
  }

  function touchIndex(key) {
    const index = readIndex();
    index[key] = wallNow();
    writeIndex(index);
    pruneIfNeeded(index);
  }

  function pruneIfNeeded(index) {
    if (!backend) return;
    const entries = Object.keys(index).map((k) => ({ key: k, at: index[k] }));
    const cutoff = wallNow() - CONFIG.maxRecordAgeDays * 24 * 60 * 60 * 1000;

    // Remove expired records.
    let changed = false;
    for (const e of entries) {
      if (e.at < cutoff) {
        try {
          backend.removeItem(e.key);
        } catch (_err) {
          /* ignore */
        }
        delete index[e.key];
        changed = true;
      }
    }

    // Enforce max record count (drop oldest).
    const remaining = Object.keys(index).map((k) => ({ key: k, at: index[k] }));
    if (remaining.length > CONFIG.maxStoredRecords) {
      remaining.sort((a, b) => a.at - b.at);
      const excess = remaining.length - CONFIG.maxStoredRecords;
      for (let i = 0; i < excess; i++) {
        try {
          backend.removeItem(remaining[i].key);
        } catch (_err) {
          /* ignore */
        }
        delete index[remaining[i].key];
        changed = true;
      }
    }
    if (changed) writeIndex(index);
  }

  function load(key) {
    if (sessionOnly) {
      return sessionData.get(key) || null;
    }
    try {
      const raw = backend.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  /**
   * Save a record. Returns { ok, mode }. On quota/other failure it degrades to
   * session-only mode and keeps the record in memory so the current session
   * still works.
   */
  function save(key, record) {
    if (sessionOnly) {
      sessionData.set(key, record);
      return { ok: true, mode: "session-only" };
    }
    try {
      backend.setItem(key, JSON.stringify(record));
      touchIndex(key);
      return { ok: true, mode: "persistent" };
    } catch (_e) {
      // Likely quota exceeded or storage disabled mid-session.
      sessionOnly = true;
      sessionData.set(key, record);
      return { ok: false, mode: "session-only", error: "storage-write-failed" };
    }
  }

  function remove(key) {
    sessionData.delete(key);
    if (!backend) return true;
    try {
      backend.removeItem(key);
      const index = readIndex();
      if (index[key]) {
        delete index[key];
        writeIndex(index);
      }
      return true;
    } catch (_e) {
      return false;
    }
  }

  return {
    isAvailable,
    getMode,
    enableSessionOnly,
    load,
    save,
    remove,
  };
}
