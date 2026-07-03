# UI Test Full Report (HTML) — template and instructions

This folder holds the **UI test full report** template: a self-contained,
human-viewable HTML report of an **Agentic UI Regression Analysis** run for the
E Ink Reader.

> Scope note: this is specifically the **UI regression full report** produced from
> a `.agent-runs/` run of the Playwright suite. It is **not** the app's RSS
> update feed (`feed.xml`), **not** `bugs-todo.md`, and **not** the per-run
> `summary.md` / `findings.md` markdown files. When someone asks for "the full
> report", "a full HTML report", or "preserve/create the report", they mean this.

This report is **optional**. It is not produced by normal test runs and is not a
CI artifact. Generate it only when a human explicitly asks for a full report, to
preserve a run for review, or to create a shareable HTML report.

---

## Files

- `report-template.html` — the authoritative HTML/CSS shell. The generator fills
  its `{{TOKENS}}` and `<!--SECTION-->` markers. **Edit styling/structure here**,
  never in a generated `report.html`.
- `README.md` — this file.

The generator that consumes the template:

```
ui-regression-test-suite/src/agentic/build-report.ts   (script: bun run agent:report)
```

---

## What the report contains

1. **Header + summary** — run id, seed, selection mode, pass/fail/skip counts,
   findings count.
2. **Methodology & decisions** — how the run was sampled and reviewed, and the
   Frank / Lily / Roman persona lenses used.
3. **Findings** — each classified finding (APP_BUG / TEST_BUG / HARNESS_TIMING /
   PRODUCT_DECISION / VISUAL_MANUAL_ONLY) with observation, mechanism, decision,
   fix, regression guard, and (optionally) **before/after evidence images**.
4. **Screenshot gallery** — every captured frame for all selected tests,
   correlated with its layout-snapshot facts (mode, progress, horizontal
   overflow).

**All images are embedded inline as base64 data URIs.** The resulting
`report.html` is fully self-contained: it opens correctly from any location and
does not depend on `file://` subresource access (which some browsers block).
Expect a large file (tens of MB for a 25-test run) — this is intentional and is
the price of portability. The report is written into the run's own (gitignored)
`.agent-runs/<run-id>/` folder and is never committed.

---

## How to produce a full report (precise, reproducible)

Run everything from `ui-regression-test-suite/`.

### 1. Produce a run to report on

Either use an existing run folder under `.agent-runs/`, or create a fresh,
reproducible one with an explicit seed:

```bash
cd ui-regression-test-suite
bun run agent:run -- --count=25 --seed=20260703 --do-not-fail-on-test-failure
```

This writes `.agent-runs/<timestamp>_seed-<seed>_count-<n>/` containing
`manifest.json`, per-test `screenshots/`, `snapshots/`, `dom/`, `diagnostics/`,
`summary.md`, and `findings.md`. The same `--seed` reproduces the same selection.

### 2. (Optional) Produce a "before" run for before/after evidence

To show before/after screenshots for a fix, generate a run **before** applying
the fix and keep its folder. After fixing, generate an **after** run with the
**same seed** so the same tests/steps line up:

```bash
# before fixing:
bun run agent:run -- --count=25 --seed=20260703 --do-not-fail-on-test-failure
# ...apply the app fix...
# after fixing:
bun run agent:run -- --count=25 --seed=20260703 --do-not-fail-on-test-failure
```

### 3. Curate the findings (once per report)

Findings shown in the report are authored in the `FINDINGS` array near the top of
`build-report.ts`. Each entry has: `id`, `severity`, `classification`, `title`,
`personas`, `observation`, `mechanism`, `decision`, `fix`, `regression`,
`status`, and optional `evidence` entries. Each `evidence` entry names a
screenshot **path relative to a run folder** and whether it belongs to the
`before` or `after` run. Update this array to match the run you are reporting.

Also update the `METHODOLOGY` string in the same file if the review approach
changed.

### 4. Build the report

```bash
bun run agent:report -- --run=<after-run-folder-name> --before=<before-run-folder-name>
```

- `--run` (optional) selects the run folder to report on; defaults to the latest
  folder in `.agent-runs/`.
- `--before` (optional) points at a pre-fix run; when present, the finding
  `evidence` images tagged `before` are pulled from it, and `after` images from
  the `--run` folder. Omit `--before` for a report without before/after pairs.

Example used for the reference report:

```bash
bun run agent:report -- \
  --run=2026-07-03T21-36-45-557Z_seed-20260703_count-25 \
  --before=2026-07-03T21-19-20-603Z_seed-20260703_count-25
```

The command prints the output path and size, e.g.:

```
report written: .../.agent-runs/<run-id>/report.html (24.6 MB)
```

### 5. Open and verify

Open `report.html` in a browser. Verify:

- Header shows the right run id / seed / counts.
- Findings render with before/after images visible (if `--before` was passed).
- The gallery shows **every** screenshot (no broken image icons) — because all
  images are inlined base64, none should be broken regardless of where the file
  is opened from.

---

## Editing the template

- Keep every `{{TOKEN}}` and `<!--SECTION-->` marker intact; the generator finds
  them by exact string match. The current markers are:
  - Tokens: `{{TITLE}}`, `{{RUN_ID}}`, `{{SEED}}`, `{{SELECTION_MODE}}`,
    `{{COUNT_SELECTED}}`, `{{COUNT_REQUESTED}}`, `{{TOTAL}}`, `{{PASSED}}`,
    `{{FAILED}}`, `{{SKIPPED}}`, `{{FINDINGS_COUNT}}`, `{{GALLERY_TEST_COUNT}}`,
    `{{REPRODUCE_COUNT}}`, `{{REPRODUCE_SEED}}`, `{{REPORT_CMD}}`.
  - Sections: `<!--METHODOLOGY-->`, `<!--FINDINGS_NOTE-->`, `<!--FINDINGS-->`,
    `<!--GALLERY-->`.
- If you add a new token/section to the template, add the matching replacement in
  `build-report.ts` (`tokens` / `sections` maps).
- Re-run `bun run typecheck` after editing `build-report.ts`.

---

## Constraints (must hold)

- The report is a **development artifact only**. It is not a runtime dependency of
  the static app and imports no application source.
- It must **never** contain real book content. Screenshots come from synthetic
  test fixtures only; do not point the generator at non-fixture content.
- Generated `report.html` and all `.agent-runs/` artifacts stay **gitignored** —
  do not commit them.
