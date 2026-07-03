# E Ink Reader — UI Regression Test Suite

Automated Playwright + Bun UI regression tests for the E Ink Reader app. This
suite automates the manual test plan in `../specs/tests-manual-plan-v01.md` and
follows the architecture in `../doc_automated_testing_plan.md`.

> This suite is a **development tool only**. The app itself has no runtime
> dependency on npm, Bun, Playwright, or any build step.

## Requirements

- [Bun](https://bun.sh) 1.3+
- Node 18+ (Playwright runtime)
- Chromium (installed via Playwright)

## Setup

```bash
cd ui-regression-test-suite
bun install
bunx playwright install chromium
```

## Running

```bash
bun run test                # full suite (198 tests)
bun run test:smoke          # one category
bun run test:offline        # cross-origin-blocked runtime checks
bun run test:resilience     # missing-asset degradation checks
bun run typecheck           # tsc --noEmit (no product code is imported)
bun run validate            # typecheck + full suite
```

Categories: `smoke`, `files`, `txt`, `markdown`, `metadata`, `rss`,
`navigation`, `settings`, `responsive`, `accessibility`, `privacy`, `offline`,
`resilience`, `eink`, `pairwise`, `journeys`.

See [`COVERAGE.md`](./COVERAGE.md) for the full category-to-behavior matrix
(198 tests across 32 spec files).

## How it works

The suite talks to the app **only through its DOM contract** — never by importing
app source:

- `data-testid` attributes on every interactive element
- ARIA roles / labels
- a read-only `window.__einkReader` inspection handle (paginator index, scroll
  fraction, file-open hook) that never carries book content

Every action ends with the **Standard Post-Action Oracle**
(`src/framework/support/oracle.ts`), which enforces global invariants after each
step: no page/console errors, no stuck busy or E Ink overlay, open-screen XOR
reader, valid preference enums, no horizontal overflow, only the single
preferences key in `localStorage`, no book content persisted, and no unexpected
network requests.

Gap-closure specs additionally use an **adaptive surrounding-state baseline**
(`src/framework/support/baseline.ts` + `adaptive-baseline.ts`): before an action
they snapshot app state, then after it assert that only the fields the chosen
profile permits changed while all hard invariants stayed stable.

## Layout

```text
src/config/       product-contract constants (enums, ranges, error copy, viewports)
src/framework/    app factory, page-object base, timeouts, diagnostics,
                  storage/network guards, oracle, base-test
src/page-objects/ open-screen, reader, settings, toast, busy
src/flows/        reusable multi-step actions (open file, apply prefs,
                  switch mode, reload)
src/specs/        one folder per test category
scripts/          make-fixtures.mjs (regenerates ../tests/fixtures/)
```

## Fixtures

Fixtures live in `../tests/fixtures/` and each carries a unique text marker
(e.g. `FIXTURE_LONG_BOOK_CH1`). Tests assert against markers, not brittle text
blocks. To add or change fixtures, edit `scripts/make-fixtures.mjs`, regenerate,
then record the marker in `src/framework/support/fixtures.ts`:

```bash
bun scripts/make-fixtures.mjs
```

## Adding tests

1. New interactive element in the app → add a `data-testid` (see the naming
   convention in `../AGENTS.md`, section U00).
2. Extend or add a page object under `src/page-objects/`.
3. Add a spec under the matching `src/specs/<category>/` folder, importing
   `{ test, expect }` from `src/framework/test/base-test.ts` and ending with
   `expectStandardOracle`.
4. If a test fails due to a real app bug, record it in `../bugs-todo.md` and keep
   the test.
