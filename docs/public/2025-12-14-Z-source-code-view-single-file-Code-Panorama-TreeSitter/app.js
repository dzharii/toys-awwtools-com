const defaults = {
  ignores: [".git", "node_modules", "dist", "build", "out", "target", "bin", "obj", ".idea", ".vscode"],
  allow: [
    "js", "ts", "jsx", "tsx", "mjs", "cjs",
    "c", "h", "cc", "cpp", "hpp", "cs", "java", "scala", "kt", "go", "rs",
    "py", "rb", "php", "swift", "m", "mm",
    "html", "css", "scss", "md", "txt", "sh", "ps1",
    "yaml", "yml", "toml", "ini", "xml"
  ],
  includeJson: false,
  maxFileSize: 1024 * 1024,
  memoryWarnBytes: 50 * 1024 * 1024,
  wrap: true,
  showStats: true
};

const TREE_SITTER_ASSET_BASE = "lib/web-tree-sitter-v0.26.3";
const TREE_SITTER_STORAGE_KEY = "code-panorama-tree-sitter";
const TREE_SITTER_LANGUAGES = {
  c: { file: "tree-sitter-c-v0.24.1.wasm" },
  cpp: { file: "tree-sitter-cpp-v0.23.4.wasm" },
  bash: { file: "tree-sitter-bash-v0.25.1.wasm" },
  csharp: { file: "tree-sitter-c_sharp-v0.23.1.wasm" },
  javascript: { file: "tree-sitter-javascript-v0.25.0.wasm" },
  json: { file: "tree-sitter-json-v0.24.8.wasm" },
  scala: { file: "tree-sitter-scala-v0.24.0.wasm" }
};

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
  treeSitter: loadTreeSitterState(),
  support: {
    directoryPicker: typeof window.showDirectoryPicker === "function",
    webkitDirectory: "webkitdirectory" in document.createElement("input")
  },
  seq: 0
};

const els = {
  topbar: document.getElementById("topbar"),
  controlBar: document.getElementById("control-bar"),
  openFolder: document.getElementById("open-folder"),
  emptyOpen: document.getElementById("empty-open-folder"),
  emptyPanel: document.getElementById("empty-panel"),
  emptyFallback: document.getElementById("empty-fallback"),
  supportLink: document.getElementById("support-link"),
  supportPanel: document.getElementById("support-panel"),
  supportClose: document.getElementById("support-close"),
  fallbackPicker: document.getElementById("fallback-picker"),
  fileInput: document.getElementById("file-input"),
  cancelLoad: document.getElementById("cancel-load"),
  settingsToggle: document.getElementById("settings-toggle"),
  settingsPanel: document.getElementById("settings-panel"),
  settingsClose: document.getElementById("settings-close"),
  settingsSave: document.getElementById("settings-save"),
  ignoreList: document.getElementById("ignore-list"),
  allowList: document.getElementById("allow-list"),
  jsonToggle: document.getElementById("json-toggle"),
  maxSize: document.getElementById("max-size"),
  memoryLimit: document.getElementById("memory-limit"),
  wrapToggle: document.getElementById("wrap-toggle"),
  statsDisplay: document.getElementById("stats-display"),
  statsPanel: document.getElementById("stats-panel"),
  statsClose: document.getElementById("stats-close"),
  statsBody: document.getElementById("stats-body"),
  statsBtn: document.getElementById("stats-button"),
  logToggle: document.getElementById("log-toggle"),
  logPanel: document.getElementById("log-panel"),
  logClose: document.getElementById("log-close"),
  logBody: document.getElementById("log-body"),
  treeBtn: document.getElementById("tree-button"),
  tsWindow: document.getElementById("ts-window"),
  tsTitleBar: document.getElementById("ts-titlebar"),
  tsClose: document.getElementById("ts-close"),
  tsMinimize: document.getElementById("ts-minimize"),
  tsParse: document.getElementById("ts-parse"),
  tsBody: document.getElementById("ts-body"),
  tsStatus: document.getElementById("ts-status"),
  tsOutline: document.getElementById("ts-outline"),
  tsIncludes: document.getElementById("ts-includes"),
  tsSubtitle: document.getElementById("ts-subtitle"),
  tsResize: document.getElementById("ts-resize"),
  tsChip: document.getElementById("ts-chip"),
  controlStatus: document.getElementById("control-status"),
  controlActions: document.getElementById("control-actions"),
  activeIndicator: document.getElementById("active-indicator"),
  sidebar: document.getElementById("sidebar"),
  sidebarPin: document.getElementById("sidebar-pin"),
  sidebarEdge: document.getElementById("sidebar-edge-handle"),
  sidebarResize: document.getElementById("sidebar-resize"),
  treeContainer: document.getElementById("tree-container"),
  treePlaceholder: document.getElementById("tree-placeholder"),
  main: document.getElementById("main"),
  fallbackMessage: document.getElementById("fallback-message"),
  tocPanel: document.getElementById("toc-panel"),
  tocCount: document.getElementById("toc-count"),
  tocSelectAll: document.getElementById("toc-select-all"),
  tocReset: document.getElementById("toc-reset"),
  tocCopy: document.getElementById("toc-copy"),
  tocHide: document.getElementById("toc-hide"),
  tocShow: document.getElementById("toc-show"),
  tocList: document.getElementById("toc-list"),
  tocEmpty: document.getElementById("toc-empty"),
  fileContainer: document.getElementById("file-container"),
  statusBanner: document.getElementById("status-banner"),
  noFiles: document.getElementById("no-files")
};

let observer;
let scrollHandler;
let highlightObserver;
let tocRenderHandle;

function createRootNode() {
  return { name: "", type: "dir", children: [], expanded: true, path: "" };
}

function loadSettings() {
  const saved = localStorage.getItem("code-panorama-settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed, ignores: parsed.ignores || defaults.ignores, allow: parsed.allow || defaults.allow };
    } catch (err) {
      console.warn("Failed to parse settings, using defaults", err);
    }
  }
  return { ...defaults };
}

function saveSettings() {
  localStorage.setItem("code-panorama-settings", JSON.stringify(state.settings));
}

function loadTreeSitterState() {
  const base = {
    enabled: true,
    window: { open: false, minimized: false, x: null, y: null, w: 360, h: 420, chipY: null },
    ready: false,
    loading: false,
    parsing: false,
    error: null,
    cache: {},
    markers: {},
    pendingFileId: null,
    parser: null,
    Parser: null,
    Language: null,
    languages: Object.keys(TREE_SITTER_LANGUAGES).reduce((acc, key) => ({ ...acc, [key]: null }), {}),
    parseHandle: null,
    parseHandleType: null,
    wantInit: false
  };
  const saved = localStorage.getItem(TREE_SITTER_STORAGE_KEY);
  if (!saved) return base;
  try {
    const parsed = JSON.parse(saved);
    const win = parsed.window || {};
    base.window = {
      open: !!win.open,
      minimized: !!win.minimized,
      x: Number.isFinite(win.x) ? win.x : null,
      y: Number.isFinite(win.y) ? win.y : null,
      w: Number.isFinite(win.w) ? win.w : 360,
      h: Number.isFinite(win.h) ? win.h : 420,
      chipY: Number.isFinite(win.chipY) ? win.chipY : null
    };
    base.wantInit = base.window.open || base.window.minimized;
  } catch (err) {
    console.warn("Failed to load Tree-sitter state", err);
  }
  return base;
}

function saveTreeSitterState() {
  const { window: win } = state.treeSitter;
  localStorage.setItem(TREE_SITTER_STORAGE_KEY, JSON.stringify({ window: win }));
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function setButtonLabel(button, icon, text) {
  if (!button) return;
  button.innerHTML = "";
  const emoji = document.createElement("span");
  emoji.className = "btn-emoji";
  emoji.textContent = icon;
  const label = document.createElement("span");
  label.className = "btn-label";
  label.textContent = text;
  button.append(emoji, label);
}

function buildMarkdownSnippet(file) {
  if (!file) return "";
  const parts = file.path.split(".");
  const ext = parts.length > 1 ? parts.pop() || "" : "";
  const lang = ext && /^[a-zA-Z0-9#+-]+$/.test(ext) ? ext.toLowerCase() : "";
  return `File \`${file.path}\`:\n\`\`\`${lang}\n${file.text}\n\`\`\`\n`;
}

function copyTextToClipboard(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
}

function copyFileSource(file) {
  if (!file) return;
  copyTextToClipboard(buildMarkdownSnippet(file));
}

function hashPath(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function makeFileId(path) {
  const safe = path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "") || "file";
  const hash = hashPath(path);
  return `file-${safe}-${hash}`;
}

function countLines(text) {
  if (!text) return 0;
  let count = 1;
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") count++;
  return count;
}

function languageFromExt(ext) {
  const lookup = {
    js: "JavaScript", ts: "TypeScript", jsx: "JSX", tsx: "TSX", mjs: "JavaScript", cjs: "JavaScript",
    c: "C", h: "C/C Header", cc: "C++", cpp: "C++", hpp: "C++ Header",
    cs: "C#", java: "Java", scala: "Scala", kt: "Kotlin", go: "Go", rs: "Rust",
    py: "Python", rb: "Ruby", php: "PHP", swift: "Swift", m: "Objective-C", mm: "Objective-C++",
    html: "HTML", css: "CSS", scss: "SCSS", md: "Markdown", txt: "Text", sh: "Shell", ps1: "PowerShell",
    yaml: "YAML", yml: "YAML", toml: "TOML", ini: "INI", xml: "XML", json: "JSON"
  };
  return lookup[ext.toLowerCase()] || ext.toUpperCase() || "Text";
}

function highlightLanguageFromExt(ext) {
  if (!ext) return "";
  const lookup = {
    js: "javascript", ts: "typescript", jsx: "jsx", tsx: "tsx", mjs: "javascript", cjs: "javascript",
    c: "c", h: "c", cc: "cpp", cpp: "cpp", hpp: "cpp",
    cs: "csharp", java: "java", scala: "scala", kt: "kotlin", go: "go", rs: "rust",
    py: "python", rb: "ruby", php: "php", swift: "swift", m: "objectivec", mm: "objectivec",
    html: "html", css: "css", scss: "scss", md: "markdown", txt: "plaintext", sh: "bash", ps1: "powershell",
    yaml: "yaml", yml: "yaml", toml: "toml", ini: "ini", xml: "xml", json: "json"
  };
  return lookup[ext.toLowerCase()] || "";
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
    els.tocEmpty.classList.remove("hidden");
    els.tocList.classList.add("hidden");
    updateTocControls();
    return;
  }
  els.tocEmpty.classList.add("hidden");
  els.tocList.classList.remove("hidden");
  const fragment = document.createDocumentFragment();
  files.forEach(file => {
    const li = document.createElement("li");
    li.className = "toc-item";
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
    const label = document.createElement(isHidden ? "span" : "a");
    label.className = isHidden ? "toc-text" : "toc-link";
    label.textContent = file.path;
    if (!isHidden) {
      label.href = `#${file.id}`;
      label.addEventListener("click", () => setActiveFile(file.id));
    }
    li.appendChild(checkbox);
    li.appendChild(label);
    fragment.appendChild(li);
  });
  els.tocList.appendChild(fragment);
  updateTocControls();
}

function updateTocControls() {
  if (!els.tocSelectAll || !els.tocReset || !els.tocCopy || !els.tocHide || !els.tocShow) return;
  const total = state.files.length;
  const selected = state.tocSelection.size;
  const noneSelected = selected === 0 || total === 0;
  els.tocSelectAll.disabled = total === 0 || selected === total;
  els.tocReset.disabled = noneSelected;
  els.tocCopy.disabled = noneSelected;
  els.tocHide.disabled = noneSelected;
  els.tocShow.disabled = noneSelected;
}

function setAllTocCheckboxes(checked) {
  if (!els.tocList) return;
  const boxes = els.tocList.querySelectorAll("input[type='checkbox']");
  boxes.forEach(box => {
    box.checked = checked;
  });
}

function handleTocSelectAll() {
  state.tocSelection = new Set(state.files.map(file => file.id));
  setAllTocCheckboxes(true);
  updateTocControls();
}

function handleTocResetSelection() {
  state.tocSelection.clear();
  setAllTocCheckboxes(false);
  updateTocControls();
}

function copySelectedFiles() {
  const selectedFiles = getTocFilesInOrder().filter(file => state.tocSelection.has(file.id));
  if (!selectedFiles.length) return;
  const content = selectedFiles.map(file => buildMarkdownSnippet(file)).join("");
  copyTextToClipboard(content);
}

function hideSelectedFiles() {
  if (!state.tocSelection.size) return;
  state.tocSelection.forEach(fileId => {
    state.hiddenFiles.add(fileId);
    applyFileVisibility(fileId);
  });
  renderDirectoryTree();
  renderTableOfContents();
  ensureActiveFileVisible();
}

function showSelectedFiles() {
  if (!state.tocSelection.size) return;
  state.tocSelection.forEach(fileId => {
    state.hiddenFiles.delete(fileId);
    applyFileVisibility(fileId);
  });
  renderDirectoryTree();
  renderTableOfContents();
  ensureActiveFileVisible();
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

function maybeYield(lastYieldRef) {
  const now = performance.now();
  if (now - lastYieldRef.value > 16) {
    lastYieldRef.value = now;
    return new Promise(resolve => setTimeout(resolve, 0));
  }
  return Promise.resolve();
}

function resetStateForLoad() {
  state.phase = "empty";
  state.files = [];
  state.tree = createRootNode();
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
  els.fileContainer.innerHTML = "";
  renderTableOfContents();
  renderDirectoryTree();
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
    const text = `Summary • files ${a.loadedFiles} • lines ${a.totalLines} • bytes ${formatBytes(a.totalBytes)} • skipped ${a.skippedFiles} • errors ${state.progress.errors}`;
    els.controlStatus.textContent = text;
    els.controlStatus.title = `${a.totalBytes} bytes loaded`;
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

  updateOffsets();
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
  const highlightLanguage = highlightLanguageFromExt(ext);
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
    highlightLanguage,
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
  const code = document.createElement("code");
  if (file.highlightLanguage) code.classList.add(`language-${file.highlightLanguage}`);
  code.textContent = file.text;
  pre.appendChild(code);
  if (!state.settings.wrap) pre.classList.add("nowrap");

  summary.appendChild(header);
  section.appendChild(summary);
  section.appendChild(pre);
  els.fileContainer.appendChild(section);
  if (location.hash.slice(1) === file.id) {
    section.open = true;
    section.scrollIntoView({ behavior: "auto", block: "start" });
    setActiveFile(file.id);
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
}

function observeHighlightBlock(code) {
  if (!highlightObserver) {
    highlightObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        if (target.dataset.highlighted === "true" || target.classList.contains("hljs")) {
          highlightObserver.unobserve(target);
          return;
        }
        highlightCodeBlock(target);
        highlightObserver.unobserve(target);
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.1 });
  }
  highlightObserver.observe(code);
}

function highlightCodeBlock(code) {
  const hljs = window.hljs;
  if (!hljs || !code) return;
  try {
    hljs.highlightElement(code);
  } catch (err) {
    console.warn("Highlight.js failed to highlight a block", err);
  }
  if (!code.dataset.highlighted) code.dataset.highlighted = "true";
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
  const targetId = decodeURIComponent(location.hash.slice(1));
  if (!targetId) return;
  if (isFileHidden(targetId)) return;
  const section = document.getElementById(targetId);
  if (section) {
    section.scrollIntoView({ behavior: "auto", block: "start" });
    setActiveFile(section.dataset.fileId);
  }
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
  saveSettings();
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
    const includes = buildIncludeList(tree, lang);
    if (!force && state.activeFileId !== file.id) return;
    ts.cache[file.id] = { outline, includes, parsedAt: Date.now() };
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

function extractNodeName(node) {
  const byField = ["name", "declarator", "declaration", "type"];
  for (const field of byField) {
    const candidate = node.childForFieldName?.(field);
    if (candidate && candidate.text) {
      const identifiers = candidate.descendantsOfType(["identifier", "type_identifier", "field_identifier"]);
      if (identifiers.length) return identifiers[0].text;
      if (candidate.text.trim()) return candidate.text.trim();
    }
  }
  const fallback = node.descendantsOfType(["identifier", "type_identifier", "field_identifier"]);
  return fallback[0]?.text || "<anonymous>";
}

function buildOutlineModel(tree, file, lang) {
  const outline = [];
  const configs = {
    c: {
      types: [
        "function_definition",
        "struct_specifier",
        "class_specifier",
        "union_specifier",
        "enum_specifier",
        "type_definition",
        "preproc_def",
        "preproc_function_def"
      ],
      map: type => {
        if (type === "function_definition") return "function";
        if (type === "enum_specifier") return "enum";
        if (type === "type_definition") return "typedef";
        if (type === "preproc_def" || type === "preproc_function_def") return "macro";
        if (type === "struct_specifier" || type === "class_specifier" || type === "union_specifier") return "struct";
        return null;
      }
    },
    cpp: {
      types: [
        "function_definition",
        "struct_specifier",
        "class_specifier",
        "union_specifier",
        "enum_specifier",
        "type_definition",
        "preproc_def",
        "preproc_function_def"
      ],
      map: type => {
        if (type === "function_definition") return "function";
        if (type === "enum_specifier") return "enum";
        if (type === "type_definition") return "typedef";
        if (type === "preproc_def" || type === "preproc_function_def") return "macro";
        if (type === "struct_specifier" || type === "class_specifier" || type === "union_specifier") return "struct";
        return null;
      }
    },
    javascript: {
      types: [
        "function_declaration",
        "method_definition",
        "class_declaration",
        "generator_function",
        "lexical_declaration",
        "export_statement",
        "export_clause",
        "arrow_function"
      ],
      map: type => {
        if (type === "function_declaration" || type === "generator_function" || type === "arrow_function") return "function";
        if (type === "method_definition") return "method";
        if (type === "class_declaration") return "class";
        if (type === "lexical_declaration") return "const";
        if (type === "export_statement" || type === "export_clause") return "export";
        return null;
      }
    },
    bash: {
      types: ["function_definition"],
      map: () => "function"
    },
    csharp: {
      types: [
        "method_declaration",
        "class_declaration",
        "struct_declaration",
        "interface_declaration",
        "enum_declaration",
        "constructor_declaration",
        "property_declaration"
      ],
      map: type => {
        if (type === "method_declaration" || type === "constructor_declaration") return "method";
        if (type === "class_declaration") return "class";
        if (type === "struct_declaration") return "struct";
        if (type === "interface_declaration") return "interface";
        if (type === "enum_declaration") return "enum";
        if (type === "property_declaration") return "property";
        return null;
      }
    },
    json: {
      types: ["pair"],
      map: () => "key"
    },
    scala: {
      types: [
        "class_definition",
        "object_definition",
        "trait_definition",
        "method_definition",
        "function_definition",
        "val_definition",
        "var_definition"
      ],
      map: type => {
        if (type === "class_definition") return "class";
        if (type === "object_definition") return "object";
        if (type === "trait_definition") return "trait";
        if (type === "method_definition" || type === "function_definition") return "function";
        if (type === "val_definition") return "val";
        if (type === "var_definition") return "var";
        return null;
      }
    }
  };
  const config = configs[lang] || configs.c;
  const nodes = tree.rootNode.descendantsOfType(config.types);
  nodes.forEach((node, idx) => {
    const kind = config.map(node.type);
    if (!kind) return;
    const name = lang === "json" ? (node.child(0)?.text || extractNodeName(node)) : extractNodeName(node);
    outline.push({
      kind,
      name,
      line: node.startPosition.row + 1,
      fileId: file.id,
      anchorId: `${file.id}-ts-${kind}-${idx}`
    });
  });
  return outline;
}

function buildIncludeList(tree, lang) {
  if (lang !== "c" && lang !== "cpp") return [];
  const includes = [];
  const nodes = tree.rootNode.descendantsOfType("preproc_include");
  nodes.forEach(node => {
    const raw = node.text.trim();
    const match = raw.match(/#\s*include\s*[<"]([^>"]+)[>"]/i);
    const targetPath = match ? match[1] : null;
    let targetFileId = null;
    if (targetPath && raw.includes("\"")) {
      const target = state.files.find(f => f.path.endsWith(targetPath));
      if (target) targetFileId = target.id;
    }
    includes.push({ raw, targetPath, targetFileId });
  });
  return includes;
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

function scrollToApproxLine(fileId, line) {
  if (isFileHidden(fileId)) return;
  const section = getFileSection(fileId);
  if (!section) return;
  if (section.tagName === "DETAILS") section.open = true;
  const pre = section.querySelector("pre");
  const header = section.querySelector(".file-header");
  const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  const headerHeight = header?.getBoundingClientRect().height || 0;
  const top = pre.getBoundingClientRect().top + window.scrollY + Math.max(0, (line - 1) * lineHeight);
  window.scrollTo({ top: top - headerHeight - 16, behavior: "smooth" });
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

  if (els.treeBtn) els.treeBtn.addEventListener("click", handleTreeButtonClick);
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
  window.addEventListener("hashchange", handleHashChange);
  renderDirectoryTree();
  renderTableOfContents();
  updateTreeSitterWindowUI();
}

document.addEventListener("DOMContentLoaded", init);
