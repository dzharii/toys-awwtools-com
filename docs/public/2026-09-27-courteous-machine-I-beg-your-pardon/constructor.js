/* Courtesy message constructor. Classic script; no modules, network requests, or dependencies. */
(function () {
  'use strict';
  const cases = {
    'file busy': ['File is busy', "I can't access <item> while it's in use.", 'Please close <item> in the other application and try again.'],
    'permission denied': ['Permission denied', "I don't have permission to access <item>.", 'Please ask the workspace owner for <permission> access.'],
    'invalid input': ['Invalid input', "I couldn't use <item> because <reason>.", 'Please provide <expected_value> and try again.'],
    'network timeout': ['Network timeout / uncertain outcome', 'The request timed out, so I cannot confirm whether it completed.', 'Please check its current status before submitting it again.'],
    'internal error': ['Internal error', 'An error interrupted the operation on <item>. I cannot confirm whether it completed.', 'Please check the operation status before trying again.'],
    'partial completion': ['Partial completion', 'I completed <completed>, but could not finish <remaining>.', 'Please review <status_location> before retrying the remaining work.'],
    success: ['Success', "I've completed <item>.", 'You can find it at <location>.'],
    custom: ['Custom message', '', '']
  };
  const toneOpenings = {
    light: 'Pardon me.',
    formal: 'I beg your pardon.',
    ceremonial: 'Pardon the interruption.',
    theatrical: 'With considerable embarrassment, I must report the following.'
  };

  function init() {
    const root = document.getElementById('constructor-root');
    if (!root || root.dataset.ready === 'true') return;
    root.dataset.ready = 'true';
    root.innerHTML = `
      <section class="message-constructor" aria-labelledby="ctor-title">
        <p class="eyebrow">Build a thoughtful message</p><h2 id="ctor-title">Message constructor</h2>
        <p class="helper">Compose a software message, fill its placeholders, and copy the draft.</p>
        <div class="ctor-grid">
          <div class="field"><label for="ctor-scenario">Situation</label><select id="ctor-scenario">${Object.entries(cases).map(([key, data]) => `<option value="${key}">${data[0]}</option>`).join('')}</select></div>
          <div class="field"><label for="ctor-tone">Tone</label><select id="ctor-tone"><option value="light">Light</option><option value="formal">Formal</option><option value="ceremonial">Ceremonial</option><option value="theatrical">Theatrical</option></select><span class="helper">A courtesy lead-in is suggested for built-in messages.</span></div>
          <div class="field field-wide"><label for="ctor-opening">Optional courtesy lead-in</label><textarea id="ctor-opening" rows="2" placeholder="Optional"></textarea></div>
          <div class="field field-wide"><label for="ctor-body">Additional message text</label><textarea id="ctor-body" rows="3" placeholder="Optional"></textarea></div>
          <div class="field field-wide"><label for="ctor-state">Known state</label><label><input id="ctor-use-state" type="checkbox" checked> Include state</label><textarea id="ctor-state" rows="3"></textarea></div>
          <div class="field field-wide"><label for="ctor-action">Next step</label><label><input id="ctor-use-action" type="checkbox" checked> Include next step</label><textarea id="ctor-action" rows="3"></textarea></div>
          <div id="ctor-fields" class="field field-wide" aria-live="polite"></div>
          <div class="field field-wide"><label for="ctor-reference">Optional reference or link</label><input id="ctor-reference" type="text" placeholder="Ticket, document, or link" autocomplete="off"></div>
          <div class="field field-wide"><label for="ctor-preview">Live preview</label><pre id="ctor-preview" class="preview" tabindex="0" aria-label="Message preview"></pre></div>
        </div>
        <div class="control-row"><button type="button" class="button button-primary" id="ctor-copy">Copy message</button><button type="button" class="button" id="ctor-download">Download .txt</button><button type="button" class="button" id="ctor-reset">Reset</button><span id="ctor-status" class="helper" role="status" aria-live="polite"></span></div>
      </section>`;

    const $ = id => root.querySelector('#' + id);
    const scenario = $('ctor-scenario'), tone = $('ctor-tone'), opening = $('ctor-opening');
    const body = $('ctor-body'), state = $('ctor-state'), action = $('ctor-action');
    const useState = $('ctor-use-state'), useAction = $('ctor-use-action');
    const fields = $('ctor-fields'), reference = $('ctor-reference'), preview = $('ctor-preview'), status = $('ctor-status');
    let loadedLibraryText = false, openingWasEdited = false;
    const inputs = [opening, body, state, action];

    function tokens(text) { return Array.from(text.matchAll(/<([a-zA-Z][\w. -]*)>/g), m => m[1]); }
    function updateFields() {
      const active = [opening, body, ...(useState.checked ? [state] : []), ...(useAction.checked ? [action] : [])];
      const names = Array.from(new Set(active.flatMap(el => tokens(el.value))));
      const prior = Object.create(null);
      fields.querySelectorAll('input').forEach(el => { prior[el.dataset.key] = el.value; });
      fields.innerHTML = names.map(name => `<div class="field"><label for="ctor-value-${encodeURIComponent(name)}">${name.replace(/[._-]+/g, ' ')}</label><input id="ctor-value-${encodeURIComponent(name)}" data-key="${name}" type="text" autocomplete="off" placeholder="Enter ${name.replace(/[._-]+/g, ' ')}"></div>`).join('');
      fields.querySelectorAll('input').forEach(el => { if (prior[el.dataset.key] !== undefined) el.value = prior[el.dataset.key]; el.addEventListener('input', update); });
    }
    function update() {
      const vals = Object.create(null);
      fields.querySelectorAll('input').forEach(el => { vals[el.dataset.key] = el.value.trim(); });
      const substitute = text => text.replace(/<([a-zA-Z][\w. -]*)>/g, (_, key) => vals[key] || `<${key}>`);
      const parts = [];
      if (opening.value.trim()) parts.push(substitute(opening.value.trim()));
      if (body.value.trim()) parts.push(substitute(body.value.trim()));
      if (useState.checked && state.value.trim()) parts.push(substitute(state.value.trim()));
      if (useAction.checked && action.value.trim()) parts.push(substitute(action.value.trim()));
      if (reference.value.trim()) parts.push('Reference: ' + reference.value.trim());
      preview.textContent = parts.join('\n\n');
    }
    function setScenario(key) {
      fields.innerHTML = '';
      const data = cases[key] || cases.custom;
      body.value = ''; state.value = data[1]; action.value = data[2];
      useState.checked = Boolean(data[1]); useAction.checked = Boolean(data[2]);
      if (!loadedLibraryText && !openingWasEdited) opening.value = key === 'success' ? 'With pleasure.' : key === 'custom' ? '' : toneOpenings[tone.value] || '';
      updateFields(); update();
    }
    scenario.addEventListener('change', () => { loadedLibraryText = false; openingWasEdited = false; opening.value = ''; setScenario(scenario.value); });
    tone.addEventListener('change', () => { if (!loadedLibraryText && !openingWasEdited) opening.value = scenario.value === 'success' ? 'With pleasure.' : scenario.value === 'custom' ? '' : toneOpenings[tone.value] || ''; update(); });
    inputs.forEach(el => el.addEventListener('input', () => { if (el === opening) openingWasEdited = true; updateFields(); update(); }));
    [useState, useAction, reference].forEach(el => el.addEventListener('input', update));
    [useState, useAction].forEach(el => el.addEventListener('change', () => {updateFields(); update();}));

    $('ctor-copy').addEventListener('click', async () => {
      const text = preview.textContent;
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(text); status.textContent = 'Message copied.';
      } catch (_) {
        const area = document.createElement('textarea'); area.value = text; area.setAttribute('readonly', '');
        area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch (_) { ok = false; } area.remove();
        status.textContent = ok ? 'Message copied.' : 'Copy was blocked. Select the preview and copy it manually.';
      }
    });
    $('ctor-download').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([preview.textContent + '\n'], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'courtesy-message.txt'; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); status.textContent = 'Text file downloaded.';
    });
    $('ctor-reset').addEventListener('click', () => {
      loadedLibraryText = false; openingWasEdited = false; scenario.value = 'file busy'; tone.value = 'light';
      opening.value = ''; body.value = ''; state.value = ''; action.value = ''; reference.value = '';
      useState.checked = true; useAction.checked = true; setScenario(scenario.value); status.textContent = 'Constructor reset.';
    });

    window.CourtesyConstructor = window.CourtesyConstructor || {};
    window.CourtesyConstructor.load = function (text) {
      loadedLibraryText = true; openingWasEdited = false; fields.innerHTML = '';
      scenario.value = 'custom'; tone.value = 'light'; opening.value = ''; reference.value = '';
      body.value = String(text == null ? '' : text); state.value = ''; action.value = '';
      useState.checked = false; useAction.checked = false;
      updateFields(); update(); status.textContent = 'Library wording loaded. It remains unchanged by tone selection.'; body.focus();
    };
    window.CourtesyConstructor.init = init;
    scenario.value = 'file busy'; setScenario('file busy');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
}());
