---

A00 Browser Test Plan For E Ink Reader

---

This document defines the manual browser test plan for the E Ink Reader application.

The goal is to create a complete, micromanagement-level test plan before automation. The agent must later convert this plan into Playwright tests, but this document itself does not implement test code.

The application under test is a static, local-first browser reader for `.txt`, `.md`, and `.markdown` files. The source snapshot describes a reader with local files only, page and scroll modes, E Ink refresh effects, local fonts, safe Markdown, themes, preference persistence, responsive behavior, and no book-content persistence.

The current specification also requires browser tests for boot behavior, file input, Markdown safety, settings, page and scroll mode, reduced motion, responsive layouts, localStorage privacy, and visual inspection.

---

B00 Test Philosophy

---

The test plan must verify product behavior, not only code paths.

The tester must act like a reader using the app in a browser. Each test should check the direct feature under test and the surrounding state that can break silently. For example, after changing text size, the test must not only verify that the text size value changed. It must also verify that the reader remains visible, content remains readable, the active mode remains valid, page or scroll position is sane, progress does not disappear, no error toast appears, no overlay is stuck, and no book content was persisted.

The test plan uses four layers.

Smoke tests are broad and shallow. They answer whether the app boots, opens core surfaces, loads basic files, exposes controls, and does not immediately break.

Single-feature tests exercise one feature or one setting at a time. These tests use equivalence classes and boundary values.

Pairwise combination tests exercise meaningful combinations of two settings or two state changes. These tests are data-driven. The goal is to catch interaction bugs without testing every possible Cartesian combination.

Journey tests exercise realistic longer workflows. These combine file loading, settings, navigation, responsive layout, errors, reloads, and privacy checks.

The agent must later automate this plan with Playwright using browser-level observation, DOM checks, console/page-error capture, network request capture, viewport changes, localStorage inspection, and in-page evaluation. The existing app exposes stable DOM surfaces such as `#reader`, `#settings-button`, `#reader-stage`, `#page-viewport`, `#reader-scroll`, `#prev-page`, `#next-page`, `#progress`, `#busy`, and `#toast`, which should be used as automation anchors where appropriate.

---

C00 Required Test Artifacts

---

The agent must create reproducible test assets before automation.

All test assets must live under:

```text
tests/fixtures/
```

The fixture set must cover plain text, standard Markdown, unsafe Markdown, code-heavy Markdown, long content, Unicode, empty files, unsupported files, and large-file behavior. The original specification already calls for fixtures such as `simple.txt`, `long-book.txt`, `simple.md`, `markdown-edge-cases.md`, `unicode.txt`, `large-headings.md`, and `unsupported.pdf`.

The final fixture set should be more explicit.

Use this fixture catalog:

| Fixture                 | Purpose                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `simple-prose.txt`      | Short TXT with title, blank lines, paragraphs, and normal punctuation.                                                                        |
| `long-book.txt`         | Long TXT with chapters, many paragraphs, and enough content to produce multiple pages.                                                        |
| `one-long-line.txt`     | TXT with one extremely long line to test wrapping and horizontal overflow.                                                                    |
| `unicode-mixed.txt`     | TXT with accented Latin, Cyrillic, symbols, em dashes, quotes, and long words.                                                                |
| `empty.txt`             | Truly empty file.                                                                                                                             |
| `whitespace-only.txt`   | Spaces, tabs, and blank lines only.                                                                                                           |
| `standard-markdown.md`  | Headings, paragraphs, emphasis, lists, blockquote, link, horizontal rule, inline code, fenced code.                                           |
| `code-heavy-notes.md`   | Roman-style technical note with JavaScript, Python, shell, JSON, long code lines, links, and complexity notes.                                |
| `unsafe-markdown.md`    | Raw HTML, script tags, event attributes, iframe, style tag, remote image syntax, javascript-like URLs.                                        |
| `markdown-table.md`     | Table, long cells, inline code inside cells, and normal prose before and after.                                                               |
| `malformed-markdown.md` | Unclosed code fence, broken list nesting, incomplete link, raw HTML fragments.                                                                |
| `many-headings.md`      | Many H1/H2/H3 sections for pagination and scrolling behavior.                                                                                 |
| `large-accepted.md`     | A large but accepted Markdown file near the warning threshold.                                                                                |
| `too-large.txt`         | A file exceeding the configured hard limit if the app has one. If no hard limit exists, this fixture documents a missing product requirement. |
| `unsupported.pdf`       | Small dummy binary or placeholder with `.pdf` extension to test unsupported-file rejection.                                                   |
| `unsupported.json`      | Valid JSON file to test unsupported text-like extension rejection.                                                                            |
| `remote-image.md`       | Markdown image pointing to `https://example.com/image.png` to verify no fetch occurs.                                                         |
| `links.md`              | External links, mailto-style link, relative link, and malformed link to test safe link behavior.                                              |

Fixtures should contain deterministic text with unique markers. Example markers:

```text
FIXTURE_SIMPLE_TXT_TITLE
FIXTURE_STANDARD_MD_HEADING
FIXTURE_CODE_HEAVY_JS_SNIPPET
FIXTURE_UNSAFE_SCRIPT_MARKER
FIXTURE_REMOTE_IMAGE_ALT
FIXTURE_UNICODE_CYRILLIC_MARKER
```

The agent must use these markers later in Playwright assertions. This avoids brittle checks against large text blocks.

No fixture should require external network access.

---

D00 Browser Test Harness Scope

---

The eventual Playwright suite must run against the real browser app, not imported modules.

The tests should start a static server if needed, open the app URL, and interact with the rendered page. The app is static and should not need a build step for runtime. Optional developer scripts may serve files, but the browser behavior remains the test target.

The test harness must collect diagnostics on every test:

```text
Console errors.
Page errors.
Unexpected network requests.
Current URL.
Viewport size.
Visible app state.
Reader mode.
Settings open/closed state.
Busy overlay state.
Toast text if visible.
localStorage keys and values.
Relevant DOM dimensions.
```

The harness must treat unexpected console errors and page errors as failures unless explicitly classified as known limitations.

The harness must fail if runtime network requests occur unexpectedly. The app has a strict local/offline requirement and CSP with `connect-src 'none'`, and the README states that no runtime network requests should occur.

The harness must check localStorage after content-load tests. Only preferences may be stored. Book content, parsed HTML, page text, code snippets, excerpts, source Markdown, and search-like indexes must not appear in persistent storage.

---

E00 Standard Post-Action Oracle

---

Every browser interaction test must run a standard post-action oracle unless the test intentionally expects an error state.

The oracle must check:

```text
The page has no uncaught page error.
The console has no unexpected error.
The busy overlay is hidden after the action settles.
No E Ink overlay remains stuck.
The reader and open screen are not both active at the same time.
The settings panel state matches the expected state.
The active mode is one of paged or scroll.
The active theme is one of warm-paper, cool-paper, high-contrast, dark.
The active E Ink intensity is one of off, reduced, balanced, strong.
The progress region is visible when a document is open and progress is enabled.
The reader title is non-empty when a document is open.
The content area has non-zero dimensions.
The content area does not produce body-level horizontal overflow.
No file content appears in localStorage.
No unexpected network request occurred.
```

For page mode, additionally check:

```text
#page-viewport is visible.
#reader-scroll is hidden.
Page navigation controls exist.
Progress text contains a page-like state.
The current page index is in range if observable through UI or app state.
Next and previous actions do not produce negative page numbers or empty pages.
```

For scroll mode, additionally check:

```text
#reader-scroll is visible.
#page-viewport is hidden.
The stage can scroll when content is longer than the viewport.
Normal scroll does not trigger heavy repeated refresh artifacts.
Body-level horizontal overflow is absent.
```

For settings changes, additionally check:

```text
The selected setting value is reflected in UI.
The corresponding DOM attribute, CSS variable, or rendered behavior changes.
The document remains readable.
Reading position is preserved approximately.
No invalid CSS values appear, such as negative padding or NaN dimensions.
```

This oracle is mandatory because many bugs are not inside the setting that changed. They appear in layout, overlays, progress, storage, or responsiveness.

---

F00 Smoke Test Layer

---

Smoke tests must run first.

Smoke tests are shallow. They do not prove every feature. They prove that the app can boot, load representative files, expose main surfaces, and recover from obvious invalid input.

Smoke test S001: boot open screen.

Action: open the app root in a fresh browser context.

Expected result: `#open-screen` is visible, file input exists, drop zone text explains TXT and Markdown support, RSS link is present if implemented, `#reader` is hidden, `#busy` is hidden, no unexpected console or page errors occur, and no external network requests occur.

Smoke test S002: static metadata.

Action: inspect `document.head`.

Expected result: title, meta description, canonical URL, RSS discovery link, Open Graph tags, X/Twitter tags, social image URL, image width, image height, and image alt text exist and match the product behavior. This is required because social metadata must be static in the HTML head.

Smoke test S003: load simple TXT through file picker.

Action: use the file picker automation path to select `simple-prose.txt`.

Expected result: reader becomes visible, open screen hides, title is derived from file or first content, text marker appears, progress appears, default mode is page mode unless preferences override it, no persistent book content exists.

Smoke test S004: load simple Markdown through file picker.

Action: select `standard-markdown.md`.

Expected result: Markdown heading renders as a heading, paragraph renders as text, list renders as list, inline code and fenced code are visible, raw Markdown syntax is not shown for normal constructs.

Smoke test S005: load TXT through drag-and-drop.

Action: drag one supported TXT fixture onto the drop zone.

Expected result: same successful reader state as file picker. The browser must not navigate away.

Smoke test S006: load Markdown through drag-and-drop.

Action: drag `standard-markdown.md`.

Expected result: same successful Markdown reader state as file picker.

Smoke test S007: unsupported file rejection.

Action: open `unsupported.pdf`.

Expected result: app remains on open screen or returns to safe open state, error message says the file type is not supported and points to `.txt`, `.md`, or `.markdown`, no blank reader, no stack trace.

Smoke test S008: settings open and close.

Action: load a file, click settings, then close settings with Escape and with the visible close control.

Expected result: settings appears, focus enters settings, settings closes, focus returns to reader or sensible control, reader remains usable.

Smoke test S009: page navigation.

Action: load `long-book.txt`, click Next, click Previous, press ArrowRight, press ArrowLeft.

Expected result: visible content or progress changes on next, returns or moves backward on previous, page count remains valid, no overlay stuck.

Smoke test S010: mode switch.

Action: load `long-book.txt`, switch from page mode to scroll mode, then back to page mode.

Expected result: mode attribute changes, correct content mount is visible, position remains approximately near the same content, E Ink full refresh occurs for mode switch unless reduced/off.

Smoke test S011: reload privacy.

Action: load a file, change one preference, reload.

Expected result: preferences remain, open screen is shown, reader is hidden, book content is not restored. This is core privacy behavior.

Smoke test S012: reduced motion browser context.

Action: open the app in a browser context with reduced motion enabled, load `simple-prose.txt`.

Expected result: reader has reduced motion behavior and aggressive flashing/ghosting is disabled or softened. Existing source snippets show a reduced-motion Playwright test already exists, so this should remain a core smoke check.

---

G00 File Input Test Cases

---

File tests verify input validation, content reading, recovery, and privacy.

F001: single supported `.txt`.

Action: open `simple-prose.txt`.

Expected result: prose renders as paragraphs. Blank lines become paragraph separation. There is no raw preformatted dump unless content is intentionally preformatted.

F002: single supported `.md`.

Action: open `standard-markdown.md`.

Expected result: Markdown renders as safe document HTML.

F003: single supported `.markdown`.

Action: open duplicate of `standard-markdown.md` with `.markdown` extension.

Expected result: identical behavior to `.md`.

F004: unsupported binary.

Action: open `unsupported.pdf`.

Expected result: clear unsupported type message.

F005: unsupported text-like extension.

Action: open `unsupported.json`.

Expected result: clear unsupported type message. The app must not parse JSON just because it is text.

F006: empty file.

Action: open `empty.txt`.

Expected result: clear message such as "This file is empty." Open another file remains available. No blank reader.

F007: whitespace-only file.

Action: open `whitespace-only.txt`.

Expected result: same as empty or "no readable content" behavior.

F008: multiple-file drag.

Action: drag `simple-prose.txt` and `standard-markdown.md` together.

Expected result: app rejects the action with calm "open one file at a time" message. It must not pick the first file silently.

F009: large accepted file.

Action: open `large-accepted.md`.

Expected result: app shows busy or warning if needed, then renders. If page mode is too slow, the fallback should be explicit and recoverable.

F010: too-large file.

Action: open `too-large.txt`.

Expected result: if a hard limit exists, the app rejects early with a clear message. If no hard limit exists, the test should record a product risk and recommend adding one.

F011: reopen another file from reader.

Action: load `simple-prose.txt`, click Open in the reader bar, select `standard-markdown.md`.

Expected result: old content is replaced, new title and content appear, previous content is not visible or stored, preferences remain.

F012: drag supported file while reader is open.

Action: load one file, then drag another supported file onto the reader area if the UI supports it.

Expected result: either accepted as open-new-file or rejected calmly. The behavior must be intentional and documented.

---

H00 TXT Rendering Test Cases

---

TXT rendering tests verify that plain text becomes readable prose.

T001: paragraph preservation.

Fixture: `simple-prose.txt`.

Expected result: title and paragraphs are visually separated. Consecutive blank lines do not collapse into unreadable density.

T002: long paragraphs.

Fixture: `long-book.txt`.

Expected result: line wrapping follows reader measure. No body-level horizontal overflow.

T003: one long line.

Fixture: `one-long-line.txt`.

Expected result: the long line wraps or is safely contained. The body must not horizontally scroll. In page mode, text must not escape the paper surface.

T004: command-output-like text.

Fixture: add a section in `simple-prose.txt` or create `txt-command-output.txt`.

Expected result: spacing remains understandable. The renderer must not destroy all indentation if the text appears preformatted.

T005: Unicode and encoding.

Fixture: `unicode-mixed.txt`.

Expected result: Cyrillic and accented text render without mojibake. Unsupported glyphs should fall back without breaking layout.

T006: old line endings.

Fixture: create variants or embed line-ending cases.

Expected result: Windows CRLF, Unix LF, and old Mac-style CR are normalized into readable paragraphs.

---

I00 Markdown Rendering Test Cases

---

Markdown tests verify semantic rendering and safety.

M001: headings.

Fixture: `standard-markdown.md`.

Expected result: H1/H2/H3 render as headings with calm reader styling. First heading may become document title if implemented.

M002: paragraphs and emphasis.

Expected result: paragraphs render as prose. Strong and italic are visible.

M003: lists.

Expected result: ordered and unordered lists render with compact, readable spacing. Nested lists do not create excessive indentation or overflow.

M004: blockquotes.

Expected result: blockquotes have subtle indentation or border and do not dominate the page.

M005: horizontal rules.

Expected result: rules appear as restrained section separators.

M006: inline code.

Expected result: inline code is visually distinct and contained in line.

M007: fenced code.

Expected result: code block preserves indentation, uses monospace, remains inside column, and does not cause body horizontal overflow.

M008: long code line on desktop.

Expected result: code block either scrolls internally or wraps according to design. The whole page must not overflow.

M009: long code line on mobile.

Expected result: code block remains contained inside viewport. This is critical for Roman's mobile use.

M010: tables.

Fixture: `markdown-table.md`.

Expected result: tables render readably and remain inside the reader surface. If tables overflow, overflow must be contained within the table area, not the body.

M011: links.

Fixture: `links.md`.

Expected result: links are subdued, clickable, and do not prefetch. External links open only through explicit user action.

M012: remote image placeholder.

Fixture: `remote-image.md`.

Expected result: remote image is not fetched. Placeholder text appears, such as an image placeholder element. No network request occurs.

M013: raw HTML.

Fixture: `unsafe-markdown.md`.

Expected result: raw HTML is escaped, stripped, or shown as literal safe text. It must not render as trusted markup.

M014: script execution prevention.

Fixture: `unsafe-markdown.md`.

Expected result: script tags, inline handlers, javascript-like URLs, iframe, object, style, and remote images do not execute or load. A global sentinel in the fixture, such as `window.__unsafeMarkdownExecuted = true`, must remain unset.

M015: malformed Markdown fallback.

Fixture: `malformed-markdown.md`.

Expected result: safe best-effort rendering or a calm fallback action to open as plain text. No blank page or raw stack trace.

---

J00 Reader Mode Test Cases

---

Reader mode tests cover page mode and scroll mode independently.

R001: default mode.

Action: load file in fresh context.

Expected result: mode defaults to `paged` unless a saved preference says otherwise. Reader attribute and visible surface agree.

R002: page mode visible surfaces.

Expected result: `#page-viewport` is visible, `#reader-scroll` is hidden, page nav controls are visible, content fits paper surface.

R003: scroll mode visible surfaces.

Action: switch to scroll mode.

Expected result: `#reader-scroll` is visible, `#page-viewport` is hidden, stage scrolls for long content, normal scrolling works.

R004: switch page to scroll.

Expected result: full E Ink refresh occurs unless effect is off or reduced by system. Approximate position is preserved.

R005: switch scroll to page.

Expected result: app paginates and lands near same section. Page count is valid.

R006: mode switch with short file.

Expected result: no empty page, no broken progress, no impossible scroll state.

R007: mode switch with long file.

Expected result: no freeze without feedback. If pagination fails, app falls back or offers scroll mode.

R008: mode switch during E Ink transition.

Action: trigger page turn, immediately open settings and switch mode.

Expected result: app either queues or cancels safely. No stuck overlay. Final mode is valid.

---

K00 Page Navigation Test Cases

---

Page navigation tests verify page boundaries, controls, keyboard, tap zones, and progress.

P001: next button.

Action: load `long-book.txt`, click Next.

Expected result: page changes, progress updates, E Ink partial refresh occurs if enabled.

P002: previous button.

Action: after next, click Previous.

Expected result: page changes backward, no negative page index.

P003: previous at first page.

Action: click Previous on page 1.

Expected result: remains on page 1 or shows no-op behavior. No error.

P004: next at last page.

Action: navigate to last page using End, then click Next.

Expected result: remains on last page or no-op. No error.

P005: keyboard next.

Action: press ArrowRight, PageDown, Space.

Expected result: each advances in page mode.

P006: keyboard previous.

Action: press ArrowLeft, PageUp, Shift+Space.

Expected result: each moves backward in page mode where possible.

P007: Home and End.

Expected result: Home moves to first page, End moves to last page.

P008: tap zones.

Action: click `#zone-next` and `#zone-prev`.

Expected result: page navigation works without blocking settings or text interaction.

P009: rapid page turns.

Action: click Next rapidly 10 times.

Expected result: no stuck overlay, page index remains in range, ghosting does not accumulate into unreadability.

P010: page count after font change.

Action: record page count, change font size or font family.

Expected result: page count may change but remains numeric and valid. Current page remains in range.

---

L00 Settings Surface Test Cases

---

Settings tests verify opening, closing, focus, persistence, validation, and visible effect.

ST001: open settings by button.

Expected result: settings panel visible. Focus moves inside settings.

ST002: close settings by Escape.

Expected result: settings closes. Reader remains active.

ST003: close settings by visible control.

Expected result: settings closes. Focus returns sensibly.

ST004: keyboard trap.

Action: tab through settings controls.

Expected result: focus remains in settings while open and does not disappear.

ST005: settings state matches preferences.

Action: open settings after fresh load.

Expected result: controls show current default preferences.

ST006: settings persistence.

Action: change one setting, reload.

Expected result: changed preference persists, book does not.

ST007: corrupted preferences.

Action: before load, write invalid JSON or invalid values to `localStorage`.

Expected result: app falls back to safe defaults and shows calm message if appropriate.

ST008: localStorage unavailable simulation.

Action: in Playwright, monkey-patch localStorage methods to throw before app boot if feasible, or run a browser context that blocks storage if supported.

Expected result: app still opens and settings apply for session; message says preferences may not be remembered.

---

M00 Single-Setting Boundary Test Matrix

---

These tests change one setting at a time while a document is open.

Use three classes for numeric settings: minimum, nominal, maximum. Also test below-minimum and above-maximum through localStorage injection or direct app API if exposed, because the preferences validator clamps values. The source snapshot shows validated ranges for preferences: `fontSize` 14-34, `lineHeight` 1.2-2.1, `measure` 40-100, `paraSpacing` 0.2-2, `textureStrength` 0-1, `margin` 8-80, with enumerated fonts, themes, contrast, E Ink values, motion values, modes, and refresh styles.

Use `standard-markdown.md` for most setting tests and `code-heavy-notes.md` for code-sensitive tests.

| Setting               | Classes to test                                                           | Expected checks                                                                                      |
| --------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Font family           | Literata, Charis SIL, Source Serif 4, Merriweather, Atkinson Hyperlegible | CSS variable or rendered font changes; content remains readable; page count valid; no network fonts. |
| Font size             | 14, 20, 34, injected 1, injected 200                                      | UI clamps or rejects invalid values; text size changes; layout remains valid; no overlap.            |
| Line height           | 1.2, 1.55, 2.1, injected 0.1, injected 5                                  | CSS line-height changes; page count valid; no clipped lines.                                         |
| Measure               | 40, 68, 100, injected 1, injected 200                                     | column width changes; desktop remains centered; mobile no overflow.                                  |
| Paragraph spacing     | 0.2, 0.9, 2, injected -1, injected 10                                     | paragraph spacing changes; no negative spacing collapse.                                             |
| Alignment             | left, justify, injected invalid                                           | alignment changes or invalid falls back; code blocks unaffected.                                     |
| Reader mode           | paged, scroll, injected invalid                                           | mode changes; invalid falls back to paged.                                                           |
| Theme                 | warm-paper, cool-paper, high-contrast, dark, injected invalid             | html `data-theme` changes; contrast readable; invalid falls back.                                    |
| Contrast              | soft, normal, injected invalid                                            | html `data-contrast` changes; text visible.                                                          |
| Texture strength      | 0, 0.5, 1, injected -1, injected 99                                       | texture opacity changes; no readability loss.                                                        |
| Margin                | 8, 28, 80, injected -100, injected 500                                    | page padding/margins remain non-negative; no content clipping.                                       |
| E Ink intensity       | off, reduced, balanced, strong, injected invalid                          | reader `data-eink` changes; overlay behavior matches intensity; invalid falls back.                  |
| Refresh style         | adaptive, flash, wash, injected invalid                                   | setting persists and refresh behavior remains valid.                                                 |
| Full refresh interval | 1, 6, high value, invalid                                                 | after enough page turns, full refresh cleanup occurs or interval clamps.                             |
| Ghosting              | low, default, high, invalid                                               | ghost opacity changes but does not obscure text.                                                     |
| Motion                | system, reduced, full, injected invalid                                   | reader `data-motion` changes; reduced disables aggressive effects.                                   |
| Show progress         | on, off, invalid                                                          | progress region shows/hides consistently; navigation still works.                                    |
| Debug enabled         | false, true, invalid                                                      | diagnostics visibility changes; logs do not leak content.                                            |

Every single-setting test must run the standard post-action oracle.

---

N00 Pairwise Combination Strategy

---

Pairwise tests must not attempt the full Cartesian product. The goal is high interaction coverage at manageable cost.

Use these factors first:

```text
File type: TXT, standard Markdown, code-heavy Markdown, unsafe Markdown.
Reader mode: paged, scroll.
Viewport: desktop, tablet, mobile.
Font family class: serif default, accessibility sans, dense serif.
Font size class: min, default, max.
Line height class: min, default, max.
Theme: warm-paper, high-contrast, dark.
Contrast: soft, normal.
E Ink intensity: off, reduced, balanced, strong.
Motion: system, reduced, full.
Texture: off, default, max.
Progress: on, off.
```

The agent should generate a pairwise table from these factors using any available local tooling or a simple in-script algorithm. The resulting table should be committed as a test planning artifact, for example:

```text
tests/plans/pairwise-settings-matrix.md
```

Each pairwise row becomes a manual scenario first and an automated test later.

For each row, the user story is:

```text
Open the specified fixture.
Apply the specified viewport.
Apply the specified settings in a deterministic order.
Let the reader settle.
Verify primary expected state.
Run the standard post-action oracle.
Verify privacy and no network.
```

The deterministic order should be:

```text
Viewport.
File open.
Mode.
Font family.
Font size.
Line height.
Theme.
Contrast.
Texture.
E Ink intensity.
Motion.
Progress.
```

This order makes failures easier to diagnose. If a later setting fails, the report should include all earlier applied values.

---

O00 Pairwise Seed Matrix

---

Use this seed matrix before generating a larger table. It covers high-risk combinations by hand.

| ID    | Fixture                | Viewport | Mode   | Font                  | Size    | Theme         | E Ink    | Motion  | Main risk                             |
| ----- | ---------------------- | -------- | ------ | --------------------- | ------- | ------------- | -------- | ------- | ------------------------------------- |
| PW001 | `standard-markdown.md` | desktop  | paged  | Literata              | default | warm-paper    | balanced | system  | default realistic reading.            |
| PW002 | `code-heavy-notes.md`  | mobile   | scroll | Atkinson Hyperlegible | max     | high-contrast | reduced  | system  | code blocks on mobile.                |
| PW003 | `long-book.txt`        | desktop  | paged  | Charis SIL            | max     | warm-paper    | strong   | full    | long page mode with strong refresh.   |
| PW004 | `many-headings.md`     | tablet   | paged  | Source Serif 4        | min     | cool-paper    | balanced | system  | headings and pagination on tablet.    |
| PW005 | `unsafe-markdown.md`   | desktop  | scroll | Literata              | default | high-contrast | off      | reduced | unsafe content with no effects.       |
| PW006 | `remote-image.md`      | mobile   | scroll | Merriweather          | default | dark          | reduced  | reduced | remote image no-fetch in dark mobile. |
| PW007 | `markdown-table.md`    | mobile   | scroll | Atkinson Hyperlegible | min     | high-contrast | off      | system  | table overflow on small screen.       |
| PW008 | `unicode-mixed.txt`    | tablet   | paged  | Source Serif 4        | default | cool-paper    | balanced | full    | Unicode fallback and page layout.     |
| PW009 | `one-long-line.txt`    | mobile   | scroll | Literata              | max     | warm-paper    | off      | reduced | long-line overflow.                   |
| PW010 | `large-accepted.md`    | desktop  | scroll | Merriweather          | default | warm-paper    | reduced  | system  | large file responsiveness.            |
| PW011 | `code-heavy-notes.md`  | desktop  | paged  | Atkinson Hyperlegible | default | dark          | strong   | full    | code readability in dark strong mode. |
| PW012 | `standard-markdown.md` | tablet   | scroll | Charis SIL            | max     | high-contrast | balanced | reduced | large text scroll on tablet.          |

Each row must verify:

```text
Expected file content visible.
Correct mode visible.
Correct theme applied.
Correct font class or CSS variable applied.
No body horizontal overflow.
No stuck busy or E Ink overlay.
Progress state sane.
Settings reflect applied values.
No book content in localStorage.
No unexpected network.
```

---

P00 Multi-Setting Journey Tests

---

Journey tests simulate realistic use rather than isolated settings.

J001: Lily smooth recovery journey.

Action sequence:

```text
Open app.
Drop two files.
Verify calm multiple-file message.
Open unsupported PDF.
Verify calm unsupported message.
Open empty TXT.
Verify empty-file message.
Open standard Markdown.
Switch to scroll mode.
Increase text size.
Reduce E Ink effect.
Close settings.
Reload.
```

Expected result: every mistake is recoverable, valid file eventually loads, preferences persist, book does not restore.

J002: Frank long reading journey.

Action sequence:

```text
Open long-book.txt.
Read in page mode.
Turn 10 pages.
Switch font to Charis SIL.
Increase line height.
Switch theme to cool-paper.
Turn more pages.
Switch to scroll mode.
Return to page mode.
Reload.
```

Expected result: content remains readable, page count valid, E Ink transitions behave, position remains approximately stable within session, preferences persist, book does not.

J003: Roman mobile code review journey.

Action sequence:

```text
Set mobile viewport.
Open code-heavy-notes.md.
Switch to scroll mode.
Set Atkinson Hyperlegible.
Set high contrast.
Set E Ink reduced.
Scroll to code marker.
Inspect code block dimensions.
Tap or focus a link without accidental navigation.
Reload.
```

Expected result: code blocks contained, no horizontal body overflow, link behavior intentional, preferences persist, note content does not.

J004: unsafe Markdown journey.

Action sequence:

```text
Open unsafe-markdown.md.
Inspect rendered document.
Check global script sentinel.
Check network requests.
Open diagnostics or debug mode if present.
Switch theme.
Switch mode.
Reload.
```

Expected result: unsafe content never executes, no remote fetch occurs, document remains safe after mode/theme changes, no unsafe content persists.

J005: reduced motion journey.

Action sequence:

```text
Open app in reduced-motion context.
Open standard Markdown.
Turn page.
Switch theme.
Switch font.
Switch mode.
Set E Ink strong manually if UI allows.
Set E Ink off.
```

Expected result: system reduced motion is respected by default. Manual override behavior is explicit. No aggressive motion unless intentionally enabled.

J006: corrupted preference journey.

Action sequence:

```text
Before app load, write localStorage preference object with invalid font, negative size, impossible line height, invalid theme, invalid mode, invalid E Ink value.
Open app.
Open standard Markdown.
Open settings.
```

Expected result: preferences are clamped or reset to valid defaults. App does not crash. Settings show valid values.

J007: rapid interaction dirty-state journey.

Action sequence:

```text
Open long-book.txt.
Rapidly click Next five times.
Open settings immediately.
Change mode.
Change font size.
Close settings.
Resize viewport to mobile.
Switch theme.
```

Expected result: final state is valid, no overlay stuck, content visible, no invalid dimensions, no page index out of range.

---

Q00 Responsive Test Cases

---

Responsive tests must use real browser viewport sizes.

Use these baseline viewports:

```text
Desktop: 1440 x 900.
Small desktop: 1024 x 768.
Tablet portrait: 768 x 1024.
Tablet landscape: 1024 x 768.
Mobile narrow: 390 x 844.
Mobile small: 360 x 640.
Mobile landscape: 844 x 390.
```

RESP001: open screen at each viewport.

Expected result: drop zone and open button visible, no clipped text, RSS link visible or reasonably placed.

RESP002: page mode at each viewport.

Expected result: content fits, controls reachable, no body horizontal overflow.

RESP003: scroll mode at each viewport.

Expected result: natural scrolling, no control overlap.

RESP004: settings at each viewport.

Expected result: settings panel fits. On mobile, it should be usable without horizontal scrolling.

RESP005: code block mobile.

Expected result: code blocks are contained in the content area.

RESP006: orientation change.

Action: load long document on tablet portrait, switch to landscape.

Expected result: layout recalculates, position remains near same content, no invalid page count.

---

R00 Accessibility Test Cases

---

A11Y001: keyboard-only file open path.

Action: use Tab and Enter to reach file picker where automation allows.

Expected result: file open control is keyboard reachable.

A11Y002: keyboard reading path.

Action: use keyboard to turn pages and open/close settings.

Expected result: all documented shortcuts work outside form controls.

A11Y003: focus visibility.

Action: tab through controls.

Expected result: focus ring is visible against all themes.

A11Y004: settings focus management.

Action: open settings, tab through, press Escape.

Expected result: focus stays inside while open and returns after close.

A11Y005: ARIA progress.

Expected result: progress region uses live region or accessible text and updates after page turns.

A11Y006: reduced motion.

Expected result: reduced-motion context reduces aggressive visual effects.

A11Y007: high contrast.

Expected result: high-contrast theme makes text and controls readable.

A11Y008: form controls do not trigger shortcuts.

Action: focus a setting control, press arrow keys or Space.

Expected result: control changes normally; page does not turn unexpectedly.

---

S00 Error Message Test Cases

---

Error message tests must verify exact or near-exact user-facing copy. The wording should remain calm and actionable.

E001: multiple files.

Expected copy class: "Open one file at a time. Choose a single .txt, .md, or .markdown file to continue."

E002: unsupported file.

Expected copy class: "This file type is not supported. Open a .txt, .md, or .markdown file."

E003: empty file.

Expected copy class: "This file is empty. Choose another TXT or Markdown file to read."

E004: too large.

Expected copy class: "This file is too large for this reader. Try a smaller TXT or Markdown file."

E005: Markdown unsafe/fallback.

Expected copy class: "Markdown could not be shown safely. You can open this file as plain text instead."

E006: pagination failure.

Expected copy class: "Page layout could not be prepared for this file. You can read it in scroll mode instead."

E007: missing font.

Expected copy class: "That font is not available, so the reader used Literata."

E008: preference restore failure.

Expected copy class: "Reader preferences could not be restored. The default settings are being used for this session."

E009: preference save failure.

Expected copy class: "These settings will apply for now, but they may not be remembered after you close the app."

E010: missing Markdown dependency.

Expected copy class: "Markdown support is not available in this copy of the reader. You can open this file as plain text, or use a complete copy of the app."

Each error test must also verify recovery: the file picker or alternative action remains available, no blank state, no raw stack trace in the visible UI, and no persistent book content.

---

T00 Privacy And Storage Test Cases

---

PR001: no content in localStorage after TXT load.

Action: load `simple-prose.txt`.

Expected result: localStorage contains preferences only. Fixture markers do not appear.

PR002: no content in localStorage after Markdown load.

Action: load `code-heavy-notes.md`.

Expected result: source Markdown, code snippets, rendered HTML, and markers do not appear.

PR003: reload removes book.

Action: load file, reload.

Expected result: open screen appears, reader hidden, preferences restored.

PR004: no IndexedDB content.

Action: after loading file, inspect IndexedDB databases if browser allows.

Expected result: no app-created DB containing book content.

PR005: no Cache Storage content.

Expected result: app does not cache book or source files.

PR006: logs do not contain book content.

Action: enable debug if present, load private marker fixture.

Expected result: logs may contain metadata such as file name and size, but not content markers.

PR007: no network upload.

Action: capture network while loading files and changing settings.

Expected result: no external requests and no upload.

---

U00 E Ink Effect Test Cases

---

Visual effects cannot be fully proven by DOM tests, but automation can verify state changes and manual inspection must verify quality.

INK001: full refresh on file load.

Expected result: E Ink classes or observable overlay appear briefly unless disabled/reduced. Overlay clears.

INK002: partial refresh on page turn.

Expected result: page turn triggers partial effect and ghost layer behavior if enabled.

INK003: full refresh on mode switch.

Expected result: mode switch uses full redraw behavior.

INK004: full refresh on font change.

Expected result: font change refreshes and re-layouts.

INK005: full refresh on theme change.

Expected result: theme change refreshes.

INK006: E Ink off.

Action: set effect off.

Expected result: no overlay, no ghosting, navigation still works.

INK007: E Ink reduced.

Expected result: reduced effect is subtle, ghosting low or absent.

INK008: E Ink strong.

Expected result: stronger effect appears but does not obscure content or stick.

INK009: reduced motion.

Expected result: no aggressive flashing in reduced-motion context.

INK010: rapid transitions.

Expected result: effect controller does not leave overlay stuck.

Manual visual checks must answer:

```text
Does the effect look like E Ink refresh rather than a generic fade?
Is ghosting subtle?
Is strong mode still safe and readable?
Is reduced mode comfortable?
Does the effect support reading instead of distracting from it?
```

---

V00 Offline, Vendor, And Metadata Test Cases

---

OFF001: no runtime external requests.

Action: run app with network capture.

Expected result: only local files load.

OFF002: offline mode.

Action: set browser offline after initial page load or serve locally with network disabled.

Expected result: app works with vendored scripts, fonts, textures, social image, RSS link if local.

OFF003: CSP enforcement.

Action: inspect CSP meta tag and attempt prohibited fetch from console if feasible.

Expected result: fetch blocked. App remains stable.

OFF004: vendor files exist.

Action: check expected vendor files and licenses.

Expected result: markdown-it, DOMPurify, fonts, licenses, and manifest exist.

OFF005: social image.

Expected result: social image exists at expected path, is 1200 x 630, and tags match dimensions.

OFF006: RSS feed.

Expected result: `feed.xml` exists, is valid XML, has RSS channel metadata, items are user-oriented, and head link points to it.

---

W00 Automation Design Notes For Later Implementation

---

The Playwright implementation should use data-driven test tables.

Each row should define:

```text
Test id.
Fixture.
Viewport.
Initial preference state.
Actions.
Expected primary result.
Expected surrounding checks.
Expected recovery if failure state is intentional.
```

The automated suite should have directories like:

```text
tests/playwright/smoke/
tests/playwright/files/
tests/playwright/markdown/
tests/playwright/settings/
tests/playwright/navigation/
tests/playwright/responsive/
tests/playwright/privacy/
tests/playwright/pairwise/
tests/playwright/journeys/
```

The suite must not import product source modules. The rendered DOM and browser behavior are the contract.

Prefer stable selectors first: IDs already present in the app, accessible roles, labels, and visible text. If selectors are unstable, the agent should add minimal `data-testid` attributes to product markup in a future implementation pass, then test through those hooks.

The test harness should provide helpers later, but this plan does not implement them.

Needed helpers:

```text
openApp(page)
openFixtureByFileInput(page, fixtureName)
dropFixture(page, fixtureName)
openSettings(page)
closeSettings(page)
setPreference(page, name, value)
expectReaderReady(page)
expectOpenScreenReady(page)
expectNoContentPersisted(page, markers)
expectNoUnexpectedNetwork(page)
expectNoCriticalConsoleErrors(page)
expectNoHorizontalOverflow(page)
expectNoStuckOverlay(page)
expectMode(page, mode)
expectTheme(page, theme)
expectProgressSane(page)
```

Each helper must report diagnosable errors. A failed test should say what user action failed and which surrounding invariant broke.

---

X00 Manual Execution Order

---

Run the manual plan in this order before automation:

```text
1. Smoke tests.
2. File input tests.
3. TXT rendering tests.
4. Markdown rendering and safety tests.
5. Page mode tests.
6. Scroll mode tests.
7. Settings open/close and persistence tests.
8. Single-setting boundary tests.
9. Pairwise seed matrix.
10. Generated pairwise matrix.
11. Responsive tests.
12. Accessibility tests.
13. Error recovery tests.
14. Privacy/storage tests.
15. E Ink visual tests.
16. Offline/vendor/social/RSS tests.
17. Persona journeys.
18. Final regression pass.
```

Do not skip smoke tests after fixing a deep bug. Smoke tests must remain the first safety net.

---

Y00 Exit Criteria

---

The manual test plan is complete when every feature has at least one direct test, every major setting has boundary tests, every high-risk interaction has pairwise coverage, every user persona has a journey, and every privacy/security constraint has a browser-verifiable check.

The application is ready for automated test implementation when:

```text
All required fixtures are specified.
Smoke tests are explicit.
Single-feature tests are explicit.
Single-setting boundary classes are explicit.
Pairwise factors are explicit.
Journey tests are explicit.
Expected surrounding-state oracle is explicit.
Error messages are specified.
Privacy checks are specified.
Responsive viewports are specified.
Manual visual E Ink checks are specified.
Playwright automation hooks are identified.
```

The later Playwright implementation should not improvise scope. It should implement this plan, then report which manual test cases are automated, which require manual visual inspection, and which are blocked by browser limitations.
