# Huge Page Object Recorder Bookmarklet

This project is a JavaScript-only bookmarklet-style tool for turning a live page into structured page-object metadata.

## What it does

- injects an overlay into the current page
- scans visible DOM candidates
- supports hover selection and drag-area selection
- infers controls, regions, collections, and content
- generates selector candidates with changeable heuristics
- exports structured JSON for later automation code generation

## Main files

- `src/entry.js`: bookmarklet bootstrap and singleton lifecycle
- `src/overlay.js`: injected UI, hover/area selection, export flow
- `src/heuristics.js`: object inference and naming
- `src/selectors.js`: selector heuristics, scoring, validation
- `examples/chat.html`: manual chat-like fixture
- `dist/bookmarklet.js`: readable bundled artifact

## Scripts

```bash
bun run build
bun test
bun test --coverage
```

## Manual check

1. Open `examples/chat.html`.
2. Paste `dist/bookmarklet.js` into the browser console or use the generated bookmarklet URL.
3. Inspect the sidebar, transcript, and composer.
4. Change selector heuristics on a selected object and rerun selector testing.
5. Export JSON and verify parent-child hierarchy and selector metadata.
