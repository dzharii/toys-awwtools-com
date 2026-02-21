export function createSymbolController(ctx) {
  const {
    state,
    els,
    normalizeProjectPath,
    createEmptySymbolContribution,
    isConfigLikeFile,
    isSingleIdentifierText,
    extractIdentifierAtOffset,
    extractHeuristicSymbolsFromLine,
    symbolRefsBuildSliceBudget,
    symbolRefsIncrementalDebounceMs,
    symbolRefsIncrementalBatchSize,
    symbolRefsPanelRefreshDebounceMs,
    symbolRefsMaxOccurrencesPerSymbol,
    symbolRefsMaxReferenceFilesShown,
    symbolRefsMaxLinesPerFile,
    symbolRefsMinIdentifierLength,
    symbolRefsMinBridgeLength,
    previewInactiveMs,
    addLog,
    updateControlBar,
    startSearchRun,
    navigateToFileLine,
    createPreviewPanelWindow,
    attachHoverPreviewHandlers,
    copyTextToClipboard
  } = ctx;

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

/**
 * Cancels any in-progress symbol index build and clears pending build work.
 *
 * @returns {void}
 */

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

/**
 * Cancels any pending or running incremental symbol update work.
 *
 * @returns {void}
 */

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

/**
 * Closes and resets the symbol reference panel window and its UI bookkeeping.
 *
 * @returns {void}
 */

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

/**
 * Resets symbol reference state in preparation for loading a new project, honoring settings.
 *
 * @returns {void}
 */

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

/**
 * Attaches event delegates needed for symbol reference interactions within the file viewer.
 *
 * @returns {void}
 */

function attachSymbolReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.symbolRefsDelegatesAttached === "true") return;
  els.fileContainer.addEventListener("click", handleSymbolReferenceClick);
  els.fileContainer.dataset.symbolRefsDelegatesAttached = "true";
}

/**
 * Removes event delegates for symbol reference interactions.
 *
 * @returns {void}
 */

function detachSymbolReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.symbolRefsDelegatesAttached !== "true") return;
  els.fileContainer.removeEventListener("click", handleSymbolReferenceClick);
  delete els.fileContainer.dataset.symbolRefsDelegatesAttached;
}

/**
 * Returns the best available symbol contribution for a file, preferring Tree-sitter when present.
 *
 * @param {string} fileId File identifier.
 * @returns {Object|null} Contribution for the file, or null if none available.
 */

function getSymbolContributionForFile(fileId) {
  const treeContribution = state.symbolRefs.contributions.treeByFile.get(fileId);
  if (treeContribution) return treeContribution;
  return state.symbolRefs.contributions.heuristicByFile.get(fileId) || null;
}

/**
 * Refreshes the effective contribution map for a file so indexing uses the best available data.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */

function refreshEffectiveSymbolContribution(fileId) {
  const effective = getSymbolContributionForFile(fileId);
  if (effective) state.symbolRefs.contributions.effectiveByFile.set(fileId, effective);
  else state.symbolRefs.contributions.effectiveByFile.delete(fileId);
}

/**
 * Creates a new symbol index entry bucket used to accumulate definitions and references.
 *
 * @param {string} symbol Symbol text.
 * @returns {Object} Initialized symbol index entry.
 */

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

/**
 * Determines whether a weak "bridge" symbol should be ignored to reduce noisy cross-file linking.
 *
 * @param {string} symbol Symbol text.
 * @param {string} bridgeClass Bridge classification.
 * @param {Map<string, Set<string>>} weakFileMap Weak symbol to file-set map.
 * @param {Set<string>} treeDefinitionSymbols Symbols with Tree-sitter definitions.
 * @returns {boolean} True if the symbol should be skipped.
 */

function shouldSkipWeakBridgeSymbol(symbol, bridgeClass, weakFileMap, treeDefinitionSymbols) {
  if (bridgeClass !== "weak") return false;
  if (treeDefinitionSymbols.has(symbol)) return false;
  const files = weakFileMap.get(symbol);
  return !files || files.size < 2;
}

/**
 * Collects cross-file occurrence signals used to decide whether weak bridge symbols are meaningful.
 *
 * @param {Object} contribution Symbol contribution for a file.
 * @param {Map<string, Set<string>>} weakFileMap Weak symbol to file-set map.
 * @param {Set<string>} treeDefinitionSymbols Symbols with Tree-sitter definitions.
 * @returns {void}
 */

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

/**
 * Incorporates a single symbol occurrence into the aggregated project-wide symbol index.
 *
 * @param {Map<string, Object>} bySymbol Index map keyed by symbol.
 * @param {Object} contribution Contribution metadata for the originating file.
 * @param {Object} occurrence Occurrence record (definition or reference).
 * @returns {void}
 */

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
    if (entry.storedDetails < symbolRefsMaxOccurrencesPerSymbol) {
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
    refBucket.lineNumbers.length < symbolRefsMaxLinesPerFile
  ) {
    if (entry.storedDetails < symbolRefsMaxOccurrencesPerSymbol) {
      refBucket.lineNumbers.push(occurrence.lineNumber);
      entry.storedDetails += 1;
    } else {
      entry.truncated = true;
    }
  }
}

/**
 * Builds the project-wide symbol index in time slices, updating progress and UI as it advances.
 *
 * @param {Object} run Mutable rebuild run state.
 * @returns {void}
 */

function runSymbolIndexRebuildSlice(run) {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (run.id !== state.symbolRefs.build.runId) return;

  const start = performance.now();
  try {
    while (performance.now() - start <= symbolRefsBuildSliceBudget) {
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

/**
 * Starts a full rebuild of the project-wide symbol index from current effective contributions.
 *
 * @param {string} [reason="baseline"] Reason label for the rebuild.
 * @param {Function|null} [onComplete=null] Optional callback invoked when rebuild completes.
 * @returns {void}
 */

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

/**
 * Builds baseline per-file symbol contributions (heuristic-first) in slices to keep the UI responsive.
 *
 * @param {Object} run Mutable baseline run state.
 * @returns {void}
 */

function runSymbolBaselineSlice(run) {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (run.id !== state.symbolRefs.build.runId) return;

  const start = performance.now();
  try {
    while (run.fileIndex < run.files.length) {
      if (!run.file) {
        run.file = run.files[run.fileIndex];
        run.lines = (run.file.textFull || run.file.text || "").split("\n");
        run.lineIndex = 0;
        run.isConfigFile = isConfigLikeFile(run.file.path);
        run.contribution = createNormalizedSymbolContribution(run.file, null, "heuristic");
      }

      while (run.lineIndex < run.lines.length) {
        if (performance.now() - start > symbolRefsBuildSliceBudget) {
          state.symbolRefs.build.progress.processed = run.fileIndex;
          state.symbolRefs.build.pendingHandle = setTimeout(() => runSymbolBaselineSlice(run), 0);
          updateControlBar();
          return;
        }
        const lineNumber = run.lineIndex + 1;
        const matches = extractHeuristicSymbolsFromLine(run.lines[run.lineIndex], {
          lineNumber,
          isConfigFile: run.isConfigFile,
          minLength: symbolRefsMinIdentifierLength,
          minBridgeLength: symbolRefsMinBridgeLength
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

/**
 * Resets and schedules a baseline symbol analysis pass across all loaded files.
 *
 * @returns {void}
 */

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

/**
 * Schedules an incremental symbol contribution refresh for a file after it changes or is re-parsed.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */

function scheduleSymbolReferenceIncrementalUpdate(fileId) {
  if (!state.symbolRefs.enabled || !fileId || state.phase !== "loaded") return;
  const incremental = state.symbolRefs.incremental;
  incremental.pendingFileIds.add(fileId);
  if (incremental.debounceHandle) clearTimeout(incremental.debounceHandle);
  incremental.debounceHandle = setTimeout(() => {
    incremental.debounceHandle = null;
    incremental.batchHandle = setTimeout(runSymbolReferenceIncrementalBatch, 0);
  }, symbolRefsIncrementalDebounceMs);
}

/**
 * Processes a batch of pending incremental symbol updates and triggers an index rebuild as needed.
 *
 * @returns {void}
 */

function runSymbolReferenceIncrementalBatch() {
  const incremental = state.symbolRefs.incremental;
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return;
  if (state.symbolRefs.build.running) {
    incremental.batchHandle = setTimeout(runSymbolReferenceIncrementalBatch, 300);
    return;
  }

  const pending = [...incremental.pendingFileIds].slice(0, symbolRefsIncrementalBatchSize);
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

/**
 * Produces a compact status line describing symbol indexing progress for display in the control bar.
 *
 * @returns {string} Status text or empty string when not applicable.
 */

function getSymbolReferenceStatusText() {
  if (!state.symbolRefs.enabled || state.phase !== "loaded") return "";
  if (!state.symbolRefs.build.running) return "";
  const progress = state.symbolRefs.build.progress;
  const processed = Number.isFinite(progress.processed) ? progress.processed : 0;
  const total = Number.isFinite(progress.total) ? progress.total : 0;
  return `Indexing references • ${processed}/${total}`;
}

/**
 * Returns the symbol reference panel window, creating it when necessary.
 *
 * @returns {PreviewWindow} Panel window instance.
 */

function ensureSymbolReferencePanelWindow() {
  const existing = state.symbolRefs.ui.activePanel;
  if (existing && existing.root?.isConnected) return existing;
  const win = createPreviewPanelWindow({
    width: 460,
    height: 360,
    minWidth: 300,
    minHeight: 220,
    destroyAfterMs: previewInactiveMs
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

/**
 * Creates a standardized action button used inside the symbol reference panel.
 *
 * @param {string} label Button label text.
 * @param {string} className CSS class string.
 * @param {Function} onClick Click handler.
 * @returns {HTMLButtonElement} Button element.
 */

function createSymbolReferenceActionButton(label, className, onClick) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

/**
 * Opens the search panel pre-filled to search for a symbol across the project.
 *
 * @param {string} symbol Symbol to search for.
 * @returns {void}
 */

function openSearchForSymbol(symbol) {
  if (!symbol || !els.codeSearchQuery || !els.codeSearchPanel) return;
  els.codeSearchPanel.open = true;
  els.codeSearchQuery.value = symbol;
  if (els.codeSearchScope) els.codeSearchScope.value = "all";
  if (els.codeSearchMode) els.codeSearchMode.value = "text";
  if (els.codeSearchLive) els.codeSearchLive.checked = false;
  startSearchRun("explicit");
}

/**
 * Builds the full UI content for the symbol reference panel for a given symbol.
 *
 * @param {string} symbol Target symbol.
 * @param {string} sourceFileId File that initiated the request (for context).
 * @returns {HTMLElement} Panel content root node.
 */

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
    const visibleRows = referenceRows.slice(0, symbolRefsMaxReferenceFilesShown);
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

    if (referenceRows.length > symbolRefsMaxReferenceFilesShown) {
      const more = document.createElement("div");
      more.className = "symbol-ref-meta";
      more.textContent = `Showing first ${symbolRefsMaxReferenceFilesShown} files of ${referenceRows.length}.`;
      refsList.appendChild(more);
    }
  }

  if (entry?.truncated) {
    const trunc = document.createElement("div");
    trunc.className = "symbol-ref-meta";
    trunc.textContent = `Showing first ${symbolRefsMaxOccurrencesPerSymbol} detailed locations, total ${entry.totalOccurrences}.`;
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

/**
 * Opens the symbol reference panel anchored near the triggering element.
 *
 * @param {Element} anchorEl Element used for positioning the panel.
 * @param {string} symbol Target symbol.
 * @param {string} sourceFileId File that initiated the request.
 * @returns {void}
 */

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

/**
 * Debounces refresh of the active symbol reference panel to reflect the latest index version.
 *
 * @returns {void}
 */

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
  }, symbolRefsPanelRefreshDebounceMs);
}

/**
 * Computes the caret offset within a code block for a pointer event, enabling token extraction.
 *
 * @param {HTMLElement} code Code element containing text.
 * @param {MouseEvent|PointerEvent} event Event providing viewport coordinates.
 * @returns {number|null} Character offset within the code text, or null when unavailable.
 */

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

/**
 * Extracts a symbol from a click context, preferring an explicit selection when present.
 *
 * @param {MouseEvent|PointerEvent} event Click event.
 * @param {HTMLElement} code Code element.
 * @returns {string|null} Extracted symbol or null when none applies.
 */

function extractSymbolFromClick(event, code) {
  const selection = window.getSelection ? window.getSelection() : null;
  if (selection && !selection.isCollapsed) {
    const selected = isSingleIdentifierText(selection.toString(), {
      minLength: symbolRefsMinIdentifierLength
    });
    if (!selected) return null;
    return selected;
  }

  const offset = getCaretOffsetWithinCode(code, event);
  if (!Number.isFinite(offset)) return null;
  const token = extractIdentifierAtOffset(code.textContent || "", offset, {
    minLength: symbolRefsMinIdentifierLength
  });
  return token?.symbol || null;
}

/**
 * Handles clicks in code blocks to open the symbol reference panel for the clicked identifier.
 *
 * @param {MouseEvent} event Click event.
 * @returns {void}
 */

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

/**
 * Applies the symbol reference enablement setting by wiring or unwiring handlers and builds.
 *
 * @returns {void}
 */

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
  if (state.phase === "loaded") startSymbolIndexRebuild("toggle");
}

  return {
    destroySymbolReferencePanel,
    createNormalizedSymbolContribution,
    refreshEffectiveSymbolContribution,
    resetSymbolReferenceStateForLoad,
    scheduleSymbolReferenceBaselineBuild,
    scheduleSymbolReferenceIncrementalUpdate,
    startSymbolIndexRebuild,
    getSymbolReferenceStatusText,
    syncSymbolReferenceFeatureEnabled
  };
}
