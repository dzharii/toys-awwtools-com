# UX redesign implementation plan

Source: `suggestions003-01-mojor-ux-redesign-again.md`, supplied by the user.
Its embedded `suggestions002-02-04` header is retained unchanged; this plan uses
the actual specification filename. This document is immutable. Execution status
and results belong in the session task register and final implementation report.

## Baseline and boundaries

- Read AGENTS, the complete change request, code-organization guidance, applicable
  original interaction contracts, architecture decisions, reference samples and
  the independent suite's README/COVERAGE/VALIDATION/framework guide.
- Work in the canonical `D:\my-github\toys-awwtools-com\docs\public\2026-10-25-text-template-editor`
  project, preserving the user's new specification and all existing immutable specs.
- Reproduce Blank note navigation/count, narrow docked Settings, Large answer
  typography, neutral guidance footprint and creation discoverability against
  the current compiled application. Distinguish reproduced from not reproduced.
- Reuse existing services, native Web Components, panel manager, renderer, native
  editors and independent Playwright fixture/registry/capture extension.
- Do not add migrations, legacy converters, runtime dependencies or a second
  panel/Settings/rendering implementation. Migration work is not applicable.
- Keep synthetic screenshots/reports/probes local in ignored project-root `temp`.

## C00: source readability (UX-A01, C01-C10)

- Identify why rendered microlight token styles survive the theme adapter.
- Make highlighting instance-local so current and inspection editors cannot
  reapply each other's vendor colors.
- Use a theme-aware palette for every meaningful directive, identifier,
  punctuation and source-value token, including otherwise unclassified tokens.
- Set matching textarea/highlight typography to a comfortable ~14px in both
  densities and narrow layouts, independent of document/field size preferences.
- Make native focus and selection visible without clipping; preserve exact raw
  source, normalized native caret offsets, native undo/redo and composition.
- Measure all actual rendered meaningful token classes against their composited
  local background in all twelve appearances; require unrounded ratios >=4.5.
- Exercise multiline/long source, both scroll axes, selection/replacement,
  undo/redo, composition guards, diagnostics and invalid-source download/save.

## D00: writing-first composition (UX-A02/M07/M09, D01-D11)

- Make a genuinely unselected New Document emphasize discovery, without saving
  or discarding a previous independent working record.
- Keep active document identity as the primary heading, with Rename and accurate
  save/count metadata near it.
- Put current template/style context before guided content; make discovery and
  style alternatives explicit, reversible disclosures.
- Show all five informative Project description styles during deliberate style
  selection; compact the chooser after selection, not while merely inspecting.
- Allow choosing the initially selected style through an explicit completion
  action; retain distinct native selection and focus semantics.
- Keep reopened saved documents compact, and never collapse an explicitly
  opened chooser merely because an answer or save status updates.
- Preserve version independence and preview noncommitment, including restoration
  of an existing document of the chosen version.
- Integrate Preview into its own card footer with readable secondary typography.
- At 1440x1000 in both densities show the complete short guided document and an
  immediate route to generated result/actions without traversing the gallery.
- Preserve field context and coherent reading position during disclosure changes.

## E00: contextual guidance (UX-A03/M02/M03/M05/M08/M10, E01-E13)

- Use compact neutral geometry, without automatically closing deliberate panels.
- Use active geometry/placement near the first selected field, preserving the
  floating default and all explicit user placement/size/visibility preferences.
- Keep answer content primary; reduce redundant headings/spacing and keep the
  identifier/question/hint semantically associated with the input.
- Make examples discoverable immediately through a visible first example or
  clear continuation action; retain distinct Copy and Use behavior.
- Hide Previous, Next and position for fewer than two distinct editable fields.
- Verify actual answer typography grows 25% in Large; correct only if reproduced.
- Let multiline controls use useful additional panel height, without remounting
  native inputs or overriding deliberate panel geometry.
- Preserve immediate focus, selection, caret, composition and native undo through
  resize, dock, collapse/restore and close/reopen.
- Clear stale field context on document/preview changes.
- Preserve and execute pointer and keyboard movement/resize alternatives.

## F00: authoring ergonomics (UX-A04/A07, F01-F09)

- Start short source at a practical compact height, bounded for long source.
- Make source height adjustable by native resize and a non-drag control; do not
  recalculate height on every keystroke or overwrite deliberate dimensions.
- Provide obvious View live preview / Back to source actions, retaining source
  caret/selection and internal scroll; keep both usable at narrow widths.
- Label Draft title explicitly, distinguish it from GTL template name, and retain
  independent rename/export/history semantics.
- Retain accurate current-source diagnostics/validity, invalid-source editing,
  exact downloads, autosave, checkpoint safety and preview-answer separation.
- Do not arbitrarily reverse Save/Download hierarchy.

## G00/H00: Settings, navigation and metadata

- Use actual Settings container width for wide, intermediate and narrow form
  layouts; associate labels, controls, descriptions and validation programmatically.
- Preserve the readable full workspace; make a ~300px dock single-column and
  keep controls/descriptions reachable as the dock resizes (UX-M01, G01-G03).
- Rename the shared plain option to Plain without changing effective appearance,
  stored identities or exported bytes (UX-A06, G04-G05).
- Introduce coherent ~12-14px secondary-action typography and preserve useful
  targets, focus and Compact readability (UX-A05/M05/M10, G06-G07).
- Keep quick and full Settings on the same service; make lengthy browser-specific
  qualifications accessible on demand, not dominant in narrow docks (G08-G09).
- Count actual generated plain text, excluding unresolved-marker decoration
  through structured rendering rather than a marker-removal regex; preserve
  authored marker-like text, repeated output and fixed prose (UX-M04, H01-H03).
- Use correct word/words grammar; add focused unit/domain cases and one
  substantial writing-journey browser assertion.
- Preserve truthful temporary/dirty/saving/saved/error/conflict feedback and
  recoverable failures; separate ordinary incompleteness from operational issues
  without changing required-field gating (UX-M07, H04-H05/H09-H11).
- Add a stable compact workspace-level New Document entry independent of dock
  tabs/visibility, without another oversized duplicated navigation block (H06).
- Remove redundant body/header labels only where another visible layer supplies
  the same identity; retain functional navigation and window controls (H07-H08).

## Independent regression maintenance and final editorial gate

- Review all seven Page Objects, their required/default contracts, affected
  components and creation flow for the new unselected/disclosure states.
- Keep selectors inside owning Page Objects/components; update meaningful
  opening prerequisites without repairing focus or injecting product state.
- Extend existing writing, discovery, keyboard, authoring, layout and Settings
  journeys with the new outcomes; add a separate coherent appearance/editorial
  journey only where the matrix precondition genuinely differs.
- Retain full existing data/lifecycle/failure/concurrency/history assertions.
- Add lower-level word-count/geometry/highlighting-adapter cases where useful;
  never import product code into acceptance oracles.
- Run product formatting/typecheck/unit/fresh build; suite boundaries/types/unit;
  smoke first; affected journeys; then the complete final regression suite.
- Inspect all twelve standard theme/background/density appearances with the
  existing capture action. Review original images, not merely filenames or a
  contact sheet; count duplicate surface captures honestly.
- Inspect meaningful discovery, style choice, completed document, Blank note,
  neutral/active/Large guidance, full/narrow Settings, short/long/invalid source,
  ordinary Issues, save failure, and rename/confirmation states.
- Verify 320px and intermediate widths, left/right/shared docks, long/unbroken
  content, 200% browser-based enlargement, focus, keyboard and alternative panel
  controls. Distinguish synthetic composition/mobile geometry from OS IME and
  physical soft-keyboard certification.
- Perform model-assisted final code review, then a final editorial browser
  review. Fix demonstrated remaining usability/regression issues, rerun affected
  checks, and finish with a fresh full UI regression run and result analysis.
- Update actual assertion coverage and validation docs. Report finding IDs,
  source/test changes, reproduced/not-reproduced cases, exact commands/results,
  screenshot paths, accessibility measurements and explicit remaining limits.
- Review scoped Git changes; retain only intended source/docs/spec-TODO changes,
  keep generated work ignored, stop owned helpers, and do not commit unless asked.
