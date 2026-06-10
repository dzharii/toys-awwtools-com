2026-06-10

---

A00 Project Summary

---

Build a small static web project called `Bunny Volleyball`.

The project is a polished single-page visual demo where three real rabbits in a backyard appear to pass a cartoon beach ball between each other forever. The base scene is a natural backyard image. The game-like layer is intentionally minimal: one animated beach ball, one subtle pass counter, one soft ball shadow, one motion trail, and short contact effects when a rabbit receives the ball.

This is not a full game. Do not add menus, controls, buttons, settings, audio, instructions, avatars, or extra characters. The value of the project is the illusion: a real photo quietly becomes a funny animated scene.

The implementation must be static and dependency-free. It must run by opening `index.html` in a browser. It must use `HTML`, `CSS`, and plain `JavaScript`. It must not use frameworks, build tools, package managers, external fonts, remote scripts, remote images, or HTML canvas rendering.

---

B00 Existing Project Inputs

---

The starting folder contains this structure:

```txt
D:.
|
\---specs
        bunny_mockup.png
        bunny_original.png
        design_spec.md
```

Use `specs/design_spec.md` as the detailed visual design source. This implementation note is the project-level guide for the coding agent. When details overlap, follow `specs/design_spec.md` for visual constants and this document for implementation workflow, file placement, and acceptance validation.

The production background image is:

```txt
specs/bunny_original.png
```

The visual reference mockup is:

```txt
specs/bunny_mockup.png
```

The detailed design specification is:

```txt
specs/design_spec.md
```

The coding agent must create the project files in the parent folder where it is launched, not inside `specs`.

Expected output structure:

```txt
D:.
|   index.html
|   styles.css
|
+---assets
|       bunny_original.png
|
\---specs
        bunny_mockup.png
        bunny_original.png
        design_spec.md
```

Only `bunny_original.png` is required in `assets` for production. `bunny_mockup.png` should stay in `specs` as a reference only unless the developer intentionally wants to keep an extra reference copy outside production code. Do not use `bunny_mockup.png` as the runtime background.

---

C00 Product Purpose

---

The project exists to create a small, delightful animated scene. The user opens the page and sees a calm backyard. Then the user notices that the rabbits are passing a beach ball. The pass counter implies that the rabbits have been doing this continuously.

The experience should feel like this:

```txt
A real backyard photo.
Three real rabbits.
One impossible beach ball game.
A small counter showing the game never stops.
```

The intended reaction is a quick visual joke, not active gameplay. The user does not need to click anything. The page starts immediately, continues automatically, and persists progress across refreshes.

The experience should be calm, funny, and polished. It should not look like an arcade game UI.

---

D00 Implementation Scope

---

Create exactly these primary project files:

```txt
index.html
styles.css
assets/bunny_original.png
```

`index.html` must contain the page structure and JavaScript. `styles.css` must contain all styling. `assets/bunny_original.png` must be copied from `specs/bunny_original.png`.

Do not create a framework app. Do not create React, Vue, Svelte, Angular, Vite, Webpack, or npm configuration. Do not require a server. The page should work as a plain local file.

Acceptable implementation technologies:

```txt
HTML
CSS
plain JavaScript
inline SVG
requestAnimationFrame
localStorage
```

Do not use:

```txt
npm
external libraries
external fonts
remote CDN files
HTML canvas
baked-in UI image overlays
ChatGPT Canvas editing feature
```

The production UI must be code-rendered on top of the clean background image.

---

E00 Runtime Asset Rules

---

At runtime, the page must load:

```txt
assets/bunny_original.png
```

The background image must remain clean. It must not contain the score chip, beach ball, motion trail, spark effects, or debug label baked into the file.

All animated and interactive visual elements must be separate DOM or SVG overlays.

The coding agent should copy the asset like this conceptually:

```txt
copy specs/bunny_original.png assets/bunny_original.png
```

Create the `assets` folder if it does not exist.

Do not move or modify files inside `specs`.

---

F00 Scene Coordinate System

---

The background image has the following verified dimensions:

```txt
width: 1672
height: 941
aspect ratio: 1672 / 941
origin: top-left
```

The scene overlay system must use this exact coordinate plane.

Use these constants in JavaScript:

```js
const SCENE = {
  width: 1672,
  height: 941,
  image: "assets/bunny_original.png"
};
```

Coordinate conversion must use image percentages:

```js
function xPct(x) {
  return `${(x / SCENE.width) * 100}%`;
}

function yPct(y) {
  return `${(y / SCENE.height) * 100}%`;
}
```

The CSS scene container must use:

```css
aspect-ratio: 1672 / 941;
```

Do not use `16 / 9` as the implementation ratio. It is visually close but not exact.

---

G00 Rabbit Coordinates

---

Use these verified rabbit anchor values exactly.

```js
const RABBITS = {
  left: {
    bbox: { x: 128, y: 430, w: 60, h: 49 },
    center: { x: 158, y: 455 },
    ballContact: { x: 170, y: 420 },
    ground: { x: 160, y: 477 },
    pulse: { x: 158, y: 455 }
  },
  middle: {
    bbox: { x: 847, y: 418, w: 34, h: 50 },
    center: { x: 864, y: 444 },
    ballContact: { x: 865, y: 402 },
    ground: { x: 864, y: 467 },
    pulse: { x: 864, y: 444 }
  },
  right: {
    bbox: { x: 1427, y: 456, w: 48, h: 48 },
    center: { x: 1450, y: 480 },
    ballContact: { x: 1445, y: 438 },
    ground: { x: 1452, y: 501 },
    pulse: { x: 1450, y: 480 }
  }
};
```

The `ballContact` point is the point the ball travels to. It is above the rabbit body so the ball appears to be tapped instead of covering the rabbit.

The `ground` point is where the ball shadow should project.

The `pulse` point is where the contact effect should appear.

The `bbox` values are for reference and optional debug rendering only. Do not render bounding boxes in production.

---

H00 Required Page Structure

---

Use a simple document structure like this:

```html
<body>
  <main class="page-shell">
    <section class="scene" id="scene" aria-label="Animated scene of three rabbits in a backyard passing a beach ball.">
      <img class="scene__image" src="assets/bunny_original.png" alt="">
      <svg class="scene-effects" id="sceneEffects" viewBox="0 0 1672 941" aria-hidden="true"></svg>
      <div class="ball-shadow" id="ballShadow" aria-hidden="true"></div>
      <div class="beach-ball" id="beachBall" aria-hidden="true"></div>
      <div class="score-chip" id="scoreChip" aria-hidden="true">
        <span>Passes:</span>
        <span class="score-chip__number" id="scoreNumber">000000</span>
      </div>
    </section>
  </main>
</body>
```

The actual markup can vary, but the final behavior must preserve these layers:

```txt
background image
SVG effects layer
ball shadow
beach ball
score chip
```

The score chip should be visually inside the scene. It should not scroll separately on desktop. On portrait mobile, it may remain pinned to the viewport if horizontal panning is used.

---

I00 Layout Behavior

---

The default layout should center the scene in the viewport.

Desktop and landscape behavior:

```txt
show the full scene
preserve exact image aspect ratio
use a subtle rounded card frame
hide overflow outside scene
```

Recommended CSS direction:

```css
html,
body {
  margin: 0;
  min-height: 100%;
  background: #f4f1eb;
}

.page-shell {
  min-height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.scene {
  position: relative;
  width: min(96vw, 1672px);
  aspect-ratio: 1672 / 941;
  overflow: hidden;
  border-radius: clamp(12px, 2vw, 30px);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
  background: #1f3a0d;
}

.scene__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

Phone portrait behavior should preserve usability. The rabbits are small, so do not shrink the scene until the rabbits become unreadable. Use horizontal panning if needed.

Preferred portrait rule:

```txt
when viewport is narrow, keep the scene wider than the viewport
allow horizontal scroll
keep the pass counter visible
do not distort the background image
```

A reasonable portrait implementation is:

```css
@media (orientation: portrait) and (max-width: 700px) {
  .page-shell {
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .scene {
    width: max(100vw, 980px);
    min-height: auto;
    border-radius: 0;
    box-shadow: none;
  }
}
```

The exact portrait width can be tuned, but the ball and rabbits must remain readable.

---

J00 Score Chip Behavior

---

The score chip should display:

```txt
Passes: 000000
```

The number should be zero-padded to at least six digits.

The chip should be placed at the top-left of the scene using the native coordinate placement:

```txt
x: 56
y: 56
```

CSS placement:

```css
left: calc(56 / 1672 * 100%);
top: calc(56 / 941 * 100%);
```

Use these colors:

```css
:root {
  --score-bg: rgba(255, 246, 225, 0.94);
  --score-border: rgba(92, 55, 24, 0.28);
  --score-label: #6b3f1f;
  --score-number: #d94a1e;
  --score-shadow: rgba(0, 0, 0, 0.18);
}
```

The score chip must animate briefly when the pass count changes.

Animation behavior:

```txt
on score increment:
scale chip from 1.00 to 1.08 and back to 1.00
move chip up by about 2 px at peak
duration about 220 ms
```

The chip must not bounce heavily, glow strongly, or distract from the ball.

---

K00 Ball Design

---

The beach ball must be code-rendered, preferably as inline SVG inside the `.beach-ball` element.

Ball size:

```txt
native diameter: 64 px
minimum useful diameter: 38 px
maximum useful diameter: 72 px
```

CSS sizing:

```css
.beach-ball {
  position: absolute;
  width: calc(64 / 1672 * 100%);
  aspect-ratio: 1;
  z-index: 16;
  transform: translate(-50%, -50%) rotate(var(--ball-rotation, 0deg)) scale(var(--ball-scale-x, 1), var(--ball-scale-y, 1));
  transform-origin: center;
  will-change: left, top, transform;
  pointer-events: none;
}
```

Use a colorful cartoon beach ball style:

```txt
white panel
orange-red panel
yellow panel
sky-blue panel
subtle outline
upper-left glossy highlight
subtle lower-right shade
small center cap
```

Use these colors:

```css
:root {
  --ball-white: #f7f7ef;
  --ball-orange: #e9542a;
  --ball-yellow: #f5c12e;
  --ball-blue: #2f9fe3;
  --ball-outline: rgba(72, 50, 30, 0.32);
}
```

The ball should rotate continuously as it moves. It should briefly squash on contact:

```txt
contact squash: scaleX 1.15, scaleY 0.88
duration: about 100 ms
```

---

L00 Ball Motion

---

The ball loops through three passes:

```txt
left -> middle
middle -> right
right -> left
repeat forever
```

Use these pass constants exactly:

```js
const PASSES = [
  {
    id: "left-to-middle",
    from: "left",
    to: "middle",
    durationMs: 1700,
    p0: { x: 170, y: 420 },
    c1: { x: 340, y: 265 },
    c2: { x: 650, y: 265 },
    p3: { x: 865, y: 402 }
  },
  {
    id: "middle-to-right",
    from: "middle",
    to: "right",
    durationMs: 1650,
    p0: { x: 865, y: 402 },
    c1: { x: 1010, y: 285 },
    c2: { x: 1250, y: 285 },
    p3: { x: 1445, y: 438 }
  },
  {
    id: "right-to-left",
    from: "right",
    to: "left",
    durationMs: 2400,
    p0: { x: 1445, y: 438 },
    c1: { x: 1210, y: 205 },
    c2: { x: 480, y: 205 },
    p3: { x: 170, y: 420 }
  }
];
```

Use this easing:

```js
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
```

Use this cubic Bezier function:

```js
function cubicBezier(p0, c1, c2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * p3.y
  };
}
```

Each frame should compute the active pass from elapsed time, compute the eased progress, compute the Bezier point, and set the ball's `left` and `top` from that point.

---

M00 Ball Shadow

---

The shadow is a soft ellipse on the grass. It should not follow the ball vertically. It should follow the implied ground path between rabbits.

Use these ground points:

```js
const SHADOW_POINTS = {
  left: { x: 160, y: 477 },
  middle: { x: 864, y: 467 },
  right: { x: 1452, y: 501 }
};
```

For each pass, interpolate the shadow between the sender ground point and receiver ground point.

The shadow should shrink and fade when the ball is high in the arc.

Shadow behavior:

```txt
near contact: wider and darker
mid-flight: medium
high arc: smaller and lighter
```

Target values:

```txt
near contact: width 46 px, height 13 px, opacity 0.26
mid-flight: width 32 px, height 9 px, opacity 0.14
high arc: width 20 px, height 6 px, opacity 0.07
```

The shadow must be subtle enough that it does not look like a stain in the grass.

---

N00 Motion Trail

---

The trail is a short translucent path behind the moving ball. It explains direction and makes the ball feel animated.

The trail should be rendered in the SVG effects layer using a path based on recent points from the active pass.

Trail style:

```txt
color: rgba(255, 246, 225, 0.26)
opacity range: 0.16 to 0.32
width at native scale: 8 px to 18 px
blur: 3 px to 8 px
shape: curved ribbon or soft stroke
```

The trail must not show the entire pass path. It should show only the recent arc behind the ball.

Pass-specific behavior:

```txt
left-to-middle: medium trail
middle-to-right: medium-high trail
right-to-left: longer and softer trail
```

The trail should fade before the receiving rabbit. It should not cover rabbit faces.

---

O00 Impact Effects

---

When a pass completes, trigger a short contact effect on the receiving rabbit.

Use these pulse points:

```js
const PULSE_POINTS = {
  left: { x: 158, y: 455 },
  middle: { x: 864, y: 444 },
  right: { x: 1450, y: 480 }
};
```

Use this tuning:

```js
const IMPACT = {
  left: {
    pulseRadius: 42,
    sparkleRadius: 28,
    tapLineDirection: "up-right"
  },
  middle: {
    pulseRadius: 48,
    sparkleRadius: 34,
    tapLineDirection: "up-both"
  },
  right: {
    pulseRadius: 42,
    sparkleRadius: 28,
    tapLineDirection: "up-left"
  }
};
```

Required effects at contact:

```txt
spark burst: 180 ms, 4 to 6 short rays
tap lines: 260 ms, 3 curved strokes
ground pulse: 360 ms, thin oval ring fading outward
ball squash: 100 ms
score bump: 220 ms
```

Effect colors:

```css
:root {
  --spark-color: #fff7cf;
  --pulse-color: rgba(255, 247, 207, 0.56);
}
```

The middle rabbit can have the clearest contact effect. The left and right rabbit effects should be quieter.

---

P00 Persistence And Pass Counting

---

The project must persist game state in `localStorage`.

Use this key:

```js
const STORAGE_KEY = "bunnyVolleyball.v1";
```

Store only the start timestamp:

```json
{
  "startEpochMs": 1781111111111
}
```

Do not store frame-by-frame animation data.

On first load:

```txt
if localStorage has no valid state:
  create startEpochMs = Date.now()
  save it
```

On later loads:

```txt
read startEpochMs
elapsedMs = Date.now() - startEpochMs
derive pass count, active pass, and ball position from elapsedMs
```

Cycle timing:

```js
const TIMING = {
  cycleMs: 5750,
  passesPerCycle: 3
};
```

Completed pass calculation:

```js
function getCompletedPasses(elapsedMs) {
  const fullCycles = Math.floor(elapsedMs / 5750);
  const remainder = elapsedMs % 5750;

  let segmentPasses = 0;

  if (remainder >= 1700) segmentPasses = 1;
  if (remainder >= 1700 + 1650) segmentPasses = 2;

  return fullCycles * 3 + segmentPasses;
}
```

The counter must continue across refresh. If the user closes the page and returns later, the count should advance as if the rabbits kept playing.

---

Q00 Animation Loop

---

Use `requestAnimationFrame`.

Per frame, do this:

```txt
read Date.now()
compute elapsedMs
resolve active pass
compute local progress within active pass
apply easing
compute ball x/y with cubic Bezier
compute shadow x/y/size/opacity
compute ball rotation
update trail path
compute completed pass count
if count changed, trigger score and impact effects
request next frame
```

The animation loop should be deterministic from time. Refreshing the page should not restart the visual state unless `localStorage` is cleared.

Main path motion should be JavaScript-driven, not CSS keyframes, because the position, score, pass state, and persistence all need shared timing.

---

R00 Responsive Design

---

The project must support:

```txt
desktop landscape
laptop landscape
tablet landscape
tablet portrait
phone landscape
phone portrait
```

Desktop and landscape behavior:

```txt
show full scene
center scene
preserve aspect ratio
show score chip inside top-left of scene
no scrollbars unless viewport is extremely small
```

Portrait behavior:

```txt
preserve useful rabbit size
allow horizontal panning when needed
keep score visible
avoid shrinking rabbits into unreadable dots
do not distort the image
```

Optional soft-follow behavior for portrait:

```txt
on load, center viewport around current ball position
if user has not manually scrolled, gently follow ball horizontally
after manual scroll or touch input, disable auto-follow for 6 seconds
after idle period, resume soft-follow
```

Soft-follow should interpolate:

```js
scrollLeft += (targetScrollLeft - scrollLeft) * 0.06;
```

Do not force-scroll aggressively. User input always wins.

---

S00 Reduced Motion And Accessibility

---

Support:

```css
@media (prefers-reduced-motion: reduce) {
}
```

Reduced-motion behavior:

```txt
slow the ball
reduce or disable trail
disable score bump
reduce or disable spark effects
disable portrait auto-follow
keep shadow visible
```

The scene should have an accessible label describing the visual experience.

Recommended scene label:

```txt
Animated scene of three rabbits in a backyard passing a beach ball.
```

The decorative ball and SVG effect layers can be `aria-hidden="true"`.

The score chip can be visual-only. Do not create noisy live-region announcements for every pass because the score changes continuously.

---

T00 Debug Mode

---

The mockup contained a `B1` label. Production must not show it.

Optional debug mode may show it only when the URL includes:

```txt
?debug=1
```

Debug mode may also show rabbit anchor points, bounding boxes, or current coordinates, but only if explicitly enabled by query parameter.

Normal production view must show:

```txt
no B1 label
no coordinate grid
no anchor markers
no bounding boxes
```

---

U00 Implementation Constants Summary

---

Use this block as the implementation source of truth.

```js
const SCENE = {
  width: 1672,
  height: 941,
  image: "assets/bunny_original.png"
};

const STORAGE_KEY = "bunnyVolleyball.v1";

const RABBITS = {
  left: {
    bbox: { x: 128, y: 430, w: 60, h: 49 },
    center: { x: 158, y: 455 },
    ballContact: { x: 170, y: 420 },
    ground: { x: 160, y: 477 },
    pulse: { x: 158, y: 455 }
  },
  middle: {
    bbox: { x: 847, y: 418, w: 34, h: 50 },
    center: { x: 864, y: 444 },
    ballContact: { x: 865, y: 402 },
    ground: { x: 864, y: 467 },
    pulse: { x: 864, y: 444 }
  },
  right: {
    bbox: { x: 1427, y: 456, w: 48, h: 48 },
    center: { x: 1450, y: 480 },
    ballContact: { x: 1445, y: 438 },
    ground: { x: 1452, y: 501 },
    pulse: { x: 1450, y: 480 }
  }
};

const BALL = {
  diameter: 64,
  minDiameter: 38,
  maxDiameter: 72
};

const PASSES = [
  {
    id: "left-to-middle",
    from: "left",
    to: "middle",
    durationMs: 1700,
    p0: { x: 170, y: 420 },
    c1: { x: 340, y: 265 },
    c2: { x: 650, y: 265 },
    p3: { x: 865, y: 402 }
  },
  {
    id: "middle-to-right",
    from: "middle",
    to: "right",
    durationMs: 1650,
    p0: { x: 865, y: 402 },
    c1: { x: 1010, y: 285 },
    c2: { x: 1250, y: 285 },
    p3: { x: 1445, y: 438 }
  },
  {
    id: "right-to-left",
    from: "right",
    to: "left",
    durationMs: 2400,
    p0: { x: 1445, y: 438 },
    c1: { x: 1210, y: 205 },
    c2: { x: 480, y: 205 },
    p3: { x: 170, y: 420 }
  }
];

const TIMING = {
  cycleMs: 5750,
  passesPerCycle: 3
};
```

---

V00 Coding Agent Work Plan

---

The coding agent should implement in this order.

Step 1: Confirm the working directory contains `specs/bunny_original.png`, `specs/bunny_mockup.png`, and `specs/design_spec.md`.

Step 2: Create `assets` in the working directory if it does not exist.

Step 3: Copy `specs/bunny_original.png` to `assets/bunny_original.png`.

Step 4: Create `index.html` in the working directory root.

Step 5: Create `styles.css` in the working directory root.

Step 6: Build the static scene layout with the background image and exact `1672 / 941` aspect ratio.

Step 7: Add the score chip with correct placement, colors, font stack, and number formatting.

Step 8: Add inline SVG beach ball markup and position it with JavaScript.

Step 9: Add the animation loop using `requestAnimationFrame`, Bezier motion, and elapsed-time state.

Step 10: Add localStorage persistence using `bunnyVolleyball.v1`.

Step 11: Add ball shadow interpolation and dynamic opacity/size.

Step 12: Add SVG motion trail behind the ball.

Step 13: Add impact effects at receiving rabbit points.

Step 14: Add responsive behavior for desktop, landscape, and portrait.

Step 15: Add reduced-motion behavior.

Step 16: Add optional debug behavior only behind `?debug=1`.

Step 17: Run acceptance checks manually and inspect code before reporting completion.

---

W00 Implementation Notes For Developer Judgment

---

The exact design goal is not raw physical realism. It is readable comic motion over a real photo.

The ball should feel slightly magical but not noisy. The rabbits should remain natural. The animation should help the eye understand the pass cycle.

Prefer subtle animation over excessive effects. The best result is when the user first sees a normal backyard, then notices the small absurd volleyball loop.

The score should feel like a casual-game HUD, but it should not become the logo or headline. The pass counter exists to communicate continuity, not to dominate the composition.

The right-to-left pass is intentionally longer and higher. It should be the funniest pass because it crosses the whole yard.

The middle rabbit is the clearest interaction point, so its impact effect can be slightly stronger than the left and right rabbits.

---

X00 Acceptance Checklist

---

The coding agent must report completion only after validating every checklist line below. Each line contains at least two verifications and both must pass.

| Check                  | Required verification                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| File placement         | Verify `index.html` exists in the project root, and verify it was not created inside `specs`.                                                     |
| Stylesheet placement   | Verify `styles.css` exists in the project root, and verify `index.html` links to `styles.css` with a relative path.                               |
| Asset copy             | Verify `assets/bunny_original.png` exists, and verify the runtime image path points to `assets/bunny_original.png`.                               |
| Specs preservation     | Verify files inside `specs` were not deleted or modified, and verify `bunny_mockup.png` is not used as the runtime background.                    |
| Static implementation  | Verify the page works without npm or a build step, and verify there are no framework imports or CDN dependencies.                                 |
| Exact aspect ratio     | Verify `.scene` uses `aspect-ratio: 1672 / 941`, and verify overlay coordinate math uses width `1672` and height `941`.                           |
| Background rendering   | Verify the clean backyard image fills the scene, and verify no UI elements are baked into the background image.                                   |
| Rabbit constants       | Verify the left, middle, and right rabbit constants match this spec, and verify the right contact point is `x: 1445, y: 438`.                     |
| Ball implementation    | Verify the ball is rendered as code or inline SVG, and verify it is not loaded as an external ball image.                                         |
| Ball size              | Verify the native ball diameter is based on `64 px`, and verify CSS scales it relative to the scene instead of fixed viewport-only sizing.        |
| Ball path              | Verify the three Bezier pass definitions match this spec, and verify the loop order is left-to-middle, middle-to-right, right-to-left.            |
| Animation loop         | Verify motion is driven by `requestAnimationFrame`, and verify the active pass is derived from elapsed time rather than CSS keyframe-only timing. |
| Score persistence      | Verify `localStorage` uses key `bunnyVolleyball.v1`, and verify refreshing the page does not reset the displayed pass count.                      |
| Pass counting          | Verify one completed pass increments the counter once, and verify the total cycle duration is `5750 ms`.                                          |
| Score chip visual      | Verify the score chip uses a cream rounded pill with brown label text, and verify the number color uses the darker orange token `#d94a1e`.        |
| Score chip placement   | Verify the score chip is positioned from native point `x: 56, y: 56`, and verify it does not cover any rabbit.                                    |
| Score chip animation   | Verify the score chip bumps briefly when the count changes, and verify the animation is disabled or reduced under reduced-motion settings.        |
| Shadow behavior        | Verify the shadow is an ellipse on the grass, and verify its opacity and size change based on ball height.                                        |
| Shadow coordinates     | Verify the shadow uses rabbit ground points, and verify it does not simply follow the ball's vertical screen position.                            |
| Motion trail           | Verify the trail is short and follows recent ball motion, and verify it does not render the entire pass path permanently.                         |
| Impact effects         | Verify spark or tap effects appear at the receiving rabbit, and verify they disappear quickly after contact.                                      |
| Ball squash            | Verify the ball briefly squashes at contact, and verify it returns to normal scale before continuing visibly.                                     |
| Production debug state | Verify `B1` is hidden in normal mode, and verify any debug labels or anchor markers appear only with `?debug=1`.                                  |
| Desktop layout         | Verify the full scene is visible on desktop landscape, and verify the scene remains centered with no image distortion.                            |
| Phone landscape layout | Verify the full scene remains visible in phone landscape, and verify the score chip remains readable.                                             |
| Phone portrait layout  | Verify portrait mode preserves readable rabbit and ball size, and verify horizontal panning works if the scene is wider than the viewport.        |
| User scroll control    | Verify any auto-follow behavior pauses after manual scroll or touch, and verify it resumes only after the specified idle period if implemented.   |
| Reduced motion         | Verify `prefers-reduced-motion: reduce` changes animation behavior, and verify the experience remains understandable with reduced effects.        |
| Accessibility          | Verify the scene has an accessible description or label, and verify decorative animated elements are hidden from assistive technology.            |
| No extra UI            | Verify there are no buttons, menus, instructions, leaderboards, or settings panels, and verify the only persistent UI is the pass counter.        |
| Visual restraint       | Verify the rabbits remain visible and unobscured, and verify the ball/effects are playful but not visually dominant over the photo.               |
| Offline behavior       | Verify the page can run from local files, and verify all runtime assets are local relative paths.                                                 |
| Final reporting        | Verify all acceptance checks were reviewed, and verify completion is reported only after code and visual behavior were inspected.                 |

---

Y00 Final Completion Report Format

---

When finished, the coding agent should report in this format:

```txt
Implemented Bunny Volleyball static page.

Created:
- index.html
- styles.css
- assets/bunny_original.png

Verified:
- local static page loads
- background image renders
- ball loops between all three rabbits
- pass counter persists through refresh
- responsive behavior works for desktop, landscape, and portrait
- reduced-motion behavior is present
- no production B1/debug label is visible
- no external dependencies are used

Acceptance checklist:
- all checks passed
```

If any checklist item fails, do not claim full completion. Report the failed item and the fix needed.
