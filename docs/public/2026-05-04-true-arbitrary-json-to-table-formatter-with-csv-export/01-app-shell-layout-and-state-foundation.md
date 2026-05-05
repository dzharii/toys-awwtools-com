# 01-app-shell-layout-and-state-foundation.md

## Specification

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows. This chunk is one bounded step in larger 10-spec plan.

This is chunk `01`: **app shell, layout, and state foundation**. Goal: create first runnable app UI using RetroOS framework. No real JSON parsing yet. No flattening yet. No table logic yet. Build shell where future chunks will live.

This chunk value: coding agent creates stable visual/app foundation. Future parser, detector, table, diagnostics, export chunks plug into this structure instead of rewriting layout later.

## Scope

Create static app skeleton with:

```text
RetroOS app window
main app shell
toolbar
left input pane
right output area
right top configuration pane
right bottom table/result pane
footer/status strip
central app state
basic render cycle
localStorage persistence for UI settings
placeholder content for future chunks
```

App must be runnable in browser.

## Required user-facing layout

Use desktop utility shape:

```text
+------------------------------------------------------+
| JSON Table Inspector                      [toolbar]  |
| Paste JSON/JSONL. Detect rows. Inspect failures.     |
+----------------------+-------------------------------+
| Input                | Mapping / Options             |
|                      |                               |
| [textarea placeholder]|------------------------------|
|                      | Table Preview / Results       |
|                      |                               |
+----------------------+-------------------------------+
| Status: Ready · 0 rows · 0 columns · no input        |
+------------------------------------------------------+
```

Need use RetroOS components as much as possible.

Expected components, if available:

```text
AwwWindow / aww-window
AwwAppShell / aww-app-shell
AwwToolbar / aww-toolbar
AwwPanel / aww-panel
AwwButton / aww-button
AwwIconButton / aww-icon-button
AwwTextarea / aww-textarea
AwwStatusbar / aww-statusbar
AwwStatusStrip / aww-status-strip
AwwField / aww-field
AwwSelect / aww-select
AwwCheckbox / aww-checkbox
AwwMetricCard / aww-metric-card
AwwAlert / aww-alert
AwwTabs / aww-tabs
AwwTabPanel / aww-tab-panel
```

Exact names may differ. Agent must inspect vendored framework exports and use real tags/imports.

## Non-goals

Do not implement JSON parser.

Do not implement JSONL parser.

Do not implement row-source detection.

Do not implement flattening.

Do not implement real table rendering.

Do not implement failure scoring.

Do not implement export.

Do not add external dependencies.

Do not replace RetroOS framework with custom CSS.

## Files to create or update

Agent should inspect repo first. Suggested structure:

```text
index.html
src/app/main.js
src/app/state.js
src/app/constants.js
src/ui/render-shell.js
src/ui/render-status.js
src/styles/app.css
src/styles/layout.css
```

If project already has structure, fit into it.

If existing `index.html` exists, update carefully.

If Bun config missing, basic scripts may be added, but full build chunk happens later.

Possible `package.json` placeholder:

```json
{
  "type": "module",
  "scripts": {
    "dev": "bun --hot ./src/app/main.js",
    "test": "bun test"
  }
}
```

But do not force wrong dev script. Static app can also run by opening `index.html`. If no good dev server exists, document manual open.

## App shell requirements

Header/title area:

```text
Title: JSON Table Inspector
Subtitle: Paste arbitrary JSON/JSONL. Detect row data. Inspect failures as table.
```

Toolbar actions placeholder:

```text
Parse
Format
Clear
Copy CSV
Export
```

In this chunk, buttons may be disabled or no-op with status message. `Clear` may clear input because easy and useful.

Toolbar should also include lightweight badges/placeholders:

```text
Input: empty
Rows: 0
Columns: 0
Failures: 0
```

Left input pane:

```text
Panel title: Input
Textarea placeholder: Paste JSON, JSON array, object with results/items, or JSONL here.
Controls: Clear, Collapse input
Footer/helper text: Parser comes in next chunk.
```

Right top pane:

```text
Panel title: Mapping / Options
Placeholder controls:
- Row source: Auto (disabled)
- Flatten mode: Dot paths (disabled)
- Column preset: Failure-first (disabled)
- Wrap cells checkbox (state-backed)
- Density select: Compact / Normal / Roomy (state-backed)
```

Right bottom pane:

```text
Panel title: Table Preview
Placeholder empty state:
Paste JSON on left. Parser and table renderer arrive in later chunks.
```

Footer/status strip:

```text
Ready
Input empty / input has N chars
Rows 0
Columns 0
Failures 0
```

## Layout behavior

Use CSS grid/flex. Preserve retro desktop look.

Desktop layout:

```text
main split: left input pane + right workspace
right workspace split vertical: top config + bottom result
status strip fixed bottom inside app shell
```

Minimum pane sizes:

```text
left pane min-width: 280px
left pane default width: 38%
right pane min-width: 420px
top config min-height: 120px
top config default height: 190px
bottom table fills remaining space
```

Responsive fallback:

```text
If viewport narrow, stack input above output.
Resizable behavior can degrade gracefully on narrow screens.
```

## Resizable/collapsible panes

Chunk `01` should implement basic layout foundation. There are two options.

Preferred in this chunk:

```text
Implement simple resize grips:
- vertical grip between input and right workspace
- horizontal grip between right config and table preview
- input collapse toggle
Persist sizes
```

Acceptable if time/context risk high:

```text
Create clear structure and CSS variables for pane sizes.
Implement collapse input.
Leave actual drag resizing as TODO for chunk 02-equivalent behavior? 
```

But current 10-spec roadmap has no separate pane chunk. So best effort: implement resizing now.

Resize requirements:

```text
Drag vertical grip changes --left-pane-width.
Drag horizontal grip changes --right-top-height.
Clamp sizes to min/max.
Persist values in localStorage.
Double-click grip resets default size.
Collapse input hides left pane and grip.
Collapsed state persists.
```

No need perfect accessibility for grips yet, but must not break keyboard navigation.

State fields:

```js
{
  ui: {
    inputCollapsed: false,
    leftPaneWidth: null,
    rightTopHeight: null,
    density: "compact",
    wrapCells: false
  }
}
```

## State foundation

Create central app state module.

State must be plain object or controlled store. No framework dependency.

Suggested shape:

```js
export const DEFAULT_STATE = {
  inputText: "",
  parseResult: null,
  rowSourceCandidates: [],
  selectedRowSourcePath: null,
  flattenOptions: {
    mode: "dotPaths",
    columnPreset: "failureFirst"
  },
  columns: [],
  rows: [],
  visibleColumnKeys: [],
  filters: {
    search: "",
    health: "all"
  },
  sort: null,
  selectedRowIndex: null,
  ui: {
    inputCollapsed: false,
    leftPaneWidth: null,
    rightTopHeight: null,
    density: "compact",
    wrapCells: false
  }
};
```

Chunk `01` only uses some fields. Include future fields to stabilize later chunks.

State module should export:

```js
createInitialState()
loadPersistedState()
persistUiState(state)
updateState(patchOrUpdater)
subscribe(listener)
getState()
```

Simpler store allowed. But must support later render updates.

Persist only:

```text
inputText optional
ui.inputCollapsed
ui.leftPaneWidth
ui.rightTopHeight
ui.density
ui.wrapCells
```

Use localStorage key:

```text
json-table-inspector.state.v1
```

Handle malformed localStorage safely. No crash.

## Render foundation

Use explicit render functions. Avoid one giant `main.js`.

Suggested modules:

```text
main.js
  imports framework
  imports CSS
  creates store
  mounts shell
  binds events
  renders once

render-shell.js
  builds DOM skeleton
  returns references/elements

render-status.js
  updates status badges/strip from state
```

Use `textContent` for all user-controlled text. In this chunk input text only goes into textarea/value, not HTML.

Event handling:

```text
input textarea updates state.inputText
Clear button clears inputText
Collapse button toggles ui.inputCollapsed
Wrap checkbox toggles ui.wrapCells
Density select changes ui.density
Resize updates ui.leftPaneWidth/rightTopHeight
```

Render should update:

```text
textarea value
input char count
collapsed class
CSS variables for pane sizes
density attribute/class
wrap attribute/class
status strip
placeholder badges
```

Avoid re-creating whole DOM on every keystroke if easy. But correctness first.

## CSS requirements

Use RetroOS tokens where available. Inspect existing token names.

Custom app CSS may define:

```css
.app-root {}
.app-workspace {}
.app-split {}
.input-pane {}
.resize-grip {}
.output-pane {}
.mapping-pane {}
.result-pane {}
.placeholder-table {}
```

But visual styling should lean on framework.

Use CSS variables:

```css
--jti-left-pane-width
--jti-right-top-height
--jti-table-row-height
```

Density mapping:

```text
compact -> smaller controls/table placeholders
normal -> default
roomy -> larger spacing
```

No actual table rows yet, but set class/attribute for future table.

## Empty states

App should show clear placeholder messages.

Input pane helper:

```text
Paste JSON, JSON array, object-with-results, or JSONL here.
```

Mapping pane placeholder:

```text
Parser not connected yet. Later this area will show detected row source, flatten mode, and column settings.
```

Result pane placeholder:

```text
No table yet. Paste JSON, then future parser/table chunks will show rows here.
```

Status strip when empty:

```text
Ready · Input empty · Rows 0 · Columns 0 · Failures 0
```

When input typed:

```text
Ready · Input 1,234 chars · Rows 0 · Columns 0 · Failures 0
```

## Accessibility baseline

Use labels.

Required:

```text
Textarea has label.
Collapse button has accessible text.
Resize grips have aria-label if implemented.
Density select has label.
Wrap checkbox has label.
Toolbar buttons have text labels or aria-label.
Status updates visible as text.
```

No color-only meaning.

## Manual test checklist

Agent must manually verify or create checklist:

```text
App loads without console errors.
RetroOS framework components render.
Title/subtitle visible.
Toolbar visible.
Left input pane visible.
Right top mapping pane visible.
Right bottom result pane visible.
Footer/status strip visible.
Typing in textarea updates character count.
Clear empties textarea.
Collapse input hides/shows left pane.
Density select updates state and persists after reload.
Wrap checkbox updates state and persists after reload.
Pane resize grips work and persist after reload, if implemented.
Narrow viewport remains usable.
```

## Automated tests

Chunk mostly UI. Still add tests for state persistence if test setup exists.

Suggested tests:

```text
createInitialState returns deep copy, not shared DEFAULT_STATE.
loadPersistedState handles missing storage.
loadPersistedState handles malformed JSON.
persistUiState stores only allowed fields.
```

If localStorage unavailable in Bun tests, isolate storage adapter:

```js
createMemoryStorage()
```

Test pure storage helpers without DOM.

## Done criteria

Chunk `01` done when:

```text
App opens as static browser page.
RetroOS framework used for shell/controls/panels.
Visible layout matches planned left/right/top/bottom structure.
Central state module exists.
UI settings persist safely.
Input textarea updates state.
Status strip updates input char count.
Clear/collapse/density/wrap controls work.
Resize grips work or structure is ready with documented limitation.
No real parser/table logic implemented.
Tests added for state/persistence where feasible.
Agent ran tests/build or documented exact blocker.
Agent self-reviewed and fixed critical/medium issues.
```

---

# Appendix A — Project reminder for agent

We build static RetroOS-style **JSON Table Inspector**. User pastes arbitrary JSON/JSONL from jobs, APIs, logs, or batch outputs. App turns it into readable spreadsheet-like table so user can quickly find failures, missing fields, errors, and suspicious rows.

This chunk is one bounded step. Do not implement future chunks. Build foundation cleanly.

10-spec roadmap:

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

# Appendix B — Mandatory agent workflow

For this chunk:

```text
Read 00 spec.
Inspect repo.
Inspect RetroOS framework exports.
Plan file changes.
Implement only chunk 01.
Add/update tests.
Run tests.
Run build/dev smoke if available.
Self-review diff.
Fix critical/medium issues.
Report exact commands and result.
```

Do not ask user for choices if safe local decision exists.

# Appendix C — RetroOS framework rule

Use RetroOS components as primary UI system.

Allowed custom CSS:

```text
pane grid
resize grips
table placeholder structure
small app-specific spacing
```

Not allowed:

```text
rebuilding all controls as custom div/button CSS
modern SaaS card system
Bootstrap/Tailwind-like utility replacement
framework-specific JSON components inside vendor
```

If framework lacks needed behavior, prefer app-level composition. Modify framework only for generic framework bug or generic capability.

# Appendix D — Security and data safety

Even in shell chunk, assume pasted text untrusted.

Rules:

```text
No innerHTML with input text.
No eval.
No network fetch from pasted content.
No script execution.
Use textContent/value.
localStorage parse wrapped in try/catch.
```

# Appendix E — Self-review checklist

Before final report, check:

```text
Any console crash on load?
Any missing import path?
Any framework tag typo?
Any state mutation bug?
Any localStorage crash?
Any impossible-to-use layout at small sizes?
Any user text inserted as HTML?
Any future chunk blocked by bad structure?
```

Fix critical/medium issues.

# Appendix F — Suggested final report format

```text
Summary:
- Created RetroOS app shell with input/output panes.
- Added state store and UI persistence.
- Added placeholder mapping/result panels.

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
- Parser/table logic intentionally not implemented until later chunks.
```
