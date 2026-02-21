import {
  clampLineNumberForFile,
  getLineMetricsInPre
} from "./line-navigation.js";

export function createTreeSitterController(ctx) {
  const {
    state,
    els,
    doc = document,
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
    addLog,
    updateControlBar,
    setActiveFile,
    getFileSection,
    startSymbolIndexRebuild,
    createNormalizedSymbolContribution,
    refreshEffectiveSymbolContribution,
    scheduleSymbolReferenceIncrementalUpdate,
    isFileHidden
  } = ctx;

  function clearTreeSitterQueueHandle() {
    const ts = state.treeSitter;
    const queue = ts.queue;
    if (!queue) return;
    if (queue.handle && queue.handleType === "idle" && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(queue.handle);
    }
    if (queue.handle && queue.handleType === "timeout") {
      clearTimeout(queue.handle);
    }
    queue.handle = null;
    queue.handleType = null;
    ts.parseHandle = null;
    ts.parseHandleType = null;
  }

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

/**
 * Applies current Tree-sitter window placement to the DOM and persists it.
 *
 * @returns {void}
 */

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
    persistTreeSitterState(state.treeSitter.window, { storageKey: TREE_SITTER_STORAGE_KEY });
  }

/**
 * Updates Tree-sitter window visibility/minimized state and refreshes its rendered content.
 *
 * @returns {void}
 */

  function updateTreeSitterWindowUI() {
    if (!els.tsWindow || !els.tsChip) return;
    const { window: win } = state.treeSitter;
    els.tsWindow.classList.toggle("hidden", !win.open || win.minimized);
    els.tsChip.classList.toggle("hidden", !(win.open && win.minimized));
    updateTreeSitterPlacement();
    renderTreeSitterPanel();
  }

/**
 * Toggles the Tree-sitter window between closed, open, and minimized states.
 *
 * @returns {void}
 */

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

/**
 * Opens the Tree-sitter window and resumes background parsing and runtime initialization.
 *
 * @returns {void}
 */

function openTreeSitterWindow() {
  state.treeSitter.window.open = true;
  state.treeSitter.window.minimized = false;
  state.treeSitter.wantInit = true;
  state.treeSitter.queue.paused = false;
  updateTreeSitterWindowUI();
  updateControlBar();
  maybeInitTreeSitterRuntime();
  resumeTreeSitterQueue();
}

/**
 * Closes the Tree-sitter window and pauses background parsing work.
 *
 * @returns {void}
 */

function closeTreeSitterWindow() {
  state.treeSitter.window.open = false;
  state.treeSitter.window.minimized = false;
  pauseTreeSitterQueue();
  updateTreeSitterWindowUI();
  updateControlBar();
}

/**
 * Minimizes the Tree-sitter window into a draggable chip and pauses background parsing work.
 *
 * @returns {void}
 */

function minimizeTreeSitterWindow() {
  state.treeSitter.window.minimized = true;
  state.treeSitter.window.open = true;
  pauseTreeSitterQueue();
  updateTreeSitterWindowUI();
  updateControlBar();
}

/**
 * Restores the minimized Tree-sitter window and resumes background parsing work.
 *
 * @returns {void}
 */

function restoreTreeSitterWindow() {
  state.treeSitter.window.minimized = false;
  state.treeSitter.window.open = true;
  updateTreeSitterWindowUI();
  updateControlBar();
  maybeInitTreeSitterRuntime();
  resumeTreeSitterQueue();
}

/**
 * Binds temporary window-level mouse move/up listeners for drag-like interactions.
 *
 * @param {(event: MouseEvent) => void} onMove Move callback.
 * @returns {void}
 */

function bindWindowMouseDrag(onMove) {
  const move = event => onMove(event);
  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
}

/**
 * Enables dragging the Tree-sitter window to reposition it.
 *
 * @param {MouseEvent} e Mouse event.
 * @returns {void}
 */

function handleTreeSitterDrag(e) {
  if (e.target.closest(".ts-controls")) return;
  const startX = e.clientX;
  const startY = e.clientY;
  const win = { ...state.treeSitter.window };
  bindWindowMouseDrag(evt => {
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    state.treeSitter.window.x = win.x + dx;
    state.treeSitter.window.y = win.y + dy;
    updateTreeSitterPlacement();
  });
}

/**
 * Enables resizing the Tree-sitter window via its resize handle.
 *
 * @param {MouseEvent} e Mouse event.
 * @returns {void}
 */

function handleTreeSitterResize(e) {
  e.stopPropagation();
  const startX = e.clientX;
  const startY = e.clientY;
  const win = { ...state.treeSitter.window };
  bindWindowMouseDrag(evt => {
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    state.treeSitter.window.w = win.w + dx;
    state.treeSitter.window.h = win.h + dy;
    updateTreeSitterPlacement();
  });
}

/**
 * Enables dragging the minimized Tree-sitter chip vertically to reposition it.
 *
 * @param {MouseEvent} e Mouse event.
 * @returns {void}
 */

function handleChipDrag(e) {
  const startY = e.clientY;
  const startTop = state.treeSitter.window.chipY || 0;
  bindWindowMouseDrag(evt => {
    const dy = evt.clientY - startY;
    state.treeSitter.window.chipY = startTop + dy;
    updateTreeSitterPlacement();
  });
}

/**
 * Re-applies Tree-sitter placement constraints when the viewport changes size.
 *
 * @returns {void}
 */

function handleViewportResize() {
  updateTreeSitterPlacement();
}

/**
 * Lazily initializes the Tree-sitter runtime when requested, recording errors for user visibility.
 *
 * @returns {Promise<void>}
 */

async function maybeInitTreeSitterRuntime() {
  const ts = state.treeSitter;
  if (!ts.enabled || ts.ready || ts.loading || !ts.wantInit) return;
  ts.loading = true;
  ts.error = null;
  scheduleTreeSitterStatusRefresh();
  try {
    const mod = await import(resolveAssetUrl(`${TREE_SITTER_ASSET_BASE}/web-tree-sitter.js`));
    ts.Parser = mod.Parser;
    ts.Language = mod.Language;
    await ts.Parser.init({ locateFile: () => resolveAssetUrl(`${TREE_SITTER_ASSET_BASE}/web-tree-sitter.wasm`) });
    ts.parser = new ts.Parser();
    ts.ready = true;
    ts.progress.tsUnavailable = false;
  } catch (err) {
    ts.error = err?.message || "Tree-sitter failed to load.";
    ts.progress.tsUnavailable = true;
    addLog("tree-sitter", `error: ${ts.error}`);
    pushTreeSitterError("(runtime)", ts.error);
  } finally {
    ts.loading = false;
    scheduleTreeSitterStatusRefresh();
  }
}

/**
 * Loads and caches a Tree-sitter language grammar for a given language kind when available.
 *
 * @param {string} kind Language kind key.
 * @returns {Promise<Object|null>} Loaded language object or null when unavailable.
 */

async function loadTreeSitterLanguage(kind) {
  const ts = state.treeSitter;
  if (!ts.ready || !ts.Language) return null;
  if (ts.languages[kind]) return ts.languages[kind];
  const config = TREE_SITTER_LANGUAGES[kind];
  if (!config?.file) return null;
  try {
    const lang = await ts.Language.load(resolveAssetUrl(`${TREE_SITTER_ASSET_BASE}/${config.file}`));
    ts.error = null;
    ts.progress.tsUnavailable = false;
    ts.languages[kind] = lang;
    return lang;
  } catch (err) {
    ts.error = `${kind} grammar missing`;
    pushTreeSitterError(kind, ts.error);
    addLog("tree-sitter", `error: ${ts.error}`);
    scheduleTreeSitterStatusRefresh();
    return null;
  }
}

/**
 * Cancels any pending Tree-sitter parse work without necessarily clearing all queued intent.
 *
 * @returns {void}
 */

function cancelPendingTreeSitterParse() {
  cancelTreeSitterQueue("cancel-pending", false);
}

/**
 * Cancels Tree-sitter queue processing and optionally clears all pending files.
 *
 * @param {string} [_reason="cancel"] Reason label for diagnostics.
 * @param {boolean} [clearPending=true] Whether to clear all queued work.
 * @returns {void}
 */

function cancelTreeSitterQueue(_reason = "cancel", clearPending = true) {
  const ts = state.treeSitter;
  normalizeTreeSitterRuntimeState(state.treeSitter);
  clearTreeSitterQueueHandle();
  const queue = ts.queue;
  queue.runId += 1;
  queue.inProgressFileId = null;
  if (clearPending) {
    queue.pendingIds = [];
    queue.pendingSet.clear();
    queue.paused = true;
    ts.progress.currentFilePath = "";
  }
  ts.pendingFileId = null;
  ts.parsing = false;
  scheduleTreeSitterStatusRefresh();
}

/**
 * Pauses Tree-sitter queue processing and clears active handles without dropping queued intent.
 *
 * @returns {void}
 */

function pauseTreeSitterQueue() {
  const ts = state.treeSitter;
  normalizeTreeSitterRuntimeState(state.treeSitter);
  ts.queue.paused = true;
  clearTreeSitterQueueHandle();
  ts.parsing = false;
  ts.pendingFileId = null;
  scheduleTreeSitterStatusRefresh();
}

/**
 * Resumes Tree-sitter queue processing by scheduling work and refreshing status.
 *
 * @returns {void}
 */

function resumeTreeSitterQueue() {
  const ts = state.treeSitter;
  normalizeTreeSitterRuntimeState(state.treeSitter);
  ts.queue.paused = false;
  scheduleTreeSitterQueueSlice();
  scheduleTreeSitterStatusRefresh();
}

/**
 * Debounces refresh of Tree-sitter status and UI to avoid excessive rendering.
 *
 * @returns {void}
 */

function scheduleTreeSitterStatusRefresh() {
  const ts = state.treeSitter;
  const queue = ts.queue;
  if (!queue || queue.statusRefreshHandle) return;
  queue.statusRefreshHandle = setTimeout(() => {
    queue.statusRefreshHandle = null;
    refreshTreeSitterProgress();
    renderTreeSitterPanel();
    updateControlBar();
  }, TS_QUEUE_STATUS_REFRESH_DEBOUNCE_MS);
}

/**
 * Records a Tree-sitter error entry with bounded history for display and troubleshooting.
 *
 * @param {string} path File path or subsystem label.
 * @param {string} error Error message.
 * @returns {void}
 */

function pushTreeSitterError(path, error) {
  const ts = state.treeSitter;
  ts.errors.push({ path, error });
  if (ts.errors.length > 200) ts.errors.splice(0, ts.errors.length - 200);
}

/**
 * Recomputes Tree-sitter progress counters from per-file parse state.
 *
 * @returns {void}
 */

function refreshTreeSitterProgress() {
  const ts = state.treeSitter;
  const entries = Object.values(ts.fileStateById || {});
  const progress = ts.progress || createInitialTreeSitterProgressState();
  progress.eligibleTotal = entries.length;
  progress.completedPhase1 = entries.filter(entry => entry.phase1Done).length;
  progress.completedPhase2 = entries.filter(entry => entry.phase2Done).length;
  progress.skipped = entries.filter(entry => entry.status === "skipped").length;
  progress.failed = entries.filter(entry => entry.status === "error").length;
  ts.progress = progress;
}

/**
 * Produces user-facing status text describing Tree-sitter analysis and queue progress.
 *
 * @param {{compact?: boolean}} [options] Formatting options.
 * @returns {string} Status text or empty string when not applicable.
 */

function getTreeSitterQueueStatusText({ compact = false } = {}) {
  const ts = state.treeSitter;
  const queue = ts.queue || createInitialTreeSitterQueueState();
  const progress = ts.progress || createInitialTreeSitterProgressState();
  const total = progress.eligibleTotal || state.aggregate.loadedFiles || 0;
  if (!total) return "";
  const done = Math.min(total, progress.completedPhase2 || 0);
  const currentPath = progress.currentFilePath || "";
  const failureText = progress.failed > 0 ? ` • errors ${progress.failed}` : "";
  if (progress.tsUnavailable) {
    return compact
      ? `Tree-sitter unavailable • analyzed ${progress.completedPhase1}/${total}${failureText}`
      : `Tree-sitter unavailable. Using lightweight analysis (${progress.completedPhase1}/${total})${failureText}`;
  }
  if (queue.paused) {
    return compact
      ? `Parsing paused • ${done}/${total}${failureText}`
      : `Parsing paused at ${done}/${total}${failureText}`;
  }
  if (ts.loading) return compact ? "Loading Tree-sitter runtime…" : "Loading Tree-sitter runtime…";
  if (ts.parsing || queue.inProgressFileId) {
    return compact
      ? `Parsing ${done}/${total}: ${currentPath || "..."}${failureText}`
      : `Parsing ${done} of ${total}: ${currentPath || "..."}${failureText}`;
  }
  if (queue.pendingIds.length > 0) {
    return compact
      ? `Queued ${done}/${total} • remaining ${queue.pendingIds.length}${failureText}`
      : `Queued ${done} of ${total} complete • remaining ${queue.pendingIds.length}${failureText}`;
  }
  if (done >= total) {
    if (compact && progress.finalized && progress.failed === 0) return "";
    const finalizedText = progress.finalized ? " • finalized" : "";
    return compact
      ? `Parsing complete • ${done}/${total}${failureText}${finalizedText}`
      : `Parsing complete for ${done}/${total}${failureText}${finalizedText}`;
  }
  return compact ? `Analysis ${progress.completedPhase1}/${total}` : `Analysis progress: ${progress.completedPhase1}/${total}`;
}

/**
 * Updates the Tree-sitter parse button label to reflect whether it will parse, pause, resume, or rebuild.
 *
 * @returns {void}
 */

function updateTreeSitterParseButtonLabel() {
  if (!els.tsParse) return;
  const ts = state.treeSitter;
  const queue = ts.queue || createInitialTreeSitterQueueState();
  const hasPending = queue.pendingIds.length > 0;
  const isRunning = !!(ts.parsing || queue.inProgressFileId || queue.handle);
  let label = "Parse";
  if (state.aggregate.loadedFiles > 0) {
    if (isRunning && !queue.paused) label = "Pause";
    else if (queue.paused || hasPending) label = "Resume";
    else label = "Rebuild";
  }
  setButtonLabel(els.tsParse, "🧠", label);
}

/**
 * Ensures a file has a corresponding Tree-sitter tracking entry for analysis and parsing phases.
 *
 * @param {Object} file File record.
 * @returns {Object|null} File state entry or null when file is invalid.
 */

function ensureTreeSitterFileState(file) {
  if (!file?.id) return null;
  const ts = state.treeSitter;
  let entry = ts.fileStateById[file.id];
  if (entry) return entry;
  entry = {
    status: "queued",
    lang: null,
    lastParsedVersion: "",
    phase1Done: false,
    phase2Done: false,
    outline: [],
    includes: [],
    symbolContribution: null,
    refCandidates: [],
    error: null
  };
  ts.fileStateById[file.id] = entry;
  return entry;
}

/**
 * Computes a stable fingerprint for a file's current content to detect when parsing results are stale.
 *
 * @param {Object} file File record.
 * @returns {string} Fingerprint string.
 */

function computeFileFingerprint(file) {
  if (!file) return "";
  const hash = hashString(file.textFull || file.text || "");
  return `${file.charCount || 0}:${file.lineCount || 0}:${hash}`;
}

/**
 * Performs lightweight, immediate analysis for a file (symbols and reference candidates) to power early UX.
 *
 * @param {Object} file File record.
 * @returns {void}
 */

function runImmediateFileAnalysis(file) {
  const ts = state.treeSitter;
  const fileState = ensureTreeSitterFileState(file);
  if (!fileState || fileState.phase1Done) return;

  const lines = (file.textFull || file.text || "").split("\n");
  const isConfigFile = isConfigLikeFile(file.path);
  const contribution = createNormalizedSymbolContribution(file, null, "heuristic");
  const refCandidates = [];

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const lineText = lines[index];
    const matches = extractHeuristicSymbolsFromLine(lineText, {
      lineNumber,
      isConfigFile,
      minLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
      minBridgeLength: SYMBOL_REFS_MIN_BRIDGE_LENGTH
    });
    for (let i = 0; i < matches.length; i += 1) {
      const match = matches[i];
      if (match.role === "definition") contribution.definitions.push(match);
      else contribution.references.push(match);
    }
    const refs = extractReferenceCandidates(lineText, {
      refExts: state.refs.extSet,
      maxTokenLength: REFS_MAX_TOKEN_LENGTH,
      enableBareFilename: false
    });
    if (refs.length) refCandidates.push({ lineNumber, candidates: refs });
  }

  state.symbolRefs.contributions.heuristicByFile.set(file.id, contribution);
  refreshEffectiveSymbolContribution(file.id);
  fileState.refCandidates = refCandidates;
  fileState.phase1Done = true;
  fileState.symbolContribution = contribution;
  ts.progress.finalized = false;
  refreshTreeSitterProgress();
  scheduleTreeSitterStatusRefresh();
}

/**
 * Retrieves a loaded file record by its file identifier.
 *
 * @param {string} fileId File identifier.
 * @returns {Object|null} File record or null if not found.
 */

function getFileById(fileId) {
  return state.files.find(file => file.id === fileId) || null;
}

/**
 * Enqueues a file for background Tree-sitter parsing, optionally prioritizing or forcing a re-parse.
 *
 * @param {Object} file File record.
 * @param {string} [reason="loaded"] Reason label influencing queue priority.
 * @param {boolean} [force=false] Whether to force re-parsing even if unchanged.
 * @returns {void}
 */

function enqueueFileForBackgroundParsing(file, reason = "loaded", force = false) {
  if (!file?.id) return;
  const ts = state.treeSitter;
  normalizeTreeSitterRuntimeState(state.treeSitter);
  const queue = ts.queue;
  const fileState = ensureTreeSitterFileState(file);
  if (!fileState) return;

  fileState.lang = getTreeSitterLanguage(file);
  if (force) {
    fileState.lastParsedVersion = "";
    fileState.phase2Done = false;
    fileState.status = "queued";
    fileState.error = null;
  } else {
    const fingerprint = computeFileFingerprint(file);
    if (fileState.status === "parsed" && fileState.lastParsedVersion === fingerprint) {
      fileState.phase2Done = true;
      refreshTreeSitterProgress();
      return;
    }
  }

  if (queue.pendingSet.has(file.id)) {
    if (reason === "active") prioritizeFileInParseQueue(file.id);
    return;
  }

  fileState.status = "queued";
  fileState.error = null;
  fileState.phase2Done = false;
  ts.progress.finalized = false;

  if (reason === "active") {
    queue.pendingIds.unshift(file.id);
  } else {
    const score = Number.isFinite(file.charCount) ? file.charCount : ((file.textFull || file.text || "").length || 0);
    let inserted = false;
    for (let i = 0; i < queue.pendingIds.length; i += 1) {
      const current = getFileById(queue.pendingIds[i]);
      const currentScore = Number.isFinite(current?.charCount) ? current.charCount : (current?.text?.length || Number.MAX_SAFE_INTEGER);
      if (score < currentScore) {
        queue.pendingIds.splice(i, 0, file.id);
        inserted = true;
        break;
      }
    }
    if (!inserted) queue.pendingIds.push(file.id);
  }
  queue.pendingSet.add(file.id);
  refreshTreeSitterProgress();
  scheduleTreeSitterQueueSlice();
  scheduleTreeSitterStatusRefresh();
}

/**
 * Prioritizes a file in the Tree-sitter parse queue so it is analyzed sooner (typically for active navigation).
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */

function prioritizeFileInParseQueue(fileId) {
  if (!fileId) return;
  const ts = state.treeSitter;
  normalizeTreeSitterRuntimeState(state.treeSitter);
  const queue = ts.queue;
  if (queue.pendingSet.has(fileId)) {
    queue.pendingIds = [fileId, ...queue.pendingIds.filter(id => id !== fileId)];
    scheduleTreeSitterQueueSlice();
    scheduleTreeSitterStatusRefresh();
    return;
  }
  const file = getFileById(fileId);
  const fileState = file ? ensureTreeSitterFileState(file) : null;
  if (file && fileState && !fileState.phase2Done) {
    enqueueFileForBackgroundParsing(file, "active");
  }
}

/**
 * Schedules a unit of Tree-sitter queue work using idle time when possible to minimize UI disruption.
 *
 * @returns {void}
 */

function scheduleTreeSitterQueueSlice() {
  const ts = state.treeSitter;
  if (!ts.enabled) return;
  normalizeTreeSitterRuntimeState(state.treeSitter);
  const queue = ts.queue;
  if (queue.paused || queue.handle || queue.pendingIds.length === 0) return;
  const runId = queue.runId;
  const runner = deadline => {
    queue.handle = null;
    queue.handleType = null;
    runTreeSitterQueueSlice(runId, deadline).catch(err => {
      addLog("tree-sitter", `queue error: ${err?.message || err}`);
      scheduleTreeSitterStatusRefresh();
    });
  };
  queue.handleType = typeof requestIdleCallback === "function" ? "idle" : "timeout";
  if (queue.handleType === "idle") {
    queue.handle = requestIdleCallback(runner, { timeout: 50 });
  } else {
    queue.handle = setTimeout(() => runner(null), 0);
  }
  ts.parseHandle = queue.handle;
  ts.parseHandleType = queue.handleType;
}

/**
 * Processes a limited slice of the Tree-sitter parse queue, updating progress and triggering finalization work.
 *
 * @param {number} runId Queue run identifier for cancellation safety.
 * @param {IdleDeadline|null} deadline Idle callback deadline, when available.
 * @returns {Promise<void>}
 */

async function runTreeSitterQueueSlice(runId, deadline) {
  const ts = state.treeSitter;
  const queue = ts.queue;
  if (!queue || queue.paused || runId !== queue.runId) return;
  const start = performance.now();
  let processed = 0;
  while (queue.pendingIds.length > 0) {
    if (queue.paused || runId !== queue.runId) break;
    if (processed >= TS_PARSE_FILES_PER_SLICE) break;
    if (performance.now() - start > TS_PARSE_SLICE_BUDGET) break;
    if (deadline && typeof deadline.timeRemaining === "function" && deadline.timeRemaining() <= 0) break;

    const fileId = queue.pendingIds.shift();
    queue.pendingSet.delete(fileId);
    const file = getFileById(fileId);
    if (!file) continue;
    queue.inProgressFileId = fileId;
    ts.pendingFileId = fileId;
    ts.progress.currentFilePath = file.path;
    ts.parsing = true;
    scheduleTreeSitterStatusRefresh();
    await runTreeSitterParseForFile(file, runId);
    processed += 1;
  }

  if (runId !== queue.runId) return;
  queue.inProgressFileId = null;
  ts.pendingFileId = null;
  ts.parsing = false;
  if (!queue.pendingIds.length) ts.progress.currentFilePath = "";
  if (queue.pendingIds.length > 0 && !queue.paused) {
    scheduleTreeSitterQueueSlice();
  } else if (state.phase === "loaded" && !ts.progress.finalized) {
    ts.progress.finalized = true;
    if (state.symbolRefs.enabled) startSymbolIndexRebuild("finalize");
  }
  scheduleTreeSitterStatusRefresh();
}

/**
 * Parses a single file with Tree-sitter (when supported) and updates cached analysis outputs and per-file state.
 *
 * @param {Object} file File record.
 * @param {number} runId Queue run identifier for cancellation safety.
 * @returns {Promise<void>}
 */

async function runTreeSitterParseForFile(file, runId) {
  const ts = state.treeSitter;
  if (!file) return;
  const fileState = ensureTreeSitterFileState(file);
  if (!fileState) return;
  const lang = getTreeSitterLanguage(file);
  const fingerprint = computeFileFingerprint(file);

  fileState.lang = lang;
  fileState.error = null;
  ts.error = null;

  if (!lang || !ts.enabled) {
    fileState.status = "skipped";
    fileState.phase2Done = true;
    fileState.lastParsedVersion = fingerprint;
    refreshTreeSitterProgress();
    return;
  }

  try {
    ts.wantInit = true;
    await maybeInitTreeSitterRuntime();
    if (runId !== ts.queue.runId) return;
    if (!ts.ready || ts.error) {
      ts.progress.tsUnavailable = true;
      fileState.status = "skipped";
      fileState.phase2Done = true;
      fileState.lastParsedVersion = fingerprint;
      refreshTreeSitterProgress();
      return;
    }
    const language = await loadTreeSitterLanguage(lang);
    if (runId !== ts.queue.runId) return;
    if (!language) {
      fileState.status = "error";
      fileState.phase2Done = true;
      fileState.error = `Grammar unavailable: ${lang}`;
      pushTreeSitterError(file.path, fileState.error);
      refreshTreeSitterProgress();
      return;
    }
    ts.parser.setLanguage(language);
    const tree = ts.parser.parse(file.textFull || file.text || "");
    const outline = buildOutlineModel(tree, file, lang);
    const includes = buildIncludeList(tree, lang, state.files);
    const symbolRefs = extractTreeSitterSymbolContribution(tree, file, lang, {
      minLength: SYMBOL_REFS_MIN_IDENTIFIER_LENGTH,
      minBridgeLength: SYMBOL_REFS_MIN_BRIDGE_LENGTH
    });
    ts.cache[file.id] = { outline, includes, parsedAt: Date.now(), symbolRefs };
    fileState.status = "parsed";
    fileState.phase2Done = true;
    fileState.lastParsedVersion = fingerprint;
    fileState.outline = outline;
    fileState.includes = includes;
    fileState.symbolContribution = symbolRefs;

    const normalized = createNormalizedSymbolContribution(file, symbolRefs, "tree");
    state.symbolRefs.contributions.treeByFile.set(file.id, normalized);
    refreshEffectiveSymbolContribution(file.id);
    scheduleSymbolReferenceIncrementalUpdate(file.id);
    if (state.activeFileId === file.id) placeTreeSitterMarkers(file, outline);
    refreshTreeSitterProgress();
  } catch (err) {
    ts.error = "Parse error for this file.";
    addLog(file.path, `tree-sitter parse error: ${err?.message || err}`);
    const message = err?.message || String(err);
    fileState.status = "error";
    fileState.phase2Done = true;
    fileState.error = message;
    pushTreeSitterError(file.path, message);
    refreshTreeSitterProgress();
  }
}

/**
 * Clears existing parse artifacts and re-enqueues all loaded files for a full Tree-sitter rebuild.
 *
 * @returns {void}
 */

function rebuildTreeSitterQueue() {
  const ts = state.treeSitter;
  cancelTreeSitterQueue("rebuild", true);
  Object.values(ts.markers || {}).forEach(markers => {
    if (!Array.isArray(markers)) return;
    markers.forEach(marker => marker?.remove?.());
  });
  ts.cache = {};
  ts.markers = {};
  ts.fileStateById = {};
  ts.errors = [];
  ts.progress = createInitialTreeSitterProgressState();
  ts.progress.finalized = false;
  state.symbolRefs.contributions.heuristicByFile.clear();
  state.symbolRefs.contributions.treeByFile.clear();
  state.symbolRefs.contributions.effectiveByFile.clear();
  state.files.forEach(file => {
    runImmediateFileAnalysis(file);
    enqueueFileForBackgroundParsing(file, "rebuild", true);
  });
  resumeTreeSitterQueue();
}

/**
 * Runs load-completion Tree-sitter queue adjustments so final cross-file analysis can settle.
 *
 * @returns {void}
 */

function finalizeTreeSitterQueueAfterLoad() {
  const ts = state.treeSitter;
  ts.progress.finalized = false;
  state.files.forEach(file => {
    const lang = getTreeSitterLanguage(file);
    if (lang === "c" || lang === "cpp") {
      enqueueFileForBackgroundParsing(file, "finalize", true);
    }
  });
  if (!ts.queue.pendingIds.length && !ts.parsing) {
    ts.progress.finalized = true;
  }
  resumeTreeSitterQueue();
}

/**
 * Reacts to active-file changes by updating dependent Tree-sitter UI and queue prioritization.
 *
 * @returns {void}
 */

function handleActiveFileChange() {
  updateTreeSitterSubtitle();
  prioritizeFileInParseQueue(state.activeFileId);
  const file = state.files.find(f => f.id === state.activeFileId);
  if (file && state.treeSitter.cache[file.id]) ensureTreeSitterMarkers(file);
  renderTreeSitterPanel();
}

/**
 * Updates the Tree-sitter window subtitle to reflect the currently active file.
 *
 * @returns {void}
 */

function updateTreeSitterSubtitle() {
  if (!els.tsSubtitle) return;
  const file = state.files.find(f => f.id === state.activeFileId);
  const text = file ? file.path : "No active file";
  els.tsSubtitle.textContent = text;
  els.tsSubtitle.title = text;
}

/**
 * Resolves the Tree-sitter language key for a file based on extension and project context.
 *
 * @param {Object} file File record.
 * @returns {string|null} Tree-sitter language key, or null when unsupported.
 */

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

/**
 * Renders outline anchor markers into a file's code block for fast in-file navigation.
 *
 * @param {Object} file File record.
 * @param {Array<Object>} outline Outline items to map into markers.
 * @returns {void}
 */

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
    const marker = doc.createElement("div");
    marker.id = item.anchorId;
    marker.className = "ts-marker";
    marker.style.top = `${Math.max(0, (item.line - 1) * lineHeight)}px`;
    marker.dataset.line = item.line;
    pre.appendChild(marker);
    state.treeSitter.markers[file.id].push(marker);
  });
}

/**
 * Ensures Tree-sitter markers exist for a file when cached outline data is available.
 *
 * @param {Object} file File record.
 * @returns {void}
 */

function ensureTreeSitterMarkers(file) {
  const cache = state.treeSitter.cache[file.id];
  if (!cache || !cache.outline?.length) return;
  const markers = state.treeSitter.markers[file.id] || [];
  if (markers.length >= cache.outline.length) return;
  placeTreeSitterMarkers(file, cache.outline);
}

/**
 * Renders Tree-sitter panel status and detail sections for the active file.
 *
 * @param {string} [statusText] Optional status override text.
 * @returns {void}
 */

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
    const queueStatus = getTreeSitterQueueStatusText({ compact: false });
    if (queueStatus) status = queueStatus;
    else if (ts.error) status = ts.error;
    else if (!file) status = "No active file.";
    else if (!getTreeSitterLanguage(file)) status = "Tree-sitter not available for this file. Lightweight analysis is available.";
    else if (!outline.length && !includes.length) status = "Background parsing pending for this file.";
  }
  if (els.tsStatus) {
    els.tsStatus.textContent = status;
    els.tsStatus.classList.toggle("muted", !!status);
  }
  renderTreeSitterOutline(outline);
  renderTreeSitterIncludes(includes);
  renderTreeSitterErrorSummary();
  updateTreeSitterParseButtonLabel();
}

/**
 * Renders or clears the compact Tree-sitter error summary list in the panel.
 *
 * @returns {void}
 */

function renderTreeSitterErrorSummary() {
  if (!els.tsBody) return;
  const ts = state.treeSitter;
  let root = els.tsBody.querySelector(".ts-errors");
  if (!ts.errors.length) {
    if (root) root.remove();
    return;
  }
  if (!root) {
    root = doc.createElement("details");
    root.className = "ts-errors";
    els.tsBody.appendChild(root);
  }
  root.open = false;
  root.innerHTML = "";
  const summary = doc.createElement("summary");
  summary.textContent = `Errors (${ts.errors.length})`;
  root.appendChild(summary);
  const list = doc.createElement("ul");
  const recent = ts.errors.slice(-20);
  for (let i = 0; i < recent.length; i += 1) {
    const item = recent[i];
    const row = doc.createElement("li");
    row.textContent = `${item.path}: ${item.error}`;
    list.appendChild(row);
  }
  root.appendChild(list);
}

/**
 * Renders outline rows in the Tree-sitter panel for the active file.
 *
 * @param {Array<Object>} items Outline items.
 * @returns {void}
 */

function renderTreeSitterOutline(items) {
  if (!els.tsOutline) return;
  els.tsOutline.innerHTML = "";
  if (!items.length) {
    const empty = doc.createElement("div");
    empty.className = "ts-placeholder";
    empty.textContent = "No outline items.";
    els.tsOutline.appendChild(empty);
    return;
  }
  items.forEach(item => {
    const row = doc.createElement("button");
    row.className = "ts-row";
    row.type = "button";
    row.title = `${item.name} — line ${item.line}`;
    const kind = doc.createElement("span");
    kind.className = `ts-kind kind-${item.kind}`;
    kind.textContent = item.kind;
    const name = doc.createElement("span");
    name.className = "ts-name";
    name.textContent = item.name;
    const line = doc.createElement("span");
    line.className = "ts-line";
    line.textContent = `Line ${item.line}`;
    row.appendChild(kind);
    row.appendChild(name);
    row.appendChild(line);
    row.addEventListener("click", () => scrollToOutlineItem(item));
    els.tsOutline.appendChild(row);
  });
}

/**
 * Renders include/import entries in the Tree-sitter panel for the active file.
 *
 * @param {Array<Object>} items Include items.
 * @returns {void}
 */

function renderTreeSitterIncludes(items) {
  if (!els.tsIncludes) return;
  els.tsIncludes.innerHTML = "";
  if (!items.length) {
    const empty = doc.createElement("div");
    empty.className = "ts-placeholder";
    empty.textContent = "No includes.";
    els.tsIncludes.appendChild(empty);
    return;
  }
  items.forEach(item => {
    const row = doc.createElement("div");
    row.className = "ts-row include";
    const label = doc.createElement("span");
    label.className = "ts-name";
    label.textContent = item.raw;
    row.appendChild(label);
    if (item.targetFileId) {
      const jump = doc.createElement("button");
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

/**
 * Navigates the viewer to a selected outline entry, preferring marker anchors when available.
 *
 * @param {Object} item Outline item with file and line metadata.
 * @returns {void}
 */

function scrollToOutlineItem(item) {
  if (isFileHidden(item.fileId)) return;
  const section = getFileSection(item.fileId);
  if (section && section.tagName === "DETAILS") section.open = true;
  const marker = doc.getElementById(item.anchorId);
  if (marker) {
    marker.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveFile(item.fileId);
    return;
  }
  scrollToFileLine(item.fileId, item.line);
}

/**
 * Scrolls the viewer to a specific file line using line-index offsets with a geometry fallback.
 *
 * @param {string} fileId File identifier.
 * @param {number} line Target 1-based line number.
 * @param {ScrollBehavior} [behavior="smooth"] Scroll behavior.
 * @returns {void}
 */

function scrollToFileLine(fileId, line, behavior = "smooth") {
  if (isFileHidden(fileId)) return;
  const section = getFileSection(fileId);
  if (!section) return;
  const file = state.files.find(item => item.id === fileId);
  const safeLine = clampLineNumberForFile(file, line);
  if (!safeLine) return;
  if (section.tagName === "DETAILS") section.open = true;
  const pre = section.querySelector("pre");
  if (!pre) return;
  const code = section.querySelector("pre code");
  const header = section.querySelector(".file-header");
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const metrics = getLineMetricsInPre({
    doc,
    pre,
    code,
    file,
    lineNumber: safeLine
  });
  if (!metrics) return;
  const top = pre.getBoundingClientRect().top + window.scrollY + metrics.top;
  window.scrollTo({ top: Math.max(0, top - headerHeight - 16), behavior });
  setActiveFile(fileId);
}

  return {
    updateTreeSitterWindowUI,
    handleTreeButtonClick,
    openTreeSitterWindow,
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
    prioritizeFileInParseQueue,
    rebuildTreeSitterQueue,
    finalizeTreeSitterQueueAfterLoad,
    handleActiveFileChange,
    scrollToFileLine,
    renderTreeSitterPanel
  };
}
