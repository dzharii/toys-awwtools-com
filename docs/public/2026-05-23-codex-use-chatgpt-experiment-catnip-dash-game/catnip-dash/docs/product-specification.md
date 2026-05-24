---
kind: chatgpt-relay-reply
createdAt: 2026-05-24T07:15:52.499Z
source: chatgpt-ui-copy
clipboardFile: D:\projects2024\2026-05-23-codex-use-chatgpt-experiment\.tmp\chatgpt-relay\2026-05-24_00-15-52_clipboard.txt
---

---

G00 Catnip Dash Implementation Specification

---

Catnip Dash is a static HTML5 Canvas runner. A friendly domestic cat stays fixed near the left side of the screen while the world scrolls right-to-left. The player jumps over incoming garden and street obstacles. The game should feel like a short polished 16-bit-inspired arcade platformer, using original assets only.

No implementation code is requested in this specification.

---

H00 Folder and File Structure

---

Create one new folder for the game. Suggested folder name: `catnip-dash`.

```txt
catnip-dash/
  index.html
  styles.css
  game.js
  assets/
    cat-atlas.png
    obstacles-atlas.png
    environment-atlas.png
    ui-atlas.png
    README-assets.txt
```

All files must be local. No dependencies, no build step, no CDNs, no external fonts. The game must run by opening `index.html` directly and also from a simple static server.

The existing generated cat image exists locally, but its path, filename, dimensions, and licensing status are unknown. The developer should place the final gameplay-ready cat sprite sheet at `assets/cat-atlas.png`. If the existing image is used, it should be adapted into a consistent sprite/texture atlas rather than drawn as a single raw image.

---

I00 Technical Runtime Requirements

---

Use one HTML page, one CSS file, and one JavaScript file.

The game should use a single `<canvas>` element and the Canvas 2D API. All gameplay rendering should happen on the canvas. HTML may be used for page shell only.

Use `requestAnimationFrame` with delta time in seconds. Clamp delta time to a maximum of `0.033` seconds to avoid physics jumps after tab switching.

Logical canvas size: `960 x 540`.

Responsive behavior: maintain 16:9 aspect ratio. CSS should scale the canvas to fit within the viewport while preserving the internal logical resolution. The canvas drawing buffer should remain `960 x 540`; do not resize game physics based on screen size. Mouse and touch input should map from CSS pixel coordinates back to logical canvas coordinates.

Canvas background should fill the visible page with a dark neutral color outside the canvas area.

---

J00 Game States

---

Use these states: `ready`, `playing`, `paused`, and `gameOver`.

`ready`: show title, cat idle/run animation, static HUD preview, and prompt: "Press Space or Tap to Jump".

`playing`: world scrolls, obstacles spawn, score increases, speed ramps up, collisions are active.

`paused`: freeze gameplay and animation timers. Show centered "Paused" text and prompt: "Press P to Resume".

`gameOver`: freeze obstacle movement, play hit frame, show final score, best score, and prompt: "Press Space or Tap to Restart".

Restart behavior: from `gameOver`, reset score, speed, obstacles, decorative spawn timers, cat physics, and state to `playing`.

---

K00 World Layout and Coordinates

---

Coordinate system: top-left origin, positive X to the right, positive Y downward.

Logical canvas: `960 x 540`.

Ground top Y: `426`.

Ground visual area: Y `426` to `540`.

Cat fixed horizontal position: visual draw X `150`.

Cat visual draw size: `96 x 96`.

Cat visual foot position when grounded: Y `426`.

Cat draw Y when grounded: `426 - 96 = 330`.

Cat collision box when grounded: X `176`, Y `362`, W `50`, H `58`. This is intentionally smaller than the sprite for forgiving arcade collision.

Obstacle collision boxes should also be slightly smaller than their visual sprites, usually inset by `4-8` px horizontally and `4-6` px vertically.

Camera never moves. World motion is simulated by moving background layers, ground texture, obstacles, collectibles if added, and decorative birds from right to left.

---

L00 Cat Physics and Controls

---

The cat has one main action: jump.

Physics values, in logical pixels per second:

| Parameter                  |                                        Value |
| -------------------------- | -------------------------------------------: |
| Gravity                    |                                `2200 px/s^2` |
| Jump velocity              |                                  `-820 px/s` |
| Max fall velocity          |                                  `1300 px/s` |
| Ground Y                   |                                        `426` |
| Cat fixed X                |                          `150` visual draw X |
| Coyote time                |                                    `0.075 s` |
| Jump input buffer          |                                     `0.10 s` |
| Landing animation duration |                                     `0.10 s` |
| Hit freeze duration        | `0.35 s` before restart prompt is emphasized |

No double jump for version 1. The player may jump only when grounded or inside coyote time. If the player presses jump up to `0.10 s` before landing, the jump should trigger on landing.

Input mapping:

| Input                 | Behavior                                 |
| --------------------- | ---------------------------------------- |
| Space                 | Start, jump, or restart                  |
| Arrow Up              | Start, jump, or restart                  |
| W                     | Start, jump, or restart                  |
| Mouse click on canvas | Start, jump, or restart                  |
| Touch tap on canvas   | Start, jump, or restart                  |
| P                     | Pause or resume while playing            |
| Escape                | Pause while playing, resume while paused |

Prevent default browser scrolling for Space and Arrow Up while the game canvas/page is active.

---

M00 Core Gameplay Loop

---

The cat remains fixed horizontally. Obstacles spawn offscreen at the right edge and move left. The player jumps over them. A collision ends the run.

Initial world speed: `280 px/s`.

Maximum world speed: `620 px/s`.

Speed ramp: increase speed by `9 px/s` every second while playing, capped at max speed.

Additional difficulty ramp: reduce average obstacle spawn interval over time.

Obstacle spawn interval at start: random between `1.25 s` and `1.90 s`.

Obstacle spawn interval after speed reaches max: random between `0.78 s` and `1.25 s`.

Minimum horizontal spacing between obstacle collision boxes: `260 px` at low speed, `330 px` at high speed. This prevents unfair patterns when speed is high.

Do not spawn impossible combinations. For version 1, avoid back-to-back tall obstacles closer than `420 px`.

Obstacle removal: remove obstacles once their visual right edge is less than `-80`.

Collision check: axis-aligned bounding boxes. Check cat collision box against active obstacle collision boxes only while state is `playing`.

---

N00 Scoring and Progression

---

Score is distance-based.

Score formula: add `worldSpeed * dt * 0.035` each frame. Display as an integer.

Best score: store in `localStorage` using key `catnipDash.bestScore`. If `localStorage` is unavailable, keep best score in memory for the session.

Milestones: every `100` points, briefly show a small banner near the top center: "Speed Up!". Banner duration: `1.0 s`.

Optional bonus collectible is not required for version 1. If implemented, use catnip leaves worth `25` points, placed above safe jump arcs. This must not block completion of the base game.

Game should feel satisfying in runs of `30-90` seconds. Difficulty should become challenging by around `45` seconds.

---

O00 Obstacle Design

---

Required obstacles: flower pot, fence, yarn ball, crate, and puddle.

Obstacle logical definitions:

| Obstacle   | Visual Size | Collision Box | Ground Alignment             | Gameplay Role                             |
| ---------- | ----------: | ------------: | ---------------------------- | ----------------------------------------- |
| Flower pot |   `48 x 58` |     `34 x 46` | bottom at ground Y           | Basic medium obstacle                     |
| Fence      |   `72 x 64` |     `60 x 50` | bottom at ground Y           | Wider timing obstacle                     |
| Yarn ball  |   `46 x 46` |     `34 x 34` | bottom at ground Y           | Small obstacle, can rotate visually       |
| Crate      |   `62 x 62` |     `50 x 50` | bottom at ground Y           | Square obstacle                           |
| Puddle     |   `76 x 18` |     `62 x 10` | bottom at ground Y minus `2` | Low obstacle requiring jump but forgiving |

Obstacle selection weights at start:

| Obstacle   | Weight |
| ---------- | -----: |
| Flower pot |   `30` |
| Fence      |   `20` |
| Yarn ball  |   `20` |
| Crate      |   `20` |
| Puddle     |   `10` |

After score `300`, allow occasional pairs: puddle followed by yarn ball, or flower pot followed by puddle. Pair spacing: `190-230 px`. Do not pair fence and crate in version 1.

---

P00 Sprite and Asset Atlas Plan

---

Use nearest-neighbor rendering for a pixel-art-like look only if the assets are authored at low resolution. If the generated cat image is more painterly, use clean downscaled sprites with crisp outlines rather than forcing pixelation.

Recommended asset format: PNG with transparency. SVG is acceptable for source art, but runtime drawing should preferably use raster atlas images for simpler canvas rendering.

All atlas frames should align to a grid. Leave `2 px` transparent padding around each frame to avoid texture bleeding if scaling.

Cat atlas: `assets/cat-atlas.png`.

Cat frame size: `96 x 96`.

Atlas grid: `4 columns x 3 rows`, total image size `384 x 288`.

| Row | Col | Frame Name | State      |                        Duration |
| --: | --: | ---------- | ---------- | ------------------------------: |
|   0 |   0 | `idle_0`   | Ready idle |                        `0.20 s` |
|   0 |   1 | `idle_1`   | Ready idle |                        `0.20 s` |
|   0 |   2 | `run_0`    | Run        |                        `0.09 s` |
|   0 |   3 | `run_1`    | Run        |                        `0.09 s` |
|   1 |   0 | `run_2`    | Run        |                        `0.09 s` |
|   1 |   1 | `run_3`    | Run        |                        `0.09 s` |
|   1 |   2 | `jump`     | Rising     | while vertical velocity `< -60` |
|   1 |   3 | `fall`     | Falling    |  while vertical velocity `> 60` |
|   2 |   0 | `land_0`   | Landing    |                        `0.05 s` |
|   2 |   1 | `land_1`   | Landing    |                        `0.05 s` |
|   2 |   2 | `hit`      | Game over  |                            held |
|   2 |   3 | `spare`    | Reserved   |                          unused |

Cat visual requirements: readable silhouette, cheerful expression, high contrast outline, tail movement in run frames, tucked or arched pose in jump/fall frames, distinct hit/stunned frame.

Obstacle atlas: `assets/obstacles-atlas.png`.

Frame size: `96 x 96`.

Atlas grid: `5 columns x 1 row`, total image size `480 x 96`.

| Col | Frame Name   | Visual Content                           |
| --: | ------------ | ---------------------------------------- |
|   0 | `flower_pot` | Terracotta pot with small leaves         |
|   1 | `fence`      | Short garden fence segment               |
|   2 | `yarn_ball`  | Round yarn ball with simple spiral lines |
|   3 | `crate`      | Wooden crate with diagonal planks        |
|   4 | `puddle`     | Blue shallow puddle with highlight       |

Environment atlas: `assets/environment-atlas.png`.

Use a practical grid rather than one giant scene. Suggested frame size: `128 x 128`, atlas size `512 x 512`.

| Region      | Frame Name     |       Size | Notes                     |
| ----------- | -------------- | ---------: | ------------------------- |
| Row 0 Col 0 | `cloud_0`      | `128 x 64` | Soft retro cloud          |
| Row 0 Col 1 | `cloud_1`      | `128 x 64` | Alternate cloud           |
| Row 0 Col 2 | `hill_0`       | `128 x 96` | Rounded green hill        |
| Row 0 Col 3 | `hill_1`       | `128 x 96` | Smaller distant hill      |
| Row 1 Col 0 | `grass_tile`   | `128 x 32` | Top grass strip           |
| Row 1 Col 1 | `dirt_tile`    | `128 x 96` | Dirt or brick ground body |
| Row 1 Col 2 | `bird_0`       |  `32 x 32` | Wings up                  |
| Row 1 Col 3 | `bird_1`       |  `32 x 32` | Wings down                |
| Row 2 Col 0 | `bush_0`       | `128 x 64` | Decorative only           |
| Row 2 Col 1 | `flower_patch` | `128 x 64` | Decorative only           |

UI atlas: optional. If used, keep it minimal: small catnip icon, score badge, restart icon. Text can be rendered directly with Canvas using system fonts.

---

Q00 Visual Environment

---

Style: cheerful, clean, original retro 2D platformer look. Use saturated but not harsh colors. Avoid copying named characters, blocks, pipes, coins, mushrooms, or exact layouts from existing games.

Layer order from back to front:

| Layer                      |        Y Range |                       Scroll Speed |
| -------------------------- | -------------: | ---------------------------------: |
| Sky gradient or flat color |    full canvas |                                `0` |
| Far clouds                 |       `40-150` |                `worldSpeed * 0.12` |
| Birds                      |       `70-180` | `worldSpeed * 0.18` plus own drift |
| Distant hills              |      `250-390` |                `worldSpeed * 0.22` |
| Near bushes/flowers        |      `365-426` |                `worldSpeed * 0.55` |
| Ground grass top           |      `426-458` |                       `worldSpeed` |
| Dirt/brick ground body     |      `458-540` |                       `worldSpeed` |
| Obstacles                  | ground-aligned |                       `worldSpeed` |
| Cat                        |        fixed X |                          physics Y |
| HUD                        |    top overlay |                                `0` |

Sky: use a simple light blue vertical gradient or two flat bands. If gradients are avoided for a stricter pixel look, use horizontal bands.

Clouds: spawn or tile several cloud sprites at different X positions. Wrap them when offscreen.

Hills: repeat hill sprites across the horizon. Use two hill sizes and parallax.

Ground: grass strip on top, dirt or brick pattern below. The ground texture should visibly scroll so speed is readable.

Birds: decorative only, no collision. Use two-frame flap animation, small silhouettes, spawn every `6-11 s`, move right-to-left at `90-140 px/s` plus parallax speed. Remove when offscreen.

---

R00 Animation Rules

---

Cat animation selection:

| Condition                    | Animation                    |
| ---------------------------- | ---------------------------- |
| State `ready`                | `idle_0`, `idle_1` loop      |
| State `playing` and grounded | `run_0` to `run_3` loop      |
| State `playing` and rising   | `jump`                       |
| State `playing` and falling  | `fall`                       |
| State `playing` just landed  | `land_0`, `land_1`, then run |
| State `gameOver`             | `hit`                        |

Run animation speed should scale modestly with world speed. Base frame duration: `0.09 s` at `280 px/s`. At max speed, frame duration should approach `0.06 s`.

Yarn ball may rotate by cycling the same sprite angle in canvas or by using a simple visual offset. Rotation is optional. Do not make it a physics object.

Bird animation: alternate `bird_0` and `bird_1` every `0.18 s`.

---

S00 HUD and UI

---

Use Canvas-rendered UI.

During `ready`, show:

| Element                              | Position          |
| ------------------------------------ | ----------------- |
| Title: `Catnip Dash`                 | centered, Y `130` |
| Subtitle: `Jump the garden clutter.` | centered, Y `170` |
| Prompt: `Press Space or Tap to Jump` | centered, Y `225` |
| Best score if available              | centered, Y `265` |

During `playing`, show:

| Element                | Position                                  |
| ---------------------- | ----------------------------------------- |
| Score                  | top-left, X `24`, Y `34`                  |
| Best                   | top-right, X `936`, Y `34`, right-aligned |
| Pause hint: `P: Pause` | top-right below best, optional            |

During `paused`, draw a translucent overlay and centered text:

`Paused`

`Press P to Resume`

During `gameOver`, draw a translucent overlay and centered text:

`Game Over`

`Score: {score}`

`Best: {bestScore}`

`Press Space or Tap to Restart`

Font: use system stack. Suggested canvas font: `bold 34px sans-serif` for title, `20px sans-serif` for prompts, `22px monospace` or `bold 22px sans-serif` for score. Since no external fonts are allowed, do not depend on a custom font.

---

T00 Sound

---

Sound is optional and should not block implementation.

If included, use Web Audio oscillator-generated sounds only, not external audio files. Suggested sounds: jump blip, score milestone chime, collision thud. Audio must start only after user interaction to satisfy browser autoplay policies.

If sound creates implementation delay, omit it.

---

U00 Asset Production Guidance

---

The developer may create simple original assets directly as PNGs or generate SVG source files and export them to PNG. Runtime should load local files from `assets/`.

Use visible outlines around the cat and obstacles. The cat must read clearly at `96 x 96` logical pixels. Obstacle sprites should not visually blend into the ground.

Use a consistent light direction and palette. Suggested palette: blue sky, soft green hills, bright grass, warm brown dirt, terracotta flower pot, tan fence, red or purple yarn, brown crate, blue puddle.

`README-assets.txt` should briefly state that all assets are local/original or derived from the locally provided cat image. Since the exact existing cat image details are unknown, do not claim its origin beyond what is known.

---

V00 Collision and Fairness Rules

---

Collision must be forgiving. Use inset collision boxes rather than full sprite bounds.

The player should always be able to clear every single obstacle with the specified jump velocity and gravity.

Approximate jump characteristics with the specified numbers:

| Metric        | Approximate Value |
| ------------- | ----------------: |
| Time to apex  |          `0.37 s` |
| Jump height   |    about `153 px` |
| Total airtime |    about `0.75 s` |

At max speed `620 px/s`, one jump covers about `465 px` horizontally relative to scrolling obstacles. This means obstacle spacing and pair rules must preserve at least one viable landing/jump rhythm.

Do not spawn obstacles before gameplay begins. On starting, first obstacle should appear after `1.0-1.4 s`.

Do not spawn an obstacle if another obstacle is already too close according to the minimum spacing rule.

---

W00 Edge Cases

---

The game must handle tab switching without teleporting the cat or obstacles. Clamp delta time.

The game must handle missing `localStorage` without crashing.

The game must handle missing image assets gracefully enough to expose the issue during development. Acceptable behavior: draw simple colored placeholder rectangles with labels if an image fails to load.

The game must not scroll the browser page when Space or Arrow Up is used for gameplay.

The game must avoid blurry scaling. Canvas CSS scaling is allowed, but internal coordinate drawing should stay consistent. For pixel-style assets, disable image smoothing. For smoother generated cat art, image smoothing may remain enabled if it looks better. The developer should choose one consistent rendering mode.

The game must not require network access.

Touch devices must be playable with a single tap.

Restart must clear all obstacles and reset speed. Best score must persist if possible.

Pause must not be available from `ready` or `gameOver`; it only applies during `playing`.

---

X00 Acceptance Criteria

---

A developer is done when the following are true:

| Area              | Acceptance Criteria                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Static delivery   | Game runs from `index.html` with only local HTML, CSS, JS, and assets                       |
| Canvas            | Gameplay renders entirely on one Canvas element at `960 x 540` logical resolution           |
| Responsive layout | Canvas scales to fit desktop and mobile viewports while preserving 16:9                     |
| Cat behavior      | Cat stays fixed horizontally, runs while grounded, jumps, falls, lands, and shows hit frame |
| Obstacles         | At least five obstacle types exist: flower pot, fence, yarn ball, crate, puddle             |
| Scrolling         | Background, ground, and obstacles move right-to-left at speed tied to gameplay              |
| Difficulty        | World speed increases over time from `280 px/s` toward `620 px/s`                           |
| Score             | Score increases during play, displays live, and best score persists when possible           |
| Collision         | Collision ends the run and transitions to `gameOver`                                        |
| Restart           | Space, Arrow Up, W, click, or tap can start and restart                                     |
| Pause             | P or Escape can pause and resume while playing                                              |
| Environment       | Sky, clouds, hills, textured ground, and decorative birds are visible                       |
| Assets            | Sprite/texture approach is used, with atlas-style cat, obstacle, and environment assets     |
| No dependencies   | No npm packages, build tools, CDNs, external fonts, or external scripts                     |
| Originality       | Visuals evoke retro platformers without copying copyrighted assets                          |

---

Y00 Recommended Implementation Order

---

First implement the canvas shell, game loop, fixed logical resolution, input handling, and state transitions.

Second implement cat physics using placeholder rectangles and verify jump feel against ground Y `426`.

Third implement obstacle spawning, movement, collision, score, best score, restart, and speed ramp.

Fourth implement scrolling ground, sky, hills, clouds, and decorative birds.

Fifth replace placeholders with atlas rendering and tune collision boxes.

Sixth polish HUD, game-over overlay, milestone banner, animation timing, and responsive scaling.

---

Z00 Final Product Decision

---

Build Catnip Dash as a single-button fixed-position runner with original cheerful retro garden/street visuals. Keep version 1 mechanically simple: jump only, no double jump, no enemies, no levels, no menus beyond ready, pause, and game over. Prioritize responsive play, readable obstacles, forgiving collision, clear score progression, and a polished short arcade loop.
