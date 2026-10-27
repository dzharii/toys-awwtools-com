2026-10-26

# File: `.specs/suggestions002-02-04-guided-ux-remediation.md`

# Guided Document Editor - Consolidated UX Remediation Change Request

Specification: `suggestions002-02-04`\
Revision: 00\
Status: Implementation change request\
Project: Guided Document Editor\
Source: `ux-audit.zip`, (D:\my-github\toys-awwtools-com\docs\public\2026-10-25-text-template-editor\temporary\ux-audit ) previous Guided UI Implementation Review, and `suggestions001-02`\
Related specifications: `suggestions001-01`, `suggestions001-02`, `suggestions002-02-01`, `suggestions002-02-02`, `suggestions002-02-03`\
Scope: Visual hierarchy, writing workflow, GTL source readability, contextual panels, Template Authoring, Settings, navigation, and accessibility\
Primary evidence: `ux-audit/consolidated-review.md`, `ux-audit/improvement-backlog.md`, `ux-audit/finding-evidence.md`

## A00. Purpose, authority, and implementation objectives

This change request consolidates two complementary evaluations of Guided's current implementation:

1. The earlier manual UX review, based on screenshots of the implemented docked-panel system, Settings controls, Blank note editing, document renaming, and text-size adjustments.
2. The subsequent automated visual UX audit, covering 12 appearance configurations, seven registered Page Objects, supplementary browser interactions, DOM measurements, and independent screenshot assessments.

The objective is to correct confirmed usability defects, improve the application's visual and interaction design, and verify unresolved concerns without unnecessarily replacing functionality that already works.

Primary objective: Guided must behave and appear as a coherent, writing-first application. Users should be able to understand their current task, begin editing quickly, read all meaningful information comfortably, and control supporting panels without unnecessary effort or interruption.

The implementation must prioritize user outcomes rather than treating the presence of requested controls as proof of completed UX work.

Required principles:

| Principle                | Implementation invariant                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| Writing-first            | Active document content takes priority over setup and navigation                          |
| Readability              | Meaningful text and syntax remain readable in every appearance configuration              |
| Contextual relevance     | Controls and guidance reflect the current task                                            |
| Space efficiency         | Panels and components use space proportionate to their purpose                            |
| Container responsiveness | Components adapt to their own available dimensions                                        |
| Discoverability          | Users can identify important operations without guessing                                  |
| Consistency              | Shared components follow common typography, spacing, and interaction rules                |
| Reversibility            | Non-destructive workspace changes remain reversible                                       |
| User preferences         | Deliberate placement, visibility, appearance, and text-size choices are preserved         |
| Data integrity           | UX changes do not alter GTL semantics or discard authored content                         |
| Accessibility            | Keyboard, focus, readable contrast, reflow, and alternative interactions remain supported |
| Verification             | Requirements are accepted through observable browser behavior                             |

Change-request authority:

This specification extends and refines `suggestions001-02`. It supersedes conflicting presentation requirements only where explicitly stated.

Original document independence, GTL parsing, live rendering, autosave, template versioning, authoring history, export, storage separation, and workspace persistence remain authoritative.

The implementing agent must use the existing architecture and inspect relevant application code before deciding where changes belong.

Do not introduce a new frontend framework, a second panel-management implementation, duplicated Settings state, or a separate renderer to implement these changes.

Important evidence distinction: Some previously identified issues were subsequently confirmed, some were refined by browser measurements, and others were not exercised by the new audit. Do not convert an unverified concern into a confirmed defect, or discard an earlier observed concern simply because the newer audit used a different application state.

## B00. Audit evidence, reconciliation, and remediation scope

### Automated audit coverage

The supplied archive contains the following evidence:

| Evidence                             | Result                                      |
| ------------------------------------ | ------------------------------------------- |
| Appearance configurations            | 12 of 12 completed                          |
| Registered Page Objects              | 7 per configuration                         |
| Primary screenshots                  | 84 of 84 captured                           |
| Successful supplementary screenshots | 18                                          |
| Primary capture/readiness failures   | 0                                           |
| Browser used                         | Chromium 145.0.7632.6                       |
| Standard viewport                    | 1440 × 1000 CSS pixels                      |
| Device pixel ratio                   | 1                                           |
| Narrow supplementary viewport        | 320 × 800, selected configurations          |
| Theme combinations                   | Dark and Light                              |
| Backgrounds                          | Plain charcoal, Quiet garden, Evening light |
| Visual density                       | Comfortable and Compact                     |

The twelve runs cover the following combinations:

| Runs    | Theme | Background     | Density               |
| ------- | ----- | -------------- | --------------------- |
| 001-002 | Dark  | Plain charcoal | Comfortable / Compact |
| 003-004 | Dark  | Quiet garden   | Comfortable / Compact |
| 005-006 | Dark  | Evening light  | Comfortable / Compact |
| 007-008 | Light | Plain charcoal | Comfortable / Compact |
| 009-010 | Light | Quiet garden   | Comfortable / Compact |
| 011-012 | Light | Evening light  | Comfortable / Compact |

The audit verified that its build snapshot and screenshot inventory were unchanged during collection. It did not implement any product fixes.

Evidence reliability:

The archive explicitly documents an image-rendering limitation affecting the initial reviews of runs 005-008. Their later independent supplementary reviews are authoritative. The correction repaired visual coverage but did not retroactively satisfy the original immediate-review timing requirement.

Use `ux-audit/review-integrity.md` and `ux-audit/review-records.json` when assessing provenance.

The 84 screenshots are 84 configuration/surface captures, not 84 independent usability experiments. Several registered Page Objects produce visually identical application states.

### Reconciled findings

The new audit's seven consolidated findings are retained as `UX-A01` through `UX-A07`.

Earlier manual-review findings are identified here as `UX-M01` through `UX-M12` to keep their evidence status separate.

| ID     | Priority     | Finding                                                                                   | Evidence status                                                    | Required disposition                            |
| ------ | ------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- |
| UX-A01 | P0           | Meaningful GTL punctuation has insufficient contrast                                      | Measured and verified                                              | Fix                                             |
| UX-A02 | P1           | Template/style setup dominates active composition                                         | Observed and geometrically verified                                | Fix                                             |
| UX-A03 | P1           | Neutral guidance obstructs content; active examples are initially clipped                 | Observed; scrolling and actions verified                           | Improve initial presentation                    |
| UX-A04 | P1           | GTL source and live preview are inefficiently separated                                   | Observed and geometrically verified                                | Improve authoring composition                   |
| UX-A05 | P2           | Secondary action labels are excessively small                                             | Observed and measured                                              | Improve readability                             |
| UX-A06 | P2           | Light theme displays misleading `Plain charcoal` background name                          | Observed                                                           | Fix wording                                     |
| UX-A07 | P2           | Draft display title and internal GTL name lack adequate differentiation                   | Observed; usability impact inferred                                | Clarify                                         |
| UX-M01 | P1           | Settings form becomes awkward in a narrow dock                                            | Previously observed; full Settings only in new audit               | Reproduce and correct                           |
| UX-M02 | P1           | Large Field editor mode emphasizes hints more than answer text                            | Previously observed; Large mode not retested                       | Reproduce and correct                           |
| UX-M03 | P1           | Single-field templates display unusable Previous/Next controls                            | Previously observed; new audit uses three fields                   | Reproduce and correct                           |
| UX-M04 | P1           | Blank note's empty word count displayed `1 words`                                         | Previously observed; new audit uses another template               | Reproduce and correct                           |
| UX-M05 | P1           | Panel commands and titles are excessively repetitive or difficult to scan                 | Both reviews identify related concerns                             | Consolidate without losing controls             |
| UX-M06 | P1           | Primary creation action is less discoverable while another dock tab is active             | Previously observed                                                | Verify and correct if reproduced                |
| UX-M07 | P2           | Save status, completion progress, and technical storage information compete for attention | Previously observed; current audit confirms states but not failure | Refine hierarchy                                |
| UX-M08 | P2           | Single/multiline answer editing space could be better adapted to expected content         | Previously observed; long input untested                           | Verify and improve where needed                 |
| UX-M09 | P2           | Template Preview controls appear detached from their cards                                | Both reviews                                                       | Improve association                             |
| UX-M10 | P2           | Global toolbar, panel tabs, and panel bodies repeat navigation information                | Both reviews                                                       | Simplify                                        |
| UX-M11 | Verification | Horizontal overflow, viewport responsiveness, and panel geometry                          | Earlier suspicion; 320px sampled reflow passed                     | Test broader states, fix demonstrated failures  |
| UX-M12 | Verification | Focus, panel recovery, data preservation, and other interaction guarantees                | Some targeted tests passed; others untested                        | Preserve passing behavior and complete coverage |

Priority classifications from the automated audit take precedence for its measured findings. Earlier observations remain actionable, but the current build must be checked before declaring that an older defect still exists.

### Conclusions corrected by the new audit

The following distinctions are binding and must guide implementation.

| Earlier concern or interpretation                        | New evidence                                                                           | Binding conclusion                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Horizontal overflow may affect the application generally | Sampled 320px page and main scroll regions measured 320px without overflow             | No proven global overflow defect; test specific dock/zoom arrangements            |
| Examples might be unavailable                            | Internal guidance scrolling and Use example succeeded                                  | The problem is initial visibility and discoverability, not missing functionality  |
| Panel recovery might be unreliable                       | Dock, collapse, restore, close, and reopen preserved a synthetic answer in both themes | Preserve working behavior; investigate untested interaction paths                 |
| Keyboard alternatives may be absent                      | Eight panel movement/resize commands were present in all configurations                | Commands exist; their operation and full keyboard usability require verification  |
| Tiny text proves undersized pointer targets              | Sampled Preview and panel controls exceeded 24 × 24 CSS pixels                         | Improve label readability; do not claim a target-size failure without measurement |
| Field input may lack focus or semantics                  | Native input focus and required semantics were verified                                | Preserve successful focus behavior                                                |
| Authoring source may lack keyboard focus                 | Native textarea focus, Tab, and Shift+Tab were verified                                | No established focus failure; clipping of focus outline remains a concern         |
| Draft title and GTL name are unnecessarily duplicated    | Separate identities are intentional                                                    | Clarify their purpose; do not merge them                                          |
| Download is wrongly more prominent than Save             | Autosave and always-available `.gtl` export justify the arrangement                    | Do not force a visual hierarchy change without stronger evidence                  |
| Background variants obstruct content                     | Garden and dusk remained restrained in the tested states                               | Preserve background options                                                       |

Source references:

`ux-audit/consolidated-review.md`\
`ux-audit/improvement-backlog.md`\
`ux-audit/verification.md`\
`ux-audit/measured-summary.json`\
`ux-audit/review-integrity.md`\
`ux-audit/finding-evidence.md`

All screenshot references below are relative to the `ux-audit` root inside the archive.

## C00. GTL source-editor contrast and readability

Requirement: UX-A01\
Priority: P0\
Affected area: Template Authoring source editor\
Evidence: Observed and measured in all twelve configurations

### Problem

The GTL source editor uses a syntax-highlight layer in which meaningful punctuation, including braces, directive colons, and structural delimiters, is rendered with insufficient contrast.

Measured results:

| Theme                          | Rendered delimiter foreground | Editor background             | Contrast       |
| ------------------------------ | ----------------------------- | ----------------------------- | -------------- |
| Dark                           | `rgba(43,42,40,0.55)`         | `rgb(25,27,29)`               | 1.101:1        |
| Light                          | `rgba(43,42,40,0.55)`         | `rgb(255,255,255)`            | 3.457:1        |
| Required normal-text threshold | Theme-aware                   | Effective rendered background | At least 4.5:1 |

The source font measured 12px in both themes and both density modes.

GTL punctuation is semantically important. The characters determine template structure and cannot be treated as optional decoration.

The Dark rendering makes several punctuation characters nearly invisible. Light renders them more distinctly, but its measured contrast remains below the normal-text threshold.

This is a source-code readability defect, not merely a preference about syntax colors.

Primary visual evidence:

`run-001/review/template-authoring.png`\
`run-005/review/template-authoring.png`\
`run-007/review/template-authoring.png`\
`run-012/review/template-authoring.png`

Measurements: `measured-summary.json` and `verification/measurements/run-001.json` through `run-012.json`.

### Required rendering contract

Every meaningful syntax class must use a theme-aware, contrast-safe palette.

| Source element                      | Required behavior                                     |
| ----------------------------------- | ----------------------------------------------------- |
| GTL directive names                 | Readable, distinguishable from ordinary values        |
| Directive colons                    | Contrast-safe, clearly visible                        |
| Placeholder identifiers             | Readable and recognizable                             |
| Interpolation braces and delimiters | Fully readable                                        |
| Ordinary source values              | Readable in both themes                               |
| Hint/example text                   | Readable without obscuring semantic differences       |
| Whitespace-sensitive punctuation    | Visible where it carries syntax                       |
| Error highlighting                  | Does not obscure source characters                    |
| Selection                           | Selected text remains readable                        |
| Focused editing                     | Caret, selection, and focus indicators remain visible |

Use palette variables or existing theme tokens rather than applying a fixed semitransparent dark foreground to both themes.

Do not solve the defect by changing the application's entire background palette.

The editor has an opaque local surface; the correction belongs primarily in its syntax-rendering layer.

Contrast validation: Calculate the effective foreground after alpha composition against the actual editor background. Validate the rendered syntax tokens, not merely the computed color of the transparent textarea.

Do not round a failing contrast measurement upward to claim compliance.

### Source editing implementation safeguards

The source editor uses a native textarea and a separate highlighting presentation. The change must preserve their alignment and native editing behavior.

| Concern          | Required invariant                               |
| ---------------- | ------------------------------------------------ |
| Source content   | Exact bytes and meaningful whitespace preserved  |
| Caret            | Correct text position                            |
| Selection        | Native selection preserved                       |
| Undo/redo        | Native editing history remains functional        |
| IME composition  | No interruption or duplication                   |
| Line wrapping    | Source and highlight layers remain aligned       |
| Font metrics     | Matching font family, size, line height, spacing |
| Scrolling        | Highlight and textarea remain synchronized       |
| Long lines       | No unintended visual misalignment                |
| Multiline source | Line breaks remain correctly represented         |
| Syntax updates   | No destructive textarea remount                  |
| Invalid GTL      | Remains editable, saveable, and downloadable     |

Source font size: Review the current 12px default and adopt a more comfortable starting size, approximately 14px, unless the actual design demonstrates an equivalently readable alternative. This is a product design requirement for this change request, not a claim that WCAG universally mandates a 14px minimum.

If changing the font size affects highlight alignment, fix both layers together.

Do not connect source font size to the existing Document text size or Field editor text size preferences. Those preferences have different ownership and intentionally leave GTL source unchanged.

### Acceptance criteria

| ID  | Verification                              | Pass condition                                                   |
| --- | ----------------------------------------- | ---------------------------------------------------------------- |
| C01 | Measure meaningful syntax tokens in Dark  | Contrast at least 4.5:1                                          |
| C02 | Measure meaningful syntax tokens in Light | Contrast at least 4.5:1                                          |
| C03 | Repeat across backgrounds/densities       | No semantic token falls below the threshold                      |
| C04 | Inspect actual punctuation                | Braces, colons, and delimiters visibly distinguishable           |
| C05 | Edit multiline GTL                        | Textarea/highlight alignment remains accurate                    |
| C06 | Select and replace source text            | Selection/caret behave normally                                  |
| C07 | Undo/redo and composition                 | No input loss or unexpected remount                              |
| C08 | Scroll long source                        | Highlight and text remain synchronized                           |
| C09 | Open invalid GTL                          | Source remains readable and editable                             |
| C10 | Check focus treatment                     | Focus indication remains visible and unclipped where practicable |

The agent must measure all meaningful syntax classes, not only the specific sampled punctuation color.

## D00. Active document priority, template discovery, and workspace hierarchy

Requirements: UX-A02, UX-M07, UX-M09\
Priority: P1\
Affected area: Document workspace and template catalog

### Problem

The automated audit repeatedly found that the initial editing experience gives too much space to template selection and writing-style setup relative to the actual document.

At 1440 × 1000, the audited Project description template contains only a short starter sentence, but the complete writing surface appears at or near the bottom of the viewport.

The Generated result is initially below the visible central scroll region.

Measured Comfortable layout:

| Element                      | Measured location                                |
| ---------------------------- | ------------------------------------------------ |
| Internal document viewport   | Approximately 936px high                         |
| Guided writing region begins | y = 954.61                                       |
| Generated result begins      | y = 1153.61                                      |
| First visible view           | Writing content partially below the initial fold |

Compact density brings more of the starter sentence into view, but does not resolve the persistent competition between setup and composition.

Evidence:

`run-001/review/document-workspace.png`\
`run-002/review/document-workspace.png`\
`run-007/review/document-workspace.png`\
`run-008/review/document-workspace.png`\
`verification.md` - Targeted browser outcomes

The earlier Blank note screenshots independently showed the same general problem: the full template gallery remained visible even after the user was actively editing an existing document.

### Required workflow states

Treat template discovery, writing-style selection, and active composition as distinct presentation states.

| State                                                | Main emphasis                 | Template gallery       | Writing-style choices                          |
| ---------------------------------------------------- | ----------------------------- | ---------------------- | ---------------------------------------------- |
| New Document, no template selected                   | Discover a template           | Expanded               | Not shown until applicable                     |
| Template selected, style not yet deliberately chosen | Choose appropriate structure  | Compact/available      | Prominent                                      |
| Style chosen, no answer entered                      | Guided text and field editing | Collapsed/available    | Compact; expandable                            |
| User begins entering answers                         | Current document              | Collapsed              | Compact                                        |
| Existing document reopened                           | Current document and result   | Collapsed              | Current style visible; alternatives accessible |
| User selects Change template                         | Template discovery            | Expanded intentionally | Context-dependent                              |
| User selects Change writing style                    | Structural alternatives       | Remains available      | Expanded intentionally                         |

Style-selection preservation: The original specification requires prominent, informative choices for templates with two to six versions. This remains mandatory during deliberate style selection.

Do not permanently remove or hide the five Project description styles.

Instead, change their presentation after the user has completed the selection activity.

Expansion rule: Explicitly opening the template gallery or style chooser must not cause it to collapse unexpectedly while the user is inspecting alternatives. Return to the compact editing presentation after an explicit selection or another clearly defined completion action.

Switching styles must preserve the original independent-document lifecycle. It must not share answers across versions or create saved documents merely because a preview received focus.

### Active document presentation

When a document is selected, its title becomes the primary heading.

| Current pattern                             | Required presentation                                    |
| ------------------------------------------- | -------------------------------------------------------- |
| Large generic `Documents` heading           | Active document title as primary heading                 |
| Smaller document title below gallery        | Document title near start of active workspace            |
| Breadcrumb repeats generic context          | Breadcrumb retains workspace/navigation context          |
| Full template gallery before writing        | Compact Change template entry point                      |
| Five style cards permanently displayed      | Compact current-style indicator with Change style action |
| Generated result separated by setup content | Generated result follows relevant writing surface        |

For the unselected New Document workspace, a prominent `New document` or `Documents` heading remains appropriate.

Document title actions: Rename and relevant lifecycle controls remain discoverable near the document identity. Moving the title must not interfere with stable document IDs, save state, or export filenames.

### Required document composition

The central workspace must visually communicate the following relationship:

```
Current document title
Save state · Word count
Current template / writing style   [Change]

Template fields                    Completion status

[Guided document with editable placeholders]

Generated result
[Rendered output]

Copy / Export
```

This is a logical content hierarchy. It does not prescribe exact component boundaries or prohibit contextual controls.

Initial viewport objective: At 1440 × 1000, with the default navigation arrangement and either density, a short starter document should show its complete guided sentence and a clear, immediate route to its Generated result/actions without requiring the user to traverse the full catalog.

The result itself may require scrolling for long documents.

Do not force every long document into a single screen or shrink text to meet a viewport target.

Scroll continuity: Collapsing discovery or changing style presentation must preserve the active field and a meaningful reading position. If the user has begun typing, the interface must not jump to an unrelated position.

### Template-card interaction

The audit found useful, recognizable template cards, with selection indicated through an accessible selection treatment. Preserve this.

Improve the visual association between each card and its Preview operation.

| Element           | Required behavior                        |
| ----------------- | ---------------------------------------- |
| Template title    | Identifies the template                  |
| Description       | Concise explanation                      |
| Primary selection | Clearly distinguishable from preview     |
| Preview action    | Visually associated with the same card   |
| Selected state    | Border/indicator and semantic state      |
| Keyboard focus    | Distinct from selection                  |
| Hover             | Does not silently commit selection       |
| Preview           | Does not modify current working document |

The measured Preview target is approximately 253 × 30 CSS pixels despite its 10px label.

The required improvement is principally readability and visual association, not inventing a pointer-target failure that the audit did not find.

A card footer or another consistent secondary-action region is appropriate.

### Acceptance criteria

| ID  | Scenario                                    | Required outcome                                             |
| --- | ------------------------------------------- | ------------------------------------------------------------ |
| D01 | Open New Document                           | Template discovery is prominent                              |
| D02 | Select Project description                  | Appropriate style choices appear                             |
| D03 | Select one of five styles                   | Current style becomes compact but discoverable               |
| D04 | Begin editing                               | Guided content receives primary space                        |
| D05 | Open an existing document                   | Full gallery is not permanently expanded                     |
| D06 | Activate Change template                    | Catalog opens deliberately                                   |
| D07 | Preview another template/style              | Current document remains unchanged                           |
| D08 | Switch to existing related style            | Correct independent document restored                        |
| D09 | Test Comfortable and Compact at 1440 × 1000 | Starter sentence and result entry are readily accessible     |
| D10 | Expand/collapse setup during editing        | Answer, focus context, and scroll position remain coherent   |
| D11 | Inspect selected template cards             | Selected, hovered, and focused states remain distinguishable |

## E00. Contextual Field editor, floating panels, and editing continuity

Requirements: UX-A03, UX-M02, UX-M03, UX-M05, UX-M08, UX-M10\
Priority: P1\
Affected area: Field editor, panel shell, and contextual guidance

### Problem

The audit reveals two distinct problems with the initial floating Field editor.

First, the explicitly opened neutral panel occupies a large, mostly empty rectangle while overlapping template cards and writing-style choices.

Second, after selecting an active field, the editor displays the question, hint, input, and navigation, but its first example is cut off near the bottom of the floating window.

These are presentation and discoverability problems, not evidence that the example or its action is missing.

Measured and verified:

| Property                             | Audit result                                |
| ------------------------------------ | ------------------------------------------- |
| Initial floating panel               | Approximately 360 × 560 CSS pixels          |
| Neutral-panel obstruction            | Overlaps right-side catalog/style content   |
| Active guidance content              | Scroll height 767px; client height 514px    |
| Example action                       | Reachable after scrolling                   |
| Example Use action                   | Verified working                            |
| Panel dock/collapse/restore          | Verified in targeted scenarios              |
| Close/reopen                         | Verified in targeted scenarios              |
| Answer preservation through recovery | Verified for a synthetic single-line answer |

Evidence:

`run-001/review/workspace-panels.png`\
`run-001/review/field-editor.png`\
`run-007/review/workspace-panels.png`\
`run-007/review/field-editor.png`\
`verification/attempt-002/`\
`verification.md`

### Context-dependent panel presentation

The Field editor should use different content allocation for neutral and active states.

| State                              | Required presentation                    |
| ---------------------------------- | ---------------------------------------- |
| Opened without active field        | Compact explanatory panel                |
| Opened by activating a placeholder | Full contextual editing presentation     |
| User begins typing                 | Answer remains primary                   |
| Examples exceed available space    | Clear continuation/scroll affordance     |
| User explicitly resizes panel      | Preserve deliberate dimensions           |
| User docks panel                   | Content adapts to dock width/height      |
| User collapses panel               | Previous editing context retained        |
| User restores panel                | Previous valid context/geometry restored |
| User changes document              | Stale field references cleared           |

Neutral state: Do not automatically allocate the same large initial dimensions needed for active editing when the panel contains only `Select a field to edit`.

Choose a smaller content-appropriate presentation where no deliberate prior geometry exists.

The neutral panel must not unnecessarily obscure the application's primary template and style controls.

Do not close the panel automatically merely because its state is empty. A user who deliberately opened it retains control.

Active state: When a placeholder is selected, allocate enough space to make the question, answer, and availability of examples understandable.

Use content-aware initial sizing or a clear scroll/continuation cue.

The panel does not need to show every example simultaneously, but users must be able to discover that additional help exists.

### Geometry and placement

| Situation                                      | Required behavior                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| First activation, no prior deliberate geometry | Place near selected field while minimizing obstruction              |
| Explicit neutral opening                       | Avoid unnecessary coverage of primary choices                       |
| Existing user-defined floating geometry        | Preserve                                                            |
| User resizes panel                             | Do not override dimensions with automatic content sizing            |
| Viewport becomes smaller                       | Constrain effective geometry safely                                 |
| Panel docks                                    | Reflow content according to actual dock width                       |
| Several panels coexist                         | Preserve independent control                                        |
| Panel content grows                            | Use internal scrolling without clipping essential recovery controls |

Do not force all Field editors to dock on the right. Floating is a deliberate feature and remains the specified default for first contextual activation.

Do not automatically relocate a previously positioned panel solely to improve screenshot composition.

Panel controls: Existing alternative commands for moving and resizing are present. Preserve them and verify actual operation rather than introducing redundant controls.

### Answer-first content hierarchy

The Field editor should follow this semantic arrangement:

```
$field                              [position if useful]

Question
Short contextual hint

Your answer
[Input or textarea]

Examples
[Example content]
[Copy example] [Use example]

Previous / Next (only when relevant)
```

The exact vertical order of examples and navigation may be adjusted to maintain predictable multi-field editing. The essential rule is that examples remain close to the answer and single-field templates do not waste space on meaningless navigation.

Repeated panel labels: The panel tab/header already identifies Field editor. Remove redundant inner `FIELD EDITOR` headings where they do not add context.

Keep the `$identifier` visible and associated with the selected inline placeholder and the answer control.

### Text-size behavior

The earlier screenshots showed a Large Field editor presentation in which the question and hint were much more prominent than the entered textarea text.

The automated audit measured a 14px native answer input in its Normal configuration. It did not measure the Large answer presentation.

This requirement therefore needs a current-build reproduction check, followed by correction if the behavior persists.

| Element              | Large-mode requirement                                |
| -------------------- | ----------------------------------------------------- |
| Field question       | Moderately enlarged                                   |
| Hint                 | Enlarged coherently but visually secondary            |
| Answer input text    | Clearly enlarged, approximately 25% over Normal       |
| Example text         | Enlarged coherently                                   |
| Identifier           | Compact, readable                                     |
| Panel title/controls | Stable UI scale; unnecessary enlargement not required |

The setting named `Field editor text size` must affect the text the user actually writes and edits.

Do not allow a long explanatory hint to become significantly more prominent than the answer control.

Long hints: Preserve helpful content but use concise visible guidance and optional expansion where appropriate. Do not hide essential constraints behind hover-only UI.

### Multiline editing

For multiline fields such as Blank note, the answer area should use a meaningful portion of the available panel height.

| Behavior             | Requirement                                       |
| -------------------- | ------------------------------------------------- |
| Initial textarea     | Comfortable for more than a single line           |
| Long content         | Scroll or expand without clipping                 |
| Resized Field editor | Answer may use additional available height        |
| Text-size change     | Text scales without resetting content             |
| Multiline Enter      | Preserves line breaks                             |
| Arrow navigation     | Native caret behavior within multiline input      |
| Selection/undo       | Preserved during relevant UI changes              |
| IME                  | Composition not interrupted                       |
| Generated result     | Immediate synchronization and line-break fidelity |

A fixed-height input should not remain unnecessarily small while its parent panel is enlarged.

An auto-growing input may be used up to a practical maximum, but it must not cause uncontrolled panel growth after the user deliberately selected panel geometry.

### Single-field navigation

The earlier Blank note screenshots displayed disabled Previous and Next controls although only `$body` existed.

Required presentation:

| Distinct field count | Navigation        |
| -------------------- | ----------------- |
| 0                    | Hide              |
| 1                    | Hide              |
| 2 or more            | Show              |
| First field          | Previous disabled |
| Last field           | Next disabled     |
| Intermediate field   | Both available    |

The `1 / 1` position label should also be omitted when it provides no useful orientation.

Repeated occurrences of the same variable count as one distinct editable field.

### Panel chrome and discoverability

The manual review also identified unnecessarily tiny and repetitive panel controls.

The new audit measured existing hit areas, including approximately 32 × 32 for Close, 41 × 32 for Actions, and 45 × 32 for Collapse.

These do not establish a violation of WCAG's minimum 24 × 24 target-size branch.

However, the 10px text and repeated labels remain weak visual affordances.

Required correction: Improve the readability and grouping of panel controls without weakening their hit areas or introducing another control row unnecessarily.

Keep dock/float, collapse, close, keyboard movement/resizing, and reset actions discoverable.

### Acceptance criteria

| ID  | Scenario                                 | Required outcome                                                |
| --- | ---------------------------------------- | --------------------------------------------------------------- |
| E01 | Open neutral guidance from Panels        | Compact, understandable, not needlessly obstructive             |
| E02 | Activate first field from clean document | Correct field, floating editor, immediate input focus           |
| E03 | Inspect examples at initial size         | First example/action visible or obvious continuation affordance |
| E04 | Scroll to later examples                 | All examples and actions reachable                              |
| E05 | Use example                              | Only current answer changes                                     |
| E06 | Dock/collapse/restore/close/reopen       | Answer and selected context retained                            |
| E07 | Deliberately move/resize panel           | User geometry preserved                                         |
| E08 | Change to Large text                     | Actual input text scales coherently                             |
| E09 | Open Blank note                          | No redundant one-field navigation                               |
| E10 | Enter long multiline answer              | Native editing and live rendering remain correct                |
| E11 | Resize panel while editing               | No input loss, caret disruption, or unexpected scroll jump      |
| E12 | Switch active fields/documents           | No stale field identity or value                                |
| E13 | Use panel command menu                   | Relevant actions recognizable and keyboard accessible           |

## F00. Template Authoring: source and preview working arrangement

Requirement: UX-A04\
Priority: P1\
Affected area: Template Authoring workspace

### Problem

The audited Template Authoring workspace uses a tall source editor, followed by Save/Download controls and a separate live-preview section.

The default source region is approximately 390px tall, even though the starter template contains only a small amount of source.

The actual rendered preview begins near or below the initial viewport boundary.

Users composing a template must frequently navigate vertically between the source they are editing and the output they are trying to evaluate.

This is a workflow-efficiency problem, not evidence that the preview does not exist.

Evidence:

`run-001/review/template-authoring.png`\
`run-007/review/template-authoring.png`\
`run-008/review/template-authoring.png`\
`run-012/review/template-authoring.png`

The audit also confirms that Template Authoring exposes useful source editing, current validity information, Save now, Download `.gtl`, and independent draft/source naming.

These capabilities must remain.

### Required source/preview relationship

Users should be able to inspect the effect of source changes without repeatedly navigating through unnecessarily separated sections.

Provide a responsive source/preview arrangement that satisfies the following:

| Available layout       | Required behavior                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Wide workspace         | Source and preview both conveniently accessible                                     |
| Moderate workspace     | Compact vertical layout with adjustable source height and direct preview navigation |
| Narrow workspace       | Stack or switch source/preview without horizontal overflow                          |
| Long GTL source        | Source remains independently scrollable/editable                                    |
| Long generated preview | Preview remains scrollable/readable                                                 |
| Invalid source         | Diagnostics and current preview validity clearly indicated                          |
| Explicit user resizing | Preserve chosen dimensions where appropriate                                        |

Implementation decision: Make source height adjustable and provide an explicit `View live preview` / `Back to source` navigation path. Where sufficient width is available, a source/preview split is permitted and encouraged if it improves simultaneous inspection.

Do not require a permanent side-by-side split when it would compress either source or output below a practical reading width.

### Content-aware initial source dimensions

The initial source editor should not reserve a large fixed rectangle for a short starter template when doing so prevents immediate access to its result.

A content-aware initial height may be used before deliberate user resizing.

| State                     | Behavior                                     |
| ------------------------- | -------------------------------------------- |
| Fresh short source        | Practical compact editor height              |
| Long source               | Bounded editor with independent scroll       |
| User deliberately resized | Preserve chosen size                         |
| Source changes            | Do not unexpectedly override chosen geometry |
| Viewport changes          | Constrain effective geometry                 |
| Source/preview switch     | Preserve source scroll, caret, and selection |
| Return from preview       | Restore editing context                      |

The initial-height algorithm must not recalculate on every keystroke in a way that moves the user's work unexpectedly.

Acceptance objective: On a 1440 × 1000 desktop viewport, users can inspect the complete starter source and rendered preview together, or move between them using one obvious action without losing their source-editing position.

### Authoring actions and validation

Do not weaken the original behavior merely to rearrange the interface.

| Feature                | Required invariant                                       |
| ---------------------- | -------------------------------------------------------- |
| Save now               | Current source persists under existing semantics         |
| Download `.gtl`        | Exact current source, even when invalid                  |
| Source diagnostics     | Remain available                                         |
| Validity indicator     | Represents current source, not stale source              |
| Last valid preview     | Clearly labeled when applicable                          |
| Template history       | Current source and checkpoints remain distinct           |
| Checkpoint restoration | Previous current source remains recoverable              |
| Preview field answers  | Separate from generated-document answers                 |
| Source formatting      | Exact meaningful whitespace preserved                    |
| Source editing         | Native selection, undo/redo, and IME semantics preserved |

Do not automatically make Save now visually dominant over Download merely because Save sounds like a primary operation.

The local autosave model and always-available source download have legitimate roles. Instead, ensure both actions are correctly labeled and their effects understandable.

### Preview access and narrow layouts

At 320 CSS pixels, the authoring workflow must not require two-dimensional page scrolling.

The source editor, preview controls, diagnostics, and action buttons must remain independently reachable through ordinary vertical navigation or explicit source/preview switching.

Preserve the current behavior already observed in the sampled 320px configurations.

### Acceptance criteria

| ID  | Scenario                                | Required outcome                                                         |
| --- | --------------------------------------- | ------------------------------------------------------------------------ |
| F01 | Open new short template at desktop size | Source and preview relationship immediately understandable               |
| F02 | Activate View live preview              | Output reached through direct action                                     |
| F03 | Return to source                        | Caret, selection, and scroll context retained                            |
| F04 | Resize source area                      | Editor responds without text/highlight misalignment                      |
| F05 | Edit long source                        | Internal scrolling works                                                 |
| F06 | Edit invalid source                     | Source preserved; diagnostics remain accurate                            |
| F07 | Inspect preview after correction        | Current valid rendering appears                                          |
| F08 | Use narrow viewport                     | Both source and preview accessible without page-wide horizontal overflow |
| F09 | Save/download/restore checkpoint        | Existing persistence and history behavior unchanged                      |

## G00. Settings responsiveness, labels, and secondary controls

Requirements: UX-A05, UX-A06, UX-M01, UX-M05, UX-M10\
Priority: P1 for panel responsiveness; P2 for typography, labeling, and consolidation

### Narrow Settings panel

The earlier manual review showed Settings docked into an approximately 300px-wide left column.

Labels and descriptive text were rendered in a layout more suitable for the wide Settings workspace. Long descriptions occupied many short lines, while controls remained in neighboring columns.

The automated audit instead captured the full Settings workspace, where form rows were generally well aligned and readable.

Therefore:

- The new audit does not demonstrate that the narrow-panel defect has been fixed.
- The good full-page layout should be preserved.
- The docked form must be reproduced and evaluated separately.

Required form layouts:

| Actual Settings container width | Presentation                                 |
| ------------------------------- | -------------------------------------------- |
| Wide                            | Label/description left; control right        |
| Medium                          | Label/control row; description below         |
| Narrow                          | Label, control, optional description stacked |
| Extremely constrained           | Single column, full-width controls           |

Use the actual component/container dimensions to select the appropriate arrangement.

A 1440px browser viewport can contain a 300px Settings dock. Viewport media queries alone are insufficient.

Form association: Checkbox labels, select controls, descriptions, and error text must remain visibly grouped and programmatically associated.

Do not place a long description into a narrow column while leaving significant unused width beside it.

### Background naming

The audit independently identified a label mismatch in Light mode.

The selected background is displayed as `Plain charcoal`, while the application visibly presents a light, off-white canvas.

The selected value is effective; the problem concerns its name.

Decision: Use a theme-neutral label such as `Plain` for the shared background option.

| Setting                        | Required label/behavior             |
| ------------------------------ | ----------------------------------- |
| Dark + plain                   | Plain                               |
| Light + plain                  | Plain                               |
| Quiet garden                   | Preserve                            |
| Evening light                  | Preserve                            |
| Background setting persistence | Preserve                            |
| Theme switching                | Preserve                            |
| Exports                        | Background styling remains excluded |

A theme-dependent description may provide additional context, but the underlying background identity should remain stable.

Do not alter background rendering simply to make the old name accurate.

### Secondary action typography

The audit measured several secondary action labels at approximately 10px, including Preview and panel-titlebar actions.

Increase readability through shared interface typography tokens.

| Control category       | Requirement                                              |
| ---------------------- | -------------------------------------------------------- |
| Secondary text actions | Clearly readable at ordinary desktop scale               |
| Panel commands         | Readable, visually distinguishable, appropriately spaced |
| Template Preview       | Readable and associated with its card                    |
| Rename actions         | Discoverable near the record title                       |
| Metadata               | May remain smaller than primary body text                |
| Disabled actions       | Distinct from enabled actions                            |
| Focused actions        | Visible focus treatment                                  |
| Compact density        | No clipping or excessive crowding                        |

A practical baseline is approximately 12-14px for small interface action labels, adjusted to the existing visual system and available space.

Do not indiscriminately increase every piece of metadata to the primary body size.

Target size: Preserve the existing measured pointer-hit areas and verify that new layouts continue to satisfy applicable target-size requirements. Do not assume 10px visible text means the clickable region is 10px.

### Settings explanation density

The earlier screenshots contained lengthy explanations for relatively simple settings, particularly Browser input suggestions.

Preserve important limitations, but improve scanning.

| Information type                 | Presentation                               |
| -------------------------------- | ------------------------------------------ |
| Setting title                    | Always visible                             |
| Current value/control            | Immediately accessible                     |
| Short effect description         | Visible where useful                       |
| Browser-specific qualification   | Concise note or accessible additional help |
| Advanced technical explanation   | Available on demand or in full Settings    |
| Storage/concurrency implications | Clearly described where consequential      |

The docked Settings panel should support quick adjustments. The full Settings workspace may provide more detailed context.

Both surfaces must use the same SettingsService and effective preference values.

### Acceptance criteria

| ID  | Scenario                              | Required result                                 |
| --- | ------------------------------------- | ----------------------------------------------- |
| G01 | Open full Settings                    | Existing readable wide layout retained          |
| G02 | Dock Settings into narrow left column | No excessively narrow label/description columns |
| G03 | Resize Settings dock                  | Form reflows according to container width       |
| G04 | Switch Light/Dark                     | Correct effective appearance                    |
| G05 | Select Plain background               | Label accurately describes option               |
| G06 | Switch density                        | Labels and controls remain readable             |
| G07 | Inspect Preview/panel actions         | Readable text and usable hit areas              |
| G08 | Change setting from floating panel    | Full Settings reflects effective value          |
| G09 | Use keyboard/200% text resizing       | No clipped or unreachable essential controls    |

## H00. Document metadata, navigation, contextual controls, and remaining UX refinements

This section integrates earlier observed issues not fully exercised by the automated audit.

They remain part of the implementation scope, but their current state must be established before changing code.

### Word-count correctness

Requirement: UX-M04\
Priority: P1

The earlier Blank note capture displayed:

`No draft yet · 1 words`

despite containing no answer, only the unresolved `$body` placeholder.

The new audit's empty Project description also displays a word count while its variable values are unresolved. This warrants checking whether unresolved variable identifiers are being counted as actual document words.

Word-count contract:

Define a clear, consistent measure of actual rendered text.

Unresolved placeholder notation must not be counted as user-authored words.

| Content state           | Required outcome                                                         |
| ----------------------- | ------------------------------------------------------------------------ |
| Empty Blank note        | 0 words                                                                  |
| Unresolved `$body` only | 0 words                                                                  |
| `Hello`                 | 1 word                                                                   |
| `this is a test`        | 4 words                                                                  |
| Multiple lines          | Count actual text across lines                                           |
| Repeated placeholder    | Count resolved text as it appears in output if measuring rendered result |
| Fixed template prose    | Count consistently with the chosen rendered-output policy                |
| Raw unresolved marker   | Never count as ordinary content                                          |

Decision: Word count represents the current plain-text generated content, excluding unresolved placeholder markers and UI-only decoration. Fixed prose legitimately present in the generated result may be counted.

If an answer-only count is also needed, label it distinctly rather than changing the meaning of the existing word counter.

The count must use correct singular/plural grammar.

Do not calculate word count directly from placeholder-decorated DOM text.

### Save status and completion

Requirements: UX-M07 and associated original editing contracts

| Element                 | Requirement                                |
| ----------------------- | ------------------------------------------ |
| No draft yet            | Accurate temporary-record state            |
| Unsaved changes         | Clearly distinguishable from saved state   |
| Saving                  | Accurate pending state                     |
| Saved                   | Shown only after confirmed persistence     |
| Save failed             | Prominent and recoverable                  |
| Word count              | Secondary descriptive metadata             |
| Field completion        | Readable, understandable count             |
| Missing required fields | Navigate to unresolved field where useful  |
| Operational Issues      | Distinguished from ordinary incompleteness |

Save status and word count may share a metadata row but must remain conceptually independent.

The Issues counter must not make a normal untouched template look like a critical application failure.

The new audit verified that the sample's three missing fields corresponded to the reported count. Preserve that correct behavior.

### Primary navigation and creation

Requirement: UX-M06

When an auxiliary navigation dock changes from Documents to Settings, the New Document action should remain discoverable through a stable workspace-level mechanism.

Do not make creating a document depend on first restoring a particular navigation tab.

A compact top-level New Document action is acceptable if it avoids duplicating unnecessarily large controls.

| State                  | Required behavior                                        |
| ---------------------- | -------------------------------------------------------- |
| Documents dock active  | New Document accessible                                  |
| Settings dock active   | New Document still discoverable                          |
| Navigation collapsed   | New Document reachable through navigation/primary action |
| No documents           | Clear creation entry point                               |
| Existing document open | New Document available without discarding current work   |
| Mobile                 | Creation remains accessible                              |

### Panel title duplication

Requirements: UX-M05 and UX-M10

The earlier screenshots repeatedly displayed panel names across the top toolbar, dock tabs, panel headers, and panel bodies.

The new audit confirms the small secondary-action typography problem but does not require removing every repetition.

Decision: Every repeated title must serve an identifiable navigation or contextual purpose.

| Interface layer   | Responsibility                                          |
| ----------------- | ------------------------------------------------------- |
| Global navigation | Open or activate workspaces/panels                      |
| Dock tab          | Identify selected panel                                 |
| Panel header      | Provide title where necessary and window controls       |
| Panel content     | Begin with useful content rather than duplicating title |
| Field section     | Identify active `$variable` and question                |
| Main document     | Identify current document                               |

Consolidate redundant text and unnecessary header height without reducing the visibility of required panel actions.

A selected dock tab may make a second identical body heading unnecessary.

### Template selection and visual states

The audit found selected writing styles and template cards reasonably distinguishable in its tested states.

Preserve existing radio semantics, selected borders, and focus treatment.

Do not introduce a new selected-state design solely because the previous manual review described selection as subtle. First evaluate it against the current theme variants and keyboard-focus state.

Required distinction: selected, focused, hovered, disabled, and ordinary card states must remain understandable without relying exclusively on color.

### Field editor contextual controls

Retain the original `Copy example` and `Use example` behavior.

Do not change the selected value merely because the user inspects or copies an example.

Retain active field identity, answer synchronization, and correct required-state feedback.

If examples or hints are partially below the panel fold, provide an understandable path to them without arbitrarily scrolling the main document.

### Technical status and empty states

The earlier UI review questioned the prominence of `IndexedDB` in the top toolbar.

The new audit found accurate storage and empty-state information but did not demonstrate a storage-status defect.

Decision: Preserve access to storage-engine information, but make save and persistence status the primary user-facing concern.

Keep detailed engine selection in Settings. A compact current-engine indicator may remain if it provides useful operational context and does not compete with the primary workflow.

Empty document lists, empty template history, and neutral Field editor states must remain truthful and useful. Do not populate them with artificial content merely to make screenshots appear fuller.

### Acceptance criteria

| ID  | Scenario                                  | Required result                              |
| --- | ----------------------------------------- | -------------------------------------------- |
| H01 | Open empty Blank note                     | 0 words or accurately labeled empty count    |
| H02 | Enter one then several words              | Correct count and pluralization              |
| H03 | Open unresolved multi-field template      | Placeholder markers excluded                 |
| H04 | Save document                             | Save status accurate                         |
| H05 | Simulate save failure                     | Prominent recoverable failure                |
| H06 | Switch dock tabs                          | Primary creation remains discoverable        |
| H07 | Inspect panel header hierarchy            | No unnecessary title duplication             |
| H08 | Select template/style by keyboard         | Selected and focus states distinct           |
| H09 | Copy and use examples                     | Existing semantics preserved                 |
| H10 | Open empty navigation/Issues/Field editor | Useful state without artificial content      |
| H11 | Open archived/saved document              | Navigation and document context remain clear |

## I00. Responsive behavior, accessibility, and interaction verification

The automated audit confirmed several positive behaviors. These must be retained while addressing visual weaknesses.

### Verified behavior to preserve

| Behavior                       | Evidence                                  | Preservation requirement                    |
| ------------------------------ | ----------------------------------------- | ------------------------------------------- |
| Panel docking/recovery         | Targeted supplementary browser journey    | No answer loss through tested transitions   |
| Example use after scrolling    | Supplementary interaction                 | Examples and Use actions remain functional  |
| Native answer focus            | DOM and existing default-focus assertions | Selected input receives focus               |
| Source-editor focus            | Tab/Shift+Tab browser verification        | Native source editing remains accessible    |
| Panel movement/resize commands | All twelve measured configurations        | Keep non-drag controls available            |
| 320px sampled reflow           | Dark and Light supplementary checks       | No newly introduced horizontal overflow     |
| Appearance switching           | Twelve effective-settings checks          | Correct theme/background/density            |
| Separate source names          | Current authoring model                   | Draft and GTL identities remain independent |

### Verification matrix for unresolved behavior

A static screenshot cannot establish complete interaction or accessibility correctness. The following must be tested against the implementation rather than presumed defective.

| Area                        | Required verification                    | Acceptance principle                         |
| --------------------------- | ---------------------------------------- | -------------------------------------------- |
| Browser zoom                | 200% text enlargement                    | Meaningful content remains accessible        |
| Reflow                      | 320 CSS px and intermediate widths       | No unintended two-dimensional page scrolling |
| Dock combinations           | Left, right, shared tabbed group         | Central workspace remains usable             |
| Floating geometry           | Move, resize, collapse, restore          | Controls remain reachable                    |
| Pointer alternatives        | Move/resize menu commands                | Operations actually work without dragging    |
| Keyboard only               | Main creation/editing/panel workflows    | No inaccessible mandatory action             |
| Focus order                 | Panels, modal dialogs, fields            | Predictable focus and restoration            |
| Focus visibility            | Source, input, navigation, controls      | Visible unclipped indication                 |
| Multiline editing           | Long text, line breaks, native selection | No data or caret loss                        |
| IME                         | Composition and commits                  | No composition interruption                  |
| Long unbroken strings       | Inputs, source, generated result         | Appropriate wrapping/scrolling               |
| Touch and software keyboard | Narrow/mobile editing                    | Answer and controls reachable                |
| Theme contrast              | All meaningful foreground classes        | Applicable contrast requirements satisfied   |
| Expanded text               | Large input and document text            | No overlap, clipping, or hidden controls     |
| Long Settings               | Narrow docks with extensive descriptions | Container-responsive readability             |
| Template previews           | Hover, focus, explicit Preview           | No accidental document mutation              |
| Document lifecycle          | Saved, archived, deleted, renamed        | Existing contracts preserved                 |
| Template history            | Save, inspect, restore checkpoint        | Historical source remains recoverable        |
| Persistence failure         | Save errors and retry                    | No false save success or lost working data   |
| Concurrency                 | Two-tab source/document changes          | No silent authored-data overwrite            |

Important: The source audit did not test all of these interactions, and the absence of evidence must not be presented as a failure.

If the current regression suite already provides meaningful coverage, reuse it. Add or extend only the missing assertions and workflows.

### Accessibility thresholds

Use the application's existing WCAG 2.2 AA target.

| Criterion                   | Required consideration                                                  |
| --------------------------- | ----------------------------------------------------------------------- |
| 1.4.3 Contrast (Minimum)    | Meaningful normal text at least 4.5:1, subject to applicable exceptions |
| 1.4.4 Resize Text           | Text remains usable when enlarged                                       |
| 1.4.10 Reflow               | Content works at applicable narrow equivalent viewport sizes            |
| 2.4.7 Focus Visible         | Focus indicator is perceptible                                          |
| 2.5.7 Dragging Movements    | Appropriate single-pointer alternative                                  |
| 2.5.8 Target Size (Minimum) | 24 × 24 CSS px or applicable exception                                  |

Do not treat these as satisfied solely through screenshots.

A keyboard movement command is not, by itself, proof of compliance with the single-pointer alternative requirement for dragging.

Likewise, the application's 25% Large text setting is not proof that 200% browser text enlargement works.

Reference: `ux-audit/verification.md`, including its standards links and remaining verification gaps.

## J00. Implementation strategy, testing, and evidence requirements

### Implementation approach

Implement the remediation within Guided's existing feature ownership.

| Change                                    | Owning area                             |
| ----------------------------------------- | --------------------------------------- |
| GTL syntax contrast and source typography | Template Authoring source editor        |
| Active document presentation              | Documents workspace                     |
| Template-gallery disclosure               | Template selection/workspace UI         |
| Writing-style chooser                     | Templates/Documents selection UI        |
| Floating guidance default geometry        | Existing panel-layout system            |
| Field editor content hierarchy            | Field editor feature                    |
| Text-size behavior                        | SettingsService and affected components |
| Authoring source/preview arrangement      | Template Authoring workspace            |
| Narrow Settings forms                     | Shared Settings presentation            |
| Word counting                             | Document-result/metadata logic          |
| Panel command typography                  | Shared panel UI                         |
| Template Preview affordance               | Template catalog component              |
| Background naming                         | Settings presentation/metadata          |
| Draft-name explanation                    | Template Authoring UI                   |
| Acceptance verification                   | Existing independent Playwright suite   |

Do not duplicate document state inside the panel system or introduce separate Settings state merely because the same preferences appear in different surfaces.

### Implementation sequence

| Phase | Scope                                                            | Exit condition                                                 |
| ----- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| 1     | Verify current build and reproduce older unresolved findings     | Accurate baseline with confirmed/not-reproduced classification |
| 2     | Fix GTL syntax contrast and source readability                   | C01-C10 pass                                                   |
| 3     | Reorganize active document and template selection                | D01-D11 pass                                                   |
| 4     | Improve contextual guidance and Field editor                     | E01-E13 pass                                                   |
| 5     | Improve authoring source/preview ergonomics                      | F01-F09 pass                                                   |
| 6     | Correct Settings containers, action typography, and naming       | G01-G09 pass                                                   |
| 7     | Correct metadata and remaining contextual/navigation issues      | H01-H11 pass                                                   |
| 8     | Run browser/accessibility regression and appearance verification | Applicable I00 checks pass                                     |
| 9     | Consolidate implementation evidence and report remaining gaps    | Complete validation report                                     |

Where several issues share one design-system root cause, prefer a coherent shared fix rather than separate arbitrary CSS overrides.

### Playwright regression maintenance

The independent UI Regression Test Suite already provides Page Objects, Flows, smoke readiness, and screenshot capture.

The existing regression-isolation directive remains authoritative.

The product under test must not share implementation modules or expected-value calculations with the suite.

Test-maintenance policy:

| Change                        | Required action                                              |
| ----------------------------- | ------------------------------------------------------------ |
| Visual arrangement only       | Review affected Page Objects/selectors and visual assertions |
| New disclosure control        | Extend existing document-creation flow                       |
| Changed panel behavior        | Extend workspace-layout acceptance journey                   |
| Changed Field editor behavior | Extend writing and keyboard journeys                         |
| Changed Settings behavior     | Extend Settings/workspace journey                            |
| GTL source highlighting       | Add focused independent contrast verification                |
| Source/preview restructuring  | Extend authoring journey                                     |
| Word-count semantics          | Add unit/domain tests and one relevant browser assertion     |
| Changed test IDs              | Update owning Page Object and review compatibility           |

Do not create one browser test for every visual adjustment.

Keep browser acceptance tests substantial and user-oriented. Use lower-level tests for individual geometry, word-count, and contrast-calculation rules where appropriate.

### Appearance verification

After implementing corrections, use the existing screenshot framework to capture relevant states.

The audit's original appearance matrix remains the baseline:

| Dimension                     | Coverage                                            |
| ----------------------------- | --------------------------------------------------- |
| Theme                         | Dark, Light                                         |
| Background                    | Plain, Quiet garden, Evening light                  |
| Density                       | Comfortable, Compact                                |
| Standard viewport             | 1440 × 1000                                         |
| Additional responsive samples | 320px, intermediate desktop/tablet widths           |
| Text enlargement              | Normal, Large, and browser-based enlargement        |
| Panel arrangement             | Default, floating, docked, collapsed where relevant |

A final visual review should cover all twelve standard appearance configurations.

Do not assume every registered Page Object requires a distinct screenshot of an identical underlying state. Preserve registry smoke coverage, but avoid counting duplicate captures as independent usability evidence.

Important state distinction: The previous automated audit principally captured fresh, mostly empty document and draft states. The implementation must additionally inspect at least the following meaningful states:

| State                             | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| New Document, no template         | Template discovery                                    |
| Template selected, before answers | Writing-style selection and initial field position    |
| Document with completed answers   | Active writing/result hierarchy                       |
| One-field Blank note              | Navigation visibility, word count, multiline behavior |
| Field editor neutral              | Initial floating footprint                            |
| Field editor active               | Guidance, answer, examples                            |
| Field editor Large                | Actual answer typography                              |
| Settings full page                | Wide form layout                                      |
| Settings narrow dock              | Container-responsive form                             |
| Template Authoring short source   | Source/preview accessibility                          |
| Template Authoring long source    | Scrolling and resizing                                |
| Authoring with invalid GTL        | Source readability and diagnostics                    |
| Issues with missing fields        | Normal incompleteness                                 |
| Issues with operational failure   | Severity and recovery                                 |
| Rename/confirmation dialog        | Focus, clarity, and containment                       |

The agent should capture these states through existing Page Objects and meaningful reusable flows, not create a new unrelated screenshot infrastructure.

### Reporting requirements

The implementation report must contain:

| Field                   | Required information                    |
| ----------------------- | --------------------------------------- |
| Finding IDs             | Which UX requirements were addressed    |
| Actual changes          | Specific user-visible improvements      |
| Source files            | Product files modified                  |
| Page Objects/Flows      | Regression-suite maintenance            |
| Reproduced older issues | Which prior observations still existed  |
| Not-reproduced issues   | Evidence supporting that conclusion     |
| Tests executed          | Exact commands and results              |
| Browser screenshots     | Before/after or relevant final evidence |
| Accessibility checks    | Measurements and limitations            |
| Unverified items        | Explicit list                           |
| Remaining defects       | Known issues not resolved               |

Do not state that the application has achieved full WCAG conformance merely because selected audit checks pass.

### Protection against regression

The remediation must not break already verified behavior while rearranging the UI.

At minimum, preserve:

| Existing behavior             | Regression protection                         |
| ----------------------------- | --------------------------------------------- |
| Live answer propagation       | Field changes update guided text/result       |
| Template version independence | Answers do not silently carry across versions |
| Native source editor          | Selection, undo, line breaks, caret           |
| Invalid GTL handling          | Source remains saveable/downloadable          |
| Panel restoration             | No answer loss                                |
| Example selection             | Use and Copy retain distinct semantics        |
| Settings synchronization      | Local and full Settings agree                 |
| Workspace persistence         | Deliberate geometry restored                  |
| Document renaming             | Same record identity and content              |
| Archiving/restoration         | Non-destructive lifecycle                     |
| Checkpoint history            | Historical source preserved                   |
| Storage modes                 | Existing separation retained                  |
| Focus on field activation     | Correct answer input receives focus           |
| Background options            | Effective styles and selections retained      |

## K00. Consolidated implementation decisions

This section intentionally repeats the binding decisions in compact form.

### Settled UX decisions

| Design question                                                                   | Decision                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| Is the current implementation entirely unsuccessful?                              | No; preserve its working architecture            |
| What is the highest-severity confirmed problem?                                   | GTL source-token contrast                        |
| Should all dark/light colors be redesigned?                                       | No; correct measured and demonstrable weaknesses |
| Should meaningful GTL punctuation be treated as decoration?                       | No                                               |
| Should source font size follow document Large mode?                               | No                                               |
| Should the source font become more readable?                                      | Yes                                              |
| Should template gallery stay fully expanded during active editing?                | No                                               |
| Should style alternatives disappear permanently?                                  | No                                               |
| Should active document title be the main heading?                                 | Yes                                              |
| Should opening Field editor always force docking?                                 | No                                               |
| Should neutral Field editor use full active-editor footprint by default?          | No, absent deliberate geometry                   |
| Should content-aware sizing overwrite user geometry?                              | No                                               |
| Are example actions missing?                                                      | No; improve initial visibility                   |
| Should all examples fit without scrolling?                                        | Not required                                     |
| Should actual answer text scale in Large mode?                                    | Yes                                              |
| Should one-field templates show disabled Previous/Next?                           | No                                               |
| Should source and preview require extensive vertical travel for a short template? | No                                               |
| Is side-by-side source/preview mandatory at every width?                          | No                                               |
| Are draft title and GTL template name the same property?                          | No                                               |
| Should Download automatically become secondary to Save?                           | No                                               |
| Is `Plain charcoal` appropriate in Light?                                         | No; use theme-neutral wording                    |
| Are 10px labels automatically undersized pointer targets?                         | No                                               |
| Should secondary action labels become more readable?                              | Yes                                              |
| Does the new audit prove global horizontal overflow?                              | No                                               |
| Should all existing panel behavior be rewritten?                                  | No                                               |
| Should new browser tests be granular?                                             | No                                               |
| Can screenshots alone verify keyboard and persistence behavior?                   | No                                               |

### Consolidated corrective requirements

| ID     | Priority     | Required result                                           | Main acceptance reference         |
| ------ | ------------ | --------------------------------------------------------- | --------------------------------- |
| UX-A01 | P0           | Contrast-safe, aligned, readable GTL source               | C01-C10                           |
| UX-A02 | P1           | Active writing visible without persistent setup dominance | D01-D11                           |
| UX-A03 | P1           | Compact neutral guidance and accessible active examples   | E01-E13                           |
| UX-A04 | P1           | Convenient source/preview editing workflow                | F01-F09                           |
| UX-A05 | P2           | Readable and coherently grouped secondary actions         | G01-G09                           |
| UX-A06 | P2           | Accurate appearance option naming                         | G05                               |
| UX-A07 | P2           | Explicit distinction between draft title and GTL name     | F00 and authoring naming contract |
| UX-M01 | P1           | Settings reflows correctly in narrow docks                | G02-G03                           |
| UX-M02 | P1           | Large mode scales actual answer content                   | E08                               |
| UX-M03 | P1           | Contextual navigation shown only when relevant            | E09                               |
| UX-M04 | P1           | Correct word counting and pluralization                   | H01-H03                           |
| UX-M05 | P1           | Reduced panel-header duplication and clearer controls     | E13, H07                          |
| UX-M06 | P1           | New Document accessible regardless of active dock tab     | H06                               |
| UX-M07 | P2           | Clear save/completion hierarchy                           | H04-H05                           |
| UX-M08 | P2           | Comfortable multiline editor                              | E10-E11                           |
| UX-M09 | P2           | Better associated template Preview action                 | D11                               |
| UX-M10 | P2           | Coherent panel/global navigation                          | H07                               |
| UX-M11 | Verification | Broader responsive and overflow testing                   | I00                               |
| UX-M12 | Verification | Preserve focus, recovery, and data safety                 | I00/J00                           |

### Source-to-requirement traceability

| Original audit source                   | Change-request section                                    |
| --------------------------------------- | --------------------------------------------------------- |
| `improvement-backlog.md#ux-a01`         | C00                                                       |
| `improvement-backlog.md#ux-a02`         | D00                                                       |
| `improvement-backlog.md#ux-a03`         | E00                                                       |
| `improvement-backlog.md#ux-a04`         | F00                                                       |
| `improvement-backlog.md#ux-a05`         | G00                                                       |
| `improvement-backlog.md#ux-a06`         | G00                                                       |
| `improvement-backlog.md#ux-a07`         | F00                                                       |
| `verification.md`                       | B00, C00, E00, I00                                        |
| `measured-summary.json`                 | C00, E00                                                  |
| `review-integrity.md`                   | B00                                                       |
| `finding-evidence.md`                   | All primary requirements                                  |
| Earlier Guided UI Implementation Review | D00, E00, G00, H00                                        |
| `suggestions001-02`                     | Preserved original functionality and acceptance contracts |

### Explicitly excluded changes

This remediation does not authorize:

| Exclusion                                                  | Reason                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| Replacing Guided's application architecture                | Existing architecture already supports required features |
| Replacing the panel manager                                | Evidence supports targeted layout improvements           |
| Merging draft and GTL template names                       | Distinct identities are intentional                      |
| Removing template styles                                   | Prominent choices remain required                        |
| Disabling floating panels                                  | User-controlled floating remains required                |
| Automatically closing deliberately opened panels           | Violates user preferences                                |
| Replacing native GTL textarea editing                      | Risks established editing semantics                      |
| Treating all empty fields as critical errors               | Incompleteness is normal                                 |
| Redesigning all backgrounds                                | Audit found them generally unobtrusive                   |
| Large-scale speculative accessibility rewrites             | Verify actual violations first                           |
| Creating numerous granular Playwright tests                | Conflicts with accepted regression-suite architecture    |
| Modifying production behavior to satisfy screenshots alone | Functional correctness remains authoritative             |

### Definition of complete

The change request is complete when:

| Area                  | Completion requirement                                                         |
| --------------------- | ------------------------------------------------------------------------------ |
| GTL source            | Semantic punctuation and all meaningful syntax tokens meet required contrast   |
| Document workspace    | Active writing takes priority after selection                                  |
| Template discovery    | Remains prominent when needed, compact when no longer primary                  |
| Field editor          | Neutral and active presentations are appropriate to content                    |
| Examples              | Discoverable and reachable without confusing clipping                          |
| Text scaling          | User-entered text responds correctly                                           |
| Single-field controls | No meaningless field navigation                                                |
| Template Authoring    | Source and live preview are conveniently accessible                            |
| Settings              | Wide and narrow layouts are independently usable                               |
| Metadata              | Word count, save state, and completion are accurate and readable               |
| Navigation            | Primary actions and panel controls remain discoverable                         |
| Appearance            | All supported themes, backgrounds, and densities remain coherent               |
| Responsive behavior   | Sampled narrow layouts preserved and broader cases verified                    |
| Accessibility         | Applicable contrast, focus, keyboard, reflow, and control requirements checked |
| Data safety           | No regression in existing editing, persistence, or authoring lifecycle         |
| Acceptance tests      | Existing meaningful user journeys pass                                         |
| Evidence              | Every addressed issue has observable verification                              |

Final implementation objective: Guided should retain the flexibility introduced by `suggestions001-02` while substantially improving its everyday usability. The completed application should place authored content ahead of auxiliary setup, present readable source and controls in every theme, adapt panels to their contents and available space, and preserve the user's work and preferences throughout normal interactions.

The new automated audit supplies a measured foundation for these changes. The earlier manual review adds important editing, Settings, and lifecycle concerns that the newer screenshot states did not fully exercise. Together, they define a targeted UX remediation effort rather than a wholesale redesign.