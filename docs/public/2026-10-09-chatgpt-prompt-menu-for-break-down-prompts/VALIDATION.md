# Validation

Verified October 10, 2026 against the rebuilt, self-contained `index.html`.

## Live-preview and clone revision

`node build.mjs` completed. The combined Node run passed all 32 tests, zero failures:

```powershell
node --test tests\core.test.cjs tests\static.test.cjs tests\interaction.test.cjs tests\browser.test.cjs
```

The core suite still covers all 2,187 categorical setting combinations, complete code requirements, literal input, preset semantics, malformed imports, and full example consistency. Added checks reconstruct both old and new text from the word diff, including repeated tokens, whitespace, 300 deterministic randomized pairs, and a large bounded-fallback replacement. Workspace checks cover clone/preference validation and migration of legacy manual output.

The minimal-DOM event-flow suite checks generation, clone preservation, opt-in storage, restoration/removal, invalid/oversized/valid imports, blocked storage, clipboard fallback, empty assignment, and reset. These are logic checks, not substitutes for browser rendering.

The real Playwright Chromium suite uses the installed global Playwright 1.61.1 and bundled Chromium. It starts a loopback server on an ephemeral port, verifies the delivered HTML, and closes browser/server afterward. It covers:

- Exact synchronization of both read-only views and the pure builder; every radio, checkbox, and assignment/context/special-instructions widget.
- Latest-change feedback, readable removed/replaced paragraph context, highlight disabling, large text, follow-scroll disabling, reduced-motion behavior, and preserved text selection.
- Pointer dragging and corner resizing; keyboard movement and all eight edge/corner resizers; viewport bounds; maximize/restore; docking; vertical collapse/expand; Escape focus recovery.
- Auto-hiding beside the bottom textarea, return on scrolling upward, focus-safe suppression, and the preference to disable auto-hiding.
- Multiple independent clones across settings/preset/reset/import; append-only imported clones; names, timestamps, confirmed/canceled deletion, and focus recovery.
- Actual clipboard writes (Windows clipboard CRLF normalized for comparison), permission-denial/manual-selection fallback, and exact downloaded generated/clone text.
- Opt-in saving, persisted drafts/preferences, legacy manual-edit recovery, invalid-import atomicity, quota failures, export/dirty-draft navigation warnings, empty generated assignments, and empty authored drafts.
- Direct `file:` operation, native radio arrow-key selection, and no horizontal overflow at 1920, 1280, 1100, 1024, 768, 390, and 320 pixels; an explicitly opened preview in a 900 x 360 short viewport.

## Whole-page visual review

All seven original screenshots were inspected using an ImageMagick contact sheet. Real pre-change desktop/mobile full-page screenshots were captured and reviewed before implementation. The review identified Why-first connectors crossing node interiors, cramped Trace-first arrows, off-baseline heading icons, and the floating jump link covering mobile headings.

The new full-page screenshots were inspected at all seven widths, not just cropped around the new preview. Assignment, all three explanation cards, every tuning row, visual/code options, illustration contract, focus/exclusion lists, special instructions, generated output, storage controls, clone editors, navigation, and footer were reviewed together. Detailed screenshots cover structure changes and removal context, resized preview, bottom auto-hide, populated clones, expanded mobile preview, short windows, and literal special instructions.

Meaningful follow-up issues were recorded and fixed: 320-pixel header/card-label crowding, fragmented removal context, and inaccurate counts caused by joining separated changed words. Minor pixel-level differences were intentionally not treated as defects.

Screenshot artifacts for this phase are in the current Copilot session's `files\ui-review` directory, with baseline images and `reference-sheet.png` beside it. They are not runtime assets or strict pixel-equality goldens. To capture another run, set `PROMPT_MENU_SCREENSHOTS` to a directory before running the browser suite.

## Preset tile revision

The combined suite passed all 36 tests after replacing the dropdown, including the original preview/clone regressions. Added browser checks prove that hover and focus only preview, native keyboard/selection applies the correct configuration, context and clones survive, Custom settings keeps the current mix, and opt-in restoration preserves the checked tile. Core validation rejects a named selected preset that disagrees with its actual settings.

Real touch emulation exercises tap selection and phone-local inline details. Three additional test-only preset definitions bring the list to seven tiles, demonstrating automatic generation, wrapping, readable descriptions, and no horizontal overflow. No extra canned presets are shipped.

Two layout experiments were captured and visually compared at desktop and phone sizes: a wrapping grid with menu-local detail panel versus a horizontal strip with details below. The strip hid choices, including Custom settings on desktop and nearly all alternatives on a phone, so it was discarded. The final grid uses a right-hand panel at wide menu-container sizes, a below-grid panel at medium sizes, and an inline panel after the inspected tile on small phones. This third refinement keeps touch details nearby. A minimum wide-panel height prevents routine hover previews shifting the assignment below.

The entire page was captured again at all seven widths after the preset change. Whole-page and detail screenshots are in `files\preset-final`; layout experiments are `preset-grid-*.png` and `preset-strip-*.png` beside that directory. The selected/hovered states, old/new SVGs, narrow labels, all original widgets, live window, generated prompt, and clone area remain part of the review, not just the new preset section.

The 1280-pixel whole-page review also identified an unnecessarily crowded three-column preset row. Increasing the flexible tile minimum to 260 pixels keeps that layout comfortably two-column without hard-coding a tile count; phones still use a single full-width tile column.

## Packaging and limits

Static checks confirm exact embedded local CSS/JavaScript, valid script syntax, unique static IDs, all script targets and SVG symbol references, no external runtime dependencies/request APIs, and unchanged full example/configuration pairs.

The absolute-final requirements audit is recorded in `CHANGE_REQUEST.md`. The original `SPECIFICATION.md` is retained unchanged as the historical baseline; the two session change requests explicitly supersede its obsolete editing/layout/browser-validation statements and become immutable upon completion.

This is Chromium-based desktop/headless verification with emulated viewports, not certification across Safari/Firefox, physical touch devices, operating-system save dialogs, all browser zoom levels, or assistive technologies. No model is called; response quality and future generated C correctness are not measured. The original screenshots remain design guidance, not a requirement for pixel-identical reproduction.

## Social preview and Toys publication

The supplied title, descriptions, and accessible artwork descriptions from `prompt_menu_social_site/index.html` are integrated into the maintained template and rebuilt application. Open Graph uses `og-1200x630.png`; X/Twitter uses `x-1200x600.png`. Metadata targets the dated project URL on `https://toys.awwtools.com`, with absolute image URLs. The remaining supplied images are retained as alternate artwork.

The combined suite passes 37 tests. The new static regression verifies supplied metadata parity, canonical/OG URLs, actual PNG dimensions, and absence of placeholder URLs in the application. The publishing guide in `docs/AGENTS.md` was followed: the project is listed once under Toys, its README and application preview links exist, and its RSS item retains October 9, 2026 at noon GMT. Aromacop's directory link and RSS title both include `2026-10-09`.

Directory validation found zero missing local hrefs and zero invalid application-preview targets. RSS XML parses, all 145 directory projects have matching item counts, chronological ordering is preserved, and `lastBuildDate` remains the latest publication date. A real Chromium check against a temporary local server confirmed that hovering the new entry loads its README and functioning application, and both social images return PNG content at their published paths. No deployment or remote social-crawler cache refresh was performed.
