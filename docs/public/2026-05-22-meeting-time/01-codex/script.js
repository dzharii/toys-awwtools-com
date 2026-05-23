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
    editable: true,
  },
  participantA: {
    name: "Alice",
    timeZone: "America/Los_Angeles",
    color: "#0e7490",
    label: "Participant A",
  },
  participantB: {
    name: "Bruno",
    timeZone: "Europe/Berlin",
    color: "#b45309",
    label: "Participant B",
  },
  display: {
    showUtc: true,
    showParticipantLocalTimes: true,
    showCountdownText: true,
    showTimelineTicks: true,
    compact: false,
    theme: "auto",
    showEditButton: true,
    showShareUrl: true,
    renderMode: "svg",
  },
  editing: {
    enabled: true,
    defaultMode: "view",
    liveConvertOnInput: true,
    updateUrlOnInput: true,
    urlUpdateDebounceMs: 250,
    allowTitleEdit: true,
    allowDurationEdit: true,
    allowParticipantEdit: true,
    allowTimeZoneEdit: true,
  },
  urlState: {
    enabled: true,
    mode: "hash",
    format: "compact-query",
    replaceHistoryOnInput: true,
    pushHistoryOnCommit: true,
  },
  animation: {
    enabled: true,
    reducedMotion: "respect-system",
    finalHandshakeWindowSeconds: 60,
    postMeetingHoldMinutes: 5,
  },
  clock: {
    now: "",
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

const SPRITE_FRAMES = Array.from({ length: 30 }, (_, i) => {
  const index = String(i + 1).padStart(2, "0");
  return `./sprites/frame-${index}.png`;
});

const SPRITE_A = SPRITE_FRAMES.slice(0, 15);
const SPRITE_B = SPRITE_FRAMES.slice(15);

const formatters = new Map();

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object") {
    return clone(base);
  }
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(patch)) {
    const value = patch[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function isValidIanaTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") {
    return false;
  }
  if (timeZone === "UTC") {
    return true;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function getFormatter(locale, options) {
  const key = `${locale}|${JSON.stringify(options)}`;
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return formatters.get(key);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function parseDateInput(dateValue) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue || "");
  if (!match) {
    return null;
  }
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

function parseTimeInput(timeValue) {
  const match = /^(\d{2}):(\d{2})$/.exec(timeValue || "");
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
}

function parseUtcFromInputs(dateValue, timeValue) {
  const date = parseDateInput(dateValue);
  if (!date) {
    return { valid: false, reason: "invalid-date" };
  }
  const time = parseTimeInput(timeValue);
  if (!time) {
    return { valid: false, reason: "invalid-time" };
  }
  return {
    valid: true,
    instantMs: Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      time.hour,
      time.minute,
      0,
      0
    ),
  };
}

function parseShortOffsetToMinutes(text) {
  const match = /(GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/.exec(text || "");
  if (!match) {
    return null;
  }
  const sign = match[2] === "-" ? -1 : 1;
  const hours = Number(match[3]);
  const minutes = Number(match[4] || "0");
  return sign * (hours * 60 + minutes);
}

function getOffsetMinutes(instantMs, timeZone) {
  if (timeZone === "UTC") {
    return 0;
  }
  const formatter = getFormatter("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(instantMs));
  const zoneName = parts.find((part) => part.type === "timeZoneName");
  const offset = parseShortOffsetToMinutes(zoneName ? zoneName.value : "");
  if (offset !== null) {
    return offset;
  }
  return 0;
}

function formatOffsetLabel(instantMs, timeZone) {
  if (!isValidIanaTimeZone(timeZone)) {
    return "";
  }
  const total = getOffsetMinutes(instantMs, timeZone);
  const sign = total >= 0 ? "+" : "-";
  const abs = Math.abs(total);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `UTC${sign}${pad2(hours)}:${pad2(minutes)}`;
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
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(instantMs));
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
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

function parseLocalInputs(dateValue, timeValue) {
  const date = parseDateInput(dateValue);
  if (!date) {
    return { valid: false, reason: "invalid-date" };
  }
  const time = parseTimeInput(timeValue);
  if (!time) {
    return { valid: false, reason: "invalid-time" };
  }
  return {
    valid: true,
    ...date,
    ...time,
  };
}

function localToDateAndTime(local) {
  return {
    date: `${local.year}-${pad2(local.month)}-${pad2(local.day)}`,
    time: `${pad2(local.hour)}:${pad2(local.minute)}`,
  };
}

function addMinutesToLocal(local, minutes) {
  const tempMs = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    0,
    0
  );
  const shifted = new Date(tempMs + minutes * MINUTE_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function getNearestValidSuggestion(localInput, timeZone) {
  for (let delta = 1; delta <= 180; delta += 1) {
    const forward = addMinutesToLocal(localInput, delta);
    const forwardResult = localToUtcCandidates(forward, timeZone, false);
    if (forwardResult.valid) {
      return {
        direction: "later",
        local: forward,
      };
    }
    const backward = addMinutesToLocal(localInput, -delta);
    const backwardResult = localToUtcCandidates(backward, timeZone, false);
    if (backwardResult.valid) {
      return {
        direction: "earlier",
        local: backward,
      };
    }
  }
  return null;
}

function localToUtcCandidates(localInput, timeZone, withSuggestion = true) {
  if (!isValidIanaTimeZone(timeZone)) {
    return { valid: false, reason: "invalid-timezone", candidates: [] };
  }

  const naiveUtcMs = Date.UTC(
    localInput.year,
    localInput.month - 1,
    localInput.day,
    localInput.hour,
    localInput.minute,
    0,
    0
  );

  const offsets = new Set(
    [-24, -6, 0, 6, 24]
      .map((hours) => getOffsetMinutes(naiveUtcMs + hours * HOUR_MS, timeZone))
      .filter((offset) => Number.isFinite(offset))
  );

  const candidates = [];
  for (const offsetMinutes of offsets) {
    const candidateMs = naiveUtcMs - offsetMinutes * MINUTE_MS;
    const candidateLocal = getZonedParts(candidateMs, timeZone);
    if (sameLocal(localInput, candidateLocal)) {
      candidates.push({
        instantMs: candidateMs,
        offsetMinutes,
      });
    }
  }

  const unique = [];
  const seen = new Set();
  for (const candidate of candidates.sort((a, b) => a.instantMs - b.instantMs)) {
    const key = String(candidate.instantMs);
    if (!seen.has(key)) {
      unique.push(candidate);
      seen.add(key);
    }
  }

  if (unique.length > 0) {
    return {
      valid: true,
      candidates: unique,
      ambiguous: unique.length > 1,
    };
  }

  const suggestion = withSuggestion ? getNearestValidSuggestion(localInput, timeZone) : null;
  return {
    valid: false,
    reason: "nonexistent-time",
    candidates: [],
    suggestion,
  };
}

function formatInstantHuman(instantMs, timeZone, includeZone = true) {
  const formatter = getFormatter("en-US", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...(includeZone ? { timeZoneName: "short" } : {}),
  });
  return formatter.format(new Date(instantMs));
}

function getUtcInputFromInstant(instantMs) {
  const date = new Date(instantMs);
  return {
    date: `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
      date.getUTCDate()
    )}`,
    time: `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`,
  };
}

function getLocalInputFromInstant(instantMs, timeZone) {
  const parts = getZonedParts(instantMs, timeZone);
  return localToDateAndTime(parts);
}

function formatCountdown(remainingMs) {
  if (Number.isNaN(remainingMs)) {
    return "Meeting time is not configured";
  }
  if (Math.abs(remainingMs) < 1000) {
    return "Meeting starts now";
  }
  const upcoming = remainingMs > 0;
  const absMs = Math.abs(remainingMs);
  const totalSeconds = Math.floor(absMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
  }
  if (hours > 0 && parts.length < 2) {
    parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  }
  if (days === 0 && minutes > 0 && parts.length < 2) {
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  }
  if (days === 0 && hours === 0 && minutes < 10) {
    parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) {
    parts.push("less than 1 minute");
  }
  return upcoming ? `Meeting in ${parts.join(", ")}` : `Meeting started ${parts.join(", ")} ago`;
}

function chooseScale(remainingMs) {
  const remaining = Math.abs(remainingMs);
  if (remaining > 7 * DAY_MS) {
    return { windowMs: 30 * DAY_MS, updateMs: HOUR_MS, key: "30d" };
  }
  if (remaining > 2 * DAY_MS) {
    return { windowMs: 7 * DAY_MS, updateMs: 15 * MINUTE_MS, key: "7d" };
  }
  if (remaining > 12 * HOUR_MS) {
    return { windowMs: 48 * HOUR_MS, updateMs: 5 * MINUTE_MS, key: "48h" };
  }
  if (remaining > HOUR_MS) {
    return { windowMs: 12 * HOUR_MS, updateMs: MINUTE_MS, key: "12h" };
  }
  if (remaining > 10 * MINUTE_MS) {
    return { windowMs: HOUR_MS, updateMs: 10 * 1000, key: "1h" };
  }
  if (remaining > MINUTE_MS) {
    return { windowMs: 10 * MINUTE_MS, updateMs: 1000, key: "10m" };
  }
  return { windowMs: 60 * 1000, updateMs: 40, key: "60s", continuous: true };
}

function formatDurationShort(ms) {
  const abs = Math.abs(ms);
  if (abs >= DAY_MS) {
    return `${Math.round(abs / DAY_MS)}d`;
  }
  if (abs >= HOUR_MS) {
    return `${Math.round(abs / HOUR_MS)}h`;
  }
  if (abs >= MINUTE_MS) {
    return `${Math.round(abs / MINUTE_MS)}m`;
  }
  return `${Math.round(abs / 1000)}s`;
}

function buildTickLabels(windowMs) {
  const far = formatDurationShort(windowMs);
  const half = formatDurationShort(windowMs / 2);
  return [far, half, "Meeting", half, far];
}

function encodeParticipant(name, timeZone) {
  return `${name || ""}@${(timeZone || "").replaceAll("/", "~")}`;
}

function decodeParticipant(value) {
  const [name = "", zoneRaw = ""] = String(value || "").split("@");
  return {
    name: name || "",
    timeZone: zoneRaw.replaceAll("~", "/"),
  };
}

function parseHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return null;
  }
  const params = new URLSearchParams(raw);
  const patch = {
    meeting: {},
    participantA: {},
    participantB: {},
    display: {},
    animation: {},
    editing: {},
  };
  const mode = params.get("mode") || null;
  const knownKeys = new Set([
    "v",
    "t",
    "at",
    "dur",
    "a",
    "b",
    "theme",
    "anim",
    "mode",
    "spriteA",
    "spriteB",
  ]);
  const extras = [];

  if (params.has("t")) {
    patch.meeting.title = params.get("t") || "";
  }
  if (params.has("at")) {
    const atRaw = params.get("at") || "";
    const hasOffset = /[+-]\d{2}:?\d{2}$/.test(atRaw);
    const normalized = atRaw.endsWith("Z") || hasOffset ? atRaw : `${atRaw}Z`;
    const parsed = Date.parse(normalized);
    if (!Number.isNaN(parsed)) {
      patch.meeting.startsAt = new Date(parsed).toISOString();
    }
  }
  if (params.has("dur")) {
    const duration = Number(params.get("dur"));
    if (Number.isFinite(duration) && duration > 0) {
      patch.meeting.durationMinutes = Math.round(duration);
    }
  }
  if (params.has("a")) {
    const a = decodeParticipant(params.get("a"));
    if (a.name) {
      patch.participantA.name = a.name;
    }
    if (a.timeZone) {
      patch.participantA.timeZone = a.timeZone;
    }
  }
  if (params.has("b")) {
    const b = decodeParticipant(params.get("b"));
    if (b.name) {
      patch.participantB.name = b.name;
    }
    if (b.timeZone) {
      patch.participantB.timeZone = b.timeZone;
    }
  }
  if (params.has("theme")) {
    patch.display.theme = params.get("theme");
  }
  if (params.has("anim")) {
    patch.animation.enabled = params.get("anim") !== "0";
  }
  if (params.has("spriteA") || params.has("spriteB")) {
    patch.display.renderMode = "sprite";
  }
  for (const [key, value] of params.entries()) {
    if (!knownKeys.has(key)) {
      extras.push([key, value]);
    }
  }

  return { patch, mode, extras };
}

function compactUtc(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate()
  )}T${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}Z`;
}

function serializeHash(config, mode, extraPairs = []) {
  const params = new URLSearchParams();
  params.set("v", "1");
  params.set("t", config.meeting.title || DEFAULT_CONFIG.meeting.title);
  params.set("at", compactUtc(config.meeting.startsAt));
  params.set("dur", String(config.meeting.durationMinutes || DEFAULT_CONFIG.meeting.durationMinutes));
  params.set(
    "a",
    encodeParticipant(config.participantA.name || "Alice", config.participantA.timeZone || "UTC")
  );
  params.set(
    "b",
    encodeParticipant(config.participantB.name || "Bruno", config.participantB.timeZone || "UTC")
  );
  params.set("theme", config.display.theme || "auto");
  params.set("anim", config.animation.enabled ? "1" : "0");
  if (config.display.renderMode === "sprite") {
    params.set("spriteA", "setA");
    params.set("spriteB", "setB");
  }
  if (mode) {
    params.set("mode", mode);
  }
  for (const [key, value] of extraPairs) {
    if (!params.has(key)) {
      params.set(key, value);
    }
  }
  return `#${params.toString()}`;
}

function meetingState(remainingMs, holdMinutes) {
  if (remainingMs > 12 * HOUR_MS) {
    return "far-away";
  }
  if (remainingMs > 10 * MINUTE_MS) {
    return "approaching";
  }
  if (remainingMs > 0) {
    return "imminent";
  }
  if (remainingMs >= -5 * MINUTE_MS) {
    return "starting";
  }
  if (remainingMs >= -holdMinutes * MINUTE_MS) {
    return "starting";
  }
  return "past";
}

class MeetingTimelineApp {
  constructor() {
    this.dom = {
      app: document.getElementById("app"),
      title: document.getElementById("meeting-title"),
      countdown: document.getElementById("countdown-text"),
      primaryTime: document.getElementById("primary-time"),
      timeUtc: document.getElementById("time-utc"),
      timeA: document.getElementById("time-a"),
      timeB: document.getElementById("time-b"),
      track: document.getElementById("timeline-track"),
      ticks: document.getElementById("ticks"),
      participantA: document.getElementById("participant-a"),
      participantB: document.getElementById("participant-b"),
      nameA: document.getElementById("name-a"),
      nameB: document.getElementById("name-b"),
      editToggle: document.getElementById("edit-toggle"),
      copyLinkView: document.getElementById("copy-link-view"),
      editPanel: document.getElementById("edit-panel"),
      statusLine: document.getElementById("status-line"),
      summary: document.getElementById("a11y-summary"),
      labelA: document.getElementById("label-a"),
      labelB: document.getElementById("label-b"),
      offsetA: document.getElementById("a-tz-offset"),
      offsetB: document.getElementById("b-tz-offset"),
      ambiguousA: document.getElementById("a-ambiguous"),
      ambiguousB: document.getElementById("b-ambiguous"),
      fields: {
        title: document.getElementById("field-title"),
        duration: document.getElementById("field-duration"),
        nameA: document.getElementById("field-name-a"),
        nameB: document.getElementById("field-name-b"),
        utcDate: document.getElementById("utc-date"),
        utcTime: document.getElementById("utc-time"),
        aDate: document.getElementById("a-date"),
        aTime: document.getElementById("a-time"),
        bDate: document.getElementById("b-date"),
        bTime: document.getElementById("b-time"),
        aTimeZone: document.getElementById("a-timezone"),
        bTimeZone: document.getElementById("b-timezone"),
        theme: document.getElementById("field-theme"),
        renderMode: document.getElementById("field-render-mode"),
      },
      errors: {
        utc: document.getElementById("utc-error"),
        a: document.getElementById("a-error"),
        b: document.getElementById("b-error"),
      },
      buttons: {
        save: document.getElementById("save-btn"),
        cancel: document.getElementById("cancel-btn"),
        copyEdit: document.getElementById("copy-link-edit"),
      },
    };

    this.config = deepMerge(DEFAULT_CONFIG, {});
    if (!this.config.meeting.startsAt) {
      this.config.meeting.startsAt = new Date(Date.now() + 2 * HOUR_MS).toISOString();
    }
    this.meetingMs = Date.parse(this.config.meeting.startsAt);
    this.isEditing = false;
    this.baselineConfig = null;
    this.baselineHash = "";
    this.draft = null;
    this.lastRenderMs = 0;
    this.timerId = 0;
    this.rafId = 0;
    this.urlDebounceId = 0;
    this.visualDebounceId = 0;
    this.renderedScaleKey = "";
    this.lastScaleKey = "";
    this.previousRemainingMs = Number.POSITIVE_INFINITY;
    this.handshakeTimerId = 0;
    this.lastMeetingState = "";
    this.callbacks = {};
    this.ignoreHashChange = false;
    this.reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.supportsIntlParts =
      typeof Intl !== "undefined" &&
      typeof Intl.DateTimeFormat === "function" &&
      typeof Intl.DateTimeFormat.prototype.formatToParts === "function";
    this.extraHashParams = [];
  }

  init() {
    this.buildTimeZoneList();
    this.bindEvents();
    this.loadFromHash();
    this.applyTheme();
    this.render(true);
    this.scheduleUpdates();
  }

  emit(name, payload) {
    const handler = this.callbacks ? this.callbacks[name] : null;
    if (typeof handler !== "function") {
      return;
    }
    try {
      handler(payload);
    } catch {
      // intentionally ignored: callback failures should not break rendering
    }
  }

  buildTimeZoneList() {
    const list = document.getElementById("timezone-list");
    const zones = typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : FALLBACK_TIME_ZONES;
    const fragment = document.createDocumentFragment();
    for (const zone of zones) {
      const option = document.createElement("option");
      option.value = zone;
      fragment.appendChild(option);
    }
    list.replaceChildren(fragment);
  }

  bindEvents() {
    this.dom.editToggle.addEventListener("click", () => {
      if (!this.config.editing.enabled || !this.config.meeting.editable) {
        return;
      }
      if (this.isEditing) {
        this.cancelEditing();
      } else {
        this.enterEditing();
      }
    });

    this.dom.copyLinkView.addEventListener("click", () => this.copyLink(false));
    this.dom.buttons.copyEdit.addEventListener("click", () => this.copyLink(true));
    this.dom.buttons.cancel.addEventListener("click", () => this.cancelEditing());
    this.dom.buttons.save.addEventListener("click", () => this.saveEditing());

    this.dom.editPanel.addEventListener("input", (event) => this.handleEditInput(event));
    this.dom.editPanel.addEventListener("change", (event) => this.handleEditChange(event));

    window.addEventListener("hashchange", () => this.handleHashChange());
    window.addEventListener("resize", () => this.render(false));
    if (typeof this.reducedMotionPreference.addEventListener === "function") {
      this.reducedMotionPreference.addEventListener("change", () => this.render(false));
    } else if (typeof this.reducedMotionPreference.addListener === "function") {
      this.reducedMotionPreference.addListener(() => this.render(false));
    }
  }

  applyPatch(patch) {
    this.config = deepMerge(DEFAULT_CONFIG, patch || {});
    if (!this.config.meeting.startsAt) {
      this.config.meeting.startsAt = new Date(Date.now() + 2 * HOUR_MS).toISOString();
    }
    const parsedMeeting = Date.parse(this.config.meeting.startsAt);
    this.meetingMs = parsedMeeting;
  }

  loadFromHash() {
    const parsed = parseHash();
    if (parsed && parsed.patch) {
      this.applyPatch(parsed.patch);
      this.extraHashParams = parsed.extras || [];
      if (parsed.mode === "edit") {
        this.enterEditing();
      }
    }
  }

  handleHashChange() {
    if (this.ignoreHashChange) {
      return;
    }
    const parsed = parseHash();
    if (!parsed || !parsed.patch) {
      return;
    }
    this.applyPatch(parsed.patch);
    this.extraHashParams = parsed.extras || [];
    this.applyTheme();
    if (this.isEditing && parsed.mode !== "edit") {
      this.isEditing = false;
      this.dom.editPanel.hidden = true;
    }
    this.render(true);
    this.scheduleUpdates();
  }

  applyTheme() {
    const theme = this.getWorkingConfig().display.theme || "auto";
    const effective =
      theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    this.dom.app.dataset.theme = effective;
    this.dom.app.dataset.reducedMotion = this.usesReducedMotion() ? "1" : "0";
  }

  usesReducedMotion() {
    const mode = this.getWorkingConfig().animation.reducedMotion;
    if (mode === "always") {
      return true;
    }
    if (mode === "never") {
      return false;
    }
    return this.reducedMotionPreference.matches;
  }

  getNowMs() {
    const nowFromConfig = this.getWorkingConfig().clock.now;
    if (nowFromConfig) {
      const parsed = Date.parse(nowFromConfig);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return Date.now();
  }

  getWorkingConfig() {
    if (!this.isEditing || !this.draft) {
      return this.config;
    }
    return this.buildConfigFromDraft(false);
  }

  getWorkingMeetingMs() {
    if (this.isEditing && this.draft) {
      return this.draft.visualMeetingMs;
    }
    return this.meetingMs;
  }

  enterEditing() {
    this.isEditing = true;
    this.baselineConfig = clone(this.config);
    this.baselineHash = window.location.hash || "";
    this.draft = this.createDraft(this.config, this.meetingMs);
    this.dom.editPanel.hidden = false;
    this.dom.editToggle.textContent = "Cancel";
    this.syncDraftToFields();
    this.applyTheme();
    this.render(false);
    const editHash = this.buildHash(true);
    this.replaceHash(editHash, true);
    this.emit("onUrlStateChange", editHash);
    this.emit("onEditModeChange", true);
  }

  cancelEditing() {
    if (!this.isEditing) {
      return;
    }
    this.isEditing = false;
    if (this.baselineConfig) {
      this.config = this.baselineConfig;
      this.meetingMs = Date.parse(this.config.meeting.startsAt);
    }
    this.draft = null;
    this.baselineConfig = null;
    this.dom.editPanel.hidden = true;
    this.dom.editToggle.textContent = "Edit";
    this.dom.statusLine.textContent = "Changes canceled";
    const restoredHash = this.baselineHash || this.buildHash(false);
    this.replaceHash(restoredHash, true);
    this.emit("onUrlStateChange", restoredHash);
    this.applyTheme();
    this.render(true);
    this.emit("onCancel");
    this.emit("onEditModeChange", false);
  }

  saveEditing() {
    if (!this.isEditing || !this.draft) {
      return;
    }
    if (!this.draft.hasValidInstant) {
      this.dom.statusLine.textContent = "Cannot save: fix invalid time fields first.";
      return;
    }
    this.config = this.buildConfigFromDraft(true);
    this.meetingMs = Date.parse(this.config.meeting.startsAt);
    this.isEditing = false;
    this.draft = null;
    this.baselineConfig = null;
    this.dom.editPanel.hidden = true;
    this.dom.editToggle.textContent = "Edit";
    this.dom.statusLine.textContent = "Saved";
    const hash = this.buildHash(false);
    if (this.config.urlState.pushHistoryOnCommit) {
      this.pushHash(hash);
    } else {
      this.replaceHash(hash, true);
    }
    this.emit("onUrlStateChange", hash);
    this.applyTheme();
    this.render(true);
    this.emit("onCommit", clone(this.config));
    this.emit("onEditModeChange", false);
  }

  createDraft(config, meetingMs) {
    const utc = getUtcInputFromInstant(meetingMs);
    const a = isValidIanaTimeZone(config.participantA.timeZone)
      ? getLocalInputFromInstant(meetingMs, config.participantA.timeZone)
      : utc;
    const b = isValidIanaTimeZone(config.participantB.timeZone)
      ? getLocalInputFromInstant(meetingMs, config.participantB.timeZone)
      : utc;
    return {
      title: config.meeting.title || "Meeting",
      duration: config.meeting.durationMinutes || 30,
      nameA: config.participantA.name || "Alice",
      nameB: config.participantB.name || "Bruno",
      timeZoneA: config.participantA.timeZone || "UTC",
      timeZoneB: config.participantB.timeZone || "UTC",
      theme: config.display.theme || "auto",
      renderMode: config.display.renderMode || "svg",
      utcDate: utc.date,
      utcTime: utc.time,
      aDate: a.date,
      aTime: a.time,
      bDate: b.date,
      bTime: b.time,
      activeTimeSource: null,
      ambiguousChoice: {
        participantA: 0,
        participantB: 0,
      },
      ambiguousOptions: {
        participantA: null,
        participantB: null,
      },
      errors: {
        utc: "",
        a: "",
        b: "",
      },
      warnings: {
        duration: "",
      },
      hasValidInstant: Number.isFinite(meetingMs),
      canonicalMeetingMs: meetingMs,
      visualMeetingMs: meetingMs,
    };
  }

  syncDraftToFields() {
    const draft = this.draft;
    const fields = this.dom.fields;
    fields.title.value = draft.title;
    fields.duration.value = String(draft.duration);
    fields.nameA.value = draft.nameA;
    fields.nameB.value = draft.nameB;
    fields.utcDate.value = draft.utcDate;
    fields.utcTime.value = draft.utcTime;
    fields.aDate.value = draft.aDate;
    fields.aTime.value = draft.aTime;
    fields.bDate.value = draft.bDate;
    fields.bTime.value = draft.bTime;
    fields.aTimeZone.value = draft.timeZoneA;
    fields.bTimeZone.value = draft.timeZoneB;
    fields.theme.value = draft.theme;
    fields.renderMode.value = draft.renderMode;
    this.syncErrors();
    this.syncAmbiguityControls();
    this.highlightActiveRow();
  }

  syncErrors() {
    this.dom.errors.utc.textContent = this.draft ? this.draft.errors.utc : "";
    this.dom.errors.a.textContent = this.draft ? this.draft.errors.a : "";
    this.dom.errors.b.textContent = this.draft ? this.draft.errors.b : "";
  }

  highlightActiveRow() {
    const rows = this.dom.editPanel.querySelectorAll(".time-row");
    rows.forEach((row) => {
      row.classList.toggle("is-active", row.dataset.source === this.draft.activeTimeSource);
    });
  }

  syncAmbiguityControls() {
    const config = [
      {
        source: "participantA",
        host: this.dom.ambiguousA,
        label: this.draft.nameA || "Participant A",
      },
      {
        source: "participantB",
        host: this.dom.ambiguousB,
        label: this.draft.nameB || "Participant B",
      },
    ];
    for (const item of config) {
      const options = this.draft.ambiguousOptions[item.source];
      if (!options || options.length < 2) {
        item.host.hidden = true;
        item.host.replaceChildren();
        continue;
      }
      item.host.hidden = false;
      const label = document.createElement("span");
      label.textContent = "Ambiguous local time:";
      const select = document.createElement("select");
      options.forEach((option, index) => {
        const optionEl = document.createElement("option");
        optionEl.value = String(index);
        const fmt = getFormatter("en-US", {
          timeZone: item.source === "participantA" ? this.draft.timeZoneA : this.draft.timeZoneB,
          timeZoneName: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const stamp = fmt.format(new Date(option.instantMs));
        optionEl.textContent = `${stamp} (${option.offsetMinutes >= 0 ? "+" : ""}${Math.trunc(
          option.offsetMinutes / 60
        )}:${pad2(Math.abs(option.offsetMinutes % 60))})`;
        select.appendChild(optionEl);
      });
      select.value = String(this.draft.ambiguousChoice[item.source] || 0);
      select.addEventListener("change", () => {
        this.draft.ambiguousChoice[item.source] = Number(select.value);
        this.applyTimeSource(item.source);
      });
      item.host.replaceChildren(label, select);
    }
  }

  handleEditInput(event) {
    if (!this.isEditing || !this.draft) {
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
      return;
    }
    const name = target.name;
    if (!name) {
      return;
    }
    const value = target.value;
    const draft = this.draft;

    switch (name) {
      case "title":
        draft.title = value;
        break;
      case "duration": {
        draft.duration = Number(value || 0);
        if (!Number.isFinite(draft.duration) || draft.duration < 1) {
          draft.warnings.duration = "Duration must be at least 1 minute.";
        } else if (draft.duration > 24 * 60) {
          draft.warnings.duration = "Long meeting duration is unusual.";
        } else {
          draft.warnings.duration = "";
        }
        break;
      }
      case "nameA":
        draft.nameA = value;
        break;
      case "nameB":
        draft.nameB = value;
        break;
      case "aTimeZone":
        draft.timeZoneA = value.trim();
        this.onTimeZoneChange("participantA");
        break;
      case "bTimeZone":
        draft.timeZoneB = value.trim();
        this.onTimeZoneChange("participantB");
        break;
      case "utcDate":
      case "utcTime":
        draft[name] = value;
        draft.activeTimeSource = "UTC";
        this.applyTimeSource("UTC");
        break;
      case "aDate":
      case "aTime":
        draft[name] = value;
        draft.activeTimeSource = "participantA";
        this.applyTimeSource("participantA");
        break;
      case "bDate":
      case "bTime":
        draft[name] = value;
        draft.activeTimeSource = "participantB";
        this.applyTimeSource("participantB");
        break;
      case "theme":
        draft.theme = value;
        this.applyTheme();
        break;
      case "renderMode":
        draft.renderMode = value;
        break;
      default:
        break;
    }

    if (name === "nameA" || name === "nameB") {
      this.dom.labelA.textContent = draft.nameA || "Participant A";
      this.dom.labelB.textContent = draft.nameB || "Participant B";
    }

    this.syncErrors();
    this.syncAmbiguityControls();
    this.highlightActiveRow();
    this.render(false);
    this.scheduleUrlUpdate();
    this.emit("onDraftChange", clone(this.draft));
  }

  handleEditChange(event) {
    this.handleEditInput(event);
  }

  onTimeZoneChange(source) {
    const draft = this.draft;
    const zone = source === "participantA" ? draft.timeZoneA : draft.timeZoneB;
    if (!isValidIanaTimeZone(zone)) {
      draft.errors[source === "participantA" ? "a" : "b"] =
        "Invalid time zone. Use an IANA zone like America/Los_Angeles.";
      return;
    }
    draft.errors[source === "participantA" ? "a" : "b"] = "";
    if (Number.isFinite(draft.canonicalMeetingMs)) {
      const local = getLocalInputFromInstant(draft.canonicalMeetingMs, zone);
      if (source === "participantA") {
        draft.aDate = local.date;
        draft.aTime = local.time;
        this.dom.fields.aDate.value = local.date;
        this.dom.fields.aTime.value = local.time;
      } else {
        draft.bDate = local.date;
        draft.bTime = local.time;
        this.dom.fields.bDate.value = local.date;
        this.dom.fields.bTime.value = local.time;
      }
    }
  }

  applyTimeSource(source) {
    const draft = this.draft;
    draft.errors.utc = "";
    draft.errors.a = "";
    draft.errors.b = "";
    draft.ambiguousOptions.participantA = null;
    draft.ambiguousOptions.participantB = null;

    let parsed;
    if (source === "UTC") {
      parsed = parseUtcFromInputs(draft.utcDate, draft.utcTime);
      if (!parsed.valid) {
        draft.errors.utc =
          parsed.reason === "invalid-date"
            ? "UTC date is invalid or incomplete."
            : "UTC time is invalid or incomplete.";
        draft.hasValidInstant = false;
        return;
      }
      draft.hasValidInstant = true;
      draft.canonicalMeetingMs = parsed.instantMs;
    } else {
      const dateValue = source === "participantA" ? draft.aDate : draft.bDate;
      const timeValue = source === "participantA" ? draft.aTime : draft.bTime;
      const zone = source === "participantA" ? draft.timeZoneA : draft.timeZoneB;
      const local = parseLocalInputs(dateValue, timeValue);
      if (!local.valid) {
        draft.errors[source === "participantA" ? "a" : "b"] =
          local.reason === "invalid-date"
            ? "Date is invalid or incomplete."
            : "Time is invalid or incomplete.";
        draft.hasValidInstant = false;
        return;
      }
      const conversion = localToUtcCandidates(local, zone, true);
      if (!conversion.valid) {
        if (conversion.reason === "invalid-timezone") {
          draft.errors[source === "participantA" ? "a" : "b"] =
            "Invalid IANA time zone.";
        } else if (conversion.reason === "nonexistent-time") {
          const suggestion = conversion.suggestion
            ? localToDateAndTime(conversion.suggestion.local)
            : null;
          draft.errors[source === "participantA" ? "a" : "b"] = suggestion
            ? `This local time does not exist (DST). Try ${suggestion.date} ${suggestion.time}.`
            : "This local time does not exist in this time zone.";
        }
        draft.hasValidInstant = false;
        return;
      }
      draft.hasValidInstant = true;
      if (conversion.ambiguous) {
        draft.ambiguousOptions[source] = conversion.candidates;
      }
      const chosenIndex = draft.ambiguousChoice[source] || 0;
      const chosen = conversion.candidates[clamp(chosenIndex, 0, conversion.candidates.length - 1)];
      draft.canonicalMeetingMs = chosen.instantMs;
    }

    this.refreshDerivedFieldsAfterCanonicalUpdate(source);
    this.debounceVisualMeetingUpdate();
  }

  refreshDerivedFieldsAfterCanonicalUpdate(source) {
    const draft = this.draft;
    const utc = getUtcInputFromInstant(draft.canonicalMeetingMs);
    if (source !== "UTC") {
      draft.utcDate = utc.date;
      draft.utcTime = utc.time;
      this.dom.fields.utcDate.value = utc.date;
      this.dom.fields.utcTime.value = utc.time;
    }

    if (isValidIanaTimeZone(draft.timeZoneA)) {
      const localA = getLocalInputFromInstant(draft.canonicalMeetingMs, draft.timeZoneA);
      if (source !== "participantA") {
        draft.aDate = localA.date;
        draft.aTime = localA.time;
        this.dom.fields.aDate.value = localA.date;
        this.dom.fields.aTime.value = localA.time;
      }
    }

    if (isValidIanaTimeZone(draft.timeZoneB)) {
      const localB = getLocalInputFromInstant(draft.canonicalMeetingMs, draft.timeZoneB);
      if (source !== "participantB") {
        draft.bDate = localB.date;
        draft.bTime = localB.time;
        this.dom.fields.bDate.value = localB.date;
        this.dom.fields.bTime.value = localB.time;
      }
    }
  }

  debounceVisualMeetingUpdate() {
    clearTimeout(this.visualDebounceId);
    this.visualDebounceId = setTimeout(() => {
      if (this.draft && this.draft.hasValidInstant) {
        this.draft.visualMeetingMs = this.draft.canonicalMeetingMs;
        this.render(false);
      }
    }, 180);
  }

  buildConfigFromDraft(commitMode) {
    const draft = this.draft;
    const merged = deepMerge(this.config, {});
    merged.meeting.title = draft.title || "Meeting";
    merged.meeting.durationMinutes = Number.isFinite(draft.duration) ? Math.max(1, Math.round(draft.duration)) : 30;
    merged.meeting.startsAt = new Date(
      commitMode ? draft.canonicalMeetingMs : draft.visualMeetingMs
    ).toISOString();
    merged.participantA.name = draft.nameA || "Participant A";
    merged.participantB.name = draft.nameB || "Participant B";
    merged.participantA.timeZone = draft.timeZoneA || "UTC";
    merged.participantB.timeZone = draft.timeZoneB || "UTC";
    merged.display.theme = draft.theme || "auto";
    merged.display.renderMode = draft.renderMode || "svg";
    return merged;
  }

  buildHash(includeEditMode) {
    const sourceConfig = this.isEditing && this.draft ? this.buildConfigFromDraft(false) : this.config;
    return serializeHash(
      sourceConfig,
      includeEditMode ? "edit" : "view",
      this.extraHashParams
    );
  }

  scheduleUrlUpdate() {
    if (!this.isEditing || !this.draft || !this.config.urlState.enabled) {
      return;
    }
    if (!this.draft.hasValidInstant) {
      return;
    }
    clearTimeout(this.urlDebounceId);
    const delay = this.config.editing.urlUpdateDebounceMs || 250;
    this.urlDebounceId = setTimeout(() => {
      const nextHash = this.buildHash(true);
      this.replaceHash(nextHash, true);
      this.emit("onUrlStateChange", nextHash);
    }, delay);
  }

  replaceHash(hash, keepScroll) {
    this.ignoreHashChange = true;
    history.replaceState(null, "", hash || "");
    if (keepScroll) {
      window.scrollTo(window.scrollX, window.scrollY);
    }
    setTimeout(() => {
      this.ignoreHashChange = false;
    }, 0);
  }

  pushHash(hash) {
    this.ignoreHashChange = true;
    history.pushState(null, "", hash || "");
    setTimeout(() => {
      this.ignoreHashChange = false;
    }, 0);
  }

  async copyLink(fromEditMode) {
    const draftValid = this.isEditing && this.draft ? this.draft.hasValidInstant : true;
    const hash =
      fromEditMode && !draftValid && this.isEditing && this.draft
        ? serializeHash(this.buildConfigFromDraft(false), "edit", this.extraHashParams)
        : this.buildHash(fromEditMode);
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      this.dom.statusLine.textContent = draftValid
        ? "Link copied"
        : "Draft is invalid. Copied last valid link.";
    } catch {
      this.dom.statusLine.textContent = "Copy failed. Use browser copy manually.";
    }
  }

  render(force) {
    const nowMs = this.getNowMs();
    if (!force && nowMs === this.lastRenderMs) {
      return;
    }
    this.lastRenderMs = nowMs;
    this.applyTheme();

    const config = this.getWorkingConfig();
    const fallbackUtcOnly = !this.supportsIntlParts;
    if (fallbackUtcOnly) {
      this.dom.statusLine.textContent = "Limited time-zone support in this browser. Showing UTC.";
    }
    const meetingMs = this.getWorkingMeetingMs();
    if (!Number.isFinite(meetingMs)) {
      this.renderConfigError("Meeting time is not configured or invalid.");
      return;
    }

    const tzA = fallbackUtcOnly ? "UTC" : config.participantA.timeZone;
    const tzB = fallbackUtcOnly ? "UTC" : config.participantB.timeZone;
    const tzAValid = isValidIanaTimeZone(tzA);
    const tzBValid = isValidIanaTimeZone(tzB);
    if (!tzAValid || !tzBValid) {
      this.dom.statusLine.textContent = !tzAValid && !tzBValid
        ? "Both participant time zones are invalid. Falling back to UTC display."
        : !tzAValid
        ? "Participant A time zone is invalid. Falling back to UTC for A."
        : "Participant B time zone is invalid. Falling back to UTC for B.";
    } else if (!this.isEditing || (this.draft && this.draft.hasValidInstant)) {
      this.dom.statusLine.textContent = this.draft && this.draft.warnings.duration ? this.draft.warnings.duration : "";
    }

    const remainingMs = meetingMs - nowMs;
    const scale = chooseScale(remainingMs);
    const progress = 1 - clamp(remainingMs / scale.windowMs, 0, 1);
    const extension = easeOutCubic(clamp(progress, 0, 1));
    const state = meetingState(remainingMs, config.animation.postMeetingHoldMinutes || 5);

    this.dom.title.textContent = config.meeting.title || "Meeting";
    this.dom.countdown.textContent = formatCountdown(remainingMs);
    this.dom.countdown.hidden = !config.display.showCountdownText;

    this.dom.nameA.textContent = config.participantA.name || "Participant A";
    this.dom.nameB.textContent = config.participantB.name || "Participant B";
    this.dom.labelA.textContent = config.participantA.name || "Participant A";
    this.dom.labelB.textContent = config.participantB.name || "Participant B";

    const primaryZone = this.resolvePrimaryZone(config, tzAValid, tzBValid, tzA, tzB);
    const zoneLabelA =
      fallbackUtcOnly || !tzAValid ? "(UTC fallback)" : config.participantA.timeZone;
    const zoneLabelB =
      fallbackUtcOnly || !tzBValid ? "(UTC fallback)" : config.participantB.timeZone;
    this.dom.primaryTime.textContent = formatInstantHuman(meetingMs, primaryZone);
    this.dom.timeUtc.textContent = config.display.showUtc
      ? `UTC: ${formatInstantHuman(meetingMs, "UTC", false)}`
      : "";
    this.dom.timeA.textContent = config.display.showParticipantLocalTimes
      ? `${config.participantA.name || "A"}: ${formatInstantHuman(
          meetingMs,
          tzAValid ? tzA : "UTC"
        )} ${zoneLabelA}`
      : "";
    this.dom.timeB.textContent = config.display.showParticipantLocalTimes
      ? `${config.participantB.name || "B"}: ${formatInstantHuman(
          meetingMs,
          tzBValid ? tzB : "UTC"
        )} ${zoneLabelB}`
      : "";
    this.dom.offsetA.textContent = tzAValid
      ? `${config.participantA.timeZone} (${formatOffsetLabel(meetingMs, tzA)})`
      : "Invalid time zone";
    this.dom.offsetB.textContent = tzBValid
      ? `${config.participantB.timeZone} (${formatOffsetLabel(meetingMs, tzB)})`
      : "Invalid time zone";

    this.renderTicks(scale.windowMs, config.display.showTimelineTicks);
    this.renderCharacters(remainingMs, scale.windowMs, extension, state, config);
    this.lastScaleKey = scale.key;
    if (this.lastMeetingState && this.lastMeetingState === "starting" && state === "past") {
      this.emit("onMeetingPastHoldEnd");
    }
    this.lastMeetingState = state;
    this.previousRemainingMs = remainingMs;
    this.renderA11ySummary(config, meetingMs, remainingMs, tzAValid, tzBValid);
    this.emit("onStateChange", {
      meetingState: state,
      remainingMs,
      meetingMs,
      progressRatio: progress,
      windowMs: scale.windowMs,
      isEditing: this.isEditing,
    });
    this.scheduleUpdates();
  }

  renderConfigError(message) {
    this.dom.title.textContent = "Meeting";
    this.dom.countdown.textContent = message;
    this.dom.statusLine.textContent = message;
  }

  resolvePrimaryZone(config, tzAValid, tzBValid, tzA, tzB) {
    switch (config.meeting.primaryTimeZone) {
      case "UTC":
        return "UTC";
      case "participantB":
        return tzBValid ? tzB : "UTC";
      case "participantA":
      default:
        return tzAValid ? tzA : "UTC";
    }
  }

  renderTicks(windowMs, enabled) {
    if (!enabled) {
      this.dom.ticks.replaceChildren();
      return;
    }
    if (this.renderedScaleKey === String(windowMs)) {
      return;
    }
    this.renderedScaleKey = String(windowMs);
    const labels = buildTickLabels(windowMs);
    const fragment = document.createDocumentFragment();
    for (const label of labels) {
      const div = document.createElement("div");
      div.className = "tick";
      div.textContent = label;
      fragment.appendChild(div);
    }
    this.dom.ticks.replaceChildren(fragment);
  }

  renderCharacters(remainingMs, windowMs, extension, state, config) {
    const ratio = clamp(remainingMs / windowMs, 0, 1);
    const trackWidth = this.dom.track.clientWidth;
    const maxOffset = trackWidth * 0.42;
    const xA = -ratio * maxOffset;
    const xB = ratio * maxOffset;
    const currentScale = chooseScale(remainingMs);
    const transitionMs = currentScale.continuous || this.usesReducedMotion()
      ? 120
      : currentScale.key !== this.lastScaleKey
      ? 900
      : 500;

    this.dom.participantA.style.left = `calc(50% + ${xA}px)`;
    this.dom.participantB.style.left = `calc(50% + ${xB}px)`;
    this.dom.participantA.style.transitionDuration = `${transitionMs}ms`;
    this.dom.participantB.style.transitionDuration = `${transitionMs}ms`;

    const handNearScale = state === "starting" || state === "past" ? 1.45 : 0.54 + extension * 0.62;
    const handFarScale = 0.5 + extension * 0.2;
    const nearLeft = this.dom.participantA.querySelector(".arm.near");
    const farLeft = this.dom.participantA.querySelector(".arm.far");
    const nearRight = this.dom.participantB.querySelector(".arm.near");
    const farRight = this.dom.participantB.querySelector(".arm.far");

    nearLeft.style.transform = `rotate(${state === "starting" || state === "past" ? "-2deg" : "-8deg"}) scaleX(${handNearScale})`;
    nearRight.style.transform = `rotate(${state === "starting" || state === "past" ? "2deg" : "8deg"}) scaleX(${handNearScale})`;
    farLeft.style.transform = `rotate(10deg) scaleX(${handFarScale})`;
    farRight.style.transform = `rotate(-10deg) scaleX(${handFarScale})`;

    if (this.previousRemainingMs > 0 && remainingMs <= 0) {
      this.triggerHandshake();
    }

    const spriteMode = config.display.renderMode === "sprite";
    this.dom.participantA.classList.toggle("sprite-mode", spriteMode);
    this.dom.participantB.classList.toggle("sprite-mode", spriteMode);
    if (spriteMode) {
      const progressRatio = clamp(1 - ratio, 0, 1);
      const frameA = this.pickSpriteFrame(SPRITE_A, progressRatio, state);
      const frameB = this.pickSpriteFrame(SPRITE_B, progressRatio, state);
      this.dom.participantA.querySelector(".sprite-layer").style.backgroundImage = `url("${frameA}")`;
      this.dom.participantB.querySelector(".sprite-layer").style.backgroundImage = `url("${frameB}")`;
    }
  }

  triggerHandshake() {
    clearTimeout(this.handshakeTimerId);
    this.dom.participantA.classList.add("handshake");
    this.dom.participantB.classList.add("handshake");
    this.emit("onMeetingStart");
    this.handshakeTimerId = setTimeout(() => {
      this.dom.participantA.classList.remove("handshake");
      this.dom.participantB.classList.remove("handshake");
    }, 1000);
  }

  pickSpriteFrame(frames, progressRatio, state) {
    if (!frames.length) {
      return "";
    }
    if (state === "starting" || state === "past") {
      return frames[frames.length - 1];
    }
    const idx = clamp(Math.round(progressRatio * (frames.length - 1)), 0, frames.length - 1);
    return frames[idx];
  }

  renderA11ySummary(config, meetingMs, remainingMs, tzAValid, tzBValid) {
    const summary = `Meeting between ${config.participantA.name} and ${
      config.participantB.name
    }. ${formatCountdown(remainingMs)}. ${config.participantA.name} local time is ${formatInstantHuman(
      meetingMs,
      tzAValid ? config.participantA.timeZone : "UTC"
    )}. ${config.participantB.name} local time is ${formatInstantHuman(
      meetingMs,
      tzBValid ? config.participantB.timeZone : "UTC"
    )}. UTC time is ${formatInstantHuman(meetingMs, "UTC", false)}.`;
    this.dom.summary.textContent = summary;
  }

  scheduleUpdates() {
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.timerId);

    const config = this.getWorkingConfig();
    if (!config.animation.enabled) {
      return;
    }
    if (config.clock.now) {
      return;
    }

    const remainingMs = this.getWorkingMeetingMs() - Date.now();
    const scale = chooseScale(remainingMs);
    const continuous = scale.continuous && !this.usesReducedMotion();

    if (continuous) {
      const frame = () => {
        this.render(false);
        this.rafId = requestAnimationFrame(frame);
      };
      this.rafId = requestAnimationFrame(frame);
    } else {
      this.timerId = setTimeout(() => this.render(false), scale.updateMs);
    }
  }
}

function boot() {
  const app = new MeetingTimelineApp();
  const externalConfig = window.MEETING_TIMELINE_CONFIG;
  if (externalConfig && typeof externalConfig === "object") {
    app.applyPatch(externalConfig);
  }
  const externalCallbacks = window.MEETING_TIMELINE_CALLBACKS;
  if (externalCallbacks && typeof externalCallbacks === "object") {
    app.callbacks = externalCallbacks;
  }
  app.init();
  window.MeetingTimeline = {
    getState() {
      return {
        config: app.getWorkingConfig(),
        meetingMs: app.getWorkingMeetingMs(),
        isEditing: app.isEditing,
      };
    },
    setConfig(patch) {
      app.applyPatch(patch);
      app.applyTheme();
      app.render(true);
    },
    setCallbacks(callbacks) {
      app.callbacks = callbacks && typeof callbacks === "object" ? callbacks : {};
    },
    enterEdit() {
      app.enterEditing();
    },
    cancelEdit() {
      app.cancelEditing();
    },
    saveEdit() {
      app.saveEditing();
    },
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
