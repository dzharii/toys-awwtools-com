// Centralized app state and a tiny event bus. Keeps behavior auditable without
// a framework. document.sourceText lives here in memory only for the active
// session and is never persisted.

import { DEFAULT_PREFERENCES } from "./preferences.js";

export const appState = {
  document: {
    loaded: false,
    id: null,
    fileName: null,
    fileType: null, // "text" | "markdown"
    title: null,
    characterCount: 0,
    wordEstimate: 0,
    sections: [], // [{ id, heading, level, html }]
    sourceText: null, // session-only; never persisted
  },
  reader: {
    mode: "paged",
    currentPageIndex: 0,
    pageCount: 0,
    scrollAnchor: 0, // fraction 0..1 for position preservation
    layoutReady: false,
    partialsSinceFull: 0,
  },
  preferences: { ...DEFAULT_PREFERENCES },
  ui: {
    settingsOpen: false,
    busy: false,
    lastError: null,
    debugEnabled: false,
    reducedMotionSystem: false,
  },
};

// Minimal event bus.
const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event).delete(handler);
}

export function emit(event, payload) {
  const set = listeners.get(event);
  if (!set) return;
  set.forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      // Surface handler errors without breaking the emit loop.
      console.error(`[eink] listener for "${event}" threw`, err);
    }
  });
}

export const Events = {
  DOCUMENT_LOADED: "document:loaded",
  DOCUMENT_CLEARED: "document:cleared",
  PREFERENCES_CHANGED: "preferences:changed",
  MODE_CHANGED: "mode:changed",
  PAGE_CHANGED: "page:changed",
  SETTINGS_TOGGLED: "settings:toggled",
  ERROR: "error",
};

/** Reset document state without persisting anything. */
export function clearDocument() {
  appState.document = {
    loaded: false,
    id: null,
    fileName: null,
    fileType: null,
    title: null,
    characterCount: 0,
    wordEstimate: 0,
    sections: [],
    sourceText: null,
  };
  appState.reader.currentPageIndex = 0;
  appState.reader.pageCount = 0;
  appState.reader.scrollAnchor = 0;
  appState.reader.layoutReady = false;
}
