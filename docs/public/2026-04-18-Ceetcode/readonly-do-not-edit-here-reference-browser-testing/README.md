# Browser Test Harness

This folder contains a reusable Playwright-based browser validation setup for the static explorer.

## What It Covers

- environment summary capture before the test run
- local static server startup and shutdown
- headless Chromium execution at `1920x1080`
- structured logging
- named screenshots
- per-test diagnostics JSON
- run manifest JSON with screenshot and diagnostics paths
- page-object-based explorer interactions
- conservative browser cleanup that avoids killing concurrent runs by default

## Current Environment Baseline

The harness was first validated in this environment:

- Debian GNU/Linux 13 on WSL2
- `bash`
- Node.js `v22.21.0`
- npm `11.8.0`
- Python `3.14.2`
- `apt-get` available
- no system Chrome or Chromium initially on `PATH`
- static-site entry point: `index.html`

Each run emits a fresh environment snapshot into `logs/` so the current machine state is recorded instead of guessed.

## Layout

- `tests/`: end-to-end acceptance tests
- `page-objects/`: explorer interaction model
- `utils/`: logging, environment summary, process cleanup, server control
- `scripts/`: static server and test runner
- `logs/`: run logs and environment snapshots
- `screenshots/`: named screenshots captured during runs
- `artifacts/`: Playwright HTML reports, traces, and test output

## Acceptance Scenarios

The current acceptance suite validates seven scenarios:

1. The static site loads from a local HTTP server and renders the main workspace.
2. Selecting a problem updates the detail pane and visible active state.
3. Quick views and search filters change the visible catalog.
4. The roadmap renders and can drive selection.
5. Solved state and notes persist across reload.
6. Topic guide navigation works.
7. The solution workspace opens with ordered languages, attribution, and annotations.

These scenarios are implemented in `tests/explorer.spec.js`.

## Artifacts

Expected artifacts from a normal run:

- `logs/<run-id>.log`
- `logs/<run-id>-environment.json`
- `screenshots/<run-id>-*.png`
- `artifacts/<run-id>/run-manifest.json`
- `artifacts/<run-id>/diagnostics/*.json`
- `artifacts/<run-id>/html-report/`
- `artifacts/<run-id>/test-results/`

## Run

Install dependencies and Chromium first:

```bash
npm install
npx playwright install --with-deps chromium
```

Run the suite:

```bash
npm run test:browser
```

Run only the documented acceptance scenarios:

```bash
npm run test:browser:acceptance
```
