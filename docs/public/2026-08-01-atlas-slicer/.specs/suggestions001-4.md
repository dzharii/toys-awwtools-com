---

A00 Purpose of This Final Implementation Directive

---

This document is the final implementation and acceptance directive for the Grid and Atlas Helper project.

It is addressed to the coding implementer:

```text
Codex 4.6 Sol
```

Codex 4.6 Sol is responsible for implementing the application described by the complete specification set, including:

1. The product and developer implementation specification.
2. The UX and UI specification.
3. The implementation quality specification.
4. The logging and diagnostic specification.
5. This final implementation, verification, progress-reporting, and acceptance specification.

The implementer must treat the specifications as one coordinated system.

The objective is not merely to produce source files that appear to implement the requested features. The objective is to deliver a complete, coherent, maintainable, visually polished, diagnostically observable, and demonstrably verified browser application.

The final implementation must be suitable for direct use as a static HTML, CSS, and JavaScript module application.

The implementation must not require a build system unless an existing project structure already requires one and removing it would reduce quality.

The implementation must preserve the central constraints:

```text
Static browser application
Native JavaScript modules
HTML and CSS
No required server-side component
Local image processing
Local presets
URL configuration
PNG export
ZIP sprite export through JSZip
Grid Creator mode
Atlas Slicer mode
Pixel-accurate calculations
Desktop-oriented compact interface
```

---

B00 Authority and Responsibility of Codex 4.6 Sol

---

Codex 4.6 Sol is authorized to make implementation decisions when the specifications do not define a detail completely.

This authorization is not permission to disregard the specification.

It is permission to resolve ambiguity responsibly.

When Codex encounters an inconsistency, omission, or ambiguous requirement, it must:

1. Identify the underlying user value.
2. Identify the requirements that constrain the decision.
3. Compare plausible implementation options.
4. Select the option that produces the most coherent and maintainable result.
5. Verify that the selected option does not contradict an explicit requirement.
6. Record the decision and its reasoning in the progress report.
7. Validate the result through implementation checks.

Codex must not stop work merely because a minor detail is unspecified.

Codex must not select the easiest implementation when it visibly reduces quality, correctness, usability, or maintainability.

Codex must not create unnecessary questions for decisions that can be resolved through careful technical judgment.

When an ambiguity has material product consequences and cannot be resolved without changing the intended user experience, Codex should record the blocking issue explicitly. It should still complete all independent work that can be completed safely.

---

C00 Decision Priority When Specifications Conflict

---

When two requirements appear to conflict, Codex shall use this priority order:

```text
1. Pixel and export correctness
2. Preservation of user data and configuration
3. Explicit user-facing functional requirements
4. Accessibility and operability
5. Stable and understandable UX
6. Diagnostic reproducibility
7. Maintainable code
8. Performance within the supported scope
9. Visual refinement
10. Optional convenience
```

This priority order must not be applied mechanically.

Codex must first determine whether the apparent conflict can be removed through a better design.

Example:

```text
Requirement A:
The left tools panel must remain stable.

Requirement B:
The user must see contextual recommendations.

Resolution:
Place recommendations in the stable right contextual panel rather than inserting them between tools.
```

When a decision changes the interpretation of a specification, the progress report must include:

```text
Decision
Affected requirements
Alternative options considered
Reason for the selected option
How the decision was validated
```

---

D00 Required Implementation Behavior

---

Codex must behave as an implementer, reviewer, tester, and evidence producer.

It must not treat implementation as a single pass.

The required behavior is:

```text
Understand
Plan
Implement
Inspect
Test
Challenge assumptions
Correct
Retest
Document evidence
```

Codex must divide the work into meaningful implementation chunks.

A meaningful chunk:

* produces a coherent capability;
* can be verified independently;
* has clear entry and completion conditions;
* does not leave knowingly broken shared infrastructure;
* is small enough to review in detail;
* is large enough to produce useful progress.

Examples of suitable chunks:

```text
Application shell and panel layout
Central state and grid calculation model
Grid Creator rendering
Atlas image loading and slicing model
Viewport pan and zoom
Selected-cell inspection
Sprite preview strip
Preset and session persistence
URL state
PNG and ZIP export
Logging infrastructure
Accessibility and keyboard interaction
Final integration and verification
```

Examples of unsuitable chunks:

```text
Add three random buttons
Create one unrelated helper
Change several colors
Partially start export without validation
Implement one calculation in a UI event handler
```

---

E00 Mandatory Planning Before Implementation

---

Before modifying the implementation, Codex must read the complete available specification set.

It must then produce an internal implementation map covering:

1. Required user-visible capabilities.
2. Required domain calculations.
3. Required shared state.
4. Required rendering layers.
5. Required storage formats.
6. Required export flows.
7. Required logging events.
8. Required accessibility behavior.
9. Required verification scenarios.
10. Required progress-report evidence.

Codex must inspect the existing repository before selecting an architecture.

The inspection must identify:

```text
Current file structure
Current entry point
Current dependencies
Existing JSZip location and exposure
Existing HTML structure
Existing CSS organization
Existing JavaScript modules
Existing naming conventions
Existing incomplete implementations
Existing unused code
Existing progress reports
Existing specification files
Available test or browser automation tools
```

Codex must not assume that the repository is empty.

Codex must not discard useful existing implementation without evaluating it.

Codex must not preserve poor existing implementation merely because it already exists.

---

F00 Implementation Chunk Lifecycle

---

Every implementation chunk shall follow this lifecycle:

1. Define the chunk objective.
2. Identify applicable specification requirements.
3. Identify acceptance checks.
4. Inspect existing related code.
5. Decide whether to reuse, revise, or replace it.
6. Implement the smallest coherent solution.
7. Run focused checks.
8. Review the code without assuming correctness.
9. Correct identified problems.
10. Run regression checks.
11. Record results in the progress report.
12. Update the final acceptance checklist.

Codex must not mark a chunk complete because the source code was written.

A chunk is complete only when its relevant acceptance checks pass.

---

G00 Progress Report Directory and Files

---

Implementation progress must be recorded in:

```text
.progress/
```

The expected project structure includes:

```text
.progress/
  implementation001.md
  implementation002.md
  implementation003.md
  ...
  example-of-project-report-from-another-project-2026-04-26-PROGRESS.md

.specs/
  ...
```

The example report may be used as a structural reference.

It must not override this specification.

The incremental implementation reports shall use names in the following form:

```text
implementation001.md
implementation002.md
implementation003.md
```

The number must increase monotonically.

Codex may create a new implementation report when, in its best judgment:

* the previous report has become difficult to navigate;
* a major implementation phase begins;
* a major design decision needs independent treatment;
* an integration or validation phase begins;
* the current report has accumulated several distinct topics;
* a clean separation improves traceability.

One report may contain several related entries.

Codex must not create one file for every minor action.

Codex must not place all project history into one unstructured report.

---

H00 Progress Report Purpose

---

The progress report is not a promotional summary.

It is implementation evidence.

It must allow another developer to determine:

```text
What was attempted
What was implemented
Why particular decisions were made
Which files changed
Which checks were performed
Which checks passed
Which checks failed
Which defects were found
Which defects were corrected
Which risks remain
Which work is still incomplete
```

The report must distinguish:

```text
Implemented
Verified
Partially verified
Not verified
Blocked
Deferred
```

Codex must not claim that something was verified when it was only inspected.

Codex must not claim that all acceptance tests passed if some were not run.

---

I00 Required Progress Report Structure

---

Each implementation report should contain sections similar to:

```md
# Implementation Progress 001

## Scope

## Specification Requirements Covered

## Existing Code Inspected

## Decisions

## Implementation Work

## Files Added

## Files Modified

## Tests and Acceptance Checks Performed

## Problems Found

## Corrections Made

## Remaining Risks

## Remaining TODO Items

## Evidence Summary
```

The exact headings may be adjusted when a different organization improves clarity.

Each implementation entry should include a timestamp or implementation sequence marker.

Each important decision should be described in technical prose.

---

J00 Decision Record Format

---

A significant decision should use this form:

```md
### Decision: Keep recommendations outside the tools panel

Context:
The tools panel must remain spatially stable while recommendations can appear and disappear.

Options considered:
1. Insert recommendations under the affected field.
2. Insert recommendations at the bottom of the tools panel.
3. Use the dedicated right contextual panel.

Decision:
Use the dedicated right contextual panel.

Reason:
This preserves tool positions, keeps recommendations visible, and matches the approved UX direction.

Validation:
Verified that recommendation changes do not modify the left panel layout or scroll position.
```

A decision record must be created for choices that:

* resolve a specification ambiguity;
* introduce an important abstraction;
* change an existing architecture;
* change data schema;
* alter user-visible behavior;
* deliberately exclude an apparent feature;
* introduce a compatibility limitation.

---

K00 Implementation Story Requirement

---

At the end of implementation, Codex must provide an implementation story.

The implementation story must explain:

1. How the project was decomposed.
2. Which architectural decisions were made.
3. How the domain model was established.
4. How the UI was constructed.
5. How state flows through the application.
6. How rendering and export share the same calculations.
7. How browser-specific constraints were handled.
8. How logging was integrated.
9. How quality problems were found.
10. How those problems were corrected.
11. What validation evidence exists.
12. What remains uncertain, if anything.

The implementation story must not be a chronological list of every command.

It should explain the evolution of the implementation and the proof of completion.

---

L00 Anti-Bias and Self-Validation Directive

---

Codex must not assume that an implementation is correct because:

* it compiled;
* it loaded once;
* it visually resembled the design;
* the code appears elegant;
* the implementation was generated confidently;
* one happy-path check succeeded;
* no exception was immediately visible.

Confidence is not evidence.

Codex must deliberately challenge its own implementation.

After implementing a feature, Codex should ask:

```text
What assumption could be wrong?
Which calculation could be off by one?
Which state could become stale?
Which control could update only visually but not functionally?
Which asynchronous result could arrive late?
Which user action could occur twice?
Which resource could remain allocated?
Which browser behavior could differ?
Which acceptance requirement did I not actually test?
```

Codex must use at least one independent review technique for each major subsystem.

Suitable techniques include:

```text
Rubber-duck explanation
Adversarial test-case design
Second-pass code review from a different role
Re-derivation of formulas
Independent calculation using known examples
Comparison of preview and exported output
Fresh-page workflow reconstruction
Temporary diagnostic assertions
Separate reviewer or sub-agent, when available
```

---

M00 Required Review Hats

---

Codex shall review the finished implementation from several perspectives.

The developer hat asks:

```text
Is the code understandable?
Are responsibilities separated?
Is unnecessary code present?
Can the behavior be traced?
```

The user hat asks:

```text
Can the task be completed?
Are controls predictable?
Are errors understandable?
Is the layout stable?
```

The tester hat asks:

```text
How can this fail?
What happens at boundaries?
What happens with invalid inputs?
What happens during repeated actions?
```

The maintainer hat asks:

```text
Can a future developer modify this safely?
Are formulas and invariants documented?
Are names accurate?
Are lifecycle and cleanup responsibilities clear?
```

The accessibility hat asks:

```text
Can the workflow be completed without a mouse?
Are labels and focus states correct?
Is important canvas information available as text?
```

The performance hat asks:

```text
Is expensive work repeated?
Does a large atlas create excessive DOM or memory use?
Are rendering and storage writes controlled?
```

The diagnostic hat asks:

```text
Can a failure be reconstructed from logs?
Are transaction start and result events paired?
Are relevant state values included?
```

The security and privacy hat asks:

```text
Is local image content kept local?
Are imported values inserted safely?
Do logs expose unnecessary information?
```

---

N00 Rubber-Duck Review Procedure

---

For each major subsystem, Codex should explain the implementation in plain technical language.

The explanation must cover:

```text
The subsystem's purpose
Its inputs
Its outputs
Its authoritative state
Its derived state
Its side effects
Its failure modes
Its cleanup behavior
Its acceptance checks
```

If the explanation becomes difficult, circular, or dependent on vague phrases, Codex should inspect the design for unnecessary complexity.

Examples of vague phrases that require further review:

```text
It somehow updates the grid
The helper handles everything
This should always be available
The browser will probably manage it
This is safe because it is simple
This cannot fail
```

---

O00 Sub-Agent or Independent Review Guidance

---

When sub-agent support is available, Codex should use it for independent review of high-risk areas.

Suitable review assignments include:

1. Verify all grid formulas and coordinate examples.
2. Review state synchronization and stale asynchronous operations.
3. Review export correctness and ZIP structure.
4. Review accessibility and keyboard behavior.
5. Review CSS consistency and responsive layout.
6. Review logging coverage against the logging specification.
7. Search for dead code, unused selectors, and unnecessary abstractions.
8. Review progress-report claims against actual evidence.

The reviewing agent should be asked to find problems, not to confirm quality.

A poor review prompt:

```text
Confirm that this implementation is correct.
```

A better review prompt:

```text
Assume that this implementation contains subtle defects. Identify calculation, state, lifecycle, accessibility, and acceptance gaps. Provide concrete evidence for every issue.
```

If no sub-agent is available, Codex must perform the review itself in a separate pass with the same adversarial framing.

---

P00 Required Verification Evidence

---

Every completed major feature must have evidence in at least one of these forms:

```text
Automated assertion
Automated behavior test
Rendered screenshot
Exported file inspection
Structured log sequence
Manual scenario result
Source-level proof for an invariant
```

High-risk features should have more than one form of evidence.

Examples:

```text
Grid calculation:
Automated rectangle assertions plus rendered visual check.

ZIP export:
Behavior test plus archive-content inspection.

Keyboard navigation:
Manual keyboard scenario plus focus-state screenshot.

Logging:
Structured-record test plus captured transaction sequence.
```

Codex must not use a screenshot as the only evidence for invisible behavior.

Codex must not use code inspection as the only evidence for a complex user workflow when runtime verification is possible.

---

Q00 Acceptance Test Design Standard

---

Each acceptance test shall define:

1. Identifier.
2. Category.
3. Preconditions.
4. Input or user action.
5. Expected visible result.
6. Expected state result.
7. Expected logging result where applicable.
8. Expected exported result where applicable.
9. Cleanup or restoration.
10. Pass or fail evidence.

Example:

```text
Identifier:
ATLAS-SELECT-001

Preconditions:
A 1024 x 768 atlas is loaded.
Cell size is 32 x 32.
No borders or separators are configured.
Traversal is row-major.

Action:
Click cell at column 5, row 2.

Expected visible result:
The selected cell has a visible yellow highlight.
The right panel displays the selected tree preview.
The sprite strip reveals and highlights the corresponding thumbnail.

Expected state result:
selectedRow=2
selectedColumn=5
selectedIndex=69
sourceX=160
sourceY=64

Expected log result:
selection.cell.changed is logged with the same coordinates.

Pass evidence:
Screenshot and captured structured log record.
```

---

R00 Acceptance Severity

---

Acceptance items shall be classified by severity.

```text
Critical:
Incorrect output, lost data, unusable application, security or privacy failure.

Major:
Important functionality missing, inconsistent state, inaccessible primary workflow, severe visual instability.

Moderate:
Feature works but violates a meaningful quality or UX requirement.

Minor:
Cosmetic inconsistency or low-impact polish issue.
```

Release policy:

```text
Critical inconsistency:
Must be fixed.

Major inconsistency:
Must be fixed.

Moderate inconsistency:
Should be fixed before completion unless explicitly documented and accepted.

Minor inconsistency:
May remain only if documented and if correction would introduce disproportionate risk.
```

The user explicitly requires major inconsistencies to be fixed.

Codex must not close the implementation while a known major inconsistency remains.

---

S00 Acceptance Test Execution Phases

---

The acceptance checklist must be read and applied at three points.

First reading, before implementation:

```text
Understand required outcomes.
Identify architecture implications.
Identify required fixtures and test support.
Prevent implementation choices that would make verification difficult.
```

Second reading, during implementation:

```text
Measure progress against acceptance outcomes.
Identify missing behavior early.
Prevent local implementation from drifting away from the complete workflow.
Update evidence and unresolved items.
```

Third reading, after implementation:

```text
Execute the complete verification set.
Resolve critical and major failures.
Confirm that progress-report claims match evidence.
Produce the final implementation story.
```

Codex must explicitly record these three checklist reviews in the progress report.

---

T00 Core Application Acceptance Criteria

---

The application is acceptable only when:

1. It starts through the documented static hosting method.
2. Its module entry point loads without errors.
3. JSZip is available before ZIP export is requested.
4. Grid Creator and Atlas Slicer tabs are visible and functional.
5. Switching modes does not reload the page.
6. Shared grid configuration remains coherent across modes.
7. Mode-specific viewport state is preserved.
8. The left, center, and right panels use independent layout and scrolling behavior.
9. The central workspace remains the dominant visual region.
10. The application does not make unintended network requests.
11. Source images remain local to the browser.
12. No unexplained console errors occur during standard workflows.

---

U00 Grid Calculation Acceptance Tests

---

The following examples are mandatory.

### U01 Borderless cells without separators

```text
Canvas width: 100
Cell width: 10
Separator width: 0
Outer borders: 0
Expected complete columns: 10
Expected remainder: 0
Expected first cell: x=0, width=10
Expected final cell: x=90, width=10
```

Validate that:

* cell 0 contains source pixels 0 through 9;
* cell 1 begins at source pixel 10;
* the final cell ends at source pixel 99;
* no separator is invented after the final cell.

### U02 Borderless cells with one-pixel separators

```text
Canvas width: 100
Cell width: 10
Separator width: 1
Expected complete columns: 9
Expected used width: 98
Expected remainder: 2
```

Validate that:

* cell 0 uses x=0 through 9;
* separator 0 uses x=10;
* cell 1 begins at x=11;
* cell 8 uses x=88 through 97;
* x=98 and x=99 remain unused.

### U03 One-pixel outer borders

```text
Canvas width: 100
Cell width: 10
Separator width: 1
Left border: 1
Right border: 1
Expected complete columns: 9
Expected remainder: 0
```

Validate that:

* x=0 is the left border;
* the first cell begins at x=1;
* the first cell ends at x=10;
* x=11 is a separator;
* x=99 is the right border.

### U04 Partial final cell

```text
Canvas width: 100
Cell width: 12
Separator width: 1
Expected complete columns: 7
Expected next-cell start: 91
Expected partial pixels: 9
Expected missing pixels: 3
```

Validate that:

* the application distinguishes partial-cell pixels from unused pixels;
* the warning is contextual and not presented as a fatal error;
* the selected incomplete-cell policy changes export behavior correctly.

### U05 Fixed-count overflow

```text
Canvas width: 100
Requested columns: 8
Cell width: 12
Separator width: 1
Expected required width: 103
Expected overflow: 3
```

Validate that:

* the application does not silently alter the requested count;
* the recommendation to use 103 pixels is available;
* applying the recommendation creates an exact horizontal fit;
* the change is logged and can be undone if undo is implemented.

### U06 Asymmetric borders and nonzero origin

Validate that:

* leading and trailing borders are calculated independently;
* the grid origin affects cell coordinates;
* the selected-cell panel and exported rectangles agree with the calculation;
* no renderer uses a simplified conflicting formula.

---

V00 Grid Creator Acceptance Criteria

---

Validate that:

1. Canvas width and height accept positive integer pixel values.
2. Cell width and height remain usable dimensions excluding separators.
3. Automatic count mode calculates complete rows and columns.
4. Fixed count mode identifies overflow correctly.
5. Transparent background is the default.
6. Solid background uses the selected color and opacity.
7. Grid line color, opacity, style, and dimensions update the preview.
8. Outer-border settings affect layout calculations.
9. The preview shows unused canvas area where present.
10. The preview shows or reports partial cells where present.
11. Pan and zoom affect only the viewport.
12. PNG export uses exact configured dimensions.
13. Transparent PNG export preserves alpha.
14. Preview checkerboard pixels are not exported.
15. Exported grid pixels match the configured separator and border geometry.
16. The right panel presents layout summary, recommendations, and export summary.
17. Applying a recommendation updates all dependent controls and calculations in one coherent state change.
18. The generated filename is valid and predictable.

---

W00 Atlas Image Loading Acceptance Criteria

---

Validate that:

1. Open Image uses a browser file picker.
2. The application does not display a fake editable local output path.
3. Supported images decode and appear in the central viewport.
4. Filename and natural dimensions are displayed.
5. The image is not uploaded.
6. Grid configuration remains available before and after image loading.
7. Replacing an image releases the previous object URL and decoded resources.
8. A failed replacement preserves the previous valid image.
9. Rapid image replacement does not allow a stale decode to replace the newest image.
10. Reload operates only on the in-session selected file.
11. Clear Image removes the image while preserving reusable grid settings.
12. Image-load start and terminal logs use one transaction identifier.

---

X00 Atlas Slicing Acceptance Criteria

---

Validate that:

1. The atlas grid uses the same domain calculation module as Grid Creator.
2. Separator pixels are excluded from slices.
3. Outer-border pixels are excluded from slices.
4. Cell width and height remain exact usable sprite dimensions.
5. Row-major traversal produces the specified index order.
6. Column-major traversal produces the specified index order.
7. Changing traversal does not change physical row and column selection.
8. Complete cells export at exact configured dimensions.
9. Skip policy excludes incomplete cells.
10. Transparent-pad policy produces full-size sprites with transparent missing regions.
11. Solid-pad policy produces full-size sprites with the chosen missing-region color.
12. Crop policy produces smaller partial sprites and warns about nonuniform output.
13. Overlay lines are never included in exported sprites.
14. Source pixels in exported sprites exactly match source atlas pixels.
15. The manifest records the same rectangles used for extraction.

---

Y00 Selected Cell Acceptance Criteria

---

Validate that:

1. Clicking a complete cell selects it.
2. Clicking a separator does not select a neighboring cell accidentally.
3. Selection remains during pan and zoom.
4. Selection updates row, column, index, source coordinates, and dimensions.
5. The selected-cell highlight aligns exactly with the source rectangle.
6. The right panel preview uses nearest-neighbor scaling.
7. The preview is centered within its container.
8. Transparent pixels display over a checkerboard.
9. Download Cell PNG exports the selected cell.
10. Changing geometry revalidates the selection.
11. Invalidated selection moves predictably or clears with an explanation.
12. Arrow-key navigation moves selection correctly.
13. Keyboard navigation skips excluded cells.
14. Selection events are logged with reproduction-relevant coordinates.

---

Z00 Viewport Acceptance Criteria

---

Validate that:

1. Fit displays the complete image inside the available viewport.
2. The image is centered after Fit.
3. 100 percent displays one source pixel as one CSS pixel.
4. 200 percent displays one source pixel as two CSS pixels.
5. 400 percent displays one source pixel as four CSS pixels.
6. Wheel zoom preserves the source point beneath the pointer.
7. Middle-button drag pans.
8. Space plus primary-button drag pans.
9. Zoom and pan do not modify export geometry.
10. Pixel-art rendering remains crisp at integer zoom.
11. Grid visibility can be toggled without recalculating slice geometry.
12. Completed wheel and pan gestures produce coalesced logs rather than per-event log floods.
13. The current zoom is shown in the status area.
14. Mode-specific viewport state is restored after tab switching.

---

AA00 Sprite Preview Strip Acceptance Criteria

---

Validate that:

1. The strip follows the configured traversal order.
2. The selected sprite is visibly highlighted.
3. Clicking a thumbnail selects the corresponding atlas cell.
4. Previous and Next navigate one item.
5. Home and End navigate to the first and final valid items.
6. Page navigation moves by an appropriate visible range.
7. The selected item is revealed when selection changes elsewhere.
8. The strip centers the selected item when useful.
9. The strip does not move unnecessarily when the selected item is already visible.
10. Thumbnail images preserve aspect ratio.
11. Thumbnail images use nearest-neighbor scaling.
12. Transparent sprites use a checkerboard background.
13. Large atlases do not create unbounded thumbnail DOM or cache entries.
14. A thumbnail-generation failure produces a placeholder and a warning log.
15. The displayed current position and total count are correct.

---

AB00 Naming and Export Acceptance Criteria

---

Validate that:

1. The naming template supports documented tokens.
2. Zero-padding behavior matches examples.
3. The selected-cell filename preview updates immediately.
4. Invalid tokens are rejected with an understandable message.
5. Duplicate generated filenames are detected before export.
6. Duplicate names block export.
7. Filenames are sanitized safely.
8. Sprite format and archive format are distinguished.
9. The ZIP contains the expected sprite folder.
10. The ZIP contains `manifest.json` when enabled.
11. The archive count matches the summary.
12. Export progress is visible.
13. Duplicate export activation is prevented.
14. Export failure leaves current image and configuration intact.
15. Temporary canvases and blobs are released after completion or failure.
16. The browser receives a generated download rather than an unsupported filesystem write.
17. Export start and terminal logs share one transaction identifier.

---

AC00 Preset and Persistence Acceptance Criteria

---

Validate that:

1. Local-storage keys are application-namespaced.
2. Named presets can be created.
3. Named presets can be loaded.
4. Named presets can be updated.
5. Named presets can be duplicated.
6. Named presets can be renamed.
7. Named presets can be deleted with appropriate confirmation.
8. Editing a loaded preset marks it modified.
9. Session state is stored separately from named presets.
10. Source image bytes are not stored.
11. Corrupted local storage does not prevent startup.
12. Storage quota failure is reported accurately.
13. Preset schema version is explicit.
14. Older supported schema versions migrate sequentially.
15. Unsupported future schema versions are rejected safely.
16. Imported JSON is validated before application.
17. Exported JSON is readable and versioned.
18. Full preset content is not dumped into normal logs.

---

AD00 URL State Acceptance Criteria

---

Validate that:

1. Supported configuration can be encoded in the URL.
2. Source image bytes are never encoded.
3. URL state has an explicit version.
4. Valid URL state restores configuration.
5. Invalid URL state does not prevent startup.
6. Startup precedence follows the specification.
7. Routine state changes use `history.replaceState`.
8. URL updates are debounced.
9. Long URLs produce an understandable warning where appropriate.
10. Logs include state length and schema version rather than the complete payload.
11. Copy Shareable URL copies the current valid configuration.
12. Opening the copied URL in a fresh session reconstructs the same supported state.

---

AE00 Logging Acceptance Criteria

---

Validate that:

1. Every application log uses the `GAH` identifier.
2. Structured logs include timestamp, level, area, event, message, and fields.
3. Console styling is optional.
4. Plain output remains fully understandable.
5. Styled values use a restrained color palette.
6. No normal log uses aggressive colored backgrounds.
7. Important operations use start and terminal events.
8. One transaction identifier correlates all stages of one operation.
9. Live objects are not dumped directly.
10. Log fields are captured as snapshots.
11. Mutating a source object after logging does not alter the stored record.
12. Error objects are normalized.
13. Non-Error thrown values are normalized.
14. Logs exclude image bytes, DOM nodes, object URLs, and complete URL payloads.
15. The in-memory buffer is bounded.
16. High-frequency events are coalesced or restricted by level.
17. Grid logs contain relevant dimensions and calculated results.
18. Export failures identify the failing stage and sprite where applicable.
19. Unexpected global errors include recent context.
20. Logger failures do not interrupt application behavior.
21. Diagnostic JSON can be exported.
22. The diagnostic export contains enough configuration to reconstruct state without containing source pixels.

---

AF00 UI Visual Acceptance Criteria

---

Validate that:

1. The application uses a compact desktop-oriented layout.
2. The header remains visually stable.
3. Grid Creator and Atlas Slicer tabs are clearly distinguishable.
4. Toolbar buttons share consistent height, typography, icon dimensions, and alignment.
5. Related buttons are grouped.
6. Different groups use visible spacing or separators.
7. Download ZIP is visually primary.
8. The left tools panel remains stable as recommendations change.
9. Recommendations remain in the right contextual panel.
10. The central workspace receives the largest available area.
11. The selected-cell panel remains visible and coherent.
12. Section headers use consistent spacing and typography.
13. Numeric fields and units align.
14. Focus rings are not clipped.
15. Text does not overflow ordinary supported viewports.
16. Independent panel scrollbars appear where needed.
17. The page itself does not acquire unintended horizontal scrolling.
18. The approved light-panel and dark-header direction is preserved.
19. Icons use one coherent visual family.
20. No icon-only action lacks an accessible label.

---

AG00 Responsive Acceptance Criteria

---

Validate at minimum:

```text
1920 x 1080
1600 x 900
1440 x 900
1280 x 800
```

Ensure that:

1. The three-panel layout remains usable at supported wide sizes.
2. The central workspace does not collapse below a practical width.
3. The right panel collapses or moves appropriately when necessary.
4. Toolbar controls do not overlap.
5. The left tools panel remains scrollable.
6. The sprite strip remains navigable.
7. No primary action becomes unreachable.
8. Text remains readable.
9. Controls remain large enough to target.
10. Responsive behavior does not duplicate state or actions.

---

AH00 Accessibility Acceptance Criteria

---

Ensure that:

1. All form controls have programmatic labels.
2. Native buttons are used for actions.
3. Mode tabs use tab semantics.
4. Accordion sections expose expanded state.
5. All primary workflows can be completed using a keyboard.
6. Visible focus is present.
7. Focus order follows the visual structure.
8. Canvas information is also available as text.
9. Color is not the only severity indicator.
10. Recommendation and error text remains understandable without icons.
11. Status announcements are useful but not excessively frequent.
12. Increased browser text size does not hide primary controls.
13. The sprite strip uses manageable keyboard focus behavior.
14. Disabled controls communicate why they are disabled where necessary.

---

AI00 Performance Acceptance Criteria

---

Use representative images and grids.

Ensure that:

1. Ordinary control changes render on the next practical animation frame.
2. Source image pixels are not redrawn unnecessarily for overlay-only changes.
3. URL and session writes are debounced.
4. Thumbnail generation is lazy or bounded.
5. Replacing images does not create unbounded memory growth.
6. Object URLs are revoked.
7. ImageBitmap resources are closed where supported.
8. Export does not retain all temporary canvases indefinitely.
9. ZIP progress is visible for long operations.
10. The application remains inspectable during export where browser behavior permits.
11. Performance warnings are logged without flooding.
12. Optimization complexity is supported by measurement rather than speculation.

---

AJ00 Code Quality Acceptance Criteria

---

Ensure that:

1. Domain calculations are pure and independent from the DOM.
2. One shared geometry implementation drives preview, selection, recommendations, and export.
3. UI components do not query one another's DOM for state.
4. Central state is authoritative.
5. Derived values are not duplicated as independently editable state.
6. Function names describe intent.
7. Variables include units where relevant.
8. Modules correspond to domain or UI responsibilities.
9. Event subscriptions have clear cleanup.
10. Large browser resources have explicit ownership.
11. Comments explain invariants and decisions.
12. Comments do not narrate obvious syntax.
13. No speculative abstractions remain.
14. No dead code remains.
15. No unused CSS selectors remain.
16. No unexplained compatibility branches remain.
17. Repeated UI structure is simplified through clear helpers where justified.
18. Helpers do not create an opaque private framework.
19. Important asynchronous operations protect against stale results.
20. Errors are handled at the layer that can add useful context.

---

AK00 Required Negative Scenarios

---

Codex must test at least these failure scenarios:

1. Open a non-image file.
2. Open a corrupted image.
3. Replace a valid image with an invalid image.
4. Enter zero cell width.
5. Enter a negative separator.
6. Enter an excessively large cell dimension.
7. Configure zero complete cells.
8. Configure fixed-count overflow.
9. Configure partial right-edge cells.
10. Configure partial bottom-edge cells.
11. Use a naming template producing duplicates.
12. Import malformed JSON.
13. Import an unsupported future schema.
14. Corrupt session storage.
15. Simulate storage quota failure where practical.
16. Trigger rapid image replacement.
17. Trigger repeated Download ZIP clicks.
18. Change selection during thumbnail generation.
19. Change geometry during selection.
20. Trigger or simulate PNG encoding failure where practical.
21. Trigger or simulate ZIP generation failure where practical.
22. Resize the viewport during interaction.
23. Switch modes during an asynchronous operation.
24. Use keyboard navigation at grid boundaries.
25. Attempt export with no source image.

For every negative scenario, validate:

```text
The application remains coherent.
The user receives an understandable result.
Unrelated configuration is preserved.
The logs contain reproduction-relevant information.
The interface does not remain permanently disabled.
```

---

AL00 Browser Verification Matrix

---

Codex should verify the completed application in the supported browser set where the environment permits.

Recommended matrix:

```text
Chrome
Edge
Firefox
Safari
```

At minimum, verify:

1. Module loading.
2. Image selection.
3. Canvas rendering.
4. Wheel zoom.
5. Pointer capture and pan.
6. PNG download.
7. ZIP download.
8. Local storage.
9. URL state.
10. Console logging format.
11. Keyboard operation.
12. Responsive layout.

When a browser cannot be tested in the implementation environment, Codex must state that clearly.

It must not claim cross-browser verification without evidence.

---

AM00 Final Broad Verification Procedure

---

After feature-level verification, Codex must perform a broad integrated verification pass.

The broad pass shall:

1. Start from a fresh application session.
2. Complete the primary Grid Creator workflow.
3. Export a transparent grid PNG.
4. Reload the application.
5. Restore or load a preset.
6. Complete the primary Atlas Slicer workflow.
7. Select and download one cell.
8. Navigate through the sprite strip.
9. Change traversal order.
10. Test an incomplete-cell policy.
11. Download a ZIP.
12. Inspect ZIP contents.
13. Verify the manifest.
14. Copy and reopen URL state.
15. Inspect normal logs.
16. Trigger at least one recoverable warning.
17. Trigger at least one controlled error.
18. Export diagnostic logs.
19. Verify keyboard operation.
20. Inspect supported viewport sizes.
21. Review the codebase for dead or unnecessary code.
22. Review progress-report claims against actual results.

---

AN00 Final Self-Code Review Procedure

---

Codex must perform a separate code-review pass after implementation.

The review should not occur while actively writing the same code.

The review must inspect:

```text
Architecture
State ownership
Calculation duplication
Asynchronous race handling
Resource cleanup
Event cleanup
Naming
Comments
Error handling
Logging
Accessibility
CSS consistency
Responsive behavior
Dead code
Unused dependencies
Speculative abstractions
```

For every problem found, Codex shall record:

```text
Problem
Severity
Affected files
Correction
Retest evidence
```

The final report should state how many problems were found during self-review.

Finding problems during self-review is evidence that the review was useful.

Claiming that no review issues existed requires especially strong evidence.

---

AO00 Final Proof Package

---

At completion, Codex must provide a proof package consisting of:

1. The final application source.
2. The complete `.progress` report sequence.
3. The final itemized acceptance checklist.
4. Test output or recorded acceptance results.
5. Representative screenshots.
6. Representative structured logs.
7. Exported PNG samples.
8. An inspected ZIP sample.
9. Manifest sample.
10. Implementation story.
11. Known limitations.
12. Explicit statement of unverified areas.

The proof package must be sufficient for another developer to audit the implementation.

---

AP00 Final Reporting Language

---

The final report must distinguish these terms precisely.

Use `implemented` when code exists.

Use `verified` when the behavior was actually checked.

Use `inspected` when source or output was examined without executing the full workflow.

Use `partially verified` when only part of the acceptance condition was checked.

Use `not verified` when no evidence exists.

Use `blocked` when an external limitation prevented verification.

Do not use vague phrases such as:

```text
Seems fine
Should work
Probably complete
Looks good enough
Mostly done
```

---

AQ00 Required Final Implementation Story Outline

---

The final implementation story shall contain:

```md
# Grid and Atlas Helper Implementation Story

## Initial Repository State

## Specification Interpretation

## Implementation Decomposition

## Architecture

## Domain Model and Pixel Geometry

## UI Construction

## State and Data Flow

## Rendering and Viewport

## Atlas Slicing and Export

## Persistence and URL State

## Logging and Diagnostics

## Accessibility

## Performance and Resource Management

## Important Decisions

## Defects Found During Review

## Corrections

## Acceptance Verification

## Evidence

## Known Limitations

## Final Status
```

---

AR00 Final Status Conditions

---

Codex may report the project as complete only when:

1. All critical acceptance items pass.
2. All major acceptance items pass.
3. No known major inconsistency remains.
4. Required workflows are fully implemented.
5. Required exports are inspected.
6. Logging coverage is verified.
7. Progress reports are current.
8. The final self-review is complete.
9. The final acceptance checklist is updated.
10. Unverified items are explicitly disclosed.

If these conditions are not met, the status must be:

```text
Incomplete
Partially complete
Blocked
```

with a precise explanation.

---

AS00 Final Itemized Implementation and Acceptance TODO

---

The following checklist is both the implementation TODO list and the acceptance verification checklist.

Codex must read it:

1. Before implementation.
2. During implementation.
3. At final verification.

Every item must be marked with one of:

```text
[ ] Not started
[~] In progress
[x] Implemented and verified
[!] Blocked
[-] Not applicable, with reason
```

A checkmark is permitted only when the implementation and its acceptance check have both been completed.

---

AT00 Project Inspection and Foundation TODO

---

* [ ] Inspect the repository structure.

  * Ensure that the current entry point, modules, styles, assets, dependencies, specifications, and progress reports are identified.
  * Validate that no useful existing implementation is discarded without review.
  * Validate that obsolete or conflicting code is documented before removal.

* [ ] Inspect the provided JSZip build.

  * Ensure that its browser exposure is understood.
  * Validate that it loads before the module entry point.
  * Validate that ZIP code accesses it through one adapter.

* [ ] Confirm the supported browser scope.

  * Ensure that the implementation does not include unsupported legacy compatibility code.
  * Validate that browser-dependent behavior is documented.

* [ ] Create or update the application file structure.

  * Ensure that modules are organized by domain and UI responsibility.
  * Validate that generic miscellaneous modules do not accumulate unrelated behavior.

* [ ] Establish progress reporting.

  * Ensure that `.progress/implementation001.md` exists or the next valid incremental file is created.
  * Validate that the report records decisions, work, checks, failures, and evidence.

---

AU00 Application Shell TODO

---

* [ ] Implement the full-viewport application shell.

  * Ensure that the header, main workspace, and status bar occupy the intended regions.
  * Validate that the browser page does not scroll unexpectedly.

* [ ] Implement the three-column desktop layout.

  * Ensure that the left tools panel, central workspace, and right contextual panel have independent layout behavior.
  * Validate the layout at 1920, 1600, 1440, and 1280 pixel widths.

* [ ] Implement independent panel scrolling.

  * Ensure that the left and right panels scroll vertically.
  * Ensure that the sprite strip scrolls horizontally.
  * Validate that panel scroll positions do not reset on ordinary state changes.

* [ ] Implement the dark application header.

  * Ensure that the title, application logo, tabs, and toolbar align consistently.
  * Validate visual spacing and focus states.

* [ ] Implement the status bar.

  * Ensure that status, zoom, selection, image dimensions, and export state can be displayed.
  * Validate that status updates do not cause layout instability.

---

AV00 Mode Tabs TODO

---

* [ ] Implement Grid Creator and Atlas Slicer tabs.

  * Ensure that both tabs have text labels.
  * Validate active, hover, focus, and inactive states.

* [ ] Implement mode switching without page reload.

  * Ensure that shared grid configuration remains coherent.
  * Validate that mode-specific viewport state is preserved.

* [ ] Implement tab keyboard behavior.

  * Ensure that Arrow, Home, End, Enter, and Space behavior follows tab semantics.
  * Validate tab ARIA roles and selected state.

* [ ] Log mode changes.

  * Ensure that previous mode, next mode, and interaction source are logged.
  * Validate the structured event record.

---

AW00 Visual System and Icons TODO

---

* [ ] Define CSS design tokens.

  * Ensure that spacing, control heights, borders, radii, colors, typography, and icon sizes use a coherent system.
  * Validate that repeated conceptual values are not scattered as arbitrary literals.

* [ ] Create the SVG icon family.

  * Ensure that icons share viewBox, stroke style, line caps, optical size, and color behavior.
  * Validate every icon at actual rendered sizes.

* [ ] Create the application logo.

  * Ensure that it remains recognizable at 16, 20, 24, and 32 pixels.
  * Validate that it does not contain embedded text.

* [ ] Implement accessible icon usage.

  * Ensure that decorative icons are hidden from assistive technology.
  * Validate that icon-only controls have explicit accessible labels.

* [ ] Create an icon review sheet or equivalent comparison view.

  * Ensure that inconsistent stroke weight or optical size can be detected.
  * Validate the complete icon family before final acceptance.

---

AX00 Toolbar and Button TODO

---

* [ ] Implement Open Image.

  * Ensure that it uses a browser file input.
  * Validate success, cancellation, unsupported file, and decode failure.

* [ ] Implement Reload.

  * Ensure that it reuses the in-session File object.
  * Validate disabled behavior when no file is available.

* [ ] Implement Fit.

  * Ensure that the entire image is centered and visible.
  * Validate that source and export geometry remain unchanged.

* [ ] Implement 100, 200, and 400 percent zoom presets.

  * Ensure that each preset produces the exact intended display scale.
  * Validate selected-state appearance.

* [ ] Implement Show Grid.

  * Ensure that it toggles only the overlay.
  * Validate `aria-pressed` and unchanged slice geometry.

* [ ] Implement Download ZIP.

  * Ensure that it is visually primary.
  * Validate disabled, busy, success, and failure states.

* [ ] Validate button grouping.

  * Ensure that file, viewport, overlay, and export actions are visually separated.
  * Validate consistent heights, icon sizes, text alignment, and group spacing.

---

AY00 Central State TODO

---

* [ ] Implement one authoritative application state.

  * Ensure that controls, renderers, summaries, recommendations, and exports read from the same state.
  * Validate that no component queries another component's DOM for data.

* [ ] Implement state revisions.

  * Ensure that important commits increment a monotonically increasing revision.
  * Validate stale asynchronous-result detection.

* [ ] Implement transactional updates.

  * Ensure that one user action produces one coherent state transition.
  * Validate that dependent controls do not temporarily disagree.

* [ ] Separate persistent, session, and derived state.

  * Ensure that source image bytes and transient resources are not persisted.
  * Validate preset and URL payloads.

---

AZ00 Grid Domain TODO

---

* [ ] Implement pure axis-layout calculations.

  * Ensure that borders, separators, cells, origins, counts, remainders, overflow, and partial cells are represented explicitly.
  * Validate mandatory numerical examples.

* [ ] Implement complete-cell enumeration.

  * Ensure that every rectangle uses half-open zero-based coordinates.
  * Validate first, middle, and final cells.

* [ ] Implement partial-cell enumeration.

  * Ensure that right, bottom, and bottom-right partial regions are calculated correctly.
  * Validate crop and padding policies.

* [ ] Implement fixed-count calculations.

  * Ensure that required dimensions and overflow are correct.
  * Validate recommendation inputs.

* [ ] Implement one shared rectangle API.

  * Ensure that preview, selection, sprite strip, manifest, and export use it.
  * Validate that no duplicate formula exists elsewhere.

* [ ] Add calculation assertions or tests.

  * Ensure that known examples produce exact results.
  * Validate that off-by-one defects are detected.

---

BA00 Grid Creator UI TODO

---

* [ ] Implement Canvas controls.

  * Ensure that width and height use positive integer values.
  * Validate invalid and temporary edit states.

* [ ] Implement Grid Geometry controls.

  * Ensure that cell dimensions, count modes, rows, and columns synchronize correctly.
  * Validate automatic and fixed-count behavior.

* [ ] Implement Borders and Separators controls.

  * Ensure that dimensions affect both rendering and calculation.
  * Validate the explanatory diagram.

* [ ] Implement Appearance controls.

  * Ensure that line color, opacity, style, and dimensions update the preview.
  * Validate exact exported pixels.

* [ ] Implement Background controls.

  * Ensure that transparent and solid modes behave correctly.
  * Validate alpha preservation.

* [ ] Implement Grid Creator recommendations.

  * Ensure that the primary recommendation appears in the right panel.
  * Validate Apply behavior and resulting calculations.

* [ ] Implement Grid Creator PNG export.

  * Ensure exact configured canvas dimensions.
  * Validate transparent and solid output.

---

BB00 Atlas Source Image TODO

---

* [ ] Implement image selection and decode.

  * Ensure that supported files load locally.
  * Validate metadata display and central rendering.

* [ ] Implement safe image replacement.

  * Ensure that the previous valid image remains when replacement fails.
  * Validate stale-request rejection.

* [ ] Implement image resource cleanup.

  * Ensure that object URLs, image bitmaps, previews, and obsolete cache entries are released.
  * Validate repeated replacement for memory growth.

* [ ] Implement Clear Image.

  * Ensure that grid configuration is preserved.
  * Validate that selection and export availability reset.

* [ ] Implement image-load logging.

  * Ensure start, completion, failure, and superseded events use transaction IDs.
  * Validate reproduction-relevant fields.

---

BC00 Atlas Viewport TODO

---

* [ ] Implement layered source, grid, and selection rendering.

  * Ensure that overlays do not modify source pixels.
  * Validate independent redraw behavior.

* [ ] Implement wheel zoom around the pointer.

  * Ensure that the source coordinate beneath the pointer remains stable.
  * Validate coalesced logs.

* [ ] Implement middle-mouse pan.

  * Ensure correct pointer capture and release.
  * Validate completed and cancelled gesture behavior.

* [ ] Implement Space plus primary-button pan.

  * Ensure that selection does not activate during the pan.
  * Validate keyboard and pointer interaction.

* [ ] Implement crisp pixel rendering.

  * Ensure that image smoothing is disabled where required.
  * Validate 100, 200, and 400 percent display.

* [ ] Implement viewport reset and fit behavior.

  * Ensure deterministic centering.
  * Validate mode-specific viewport restoration.

---

BD00 Atlas Selection TODO

---

* [ ] Implement pointer cell selection.

  * Ensure that selected row, column, index, and rectangle are exact.
  * Validate separator clicks.

* [ ] Implement keyboard selection navigation.

  * Ensure correct movement at boundaries.
  * Validate excluded-cell skipping.

* [ ] Implement selected-cell overlay.

  * Ensure exact alignment at all zoom levels.
  * Validate selection persistence during pan and zoom.

* [ ] Implement selection revalidation.

  * Ensure predictable nearest-cell recovery or clearing.
  * Validate geometry changes that invalidate selection.

* [ ] Implement selected-cell logging.

  * Ensure that row, column, index, source coordinates, dimensions, and input method are captured.
  * Validate structured records.

---

BE00 Selected Cell Panel TODO

---

* [ ] Implement selected-cell metadata.

  * Ensure that displayed values match the domain rectangle.
  * Validate row, column, index, x, y, width, and height.

* [ ] Implement selected-cell preview.

  * Ensure nearest-neighbor scaling and centered display.
  * Validate transparent checkerboard behavior.

* [ ] Implement Download Cell PNG.

  * Ensure that exported source pixels match the selected rectangle.
  * Validate complete and partial-cell behavior.

* [ ] Implement empty selection state.

  * Ensure that guidance is visible without changing panel height excessively.
  * Validate keyboard and screen-reader access.

---

BF00 Sprite Preview Strip TODO

---

* [ ] Implement traversal-ordered sprite data.

  * Ensure that row-major and column-major order are correct.
  * Validate selected index changes without physical selection changes.

* [ ] Implement thumbnail rendering.

  * Ensure centered nearest-neighbor previews.
  * Validate transparent checkerboard display.

* [ ] Implement thumbnail selection.

  * Ensure that clicking a thumbnail selects the atlas cell.
  * Validate synchronization with the right panel and overlay.

* [ ] Implement Previous and Next.

  * Ensure one-item navigation.
  * Validate boundary behavior.

* [ ] Implement keyboard and page navigation.

  * Ensure Home, End, Page Up, and Page Down behavior.
  * Validate focus management.

* [ ] Implement selected-item reveal and centering.

  * Ensure that off-screen selections become visible.
  * Validate that already visible selections do not cause unnecessary movement.

* [ ] Implement lazy rendering or virtualization.

  * Ensure that large atlases do not create unbounded DOM nodes.
  * Validate bounded cache behavior.

---

BG00 Traversal and Incomplete Policy TODO

---

* [ ] Implement row-major traversal.

  * Ensure exact sequential ordering.
  * Validate naming and strip order.

* [ ] Implement column-major traversal.

  * Ensure exact sequential ordering.
  * Validate physical selection preservation.

* [ ] Implement right-edge policy.

  * Ensure that skip, crop, transparent pad, and solid pad work as specified.
  * Validate counts and export results.

* [ ] Implement bottom-edge policy.

  * Ensure independent behavior from the right edge.
  * Validate bottom-right partial cells.

* [ ] Implement incomplete-cell diagnostics.

  * Ensure that partial cells are reported without excessive alarm.
  * Validate warning and recommendation content.

---

BH00 Naming TODO

---

* [ ] Implement documented naming tokens.

  * Ensure that name, index, row, column, x, y, width, and height resolve correctly.
  * Validate representative templates.

* [ ] Implement zero-padding.

  * Ensure that documented formatting examples match output.
  * Validate boundary values.

* [ ] Implement filename sanitization.

  * Ensure unsupported filesystem characters are replaced.
  * Validate control-character handling.

* [ ] Implement duplicate detection.

  * Ensure that every collision is detected before export.
  * Validate export blocking and error details.

* [ ] Implement selected filename preview.

  * Ensure that it updates with selection and template changes.
  * Validate empty-selection fallback.

---

BI00 ZIP Export TODO

---

* [ ] Implement the JSZip adapter.

  * Ensure that unavailable JSZip produces a clear controlled failure.
  * Validate no direct scattered global dependency access.

* [ ] Implement pre-export validation.

  * Ensure that image, geometry, filenames, policies, and counts are valid.
  * Validate that predictable failures block before encoding.

* [ ] Implement sequential sprite encoding.

  * Ensure that temporary canvas use remains bounded.
  * Validate exact sprite dimensions and pixels.

* [ ] Implement manifest generation.

  * Ensure that metadata matches actual export rectangles.
  * Validate schema version and traversal order.

* [ ] Implement ZIP structure.

  * Ensure that sprite files and manifest appear in expected locations.
  * Validate file count.

* [ ] Implement progress.

  * Ensure that long exports report stages and progress.
  * Validate that duplicate activation is disabled.

* [ ] Implement export cleanup.

  * Ensure temporary resources are released after completion and failure.
  * Validate retry behavior.

* [ ] Implement ZIP transaction logging.

  * Ensure that start, validation, progress, compression, completion, and failure events correlate.
  * Validate failing-sprite context.

---

BJ00 Preset TODO

---

* [ ] Implement namespaced storage keys.

  * Ensure no generic keys are used.
  * Validate stored document shape.

* [ ] Implement preset creation.

  * Ensure versioned descriptive configuration.
  * Validate save success and failure.

* [ ] Implement preset load.

  * Ensure migration and validation occur before state commit.
  * Validate current-state preservation on failure.

* [ ] Implement preset update, rename, duplicate, and delete.

  * Ensure each operation has predictable confirmation and status.
  * Validate logging.

* [ ] Implement modified-state tracking.

  * Ensure that edits do not silently overwrite named presets.
  * Validate switching behavior.

* [ ] Implement JSON import and export.

  * Ensure versioning, document type, migration, validation, and readable output.
  * Validate malformed and future-version files.

---

BK00 URL and Session TODO

---

* [ ] Implement session-state persistence.

  * Ensure that writes are debounced.
  * Validate restoration and corrupted-state recovery.

* [ ] Implement URL serialization.

  * Ensure that only supported configuration is included.
  * Validate version and encoding.

* [ ] Implement URL restoration.

  * Ensure startup precedence is correct.
  * Validate invalid payload recovery.

* [ ] Implement Copy Shareable URL.

  * Ensure copied state opens correctly in a fresh session.
  * Validate that source image bytes are absent.

* [ ] Implement URL logging.

  * Ensure only lengths, versions, counts, and safe summaries are recorded.
  * Validate that payload contents are not exposed.

---

BL00 Recommendations TODO

---

* [ ] Implement recommendation calculation as a pure derived service.

  * Ensure that recommendations do not mutate state.
  * Validate priority order.

* [ ] Implement one emphasized primary recommendation.

  * Ensure other options do not compete visually.
  * Validate stable right-panel layout.

* [ ] Implement Apply actions.

  * Ensure one coherent state transaction.
  * Validate updated controls, calculations, preview, summary, and logs.

* [ ] Implement severity presentation.

  * Ensure information, suggestion, warning, and error are distinguishable without color alone.
  * Validate accessibility.

---

BM00 Logging System TODO

---

* [ ] Implement the structured logger.

  * Ensure application identifier, level, area, event, message, timestamp, and fields.
  * Validate plain and styled output.

* [ ] Implement restrained console styling.

  * Ensure values use the approved subtle color treatment.
  * Validate fallback without color support.

* [ ] Implement field snapshotting.

  * Ensure live-object mutation cannot change past records.
  * Validate selected-field serialization.

* [ ] Implement error normalization.

  * Ensure Error and non-Error values produce stable structures.
  * Validate optional stack capture.

* [ ] Implement transaction support.

  * Ensure start and exactly one terminal event.
  * Validate duration and shared transaction identifier.

* [ ] Implement a bounded diagnostic buffer.

  * Ensure oldest records are removed at capacity.
  * Validate that no large browser objects are retained.

* [ ] Implement diagnostic JSON export.

  * Ensure useful environment and reproduction state are included.
  * Validate that source pixels and sensitive values are excluded.

* [ ] Implement global unexpected-error handlers.

  * Ensure recent context and recovery state are logged.
  * Validate that expected operational errors remain locally handled.

* [ ] Implement log-volume control.

  * Ensure high-frequency events are coalesced, rate-limited, or level-restricted.
  * Validate pan, wheel, render, and progress behavior.

---

BN00 Accessibility TODO

---

* [ ] Label every form control.

  * Ensure visible and programmatic labels agree.
  * Validate using accessibility inspection.

* [ ] Implement visible focus.

  * Ensure all controls and composite regions show focus.
  * Validate no clipping.

* [ ] Implement tab semantics.

  * Ensure correct roles, selected state, and keyboard operation.
  * Validate screen-reader representation.

* [ ] Implement accordion semantics.

  * Ensure headers expose expanded state and associated regions.
  * Validate keyboard activation.

* [ ] Implement canvas textual equivalents.

  * Ensure selected-cell and grid summaries expose important data.
  * Validate operation without visual canvas interpretation.

* [ ] Implement accessible status behavior.

  * Ensure important failures are announced.
  * Validate that continuous updates are not excessively announced.

---

BO00 Performance and Resource TODO

---

* [ ] Measure representative workflows.

  * Ensure measurements cover supported image sizes and cell counts.
  * Validate that optimizations address observed costs.

* [ ] Prevent unnecessary full-image redraw.

  * Ensure overlay-only changes redraw overlays.
  * Validate render logs or measurements.

* [ ] Bound thumbnail resources.

  * Ensure virtualization and cache limits.
  * Validate large atlas navigation.

* [ ] Release object URLs and image resources.

  * Ensure replacement and clearing perform cleanup.
  * Validate repeated-image memory behavior.

* [ ] Bound logging resources.

  * Ensure diagnostic buffers do not grow indefinitely.
  * Validate record capacity.

* [ ] Bound export resources.

  * Ensure temporary canvases and blobs are released.
  * Validate successful and failed export paths.

---

BP00 Error and Recovery TODO

---

* [ ] Implement localized validation errors.

  * Ensure invalid fields explain the expected value.
  * Validate restoration of the last valid value.

* [ ] Implement image decode recovery.

  * Ensure previous valid image is preserved.
  * Validate error logs.

* [ ] Implement storage recovery.

  * Ensure defaults or in-memory state remain usable.
  * Validate corrupted and quota-failure scenarios.

* [ ] Implement export recovery.

  * Ensure incomplete archives are discarded.
  * Validate controls re-enable after failure.

* [ ] Implement stale-operation handling.

  * Ensure old decode, thumbnail, and render results are discarded safely.
  * Validate transaction and state-revision logs.

* [ ] Implement unexpected-error containment.

  * Ensure one subsystem failure does not unnecessarily destroy unrelated state.
  * Validate diagnostic context.

---

BQ00 Visual Verification TODO

---

* [ ] Capture Grid Creator default screenshot.

  * Ensure the layout matches the approved design direction.
  * Validate panel proportions, spacing, and toolbar grouping.

* [ ] Capture Atlas Slicer loaded-image screenshot.

  * Ensure the central atlas, selected cell, sprite strip, recommendations, and export summary are visible.
  * Validate visual correspondence to the approved concept.

* [ ] Capture warning-state screenshot.

  * Ensure warnings are visible without dominating the interface.
  * Validate no left-panel movement.

* [ ] Capture keyboard-focus screenshot.

  * Ensure focus rings are visible and consistent.
  * Validate that focus does not change element dimensions.

* [ ] Capture responsive screenshots.

  * Ensure the interface remains usable at required viewport sizes.
  * Validate panel collapse behavior.

* [ ] Review icons side by side.

  * Ensure coherent stroke, optical scale, and alignment.
  * Validate actual-size rendering.

---

BR00 Automated and Manual Test TODO

---

* [ ] Implement domain calculation checks.

  * Ensure mandatory geometry examples pass exactly.
  * Validate rectangle coordinates and counts.

* [ ] Implement logger checks.

  * Ensure structured records, snapshots, levels, transactions, buffer limits, and normalization.
  * Validate plain output.

* [ ] Implement export fixture checks.

  * Ensure extracted pixels and manifest rectangles match known source regions.
  * Validate ZIP contents.

* [ ] Execute primary Grid Creator manual scenario.

  * Ensure configuration, preview, recommendation, and PNG export work.
  * Validate logs and output.

* [ ] Execute primary Atlas Slicer manual scenario.

  * Ensure image load, grid, selection, preview strip, and ZIP export work.
  * Validate logs and output.

* [ ] Execute negative scenarios.

  * Ensure all required failures recover coherently.
  * Validate user-facing messages and logs.

* [ ] Execute keyboard-only workflow.

  * Ensure all primary actions are reachable.
  * Validate focus order and selection navigation.

---

BS00 Self-Review TODO

---

* [ ] Perform architecture review.

  * Ensure responsibility boundaries are coherent.
  * Validate no duplicated domain logic.

* [ ] Perform code-volume review.

  * Ensure every abstraction and branch has a purpose.
  * Validate removal of dead and speculative code.

* [ ] Perform naming review.

  * Ensure variables, functions, modules, and fields describe their meaning and units.
  * Validate that vague names are corrected.

* [ ] Perform lifecycle review.

  * Ensure event subscriptions, object URLs, images, canvases, blobs, timers, and animation frames have cleanup.
  * Validate destruction and replacement paths.

* [ ] Perform adversarial calculation review.

  * Ensure formulas are re-derived independently.
  * Validate mandatory numerical examples again.

* [ ] Perform accessibility review.

  * Ensure primary workflows work without a mouse.
  * Validate semantics.

* [ ] Perform logging review.

  * Ensure important user actions and failures are reconstructable.
  * Validate no sensitive or irrelevant dumps.

* [ ] Record review findings.

  * Ensure every identified major problem is fixed.
  * Validate corrections through regression checks.

---

BT00 Final Integrated Acceptance TODO

---

* [ ] Start from a fresh session.

  * Ensure defaults load correctly.
  * Validate initialization logs.

* [ ] Complete a Grid Creator workflow.

  * Ensure a transparent PNG is exported correctly.
  * Validate exact dimensions and pixels.

* [ ] Save and reload a preset.

  * Ensure the configuration is reproduced.
  * Validate storage and logs.

* [ ] Copy and reopen URL state.

  * Ensure supported configuration is reproduced.
  * Validate source image exclusion.

* [ ] Complete an Atlas Slicer workflow.

  * Ensure image load, selection, traversal, preview strip, and policies work.
  * Validate selected metadata.

* [ ] Download one selected cell.

  * Ensure exact source pixels.
  * Validate filename and transaction logs.

* [ ] Download a ZIP.

  * Ensure expected files and manifest.
  * Validate archive count, names, rectangles, and logs.

* [ ] Trigger a controlled warning.

  * Ensure contextual presentation and nonfatal behavior.
  * Validate warning logs.

* [ ] Trigger a controlled error.

  * Ensure recovery and useful diagnostics.
  * Validate transaction terminal failure.

* [ ] Export diagnostics.

  * Ensure logs and reproduction state are present.
  * Validate source image data is absent.

* [ ] Review the implementation against every specification.

  * Ensure no major requirement was omitted.
  * Validate that unresolved discrepancies are recorded.

---

BU00 Progress Report Completion TODO

---

* [ ] Record every major implementation chunk.

  * Ensure scope, files, decisions, checks, failures, and evidence are included.
  * Validate report accuracy against the repository.

* [ ] Record all significant decisions.

  * Ensure alternatives and validation are described.
  * Validate that decisions do not contradict explicit requirements.

* [ ] Record checklist reviews.

  * Ensure the beginning, middle, and final checklist readings are documented.
  * Validate that checklist changes are traceable.

* [ ] Record defects found during self-review.

  * Ensure severity, correction, and retest evidence are included.
  * Validate that no known major defect remains.

* [ ] Produce the implementation story.

  * Ensure the story explains architecture, behavior, validation, corrections, evidence, and limitations.
  * Validate that it does not overclaim.

---

BV00 Final Release Decision TODO

---

* [ ] Confirm all critical items pass.

  * Ensure that no correctness, data-loss, security, or unusable-workflow issue remains.
  * Validate through direct evidence.

* [ ] Confirm all major items pass.

  * Ensure that no important missing capability, inconsistent state, inaccessible workflow, or severe visual defect remains.
  * Validate through direct evidence.

* [ ] Confirm moderate issues are resolved or explicitly accepted.

  * Ensure that every remaining moderate issue has a reason and impact statement.
  * Validate that it does not conceal a major inconsistency.

* [ ] Confirm final reports are truthful.

  * Ensure that `implemented`, `verified`, `partially verified`, `not verified`, and `blocked` are used accurately.
  * Validate claims against test and artifact evidence.

* [ ] Declare final status.

  * Ensure the status is `Complete` only when the release conditions are met.
  * Validate that known limitations and unverified environments are listed.

---

BW00 Final Directive to Codex 4.6 Sol

---

Codex 4.6 Sol shall implement the Grid and Atlas Helper as a complete product rather than as a collection of disconnected examples.

It shall use the specifications to understand the intended user value, calculations, interface, quality standard, diagnostic behavior, and acceptance requirements.

It shall work in meaningful chunks.

It shall make careful decisions when details are ambiguous.

It shall use its best technical judgment on behalf of the user when a decision can be made responsibly.

It shall record important decisions.

It shall challenge its own assumptions.

It shall seek evidence rather than relying on confidence.

It shall fix every critical and major inconsistency it discovers.

It shall broadly verify the complete integrated application after feature implementation.

It shall produce a detailed progress history, implementation story, acceptance checklist, and proof of validation.

The implementation is complete only when the application works, the outputs are correct, the interface is coherent, the code is maintainable, failures are diagnosable, and the acceptance evidence demonstrates those conclusions.
