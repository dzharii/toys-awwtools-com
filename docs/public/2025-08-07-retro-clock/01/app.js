"use strict";

/* ================================
   Retro Multi-Time-Zone Clock
   Vanilla JS + HTML + CSS
   ================================ */

// ---- 5. Configuration ----
const CLOCKS = [
  { id: "local",  name: "Local",        offsetMinutes: 0,    accent: "green" },
  { id: "nyc",    name: "New York",     offsetMinutes: -240, accent: "green" },
  { id: "lon",    name: "London",       offsetMinutes: 0,    accent: "orange" },
  { id: "tko",    name: "Tokyo",        offsetMinutes: 540,  accent: "green" },
  { id: "syd",    name: "Sydney",       offsetMinutes: 600,  accent: "orange" },
  { id: "del",    name: "Delhi",        offsetMinutes: 330,  accent: "green" }
];
// Offsets are relative to UTC; 0 for UTC aligned. Use integers; half-hour and 45-minute zones are supported.

// ---- 9. State ----
const state = {
  mode: "realtime",        // "realtime" | "adjusted"
  deltaMinutes: 0,         // signed minutes
  baseNow: new Date(),     // high-res timestamp for the current second tick
  timerId: null,           // interval handle
  copyStatus: null,        // last clipboard action success flag
  use12h: false,           // 12h format if true
  isScrubbing: false       // internal: tracking pointer drag of range
};

// ---- Internal refs ----
const refs = {
  modeIndicator: null,
  deltaRange: null,
  deltaNumber: null,
  resetBtn: null,
  copyAllBtn: null,
  h12: null,
  grid: null,
  toast: null
};

const rowRefs = new Map(); // id -> { root, timeEl, dateEl, badgeEl, lastTime, lastDate, lastBadge }

/* ============ 14. Formatting helpers ============ */
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

/* ======== 11. Time math ======== */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function computeDisplay(nowBase, deltaMin, offsetMin) {
  return addMinutes(nowBase, deltaMin + offsetMin);
}

/* ===== Helpers ===== */
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function formatSignedHHMM(totalMinutes) {
  const sign = totalMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${pad2(h)}:${pad2(m)}`;
}

/* ============ 18. Clipboard helpers ============ */
function makeLine(name, d) {
  const iso = d.toISOString().replace(".000Z", "Z");
  const human = `${fmtDate(d)} ${fmtTime(d, state.use12h)}`;
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
    // Prevent zoom/focus jumps
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

/* ============ 31. Minimal functions ============ */

function init() {
  // 24. Error handling: validate CLOCKS
  for (const c of CLOCKS) {
    if (!Number.isInteger(c.offsetMinutes)) {
      console.error(`Invalid offsetMinutes for clock "${c.id}" (${c.name}): expected integer, got`, c.offsetMinutes);
      return;
    }
    if (c.offsetMinutes < -1440 || c.offsetMinutes > 1440) {
      console.error(`offsetMinutes out of range [-1440,1440] for "${c.id}" (${c.name}):`, c.offsetMinutes);
      return;
    }
  }

  // 25. Initialization sequence
  parseHash();
  buildUI();
  applyHash(); // seeds inputs, mode, and initial render state

  // Build rows once
  for (const c of CLOCKS) {
    const row = createRow(c);
    refs.grid.appendChild(row.root);
    rowRefs.set(c.id, row);
  }

  startTick();
}

function buildUI() {
  refs.modeIndicator = document.getElementById("modeIndicator");
  refs.deltaRange = document.getElementById("deltaRange");
  refs.deltaNumber = document.getElementById("deltaNumber");
  refs.resetBtn = document.getElementById("resetBtn");
  refs.copyAllBtn = document.getElementById("copyAllBtn");
  refs.h12 = document.getElementById("h12");
  refs.grid = document.getElementById("grid");
  refs.toast = document.getElementById("toast");

  // Reflect current state from parseHash defaults
  refs.deltaRange.value = String(state.deltaMinutes);
  refs.deltaNumber.value = String(state.deltaMinutes);
  refs.h12.checked = !!state.use12h;

  // 26. Event wiring
  const onDeltaInput = (v) => {
    const num = clamp(Number(v), -1440, 1440) | 0; // ensure int
    updateDelta(num);
    // Keep inputs in sync
    if (refs.deltaRange.value !== String(num)) refs.deltaRange.value = String(num);
    if (refs.deltaNumber.value !== String(num)) refs.deltaNumber.value = String(num);
    updateHash();
  };

  refs.deltaRange.addEventListener("input", (e) => onDeltaInput(e.target.value));
  refs.deltaNumber.addEventListener("input", (e) => onDeltaInput(e.target.value));

  // Clamp on blur for number input
  refs.deltaNumber.addEventListener("blur", () => {
    const num = clamp(Number(refs.deltaNumber.value) || 0, -1440, 1440) | 0;
    refs.deltaNumber.value = String(num);
    refs.deltaRange.value = String(num);
    onDeltaInput(num);
  });

  // Keyboard interactions for range (20. Keyboard)
  refs.deltaRange.addEventListener("keydown", (e) => {
    let handled = true;
    let v = Number(refs.deltaRange.value) | 0;
    if (e.key === "ArrowLeft") v -= 1;
    else if (e.key === "ArrowRight") v += 1;
    else if (e.key === "PageUp") v += 15;
    else if (e.key === "PageDown") v -= 15;
    else if (e.key === "Home") v = 0;
    else if (e.key === "End") v = e.shiftKey ? 1440 : (v >= 0 ? 1440 : -1440);
    else handled = false;

    if (handled) {
      e.preventDefault();
      v = clamp(v, -1440, 1440) | 0;
      refs.deltaRange.value = String(v);
      refs.deltaNumber.value = String(v);
      onDeltaInput(v);
    }
  });

  // Pointer capture for smooth drag & ensure Adjusted while dragging
  const onPointerDown = (e) => {
    state.isScrubbing = true;
    refs.deltaRange.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e) => {
    state.isScrubbing = false;
    refs.deltaRange.releasePointerCapture?.(e.pointerId);
  };
  refs.deltaRange.addEventListener("pointerdown", onPointerDown);
  refs.deltaRange.addEventListener("pointerup", onPointerUp);
  // Prevent scrolling while touching the range
  refs.deltaRange.addEventListener("touchstart", (e) => { e.preventDefault(); }, { passive: false });

  refs.resetBtn.addEventListener("click", () => {
    refs.deltaRange.value = "0";
    refs.deltaNumber.value = "0";
    updateDelta(0);
    updateHash();
  });

  refs.copyAllBtn.addEventListener("click", copyAll);

  refs.h12.addEventListener("change", () => {
    state.use12h = refs.h12.checked;
    updateHash();
    renderAll();
  });
}

function createRow(c) {
  const root = document.createElement("section");
  root.className = "clockRow";
  root.setAttribute("role", "listitem");
  root.dataset.id = c.id;

  const face = document.createElement("div");
  face.className = "clockFace" + (c.accent === "orange" ? " orange" : "");
  const timeEl = document.createElement("div");
  timeEl.className = "time";
  const dateEl = document.createElement("div");
  dateEl.className = "date";

  const badgeEl = document.createElement("span");
  badgeEl.className = "statusBadge badgeRealtime"; // start realtime
  badgeEl.textContent = "Realtime";

  face.appendChild(timeEl);
  face.appendChild(dateEl);
  face.appendChild(badgeEl);

  const right = document.createElement("div");
  right.className = "clockName";

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = c.name;

  const btn = document.createElement("button");
  btn.className = "copyBtn";
  btn.type = "button";
  btn.textContent = "Copy";
  btn.setAttribute("aria-label", `Copy time for ${c.name}`);
  btn.dataset.id = c.id;
  btn.addEventListener("click", () => copySingle(c.id));

  right.appendChild(label);
  right.appendChild(btn);

  root.appendChild(face);
  root.appendChild(right);

  return {
    root, timeEl, dateEl, badgeEl,
    lastTime: "", lastDate: "", lastBadge: ""
  };
}

/* ============ 12. Rendering loop ============ */
function startTick() {
  const align = 1000 - (Date.now() % 1000);
  setTimeout(() => {
    state.timerId = setInterval(tick, 1000);
    tick();
  }, align);
}

function tick() {
  // Base time is always device now; delta applied in computeDisplay
  state.baseNow = new Date();
  renderAll();
}

/* ============ 13. DOM rendering ============ */
function renderAll() {
  for (const c of CLOCKS) {
    renderRow(c);
  }
  updateModeIndicator();
}

function renderRow(c) {
  const row = rowRefs.get(c.id);
  if (!row) return;

  const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes);

  // 27. Performance: skip if unchanged
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
}

/* ============ 16. Controls behavior ============ */
function updateDelta(v) {
  state.deltaMinutes = v | 0;
  state.mode = v === 0 ? "realtime" : "adjusted";
  updateModeIndicator();
  renderAll();
}

/* ============ 17. Mode indicator ============ */
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

/* ============ 18. Copy to clipboard ============ */
async function copySingle(id) {
  const c = CLOCKS.find(x => x.id === id);
  if (!c) return;
  const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes);
  const line = makeLine(c.name, d);
  await writeClipboard(line);
}

async function copyAll() {
  // Compose lines in visual order (same as CLOCKS)
  const lines = CLOCKS.map(c => {
    const d = computeDisplay(state.baseNow, state.deltaMinutes, c.offsetMinutes);
    return makeLine(c.name, d);
  });
  await writeClipboard(lines.join("\n"));
}

/* ============ 19. Share via URL hash ============ */
function parseHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return;
  const params = new URLSearchParams(hash);
  const dStr = params.get("d");
  const hStr = params.get("h");
  if (dStr !== null) {
    const n = Number(dStr);
    if (Number.isFinite(n)) {
      state.deltaMinutes = clamp(Math.trunc(n), -1440, 1440);
      state.mode = state.deltaMinutes === 0 ? "realtime" : "adjusted";
    }
  }
  if (hStr !== null) {
    state.use12h = (hStr === "12" || hStr === "true" || hStr === "1");
  }
}

function applyHash() {
  // Reflect into inputs and indicator
  if (refs.deltaRange) refs.deltaRange.value = String(state.deltaMinutes);
  if (refs.deltaNumber) refs.deltaNumber.value = String(state.deltaMinutes);
  if (refs.h12) refs.h12.checked = !!state.use12h;
  updateModeIndicator();
  renderAll();
}

function updateHash() {
  const params = new URLSearchParams();
  params.set("d", String(state.deltaMinutes | 0));
  if (state.use12h) params.set("h", "12");
  const newHash = `#${params.toString()}`;
  // Avoid pushing history entries
  if (newHash !== window.location.hash) {
    try {
      history.replaceState(null, "", newHash);
    } catch {
      window.location.hash = newHash;
    }
  }
}

/* ============ Toast feedback ============ */
let toastTimer = null;
function showToast(msg) {
  const t = refs.toast;
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
  }, 1800);
}

/* ============ 25. Kickoff ============ */
window.addEventListener("DOMContentLoaded", init);

