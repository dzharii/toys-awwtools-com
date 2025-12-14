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
  fileContainer: document.getElementById("file-container"),
  statusBanner: document.getElementById("status-banner"),
  noFiles: document.getElementById("no-files")
};

let observer;
let scrollHandler;

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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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
  els.fileContainer.innerHTML = "";
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
    els.openFolder.textContent = "Open folder";
  } else if (state.phase === "loading") {
    const phaseLabel = state.cancelled ? "Cancelling" : (state.progress.phaseLabel || "Scanning");
    const text = `${phaseLabel} • dirs ${p.dirsVisited} • files included ${p.filesIncluded} • read ${p.filesRead} • skipped ${p.skipped} • errors ${p.errors} • bytes ${formatBytes(p.bytesRead)} • lines ${p.linesRead}`;
    els.controlStatus.textContent = text;
    els.controlStatus.title = `${p.bytesRead} bytes read`;
    els.controlActions.classList.remove("hidden");
    els.activeIndicator.textContent = "Active: loading…";
    els.openFolder.textContent = "Open folder";
  } else {
    const text = `Summary • files ${a.loadedFiles} • lines ${a.totalLines} • bytes ${formatBytes(a.totalBytes)} • skipped ${a.skippedFiles} • errors ${state.progress.errors}`;
    els.controlStatus.textContent = text;
    els.controlStatus.title = `${a.totalBytes} bytes loaded`;
    els.controlActions.classList.remove("hidden");
    els.openFolder.textContent = "Load another";
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

  if (!state.support.directoryPicker) {
    els.openFolder.title = "Folder picker not supported";
    els.emptyOpen.title = "Folder picker not supported";
  }

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
  const id = makeFileId(path);
  const record = {
    id,
    path,
    segments: path.split(/[\\/]/),
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
    const row = document.createElement(isFile ? "a" : "div");
    row.className = `tree-item ${node.type}`;
    row.style.paddingLeft = `${depth * 14}px`;
    row.setAttribute("role", "treeitem");
    row.tabIndex = 0;
    row.dataset.nodeId = node.path || node.fileId || "";
    row.dataset.index = index++;
    const currentHash = decodeURIComponent(location.hash.slice(1) || "");
    if (isFile) {
      row.href = `#${node.fileId}`;
      row.dataset.fileId = node.fileId;
      const isActive = node.fileId === state.activeFileId || node.fileId === currentHash;
      if (isActive) {
        row.setAttribute("aria-current", "location");
      } else {
        row.removeAttribute("aria-current");
      }
      row.classList.toggle("active", isActive);
      row.addEventListener("click", () => setActiveFile(node.fileId));
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
  const section = document.createElement("section");
  section.className = "file-section";
  section.dataset.fileId = file.id;
  section.id = file.id;
  const header = document.createElement("div");
  header.className = "file-header";
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
  const copyBtn = document.createElement("button");
  copyBtn.className = "ghost tiny";
  copyBtn.textContent = "Copy path";
  copyBtn.addEventListener("click", () => navigator.clipboard?.writeText(file.path));
  const fileActions = document.createElement("div");
  fileActions.className = "file-actions";
  fileActions.appendChild(copyBtn);

  header.appendChild(path);
  header.appendChild(language);
  header.appendChild(stats);
  header.appendChild(fileActions);

  const pre = document.createElement("pre");
  pre.textContent = file.text;
  if (!state.settings.wrap) pre.classList.add("nowrap");

  section.appendChild(header);
  section.appendChild(pre);
  els.fileContainer.appendChild(section);
  if (location.hash.slice(1) === file.id) {
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
}

function setActiveFile(fileId) {
  if (!fileId || state.activeFileId === fileId) return;
  state.activeFileId = fileId;
  renderDirectoryTree();
  const file = state.files.find(f => f.id === fileId);
  if (file) {
    els.activeIndicator.innerHTML = `<span>Active:</span> <span class="value" title="${file.path}">${file.path}</span>`;
    updateActiveLine();
  }
}

function updateActiveLine() {
  const fileId = state.activeFileId;
  if (!fileId) return;
  const section = document.querySelector(`[data-file-id="${fileId}"]`);
  if (!section) return;
  const pre = section.querySelector("pre");
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
      document.getElementById("no-files-open-settings")?.addEventListener("click", openSettings);
    }
  }
  updateControlBar();
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
  els.sidebarPin.textContent = state.sidebar.pinned ? "Unpin" : "Pin";
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
  const items = Array.from(els.treeContainer.querySelectorAll(".tree-item"));
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

function init() {
  document.documentElement.style.setProperty("--sidebar-width", `${state.sidebar.width}px`);
  applyDisplaySettings();
  updateOffsets();
  showEmptySupportMessage();
  updateSidebarVisibility();
  updateControlBar();

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

  document.addEventListener("keydown", maybeYieldEmptyEnter);
  window.addEventListener("resize", updateOffsets);
  window.addEventListener("hashchange", handleHashChange);
  renderDirectoryTree();
}

document.addEventListener("DOMContentLoaded", init);
