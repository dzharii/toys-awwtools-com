# Link Journal

Link Journal is a static URL shortener and visual archive designed for GitHub Pages. The repository is the database: each saved target becomes a small self-contained directory with redirect metadata and a recognizable JPEG clipping, while the root journal reads those records on demand.

There is no application server, runtime database, remote screenshot service, analytics service, or client framework.

## First-time setup

1. Install Node.js 22 or newer and run `npm install`.
2. Install the bundled Chromium browser with `npx playwright install chromium`.
3. Set `siteBase` in `link-journal.config.json` to the final public GitHub Pages directory. Keep the trailing slash or let the command normalize it.

Example:

```json
{
  "siteBase": "https://toys.awwtools.com/public/2026-08-16-link-shortener-and-journal/"
}
```

Configure this before creating records intended for publication, because it determines each record's `og:url` and `og:image`.

## Add a link

```powershell
npm run add-link -- https://example.com/article
```

The command validates the repository and dependencies, checks for an existing serialized target, renders the page in a clean Playwright Chromium context, selects a deterministic 1200×630 content region, writes a real JPEG at quality 90, generates crawler-readable redirect HTML, prepends the new ID to `links.txt`, and validates the committed result. Headless capture keeps the bundled browser's exact identity while removing its headless-only product token. If a response is positively identified as an access challenge, the command closes that attempt and retries once in a visible bundled-Chromium window. Exact-host capture adapters handle demonstrated exceptions without weakening generic capture; the included YouTube adapter uses the video's own highest usable thumbnail.

Successful generation is local only. The command never runs Git commands or deploys the site. Review the changed manifest and new `lnk/<id>/` directory, then commit and publish them through your normal workflow.

Enable detailed candidate, timing, path, and capture diagnostics with:

```powershell
$env:LINK_JOURNAL_DEBUG = '1'
npm run add-link -- https://example.com/article
```

## Repository format

```text
/
  index.html
  links.txt
  lnk/
    aB7kP2xQ/
      index.html
      preview.jpg
```

`links.txt` contains one eight-character ID per line, newest first. Each record directory contains exactly `index.html` and `preview.jpg`. The generated HTML exposes project metadata, Open Graph metadata, meta-refresh and JavaScript replacement redirects, plus a clickable fallback.

## Journal controls

- Mouse wheel or vertical trackpad gesture: browser-native scrolling.
- Ctrl/Cmd + wheel and browser shortcuts: browser-native zoom; the journal does not maintain a second zoom state.
- Primary-button drag: pan after a movement threshold without selecting text; only the click belonging to a confirmed drag is suppressed.
- Card click/tap: open the saved destination in a new tab.
- `Copy short URL` on a card: copy that entry's project-owned short URL without opening it.
- Right Arrow or PageDown: move toward older links.
- Left Arrow or PageUp: move toward newer links.
- Brass side controls: use the same previous/next page-turn operation and remain visibly disabled at boundaries.
- Mobile vertical gesture: scroll.
- Mobile pinch: browser-native zoom.
- Mobile horizontal swipe: turn a page.

Wide readable viewports show two logical pages and advance by spreads. Constrained viewports show one page and advance one page at a time. The six-entry page boundary never changes.

## Validation

Run all deterministic checks:

```powershell
npm run validate
npm test
npm run test:browser
```

`npm run validate` inspects the actual manifest and record directories. Unit tests cover URL identity, manifest syntax, secure-ID boundaries, metadata sanitization, pagination, cache TTL, and static record generation. Browser tests use controlled fixtures to validate desktop/mobile composition, request bounds, cache reuse, responsive continuity, page navigation, animation state, zoom, touch intent, reduced motion, manifest failure, record failure, and preview failure.

Regenerate the deterministic favicon fallbacks and 1200×630 social preview after editing their SVG sources with:

```powershell
npm run brand-assets
```

Serve the current repository locally with:

```powershell
npm run serve
```

Then open `http://127.0.0.1:4173/`. Generated records whose configured public origin differs from localhost retain their configured absolute social metadata, as they should; the journal fixture suite supplies same-origin records for full local browser validation.

## Operational boundaries

- Only absolute `http:` and `https:` targets are accepted.
- Query order and fragments participate in duplicate identity.
- Target metadata is untrusted, sanitized, length-bounded, and HTML-escaped.
- Capture never logs browser profiles, cookies, authorization data, full DOM trees, or image bytes.
- Login walls and CAPTCHA remain failures. A positively identified access challenge receives one isolated visible-browser retry; a second challenge is reported without further retries.
- Missing textual metadata uses fixed placeholders; missing useful visual content fails capture.
- At most six record documents are fetched concurrently, with nearby-only prefetch and a one-hour parsed-metadata cache.
- Manifest membership and order always override cached state.
