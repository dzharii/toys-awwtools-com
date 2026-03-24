# Nintendo Switch Skill Board

Static editorial board for Nintendo Switch games that have plausible value beyond pure distraction. The site groups games by skill angle, assigns a conservative evidence grade, and uses local artwork files for a more legible board.

## Files

- `catalog-data.mjs`: canonical editorial source for site copy, categories, evidence labels, and game records
- `catalog-generated.json`: resolved catalog with official URLs, downloaded artwork metadata, and generated local image paths
- `scripts/fetch-catalog-assets.mjs`: pulls official page metadata and normalizes local images into `images/games/`
- `scripts/build-site.mjs`: turns `catalog-generated.json` into the published `index.html`
- `index.html`: generated static page
- `style.css`: tactile board styling and responsive layout
- `app.js`: progressive enhancement for search, filters, bookmarks, and note expansion
- `implementation-notes.md`: maintenance notes for the content model, evidence rules, and image workflow

## Content model

Each game entry carries:

- a stable `id`
- category and evidence keys
- title, release year, summary, and skill angle
- searchable tags
- several detail paragraphs
- an official product URL
- an official image source URL or an explicit override when the page metadata is weak

The final page is intentionally generated rather than handwritten so the site can keep a readable editorial source while still producing a clean static artifact.

## Behavior

- Without JavaScript, the full board remains readable as a static reference.
- With JavaScript, the page adds multi-select category filters, evidence filters, bookmark scope with a ten-game limit, full-text search, hide-non-matching mode, and per-note or bulk detail expansion.
- Favorites and filter scope persist in local storage. Search text and expanded state do not.

## Updating

1. Edit `catalog-data.mjs`.
2. Run `node ./scripts/fetch-catalog-assets.mjs` to refresh metadata and local artwork.
3. Run `node ./scripts/build-site.mjs` to regenerate `index.html`.
4. Review `implementation-notes.md` if the evidence rubric or image process changes.
