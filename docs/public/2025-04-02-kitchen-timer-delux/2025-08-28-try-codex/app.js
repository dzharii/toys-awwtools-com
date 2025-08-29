(() => {
  const LS_TILES = 'ktt_tiles_v1';
  const LS_SETTINGS = 'ktt_settings_v1';

  const defaultSettings = {
    use12h: false,
    shake: true,
    titleAnim: true,
    webNotif: false,
  };

  const state = {
    settings: loadSettings(),
    mods: loadMods(), // { [id]: { initialDuration, links, origin: 'modified' } }
    timers: new Map(), // id -> { remaining, running, lastTs, int }
    baseTitle: document.title,
    titleAnim: { int: null, until: 0, pulse: 0 },
  };

  // Utilities
  // Simple stable hash-based ID generator (no built-ins like crypto)
  function generateId(parts) {
    const s = String(parts.join('-')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let h = 2166136261 >>> 0; // FNV-1a
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    const hex = (h >>> 0).toString(16).padStart(8, '0');
    return `${s}-${hex.slice(-4)}`;
  }
  function saveSettings() { localStorage.setItem(LS_SETTINGS, JSON.stringify(state.settings)); }
  function loadSettings() {
    try { return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(LS_SETTINGS)) || {}) }; }
    catch { return { ...defaultSettings }; }
  }
  function saveMods() { localStorage.setItem(LS_TILES, JSON.stringify(state.mods)); }
  function loadMods() { try { return JSON.parse(localStorage.getItem(LS_TILES)) || {}; } catch { return {}; } }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function parseHMS(str) {
    // Accept HH:MM:SS or MM:SS or SS
    if (!str) return null;
    const parts = String(str).trim().split(':').map(s => s.trim());
    if (parts.some(p => p === '' || /[^0-9]/.test(p))) return null;
    let h = 0, m = 0, s = 0;
    if (parts.length === 3) { [h, m, s] = parts.map(n => parseInt(n, 10)); }
    else if (parts.length === 2) { [m, s] = parts.map(n => parseInt(n, 10)); }
    else if (parts.length === 1) { s = parseInt(parts[0], 10); }
    else return null;
    if ([h, m, s].some(n => Number.isNaN(n))) return null;
    m = clamp(m, 0, 59); s = clamp(s, 0, 59);
    return h * 3600 + m * 60 + s;
  }

  function fmtHMS(totalSeconds, use12h = false) {
    const neg = totalSeconds < 0;
    let s = Math.abs(Math.floor(totalSeconds));
    let h = Math.floor(s / 3600); s -= h * 3600; let m = Math.floor(s / 60); s -= m * 60;
    let HH = String(use12h ? (h % 12 || 12) : h).padStart(2, '0');
    let MM = String(m).padStart(2, '0');
    let SS = String(s).padStart(2, '0');
    return (neg ? '-' : '') + `${HH}:${MM}:${SS}`;
  }

  // Simple fuzzy match: returns positions of matched chars or null
  function fuzzyPositions(needle, hay) {
    needle = String(needle || '').toLowerCase();
    hay = String(hay || '').toLowerCase();
    let i = 0, pos = [];
    for (let c of needle) {
      i = hay.indexOf(c, i);
      if (i === -1) return null;
      pos.push(i++);
    }
    return pos;
  }
  function highlightFuzzy(text, positions) {
    if (!positions || !positions.length) return escapeHtml(text);
    let out = '', last = 0;
    for (let p of positions) {
      out += escapeHtml(text.slice(last, p)) + '<mark>' + escapeHtml(text[p]) + '</mark>';
      last = p + 1;
    }
    out += escapeHtml(text.slice(last));
    return out;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  }

  // Title animation for completion
  function pulseTitle(message) {
    if (!state.settings.titleAnim) return;
    const durationMs = 10000; // 10 seconds
    state.titleAnim.until = Date.now() + durationMs;
    if (state.titleAnim.int) return; // already running
    state.titleAnim.int = setInterval(() => {
      const now = Date.now();
      if (now >= state.titleAnim.until) {
        clearInterval(state.titleAnim.int);
        state.titleAnim.int = null;
        document.title = state.baseTitle;
        return;
      }
      state.titleAnim.pulse ^= 1;
      document.title = state.titleAnim.pulse ? `⏰ ${message}` : state.baseTitle;
    }, 800);
  }

  async function maybeNotify(title, body) {
    if (!state.settings.webNotif) return;
    try {
      if (Notification.permission === 'default') {
        const res = await Notification.requestPermission();
        if (res !== 'granted') return;
      }
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {}
  }

  // Data merge
  function mergedTiles() {
    return TIMER_PRESETS.map(base => {
      const id = base.id || generateId([base.title, base.category || '']);
      const mod = state.mods[id] || {};
      return { ...base, id, ...mod, origin: mod && Object.keys(mod).length ? 'modified' : base.origin || 'predefined' };
    });
  }

  // Render
  const tilesEl = document.getElementById('tiles');
  function renderTiles(filter = '') {
    const tiles = mergedTiles();
    const q = String(filter || '').trim();
    tilesEl.innerHTML = '';
    for (const t of tiles) {
      const matchTitle = q ? fuzzyPositions(q, t.title) : null;
      const matchDesc = q ? fuzzyPositions(q, t.description) : null;
      const matchCat = q ? fuzzyPositions(q, t.category) : null;
      if (q && !matchTitle && !matchDesc && !matchCat) continue;

      const tile = document.createElement('article');
      tile.className = 'tile';
      tile.dataset.id = t.id;

      const header = document.createElement('div');
      header.className = 'tile-header';
      header.innerHTML = `
        <div class="icon">${escapeHtml(t.icon || '⏱️')}</div>
        <div class="title">${q ? highlightFuzzy(t.title, matchTitle || []) : escapeHtml(t.title)}</div>
        <div class="cat">${q ? (matchCat ? highlightFuzzy(t.category, matchCat) : escapeHtml(t.category)) : escapeHtml(t.category)}</div>
      `;

      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.innerHTML = q ? (matchDesc ? highlightFuzzy(t.description, matchDesc) : escapeHtml(t.description)) : escapeHtml(t.description);

      // Timer block
      const timer = ensureTimerState(t.id, t.initialDuration);
      const timerRow = document.createElement('div');
      timerRow.className = 'timer';
      const timeEl = document.createElement('div');
      timeEl.className = 'time';
      timeEl.textContent = fmtHMS(timer.remaining, state.settings.use12h);

      const startBtn = btn('Start', 'success');
      const pauseBtn = btn('Pause');
      const resetBtn = btn('Reset', 'danger');
      startBtn.addEventListener('click', () => startTimer(t.id, timeEl, tile, t.title));
      pauseBtn.addEventListener('click', () => pauseTimer(t.id));
      resetBtn.addEventListener('click', () => resetTimer(t.id, t.initialDuration, timeEl));

      timerRow.append(timeEl, startBtn, pauseBtn, resetBtn);

      // Links (view)
      const linksView = document.createElement('div');
      linksView.className = 'links';
      (t.links || []).forEach(l => {
        if (!l || !l.title || !l.url) return;
        const a = document.createElement('a');
        a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = l.title;
        linksView.appendChild(a);
      });

      // Edit area (hidden by default)
      const editArea = document.createElement('div');
      editArea.className = 'edit-area';
      editArea.style.display = 'none';
      const durInput = document.createElement('input');
      durInput.type = 'text'; durInput.placeholder = 'HH:MM:SS';
      durInput.value = fmtHMS(t.initialDuration, false);
      const durLabel = document.createElement('label');
      durLabel.textContent = 'Timer value:';
      durLabel.style.fontSize = '12px'; durLabel.style.color = 'var(--muted)';
      const durWrap = document.createElement('div');
      durWrap.className = 'row';
      const durWrapL = document.createElement('div'); durWrapL.style.gridColumn = '1 / -1'; durWrapL.appendChild(durLabel);
      const spacer = document.createElement('div'); spacer.style.display = 'none';
      durWrap.append(durInput, spacer, spacer.cloneNode());

      const linksEdit = document.createElement('div');
      linksEdit.className = 'links';
      function renderLinksEditor() {
        linksEdit.innerHTML = '';
        const items = (t.links || []).slice();
        items.forEach((l, idx) => {
          const row = document.createElement('div'); row.className = 'row';
          const title = document.createElement('input'); title.type = 'text'; title.placeholder = 'Title'; title.value = l.title || '';
          const url = document.createElement('input'); url.type = 'url'; url.placeholder = 'https://...'; url.value = l.url || '';
          const remove = btn('Remove', 'danger');
          remove.addEventListener('click', () => { items.splice(idx, 1); t.links = items; renderLinksEditor(); });
          title.addEventListener('input', () => { items[idx].title = title.value; });
          url.addEventListener('input', () => { items[idx].url = url.value; });
          row.append(title, url, remove);
          linksEdit.appendChild(row);
        });
        const add = btn('Add Link', 'primary'); add.classList.add('add-link');
        add.addEventListener('click', () => { items.push({ title: '', url: '', lastUpdated: '' }); t.links = items; renderLinksEditor(); });
        linksEdit.appendChild(add);
      }
      renderLinksEditor();

      // Edit toggle
      const editBtn = btn('Edit');
      editBtn.addEventListener('click', () => {
        const editing = editArea.style.display === 'none';
        editArea.style.display = editing ? '' : 'none';
        linksView.style.display = editing ? 'none' : '';
        editBtn.textContent = editing ? 'Save' : 'Edit';
        if (!editing) {
          // saving
          const secs = parseHMS(durInput.value);
          if (secs == null) { durInput.focus(); durInput.style.borderColor = 'var(--danger)'; return; }
          durInput.style.borderColor = '';
          // Normalize links: keep only valid pairs; stamp lastUpdated
          const validLinks = (t.links || []).filter(l => l.title && /^https?:\/\//i.test(l.url)).map(l => ({...l, lastUpdated: new Date().toISOString()}));
          // Persist mods
          state.mods[t.id] = { initialDuration: secs, links: validLinks, origin: 'modified', icon: t.icon, title: t.title, description: t.description, category: t.category };
          saveMods();
          // Reset timer state to new initial
          resetTimer(t.id, secs, timeEl);
          // Refresh save indicator
          saveInd.textContent = 'Modified';
          // refresh links view
          linksView.innerHTML = '';
          validLinks.forEach(l => {
            const a = document.createElement('a'); a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = l.title; linksView.appendChild(a);
          });
          // update in-memory tile object
          t.initialDuration = secs; t.links = validLinks; t.origin = 'modified';
        }
      });

      const saveInd = document.createElement('div'); saveInd.className = 'save-ind'; saveInd.textContent = t.origin === 'modified' ? 'Modified' : 'Original';

      editArea.append(durWrapL, durWrap, linksEdit);

      tile.append(header, desc, timerRow, linksView, editArea, editBtn, saveInd);
      tilesEl.appendChild(tile);
    }
  }

  function btn(label, kind) {
    const b = document.createElement('button');
    b.className = 'btn' + (kind ? ` ${kind}` : '');
    b.textContent = label;
    return b;
  }

  function ensureTimerState(id, initialSeconds) {
    let t = state.timers.get(id);
    if (!t) {
      t = { remaining: initialSeconds, running: false, lastTs: 0, int: null };
      state.timers.set(id, t);
    } else if (!t.running && t.remaining == null) {
      t.remaining = initialSeconds;
    }
    return t;
  }

  function tick(id, timeEl, tile, label) {
    const t = state.timers.get(id); if (!t || !t.running) return;
    const now = Date.now();
    const dt = Math.max(0, now - t.lastTs);
    t.lastTs = now;
    t.remaining -= dt / 1000;
    timeEl.textContent = fmtHMS(Math.max(0, t.remaining), state.settings.use12h);
    if (t.remaining <= 0) {
      pauseTimer(id);
      if (state.settings.shake) {
        tile.classList.add('shake'); setTimeout(() => tile.classList.remove('shake'), 700);
      }
      pulseTitle('Timer completed');
      maybeNotify('Timer completed', label || 'Timer done');
    }
  }

  function startTimer(id, timeEl, tile, label) {
    const t = state.timers.get(id); if (!t) return;
    if (t.running) return;
    t.running = true; t.lastTs = Date.now();
    t.int = setInterval(() => tick(id, timeEl, tile, label), 250);
  }
  function pauseTimer(id) {
    const t = state.timers.get(id); if (!t || !t.running) return;
    t.running = false; if (t.int) clearInterval(t.int); t.int = null;
  }
  function resetTimer(id, initialSeconds, timeEl) {
    const t = state.timers.get(id); if (!t) return;
    if (t.int) clearInterval(t.int);
    t.running = false; t.int = null; t.remaining = initialSeconds; t.lastTs = 0;
    if (timeEl) timeEl.textContent = fmtHMS(t.remaining, state.settings.use12h);
  }

  // Search
  const search = document.getElementById('search');
  search.addEventListener('input', () => renderTiles(search.value));

  // Settings panel
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  settingsToggle.addEventListener('click', () => {
    const open = settingsPanel.classList.contains('hidden');
    settingsPanel.classList.toggle('hidden');
    settingsToggle.setAttribute('aria-expanded', String(open));
    settingsPanel.setAttribute('aria-hidden', String(!open));
  });
  document.getElementById('opt12h').checked = state.settings.use12h;
  document.getElementById('optShake').checked = state.settings.shake;
  document.getElementById('optTitleAnim').checked = state.settings.titleAnim;
  document.getElementById('optWebNotif').checked = state.settings.webNotif;
  document.getElementById('opt12h').addEventListener('change', (e) => { state.settings.use12h = e.target.checked; saveSettings(); renderTiles(search.value); });
  document.getElementById('optShake').addEventListener('change', (e) => { state.settings.shake = e.target.checked; saveSettings(); });
  document.getElementById('optTitleAnim').addEventListener('change', (e) => { state.settings.titleAnim = e.target.checked; saveSettings(); if (!e.target.checked && state.titleAnim.int) { clearInterval(state.titleAnim.int); state.titleAnim.int = null; document.title = state.baseTitle; } });
  document.getElementById('optWebNotif').addEventListener('change', async (e) => {
    state.settings.webNotif = e.target.checked; saveSettings();
    if (e.target.checked && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
  });

  // Export
  document.getElementById('exportBtn').addEventListener('click', () => {
    const merged = mergedTiles();
    const payload = {
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      tiles: merged,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kitchen-timers-export.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // Initial render
  renderTiles('');
})();
