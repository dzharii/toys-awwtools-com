# Exploratory Testing Notes

This note records the exploratory-testing layer added on top of the stable Playwright acceptance harness, plus the concrete findings from using it against the current explorer.

## Why This Exists

Acceptance tests are intentionally stable and narrow.

They answer:

- does the site load?
- do the main flows still work?
- did the app regress functionally?

They do **not** fully answer:

- what does the page feel like while moving through it?
- does a narrowed state still look intentional?
- did a local fix create a broader visual or state-management inconsistency nearby?
- are there runtime errors that still happen even if the main assertions pass?

That gap is what the exploratory layer is for.

## What Was Created

### Reusable Guided Session Runner

- `browser-tests/scripts/run-exploratory-session.js`
- `browser-tests/utils/exploratory-session.js`
- `browser-tests/exploratory/charters/explorer-desktop-sweep.json`
- `browser-tests/exploratory/charters/explorer-content-expansion-sweep.json`

This runner:

- can execute a reusable action-driven charter
- can optionally run the acceptance suite first
- starts its own local server and browser session
- captures ordered screenshots with deterministic names
- writes a markdown report
- writes a machine-readable manifest
- records explicit observations
- includes anti-tunnel-vision prompts at each step
- records session intent, per-step intent, action history, and review questions

### Exploratory REPL

- `browser-tests/scripts/exploratory-repl.js`

This is for ad hoc use when a scripted charter is too rigid.

It keeps the same artifact model but allows manual commands such as:

- `snapshot`
- `checkpoint <label>`
- `screenshot <label>`
- `note <text>`
- `select <problem-id>`
- `search <text>`
- `quick <view-id>`
- `roadmap-select <problem-id>`
- `guide`

### Session Artifact Model

Each exploratory run writes to:

- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/report.md`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/manifest.json`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/environment.json`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/session.log`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/screenshots/*.png`

Screenshot names follow:

- `<run-id>-<session-slug>-<step-number>-<step-slug>.png`

That makes them reproducible, sortable, and easy to reference from reports.

## Anti-Tunnel-Vision Design

The key idea is that every step has:

- a primary focus
- explicit intent
- the recorded action list
- explicit “look around” prompts
- optional review questions
- a state snapshot
- a screenshot

This is meant to stop the review from degenerating into “the click worked, move on.”

The tool deliberately reminds the reviewer to also scan:

- surrounding layout
- stale state
- clipping and overflow
- spacing consistency
- whether the page still reads like one coherent tool

## Session Run Against This Project

The current guided charter used here is:

- `browser-tests/exploratory/charters/explorer-desktop-sweep.json`
- `browser-tests/exploratory/charters/explorer-content-expansion-sweep.json`

Latest completed session used for this note:

- `browser-tests/exploratory/sessions/2026-04-11t22-06-56.335z-explorer-content-expansion-sweep/`

It covered:

1. landing after catalog expansion
2. a newer linked-list problem
3. a graph-counting problem
4. the solution workspace
5. a prefix-sums search state
6. the prefix-sums topic guide

## What The Exploratory Tool Found

### 1. Page-object base URL coupling bug

The first exploratory runner failed because the page object only worked under Playwright Test's configured `baseURL`.

Fix made:

- `browser-tests/page-objects/explorer-page.js` now accepts an explicit `baseUrl`
- `browser-tests/utils/exploratory-session.js` passes that base URL in raw browser sessions

### 2. Uncaught runtime errors in the app

The exploratory run surfaced uncaught page errors:

- `Cannot set properties of undefined (setting 'scrollTop')`

Root cause:

- `app.js` tried to manage `catalogScroll` and `detailScroll` without caching those elements in `els`

Fix made:

- added `catalogScroll` and `detailScroll` to the cached element map in `app.js`

### 3. Acceptance suite was too forgiving about page errors

The acceptance harness previously logged page errors and console errors, but it did not fail on them.

That is not a good long-term policy.

Fix made:

- `browser-tests/tests/explorer.spec.js` now records browser console errors and uncaught page errors
- each acceptance test now fails if either list is non-empty

This makes the stable suite materially stronger.

### 4. Single-result search state looked suspicious and was investigated

The “decode ways” narrow-result screenshot looked like it might have a large dead gap caused by stale scroll or layout stretch.

What was done:

- reviewed the screenshot directly
- added scroll-reset behavior on workspace-signature changes in `app.js`
- ran targeted exploratory probes
- measured the live DOM for the catalog container and phase-group positions

Conclusion:

- there was a real stale-scroll/runtime issue in the earlier state-management code, and that is now fixed
- the remaining narrow-result appearance is largely the normal visual result of having one phase group with one row inside a tall desktop pane
- after DOM measurement, this did **not** justify another product change by itself

### 5. Content expansion exposed a sparse-result design weakness

After the catalog grew and the new prefix-sums path was added, the content-focused charter made the single-result search state look too empty again.

Fix made:

- `app.js` now adds a focused-view helper card when the visible slice is very small
- the helper card explains the narrow state and offers nearby alternatives plus a reset action
- `styles.css` now gives that helper block a deliberate visual treatment instead of leaving the catalog as a mostly blank pane

This was not a functional bug, but it was still a product-quality issue, and the exploratory pass was useful specifically because acceptance would never have caught it.

### 6. Concurrent-run cleanup turned out to be too aggressive

Running acceptance and exploratory sessions at the same time revealed that diff-based process cleanup could kill another still-active Playwright session.

Fix made:

- `browser-tests/utils/process-cleanup.js` now defaults to logging leftover browser processes instead of force-killing them
- aggressive cleanup is opt-in via `BROWSER_TEST_FORCE_KILL_LEFTOVERS=1`

This matters for reuse because exploratory review is often most useful right after or alongside other browser automation.

## Current Judgment

The exploratory layer is now useful enough to reuse in other web projects because it provides:

- a repeatable guided charter mode
- an ad hoc REPL mode
- deterministic artifacts
- explicit observation capture
- anti-tunnel-vision prompts
- a stronger link between acceptance and exploratory review

For this specific site, the latest judgment after the guided sweep is:

- acceptance behavior is green
- no uncaught page errors remain in the tested flows
- concurrent acceptance plus exploratory execution no longer interferes
- topic-guide navigation works
- roadmap selection works
- the solution workspace is attributable and visually stable in the checked path
- the narrow-result state is functionally stable

## Commands

Run stable acceptance:

```bash
npm run test:browser:acceptance
```

Run the guided exploratory sweep:

```bash
npm run test:browser:explore
```

Run the content-expansion exploratory sweep:

```bash
npm run test:browser:explore:content
```

Run ad hoc exploratory REPL:

```bash
npm run test:browser:repl
```
