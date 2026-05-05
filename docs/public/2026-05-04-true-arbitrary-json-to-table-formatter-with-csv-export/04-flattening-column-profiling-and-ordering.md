# 04-flattening-column-profiling-and-ordering.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `04`: **flattening, column profiling, and ordering**. Goal: once parser and row-source detection select records, app converts selected row values into flat table data. Each table column maps to dot/bracket path. App profiles columns, distinguishes missing/null/empty, orders columns for failure scanning, and preserves original row JSON for later detail view. No final table renderer yet. This chunk produces data model and placeholder summary UI for future table.

This chunk value: arbitrary JSON becomes spreadsheet-ready data. Later table renderer can consume stable `rows` and `columns` without knowing JSON internals.

## Scope

Implement:

```text id="m20cq9"
row extraction from selected row source
flatten rows into dot-path values
column key/path generation
object/array summarization
missing/null distinction
mixed-schema handling
column profiling
column ordering presets
visible-column defaults
state integration
mapping/result placeholder summary
tests for flatten/profile/order behavior
logger instrumentation
```

Do not implement full interactive table renderer.

Do not implement row health/failure scoring. Failure-like column ordering can exist, but actual row health belongs to chunk 05.

Do not implement filters/sort UI.

Do not implement export.

## Product behavior after this chunk

Given parsed input + selected row source:

```text id="2mxsl8"
App extracts rows from selected source.
App flattens each row.
App creates union of columns.
App profiles each column.
App selects default visible columns.
App orders columns in useful order.
App shows summary: rows, columns, hidden columns, top columns.
```

Example input:

```json id="8m67a2"
{
  "jobId": "batch-123",
  "results": [
    {
      "id": "a",
      "success": true,
      "metrics": { "durationMs": 91 },
      "tags": ["fast", "green"]
    },
    {
      "id": "b",
      "success": false,
      "error": { "code": "E_TIMEOUT", "message": "Timed out" },
      "metrics": { "durationMs": 1200 }
    }
  ]
}
```

Expected flattened shape:

```text id="m3d8eq"
Rows: 2
Columns:
- id
- success
- error.code
- error.message
- metrics.durationMs
- tags
```

Cell values:

```text id="c4blv4"
row 0 id = "a"
row 0 success = true
row 0 metrics.durationMs = 91
row 0 tags = ["fast", "green"] summary "fast, green"
row 0 error.code = missing
row 1 error.code = "E_TIMEOUT"
row 1 tags = missing
```

Column profile:

```text id="9155ku"
error.code coverage 1/2, missing 1/2, type string
success coverage 2/2, type boolean
metrics.durationMs coverage 2/2, type number
tags coverage 1/2, type array
```

## Required modules

Create pure modules:

```text id="0c70mv"
src/core/extract-rows.js
src/core/flatten.js
src/core/profile-columns.js
src/core/order-columns.js
```

Existing structure may combine files if clean, but keep concerns separated.

Suggested exports:

```js id="i8ion7"
export function extractRowsFromSource(parseResult, rowSource) {}
export function flattenRows(sourceRows, options = {}) {}
export function flattenValue(value, options = {}) {}
export function createColumnKey(path) {}
export function formatColumnLabel(path) {}
export function profileColumns(flatRows, columns, options = {}) {}
export function orderColumns(columns, preset, options = {}) {}
export function chooseDefaultVisibleColumns(columns, options = {}) {}
```

No DOM in these modules.

## Row extraction

Input:

```text id="2ysby6"
parseResult from chunk 02
selectedRowSource from chunk 03
```

Output:

```js id="jzdr5s"
{
  ok: true,
  source: selectedRowSource,
  rows: [
    {
      rowIndex: 0,
      sourcePath: ["results", 0],
      sourceLineNumber: null,
      original: { "id": "a", "success": true }
    }
  ],
  meta: {
    rowCount: 2,
    sourceKind: "array",
    sourcePathLabel: "results[]"
  },
  warnings: []
}
```

For JSONL:

```js id="h6ginx"
{
  rowIndex: 0,
  sourcePath: [0],
  sourceLineNumber: 1,
  original: { "id": 1 }
}
```

For object-as-row:

```js id="iuswce"
{
  rowIndex: 0,
  sourcePath: [],
  sourceLineNumber: null,
  original: rootObject
}
```

For primitive array:

```js id="be91c4"
{
  rowIndex: 0,
  sourcePath: [0],
  original: "value"
}
```

Extraction rules:

```text id="1ahhnd"
Use rowSource.path as path array.
Use getValueAtPath from row-source module if available.
If source value is array, each item becomes row.
If source kind is jsonl, parseResult.root array becomes rows and lineItems provide sourceLineNumber.
If source kind is objectAsRow, root object becomes one row.
If source missing/stale after input edit, return ok:false with structured error.
```

Error contract:

```js id="ejay77"
{
  ok: false,
  error: {
    code: "E_ROW_SOURCE_MISSING",
    message: "Selected row source no longer exists.",
    pathLabel: "results[]"
  },
  rows: [],
  warnings: []
}
```

## Flattening contract

Input:

```text id="nrdu8s"
sourceRows from extractRowsFromSource
```

Output:

```js id="xeueep"
{
  flatRows: [
    {
      rowIndex: 0,
      sourcePath: ["results", 0],
      sourceLineNumber: null,
      original: { ... },
      values: {
        "id": { state: "value", type: "string", value: "a", display: "a", path: ["id"] },
        "success": { state: "value", type: "boolean", value: true, display: "true", path: ["success"] },
        "error.code": { state: "missing", type: "missing", value: undefined, display: "", path: ["error", "code"] }
      }
    }
  ],
  columns: [
    {
      key: "id",
      path: ["id"],
      label: "id",
      source: "flatten"
    }
  ],
  meta: {
    rowCount: 2,
    columnCount: 6,
    maxDepthReached: false,
    sampled: false
  },
  warnings: []
}
```

Important: row values may not need explicit missing cells stored for every row/column at first. For memory, store present values only, and helper `getCell(row, column)` returns missing. But column profiling must count missing. Choose memory-conscious design if possible.

Required distinction:

```text id="7mx92c"
missing = path absent in row
null = path present and value null
emptyString = present string ""
emptyArray = present array []
emptyObject = present object {}
undefined = should not appear from JSON, but may exist defensively
```

Do not collapse missing and null. They mean different things.

## Flatten path rules

Default mode: `dotPaths`.

Nested object:

```json id="liq0ni"
{ "user": { "name": "Ada" } }
```

Column:

```text id="y5phbh"
user.name
```

Primitive root row:

```json id="5hbm6k"
"hello"
```

Column:

```text id="hqwyla"
value
```

Array row primitive:

```json id="w457sk"
["a", "b"]
```

Rows become:

```text id="aocpfc"
row 0: value = "a"
row 1: value = "b"
```

Nested primitive array:

```json id="8c19k8"
{ "tags": ["red", "blue"] }
```

Default column:

```text id="z6ocjt"
tags = "red, blue" display
raw value preserved as array
```

Nested object array:

```json id="rkk18s"
{ "attempts": [{ "n": 1 }, { "n": 2 }] }
```

Default column:

```text id="fsxy7c"
attempts = "[2 objects]"
raw value preserved as array
```

Empty object:

```json id="h9d9lh"
{ "config": {} }
```

Column:

```text id="d0z68c"
config = "{}"
```

Empty array:

```json id="s9jq7g"
{ "items": [] }
```

Column:

```text id="kca1wv"
items = "[]"
```

Null:

```json id="a2xie8"
{ "error": null }
```

Column:

```text id="fbh31e"
error = null
```

Object flattening:

```text id="q3t9mh"
Objects with primitive leaves become leaf columns.
Objects with no leaves become summary column.
Objects may also optionally have summary column if options.includeObjectSummaries = true, but default false to avoid column explosion.
```

Array flattening default:

```text id="xi49t1"
Do not explode rows in this chunk.
Do not create indexed columns for every array element by default.
Create one summary column for array value.
Primitive arrays display joined short summary.
Object arrays display count/type summary.
Mixed arrays display count/type summary.
Raw array remains preserved in cell.value.
```

Why: row explosion/index columns are later advanced feature. Default needs stable, compact table.

## Path/key formatting

Internal path stays array of exact keys:

```js id="go7c2m"
["job.results", "error message"]
```

Column key/label must be deterministic and safe.

Normal keys:

```text id="3qzwx0"
["error", "code"] -> error.code
```

Keys needing bracket notation:

```text id="23re8d"
["job.results"] -> ["job.results"]
["job items"] -> ["job items"]
["0"] -> ["0"] maybe
["error", "message text"] -> error["message text"]
```

Array summary column uses property path only:

```text id="9n1o26"
tags
attempts
```

No `tags[]` for a cell column unless explicit future array-explode mode. Reserve `[]` for row-source labels.

Key collision handling:

Potential collision:

```json id="p9wuzl"
{
  "a.b": 1,
  "a": { "b": 2 }
}
```

Both naive labels could be `a.b`.

Must avoid collisions.

Approach:

```text id="1eq0ou"
Create canonical key from path using escaping/bracket notation.
Display label can be compact, but key must be unique.
If display labels collide, show full bracket-safe label.
```

Possible canonical:

```text id="59oq0a"
a.b              for ["a","b"]
["a.b"]          for ["a.b"]
```

Do not split keys by dot later. Use path array.

## Cell model

Use structured cell objects or equivalent.

Suggested:

```js id="m7dfsc"
{
  state: "value" | "missing" | "null" | "empty",
  type: "string" | "number" | "boolean" | "object" | "array" | "null" | "missing",
  value: rawValue,
  display: "Timed out",
  path: ["error", "message"],
  summary: {
    length: 2,
    itemTypes: { string: 2 }
  }
}
```

Display conversion:

```text id="8uvj16"
string -> same string
number -> String(number)
boolean -> "true" / "false"
null -> "null" or display token later
missing -> ""
empty string -> ""
empty array -> "[]"
empty object -> "{}"
array primitive short -> "a, b, c"
array primitive long -> "a, b, c, … +7"
array object -> "[3 objects]"
array mixed -> "[5 items: object, string, null]"
object summary if needed -> "{…}" or "{3 keys}"
```

Limit display strings:

```text id="pj03rl"
maxDisplayLength default 160
truncate with …
raw value remains intact
```

Long string:

```text id="j0337p"
display first 160 chars with …
cell.meta.truncated = true
cell.meta.originalLength = N
```

## Flattening options

Default:

```js id="ueritd"
{
  mode: "dotPaths",
  maxDepth: 12,
  maxColumns: 1000,
  maxRowsForProfiling: 10000,
  includeObjectSummaries: false,
  arrayMode: "summary",
  primitiveArrayJoinLimit: 8,
  maxDisplayLength: 160
}
```

Limits:

```text id="kr4zs8"
If maxDepth hit, create summary column at that path and warning.
If maxColumns hit, stop adding new columns and warning.
Do not crash.
```

Warnings:

```text id="9o8brk"
"Flattening reached max depth at path ..."
"Column limit reached; some fields hidden from flattened view"
"Long strings truncated for display; raw values preserved"
```

## Column profiling

Implement in pure module.

Column stats should include:

```js id="q8mjm8"
{
  key: "error.code",
  path: ["error", "code"],
  label: "error.code",
  rowCount: 200,
  presentCount: 17,
  missingCount: 183,
  nullCount: 0,
  emptyCount: 0,
  coverageRatio: 0.085,
  types: {
    string: 17,
    number: 0,
    boolean: 0,
    object: 0,
    array: 0,
    null: 0,
    missing: 183
  },
  dominantType: "string",
  mixedTypes: false,
  uniqueCount: 2,
  uniqueLimited: false,
  sampleValues: ["E_TIMEOUT", "E_VALIDATION"],
  min: null,
  max: null,
  maxStringLength: 12,
  averageStringLength: 8.5,
  isConstant: false,
  isMostlyMissing: true,
  isLongText: false,
  isLikelyIdentifier: false,
  isLikelyStatus: false,
  isLikelyError: true,
  isLikelyTime: false,
  sortScore: 0,
  visibility: {
    hiddenByDefault: false,
    reason: null
  }
}
```

Track type counts including missing. For memory, unique values capped:

```text id="w0cyqx"
Track up to 100 unique primitive display values.
If exceeded, uniqueLimited = true.
Do not stringify huge objects for uniqueness.
```

Number stats:

```text id="mcksoz"
min/max for numeric columns.
Ignore missing/null/non-number.
```

Boolean stats:

```text id="cpv2r1"
trueCount/falseCount useful if simple.
```

String stats:

```text id="b6501b"
max length
average length approximate
long text if maxStringLength > 240 or avg > 120
```

Constant column:

```text id="g7a11y"
presentCount > 0 and uniqueCount === 1 and missingCount === 0
```

Mostly missing:

```text id="telda9"
coverageRatio < 0.05
```

But error-like columns should not be hidden merely because sparse. Sparse error columns often most important.

## Semantic classification

Column profile should mark likely semantic roles.

Identity-like key if path leaf or full key matches:

```text id="ccpbqy"
id
uuid
guid
name
key
index
idx
requestId
jobId
taskId
runId
traceId
spanId
```

Status-like:

```text id="ifkwqk"
status
state
result
outcome
success
ok
passed
failed
isSuccess
isError
```

Error-like:

```text id="d6e4ld"
error
errors
exception
message
errorMessage
reason
code
errorCode
failure
failures
trace
stack
stderr
```

Time-like:

```text id="9g75pj"
createdAt
updatedAt
timestamp
time
date
duration
durationMs
elapsed
latency
startedAt
finishedAt
```

Count/metric-like:

```text id="tu9zoz"
count
total
size
bytes
ms
duration
latency
score
percent
rate
```

Use case-insensitive matching. Consider camelCase/snake_case/kebab-case. Implement helper normalize:

```text id="iqmbqu"
errorMessage -> error message
error_message -> error message
error-message -> error message
```

## Column ordering

Implement presets:

```text id="qhh4jx"
failureFirst
coverageFirst
originalOrder
alphabetical
```

Default: `failureFirst`.

### failureFirst order

Purpose: diagnosis scan.

Order groups:

```text id="ppjbp5"
1. Row system column later: # / health placeholder not part of flatten columns yet
2. identity columns
3. status/result columns
4. error/message/code columns
5. time/duration columns
6. high-coverage common scalar columns
7. metric/count columns
8. remaining useful scalar columns
9. sparse non-error columns
10. long text columns
11. object/array summary columns
12. constant columns
```

Within groups:

```text id="6grn1p"
higher coverage first
shallower path first
original discovery order
label alphabetical as final tie-breaker
```

Failure-like sparse columns must appear early:

```text id="5t8w1k"
error.code coverage 5% still near status/error group.
```

### coverageFirst

```text id="73kckc"
presentCount descending
shallower path
semantic priority tie-breaker
original order
```

### originalOrder

Discovery order from flattening:

```text id="zyl7b5"
keys appear in order first seen while walking rows/objects
```

Object property order should respect parsed object insertion order from JSON.

### alphabetical

```text id="eoun8q"
label localeCompare or simple stable compare
```

## Default visible columns

Column explosion problem. Need sane default.

Implement:

```js id="4ep3ph"
chooseDefaultVisibleColumns(columns, {
  maxVisibleColumns: 50
})
```

Default visible rules:

Show:

```text id="0yjl3r"
identity columns
status columns
error-like columns even sparse
time/duration columns
high coverage scalar columns
important metrics
```

Hide by default:

```text id="1xr42x"
constant columns
mostly missing non-error columns
long text columns unless error/message-like
object/array summary columns if many scalar columns exist
columns past maxVisibleColumns
deep columns after cap unless semantic important
```

Each hidden column needs reason:

```text id="8wawxa"
constant
mostly missing
long text
array/object summary
visible column cap
```

Need counts:

```text id="v7irkh"
visibleColumnCount
hiddenColumnCount
hiddenReasons summary
```

This chunk does not need full column picker UI. But state should have `visibleColumnKeys`.

## State integration

Extend state:

```js id="y8lnn3"
{
  extractedRows: [],
  flatRows: [],
  columns: [],
  visibleColumnKeys: [],
  columnOrderPreset: "failureFirst",
  flattenOptions: {
    mode: "dotPaths",
    arrayMode: "summary"
  },
  flattenStatus: "idle" | "flattening" | "ready" | "error",
  flattenError: null,
  flattenWarnings: [],
  columnProfileSummary: {
    totalColumns: 0,
    visibleColumns: 0,
    hiddenColumns: 0,
    mostlyMissingColumns: 0,
    constantColumns: 0,
    longTextColumns: 0
  }
}
```

When parse invalid/empty:

```text id="japf8x"
clear extractedRows, flatRows, columns, visibleColumnKeys, profiles
flattenStatus idle
```

When row source changes:

```text id="3h8eof"
extract rows
flatten rows
profile columns
order columns
choose default visible columns
update summaries
```

When column preset changes:

```text id="1yf953"
re-order existing columns
recompute visible keys if user has not manually customized visibility yet
manual visibility later chunk may override
```

Need avoid stale async issue if operations later become debounced. For now sync okay, but compare parse/row source snapshot or action id if useful.

## UI requirements in this chunk

Mapping/options pane should add controls:

```text id="fac2vi"
Flatten mode: Dot paths (enabled, only option for now)
Array handling: Summary (enabled, only option for now)
Column order: Failure-first / Coverage-first / Original / Alphabetical
Visible columns: N shown / M hidden
```

Result pane placeholder becomes data summary, not table yet.

Show:

```text id="b9uyyu"
Flattened data ready.

Rows: 200
Columns discovered: 63
Visible by default: 38
Hidden by default: 25

Top columns:
1. id
2. success
3. status
4. error.code
5. error.message
6. durationMs

Column notes:
- 9 mostly missing columns hidden
- 4 constant columns hidden
- 3 long text columns hidden
- Arrays are shown as summary cells
```

If flatten error:

```text id="1mwa9k"
Could not flatten selected row source.
Selected source may no longer exist. Re-select row source or re-parse input.
```

If no selected source:

```text id="7r3o3k"
Select a row source before flattening.
```

Use RetroOS panels/lists/status lines. Custom CSS only for compact column summary.

## Status strip updates

After flatten ready:

```text id="gmeqc6"
Valid JSON · source results[] · 200 rows · 63 columns · 38 visible
```

If warnings:

```text id="wwbe5j"
Valid JSON · source results[] · 200 rows · 1,000+ columns · warnings
```

Columns count now real. Failures still 0 until chunk 05.

## Logger instrumentation

Required logs:

```text id="oi5mg2"
[JTI:Flatten] Attempt extract rows { sourcePathLabel, sourceKind }
[JTI:Flatten] Extract rows succeeded { rowCount }
[JTI:Flatten] Attempt flatten rows { rowCount, mode, arrayMode }
[JTI:Flatten] Flatten row sampled/warning { rowIndex, warningCode }
[JTI:Flatten] Flatten succeeded { rowCount, columnCount, durationMs }
[JTI:Columns] Attempt profile columns { rowCount, columnCount }
[JTI:Columns] Profile succeeded { columnCount, mostlyMissing, constant, longText, durationMs }
[JTI:Columns] Order columns { preset, columnCount }
[JTI:Columns] Default visible columns chosen { visibleCount, hiddenCount, maxVisibleColumns }
[JTI:Flatten] Failed { code, message }
```

Do not log raw values. Column keys are acceptable if not too many. Limit list logs:

```text id="1dtf7q"
topColumnKeys first 10 only
hiddenReasonCounts only
```

## Tests

Add tests.

### Row extraction tests

```text id="oygpv7"
extract root array rows
extract object path array rows
extract JSONL rows with sourceLineNumber
extract objectAsRow
extract primitive array rows
missing selected path returns E_ROW_SOURCE_MISSING
stale non-array source for array candidate returns structured error
```

### Flatten tests

```text id="y4cave"
flatten simple object
flatten nested object to dot path
flatten arrays as summary cells
flatten object arrays as summary
flatten empty array
flatten empty object
distinguish missing vs null
distinguish empty string vs missing
mixed schema produces union columns
root primitive row uses value column
column key collision avoided for a.b vs nested a.b
long strings truncated in display but raw value preserved
maxDepth creates summary/warning
maxColumns creates warning and stops adding new columns safely
original row JSON preserved
sourcePath/sourceLineNumber preserved
```

### Profile tests

```text id="jjt6gx"
present/missing/null counts correct
coverageRatio correct
type counts correct
dominant type correct
mixedTypes detected
uniqueCount capped
numeric min/max correct
boolean true/false count if implemented
string max/avg length
constant column detected
mostly missing column detected
long text column detected
identity/status/error/time classification
```

### Ordering tests

```text id="dq30st"
failureFirst puts id/status/error early
failureFirst keeps sparse error columns early
coverageFirst sorts by present count
originalOrder preserves discovery order
alphabetical sorts labels
arrays/objects later than scalar columns
constant columns late
long text late unless message/error-like
```

### Visibility tests

```text id="2p4fvr"
default visible cap enforced
error-like sparse column remains visible
mostly missing non-error hidden
constant hidden
long text hidden unless error/message-like
hidden reason assigned
visible/hidden counts correct
```

Use robust tests. Avoid overfitting exact score numbers unless constants intentionally exported.

## Manual checklist

```text id="gn1jkh"
Paste object with results array.
Row source selected from chunk 03.
Flatten summary shows correct row count and column count.
Nested fields appear in top columns summary.
Mixed schemas create union columns.
Null and missing are counted differently in diagnostics if visible.
Arrays summarized, not exploded.
Column order preset changes top column order.
Visible/hidden counts update.
Single object fallback becomes 1 row and columns.
JSONL records flatten into rows.
Primitive array uses value column.
Invalid JSON clears flatten summary and keeps parse error.
Changing row source recomputes flatten summary.
Console logs extract/flatten/profile/order without raw values.
```

## Edge cases

### Mixed schemas

Input:

```json id="w4t9qa"
[
  { "id": 1, "ok": true },
  { "id": 2, "error": { "code": "E1" } },
  { "id": 3, "ok": null, "extra": "x" }
]
```

Expected:

```text id="30c64w"
columns: id, ok, error.code, extra
id present 3
ok present 2, null 1, missing 1? Careful:
- row 1 ok true = present
- row 2 ok missing
- row 3 ok null = null/present
So presentCount maybe includes null? Define clearly.
```

Definition:

```text id="xgrmpw"
presentCount = rows where path exists, including null/empty.
missingCount = rows where path absent.
valueCount = rows where state value/empty, excluding null/missing if useful.
nullCount separate.
coverageRatio = presentCount / rowCount.
```

### Present null

```json id="zvj2na"
{ "error": null }
```

`error` path exists. State `null`. Present yes. Null count yes.

### Missing nested path

If one row has `error.code`, other row has no `error`, then `error.code` missing for other row.

### Parent object plus child leaves

Input:

```json id="lm2u7n"
{ "error": { "code": "E1", "message": "bad" } }
```

Default columns:

```text id="oc4010"
error.code
error.message
```

No `error` summary column unless includeObjectSummaries true.

If object empty:

```json id="d0phqc"
{ "error": {} }
```

Column:

```text id="dpma46"
error = "{}"
```

Because no leaves exist.

### Array child

Input:

```json id="52da17"
{ "errors": [{ "code": "E1" }, { "code": "E2" }] }
```

Default:

```text id="fvr0wl"
errors = "[2 objects]"
```

No `errors[0].code` columns in this chunk.

### Special numeric-looking keys

Input:

```json id="p5a96h"
{ "0": "zero", "1": "one" }
```

Do not treat object keys as array indexes. Path keys are strings.

### Date strings

Do not parse/coerce dates. Keep strings. Time-like classification based on key, not value coercion.

### Numbers

Do not format with locale in core. Display `String(value)`. UI can later format if needed.

### Big integers

JSON.parse returns number, possible precision issue inherent to JSON.parse. Do not fix in this chunk. Maybe warning later if huge numbers detected; optional.

## Security

Flattened values come from untrusted JSON.

Rules:

```text id="7h8vfx"
Never render cell display via innerHTML.
Use textContent later.
Do not log raw values.
Do not stringify entire original rows in logs.
Do not eval path labels.
Use path arrays for access.
Do not mutate original row objects.
```

## Performance

Target:

```text id="4f7dzw"
200 rows x 50 columns instant.
1,000 rows x 200 columns acceptable.
```

Need avoid worst memory where possible:

```text id="5srxha"
Do not store explicit missing cell object for every row/column if avoidable.
Profile missing by comparing present counts to row count.
Sample unique values with cap.
Truncate display strings.
Limit columns with maxColumns.
```

Core pure functions can be synchronous.

## Done criteria

Chunk `04` done when:

```text id="l6yqaz"
Selected row source extracts source rows.
Flattening creates dot-path columns.
Nested objects become leaf columns.
Arrays become summary cells, not exploded.
Null, missing, empty string, empty array/object are distinguished.
Mixed schemas produce union columns.
Original row JSON preserved per row.
Column keys handle weird keys and collisions.
Column profiles include coverage, types, missing/null counts, samples, semantic flags.
Column order presets work.
Default visible columns chosen with hidden reasons.
State updates rows/columns/visible keys after row source changes.
Mapping/result UI shows flatten summary and top columns.
Status strip shows real rows/columns/visible count.
Logger instruments extract/flatten/profile/order without raw values.
Tests cover extraction, flattening, profiling, ordering, visibility, edge cases.
Agent ran tests/build or documented blocker.
Agent self-reviewed and fixed critical/medium issues.
No full table renderer/filter/export/failure scoring implemented yet.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Implement flattening, column profiling, and ordering only. Do not implement final table renderer, row health scoring, filters, or export.

10-spec roadmap:

```text id="o4329k"
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

```text id="dlo21s"
Read 00 spec.
Read 01, 02, 03 implementation.
Inspect repo.
Inspect current state contracts.
Plan file changes.
Implement only chunk 04.
Add/update tests.
Run tests.
Run build/dev smoke if available.
Self-review diff.
Fix critical/medium issues.
Report exact commands and result.
```

No broad rewrite. No fake pass.

# Appendix C — RetroOS framework rule

Use RetroOS components for mapping/options and summary UI.

Expected usage:

```text id="tkoxpm"
panel for flatten summary
field/select for column order preset
status line for rows/columns
list for top columns and warnings
alert/note for flatten warnings
```

Custom CSS allowed for compact summary layout only.

Do not build custom modern UI system.

# Appendix D — Data fidelity rule

Flattened table is derived view. Original data remains source of truth.

Mandatory:

```text id="l3gxgp"
Preserve original parsed root.
Preserve original row object.
Preserve raw cell value.
Do not mutate parsed JSON.
Do not coerce null/missing/empty together.
Do not destroy long strings; truncate display only.
```

# Appendix E — Missing/null definitions

Use these definitions consistently:

```text id="tsh4f3"
missing = path absent in row
null = path present with value null
emptyString = path present with ""
emptyArray = path present with []
emptyObject = path present with {}
presentCount = row count where path exists, including null/empty
missingCount = row count where path absent
coverageRatio = presentCount / totalRows
```

# Appendix F — Array handling rule

Default array mode is summary.

```text id="0jj1r3"
Primitive array -> joined display if short.
Object array -> [N objects].
Mixed array -> [N items: type, type].
Empty array -> [].
Raw array preserved.
No row explosion.
No indexed columns by default.
```

# Appendix G — Column ordering principle

Default order must help failure scanning.

Priority:

```text id="2yvfnn"
identity
status/result
error/message/code
time/duration
common scalar fields
metrics/counts
remaining scalar
sparse non-error
long text
object/array summaries
constant columns
```

Sparse error columns stay early.

# Appendix H — Logger rules repeated

Log attempt/outcome.

Pattern:

```text id="fmvqop"
[JTI:Flatten] Attempt flatten rows { rowCount, mode }
[JTI:Flatten] Flatten succeeded { rowCount, columnCount, durationMs }
[JTI:Columns] Profile succeeded { columnCount, hiddenCount }
```

Never log raw row values or full objects.

# Appendix I — Self-review checklist

Before final report, check:

```text id="1nl0t5"
Does flatten mutate original data?
Are missing and null distinct?
Do weird keys avoid collisions?
Do arrays summarize, not explode?
Do empty object/array produce visible cells?
Does mixed schema produce union columns?
Are sparse error columns not hidden by default?
Are long strings display-truncated only?
Does JSONL line number survive extraction?
Does row-source change recompute flatten data?
Does invalid parse clear flatten data?
Does logger avoid raw values?
Are tests not brittle about exact ordering unless intended?
```

Fix critical/medium issues.

# Appendix J — Suggested final report format

```text id="9akhkn"
Summary:
- Added row extraction from selected source.
- Added dot-path flattening and cell model.
- Added column profiling, ordering, and default visibility.

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
- Final table renderer, row health scoring, filters, and export intentionally not implemented until later chunks.
```
