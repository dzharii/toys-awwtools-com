(function () {
  'use strict';
  const P = window.PromptMenu;
  const $ = id => document.getElementById(id);
  const storageKey = 'technical-prompt-menu.v1';
  let state = P.clone(P.defaults);
  let remember = false;
  let editing = false;
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
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) { state = P.validate(JSON.parse(saved)); remember = true; }
  } catch (error) {
    storageError = 'Saved settings could not be loaded. Defaults are active; import a settings file to recover them.';
  }
  function persist() {
    if (!remember) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      $('save-state').textContent = 'Saved in this browser only. No server requests.';
    } catch (error) {
      $('save-state').textContent = 'Browser storage is unavailable. Export settings to keep a copy.';
    }
  }
  function renderOutput() {
    const manual = state.manualPrompt !== null;
    const output = manual ? state.manualPrompt : P.buildPrompt(state);
    // Avoid resetting the selection while a user types in the manual editor.
    if ($('prompt').value !== output) $('prompt').value = output;
    $('prompt').readOnly = !manual || !editing;
    $('edit').textContent = editing ? 'Finish editing' : 'Edit prompt';
    $('manual-notice').hidden = !manual;
    $('word-count').textContent = ' / ' + (output.trim() ? output.trim().split(/\s+/u).length : 0) + ' words';
    $('copy').disabled = !output.trim() || (!manual && !state.task.trim());
    $('download').disabled = $('copy').disabled;
    $('badges').replaceChildren(...[
      P.choices.verbosity[state.verbosity][0] + ' length',
      P.choices.depth[state.depth][0] + ' depth',
      state.focus.length + ' focus areas',
      P.choices.compression[state.compression][0],
      ...(manual ? ['Manually edited'] : [])
    ].map(x => create('span', {class: 'badge'}, x)));
    const notes = P.warnings(state);
    $('warnings').hidden = !notes.length;
    $('warnings').replaceChildren(...notes.map(x => create('p', {}, x)));
    for (const key of Object.keys(tuning)) $('help-' + key).textContent = P.choices[key][state[key]][1];
    $('illustration-contract').textContent = P.choices.visuals[state.visuals][1];
    persist();
  }
  function syncControls() {
    for (const key of ['task', 'established', 'special']) $(key).value = state[key];
    for (const input of $('settings').querySelectorAll('input')) {
      input.checked = Array.isArray(state[input.name]) ? state[input.name].includes(input.value) : state[input.name] === input.value;
    }
    $('remember').checked = remember;
    renderOutput();
  }
  function changed(target) {
    if (!target.name) return;
    if (target.type === 'checkbox') {
      const options = target.name === 'focus' ? P.focus : P.exclusions;
      const selected = new Set(state[target.name]);
      if (target.checked) selected.add(target.value); else selected.delete(target.value);
      state[target.name] = Object.keys(options).filter(x => selected.has(x));
    } else state[target.name] = target.value;
    $('preset').value = 'custom';
    if (state.manualPrompt !== null) $('manual-message').textContent = 'Settings changed. Your manual prompt is preserved; rebuild to apply the new settings.';
    renderOutput();
  }
  $('settings').addEventListener('submit', event => event.preventDefault());
  $('settings').addEventListener('input', event => { if (event.target.tagName === 'TEXTAREA') changed(event.target); });
  $('settings').addEventListener('change', event => { if (event.target.tagName === 'INPUT') changed(event.target); });
  $('preset').addEventListener('change', () => {
    if ($('preset').value === 'custom') return;
    state = P.applyPreset($('preset').value, state);
    editing = false;
    syncControls();
    notify('Preset applied. Assignment and special instructions kept; prompt rebuilt.');
  });
  $('reset').addEventListener('click', () => {
    state = P.clone(P.defaults);
    editing = false;
    $('preset').value = 'insight';
    $('manual-message').textContent = 'Your prompt is in manual edit mode. Settings will not overwrite it.';
    syncControls();
    notify('Default assignment and settings restored.');
  });
  $('edit').addEventListener('click', () => {
    if (state.manualPrompt === null) {
      state.manualPrompt = P.buildPrompt(state);
      editing = true;
      $('manual-message').textContent = 'Your prompt is in manual edit mode. Settings will not overwrite it.';
      renderOutput();
      $('prompt').focus();
    } else {
      // Keep the customized text after finishing, until the explicit rebuild action.
      editing = !editing;
      renderOutput();
      if (editing) $('prompt').focus();
    }
  });
  $('prompt').addEventListener('input', () => {
    if (state.manualPrompt !== null) { state.manualPrompt = $('prompt').value; renderOutput(); }
  });
  $('rebuild').addEventListener('click', () => {
    state.manualPrompt = null;
    editing = false;
    renderOutput();
    notify('Prompt rebuilt from the current settings.');
  });
  $('copy').addEventListener('click', async () => {
    const output = $('prompt').value;
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
    else { $('prompt').focus(); $('prompt').select(); notify('Clipboard unavailable. The prompt is selected; use your normal copy shortcut.'); }
  });
  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const link = create('a', {href: url, download: name});
    document.body.append(link);
    link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  $('download').addEventListener('click', () => download('technical-prompt.txt', $('prompt').value + '\n', 'text/plain;charset=utf-8'));
  $('export').addEventListener('click', () => download('prompt-menu-settings.json', JSON.stringify(state, null, 2) + '\n', 'application/json'));
  $('import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async () => {
    const file = $('import-file').files[0];
    if (!file) return;
    try {
      if (file.size > 1000000) throw new Error('Settings file must be 1 MB or smaller.');
      const imported = P.validate(JSON.parse(await file.text()));
      state = imported;
      editing = false;
      $('preset').value = 'custom';
      $('manual-message').textContent = 'Imported manual prompt is preserved. Rebuild to generate from settings.';
      syncControls();
      notify('Settings imported.');
    } catch (error) { notify('Import rejected: ' + error.message); }
    finally { $('import-file').value = ''; }
  });
  $('remember').addEventListener('change', () => {
    remember = $('remember').checked;
    if (remember) persist();
    else {
      try { localStorage.removeItem(storageKey); $('save-state').textContent = 'Saved settings removed. Export settings to keep a copy.'; }
      catch (error) { $('save-state').textContent = 'Could not remove stored settings. Clear this site\'s data in browser settings.'; }
    }
  });
  if (remember) $('preset').value = 'custom';
  syncControls();
  if (storageError) notify(storageError);
})();
