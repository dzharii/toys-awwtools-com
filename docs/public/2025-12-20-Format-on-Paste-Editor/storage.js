(function () {
  const App = window.App = window.App || {};

  const CURRENT_WORKSPACE_KEY = "app:currentWorkspaceId";
  const WORKSPACE_PREFIX = "workspace:";
  const SAVE_DEBOUNCE_MS = 300;

  let workspaceId = null;
  let saveTimer = null;
  let getState = null;
  let onWarning = null;

  function warn(message) {
    if (onWarning) {
      onWarning(message);
    }
  }

  function isStorageAvailable() {
    try {
      const testKey = "__fop_test__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  function generateWorkspaceId() {
    if (window.crypto) {
      if (typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
      }
      if (typeof window.crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
        return (
          hex.slice(0, 4).join("") + "-" +
          hex.slice(4, 6).join("") + "-" +
          hex.slice(6, 8).join("") + "-" +
          hex.slice(8, 10).join("") + "-" +
          hex.slice(10, 16).join("")
        );
      }
    }
    return "ws-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function workspaceKey(id, key) {
    return WORKSPACE_PREFIX + id + ":" + key;
  }

  function readString(key, fallback) {
    if (!isStorageAvailable()) {
      warn("Local storage is unavailable. Changes will not be saved.");
      return fallback;
    }
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (err) {
      warn("Unable to read local storage. Changes will not be saved.");
      return fallback;
    }
  }

  function readJson(key, fallback) {
    if (!isStorageAvailable()) {
      warn("Local storage is unavailable. Changes will not be saved.");
      return fallback;
    }
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return fallback;
      }
      return JSON.parse(value);
    } catch (err) {
      warn("Saved data could not be read. Defaults restored.");
      return fallback;
    }
  }

  function writeString(key, value) {
    if (!isStorageAvailable()) {
      warn("Local storage is unavailable. Changes will not be saved.");
      return false;
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      warn("Local storage is full or blocked. Changes will not be saved.");
      return false;
    }
  }

  function writeJson(key, value) {
    return writeString(key, JSON.stringify(value));
  }

  function ensureWorkspaceId() {
    const existing = readString(CURRENT_WORKSPACE_KEY, "");
    if (existing) {
      return existing;
    }
    const id = generateWorkspaceId();
    writeString(CURRENT_WORKSPACE_KEY, id);
    return id;
  }

  function init(options) {
    getState = options.getState;
    onWarning = options.onWarning;
    workspaceId = ensureWorkspaceId();
    return workspaceId;
  }

  function loadState(defaults) {
    workspaceId = ensureWorkspaceId();
    const id = workspaceId;
    const editorText = readString(workspaceKey(id, "editorText"), defaults.editorText);
    const formattedPasteEnabled = readJson(
      workspaceKey(id, "formattedPasteEnabled"),
      defaults.formattedPasteEnabled
    );
    const insertionModeId = readString(
      workspaceKey(id, "insertionMode"),
      defaults.insertionModeId
    );
    const activePipeline = readJson(
      workspaceKey(id, "activePipeline"),
      defaults.activePipeline
    );
    const selectedProfileId = readString(
      workspaceKey(id, "selectedProfileId"),
      defaults.selectedProfileId
    );
    const uiState = readJson(
      workspaceKey(id, "uiState"),
      defaults.uiState
    );

    return {
      editorText: editorText,
      formattedPasteEnabled: !!formattedPasteEnabled,
      insertionModeId: insertionModeId,
      activePipeline: Array.isArray(activePipeline) ? activePipeline : defaults.activePipeline.slice(),
      selectedProfileId: selectedProfileId,
      uiState: typeof uiState === "object" && uiState !== null ? uiState : Object.assign({}, defaults.uiState)
    };
  }

  function saveState() {
    if (!getState) {
      return;
    }
    const state = getState();
    const id = workspaceId || ensureWorkspaceId();
    writeString(workspaceKey(id, "editorText"), state.editorText || "");
    writeJson(workspaceKey(id, "formattedPasteEnabled"), !!state.formattedPasteEnabled);
    writeString(workspaceKey(id, "insertionMode"), state.insertionModeId || "");
    writeJson(workspaceKey(id, "activePipeline"), state.activePipeline || []);
    writeString(workspaceKey(id, "selectedProfileId"), state.selectedProfileId || "");
    writeJson(workspaceKey(id, "uiState"), state.uiState || {});
  }

  function scheduleSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(saveState, SAVE_DEBOUNCE_MS);
  }

  function flushSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    saveState();
  }

  App.storage = {
    init: init,
    loadState: loadState,
    scheduleSave: scheduleSave,
    flushSave: flushSave,
    isStorageAvailable: isStorageAvailable
  };
})();
