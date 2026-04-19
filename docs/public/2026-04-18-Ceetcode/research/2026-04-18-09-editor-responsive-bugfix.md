# Editor + Responsive UI Bugfix Record (2026-04-18)

## Scope

Implemented the usability and presentation fixes requested in `suggestions008.md`:

- syntax highlighting quality for C editor
- four-space indentation consistency on Enter/indent actions
- explicit formatting action
- test-result input visibility improvements
- responsive view-switch clarity improvements
- unhandled-error panel sticky behavior check/fix

## Decisions

1. Syntax highlighting and editor palette
- Added explicit CodeMirror highlight extension using `HighlightStyle` and `syntaxHighlighting`.
- Added a custom light editor theme aligned with existing beige/green UI, avoiding an abrupt dark editor look.

2. Indentation consistency
- Added `EditorState.tabSize.of(4)` and `indentUnit.of("    ")`.
- Kept language-aware indentation through `cpp()` and `indentOnInput()`.

3. Formatting support
- Added `Format` button in top controls.
- Added keyboard shortcut `Shift+Alt+F`.
- Implemented formatting through CodeMirror `indentRange` over the full document.
- Chosen because it is browser-native, stable, and low-risk in current architecture.

4. Test-results detail quality
- Test result cards now include an explicit `Show Input` / `Hide Input` details section with pretty JSON input payload.
- Keeps default card compact while making reproduction context available inline.

5. Responsive clarity
- Renamed mobile pane switch labels from `Problem/Code` to `Statement/Editor`.
- Added a visible `View` segmented control treatment to clearly separate pane navigation from challenge selection.
- Renamed dropdown label from `Problem` to `Challenge` to reduce ambiguity.

6. Unhandled error bar behavior
- Removed sticky positioning from the unhandled-errors panel so it participates in normal page flow.

## Validation

- Typecheck passed: `npx tsc --noEmit`
- Acceptance passed: `npm run test:acceptance` (`14/14`)
- Added/updated acceptance coverage for format action and enhanced result-details behavior.
