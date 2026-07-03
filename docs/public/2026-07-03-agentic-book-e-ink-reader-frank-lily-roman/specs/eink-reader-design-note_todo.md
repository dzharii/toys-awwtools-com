# specs/eink-reader-design-note_todo.md

Source: specs/eink-reader-design-note.md
Pass: Design Note

This checklist was extracted from the design note and validated against the
implementation. Items are marked done only when the behavior was verified in a
real browser (via `tests/smoke.mjs` / Playwright) or by direct inspection.

---

## A00 Acceptance Checklist

### Runtime constraints
- [x] Runtime app is static HTML, CSS, JavaScript, and local assets.
- [x] No npm, framework, bundler, server, or build step is required for runtime.
- [x] App can be opened by loading `index.html` (or any static file server).
- [x] Runtime makes no external network requests (CSP `connect-src 'none'`; verified: 0 external requests during full smoke run).
- [x] A strict Content-Security-Policy is present in `index.html`.

### File loading
- [x] `.txt` files can be opened through the file picker.
- [x] `.md` / `.markdown` files can be opened through the file picker.
- [x] Files can be opened through drag-and-drop onto the window/dropzone.
- [x] Unsupported file types are rejected with a clear, non-technical message.
- [x] Empty / whitespace-only files show a calm "nothing to read" message and do not enter the reader.
- [x] Large files produce a non-blocking warning and still paginate.

### Parsing
- [x] TXT is parsed into paragraphs preserving blank-line breaks; long single lines wrap.
- [x] Markdown is parsed with markdown-it, headings/lists/quotes/code/tables/links supported.
- [x] Unicode content renders correctly.

### Security (untrusted Markdown)
- [x] Raw HTML in Markdown is NOT executed (`html:false`); verified `window.__xssExecuted` stays undefined.
- [x] Raw HTML is not rendered as trusted markup; output is DOMPurify-sanitized.
- [x] `<script>`, `<iframe>`, `<style>`, inline event handlers, and `javascript:` URLs are neutralized.
- [x] Images are rendered as non-fetching placeholders (verified: 0 image requests).
- [x] Sanitizer failure fails closed (throws rather than emitting unsafe HTML).

### Storage / privacy
- [x] Book/document content is never persisted (verified: only `eink-reader:preferences` key exists; no book text in storage).
- [x] Preferences persist across reloads and are validated/clamped on load.
- [x] After reload the book is gone and the user must reopen it.

### Rendering & typography
- [x] Default reading font is local Literata on an off-white paper surface.
- [x] Constrained line width (measure), readable line height, comfortable paragraph spacing.
- [x] Font family, size, line height, measure, paragraph spacing, and alignment are adjustable.
- [x] Subtle paper-grain texture with adjustable strength.

### Page mode
- [x] Content is paginated into pages sized to the viewport.
- [x] Page turns move forward/back; Home/End jump to first/last.
- [x] Page count is stable across re-measure and mode round-trips (font-load race fixed).
- [x] Progress indicator reflects current page.

### Scroll mode
- [x] Continuous scrolling column; position preserved as a fraction across settings changes.
- [x] Normal scrolling does not trigger the E Ink flash.
- [x] Switching modes preserves reading position.

### E Ink simulation
- [x] Page turns and major changes use a grayscale wash + ghosting refresh.
- [x] Partial vs full refresh cadence (full refresh interval) is implemented.
- [x] Refreshes are serialized so the overlay never gets stuck (finally-based unlock).
- [x] Intensity levels (subtle / balanced / strong) supported.
- [x] `prefers-reduced-motion` is honored (verified: `data-motion="reduced"`).

### Settings & accessibility
- [x] Settings panel opens/closes; changes apply live.
- [x] Keyboard navigation for pages and shortcuts (o/s/Esc, arrows, space, Home/End).
- [x] Focus is trapped in settings while open and restored on close.
- [x] Live-region progress announcement.
- [x] Visible focus outline suitable for grayscale.

### Responsive
- [x] Desktop layout (centered paper, max width, shadow).
- [x] Tablet and mobile layouts adapt padding/measure/controls (mobile verified at 390px).
- [x] Uses dvh where available for mobile browser chrome.

### Dependencies & fonts
- [x] markdown-it and DOMPurify vendored locally, unminified, with LICENSE files.
- [x] All fonts vendored locally as WOFF2 with OFL license texts.
- [x] `@font-face` declarations reference only local files.
- [x] Vendor manifest records source URL, version, size, sha256, and license per file.
- [x] `vendor-check.mjs` verifies integrity (17/17 verified).
- [x] Missing selected font falls back safely to the stack.

### Logging & errors
- [x] Structured logging with a debug toggle; logs never include book content.
- [x] Errors are mapped to calm, actionable messages (no raw stack traces to the user).
- [x] No stuck overlay / endless spinner / blank page on error.

### Documentation & testing
- [x] README documents usage, privacy, offline guarantees, and scripts.
- [x] LICENSES.md lists every vendored dependency and font license.
- [x] Fixtures cover TXT, Markdown, code-heavy, unsafe, Unicode, long, empty, whitespace, one-long-line, unsupported.
- [x] Playwright specs + a dependency-tolerant smoke runner cover acceptance behaviors.

---

## B00 Validation Checklist

- [x] App was opened locally via the static server.
- [x] Browser console was checked (no errors across all fixtures).
- [x] Runtime network requests were checked (0 external).
- [x] Storage was checked for book content (none; preferences only).
- [x] Desktop viewport (1200×800) was tested.
- [x] Mobile viewport (Pixel 5 / 390px) was tested.
- [x] Page mode and scroll mode were both tested.
- [x] Markdown safety fixture was tested (XSS blocked).
- [x] Reduced motion was tested.
- [x] Reload was tested (prefs persist, content does not).
- [ ] Manual visual judgement of the E Ink effect credibility (requires human eyes).

---

## C00 Risks And Edge Cases

- [x] Large files do not freeze without feedback (large-file warning + async layout).
- [x] Markdown raw HTML does not render as trusted HTML.
- [x] Remote images from Markdown are not fetched.
- [x] Font-load timing does not produce inconsistent page counts (explicit `document.fonts.load` before measuring).
- [x] Flex height chain is bounded so scroll mode actually scrolls (body fixed to viewport height).
- [x] Paged `.paper` fills the stage via absolute positioning (percentage-height pitfall avoided).
- [x] Sanitizer-unavailable path fails closed.
- [ ] Behavior if a WOFF2 file is corrupted at runtime (falls back to stack; not force-tested).

---

## D00 Final Review

- [x] All implemented items were retested after the layout/pagination fixes.
- [x] Smoke suite: 10/10 checks passing.
- [x] Vendor integrity: 17/17 files verified.
- [ ] Remaining limitation: E Ink credibility and reading comfort require manual human review; automated tests cannot decide this.
