# C99 Reference (Offline Single Page)

This project is a single-page, offline-first C99 standard library reference. It renders structured XML documentation into a fast, searchable HTML reference with copy-ready signatures and examples, designed for use while coding without context switching.

## What this is

- A static, self-contained HTML page that embeds all C99 reference data as XML blocks.
- A vanilla JavaScript renderer that parses the XML, builds a navigation index, and renders the entire reference in the DOM (no hidden sections).
- A readable, minimal UI with a sticky sidebar, fast search, and stable URL anchors for each function.

## Key features

- **Offline-first, single-page**: Open `index.html` directly from disk. No network requests and no build step.
- **Full DOM visibility**: All documentation is expanded in the page so browser Ctrl+F works across summaries, notes, and examples.
- **Sidebar navigation + search**: Incremental search filters the sidebar (not the main content) and supports Enter-to-jump.
- **Stable anchors**: Deterministic anchor ids for every category, header, and function.
- **Copy-friendly**: One-click copy for function signatures and example code blocks.
- **Parse error isolation**: Malformed XML blocks surface an in-page error banner without blocking other content.
- **Safe HTML handling**: Inline HTML is sanitized to a small allowed tag set.
- **Syntax highlighting**: Code blocks are highlighted using the locally bundled `microlight.js` (ASVD, microlight 0.0.7).

## Project layout

```
./
  index.html
  styles.css
  app.js
  data-to-process/   # Source XML files (read-only input)
  inspiration/       # Reference example used during implementation
  lib-asvd-microlight-0.0.7/
```

## How it works

- `index.html` embeds each XML file in `data-to-process/` as a separate `<script type="application/xml">` block.
- `app.js` parses each block, normalizes it into an internal model, builds a search index, and renders the full reference into the DOM.
- `styles.css` provides the minimal layout and styling for the sidebar, content cards, and notes.

## Getting started

Open `index.html` in any modern browser. The page loads fully offline.

## Scope and non-goals

This project intentionally avoids external libraries, build tooling, servers, or persistence features. It is a static reference viewer focused on speed, clarity, and portability.
