# 07-column-controls-row-details-and-export.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `07`: **column controls, row details, and export**. Goal: make table inspection complete. User can choose columns, understand hidden columns, inspect full original row JSON, see non-empty fields and failure reasons, copy cells/rows, copy visible CSV/TSV, and download CSV with correct escaping. This chunk is important because CSV output may feed other tools and automations. Export correctness must be treated as critical.

This chunk value: chunk `06` made table readable. This chunk makes it controllable, inspectable, and portable.

## Scope

Implement:

```text id="0lbpej"
column visibility picker
hidden column count/details
column ordering controls
show/hide all/reset defaults
row selection/expansion details panel
full original row JSON viewer
non-empty fields list
failure reasons list
copy cell value
copy visible row JSON
copy full original row JSON
copy visible table CSV
copy visible table TSV
download visible CSV
CSV/TSV exporter core module
clipboard/error handling
export diagnostics
tests for CSV/TSV/copy/column controls/row details
logger instrumentation
extra verification and risk review
```

Do not implement examples/polish/performance beyond what needed here.

Do not add external CSV library.

Do not mutate original data.

Do not implement editing JSON/table cells.

## Main principles

```text id="fua6g1"
Visible table is user-controlled view.
Original row JSON remains source of truth.
CSV export must be deterministic and standards-compliant.
Copy/download must respect current search/filter/sort/visible columns.
All copy/export errors must be visible.
Column controls must be reversible.
```

## Product behavior after this chunk

User can:

```text id="7zd9b6"
see hidden column count
open column picker
search columns
show/hide columns
reset to default visible columns
choose ordering preset
select a row
open details for selected row
view full row JSON
view non-empty flattened fields
view failure reasons
copy cell display/raw value
copy selected row JSON
copy visible CSV/TSV
download visible CSV
```

Example status:

```text id="a2y14c"
Showing 13 of 200 rows · 38 visible columns · 25 hidden · sorted by durationMs desc
```

Export behavior:

```text id="hym92t"
Current filter: failures
Search: timeout
Visible columns only
Sorted order preserved
CSV includes header row
```

## Required modules

Create pure export/column modules:

```text id="fn16tm"
src/core/export-table.js
src/core/column-visibility.js
src/core/row-details.js
```

Create UI modules:

```text id="44bp3u"
src/ui/render-column-controls.js
src/ui/render-row-details.js
src/ui/render-export-controls.js
```

Can adapt paths to repo. Keep core pure. No DOM in export core.

Suggested exports:

```js id="icfdrx"
export function serializeCsv(rows, columns, options = {}) {}
export function serializeTsv(rows, columns, options = {}) {}
export function escapeCsvCell(value, options = {}) {}
export function normalizeExportCell(cell, options = {}) {}
export function createDownloadBlob(text, mimeType) {}

export function applyColumnVisibility(columns, visibleColumnKeys) {}
export function toggleColumnVisibility(visibleColumnKeys, columnKey, visible) {}
export function resetVisibleColumns(columns, options = {}) {}
export function orderVisibleColumns(columns, visibleKeys, preset) {}

export function buildRowDetails(row, columns, options = {}) {}
export function stringifyOriginalJson(value, options = {}) {}
export function listNonEmptyFields(row, columns, options = {}) {}
```

## Column controls

### Column picker UI

Add column control area to table toolbar or Mapping/Options pane.

Required controls:

```text id="tpv4bs"
Visible columns: N
Hidden columns: M
Open columns button
Column search input
Show all
Hide all non-system
Reset defaults
Ordering preset selector
```

Column picker can be inline panel, popover, dialog, or right-side panel. Use RetroOS panel/dialog/list components.

Column list item:

```text id="nix86k"
[checkbox] error.code
type: string · coverage: 8.5% · error-like · hidden reason: mostly missing? no, visible due error-like
```

Need show enough details:

```text id="02hzmc"
label/path
type/dominant type
coverage
semantic badges: id/status/error/time/long/mixed/constant/mostly missing
visible/hidden state
hidden reason if hidden by default
```

Column search:

```text id="15kwu2"
case-insensitive
matches label/key/path and semantic badges
does not modify visibility
```

Column counts update live.

### System columns

System columns:

```text id="yl21jm"
#
Health
```

Rules:

```text id="8mpmcs"
System columns are always visible by default.
User may not hide # and Health in this chunk, or if hiding allowed, must have Reset.
Preferred: lock system columns visible.
```

Column picker should mark:

```text id="b5x0wc"
System
```

### Show/hide behavior

State:

```js id="v9vya7"
{
  visibleColumnKeys: ["id", "success", "error.code"],
  columnVisibilityMode: "custom" | "default",
  columnSearchQuery: "",
  columnOrderPreset: "failureFirst"
}
```

Rules:

```text id="t89t33"
Toggling column updates visibleColumnKeys.
Toggling marks visibility mode custom.
Reset defaults recomputes from chunk 04 chooseDefaultVisibleColumns.
Show all makes all data columns visible.
Hide all non-system hides all data columns; table shows #/Health plus empty-data warning.
Ordering preset reorders visible columns.
```

Avoid losing user choices unexpectedly.

When input/row source changes:

```text id="6oh5w6"
If column keys overlap, preserve visibility for matching keys when possible.
New columns use default visibility.
Removed columns vanish from visible keys.
If too different, reset to default and log note.
```

Simpler acceptable:

```text id="dlpis9"
On new dataset/row source, reset visibility to defaults.
```

But better preserve same keys if not too hard.

### Column ordering controls

Controls:

```text id="5v44z0"
Failure-first
Coverage-first
Original
Alphabetical
```

Behavior:

```text id="lefq37"
Selecting preset reorders table visible columns.
Does not change visible/hidden state.
Persists preference.
```

Optional manual column drag reorder not required.

## Row details

### Trigger

User can open details by:

```text id="jk5cx9"
click row
click row number
click Details button in row
keyboard Enter on focused row optional
```

Chunk `06` may not have selected row. Add selection state:

```js id="29a7wh"
{
  selectedRowIndex: null,
  selectedRowId: null,
  rowDetailsOpen: false
}
```

Use stable row identity:

```text id="tzka96"
rowIndex from source rows is acceptable.
If filtered/sorted, selected row still references original rowIndex.
```

### Details panel placement

Preferred:

```text id="cz7287"
right side or bottom split panel inside result pane
```

Could be:

```text id="ax4cop"
RetroOS panel below table
Dialog
Collapsible drawer
```

Need not be fancy. Must be usable.

Panel title:

```text id="td1n92"
Row 17 details
```

If JSONL:

```text id="fwzepp"
Row 17 details · source line 42
```

Content sections:

```text id="a40h44"
Summary
Failure reasons
Non-empty fields
Original JSON
Copy actions
```

### Summary section

Show:

```text id="j4txxl"
source row number
source path
source line number if JSONL
health level
top reason
visible column count
non-empty field count
```

Example:

```text id="s0e2zi"
Row 2
Health: Failure
Top reason: success=false
Source path: results[1]
```

### Failure reasons section

Use health reasons from chunk 05.

Display:

```text id="90z6e1"
severity
label
column
detail
```

Example:

```text id="jyezif"
Failure · success=false · success
Column success is false.

Failure · error.code present · error.code
Error code is "E_TIMEOUT".
```

If none:

```text id="juewyp"
No failure/warning reasons for this row.
```

### Non-empty fields section

Show flattened fields where value meaningful.

Definition meaningful:

```text id="2f35l6"
state value and display not ""
state null maybe include under "Null fields" or include as meaningful? 
empty string can be shown if field exists
empty array/object can be shown
missing excluded
```

Preferred:

```text id="kyujti"
Non-empty fields excludes missing only.
Shows null/empty with explicit tokens because those are data.
```

Fields list:

```text id="5z8jyc"
path
type
display value
copy button optional
```

Limit initial display:

```text id="zbh9ql"
Show first 100 fields, with message if more.
```

Search within row details optional, not required.

### Original JSON section

Show full original row JSON, pretty-printed.

Use:

```js id="zp2qmh"
JSON.stringify(row.original, null, 2)
```

For primitive original:

```text id="dsyho6"
JSON.stringify(value, null, 2)
```

If stringify fails defensively:

```text id="8bd3vo"
Show error "Could not stringify original row."
```

Parsed JSON should not have cycles, but defensive safe stringify okay.

Rendering:

```text id="m9kl5v"
pre/code block
monospace
scrollable
textContent only
copy button
```

Do not syntax-highlight with innerHTML unless safe tokenizer implemented. Not required.

### Copy actions in row details

Buttons:

```text id="3t9kiw"
Copy original JSON
Copy visible row JSON
Copy visible row CSV
Copy non-empty fields
```

Minimum required:

```text id="1t505m"
Copy original row JSON
Copy visible row JSON
```

Definitions:

`Original row JSON`:

```text id="7wncuv"
Pretty JSON of row.original, full fidelity as parsed.
```

`Visible row JSON`:

```text id="ovvxlq"
Object containing visible columns only, using column labels/keys and raw cell values or display? Need define.
Preferred raw export values when possible.
Missing omitted or included as null? For visible row JSON, include visible keys with normalized values.
```

Recommended visible row JSON:

```js id="y2zc8k"
{
  "id": "b",
  "success": false,
  "error.code": "E_TIMEOUT",
  "error.message": "Timed out"
}
```

For missing:

```text id="7s0791"
include key with null? This can confuse missing vs null.
Preferred: omit missing fields from visible row JSON.
```

But user may expect table shape. For CSV row, missing = empty. For JSON, omit missing.

Document in code comments.

## Cell copy actions

User should copy cell.

Interaction options:

```text id="i6b9n1"
context button on cell hover
right-click context menu
selected cell + toolbar button
click cell then Copy cell button
```

Keep simple.

Minimum implementation:

```text id="3bc66y"
Click cell selects it.
Toolbar/status shows selected cell path/value.
Copy cell button copies selected cell display value or raw value option.
```

Better:

```text id="ulgl87"
Each focused/selected cell can show small Copy button or context action.
```

Need not implement native context menu.

State:

```js id="fjncu5"
{
  selectedCell: {
    rowIndex: 1,
    columnKey: "error.code"
  }
}
```

Copy options:

```text id="67l3ls"
Copy cell display
Copy cell raw JSON
```

Minimum required by user: copy cell. Define as display text by default.

If raw value object/array:

```text id="9hquse"
Copy cell raw JSON copies JSON.stringify(rawValue, null, 2).
```

For missing:

```text id="gr5xrw"
Copy cell display copies empty string or "—"? Better:
- display copy uses display exactly visible? For missing, copy empty string.
- raw copy for missing copies empty string.
```

For null:

```text id="yetr51"
display copy "null"
raw copy "null"
```

Clipboard failure must show visible error.

## Export behavior

This is high-risk part. Implement pure exporter with tests.

### Export source

CSV/TSV export uses current table view:

```text id="ewh73z"
current visible rows after quick filter/search/sort
current visible data columns
system columns optional? Define.
```

Default:

```text id="4a57gk"
CSV includes data columns only, not system # and Health.
```

But user may want health. Better:

```text id="dfm96b"
Include Health column by default.
Exclude # by default unless option includeRowNumber true.
```

For this chunk, export options:

```js id="7qeoz3"
{
  includeHeader: true,
  includeHealth: true,
  includeRowNumber: false,
  columns: visibleDataColumns,
  rows: currentViewRows,
  delimiter: ",",
  newline: "\r\n",
  missingValue: "",
  nullValue: "",
  useDisplayValues: false
}
```

Important choice: raw vs display.

Recommended CSV value normalization:

```text id="me319d"
Primitive raw values exported as their primitive string.
Objects/arrays exported as compact JSON string.
Missing -> empty field.
Null -> empty field by default, or "null"? Need decide.
```

CSV users usually expect empty for null/missing. But null vs missing distinction lost in CSV. That is acceptable if documented.

Use:

```text id="bnfffx"
missing -> ""
null -> ""
empty string -> ""
empty array -> "[]"
empty object -> "{}"
array/object -> JSON.stringify(value)
boolean -> "true"/"false"
number -> String(value)
string -> original string
```

For health:

```text id="gfssw9"
health level string: failure/warning/ok/unknown
```

For row number:

```text id="qfhbqz"
1-based row number or sourceLineNumber option later.
```

Headers:

```text id="wgc5o6"
Use column label/key exactly as displayed.
If health included, first column "Health".
If row number included, first column "#".
```

Current order:

```text id="1u6bvd"
Health first, then visible data columns.
```

### CSV rules

Implement RFC 4180-style escaping.

Delimiter: comma.

Newline in file: CRLF `\r\n` by default.

Escape cell if contains:

```text id="xf6xja"
comma
double quote
CR
LF
leading/trailing spaces? RFC not mandatory, but preserve spaces safely by quoting.
```

Escaping:

```text id="jw8p78"
wrap field in double quotes
inside quoted field, double each double quote
```

Examples:

```text id="ki04kk"
hello -> hello
hello,world -> "hello,world"
hello "world" -> "hello ""world"""
line1\nline2 -> "line1
line2"
 leading -> " leading"
trailing  -> "trailing "
```

Formula injection risk:

CSV opened in Excel can execute formulas for cells beginning `=`, `+`, `-`, `@`, tab, CR. Need address.

Options:

```js id="0b3jtp"
sanitizeFormulae: true
formulaEscapePrefix: "'"
```

Default should protect user because data untrusted and export often opens in spreadsheets.

Rule:

```text id="73b08f"
If string begins with = + - @ or tab after optional leading whitespace, prefix single quote.
```

But numeric negative values like `-5` should not be formula-escaped if actual number type. Only string cells. For raw number -5, export `-5`.

For string `-SUM(...)`, escape. For string `-5`, debatable. Excel formula injection protection escapes all string-leading `-`. Good.

Mention in diagnostics:

```text id="opg7ms"
CSV protects spreadsheet formula injection by prefixing risky text values with '.
```

If product wants raw export, future option can disable. For now safe default.

### TSV rules

Delimiter: tab.

TSV escaping has no single universal standard. Define clearly.

Recommended:

```text id="vhy3rz"
Use same quote escaping rules as CSV but delimiter is tab.
Quote fields containing tab, quote, CR, LF, leading/trailing spaces.
Double quotes inside quoted fields.
Newline CRLF.
```

This produces Excel-compatible TSV-ish. Tests must match.

Alternative simpler replacement of tabs/newlines not preferred. Use same delimited escaping function parameterized by delimiter.

### Download CSV

Use Blob:

```text id="qv61du"
type: text/csv;charset=utf-8
filename: json-table-inspector-export-YYYYMMDD-HHMMSS.csv
```

Need no web search/time; use local `new Date()`.

Filename sanitize. No user input in filename by default.

Download flow:

```text id="bfvq2k"
generate CSV
create Blob URL
create hidden anchor
click
revoke URL after timeout or next tick
log success/failure
show status
```

### Copy CSV/TSV

Use Clipboard API with fallback if available.

Copy visible CSV:

```text id="3kgnpr"
generate CSV from current view
clipboard.writeText(csv)
show success: Copied CSV for 13 rows × 38 columns.
```

Copy visible TSV:

```text id="x6bai9"
same delimiter tab
```

If no rows:

```text id="hhdxmg"
Still copy header? Define:
If visible rows 0, copy header row for visible columns and show "Copied header only".
```

Preferred: include header only. User can understand.

If no visible columns:

```text id="w0y8mz"
Export health only if includeHealth true. Else block with helpful error.
```

## Export UI

Add export controls to toolbar:

```text id="g94b6x"
Copy CSV
Copy TSV
Download CSV
```

Optional dropdown:

```text id="tusfov"
Export options:
[✓] Include header
[✓] Include Health
[ ] Include row number
[✓] Protect spreadsheet formulas
```

Minimum implement options as constants if UI too large. But since CSV correctness important, include at least visible indication:

```text id="2le8xb"
Export uses visible rows/columns and includes Health.
```

Export summary before/after action:

```text id="ycd9vb"
Export target: 13 rows · 38 columns · filtered/sorted view
```

After copy:

```text id="te4pre"
Copied CSV: 13 rows × 39 columns.
```

After download:

```text id="hs90el"
Downloaded CSV: 13 rows × 39 columns.
```

Errors:

```text id="vmmhjp"
Could not copy CSV. Browser clipboard permission denied.
Could not download CSV. Browser blocked file creation.
```

Do not silently fail.

## Export result contract

Pure serialization result:

```js id="vs75hr"
{
  ok: true,
  text: "Health,id,error.code\r\nfailure,b,E_TIMEOUT\r\n",
  meta: {
    format: "csv",
    rowCount: 1,
    columnCount: 3,
    delimiter: ",",
    newline: "\r\n",
    formulaEscapedCellCount: 0,
    quotedCellCount: 0
  },
  warnings: []
}
```

Error:

```js id="uvzct4"
{
  ok: false,
  error: {
    code: "E_EXPORT_NO_COLUMNS",
    message: "No columns selected for export."
  },
  warnings: []
}
```

## CSV test matrix

Must be extensive.

### Basic CSV

```text id="16hf5i"
header included
one row
multiple rows
column order preserved
filtered/sorted row order preserved
health included when enabled
row number included when enabled
header-only when zero visible rows
```

### Escaping

Test exact output for:

```text id="f3o0a6"
plain string
string with comma
string with double quote
string with CRLF
string with LF
string with CR
string with leading space
string with trailing space
string with comma + quote + newline
empty string
null
missing
boolean true/false
number integer/float/negative
array -> JSON string escaped if needed
object -> JSON string escaped if needed
unicode emoji/non-Latin
```

Examples:

```js id="sre2ft"
escapeCsvCell('a,b') === '"a,b"'
escapeCsvCell('a"b') === '"a""b"'
escapeCsvCell('a\nb') === '"a\nb"'
escapeCsvCell(' a') === '" a"'
escapeCsvCell('a ') === '"a "'
```

### Formula injection protection

```text id="uv16i5"
string "=1+1" -> "'=1+1" then quoted or not depending escape
string "+cmd" -> "'+cmd"
string "-cmd" -> "'-cmd"
string "@cmd" -> "'@cmd"
string "\t=cmd" -> "'\t=cmd" or escaped safely per rule
number -5 -> -5, not formula-escaped
string "-5" -> "'-5" if protection strict
leading spaces before = should be protected
```

Need test final CSV output.

### TSV

```text id="9ewvv0"
tab delimiter
field containing tab quoted
quotes doubled
newlines quoted
same formula protection
```

### Round-trip sanity

Optional but useful:

```text id="tjy4gf"
simple CSV can be parsed by tiny test parser or compared exact.
```

No external parser dependency.

## Column controls tests

```text id="crn6f8"
toggle visible off
toggle visible on
system columns locked
show all
hide all non-system
reset defaults
preserve order preset
column search by key/label/semantic
hidden counts update
removed column key cleaned after dataset change
new column gets default visibility
ordering preset changes visible column order but not visibility
```

## Row details tests

```text id="v491yd"
build details for failure row
includes summary
includes failure reasons
non-empty fields excludes missing
non-empty fields includes null/empty string/empty array/object with explicit states
original JSON pretty printed
primitive row JSON stringifies
JSONL sourceLineNumber included
copy visible row JSON omits missing
copy visible row JSON preserves raw primitives
full original row not mutated
large field list capped with note
```

## Clipboard/download tests

Pure functions mostly. Browser APIs can be mocked.

```text id="puj7wh"
copy success path reports meta
copy failure path reports error
download filename generated safe
download blob text matches serializer output
object URL revoked if testable
```

Manual acceptable for real clipboard/download.

## UI/manual checklist

```text id="bqy5kb"
Open column picker.
Search columns.
Hide a column. Table updates. Hidden count updates.
Show hidden column. Table updates.
Show all. All data columns appear.
Hide all non-system. Table still shows #/Health and warning.
Reset defaults. Defaults restored.
Change ordering preset. Columns reorder.
Select a row. Details panel opens.
Failure row shows reasons.
Details show full original JSON.
Details show non-empty fields.
Copy original row JSON works.
Copy visible row JSON works.
Select/copy cell works.
Copy CSV exports current filtered/sorted/visible table.
Copy TSV works.
Download CSV creates file.
CSV opens in spreadsheet with columns aligned.
CSV commas/quotes/newlines escaped correctly.
Formula-like strings protected.
Invalid clipboard permission shows visible error.
No raw HTML injection in row JSON/details.
Console logs actions without raw row/cell values.
```

## Risk analysis

### CSV malformed risk

Risk:

```text id="kgxasu"
quotes/newlines/commas break columns
```

Mitigation:

```text id="ox06vw"
single serializer function
strict escaping tests
exact-output tests
no ad-hoc CSV creation elsewhere
```

### Formula injection risk

Risk:

```text id="tzg4h0"
CSV opened in spreadsheet can execute formula-like values
```

Mitigation:

```text id="o1db45"
sanitizeFormulae true by default
test = + - @ tab/CR starts
only raw numbers exempt
```

### Null/missing ambiguity

Risk:

```text id="5r0v42"
CSV loses null vs missing
```

Mitigation:

```text id="uww9nm"
document export normalization
original row JSON copy preserves distinction
row details preserve distinction
```

### Hidden columns surprise

Risk:

```text id="4wpje5"
User expects all columns exported but only visible exported
```

Mitigation:

```text id="l1d44s"
export controls say "visible rows/columns"
hidden count near export
show all button
export status includes dimensions
```

### Filter/sort surprise

Risk:

```text id="4hizwd"
User exports filtered/sorted view accidentally
```

Mitigation:

```text id="bcz4wh"
export summary says filtered/sorted/current view
status shows Showing N of M
```

### Copy huge data

Risk:

```text id="1mic4f"
clipboard too large or slow
```

Mitigation:

```text id="dz3xc4"
try/catch
visible error
log size metadata, not content
maybe warning if >5MB
```

### Row details data leak into logs

Risk:

```text id="t4lp0z"
copy/log raw JSON accidentally
```

Mitigation:

```text id="lisjqi"
logger logs lengths/counts only
never row content
```

## Logger instrumentation

Required logs:

```text id="75gnng"
[JTI:Columns] Picker opened { totalColumns, visibleCount, hiddenCount }
[JTI:Columns] Column visibility changed { columnKey, visible, visibleCount, hiddenCount }
[JTI:Columns] Reset defaults { visibleCount, hiddenCount }
[JTI:Columns] Show all { visibleCount }
[JTI:Columns] Hide all non-system { visibleCount }
[JTI:Columns] Order preset changed { preset }

[JTI:RowDetails] Open row details { rowIndex, sourceLineNumber, healthLevel }
[JTI:RowDetails] Copy original JSON attempt { rowIndex, charCount }
[JTI:RowDetails] Copy original JSON succeeded { rowIndex, charCount }
[JTI:Cell] Copy cell attempt { rowIndex, columnKey, mode, valueType }
[JTI:Cell] Copy cell succeeded { rowIndex, columnKey, charCount }

[JTI:Export] Serialize attempt { format, rowCount, columnCount, includeHeader, includeHealth }
[JTI:Export] Serialize succeeded { format, rowCount, columnCount, charCount, quotedCellCount, formulaEscapedCellCount }
[JTI:Export] Copy attempt { format, charCount }
[JTI:Export] Copy succeeded { format, charCount }
[JTI:Export] Download attempt { filename, charCount }
[JTI:Export] Download succeeded { filename, charCount }
[JTI:Export] Failed { code, message }
```

Do not log exported text, row JSON, cell values, search query.

## Extra review/refactor requirement

This chunk is precision-sensitive. Agent must do two review passes like chunk `06`.

Required:

```text id="xbitk7"
1. Implement.
2. Run tests/build.
3. Self-review pass 1: functionality/state/UI.
4. Refactor for clarity.
5. Add missing tests discovered during review.
6. Run tests/build again.
7. Self-review pass 2: CSV correctness/security/export risks.
8. Fix all critical/medium issues.
9. Final report.
```

CSV/export review must explicitly check:

```text id="x75roa"
single serializer path
no ad-hoc join(",") outside serializer
quote escaping
newline handling
formula protection
null/missing normalization
visible rows/columns semantics
clipboard/download error handling
```

## Done criteria

Chunk `07` done when:

```text id="ivppsi"
Column picker exists.
Visible/hidden column counts update.
Columns can be shown/hidden.
Show all/hide all/reset defaults work.
Ordering preset controls work.
Table updates when visibility/order changes.
Row details panel opens for selected row.
Row details show summary, failure reasons, non-empty fields, full original JSON.
Copy original row JSON works.
Copy visible row JSON works.
Copy cell works.
Copy visible CSV works.
Copy visible TSV works.
Download visible CSV works.
CSV serializer handles commas, quotes, CR/LF, leading/trailing spaces.
CSV serializer uses CRLF by default.
CSV formula injection protection exists and is tested.
TSV serializer tested.
Export respects current visible rows, filters, sort, and visible columns.
Export UI clearly says visible/current view.
Clipboard/download failures show visible errors.
Logger instruments column/details/export without raw data.
Tests cover column controls, row details, CSV/TSV edge cases, formula protection.
Agent ran tests/build twice after refactor or documented blocker.
Agent did two self-review passes and fixed critical/medium issues.
No examples/performance/final README work implemented beyond necessary integration.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Implement column controls, row details, and export only. Do not implement sample datasets, broad visual polish, or final README hardening. Those belong to chunks `08` and `09`.

10-spec roadmap:

```text id="tufqk9"
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

```text id="wb5bns"
Read 00 spec.
Read 01-06 implementation.
Inspect current table view model and state contracts.
Plan export API before coding.
Implement only chunk 07.
Add/update tests, especially CSV exact-output tests.
Run tests/build.
Self-review pass 1.
Refactor.
Run tests/build again.
Self-review pass 2 focused on CSV/security/export correctness.
Fix critical/medium issues.
Report exact commands and result.
```

No broad rewrite. No fake pass.

# Appendix C — RetroOS framework rule

Use RetroOS components for controls and panels:

```text id="u4x8zb"
column picker panel/dialog
toolbar buttons
selects/checkboxes
row detail panel
alerts/status lines
copy/export buttons
```

Semantic `<table>` from chunk `06` remains app-specific.

Custom CSS allowed for picker layout, details JSON block, export controls.

# Appendix D — CSV rules repeated

Use one serializer. No ad-hoc CSV.

Rules:

```text id="5qaio4"
delimiter comma
newline CRLF
header row by default
quote fields with comma/quote/CR/LF/leading/trailing space
double quotes inside quoted fields
missing -> empty
null -> empty
objects/arrays -> JSON.stringify compact
booleans -> true/false
numbers -> String(number)
formula protection on risky strings by default
```

Exact examples:

```text id="zu0zwi"
a,b -> "a,b"
a"b -> "a""b"
a\nb -> "a
b"
 leading -> " leading"
trailing  -> "trailing "
=1+1 -> '=1+1
```

If field after formula protection contains quote/comma/newline/space, quoting still applies.

# Appendix E — Formula injection safety

CSV/TSV exported from untrusted JSON can be dangerous in spreadsheets.

Protect by default:

```text id="k3q0nd"
String begins with = + - @ tab CR LF after optional leading spaces -> prefix '
Actual number -5 remains -5.
```

Do not log formula-like values.

# Appendix F — Data fidelity rule

Exports are views. Original row JSON remains fidelity escape hatch.

```text id="c757iu"
CSV normalizes null/missing to empty.
Original row JSON copy preserves null/missing/object/array.
Visible row JSON omits missing fields.
Cell raw copy preserves raw value where possible.
```

# Appendix G — User-facing copy

Use normal clear language in UI.

Good:

```text id="kmln96"
Copied CSV for 13 rows and 39 columns.
```

Good:

```text id="t4qki4"
Export uses the current visible rows and visible columns.
```

Good:

```text id="o9a3s5"
Could not copy CSV. Browser clipboard permission denied.
```

# Appendix H — Self-review checklist

Pass 1:

```text id="8riowd"
Column picker updates table?
Hidden count correct?
Reset/show all/hide all work?
Row details show correct row after sorting/filtering?
Copy cell copies intended value?
Copy row JSON omits missing but preserves raw values?
Export uses current view?
UI messages clear?
```

Pass 2:

```text id="ia9iur"
Any ad-hoc CSV join outside serializer?
Quotes doubled?
Commas quoted?
CR/LF quoted?
Leading/trailing spaces quoted?
Formula protection works?
Number -5 not wrongly escaped?
String -5 escaped?
Objects/arrays compact JSON escaped?
Null/missing behavior documented?
Clipboard failures visible?
Download URL revoked?
Raw data logged anywhere?
innerHTML with JSON anywhere?
```

Fix critical/medium issues.

# Appendix I — Suggested final report format

```text id="m4kcyo"
Summary:
- Added column picker and visibility controls.
- Added row details panel with full JSON and failure reasons.
- Added CSV/TSV copy and CSV download with strict escaping.

Files changed:
- ...

Tests:
- First run: `bun test` PASS/FAIL
- First build: `bun run build` PASS/FAIL or not available
- After refactor: `bun test` PASS/FAIL
- After refactor: `bun run build` PASS/FAIL or not available

Manual checks:
- ...

Self-review pass 1 fixes:
- ...

Self-review pass 2 fixes:
- ...

Known limits:
- Example datasets, broad visual polish, and final README/hardening intentionally left for chunks 08-09.
```
