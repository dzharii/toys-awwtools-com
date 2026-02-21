import {
  defaults,
  TREE_SITTER_LANGUAGES,
  TREE_SITTER_STORAGE_KEY
} from "./config.js";
import {
  createRootNode,
  loadSettings as loadStoredSettings,
  loadTreeSitterState as loadStoredTreeSitterState
} from "./persistence.js";

function createInitialTocFilterState() {
  return {
    queryRaw: "",
    matcher: null,
    exclusions: new Set(),
    hoverKey: "",
    debounceTimer: null,
    segmentCache: new Map()
  };
}

function createInitialState() {
  return {
    phase: "empty",
    files: [],
    tree: createRootNode(),
    logs: [],
    settings: loadStoredSettings(defaults),
    activeFileId: null,
    hiddenFiles: new Set(),
    tocSelection: new Set(),
    tocFilter: createInitialTocFilterState(),
    treeSitter: loadStoredTreeSitterState({
      storageKey: TREE_SITTER_STORAGE_KEY,
      languages: TREE_SITTER_LANGUAGES
    })
  };
}

export function createAppState() {
  const state = createInitialState();
  return {
    state,
    reset() {
      const fresh = createInitialState();
      Object.keys(state).forEach(key => delete state[key]);
      Object.assign(state, fresh);
    }
  };
}
