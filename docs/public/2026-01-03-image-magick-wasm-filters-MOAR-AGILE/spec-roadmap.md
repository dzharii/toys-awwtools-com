2026-01-03
## roadmap_A00 Document purpose and scope

This document defines a staged implementation roadmap for the local-only ImageMagick WebAssembly image editing playground. The goal is to split the full scope into a small number of deliverable iterations, where each iteration produces a runnable, usable application that can be reviewed in a browser and extended in the next iteration.

This roadmap only sequences work and defines iteration-specific deliverable criteria. The functional and UX requirements remain defined by the **main specification**, the **UI specification**, and the **acceptance checklist**.

## roadmap_B00 Inputs and constraints that shape the roadmap

The implementation vendors the `magick-wasm` distribution locally and does not use bundlers. The application is a static `HTML` + `JavaScript` + `CSS` single page that operates locally with **no image uploads** or server-side processing.

All ImageMagick processing executes **off the main UI thread**. Scheduling implements **debounce** plus **latest-wins** staleness rejection.

The UI architecture uses a project-scoped reusable layer: widget instances with control descriptors, a per-widget typed state store, a centralized scheduler, lazy activation, and progress reporting.

Acceptance verification uses the acceptance checklist as the tracking source of truth, with iteration-by-iteration coverage until all items are satisfied.

## roadmap_C00 Iteration design rules

Each iteration delivers a runnable, reviewable static app that demonstrates new capability while preserving prior behavior.

Each iteration leaves the codebase in a state that supports adding more widgets without rewriting binding, scheduling, lazy activation, worker protocol, preview rendering, CLI rendering, and download behavior.

Refactoring is explicitly allowed inside **iteration 2** and **iteration 4**. Refactoring must not remove working features from the previous deliverable unless the replacement is present in the same iteration deliverable.

When a widget operation or encoder is not supported by the wasm build, the widget is disabled or hidden with a clear message rather than partially implemented.

## roadmap_D00 Roadmap overview

This roadmap uses **five iterations**. Iteration 1 builds the foundation and proves the worker-based processing loop with a small number of widgets. Iteration 2 completes the reusable UI layer and scales to a core set of non-interactive widgets. Iteration 3 adds the first interactive geometry widget and the first fixed multi-step pipeline widget, validating progress reporting and heavier scheduling rules. Iteration 4 adds the remaining advanced widgets and combined pipelines while paying down technical debt. Iteration 5 focuses on completeness and polish, including diagnostics, robust error handling, accessibility, and final acceptance closure.

## roadmap_E00 Instructions for the coding agent at the end of every iteration

At the end of each iteration implementation, the coding agent must stop and produce a short, structured report that enables a human to validate the deliverable before proceeding.

The report must include: (1) what changed, (2) what is working now, (3) what is intentionally not present yet, and (4) how to validate quickly in a browser.

The report must include a short “manual validation script” written as step-by-step actions a tester can perform, plus the expected observable outcomes for each step. These steps must be aligned with the iteration’s stated acceptance scope.

The agent must end the report by asking the user to validate the deliverable and explicitly choose whether to proceed to the next iteration. The agent must not start the next iteration’s work until the user confirms validation or explicitly requests to proceed anyway.

For iterations that introduce refactoring (iterations 2 and 4), the report must also include a short regression checklist describing what previously-working behaviors should be re-checked.

## roadmap_iteration_1_A00 Deliverable definition

Iteration 1 delivers a single-page static app that loads locally, allows the user to select an image, renders a stable Source Preview, and renders at least two independent widgets that process the image asynchronously and produce a preview, a CLI string, and a downloadable output.

## roadmap_iteration_1_B00 Implementation content

Iteration 1 includes project skeleton and static asset layout that load the vendored `magick-wasm` distribution locally.

Iteration 1 includes top-of-page image ingestion with drag-and-drop plus file picker, including file type rejection, decode failure handling, and pixel budget enforcement.

Iteration 1 includes a Source Preview frame with fixed layout and aspect-preserving scaling so images never resize the page layout.

Iteration 1 includes a minimal application state machine implementing `NoSource`, `SourceLoaded`, `WasmUnavailable`, and `SourceError`, with a visible global error when wasm fails to initialize.

Iteration 1 includes a working worker pipeline: main thread posts a job with source bytes and widget parameters; worker runs the WebAssembly ImageMagick runtime to produce output bytes; main thread converts output to a blob URL for preview and triggers download.

Iteration 1 includes a minimal shared widget card pattern sufficient for two widgets: card layout, preview frame, parameter controls using native HTML controls, and a CLI footer with Copy and Download. The full descriptor-driven system is not required in this iteration, but the code must not prevent adopting it in iteration 2.

Iteration 1 implements two low-risk widgets that validate parameter controls and ImageMagick option mapping. Recommended: Brightness and contrast plus Gaussian blur.

## roadmap_iteration_1_C00 Acceptance scope

Iteration 1 acceptance covers: app loads, ingestion works, Source Preview is stable, processing is off-main-thread, two widgets produce preview, CLI, and download, and the UI remains responsive during slider changes and scrolling.

## roadmap_iteration_1_D00 End-of-iteration agent reporting and validation

When iteration 1 is implemented, the agent must report the concrete list of delivered capabilities: ingestion, Source Preview stability, worker execution, two widgets, CLI copy, and download.

The agent must provide a manual validation script that includes: loading a large-ish image, dragging sliders rapidly, scrolling while processing, copying CLI text, and downloading outputs, with expected outcomes such as “UI remains responsive” and “widget outputs update after a short delay.”

The agent must call out what is not yet implemented, at minimum: lazy activation, centralized scheduler, control descriptors, progress stages, geometry widgets, and the full widget catalog.

The agent must ask the user to validate iteration 1 and either approve moving to iteration 2 or request fixes.

## roadmap_iteration_2_A00 Deliverable definition

Iteration 2 delivers a usable widget catalog with a consistent card structure, lazy eligibility rules, centralized scheduling with debounce and latest-wins staleness rejection, and a core set of non-interactive widgets implemented through the reusable UI layer.

## roadmap_iteration_2_B00 Implementation content

Iteration 2 implements the project-scoped reusable UI layer: per-widget state store, control descriptors as the single source of truth for control rendering and parsing, centralized scheduler, lazy activation service, and a standard CLI footer component.

Iteration 2 replaces any per-widget ad hoc bindings from iteration 1 with descriptor-driven control generation and one-way state flow. Control descriptors define labels, hints, types, min/max/step, formatting, defaults, parsing, and clamping.

Iteration 2 implements lazy eligibility rules: a widget auto-renders only when at least 25 percent visible or after direct interaction; on new source image, widget outputs are invalidated and recomputed only when eligible.

Iteration 2 implements shared scheduling: default debounce 150 ms, per-widget debounce overrides, job tokens (`sourceId`, `widgetId`, `paramRevision`), and strict latest-wins stale response rejection.

Iteration 2 implements the modern HTML control rules globally: range inputs with visible numeric values, color picker plus hex field, select for enums, number inputs with constraints, and no custom pointer controls except where explicitly required by later geometry widgets.

Iteration 2 expands the widget set with a core non-interactive group that exercises most control types. Recommended set: Auto-fix and hygiene, Levels and gamma, Brightness and contrast, Color tuning, Smart contrast, Sharpness (Unsharp mask), Denoise, Posterize and dither, Threshold and duotone, Pixelate and mosaic, Edge and emboss, plus Gaussian blur if not already included.

Iteration 2 implements per-widget CLI generation consistently, ensuring stable option ordering per widget and correct inclusion or omission of optional steps.

## roadmap_iteration_2_C00 Acceptance scope

Iteration 2 acceptance expands to include: lazy processing behavior, standardized scheduling behavior, consistent controls and value labels, and correct independent processing across the expanded widget set, with responsive scrolling and input.

## roadmap_iteration_2_D00 End-of-iteration agent reporting and validation

When iteration 2 is implemented, the agent must report the architectural shift: descriptor-driven controls, centralized scheduling, lazy activation, and staleness rejection, plus the list of widgets added.

The agent must provide a manual validation script that specifically validates lazy activation (widgets should not all process immediately), staleness rejection (rapid slider movement should not show old results), and consistent CLI formatting.

Because iteration 2 includes refactoring, the agent must provide a small regression checklist to re-check iteration 1 behaviors: ingestion, Source Preview stability, worker processing, CLI copy, and downloads.

The agent must ask the user to validate iteration 2 and either approve moving to iteration 3 or request fixes.

## roadmap_iteration_3_A00 Deliverable definition

Iteration 3 delivers a catalog that includes at least one interactive geometry widget with pointer handles and at least one fixed multi-step pipeline widget, both integrated with scheduling, perceived progress reporting, and CLI generation.

## roadmap_iteration_3_B00 Implementation content

Iteration 3 implements worker progress events and perceived progress UI. The UI shows a Processing indicator with stage labels and optionally a stage-based progress bar. Progress may be synthetic and stage-based when true percent is not available.

Iteration 3 adds Crop and straighten as the first interactive geometry widget, including crop rectangle selection mapped to source pixel coordinates, rotation, background fill, and optional auto-trim when supported.

Iteration 3 adds Resize and resample, including aspect lock, fit modes, and resample filters, validating control dependency updates under the one-way state model.

Iteration 3 adds one combined pipeline widget, recommended as Clean photo, validating fixed multi-step pipelines, stage reporting, and deterministic CLI output for pipelines.

Iteration 3 introduces the heavy-operation behavior pattern in the UI layer: per-widget Run requirement support and non-live recompute rules, even if the first heavy widget is delivered in iteration 4.

## roadmap_iteration_3_C00 Acceptance scope

Iteration 3 acceptance expands to include: interactive pointer-based crop mapping to source pixels, perceived progress UX, and at least one multi-step pipeline with stable option ordering in the CLI.

## roadmap_iteration_3_D00 End-of-iteration agent reporting and validation

When iteration 3 is implemented, the agent must report the newly delivered interaction types: pointer-based crop selection, dependent resize controls, progress stage UI, and the first pipeline widget.

The agent must provide a manual validation script that includes: selecting a crop rectangle and confirming it maps correctly to the final output, rotating slightly and verifying background fill behavior, resizing with aspect lock, and triggering the pipeline widget while observing progress stages.

The agent must call out what is not yet implemented, at minimum: perspective/distort, chroma key, watermark, LUT presets, remaining pipelines, heavy conditional widgets, diagnostics, and full acceptance closure.

The agent must ask the user to validate iteration 3 and either approve moving to iteration 4 or request fixes.

## roadmap_iteration_4_A00 Deliverable definition

Iteration 4 delivers a near-complete widget catalog including advanced and heavy widgets, with consistent behavior across the entire catalog, plus targeted refactoring to keep widget authoring simple and deterministic.

## roadmap_iteration_4_B00 Implementation content

Iteration 4 adds Perspective and distort with interactive corner handles mapped to source pixels and a Run button requirement, ensuring the scheduler handles both live-debounced and explicit-run modes.

Iteration 4 adds Vignette and tilt-shift, Border/frame/drop shadow, Chroma key, Watermark and annotate, and Motion effects, validating composition, alpha handling, and text input behavior.

Iteration 4 adds LUT-based color grading (CLUT) with local bundled presets and no runtime downloads, validating offline asset management.

Iteration 4 adds Local contrast / clarity and Stylize, validating additional operator mapping and debounce overrides for heavier effects.

Iteration 4 adds remaining combined pipelines: Portrait pop, Vintage film, Comic poster, Teal-orange cinematic, ensuring deterministic step order and stage-based perceived progress.

Iteration 4 adds Content-aware resize (Liquid rescale) as a conditional heavy widget with required Run button and clear unavailable messaging when unsupported.

Iteration 4 performs debt paydown: consolidate worker-call code into a single worker client API, normalize all widgets to the shared control descriptor schema, and ensure all widgets use shared preview, CLI, and download components.

## roadmap_iteration_4_C00 Acceptance scope

Iteration 4 acceptance expands to cover most widget-specific items, especially interactive and heavy-operation behaviors, alpha-preserving output for Chroma key, and correct handling of unsupported operations.

## roadmap_iteration_4_D00 End-of-iteration agent reporting and validation

When iteration 4 is implemented, the agent must report the new advanced widgets added, how Run-based widgets behave, which widgets are conditionally disabled due to build support, and what refactoring was performed.

The agent must provide a manual validation script emphasizing: perspective handle mapping and Run behavior, chroma key output preserving transparency, watermark behavior with empty text, LUT preset selection without network access, and at least one heavy operation’s perceived progress behavior.

Because iteration 4 includes refactoring, the agent must provide a regression checklist re-validating iteration 2 and 3 behaviors, especially scheduling, lazy activation, crop mapping, and pipeline determinism.

The agent must ask the user to validate iteration 4 and either approve moving to iteration 5 or request fixes.

## roadmap_iteration_5_A00 Deliverable definition

Iteration 5 delivers a complete implementation that satisfies the full acceptance checklist, with robust error handling, diagnostics, accessibility, and consistent behavior across all widgets. This iteration does not introduce new feature scope.

## roadmap_iteration_5_B00 Implementation content

Iteration 5 hardens global and per-widget state machines, ensuring actionable error messages, preservation of last valid output on failures, Reset to defaults per widget, and the global Reset all widgets with confirmation.

Iteration 5 implements and validates the diagnostics panel (collapsed by default) showing wasm state, worker state, last error, and a rolling job log, ensuring it does not interfere with normal UX.

Iteration 5 finalizes accessibility: keyboard reachability for all controls, visible numeric values for ranges, plain-language select labels, and readable errors not relying on color alone.

Iteration 5 finalizes output correctness: output metadata per widget, conservative format support, stable filename format, and right-click save behavior preserved by preferring image element previews when possible.

Iteration 5 validates determinism of CLI generation across all widgets, including pipelines and widgets with conditional steps, ensuring stable option ordering and correct no-op behavior where applicable.

Iteration 5 produces the short high-level README describing purpose and main features.

## roadmap_iteration_5_C00 Acceptance scope

Iteration 5 is complete only when every acceptance item is satisfied or is clearly marked not applicable due to wasm build limitations, with compliant disabled or hidden behavior and clear messaging.

## roadmap_iteration_5_D00 End-of-iteration agent reporting and validation

When iteration 5 is implemented, the agent must report which acceptance items are fully satisfied, which items are not applicable due to build limitations, and how those non-applicable cases manifest in the UI.

The agent must provide a full manual validation script that covers representative paths across the widget catalog, plus error paths (unsupported file, pixel budget exceeded, wasm load failure simulation if feasible).

The agent must ask the user to validate iteration 5 and confirm acceptance closure.

## roadmap_J00 Iteration gating criteria and handoff rules

For each iteration, the implementer provides a short test note that identifies which acceptance items are covered in that iteration and which remain for later iterations, using the acceptance checklist as the tracking baseline.

Each iteration deliverable includes at least one realistic manual test scenario: load an image, scroll the catalog, adjust parameters, verify responsiveness, verify CLI copy, and verify download. Scenarios must exercise the new capabilities introduced in that iteration.

## roadmap_K00 Mapping to specifications

The functional requirements are defined in the **main specification**.

The UI architecture requirements are defined in the **UI specification**.

The acceptance verification requirements are defined in the **acceptance checklist**.
