/* FFmpeg Helper main logic */
(() => {
  const STORAGE_KEYS = {
    schemaVersion: "ffh.schemaVersion",
    settings: "ffh.settings",
    userTemplates: "ffh.userTemplates",
    favorites: "ffh.favorites",
    recentIds: "ffh.recentIds",
    perTemplateParams: "ffh.perTemplateParams",
    perTemplateOutputs: "ffh.perTemplateOutputs",
  };

  const DEFAULT_SETTINGS = {
    inputBaseDir: "",
    outputBaseDir: "",
    outputPattern: "{inputBaseName}_out{inputExt}",
    ffmpegBinary: "ffmpeg",
    quoteMode: "auto",
    outputFormat: "plain",
    sourceMode: "picker",
    searchQuery: "",
    favoritesOnly: false,
    sortMode: "category",
  };

  const state = {
    schemaVersion: 1,
    settings: { ...DEFAULT_SETTINGS },
    files: [],
    templates: [],
    userTemplates: [],
    favorites: new Set(),
    recentIds: [],
    perTemplateParams: {},
    perTemplateOutputs: {},
    diagnostics: [],
    hasStorage: true,
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function safeReadStorage(key) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? null : v;
    } catch (err) {
      state.hasStorage = false;
      logDiag("warn", `localStorage read failed for ${key}`, err);
      return null;
    }
  }

  function safeWriteStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      state.hasStorage = false;
      logDiag("warn", `localStorage write failed for ${key}`, err);
    }
  }

  function logDiag(level, message, err) {
    const entry = { ts: new Date().toISOString(), level, message, err: err ? String(err) : "" };
    state.diagnostics.push(entry);
    renderDiagnostics();
    const prefix = "[ffh]";
    if (level === "error") console.error(prefix, message, err);
    else if (level === "warn") console.warn(prefix, message, err);
    else console.log(prefix, message);
  }

  function renderDiagnostics() {
    const details = els.diagnostics;
    const pre = els.diagnosticsLog;
    if (!details || !pre) return;
    if (state.diagnostics.length === 0) {
      details.classList.add("hidden");
      return;
    }
    details.classList.remove("hidden");
    pre.textContent = state.diagnostics
      .slice(-200)
      .map((d) => `${d.ts} [${d.level}] ${d.message}${d.err ? `\n  ${d.err}` : ""}`)
      .join("\n");
  }

  function showToast(text, kind = "ok") {
    const t = els.toast;
    t.textContent = text;
    t.classList.remove("hidden");
    t.style.borderColor = kind === "error" ? "var(--danger)" : "var(--border)";
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.add("hidden"), 1600);
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function loadState() {
    const schemaRaw = safeReadStorage(STORAGE_KEYS.schemaVersion);
    const schema = schemaRaw ? Number(schemaRaw) : 1;
    state.schemaVersion = Number.isFinite(schema) ? schema : 1;

    const settingsRaw = safeReadStorage(STORAGE_KEYS.settings);
    if (settingsRaw) {
      try {
        const parsed = JSON.parse(settingsRaw);
        state.settings = { ...DEFAULT_SETTINGS, ...parsed };
      } catch (err) {
        logDiag("error", "Failed to parse settings JSON", err);
      }
    }

    const userTemplatesRaw = safeReadStorage(STORAGE_KEYS.userTemplates);
    if (userTemplatesRaw) {
      try {
        const parsed = JSON.parse(userTemplatesRaw);
        if (Array.isArray(parsed)) state.userTemplates = parsed;
      } catch (err) {
        logDiag("error", "Failed to parse user templates JSON", err);
      }
    }

    const favoritesRaw = safeReadStorage(STORAGE_KEYS.favorites);
    if (favoritesRaw) {
      try {
        const ids = JSON.parse(favoritesRaw);
        if (Array.isArray(ids)) state.favorites = new Set(ids);
      } catch (err) {
        logDiag("warn", "Failed to parse favorites JSON", err);
      }
    }

    const recentRaw = safeReadStorage(STORAGE_KEYS.recentIds);
    if (recentRaw) {
      try {
        const ids = JSON.parse(recentRaw);
        if (Array.isArray(ids)) state.recentIds = ids;
      } catch (err) {
        logDiag("warn", "Failed to parse recent ids JSON", err);
      }
    }

    const perParamsRaw = safeReadStorage(STORAGE_KEYS.perTemplateParams);
    if (perParamsRaw) {
      try {
        const obj = JSON.parse(perParamsRaw);
        if (obj && typeof obj === "object") state.perTemplateParams = obj;
      } catch (err) {
        logDiag("warn", "Failed to parse per-template params JSON", err);
      }
    }

    const perOutputsRaw = safeReadStorage(STORAGE_KEYS.perTemplateOutputs);
    if (perOutputsRaw) {
      try {
        const obj = JSON.parse(perOutputsRaw);
        if (obj && typeof obj === "object") state.perTemplateOutputs = obj;
      } catch (err) {
        logDiag("warn", "Failed to parse per-template outputs JSON", err);
      }
    }
  }

  function saveSettings() {
    safeWriteStorage(STORAGE_KEYS.schemaVersion, String(state.schemaVersion));
    safeWriteStorage(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  }

  function saveUserTemplates() {
    safeWriteStorage(STORAGE_KEYS.userTemplates, JSON.stringify(state.userTemplates));
  }

  function saveFavorites() {
    safeWriteStorage(STORAGE_KEYS.favorites, JSON.stringify([...state.favorites]));
  }

  function saveRecent() {
    safeWriteStorage(STORAGE_KEYS.recentIds, JSON.stringify(state.recentIds.slice(0, 50)));
  }

  function savePerTemplate() {
    safeWriteStorage(STORAGE_KEYS.perTemplateParams, JSON.stringify(state.perTemplateParams));
    safeWriteStorage(STORAGE_KEYS.perTemplateOutputs, JSON.stringify(state.perTemplateOutputs));
  }

  function parseBuiltInTemplates() {
    const script = $("builtinTemplates");
    if (!script) {
      logDiag("error", "builtinTemplates script not found");
      return [];
    }
    const xmlText = script.textContent.trim();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      logDiag("error", "Built-in templates XML parse error", parseError.textContent);
      return [];
    }
    const templates = [];
    doc.querySelectorAll("template").forEach((node) => {
      const id = node.getAttribute("id") || "";
      const label = node.getAttribute("label") || id;
      const category = node.getAttribute("category") || "General";
      const tagsRaw = node.getAttribute("tags") || "";
      const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
      const dangerous = node.getAttribute("dangerous") === "true";
      const description = (node.querySelector("description")?.textContent || "").trim();
      const notes = (node.querySelector("notes")?.textContent || "").trim();
      const body = (node.querySelector("body")?.textContent || "").trim();
      const params = [];
      node.querySelectorAll("params > param").forEach((p) => {
        const pid = p.getAttribute("id");
        if (!pid) return;
        params.push({
          id: pid,
          label: p.getAttribute("label") || pid,
          type: p.getAttribute("type") || "text",
          default: p.getAttribute("default") ?? "",
          min: p.getAttribute("min"),
          max: p.getAttribute("max"),
          step: p.getAttribute("step"),
          hint: p.getAttribute("hint") || "",
        });
      });
      if (!id || !body) return;
      templates.push({
        id,
        label,
        description,
        category,
        tags,
        body,
        notes,
        params,
        dangerous,
        builtIn: true,
      });
    });
    return templates;
  }

  function mergeTemplates(builtIn, userTemplates) {
    const byId = new Map();
    builtIn.forEach((t) => byId.set(t.id, t));
    userTemplates.forEach((t) => {
      if (!t || !t.id || !t.body) return;
      byId.set(t.id, { ...t, builtIn: false });
    });
    return [...byId.values()];
  }

  function normalizeFilesFromPicker(fileList) {
    return Array.from(fileList || []).map((f) => f.name).filter(Boolean);
  }

  function normalizeFilesFromManual(text) {
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  function splitFileName(name) {
    const base = name.split("/").pop() || name;
    const idx = base.lastIndexOf(".");
    if (idx <= 0) return { fileName: base, baseName: base, ext: "" };
    return { fileName: base, baseName: base.slice(0, idx), ext: base.slice(idx) };
  }

  function joinPath(baseDir, fileName) {
    if (!baseDir) return fileName;
    if (baseDir.endsWith("/")) return baseDir + fileName;
    return baseDir + "/" + fileName;
  }

  function needsQuoting(value) {
    return /[\s'"\\$&;|<>*?()[\]{}!`]/.test(value);
  }

  function quoteBash(value) {
    return `'${value.replace(/'/g, `'\\''`)}'`;
  }

  function applyQuote(name, raw) {
    const mode = state.settings.quoteMode;
    const quoteable =
      name.endsWith("Path") ||
      name.endsWith("Dir") ||
      name === "inputFileName" ||
      name === "outputFileName";
    if (!quoteable) return raw;
    if (mode === "off") return raw;
    if (mode === "on") return quoteBash(raw);
    return needsQuoting(raw) ? quoteBash(raw) : raw;
  }

  function computeContext(fileName, index, effectiveSettings, template, templateState) {
    const { fileName: inputFileName, baseName: inputBaseName, ext: inputExt } = splitFileName(fileName);
    const inputBaseDir = effectiveSettings.inputBaseDir;
    const outputBaseDir = effectiveSettings.outputBaseDir;

    const inputPathRaw = joinPath(inputBaseDir, inputFileName);
    const outputFileNameRaw = expandPattern(
      effectiveSettings.outputPattern,
      { inputFileName, inputBaseName, inputExt, inputBaseDir, outputBaseDir, index, index1: index + 1 },
      false
    );
    const outputPathRaw = joinPath(outputBaseDir, outputFileNameRaw);

    const ctxRaw = {
      inputBaseDir,
      outputBaseDir,
      inputFileName,
      inputBaseName,
      inputExt,
      inputPath: inputPathRaw,
      outputFileName: outputFileNameRaw,
      outputPath: outputPathRaw,
      index: String(index),
      index1: String(index + 1),
      ffmpegBinary: effectiveSettings.ffmpegBinary || "ffmpeg",
    };

    // Add per-template output overrides as placeholders.
    const outOverride = templateState.outputOverrides || {};
    if (outOverride.outputSubdir) ctxRaw.outputSubdir = outOverride.outputSubdir;

    // Add params placeholders.
    (template.params || []).forEach((p) => {
      const v = templateState.params?.[p.id] ?? p.default ?? "";
      ctxRaw[p.id] = String(v);
    });

    const ctx = {};
    for (const [k, v] of Object.entries(ctxRaw)) {
      ctx[k] = applyQuote(k, String(v));
    }
    return ctx;
  }

  function expandPattern(pattern, ctx, quoteValues) {
    let out = pattern || "";
    for (const [k, raw] of Object.entries(ctx)) {
      const val = quoteValues ? applyQuote(k, String(raw)) : String(raw);
      out = out.split(`{${k}}`).join(val);
    }
    return out;
  }

  function expandTemplate(template, fileName, index) {
    const templateState = getTemplateState(template.id, template);
    const effectiveSettings = getEffectiveSettingsForTemplate(template.id);
    const ctx = computeContext(fileName, index, effectiveSettings, template, templateState);
    let body = template.body;

    for (const [k, v] of Object.entries(ctx)) {
      body = body.split(`{${k}}`).join(v);
    }

    if (!body.includes("{ffmpegBinary}") && effectiveSettings.ffmpegBinary && effectiveSettings.ffmpegBinary !== "ffmpeg") {
      body = body.replace(/^ffmpeg\b/gm, effectiveSettings.ffmpegBinary);
    }

    return body.trim();
  }

  function packageCommands(commandBlocks) {
    const fmt = state.settings.outputFormat;
    const blocks = commandBlocks.filter(Boolean);
    if (fmt === "plain") return blocks.join("\n\n");
    if (fmt === "oneliner") {
      const flattened = blocks
        .map((b) => b.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(" && "))
        .filter(Boolean);
      return flattened.join(" && ");
    }
    if (fmt === "script") {
      const header = "#!/data/data/com.termux/files/usr/bin/bash\nset -euo pipefail\n\n";
      return header + blocks.join("\n\n") + "\n";
    }
    return blocks.join("\n\n");
  }

  function getTemplateState(id, template) {
    const params = state.perTemplateParams[id] || {};
    const outputOverrides = state.perTemplateOutputs[id] || {};
    // Fill defaults if missing.
    (template.params || []).forEach((p) => {
      if (params[p.id] === undefined) params[p.id] = p.default ?? "";
    });
    return { params, outputOverrides };
  }

  function getEffectiveSettingsForTemplate(templateId) {
    const override = state.perTemplateOutputs[templateId] || {};
    return {
      ...state.settings,
      outputBaseDir: override.outputBaseDir || state.settings.outputBaseDir,
      outputPattern: override.outputPattern || state.settings.outputPattern,
    };
  }

  function computeWarnings() {
    const warnings = [];
    if (!state.files.length) warnings.push({ kind: "warn", text: "Select at least one file to generate commands." });
    if (!state.settings.inputBaseDir) warnings.push({ kind: "warn", text: "Input base directory is empty." });
    if (!state.settings.outputBaseDir) warnings.push({ kind: "warn", text: "Output base directory is empty." });
    if (!state.settings.outputPattern) warnings.push({ kind: "warn", text: "Output pattern is empty." });
    if (state.files.length) {
      const first = state.files[0];
      const { fileName, baseName, ext } = splitFileName(first);
      const inputPath = joinPath(state.settings.inputBaseDir, fileName);
      const outputFileName = expandPattern(
        state.settings.outputPattern,
        {
          inputFileName: fileName,
          inputBaseName: baseName,
          inputExt: ext,
          inputBaseDir: state.settings.inputBaseDir,
          outputBaseDir: state.settings.outputBaseDir,
          index: 0,
          index1: 1,
        },
        false
      );
      const outputPath = joinPath(state.settings.outputBaseDir, outputFileName);
      if (!ext) warnings.push({ kind: "warn", text: "First file has no extension." });
      if (outputFileName && !outputFileName.includes(".")) {
        warnings.push({ kind: "warn", text: "Output filename has no extension." });
      }
      if (inputPath && outputPath && inputPath === outputPath) {
        warnings.push({ kind: "danger", text: "Output path equals input path. You may overwrite your source." });
      }
    }
    return warnings;
  }

  function renderPreview() {
    const first = state.files[0];
    const effectiveSettings = state.settings;
    if (!first) {
      els.inputPreview.textContent = "—";
      els.outputPreview.textContent = "—";
      els.outputExample.textContent = "—";
    } else {
      const { fileName, baseName, ext } = splitFileName(first);
      const inputPath = joinPath(effectiveSettings.inputBaseDir, fileName);
      const outputFileName = expandPattern(
        effectiveSettings.outputPattern,
        {
          inputFileName: fileName,
          inputBaseName: baseName,
          inputExt: ext,
          inputBaseDir: effectiveSettings.inputBaseDir,
          outputBaseDir: effectiveSettings.outputBaseDir,
          index: 0,
          index1: 1,
        },
        false
      );
      const outputPath = joinPath(effectiveSettings.outputBaseDir, outputFileName);
      els.inputPreview.textContent = inputPath;
      els.outputPreview.textContent = outputPath;
      els.outputExample.textContent = outputFileName || "—";
    }

    const warnings = computeWarnings();
    els.warnings.innerHTML = "";
    warnings.forEach((w) => {
      const li = document.createElement("li");
      li.className = w.kind;
      li.textContent = w.text;
      els.warnings.appendChild(li);
    });
  }

  function filteredTemplates() {
    let list = state.templates.slice();
    const query = (state.settings.searchQuery || "").toLowerCase().trim();
    if (state.settings.favoritesOnly) list = list.filter((t) => state.favorites.has(t.id));

    if (query) {
      const parts = query.split(/\s+/).filter(Boolean);
      list = list.filter((t) => {
        const hay = `${t.label} ${t.description} ${t.category} ${(t.tags || []).join(" ")} ${t.body}`.toLowerCase();
        return parts.every((p) => hay.includes(p));
      });
    }

    const sortMode = state.settings.sortMode;
    const favs = state.favorites;
    if (sortMode === "label") {
      list.sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortMode === "favorites") {
      list.sort((a, b) => (favs.has(b.id) - favs.has(a.id)) || a.label.localeCompare(b.label));
    } else if (sortMode === "recent") {
      const order = new Map(state.recentIds.map((id, i) => [id, i]));
      list.sort((a, b) => {
        const ai = order.get(a.id);
        const bi = order.get(b.id);
        if (ai != null && bi != null) return ai - bi;
        if (ai != null) return -1;
        if (bi != null) return 1;
        return a.label.localeCompare(b.label);
      });
    } else {
      list.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
    }

    return list;
  }

  function renderTemplates() {
    const container = els.templateList;
    container.innerHTML = "";

    const list = filteredTemplates();
    let lastCategory = null;
    const frag = document.createDocumentFragment();
    list.forEach((t) => {
      if (state.settings.sortMode === "category" && t.category !== lastCategory) {
        lastCategory = t.category;
        const h = document.createElement("div");
        h.className = "category-heading";
        h.textContent = t.category;
        frag.appendChild(h);
      }
      frag.appendChild(renderTemplateCard(t));
    });

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "hint";
      empty.textContent = "No templates match the current filter.";
      frag.appendChild(empty);
    }

    container.appendChild(frag);
  }

  function renderTemplateCard(template) {
    const card = document.createElement("article");
    card.className = "template-card";
    card.dataset.id = template.id;

    const header = document.createElement("div");
    header.className = "template-header";

    const title = document.createElement("div");
    title.className = "template-title";
    title.textContent = template.label;

    const meta = document.createElement("div");
    meta.className = "template-meta";

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "secondary icon";
    favBtn.setAttribute("aria-pressed", state.favorites.has(template.id) ? "true" : "false");
    favBtn.textContent = state.favorites.has(template.id) ? "★" : "☆";
    favBtn.title = "Toggle favorite";
    favBtn.addEventListener("click", () => toggleFavorite(template.id));

    meta.appendChild(favBtn);
    if (template.dangerous) {
      const danger = document.createElement("div");
      danger.className = "danger-flag";
      danger.textContent = "Dangerous";
      meta.appendChild(danger);
    }

    header.appendChild(title);
    header.appendChild(meta);

    const desc = document.createElement("div");
    desc.className = "hint";
    desc.textContent = template.description || "";

    const tagsRow = document.createElement("div");
    tagsRow.className = "template-meta";
    (template.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      span.addEventListener("click", () => {
        state.settings.searchQuery = tag;
        els.search.value = tag;
        saveSettings();
        renderTemplates();
      });
      tagsRow.appendChild(span);
    });

    const bodyDetails = document.createElement("details");
    bodyDetails.className = "template-body";
    const bodySummary = document.createElement("summary");
    bodySummary.textContent = "Template body";
    const bodyPre = document.createElement("pre");
    bodyPre.textContent = template.body.trim();
    bodyDetails.appendChild(bodySummary);
    bodyDetails.appendChild(bodyPre);

    const paramBlock = renderParamInputs(template);
    const overrideBlock = renderOutputOverrides(template);

    const generated = document.createElement("div");
    generated.className = "generated";

    const genHeader = document.createElement("div");
    genHeader.className = "generated-header";
    const genTitle = document.createElement("div");
    genTitle.textContent = "Generated commands";

    const genActions = document.createElement("div");
    genActions.className = "generated-actions";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => onCopyTemplate(template));

    if (!template.builtIn) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "secondary";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openTemplateEditor(template));
      genActions.appendChild(editBtn);
    } else {
      const cloneBtn = document.createElement("button");
      cloneBtn.type = "button";
      cloneBtn.className = "secondary";
      cloneBtn.textContent = "Clone";
      cloneBtn.addEventListener("click", () => openTemplateEditor({ ...template, builtIn: false, id: "" }, true));
      genActions.appendChild(cloneBtn);
    }

    genActions.appendChild(copyBtn);
    genHeader.appendChild(genTitle);
    genHeader.appendChild(genActions);

    const genPre = document.createElement("pre");
    genPre.textContent = state.files.length
      ? packageCommands(state.files.map((f, i) => expandTemplate(template, f, i)))
      : "Select at least one file to generate commands.";

    if (template.notes) {
      const notes = document.createElement("div");
      notes.className = "hint";
      notes.textContent = template.notes;
      generated.appendChild(notes);
    }

    const safety = computeSafetyFlags(template);
    if (safety.length) {
      const warnList = document.createElement("ul");
      warnList.className = "warnings";
      safety.forEach((w) => {
        const li = document.createElement("li");
        li.className = w.kind;
        li.textContent = w.text;
        warnList.appendChild(li);
      });
      generated.appendChild(warnList);
    }

    generated.appendChild(genHeader);
    generated.appendChild(genPre);

    card.appendChild(header);
    if (template.description) card.appendChild(desc);
    if ((template.tags || []).length) card.appendChild(tagsRow);
    if (paramBlock) card.appendChild(paramBlock);
    if (overrideBlock) card.appendChild(overrideBlock);
    card.appendChild(bodyDetails);
    card.appendChild(generated);

    return card;
  }

  function computeSafetyFlags(template) {
    const flags = [];
    const body = template.body.toLowerCase();
    if (/\brm\b/.test(body) || /\bmv\b/.test(body)) {
      flags.push({ kind: "danger", text: "Template includes rm/mv; review before running." });
    }
    if (/\s-?y\s/.test(body)) {
      flags.push({ kind: "warn", text: "Uses -y (overwrite output without prompt)." });
    }
    return flags;
  }

  function renderParamInputs(template) {
    if (!template.params || !template.params.length) return null;
    const wrap = document.createElement("div");
    wrap.className = "param-row";

    template.params.forEach((p) => {
      const field = document.createElement("div");
      field.className = "field";

      const label = document.createElement("label");
      label.textContent = p.label;
      label.setAttribute("for", `${template.id}__param__${p.id}`);

      let input;
      if (p.type === "number") {
        input = document.createElement("input");
        input.type = "number";
        if (p.min != null) input.min = p.min;
        if (p.max != null) input.max = p.max;
        if (p.step != null) input.step = p.step;
      } else {
        input = document.createElement("input");
        input.type = "text";
      }
      input.id = `${template.id}__param__${p.id}`;
      input.value = (state.perTemplateParams[template.id]?.[p.id] ?? p.default ?? "").toString();
      input.addEventListener("input", () => {
        state.perTemplateParams[template.id] = state.perTemplateParams[template.id] || {};
        state.perTemplateParams[template.id][p.id] = input.value;
        savePerTemplate();
        renderPreview();
        renderTemplates();
      });

      field.appendChild(label);
      field.appendChild(input);
      if (p.hint) {
        const hint = document.createElement("div");
        hint.className = "hint";
        hint.textContent = p.hint;
        field.appendChild(hint);
      }
      wrap.appendChild(field);
    });

    return wrap;
  }

  function renderOutputOverrides(template) {
    const details = document.createElement("details");
    details.className = "data";
    const summary = document.createElement("summary");
    summary.textContent = "Output overrides (per template)";
    details.appendChild(summary);

    const body = document.createElement("div");
    body.className = "override-row";

    const override = state.perTemplateOutputs[template.id] || {};
    const effective = getEffectiveSettingsForTemplate(template.id);

    const baseField = document.createElement("div");
    baseField.className = "field";
    const baseLabel = document.createElement("label");
    baseLabel.textContent = "Output base dir override";
    const baseInput = document.createElement("input");
    baseInput.type = "text";
    baseInput.value = override.outputBaseDir || "";
    baseInput.placeholder = effective.outputBaseDir;
    baseInput.addEventListener("input", () => {
      state.perTemplateOutputs[template.id] = state.perTemplateOutputs[template.id] || {};
      state.perTemplateOutputs[template.id].outputBaseDir = baseInput.value.trim();
      savePerTemplate();
      renderPreview();
      renderTemplates();
    });
    baseField.appendChild(baseLabel);
    baseField.appendChild(baseInput);

    const patternField = document.createElement("div");
    patternField.className = "field";
    const patternLabel = document.createElement("label");
    patternLabel.textContent = "Output pattern override";
    const patternInput = document.createElement("input");
    patternInput.type = "text";
    patternInput.value = override.outputPattern || "";
    patternInput.placeholder = effective.outputPattern;
    patternInput.addEventListener("input", () => {
      state.perTemplateOutputs[template.id] = state.perTemplateOutputs[template.id] || {};
      state.perTemplateOutputs[template.id].outputPattern = patternInput.value;
      savePerTemplate();
      renderPreview();
      renderTemplates();
    });
    patternField.appendChild(patternLabel);
    patternField.appendChild(patternInput);

    const subdirField = document.createElement("div");
    subdirField.className = "field";
    const subdirLabel = document.createElement("label");
    subdirLabel.textContent = "Output subdir";
    const subdirInput = document.createElement("input");
    subdirInput.type = "text";
    subdirInput.value = override.outputSubdir || "";
    subdirInput.placeholder = "optional";
    subdirInput.addEventListener("input", () => {
      state.perTemplateOutputs[template.id] = state.perTemplateOutputs[template.id] || {};
      state.perTemplateOutputs[template.id].outputSubdir = subdirInput.value.trim();
      savePerTemplate();
      renderTemplates();
    });
    subdirField.appendChild(subdirLabel);
    subdirField.appendChild(subdirInput);

    body.appendChild(baseField);
    body.appendChild(patternField);
    body.appendChild(subdirField);
    details.appendChild(body);
    return details;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      logDiag("warn", "navigator.clipboard failed, falling back", err);
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      logDiag("error", "Copy fallback failed", err);
      return false;
    }
  }

  async function onCopyTemplate(template) {
    if (!state.files.length) {
      showToast("No files selected", "error");
      return;
    }
    if (template.dangerous) {
      const ok = confirm("This template is marked dangerous. Copy anyway?");
      if (!ok) return;
    }

    const text = packageCommands(state.files.map((f, i) => expandTemplate(template, f, i)));
    const ok = await copyText(text);
    if (ok) {
      showToast("Copied");
      touchRecent(template.id);
    } else {
      showToast("Copy failed", "error");
    }
  }

  function touchRecent(id) {
    state.recentIds = [id, ...state.recentIds.filter((x) => x !== id)];
    saveRecent();
    if (state.settings.sortMode === "recent") renderTemplates();
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    saveFavorites();
    renderTemplates();
  }

  // Template editor
  let editorMode = "new"; // new | edit | clone
  let editingTemplate = null;

  function openTemplateEditor(template = null, cloneBuiltIn = false) {
    editorMode = template && template.id ? "edit" : "new";
    if (cloneBuiltIn) editorMode = "clone";
    editingTemplate = template;

    els.templateEditorTitle.textContent =
      editorMode === "edit" ? "Edit template" : editorMode === "clone" ? "Clone template" : "New template";

    $("templateId").value = template?.id || "";
    $("templateLabel").value = template?.label || "";
    $("templateDescription").value = template?.description || "";
    $("templateCategory").value = template?.category || "";
    $("templateTags").value = (template?.tags || []).join(", ");
    $("templateBody").value = template?.body || "";
    $("templateDangerous").checked = !!template?.dangerous;

    renderParamsEditor(template?.params || []);

    els.deleteTemplate.classList.toggle("hidden", editorMode !== "edit" || template?.builtIn);
    els.cloneTemplate.classList.toggle("hidden", editorMode !== "edit");

    updateTemplatePreview();
    els.templateEditor.showModal();
  }

  function closeTemplateEditor() {
    editingTemplate = null;
    els.templateEditor.close();
  }

  function renderParamsEditor(params) {
    const list = els.paramsList;
    list.innerHTML = "";
    params.forEach((p, idx) => addParamEditorRow(p, idx));
  }

  function addParamEditorRow(p = {}, idx = 0) {
    const item = document.createElement("div");
    item.className = "param-item";

    const row = document.createElement("div");
    row.className = "field-row";

    const idField = document.createElement("div");
    idField.className = "field half";
    const idLabel = document.createElement("label");
    idLabel.textContent = "Id";
    const idInput = document.createElement("input");
    idInput.type = "text";
    idInput.value = p.id || "";
    idField.appendChild(idLabel);
    idField.appendChild(idInput);

    const labelField = document.createElement("div");
    labelField.className = "field half";
    const labelLabel = document.createElement("label");
    labelLabel.textContent = "Label";
    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.value = p.label || "";
    labelField.appendChild(labelLabel);
    labelField.appendChild(labelInput);

    row.appendChild(idField);
    row.appendChild(labelField);

    const row2 = document.createElement("div");
    row2.className = "field-row";

    const typeField = document.createElement("div");
    typeField.className = "field half";
    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Type";
    const typeSelect = document.createElement("select");
    ["text", "number"].forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      if (p.type === t) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    typeField.appendChild(typeLabel);
    typeField.appendChild(typeSelect);

    const defField = document.createElement("div");
    defField.className = "field half";
    const defLabel = document.createElement("label");
    defLabel.textContent = "Default";
    const defInput = document.createElement("input");
    defInput.type = "text";
    defInput.value = p.default ?? "";
    defField.appendChild(defLabel);
    defField.appendChild(defInput);

    row2.appendChild(typeField);
    row2.appendChild(defField);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "secondary";
    removeBtn.textContent = "Remove param";
    removeBtn.addEventListener("click", () => item.remove());

    item.appendChild(row);
    item.appendChild(row2);
    item.appendChild(removeBtn);

    els.paramsList.appendChild(item);
  }

  function collectParamsFromEditor() {
    const params = [];
    els.paramsList.querySelectorAll(".param-item").forEach((item) => {
      const inputs = item.querySelectorAll("input, select");
      const [idInput, labelInput, typeSelect, defInput] = inputs;
      const id = idInput.value.trim();
      if (!id) return;
      params.push({
        id,
        label: labelInput.value.trim() || id,
        type: typeSelect.value,
        default: defInput.value,
      });
    });
    return params;
  }

  function updateTemplatePreview() {
    const body = $("templateBody").value || "";
    if (!state.files.length) {
      els.templatePreview.textContent = "Select a file to preview.";
      return;
    }
    const temp = {
      id: $("templateId").value || "preview",
      label: $("templateLabel").value || "Preview",
      body,
      params: collectParamsFromEditor(),
      dangerous: $("templateDangerous").checked,
    };
    const preview = expandTemplate(temp, state.files[0], 0);
    els.templatePreview.textContent = preview || "—";
  }

  function saveTemplateFromEditor() {
    const label = $("templateLabel").value.trim();
    const body = $("templateBody").value.trim();
    if (!label || !body) {
      showToast("Label and body required", "error");
      return;
    }
    const tags = $("templateTags").value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const category = $("templateCategory").value.trim() || "General";

    let id = $("templateId").value.trim();
    if (!id || editorMode === "clone") {
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      id = `user-${slug || Date.now()}`;
    }

    const template = {
      id,
      label,
      description: $("templateDescription").value.trim(),
      category,
      tags,
      body,
      dangerous: $("templateDangerous").checked,
      params: collectParamsFromEditor(),
    };

    const existingIndex = state.userTemplates.findIndex((t) => t.id === id);
    if (existingIndex >= 0) state.userTemplates[existingIndex] = template;
    else state.userTemplates.push(template);

    saveUserTemplates();
    state.templates = mergeTemplates(state.templates.filter((t) => t.builtIn), state.userTemplates);
    closeTemplateEditor();
    renderTemplates();
  }

  function deleteTemplateFromEditor() {
    if (!editingTemplate) return;
    const ok = confirm("Delete this template?");
    if (!ok) return;
    state.userTemplates = state.userTemplates.filter((t) => t.id !== editingTemplate.id);
    saveUserTemplates();
    state.templates = mergeTemplates(state.templates.filter((t) => t.builtIn), state.userTemplates);
    closeTemplateEditor();
    renderTemplates();
  }

  function cloneTemplateFromEditor() {
    if (!editingTemplate) return;
    openTemplateEditor({ ...editingTemplate, id: "", builtIn: false }, true);
  }

  // Import/export
  function exportBackup() {
    const data = {
      schemaVersion: state.schemaVersion,
      settings: state.settings,
      userTemplates: state.userTemplates,
      favorites: [...state.favorites],
      recentIds: state.recentIds,
      perTemplateParams: state.perTemplateParams,
      perTemplateOutputs: state.perTemplateOutputs,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ffmpeg-helper-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup exported");
  }

  let pendingImport = null;

  function handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        pendingImport = JSON.parse(reader.result);
        els.importDialog.showModal();
      } catch (err) {
        logDiag("error", "Import JSON parse failed", err);
        showToast("Import failed", "error");
      }
    };
    reader.readAsText(file);
  }

  function applyImport(mode) {
    if (!pendingImport) return;
    const imported = pendingImport;
    pendingImport = null;

    if (mode === "replace") {
      state.settings = { ...DEFAULT_SETTINGS, ...(imported.settings || {}) };
      state.userTemplates = Array.isArray(imported.userTemplates) ? imported.userTemplates : [];
      state.favorites = new Set(Array.isArray(imported.favorites) ? imported.favorites : []);
      state.recentIds = Array.isArray(imported.recentIds) ? imported.recentIds : [];
      state.perTemplateParams = imported.perTemplateParams && typeof imported.perTemplateParams === "object" ? imported.perTemplateParams : {};
      state.perTemplateOutputs = imported.perTemplateOutputs && typeof imported.perTemplateOutputs === "object" ? imported.perTemplateOutputs : {};
    } else {
      state.settings = { ...state.settings, ...(imported.settings || {}) };
      const importedUser = Array.isArray(imported.userTemplates) ? imported.userTemplates : [];
      const byId = new Map(state.userTemplates.map((t) => [t.id, t]));
      importedUser.forEach((t) => {
        if (t?.id) byId.set(t.id, t);
      });
      state.userTemplates = [...byId.values()];
      const fav = new Set(state.favorites);
      (imported.favorites || []).forEach((id) => fav.add(id));
      state.favorites = fav;
      state.recentIds = Array.isArray(imported.recentIds) ? imported.recentIds : state.recentIds;
      state.perTemplateParams = { ...state.perTemplateParams, ...(imported.perTemplateParams || {}) };
      state.perTemplateOutputs = { ...state.perTemplateOutputs, ...(imported.perTemplateOutputs || {}) };
    }

    saveSettings();
    saveUserTemplates();
    saveFavorites();
    saveRecent();
    savePerTemplate();

    state.templates = mergeTemplates(state.templates.filter((t) => t.builtIn), state.userTemplates);
    renderSettings();
    renderPreview();
    renderTemplates();
    showToast("Import complete");
  }

  function resetSettings() {
    const ok = confirm("Reset all settings?");
    if (!ok) return;
    state.settings = { ...DEFAULT_SETTINGS };
    saveSettings();
    renderSettings();
    renderPreview();
    renderTemplates();
  }

  function resetTemplates() {
    const ok = confirm("Delete all user templates?");
    if (!ok) return;
    state.userTemplates = [];
    saveUserTemplates();
    state.templates = mergeTemplates(state.templates.filter((t) => t.builtIn), []);
    renderTemplates();
  }

  function resetFavorites() {
    const ok = confirm("Clear all favorites?");
    if (!ok) return;
    state.favorites = new Set();
    saveFavorites();
    renderTemplates();
  }

  function renderSettings() {
    els.inputBaseDir.value = state.settings.inputBaseDir;
    els.outputBaseDir.value = state.settings.outputBaseDir;
    els.outputPattern.value = state.settings.outputPattern;
    els.ffmpegBinary.value = state.settings.ffmpegBinary;
    els.quoteMode.value = state.settings.quoteMode;
    els.outputFormat.value = state.settings.outputFormat;
    els.sortMode.value = state.settings.sortMode;
    els.search.value = state.settings.searchQuery;
    els.favoritesFilter.setAttribute("aria-pressed", state.settings.favoritesOnly ? "true" : "false");
    els.favoritesFilter.classList.toggle("secondary", !state.settings.favoritesOnly);

    document.querySelectorAll("input[name='sourceMode']").forEach((r) => {
      r.checked = r.value === state.settings.sourceMode;
    });
    els.pickerBlock.classList.toggle("hidden", state.settings.sourceMode !== "picker");
    els.manualBlock.classList.toggle("hidden", state.settings.sourceMode !== "manual");
  }

  function wireEvents() {
    els.inputBaseDir.addEventListener("input", () => {
      state.settings.inputBaseDir = els.inputBaseDir.value.trim();
      saveSettings();
      renderPreview();
      renderTemplates();
    });

    els.outputBaseDir.addEventListener("input", () => {
      state.settings.outputBaseDir = els.outputBaseDir.value.trim();
      saveSettings();
      renderPreview();
      renderTemplates();
    });

    els.outputPattern.addEventListener("input", () => {
      state.settings.outputPattern = els.outputPattern.value;
      saveSettings();
      renderPreview();
      renderTemplates();
    });

    els.ffmpegBinary.addEventListener("input", () => {
      state.settings.ffmpegBinary = els.ffmpegBinary.value.trim() || "ffmpeg";
      saveSettings();
      renderTemplates();
    });

    els.quoteMode.addEventListener("change", () => {
      state.settings.quoteMode = els.quoteMode.value;
      saveSettings();
      renderTemplates();
    });

    els.outputFormat.addEventListener("change", () => {
      state.settings.outputFormat = els.outputFormat.value;
      saveSettings();
      renderTemplates();
    });

    els.sortMode.addEventListener("change", () => {
      state.settings.sortMode = els.sortMode.value;
      saveSettings();
      renderTemplates();
    });

    els.search.addEventListener(
      "input",
      debounce(() => {
        state.settings.searchQuery = els.search.value;
        saveSettings();
        renderTemplates();
      }, 120)
    );

    els.favoritesFilter.addEventListener("click", () => {
      state.settings.favoritesOnly = !state.settings.favoritesOnly;
      saveSettings();
      renderSettings();
      renderTemplates();
    });

    els.newTemplate.addEventListener("click", () => openTemplateEditor(null));

    document.querySelectorAll("input[name='sourceMode']").forEach((r) => {
      r.addEventListener("change", () => {
        state.settings.sourceMode = r.value;
        saveSettings();
        renderSettings();
        syncFilesFromInputs();
      });
    });

    els.sourceFiles.addEventListener("change", () => {
      if (state.settings.sourceMode !== "picker") return;
      state.files = normalizeFilesFromPicker(els.sourceFiles.files);
      renderSelectedFiles();
      renderPreview();
      renderTemplates();
    });

    els.manualFiles.addEventListener(
      "input",
      debounce(() => {
        if (state.settings.sourceMode !== "manual") return;
        state.files = normalizeFilesFromManual(els.manualFiles.value);
        renderSelectedFiles();
        renderPreview();
        renderTemplates();
      }, 150)
    );

    document.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => insertAtCursor(els.outputPattern, btn.dataset.insert));
    });

    els.resetSettings.addEventListener("click", resetSettings);
    els.resetTemplates.addEventListener("click", resetTemplates);
    els.resetFavorites.addEventListener("click", resetFavorites);
    els.exportData.addEventListener("click", exportBackup);
    els.importData.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) handleImportFile(file);
      e.target.value = "";
    });

    // Editor events
    els.addParam.addEventListener("click", () => addParamEditorRow({}, Date.now()));
    els.templateBody.addEventListener("input", debounce(updateTemplatePreview, 120));
    els.templateLabel.addEventListener("input", debounce(updateTemplatePreview, 120));
    els.templateDangerous.addEventListener("change", updateTemplatePreview);

    els.saveTemplate.addEventListener("click", (e) => {
      e.preventDefault();
      saveTemplateFromEditor();
    });
    els.deleteTemplate.addEventListener("click", deleteTemplateFromEditor);
    els.cloneTemplate.addEventListener("click", cloneTemplateFromEditor);

    // Import dialog
    els.confirmImport.addEventListener("click", (e) => {
      e.preventDefault();
      const mode = els.importForm.importMode.value;
      els.importDialog.close();
      applyImport(mode);
    });

    // Offline badge
    window.addEventListener("online", renderOfflineBadge);
    window.addEventListener("offline", renderOfflineBadge);
  }

  function insertAtCursor(input, text) {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const v = input.value;
    input.value = v.slice(0, start) + text + v.slice(end);
    input.selectionStart = input.selectionEnd = start + text.length;
    input.dispatchEvent(new Event("input"));
    input.focus();
  }

  function syncFilesFromInputs() {
    if (state.settings.sourceMode === "picker") {
      state.files = normalizeFilesFromPicker(els.sourceFiles.files);
    } else {
      state.files = normalizeFilesFromManual(els.manualFiles.value);
    }
    renderSelectedFiles();
    renderPreview();
    renderTemplates();
  }

  function renderSelectedFiles() {
    if (!state.files.length) {
      els.selectedFiles.textContent = "No files selected.";
      return;
    }
    els.selectedFiles.textContent = state.files.join("\n");
  }

  function renderOfflineBadge() {
    const offline = !navigator.onLine;
    els.offlineBadge.classList.toggle("hidden", !offline);
  }

  // Service worker + update banner
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("./service-worker.js");
        logDiag("info", "Service worker registered");

        navigator.serviceWorker.ready
          .then(() => {
            if (els.offlineReadyBadge) els.offlineReadyBadge.classList.remove("hidden");
          })
          .catch(() => {});

        function showUpdate() {
          els.updateBanner.classList.remove("hidden");
        }

        if (reg.waiting) showUpdate();
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) showUpdate();
          });
        });

        els.updateBanner.addEventListener("click", async () => {
          if (!reg.waiting) {
            window.location.reload();
            return;
          }
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (err) {
        logDiag("warn", "Service worker registration failed", err);
      }
    });
  }

  function initEls() {
    [
      "inputBaseDir",
      "outputBaseDir",
      "outputPattern",
      "ffmpegBinary",
      "quoteMode",
      "outputFormat",
      "sortMode",
      "resetSettings",
      "resetTemplates",
      "resetFavorites",
      "exportData",
      "importData",
      "pickerBlock",
      "manualBlock",
      "sourceFiles",
      "manualFiles",
      "selectedFiles",
      "inputPreview",
      "outputPreview",
      "warnings",
      "outputExample",
      "search",
      "favoritesFilter",
      "newTemplate",
      "templateList",
      "toast",
      "diagnostics",
      "diagnosticsLog",
      "templateEditor",
      "templateEditorTitle",
      "templateForm",
      "templatePreview",
      "addParam",
      "paramsList",
      "saveTemplate",
      "deleteTemplate",
      "cloneTemplate",
      "importDialog",
      "importForm",
      "confirmImport",
      "offlineBadge",
      "offlineReadyBadge",
      "updateBanner",
    ].forEach((id) => (els[id] = $(id)));
  }

  function init() {
    initEls();
    loadState();

    const builtIn = parseBuiltInTemplates();
    state.templates = mergeTemplates(builtIn, state.userTemplates);

    renderSettings();
    syncFilesFromInputs();
    renderOfflineBadge();
    wireEvents();
    registerServiceWorker();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
