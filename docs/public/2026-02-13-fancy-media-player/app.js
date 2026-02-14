const EXT_TO_MIME = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  m4v: "video/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  flac: "audio/flac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: 'audio/ogg; codecs="opus"',
  webm: "audio/webm",
  weba: "audio/webm",
  ogv: "video/ogg"
};

const DEFAULT_SETTINGS = {
  candidates: {
    allowedExtensions: ["mp3", "m4a", "aac", "flac", "wav", "ogg", "oga", "opus", "webm", "weba", "mp4", "m4v", "ogv"],
    ignoreFolderNames: [".git", "node_modules", "__MACOSX", ".DS_Store", "Thumbs.db"],
    minFileSizeBytes: 0
  },
  duplicates: {
    mode: "highlight",
    key: "filenameNoExt",
    playback: "playAll",
    representative: "firstEncountered"
  },
  view: {
    groupByFolder: true,
    defaultSort: "traversal",
    hideUnsupported: false,
    debugEnabled: false
  },
  playback: {
    autoAdvance: "nextPlayable",
    playbackRate: 1
  },
  metadata: {
    extraction: "basic",
    extractWhen: "onDemandVisible"
  },
  export: {
    copyPathsFormat: "relative",
    lineEndings: "lf"
  }
};

const APP_STATE = {
  EMPTY: "empty",
  SCANNING: "scanning",
  READY: "ready",
  PLAYING: "playing",
  PAUSED: "paused",
  ERROR: "error"
};

const ROW_HEIGHT = 30;
const WINDOW_OVERSCAN = 12;
const LOOKAHEAD_METADATA = 5;
const MAX_DURATION_PROBES = 2;
const MAX_METADATA_PROBES = 2;

const ui = {
  app: document.getElementById("app"),
  openFolder: document.getElementById("open-folder"),
  rescan: document.getElementById("rescan"),
  scanSpinner: document.getElementById("scan-spinner"),
  statusText: document.getElementById("status-text"),
  diagText: document.getElementById("diag-text"),
  selectionCount: document.getElementById("selection-count"),
  selectAll: document.getElementById("select-all"),
  clearSelection: document.getElementById("clear-selection"),
  copyPaths: document.getElementById("copy-paths"),
  copyNames: document.getElementById("copy-names"),
  playlistScroll: document.getElementById("playlist-scroll"),
  playlistSpacer: document.getElementById("playlist-spacer"),
  playlistWindow: document.getElementById("playlist-window"),
  errorBanner: document.getElementById("error-banner"),
  errorText: document.getElementById("error-text"),
  errorAction: document.getElementById("error-action"),
  errorDismiss: document.getElementById("error-dismiss"),
  trackTitle: document.getElementById("track-title"),
  trackPath: document.getElementById("track-path"),
  trackSize: document.getElementById("track-size"),
  trackDuration: document.getElementById("track-duration"),
  playerNote: document.getElementById("player-note"),
  trackArtwork: document.getElementById("track-artwork"),
  prevTrack: document.getElementById("prev-track"),
  playPause: document.getElementById("play-pause"),
  nextTrack: document.getElementById("next-track"),
  stopTrack: document.getElementById("stop-track"),
  playbackRate: document.getElementById("playback-rate"),
  currentTime: document.getElementById("current-time"),
  totalTime: document.getElementById("total-time"),
  seek: document.getElementById("seek"),
  muteToggle: document.getElementById("mute-toggle"),
  volume: document.getElementById("volume"),
  canvas: document.getElementById("viz-canvas"),
  toast: document.getElementById("toast"),
  fallback: document.getElementById("clipboard-fallback"),
  fallbackText: document.getElementById("fallback-text"),
  fallbackClose: document.getElementById("fallback-close"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsDrawer: document.getElementById("settings-drawer"),
  settingsClose: document.getElementById("settings-close"),
  extChips: document.getElementById("ext-chips"),
  ignoreFolders: document.getElementById("ignore-folders"),
  minSize: document.getElementById("min-size"),
  rescanNote: document.getElementById("rescan-note"),
  rescanInline: document.getElementById("rescan-inline"),
  dupMode: document.getElementById("dup-mode"),
  dupKey: document.getElementById("dup-key"),
  dupPlayback: document.getElementById("dup-playback"),
  dupRepresentative: document.getElementById("dup-representative"),
  groupByFolder: document.getElementById("group-by-folder"),
  hideUnsupported: document.getElementById("hide-unsupported"),
  defaultSort: document.getElementById("default-sort"),
  autoAdvance: document.getElementById("auto-advance"),
  metaExtraction: document.getElementById("meta-extraction"),
  metaWhen: document.getElementById("meta-when"),
  copyFormat: document.getElementById("copy-format"),
  lineEndings: document.getElementById("line-endings"),
  debugEnabled: document.getElementById("debug-enabled"),
  media: document.getElementById("media-element")
};

const canPlayAudioEl = document.createElement("audio");
const canPlayVideoEl = document.createElement("video");

const app = {
  state: APP_STATE.EMPTY,
  rootHandle: null,
  scanToken: 0,
  scanInProgress: false,
  needsRescan: false,
  scanStats: {
    indexed: 0,
    candidates: 0,
    playable: 0,
    errors: 0,
    unsupported: 0,
    skippedFolders: 0
  },
  allFiles: [],
  items: [],
  itemMap: new Map(),
  selectedIds: new Set(),
  focusedId: null,
  currentId: null,
  playingId: null,
  playedDuplicateKeys: new Set(),
  folderCollapsed: new Map(),
  duplicateCollapsed: new Map(),
  duplicateExpanded: new Set(),
  rows: [],
  playbackOrderIds: [],
  renderQueued: false,
  rowsVersion: 0,
  diagnostics: {
    scanYieldCount: 0,
    lastYieldMs: 0,
    rowCount: 0,
    fps: 0,
    spectrumBars: 96,
    oscSamples: 1024
  },
  settings: structuredClone(DEFAULT_SETTINGS),
  currentObjectUrl: null,
  lastError: null,
  toastTimer: 0,
  metadataWorker: null,
  metadataSeq: 0,
  metadataPending: [],
  metadataRunning: 0,
  metadataQueuedIds: new Set(),
  durationPending: [],
  durationRunning: 0,
  durationQueuedIds: new Set()
};

const viz = {
  ctx: null,
  dpr: 1,
  width: 0,
  height: 0,
  audioCtx: null,
  analyser: null,
  sourceNode: null,
  timeData: null,
  freqData: null,
  rafId: 0,
  running: false,
  lastFrameTs: 0,
  envSampleLastTs: 0,
  fpsEMA: 60,
  spectrumBars: 96,
  oscSamplesToDraw: 1024,
  gridEnabled: true,
  barToBin: [],
  peakHold: new Float32Array(128),
  peakHoldTime: new Float32Array(128),
  historyRateHz: 30,
  history: new Float32Array(600),
  historyWrite: 0,
  historyFilled: 0,
  lastMetrics: {
    rms: 0,
    peak: 0,
    clipped: false,
    centroidNorm: 0
  }
};

const durationProbeEl = document.createElement("audio");
durationProbeEl.preload = "metadata";

init();

function init() {
  bindEvents();
  syncSettingsUi();
  renderExtChips();
  drawIdleVisualization();
  updateAppState(APP_STATE.EMPTY);
  requestRender();
}

function bindEvents() {
  ui.openFolder.addEventListener("click", onOpenFolder);
  ui.rescan.addEventListener("click", onRescan);
  ui.rescanInline.addEventListener("click", onRescan);
  ui.selectAll.addEventListener("click", onSelectAll);
  ui.clearSelection.addEventListener("click", onClearSelection);
  ui.copyPaths.addEventListener("click", () => onCopy("paths"));
  ui.copyNames.addEventListener("click", () => onCopy("names"));
  ui.errorDismiss.addEventListener("click", dismissError);
  ui.errorAction.addEventListener("click", onOpenFolder);
  ui.fallbackClose.addEventListener("click", () => {
    ui.fallback.hidden = true;
  });

  ui.settingsToggle.addEventListener("click", () => toggleSettings(true));
  ui.settingsClose.addEventListener("click", () => toggleSettings(false));

  ui.playPause.addEventListener("click", onPlayPauseClick);
  ui.prevTrack.addEventListener("click", () => playRelative(-1));
  ui.nextTrack.addEventListener("click", () => playRelative(1));
  ui.stopTrack.addEventListener("click", stopPlayback);

  ui.playbackRate.addEventListener("change", () => {
    app.settings.playback.playbackRate = Number(ui.playbackRate.value);
    ui.media.playbackRate = app.settings.playback.playbackRate;
    requestRender();
  });

  ui.autoAdvance.addEventListener("change", () => {
    app.settings.playback.autoAdvance = ui.autoAdvance.value;
    requestRender();
  });

  ui.volume.addEventListener("input", () => {
    const v = Number(ui.volume.value);
    ui.media.volume = v;
    if (v > 0 && ui.media.muted) {
      ui.media.muted = false;
    }
    updateMuteUi();
  });

  ui.muteToggle.addEventListener("click", () => {
    ui.media.muted = !ui.media.muted;
    updateMuteUi();
  });

  ui.seek.addEventListener("input", () => {
    if (!Number.isFinite(ui.media.duration) || ui.media.duration <= 0) {
      return;
    }
    const t = (Number(ui.seek.value) / 1000) * ui.media.duration;
    ui.media.currentTime = t;
    clearEnvelope();
    updateTransportTime();
  });

  ui.media.addEventListener("timeupdate", () => {
    updateTransportTime();
  });

  ui.media.addEventListener("loadedmetadata", () => {
    onMediaLoadedMetadata();
  });

  ui.media.addEventListener("playing", () => {
    updateAppState(APP_STATE.PLAYING);
    app.playingId = app.currentId;
    rememberPlayedDuplicate(app.currentId);
    startVisualization();
    requestRender();
  });

  ui.media.addEventListener("pause", () => {
    if (app.state === APP_STATE.PLAYING && !ui.media.ended) {
      updateAppState(APP_STATE.PAUSED);
      stopVisualization();
      requestRender();
    }
  });

  ui.media.addEventListener("ended", async () => {
    await onTrackEnded();
  });

  ui.media.addEventListener("error", () => {
    if (app.currentId) {
      markItemError(app.currentId, "Playback failed.");
      showError("Playback failed for the current item.");
    }
    stopPlayback();
  });

  ui.playlistScroll.addEventListener("scroll", () => {
    renderWindow();
    scheduleVisibleTasks();
  });

  ui.playlistWindow.addEventListener("click", onPlaylistClick);
  ui.playlistWindow.addEventListener("dblclick", onPlaylistDoubleClick);
  ui.playlistScroll.addEventListener("keydown", onPlaylistKeyDown);

  ui.ignoreFolders.addEventListener("change", onSettingsChanged);
  ui.minSize.addEventListener("change", onSettingsChanged);
  ui.dupMode.addEventListener("change", onSettingsChanged);
  ui.dupKey.addEventListener("change", onSettingsChanged);
  ui.dupPlayback.addEventListener("change", onSettingsChanged);
  ui.dupRepresentative.addEventListener("change", onSettingsChanged);
  ui.groupByFolder.addEventListener("change", onSettingsChanged);
  ui.hideUnsupported.addEventListener("change", onSettingsChanged);
  ui.defaultSort.addEventListener("change", onSettingsChanged);
  ui.metaExtraction.addEventListener("change", onSettingsChanged);
  ui.metaWhen.addEventListener("change", onSettingsChanged);
  ui.copyFormat.addEventListener("change", onSettingsChanged);
  ui.lineEndings.addEventListener("change", onSettingsChanged);
  ui.debugEnabled.addEventListener("change", onSettingsChanged);

  document.querySelectorAll(".preset-size").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.minSize.value = String(btn.dataset.bytes || "0");
      onSettingsChanged();
    });
  });
}

function toggleSettings(open) {
  ui.settingsDrawer.classList.toggle("open", open);
  ui.settingsDrawer.setAttribute("aria-hidden", open ? "false" : "true");
}

function syncSettingsUi() {
  ui.ignoreFolders.value = app.settings.candidates.ignoreFolderNames.join(", ");
  ui.minSize.value = String(app.settings.candidates.minFileSizeBytes);
  ui.dupMode.value = app.settings.duplicates.mode;
  ui.dupKey.value = app.settings.duplicates.key;
  ui.dupPlayback.value = app.settings.duplicates.playback;
  ui.dupRepresentative.value = app.settings.duplicates.representative;
  ui.groupByFolder.checked = app.settings.view.groupByFolder;
  ui.hideUnsupported.checked = app.settings.view.hideUnsupported;
  ui.defaultSort.value = app.settings.view.defaultSort;
  ui.autoAdvance.value = app.settings.playback.autoAdvance;
  ui.playbackRate.value = String(app.settings.playback.playbackRate);
  ui.metaExtraction.value = app.settings.metadata.extraction;
  ui.metaWhen.value = app.settings.metadata.extractWhen;
  ui.copyFormat.value = app.settings.export.copyPathsFormat;
  ui.lineEndings.value = app.settings.export.lineEndings;
  ui.debugEnabled.checked = app.settings.view.debugEnabled;
  ui.media.playbackRate = app.settings.playback.playbackRate;
}

function renderExtChips() {
  const extPrefOrder = DEFAULT_SETTINGS.candidates.allowedExtensions;
  const selected = new Set(app.settings.candidates.allowedExtensions);
  ui.extChips.innerHTML = "";
  for (const ext of extPrefOrder) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip ${selected.has(ext) ? "" : "off"}`.trim();
    chip.textContent = ext;
    chip.addEventListener("click", () => {
      const list = new Set(app.settings.candidates.allowedExtensions);
      if (list.has(ext)) {
        list.delete(ext);
      } else {
        list.add(ext);
      }
      app.settings.candidates.allowedExtensions = extPrefOrder.filter((x) => list.has(x));
      renderExtChips();
      applySettingsToData({ reevalCandidates: true });
    });
    ui.extChips.appendChild(chip);
  }
}

function onSettingsChanged() {
  const oldIgnore = app.settings.candidates.ignoreFolderNames.join("|");

  app.settings.candidates.ignoreFolderNames = ui.ignoreFolders.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.settings.candidates.minFileSizeBytes = Math.max(0, Number(ui.minSize.value || "0") || 0);
  app.settings.duplicates.mode = ui.dupMode.value;
  app.settings.duplicates.key = ui.dupKey.value;
  app.settings.duplicates.playback = ui.dupPlayback.value;
  app.settings.duplicates.representative = ui.dupRepresentative.value;
  app.settings.view.groupByFolder = ui.groupByFolder.checked;
  app.settings.view.hideUnsupported = ui.hideUnsupported.checked;
  app.settings.view.defaultSort = ui.defaultSort.value;
  app.settings.playback.autoAdvance = ui.autoAdvance.value;
  app.settings.metadata.extraction = ui.metaExtraction.value;
  app.settings.metadata.extractWhen = ui.metaWhen.value;
  app.settings.export.copyPathsFormat = ui.copyFormat.value;
  app.settings.export.lineEndings = ui.lineEndings.value;
  app.settings.view.debugEnabled = ui.debugEnabled.checked;

  ui.media.playbackRate = app.settings.playback.playbackRate;

  const newIgnore = app.settings.candidates.ignoreFolderNames.join("|");
  if (oldIgnore !== newIgnore) {
    app.needsRescan = true;
  }

  applySettingsToData({ reevalCandidates: true });
}

function applySettingsToData({ reevalCandidates }) {
  if (reevalCandidates) {
    rebuildItemsFromAllFiles();
  }
  scheduleMetadataWork("settings");
  requestRender();
}

async function onOpenFolder() {
  dismissError();
  if (typeof window.showDirectoryPicker !== "function") {
    showError("Directory picker is not available in this browser.");
    return;
  }

  try {
    const handle = await window.showDirectoryPicker({ mode: "read" });
    await startScan(handle);
    ui.playlistScroll.focus();
  } catch (err) {
    if (err && err.name === "AbortError") {
      return;
    }
    showError(`Open folder failed: ${safeError(err)}`);
  }
}

async function onRescan() {
  if (!app.rootHandle) {
    return;
  }
  await startScan(app.rootHandle);
}

async function startScan(rootHandle) {
  app.scanToken += 1;
  const token = app.scanToken;
  app.rootHandle = rootHandle;
  app.scanInProgress = true;
  app.needsRescan = false;
  app.scanStats = {
    indexed: 0,
    candidates: 0,
    playable: 0,
    errors: 0,
    unsupported: 0,
    skippedFolders: 0
  };
  app.allFiles = [];
  app.items = [];
  app.itemMap.clear();
  app.selectedIds.clear();
  app.focusedId = null;
  app.currentId = null;
  app.playingId = null;
  app.playedDuplicateKeys.clear();
  app.folderCollapsed.clear();
  app.duplicateCollapsed.clear();
  app.duplicateExpanded.clear();
  clearDurationQueue();
  clearMetadataQueue();
  stopPlayback(true);
  updateAppState(APP_STATE.SCANNING);
  requestRender();

  const startedAt = performance.now();
  let processedSinceYield = 0;
  let lastYieldAt = performance.now();

  try {
    for await (const node of walkDirectory(rootHandle, "", token)) {
      if (token !== app.scanToken) {
        return;
      }
      if (node.kind !== "file") {
        continue;
      }

      app.scanStats.indexed += 1;
      app.allFiles.push(node);

      const prev = app.itemMap.get(node.relativePath) || null;
      const built = buildItemFromNode(node, prev);
      if (built) {
        app.items.push(built);
        app.itemMap.set(built.id, built);
        app.scanStats.candidates += 1;
        if (built.status === "playable" || built.status === "maybe") {
          app.scanStats.playable += 1;
        } else if (built.status === "unsupported") {
          app.scanStats.unsupported += 1;
        }
      }

      processedSinceYield += 1;
      const now = performance.now();
      if (processedSinceYield >= 200 || now - lastYieldAt >= 16) {
        processedSinceYield = 0;
        app.diagnostics.scanYieldCount += 1;
        app.diagnostics.lastYieldMs = now - lastYieldAt;
        lastYieldAt = now;
        requestRender();
        await tick();
      }
    }

    if (token !== app.scanToken) {
      return;
    }

    app.scanInProgress = false;
    updateAppState(APP_STATE.READY);
    requestRender();
    scheduleMetadataWork("scan-complete");
    showToast(`Indexed ${app.scanStats.indexed} files in ${Math.round(performance.now() - startedAt)} ms`);
  } catch (err) {
    app.scanInProgress = false;
    app.scanStats.errors += 1;
    updateAppState(APP_STATE.ERROR);
    showError(`Scan failed: ${safeError(err)}`);
    requestRender();
  }
}

async function* walkDirectory(dirHandle, prefix, token) {
  for await (const entry of dirHandle.values()) {
    if (token !== app.scanToken) {
      return;
    }

    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.kind === "directory") {
      if (shouldIgnoreFolderName(entry.name)) {
        app.scanStats.skippedFolders += 1;
        continue;
      }
      yield* walkDirectory(entry, rel, token);
      continue;
    }

    try {
      const file = await entry.getFile();
      const ext = getExt(file.name);
      yield {
        kind: "file",
        id: rel,
        relativePath: rel,
        fileName: file.name,
        folderPath: dirname(rel),
        fileSizeBytes: file.size,
        fileTypeHint: file.type || "",
        containerExtension: ext,
        handle: entry,
        traversalOrder: app.allFiles.length
      };
    } catch (err) {
      app.scanStats.errors += 1;
      showError(`Failed to read file: ${rel} (${safeError(err)})`);
    }
  }
}

function shouldIgnoreFolderName(name) {
  for (const rule of app.settings.candidates.ignoreFolderNames) {
    if (!rule) {
      continue;
    }
    if (rule.startsWith(".")) {
      if (name === rule) {
        return true;
      }
    } else if (name.toLowerCase() === rule.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function buildItemFromNode(node, previous) {
  const ext = node.containerExtension;
  const allowed = new Set(app.settings.candidates.allowedExtensions);
  if (!allowed.has(ext)) {
    return null;
  }
  if (node.fileSizeBytes < app.settings.candidates.minFileSizeBytes) {
    return null;
  }

  const mime = node.fileTypeHint || EXT_TO_MIME[ext] || "";
  const useVideo = mime.startsWith("video/");
  const playKind = useVideo ? "video" : "audio";
  const cp = canPlay(mime, playKind);
  const status = previous && previous.status === "error"
    ? "error"
    : previous && previous.status === "playable"
      ? "playable"
      : cp === "probably"
        ? "playable"
        : cp === "maybe"
          ? "maybe"
          : "unsupported";

  return {
    id: node.id,
    relativePath: node.relativePath,
    fileName: node.fileName,
    folderPath: node.folderPath,
    fileSizeBytes: node.fileSizeBytes,
    fileTypeHint: node.fileTypeHint,
    containerExtension: node.containerExtension,
    handle: node.handle,
    traversalOrder: node.traversalOrder,
    mime,
    useVideo,
    status,
    errorReason: previous?.errorReason || "",
    durationSec: previous?.durationSec ?? null,
    durationState: previous?.durationState || "idle",
    tags: previous?.tags || null,
    artworkDataUrl: previous?.artworkDataUrl || "",
    metadataState: previous?.metadataState || "idle",
    duplicateKey: "",
    duplicateCount: 1,
    displayName: previous?.displayName || fileNameNoExt(node.fileName),
    lastProbeAt: previous?.lastProbeAt || 0
  };
}

function rebuildItemsFromAllFiles() {
  const oldMap = app.itemMap;
  app.items = [];
  app.itemMap = new Map();
  app.scanStats.candidates = 0;
  app.scanStats.playable = 0;
  app.scanStats.unsupported = 0;

  for (const node of app.allFiles) {
    const prev = oldMap.get(node.id) || null;
    const item = buildItemFromNode(node, prev);
    if (!item) {
      continue;
    }
    app.items.push(item);
    app.itemMap.set(item.id, item);
    app.scanStats.candidates += 1;
    if (item.status === "playable" || item.status === "maybe") {
      app.scanStats.playable += 1;
    } else if (item.status === "unsupported") {
      app.scanStats.unsupported += 1;
    }
  }

  for (const id of [...app.selectedIds]) {
    if (!app.itemMap.has(id)) {
      app.selectedIds.delete(id);
    }
  }

  if (app.currentId && !app.itemMap.has(app.currentId)) {
    stopPlayback();
    app.currentId = null;
    app.playingId = null;
  }

  updateStatusText();
}

function updateAppState(next) {
  app.state = next;
  ui.app.dataset.state = next;
  updateStatusText();
}

function updateStatusText() {
  if (app.scanInProgress) {
    ui.statusText.textContent = `Scanning: ${app.scanStats.indexed} indexed, ${app.scanStats.candidates} candidates, ${app.scanStats.playable} playable, ${app.scanStats.errors} errors.`;
    ui.scanSpinner.hidden = false;
  } else if (app.items.length) {
    const unsupported = app.items.filter((x) => x.status === "unsupported").length;
    const errors = app.items.filter((x) => x.status === "error").length + app.scanStats.errors;
    const playable = app.items.filter((x) => x.status === "playable" || x.status === "maybe").length;
    ui.statusText.textContent = `Indexed: ${app.scanStats.indexed} files, Playable: ${playable}, Unsupported: ${unsupported}, Errors: ${errors}.`;
    ui.scanSpinner.hidden = true;
  } else {
    ui.statusText.textContent = "Open a folder to index audio files recursively. Files stay local.";
    ui.scanSpinner.hidden = true;
  }

  ui.rescan.hidden = !app.needsRescan || !app.rootHandle;
  ui.rescanNote.hidden = !app.needsRescan || !app.rootHandle;
}

function requestRender() {
  if (app.renderQueued) {
    return;
  }
  app.renderQueued = true;
  requestAnimationFrame(() => {
    app.renderQueued = false;
    render();
  });
}

function render() {
  updateStatusText();
  const derived = buildRowsAndOrder();
  app.rows = derived.rows;
  app.playbackOrderIds = derived.playbackOrderIds;
  app.diagnostics.rowCount = app.rows.length;
  ui.playlistSpacer.style.height = `${app.rows.length * ROW_HEIGHT}px`;
  renderWindow();
  renderTopControls();
  renderPlayerHeader();
  renderTransportButtons();
  renderDiagnostics();
  scheduleVisibleTasks();
}

function renderDiagnostics() {
  const show = app.settings.view.debugEnabled;
  ui.diagText.hidden = !show;
  if (!show) {
    return;
  }
  ui.diagText.textContent = `diag yields=${app.diagnostics.scanYieldCount} yms=${app.diagnostics.lastYieldMs.toFixed(1)} rows=${app.diagnostics.rowCount} fps=${app.diagnostics.fps.toFixed(1)} bars=${app.diagnostics.spectrumBars} osc=${app.diagnostics.oscSamples}`;
}

function buildRowsAndOrder() {
  const items = [...app.items];
  applyDuplicateKeys(items);

  let working = items;
  if (app.settings.view.hideUnsupported) {
    working = working.filter((it) => it.status !== "unsupported" && it.status !== "error");
  }

  working = sortItems(working, app.settings.view.defaultSort);

  if (app.settings.duplicates.mode === "hide") {
    working = applyHiddenDuplicates(working);
  }

  const playbackOrderIds = working.map((it) => it.id);
  const rows = [];

  if (app.settings.duplicates.mode === "group") {
    const groups = groupByDuplicate(working);
    for (const [key, group] of groups) {
      if (group.length > 1) {
        const collapsed = app.duplicateCollapsed.get(key) === true;
        rows.push({
          type: "dup-group",
          key,
          count: group.length,
          displayName: displayNameForItem(group[0]),
          collapsed
        });
        if (collapsed) {
          continue;
        }
      }
      for (const item of group) {
        rows.push({ type: "item", id: item.id });
      }
    }
    return { rows, playbackOrderIds };
  }

  const useFolderGroups = app.settings.view.groupByFolder && app.settings.duplicates.mode !== "group" && app.settings.duplicates.mode !== "hide";

  if (!useFolderGroups) {
    for (const item of working) {
      rows.push({ type: "item", id: item.id });
    }
    return { rows, playbackOrderIds };
  }

  const byFolder = new Map();
  for (const item of working) {
    const key = item.folderPath || ".";
    let arr = byFolder.get(key);
    if (!arr) {
      arr = [];
      byFolder.set(key, arr);
    }
    arr.push(item);
  }

  for (const [folder, arr] of byFolder) {
    const collapsed = app.folderCollapsed.get(folder) === true;
    rows.push({ type: "folder", folder, count: arr.length, collapsed });
    if (collapsed) {
      continue;
    }
    for (const item of arr) {
      rows.push({ type: "item", id: item.id });
    }
  }

  return { rows, playbackOrderIds };
}

function applyDuplicateKeys(items) {
  const groups = new Map();
  for (const item of items) {
    const key = duplicateKeyForItem(item);
    item.duplicateKey = key;
    let arr = groups.get(key);
    if (!arr) {
      arr = [];
      groups.set(key, arr);
    }
    arr.push(item);
  }
  for (const arr of groups.values()) {
    arr.sort((a, b) => a.traversalOrder - b.traversalOrder);
    for (const item of arr) {
      item.duplicateCount = arr.length;
    }
  }
}

function applyHiddenDuplicates(sorted) {
  const groups = groupByDuplicate(sorted);
  const out = [];
  for (const [key, arr] of groups) {
    if (arr.length <= 1) {
      out.push(arr[0]);
      continue;
    }
    const rep = selectDuplicateRepresentative(arr);
    out.push(rep);
    const expanded = app.duplicateExpanded.has(key);
    if (expanded) {
      for (const item of arr) {
        if (item.id !== rep.id) {
          out.push(item);
        }
      }
    }
  }
  return out;
}

function selectDuplicateRepresentative(group) {
  const mode = app.settings.duplicates.representative;
  if (mode === "firstEncountered") {
    return group[0];
  }
  if (mode === "preferredExtension") {
    const pref = app.settings.candidates.allowedExtensions;
    const rank = (ext) => {
      const idx = pref.indexOf(ext);
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };
    return [...group].sort((a, b) => rank(a.containerExtension) - rank(b.containerExtension) || a.traversalOrder - b.traversalOrder)[0];
  }
  if (mode === "shortestPath") {
    return [...group].sort((a, b) => a.relativePath.localeCompare(b.relativePath) || a.traversalOrder - b.traversalOrder)[0];
  }
  return group[0];
}

function groupByDuplicate(items) {
  const map = new Map();
  for (const item of items) {
    let arr = map.get(item.duplicateKey);
    if (!arr) {
      arr = [];
      map.set(item.duplicateKey, arr);
    }
    arr.push(item);
  }
  return map;
}

function sortItems(items, sortKey) {
  const out = [...items];
  const cmpName = (a, b) => fileNameNoExt(a.fileName).localeCompare(fileNameNoExt(b.fileName), "en", { sensitivity: "base" });

  if (sortKey === "traversal") {
    out.sort((a, b) => a.traversalOrder - b.traversalOrder);
    return out;
  }
  if (sortKey === "filename") {
    out.sort((a, b) => cmpName(a, b) || a.relativePath.localeCompare(b.relativePath));
    return out;
  }
  if (sortKey === "duration") {
    out.sort((a, b) => {
      const da = Number.isFinite(a.durationSec) ? a.durationSec : Number.MAX_SAFE_INTEGER;
      const db = Number.isFinite(b.durationSec) ? b.durationSec : Number.MAX_SAFE_INTEGER;
      return da - db || cmpName(a, b) || a.relativePath.localeCompare(b.relativePath);
    });
    return out;
  }
  if (sortKey === "size") {
    out.sort((a, b) => a.fileSizeBytes - b.fileSizeBytes || cmpName(a, b) || a.relativePath.localeCompare(b.relativePath));
    return out;
  }
  if (sortKey === "tagTitle") {
    out.sort((a, b) => {
      const ta = (a.tags?.title || fileNameNoExt(a.fileName)).toLowerCase();
      const tb = (b.tags?.title || fileNameNoExt(b.fileName)).toLowerCase();
      return ta.localeCompare(tb) || cmpName(a, b) || a.relativePath.localeCompare(b.relativePath);
    });
    return out;
  }
  return out;
}

function renderTopControls() {
  const anyItems = app.items.length > 0;
  ui.selectAll.disabled = !anyItems;
  ui.clearSelection.disabled = app.selectedIds.size === 0;
  ui.copyPaths.disabled = app.selectedIds.size === 0;
  ui.copyNames.disabled = app.selectedIds.size === 0;

  ui.selectionCount.hidden = app.selectedIds.size === 0;
  ui.selectionCount.textContent = `Selected: ${app.selectedIds.size}`;
}

function renderPlayerHeader() {
  const item = (app.currentId && app.itemMap.get(app.currentId)) || (app.focusedId && app.itemMap.get(app.focusedId)) || null;
  if (!item) {
    ui.trackTitle.textContent = "No track loaded";
    ui.trackPath.textContent = "--";
    ui.trackSize.textContent = "--";
    ui.trackDuration.textContent = "--:--";
    setPlayerNote("");
    ui.trackArtwork.hidden = true;
    return;
  }

  ui.trackTitle.textContent = displayNameForItem(item);
  ui.trackPath.textContent = middleEllipsis(item.relativePath, 80);
  ui.trackSize.textContent = humanSize(item.fileSizeBytes);
  ui.trackDuration.textContent = formatDuration(item.durationSec);

  if (item.artworkDataUrl && app.settings.metadata.extraction === "artwork") {
    ui.trackArtwork.src = item.artworkDataUrl;
    ui.trackArtwork.hidden = false;
  } else {
    ui.trackArtwork.hidden = true;
  }
}

function renderTransportButtons() {
  const hasCurrent = !!(app.currentId && app.itemMap.has(app.currentId));
  const playableCurrent = hasCurrent && isItemPlayable(app.itemMap.get(app.currentId));
  ui.playPause.disabled = !playableCurrent;
  ui.prevTrack.disabled = app.playbackOrderIds.length === 0;
  ui.nextTrack.disabled = app.playbackOrderIds.length === 0;
  ui.stopTrack.disabled = !hasCurrent;

  if (app.state === APP_STATE.PLAYING) {
    ui.playPause.textContent = "Pause";
  } else {
    ui.playPause.textContent = "Play";
  }
}

function renderWindow() {
  const rows = app.rows;
  const scrollTop = ui.playlistScroll.scrollTop;
  const viewportH = ui.playlistScroll.clientHeight;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - WINDOW_OVERSCAN);
  const end = Math.min(rows.length, Math.ceil((scrollTop + viewportH) / ROW_HEIGHT) + WINDOW_OVERSCAN);

  const frag = document.createDocumentFragment();
  for (let i = start; i < end; i += 1) {
    const row = rows[i];
    const el = buildRowElement(row, i);
    frag.appendChild(el);
  }

  ui.playlistWindow.textContent = "";
  ui.playlistWindow.appendChild(frag);
}

function buildRowElement(row, index) {
  const el = document.createElement("div");
  el.className = "row";
  el.style.top = `${index * ROW_HEIGHT}px`;
  el.style.height = `${ROW_HEIGHT}px`;

  if (row.type === "folder") {
    el.classList.add("row-folder", "playlist-grid");
    el.dataset.rowType = "folder";
    el.dataset.folder = row.folder;
    el.innerHTML = `
      <div class="cell col-check"></div>
      <div class="cell col-name"><span class="folder-toggle">${row.collapsed ? "[+]" : "[-]"}</span> ${escapeHtml(row.folder)}</div>
      <div class="cell col-folder">${row.count} items</div>
      <div class="cell col-duration"></div>
      <div class="cell col-size"></div>
      <div class="cell col-status">Folder</div>
    `;
    return el;
  }

  if (row.type === "dup-group") {
    el.classList.add("row-dup-group", "playlist-grid");
    el.dataset.rowType = "dup-group";
    el.dataset.dupKey = row.key;
    el.innerHTML = `
      <div class="cell col-check"></div>
      <div class="cell col-name"><span class="dup-toggle">${row.collapsed ? "[+]" : "[-]"}</span> ${escapeHtml(row.displayName)}</div>
      <div class="cell col-folder">${row.count} variants</div>
      <div class="cell col-duration"></div>
      <div class="cell col-size"></div>
      <div class="cell col-status">Duplicate group</div>
    `;
    return el;
  }

  const item = app.itemMap.get(row.id);
  if (!item) {
    return el;
  }

  el.classList.add("playlist-grid");
  el.dataset.rowType = "item";
  el.dataset.id = item.id;

  if (item.id === app.focusedId) {
    el.classList.add("row-focused");
  }
  if (item.id === app.playingId) {
    el.classList.add("row-playing");
  }
  if (app.selectedIds.has(item.id)) {
    el.classList.add("row-selected");
  }
  if (!isItemPlayable(item)) {
    el.classList.add("row-disabled");
  }
  if (item.status === "error") {
    el.classList.add("row-error");
  }

  const hideMode = app.settings.duplicates.mode === "hide";
  const showHidden = hideMode && item.duplicateCount > 1 && !app.duplicateExpanded.has(item.duplicateKey);
  const hiddenN = item.duplicateCount - 1;

  const nameMain = displayNameForItem(item);
  const nameSub = app.settings.view.groupByFolder ? (item.tags?.artist || "") : item.folderPath || ".";

  el.innerHTML = `
    <div class="cell col-check"><input class="row-check" type="checkbox" ${app.selectedIds.has(item.id) ? "checked" : ""}></div>
    <div class="cell col-name">
      <span class="item-name-main">${escapeHtml(nameMain)}</span>
      <span class="item-name-sub">${escapeHtml(nameSub)}</span>
      ${showHidden && hiddenN > 0 ? `<span class="item-name-sub">+${hiddenN} hidden duplicates <button class="link-btn dup-show" data-dup="${escapeHtml(item.duplicateKey)}">Show</button></span>` : ""}
    </div>
    <div class="cell col-folder">${escapeHtml(item.folderPath || ".")}</div>
    <div class="cell cell-duration">${formatDuration(item.durationSec)}</div>
    <div class="cell cell-size">${humanSize(item.fileSizeBytes)}</div>
    <div class="cell col-status ${statusClass(item.status)}">${statusLabel(item.status)}${app.settings.duplicates.mode === "highlight" && item.duplicateCount > 1 ? ` <span class="status-dup">dup ${item.duplicateCount}</span>` : ""}</div>
  `;

  return el;
}

function onPlaylistClick(event) {
  const rowEl = event.target.closest(".row");
  if (!rowEl) {
    return;
  }

  if (event.target.closest(".dup-show")) {
    const key = event.target.closest(".dup-show").dataset.dup;
    if (key) {
      app.duplicateExpanded.add(key);
      requestRender();
    }
    return;
  }

  const type = rowEl.dataset.rowType;
  if (type === "folder") {
    const folder = rowEl.dataset.folder;
    if (!folder) {
      return;
    }
    app.folderCollapsed.set(folder, !(app.folderCollapsed.get(folder) === true));
    requestRender();
    return;
  }

  if (type === "dup-group") {
    const key = rowEl.dataset.dupKey;
    if (!key) {
      return;
    }
    app.duplicateCollapsed.set(key, !(app.duplicateCollapsed.get(key) === true));
    requestRender();
    return;
  }

  if (type !== "item") {
    return;
  }

  const id = rowEl.dataset.id;
  if (!id) {
    return;
  }

  if (event.target.classList.contains("row-check")) {
    toggleSelected(id);
    return;
  }

  setFocused(id, true);
}

async function onPlaylistDoubleClick(event) {
  const rowEl = event.target.closest('.row[data-row-type="item"]');
  if (!rowEl) {
    return;
  }
  const id = rowEl.dataset.id;
  if (!id) {
    return;
  }
  await playItemById(id, {
    manual: true,
    forceDuplicateOverride: event.altKey || event.ctrlKey
  });
}

function onPlaylistKeyDown(event) {
  const ids = app.rows.filter((r) => r.type === "item").map((r) => r.id);
  if (ids.length === 0) {
    return;
  }

  if (!app.focusedId || !app.itemMap.has(app.focusedId)) {
    setFocused(ids[0], false);
    return;
  }

  const idx = ids.indexOf(app.focusedId);
  const pageStep = Math.max(1, Math.floor(ui.playlistScroll.clientHeight / ROW_HEIGHT) - 1);

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const next = ids[Math.min(ids.length - 1, idx + 1)];
    setFocused(next, true);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    const prev = ids[Math.max(0, idx - 1)];
    setFocused(prev, true);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    const next = ids[Math.min(ids.length - 1, idx + pageStep)];
    setFocused(next, true);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    const prev = ids[Math.max(0, idx - pageStep)];
    setFocused(prev, true);
  } else if (event.key === "Enter") {
    event.preventDefault();
    playItemById(app.focusedId, { manual: true, forceDuplicateOverride: false });
  } else if (event.key === " ") {
    event.preventDefault();
    if (app.currentId) {
      onPlayPauseClick();
    } else {
      playItemById(app.focusedId, { manual: true, forceDuplicateOverride: false });
    }
  }
}

function setFocused(id, scrollIntoView) {
  app.focusedId = id;
  if (scrollIntoView) {
    scrollRowIntoView(id);
  }
  requestRender();
}

function scrollRowIntoView(id) {
  const idx = app.rows.findIndex((r) => r.type === "item" && r.id === id);
  if (idx < 0) {
    return;
  }
  const top = idx * ROW_HEIGHT;
  const bottom = top + ROW_HEIGHT;
  const viewTop = ui.playlistScroll.scrollTop;
  const viewBottom = viewTop + ui.playlistScroll.clientHeight;
  if (top < viewTop) {
    ui.playlistScroll.scrollTop = top;
  } else if (bottom > viewBottom) {
    ui.playlistScroll.scrollTop = bottom - ui.playlistScroll.clientHeight;
  }
}

function onSelectAll() {
  for (const item of app.items) {
    app.selectedIds.add(item.id);
  }
  requestRender();
}

function onClearSelection() {
  app.selectedIds.clear();
  requestRender();
}

function toggleSelected(id) {
  if (app.selectedIds.has(id)) {
    app.selectedIds.delete(id);
  } else {
    app.selectedIds.add(id);
  }
  requestRender();
}

function onCopy(mode) {
  const items = getSelectedItemsInOrder();
  if (items.length === 0) {
    return;
  }

  let lines;
  if (mode === "paths") {
    lines = items.map((item) => app.settings.export.copyPathsFormat === "relativeQuoted" ? quotePath(item.relativePath) : item.relativePath);
  } else {
    lines = items.map((item) => item.fileName);
  }

  const text = formatLines(lines, app.settings.export.lineEndings);
  navigator.clipboard.writeText(text)
    .then(() => {
      const detail = mode === "paths"
        ? app.settings.export.copyPathsFormat === "relativeQuoted" ? "relative paths (quoted)" : "relative paths"
        : "filenames";
      showToast(`Copied ${items.length} ${detail}`);
    })
    .catch((err) => {
      showError(`Clipboard write failed: ${safeError(err)}`);
      ui.fallback.hidden = false;
      ui.fallbackText.value = text;
      ui.fallbackText.focus();
      ui.fallbackText.select();
    });
}

function getSelectedItemsInOrder() {
  const ordered = [];
  const seen = new Set();
  for (const id of app.playbackOrderIds) {
    const item = app.itemMap.get(id);
    if (item) {
      ordered.push(item);
      seen.add(id);
    }
  }
  for (const item of app.items) {
    if (!seen.has(item.id)) {
      ordered.push(item);
      seen.add(item.id);
    }
  }
  return ordered.filter((item) => app.selectedIds.has(item.id));
}

function formatLines(lines, endings) {
  const sep = endings === "crlf" ? "\r\n" : "\n";
  return lines.join(sep);
}

function quotePath(path) {
  return `"${String(path).replaceAll('"', '\\"')}"`;
}

async function onPlayPauseClick() {
  if (!app.currentId) {
    if (app.focusedId) {
      await playItemById(app.focusedId, { manual: true, forceDuplicateOverride: false });
    }
    return;
  }
  if (ui.media.paused) {
    try {
      await ensureAudioContext();
      await ui.media.play();
    } catch (err) {
      showError(`Play failed: ${safeError(err)}`);
    }
  } else {
    ui.media.pause();
  }
}

async function playRelative(delta) {
  if (app.playbackOrderIds.length === 0) {
    return;
  }
  let pivot = app.currentId;
  if (!pivot || !app.playbackOrderIds.includes(pivot)) {
    pivot = app.playbackOrderIds[0];
  }

  const start = app.playbackOrderIds.indexOf(pivot);
  for (let step = 1; step <= app.playbackOrderIds.length; step += 1) {
    const idx = (start + (delta > 0 ? step : -step) + app.playbackOrderIds.length) % app.playbackOrderIds.length;
    const id = app.playbackOrderIds[idx];
    const item = app.itemMap.get(id);
    if (item && isItemPlayable(item)) {
      await playItemById(id, { manual: true, forceDuplicateOverride: false });
      return;
    }
  }
}

async function playItemById(id, options) {
  const item = app.itemMap.get(id);
  if (!item) {
    return;
  }
  setFocused(id, false);
  app.currentId = id;

  if (!isItemPlayable(item)) {
    return;
  }

  const duplicateCheck = shouldSkipDuplicate(item, options.manual, options.forceDuplicateOverride);
  if (duplicateCheck.skip) {
    if (duplicateCheck.message) {
      setPlayerNote(duplicateCheck.message);
      showToast(duplicateCheck.message);
    }
    return;
  }

  if (item.status === "maybe") {
    const ok = await definitiveProbe(item);
    if (!ok) {
      item.status = "unsupported";
      requestRender();
      return;
    }
    item.status = "playable";
  }

  try {
    const file = await item.handle.getFile();
    const url = URL.createObjectURL(file);

    if (app.currentObjectUrl) {
      URL.revokeObjectURL(app.currentObjectUrl);
    }
    app.currentObjectUrl = url;

    await ensureAudioContext();
    attachAudioGraph();
    clearEnvelope();
    viz.peakHold.fill(0);
    viz.peakHoldTime.fill(0);
    setPlayerNote("");

    ui.media.src = url;
    ui.media.playbackRate = app.settings.playback.playbackRate;
    await ui.media.play();

    app.currentId = item.id;
    app.playingId = item.id;
    updateAppState(APP_STATE.PLAYING);
    enqueueDurationProbe(item.id, true);
    scheduleMetadataWork("play");
    publishMediaSession(item);
    requestRender();
  } catch (err) {
    markItemError(item.id, `Play failed: ${safeError(err)}`);
    showError(`Play failed for ${item.relativePath}: ${safeError(err)}`);
    stopPlayback();
  }
}

function shouldSkipDuplicate(item, manual, forceDuplicateOverride) {
  const mode = app.settings.duplicates.playback;
  if (mode === "playAll") {
    return { skip: false, message: "" };
  }
  const played = item.duplicateKey && app.playedDuplicateKeys.has(item.duplicateKey);
  if (!played) {
    return { skip: false, message: "" };
  }

  if (mode === "skipAfterFirstPlay") {
    if (!manual) {
      return { skip: true, message: "Duplicate skipped by rule." };
    }
    return { skip: false, message: "" };
  }

  if (mode === "skipAlways") {
    if (manual && forceDuplicateOverride) {
      return { skip: false, message: "" };
    }
    return {
      skip: true,
      message: manual
        ? "Duplicate skipped by rule. Hold Alt and double-click to force play."
        : "Duplicate skipped by rule."
    };
  }

  return { skip: false, message: "" };
}

async function definitiveProbe(item) {
  let file;
  try {
    file = await item.handle.getFile();
  } catch (err) {
    markItemError(item.id, `Probe read failed: ${safeError(err)}`);
    return false;
  }

  const probeEl = item.useVideo ? document.createElement("video") : document.createElement("audio");
  probeEl.preload = "metadata";
  const url = URL.createObjectURL(file);

  try {
    const ok = await new Promise((resolve) => {
      let done = false;
      const finish = (val) => {
        if (done) {
          return;
        }
        done = true;
        probeEl.removeAttribute("src");
        probeEl.load();
        URL.revokeObjectURL(url);
        resolve(val);
      };
      const timer = setTimeout(() => finish(false), 6000);
      probeEl.onloadedmetadata = () => {
        clearTimeout(timer);
        finish(true);
      };
      probeEl.onerror = () => {
        clearTimeout(timer);
        finish(false);
      };
      probeEl.src = url;
    });
    return ok;
  } catch (err) {
    URL.revokeObjectURL(url);
    markItemError(item.id, `Probe failed: ${safeError(err)}`);
    return false;
  }
}

function stopPlayback(silent = false) {
  ui.media.pause();
  try {
    ui.media.currentTime = 0;
  } catch {
    // no-op
  }

  if (app.currentObjectUrl) {
    URL.revokeObjectURL(app.currentObjectUrl);
    app.currentObjectUrl = null;
  }

  if (!silent) {
    updateAppState(APP_STATE.READY);
  }
  app.playingId = null;
  setPlayerNote("");
  stopVisualization();
  updateTransportTime();
  requestRender();
}

async function onTrackEnded() {
  if (app.settings.playback.autoAdvance === "loopTrack") {
    ui.media.currentTime = 0;
    try {
      await ui.media.play();
    } catch (err) {
      showError(`Loop failed: ${safeError(err)}`);
    }
    return;
  }

  if (app.settings.playback.autoAdvance === "stopAtEnd") {
    updateAppState(APP_STATE.READY);
    app.playingId = null;
    stopVisualization();
    requestRender();
    return;
  }

  const nextId = findNextPlayableId(app.currentId);
  if (!nextId) {
    updateAppState(APP_STATE.READY);
    app.playingId = null;
    stopVisualization();
    requestRender();
    return;
  }

  await playItemById(nextId, { manual: false, forceDuplicateOverride: false });
}

function findNextPlayableId(currentId) {
  const order = app.playbackOrderIds;
  if (!currentId || order.length === 0) {
    return null;
  }
  const start = order.indexOf(currentId);
  if (start < 0) {
    return null;
  }

  for (let i = start + 1; i < order.length; i += 1) {
    const item = app.itemMap.get(order[i]);
    if (!item || !isItemPlayable(item)) {
      continue;
    }
    const d = shouldSkipDuplicate(item, false, false);
    if (!d.skip) {
      return item.id;
    }
  }
  return null;
}

function rememberPlayedDuplicate(id) {
  const item = id ? app.itemMap.get(id) : null;
  if (!item || !item.duplicateKey) {
    return;
  }
  app.playedDuplicateKeys.add(item.duplicateKey);
}

function updateTransportTime() {
  const cur = Number.isFinite(ui.media.currentTime) ? ui.media.currentTime : 0;
  const total = Number.isFinite(ui.media.duration) ? ui.media.duration : null;
  ui.currentTime.textContent = formatDuration(cur);
  ui.totalTime.textContent = formatDuration(total);
  ui.trackDuration.textContent = formatDuration(total);

  if (total && total > 0) {
    ui.seek.disabled = false;
    ui.seek.value = String(Math.round((cur / total) * 1000));
  } else {
    ui.seek.disabled = true;
    ui.seek.value = "0";
  }
}

function onMediaLoadedMetadata() {
  updateTransportTime();
  const item = app.currentId ? app.itemMap.get(app.currentId) : null;
  if (item && Number.isFinite(ui.media.duration) && ui.media.duration > 0) {
    item.durationSec = ui.media.duration;
    item.durationState = "done";
  }
  requestRender();
}

function updateMuteUi() {
  ui.muteToggle.textContent = ui.media.muted ? "Unmute" : "Mute";
}

function isItemPlayable(item) {
  return item.status === "playable" || item.status === "maybe";
}

function markItemError(id, reason) {
  const item = app.itemMap.get(id);
  if (!item) {
    return;
  }
  item.status = "error";
  item.errorReason = reason;
  app.scanStats.errors += 1;
  requestRender();
}

function showError(message, actionLabel = "") {
  app.lastError = message;
  ui.errorText.textContent = message;
  ui.errorBanner.hidden = false;
  if (actionLabel) {
    ui.errorAction.hidden = false;
    ui.errorAction.textContent = actionLabel;
  } else {
    ui.errorAction.hidden = true;
  }
  if (app.state !== APP_STATE.SCANNING) {
    updateAppState(APP_STATE.ERROR);
  }
}

function dismissError() {
  ui.errorBanner.hidden = true;
  app.lastError = null;
  if (!app.scanInProgress && app.state === APP_STATE.ERROR) {
    updateAppState(app.items.length ? APP_STATE.READY : APP_STATE.EMPTY);
  }
}

function showToast(message) {
  clearTimeout(app.toastTimer);
  ui.toast.textContent = message;
  ui.toast.hidden = false;
  app.toastTimer = window.setTimeout(() => {
    ui.toast.hidden = true;
  }, 2000);
}

function clearDurationQueue() {
  app.durationPending = [];
  app.durationRunning = 0;
  app.durationQueuedIds.clear();
}

function enqueueDurationProbe(id, immediate = false) {
  const item = app.itemMap.get(id);
  if (!item) {
    return;
  }
  if (item.durationState === "pending" || item.durationState === "done") {
    return;
  }
  if (app.durationQueuedIds.has(id)) {
    return;
  }

  app.durationQueuedIds.add(id);
  item.durationState = "pending";
  if (immediate) {
    app.durationPending.unshift(id);
  } else {
    app.durationPending.push(id);
  }
  pumpDurationQueue();
}

function pumpDurationQueue() {
  while (app.durationRunning < MAX_DURATION_PROBES && app.durationPending.length > 0) {
    const id = app.durationPending.shift();
    app.durationQueuedIds.delete(id);
    app.durationRunning += 1;
    probeDuration(id)
      .catch(() => {})
      .finally(() => {
        app.durationRunning -= 1;
        pumpDurationQueue();
      });
  }
}

async function probeDuration(id) {
  const item = app.itemMap.get(id);
  if (!item) {
    return;
  }

  let file;
  try {
    file = await item.handle.getFile();
  } catch (err) {
    item.durationState = "error";
    markItemError(id, `Duration read failed: ${safeError(err)}`);
    return;
  }

  const url = URL.createObjectURL(file);
  try {
    const duration = await new Promise((resolve, reject) => {
      let done = false;
      const finish = (ok, value) => {
        if (done) {
          return;
        }
        done = true;
        durationProbeEl.onloadedmetadata = null;
        durationProbeEl.onerror = null;
        durationProbeEl.removeAttribute("src");
        durationProbeEl.load();
        URL.revokeObjectURL(url);
        if (ok) {
          resolve(value);
        } else {
          reject(new Error("metadata load failed"));
        }
      };
      const timer = setTimeout(() => finish(false, 0), 7000);
      durationProbeEl.onloadedmetadata = () => {
        clearTimeout(timer);
        finish(true, durationProbeEl.duration);
      };
      durationProbeEl.onerror = () => {
        clearTimeout(timer);
        finish(false, 0);
      };
      durationProbeEl.src = url;
    });
    if (Number.isFinite(duration) && duration >= 0) {
      item.durationSec = duration;
      item.durationState = "done";
    } else {
      item.durationState = "error";
    }
  } catch {
    item.durationState = "error";
  }
  requestRender();
}

function clearMetadataQueue() {
  app.metadataPending = [];
  app.metadataRunning = 0;
  app.metadataQueuedIds.clear();
}

function ensureMetadataWorker() {
  if (app.metadataWorker) {
    return;
  }
  app.metadataWorker = new Worker("./metadata-worker.js", { type: "module" });
  app.metadataWorker.onmessage = onMetadataWorkerMessage;
}

function enqueueMetadata(id, immediate = false) {
  if (app.settings.metadata.extraction === "off") {
    return;
  }
  const item = app.itemMap.get(id);
  if (!item) {
    return;
  }
  if (item.metadataState === "done" || item.metadataState === "pending") {
    return;
  }
  if (app.metadataQueuedIds.has(id)) {
    return;
  }

  app.metadataQueuedIds.add(id);
  item.metadataState = "pending";
  if (immediate) {
    app.metadataPending.unshift(id);
  } else {
    app.metadataPending.push(id);
  }
  pumpMetadataQueue();
}

function pumpMetadataQueue() {
  if (app.settings.metadata.extraction === "off") {
    return;
  }
  ensureMetadataWorker();

  while (app.metadataRunning < MAX_METADATA_PROBES && app.metadataPending.length > 0) {
    const id = app.metadataPending.shift();
    app.metadataQueuedIds.delete(id);
    const item = app.itemMap.get(id);
    if (!item) {
      continue;
    }

    app.metadataRunning += 1;
    app.metadataSeq += 1;
    const seq = app.metadataSeq;
    item.metadataSeq = seq;

    item.handle.getFile()
      .then((file) => file.arrayBuffer())
      .then((buffer) => {
        if (!app.metadataWorker) {
          throw new Error("worker not available");
        }
        app.metadataWorker.postMessage({
          seq,
          id,
          extraction: app.settings.metadata.extraction,
          fileName: item.fileName,
          buffer
        }, [buffer]);
      })
      .catch((err) => {
        item.metadataState = "error";
        app.metadataRunning -= 1;
        showError(`Metadata parse failed for ${item.relativePath}: ${safeError(err)}`);
        pumpMetadataQueue();
        requestRender();
      });
  }
}

function onMetadataWorkerMessage(event) {
  const payload = event.data;
  const item = app.itemMap.get(payload.id);
  if (!item) {
    app.metadataRunning = Math.max(0, app.metadataRunning - 1);
    pumpMetadataQueue();
    return;
  }

  if (payload.error) {
    item.metadataState = "error";
  } else {
    item.tags = payload.tags || null;
    item.artworkDataUrl = payload.artworkDataUrl || "";
    item.displayName = payload.tags?.title ? payload.tags.artist ? `${payload.tags.title} - ${payload.tags.artist}` : payload.tags.title : fileNameNoExt(item.fileName);
    item.metadataState = "done";
  }

  app.metadataRunning = Math.max(0, app.metadataRunning - 1);
  pumpMetadataQueue();
  requestRender();
}

function scheduleMetadataWork(reason) {
  if (app.settings.metadata.extraction === "off") {
    return;
  }

  if (app.settings.metadata.extractWhen === "backgroundAll") {
    for (const item of app.items) {
      enqueueMetadata(item.id, false);
    }
    return;
  }

  if (app.settings.metadata.extractWhen === "onDemandVisible") {
    const visibleIds = getVisibleItemIdsFromWindow();
    for (const id of visibleIds) {
      enqueueMetadata(id, false);
    }
    if (app.currentId) {
      enqueueMetadata(app.currentId, true);
    }
    return;
  }

  if (app.settings.metadata.extractWhen === "nowPlayingPlusLookahead") {
    if (app.currentId) {
      enqueueMetadata(app.currentId, true);
      const idx = app.playbackOrderIds.indexOf(app.currentId);
      if (idx >= 0) {
        for (let i = idx + 1; i < Math.min(app.playbackOrderIds.length, idx + 1 + LOOKAHEAD_METADATA); i += 1) {
          const id = app.playbackOrderIds[i];
          enqueueMetadata(id, false);
        }
      }
    }
    if (reason === "settings") {
      const visibleIds = getVisibleItemIdsFromWindow();
      for (const id of visibleIds) {
        enqueueMetadata(id, false);
      }
    }
  }
}

function scheduleVisibleTasks() {
  const ids = getVisibleItemIdsFromWindow();
  for (const id of ids) {
    enqueueDurationProbe(id, false);
  }

  if (app.settings.metadata.extractWhen === "onDemandVisible") {
    for (const id of ids) {
      enqueueMetadata(id, false);
    }
  }
}

function getVisibleItemIdsFromWindow() {
  const scrollTop = ui.playlistScroll.scrollTop;
  const h = ui.playlistScroll.clientHeight;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT));
  const end = Math.min(app.rows.length, Math.ceil((scrollTop + h) / ROW_HEIGHT));
  const ids = [];
  for (let i = start; i < end; i += 1) {
    const row = app.rows[i];
    if (row && row.type === "item") {
      ids.push(row.id);
    }
  }
  return ids;
}

async function ensureAudioContext() {
  if (!viz.audioCtx) {
    viz.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (viz.audioCtx.state === "suspended") {
    await viz.audioCtx.resume();
  }
}

function attachAudioGraph() {
  if (!viz.audioCtx) {
    return;
  }
  if (!viz.analyser) {
    viz.analyser = viz.audioCtx.createAnalyser();
    viz.analyser.fftSize = 2048;
    viz.analyser.smoothingTimeConstant = 0.7;
    viz.timeData = new Uint8Array(viz.analyser.fftSize);
    viz.freqData = new Uint8Array(viz.analyser.frequencyBinCount);
  }
  if (!viz.sourceNode) {
    viz.sourceNode = viz.audioCtx.createMediaElementSource(ui.media);
    viz.sourceNode.connect(viz.analyser);
    viz.analyser.connect(viz.audioCtx.destination);
  }
}

function startVisualization() {
  if (!viz.analyser || viz.running) {
    return;
  }
  viz.running = true;
  viz.lastFrameTs = 0;
  viz.envSampleLastTs = 0;
  if (!viz.ctx) {
    viz.ctx = ui.canvas.getContext("2d", { alpha: false });
  }
  resizeCanvas();
  vizLoop();
}

function stopVisualization() {
  viz.running = false;
  if (viz.rafId) {
    cancelAnimationFrame(viz.rafId);
    viz.rafId = 0;
  }
}

function drawIdleVisualization() {
  if (!viz.ctx) {
    viz.ctx = ui.canvas.getContext("2d", { alpha: false });
  }
  resizeCanvas();
  const ctx = viz.ctx;
  ctx.fillStyle = "#091018";
  ctx.fillRect(0, 0, viz.width, viz.height);
  ctx.strokeStyle = "#1d2f43";
  ctx.lineWidth = 1;
  for (let y = 0; y < viz.height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(viz.width, y + 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = "#4a6f96";
  ctx.fillText("idle", 8, 16);
}

function vizLoop(ts = 0) {
  if (!viz.running || !viz.analyser) {
    return;
  }

  viz.rafId = requestAnimationFrame(vizLoop);
  resizeCanvas();

  if (viz.lastFrameTs > 0) {
    const dt = ts - viz.lastFrameTs;
    if (dt > 0) {
      const fps = 1000 / dt;
      viz.fpsEMA = viz.fpsEMA * 0.9 + fps * 0.1;
      app.diagnostics.fps = viz.fpsEMA;
      adjustVizComplexity(viz.fpsEMA);
    }
  }
  viz.lastFrameTs = ts;

  viz.analyser.getByteTimeDomainData(viz.timeData);
  viz.analyser.getByteFrequencyData(viz.freqData);

  const metrics = computeMetrics(viz.timeData, viz.freqData);
  viz.lastMetrics = metrics;

  if (viz.envSampleLastTs === 0 || ts - viz.envSampleLastTs >= 1000 / viz.historyRateHz) {
    viz.envSampleLastTs = ts;
    pushEnvelope(metrics.rms);
  }

  drawVisualization(metrics);
}

function computeMetrics(timeData, freqData) {
  let sumSq = 0;
  let peak = 0;
  for (let i = 0; i < timeData.length; i += 1) {
    const v = (timeData[i] - 128) / 128;
    const av = Math.abs(v);
    if (av > peak) {
      peak = av;
    }
    sumSq += v * v;
  }
  const rms = Math.sqrt(sumSq / timeData.length);

  let weighted = 0;
  let total = 0;
  for (let i = 0; i < freqData.length; i += 1) {
    const mag = freqData[i] / 255;
    weighted += i * mag;
    total += mag;
  }
  const centroidNorm = total > 0 ? (weighted / total) / freqData.length : 0;

  return {
    rms,
    peak,
    clipped: peak > 0.98,
    centroidNorm
  };
}

function pushEnvelope(v) {
  viz.history[viz.historyWrite] = v;
  viz.historyWrite = (viz.historyWrite + 1) % viz.history.length;
  viz.historyFilled = Math.min(viz.historyFilled + 1, viz.history.length);
}

function clearEnvelope() {
  viz.history.fill(0);
  viz.historyWrite = 0;
  viz.historyFilled = 0;
}

function drawVisualization(metrics) {
  const ctx = viz.ctx;
  const w = viz.width;
  const h = viz.height;

  const topH = Math.floor(h * 0.22);
  const midH = Math.floor(h * 0.42);
  const botH = h - topH - midH;

  ctx.fillStyle = "#091018";
  ctx.fillRect(0, 0, w, h);

  if (viz.gridEnabled) {
    ctx.strokeStyle = "#12293a";
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
  }

  drawEnvelopeBand(ctx, 0, 0, w, topH, metrics);
  drawOscBand(ctx, 0, topH, w, midH, metrics);
  drawSpectrumBand(ctx, 0, topH + midH, w, botH, metrics);

  drawPlayhead(ctx, w, h);
}

function drawEnvelopeBand(ctx, x, y, w, h, metrics) {
  const count = viz.historyFilled;
  if (count <= 1) {
    return;
  }

  ctx.strokeStyle = "#34c0ff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < count; i += 1) {
    const idx = (viz.historyWrite - count + i + viz.history.length) % viz.history.length;
    const v = viz.history[idx];
    const px = x + (i / (count - 1)) * w;
    const py = y + h - v * h;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  if (metrics.peak > 0.98) {
    ctx.strokeStyle = "#ff6c5b";
    ctx.beginPath();
    ctx.moveTo(x + w - 1, y);
    ctx.lineTo(x + w - 1, y + h);
    ctx.stroke();
  }
}

function drawOscBand(ctx, x, y, w, h, metrics) {
  const mid = y + h * 0.5;
  ctx.strokeStyle = "#2a465f";
  ctx.beginPath();
  ctx.moveTo(x, mid + 0.5);
  ctx.lineTo(x + w, mid + 0.5);
  ctx.stroke();

  const samples = Math.min(viz.oscSamplesToDraw, viz.timeData.length);
  const step = viz.timeData.length / samples;
  ctx.strokeStyle = metrics.clipped ? "#ff806d" : "#7cf5d5";
  ctx.lineWidth = 1;
  ctx.beginPath();

  let smoothY = mid;
  for (let i = 0; i < samples; i += 1) {
    const idx = Math.floor(i * step);
    const v = (viz.timeData[idx] - 128) / 128;
    const pyRaw = mid + v * (h * 0.42);
    smoothY = smoothY * 0.75 + pyRaw * 0.25;
    const px = x + (i / (samples - 1)) * w;
    if (i === 0) {
      ctx.moveTo(px, smoothY);
    } else {
      ctx.lineTo(px, smoothY);
    }
  }
  ctx.stroke();

  const peakY = h * 0.42 * metrics.peak;
  ctx.strokeStyle = "rgba(124,245,213,0.45)";
  ctx.beginPath();
  ctx.moveTo(x, mid - peakY);
  ctx.lineTo(x + w, mid - peakY);
  ctx.moveTo(x, mid + peakY);
  ctx.lineTo(x + w, mid + peakY);
  ctx.stroke();
}

function drawSpectrumBand(ctx, x, y, w, h, metrics) {
  const bars = viz.spectrumBars;
  if (!viz.barToBin.length || viz.barToBin.length !== bars) {
    rebuildBarMapping();
  }

  const barW = Math.max(1, Math.floor(w / bars));
  const now = performance.now();

  for (let i = 0; i < bars; i += 1) {
    const startBin = viz.barToBin[i];
    const endBin = i + 1 < bars ? viz.barToBin[i + 1] : viz.freqData.length;
    let max = 0;
    for (let b = startBin; b < endBin; b += 1) {
      const v = viz.freqData[b] / 255;
      if (v > max) {
        max = v;
      }
    }

    const bh = Math.max(1, Math.floor(max * h));
    const bx = x + i * barW;
    const by = y + h - bh;

    ctx.fillStyle = "#2ea4da";
    ctx.fillRect(bx, by, barW - 1, bh);

    const hold = viz.peakHold[i];
    const holdT = viz.peakHoldTime[i];
    if (max >= hold || now - holdT > 300) {
      viz.peakHold[i] = max;
      viz.peakHoldTime[i] = now;
    } else {
      viz.peakHold[i] *= 0.985;
    }

    const ph = Math.floor(viz.peakHold[i] * h);
    ctx.fillStyle = "#9eeeff";
    ctx.fillRect(bx, y + h - ph, barW - 1, 2);
  }

  const centroidX = x + Math.floor(metrics.centroidNorm * w);
  ctx.strokeStyle = "#ffd074";
  ctx.beginPath();
  ctx.moveTo(centroidX + 0.5, y);
  ctx.lineTo(centroidX + 0.5, y + h);
  ctx.stroke();

  if (metrics.clipped) {
    ctx.strokeStyle = "#ff6c5b";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
}

function drawPlayhead(ctx, w, h) {
  if (!Number.isFinite(ui.media.duration) || ui.media.duration <= 0) {
    return;
  }
  const ratio = Math.min(1, Math.max(0, ui.media.currentTime / ui.media.duration));
  const x = ratio * w;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(x + 0.5, 0);
  ctx.lineTo(x + 0.5, h);
  ctx.stroke();
}

function adjustVizComplexity(fps) {
  if (fps < 45) {
    if (viz.spectrumBars > 48) {
      viz.spectrumBars -= 16;
    } else if (viz.oscSamplesToDraw > 512) {
      viz.oscSamplesToDraw -= 128;
    } else if (viz.gridEnabled) {
      viz.gridEnabled = false;
    }
  } else if (fps > 56) {
    if (viz.spectrumBars < 96) {
      viz.spectrumBars += 8;
    }
    if (viz.oscSamplesToDraw < 1024) {
      viz.oscSamplesToDraw += 64;
    }
    if (!viz.gridEnabled) {
      viz.gridEnabled = true;
    }
  }
  viz.spectrumBars = Math.max(24, Math.min(128, viz.spectrumBars));
  viz.oscSamplesToDraw = Math.max(256, Math.min(2048, viz.oscSamplesToDraw));
  app.diagnostics.spectrumBars = viz.spectrumBars;
  app.diagnostics.oscSamples = viz.oscSamplesToDraw;
}

function rebuildBarMapping() {
  viz.barToBin = new Array(viz.spectrumBars);
  const bins = viz.freqData ? viz.freqData.length : 1024;
  for (let i = 0; i < viz.spectrumBars; i += 1) {
    const norm = i / viz.spectrumBars;
    const curved = Math.pow(norm, 1.8);
    viz.barToBin[i] = Math.floor(curved * (bins - 1));
  }
}

function resizeCanvas() {
  const rect = ui.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssW = Math.max(1, Math.floor(rect.width));
  const cssH = Math.max(1, Math.floor(rect.height));
  const pixelW = Math.max(1, Math.floor(cssW * dpr));
  const pixelH = Math.max(1, Math.floor(cssH * dpr));

  if (cssW === viz.width && cssH === viz.height && dpr === viz.dpr) {
    return;
  }
  viz.width = cssW;
  viz.height = cssH;
  viz.dpr = dpr;
  ui.canvas.width = pixelW;
  ui.canvas.height = pixelH;
  if (viz.ctx) {
    viz.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  clearEnvelope();
  rebuildBarMapping();
}

function setPlayerNote(text) {
  ui.playerNote.textContent = text;
  ui.playerNote.hidden = !text;
}

function publishMediaSession(item) {
  if (!("mediaSession" in navigator)) {
    return;
  }
  const title = item.tags?.title || fileNameNoExt(item.fileName);
  const artist = item.tags?.artist || "";
  const album = item.tags?.album || "";
  const artwork = item.artworkDataUrl ? [{ src: item.artworkDataUrl, sizes: "256x256", type: "image/jpeg" }] : [];
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist,
    album,
    artwork
  });
}

function duplicateKeyForItem(item) {
  const keyMode = app.settings.duplicates.key;
  const fn = item.fileName.toLowerCase();
  const noExt = fileNameNoExt(item.fileName).toLowerCase();

  if (keyMode === "filename") {
    return fn;
  }
  if (keyMode === "filenameNoExt") {
    return noExt;
  }
  if (keyMode === "normalizedName") {
    return normalizeDupName(noExt);
  }
  if (keyMode === "tagTitleArtist") {
    const title = item.tags?.title?.trim();
    const artist = item.tags?.artist?.trim();
    if (title && artist) {
      return `${collapseWhitespace(title).toLowerCase()}||${collapseWhitespace(artist).toLowerCase()}`;
    }
    return noExt;
  }
  return noExt;
}

function normalizeDupName(name) {
  return collapseWhitespace(name)
    .replace(/\s*\(\d{1,4}\)$/i, "")
    .replace(/\s*-?\s*copy$/i, "")
    .replace(/\s*-?\s*final$/i, "")
    .replace(/[\s_-]v\d{1,4}$/i, "")
    .trim();
}

function collapseWhitespace(s) {
  return s.replace(/\s+/g, " ").trim();
}

function canPlay(mime, kind) {
  const el = kind === "video" ? canPlayVideoEl : canPlayAudioEl;
  if (!mime) {
    return "";
  }
  return el.canPlayType(mime);
}

function getExt(name) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function dirname(path) {
  const i = path.lastIndexOf("/");
  return i < 0 ? "" : path.slice(0, i);
}

function fileNameNoExt(name) {
  const i = name.lastIndexOf(".");
  return i < 0 ? name : name.slice(0, i);
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds == null || seconds < 0) {
    return "--:--";
  }
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function humanSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "--";
  }
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let v = bytes;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u += 1;
  }
  return `${v.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}

function displayNameForItem(item) {
  if (item.tags?.title) {
    if (item.tags.artist) {
      return `${item.tags.title} - ${item.tags.artist}`;
    }
    return item.tags.title;
  }
  return fileNameNoExt(item.fileName) || item.fileName || item.relativePath;
}

function statusLabel(status) {
  if (status === "playable") {
    return "Playable";
  }
  if (status === "maybe") {
    return "Maybe";
  }
  if (status === "unsupported") {
    return "Unsupported";
  }
  if (status === "error") {
    return "Error";
  }
  return "-";
}

function statusClass(status) {
  if (status === "playable") {
    return "status-playable";
  }
  if (status === "maybe") {
    return "status-maybe";
  }
  if (status === "unsupported") {
    return "status-unsupported";
  }
  if (status === "error") {
    return "status-error";
  }
  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function middleEllipsis(value, maxLen) {
  const s = String(value || "");
  if (s.length <= maxLen) {
    return s;
  }
  const keep = Math.floor((maxLen - 3) / 2);
  return `${s.slice(0, keep)}...${s.slice(s.length - keep)}`;
}

function safeError(err) {
  if (!err) {
    return "unknown error";
  }
  if (typeof err === "string") {
    return err;
  }
  if (err.message) {
    return err.message;
  }
  return String(err);
}

function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
