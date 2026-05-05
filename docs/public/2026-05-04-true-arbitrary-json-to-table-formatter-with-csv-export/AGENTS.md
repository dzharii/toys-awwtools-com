# AGENTS.md

NEVER use git write commands. No git commit, not git push and others. you can use git readonly commands.

## Project

We build **JSON Table Inspector**: a static RetroOS-style browser app that turns arbitrary JSON or JSONL into a readable, spreadsheet-like table.

User pastes JSON from batch jobs, API responses, logs, test reports, or automation output. App parses it, detects likely row data, flattens nested fields into columns, flags likely failures, lets user search/sort/filter/highlight, inspect full row JSON, and export visible data as CSV/TSV.

Core user value: user should find failed or suspicious rows fast without writing a script.

This app is local-first. Do not send pasted data to servers. Do not fetch remote processing services. Do not execute pasted content.

## Required spec-driven workflow

This project is implemented through numbered specification files. They live in the same folder as this `AGENTS.md`.

Implement **one chunk at a time**.

Do not jump ahead. Do not implement multiple chunks in one pass unless the current spec explicitly says a tiny hook is needed. Each chunk should leave the app working.

Required order:

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

Before implementing any chunk:

```text
1. Read this AGENTS.md.
2. Read 00-agent-project-brief-and-architecture.md.
3. Read the current numbered spec.
4. Inspect existing implementation.
5. Identify exact files to change.
6. Implement only current chunk.
7. Add/update tests for logic touched.
8. Run available tests.
9. Run build if available.
10. Self-review diff.
11. Fix critical and medium issues.
12. Report summary, files changed, tests/build, known limits.
```

If context has been compacted or lost, reread this file and the current numbered spec. Treat specs as source of truth.

## Autonomy rule

Work autonomously when a safe local decision exists. Do not stop for clarification if the spec gives enough direction.

Use best judgment when repo details differ from spec examples:

```text
If framework export names differ, inspect and use actual exports.
If folder structure differs, fit into existing structure while preserving architecture.
If tests/build scripts differ, use existing conventions.
If a framework bug blocks progress, fix it only if the fix is generic.
If a spec conflict appears, prefer user value, working app, safe data handling, and testable pure logic.
```

Do not perform broad rewrites unless required to fix a high-severity issue.

## Chunk boundary rule

Every chunk has a bounded purpose.

Examples:

```text
Chunk 02 parses input and reports errors. It does not detect row sources.
Chunk 03 detects row sources. It does not flatten rows.
Chunk 04 flattens/profiles/orders columns. It does not score failures.
Chunk 05 scores health/diagnostics. It does not render final table.
Chunk 06 renders table/search/filter/sort/highlights. It does not implement export.
Chunk 07 adds column controls/details/export. It does not do final README hardening.
Chunk 08 adds examples/polish/performance. It does not do final release hardening.
Chunk 09 finalizes build/tests/docs/hardening. It does not add major features.
```

If tempted to add later feature, add only minimal hook and document it.

## Architecture

Keep core logic separate from UI.

Target structure:

```text
src/app/
  main.js
  state.js
  constants.js
  logger.js

src/core/
  parse-input.js
  walk-json.js
  detect-row-source.js
  extract-rows.js
  flatten.js
  profile-columns.js
  order-columns.js
  detect-failures.js
  build-diagnostics.js
  table-sort.js
  table-filter.js
  highlight-rules.js
  column-visibility.js
  row-details.js
  export-table.js

src/ui/
  render-shell.js
  render-input.js
  render-detection.js
  render-table.js
  render-column-controls.js
  render-row-details.js
  render-export-controls.js
  render-status.js

src/examples/
src/styles/
src/vendor/retroos-ui-v001/
test/
docs/
```

Actual repo may differ. Preserve these boundaries:

```text
core = pure functions, no DOM, no localStorage unless storage helper is explicit
ui = DOM rendering and event binding
app = state orchestration, logger, lifecycle
styles = app-specific CSS
vendor = generic RetroOS UI framework
```

Do not put app-specific JSON/table logic into vendor framework.

## UI framework rule

Use vendored RetroOS UI framework as primary UI system.

Expected location:

```text
src/vendor/retroos-ui-v001
```

Use RetroOS components for:

```text
app shell
window/chrome
panels
toolbars
status bars/status strips
buttons
inputs/textareas/selects/checkboxes
alerts/dialogs/toasts/empty states
tabs/lists/menus where useful
```

Custom app CSS is allowed for:

```text
split-pane layout
data table
sticky headers
cell states
highlight rules
JSON snippet/pre blocks
resize grips
column picker/detail layouts
performance notices
```

Do not rebuild the whole UI as raw divs with modern SaaS styling. Do not replace RetroOS visual language.

Framework modifications are allowed only when generic:

```text
Allowed: fix generic panel sizing bug.
Allowed: add generic component capability useful outside this app.
Not allowed: add JsonTableInspector-specific components to vendor.
```

## Product pipeline

Final app pipeline:

```text
input text
  -> parseInput()
  -> findRowSourceCandidates()
  -> choose/select row source
  -> extractRowsFromSource()
  -> flattenRows()
  -> profileColumns()
  -> orderColumns()
  -> chooseDefaultVisibleColumns()
  -> scoreRows()
  -> buildDiagnostics()
  -> build table view model
  -> render/search/filter/sort/highlight
  -> row details / export visible view
```

Each stage should return structured result or structured error. No silent failures.

## State model

Central state should remain serializable where practical.

Expected fields over project lifetime:

```js
{
  inputText: "",
  parseResult: null,
  parseStatus: "empty",
  parseError: null,

  rowSourceCandidates: [],
  selectedRowSourceId: null,
  selectedRowSourcePath: null,
  selectedRowSource: null,

  extractedRows: [],
  flatRows: [],
  scoredRows: [],

  columns: [],
  visibleColumnKeys: [],
  columnOrderPreset: "failureFirst",

  filters: {},
  sort: null,

  table: {
    sort: { columnKey: null, direction: "none" },
    searchQuery: "",
    quickFilter: "all",
    columnWidths: {},
    renderLimit: 1000,
    selectedRowIndex: null,
    selectedCell: null
  },

  highlightRules: [],
  highlightRulesEnabled: true,

  healthSummary: null,
  diagnostics: null,

  ui: {
    inputCollapsed: false,
    leftPaneWidth: null,
    rightTopHeight: null,
    density: "compact",
    wrapCells: false,
    rowDetailsOpen: false
  },

  performance: {
    timings: {},
    warnings: [],
    limits: {}
  }
}
```

Use actual state shape from repo, but keep equivalent meaning.

Persist only safe preferences unless spec says otherwise:

```text
pane sizes
input collapsed
density
wrap cells
column widths
highlight rules
visibility settings
maybe last input if app already documents it
```

Handle malformed localStorage without crashing.

## Parsing and errors

Parser must support:

```text
strict JSON
JSONL
empty input
actionable parse errors
```

Invalid input must show persistent visible error until fixed or cleared. Error should include:

```text
plain-language message
technical parser message
line
column
nearby snippet
caret pointer when possible
hint
attempted input kind
```

Do not auto-hide parse errors. Do not replace them with vague status only.

Use normal clear language in user-facing errors.

## Row-source detection

Detection is heuristic and transparent.

Find candidates:

```text
root array
JSONL records
object arrays such as results[], items[], data[], records[]
nested arrays
single object fallback
primitive/empty diagnostic
```

Each candidate should include:

```text
id
kind
path
pathLabel
rowCount
itemType/type mix
score
confidence
reasons
warnings
```

User must be able to override selected row source.

Do not hide the guess. Show source path, confidence, row count, reasons, and alternatives.

## Flattening and columns

Flatten selected rows into dot/bracket path columns.

Required distinctions:

```text
missing = path absent
null = path present with null
emptyString = path present with ""
emptyArray = path present with []
emptyObject = path present with {}
```

Do not collapse missing and null.

Default array handling:

```text
primitive array -> short joined summary
object array -> [N objects]
mixed array -> [N items: type, type]
empty array -> []
raw array preserved
no row explosion by default
```

Preserve:

```text
original parsed root
original row object
raw cell values
source path
JSONL source line number
```

Column profiles should include:

```text
coverage
missing/null/empty counts
type mix
dominant type
unique samples
constant/mostly-missing/long-text flags
identity/status/error/time/metric semantic flags
hidden-by-default reason
```

Default column order should prioritize:

```text
identity
status/result
error/message/code
time/duration
common scalar fields
metrics/counts
remaining scalar
sparse non-error
long text
array/object summaries
constant columns
```

Sparse error columns must stay visible/early.

## Failure detection

Health levels:

```text
failure
warning
ok
unknown
```

Failure detection is heuristic. Every failure/warning row needs reasons.

Strong signals:

```text
success=false
ok=false
passed=false
failed=true
hasError=true
status=failed/error/timeout/invalid
non-empty error/error.code/error.message/errors/exception/stack/trace
exitCode != 0
HTTP status 4xx/5xx when column clearly represents HTTP status
```

Warning signals:

```text
status=warning/partial/skipped/retry/degraded
warnings non-empty
retryCount > 0
missing important high-coverage field
type mismatch in important column
```

OK only when explicit:

```text
success=true
ok=true
passed=true
failed=false
status=success/complete/ok
exitCode=0
HTTP 2xx
```

Failure wins over OK if both appear.

No signal = unknown, not OK.

## Table behavior

Table renderer must support:

```text
sticky header
row numbers
health column
type-aware cells
null/missing/empty visuals
ellipsis by default
wrap toggle
density toggle
stable sorting
global search over visible cells
quick filters: all/issues/failures/warnings/ok/unknown
basic column widths/resizing
highlight rules
render cap for large data
```

Search:

```text
visible cells only
case-insensitive
multi-word AND
include health label/top reason
do not log query text
```

Sort:

```text
stable
missing/null last
numbers numeric
strings case-insensitive
booleans deterministic
health deterministic
```

Highlight rules:

```text
equals
contains
gt
lt
exists
missing
specific column or any visible column
predefined tones
safe custom #RRGGBB color only
no arbitrary CSS
```

## Column controls, row details, export

Column controls:

```text
show hidden count
search columns
show/hide columns
show all
hide all non-system
reset defaults
ordering presets
system columns # and Health stay visible or are safely restorable
```

Row details:

```text
summary
source path/source line
health and failure reasons
non-empty fields
full original JSON via textContent
copy original JSON
copy visible row JSON
copy cell
```

CSV/TSV export:

```text
exports current visible rows after filter/search/sort
exports current visible columns
includes header
includes Health by default
uses single serializer
```

CSV rules:

```text
delimiter comma
newline CRLF
quote fields with comma, quote, CR, LF, leading/trailing space
double quotes inside quoted fields
missing -> empty
null -> empty
objects/arrays -> compact JSON
booleans -> true/false
numbers -> String(number)
spreadsheet formula protection enabled by default for risky strings
```

Formula protection:

```text
For string cells beginning with = + - @ tab CR LF after optional leading spaces, prefix single quote.
Actual numeric -5 remains -5.
```

No ad-hoc CSV building anywhere except serializer.

## Examples and performance

Built-in examples should cover:

```text
root array
object with results[]
JSONL logs
nested failures
mixed schema
wide records/column explosion
optional formula injection export sample
```

Large input guardrails:

```text
detect large char/row/column counts
record parse/detect/flatten/health/render timings
show render cap warning
cap rendered rows/cells
keep search/filter usable
do not silently freeze where avoidable
```

True virtualization optional unless already implemented safely. Stable render cap is better than broken virtualization.

## Logging rules

Logger is required.

Prefix format:

```text
[JTI:Input]
[JTI:Parser]
[JTI:RowSource]
[JTI:Flatten]
[JTI:Columns]
[JTI:Health]
[JTI:Diagnostics]
[JTI:Table]
[JTI:Highlight]
[JTI:Export]
[JTI:Examples]
[JTI:Performance]
[JTI:State]
[JTI:UI]
```

Every major action logs attempt/outcome with safe metadata.

Allowed log details:

```text
counts
durations
ids
flags
column keys
row counts
visible counts
error codes
line/column
char counts
```

Forbidden log details:

```text
raw pasted JSON
row objects
cell values
search query text
CSV/TSV text
clipboard contents
full original row JSON
large snippets
```

Logger must support silent/test mode.

## Security rules

Pasted JSON is untrusted.

Mandatory:

```text
No eval.
No new Function.
No network fetch based on pasted data.
No remote processing.
No innerHTML with user data.
Use textContent/value for user data.
No arbitrary CSS from user.
Validate custom highlight color as #RRGGBB only.
Do not put full row JSON in DOM attributes.
Do not log raw data.
CSV formula protection enabled by default.
Clipboard/download only after explicit user action.
```

If `innerHTML` appears, it must be static trusted markup only and reviewed.

## Accessibility baseline

Maintain:

```text
real buttons/inputs where possible
labels for inputs/selects/textareas
visible focus
table caption or aria-label
sortable headers with aria-sort
status messages visible as text
health badges include text
color never sole signal
parse errors text-based
row details region labelled
copy/export success/failure visible
```

Retro style must not break usability.

## Tests

Use Bun tests.

Core tests should cover:

```text
parse JSON/JSONL/errors/snippets
row-source detection/scoring/path labels
row extraction
flattening/cell model/path collisions
column profiling/ordering/default visibility
failure detection/diagnostics
table view model/search/filter/sort/highlight
column visibility helpers
row details helpers
CSV/TSV escaping/formula protection
examples validity
performance helpers/render caps
state persistence helpers where pure
logger safety where feasible
```

Prefer table-driven tests for repetitive cases.

Do not over-test unstable details:

```text
exact console colors
exact wording of long paragraphs
exact heuristic score numbers unless exported as stable constants
timing milliseconds
DOM class order
```

Exact tests required for:

```text
CSV/TSV escaping
formula protection
path collision handling
missing/null handling
parse error line/column basics
```

Run:

```bash
bun test
```

Run build if available:

```bash
bun run build
```

Final chunk should add:

```bash
bun run check
```

if practical.

## Build

Static app. Bun scripts required by final chunk:

```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "bun test",
    "check": "bun test && bun run build"
  }
}
```

Build output must be readable:

```text
no minify
no mangle
no obfuscation
no remote CDN
local assets only
```

If direct `file://` open is not supported, document local server command.

## Documentation

Final README must explain in normal technical prose:

```text
what app is
why user would use it
quick start
supported input shapes
feature overview
export behavior
privacy/local-first behavior
limits
development commands
project structure
troubleshooting
```

README must not be hype. Do not claim AI. Explain real value through concrete workflows.

Manual checklist required in `docs/manual-checklist.md`.

Final hardening report required in `docs/release-hardening-report.md`.

## Review and severity

After each chunk, self-review.

Final chunk requires multiple review passes.

High issues must be fixed:

```text
app does not load
build fails
tests fail
parse errors vanish incorrectly
invalid JSON crashes app
unsafe HTML injection
raw user data logged
CSV invalid
CSV formula protection broken
export silently wrong
copy/download silently fails
large input locks app without warning/cap
original row JSON lost
major UI ignores RetroOS framework
```

Medium issues should be fixed:

```text
confusing status
missing accessible label
logger missing for major action
duplicated brittle tests
column counts wrong
highlight invalid rule unclear
sort direction unclear
README incomplete
manual checklist incomplete
performance diagnostics missing
```

Low issues may be documented:

```text
minor alignment
future virtualization improvement
extra keyboard shortcuts
more examples
advanced export options
```

## Final response format per chunk

At end of coding-agent run, report:

```text
Summary:
- ...

Files changed:
- ...

Tests:
- `bun test` PASS/FAIL
- `bun run build` PASS/FAIL or not available

Manual checks:
- ...

Self-review fixes:
- ...

Known limits:
- ...
```

For chunks `06`, `07`, and `09`, include extra review-pass notes because those chunks are high-risk.

Never claim tests/build pass unless actually run.
