const SETTINGS_STORAGE_KEY = "code-panorama-settings";
/**
 * Creates the default root node for the in-memory project tree model.
 */
export function createRootNode() {
  return { name: "", type: "dir", children: [], expanded: true, path: "" };
}
/**
 * Loads user settings from storage and merges them with defaults.
 * Parse failures are non-fatal and fall back to provided defaults.
 */
export function loadSettings(defaultSettings, storage = localStorage) {
  const saved = storage.getItem(SETTINGS_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaultSettings,
        ...parsed,
        ignores: parsed.ignores || defaultSettings.ignores,
        allow: parsed.allow || defaultSettings.allow,
      };
    } catch (err) {
      console.warn("Failed to parse settings, using defaults", err);
    }
  }
  return { ...defaultSettings };
}
/**
 * Persists current user settings to storage.
 */
export function saveSettings(settings, storage = localStorage) {
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
/**
 * Loads persisted Tree-sitter UI state and normalizes missing fields to safe defaults.
 */
export function loadTreeSitterState({
  storageKey,
  languages,
  storage = localStorage,
}) {
  const base = {
    enabled: true,
    window: {
      open: false,
      minimized: false,
      x: null,
      y: null,
      w: 360,
      h: 420,
      chipY: null,
    },
    ready: false,
    loading: false,
    parsing: false,
    error: null,
    cache: {},
    markers: {},
    fileStateById: {},
    errors: [],
    queue: {
      pendingIds: [],
      inProgressFileId: null,
      paused: false,
      runId: 0,
      handle: null,
      handleType: null,
    },
    progress: {
      eligibleTotal: 0,
      completedPhase1: 0,
      completedPhase2: 0,
      skipped: 0,
      failed: 0,
      currentFilePath: "",
      finalized: false,
      tsUnavailable: false,
    },
    pendingFileId: null,
    parser: null,
    Parser: null,
    Language: null,
    languages: Object.keys(languages).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {},
    ),
    parseHandle: null,
    parseHandleType: null,
    wantInit: false,
  };
  const saved = storage.getItem(storageKey);
  if (!saved) return base;
  try {
    const parsed = JSON.parse(saved);
    const win = parsed.window || {};
    base.window = {
      open: !!win.open,
      minimized: !!win.minimized,
      x: Number.isFinite(win.x) ? win.x : null,
      y: Number.isFinite(win.y) ? win.y : null,
      w: Number.isFinite(win.w) ? win.w : 360,
      h: Number.isFinite(win.h) ? win.h : 420,
      chipY: Number.isFinite(win.chipY) ? win.chipY : null,
    };
    base.wantInit = base.window.open || base.window.minimized;
  } catch (err) {
    console.warn("Failed to load Tree-sitter state", err);
  }
  return base;
}
/**
 * Persists Tree-sitter window state needed to restore UI placement between sessions.
 */
export function saveTreeSitterState(
  windowState,
  { storageKey, storage = localStorage },
) {
  storage.setItem(storageKey, JSON.stringify({ window: windowState }));
}
