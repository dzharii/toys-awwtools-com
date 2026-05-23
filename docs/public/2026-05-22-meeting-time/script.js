(() => {
  'use strict';

  const MS = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  };

  const KNOWN_TIME_ZONES = [
    'UTC',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/Berlin',
    'Europe/London',
    'Asia/Tokyo'
  ];

  const SPRITES = {
    'female-minimal-soft': { label: 'Female Minimal Soft', gender: 'female', facing: 'right', atlas: 'assets/sprites/atlases/female-minimal-soft.png' },
    'female-storyboard-warmth': { label: 'Female Storyboard Warmth', gender: 'female', facing: 'right', atlas: 'assets/sprites/atlases/female-storyboard-warmth.png' },
    'female-dark-precision': { label: 'Female Dark Precision', gender: 'female', facing: 'right', atlas: 'assets/sprites/atlases/female-dark-precision.png' },
    'female-enterprise-friendly': { label: 'Female Enterprise Friendly', gender: 'female', facing: 'right', atlas: 'assets/sprites/atlases/female-enterprise-friendly.png' },
    'female-glass-focus': { label: 'Female Glass Focus', gender: 'female', facing: 'right', atlas: 'assets/sprites/atlases/female-glass-focus.png' },
    'male-minimal-soft': { label: 'Male Minimal Soft', gender: 'male', facing: 'left', atlas: 'assets/sprites/atlases/male-minimal-soft.png' },
    'male-storyboard-warmth': { label: 'Male Storyboard Warmth', gender: 'male', facing: 'left', atlas: 'assets/sprites/atlases/male-storyboard-warmth.png' },
    'male-dark-precision': { label: 'Male Dark Precision', gender: 'male', facing: 'left', atlas: 'assets/sprites/atlases/male-dark-precision.png' },
    'male-calendar-companion': { label: 'Male Calendar Companion', gender: 'male', facing: 'left', atlas: 'assets/sprites/atlases/male-calendar-companion.png' },
    'male-premium-command': { label: 'Male Premium Command', gender: 'male', facing: 'left', atlas: 'assets/sprites/atlases/male-premium-command.png' }
  };

  const PARTICIPANT_PALETTES = {
    ocean: {
      label: 'Ocean',
      light: { bg: '#e8f1ff', border: '#95b8f6', text: '#163a6b' },
      dark: { bg: '#19304f', border: '#4f7fc8', text: '#d8e8ff' }
    },
    amber: {
      label: 'Amber',
      light: { bg: '#fff1d6', border: '#e6b450', text: '#6f4700' },
      dark: { bg: '#4a3416', border: '#c28a20', text: '#ffe2a3' }
    },
    teal: {
      label: 'Teal',
      light: { bg: '#dff6f1', border: '#78c8bb', text: '#124f49' },
      dark: { bg: '#123c3b', border: '#3ba99b', text: '#c7f4ed' }
    },
    plum: {
      label: 'Plum',
      light: { bg: '#f1e8ff', border: '#b69bed', text: '#4b2676' },
      dark: { bg: '#34214f', border: '#8262c2', text: '#eadfff' }
    },
    rose: {
      label: 'Rose',
      light: { bg: '#ffe8ef', border: '#ee9aae', text: '#7a1d36' },
      dark: { bg: '#4c1d2b', border: '#d65f7a', text: '#ffd7e1' }
    },
    green: {
      label: 'Green',
      light: { bg: '#e5f6df', border: '#91c982', text: '#26551d' },
      dark: { bg: '#203c20', border: '#66a65f', text: '#daf4d3' }
    }
  };

  const DEFAULT_PALETTE_PAIR = makeDefaultPalettePair();

  const DEFAULT_CONFIG = {
    title: 'Design Sync',
    startsAtUtc: makeDefaultFutureIso(),
    createdAtUtc: makeCurrentIso(),
    durationMinutes: 60,
    participantA: { name: 'Alice', timeZone: 'America/Los_Angeles', spriteKey: 'female-minimal-soft', paletteKey: DEFAULT_PALETTE_PAIR.a },
    participantB: { name: 'Bruno', timeZone: 'Europe/Berlin', spriteKey: 'male-dark-precision', paletteKey: DEFAULT_PALETTE_PAIR.b },
    theme: 'light',
    animationEnabled: true,
    renderMode: 'sprite'
  };

  const state = {
    config: cloneConfig(DEFAULT_CONFIG),
    draft: null,
    isEditing: false,
    baselineConfig: null,
    baselineHash: '',
    lastValidMeetingMs: Date.parse(DEFAULT_CONFIG.startsAtUtc),
    lastValidCreatedMs: Date.parse(DEFAULT_CONFIG.createdAtUtc),
    lastRenderedScale: null,
    hashTimer: 0,
    copyResetTimer: 0,
    lastCopyText: '',
    suppressHashChange: false
  };

  const el = {
    appShell: document.querySelector('.app-shell'),
    pageTitle: document.getElementById('pageTitle'),
    timelineSection: document.getElementById('timelineSection'),
    timelineStage: document.getElementById('timelineStage'),
    meetingCard: document.querySelector('.meeting-card'),
    themeControl: document.getElementById('themeControl'),
    renderControl: document.getElementById('renderControl'),
    aSpriteControl: document.getElementById('aSpriteControl'),
    bSpriteControl: document.getElementById('bSpriteControl'),
    aPaletteControl: document.getElementById('aPaletteControl'),
    bPaletteControl: document.getElementById('bPaletteControl'),
    animationToggle: document.getElementById('animationToggle'),
    animationStatus: document.getElementById('animationStatus'),
    scaleText: document.getElementById('scaleText'),
    shareButton: document.getElementById('shareButton'),
    editButton: document.getElementById('editButton'),
    meetingTitle: document.getElementById('meetingTitle'),
    participantAName: document.getElementById('participantAName'),
    participantBName: document.getElementById('participantBName'),
    participantAZone: document.getElementById('participantAZone'),
    participantBZone: document.getElementById('participantBZone'),
    participantATime: document.getElementById('participantATime'),
    participantBTime: document.getElementById('participantBTime'),
    participantADate: document.getElementById('participantADate'),
    participantBDate: document.getElementById('participantBDate'),
    utcTime: document.getElementById('utcTime'),
    utcDate: document.getElementById('utcDate'),
    aTimeLabel: document.getElementById('aTimeLabel'),
    bTimeLabel: document.getElementById('bTimeLabel'),
    aTimeCompact: document.getElementById('aTimeCompact'),
    bTimeCompact: document.getElementById('bTimeCompact'),
    aDateCompact: document.getElementById('aDateCompact'),
    bDateCompact: document.getElementById('bDateCompact'),
    countdownText: document.getElementById('countdownText'),
    timelineTicks: document.getElementById('timelineTicks'),
    characterA: document.getElementById('characterA'),
    characterB: document.getElementById('characterB'),
    characterALabel: document.getElementById('characterALabel'),
    characterBLabel: document.getElementById('characterBLabel'),
    spriteFrameA: document.getElementById('spriteFrameA'),
    spriteFrameB: document.getElementById('spriteFrameB'),
    summaryUntil: document.getElementById('summaryUntil'),
    summaryAsOf: document.getElementById('summaryAsOf'),
    summaryDuration: document.getElementById('summaryDuration'),
    summaryDurationText: document.getElementById('summaryDurationText'),
    summaryParticipants: document.getElementById('summaryParticipants'),
    summaryUpdated: document.getElementById('summaryUpdated'),
    editPanel: document.getElementById('editPanel'),
    saveButton: document.getElementById('saveButton'),
    cancelButton: document.getElementById('cancelButton'),
    copyEditLinkButton: document.getElementById('copyEditLinkButton'),
    titleInput: document.getElementById('titleInput'),
    durationInput: document.getElementById('durationInput'),
    editThemeInput: document.getElementById('editThemeInput'),
    editRenderInput: document.getElementById('editRenderInput'),
    editASpriteInput: document.getElementById('editASpriteInput'),
    editBSpriteInput: document.getElementById('editBSpriteInput'),
    editAPaletteInput: document.getElementById('editAPaletteInput'),
    editBPaletteInput: document.getElementById('editBPaletteInput'),
    aNameInput: document.getElementById('aNameInput'),
    bNameInput: document.getElementById('bNameInput'),
    aTzInput: document.getElementById('aTzInput'),
    bTzInput: document.getElementById('bTzInput'),
    utcDateInput: document.getElementById('utcDateInput'),
    utcTimeInput: document.getElementById('utcTimeInput'),
    aDateInput: document.getElementById('aDateInput'),
    aTimeInput: document.getElementById('aTimeInput'),
    bDateInput: document.getElementById('bDateInput'),
    bTimeInput: document.getElementById('bTimeInput'),
    aEditLegend: document.getElementById('aEditLegend'),
    bEditLegend: document.getElementById('bEditLegend'),
    validationMessage: document.getElementById('validationMessage')
  };

  init();

  function init() {
    populateSpriteSelects();
    populatePaletteSelects();
    populateTimeZoneList();
    const parsed = parseHash(window.location.hash);
    if (parsed.config) {
      state.config = mergeConfig(DEFAULT_CONFIG, parsed.config);
      state.lastValidMeetingMs = Date.parse(state.config.startsAtUtc);
      state.lastValidCreatedMs = Date.parse(state.config.createdAtUtc);
      if (!parsed.hadCreatedAt || !parsed.hadPalettes) replaceHash(state.config, parsed.mode || 'view');
      if (parsed.mode === 'edit') {
        enterEditMode(false);
      }
    } else {
      ensureCreatedAt(state.config);
      replaceHash(state.config, 'view');
    }

    wireEvents();
    render();
    startRenderLoop();
  }

  function wireEvents() {
    el.editButton.addEventListener('click', () => enterEditMode(true));
    el.saveButton.addEventListener('click', saveEditMode);
    el.cancelButton.addEventListener('click', cancelEditMode);
    el.shareButton.addEventListener('click', () => copyLink(el.shareButton));
    el.copyEditLinkButton.addEventListener('click', () => copyLink(el.copyEditLinkButton));

    el.themeControl.addEventListener('change', () => {
      setTheme(el.themeControl.value);
      const active = getActiveConfig();
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    el.renderControl.addEventListener('change', () => {
      setRenderMode(el.renderControl.value);
      const active = getActiveConfig();
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    el.aSpriteControl.addEventListener('change', () => {
      const active = getActiveConfig();
      active.participantA.spriteKey = el.aSpriteControl.value;
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    el.bSpriteControl.addEventListener('change', () => {
      const active = getActiveConfig();
      active.participantB.spriteKey = el.bSpriteControl.value;
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    el.aPaletteControl.addEventListener('change', () => {
      const active = getActiveConfig();
      active.participantA.paletteKey = el.aPaletteControl.value;
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    el.bPaletteControl.addEventListener('change', () => {
      const active = getActiveConfig();
      active.participantB.paletteKey = el.bPaletteControl.value;
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    el.animationToggle.addEventListener('click', () => {
      const active = getActiveConfig();
      active.animationEnabled = !active.animationEnabled;
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    [el.titleInput, el.durationInput, el.aNameInput, el.bNameInput, el.aTzInput, el.bTzInput, el.editThemeInput, el.editRenderInput, el.editASpriteInput, el.editBSpriteInput, el.editAPaletteInput, el.editBPaletteInput]
      .forEach(input => input.addEventListener('input', handleMetaInput));
    [el.editThemeInput, el.editRenderInput, el.editASpriteInput, el.editBSpriteInput, el.editAPaletteInput, el.editBPaletteInput, el.aTzInput, el.bTzInput]
      .forEach(input => input.addEventListener('change', handleMetaInput));

    [el.utcDateInput, el.utcTimeInput].forEach(input => input.addEventListener('input', () => handleTimeInput('UTC')));
    [el.aDateInput, el.aTimeInput].forEach(input => input.addEventListener('input', () => handleTimeInput('participantA')));
    [el.bDateInput, el.bTimeInput].forEach(input => input.addEventListener('input', () => handleTimeInput('participantB')));

    window.addEventListener('hashchange', () => {
      if (state.suppressHashChange) return;
      const parsed = parseHash(window.location.hash);
      if (!parsed.config) return;
      state.config = mergeConfig(DEFAULT_CONFIG, parsed.config);
      state.lastValidMeetingMs = Date.parse(state.config.startsAtUtc);
      state.lastValidCreatedMs = Date.parse(state.config.createdAtUtc);
      if (!parsed.hadCreatedAt || !parsed.hadPalettes) replaceHash(state.config, parsed.mode || 'view');
      if (parsed.mode === 'edit') enterEditMode(false);
      else {
        state.isEditing = false;
        state.draft = null;
      }
      render();
    });
  }

  function populateSpriteSelects() {
    const options = Object.entries(SPRITES)
      .map(([key, sprite]) => `<option value="${key}">${sprite.label}</option>`)
      .join('');
    [el.aSpriteControl, el.bSpriteControl, el.editASpriteInput, el.editBSpriteInput].forEach(select => {
      if (select) select.innerHTML = options;
    });
  }

  function populatePaletteSelects() {
    const options = Object.entries(PARTICIPANT_PALETTES)
      .map(([key, palette]) => `<option value="${key}">${palette.label}</option>`)
      .join('');
    [el.aPaletteControl, el.bPaletteControl, el.editAPaletteInput, el.editBPaletteInput].forEach(select => {
      if (select) select.innerHTML = options;
    });
  }

  function populateTimeZoneList() {
    const list = document.getElementById('timezoneList');
    if (!list) return;
    const zones = typeof Intl.supportedValuesOf === 'function'
      ? ['UTC', ...Intl.supportedValuesOf('timeZone')]
      : KNOWN_TIME_ZONES;
    list.innerHTML = [...new Set(zones)]
      .map(zone => `<option value="${zone}"></option>`)
      .join('');
  }

  function makeDefaultFutureIso() {
    const now = Date.now();
    const rounded = Math.ceil((now + 2 * MS.hour) / (15 * MS.minute)) * 15 * MS.minute;
    return new Date(rounded).toISOString();
  }

  function makeCurrentIso() {
    return new Date().toISOString();
  }

  function makeDefaultPalettePair() {
    const keys = Object.keys(PARTICIPANT_PALETTES);
    const start = Math.floor(Date.now() / MS.minute) % keys.length;
    return { a: keys[start], b: keys[(start + 2) % keys.length] };
  }

  function cloneConfig(config) {
    return {
      title: config.title,
      startsAtUtc: config.startsAtUtc,
      createdAtUtc: config.createdAtUtc || makeCurrentIso(),
      durationMinutes: Number(config.durationMinutes) || 60,
      participantA: { ...config.participantA, paletteKey: config.participantA.paletteKey || DEFAULT_PALETTE_PAIR.a },
      participantB: { ...config.participantB, paletteKey: config.participantB.paletteKey || DEFAULT_PALETTE_PAIR.b },
      theme: config.theme || 'light',
      animationEnabled: config.animationEnabled !== false,
      renderMode: config.renderMode || 'sprite'
    };
  }

  function mergeConfig(base, incoming) {
    const merged = cloneConfig(base);
    if (incoming.title) merged.title = incoming.title;
    if (Number.isFinite(incoming.durationMinutes) && incoming.durationMinutes > 0) merged.durationMinutes = incoming.durationMinutes;
    if (Number.isFinite(Date.parse(incoming.startsAtUtc))) merged.startsAtUtc = new Date(Date.parse(incoming.startsAtUtc)).toISOString();
    if (Number.isFinite(Date.parse(incoming.createdAtUtc))) merged.createdAtUtc = new Date(Date.parse(incoming.createdAtUtc)).toISOString();
    if (incoming.participantA) merged.participantA = { ...merged.participantA, ...incoming.participantA };
    if (incoming.participantB) merged.participantB = { ...merged.participantB, ...incoming.participantB };
    if (!SPRITES[merged.participantA.spriteKey]) merged.participantA.spriteKey = DEFAULT_CONFIG.participantA.spriteKey;
    if (!SPRITES[merged.participantB.spriteKey]) merged.participantB.spriteKey = DEFAULT_CONFIG.participantB.spriteKey;
    if (!PARTICIPANT_PALETTES[merged.participantA.paletteKey]) merged.participantA.paletteKey = DEFAULT_CONFIG.participantA.paletteKey;
    if (!PARTICIPANT_PALETTES[merged.participantB.paletteKey]) merged.participantB.paletteKey = DEFAULT_CONFIG.participantB.paletteKey;
    if (['light', 'dark', 'neutral', 'auto'].includes(incoming.theme)) merged.theme = incoming.theme;
    if (typeof incoming.animationEnabled === 'boolean') merged.animationEnabled = incoming.animationEnabled;
    if (['svg', 'sprite'].includes(incoming.renderMode)) merged.renderMode = incoming.renderMode;
    ensureCreatedAt(merged);
    return merged;
  }

  function ensureCreatedAt(config) {
    let meetingMs = Date.parse(config.startsAtUtc);
    let createdMs = Date.parse(config.createdAtUtc);
    if (!Number.isFinite(meetingMs)) {
      meetingMs = Date.parse(DEFAULT_CONFIG.startsAtUtc);
      config.startsAtUtc = new Date(meetingMs).toISOString();
    }
    if (!Number.isFinite(createdMs)) createdMs = Date.now();
    if (meetingMs <= createdMs) {
      const now = Date.now();
      createdMs = meetingMs > now ? now : meetingMs - MS.hour;
    }
    config.createdAtUtc = new Date(createdMs).toISOString();
    state.lastValidCreatedMs = createdMs;
    return createdMs;
  }

  function parseHash(hash) {
    if (!hash || hash.length < 2) return { config: null, mode: 'view', hadCreatedAt: false, hadPalettes: false };
    const raw = hash.replace(/^#/, '');
    const pairs = raw.split('&').filter(Boolean).map(part => {
      const at = part.indexOf('=');
      if (at === -1) return [decode(part), ''];
      return [decode(part.slice(0, at)), part.slice(at + 1)];
    });
    const map = Object.fromEntries(pairs);
    const startsAtRaw = map.at ? decode(map.at) : '';
    const createdAtRaw = map.ct ? decode(map.ct) : '';
    const startsAtMs = Date.parse(startsAtRaw);
    const createdAtMs = Date.parse(createdAtRaw);
    const config = {};
    if (map.t) config.title = decode(map.t);
    if (Number.isFinite(startsAtMs)) config.startsAtUtc = new Date(startsAtMs).toISOString();
    if (Number.isFinite(createdAtMs)) config.createdAtUtc = new Date(createdAtMs).toISOString();
    if (map.dur) {
      const dur = Number(decode(map.dur));
      if (Number.isFinite(dur) && dur > 0) config.durationMinutes = dur;
    }
    if (map.a) config.participantA = parseParticipant(map.a, DEFAULT_CONFIG.participantA);
    if (map.b) config.participantB = parseParticipant(map.b, DEFAULT_CONFIG.participantB);
    if (map.theme && ['light', 'dark', 'neutral', 'auto'].includes(decode(map.theme))) config.theme = decode(map.theme);
    if (map.anim) config.animationEnabled = decode(map.anim) !== '0';
    if (map.render && ['svg', 'sprite'].includes(decode(map.render))) config.renderMode = decode(map.render);
    if (map.spriteA && config.participantA && SPRITES[decode(map.spriteA)]) config.participantA.spriteKey = decode(map.spriteA);
    if (map.spriteB && config.participantB && SPRITES[decode(map.spriteB)]) config.participantB.spriteKey = decode(map.spriteB);
    if (map.colorA && config.participantA && PARTICIPANT_PALETTES[decode(map.colorA)]) config.participantA.paletteKey = decode(map.colorA);
    if (map.colorB && config.participantB && PARTICIPANT_PALETTES[decode(map.colorB)]) config.participantB.paletteKey = decode(map.colorB);
    const mode = map.mode && decode(map.mode) === 'edit' ? 'edit' : 'view';
    return { config, mode, hadCreatedAt: Number.isFinite(createdAtMs), hadPalettes: Boolean(map.colorA && map.colorB) };
  }

  function parseParticipant(rawValue, fallback) {
    const decodedRaw = decode(rawValue);
    const at = decodedRaw.indexOf('@');
    if (at === -1) return { ...fallback };
    const name = decodedRaw.slice(0, at) || fallback.name;
    const timeZone = decodedRaw.slice(at + 1).replace(/~/g, '/') || fallback.timeZone;
    return { name, timeZone };
  }

  function serializeHash(config, mode) {
    ensureCreatedAt(config);
    const at = new Date(Date.parse(config.startsAtUtc)).toISOString().replace(/:00\.000Z$/, 'Z');
    const ct = new Date(Date.parse(config.createdAtUtc)).toISOString().replace(/:00\.000Z$/, 'Z');
    const parts = [
      ['v', '1'],
      ['t', config.title || DEFAULT_CONFIG.title],
      ['at', at],
      ['ct', ct],
      ['dur', String(config.durationMinutes || DEFAULT_CONFIG.durationMinutes)],
      ['a', encodeParticipant(config.participantA)],
      ['b', encodeParticipant(config.participantB)],
      ['theme', config.theme || 'light'],
      ['anim', config.animationEnabled === false ? '0' : '1'],
      ['mode', mode || 'view'],
      ['render', config.renderMode || 'sprite'],
      ['spriteA', config.participantA.spriteKey || DEFAULT_CONFIG.participantA.spriteKey],
      ['spriteB', config.participantB.spriteKey || DEFAULT_CONFIG.participantB.spriteKey],
      ['colorA', config.participantA.paletteKey || DEFAULT_CONFIG.participantA.paletteKey],
      ['colorB', config.participantB.paletteKey || DEFAULT_CONFIG.participantB.paletteKey]
    ];
    return '#' + parts.map(([key, value]) => `${encode(key)}=${key === 'a' || key === 'b' ? value : encode(value)}`).join('&');
  }

  function encodeParticipant(participant) {
    const name = encode(participant.name || '');
    const zone = encode((participant.timeZone || 'UTC').replace(/\//g, '~'));
    return `${name}@${zone}`;
  }

  function encode(value) {
    return encodeURIComponent(String(value)).replace(/%20/g, '%20');
  }

  function decode(value) {
    try {
      return decodeURIComponent(String(value).replace(/\+/g, ' '));
    } catch {
      return String(value);
    }
  }

  function replaceHash(config, mode) {
    const hash = serializeHash(config, mode);
    state.suppressHashChange = true;
    history.replaceState(null, '', hash);
    window.setTimeout(() => { state.suppressHashChange = false; }, 0);
  }

  function pushHash(config, mode) {
    const hash = serializeHash(config, mode);
    state.suppressHashChange = true;
    history.pushState(null, '', hash);
    window.setTimeout(() => { state.suppressHashChange = false; }, 0);
  }

  function scheduleHashUpdate(config, mode) {
    window.clearTimeout(state.hashTimer);
    state.hashTimer = window.setTimeout(() => replaceHash(config, mode), 250);
  }

  function getActiveConfig() {
    return state.isEditing && state.draft ? state.draft.config : state.config;
  }

  function setTheme(theme) {
    const active = getActiveConfig();
    active.theme = theme;
    if (state.isEditing && state.draft) state.draft.config.theme = theme;
    else state.config.theme = theme;
  }

  function setRenderMode(renderMode) {
    const active = getActiveConfig();
    active.renderMode = renderMode;
    if (state.isEditing && state.draft) state.draft.config.renderMode = renderMode;
    else state.config.renderMode = renderMode;
  }

  function enterEditMode(updateHash) {
    if (state.isEditing) return;
    state.baselineConfig = cloneConfig(state.config);
    state.baselineHash = window.location.hash || serializeHash(state.config, 'view');
    state.draft = createDraft(state.config);
    state.isEditing = true;
    if (updateHash) replaceHash(state.draft.config, 'edit');
    render();
    window.requestAnimationFrame(() => {
      el.editPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        try {
          el.titleInput.focus({ preventScroll: true });
        } catch {
          el.titleInput.focus();
        }
      }, 180);
    });
  }

  function createDraft(config) {
    const draftConfig = cloneConfig(config);
    return {
      config: draftConfig,
      activeTimeSource: null,
      validation: { source: null, message: '', isValid: true },
      utcDate: '', utcTime: '', aDate: '', aTime: '', bDate: '', bTime: ''
    };
  }

  function saveEditMode() {
    if (!state.isEditing || !state.draft) return;
    const metaValidation = getMetaValidation();
    if (metaValidation) {
      state.draft.validation = { ...metaValidation, isValid: false };
      showValidation(metaValidation.message, true);
      render(false);
      return;
    }
    if (!state.draft.validation.isValid) {
      showValidation(state.draft.validation.message || 'Fix the invalid time before saving.', true);
      return;
    }
    state.config = cloneConfig(state.draft.config);
    ensureCreatedAt(state.config);
    state.isEditing = false;
    state.draft = null;
    state.baselineConfig = null;
    pushHash(state.config, 'view');
    render();
  }

  function cancelEditMode() {
    if (!state.isEditing) return;
    state.config = cloneConfig(state.baselineConfig || DEFAULT_CONFIG);
    ensureCreatedAt(state.config);
    state.lastValidMeetingMs = Date.parse(state.config.startsAtUtc);
    state.lastValidCreatedMs = Date.parse(state.config.createdAtUtc);
    state.isEditing = false;
    state.draft = null;
    state.baselineConfig = null;
    state.suppressHashChange = true;
    history.replaceState(null, '', state.baselineHash || serializeHash(state.config, 'view'));
    window.setTimeout(() => { state.suppressHashChange = false; }, 0);
    render();
  }

  function handleMetaInput() {
    if (!state.isEditing || !state.draft) return;
    const config = state.draft.config;
    config.title = el.titleInput.value.trim() || DEFAULT_CONFIG.title;
    const duration = Number(el.durationInput.value);
    if (Number.isFinite(duration) && duration > 0) config.durationMinutes = duration;
    config.participantA.name = el.aNameInput.value.trim() || DEFAULT_CONFIG.participantA.name;
    config.participantB.name = el.bNameInput.value.trim() || DEFAULT_CONFIG.participantB.name;
    config.theme = el.editThemeInput.value;
    config.renderMode = el.editRenderInput.value;
    if (SPRITES[el.editASpriteInput.value]) config.participantA.spriteKey = el.editASpriteInput.value;
    if (SPRITES[el.editBSpriteInput.value]) config.participantB.spriteKey = el.editBSpriteInput.value;
    if (PARTICIPANT_PALETTES[el.editAPaletteInput.value]) config.participantA.paletteKey = el.editAPaletteInput.value;
    if (PARTICIPANT_PALETTES[el.editBPaletteInput.value]) config.participantB.paletteKey = el.editBPaletteInput.value;

    const metaValidation = getMetaValidation();
    if (metaValidation) {
      state.draft.validation = { ...metaValidation, isValid: false };
      render(false);
      return;
    }

    const oldATz = config.participantA.timeZone;
    const oldBTz = config.participantB.timeZone;
    config.participantA.timeZone = el.aTzInput.value.trim();
    config.participantB.timeZone = el.bTzInput.value.trim();

    if (oldATz !== config.participantA.timeZone || oldBTz !== config.participantB.timeZone) {
      syncDraftTimeFields(Date.parse(config.startsAtUtc), null);
    }
    if (isMetaValidationSource(state.draft.validation.source)) {
      state.draft.validation = { source: null, message: '', isValid: true };
    }
    scheduleHashUpdate(config, 'edit');
    render();
  }

  function handleTimeInput(source) {
    if (!state.isEditing || !state.draft) return;
    state.draft.activeTimeSource = source;
    captureTimeFieldValues();
    const metaValidation = getMetaValidation();
    if (metaValidation) {
      state.draft.validation = { ...metaValidation, isValid: false };
      render(false);
      return;
    }
    const result = parseSourceTime(source);
    const timeRow = document.querySelector(`.time-row[data-source="${source}"]`);
    if (!result.valid) {
      state.draft.validation = { source, message: result.message, isValid: false };
      if (timeRow) timeRow.classList.add('invalid');
      render(false);
      return;
    }

    state.draft.validation = { source: null, message: '', isValid: true };
    state.draft.config.startsAtUtc = new Date(result.ms).toISOString();
    ensureCreatedAt(state.draft.config);
    state.lastValidMeetingMs = result.ms;
    state.lastValidCreatedMs = Date.parse(state.draft.config.createdAtUtc);
    syncDraftTimeFields(result.ms, source);
    scheduleHashUpdate(state.draft.config, 'edit');
    render(false);
  }

  function getMetaValidation() {
    if (!state.isEditing || !state.draft) return null;
    const duration = Number(el.durationInput.value);
    if (!Number.isFinite(duration) || duration < 5) {
      return { source: 'duration', message: 'Duration must be at least 5 minutes.' };
    }
    const aZone = el.aTzInput.value.trim();
    if (!isValidTimeZone(aZone)) {
      return { source: 'participantAZone', message: 'Participant A needs a valid IANA time zone, for example America/Los_Angeles.' };
    }
    const bZone = el.bTzInput.value.trim();
    if (!isValidTimeZone(bZone)) {
      return { source: 'participantBZone', message: 'Participant B needs a valid IANA time zone, for example Europe/Berlin.' };
    }
    return null;
  }

  function isMetaValidationSource(source) {
    return ['duration', 'participantAZone', 'participantBZone'].includes(source);
  }

  function captureTimeFieldValues() {
    const draft = state.draft;
    draft.utcDate = el.utcDateInput.value;
    draft.utcTime = el.utcTimeInput.value;
    draft.aDate = el.aDateInput.value;
    draft.aTime = el.aTimeInput.value;
    draft.bDate = el.bDateInput.value;
    draft.bTime = el.bTimeInput.value;
  }

  function parseSourceTime(source) {
    const config = state.draft.config;
    if (source === 'UTC') {
      const parsed = parseDateTimeInputs(state.draft.utcDate, state.draft.utcTime);
      if (!parsed.valid) return parsed;
      return { valid: true, ms: Date.UTC(parsed.parts.year, parsed.parts.month - 1, parsed.parts.day, parsed.parts.hour, parsed.parts.minute) };
    }
    if (source === 'participantA') {
      return parseLocalTimeSource(state.draft.aDate, state.draft.aTime, config.participantA.timeZone, config.participantA.name);
    }
    return parseLocalTimeSource(state.draft.bDate, state.draft.bTime, config.participantB.timeZone, config.participantB.name);
  }

  function parseDateTimeInputs(dateValue, timeValue) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || '') || !/^\d{2}:\d{2}$/.test(timeValue || '')) {
      return { valid: false, message: 'Enter a complete date and time.' };
    }
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hour, minute] = timeValue.split(':').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour > 23 || minute > 59) {
      return { valid: false, message: 'Enter a valid calendar date and time.' };
    }
    return { valid: true, parts: { year, month, day, hour, minute } };
  }

  function parseLocalTimeSource(dateValue, timeValue, timeZone, label) {
    const parsed = parseDateTimeInputs(dateValue, timeValue);
    if (!parsed.valid) return parsed;
    if (!isValidTimeZone(timeZone)) {
      return { valid: false, message: `${label || 'Participant'} has an invalid IANA time zone.` };
    }
    const resolved = localTimeToUtc(parsed.parts, timeZone);
    if (!Number.isFinite(resolved)) {
      return { valid: false, message: `That local time does not exist in ${timeZone}. Try the nearest valid time.` };
    }
    return { valid: true, ms: resolved };
  }

  function syncDraftTimeFields(ms, preserveSource) {
    if (!state.draft) return;
    const config = state.draft.config;
    const utc = getUtcInputParts(ms);
    const a = getZonedParts(ms, config.participantA.timeZone);
    const b = getZonedParts(ms, config.participantB.timeZone);

    if (preserveSource !== 'UTC') {
      state.draft.utcDate = formatDateValue(utc);
      state.draft.utcTime = formatTimeValue(utc);
    }
    if (preserveSource !== 'participantA') {
      state.draft.aDate = formatDateValue(a);
      state.draft.aTime = formatTimeValue(a);
    }
    if (preserveSource !== 'participantB') {
      state.draft.bDate = formatDateValue(b);
      state.draft.bTime = formatTimeValue(b);
    }
  }

  function localTimeToUtc(parts, timeZone) {
    if (timeZone === 'UTC') {
      return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    }
    const targetWallMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    const probes = [-36, -24, -12, 0, 12, 24, 36].map(hours => targetWallMs + hours * MS.hour);
    const offsets = [...new Set(probes.map(ms => getTimeZoneOffsetMs(ms, timeZone)).filter(Number.isFinite))];
    const matches = offsets
      .map(offset => targetWallMs - offset)
      .filter(ms => zonedPartsMatch(getZonedParts(ms, timeZone), parts))
      .sort((a, b) => a - b);
    return matches.length ? matches[0] : NaN;
  }

  function getTimeZoneOffsetMs(ms, timeZone) {
    const parts = getZonedParts(ms, timeZone);
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0) - ms;
  }

  function zonedPartsMatch(actual, expected) {
    return actual.year === expected.year && actual.month === expected.month && actual.day === expected.day && actual.hour === expected.hour && actual.minute === expected.minute;
  }

  function getUtcInputParts(ms) {
    const date = new Date(ms);
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds()
    };
  }

  function getZonedParts(ms, timeZone) {
    if (!isValidTimeZone(timeZone)) return getUtcInputParts(ms);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    });
    const values = {};
    for (const part of formatter.formatToParts(new Date(ms))) {
      if (part.type !== 'literal') values[part.type] = part.value;
    }
    return {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      hour: Number(values.hour),
      minute: Number(values.minute),
      second: Number(values.second)
    };
  }

  function isValidTimeZone(timeZone) {
    if (!timeZone) return false;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
      return true;
    } catch {
      return false;
    }
  }

  function formatDateValue(parts) {
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  }

  function formatTimeValue(parts) {
    return `${pad(parts.hour)}:${pad(parts.minute)}`;
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function render(syncInputs = true) {
    const config = getActiveConfig();
    ensureCreatedAt(config);
    const ms = Number.isFinite(Date.parse(config.startsAtUtc)) ? Date.parse(config.startsAtUtc) : state.lastValidMeetingMs;
    const createdMs = Number.isFinite(Date.parse(config.createdAtUtc)) ? Date.parse(config.createdAtUtc) : state.lastValidCreatedMs;
    const now = Date.now();
    const remainingMs = ms - now;
    const scale = chooseScale(remainingMs);
    const journey = getJourneyProgress(now, createdMs, ms);
    const positions = getParticipantPositions(journey.progressRatio);
    const effectiveTheme = config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : config.theme;

    const resolvedTheme = effectiveTheme === 'auto' ? 'light' : effectiveTheme;
    el.appShell.dataset.theme = resolvedTheme;
    document.body.dataset.theme = resolvedTheme;
    applyParticipantPaletteVars(config, resolvedTheme);
    el.timelineStage.style.setProperty('--participant-a-x', `${positions.aX}%`);
    el.timelineStage.style.setProperty('--participant-b-x', `${positions.bX}%`);
    el.timelineStage.style.setProperty('--hand-extension', positions.handExtension.toFixed(3));
    el.timelineStage.style.setProperty('--hand-extension-px', `${Math.round(positions.handExtension * 64)}px`);
    el.timelineStage.style.setProperty('--progress', journey.progressRatio.toFixed(3));
    el.timelineStage.style.setProperty('--remaining', journey.remainingRatio.toFixed(3));

    document.body.classList.toggle('animation-paused', !config.animationEnabled);
    el.themeControl.value = config.theme;
    el.renderControl.value = config.renderMode;
    el.aSpriteControl.value = config.participantA.spriteKey || DEFAULT_CONFIG.participantA.spriteKey;
    el.bSpriteControl.value = config.participantB.spriteKey || DEFAULT_CONFIG.participantB.spriteKey;
    el.aPaletteControl.value = config.participantA.paletteKey || DEFAULT_CONFIG.participantA.paletteKey;
    el.bPaletteControl.value = config.participantB.paletteKey || DEFAULT_CONFIG.participantB.paletteKey;
    el.animationToggle.setAttribute('aria-pressed', String(config.animationEnabled));
    el.animationStatus.textContent = config.animationEnabled ? 'Running' : 'Paused';
    el.scaleText.textContent = `Journey ${formatDurationToken(journey.journeyMs)}`;

    renderText(config, ms, now, scale);
    renderTicks(createdMs, ms);
    renderCharacters(config, journey.progressRatio);
    positionCountdown();
    renderEditPanel(config, ms, syncInputs);
    updateAccessibility(config, ms, remainingMs);
  }

  function applyParticipantPaletteVars(config, theme) {
    const a = getPaletteTone(config.participantA.paletteKey, theme);
    const b = getPaletteTone(config.participantB.paletteKey, theme);
    setParticipantVars('a', a);
    setParticipantVars('b', b);
  }

  function setParticipantVars(slot, tone) {
    el.timelineStage.style.setProperty(`--participant-${slot}-bg`, tone.bg);
    el.timelineStage.style.setProperty(`--participant-${slot}-border`, tone.border);
    el.timelineStage.style.setProperty(`--participant-${slot}-text`, tone.text);
  }

  function getPaletteTone(key, theme) {
    const palette = PARTICIPANT_PALETTES[key] || PARTICIPANT_PALETTES[DEFAULT_CONFIG.participantA.paletteKey];
    return palette[theme === 'dark' ? 'dark' : 'light'];
  }

  function positionCountdown() {
    const baseMinHeight = window.matchMedia('(max-width: 760px)').matches ? 540 : 590;
    el.timelineStage.style.minHeight = `${baseMinHeight}px`;
    el.timelineSection.style.minHeight = `${baseMinHeight}px`;

    const cardRect = el.meetingCard.getBoundingClientRect();
    const stageRect = el.timelineStage.getBoundingClientRect();
    const fallbackTop = window.matchMedia('(max-width: 760px)').matches ? 300 : 330;
    const top = Math.max(fallbackTop, Math.ceil(cardRect.bottom - stageRect.top + 14));
    el.countdownText.style.top = `${top}px`;

    const requiredMinHeight = Math.max(baseMinHeight, top + 190);
    el.timelineStage.style.minHeight = `${requiredMinHeight}px`;
    el.timelineSection.style.minHeight = `${requiredMinHeight}px`;
  }

  function renderText(config, ms, now, scale) {
    const utc = getUtcInputParts(ms);
    const aParts = getZonedParts(ms, config.participantA.timeZone);
    const bParts = getZonedParts(ms, config.participantB.timeZone);
    const aDisplay = formatDisplayTime(ms, config.participantA.timeZone);
    const bDisplay = formatDisplayTime(ms, config.participantB.timeZone);
    const utcDisplay = formatUtcDisplay(ms);
    const countdown = getCountdownText(ms - now);

    el.pageTitle.textContent = config.title || 'Meeting Timeline';
    el.meetingTitle.textContent = config.title;
    el.participantAName.textContent = config.participantA.name;
    el.participantBName.textContent = config.participantB.name;
    el.participantAZone.textContent = config.participantA.timeZone;
    el.participantBZone.textContent = config.participantB.timeZone;
    el.aTimeLabel.textContent = config.participantA.name;
    el.bTimeLabel.textContent = config.participantB.name;
    el.characterALabel.textContent = config.participantA.name;
    el.characterBLabel.textContent = config.participantB.name;
    el.participantATime.textContent = aDisplay.time;
    el.participantBTime.textContent = bDisplay.time;
    el.participantADate.textContent = aDisplay.date;
    el.participantBDate.textContent = bDisplay.date;
    el.utcTime.textContent = `${pad(utc.hour)}:${pad(utc.minute)}`;
    el.utcDate.textContent = utcDisplay.date;
    el.aTimeCompact.textContent = `${pad(aParts.hour)}:${pad(aParts.minute)}`;
    el.bTimeCompact.textContent = `${pad(bParts.hour)}:${pad(bParts.minute)}`;
    el.aDateCompact.textContent = aDisplay.date;
    el.bDateCompact.textContent = bDisplay.date;
    el.countdownText.textContent = countdown.full;
    el.summaryUntil.textContent = countdown.short;
    el.summaryAsOf.textContent = `As of ${formatUtcClock(now)} UTC`;
    el.summaryDuration.textContent = `${config.durationMinutes}m`;
    el.summaryDurationText.textContent = durationText(config.durationMinutes);
    el.summaryParticipants.textContent = `${config.participantA.name}, ${config.participantB.name}`;
    el.summaryUpdated.textContent = 'Just now';
    el.scaleText.textContent = el.scaleText.textContent || scale.label;
  }

  function formatDisplayTime(ms, timeZone) {
    if (!isValidTimeZone(timeZone)) return { time: '--:--', date: 'Invalid zone' };
    const date = new Date(ms);
    return {
      time: new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' }).format(date),
      date: new Intl.DateTimeFormat('en-US', { timeZone, month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    };
  }

  function formatUtcDisplay(ms) {
    const date = new Date(ms);
    return {
      time: `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`,
      date: new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    };
  }

  function formatUtcClock(ms) {
    const date = new Date(ms);
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }

  function chooseScale(remainingMs) {
    if (remainingMs > 7 * MS.day) return { windowMs: 30 * MS.day, label: '30 days' };
    if (remainingMs > 2 * MS.day) return { windowMs: 7 * MS.day, label: '7 days' };
    if (remainingMs > 12 * MS.hour) return { windowMs: 48 * MS.hour, label: '48 hours' };
    if (remainingMs > MS.hour) return { windowMs: 12 * MS.hour, label: '12 hours' };
    if (remainingMs > 10 * MS.minute) return { windowMs: MS.hour, label: '1 hour' };
    if (remainingMs > MS.minute) return { windowMs: 10 * MS.minute, label: '10 minutes' };
    return { windowMs: MS.minute, label: '60 seconds' };
  }

  function getJourneyProgress(nowMs, createdAtMs, meetingAtMs) {
    const journeyMs = Math.max(meetingAtMs - createdAtMs, MS.minute);
    const elapsedMs = nowMs - createdAtMs;
    const progressRatio = clamp(elapsedMs / journeyMs, 0, 1);
    const remainingRatio = 1 - progressRatio;
    return { journeyMs, elapsedMs, progressRatio, remainingRatio };
  }

  function getParticipantPositions(progressRatio) {
    const remainingRatio = 1 - clamp(progressRatio, 0, 1);
    const eased = easeOutCubic(progressRatio);
    const maxOffsetPercent = window.matchMedia('(max-width: 760px)').matches ? 18 : 36;
    return {
      remainingRatio,
      progressRatio,
      handExtension: eased,
      aX: 50 - remainingRatio * maxOffsetPercent,
      bX: 50 + remainingRatio * maxOffsetPercent
    };
  }

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function renderTicks(createdMs, meetingMs) {
    const labels = getTickLabels(createdMs, meetingMs);
    const positions = [0, 25, 50, 75, 100];
    el.timelineTicks.innerHTML = labels.map((label, index) => {
      const center = index === 2 ? ' center' : '';
      const small = index === 2 ? '<small>UTC</small>' : '';
      return `<div class="tick${center}" style="left:${positions[index]}%"><span>${label}</span>${small}</div>`;
    }).join('');
  }

  function renderCharacters(config, progressRatio) {
    const spriteMode = config.renderMode === 'sprite';
    el.characterA.classList.toggle('sprite-active', spriteMode);
    el.characterB.classList.toggle('sprite-active', spriteMode);
    if (!spriteMode) return;

    renderSpriteFrame(el.spriteFrameA, config.participantA.spriteKey, progressRatio, 'right');
    renderSpriteFrame(el.spriteFrameB, config.participantB.spriteKey, progressRatio, 'left');
  }

  function renderSpriteFrame(frameEl, spriteKey, progressRatio, desiredFacing) {
    const sprite = SPRITES[spriteKey] || SPRITES[DEFAULT_CONFIG.participantA.spriteKey];
    const frameIndex = clamp(Math.round(progressRatio * 31), 0, 31);
    const col = frameIndex % 8;
    const row = Math.floor(frameIndex / 8);
    frameEl.style.backgroundImage = `url("${sprite.atlas}")`;
    frameEl.style.backgroundPosition = `${-col * 256}px ${-row * 256}px`;
    frameEl.classList.toggle('flipped', sprite.facing !== desiredFacing);
  }

  function getTickLabels(createdMs, meetingMs) {
    const journeyMs = Math.max(meetingMs - createdMs, MS.minute);
    const half = journeyMs / 2;
    const full = journeyMs;
    const center = formatMeetingTick(meetingMs);
    return [`-${formatDurationToken(full)}`, `-${formatDurationToken(half)}`, center, `+${formatDurationToken(half)}`, `+${formatDurationToken(full)}`];
  }

  function formatMeetingTick(ms) {
    const date = new Date(ms);
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }

  function formatDurationToken(ms) {
    if (ms >= MS.day) return `${Math.round(ms / MS.day)}d`;
    if (ms >= MS.hour) return `${Math.round(ms / MS.hour)}h`;
    if (ms >= MS.minute) return `${Math.round(ms / MS.minute)}m`;
    return `${Math.round(ms / MS.second)}s`;
  }

  function getCountdownText(remainingMs) {
    const abs = Math.abs(remainingMs);
    if (remainingMs <= 0 && remainingMs > -5 * MS.minute) return { full: 'Meeting starts now', short: 'Starting now' };
    if (remainingMs < 0) return { full: `Meeting started ${humanDuration(abs) } ago`, short: `${humanDuration(abs)} ago` };
    const text = humanDuration(remainingMs);
    return { full: `Meeting in ${text}`, short: text };
  }

  function humanDuration(ms) {
    const secondsTotal = Math.max(0, Math.floor(ms / MS.second));
    const days = Math.floor(secondsTotal / 86400);
    const hours = Math.floor((secondsTotal % 86400) / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = secondsTotal % 60;
    const parts = [];
    if (days) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours && parts.length < 2) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes && parts.length < 2) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    if (secondsTotal < 10 * 60 && parts.length < 2) parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    return parts.length ? parts.join(', ') : 'less than 1 second';
  }

  function durationText(minutes) {
    if (minutes === 60) return '1 hour';
    if (minutes % 60 === 0) return `${minutes / 60} hours`;
    return `${minutes} minutes`;
  }

  function renderEditPanel(config, ms, syncInputs) {
    el.editPanel.hidden = !state.isEditing;
    el.editButton.hidden = state.isEditing;
    if (!state.isEditing || !state.draft) return;

    if (syncInputs) syncDraftTimeFields(ms, state.draft.activeTimeSource);
    setInputValueIfNotFocused(el.titleInput, config.title);
    if (state.draft.validation.source !== 'duration') setInputValueIfNotFocused(el.durationInput, config.durationMinutes);
    setInputValueIfNotFocused(el.aNameInput, config.participantA.name);
    setInputValueIfNotFocused(el.bNameInput, config.participantB.name);
    if (state.draft.validation.source !== 'participantAZone') setInputValueIfNotFocused(el.aTzInput, config.participantA.timeZone);
    if (state.draft.validation.source !== 'participantBZone') setInputValueIfNotFocused(el.bTzInput, config.participantB.timeZone);
    el.editThemeInput.value = config.theme;
    el.editRenderInput.value = config.renderMode;
    el.editASpriteInput.value = config.participantA.spriteKey || DEFAULT_CONFIG.participantA.spriteKey;
    el.editBSpriteInput.value = config.participantB.spriteKey || DEFAULT_CONFIG.participantB.spriteKey;
    el.editAPaletteInput.value = config.participantA.paletteKey || DEFAULT_CONFIG.participantA.paletteKey;
    el.editBPaletteInput.value = config.participantB.paletteKey || DEFAULT_CONFIG.participantB.paletteKey;
    el.aEditLegend.textContent = config.participantA.name;
    el.bEditLegend.textContent = config.participantB.name;

    setInputValueIfNotFocused(el.utcDateInput, state.draft.utcDate);
    setInputValueIfNotFocused(el.utcTimeInput, state.draft.utcTime);
    setInputValueIfNotFocused(el.aDateInput, state.draft.aDate);
    setInputValueIfNotFocused(el.aTimeInput, state.draft.aTime);
    setInputValueIfNotFocused(el.bDateInput, state.draft.bDate);
    setInputValueIfNotFocused(el.bTimeInput, state.draft.bTime);

    document.querySelectorAll('.time-row').forEach(row => {
      const isActive = row.dataset.source === state.draft.activeTimeSource;
      const isInvalid = !state.draft.validation.isValid && row.dataset.source === state.draft.validation.source;
      row.classList.toggle('active', isActive);
      row.classList.toggle('invalid', isInvalid);
    });
    setFieldInvalid(el.durationInput, state.draft.validation.source === 'duration');
    setFieldInvalid(el.aTzInput, state.draft.validation.source === 'participantAZone');
    setFieldInvalid(el.bTzInput, state.draft.validation.source === 'participantBZone');
    showValidation(state.draft.validation.message, !state.draft.validation.isValid);
  }

  function setInputValueIfNotFocused(input, value) {
    if (document.activeElement !== input) input.value = value;
  }

  function setFieldInvalid(input, isInvalid) {
    input.setAttribute('aria-invalid', String(Boolean(isInvalid)));
  }

  function showValidation(message, isError) {
    el.validationMessage.textContent = message || '';
    el.validationMessage.classList.toggle('error', Boolean(isError));
  }

  function updateAccessibility(config, ms, remainingMs) {
    const aDisplay = formatDisplayTime(ms, config.participantA.timeZone);
    const bDisplay = formatDisplayTime(ms, config.participantB.timeZone);
    const countdown = getCountdownText(remainingMs).full;
    el.timelineSection.setAttribute(
      'aria-label',
      `Meeting ${config.title} between ${config.participantA.name} and ${config.participantB.name}. ${countdown}. ${config.participantA.name} local time is ${aDisplay.time}. ${config.participantB.name} local time is ${bDisplay.time}. UTC time is ${formatMeetingTick(ms)}.`
    );
  }

  function copyLink(sourceButton) {
    const active = getActiveConfig();
    replaceHash(active, state.isEditing ? 'edit' : 'view');
    const url = window.location.href;
    state.lastCopyText = url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
    document.body.classList.add('copied');
    showCopiedFeedback(sourceButton);
    window.setTimeout(() => document.body.classList.remove('copied'), 900);
  }

  function showCopiedFeedback(button) {
    if (!button) return;
    window.clearTimeout(state.copyResetTimer);
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
    button.textContent = 'Copied';
    button.setAttribute('aria-label', 'Link copied');
    state.copyResetTimer = window.setTimeout(() => {
      button.textContent = button.dataset.defaultText || 'Copy Link';
      button.removeAttribute('aria-label');
    }, 1200);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch { /* noop */ }
    textarea.remove();
  }

  function startRenderLoop() {
    window.setInterval(() => {
      const config = getActiveConfig();
      if (config.animationEnabled || state.isEditing) render(false);
    }, 1000);
  }
})();
