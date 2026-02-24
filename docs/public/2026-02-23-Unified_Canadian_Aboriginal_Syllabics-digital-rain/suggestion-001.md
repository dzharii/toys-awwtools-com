A00-00 Vision and purpose

This project is an interactive, browser-based programming environment for an esoteric, symbol-driven language that uses Unified Canadian Aboriginal Syllabics as its primary alphabet. The environment blends a code editor and documentation overlays with a full-screen digital rain background, inspired by Matrix-style visuals and the aesthetic of APL-like symbolic languages.

The core concept is that the script is not just executed to produce output; it is interpreted as a live, evolving transformation program that controls how the digital rain is rendered. As the user types, adds, removes, or rearranges syllabics symbols, the renderer transitions smoothly from the current visual state toward a new state derived from the script. This creates the feeling that the user is “programming the rain” in real time, similar to writing a shader, but with a constrained and readable model designed for playful experimentation.

The value proposition is threefold: an artistic coding toy (visual feedback while typing), an educational artifact (symbolic language concepts with immediate rendering feedback), and a shareable esolang sandbox (short glyph scripts produce distinctive, reproducible visuals that can be saved, loaded, and shared).

The system must be robust, deterministic (where intended), and responsive, while remaining entirely client-side with no backend requirement. It must provide clear documentation of all symbols and their effects, and it must include preconfigured sample scripts that highlight different visual regimes and language features.

B00-00 Captured initial idea and requirements (as stated)

B00-01 APL inspiration and symbolic language goal
The language is inspired by the appeal of APL: dense programs written with iconic symbols. Unified Canadian Aboriginal Syllabics contains many visually distinctive glyphs that can evoke a similar “operator alphabet” feel. The goal is to define an esoteric language that uses these symbols as operators and primitives.

B00-02 Digital rain background always present
The environment is a composited experience. There is always a digital rain animation in the background, full screen, continuously rendering.

B00-03 Script editor overlays the rain
The user writes scripts in an editor in the foreground. The editor UI blends with the rain visually (translucent, neon/terminal feel), but remains readable and functional.

B00-04 Script modifies rain behavior as it is written
As transformations (syllabics glyphs representing language operations) are added to the script, the rain behavior changes. This is not a one-shot “run then see”; it is an ongoing coupling between text and visuals.

B00-05 Smooth transitions between states
When the script changes, the visual change is not abrupt. The renderer must transition smoothly from the prior state to the new state. The user expects continuous motion, not “popping” into a different mode.

B00-06 Transformations can affect many parameters
Examples of things that should be controllable by the script include direction (top-to-bottom, diagonal, angled), color changes, character set changes, and other aspects of the rain.

B00-07 Controlled environment, no chaotic glitches
Even though the visuals can vary widely, the system must be controlled. It should avoid glitches, runaway states, unreadable UI, and unstable performance.

B00-08 Help page and full documentation
The environment must include an integrated help/reference describing every symbol/function. The help should be part of the UI.

B00-09 Preconfigured samples
The environment must ship with sample scripts that can be loaded and executed immediately.

C00-00 Product requirements and scope

C00-01 Primary use cases

1. A user opens the page and instantly sees an animated rain background plus a visible editor and sample selector.
2. The user loads a sample and immediately sees the rain transition into the sample’s “look.”
3. The user edits the script (types glyphs, deletes glyphs, pastes text) and sees the rain smoothly evolve in response.
4. The user opens help to learn what each glyph does, then writes their own script.
5. The user shares a script with someone else (copy/paste or share link) so the same script reproduces the same visual behavior.

C00-02 Non-goals (v1)

1. No server-side storage requirement. Optional later.
2. No requirement for full general-purpose programming (loops, I/O, complex data structures) in v1. The esolang is primarily a transformation language for the renderer, with optional small output facilities.
3. No reliance on specialized fonts. The system should work with commonly available fonts that support syllabics; if not available, it must degrade gracefully.

C00-03 Supported platforms

1. Desktop Chrome, Firefox, Safari, Edge (recent versions).
2. Mobile browsers are a secondary target. Basic operation should work, but editing experience may vary.

D00-00 System architecture overview

D00-01 Modules

1. UI Layer
   a. Editor panel (script input, run/live mode, clear, formatting guidance).
   b. Samples panel (select and load).
   c. Help/Reference panel (glyph dictionary, language explanation, examples).
   d. Optional console/output panel (for later language features).
2. Language Layer
   a. Lexer/tokenizer (maps Unicode glyphs, ignores whitespace/comments).
   b. Parser (v1 can be linear; v2 may introduce grouping and arguments).
   c. Interpreter/evaluator (applies glyph semantics to a state model).
   d. Error handling and diagnostics (unknown glyphs, invalid sequences).
3. Rendering Layer
   a. Rain engine (columns/particles, glyph selection, drawing).
   b. State transition system (current state, target state, easing).
   c. Performance control (frame timing, dynamic resolution, limits).
4. Persistence/Sharing Layer
   a. Local storage for last script and preferences.
   b. Optional URL encoding for script sharing.
   c. Optional export (PNG/GIF/MP4) deferred.

D00-02 Data flow

1. Script text changes.
2. Language layer interprets it to produce a TargetRenderState (and optional TargetProgramState).
3. Transition system updates RendererState to approach TargetRenderState using smoothing filters each frame.
4. Render loop draws the next frame based on the current smoothed renderer state.
5. UI displays diagnostics and the effective state values.

E00-00 Visual and interaction design

E00-01 Composition and layering

1. A full-screen canvas is always behind.
2. Foreground UI is an overlay with pointer-events enabled for UI elements but not for the rest of the overlay mask.
3. UI transparency is tuned so the rain is visible but does not reduce readability.

E00-02 Editor experience

1. The editor uses a monospace font and supports pasting syllabics glyphs.
2. It must not auto-correct or transform text.
3. It must display line numbers optionally (v2).
4. It must support a “Live” toggle:
   a. Live ON: interpreting happens on each edit with debounce.
   b. Live OFF: interpreting happens only on Run.
5. It must support a “Reset to defaults” action (UI plus language glyph).
6. It should show a small status strip with:
   a. Token count.
   b. Unknown glyph count.
   c. Current effective state values (summarized).
   d. Performance metrics optionally (FPS).

E00-03 Help/reference UI

1. A built-in help panel must exist in the application.
2. Help includes:
   a. A conceptual overview (what is the language, how it affects rain).
   b. A glyph reference (each glyph, name, category, effect, parameters).
   c. Examples with explanations.
   d. Notes on determinism and randomness.
3. Help should be searchable (v2) by glyph or effect.

E00-04 Sample scripts

1. A dropdown or side list with sample names.
2. Load button loads into the editor.
3. Samples must cover:
   a. Baseline calm rain.
   b. High speed rain.
   c. Diagonal/angled flows.
   d. Color cycles.
   e. Syllabics-only glyph set.
   f. GUID-like set.
   g. Mixed set.
   h. A “chaos but controlled” sample.
4. Each sample includes a comment header explaining what it demonstrates.

F00-00 Rendering model: digital rain engine

F00-01 Core behavior
The rain is composed of multiple streams (columns or particle lanes). Each stream emits glyphs at a certain pace, drifting through the screen. The renderer draws glyphs with a fading alpha overlay to produce trails.

F00-02 Coordinate and motion model

1. The renderer defines a flow vector derived from an angle (in radians) or (dx, dy).
2. Each stream has:
   a. A base position.
   b. A progression parameter (like y position for vertical rain).
   c. A per-stream speed multiplier.
   d. Optional per-stream phase seeds for wave and noise.
3. Each frame, streams advance along the flow vector:
   pos += flowVector * speed * dt * perStreamMultiplier.

F00-03 Glyph selection model
The rain glyph drawn at each position is selected from a current glyph set:

1. Syllabics set: code points U+1400..U+167F, optionally filtered by Unicode category and control exclusions.
2. GUID set: ASCII subset "{0123456789abcdef-}" or expanded.
3. Mixed set: union of both.
   The selection can be:
4. Uniform random.
5. Weighted by recent history (v2).
6. Deterministic PRNG seeded by script for reproducibility (recommended in v2).

F00-04 Trail model
Trails are created by drawing a semi-transparent rectangle over the whole canvas each frame:

1. fadeAlpha controls persistence. Lower fadeAlpha -> longer trails.
2. Fade must be clamped to prevent “never clears” or “instantly clears” extremes.

F00-05 Color model

1. Base color described by hue, saturation, lightness.
2. Optional per-glyph lightness highlight for the “head” of a stream (v2).
3. Optional multi-color gradients along stream length (v3).
4. Color changes should be smooth and subject to easing like other parameters.

F00-06 Distortion and effects model
The system supports controlled distortions that remain stable and performant:

1. Jitter: per-glyph random offset scaled by jitter parameter.
2. Wave: sinusoidal modulation of x/y positions using per-stream phase.
3. Noise: a low-frequency noise field affecting direction or speed (v2).
4. Perspective: scale glyph size by y depth (v3).
   All effects must have explicit bounds and smoothing.

G00-00 State system and smoothing

G00-01 State definitions

1. TargetRenderState: produced by interpreter.
2. CurrentRenderState: the actual parameters used for drawing, updated each frame via smoothing.

G00-02 Smoothing requirements

1. Script edits should not cause abrupt jumps unless the user explicitly uses a “snap” operation (optional).
2. Smoothing is implemented as exponential moving interpolation:
   current = current + (target - current) * (1 - exp(-k * dt))
   where k is the responsiveness constant per parameter.
3. Different parameters may use different k values:
   a. Color: medium.
   b. Direction: medium/slow to avoid nausea.
   c. Font size: slower, plus a controlled rebuild of stream layout.
   d. Charset changes: crossfade rather than instant switch (v2).
4. Rebuilding stream layout on font change must avoid flicker:
   a. Use thresholds (rebuild only if size difference > epsilon).
   b. Optionally rebuild gradually (v3).

G00-03 Safety bounds
All state values must be clamped:

1. Speed: [minSpeed, maxSpeed].
2. Font size: [minFontPx, maxFontPx].
3. Fade: [minFade, maxFade].
4. Jitter: [minJitter, maxJitter].
5. Wave: [minWave, maxWave].
6. Angle: wrap or clamp to [-pi, pi] or [0, 2pi].

H00-00 The language: “Syllabics Transformation Script” (STS)

H00-01 Language goals

1. Dense, symbolic operators.
2. Easy to type via copy/paste and sample loading.
3. Deterministic evaluation for the same script (where randomness is not invoked).
4. Primarily maps to render transformations.

H00-02 Lexical rules

1. Source is UTF-8 text.
2. Whitespace is ignored except to separate comments visually.
3. Comments:
   a. A line whose first non-space is ASCII # is a comment to end-of-line.
   b. Future: support inline comment delimiter (v2).
4. Tokens are individual glyphs in v1.
5. Unknown glyphs are allowed but produce warnings; they do not stop evaluation.

H00-03 Evaluation model (v1)

1. The program is a pipeline of transformations applied in order to a base render state.
2. The base render state is either:
   a. System default values; or
   b. The last reset point if a reset glyph appears.
3. Each glyph maps to an operation:
   a. Increment/decrement a parameter.
   b. Set a mode (charset mode).
   c. Reset.
   d. Randomize.
4. Output is a TargetRenderState.

H00-04 Glyph namespace and mapping strategy
To scale beyond a handful of glyphs, the project needs an approach to mapping many syllabics characters without making the system unlearnable. The specification requires:

1. A small “core” glyph set (about 20-40) with strong documentation and stable semantics.
2. Optional “extended” glyph sets grouped by category, with discoverability via the help UI.
3. A design principle:
   a. Similar-looking glyph families map to related operations (where feasible).
   b. Operations are grouped: motion, geometry, color, glyph selection, distortion, meta-control.

H00-05 Core operations (required in v1)
Category: Motion

1. SpeedUp glyph: increases fall speed.
2. SpeedDown glyph: decreases fall speed.
3. RotateCW glyph: increases flow angle.
4. RotateCCW glyph: decreases flow angle.
5. DriftStrengthUp glyph: increases lateral drift (v2) or angle delta (v1 optional).
6. DriftStrengthDown glyph: decreases lateral drift.

Category: Geometry

1. FontUp glyph.
2. FontDown glyph.
3. DensityUp glyph: increases number of streams by reducing spacing (v2).
4. DensityDown glyph.

Category: Trails

1. TrailLonger glyph: longer trails.
2. TrailShorter glyph.

Category: Color

1. HueForward glyph.
2. HueBackward glyph.
3. SaturationUp glyph (v2).
4. SaturationDown glyph (v2).
5. LightnessUp glyph (v2).
6. LightnessDown glyph (v2).

Category: Distortion

1. JitterUp glyph.
2. JitterDown glyph.
3. WaveUp glyph.
4. WaveDown glyph.

Category: Glyph set / content

1. CharsetSyllabics glyph.
2. CharsetGuid glyph.
3. CharsetMixed glyph.
4. Seed glyph (v2): sets PRNG seed for deterministic randomness.
5. Randomize glyph: randomizes within bounds.
6. Reset glyph.

Category: Meta

1. Snap glyph (v2): applies target immediately (no smoothing) for the next N frames or once.
2. Freeze glyph (v2): pauses evolution of some parameters while still rendering.

H00-06 Arguments and numeric literals (required in v2)
The project should evolve from “repeated glyphs compound effects” to “glyphs can take explicit numeric arguments.” This addresses your observation that some things worked and some did not, and reduces the need to spam a glyph to reach a desired parameter.

Required v2 literal model:

1. ASCII digits 0-9 are allowed as part of the language input, even though the language is glyph-based, because it improves usability and reduces ambiguity.
2. Numbers are parsed as decimal sequences.
3. A “commit” glyph applies the number to the last “selector.”

Example model:

1. Selector glyph chooses parameter channel: SPEED, ANGLE, HUE, FONT, FADE, JITTER, WAVE, DENSITY.
2. Digits build a numeric literal buffer.
3. Commit glyph assigns the numeric buffer to the selected channel (with scaling rules).
4. If no selector, commit is a no-op with a warning.

Scaling rules:

1. SPEED: literal maps to speed directly or via normalization.
2. ANGLE: degrees or normalized turns; define one and document it.
3. HUE: 0-360 or 0-1; define one and document it.
4. FADE: either 0-100 mapped to alpha 0.01-0.25, or direct.
   All of this must be explicit in the help reference.

H00-07 Grouping and macros (optional in v3)
To make the language more “full-blown” without becoming general-purpose, introduce:

1. Group syntax using parentheses or chosen syllabics delimiters.
2. Repeat counts: apply group N times.
3. Named macros: map a short name to a glyph sequence.
   These are optional and only if they preserve the playful feel.

I00-00 Interpreter and diagnostics requirements

I00-01 Interpreter responsibilities

1. Take the full script string and produce:
   a. TargetRenderState
   b. Diagnostics: unknown tokens, invalid sequences, warnings, summary.
2. Operate fast enough for live typing:
   a. Must finish within a small budget per keystroke.
   b. Must debounce input events (recommended 50-150 ms) to avoid excessive recomputation.

I00-02 Determinism vs randomness

1. Without randomize glyphs and without time-based operators, interpretation must be deterministic: same script -> same TargetRenderState.
2. Randomize glyph introduces nondeterminism unless a seed is set.
3. In v2, add Seed operation so randomize becomes deterministic given a seed and script.

I00-03 Diagnostics display

1. Unknown glyph count must be shown.
2. For v2+, show:
   a. Line/column of first unknown glyph.
   b. Highlight unknown glyphs in the editor (optional but recommended).
3. Warnings are non-blocking; the program still runs.

I00-04 Error policy

1. No hard crashes due to input.
2. If an internal exception occurs, renderer continues with last known good state and UI shows an error banner.

J00-00 Performance requirements

J00-01 Frame rate targets

1. Desktop: aim for 60 FPS; acceptable down to 30 FPS.
2. Mobile: aim for 30-60 FPS depending on device.

J00-02 Adaptive quality controls
The renderer must include internal quality scaling:

1. Maximum column count cap based on screen width and font size.
2. If FPS drops below threshold for sustained interval:
   a. Increase fade slightly (reduces overdraw).
   b. Reduce column count (increase spacing).
   c. Reduce effect intensity caps.
3. Optionally offer a UI “Performance” mode.

J00-03 Memory constraints

1. No unbounded arrays per frame.
2. Avoid allocating many objects each frame; reuse per-column structures.

K00-00 Accessibility and usability requirements

K00-01 Readability

1. UI text must remain readable over the animation.
2. Provide a “dim background” toggle (v2) that increases fade/alpha overlay behind UI.
3. Provide a “pause rain” toggle (v2) that freezes background while editing.

K00-02 Input support

1. Copy/paste syllabics characters must work.
2. Provide an on-screen palette of core glyphs (v2) so users can click to insert glyphs into the script.

K00-03 Internationalization
Not required in v1, but internal text should be structured so it can be translated later.

L00-00 Persistence and sharing

L00-01 Local persistence (required)

1. Save last script to localStorage.
2. Save last selected sample name.
3. Save Live mode state.
4. Restore on page load.

L00-02 Share link encoding (recommended)

1. Support a URL parameter like ?s=... containing URL-encoded script.
2. On load:
   a. If parameter exists, load it into editor and run/live apply.
3. Provide a “Copy share link” button (v2).

M00-00 Project structure and build

M00-01 Minimal structure

1. Plain HTML/CSS/JS project.
2. No build step required for v1.
3. Optional for v2+: simple bundler allowed, but must keep “open index.html and run” as a supported mode.

M00-02 File layout (suggested)

1. index.html
2. styles.css
3. script.js
4. /docs
   a. spec.md (this specification)
   b. language.md (glyph reference)
5. /assets (optional icons, screenshots)

N00-00 Testing requirements

N00-01 Functional tests (manual checklist)

1. Page loads, rain renders.
2. Editor visible and editable.
3. Loading each sample changes target state and transitions smoothly.
4. Live mode updates on typing; Run mode updates only on button.
5. Unknown glyphs do not crash; diagnostics update.
6. Reset glyph returns to defaults.
7. Randomize glyph remains within bounds.

N00-02 Performance tests

1. Sustained run for 10 minutes without memory growth.
2. Resize window repeatedly without freezing.
3. Paste very long script and ensure interpreter stays responsive (debounce and time budget).

N00-03 Visual regression expectations

1. Same sample script should produce the same qualitative regime.
2. If deterministic PRNG is enabled, the exact sequence should be reproducible.

O00-00 Security and privacy

O00-01 No network requirement

1. The app should run offline.
2. No telemetry or data exfiltration by default.

O00-02 Script safety
This is not an eval-based interpreter. It must never execute JavaScript from user input. The interpreter is a custom evaluator over a fixed glyph dictionary.

P00-00 Roadmap

P00-01 v1 (core)

1. Digital rain renderer with easing.
2. Core glyph operators that affect motion, trails, color, distortion, charset.
3. Editor overlay, help panel, sample loader.
4. Diagnostics summary.
5. Local persistence.

P00-02 v2 (make it feel “full-blown”)

1. Numeric literals with selector/commit model.
2. Seeded deterministic randomness.
3. Glyph palette.
4. Searchable help.
5. Share links.
6. Dim/pause toggles.
7. Charset crossfade when switching modes.

P00-03 v3 (expressiveness)

1. Grouping and repetition.
2. Macro presets stored locally.
3. Per-stream head highlight and gradient.
4. Noise field and perspective effects.
5. Optional export (still client-only).

Q00-00 README.md (deliverable)

Q00-01 README.md content (copy as the actual README)

Project: Syllabics Rain Esolang

Overview
Syllabics Rain Esolang is a browser-based esoteric programming environment where a symbolic script written primarily in Unified Canadian Aboriginal Syllabics controls a Matrix-like digital rain animation in real time. As you type glyphs into the editor, the background rain smoothly transitions to the visual state defined by your script. The result feels like live-coding a shader, but using a compact operator alphabet.

Why this exists
Symbolic languages like APL are compelling because code becomes visual. Unified Canadian Aboriginal Syllabics includes a large, distinctive set of Unicode glyphs that can serve as an operator alphabet. This project combines that aesthetic with immediate visual feedback: scripts become reproducible “looks” for the digital rain.

How it works
The app has three main parts:

1. Editor UI: a translucent panel for writing scripts, loading samples, and reading help.
2. Interpreter: a custom evaluator that reads glyphs and produces a target render state.
3. Renderer: a canvas-based digital rain engine that eases smoothly from the current state to the target state.

Key features

1. Live mode: the rain updates as you type.
2. Run mode: update only when you click Run.
3. Built-in help: a glyph reference explaining every operator.
4. Samples: preloaded scripts demonstrating different styles.
5. Controlled transitions: changes are smoothed to avoid abrupt visual jumps.

Language basics
The language is a stream of glyph instructions. Whitespace is ignored. Lines starting with # are comments. Each glyph maps to a transformation that modifies the rain: speed, direction, color, trails, distortion, and glyph selection modes.

Scripts are meant to be short and dense. Repeating a glyph compounds its effect. Later versions add numeric arguments and deterministic seeding.

Running locally

1. Download or clone the repository.
2. Open index.html in a modern browser.
3. Choose a sample or type your own glyph script.

Project structure
index.html: page structure and UI elements
styles.css: UI and canvas styling
script.js: interpreter + renderer + app wiring

Roadmap
v1: core interpreter + renderer + samples + help
v2: numeric arguments, seeded randomness, share links, glyph palette
v3: grouping, macros, advanced visual effects, optional export

Contributing
Contributions are welcome in these areas:

1. Expanding and documenting the glyph dictionary.
2. Improving the renderer’s effects while keeping performance stable.
3. Enhancing the editor UI (palette, highlighting, search).
4. Adding deterministic reproducibility features (seed model).

License
Specify your license here (MIT recommended for a small client-side project).

R00-00 Specification acceptance criteria (what “done” means)

R00-01 Core acceptance

1. The application runs as a single static page and shows rain immediately.
2. The editor overlays the rain and remains readable and interactive.
3. The interpreter maps syllabics glyphs to render transformations.
4. When the script changes, the rain transitions smoothly to the new state.
5. Help/reference exists in-app and documents every implemented glyph.
6. Sample scripts exist in-app and demonstrate key features.
7. System remains stable under typical use, without crashes or runaway states.

R00-02 “No additional questions” implementation completeness requirement
To satisfy “implementer should not ask additional questions,” the implementer must be given, in the repository, a concrete glyph dictionary table listing:

1. Glyph character.
2. Unicode code point.
3. Operator name.
4. Category (motion/color/trails/etc).
5. Exact parameter effect (delta or set).
6. Bounds and scaling rules.
7. Smoothing constant (if parameter-specific).
8. Notes and examples.
   This table is mandatory as a companion document (language.md), and must be treated as part of this specification.

S00-00 Companion document requirement: language.md outline

S00-01 Contents

1. Introduction to STS.
2. Lexical rules with examples.
3. Core glyph reference table (required).
4. Extended glyphs (optional).
5. Examples gallery:
   a. Calm
   b. Fast
   c. Diagonal
   d. Color cycle
   e. Distortion heavy
   f. Minimal syllabics-only
6. Troubleshooting:
   a. Missing glyphs due to font support.
   b. Performance tuning tips.
   c. Why a script may appear to do nothing (live off, only comments, unknown glyphs).

T00-00 Notes on what likely “worked” vs “did not” (from the current prototype)

T00-01 Likely working aspects

1. Live typing updates can produce visible parameter changes.
2. Angle-based flow and basic fade trails look convincing.
3. Switching between syllabics and GUID sets is effective aesthetically.
4. Jitter and wave give an immediate “shader-like” feel.

T00-02 Likely problematic aspects and required fixes

1. Charset switching is abrupt: must implement crossfade or gradual transition for glyph selection.
2. Font size changes cause layout jumps: must implement a controlled rebuild strategy.
3. Pure randomness can feel inconsistent: must implement deterministic seeding in v2.
4. Overly strong effects can become unreadable or glitchy: must enforce clamps and provide safe defaults.
5. Live interpretation on every keystroke without debounce can be jittery on slower machines: must debounce and budget interpreter time.

U00-00 Deliverables list

U00-01 Required deliverables

1. spec.md containing this specification.
2. README.md as defined in Q00-01.
3. language.md glyph dictionary with complete operator definitions.
4. Implementation code (separate task, not part of this deliverable).
5. A sample gallery embedded in the UI plus stored in a data structure in code.

U00-02 Required deliverables

1. Screenshots or short clips demonstrating sample outputs.
2. A small “glyph palette” UI for insertion.
3. A share link feature.
