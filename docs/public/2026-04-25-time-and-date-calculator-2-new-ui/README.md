Pull request title: Build a fixed-context vanilla date/time expression library and demo calculator for fast, trustworthy date math.

Users now get a **fixed-context** date/time calculator that gives immediate, reliable results for common expressions like date shifts, anchors, business-day math, weekday resolution, US holidays/observances, humanized formatting, and zone changes, with precise span-based errors that make mistakes easy to fix.

This change delivers that value by separating language semantics into a reusable core library and keeping the browser UI as a thin consumer, so parsing, evaluation, formatting, and diagnostics are consistent across developer and end-user workflows.

The implementation adds a full expression engine under `lib/` and a production-style no-build demo app in `index.html`, `styles.css`, and `app/main.js`. The library facade in `lib/index.js` exposes `evaluateExpression` for common use while still exposing lower-level stages for debugging and adoption.

`lib/tokenize.js` and `lib/parse.js` introduce case-insensitive tokenization, controlled grammar parsing, and AST span preservation so the UI can render exact error highlights. `tokenize` and `parse` solve the core reliability problem of turning user input into structured, inspectable language state instead of ad hoc string handling.

`lib/evaluate.js` implements typed evaluation with deterministic context control (zone, now mode, business calendar, holiday calendar, observance calendar, optional place resolver). `evaluateAst` and `createDefaultContext` provide strict type-safe behavior for calendar vs timeline arithmetic, business-day shifting/counting, anchors, transforms, weekdays, holidays, and structured evaluation errors.

`lib/timezone.js`, `lib/business-calendar.js`, `lib/weekday.js`, and `lib/us-holidays.js` provide the time semantics and calendar rules that users depend on for correctness, including IANA validation, DST-aware local/instant operations, ISO rendering, weekday math, federal observed-date rules, common US observances, and holiday-aware business-day predicates. `lib/format.js` and `lib/humanize.js` standardize output shaping so success states stay stable and predictable.

Useful examples now include:

```txt
now + 3 hours as relative
90 seconds as duration words
2026-02-08 as ordinal date
next Tuesday
Thanksgiving 2026
actual Independence Day 2026
Monday after Thanksgiving 2026
first business day after Thanksgiving 2026
```

The UI in `app/main.js` wires context controls, local fixture loading, debounced evaluation, and developer diagnostics directly to library outputs. Notable functions include `runEvaluation` for first-non-empty-line execution, `renderEditorHighlight` for exact span visualization, and `buildEvaluationOptions` for explicit context mapping without duplicating language rules in the front end.

This pull request also includes fixture-driven verification using the provided sample reference data, ensuring the delivered behavior matches expected outcomes for core expressions, error codes, and DST boundary cases.

## Testing

Run the core library test suite with Bun:

```bash
bun test
bun test --coverage
```

Regression test failures are signals that observable core functionality changed. Treat each failure as something to investigate and resolve, but not as proof that the change is automatically wrong: if a breaking behavior change is truly required, update the affected fixture or assertion deliberately and document why.
