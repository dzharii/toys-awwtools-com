# 03-row-source-detection-and-selection.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `03`: **row-source detection and selection**. Goal: after input parses, app inspects parsed JSON and finds likely records to display as table rows. User sees selected row source, confidence, row count, and alternate candidates. User can manually choose different row source. No flattening/table rendering yet. This chunk only identifies “what should become rows.”

This chunk value: arbitrary JSON has many shapes. User should not need to manually know path before seeing useful structure. App guesses row source, explains guess, and gives override.

## Scope

Implement:

```text id="fpfknv"
JSON tree walker
row-source candidate detection
candidate scoring
confidence levels
automatic best candidate selection
manual row-source selector UI
selection persistence in app state
diagnostics/explanation for why source chosen
tests for detection/scoring
status updates after parse
console logger instrumentation
```

Do not implement flattening.

Do not implement table rendering.

Do not implement failure scoring.

Do not implement export.

## Product behavior

After valid parse:

```text id="30q5r8"
App finds possible row sources.
App selects best candidate.
App shows selected path and confidence.
App shows alternate candidates.
App lets user choose another candidate.
App shows clear fallback if no useful row source found.
```

Examples:

Root array:

```json id="gqb9sd"
[
  { "id": 1, "success": true },
  { "id": 2, "success": false }
]
```

UI:

```text id="vnckd2"
Detected row source: root[] · 2 rows · High confidence
Reason: root is an array; items are objects; repeated keys found.
```

Object with result array:

```json id="3yqlm2"
{
  "jobId": "batch-123",
  "results": [
    { "id": 1, "ok": true },
    { "id": 2, "ok": false }
  ]
}
```

UI:

```text id="hybugr"
Detected row source: results[] · 2 rows · High confidence
Reason: largest object array; repeated keys found; result-like path name.
```

Many arrays:

```json id="qf6rmu"
{
  "metadata": { "jobId": "abc" },
  "errors": [{ "code": "E1" }],
  "items": [{ "id": 1 }, { "id": 2 }, { "id": 3 }]
}
```

UI:

```text id="vnz4d7"
Detected row source: items[] · 3 rows · Medium confidence
Other candidates: errors[] · 1 row
```

Single object:

```json id="y6uwgf"
{
  "id": "job-1",
  "status": "failed",
  "error": { "message": "timeout" }
}
```

UI:

```text id="kbbrrt"
Detected row source: root object as one row · Low confidence
Reason: no arrays found; showing root object as one row.
```

JSONL:

```jsonl id="2cq4eg"
{"id":1,"success":true}
{"id":2,"success":false}
```

UI:

```text id="v3saby"
Detected row source: JSONL records · 2 rows · High confidence
Reason: input parsed as JSONL; each non-empty line is one record.
```

## Required data model

Create pure module:

```text id="twjshy"
src/core/detect-row-source.js
```

Suggested exports:

```js id="9b2q3u"
export function findRowSourceCandidates(parseResult, options = {}) {}
export function chooseBestRowSource(candidates, options = {}) {}
export function getValueAtPath(root, path) {}
export function formatPathLabel(path, candidateKind) {}
export function scoreRowSourceCandidate(candidate, context = {}) {}
```

Can split tree walking into:

```text id="0sk65i"
src/core/walk-json.js
```

Suggested exports:

```js id="1u56aj"
export function walkJson(value, visitor, options = {}) {}
export function getTypeTag(value) {}
export function isPlainObject(value) {}
export function isPrimitive(value) {}
```

Keep core pure. No DOM. No state store. No RetroOS imports.

## Candidate contract

Candidate object should be stable for later chunks.

Suggested shape:

```js id="u3zrb8"
{
  id: "path:results",
  kind: "array" | "jsonl" | "objectAsRow" | "primitiveArray" | "keyValueObject",
  path: ["results"],
  pathLabel: "results[]",
  parentPath: [],
  rowCount: 200,
  itemType: "object",
  itemTypeMix: {
    object: 198,
    null: 1,
    string: 1
  },
  repeatedKeyCount: 12,
  commonKeys: ["id", "success", "status", "error"],
  score: 94,
  confidence: "high",
  reasons: [
    "Largest array of objects",
    "Most items are objects",
    "Repeated keys across rows",
    "Path name suggests records"
  ],
  warnings: []
}
```

For JSONL:

```js id="8u2y5s"
{
  id: "jsonl:root",
  kind: "jsonl",
  path: [],
  pathLabel: "JSONL records",
  rowCount: 200,
  itemType: "object",
  score: 100,
  confidence: "high",
  reasons: [
    "Input parsed as JSONL",
    "Each non-empty line is one record"
  ]
}
```

For root array:

```js id="wqqto8"
{
  id: "path:$",
  kind: "array",
  path: [],
  pathLabel: "root[]",
  rowCount: 200
}
```

For object as one row:

```js id="kuhst2"
{
  id: "object:$",
  kind: "objectAsRow",
  path: [],
  pathLabel: "root object",
  rowCount: 1,
  confidence: "low",
  reasons: ["No useful arrays found; root object can be shown as one row"]
}
```

Candidate IDs must be deterministic across same input.

## Detection strategy

Input: `parseResult` from chunk 02.

If parse invalid or empty:

```text id="2hqw09"
return []
do not throw
UI says parse input first/fix parse error
```

If `parseResult.kind === "jsonl"`:

```text id="9tvn6j"
Create JSONL candidate from root array.
Also optionally inspect nested arrays inside line values, but JSONL records should usually win.
```

If root JSON array:

```text id="ndz6ka"
Create root array candidate.
Also inspect nested arrays, but root array usually wins if row-like.
```

If root JSON object:

```text id="nqwfh6"
Walk object tree.
Collect all arrays.
Score each array.
If no array candidates useful, add objectAsRow fallback.
```

If root primitive:

```text id="bmtdt4"
No table-worthy source.
Optional primitive single value candidate with low confidence.
UI says parsed value is not object/array; table may not be useful.
```

## Tree walking rules

Walk parsed root recursively.

Track path as array:

```js id="49xav1"
["data", "items", 0, "children"]
```

But row source paths should usually point to arrays, no item index in label unless nested array inside array item.

Need avoid huge/deep traversal blowups.

Limits:

```text id="6r9r6x"
maxDepth default: 12
maxNodes default: 50_000
maxArrayItemsToSample default: 100
maxCandidates default: 100
```

If limit hit:

```text id="uqjibj"
return candidates found so far
add warning: "Detection sampled large input for performance"
log warning
UI can show diagnostic
```

Do not crash on circular objects. Parsed JSON cannot contain cycles, but defensive guard okay.

## Array candidate analysis

For each array:

Calculate:

```text id="87ql56"
rowCount = array.length
sampleSize = min(rowCount, maxArrayItemsToSample)
itemTypeMix
objectItemCount
primitiveItemCount
arrayItemCount
nullItemCount
commonKeys among object items
repeatedKeyCount
averageObjectKeyCount
pathName
depth
containsFailureLikeKeys
containsIdentityLikeKeys
```

Type tags:

```text id="zes06x"
object
array
string
number
boolean
null
```

Common keys:

```text id="cvgm85"
Key appears in at least 2 object items or at least 30% of sampled object items.
```

For small arrays:

```text id="n2o7mg"
If array length 1, repeated key count may be 0. Still candidate if item is object.
```

## Scoring heuristic

Score should be understandable, not magic. Use additive scoring.

Suggested factors:

Strong positive:

```text id="becxi1"
+40 root array and item mostly objects
+35 JSONL records
+30 array has 2+ object items
+25 object item ratio >= 0.8
+20 repeated keys >= 3
+15 rowCount >= 10
+10 rowCount >= 2
+10 path name record-like: items, results, records, rows, data, entries, events, logs, tests, cases
+10 failure-like keys found: success, ok, failed, status, state, error, errors, message, code
+8 identity-like keys found: id, uuid, name, key, index
+5 depth <= 3
```

Negative:

```text id="issq3e"
-30 empty array
-25 mostly primitives
-20 mostly arrays
-15 deeply nested depth > 6
-10 path name metadata/config/options/tags/categories
-10 rowCount === 1 unless object is rich
-10 mixed item types heavy
```

Special:

```text id="u1pykq"
Root array of primitives can still be candidate, but low/medium.
Array of strings/numbers useful as one-column table, but not ideal.
```

Confidence mapping:

```text id="p7y26i"
score >= 75 -> high
score >= 45 -> medium
score >= 20 -> low
else -> veryLow or omit unless no alternatives
```

Candidate filtering:

```text id="kzpgpp"
Keep all high/medium.
Keep low if no better candidate or user may need alternate.
Omit empty arrays unless no other candidates and useful diagnostic.
```

Sorting:

```text id="42d8z5"
score descending
rowCount descending as tie-breaker
shallower depth as tie-breaker
path label alphabetical as final tie-breaker
```

Need reasons:

Every score factor should map to human reason.

Example reasons:

```text id="l7kau2"
"Root is an array"
"Input is JSONL"
"Array has 200 items"
"Most sampled items are objects"
"Items share keys: id, success, error"
"Path name results suggests records"
"Includes failure-like fields: success, error"
```

Warnings:

```text id="1bkmgh"
"Array is empty"
"Items have mixed types"
"Detection sampled first 100 of 5,000 items"
"Candidate is deeply nested"
```

## Path labels

User-facing labels:

```text id="r49ktj"
root[]                         for path []
results[]                      for ["results"]
data.items[]                   for ["data", "items"]
batches[0].items[]             only if path includes actual array index
JSONL records                  for JSONL
root object                    for objectAsRow
```

Need safely handle keys with dots/spaces.

Internal path array stays exact.

Display path label can use bracket notation when needed:

```text id="yd26e2"
normal key: data.items[]
weird key: data["weird.key"][]
space key: data["job items"][]
```

Implement label formatter robust enough.

## Selection state

Extend central state:

```js id="t373pz"
{
  rowSourceCandidates: [],
  selectedRowSourceId: null,
  selectedRowSourcePath: null,
  selectedRowSource: null,
  rowSourceStatus: "none" | "detecting" | "detected" | "not-found",
  rowSourceWarning: null
}
```

On valid parse:

```text id="kmqhvw"
detect candidates
choose best
set candidates
set selected source
status detected or not-found
```

On invalid/empty parse:

```text id="t66z6f"
clear candidates
clear selected source
status none
```

On manual selection:

```text id="edkg0x"
set selectedRowSourceId
set selectedRowSource
do not re-auto-select until parse result changes
log selection
```

When input changes and parse result changes:

```text id="x0q78k"
Run detection again.
If previous selected source ID still exists, keep it.
Else choose best candidate.
```

This prevents user override from disappearing during small edits if same path remains.

## UI requirements

Right top “Mapping / Options” pane becomes active.

Show:

```text id="bqxk1z"
Detected row source
Confidence badge
Row count
Item type
Reason summary
Candidate selector/dropdown
Warnings if any
```

Suggested layout:

```text id="vwgau5"
Mapping / Options

Row source
[results[] · 200 rows · High confidence  v]

Confidence: High
Item type: object
Rows: 200

Why this source?
- Largest array of objects
- Items share keys: id, success, status, error
- Path name results suggests records

Other candidates: 3
```

Use RetroOS:

```text id="1l6iwb"
field
select/listbox
panel
status line
badge/alert if available
```

If no candidates:

```text id="s00k3h"
No row source found yet.

Parsed input is valid, but we did not find an array of records.
Next fallback: later chunks may show root object as key-value table.
```

But because this chunk should add object-as-row fallback for root object, no candidates mostly for primitives/empty.

For root primitive:

```text id="4kfhmw"
Valid JSON, but root value is a string/number/boolean/null.
Tables work best with arrays or objects.
```

For empty array:

```text id="tsvhid"
Root array is empty. No rows to display.
```

For JSONL:

```text id="o1mx1n"
Row source selector can show only "JSONL records" plus nested candidates if found.
```

## Result pane placeholder update

Right bottom result pane still no table. Show selected source summary.

Example:

```text id="5ht13c"
Input parsed. Row source selected.

Source: results[]
Rows: 200
Item type: object
Confidence: High

Flattening and table rendering arrive in next chunks.
```

If invalid parse:

```text id="j8zwxt"
Fix parse error before row-source detection can run.
```

If no input:

```text id="q6g8vg"
Paste JSON or JSONL to detect row source.
```

## Status strip updates

After valid parse and detection:

```text id="18zjrw"
Valid JSON · source results[] · 200 rows · confidence high
```

JSONL:

```text id="7julkr"
Valid JSONL · source JSONL records · 200 rows · confidence high
```

No source:

```text id="75h5f7"
Valid JSON · no table row source found
```

Invalid parse:

```text id="n1rth6"
Invalid JSON · fix parse error to continue
```

Rows count in status can now reflect selected row source row count.

Columns still 0. Failures still 0.

## Logger instrumentation

Extend logger from chunk 02.

Required logs:

```text id="onlq9u"
[JTI:RowSource] Attempt detection { kind, rootType, charCount }
[JTI:RowSource] Candidate found { pathLabel, rowCount, itemType, score }
[JTI:RowSource] Detection sampled large input { pathLabel, sampleSize, rowCount }
[JTI:RowSource] Detection succeeded { candidateCount, selectedPathLabel, confidence, durationMs }
[JTI:RowSource] Detection found no candidate { rootType }
[JTI:RowSource] Manual source selected { pathLabel, rowCount }
[JTI:RowSource] Detection failed { code, message }
```

Do not log full parsed objects or row data.

Safe details only:

```text id="kxag5p"
kind
rootType
candidateCount
pathLabel
rowCount
itemType
score
confidence
durationMs
sampleSize
warnings count
```

## Tests

Add tests for detection.

Required cases:

```text id="bqlye5"
invalid parse result -> []
empty parse result -> []
root array of objects -> root[] high
root array of primitives -> root[] low/medium
object with results array -> results[] selected
object with items array and metadata array -> items[] selected
object with many arrays -> highest score selected
JSONL parse result -> JSONL records selected high
single root object no arrays -> objectAsRow fallback low
root primitive -> no useful source or primitive fallback, per implementation
empty array -> candidate/warning or no rows diagnostic
array of mixed objects/primitives -> warning mixed types
deep nested array -> candidate but lower score
record-like path names boost score
metadata/config path names reduce score
failure-like keys boost score
identity-like keys boost score
candidate IDs deterministic
path label handles dot key and space key
previous selection preserved if same candidate ID still exists
selection falls back to best if previous ID gone
large array samples limited
```

Example test:

```js id="j8u5ki"
test("selects object results array over metadata arrays", () => {
  const parseResult = {
    ok: true,
    kind: "json",
    root: {
      metadata: { tags: ["a", "b"] },
      results: [
        { id: 1, success: true },
        { id: 2, success: false, error: { code: "E1" } }
      ]
    },
    meta: { rootType: "object" },
    warnings: []
  };

  const candidates = findRowSourceCandidates(parseResult);
  const best = chooseBestRowSource(candidates);

  expect(best.pathLabel).toBe("results[]");
  expect(best.confidence).toBe("high");
});
```

Avoid brittle exact score tests unless score constants intentionally exported. Prefer relative assertions:

```text id="9126ff"
results score > tags score
confidence is high/medium
reason includes repeated/object/path concepts
```

## UI/manual test checklist

Manual:

```text id="lv21wh"
Paste root array. Source shows root[] high confidence.
Paste object with results array. Source shows results[].
Paste object with items and errors arrays. Selector lists both.
Choose alternate source. Selection updates result placeholder/status.
Edit input but keep same path. Selection preserved.
Edit input removing path. Selection falls back to best.
Paste single object. Root object fallback shown.
Paste JSONL. JSONL records selected.
Paste primitive JSON like "hello". Shows no useful table source message.
Paste invalid JSON. Detection cleared and parse error remains.
Large array does not freeze badly.
Console logs detection attempt/outcome without data dump.
```

## Edge cases

### Array of arrays

Example:

```json id="tmqc6u"
[[1,2], [3,4]]
```

Possible behavior:

```text id="e97ul8"
Candidate root[] with itemType array, low confidence.
Warn: items are arrays; later table may show indexes/summary.
```

### Array of primitives

Example:

```json id="grrdz7"
["a", "b", "c"]
```

Behavior:

```text id="cld4wu"
Candidate root[] with itemType string, low/medium confidence.
Reason: root is array.
Warning: items are primitive values.
```

### Empty array

Example:

```json id="2o9f61"
[]
```

Behavior:

```text id="ysdpve"
No rows. Show source root[] with 0 rows or no-source diagnostic.
Preferred: source root[] selected with warning "Array is empty".
```

### Object with only scalar keys

Example:

```json id="fksjcy"
{ "id": "abc", "status": "failed" }
```

Behavior:

```text id="seatzb"
objectAsRow fallback.
Rows: 1.
Confidence: low.
```

### Object with nested arrays inside each item

Example:

```json id="nkauzy"
{
  "items": [
    { "id": 1, "attempts": [{ "n": 1 }] },
    { "id": 2, "attempts": [{ "n": 1 }, { "n": 2 }] }
  ]
}
```

Detection should prefer `items[]` over `items[0].attempts[]` because:

```text id="0tworj"
shallower
larger parent record source
record-like name
more top-level repeated keys
```

Nested arrays can still appear as candidates.

### Path with special key

Input:

```json id="o2rwl3"
{
  "job.results": [
    { "id": 1 }
  ],
  "job items": [
    { "id": 2 }
  ]
}
```

Labels:

```text id="o6pjvy"
["job.results"][]
["job items"][]
```

Internal path must not split on dot.

### Very large root

Detection should sample, not fully inspect every item deeply.

```text id="epewrf"
For array item analysis, inspect first maxArrayItemsToSample items.
For tree walking, respect maxNodes.
Show warning if sampling affected result.
```

## Security

Parsed JSON still untrusted data.

Rules:

```text id="trywwo"
Do not use candidate path labels via innerHTML.
Use textContent.
Do not log data values.
Do not eval path strings.
Use path arrays for access, not string eval.
```

## Done criteria

Chunk `03` done when:

```text id="2crswr"
Valid parsed input triggers row-source detection.
Root array selected correctly.
JSONL records selected correctly.
Object-with-array selected correctly.
Multiple candidates listed.
Manual selection works.
Selection preserved when same path remains after edit.
Single root object gets objectAsRow fallback.
Primitive/empty inputs get clear diagnostic.
Candidate includes row count, item type, score/confidence, reasons, warnings.
UI shows selected source, confidence, reasons, selector.
Status strip reflects selected row source and row count.
Result pane placeholder reflects selected source.
Logger instruments detection and manual selection.
No full user data logged.
Detection tests cover common and edge cases.
Agent ran tests/build or documented blocker.
Agent self-reviewed and fixed critical/medium issues.
No flattening/table/failure/export implemented yet.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Implement row-source detection and selection only. Do not implement flattening or table rendering.

10-spec roadmap:

```text id="r38x27"
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

```text id="gxecms"
Read 00 spec.
Read 01 and 02 implementation.
Inspect repo.
Inspect RetroOS framework exports.
Plan file changes.
Implement only chunk 03.
Add/update tests.
Run tests.
Run build/dev smoke if available.
Self-review diff.
Fix critical/medium issues.
Report exact commands and result.
```

No broad rewrite. No fake pass.

# Appendix C — RetroOS framework rule

Use RetroOS components for mapping/options UI.

Expected usage:

```text id="lt48nb"
field/select for row source selector
panel for Mapping / Options
status line/badges for row count/confidence
alert or note for no-source warning
list for reasons/warnings if framework supports list
```

Custom CSS only for small layout/readability gaps.

Do not create modern SaaS card system.

# Appendix D — Heuristic transparency rule

Detection is guess. Guess must be visible.

UI must show:

```text id="dpjp80"
selected source path
row count
confidence
reason list
warnings if any
alternate candidates
manual override control
```

No hidden magic. User can override.

# Appendix E — Scoring tuning rule

Heuristic can be adjusted by agent if tests and product intent hold.

Preserve principles:

```text id="fpr1yj"
arrays of repeated objects beat primitive arrays
JSONL records beat nested arrays
root object fallback exists
record-like names help
metadata/config names hurt
failure/identity keys help
shallow sources usually beat deep nested arrays
large row count helps but does not alone win
```

# Appendix F — Logger rules repeated

Log attempt/outcome.

Pattern:

```text id="o8ygky"
[JTI:RowSource] Attempt detection { safeDetails }
[JTI:RowSource] Candidate found { safeDetails }
[JTI:RowSource] Detection succeeded { safeDetails }
[JTI:RowSource] Manual source selected { safeDetails }
```

Never log full parsed row/object.

# Appendix G — Self-review checklist

Before final report, check:

```text id="dx9zjl"
Does invalid parse clear detection?
Does JSONL select JSONL records?
Does root array select root[]?
Does object results[] beat metadata/tags arrays?
Does single object fallback exist?
Does primitive JSON avoid confusing table promise?
Can user select alternate candidate?
Does selection survive small edits?
Are labels safe for weird keys?
Does code use path arrays, not eval?
Does logger avoid data dumps?
Are tests relative, not brittle exact scores?
```

Fix critical/medium issues.

# Appendix H — Suggested final report format

```text id="n1n8d3"
Summary:
- Added row-source detection and scoring.
- Added row-source selector UI.
- Added detection diagnostics and logging.

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
- Flattening/table rendering intentionally not implemented until later chunks.
```
