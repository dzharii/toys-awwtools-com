(() => {
  const LS_PREFIX = "ffhelper:";
  const LS_KEYS = {
    xml: `${LS_PREFIX}xml`,
    inputMode: `${LS_PREFIX}inputMode`,
    inputPaths: `${LS_PREFIX}inputPaths`,
    termuxRoot: `${LS_PREFIX}termuxRoot`,
    assumedInputDir: `${LS_PREFIX}assumedInputDir`,
    outDir: `${LS_PREFIX}outDir`,
    outExt: `${LS_PREFIX}outExt`,
    outPrefix: `${LS_PREFIX}outPrefix`,
    outSuffix: `${LS_PREFIX}outSuffix`,
    conflictMode: `${LS_PREFIX}conflictMode`,
    variables: `${LS_PREFIX}variables`,
    favorites: `${LS_PREFIX}favorites`,
    lastTemplateId: `${LS_PREFIX}lastTemplateId`,
  };

  const els = {
    modePaste: document.getElementById("modePaste"),
    modePick: document.getElementById("modePick"),
    pasteMode: document.getElementById("pasteMode"),
    pickMode: document.getElementById("pickMode"),
    inputPaths: document.getElementById("inputPaths"),
    filePicker: document.getElementById("filePicker"),
    dirPicker: document.getElementById("dirPicker"),
    assumedInputDir: document.getElementById("assumedInputDir"),
    pickedFilesInfo: document.getElementById("pickedFilesInfo"),
    pickedFilesList: document.getElementById("pickedFilesList"),
    termuxRoot: document.getElementById("termuxRoot"),
    outDir: document.getElementById("outDir"),
    outExt: document.getElementById("outExt"),
    outPrefix: document.getElementById("outPrefix"),
    outSuffix: document.getElementById("outSuffix"),
    conflictMode: document.getElementById("conflictMode"),
    varsContainer: document.getElementById("varsContainer"),
    searchBox: document.getElementById("searchBox"),
    resultCount: document.getElementById("resultCount"),
    tagsBar: document.getElementById("tagsBar"),
    activeFilter: document.getElementById("activeFilter"),
    templatesList: document.getElementById("templatesList"),
    toast: document.getElementById("toast"),

    editBtn: document.getElementById("editBtn"),
    editModal: document.getElementById("editModal"),
    formTab: document.getElementById("editTabForm"),
    xmlTab: document.getElementById("editTabXml"),
    tabs: Array.from(document.querySelectorAll("#editModal .tab")),
    formSelect: document.getElementById("formTemplateSelect"),
    formType: document.getElementById("formTemplateType"),
    formTitle: document.getElementById("formTemplateTitle"),
    formTags: document.getElementById("formTemplateTags"),
    formNotes: document.getElementById("formTemplateNotes"),
    formBody: document.getElementById("formTemplateBody"),
    formPreview: document.getElementById("formTemplatePreview"),
    saveFormTemplate: document.getElementById("saveFormTemplate"),
    addFormTemplate: document.getElementById("addFormTemplate"),
    deleteFormTemplate: document.getElementById("deleteFormTemplate"),

    xmlEditor: document.getElementById("xmlEditor"),
    validateXml: document.getElementById("validateXml"),
    saveXml: document.getElementById("saveXml"),
    exportXml: document.getElementById("exportXml"),
    importXmlInput: document.getElementById("importXmlInput"),
    xmlStatus: document.getElementById("xmlStatus"),

    refBtn: document.getElementById("refBtn"),
    refModal: document.getElementById("refModal"),
    refTabs: Array.from(document.querySelectorAll("#refModal .tab")),
    refContent: document.getElementById("refContent"),
    refStatus: document.getElementById("refStatus"),

    resetBtn: document.getElementById("resetBtn"),
  };

  let state = {
    spec: null,
    variables: [],
    templates: [],
    favorites: new Set(),
    activeTag: null,
    search: "",
    inputs: [],
    pickedInputs: [],
    lastValidXml: null,
  };

  function logError(message, err) {
    console.error(message, err);
    showToast(message, true);
  }

  function showToast(message, isError = false) {
    els.toast.textContent = message;
    els.toast.classList.remove("hidden");
    els.toast.style.borderColor = isError ? "var(--danger)" : "var(--accent)";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.add("hidden"), 1600);
  }

  function lsGet(key, fallback = "") {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }
  function lsSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
  function lsGetJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function lsSetJson(key, value) {
    lsSet(key, JSON.stringify(value));
  }

  function parseXml(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) {
      throw new Error("Invalid XML");
    }
    return doc;
  }

  function loadXml() {
    const embedded = document.getElementById("defaultXml").textContent.trim();
    const stored = lsGet(LS_KEYS.xml, "");
    const activeXml = stored || embedded;
    try {
      const doc = parseXml(activeXml);
      state.lastValidXml = activeXml;
      return { doc, embedded };
    } catch (err) {
      logError("Template XML invalid, using last valid", err);
      const fallbackXml = state.lastValidXml || embedded;
      const doc = parseXml(fallbackXml);
      return { doc, embedded };
    }
  }

  function extractSpec(doc) {
    const specNode = doc.querySelector("ffhelper > spec");
    const getText = (sel) => specNode?.querySelector(sel)?.textContent?.trim() || "";
    return {
      title: getText("title") || "ffhelper",
      termuxInputRoot: getText("termuxInputRoot") || "/storage/emulated/0",
      defaultOutputDir: getText("defaultOutputDir") || "/storage/emulated/0/Movies/exports",
      defaultOutExt: getText("defaultOutExt") || "mp4",
    };
  }

  function extractVariables(doc) {
    return Array.from(doc.querySelectorAll("ffhelper > variables > var")).map((v) => ({
      id: v.getAttribute("id"),
      type: v.getAttribute("type") || "text",
      label: v.getAttribute("label") || v.getAttribute("id"),
      default: v.getAttribute("default") ?? "",
      min: v.getAttribute("min"),
      max: v.getAttribute("max"),
      options: (v.getAttribute("options") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
  }

  function extractTemplates(doc) {
    return Array.from(doc.querySelectorAll("ffhelper > templates > template")).map((t) => {
      const id = t.getAttribute("id");
      const type = t.getAttribute("type") || "command";
      const title = t.querySelector("title")?.textContent?.trim() || id;
      const tags = t.querySelector("tags")?.textContent?.trim() || "";
      const notes = t.querySelector("notes")?.textContent?.trim() || "";
      const body = t.querySelector("body")?.textContent || "";
      return {
        id,
        type,
        title,
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        notes,
        body,
      };
    });
  }

  function initDefaultsFromSpec(spec) {
    if (!lsGet(LS_KEYS.termuxRoot)) lsSet(LS_KEYS.termuxRoot, spec.termuxInputRoot);
    if (!lsGet(LS_KEYS.outDir)) lsSet(LS_KEYS.outDir, spec.defaultOutputDir);
    if (!lsGet(LS_KEYS.outExt)) lsSet(LS_KEYS.outExt, spec.defaultOutExt);
  }

  function setInputMode(mode) {
    els.modePaste.checked = mode === "paste";
    els.modePick.checked = mode === "pick";
    els.pasteMode.classList.toggle("hidden", mode !== "paste");
    els.pickMode.classList.toggle("hidden", mode !== "pick");
    lsSet(LS_KEYS.inputMode, mode);
    recomputeInputs();
    renderTemplates();
  }

  function recomputeInputs() {
    if (els.modePaste.checked) {
      const lines = els.inputPaths.value.split(/\r?\n/);
      state.inputs = lines.map((l) => l.trim()).filter(Boolean);
    } else {
      state.inputs = state.pickedInputs.slice();
    }
  }

  function quotePath(path) {
    const escaped = String(path).replace(/"/g, '\\"');
    return `"${escaped}"`;
  }

  function splitStemExt(path) {
    const base = path.split("/").pop() || path;
    const idx = base.lastIndexOf(".");
    if (idx === -1) return { stem: base, ext: "" };
    return { stem: base.slice(0, idx), ext: base.slice(idx + 1) };
  }

  function computeOutRaw(inputPath) {
    const outDir = els.outDir.value.trim() || "";
    const outExt = (els.outExt.value.trim() || "").replace(/^\./, "");
    const prefix = els.outPrefix.value || "";
    const suffix = els.outSuffix.value || "";
    const { stem } = splitStemExt(inputPath);
    return [outDir.replace(/\/$/, ""), `${prefix}${stem}${suffix}.${outExt}`]
      .filter(Boolean)
      .join("/");
  }

  function computeOutPath(inputPath) {
    return quotePath(computeOutRaw(inputPath));
  }

  function buildContext(inputPath, inputs) {
    const outDir = els.outDir.value.trim() || "";
    const outExt = (els.outExt.value.trim() || "").replace(/^\./, "");
    const prefix = els.outPrefix.value || "";
    const suffix = els.outSuffix.value || "";
    const { stem, ext } = splitStemExt(inputPath || inputs[0] || "");
    const varsValues = lsGetJson(LS_KEYS.variables, {});
    const overwriteFlag = els.conflictMode.value === "overwrite" ? "-y" : "";

    return {
      in: inputPath,
      inputs,
      outDir,
      stem,
      ext,
      outExt,
      prefix,
      suffix,
      overwriteFlag,
      varsValues,
    };
  }

  function renderTemplateBody(body, ctx) {
    const tokenRe = /{{\s*([^}]+)\s*}}/g;
    return body.replace(tokenRe, (match, rawToken) => {
      const token = rawToken.trim();
      if (token === "in") return quotePath(ctx.in || "");
      if (token.startsWith("in")) {
        const n = Number(token.slice(2));
        if (Number.isFinite(n) && n > 0) return quotePath(ctx.inputs[n - 1] || "");
      }
      if (token === "inputs") return ctx.inputs.map(quotePath).join(" ");
      if (token === "outDir") return quotePath(ctx.outDir);
      if (token === "stem") return ctx.stem;
      if (token === "ext") return ctx.ext;
      if (token === "outExt") return ctx.outExt;
      if (token === "out") return computeOutPath(ctx.in || ctx.inputs[0] || "");
      if (token === "prefix") return quotePath(ctx.prefix).replace(/^"|"$/g, "");
      if (token === "suffix") return quotePath(ctx.suffix).replace(/^"|"$/g, "");
      if (token === "overwriteFlag") return ctx.overwriteFlag;
      if (token.startsWith("var:")) {
        const id = token.slice(4);
        const val = ctx.varsValues[id];
        return val != null && val !== "" ? String(val).replace(/"/g, '\\"') : "";
      }
      return match;
    });
  }

  function renderTemplateOutput(tpl) {
    recomputeInputs();
    const inputs = state.inputs;
    if (!inputs.length) return "";
    const ctxFirst = buildContext(inputs[0], inputs);
    if (tpl.type === "script") {
      return renderTemplateBody(tpl.body, ctxFirst);
    }

    const conflict = els.conflictMode.value;
    const commands = inputs.map((inp) => {
      const ctx = buildContext(inp, inputs);
      return renderTemplateBody(tpl.body, ctx);
    });

    if (conflict === "overwrite") return commands.join("\n");

    const header = ["#!/usr/bin/env bash", "set -euo pipefail", ""].join("\n");
    const snippets = inputs.map((inp, i) => {
      const ctx = buildContext(inp, inputs);
      const rendered = renderTemplateBody(tpl.body, ctx);
      const outRaw = computeOutRaw(inp);
      const outQuoted = quotePath(outRaw);
      const inQuoted = quotePath(inp);
      let cmd = rendered.split(outQuoted).join('"$OUT"');
      cmd = cmd.split(inQuoted).join('"$IN"');

      let pre = `# input ${i + 1}\nIN=${inQuoted}\nOUT_BASE=${outQuoted}\nOUT="$OUT_BASE"\n`;
      if (conflict === "fail") {
        pre += 'if [[ -e "$OUT" ]]; then echo "Output exists: $OUT" >&2; exit 1; fi\n';
      } else if (conflict === "safeSuffix") {
        pre += `if [[ -e "$OUT" ]]; then
  i=1
  BASE_NOEXT="\${OUT_BASE%.*}"
  while [[ -e "\${BASE_NOEXT}_$i.${ctx.outExt}" ]]; do
    i=$((i+1))
  done
  OUT="\${BASE_NOEXT}_$i.${ctx.outExt}"
fi\n`;
      }
      return pre + cmd;
    });

    return header + snippets.join("\n\n");
  }

  function clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderVariables() {
    clearElement(els.varsContainer);
    const saved = lsGetJson(LS_KEYS.variables, {});
    for (const v of state.variables) {
      const wrap = document.createElement("label");
      wrap.textContent = v.label;
      const input =
        v.type === "select"
          ? document.createElement("select")
          : document.createElement("input");

      input.dataset.varId = v.id;
      if (v.type === "number") {
        input.type = "number";
        if (v.min) input.min = v.min;
        if (v.max) input.max = v.max;
        input.step = "any";
      } else if (v.type === "text") {
        input.type = "text";
      } else if (v.type === "select") {
        for (const opt of v.options) {
          const o = document.createElement("option");
          o.value = opt;
          o.textContent = opt;
          input.appendChild(o);
        }
      }
      input.value = saved[v.id] ?? v.default ?? "";
      input.addEventListener("input", () => {
        const next = lsGetJson(LS_KEYS.variables, {});
        next[v.id] = input.value;
        lsSetJson(LS_KEYS.variables, next);
        renderTemplates();
        renderFormPreview();
      });
      wrap.appendChild(input);
      els.varsContainer.appendChild(wrap);
    }
  }

  function allTags() {
    const tags = new Set();
    for (const tpl of state.templates) {
      tpl.tags.forEach((t) => tags.add(t));
    }
    return Array.from(tags).sort();
  }

  function renderTagsBar() {
    clearElement(els.tagsBar);
    for (const tag of allTags()) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tag" + (state.activeTag === tag ? " active" : "");
      b.textContent = tag;
      b.addEventListener("click", () => {
        state.activeTag = state.activeTag === tag ? null : tag;
        renderTagsBar();
        renderActiveFilter();
        renderTemplates();
      });
      els.tagsBar.appendChild(b);
    }
  }

  function renderActiveFilter() {
    if (!state.activeTag) {
      els.activeFilter.classList.add("hidden");
      els.activeFilter.textContent = "";
      return;
    }
    els.activeFilter.classList.remove("hidden");
    clearElement(els.activeFilter);
    const span = document.createElement("span");
    span.textContent = `Filter: ${state.activeTag}`;
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "ghost";
    clearBtn.textContent = "Clear";
    clearBtn.addEventListener("click", () => {
      state.activeTag = null;
      renderTagsBar();
      renderActiveFilter();
      renderTemplates();
    });
    els.activeFilter.appendChild(span);
    els.activeFilter.appendChild(clearBtn);
  }

  function filterTemplates() {
    const q = state.search.trim().toLowerCase();
    const tag = state.activeTag;
    return state.templates.filter((tpl) => {
      if (tag && !tpl.tags.includes(tag)) return false;
      if (!q) return true;
      const hay = [tpl.title, tpl.notes, tpl.tags.join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  function renderTemplates() {
    const filtered = filterTemplates();
    const favIds = state.favorites;
    const sorted = filtered.slice().sort((a, b) => {
      const af = favIds.has(a.id) ? 1 : 0;
      const bf = favIds.has(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return a.title.localeCompare(b.title);
    });

    els.resultCount.textContent = `${sorted.length} / ${state.templates.length}`;
    const prevScrollTop = els.templatesList.scrollTop;
    clearElement(els.templatesList);
    const frag = document.createDocumentFragment();

    for (const tpl of sorted) {
      const card = document.createElement("div");
      card.className = "template-card";

      const titleRow = document.createElement("div");
      titleRow.className = "template-title";
      const h3 = document.createElement("h3");
      h3.textContent = tpl.title;
      const favBtn = document.createElement("button");
      favBtn.type = "button";
      favBtn.className = "favorite ghost";
      favBtn.textContent = state.favorites.has(tpl.id) ? "★" : "☆";
      favBtn.title = "Toggle favorite";
      favBtn.addEventListener("click", () => {
        toggleFavorite(tpl.id);
        renderTemplates();
      });
      titleRow.appendChild(h3);
      titleRow.appendChild(favBtn);
      card.appendChild(titleRow);

      if (tpl.tags.length) {
        const meta = document.createElement("div");
        meta.className = "template-meta";
        tpl.tags.forEach((tag) => {
          const t = document.createElement("button");
          t.type = "button";
          t.className = "tag";
          t.textContent = tag;
          t.addEventListener("click", () => {
            state.activeTag = tag;
            renderTagsBar();
            renderActiveFilter();
            renderTemplates();
          });
          meta.appendChild(t);
        });
        card.appendChild(meta);
      }

      if (tpl.notes) {
        const notes = document.createElement("div");
        notes.className = "hint";
        notes.textContent = tpl.notes;
        card.appendChild(notes);
      }

      const rendered = document.createElement("pre");
      rendered.className = "rendered";
      const output = renderTemplateOutput(tpl);
      rendered.textContent = output || "Add inputs to render.";
      card.appendChild(rendered);

      const actions = document.createElement("div");
      actions.className = "template-actions";
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => copyText(output));

      const useBtn = document.createElement("button");
      useBtn.type = "button";
      useBtn.className = "ghost";
      useBtn.textContent = "Use";
      useBtn.addEventListener("click", () => {
        lsSet(LS_KEYS.lastTemplateId, tpl.id);
        showToast(`Selected ${tpl.title}`);
      });

      actions.appendChild(copyBtn);
      actions.appendChild(useBtn);
      card.appendChild(actions);

      frag.appendChild(card);
    }

    els.templatesList.appendChild(frag);
    els.templatesList.scrollTop = prevScrollTop;
  }

  function copyText(text) {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Copied"))
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          document.execCommand("copy");
          showToast("Copied");
        } catch (err) {
          logError("Copy failed", err);
        } finally {
          ta.remove();
        }
      });
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    lsSetJson(LS_KEYS.favorites, Array.from(state.favorites));
  }

  function handlePickedFiles(files, usedRelativePaths) {
    const root = els.termuxRoot.value.trim().replace(/\/$/, "");
    const assumedDir = els.assumedInputDir.value.trim().replace(/\/$/, "");
    const paths = [];
    let usedAssumed = false;

    for (const f of files) {
      const rel = f.webkitRelativePath || "";
      if (rel) {
        paths.push(`${root}/${rel}`.replace(/\/+/g, "/"));
      } else {
        usedAssumed = true;
        paths.push(`${assumedDir}/${f.name}`.replace(/\/+/g, "/"));
      }
    }

    state.pickedInputs = paths.filter(Boolean);
    recomputeInputs();

    clearElement(els.pickedFilesList);
    for (const p of state.pickedInputs) {
      const li = document.createElement("li");
      li.textContent = p;
      els.pickedFilesList.appendChild(li);
    }

    els.pickedFilesInfo.textContent = usedAssumed
      ? "Some paths are assumed from file names + assumed directory."
      : usedRelativePaths
        ? "Paths built from relative paths + Termux root."
        : "";

    renderTemplates();
    renderFormPreview();
  }

  function wireInputs() {
    const mode = lsGet(LS_KEYS.inputMode, "paste");
    setInputMode(mode);

    els.modePaste.addEventListener("change", () => setInputMode("paste"));
    els.modePick.addEventListener("change", () => setInputMode("pick"));

    els.inputPaths.value = lsGet(LS_KEYS.inputPaths, "");
    els.inputPaths.addEventListener("input", () => {
      lsSet(LS_KEYS.inputPaths, els.inputPaths.value);
      recomputeInputs();
      renderTemplates();
      renderFormPreview();
    });

    els.termuxRoot.value = lsGet(LS_KEYS.termuxRoot, "");
    els.termuxRoot.addEventListener("input", () => {
      lsSet(LS_KEYS.termuxRoot, els.termuxRoot.value);
      if (els.modePick.checked) renderTemplates();
    });

    els.assumedInputDir.value = lsGet(LS_KEYS.assumedInputDir, "");
    els.assumedInputDir.addEventListener("input", () => {
      lsSet(LS_KEYS.assumedInputDir, els.assumedInputDir.value);
      if (els.modePick.checked) renderTemplates();
    });

    els.outDir.value = lsGet(LS_KEYS.outDir, "");
    els.outDir.addEventListener("input", () => {
      lsSet(LS_KEYS.outDir, els.outDir.value);
      renderTemplates();
      renderFormPreview();
    });

    els.outExt.value = lsGet(LS_KEYS.outExt, "");
    els.outExt.addEventListener("input", () => {
      lsSet(LS_KEYS.outExt, els.outExt.value);
      renderTemplates();
      renderFormPreview();
    });

    els.outPrefix.value = lsGet(LS_KEYS.outPrefix, "");
    els.outPrefix.addEventListener("input", () => {
      lsSet(LS_KEYS.outPrefix, els.outPrefix.value);
      renderTemplates();
      renderFormPreview();
    });

    els.outSuffix.value = lsGet(LS_KEYS.outSuffix, "_out");
    els.outSuffix.addEventListener("input", () => {
      lsSet(LS_KEYS.outSuffix, els.outSuffix.value);
      renderTemplates();
      renderFormPreview();
    });

    els.conflictMode.value = lsGet(LS_KEYS.conflictMode, "overwrite");
    els.conflictMode.addEventListener("change", () => {
      lsSet(LS_KEYS.conflictMode, els.conflictMode.value);
      renderTemplates();
      renderFormPreview();
    });

    els.filePicker.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      handlePickedFiles(files, false);
    });
    els.dirPicker.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      handlePickedFiles(files, true);
    });

    els.searchBox.addEventListener("input", () => {
      state.search = els.searchBox.value;
      renderTemplates();
    });
  }

  function openModal(modal) {
    if (!modal.open) modal.showModal();
  }

  function wireEditModal() {
    els.editBtn.addEventListener("click", () => {
      syncXmlEditor();
      syncFormEditorOptions();
      openModal(els.editModal);
    });

    els.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        els.tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const name = tab.dataset.tab;
        els.formTab.classList.toggle("hidden", name !== "form");
        els.xmlTab.classList.toggle("hidden", name !== "xml");
      });
    });

    els.formSelect.addEventListener("change", () => {
      loadFormTemplate(els.formSelect.value);
    });

    els.formType.addEventListener("change", renderFormPreview);
    els.formTitle.addEventListener("input", renderFormPreview);
    els.formTags.addEventListener("input", renderFormPreview);
    els.formNotes.addEventListener("input", renderFormPreview);
    els.formBody.addEventListener("input", renderFormPreview);

    els.saveFormTemplate.addEventListener("click", saveFormTemplate);
    els.addFormTemplate.addEventListener("click", addNewTemplate);
    els.deleteFormTemplate.addEventListener("click", deleteFormTemplate);

    els.validateXml.addEventListener("click", () => validateXml(els.xmlEditor.value));
    els.saveXml.addEventListener("click", () => {
      const ok = validateXml(els.xmlEditor.value);
      if (ok) {
        lsSet(LS_KEYS.xml, els.xmlEditor.value.trim());
        init();
        els.xmlStatus.textContent = "Saved.";
      }
    });

    els.exportXml.addEventListener("click", () => {
      const blob = new Blob([state.lastValidXml || ""], { type: "text/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ffhelper-templates.xml";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    els.importXmlInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      els.xmlEditor.value = text;
      validateXml(text);
    });
  }

  function validateXml(text) {
    try {
      parseXml(text.trim());
      els.xmlStatus.textContent = "XML is valid.";
      els.xmlStatus.style.color = "var(--accent)";
      return true;
    } catch (err) {
      els.xmlStatus.textContent = `XML error: ${err.message}`;
      els.xmlStatus.style.color = "var(--danger)";
      console.error("XML validation error", err);
      return false;
    }
  }

  function syncXmlEditor() {
    els.xmlEditor.value = state.lastValidXml || "";
    els.xmlStatus.textContent = "";
  }

  function syncFormEditorOptions() {
    clearElement(els.formSelect);
    for (const tpl of state.templates) {
      const opt = document.createElement("option");
      opt.value = tpl.id;
      opt.textContent = `${tpl.title} (${tpl.id})`;
      els.formSelect.appendChild(opt);
    }
    if (state.templates[0]) loadFormTemplate(state.templates[0].id);
  }

  function loadFormTemplate(id) {
    const tpl = state.templates.find((t) => t.id === id);
    if (!tpl) return;
    els.formSelect.value = id;
    els.formType.value = tpl.type;
    els.formTitle.value = tpl.title;
    els.formTags.value = tpl.tags.join(", ");
    els.formNotes.value = tpl.notes;
    els.formBody.value = tpl.body;
    renderFormPreview();
  }

  function renderFormPreview() {
    const previewTpl = {
      id: els.formSelect.value || "preview",
      type: els.formType.value,
      title: els.formTitle.value,
      tags: els.formTags.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: els.formNotes.value,
      body: els.formBody.value,
    };
    els.formPreview.textContent = renderTemplateOutput(previewTpl) || "Add inputs to preview.";
  }

  function saveFormTemplate() {
    const id = els.formSelect.value;
    const idx = state.templates.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const next = {
      ...state.templates[idx],
      type: els.formType.value,
      title: els.formTitle.value.trim() || id,
      tags: els.formTags.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: els.formNotes.value.trim(),
      body: els.formBody.value,
    };
    state.templates[idx] = next;
    persistTemplatesToXml();
    renderTemplates();
    syncFormEditorOptions();
    showToast("Template saved");
  }

  function addNewTemplate() {
    const baseId = `tpl_${Date.now()}`;
    const tpl = {
      id: baseId,
      type: "command",
      title: "New template",
      tags: [],
      notes: "",
      body: "ffmpeg -i {{in}} {{out}}",
    };
    state.templates.push(tpl);
    persistTemplatesToXml();
    syncFormEditorOptions();
    els.formSelect.value = baseId;
    loadFormTemplate(baseId);
    showToast("Added template");
  }

  function deleteFormTemplate() {
    const id = els.formSelect.value;
    const idx = state.templates.findIndex((t) => t.id === id);
    if (idx === -1) return;
    state.templates.splice(idx, 1);
    state.favorites.delete(id);
    lsSetJson(LS_KEYS.favorites, Array.from(state.favorites));
    persistTemplatesToXml();
    syncFormEditorOptions();
    renderTemplates();
    showToast("Deleted template");
  }

  function persistTemplatesToXml() {
    try {
      const { embedded } = loadXml();
      const doc = parseXml(state.lastValidXml || embedded);
      const templatesNode = doc.querySelector("ffhelper > templates");
      if (!templatesNode) return;
      while (templatesNode.firstChild) templatesNode.removeChild(templatesNode.firstChild);

      for (const tpl of state.templates) {
        const t = doc.createElement("template");
        t.setAttribute("id", tpl.id);
        t.setAttribute("type", tpl.type);
        const title = doc.createElement("title");
        title.textContent = tpl.title;
        const tags = doc.createElement("tags");
        tags.textContent = tpl.tags.join(",");
        const body = doc.createElement("body");
        body.textContent = tpl.body;
        const notes = doc.createElement("notes");
        notes.textContent = tpl.notes;
        t.appendChild(title);
        t.appendChild(tags);
        t.appendChild(body);
        t.appendChild(notes);
        templatesNode.appendChild(t);
      }

      const xml = new XMLSerializer().serializeToString(doc);
      state.lastValidXml = xml;
      lsSet(LS_KEYS.xml, xml);
    } catch (err) {
      logError("Failed to persist templates", err);
    }
  }

  function wireReferenceModal() {
    els.refBtn.addEventListener("click", () => {
      openModal(els.refModal);
      loadReference(els.refTabs[0].dataset.ref);
    });
    els.refTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        els.refTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        loadReference(tab.dataset.ref);
      });
    });
  }

  async function loadReference(name) {
    els.refStatus.textContent = "Loading…";
    els.refContent.textContent = "";
    try {
      const res = await fetch(`ffmpeg-samples/${name}`);
      const text = await res.text();
      if (name.endsWith(".html")) {
        els.refContent.textContent = text;
      } else {
        els.refContent.textContent = text;
      }
      els.refStatus.textContent = "";
    } catch (err) {
      els.refStatus.textContent = "Failed to load reference.";
      console.error("Reference load error", err);
    }
  }

  function wireReset() {
    els.resetBtn.addEventListener("click", () => {
      if (!confirm("Reset ffhelper settings and templates?")) return;
      Object.values(LS_KEYS).forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      init();
      showToast("Reset to defaults");
    });
  }

  function initFavorites() {
    const favs = lsGetJson(LS_KEYS.favorites, []);
    state.favorites = new Set(favs);
  }

  function init() {
    const { doc } = loadXml();
    state.spec = extractSpec(doc);
    initDefaultsFromSpec(state.spec);
    state.variables = extractVariables(doc);
    state.templates = extractTemplates(doc);
    initFavorites();

    wireInputs();
    renderVariables();
    renderTagsBar();
    renderActiveFilter();
    renderTemplates();
    syncFormEditorOptions();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch((err) => {
        console.warn("SW registration failed", err);
      });
    }
  }

  wireEditModal();
  wireReferenceModal();
  wireReset();
  init();
})();
