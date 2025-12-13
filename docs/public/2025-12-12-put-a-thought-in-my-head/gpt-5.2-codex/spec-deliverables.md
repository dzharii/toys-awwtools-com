A00 v00 Deliverables overview
Deliverable 1 is a static project folder that runs by opening index.html in a modern browser and produces the intended interactive cartoon and text-filling effect. Deliverable 2 is a small set of hand-test scripts and acceptance checks that let you verify behavior without tooling. Deliverable 3 is a short maintenance guide that explains file load order, the shared global namespace, and how to extend the character or the text packing.

B00 v00 Roadmap and milestones
Milestone 1 delivers the visual shell: the SVG character renders correctly, the cavity mask exists, and the UI layout is stable. Done means you can load the page and see an empty head that is clearly hollow.

Milestone 2 delivers life: idle micro-motions and eye behavior run smoothly and do not break layout. Done means you can watch the character for 30 seconds and it feels alive but not noisy.

Milestone 3 delivers the first brain: typed text appears inside the cavity with masking and a simple, readable curved placement. Done means short text looks big, and medium text wraps into a snake-like path.

Milestone 4 delivers adaptive filling: font size and coil density respond to length so the cavity stays visually filled. Done means one character nearly fills the cavity and long text becomes dense without spilling.

Milestone 5 delivers fluid reflow: edits animate as transitions, not jumps. Done means typing and deleting cause smooth, damped motion without flicker.

Milestone 6 delivers polish and stability: empty-state cues, optional occupancy meter, performance caps, edge-case handling, and a clean code map. Done means it feels like a finished toy and remains stable under aggressive input and resizing.

C00 v00 Integration model and file contract
All JavaScript lives in classic scripts with explicit order. Each file attaches to a single global namespace object (one name only) and avoids leaking additional globals. Each file has a clear public surface: functions, constants, and data structures it intentionally exposes. Everything else stays private inside an IIFE.

The only shared state is held under the namespace in a few well-known buckets: config, state, services, and ui. This is what allows multiple files to behave like modules without ES modules.

D00 v00 Module 01: Namespace and configuration
File suggestion: js/00-namespace.js

Why it exists: it prevents global pollution and defines stable names that other files can rely on.

Responsibilities: create the global root object, define default configuration values (timings, easing constants, size thresholds, density levels), and define a minimal logging switch for debugging.

Public surface: a single object with config, state, and a tiny helper for safe initialization ordering.

Correctness checks: open DevTools and confirm only one new global exists. Confirm config values are readable and overriding them in one place changes behavior predictably.

E00 v00 Module 02: DOM and SVG binding layer
File suggestion: js/01-dom.js

Why it exists: it centralizes element lookup and prevents every file from querying the DOM differently.

Responsibilities: find and store references to key nodes: the SVG root, the cavity mask path, the skull rim group, the pupil element, the input, and any labels or meters. Provide a single "ready" function that validates required elements exist.

Public surface: getters for cached elements and a validate function that reports missing IDs.

Correctness checks: if you deliberately rename an SVG id, the module reports the missing element in a clear way and the app fails gracefully rather than silently breaking.

F00 v00 Module 03: SVG scene construction and styling hooks
File suggestion: js/02-scene.js

Why it exists: it owns the SVG-specific setup that is more than "find an element", such as building masks, grouping layers, and preparing z-order.

Responsibilities: ensure the cavity mask is wired so content is clipped, ensure skull rim stays above the text, create a dedicated group for brain text, and set up any filter definitions used for softness (drop shadows or inner shading) if you use them.

Public surface: initScene returns an object describing the constructed layers and the cavity geometry reference used by layout.

Correctness checks: toggle brain text visibility and confirm it never renders outside the cavity. Confirm rim always stays visually on top. Confirm resizing does not break clipping.

G00 v00 Module 04: Character idle animation controller
File suggestion: js/03-anim-character.js

Why it exists: it isolates character life and keeps it independent from text behavior.

Responsibilities: implement breathing bob, subtle sway, blink scheduling, and pupil micro-saccades. Provide start and stop controls, and expose a low-frequency "tick" that can be coordinated with other animation if needed.

Public surface: startIdle, stopIdle, setIntensity.

Correctness checks: run for two minutes and confirm no drifting off position. Confirm blink does not distort other face parts. Confirm animations remain smooth at normal refresh rates.

H00 v00 Module 05: Input and interaction controller
File suggestion: js/04-ui-input.js

Why it exists: it owns the text box experience and shields the rest of the system from DOM event details.

Responsibilities: handle input, paste, selection changes if needed, trimming policy, newline policy, and debouncing. Emit a single normalized string into the system. Manage empty-state hint visibility and any playful labels.

Public surface: onTextChange subscription mechanism, getText, setText, clearText.

Correctness checks: paste a long URL, confirm the change event fires once with the full value. Hold a key to repeat input, confirm the rest of the system stays responsive. Delete to empty, confirm empty state returns.

I00 v00 Module 06: Cavity geometry and packing model
File suggestion: js/05-geometry.js

Why it exists: text filling must be driven by a stable representation of the cavity, not by ad hoc guesses.

Responsibilities: represent the cavity as a path and derive a practical coordinate system for packing. Compute an inset boundary so text does not collide with the rim. Provide helpers like "point at percent", "normal direction", and "available width at y" if you choose that approach.

Public surface: getCavityPath, getInsetPath, measureCavity, and any sampling utilities.

Correctness checks: print debug dots along the cavity boundary to confirm sampling is correct. Change SVG scale and confirm geometry calculations still map correctly.

J00 v00 Module 07: Path generator for snake curves
File suggestion: js/06-pathgen.js

Why it exists: the joke depends on a believable coiling path that feels guided by the cavity.

Responsibilities: generate one or more smooth curves that sweep the cavity. Support multiple density tiers. Either generate procedurally from geometry sampling, or select from a small library of predesigned paths based on density.

Public surface: generatePathsForDensity(densityLevel, cavityMetrics) returning SVG path strings.

Correctness checks: visualize the generated path as a stroked line in debug mode. Confirm it stays inside the inset boundary. Confirm continuity, no sharp corners, no self-intersections that look broken.

K00 v00 Module 08: Text layout and scaling engine
File suggestion: js/07-text-layout.js

Why it exists: it decides font size, spacing, and how much path length is needed so the cavity looks filled.

Responsibilities: choose font size from text length and cavity area, choose density level, map text onto one or multiple paths, and decide repeat or continuation rules. Handle the extreme cases: one character, very short strings, and very long content.

Public surface: layoutText(text) producing a render plan: fontSize, paths, textChunks, and any per-chunk offsets.

Correctness checks: type one letter and confirm it becomes large and centered. Type 20 characters and confirm it wraps and still reads. Paste 500+ characters and confirm it becomes dense but remains clipped and stable.

L00 v00 Module 09: Brain renderer and animation transitions
File suggestion: js/08-render-brain.js

Why it exists: rendering should be separate from layout so layout can be tested without DOM manipulation.

Responsibilities: take a render plan and update the SVG text elements. Animate transitions between the previous and next plan with easing. Manage the first-appearance inflate and the delete-to-empty drain effect.

Public surface: render(plan, options), clearBrain(animated).

Correctness checks: repeated edits do not leak SVG nodes. Reflow is smooth and does not flicker. Switching from short to long text produces a coherent transition rather than a pop.

M00 v00 Module 10: Timing, scheduling, and performance guardrails
File suggestion: js/09-scheduler.js

Why it exists: without a bundler, it is easy to end up with competing timers and jank.

Responsibilities: centralize requestAnimationFrame loops, manage debounced layout recalculation, cap maximum processed text length for safety, and provide a "reduced motion" mode toggle.

Public surface: scheduleLayoutUpdate, setReducedMotion, with a single internal animation clock shared by character and brain if desired.

Correctness checks: hold a key down and confirm frame rate stays acceptable. Paste extremely long text and confirm the app does not freeze and falls back gracefully.

N00 v00 Module 11: Debug and test harness
File suggestion: js/10-debug.js

Why it exists: you need fast ways to verify geometry, paths, and layout without formal tooling.

Responsibilities: provide a debug overlay inside the SVG that can show cavity inset, generated paths, sample points, and text bounds. Provide a simple console-driven test runner that executes a handful of scenarios and prints pass or fail.

Public surface: toggleDebug, runSmokeTests.

Correctness checks: turning debug on and off never changes final rendering except for overlays. Smoke tests cover empty, short, medium, long, and extreme input.

O00 v00 Module 12: Bootstrap and load order
File suggestion: js/99-bootstrap.js

Why it exists: classic scripts require explicit initialization order and a single entry point.

Responsibilities: on DOMContentLoaded, call validate, initScene, start idle animation, wire input events, and render initial empty state. Own the error boundary behavior: if required elements are missing, it shows a friendly message instead of a broken page.

Public surface: none beyond a single init call invoked automatically.

Correctness checks: refresh repeatedly and confirm no double-initialization. Confirm that disabling one script tag causes a clear failure message rather than silent breakage.

P00 v00 Testing strategy and definition of done
Manual acceptance suite: a short checklist that anyone can follow. It includes watching idle motion, typing and deleting, pasting long text, resizing the window, and toggling reduced motion. Each check has a visible expected result, such as "rim always on top" and "text never escapes cavity".

Deterministic smoke inputs: a small set of canned strings: one character, a short phrase, a URL, a paragraph, and an extreme-length string. Each is used to confirm scaling and packing behavior.

Performance sanity checks: confirm that continuous typing remains responsive and that pasting extreme input degrades gracefully by reducing detail rather than freezing.

Regression safety: every module exposes just enough surface so the debug harness can call it. When something breaks, the debug overlay should reveal whether the failure is geometry, path generation, layout, or rendering.

Q00 v00 Roadmap-to-code mapping
Phase 1 implements Module 01 to 03 and Module 12 so the static page loads, the SVG is visible, and the cavity mask is correct.

Phase 2 implements Module 04 so the character feels alive.

Phase 3 implements Module 05 and a minimal version of Module 08 and 09 so typed text appears, masked, on a simple single curve.

Phase 4 implements Module 06 and 07 plus a stronger Module 08 so packing responds to cavity shape and text length.

Phase 5 implements Module 09 transitions and Module 10 scheduling so edits feel fluid and performance stays stable.

Phase 6 implements Module 11 debug and then iterates on polish, edge cases, and reduced motion.

R00 v00 Expected artifacts in the repository
An index.html with classic script and link tags in documented order.

A css folder with base styling and any character or UI specific files.

A js folder with the numbered files above to enforce load order.

A short README that states supported browsers, how to run, and how to use debug mode and smoke tests.
