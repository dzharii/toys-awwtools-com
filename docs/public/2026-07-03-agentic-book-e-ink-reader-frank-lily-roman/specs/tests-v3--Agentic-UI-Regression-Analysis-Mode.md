---

A00 Agentic UI Regression Analysis Mode

---

This document specifies a new exploratory UI regression mode for the E Ink Reader test suite.

The existing UI regression suite already tests the app through the browser DOM contract, using `data-testid` attributes, ARIA roles, a read-only `window.__einkReader` inspection handle, fixtures with stable markers, page objects, flows, and the Standard Post-Action Oracle. The suite is a development tool only and is not a runtime dependency of the static app.

The new mode must build on that architecture. It must not replace the normal Playwright suite. It must not weaken the existing tests. It must not import application source modules. It must not store book content in persistent app storage. It must not commit screenshots, traces, temporary reports, or generated analysis artifacts to the repository.

The new mode is called Agentic Analysis Mode.

Agentic Analysis Mode randomly selects 25 tests from the available Playwright test pool, runs each selected test individually, captures additional screenshots and telemetry, then produces a correlation map that lets the coding agent inspect what happened step by step. The agent then reviews the output as a product tester and developer, using the Frank, Lily, and Roman user perspectives.

The purpose is exploratory regression discovery. The agent is looking for visual issues, usability issues, untested gaps, flaky assertions, weak test assumptions, and real application bugs.

The main directive remains unchanged: the correct, usable, stable, user-friendly application is the goal. Test passing is not the goal by itself. Tests are instruments. If a test fails, the agent must decide whether the application is wrong, the test is wrong, the instrumentation is wrong, or the product expectation is unclear.

---

B00 Existing Suite Assumptions

---

The agent must preserve the current testing architecture.

The current suite uses Bun and Playwright, with scripts such as `test`, category-specific `test:<category>` commands, and `typecheck`. It already emits Playwright list, HTML, and JSON reports, with the JSON report written to `test-results/results.json`. The Playwright configuration keeps traces, screenshots, and videos on failure under normal runs.

The current suite is decoupled from product source. It talks to the app through `data-testid`, ARIA, and a read-only inspection handle. Page objects never construct pages, contexts, servers, or each other; the app factory wires them together.

The new mode must reuse these principles.

Agentic Analysis Mode may add test-suite code, wrapper scripts, reporters, fixtures, and optional instrumentation helpers. It may add stable `data-testid` attributes to product code if a real interactive element lacks one. It may add a read-only and content-safe inspection field if it improves the real app's diagnosability. It must not expose book content through `window.__einkReader`, logs, screenshots metadata, localStorage, IndexedDB, or test reports.

---

C00 User-Level Workflow

---

The coding agent runs one command.

Suggested command:

```text id="qpcfe2"
cd ui-regression-test-suite
bun run agent:analyze
```

The command performs this sequence:

```text id="h2n2g4"
1. Discover all Playwright tests in src/specs.
2. Build a stable registry of test IDs, titles, file paths, and category names.
3. Use a random-number generator to select 25 tests from the registry.
4. Persist the random seed and selected test list in a gitignored run folder.
5. Run each selected test individually.
6. Enable extra screenshots, step logging, DOM snapshots, layout snapshots, diagnostics, and oracle details for the run.
7. Write one folder per selected test.
8. Write a run manifest that maps test ID, title, file path, step IDs, screenshots, traces, logs, and result.
9. Write a human-readable summary.
10. Ask the agent to inspect the artifacts and classify findings.
```

A normal full-suite command must not produce this extra artifact volume.

Agentic Analysis Mode is an opt-in mode. It must be activated by an explicit environment variable or command flag. Normal CI and normal local runs should stay clean and fast.

---

D00 Required Commands

---

Add these scripts to `ui-regression-test-suite/package.json`.

```json id="t1o2hp"
{
  "agent:discover": "tsx src/agentic/discover-tests.ts",
  "agent:sample": "tsx src/agentic/sample-tests.ts",
  "agent:run": "tsx src/agentic/run-agentic-analysis.ts",
  "agent:analyze": "tsx src/agentic/run-agentic-analysis.ts --count=25",
  "agent:analyze:seed": "tsx src/agentic/run-agentic-analysis.ts --count=25 --seed"
}
```

If the suite does not use `tsx`, use Bun's TypeScript execution directly:

```json id="e5jjpn"
{
  "agent:discover": "bun src/agentic/discover-tests.ts",
  "agent:sample": "bun src/agentic/sample-tests.ts",
  "agent:run": "bun src/agentic/run-agentic-analysis.ts",
  "agent:analyze": "bun src/agentic/run-agentic-analysis.ts --count=25"
}
```

Use whichever fits the current Bun and TypeScript setup with less friction. Do not add unnecessary dependencies.

The required behavior matters more than exact script names. The final README and AGENTS appendix must document the chosen commands.

---

E00 Agentic Analysis Output Location

---

All generated artifacts must be ignored by git.

Use this folder:

```text id="v5ff0x"
ui-regression-test-suite/.agent-runs/
```

Add to `.gitignore`:

```text id="q3wz28"
ui-regression-test-suite/.agent-runs/
ui-regression-test-suite/test-results/
ui-regression-test-suite/playwright-report/
```

If `test-results/` and `playwright-report/` are already ignored, do not duplicate them unnecessarily.

Each run gets a unique directory:

```text id="d7vmgw"
ui-regression-test-suite/.agent-runs/2026-07-03T12-45-31-123Z_seed-184927_count-25/
```

The run folder contains:

```text id="p7wf37"
manifest.json
selected-tests.json
summary.md
findings.md
run.log
playwright-results.json
tests/
```

Each selected test gets its own folder:

```text id="admimi"
tests/
  TST-000124__settings-boundary-font-size/
    test.json
    steps.json
    screenshots/
      001-before-open.png
      002-after-open.png
      003-before-action.png
      004-after-action.png
    dom/
      001-before-open.html
      002-after-open.html
      003-after-action.html
    snapshots/
      001-layout.json
      002-layout.json
      003-accessibility.json
    diagnostics/
      console.json
      page-errors.json
      network.json
      storage.json
      oracle.json
      visible-elements.json
```

The exact filenames may be refined, but every artifact must be correlated by test ID and step ID.

---

F00 Test ID Requirement

---

Every test must have a stable hardcoded test ID.

The ID is used for artifact names, random sampling, reports, and agent analysis.

Use this format:

```text id="f3s1c8"
CATEGORY-NNN
```

Examples:

```text id="8zlenb"
SMOKE-001
FILES-014
TXT-009
MD-020
NAV-006
SET-011
SETB-004
RESP-008
A11Y-011
PRIV-010
EINK-005
PAIR-017
JOURNEY-008
META-003
RSS-002
RES-004
```

The test ID must be stored in a variable near the test definition.

Example:

```ts id="c55p2f"
const TEST_ID = "SETB-004";

test(`${TEST_ID} paragraph spacing boundary values keep prose readable`, async ({ app }) => {
  await agentStep(app, TEST_ID, "open-fixture", async () => {
    await app.flows.openFixture("standardMarkdown");
  });

  await agentStep(app, TEST_ID, "set-min-paragraph-spacing", async () => {
    await app.flows.applyPreferences({ paraSpacing: 0.2 });
  });
});
```

If a spec contains multiple tests, each test must have its own ID.

If a test is data-driven, the generated ID must include both the base ID and the row ID.

Example:

```ts id="5qexnw"
const TEST_ID = `PAIR-${String(index + 1).padStart(3, "0")}`;
```

For data-driven tests, the row definition must include a stable `caseId`. Do not let the ID depend on row order alone after the matrix is committed.

Example:

```ts id="hg8vqc"
{
  caseId: "PAIR-017",
  fixture: "romanLeetcodeBinarySearch",
  viewport: "mobileNarrow",
  mode: "scroll",
  theme: "high-contrast",
  font: "Atkinson Hyperlegible"
}
```

---

G00 Test Registry

---

Create a generated or maintained registry:

```text id="kpql5u"
ui-regression-test-suite/src/agentic/test-registry.json
```

The registry contains one entry per test.

Example entry:

```json id="igf02n"
{
  "id": "SETB-004",
  "title": "paragraph spacing boundary values keep prose readable",
  "file": "src/specs/settings/settings-boundary.spec.ts",
  "category": "settings",
  "tags": ["settings", "boundary", "layout"],
  "persona": ["Frank", "Lily"],
  "risk": ["layout", "readability"],
  "lastKnownStatus": "unknown"
}
```

The agent may generate this registry from Playwright's test list if practical. If automated discovery is unreliable, maintain it manually with a validation script that checks that each registered ID appears in source.

Add validation:

```text id="tojscn"
bun run agent:discover
```

The validation should detect:

```text id="oz5g5k"
Duplicate test IDs.
Missing test IDs.
Registry entries whose files no longer exist.
Tests without registry entries, if registry is manual.
Registry entries without matching tests.
Invalid ID format.
```

The registry must not become stale.

---

H00 Random Selection Requirements

---

Agentic Analysis Mode selects 25 tests by default.

Selection must use a real random number generator and record the seed. The seed must allow the exact same selected set to be reproduced.

Use CLI parameters:

```text id="fscmrx"
--count=25
--seed=184927
--category=settings
--tag=mobile
--exclude-tag=slow
--include-failed-last-run
--list-only
```

Required behavior:

```text id="6nsax7"
Default count is 25.
If count exceeds available tests, select all tests.
Sampling is without replacement.
The selected list is shuffled.
The seed is written to manifest.json.
The selected tests are written to selected-tests.json.
The user can reproduce the same run by passing the seed.
```

Sampling should be category-balanced by default if practical.

Preferred default sampling:

```text id="sq2dd2"
1. Load full registry.
2. Group by category.
3. Guarantee at least one test from as many categories as possible.
4. Fill remaining slots randomly from the whole pool.
5. Shuffle final selected list with the seeded RNG.
```

If category-balanced sampling adds too much complexity, use simple seeded random sampling first, then add balancing later. The design goal is broad exploratory coverage, not statistical purity.

---

I00 Individual Test Execution

---

Selected tests must run one by one, not as one batch.

Reason: the agent must correlate each test's console output, screenshots, trace, DOM snapshots, and step logs without cross-test noise.

Implementation options:

```text id="2xgghq"
Option A:
Run Playwright once per selected test using grep by exact test ID.

Option B:
Run Playwright once with a generated grep expression that includes all selected IDs, but configure reporter/instrumentation to split output per test.

Preferred:
Option A, because it creates cleaner per-test artifacts and simpler correlation.
```

Preferred command shape:

```text id="4n1xra"
bunx playwright test src/specs/settings/settings-boundary.spec.ts --grep "SETB-004" --reporter=json
```

The runner must continue after an individual test failure. It must record the failure and move to the next selected test.

At the end, the runner returns a non-zero exit code if any selected test failed, unless the command is explicitly run with:

```text id="7h9aqg"
--do-not-fail-on-test-failure
```

Use that flag only for exploratory sweeps where the agent wants a complete artifact set.

---

J00 Agentic Mode Activation

---

Agentic-only instrumentation must be silent during normal tests.

Use environment variables:

```text id="h0h6si"
EINK_AGENTIC_ANALYSIS=1
EINK_AGENTIC_RUN_DIR=/absolute/path/to/.agent-runs/<run-id>
EINK_AGENTIC_TEST_ID=SETB-004
EINK_AGENTIC_SCREENSHOTS=1
EINK_AGENTIC_DOM_SNAPSHOTS=1
EINK_AGENTIC_A11Y_SNAPSHOTS=1
EINK_AGENTIC_VISIBLE_ELEMENTS=1
EINK_AGENTIC_LAYOUT=1
EINK_AGENTIC_ORACLE_DETAILS=1
```

Normal tests run with all of these unset.

The test framework should expose:

```ts id="8yy9rg"
export const isAgenticAnalysis = process.env.EINK_AGENTIC_ANALYSIS === "1";
```

No agentic code should run unless this flag is true.

---

K00 Step Instrumentation

---

Introduce a wrapper for test steps.

Suggested file:

```text id="d1a4d5"
ui-regression-test-suite/src/framework/agentic/agent-step.ts
```

Suggested API:

```ts id="akjwbg"
export async function agentStep(
  app: UiTestApp,
  testId: string,
  stepId: string,
  action: () => Promise<void>,
  options?: AgentStepOptions
): Promise<void>;
```

Required behavior in normal mode:

```text id="wjs9tw"
Run the action.
Do not write files.
Do not take extra screenshots.
Do not add noise.
```

Required behavior in agentic mode:

```text id="nguewl"
1. Record step start timestamp.
2. Capture before screenshot if configured.
3. Capture before DOM/layout snapshot if configured.
4. Run Playwright test.step with a readable name.
5. Execute the action.
6. Wait for app readiness or post-action settling if requested.
7. Capture after screenshot.
8. Capture after DOM/layout/accessibility/visible-elements snapshots.
9. Run Standard Post-Action Oracle or record the oracle if caller requests it.
10. Record step status, duration, errors, attachments, and notes.
```

Step ID format:

```text id="tbxwsk"
001-open-app
002-open-fixture
003-switch-to-scroll
004-change-font-size
005-check-oracle
```

Artifact names must include both test ID and step ID.

Example:

```text id="0cgr11"
SETB-004__003-change-para-spacing__after.png
SETB-004__003-change-para-spacing__layout.json
SETB-004__003-change-para-spacing__visible-elements.json
```

Do not rely on Playwright's default screenshot names alone. They are not sufficiently correlated for agent analysis.

---

L00 Screenshot Requirements

---

Screenshots are required for agentic runs.

Capture at minimum:

```text id="o2z5l5"
Before first user action.
After fixture/file load.
After each settings change.
After each mode change.
After each page turn or scroll action.
After each expected error message.
After each viewport change.
After final oracle.
On failure, immediately at failure point.
```

Use full-page screenshots only when needed. Prefer viewport screenshots for UI analysis because they match what the user sees.

Recommended options:

```ts id="8lomg1"
await page.screenshot({
  path,
  fullPage: false,
  animations: "disabled"
});
```

If disabling animations hides the E Ink effect under inspection, take a second screenshot with animations enabled only for E Ink tests.

For E Ink tests, use two screenshots:

```text id="anps5x"
after-action-settled.png
during-transition.png, if reliable and not flaky
```

Do not force flakiness by trying to catch an exact animation frame unless the app exposes deterministic transition state.

---

M00 DOM Snapshot Requirements

---

Capture DOM snapshots only in agentic mode.

Use sanitized DOM snapshots.

Do not write entire book content into artifact files if the fixture contains large content. Since test fixtures are synthetic, the privacy risk is lower, but the suite should model the product's privacy discipline.

Snapshot strategy:

```text id="fel4s4"
Capture document title.
Capture html/body attributes.
Capture data-testid tree.
Capture visible role/name summary.
Capture reader root outerHTML with text truncated.
Capture settings panel outerHTML when open.
Capture notice/toast text.
Capture progress text.
Capture first N visible content snippets, truncated.
Do not capture full source fixture content.
```

Suggested truncation:

```text id="qhljgk"
Max text per element: 160 characters.
Max elements: 300.
Max DOM snapshot file size: 500 KB.
```

If a full DOM snapshot is needed for a specific debugging run, gate it behind:

```text id="81qh95"
EINK_AGENTIC_FULL_DOM=1
```

Full DOM snapshots must still go into the gitignored run folder.

---

N00 Layout Snapshot Requirements

---

Capture layout snapshots in JSON.

Suggested fields:

```json id="z86jgx"
{
  "viewport": { "width": 1280, "height": 900 },
  "document": {
    "bodyScrollWidth": 1280,
    "bodyClientWidth": 1280,
    "hasHorizontalOverflow": false
  },
  "openScreen": {
    "visible": false,
    "box": null
  },
  "reader": {
    "visible": true,
    "mode": "paged",
    "theme": "warm-paper",
    "eink": "balanced",
    "motion": "system",
    "box": { "x": 0, "y": 0, "width": 1280, "height": 900 }
  },
  "content": {
    "box": { "x": 312, "y": 88, "width": 656, "height": 720 },
    "fontFamily": "Literata",
    "fontSize": "20px",
    "lineHeight": "31px",
    "maxWidth": "68ch"
  },
  "page": {
    "progressText": "Page 3 of 18",
    "nextEnabled": true,
    "prevEnabled": true
  },
  "settings": {
    "visible": false,
    "box": null
  },
  "overlays": {
    "busyVisible": false,
    "einkOverlayVisible": false,
    "toastVisible": false
  }
}
```

Use this snapshot to help the agent detect negative padding, collapsed panels, bad viewport overflow, stuck overlays, missing progress, wrong mode, and settings clipping.

---

O00 Visible Elements Snapshot

---

Create a visible-elements snapshot.

Purpose: the agent should know what interactive elements and reader surfaces were visible at each step without manually parsing raw DOM.

Suggested file:

```text id="sg0jls"
visible-elements.json
```

Suggested contents:

```json id="l9oc4c"
{
  "buttons": [
    { "testId": "reader-button-next", "text": "Next", "visible": true, "enabled": true },
    { "testId": "reader-button-settings", "text": "Settings", "visible": true, "enabled": true }
  ],
  "inputs": [
    { "testId": "settings-range-font-size", "type": "range", "visible": true, "value": "20" }
  ],
  "regions": [
    { "testId": "reader-region", "visible": true },
    { "testId": "settings-region-dialog", "visible": false }
  ],
  "links": [
    { "text": "Updates", "href": "feed.xml", "visible": true }
  ],
  "notices": [
    { "testId": "open-screen-status-notice", "text": "This file type is not supported..." }
  ]
}
```

Collect elements by:

```text id="wbyl77"
[data-testid]
button
input
select
textarea
a[href]
[role]
dialog
main
article
```

Do not include full book content. Truncate text.

---

P00 Accessibility Snapshot

---

Capture accessibility snapshots where useful.

Use for:

```text id="8bjape"
Open screen tests.
Settings tests.
Keyboard tests.
Responsive settings tests.
Accessibility tests.
Journey final states.
```

Use Playwright's accessibility snapshot if available in the current version. If not available or deprecated, use role/name locators and visible-elements snapshot as fallback.

The snapshot should help answer:

```text id="bztxai"
Can Lily find the open-file action?
Can Lily understand the current error?
Can Frank navigate settings without noise?
Can Roman identify code-related controls and reader state?
Is the settings dialog discoverable as a dialog?
Do major controls have accessible names?
```

Keep accessibility snapshots in the run folder only.

---

Q00 Diagnostics Requirements

---

For each selected test, capture:

```text id="o9ckf2"
console.json
page-errors.json
network.json
storage.json
oracle.json
test-output.txt
steps.json
```

Console diagnostics:

```json id="bo7t7m"
{
  "errors": [],
  "warnings": [],
  "logs": []
}
```

Page errors:

```json id="xdrcj4"
{
  "pageErrors": []
}
```

Network diagnostics:

```json id="tsn9pd"
{
  "externalRequests": [],
  "allRequestsCount": 14,
  "blockedRequests": [],
  "unexpectedRequests": []
}
```

Storage diagnostics:

```json id="2ka7fo"
{
  "localStorageKeys": ["eink-reader:preferences"],
  "containsFixtureMarkers": false,
  "indexedDbAvailable": true,
  "cacheStorageAvailable": true
}
```

Oracle diagnostics:

```json id="4p7jt3"
{
  "passed": true,
  "checks": [
    { "name": "no page errors", "passed": true },
    { "name": "no horizontal overflow", "passed": true },
    { "name": "no book content in storage", "passed": true }
  ]
}
```

If the existing oracle only throws assertions, add a non-throwing diagnostic collector that can be called in agentic mode to write detailed check results before or after the normal throwing assertion.

Normal test semantics must remain unchanged. If oracle fails, the test fails.

---

R00 Playwright Trace And Video

---

In agentic mode, prefer retaining trace and screenshot artifacts for every selected test, not only failures.

Add a Playwright config override or per-run command option.

Possible approach:

```text id="mpfkty"
Use an alternate config file:
playwright.agentic.config.ts
```

Agentic config:

```ts id="25h9vs"
export default defineConfig({
  ...baseConfig,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: process.env.EINK_AGENTIC_RUN_DIR + "/playwright-results.json" }]],
  use: {
    ...baseConfig.use,
    trace: "on",
    screenshot: "on",
    video: "retain-on-failure"
  }
});
```

Use `workers: 1` for agentic runs. Individual tests are run one by one anyway, and deterministic artifacts matter more than speed.

Do not change the normal Playwright config unless necessary. Normal runs should remain fast and clean.

---

S00 Agentic Run Manifest

---

Create `manifest.json` in each run folder.

Example:

```json id="i48k0n"
{
  "schemaVersion": 1,
  "runId": "2026-07-03T12-45-31-123Z_seed-184927_count-25",
  "createdAt": "2026-07-03T12:45:31.123Z",
  "seed": 184927,
  "countRequested": 25,
  "countSelected": 25,
  "selectionMode": "category-balanced-random",
  "git": {
    "branch": "main",
    "commit": "unknown",
    "dirty": true
  },
  "environment": {
    "os": "win32",
    "node": "v22.x",
    "bun": "1.x",
    "playwright": "1.x"
  },
  "tests": [
    {
      "id": "SETB-004",
      "title": "paragraph spacing boundary values keep prose readable",
      "file": "src/specs/settings/settings-boundary.spec.ts",
      "category": "settings",
      "status": "passed",
      "durationMs": 4201,
      "folder": "tests/SETB-004__paragraph-spacing-boundary-values",
      "steps": [
        {
          "id": "001-open-fixture",
          "status": "passed",
          "screenshots": ["screenshots/001-open-fixture-after.png"],
          "layout": "snapshots/001-open-fixture-layout.json"
        }
      ]
    }
  ]
}
```

The manifest is the main correlation document. The agent should use it to navigate artifacts.

---

T00 Summary And Findings Files

---

Create `summary.md`.

Required sections:

```text id="mtjxd9"
Run ID.
Seed.
Selected test count.
Passed count.
Failed count.
Skipped count.
List of selected tests.
Artifact folder.
Potential findings requiring review.
Instructions for reproducing the run.
```

Create `findings.md`.

Initial template:

```md id="b26bia"
# Agentic Analysis Findings

Run: <run-id>
Seed: <seed>

---

## Review Checklist

- [ ] Open manifest.json.
- [ ] Review failed tests first.
- [ ] Review screenshots for every selected test.
- [ ] Review layout snapshots for overflow, clipping, stuck overlays, and invalid state.
- [ ] Review console/page/network/storage diagnostics.
- [ ] Review from Frank perspective.
- [ ] Review from Lily perspective.
- [ ] Review from Roman perspective.
- [ ] Classify findings as APP_BUG, TEST_BUG, HARNESS_TIMING, PRODUCT_DECISION, or VISUAL_MANUAL_ONLY.
- [ ] Add real app bugs to bugs-todo.md.
- [ ] Fix application bugs before weakening tests.
- [ ] Fix incorrect tests when tests are wrong.
- [ ] Re-run targeted tests.
- [ ] Re-run full validation when fixes are done.

---

## Findings

### Finding 001

Classification:
Test ID:
Step ID:
Persona:
Evidence:
Decision:
Action:
Status:
```

The runner may create the template. The coding agent fills it during analysis.

---

U00 Persona Review Instructions

---

Agentic Analysis Mode is not only mechanical. The agent must inspect artifacts through user perspectives.

Use these personas.

Frank:

```text id="o7itkb"
Serious reader.
Cares about long-form comfort, typography, focus, credible E Ink experience, privacy, and not being forced into a generic web page.
Review screenshots for visual calm, readable page width, sensible progress, non-distracting controls, and believable reader behavior.
```

Lily:

```text id="lrcd9l"
Occasional reader with less software troubleshooting experience.
Cares about smoothness, obvious actions, calm errors, easy recovery, and no confusing intermediate states.
Review screenshots for whether she can tell what happened and what to do next.
```

Roman:

```text id="msvbqg"
Experienced software engineer using Markdown developer notes, code snippets, links, and mobile review.
Cares about code block containment, technical Markdown readability, local/offline correctness, diagnostics, no content persistence, and predictable controls.
Review screenshots and logs for code readability, mobile overflow, safe link behavior, and trustworthy diagnostics.
```

Optional fourth lens:

```text id="tu2wh9"
Accessibility reviewer.
Cares about focus, keyboard paths, reduced motion, visible controls, labels, contrast, and motion comfort.
```

For each selected test, the agent should ask:

```text id="y82s15"
What would Frank notice?
What would Lily misunderstand?
What would Roman distrust?
Would an accessibility reviewer find a blocker?
Is this an application issue, a test issue, a product decision, or only visual manual review?
```

Do not overfit to one persona. If a UI change helps Roman but confuses Lily, prefer progressive disclosure or advanced diagnostics.

---

V00 Additional Assertions Only In Agentic Mode

---

Some assertions are too expensive or too noisy for every normal test but useful during agentic analysis.

Enable these only when `EINK_AGENTIC_ANALYSIS=1`.

Additional assertions:

```text id="u0z888"
Every visible interactive element has data-testid.
Every visible button has accessible name.
Every visible link has text or aria-label.
No element has negative width or height.
No visible element has NaN-like style values.
No fixed overlay covers the reader after settling.
No settings control is outside viewport when settings is open.
No content element creates body horizontal overflow.
No code block creates body horizontal overflow.
No remote image element exists for Markdown remote images.
No script, iframe, object, or embed exists inside rendered Markdown content.
No fixture marker exists in localStorage.
No fixture marker exists in window.__einkReader serialized output.
No fixture marker exists in diagnostics output.
```

If these agentic assertions find a real product issue, convert the assertion into a normal regression test in the appropriate category.

Agentic-only assertions are a discovery tool. They are not a substitute for stable regression tests.

---

W00 Screenshot Review Expectations

---

The agent must inspect screenshots for qualitative problems that normal assertions may miss.

Look for:

```text id="hj5xb9"
Blank reader.
Open screen and reader overlapping.
Settings dialog clipped.
Text too small on mobile.
Text escaping paper surface.
Code block causing horizontal page overflow.
Progress missing or misleading.
Toast covering important controls.
Error message too technical.
Control labels unclear.
Theme contrast too low.
Dark theme text unreadable.
E Ink overlay stuck or too dark after settling.
Paper texture too visually noisy.
RSS/open-screen link distracting or broken.
Mobile landscape unusable.
```

If a screenshot reveals a visible problem and no test failed, this is exactly the value of Agentic Analysis Mode. The agent must then add or strengthen a normal regression test where possible.

If the issue is aesthetic and cannot be robustly automated, record it as a manual visual finding.

---

X00 Flakiness Handling In Agentic Mode

---

Agentic Mode will reveal flaky tests more clearly because it runs individual tests with extra instrumentation.

When a selected test fails intermittently:

```text id="atx5wf"
1. Re-run the same test with the same seed and exact grep.
2. Re-run it three times individually.
3. Inspect screenshots, trace, steps.json, console, layout, and oracle output.
4. Decide whether the application is racing or the test is racing.
5. Fix the real source.
```

Acceptable application refactors for stability:

```text id="pnoeye"
Expose a content-safe readiness flag.
Serialize settings updates.
Cancel stale pagination generations.
Make E Ink transition cleanup deterministic.
Ensure busy overlay always clears in finally blocks.
Ensure file-open rejection does not destroy current reader.
Add data-testid to interactive elements.
Improve focus return after dialogs.
```

Unacceptable changes:

```text id="e2wbll"
Expose book content in window.__einkReader.
Disable real user-facing animation only for tests.
Make tests pass by hiding real UI bugs.
Add arbitrary waits everywhere without understanding the race.
Remove meaningful assertions because they fail.
Commit generated screenshots or traces.
```

The agent must use judgment. A flaky test can be a symptom of a flaky application. The goal is not to silence flakiness. The goal is to determine whether the user can experience unstable behavior and then fix the right layer.

---

Y00 Git Hygiene

---

No agentic artifacts may be committed.

Add or verify gitignore entries:

```text id="ulwzf2"
ui-regression-test-suite/.agent-runs/
ui-regression-test-suite/test-results/
ui-regression-test-suite/playwright-report/
ui-regression-test-suite/blob-report/
```

The only files committed should be source files, specs, test helpers, config, documentation, and fixture source definitions.

Generated fixtures may be committed only if the project already commits `tests/fixtures/` as part of normal test assets. Agentic run screenshots, logs, traces, videos, and analysis reports must not be committed.

The runner should print a warning if the run folder is outside `.agent-runs/`.

---

Z00 AGENTS.md Appendix Text

---

Add this appendix to the end of `AGENTS.md` after the existing automated UI regression sections.

````md id="t6zk8u"
---

V00 Agentic UI Regression Analysis Mode

---

The repository supports an exploratory Agentic Analysis Mode for the UI regression suite.

Normal test runs remain the main regression gate:

```text
cd ui-regression-test-suite
bun run typecheck
bun run test
bun run validate
````

Agentic Analysis Mode is different. It randomly selects 25 tests from the full Playwright test registry, records the random seed, runs the selected tests one by one, and writes extra screenshots, layout snapshots, DOM summaries, visible-element inventories, console/page/network/storage diagnostics, oracle details, traces, and per-step logs into a gitignored run folder.

Use it when looking for subtle UI regressions, visual issues, flaky tests, weak assertions, or gaps that normal assertions did not catch.

Run:

```text
cd ui-regression-test-suite
bun run agent:analyze
```

To reproduce a previous selection:

```text
cd ui-regression-test-suite
bun run agent:run -- --count=25 --seed=<seed>
```

Artifacts are written to:

```text
ui-regression-test-suite/.agent-runs/
```

This folder must remain gitignored. Do not commit screenshots, traces, videos, temporary reports, or generated analysis logs.

The agent must inspect each selected test's artifacts through the product personas:

```text
Frank: serious reader, long-form comfort, typography, credible E Ink feel.
Lily: occasional reader, smoothness, obvious controls, calm errors, no confusion.
Roman: experienced software engineer, Markdown developer notes, code blocks, links, mobile review, local/offline trust.
Accessibility reviewer: focus, keyboard, contrast, reduced motion, accessible names.
```

For every finding, classify it before changing code:

```text
APP_BUG: the application is wrong. Fix the application and keep or strengthen the test.
TEST_BUG: the test is wrong. Fix the test.
HARNESS_TIMING: the test observes too early or races app readiness. Improve synchronization.
PRODUCT_DECISION: the expected behavior is ambiguous. Use the specs and best judgment, then document the decision.
VISUAL_MANUAL_ONLY: the issue is aesthetic and cannot be reliably asserted by DOM tests. Record it for manual review.
```

The main directive remains application correctness. Passing tests are not the goal by themselves. A green test suite is valuable only when it protects a correct, stable, usable, private, local-first reader. If a test fails because the app is wrong, fix the app. If a test fails because the test is wrong, fix the test. If the test is flaky, investigate whether the flakiness reflects a real user-visible race before changing the test.

Do not weaken tests merely to make them pass. Do not modify application behavior only to satisfy a bad test. Use best judgment, inspect the screenshots and logs, and make the product better.

Agentic Analysis Mode may add read-only diagnostics and test instrumentation, but it must never expose book content through logs, localStorage, IndexedDB, Cache Storage, screenshots metadata, or `window.__einkReader`. The inspection handle must remain content-safe.

After any application or test fix found through Agentic Analysis Mode, run the relevant targeted test, then run:

```text
bun run validate
```

If a real application bug is discovered, record it in `bugs-todo.md` and keep the failing or newly added test that documents the expected behavior.

````

---

AA00 Implementation Checklist

---

The implementation is complete when all of these are true:

```text id="du8v2p"
Agentic run folder exists under ui-regression-test-suite/.agent-runs/.
.agent-runs is gitignored.
Every Playwright test has a stable hardcoded test ID.
A test registry exists and can detect duplicate or missing IDs.
The runner can select 25 seeded random tests without replacement.
The selected test list is persisted.
Each selected test runs individually.
The runner continues after individual failures and records them.
Every selected test gets a folder correlated by test ID.
Screenshots are captured per step in agentic mode.
DOM summaries are captured per step in agentic mode.
Layout snapshots are captured per step in agentic mode.
Visible-element inventories are captured per step in agentic mode.
Console, page error, network, storage, and oracle diagnostics are captured.
Playwright trace is retained for selected tests in agentic mode.
manifest.json maps test IDs to artifacts.
summary.md is generated.
findings.md template is generated.
Normal test runs remain clean and do not write agentic artifacts.
Normal test timing is not made slower by agentic instrumentation.
No artifact contains persisted book content beyond synthetic fixture text visible in screenshots.
window.__einkReader remains read-only and free of book content.
README documents the agentic commands.
AGENTS.md includes the Agentic UI Regression Analysis Mode appendix.
bun run typecheck passes.
bun run test passes.
bun run agent:analyze completes a 25-test run.
The same seed reproduces the same selected test list.
````

If this mode finds a real bug while being implemented, fix the application if the application is wrong. Fix the test if the test is wrong. Add the finding to `bugs-todo.md` only when it is a real app bug or a product observation worth keeping.

---

AB00 Final Directive

---

Agentic Analysis Mode exists to help the agent see what ordinary assertion-driven tests may miss.

It should make the agent slower and more observant on purpose. It should give the agent screenshots, layout facts, visible controls, console output, network behavior, storage state, and oracle results for randomly selected tests. It should encourage the agent to reason like a user and like a developer at the same time.

The agent must not confuse test success with product success. A test can be wrong. A test can be too weak. A test can pass while the screen looks bad. A test can fail because it revealed a real user-visible race.

The correct application is the priority. The test suite exists to protect that correctness.


---

AC00 Result Handling And Follow-Up Work Appendix

---

Agentic Analysis Mode does not end when a random exploratory run finishes.

The run produces evidence: screenshots, step logs, traces, layout snapshots, DOM summaries, visible-element inventories, console diagnostics, network diagnostics, storage diagnostics, oracle results, and failure output. The agent must use that evidence to improve the application, the tests, or the testing framework.

The result of an exploratory run must always be converted into one of these outcomes:

```text
1. Application fix.
2. Test enhancement.
3. Test framework enhancement.
4. New regression test.
5. Refactor of related test coverage.
6. Product decision documented as known behavior.
7. Known bug recorded for later work.
8. Manual visual review item.
9. No action, with a clear reason.
```

Do not treat the exploratory run as passive observation. If it reveals a meaningful issue, act on it.

The main directive remains application correctness and user experience. Tests exist to protect the product. The application is not written to satisfy tests. Tests are written to prove that user requirements, product constraints, privacy expectations, accessibility expectations, and reading experience expectations are satisfied.

---

AD00 Finding Classification Workflow

---

For every finding from Agentic Analysis Mode, classify it before changing code.

Use this sequence:

```text
1. Identify the exact test ID and step ID.
2. Open the screenshots, layout snapshot, DOM summary, oracle output, console output, network output, and storage output.
3. Describe what the user would see.
4. Describe what the test expected.
5. Decide whether the issue is in the application, the test, the fixture, the framework, or the product expectation.
6. Search for related tests, related UI paths, related settings, and related fixtures.
7. Decide whether the fix should be local, shared, or product-wide.
8. Implement the smallest correct fix that improves the application or the suite without hiding the real issue.
9. Re-run the targeted test.
10. Re-run related tests.
11. Re-run the full validation suite when the change is stable.
12. Update documentation, coverage notes, bugs-todo.md, or test-suite README if behavior or framework capability changed.
```

Do not fix only the one visible failure if the root cause exists elsewhere.

If one settings test lacks a surrounding-state check, inspect all settings tests. If one Markdown test lacks a code-block containment check, inspect all Markdown and Roman developer-note tests. If one responsive test misses horizontal overflow, inspect all responsive tests and the shared oracle. If one journey misses storage validation, inspect all journeys.

The agent must look for the family of the problem, not only the single symptom.

---

AE00 When A Test Is Lacking

---

If the exploratory run shows that a test is too weak, enhance the test.

A weak test may pass while the screenshot shows a visible problem. A weak test may assert only one local detail while ignoring broken surrounding UI. A weak test may check that a button exists but not that the action preserves the reader. A weak test may load a fixture but not verify that important Markdown elements rendered correctly.

When a weak test is found, do this:

```text
1. Improve the specific test.
2. Search for similar tests.
3. Apply the same improvement pattern where appropriate.
4. Move repeated assertions into shared helpers or page objects.
5. Add a framework-level helper if the same assertion belongs to many tests.
6. Update the test-suite documentation so future tests use the stronger pattern.
7. Re-run the modified tests and related category.
```

Example:

```text
Finding:
A mobile code-block test checks only that the marker is visible.

Correct response:
Add assertions for code block containment, no body horizontal overflow, line-number visibility if implemented, and reader state validity. Then inspect other Markdown, Roman, responsive, and pairwise tests that open code-heavy fixtures. Move code-block checks into a shared CodeBlockPage object or markdown assertion helper.
```

Do not paste custom one-off assertions into many files when a shared helper would make the suite more consistent.

---

AF00 When The Application Is Wrong

---

If the application is wrong, fix the application.

Application bugs include visible UI breakage, privacy violations, unsafe Markdown behavior, missing recovery paths, unreadable layouts, broken settings, incorrect state persistence, inaccessible controls, unexpected network requests, stuck overlays, broken responsive behavior, or confusing errors.

When fixing the application, the agent must analyze related functionality before editing.

Use this checklist:

```text
1. Which user journey is affected?
2. Which persona is affected: Frank, Lily, Roman, accessibility reviewer, or all?
3. Is this a local defect or a shared architectural issue?
4. Does the same behavior exist in page mode and scroll mode?
5. Does it affect desktop, tablet, mobile, or all viewports?
6. Does it affect TXT, Markdown, code-heavy Markdown, or unsafe Markdown?
7. Does it affect settings, navigation, file loading, privacy, or E Ink transitions?
8. Could fixing it change the expected behavior of existing tests?
9. Should the fix be made in product code, shared UI logic, parser logic, renderer logic, settings logic, or CSS?
10. Does the fix require a new regression test?
```

Do not make hidden product changes just to satisfy a test. Make product changes because they improve correctness, stability, privacy, accessibility, or user experience.

If a small bug reveals a larger design weakness, consider refactoring. If the refactor is safe and improves the product, do it. If the refactor is large and risky, document the issue in `bugs-todo.md` or a product decision note and add a narrow test that protects current behavior.

---

AG00 When The Test Framework Is Lacking

---

Some findings indicate missing framework capability rather than a single test problem.

Examples:

```text
Repeated tests need code-block containment checks.
Many settings tests need the same adaptive baseline comparison.
Several responsive tests need settings-panel viewport checks.
Multiple journeys need storage and network diagnostics.
Several tests need screenshot-step correlation.
Line-number checks need a reusable CodeBlockPage object.
```

When this happens, improve the framework.

Framework improvements may include:

```text
Shared page objects.
Shared assertion helpers.
Adaptive baseline profiles.
Visible-element snapshots.
Layout snapshots.
Markdown assertion helpers.
Line-number assertion helpers.
Storage privacy scanners.
Network guards.
Error-message assertion helpers.
Fixture-marker utilities.
Step-screenshot correlation utilities.
```

After adding framework functionality, update all relevant tests to use it. Do not leave similar tests with inconsistent approaches unless there is a clear reason.

Update the test-suite documentation after adding shared functionality.

Recommended documentation file:

```text
ui-regression-test-suite/README.md
```

If the README already exists, update it. If it does not, create it.

The README must explain:

```text
How the suite is organized.
How to run normal tests.
How to run Agentic Analysis Mode.
How test IDs work.
How step screenshots are correlated.
How adaptive baselines work.
How to add fixtures.
How to add page objects.
How to add new assertions.
How to classify failures.
How to avoid leaking book content.
How to decide whether to fix app code or test code.
```

The testing framework should become more capable over time. Every exploratory run should make it easier to catch the next regression.

---

AH00 Similarity Search Requirement

---

Before applying a fix, search for similar tests and similar product paths.

The agent must not patch one test and leave the same weakness in five other places.

For every finding, search by:

```text
Test category.
Page object method.
Fixture name.
Preference key.
DOM test ID.
Helper function.
Error message.
Reader mode.
Viewport class.
Markdown element type.
Persona journey.
```

Examples:

```text
If a settings test lacks storage checks, search all settings tests and pairwise tests that apply preferences.

If a Markdown code test lacks line-number checks, search all tests that open code-heavy fixtures.

If mobile layout overflows in one journey, search responsive tests, Roman journey tests, pairwise mobile rows, and Markdown table/code tests.

If a file rejection leaves stale notice state, search all file rejection tests and Lily recovery journey tests.

If an error message is too technical, search all error-copy assertions and all tests that expect rejection or fallback.
```

If similar tests should share the same helper, refactor.

If similar tests intentionally differ, document the difference in the test or helper.

---

AI00 Related Functionality Review Requirement

---

Every fix must include a related-functionality review.

The agent must ask:

```text
What else could this change affect?
What else uses this helper?
What else uses this preference?
What else uses this fixture?
What else uses this UI component?
What else uses this parser path?
What else uses this mode switch?
What else uses this overlay?
What else uses this storage key?
```

Then run relevant related tests, not only the failing test.

Example:

```text
Change:
Fix code block overflow on mobile.

Related tests to run:
markdown code tests.
Roman developer-note journey.
responsive mobile tests.
pairwise rows with mobile + code-heavy Markdown.
privacy tests for code-heavy markers.
settings tests for font size and measure.
```

Example:

```text
Change:
Fix settings dialog clipping on mobile landscape.

Related tests to run:
responsive settings tests.
accessibility focus tests.
keyboard shortcut suppression tests.
Lily journey.
pairwise mobile landscape rows.
```

The full suite must be run after related fixes stabilize.

---

AJ00 Research Requirement

---

The agent should use existing project knowledge first. If the issue is clear, fix it based on the specification, source code, and current test behavior.

If the issue is unclear, research it.

Research is required when the agent is unsure about:

```text
Browser behavior.
Playwright behavior.
Accessibility behavior.
CSS layout behavior.
Reduced motion behavior.
RSS or metadata requirements.
Markdown parsing or sanitization behavior.
Font loading behavior.
Storage APIs.
Security implications.
Cross-browser behavior.
```

Use primary sources when possible: browser documentation, Playwright documentation, relevant standards, official library documentation, or existing project documentation.

Research must be purposeful. Do not browse randomly. Do not introduce new dependencies merely because a search result suggests them. The project remains static at runtime and local-first.

If research changes the implementation plan, document the reason in the relevant test, README section, or product note.

---

AK00 Product-Correctness Priority

---

Every test-suite improvement must serve product correctness.

The agent must assume the role of a user of the application. If the app feels broken, confusing, unsafe, visually poor, or unstable in screenshots, that matters even if assertions pass.

The agent must inspect the product from multiple viewpoints:

```text
Frank: Would a serious reader keep using this for long reading sessions?
Lily: Would an occasional user understand what happened and what to do next?
Roman: Would an experienced engineer trust this for code-heavy Markdown notes?
Accessibility reviewer: Can the app be used with keyboard, reduced motion, and readable contrast?
```

If an issue is not explicitly written in the requirements but is clearly harmful to usability, privacy, stability, safety, accessibility, or reading quality, the agent should fix it or document it as a known issue.

Do not ignore clear problems because they were not specified. Specifications guide the work; they do not excuse poor product behavior.

---

AL00 Known Behavior And Known Bug Handling

---

Not every finding should be fixed immediately.

Some issues are small but may require broad architectural changes. Some behaviors may be acceptable product decisions. Some changes may create more risk than benefit in the current pass.

When the agent decides not to fix something immediately, it must record the decision.

Use `bugs-todo.md` for real application bugs and product observations.

Each item should include:

```text
Status.
Finding classification.
Test ID.
Step ID.
Evidence location.
Expected behavior.
Actual behavior.
Why it is not fixed now, if deferred.
Risk.
Suggested future fix.
Related tests.
```

Do not hide known bugs.

Do not mark a real issue as a test problem because it is inconvenient.

Do not create a known-bug item for every harmless implementation detail. Use judgment.

---

AM00 Regression Strengthening After A Fix

---

Every real application bug fix must produce or strengthen a regression test.

Process:

```text
1. Reproduce the issue manually or through the failing exploratory test.
2. Write or update a deterministic regression test that fails before the fix.
3. Fix the application.
4. Verify the test passes.
5. Run related tests.
6. Run the full suite.
7. Update bugs-todo.md.
8. Update test-suite README if a new pattern or helper was introduced.
```

If the bug is visual and hard to automate, add the strongest mechanical checks available and record a manual visual review item.

Example:

```text
Visual issue:
E Ink ghosting looks too heavy in strong mode.

Automated protection:
Verify overlay clears, ghost opacity is within expected computed bounds, text remains visible, and no body overflow occurs.

Manual item:
Review strong E Ink screenshot for readability and comfort.
```

---

AN00 Test Enhancement After A Test Gap

---

Every confirmed test gap should improve the suite beyond the local failing spot.

Process:

```text
1. Identify the missing assertion.
2. Decide whether the assertion belongs in a specific test, page object, helper, oracle, or adaptive baseline.
3. Search for similar tests.
4. Apply the assertion pattern to all relevant tests.
5. Add or update documentation.
6. Run related tests.
7. Run the full suite.
```

Example:

```text
Gap:
One test checks only that settings open, but screenshot shows clipped controls on mobile.

Correct fix:
Add responsive settings helper that checks close button, primary controls, no horizontal overflow, and panel scrollability. Use it in all responsive settings tests and in Lily/Roman journeys.
```

---

AO00 Test Suite README Requirement

---

Create or maintain:

```text
ui-regression-test-suite/README.md
```

The README must be updated whenever the framework gains a new reusable feature.

Required sections:

```text
Project purpose.
Normal test commands.
Agentic Analysis Mode commands.
Test ID convention.
Fixture marker convention.
Page object convention.
Standard Post-Action Oracle.
Adaptive baseline profiles.
Screenshot and artifact policy.
How to add a test.
How to add a fixture.
How to add a page object.
How to add a shared assertion.
How to classify failures.
How to handle flaky tests.
How to handle product bugs.
How to handle test bugs.
How to update bugs-todo.md.
Privacy rules for tests and diagnostics.
Git hygiene for generated artifacts.
```

The README should be practical. It should help the next agent modify the suite without rediscovering the architecture.

---

AP00 AGENTS.md Appendix Addition

---

Add this text to the existing Agentic UI Regression Analysis Mode appendix in `AGENTS.md`.

````md id="bvfveg"
---

W00 Handling Findings From Agentic Analysis

---

Agentic Analysis Mode is not only a reporting mode. Its results must be used to improve the application, the tests, or the test framework.

For every finding, first classify the issue:

```text
APP_BUG
TEST_BUG
HARNESS_TIMING
PRODUCT_DECISION
VISUAL_MANUAL_ONLY
````

Then decide the correct action.

If the application is wrong, fix the application. If the test is wrong, fix the test. If the framework lacks a reusable assertion or helper, improve the framework. If the behavior is ambiguous, make a product decision and document it.

Do not patch only the one visible failure when similar failures may exist elsewhere. Search for related tests, related fixtures, related page objects, related settings, related UI controls, and related product paths. Apply the fix consistently. If the same assertion belongs in many tests, move it into a helper, page object, oracle extension, or adaptive baseline.

The agent must always ask:

```text
Where else does this behavior exist?
Which other tests should be strengthened?
Which related product paths could break in the same way?
Should this be a shared framework feature instead of a one-off assertion?
Does this change require a new fixture, a new helper, or README documentation?
```

Tests serve product correctness. The application is not written to satisfy tests. Tests are written to prove that user requirements are satisfied. If a test passes but the screenshot shows a confusing, broken, unsafe, or unusable experience, treat that as a real finding.

If a clear issue is not explicitly specified but harms the user experience, privacy, safety, accessibility, stability, or reading quality, fix it or document it as known behavior. Use best judgment.

If the cause is unclear, research it. Use project documents first. Use browser, Playwright, accessibility, CSS, security, or library documentation when needed. Prefer primary sources.

After any fix:

```text
1. Re-run the targeted test.
2. Re-run related tests.
3. Re-run the relevant category.
4. Re-run the full validation suite when stable.
5. Update bugs-todo.md for real application bugs or product observations.
6. Update ui-regression-test-suite/README.md when framework behavior changes.
```

The priority remains a correct, stable, local-first, private, usable E Ink Reader. A green suite is useful only when it protects that product quality.

```

---

AQ00 Final Directive

---

The exploratory run is valuable only if it changes future behavior.

If it finds an app bug, fix the app and add regression protection.

If it finds a weak test, strengthen the test and related tests.

If it finds repeated missing logic, improve the framework.

If it finds a confusing product behavior, make a product decision and document it.

If it finds a visual issue that cannot be automated, record a manual review item and add mechanical checks where possible.

Always prefer product correctness, user experience, privacy, stability, accessibility, and maintainability over local test convenience.

```
