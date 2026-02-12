const SETTINGS_STORAGE_KEY = "code-panorama-settings";

export function createRootNode() {
  return { name: "", type: "dir", children: [], expanded: true, path: "" };
}

export function loadSettings(defaultSettings, storage = localStorage) {
  const saved = storage.getItem(SETTINGS_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaultSettings,
        ...parsed,
        ignores: parsed.ignores || defaultSettings.ignores,
        allow: parsed.allow || defaultSettings.allow
      };
    } catch (err) {
      console.warn("Failed to parse settings, using defaults", err);
    }
  }
  return { ...defaultSettings };
}

export function saveSettings(settings, storage = localStorage) {
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function loadTreeSitterState({ storageKey, languages, storage = localStorage }) {
  const base = {
    enabled: true,
    window: { open: false, minimized: false, x: null, y: null, w: 360, h: 420, chipY: null },
    ready: false,
    loading: false,
    parsing: false,
    error: null,
    cache: {},
    markers: {},
    pendingFileId: null,
    parser: null,
    Parser: null,
    Language: null,
    languages: Object.keys(languages).reduce((acc, key) => ({ ...acc, [key]: null }), {}),
    parseHandle: null,
    parseHandleType: null,
    wantInit: false
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
      chipY: Number.isFinite(win.chipY) ? win.chipY : null
    };
    base.wantInit = base.window.open || base.window.minimized;
  } catch (err) {
    console.warn("Failed to load Tree-sitter state", err);
  }
  return base;
}

export function saveTreeSitterState(windowState, { storageKey, storage = localStorage }) {
  storage.setItem(storageKey, JSON.stringify({ window: windowState }));
}
