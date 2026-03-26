A00. Codex implementation memo revision 00

A01. Document purpose revision 00

This memo is addressed to OpenAI Codex as the implementation agent for this project. It supplements, but does not replace, the main product specification revision 02 and the UX/UI decision specification revision 00. Codex will have access to those documents. This memo exists to align implementation behavior, execution priorities, validation discipline, and decision-making authority during delivery of the project.

This is a greenfield implementation. The objective is to produce working, high-quality software that faithfully implements the specifications while using sound engineering judgment where the specifications leave room for interpretation or where implementation realities require minor resolution decisions.

A02. Project summary revision 00

The product is a browser-based, dependency-light vector image editor for fast practical editing of screenshots and similar images. It is a desktop-oriented static web application built with vanilla HTML, modern CSS, and modern JavaScript. No third-party runtime dependencies are allowed, except that the project owner may provide a browser-side persistence library for IndexedDB usage. That provided library may be used as part of the implementation.

The editor is intentionally narrow in scope. It is not a full illustration suite and not a photo editor. Its purpose is to make high-frequency lightweight edits fast, clear, and trustworthy. The primary user workflows are screenshot annotation, comparison composition, image overlay composition, reopen-and-revise of prior editor SVG files, and recovery after accidental refresh.

The canonical document format is SVG with editor metadata embedded in the SVG. The application supports raster images as embedded objects inside the SVG document. The application must persist working drafts in browser storage suitable for larger payloads, primarily IndexedDB-class persistence, not localStorage as the primary draft store.

A03. Primary implementation goal revision 00

The primary goal is not merely to write code that appears to satisfy isolated requirements. The primary goal is to deliver a coherent, reliable, implementation-complete product that behaves correctly across the defined user workflows and holds together as a system.

Codex must optimize for the following:
correctness against the specifications;
coherence between modules and interaction flows;
strong implementation completeness;
good code structure;
testability;
safe handling of edge cases;
multi-pass validation and refactoring after the first "working" version exists.

A04. Authority and interpretation rule revision 00

Codex must treat the main product specification revision 02 as the primary binding source of truth, and the UX/UI decision specification revision 00 as the binding source of truth for layout, interaction model, and UX rationale.

This memo is tertiary guidance. It is binding only where it clarifies implementation conduct, validation discipline, or practical delivery expectations.

If Codex encounters ambiguity, omission, minor contradiction, or implementation friction between requirements, Codex is explicitly authorized to use its best judgment to resolve the issue in the way that best preserves the product's stated purpose: fast, reliable, high-quality screenshot-centric editing with a coherent professional UX.

When resolving ambiguity, Codex must prefer, in order:
correctness and product integrity;
user trust and predictability;
workflow speed for common tasks;
architectural simplicity;
future extensibility.

A05. What matters most revision 00

The most important outcomes are these.

The application must work end to end for the core workflows.

The UI must feel coherent, fast, and stable.

SVG export and reopen must work reliably for editor-generated SVG.

Draft persistence must be real, not nominal. It must remain useful for ordinary screenshot-heavy documents within the declared envelope.

Selection, text editing, and export are high-risk areas and require extra care.

The codebase must remain modular and maintainable rather than collapsing into ad hoc DOM scripting.

B00. Expected product behavior summary revision 00

B01. Core product behavior revision 00

Codex must deliver a desktop-oriented browser app with:
a top toolbar for document actions, import/open, export/copy, zoom, and draft status;
a left tool rail for Select, Text, Rectangle, Ellipse, and Line;
a central canvas viewport as the dominant editing surface;
a right contextual inspector for selected-object properties and document-level settings when nothing is selected.

The editing model is hybrid. Direct manipulation on the canvas is primary. The inspector is secondary and used for precision refinement.

The editor must support:
new document;
open supported editor SVG from disk;
insert raster image files;
insert and edit text;
insert rectangle, ellipse, and line objects;
move, resize, delete, and reorder objects;
pan and zoom;
export SVG, PNG, and JPEG;
copy PNG to clipboard if browser support is available;
autosave and recovery of working drafts.

B02. Canonical data model summary revision 00

The canonical editable representation is SVG with editor metadata. Objects include image, text, rectangle, ellipse, and line. The document includes canvas size and background behavior. Objects have stable ids, geometry, style, and z-order. The application must be able to serialize to editor SVG and reconstruct from editor SVG.

Working-draft persistence stores wrapper metadata plus the SVG snapshot. The wrapper must include version, saveSequence, savedAt, documentOrigin, and the serialized SVG. The wrapper may include viewport state and recovery metadata.

B03. Non-goals summary revision 00

Codex must not drift into out-of-scope functionality. In particular, revision 00 must not add freehand drawing, path editing, cropping, masking, filters, grouping, rotation, undo/redo, arbitrary SVG editable import, collaboration, touch-first UI, or advanced typography.

If Codex sees an attractive enhancement, it must not implement it unless it is necessary for correctness, testing, or infrastructure.

C00. Implementation stance revision 00

C01. Greenfield expectations revision 00

This is a greenfield project. Codex is expected to establish a sound project structure from the beginning rather than writing a quick prototype and trying to retrofit architecture later.

Codex may add project scaffolding, internal tools, helper utilities, testing setup, linting, formatting, or validation scripts if they materially improve delivery quality and remain aligned with the project's constraints.

C02. Allowed engineering freedom revision 00

Codex is explicitly allowed to:
choose module boundaries and file organization;
choose the exact internal state management approach;
choose the exact DOM and SVG rendering organization;
use the provided IndexedDB library;
add tests;
add small internal helper libraries;
add build or dev tooling if needed, provided runtime remains dependency-light and aligned with project constraints;
refactor aggressively if earlier implementation decisions become weak or obsolete.

C03. Constraint on freedom revision 00

This freedom does not extend to changing the product's scope, weakening required guarantees, or replacing the defined UX model with a materially different one. Freedom is granted to resolve implementation detail and improve delivery quality, not to redesign the product.

D00. Suggested implementation order revision 00

D01. General sequencing rule revision 00

The order below is recommended, not absolute. Codex may reorder work if doing so produces a better implementation path. If Codex departs materially from the recommended order, it should do so only for sound engineering reasons.

D02. Recommended build sequence revision 00

Recommended order is as follows.

First, establish project skeleton, tooling, module layout, and development workflow.

Second, implement core document schema, object factories, stable ids, validation primitives, and mutation commands.

Third, implement SVG serialization and parsing for editor-generated SVG, including metadata handling.

Fourth, implement the persistence layer using the provided IndexedDB library, including draft wrapper schema, saveSequence handling, retention, validation, and recovery.

Fifth, implement viewport math and coordinate conversion.

Sixth, implement the rendering layer for canvas content and non-exported overlays.

Seventh, implement selection, hit-testing, and manipulation infrastructure.

Eighth, implement top-level document lifecycle actions: New Document, Open Document, Insert Image.

Ninth, implement object creation flows for text, rectangle, ellipse, and line.

Tenth, implement movement, resizing, and layer controls.

Eleventh, implement text editing with anchored overlay input and commit-back to SVG state.

Twelfth, implement the right inspector and connect exact property edits.

Thirteenth, implement zoom, pan, and status indicators.

Fourteenth, implement export and copy flows with preflight checks.

Fifteenth, implement failure handling, notifications, and degraded-state behavior.

Sixteenth, perform broad integration cleanup and UX consistency passes.

Seventeenth, execute dedicated multi-round review, refactor, and validation loops.

D03. Why this order is recommended revision 00

This order starts with the model, persistence, and serialization because they determine whether the product is structurally correct. It then moves into rendering and interaction, then document lifecycle, then editing tools, then export and refinement.

This sequence reduces the chance of building fragile UI behavior on top of unstable document foundations. It also reduces waste because many later flows depend on the correctness of the data model, persistence, and SVG round-trip behavior.

E00. Architecture guidance for Codex revision 00

E01. Required structural direction revision 00

Codex should keep the implementation modular with clear separation between:
document model and validation;
document mutation commands;
SVG serialization and parsing;
persistence and recovery;
viewport and coordinate math;
rendering;
interaction handling;
UI construction;
export;
notifications.

E02. Strong warning against code drift revision 00

Codex must not allow business rules to leak into random UI event handlers. That is one of the most common failure modes in projects like this. Geometry rules, persistence rules, hit-testing rules, export limits, and text normalization rules must live in explicit modules.

E03. Internal helper guidance revision 00

If repeated DOM creation or SVG metadata handling becomes noisy, Codex should create small internal helper modules rather than duplicating patterns. The project should become clearer as it grows, not more repetitive.

E04. Persistence backend guidance revision 00

The project owner will provide a library for IndexedDB usage. Codex should integrate it behind a persistence module boundary. The rest of the editor should not depend directly on the library's API surface. This makes persistence behavior easier to test, refactor, and replace later if needed.

F00. High-risk areas requiring extra care revision 00

F01. Persistence and recovery revision 00

Codex must treat persistence as a product-defining feature, not a background detail. The persistence system must support retained snapshots, stale-write prevention, and clear UI save-state feedback. Draft persistence must remain honest. If the system becomes degraded, the user must be able to tell.

F02. SVG round-trip revision 00

Codex must treat SVG round-trip as a core correctness domain. Serialization and deserialization must be designed together. Editor metadata rules must remain stable and explicit. Codex must validate reopen behavior with fixtures, not only with ad hoc manual checks.

F03. Text editing revision 00

Codex must treat text as constrained and intentionally simple. Single-line text only. No wrapping. Line breaks normalized to spaces. Fixed system sans-serif stack. Anchored overlay editing. Stable commit-back. This area must not be allowed to grow informal complexity.

F04. Hit-testing and selection revision 00

Codex must ensure selection feels forgiving but deterministic. Thin lines, transparent shapes, text bounds, and covered-object cycling require deliberate implementation and testing. If selection is frustrating, the product will feel broken even if everything else is correct.

F05. Raster export revision 00

Codex must implement explicit preflight checks and must not rely on optimistic canvas allocation for large exports. Export failure must be specific where possible. SVG export must remain available even when raster export is blocked, assuming the document is valid.

G00. Codex decision-making rules revision 00

G01. If requirements conflict revision 00

If Codex finds a contradiction, it should resolve it by preferring the interpretation that best supports the core workflows and trust model. It should avoid introducing extra modes, hidden UI, or out-of-scope complexity to resolve such contradictions.

G02. If earlier code becomes invalid revision 00

If later implementation reveals that earlier code is redundant, contradictory, awkward, or structurally weak, Codex is expected to refactor it. Codex must not preserve obsolete code merely because it was written first.

G03. If a feature feels complete too early revision 00

Codex must assume that first-pass completeness is often misleading. A feature that "works once" is not done. Codex must revisit it after adjacent systems are integrated. Many regressions appear only after later code changes.

G04. If implementation convenience conflicts with UX intent revision 00

Codex must prefer the UX intent unless the UX requirement is impossible or materially unsafe. The product is specifically about friction reduction, so convenience for implementation is not enough reason to choose a weaker interaction model.

H00. Validation discipline revision 00

H01. Multi-pass validation requirement revision 00

Codex must perform multiple validation loops after the project first appears complete. This is mandatory.

Codex must conduct at least five explicit post-completion review and correction iterations over the codebase. These are not optional cleanup passes. They are part of the required delivery process.

H02. Purpose of the review loops revision 00

These review loops exist because software frequently reaches a false state of apparent completion. Earlier code may become invalid after later decisions. Edge cases may remain uncovered. Some modules may still reflect outdated assumptions. Some UI flows may remain inconsistent even though all individual features exist.

The purpose of these loops is to find and correct:
logic drift;
obsolete code paths;
broken assumptions after later integration;
missing edge-case handling;
duplicated logic;
weak module boundaries;
partial implementation of spec details;
regressions introduced by later work;
inefficient or fragile code that should be refactored.

H03. Required review-loop mindset revision 00

During the review loops, Codex must behave less like a feature builder and more like a critical reviewer. It must look for reasons the implementation is incomplete, inconsistent, or fragile. It must assume that some work remains even when the main flows seem to succeed.

H04. Minimum five-loop structure revision 00

The minimum recommended five review loops are:

Loop one: specification completeness review. Verify feature coverage against both specifications and this memo. Identify missing requirements and incomplete flows.

Loop two: architecture and code health review. Identify redundancy, misplaced logic, weak boundaries, and refactor opportunities.

Loop three: state and persistence review. Re-check autosave, recovery, stale write prevention, draft retention, replacement flows, and save-state feedback.

Loop four: interaction and UX review. Re-check layout coherence, selection feel, text editing behavior, covered-object access, inspector relevance, and top-level workflow speed.

Loop five: export and reopen review. Re-check SVG export, SVG reopen, raster export limits, copy behavior, and fixture-driven validation.

Codex may add more loops if needed. Five is the minimum, not the maximum.

I00. Testing expectations revision 00

I01. General testing rule revision 00

Codex is authorized and expected to add tests and validation tools needed to build confidence in the implementation. Tests are not optional if they materially improve correctness for core behaviors.

I02. Types of tests Codex should consider revision 00

Codex should use a mixture of:
unit tests for pure logic and validation modules;
integration tests for document lifecycle and persistence flows;
fixture-driven tests for SVG serialize and parse round-trip;
behavior tests for key editor flows where practical;
manual validation scripts or checklists where browser behavior requires human inspection.

I03. Must-test areas revision 00

At minimum, Codex should ensure there is strong validation coverage for:
document model validation;
object mutation commands;
SVG metadata read/write;
SVG round-trip fixtures;
persistence wrapper correctness;
saveSequence stale-write prevention;
draft retention and fallback restoration;
text normalization and text commit behavior;
selection hit-testing rules;
covered-object cycling;
canvas resize semantics;
Open Document validation behavior;
raster export preflight rules;
copy/export availability rules.

I04. Fixture expectations revision 00

Codex should implement and use fixture documents covering at least:
multiple embedded screenshots;
text objects with different sizes and colors;
transparent shapes;
thin lines;
covered-object selection scenarios;
out-of-bounds objects;
reopen of valid editor SVG;
rejection of invalid or non-editor SVG;
near-limit raster export;
near-envelope persistence scenarios.

J00. Acceptance checklist revision 00

J01. Product-level acceptance checklist revision 00

Codex should treat the following as the compact acceptance list for the delivered software.

The application launches as a coherent desktop editor.

The four-region layout is implemented correctly.

The top toolbar exposes New Document, Open Document, Insert Image, export actions, copy action if supported, zoom controls, and document/save status.

The left tool rail exposes Select, Text, Rectangle, Ellipse, and Line.

The right inspector is contextual and grouped.

The canvas is visually dominant and editable.

New Document works safely with confirmation.

Open Document accepts valid editor-generated SVG and rejects unsupported SVG safely.

Insert Image works for supported raster formats.

Images become editable embedded document objects.

Text insertion and editing work with the defined single-line rules.

Rectangle, ellipse, and line insertion work.

Objects can be selected, moved, resized, deleted, and layered.

Selection behavior matches the specified hit-testing semantics.

Covered-object selection cycling works.

Pan and zoom work reliably.

Canvas size can be changed with the specified semantics and warnings.

Draft persistence works through the IndexedDB-class backend.

Draft retention keeps multiple snapshots.

Recovery restores the most recent valid draft or falls back to older valid snapshots.

Save-state feedback is visible and meaningful.

SVG export produces valid editor SVG.

Editor SVG reopen reconstructs the document correctly within the defined round-trip limits.

PNG and JPEG export work within the specified envelope.

Raster export preflight blocks unsupported oversized exports.

Copy PNG works if supported and fails gracefully otherwise.

Error notices are visible and non-blocking.

The implementation remains modular and maintainable.

J02. UX-level acceptance checklist revision 00

Codex should also verify these UX outcomes.

The user can annotate a screenshot quickly without hunting for controls.

The user can compare two screenshots side by side quickly.

The user can overlay one image over another and correct layer order quickly.

The user can reopen a previous editor SVG without confusion.

The user can recover from accidental refresh and understand that the document is a recovered draft.

The editor feels calm, clear, and not overloaded.

Direct manipulation is the primary editing experience.

The inspector supports refinement without dominating the workflow.

Import/open and export/copy are visibly first-class actions.

K00. Suggested detailed to-do list revision 00

K01. Foundation to-do revision 00

Set up project structure and tooling.

Define module boundaries.

Implement document schema and defaults.

Implement object factories and id generation.

Implement validation primitives.

Implement mutation commands.

Implement viewport math.

K02. Format and persistence to-do revision 00

Implement SVG metadata conventions.

Implement SVG serializer.

Implement SVG parser for editor-generated SVG.

Integrate the provided IndexedDB library through a persistence module.

Implement working-draft wrapper schema.

Implement saveSequence logic.

Implement retained snapshot logic.

Implement restore logic with fallback to older valid snapshots.

Implement save-state feedback model.

K03. Rendering and interaction to-do revision 00

Implement SVG scene rendering.

Implement editor overlay rendering.

Implement selection state and selection visuals.

Implement hit-testing semantics.

Implement covered-object cycling.

Implement drag movement.

Implement resize behavior.

Implement layer reordering.

Implement pan and zoom.

K04. UI to-do revision 00

Implement top toolbar.

Implement left tool rail.

Implement right inspector.

Implement notifications.

Implement document status indicators.

Implement confirmation flows for replacement and canvas shrink.

K05. Content creation to-do revision 00

Implement Insert Image flow.

Implement Open Document flow.

Implement text insertion.

Implement anchored text editing overlay.

Implement shape creation flows.

Implement document-level canvas settings.

K06. Output to-do revision 00

Implement SVG export.

Implement raster export preflight.

Implement PNG export.

Implement JPEG export.

Implement Copy PNG if supported.

Implement blocked-export messaging.

K07. Validation to-do revision 00

Write unit tests for pure modules.

Write fixture-based round-trip tests.

Write persistence tests.

Write validation tests for open/import rejection and recovery fallback.

Write tests or scripts for export envelope handling.

Run manual UX verification against the main workflows.

K08. Refactor and review to-do revision 00

Perform at least five post-completion review loops.

Remove obsolete code.

Refactor weak module boundaries.

Re-check all acceptance items.

Re-run tests and manual validation after each major refactor.

L00. Practical operating instructions for Codex revision 00

L01. Build for the actual workflow revision 00

Codex should repeatedly ask, in effect, whether the current implementation makes it fast for the user to import, edit, and share. If a solution technically works but adds obvious friction, Codex should consider improving it.

L02. Prefer explicitness revision 00

Codex should prefer explicit logic, explicit module responsibilities, and explicit validation over clever but opaque shortcuts.

L03. Prefer removal over accumulation revision 00

When code becomes redundant or conceptually stale, Codex should remove or rewrite it rather than layering new behavior on top of it indefinitely.

L04. Keep the runtime simple revision 00

The delivered runtime application should remain straightforward and dependency-light. Codex may use tooling where useful, but the runtime must stay aligned with the project's constraints.

M00. Final instruction to Codex revision 00

M01. Delivery standard revision 00

The expected result is not a prototype and not a best-effort sketch. The expected result is a coherent, working, high-quality implementation of the specified product.

Codex is authorized to use its best judgment where necessary, to refactor aggressively when earlier code becomes weak, to add tests and internal tools, and to perform repeated review cycles until the implementation is truly aligned with the specifications.

M02. Final execution rule revision 00

If Codex must choose between finishing faster and finishing correctly, Codex must choose correctly. If Codex must choose between preserving earlier code and improving the final product, Codex must improve the final product. If Codex detects that "done" is only superficial, Codex must continue through the required review and validation loops until the implementation is actually sound.
