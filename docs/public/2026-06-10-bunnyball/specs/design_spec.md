2026-06-10

---

A01 Product Intent

---

Create a static, dependency-free web experience where three real rabbits in a backyard appear to play an infinite volleyball-style passing game with a cartoon beach ball.

The page should feel like a natural backyard photograph with a small animated joke layered on top. The game layer should be playful, visible, and readable, but restrained. The interface must not look like a game menu, dashboard, or control panel.

The primary visual story is:

```txt
Three real rabbits are sitting across the yard.
A cartoon beach ball travels between them.
Each rabbit appears to tap or pass the ball.
A small pass counter shows that the game has been continuing over time.
```

The viewer should understand the scene within two seconds without instruction text.

The design balance target is:

```txt
natural photo: 85%
playful overlay: 15%
```

---

B01 Asset Inventory

---

Use the clean 16:9-style image as the production background plate.

```txt
asset name: bunny_original.png
pixel width: 1672
pixel height: 941
exact aspect ratio: 1672 / 941
role: production background image
```

Use the mockup image only as a visual reference for overlay style.

```txt
asset name: bunny_mockup.png
role: reference for score chip, ball style, motion trail, impact sparkle, and general tone
```

The production implementation must not use the mockup image as the background. The production implementation must use `bunny_original.png` as the background and rebuild all game elements programmatically with HTML, CSS, SVG, and JavaScript.

The rabbits are part of the background image. Do not redraw, replace, crop, mask, or overlay cartoon rabbits.

---

C01 Visual Priority Stack

---

| Priority | Element                         | Design role                                                     |
| -------: | ------------------------------- | --------------------------------------------------------------- |
|        1 | Rabbits                         | Main characters and reason the page exists.                     |
|        2 | Beach ball                      | Main action object and gameplay signal.                         |
|        3 | Motion trail and impact effects | Explain pass direction and contact timing.                      |
|        4 | Pass counter                    | Communicates continuity and gives the scene a light game layer. |
|        5 | Scene card framing              | Makes the demo feel polished without becoming the focus.        |

The rabbits must remain visible at all times. The ball must be more visually prominent than the score chip. The score chip must be readable but secondary. Effects must be short-lived and subtle.

---

D01 Coordinate System

---

All scene-bound overlay elements must use the native image coordinate system.

```txt
origin: top-left
width: 1672
height: 941
unit: image pixels
```

Use the exact image ratio, not a rounded 16:9 ratio.

```css
.scene {
  aspect-ratio: 1672 / 941;
}
```

Overlay coordinates must be converted to percentages to preserve alignment when the scene scales.

```js
const SCENE = {
  width: 1672,
  height: 941,
  image: "bunny_original.png"
};

function xPct(x) {
  return `${(x / SCENE.width) * 100}%`;
}

function yPct(y) {
  return `${(y / SCENE.height) * 100}%`;
}
```

The background image, ball, shadow, motion trail, impact effects, and rabbit anchor points must share one coordinate plane.

---

E01 Rabbit Anchors

---

The verified rabbit coordinates are:

| Rabbit |       Visual bounding box | Visual center | Ball contact point |  Ground point |   Pulse point |
| ------ | ------------------------: | ------------: | -----------------: | ------------: | ------------: |
| Left   |  x 128, y 430, w 60, h 49 |  x 158, y 455 |       x 170, y 420 |  x 160, y 477 |  x 158, y 455 |
| Middle |  x 847, y 418, w 34, h 50 |  x 864, y 444 |       x 865, y 402 |  x 864, y 467 |  x 864, y 444 |
| Right  | x 1427, y 456, w 48, h 48 | x 1450, y 480 |      x 1445, y 438 | x 1452, y 501 | x 1450, y 480 |

Use this implementation object:

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

The ball contact points are intentionally above the visible rabbit bodies. The ball should appear to be tapped above or slightly in front of each rabbit, not physically collide with the rabbit pixels.

---

F01 Scene Node Structure

---

The implementation should use this visual layer structure:

| Node ID | Node name           | Layer | Requirement                                                            |
| ------- | ------------------- | ----: | ---------------------------------------------------------------------- |
| N01     | Page shell          |     0 | Full viewport root. Controls page background, centering, and overflow. |
| N02     | Scene viewport      |     1 | Framed area containing the background image and scene overlays.        |
| N03     | Background image    |     2 | `bunny_original.png`, full scene coverage.                             |
| N04     | Rabbit anchor layer |     3 | Invisible anchor elements for calculations and optional debug mode.    |
| N05     | Ball shadow         |     4 | Soft ellipse projected onto the grass.                                 |
| N06     | Motion trail        |     5 | Short translucent curved trail behind the ball.                        |
| N07     | Impact effects      |     6 | Spark, pulse ring, and tap lines near the receiving rabbit.            |
| N08     | Beach ball          |     7 | Main animated inline SVG ball.                                         |
| N09     | Score chip          |     8 | HUD element showing completed passes.                                  |
| N10     | Debug label         |     9 | Optional variant label only when debug mode is enabled.                |

The score chip may be positioned relative to the scene viewport. The ball, trail, shadow, and impact effects must be positioned relative to the scene coordinate plane.

---

G01 Background Presentation

---

The production scene should look like a polished image card on desktop and a clean full-scene experience on smaller screens.

Desktop scene treatment:

| Property           | Value                            |
| ------------------ | -------------------------------- |
| Scene width        | `min(96vw, 1672px)`              |
| Scene aspect ratio | `1672 / 941`                     |
| Scene radius       | 24 px to 32 px                   |
| Scene shadow       | Soft, low-opacity page shadow    |
| Page background    | Off-white or very pale warm gray |
| Image fit          | Full cover of scene frame        |
| Scene overflow     | Hidden                           |

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

On very small screens, reduce the radius and shadow so the frame does not waste space.

---

H01 Score Chip

---

The score chip communicates that the rabbits are continuously passing the ball.

The chip text format is:

```txt
Passes: 004912
```

The number must be generated from the persisted pass count, not hard-coded.

Native scene placement:

```txt
left: 56 px
top: 56 px
height: approximately 52 px
horizontal padding: 18 px
vertical padding: 11 px
```

The score chip should sit in the upper-left area. It must not cover the left rabbit. It may overlap tree foliage or sky, so the background must be opaque enough for contrast.

Use these color tokens:

```css
:root {
  --score-bg: rgba(255, 246, 225, 0.94);
  --score-border: rgba(92, 55, 24, 0.28);
  --score-label: #6b3f1f;
  --score-number: #d94a1e;
  --score-shadow: rgba(0, 0, 0, 0.18);
}
```

Recommended CSS:

```css
.score-chip {
  position: absolute;
  left: calc(56 / 1672 * 100%);
  top: calc(56 / 941 * 100%);
  z-index: 20;
  display: inline-flex;
  align-items: baseline;
  gap: 0.45em;
  min-height: 52px;
  box-sizing: border-box;
  padding: 11px 18px;
  border-radius: 999px;
  background: var(--score-bg);
  border: 1px solid var(--score-border);
  box-shadow: 0 6px 18px var(--score-shadow);
  color: var(--score-label);
  font-family: "Comic Sans MS", "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif;
  font-size: clamp(16px, 1.55vw, 26px);
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
}

.score-chip__number {
  color: var(--score-number);
  font-weight: 800;
  letter-spacing: 0.035em;
}
```

When the score changes, the chip should perform one short bump.

```txt
duration: 220 ms
scale: 1.00 -> 1.08 -> 1.00
vertical offset at peak: -2 px
effect intensity: subtle
```

The chip must not use a long bounce, confetti, or a large glow.

---

I01 Debug Label Policy

---

The `B1` label from the mockup is not part of the production UI.

Production behavior:

```txt
B1 label: hidden
```

Debug behavior:

```txt
visible only when debug mode is enabled
example trigger: ?debug=1
text: B1
position: top center
purpose: internal visual variant identification
```

Normal users should never see the `B1` label.

---

J01 Beach Ball Design

---

The ball is the main animated object and should be implemented as inline SVG.

Native size:

```txt
default diameter: 64 px
minimum useful diameter: 38 px
maximum useful diameter: 72 px
```

Recommended CSS sizing:

```css
.ball {
  position: absolute;
  width: calc(64 / 1672 * 100%);
  aspect-ratio: 1;
  z-index: 16;
  transform: translate(-50%, -50%) rotate(var(--ball-rotation, 0deg)) scale(var(--ball-scale-x, 1), var(--ball-scale-y, 1));
  transform-origin: center;
  will-change: left, top, transform;
}
```

Ball visual requirements:

| Component      | Requirement                                   |
| -------------- | --------------------------------------------- |
| Outer shape    | Circle with subtle warm dark outline          |
| Panels         | White, orange-red, yellow, sky blue           |
| Highlight      | Upper-left glossy highlight                   |
| Shade          | Slight lower-right shade                      |
| Finish         | Realistic cartoon, not flat icon              |
| Rotation       | Continuous, tied to animation progress        |
| Contact squash | Brief horizontal squash when a pass completes |

Use this palette:

```css
:root {
  --ball-white: #f7f7ef;
  --ball-orange: #e9542a;
  --ball-yellow: #f5c12e;
  --ball-blue: #2f9fe3;
  --ball-outline: rgba(72, 50, 30, 0.32);
}
```

The ball should be readable against grass, fence, and sky. It should not become so large that it looks closer to the camera than the rabbits.

---

K01 Ball Motion Path

---

The animation loop is:

```txt
left rabbit -> middle rabbit -> right rabbit -> left rabbit -> repeat
```

Use cubic Bezier curves for all passes.

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

The right-to-left pass should be the longest, highest, and slowest pass. It should feel like the comic return shot.

Use this easing function:

```js
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
```

Use this Bezier calculation:

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

The ball should accelerate gently away from the sender and slow slightly near the receiver.

---

L01 Motion Trail

---

The motion trail communicates direction and speed. It should be a short translucent curved segment behind the ball, not a permanent full-path line.

Visual requirements:

| Property | Value                                             |
| -------- | ------------------------------------------------- |
| Color    | Warm white                                        |
| Opacity  | 0.16 to 0.32                                      |
| Width    | 8 px to 18 px at native scale                     |
| Blur     | 3 px to 8 px                                      |
| Shape    | Curved ribbon, tapered tail                       |
| Position | Behind the ball, above the photo                  |
| Lifespan | Continuous but short, tracking recent motion only |

Use this token:

```css
:root {
  --trail-color: rgba(255, 246, 225, 0.26);
}
```

Trail length by pass:

| Pass            | Trail behavior          |
| --------------- | ----------------------- |
| Left to middle  | Medium trail            |
| Middle to right | Medium-high trail       |
| Right to left   | Longer and softer trail |

The trail should not obscure rabbit faces. It should fade before the receiving rabbit.

---

M01 Ball Shadow

---

The ball shadow gives the ball physical connection to the lawn.

Use corrected rabbit ground points:

```js
const SHADOW_POINTS = {
  left: { x: 160, y: 477 },
  middle: { x: 864, y: 467 },
  right: { x: 1452, y: 501 }
};
```

The shadow should be a soft ellipse. It should be interpolated between the sender and receiver ground points for each pass, not placed directly below the ball's screen y-coordinate.

Shadow behavior:

| Ball state   | Width | Height | Opacity |
| ------------ | ----: | -----: | ------: |
| Near contact | 46 px |  13 px |    0.26 |
| Mid-flight   | 32 px |   9 px |    0.14 |
| High arc     | 20 px |   6 px |    0.07 |

Recommended CSS base:

```css
.ball-shadow {
  position: absolute;
  z-index: 14;
  width: calc(var(--shadow-width, 32) / 1672 * 100%);
  aspect-ratio: 4 / 1;
  border-radius: 999px;
  background: rgba(0, 0, 0, var(--shadow-opacity, 0.14));
  filter: blur(5px);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
```

The shadow must remain subtle. It should be visible enough to ground the ball but not look like a dark spot on the grass.

---

N01 Impact Effects

---

Impact effects fire when a pass completes.

At each completed pass:

```txt
The receiving rabbit gets a short spark effect.
The ball briefly squashes.
The pass counter increments.
A faint ground pulse expands and fades.
The next pass begins immediately.
```

Use corrected pulse points:

```js
const PULSE_POINTS = {
  left: { x: 158, y: 455 },
  middle: { x: 864, y: 444 },
  right: { x: 1450, y: 480 }
};
```

Impact tuning:

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

Impact durations:

| Effect       | Duration | Design requirement                           |
| ------------ | -------: | -------------------------------------------- |
| Spark burst  |   180 ms | 4 to 6 short white-yellow rays               |
| Tap lines    |   260 ms | 3 curved strokes, white at about 70% opacity |
| Ground pulse |   360 ms | Thin oval ring on grass, fades outward       |
| Ball squash  |   100 ms | `scaleX(1.15) scaleY(0.88)` then normal      |

The middle rabbit may have the clearest impact effect because it is near the center of the frame. The left and right effects should be slightly quieter.

Use these effect colors:

```css
:root {
  --spark-color: #fff7cf;
  --pulse-color: rgba(255, 247, 207, 0.56);
}
```

---

O01 Pass Counter Logic

---

The score is the number of completed passes.

A pass is completed when the ball reaches the receiver.

Use local storage so the score continues across refreshes.

```js
const STORAGE_KEY = "bunnyVolleyball.v1";
```

Stored state:

```json
{
  "startEpochMs": 1781111111111
}
```

On first load:

```txt
Create startEpochMs from Date.now().
Store it under STORAGE_KEY.
```

On later loads:

```txt
Read startEpochMs from localStorage.
Compute elapsedMs as Date.now() - startEpochMs.
Derive current pass, pass progress, ball position, and completed pass count from elapsedMs.
```

Total cycle timing:

```txt
left-to-middle: 1700 ms
middle-to-right: 1650 ms
right-to-left: 2400 ms
total cycle: 5750 ms
passes per cycle: 3
```

Completed pass calculation:

```js
const CYCLE_MS = 5750;

function getCompletedPasses(elapsedMs) {
  const fullCycles = Math.floor(elapsedMs / CYCLE_MS);
  const remainder = elapsedMs % CYCLE_MS;

  let segmentPasses = 0;

  if (remainder >= 1700) segmentPasses = 1;
  if (remainder >= 1700 + 1650) segmentPasses = 2;

  return fullCycles * 3 + segmentPasses;
}
```

The counter should increment exactly once per completed pass.

---

P01 State Communication

---

The game state should be communicated through motion, not through controls.

| State                 | Visual communication                                     |
| --------------------- | -------------------------------------------------------- |
| Ball leaving rabbit   | Ball accelerates away and trail begins.                  |
| Ball in flight        | Arc, rotation, and shadow communicate motion and height. |
| Ball nearing receiver | Ball slows slightly near contact point.                  |
| Rabbit contact        | Spark, tap lines, pulse, ball squash, and score bump.    |
| Pass complete         | Counter increments by one.                               |
| Loop continuation     | Next arc begins immediately.                             |

There should be no start button, pause button, menu, instruction card, or visible state text.

---

Q01 Timing Model

---

Use continuous animation with `requestAnimationFrame`.

Each frame should:

```txt
Read Date.now().
Compute elapsedMs from persisted startEpochMs.
Resolve the active pass segment.
Resolve normalized progress from 0 to 1.
Apply easing.
Compute ball x and y from the active cubic Bezier path.
Compute shadow x, y, size, and opacity.
Update ball rotation.
Update trail geometry.
Update score if completed pass changed.
Trigger impact effects only at pass boundaries.
Request the next frame.
```

The animation should not use CSS keyframes for the main ball path. JavaScript is required for exact position control, pass counting, persistence, and reduced-motion logic.

The ball should have no long pause at the rabbits. The visual contact should happen through squash and impact effects while the next path begins.

---

R01 Responsive Behavior

---

Desktop and landscape screens should display the full scene.

```txt
desktop: fit full scene inside viewport
tablet landscape: fit full scene inside viewport
phone landscape: fit full scene inside viewport
phone portrait: preserve useful rabbit size and allow horizontal panning if needed
```

Portrait mobile should not shrink the scene so much that rabbits become unreadable.

Preferred portrait behavior:

| Behavior          | Requirement                                              |
| ----------------- | -------------------------------------------------------- |
| Scene width       | Keep large enough that rabbits and ball remain readable. |
| Horizontal scroll | Allowed.                                                 |
| Vertical scroll   | Avoid unless viewport height is too small.               |
| Score chip        | Fixed to viewport or pinned inside visible scene area.   |
| Ball follow       | Optional soft auto-follow.                               |

Optional auto-follow behavior:

```txt
On load, center the current ball position.
While the user is not touching or scrolling, softly follow the ball.
After manual scroll, disable auto-follow for 6 seconds.
After 6 seconds of no user input, resume soft follow.
```

Auto-follow should use interpolation, not abrupt jumps.

```js
scrollLeft += (targetScrollLeft - scrollLeft) * 0.06;
```

---

S01 Accessibility And Reduced Motion

---

The page should support `prefers-reduced-motion: reduce`.

Reduced-motion behavior:

| Element       | Reduced behavior                                 |
| ------------- | ------------------------------------------------ |
| Ball          | Still moves, but slower.                         |
| Trail         | Lower opacity or disabled.                       |
| Score bump    | Disabled.                                        |
| Spark effects | Reduced or disabled.                             |
| Auto-follow   | Disabled.                                        |
| Shadow        | Still present, because it helps spatial reading. |

The score chip must remain readable over both bright sky and dark tree foliage. The cream background is required for contrast.

Recommended offscreen accessible description:

```txt
Animated scene of three rabbits in a backyard passing a beach ball. The pass counter shows the number of completed passes.
```

The decorative SVG ball may be hidden from assistive technology if the scene description is provided elsewhere.

---

T01 Implementation Rules

---

The implementation should use static web technologies only.

Allowed:

```txt
HTML
CSS
JavaScript
inline SVG
localStorage
requestAnimationFrame
```

Not allowed:

```txt
external frameworks
external icon libraries
external font files
remote scripts
remote assets
canvas rendering
baked-in UI inside the background image
```

The background must remain a normal image file.

```txt
background file: bunny_original.png
```

The ball, trail, shadow, pulse, and spark effects must be code-rendered overlays.

The ChatGPT Canvas editing feature must not be used for this work. The specification and implementation should remain in normal chat output or normal files only.

---

U01 Visual Restraint Rules

---

Do not add decorative UI beyond the required elements.

Avoid:

```txt
menus
buttons
settings panels
sound controls
large titles
volleyball net
cartoon rabbit overlays
confetti
leaderboards
progress bars
instruction cards
extra animal characters
```

Permitted:

```txt
score chip
beach ball
ball shadow
motion trail
impact sparkle
tap lines
subtle ground pulse
subtle scene card
debug label only in debug mode
```

The final result should be cleaner than the mockup while preserving the same playful idea.

---

V01 Acceptance Criteria

---

| Requirement               | Pass condition                                                              |
| ------------------------- | --------------------------------------------------------------------------- |
| Background                | Uses `bunny_original.png` as a clean natural backyard scene.                |
| Coordinate accuracy       | Uses exact `1672 / 941` coordinate plane.                                   |
| Rabbit alignment          | Ball contact points align with verified rabbit positions.                   |
| Right rabbit correction   | Right rabbit target uses x 1445, y 438, not the older x 1424 value.         |
| Game readability          | The viewer understands the rabbits are passing the ball within two seconds. |
| UI restraint              | Score chip is readable but not dominant.                                    |
| Animation polish          | Ball arc, rotation, shadow, trail, and impact effects feel coordinated.     |
| Persistence               | Refreshing the page does not reset the pass count.                          |
| Responsiveness            | Desktop and landscape display the full scene; portrait remains usable.      |
| No dependencies           | The page works offline with local files only.                               |
| No production debug label | `B1` is hidden unless debug mode is explicitly enabled.                     |
| No Canvas usage           | Work is not performed through ChatGPT Canvas.                               |

---

W01 Final Visual Direction

---

The final page should feel like a real sunny backyard photograph with one small impossible event layered on top: three rabbits casually playing volleyball with a beach ball.

The photograph should carry the atmosphere. The ball should carry the action. The score chip should carry continuity. The effects should only clarify direction and contact.

The target impression is:

```txt
quiet backyard
real rabbits
one cartoon beach ball
small playful counter
no unnecessary controls
```

---

X01 Verified Color Palette

---

The image supports warm cream UI, brown label text, orange numeric emphasis, and saturated beach ball panels.

Representative visual regions:

| Region          | Approx color | Design implication                                             |
| --------------- | -----------: | -------------------------------------------------------------- |
| Clear sky       |      #84bce9 | Use sky blue as one beach ball panel color.                    |
| Cloud highlight |      #e3eaf3 | Use off-white highlights instead of pure white where possible. |
| Fence midtone   |      #7d340d | Use warm brown for label text and borders.                     |
| Fence shadow    |      #632708 | Keep dark brown shadows low-opacity.                           |
| Sunlit grass    |      #2f5803 | Use cream score background for contrast.                       |
| Shadow grass    |      #2a4d03 | Avoid transparent orange text directly on grass.               |
| Tree dark       |      #192102 | Keep score chip background opaque enough over foliage.         |

Final UI color tokens:

```css
:root {
  --ui-cream: #fff6e1;
  --ui-brown: #6b3f1f;
  --ui-orange: #d94a1e;
  --ui-border-brown: rgba(92, 55, 24, 0.28);

  --score-bg: rgba(255, 246, 225, 0.94);
  --score-border: rgba(92, 55, 24, 0.28);
  --score-label: #6b3f1f;
  --score-number: #d94a1e;
  --score-shadow: rgba(0, 0, 0, 0.18);

  --trail-color: rgba(255, 246, 225, 0.26);
  --spark-color: #fff7cf;
  --pulse-color: rgba(255, 247, 207, 0.56);

  --ball-white: #f7f7ef;
  --ball-orange: #e9542a;
  --ball-yellow: #f5c12e;
  --ball-blue: #2f9fe3;
  --ball-outline: rgba(72, 50, 30, 0.32);
}
```

---

Y01 Corrected Constants Summary

---

Use these constants as the implementation source of truth.

```js
const SCENE = {
  width: 1672,
  height: 941,
  image: "bunny_original.png"
};

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

const STORAGE_KEY = "bunnyVolleyball.v1";
```
