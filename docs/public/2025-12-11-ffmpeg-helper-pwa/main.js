(() => {
  const defaultXml = (document.getElementById('default-templates')?.textContent || '').trim();
  const STORAGE_KEY = 'ffhelper_state_v1';

  const baseState = () => ({
    inputMode: 'paste',
    pasted: '',
    assumedDir: '',
    termuxRoot: '',
    outputDir: '',
    prefix: '',
    suffix: '',
    outExt: '',
    conflict: 'overwrite',
    favorites: [],
    search: '',
    favoriteOnly: false,
    activeTag: '',
    templateXml: defaultXml,
    lastGoodXml: defaultXml,
    variableValues: {},
    files: [],
    lastFileDescriptors: [],
    filesUseAssumed: false
  });

  const state = baseState();
  let parsed = null;
  let templates = [];
  let variables = [];

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        Object.assign(state, baseState(), JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved state', e);
    }
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist state', e);
    }
  }

  function parseXml(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) throw new Error(parserError.textContent || 'Invalid XML');
    const root = doc.querySelector('ffhelper');
    if (!root) throw new Error('Missing ffhelper root');
    const spec = {
      title: (root.querySelector('title')?.textContent || 'ffhelper').trim(),
      termuxInputRoot: (root.querySelector('termuxInputRoot')?.textContent || '/storage/emulated/0').trim(),
      defaultOutputDir: (root.querySelector('defaultOutputDir')?.textContent || '/storage/emulated/0/Movies/exports').trim(),
      defaultOutExt: (root.querySelector('defaultOutExt')?.textContent || 'mp4').trim()
    };
    const vars = [];
    root.querySelectorAll('variables var').forEach((v) => {
      vars.push({
        id: v.getAttribute('id'),
        type: v.getAttribute('type') || 'text',
        label: v.getAttribute('label') || v.getAttribute('id'),
        default: v.getAttribute('default') || '',
        min: v.getAttribute('min'),
        max: v.getAttribute('max'),
        options: (v.getAttribute('options') || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      });
    });
    const tmpl = [];
    root.querySelectorAll('templates template').forEach((t) => {
      tmpl.push({
        id: t.getAttribute('id'),
        type: t.getAttribute('type') || 'command',
        title: (t.querySelector('title')?.textContent || '').trim(),
        tags: (t.querySelector('tags')?.textContent || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        body: (t.querySelector('body')?.textContent || '').trim(),
        notes: (t.querySelector('notes')?.textContent || '').trim()
      });
    });
    return { spec, vars, tmpl };
  }

  const escapeQuotes = (str) => String(str || '').replace(/"/g, '\\"');
  const quotePath = (str) => `"${escapeQuotes(str)}"`;
  const joinPath = (a, b) => {
    if (!a) return b || '';
    if (!b) return a;
    return `${a.replace(/\/+$/, '')}/${b.replace(/^\/+/, '')}`;
  };

  function applyPickedFolder(kind, folderName) {
    const baseRoot = state.termuxRoot || parsed?.spec?.termuxInputRoot || '';
    let suggested = folderName;
    if (kind === 'termuxRoot') {
      suggested = state.termuxRoot?.trim()
        ? state.termuxRoot.trim()
        : (baseRoot.startsWith('/') ? joinPath(baseRoot, folderName) : folderName);
    } else if (baseRoot.startsWith('/')) {
      suggested = joinPath(baseRoot, folderName);
    }
    const inputEl = $('#' + kind);
    if (inputEl) inputEl.value = suggested;
    state[kind] = suggested;
    persistState();
    if (kind === 'assumedDir') rebuildFilesFromMemory();
    updatePreview();
    renderTemplates();
  }

  async function pickDirectory(kind) {
    try {
      if (window.showDirectoryPicker) {
        const handle = await window.showDirectoryPicker();
        applyPickedFolder(kind, handle.name);
        showToast('Folder selected — edit to Termux path if needed');
        return;
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
      console.warn('Directory picker failed, falling back', e);
    }
    const input = $('#dirPicker');
    if (!input) return;
    input.dataset.kind = kind;
    input.value = '';
    input.click();
  }

  function initDropZone() {
    const zone = $('#dropZone');
    if (!zone) return;
    zone.ondragover = (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    };
    zone.ondragleave = () => zone.classList.remove('dragover');
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) return;
      setMode('files');
      computeFilePaths(files);
    };
  }

  const currentInputs = () => {
    if (state.inputMode === 'files' && state.files?.length) return state.files.slice();
    return (state.pasted || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  };

  const deriveStemExt = (inputPath) => {
    if (!inputPath) return { stem: 'output', ext: '' };
    const parts = inputPath.split('/');
    const name = parts[parts.length - 1] || '';
    const idx = name.lastIndexOf('.');
    if (idx === -1) return { stem: name, ext: '' };
    return { stem: name.slice(0, idx), ext: name.slice(idx + 1) };
  };

  const baseOutPath = () => {
    const inputs = currentInputs();
    const primary = inputs[0] || joinPath(state.outputDir || '', 'input.mp4');
    const { stem } = deriveStemExt(primary);
    const ext = (state.outExt || parsed?.spec?.defaultOutExt || 'mp4').replace(/^\./, '');
    const dir = state.outputDir || parsed?.spec?.defaultOutputDir || '';
    const prefix = state.prefix || '';
    const suffix = state.suffix || '';
    return joinPath(dir, `${prefix}${stem}${suffix}${ext ? '.' + ext : ''}`);
  };

  const overwriteFlag = () => (state.conflict === 'overwrite' ? '-y ' : '');

  function applyConflict(commandStr, templateType, outPathString) {
    const conflict = state.conflict || 'overwrite';
    let cmd = commandStr;
    const outQuoted = quotePath(outPathString);
    const hasPlaceholder = cmd.includes('__OUT__');
    if (conflict === 'overwrite') {
      if (hasPlaceholder) cmd = cmd.replace(/__OUT__/g, outQuoted);
      if (cmd.startsWith('ffmpeg') && !/\s-y\b/.test(cmd)) {
        cmd = cmd.replace(/^ffmpeg\s+/, 'ffmpeg -y ');
      }
      return cmd;
    }
    if (templateType === 'script') {
      if (hasPlaceholder) cmd = cmd.replace(/__OUT__/g, outQuoted);
      if (conflict === 'fail') {
        const guard = `OUT=${outQuoted}; if [ -e "$OUT" ]; then echo "Refusing to overwrite $OUT"; exit 1; fi; `;
        return guard + cmd;
      }
      return cmd;
    }
    if (!hasPlaceholder) return cmd;
    if (conflict === 'fail') {
      const guard = `OUT=${outQuoted}; if [ -e "$OUT" ]; then echo "Refusing to overwrite $OUT"; exit 1; else `;
      return guard + cmd.replace(/__OUT__/g, '"$OUT"') + '; fi';
    }
    const clean = outQuoted.replace(/^"(.*)"$/, '$1');
    const safe = [
      `OUT=${outQuoted}`,
      `EXT="${clean.split('.').pop()}"`,
      'BASE="${OUT%.*}"',
      'if [ -e "$OUT" ]; then i=1; while [ -e "${BASE}_$i.${EXT}" ]; do i=$((i+1)); done; OUT="${BASE}_$i.${EXT}"; fi;'
    ].join('; ');
    return `${safe} ${cmd.replace(/__OUT__/g, '"$OUT"')}`;
  }

  function renderTemplate(t) {
    const inputs = currentInputs();
    const primary = inputs[0] || joinPath(state.termuxRoot || parsed?.spec?.termuxInputRoot || '', 'input.mp4');
    const { stem, ext } = deriveStemExt(primary);
    const outRaw = baseOutPath();
    const replacements = {
      '{{in}}': quotePath(primary),
      '{{in1}}': quotePath(inputs[0] || primary),
      '{{in2}}': quotePath(inputs[1] || inputs[0] || primary),
      '{{inputs}}': inputs.length ? inputs.map(quotePath).join(' ') : quotePath(primary),
      '{{outDir}}': quotePath(state.outputDir || parsed?.spec?.defaultOutputDir || ''),
      '{{stem}}': stem,
      '{{ext}}': ext,
      '{{outExt}}': (state.outExt || parsed?.spec?.defaultOutExt || 'mp4').replace(/^\./, ''),
      '{{out}}': '__OUT__',
      '{{prefix}}': state.prefix || '',
      '{{suffix}}': state.suffix || '',
      '{{overwriteFlag}}': overwriteFlag()
    };
    variables.forEach((v) => {
      const val = state.variableValues[v.id] ?? v.default ?? '';
      replacements[`{{var:${v.id}}}`] = escapeQuotes(val);
    });
    let rendered = t.body;
    Object.entries(replacements).forEach(([k, v]) => {
      rendered = rendered.split(k).join(v);
    });
    rendered = rendered.replace(/{{in(\d+)}}/g, (_, idx) => {
      const i = parseInt(idx, 10) - 1;
      const target = inputs[i] || inputs[0] || primary;
      return quotePath(target);
    });
    rendered = applyConflict(rendered, t.type, outRaw);
    return rendered.trim();
  }

  function renderVariableInputs() {
    const container = $('#variableList');
    container.innerHTML = '';
    variables.forEach((v) => {
      const wrap = document.createElement('div');
      wrap.className = 'inline';
      const label = document.createElement('label');
      label.textContent = v.label;
      let input;
      if (v.type === 'select') {
        input = document.createElement('select');
        v.options.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.type = v.type === 'number' ? 'number' : 'text';
        if (v.min) input.min = v.min;
        if (v.max) input.max = v.max;
      }
      input.value = state.variableValues[v.id] ?? v.default ?? '';
      input.oninput = () => {
        state.variableValues[v.id] = input.value;
        persistState();
        renderTemplates();
        updatePreview();
        updateFormPreview();
      };
      wrap.append(label, input);
      container.appendChild(wrap);
    });
  }

  function renderTemplates() {
    const list = $('#templateList');
    if (!list) return;
    list.innerHTML = '';
    const query = (state.search || '').toLowerCase();
    const tagFilter = state.activeTag;
    const favoriteOnly = $('#favoriteToggle').checked;
    let items = templates.filter((t) => {
      if (tagFilter && !t.tags.includes(tagFilter)) return false;
      if (!query) return true;
      const haystack = [t.title, t.notes, ...t.tags, t.body].join(' ').toLowerCase();
      return haystack.includes(query);
    });
    items = items.sort((a, b) => {
      const af = state.favorites.includes(a.id) ? -1 : 1;
      const bf = state.favorites.includes(b.id) ? -1 : 1;
      if (af !== bf) return af - bf;
      return a.title.localeCompare(b.title);
    });
    if (favoriteOnly) {
      items = items.filter((t) => state.favorites.includes(t.id));
    }
    $('#resultCount').textContent = `${items.length} templates`;
    items.forEach((t) => {
      const card = document.createElement('div');
      card.className = 'template-card';

      const header = document.createElement('div');
      header.className = 'template-header';

      const title = document.createElement('p');
      title.className = 'template-title';
      title.textContent = t.title;

      const faveBtn = document.createElement('button');
      const isFav = state.favorites.includes(t.id);
      faveBtn.className = isFav ? 'secondary' : 'secondary outline';
      faveBtn.textContent = isFav ? '★' : '☆';
      faveBtn.title = 'Toggle favorite';
      faveBtn.onclick = () => {
        if (state.favorites.includes(t.id)) {
          state.favorites = state.favorites.filter((x) => x !== t.id);
        } else {
          state.favorites = [...state.favorites, t.id];
        }
        persistState();
        renderTemplates();
      };

      header.append(title, faveBtn);

      const tagRow = document.createElement('div');
      tagRow.className = 'tag-list';
      t.tags.forEach((tag) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.textContent = tag;
        tagEl.onclick = () => {
          state.activeTag = tag;
          renderTagList();
          renderTemplates();
        };
        tagRow.appendChild(tagEl);
      });

      const note = document.createElement('div');
      note.className = 'note';
      note.textContent = t.notes;

      const pre = document.createElement('pre');
      pre.className = 'rendered';
      pre.textContent = renderTemplate(t);

      const footer = document.createElement('div');
      footer.className = 'template-footer';

      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => copyToClipboard(pre.textContent);

      const typePill = document.createElement('span');
      typePill.className = 'pill-small';
      typePill.textContent = t.type;

      footer.append(copyBtn, typePill);

      card.append(header, tagRow, note, pre, footer);
      list.appendChild(card);
    });
  }

  function renderTagList() {
    const tagList = $('#tagList');
    tagList.innerHTML = '';
    const allTags = new Set();
    templates.forEach((t) => t.tags.forEach((tag) => allTags.add(tag)));
    Array.from(allTags)
      .sort()
      .forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'chip' + (state.activeTag === tag ? ' active' : '');
        span.textContent = tag;
        span.onclick = () => {
          state.activeTag = state.activeTag === tag ? '' : tag;
          renderTagList();
          renderTemplates();
        };
        tagList.appendChild(span);
      });
    const active = $('#activeTag');
    if (state.activeTag) {
      active.classList.remove('hidden');
      active.textContent = `${state.activeTag} ✕`;
      active.onclick = () => {
        state.activeTag = '';
        renderTagList();
        renderTemplates();
      };
    } else {
      active.classList.add('hidden');
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => showToast('Copied'))
      .catch(() => {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.position = 'absolute';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand('copy');
          showToast('Copied');
        } catch {
          showToast('Clipboard blocked');
        }
        document.body.removeChild(temp);
      });
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1700);
  }

  function updatePreview() {
    const inputs = currentInputs();
    const assumption = state.inputMode === 'files' && state.filesUseAssumed;
    const primary = inputs[0] || '(no input yet)';
    const out = baseOutPath();
    const lines = [];
    lines.push('in: ' + primary);
    if (inputs.length > 1) lines.push('...+' + (inputs.length - 1) + ' more');
    lines.push('out: ' + out);
    if (assumption) lines.push('Assuming: ' + (state.assumedDir || '(set assumed dir)'));
    $('#pathPreview').textContent = lines.join('\n');
  }

  function hydrateInputs() {
    $('#pathPaste').value = state.pasted || '';
    $('#assumedDir').value = state.assumedDir || '';
    $('#termuxRoot').value = state.termuxRoot || parsed?.spec?.termuxInputRoot || '';
    $('#outputDir').value = state.outputDir || parsed?.spec?.defaultOutputDir || '';
    $('#prefix').value = state.prefix || '';
    $('#suffix').value = state.suffix || '';
    $('#outExt').value = state.outExt || parsed?.spec?.defaultOutExt || '';
    $$('input[name="conflict"]').forEach((r) => {
      r.checked = r.value === (state.conflict || 'overwrite');
    });
    $('#favoriteToggle').checked = state.favoriteOnly || false;
    $('#searchBox').value = state.search || '';
    setMode(state.inputMode || 'paste');
  }

  function bindInputs() {
    $('#pathPaste').oninput = (e) => {
      state.pasted = e.target.value;
      state.inputMode = 'paste';
      persistState();
      updatePreview();
      renderTemplates();
    };
    $('#assumedDir').oninput = (e) => {
      state.assumedDir = e.target.value;
      persistState();
      rebuildFilesFromMemory();
      updatePreview();
      renderTemplates();
    };
    $('#termuxRoot').oninput = (e) => {
      state.termuxRoot = e.target.value;
      persistState();
      if (state.inputMode === 'files') {
        rebuildFilesFromMemory();
        renderTemplates();
        updatePreview();
      }
    };
    $('#outputDir').oninput = (e) => {
      state.outputDir = e.target.value;
      persistState();
      updatePreview();
      renderTemplates();
    };
    $('#prefix').oninput = (e) => {
      state.prefix = e.target.value;
      persistState();
      updatePreview();
      renderTemplates();
    };
    $('#suffix').oninput = (e) => {
      state.suffix = e.target.value;
      persistState();
      updatePreview();
      renderTemplates();
    };
    $('#outExt').oninput = (e) => {
      state.outExt = e.target.value;
      persistState();
      updatePreview();
      renderTemplates();
    };
    $$('input[name="conflict"]').forEach((r) => {
      r.onchange = (e) => {
        if (!e.target.checked) return;
        state.conflict = e.target.value;
        persistState();
        renderTemplates();
        updatePreview();
      };
    });
    $('#filePicker').onchange = (e) => {
      const files = Array.from(e.target.files || []);
      computeFilePaths(files);
    };
    const pickAssumed = $('#pickAssumedDir');
    const pickRoot = $('#pickTermuxRoot');
    const pickOut = $('#pickOutputDir');
    if (pickAssumed) pickAssumed.onclick = () => pickDirectory('assumedDir');
    if (pickRoot) pickRoot.onclick = () => pickDirectory('termuxRoot');
    if (pickOut) pickOut.onclick = () => pickDirectory('outputDir');
    const dirPicker = $('#dirPicker');
    if (dirPicker) {
      dirPicker.onchange = (e) => {
        const kind = dirPicker.dataset.kind;
        const files = Array.from(e.target.files || []);
        if (!kind || !files.length) return;
        const first = files[0];
        const rel = first.webkitRelativePath || '';
        const topFolder = rel ? rel.split('/')[0] : first.name;
        applyPickedFolder(kind, topFolder);
        showToast('Folder selected — edit to Termux path if needed');
      };
    }
    $('#searchBox').oninput = (e) => {
      state.search = e.target.value;
      persistState();
      renderTemplates();
    };
    $('#favoriteToggle').onchange = (e) => {
      state.favoriteOnly = e.target.checked;
      persistState();
      renderTemplates();
    };
    $('#editToggle').onclick = () => {
      $('#editorPanel').classList.toggle('hidden');
    };
    $('#resetBtn').onclick = () => {
      localStorage.removeItem(STORAGE_KEY);
      Object.assign(state, baseState());
      init();
      showToast('Reset to defaults');
    };
  }

  function setMode(mode) {
    state.inputMode = mode;
    persistState();
    $('#pasteMode').classList.toggle('hidden', mode !== 'paste');
    $('#fileMode').classList.toggle('hidden', mode !== 'files');
    $$('#inputPanel .tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.mode === mode));
    updatePreview();
    renderTemplates();
  }

  function computeFilePaths(files) {
    if (!files.length) {
      state.files = [];
      state.lastFileDescriptors = [];
      state.filesUseAssumed = false;
      persistState();
      updatePreview();
      renderTemplates();
      return;
    }
    const termuxRoot = state.termuxRoot || parsed?.spec?.termuxInputRoot || '';
    const assumed = state.assumedDir || termuxRoot;
    const descriptors = files.map((file) => ({
      rel: file.webkitRelativePath || file.name,
      usesRelative: !!file.webkitRelativePath
    }));
    const computed = descriptors.map((d) => joinPath(d.usesRelative ? termuxRoot : assumed, d.rel));
    const usedAssumed = descriptors.some((d) => !d.usesRelative);
    state.files = computed;
    state.lastFileDescriptors = descriptors;
    state.filesUseAssumed = usedAssumed;
    state.inputMode = 'files';
    $('#fileModeStatus').textContent = usedAssumed
      ? 'Browser provided names only; using assumed dir.'
      : 'Using relative paths from picker.';
    persistState();
    updatePreview();
    renderTemplates();
  }

  function rebuildFilesFromMemory() {
    if (!state.lastFileDescriptors || !state.lastFileDescriptors.length) return;
    const termuxRoot = state.termuxRoot || parsed?.spec?.termuxInputRoot || '';
    const assumed = state.assumedDir || termuxRoot;
    const computed = state.lastFileDescriptors.map((d) => joinPath(d.usesRelative ? termuxRoot : assumed, d.rel));
    state.files = computed;
    state.filesUseAssumed = state.lastFileDescriptors.some((d) => !d.usesRelative);
    state.inputMode = 'files';
    $('#fileModeStatus').textContent = state.filesUseAssumed
      ? 'Browser provided names only; using assumed dir.'
      : 'Using relative paths from picker.';
    persistState();
  }

  function initTabs() {
    $$('#inputPanel .tab').forEach((btn) => {
      btn.onclick = () => setMode(btn.dataset.mode);
    });
    $$('#editorPanel .tab').forEach((btn) => {
      btn.onclick = () => switchEditor(btn.dataset.editor);
    });
  }

  function switchEditor(mode) {
    $('#formEditor').classList.toggle('hidden', mode !== 'form');
    $('#xmlEditor').classList.toggle('hidden', mode !== 'xml');
    $$('#editorPanel .tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.editor === mode));
  }

  function renderFormEditor() {
    const select = $('#templateSelect');
    select.innerHTML = '';
    templates.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.title;
      select.appendChild(opt);
    });
    select.onchange = () => loadTemplateToForm(select.value);
    loadTemplateToForm(templates[0]?.id);
    $('#saveTemplate').onclick = saveTemplateFromForm;
  }

  function loadTemplateToForm(id) {
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return;
    $('#templateSelect').value = tmpl.id;
    $('#editTitle').value = tmpl.title;
    $('#editTags').value = tmpl.tags.join(', ');
    $('#editNotes').value = tmpl.notes;
    $('#editBody').value = tmpl.body;
    $('#editType').value = tmpl.type;
    updateFormPreview();
  }

  function saveTemplateFromForm() {
    const id = $('#templateSelect').value;
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return;
    tmpl.title = $('#editTitle').value;
    tmpl.tags = $('#editTags').value
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    tmpl.notes = $('#editNotes').value;
    tmpl.body = $('#editBody').value;
    tmpl.type = $('#editType').value;
    updateXmlFromTemplates();
    renderTemplates();
    renderTagList();
    renderFormEditor();
    showToast('Template saved');
  }

  function updateFormPreview() {
    const id = $('#templateSelect').value;
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return;
    $('#formPreview').textContent = renderTemplate(tmpl);
  }

  function updateXmlFromTemplates() {
    const doc = [];
    doc.push('<ffhelper version="1">');
    doc.push('  <spec>');
    doc.push(`    <title>${parsed.spec.title || 'ffhelper'}</title>`);
    doc.push(`    <termuxInputRoot>${parsed.spec.termuxInputRoot}</termuxInputRoot>`);
    doc.push(`    <defaultOutputDir>${parsed.spec.defaultOutputDir}</defaultOutputDir>`);
    doc.push(`    <defaultOutExt>${parsed.spec.defaultOutExt}</defaultOutExt>`);
    doc.push('  </spec>');
    doc.push('  <variables>');
    variables.forEach((v) => {
      const opt = v.options?.length ? ` options="${v.options.join(',')}"` : '';
      const min = v.min ? ` min="${v.min}"` : '';
      const max = v.max ? ` max="${v.max}"` : '';
      doc.push(`    <var id="${v.id}" type="${v.type}" label="${v.label}" default="${v.default}"${min}${max}${opt} />`);
    });
    doc.push('  </variables>');
    doc.push('  <templates>');
    templates.forEach((t) => {
      doc.push(`    <template id="${t.id}" type="${t.type}">`);
      doc.push(`      <title>${t.title}</title>`);
      doc.push(`      <tags>${t.tags.join(',')}</tags>`);
      doc.push(`      <body><![CDATA[${t.body}]]></body>`);
      doc.push(`      <notes>${t.notes}</notes>`);
      doc.push('    </template>');
    });
    doc.push('  </templates>');
    doc.push('</ffhelper>');
    const xml = doc.join('\n');
    state.templateXml = xml;
    state.lastGoodXml = xml;
    persistState();
    $('#xmlArea').value = xml;
  }

  function renderXmlEditor() {
    $('#xmlArea').value = state.templateXml;
    $('#validateXml').onclick = () => {
      try {
        parseXml($('#xmlArea').value);
        $('#xmlStatus').textContent = 'XML is valid';
        $('#xmlStatus').className = 'success';
      } catch (e) {
        $('#xmlStatus').textContent = 'Error: ' + e.message;
        $('#xmlStatus').className = 'error';
        console.error('XML validation failed', e);
      }
    };
    $('#saveXml').onclick = () => {
      try {
        const res = parseXml($('#xmlArea').value);
        parsed = res;
        variables = res.vars;
        templates = res.tmpl;
        state.templateXml = $('#xmlArea').value;
        state.lastGoodXml = state.templateXml;
        persistState();
        renderVariableInputs();
        renderTemplates();
        renderTagList();
        renderFormEditor();
        $('#xmlStatus').textContent = 'Saved and applied';
        $('#xmlStatus').className = 'success';
      } catch (e) {
        $('#xmlStatus').textContent = 'Not saved: ' + e.message;
        $('#xmlStatus').className = 'error';
        console.error('XML save failed', e);
        state.templateXml = state.lastGoodXml;
      }
    };
    $('#exportXml').onclick = () => {
      const blob = new Blob([state.templateXml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ffhelper.xml';
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  function bootstrap() {
    loadState();
    try {
      parsed = parseXml(state.templateXml || defaultXml);
      state.lastGoodXml = state.templateXml;
    } catch (e) {
      console.error('Using fallback template set', e);
      parsed = parseXml(defaultXml);
      state.templateXml = defaultXml;
      state.lastGoodXml = defaultXml;
      persistState();
      const statusEl = $('#xmlStatus');
      if (statusEl) {
        statusEl.textContent = 'Template XML invalid; defaults restored';
        statusEl.className = 'error';
      }
      showToast('Template XML invalid; using defaults');
    }
    variables = parsed.vars;
    templates = parsed.tmpl;
    if (!state.termuxRoot) state.termuxRoot = parsed.spec.termuxInputRoot;
    if (!state.outputDir) state.outputDir = parsed.spec.defaultOutputDir;
    if (!state.outExt) state.outExt = parsed.spec.defaultOutExt;
    if (state.favoriteFirst && !state.favoriteOnly) state.favoriteOnly = true;
  }

  function initEditorTabs() {
    renderFormEditor();
    renderXmlEditor();
    $('#editBody').oninput = updateFormPreview;
    $('#editTitle').oninput = updateFormPreview;
    $('#editNotes').oninput = updateFormPreview;
    $('#editType').onchange = updateFormPreview;
    $('#editTags').oninput = updateFormPreview;
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW registration failed', err));
    }
  }

  function init() {
    bootstrap();
    hydrateInputs();
    bindInputs();
    initTabs();
    initDropZone();
    renderVariableInputs();
    renderTagList();
    renderTemplates();
    updatePreview();
    initEditorTabs();
    registerServiceWorker();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
