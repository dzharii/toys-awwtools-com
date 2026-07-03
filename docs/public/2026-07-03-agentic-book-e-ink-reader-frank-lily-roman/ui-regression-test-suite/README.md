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

## Agentic UI Regression Analysis Mode

An **opt-in exploratory mode** (spec `../specs/tests-v3--Agentic-UI-Regression-Analysis-Mode.md`).
It randomly selects tests from the registry, runs each one individually with
extra instrumentation, and writes screenshots + telemetry into a **gitignored**
run folder so the agent can review what happened step by step.

```bash
bun run agent:discover        # (re)generate + validate src/agentic/test-registry.json
bun run agent:sample -- --count=25 --seed=184927   # preview a seeded selection
bun run agent:analyze          # select 25, run individually, capture artifacts
bun run agent:run -- --count=10 --seed=184927 --category=settings
bun run agent:report -- --run=<run-folder> [--before=<pre-fix-run-folder>]
```

Runner flags: `--count=N`, `--seed=N`, `--category=<folder>`, `--tag=<tag>`,
`--exclude-tag=<tag>`, `--no-balance`, `--list-only`, `--do-not-fail-on-test-failure`.

`agent:report` renders a self-contained, human-viewable `report.html` into a run
folder: run metadata, reviewer methodology and per-persona decisions, the
classified findings (with inlined before/after evidence when `--before` points
at a pre-fix run), and a browsable gallery of every captured screenshot
correlated with its layout-snapshot facts. It defaults to the latest run folder
if `--run` is omitted.

Artifacts land under `.agent-runs/<timestamp>_seed-<seed>_count-<n>/`:

```text
manifest.json            correlation map: test id -> status, steps, artifacts
selected-tests.json      the seeded selection (reproducible with --seed)
summary.md               human-readable run summary
findings.md              classification template the agent fills in
report.html              self-contained detailed report (via agent:report)
run.log                  per-test run log
playwright-results.json  combined Playwright JSON reports
tests/<TEST_ID>__<slug>/
  test.json  steps.json  test-output.txt
  screenshots/  NNN-<label>-after.png          (per meaningful action)
  snapshots/    NNN-<label>-after-layout.json  + -visible-elements.json [+ -accessibility.json]
  dom/          NNN-<label>-after.json          (content-safe, truncated)
  diagnostics/  console.json page-errors.json network.json storage.json oracle.json
```

Key properties:

- **Opt-in only.** All instrumentation is gated on `EINK_AGENTIC_ANALYSIS=1`.
  Normal `bun run test` is unchanged, fast, and writes no agentic artifacts.
- **Stable test IDs.** `src/agentic/test-registry.json` maps a `CATEGORY-NNN` id
  to every test (title/file/category/line). `agent:discover` regenerates it from
  the live Playwright test list and validates for duplicate/invalid ids.
- **Reproducible.** The random seed is recorded; re-passing `--seed` reproduces
  the exact selection (mulberry32 PRNG, category-balanced, without replacement).
- **Individual execution.** Each selected test runs in its own Playwright
  invocation (`--grep <exact title>`) with the `playwright.agentic.config.ts`
  overrides (`workers:1`, `retries:0`, `trace:on`, `screenshot:on`).
- **Content-safe.** DOM/element text is truncated; no full book content and no
  fixture markers are persisted anywhere the product would not persist them.
  `window.__einkReader` stays read-only and content-free.

Step capture is wired into the shared **flows** and key **page-object** actions
via `agentAutoCapture` (`src/framework/agentic/agent-step.ts`), plus a per-test
initial/final-state capture in the `makeApp` fixture. New tests can also call
`agentStep(...)` for explicit before/after step capture. The non-throwing
`collectOracleDiagnostics` mirrors the Standard Oracle for `oracle.json` without
changing normal test semantics.

### Handling findings

For every finding, classify before changing code: **APP_BUG** (fix the app,
keep/strengthen the test), **TEST_BUG** (fix the test), **HARNESS_TIMING**
(improve synchronization, not arbitrary sleeps), **PRODUCT_DECISION** (document
it), **VISUAL_MANUAL_ONLY** (record a manual review item + add the strongest
mechanical checks available). Search for the *family* of the problem, not just
the one symptom; promote repeated assertions into shared helpers/page objects.
Real app bugs go in `../bugs-todo.md` with a regression test that fails before
the fix. Never weaken a test just to make it pass, and never expose book content
for test convenience.

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
