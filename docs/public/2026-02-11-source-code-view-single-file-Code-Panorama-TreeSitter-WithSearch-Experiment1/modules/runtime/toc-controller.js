import { escapeRegExp } from "../search-helpers.js";

export function createTocController({
  state,
  els,
  doc = document,
  tocFilterDebounceMs,
  buildMarkdownSnippet,
  copyTextToClipboard,
  isFileHidden,
  applyFileVisibility,
  renderDirectoryTree,
  ensureActiveFileVisible,
  setActiveFile,
}) {
  let tocRenderHandle = null;

  function getTocFilesInOrder() {
    return [...state.files].sort((a, b) => a.path.localeCompare(b.path));
  }

  function normalizeTocPath(value) {
    return (value || "")
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/^\/+|\/+$/g, "");
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
    return (path) => regex.test(path || "");
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
        prefixLower: prefix.toLowerCase(),
      };
    });
    const built = {
      path: file.path,
      dirs: dirEntries,
      fileName: fileName || file.path || "",
    };
    state.tocFilter.segmentCache.set(file.id, built);
    return built;
  }

  function isTocPathExcluded(path) {
    const normalized = normalizeTocPrefix(path);
    if (!normalized || !state.tocFilter.exclusions.size) return false;
    for (const prefix of state.tocFilter.exclusions) {
      if (normalized === prefix || normalized.startsWith(`${prefix}/`))
        return true;
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
    return new Set(
      getTocFilesInOrder()
        .filter((file) => isTocPathVisible(file.path))
        .map((file) => file.id),
    );
  }

  function getTocActionableSelectedFileIds() {
    const selected = new Set();
    state.tocSelection.forEach((fileId) => {
      const file = state.files.find((item) => item.id === fileId);
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
      els.tocExclusionsClear.disabled =
        !hasFiles || state.tocFilter.exclusions.size === 0;
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
    const segment = target.closest(
      ".toc-segment[data-segment-lower][data-segment-index]",
    );
    if (segment) {
      return getTocSegmentHoverKeyFromDataset(
        segment.dataset.segmentLower,
        segment.dataset.segmentIndex,
      );
    }
    const button = target.closest(
      ".toc-segment-exclude[data-segment-lower][data-segment-index]",
    );
    if (button) {
      return getTocSegmentHoverKeyFromDataset(
        button.dataset.segmentLower,
        button.dataset.segmentIndex,
      );
    }
    return "";
  }

  function applyTocSegmentHighlight() {
    if (!els.tocList) return;
    const segments = els.tocList.querySelectorAll(".toc-segment");
    segments.forEach((segment) => {
      segment.classList.remove("is-global-hover");
      segment.style.removeProperty("--toc-segment-hue");
    });
    const hoverKey = state.tocFilter.hoverKey;
    if (!hoverKey) return;
    const [segmentLower, segmentIndexText] = hoverKey.split(":");
    const segmentIndex = Number.parseInt(segmentIndexText, 10);
    if (!segmentLower || !Number.isFinite(segmentIndex)) return;
    const hue = hashString(`${segmentLower}:${segmentIndex}`) % 360;
    segments.forEach((segment) => {
      if (segment.dataset.segmentLower !== segmentLower) return;
      if (
        Number.parseInt(segment.dataset.segmentIndex || "", 10) !== segmentIndex
      )
        return;
      const row = segment.closest(".toc-item");
      if (
        !row ||
        row.classList.contains("is-filtered-out") ||
        row.classList.contains("is-excluded")
      )
        return;
      segment.classList.add("is-global-hover");
      segment.style.setProperty("--toc-segment-hue", `${hue}`);
    });
  }

  function syncTocCheckboxesFromSelection() {
    if (!els.tocList) return;
    const rows = els.tocList.querySelectorAll(".toc-item");
    rows.forEach((row) => {
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
    state.tocSelection.forEach((fileId) => {
      const file = state.files.find((item) => item.id === fileId);
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
    rows.forEach((row) => {
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
    if (state.tocFilter.debounceTimer)
      clearTimeout(state.tocFilter.debounceTimer);
    state.tocFilter.debounceTimer = setTimeout(() => {
      state.tocFilter.debounceTimer = null;
      applyTocFiltersNow();
    }, tocFilterDebounceMs);
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

  function renderTocPathLabel(file, hidden) {
    const data = getOrBuildTocSegments(file);
    const container = doc.createElement("span");
    container.className = "toc-path";
    data.dirs.forEach((segment, index) => {
      const wrapper = doc.createElement("span");
      wrapper.className = "toc-segment-wrap";
      const segmentNode = doc.createElement(hidden ? "span" : "a");
      segmentNode.className = `${hidden ? "toc-text" : "toc-link"} toc-segment`;
      segmentNode.textContent = segment.text;
      segmentNode.dataset.segment = segment.text;
      segmentNode.dataset.segmentLower = segment.lower;
      segmentNode.dataset.segmentIndex = `${segment.index}`;
      segmentNode.dataset.prefix = segment.prefix;
      segmentNode.dataset.prefixLower = segment.prefixLower;
      segmentNode.dataset.fileId = file.id;
      segmentNode.dataset.filePath = file.path;
      wrapper.appendChild(segmentNode);
      if (!hidden) {
        segmentNode.href = `#${file.id}`;
        segmentNode.addEventListener("click", () => setActiveFile(file.id));
        const excludeBtn = doc.createElement("button");
        excludeBtn.type = "button";
        excludeBtn.className = "toc-segment-exclude";
        excludeBtn.textContent = "×";
        excludeBtn.dataset.prefix = segment.prefix;
        excludeBtn.dataset.prefixLower = segment.prefixLower;
        excludeBtn.dataset.segmentLower = segment.lower;
        excludeBtn.dataset.segmentIndex = `${segment.index}`;
        excludeBtn.setAttribute(
          "aria-label",
          `Exclude folder ${segment.prefix}`,
        );
        excludeBtn.title = `Exclude ${segment.prefix}`;
        wrapper.appendChild(excludeBtn);
      }
      container.appendChild(wrapper);
      if (index < data.dirs.length - 1 || data.fileName) {
        const separator = doc.createElement("span");
        separator.className = "toc-path-separator";
        separator.textContent = "/";
        container.appendChild(separator);
      }
    });
    const filenameNode = doc.createElement(hidden ? "span" : "a");
    filenameNode.className = `${hidden ? "toc-text" : "toc-link"} toc-filename`;
    filenameNode.textContent = data.fileName;
    if (!hidden) {
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
    const fragment = doc.createDocumentFragment();
    files.forEach((file) => {
      const li = doc.createElement("li");
      li.className = "toc-item";
      li.dataset.fileId = file.id;
      li.dataset.filePath = file.path;
      const hidden = isFileHidden(file.id);
      if (hidden) li.classList.add("is-hidden");
      const checkbox = doc.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "toc-checkbox";
      checkbox.checked = state.tocSelection.has(file.id);
      checkbox.setAttribute("aria-label", `Select ${file.path}`);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) state.tocSelection.add(file.id);
        else state.tocSelection.delete(file.id);
        updateTocControls();
      });
      const label = renderTocPathLabel(file, hidden);
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
    if (
      !els.tocSelectAll ||
      !els.tocReset ||
      !els.tocCopy ||
      !els.tocHide ||
      !els.tocShow
    )
      return;
    const selectableIds = getTocSelectableFileIds();
    const selectedActionableIds = getTocActionableSelectedFileIds();
    let selectedVisibleCount = 0;
    selectedActionableIds.forEach((fileId) => {
      if (selectableIds.has(fileId)) selectedVisibleCount += 1;
    });
    const noneSelected = selectedActionableIds.size === 0;
    els.tocSelectAll.disabled =
      selectableIds.size === 0 || selectedVisibleCount === selectableIds.size;
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
    const selectedFiles = getTocFilesInOrder().filter(
      (file) =>
        state.tocSelection.has(file.id) && !isTocPathExcluded(file.path),
    );
    if (!selectedFiles.length) return;
    const content = selectedFiles
      .map((file) => buildMarkdownSnippet(file))
      .join("");
    copyTextToClipboard(content);
  }

  function hideSelectedFiles() {
    const selectedIds = getTocActionableSelectedFileIds();
    if (!selectedIds.size) return;
    selectedIds.forEach((fileId) => {
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
    selectedIds.forEach((fileId) => {
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

  function handleTocSegmentEnter(event) {
    const key = resolveTocSegmentHoverKeyFromTarget(event.target);
    if (!key) return;
    setTocSegmentHoverKey(key);
  }

  function handleTocSegmentLeave(event) {
    const nextKey = resolveTocSegmentHoverKeyFromTarget(event.relatedTarget);
    setTocSegmentHoverKey(nextKey);
  }

  function handleTocSegmentPointerOver(event) {
    handleTocSegmentEnter(event);
  }

  function handleTocSegmentPointerOut(event) {
    handleTocSegmentLeave(event);
  }

  function handleTocSegmentFocusIn(event) {
    handleTocSegmentEnter(event);
  }

  function handleTocSegmentFocusOut(event) {
    handleTocSegmentLeave(event);
  }

  function handleTocSegmentExclusion(event) {
    const button = event.target.closest(
      ".toc-segment-exclude[data-prefix-lower]",
    );
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

  return {
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
  };
}
