# Manual QA Checklist

## Startup and Build

- [ ] `bun run build` succeeds.
- [ ] `dist/index.html` exists and loads in a browser.
- [ ] App starts without console errors.

## Input and Parse

- [ ] Empty input shows `Empty` status and no parse error.
- [ ] Valid JSON parses and updates parse status.
- [ ] Valid JSONL parses and shows record count.
- [ ] Invalid JSON shows persistent error with line/column/snippet/hint.
- [ ] Parse error stays visible until fixed or input cleared.
- [ ] Format works for valid JSON and does not corrupt JSONL.
- [ ] Copy Input works or shows visible failure message.

## Row Source Detection

- [ ] Root array selects `root[]`.
- [ ] Object with `results[]` selects `results[]`.
- [ ] JSONL selects `JSONL records`.
- [ ] Manual row source selection updates downstream pipeline.

## Flattening and Columns

- [ ] Nested keys flatten into dot/bracket paths.
- [ ] Missing vs null vs empty string/array/object remain distinguishable.
- [ ] Error-like sparse columns stay visible by default.
- [ ] Column ordering presets update visible order.

## Health and Diagnostics

- [ ] `success=false` rows are flagged as failure.
- [ ] `status=warning` rows are flagged as warning.
- [ ] No-signal rows become unknown.
- [ ] Health summary counts match table rows.
- [ ] Diagnostics list parse/source/flatten/health notes.

## Table Interactions

- [ ] Sticky header remains visible during scroll.
- [ ] Search filters visible rows case-insensitively.
- [ ] Quick filters (`all/issues/failures/warnings/ok/unknown`) work.
- [ ] Sort toggles through asc/desc/none.
- [ ] Density and Wrap controls affect table display.

## Highlight Rules

- [ ] Add highlight rule and matching cells are styled.
- [ ] Disable and delete highlight rules work.
- [ ] Invalid/missing-column behavior does not crash.

## Column Controls and Row Details

- [ ] Column picker shows visible/hidden counts.
- [ ] Show all / hide all / reset defaults work.
- [ ] Row selection opens row details.
- [ ] Copy Original JSON and Copy Visible Row JSON work.

## Export

- [ ] Copy CSV works.
- [ ] Copy TSV works.
- [ ] Download CSV works.
- [ ] CSV includes header row.
- [ ] CSV respects current visible rows/filter/sort/visible columns.
- [ ] CSV handles commas/quotes/newlines correctly.
- [ ] Formula-like strings are protected in CSV output.
- [ ] Null/missing export as empty fields.

## Examples and Performance

- [ ] Example buttons load datasets successfully.
- [ ] Example replacement confirmation appears when input is non-empty.
- [ ] Performance timings appear.
- [ ] Large row/column inputs show render/performance warnings.
- [ ] Render cap message appears when rows are limited.

## Accessibility and Security

- [ ] Inputs/buttons/selects have visible labels.
- [ ] Health badges include text.
- [ ] Table has aria label and sort headers use `aria-sort`.
- [ ] No pasted JSON is injected via `innerHTML`.
- [ ] Console logs avoid raw row/cell/user-input dumps.

