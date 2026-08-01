# Verification Results

## Automated domain checks

Command:

```text
node tests/domain-tests.mjs
```

Result: 9 passed, 0 failed. Coverage includes mandatory U01-U06 geometry, traversal order, mixed incomplete-cell policies, and naming validation.

## Integrated Chrome checks

Command:

```text
node tests/e2e-runner.cjs
```

Result: passed. The runner verified application startup, accessible names, invalid geometry recovery, preset CRUD, malformed JSON recovery, fresh-page URL reconstruction, exact Grid Creator PNG dimensions, image load and failed replacement, pointer/keyboard selection, exact selected-cell PNG dimensions, ZIP download, responsive layouts, and controlled/error-free console behavior.

## In-app Chromium checks

The currently installed in-app browser runtime was connected directly after resolving the stale advertised-version pointer. The pass verified:

- successful application startup and accessible Grid Creator controls;
- a 1280 x 800 viewport with no horizontal document overflow;
- native file-chooser loading of `tests/fixtures/atlas-100x100.png`;
- a calculated 3 x 3 layout with nine enabled sprite exports;
- selection of sprite 5 at row 1, column 1, pixel origin 33, 33, with cell download enabled; and
- zero browser console warnings or errors during the exercised workflow.

## Export inspection

`evidence/exports/atlas-slices.zip` inspection:

- ZIP entries: 83 total (directory entry + 81 PNG files + `manifest.json`)
- Sprite PNG entries: 81
- Manifest sprite records: 81
- First rectangle: row 0, column 0, x 0, y 0, 10 x 10
- Last rectangle: row 8, column 8, x 88, y 88, 10 x 10

ImageMagick absolute-error comparison between `selected-cell.png` and an independent `10x10+11+0` source crop returned `0` with exit code `0`.

## Responsive visual evidence

- `grid-default-1600x900.png`
- `atlas-loaded-1600x900.png`
- `atlas-wide-1920x1080.png`
- `atlas-responsive-1440x900.png`
- `atlas-responsive-1280x800.png`

The screenshots were visually inspected after correcting the loaded-image empty-state overlay, small-sprite scaling, and 1280-pixel panel clipping.

## Parent index and RSS validation

Results:

```text
missing 0
bad data-index-href 0
rss item count 132 project item count 132
rss link present true
rss xml ok
```

## Social and icon assets

- `assets/social/atlas-slicer-social-1200x630.png`: 1200 x 630 PNG
- `assets/icons/favicon-32.png`: 32 x 32 PNG
- `assets/icons/apple-touch-icon.png`: 180 x 180 PNG

The social background was generated with the built-in image-generation tool using this final prompt:

```text
Use case: ads-marketing
Asset type: Open Graph social preview background for a professional browser graphics utility
Primary request: a polished landscape illustration representing a sprite atlas being precisely sliced into reusable cells
Scene/backdrop: deep navy technical workspace with a luminous rectangular pixel-art atlas grid, clean cyan separator lines, one selected amber cell, and several small extracted sprite tiles arranged nearby
Subject: crisp geometric grid slicing workflow, exact rectangles, subtle coordinate ticks, abstract colorful pixel sprites with no recognizable brands or characters
Style/medium: premium 2D/3D hybrid product illustration, pixel-art details with modern technical UI polish
Composition/framing: wide 1.91:1 landscape composition, strong focal grid on the right half, calm negative space on the left for later title typography, generous safe margins
Lighting/mood: precise, focused, quietly energetic; restrained glow
Color palette: dark navy, slate, electric blue, cyan, with small amber and coral accents
Constraints: no text, no letters, no numbers, no logos, no watermark, no mockup device frame; keep grid lines crisp and rectangular; suitable for cropping to 1200 x 630
```

Exact project typography and the deterministic SVG mark were added locally after generation.
