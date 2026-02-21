export function createReferencesController(ctx) {
  const {
    state,
    els,
    createRefExtensionSet,
    normalizeProjectPath,
    recordInventoryPath,
    extractReferenceCandidates,
    resolveReferenceCandidate,
    buildLineStartOffsets,
    codeHighlighter,
    getFileSection,
    addLog,
    setActiveFile,
    navigateToFileLine,
    ensureFileVisible,
    createPreviewPanelWindow,
    copyTextToClipboard,
    buildMarkdownSnippet,
    updateControlBar,
    PREVIEW_INACTIVE_MS,
    REFS_BUILD_SLICE_BUDGET,
    REFS_MAX_TOKEN_LENGTH,
    REFS_MAX_OCCURRENCES_PER_TARGET,
    REFS_MAX_REFERENCING_FILES_SHOWN
  } = ctx;

function attachReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.refsDelegatesAttached === "true") return;
  els.fileContainer.addEventListener("click", handleReferenceTokenClick);
  els.fileContainer.addEventListener("keydown", handleReferenceTokenKeydown);
  els.fileContainer.dataset.refsDelegatesAttached = "true";
}

/**
 * Removes event delegates for file reference token interactions.
 *
 * @returns {void}
 */

function detachReferenceDelegates() {
  if (!els.fileContainer || els.fileContainer.dataset.refsDelegatesAttached !== "true") return;
  els.fileContainer.removeEventListener("click", handleReferenceTokenClick);
  els.fileContainer.removeEventListener("keydown", handleReferenceTokenKeydown);
  delete els.fileContainer.dataset.refsDelegatesAttached;
}

/**
 * Closes and clears the active file reference panel window.
 *
 * @returns {void}
 */

function destroyReferencePanel() {
  const win = state.refs.ui.activePanel;
  if (!win) return;
  state.refs.ui.activePanel = null;
  state.refs.ui.activeToken = null;
  win.destroy();
}

/**
 * Disposes the observer used to lazily decorate file reference tokens as sections enter view.
 *
 * @returns {void}
 */

function teardownReferenceObserver() {
  if (!state.refs.refsObserver) return;
  state.refs.refsObserver.disconnect();
  state.refs.refsObserver = null;
}

/**
 * Cancels any in-progress reference index build and clears pending build work.
 *
 * @returns {void}
 */

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

/**
 * Resets file reference state in preparation for loading a new project, honoring settings.
 *
 * @returns {void}
 */

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

/**
 * Marks a code block as decorated (or not) for file reference tokens to prevent redundant work.
 *
 * @param {HTMLElement} code Code element.
 * @param {boolean} value Whether decoration is complete.
 * @returns {void}
 */

function setReferenceDecorated(code, value) {
  if (!code) return;
  code.dataset.refsDecorated = value ? "true" : "false";
}

/**
 * Records a decoration failure for a file section to avoid repeated attempts and stabilize UX.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */

function markReferenceDecorationFailed(fileId) {
  if (!fileId) return;
  const section = getFileSection(fileId);
  const code = section?.querySelector?.("pre code");
  if (code) setReferenceDecorated(code, true);
  state.refs.decoratedFiles.add(fileId);
}

/**
 * Removes any rendered reference token wrappers from a code element and restores plain text.
 *
 * @param {HTMLElement} code Code element.
 * @returns {void}
 */

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

/**
 * Clears reference token decorations across all rendered files and resets decoration tracking.
 *
 * @returns {void}
 */

function clearAllReferenceDecorations() {
  const blocks = els.fileContainer ? els.fileContainer.querySelectorAll("pre code") : [];
  blocks.forEach(code => clearReferenceDecorationsInCode(code));
  state.refs.decoratedFiles.clear();
}

/**
 * Rebuilds the lookup map from normalized project paths to loaded file IDs for fast navigation.
 *
 * @returns {void}
 */

function rebuildPathToLoadedFileMap() {
  const map = new Map();
  state.files.forEach(file => {
    const canonical = normalizeProjectPath(file.path);
    if (canonical) map.set(canonical, file.id);
  });
  state.refs.pathToLoadedFileId = map;
}

/**
 * Records a project path into the reference inventory so candidates can be resolved later.
 *
 * @param {string} path Project-relative path.
 * @returns {void}
 */

function recordInventoryPathForRefs(path) {
  if (!path) return;
  recordInventoryPath(state.refs.inventory, path);
}

/**
 * Ensures the IntersectionObserver for lazy reference decoration exists and is configured.
 *
 * @returns {void}
 */

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

/**
 * Observes a file section so reference tokens can be decorated when it enters the viewport.
 *
 * @param {HTMLElement} section File section element.
 * @returns {void}
 */

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

/**
 * Begins observing all current file sections for lazy reference decoration.
 *
 * @returns {void}
 */

function observeAllReferenceSections() {
  if (!state.refs.enabled) return;
  const sections = els.fileContainer?.querySelectorAll?.(".file-section") || [];
  sections.forEach(section => observeReferenceSection(section));
}

/**
 * Converts reference occurrences into sorted non-overlapping character ranges for safe DOM wrapping.
 *
 * @param {Object} file File record.
 * @param {Array<Object>} occurrences Occurrence records for the file.
 * @returns {Array<{start:number,end:number,occurrence:Object}>} Non-overlapping ranges.
 */

function buildReferenceRangesForFile(file, occurrences) {
  if (!file || !occurrences?.length) return [];
  const lineOffsets = file.lineIndex?.offsets || buildLineStartOffsets(file.textFull || file.text || "");
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

/**
 * Collects text nodes under a code element with cumulative offsets to support range-based wrapping.
 *
 * @param {HTMLElement} code Code element.
 * @returns {Array<{node:Text,start:number,end:number}>} Text nodes with offsets.
 */

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

/**
 * Wraps a matching text segment in a reference token element that can be clicked or focused.
 *
 * @param {Text} node Text node to split and wrap.
 * @param {number} start Start offset within the text node.
 * @param {number} end End offset within the text node.
 * @param {Object} occurrence Resolved occurrence metadata.
 * @param {string} sourceFileId Source file identifier.
 * @returns {void}
 */

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

/**
 * Decorates a file section by wrapping detected reference-like substrings with interactive tokens.
 *
 * @param {string} fileId File identifier.
 * @returns {boolean} True when decoration is complete or not needed, false when it should be retried later.
 */

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

/**
 * Merges reference resolution statuses to maintain a conservative overall status for a target.
 *
 * @param {string|null} current Current status.
 * @param {string} next Next status to merge in.
 * @returns {string} Combined status.
 */

function updateReferenceTargetStatus(current, next) {
  if (!current) return next;
  if (current === next) return current;
  if (current === "ambiguous" || next === "ambiguous") return "ambiguous";
  if (current === "resolved" || next === "resolved") return "resolved";
  return "missing";
}

/**
 * Records a resolved reference occurrence into both per-source and per-target indexes.
 *
 * @param {Object} file Source file record.
 * @param {number} lineNumber 1-based line number of the occurrence.
 * @param {Object} candidate Extracted candidate token info.
 * @param {Object} resolution Resolution result for the candidate.
 * @returns {void}
 */

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

/**
 * Builds the project reference index in time slices to keep the UI responsive during indexing.
 *
 * @param {Object} run Mutable build run state.
 * @returns {void}
 */

function runReferenceIndexSlice(run) {
  if (!state.refs.enabled) return;
  if (run.id !== state.refs.build.runId) return;
  const start = performance.now();
  try {
    while (run.fileIndex < run.files.length) {
      if (run.id !== state.refs.build.runId) return;
      const file = run.files[run.fileIndex];
      if (!run.lines) {
        run.lines = (file.textFull || file.text || "").split("\n");
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

/**
 * Resets and schedules a full rebuild of the file reference index for the currently loaded project.
 *
 * @returns {void}
 */

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

/**
 * Applies the file reference enablement setting by wiring or unwiring handlers and indexing.
 *
 * @returns {void}
 */

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

/**
 * Returns the file reference panel window, creating it when necessary.
 *
 * @returns {PreviewWindow} Panel window instance.
 */

function ensureReferencePanelWindow() {
  const existing = state.refs.ui.activePanel;
  if (existing && existing.root?.isConnected) return existing;
  const win = createPreviewPanelWindow({
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

/**
 * Parses the dataset payload from a rendered reference token into a stable token data object.
 *
 * @param {HTMLElement} el Reference token element.
 * @returns {{raw:string, normalized:string, targetKey:string, status:string, resolvedPaths:string[]}|null} Token data.
 */

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

/**
 * Navigates to a resolved project path when the target exists among loaded files.
 *
 * @param {string} path Normalized project path.
 * @returns {boolean} True if navigation succeeded.
 */

function openResolvedReferencePath(path) {
  if (!path) return false;
  const fileId = state.refs.pathToLoadedFileId.get(path);
  if (!fileId) return false;
  location.hash = `#${fileId}`;
  setActiveFile(fileId);
  return true;
}

/**
 * Builds the UI content for the file reference panel, including resolution status and backlinks.
 *
 * @param {Object} tokenData Parsed token data.
 * @param {string} sourceFileId Source file initiating the panel.
 * @returns {HTMLElement} Panel content root node.
 */

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

/**
 * Opens the file reference panel anchored near the triggering element.
 *
 * @param {Element} anchorEl Element used for positioning the panel.
 * @param {Object} tokenData Parsed token data.
 * @param {string} sourceFileId Source file initiating the panel.
 * @returns {void}
 */

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

/**
 * Handles clicks on reference tokens to open the reference panel for the clicked token.
 *
 * @param {MouseEvent} event Click event.
 * @returns {void}
 */

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

/**
 * Handles keyboard activation on reference tokens to open the reference panel.
 *
 * @param {KeyboardEvent} event Keydown event.
 * @returns {void}
 */

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

  return {
    destroyReferencePanel,
    cancelReferenceIndexBuild,
    resetReferenceStateForLoad,
    rebuildPathToLoadedFileMap,
    recordInventoryPathForRefs,
    observeReferenceSection,
    scheduleReferenceIndexBuild,
    syncReferenceFeatureEnabled
  };
}
