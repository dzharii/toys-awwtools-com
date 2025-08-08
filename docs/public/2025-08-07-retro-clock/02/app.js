"use strict";

/* ================================
   Retro Multi-Time-Zone Clock — Enhanced
   Vanilla JS + HTML + CSS
   ================================ */

/* ---------- 5. Configuration (fixed offsets) ---------- */
const CLOCKS = [
  { id: "local",  name: "Local",        offsetMinutes: 0,    accent: "green",  work: { start: 9*60,  end: 17*60 } },
  { id: "nyc",    name: "New York",     offsetMinutes: -240, accent: "green",  work: { start: 9*60,  end: 17*60 } },
  { id: "lon",    name: "London",       offsetMinutes: 0,    accent: "orange", work: { start: 9*60,  end: 17*60 } },
  { id: "tko",    name: "Tokyo",        offsetMinutes: 540,  accent: "green",  work: { start: 9*60,  end: 18*60 } },
  { id: "syd",    name: "Sydney",       offsetMinutes: 600,  accent: "orange", work: { start: 9*60,  end: 17*60 } },
  { id: "del",    name: "Delhi",        offsetMinutes: 330,  accent: "green",  work: { start: 9*60,  end: 18*60 } }
];
// Note: Offsets are relative to UTC; integer minutes (±). Half-hour and 45-minute zones supported.

/* ---------- 9. State ---------- */
const state = {
  mode: "realtime",            // "realtime" | "adjusted"
  deltaMinutes: 0,             // signed minutes (global)
  baseNow: new Date(),         // base seconds tick (device now)
  timerId: null,               // current timer handle (setTimeout)
  copyStatus: null,            // last clipboard action success flag
  use12h: false,               // 12-hour format flag
  isScrubbing: false,          // for slider haptics
  orderIds: CLOCKS.map(c => c.id), // display order (hash-persisted)
  visibleIds: new Set(CLOCKS.map(c => c.id)), // working set (hash-persisted)
  rowNudges: new Map(),        // per-row temp nudges in minutes
  paletteHC: false,            // color-blind palette
  dense: false,                // compact layout
  plannerVisible: false,       // meeting planner strip visibility
  kiosk: false,                // kiosk mode (toolbar hidden)
  lastRenderedSecond: null     // perf guard
};

/* ---------- Internal refs ---------- */
const refs = {
  toolbar: null,
  modeIndicator: null,
  deltaRange: null,
  deltaNumber: null,
  resetBtn: null,
  copyMenuBtn: null,
  copyMenu: null,
  h12: null,
  densityBtn: null,
  paletteBtn: null,
  plannerBtn: null,
  fullscreenBtn: null,
  exportBtn: null,
  filterBtn: null,
  filterMenu: null,
  jumpInput: null,
  jumpBtn: null,
  helpBtn: null,
  grid: null,
  planner: null,
  toast: null,
  helpModal: null,
  helpClose: null,
  helpClose2: null,
  kioskHint: null,
  kioskEnter: null
};

const rowRefs = new Map();  // id -> { root, face, timeEl, dateEl, badgeEl, dayChip, secRing, lastTime, lastDate, lastBadge, lastDayChip, lastWorkClass }
const plannerRefs = new Map(); // id -> { row, band }

/* ---------- 14. Formatting helpers ---------- */
const pad2 = n => String(n).padStart(2, "0");

function fmtTime(d, use12h = false) {
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const s = d.getUTCSeconds();
  if (use12h) {
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)} ${ampm}`;
  }
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function fmtDate(d) {
  const y = d.getUTCFullYear();
  const mo = d.getUTCMonth() + 1;
  const da = d.getUTCDate();
  return `${y}-${pad2(mo)}-${pad2(da)}`;
}

/* ---------- 11. Time math ---------- */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function computeDisplay(nowBase, deltaMin, offsetMin, nudgeMin = 0) {
  return addMinutes(nowBase, deltaMin + offsetMin + nudgeMin);
}

/* ---------- Helpers ---------- */
function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

function formatSignedHHMM(totalMinutes) {
  const sign = totalMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${pad2(h)}:${pad2(m)}`;
}

function minutesOfDayUTC(d) {
  // Minutes since 00:00 in UTC terms
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

function localYMD(d) {
  // Return device-local yyyy-mm-dd string for comparing device day
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const da = d.getDate();
  return `${y}-${pad2(m)}-${pad2(da)}`;
}

/* ---------- Clipboard ---------- */
function makeLine(name, d, use12h) {
  const iso = d.toISOString().replace(".000Z", "Z");
  const human = `${fmtDate(d)} ${fmtTime(d, use12h)}`;
  return `${name}\t${human}\t${iso}`;
}

async function writeClipboard(text) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      state.copyStatus = true;
      showToast("Copied to clipboard");
      return true;
    }
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    state.copyStatus = ok;
    showToast(ok ? "Copied to clipboard" : "Copy failed");
    return ok;
  } catch (err) {
    console.error("Clipboard write error:", err);
    state.copyStatus = false;
    showToast("Copy failed");
    return false;
  }
}

/* ---------- 31. Minimal + Enhanced Functions ---------- */

function init() {
  // Validate config
  for (const c of CLOCKS) {
    if (!Number.isInteger(c.offsetMinutes)) {
      console.error(`Invalid offsetMinutes for "${c.id}" (${c.name}):`, c.offsetMinutes);
      return;
    }
    if (c.offsetMinutes < -1440 || c.offsetMinutes > 1440) {
      console.error(`offsetMinutes out of range [-1440,1440] for "${c.id}" (${c.name}):`, c.offsetMinutes);
      return;
    }
  }

  // Cache DOM
  refs.toolbar = document.getElementById("toolbar");
  refs.modeIndicator = document.getElementById("modeIndicator");
  refs.deltaRange = document.getElementById("deltaRange");
  refs.deltaNumber = document.getElementById("deltaNumber");
  refs.resetBtn = document.getElementById("resetBtn");
  refs.copyMenuBtn = document.getElementById("copyMenuBtn");
  refs.copyMenu = document.getElementById("copyMenu");
  refs.h12 = document.getElementById("h12");
  refs.densityBtn = document.getElementById("densityBtn");
  refs.paletteBtn = document.getElementById("paletteBtn");
  refs.plannerBtn = document.getElementById("plannerBtn");
  refs.fullscreenBtn = document.getElementById("fullscreenBtn");
  refs.exportBtn = document.getElementById("exportBtn");
  refs.filterBtn = document.getElementById("filterBtn");
  refs.filterMenu = document.getElementById("filterMenu");
  refs.jumpInput = document.getElementById("jumpInput");
  refs.jumpBtn = document.getElementById("jumpBtn");
  refs.helpBtn = document.getElementById("helpBtn");
  refs.grid = document.getElementById("grid");
  refs.planner = document.getElementById("planner");
  refs.toast = document.getElementById("toast");
  refs.helpModal = document.getElementById("helpModal");
  refs.helpClose = document.getElementById("helpClose");
  refs.helpClose2 = document.getElementById("helpClose2");
  refs.kioskHint = document.getElementById("kioskHint");
  refs.kioskEnter = document.getElementById("kioskEnter");

  parseHash();      // may set delta, 12h, order, ids, density, palette, planner, kiosk
  buildUI();        // wire events & reflect state
  buildGrid();      // create clock rows
  buildPlanner();   // create planner rows
  startTick();      // drift-correct loop
  updateAllUIState();
}

function buildUI() {
  // Reflect state into controls
  refs.deltaRange.value = String(state.deltaMinutes);
  refs.deltaNumber.value = String(state.deltaMinutes);
  refs.h12.checked = !!state.use12h;
  refs.h12.setAttribute("aria-pressed", String(!!state.use12h));
  refs.densityBtn.setAttribute("aria-pressed", String(!!state.dense));
  refs.paletteBtn.setAttribute("aria-pressed", String(!!state.paletteHC));
  refs.plannerBtn.setAttribute("aria-pressed", String(!!state.plannerVisible));

  // Range & Number sync + haptics
  const onDeltaChange = v => {
    const num = clamp(Number(v), -1440, 1440) | 0;
    if (num !== state.deltaMinutes) {
      // Haptics on 15-min steps and zero
      if (window.navigator.vibrate) {
        if (num === 0 || num % 15 === 0) navigator.vibrate(5);
      }
    }
    updateDelta(num);
    refs.deltaRange.value = String(num);
    refs.deltaNumber.value = String(num);
    updateHash();
  };
  refs.deltaRange.addEventListener("input", e => onDeltaChange(e.target.value));
  refs.deltaNumber.addEventListener("input", e => onDeltaChange(e.target.value));
  refs.deltaNumber.addEventListener("blur", () => {
    const num = clamp(Number(refs.deltaNumber.value) || 0, -1440, 1440) | 0;
    refs.deltaNumber.value = String(num);
    refs.deltaRange.value = String(num);
    onDeltaChange(num);
  });
  // Keyboard for range
  refs.deltaRange.addEventListener("keydown", e => {
    let handled = true;
    let v = Number(refs.deltaRange.value) | 0;
    if (e.key === "ArrowLeft") v -= 1;
    else if (e.key === "ArrowRight") v += 1;
    else if (e.key === "PageUp") v += 15;
    else if (e.key === "PageDown") v -= 15;
    else if (e.key === "Home") v = 0;
    else if (e.key === "End") v = (v >= 0 ? 1440 : -1440);
    else handled = false;
    if (handled) {
      e.preventDefault();
      v = clamp(v, -1440, 1440) | 0;
      refs.deltaRange.value = String(v);
      refs.deltaNumber.value = String(v);
      onDeltaChange(v);
    }
  });
  // Pointer behaviors
  refs.deltaRange.addEventListener("pointerdown", e => { state.isScrubbing = true; refs.deltaRange.setPointerCapture?.(e.pointerId); });
  refs.deltaRange.addEventListener("pointerup",   e => { state.isScrubbing = false; refs.deltaRange.releasePointerCapture?.(e.pointerId); });
  refs.deltaRange.addEventListener("touchstart", e => { e.preventDefault(); }, { passive: false });

  // Reset
  refs.resetBtn.addEventListener("click", () => {
    refs.deltaRange.value = "0";
    refs.deltaNumber.value = "0";
    updateDelta(0);
    updateHash();
  });

  // 12h toggle
  refs.h12.addEventListener("change", () => {
    state.use12h = refs.h12.checked;
    refs.h12.setAttribute("aria-pressed", String(state.use12h));
    updateHash();
    renderAll();
  });

  // Density
  refs.densityBtn.addEventListener("click", () => {
    state.dense = !state.dense;
    document.body.classList.toggle("dense", state.dense);
    refs.densityBtn.setAttribute("aria-pressed", String(state.dense));
    updateHash();
  });

  // Palette
  refs.paletteBtn.addEventListener("click", () => {
    state.paletteHC = !state.paletteHC;
    document.body.classList.toggle("palette-hc", state.paletteHC);
    refs.paletteBtn.setAttribute("aria-pressed", String(state.paletteHC));
    updateHash();
  });

  // Planner toggle
  refs.plannerBtn.addEventListener("click", () => {
    state.plannerVisible = !state.plannerVisible;
    refs.planner.hidden = !state.plannerVisible;
    refs.plannerBtn.setAttribute("aria-pressed", String(state.plannerVisible));
    updateHash();
  });

  // Fullscreen
  refs.fullscreenBtn.addEventListener("click", toggleFullscreen);

  // Export PNG
  refs.exportBtn.addEventListener("click", exportPNG);

  // Copy menu
  setupCopyMenu();

  // Filter menu
  setupFilterMenu();

  // Jump to time
  refs.jumpBtn.addEventListener("click", handleJump);
  refs.jumpInput.addEventListener("keydown", e => { if (e.key === "Enter") handleJump(); });

  // Help modal
  refs.helpBtn.addEventListener("click", openHelp);
  refs.helpClose.addEventListener("click", closeHelp);
  refs.helpClose2.addEventListener("click", closeHelp);
  refs.helpModal.addEventListener("keydown", e => { if (e.key === "Escape") closeHelp(); });

  // Global keyboard shortcuts
  window.addEventListener("keydown", globalShortcuts);

  // Visibility-aware ticking
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Kiosk hint
  if (state.kiosk) {
    document.body.classList.add("kiosk");
    refs.kioskHint.hidden = false;
    refs.kioskEnter.addEventListener("click", () => {
      requestFullscreenSafe();
      refs.kioskHint.hidden = true;
    });
    // Click anywhere to enter
    document.body.addEventListener("click", () => {
      if (!document.fullscreenElement) requestFullscreenSafe();
    }, { once: true });
  }
}

function buildGrid() {
  refs.grid.innerHTML = "";
  for (const id of state.orderIds) {
    const c = CLOCKS.find(x => x.id === id);
    if (!c) continue;
    const row = createRow(c);
    refs.grid.appendChild(row.root);
    rowRefs.set(c.id, row);
  }
  applyVisibilityToGrid();
}

function buildPlanner() {
  plannerRefs.clear();
  refs.planner.innerHTML = "";
  for (const id of state.orderIds) {
    const c = CLOCKS.find(x => x.id === id);
    if (!c) continue;
    const row = document.createElement("div");
    row.className = "plannerRow";
    row.dataset.id = id;

    const label = document.createElement("div");
    label.className = "plannerLabel";
    label.textContent = c.name;

    const band = document.createElement("div");
    band.className = "plannerBand" + (c.accent === "orange" ? " orange" : "");
    // Working hours band positions via CSS vars
    const startPct = ((c.work?.start ?? 9*60) / 1440) * 100;
    const endPct = ((c.work?.end ?? 17*60) / 1440) * 100;
    band.style.setProperty("--work-start", `${startPct}%`);
    band.style.setProperty("--work-end", `${endPct}%`);

    const marker = document.createElement("div");
    marker.className = "plannerMarker";
    band.appendChild(marker);

    row.appendChild(label);
    row.appendChild(band);
    plannerRefs.set(id, { row, band, marker });
    refs.planner.appendChild(row);
  }
  refs.planner.hidden = !state.plannerVisible;
}

function createRow(c) {
  const root = document.createElement("section");
  root.className = "clockRow";
  root.setAttribute("role", "listitem");
  root.dataset.id = c.id;
  root.draggable = true;

  // Drag reorder handlers
  root.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", c.id);
    root.classList.add("dragging");
  });
  root.addEventListener("dragend", () => root.classList.remove("dragging"));
  root.addEventListener("dragover", e => { e.preventDefault(); root.classList.add("dropTarget"); });
  root.addEventListener("dragleave", () => root.classList.remove("dropTarget"));
  root.addEventListener("drop", e => {
    e.preventDefault();
    root.classList.remove("dropTarget");
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === c.id) return;
    reorderRows(draggedId, c.id);
  });

  const face = document.createElement("div");
  face.className = "clockFace" + (c.accent === "orange" ? " orange" : "");

  const headerLine = document.createElement("div");
  headerLine.className = "headerLine";

  const timeEl = document.createElement("div");
  timeEl.className = "time";

  const secRing = document.createElement("span");
  secRing.className = "secRing";
  secRing.setAttribute("aria-hidden", "true");

  const timeText = document.createElement("span");
  timeText.className = "timeText";

  timeEl.appendChild(secRing);
  timeEl.appendChild(timeText);

  const dayChip = document.createElement("span");
  dayChip.className = "dayChip";
  dayChip.textContent = "Today";

  headerLine.appendChild(timeEl);
  headerLine.appendChild(dayChip);

  const dateEl = document.createElement("div");
  dateEl.className = "date";

  const badgeEl = document.createElement("span");
  badgeEl.className = "statusBadge badgeRealtime";
  badgeEl.textContent = "Realtime";

  face.appendChild(headerLine);
  face.appendChild(dateEl);
  face.appendChild(badgeEl);

  const right = document.createElement("div");
  right.className = "clockName";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = c.name;

  const actions = document.createElement("div");
  actions.className = "actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copyBtn";
  copyBtn.type = "button";
  copyBtn.textContent = "Copy";
  copyBtn.setAttribute("aria-label", `Copy time for ${c.name}`);
  copyBtn.addEventListener("click", () => copySingle(c.id));

  const nudgeMinus = document.createElement("button");
  nudgeMinus.className = "nudgeBtn";
  nudgeMinus.textContent = "−30m";
  nudgeMinus.title = "Temporary nudge −30 minutes";
  nudgeMinus.addEventListener("click", () => adjustNudge(c.id, -30));

  const nudgeReset = document.createElement("button");
  nudgeReset.className = "nudgeBtn";
  nudgeReset.textContent = "Reset";
  nudgeReset.title = "Reset temporary nudge";
  nudgeReset.addEventListener("click", () => setNudge(c.id, 0));

  const nudgePlus = document.createElement("button");
  nudgePlus.className = "nudgeBtn";
  nudgePlus.textContent = "+30m";
  nudgePlus.title = "Temporary nudge +30 minutes";
  nudgePlus.addEventListener("click", () => adjustNudge(c.id, +30));

  actions.appendChild(copyBtn);
  actions.appendChild(nudgeMinus);
  actions.appendChild(nudgeReset);
  actions.appendChild(nudgePlus);

  const nudgeInfo = document.createElement("span");
  nudgeInfo.className = "nudgeInfo";
  nudgeInfo.textContent = "";

  right.appendChild(label);
  right.appendChild(actions);
  right.appendChild(nudgeInfo);

  root.appendChild(face);
  root.appendChild(right);

  return {
    root, face, timeEl: timeText, dateEl, badgeEl, dayChip, secRing,
    nudgeInfo,
    lastTime: "", lastDate: "", lastBadge: "", lastDayChip: "", lastWorkClass: ""
  };
}

/* ---------- 12. Drift-corrected Rendering loop ---------- */
function startTick() {
  scheduleNextTick();
}

function scheduleNextTick() {
  const now = Date.now();
  const delay = 1000 - (now % 1000);
  state.timerId = window.setTimeout(tick, delay);
}

function tick() {
  state.baseNow = new Date();
  const sec = Math.floor(state.baseNow.getTime() / 1000);
  if (state.lastRenderedSecond !== sec) {
    renderAll();
    state.lastRenderedSecond = sec;
  }
  if (!document.hidden) scheduleNextTick(); // Save CPU while hidden; reschedule on visibilitychange
}

function handleVisibilityChange() {
  if (!document.hidden) {
    // Resync immediately on visible
    clearTimeout(state.timerId);
    tick();
  }
}

/* ---------- 13. DOM rendering ---------- */
function renderAll() {
  const orderedIds = state.orderIds;
  for (const id of orderedIds) {
    const c = CLOCKS.find(x => x.id === id);
    if (!c) continue;
    renderRow(c);
    updatePlannerRow(c);
  }
  updateModeIndicator();
}

function renderRow(c) {
  const row = rowRefs.get(c.id);
  if (!row) return;

  const nudge = state.rowNudges.get(c.id) || 0;
  const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes, nudge);

  const timeStr = fmtTime(d, state.use12h);
  const dateStr = fmtDate(d);
  const badgeStr = state.mode === "adjusted" ? "Adjusted" : "Realtime";
  const badgeClass = state.mode === "adjusted" ? "statusBadge badgeAdjusted" : "statusBadge badgeRealtime";

  if (row.lastTime !== timeStr) {
    row.timeEl.textContent = timeStr;
    row.lastTime = timeStr;
  }
  if (row.lastDate !== dateStr) {
    row.dateEl.textContent = dateStr;
    row.lastDate = dateStr;
  }
  if (row.lastBadge !== badgeStr) {
    row.badgeEl.textContent = badgeStr;
    row.badgeEl.className = badgeClass;
    row.lastBadge = badgeStr;
  }

  // Day chip relative to device local day
  const devYMDNow = localYMD(new Date());
  const devYMDTarget = localYMD(d);
  let chip = "Today";
  if (devYMDTarget !== devYMDNow) {
    // compute difference in days by comparing midnight times
    const midnightNow = new Date(); midnightNow.setHours(0,0,0,0);
    const midnightTarget = new Date(d); midnightTarget.setHours(0,0,0,0);
    const diffDays = Math.round((midnightTarget - midnightNow) / 86400000);
    chip = diffDays < 0 ? "Yesterday" : (diffDays > 0 ? "Tomorrow" : "Today");
  }
  if (row.lastDayChip !== chip) {
    row.dayChip.textContent = chip;
    row.lastDayChip = chip;
  }

  // Business-hours shading class
  const minOfDay = minutesOfDayUTC(d); // UTC minutes *for that adjusted moment*
  // Convert to local-of-row by adding its UTC offset (already applied in d!), so we can just read UTCHours/UTCMinutes.
  const localMin = (d.getUTCHours()*60 + d.getUTCMinutes()); // since d already includes offset
  const start = (c.work?.start ?? 9*60);
  const end   = (c.work?.end ?? 17*60);
  const inWork = localMin >= start && localMin < end;
  const workClass = inWork ? "inWork" : "";
  if (row.lastWorkClass !== workClass) {
    row.face.classList.toggle("inWork", inWork);
    row.lastWorkClass = workClass;
  }

  // Seconds ring: set degrees (sec/60 * 360)
  const s = d.getUTCSeconds();
  const deg = (s / 60) * 360;
  row.secRing.style.setProperty("--sec", String(deg));

  // Nudge info
  row.nudgeInfo.textContent = nudge ? `Nudged ${formatSignedHHMM(nudge)}` : "";
}

function updatePlannerRow(c) {
  const ref = plannerRefs.get(c.id);
  if (!ref) return;
  const nudge = state.rowNudges.get(c.id) || 0;
  const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes, nudge);
  const mins = (d.getUTCHours() * 60 + d.getUTCMinutes());
  const pct = (mins / 1440) * 100;
  ref.marker.style.left = `${pct}%`;
}

function updateModeIndicator() {
  const el = refs.modeIndicator;
  if (!el) return;
  if (state.mode === "realtime") {
    el.textContent = "Realtime";
    el.classList.remove("modeAdjusted");
    el.classList.add("modeRealtime");
  } else {
    el.textContent = `Adjusted ${formatSignedHHMM(state.deltaMinutes)}`;
    el.classList.remove("modeRealtime");
    el.classList.add("modeAdjusted");
  }
}

/* ---------- Delta & Hash ---------- */
function updateDelta(v) {
  state.deltaMinutes = v | 0;
  state.mode = v === 0 ? "realtime" : "adjusted";
  updateModeIndicator();
  renderAll();
}

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  const params = new URLSearchParams(hash);

  const dStr = params.get("d");
  const hStr = params.get("h");
  const zStr = params.get("z");
  const pStr = params.get("p");
  const orderStr = params.get("order");
  const idsStr = params.get("ids");
  const kioskStr = params.get("kiosk");
  const plannerStr = params.get("pl");

  if (dStr !== null) {
    const n = Number(dStr);
    if (Number.isFinite(n)) {
      state.deltaMinutes = clamp(Math.trunc(n), -1440, 1440);
      state.mode = state.deltaMinutes === 0 ? "realtime" : "adjusted";
    }
  }
  if (hStr !== null) state.use12h = (hStr === "12" || hStr === "true" || hStr === "1");
  if (zStr !== null) state.dense = (zStr === "dense" || zStr === "1" || zStr === "true");
  if (pStr !== null) state.paletteHC = (pStr === "hc" || pStr === "1" || pStr === "true");
  if (plannerStr !== null) state.plannerVisible = (plannerStr === "1" || plannerStr === "true");
  if (kioskStr !== null) state.kiosk = (kioskStr === "1" || kioskStr === "true");
  if (orderStr) {
    const ids = orderStr.split(",").filter(Boolean);
    const known = new Set(CLOCKS.map(c => c.id));
    const sanitized = ids.filter(id => known.has(id));
    const missing = CLOCKS.map(c => c.id).filter(id => !sanitized.includes(id));
    state.orderIds = [...sanitized, ...missing];
  }
  if (idsStr) {
    const ids = idsStr.split(",").filter(Boolean);
    const known = new Set(CLOCKS.map(c => c.id));
    state.visibleIds = new Set(ids.filter(id => known.has(id)));
    if (state.visibleIds.size === 0) {
      // safety: always show at least one
      state.visibleIds = new Set(CLOCKS.map(c => c.id));
    }
  }
}

function updateHash() {
  const params = new URLSearchParams();
  params.set("d", String(state.deltaMinutes | 0));
  if (state.use12h) params.set("h", "12");
  if (state.dense) params.set("z", "dense");
  if (state.paletteHC) params.set("p", "hc");
  if (state.plannerVisible) params.set("pl", "1");
  if (state.kiosk) params.set("kiosk", "1");
  // Persist order if not default
  const defaultOrder = CLOCKS.map(c => c.id).join(",");
  const currentOrder = state.orderIds.join(",");
  if (currentOrder !== defaultOrder) params.set("order", currentOrder);
  // Persist visible ids if not all
  if (state.visibleIds.size !== CLOCKS.length) {
    params.set("ids", Array.from(state.visibleIds).join(","));
  }
  const newHash = `#${params.toString()}`;
  try {
    history.replaceState(null, "", newHash);
  } catch {
    window.location.hash = newHash;
  }
}

function updateAllUIState() {
  document.body.classList.toggle("dense", state.dense);
  document.body.classList.toggle("palette-hc", state.paletteHC);
  document.body.classList.toggle("kiosk", state.kiosk);
  refs.planner.hidden = !state.plannerVisible;
  updateModeIndicator();
  renderAll();
}

/* ---------- Copy actions ---------- */
async function copySingle(id) {
  const c = CLOCKS.find(x => x.id === id);
  if (!c) return;
  const nudge = state.rowNudges.get(id) || 0;
  const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes, nudge);
  const line = makeLine(c.name, d, state.use12h);
  await writeClipboard(line);
}

function setupCopyMenu() {
  const btn = refs.copyMenuBtn;
  const menu = refs.copyMenu;

  function close() {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.focus();
  }
  function open() {
    const rect = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.left = `${Math.round(rect.left)}px`;
    menu.style.top = `${Math.round(rect.bottom + 6)}px`;
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }

  btn.addEventListener("click", () => {
    if (menu.hidden) open(); else close();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !menu.hidden) { e.preventDefault(); close(); }
  });
  document.addEventListener("click", e => {
    if (menu.hidden) return;
    if (!menu.contains(e.target) && e.target !== btn) close();
  });

  // Menu item clicks
  menu.querySelectorAll('button[role="menuitem"]').forEach(b => {
    b.addEventListener("click", async () => {
      const format = b.dataset.format;
      const scope = menu.querySelector('input[name="copyScope"]:checked')?.value || "all";
      const ids = scope === "visible" ? Array.from(state.visibleIds) : state.orderIds.slice();
      const lines = ids.map(id => {
        const c = CLOCKS.find(x => x.id === id);
        const nudge = state.rowNudges.get(id) || 0;
        const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes, nudge);
        return { name: c.name, d };
      });
      let text = "";
      if (format === "tsv") {
        text = lines.map(x => makeLine(x.name, x.d, state.use12h)).join("\n");
      } else if (format === "csv") {
        text = "Name,Date Time,ISO8601\n" + lines.map(x => {
          const human = `${fmtDate(x.d)} ${fmtTime(x.d, state.use12h)}`;
          const iso = x.d.toISOString().replace(".000Z", "Z");
          return `"${x.name.replace(/"/g,'""')}","${human}","${iso}"`;
        }).join("\n");
      } else if (format === "md") {
        const rows = lines.map(x => {
          const human = `${fmtDate(x.d)} ${fmtTime(x.d, state.use12h)}`;
          const iso = x.d.toISOString().replace(".000Z", "Z");
          return `| ${x.name} | ${human} | \`${iso}\` |`;
        }).join("\n");
        text = `| Name | Date Time | ISO8601 |\n|---|---|---|\n${rows}\n`;
      } else {
        text = lines.map(x => `${x.name}: ${fmtDate(x.d)} ${fmtTime(x.d, state.use12h)} (${x.d.toISOString().replace(".000Z","Z")})`).join("\n");
      }
      await writeClipboard(text);
      showToast(`Copied ${lines.length} line${lines.length!==1?"s":""}`);
      close();
    });
  });
}

/* ---------- Filter menu (visibility) ---------- */
function setupFilterMenu() {
  const btn = refs.filterBtn;
  const menu = refs.filterMenu;

  function rebuildItems() {
    menu.innerHTML = `<div class="menuHeader">Visible clocks</div>`;
    for (const c of CLOCKS) {
      const id = `vis-${c.id}`;
      const wrap = document.createElement("label");
      wrap.className = "menuCheck";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = id;
      cb.checked = state.visibleIds.has(c.id);
      cb.addEventListener("change", () => {
        if (cb.checked) state.visibleIds.add(c.id); else state.visibleIds.delete(c.id);
        if (state.visibleIds.size === 0) { // ensure at least 1
          state.visibleIds.add(c.id);
          cb.checked = true;
        }
        applyVisibilityToGrid();
        updateHash();
      });
      wrap.appendChild(cb);
      const lbl = document.createElement("span");
      lbl.textContent = c.name;
      wrap.appendChild(lbl);
      menu.appendChild(wrap);
    }
  }

  function close() {
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.focus();
  }
  function open() {
    rebuildItems();
    const rect = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.left = `${Math.round(rect.left)}px`;
    menu.style.top = `${Math.round(rect.bottom + 6)}px`;
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }

  btn.addEventListener("click", () => { if (menu.hidden) open(); else close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { e.preventDefault(); close(); } });
  document.addEventListener("click", e => {
    if (menu.hidden) return;
    if (!menu.contains(e.target) && e.target !== btn) close();
  });
}

function applyVisibilityToGrid() {
  for (const [id, row] of rowRefs.entries()) {
    const visible = state.visibleIds.has(id);
    row.root.style.display = visible ? "" : "none";
    const pref = plannerRefs.get(id);
    if (pref) pref.row.style.display = visible ? "" : "none";
  }
}

/* ---------- Reordering ---------- */
function reorderRows(dragId, dropId) {
  const from = state.orderIds.indexOf(dragId);
  const to = state.orderIds.indexOf(dropId);
  if (from === -1 || to === -1 || from === to) return;
  const arr = state.orderIds.slice();
  arr.splice(to, 0, arr.splice(from, 1)[0]);
  state.orderIds = arr;
  // Rebuild grid DOM to reflect new order
  buildGrid();
  buildPlanner();
  renderAll();
  updateHash();
}

/* ---------- Per-row nudge ---------- */
function setNudge(id, minutes) {
  if (minutes === 0) state.rowNudges.delete(id); else state.rowNudges.set(id, minutes);
  renderAll();
}
function adjustNudge(id, delta) {
  const cur = state.rowNudges.get(id) || 0;
  setNudge(id, clamp(cur + delta, -720, 720));
}

/* ---------- Jump to time ---------- */
function handleJump() {
  const s = refs.jumpInput.value.trim();
  // Expect "YYYY-MM-DD HH:MM" in device local time
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!m) {
    showToast("Invalid format. Use YYYY-MM-DD HH:MM (device local)");
    refs.jumpInput.focus();
    return;
  }
  const [_, y, mo, da, hh, mm] = m;
  const targetLocal = new Date(Number(y), Number(mo)-1, Number(da), Number(hh), Number(mm), 0, 0);
  if (isNaN(targetLocal.getTime())) {
    showToast("Invalid date/time");
    refs.jumpInput.focus();
    return;
  }
  // Convert to UTC by using getTime(); device local is embedded
  const nowUTC = Date.now();
  const targetUTC = targetLocal.getTime();
  const deltaMin = Math.round((targetUTC - nowUTC) / 60000);
  updateDelta(clamp(deltaMin, -1440, 1440));
  refs.deltaRange.value = String(state.deltaMinutes);
  refs.deltaNumber.value = String(state.deltaMinutes);
  updateHash();
}

/* ---------- Help Modal ---------- */
function openHelp() {
  refs.helpModal.hidden = false;
  // focus the modal body for scroll
  const body = refs.helpModal.querySelector(".modalBody");
  body.focus();
}
function closeHelp() {
  refs.helpModal.hidden = true;
  refs.helpBtn.focus();
}

/* ---------- Fullscreen ---------- */
function requestFullscreenSafe() {
  const el = document.documentElement;
  if (document.fullscreenElement) return;
  if (el.requestFullscreen) el.requestFullscreen().catch(()=>{});
}
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    requestFullscreenSafe();
  } else {
    document.exitFullscreen?.();
  }
}

/* ---------- Global keyboard shortcuts ---------- */
function isTypingInTextControl() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  const type = (el.type || "").toLowerCase();
  return tag === "input" && (type === "text" || type === "number" || type === "search") || tag === "textarea";
}

function globalShortcuts(e) {
  if (isTypingInTextControl()) return;
  const k = e.key;
  if (k === "+" || (k === "=" && e.shiftKey)) {
    e.preventDefault(); updateByStep(e.shiftKey ? +15 : +1);
  } else if (k === "-" || k === "_") {
    e.preventDefault(); updateByStep(e.shiftKey ? -15 : -1);
  } else if (k === "0") {
    e.preventDefault(); updateDelta(0); refs.deltaRange.value = "0"; refs.deltaNumber.value = "0"; updateHash();
  } else if (k.toLowerCase() === "c") {
    e.preventDefault(); refs.copyMenuBtn.click();
  } else if (k.toLowerCase() === "h") {
    e.preventDefault(); refs.h12.checked = !refs.h12.checked; refs.h12.dispatchEvent(new Event("change"));
  } else if (k.toLowerCase() === "f") {
    e.preventDefault(); toggleFullscreen();
  } else if (k === "?") {
    e.preventDefault(); openHelp();
  } else if (k.toLowerCase() === "d") {
    e.preventDefault(); refs.densityBtn.click();
  } else if (k.toLowerCase() === "p") {
    e.preventDefault(); refs.plannerBtn.click();
  } else if (k.toLowerCase() === "x") {
    e.preventDefault(); exportPNG();
  }
}
function updateByStep(step) {
  const v = clamp((state.deltaMinutes | 0) + step, -1440, 1440);
  refs.deltaRange.value = String(v);
  refs.deltaNumber.value = String(v);
  updateDelta(v);
  updateHash();
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg) {
  const t = refs.toast;
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove("show"); }, 2000);
}

/* ---------- Export PNG (local canvas) ---------- */
function exportPNG() {
  // Build a simple raster snapshot of visible rows
  const visibleIds = state.orderIds.filter(id => state.visibleIds.has(id));
  const width = 1400;
  const rowH = 120;
  const padding = 20;
  const height = padding*2 + visibleIds.length * (rowH + 10) + 40;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  // background
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,width,height);
  ctx.font = "26px " + getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#e2e2e2";
  ctx.fillText(state.mode === "realtime" ? "Realtime" : `Adjusted ${formatSignedHHMM(state.deltaMinutes)}`, padding, 36);

  let y = padding + 60;
  for (const id of visibleIds) {
    const c = CLOCKS.find(x => x.id === id);
    const nudge = state.rowNudges.get(id) || 0;
    const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes, nudge);
    const timeStr = fmtTime(d, state.use12h);
    const dateStr = fmtDate(d);

    // name
    ctx.font = "22px " + getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = "#e2e2e2";
    ctx.textAlign = "right";
    ctx.fillText(c.name, width - padding, y);

    // time (glow-ish via shadow)
    ctx.textAlign = "left";
    ctx.shadowColor = c.accent === "orange" ? "#ffcc88" : "#66ff99";
    ctx.shadowBlur = 12;
    ctx.fillStyle = c.accent === "orange" ? "#ffd7a8" : "#c8facc";
    ctx.font = "48px " + getComputedStyle(document.body).fontFamily;
    ctx.fillText(timeStr, padding, y);

    // date
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#a0a0a0";
    ctx.font = "20px " + getComputedStyle(document.body).fontFamily;
    ctx.fillText(dateStr, padding, y + 28);

    y += rowH;
  }

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.download = `clocks-${stamp}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- UI Helpers ---------- */
function openMenuAt(btn, menu) {
  const rect = btn.getBoundingClientRect();
  menu.style.position = "fixed";
  menu.style.left = `${Math.round(rect.left)}px`;
  menu.style.top = `${Math.round(rect.bottom + 6)}px`;
  menu.hidden = false;
  btn.setAttribute("aria-expanded", "true");
}

function closeMenu(btn, menu) {
  menu.hidden = true;
  btn.setAttribute("aria-expanded", "false");
  btn.focus();
}

/* ---------- Init on DOM ready ---------- */
window.addEventListener("DOMContentLoaded", init);

