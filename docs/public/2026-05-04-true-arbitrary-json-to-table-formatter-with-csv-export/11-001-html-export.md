Add this as a focused addendum to `07-column-controls-row-details-and-export.md`.

# Addendum — Download Visible Table as Static HTML

We build JSON Table Inspector, a local-first browser tool that turns JSON/JSONL into a readable table for inspection, failure analysis, and export. This addendum adds one export feature: **Download HTML**.

The feature should download the currently rendered visible table as a single, standalone, static `.html` file. This file is for viewing, sharing, archiving, copying, or processing elsewhere. It must not include app JavaScript, interactive controls, hidden app state, or the full original dataset. It should be a static visual export of the table the user is currently looking at.

## Scope

Implement a **Download HTML** button near the existing export controls.

The export should use the already-rendered table DOM node as the source whenever feasible. Clone the table, clean it, wrap it in a valid HTML document, inject a small static CSS block, and initiate a download.

This is not a new renderer. Do not build a separate table style from scratch unless cloning proves unsafe or impossible. Reuse the current table element names, classes, CSS naming conventions, and visual rules already present in the codebase. Inspect the existing table renderer and stylesheet first. The exported HTML should look like the app table because it reuses the same semantic structure and class names, not because a second unrelated table style was invented.

If there is ambiguity, use best judgment. This is a download/export feature, not an architecture rewrite.

## Export behavior

HTML export uses the current visible rendered table view:

Current visible rows after search/filter/sort.

Current visible columns.

Current row order.

Current displayed cell values.

Current health/system columns if they are rendered.

Current static visual classes where safe and useful.

If the table render cap is active, export the currently rendered table subset. Include metadata saying the export is the rendered visible subset, not the full dataset.

Do not export hidden columns.

Do not export full original row JSON unless it is already visible in table cells.

Do not export row details panel.

Do not export toolbar controls, filter controls, column picker, highlight rule editor, resize handles, or app shell.

## Output file

Generate one valid standalone HTML file.

The file must include:

DOCTYPE.

html element with lang.

head with charset and viewport.

title such as “JSON Table Inspector Export”.

style block with static table CSS.

body with a simple export wrapper, metadata, and the cloned table.

The file must not include:

script tags.

external stylesheets.

remote fonts.

remote images.

event handler attributes such as onclick.

app state JSON.

interactive inputs/buttons/selects.

full hidden dataset.

## DOM clone and cleanup

Find the rendered table element from the existing table UI.

Clone it.

Clean the clone before serialization.

Keep:

table, thead, tbody, tr, th, td, caption if present.

Header text.

Cell text.

Health labels.

Type/null/missing/empty classes.

Highlight classes.

Safe table classes already used in the app.

Useful scope/aria attributes if they remain meaningful in static HTML.

Remove:

buttons.

inputs.

selects.

textareas.

resize handles.

sort buttons as interactive controls.

copy buttons.

row detail buttons.

menus.

data attributes containing app state.

duplicate ids.

event handler attributes.

script/style nodes inside the cloned table if any.

If a header uses a button for sorting, replace the button with its text content in the th. If the sort indicator is useful and visible, keep it as plain text.

If a cell contains a copy button or action button, remove the button and preserve only the cell display text.

The export should not mutate the live app table.

## CSS reuse rule

Before writing export CSS, inspect the current table CSS and class names.

Reuse current class names and visual intent wherever possible. Use the same names for rows, cells, health badges, missing/null/empty states, highlights, density if applicable, and table shell classes if they already exist.

Do not invent a parallel naming system unless no usable class exists.

The exported file should include a curated static CSS block. Do not copy the entire app stylesheet blindly if it includes layout/app-shell rules that are irrelevant. Instead, copy or mirror the table-specific rules needed for the static export.

The CSS should cover:

Base document font and background.

Export wrapper.

Metadata block.

Table borders and header styling.

Cell padding.

Long text wrapping.

Number alignment.

Boolean styling if current app has it.

Health badge styling.

Failure/warning/ok/unknown row styling.

Null/missing/empty styling.

Highlight tones.

Any current table classes required for the cloned DOM to look correct.

Prefer the current app CSS values and class names. If current styles are too coupled to the app shell, extract the minimal equivalent for export.

## Metadata section

Add a compact metadata section above the table.

Include:

Exported from JSON Table Inspector.

Generated timestamp.

Visible/rendered row count.

Visible column count.

Filter state as general status, for example “Filter: failures” if available.

Sort state, for example “Sort: durationMs desc” if available.

Render cap note if active.

Do not include raw search query text by default. Use “Search: active” or “Search: none” so private search text is not written into the file unless the codebase already intentionally exposes it.

## File name and download

Use filename:

json-table-inspector-export-YYYYMMDD-HHMMSS.html

Use MIME type:

text/html;charset=utf-8

Download flow should match existing CSV download:

create Blob.

create object URL.

create temporary anchor.

click anchor.

revoke object URL.

show visible success or error status.

Do not silently fail.

## UI integration

Add button label:

Download HTML

Place it next to existing export actions, likely near Copy CSV, Copy TSV, and Download CSV.

Status success example:

Downloaded HTML: 13 rows × 39 columns.

Status error example:

Could not download HTML. No table is available to export.

If there are no matching rows, either download a file with headers and an empty note, or block with a clear message. Use best judgment based on existing export behavior.

## Logging

Add safe logs.

Use existing logger style and prefixes.

Expected events:

[JTI:Export] HTML serialize attempt with row count, column count, renderedOnly flag.

[JTI:Export] HTML serialize succeeded with row count, column count, char count.

[JTI:Export] HTML download attempt with filename and char count.

[JTI:Export] HTML download succeeded with filename and char count.

[JTI:Export] HTML download failed with error code/message.

Do not log HTML text.

Do not log cell values.

Do not log row JSON.

Do not log search query text.

## Security

Even though the table should already be rendered safely, treat export as untrusted-data handling.

No scripts.

No event handlers.

No raw user HTML injection.

No arbitrary CSS from user data.

No remote resources.

No full dataset hidden in comments or data attributes.

If keeping inline styles for custom highlights, only keep validated safe values already accepted by the highlight system, such as #RRGGBB. If uncertain, strip inline styles and keep standard classes only.

If generating any HTML string directly, escape text correctly. Prefer cloning DOM and using sanitized outerHTML after cleanup.

## Tests

Add tests where feasible.

Test document builder:

It returns a string starting with <!doctype html>.

It includes html, head, style, body, and table.

It includes metadata.

It includes no script tag.

It includes CSS once.

It escapes metadata text.

Test sanitizer if DOM tests are available:

Removes button/input/select/textarea.

Removes event handler attributes.

Removes ids.

Removes data attributes that contain app state.

Preserves table, thead, tbody, tr, th, td.

Preserves text content.

Preserves safe table classes.

Does not mutate original table node.

If the test environment does not support DOM well, test pure helper functions and manually verify in browser.

## Manual checklist

Render a table.

Filter to failures.

Sort a column.

Hide a column.

Add a highlight rule.

Click Download HTML.

Open downloaded file in browser.

Confirm only the static table appears, not the app UI controls.

Confirm visible columns match the app.

Confirm visible row order matches the app.

Confirm health badges and highlights are visible enough.

Confirm missing/null/empty values still look distinct.

Confirm file works offline.

View source and confirm there is no script tag.

Confirm no interactive controls remain.

Confirm render-cap metadata appears when applicable.

## Done criteria

Download HTML button exists.

Export uses current rendered table DOM or equivalent current table view if cloning is unsafe.

Exported file is standalone valid HTML.

No JavaScript included.

No interactive controls included.

Current table class names and visual rules are reused where possible.

Static CSS block included.

Metadata included.

Download success/error visible.

Logs added without raw data.

Tests added for document building and sanitizer where feasible.

Manual downloaded-file verification completed.
