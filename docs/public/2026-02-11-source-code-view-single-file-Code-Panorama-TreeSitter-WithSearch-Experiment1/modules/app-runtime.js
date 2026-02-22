import {
  defaults,
  TREE_SITTER_ASSET_BASE,
  TREE_SITTER_STORAGE_KEY,
  SEARCH_CAP,
  SEARCH_SLICE_BUDGET,
  SEARCH_LIVE_DEBOUNCE,
  TOC_FILTER_DEBOUNCE,
  SEARCH_EXPLICIT_MIN,
  SEARCH_LIVE_MIN,
  PREVIEW_OPEN_DELAY,
  PREVIEW_SWITCH_DELAY,
  PREVIEW_INACTIVE_MS,
  PREVIEW_DEFAULT_WIDTH,
  PREVIEW_DEFAULT_HEIGHT,
  PREVIEW_MIN_WIDTH,
  PREVIEW_MIN_HEIGHT,
  PREVIEW_VIEWPORT_MARGIN,
  PREVIEW_GAP,
  PREVIEW_CACHE_LIMIT,
  PREVIEW_INITIAL_WIDTH_RATIO,
  PREVIEW_INITIAL_HEIGHT_RATIO,
  HIGHLIGHT_RETRY_DELAY_MS,
  HIGHLIGHT_MAX_RETRIES,
  MICROLIGHT_PENDING_CLASS,
  REFS_BUILD_SLICE_BUDGET,
  REFS_MAX_TOKEN_LENGTH,
  REFS_MAX_OCCURRENCES_PER_TARGET,
  REFS_MAX_REFERENCING_FILES_SHOWN,
  SYMBOL_REFS_BUILD_SLICE_BUDGET,
  SYMBOL_REFS_INCREMENTAL_DEBOUNCE_MS,
  SYMBOL_REFS_INCREMENTAL_BATCH_SIZE,
  SYMBOL_REFS_PANEL_REFRESH_DEBOUNCE_MS,
  SYMBOL_REFS_MAX_OCCURRENCES_PER_SYMBOL,
  SYMBOL_REFS_MAX_REFERENCE_FILES_SHOWN,
  SYMBOL_REFS_MAX_LINES_PER_FILE,
  SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
  SYMBOL_REFS_MIN_BRIDGE_LENGTH,
  TS_PARSE_SLICE_BUDGET,
  TS_PARSE_FILES_PER_SLICE,
  TS_QUEUE_STATUS_REFRESH_DEBOUNCE_MS,
  TREE_SITTER_LANGUAGES,
} from "./config.js";
import { getDomElements } from "./dom-elements.js";
import {
  createRootNode,
  loadSettings as loadStoredSettings,
  saveSettings as persistSettings,
  loadTreeSitterState as loadStoredTreeSitterState,
  saveTreeSitterState as persistTreeSitterState,
} from "./persistence.js";
import {
  formatBytes,
  setButtonLabel,
  hashString,
  buildMarkdownSnippet,
  copyTextToClipboard,
  copyFileSource,
  makeFileId,
  languageFromExt,
} from "./file-helpers.js";
import { buildOutlineModel, buildIncludeList } from "./tree-sitter-helpers.js";
import { createCodeHighlighter } from "./highlighter.js";
import {
  createRefExtensionSet,
  normalizeProjectPath,
  recordInventoryPath,
  extractReferenceCandidates,
  resolveReferenceCandidate,
} from "./file-references.js";
import {
  countLinesFromText,
  buildLineStartOffsets,
  buildGutterLineNumbers,
} from "./line-index.js";
import { clampLineNumberForFile } from "./runtime/line-navigation.js";
import {
  isConfigLikeFile,
  isSingleIdentifierText,
  extractIdentifierAtOffset,
  extractHeuristicSymbolsFromLine,
  extractTreeSitterSymbolContribution,
  createEmptySymbolContribution,
} from "./symbol-references.js";
import {
  createInitialRefsState,
  createInitialSymbolRefsState,
  createInitialTocFilterState,
  createInitialTreeSitterQueueState,
  createInitialTreeSitterProgressState,
  createInitialLoadProgressState,
  createInitialAggregateState,
  normalizeTreeSitterRuntimeState,
} from "./runtime/runtime-context.js";
import { createTocController } from "./runtime/toc-controller.js";
import { createSearchController } from "./runtime/search-controller.js";
import { createPreviewController } from "./runtime/preview-controller.js";
import { createSymbolController } from "./runtime/symbol-controller.js";
import { createReferencesController } from "./runtime/references-controller.js";
import { createTreeSitterController } from "./runtime/tree-sitter-controller.js";
import { createPanelsController } from "./runtime/panels-controller.js";

/**
 * Produces an absolute URL string for a runtime asset relative to this module.
 *
 * @param {string} path Asset path relative to the project root assets layout.
 * @returns {string} Absolute URL for loading the asset.
 */
function resolveAssetUrl(path) {
  return new URL(`../${path}`, import.meta.url).toString();
}

const state = {
  phase: "empty",
  files: [],
  tree: createRootNode(),
  sidebar: { pinned: true, width: 320, overlay: false, collapseTimer: null },
  progress: createInitialLoadProgressState(),
  aggregate: createInitialAggregateState(),
  logs: [],
  settings: loadStoredSettings(defaults),
  scanning: false,
  cancelled: false,
  activeFileId: null,
  hiddenFiles: new Set(),
  tocSelection: new Set(),
  tocFilter: createInitialTocFilterState(),
  treeSitter: loadStoredTreeSitterState({
    storageKey: TREE_SITTER_STORAGE_KEY,
    languages: TREE_SITTER_LANGUAGES,
  }),
  search: {
    running: false,
    runId: 0,
    results: [],
    rendered: 0,
    partial: false,
    capped: false,
    progress: { processed: 0, total: 0 },
    activeRun: null,
    liveTimer: null,
  },
  preview: { enabled: true },
  refs: createInitialRefsState(defaults.fileRefs),
  symbolRefs: createInitialSymbolRefsState(defaults.symbolRefs),
  support: {
    directoryPicker: typeof window.showDirectoryPicker === "function",
    webkitDirectory: "webkitdirectory" in document.createElement("input"),
  },
  seq: 0,
};

let runtimeDoc = document;
let els = getDomElements(runtimeDoc);

state.refs.enabled = state.settings.fileRefs !== false;
state.refs.extSet = createRefExtensionSet(state.settings.allow);
state.symbolRefs.enabled = state.settings.symbolRefs !== false;
normalizeTreeSitterRuntimeState(state.treeSitter);

let observer;
let scrollHandler;
const codeHighlighter = createCodeHighlighter({
  retryDelayMs: HIGHLIGHT_RETRY_DELAY_MS,
  maxRetries: HIGHLIGHT_MAX_RETRIES,
  pendingClassPrefix: MICROLIGHT_PENDING_CLASS,
  getNextSequence: () => (state.seq += 1),
});

let updateTocFilterMeta = () => {};
let scheduleTocRender = () => {};
let renderTableOfContents = () => {};
let updateTocControls = () => {};
let handleTocSelectAll = () => {};
let handleTocResetSelection = () => {};
let copySelectedFiles = () => {};
let hideSelectedFiles = () => {};
let showSelectedFiles = () => {};
let handleTocFilterInput = () => {};
let clearTocQuery = () => {};
let clearTocExclusions = () => {};
let handleTocSegmentPointerOver = () => {};
let handleTocSegmentPointerOut = () => {};
let handleTocSegmentFocusIn = () => {};
let handleTocSegmentFocusOut = () => {};
let handleTocSegmentExclusion = () => {};

let updateSearchAvailability = () => {};
let resetSearchPanel = () => {};
let startSearchRun = () => {};
let cancelSearchRun = () => {};
let scheduleLiveSearch = () => {};

let destroyPreviewWindow = () => {};
let clearPreviewCache = () => {};
let setupHoverPreview = () => {};
let handlePreviewViewportResize = () => {};
let setPreviewEnabled = () => {};
let attachHoverPreviewHandlers = () => {};
let createPreviewPanelWindow = () => null;

let createNormalizedSymbolContribution = () => ({
  fileId: "",
  sourcePath: "",
  source: "heuristic",
  definitions: [],
  references: [],
});
let destroySymbolReferencePanel = () => {};
let refreshEffectiveSymbolContribution = () => {};
let resetSymbolReferenceStateForLoad = () => {};
let scheduleSymbolReferenceBaselineBuild = () => {};
let scheduleSymbolReferenceIncrementalUpdate = () => {};
let startSymbolIndexRebuild = () => {};
let getSymbolReferenceStatusText = () => "";
let syncSymbolReferenceFeatureEnabled = () => {};

let destroyReferencePanel = () => {};
let cancelReferenceIndexBuild = () => {};
let resetReferenceStateForLoad = () => {};
let rebuildPathToLoadedFileMap = () => {};
let recordInventoryPathForRefs = () => {};
let observeReferenceSection = () => {};
let scheduleReferenceIndexBuild = () => {};
let syncReferenceFeatureEnabled = () => {};

let updateTreeSitterWindowUI = () => {};
let handleTreeButtonClick = () => {};
let closeTreeSitterWindow = () => {};
let minimizeTreeSitterWindow = () => {};
let restoreTreeSitterWindow = () => {};
let handleTreeSitterDrag = () => {};
let handleTreeSitterResize = () => {};
let handleChipDrag = () => {};
let handleViewportResize = () => {};
let maybeInitTreeSitterRuntime = () => Promise.resolve();
let cancelPendingTreeSitterParse = () => {};
let cancelTreeSitterQueue = () => {};
let pauseTreeSitterQueue = () => {};
let resumeTreeSitterQueue = () => {};
let getTreeSitterQueueStatusText = () => "";
let updateTreeSitterParseButtonLabel = () => {};
let runImmediateFileAnalysis = () => {};
let enqueueFileForBackgroundParsing = () => {};
let rebuildTreeSitterQueue = () => {};
let finalizeTreeSitterQueueAfterLoad = () => {};
let handleActiveFileChange = () => {};
let renderTreeSitterPanel = () => {};
let scrollToFileLine = () => {};

let closePanels = () => {};
let openSettings = () => {};
let closeSettings = () => {};
let saveSettingsFromForm = () => {};
let applyDisplaySettings = () => {};
let openStatsPanel = () => {};
let renderStatsPanel = () => {};
let closeStatsPanel = () => {};
let openLogPanel = () => {};
let closeLogPanel = () => {};
let openSupportPanel = () => {};
let closeSupportPanel = () => {};

function initRuntimeControllers() {
  const toc = createTocController({
    state,
    els,
    doc: runtimeDoc,
    tocFilterDebounceMs: TOC_FILTER_DEBOUNCE,
    buildMarkdownSnippet,
    copyTextToClipboard,
    isFileHidden: (fileId) => isFileHidden(fileId),
    applyFileVisibility: (fileId) => applyFileVisibility(fileId),
    renderDirectoryTree: () => renderDirectoryTree(),
    ensureActiveFileVisible: () => ensureActiveFileVisible(),
    setActiveFile: (fileId) => setActiveFile(fileId),
  });
  ({
    updateTocFilterMeta,
    scheduleTocRender,
    renderTableOfContents,
    updateTocControls,
    handleTocSelectAll,
    handleTocResetSelection,
    copySelectedFiles,
    hideSelectedFiles,
    showSelectedFiles,
    handleTocFilterInput,
    clearTocQuery,
    clearTocExclusions,
    handleTocSegmentPointerOver,
    handleTocSegmentPointerOut,
    handleTocSegmentFocusIn,
    handleTocSegmentFocusOut,
    handleTocSegmentExclusion,
  } = toc);

  const search = createSearchController({
    state,
    els,
    doc: runtimeDoc,
    searchCap: SEARCH_CAP,
    searchSliceBudget: SEARCH_SLICE_BUDGET,
    searchLiveDebounce: SEARCH_LIVE_DEBOUNCE,
    searchExplicitMin: SEARCH_EXPLICIT_MIN,
    searchLiveMin: SEARCH_LIVE_MIN,
    isFileHidden: (fileId) => isFileHidden(fileId),
    navigateToFileLine: (fileId, line) => navigateToFileLine(fileId, line),
  });
  ({
    updateSearchAvailability,
    resetSearchPanel,
    startSearchRun,
    cancelSearchRun,
    scheduleLiveSearch,
  } = search);

  const preview = createPreviewController({
    state,
    els,
    doc: runtimeDoc,
    getFileSection: (fileId) => getFileSection(fileId),
    updateControlBar: () => updateControlBar(),
    config: {
      openDelay: PREVIEW_OPEN_DELAY,
      switchDelay: PREVIEW_SWITCH_DELAY,
      inactiveMs: PREVIEW_INACTIVE_MS,
      defaultWidth: PREVIEW_DEFAULT_WIDTH,
      defaultHeight: PREVIEW_DEFAULT_HEIGHT,
      minWidth: PREVIEW_MIN_WIDTH,
      minHeight: PREVIEW_MIN_HEIGHT,
      viewportMargin: PREVIEW_VIEWPORT_MARGIN,
      gap: PREVIEW_GAP,
      cacheLimit: PREVIEW_CACHE_LIMIT,
      initialWidthRatio: PREVIEW_INITIAL_WIDTH_RATIO,
      initialHeightRatio: PREVIEW_INITIAL_HEIGHT_RATIO,
    },
  });
  ({
    destroyPreviewWindow,
    clearPreviewCache,
    setupHoverPreview,
    handlePreviewViewportResize,
    setPreviewEnabled,
    attachHoverPreviewHandlers,
    createPanelWindow: createPreviewPanelWindow,
  } = preview);

  const symbol = createSymbolController({
    state,
    els,
    normalizeProjectPath,
    createEmptySymbolContribution,
    isConfigLikeFile,
    isSingleIdentifierText,
    extractIdentifierAtOffset,
    extractHeuristicSymbolsFromLine,
    symbolRefsBuildSliceBudget: SYMBOL_REFS_BUILD_SLICE_BUDGET,
    symbolRefsIncrementalDebounceMs: SYMBOL_REFS_INCREMENTAL_DEBOUNCE_MS,
    symbolRefsIncrementalBatchSize: SYMBOL_REFS_INCREMENTAL_BATCH_SIZE,
    symbolRefsPanelRefreshDebounceMs: SYMBOL_REFS_PANEL_REFRESH_DEBOUNCE_MS,
    symbolRefsMaxOccurrencesPerSymbol: SYMBOL_REFS_MAX_OCCURRENCES_PER_SYMBOL,
    symbolRefsMaxReferenceFilesShown: SYMBOL_REFS_MAX_REFERENCE_FILES_SHOWN,
    symbolRefsMaxLinesPerFile: SYMBOL_REFS_MAX_LINES_PER_FILE,
    symbolRefsMinIdentifierLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
    symbolRefsMinBridgeLength: SYMBOL_REFS_MIN_BRIDGE_LENGTH,
    previewInactiveMs: PREVIEW_INACTIVE_MS,
    addLog: (path, reason) => addLog(path, reason),
    updateControlBar: () => updateControlBar(),
    startSearchRun: (source) => startSearchRun(source),
    navigateToFileLine: (fileId, line) => navigateToFileLine(fileId, line),
    createPreviewPanelWindow: (options) => createPreviewPanelWindow(options),
    attachHoverPreviewHandlers: (container) =>
      attachHoverPreviewHandlers(container),
    copyTextToClipboard,
  });
  ({
    destroySymbolReferencePanel,
    createNormalizedSymbolContribution,
    refreshEffectiveSymbolContribution,
    resetSymbolReferenceStateForLoad,
    scheduleSymbolReferenceBaselineBuild,
    scheduleSymbolReferenceIncrementalUpdate,
    startSymbolIndexRebuild,
    getSymbolReferenceStatusText,
    syncSymbolReferenceFeatureEnabled,
  } = symbol);

  const references = createReferencesController({
    state,
    els,
    createRefExtensionSet,
    normalizeProjectPath,
    recordInventoryPath,
    extractReferenceCandidates,
    resolveReferenceCandidate,
    buildLineStartOffsets,
    codeHighlighter,
    getFileSection: (fileId) => getFileSection(fileId),
    addLog: (path, reason) => addLog(path, reason),
    setActiveFile: (fileId) => setActiveFile(fileId),
    navigateToFileLine: (fileId, line) => navigateToFileLine(fileId, line),
    ensureFileVisible: (fileId) => ensureFileVisible(fileId),
    createPreviewPanelWindow: (options) => createPreviewPanelWindow(options),
    copyTextToClipboard,
    buildMarkdownSnippet,
    updateControlBar: () => updateControlBar(),
    PREVIEW_INACTIVE_MS,
    REFS_BUILD_SLICE_BUDGET,
    REFS_MAX_TOKEN_LENGTH,
    REFS_MAX_OCCURRENCES_PER_TARGET,
    REFS_MAX_REFERENCING_FILES_SHOWN,
  });
  ({
    destroyReferencePanel,
    cancelReferenceIndexBuild,
    resetReferenceStateForLoad,
    rebuildPathToLoadedFileMap,
    recordInventoryPathForRefs,
    observeReferenceSection,
    scheduleReferenceIndexBuild,
    syncReferenceFeatureEnabled,
  } = references);
  const treeSitter = createTreeSitterController({
    state,
    els,
    doc: runtimeDoc,
    resolveAssetUrl,
    TREE_SITTER_ASSET_BASE,
    TREE_SITTER_LANGUAGES,
    TS_PARSE_SLICE_BUDGET,
    TS_PARSE_FILES_PER_SLICE,
    TS_QUEUE_STATUS_REFRESH_DEBOUNCE_MS,
    SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
    SYMBOL_REFS_MIN_BRIDGE_LENGTH,
    REFS_MAX_TOKEN_LENGTH,
    TREE_SITTER_STORAGE_KEY,
    persistTreeSitterState,
    buildOutlineModel,
    buildIncludeList,
    extractTreeSitterSymbolContribution,
    isConfigLikeFile,
    extractHeuristicSymbolsFromLine,
    extractReferenceCandidates,
    createInitialTreeSitterQueueState,
    createInitialTreeSitterProgressState,
    setButtonLabel,
    hashString,
    normalizeTreeSitterRuntimeState,
    addLog: (path, reason) => addLog(path, reason),
    updateControlBar: () => updateControlBar(),
    setActiveFile: (fileId) => setActiveFile(fileId),
    getFileSection: (fileId) => getFileSection(fileId),
    startSymbolIndexRebuild: (reason) => startSymbolIndexRebuild(reason),
    createNormalizedSymbolContribution: (file, contribution, source) =>
      createNormalizedSymbolContribution(file, contribution, source),
    refreshEffectiveSymbolContribution: (fileId) =>
      refreshEffectiveSymbolContribution(fileId),
    scheduleSymbolReferenceIncrementalUpdate: (fileId) =>
      scheduleSymbolReferenceIncrementalUpdate(fileId),
    isFileHidden: (fileId) => isFileHidden(fileId),
  });
  ({
    updateTreeSitterWindowUI,
    handleTreeButtonClick,
    closeTreeSitterWindow,
    minimizeTreeSitterWindow,
    restoreTreeSitterWindow,
    handleTreeSitterDrag,
    handleTreeSitterResize,
    handleChipDrag,
    handleViewportResize,
    maybeInitTreeSitterRuntime,
    cancelPendingTreeSitterParse,
    cancelTreeSitterQueue,
    pauseTreeSitterQueue,
    resumeTreeSitterQueue,
    getTreeSitterQueueStatusText,
    updateTreeSitterParseButtonLabel,
    runImmediateFileAnalysis,
    enqueueFileForBackgroundParsing,
    rebuildTreeSitterQueue,
    finalizeTreeSitterQueueAfterLoad,
    handleActiveFileChange,
    scrollToFileLine,
    renderTreeSitterPanel,
  } = treeSitter);

  const panels = createPanelsController({
    state,
    els,
    doc: runtimeDoc,
    formatBytes,
    persistSettings,
    syncReferenceFeatureEnabled: () => syncReferenceFeatureEnabled(),
    syncSymbolReferenceFeatureEnabled: () =>
      syncSymbolReferenceFeatureEnabled(),
    destroyReferencePanel: () => destroyReferencePanel(),
    destroySymbolReferencePanel: () => destroySymbolReferencePanel(),
  });
  ({
    closePanels,
    openSettings,
    closeSettings,
    saveSettingsFromForm,
    applyDisplaySettings,
    openStatsPanel,
    renderStatsPanel,
    closeStatsPanel,
    openLogPanel,
    closeLogPanel,
    openSupportPanel,
    closeSupportPanel,
  } = panels);
}

function isFileHidden(fileId) {
  return state.hiddenFiles.has(fileId);
}

function getFileSection(fileId) {
  if (!fileId) return null;
  return runtimeDoc.querySelector(`.file-section[data-file-id="${fileId}"]`);
}

function applyFileVisibility(fileId) {
  const section = getFileSection(fileId);
  if (!section) return;
  section.classList.toggle("is-hidden", isFileHidden(fileId));
}

function ensureActiveFileVisible() {
  if (state.activeFileId && !isFileHidden(state.activeFileId)) {
    updateActiveLine();
    return;
  }
  const next = state.files.find((file) => !isFileHidden(file.id));
  if (next) {
    setActiveFile(next.id);
    return;
  }
  state.activeFileId = null;
  renderDirectoryTree();
  if (els.activeIndicator) els.activeIndicator.textContent = "Active: none";
  handleActiveFileChange();
}

function parseHashValue(hash) {
  const raw = decodeURIComponent((hash || "").replace(/^#/, ""));
  if (!raw) return { fileId: "", line: null };
  const match = raw.match(/^([^@]+)@(\d+)$/);
  if (match) {
    return { fileId: match[1], line: parseInt(match[2], 10) };
  }
  return { fileId: raw, line: null };
}

function ensureFileVisible(fileId) {
  if (!fileId || !isFileHidden(fileId)) return false;
  state.hiddenFiles.delete(fileId);
  applyFileVisibility(fileId);
  renderDirectoryTree();
  renderTableOfContents();
  return true;
}

function navigateToFileLine(fileId, line) {
  if (!fileId || !Number.isFinite(line)) return;
  ensureFileVisible(fileId);
  const hash = `#${fileId}@${line}`;
  if (location.hash === hash) {
    handleHashChange();
  } else {
    location.hash = hash;
  }
}

function maybeYield(lastYieldRef) {
  const now = performance.now();
  if (now - lastYieldRef.value > 16) {
    lastYieldRef.value = now;
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  return Promise.resolve();
}

function resetStateForLoad() {
  state.phase = "empty";
  state.files = [];
  state.tree = createRootNode();
  destroyPreviewWindow();
  codeHighlighter.disconnect();
  clearPreviewCache();
  resetReferenceStateForLoad();
  resetSymbolReferenceStateForLoad();
  cancelPendingTreeSitterParse();
  normalizeTreeSitterRuntimeState(state.treeSitter);
  if (state.treeSitter.queue?.statusRefreshHandle) {
    clearTimeout(state.treeSitter.queue.statusRefreshHandle);
  }
  state.treeSitter.cache = {};
  state.treeSitter.markers = {};
  state.treeSitter.fileStateById = {};
  state.treeSitter.errors = [];
  state.treeSitter.queue = createInitialTreeSitterQueueState();
  state.treeSitter.progress = createInitialTreeSitterProgressState();
  state.treeSitter.pendingFileId = null;
  state.treeSitter.parsing = false;
  state.treeSitter.error = null;
  state.progress = createInitialLoadProgressState();
  state.aggregate = createInitialAggregateState();
  state.logs = [];
  state.seq = 0;
  state.cancelled = false;
  state.activeFileId = null;
  state.hiddenFiles = new Set();
  state.tocSelection = new Set();
  if (state.tocFilter.debounceTimer) {
    clearTimeout(state.tocFilter.debounceTimer);
  }
  state.tocFilter = createInitialTocFilterState();
  if (els.tocFilterQuery) els.tocFilterQuery.value = "";
  els.fileContainer.innerHTML = "";
  renderTableOfContents();
  renderDirectoryTree();
  resetSearchPanel();
  updateControlBar();
  updateSidebarVisibility();
  hideBanner();
  els.noFiles.classList.add("hidden");
  updateEmptyOverlay();
}

/**
 * Refreshes the main control bar to reflect current load, parsing, indexing, and selection state.
 *
 * @returns {void}
 */
function updateControlBar() {
  const p = state.progress;
  const a = state.aggregate;
  const parsingText = getTreeSitterQueueStatusText({ compact: true });
  if (state.phase === "empty") {
    els.controlStatus.textContent = "Ready";
    els.controlStatus.title = "";
    els.controlActions.classList.add("hidden");
    els.activeIndicator.textContent = "Active: none";
  } else if (state.phase === "loading") {
    const phaseLabel = state.cancelled
      ? "Cancelling"
      : state.progress.phaseLabel || "Scanning";
    const progressText = `${phaseLabel} • dirs ${p.dirsVisited} • files included ${p.filesIncluded} • read ${p.filesRead} • skipped ${p.skipped} • errors ${p.errors} • bytes ${formatBytes(p.bytesRead)} • lines ${p.linesRead}`;
    const text = parsingText
      ? `${progressText} • ${parsingText}`
      : progressText;
    els.controlStatus.textContent = text;
    els.controlStatus.title = `${p.bytesRead} bytes read`;
    els.controlActions.classList.remove("hidden");
    els.activeIndicator.textContent = "Active: loading…";
  } else {
    const indexingText = getSymbolReferenceStatusText();
    const text =
      parsingText ||
      indexingText ||
      `Summary • files ${a.loadedFiles} • lines ${a.totalLines} • bytes ${formatBytes(a.totalBytes)} • skipped ${a.skippedFiles} • errors ${state.progress.errors}`;
    els.controlStatus.textContent = text;
    els.controlStatus.title = parsingText
      ? "Background parsing status"
      : indexingText
        ? "Building project-wide symbol index"
        : `${a.totalBytes} bytes loaded`;
    els.controlActions.classList.remove("hidden");
    const activeFile = state.files.find((f) => f.id === state.activeFileId);
    els.activeIndicator.innerHTML = `<span>Active:</span> <span class="value" title="${activeFile ? activeFile.path : "none"}">${activeFile ? activeFile.path : "none"}</span>`;
  }

  const loading = state.phase === "loading";
  els.openFolder.disabled = loading || !state.support.directoryPicker;
  els.emptyOpen.disabled = loading || !state.support.directoryPicker;
  els.fallbackPicker.disabled = loading;
  els.emptyFallback.disabled = loading;
  els.cancelLoad.disabled = !loading;
  const hasFiles = state.aggregate.loadedFiles > 0;
  els.statsBtn.disabled = !hasFiles;
  els.statsBtn.classList.toggle("hidden", !hasFiles);
  els.logToggle.disabled = state.logs.length === 0;
  if (els.treeBtn) {
    els.treeBtn.disabled = !hasFiles;
    els.treeBtn.classList.toggle(
      "active",
      state.treeSitter.window.open || state.treeSitter.window.minimized,
    );
  }
  if (els.previewToggle) {
    els.previewToggle.disabled = !hasFiles;
    els.previewToggle.classList.toggle("active", state.preview.enabled);
    els.previewToggle.setAttribute(
      "aria-pressed",
      state.preview.enabled ? "true" : "false",
    );
  }

  if (!state.support.directoryPicker) {
    els.openFolder.title = "Folder picker not supported";
    els.emptyOpen.title = "Folder picker not supported";
  }

  const openLabel = state.phase === "loaded" ? "Load another" : "Open folder";
  setButtonLabel(els.openFolder, "📂", openLabel);
  setButtonLabel(els.emptyOpen, "📂", "Open folder");
  setButtonLabel(els.fallbackPicker, "🗂️", "Use file picker");
  setButtonLabel(els.emptyFallback, "🗂️", "Use file picker");
  setButtonLabel(els.cancelLoad, "⛔", "Cancel");
  setButtonLabel(els.statsBtn, "📊", "Stats");
  setButtonLabel(els.logToggle, "📜", "Log");
  if (els.treeBtn) setButtonLabel(els.treeBtn, "🌳", "Tree-sitter");
  if (els.previewToggle) setButtonLabel(els.previewToggle, "👀", "Preview");
  updateTreeSitterParseButtonLabel();

  updateOffsets();
  updateSearchAvailability();
}

/**
 * Shows or hides the sidebar and its edge affordance based on whether a project is active.
 *
 * @returns {void}
 */
function updateSidebarVisibility() {
  const shouldShow = state.phase !== "empty";
  els.sidebar.classList.toggle("hidden", !shouldShow);
  els.sidebarEdge.classList.toggle("hidden", !shouldShow);
}

/**
 * Updates the empty-state overlay and main panel interactivity based on whether files are loaded.
 *
 * @returns {void}
 */
function updateEmptyOverlay() {
  const isEmpty = state.phase === "empty";
  els.emptyPanel.classList.toggle("hidden", !isEmpty);
  els.main.classList.toggle("inactive", isEmpty);
}

/**
 * Recomputes layout CSS variables used to position stacked UI elements.
 *
 * @returns {void}
 */
function updateOffsets() {
  const topHeight = els.topbar?.getBoundingClientRect().height || 0;
  const controlHeight = els.controlBar?.getBoundingClientRect().height || 0;
  document.documentElement.style.setProperty(
    "--control-offset",
    `${topHeight}px`,
  );
  document.documentElement.style.setProperty(
    "--stack-offset",
    `${topHeight + controlHeight}px`,
  );
}

/**
 * Updates the sidebar pin button label to match current pinned/unpinned state.
 *
 * @returns {void}
 */
function updateSidebarPinLabel() {
  const pinned = state.sidebar.pinned;
  setButtonLabel(
    els.sidebarPin,
    pinned ? "📌" : "📍",
    pinned ? "Unpin" : "Pin",
  );
}

/**
 * Applies standard icon+label formatting to static UI buttons and chips.
 *
 * @returns {void}
 */
function applyStaticButtonLabels() {
  setButtonLabel(els.settingsToggle, "⚙️", "Settings");
  setButtonLabel(els.settingsClose, "✖️", "Close");
  setButtonLabel(els.settingsSave, "💾", "Save settings");
  setButtonLabel(els.statsClose, "✖️", "Close");
  setButtonLabel(els.logClose, "✖️", "Close");
  setButtonLabel(els.supportClose, "✖️", "Close");
  setButtonLabel(els.supportLink, "🛟", "Browser support");
  updateSidebarPinLabel();
  if (els.tsClose) setButtonLabel(els.tsClose, "✖️", "Close");
  if (els.tsMinimize) setButtonLabel(els.tsMinimize, "➖", "Minimize");
  updateTreeSitterParseButtonLabel();
  if (els.tsChip) els.tsChip.textContent = "🌳 Tree-sitter";
}

/**
 * Displays or hides the empty-state support message depending on folder picker availability.
 *
 * @returns {void}
 */
function showEmptySupportMessage() {
  const target = document.getElementById("empty-support");
  if (state.support.directoryPicker) {
    target.classList.add("hidden");
    target.textContent = "";
  } else {
    target.classList.remove("hidden");
    target.textContent =
      "Folder picker not supported in this browser. Use file picker.";
    els.emptyFallback.focus();
  }
}

/**
 * Hides the status banner and clears its content and kind.
 *
 * @returns {void}
 */
function hideBanner() {
  els.statusBanner.classList.add("hidden");
  els.statusBanner.textContent = "";
  delete els.statusBanner.dataset.kind;
}

/**
 * Shows a status banner message with a semantic kind for styling and user feedback.
 *
 * @param {string} text Banner text.
 * @param {string} [kind="info"] Banner kind identifier.
 * @returns {void}
 */
function showBanner(text, kind = "info") {
  els.statusBanner.dataset.kind = kind;
  els.statusBanner.classList.remove("hidden");
  els.statusBanner.textContent = text;
}

/**
 * Prompts the user to pick a folder and initiates project loading, falling back with guidance on failure.
 *
 * @returns {Promise<void>}
 */

async function pickFolder() {
  if (!state.support.directoryPicker) {
    showEmptySupportMessage();
    return;
  }
  try {
    const handle = await window.showDirectoryPicker();
    await loadFromDirectoryHandle(handle);
  } catch (err) {
    if (err?.name === "AbortError") return;
    addLog("picker", `error: ${err.message}`);
    showBanner("Permission denied or unavailable. Try the file picker.");
    els.fallbackPicker.focus();
    updateControlBar();
  }
}

/**
 * Loads a project by traversing a directory handle and ingesting supported files into state and UI.
 *
 * @param {FileSystemDirectoryHandle} handle Directory handle chosen by the user.
 * @returns {Promise<void>}
 */

async function loadFromDirectoryHandle(handle) {
  resetStateForLoad();
  state.phase = "loading";
  state.scanning = true;
  state.progress.phaseLabel = "Scanning";
  updateControlBar();
  updateSidebarVisibility();
  updateEmptyOverlay();
  const lastYield = { value: performance.now() };
  try {
    await traverseDirectory(handle, "");
  } finally {
    finishLoad();
    await maybeYield(lastYield);
  }
}

/**
 * Recursively traverses a directory handle, applying ignore rules and processing eligible files.
 *
 * @param {FileSystemDirectoryHandle} dirHandle Directory to traverse.
 * @param {string} prefix Current path prefix.
 * @returns {Promise<void>}
 */

async function traverseDirectory(dirHandle, prefix) {
  if (state.cancelled) return;
  state.progress.phaseLabel = "Scanning";
  state.progress.dirsVisited += 1;
  updateControlBar();
  const lastYield = { value: performance.now() };
  for await (const [name, entry] of dirHandle.entries()) {
    if (state.cancelled) break;
    const path = prefix ? `${prefix}/${name}` : name;
    state.progress.currentPath = path;
    try {
      if (entry.kind === "directory") {
        if (shouldIgnore(name)) continue;
        await traverseDirectory(entry, path);
      } else {
        if (pathHasIgnoredSegment(path)) {
          addLog(path, "ignored-dir");
          state.progress.skipped += 1;
          state.aggregate.skippedFiles += 1;
          continue;
        }
        recordInventoryPathForRefs(path);
        await processFileEntry(entry, path);
      }
    } catch (err) {
      addLog(path, `error: ${err.message}`);
      state.progress.errors += 1;
      state.progress.skipped += 1;
      state.aggregate.skippedFiles += 1;
    }
    updateControlBar();
    await maybeYield(lastYield);
  }
}

/**
 * Checks whether a directory or file name matches the configured ignore list.
 *
 * @param {string} name Segment name.
 * @returns {boolean} True if the segment should be ignored.
 */
function shouldIgnore(name) {
  const lower = name.toLowerCase();
  return state.settings.ignores.some((x) => x.trim().toLowerCase() === lower);
}

/**
 * Checks whether any segment of a path is ignored by current settings.
 *
 * @param {string} path Project path.
 * @returns {boolean} True if the path contains an ignored segment.
 */
function pathHasIgnoredSegment(path) {
  const parts = path.split(/[\\/]/);
  return parts.some((part) => shouldIgnore(part));
}

/**
 * Determines whether a file should be loaded based on extension allowlist and size limits.
 *
 * @param {string} path File path.
 * @param {number} size File size in bytes.
 * @returns {{allowed:boolean, reason?:string, ext?:string}} Allow decision and metadata.
 */
function isAllowedFile(path, size) {
  const parts = path.split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
  if (!ext) return { allowed: false, reason: "no-extension" };
  if (ext === "json" && !state.settings.includeJson)
    return { allowed: false, reason: "json-off" };
  const allowSet = new Set(
    state.settings.allow
      .map((a) => a.toLowerCase())
      .concat(state.settings.includeJson ? ["json"] : []),
  );
  if (!allowSet.has(ext)) return { allowed: false, reason: "filtered" };
  if (size > state.settings.maxFileSize)
    return { allowed: false, reason: "too-large" };
  return { allowed: true, ext };
}

/**
 * Validates a directory entry and, when eligible, reads and stores it as a loaded source file.
 *
 * @param {FileSystemFileHandle} entry File entry handle.
 * @param {string} path Project-relative path.
 * @returns {Promise<void>}
 */

async function processFileEntry(entry, path) {
  const file = await entry.getFile();
  const allowed = isAllowedFile(path, file.size);
  if (!allowed.allowed) {
    addLog(path, allowed.reason || "filtered");
    state.progress.skipped += 1;
    state.aggregate.skippedFiles += 1;
    return;
  }
  state.progress.filesIncluded += 1;
  updateControlBar();
  await readAndStoreFile(file, path, allowed.ext);
}

/**
 * Reads a file's text content and stores a normalized record while updating UI, aggregates, and analysis queues.
 *
 * @param {File} file Browser File object.
 * @param {string} path Project-relative path.
 * @param {string} extHint Extension hint used for language classification.
 * @returns {Promise<void>}
 */

async function readAndStoreFile(file, path, extHint) {
  if (state.cancelled) return;
  let text;
  try {
    state.progress.phaseLabel = "Reading";
    updateControlBar();
    text = await file.text();
  } catch (err) {
    addLog(path, `error: ${err.message}`);
    state.progress.errors += 1;
    state.progress.skipped += 1;
    state.aggregate.skippedFiles += 1;
    return;
  }
  if (state.cancelled) return;
  const textFull = text;
  const charCount = textFull.length;
  const lineOffsets = buildLineStartOffsets(textFull);
  const lineCount = countLinesFromText(textFull);
  const ext = extHint || path.split(".").pop() || "";
  const language = languageFromExt(ext);
  const id = makeFileId(path);
  const record = {
    id,
    path,
    segments: path.split(/[\\/]/),
    ext,
    size: file.size,
    modified: file.lastModified ? new Date(file.lastModified) : null,
    text: textFull,
    textFull,
    lineIndex: {
      offsets: lineOffsets,
      lineCount,
    },
    language,
    lineCount,
    charCount,
    status: "loaded",
  };
  state.files.push(record);
  state.progress.filesRead += 1;
  state.progress.bytesRead += file.size;
  state.progress.linesRead += lineCount;
  state.aggregate.loadedFiles += 1;
  state.aggregate.totalBytes += file.size;
  state.aggregate.totalLines += lineCount;
  state.aggregate.languages[language] =
    (state.aggregate.languages[language] || 0) + lineCount;
  updateLargest(record);
  renderFileSection(record);
  insertIntoTree(record);
  runImmediateFileAnalysis(record);
  enqueueFileForBackgroundParsing(record, "loaded");
  state.treeSitter.wantInit = true;
  maybeInitTreeSitterRuntime();
  scheduleTocRender();
  updateControlBar();
  maybeWarnMemory();
  state.progress.phaseLabel = "Scanning";
}

/**
 * Updates the "largest files" aggregate list with a new file record.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
function updateLargest(file) {
  state.aggregate.largest.push(file);
  state.aggregate.largest.sort((a, b) => b.size - a.size);
  state.aggregate.largest = state.aggregate.largest.slice(0, 8);
}

/**
 * Formats a line number into leading and significant digit parts for aligned gutter rendering.
 *
 * @param {number} lineNumber 1-based line number.
 * @returns {{leading:string, significant:string}} Split formatted parts.
 */
function formatLineNumberParts(lineNumber) {
  const value = Math.max(
    0,
    Number.isFinite(lineNumber) ? Math.floor(lineNumber) : 0,
  );
  const formatted = value.toLocaleString("en-US", {
    useGrouping: true,
    minimumIntegerDigits: 5,
  });
  let firstSignificantDigit = -1;
  for (let i = 0; i < formatted.length; i += 1) {
    const ch = formatted[i];
    if (ch >= "1" && ch <= "9") {
      firstSignificantDigit = i;
      break;
    }
  }
  if (firstSignificantDigit < 0) {
    firstSignificantDigit = formatted.length - 1;
  }
  return {
    leading: formatted.slice(0, firstSignificantDigit),
    significant: formatted.slice(firstSignificantDigit),
  };
}

/**
 * Builds the line-number gutter DOM for a given line count.
 *
 * @param {number} lineCount Number of lines in the file.
 * @returns {HTMLElement} Gutter element.
 */
function buildLineNumberGutter(lineCount) {
  const lineNumbers = buildGutterLineNumbers(lineCount);
  const gutter = document.createElement("div");
  gutter.className = "line-gutter";
  gutter.setAttribute("aria-hidden", "true");
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < lineNumbers.length; i += 1) {
    const line = lineNumbers[i];
    const row = document.createElement("div");
    row.className = "line-gutter-row";
    row.dataset.line = String(line);
    const parts = formatLineNumberParts(line);
    const leading = document.createElement("span");
    leading.className = "line-num-leading";
    leading.textContent = parts.leading;
    const significant = document.createElement("span");
    significant.className = "line-num-significant";
    significant.textContent = parts.significant;
    row.appendChild(leading);
    row.appendChild(significant);
    fragment.appendChild(row);
  }
  gutter.appendChild(fragment);
  return gutter;
}

/**
 * Inserts a loaded file into the directory tree model and refreshes the tree UI.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
function insertIntoTree(file) {
  let node = state.tree;
  const parts = file.segments;
  for (let i = 0; i < parts.length; i++) {
    const name = parts[i];
    const isLast = i === parts.length - 1;
    if (isLast) {
      node.children.push({
        name,
        type: "file",
        fileId: file.id,
        path: file.path,
      });
    } else {
      let next = node.children.find(
        (child) => child.type === "dir" && child.name === name,
      );
      if (!next) {
        next = {
          name,
          type: "dir",
          children: [],
          expanded: false,
          path: node.path ? `${node.path}/${name}` : name,
        };
        node.children.push(next);
      }
      node = next;
    }
  }
  sortTree(state.tree);
  renderDirectoryTree();
}

/**
 * Sorts a directory tree node in-place so directories appear before files with stable name ordering.
 *
 * @param {Object} node Tree node.
 * @returns {void}
 */
function sortTree(node) {
  if (!node.children) return;
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}

/**
 * Renders the directory tree UI from the current in-memory tree model and active selection state.
 *
 * @returns {void}
 */
function renderDirectoryTree() {
  els.treeContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();
  let index = 0;
  /**
   * Renders one tree node row (and its expanded descendants) into the navigator fragment.
   *
   * @param {Object} node Tree node to render.
   * @param {number} depth Visual nesting depth.
   * @returns {void}
   */
  function renderNode(node, depth) {
    const isFile = node.type === "file";
    const isHidden = isFile && isFileHidden(node.fileId);
    const row = document.createElement(isFile && !isHidden ? "a" : "div");
    row.className = `tree-item ${node.type}`;
    if (isHidden) row.classList.add("is-hidden");
    row.style.paddingLeft = `${depth * 14}px`;
    row.setAttribute("role", "treeitem");
    row.tabIndex = isFile && isHidden ? -1 : 0;
    row.dataset.nodeId = node.path || node.fileId || "";
    row.dataset.index = index++;
    const currentHash = decodeURIComponent(location.hash.slice(1) || "");
    if (isFile) {
      row.dataset.fileId = node.fileId;
      row.dataset.filePath = node.path || "";
      const isActive =
        !isHidden &&
        (node.fileId === state.activeFileId || node.fileId === currentHash);
      if (isHidden) {
        row.setAttribute("aria-disabled", "true");
        row.removeAttribute("aria-current");
      } else {
        row.href = `#${node.fileId}`;
        if (isActive) {
          row.setAttribute("aria-current", "location");
        } else {
          row.removeAttribute("aria-current");
        }
        row.addEventListener("click", () => setActiveFile(node.fileId));
      }
      row.classList.toggle("active", isActive);
    } else {
      row.setAttribute("aria-expanded", node.expanded ? "true" : "false");
      row.addEventListener("click", () => handleTreeClick(node));
    }
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = node.type === "dir" ? (node.expanded ? "▾" : "▸") : "";
    const label = document.createElement("span");
    label.className = "node-label";
    label.textContent = node.name || "root";
    row.appendChild(caret);
    row.appendChild(label);
    fragment.appendChild(row);
    if (node.type === "dir" && node.expanded) {
      node.children.forEach((child) => renderNode(child, depth + 1));
    }
  }
  state.tree.children.forEach((child) => renderNode(child, 0));
  els.treeContainer.appendChild(fragment);
  const hasNodes = state.tree.children.length > 0;
  els.treePlaceholder.textContent =
    state.phase === "loading" ? "Loading project..." : "No files loaded";
  els.treePlaceholder.classList.toggle("hidden", hasNodes);
}

/**
 * Handles click interactions on directory nodes to toggle expansion.
 *
 * @param {Object} node Tree node.
 * @returns {void}
 */
function handleTreeClick(node) {
  if (node.type !== "dir") return;
  node.expanded = !node.expanded;
  renderDirectoryTree();
}

/**
 * Renders a file into the main viewer as an expandable section with actions and line gutter.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
function renderFileSection(file) {
  const section = document.createElement("details");
  section.className = "file-section";
  if (isFileHidden(file.id)) section.classList.add("is-hidden");
  section.dataset.fileId = file.id;
  section.id = file.id;
  section.open = true;
  const summary = document.createElement("summary");
  summary.className = "file-summary";
  const header = document.createElement("div");
  header.className = "file-header";
  const toggle = document.createElement("span");
  toggle.className = "file-toggle";
  toggle.textContent = "▾";
  const path = document.createElement("div");
  path.className = "file-path";
  path.textContent = file.path;
  path.title = file.path;
  const language = document.createElement("span");
  language.className = "badge";
  language.textContent = file.language;
  const stats = document.createElement("span");
  stats.className = "stat";
  stats.textContent = `${file.lineCount} lines • ${formatBytes(file.size)}`;
  const copyPathBtn = document.createElement("button");
  copyPathBtn.className = "ghost tiny";
  setButtonLabel(copyPathBtn, "🔗", "Copy path");
  copyPathBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(file.path);
  });
  const copySourceBtn = document.createElement("button");
  copySourceBtn.className = "ghost tiny";
  setButtonLabel(copySourceBtn, "📋", "Copy source");
  copySourceBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    copyFileSource(file);
  });
  const fileActions = document.createElement("div");
  fileActions.className = "file-actions";
  fileActions.appendChild(copySourceBtn);
  fileActions.appendChild(copyPathBtn);

  header.appendChild(toggle);
  header.appendChild(path);
  header.appendChild(language);
  header.appendChild(stats);
  header.appendChild(fileActions);

  const pre = document.createElement("pre");
  const gutter = buildLineNumberGutter(file.lineCount);
  const code = document.createElement("code");
  code.classList.add("microlight");
  code.dataset.hasBeenHighlighted = "false";
  code.dataset.refsDecorated = "false";
  code.textContent = file.textFull || file.text || "";
  pre.appendChild(gutter);
  pre.appendChild(code);
  pre.classList.add("nowrap");

  summary.appendChild(header);
  section.appendChild(summary);
  section.appendChild(pre);
  els.fileContainer.appendChild(section);
  const target = parseHashValue(location.hash);
  if (target.fileId === file.id) {
    section.open = true;
    if (target.line) {
      scrollToFileLine(file.id, target.line, "auto");
    } else {
      section.scrollIntoView({ behavior: "auto", block: "start" });
      setActiveFile(file.id);
    }
  }
  attachObserver(section);
}

/**
 * Attaches observers and handlers for active file tracking, highlighting, and reference decoration.
 *
 * @param {HTMLElement} section File section element.
 * @returns {void}
 */
function attachObserver(section) {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const fileId = visible[0].target.dataset.fileId;
        setActiveFile(fileId);
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );
  }
  observer.observe(section);
  if (!scrollHandler) {
    scrollHandler = () => updateActiveLine();
    window.addEventListener("scroll", scrollHandler, { passive: true });
  }
  const code = section.querySelector("code");
  if (code) observeHighlightBlock(code);
  observeReferenceSection(section);
}

/**
 * Registers a code block with the syntax highlighter observer for deferred highlighting.
 *
 * @param {HTMLElement} code Code element.
 * @returns {void}
 */
function observeHighlightBlock(code) {
  codeHighlighter.observe(code);
}

/**
 * Sets the active file for navigation and status display, ensuring it is visible and reflected in the UI.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
function setActiveFile(fileId) {
  if (!fileId || state.activeFileId === fileId) return;
  if (isFileHidden(fileId)) return;
  state.activeFileId = fileId;
  renderDirectoryTree();
  const file = state.files.find((f) => f.id === fileId);
  if (file) {
    els.activeIndicator.innerHTML = `<span>Active:</span> <span class="value" title="${file.path}">${file.path}</span>`;
    updateActiveLine();
    const section = getFileSection(fileId);
    if (section && section.tagName === "DETAILS") section.open = true;
  }
  handleActiveFileChange();
}

/**
 * Updates the active indicator with an approximate line number based on scroll position in the active file.
 *
 * @returns {void}
 */
function updateActiveLine() {
  const fileId = state.activeFileId;
  if (!fileId) return;
  const section = getFileSection(fileId);
  if (!section) return;
  if (section.classList.contains("is-hidden")) return;
  const file = state.files.find((item) => item.id === fileId);
  if (!file) return;
  const pre = section.querySelector("pre");
  if (!pre) return;
  const rect = pre.getBoundingClientRect();
  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  const viewportProbeY = Math.min(
    Math.max(rect.top + lineHeight * 0.5, window.innerHeight * 0.35),
    rect.bottom - lineHeight * 0.5,
  );
  const scrollTop = Math.max(0, viewportProbeY - rect.top + pre.scrollTop);
  const approxLine =
    clampLineNumberForFile(file, Math.floor(scrollTop / lineHeight) + 1) || 1;
  const path = section.querySelector(".file-path")?.textContent || fileId;
  els.activeIndicator.innerHTML = `<span>Active:</span> <span class="value" title="${path}">${path}</span><span>Line ${approxLine}</span>`;
}

/**
 * Responds to hash navigation changes by scrolling to the target file (and optional line) and activating it.
 *
 * @returns {void}
 */
function handleHashChange() {
  const target = parseHashValue(location.hash);
  const targetId = target.fileId;
  if (!targetId) return;
  if (isFileHidden(targetId)) ensureFileVisible(targetId);
  const section = document.getElementById(targetId);
  if (!section) return;
  if (target.line) {
    scrollToFileLine(targetId, target.line);
    return;
  }
  section.scrollIntoView({ behavior: "auto", block: "start" });
  setActiveFile(section.dataset.fileId);
}

/**
 * Shows a warning banner when loaded content exceeds a configured memory threshold.
 *
 * @returns {void}
 */
function maybeWarnMemory() {
  if (!state.settings.showStats) return;
  if (state.aggregate.totalBytes > state.settings.memoryWarnBytes) {
    showBanner(
      `Loaded ${formatBytes(state.aggregate.totalBytes)} which exceeds the warning threshold. Consider cancelling if performance drops.`,
      "stats",
    );
  }
}

/**
 * Finalizes the load process by updating phase, triggering indexes/analysis, and refreshing UI state.
 *
 * @returns {void}
 */
function finishLoad() {
  state.scanning = false;
  els.cancelLoad.disabled = true;
  if (state.cancelled) {
    state.phase = "cancelled";
    showBanner(
      `Loading cancelled. ${state.aggregate.loadedFiles} files loaded.`,
    );
  } else {
    state.phase = "loaded";
    if (state.aggregate.loadedFiles === 0) {
      els.noFiles.classList.remove("hidden");
      els.noFiles.innerHTML = `No supported source files found. <button class="link-button" id="no-files-open-settings">Open settings</button>`;
      const settingsBtn = document.getElementById("no-files-open-settings");
      if (settingsBtn) {
        setButtonLabel(settingsBtn, "⚙️", "Open settings");
        settingsBtn.addEventListener("click", openSettings);
      }
    }
  }
  if (state.phase === "loaded") {
    rebuildPathToLoadedFileMap();
    state.refs.extSet = createRefExtensionSet(state.settings.allow);
    if (state.refs.enabled) {
      scheduleReferenceIndexBuild();
    }
    if (state.symbolRefs.enabled) {
      startSymbolIndexRebuild("baseline");
    }
    finalizeTreeSitterQueueAfterLoad();
  } else {
    cancelReferenceIndexBuild();
    cancelSymbolReferenceBuild();
    cancelSymbolReferenceIncremental();
    cancelTreeSitterQueue("load-cancelled", true);
  }
  updateControlBar();
  if (state.phase === "loaded") {
    state.treeSitter.wantInit = true;
    maybeInitTreeSitterRuntime();
    resumeTreeSitterQueue();
  }
  scheduleTocRender();
}

/**
 * Handles keyboard shortcuts in the empty state for opening a project or closing panels.
 *
 * @param {KeyboardEvent} e Key event.
 * @returns {void}
 */
function maybeYieldEmptyEnter(e) {
  if (e.key === "Enter" && state.phase === "empty") {
    if (!els.emptyOpen.disabled) {
      pickFolder();
    } else if (!els.emptyFallback.disabled) {
      els.fileInput.click();
    }
  } else if (e.key === "Escape") {
    closePanels();
  }
}

/**
 * Adds a timestamped entry to the internal log and refreshes UI status where relevant.
 *
 * @param {string} path Associated path or subsystem label.
 * @param {string} reason Reason or message.
 * @returns {void}
 */
function addLog(path, reason) {
  state.logs.push({ path, reason, time: new Date().toISOString() });
  if (els.controlStatus) updateControlBar();
}

/**
 * Enables drag resizing for the sidebar and updates CSS variables as the user resizes.
 *
 * @returns {void}
 */
function setupSidebarResize() {
  let startX = 0;
  let startWidth = state.sidebar.width;
  const move = (e) => {
    const dx = e.clientX - startX;
    let newWidth = Math.min(520, Math.max(220, startWidth + dx));
    state.sidebar.width = newWidth;
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${newWidth}px`,
    );
  };
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  els.sidebarResize.addEventListener("mousedown", (e) => {
    startX = e.clientX;
    startWidth = state.sidebar.width;
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  });
}

/**
 * Toggles whether the sidebar is pinned or behaves as an overlay.
 *
 * @returns {void}
 */
function toggleSidebarPin() {
  state.sidebar.pinned = !state.sidebar.pinned;
  els.sidebar.classList.toggle("unpinned", !state.sidebar.pinned);
  els.sidebar.classList.toggle("pinned", state.sidebar.pinned);
  updateSidebarPinLabel();
}

/**
 * Opens the sidebar overlay when unpinned.
 *
 * @returns {void}
 */
function openSidebarOverlay() {
  if (state.sidebar.pinned) return;
  clearTimeout(state.sidebar.collapseTimer);
  state.sidebar.overlay = true;
  els.sidebar.classList.add("overlay-open");
}

/**
 * Schedules collapsing the sidebar overlay when unpinned to reduce visual clutter.
 *
 * @returns {void}
 */
function collapseSidebarOverlay() {
  if (state.sidebar.pinned) return;
  state.sidebar.collapseTimer = setTimeout(() => {
    state.sidebar.overlay = false;
    els.sidebar.classList.remove("overlay-open");
  }, 220);
}

/**
 * Handles keyboard navigation for the directory tree (move focus and activate items).
 *
 * @param {KeyboardEvent} e Key event.
 * @returns {void}
 */
function handleTreeKeydown(e) {
  const items = Array.from(
    els.treeContainer.querySelectorAll(".tree-item:not(.is-hidden)"),
  );
  if (!items.length) return;
  const active = document.activeElement.classList.contains("tree-item")
    ? items.indexOf(document.activeElement)
    : 0;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const next = Math.min(items.length - 1, active + 1);
    items[next].focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prev = Math.max(0, active - 1);
    items[prev].focus();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const nodeId =
      document.activeElement?.dataset?.fileId ||
      document.activeElement?.dataset?.nodeId;
    const node = findNodeById(state.tree, nodeId);
    if (node) {
      if (node.type === "file") {
        if (isFileHidden(node.fileId)) return;
        location.hash = `#${node.fileId}`;
        setActiveFile(node.fileId);
      } else {
        handleTreeClick(node);
      }
    }
  }
}

/**
 * Finds a node within the directory tree model by its path or file identifier.
 *
 * @param {Object} node Root node to search from.
 * @param {string} id Node identifier.
 * @returns {Object|null} Matching node or null.
 */
function findNodeById(node, id) {
  if ((node.path || node.fileId) === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Handles file picker input changes and initiates loading from the selected file list.
 *
 * @param {Event} evt Input change event.
 * @returns {void}
 */
function handleFileInput(evt) {
  const files = Array.from(evt.target.files || []);
  if (!files.length) return;
  loadFromFileList(files);
}

/**
 * Loads a project from an explicit file list (for browsers without directory picker support).
 *
 * @param {File[]} files Selected files.
 * @returns {Promise<void>}
 */

async function loadFromFileList(files) {
  resetStateForLoad();
  state.phase = "loading";
  state.scanning = true;
  updateEmptyOverlay();
  updateControlBar();
  updateSidebarVisibility();
  state.progress.phaseLabel = "Scanning";
  const lastYield = { value: performance.now() };
  for (const file of files) {
    if (state.cancelled) break;
    const path = file.webkitRelativePath || file.name;
    state.progress.currentPath = path;
    if (pathHasIgnoredSegment(path)) {
      addLog(path, "ignored-dir");
      state.progress.skipped += 1;
      state.aggregate.skippedFiles += 1;
      updateControlBar();
      continue;
    }
    recordInventoryPathForRefs(path);
    const allowed = isAllowedFile(path, file.size);
    if (!allowed.allowed) {
      addLog(path, allowed.reason || "filtered");
      state.progress.skipped += 1;
      state.aggregate.skippedFiles += 1;
      updateControlBar();
      continue;
    }
    state.progress.filesIncluded += 1;
    updateControlBar();
    await readAndStoreFile(file, path, allowed.ext);
    await maybeYield(lastYield);
  }
  finishLoad();
}

/**
 * Requests cancellation of an in-progress load and stops background parsing work.
 *
 * @returns {void}
 */
function cancelLoad() {
  state.cancelled = true;
  cancelTreeSitterQueue("user-cancel", true);
  els.cancelLoad.disabled = true;
  updateControlBar();
  showBanner("Cancelling…");
}

/**
 * Applies the wrap setting, persists it, and communicates constraints that affect viewer behavior.
 *
 * @returns {void}
 */
function applyWrapToggle() {
  state.settings.wrap = els.wrapToggle.checked;
  persistSettings(state.settings);
  applyDisplaySettings();
  if (state.settings.wrap) {
    showBanner(
      "Main viewer keeps line-accurate numbering, so wrapping is disabled for file panes.",
      "info",
    );
  }
}

/**
 * Applies the stats display toggle and reconciles any stats-related banner state.
 *
 * @returns {void}
 */
function applyStatsToggle() {
  state.settings.showStats = els.statsDisplay.checked;
  persistSettings(state.settings);
  if (!state.settings.showStats && els.statusBanner.dataset.kind === "stats")
    hideBanner();
}

/**
 * Applies the file reference feature toggle and reconciles runtime handlers and indexing.
 *
 * @returns {void}
 */
function applyFileRefsToggle() {
  state.settings.fileRefs = !!els.fileRefsToggle?.checked;
  persistSettings(state.settings);
  syncReferenceFeatureEnabled();
}

/**
 * Applies the symbol reference feature toggle and reconciles runtime handlers and indexing.
 *
 * @returns {void}
 */
function applySymbolRefsToggle() {
  state.settings.symbolRefs = !!els.symbolRefsToggle?.checked;
  persistSettings(state.settings);
  syncSymbolReferenceFeatureEnabled();
}

/**
 * Wires DOM events, initializes feature UIs, and performs first-render startup synchronization.
 *
 * @returns {void}
 */
function init() {
  document.documentElement.style.setProperty(
    "--sidebar-width",
    `${state.sidebar.width}px`,
  );
  applyDisplaySettings();
  updateOffsets();
  showEmptySupportMessage();
  updateSidebarVisibility();
  updateControlBar();
  applyStaticButtonLabels();
  updateTocFilterMeta(0, 0);
  updateTocControls();

  els.openFolder.addEventListener("click", pickFolder);
  els.emptyOpen.addEventListener("click", pickFolder);
  els.fallbackPicker.addEventListener("click", () => els.fileInput.click());
  els.emptyFallback.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", handleFileInput);
  els.cancelLoad.addEventListener("click", cancelLoad);

  els.settingsToggle.addEventListener("click", openSettings);
  els.settingsClose.addEventListener("click", closeSettings);
  els.settingsSave.addEventListener("click", saveSettingsFromForm);
  els.wrapToggle.addEventListener("change", applyWrapToggle);
  els.statsDisplay.addEventListener("change", applyStatsToggle);
  if (els.fileRefsToggle)
    els.fileRefsToggle.addEventListener("change", applyFileRefsToggle);
  if (els.symbolRefsToggle)
    els.symbolRefsToggle.addEventListener("change", applySymbolRefsToggle);
  els.jsonToggle.addEventListener("change", () => {
    state.settings.includeJson = els.jsonToggle.checked;
    persistSettings(state.settings);
  });

  els.sidebarPin.addEventListener("click", toggleSidebarPin);
  els.sidebarEdge.addEventListener("mouseenter", openSidebarOverlay);
  els.sidebar.addEventListener("mouseleave", collapseSidebarOverlay);
  els.sidebarEdge.addEventListener("click", openSidebarOverlay);
  setupSidebarResize();
  els.treeContainer.addEventListener("keydown", handleTreeKeydown);

  els.statsBtn.addEventListener("click", openStatsPanel);
  els.statsClose.addEventListener("click", closeStatsPanel);
  els.statsPanel.addEventListener("click", (e) => {
    if (e.target === els.statsPanel) closeStatsPanel();
  });

  els.logToggle.addEventListener("click", openLogPanel);
  els.logClose.addEventListener("click", closeLogPanel);
  els.logPanel.addEventListener("click", (e) => {
    if (e.target === els.logPanel) closeLogPanel();
  });

  els.supportLink.addEventListener("click", openSupportPanel);
  els.supportClose.addEventListener("click", closeSupportPanel);
  els.supportPanel.addEventListener("click", (e) => {
    if (e.target === els.supportPanel) closeSupportPanel();
  });

  if (els.tocSelectAll)
    els.tocSelectAll.addEventListener("click", handleTocSelectAll);
  if (els.tocReset)
    els.tocReset.addEventListener("click", handleTocResetSelection);
  if (els.tocCopy) els.tocCopy.addEventListener("click", copySelectedFiles);
  if (els.tocHide) els.tocHide.addEventListener("click", hideSelectedFiles);
  if (els.tocShow) els.tocShow.addEventListener("click", showSelectedFiles);
  if (els.tocFilterQuery) {
    els.tocFilterQuery.addEventListener("input", handleTocFilterInput);
    els.tocFilterQuery.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearTocQuery();
      }
    });
  }
  if (els.tocFilterClear)
    els.tocFilterClear.addEventListener("click", clearTocQuery);
  if (els.tocExclusionsClear)
    els.tocExclusionsClear.addEventListener("click", clearTocExclusions);
  if (els.tocList) {
    els.tocList.addEventListener("pointerover", handleTocSegmentPointerOver);
    els.tocList.addEventListener("pointerout", handleTocSegmentPointerOut);
    els.tocList.addEventListener("focusin", handleTocSegmentFocusIn);
    els.tocList.addEventListener("focusout", handleTocSegmentFocusOut);
    els.tocList.addEventListener("click", handleTocSegmentExclusion);
  }
  if (els.tocPanel) {
    els.tocPanel.addEventListener("toggle", () => {
      if (
        els.tocPanel.open &&
        els.tocFilterQuery &&
        !els.tocFilterQuery.disabled
      ) {
        els.tocFilterQuery.focus();
        els.tocFilterQuery.select();
      }
    });
  }
  setupHoverPreview();

  if (els.codeSearchPanel) {
    els.codeSearchPanel.addEventListener("toggle", () => {
      if (
        els.codeSearchPanel.open &&
        els.codeSearchQuery &&
        !els.codeSearchQuery.disabled
      ) {
        els.codeSearchQuery.focus();
        els.codeSearchQuery.select();
      }
    });
  }
  if (els.codeSearchRun)
    els.codeSearchRun.addEventListener("click", () =>
      startSearchRun("explicit"),
    );
  if (els.codeSearchCancel)
    els.codeSearchCancel.addEventListener("click", () =>
      cancelSearchRun("user"),
    );
  if (els.codeSearchQuery) {
    els.codeSearchQuery.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startSearchRun("explicit");
      }
    });
    els.codeSearchQuery.addEventListener("input", () => {
      if (els.codeSearchLive?.checked) scheduleLiveSearch();
    });
  }
  if (els.codeSearchMode) {
    els.codeSearchMode.addEventListener("change", () => {
      if (els.codeSearchLive?.checked) scheduleLiveSearch();
    });
  }
  if (els.codeSearchScope) {
    els.codeSearchScope.addEventListener("change", () => {
      if (els.codeSearchLive?.checked) scheduleLiveSearch();
    });
  }
  if (els.codeSearchCase) {
    els.codeSearchCase.addEventListener("change", () => {
      if (els.codeSearchLive?.checked) scheduleLiveSearch();
    });
  }
  if (els.codeSearchLive) {
    els.codeSearchLive.addEventListener("change", () => {
      if (!els.codeSearchLive.checked && state.search.liveTimer) {
        clearTimeout(state.search.liveTimer);
        state.search.liveTimer = null;
        return;
      }
      if (els.codeSearchLive.checked) scheduleLiveSearch();
    });
  }

  if (els.treeBtn) els.treeBtn.addEventListener("click", handleTreeButtonClick);
  if (els.previewToggle) {
    els.previewToggle.addEventListener("click", () =>
      setPreviewEnabled(!state.preview.enabled),
    );
  }
  if (els.tsClose) els.tsClose.addEventListener("click", closeTreeSitterWindow);
  if (els.tsMinimize)
    els.tsMinimize.addEventListener("click", minimizeTreeSitterWindow);
  if (els.tsParse)
    els.tsParse.addEventListener("click", () => {
      if (state.phase === "empty") {
        renderTreeSitterPanel("Load a project to parse.");
        return;
      }
      const queue = state.treeSitter.queue;
      const running = !!(
        state.treeSitter.parsing ||
        queue.inProgressFileId ||
        queue.handle
      );
      if (running && !queue.paused) {
        pauseTreeSitterQueue();
        return;
      }
      if (queue.paused || queue.pendingIds.length > 0) {
        resumeTreeSitterQueue();
        return;
      }
      rebuildTreeSitterQueue();
    });
  if (els.tsTitleBar)
    els.tsTitleBar.addEventListener("mousedown", handleTreeSitterDrag);
  if (els.tsResize)
    els.tsResize.addEventListener("mousedown", handleTreeSitterResize);
  if (els.tsChip) {
    els.tsChip.addEventListener("click", restoreTreeSitterWindow);
    els.tsChip.addEventListener("mousedown", handleChipDrag);
  }

  document.addEventListener("keydown", maybeYieldEmptyEnter);
  window.addEventListener("resize", updateOffsets);
  window.addEventListener("resize", handleViewportResize);
  window.addEventListener("resize", handlePreviewViewportResize);
  window.addEventListener("scroll", handlePreviewViewportResize, {
    passive: true,
  });
  window.addEventListener("hashchange", handleHashChange);
  renderDirectoryTree();
  renderTableOfContents();
  updateTreeSitterWindowUI();
  syncReferenceFeatureEnabled();
  syncSymbolReferenceFeatureEnabled();
}

let initialized = false;

/**
 * Initializes the application runtime once and ignores subsequent calls.
 *
 * @param {{doc?: Document, els?: Object}} [deps={}] Runtime dependency injection context.
 * @returns {void}
 */
export function initAppRuntime(deps = {}) {
  if (initialized) return;
  runtimeDoc = deps.doc || document;
  els = deps.els || getDomElements(runtimeDoc);
  initRuntimeControllers();
  initialized = true;
  init();
}
