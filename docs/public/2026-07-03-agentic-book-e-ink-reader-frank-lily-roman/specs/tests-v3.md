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
