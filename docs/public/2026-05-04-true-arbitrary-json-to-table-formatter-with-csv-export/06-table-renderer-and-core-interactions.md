# 06-table-renderer-and-core-interactions.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `06`: **table renderer and core interactions**. Goal: render flattened/scored data as useful spreadsheet-like table. User can scan rows, see health, see types, see null/missing values clearly, sort columns, search globally, apply quick health filters, change density, toggle wrapping, resize columns at basic level, and define dataset-specific value highlights.

This chunk is crucial. It is main user-facing work surface. Agent must spend extra time on design, review, refactor, and tests. Do not rush. Table must be readable, safe, and maintainable.

This chunk value: previous chunks produced structured data. This chunk makes data visible and usable. User can finally inspect batch output as table and find failures fast.

## Scope

Implement:

```text id="sbaqyb"
main table renderer
sticky header
row number column
row health column
visible columns rendering
type-aware cell display
null/missing/empty visuals
ellipsis/truncation
wrap toggle
density toggle integration
basic column width behavior
column sort
global search
quick filters
highlight rules for values
highlight configuration UI
state integration
table status/summary
safe rendering
tests for table view model, sorting, filtering, search, highlights
logger instrumentation
extra self-review/refactor pass
```

Do not implement full column picker/details/export yet. Those are chunk `07`.

Do not implement advanced virtualization unless needed. But use render caps/performance guardrails.

Do not implement editable cells.

Do not mutate original JSON.

## Product behavior after this chunk

After valid parse/source/flatten/health:

```text id="ssdc4b"
User sees real table.
Failures are visually obvious.
Columns are ordered from chunk 04.
Visible columns shown.
Hidden columns excluded for now.
User can sort by any visible column.
User can search across visible cells.
User can quick-filter failures/warnings/ok/unknown.
User can toggle compact/normal/roomy density.
User can toggle wrap/no-wrap.
User can add simple highlight rules for values.
```

Example table:

```text id="1gdsz5"
# | Health  | id | success | status | error.code | error.message | durationMs
1 | OK      | a  | true    | done   |            |               | 91
2 | Failure | b  | false   | failed | E_TIMEOUT  | Timed out     | 1200
```

Default table is scan-first:

```text id="lrby49"
no text wrap by default
ellipsis for long values
sticky header
row health badge
row numbers
failure/warning row accent
visible missing/null distinction
```

## Main non-goals

Do not build spreadsheet clone.

Do not add formulas.

Do not allow cell editing.

Do not implement pivot/charts.

Do not implement row detail drawer yet.

Do not implement CSV export yet.

Do not implement full saved style presets yet.

Do not add external grid/table dependency.

No Tabulator/AG Grid/Handsontable/etc.

## Required modules

Create UI table modules:

```text id="fy9f1d"
src/ui/render-table.js
src/ui/table-view-model.js
src/ui/table-interactions.js
src/ui/render-highlight-controls.js
```

Create core/shared modules if useful:

```text id="nldwje"
src/core/table-sort.js
src/core/table-filter.js
src/core/highlight-rules.js
```

Target separation:

```text id="79h51m"
core/table-sort.js = pure compare/sort helpers
core/table-filter.js = pure search/filter helpers
core/highlight-rules.js = pure rule matching
ui/table-view-model.js = converts app state to renderable table model
ui/render-table.js = DOM rendering only
ui/table-interactions.js = event binding
```

No giant table code inside `main.js`.

## Internal table model

Table renderer should consume a view model, not raw app state directly.

Suggested:

```js id="wdzgdc"
{
  status: "empty" | "ready" | "filtered-empty" | "error",
  columns: [
    {
      key: "success",
      label: "success",
      path: ["success"],
      type: "boolean",
      role: "status",
      width: 120,
      sortable: true,
      align: "center",
      profile: { ... }
    }
  ],
  rows: [
    {
      rowIndex: 1,
      sourceLineNumber: null,
      health: {
        level: "failure",
        topReason: "success=false",
        reasons: [...]
      },
      cells: [
        {
          columnKey: "success",
          state: "value",
          type: "boolean",
          value: false,
          display: "false",
          sortValue: false,
          searchText: "false",
          classes: ["cell-boolean", "cell-false"],
          highlight: null
        }
      ],
      searchText: "1 failure b false failed e_timeout timed out 1200"
    }
  ],
  meta: {
    totalRows: 200,
    visibleRows: 13,
    totalColumns: 63,
    visibleColumns: 38,
    hiddenColumns: 25,
    activeFilterCount: 2,
    searchQuery: "timeout",
    sort: { columnKey: "durationMs", direction: "desc" }
  }
}
```

Build this model with pure-ish functions so tests can validate behavior without DOM.

## State additions

Extend app state:

```js id="6rmw05"
{
  table: {
    sort: {
      columnKey: null,
      direction: "none" // "none" | "asc" | "desc"
    },
    searchQuery: "",
    quickFilter: "all", // all | failures | warnings | ok | unknown | issues
    density: "compact", // already in ui maybe; keep one source of truth
    wrapCells: false,   // already in ui maybe; keep one source of truth
    columnWidths: {},
    renderLimit: 1000,
    selectedRowIndex: null
  },
  highlightRules: [
    // dataset-specific, user-configured
  ],
  highlightRulesEnabled: true
}
```

Avoid duplicate density/wrap if chunk 01 already stores under `ui`. Prefer existing state:

```text id="05ko4i"
ui.density
ui.wrapCells
```

Table-specific:

```js id="cg07hf"
{
  sort: { columnKey: null, direction: "none" },
  searchQuery: "",
  quickFilter: "all",
  columnWidths: {},
  renderLimit: 1000
}
```

Persist:

```text id="w075vr"
density
wrapCells
columnWidths maybe
highlightRules
highlightRulesEnabled
quickFilter maybe
```

Do not persist search query unless already expected. Search is session-like; okay not persisted.

Highlight rules are dataset-specific styling. Persist under app state/localStorage for convenience, but include reset. In future, may tie to dataset hash. For this chunk, simple persistence okay.

## Table render structure

Use semantic table where possible:

```html id="br9y6m"
<div class="jti-table-shell">
  <div class="jti-table-toolbar">...</div>
  <div class="jti-table-scroll">
    <table class="jti-table">
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</div>
```

Semantic `<table>` preferred for accessibility and spreadsheet-like behavior.

If using div grid for sticky/width reasons, need accessible roles. But semantic table simpler.

Use RetroOS components around table:

```text id="6f3wkj"
AwwPanel for result pane
AwwToolbar for search/filter/settings controls
AwwButton for quick filters/sort toggles
AwwInput for search
AwwSelect for quick filter/density if needed
AwwCheckbox for wrap/highlight toggle
AwwAlert for filtered-empty/large-render warning
```

Actual table can be semantic HTML styled by app CSS. Framework likely lacks dedicated table component.

## Table toolbar

In result pane, above table:

```text id="a00qjf"
Search input
Quick filter select/buttons
Rows visible count
Sort indicator maybe in headers
Density control if not already in Mapping pane
Wrap toggle
Highlight toggle
Highlight rule controls open/inline
```

Controls:

```text id="fo2yxe"
Search: text input
Quick filter: All / Issues / Failures / Warnings / OK / Unknown
Density: Compact / Normal / Roomy
Wrap cells: checkbox
Highlights: checkbox enabled/disabled
Add highlight rule: button
```

`Issues` means failure + warning.

Search placeholder:

```text id="ztj9b0"
Search visible cells…
```

Search behavior:

```text id="mt1wgl"
case-insensitive
matches visible cells by default
also include health label and row number
do not search hidden columns in this chunk
trim query
multi-word query: all words must match row search text
empty query = no search filter
```

Example:

```text id="fj8hck"
query "timeout failed" matches row if both timeout and failed appear anywhere visible
```

Need status text:

```text id="xz6l11"
Showing 13 of 200 rows
Search: timeout
Filter: failures
```

## Quick filters

Filter options:

```text id="b8urt1"
all = all rows
issues = failure or warning
failures = health.level === failure
warnings = health.level === warning
ok = health.level === ok
unknown = health.level === unknown
```

If no health object:

```text id="0xb769"
treat as unknown
```

Filtered empty state:

```text id="45a4fi"
No rows match current search/filter.
[Clear search] [Show all rows]
```

Do not clear parse/table data when filters empty.

## Sorting

Header click cycles:

```text id="ktlfep"
none -> asc -> desc -> none
```

Or asc -> desc -> none. Choose and document.

Only one column sorted at a time.

Sort indicators:

```text id="9lnsv5"
▲ asc
▼ desc
blank none
```

Also set `aria-sort`.

Sort by visible column cells.

Sort types:

```text id="dzkeyi"
number: numeric
boolean: false before true in asc
string: case-insensitive natural-ish compare
null/missing/empty: stable placement
array/object summary: compare display string
health: custom order if health header sortable
row number: original order
```

Missing/null ordering:

```text id="1uas3z"
For ascending:
actual values first, then null, then empty, then missing
For descending:
actual values first descending, then null, empty, missing
```

Alternative acceptable:

```text id="ua168x"
missing/null always last both directions
```

Preferred: missing/null always last. Simpler, user-friendly.

Stable sort required. If compare equal, original rowIndex order.

Health sort order:

```text id="66q4cx"
failure
warning
unknown
ok
```

Ascending could mean severity high first. Or define clearly:

```text id="jt6awh"
Health header cycles issue-first / ok-first / none.
```

Simpler: health sort desc = failure first, asc = ok first. But default table should already preserve original unless filter. Health column click can use same cycle with documented order.

Default sort:

```text id="qh0yn7"
none, preserve source row order
```

Do not auto-sort failures to top in this chunk unless explicit quick filter. Failure visibility comes from health badge/accent. If product wants failure-first default later, add setting.

## Row numbers

Add system column:

```text id="jd7bgk"
#
```

Shows 1-based source row number:

```text id="g2lwcp"
rowIndex + 1
```

For JSONL, optionally show line number:

```text id="nskk3b"
# = 17
tooltip/title = Line 17
```

Better:

```text id="dg4g4a"
row number column displays source row index by default.
If sourceLineNumber exists, display line number or show secondary title.
```

Need not use title for accessibility only. Could use `aria-label`.

Sticky row number column optional. Sticky header required. Sticky first columns highly useful but can be basic.

Preferred:

```text id="3vwgt5"
sticky header
sticky row number column
sticky health column if feasible
```

If sticky first columns complex, at least sticky header.

## Health column

Add system column:

```text id="x0rwv5"
Health
```

Display badge:

```text id="vjxpec"
Failure
Warning
OK
Unknown
```

Also top reason short text maybe:

```text id="olthsz"
Failure · success=false
```

Cell title/aria-label includes top reason, but row details chunk later shows full reasons.

Row styling:

```text id="kjp5l8"
failure row: subtle danger left border or background tint
warning row: subtle warning left border or background tint
ok row: no loud green full row
unknown row: neutral
```

Do not rely on color only. Badge text visible.

## Type-aware cells

Cell CSS classes and display:

### string

```text id="03l1c0"
normal text
long string ellipsis
monospace optional for all values or path-like strings
```

### number

```text id="nkx3ry"
right-align
display String(value)
no locale formatting in core
```

### boolean

```text id="oketir"
badge or compact token true/false
true and false visually distinct
```

### null

```text id="ey1pdl"
display ∅ or null
muted
must be different from missing
```

Preferred:

```text id="jwycs8"
null
```

because clear. Maybe stylized muted pill.

### missing

```text id="t5d9c3"
display —
muted
title "Missing"
```

### empty string

```text id="oa1ywa"
display "" or empty-string badge
```

Preferred:

```text id="4rmc59"
""
```

so user sees value exists but empty.

### empty array/object

```text id="r4go7e"
[] or {}
muted but present
```

### array/object summary

```text id="i3i1b3"
[3 objects]
[5 items]
{3 keys}
```

### truncated

```text id="1mkqb5"
display ellipsis
title/aria-label includes "truncated"
do not rely on native title for full data; full row detail chunk later
```

No raw HTML from data.

Use `textContent`.

## Ellipsis and wrap

Default no wrap:

```css id="3xy3v7"
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

Wrap enabled:

```css id="e1yv7h"
white-space: normal;
overflow-wrap: anywhere;
max-height maybe 8 lines or none
```

Need avoid gigantic row heights. When wrap enabled:

```text id="m51kzy"
Use max cell line count maybe 6 with overflow hidden, or allow natural wrap.
Preferred: max 6 lines in this chunk to keep table usable.
```

User-facing label:

```text id="x8yiaj"
Wrap cells
```

## Density

Use existing state from chunk 01.

Density classes:

```text id="0jkwvx"
jti-density-compact
jti-density-normal
jti-density-roomy
```

Affects:

```text id="qjoy0b"
row height
cell padding
font size maybe
toolbar spacing
badge padding
```

Suggested:

```text id="2l7b0a"
compact: 26-30px row height, 4px 8px padding
normal: 32-36px, 6px 10px
roomy: 42-48px, 8px 12px
```

Keep readable. Do not compress beyond usability.

## Basic column width behavior

Need enough control without complex grid.

Implement:

```text id="tojc5a"
default widths by type/role
CSS min/max widths
manual resize optional but requested "basic column width behavior"
```

Preferred implementation:

```text id="gjs8fd"
Each header has resize handle.
Drag handle adjusts column width in px.
Widths stored in state.table.columnWidths[columnKey].
Double-click handle resets width.
Clamp width: 80px to 480px.
System columns smaller: # 56px, Health 140px.
```

If header resizing too risky, implement CSS-based widths plus documented limitation. But this is crucial table chunk; best effort should implement.

Column width defaults:

```text id="5zfihr"
identity: 140px
boolean: 90px
number: 110px
status/health: 140px
error/message: 240px
long text: 280px
array/object: 160px
default: 160px
```

Use `<colgroup>`:

```html id="rt662t"
<col style="width: 140px">
```

or CSS variables. `colgroup` works well with table-layout fixed.

Use:

```css id="m0gt4b"
table-layout: fixed;
```

for ellipsis and predictable widths.

## Highlight rules feature

User wants dataset-specific styling. Implement simple but useful value highlight system.

Purpose:

```text id="awwp1o"
User can define values/patterns they care about and color them in table.
```

Examples:

```text id="m625ge"
highlight all cells containing E_TIMEOUT in red
highlight status = skipped in yellow
highlight durationMs > 1000 in orange
highlight success = false in red
highlight customer = acme in blue
```

### Highlight rule model

State:

```js id="47omcm"
{
  id: "rule-1",
  enabled: true,
  name: "Timeouts",
  columnKey: "error.code", // or "*" for any visible column
  operator: "contains",
  value: "E_TIMEOUT",
  caseSensitive: false,
  target: "cell", // cell | row
  style: {
    tone: "danger", // danger | warning | info | success | neutral | custom
    emphasis: "fill" // fill | outline | text | badge
  }
}
```

Support operators:

```text id="rfb0po"
equals
contains
startsWith
endsWith
regex
gt
gte
lt
lte
exists
missing
```

For MVP inside this chunk, required:

```text id="1d9yc0"
equals
contains
gt
lt
exists
missing
```

Optional:

```text id="m8145z"
regex
startsWith
endsWith
gte/lte
```

If regex implemented:

```text id="ktt83o"
catch invalid regex
show rule error
do not crash
cap expensive regex? basic try/catch enough
```

Column selection:

```text id="lrckkw"
specific visible column
or any visible column "*"
```

Target:

```text id="8erltk"
cell = highlight matching cells only
row = highlight entire row if any matching cell
```

MVP can implement cell target required, row target optional. User explicitly said "highlight values"; cell target required. Row target useful.

Style tones:

```text id="388np2"
danger
warning
info
success
neutral
purple maybe optional
```

Do not let arbitrary raw CSS injection.

User can define colors, but safely.

Two options:

Preferred safe approach:

```text id="s76kxh"
User chooses from predefined tone palette.
No arbitrary CSS.
```

Because arbitrary CSS/color input can create unreadable UI or injection if mishandled.

But user asked define colors. Support safe custom color as CSS color value only if validated:

```text id="25aupv"
custom background color from <input type="color">
custom text color optional auto/black/white
```

Implementation:

```text id="80yp1z"
Use input type=color for custom background.
Do not accept arbitrary CSS strings.
Apply as CSS variable value from validated hex color only.
Compute readable text color black/white based on luminance.
```

Rule style:

```js id="1upq19"
style: {
  tone: "custom",
  backgroundColor: "#ffd166",
  textColor: "#111827",
  emphasis: "fill"
}
```

Validation:

```text id="8cqpq8"
Only accept /^#[0-9a-fA-F]{6}$/.
Fallback to warning tone if invalid.
```

### Highlight rule UI

In table toolbar or side area inside Mapping/Options pane.

Simple UI:

```text id="4jg59f"
Highlights [enabled checkbox]
[+ Add rule]

Rule row:
Name [Timeouts]
Column [Any column / error.code / status / success]
Operator [contains]
Value [E_TIMEOUT]
Target [Cell / Row]
Tone [Danger / Warning / Info / Success / Custom]
Color [#ffcc00] if custom
[Enabled] [Delete]
```

Do not overcomplicate. Can start with one inline form and list of rules.

Minimum UI acceptable:

```text id="b2tw8u"
Highlight toggle
Add rule form:
- column select
- operator select
- value input
- color/tone select
- add button
List existing rules with enable/delete
```

Rule editing can be delete/re-add if inline editing too much. But better allow inputs bound to rule.

### Highlight matching

Pure function:

```js id="m3076g"
export function matchHighlightRule(cell, column, row, rule) {}
export function getCellHighlights(cell, column, row, rules) {}
export function validateHighlightRule(rule, columns) {}
```

Rules apply after search/filter/sort to all rendered rows.

Precedence:

```text id="svlmpc"
If multiple rules match a cell, first enabled rule wins for visual style.
Still expose matched rule names in title/aria maybe comma-separated.
Rules order = array order.
```

Need rule count/status:

```text id="4zcs44"
3 highlight rules active
```

Search is independent from highlights.

### Highlight display

Cell classes:

```text id="dq2czw"
jti-highlight
jti-highlight-danger
jti-highlight-warning
jti-highlight-info
jti-highlight-success
jti-highlight-custom
```

Custom color via CSS variables on cell:

```html id="q3n6xb"
<td style="--jti-highlight-bg: #ffd166; --jti-highlight-fg: #111827">
```

Safe because validated hex only.

Do not use `style` from arbitrary string.

### Highlight edge cases

```text id="cw04w6"
contains on missing -> false
exists on present null -> true? Define:
  exists = not missing and not empty/null? Better:
  exists = path present and meaningful value.
  present = not missing could be future operator.
missing = state missing.
equals null needs value "null" maybe match null display.
gt/lt only numeric values or numeric strings; non-number false.
case insensitive string operators by default.
regex invalid -> rule invalid, no match, show rule error.
```

Definition:

```text id="j6fj82"
exists = state is not missing, not null, not empty string, not empty array/object
missing = state is missing
```

## Table rendering performance

Rendering thousands of rows x many columns can be heavy.

Implement guardrail:

```text id="x3t6ve"
renderLimit default 1000 rows
If filtered rows > renderLimit, render first N and show notice:
"Showing first 1,000 of 8,423 matching rows. Narrow search/filter or later performance mode."
```

Do not discard data. Only render limited rows.

Use document fragment for table body.

Avoid re-rendering entire app for every keystroke if possible. But table can rerender on state changes.

Search debounce:

```text id="27wt6o"
150-250ms for search input
```

Sorting/filtering pure and fast.

Future chunk 08 may add virtualization/performance. For now render cap acceptable.

## Accessibility

Required:

```text id="9f21gt"
table has caption or aria-label
headers use th scope="col"
sortable headers are buttons or have button inside th
aria-sort set on sorted column
search input labelled
quick filter labelled
density/wrap controls labelled
highlight controls labelled
health badges include text
missing/null cells have accessible label/title
filtered-empty state visible
keyboard can tab to controls and sortable headers
```

Resizable handles:

```text id="0g7p04"
aria-label="Resize column {label}"
mouse drag supported
keyboard resize optional
```

If keyboard resize not implemented, no fake keyboard support.

## Visual design

RetroOS table, not modern SaaS grid.

Style requirements:

```text id="dm0fcz"
subtle header surface
sticky header with retro border/shadow
thin grid lines
compact system font
row hover
selected/active row optional
failure/warning left rail or muted tint
no heavy rainbow zebra
no random bright colors
zebra stripes very subtle if used
```

Cell status:

```text id="ftm83t"
missing muted dash
null muted token
boolean tokens compact
health badges textual
highlight colors readable
```

Use CSS tokens from RetroOS when available.

## Safety

All cell data untrusted.

Mandatory:

```text id="v6f80o"
Use textContent for cell contents.
Never innerHTML with values.
Never use user-provided value as class name.
Never use arbitrary CSS from user.
Validate custom highlight colors as hex only.
Do not log raw cell values.
Do not stringify full rows into DOM attributes.
```

Do not put full original values into `title` for huge text or secret risk. Use truncated display. Full row detail later.

## Interaction sequence

When state has no data:

```text id="e9pirb"
Show placeholder: Paste JSON to build table.
```

When parse invalid:

```text id="48jb1u"
Show parse error from chunk 02, and table pane says fix parse error.
```

When flattened/scored data ready:

```text id="m3khw2"
Build table view model.
Render toolbar.
Render table.
```

When user types search:

```text id="8w6kti"
update state.table.searchQuery
rebuild view model
rerender rows/counts
```

When user changes quick filter:

```text id="np7z1f"
update quickFilter
rerender
```

When user clicks header:

```text id="x4nfl6"
cycle sort state for that column
rerender rows/header sort state
```

When user toggles wrap/density:

```text id="5f0nho"
update ui state
persist
rerender CSS classes
```

When user resizes column:

```text id="xwfn5m"
update columnWidths live or on pointerup
persist
update col width
```

When user adds highlight rule:

```text id="49kn78"
validate rule
add to highlightRules
rerender table
show active rule count
```

## Sort/filter/search order

Apply operations in this order:

```text id="h57vfc"
1. start from scoredRows in source order
2. quick filter
3. global search
4. sort
5. render cap
6. highlight rendered cells
```

Why: search/filter define set, sort orders set, render cap limits DOM.

## Table view model tests

Add tests for pure functions.

### Search/filter tests

```text id="41xtqw"
empty query returns all rows
case-insensitive search
multi-word search requires all words
search matches visible cell display
search matches health label/top reason
search does not match hidden column
quick filter failures
quick filter warnings
quick filter issues
quick filter ok
quick filter unknown
search + filter combine correctly
filtered empty status
```

### Sort tests

```text id="gkwfgw"
numeric ascending/descending
string case-insensitive
boolean sort
missing/null last
stable sort by original rowIndex
health sort severity
sort cycle none -> asc -> desc -> none
```

### Cell display/model tests

```text id="f2trz3"
number right align metadata
boolean class true/false
null display distinct
missing display distinct
empty string display distinct
array summary display
object summary display
truncated long string metadata
system row number value
health cell model
```

### Highlight tests

```text id="1jum6s"
equals matches exact display/value
contains case-insensitive
gt/lt numeric
exists meaningful value
missing state
any-column rule
specific-column rule
disabled rule ignored
first matching rule wins
custom hex color validation
invalid custom color rejected/fallback
invalid regex if implemented does not throw
row target if implemented
```

### Column width tests

If pure helpers:

```text id="sl8g8z"
default width by type/role
clamp min/max
reset width
persistable state shape
```

## UI/manual test checklist

```text id="8rxcle"
Paste valid sample. Table appears.
Sticky header stays visible on scroll.
Row numbers visible.
Health column visible.
Failure rows visually marked and have text badge.
Null, missing, empty string display differently.
Long text ellipsizes by default.
Wrap toggle wraps values and persists.
Density changes row spacing and persists.
Click column header sorts asc/desc/none.
Missing/null values sort last.
Search finds visible cells case-insensitively.
Multi-word search works.
Quick filter failures shows failures only.
Issues filter shows failures + warnings.
Filtered empty state appears and clear actions work.
Column resize works and persists, if implemented.
Add highlight rule contains E_TIMEOUT danger. Matching cells highlight.
Add numeric highlight durationMs > 1000. Matching cells highlight.
Disable highlights removes visual highlights.
Invalid custom color cannot inject CSS.
Large dataset shows render cap notice instead of freezing.
Console logs table actions without raw data.
Keyboard can reach search/filter/header buttons.
```

## Edge cases

### No visible columns

If `visibleColumnKeys` empty:

```text id="yqgkwf"
Render system columns # and Health.
Show warning: No data columns visible.
```

### No rows

```text id="1ll2ec"
No rows to display.
```

### All rows filtered out

```text id="9dmyva"
No rows match current search/filter.
Show Clear search / Show all.
```

### Huge column count but few visible

```text id="o4y3w4"
Render visible only.
Status shows hidden count.
```

### Long unbroken string

```text id="gzr60k"
No-wrap ellipsis must not stretch column forever.
Wrap mode uses overflow-wrap:anywhere.
```

### Weird column labels

Column labels from paths may include brackets/quotes. Render with textContent. Do not break layout.

### Duplicate display labels

Use unique column key internally. Header can show label. If duplicate labels exist, add path title or full key in label. Avoid duplicate DOM ids.

### Highlight with missing column

If highlight rule references column no longer present after input changes:

```text id="kk6kt3"
Rule remains in state but marked inactive/invalid:
"Column not found in current dataset."
No crash.
```

### Highlight on hidden column

If rule references hidden column:

```text id="xpxvlf"
No visible cells match.
Rule list can show "Column hidden".
Do not search hidden cells in this chunk.
```

### Search hidden columns

Not in this chunk. Visible cells only. Make clear if needed.

### Numeric string sort

If column dominant type is number but some cells are numeric strings:

```text id="njmflv"
Sort actual numbers numerically.
Numeric strings can be parsed for sort if safe.
Non-numeric values after numbers, before missing or after? Define:
numbers first, strings after, missing last.
```

Simpler acceptable: sort by cell type then display. Tests should match implementation.

### Boolean string

Display as string unless cell type boolean. Health may interpret separately from chunk 05.

## CSS class names

Suggested:

```text id="d3f7zx"
jti-table-shell
jti-table-toolbar
jti-table-scroll
jti-table
jti-table-head
jti-table-body
jti-th
jti-td
jti-cell
jti-cell--number
jti-cell--boolean
jti-cell--string
jti-cell--null
jti-cell--missing
jti-cell--empty
jti-row--failure
jti-row--warning
jti-row--ok
jti-row--unknown
jti-health-badge
jti-highlight
jti-highlight--danger
jti-highlight--warning
jti-highlight--info
jti-highlight--success
jti-highlight--custom
jti-density-compact
jti-density-normal
jti-density-roomy
jti-wrap-cells
jti-column-resizer
```

Keep names consistent.

## Logger instrumentation

Required logs:

```text id="np1ivh"
[JTI:Table] Build view model { rowCount, visibleColumnCount, searchActive, quickFilter, sortColumn }
[JTI:Table] Render table { renderedRows, totalMatchingRows, columnCount, durationMs }
[JTI:Table] Search changed { queryLength, wordCount }
[JTI:Table] Quick filter changed { quickFilter }
[JTI:Table] Sort changed { columnKey, direction }
[JTI:Table] Density changed { density }
[JTI:Table] Wrap changed { wrapCells }
[JTI:Table] Column resized { columnKey, width }
[JTI:Highlight] Rule added { ruleId, columnKey, operator, target, tone }
[JTI:Highlight] Rule updated { ruleId, valid }
[JTI:Highlight] Rule deleted { ruleId }
[JTI:Highlight] Rules applied { enabledRuleCount, matchedCellCount, renderedRows }
```

Do not log cell values/search text. Search query can contain sensitive data. Log query length and word count only, not text.

## Extra review/refactor requirement

This chunk is complex. Agent must do two self-review passes.

Required process:

```text id="owxijz"
1. Implement.
2. Run tests/build.
3. Self-review critical/medium issues.
4. Refactor table modules for clarity.
5. Run tests/build again.
6. Do second focused review:
   - security
   - performance
   - state consistency
   - accessibility
   - highlight rule safety
7. Fix critical/medium issues.
8. Final report.
```

Agent final report must include:

```text id="0hdu55"
First review fixes
Second review fixes
Known limitations
```

## Documentation comments

Add comments for non-obvious logic:

```text id="vu5wyr"
sort missing/null placement
highlight rule matching
column width clamp
render cap
search tokenization
health sort order
```

Do not over-comment simple DOM creation.

## Done criteria

Chunk `06` done when:

```text id="03wsqj"
Main table renders real scored/flattened rows.
Sticky header works.
Row number system column visible.
Health system column visible.
Cells render type-aware displays.
Null/missing/empty values are visually distinct.
Long values ellipsize by default.
Wrap toggle works and persists.
Density toggle works and persists.
Column sorting works and is stable.
Global search works on visible cells.
Quick filters work: all/issues/failures/warnings/ok/unknown.
Filtered empty state works.
Basic column width behavior exists, preferably drag resize with persistence.
Highlight rules can be created/enabled/disabled/deleted.
Highlight rules support at least equals/contains/gt/lt/exists/missing.
User can choose predefined tones and safe custom hex color.
Highlight matching is safe and does not inject CSS/HTML.
Render cap prevents huge DOM blowup.
State updates cleanly.
Logger instruments table/highlight actions without raw data/search text.
Tests cover view model, search, filter, sort, display, highlights.
Manual checklist completed or blockers documented.
Agent ran tests/build twice after refactor or documented blocker.
Agent did two self-review passes and fixed critical/medium issues.
No row detail drawer/export/full column picker implemented yet.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Implement table renderer and core interactions only. Do not implement row detail drawer, export, or full column picker. Those belong to chunk `07`.

10-spec roadmap:

```text id="uk1vkg"
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

```text id="jr3lmj"
Read 00 spec.
Read 01-05 implementation.
Inspect current state contracts.
Inspect current RetroOS framework usage.
Plan table API and modules before coding.
Implement only chunk 06.
Add/update tests.
Run tests/build.
Self-review pass 1.
Refactor.
Run tests/build again.
Self-review pass 2.
Fix critical/medium issues.
Report exact commands and result.
```

No broad rewrite outside needed integration. No fake pass.

# Appendix C — RetroOS framework rule

Use RetroOS components for table shell controls:

```text id="60igtz"
panel
toolbar
input
select
checkbox
button
alert
status line
list
```

Semantic table itself can be custom HTML and app CSS because framework has no dedicated data-grid component.

Do not create generic modern UI system. RetroOS shell remains dominant.

# Appendix D — Highlight rule safety

User may define colors/values. Treat as untrusted.

Mandatory:

```text id="qcbzuz"
No arbitrary CSS strings.
Only safe enum tones or validated #RRGGBB color.
Compute text color safely.
No user value as class name.
No innerHTML for highlighted values.
Invalid rules show error and do not apply.
Search/highlight values not logged.
```

# Appendix E — Table safety

Mandatory:

```text id="qwbg4t"
textContent for cells/headers.
No full row JSON in attributes.
No raw large value in title.
No eval for path/rules.
No dependency grid library.
No mutation of original row data.
```

# Appendix F — Sorting principle

Sort must be stable and predictable.

Rules:

```text id="wci2um"
missing/null last
numbers numeric
strings case-insensitive
booleans deterministic
health severity deterministic
equal values preserve source order
```

# Appendix G — Search principle

Search must help scan, not surprise.

Rules:

```text id="vl8whe"
visible cells only
case-insensitive
multi-word AND
include health label/top reason
do not log query text
empty query = no filter
```

# Appendix H — Visual principle

Table must look retro, but data first.

Priority:

```text id="ti2jb5"
readable text
clear headers
sticky header
subtle grid
compact density
failure/warning visible but not neon
highlight colors readable
no rainbow theme
```

# Appendix I — Self-review checklist

First review:

```text id="f2b4hz"
Does table render with real data?
Does sort work for all types?
Does search/filter combine correctly?
Does highlight apply correctly?
Does column width work?
Does state persist correctly?
Does invalid/empty state avoid crash?
```

Second review:

```text id="zpddx0"
Any innerHTML with user data?
Any arbitrary CSS injection from highlight?
Any raw values logged?
Any huge DOM render without cap?
Any inaccessible controls?
Any stale state after parse/source change?
Any duplicate event listeners after rerender?
Any memory leak from pointer listeners?
Any brittle tests?
Any table module too large/confusing?
```

Fix critical/medium issues.

# Appendix J — Suggested final report format

```text id="gcwiwo"
Summary:
- Added main table renderer with sticky headers and type-aware cells.
- Added search, quick filters, sorting, density/wrap controls.
- Added highlight rules with safe tones/custom colors.

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
- Row detail drawer, export, and full column picker intentionally not implemented until chunk 07.
```
