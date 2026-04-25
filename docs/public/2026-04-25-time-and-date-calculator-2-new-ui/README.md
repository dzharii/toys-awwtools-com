Pull request title: Build a deterministic vanilla date/time expression library and demo calculator for fast, trustworthy date math.

Users now get a **deterministic** date/time calculator that gives immediate, reliable results for common expressions like date shifts, anchors, business-day math, and zone changes, with precise span-based errors that make mistakes easy to fix.

This change delivers that value by separating language semantics into a reusable core library and keeping the browser UI as a thin consumer, so parsing, evaluation, formatting, and diagnostics are consistent across developer and end-user workflows.

The implementation adds a full expression engine under `lib/` and a production-style no-build demo app in `index.html`, `styles.css`, and `app/main.js`. The library facade in `lib/index.js` exposes `evaluateExpression` for common use while still exposing lower-level stages for debugging and adoption.

`lib/tokenize.js` and `lib/parse.js` introduce case-insensitive tokenization, controlled grammar parsing, and AST span preservation so the UI can render exact error highlights. `tokenize` and `parse` solve the core reliability problem of turning user input into structured, inspectable language state instead of ad hoc string handling.

`lib/evaluate.js` implements typed evaluation with deterministic context control (zone, now mode, business calendar, optional place resolver). `evaluateAst` and `createDefaultContext` provide strict type-safe behavior for calendar vs timeline arithmetic, business-day shifting/counting, anchors, transforms, and structured evaluation errors.

`lib/timezone.js` and `lib/business-calendar.js` provide the time semantics and calendar rules that users depend on for correctness, including IANA validation, DST-aware local/instant operations, ISO rendering, and holiday-aware business-day predicates. `lib/format.js` standardizes output shaping so success states stay stable and predictable.

The UI in `app/main.js` wires context controls, local fixture loading, debounced evaluation, and developer diagnostics directly to library outputs. Notable functions include `runEvaluation` for first-non-empty-line execution, `renderEditorHighlight` for exact span visualization, and `buildEvaluationOptions` for explicit context mapping without duplicating language rules in the front end.

This pull request also includes fixture-driven verification using the provided sample reference data, ensuring the delivered behavior matches expected outcomes for core expressions, error codes, and DST boundary cases.
