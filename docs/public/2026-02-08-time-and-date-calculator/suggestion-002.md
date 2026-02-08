2026-02-08
A00 Purpose and positioning

This document specifies the UX and UI behavior of the demo application for the date/time expression language. The core deliverable remains the library. The application is a demonstration layer that exercises the library end-to-end (tokenize, parse, evaluate, format, and error spans) and exists to make the library easy to understand, evaluate, and adopt. The demo must look production-ready: fast, deterministic, visually clean, and precise in its feedback.

The coding agent must treat the UI as a consumer of the library, not as the place where semantics live. All language rules, evaluation behavior, and error spans must come from the library. The UI only renders those outputs and provides context controls.

The coding agent may use the already-downloaded reference data located at `/reference_data/` as listed in the provided folder tree. The demo must load the small sample fixtures from `/reference_data\datecalc_reference_data/` to power examples, tests, and optional built-in resolvers.

B00 Demo goals and non-goals

The demo must help a user answer: “What does this expression mean”, “What is the result”, and “Why is it failing”. It must also help a developer understand how to embed the library: which API to call, what value types exist, and how error spans and hints are produced.

The demo must not implement its own parser, evaluator, or ad-hoc rules. It must not perform network calls for geocoding or holiday lookup. If place names or holidays are supported, they must use either the library’s pluggable mechanisms and local reference data, or must explicitly show that a feature is disabled until enabled in settings.

C00 User personas and primary use cases

End user (non-developer) uses the demo like a calculator: types an expression, reads a result, and iterates quickly by editing the expression. They want minimal controls and immediate feedback.

Developer evaluating the library uses the demo to understand semantics, edge cases, and errors. They want to see structured output (types, ISO forms, spans), and to confirm that the library behaves deterministically under a configured context.

D00 High-level UI layout

The application is a single-page layout with these regions:

Header region (top): global context controls and status.

Editor region (left or top): expression input with span highlighting and inline diagnostics.

Output region (right or bottom): result rendering, including formatted output, type, and detail view.

Reference region (optional collapsible): examples gallery and quick insertion.

The layout must be responsive. At wide widths, Editor and Output are side-by-side. At narrow widths, Editor appears above Output. The header remains at the top.

E00 Global context controls and states

E01 Context controls in header

The header must contain:

Time zone control: a text input with suggestions populated from `/reference_data\datecalc_reference_data\iana_zones_subset.sample.txt` by default. It must accept any valid IANA zone id string. When invalid, it shows a validation error but does not block editing of the expression.

Now control: a read-only display of the effective `now` used for evaluation, including offset and zone id when available. The demo must provide a toggle for “Fixed now” vs “Real now”. Fixed now is the default for deterministic behavior and must use the value defined in `expression_fixtures.sample.json` when that fixture is loaded. Real now uses the system clock in the selected zone.

Business calendar control: a selector with at least two modes:

1. Mon-Fri no holidays.
2. Holidays enabled (from local dataset).
   When holidays enabled is selected, the demo must load holiday dates from `/reference_data\datecalc_reference_data\holidays_us_2026_nager.sample.json` by default and provide a country selector if additional datasets are later added.

Place resolver control: a toggle “Enable place names”. When enabled, the demo uses `/reference_data\datecalc_reference_data\place_resolver_min.sample.json` as a built-in resolver map (string to IANA tzid). When disabled, expressions using place names must fail with the library’s evaluation error that indicates resolver is missing.

E02 State persistence

The demo must persist user settings in local storage:

* selected time zone id
* fixed vs real now
* business calendar mode
* place resolver toggle
* selected example (if any)
* last expression input

On reload, these must restore.

F00 Expression input editor UX

F01 Editor component requirements

The editor must be a plain text editor with monospace font. It must support multi-line input, but evaluation in v1 is defined on the first non-empty line only. The UI must visually indicate which line is being evaluated if multiple lines exist.

The editor must show:

* inline error underlines for spans returned by the library
* optional token/AST preview in a collapsible panel for developer mode
* a clear “evaluating” indicator during debounce and evaluation

F02 Evaluation triggering

Evaluation triggers:

* on input change, after a debounce of 200ms
* immediately on Enter
* immediately when context settings change (time zone, now mode, business calendar, resolver toggle)

If the input is empty or contains only whitespace, the output shows Idle state and no error.

F03 Span highlighting behavior

On library error, the UI must highlight `error.span` exactly:

* underline the span in the editor
* if span length is zero, show a caret marker at the span start
* if span crosses lines, highlight across lines, but evaluation is still based on the first non-empty line; cross-line spans typically indicate a UI bug and must be visible

Hovering the underline shows a tooltip with the error message and code.

Clicking the error message in the output panel scrolls/caret-jumps the editor to the error span start.

F04 Developer mode

The demo must provide a toggle “Developer details” that reveals:

* tokens list with spans (from library tokenize)
* AST summary with node spans
* the raw typed value object summary
* the effective evaluation context (zone id, now value, business calendar summary, resolver enabled/disabled)

Developer mode must be off by default.

G00 Output rendering UX

G01 Output states

Idle: shows a short instruction and a few clickable example chips.

Success: shows:

* primary output line (formatted string or canonical representation)
* value type badge (PlainDate, ZonedDateTime, Duration, Number, Boolean)
* context badge (zone id)
* optional “Explain” section summarizing how the expression was interpreted (AST-driven, not heuristics)

Error: shows:

* message line
* error code
* hints list (if provided by library)
* span location in line:column form
* optional “What the parser expected” if the library returns structured expectations

G02 Success formatting rules

If the value is ZonedDateTime, the primary output must be the ISO string including offset and bracketed zone id when present.

If the value is PlainDate, primary output is `YYYY-MM-DD`.

If the value is Duration, primary output is ISO-8601 duration.

If the value is Number or Boolean, primary output is its literal.

The output must also show a secondary line that explicitly states the evaluation zone and now mode used.

G03 Explain panel

The Explain panel is optional but recommended. When present, it must be driven by AST structure and show a short deterministic explanation, such as:

* “now evaluated in America/Los_Angeles”
* “added 1 calendar day”
* “applied startOfDay anchor”
* “shifted by 10 business days using Mon-Fri calendar”

The Explain panel must not introduce additional semantics or inferred corrections.

H00 Examples gallery UX

H01 Example categories

Provide an “Examples” section with categories aligned to the spec:

* Basics
* Anchors
* Business day shifting
* Business day counting
* Time zones and places
* Formatting transforms
* Errors

Each example is a clickable item that inserts the expression into the editor and evaluates immediately.

H02 Source of examples

The demo must load examples from `/reference_data\datecalc_reference_data\expression_fixtures.sample.json`. If the file is not available at runtime, the demo must fall back to a small embedded set.

H03 Fixture-driven verification

When an example is selected from fixtures, the output panel must display whether the current library result matches the expected fixture output. This is a key adoption feature for developers and a correctness check for the demo.

I00 Error message quality requirements

I01 Message characteristics

Error messages must be:

* single sentence, concrete, no filler
* actionable: either state what is wrong or what is expected
* stable: same input yields same message and code

I02 Hint presentation

Hints must be short and must include exact valid forms, for example:

* “Use ISO date YYYY-MM-DD, for example 2026-02-08.”
* “Time units require a time-of-day value; use now or a timestamp literal.”

I03 Common error cases the demo must showcase

The demo must include built-in example cases that trigger:

* invalid date literal with slashes
* unknown unit token
* applying `as time` to PlainDate
* place name used without resolver
* invalid IANA zone id

J00 Accessibility and interaction constraints

The demo must be keyboard-first:

* Tab order: header controls left-to-right, then editor, then output controls
* Enter evaluates immediately
* Escape closes tooltips or collapsibles
* All clickable example items must be reachable and activatable by keyboard

Tooltips must not trap focus.

K00 Performance requirements

Typing must remain responsive. The debounce evaluation must complete within 50ms for typical expressions. Tokenization and parsing must run on each evaluation; no incremental parsing is required in v1.

Large datasets must not be loaded by default. Only the small subset sample files in `/reference_data\datecalc_reference_data/` are loaded automatically. Any large datasets (timezone polygons) are out of scope for the demo UI and must not be loaded.

L00 Implementation notes for the coding agent

The codebase must be structured so the library can be imported and used unchanged in other environments. The demo must call the library facade first. Developer mode may call the lower-level APIs but must not replicate logic.

The demo must be implemented as vanilla HTML/JS/CSS with ES modules. The UI code must be heavily documented where it maps library outputs to UI behaviors, specifically:

* span highlighting rendering
* context control -> context object mapping
* fixtures loading and comparison
* developer mode views

The coding agent must use the following folder as local reference inputs:
`/reference_data\datecalc_reference_data/`
and may optionally consult:
`/reference_data\eartharoid_holidays/`
`/reference_data\nager_Nager.Date/`
`/reference_data\evansiroky_timezone-boundary-builder_releases_2025c/`
but the demo must not depend on the large boundary-builder datasets.

M00 UX workflows

M01 Workflow: evaluate basic arithmetic

User opens the demo. The editor is focused. They type `now + 1d`. After 200ms, output shows a ZonedDateTime. The output includes zone id and type. The Explain panel states that 1 calendar day was added.

M02 Workflow: fix an invalid date

User types `02/08/2026 + 1d`. Output shows ParseError with code for invalid date literal and highlights the exact span. The hint includes `2026-02-08`. User edits to ISO form. Error clears immediately and output shows PlainDate result.

M03 Workflow: enable place names

User types `now in Seattle`. With place names disabled, output shows an EvaluationError that resolver is missing and highlights “Seattle”. User toggles “Enable place names”. The expression re-evaluates and returns a ZonedDateTime in the resolved zone.

M04 Workflow: validate against fixtures

User opens Examples and clicks “Business day shift from weekend”. The expression is inserted. Output shows the result and a “Matches fixture” indicator. User modifies the expression; the fixture indicator switches to “Custom input” mode and stops comparing unless the user re-selects an example.

N00 Acceptance criteria checklist for the demo UX

The demo must satisfy all of the following:

The editor highlights library spans exactly and supports zero-length spans.

The output panel displays value type, formatted primary output, and context zone.

Context controls re-evaluate and are persisted.

Examples load from the provided fixture file and can be inserted with one action.

Developer mode shows tokens and AST spans from the library.

Place name support is gated behind a toggle and uses the provided local mapping file.

Holiday-aware calendar mode uses the provided local holiday JSON sample and affects business-day outcomes.

The demo never implements semantic rules outside the library and never requires network access.
