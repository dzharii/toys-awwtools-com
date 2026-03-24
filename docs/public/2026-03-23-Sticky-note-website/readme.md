# Seattle Sticky Note Board

Build-free HTML, CSS, and JavaScript reference board for Seattle links and operational shortcuts.

## Files

- `index.html`: authored content source, category sections, and note articles
- `style.css`: tactile board styling, responsive layout, deterministic note variants
- `app.js`: progressive enhancement for category filters, favorites, search, and detail expansion
- `icons/`: SVG favicon source plus generated PNG and ICO assets
- `site.webmanifest`: manifest metadata for installed-icon support

## Current content

The board uses a representative subset of `content.md` to demonstrate the intended system:

- critical safety
- mobility
- health and crisis
- civic support
- weather and hazards

## Authoring contract

Add notes directly in `index.html`.

Each note should keep:

- a unique `data-guid`
- a normalized `data-category`
- optional normalized `data-tags`
- a `.note-title`
- a `.note-body`
- a `.note-links` region
- an optional `.note-details` region

The JavaScript reads the DOM and derives:

- category filter options
- active-filter chips
- search indexing
- favorites state
- search results links

## Behavior

- Without JavaScript, the board still renders as readable static content.
- With JavaScript, the page adds multi-select category filtering, saved notes with a ten-note limit, full-text search, strict hide-non-matching mode, and per-note or global detail expansion.
- Favorites and active filter scope persist in local storage. Search text and expansion state do not.
