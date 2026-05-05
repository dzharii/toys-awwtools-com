# 08-examples-visual-polish-and-large-input-performance.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, suspicious rows, and export clean visible data. This chunk is one bounded step in larger 10-spec plan.

This is chunk `08`: **examples, visual polish, and large input performance**. Goal: make app feel complete, teach user through built-in examples, improve visual design, and harden app for larger real inputs. Previous chunks made app functional. This chunk makes app understandable, pleasant, and resilient when user pastes thousands of records or very wide nested JSON.

This chunk value: user should be able to open app with no documentation, click example, understand intended workflow, paste real batch output, and not feel app is broken or frozen.

## Scope

Implement:

```text id="5dqslc"
built-in sample datasets
example preset UI
first-run/empty-state guidance
visual polish for shell/table/panels/badges/errors
large input detection
parse/flatten/health/render timing display
debounced expensive operations
render cap refinement
basic virtualized rendering if needed and feasible
large dataset warnings
wide dataset warnings
performance diagnostics
loading/busy states for long operations
regression tests for examples and performance helpers
manual stress checklist
accessibility polish
final pre-hardening cleanup for UI consistency
```

Do not implement final README/build hardening. That is chunk `09`.

Do not add external dependencies.

Do not replace RetroOS framework with custom design system.

Do not change core data semantics unless bug found.

## Main principles

```text id="p95cs0"
Examples teach workflow.
Polish clarifies, not decorates.
Performance guardrails prevent freezes.
Large input warnings must be actionable.
User data remains local.
No raw data in logs.
RetroOS identity stays intact.
```

Chunk `08` can refine existing UX, but must not rewrite architecture.

## Product behavior after this chunk

User opens app empty:

```text id="6qb3tp"
Sees clear purpose.
Sees example buttons.
Can load sample root array / batch output / JSONL logs / nested failures / mixed schema.
Understands paste -> detect -> inspect -> filter -> export.
```

User pastes large JSON:

```text id="141f9i"
App shows parsing/processing status.
App does not silently freeze for common large inputs.
App warns if only first N rows rendered.
App shows timings and limits.
App suggests narrowing filters/search or reducing visible columns.
```

User sees table:

```text id="b70myu"
Readable retro table.
Headers crisp.
Health badges clear.
Highlight colors readable.
Null/missing values distinct.
Errors and warnings visible but not noisy.
```

## Built-in examples

Add sample data files or inline example module.

Suggested structure:

```text id="vz9enb"
src/examples/root-array.json
src/examples/object-results.json
src/examples/jsonl-logs.txt
src/examples/nested-failures.json
src/examples/mixed-schema.json
src/examples/wide-record.json
src/examples/index.js
```

If bundling raw files awkward, put examples in JS module:

```js id="w0x953"
export const EXAMPLES = [
  {
    id: "object-results",
    title: "Batch results object",
    description: "Object with job metadata and results[] array.",
    kind: "json",
    text: `...`,
    expected: {
      rowSourcePathLabel: "results[]",
      minimumRows: 6,
      expectedFailureCount: 2
    }
  }
];
```

Examples should be realistic but small enough for source readability.

Required examples:

### 1. Root array

Purpose:

```text id="8j70s2"
Tests simplest common case: array of row objects.
```

Shape:

```json id="xruy88"
[
  { "id": "task-1", "success": true, "durationMs": 120 },
  { "id": "task-2", "success": false, "error": { "code": "E_TIMEOUT", "message": "Timed out" } }
]
```

Expected:

```text id="7a2w5f"
row source root[]
failure count >= 1
columns include id, success, error.code, error.message, durationMs
```

### 2. Object with `results[]`

Purpose:

```text id="dpd4g3"
Tests common batch job/API response with metadata.
```

Shape:

```json id="dndin7"
{
  "jobId": "batch-2026-05-04-a",
  "startedAt": "2026-05-04T12:00:00Z",
  "results": [
    ...
  ],
  "summary": {
    "total": 8,
    "failed": 2
  }
}
```

Expected:

```text id="9hinw5"
row source results[]
metadata not flattened as rows
failures visible
```

### 3. JSONL logs

Purpose:

```text id="oayvbz"
Tests one JSON object per line.
```

Text:

```jsonl id="krlae0"
{"timestamp":"2026-05-04T12:00:00Z","level":"info","message":"started","ok":true}
{"timestamp":"2026-05-04T12:00:01Z","level":"error","message":"timeout contacting service","ok":false,"errorCode":"E_TIMEOUT"}
```

Expected:

```text id="zem0qa"
input kind JSONL
row source JSONL records
line numbers survive row details
```

### 4. Nested failures

Purpose:

```text id="ah2g28"
Tests nested objects, arrays, error fields, row details.
```

Shape:

```json id="xm1hhb"
{
  "data": {
    "items": [
      {
        "requestId": "req-1",
        "status": "failed",
        "attempts": [
          { "n": 1, "status": "timeout" },
          { "n": 2, "status": "timeout" }
        ],
        "error": {
          "code": "E_RETRY_EXHAUSTED",
          "message": "All retries timed out"
        }
      }
    ]
  }
}
```

Expected:

```text id="nnsq07"
row source data.items[]
attempts summarized, not exploded
error fields early
row health failure
```

### 5. Mixed schema

Purpose:

```text id="7ls1cg"
Tests union columns, missing/null/empty distinction.
```

Shape:

```json id="cmvb7t"
[
  { "id": 1, "status": "complete", "result": { "score": 0.98 } },
  { "id": 2, "status": "failed", "error": null },
  { "id": 3, "ok": false, "errors": [] },
  { "id": 4, "success": false, "error": { "message": "" } }
]
```

Expected:

```text id="sb1w0u"
mixed schema columns
missing/null/empty values visible
diagnostics mention mixed/missing fields
```

### 6. Wide record / column explosion

Purpose:

```text id="ekx5af"
Tests column visibility, hidden counts, wide table usability.
```

Shape:

```text id="ku33hu"
10-20 rows
80+ columns
some constant columns
some mostly missing columns
some long text columns
```

Expected:

```text id="d5ww57"
default visible column cap active
hidden count visible
column picker useful
```

### Optional 7. Formula injection export sample

Purpose:

```text id="kaoot3"
Tests CSV formula protection.
```

Shape:

```json id="yqvzmo"
[
  { "id": 1, "note": "=IMPORTXML(\"http://bad\")", "success": true },
  { "id": 2, "note": "+cmd", "success": false }
]
```

Expected:

```text id="9tctwm"
CSV export formula protection testable
```

## Example UI

Empty state should include examples.

Suggested layout:

```text id="0li6zw"
Welcome to JSON Table Inspector

Paste JSON/JSONL on the left, or load an example:
[Root array] [Batch results] [JSONL logs] [Nested failures] [Mixed schema] [Wide table]

Workflow:
1. Paste or load data.
2. Confirm detected row source.
3. Inspect failures in table.
4. Filter/search/highlight.
5. Export visible rows.
```

Use RetroOS:

```text id="5nvr8h"
panel
toolbar
button
list/list item
empty state component if available
alert/note for sample replacement
```

Loading example behavior:

```text id="eashbp"
Click example replaces current input.
If current input non-empty and unsaved-ish, confirm before replacing or provide undo.
```

Simpler safe behavior:

```text id="fmro6c"
If input has text, clicking example shows small confirmation:
"Replace current input with this example?"
[Replace] [Cancel]
```

If confirmation implementation too large:

```text id="ivckqy"
Use normal browser confirm as acceptable fallback.
```

After loading example:

```text id="0rwubj"
Input updates.
Parse/detect/flatten/health/table pipeline runs.
Status says "Loaded example: Batch results object".
Logger logs example id only, not data text.
```

Need examples not pollute localStorage unexpectedly? If app persists input, example becomes persisted. Acceptable, but clear status.

## Visual polish goals

Polish existing UI without redesign.

### Shell polish

```text id="pbwnv3"
Title/subtitle clear.
Toolbar controls grouped.
Status strip not overloaded.
Panes have consistent padding.
Resize grips visible but subtle.
Collapsed input state obvious and reversible.
```

### Table polish

```text id="f9z6oo"
Sticky header visually separates from body.
Header labels readable with long path labels.
Sort affordance clear.
Column resize handle visible on hover/focus.
Row hover subtle.
Selected row distinct.
Failure/warning rows readable, not neon.
Health badges consistent.
Highlight colors readable.
Null/missing/empty tokens consistent.
Long text ellipsis predictable.
```

### Column picker polish

```text id="hrim37"
Search field visible.
Column rows compact.
Semantic badges small and consistent.
Hidden reason clear.
Show all/hide all/reset actions grouped.
```

### Row details polish

```text id="rfmk4k"
JSON block scrollable.
Copy buttons near data.
Failure reasons grouped before full JSON.
Non-empty fields list not overwhelming.
```

### Error/diagnostics polish

```text id="em0k38"
Parse errors remain dominant and actionable.
Pipeline warnings grouped.
Large input warnings not scary if app still working.
No duplicate conflicting messages.
```

## Design token usage

Use RetroOS tokens where possible.

Allowed custom CSS:

```text id="e0km8y"
table-specific grid lines
health badge classes
highlight classes
performance notice layout
example card/list layout
JSON pre block
```

Avoid custom full theme replacement.

Need centralize app-specific tokens:

```css id="f9qsww"
:root {
  --jti-row-height-compact: 28px;
  --jti-row-height-normal: 34px;
  --jti-row-height-roomy: 44px;
  --jti-danger-bg: ...; /* preferably mapped to RetroOS token */
}
```

If framework exposes public tokens, use them. Otherwise define app tokens carefully.

## Accessibility polish

Required:

```text id="8ajths"
example buttons have descriptive labels
status updates visible as text
table caption/aria-label present
sort buttons have aria-sort
column picker controls labelled
row details region labelled
copy/export buttons report success/failure visibly
color-coded badges include text
highlighted cells include non-color indicator only if feasible: title/aria-label "Highlighted by rule X"
large input warnings text, not color only
focus outlines visible
```

Do not destroy keyboard navigation while polishing.

## Large input definitions

Define practical thresholds.

Suggested:

```js id="3g28x4"
const SIZE_LIMITS = {
  largeCharCount: 1_000_000,
  veryLargeCharCount: 5_000_000,
  largeRowCount: 5_000,
  veryLargeRowCount: 25_000,
  largeColumnCount: 200,
  veryLargeColumnCount: 1_000,
  renderRowLimit: 1_000,
  renderCellLimit: 50_000,
  maxSearchRowsSync: 25_000
};
```

These are guide values. Agent may tune.

Need display warnings:

```text id="79yopu"
Large input detected: 8,423 rows and 312 columns.
Showing first 1,000 matching rows. Search/filter/export still use current data.
```

Careful: if export uses all filtered rows, can be huge. Need warning before export maybe in chunk 07 already. In chunk 08 refine.

## Performance architecture

Current pipeline likely sync. Chunk 08 should improve without adding dependencies.

### Debounce expensive steps

Input parsing from chunk 02 already debounce. Ensure expensive full pipeline is not run too frequently.

Rules:

```text id="6cdqnj"
Typing debounce 250-400ms.
Search debounce 150-250ms.
Column search debounce optional 100ms.
Highlight rule changes rerender after update, not per keystroke if editing value? Debounce 150ms.
```

### Stage timing

Record timings:

```text id="q3s53s"
parseMs
rowSourceMs
flattenMs
profileMs
healthMs
viewModelMs
renderMs
exportMs
```

Add state:

```js id="ok3qj3"
{
  performance: {
    lastRunId: 0,
    timings: {
      parseMs: null,
      rowSourceMs: null,
      flattenMs: null,
      profileMs: null,
      healthMs: null,
      viewModelMs: null,
      renderMs: null
    },
    limits: {
      renderedRows: 1000,
      totalMatchingRows: 8423,
      renderLimited: true
    },
    warnings: []
  }
}
```

Show compact diagnostics, maybe in status/details:

```text id="v77m99"
Processed in 142ms · rendered 1,000 of 8,423 rows
```

Do not overexpose by default. Keep compact.

### Avoid stale runs

When input changes quickly:

```text id="s8t238"
Older pipeline result must not overwrite newer input.
Use runId / version.
```

If already exists, verify.

### Rendering cap refinement

From chunk 06, render cap exists. Chunk 08 must refine.

Rules:

```text id="bhy7js"
Limit by row count and estimated cell count.
Default max rendered rows: 1,000.
If visible columns many, reduce row cap to keep cell count under 50,000.
Example: 200 visible columns => max 250 rows.
```

Function:

```js id="wct1ev"
export function computeRenderWindow({ matchingRows, visibleColumns, rowLimit, cellLimit }) {}
```

Output:

```js id="4t7652"
{
  start: 0,
  end: 1000,
  renderedRowCount: 1000,
  totalMatchingRows: 8423,
  renderLimited: true,
  reason: "rowLimit" | "cellLimit"
}
```

### Basic virtualization

If feasible, implement simple vertical virtualization. But this may be complex. The spec should allow fallback.

Preferred:

```text id="gm7ucf"
If table already stable and agent has time, implement simple virtual window:
- fixed/estimated row height by density
- scroll container
- render visible rows + overscan
- spacer top/bottom
- sticky header preserved
```

But this can break table layout.

Acceptable for chunk 08:

```text id="fp3xqe"
Keep render cap.
Add better warning.
Add search/filter to reduce rows.
Add performance diagnostics.
Avoid app freeze for common 5k rows.
Leave true virtualization as known limit if not safe.
```

Do not implement fragile virtualization that breaks table correctness. Working capped rendering better than broken virtualization.

### Web Worker

No worker required. Static app can use worker later. Do not add unless very clean.

If implemented, no external dependency. But likely too much.

## Large input UX

States:

```text id="ibucfc"
processing
ready
limited
too-large-warning
error
```

During long processing:

```text id="dm4vya"
show "Processing…" after 100ms delay
disable expensive controls if needed
keep input usable
```

Need not fully async, but if processing sync blocks, spinner may not show. Still record timings.

Large input warnings:

```text id="c0a07y"
Input is large. Processing may take a few seconds.
Detected 8,423 rows and 312 columns.
Rendering is limited to first 1,000 matching rows.
Use search/filter or hide columns to narrow view.
```

Very large input warning:

```text id="9e2anf"
This input is very large for a browser-only tool.
The app will sample detection/profiling and limit rendering.
If browser becomes slow, reduce input size.
```

Need be clear, not alarming.

## Performance diagnostics panel

Add optional “Performance” or diagnostics details.

Could be in existing diagnostics panel.

Display:

```text id="dsc71l"
Rows: 8,423
Columns: 312
Visible columns: 44
Rendered rows: 1,000
Rendered cells: 44,000
Timings:
- Parse 18ms
- Detect source 4ms
- Flatten/profile 86ms
- Health 22ms
- Render 58ms
Warnings:
- Render limited by row cap.
```

This is valuable for coding agents and users debugging.

## Example tests

Add tests:

```text id="sfwtdd"
all examples have unique ids
all examples have title/description/text
JSON examples parse as JSON
JSONL example parses as JSONL
expected row source candidate exists for each example
expected minimum row count met
expected failure count met where specified
wide example has > threshold columns after flatten
formula example exports safely if included
```

If full pipeline tests too heavy, use core functions.

## Performance helper tests

Required:

```text id="gicyk6"
computeRenderWindow below limit
computeRenderWindow row limit
computeRenderWindow cell limit
cell limit reduces row count
zero rows
zero columns
very high rows/columns
formatTiming
buildPerformanceWarnings for large rows
buildPerformanceWarnings for large columns
stale run guard if helper exists
```

## Visual regression manual checklist

No screenshot automation required, but manual checklist required.

```text id="l6bsv7"
Empty app looks clear.
Example buttons visible.
Loading each example works.
Table remains readable in compact density.
Table remains readable in roomy density.
Parse error block still prominent.
Health badges readable in light/dark if theme supports both.
Highlight custom colors still readable.
Column picker not cramped.
Row details JSON block scrolls.
Status strip not overflowing.
Narrow viewport usable.
```

## Stress manual checklist

Use generated data, not huge checked-in files.

Agent should create local test data during manual run or small generator script if useful.

Scenarios:

```text id="5y701v"
1,000 rows × 30 columns
5,000 rows × 50 columns
1,000 rows × 300 columns
JSONL 5,000 lines
large long-string fields
many sparse columns
many failures
search on large dataset
quick filter failures on large dataset
column picker with 300 columns
export filtered 1,000 rows
```

Expected:

```text id="rsxjbz"
app remains responsive enough
render cap warning appears
no console errors
no raw data logs
timings shown
search/filter results correct
```

No need commit giant generated files.

## Example loading and state safety

When loading example:

```text id="zv571a"
Clear selected row/cell.
Clear search/filter? Preferred reset quick filter to all and search empty.
Keep density/wrap preferences.
Keep highlight rules? Maybe keep, because user-defined; but example may make rules irrelevant.
Preferred: keep highlight rules but mark invalid column rules as inactive if missing.
Reset row source to auto.
Reset column visibility to defaults for example dataset.
```

Need avoid stale selected column/row from previous dataset.

## Pipeline refresh rules

Any new input/example should trigger full pipeline:

```text id="2fzwz0"
parse
detect row source
extract rows
flatten
profile/order
health
table view model
diagnostics/performance
```

If any stage fails, later data cleared.

Need show stage-specific status.

## Visual polish implementation notes

Do not overuse animations. RetroOS utility should feel direct.

Allowed:

```text id="o6t76v"
subtle hover/focus
small busy indicator
status badge changes
```

Avoid:

```text id="4efgeq"
spinners everywhere
animated gradients
big marketing hero
large decorative illustrations
```

## Logger instrumentation

Required logs:

```text id="zuy59y"
[JTI:Examples] Example list initialized { exampleCount }
[JTI:Examples] Load example attempt { exampleId, kind, charCount }
[JTI:Examples] Load example succeeded { exampleId }

[JTI:Performance] Pipeline started { runId, charCount }
[JTI:Performance] Stage completed { runId, stage, durationMs }
[JTI:Performance] Pipeline completed { runId, totalMs, rowCount, columnCount }
[JTI:Performance] Render limited { totalRows, renderedRows, visibleColumns, reason }
[JTI:Performance] Large input warning { rowCount, columnCount, charCount }
[JTI:UI] Visual state updated { density, wrapCells, renderLimited }
```

Do not log example text or user input. Example IDs and counts only.

## Security

Examples are trusted app source, but rendering path must still treat them like input.

Rules:

```text id="hdg4qt"
No innerHTML with examples/user data.
No raw JSON in logs.
No arbitrary CSS.
No remote examples fetched.
Examples bundled locally.
Large input warnings must not include raw values.
```

## Performance acceptance targets

These are practical goals, not hard benchmarks across machines.

Target on ordinary laptop/browser:

```text id="ezc7b3"
200 rows × 50 columns feels instant.
1,000 rows × 100 columns usable with render cap.
5,000 rows × 50 columns does not crash; warnings/render cap appear.
JSONL 5,000 lines parses and displays capped table.
300 columns column picker still usable with search.
```

If target not met, agent must document blocker and likely hot spots.

## Tests

### Example tests

```text id="3m1gmv"
unique ids
titles/descriptions non-empty
JSON examples parse
JSONL example parses as JSONL
pipeline gets expected row source
pipeline gets expected row count minimum
pipeline gets expected failure count minimum
wide example triggers hidden columns
mixed example has missing/null distinction
```

### Performance helper tests

```text id="3axh29"
render window row cap
render window cell cap
cell cap with many columns
no cap under threshold
format timing below/above second
warning for large char count
warning for large row count
warning for large column count
warning for render limit
pipeline run id ignores stale update if implemented
```

### UI state tests if pure helpers exist

```text id="8v2zcw"
loading example resets table selection/search
loading example keeps density/wrap
loading example resets row source auto
performance warnings merged without duplicates
```

### CSS/DOM smoke tests optional

If test setup supports DOM. If not, manual checklist enough.

## Manual checklist

```text id="ny3uzk"
Open app empty. Purpose and examples clear.
Load Root array example. Table appears, failure visible.
Load Batch results example. Row source results[].
Load JSONL example. JSONL records and line numbers.
Load Nested failures example. Nested arrays summarized.
Load Mixed schema example. Missing/null/empty distinct.
Load Wide example. Hidden columns count and picker useful.
Replace-current-input confirmation appears if input non-empty.
Examples do not log full data.
Large generated dataset shows render cap warning.
Search/filter on large dataset works.
Column picker works with many columns.
Performance diagnostics show timings.
Visual polish does not break parse errors.
Visual polish does not break export.
No console errors.
No raw user data logs.
```

## Done criteria

Chunk `08` done when:

```text id="n7n7fj"
Built-in examples exist and load through UI.
Examples cover root array, object results, JSONL, nested failures, mixed schema, wide records.
Empty state teaches app workflow.
Loading example triggers full pipeline.
Existing input replacement is safe/confirmed or clearly handled.
Visual polish improves shell/table/panels/badges/errors without replacing RetroOS framework.
Large input thresholds and warnings exist.
Processing/timing/performance diagnostics exist.
Render cap refined by row/cell limit.
Search/filter/table remains usable with larger datasets.
Performance helper tests added.
Example tests added.
Manual stress checklist completed or blockers documented.
Logger instruments examples/performance without raw data.
Accessibility polish checked.
Agent ran tests/build or documented blocker.
Agent self-reviewed and fixed critical/medium issues.
No final README/build hardening work implemented beyond necessary cleanup.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, suspicious rows, and export clean visible data.

This chunk is one bounded step. Implement examples, visual polish, and large-input performance improvements only. Do not do final README/build/test hardening beyond what this chunk needs. That belongs to chunk `09`.

10-spec roadmap:

```text id="ax1a8l"
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

# Appendix B — Mandatory agent workflow

For this chunk:

```text id="i1h0tu"
Read 00 spec.
Read 01-07 implementation.
Inspect app UI and current bottlenecks.
Plan examples and performance helpers before coding.
Implement only chunk 08.
Add/update tests.
Run tests/build.
Manual check example flow.
Manual stress check at least one large generated dataset.
Self-review visual/accessibility/performance issues.
Fix critical/medium issues.
Report exact commands and result.
```

No broad rewrite. No fake pass.

# Appendix C — RetroOS framework rule

Use RetroOS components for:

```text id="fdq7b0"
example panels/lists/buttons
performance diagnostics
large input warnings
status lines
toolbar controls
alerts
```

Custom CSS allowed for table polish and example layout. Do not replace framework.

# Appendix D — Example design rule

Examples must teach real scenarios.

Every example needs:

```text id="zph6p6"
id
title
description
kind json/jsonl
text
expected behavior notes
```

Examples must not be huge. Wide example can be generated programmatically if needed.

# Appendix E — Large input rule

Large input should degrade gracefully.

Required:

```text id="vzb9s3"
detect large char/row/column counts
show warning
cap rendered rows/cells
show rendered vs total count
show timings
suggest search/filter/hide columns
avoid silent freeze where possible
```

True virtualization optional. Stable render cap acceptable if clearly communicated.

# Appendix F — Visual principle

Polish must improve usability.

Priority:

```text id="ho9m1y"
readability
clear hierarchy
consistent controls
visible status
accessible focus
subtle retro aesthetics
failure/warning clarity
```

Avoid:

```text id="pxflkx"
decorative clutter
loud colors
modern SaaS redesign
hidden errors
tiny unreadable text
animations that distract
```

# Appendix G — Performance logging rule

Log timings and counts only.

Allowed:

```text id="cvmmtq"
rowCount
columnCount
charCount
durationMs
renderedRows
visibleColumns
warning code
exampleId
```

Forbidden:

```text id="gih59l"
raw input text
example full text
cell values
row JSON
search query text
export text
```

# Appendix H — Self-review checklist

Before final report, check:

```text id="wn90sx"
Do examples load correctly?
Does loading example clear stale selected row/cell?
Does row source reset or preserve safely?
Do examples parse with same public pipeline as user input?
Does empty state explain value?
Does render cap message appear when needed?
Does large wide data avoid huge DOM?
Do timings look plausible?
Does polish preserve RetroOS components?
Does parse error remain sticky/actionable?
Does CSV export still pass tests?
Does highlight custom color readability remain okay?
Does column picker handle many columns?
Does logger avoid raw data?
Does app still work narrow viewport?
```

Fix critical/medium issues.

# Appendix I — Suggested final report format

```text id="e1czsk"
Summary:
- Added built-in examples and example loading UI.
- Polished table/shell/diagnostics visuals.
- Added large-input warnings, timing diagnostics, and refined render caps.

Files changed:
- ...

Tests:
- `bun test` PASS/FAIL
- `bun run build` PASS/FAIL or not available

Manual checks:
- Examples: ...
- Stress: ...

Self-review fixes:
- ...

Known limits:
- Final README/build hardening and complete release checklist intentionally left for chunk 09.
```
