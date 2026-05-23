"use strict";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const DEFAULT_CONFIG = {
  meeting: {
    title: "Meeting",
    startsAt: "",
    durationMinutes: 30,
    primaryTimeZone: "participantA",
  },
  participantA: {
    name: "Alice",
    timeZone: "America/Los_Angeles",
  },
  participantB: {
    name: "Bruno",
    timeZone: "Europe/Berlin",
  },
  display: {
    theme: "auto",
    renderMode: "svg",
  },
  animation: {
    enabled: true,
    reducedMotion: "respect-system",
    postMeetingHoldMinutes: 5,
  },
};

const FALLBACK_TIME_ZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

const state = {
  config: clone(DEFAULT_CONFIG),
  meetingMs: 0,
  isEditing: false,
  draft: null,
  baselineConfig: null,
  baselineHash: "",
  urlTimer: 0,
  visualTimer: 0,
  renderTimer: 0,
  extraHashPairs: [],
  ignoreHash: false,
  formatters: new Map(),
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
};

const dom = {};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(base, patch) {
  const out = clone(base);
  mergeInto(out, patch || {});
  return out;
}

function mergeInto(target, patch) {
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      mergeInto(target[key], value);
    } else {
      target[key] = value;
    }
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function getFormatter(locale, options) {
  const key = `${locale}|${JSON.stringify(options)}`;
  if (!state.formatters.has(key)) {
    state.formatters.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return state.formatters.get(key);
}

function isValidIanaTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return false;
  if (timeZone === "UTC") return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function parseTimeInput(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function localToDateTime(local) {
  return {
    date: `${local.year}-${pad2(local.month)}-${pad2(local.day)}`,
    time: `${pad2(local.hour)}:${pad2(local.minute)}`,
  };
}

function parseLocalInputs(dateValue, timeValue) {
  const date = parseDateInput(dateValue);
  if (!date) return { valid: false, reason: "invalid-date" };
  const time = parseTimeInput(timeValue);
  if (!time) return { valid: false, reason: "invalid-time" };
  return { valid: true, ...date, ...time };
}

function parseUtcInputs(dateValue, timeValue) {
  const local = parseLocalInputs(dateValue, timeValue);
  if (!local.valid) return local;
  return {
    valid: true,
    instantMs: Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute),
  };
}

function parseShortOffsetToMinutes(text) {
  const match = /(GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/.exec(text || "");
  if (!match) return null;
  const sign = match[2] === "-" ? -1 : 1;
  return sign * (Number(match[3]) * 60 + Number(match[4] || 0));
}

function getOffsetMinutes(instantMs, timeZone) {
  if (timeZone === "UTC") return 0;
  const formatter = getFormatter("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const zonePart = formatter
    .formatToParts(new Date(instantMs))
    .find((part) => part.type === "timeZoneName");
  return parseShortOffsetToMinutes(zonePart ? zonePart.value : "") ?? 0;
}

function formatOffsetLabel(instantMs, timeZone) {
  if (!isValidIanaTimeZone(timeZone)) return "Invalid time zone";
  const minutes = getOffsetMinutes(instantMs, timeZone);
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `UTC${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

function getZonedParts(instantMs, timeZone) {
  const formatter = getFormatter("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = {};
  formatter.formatToParts(new Date(instantMs)).forEach((part) => {
    if (part.type !== "literal") parts[part.type] = part.value;
  });
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function sameLocal(local, zoned) {
  return (
    local.year === zoned.year &&
    local.month === zoned.month &&
    local.day === zoned.day &&
    local.hour === zoned.hour &&
    local.minute === zoned.minute
  );
}

function addMinutesToLocal(local, minutes) {
  const shifted = new Date(
    Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute) +
      minutes * MINUTE_MS
  );
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function localToUtcCandidates(local, timeZone, withSuggestion = true) {
  if (!isValidIanaTimeZone(timeZone)) {
    return { valid: false, reason: "invalid-timezone", candidates: [] };
  }

  const naiveUtcMs = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
  const offsets = new Set(
    [-24, -6, 0, 6, 24]
      .map((hours) => getOffsetMinutes(naiveUtcMs + hours * HOUR_MS, timeZone))
      .filter(Number.isFinite)
  );

  const candidates = [];
  offsets.forEach((offsetMinutes) => {
    const candidateMs = naiveUtcMs - offsetMinutes * MINUTE_MS;
    if (sameLocal(local, getZonedParts(candidateMs, timeZone))) {
      candidates.push({ instantMs: candidateMs, offsetMinutes });
    }
  });

  const unique = [];
  const seen = new Set();
  candidates
    .sort((a, b) => a.instantMs - b.instantMs)
    .forEach((candidate) => {
      if (!seen.has(candidate.instantMs)) {
        unique.push(candidate);
        seen.add(candidate.instantMs);
      }
    });

  if (unique.length > 0) {
    return { valid: true, candidates: unique, ambiguous: unique.length > 1 };
  }

  return {
    valid: false,
    reason: "nonexistent-time",
    candidates: [],
    suggestion: withSuggestion ? nearestValidLocal(local, timeZone) : null,
  };
}

function nearestValidLocal(local, timeZone) {
  for (let delta = 1; delta <= 180; delta += 1) {
    const later = addMinutesToLocal(local, delta);
    if (localToUtcCandidates(later, timeZone, false).valid) return { direction: "later", local: later };
    const earlier = addMinutesToLocal(local, -delta);
    if (localToUtcCandidates(earlier, timeZone, false).valid) return { direction: "earlier", local: earlier };
  }
  return null;
}

function inputFromInstantUtc(instantMs) {
  const date = new Date(instantMs);
  return {
    date: `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`,
    time: `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`,
  };
}

function inputFromInstantZone(instantMs, timeZone) {
  return localToDateTime(getZonedParts(instantMs, timeZone));
}

function formatInstant(instantMs, timeZone, options = {}) {
  const formatter = getFormatter("en-US", {
    timeZone,
    month: options.long ? "short" : "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...(options.zone ? { timeZoneName: "short" } : {}),
  });
  return formatter.format(new Date(instantMs));
}

function formatTimeOnly(instantMs, timeZone) {
  return getFormatter("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(instantMs));
}

function formatCountdown(remainingMs) {
  if (!Number.isFinite(remainingMs)) return "Meeting time is not configured";
  if (Math.abs(remainingMs) < 1000) return "Meeting starts now";

  const future = remainingMs > 0;
  const abs = Math.abs(remainingMs);
  const totalSeconds = Math.floor(abs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours && parts.length < 2) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (!days && minutes && parts.length < 2) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (!days && !hours && minutes < 10) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  if (!parts.length) parts.push("less than 1 minute");

  return future ? `Meeting in ${parts.join(", ")}` : `Meeting started ${parts.join(", ")} ago`;
}

function formatDurationShort(ms) {
  const abs = Math.abs(ms);
  if (abs >= DAY_MS) return `${Math.round(abs / DAY_MS)}d`;
  if (abs >= HOUR_MS) return `${Math.round(abs / HOUR_MS)}h`;
  if (abs >= MINUTE_MS) return `${Math.round(abs / MINUTE_MS)}m`;
  return `${Math.max(1, Math.round(abs / 1000))}s`;
}

function chooseScale(remainingMs) {
  const remaining = Math.abs(remainingMs);
  if (remaining > 7 * DAY_MS) return { windowMs: 30 * DAY_MS, updateMs: HOUR_MS };
  if (remaining > 2 * DAY_MS) return { windowMs: 7 * DAY_MS, updateMs: 15 * MINUTE_MS };
  if (remaining > 12 * HOUR_MS) return { windowMs: 48 * HOUR_MS, updateMs: 5 * MINUTE_MS };
  if (remaining > HOUR_MS) return { windowMs: 12 * HOUR_MS, updateMs: MINUTE_MS };
  if (remaining > 10 * MINUTE_MS) return { windowMs: HOUR_MS, updateMs: 10 * 1000 };
  if (remaining > MINUTE_MS) return { windowMs: 10 * MINUTE_MS, updateMs: 1000 };
  return { windowMs: 60 * 1000, updateMs: 250 };
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function meetingState(remainingMs) {
  if (remainingMs > 12 * HOUR_MS) return "far";
  if (remainingMs > 10 * MINUTE_MS) return "approaching";
  if (remainingMs > 0) return "imminent";
  if (remainingMs > -5 * MINUTE_MS) return "starting";
  return "past";
}

function encodeParticipant(name, timeZone) {
  return `${encodeURIComponent(name || "")}@${encodeURIComponent((timeZone || "UTC").replaceAll("/", "~"))}`;
}

function decodeParticipant(value) {
  const raw = String(value || "");
  const at = raw.indexOf("@");
  if (at < 0) return { name: "", timeZone: "" };
  return {
    name: decodeURIComponent(raw.slice(0, at)),
    timeZone: decodeURIComponent(raw.slice(at + 1)).replaceAll("~", "/"),
  };
}

function compactUtc(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}T${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}Z`;
}

function parseHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const patch = { meeting: {}, participantA: {}, participantB: {}, display: {}, animation: {} };
  const known = new Set(["v", "t", "at", "dur", "a", "b", "theme", "anim", "mode", "render", "spriteA", "spriteB"]);
  const extras = [];

  if (params.has("t")) patch.meeting.title = params.get("t") || "Meeting";
  if (params.has("at")) {
    const value = params.get("at") || "";
    const normalized = value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
    const parsed = Date.parse(normalized);
    if (!Number.isNaN(parsed)) patch.meeting.startsAt = new Date(parsed).toISOString();
  }
  if (params.has("dur")) {
    const duration = Number(params.get("dur"));
    if (Number.isFinite(duration) && duration > 0) patch.meeting.durationMinutes = Math.round(duration);
  }
  if (params.has("a")) Object.assign(patch.participantA, decodeParticipant(params.get("a")));
  if (params.has("b")) Object.assign(patch.participantB, decodeParticipant(params.get("b")));
  if (params.has("theme")) patch.display.theme = params.get("theme") || "auto";
  if (params.has("anim")) patch.animation.enabled = params.get("anim") !== "0";
  if (params.has("render")) patch.display.renderMode = params.get("render") || "svg";
  if (params.has("spriteA") || params.has("spriteB")) patch.display.renderMode = "sprite";

  params.forEach((value, key) => {
    if (!known.has(key)) extras.push([key, value]);
  });

  return { patch, mode: params.get("mode") || "view", extras };
}

function serializeHash(config, mode = "view", extras = []) {
  const params = new URLSearchParams();
  params.set("v", "1");
  params.set("t", config.meeting.title || "Meeting");
  params.set("at", compactUtc(config.meeting.startsAt));
  params.set("dur", String(config.meeting.durationMinutes || 30));
  params.set("a", encodeParticipant(config.participantA.name || "Alice", config.participantA.timeZone || "UTC"));
  params.set("b", encodeParticipant(config.participantB.name || "Bruno", config.participantB.timeZone || "UTC"));
  params.set("theme", config.display.theme || "auto");
  params.set("anim", config.animation.enabled ? "1" : "0");
  params.set("render", config.display.renderMode || "svg");
  params.set("mode", mode);
  extras.forEach(([key, value]) => {
    if (!params.has(key)) params.set(key, value);
  });
  return `#${params.toString()}`;
}

function getEffectiveTheme() {
  const theme = getWorkingConfig().display.theme || "auto";
  if (theme !== "auto") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getWorkingConfig() {
  return state.isEditing && state.draft ? configFromDraft(false) : state.config;
}

function getWorkingMeetingMs() {
  return state.isEditing && state.draft ? state.draft.visualMeetingMs : state.meetingMs;
}

function cacheDom() {
  const ids = [
    "app", "meeting-title", "countdown-text", "theme-toggle", "edit-toggle", "copy-link-view",
    "primary-time", "time-utc", "time-a", "time-b", "time-a-label", "time-b-label",
    "profile-a-name", "profile-a-zone", "profile-b-name", "profile-b-zone",
    "timeline-stage", "participant-a", "participant-b", "ticks", "name-a", "name-b",
    "metric-remaining", "metric-updated", "metric-duration", "metric-participants", "metric-names", "metric-render-mode",
    "edit-panel", "status-line", "a11y-summary", "save-btn", "cancel-btn", "copy-link-edit",
    "field-title", "field-duration", "field-name-a", "field-name-b", "field-theme", "field-render-mode",
    "utc-date", "utc-time", "a-date", "a-time", "b-date", "b-time", "a-timezone", "b-timezone",
    "label-a", "label-b", "a-tz-offset", "b-tz-offset", "utc-error", "a-error", "b-error", "a-ambiguous", "b-ambiguous",
  ];
  ids.forEach((id) => {
    dom[id] = document.getElementById(id);
  });
}

function init() {
  cacheDom();
  buildTimeZoneDatalist();
  hydrateInitialConfig();
  bindEvents();
  render(true);
  scheduleNextRender();
}

function hydrateInitialConfig() {
  const parsed = parseHash();
  if (parsed) {
    state.config = deepMerge(DEFAULT_CONFIG, parsed.patch);
    state.extraHashPairs = parsed.extras || [];
  } else {
    state.config = deepMerge(DEFAULT_CONFIG, {
      meeting: { startsAt: new Date(Date.now() + 2 * HOUR_MS).toISOString() },
    });
  }
  if (!state.config.meeting.startsAt) {
    state.config.meeting.startsAt = new Date(Date.now() + 2 * HOUR_MS).toISOString();
  }
  state.meetingMs = Date.parse(state.config.meeting.startsAt);
  if (parsed && parsed.mode === "edit") enterEditMode();
}

function buildTimeZoneDatalist() {
  const list = document.getElementById("timezone-list");
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : FALLBACK_TIME_ZONES;
  const fragment = document.createDocumentFragment();
  ["UTC", ...zones.filter((zone) => zone !== "UTC")].forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone;
    fragment.append(option);
  });
  list.replaceChildren(fragment);
}

function bindEvents() {
  dom["theme-toggle"].addEventListener("click", cycleTheme);
  dom["edit-toggle"].addEventListener("click", () => (state.isEditing ? cancelEditMode() : enterEditMode()));
  dom["copy-link-view"].addEventListener("click", () => copyLink(false));
  dom["copy-link-edit"].addEventListener("click", () => copyLink(true));
  dom["save-btn"].addEventListener("click", saveEditMode);
  dom["cancel-btn"].addEventListener("click", cancelEditMode);
  dom["edit-panel"].addEventListener("input", handleEditInput);
  dom["edit-panel"].addEventListener("change", handleEditInput);
  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("resize", () => render(false));
  state.reducedMotion.addEventListener?.("change", () => render(false));
}

function cycleTheme() {
  const config = getWorkingConfig();
  const order = ["auto", "light", "neutral", "dark"];
  const next = order[(order.indexOf(config.display.theme || "auto") + 1) % order.length];
  if (state.isEditing && state.draft) {
    state.draft.theme = next;
    dom["field-theme"].value = next;
    scheduleUrlUpdate();
  } else {
    state.config.display.theme = next;
    replaceHash(serializeHash(state.config, "view", state.extraHashPairs));
  }
  render(false);
}

function handleHashChange() {
  if (state.ignoreHash) return;
  const parsed = parseHash();
  if (!parsed) return;
  state.config = deepMerge(DEFAULT_CONFIG, parsed.patch);
  if (!state.config.meeting.startsAt) state.config.meeting.startsAt = new Date(Date.now() + 2 * HOUR_MS).toISOString();
  state.meetingMs = Date.parse(state.config.meeting.startsAt);
  state.extraHashPairs = parsed.extras || [];
  if (parsed.mode === "edit" && !state.isEditing) enterEditMode(false);
  if (parsed.mode !== "edit" && state.isEditing) closeEditPanelOnly();
  render(true);
}

function enterEditMode(updateHash = true) {
  if (state.isEditing) return;
  state.isEditing = true;
  state.baselineConfig = clone(state.config);
  state.baselineHash = window.location.hash || "";
  state.draft = createDraft(state.config, state.meetingMs);
  dom["edit-panel"].hidden = false;
  dom["edit-toggle"].textContent = "Cancel";
  syncDraftToFields();
  if (updateHash) replaceHash(buildCurrentHash("edit"));
  render(false);
}

function closeEditPanelOnly() {
  state.isEditing = false;
  state.draft = null;
  dom["edit-panel"].hidden = true;
  dom["edit-toggle"].textContent = "Edit";
}

function saveEditMode() {
  if (!state.isEditing || !state.draft) return;
  if (!state.draft.validInstant) {
    setStatus("Fix invalid time fields before saving.");
    return;
  }
  state.config = configFromDraft(true);
  state.meetingMs = Date.parse(state.config.meeting.startsAt);
  closeEditPanelOnly();
  pushHash(serializeHash(state.config, "view", state.extraHashPairs));
  setStatus("Saved. The URL now contains the meeting state.");
  render(true);
}

function cancelEditMode() {
  if (!state.isEditing) return;
  state.config = state.baselineConfig || state.config;
  state.meetingMs = Date.parse(state.config.meeting.startsAt);
  closeEditPanelOnly();
  replaceHash(state.baselineHash || serializeHash(state.config, "view", state.extraHashPairs));
  setStatus("Changes canceled.");
  render(true);
}

function createDraft(config, meetingMs) {
  const validMs = Number.isFinite(meetingMs) ? meetingMs : Date.now() + 2 * HOUR_MS;
  const utc = inputFromInstantUtc(validMs);
  const zoneA = isValidIanaTimeZone(config.participantA.timeZone) ? config.participantA.timeZone : "UTC";
  const zoneB = isValidIanaTimeZone(config.participantB.timeZone) ? config.participantB.timeZone : "UTC";
  const a = inputFromInstantZone(validMs, zoneA);
  const b = inputFromInstantZone(validMs, zoneB);
  return {
    title: config.meeting.title || "Meeting",
    duration: config.meeting.durationMinutes || 30,
    nameA: config.participantA.name || "Alice",
    nameB: config.participantB.name || "Bruno",
    timeZoneA: zoneA,
    timeZoneB: zoneB,
    theme: config.display.theme || "auto",
    renderMode: config.display.renderMode || "svg",
    utcDate: utc.date,
    utcTime: utc.time,
    aDate: a.date,
    aTime: a.time,
    bDate: b.date,
    bTime: b.time,
    canonicalMeetingMs: validMs,
    visualMeetingMs: validMs,
    validInstant: true,
    activeSource: null,
    ambiguousOptions: { participantA: null, participantB: null },
    ambiguousChoice: { participantA: 0, participantB: 0 },
    errors: { utc: "", participantA: "", participantB: "" },
  };
}

function syncDraftToFields() {
  const draft = state.draft;
  const map = {
    "field-title": draft.title,
    "field-duration": draft.duration,
    "field-name-a": draft.nameA,
    "field-name-b": draft.nameB,
    "field-theme": draft.theme,
    "field-render-mode": draft.renderMode,
    "utc-date": draft.utcDate,
    "utc-time": draft.utcTime,
    "a-date": draft.aDate,
    "a-time": draft.aTime,
    "b-date": draft.bDate,
    "b-time": draft.bTime,
    "a-timezone": draft.timeZoneA,
    "b-timezone": draft.timeZoneB,
  };
  Object.entries(map).forEach(([id, value]) => {
    dom[id].value = value;
  });
  syncEditFeedback();
}

function handleEditInput(event) {
  if (!state.isEditing || !state.draft) return;
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

  const draft = state.draft;
  const name = target.name;
  const value = target.value;

  if (name === "title") draft.title = value;
  if (name === "duration") draft.duration = Number(value || 0);
  if (name === "nameA") draft.nameA = value;
  if (name === "nameB") draft.nameB = value;
  if (name === "theme") draft.theme = value;
  if (name === "renderMode") draft.renderMode = value;

  if (name === "aTimeZone") {
    draft.timeZoneA = value.trim();
    preserveInstantOnZoneChange("participantA");
  }
  if (name === "bTimeZone") {
    draft.timeZoneB = value.trim();
    preserveInstantOnZoneChange("participantB");
  }

  if (name === "utcDate" || name === "utcTime") {
    draft[name] = value;
    applyTimeSource("UTC");
  }
  if (name === "aDate" || name === "aTime") {
    draft[name] = value;
    applyTimeSource("participantA");
  }
  if (name === "bDate" || name === "bTime") {
    draft[name] = value;
    applyTimeSource("participantB");
  }

  syncEditFeedback();
  render(false);
  scheduleUrlUpdate();
}

function preserveInstantOnZoneChange(source) {
  const draft = state.draft;
  const zone = source === "participantA" ? draft.timeZoneA : draft.timeZoneB;
  draft.errors[source] = "";
  if (!isValidIanaTimeZone(zone)) {
    draft.errors[source] = "Use an IANA time zone, for example America/Los_Angeles.";
    draft.validInstant = false;
    return;
  }
  if (Number.isFinite(draft.canonicalMeetingMs)) {
    const local = inputFromInstantZone(draft.canonicalMeetingMs, zone);
    if (source === "participantA") {
      draft.aDate = local.date;
      draft.aTime = local.time;
      dom["a-date"].value = local.date;
      dom["a-time"].value = local.time;
    } else {
      draft.bDate = local.date;
      draft.bTime = local.time;
      dom["b-date"].value = local.date;
      dom["b-time"].value = local.time;
    }
    draft.validInstant = true;
  }
}

function applyTimeSource(source) {
  const draft = state.draft;
  draft.activeSource = source;
  draft.errors = { utc: "", participantA: "", participantB: "" };
  draft.ambiguousOptions = { participantA: null, participantB: null };

  let parsed;
  if (source === "UTC") {
    parsed = parseUtcInputs(draft.utcDate, draft.utcTime);
    if (!parsed.valid) {
      draft.errors.utc = parsed.reason === "invalid-date" ? "Enter a complete UTC date." : "Enter a complete UTC time.";
      draft.validInstant = false;
      return;
    }
    draft.canonicalMeetingMs = parsed.instantMs;
  } else {
    const dateValue = source === "participantA" ? draft.aDate : draft.bDate;
    const timeValue = source === "participantA" ? draft.aTime : draft.bTime;
    const zone = source === "participantA" ? draft.timeZoneA : draft.timeZoneB;
    const local = parseLocalInputs(dateValue, timeValue);
    if (!local.valid) {
      draft.errors[source] = local.reason === "invalid-date" ? "Enter a complete date." : "Enter a complete time.";
      draft.validInstant = false;
      return;
    }
    const converted = localToUtcCandidates(local, zone, true);
    if (!converted.valid) {
      if (converted.reason === "invalid-timezone") {
        draft.errors[source] = "Invalid IANA time zone.";
      } else {
        const suggestion = converted.suggestion ? localToDateTime(converted.suggestion.local) : null;
        draft.errors[source] = suggestion
          ? `This local time does not exist. Try ${suggestion.date} ${suggestion.time}.`
          : "This local time does not exist in that time zone.";
      }
      draft.validInstant = false;
      return;
    }
    if (converted.ambiguous) draft.ambiguousOptions[source] = converted.candidates;
    const chosen = converted.candidates[clamp(draft.ambiguousChoice[source] || 0, 0, converted.candidates.length - 1)];
    draft.canonicalMeetingMs = chosen.instantMs;
  }

  draft.validInstant = true;
  refreshDerivedFields(source);
  clearTimeout(state.visualTimer);
  state.visualTimer = setTimeout(() => {
    if (state.draft && state.draft.validInstant) {
      state.draft.visualMeetingMs = state.draft.canonicalMeetingMs;
      render(false);
    }
  }, 140);
}

function refreshDerivedFields(source) {
  const draft = state.draft;
  const instant = draft.canonicalMeetingMs;
  const utc = inputFromInstantUtc(instant);
  if (source !== "UTC") {
    draft.utcDate = utc.date;
    draft.utcTime = utc.time;
    dom["utc-date"].value = utc.date;
    dom["utc-time"].value = utc.time;
  }
  if (source !== "participantA" && isValidIanaTimeZone(draft.timeZoneA)) {
    const localA = inputFromInstantZone(instant, draft.timeZoneA);
    draft.aDate = localA.date;
    draft.aTime = localA.time;
    dom["a-date"].value = localA.date;
    dom["a-time"].value = localA.time;
  }
  if (source !== "participantB" && isValidIanaTimeZone(draft.timeZoneB)) {
    const localB = inputFromInstantZone(instant, draft.timeZoneB);
    draft.bDate = localB.date;
    draft.bTime = localB.time;
    dom["b-date"].value = localB.date;
    dom["b-time"].value = localB.time;
  }
}

function syncEditFeedback() {
  if (!state.draft) return;
  const draft = state.draft;
  dom["utc-error"].textContent = draft.errors.utc || "";
  dom["a-error"].textContent = draft.errors.participantA || "";
  dom["b-error"].textContent = draft.errors.participantB || "";
  dom["a-tz-offset"].textContent = isValidIanaTimeZone(draft.timeZoneA) ? `${draft.timeZoneA} (${formatOffsetLabel(draft.canonicalMeetingMs, draft.timeZoneA)})` : "Invalid time zone";
  dom["b-tz-offset"].textContent = isValidIanaTimeZone(draft.timeZoneB) ? `${draft.timeZoneB} (${formatOffsetLabel(draft.canonicalMeetingMs, draft.timeZoneB)})` : "Invalid time zone";
  dom["label-a"].textContent = draft.nameA || "Participant A";
  dom["label-b"].textContent = draft.nameB || "Participant B";
  document.querySelectorAll(".time-row").forEach((row) => {
    row.classList.toggle("is-active", row.dataset.source === draft.activeSource);
  });
  syncAmbiguous("participantA", dom["a-ambiguous"]);
  syncAmbiguous("participantB", dom["b-ambiguous"]);
}

function syncAmbiguous(source, host) {
  const options = state.draft.ambiguousOptions[source];
  if (!options || options.length < 2) {
    host.hidden = true;
    host.replaceChildren();
    return;
  }
  host.hidden = false;
  const label = document.createElement("span");
  label.textContent = "Ambiguous local time:";
  const select = document.createElement("select");
  const zone = source === "participantA" ? state.draft.timeZoneA : state.draft.timeZoneB;
  options.forEach((option, index) => {
    const item = document.createElement("option");
    item.value = String(index);
    item.textContent = `${formatInstant(option.instantMs, zone, { zone: true })}`;
    select.append(item);
  });
  select.value = String(state.draft.ambiguousChoice[source] || 0);
  select.addEventListener("change", () => {
    state.draft.ambiguousChoice[source] = Number(select.value);
    applyTimeSource(source);
    syncEditFeedback();
    render(false);
  });
  host.replaceChildren(label, select);
}

function configFromDraft(commit) {
  const draft = state.draft;
  const base = deepMerge(state.config, {});
  base.meeting.title = draft.title || "Meeting";
  base.meeting.durationMinutes = Number.isFinite(draft.duration) && draft.duration > 0 ? Math.round(draft.duration) : 30;
  base.meeting.startsAt = new Date(commit ? draft.canonicalMeetingMs : draft.visualMeetingMs).toISOString();
  base.participantA.name = draft.nameA || "Participant A";
  base.participantB.name = draft.nameB || "Participant B";
  base.participantA.timeZone = draft.timeZoneA || "UTC";
  base.participantB.timeZone = draft.timeZoneB || "UTC";
  base.display.theme = draft.theme || "auto";
  base.display.renderMode = draft.renderMode || "svg";
  return base;
}

function buildCurrentHash(mode) {
  const config = state.isEditing && state.draft ? configFromDraft(false) : state.config;
  return serializeHash(config, mode, state.extraHashPairs);
}

function scheduleUrlUpdate() {
  if (!state.isEditing || !state.draft || !state.draft.validInstant) return;
  clearTimeout(state.urlTimer);
  state.urlTimer = setTimeout(() => replaceHash(buildCurrentHash("edit")), 220);
}

function replaceHash(hash) {
  state.ignoreHash = true;
  history.replaceState(null, "", hash || window.location.pathname);
  setTimeout(() => {
    state.ignoreHash = false;
  }, 0);
}

function pushHash(hash) {
  state.ignoreHash = true;
  history.pushState(null, "", hash || window.location.pathname);
  setTimeout(() => {
    state.ignoreHash = false;
  }, 0);
}

async function copyLink(fromEdit) {
  const hash = state.isEditing && fromEdit ? buildCurrentHash("edit") : serializeHash(state.config, "view", state.extraHashPairs);
  const url = `${window.location.origin}${window.location.pathname}${hash}`;
  try {
    await navigator.clipboard.writeText(url);
    setStatus("Link copied.");
  } catch {
    setStatus("Copy failed. Select the address bar and copy manually.");
  }
}

function setStatus(message) {
  dom["status-line"].textContent = message || "";
}

function render(force) {
  const config = getWorkingConfig();
  const meetingMs = getWorkingMeetingMs();
  if (!Number.isFinite(meetingMs)) return;

  dom.app.dataset.theme = getEffectiveTheme();
  dom.app.dataset.reducedMotion = state.reducedMotion.matches ? "1" : "0";
  dom["theme-toggle"].textContent = `Theme: ${(config.display.theme || "auto").replace(/^./, (s) => s.toUpperCase())}`;

  const nowMs = Date.now();
  const remainingMs = meetingMs - nowMs;
  const scale = chooseScale(remainingMs);
  const remainingRatio = clamp(remainingMs / scale.windowMs, 0, 1);
  const progress = 1 - remainingRatio;
  const reach = easeOutCubic(clamp(progress, 0, 1));
  const maxOffset = 31;
  const aX = 50 - remainingRatio * maxOffset;
  const bX = 50 + remainingRatio * maxOffset;
  const mode = meetingState(remainingMs);

  dom["meeting-title"].textContent = config.meeting.title || "Meeting";
  dom["countdown-text"].textContent = formatCountdown(remainingMs);
  dom["metric-remaining"].textContent = formatCountdown(remainingMs).replace(/^Meeting in /, "").replace(/^Meeting started /, "Started ");
  dom["metric-updated"].textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  dom["metric-duration"].textContent = `${config.meeting.durationMinutes || 30}m`;
  dom["metric-participants"].textContent = "2";
  dom["metric-names"].textContent = `${config.participantA.name || "Alice"}, ${config.participantB.name || "Bruno"}`;
  dom["metric-render-mode"].textContent = (config.display.renderMode || "svg").toUpperCase();

  const zoneA = isValidIanaTimeZone(config.participantA.timeZone) ? config.participantA.timeZone : "UTC";
  const zoneB = isValidIanaTimeZone(config.participantB.timeZone) ? config.participantB.timeZone : "UTC";
  dom["profile-a-name"].textContent = config.participantA.name || "Alice";
  dom["profile-a-zone"].textContent = config.participantA.timeZone || "UTC";
  dom["profile-b-name"].textContent = config.participantB.name || "Bruno";
  dom["profile-b-zone"].textContent = config.participantB.timeZone || "UTC";
  dom["name-a"].textContent = config.participantA.name || "Alice";
  dom["name-b"].textContent = config.participantB.name || "Bruno";
  dom["time-a-label"].textContent = config.participantA.name || "Alice";
  dom["time-b-label"].textContent = config.participantB.name || "Bruno";

  const primaryZone = config.meeting.primaryTimeZone === "participantB" ? zoneB : config.meeting.primaryTimeZone === "UTC" ? "UTC" : zoneA;
  dom["primary-time"].textContent = formatInstant(meetingMs, primaryZone, { long: true, zone: true });
  dom["time-utc"].textContent = formatTimeOnly(meetingMs, "UTC");
  dom["time-a"].textContent = formatTimeOnly(meetingMs, zoneA);
  dom["time-b"].textContent = formatTimeOnly(meetingMs, zoneB);

  dom["timeline-stage"].style.setProperty("--a-x", `${aX}%`);
  dom["timeline-stage"].style.setProperty("--b-x", `${bX}%`);
  dom["timeline-stage"].style.setProperty("--reach", reach.toFixed(3));
  dom["timeline-stage"].classList.toggle("is-sprite", config.display.renderMode === "sprite");
  dom["participant-a"].classList.toggle("is-starting", mode === "starting");
  dom["participant-b"].classList.toggle("is-starting", mode === "starting");

  renderTicks(scale.windowMs);

  if (state.isEditing && state.draft) syncEditFeedback();

  dom["a11y-summary"].textContent = `${config.meeting.title} between ${config.participantA.name} and ${config.participantB.name}. ${formatCountdown(remainingMs)}. UTC ${formatInstant(meetingMs, "UTC", { zone: true })}.`;

  if (force) scheduleNextRender();
}

function renderTicks(windowMs) {
  const far = formatDurationShort(windowMs);
  const half = formatDurationShort(windowMs / 2);
  const labels = [far, half, "Meeting", half, far];
  dom.ticks.replaceChildren(
    ...labels.map((label) => {
      const span = document.createElement("span");
      span.className = "tick";
      span.textContent = label;
      return span;
    })
  );
}

function scheduleNextRender() {
  clearTimeout(state.renderTimer);
  const meetingMs = getWorkingMeetingMs();
  const scale = chooseScale(meetingMs - Date.now());
  state.renderTimer = setTimeout(() => {
    render(false);
    scheduleNextRender();
  }, scale.updateMs);
}

window.addEventListener("DOMContentLoaded", init);
