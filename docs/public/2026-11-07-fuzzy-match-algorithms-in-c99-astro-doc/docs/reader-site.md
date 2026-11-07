# Starlight layout, file articles and global controls

Astro Starlight supplies the published site's routing, search, themes and mobile menu. `astro.config.mjs` selects the pages and overrides only the components needed for these layout changes.

## Source width and line wrapping

Source articles use the available main column with 16-32 pixel side gutters. Code always wraps, including long identifiers and comments. Paragraphs have a 76-character maximum line length, so widening code does not create excessively long prose lines. There is no Reading settings panel or wrapping toggle.

## Text size beside search

The header exposes 18, 20 and 22 pixel body sizes. Code size changes with the selection. Body text uses locally served Atkinson Hyperlegible; code uses JetBrains Mono. Light, dark and system themes remain Starlight controls.

## Resizing and hiding desktop navigation

The navigation's sticky Hide button collapses it to a narrow rail containing Show. Drag its right edge to resize. Keyboard users can focus the separator and use Left/Right, Shift for larger changes, or Home to restore 272 pixels. Width is bounded to 200-420 pixels and at most 42% of a desktop viewport. The mobile layout uses Starlight's menu popover instead of desktop collapse or resizing.

Text size, desktop collapse and width stay in browser storage. They are not sent to a service. Retired wrap/focus settings from the previous release are ignored.

## File articles and exact source blocks

`web/file-notes/` contains an authored article for each displayed file. Each section names a mechanism, explains its data and gives an example or relevant limit. Literal source anchors place the prose before the corresponding block. Missing notes, obsolete anchors or unordered blocks fail preparation.

The displayed blocks partition each file without omissions or repeated lines. Raw downloads contain the complete source. The post-build checker reconstructs every line and compares it with the actual file. The two diagrams are exact SVGs for matrix dependencies and resolver decisions; their source is in `public/diagrams/`.

## Documentation build and verification commands

```sh
npm ci
npm run build
npm run check:docs
make docs-offline
python3 scripts/check_docs.py
```

Python 3.9+ prepares pages; the Node version must satisfy `package.json`. The C experiment still builds with GCC and Make alone. Open `dist/offline/index.html` directly for the standalone source reference, or serve `dist` over HTTP for the full Starlight site.

## Optional browser layout checks

Install the test browser with `npx playwright install chromium`, then run `npm run test:layout -- https://YOUR-SITE/`. The check exercises desktop, portrait and landscape layouts, navigation resizing, text-size persistence, mobile navigation and search. `PM_CHROMIUM_PATH` and JSON `PM_CHROMIUM_ARGS` select an existing test-host binary when required. Screenshots are generated QA files; the JSON report is retained as evidence.

Build and development commands explicitly set `ASTRO_TELEMETRY_DISABLED=1`, so Astro telemetry is disabled.

## Dependencies, licenses and prose references

The configuration uses [Starlight](https://starlight.astro.build/), [Atkinson Hyperlegible](https://www.brailleinstitute.org/freefont/) and [Fontsource](https://fontsource.org/). Font licenses are in `public/licenses/`. The prose review follows [Cursor pstack unslop](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md). The original and current heading inventories remain under `reports/`.

## Measured results beside the implementation

`make feedback` regenerates dated source comments and article observations from the report's result files. Recovery and unsafe assignments explain the observed matching tradeoff; rounded lookup time explains computational cost. Actual input strings show where the policy accepted or rejected a name. Worked algorithm calculations stay separate from these measurements.

Source pages retain line anchors for navigation and remove total line counts. Verification pages state what was checked; detailed audit counters remain in the raw evidence.
