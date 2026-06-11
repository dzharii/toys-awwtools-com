2026-06-10

---

A00 Change Request Summary

---

Change request name:

```txt
CR-001 Randomized Rabbit Passing, Editable Rabbit Names, And Ambient Clock Panel
```

This change request extends Bunny Volleyball from a fixed three-pass loop into a more alive ambient experience.

The existing project makes the rabbits pass the ball in a deterministic loop:

```txt
left -> middle -> right -> left
```

The updated project should make the passing behavior semi-random. When a rabbit has the ball, it should randomly choose one of the other two rabbits as the next receiver. The ball should also vary its speed and arc slightly so the game feels less mechanical.

This change request also adds two new visible UI layers:

```txt
Editable rabbit name labels near each rabbit.
A large semi-transparent bottom-center clock panel.
```

The clock panel turns the project into a small ambient desktop-style page: a calm backyard, rabbits playing volleyball, current time, date, and total visible watching time.

The implementation must remain a simple static website. No build step, no framework, no external assets, no remote dependencies.

---

B00 Product Intent Update

---

The project is still Bunny Volleyball. The rabbits, ball, and backyard remain the primary experience.

The new product direction is:

```txt
A calm animated backyard page where rabbits play an endless randomized volleyball game, while the page also works as a lightweight ambient clock.
```

The user should be able to:

```txt
Watch rabbits pass the ball.
See the pass counter continue.
Edit rabbit names directly on the page.
See the current time, date, and total visible watching time.
Refresh the page and keep names, game progress, volume state, and watching time.
```

The new elements must not turn the page into a dashboard. They should feel integrated into the backyard scene.

---

C00 Existing Specification Relationship

---

This change request extends the existing specifications:

```txt
specs/design_spec.md
specs/product_spec.md
specs/audio_spec.md
```

If a previous spec says that no extra UI should be added, this change request overrides that rule only for these new elements:

```txt
editable rabbit name labels
bottom-center clock panel
```

All other visual restraint rules still apply.

Do not add unrelated controls, menus, settings panels, leaderboards, help screens, or extra decorations.

---

D00 Updated Runtime Storage Keys

---

The project already uses local storage for game and audio state. Add or update storage carefully.

Recommended storage keys:

```js
const GAME_STORAGE_KEY = "bunnyVolleyball.game.v2";
const AUDIO_STORAGE_KEY = "bunnyVolleyball.audio.v1";
const RABBIT_NAMES_STORAGE_KEY = "bunnyVolleyball.rabbitNames.v1";
const WATCH_TIME_STORAGE_KEY = "bunnyVolleyball.watchTime.v1";
```

The old game key may still exist:

```js
const OLD_GAME_STORAGE_KEY = "bunnyVolleyball.v1";
```

The implementation may migrate from the old key, but the randomized route system should use `bunnyVolleyball.game.v2`.

Do not store large frame histories. Store compact state that allows the game to resume.

---

E00 Random Passing Behavior

---

Replace the fixed pass sequence with randomized target selection.

Rules:

```txt
A rabbit cannot pass to itself.
The left rabbit may pass to middle or right.
The middle rabbit may pass to left or right.
The right rabbit may pass to left or middle.
The receiver becomes the next holder.
The next holder makes the next random decision.
```

Implementation constants:

```js
const RABBIT_IDS = ["left", "middle", "right"];

const ROUTE_OPTIONS = {
  left: ["middle", "right"],
  middle: ["left", "right"],
  right: ["left", "middle"]
};
```

Target choice:

```js
function chooseNextRabbit(from, rng) {
  const options = ROUTE_OPTIONS[from];
  const index = Math.floor(rng() * options.length);
  return options[index];
}
```

This random choice must happen once per pass, not every animation frame.

---

F00 Randomness Quality And Persistence

---

Use a deterministic seeded pseudo-random generator. Do not use raw `Math.random()` for core route generation, because the animation state should survive refreshes and continue coherently.

Recommended PRNG:

```js
function createMulberry32(seed) {
  let state = seed >>> 0;

  return {
    next() {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState() {
      return state >>> 0;
    },
    setState(nextState) {
      state = nextState >>> 0;
    }
  };
}
```

Initial seed:

```js
function createInitialSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}
```

The game state should persist the PRNG state so the next random choice continues from the same sequence.

Recommended stored game state:

```json
{
  "version": 2,
  "seed": 123456789,
  "rngState": 987654321,
  "completedPasses": 42,
  "currentHolder": "middle",
  "currentPass": {
    "passNumber": 43,
    "from": "middle",
    "to": "right",
    "startEpochMs": 1781111111111,
    "durationMs": 1715,
    "p0": { "x": 865, "y": 402 },
    "c1": { "x": 1014, "y": 284 },
    "c2": { "x": 1255, "y": 292 },
    "p3": { "x": 1445, "y": 438 },
    "arcLift": 144,
    "speedFactor": 1.04
  }
}
```

Persist the game state at every pass boundary.

---

G00 Game State Fast-Forward On Reload

---

On page load, restore the saved randomized game state.

If the saved current pass already ended while the page was closed, fast-forward the state without playing old sounds.

Process:

```txt
Load saved game state.
If missing or invalid, create a new v2 game state.
Get now = Date.now().
While now is beyond currentPass.startEpochMs + currentPass.durationMs:
  increment completedPasses
  set currentHolder = currentPass.to
  generate the next pass
  set next pass startEpochMs to old pass end time
  update rngState
Save the resolved current state.
Start visual animation from the resolved current pass.
Do not play catch-up audio for passes completed while page was closed.
```

Safety rule:

```txt
If fast-forward needs more than 5000 iterations, process in chunks or apply a safe cap with a documented fallback.
```

A typical page refresh should need zero or one fast-forward iteration. A closed browser session may need more.

---

H00 Randomized Pass Geometry

---

Replace hardcoded path-only logic with generated Bezier paths for all six possible directed passes.

The canonical rabbit contact points remain:

```js
const RABBITS = {
  left: {
    ballContact: { x: 170, y: 420 },
    ground: { x: 160, y: 477 },
    pulse: { x: 158, y: 455 }
  },
  middle: {
    ballContact: { x: 865, y: 402 },
    ground: { x: 864, y: 467 },
    pulse: { x: 864, y: 444 }
  },
  right: {
    ballContact: { x: 1445, y: 438 },
    ground: { x: 1452, y: 501 },
    pulse: { x: 1450, y: 480 }
  }
};
```

Generated pass formula:

```js
function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function generatePass({ from, to, passNumber, startEpochMs, rng }) {
  const p0 = RABBITS[from].ballContact;
  const p3 = RABBITS[to].ballContact;
  const dist = distance(p0, p3);
  const direction = Math.sign(p3.x - p0.x) || 1;

  const speedFactor = randomRange(rng, 0.88, 1.16);
  const baseDuration = 1180 + dist * 0.86;
  const durationMs = Math.round(clamp(baseDuration * speedFactor, 1350, 2950));

  const baseLift = clamp(92 + dist * 0.13, 118, 270);
  const arcLift = baseLift * randomRange(rng, 0.84, 1.18);
  const peakY = clamp(Math.min(p0.y, p3.y) - arcLift, 175, 365);

  const xJitter = randomRange(rng, -34, 34);
  const yJitterA = randomRange(rng, -18, 22);
  const yJitterB = randomRange(rng, -18, 22);

  const c1 = {
    x: p0.x + (p3.x - p0.x) * 0.30 + xJitter * 0.35,
    y: peakY + yJitterA
  };

  const c2 = {
    x: p0.x + (p3.x - p0.x) * 0.70 - xJitter * 0.35,
    y: peakY + yJitterB
  };

  return {
    passNumber,
    from,
    to,
    startEpochMs,
    durationMs,
    p0,
    c1,
    c2,
    p3,
    arcLift: Math.round(arcLift),
    speedFactor: Number(speedFactor.toFixed(3))
  };
}
```

The randomization must be subtle. The ball should not fly wildly outside the believable scene.

---

I00 Ball Speed And Arc Variation

---

Each pass should vary in speed and height.

Allowed variation:

```txt
duration variation: approximately -12% to +16%
arc height variation: approximately -16% to +18%
control point jitter: small, bounded
```

Hard constraints:

```txt
minimum pass duration: 1350 ms
maximum pass duration: 2950 ms
minimum control point y: 175
maximum control point y: 365
ball must always start at sender contact point
ball must always end at receiver contact point
```

The motion should feel organic, not chaotic.

Design intent:

```txt
The viewer should notice that the rabbits are choosing different receivers.
The viewer should only subtly feel the speed and height variation.
The ball should still look like the same lightweight beach ball.
```

---

J00 Audio Integration With Random Passing

---

The audio system should follow the new randomized pass events.

Existing audio event types still apply:

```txt
pass launch sound
flight whoosh sound
rabbit hit sound
milestone sound
```

Change the trigger logic:

```txt
Play launch and whoosh when a new currentPass begins live.
Play hit when currentPass completes live.
Use currentPass.from for launch pan.
Use currentPass.to for hit pan.
Use currentPass duration to scale whoosh duration.
Do not play audio for fast-forwarded passes after reload.
```

The milestone sound still uses completed pass count.

```js
if (completedPasses > 0 && completedPasses % 10 === 0) {
  audioEngine.playMilestone(completedPasses);
}
```

---

K00 Editable Rabbit Name Labels

---

Add one editable label near each rabbit.

The labels should be visible but secondary. They should look like soft name tags placed in the grass, not like form fields from an admin app.

Default names:

```js
const DEFAULT_RABBIT_NAMES = {
  left: "Clover",
  middle: "Pepper",
  right: "Hazel"
};
```

Recommended markup:

```html
<div
  class="rabbit-name rabbit-name--left"
  data-rabbit-id="left"
  contenteditable="plaintext-only"
  role="textbox"
  aria-label="Left rabbit name"
  spellcheck="false"
  data-placeholder="Rabbit name"
></div>
```

If `contenteditable="plaintext-only"` is not fully supported, the implementation must still sanitize pasted and typed content by reading and saving `textContent`, not `innerHTML`.

Do not allow rich text, embedded HTML, images, line breaks, or very long labels.

---

L00 Rabbit Name Label Placement

---

Use native scene coordinates for label placement.

Recommended label anchor coordinates:

```js
const RABBIT_LABELS = {
  left: {
    x: 204,
    y: 492,
    maxWidth: 180,
    align: "left"
  },
  middle: {
    x: 896,
    y: 505,
    maxWidth: 190,
    align: "center"
  },
  right: {
    x: 1326,
    y: 526,
    maxWidth: 190,
    align: "right"
  }
};
```

Placement rules:

```txt
Labels must not cover rabbit bodies.
Labels must not cover the score chip.
Labels must not cover the audio chip.
Labels must not cover the clock panel.
Labels must stay visually near their rabbit.
Labels should remain inside the scene bounds.
```

If implementation testing shows a label overlaps a rabbit or another UI element on a specific viewport size, adjust the label locally while preserving the same design intent.

---

M00 Rabbit Name Label Styling

---

Labels must be readable over grass and shadowed background.

Recommended CSS:

```css
.rabbit-name {
  position: absolute;
  z-index: 18;
  max-width: calc(var(--label-max-width) / 1672 * 100%);
  min-width: 54px;
  box-sizing: border-box;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 246, 225, 0.74);
  border: 1px solid rgba(92, 55, 24, 0.26);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);
  color: #4f2e16;
  font-family: "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif;
  font-size: clamp(12px, 1.05vw, 17px);
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(2px) saturate(1.08);
  -webkit-backdrop-filter: blur(2px) saturate(1.08);
}

.rabbit-name:focus {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.rabbit-name:focus-visible {
  outline: 2px solid #d94a1e;
  outline-offset: 2px;
  background: rgba(255, 246, 225, 0.90);
}

.rabbit-name:empty::before {
  content: attr(data-placeholder);
  color: rgba(79, 46, 22, 0.58);
}
```

Coordinate application:

```js
function placeRabbitNameLabel(element, config) {
  element.style.left = xPct(config.x);
  element.style.top = yPct(config.y);
  element.style.setProperty("--label-max-width", config.maxWidth);
}
```

Use a semi-transparent background, but keep enough opacity for text readability.

---

N00 Rabbit Name Persistence

---

Persist rabbit names in local storage.

Storage shape:

```json
{
  "left": "Clover",
  "middle": "Pepper",
  "right": "Hazel"
}
```

Save on `input`, debounced.

Recommended logic:

```js
function sanitizeRabbitName(value) {
  return value
    .replace(/[\\r\\n\\t]+/g, " ")
    .replace(/\\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function loadRabbitNames() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RABBIT_NAMES_STORAGE_KEY) || "{}");

    return {
      left: sanitizeRabbitName(parsed.left || DEFAULT_RABBIT_NAMES.left),
      middle: sanitizeRabbitName(parsed.middle || DEFAULT_RABBIT_NAMES.middle),
      right: sanitizeRabbitName(parsed.right || DEFAULT_RABBIT_NAMES.right)
    };
  } catch {
    return { ...DEFAULT_RABBIT_NAMES };
  }
}

function saveRabbitNames(names) {
  localStorage.setItem(RABBIT_NAMES_STORAGE_KEY, JSON.stringify(names));
}
```

Input handling:

```js
function bindRabbitNameLabel(element, rabbitId, names) {
  element.textContent = names[rabbitId];

  element.addEventListener("input", () => {
    const clean = sanitizeRabbitName(element.textContent);

    if (element.textContent !== clean) {
      const selection = window.getSelection();
      element.textContent = clean;
      if (selection) selection.collapse(element, element.childNodes.length);
    }

    names[rabbitId] = clean || DEFAULT_RABBIT_NAMES[rabbitId];
    debounceSaveRabbitNames(names);
  });

  element.addEventListener("paste", event => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, sanitizeRabbitName(text));
  });
}
```

If `document.execCommand` is avoided, use a small custom insertion helper. The final saved value must always come from sanitized plain text.

---

O00 Clock Panel Overview

---

Add a large bottom-center semi-transparent clock panel in the unused grass area.

The panel should contain:

```txt
large 24-hour HH:MM
smaller seconds
weekday and date
total visible watching time
```

Example content:

```txt
17:42 :08
Wednesday, June 10, 2026
Watching: 0 days 00 hours 03 minutes
```

The actual visual layout should make seconds smaller than hours and minutes.

The clock should update once per second.

---

P00 Clock Panel Markup

---

Recommended markup:

```html
<section class="clock-panel" id="clockPanel" aria-label="Current time and watching time">
  <div class="clock-panel__time" aria-hidden="true">
    <span class="clock-panel__hm" id="clockHoursMinutes">00:00</span>
    <span class="clock-panel__seconds" id="clockSeconds">:00</span>
  </div>
  <div class="clock-panel__date" id="clockDate">Wednesday, June 10, 2026</div>
  <div class="clock-panel__watch" id="watchTime">Watching: 0 days 00 hours 00 minutes</div>
</section>
```

The clock panel should not be contenteditable.

The clock panel should have `pointer-events: none` unless future controls are added.

---

Q00 Clock Panel Placement

---

Position the panel at the bottom center of the scene.

Native coordinate intent:

```txt
horizontal center: x 836
bottom spacing: 46 px to 64 px
```

Recommended CSS:

```css
.clock-panel {
  position: absolute;
  left: 50%;
  bottom: clamp(22px, 4.8%, 58px);
  transform: translateX(-50%);
  z-index: 12;
  width: min(58%, 720px);
  box-sizing: border-box;
  padding: clamp(10px, 1.4vw, 20px) clamp(16px, 2vw, 30px);
  border-radius: clamp(16px, 2vw, 30px);
  background: rgba(8, 22, 8, 0.24);
  border: 1px solid rgba(255, 246, 225, 0.22);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.20);
  color: rgba(255, 246, 225, 0.90);
  text-align: center;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(3px) saturate(1.1);
  -webkit-backdrop-filter: blur(3px) saturate(1.1);
  pointer-events: none;
}
```

Layering rule:

```txt
Clock panel should sit behind the ball and name labels.
Clock panel should sit above the photo.
Clock panel must not cover any rabbit.
```

Recommended z-index order:

```txt
background image: 1
clock panel: 12
ball shadow: 14
effects: 15
ball: 16
rabbit names: 18
score chip: 20
audio chip: 22
```

---

R00 Clock Typography

---

Use a condensed system font stack. Do not load external fonts.

Recommended CSS:

```css
.clock-panel__time {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.08em;
  font-family: Impact, Haettenschweiler, "Arial Narrow", "Roboto Condensed", system-ui, sans-serif;
  font-weight: 900;
  letter-spacing: 0.035em;
  line-height: 0.88;
}

.clock-panel__hm {
  font-size: clamp(52px, 8.4vw, 142px);
}

.clock-panel__seconds {
  font-size: 0.34em;
  opacity: 0.76;
  transform: translateY(-0.10em);
  transition: opacity 160ms ease, transform 160ms ease;
}

.clock-panel__seconds.is-ticking {
  opacity: 1;
  transform: translateY(-0.18em);
}

.clock-panel__date {
  margin-top: clamp(4px, 0.6vw, 8px);
  font-family: "Trebuchet MS", system-ui, sans-serif;
  font-size: clamp(12px, 1.35vw, 22px);
  font-weight: 700;
  letter-spacing: 0.03em;
  opacity: 0.88;
}

.clock-panel__watch {
  margin-top: clamp(3px, 0.5vw, 7px);
  font-family: "Trebuchet MS", system-ui, sans-serif;
  font-size: clamp(10px, 1.0vw, 16px);
  font-weight: 700;
  opacity: 0.72;
}
```

Seconds should be smaller than the hour and minute text. The seconds should animate subtly on update.

---

S00 Clock Time Formatting

---

Use 24-hour time.

Required display:

```txt
HH:MM
:SS
weekday, month day, year
```

Recommended implementation:

```js
function pad2(value) {
  return String(value).padStart(2, "0");
}

function getClockParts(now = new Date()) {
  return {
    hoursMinutes: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
    seconds: `:${pad2(now.getSeconds())}`,
    dateLabel: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(now)
  };
}
```

Do not hardcode the date. Always use the user's current local time.

Update the visible clock once per second. Align the update close to the next second boundary instead of using a drifting raw interval when practical.

---

T00 Smooth Seconds Update

---

On every second change:

```txt
Update HH:MM if needed.
Update seconds.
Add a temporary class to animate seconds.
Remove the class after the short transition.
```

Example:

```js
function renderClock() {
  const parts = getClockParts(new Date());

  clockHoursMinutes.textContent = parts.hoursMinutes;

  if (clockSeconds.textContent !== parts.seconds) {
    clockSeconds.textContent = parts.seconds;
    clockSeconds.classList.remove("is-ticking");
    void clockSeconds.offsetWidth;
    clockSeconds.classList.add("is-ticking");

    window.setTimeout(() => {
      clockSeconds.classList.remove("is-ticking");
    }, 170);
  }

  clockDate.textContent = parts.dateLabel;
  watchTime.textContent = formatWatchTime(getVisibleWatchMs());
}
```

Use a subtle transition. Do not flip, spin, or bounce the clock.

---

U00 Total Watching Time

---

The watching-time counter measures how much time the page has been visibly watched.

Definition:

```txt
Count time while document is visible.
Do not count time while the tab is hidden.
Persist total time across reloads.
Display with minute granularity.
```

Storage shape:

```json
{
  "totalVisibleMs": 185000,
  "updatedEpochMs": 1781111111111
}
```

Runtime state:

```js
const watchState = {
  totalVisibleMs: 0,
  visibleStartedAtMs: null
};
```

Load behavior:

```txt
Load totalVisibleMs from storage.
If document is visible, set visibleStartedAtMs = Date.now().
If document is hidden, leave visibleStartedAtMs = null.
```

Visibility behavior:

```js
function startVisibleWatch() {
  if (watchState.visibleStartedAtMs === null) {
    watchState.visibleStartedAtMs = Date.now();
  }
}

function stopVisibleWatch() {
  if (watchState.visibleStartedAtMs !== null) {
    watchState.totalVisibleMs += Date.now() - watchState.visibleStartedAtMs;
    watchState.visibleStartedAtMs = null;
    saveWatchTime();
  }
}

function getVisibleWatchMs() {
  if (watchState.visibleStartedAtMs === null) {
    return watchState.totalVisibleMs;
  }

  return watchState.totalVisibleMs + (Date.now() - watchState.visibleStartedAtMs);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopVisibleWatch();
  } else {
    startVisibleWatch();
  }
});
```

Save also on `pagehide`.

```js
window.addEventListener("pagehide", stopVisibleWatch);
```

Do not count hidden-tab time as watching time.

---

V00 Watching Time Formatting

---

Display days, hours, and minutes.

Required display:

```txt
Watching: 0 days 00 hours 00 minutes
```

Formatting logic:

```js
function formatWatchTime(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return `Watching: ${days} days ${pad2(hours)} hours ${pad2(minutes)} minutes`;
}
```

Granularity is minutes. Do not display seconds for watching time.

---

W00 Responsive Rules For New UI

---

The new UI must remain responsive.

Desktop:

```txt
Name labels remain near rabbits.
Clock panel is bottom-center and large.
Clock panel does not cover rabbits.
Audio chip remains bottom-right.
Score chip remains top-left.
```

Phone landscape:

```txt
Clock panel scales down.
Seconds remain readable.
Name labels remain visible but compact.
No label should cover a rabbit.
```

Phone portrait with horizontal panning:

```txt
Rabbit labels remain attached to the scene coordinate plane.
Clock panel may stay inside the scene coordinate plane.
Score chip and audio chip may remain fixed to viewport if existing implementation uses fixed chips.
Clock panel should not become wider than the viewport if fixed.
```

Recommended narrow-screen adjustment:

```css
@media (max-width: 700px) {
  .clock-panel {
    width: min(76vw, 520px);
    bottom: 18px;
  }

  .clock-panel__hm {
    font-size: clamp(42px, 14vw, 86px);
  }

  .rabbit-name {
    font-size: 12px;
    padding: 4px 7px;
  }
}
```

If the scene is horizontally scrollable, decide whether the clock is part of the world or part of the viewport. Preferred decision:

```txt
The clock panel belongs to the viewport.
The rabbit name labels belong to the scene.
```

If viewport-fixed clock is easier and cleaner on portrait, implement it only for portrait mode.

---

X00 Interaction Rules

---

Rabbit names:

```txt
Click or tap a name label to edit it.
Typing updates the visible label immediately.
Input is sanitized to plain text.
The name is saved after input.
Refresh keeps the edited name.
Focus outline is visible.
Enter should blur or be prevented from adding a newline.
Escape may blur without special rollback.
```

Clock:

```txt
No direct interaction.
Updates automatically.
Does not capture clicks.
Does not block rabbit label editing.
```

Random passing:

```txt
No user interaction required.
Route decisions happen automatically at pass boundaries.
Random route choices persist coherently through refresh.
```

Audio:

```txt
Existing audio controls continue to work.
Audio events follow randomized pass transitions.
No old sounds play during fast-forward.
```

---

Y00 Implementation Work Plan

---

Implement this change request in chunks.

Chunk 1:

```txt
Add v2 game state model.
Add seeded PRNG.
Add random target selection.
Add generated Bezier pass creation.
Add reload fast-forward.
Verify existing visual loop still works.
```

Chunk 2:

```txt
Connect randomized currentPass to ball position.
Connect currentPass to shadow, trail, hit effects, score, and audio.
Verify all six directed pass routes can occur.
Verify no pass targets the sender itself.
```

Chunk 3:

```txt
Add rabbit name label markup.
Add label positioning.
Add contenteditable behavior.
Add localStorage persistence.
Verify names survive refresh.
```

Chunk 4:

```txt
Add clock panel markup.
Add current time/date rendering.
Add seconds transition.
Add watching-time tracking.
Add localStorage persistence.
Verify hidden-tab time is not counted.
```

Chunk 5:

```txt
Finalize responsive behavior.
Verify desktop, landscape, and portrait.
Verify reduced-motion behavior.
Verify no new UI covers rabbits or breaks previous controls.
```

---

Z00 Acceptance Criteria

---

The coding agent must not mark this change request complete until all checks pass.

| Check                    | Required verification                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Random route options     | Verify each rabbit can pass only to the other two rabbits, and verify no pass ever has the same sender and receiver.                                                                   |
| Random route persistence | Verify randomized route state is saved in `bunnyVolleyball.game.v2`, and verify refresh resumes the current pass coherently instead of restarting a fixed loop.                        |
| Fast-forward behavior    | Verify passes completed while the page was closed are processed without visual corruption, and verify old catch-up passes do not produce backlog audio.                                |
| Variable speed           | Verify each generated pass has bounded duration variation, and verify no pass is shorter than `1350 ms` or longer than `2950 ms`.                                                      |
| Variable arc             | Verify each generated pass has bounded arc-height variation, and verify the ball does not leave the believable visual area of the scene.                                               |
| Six route support        | Verify left-to-middle, left-to-right, middle-to-left, middle-to-right, right-to-left, and right-to-middle can all render correctly, and verify shadows and trails work on every route. |
| Existing counter         | Verify the pass counter still increments once per completed pass, and verify the count persists after refresh.                                                                         |
| Existing audio           | Verify launch, whoosh, hit, and milestone sounds use randomized pass state, and verify sound still starts only after user activation.                                                  |
| Name labels visible      | Verify three rabbit name labels are rendered near the correct rabbits, and verify none of the labels overlap rabbit bodies.                                                            |
| Name label editing       | Verify each label is editable with keyboard input, and verify pasted content is stored as sanitized plain text only.                                                                   |
| Name persistence         | Verify edited names are saved under `bunnyVolleyball.rabbitNames.v1`, and verify refresh restores the edited names.                                                                    |
| Name readability         | Verify label text remains readable over grass, and verify focus state has a clear visible outline.                                                                                     |
| Clock presence           | Verify the bottom-center clock panel is visible, and verify it contains HH:MM, smaller seconds, date, and watching-time text.                                                          |
| Clock time format        | Verify the time uses 24-hour local time, and verify the date displays weekday, month, day, and year.                                                                                   |
| Seconds update           | Verify seconds update every second, and verify the update animation is subtle rather than distracting.                                                                                 |
| Watching time            | Verify watching time displays days, hours, and minutes, and verify it persists across reloads.                                                                                         |
| Visibility tracking      | Verify visible time is counted while the document is visible, and verify hidden-tab time is not counted.                                                                               |
| Layout safety            | Verify the clock does not cover rabbits, and verify it does not block interaction with editable name labels.                                                                           |
| Responsive safety        | Verify the new UI works on desktop and phone landscape, and verify portrait mode remains usable with horizontal panning or viewport-pinned panels.                                     |
| Reduced motion           | Verify reduced-motion mode keeps the clock usable, and verify visual/audio effects are still reduced as required by the earlier specs.                                                 |
| Regression check         | Verify previous ball animation, score persistence, audio controls, and responsive scene layout still work after this change.                                                           |
| Final validation         | Verify all previous specs plus this change request are satisfied, and verify completion is reported only after code and visual behavior are inspected.                                 |

---

AA00 Final Completion Report Update

---

When this change request is implemented, the coding agent should report:

```txt
Implemented CR-001 Randomized Rabbit Passing, Editable Rabbit Names, And Ambient Clock Panel.

Updated:
- index.html
- styles.css
- app.js

Verified:
- randomized route selection works
- all six directed routes render
- variable speed and arc are bounded
- pass counter still persists
- rabbit names are editable and persistent
- clock shows local 24-hour time, date, and watching time
- hidden-tab time is not counted
- audio follows randomized pass transitions
- desktop, landscape, and portrait layouts remain usable
- previous functionality did not regress

Acceptance checklist:
- all CR-001 checks passed
```

If any check fails, report the failed check and the exact fix needed.
