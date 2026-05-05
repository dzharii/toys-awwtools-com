import {
  COLUMN_ORDER_PRESETS,
  DEFAULT_DENSITY,
  DENSITY_VALUES,
  STORAGE_KEY,
  TABLE_QUICK_FILTERS,
  TABLE_RENDER_CELL_LIMIT,
  TABLE_RENDER_LIMIT
} from "./constants.js";

export const DEFAULT_STATE = {
  inputText: "",
  parseResult: null,
  parseStatus: "empty",
  parseError: null,
  lastParseStartedAt: null,
  lastParseFinishedAt: null,
  inputMeta: {
    charCount: 0,
    lineCount: 0,
    nonEmptyLineCount: 0
  },
  rowSourceCandidates: [],
  selectedRowSourceId: null,
  selectedRowSourcePath: null,
  selectedRowSource: null,
  rowSourceStatus: "none",
  rowSourceWarning: null,
  flattenOptions: {
    mode: "dotPaths",
    arrayMode: "summary"
  },
  extractedRows: [],
  flatRows: [],
  scoredRows: [],
  columns: [],
  visibleColumnKeys: [],
  columnOrderPreset: "failureFirst",
  flattenStatus: "idle",
  flattenError: null,
  flattenWarnings: [],
  healthSummary: null,
  diagnostics: null,
  filters: {},
  sort: null,
  table: {
    sort: { columnKey: null, direction: "none" },
    searchQuery: "",
    quickFilter: "all",
    columnWidths: {},
    renderLimit: TABLE_RENDER_LIMIT,
    renderCellLimit: TABLE_RENDER_CELL_LIMIT,
    selectedRowIndex: null,
    selectedCell: null
  },
  highlightRules: [],
  highlightRulesEnabled: true,
  ui: {
    inputCollapsed: false,
    leftPaneWidth: null,
    rightTopHeight: null,
    density: DEFAULT_DENSITY,
    wrapCells: false,
    rowDetailsOpen: false,
    columnPickerOpen: false,
    columnSearchQuery: ""
  },
  performance: {
    lastRunId: 0,
    timings: {
      parseMs: null,
      rowSourceMs: null,
      flattenMs: null,
      profileMs: null,
      healthMs: null,
      viewModelMs: null,
      renderMs: null,
      exportMs: null
    },
    warnings: [],
    limits: {
      renderedRows: 0,
      totalMatchingRows: 0,
      renderLimited: false,
      reason: null
    }
  },
  transient: {
    parseRequestId: 0,
    pipelineRunId: 0,
    loadingExampleId: null
  },
  statusMessage: ""
};

function deepClone(value) {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeDensity(value) {
  return DENSITY_VALUES.includes(value) ? value : DEFAULT_DENSITY;
}

function normalizeQuickFilter(value) {
  return TABLE_QUICK_FILTERS.includes(value) ? value : "all";
}

function normalizeColumnOrderPreset(value) {
  return COLUMN_ORDER_PRESETS.includes(value) ? value : "failureFirst";
}

function normalizePersistedState(value) {
  if (!value || typeof value !== "object") return {};
  const normalized = {};

  if (typeof value.inputText === "string") {
    normalized.inputText = value.inputText;
  }

  if (Array.isArray(value.highlightRules)) normalized.highlightRules = value.highlightRules;
  if (typeof value.highlightRulesEnabled === "boolean") normalized.highlightRulesEnabled = value.highlightRulesEnabled;

  if (value.ui && typeof value.ui === "object") {
    const nextUi = {};
    if (typeof value.ui.inputCollapsed === "boolean") nextUi.inputCollapsed = value.ui.inputCollapsed;
    if (isFiniteNumber(value.ui.leftPaneWidth)) nextUi.leftPaneWidth = value.ui.leftPaneWidth;
    if (isFiniteNumber(value.ui.rightTopHeight)) nextUi.rightTopHeight = value.ui.rightTopHeight;
    if (typeof value.ui.wrapCells === "boolean") nextUi.wrapCells = value.ui.wrapCells;
    if (typeof value.ui.rowDetailsOpen === "boolean") nextUi.rowDetailsOpen = value.ui.rowDetailsOpen;
    nextUi.density = normalizeDensity(value.ui.density);
    normalized.ui = nextUi;
  }

  if (value.table && typeof value.table === "object") {
    const nextTable = {};
    if (value.table.columnWidths && typeof value.table.columnWidths === "object") {
      nextTable.columnWidths = value.table.columnWidths;
    }
    nextTable.quickFilter = normalizeQuickFilter(value.table.quickFilter);
    normalized.table = nextTable;
  }

  if (typeof value.columnOrderPreset === "string") {
    normalized.columnOrderPreset = normalizeColumnOrderPreset(value.columnOrderPreset);
  }

  return normalized;
}

function mergeNested(baseState, patch) {
  const nextState = { ...baseState, ...patch };

  const nestedKeys = [
    "inputMeta",
    "flattenOptions",
    "table",
    "ui",
    "filters",
    "performance",
    "transient"
  ];

  for (const key of nestedKeys) {
    if (patch[key] && typeof patch[key] === "object" && !Array.isArray(patch[key])) {
      nextState[key] = { ...baseState[key], ...patch[key] };
    }
  }

  if (patch.performance?.timings && typeof patch.performance.timings === "object") {
    nextState.performance.timings = { ...baseState.performance.timings, ...patch.performance.timings };
  }
  if (patch.performance?.limits && typeof patch.performance.limits === "object") {
    nextState.performance.limits = { ...baseState.performance.limits, ...patch.performance.limits };
  }
  if (patch.table?.sort && typeof patch.table.sort === "object") {
    nextState.table.sort = { ...baseState.table.sort, ...patch.table.sort };
  }

  nextState.ui = nextState.ui || deepClone(DEFAULT_STATE.ui);
  nextState.table = nextState.table || deepClone(DEFAULT_STATE.table);
  nextState.performance = nextState.performance || deepClone(DEFAULT_STATE.performance);

  nextState.ui.density = normalizeDensity(nextState.ui.density);
  nextState.table.quickFilter = normalizeQuickFilter(nextState.table.quickFilter);
  nextState.columnOrderPreset = normalizeColumnOrderPreset(nextState.columnOrderPreset);

  return nextState;
}

function getDefaultStorage() {
  if (!globalThis || !("localStorage" in globalThis)) return null;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function createMemoryStorage(seed = {}) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, String(value)]));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

export function loadPersistedState(storage = getDefaultStorage()) {
  if (!storage || typeof storage.getItem !== "function") return {};

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return normalizePersistedState(parsed);
  } catch {
    return {};
  }
}

export function persistUiState(state, storage = getDefaultStorage()) {
  if (!storage || typeof storage.setItem !== "function") return false;

  const payload = {
    ui: {
      inputCollapsed: Boolean(state?.ui?.inputCollapsed),
      leftPaneWidth: isFiniteNumber(state?.ui?.leftPaneWidth) ? state.ui.leftPaneWidth : null,
      rightTopHeight: isFiniteNumber(state?.ui?.rightTopHeight) ? state.ui.rightTopHeight : null,
      density: normalizeDensity(state?.ui?.density),
      wrapCells: Boolean(state?.ui?.wrapCells),
      rowDetailsOpen: Boolean(state?.ui?.rowDetailsOpen)
    },
    table: {
      quickFilter: normalizeQuickFilter(state?.table?.quickFilter),
      columnWidths: state?.table?.columnWidths && typeof state.table.columnWidths === "object" ? state.table.columnWidths : {}
    },
    highlightRules: Array.isArray(state?.highlightRules) ? state.highlightRules : [],
    highlightRulesEnabled: Boolean(state?.highlightRulesEnabled),
    columnOrderPreset: normalizeColumnOrderPreset(state?.columnOrderPreset)
  };

  if (typeof state?.inputText === "string" && state.inputText.length > 0) {
    payload.inputText = state.inputText;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function createInitialState(storage = getDefaultStorage()) {
  const initialState = deepClone(DEFAULT_STATE);
  const persisted = loadPersistedState(storage);
  return mergeNested(initialState, persisted);
}

let currentState = createInitialState();
const listeners = new Set();

function notifyStateListeners() {
  for (const listener of listeners) {
    listener(currentState);
  }
}

export function getState() {
  return currentState;
}

export function setState(nextState, { persist = true } = {}) {
  currentState = mergeNested(deepClone(DEFAULT_STATE), nextState || {});
  if (persist) persistUiState(currentState);
  notifyStateListeners();
  return currentState;
}

export function subscribe(listener) {
  if (typeof listener !== "function") {
    throw new TypeError("subscribe(listener) expects a function");
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateState(patchOrUpdater, { persist = true } = {}) {
  const patch = typeof patchOrUpdater === "function" ? patchOrUpdater(currentState) : patchOrUpdater;
  if (!patch || typeof patch !== "object") return currentState;
  currentState = mergeNested(currentState, patch);
  if (persist) persistUiState(currentState);
  notifyStateListeners();
  return currentState;
}
