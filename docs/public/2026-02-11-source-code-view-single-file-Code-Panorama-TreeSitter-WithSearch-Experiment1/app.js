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
  TREE_SITTER_LANGUAGES
} from "./modules/config.js";
import { getDomElements } from "./modules/dom-elements.js";
import {
  createRootNode,
  loadSettings as loadStoredSettings,
  saveSettings as persistSettings,
  loadTreeSitterState as loadStoredTreeSitterState,
  saveTreeSitterState as persistTreeSitterState
} from "./modules/persistence.js";
import {
  formatBytes,
  setButtonLabel,
  buildMarkdownSnippet,
  copyTextToClipboard,
  copyFileSource,
  makeFileId,
  countLines,
  languageFromExt,
  clamp,
  rectOf,
  makeTextSpan
} from "./modules/file-helpers.js";
import {
  escapeRegExp,
  validateSearchQuery,
  buildSearchMatcher,
  matchLine,
  buildSnippetLines
} from "./modules/search-helpers.js";
import { buildOutlineModel, buildIncludeList } from "./modules/tree-sitter-helpers.js";
import { createCodeHighlighter } from "./modules/highlighter.js";
import {
  createRefExtensionSet,
  normalizeProjectPath,
  recordInventoryPath,
  extractReferenceCandidates,
  resolveReferenceCandidate,
  buildLineStartOffsets
} from "./modules/file-references.js";
import {
  isConfigLikeFile,
  isSingleIdentifierText,
  extractIdentifierAtOffset,
  extractHeuristicSymbolsFromLine,
  extractTreeSitterSymbolContribution,
  createEmptySymbolContribution
} from "./modules/symbol-references.js";

function createInitialRefsState(enabled = true) {
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
      partial: false
    },
    ui: { activePanel: null, activeToken: null, lastOpenAt: 0 },
    refsObserver: null,
    decoratedFiles: new Set(),
    extSet: createRefExtensionSet(defaults.allow)
  };
}

function createInitialSymbolRefsState(enabled = true) {
  return {
    enabled: !!enabled,
    indexVersion: 0,
    index: { bySymbol: new Map() },
    contributions: {
      heuristicByFile: new Map(),
      treeByFile: new Map(),
      effectiveByFile: new Map()
    },
    build: {
      running: false,
      runId: 0,
      pendingHandle: null,
      stage: "idle", // idle | baseline | rebuild | incremental
      progress: { processed: 0, total: 0 },
      partial: false,
      ready: false
    },
    incremental: {
      pendingFileIds: new Set(),
      debounceHandle: null,
      batchHandle: null,
      running: false
    },
    ui: {
      activePanel: null,
      activeSymbol: "",
      activeSourceFileId: "",
      renderedVersion: -1,
      refreshHandle: null
    }
  };
}

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

const state = {
  phase: "empty", // empty | loading | loaded | cancelled
  files: [],
  tree: createRootNode(),
  sidebar: { pinned: true, width: 320, overlay: false, collapseTimer: null },
  progress: {
    dirsVisited: 0,
    filesIncluded: 0,
    filesRead: 0,
    skipped: 0,
    errors: 0,
    bytesRead: 0,
    linesRead: 0,
    currentPath: "",
    phaseLabel: "Idle"
  },
  aggregate: {
    loadedFiles: 0,
    skippedFiles: 0,
    totalBytes: 0,
    totalLines: 0,
    languages: {},
    largest: []
  },
  logs: [],
  settings: loadSettings(),
  scanning: false,
  cancelled: false,
  activeFileId: null,
  hiddenFiles: new Set(),
  tocSelection: new Set(),
  tocFilter: createInitialTocFilterState(),
  treeSitter: loadTreeSitterState(),
  search: {
    running: false,
    runId: 0,
    results: [],
    rendered: 0,
    partial: false,
    capped: false,
    progress: { processed: 0, total: 0 },
    activeRun: null,
    liveTimer: null
  },
  preview: {
    enabled: true
  },
  refs: createInitialRefsState(defaults.fileRefs),
  symbolRefs: createInitialSymbolRefsState(defaults.symbolRefs),
  support: {
    directoryPicker: typeof window.showDirectoryPicker === "function",
    webkitDirectory: "webkitdirectory" in document.createElement("input")
  },
  seq: 0
};

const previewState = {
  window: null,
  visibleFileId: null,
  visibleLine: null,
  pending: null,
  hoverEntry: null,
  hoverFileId: null,
  hoverLine: null,
  hoverLoaded: false,
  lastPlacement: null,
  cache: new Map()
};

const els = getDomElements(document);

state.refs.enabled = state.settings.fileRefs !== false;
state.refs.extSet = createRefExtensionSet(state.settings.allow);
state.symbolRefs.enabled = state.settings.symbolRefs !== false;

let observer;
let scrollHandler;
const codeHighlighter = createCodeHighlighter({
  retryDelayMs: HIGHLIGHT_RETRY_DELAY_MS,
  maxRetries: HIGHLIGHT_MAX_RETRIES,
  pendingClassPrefix: MICROLIGHT_PENDING_CLASS,
  getNextSequence: () => (state.seq += 1)
});
let tocRenderHandle;

function loadSettings() {
  return loadStoredSettings(defaults);
}

function saveSettings() {
  persistSettings(state.settings);
}

function loadTreeSitterState() {
  return loadStoredTreeSitterState({
    storageKey: TREE_SITTER_STORAGE_KEY,
    languages: TREE_SITTER_LANGUAGES
  });
}

function saveTreeSitterState() {
  const { window: win } = state.treeSitter;
  persistTreeSitterState(win, { storageKey: TREE_SITTER_STORAGE_KEY });
}

function isFileHidden(fileId) {
  return state.hiddenFiles.has(fileId);
}

function getFileSection(fileId) {
  if (!fileId) return null;
  return document.querySelector(`.file-section[data-file-id="${fileId}"]`);
}

function applyFileVisibility(fileId) {
  const section = getFileSection(fileId);
  if (!section) return;
  section.classList.toggle("is-hidden", isFileHidden(fileId));
}

function getTocFilesInOrder() {
  return [...state.files].sort((a, b) => a.path.localeCompare(b.path));
}

function normalizeTocPath(value) {
  return (value || "").replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
}

function normalizeTocPrefix(value) {
  return normalizeTocPath(value).toLowerCase();
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function compileTocPathMatcher(rawQuery) {
  const trimmed = (rawQuery || "").trim();
  if (!trimmed) return null;
  const pattern = /[*?]/.test(trimmed) ? trimmed : `*${trimmed}*`;
  let source = "";
  for (const ch of pattern) {
    if (ch === "*") source += ".*";
    else if (ch === "?") source += ".";
    else source += escapeRegExp(ch);
  }
  const regex = new RegExp(`^${source}$`, "i");
  return path => regex.test(path || "");
}

function getOrBuildTocSegments(file) {
  const cached = state.tocFilter.segmentCache.get(file.id);
  if (cached && cached.path === file.path) return cached;
  const normalizedPath = normalizeTocPath(file.path);
  const parts = normalizedPath ? normalizedPath.split("/") : [];
  const dirs = parts.slice(0, -1);
  const fileName = parts.length ? parts[parts.length - 1] : normalizedPath;
  const prefixes = [];
  const dirEntries = dirs.map((segment, index) => {
    prefixes.push(segment);
    const prefix = prefixes.join("/");
    return {
      text: segment,
      lower: segment.toLowerCase(),
      index,
      prefix,
      prefixLower: prefix.toLowerCase()
    };
  });
  const built = {
    path: file.path,
    dirs: dirEntries,
    fileName: fileName || file.path || ""
  };
  state.tocFilter.segmentCache.set(file.id, built);
  return built;
}

function isTocPathExcluded(path) {
  const normalized = normalizeTocPrefix(path);
  if (!normalized || !state.tocFilter.exclusions.size) return false;
  for (const prefix of state.tocFilter.exclusions) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return true;
  }
  return false;
}

function doesTocPathMatchQuery(path) {
  if (!state.tocFilter.matcher) return true;
  return state.tocFilter.matcher(path);
}

function isTocPathVisible(path) {
  return doesTocPathMatchQuery(path) && !isTocPathExcluded(path);
}

function getTocSelectableFileIds() {
  return new Set(getTocFilesInOrder().filter(file => isTocPathVisible(file.path)).map(file => file.id));
}

function getTocActionableSelectedFileIds() {
  const selected = new Set();
  state.tocSelection.forEach(fileId => {
    const file = state.files.find(item => item.id === fileId);
    if (!file || isTocPathExcluded(file.path)) return;
    selected.add(fileId);
  });
  return selected;
}

function updateTocFilterMeta(total, visible) {
  if (els.tocFilterSummary) {
    els.tocFilterSummary.textContent = `Showing ${visible} of ${total}`;
  }
  if (els.tocExclusionsStatus) {
    const count = state.tocFilter.exclusions.size;
    els.tocExclusionsStatus.textContent = `Exclusions: ${count}`;
    els.tocExclusionsStatus.classList.toggle("hidden", count === 0);
  }
  const hasFiles = total > 0;
  if (els.tocFilterQuery) els.tocFilterQuery.disabled = !hasFiles;
  if (els.tocFilterClear) {
    const hasQuery = state.tocFilter.queryRaw.trim().length > 0;
    els.tocFilterClear.disabled = !hasFiles || !hasQuery;
  }
  if (els.tocExclusionsClear) {
    els.tocExclusionsClear.disabled = !hasFiles || state.tocFilter.exclusions.size === 0;
  }
}

function setTocSegmentHoverKey(key) {
  if ((key || "") === state.tocFilter.hoverKey) return;
  state.tocFilter.hoverKey = key || "";
  applyTocSegmentHighlight();
}

function getTocSegmentHoverKeyFromDataset(segmentLower, segmentIndex) {
  if (!segmentLower) return "";
  const parsed = Number.parseInt(segmentIndex, 10);
  if (!Number.isFinite(parsed)) return "";
  return `${segmentLower}:${parsed}`;
}

function resolveTocSegmentHoverKeyFromTarget(target) {
  if (!target?.closest) return "";
  const segment = target.closest(".toc-segment[data-segment-lower][data-segment-index]");
  if (segment) {
    return getTocSegmentHoverKeyFromDataset(segment.dataset.segmentLower, segment.dataset.segmentIndex);
  }
  const button = target.closest(".toc-segment-exclude[data-segment-lower][data-segment-index]");
  if (button) {
    return getTocSegmentHoverKeyFromDataset(button.dataset.segmentLower, button.dataset.segmentIndex);
  }
  return "";
}

function applyTocSegmentHighlight() {
  if (!els.tocList) return;
  const segments = els.tocList.querySelectorAll(".toc-segment");
  segments.forEach(segment => {
    segment.classList.remove("is-global-hover");
    segment.style.removeProperty("--toc-segment-hue");
  });
  const hoverKey = state.tocFilter.hoverKey;
  if (!hoverKey) return;
  const [segmentLower, segmentIndexText] = hoverKey.split(":");
  const segmentIndex = Number.parseInt(segmentIndexText, 10);
  if (!segmentLower || !Number.isFinite(segmentIndex)) return;
  const hue = hashString(`${segmentLower}:${segmentIndex}`) % 360;
  segments.forEach(segment => {
    if (segment.dataset.segmentLower !== segmentLower) return;
    if (Number.parseInt(segment.dataset.segmentIndex || "", 10) !== segmentIndex) return;
    const row = segment.closest(".toc-item");
    if (!row || row.classList.contains("is-filtered-out") || row.classList.contains("is-excluded")) return;
    segment.classList.add("is-global-hover");
    segment.style.setProperty("--toc-segment-hue", `${hue}`);
  });
}

function syncTocCheckboxesFromSelection() {
  if (!els.tocList) return;
  const rows = els.tocList.querySelectorAll(".toc-item");
  rows.forEach(row => {
    const fileId = row.dataset.fileId;
    const box = row.querySelector(".toc-checkbox");
    if (!fileId || !box) return;
    box.checked = state.tocSelection.has(fileId);
    const excluded = row.classList.contains("is-excluded");
    box.disabled = excluded;
  });
}

function pruneTocSelectionForExclusions() {
  let changed = false;
  state.tocSelection.forEach(fileId => {
    const file = state.files.find(item => item.id === fileId);
    if (!file || !isTocPathExcluded(file.path)) return;
    state.tocSelection.delete(fileId);
    changed = true;
  });
  if (changed) syncTocCheckboxesFromSelection();
  return changed;
}

function applyTocVisibilityState() {
  if (!els.tocList) return;
  const rows = els.tocList.querySelectorAll(".toc-item");
  let visibleCount = 0;
  let totalCount = 0;
  rows.forEach(row => {
    totalCount += 1;
    const path = row.dataset.filePath || "";
    const excluded = isTocPathExcluded(path);
    const matches = doesTocPathMatchQuery(path);
    row.classList.toggle("is-excluded", excluded);
    row.classList.toggle("is-filtered-out", !matches);
    if (excluded) {
      const fileId = row.dataset.fileId;
      if (fileId && state.tocSelection.has(fileId)) {
        state.tocSelection.delete(fileId);
      }
    }
    if (!excluded && matches) visibleCount += 1;
  });
  syncTocCheckboxesFromSelection();
  updateTocFilterMeta(totalCount, visibleCount);
  applyTocSegmentHighlight();
}

function updateTocFilterMatcher() {
  state.tocFilter.matcher = compileTocPathMatcher(state.tocFilter.queryRaw);
}

function applyTocFiltersNow() {
  if (state.tocFilter.debounceTimer) {
    clearTimeout(state.tocFilter.debounceTimer);
    state.tocFilter.debounceTimer = null;
  }
  updateTocFilterMatcher();
  pruneTocSelectionForExclusions();
  applyTocVisibilityState();
  updateTocControls();
}

function scheduleTocFilterApply() {
  if (state.tocFilter.debounceTimer) clearTimeout(state.tocFilter.debounceTimer);
  state.tocFilter.debounceTimer = setTimeout(() => {
    state.tocFilter.debounceTimer = null;
    applyTocFiltersNow();
  }, TOC_FILTER_DEBOUNCE);
}

function clearTocQuery() {
  state.tocFilter.queryRaw = "";
  if (els.tocFilterQuery) els.tocFilterQuery.value = "";
  applyTocFiltersNow();
}

function clearTocExclusions() {
  if (!state.tocFilter.exclusions.size) return;
  state.tocFilter.exclusions.clear();
  applyTocFiltersNow();
}

function renderTocPathLabel(file, isHidden) {
  const data = getOrBuildTocSegments(file);
  const container = document.createElement("span");
  container.className = "toc-path";
  data.dirs.forEach((segment, index) => {
    const wrapper = document.createElement("span");
    wrapper.className = "toc-segment-wrap";
    const segmentNode = document.createElement(isHidden ? "span" : "a");
    segmentNode.className = `${isHidden ? "toc-text" : "toc-link"} toc-segment`;
    segmentNode.textContent = segment.text;
    segmentNode.dataset.segment = segment.text;
    segmentNode.dataset.segmentLower = segment.lower;
    segmentNode.dataset.segmentIndex = `${segment.index}`;
    segmentNode.dataset.prefix = segment.prefix;
    segmentNode.dataset.prefixLower = segment.prefixLower;
    segmentNode.dataset.fileId = file.id;
    segmentNode.dataset.filePath = file.path;
    wrapper.appendChild(segmentNode);
    if (!isHidden) {
      segmentNode.href = `#${file.id}`;
      segmentNode.addEventListener("click", () => setActiveFile(file.id));
      const excludeBtn = document.createElement("button");
      excludeBtn.type = "button";
      excludeBtn.className = "toc-segment-exclude";
      excludeBtn.textContent = "×";
      excludeBtn.dataset.prefix = segment.prefix;
      excludeBtn.dataset.prefixLower = segment.prefixLower;
      excludeBtn.dataset.segmentLower = segment.lower;
      excludeBtn.dataset.segmentIndex = `${segment.index}`;
      excludeBtn.setAttribute("aria-label", `Exclude folder ${segment.prefix}`);
      excludeBtn.title = `Exclude ${segment.prefix}`;
      wrapper.appendChild(excludeBtn);
    }
    container.appendChild(wrapper);
    if (index < data.dirs.length - 1 || data.fileName) {
      const separator = document.createElement("span");
      separator.className = "toc-path-separator";
      separator.textContent = "/";
      container.appendChild(separator);
    }
  });
  const filenameNode = document.createElement(isHidden ? "span" : "a");
  filenameNode.className = `${isHidden ? "toc-text" : "toc-link"} toc-filename`;
  filenameNode.textContent = data.fileName;
  if (!isHidden) {
    filenameNode.dataset.fileId = file.id;
    filenameNode.dataset.filePath = file.path;
    filenameNode.href = `#${file.id}`;
    filenameNode.addEventListener("click", () => setActiveFile(file.id));
  }
  container.appendChild(filenameNode);
  return container;
}

function scheduleTocRender() {
  if (tocRenderHandle) return;
  tocRenderHandle = requestAnimationFrame(() => {
    tocRenderHandle = null;
    renderTableOfContents();
  });
}

function renderTableOfContents() {
  if (!els.tocList || !els.tocCount || !els.tocEmpty) return;
  const files = getTocFilesInOrder();
  els.tocCount.textContent = `${files.length} file${files.length === 1 ? "" : "s"}`;
  els.tocList.innerHTML = "";
  if (!files.length) {
    setTocSegmentHoverKey("");
    els.tocEmpty.classList.remove("hidden");
    els.tocList.classList.add("hidden");
    updateTocFilterMeta(0, 0);
    updateTocControls();
    return;
  }
  els.tocEmpty.classList.add("hidden");
  els.tocList.classList.remove("hidden");
  const fragment = document.createDocumentFragment();
  files.forEach(file => {
    const li = document.createElement("li");
    li.className = "toc-item";
    li.dataset.fileId = file.id;
    li.dataset.filePath = file.path;
    const isHidden = isFileHidden(file.id);
    if (isHidden) li.classList.add("is-hidden");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toc-checkbox";
    checkbox.checked = state.tocSelection.has(file.id);
    checkbox.setAttribute("aria-label", `Select ${file.path}`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.tocSelection.add(file.id);
      } else {
        state.tocSelection.delete(file.id);
      }
      updateTocControls();
    });
    const label = renderTocPathLabel(file, isHidden);
    li.appendChild(checkbox);
    li.appendChild(label);
    fragment.appendChild(li);
  });
  els.tocList.appendChild(fragment);
  applyTocFiltersNow();
  syncTocCheckboxesFromSelection();
  updateTocControls();
}

function updateTocControls() {
  if (!els.tocSelectAll || !els.tocReset || !els.tocCopy || !els.tocHide || !els.tocShow) return;
  const selectableIds = getTocSelectableFileIds();
  const selectedActionableIds = getTocActionableSelectedFileIds();
  let selectedVisibleCount = 0;
  selectedActionableIds.forEach(fileId => {
    if (selectableIds.has(fileId)) selectedVisibleCount += 1;
  });
  const noneSelected = selectedActionableIds.size === 0;
  els.tocSelectAll.disabled = selectableIds.size === 0 || selectedVisibleCount === selectableIds.size;
  els.tocReset.disabled = state.tocSelection.size === 0;
  els.tocCopy.disabled = noneSelected;
  els.tocHide.disabled = noneSelected;
  els.tocShow.disabled = noneSelected;
}

function handleTocSelectAll() {
  state.tocSelection = getTocSelectableFileIds();
  syncTocCheckboxesFromSelection();
  updateTocControls();
}

function handleTocResetSelection() {
  state.tocSelection.clear();
  syncTocCheckboxesFromSelection();
  updateTocControls();
}

function copySelectedFiles() {
  const selectedFiles = getTocFilesInOrder().filter(file => state.tocSelection.has(file.id) && !isTocPathExcluded(file.path));
  if (!selectedFiles.length) return;
  const content = selectedFiles.map(file => buildMarkdownSnippet(file)).join("");
  copyTextToClipboard(content);
}

function hideSelectedFiles() {
  const selectedIds = getTocActionableSelectedFileIds();
  if (!selectedIds.size) return;
  selectedIds.forEach(fileId => {
    state.hiddenFiles.add(fileId);
    applyFileVisibility(fileId);
  });
  renderDirectoryTree();
  renderTableOfContents();
  ensureActiveFileVisible();
}

function showSelectedFiles() {
  const selectedIds = getTocActionableSelectedFileIds();
  if (!selectedIds.size) return;
  selectedIds.forEach(fileId => {
    state.hiddenFiles.delete(fileId);
    applyFileVisibility(fileId);
  });
  renderDirectoryTree();
  renderTableOfContents();
  ensureActiveFileVisible();
}

function handleTocFilterInput() {
  state.tocFilter.queryRaw = els.tocFilterQuery?.value || "";
  scheduleTocFilterApply();
  if (els.tocFilterClear) {
    const hasQuery = state.tocFilter.queryRaw.trim().length > 0;
    els.tocFilterClear.disabled = state.files.length === 0 || !hasQuery;
  }
}

function handleTocSegmentPointerOver(event) {
  const key = resolveTocSegmentHoverKeyFromTarget(event.target);
  if (!key) return;
  setTocSegmentHoverKey(key);
}

function handleTocSegmentPointerOut(event) {
  const nextKey = resolveTocSegmentHoverKeyFromTarget(event.relatedTarget);
  setTocSegmentHoverKey(nextKey);
}

function handleTocSegmentFocusIn(event) {
  const key = resolveTocSegmentHoverKeyFromTarget(event.target);
  if (!key) return;
  setTocSegmentHoverKey(key);
}

function handleTocSegmentFocusOut(event) {
  const nextKey = resolveTocSegmentHoverKeyFromTarget(event.relatedTarget);
  setTocSegmentHoverKey(nextKey);
}

function handleTocSegmentExclusion(event) {
  const button = event.target.closest(".toc-segment-exclude[data-prefix-lower]");
  if (!button || !els.tocList?.contains(button)) return;
  event.preventDefault();
  event.stopPropagation();
  const prefix = button.dataset.prefixLower || "";
  if (!prefix) return;
  if (!state.tocFilter.exclusions.has(prefix)) {
    state.tocFilter.exclusions.add(prefix);
    applyTocFiltersNow();
  }
}

class PreviewWindow {
  constructor(options = {}) {
    this.state = {
      x: 40,
      y: 40,
      width: options.width ?? PREVIEW_DEFAULT_WIDTH,
      height: options.height ?? PREVIEW_DEFAULT_HEIGHT,
      minWidth: options.minWidth ?? PREVIEW_MIN_WIDTH,
      minHeight: options.minHeight ?? PREVIEW_MIN_HEIGHT,
      margin: options.margin ?? PREVIEW_VIEWPORT_MARGIN,
      gap: options.gap ?? PREVIEW_GAP,
      destroyAfterMs: options.destroyAfterMs ?? PREVIEW_INACTIVE_MS
    };

    this._destroyTimer = null;
    this._activePointerId = null;
    this._drag = null;
    this._resize = null;
    this._teardownOutsideClick = null;
    this.onDestroy = null;

    this.root = document.createElement("div");
    this.root.className = "pw-root";
    this.root.setAttribute("role", "dialog");
    this.root.setAttribute("aria-label", "Preview");

    this.header = document.createElement("div");
    this.header.className = "pw-header";

    this.title = makeTextSpan("pw-title", "Preview");
    this.header.appendChild(this.title);

    this.content = document.createElement("div");
    this.content.className = "pw-content";

    this.root.appendChild(this.header);
    this.root.appendChild(this.content);

    document.body.appendChild(this.root);

    this.setupDragHandlers();
    this.setupResizeHandlers();
    this.installActivityListeners();
    this.updateGeometry();
    this.scheduleDestroy(this.state.destroyAfterMs);
  }

  installActivityListeners() {
    const bump = () => this.bumpActivity();
    this.root.addEventListener("pointerenter", bump);
    this.root.addEventListener("pointermove", bump);
    this.root.addEventListener("wheel", bump, { passive: true });
  }

  bumpActivity() {
    this.scheduleDestroy(this.state.destroyAfterMs);
  }

  destroy() {
    this.stopResize();
    this.cancelDrag();
    if (this._destroyTimer) {
      clearTimeout(this._destroyTimer);
      this._destroyTimer = null;
    }
    if (this.root && this.root.isConnected) {
      this.root.remove();
    }
    if (this._teardownOutsideClick) {
      this._teardownOutsideClick();
      this._teardownOutsideClick = null;
    }
    if (typeof this.onDestroy === "function") {
      this.onDestroy();
    }
  }

  scheduleDestroy(ms) {
    if (this._destroyTimer) clearTimeout(this._destroyTimer);
    this._destroyTimer = setTimeout(() => this.destroy(), ms);
  }

  setTitle(text) {
    this.title.textContent = text || "Preview";
  }

  loadContent(node) {
    this.content.replaceChildren();
    if (!node) return;
    this.content.appendChild(node);
  }

  positionWindowNearElement(el, options = {}) {
    const r = rectOf(el);
    const gap = this.state.gap;
    const margin = this.state.margin;
    const resizeToFit = options.resizeToFit !== false;
    const preferRight = options.preferRight !== false;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const minW = this.state.minWidth;
    const minH = this.state.minHeight;
    const maxW = Math.max(0, vw - margin * 2);
    const maxH = Math.max(0, vh - margin * 2);

    if (!resizeToFit) {
      const width = clamp(this.state.width, minW, maxW);
      const height = clamp(this.state.height, minH, maxH);
      const rightSpace = (vw - margin) - r.right;
      const leftSpace = r.left - margin;
      const belowSpace = (vh - margin) - r.bottom;
      const aboveSpace = r.top - margin;

      let x;
      let y;

      if (preferRight && rightSpace >= width + gap) x = r.right + gap;
      else if (leftSpace >= width + gap) x = r.left - width - gap;
      else x = clamp(r.left, margin, vw - width - margin);

      if (belowSpace >= height + gap) y = r.bottom + gap;
      else if (aboveSpace >= height + gap) y = r.top - height - gap;
      else y = clamp(r.top, margin, vh - height - margin);

      this.state.x = clamp(x, margin, vw - width - margin);
      this.state.y = clamp(y, margin, vh - height - margin);
      this.state.width = width;
      this.state.height = height;
      this.updateGeometry();
      return;
    }

    const rightSpace = (vw - margin) - r.right - gap;
    const leftSpace = r.left - margin - gap;

    let useRight;
    if (preferRight && rightSpace >= minW) {
      useRight = true;
    } else if (rightSpace >= minW && leftSpace < minW) {
      useRight = true;
    } else if (leftSpace >= minW) {
      useRight = false;
    } else {
      useRight = rightSpace >= leftSpace;
    }

    let width = useRight ? rightSpace : leftSpace;
    width = clamp(width, minW, maxW);
    const height = clamp(maxH, minH, maxH);

    let x = useRight ? r.right + gap : r.left - width - gap;
    x = clamp(x, margin, vw - width - margin);
    const y = clamp(margin, margin, vh - height - margin);

    this.state.x = x;
    this.state.y = y;
    this.state.width = width;
    this.state.height = height;
    this.updateGeometry();
  }

  updateGeometry() {
    const { x, y, width, height } = this.state;
    this.root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    this.root.style.width = `${Math.round(width)}px`;
    this.root.style.height = `${Math.round(height)}px`;
  }

  clampToViewport() {
    const next = this.applyResizeConstraints({
      x: this.state.x,
      y: this.state.y,
      width: this.state.width,
      height: this.state.height
    });
    this.state.x = next.x;
    this.state.y = next.y;
    this.state.width = next.width;
    this.state.height = next.height;
    this.updateGeometry();
  }

  applyResizeConstraints(next) {
    const margin = this.state.margin;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxW = Math.max(0, vw - margin * 2);
    const maxH = Math.max(0, vh - margin * 2);

    const w = clamp(next.width, this.state.minWidth, maxW);
    const h = clamp(next.height, this.state.minHeight, maxH);

    const x = clamp(next.x, margin, vw - w - margin);
    const y = clamp(next.y, margin, vh - h - margin);

    return { x, y, width: w, height: h };
  }

  setupDragHandlers() {
    const onPointerDown = e => {
      if (e.button !== 0) return;
      if (this._resize) return;

      this._activePointerId = e.pointerId;
      this.header.setPointerCapture(e.pointerId);

      this._drag = {
        startX: e.clientX,
        startY: e.clientY,
        startWinX: this.state.x,
        startWinY: this.state.y
      };

      this.bumpActivity();
      e.preventDefault();
    };

    const onPointerMove = e => {
      if (!this._drag) return;
      if (e.pointerId !== this._activePointerId) return;

      const dx = e.clientX - this._drag.startX;
      const dy = e.clientY - this._drag.startY;

      const next = this.applyResizeConstraints({
        x: this._drag.startWinX + dx,
        y: this._drag.startWinY + dy,
        width: this.state.width,
        height: this.state.height
      });

      this.state.x = next.x;
      this.state.y = next.y;
      this.updateGeometry();
      e.preventDefault();
    };

    const onPointerUp = e => {
      if (!this._drag) return;
      if (e.pointerId !== this._activePointerId) return;

      this.cancelDrag();
      e.preventDefault();
    };

    const onPointerCancel = e => {
      if (!this._drag) return;
      if (e.pointerId !== this._activePointerId) return;

      this.cancelDrag();
    };

    this.header.addEventListener("pointerdown", onPointerDown);
    this.header.addEventListener("pointermove", onPointerMove);
    this.header.addEventListener("pointerup", onPointerUp);
    this.header.addEventListener("pointercancel", onPointerCancel);

    this._teardownOutsideClick = this._installOutsideClickToDismiss();
  }

  cancelDrag() {
    this._drag = null;
    this._activePointerId = null;
  }

  setupResizeHandlers() {
    const handleSize = 10;

    const getHitRegion = e => {
      const r = this.root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const onLeft = x >= 0 && x <= handleSize;
      const onRight = x >= r.width - handleSize && x <= r.width;
      const onTop = y >= 0 && y <= handleSize;
      const onBottom = y >= r.height - handleSize && y <= r.height;

      if (onTop && onLeft) return "nw";
      if (onTop && onRight) return "ne";
      if (onBottom && onLeft) return "sw";
      if (onBottom && onRight) return "se";
      if (onTop) return "n";
      if (onBottom) return "s";
      if (onLeft) return "w";
      if (onRight) return "e";
      return null;
    };

    const applyCursorClass = region => {
      this.root.classList.remove(
        "pw-resize-cursor-n",
        "pw-resize-cursor-s",
        "pw-resize-cursor-e",
        "pw-resize-cursor-w",
        "pw-resize-cursor-ne",
        "pw-resize-cursor-nw",
        "pw-resize-cursor-se",
        "pw-resize-cursor-sw"
      );
      if (!region) return;
      this.root.classList.add(`pw-resize-cursor-${region}`);
    };

    const onPointerMoveHover = e => {
      if (this._resize) return;
      const region = getHitRegion(e);
      applyCursorClass(region);
    };

    const onPointerDown = e => {
      if (e.button !== 0) return;
      const region = getHitRegion(e);
      if (!region) return;

      this.startResize(e, region);
      e.preventDefault();
    };

    const onPointerMove = e => {
      if (!this._resize) return;
      if (e.pointerId !== this._resize.pointerId) return;
      this.performResize(e);
      e.preventDefault();
    };

    const onPointerUp = e => {
      if (!this._resize) return;
      if (e.pointerId !== this._resize.pointerId) return;
      this.stopResize();
      e.preventDefault();
    };

    const onPointerCancel = e => {
      if (!this._resize) return;
      if (e.pointerId !== this._resize.pointerId) return;
      this.cancelResize();
    };

    this.root.addEventListener("pointermove", onPointerMoveHover);
    this.root.addEventListener("pointerdown", onPointerDown);
    this.root.addEventListener("pointermove", onPointerMove);
    this.root.addEventListener("pointerup", onPointerUp);
    this.root.addEventListener("pointercancel", onPointerCancel);
  }

  startResize(e, region) {
    this._resize = {
      pointerId: e.pointerId,
      region,
      startClientX: e.clientX,
      startClientY: e.clientY,
      start: { x: this.state.x, y: this.state.y, width: this.state.width, height: this.state.height }
    };

    this.root.setPointerCapture(e.pointerId);
    this.bumpActivity();
  }

  performResize(e) {
    const rz = this._resize;
    if (!rz) return;

    const dx = e.clientX - rz.startClientX;
    const dy = e.clientY - rz.startClientY;

    let next = { ...rz.start };

    const hasN = rz.region.includes("n");
    const hasS = rz.region.includes("s");
    const hasW = rz.region.includes("w");
    const hasE = rz.region.includes("e");

    if (hasE) next.width = rz.start.width + dx;
    if (hasS) next.height = rz.start.height + dy;

    if (hasW) {
      next.width = rz.start.width - dx;
      next.x = rz.start.x + dx;
    }
    if (hasN) {
      next.height = rz.start.height - dy;
      next.y = rz.start.y + dy;
    }

    next = this.applyResizeConstraints(next);

    this.state.x = next.x;
    this.state.y = next.y;
    this.state.width = next.width;
    this.state.height = next.height;
    this.updateGeometry();
  }

  stopResize() {
    this._resize = null;
  }

  cancelResize() {
    const rz = this._resize;
    if (!rz) return;

    const snap = this.applyResizeConstraints(rz.start);
    this.state.x = snap.x;
    this.state.y = snap.y;
    this.state.width = snap.width;
    this.state.height = snap.height;
    this.updateGeometry();

    this._resize = null;
  }

  _installOutsideClickToDismiss() {
    const onPointerDown = e => {
      if (!this.root.isConnected) return;
      if (this.root.contains(e.target)) return;
      this.destroy();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }
}

function ensurePreviewWindow() {
  if (previewState.window && previewState.window.root.isConnected) {
    return { win: previewState.window, created: false, usedLastPlacement: false };
  }
  const win = new PreviewWindow();
  const usedLastPlacement = applyLastPlacement(win);
  if (!usedLastPlacement) {
    setInitialPreviewPlacement(win);
  }
  win.onDestroy = () => {
    storePreviewPlacement(win);
    previewState.window = null;
    previewState.visibleFileId = null;
    previewState.visibleLine = null;
    clearPendingPreview();
  };
  previewState.window = win;
  return { win, created: true, usedLastPlacement };
}

function destroyPreviewWindow() {
  if (!previewState.window) return;
  storePreviewPlacement(previewState.window);
  previewState.window.destroy();
  previewState.window = null;
  previewState.visibleFileId = null;
  previewState.visibleLine = null;
  previewState.hoverLine = null;
  clearPendingPreview();
}

function clearPreviewCache() {
  previewState.cache.clear();
}

function prunePreviewCache() {
  if (previewState.cache.size <= PREVIEW_CACHE_LIMIT) return;
  const entries = [...previewState.cache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  const excess = entries.length - PREVIEW_CACHE_LIMIT;
  for (let i = 0; i < excess; i += 1) {
    previewState.cache.delete(entries[i][0]);
  }
}

function getPreviewSourceElement(fileId) {
  const section = getFileSection(fileId);
  if (!section) return null;
  const pre = section.querySelector("pre");
  if (!pre) return null;
  const code = pre.querySelector("code");
  if (!code) return null;
  const text = code.textContent || "";
  if (!text) {
    const file = state.files.find(item => item.id === fileId);
    if (file && file.size > 0) return null;
  }
  return pre;
}

function getPreviewClone(fileId, sourceEl) {
  const cached = previewState.cache.get(fileId);
  if (cached && cached.source === sourceEl && cached.clone) {
    cached.lastUsed = Date.now();
    return cached.clone;
  }
  const clone = sourceEl.cloneNode(true);
  previewState.cache.set(fileId, { source: sourceEl, clone, lastUsed: Date.now() });
  prunePreviewCache();
  return clone;
}

function getPreviewLabel(entry, fileId) {
  if (entry?.dataset?.filePath) return entry.dataset.filePath;
  const label = entry?.querySelector?.(".toc-link, .toc-text, .node-label");
  if (label?.textContent) return label.textContent.trim();
  if (entry?.textContent) return entry.textContent.trim();
  const file = state.files.find(item => item.id === fileId);
  return file?.path || "Preview";
}

function getPreviewTitle(entry, fileId) {
  const label = getPreviewLabel(entry, fileId);
  if (!label) return "PREVIEW";
  const parts = label.split(/[\\/]/).filter(Boolean);
  const name = parts.length ? parts[parts.length - 1] : label;
  return `👀 PREVIEW: ${name}`;
}

function clearPendingPreview() {
  if (previewState.pending?.timer) {
    clearTimeout(previewState.pending.timer);
  }
  previewState.pending = null;
}

function getVisiblePaneMetrics() {
  const margin = PREVIEW_VIEWPORT_MARGIN;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pane = els.main;
  if (!pane) {
    return { top: margin, height: Math.max(0, vh - margin * 2), width: Math.max(0, vw - margin * 2) };
  }
  const rect = pane.getBoundingClientRect();
  const top = clamp(rect.top, margin, vh - margin);
  const bottom = clamp(rect.bottom, margin, vh - margin);
  const height = Math.max(0, bottom - top);
  const width = Math.max(0, Math.min(rect.width, vw - margin * 2));
  return { top, height, width };
}

function setInitialPreviewPlacement(win) {
  if (!win) return;
  const margin = win.state.margin;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.max(0, vw - margin * 2);
  const maxH = Math.max(0, vh - margin * 2);

  const pane = getVisiblePaneMetrics();
  const width = clamp(pane.width * PREVIEW_INITIAL_WIDTH_RATIO, win.state.minWidth, maxW);
  const height = clamp(pane.height * PREVIEW_INITIAL_HEIGHT_RATIO, win.state.minHeight, maxH);

  const x = clamp(vw - margin - width, margin, vw - width - margin);
  const y = clamp(pane.top + (pane.height - height) / 2, margin, vh - height - margin);

  win.state.x = x;
  win.state.y = y;
  win.state.width = width;
  win.state.height = height;
  win.updateGeometry();
  win.clampToViewport();
  storePreviewPlacement(win);
}

function storePreviewPlacement(win) {
  if (!win) return;
  previewState.lastPlacement = {
    x: win.state.x,
    y: win.state.y,
    width: win.state.width,
    height: win.state.height
  };
}

function applyLastPlacement(win) {
  if (!previewState.lastPlacement) return false;
  const { x, y, width, height } = previewState.lastPlacement;
  win.state.x = x;
  win.state.y = y;
  win.state.width = width;
  win.state.height = height;
  win.updateGeometry();
  win.clampToViewport();
  storePreviewPlacement(win);
  return true;
}

function getPreviewLineFromEntry(entry, fileId) {
  const raw = entry?.dataset?.line;
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  const file = state.files.find(item => item.id === fileId);
  if (!file || !Number.isFinite(file.lineCount) || parsed > file.lineCount) return null;
  return parsed;
}

function clearPreviewLineMarker(root) {
  if (!root?.querySelectorAll) return;
  const markers = root.querySelectorAll(".ref-preview-marker");
  markers.forEach(marker => marker.remove());
}

function clearPreviewLineMarkersInCache() {
  previewState.cache.forEach(entry => {
    if (!entry?.clone) return;
    clearPreviewLineMarker(entry.clone);
  });
  if (previewState.window?.content) clearPreviewLineMarker(previewState.window.content);
}

function applyPreviewLineTarget(win, clone, fileId, lineNumber) {
  if (!win || !clone || !Number.isFinite(lineNumber)) return;
  const file = state.files.find(item => item.id === fileId);
  if (!file || lineNumber < 1 || lineNumber > file.lineCount) return;
  const pre = clone.matches?.("pre") ? clone : clone.querySelector?.("pre");
  if (!pre) return;

  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  const markerTop = Math.max(0, (lineNumber - 1) * lineHeight);
  const marker = document.createElement("div");
  marker.className = "ref-preview-marker";
  marker.style.top = `${markerTop}px`;
  marker.style.height = `${Math.max(1, Math.round(lineHeight))}px`;
  pre.appendChild(marker);

  const content = win.content;
  const targetOffset = pre.offsetTop + markerTop;
  const centered = targetOffset - ((content.clientHeight - lineHeight) / 2);
  const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight);
  content.scrollTop = clamp(centered, 0, maxScroll);
}

function showPreviewForEntry(entry, fileId, lineNumber = null) {
  if (!state.preview.enabled) return false;
  const source = getPreviewSourceElement(fileId);
  if (!source) return false;
  const { win } = ensurePreviewWindow();
  const clone = getPreviewClone(fileId, source);
  clearPreviewLineMarkersInCache();
  clearPreviewLineMarker(clone);
  win.setTitle(getPreviewTitle(entry, fileId));
  win.loadContent(clone);
  if (Number.isFinite(lineNumber)) {
    applyPreviewLineTarget(win, clone, fileId, lineNumber);
  } else {
    win.content.scrollTop = 0;
  }
  win.bumpActivity();
  previewState.visibleFileId = fileId;
  previewState.visibleLine = Number.isFinite(lineNumber) ? lineNumber : null;
  previewState.hoverLoaded = true;
  storePreviewPlacement(win);
  return true;
}

function schedulePreviewOpen(entry, fileId, lineNumber, delayMs) {
  clearPendingPreview();
  const timer = setTimeout(() => {
    if (!previewState.pending) return;
    if (
      previewState.pending.entry !== entry ||
      previewState.pending.fileId !== fileId ||
      previewState.pending.lineNumber !== lineNumber
    ) return;
    previewState.pending = null;
    if (!entry.isConnected) return;
    if (
      previewState.hoverEntry !== entry ||
      previewState.hoverFileId !== fileId ||
      previewState.hoverLine !== lineNumber
    ) return;
    if (!state.preview.enabled) return;
    try {
      showPreviewForEntry(entry, fileId, lineNumber);
    } catch (err) {
      console.warn("Preview open failed", err);
    }
  }, delayMs);
  previewState.pending = { entry, fileId, lineNumber, timer };
}

function getPreviewAnchorFromEvent(event) {
  const anchor = event.target.closest("a[data-file-id]");
  if (!anchor) return null;
  if (els.tocList?.contains(anchor) || els.treeContainer?.contains(anchor)) {
    return anchor;
  }
  const symbolPanelRoot = state.symbolRefs.ui.activePanel?.root || null;
  if (symbolPanelRoot?.contains(anchor)) {
    return anchor;
  }
  return null;
}

function handlePreviewPointerOver(event) {
  if (event.pointerType && event.pointerType !== "mouse") return;
  if (!state.preview.enabled) return;
  try {
    const entry = getPreviewAnchorFromEvent(event);
    if (!entry || entry.contains(event.relatedTarget)) return;
    const fileId = entry.dataset.fileId;
    if (!fileId) return;
    const lineNumber = getPreviewLineFromEntry(entry, fileId);
    clearPendingPreview();
    previewState.hoverEntry = entry;
    previewState.hoverFileId = fileId;
    previewState.hoverLine = lineNumber;
    previewState.hoverLoaded = Boolean(getPreviewSourceElement(fileId));
    if (!previewState.hoverLoaded) return;
    const sameVisibleTarget = (
      previewState.window &&
      previewState.visibleFileId === fileId &&
      previewState.visibleLine === lineNumber
    );
    if (sameVisibleTarget) {
      if (previewState.hoverLoaded) previewState.window.bumpActivity();
      return;
    }
    if (previewState.window && previewState.hoverLoaded) {
      previewState.window.bumpActivity();
    }
    const delay = previewState.window ? PREVIEW_SWITCH_DELAY : PREVIEW_OPEN_DELAY;
    schedulePreviewOpen(entry, fileId, lineNumber, delay);
  } catch (err) {
    console.warn("Preview hover failed", err);
  }
}

function handlePreviewPointerOut(event) {
  if (event.pointerType && event.pointerType !== "mouse") return;
  if (!state.preview.enabled) return;
  try {
    const entry = getPreviewAnchorFromEvent(event);
    if (!entry || entry.contains(event.relatedTarget)) return;
    if (previewState.hoverEntry !== entry) return;
    previewState.hoverEntry = null;
    previewState.hoverFileId = null;
    previewState.hoverLine = null;
    previewState.hoverLoaded = false;
    clearPendingPreview();
  } catch (err) {
    console.warn("Preview hover cleanup failed", err);
  }
}

function handlePreviewPointerMove(event) {
  if (event.pointerType && event.pointerType !== "mouse") return;
  if (!state.preview.enabled) return;
  try {
    if (!previewState.window) return;
    const entry = getPreviewAnchorFromEvent(event);
    if (!entry || entry !== previewState.hoverEntry) return;
    if (previewState.hoverLoaded) previewState.window.bumpActivity();
  } catch (err) {
    console.warn("Preview hover activity failed", err);
  }
}

function attachHoverPreviewHandlers(container) {
  if (!container || container.dataset.previewHoverBound === "true") return;
  container.addEventListener("pointerover", handlePreviewPointerOver);
  container.addEventListener("pointerout", handlePreviewPointerOut);
  container.addEventListener("pointermove", handlePreviewPointerMove);
  container.dataset.previewHoverBound = "true";
}

function setupHoverPreview() {
  if (els.tocList) attachHoverPreviewHandlers(els.tocList);
  if (els.treeContainer) attachHoverPreviewHandlers(els.treeContainer);
}

function handlePreviewViewportResize() {
  if (!previewState.window || !previewState.window.root.isConnected) return;
  previewState.window.clampToViewport();
  storePreviewPlacement(previewState.window);
}

function setPreviewEnabled(enabled) {
  state.preview.enabled = enabled;
  if (!enabled) {
    destroyPreviewWindow();
    previewState.hoverEntry = null;
    previewState.hoverFileId = null;
    previewState.hoverLine = null;
    previewState.hoverLoaded = false;
  }
  updateControlBar();
}

function ensureActiveFileVisible() {
  if (state.activeFileId && !isFileHidden(state.activeFileId)) {
    updateActiveLine();
    return;
  }
  const next = state.files.find(file => !isFileHidden(file.id));
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

function setSearchError(message, detail) {
  if (!els.codeSearchError) return;
  const hasMessage = !!message;
  els.codeSearchError.classList.toggle("hidden", !hasMessage);
  if (els.codeSearchErrorMessage) els.codeSearchErrorMessage.textContent = message || "";
  if (els.codeSearchErrorDetail) {
    const hasDetail = !!detail;
    els.codeSearchErrorDetail.textContent = detail || "";
    els.codeSearchErrorDetail.classList.toggle("hidden", !hasDetail);
  }
}

function clearSearchError() {
  setSearchError("", "");
}

function updateSearchSummary() {
  if (!els.codeSearchStatus) return;
  if (state.search.running) {
    const progress = state.search.progress || { processed: 0, total: 0 };
    let text = "Searching...";
    if (progress.total > 0) {
      text += ` ${progress.processed}/${progress.total} files`;
    }
    els.codeSearchStatus.textContent = text;
  } else {
    const count = state.search.results.length;
    els.codeSearchStatus.textContent = `${count} match${count === 1 ? "" : "es"}`;
  }
}

function updateSearchResultsMeta() {
  if (!els.codeSearchResultsMeta) return;
  els.codeSearchResultsMeta.textContent = state.search.partial ? "Partial results" : "";
}

function updateSearchCapNotice() {
  if (!els.codeSearchCap) return;
  els.codeSearchCap.classList.toggle("hidden", !state.search.capped);
}

function updateSearchButtons() {
  if (!els.codeSearchRun || !els.codeSearchCancel) return;
  const running = state.search.running;
  els.codeSearchCancel.classList.toggle("hidden", !running);
  els.codeSearchCancel.disabled = !running;
}

function updateSearchAvailability() {
  const isLoaded = state.phase === "loaded";
  const controls = [
    els.codeSearchMode,
    els.codeSearchScope,
    els.codeSearchQuery,
    els.codeSearchCase,
    els.codeSearchLive,
    els.codeSearchRun
  ].filter(Boolean);
  controls.forEach(control => {
    control.disabled = !isLoaded;
  });
  if (!isLoaded && state.search.running) {
    cancelSearchRun("reset");
  }
  if (els.codeSearchUnavailable) {
    els.codeSearchUnavailable.classList.toggle("hidden", isLoaded);
  }
  if (els.codeSearchResultsList) {
    els.codeSearchResultsList.classList.toggle("hidden", !isLoaded);
  }
  if (!isLoaded) {
    if (els.codeSearchCap) els.codeSearchCap.classList.add("hidden");
  } else {
    updateSearchCapNotice();
  }
  updateSearchButtons();
}

function resetSearchPanel() {
  cancelSearchRun("reset");
  state.search.results = [];
  state.search.rendered = 0;
  state.search.partial = false;
  state.search.capped = false;
  state.search.progress = { processed: 0, total: 0 };
  if (state.search.liveTimer) {
    clearTimeout(state.search.liveTimer);
    state.search.liveTimer = null;
  }
  if (els.codeSearchPanel) els.codeSearchPanel.open = false;
  if (els.codeSearchMode) els.codeSearchMode.value = "text";
  if (els.codeSearchScope) els.codeSearchScope.value = "all";
  if (els.codeSearchQuery) els.codeSearchQuery.value = "";
  if (els.codeSearchCase) els.codeSearchCase.checked = false;
  if (els.codeSearchLive) els.codeSearchLive.checked = false;
  if (els.codeSearchResultsList) els.codeSearchResultsList.innerHTML = "";
  clearSearchError();
  updateSearchResultsMeta();
  updateSearchCapNotice();
  updateSearchSummary();
  updateSearchAvailability();
}

function getSearchScopeFiles(scope) {
  const files = scope === "visible"
    ? state.files.filter(file => !isFileHidden(file.id))
    : state.files.slice();
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function appendSearchResults() {
  if (!els.codeSearchResultsList) return;
  if (state.search.rendered >= state.search.results.length) return;
  const fragment = document.createDocumentFragment();
  for (let i = state.search.rendered; i < state.search.results.length; i += 1) {
    fragment.appendChild(buildSearchResultCard(state.search.results[i]));
  }
  els.codeSearchResultsList.appendChild(fragment);
  state.search.rendered = state.search.results.length;
}

function buildSearchResultCard(result) {
  const card = document.createElement("div");
  card.className = "code-search-result";
  card.setAttribute("role", "listitem");

  const header = document.createElement("div");
  header.className = "code-search-result-header";

  const fileLink = document.createElement("a");
  fileLink.className = "code-search-result-link";
  fileLink.href = `#${result.fileId}@${result.lineNumber}`;
  fileLink.textContent = result.path;
  fileLink.addEventListener("click", event => {
    event.preventDefault();
    navigateToFileLine(result.fileId, result.lineNumber);
  });

  const lineLink = document.createElement("a");
  lineLink.className = "code-search-result-link";
  lineLink.href = `#${result.fileId}@${result.lineNumber}`;
  lineLink.textContent = `Line ${result.lineNumber}`;
  lineLink.addEventListener("click", event => {
    event.preventDefault();
    navigateToFileLine(result.fileId, result.lineNumber);
  });

  header.appendChild(fileLink);
  header.appendChild(lineLink);

  const preview = document.createElement("div");
  preview.className = "code-search-preview";

  result.snippet.forEach(line => {
    const row = document.createElement("div");
    row.className = "code-search-line";
    if (line.isMatch) row.classList.add("is-match");
    row.addEventListener("click", () => navigateToFileLine(result.fileId, line.number));

    const number = document.createElement("span");
    number.className = "code-search-line-number";
    number.textContent = line.number;

    const text = document.createElement("span");
    text.className = "code-search-line-text";
    if (line.isMatch && Number.isFinite(result.matchStart) && Number.isFinite(result.matchEnd) && result.matchEnd > result.matchStart) {
      const before = line.text.slice(0, result.matchStart);
      const matchText = line.text.slice(result.matchStart, result.matchEnd);
      const after = line.text.slice(result.matchEnd);
      if (before) text.appendChild(document.createTextNode(before));
      const highlight = document.createElement("span");
      highlight.className = "code-search-match";
      highlight.textContent = matchText;
      text.appendChild(highlight);
      if (after) text.appendChild(document.createTextNode(after));
    } else {
      text.textContent = line.text;
    }

    row.appendChild(number);
    row.appendChild(text);
    preview.appendChild(row);
  });

  card.appendChild(header);
  card.appendChild(preview);
  return card;
}

function finishSearchRun() {
  state.search.running = false;
  state.search.activeRun = null;
  updateSearchSummary();
  updateSearchButtons();
  updateSearchResultsMeta();
  updateSearchCapNotice();
}

function cancelSearchRun(reason) {
  if (!state.search.running && !state.search.activeRun) return;
  state.search.running = false;
  state.search.activeRun = null;
  if (reason === "user") {
    state.search.partial = true;
  }
  updateSearchSummary();
  updateSearchButtons();
  updateSearchResultsMeta();
}

function runSearchSlice(run) {
  if (!state.search.running || state.search.runId !== run.id) return;
  const start = performance.now();
  let appended = false;
  while (run.fileIndex < run.files.length) {
    if (!state.search.running || state.search.runId !== run.id) return;
    const file = run.files[run.fileIndex];
    if (!run.lines) run.lines = file.text.split("\n");
    while (run.lineIndex < run.lines.length) {
      if (performance.now() - start > SEARCH_SLICE_BUDGET) {
        if (appended) appendSearchResults();
        updateSearchSummary();
        setTimeout(() => runSearchSlice(run), 0);
        return;
      }
      const lineText = run.lines[run.lineIndex];
      const match = matchLine(lineText, run.matcher);
      if (match) {
        const result = {
          fileId: file.id,
          path: file.path,
          lineNumber: run.lineIndex + 1,
          matchStart: match.start,
          matchEnd: match.end,
          snippet: buildSnippetLines(run.lines, run.lineIndex)
        };
        state.search.results.push(result);
        appended = true;
        if (state.search.results.length >= SEARCH_CAP) {
          state.search.capped = true;
          appendSearchResults();
          finishSearchRun();
          return;
        }
      }
      run.lineIndex += 1;
    }
    run.fileIndex += 1;
    run.lineIndex = 0;
    run.lines = null;
    state.search.progress.processed = run.fileIndex;
  }
  if (appended) appendSearchResults();
  finishSearchRun();
}

function startSearchRun(source) {
  if (state.phase !== "loaded") return;
  const rawQuery = els.codeSearchQuery?.value || "";
  const mode = els.codeSearchMode?.value || "text";
  const scope = els.codeSearchScope?.value || "all";
  const caseSensitive = !!els.codeSearchCase?.checked;
  const minLength = source === "live" ? SEARCH_LIVE_MIN : SEARCH_EXPLICIT_MIN;
  const showMinLengthError = source !== "live";
  const validation = validateSearchQuery(rawQuery, {
    minLength,
    showMinLengthError,
    mode,
    caseSensitive,
    onError: setSearchError,
    onClearError: clearSearchError
  });
  if (!validation.ok) return;
  if (source !== "live" && state.search.liveTimer) {
    clearTimeout(state.search.liveTimer);
    state.search.liveTimer = null;
  }

  cancelSearchRun("new");
  state.search.runId += 1;
  state.search.running = true;
  state.search.partial = false;
  state.search.capped = false;
  state.search.results = [];
  state.search.rendered = 0;
  state.search.progress = { processed: 0, total: 0 };
  if (els.codeSearchResultsList) els.codeSearchResultsList.innerHTML = "";
  updateSearchResultsMeta();
  updateSearchCapNotice();
  updateSearchButtons();

  const files = getSearchScopeFiles(scope);
  state.search.progress.total = files.length;
  updateSearchSummary();

  if (!files.length) {
    finishSearchRun();
    return;
  }

  const matcher = buildSearchMatcher(validation.trimmed, mode, caseSensitive);
  const run = {
    id: state.search.runId,
    files,
    fileIndex: 0,
    lineIndex: 0,
    lines: null,
    matcher
  };
  state.search.activeRun = run;
  setTimeout(() => runSearchSlice(run), 0);
}

function scheduleLiveSearch() {
  if (!els.codeSearchLive?.checked) return;
  if (state.search.liveTimer) {
    clearTimeout(state.search.liveTimer);
  }
  if (state.search.running) {
    cancelSearchRun("new");
  }
  state.search.liveTimer = setTimeout(() => {
    state.search.liveTimer = null;
    startSearchRun("live");
  }, SEARCH_LIVE_DEBOUNCE);
}

function maybeYield(lastYieldRef) {
  const now = performance.now();
  if (now - lastYieldRef.value > 16) {
    lastYieldRef.value = now;
    return new Promise(resolve => setTimeout(resolve, 0));
  }
  return Promise.resolve();
}

function createNormalizedSymbolContribution(file, contribution, source) {
  const fallback = createEmptySymbolContribution(file, source);
  const raw = contribution || fallback;
  return {
    fileId: file?.id || raw.fileId || "",
    sourcePath: normalizeProjectPath(file?.path || raw.sourcePath || ""),
    source: source || raw.source || "heuristic",
    definitions: Array.isArray(raw.definitions) ? raw.definitions : [],
    references: Array.isArray(raw.references) ? raw.references : []
  };
}

function cancelSymbolReferenceBuild() {
  const build = state.symbolRefs.build;
  build.runId += 1;
  build.running = false;
  build.stage = "idle";
  if (build.pendingHandle) {
    clearTimeout(build.pendingHandle);
    build.pendingHandle = null;
  }
}

function cancelSymbolReferenceIncremental() {
  const incremental = state.symbolRefs.incremental;
  if (incremental.debounceHandle) {
    clearTimeout(incremental.debounceHandle);
    incremental.debounceHandle = null;
  }
  if (incremental.batchHandle) {
    clearTimeout(incremental.batchHandle);
    incremental.batchHandle = null;
  }
  incremental.pendingFileIds.clear();
  incremental.running = false;
}

function destroySymbolReferencePanel() {
  const ui = state.symbolRefs.ui;
  if (ui.refreshHandle) {
    clearTimeout(ui.refreshHandle);
    ui.refreshHandle = null;
  }
  const win = ui.activePanel;
  if (!win) return;
  ui.activePanel = null;
  ui.activeSymbol = "";
  ui.activeSourceFileId = "";
  ui.renderedVersion = -1;
  win.destroy();
}

function resetSymbolReferenceStateForLoad() {
  const enabled = state.settings.symbolRefs !== false;
  cancelSymbolReferenceBuild();
  cancelSymbolReferenceIncremental();
  destroySymbolReferencePanel();
  state.symbolRefs.enabled = enabled;
  state.symbolRefs.indexVersion = 0;
  state.symbolRefs.index = { bySymbol: new Map() };
  state.symbolRefs.contributions = {
    heuristicByFile: new Map(),
    treeByFile: new Map(),
    effectiveByFile: new Map()
  };
  state.symbolRefs.build.progress = { processed: 0, total: 0 };
  state.symbolRefs.build.partial = false;
  state.symbolRefs.build.ready = false;
  if (enabled) attachSymbolReferenceDelegates();
  else detachSymbolReferenceDelegates();
}

function attachSymbolReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.symbolRefsDelegatesAttached === "true") return;
  els.fileContainer.addEventListener("click", handleSymbolReferenceClick);
  els.fileContainer.dataset.symbolRefsDelegatesAttached = "true";
}

function detachSymbolReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.symbolRefsDelegatesAttached !== "true") return;
  els.fileContainer.removeEventListener("click", handleSymbolReferenceClick);
  delete els.fileContainer.dataset.symbolRefsDelegatesAttached;
}

function getSymbolContributionForFile(fileId) {
  const treeContribution = state.symbolRefs.contributions.treeByFile.get(fileId);
  if (treeContribution) return treeContribution;
  return state.symbolRefs.contributions.heuristicByFile.get(fileId) || null;
}

function refreshEffectiveSymbolContribution(fileId) {
  const effective = getSymbolContributionForFile(fileId);
  if (effective) state.symbolRefs.contributions.effectiveByFile.set(fileId, effective);
  else state.symbolRefs.contributions.effectiveByFile.delete(fileId);
}

function createSymbolIndexEntry(symbol) {
  return {
    symbol,
    totalDefinitions: 0,
    totalReferences: 0,
    totalOccurrences: 0,
    storedDetails: 0,
    truncated: false,
    definitionFiles: new Map(),
    referenceFiles: new Map()
  };
}

function shouldSkipWeakBridgeSymbol(symbol, bridgeClass, weakFileMap, treeDefinitionSymbols) {
  if (bridgeClass !== "weak") return false;
  if (treeDefinitionSymbols.has(symbol)) return false;
  const files = weakFileMap.get(symbol);
  return !files || files.size < 2;
}

function collectWeakBridgeStats(contribution, weakFileMap, treeDefinitionSymbols) {
  const all = [...(contribution.definitions || []), ...(contribution.references || [])];
  for (let i = 0; i < all.length; i += 1) {
    const occ = all[i];
    if (!occ || !occ.symbol) continue;
    if (occ.role === "definition" && occ.source === "tree") {
      treeDefinitionSymbols.add(occ.symbol);
    }
    if (occ.bridgeClass === "weak") {
      const existing = weakFileMap.get(occ.symbol) || new Set();
      existing.add(contribution.fileId);
      weakFileMap.set(occ.symbol, existing);
    }
  }
}

function addSymbolOccurrenceToIndex(bySymbol, contribution, occurrence) {
  if (!occurrence?.symbol) return;
  let entry = bySymbol.get(occurrence.symbol);
  if (!entry) {
    entry = createSymbolIndexEntry(occurrence.symbol);
    bySymbol.set(occurrence.symbol, entry);
  }

  const isDefinition = occurrence.role === "definition";
  if (isDefinition) entry.totalDefinitions += 1;
  else entry.totalReferences += 1;
  entry.totalOccurrences += 1;

  if (isDefinition) {
    let bucket = entry.definitionFiles.get(contribution.fileId);
    if (!bucket) {
      bucket = { fileId: contribution.fileId, sourcePath: contribution.sourcePath, items: [] };
      entry.definitionFiles.set(contribution.fileId, bucket);
    }
    if (entry.storedDetails < SYMBOL_REFS_MAX_OCCURRENCES_PER_SYMBOL) {
      bucket.items.push({
        lineNumber: occurrence.lineNumber,
        startCol: occurrence.startCol,
        endCol: occurrence.endCol,
        kind: occurrence.kind,
        source: occurrence.source || contribution.source
      });
      entry.storedDetails += 1;
    } else {
      entry.truncated = true;
    }
    return;
  }

  let refBucket = entry.referenceFiles.get(contribution.fileId);
  if (!refBucket) {
    refBucket = {
      fileId: contribution.fileId,
      sourcePath: contribution.sourcePath,
      count: 0,
      lineNumbers: [],
      kindCounts: new Map()
    };
    entry.referenceFiles.set(contribution.fileId, refBucket);
  }
  refBucket.count += 1;
  refBucket.kindCounts.set(occurrence.kind || "reference", (refBucket.kindCounts.get(occurrence.kind || "reference") || 0) + 1);
  if (
    !refBucket.lineNumbers.includes(occurrence.lineNumber) &&
    refBucket.lineNumbers.length < SYMBOL_REFS_MAX_LINES_PER_FILE
  ) {
    if (entry.storedDetails < SYMBOL_REFS_MAX_OCCURRENCES_PER_SYMBOL) {
      refBucket.lineNumbers.push(occurrence.lineNumber);
      entry.storedDetails += 1;
    } else {
      entry.truncated = true;
    }
  }
}

function runSymbolIndexRebuildSlice(run) {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (run.id !== state.symbolRefs.build.runId) return;

  const start = performance.now();
  try {
    while (performance.now() - start <= SYMBOL_REFS_BUILD_SLICE_BUDGET) {
      if (run.stage === "scan") {
        if (run.fileIndex >= run.files.length) {
          run.stage = "build";
          run.fileIndex = 0;
          state.symbolRefs.build.progress.processed = run.files.length;
          continue;
        }
        collectWeakBridgeStats(run.files[run.fileIndex], run.weakFileMap, run.treeDefinitionSymbols);
        run.fileIndex += 1;
        state.symbolRefs.build.progress.processed = run.fileIndex;
        continue;
      }

      if (run.stage === "build") {
        if (run.fileIndex >= run.files.length) {
          state.symbolRefs.index = { bySymbol: run.bySymbol };
          state.symbolRefs.build.running = false;
          state.symbolRefs.build.pendingHandle = null;
          state.symbolRefs.build.stage = "idle";
          state.symbolRefs.build.progress = { processed: run.files.length * 2, total: run.files.length * 2 };
          if (run.reason === "baseline") state.symbolRefs.build.ready = true;
          state.symbolRefs.indexVersion += 1;
          scheduleSymbolReferencePanelRefresh();
          updateControlBar();
          if (typeof run.onComplete === "function") run.onComplete();
          return;
        }

        const contribution = run.files[run.fileIndex];
        const defs = contribution.definitions || [];
        const refs = contribution.references || [];
        for (let i = 0; i < defs.length; i += 1) {
          const occ = defs[i];
          if (shouldSkipWeakBridgeSymbol(occ.symbol, occ.bridgeClass, run.weakFileMap, run.treeDefinitionSymbols)) continue;
          addSymbolOccurrenceToIndex(run.bySymbol, contribution, occ);
        }
        for (let i = 0; i < refs.length; i += 1) {
          const occ = refs[i];
          if (shouldSkipWeakBridgeSymbol(occ.symbol, occ.bridgeClass, run.weakFileMap, run.treeDefinitionSymbols)) continue;
          addSymbolOccurrenceToIndex(run.bySymbol, contribution, occ);
        }
        run.fileIndex += 1;
        state.symbolRefs.build.progress.processed = run.files.length + run.fileIndex;
        continue;
      }

      break;
    }
  } catch (err) {
    addLog("symbol-refs", `rebuild error: ${err?.message || err}`);
    state.symbolRefs.build.partial = true;
    state.symbolRefs.build.running = false;
    state.symbolRefs.build.pendingHandle = null;
    state.symbolRefs.build.stage = "idle";
    updateControlBar();
    if (typeof run.onComplete === "function") run.onComplete();
    return;
  }

  state.symbolRefs.build.pendingHandle = setTimeout(() => runSymbolIndexRebuildSlice(run), 0);
  updateControlBar();
}

function startSymbolIndexRebuild(reason = "baseline", onComplete = null) {
  cancelSymbolReferenceBuild();
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  const files = [...state.symbolRefs.contributions.effectiveByFile.values()].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  state.symbolRefs.build.runId += 1;
  state.symbolRefs.build.running = true;
  state.symbolRefs.build.stage = "rebuild";
  state.symbolRefs.build.progress = { processed: 0, total: files.length * 2 };
  const run = {
    id: state.symbolRefs.build.runId,
    reason,
    stage: "scan",
    files,
    fileIndex: 0,
    weakFileMap: new Map(),
    treeDefinitionSymbols: new Set(),
    bySymbol: new Map(),
    onComplete
  };
  state.symbolRefs.build.pendingHandle = setTimeout(() => runSymbolIndexRebuildSlice(run), 0);
  updateControlBar();
}

function runSymbolBaselineSlice(run) {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (run.id !== state.symbolRefs.build.runId) return;

  const start = performance.now();
  try {
    while (run.fileIndex < run.files.length) {
      if (!run.file) {
        run.file = run.files[run.fileIndex];
        run.lines = run.file.text.split("\n");
        run.lineIndex = 0;
        run.isConfigFile = isConfigLikeFile(run.file.path);
        run.contribution = createNormalizedSymbolContribution(run.file, null, "heuristic");
      }

      while (run.lineIndex < run.lines.length) {
        if (performance.now() - start > SYMBOL_REFS_BUILD_SLICE_BUDGET) {
          state.symbolRefs.build.progress.processed = run.fileIndex;
          state.symbolRefs.build.pendingHandle = setTimeout(() => runSymbolBaselineSlice(run), 0);
          updateControlBar();
          return;
        }
        const lineNumber = run.lineIndex + 1;
        const matches = extractHeuristicSymbolsFromLine(run.lines[run.lineIndex], {
          lineNumber,
          isConfigFile: run.isConfigFile,
          minLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
          minBridgeLength: SYMBOL_REFS_MIN_BRIDGE_LENGTH
        });
        for (let i = 0; i < matches.length; i += 1) {
          const item = matches[i];
          if (item.role === "definition") run.contribution.definitions.push(item);
          else run.contribution.references.push(item);
        }
        run.lineIndex += 1;
      }

      state.symbolRefs.contributions.heuristicByFile.set(run.file.id, run.contribution);
      const cached = state.treeSitter.cache[run.file.id]?.symbolRefs;
      if (cached) {
        const normalized = createNormalizedSymbolContribution(run.file, cached, "tree");
        state.symbolRefs.contributions.treeByFile.set(run.file.id, normalized);
      }
      refreshEffectiveSymbolContribution(run.file.id);

      run.fileIndex += 1;
      run.file = null;
      run.lines = null;
      run.contribution = null;
      run.lineIndex = 0;
      run.isConfigFile = false;
      state.symbolRefs.build.progress.processed = run.fileIndex;
    }
  } catch (err) {
    addLog("symbol-refs", `baseline error: ${err?.message || err}`);
    state.symbolRefs.build.partial = true;
  }

  if (run.fileIndex >= run.files.length && run.id === state.symbolRefs.build.runId) {
    state.symbolRefs.build.pendingHandle = null;
    startSymbolIndexRebuild("baseline");
  }
}

function scheduleSymbolReferenceBaselineBuild() {
  cancelSymbolReferenceBuild();
  cancelSymbolReferenceIncremental();
  state.symbolRefs.index = { bySymbol: new Map() };
  state.symbolRefs.indexVersion = 0;
  state.symbolRefs.build.partial = false;
  state.symbolRefs.build.ready = false;
  state.symbolRefs.contributions.heuristicByFile.clear();
  state.symbolRefs.contributions.treeByFile.clear();
  state.symbolRefs.contributions.effectiveByFile.clear();
  if (!state.symbolRefs.enabled || state.phase !== "loaded") {
    updateControlBar();
    return;
  }

  const files = state.files.slice().sort((a, b) => a.path.localeCompare(b.path));
  state.symbolRefs.build.runId += 1;
  state.symbolRefs.build.running = true;
  state.symbolRefs.build.stage = "baseline";
  state.symbolRefs.build.progress = { processed: 0, total: files.length };
  const run = {
    id: state.symbolRefs.build.runId,
    files,
    fileIndex: 0,
    file: null,
    lines: null,
    lineIndex: 0,
    isConfigFile: false,
    contribution: null
  };
  state.symbolRefs.build.pendingHandle = setTimeout(() => runSymbolBaselineSlice(run), 0);
  updateControlBar();
}

function scheduleSymbolReferenceIncrementalUpdate(fileId) {
  if (!state.symbolRefs.enabled || !fileId || state.phase !== "loaded") return;
  const incremental = state.symbolRefs.incremental;
  incremental.pendingFileIds.add(fileId);
  if (incremental.debounceHandle) clearTimeout(incremental.debounceHandle);
  incremental.debounceHandle = setTimeout(() => {
    incremental.debounceHandle = null;
    incremental.batchHandle = setTimeout(runSymbolReferenceIncrementalBatch, 0);
  }, SYMBOL_REFS_INCREMENTAL_DEBOUNCE_MS);
}

function runSymbolReferenceIncrementalBatch() {
  const incremental = state.symbolRefs.incremental;
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (state.symbolRefs.build.running) {
    incremental.batchHandle = setTimeout(runSymbolReferenceIncrementalBatch, 300);
    return;
  }

  const pending = [...incremental.pendingFileIds].slice(0, SYMBOL_REFS_INCREMENTAL_BATCH_SIZE);
  pending.forEach(id => incremental.pendingFileIds.delete(id));
  if (!pending.length) {
    incremental.running = false;
    updateControlBar();
    return;
  }

  incremental.running = true;
  state.symbolRefs.build.running = true;
  state.symbolRefs.build.stage = "incremental";
  state.symbolRefs.build.progress = { processed: 0, total: pending.length };
  updateControlBar();

  try {
    for (let i = 0; i < pending.length; i += 1) {
      const fileId = pending[i];
      const file = state.files.find(item => item.id === fileId);
      if (!file) continue;
      const cached = state.treeSitter.cache[fileId]?.symbolRefs;
      if (cached) {
        const normalized = createNormalizedSymbolContribution(file, cached, "tree");
        state.symbolRefs.contributions.treeByFile.set(fileId, normalized);
      } else {
        state.symbolRefs.contributions.treeByFile.delete(fileId);
      }
      refreshEffectiveSymbolContribution(fileId);
      state.symbolRefs.build.progress.processed = i + 1;
    }
  } catch (err) {
    addLog("symbol-refs", `incremental error: ${err?.message || err}`);
    state.symbolRefs.build.partial = true;
  }

  startSymbolIndexRebuild("incremental", () => {
    incremental.running = false;
    if (incremental.pendingFileIds.size > 0) {
      incremental.batchHandle = setTimeout(runSymbolReferenceIncrementalBatch, 0);
    } else {
      incremental.batchHandle = null;
      updateControlBar();
    }
  });
}

function getSymbolReferenceStatusText() {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return "";
  if (!state.symbolRefs.build.running) return "";
  const progress = state.symbolRefs.build.progress;
  const processed = Number.isFinite(progress.processed) ? progress.processed : 0;
  const total = Number.isFinite(progress.total) ? progress.total : 0;
  return `Indexing references • ${processed}/${total}`;
}

function ensureSymbolReferencePanelWindow() {
  const existing = state.symbolRefs.ui.activePanel;
  if (existing && existing.root?.isConnected) return existing;
  const win = new PreviewWindow({
    width: 460,
    height: 360,
    minWidth: 300,
    minHeight: 220,
    destroyAfterMs: PREVIEW_INACTIVE_MS
  });
  win.onDestroy = () => {
    const ui = state.symbolRefs.ui;
    if (ui.refreshHandle) {
      clearTimeout(ui.refreshHandle);
      ui.refreshHandle = null;
    }
    ui.activePanel = null;
    ui.activeSymbol = "";
    ui.activeSourceFileId = "";
    ui.renderedVersion = -1;
  };
  attachHoverPreviewHandlers(win.root);
  state.symbolRefs.ui.activePanel = win;
  return win;
}

function createSymbolReferenceActionButton(label, className, onClick) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function openSearchForSymbol(symbol) {
  if (!symbol || !els.codeSearchQuery || !els.codeSearchPanel) return;
  els.codeSearchPanel.open = true;
  els.codeSearchQuery.value = symbol;
  if (els.codeSearchScope) els.codeSearchScope.value = "all";
  if (els.codeSearchMode) els.codeSearchMode.value = "text";
  if (els.codeSearchLive) els.codeSearchLive.checked = false;
  startSearchRun("explicit");
}

function buildSymbolReferencePanelContent(symbol, sourceFileId) {
  const container = document.createElement("div");
  container.className = "symbol-ref-panel";

  const title = document.createElement("div");
  title.className = "symbol-ref-title";
  const titleCode = document.createElement("code");
  titleCode.textContent = symbol;
  title.appendChild(titleCode);
  container.appendChild(title);

  const entry = state.symbolRefs.index.bySymbol.get(symbol);
  const totalRefs = entry?.totalReferences || 0;
  const totalDefs = entry?.totalDefinitions || 0;
  const refFiles = entry?.referenceFiles?.size || 0;
  const defsText = totalDefs === 1 ? "1 definition" : `${totalDefs} definitions`;
  const refsText = totalRefs === 1 ? "1 reference" : `${totalRefs} references`;
  const summary = document.createElement("div");
  summary.className = "symbol-ref-summary";
  const partial = !state.symbolRefs.build.ready || state.symbolRefs.build.partial || state.symbolRefs.build.running;
  summary.textContent = `${defsText} • ${refsText} in ${refFiles} file${refFiles === 1 ? "" : "s"} • ${partial ? "Partial index" : "Index ready"}`;
  container.appendChild(summary);

  const actions = document.createElement("div");
  actions.className = "symbol-ref-actions";
  actions.appendChild(createSymbolReferenceActionButton("Copy symbol", "secondary tiny", () => copyTextToClipboard(symbol)));
  actions.appendChild(createSymbolReferenceActionButton("Open search", "ghost tiny", () => openSearchForSymbol(symbol)));
  container.appendChild(actions);

  const defsTitle = document.createElement("div");
  defsTitle.className = "symbol-ref-meta";
  defsTitle.textContent = "Definitions";
  container.appendChild(defsTitle);

  const defsList = document.createElement("div");
  defsList.className = "symbol-ref-list";
  const definitionRows = [];
  if (entry?.definitionFiles) {
    entry.definitionFiles.forEach(bucket => {
      (bucket.items || []).forEach(item => {
        definitionRows.push({
          fileId: bucket.fileId,
          sourcePath: bucket.sourcePath,
          lineNumber: item.lineNumber,
          kind: item.kind
        });
      });
    });
  }
  definitionRows.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath) || a.lineNumber - b.lineNumber);
  if (!definitionRows.length) {
    const empty = document.createElement("div");
    empty.className = "symbol-ref-empty";
    empty.textContent = "No definition found in indexed files.";
    defsList.appendChild(empty);
  } else {
    definitionRows.forEach(row => {
      const defRow = document.createElement("button");
      defRow.className = "symbol-ref-row";
      defRow.type = "button";
      const path = document.createElement("div");
      path.className = "symbol-ref-path";
      path.textContent = row.sourcePath;
      const meta = document.createElement("div");
      meta.className = "symbol-ref-meta";
      meta.textContent = `${row.kind} • line ${row.lineNumber}`;
      defRow.appendChild(path);
      defRow.appendChild(meta);
      defRow.addEventListener("click", () => navigateToFileLine(row.fileId, row.lineNumber));
      defsList.appendChild(defRow);
    });
  }
  container.appendChild(defsList);

  const refsTitle = document.createElement("div");
  refsTitle.className = "symbol-ref-meta";
  refsTitle.textContent = "References";
  container.appendChild(refsTitle);

  const refsList = document.createElement("div");
  refsList.className = "symbol-ref-list";
  const referenceRows = entry?.referenceFiles
    ? [...entry.referenceFiles.values()]
      .map(bucket => ({
        fileId: bucket.fileId,
        sourcePath: bucket.sourcePath,
        count: bucket.count || 0,
        lineNumbers: (bucket.lineNumbers || []).slice().sort((a, b) => a - b)
      }))
      .filter(row => !!row.fileId)
      .sort((a, b) => b.count - a.count || a.sourcePath.localeCompare(b.sourcePath))
    : [];

  if (!referenceRows.length) {
    const empty = document.createElement("div");
    empty.className = "symbol-ref-empty";
    empty.textContent = "No references found in indexed files.";
    refsList.appendChild(empty);
  } else {
    const visibleRows = referenceRows.slice(0, SYMBOL_REFS_MAX_REFERENCE_FILES_SHOWN);
    visibleRows.forEach(row => {
      const refRow = document.createElement("div");
      refRow.className = "symbol-ref-row";
      const path = document.createElement("a");
      path.className = "symbol-ref-path-button";
      path.href = `#${row.fileId}`;
      path.dataset.fileId = row.fileId;
      path.dataset.filePath = row.sourcePath;
      path.textContent = row.sourcePath;
      path.addEventListener("click", event => {
        event.preventDefault();
        const line = row.lineNumbers[0] || 1;
        navigateToFileLine(row.fileId, line);
      });
      refRow.appendChild(path);

      const meta = document.createElement("div");
      meta.className = "symbol-ref-meta";
      meta.textContent = `${row.count} hit${row.count === 1 ? "" : "s"}`;
      refRow.appendChild(meta);

      const lines = document.createElement("div");
      lines.className = "symbol-ref-lines";
      row.lineNumbers.forEach(line => {
        const lineLink = document.createElement("a");
        lineLink.className = "symbol-ref-line-chip";
        lineLink.href = `#${row.fileId}@${line}`;
        lineLink.dataset.fileId = row.fileId;
        lineLink.dataset.filePath = row.sourcePath;
        lineLink.dataset.line = String(line);
        lineLink.textContent = `L${line}`;
        lineLink.addEventListener("click", event => {
          event.preventDefault();
          navigateToFileLine(row.fileId, line);
        });
        lines.appendChild(lineLink);
      });
      const hiddenCount = row.count - row.lineNumbers.length;
      if (hiddenCount > 0) {
        const more = document.createElement("span");
        more.className = "symbol-ref-meta";
        more.textContent = `+${hiddenCount} more`;
        lines.appendChild(more);
      }
      refRow.appendChild(lines);
      refsList.appendChild(refRow);
    });

    if (referenceRows.length > SYMBOL_REFS_MAX_REFERENCE_FILES_SHOWN) {
      const more = document.createElement("div");
      more.className = "symbol-ref-meta";
      more.textContent = `Showing first ${SYMBOL_REFS_MAX_REFERENCE_FILES_SHOWN} files of ${referenceRows.length}.`;
      refsList.appendChild(more);
    }
  }

  if (entry?.truncated) {
    const trunc = document.createElement("div");
    trunc.className = "symbol-ref-meta";
    trunc.textContent = `Showing first ${SYMBOL_REFS_MAX_OCCURRENCES_PER_SYMBOL} detailed locations, total ${entry.totalOccurrences}.`;
    refsList.appendChild(trunc);
  }
  container.appendChild(refsList);

  if (!entry && sourceFileId) {
    const noData = document.createElement("div");
    noData.className = "symbol-ref-meta";
    noData.textContent = "No indexed data for this symbol yet.";
    container.appendChild(noData);
  }

  return container;
}

function openSymbolReferencePanel(anchorEl, symbol, sourceFileId) {
  if (!state.symbolRefs.enabled || !symbol || !anchorEl) return;
  const win = ensureSymbolReferencePanelWindow();
  win.setTitle("Symbol references");
  win.loadContent(buildSymbolReferencePanelContent(symbol, sourceFileId));
  win.positionWindowNearElement(anchorEl, { resizeToFit: false, preferRight: true });
  win.bumpActivity();
  state.symbolRefs.ui.activeSymbol = symbol;
  state.symbolRefs.ui.activeSourceFileId = sourceFileId || "";
  state.symbolRefs.ui.renderedVersion = state.symbolRefs.indexVersion;
}

function scheduleSymbolReferencePanelRefresh() {
  const ui = state.symbolRefs.ui;
  if (!ui.activePanel || !ui.activeSymbol) return;
  if (ui.refreshHandle) clearTimeout(ui.refreshHandle);
  ui.refreshHandle = setTimeout(() => {
    ui.refreshHandle = null;
    if (!ui.activePanel || !ui.activePanel.root?.isConnected || !ui.activeSymbol) return;
    ui.activePanel.loadContent(buildSymbolReferencePanelContent(ui.activeSymbol, ui.activeSourceFileId));
    ui.activePanel.bumpActivity();
    ui.renderedVersion = state.symbolRefs.indexVersion;
  }, SYMBOL_REFS_PANEL_REFRESH_DEBOUNCE_MS);
}

function getCaretOffsetWithinCode(code, event) {
  if (!code || !event) return null;
  const x = event.clientX;
  const y = event.clientY;
  let node = null;
  let offset = 0;

  if (typeof document.caretPositionFromPoint === "function") {
    const caret = document.caretPositionFromPoint(x, y);
    node = caret?.offsetNode || null;
    offset = caret?.offset || 0;
  } else if (typeof document.caretRangeFromPoint === "function") {
    const range = document.caretRangeFromPoint(x, y);
    node = range?.startContainer || null;
    offset = range?.startOffset || 0;
  }

  if (!node || !code.contains(node)) return null;
  try {
    const range = document.createRange();
    range.setStart(code, 0);
    range.setEnd(node, offset);
    return range.toString().length;
  } catch (err) {
    return null;
  }
}

function extractSymbolFromClick(event, code) {
  const selection = window.getSelection ? window.getSelection() : null;
  if (selection && !selection.isCollapsed) {
    const selected = isSingleIdentifierText(selection.toString(), {
      minLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH
    });
    if (!selected) return null;
    return selected;
  }

  const offset = getCaretOffsetWithinCode(code, event);
  if (!Number.isFinite(offset)) return null;
  const token = extractIdentifierAtOffset(code.textContent || "", offset, {
    minLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH
  });
  return token?.symbol || null;
}

function handleSymbolReferenceClick(event) {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.target?.closest?.(".pw-root")) return;
  if (event.target?.closest?.(".file-ref")) return;

  const code = event.target?.closest?.("pre code");
  if (!code || !els.fileContainer.contains(code)) return;
  const section = code.closest(".file-section");
  const sourceFileId = section?.dataset?.fileId || "";
  if (!sourceFileId) return;

  const symbol = extractSymbolFromClick(event, code);
  if (!symbol) return;
  openSymbolReferencePanel(event.target instanceof Element ? event.target : code, symbol, sourceFileId);
}

function syncSymbolReferenceFeatureEnabled() {
  state.symbolRefs.enabled = state.settings.symbolRefs !== false;
  if (!state.symbolRefs.enabled) {
    cancelSymbolReferenceBuild();
    cancelSymbolReferenceIncremental();
    destroySymbolReferencePanel();
    detachSymbolReferenceDelegates();
    state.symbolRefs.contributions.heuristicByFile.clear();
    state.symbolRefs.contributions.treeByFile.clear();
    state.symbolRefs.contributions.effectiveByFile.clear();
    state.symbolRefs.index = { bySymbol: new Map() };
    state.symbolRefs.build.ready = false;
    updateControlBar();
    return;
  }

  attachSymbolReferenceDelegates();
  if (state.phase === "loaded") scheduleSymbolReferenceBaselineBuild();
}

function attachReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.refsDelegatesAttached === "true") return;
  els.fileContainer.addEventListener("click", handleReferenceTokenClick);
  els.fileContainer.addEventListener("keydown", handleReferenceTokenKeydown);
  els.fileContainer.dataset.refsDelegatesAttached = "true";
}

function detachReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.refsDelegatesAttached !== "true") return;
  els.fileContainer.removeEventListener("click", handleReferenceTokenClick);
  els.fileContainer.removeEventListener("keydown", handleReferenceTokenKeydown);
  delete els.fileContainer.dataset.refsDelegatesAttached;
}

function destroyReferencePanel() {
  const win = state.refs.ui.activePanel;
  if (!win) return;
  state.refs.ui.activePanel = null;
  state.refs.ui.activeToken = null;
  win.destroy();
}

function teardownReferenceObserver() {
  if (!state.refs.refsObserver) return;
  state.refs.refsObserver.disconnect();
  state.refs.refsObserver = null;
}

function cancelReferenceIndexBuild() {
  const build = state.refs.build;
  build.runId += 1;
  build.running = false;
  build.partial = false;
  if (build.pendingHandle) {
    clearTimeout(build.pendingHandle);
    build.pendingHandle = null;
  }
}

function resetReferenceStateForLoad() {
  state.refs.enabled = state.settings.fileRefs !== false;
  cancelReferenceIndexBuild();
  teardownReferenceObserver();
  destroyReferencePanel();
  state.refs.inventory = { allPaths: new Set(), byBasename: new Map() };
  state.refs.pathToLoadedFileId = new Map();
  state.refs.index = { byTarget: new Map(), bySource: new Map() };
  state.refs.build.progress = { processed: 0, total: 0 };
  state.refs.decoratedFiles = new Set();
  state.refs.extSet = createRefExtensionSet(state.settings.allow);
  if (state.refs.enabled) attachReferenceDelegates();
  else detachReferenceDelegates();
}

function setReferenceDecorated(code, value) {
  if (!code) return;
  code.dataset.refsDecorated = value ? "true" : "false";
}

function markReferenceDecorationFailed(fileId) {
  if (!fileId) return;
  const section = getFileSection(fileId);
  const code = section?.querySelector?.("pre code");
  if (code) setReferenceDecorated(code, true);
  state.refs.decoratedFiles.add(fileId);
}

function clearReferenceDecorationsInCode(code) {
  if (!code) return;
  const spans = code.querySelectorAll("span.file-ref");
  spans.forEach(span => {
    const parent = span.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(span.textContent || ""), span);
  });
  code.normalize();
  setReferenceDecorated(code, false);
}

function clearAllReferenceDecorations() {
  const blocks = els.fileContainer ? els.fileContainer.querySelectorAll("pre code") : [];
  blocks.forEach(code => clearReferenceDecorationsInCode(code));
  state.refs.decoratedFiles.clear();
}

function rebuildPathToLoadedFileMap() {
  const map = new Map();
  state.files.forEach(file => {
    const canonical = normalizeProjectPath(file.path);
    if (canonical) map.set(canonical, file.id);
  });
  state.refs.pathToLoadedFileId = map;
}

function recordInventoryPathForRefs(path) {
  if (!path) return;
  recordInventoryPath(state.refs.inventory, path);
}

function ensureReferenceObserver() {
  if (state.refs.refsObserver || !state.refs.enabled) return;
  state.refs.refsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const section = entry.target;
      const fileId = section?.dataset?.fileId;
      if (!fileId) return;
      try {
        const done = decorateFileSectionReferences(fileId);
        if (done) state.refs.refsObserver.unobserve(section);
      } catch (err) {
        addLog("refs", `decorate error: ${err?.message || err}`);
        markReferenceDecorationFailed(fileId);
        state.refs.refsObserver.unobserve(section);
      }
    });
  }, { rootMargin: "200px 0px", threshold: 0 });
}

function observeReferenceSection(section) {
  if (!state.refs.enabled || !section) return;
  ensureReferenceObserver();
  if (!state.refs.refsObserver) return;
  state.refs.refsObserver.observe(section);
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  if (rect.bottom > 0 && rect.top < vh + 120) {
    try {
      decorateFileSectionReferences(section.dataset.fileId);
    } catch (err) {
      addLog("refs", `decorate error: ${err?.message || err}`);
      markReferenceDecorationFailed(section.dataset.fileId);
    }
  }
}

function observeAllReferenceSections() {
  if (!state.refs.enabled) return;
  const sections = els.fileContainer?.querySelectorAll?.(".file-section") || [];
  sections.forEach(section => observeReferenceSection(section));
}

function buildReferenceRangesForFile(file, occurrences) {
  if (!file || !occurrences?.length) return [];
  const lineOffsets = buildLineStartOffsets(file.text);
  const ranges = [];
  for (let i = 0; i < occurrences.length; i += 1) {
    const occ = occurrences[i];
    const lineIdx = occ.lineNumber - 1;
    if (lineIdx < 0 || lineIdx >= lineOffsets.length) continue;
    const base = lineOffsets[lineIdx] || 0;
    const start = base + occ.matchStart;
    const end = base + occ.matchEnd;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    ranges.push({ start, end, occurrence: occ });
  }
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const nonOverlapping = [];
  let lastEnd = -1;
  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    if (range.start < lastEnd) continue;
    nonOverlapping.push(range);
    lastEnd = range.end;
  }
  return nonOverlapping;
}

function collectTextNodesWithOffsets(code) {
  const nodes = [];
  const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  let cursor = 0;
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue && !(node.parentElement && node.parentElement.closest(".file-ref"))) {
      const length = node.nodeValue.length;
      nodes.push({ node, start: cursor, end: cursor + length });
      cursor += length;
    }
    node = walker.nextNode();
  }
  return nodes;
}

function wrapReferenceTextSegment(node, start, end, occurrence, sourceFileId) {
  if (!node || !node.parentNode) return;
  const currentLength = node.nodeValue.length;
  const safeStart = Math.max(0, Math.min(start, currentLength));
  const safeEnd = Math.max(safeStart, Math.min(end, currentLength));
  if (safeEnd <= safeStart) return;

  let target = node;
  if (safeStart > 0) target = node.splitText(safeStart);
  const length = safeEnd - safeStart;
  if (length < target.nodeValue.length) target.splitText(length);

  const span = document.createElement("span");
  span.className = "file-ref";
  span.textContent = target.nodeValue;
  span.tabIndex = 0;
  span.setAttribute("role", "button");
  span.dataset.sourceFileId = sourceFileId;
  span.dataset.refRaw = occurrence.raw || "";
  span.dataset.refNormalized = occurrence.normalized || "";
  span.dataset.refTargetKey = occurrence.targetKey || "";
  span.dataset.refStatus = occurrence.resolutionStatus || "missing";
  span.dataset.refResolvedPaths = JSON.stringify(occurrence.resolvedPaths || []);

  if (occurrence.resolutionStatus === "resolved") {
    span.title = occurrence.resolvedPaths?.length ? `In project: ${occurrence.resolvedPaths[0]}` : "In project";
  } else if (occurrence.resolutionStatus === "ambiguous") {
    span.title = "Multiple matches in project";
  } else {
    span.title = "Not found in project";
  }

  target.parentNode.replaceChild(span, target);
}

function decorateFileSectionReferences(fileId) {
  if (!state.refs.enabled || !fileId) return false;
  const section = getFileSection(fileId);
  if (!section) return false;
  const code = section.querySelector("pre code");
  if (!code) return false;
  if (code.dataset.refsDecorated === "true") return true;
  if (window.microlight && code.dataset.hasBeenHighlighted !== "true") {
    const waitCount = parseInt(code.dataset.refsWaitCount || "0", 10) + 1;
    code.dataset.refsWaitCount = String(waitCount);
    codeHighlighter.attemptHighlight(code, 0);
    if (waitCount < 4) return false;
  }
  if (state.refs.build.running && !state.refs.index.bySource.has(fileId)) return false;

  const file = state.files.find(item => item.id === fileId);
  if (!file) return false;
  const occurrences = state.refs.index.bySource.get(fileId) || [];
  if (!occurrences.length) {
    setReferenceDecorated(code, true);
    state.refs.decoratedFiles.add(fileId);
    return true;
  }

  const ranges = buildReferenceRangesForFile(file, occurrences);
  if (!ranges.length) {
    setReferenceDecorated(code, true);
    state.refs.decoratedFiles.add(fileId);
    return true;
  }

  const textNodes = collectTextNodesWithOffsets(code);
  if (!textNodes.length) return false;

  for (let i = ranges.length - 1; i >= 0; i -= 1) {
    const range = ranges[i];
    for (let j = textNodes.length - 1; j >= 0; j -= 1) {
      const entry = textNodes[j];
      if (entry.end <= range.start || entry.start >= range.end) continue;
      const localStart = Math.max(0, range.start - entry.start);
      const localEnd = Math.min(entry.end - entry.start, range.end - entry.start);
      wrapReferenceTextSegment(entry.node, localStart, localEnd, range.occurrence, fileId);
    }
  }

  setReferenceDecorated(code, true);
  delete code.dataset.refsWaitCount;
  state.refs.decoratedFiles.add(fileId);
  return true;
}

function updateReferenceTargetStatus(current, next) {
  if (!current) return next;
  if (current === next) return current;
  if (current === "ambiguous" || next === "ambiguous") return "ambiguous";
  if (current === "resolved" || next === "resolved") return "resolved";
  return "missing";
}

function pushReferenceOccurrence(file, lineNumber, candidate, resolution) {
  const sourceFileId = file.id;
  const sourcePath = normalizeProjectPath(file.path);
  const resolvedPaths = (resolution.resolvedPaths || []).slice(0, 10);
  const targetKey = resolution.status === "resolved" && resolvedPaths.length === 1
    ? resolvedPaths[0]
    : candidate.normalized;

  const occurrence = {
    sourceFileId,
    sourcePath,
    lineNumber,
    matchStart: candidate.start,
    matchEnd: candidate.end,
    raw: candidate.raw,
    normalized: candidate.normalized,
    targetKey,
    resolutionStatus: resolution.status,
    resolvedPaths
  };

  const bySource = state.refs.index.bySource;
  const sourceOccurrences = bySource.get(sourceFileId) || [];
  sourceOccurrences.push(occurrence);
  bySource.set(sourceFileId, sourceOccurrences);

  const byTarget = state.refs.index.byTarget;
  let target = byTarget.get(targetKey);
  if (!target) {
    target = {
      targetKey,
      status: resolution.status,
      resolvedPaths,
      occurrences: [],
      countsBySource: new Map(),
      firstLineBySource: new Map(),
      totalCount: 0
    };
    byTarget.set(targetKey, target);
  } else {
    target.status = updateReferenceTargetStatus(target.status, resolution.status);
    if ((!target.resolvedPaths || !target.resolvedPaths.length) && resolvedPaths.length) {
      target.resolvedPaths = resolvedPaths.slice();
    }
  }

  target.totalCount += 1;
  target.countsBySource.set(sourceFileId, (target.countsBySource.get(sourceFileId) || 0) + 1);
  if (!target.firstLineBySource.has(sourceFileId)) target.firstLineBySource.set(sourceFileId, lineNumber);
  if (target.occurrences.length < REFS_MAX_OCCURRENCES_PER_TARGET) {
    target.occurrences.push(occurrence);
  }
}

function runReferenceIndexSlice(run) {
  if (!state.refs.enabled) return;
  if (run.id !== state.refs.build.runId) return;
  const start = performance.now();
  try {
    while (run.fileIndex < run.files.length) {
      if (run.id !== state.refs.build.runId) return;
      const file = run.files[run.fileIndex];
      if (!run.lines) {
        run.lines = file.text.split("\n");
        run.sourcePath = normalizeProjectPath(file.path);
      }

      while (run.lineIndex < run.lines.length) {
        if (performance.now() - start > REFS_BUILD_SLICE_BUDGET) {
          state.refs.build.progress.processed = run.fileIndex;
          state.refs.build.pendingHandle = setTimeout(() => runReferenceIndexSlice(run), 0);
          return;
        }
        const lineText = run.lines[run.lineIndex];
        const lineNumber = run.lineIndex + 1;
        const candidates = extractReferenceCandidates(lineText, {
          refExts: state.refs.extSet,
          maxTokenLength: REFS_MAX_TOKEN_LENGTH,
          enableBareFilename: false
        });
        for (let i = 0; i < candidates.length; i += 1) {
          const candidate = candidates[i];
          const resolution = resolveReferenceCandidate({
            sourcePath: run.sourcePath,
            candidate: candidate.normalizedPathLike,
            inventory: state.refs.inventory
          });
          pushReferenceOccurrence(file, lineNumber, candidate, resolution);
        }
        run.lineIndex += 1;
      }

      run.fileIndex += 1;
      run.lineIndex = 0;
      run.lines = null;
      run.sourcePath = "";
      state.refs.build.progress.processed = run.fileIndex;
    }
  } catch (err) {
    addLog("refs", `index error: ${err?.message || err}`);
    state.refs.build.partial = true;
  } finally {
    if (run.fileIndex >= run.files.length && run.id === state.refs.build.runId) {
      state.refs.build.running = false;
      state.refs.build.pendingHandle = null;
      state.refs.build.progress.processed = run.files.length;
      observeAllReferenceSections();
    }
  }
}

function scheduleReferenceIndexBuild() {
  cancelReferenceIndexBuild();
  state.refs.index = { byTarget: new Map(), bySource: new Map() };
  state.refs.decoratedFiles.clear();
  if (!state.refs.enabled || state.phase !== "loaded") return;
  rebuildPathToLoadedFileMap();
  clearAllReferenceDecorations();
  const files = state.files.slice();
  state.refs.build.runId += 1;
  state.refs.build.running = true;
  state.refs.build.partial = false;
  state.refs.build.progress = { processed: 0, total: files.length };
  const run = {
    id: state.refs.build.runId,
    files,
    fileIndex: 0,
    lineIndex: 0,
    lines: null,
    sourcePath: ""
  };
  state.refs.build.pendingHandle = setTimeout(() => runReferenceIndexSlice(run), 0);
}

function syncReferenceFeatureEnabled() {
  state.refs.enabled = state.settings.fileRefs !== false;
  if (!state.refs.enabled) {
    cancelReferenceIndexBuild();
    teardownReferenceObserver();
    destroyReferencePanel();
    clearAllReferenceDecorations();
    detachReferenceDelegates();
    return;
  }
  attachReferenceDelegates();
  if (state.phase === "loaded") {
    state.refs.extSet = createRefExtensionSet(state.settings.allow);
    scheduleReferenceIndexBuild();
  }
}

function ensureReferencePanelWindow() {
  const existing = state.refs.ui.activePanel;
  if (existing && existing.root?.isConnected) return existing;
  const win = new PreviewWindow({
    width: 420,
    height: 340,
    minWidth: 280,
    minHeight: 180,
    destroyAfterMs: PREVIEW_INACTIVE_MS
  });
  win.onDestroy = () => {
    state.refs.ui.activePanel = null;
    state.refs.ui.activeToken = null;
  };
  state.refs.ui.activePanel = win;
  return win;
}

function parseRefTokenDataset(el) {
  if (!el) return null;
  let resolvedPaths = [];
  try {
    resolvedPaths = JSON.parse(el.dataset.refResolvedPaths || "[]");
  } catch (err) {
    resolvedPaths = [];
  }
  return {
    raw: el.dataset.refRaw || "",
    normalized: el.dataset.refNormalized || "",
    targetKey: el.dataset.refTargetKey || "",
    status: el.dataset.refStatus || "missing",
    resolvedPaths
  };
}

function openResolvedReferencePath(path) {
  if (!path) return false;
  const fileId = state.refs.pathToLoadedFileId.get(path);
  if (!fileId) return false;
  location.hash = `#${fileId}`;
  setActiveFile(fileId);
  return true;
}

function buildReferencePanelContent(tokenData, sourceFileId) {
  const container = document.createElement("div");
  container.className = "ref-panel";

  const title = document.createElement("div");
  title.className = "ref-panel-title";
  const titleCode = document.createElement("code");
  titleCode.textContent = tokenData.raw || tokenData.normalized;
  title.appendChild(titleCode);
  container.appendChild(title);

  const entry = state.refs.index.byTarget.get(tokenData.targetKey);
  const resolvedPaths = tokenData.resolvedPaths?.length
    ? tokenData.resolvedPaths
    : (entry?.resolvedPaths || []);
  const effectiveStatus = tokenData.status || entry?.status || "missing";

  const status = document.createElement("div");
  status.className = "ref-panel-status";
  if (effectiveStatus === "resolved") {
    const primaryPath = resolvedPaths[0] || tokenData.normalized;
    const loaded = primaryPath && state.refs.pathToLoadedFileId.has(primaryPath);
    status.textContent = loaded ? `In project: ${primaryPath}` : `Exists but not loaded: ${primaryPath}`;
  } else if (effectiveStatus === "ambiguous") {
    status.textContent = `Multiple matches (${resolvedPaths.length})`;
  } else {
    status.textContent = "Not found in project";
  }
  container.appendChild(status);

  const actions = document.createElement("div");
  actions.className = "ref-panel-actions";
  const primaryPath = resolvedPaths.length === 1 ? resolvedPaths[0] : "";
  const primaryFileId = primaryPath ? state.refs.pathToLoadedFileId.get(primaryPath) : "";
  if (primaryFileId) {
    const openBtn = document.createElement("button");
    openBtn.className = "primary tiny";
    openBtn.type = "button";
    setButtonLabel(openBtn, "🔗", "Open");
    openBtn.addEventListener("click", () => {
      location.hash = `#${primaryFileId}`;
      setActiveFile(primaryFileId);
    });
    actions.appendChild(openBtn);
  }

  const copyBtn = document.createElement("button");
  copyBtn.className = "secondary tiny";
  copyBtn.type = "button";
  setButtonLabel(copyBtn, "📋", "Copy path");
  copyBtn.addEventListener("click", () => {
    const value = primaryPath || tokenData.normalized || tokenData.raw;
    copyTextToClipboard(value);
  });
  actions.appendChild(copyBtn);

  const refsBtn = document.createElement("button");
  refsBtn.className = "ghost tiny";
  refsBtn.type = "button";
  setButtonLabel(refsBtn, "📎", "Show references");
  actions.appendChild(refsBtn);

  container.appendChild(actions);

  if (effectiveStatus === "ambiguous" && resolvedPaths.length) {
    const ambTitle = document.createElement("div");
    ambTitle.className = "ref-panel-meta";
    ambTitle.textContent = "Possible matches";
    container.appendChild(ambTitle);
    const ambList = document.createElement("div");
    ambList.className = "ref-panel-list";
    resolvedPaths.forEach(path => {
      const row = document.createElement("div");
      row.className = "ref-panel-row";
      const pathEl = document.createElement("div");
      pathEl.className = "ref-panel-path";
      pathEl.textContent = path;
      row.appendChild(pathEl);
      const rowActions = document.createElement("div");
      rowActions.className = "ref-panel-actions";
      if (state.refs.pathToLoadedFileId.has(path)) {
        const open = document.createElement("button");
        open.className = "primary tiny";
        open.type = "button";
        setButtonLabel(open, "🔗", "Open");
        open.addEventListener("click", () => openResolvedReferencePath(path));
        rowActions.appendChild(open);
      }
      const copy = document.createElement("button");
      copy.className = "secondary tiny";
      copy.type = "button";
      setButtonLabel(copy, "📋", "Copy");
      copy.addEventListener("click", () => copyTextToClipboard(path));
      rowActions.appendChild(copy);
      row.appendChild(rowActions);
      ambList.appendChild(row);
    });
    container.appendChild(ambList);
  }

  const refsTitle = document.createElement("div");
  refsTitle.className = "ref-panel-meta";
  refsTitle.textContent = "Referenced by";
  container.appendChild(refsTitle);

  const refsList = document.createElement("div");
  refsList.className = "ref-panel-list";
  refsBtn.addEventListener("click", () => refsList.scrollIntoView({ behavior: "smooth", block: "nearest" }));

  const countsMap = entry?.countsBySource || new Map();
  const rows = [...countsMap.entries()]
    .map(([fileId, count]) => {
      const file = state.files.find(item => item.id === fileId);
      const line = entry?.firstLineBySource?.get(fileId) || 1;
      return { fileId, count, line, path: file?.path || fileId };
    })
    .filter(row => row.fileId !== sourceFileId)
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "ref-panel-meta";
    empty.textContent = "No other references in loaded text files.";
    refsList.appendChild(empty);
  } else {
    const visibleRows = rows.slice(0, REFS_MAX_REFERENCING_FILES_SHOWN);
    visibleRows.forEach(row => {
      const entryRow = document.createElement("button");
      entryRow.className = "ref-panel-row";
      entryRow.type = "button";
      const path = document.createElement("div");
      path.className = "ref-panel-path";
      path.textContent = row.path;
      const meta = document.createElement("div");
      meta.className = "ref-panel-meta";
      meta.textContent = `${row.count} mention${row.count === 1 ? "" : "s"} • line ${row.line}`;
      entryRow.appendChild(path);
      entryRow.appendChild(meta);
      entryRow.addEventListener("click", () => navigateToFileLine(row.fileId, row.line));
      refsList.appendChild(entryRow);
    });
    if (rows.length > REFS_MAX_REFERENCING_FILES_SHOWN) {
      const more = document.createElement("div");
      more.className = "ref-panel-meta";
      more.textContent = `and ${rows.length - REFS_MAX_REFERENCING_FILES_SHOWN} more`;
      refsList.appendChild(more);
    }
  }

  container.appendChild(refsList);
  return container;
}

function openReferencePanel(anchorEl, tokenData, sourceFileId) {
  if (!state.refs.enabled || !anchorEl || !tokenData) return;
  const win = ensureReferencePanelWindow();
  win.setTitle("File reference");
  win.loadContent(buildReferencePanelContent(tokenData, sourceFileId));
  win.positionWindowNearElement(anchorEl, { resizeToFit: false, preferRight: true });
  win.bumpActivity();
  state.refs.ui.activeToken = tokenData;
  state.refs.ui.lastOpenAt = Date.now();
}

function handleReferenceTokenClick(event) {
  if (!state.refs.enabled) return;
  const token = event.target?.closest?.(".file-ref");
  if (!token || !els.fileContainer.contains(token)) return;
  event.preventDefault();
  event.stopPropagation();
  const section = token.closest(".file-section");
  const sourceFileId = section?.dataset?.fileId || token.dataset.sourceFileId || "";
  openReferencePanel(token, parseRefTokenDataset(token), sourceFileId);
}

function handleReferenceTokenKeydown(event) {
  if (!state.refs.enabled) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  const token = event.target?.closest?.(".file-ref");
  if (!token || !els.fileContainer.contains(token)) return;
  event.preventDefault();
  const section = token.closest(".file-section");
  const sourceFileId = section?.dataset?.fileId || token.dataset.sourceFileId || "";
  openReferencePanel(token, parseRefTokenDataset(token), sourceFileId);
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
  state.treeSitter.cache = {};
  state.treeSitter.markers = {};
  state.treeSitter.pendingFileId = null;
  state.treeSitter.parsing = false;
  state.treeSitter.error = null;
  state.progress = {
    dirsVisited: 0,
    filesIncluded: 0,
    filesRead: 0,
    skipped: 0,
    errors: 0,
    bytesRead: 0,
    linesRead: 0,
    currentPath: "",
    phaseLabel: "Idle"
  };
  state.aggregate = {
    loadedFiles: 0,
    skippedFiles: 0,
    totalBytes: 0,
    totalLines: 0,
    languages: {},
    largest: []
  };
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

function updateControlBar() {
  const p = state.progress;
  const a = state.aggregate;
  if (state.phase === "empty") {
    els.controlStatus.textContent = "Ready";
    els.controlStatus.title = "";
    els.controlActions.classList.add("hidden");
    els.activeIndicator.textContent = "Active: none";
  } else if (state.phase === "loading") {
    const phaseLabel = state.cancelled ? "Cancelling" : (state.progress.phaseLabel || "Scanning");
    const text = `${phaseLabel} • dirs ${p.dirsVisited} • files included ${p.filesIncluded} • read ${p.filesRead} • skipped ${p.skipped} • errors ${p.errors} • bytes ${formatBytes(p.bytesRead)} • lines ${p.linesRead}`;
    els.controlStatus.textContent = text;
    els.controlStatus.title = `${p.bytesRead} bytes read`;
    els.controlActions.classList.remove("hidden");
    els.activeIndicator.textContent = "Active: loading…";
  } else {
    const indexingText = getSymbolReferenceStatusText();
    const text = indexingText || `Summary • files ${a.loadedFiles} • lines ${a.totalLines} • bytes ${formatBytes(a.totalBytes)} • skipped ${a.skippedFiles} • errors ${state.progress.errors}`;
    els.controlStatus.textContent = text;
    els.controlStatus.title = indexingText ? "Building project-wide symbol index" : `${a.totalBytes} bytes loaded`;
    els.controlActions.classList.remove("hidden");
    const activeFile = state.files.find(f => f.id === state.activeFileId);
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
    els.treeBtn.classList.toggle("active", state.treeSitter.window.open || state.treeSitter.window.minimized);
  }
  if (els.previewToggle) {
    els.previewToggle.disabled = !hasFiles;
    els.previewToggle.classList.toggle("active", state.preview.enabled);
    els.previewToggle.setAttribute("aria-pressed", state.preview.enabled ? "true" : "false");
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

  updateOffsets();
  updateSearchAvailability();
}

function updateSidebarVisibility() {
  const shouldShow = state.phase !== "empty";
  els.sidebar.classList.toggle("hidden", !shouldShow);
  els.sidebarEdge.classList.toggle("hidden", !shouldShow);
}

function updateEmptyOverlay() {
  const isEmpty = state.phase === "empty";
  els.emptyPanel.classList.toggle("hidden", !isEmpty);
  els.main.classList.toggle("inactive", isEmpty);
}

function updateOffsets() {
  const topHeight = els.topbar?.getBoundingClientRect().height || 0;
  const controlHeight = els.controlBar?.getBoundingClientRect().height || 0;
  document.documentElement.style.setProperty("--control-offset", `${topHeight}px`);
  document.documentElement.style.setProperty("--stack-offset", `${topHeight + controlHeight}px`);
}

function updateSidebarPinLabel() {
  const pinned = state.sidebar.pinned;
  setButtonLabel(els.sidebarPin, pinned ? "📌" : "📍", pinned ? "Unpin" : "Pin");
}

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
  if (els.tsParse) setButtonLabel(els.tsParse, "🧠", "Parse");
  if (els.tsChip) els.tsChip.textContent = "🌳 Tree-sitter";
}

function showEmptySupportMessage() {
  const target = document.getElementById("empty-support");
  if (state.support.directoryPicker) {
    target.classList.add("hidden");
    target.textContent = "";
  } else {
    target.classList.remove("hidden");
    target.textContent = "Folder picker not supported in this browser. Use file picker.";
    els.emptyFallback.focus();
  }
}

function hideBanner() {
  els.statusBanner.classList.add("hidden");
  els.statusBanner.textContent = "";
  delete els.statusBanner.dataset.kind;
}

function showBanner(text, kind = "info") {
  els.statusBanner.dataset.kind = kind;
  els.statusBanner.classList.remove("hidden");
  els.statusBanner.textContent = text;
}

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

function shouldIgnore(name) {
  const lower = name.toLowerCase();
  return state.settings.ignores.some(x => x.trim().toLowerCase() === lower);
}

function pathHasIgnoredSegment(path) {
  const parts = path.split(/[\\/]/);
  return parts.some(part => shouldIgnore(part));
}

function isAllowedFile(path, size) {
  const parts = path.split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
  if (!ext) return { allowed: false, reason: "no-extension" };
  if (ext === "json" && !state.settings.includeJson) return { allowed: false, reason: "json-off" };
  const allowSet = new Set(state.settings.allow.map(a => a.toLowerCase()).concat(state.settings.includeJson ? ["json"] : []));
  if (!allowSet.has(ext)) return { allowed: false, reason: "filtered" };
  if (size > state.settings.maxFileSize) return { allowed: false, reason: "too-large" };
  return { allowed: true, ext };
}

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
  const charCount = text.length;
  const lineCount = countLines(text);
  const ext = extHint || (path.split(".").pop() || "");
  const language = languageFromExt(ext);
  const id = makeFileId(path);
  const record = {
    id,
    path,
    segments: path.split(/[\\/]/),
    ext,
    size: file.size,
    modified: file.lastModified ? new Date(file.lastModified) : null,
    text,
    language,
    lineCount,
    charCount,
    status: "loaded"
  };
  state.files.push(record);
  state.progress.filesRead += 1;
  state.progress.bytesRead += file.size;
  state.progress.linesRead += lineCount;
  state.aggregate.loadedFiles += 1;
  state.aggregate.totalBytes += file.size;
  state.aggregate.totalLines += lineCount;
  state.aggregate.languages[language] = (state.aggregate.languages[language] || 0) + lineCount;
  updateLargest(record);
  renderFileSection(record);
  insertIntoTree(record);
  scheduleTocRender();
  updateControlBar();
  maybeWarnMemory();
  state.progress.phaseLabel = "Scanning";
}

function updateLargest(file) {
  state.aggregate.largest.push(file);
  state.aggregate.largest.sort((a, b) => b.size - a.size);
  state.aggregate.largest = state.aggregate.largest.slice(0, 8);
}

function formatLineNumberParts(lineNumber) {
  const value = Math.max(0, Number.isFinite(lineNumber) ? Math.floor(lineNumber) : 0);
  const formatted = value.toLocaleString("en-US", {
    useGrouping: true,
    minimumIntegerDigits: 5
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
    significant: formatted.slice(firstSignificantDigit)
  };
}

function buildLineNumberGutter(lineCount) {
  const safeCount = Math.max(0, Number.isFinite(lineCount) ? Math.floor(lineCount) : 0);
  const gutter = document.createElement("div");
  gutter.className = "line-gutter";
  gutter.setAttribute("aria-hidden", "true");
  const fragment = document.createDocumentFragment();
  for (let line = 1; line <= safeCount; line += 1) {
    const row = document.createElement("div");
    row.className = "line-gutter-row";
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

function insertIntoTree(file) {
  let node = state.tree;
  const parts = file.segments;
  for (let i = 0; i < parts.length; i++) {
    const name = parts[i];
    const isLast = i === parts.length - 1;
    if (isLast) {
      node.children.push({ name, type: "file", fileId: file.id, path: file.path });
    } else {
      let next = node.children.find(child => child.type === "dir" && child.name === name);
      if (!next) {
        next = { name, type: "dir", children: [], expanded: false, path: node.path ? `${node.path}/${name}` : name };
        node.children.push(next);
      }
      node = next;
    }
  }
  sortTree(state.tree);
  renderDirectoryTree();
}

function sortTree(node) {
  if (!node.children) return;
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}

function renderDirectoryTree() {
  els.treeContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();
  let index = 0;
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
      const isActive = !isHidden && (node.fileId === state.activeFileId || node.fileId === currentHash);
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
      node.children.forEach(child => renderNode(child, depth + 1));
    }
  }
  state.tree.children.forEach(child => renderNode(child, 0));
  els.treeContainer.appendChild(fragment);
  const hasNodes = state.tree.children.length > 0;
  els.treePlaceholder.textContent = state.phase === "loading" ? "Loading project..." : "No files loaded";
  els.treePlaceholder.classList.toggle("hidden", hasNodes);
}

function handleTreeClick(node) {
  if (node.type !== "dir") return;
  node.expanded = !node.expanded;
  renderDirectoryTree();
}

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
  copyPathBtn.addEventListener("click", e => {
    e.stopPropagation();
    navigator.clipboard?.writeText(file.path);
  });
  const copySourceBtn = document.createElement("button");
  copySourceBtn.className = "ghost tiny";
  setButtonLabel(copySourceBtn, "📋", "Copy source");
  copySourceBtn.addEventListener("click", e => {
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
  code.textContent = file.text;
  pre.appendChild(gutter);
  pre.appendChild(code);
  if (!state.settings.wrap) pre.classList.add("nowrap");

  summary.appendChild(header);
  section.appendChild(summary);
  section.appendChild(pre);
  els.fileContainer.appendChild(section);
  const target = parseHashValue(location.hash);
  if (target.fileId === file.id) {
    section.open = true;
    if (target.line) {
      scrollToApproxLine(file.id, target.line, "auto");
    } else {
      section.scrollIntoView({ behavior: "auto", block: "start" });
      setActiveFile(file.id);
    }
  }
  attachObserver(section);
}

function attachObserver(section) {
  if (!observer) {
    observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length === 0) return;
      const fileId = visible[0].target.dataset.fileId;
      setActiveFile(fileId);
    }, { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
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

function observeHighlightBlock(code) {
  codeHighlighter.observe(code);
}

function setActiveFile(fileId) {
  if (!fileId || state.activeFileId === fileId) return;
  if (isFileHidden(fileId)) return;
  state.activeFileId = fileId;
  renderDirectoryTree();
  const file = state.files.find(f => f.id === fileId);
  if (file) {
    els.activeIndicator.innerHTML = `<span>Active:</span> <span class="value" title="${file.path}">${file.path}</span>`;
    updateActiveLine();
    const section = getFileSection(fileId);
    if (section && section.tagName === "DETAILS") section.open = true;
  }
  handleActiveFileChange();
}

function updateActiveLine() {
  const fileId = state.activeFileId;
  if (!fileId) return;
  const section = getFileSection(fileId);
  if (!section) return;
  if (section.classList.contains("is-hidden")) return;
  const pre = section.querySelector("pre");
  if (!pre) return;
  const rect = pre.getBoundingClientRect();
  const scrollTop = Math.max(0, -rect.top);
  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  const approxLine = Math.max(1, Math.round(scrollTop / lineHeight) + 1);
  const path = section.querySelector(".file-path")?.textContent || fileId;
  els.activeIndicator.innerHTML = `<span>Active:</span> <span class="value" title="${path}">${path}</span><span>Line ${approxLine}</span>`;
}

function handleHashChange() {
  const target = parseHashValue(location.hash);
  const targetId = target.fileId;
  if (!targetId) return;
  if (isFileHidden(targetId)) ensureFileVisible(targetId);
  const section = document.getElementById(targetId);
  if (!section) return;
  if (target.line) {
    scrollToApproxLine(targetId, target.line);
    return;
  }
  section.scrollIntoView({ behavior: "auto", block: "start" });
  setActiveFile(section.dataset.fileId);
}

function maybeWarnMemory() {
  if (!state.settings.showStats) return;
  if (state.aggregate.totalBytes > state.settings.memoryWarnBytes) {
    showBanner(`Loaded ${formatBytes(state.aggregate.totalBytes)} which exceeds the warning threshold. Consider cancelling if performance drops.`, "stats");
  }
}

function finishLoad() {
  state.scanning = false;
  els.cancelLoad.disabled = true;
  if (state.cancelled) {
    state.phase = "cancelled";
    showBanner(`Loading cancelled. ${state.aggregate.loadedFiles} files loaded.`);
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
      scheduleSymbolReferenceBaselineBuild();
    }
  } else {
    cancelReferenceIndexBuild();
    cancelSymbolReferenceBuild();
    cancelSymbolReferenceIncremental();
  }
  updateControlBar();
  state.treeSitter.wantInit = true;
  maybeInitTreeSitterRuntime();
  maybeAutoParseActiveFile();
  scheduleTocRender();
}

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

function closePanels() {
  closeSettings();
  closeStatsPanel();
  closeLogPanel();
  closeSupportPanel();
  destroyReferencePanel();
  destroySymbolReferencePanel();
}

function openSettings() {
  els.settingsPanel.classList.remove("hidden");
  els.settingsPanel.setAttribute("aria-hidden", "false");
  els.ignoreList.value = state.settings.ignores.join("\n");
  els.allowList.value = state.settings.allow.join("\n");
  els.jsonToggle.checked = state.settings.includeJson;
  els.maxSize.value = Math.round(state.settings.maxFileSize / 1024);
  els.memoryLimit.value = Math.round(state.settings.memoryWarnBytes / (1024 * 1024));
  els.wrapToggle.checked = state.settings.wrap;
  els.statsDisplay.checked = state.settings.showStats;
  if (els.fileRefsToggle) els.fileRefsToggle.checked = state.settings.fileRefs !== false;
  if (els.symbolRefsToggle) els.symbolRefsToggle.checked = state.settings.symbolRefs !== false;
}

function closeSettings() {
  els.settingsPanel.classList.add("hidden");
  els.settingsPanel.setAttribute("aria-hidden", "true");
}

function saveSettingsFromForm() {
  state.settings.ignores = els.ignoreList.value.split("\n").map(v => v.trim()).filter(Boolean);
  state.settings.allow = els.allowList.value.split("\n").map(v => v.trim()).filter(Boolean);
  state.settings.includeJson = els.jsonToggle.checked;
  state.settings.maxFileSize = Math.max(1, parseInt(els.maxSize.value || "1024", 10)) * 1024;
  state.settings.memoryWarnBytes = Math.max(1, parseInt(els.memoryLimit.value || "50", 10)) * 1024 * 1024;
  state.settings.wrap = els.wrapToggle.checked;
  state.settings.showStats = els.statsDisplay.checked;
  state.settings.fileRefs = els.fileRefsToggle ? els.fileRefsToggle.checked : true;
  state.settings.symbolRefs = els.symbolRefsToggle ? els.symbolRefsToggle.checked : true;
  saveSettings();
  syncReferenceFeatureEnabled();
  syncSymbolReferenceFeatureEnabled();
  applyDisplaySettings();
  closeSettings();
}

function applyDisplaySettings() {
  const pres = document.querySelectorAll("pre");
  pres.forEach(pre => pre.classList.toggle("nowrap", !state.settings.wrap));
}

function openStatsPanel() {
  if (state.aggregate.loadedFiles === 0) return;
  els.statsPanel.classList.remove("hidden");
  els.statsPanel.setAttribute("aria-hidden", "false");
  renderStatsPanel();
}

function renderStatsPanel() {
  const body = els.statsBody;
  body.innerHTML = "";
  const langEntries = Object.entries(state.aggregate.languages).sort((a, b) => b[1] - a[1]);
  const langBlock = document.createElement("div");
  const langTitle = document.createElement("h3");
  langTitle.textContent = "Top languages";
  langBlock.appendChild(langTitle);
  if (!langEntries.length) {
    const row = document.createElement("div");
    row.textContent = "No data";
    langBlock.appendChild(row);
  } else {
    langEntries.slice(0, 8).forEach(([lang, lines]) => {
      const row = document.createElement("div");
      row.textContent = `${lang}: ${lines} lines`;
      langBlock.appendChild(row);
    });
  }

  const largestBlock = document.createElement("div");
  const largestTitle = document.createElement("h3");
  largestTitle.textContent = "Largest files";
  largestBlock.appendChild(largestTitle);
  if (!state.aggregate.largest.length) {
    const row = document.createElement("div");
    row.textContent = "No data";
    largestBlock.appendChild(row);
  } else {
    state.aggregate.largest.forEach(f => {
      const row = document.createElement("div");
      row.textContent = `${f.path} — ${formatBytes(f.size)} • ${f.lineCount} lines`;
      row.title = f.path;
      largestBlock.appendChild(row);
    });
  }

  body.appendChild(langBlock);
  body.appendChild(largestBlock);
}

function closeStatsPanel() {
  els.statsPanel.classList.add("hidden");
  els.statsPanel.setAttribute("aria-hidden", "true");
}

function openLogPanel() {
  if (!state.logs.length) return;
  els.logPanel.classList.remove("hidden");
  els.logPanel.setAttribute("aria-hidden", "false");
  els.logBody.textContent = state.logs.map(log => `${log.time} • ${log.path} • ${log.reason}`).join("\n") || "No entries.";
}

function closeLogPanel() {
  els.logPanel.classList.add("hidden");
  els.logPanel.setAttribute("aria-hidden", "true");
}

function openSupportPanel() {
  els.supportPanel.classList.remove("hidden");
  els.supportPanel.setAttribute("aria-hidden", "false");
}

function closeSupportPanel() {
  els.supportPanel.classList.add("hidden");
  els.supportPanel.setAttribute("aria-hidden", "true");
}

function addLog(path, reason) {
  state.logs.push({ path, reason, time: new Date().toISOString() });
  if (els.controlStatus) updateControlBar();
}

function setupSidebarResize() {
  let startX = 0;
  let startWidth = state.sidebar.width;
  const move = e => {
    const dx = e.clientX - startX;
    let newWidth = Math.min(520, Math.max(220, startWidth + dx));
    state.sidebar.width = newWidth;
    document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`);
  };
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  els.sidebarResize.addEventListener("mousedown", e => {
    startX = e.clientX;
    startWidth = state.sidebar.width;
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  });
}

function toggleSidebarPin() {
  state.sidebar.pinned = !state.sidebar.pinned;
  els.sidebar.classList.toggle("unpinned", !state.sidebar.pinned);
  els.sidebar.classList.toggle("pinned", state.sidebar.pinned);
  updateSidebarPinLabel();
}

function openSidebarOverlay() {
  if (state.sidebar.pinned) return;
  clearTimeout(state.sidebar.collapseTimer);
  state.sidebar.overlay = true;
  els.sidebar.classList.add("overlay-open");
}

function collapseSidebarOverlay() {
  if (state.sidebar.pinned) return;
  state.sidebar.collapseTimer = setTimeout(() => {
    state.sidebar.overlay = false;
    els.sidebar.classList.remove("overlay-open");
  }, 220);
}

function handleTreeKeydown(e) {
  const items = Array.from(els.treeContainer.querySelectorAll(".tree-item:not(.is-hidden)"));
  if (!items.length) return;
  const active = document.activeElement.classList.contains("tree-item") ? items.indexOf(document.activeElement) : 0;
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
    const nodeId = document.activeElement?.dataset?.fileId || document.activeElement?.dataset?.nodeId;
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

function handleFileInput(evt) {
  const files = Array.from(evt.target.files || []);
  if (!files.length) return;
  loadFromFileList(files);
}

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

function cancelLoad() {
  state.cancelled = true;
  els.cancelLoad.disabled = true;
  updateControlBar();
  showBanner("Cancelling…");
}

function applyWrapToggle() {
  state.settings.wrap = els.wrapToggle.checked;
  saveSettings();
  applyDisplaySettings();
}

function applyStatsToggle() {
  state.settings.showStats = els.statsDisplay.checked;
  saveSettings();
  if (!state.settings.showStats && els.statusBanner.dataset.kind === "stats") hideBanner();
}

function applyFileRefsToggle() {
  state.settings.fileRefs = !!els.fileRefsToggle?.checked;
  saveSettings();
  syncReferenceFeatureEnabled();
}

function applySymbolRefsToggle() {
  state.settings.symbolRefs = !!els.symbolRefsToggle?.checked;
  saveSettings();
  syncSymbolReferenceFeatureEnabled();
}

// Tree-sitter integration
function clampTreeSitterWindow(win) {
  const margin = 12;
  const minW = 260;
  const maxW = Math.max(minW, Math.min(560, window.innerWidth - margin * 2));
  const minH = 220;
  const maxH = Math.max(minH, Math.min(820, window.innerHeight - margin * 2));
  const width = Math.min(Math.max(win.w || 360, minW), maxW);
  const height = Math.min(Math.max(win.h || 420, minH), maxH);
  const x = Math.min(Math.max(win.x ?? (window.innerWidth - width - margin), margin), Math.max(margin, window.innerWidth - width - margin));
  const y = Math.min(Math.max(win.y ?? Math.max(80, window.innerHeight * 0.2), margin), Math.max(margin, window.innerHeight - height - margin));
  const chipY = Math.min(Math.max(win.chipY ?? (window.innerHeight / 2 - 30), 60), Math.max(60, window.innerHeight - 160));
  return { ...win, x, y, w: width, h: height, chipY };
}

function updateTreeSitterPlacement() {
  if (!els.tsWindow || !els.tsChip) return;
  const win = clampTreeSitterWindow(state.treeSitter.window);
  state.treeSitter.window = win;
  if (win.open && !win.minimized) {
    els.tsWindow.style.left = `${win.x}px`;
    els.tsWindow.style.top = `${win.y}px`;
    els.tsWindow.style.width = `${win.w}px`;
    els.tsWindow.style.height = `${win.h}px`;
  }
  if (win.open && win.minimized) {
    els.tsChip.style.top = `${win.chipY}px`;
  }
  saveTreeSitterState();
}

function updateTreeSitterWindowUI() {
  if (!els.tsWindow || !els.tsChip) return;
  const { window: win } = state.treeSitter;
  els.tsWindow.classList.toggle("hidden", !win.open || win.minimized);
  els.tsChip.classList.toggle("hidden", !(win.open && win.minimized));
  updateTreeSitterPlacement();
  renderTreeSitterPanel();
}

function handleTreeButtonClick() {
  const win = state.treeSitter.window;
  if (!win.open && !win.minimized) {
    openTreeSitterWindow();
  } else if (win.open && !win.minimized) {
    minimizeTreeSitterWindow();
  } else {
    restoreTreeSitterWindow();
  }
}

function openTreeSitterWindow() {
  state.treeSitter.window.open = true;
  state.treeSitter.window.minimized = false;
  state.treeSitter.wantInit = true;
  updateTreeSitterWindowUI();
  updateControlBar();
  maybeInitTreeSitterRuntime();
  maybeAutoParseActiveFile();
}

function closeTreeSitterWindow() {
  state.treeSitter.window.open = false;
  state.treeSitter.window.minimized = false;
  cancelPendingTreeSitterParse();
  updateTreeSitterWindowUI();
  updateControlBar();
}

function minimizeTreeSitterWindow() {
  state.treeSitter.window.minimized = true;
  state.treeSitter.window.open = true;
  cancelPendingTreeSitterParse();
  updateTreeSitterWindowUI();
  updateControlBar();
}

function restoreTreeSitterWindow() {
  state.treeSitter.window.minimized = false;
  state.treeSitter.window.open = true;
  updateTreeSitterWindowUI();
  updateControlBar();
  maybeInitTreeSitterRuntime();
  maybeAutoParseActiveFile();
}

function handleTreeSitterDrag(e) {
  if (e.target.closest(".ts-controls")) return;
  const startX = e.clientX;
  const startY = e.clientY;
  const win = { ...state.treeSitter.window };
  const move = evt => {
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    state.treeSitter.window.x = win.x + dx;
    state.treeSitter.window.y = win.y + dy;
    updateTreeSitterPlacement();
  };
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
}

function handleTreeSitterResize(e) {
  e.stopPropagation();
  const startX = e.clientX;
  const startY = e.clientY;
  const win = { ...state.treeSitter.window };
  const move = evt => {
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    state.treeSitter.window.w = win.w + dx;
    state.treeSitter.window.h = win.h + dy;
    updateTreeSitterPlacement();
  };
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
}

function handleChipDrag(e) {
  const startY = e.clientY;
  const startTop = state.treeSitter.window.chipY || 0;
  const move = evt => {
    const dy = evt.clientY - startY;
    state.treeSitter.window.chipY = startTop + dy;
    updateTreeSitterPlacement();
  };
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
}

function handleViewportResize() {
  updateTreeSitterPlacement();
}

async function maybeInitTreeSitterRuntime() {
  const ts = state.treeSitter;
  if (!ts.enabled || ts.ready || ts.loading || !ts.wantInit) return;
  if (state.phase !== "loaded") return;
  ts.loading = true;
  ts.error = null;
  renderTreeSitterPanel("Loading Tree-sitter…");
  try {
    const mod = await import(`./${TREE_SITTER_ASSET_BASE}/web-tree-sitter.js`);
    ts.Parser = mod.Parser;
    ts.Language = mod.Language;
    await ts.Parser.init({ locateFile: () => `${TREE_SITTER_ASSET_BASE}/web-tree-sitter.wasm` });
    ts.parser = new ts.Parser();
    ts.ready = true;
  } catch (err) {
    ts.error = err?.message || "Tree-sitter failed to load.";
    addLog("tree-sitter", `error: ${ts.error}`);
  } finally {
    ts.loading = false;
    renderTreeSitterPanel();
  }
}

async function loadTreeSitterLanguage(kind) {
  const ts = state.treeSitter;
  if (!ts.ready || !ts.Language) return null;
  if (ts.languages[kind]) return ts.languages[kind];
  const config = TREE_SITTER_LANGUAGES[kind];
  if (!config?.file) return null;
  try {
    const lang = await ts.Language.load(`${TREE_SITTER_ASSET_BASE}/${config.file}`);
    ts.error = null;
    ts.languages[kind] = lang;
    return lang;
  } catch (err) {
    ts.error = `${kind} grammar missing`;
    addLog("tree-sitter", `error: ${ts.error}`);
    renderTreeSitterPanel();
    return null;
  }
}

function cancelPendingTreeSitterParse() {
  const ts = state.treeSitter;
  if (ts.parseHandle && ts.parseHandleType === "idle" && typeof cancelIdleCallback === "function") {
    cancelIdleCallback(ts.parseHandle);
  }
  if (ts.parseHandle && ts.parseHandleType === "timeout") {
    clearTimeout(ts.parseHandle);
  }
  ts.parseHandle = null;
  ts.parseHandleType = null;
  ts.pendingFileId = null;
  ts.parsing = false;
}

function handleActiveFileChange() {
  updateTreeSitterSubtitle();
  maybeAutoParseActiveFile();
}

function updateTreeSitterSubtitle() {
  if (!els.tsSubtitle) return;
  const file = state.files.find(f => f.id === state.activeFileId);
  const text = file ? file.path : "No active file";
  els.tsSubtitle.textContent = text;
  els.tsSubtitle.title = text;
}

function getTreeSitterLanguage(file) {
  if (!file) return null;
  const lower = file.path.toLowerCase();
  if (lower.endsWith(".c")) return "c";
  if (lower.endsWith(".cc") || lower.endsWith(".cpp") || lower.endsWith(".hpp")) return "cpp";
  if (lower.endsWith(".h")) {
    const cLines = state.aggregate.languages["C"] || 0;
    const cppLines = state.aggregate.languages["C++"] || 0;
    return cLines >= cppLines ? "c" : "cpp";
  }
  if (lower.endsWith(".cs")) return "csharp";
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs") || lower.endsWith(".jsx") || lower.endsWith(".ts") || lower.endsWith(".tsx")) return "javascript";
  if (lower.endsWith(".json")) return state.settings.includeJson ? "json" : null;
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "bash";
  if (lower.endsWith(".scala")) return "scala";
  return null;
}

function maybeAutoParseActiveFile() {
  const ts = state.treeSitter;
  if (ts.pendingFileId && ts.pendingFileId !== state.activeFileId) {
    cancelPendingTreeSitterParse();
  }
  if (!ts.window.open || ts.window.minimized) {
    renderTreeSitterPanel();
    return;
  }
  if (state.phase !== "loaded") {
    renderTreeSitterPanel();
    return;
  }
  const file = state.files.find(f => f.id === state.activeFileId);
  if (!file) {
    renderTreeSitterPanel();
    return;
  }
  const lang = getTreeSitterLanguage(file);
  if (!lang) {
    renderTreeSitterPanel("Tree-sitter not available for this file.");
    return;
  }
  const tooLarge = file.size > state.settings.maxFileSize;
  if (tooLarge && !ts.cache[file.id]) {
    renderTreeSitterPanel("File too large to parse automatically. Click Parse to try.");
    return;
  }
  if (ts.cache[file.id]) {
    renderTreeSitterPanel();
    ensureTreeSitterMarkers(file);
    return;
  }
  scheduleTreeSitterParse(lang, false);
}

function scheduleTreeSitterParse(lang, force) {
  const file = state.files.find(f => f.id === state.activeFileId);
  if (!file) return;
  if (state.phase !== "loaded") {
    renderTreeSitterPanel("Available after load completes.");
    return;
  }
  const ts = state.treeSitter;
  cancelPendingTreeSitterParse();
  ts.pendingFileId = file.id;
  ts.parseHandleType = typeof requestIdleCallback === "function" ? "idle" : "timeout";
  renderTreeSitterPanel("Scheduling parse…");
  const runner = () => runTreeSitterParse(file, lang, force);
  if (ts.parseHandleType === "idle") {
    ts.parseHandle = requestIdleCallback(runner);
  } else {
    ts.parseHandle = setTimeout(runner, 0);
  }
}

async function runTreeSitterParse(file, lang, force) {
  const ts = state.treeSitter;
  if (ts.pendingFileId !== file.id && !force) return;
  ts.error = null;
  ts.parsing = true;
  renderTreeSitterPanel("Parsing active file…");
  try {
    ts.wantInit = true;
    await maybeInitTreeSitterRuntime();
    if (!ts.ready || ts.error) return;
    const language = await loadTreeSitterLanguage(lang);
    if (!language) return;
    ts.parser.setLanguage(language);
    const tree = ts.parser.parse(file.text);
    const outline = buildOutlineModel(tree, file, lang);
    const includes = buildIncludeList(tree, lang, state.files);
    const symbolRefs = extractTreeSitterSymbolContribution(tree, file, lang, {
      minLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
      minBridgeLength: SYMBOL_REFS_MIN_BRIDGE_LENGTH
    });
    if (!force && state.activeFileId !== file.id) return;
    ts.cache[file.id] = { outline, includes, parsedAt: Date.now(), symbolRefs };
    scheduleSymbolReferenceIncrementalUpdate(file.id);
    placeTreeSitterMarkers(file, outline);
    renderTreeSitterPanel();
  } catch (err) {
    ts.error = "Parse error for this file.";
    addLog(file.path, `tree-sitter parse error: ${err?.message || err}`);
    renderTreeSitterPanel(ts.error);
  } finally {
    ts.parsing = false;
    ts.pendingFileId = null;
    ts.parseHandle = null;
    ts.parseHandleType = null;
    renderTreeSitterPanel();
  }
}

function placeTreeSitterMarkers(file, outline) {
  const section = getFileSection(file.id);
  if (!section) return;
  const pre = section.querySelector("pre");
  if (!pre) return;
  const markers = state.treeSitter.markers[file.id] || [];
  markers.forEach(m => m.remove());
  state.treeSitter.markers[file.id] = [];
  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  outline.forEach(item => {
    const marker = document.createElement("div");
    marker.id = item.anchorId;
    marker.className = "ts-marker";
    marker.style.top = `${Math.max(0, (item.line - 1) * lineHeight)}px`;
    marker.dataset.line = item.line;
    pre.appendChild(marker);
    state.treeSitter.markers[file.id].push(marker);
  });
}

function ensureTreeSitterMarkers(file) {
  const cache = state.treeSitter.cache[file.id];
  if (!cache || !cache.outline?.length) return;
  const markers = state.treeSitter.markers[file.id] || [];
  if (markers.length >= cache.outline.length) return;
  placeTreeSitterMarkers(file, cache.outline);
}

function renderTreeSitterPanel(statusText) {
  if (!els.tsWindow) return;
  const ts = state.treeSitter;
  const file = state.files.find(f => f.id === state.activeFileId);
  updateTreeSitterSubtitle();
  const cache = file ? ts.cache[file.id] : null;
  const outline = cache?.outline || [];
  const includes = cache?.includes || [];
  let status = statusText || "";
  if (!status) {
    if (ts.error) status = ts.error;
    else if (ts.loading) status = "Loading Tree-sitter…";
    else if (state.phase !== "loaded") status = "Available after load completes.";
    else if (!file) status = "Open a supported file to parse.";
    else {
      const lang = getTreeSitterLanguage(file);
      if (!lang) status = "Tree-sitter not available for this file.";
      else if (file.size > state.settings.maxFileSize && !outline.length) status = "File too large to parse automatically. Click Parse to try.";
      else if (ts.parsing || ts.pendingFileId === file?.id) status = "Parsing active file…";
      else if (!outline.length && !includes.length) status = cache ? "Parsed but no outline items found." : "Click Parse to build an outline for this file.";
      else status = "";
    }
  }
  if (els.tsStatus) {
    els.tsStatus.textContent = status;
    els.tsStatus.classList.toggle("muted", !!status);
  }
  renderTreeSitterOutline(outline);
  renderTreeSitterIncludes(includes);
}

function renderTreeSitterOutline(items) {
  if (!els.tsOutline) return;
  els.tsOutline.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "ts-placeholder";
    empty.textContent = "No outline items.";
    els.tsOutline.appendChild(empty);
    return;
  }
  items.forEach(item => {
    const row = document.createElement("button");
    row.className = "ts-row";
    row.type = "button";
    row.title = `${item.name} — line ${item.line}`;
    const kind = document.createElement("span");
    kind.className = `ts-kind kind-${item.kind}`;
    kind.textContent = item.kind;
    const name = document.createElement("span");
    name.className = "ts-name";
    name.textContent = item.name;
    const line = document.createElement("span");
    line.className = "ts-line";
    line.textContent = `Line ${item.line}`;
    row.appendChild(kind);
    row.appendChild(name);
    row.appendChild(line);
    row.addEventListener("click", () => scrollToOutlineItem(item));
    els.tsOutline.appendChild(row);
  });
}

function renderTreeSitterIncludes(items) {
  if (!els.tsIncludes) return;
  els.tsIncludes.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "ts-placeholder";
    empty.textContent = "No includes.";
    els.tsIncludes.appendChild(empty);
    return;
  }
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "ts-row include";
    const label = document.createElement("span");
    label.className = "ts-name";
    label.textContent = item.raw;
    row.appendChild(label);
    if (item.targetFileId) {
      const jump = document.createElement("button");
      jump.className = "ghost tiny";
      setButtonLabel(jump, "🔗", "Open");
      jump.addEventListener("click", () => {
        location.hash = `#${item.targetFileId}`;
        setActiveFile(item.targetFileId);
      });
      row.appendChild(jump);
    }
    els.tsIncludes.appendChild(row);
  });
}

function scrollToOutlineItem(item) {
  if (isFileHidden(item.fileId)) return;
  const section = getFileSection(item.fileId);
  if (section && section.tagName === "DETAILS") section.open = true;
  const marker = document.getElementById(item.anchorId);
  if (marker) {
    marker.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveFile(item.fileId);
    return;
  }
  scrollToApproxLine(item.fileId, item.line);
}

function scrollToApproxLine(fileId, line, behavior = "smooth") {
  if (isFileHidden(fileId)) return;
  const section = getFileSection(fileId);
  if (!section) return;
  if (section.tagName === "DETAILS") section.open = true;
  const pre = section.querySelector("pre");
  const header = section.querySelector(".file-header");
  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const top = pre.getBoundingClientRect().top + window.scrollY + Math.max(0, (line - 1) * lineHeight);
  window.scrollTo({ top: top - headerHeight - 16, behavior });
  setActiveFile(fileId);
}

function init() {
  document.documentElement.style.setProperty("--sidebar-width", `${state.sidebar.width}px`);
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
  if (els.fileRefsToggle) els.fileRefsToggle.addEventListener("change", applyFileRefsToggle);
  if (els.symbolRefsToggle) els.symbolRefsToggle.addEventListener("change", applySymbolRefsToggle);
  els.jsonToggle.addEventListener("change", () => { state.settings.includeJson = els.jsonToggle.checked; saveSettings(); });

  els.sidebarPin.addEventListener("click", toggleSidebarPin);
  els.sidebarEdge.addEventListener("mouseenter", openSidebarOverlay);
  els.sidebar.addEventListener("mouseleave", collapseSidebarOverlay);
  els.sidebarEdge.addEventListener("click", openSidebarOverlay);
  setupSidebarResize();
  els.treeContainer.addEventListener("keydown", handleTreeKeydown);

  els.statsBtn.addEventListener("click", openStatsPanel);
  els.statsClose.addEventListener("click", closeStatsPanel);
  els.statsPanel.addEventListener("click", e => { if (e.target === els.statsPanel) closeStatsPanel(); });

  els.logToggle.addEventListener("click", openLogPanel);
  els.logClose.addEventListener("click", closeLogPanel);
  els.logPanel.addEventListener("click", e => { if (e.target === els.logPanel) closeLogPanel(); });

  els.supportLink.addEventListener("click", openSupportPanel);
  els.supportClose.addEventListener("click", closeSupportPanel);
  els.supportPanel.addEventListener("click", e => { if (e.target === els.supportPanel) closeSupportPanel(); });

  if (els.tocSelectAll) els.tocSelectAll.addEventListener("click", handleTocSelectAll);
  if (els.tocReset) els.tocReset.addEventListener("click", handleTocResetSelection);
  if (els.tocCopy) els.tocCopy.addEventListener("click", copySelectedFiles);
  if (els.tocHide) els.tocHide.addEventListener("click", hideSelectedFiles);
  if (els.tocShow) els.tocShow.addEventListener("click", showSelectedFiles);
  if (els.tocFilterQuery) {
    els.tocFilterQuery.addEventListener("input", handleTocFilterInput);
    els.tocFilterQuery.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        e.preventDefault();
        clearTocQuery();
      }
    });
  }
  if (els.tocFilterClear) els.tocFilterClear.addEventListener("click", clearTocQuery);
  if (els.tocExclusionsClear) els.tocExclusionsClear.addEventListener("click", clearTocExclusions);
  if (els.tocList) {
    els.tocList.addEventListener("pointerover", handleTocSegmentPointerOver);
    els.tocList.addEventListener("pointerout", handleTocSegmentPointerOut);
    els.tocList.addEventListener("focusin", handleTocSegmentFocusIn);
    els.tocList.addEventListener("focusout", handleTocSegmentFocusOut);
    els.tocList.addEventListener("click", handleTocSegmentExclusion);
  }
  if (els.tocPanel) {
    els.tocPanel.addEventListener("toggle", () => {
      if (els.tocPanel.open && els.tocFilterQuery && !els.tocFilterQuery.disabled) {
        els.tocFilterQuery.focus();
        els.tocFilterQuery.select();
      }
    });
  }
  setupHoverPreview();

  if (els.codeSearchPanel) {
    els.codeSearchPanel.addEventListener("toggle", () => {
      if (els.codeSearchPanel.open && els.codeSearchQuery && !els.codeSearchQuery.disabled) {
        els.codeSearchQuery.focus();
        els.codeSearchQuery.select();
      }
    });
  }
  if (els.codeSearchRun) els.codeSearchRun.addEventListener("click", () => startSearchRun("explicit"));
  if (els.codeSearchCancel) els.codeSearchCancel.addEventListener("click", () => cancelSearchRun("user"));
  if (els.codeSearchQuery) {
    els.codeSearchQuery.addEventListener("keydown", e => {
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
    els.previewToggle.addEventListener("click", () => setPreviewEnabled(!state.preview.enabled));
  }
  if (els.tsClose) els.tsClose.addEventListener("click", closeTreeSitterWindow);
  if (els.tsMinimize) els.tsMinimize.addEventListener("click", minimizeTreeSitterWindow);
  if (els.tsParse) els.tsParse.addEventListener("click", () => {
    if (state.phase !== "loaded") {
      renderTreeSitterPanel("Available after load completes.");
      return;
    }
    const file = state.files.find(f => f.id === state.activeFileId);
    const lang = getTreeSitterLanguage(file);
    if (file && lang) scheduleTreeSitterParse(lang, true);
    renderTreeSitterPanel();
  });
  if (els.tsTitleBar) els.tsTitleBar.addEventListener("mousedown", handleTreeSitterDrag);
  if (els.tsResize) els.tsResize.addEventListener("mousedown", handleTreeSitterResize);
  if (els.tsChip) {
    els.tsChip.addEventListener("click", restoreTreeSitterWindow);
    els.tsChip.addEventListener("mousedown", handleChipDrag);
  }

  document.addEventListener("keydown", maybeYieldEmptyEnter);
  window.addEventListener("resize", updateOffsets);
  window.addEventListener("resize", handleViewportResize);
  window.addEventListener("resize", handlePreviewViewportResize);
  window.addEventListener("scroll", handlePreviewViewportResize, { passive: true });
  window.addEventListener("hashchange", handleHashChange);
  renderDirectoryTree();
  renderTableOfContents();
  updateTreeSitterWindowUI();
  syncReferenceFeatureEnabled();
  syncSymbolReferenceFeatureEnabled();
}

document.addEventListener("DOMContentLoaded", init);
