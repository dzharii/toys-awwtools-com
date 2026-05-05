# 00-agent-project-brief-and-architecture.md

## Specification

We build static web app: **JSON Table Inspector**. User pastes arbitrary JSON or JSONL from jobs, APIs, logs, or batch outputs. App turns that data into readable spreadsheet-like table. Main value: user can quickly find failures, bad rows, missing fields, errors, suspicious values, and export visible data. JSON is hierarchical; humans need flat scan view. This app gives automatic table lens over arbitrary JSON.

This file is chunk `00` of multi-chunk implementation plan. Scope here: define project rules, architecture, constraints, folder structure, agent workflow, coding standards, testing standards, build rules, and future chunk boundaries. Do not build full app here. Build enough foundation files if missing, but main output is project governance and architecture.

This chunk matters because future coding agents will work in limited context windows. Each later spec depends on stable rules from this file. Agent must read this file before any other chunk. This file is source of truth for “what are we building” and “how must code be shaped.”

## Product goal

Build local-first, dependency-free, static web app.

User flow:

1. User opens app in browser.
2. User pastes JSON or JSONL.
3. App detects input shape.
4. App chooses likely row source.
5. App flattens records into table.
6. App highlights likely failures.
7. User filters/sorts/scans rows.
8. User expands row for original JSON.
9. User copies or exports visible table.

The app is not generic JSON tree viewer. It is not full spreadsheet. It is **failure-first JSON-to-table inspection tool**.

Core success case:

Input:

```json
{
  "jobId": "batch-123",
  "items": [
    { "id": 1, "success": true, "durationMs": 120 },
    { "id": 2, "success": false, "error": { "code": "E_TIMEOUT", "message": "Timed out" } }
  ]
}
```

Expected app behavior later:

```text
Detected rows: items[] · 2 rows · confidence high
Columns: id, health, success, error.code, error.message, durationMs
Failures: 1
```

User sees failure row fast.

## Non-goals

Do not build server.
Do not add external dependencies.
Do not require upload.
Do not call network APIs.
Do not use React/Vue/Svelte/etc.
Do not make AI/LLM feature.
Do not build editable spreadsheet.
Do not mutate original JSON silently.
Do not hide original data. Full row JSON must remain available later.

## Technical constraints

Use static website:

```text
HTML
CSS
JavaScript modules
Bun for scripts/build/tests
No runtime dependencies
No package dependencies unless later spec explicitly allows
```

Use modern browser APIs.

Allowed:

```text
ES modules
Custom elements
CSS custom properties
CSS grid/flex
localStorage
Blob download
Clipboard API with fallback
Bun test
```

Avoid:

```text
framework dependencies
npm libraries
minified/mangled output
server-only APIs
eval/new Function
remote font/CDN
```

## UI framework rule

Mandatory: use vendored RetroOS UI framework as primary UI system.

Expected framework location:

```text
src/vendor/retroos-ui-v001
```

or current repo equivalent, based on existing project layout.

Agent must inspect actual framework exports before coding against tags. Use existing component names and exported constants where available.

Use RetroOS components for:

```text
app shell
window/chrome
panels
toolbar
status bar/status strip
buttons
inputs
textareas
checkboxes/selects
tabs/lists/dialogs/alerts
```

Custom CSS allowed only for app-specific layout/table/grid behavior or tiny gaps framework cannot cover.

Do not replace RetroOS look with generic modern SaaS styling.

Framework can be modified only when change is generic and useful to framework, not app-specific. Example allowed: bug fix in `AwwPanel` sizing. Example not allowed: adding `JsonTableInspectorPanel` into vendor framework.

When modifying framework:

```text
Keep API generic.
Do not bake JSON/table domain into framework.
Update demo/docs if relevant.
Avoid breaking existing components.
```

## Design direction

Visual language: retro desktop utility. Dense but readable. App should feel like small OS tool, not dashboard.

Principles:

```text
One main task visible.
Controls grouped.
Diagnostics nearby.
Advanced details hidden by default.
Table readable before decorative.
Failure scanning prioritized.
```

Do not use loud Excel-like rainbow table themes. Use restrained tones:

```text
neutral surfaces
subtle headers
thin grid lines
clear focus ring
danger/warning/success badges
muted null/missing values
```

## Architecture overview

Use layered architecture. UI must not own parsing semantics. Core logic must be testable without DOM.

Target module groups:

```text
src/app/
  main.js
  state.js
  constants.js

src/core/
  parse-input.js
  walk-json.js
  detect-row-source.js
  flatten.js
  profile-columns.js
  detect-failures.js
  export-table.js

src/ui/
  render-shell.js
  render-input.js
  render-detection.js
  render-table.js
  render-row-details.js
  render-status.js

src/styles/
  app.css
  table.css

src/examples/
  sample-root-array.json
  sample-object-results.json
  sample-jsonl.txt
  sample-nested-failures.json

test/
  parse-input.test.js
  detect-row-source.test.js
  flatten.test.js
  detect-failures.test.js
  export-table.test.js
```

Actual repo may differ. Agent may adapt structure, but preserve separation:

```text
core = pure functions, no DOM
ui = DOM rendering/events
app = orchestration/state
styles = presentation
vendor = RetroOS framework
```

## Data pipeline

Future app pipeline:

```text
input text
  -> parseInput()
  -> findRowSourceCandidates()
  -> chooseRowSource()
  -> flattenRows()
  -> profileColumns()
  -> scoreRowHealth()
  -> render table
  -> filter/sort/export visible view
```

Core data contracts should stay plain objects.

Suggested eventual parse contract:

```js
{
  ok: true,
  kind: "json" | "jsonl",
  root,
  lineItems?: [],
  warnings: []
}
```

Suggested error contract:

```js
{
  ok: false,
  kind: "json" | "jsonl" | "unknown",
  error: {
    code: "E_PARSE_JSON",
    message: "...",
    line: 12,
    column: 5,
    snippet: "..."
  }
}
```

Suggested row source candidate:

```js
{
  path: ["results"],
  pathLabel: "results[]",
  rowCount: 200,
  itemKind: "object",
  confidence: "high",
  score: 92,
  reasons: [
    "largest array",
    "items are mostly objects",
    "repeated keys found"
  ]
}
```

Suggested flat column:

```js
{
  path: ["error", "code"],
  key: "error.code",
  label: "error.code",
  coverage: 17,
  types: { string: 17, missing: 183 },
  sampleValues: ["E_TIMEOUT", "E_VALIDATION"],
  failureRelevance: 10,
  hiddenByDefault: false
}
```

Suggested table row:

```js
{
  index: 1,
  source: originalItem,
  values: {
    "id": "abc",
    "success": false,
    "error.code": "E_TIMEOUT"
  },
  health: {
    level: "failure",
    score: 100,
    reasons: ["success=false", "error.code present"]
  }
}
```

These contracts are guidance, not hard code for chunk `00`. Later chunks may refine, but must keep same spirit.

## State model

Future app state should be central and serializable where reasonable.

Suggested state fields:

```js
{
  inputText: "",
  parseResult: null,
  rowSourceCandidates: [],
  selectedRowSourcePath: null,
  flattenOptions: {},
  columns: [],
  rows: [],
  visibleColumnKeys: [],
  filters: {},
  sort: null,
  selectedRowIndex: null,
  ui: {
    inputCollapsed: false,
    leftPaneWidth: null,
    rightTopHeight: null,
    density: "compact",
    wrapCells: false
  }
}
```

Persist only user preferences and input if safe:

```text
pane sizes
input collapsed
density
wrap
last input text if app already does this and no privacy issue warning needed
selected display options
```

Do not persist derived huge tables if avoidable.

## Build rules

Use Bun.

Required scripts by final chunk:

```json
{
  "scripts": {
    "dev": "bun run ...",
    "build": "bun run ...",
    "test": "bun test"
  }
}
```

Readable bundle required. No minify. No mangle.

Build output should be inspectable:

```text
dist/
  index.html
  assets/app.js       readable
  assets/app.css      readable
  vendor/...          if copied separately
```

Bun may bundle modules, but output must remain readable enough for review. Prefer sourcemaps if useful. Do not obfuscate.

## Testing rule

Each implementation chunk must add or update tests for core logic it touches.

Testing hierarchy:

```text
Pure logic tests first.
DOM smoke tests only when cheap.
Manual checklist for UI behavior.
```

Use Bun test for core modules.

Every chunk must run:

```bash
bun test
```

If build exists:

```bash
bun run build
```

If app runnable:

```bash
bun run dev
```

or document equivalent manual open step.

No fake “tests pass” claim. Agent must actually run available tests where environment permits. If command fails due missing setup, agent records exact failure and fixes if in scope.

## Agent workflow per chunk

For every future spec, agent must follow this process:

1. Read this `00` spec.
2. Read current chunk spec.
3. Inspect existing repo.
4. Identify files to change.
5. Implement scoped work only.
6. Add/update tests.
7. Run tests/build.
8. Review own diff.
9. Fix critical and medium issues found in review.
10. Refactor for clarity.
11. Report what changed, tests run, known limits.

No broad rewrites unless required.

No adding features from later chunks unless tiny hook needed.

No leaving broken app.

## Review rule

After implementation, agent must self-review.

Review categories:

```text
critical = app broken, data loss, bad parsing, crash, unsafe HTML injection
medium = confusing state, missing edge case, untested core function, brittle DOM, bad names
low = cosmetic issue, minor duplication, future polish
```

Agent must fix critical and medium issues before stopping, unless impossible. Low issues may be left with notes.

Security-sensitive review:

```text
Never inject unescaped JSON text as HTML.
Use textContent for user data.
Escape CSV values.
Do not execute pasted input.
Do not fetch URLs from pasted JSON.
```

## Accessibility baseline

Keep basic keyboard and screen-reader behavior.

Rules:

```text
Use real buttons/inputs where possible.
Labels for fields.
Focusable controls visible.
Escape/Enter behavior only when safe.
Status text visible, not only color.
Danger/warning rows also use text/badges.
```

Retro style must not destroy usability.

## Performance baseline

Target common use:

```text
200 rows
50 columns
nested objects
works instantly
```

Later performance target:

```text
10k rows feasible with caps/virtualization
large input does not freeze forever
```

Early chunks do not need full virtualization. But architecture must avoid needless DOM coupling in core logic.

## Error-handling baseline

App must never fail silently.

For every major phase:

```text
parse
row detection
flatten
render
export
```

Return structured error or show visible message.

User-facing error should include:

```text
what failed
where possible line/column/path
what user can try
whether partial data exists
```

## File naming and code style

Prefer clear names over clever names.

Use:

```text
kebab-case filenames
camelCase JS variables/functions
PascalCase only for classes/custom elements if needed
UPPER_SNAKE_CASE constants
```

Functions should be small enough to test. Avoid giant `main.js`.

Comments:

```text
Add comments for heuristics and non-obvious browser behavior.
Do not comment obvious assignments.
```

## Expected 10-spec roadmap

This project split into 10 specs:

```text
00-agent-project-brief-and-architecture.md
01-app-shell-layout-and-state-foundation.md
02-input-editor-parser-and-error-reporting.md
03-row-source-detection-and-selection.md
04-flattening-column-profiling-and-ordering.md
05-failure-detection-and-diagnostics.md
06-table-renderer-and-core-interactions.md
07-column-controls-row-details-and-export.md
08-examples-visual-polish-and-large-input-performance.md
09-build-tests-readme-and-final-hardening.md
```

Chunk `00` does not implement user-facing app. It prepares shared ground.

## Deliverables for this chunk

Create or update:

```text
docs/specs/00-agent-project-brief-and-architecture.md
```

Optional if repo has no structure yet:

```text
docs/specs/README.md
AGENTS.md
package.json script placeholders
```

But do not overbuild.

If `AGENTS.md` already exists, update carefully. Preserve existing useful rules. Add reference to this spec and chunk workflow.

## Done criteria

Chunk `00` done when:

```text
Spec exists in repo.
Spec explains project, value, constraints, architecture.
Spec tells future agents how to work.
Spec names 10 chunk roadmap.
Spec mandates RetroOS framework usage.
Spec mandates tests/build/review/refactor.
Spec warns about security and escaping.
Spec allows framework edits only when generic.
No unrelated app feature implemented.
```

---

# Appendix A — Agent operating rules

This app built over many chunks. Each chunk has limited scope. Agent must not assume full context. Re-read this file each session.

If later spec conflicts with this file, use best judgment:

```text
Prefer user value.
Prefer working app.
Prefer small safe changes.
Prefer testable pure logic.
Prefer RetroOS framework.
Prefer readable code.
```

If conflict severe, document decision in final report.

## Mandatory RetroOS usage

Use RetroOS UI framework. Do not build entire UI from raw divs and custom CSS.

Correct:

```html
<aww-window>
  <aww-app-shell>
    <aww-toolbar slot="actions"></aww-toolbar>
    <aww-panel></aww-panel>
  </aww-app-shell>
</aww-window>
```

Exact tags may differ. Inspect framework.

Wrong:

```html
<div class="modern-card">
  <button class="blue-rounded-button">Parse</button>
</div>
```

Custom CSS belongs around layout/table gaps, not replacement design system.

## Refactor rule

After feature works, refactor.

Refactor means:

```text
remove duplication
rename unclear functions
split huge functions
move pure logic out of UI
add comments for heuristics
delete dead code
simplify state updates
```

Do not refactor across whole repo without need.

## Testing rule repeated

Every chunk:

```text
Add tests for new core logic.
Run tests.
Run build if available.
Report exact commands.
```

UI-only chunk still needs manual checklist.

## Self-review rule repeated

After implementation, inspect diff.

Fix:

```text
critical bugs
medium bugs
security risks
bad escaping
broken state
missing essential edge case
```

Leave low polish only if documented.

## Best-judgment rule

Specs cannot cover every repo detail. Agent may adapt. But adaptation must preserve product intent.

Examples:

```text
If framework export names differ, use real names.
If folder structure exists, fit into it.
If Bun config already exists, extend it.
If test runner already configured, use it.
If a framework bug blocks app, fix framework generically.
```

Do not ask for clarification when reasonable local decision exists. Make best safe call.

## Security appendix

Pasted JSON is untrusted input.

Rules:

```text
Never use innerHTML with user JSON.
Use textContent for cells/snippets.
Escape any generated HTML if unavoidable.
CSV export must quote fields with comma/newline/quote.
No eval.
No remote fetch from input.
No script execution from pasted text.
```

## Data fidelity appendix

Flattened table is derived view. Original data must remain available.

Rules:

```text
Keep original parsed root.
Keep original row object for each table row.
Do not coerce values destructively.
Display summaries for objects/arrays, but preserve originals.
Export visible table as strings, not source-of-truth mutation.
```

## Heuristic transparency appendix

App makes guesses. Guesses must be visible.

Future UI should show:

```text
detected input type
chosen row source
confidence
row count
column count
failure count
hidden column count
reasons for failure flag
```

No mysterious magic.

## Future chunk handoff format

Each future spec should start with same project reminder:

```text
We build static RetroOS-style JSON Table Inspector. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.
```

Then chunk-specific value.

Then detailed scope.

Then tests.

Then done criteria.

Then appendix with repeated agent rules as needed.

## Suggested commit/report format

At end of each coding-agent run, report:

```text
Summary:
- ...

Files changed:
- ...

Tests:
- `bun test` PASS/FAIL
- `bun run build` PASS/FAIL

Self-review fixes:
- ...

Known limits:
- ...
```

Keep report factual. No fake pass.
