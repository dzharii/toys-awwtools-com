2026-04-26T00:00:00-07:00

Request
Implement the approved plan for `suggestions015-1.md`, and re-read the original specification before implementation.

Intent
Add a bounded, user-triggered long right-button press copy probe for visible DOM text that is difficult to select or copy on hostile or awkward pages.

Problem
The extension did not provide a local point-based copy workflow for visible page text blocked by page selection styling, page event handlers, overlays, or fragmented DOM text.

Planned impact
Users can hold the right mouse button over visible DOM text, review the inferred text in an extension-owned overlay, and explicitly copy it without mutating page elements or sending/storing extracted text.

Tasks

* Re-read `suggestions015-1.md`.
* Add the long-press copy controller and all-frames bootstrap entry.
* Add the `longPressCopy.enabled` setting with default enabled.
* Update manifest and build entrypoints.
* Add focused unit and manifest/settings tests.
* Run `bun test` and `bun run build`.

Implementation
Added `src/content/long_press_copy.js` for gesture handling, bounded candidate discovery, text extraction, scoring, overlay rendering, clipboard writes, and cleanup. Added `src/content/long_press_copy_bootstrap.js` for settings-aware all-frames initialization. Updated `src/settings/settings_runtime.js`, `manifest.json`, and `build.js`. Added tests for candidate behavior, gesture non-interference, settings defaults, and manifest registration.

Rationale
The feature is implemented as a separate all-frames content entry so iframe-local extraction works without coupling it to the link-preview controller. The overlay uses extension-owned Shadow DOM and fixed positioning to avoid target element mutation. Copy remains explicit through a button click to avoid accidental clipboard writes when inference is imperfect.

Evidence
`bun test` passed: 267 tests, 0 failures. `bun run build` passed and reported 10 bundled entrypoints, 20 emitted files, 7 copied static trees, and verified all `dist/manifest.json` paths exist.

Limitations and risks
The first version does not perform OCR, canvas text extraction, cross-origin frame inspection, automatic copy on dwell, pseudo-element extraction, or broad native selection repair. Candidate scoring is intentionally conservative and may fail on some complex custom-rendered widgets.

Status
Done.

2026-04-26T21:52:54-07:00

Request
Refactor hotkey and keyboard shortcut handling to use `KeyboardEvent.code` instead of layout-dependent `KeyboardEvent.key`, auditing the minibuffer first and then the rest of the application.

Intent
Make physical keyboard shortcuts such as Alt-X work across keyboard layouts, including layouts where the physical key emits a different character through `KeyboardEvent.key`.

Problem
Several keyboard handlers matched shortcuts or control keys through `event.key` or `e.key`. Layout-dependent matching can break physical shortcuts, for example Alt-X on a Russian keyboard layout.

Planned impact
Shortcut and control-key matching uses MDN `KeyboardEvent.code` values such as `KeyX`, `KeyP`, `Enter`, `Escape`, `Tab`, `Space`, and arrow codes. Typed-character logic remains separate from shortcut matching.

Tasks

* Audit minibuffer keyboard handling first.
* Search the rest of `src/` and tests for `event.key`, `e.key`, and related keyboard shortcut checks.
* Replace physical shortcut and control-key checks with `event.code`.
* Update MultiBrowser combo normalization to derive reserved hotkey names from physical key codes.
* Add or adjust tests for code-based shortcut behavior.
* Run focused tests, full `bun test`, and `bun run build`.

Implementation
Updated `src/content/text_expander_minibuffer.js` so Alt-X uses `event.code === 'KeyX'`, and minibuffer Escape, Tab, Enter, and arrow handling uses `event.code`. Updated parent toolbar, hover bubble, long-press overlay, shared overlay, action dropdown, page content selection, command runtime dialogs, Mini web browser, shared URL picker, and MultiBrowser command palette/window handlers to use `event.code` for control-key handling. Updated `src/content/atools/multi-browser-v001/js/multi-browser-core.js` so reserved hotkey combos derive from physical codes like `KeyJ` rather than layout-dependent key text. Tightened text expander commit/cancel key normalization to use `event.code` for keydown commit boundaries. Updated tests in `tests/multi_browser_core.test.js` and `tests/ui_action_dropdown.test.js`.

Rationale
`KeyboardEvent.code` identifies the physical key position and is the right match source for shortcuts. The MultiBrowser implementation still exposes the same user-facing combo strings, but those strings are now normalized from code values rather than typed characters.

Evidence
Focused tests passed: `bun test tests/text_expander_minibuffer_model.test.js tests/multi_browser_core.test.js tests/ui_action_dropdown.test.js tests/text_expander_rules.test.js` reported 44 tests, 0 failures; `bun test tests/link_preview_parent_toolbar.test.js tests/long_press_copy.test.js tests/mini_web_browser_core.test.js` reported 30 tests, 0 failures. Full `bun test` passed: 287 tests, 0 failures, 787 expectations. `bun run build` passed and reported 10 bundled entrypoints, 20 emitted files, 7 copied static trees, and verified all `dist/manifest.json` paths exist.

Limitations and risks
No manual browser-layout verification was captured. The audit found no remaining `event.key` or `e.key` shortcut checks in application source outside unrelated object properties named `key`.

Status
Done.

2026-04-26T21:40:35-07:00

Request
Read `project_description-2-2026-04-26.md` and add optional URL or search-query parameter support to the minibuffer Mini web browser command, including prefix and suffix forms such as `tool-mini-browser google.com`, `google.com @tool-mini-browser`, and `seattle ramen @tool-mini-browser`.

Intent
Let the minibuffer open the Mini web browser directly on a typed destination or query while preserving the existing no-argument tool launch behavior.

Problem
`tool-mini-browser` was registered as a generic tool command with no parameter or suffix invocation metadata. It could open the tool shell, but it could not pass minibuffer text into the Mini web browser navigation flow.

Planned impact
The command can still open the Mini web browser with no parameters. When given text, hostname-like input resolves to HTTPS and non-URL text resolves through the Mini web browser search template before opening in the wrapper preview.

Tasks

* Read the current project description and command/minibuffer implementation.
* Add optional Mini web browser command metadata for a URL-or-search target.
* Support multi-word positional command text without changing other commands.
* Route prefix and suffix command input through the Mini web browser URL/search resolver.
* Update help text and tests.
* Run `bun test` and `bun run build`.

Implementation
Updated `src/content/link_preview_minibuffer_commands.js` so `tool-mini-browser` gets a command-specific optional `target` parameter and suffix invocation support when the Mini browser callback is available. The target is resolved with the shared `resolveNavigationInput` Mini web browser helper, using the active `miniWebBrowser.searchTemplate` from `src/content/link_preview_controller.js`. Updated `src/content/text_expander_minibuffer_model.js` with a scoped `consumeRest` positional parameter option so multi-word search text can resolve as one value. Updated `src/content/atools/minibuffer-help-v001/index.html` with the new examples. Added tests in `tests/link_preview_command_catalogs.test.js` and `tests/text_expander_minibuffer_model.test.js`.

Rationale
This keeps generic Open Tools command behavior unchanged and gives only the Mini web browser command the extra parameter contract it needs. Reusing the existing Mini web browser navigation resolver avoids duplicating URL versus search-query heuristics.

Evidence
Focused tests passed: `bun test tests/link_preview_command_catalogs.test.js` reported 16 tests, 0 failures; `bun test tests/text_expander_minibuffer_model.test.js` reported 18 tests, 0 failures. Full `bun test` passed: 286 tests, 0 failures, 786 expectations. `bun run build` passed and reported 10 bundled entrypoints, 20 emitted files, 7 copied static trees, and verified all `dist/manifest.json` paths exist.

Limitations and risks
No manual Chrome extension verification was captured. The command resolves typed searches before sending them to the wrapper preview, so search URL generation follows the configured Mini web browser search template at command execution time.

Status
Done.

2026-04-26T15:57:00-07:00

Request
Create `project_description-2-2026-04-26.md` as a separate, self-contained second version of the existing project description, leaving `project_description.md` unchanged.

Intent
Update the project-level context document so a large language model or new engineer can understand the current extension features, organization, important identifiers, settings, runtime actions, and tool surfaces after many codebase changes.

Problem
The original description is historically useful but stale. It omits newer implemented features such as long-press copy link actions, overlay blocking, reminders, URL picker, Mini web browser, MultiBrowser, Page Screenshot, Session Snapshot, and Page Content Select, and it references some old module structure that no longer matches the current source tree.

Planned impact
The new document should give a current high-level and file-level map without modifying the original file. It should describe the implemented feature set, source/build boundaries, important identifiers, settings keyPaths, runtime actions, storage names, and tests.

Tasks

* Read the existing `project_description.md`.
* Review the manifest, build script, settings schema, source tree, atool pages, service worker action routing, major content modules, and tests.
* Create `project_description-2-2026-04-26.md` as a self-contained updated document.
* Correct any stale path references found during review.
* Run `bun test` and `bun run build`.

Implementation
Added `project_description-2-2026-04-26.md` at the repository root. The document covers current runtime contexts, Bun build model, permissions, link preview, long-press copy, preview URL eligibility, toolbar actions, Open Tools, bookmarks, Text Expander/minibuffer, overlay blocking, reminders, URL picker, Mini web browser, MultiBrowser, Page Screenshot, Session Snapshot, Page Content Select, settings schema version 10, service worker actions, communication contracts, repository map, tests, storage identifiers, and security/privacy boundaries. The original `project_description.md` was not modified.

Rationale
A separate versioned file preserves the older description for comparison while giving current agents a single updated source of project context. The document stays high-level where possible but includes important identifiers and file responsibilities so it can support future implementation tasks without requiring a full rediscovery pass.

Evidence
`bun test` passed: 283 tests, 0 failures, 776 expectations. `bun run build` passed and reported 10 bundled entrypoints, 20 emitted files, 7 copied static trees, and verified all `dist/manifest.json` paths exist.

Limitations and risks
The document is based on source inspection and test/manifest structure, not manual browser verification of every UI tool. Generated `dist/` files were treated as build artifacts rather than hand-authored source.

Status
Done.

Request
Implement the planned fix for `suggestions015-2.md`, focused on the Long-press Copy Text overlay visual design.

Intent
Make the copy popover look like part of the existing extension UI while preserving the already-working long-press copy behavior.

Problem
The first overlay styling looked like a generic dialog, with mismatched spacing, controls, button treatment, typography, and highlight styling compared with the extension's floating toolbar and menus.

Planned impact
The copy overlay should use the same visual language as existing extension chrome: compact white surface, neutral border, soft shadow, 12px typography, compact controls, bounded preview content, and a softer associated highlight.

Tasks

* Re-read `suggestions015-2.md`.
* Rework overlay Shadow DOM styles and markup class names.
* Tune copy popover sizing and viewport placement.
* Add placement tests.
* Run `bun test` and `bun run build`.

Implementation
Updated `src/content/long_press_copy.js` to use parent-toolbar-like surface tokens, compact `lpc-` scoped controls, a subtle inset preview area, a lighter highlight style, and fixed popover sizing constants. Added tests in `tests/long_press_copy.test.js` for below-target, above-target, and edge-clamped popover placement.

Rationale
The change stays inside the feature's Shadow DOM to avoid coupling unrelated components while mirroring the existing `preview.css` toolbar and dropdown tokens. Behavior, settings, extraction, clipboard handling, privacy posture, manifest wiring, and build entrypoints were left unchanged.

Evidence
`bun test` passed: 270 tests, 0 failures. `bun run build` passed and reported 10 bundled entrypoints, 20 emitted files, 7 copied static trees, and verified all `dist/manifest.json` paths exist.

Limitations and risks
No browser screenshot verification was captured in this pass. The visual result should still be checked manually in Chrome on Hacker News or a similar dense page.

Status
Done.

2026-04-26T00:00:00-07:00

Request
Implement `suggestions001-1.md`, adding HTTPS-only link actions to Long-press Copy Text and applying the same eligibility boundary to the floating eye preview interaction.

Intent
Give users a deliberate right-click-hold way to preview or open eligible HTTPS links while preserving the long-press feature as a copy-first text affordance.

Problem
The long-press overlay only exposed Copy, and preview link eligibility was not centralized around a resolved HTTPS-only rule. Relative links, hash-only links, and non-HTTPS schemes needed consistent handling before preview UI appeared.

Planned impact
Eligible HTTPS anchors can show Preview, New tab, and Copy in the long-press overlay when the new interaction setting allows it. Non-HTTPS, invalid, empty, and hash-only links remain copy-only and do not show the floating eye.

Tasks

* Add shared HTTPS preview URL resolution and interaction gating helpers.
* Reuse the shared helper from floating eye eligibility and long-press link action discovery.
* Add the `linkPreview.openingInteraction` settings option with three modes.
* Add Preview and New tab buttons to the long-press overlay for validated HTTPS links.
* Add resolver, long-press, and settings tests.
* Run `bun test` and `bun run build`.

Implementation
Added `src/content/preview_url_eligibility.js` with URL resolution, hash-only rejection, HTTPS-only validation, stable reason codes, and interaction mode helpers. Updated `src/content/link_preview_controller.js` to use the shared resolver for hover eligibility and to handle long-press preview requests through the same preview hosting plan used by the eye. Updated `src/content/long_press_copy.js` and `src/content/long_press_copy_bootstrap.js` to attach validated `linkAction.url` metadata, render conditional Preview and New tab controls, and apply settings gating. Updated `src/settings/settings_runtime.js` with schema version 10 and the new setting.

Rationale
The shared resolver avoids duplicating scheme checks and resolves raw hrefs against the correct document base before applying the product safety rule. The long-press module captures only the resolved HTTPS URL needed for actions, while preview opening stays in the link preview controller.

Evidence
`bun test` passed: 283 tests, 0 failures. `bun run build` passed and reported 10 bundled entrypoints, 20 emitted files, 7 copied static trees, and verified all `dist/manifest.json` paths exist.

Limitations and risks
No browser screenshot or manual Chrome verification was captured in this pass. Long-press preview requests from subframes are currently handled only where the link preview controller is present; iframe-local long-press copy and new-tab opening still use the captured resolved URL.

Status
Done.
