# AGENTS.md

Guide for future sessions in `docs/public/2026-04-11-Huge-Page-Object-Recorder-bookmarklet`.

## Scope
This file is local to this project folder.

Use it to quickly recover context about:
- what this tool does,
- where core logic lives,
- how specs are organized,
- how tests are structured,
- which regressions were already fixed and should stay protected.

## Project mission
Bookmarklet-style page-object recorder for automation discovery.

Core outcomes:
- scan and infer meaningful page objects (`region`, `control`, `collection`, `content`),
- generate and rank selectors with explainable heuristics,
- support inspect and area selection flows,
- export stable JSON.

## First places to read
1. `readme.md` for user-level intent and manual flow.
2. `src/overlay.js` for runtime behavior and UI state transitions.
3. `src/features.js`, `src/scanner.js`, `src/heuristics.js`, `src/selectors.js`, `src/regions.js` for core logic.
4. `suggestions{XXX}.md` sections `W00..Z00` for latest implementation/reconciliation notes.
5. `test/dom/fixtures/matrix-fixtures.js` and `test/dom/*.matrix.test.js` for the matrix test architecture.

## Specs and precedence
Specs are incremental: `suggestions001.md`, `...`, `suggestions010.md`, `suggestions011.md`.

Working rule:
- newer suggestions can refine or override older ones,
- keep backward-compatible intent where there is no direct conflict,
- when conflicts exist, prefer newer practical behavior and document substitutions.

High-signal spec files:
- `suggestions010.md`: data-driven runner architecture and matrix coverage strategy.
- `suggestions009.md`: Bun + Happy DOM setup baseline.
- `suggestions008.md`: important UI regressions (area drag visibility, heuristic dropdown overlap).
Important note. Those suggestions are specifications and they are structured and in an incremental manner, 
which means probably the most recent specification has the higher number, a higher incremented number, 
which also means that all the previous suggestions may have been implemented already, 
so you don't need to re-read those as a priority, you don't need to re-read those suggestions. 
But in some cases, sometimes, we need to return back to those archival suggestions in rare cases, 
and this is why I'm keeping all this history. So my advice is to focus on the most recent suggestions 
if you need to re-read those files. And those most recent suggestions have a higher incremental number in the file name


## Build and test commands
From this folder:

```bash
bun run build
bun test
bun test --coverage --coverage-reporter=text --coverage-reporter=lcov
```

Manual sanity check:
1. open `examples/chat.html`,
2. load `dist/bookmarklet.js` in browser console,
3. verify inspect mode, area mode, selector test, heuristic switch, export/copy.

## Test environment and structure
- Bun DOM preload: `bunfig.toml` -> `test/setup/happydom.js`.
- Happy DOM globals and cleanup are centralized in preload.
- Deterministic fixtures and mutations are centralized in `test/dom/fixtures/matrix-fixtures.js`.
- Matrix suites:
  - `test/dom/features.matrix.test.js`
  - `test/dom/scanner.matrix.test.js`
  - `test/dom/heuristics.matrix.test.js`
  - `test/dom/selectors.matrix.test.js`
  - `test/dom/regions.matrix.test.js`
  - `test/dom/overlay.matrix.test.js`

Design rule for tests:
- prefer behavior-level assertions,
- avoid pixel/rendering assertions,
- avoid brittle full-string snapshots when substring/predicate checks are enough,
- keep rows readable with `id + title + description + fixture + mutate + act + expect`.

## Critical implementation knowledge
1. Selector dedupe must preserve manual mode preference.
- In `src/selectors.js`, dedupe key includes `heuristicId`.
- Reason: manual selector text can match an auto candidate; manual must still remain selectable.

2. Ancestor promotion must not erase nested landmark regions.
- In `src/features.js` (`getMeaningfulAncestor`), both current and parent landmark strength matter.
- Reason: nested dialog/footer-like regions should remain distinguishable in area analysis.

3. Real DOM attribute and style handling differs from fake objects.
- `src/features.js` supports real `NamedNodeMap` attributes and computed style fallback.
- Visibility logic treats empty opacity correctly (do not interpret empty string as zero).

4. Area selection regression to protect.
- Drag rectangle should be visible during drag and hidden on pointer up.
- Covered in overlay matrix runner (`OV06`).

5. Heuristic popover interaction regression to protect.
- Escape should close popover; selector controls should remain usable.
- Covered in overlay matrix runner (`OV07`).

## Safe change workflow
1. Update or add tests first when behavior changes are non-trivial.
2. Prefer extending matrix fixtures/mutations over creating one-off fixture files.
3. Run targeted suites during iteration, then full `bun test`.
4. Keep `dist/` artifacts readable and buildable (`bun run build`) when source changes affect runtime.
5. Record any spec substitution or conflict resolution in the newest suggestion doc.

## Where future contributors usually get stuck
- Assuming scan automatically selects objects (it refreshes candidate inventory; selection is explicit).
- Writing flaky overlay tests that depend on browser-grade hit-testing/layout.
- Accidentally breaking manual selector behavior while refactoring selector dedupe.
- Overfitting tests to exact confidence decimals or long prose explanations.

## Quick triage map
- Selector mismatch: `src/selectors.js` + `test/dom/selectors*.test.js`
- Wrong object kind/type: `src/heuristics.js` + `test/dom/heuristics*.test.js`
- Missing/extra scan candidates: `src/scanner.js` and visibility/disabled checks in `src/features.js`
- Area selection parent/collection issues: `src/regions.js` + `test/dom/regions*.test.js`
- UI mode/toolbar/export issues: `src/overlay.js` + `test/dom/overlay.matrix.test.js`

## AGENTS.md updates

Only when the significant change has been made in the project, you may suggest to the user to also update 
agents.md to preserve some information about this significant change and keep the information up to date. 
This is optional request to the user. Do not edit agents.md implicitly. Only when you get explicit approval, then do edits. 
You may revisit agents.md to make sure that the information there is still actual and corresponding to the current project features and structure.


