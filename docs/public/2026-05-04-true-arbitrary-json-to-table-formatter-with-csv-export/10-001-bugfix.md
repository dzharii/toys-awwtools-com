2026-05-05

Use this Codex fix spec.

```text id="ec177u"
Read AGENTS.md first. This is a focused UI bugfix, not a new feature chunk. Do not rewrite the table system. Fix table text selection behavior and reduce unnecessary table rerenders caused by row selection/click handling.
```

## Problem

In the result table, user wants to select arbitrary cell text across rows/columns and copy it manually. Current behavior interferes with native browser text selection.

Observed behavior:

```text id="zyifgu"
1. User drags/selects text inside the table.
2. If mouseup ends inside the table, app handles the click/row selection.
3. Row details below table update.
4. Table or result area rerenders.
5. Browser text selection is cleared.
```

Workaround today: user starts selection inside table and releases mouse outside table. That preserves selection, which confirms app event handling/rerender is causing selection loss.

Also, system/meta cells are being selected:

```text id="7p9bcm"
# row number column
Health column
health badge text like Unknown
```

Those should behave like table chrome, not user data. User wants to select actual data cells, not row numbers or health metadata.

Health column also takes space and is noisy when all rows are `Unknown`. It is useful when failures/warnings exist, but distracting for all-unknown datasets.

## Goals

Implement small, careful fixes:

```text id="7lsmab"
Native text selection inside data cells should work.
Finishing a drag selection inside the table should not clear selection.
Clicking a row should not rerender the full table unless visible table data actually changed.
Row details may update on intentional row click, but not after text selection drag.
# and Health columns should be non-selectable table chrome.
Health display should be less noisy when every row is Unknown.
```

## Non-goals

```text id="z5ppif"
Do not rewrite table rendering.
Do not remove row details.
Do not remove health metadata entirely from the app.
Do not change failure detection logic.
Do not change export behavior unless system columns are explicitly involved.
Do not add a complex custom selection model.
Use native browser text selection.
```

## Required behavior

### 1. Distinguish click from text selection drag

Add pointer/mouse tracking around table rows/cells.

A row click should open/update row details only when it is a real click, not a text-selection drag.

Suggested logic:

```js id="m3bpnk"
let pointerDownInfo = null;

function onTablePointerDown(event) {
  pointerDownInfo = {
    x: event.clientX,
    y: event.clientY,
    target: event.target,
    time: performance.now()
  };
}

function isSelectionDrag(event) {
  if (!pointerDownInfo) return false;

  const dx = Math.abs(event.clientX - pointerDownInfo.x);
  const dy = Math.abs(event.clientY - pointerDownInfo.y);

  if (dx > 4 || dy > 4) return true;

  const selection = window.getSelection?.();
  if (selection && !selection.isCollapsed && String(selection).trim().length > 0) {
    return true;
  }

  return false;
}

function onRowClickOrPointerUp(event, rowIndex) {
  if (isSelectionDrag(event)) {
    return;
  }

  selectRow(rowIndex);
}
```

Implementation may use `pointerdown/pointerup`, `mousedown/mouseup`, or `click`, but outcome matters:

```text id="6czbo4"
drag selection does not select row
drag selection does not update row details
drag selection does not rerender table
normal click still selects row and updates row details
```

If current code uses row `click`, guard click handler with `window.getSelection()`:

```js id="97va7y"
function handleRowClick(event, rowIndex) {
  const selection = window.getSelection?.();
  if (selection && !selection.isCollapsed && selection.toString().trim()) {
    return;
  }

  selectRow(rowIndex);
}
```

Best version uses both movement threshold and selection check.

### 2. Do not rerender table on selected row/details-only updates

Currently, selecting a row appears to rerender the table. That clears native selection and is unnecessary.

Refactor render/update path:

```text id="xwezrr"
Table data render should happen only when rows/columns/search/filter/sort/highlights/density/wrap/widths change.
Row details update should render only row details panel.
Selected row visual update should be minimal, not full table rebuild.
```

Preferred implementation:

```text id="rm13gr"
Split renderTable() and renderRowDetails().
On row selection:
- update selectedRowIndex in state
- update row details panel only
- optionally update selected-row class on old/new tr nodes directly
- do not rebuild table tbody
```

If architecture makes that hard, at minimum:

```text id="m601h6"
row selection must not call full app render
row selection must not rebuild table body
```

Add a small helper:

```js id="w0aa7o"
function updateSelectedRowClass(tableRoot, previousRowIndex, nextRowIndex) {
  if (previousRowIndex != null) {
    tableRoot.querySelector(`[data-row-index="${previousRowIndex}"]`)?.classList.remove("jti-row--selected");
  }
  if (nextRowIndex != null) {
    tableRoot.querySelector(`[data-row-index="${nextRowIndex}"]`)?.classList.add("jti-row--selected");
  }
}
```

Do not store user data in DOM attributes. Row index is okay.

### 3. Make system columns non-selectable

The row number and Health columns are table chrome. They should not be included in drag text selection.

Add class names:

```text id="55clx9"
jti-cell--system
jti-cell--row-number
jti-cell--health
jti-th--system
```

CSS:

```css id="42rikp"
.jti-cell--system,
.jti-th--system,
.jti-health-badge {
  user-select: none;
}
```

Data cells remain selectable:

```css id="ahvslv"
.jti-cell--data {
  user-select: text;
}
```

Avoid applying `user-select: none` to the whole table. Only system/chrome cells.

If row click handler is on `<tr>`, system cells still should not interfere with selecting data cells.

### 4. Make Health less noisy for all-unknown datasets

Current table shows a Health column with `Unknown` badges for every row. When all rows are unknown, this wastes width and adds visual noise.

Implement one of these options, in this order of preference:

#### Preferred option: auto-compact Health column when no issues exist

If health summary has:

```text id="oqtx84"
failureCount === 0
warningCount === 0
okCount === 0
unknownCount === rowCount
```

Then:

```text id="j4wjeb"
do not render Health as a full data-like column
show health state in diagnostics/status instead:
"Rows are unknown because no obvious success/failure fields were found."
keep row number column
```

If any row has failure/warning/ok, show Health column.

This preserves value when health is useful and removes noise when it is not.

#### Acceptable option: compact Health column

Keep Health column but make it narrower and visually quieter:

```text id="xtypq8"
header: "State" or icon/short label
unknown cells show muted "—" or no badge
failure/warning/ok still show text badge
```

Do not make failure/warning only color-based. Text still required.

### 5. Selection-friendly table CSS

Ensure browser selection is readable:

```css id="zbk3yx"
.jti-table ::selection {
  background: Highlight;
  color: HighlightText;
}
```

Do not style selection so it disappears.

Do not use overlays/pseudo-elements above cells that block text selection.

### 6. Keep copy/cell-click behavior sane

If chunk 07 implemented selected-cell/copy-cell behavior, it must not fight text selection.

Rules:

```text id="zpsdvl"
Single click on cell may select row/cell.
Drag select text must not select row/cell.
Double click word selection must not immediately rerender and clear selection.
Copy Cell button should still work for intentionally selected cell.
Native Ctrl/Cmd+C after text selection should copy selected text, not forced app cell data.
```

If there is a table-level `mouseup` or `click` that always selects cell, guard it the same way.

## Implementation notes

Search current code for:

```text id="24wjbt"
renderTable
renderResult
renderApp
selectedRowIndex
rowDetailsOpen
addEventListener("click"
addEventListener("mouseup"
onRowClick
onCellClick
```

Likely fix area:

```text id="6aqx5e"
src/ui/render-table.js
src/ui/table-interactions.js
src/ui/render-row-details.js
src/app/state.js or main render orchestration
src/styles/app.css or table.css
```

Do not introduce framework changes unless generic.

## Tests

Add or update pure/UI tests where possible.

### Pure helper tests

If adding click/drag helper:

```js id="1do99g"
isPointerDrag({ startX: 10, startY: 10, endX: 12, endY: 12 }) === false
isPointerDrag({ startX: 10, startY: 10, endX: 20, endY: 10 }) === true
```

### DOM/manual tests

Manual checklist required:

```text id="p9z3vy"
1. Load Root Array or Wide Records example.
2. Drag-select text across several data cells and release mouse inside table.
3. Selection remains visible.
4. Row details do not update because of the drag.
5. Table does not visually rerender/flash.
6. Drag-select starting in fullName and ending in nickname. Row number and Health text are not selected.
7. Single-click a row. Row details update.
8. Double-click a word in a data cell. Browser word selection remains.
9. Ctrl/Cmd+C after text selection copies selected text.
10. If all rows are Unknown, Health column is hidden or compact per chosen approach.
11. If a dataset has failures, Health column/badge still appears and remains readable.
```

If automated DOM test setup exists, add a test that row click handler ignores non-collapsed selection. If not, manual checklist is enough for this UI bug.

## Logging

Add minimal safe logs if helpful:

```text id="5h6qxy"
[JTI:Table] Row selection skipped during text selection { rowIndex }
[JTI:Table] Row selected { rowIndex }
```

Do not log selected text.

## Acceptance criteria

Done when:

```text id="1v8oj2"
Text selection across table data cells works normally.
Mouseup inside table after drag selection does not clear selection.
Row details do not update from drag selection.
Full table body does not rerender on row selection/details-only update.
Row number and Health/system cells are not text-selectable.
Data cells remain selectable.
Health column is hidden/compact when all rows are unknown, or otherwise much less distracting.
Failure/warning health display still works when useful.
Tests or manual checklist cover this behavior.
No raw selected text is logged.
Existing table search/filter/sort/highlight/export behavior still works.
```
