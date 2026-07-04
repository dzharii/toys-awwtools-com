/**
 * Performance scheduler.
 *
 * Coordinates expensive work so segmentation, geometry refresh, UI updates,
 * minimap render, and storage saves never run aggressively at the same time.
 * Modules must not spin up their own high-frequency loops; they register work
 * here and the scheduler decides when it runs.
 *
 * The scheduler owns every timer it creates and cancels them all on shutdown.
 */

import { CONFIG } from "../config.js";

export function createScheduler(callbacks) {
  // callbacks: { onSample, onGeometryRefresh, onUiUpdate, onSave }
  const cb = callbacks || {};

  let sampleTimer = null;
  let sampleIntervalMs = CONFIG.sampleIntervalMs;

  let geometryTimer = null;
  let uiTimer = null;
  let saveTimer = null;
  let periodicSaveTimer = null;

  const dirty = {
    content: false,
    geometry: false,
    ui: false,
    save: false,
  };

  let stopped = false;
  const rafReads = [];
  const rafWrites = [];
  let rafHandle = 0;

  const idleQueue = [];
  let idleHandle = 0;

  function markDirty(type) {
    if (type in dirty) dirty[type] = true;
  }

  function isDirty(type) {
    return !!dirty[type];
  }

  function clearDirty(type) {
    if (type in dirty) dirty[type] = false;
  }

  // ---- Sampling loop -------------------------------------------------------

  function startSampling(intervalMs) {
    if (stopped) return;
    if (typeof intervalMs === "number") sampleIntervalMs = intervalMs;
    stopSampling();
    sampleTimer = setInterval(() => {
      if (stopped) return;
      try {
        if (cb.onSample) cb.onSample();
      } catch (_e) {
        /* fail open: never break the page from a sample */
      }
    }, sampleIntervalMs);
  }

  function stopSampling() {
    if (sampleTimer) {
      clearInterval(sampleTimer);
      sampleTimer = null;
    }
  }

  function setSampleInterval(intervalMs) {
    if (intervalMs === sampleIntervalMs) return;
    sampleIntervalMs = intervalMs;
    if (sampleTimer) startSampling(intervalMs);
  }

  // ---- Debounced geometry refresh -----------------------------------------

  function scheduleGeometryRefresh(reason) {
    markDirty("geometry");
    if (geometryTimer || stopped) return;
    geometryTimer = setTimeout(() => {
      geometryTimer = null;
      if (stopped || !dirty.geometry) return;
      try {
        if (cb.onGeometryRefresh) cb.onGeometryRefresh(reason);
      } catch (_e) {
        /* fail open */
      }
    }, 120);
  }

  // ---- Debounced UI update -------------------------------------------------

  function scheduleUiUpdate(reason) {
    markDirty("ui");
    if (uiTimer || stopped) return;
    uiTimer = setTimeout(() => {
      uiTimer = null;
      if (stopped || !dirty.ui) return;
      clearDirty("ui");
      try {
        if (cb.onUiUpdate) cb.onUiUpdate(reason);
      } catch (_e) {
        /* fail open */
      }
    }, 60);
  }

  // ---- Debounced save + periodic checkpoint --------------------------------

  function scheduleSave(reason, immediate) {
    markDirty("save");
    if (stopped) return;
    if (immediate) {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      runSave(reason);
      return;
    }
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      runSave(reason);
    }, CONFIG.saveDebounceMs);
  }

  function runSave(reason) {
    if (!dirty.save) return;
    clearDirty("save");
    try {
      if (cb.onSave) cb.onSave(reason);
    } catch (_e) {
      /* fail open */
    }
  }

  function startPeriodicSave() {
    if (periodicSaveTimer || stopped) return;
    periodicSaveTimer = setInterval(() => {
      if (stopped) return;
      if (dirty.save) runSave("periodic");
    }, CONFIG.periodicSaveMs);
  }

  function flushSaveNow(reason) {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    markDirty("save");
    runSave(reason || "flush");
  }

  function cancelPendingSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    clearDirty("save");
  }

  // ---- Read / write batching ----------------------------------------------

  function runReadPhase(fn) {
    if (typeof fn === "function") rafReads.push(fn);
    ensureRaf();
  }

  function runWritePhase(fn) {
    if (typeof fn === "function") rafWrites.push(fn);
    ensureRaf();
  }

  function ensureRaf() {
    if (rafHandle || stopped) return;
    const raf = window.requestAnimationFrame || ((f) => setTimeout(() => f(Date.now()), 16));
    rafHandle = raf(() => {
      rafHandle = 0;
      const reads = rafReads.splice(0, rafReads.length);
      const writes = rafWrites.splice(0, rafWrites.length);
      for (const r of reads) {
        try {
          r();
        } catch (_e) {
          /* fail open */
        }
      }
      for (const w of writes) {
        try {
          w();
        } catch (_e) {
          /* fail open */
        }
      }
    });
  }

  // ---- Idle work -----------------------------------------------------------

  function runIdle(fn) {
    if (typeof fn !== "function") return;
    idleQueue.push(fn);
    if (idleHandle || stopped) return;
    const ric = window.requestIdleCallback || ((f) => setTimeout(() => f({ timeRemaining: () => 8 }), 200));
    idleHandle = ric(() => {
      idleHandle = 0;
      const tasks = idleQueue.splice(0, idleQueue.length);
      for (const t of tasks) {
        try {
          t();
        } catch (_e) {
          /* fail open */
        }
      }
    });
  }

  // ---- Shutdown ------------------------------------------------------------

  function cancelAll() {
    stopped = true;
    stopSampling();
    if (geometryTimer) clearTimeout(geometryTimer);
    if (uiTimer) clearTimeout(uiTimer);
    if (saveTimer) clearTimeout(saveTimer);
    if (periodicSaveTimer) clearInterval(periodicSaveTimer);
    geometryTimer = uiTimer = saveTimer = periodicSaveTimer = null;
    if (rafHandle && window.cancelAnimationFrame) window.cancelAnimationFrame(rafHandle);
    if (idleHandle && window.cancelIdleCallback) window.cancelIdleCallback(idleHandle);
    rafHandle = 0;
    idleHandle = 0;
    rafReads.length = 0;
    rafWrites.length = 0;
    idleQueue.length = 0;
  }

  return {
    markDirty,
    isDirty,
    clearDirty,
    startSampling,
    stopSampling,
    setSampleInterval,
    scheduleGeometryRefresh,
    scheduleUiUpdate,
    scheduleSave,
    startPeriodicSave,
    flushSaveNow,
    cancelPendingSave,
    runReadPhase,
    runWritePhase,
    runIdle,
    cancelAll,
    get sampleIntervalMs() {
      return sampleIntervalMs;
    },
  };
}
