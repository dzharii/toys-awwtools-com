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

  const DEFAULT_CONFIG = {
    title: 'Design Sync',
    startsAtUtc: makeDefaultFutureIso(),
    durationMinutes: 60,
    participantA: { name: 'Alice', timeZone: 'America/Los_Angeles', spriteKey: 'female-minimal-soft' },
    participantB: { name: 'Bruno', timeZone: 'Europe/Berlin', spriteKey: 'male-dark-precision' },
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
    lastRenderedScale: null,
    hashTimer: 0,
    lastCopyText: '',
    suppressHashChange: false
  };

  const el = {
    appShell: document.querySelector('.app-shell'),
    pageTitle: document.getElementById('pageTitle'),
    timelineSection: document.getElementById('timelineSection'),
    timelineStage: document.getElementById('timelineStage'),
    themeControl: document.getElementById('themeControl'),
    renderControl: document.getElementById('renderControl'),
    aSpriteControl: document.getElementById('aSpriteControl'),
    bSpriteControl: document.getElementById('bSpriteControl'),
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
    const parsed = parseHash(window.location.hash);
    if (parsed.config) {
      state.config = mergeConfig(DEFAULT_CONFIG, parsed.config);
      state.lastValidMeetingMs = Date.parse(state.config.startsAtUtc);
      if (parsed.mode === 'edit') {
        enterEditMode(false);
      }
    } else {
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
    el.shareButton.addEventListener('click', () => copyLink());
    el.copyEditLinkButton.addEventListener('click', () => copyLink());

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

    el.animationToggle.addEventListener('click', () => {
      const active = getActiveConfig();
      active.animationEnabled = !active.animationEnabled;
      scheduleHashUpdate(active, state.isEditing ? 'edit' : 'view');
      render();
    });

    [el.titleInput, el.durationInput, el.aNameInput, el.bNameInput, el.aTzInput, el.bTzInput, el.editThemeInput, el.editRenderInput, el.editASpriteInput, el.editBSpriteInput]
      .forEach(input => input.addEventListener('input', handleMetaInput));
    [el.editThemeInput, el.editRenderInput, el.editASpriteInput, el.editBSpriteInput, el.aTzInput, el.bTzInput]
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

  function makeDefaultFutureIso() {
    const now = Date.now();
    const rounded = Math.ceil((now + 2 * MS.hour) / (15 * MS.minute)) * 15 * MS.minute;
    return new Date(rounded).toISOString();
  }

  function cloneConfig(config) {
    return {
      title: config.title,
      startsAtUtc: config.startsAtUtc,
      durationMinutes: Number(config.durationMinutes) || 60,
      participantA: { ...config.participantA },
      participantB: { ...config.participantB },
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
    if (incoming.participantA) merged.participantA = { ...merged.participantA, ...incoming.participantA };
    if (incoming.participantB) merged.participantB = { ...merged.participantB, ...incoming.participantB };
    if (!SPRITES[merged.participantA.spriteKey]) merged.participantA.spriteKey = DEFAULT_CONFIG.participantA.spriteKey;
    if (!SPRITES[merged.participantB.spriteKey]) merged.participantB.spriteKey = DEFAULT_CONFIG.participantB.spriteKey;
    if (['light', 'dark', 'neutral', 'auto'].includes(incoming.theme)) merged.theme = incoming.theme;
    if (typeof incoming.animationEnabled === 'boolean') merged.animationEnabled = incoming.animationEnabled;
    if (['svg', 'sprite'].includes(incoming.renderMode)) merged.renderMode = incoming.renderMode;
    return merged;
  }

  function parseHash(hash) {
    if (!hash || hash.length < 2) return { config: null, mode: 'view' };
    const raw = hash.replace(/^#/, '');
    const pairs = raw.split('&').filter(Boolean).map(part => {
      const at = part.indexOf('=');
      if (at === -1) return [decode(part), ''];
      return [decode(part.slice(0, at)), part.slice(at + 1)];
    });
    const map = Object.fromEntries(pairs);
    const startsAtRaw = map.at ? decode(map.at) : '';
    const startsAtMs = Date.parse(startsAtRaw);
    const config = {};
    if (map.t) config.title = decode(map.t);
    if (Number.isFinite(startsAtMs)) config.startsAtUtc = new Date(startsAtMs).toISOString();
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
    const mode = map.mode && decode(map.mode) === 'edit' ? 'edit' : 'view';
    return { config, mode };
  }

  function parseParticipant(rawValue, fallback) {
    const at = rawValue.indexOf('@');
    if (at === -1) return { ...fallback };
    const name = decode(rawValue.slice(0, at)) || fallback.name;
    const timeZone = decode(rawValue.slice(at + 1)).replace(/~/g, '/') || fallback.timeZone;
    return { name, timeZone };
  }

  function serializeHash(config, mode) {
    const at = new Date(Date.parse(config.startsAtUtc)).toISOString().replace(/:00\.000Z$/, 'Z');
    const parts = [
      ['v', '1'],
      ['t', config.title || DEFAULT_CONFIG.title],
      ['at', at],
      ['dur', String(config.durationMinutes || DEFAULT_CONFIG.durationMinutes)],
      ['a', encodeParticipant(config.participantA)],
      ['b', encodeParticipant(config.participantB)],
      ['theme', config.theme || 'light'],
      ['anim', config.animationEnabled === false ? '0' : '1'],
      ['mode', mode || 'view'],
      ['render', config.renderMode || 'sprite'],
      ['spriteA', config.participantA.spriteKey || DEFAULT_CONFIG.participantA.spriteKey],
      ['spriteB', config.participantB.spriteKey || DEFAULT_CONFIG.participantB.spriteKey]
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
    if (!state.draft.validation.isValid) {
      showValidation(state.draft.validation.message || 'Fix the invalid time before saving.', true);
      return;
    }
    state.config = cloneConfig(state.draft.config);
    state.isEditing = false;
    state.draft = null;
    state.baselineConfig = null;
    pushHash(state.config, 'view');
    render();
  }

  function cancelEditMode() {
    if (!state.isEditing) return;
    state.config = cloneConfig(state.baselineConfig || DEFAULT_CONFIG);
    state.lastValidMeetingMs = Date.parse(state.config.startsAtUtc);
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

    const oldATz = config.participantA.timeZone;
    const oldBTz = config.participantB.timeZone;
    if (isValidTimeZone(el.aTzInput.value.trim())) config.participantA.timeZone = el.aTzInput.value.trim();
    if (isValidTimeZone(el.bTzInput.value.trim())) config.participantB.timeZone = el.bTzInput.value.trim();

    if (oldATz !== config.participantA.timeZone || oldBTz !== config.participantB.timeZone) {
      syncDraftTimeFields(Date.parse(config.startsAtUtc), null);
    }
    scheduleHashUpdate(config, 'edit');
    render();
  }

  function handleTimeInput(source) {
    if (!state.isEditing || !state.draft) return;
    state.draft.activeTimeSource = source;
    captureTimeFieldValues();
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
    state.lastValidMeetingMs = result.ms;
    syncDraftTimeFields(result.ms, source);
    scheduleHashUpdate(state.draft.config, 'edit');
    render(false);
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
    const ms = Number.isFinite(Date.parse(config.startsAtUtc)) ? Date.parse(config.startsAtUtc) : state.lastValidMeetingMs;
    const now = Date.now();
    const remainingMs = ms - now;
    const scale = chooseScale(remainingMs);
    const timeline = getTimelineProgress(remainingMs, scale.windowMs);
    const effectiveTheme = config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : config.theme;

    el.appShell.dataset.theme = effectiveTheme === 'auto' ? 'light' : effectiveTheme;
    el.timelineStage.style.setProperty('--participant-a-x', `${timeline.aX}%`);
    el.timelineStage.style.setProperty('--participant-b-x', `${timeline.bX}%`);
    el.timelineStage.style.setProperty('--hand-extension', timeline.handExtension.toFixed(3));
    el.timelineStage.style.setProperty('--hand-extension-px', `${Math.round(timeline.handExtension * 64)}px`);
    el.timelineStage.style.setProperty('--progress', timeline.progressRatio.toFixed(3));

    document.body.classList.toggle('animation-paused', !config.animationEnabled);
    el.themeControl.value = config.theme;
    el.renderControl.value = config.renderMode;
    el.aSpriteControl.value = config.participantA.spriteKey || DEFAULT_CONFIG.participantA.spriteKey;
    el.bSpriteControl.value = config.participantB.spriteKey || DEFAULT_CONFIG.participantB.spriteKey;
    el.animationToggle.setAttribute('aria-pressed', String(config.animationEnabled));
    el.animationStatus.textContent = config.animationEnabled ? 'Running' : 'Paused';
    el.scaleText.textContent = scale.label;

    renderText(config, ms, now, scale);
    renderTicks(scale.windowMs, ms, config);
    renderCharacters(config, timeline.progressRatio);
    renderEditPanel(config, ms, syncInputs);
    updateAccessibility(config, ms, remainingMs);
  }

  function renderText(config, ms, now, scale) {
    const utc = getUtcInputParts(ms);
    const aParts = getZonedParts(ms, config.participantA.timeZone);
    const bParts = getZonedParts(ms, config.participantB.timeZone);
    const aDisplay = formatDisplayTime(ms, config.participantA.timeZone);
    const bDisplay = formatDisplayTime(ms, config.participantB.timeZone);
    const utcDisplay = formatUtcDisplay(ms);
    const countdown = getCountdownText(ms - now);

    el.pageTitle.textContent = 'Proposal 01 - Minimal Balance';
    el.meetingTitle.textContent = config.title;
    el.participantAName.textContent = config.participantA.name;
    el.participantBName.textContent = config.participantB.name;
    el.participantAZone.textContent = config.participantA.timeZone;
    el.participantBZone.textContent = config.participantB.timeZone;
    el.aTimeLabel.textContent = config.participantA.name;
    el.bTimeLabel.textContent = config.participantB.name;
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
    el.scaleText.textContent = scale.label;
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

  function getTimelineProgress(remainingMs, displayWindowMs) {
    const remainingRatio = clamp(remainingMs / displayWindowMs, 0, 1);
    const progressRatio = 1 - remainingRatio;
    const eased = easeOutCubic(progressRatio);
    return {
      remainingRatio,
      progressRatio,
      handExtension: eased,
      aX: 23 + eased * 11,
      bX: 77 - eased * 11
    };
  }

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function renderTicks(windowMs, meetingMs, config) {
    const labels = getTickLabels(windowMs, meetingMs, config);
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

  function getTickLabels(windowMs, meetingMs) {
    const half = windowMs / 2;
    const full = windowMs;
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
    el.titleInput.value = config.title;
    el.durationInput.value = config.durationMinutes;
    el.aNameInput.value = config.participantA.name;
    el.bNameInput.value = config.participantB.name;
    el.aTzInput.value = config.participantA.timeZone;
    el.bTzInput.value = config.participantB.timeZone;
    el.editThemeInput.value = config.theme;
    el.editRenderInput.value = config.renderMode;
    el.editASpriteInput.value = config.participantA.spriteKey || DEFAULT_CONFIG.participantA.spriteKey;
    el.editBSpriteInput.value = config.participantB.spriteKey || DEFAULT_CONFIG.participantB.spriteKey;
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
    showValidation(state.draft.validation.message, !state.draft.validation.isValid);
  }

  function setInputValueIfNotFocused(input, value) {
    if (document.activeElement !== input) input.value = value;
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

  function copyLink() {
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
    window.setTimeout(() => document.body.classList.remove('copied'), 900);
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
      const remainingMs = Date.parse(config.startsAtUtc) - Date.now();
      if (!config.animationEnabled && !state.isEditing) {
        render(false);
        return;
      }
      if (remainingMs <= MS.minute || state.isEditing) render(false);
      else if (remainingMs <= 10 * MS.minute) render(false);
      else if (remainingMs <= MS.hour) render(false);
    }, 1000);
  }
})();
