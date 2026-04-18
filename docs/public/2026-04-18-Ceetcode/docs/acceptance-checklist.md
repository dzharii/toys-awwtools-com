# Acceptance Checklist (suggestions002)

## Milestone status

1. Product shell complete: done.
2. Harness and run loop complete: done.
3. Worker architecture complete: done.
4. TCC feasibility checkpoint complete: done (documented in research).
5. Preferred TCC-to-Wasm path: not feasible with current evidence; browser-only fallback adopted.

## Key verification notes

- Static build: `npm run build` produces deployable static assets in `dist/`.
- Browser-only execution: compile/run handled by web workers and browser-hosted Wasm modules.
- Layout: left problem panel + right editor/results panel with responsive mobile toggle.
- Problem model: machine-readable function signatures and harness-driven tests.
- Draft persistence: per-problem localStorage persistence and last-opened restore verified in acceptance e2e.
- Compile/runtime/test distinction: separate states and UI labeling verified by acceptance e2e scenarios.
- Acceptance runner: `npm run test:acceptance` executes tagged critical scenarios.
- Browser error gate: acceptance tests fail on any `console.error` or uncaught `pageerror`.
- TCC checkpoint: explicit experiments and evidence recorded in `research/`.
