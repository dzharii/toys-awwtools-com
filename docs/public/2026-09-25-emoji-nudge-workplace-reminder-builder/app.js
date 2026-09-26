/* Emoji Nudge: browser-only application. ASCII source, Unicode at render time. */
(function () {
  'use strict';
  const {catalog, presets} = window.NUDGE_DATA;
  const keys = Object.keys(catalog), $ = id => document.getElementById(id);
  const sizes = [32, 38, 44, 50, 56], spacing = {tight: 1, normal: 1.06, relaxed: 1.2};
  const storageKey = 'emoji-nudge:v1';
  const defaults = {...presets[0].parts, size: 44, spacing: 'normal'};
  const item = (key, id) => catalog[key].items.find(entry => entry.id === id);
  const glyph = entry => String.fromCodePoint(...entry.points);
  function validate(raw, base = defaults) {
    const result = {...base};
    if (!raw || typeof raw !== 'object') return result;
    keys.forEach(key => { if (item(key, raw[key])) result[key] = raw[key]; });
    if (sizes.includes(Number(raw.size))) result.size = Number(raw.size);
    if (Object.hasOwn(spacing, raw.spacing)) result.spacing = raw.spacing;
    return result;
  }
  function fromHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    if (![...keys, 'size', 'spacing'].some(key => params.has(key))) return null;
    if (params.has('v') && params.get('v') !== '1') return null;
    return validate(Object.fromEntries(params));
  }
  let stored;
  try { stored = JSON.parse(localStorage.getItem(storageKey)); } catch (_) { /* Optional storage. */ }
  let state = fromHash() || validate(stored), timer, lastFocus;
  function lines() { return keys.map(key => ({key, ...item(key, state[key])})).filter(entry => entry.points.length); }
  function match() { return presets.find(preset => keys.every(key => preset.parts[key] === state[key])); }
  function fragment() { return new URLSearchParams({v:'1', ...state}).toString(); }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) { /* Keep working in memory. */ }
    try { history.replaceState(null, '', '#' + fragment()); } catch (_) { /* Sandboxed navigation. */ }
  }
  function status(message = '', button) {
    clearTimeout(timer);
    $('copy').textContent = 'Copy'; $('select').textContent = 'Select'; $('share').textContent = 'Copy Link';
    $('status').textContent = message;
    if (button) $(button).textContent = button === 'select' ? 'Selected' : button === 'share' ? 'Link copied' : 'Copied';
    timer = setTimeout(() => { $('copy').textContent = 'Copy'; $('select').textContent = 'Select'; $('share').textContent = 'Copy Link'; $('status').textContent = ''; }, 5000);
  }
  function render(animate = false) {
    keys.forEach(key => { $(key).value = state[key]; });
    $('size').value = String(state.size); $('spacing').value = state.spacing;
    const recognized = match();
    $('preset').value = recognized && !recognized.hidden ? recognized.id : 'custom';
    $('character-name').textContent = recognized ? recognized.label : 'Your own little messenger';
    $('discovery').hidden = !(recognized && recognized.hidden);
    const character = $('character');
    character.replaceChildren(...lines().map(entry => {
      const row = document.createElement('div');
      row.textContent = glyph(entry);
      if (entry.key === 'x') row.className = 'context-line';
      return row;
    }));
    character.setAttribute('aria-label', lines().map(entry => entry.label).join(', '));
    character.style.setProperty('--preview-size', state.size + 'pt');
    character.style.lineHeight = spacing[state.spacing];
    character.classList.remove('is-selected', 'bounce');
    status();
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void character.offsetWidth; character.classList.add('bounce');
    }
    persist();
  }
  function enhanceSelect(select, entries, isPreset = false) {
    if (!CSS.supports('appearance', 'base-select')) return;
    const button = document.createElement('button'); button.type = 'button';
    button.append(document.createElement('selectedcontent')); select.prepend(button); select.classList.add('rich');
    [...select.options].forEach(option => {
      const entry = entries.find(entry => entry.id === option.value);
      if (!entry) return;
      const wrap = document.createElement('span'); wrap.className = 'option-inner';
      const visual = document.createElement('span'); visual.setAttribute('aria-hidden','true');
      visual.className = isPreset ? 'mini-character' : 'option-emoji';
      if (isPreset) keys.forEach(key => {
        const value = item(key, entry.parts[key]);
        if (value.points.length) { const row = document.createElement('span'); row.textContent = glyph(value); visual.append(row); }
      }); else visual.textContent = entry.points.length ? glyph(entry) : '\u2014';
      const label = document.createElement('span'); label.textContent = entry.label;
      wrap.append(visual, label); option.replaceChildren(wrap);
    });
  }
  keys.forEach(key => {
    enhanceSelect($(key), catalog[key].items);
    $(key).addEventListener('change', () => { state[key] = $(key).value; render(true); });
  });
  enhanceSelect($('preset'), presets, true);
  $('preset').addEventListener('change', () => {
    const preset = presets.find(entry => entry.id === $('preset').value);
    if (preset) { state = {...state, ...preset.parts}; render(true); }
  });
  ['size', 'spacing'].forEach(key => $(key).addEventListener('change', () => { state = validate({...state, [key]: $(key).value}); render(); }));
  $('shuffle').addEventListener('click', () => {
    keys.forEach(key => { const items = catalog[key].items; state[key] = items[Math.floor(Math.random() * items.length)].id; }); render(true);
  });
  function selectCharacter() {
    const character = $('character'); character.focus({preventScroll:true});
    const range = document.createRange(); range.selectNodeContents(character);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    character.classList.add('is-selected');
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    status('Selected - press ' + (mac ? 'Cmd+C' : 'Ctrl+C'), 'select');
  }
  $('select').addEventListener('click', selectCharacter);
  $('character').addEventListener('dblclick', event => { event.preventDefault(); selectCharacter(); });
  $('character').addEventListener('click', () => $('character').focus({preventScroll:true}));
  document.addEventListener('selectionchange', () => {
    if (!window.getSelection().toString()) $('character').classList.remove('is-selected');
  });
  const escapeHTML = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function clipboardContent() {
    const rows = lines();
    const plain = rows.map(glyph).join('\n');
    const html = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;text-align:center;"><tbody>' + rows.map(entry => {
      const size = entry.key === 'x' ? state.size * .65 : state.size;
      return '<tr><td align="center" style="padding:0;text-align:center;font-family:Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif;font-size:' + size + 'pt;line-height:' + (size * spacing[state.spacing]).toFixed(2) + 'pt;mso-line-height-rule:at-least;">' + escapeHTML(glyph(entry)) + '</td></tr>';
    }).join('') + '</tbody></table>';
    return {plain, html};
  }
  document.addEventListener('copy', event => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !$('character').contains(selection.anchorNode) || !$('character').contains(selection.focusNode)) return;
    if (!event.clipboardData) return;
    // Preserve partial selections; enrich only the full-character selection.
    const range = document.createRange(); range.selectNodeContents($('character'));
    if (selection.toString() !== range.toString()) return;
    const content = clipboardContent();
    event.clipboardData.setData('text/html', content.html); event.clipboardData.setData('text/plain', content.plain); event.preventDefault();
  });
  $('copy').addEventListener('click', async () => {
    const content = clipboardContent();
    try {
      if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('Selection fallback');
      await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([content.html], {type:'text/html'}), 'text/plain':new Blob([content.plain], {type:'text/plain'})})]);
      status('Ready to paste into your message.', 'copy'); return;
    } catch (_) { /* Try the legacy user-initiated copy operation. */ }
    selectCharacter();
    try { if (document.execCommand('copy')) status('Ready to paste into your message.', 'copy'); } catch (_) { /* Keep selection available. */ }
  });
  const hasPopover = typeof $('settings').showPopover === 'function';
  function closeSettings() {
    if (hasPopover && $('settings').matches(':popover-open')) $('settings').hidePopover();
    $('settings').hidden = true; $('settings-button').setAttribute('aria-expanded', 'false');
  }
  $('settings-button').addEventListener('click', () => {
    if ($('settings-button').getAttribute('aria-expanded') === 'true') { closeSettings(); return; }
    lastFocus = document.activeElement; $('settings').hidden = false;
    if (hasPopover) $('settings').showPopover();
    $('settings-button').setAttribute('aria-expanded','true'); $('spacing').focus();
  });
  $('settings').addEventListener('toggle', event => {
    if (event.newState === 'closed') { $('settings').hidden = true; $('settings-button').setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('settings').hidden) { closeSettings(); lastFocus?.focus(); } });
  document.addEventListener('click', event => { if (!hasPopover && !$('settings').hidden && !event.target.closest('.menu-wrap')) closeSettings(); });
  $('reset').addEventListener('click', () => { state = {...defaults}; render(true); closeSettings(); $('settings-button').focus(); });
  $('share').addEventListener('click', async () => {
    const url = new URL(location.href); url.hash = fragment();
    try { await navigator.clipboard.writeText(url.href); status('Current character link copied.', 'share'); }
    catch (_) { $('link-fallback').hidden = false; $('link-value').value = url.href; $('link-value').focus(); $('link-value').select(); status('Select and copy the link.'); }
  });
  window.addEventListener('hashchange', () => { state = fromHash() || {...defaults}; render(); });
  document.querySelectorAll('[disabled]').forEach(element => { if (element.id !== 'custom') element.disabled = false; });
  // Keep the synthetic Custom option non-selectable.
  $('preset').querySelector('[value="custom"]').disabled = true;
  render();
  const debug = new URLSearchParams(location.search).has('debug');
  if (debug) window.nudgeDebug = {getState: () => ({...state}), clipboardContent, validate, presets, catalog};
  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(document.modelContext.registerTool({name:'configure_emoji_nudge',description:'Apply a named Emoji Nudge preset to the visible character.',inputSchema:{type:'object',properties:{preset:{type:'string',enum:presets.filter(p => !p.hidden).map(p => p.id)}},required:['preset'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input) {
        const preset = presets.find(p => !p.hidden && p.id === input?.preset);
        if (!preset) throw new Error('Unknown preset');
        state = {...state, ...preset.parts}; render(true); return {preset:preset.id, state:{...state}};
      }})).catch(() => {});
    } catch (_) { /* Optional platform integration. */ }
  }
}());
