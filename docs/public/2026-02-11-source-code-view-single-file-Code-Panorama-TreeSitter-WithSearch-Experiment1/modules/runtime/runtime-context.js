/**
 * Runtime state factories and normalization helpers.
 * Centralizes default state shapes so controllers share consistent contracts.
 */
import { defaults } from "../config.js";
import { createRefExtensionSet } from "../file-references.js";
/**
 * Creates default state for path-based file references, index progress, and reference panel UI.
 */
export function createInitialRefsState(
  enabled = true,
  allowList = defaults.allow,
) {
  return {
    enabled: !!enabled,
    inventory: { allPaths: new Set(), byBasename: new Map() },
    pathToLoadedFileId: new Map(),
    index: { byTarget: new Map(), bySource: new Map() },
    build: {
      running: false,
      runId: 0,
      progress: { processed: 0, total: 0 },
      pendingHandle: null,
      partial: false,
    },
    ui: { activePanel: null, activeToken: null, lastOpenAt: 0 },
    refsObserver: null,
    decoratedFiles: new Set(),
    extSet: createRefExtensionSet(allowList),
  };
}
/**
 * Creates default state for symbol indexing, incremental updates, and symbol panel UI.
 */
export function createInitialSymbolRefsState(enabled = true) {
  return {
    enabled: !!enabled,
    indexVersion: 0,
    index: { bySymbol: new Map() },
    contributions: {
      heuristicByFile: new Map(),
      treeByFile: new Map(),
      effectiveByFile: new Map(),
    },
    build: {
      running: false,
      runId: 0,
      pendingHandle: null,
      stage: "idle",
      progress: { processed: 0, total: 0 },
      partial: false,
      ready: false,
    },
    incremental: {
      pendingFileIds: new Set(),
      debounceHandle: null,
      batchHandle: null,
      running: false,
    },
    ui: {
      activePanel: null,
      activeSymbol: "",
      activeSourceFileId: "",
      renderedVersion: -1,
      refreshHandle: null,
    },
  };
}
/**
 * Creates default TOC filter, exclusion, and hover state containers.
 */
export function createInitialTocFilterState() {
  return {
    queryRaw: "",
    matcher: null,
    exclusions: new Set(),
    hoverKey: "",
    debounceTimer: null,
    segmentCache: new Map(),
  };
}
/**
 * Creates default Tree-sitter queue bookkeeping, including pending sets and scheduler handles.
 */
export function createInitialTreeSitterQueueState() {
  return {
    pendingIds: [],
    pendingSet: new Set(),
    inProgressFileId: null,
    paused: false,
    runId: 0,
    handle: null,
    handleType: null,
    statusRefreshHandle: null,
  };
}
/**
 * Creates progress counters used to report Tree-sitter analysis status.
 */
export function createInitialTreeSitterProgressState() {
  return {
    eligibleTotal: 0,
    completedPhase1: 0,
    completedPhase2: 0,
    skipped: 0,
    failed: 0,
    currentFilePath: "",
    finalized: false,
    tsUnavailable: false,
  };
}
/**
 * Creates aggregate load-progress state used by loading UI and diagnostics.
 */
export function createInitialLoadProgressState() {
  return {
    dirsVisited: 0,
    filesIncluded: 0,
    filesRead: 0,
    skipped: 0,
    errors: 0,
    bytesRead: 0,
    linesRead: 0,
    currentPath: "",
    phaseLabel: "Idle",
  };
}
/**
 * Creates aggregate repository stats used by summary, language, and largest-file views.
 */
export function createInitialAggregateState() {
  return {
    loadedFiles: 0,
    skippedFiles: 0,
    totalBytes: 0,
    totalLines: 0,
    languages: {},
    largest: [],
  };
}
/**
 * Normalizes persisted Tree-sitter runtime data into the full in-memory shape required by controllers.
 * Guarantees queue and progress containers exist before scheduling begins.
 */
export function normalizeTreeSitterRuntimeState(treeSitter) {
  const ts = treeSitter || {};
  ts.fileStateById = ts.fileStateById || {};
  ts.errors = Array.isArray(ts.errors) ? ts.errors : [];
  ts.progress = {
    ...createInitialTreeSitterProgressState(),
    ...(ts.progress || {}),
  };
  const queue = ts.queue || {};
  ts.queue = {
    pendingIds: Array.isArray(queue.pendingIds) ? queue.pendingIds.slice() : [],
    pendingSet: new Set(
      Array.isArray(queue.pendingIds) ? queue.pendingIds : [],
    ),
    inProgressFileId: queue.inProgressFileId || null,
    paused: !!queue.paused,
    runId: Number.isFinite(queue.runId) ? queue.runId : 0,
    handle: null,
    handleType: null,
    statusRefreshHandle: null,
  };
  return ts;
}
