---

A00 Project Guide

---

# Grid and Atlas Helper

This repository contains a static browser application for creating pixel-accurate grids and slicing sprite atlases. The application uses HTML, CSS, native JavaScript modules, browser Canvas APIs, local storage, and the bundled JSZip browser library. It must not require a build system or server-side application. 

## Repository Structure

```text
.progress/
  Implementation reports, report templates, and historical examples.

.specs/
  Product, UX, quality, logging, implementation, verification, and acceptance specifications.

src/
  Application source code.

vendor-libs/
  Third-party browser libraries. JSZip is provided here.
```

## Required Reading Order

Before implementing or modifying the application:

1. Read every Markdown file in `.specs/`.
2. Treat the specifications as one coordinated requirement set.
3. Read `.progress/implementation001.md` and any later `implementationNNN.md` files.
4. Use `.progress/implementation.report.template.md` when recording new work.
5. Use the historical progress report only as a formatting reference, not as a source of project requirements.

The specification set defines the product behavior, pixel geometry, UX, implementation quality, diagnostics, acceptance criteria, and implementation process. The application must preserve the two primary modes, Grid Creator and Atlas Slicer, and use one shared grid definition model. 

## Specification Map

```text
.specs/suggestions001-1.md
  Product and developer implementation specification.
  Defines scope, terminology, grid mathematics, state, persistence,
  rendering, slicing, naming, recommendations, and export behavior.

.specs/suggestions001-2.md
  UX and UI specification.
  Defines the approved visual direction, panels, toolbar, controls,
  viewport, selected-cell inspector, sprite strip, recommendations,
  status presentation, scrolling, responsiveness, and interactions.

.specs/suggestions001-3.md
  Implementation quality specification.
  Defines code quality, visual consistency, SVG and icon quality,
  component boundaries, testing, resilience, performance, accessibility,
  and the project's definition of done.

.specs/suggestions001-4.md
  Final implementation and acceptance directive.
  Defines implementation sequencing, acceptance checks, self-review,
  progress reporting, evidence requirements, and release conditions.
```

The approved UX uses three stable work areas: a left tools panel, a dominant central workspace, and a right contextual panel. Recommendations must not move or interrupt the normal tool controls. 

## Implementation Guidance

Inspect existing code before choosing or changing the architecture.

Implement work in meaningful, independently verifiable chunks. For each chunk:

```text
Understand the applicable specifications.
Inspect related existing code.
Define the acceptance checks.
Implement the smallest coherent solution.
Run focused checks.
Review the implementation skeptically.
Correct discovered problems.
Run regression checks.
Record evidence in the progress report.
```

Do not mark work complete merely because code was written or the application loaded once. A chunk is complete only after its relevant acceptance checks pass. 

When specifications leave a minor detail unresolved, use careful technical judgment. Prefer the decision that maximizes correctness, user-data preservation, predictable behavior, accessibility, maintainability, and diagnostic reproducibility. Record significant decisions and their validation in the progress report. 

## Progress Reports

Record implementation work under:

```text
.progress/implementation001.md
.progress/implementation002.md
.progress/implementation003.md
```

Create the next increment when a major phase begins or the current report becomes difficult to navigate. One report may contain several related entries.

Each report should identify:

```text
Scope
Specifications covered
Existing code inspected
Decisions and reasons
Files added or modified
Implementation work
Acceptance checks performed
Passed and failed checks
Problems found
Corrections made
Remaining risks
Remaining TODO items
Evidence
```

Use precise status language:

```text
Implemented
Verified
Partially verified
Not verified
Blocked
Deferred
```

Do not claim verification when behavior was only inspected. Progress reports are implementation evidence, not promotional summaries. 

## Logging and Diagnostics

Logging quality is a required part of implementation quality.

Use one centralized logger. Do not scatter direct `console.log` calls through feature modules.

Important user interactions and multi-stage operations must record enough selected state to reconstruct what happened. Logs should include:

```text
Application identifier
Severity
Functional area
Stable event name
Concise technical message
Relevant key-value fields
Transaction identifier when applicable
Operation result
Failure stage and recovery when applicable
```

Do not dump live application objects, DOM nodes, image data, complete URL payloads, or arbitrary state. Log selected immutable snapshots containing only fields needed for diagnosis.

Important transactions, including image loading, preset import, selected-cell export, and ZIP export, must have a start event and one terminal result:

```text
completed
failed
cancelled
superseded
```

Keep logs readable and balanced. Coalesce wheel, pan, rendering, progress, and other high-frequency events. Logging must never break the application.

## Code Quality

Use descriptive names and explicit units:

```text
cellWidthPixels
separatorHeightPixels
sourceImageWidthPixels
selectedColumnIndex
durationMs
```

Keep domain calculations independent from the DOM. Preview rendering, selection, recommendations, manifests, and exports must use the same geometry implementation.

Introduce helpers only when they remove genuine repeated structure without hiding behavior. Do not create speculative frameworks, unused extension points, legacy-browser branches without evidence, or abstractions whose purpose cannot be explained.

Quality requires correctness, usability, consistency, maintainability, performance, resilience, accessibility, scope discipline, and verifiability. 

## Verification

Read the acceptance checklist:

```text
Before implementation
During implementation
At final verification
```

Test normal, boundary, invalid-input, repeated-action, asynchronous, recovery, keyboard, responsive, logging, and export scenarios.

Challenge assumptions. Re-derive important formulas, inspect generated files, compare preview geometry with exported geometry, and review code from developer, tester, maintainer, accessibility, performance, diagnostic, and privacy perspectives.

Confidence is not evidence. Record what was actually verified and disclose anything that could not be verified. 

## Completion Rule

Do not declare the project complete while a known critical or major inconsistency remains.

Completion requires:

```text
Required functionality implemented
Acceptance checks passed
Exports inspected
Logging verified
Accessibility reviewed
Resources cleaned up
Progress reports current
Self-review completed
Known limitations disclosed
No unexplained console errors
```
