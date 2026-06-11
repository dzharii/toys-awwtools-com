# TODO.md

---

A00 Project Setup

---

- [x] Confirm `specs/design_spec.md`, `specs/product_spec.md`, `specs/audio_spec.md`, `specs/bunny_original.png`, and `specs/bunny_mockup.png` exist, and confirm no required source file is missing before coding.
- [x] Create `assets/` in the root and copy `specs/bunny_original.png` to `assets/bunny_original.png`, then verify the original file in `specs` was not modified.
- [x] Create `index.html`, `styles.css`, and `app.js` in the root, then verify none of those files were created inside `specs`.
- [x] Link `styles.css` and `app.js` from `index.html`, then verify the page opens locally without a build step.

---

B00 Static Page Structure

---

- [x] Implement the scene shell, scene container, background image, effects layer, ball layer, score chip, and audio chip placeholders, then verify DOM order supports the required visual layering.
- [x] Use `assets/bunny_original.png` as the runtime background, then verify `specs/bunny_mockup.png` is not used as the runtime scene.
- [x] Add an accessible scene label and hide decorative animated elements from assistive technology, then verify no noisy live announcements are produced every pass.
- [x] Keep the production view free of debug markers, `B1` labels, grids, and bounding boxes, then verify debug-only elements appear only behind an explicit debug mode if implemented.

---

C00 Layout And Responsiveness

---

- [x] Use the exact scene coordinate ratio `1672 / 941`, then verify the CSS aspect ratio and JavaScript constants both use width `1672` and height `941`.
- [x] Implement desktop and landscape layout so the full scene is visible and centered, then verify the image is not stretched or distorted.
- [x] Implement portrait behavior that preserves readable rabbits and ball size, then verify horizontal panning works when the scene is wider than the viewport.
- [x] Ensure the score chip and audio chip remain reachable and readable on narrow screens, then verify neither chip covers the rabbits or main ball contact area.

---

D00 Visual Constants And Coordinates

---

- [x] Add the verified rabbit constants from `design_spec.md`, then verify left, middle, and right anchor points match the specification.
- [x] Verify the right rabbit contact point is `x: 1445, y: 438`, then verify no older right target coordinate is still used.
- [x] Add score chip placement from native point `x: 56, y: 56`, then verify it does not cover any rabbit.
- [x] Add the approved UI color tokens, then verify the score chip uses cream background, brown label text, and `#d94a1e` for the numeric value.

---

E00 Ball Rendering

---

- [x] Implement the beach ball as code-rendered inline SVG or equivalent DOM/SVG markup, then verify no external ball image asset is loaded.
- [x] Use a native ball diameter based on `64px`, then verify the rendered size scales with the scene instead of fixed viewport-only sizing.
- [x] Apply the required ball panel colors, outline, highlight, and subtle shading, then verify the ball is readable over grass, fence, and sky.
- [x] Add ball rotation and contact squash variables, then verify the ball returns to normal scale after each contact.

---

F00 Ball Motion And Effects

---

- [x] Implement and validate the original three Bezier pass loop; this fixed-loop requirement is superseded by the verified CR-001 six-route generated path system below.
- [x] Drive animation with `requestAnimationFrame`, then verify active pass and progress are derived from elapsed time rather than CSS keyframes alone.
- [x] Implement ball shadow interpolation from rabbit ground points, then verify the shadow changes size and opacity based on ball height.
- [x] Implement a short motion trail behind the ball, then verify it shows recent motion only and does not permanently render the full pass path.
- [x] Implement rabbit impact spark, tap lines, ground pulse, and ball squash, then verify each effect appears at the receiving rabbit and disappears quickly.

---

G00 Pass Counter And Persistence

---

- [x] Implement and validate the original `5750ms` elapsed-time counter; this timing model is superseded by CR-001 persisted pass boundaries while retaining exact one-pass increments.
- [x] Preserve migration from `bunnyVolleyball.v1`, then verify the active v2 state under `bunnyVolleyball.game.v2` keeps the pass count across refreshes.
- [x] Format the score with at least six digits, then verify the displayed value updates consistently with the computed completed pass count.
- [x] Add the score chip bump animation on increment, then verify the animation is subtle and does not dominate the scene.

---

H00 Audio Controls

---

- [x] Add the sound control chip with sound toggle, minus button, volume display, and plus button, then verify all controls are keyboard reachable.
- [x] Persist audio state under `bunnyVolleyball.audio.v1`, then verify refresh preserves the displayed enabled state and volume value.
- [x] Implement plus and minus volume changes in `5%` steps, then verify volume clamps from `0%` to `100%`.
- [x] Ensure no sound plays on page load, then verify audio starts only after user click, tap, or keyboard activation.

---

I00 Procedural Audio

---

- [x] Implement one Web Audio engine using `AudioContext`, master gain, music bus, SFX bus, and filtering, then verify no external audio libraries are imported.
- [x] Implement the original procedural background music loop from `audio_spec.md`, then verify no MP3, WAV, OGG, or remote audio file is used.
- [x] Implement pass launch, flight whoosh, rabbit hit, and 10-pass milestone sounds, then verify each sound is triggered only by the correct live game transition.
- [x] Prevent backlog sounds after refresh, then verify old stored pass progress does not cause missed historical sounds to play at startup.
- [x] Smooth volume changes with gain ramps, then verify toggling and volume changes do not create obvious clicks or pops.

---

J00 Reduced Motion And Accessibility

---

- [x] Implement `prefers-reduced-motion: reduce` behavior for visual animation intensity, then verify the game remains understandable with reduced effects.
- [x] Reduce or disable whoosh, heavy score bump, and excessive spark effects in reduced-motion mode, then verify audio and visual intensity are both lower.
- [x] Confirm all interactive audio controls have usable text or aria labels, then verify tab order is simple and no focus trap exists.
- [x] Confirm decorative SVG and animation layers are hidden from assistive technology, then verify meaningful scene context is still available.

---

K00 Browser And Deployment Readiness

---

- [x] Test by opening `index.html` directly from the filesystem, then verify the page works without a local development server.
- [x] Verify all asset references are relative and local, then verify the page is suitable for GitHub Pages deployment.
- [x] Inspect the console for errors and warnings, then verify normal operation produces no recurring runtime errors.
- [x] Verify no CDN, framework, package manager, build output, or generated dependency folder was added.

---

L00 Regression And Final Validation

---

- [x] After each major feature, re-check layout, ball alignment, score persistence, visual effects, and audio controls, then verify no previous behavior regressed.
- [x] Compare the implementation against `specs/design_spec.md`, then verify the final visual behavior follows the required coordinates, colors, and restraint rules.
- [x] Compare the implementation against `specs/product_spec.md`, then verify the final project structure, runtime behavior, and acceptance expectations are met.
- [x] Compare the implementation against `specs/audio_spec.md`, then verify audio controls, procedural music, SFX, and autoplay policy behavior are met.
- [x] Only after all items above are validated, report completion with created files, verified behaviors, deviations if any, and remaining issues if any.

---

M00 CR-001 Randomized Passing

---

- [x] Add the v2 seeded game-state model, randomized receiver selection, generated Bezier geometry, and reload fast-forward, then verify route state resumes coherently without catch-up effects or audio.
- [x] Connect randomized passes to ball motion, shadow, trail, impacts, counter, and audio, then verify all six directed routes render and no rabbit passes to itself.
- [x] Verify duration and arc variation remain within the CR-001 bounds, then verify pass counting and persistence still increment exactly once per completed pass.

---

N00 CR-001 Rabbit Names

---

- [x] Add three scene-positioned editable rabbit name labels, then verify placement, readability, keyboard focus, and plain-text sanitization.
- [x] Persist sanitized names under `bunnyVolleyball.rabbitNames.v1`, then verify input, paste, Enter behavior, and refresh restoration.

---

O00 CR-001 Ambient Clock

---

- [x] Add the bottom-center clock with local 24-hour time, seconds, date, and subtle tick transition, then verify it updates on second boundaries.
- [x] Track and persist visible watching time under `bunnyVolleyball.watchTime.v1`, then verify hidden-tab time is excluded and page hide saves state.

---

P00 CR-001 Final Validation

---

- [x] Verify desktop, landscape, portrait panning, reduced motion, UI layering, and rabbit visibility remain usable with the new labels and clock.
- [x] Revalidate existing animation, score, audio activation, volume persistence, local-file operation, and GitHub Pages readiness after CR-001.
- [x] Inspect the completed implementation against every CR-001 acceptance criterion, then report completion only if all checks pass.
