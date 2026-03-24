# Implementation Notes

## Purpose

This site repurposes the old note-board pattern into a curated Nintendo Switch reference board. The goal is not to rank the best games in general. The goal is to collect titles that are defensible as practice tools, creative tools, fitness prompts, coordination drills, or low-pressure restorative routines.

## Source of truth

`catalog-data.mjs` is the editorial source. It defines:

- global site copy
- evidence labels and summaries
- category structure
- per-game notes, tags, summaries, and detail paragraphs
- explicit URL or image overrides when automatic extraction is unreliable

`catalog-generated.json` is derived data. It should be regenerated, not edited by hand.

## Build flow

1. `node ./scripts/fetch-catalog-assets.mjs`
2. `node ./scripts/build-site.mjs`

The asset script resolves an official page for each game, extracts description and image metadata when possible, downloads the selected image, and writes normalized records into `catalog-generated.json`.

The site build script reads that generated catalog and emits the final `index.html`.

## Image workflow

Artwork is stored locally in `images/games/` so the board is stable and visually consistent.

Current rules:

- Prefer official Nintendo product pages when they exist and resolve cleanly.
- Use an official publisher or game site when Nintendo page matching is wrong, missing, or points at the wrong edition.
- Allow explicit `imageUrl` overrides for cases where `og:image` is weak, absent, or clearly worse than an official logo asset.
- Normalize every image with ImageMagick into a 960x540 WebP file with transparent-safe containment so wide logos do not get cropped.

Example cases where overrides were necessary:

- `Factorio` uses the official Factorio logo instead of unrelated store artwork.
- `Stardew Valley` uses an explicit logo image because the official site did not expose a useful social preview image.
- `Dr Kawashima's Brain Training` points at the Nintendo Australia page because the US store did not provide a clean equivalent.

## Evidence rules

The evidence labels are intentionally conservative:

- Evidence A: the game directly contains the target practice or a domain-specific toolset.
- Evidence B: the mechanic strongly supports the claimed skill, but the transfer claim still needs restraint.
- Evidence C: plausible usefulness, but indirect enough that the note should read as a suggestion, not a promise.

This matters because the board is editorial, not medical or educational certification. The copy should stay narrow and defensible.

## Front-end behavior

The page is static-first. `index.html` is fully readable without JavaScript.

`app.js` adds:

- search across titles, tags, summaries, angles, details, and years
- category and evidence filtering
- bookmark scope with local persistence
- bulk expand/collapse
- active filter chips and search result shortcuts

## Maintenance notes

- Keep product links official where possible.
- Keep attributions aligned with the actual downloaded image source.
- If automatic resolution starts drifting to the wrong regional or edition page, add an explicit override in `catalog-data.mjs`.
- If the visual direction changes again, regenerate the manifest icons so the installable metadata matches the page identity.
