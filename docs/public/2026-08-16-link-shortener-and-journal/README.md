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
  "siteBase": "https://example.github.io/link-journal/"
}
```

The example value is intentionally a placeholder. Configure it before creating records intended for publication, because it determines `og:url` and `og:image`.

## Add a link

```powershell
npm run add-link -- https://example.com/article
```

The command validates the repository and dependencies, checks for an existing serialized target, renders the page in a clean Playwright Chromium context, selects a deterministic 1200×630 content region, writes a real JPEG at quality 90, generates crawler-readable redirect HTML, prepends the new ID to `links.txt`, and validates the committed result.

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

- Mouse wheel or vertical trackpad gesture: scroll the scene.
- Ctrl + wheel (Command is also accepted): zoom the journal from 70% to 140%.
- Primary-button drag: pan after a movement threshold; dragging from a card suppresses link activation.
- Right Arrow or PageDown: move toward older links.
- Left Arrow or PageUp: move toward newer links.
- Mobile vertical gesture: scroll.
- Mobile pinch: zoom.
- Mobile horizontal swipe: turn a page; while zoomed, an interior horizontal gesture pans and an edge-originating swipe turns.

Wide readable viewports show two logical pages and advance by spreads. Constrained viewports show one page and advance one page at a time. The six-entry page boundary never changes.

## Validation

Run all deterministic checks:

```powershell
npm run validate
npm test
npm run test:browser
```

`npm run validate` inspects the actual manifest and record directories. Unit tests cover URL identity, manifest syntax, secure-ID boundaries, metadata sanitization, pagination, cache TTL, and static record generation. Browser tests use controlled fixtures to validate desktop/mobile composition, request bounds, cache reuse, responsive continuity, page navigation, animation state, zoom, touch intent, reduced motion, manifest failure, record failure, and preview failure.

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
- Login walls, CAPTCHA and anti-bot challenges are reported rather than bypassed.
- Missing textual metadata uses fixed placeholders; missing useful visual content fails capture.
- At most six record documents are fetched concurrently, with nearby-only prefetch and a one-hour parsed-metadata cache.
- Manifest membership and order always override cached state.
