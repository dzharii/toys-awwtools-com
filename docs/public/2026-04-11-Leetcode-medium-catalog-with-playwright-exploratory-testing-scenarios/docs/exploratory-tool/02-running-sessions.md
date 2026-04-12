# Running Exploratory Sessions

## Stable Acceptance First

Run the stable suite before guided exploration unless you are intentionally doing ad hoc inspection.

```bash
npm run test:browser:acceptance
```

## Guided Sessions

Run the default desktop sweep:

```bash
npm run test:browser:explore
```

Run the content-expansion sweep:

```bash
npm run test:browser:explore:content
```

Run a charter directly with custom intent:

```bash
node browser-tests/scripts/run-exploratory-session.js \
  --charter explorer-content-expansion-sweep \
  --baseline skip \
  --intent "Review the new solution workspace as a study surface" \
  --question "Does attribution feel explicit?|Is the code pane pleasant to read?"
```

Useful flags:

- `--baseline acceptance|skip`
- `--intent "..."`
- `--question "Q1|Q2|Q3"`
- `--headed`

## REPL Mode

Start an ad hoc session:

```bash
npm run test:browser:repl
```

Common commands:

- `snapshot`
- `checkpoint <label>`
- `screenshot <label>`
- `note <text>`
- `select <problem-id>`
- `search <text>`
- `quick <view-id>`
- `roadmap`
- `roadmap-select <problem-id>`
- `guide`
- `solutions`
- `solution-language <label>`
- `reset`
- `exit`

## Session Artifact Layout

Each guided session writes to:

```text
browser-tests/exploratory/sessions/<run-id>-<session-slug>/
  environment.json
  manifest.json
  report.md
  session.log
  screenshots/
```

Each acceptance run writes to:

```text
browser-tests/logs/<run-id>.log
browser-tests/logs/<run-id>-environment.json
browser-tests/screenshots/<run-id>-*.png
browser-tests/artifacts/<run-id>/run-manifest.json
browser-tests/artifacts/<run-id>/diagnostics/*.json
browser-tests/artifacts/<run-id>/html-report/
```

## Screenshot Naming

Guided exploratory screenshot names follow:

```text
<run-id>-<session-slug>-<step-number>-<step-slug>.png
```

Acceptance screenshots follow:

```text
<run-id>-<stage>-<scenario>.png
```

This keeps screenshots sortable and avoids accidental collisions between runs.

## Cleanup Policy

The harness still records browser processes before and after each run, but automatic forced cleanup is disabled by default.

Why:

- diff-based process killing is unsafe when multiple Playwright sessions overlap
- `browser.close()` and `context.close()` should handle the normal path
- preserving unrelated concurrent sessions is more important than aggressive cleanup

To re-enable forced cleanup explicitly:

```bash
BROWSER_TEST_FORCE_KILL_LEFTOVERS=1 npm run test:browser:acceptance
```
