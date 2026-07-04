# Reading Navigator

A local-first bookmarklet that helps you keep your place in long web pages. It
tracks approximate reading progress based on how long content lingers in your
active reading area, shows heading context, and offers a generic **Jump to last
reading position** action.

Open [`index.html`](./index.html) to install the bookmarklet.

## What it does

- Scans the readable part of a page and builds a heading outline with
  click-to-jump navigation.
- Tracks approximate reading progress from focused dwell time, not raw scroll
  position, so a layout shift or reload does not lose your place.
- Classifies content as unseen, seen, skimmed, probably read, active, last
  focus, or a manual mark, and shows it on a minimap.
- Restores your last meaningful reading position with a brief, non-blocking
  highlight.
- Runs inside a Shadow DOM panel with expanded and compact modes.

## Local-first and private

Everything stays in your browser. Progress is saved in `localStorage` for the
current page only. The app never stores full page text, HTML, or screenshots,
and never sends reading data to any server. You can clear the saved progress for
a page at any time, and a session-only mode is used when storage is unavailable.

## Install

Open `index.html` and drag one of the generated links to your bookmarks bar:

- **Hosted loader** (recommended): a small bookmarklet that loads the bundle
  from this site.
- **Inline / offline** (advanced): the whole app inside the bookmarklet, so it
  works without loading anything from this site.

Then open a long article or documentation page and click the bookmarklet.

## Development

Built with plain modular JavaScript and bundled with [Bun](https://bun.sh). No
frameworks and no runtime dependencies.

```sh
bun run build      # bundle src/ into dist/ and generate the bookmarklets
bun run clean      # remove dist/ and rebuild
```

Build outputs (unminified, readable):

- `dist/reading-navigator.bundle.js` – the hosted bundle that exposes
  `window.readingNavigatorBookmarklet`.
- `dist/reading-navigator.loader-bookmarklet.txt` – hosted loader bookmarklet.
- `dist/reading-navigator.inline-bookmarklet.txt` – self-contained inline
  bookmarklet.
- `dist/reading-navigator.bookmarklets.js` – generated strings used by the
  install page.

Use `demo/demo-article.html` for local testing. Exploratory Playwright checks
live under `temp/` and are not part of the committed project.

## Project layout

- `src/` – modular source (identity, content, geometry, tracking, restore,
  storage, ui, overlays, scheduler, utils, app).
- `scripts/build.js` – Bun build pipeline.
- `demo/` – demo article for testing.
- `assets/` – icons and social preview image.
- `index.html` + `scripts/install.js` – install page.
