(function () {
  'use strict';
  const P = window.PromptMenu;
  const $ = id => document.getElementById(id);
  const storageKey = 'technical-prompt-menu.v1';
  let state = P.clone(P.defaults);
  let activePreset = 'insight';
  let remember = false;
  let promptClones = [];
  let preferences = {...P.previewDefaults, collapsed: window.innerWidth < 1100};
  let savedSuccessfully = false;
  let exportedClones = '';
  let cloneSequence = 0;
  let previousOutput = '';
  let highlightTimer;
  let statusTimer;
  let storageError = '';
  function notify(message) {
    $('status').textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { $('status').textContent = ''; }, 6000);
  }
  function create(tag, attributes, text) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes || {})) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function radio(name, key, label, className) {
    const wrap = create('label', {class: className});
    const input = create('input', {type: 'radio', name, value: key});
    wrap.append(input, create('span', {}, label));
    return wrap;
  }
  const tuning = {
    verbosity: ['Verbosity', 'How many words?'],
    depth: ['Technical depth', 'How deep into the mechanisms?'],
    knowledge: ['Assumed knowledge', 'What can I skip?'],
    compression: ['Intellectual compression', 'How much scaffolding?']
  };
  for (const [key, labels] of Object.entries(tuning)) {
    const field = create('fieldset', {class: 'tune-row', 'aria-describedby': 'help-' + key});
    field.append(create('legend', {class: 'sr-only'}, labels[0]));
    const heading = create('div', {class: 'tune-heading'});
    heading.append(create('span', {}, labels[0]), create('span', {class: 'small'}, labels[1]));
    const segments = create('div', {class: 'segmented'});
    for (const [value, option] of Object.entries(P.choices[key])) segments.append(radio(key, value, option[0], 'segment'));
    field.append(heading, segments, create('p', {class: 'tune-help', id: 'help-' + key}));
    $('tuning-controls').append(field);
  }
  for (const [id, key] of [['visual-controls', 'visuals'], ['deliverable-controls', 'deliverable']]) {
    for (const [value, option] of Object.entries(P.choices[key])) $(id).append(radio(key, value, option[0], 'choice-line'));
  }
  for (const [id, name, options] of [['focus-controls', 'focus', P.focus], ['exclusion-controls', 'exclusions', P.exclusions]]) {
    for (const [key, option] of Object.entries(options)) {
      const label = create('label', {class: 'check-row'});
      label.append(create('input', {type: 'checkbox', name, value: key}), create('span', {}, option[0]));
      $(id).append(label);
    }
  }
  const presetDefinitions = {...P.presets, custom: P.customPreset};
  const presetInputs = new Map();
  for (const [key, info] of Object.entries(presetDefinitions)) {
    const label = create('label', {class: 'preset-tile'});
    const input = create('input', {type: 'radio', name: 'preset', value: key, 'aria-describedby': 'preset-summary-' + key});
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'preset-art');
    icon.setAttribute('viewBox', '0 0 48 48');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#' + info.icon);
    icon.append(use);
    const text = create('span', {class: 'preset-tile-text'});
    text.append(create('strong', {}, info.label), create('span', {class: 'preset-summary', id: 'preset-summary-' + key}, info.summary));
    label.append(input, icon, text, create('span', {class: 'preset-check', 'aria-hidden': 'true'}, '\u2713'));
    label.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showPresetDetail(key); });
    input.addEventListener('focus', () => showPresetDetail(key));
    $('preset-tiles').append(label);
    presetInputs.set(key, input);
  }
  function showPresetDetail(key = activePreset) {
    const info = presetDefinitions[key];
    const previewState = key === 'custom' ? state : P.applyPreset(key, state);
    $('preset-detail-state').textContent = key === activePreset ? 'Selected configuration' : 'Preview only / selected: ' + presetDefinitions[activePreset].label;
    $('preset-detail-title').textContent = info.label;
    $('preset-detail-description').textContent = info.description;
    const codeLabels = {program: 'Complete single-file C11 program', library: 'heap.h + heap.c + example main.c', algorithms: 'Core algorithms and required definitions'};
    const visualLabels = {none: 'No diagrams', purposeful: 'Up to two purposeful diagrams', detailed: 'Labeled, step-by-step diagrams'};
    const rows = [
      ['Starts with', P.choices.structure[previewState.structure][0]],
      ['Reasoning', P.choices.depth[previewState.depth][0] + ' / ' + P.choices.verbosity[previewState.verbosity][0] + ' / ' + P.choices.compression[previewState.compression][0]],
      ['Code', codeLabels[previewState.deliverable]],
      ['Visuals', visualLabels[previewState.visuals]]
    ];
    $('preset-detail-settings').replaceChildren(...rows.flatMap(([title, value]) => [create('dt', {}, title), create('dd', {}, value)]));
    const detail = $('preset-detail');
    const focused = document.activeElement === detail;
    if ($('preset-picker').getBoundingClientRect().width < 500) {
      presetInputs.get(key).parentElement.insertAdjacentElement('afterend', detail);
    } else {
      $('preset-layout').append(detail);
    }
    if (focused) detail.focus({preventScroll: true});
  }
  function syncPresetSelection() {
    for (const [key, input] of presetInputs) input.checked = key === activePreset;
    showPresetDetail();
  }
  $('preset-picker').addEventListener('pointerleave', () => {
    showPresetDetail($('preset').contains(document.activeElement) ? document.activeElement.value : activePreset);
  });
  $('preset-picker').addEventListener('focusout', () => {
    setTimeout(() => { if (!$('preset-picker').contains(document.activeElement)) showPresetDetail(); }, 0);
  });
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const workspace = P.validateWorkspace(JSON.parse(saved));
      state = workspace.settings;
      activePreset = workspace.selectedPreset;
      promptClones = workspace.promptClones;
      preferences = workspace.previewPreferences;
      if (window.innerWidth < 1100) preferences.collapsed = true;
      remember = true;
      savedSuccessfully = true;
    }
  } catch (error) {
    storageError = 'Saved settings could not be loaded. Defaults are active; import a settings file to recover them.';
  }
  function persist() {
    savedSuccessfully = false;
    if (!remember) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(workspaceData()));
      savedSuccessfully = true;
      $('save-state').textContent = 'Settings, clones, and preferences saved in this browser only.';
    } catch (error) {
      $('save-state').textContent = 'Browser storage is unavailable or full. Drafts remain on this page; export settings to keep a copy.';
    }
  }
  function workspaceData() {
    return {...state, promptClones, previewPreferences: preferences, selectedPreset: activePreset};
  }
  function renderOutput(origin = 'Settings') {
    const generated = P.buildPrompt(state);
    if ($('prompt').value !== generated) $('prompt').value = generated;
    const output = $('prompt').value;
    $('prompt').readOnly = true;
    $('word-count').textContent = ' / ' + (output.trim() ? output.trim().split(/\s+/u).length : 0) + ' words';
    $('copy').disabled = !output.trim() || !state.task.trim();
    $('download').disabled = $('copy').disabled;
    $('edit').disabled = $('copy').disabled;
    for (const id of ['live-copy', 'live-download', 'live-clone']) $(id).disabled = $('copy').disabled;
    $('badges').replaceChildren(...[
      P.choices.verbosity[state.verbosity][0] + ' length',
      P.choices.depth[state.depth][0] + ' depth',
      state.focus.length + ' focus areas',
      P.choices.compression[state.compression][0]
    ].map(x => create('span', {class: 'badge'}, x)));
    const notes = P.warnings(state);
    $('warnings').hidden = !notes.length;
    $('warnings').replaceChildren(...notes.map(x => create('p', {}, x)));
    for (const key of Object.keys(tuning)) $('help-' + key).textContent = P.choices[key][state[key]][1];
    $('illustration-contract').textContent = P.choices.visuals[state.visuals][1];
    syncPresetSelection();
    renderLive(output, origin);
    persist();
  }
  function syncControls(origin) {
    for (const key of ['task', 'established', 'special']) $(key).value = state[key];
    for (const input of $('settings').querySelectorAll('input')) {
      input.checked = Array.isArray(state[input.name]) ? state[input.name].includes(input.value) : state[input.name] === input.value;
    }
    $('remember').checked = remember;
    renderOutput(origin);
  }
  function changed(target) {
    if (!target.name) return;
    if (target.type === 'checkbox') {
      const options = target.name === 'focus' ? P.focus : P.exclusions;
      const selected = new Set(state[target.name]);
      if (target.checked) selected.add(target.value); else selected.delete(target.value);
      state[target.name] = Object.keys(options).filter(x => selected.has(x));
    } else state[target.name] = target.value;
    activePreset = 'custom';
    const labels = {task: 'Assignment', established: 'Established decisions', special: 'Special instructions', structure: 'Explanation structure', focus: 'Focus areas', exclusions: 'Exclusions', visuals: 'Visualizations', deliverable: 'Code deliverable'};
    renderOutput(tuning[target.name]?.[0] || labels[target.name] || 'Settings');
  }
  $('settings').addEventListener('submit', event => event.preventDefault());
  $('settings').addEventListener('input', event => { if (event.target.tagName === 'TEXTAREA') changed(event.target); });
  $('settings').addEventListener('change', event => { if (event.target.tagName === 'INPUT') changed(event.target); });
  $('preset').addEventListener('change', event => {
    activePreset = event.target.value;
    if (activePreset === 'custom') {
      syncPresetSelection();
      persist();
      notify('Current settings kept. Adjust any control below to make your own mix.');
      return;
    }
    state = P.applyPreset(activePreset, state);
    syncControls('Preset');
    notify('Preset applied. Assignment, special instructions, and all prompt clones kept.');
  });
  $('reset').addEventListener('click', () => {
    state = P.clone(P.defaults);
    activePreset = 'insight';
    syncControls('Reset');
    notify('Default assignment and settings restored. Prompt clones and preview preferences kept.');
  });
  async function copyText(output, source) {
    let copied = false;
    try { await navigator.clipboard.writeText(output); copied = true; } catch (error) { /* file:// and clipboard permission fallback below */ }
    if (!copied) {
      const buffer = create('textarea', {class: 'sr-only', 'aria-hidden': 'true'});
      buffer.value = output;
      document.body.append(buffer);
      buffer.select();
      try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
      buffer.remove();
    }
    if (copied) notify('Prompt copied. Paste it into your preferred assistant.');
    else { source.focus(); source.select(); notify('Clipboard unavailable. The prompt is selected; use your normal copy shortcut.'); }
  }
  $('copy').addEventListener('click', () => copyText($('prompt').value, $('prompt')));
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const link = create('a', {href: url, download: name});
    document.body.append(link);
    link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('download').addEventListener('click', () => download('technical-prompt.txt', $('prompt').value + '\n', 'text/plain;charset=utf-8'));
  $('export').addEventListener('click', () => {
    const content = JSON.stringify(workspaceData(), null, 2) + '\n';
    download('prompt-menu-settings.json', content, 'application/json');
    exportedClones = JSON.stringify(promptClones);
    notify(new Blob([content]).size > 1000000 ? 'Export downloaded, but it exceeds the 1 MB import limit. Also download individual drafts to keep portable text copies.' : 'Settings and all prompt clones exported.');
  });
  $('import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async () => {
    const file = $('import-file').files[0];
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Settings file must be 1 MB or smaller.');
      const imported = P.validateWorkspace(JSON.parse(await file.text()));
      state = imported.settings;
      activePreset = imported.selectedPreset;
      promptClones.push(...imported.promptClones.map(draft => ({...draft, id: nextCloneId()})));
      preferences = imported.previewPreferences;
      renderClones();
      syncPreferences();
      syncControls('Import');
      notify('Settings imported. Imported clones added; existing clones kept.');
    } catch (error) { notify('Import rejected: ' + error.message); }
    finally { $('import-file').value = ''; }
  });
  $('remember').addEventListener('change', () => {
    remember = $('remember').checked;
    if (remember) persist();
    else {
      savedSuccessfully = false;
      try { localStorage.removeItem(storageKey); $('save-state').textContent = 'Saved settings removed. Export settings to keep a copy.'; }
      catch (error) { $('save-state').textContent = 'Could not remove stored settings. Clear this site\'s data in browser settings.'; }
    }
  });
  function nextCloneId() {
    let id;
    do { id = 'clone-' + (++cloneSequence); } while (promptClones.some(draft => draft.id === id));
    return id;
  }
  const cloneNodes = new Map();
  function renderClones() {
    $('clones').hidden = !promptClones.length;
    for (const [id, nodes] of cloneNodes) {
      if (!promptClones.some(draft => draft.id === id)) { nodes.card.remove(); cloneNodes.delete(id); }
    }
    for (const draft of promptClones) {
      if (cloneNodes.has(draft.id)) continue;
      const domId = 'draft-' + (++cloneSequence);
      const card = create('article', {class: 'clone-card'});
      const heading = create('div', {class: 'clone-header'});
      const name = create('div', {class: 'clone-name'});
      const title = create('input', {id: domId + '-name', type: 'text', maxlength: '120'});
      title.value = draft.title;
      name.append(create('label', {for: domId + '-name'}, 'Clone name'), title);
      heading.append(name, create('time', {datetime: draft.createdAt}, 'Created ' + new Date(draft.createdAt).toLocaleString()));
      const editor = create('textarea', {id: domId + '-text', maxlength: '100000', 'aria-describedby': 'clones-help', spellcheck: 'false'});
      editor.value = draft.text;
      const actions = create('div', {class: 'actions'});
      const copy = create('button', {type: 'button', class: 'button primary'}, 'Copy clone');
      const save = create('button', {type: 'button', class: 'button'}, 'Download .txt');
      const remove = create('button', {type: 'button', class: 'button delete-clone'}, 'Delete clone');
      const updateActions = () => { copy.disabled = save.disabled = !draft.text.trim(); };
      editor.addEventListener('input', () => { draft.text = editor.value; updateActions(); persist(); });
      title.addEventListener('input', () => { draft.title = title.value; persist(); });
      copy.addEventListener('click', () => copyText(draft.text, editor));
      save.addEventListener('click', () => download('prompt-' + draft.id.replace(/[^a-z0-9-]/gi, '-') + '.txt', draft.text + '\n', 'text/plain;charset=utf-8'));
      remove.addEventListener('click', () => {
        if (!window.confirm('Delete "' + (draft.title || 'Untitled clone') + '"? This cannot be undone.')) return;
        const index = promptClones.indexOf(draft);
        promptClones.splice(index, 1);
        renderClones();
        persist();
        const next = promptClones[Math.min(index, promptClones.length - 1)];
        if (next) cloneNodes.get(next.id).editor.focus();
        else $('edit').focus();
        notify('Prompt clone deleted. Other drafts kept.');
      });
      actions.append(copy, save, remove);
      card.append(heading, create('label', {for: domId + '-text', class: 'sr-only'}, 'Editable prompt clone'), editor, actions);
      $('clone-list').append(card);
      cloneNodes.set(draft.id, {card, editor});
      updateActions();
    }
  }
  function clonePrompt() {
    const draft = {id: nextCloneId(), title: 'Prompt clone ' + (promptClones.length + 1), text: $('prompt').value, createdAt: new Date().toISOString()};
    promptClones.push(draft);
    renderClones();
    persist();
    cloneNodes.get(draft.id).editor.focus();
    notify('Independent prompt clone created. Only your edits can change it.');
  }
  $('edit').addEventListener('click', clonePrompt);
  $('live-clone').addEventListener('click', clonePrompt);
  $('live-copy').addEventListener('click', () => copyText($('prompt').value, $('prompt')));
  $('live-download').addEventListener('click', () => download('technical-prompt.txt', $('prompt').value + '\n', 'text/plain;charset=utf-8'));
  window.addEventListener('beforeunload', event => {
    if (promptClones.length && !(remember && savedSuccessfully) && exportedClones !== JSON.stringify(promptClones)) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  const panel = $('live-preview');
  const content = $('live-content');
  let geometry = null;
  let restoreGeometry = null;
  let maximized = false;
  let lastNarrow = window.innerWidth < 1100;
  const words = text => text.trim() ? text.trim().split(/\s+/u).length : 0;
  function removedContext(before, diff) {
    const ranges = [];
    let offset = 0;
    for (const op of diff) {
      if (op.type === 'removed') ranges.push([offset, offset + op.text.length]);
      if (op.type !== 'added') offset += op.text.length;
    }
    return [...before.matchAll(/(?:[^\n]|\n(?!\n))+/gu)]
      .filter(match => ranges.some(([start, end]) => start < match.index + match[0].length && end > match.index))
      .map(match => match[0]).join('\n\n');
  }
  function translatedOffset(offset, diff) {
    let oldOffset = 0, newOffset = 0;
    for (const op of diff) {
      if (op.type === 'added') newOffset += op.text.length;
      else {
        if (offset < oldOffset + op.text.length) return op.type === 'equal' ? newOffset + offset - oldOffset : newOffset;
        oldOffset += op.text.length;
        if (op.type === 'equal') newOffset += op.text.length;
      }
    }
    return newOffset;
  }
  function selectionOffset(node, offset) {
    const range = document.createRange();
    range.selectNodeContents($('live-text'));
    range.setEnd(node, offset);
    return range.toString().length;
  }
  function textPosition(offset) {
    const walker = document.createTreeWalker($('live-text'), NodeFilter.SHOW_TEXT);
    let node, last;
    while ((node = walker.nextNode())) {
      last = node;
      if (offset <= node.length) return [node, offset];
      offset -= node.length;
    }
    return [last, last ? last.length : 0];
  }
  function renderLive(output, origin) {
    if (output === previousOutput) return;
    const diff = previousOutput ? P.diffText(previousOutput, output) : [{type: 'equal', text: output}];
    const added = diff.filter(op => op.type === 'added');
    const removed = diff.filter(op => op.type === 'removed');
    const selection = window.getSelection();
    const selecting = selection && !selection.isCollapsed && $('live-text').contains(selection.anchorNode) && $('live-text').contains(selection.focusNode);
    const savedSelection = selecting ? [
      translatedOffset(selectionOffset(selection.anchorNode, selection.anchorOffset), diff),
      translatedOffset(selectionOffset(selection.focusNode, selection.focusOffset), diff)
    ] : null;
    const scrollTop = content.scrollTop;
    const nodes = [];
    let firstChange = null;
    for (const op of diff) {
      if (op.type === 'removed') {
        if (!firstChange) { firstChange = create('span'); nodes.push(firstChange); }
      } else {
        const node = create('span', {class: op.type === 'added' && preferences.highlight ? 'diff-added' : ''}, op.text);
        if (op.type === 'added' && !firstChange) firstChange = node;
        nodes.push(node);
      }
    }
    $('live-text').replaceChildren(...nodes);
    $('removed-text').textContent = removedContext(previousOutput, diff);
    $('removed-change').hidden = !removed.length;
    $('removed-change').open = false;
    if (previousOutput) $('live-change').textContent = origin + ' updated | +' + added.reduce((sum, op) => sum + words(op.text), 0) + ' / -' + removed.reduce((sum, op) => sum + words(op.text), 0) + ' words';
    previousOutput = output;
    if (savedSelection) {
      const anchor = textPosition(savedSelection[0]), focus = textPosition(savedSelection[1]);
      if (anchor[0] && focus[0]) selection.setBaseAndExtent(...anchor, ...focus);
    }
    content.scrollTop = scrollTop;
    if (preferences.follow && firstChange && !selecting) {
      content.scrollTop = Math.max(0, firstChange.offsetTop - 36);
    }
    clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => {
      for (const node of $('live-text').querySelectorAll('.diff-added')) node.classList.remove('diff-added');
    }, 6000);
  }
  function defaultGeometry() {
    const width = Math.min(420, window.innerWidth - 32);
    const height = Math.min(720, window.innerHeight - 112);
    return {x: window.innerWidth - width - 16, y: 88, width, height};
  }
  function bounded(rect) {
    const maxWidth = Math.max(1, window.innerWidth - 24), maxHeight = Math.max(1, window.innerHeight - 24);
    const width = Math.max(Math.min(320, maxWidth), Math.min(rect.width, maxWidth));
    const height = Math.max(Math.min(380, maxHeight), Math.min(rect.height, maxHeight));
    return {width, height, x: Math.max(12, Math.min(rect.x, window.innerWidth - width - 12)), y: Math.max(12, Math.min(rect.y, window.innerHeight - height - 12))};
  }
  function applyGeometry() {
    const rect = maximized ? {x: 12, y: 12, width: window.innerWidth - 24, height: window.innerHeight - 24} : bounded(geometry || defaultGeometry());
    panel.style.left = rect.x + 'px';
    panel.style.top = rect.y + 'px';
    panel.style.width = rect.width + 'px';
    panel.style.height = rect.height + 'px';
    panel.style.right = 'auto';
    panel.dataset.maximized = String(maximized);
    $('live-maximize').setAttribute('aria-pressed', String(maximized));
    $('live-maximize').setAttribute('aria-label', maximized ? 'Restore preview size' : 'Maximize preview');
  }
  function updateVisibility() {
    const rect = $('prompt').getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const redundant = preferences.autoHide && visibleHeight >= Math.min(180, rect.height * .45) && !panel.contains(document.activeElement) && document.activeElement !== $('live-tab');
    panel.hidden = preferences.collapsed || redundant;
    $('live-tab').hidden = !preferences.collapsed || redundant;
    $('live-tab').setAttribute('aria-expanded', String(!preferences.collapsed));
    document.body.classList.toggle('preview-collapsed', preferences.collapsed);
  }
  function syncPreferences() {
    for (const [id, key] of [['live-highlight', 'highlight'], ['live-follow', 'follow'], ['live-autohide', 'autoHide']]) $(id).checked = preferences[key];
    $('live-size').value = preferences.textSize;
    panel.dataset.textSize = preferences.textSize;
    applyGeometry();
    updateVisibility();
  }
  for (const [id, key] of [['live-highlight', 'highlight'], ['live-follow', 'follow'], ['live-autohide', 'autoHide'], ['live-size', 'textSize']]) {
    $(id).addEventListener('change', () => {
      preferences[key] = key === 'textSize' ? $(id).value : $(id).checked;
      if (key === 'highlight' && !preferences.highlight) {
        for (const node of $('live-text').querySelectorAll('.diff-added')) node.classList.remove('diff-added');
      }
      syncPreferences();
      persist();
    });
  }
  function collapse() {
    if (maximized) { geometry = restoreGeometry; maximized = false; }
    preferences.collapsed = true;
    syncPreferences();
    $('live-tab').hidden = false;
    $('live-tab').focus();
    persist();
  }
  $('live-collapse').addEventListener('click', collapse);
  $('live-tab').addEventListener('click', () => {
    preferences.collapsed = false;
    panel.hidden = false;
    $('live-move').focus({preventScroll: true});
    syncPreferences();
    persist();
  });
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); collapse(); }
  });
  content.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      const range = document.createRange();
      range.selectNodeContents($('live-text'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  $('live-dock').addEventListener('click', () => {
    geometry = null;
    maximized = false;
    applyGeometry();
    notify('Preview returned to its right-hand dock.');
  });
  $('live-maximize').addEventListener('click', () => {
    if (!maximized) { restoreGeometry = geometry ? {...geometry} : null; maximized = true; }
    else { geometry = restoreGeometry; maximized = false; }
    applyGeometry();
  });
  $('live-jump').addEventListener('click', () => {
    $('prompt').focus({preventScroll: true});
    $('preview').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    updateVisibility();
  });
  function currentRect() {
    const rect = panel.getBoundingClientRect();
    return {x: rect.left, y: rect.top, width: rect.width, height: rect.height};
  }
  function resizeRect(rect, edge, dx, dy) {
    let {x, y, width, height} = rect;
    const minWidth = Math.min(320, window.innerWidth - 24), minHeight = Math.min(380, window.innerHeight - 24);
    if (edge.includes('e')) width = Math.max(minWidth, Math.min(width + dx, window.innerWidth - x - 12));
    if (edge.includes('s')) height = Math.max(minHeight, Math.min(height + dy, window.innerHeight - y - 12));
    if (edge.includes('w')) { const next = Math.max(12, Math.min(x + dx, x + width - minWidth)); width += x - next; x = next; }
    if (edge.includes('n')) { const next = Math.max(12, Math.min(y + dy, y + height - minHeight)); height += y - next; y = next; }
    return bounded({x, y, width, height});
  }
  function manipulable(node, edge = '') {
    node.addEventListener('pointerdown', event => {
      if (event.button !== 0 || maximized) return;
      event.preventDefault();
      node.focus({preventScroll: true});
      const start = currentRect(), x = event.clientX, y = event.clientY;
      node.setPointerCapture(event.pointerId);
      const move = e => {
        geometry = edge ? resizeRect(start, edge, e.clientX - x, e.clientY - y) : bounded({...start, x: start.x + e.clientX - x, y: start.y + e.clientY - y});
        applyGeometry();
      };
      const finish = () => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', finish);
        node.removeEventListener('pointercancel', finish);
        node.removeEventListener('lostpointercapture', finish);
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', finish);
      node.addEventListener('pointercancel', finish);
      node.addEventListener('lostpointercapture', finish);
    });
    node.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) || maximized) return;
      event.preventDefault();
      const step = event.shiftKey ? 30 : 10;
      const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
      const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
      const rect = currentRect();
      geometry = edge ? resizeRect(rect, edge, dx, dy) : bounded({...rect, x: rect.x + dx, y: rect.y + dy});
      applyGeometry();
    });
  }
  manipulable($('live-move'));
  for (const [edge, label] of Object.entries({n: 'top edge', e: 'right edge', s: 'bottom edge', w: 'left edge', nw: 'top left corner', ne: 'top right corner', sw: 'bottom left corner', se: 'bottom right corner'})) {
    const handle = create('button', {type: 'button', class: 'resize-handle resize-' + edge, 'aria-label': 'Resize preview from ' + label, 'aria-describedby': 'window-help'});
    $('resize-handles').append(handle);
    manipulable(handle, edge);
  }
  const observer = new IntersectionObserver(updateVisibility, {threshold: [0, .1, .25, .45, .5, .75, 1]});
  observer.observe($('prompt'));
  window.addEventListener('scroll', updateVisibility, {passive: true});
  panel.addEventListener('focusout', () => setTimeout(updateVisibility, 0));
  $('live-tab').addEventListener('focusout', () => setTimeout(updateVisibility, 0));
  window.addEventListener('resize', () => {
    const narrow = window.innerWidth < 1100;
    if (narrow && !lastNarrow) preferences.collapsed = true;
    lastNarrow = narrow;
    if (geometry) geometry = bounded(geometry);
    syncPreferences();
    showPresetDetail();
  });
  renderClones();
  syncPreferences();
  syncControls();
  if (storageError) notify(storageError);
})();
