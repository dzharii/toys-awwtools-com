# 2026-04-18 Acceptance Browser Audit

## Scope

This audit reviewed the critical acceptance behaviors from `suggestions002.md` using Playwright browser tests focused on real user interaction flows in the Ceetcode UI.

Primary goals:
- verify critical end-to-end acceptance scenarios are covered,
- enforce browser console/runtime cleanliness,
- capture visual and UI-state evidence for each scenario,
- identify and fix defects discovered by the acceptance run.

## Coverage implemented

Acceptance tests now validate:
- shell render quality (problem panel, editor panel, controls, content sections),
- run workflow progress and success summary,
- failed test reporting with explicit expected/actual values,
- compile diagnostics with severity and line/column metadata,
- runtime failure path separated from compile failure path,
- custom test parse validation and official-test isolation,
- per-problem draft persistence plus last-opened problem restore,
- mobile view tab switching with editor content preservation.

## Browser diagnostics policy

The acceptance suite now:
- captures browser `console.error` events,
- captures uncaught `pageerror` events,
- captures `requestfailed` diagnostics,
- fails tests automatically when any console/page errors are present.

Each test also attaches:
- full-page screenshot,
- JSON snapshot of key UI state.

## Defects found and fixed

### Defect 1: Failed assertions were misclassified as runtime errors

Observed during acceptance run:
- A deliberately wrong solution should have produced `Tests Failed` with harness mismatch details.
- Actual behavior was `Runtime Error`.

Root cause:
- The generated harness returned non-zero exit code when any test failed.
- The runtime adapter treated non-zero process exit as a run failure and never returned the harness summary path to UI test-result rendering.

Fix:
- Updated harness generator to return `0` unconditionally so assertion mismatches remain in the harness result channel.
- Runtime traps (e.g., abort/unreachable) still surface as runtime failures.

Changed file:
- `runtime/harness/generate-harness.ts`

## Validation results

Commands run after fixes:
- `npx tsc --noEmit`
- `npm run test:acceptance`
- `npm run test:e2e`

Result:
- all commands passed,
- acceptance tests: 8/8 passing,
- no browser `console.error` or uncaught page errors in passing runs.
