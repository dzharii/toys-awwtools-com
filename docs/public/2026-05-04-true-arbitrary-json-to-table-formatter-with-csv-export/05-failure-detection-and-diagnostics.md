# 05-failure-detection-and-diagnostics.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `05`: **failure detection and diagnostics**. Goal: after rows are extracted, flattened, profiled, and ordered, app analyzes rows and columns for likely failures. App assigns each row a health level, records transparent reasons, summarizes dataset health, and shows diagnostics that help user understand what happened. No full interactive table renderer yet. Row health data created here will be used by chunk `06`.

This chunk value: user pasted batch output because they need find failures fast. A flat table helps, but failure-first diagnostics make tool useful immediately. App should surface likely bad rows without pretending it knows business truth perfectly.

## Scope

Implement:

```text id="aux4hm"
row health scoring
failure/warning/ok/unknown classification
failure reason generation
dataset health summary
failure-like column diagnostics
missing-field diagnostics
schema consistency diagnostics
parse/detection/flatten diagnostics aggregation
diagnostics UI panel/summary
state integration
tests for row health and diagnostics
logger instrumentation
```

Do not implement final table renderer.

Do not implement global search/filter/sort UI.

Do not implement column picker.

Do not implement export.

Do not mutate original parsed JSON.

## Product behavior after this chunk

Given flattened rows and columns:

```text id="su2gvu"
App scores each row.
App assigns health: failure / warning / ok / unknown.
App explains why row was flagged.
App shows counts: failures, warnings, ok, unknown.
App shows diagnostics: sparse columns, mixed schemas, missing expected fields, parse/source/flatten warnings.
App updates status strip.
```

Example input:

```json id="yvpwpj"
[
  { "id": 1, "success": true, "durationMs": 120 },
  { "id": 2, "success": false, "error": { "code": "E_TIMEOUT", "message": "Timed out" } },
  { "id": 3, "status": "warning", "message": "Retry used" },
  { "id": 4, "status": "complete" }
]
```

Expected health:

```text id="o2pjcv"
row 1: ok
row 2: failure, reasons: success=false, error.code present, error.message present
row 3: warning, reasons: status=warning, message contains retry
row 4: ok or unknown depending status vocabulary
```

UI summary:

```text id="xb823b"
Rows: 4
Likely failures: 1
Warnings: 1
OK: 2
Unknown: 0

Top failure signals:
- success=false: 1 row
- error.code present: 1 row
- status=warning: 1 row
```

## Design principle

Failure detection is heuristic. It must be useful, transparent, and reversible.

Rules:

```text id="tn2bp1"
Never hide rows because heuristic says OK.
Never delete data.
Never claim "definitely failed" unless data explicitly says failed/error.
Always show reason for failure/warning.
Allow future chunks to filter by health but not in this chunk.
Use "likely failure" language in UI where uncertainty exists.
```

Health labels:

```text id="huzcgb"
failure = strong negative signal
warning = suspicious/needs attention but not hard failure
ok = clear positive signal and no negative signal
unknown = no clear positive or negative signal
```

## Required modules

Create pure modules:

```text id="0dvjg5"
src/core/detect-failures.js
src/core/build-diagnostics.js
```

Existing structure may combine if clean, but keep functions testable.

Suggested exports:

```js id="0exuuy"
export function scoreRows(flatRows, columns, options = {}) {}
export function scoreRow(flatRow, columns, options = {}) {}
export function evaluateCellSignal(cell, column, options = {}) {}
export function buildDatasetHealthSummary(scoredRows, columns, options = {}) {}
export function buildDiagnostics(context, options = {}) {}
export function classifyStatusValue(value) {}
export function isFailureLikeColumn(column) {}
export function isSuccessLikeColumn(column) {}
```

No DOM in core.

## Row health contract

Each flat row gets health object.

Suggested:

```js id="pq1czc"
{
  rowIndex: 1,
  sourcePath: ["results", 1],
  sourceLineNumber: null,
  original: { ... },
  values: { ... },
  health: {
    level: "failure",
    score: 145,
    confidence: "high",
    reasons: [
      {
        code: "BOOLEAN_FALSE_FAILURE",
        severity: "failure",
        columnKey: "success",
        label: "success=false",
        detail: "Column success is false.",
        weight: 60
      },
      {
        code: "ERROR_CODE_PRESENT",
        severity: "failure",
        columnKey: "error.code",
        label: "error.code present",
        detail: "Error code is E_TIMEOUT.",
        weight: 45
      }
    ],
    topReason: "success=false",
    signalCounts: {
      failure: 2,
      warning: 0,
      ok: 0
    }
  }
}
```

Do not store full raw values inside reason detail if value can be huge. Use safe display values capped.

Health levels by score:

```text id="c823wx"
score >= 60 or any hard failure signal -> failure
score >= 20 -> warning
score <= -20 and no negative signals -> ok
otherwise -> unknown
```

Can tune thresholds, but tests should validate behavior.

Confidence:

```text id="p443yl"
high = explicit failure/success fields or error object
medium = status/message keyword signals
low = weak/missing/schema signals only
```

## Signal model

Each row gets signals from columns/cells.

Signal object:

```js id="sh1a03"
{
  code: "STATUS_FAILED",
  severity: "failure" | "warning" | "ok" | "info",
  columnKey: "status",
  label: "status=failed",
  detail: "Status field contains failed.",
  weight: 50,
  confidence: "high"
}
```

Weights are guidance:

```text id="b1b21k"
hard failure: +60 to +100
strong failure: +40 to +60
warning: +15 to +35
ok/success: -30 to -60
info: 0
```

Negative score means positive/OK evidence.

But failure signals must override success if both exist:

```json id="k4gvcr"
{ "success": true, "error": { "code": "E1" } }
```

Should be warning or failure, not OK. Prefer failure if explicit error present.

## Column categories

Use column semantic flags from chunk 04 plus local matching.

Failure-like columns:

```text id="goao4p"
error
errors
exception
failure
failures
errorMessage
message
reason
code
errorCode
stack
trace
stderr
```

Success/status columns:

```text id="lf5tno"
success
ok
passed
failed
status
state
result
outcome
isSuccess
isError
hasError
```

Timing/metric suspicious columns:

```text id="9a26ap"
durationMs
latency
elapsed
timeout
retryCount
attempts
exitCode
statusCode
httpStatus
```

Normalize names:

```text id="s8rhlb"
case-insensitive
split camelCase
split snake_case
split kebab-case
look at leaf key and full path
```

## Hard failure signals

Detect these as failure:

### Boolean false in success-like column

Column leaf/full name:

```text id="ibpy0j"
success
ok
passed
isSuccess
valid
```

Value false:

```text id="4lq6be"
success=false -> failure +60
ok=false -> failure +60
passed=false -> failure +60
valid=false -> failure +45
```

### Boolean true in failure-like column

Column leaf/full name:

```text id="cnlwey"
failed
failure
hasError
isError
errored
timedOut
timeout
```

Value true:

```text id="zd96cv"
failed=true -> failure +70
hasError=true -> failure +70
timeout=true -> failure +65
```

### Bad status values

Status/result/outcome/state string values.

Failure values:

```text id="9lsfih"
failed
failure
error
errored
exception
rejected
cancelled
canceled
timeout
timed_out
timed out
invalid
aborted
crashed
denied
unhealthy
dead
fatal
```

Signal:

```text id="uygq5m"
status=failed -> failure +60
state=timeout -> failure +60
```

Warning values:

```text id="ec1gwh"
warning
warn
partial
partial_success
degraded
retry
retried
skipped
unknown
pending
stale
rate_limited
throttled
```

Signal:

```text id="v88psz"
status=warning -> warning +25
status=partial -> warning +25
```

OK values:

```text id="1wg57k"
ok
success
succeeded
passed
pass
complete
completed
done
valid
healthy
accepted
resolved
true
```

Signal:

```text id="cpx7pr"
status=success -> ok -45
state=completed -> ok -35
```

### Error object / error fields present

If error-like column has meaningful present value:

```text id="6knv8v"
error.code non-empty -> failure +45
error.message non-empty -> failure +45
errors non-empty array -> failure +50
exception non-empty -> failure +55
stack/trace non-empty -> failure +40
stderr non-empty -> warning or failure depending content
```

Meaningful value excludes:

```text id="q1q01a"
missing
null
empty string
empty array
empty object
false
0 for some count-like fields
```

But `error=false` likely OK/neutral.

### Exit/status codes

Detect numeric code columns:

```text id="76obtm"
exitCode
statusCode
httpStatus
response.status
code when parent path suggests HTTP/status
```

Rules:

```text id="lvfl9x"
exitCode !== 0 -> failure +60
statusCode >= 500 -> failure +60
statusCode >= 400 -> failure +50
statusCode >= 300 -> warning +15
statusCode 200..299 -> ok -25
```

Do not treat all `code` strings as HTTP. Error code string like `E_TIMEOUT` already failure if error-like path.

### Message keywords

Only apply to message-like columns:

```text id="0y5wi7"
message
error.message
reason
description
details
stderr
```

Failure keywords:

```text id="cwagkp"
error
failed
failure
exception
timeout
timed out
invalid
cannot
can't
denied
refused
crash
fatal
stacktrace
traceback
not found
unauthorized
forbidden
```

Warning keywords:

```text id="t28gfu"
warning
warn
retry
retried
skipped
partial
degraded
slow
throttle
rate limit
```

Avoid scanning arbitrary text columns like `name` or `title`, to reduce false positives.

## Warning signals

Warnings should not dominate hard failure.

Signals:

```text id="ozxmhm"
missing important common field
mixed type in important column for this row
status warning/partial
retry count > 0
duration outlier optional
empty error-like field maybe no signal
non-empty warnings column
```

### Missing expected fields

If column is high coverage and important:

```text id="c0h28k"
coverageRatio >= 0.8
semantic role identity/status/time/error? maybe identity/status most important
row missing that field
```

Then row warning:

```text id="7mi4sk"
Missing usually-present field id -> warning +15
Missing usually-present field success -> warning +20
```

Do not warn for sparse error fields missing. Missing error is usually OK.

### Mixed type per row

If column has dominant type and current row has different non-null type:

```text id="o33ld7"
durationMs usually number, row has string -> warning +15
success usually boolean, row has string -> warning +20
```

Do not warn for null unless column normally required and important.

### Retry/attempt fields

If field name:

```text id="05j4b5"
retry
retryCount
attempts
attemptCount
```

Values:

```text id="86o8w2"
retryCount > 0 -> warning +15
retryCount >= 3 -> warning +25
```

### Duration outliers

Optional in this chunk. If implemented, keep simple and transparent.

Only for numeric time-like columns:

```text id="vefy7f"
durationMs
latencyMs
elapsedMs
```

If row value > p95 or > 3x median and enough rows:

```text id="w92yg7"
warning +15
reason: durationMs is high compared with other rows
```

Because outlier logic can be noisy, optional. If implemented, tests required.

## OK signals

OK only when explicit.

Signals:

```text id="18ov6q"
success=true
ok=true
passed=true
failed=false
hasError=false
status=success/complete/ok
exitCode=0
statusCode 2xx
```

OK reasons can exist, but UI should prioritize negative reasons.

If row has OK and failure signals:

```text id="hrq0od"
failure wins.
topReason should be strongest failure.
```

If row has no clear signal:

```text id="703ds0"
unknown, not ok.
```

Do not mark unknown rows as OK merely because no errors present unless dataset has explicit success column and row has positive value.

## Dataset health summary

Implement:

```js id="81x48j"
{
  rowCount: 200,
  failureCount: 13,
  warningCount: 7,
  okCount: 170,
  unknownCount: 10,
  healthRatio: {
    failure: 0.065,
    warning: 0.035,
    ok: 0.85,
    unknown: 0.05
  },
  topSignals: [
    { code: "SUCCESS_FALSE", label: "success=false", count: 13, severity: "failure" },
    { code: "ERROR_CODE_PRESENT", label: "error.code present", count: 11, severity: "failure" }
  ],
  topFailureColumns: [
    { key: "success", count: 13 },
    { key: "error.code", count: 11 }
  ]
}
```

Signal aggregation:

```text id="s8lmrp"
count signals by code + columnKey
sort failure signals first by count
then warning
then ok
limit topSignals default 10
```

## Diagnostics builder

Create `buildDiagnostics(context)` combining info from previous chunks.

Input context:

```js id="d1qqo8"
{
  parseResult,
  rowSourceCandidates,
  selectedRowSource,
  extractionResult,
  flattenResult,
  columns,
  flatRows,
  scoredRows,
  healthSummary
}
```

Output:

```js id="ks2o90"
{
  severity: "ok" | "info" | "warning" | "error",
  items: [
    {
      code: "PARSE_OK",
      severity: "ok",
      title: "Input parsed",
      message: "Valid JSON object.",
      details: { kind: "json", rootType: "object" }
    }
  ],
  groups: {
    parse: [],
    rowSource: [],
    flatten: [],
    columns: [],
    health: []
  }
}
```

Diagnostic severity:

```text id="xyir7n"
error = blocks table/flattening
warning = user should know, but app can continue
info = useful context
ok = successful stage
```

Required diagnostics:

### Parse diagnostics

```text id="95jc1r"
valid JSON / valid JSONL
blank JSONL lines skipped
parse error if invalid, but chunk 02 owns detailed parse error block
```

### Row-source diagnostics

```text id="8dzy7j"
selected source path/confidence
alternate candidate count
low confidence warning
no source error
sampled large input warning
```

### Flatten diagnostics

```text id="v0gxnn"
rows extracted
columns discovered
max depth reached warning
column cap warning
arrays summarized note
long strings truncated note
```

### Column diagnostics

```text id="e42f55"
mostly missing columns count
constant columns count
mixed-type columns count
long-text columns count
hidden default columns count
important columns detected
```

### Health diagnostics

```text id="00yc89"
failure/warning/ok/unknown counts
top failure signals
if no explicit success/failure signals found: warning/info that health may be unknown
if all rows unknown: warning "No obvious success/error fields found"
```

Example diagnostics:

```text id="6e0zok"
Health detection found 13 likely failures.
Top signal: success=false in 13 rows.
```

```text id="kq9vfq"
No obvious success/error fields found. Rows are marked unknown until table data is inspected.
```

## UI requirements

Chunk 05 updates right top and result placeholder. Still no final table.

### Mapping / Options pane

Add compact health controls/info:

```text id="3iq1ey"
Health detection: Auto
Failure keywords: default
Rows flagged: 13 failures, 7 warnings
```

No need full settings yet.

### Result pane

Replace simple flatten summary with diagnostic overview.

Suggested layout:

```text id="o6nawn"
Data ready for table

Rows: 200
Columns: 63
Visible columns: 38

Health:
[13 Likely failures] [7 Warnings] [170 OK] [10 Unknown]

Top failure signals:
- success=false · 13 rows
- error.code present · 11 rows
- status=failed · 4 rows

Diagnostics:
- Source results[] selected with high confidence.
- 25 columns hidden by default.
- 9 mostly missing columns.
- Arrays are summarized, not exploded.
```

Use RetroOS components:

```text id="2nccok"
panel
status line
metric cards if available
list/list item
alert for warnings/errors
tabs optional if already present
```

If no failure signals:

```text id="5a104c"
Health:
[0 Likely failures] [0 Warnings] [0 OK] [200 Unknown]

No obvious success/error fields found. Table can still be inspected manually in next chunk.
```

If all OK by explicit success:

```text id="r0ne7h"
Health:
[0 Likely failures] [0 Warnings] [200 OK] [0 Unknown]
```

### Error/warning display

Diagnostics should not replace parse error block. If parse invalid, parse error remains primary.

If flatten/detection impossible:

```text id="25fgy7"
Show blocking diagnostic in result pane.
```

If health detection uncertain:

```text id="f45b6n"
Show non-blocking info/warning.
```

## Status strip updates

After health ready:

```text id="8m2ygg"
Valid JSON · source results[] · 200 rows · 63 columns · 13 likely failures · 7 warnings
```

If no signals:

```text id="jlkaju"
Valid JSON · source results[] · 200 rows · 63 columns · health unknown
```

If invalid:

```text id="o3wnyp"
Invalid JSON · fix parse error to continue
```

## State integration

Extend state:

```js id="4rsoax"
{
  scoredRows: [],
  healthSummary: null,
  diagnostics: null,
  healthStatus: "idle" | "scoring" | "ready" | "error",
  healthError: null,
  healthOptions: {
    mode: "auto",
    enableMessageKeywordSignals: true,
    enableMissingFieldWarnings: true,
    enableTypeMismatchWarnings: true,
    enableDurationOutlierWarnings: false
  }
}
```

When flatRows/columns update:

```text id="wetw01"
score rows
build health summary
build diagnostics
update state
```

When parse invalid/empty:

```text id="2d8yfr"
clear scoredRows, healthSummary, diagnostics
healthStatus idle
```

When row source changes:

```text id="f4d7n0"
re-extract, re-flatten, re-profile, re-score
```

Flat rows should remain available. Scored rows can be flat rows with health attached or separate map by rowIndex. Prefer not to mutate raw flatRows if easier to reason; either acceptable if documented.

## Logger instrumentation

Required logs:

```text id="5jtknx"
[JTI:Health] Attempt score rows { rowCount, columnCount }
[JTI:Health] Row scoring sampled/limited { rowCount, limit } if relevant
[JTI:Health] Score rows succeeded { rowCount, failureCount, warningCount, okCount, unknownCount, durationMs }
[JTI:Health] Top signals computed { signalCount, topSignalCount }
[JTI:Diagnostics] Build diagnostics { parseOk, candidateCount, columnCount, rowCount }
[JTI:Diagnostics] Diagnostics ready { severity, itemCount, warningCount, errorCount }
[JTI:Health] Failed { code, message }
```

Do not log full row values. Signal labels and column keys allowed but cap lists.

## Tests

Add tests.

### Row health tests

```text id="6gqygd"
success=false -> failure
ok=false -> failure
passed=false -> failure
valid=false -> failure/warning per rule
failed=true -> failure
hasError=true -> failure
isError=true -> failure
status failed/error/timeout/invalid -> failure
status warning/partial/skipped -> warning
status success/complete/ok -> ok
success=true -> ok
failed=false -> ok
error.code present -> failure
error.message present -> failure
errors non-empty array -> failure
errors empty array -> no failure
error null -> no failure
message with timeout in message-like column -> failure
message with retry -> warning
name containing "failed" should not trigger if not message/status/error column
exitCode 1 -> failure
exitCode 0 -> ok
statusCode 500 -> failure
statusCode 404 -> failure
statusCode 302 -> warning
statusCode 200 -> ok
success=true plus error.code present -> failure wins
no signals -> unknown
```

### Missing/type diagnostics tests

```text id="zj0i74"
missing high-coverage id -> warning
missing sparse error.code -> no warning
type mismatch in success column -> warning
type mismatch in unimportant sparse column -> no or low warning
null in usually required status column -> warning if rule enabled
```

### Health summary tests

```text id="dbqb1w"
counts failure/warning/ok/unknown correctly
top signals aggregate counts
top failure columns aggregate counts
ratios correct
empty rows handled without crash
```

### Diagnostics tests

```text id="k5t3cx"
valid pipeline builds ok/info diagnostics
low row-source confidence produces warning
flatten warnings appear
mostly missing/constant/long text column counts appear
all unknown rows produces warning/info
parse error context produces error diagnostic
diagnostic severity escalates correctly
```

Avoid brittle wording assertions. Test codes/severity/counts.

## Manual checklist

```text id="q2eb16"
Paste sample with success true/false. Failure count correct.
Paste sample with status failed/warning/success. Counts correct.
Paste sample with error.message. Failure reason visible.
Paste sample with no status/error fields. Rows unknown and UI says no obvious signals.
Paste sample with missing id in one row. Warning appears.
Paste sample with name="failed login test" but success=true. Name alone does not flag failure.
Change row source. Health summary recomputes.
Invalid JSON clears health and keeps parse error.
Status strip shows failures/warnings.
Console logs health scoring and diagnostics without raw values.
```

## Edge cases

### Sparse error columns

Input:

```json id="fjax5p"
[
  { "id": 1, "success": true },
  { "id": 2, "success": false, "error": { "code": "E1" } }
]
```

`error.code` missing in 1 row. Missing error must not warn. Present error code flags failure.

### String false

Input:

```json id="cncrnk"
{ "success": "false" }
```

Should likely be failure/warning.

Rule:

```text id="1mc6zg"
For success-like fields, string "false" -> failure with medium confidence.
String "true" -> ok with medium confidence.
```

Same for `"yes"/"no"` optional. Keep conservative.

### Numeric booleans

Input:

```json id="4rbnnv"
{ "success": 0 }
```

Optional. Could treat `0` as false for success-like fields with medium confidence. If implemented, test it. If not implemented, leave unknown/warning.

### Error string says "none"

Input:

```json id="1kkb91"
{ "error": "none" }
```

Should not hard fail maybe.

Non-meaningful error strings:

```text id="sdhf0t"
""
"none"
"null"
"n/a"
"na"
"no error"
"ok"
```

Treat as no failure or info.

### Message says "no error"

Message-like column with “no error” should not failure. Need simple negation guard for:

```text id="8k9g1a"
no error
no errors
not an error
without error
```

Do not overbuild NLP. Just avoid obvious false positive.

### Status code column ambiguity

Column named plain `code` with value `500` may be business code, not HTTP. Only apply HTTP status logic if key/path suggests:

```text id="t4qz4t"
statusCode
httpStatus
response.status
http.status
```

Plain `code` under `error` with non-empty value is failure.

### Warnings array

Input:

```json id="b1b3gq"
{ "warnings": ["slow"] }
```

Non-empty warnings array -> warning.

### Empty root/no rows

No scored rows. Summary:

```text id="lpfmqz"
rowCount 0
failure/warning/ok/unknown 0
diagnostic warning/info: no rows to score
```

## Security

Rules:

```text id="6em40w"
Do not use innerHTML with reason text.
Do not log row values.
Cap reason detail values.
Do not mutate original row objects.
Do not eval column paths.
```

Reason detail can include safe display:

```text id="5g839a"
Status field contains "failed".
Error code is "E_TIMEOUT".
```

Cap display to 80 chars.

## Performance

Target:

```text id="wtxz7a"
200 rows instant.
10k rows acceptable later.
```

Implementation should:

```text id="sk0dff"
Precompute column semantic categories once.
Avoid regex recompilation per cell if easy.
Only inspect relevant columns for message keyword scans.
Cap reasons per row? Maybe keep all signals but top 5 for display.
Limit topSignals aggregation.
```

Suggested cap:

```text id="zuq9m5"
maxReasonsPerRow: 20
maxDisplayedReasonsPerRow later: 5
```

Do not scan every long text column. Only message/error/status-like columns.

## Done criteria

Chunk `05` done when:

```text id="z1sb8p"
Rows receive health level: failure/warning/ok/unknown.
Rows receive transparent reason objects.
Explicit false success fields flag failure.
Explicit error fields flag failure.
Bad status values flag failure.
Warning status/retry/missing important fields flag warning.
Positive success/status fields mark OK only when no negative signals.
Failure wins over OK when both present.
Dataset health summary counts rows by health.
Top failure/warning signals aggregate.
Diagnostics builder combines parse/source/flatten/column/health info.
UI shows health summary, top signals, diagnostics.
Status strip shows failure/warning counts or health unknown.
State clears health on invalid/empty input.
Logger instruments scoring/diagnostics without raw values.
Tests cover failure signals, warnings, OK, unknown, edge cases, diagnostics.
Agent ran tests/build or documented blocker.
Agent self-reviewed and fixed critical/medium issues.
No full table renderer/filter/export implemented yet.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Implement row health detection and diagnostics only. Do not implement final table renderer, filters, column picker, or export.

10-spec roadmap:

```text id="7ig8yt"
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

```text id="bzzm6m"
Read 00 spec.
Read 01-04 implementation.
Inspect repo.
Inspect current parse/source/flatten contracts.
Plan file changes.
Implement only chunk 05.
Add/update tests.
Run tests.
Run build/dev smoke if available.
Self-review diff.
Fix critical/medium issues.
Report exact commands and result.
```

No broad rewrite. No fake pass.

# Appendix C — RetroOS framework rule

Use RetroOS components for diagnostics UI.

Expected usage:

```text id="nksnmn"
metric cards or status lines for health counts
panel for diagnostics
list/list item for top signals
alert/note for warnings/errors
toolbar/status strip integration
```

Custom CSS allowed for compact health badges and diagnostic grouping. Do not replace design system.

# Appendix D — Heuristic transparency rule

Every row flagged failure/warning needs reason.

Reason must include:

```text id="mxgpws"
code
severity
columnKey if applicable
short label
plain detail
weight/confidence if useful internally
```

UI must avoid unexplained “magic failure” labels.

# Appendix E — Failure scoring principle

Use conservative but useful scoring.

Priority:

```text id="hnlsde"
explicit failure fields beat all
explicit error fields beat all
bad status values strong
message keywords only in message-like columns
missing fields warn only when field is usually present and important
absence of error is not enough for OK
explicit success required for OK
failure wins over success when both present
```

# Appendix F — User-facing copy examples

Use normal clear language for user-facing diagnostics.

Good:

```text id="ym0q6w"
13 rows look like failures.
Top reason: success is false.
```

Good:

```text id="969j5x"
No obvious success/error fields were found. Rows are marked unknown, but the table can still be inspected manually.
```

Good:

```text id="mzi9cj"
Row flagged because error.code is present and status is "failed".
```

Bad:

```text id="2h9i9o"
Health failed. Bad rows found.
```

# Appendix G — Logger rules repeated

Log attempt/outcome.

Pattern:

```text id="u7wg74"
[JTI:Health] Attempt score rows { rowCount, columnCount }
[JTI:Health] Score rows succeeded { failureCount, warningCount, okCount, unknownCount, durationMs }
[JTI:Diagnostics] Diagnostics ready { severity, itemCount }
```

Never log full row data or full messages. Cap signal labels.

# Appendix H — Self-review checklist

Before final report, check:

```text id="zbazqg"
Does success=false flag failure?
Does error.code present flag failure?
Does errors=[] avoid failure?
Does status=warning become warning?
Does status=complete become OK?
Does no signals become unknown?
Does name containing "failed" avoid false failure?
Does failure win over success conflict?
Does missing sparse error field avoid warning?
Does missing common id warn?
Are reasons visible and understandable?
Does health clear on invalid input?
Does logger avoid raw values?
Are tests broad and not brittle on exact wording?
```

Fix critical/medium issues.

# Appendix I — Suggested final report format

```text id="gbxdc6"
Summary:
- Added row health scoring and failure reasons.
- Added dataset health summary and diagnostics.
- Updated UI/status with likely failure counts.

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
- Final table renderer, filtering, column picker, and export intentionally not implemented until later chunks.
```
