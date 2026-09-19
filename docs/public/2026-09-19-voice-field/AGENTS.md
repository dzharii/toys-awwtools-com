# A00 Project identity and mission

This repository contains **voice-field**, a dependency-free, voice-reactive visual instrument for the web.

The application presents a visually isolated recording Stage containing an animated Reactive Field and an optional Voice Trace. Microphone input influences the visual simulation in real time through browser-native audio analysis. The surrounding Control Frame lets the user select presets, palettes, visual behavior, audio influence, Stage aspect ratio, and related presentation settings without placing those controls inside the recordable Stage.

The primary use case is external screen recording. `voice-field` does not record or encode video itself. The user selects the Stage as the capture region in external recording software.

The finished application is a static single-page web application implemented with HTML, CSS, and JavaScript. It must be buildable into a static `dist/` directory and deployable to **GitHub Pages** without a server-side runtime.

Agents working in this repository are expected to work end to end. Do not stop after scaffolding, a static mockup, one renderer, or a partial proof of concept when the assigned specification calls for a complete feature. Implement, run, inspect, test, refine, and finish the requested work.

# B00 Specifications are the primary design source

All project specifications live under:

```text
./.specs/
```

The `.specs` directory is intentionally a dot-directory.

Before implementing substantial work, inspect `./.specs/` thoroughly and read every specification relevant to the task. Do not treat specifications as optional background material. They define the intended product behavior, UX, visual character, interaction model, technical constraints, acceptance criteria, and examples.

Specifications are deliberately detailed and may use scenario-driven prose to communicate not only what the application does, but how it should feel while a user interacts with it. Preserve that intent during implementation.

Do not skim only headings or acceptance criteria. Read the surrounding prose and examples because they establish perceptual requirements that may not be expressible as a single assertion.

Visual reference images may also be placed manually under `.specs/`. Prefer keeping them in a dedicated location such as:

```text
.specs/
|-- ...
`-- references/
    |-- ...
    `-- ...
```

When reference images are present, inspect them. They are design evidence for composition, polish, spacing, visual hierarchy, color behavior, Reactive Field appearance, responsive layouts, and overall atmosphere.

Use visual references as inspiration and design guidance rather than attempting blind pixel-for-pixel reproduction. Combine the strongest ideas from the references into one coherent application.

If incidental mockup content conflicts with written specification behavior, follow the written specification. For example, exploratory images may contain text or controls inside the Stage that the written specification explicitly excludes.

When requirements remain genuinely ambiguous after reviewing the specifications and existing implementation, use best judgment. Choose the solution that most strongly preserves the established product principles rather than stopping for minor implementation questions.

# C00 Product invariants

The following decisions are foundational.

`voice-field` is a static web application.

It has no backend.

It has no database.

It has no authentication.

It has no required cloud service.

It has no telemetry requirement.

It does not upload microphone data.

It does not perform speech recognition.

It does not transcribe speech.

It does not synthesize audio.

It does not monitor the microphone through the user's speakers.

It does not record video.

The browser receives microphone input only so that the application can derive local visual-control signals.

The recordable **Stage** and the surrounding **Control Frame** are different concepts.

The Stage is what external recording software captures.

The Control Frame is the editing and performance interface around it.

The Stage must remain visually clean.

The Stage must contain **no application text**. Do not place branding, slogans, instructions, preset names, microphone status, debug information, tooltips, control labels, or other UI text inside it.

The Voice Trace is permitted inside the Stage because it is part of the visual composition rather than application chrome.

The central animated phenomenon is called the **Reactive Field**.

The bar- or pole-based voice visualization is called the **Voice Trace**.

The primary user-facing scene configuration is called a **Preset**.

A **Palette** defines scene colors and contributes a restrained Scene Accent to the surrounding Control Frame.

An **Excitation Point** is an invisible, slowly wandering location from which voice-driven disturbances can enter the Reactive Field.

The Excitation Point follows a **bounded wandering trajectory**. It must not teleport randomly and must not behave like a straight-line screensaver bouncing between edges.

Silence does not mean visual stillness. Every visual scene has Idle Motion. Voice activity adds energy to an already living system.

Voice behavior must not be implemented as raw microphone volume directly scaling an object. Audio analysis should derive semantic features such as overall energy, low/mid/high-frequency energy, transient strength, phrase activity, and silence duration, then allow each visual Style to interpret those values.

Different Styles may use materially different WebGPU simulations internally while exposing a common expressive control vocabulary to the user.

Scene changes should occur through smooth Scene Transitions. Avoid visually abrupt replacement.

The Control Frame should inherit a restrained accent from the active scene. The underlying application shell remains neutral and consistent.

# D00 Platform and dependency policy

The runtime application must use browser-native technologies.

The primary technologies are:

```text
HTML
CSS
JavaScript
ES modules
WebGPU
Web Audio
MediaDevices
Canvas/browser rendering APIs where useful
Pointer, touch, keyboard, and other standard Web APIs
```

Do not introduce React, Vue, Svelte, Angular, Three.js, Babylon.js, PixiJS, Tailwind, Bootstrap, jQuery, shader frameworks, UI libraries, visualization libraries, audio libraries, icon packages, runtime CSS frameworks, or similar external application dependencies unless an explicit future specification reverses this decision.

The default is **zero external runtime dependencies**.

Do not add a library because implementing the required behavior directly takes more work. This project intentionally uses the Web Platform directly.

Small local assets are allowed where they materially improve visual quality. Runtime behavior must not depend on third-party CDNs.

Procedural GPU-generated visuals are generally preferred over large static image assets.

Inline or locally stored SVG is preferred over introducing an icon package.

System font stacks are preferred over remote font services.

JavaScript configuration files are preferred over introducing a configuration framework.

# E00 Build and GitHub Pages deployment

The application must ultimately build into:

```text
./dist/
```

`dist/` must contain a self-contained static website suitable for deployment to GitHub Pages.

A deployed build must not require Node.js, Bun, a server process, environment variables, a backend, dynamic routing infrastructure, or runtime package installation.

GitHub Pages is the hosting target.

Be careful with asset and module paths. A GitHub Pages project site may be hosted beneath a repository path rather than `/`. Do not accidentally assume that every resource is available from the domain root.

Prefer relative static asset paths unless there is a compelling reason otherwise.

Bun is available on the development system and may be used for development automation and the build process.

Using Bun as a tool does not change the zero-runtime-dependency requirement.

Prefer a lightweight build process. A build may validate, copy, transform, or minify source files into `dist/`. Do not create an elaborate bundling architecture when native ES modules and static files already solve the problem.

A reasonable project goal is:

```bash
bun run build
```

producing a complete:

```text
dist/
```

directory.

If native ES modules can be shipped essentially unchanged, that is acceptable. The build exists to produce a predictable deployable artifact, not to justify unnecessary bundling.

The repository may include development scripts in `package.json` if useful for Bun commands, but avoid package dependencies unless a future requirement explicitly requires them.

# F00 Recommended project structure

Prefer a structure close to the following:

```text
voice-field/
|-- AGENTS.md
|-- README.md
|-- package.json
|-- index.html
|
|-- .specs/
|   |-- ...
|   `-- references/
|       `-- ...
|
|-- src/
|   |-- css/
|   |   `-- app.css
|   |
|   |-- js/
|   |   |-- main.js
|   |   |-- app-state.js
|   |   |
|   |   |-- config/
|   |   |   |-- defaults.js
|   |   |   |-- palettes.js
|   |   |   `-- presets.js
|   |   |
|   |   |-- audio/
|   |   |   |-- audio-engine.js
|   |   |   `-- voice-features.js
|   |   |
|   |   |-- render/
|   |   |   |-- renderer.js
|   |   |   |-- transition.js
|   |   |   |-- excitation.js
|   |   |   |-- voice-trace.js
|   |   |   `-- styles/
|   |   |       |-- silk.js
|   |   |       |-- membrane.js
|   |   |       |-- liquid.js
|   |   |       |-- chrome.js
|   |   |       |-- nebula.js
|   |   |       |-- particles.js
|   |   |       `-- ember.js
|   |   |
|   |   `-- ui/
|   |       |-- controls.js
|   |       |-- layout.js
|   |       `-- gestures.js
|   |
|   `-- shaders/
|       `-- ...
|
|-- assets/
|   `-- ...
|
|-- scripts/
|   `-- ...
|
|-- tests/
|   `-- ...
|
`-- dist/
    `-- generated by the build
```

This is a preferred starting architecture, not a prohibition on improving file boundaries.

Change the structure when doing so creates clearer ownership or simpler code.

Do not collapse unrelated rendering, audio, configuration, UI, and application-state behavior into one large JavaScript file.

Likewise, do not fragment the project into dozens of tiny abstractions that make a small browser application difficult to navigate.

Favor deep modules with clear responsibilities.

# G00 Configuration and presets are source-controlled data

Presets are a central product concept.

Preset definitions should live in ordinary JavaScript, preferably:

```text
src/js/config/presets.js
```

Palettes should live in:

```text
src/js/config/palettes.js
```

Application defaults should live in:

```text
src/js/config/defaults.js
```

The exact paths may change if the structure changes, but these concepts should remain clearly separated from rendering logic.

A maintainer should be able to create a new Preset by copying an existing JavaScript object, changing its Style, Palette, and normalized expressive values, reloading or rebuilding the application, and seeing the result.

Do not require a database, editor application, JSON schema compiler, code generator, or external CMS for presets.

README documentation should explain how to add and edit Presets, Palettes, defaults, and supported Style identifiers.

# H00 Rendering architecture

WebGPU is the primary renderer.

Visual quality is a core product requirement, not an optional polish stage.

The initial major visual families are:

```text
Silk
Membrane
Liquid
Chrome
Nebula
Particles
Ember
```

Presets may art-direct these into scenes such as Aurora, Ocean, Forest, Monochrome/Void, and other visual identities.

Different visual families may use different simulation and rendering techniques.

Do not force every Style through one implementation merely to make the architecture superficially uniform.

Instead, expose a common semantic input contract.

Styles should consume concepts such as:

```text
Energy
Motion
Detail
Voice Influence
Excitation Drift
Idle Motion
Palette
Voice Envelope
Speech Impulse
Low-frequency energy
Mid-frequency energy
High-frequency energy
Phrase activity
Excitation Point
```

The user-facing meaning of these values should stay stable even when the shader implementation differs.

The renderer should be time-based rather than frame-count-based.

Reuse GPU resources rather than reallocating large buffers or textures every frame.

Handle resize intentionally.

Handle device-pixel ratio intentionally.

Avoid uncontrolled CPU/GPU synchronization.

Prefer stable frame rate over unnecessary visual complexity.

Desktop should target smooth high-quality animation, normally around 60 FPS on appropriate hardware.

Mobile may reduce quality automatically.

# I00 Audio architecture

Use browser-native Web Audio and MediaDevices APIs.

Microphone processing is local.

The application should derive stable high-level voice features rather than exposing raw microphone samples directly to visual Styles.

Audio analysis should distinguish at least the functional equivalents of:

```text
overall voice energy
smoothed Voice Envelope
low-frequency energy
mid-frequency energy
high-frequency energy
transient / Speech Impulse strength
slow phrase activity
silence duration
```

The system should account for ordinary microphone noise.

Do not allow a low-level noise floor to keep the scene permanently in an active-speech state.

Audio behavior should make isolated words, short pauses, continuous speech, louder phrases, and prolonged silence visibly different.

The graphics should interpret audio rather than literally graphing an FFT.

# J00 Responsive interaction architecture

Desktop supports three intentional density states:

```text
Compact Desktop
Standard Desktop
Wide Desktop
```

Compact Desktop preserves the Stage and collapses secondary controls.

Standard Desktop places major creative controls around the Stage.

Wide Desktop uses additional space to reveal more tools and presets rather than merely stretching the Stage.

Mobile uses:

```text
Compose Mode
Performance Mode
```

Compose Mode exposes configuration.

Performance Mode prioritizes a clean Stage.

Horizontal swipe switches between the two modes.

Do not allow swipe detection to interfere with ordinary sliders or controls.

Mobile may use reduced rendering quality.

The desktop and mobile applications are the same product but are not required to expose identical interaction patterns at every moment.

# K00 Available development tools

Prefer tools already installed on the system before installing additional software.

The development environment currently provides, or is expected to provide, useful tools including:

```text
Bun
Playwright
ImageMagick
FFmpeg
```

Use them when appropriate.

**Bun** may be used for development commands, static serving, scripts, validation, testing orchestration, and generating the `dist/` build.

**Playwright** should be used extensively for browser-level validation where practical. A globally or otherwise pre-installed Playwright environment should be preferred over adding Playwright as an application dependency.

Use Playwright for tasks such as:

```text
loading the application
testing controls
changing presets
changing Stage aspect ratios
testing responsive breakpoints
testing mobile Compose/Performance behavior
testing swipe behavior
checking Stage boundaries
checking that Stage text is absent
capturing screenshots
detecting browser-console errors
testing GitHub-Pages-like static paths
repeated scene changes
basic performance and stability observations
```

**ImageMagick** may be used to inspect, resize, crop, compare, compose, or analyze screenshots and visual-reference assets.

**FFmpeg** may be used when moving-image inspection, frame extraction, synthetic audio fixtures, waveform generation, encoded test inputs, or visual regression investigation would benefit from it.

These tools are development tools. Their availability does not mean the shipped application may depend on them.

Agents may use any other tools already present on the machine if useful.

Agents may also install additional development tools when genuinely necessary.

Use best judgment before doing so.

Prefer existing tools first.

Do not add permanent project dependencies merely because a temporary diagnostic tool is convenient.

If a one-off command-line utility can be installed or invoked outside the application's runtime dependency graph, keep that distinction clear.

# L00 Image generation and visual investigation

Visual development may use image-generation tooling when available.

An agent may generate exploratory images, textures, masks, reference frames, or other visual assets when doing so helps answer a design question or improves implementation quality.

Generated material should not automatically become a production dependency.

Use generated references to understand composition, motion, palette, surface treatment, material response, and scene possibilities.

If generated static assets are included in the application, store them locally in the repository and verify their size and suitability.

Image generation does not replace implementing the actual Reactive Field behavior in WebGPU.

A beautiful static texture that does not respond convincingly to speech is not a substitute for the required visual simulation.

# M00 Autonomous implementation behavior

Agents should work autonomously through normal engineering decisions.

Do not repeatedly stop for approval on implementation details already constrained by the specifications.

Use best judgment.

When several technically valid options exist, prefer the one that:

```text
preserves visual quality
preserves smooth interaction
keeps the architecture understandable
uses browser-native capabilities
avoids unnecessary dependencies
works reliably on GitHub Pages
keeps the Stage clean
supports testing
maintains good runtime performance
is easy for a future agent to understand and modify
```

Explore the repository before making architectural changes.

Read existing source before replacing it.

Inspect relevant `.specs` material before implementing related behavior.

Use browser developer tools, Playwright, screenshots, local scripts, GPU debugging techniques, generated fixtures, ImageMagick, FFmpeg, and other available capabilities whenever they can answer factual questions.

Do not ask the user for information that can be obtained from the repository, browser, specification, generated reference material, or available tooling.

If the specification leaves a low-level technical decision open, make the decision.

If an implementation initially looks poor, iterate.

If an effect technically works but does not meet the established visual quality, it is not finished.

If a layout passes tests but obviously fails visually, it is not finished.

If one preset works while the rest are placeholders, the application is not finished.

# N00 Testing and verification discipline

Test continuously rather than only at the end.

After meaningful changes, run the application and exercise the affected behavior.

Check the browser console.

Check WebGPU validation errors.

Check responsive layouts.

Check Stage proportions.

Check input behavior.

Check animation continuity.

Check preset transitions.

Check microphone permission behavior.

Check performance.

Use automated and visual validation together.

DOM assertions alone cannot establish whether a shader looks correct.

Screenshots alone cannot establish whether interactions work.

Both are required.

Where practical, create deterministic tests for audio-reactive behavior.

Synthetic or injected feature sequences should cover cases such as:

```text
silence
one isolated impulse
a short pause
several impulses
sustained voice activity
a long silence returning to Idle Motion
```

Use Playwright screenshot capture for representative visual states.

At minimum, inspect representative layouts for:

```text
standard 1920x1080 desktop
constrained desktop
ultrawide desktop
mobile portrait
the supported Stage aspect ratios
major shipped Presets
```

Test repeated transitions.

Test repeated resizing.

Test extended animation.

Look for memory leaks, accumulating event listeners, repeated GPU-resource allocation, broken device state, or progressive frame-rate degradation.

# O00 GitHub Pages requirements

The final build must work when served as static files from GitHub Pages.

Do not depend on server rewrites.

Do not assume an application server.

Do not require environment variables at runtime.

Do not use filesystem APIs unavailable in browsers.

Do not assume root-relative paths when repository-relative hosting would break them.

Verify the production `dist/` build through a local static server before considering deployment complete.

Where practical, use Playwright against `dist/`, not only against development source.

The repository should eventually support a straightforward GitHub Pages deployment workflow.

A GitHub Actions deployment workflow may be added when appropriate, but it should remain simple: build the project, publish `dist/`.

# P00 Completion standard

A task is not complete merely because code has been written.

A substantial feature is complete when the relevant specifications have been reviewed, the feature has been implemented end to end, the application runs, behavior has been exercised, visual output has been inspected, automated checks have been run where appropriate, browser errors have been addressed, responsive behavior has been checked, and the implementation matches both the functional and experiential intent of the specification.

For the project as a whole, completion means a user can open the GitHub Pages deployment, grant microphone permission, choose a Preset, see a high-quality Reactive Field already alive in Idle Motion, speak and observe physically coherent voice-driven changes, change visual settings without abrupt discontinuities, select a clean Stage aspect ratio, use a refined Voice Trace if desired, and capture that Stage using external screen-recording software without application chrome or text contaminating the recorded scene.

The resulting application should feel like a finished visual instrument, not a collection of WebGPU experiments.


Language: uppercase words are structural keywords; text after them is free-form meaning; indentation defines scope.
Built-ins: DIRECTIVE, WHEN, IF, ELSE, FOR EACH, REPEAT UNTIL, PARALLEL, ASSESS, STOP. 

DIRECTIVE implement specification work end to end
  read all relevant specifications in ./.specs/ and all specifications provided by the user
  retain their requirements, examples, acceptance criteria, terminology, architectural constraints, and visual references as working context
  inspect the existing project before changing it
  use best judgment to resolve details that the specifications leave open
  prefer existing tools on the system
  install additional development tools only when they materially help and do not introduce unnecessary runtime dependencies
  continue until the requested work is implemented, tested, reviewed, integrated, and verified

WHEN beginning specification work
  understand the complete requested behavior before implementation
  identify the requirements implied by the specifications
  identify dependencies between requirements
  order requirements so foundational work precedes dependent work

  IF important facts remain uncertain
    research them using the repository, specifications, browser behavior, documentation, experiments, Playwright, and other available tools
    do not guess when the answer can be established

FOR EACH requirement
  ASSESS the requirement
    identify the expected behavior
    identify affected code and existing behavior
    identify dependencies and edge cases
    identify how correctness will be verified

  IF additional research is needed
    perform the research before committing to an implementation

  implement the requirement completely
    integrate it with previously completed behavior
    preserve established project architecture and terminology
    keep the implementation clear and as simple as the requirement permits
    avoid duplicate implementations and unnecessary abstractions

  document the implementation where necessary
    comment non-obvious intent, invariants, algorithms, browser behavior, shader behavior, formulas, workarounds, or important tradeoffs
    do not comment code whose purpose is already clear from its structure and naming
    keep comments concise and useful for future maintenance

  test the requirement using the techniques appropriate to it
    use unit tests for isolated logic
    use integration tests for interactions between modules
    use Playwright for browser-visible behavior
    use deterministic fixtures or injected state when external input would make tests unreliable
    inspect visual output when visual correctness is part of the requirement
    inspect browser, WebGPU, and runtime errors when applicable

  REPEAT UNTIL requirement-specific tests pass
    diagnose failures
    fix their underlying causes
    retest

  verify coherence with previously completed requirements
    confirm shared state and behavior remain consistent
    confirm earlier requirements have not regressed
    simplify or refactor code when the combined implementation has become harder to understand than necessary

  perform a code review
    inspect correctness
    inspect error handling and cleanup
    inspect state and resource ownership
    inspect naming and architecture
    inspect performance-sensitive paths
    inspect comments and tests
    inspect the complete affected flow rather than only the latest lines changed

  REPEAT UNTIL no known critical or high-impact defect remains
    fix identified defects
    rerun affected tests
    retest integration with existing behavior
    review the changed code again

  verify the completed requirement against its source specification
    confirm that its examples, constraints, and acceptance criteria are satisfied
    do not proceed while part of the requirement remains knowingly incomplete

WHEN all requirements are complete
  run the complete relevant test suite
  build the production application
  test the production build under GitHub Pages compatible static-hosting conditions
  exercise representative user scenarios and responsive layouts
  inspect representative visual states where applicable
  perform a final integrated code review

  REPEAT UNTIL the implementation and specifications agree
    identify remaining gaps or regressions
    fix them
    test them
    rebuild when needed
    verify the affected flows again

  STOP only when the requested specifications are implemented as a coherent, tested, maintainable application
