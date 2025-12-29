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
const SEARCH_CAP = 200;
const SEARCH_SLICE_BUDGET = 10;
const SEARCH_LIVE_DEBOUNCE = 250;
const SEARCH_EXPLICIT_MIN = 2;
const SEARCH_LIVE_MIN = 3;
const PREVIEW_OPEN_DELAY = 150;
const PREVIEW_SWITCH_DELAY = 75;
const PREVIEW_INACTIVE_MS = 9000;
const PREVIEW_DEFAULT_WIDTH = 420;
const PREVIEW_DEFAULT_HEIGHT = 280;
const PREVIEW_MIN_WIDTH = 260;
const PREVIEW_MIN_HEIGHT = 160;
const PREVIEW_VIEWPORT_MARGIN = 8;
const PREVIEW_GAP = 10;
const PREVIEW_CACHE_LIMIT = 12;
const PREVIEW_INITIAL_WIDTH_RATIO = 0.6;
const PREVIEW_INITIAL_HEIGHT_RATIO = 0.5;
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
  support: {
    directoryPicker: typeof window.showDirectoryPicker === "function",
    webkitDirectory: "webkitdirectory" in document.createElement("input")
  },
  seq: 0
};

const previewState = {
  window: null,
  visibleFileId: null,
  pending: null,
  hoverEntry: null,
  hoverFileId: null,
  hoverLoaded: false,
  lastPlacement: null,
  cache: new Map()
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
  previewToggle: document.getElementById("preview-toggle"),
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
  codeSearchPanel: document.getElementById("code-search-panel"),
  codeSearchStatus: document.getElementById("code-search-status"),
  codeSearchMode: document.getElementById("code-search-mode"),
  codeSearchScope: document.getElementById("code-search-scope"),
  codeSearchQuery: document.getElementById("code-search-query"),
  codeSearchCase: document.getElementById("code-search-case"),
  codeSearchLive: document.getElementById("code-search-live"),
  codeSearchRun: document.getElementById("code-search-run"),
  codeSearchCancel: document.getElementById("code-search-cancel"),
  codeSearchError: document.getElementById("code-search-error"),
  codeSearchErrorMessage: document.getElementById("code-search-error-message"),
  codeSearchErrorDetail: document.getElementById("code-search-error-detail"),
  codeSearchResultsMeta: document.getElementById("code-search-results-meta"),
  codeSearchUnavailable: document.getElementById("code-search-unavailable"),
  codeSearchCap: document.getElementById("code-search-cap"),
  codeSearchResultsList: document.getElementById("code-search-results-list"),
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
    const label = document.createElement(isHidden ? "span" : "a");
    label.className = isHidden ? "toc-text" : "toc-link";
    label.textContent = file.path;
    if (!isHidden) {
      label.dataset.fileId = file.id;
      label.dataset.filePath = file.path;
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

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}

function makeTextSpan(className, text) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
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

function showPreviewForEntry(entry, fileId) {
  const source = getPreviewSourceElement(fileId);
  if (!source) return false;
  const { win } = ensurePreviewWindow();
  win.setTitle(getPreviewTitle(entry, fileId));
  win.loadContent(getPreviewClone(fileId, source));
  win.bumpActivity();
  previewState.visibleFileId = fileId;
  previewState.hoverLoaded = true;
  storePreviewPlacement(win);
  return true;
}

function schedulePreviewOpen(entry, fileId, delayMs) {
  clearPendingPreview();
  const timer = setTimeout(() => {
    if (!previewState.pending) return;
    if (previewState.pending.entry !== entry || previewState.pending.fileId !== fileId) return;
    previewState.pending = null;
    if (!entry.isConnected) return;
    if (previewState.hoverEntry !== entry || previewState.hoverFileId !== fileId) return;
    try {
      showPreviewForEntry(entry, fileId);
    } catch (err) {
      console.warn("Preview open failed", err);
    }
  }, delayMs);
  previewState.pending = { entry, fileId, timer };
}

function getPreviewAnchorFromEvent(event) {
  const anchor = event.target.closest("a[data-file-id]");
  if (!anchor) return null;
  if (els.tocList?.contains(anchor) || els.treeContainer?.contains(anchor)) {
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
    clearPendingPreview();
    previewState.hoverEntry = entry;
    previewState.hoverFileId = fileId;
    previewState.hoverLoaded = Boolean(getPreviewSourceElement(fileId));
    if (previewState.window && previewState.visibleFileId === fileId) {
      if (previewState.hoverLoaded) previewState.window.bumpActivity();
      return;
    }
    if (previewState.window && previewState.hoverLoaded) {
      previewState.window.bumpActivity();
    }
    const delay = previewState.window ? PREVIEW_SWITCH_DELAY : PREVIEW_OPEN_DELAY;
    schedulePreviewOpen(entry, fileId, delay);
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

function setupHoverPreview() {
  if (els.tocList) {
    els.tocList.addEventListener("pointerover", handlePreviewPointerOver);
    els.tocList.addEventListener("pointerout", handlePreviewPointerOut);
    els.tocList.addEventListener("pointermove", handlePreviewPointerMove);
  }
  if (els.treeContainer) {
    els.treeContainer.addEventListener("pointerover", handlePreviewPointerOver);
    els.treeContainer.addEventListener("pointerout", handlePreviewPointerOut);
    els.treeContainer.addEventListener("pointermove", handlePreviewPointerMove);
  }
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatRegexErrorDetail(err) {
  if (!err) return "";
  const raw = typeof err === "string" ? err : err.message || "";
  const line = raw.split("\n")[0];
  if (line.length > 120) return `${line.slice(0, 117)}...`;
  return line;
}

function validateSearchQuery(rawQuery, opts) {
  const trimmed = rawQuery.trim();
  const minLength = opts.minLength || SEARCH_EXPLICIT_MIN;
  if (trimmed.length < minLength) {
    if (opts.showMinLengthError) {
      setSearchError("Enter at least 2 characters.");
    } else {
      clearSearchError();
    }
    return { ok: false, trimmed };
  }
  if (opts.mode === "regex") {
    try {
      new RegExp(trimmed, opts.caseSensitive ? "" : "i");
    } catch (err) {
      setSearchError("Invalid regular expression.", formatRegexErrorDetail(err));
      return { ok: false, trimmed };
    }
  }
  clearSearchError();
  return { ok: true, trimmed };
}

function buildSearchMatcher(query, mode, caseSensitive) {
  if (mode === "regex") {
    return { type: "regex", regex: new RegExp(query, caseSensitive ? "" : "i") };
  }
  const hasWildcard = query.includes("*");
  if (hasWildcard) {
    const regexSource = query.split("*").map(escapeRegExp).join(".*");
    return { type: "regex", regex: new RegExp(regexSource, caseSensitive ? "" : "i") };
  }
  return { type: "text", query, caseSensitive };
}

function matchLine(line, matcher) {
  if (matcher.type === "text") {
    const haystack = matcher.caseSensitive ? line : line.toLowerCase();
    const needle = matcher.caseSensitive ? matcher.query : matcher.query.toLowerCase();
    const start = haystack.indexOf(needle);
    if (start === -1) return null;
    return { start, end: start + needle.length };
  }
  const match = matcher.regex.exec(line);
  if (!match) return null;
  return { start: match.index, end: match.index + match[0].length };
}

function getSearchScopeFiles(scope) {
  const files = scope === "visible"
    ? state.files.filter(file => !isFileHidden(file.id))
    : state.files.slice();
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

function buildSnippetLines(lines, lineIndex) {
  const start = Math.max(0, lineIndex - 3);
  const end = Math.min(lines.length - 1, lineIndex + 3);
  const snippet = [];
  for (let i = start; i <= end; i += 1) {
    snippet.push({ number: i + 1, text: lines[i], isMatch: i === lineIndex });
  }
  return snippet;
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
    caseSensitive
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

function resetStateForLoad() {
  state.phase = "empty";
  state.files = [];
  state.tree = createRootNode();
  destroyPreviewWindow();
  clearPreviewCache();
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
  const code = document.createElement("code");
  if (file.highlightLanguage) code.classList.add(`language-${file.highlightLanguage}`);
  code.textContent = file.text;
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
}

document.addEventListener("DOMContentLoaded", init);
