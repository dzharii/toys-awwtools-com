# JSON Table Inspector

JSON Table Inspector is a local-first browser tool for turning JSON or JSONL output into a readable table. It is designed for common debugging workflows where batch jobs, API responses, logs, or test outputs are easier to inspect as rows and columns than nested objects.

Paste data into the app, let it detect the most likely row source, flatten nested fields into columns, review likely failures, filter/sort/search, inspect full row JSON, and export the current visible view as CSV or TSV.

The app runs locally in the browser. It does not upload pasted JSON for processing.

## Why Use It

This tool helps when JSON is structurally valid but difficult to scan quickly:

- find likely failed rows (`success=false`, `status=failed`, error fields)
- inspect mixed-schema records where fields are sparse or inconsistent
- preserve original row JSON while using a flattened table view
- export the currently visible table view for spreadsheets or follow-up analysis

## Quick Start

1. Run `bun run dev` and open the shown URL.
2. Paste JSON or JSONL into the input pane (or load a built-in example).
3. Review the detected row source (`results[]`, `items[]`, `JSONL records`, etc.).
4. Use table search/filter/sort/highlights to inspect suspicious rows.
5. Open row details to view full original JSON.
6. Copy or download CSV/TSV for the current visible table.

## Development

```bash
bun run dev
bun test
bun run build
bun run check
```

## Supported Input Shapes

- root array of objects
- root object with nested record arrays (`results[]`, `items[]`, `records[]`, etc.)
- JSONL (one JSON value per non-empty line)
- mixed schema rows with missing/null/empty fields

## Feature Overview

- strict JSON and JSONL parsing with persistent actionable errors (line/column/snippet/hint)
- row-source detection with confidence and override selector
- flattening into dot/bracket path columns with missing/null/empty distinctions
- column profiling and failure-first default ordering
- row health heuristics (`failure`, `warning`, `ok`, `unknown`) with reasons
- sticky-header table with search, quick filters, sorting, density, and wrapping
- highlight rules (`equals`, `contains`, `gt`, `lt`, `exists`, `missing`)
- column visibility controls and default reset
- row details panel with copy actions
- CSV/TSV export for visible rows + visible columns (Health included by default)
- built-in examples and large-input performance warnings/timings/render limits

## Export Behavior

Export uses the current table view:

- current search and quick filter
- current sort order
- current visible columns

CSV includes a header row and includes `Health` by default. Missing and `null` export as empty fields. Arrays and objects export as compact JSON strings. CSV values are escaped for commas/quotes/newlines and formula-like text values are prefixed with `'` to reduce spreadsheet formula-injection risk.

## Privacy And Local-First Behavior

- no remote processing service is used for pasted JSON
- no network fetch is performed from pasted content
- data stays in-page unless you explicitly copy or download
- localStorage is used for UI preferences and optional recent input persistence

## Limits

- strict JSON only (no JSON5/comment/trailing-comma support)
- arrays are summarized in cells by default (no row explosion mode)
- large inputs may be sampled or render-limited for responsiveness
- health detection is heuristic and should be treated as guidance, not truth
- CSV export is a view export, not a full raw data dump of all hidden columns

## Troubleshooting

- **Invalid JSON:** use the shown line/column/snippet/hint to fix commas, quotes, or brackets.
- **Wrong row source selected:** choose another candidate in Mapping / Options.
- **Missing column in table/export:** show it in column controls before exporting.
- **Slow large input:** narrow with search/filter and hide columns to reduce visible cells.

## Project Structure

```text
src/app/       app lifecycle, state, logger
src/core/      pure parser/detection/flatten/health/table/export logic
src/ui/        rendering and UI interaction helpers
src/examples/  built-in datasets
src/styles/    app CSS
src/vendor/    vendored RetroOS UI framework
test/          Bun tests
docs/          manual QA and release hardening docs
```

## Brand assets

The app uses `public/favicon-256.png` as the source favicon image and `public/social/logo-social.png` as the social preview image. Favicon derivative files are generated once with ImageMagick and then committed as static assets. The Bun build copies these files into `dist/`; it does not regenerate artwork or favicon sizes during normal builds.
