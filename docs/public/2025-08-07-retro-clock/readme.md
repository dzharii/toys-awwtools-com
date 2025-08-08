# Specification: Retro Multi-Time-Zone Clock, vanilla JS + HTML + CSS

Date: 2025-08-07

GPT-5 Thinking



## 1. Purpose

- Provide a single-page, dependency-free web app that displays multiple clocks with a retro CRT look and supports a Real-Time mode and an Adjusted mode for what-if time exploration.

## 2. Scope

- In scope: rendering clocks, fixed UTC offsets, Real-Time and Adjusted modes, user controls, clipboard copy, minimal share via URL hash, responsive layout for at least 6 clocks.
- Out of scope: deployments, build tooling, IANA time zones and DST rules, persistence beyond URL, localization files, external fonts or assets.

## 3. Definitions

- Clock: a display backed by a fixed offset in minutes relative to UTC.
- Real-Time mode: base time is device clock now; advances every second.
- Adjusted mode: base time equals device clock now plus a user delta; the delta is static until reset; ticking continues from the adjusted base.
- Base time: now or now plus delta; per app, not per clock.
- Delta: signed minutes applied to base time in Adjusted mode.

## 4. Deliverables

- index.html, styles.css, app.js in the same folder.
- No external network requests, no images, no fonts.

## 5. Configuration

- Clocks are defined in a single JS object. Offsets are fixed minutes. Names are developer-supplied labels.

```js
// app.js
const CLOCKS = [
  { id: "local",  name: "Local",        offsetMinutes: 0,    accent: "green" },
  { id: "nyc",    name: "New York",     offsetMinutes: -240, accent: "green" },
  { id: "lon",    name: "London",       offsetMinutes: 0,    accent: "orange" },
  { id: "tko",    name: "Tokyo",        offsetMinutes: 540,  accent: "green" },
  { id: "syd",    name: "Sydney",       offsetMinutes: 600,  accent: "orange" },
  { id: "del",    name: "Delhi",        offsetMinutes: 330,  accent: "green" }
];
// Offsets are relative to UTC; 0 for UTC aligned. Use integers; half-hour and 45-minute zones are supported.
```

## 6. Layout

- Top toolbar with mode indicator, delta scrubber, numeric input, reset button, copy all menu.
- Grid of clock rows; each row has a left clock face and a right name block with per-clock actions.
- Minimum 6 clocks above the fold at 1440x900. Grid is responsive with auto-fit and minmax.
- No nested DOM lists in markup; flat semantic structure.

```html
<!-- index.html -->
<header id="toolbar" aria-label="Clock controls">
  <div id="modeIndicator" role="status" aria-live="polite"></div>
  <input id="deltaRange" type="range" min="-1440" max="1440" step="1" aria-label="Adjust minutes">
  <input id="deltaNumber" type="number" min="-1440" max="1440" step="1" aria-label="Adjust minutes exact">
  <button id="resetBtn">Reset to real time</button>
  <button id="copyAllBtn">Copy all</button>
</header>

<main id="grid" role="list">
  <!-- rows inserted by JS -->
</main>
```

## 7. Visual style

- Retro CRT look with black background and green or orange glow using text-shadow, not images.
- CSS custom properties control palette and sizing.

```css
:root {
  --bg: #000000;
  --fg: #c8facc;     /* green foreground base */
  --fg2: #ffd7a8;    /* orange foreground base */
  --muted: #6a6a6a;
  --glow: 0 0 6px currentColor, 0 0 12px currentColor, 0 0 24px currentColor;
  --font-face: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  --digit-size: clamp(24px, 6vw, 72px);
  --name-size: clamp(18px, 2.5vw, 32px);
}

body { background:#000; color:#e2e2e2; font-family: var(--font-face); margin:0; }

#grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 12px;
  padding: 12px;
}

.clockRow { display:flex; align-items:center; border:1px solid #141414; padding:12px; border-radius:8px; background: #050505; }

.clockFace {
  flex: 0 0 60%;
  font-size: var(--digit-size);
  line-height: 1;
  color: var(--fg);
  text-shadow: var(--glow);
  letter-spacing: 0.04em;
}

.clockFace.orange { color: var(--fg2); }

.clockName {
  flex: 1;
  text-align: right;
  font-size: var(--name-size);
  color:#e7e7e7;
}

.badgeAdjusted { color:#fff; background:#6a3; padding:2px 6px; border-radius:4px; margin-left:8px; }
.badgeRealtime { color:#000; background:#9f9; padding:2px 6px; border-radius:4px; margin-left:8px; }
```

## 8. Typography and formatting rules

- Time format HH:MM:SS in 24h by default. Optional 12h toggle is allowed via a toolbar checkbox.
- Date format YYYY-MM-DD on a smaller line under the time.
- Zero padding for all fields.
- No blinking separators.

## 9. States

- state.mode is "realtime" or "adjusted".
- state.deltaMinutes is an integer in minutes.
- state.baseNow is a high-resolution timestamp for the current second tick.
- state.timerId is the interval handle.
- state.copyStatus is last clipboard action success flag.

```js
const state = {
  mode: "realtime",
  deltaMinutes: 0,
  baseNow: new Date(),
  timerId: null,
  copyStatus: null
};
```

## 10. Mode transitions

- App starts in Real-Time. deltaMinutes equals 0.
- Any user change on range or number input switches to Adjusted and sets deltaMinutes.
- Reset button sets deltaMinutes to 0 and returns to Real-Time.
- While in Adjusted, ticking continues from device clock now plus deltaMinutes; delta does not drift.

## 11. Time math

- Visible clock time equals baseNow plus deltaMinutes plus clock.offsetMinutes.
- Time arithmetic is done in minutes and milliseconds to avoid DST or IANA logic.
- No Intl timeZone is used; formatting is manual.

```js
function addMinutes(date, minutes) { return new Date(date.getTime() + minutes * 60000); }

function computeDisplay(nowBase, deltaMin, offsetMin) {
  return addMinutes(nowBase, deltaMin + offsetMin);
}
```

## 12. Rendering loop

- setInterval at 1000 ms aligned to the next full second.
- On each tick, update state.baseNow and re-render all visible clocks.
- Reflow cost is minimized by updating textContent only when a value changes.

```js
function startTick() {
  const align = 1000 - (Date.now() % 1000);
  setTimeout(() => {
    state.timerId = setInterval(tick, 1000);
    tick();
  }, align);
}

function tick() {
  state.baseNow = new Date();
  renderAll();
}
```

## 13. DOM rendering

- JS creates a row per clock with fixed structure. No re-create on every tick; only text nodes change.

```js
function createRow(c) {
  const row = document.createElement("section");
  row.className = "clockRow";
  row.setAttribute("role", "listitem");
  row.dataset.id = c.id;

  const face = document.createElement("div");
  face.className = "clockFace" + (c.accent === "orange" ? " orange" : "");
  face.innerHTML = '<div class="time"></div><div class="date" style="font-size:0.45em; color:#a0a0a0;"></div>';

  const right = document.createElement("div");
  right.className = "clockName";
  right.innerHTML = `<span class="label">${c.name}</span> <button class="copyBtn" data-id="${c.id}">Copy</button>`;

  row.appendChild(face);
  row.appendChild(right);
  return row;
}
```

## 14. Formatting helpers

- All strings are constructed without Intl timeZone. Pad function ensures two-digit fields.

```js
const pad2 = n => String(n).padStart(2, "0");

function fmtTime(d, use12h=false) {
  let h = d.getUTCHours();
  let m = d.getUTCMinutes();
  let s = d.getUTCSeconds();
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
```

## 15. Applying offsets without timeZone APIs

- Because offsets are fixed, convert date to UTC by using getUTC* accessors after adding total minutes.
- computeDisplay returns a UTC-corrected Date; formatter uses getUTC* to avoid local zone influence.

## 16. Controls behavior

- deltaRange is a horizontal scrub control from −1440 to +1440 minutes.
- deltaNumber mirrors deltaRange value; both dispatch the same updateDelta handler.
- resetBtn sets delta to 0 and switches to Real-Time.
- copyAllBtn copies a newline-separated list of clock name, ISO, and human string.
- Per-clock Copy copies the single clock time in ISO and human string.
- Optional checkbox 12h toggles the display format. If omitted, default is 24h.

```js
function updateDelta(v) {
  state.deltaMinutes = v;
  state.mode = v === 0 ? "realtime" : "adjusted";
  updateModeIndicator();
  renderAll();
}
```

## 17. Mode indicator

- Shows a green Realtime badge or an amber Adjusted +HH:MM badge.
- Uses aria-live polite so screen readers announce the mode change.

## 18. Copy to clipboard

- navigator.clipboard.writeText is used; fallback to a hidden textarea and document.execCommand when unavailable.
- Data format per clock: `Name\tYYYY-MM-DD HH:MM:SS\tISO8601`.
- Data format for all clocks: one line per clock.

```js
function makeLine(name, d) {
  const iso = d.toISOString().replace(".000Z","Z");
  const human = `${fmtDate(d)} ${fmtTime(d)}`;
  return `${name}\t${human}\t${iso}`;
}
```

## 19. Share via URL hash

- Hash encodes delta and selected 12h flag only. Example: `#d=90&h=12`.
- On load, parse hash and initialize state.
- No clock list in hash; configuration is code-side only.

## 20. Keyboard and pointer interactions

- Range: Left and Right decrement or increment 1 minute. PageUp or PageDown adjust 15 minutes. Home and End jump to 0 or extremes.
- Number input supports arrow keys and manual typing; on blur, clamp to range.
- Buttons are tabbable and operable with Enter or Space.
- Pointer capture on the range ensures smooth drag. While dragging, mode is Adjusted.

## 21. Indicators on rows

- While in Adjusted mode, each row shows a small badge reading Adjusted under the time.
- In Real-Time mode, rows show Realtime badge.

## 22. Responsiveness targets

- At 1440x900, show 3 columns x 2 rows minimum.
- At 1024x768, show 2 columns.
- At 375x667, show single column; time size clamps via CSS.

## 23. Accessibility

- Sufficient contrast against black background. Green and orange have luminous text shadows but maintain WCAG AA for text.
- Mode changes are announced via aria-live.
- Buttons have aria-labels where text is not self-describing.
- No motion that may trigger vestibular issues; no flashing.

## 24. Error handling

- Invalid offsetMinutes throws during initialization with a clear console error.
- Clipboard failures show a non-blocking toast message near the toolbar.
- Hash parse errors are ignored and reset to defaults.

## 25. Initialization sequence

- Parse URL hash.
- Build toolbar and grid.
- Create DOM rows from CLOCKS.
- Bind event listeners.
- Start aligned tick.

## 26. Event wiring

- deltaRange input and change call updateDelta with Number(value).
- deltaNumber input and change mirror deltaRange and call updateDelta.
- resetBtn click sets 0 and Real-Time.
- copyAllBtn click composes and writes text to clipboard.
- Row copy button click composes single-row text.

## 27. Performance

- Single interval tick updates time strings; no layout thrash.
- requestAnimationFrame is not used; 1 Hz updates are sufficient.
- Text updates are skipped when computed strings are unchanged.
- Expected CPU under 2 percent on a typical laptop with 6 clocks.

## 28. Security and privacy

- No external requests; no storage. Clipboard use is user-initiated only.
- No permissions are requested beyond clipboard.

## 29. Testing checklist

- Real-Time shows correct local and offset times for at least 6 sample offsets including half-hour zones.
- Adjusted mode reflects the exact delta on all clocks and persists while interacting.
- Reset returns to Real-Time and clears badges.
- Range and number stay in sync across all inputs.
- Copy single and copy all produce expected formats and line counts.
- URL hash d= and h= parse correctly and survive reload.
- Keyboard accessibility works on all controls.
- Mobile drag does not scroll the page while interacting with the range.

## 30. Acceptance criteria

- Page loads with 6 configured clocks and retro styling without external assets.
- Ticking occurs exactly once per second with aligned seconds.
- Adjusted mode is entered on any non-zero delta and clearly indicated in the toolbar and rows.
- Reset returns to Real-Time and sets delta to 0. Indicator updates within one tick.
- Clipboard actions succeed on supported browsers and fail gracefully otherwise.
- Layout fits at least 6 clocks at 1440x900 without scroll.

## 31. Minimal functions list in app.js

- init, buildUI, createRow, startTick, tick, renderAll, renderRow, computeDisplay, fmtTime, fmtDate, addMinutes, updateDelta, updateModeIndicator, copySingle, copyAll, parseHash, applyHash, writeClipboard.

## 32. Notes and constraints

- Offsets are fixed and do not auto-adjust for DST. If DST is needed later, extend config to accept rules or switch to IANA time zones in a v2.





## New features:

**Business-hours shading (per clock)**
 Show a subtle green bar or background when the current time is inside 09:00–17:00 local for that row (thresholds configurable per row). Great for “is it reasonable to ping?” at a glance.
 *Complexity: Low.*

**“Yesterday / Today / Tomorrow” day chips**
 Tiny chip near each date that reads Yesterday/Today/Tomorrow relative to the **local device day**. It kills confusion when a time crosses midnight.
 *Complexity: Low.*

**Keyboard shortcuts**
 `+`/`-` = ±1 min, `Shift` + `+/-` = ±15, `0` = reset, `C` = copy all, `H` = 12-hour toggle, `F` = fullscreen. Keeps hands on keyboard.
 *Complexity: Low.*

**Better tick stability**
 Replace `setInterval` with a drift-corrected loop (`setTimeout` to the next exact second using an accumulator). Improves long-running accuracy.
 *Complexity: Low.*

**Visibility-aware ticking**
 Pause updates while the tab is hidden and resync on `visibilitychange`, so CPU stays near zero when backgrounded and seconds jump stays aligned.
 *Complexity: Low.*

**Share hash improvements**
 Keep current `#d` and `#h`, but optionally add `#order=nyc,lon,...` to support on-page drag-reorder that persists via URL only (still no server, no storage).
 *Complexity: Medium.*

**Compact density toggle**
 “Dense” mode reduces paddings and font sizes to fit ~9–12 clocks on laptops. Toggle lives on the toolbar and persists in the hash with `#z=dense`.
 *Complexity: Low.*

**Seconds progress ring**
 A tiny conic-gradient ring next to each time that sweeps once per minute. It reinforces the “tick” without blinking text.
 *Complexity: Low.*

**Quick jump to a specific time**
 A small “Jump” input (YYYY-MM-DD HH:MM) that computes `deltaMinutes = targetUTC - nowUTC` and flips to Adjusted. Lets you time-travel precisely while still following the spec (delta remains static).
 *Complexity: Medium.*

**Multi-format copy**
 Keep the tab-delimited default, but add a mini menu on “Copy all”: TSV (current), CSV, Markdown table, or human list.
 *Complexity: Low.*

**Per-row quick offset nudge (temporary)**
 Optional ±30m buttons per row apply a **visual nudge badge** (e.g., “+30m temp”) *without* altering global base. Useful when a city observes a seasonal shift manually. (It’s a temporary add-on, clearly marked, and not persisted.)
 *Complexity: Medium.*
 *Note:* it intentionally doesn’t contradict your fixed-offset model; it’s an overlay.

**Color-blind friendly palette toggle**
 Swap green/orange for cyan/amber or high-contrast green/white. Keeps the retro vibe while improving accessibility.
 *Complexity: Low.*

**Full screen & kiosk mode**
 A `Full screen` button (`requestFullscreen`) and a `Kiosk` hash flag to auto-enter, hide toolbar, and maximize digits for wall displays.
 *Complexity: Low.*

**ARIA polish & focus management**
 Add `aria-pressed` to the 12h toggle, ensure toast announces context (“Copied 6 lines”), and cycle focus back to the initiating control after copy.
 *Complexity: Low.*

**Performance guardrails**
 Batch DOM writes with a tiny microtask and short-circuit render when seconds didn’t change (rare but defensive). Add a runtime FPS/CPU indicator in dev mode.
 *Complexity: Low.*

**“Working set” filter**
 Toolbar quick filter to temporarily hide/show rows (e.g., only APAC). Persist list in `#ids=` (opt-in; this is the one place you’d extend the hash beyond spec if you want).
 *Complexity: Medium.*

**Export as PNG (local only)**
 Render the grid to an offscreen `<canvas>` and let the user download a PNG (no libs). Handy for sharing a snapshot in docs.
 *Complexity: Medium.*

**Haptics on mobile slider**
 Light `vibrate(5)` on 15-minute steps and at 0 to give tactile feedback.
 *Complexity: Low.*

**Meeting planner strip**
 Horizontal 24-hour band showing each city’s local working hours and the selected base time marker. Keeps everything within your current math—no IANA needed.
 *Complexity: Medium.*

**“Top of hour” soft ping**
 Optional subtle flash of the seconds ring at `:00`. No audio, no blinking text.
 *Complexity: Low.*
