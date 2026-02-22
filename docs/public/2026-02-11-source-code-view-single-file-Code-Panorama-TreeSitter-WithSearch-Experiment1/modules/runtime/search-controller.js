import {
  validateSearchQuery,
  buildSearchMatcher,
  matchLine,
  buildSnippetLines,
} from "../search-helpers.js";

export function createSearchController({
  state,
  els,
  doc = document,
  searchCap,
  searchSliceBudget,
  searchLiveDebounce,
  searchExplicitMin,
  searchLiveMin,
  isFileHidden,
  navigateToFileLine,
}) {
  function setSearchError(message, detail) {
    if (!els.codeSearchError) return;
    const hasMessage = !!message;
    els.codeSearchError.classList.toggle("hidden", !hasMessage);
    if (els.codeSearchErrorMessage)
      els.codeSearchErrorMessage.textContent = message || "";
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
    els.codeSearchResultsMeta.textContent = state.search.partial
      ? "Partial results"
      : "";
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
      els.codeSearchRun,
    ].filter(Boolean);
    controls.forEach((control) => {
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
    const files =
      scope === "visible"
        ? state.files.filter((file) => !isFileHidden(file.id))
        : state.files.slice();
    return files.sort((a, b) => a.path.localeCompare(b.path));
  }

  function appendSearchResults() {
    if (!els.codeSearchResultsList) return;
    if (state.search.rendered >= state.search.results.length) return;
    const fragment = doc.createDocumentFragment();
    for (
      let i = state.search.rendered;
      i < state.search.results.length;
      i += 1
    ) {
      fragment.appendChild(buildSearchResultCard(state.search.results[i]));
    }
    els.codeSearchResultsList.appendChild(fragment);
    state.search.rendered = state.search.results.length;
  }

  function buildSearchResultCard(result) {
    const card = doc.createElement("div");
    card.className = "code-search-result";
    card.setAttribute("role", "listitem");

    const header = doc.createElement("div");
    header.className = "code-search-result-header";

    const fileLink = doc.createElement("a");
    fileLink.className = "code-search-result-link";
    fileLink.href = `#${result.fileId}@${result.lineNumber}`;
    fileLink.textContent = result.path;
    fileLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToFileLine(result.fileId, result.lineNumber);
    });

    const lineLink = doc.createElement("a");
    lineLink.className = "code-search-result-link";
    lineLink.href = `#${result.fileId}@${result.lineNumber}`;
    lineLink.textContent = `Line ${result.lineNumber}`;
    lineLink.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToFileLine(result.fileId, result.lineNumber);
    });

    header.appendChild(fileLink);
    header.appendChild(lineLink);

    const preview = doc.createElement("div");
    preview.className = "code-search-preview";

    result.snippet.forEach((line) => {
      const row = doc.createElement("div");
      row.className = "code-search-line";
      if (line.isMatch) row.classList.add("is-match");
      row.addEventListener("click", () =>
        navigateToFileLine(result.fileId, line.number),
      );

      const number = doc.createElement("span");
      number.className = "code-search-line-number";
      number.textContent = line.number;

      const text = doc.createElement("span");
      text.className = "code-search-line-text";
      if (
        line.isMatch &&
        Number.isFinite(result.matchStart) &&
        Number.isFinite(result.matchEnd) &&
        result.matchEnd > result.matchStart
      ) {
        const before = line.text.slice(0, result.matchStart);
        const matchText = line.text.slice(result.matchStart, result.matchEnd);
        const after = line.text.slice(result.matchEnd);
        if (before) text.appendChild(doc.createTextNode(before));
        const highlight = doc.createElement("span");
        highlight.className = "code-search-match";
        highlight.textContent = matchText;
        text.appendChild(highlight);
        if (after) text.appendChild(doc.createTextNode(after));
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
      if (!run.lines)
        run.lines = (file.textFull || file.text || "").split("\n");
      while (run.lineIndex < run.lines.length) {
        if (performance.now() - start > searchSliceBudget) {
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
            snippet: buildSnippetLines(run.lines, run.lineIndex),
          };
          state.search.results.push(result);
          appended = true;
          if (state.search.results.length >= searchCap) {
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
    const minLength = source === "live" ? searchLiveMin : searchExplicitMin;
    const showMinLengthError = source !== "live";
    const validation = validateSearchQuery(rawQuery, {
      minLength,
      showMinLengthError,
      mode,
      caseSensitive,
      onError: setSearchError,
      onClearError: clearSearchError,
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
      matcher,
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
    }, searchLiveDebounce);
  }

  return {
    updateSearchAvailability,
    resetSearchPanel,
    startSearchRun,
    cancelSearchRun,
    scheduleLiveSearch,
    setSearchError,
    clearSearchError,
    updateSearchSummary,
    updateSearchResultsMeta,
    updateSearchCapNotice,
    updateSearchButtons,
  };
}
