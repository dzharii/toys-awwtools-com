export function createPanelsController(ctx) {
  const {
    state,
    els,
    doc = document,
    formatBytes,
    persistSettings,
    syncReferenceFeatureEnabled,
    syncSymbolReferenceFeatureEnabled,
    destroyReferencePanel,
    destroySymbolReferencePanel
  } = ctx;

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
    persistSettings(state.settings);
    syncReferenceFeatureEnabled();
    syncSymbolReferenceFeatureEnabled();
    applyDisplaySettings();
    closeSettings();
  }

  function applyDisplaySettings() {
    const pres = doc.querySelectorAll(".file-section pre");
    pres.forEach(pre => pre.classList.add("nowrap"));
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
    const langBlock = doc.createElement("div");
    const langTitle = doc.createElement("h3");
    langTitle.textContent = "Top languages";
    langBlock.appendChild(langTitle);
    if (!langEntries.length) {
      const row = doc.createElement("div");
      row.textContent = "No data";
      langBlock.appendChild(row);
    } else {
      langEntries.slice(0, 8).forEach(([lang, lines]) => {
        const row = doc.createElement("div");
        row.textContent = `${lang}: ${lines} lines`;
        langBlock.appendChild(row);
      });
    }

    const largestBlock = doc.createElement("div");
    const largestTitle = doc.createElement("h3");
    largestTitle.textContent = "Largest files";
    largestBlock.appendChild(largestTitle);
    if (!state.aggregate.largest.length) {
      const row = doc.createElement("div");
      row.textContent = "No data";
      largestBlock.appendChild(row);
    } else {
      state.aggregate.largest.forEach(f => {
        const row = doc.createElement("div");
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

  return {
    closePanels,
    openSettings,
    closeSettings,
    saveSettingsFromForm,
    applyDisplaySettings,
    openStatsPanel,
    renderStatsPanel,
    closeStatsPanel,
    openLogPanel,
    closeLogPanel,
    openSupportPanel,
    closeSupportPanel
  };
}
