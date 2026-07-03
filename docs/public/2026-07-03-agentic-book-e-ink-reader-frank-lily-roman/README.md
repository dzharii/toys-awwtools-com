# E Ink Reader

A calm, local-first reading surface for your own `.txt`, `.md`, and `.markdown`
files. It renders plain text and (safe) Markdown as an E Ink-style page, with a
page-turn mode, a scroll mode, local fonts, and a realistic screen-refresh
effect.

Everything runs locally in the browser. There is **no build step, no server, no
account, and no network access at runtime**. Open `index.html` and read.

## Quick start

Open `index.html` directly in a modern browser, or serve the folder statically:

```bash
node scripts/serve-static.mjs 8123
# then visit http://localhost:8123/
```

Then open a file with the **Open** button or by dragging a `.txt`, `.md`, or
`.markdown` file onto the window.

## What it does

- **Local files only.** Open a single text or Markdown file via file picker or
  drag-and-drop. Nothing is uploaded.
- **Two reading modes.** A paginated *page mode* with page turns, and a
  continuous *scroll mode*. Your position is preserved when you switch.
- **E Ink simulation.** Page turns and major changes use a brief grayscale wash
  and ghosting reminiscent of electronic paper. Respects `prefers-reduced-motion`.
- **Reading-first typography.** Local Literata by default, plus other bundled
  serif and legible fonts; adjustable size, line height, measure (line width),
  paragraph spacing, and alignment.
- **Safe Markdown.** Raw HTML is never executed or rendered as trusted markup,
  images are shown as non-fetching placeholders, and links never prefetch.
- **Themes.** Warm paper, cool paper, dark, and high-contrast, with a soft/normal
  contrast toggle.
- **Private by design.** Book content lives in memory only and is never stored.
  Only your preferences are saved (in `localStorage`). Reopen your file each
  session.
- **Accessible + responsive.** Keyboard navigation, focus management, live
  region progress, and tested desktop / tablet / mobile layouts.

## Privacy and storage

- Book/document content is **never** persisted — not to `localStorage`, not to
  disk, not to any server.
- Only reading **preferences** are saved, under the single key
  `eink-reader:preferences`. They are validated and clamped on load.
- Because content is not stored, you reopen your file each session by design.

## Offline / static guarantees

- No runtime network requests. The page ships a strict Content-Security-Policy
  with `connect-src 'none'`.
- All dependencies and fonts are **vendored locally** and unminified/readable
  (see `vendor/` and `assets/fonts/`). Nothing loads from a CDN at runtime.
- Runtime dependencies: [markdown-it](https://github.com/markdown-it/markdown-it)
  (Markdown parsing, HTML disabled) and
  [DOMPurify](https://github.com/cure53/DOMPurify) (sanitization).

## Keyboard shortcuts

| Key | Action |
| --- | ------ |
| `→` / `PageDown` / `Space` | Next page |
| `←` / `PageUp` | Previous page |
| `Home` / `End` | First / last page |
| `o` | Open a file |
| `s` | Open settings |
| `Esc` | Close settings |

(In scroll mode, the page keys scroll by a screenful.)

## Project layout

```
index.html            Entry point (loads vendored deps, then app modules)
css/                  reset, base (tokens/themes), reader, eink, settings, responsive
js/                   app + focused modules (parser, renderer, paginator, eink, etc.)
assets/fonts/         Vendored WOFF2 fonts + OFL licenses + @font-face declarations
assets/textures/      Paper-grain SVG
vendor/               markdown-it and DOMPurify (unminified) + LICENSE files
scripts/              serve-static, vendor-manifest.json, vendor-check, vendor-fetch
tests/                fixtures + Playwright specs + a dependency-tolerant smoke runner
specs/                Design note + persona scenarios + generated acceptance todos
```

## Development scripts

These are optional developer tools. They are **not** required to run the app.

```bash
# Serve the folder statically (dependency-free)
node scripts/serve-static.mjs 8123

# Verify every vendored dependency/font matches the manifest (size + sha256)
node scripts/vendor-check.mjs

# Download any missing vendored file from its documented upstream (skips existing)
node scripts/vendor-fetch.mjs
```

## Testing

Automated behavior tests live in `tests/`:

- `tests/playwright/reader.spec.js` — the canonical suite written for the
  standard Playwright test runner. Run with:

  ```bash
  npm i -D @playwright/test
  npx playwright test
  ```

- `tests/smoke.mjs` — a dependency-tolerant runner that uses whichever
  `playwright` library is resolvable, so the acceptance-critical behaviors can be
  verified even where the `@playwright/test` runner package is not installed:

  ```bash
  node scripts/serve-static.mjs 8123      # in one terminal
  node tests/smoke.mjs                      # in another
  ```

Both cover: local file loading, TXT/Markdown rendering, stable pagination,
page/scroll navigation, Markdown safety (no script execution, no image fetch),
code-block containment, empty/unsupported-file recovery, preference persistence
**without** book-content persistence, reduced motion, and the no-network runtime.

Some qualities — whether the E Ink effect feels credible and the reading surface
is comfortable — require manual visual inspection on desktop and mobile.

## Licenses

See [LICENSES.md](LICENSES.md) for the license of every vendored dependency and
font. All bundled fonts are under the SIL Open Font License 1.1.
