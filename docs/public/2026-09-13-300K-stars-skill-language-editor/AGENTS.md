2026-09-13

# AGENTS.md

## A01 - Project

This repository contains the experimental **Skill Language Editor**.

It is a greenfield browser application for editing the skill-language documents under `examples/skills/`. The language is structured technical prose: ordinary English combined with uppercase structural keywords, indentation-defined scope, named lists, and a deliberately small Markdown subset.

The goal is a high-quality, compact text-editor experience with lightweight syntax highlighting, local persistence, file import/export, drag-and-drop, and installable PWA behavior.

Although this is an experiment, treat the resulting implementation as production-quality example code. The finished project should be good enough to reuse as a reference for future browser experiments. Prefer clear, direct techniques that demonstrate good engineering practices without unnecessary architecture.

## B01 - Read specifications first

Before implementing or changing behavior, read all applicable files under:

```text
.specs/
```

The initial specification is:

```text
.specs/suggestions001-01-initial-specification.md
```

Additional specifications may be added over time. Read the complete `.specs/` directory before making substantial implementation decisions, and use the newest applicable specification when later documents refine earlier decisions.

Specifications are the authoritative description of product behavior. Existing code is not automatically authoritative when it disagrees with a specification.

## C01 - Repository structure

The repository is expected to contain approximately this structure:

```text
.
├── .specs/
│   └── suggestions001-01-initial-specification.md
├── examples/
│   └── skills/
│       ├── information-research-task-scoped-evidence-research-v2026-09-13.md
│       ├── output-all-skills.md
│       ├── text-transcript-task-create-executive-summary-from-video-subtitles-v2026-09-11.md
│       ├── text-writing-trait-no-llm-slop-v2026-09-11.md
│       └── text-writing-trait-no-weasel-words-v2026-09-12.md
├── lib/
│   └── lib-asvd-microlight-0.0.7/
│       ├── LICENSE
│       ├── microlight.js
│       └── README.md
└── work-assets/
```

Use `examples/skills/` as real input material when implementing and testing the editor and syntax highlighter.

`lib/lib-asvd-microlight-0.0.7/` contains vendored reference material. Preserve its license and attribution.

`work-assets/` may contain pre-created images, icons, screenshots, source assets, fixtures, or other development material. Inspect it before recreating an asset from scratch. Reuse suitable assets when doing so improves consistency or avoids unnecessary work.

Do not assume this directory listing is exhaustive. The project will gain normal application, test, asset, PWA, and configuration files as implementation proceeds.

## D01 - Implementation constraints

Use modern browser JavaScript, HTML, and CSS.

Do not add runtime dependencies from CDNs, npm packages, frameworks, editor libraries, icon libraries, hosted fonts, analytics systems, or external services.

Everything required by the shipped application must be contained in this repository.

Vendored code and assets are acceptable when they are intentionally stored in the repository with the required license information.

Prefer browser APIs and small purpose-built implementations over libraries.

The application should remain understandable as an experiment. Avoid framework complexity, dependency graphs, generated abstractions, and tooling layers that do not materially improve the finished application.

Bun may be used for development scripts, tests, asset generation, optional bundling, or other local tooling when it provides a clear benefit. The final browser application must not require Bun, Node.js, a package registry, or a development server in order to function.

## E01 - Available development tools

Use useful tools already installed in the environment rather than manually reproducing their functionality.

Playwright and its pre-installed browsers may be used for browser automation, interaction testing, screenshots, regression checks, keyboard testing, persistence testing, and end-to-end validation.

ImageMagick may be used for image inspection, conversion, resizing, optimization, PWA icon generation, and other deterministic image-processing work.

Bun may be used for local scripts, tests, development utilities, and optional bundling.

Normal system utilities may be used whenever they are the simplest reliable way to inspect, transform, validate, or generate project files.

Tooling is an implementation aid. Do not introduce a runtime dependency merely because a development tool was useful.

## F01 - Engineering priorities

Preserve native text-editor behavior whenever possible.

Editing correctness, responsiveness, source fidelity, and predictable behavior are more important than decorative syntax highlighting.

Keep ordinary English visually dominant. Highlight only meaningful skill-language structure and the explicitly supported Markdown subset.

Do not turn the project into a general IDE, full Markdown editor, formal parser, or application framework.

Keep the application compact, local-first, dependency-free at runtime, and suitable for publication as a standalone experiment.

Prefer straightforward code over clever code.

Prefer a small number of well-defined modules or functions over layers of abstractions.

Prefer explicit state and explicit data flow over generic infrastructure.

Do not add extension systems, plugin systems, dependency injection, generic event buses, elaborate state-management frameworks, or speculative abstractions unless the specifications explicitly require them.

## G00 - Greenfield project expectations

This is a greenfield experimental project. There is no legacy architecture to preserve unless a specification or existing checked-in implementation explicitly establishes one.

Use that freedom carefully.

Choose the simplest design that completely satisfies the specifications and produces a high-quality result.

The code should be easy for another developer or coding agent to read from top to bottom and understand without reverse-engineering unnecessary indirection.

Experimental does not mean disposable. The finished repository is intended to become an exemplary reference for similar future experiments, so implementation quality, naming, error handling, accessibility, tests, project hygiene, and source organization still matter.

Avoid overengineering. A simple implementation that is correct, observable, tested, and easy to modify is better than a highly abstract implementation designed for hypothetical future requirements.

## H00 - Project completeness and repository hygiene

Treat the repository as a complete small application, not merely a collection of source snippets.

Create or maintain all ordinary project files needed for a clean, understandable repository.

At minimum, ensure an appropriate `.gitignore` exists.

The `.gitignore` should ignore generated or machine-local artifacts that may be produced by the chosen development workflow, such as dependency caches, temporary files, browser-test output, coverage output, screenshots generated only for testing, build artifacts when builds are used, and operating-system or editor noise.

Do not ignore source assets, specifications, examples, vendored libraries, required PWA files, intentional test fixtures, or other files needed to reproduce the application.

If Bun or another optional development tool is introduced, add only the configuration files that are actually useful. Do not create package metadata, lockfiles, build configuration, lint configuration, or other project furniture merely because such files are common in larger projects.

The final repository should make its structure and execution model obvious to a developer opening it for the first time.

## I00 - Ambiguities, contradictions, and autonomous judgment

Work autonomously.

When specifications are clear, implement them directly without asking unnecessary questions.

When an implementation detail is unspecified, consider the realistic options and choose the option that best fits the established project goals: simplicity, native browser behavior, performance, accessibility, local-first operation, source fidelity, and minimal runtime complexity.

When two specifications appear to conflict, first determine whether a later specification intentionally refines an earlier one. Prefer the newest clearly applicable decision.

When a genuine contradiction remains, choose the interpretation that best preserves the project's established behavior and intent. Record the ambiguity in an appropriate concise code comment, development note, or implementation log when future maintainers would benefit from knowing about it.

Do not stop work for minor uncertainty that can be resolved competently with engineering judgment.

Do not silently invent major product behavior that would materially change the application.

Consider multiple implementation options before committing to consequential architecture, performance, storage, rendering, or compatibility decisions. Choose the simplest option that satisfies the real requirements rather than the most sophisticated option available.

## J00 - Code quality and abstraction policy

Write modern, idiomatic JavaScript and CSS.

Use descriptive names.

Keep functions focused.

Keep state transitions explicit.

Separate concerns when doing so improves comprehension, but do not manufacture abstractions merely to reduce line count or create architectural symmetry.

A useful abstraction should remove genuine duplication, isolate a real behavioral boundary, or make an important invariant easier to enforce.

A useless abstraction merely moves straightforward code behind additional names and files.

Optimize for a developer being able to understand why the system works.

Avoid premature generalization.

Avoid speculative extensibility.

Avoid generic utilities when a small local function communicates the intent more clearly.

Avoid classes unless object lifetime or encapsulated state genuinely benefits from them. Plain functions and plain objects are preferred when they are sufficient.

## K00 - Logging and observability

During development, maintain clear, structured, high-level logging for significant operations.

Logging should help a developer understand what the application is doing without flooding the console with implementation noise.

Useful events include operations such as document restoration, autosave success or failure, file import, export, replacement confirmation, PWA installation state, service-worker registration, storage errors, highlighter performance warnings, and other meaningful state transitions.

Log relevant context explicitly.

Prefer messages shaped conceptually like:

```js
console.info(
  "[editor] file imported",
  JSON.stringify({
    filename,
    bytes: text.length,
    lines: lineCount
  })
);
```

Do not log entire browser events, `File` objects, DOM nodes, application state objects, storage objects, or other raw object graphs.

Do not write:

```js
console.log("file imported", file);
console.log("state", state);
console.log(event);
```

Select only the properties that help diagnose the operation.

When structured context is useful, construct a small purpose-specific object and serialize it with `JSON.stringify`.

Keep logs readable in a normal browser console.

Do not log full document contents, pasted source, autosaved source, or other potentially large user data merely for convenience.

Avoid logging on every keystroke, caret movement, scroll event, animation frame, or highlight token. Log operations and exceptional conditions, not implementation chatter.

Use appropriate levels consistently:

```text
console.info   meaningful successful operations
console.warn   degraded behavior or recoverable problems
console.error  failed operations that require attention
```

Development logging may be more detailed than final production logging, but useful diagnostic events should remain easy to enable and interpret.

## L00 - Comments and documentation inside code

Comments should explain intent and context, not narrate syntax.

For important functions or non-obvious implementation boundaries, add a concise high-level comment that helps the next developer understand why that code exists and what project requirement it protects.

Write the comment as the explanation itself.

Good:

```js
// Keeps the textarea and highlight mirror on identical layout metrics so
// highlighted text cannot drift away from the native caret.
function syncEditorMetrics() {
  // ...
}
```

Good:

```js
// Preserves browser-native editing while allowing syntax colors to be rendered
// independently underneath the textarea.
function renderHighlightedLine() {
  // ...
}
```

Avoid algorithm narration:

```js
// Loops over the lines and checks every character.
```

Avoid comments that simply restate the function name.

Avoid comments beginning with artificial labels such as:

```text
Why we need this method:
Purpose:
This function does:
```

The explanation should stand on its own.

Keep comments concise. They are hints that accelerate understanding, not substitutes for readable code.

Detailed algorithms should be understandable from the implementation itself unless the algorithm has a non-obvious invariant that genuinely needs explanation.

## M00 - Testing and verification

Use real browser verification for behavior that depends on browser editing semantics.

Playwright should be used where practical for important flows such as startup, text editing, Tab and Shift+Tab behavior, Ctrl/Cmd+S interception, localStorage restoration, Open, drag/drop, replacement confirmation, filename editing, soft wrapping, status updates, and PWA behavior.

Test the application with real skill files from `examples/skills/`.

Also test unusually large documents because editing responsiveness is a product requirement.

Verify the highlighted mirror and textarea remain aligned while typing, wrapping, scrolling, selecting text, changing indentation, and using supported fallback fonts.

Use screenshots when visual comparison is useful, but do not substitute screenshot testing for behavioral assertions.

Use ImageMagick when deterministic image analysis or asset generation is useful.

When a bug is found, prefer adding a focused regression test at the highest practical behavioral seam before or alongside the fix.

## N00 - Completion standard

Do not consider a feature complete merely because its happy-path code exists.

A completed change should satisfy the applicable specifications, work through the real browser UI, preserve existing required behavior, handle expected error cases, maintain the project's no-runtime-dependency constraint, and leave the repository clean.

Before finishing substantial work, inspect the final repository state rather than only the files changed during the task.

Remove temporary artifacts that should not be committed.

Keep useful fixtures and generated assets only when they are intentionally part of the project.

The final result should remain simple enough to serve as an example of how to build this class of browser experiment well.

## O00 - ALWAYS!  Exploratory and ad hoc validation

Exploratory testing is hands-on validation in which the agent actively exercises the application, observes its behavior, investigates unexpected results, and adapts subsequent checks based on what it discovers. It complements permanent automated tests by testing realistic interactions and combinations that may not have been anticipated when the implementation was written.

During development, and especially before considering the project complete, create temporary ad hoc tests for the application's important behavior. Use the available Playwright installation and installed Playwright browsers whenever browser automation can validate the behavior more reliably than code inspection alone.

Temporary exploratory tests may live under:

```text
.adhoc/
```

Add this directory to `.gitignore`:

```gitignore
.adhoc/
```

Nothing under `.adhoc/` is intended to be committed. Use it freely for Playwright scripts, temporary fixtures, screenshots, diagnostic output, generated test documents, and other short-lived validation artifacts.

Treat exploratory validation as an active investigation rather than a fixed checklist. Start from the important behaviors below, exercise realistic combinations, inspect failures and visual results, and add additional checks when testing exposes a suspicious boundary.

```text
Skill Language Editor exploratory validation
|
+-- Startup and document state
|   +-- first launch loads the default template
|   +-- saved local draft restores after reload
|   +-- filename restores correctly
|   +-- cursor and scroll position restore where applicable
|   +-- corrupt or unavailable local storage fails safely
|
+-- Editing
|   +-- ordinary typing
|   +-- insertion and deletion
|   +-- multiline editing
|   +-- undo and redo
|   +-- copy and paste
|   +-- text selection
|   +-- mouse and keyboard caret movement
|   +-- soft-wrapped long lines
|   +-- Enter preserves indentation
|   +-- Tab inserts the inferred indentation unit
|   +-- Shift+Tab removes indentation
|   +-- multiline Tab and Shift+Tab preserve useful selection behavior
|
+-- Highlighting
|   +-- uppercase structural prefixes
|   +-- multiword prefixes such as FOR EACH and REPEAT UNTIL
|   +-- custom uppercase prefixes
|   +-- uppercase words inside ordinary prose remain ordinary
|   +-- Markdown headings
|   +-- bold markup
|   +-- inline backtick code
|   +-- list markers
|   +-- contextual list definitions
|   +-- incomplete Markdown remains unstyled
|   +-- indentation guides
|   +-- current-line treatment
|   +-- selection suppresses current-line treatment
|   +-- textarea and highlight mirror remain aligned
|
+-- File operations
|   +-- New
|   +-- Open
|   +-- drag one file into the editor
|   +-- reject or safely handle multiple dropped files
|   +-- replacement confirmation
|   +-- Keep current
|   +-- Replace draft
|   +-- filename editing and sanitization
|
+-- Saving and persistence
|   +-- autosave after the configured debounce
|   +-- autosave status changes correctly
|   +-- Ctrl+S / Cmd+S prevents browser Save Page behavior
|   +-- Save downloads a revision
|   +-- revision filename is correct
|   +-- old generated revision suffix is replaced
|   +-- downloaded content uses LF
|   +-- downloaded content ends with one newline
|   +-- editing after download returns to local-save state
|
+-- Browser behavior
|   +-- native selection remains usable
|   +-- native clipboard behavior remains usable
|   +-- spellcheck remains available
|   +-- Ctrl+F / Cmd+F is not intercepted
|   +-- scrolling does not disturb highlighting
|   +-- caret movement does not trigger unnecessary syntax work
|
+-- Responsiveness
|   +-- normal skill document
|   +-- long document
|   +-- approximately 5,000 lines or 500 KB stress case
|   +-- rapid typing
|   +-- rapid deletion
|   +-- large paste
|   +-- long wrapped lines
|   +-- scrolling through a large document
|
+-- PWA and offline behavior
|   +-- manifest and icons load
|   +-- service worker registers when supported
|   +-- application opens offline after being cached
|   +-- editing and local persistence work offline
|   +-- Save/export works offline
|
+-- Failure and boundary cases
    +-- empty document
    +-- one-line document
    +-- unusual indentation
    +-- literal tab characters
    +-- HTML-like source remains inert text
    +-- malformed Markdown
    +-- storage failure
    +-- unsupported or unusual imported text file
    +-- rapid sequence of New/Open/Save operations
```

Use Playwright to perform actual browser interactions rather than only calling implementation functions directly. Prefer tests that click the real controls, type into the real textarea, dispatch keyboard shortcuts, reload the page, inspect localStorage when useful, drop files, and verify observable UI state.

Create focused ad hoc scripts as questions arise. For example, if textarea/highlight alignment appears suspicious after soft wrapping, create a temporary Playwright check specifically for wrapped-line alignment instead of relying on visual intuition.

Run exploratory validation throughout implementation where useful, then perform a broader final pass before declaring the project complete.

When exploratory testing finds a real regression-prone defect, consider promoting the useful part of that temporary check into the project's permanent test suite. Leave purely investigative scripts and generated artifacts in `.adhoc/`.

