# bugs-todo.md

Tracking file for application bugs surfaced by the automated UI regression suite
(`ui-regression-test-suite/`). Test-harness mismatches are NOT recorded here —
only genuine application defects and behaviors worth a product decision.

Status legend: `[ ]` open, `[x]` fixed/closed, `[~]` observation (not a bug).

---

## Summary

The gap-closure automated suite (198 tests) passes. A subsequent **Agentic UI
Regression Analysis** run (25 randomly-sampled tests, seed `20260703`, with
per-step screenshots and layout snapshots) surfaced **two genuine application
defects by visual/usability review** even though every test was green — a
paged-mode column bleed (F002, high) and missing disabled-state styling on the
navigation buttons (F001, medium). Both are now fixed and covered by regression
assertions; see **Confirmed bugs** below.

Every failure encountered while *writing* the suite was a test-harness mismatch
(wrong marker, wrong locator, an incorrect assumption about intended behavior,
or an induced-condition console error), which was corrected in the test code
rather than the app. The items under **Observations** are minor behaviors
recorded for a future product review; they are not defects and none fail a test.

---

## Observations (not bugs)

- [~] **Reset clears the preferences key instead of persisting defaults.**
  `resetPreferences()` (js/app.js) calls `clearPreferences()`, which does
  `localStorage.removeItem(STORAGE_KEY)`. Defaults are applied live in memory and
  a "Preferences were reset." toast is shown, but nothing is re-persisted until
  the next change. Result: after a reset + reload, the boot path takes the
  "defaults" branch (no "Preferences were restored" notice). This is internally
  consistent and privacy-friendly, but if the product intends reset to *persist*
  an explicit default profile, this would need to change. Test `ST005` asserts
  the current (clearing) behavior.

- [~] **`links.md` fixture records a marker that lives inside a URL.**
  The fixture descriptor for `links` uses `FIXTURE_LINKS_EXTERNAL`, which appears
  only inside a link `href`, not in visible text. This is a fixture bookkeeping
  detail (fine for the storage `assertNoContent` check, not for visible-text
  waits) and is handled in the specs by waiting on a visible marker
  (`FIXTURE_LINKS_END`, now listed first). No app impact.

- [~] **Settings scrim is not reachable on phone-width viewports.**
  The settings drawer is `width: min(380px, 100%)` (css/settings.css), so on
  viewports at or below ~390px it effectively fills the screen and the scrim
  strip behind it cannot be clicked. This is the intended full-sheet mobile
  pattern; the close button and Escape remain the affordances. The responsive
  settings spec only exercises scrim-close on viewports ≥ 500px wide and tests
  close-button/Escape everywhere. No app change needed.

- [~] **A missing font logs an expected `net::ERR_FAILED` console error.**
  When a font request fails (e.g. offline or an aborted asset), the browser logs
  a resource-load error. The app handles this gracefully — `font-display: swap`
  keeps text visible and `_ensureReaderFontLoaded()` races a 1200 ms timeout so a
  missing font never hangs pagination (js/app.js). The resilience specs allow
  this induced console error via the oracle's `allowConsoleError` option; it is
  not an app fault.

---

## Confirmed bugs

- [x] **F002 (high) — Paged mode: next column's text bled into the right margin.**
  Reproduced by the Agentic Analysis run (seed `20260703`) on paged tests
  EINK-001, NAV-006, TXT-008, FILE-005. When the reading measure was narrower
  than the viewport, the page columns were centered but the fixed `COLUMN_GAP`
  (48px) was smaller than the right-side slack `(viewportWidth - pageWidth)/2`,
  so the start of the next page column peeked into the visible clip region on
  the right. Absent when the measure ≈ viewport (mobile, font-missing fallback),
  which confirmed the mechanism.
  - Expected: only one page column is ever inside the clip region.
  - Fix: `js/paginator.js` `measure()` now uses
    `columnGap = Math.max(COLUMN_GAP, Math.ceil(vpW - pageWidth))` for the CSS
    column gap, the page stride, and the page count, guaranteeing
    `pageStride >= viewportWidth` so adjacent columns can never co-appear.
  - Regression guard: the Standard Post-Action Oracle now asserts
    `paginator.pageStride >= viewport.clientWidth` on every paged step where
    `pageCount > 1` (`src/framework/support/oracle.ts`), backed by the read-only
    `window.__einkReader.paginator` handle.

- [x] **F001 (medium) — Disabled Prev/Next nav buttons looked active.**
  At the first/last page the Prev/Next buttons were functionally disabled
  (`disabled` attribute set, `isEnabled()` false) but rendered with identical
  active styling — no muted state — so a reader could tap a dead-looking-active
  control. Surfaced by reviewing NAV/EINK boundary screenshots in the agentic
  run.
  - Expected: a disabled nav control is visibly muted and not hover-reactive.
  - Fix: `css/reader.css` adds an `.icon-button:disabled` / `[disabled]` rule
    (opacity `0.38`, `cursor: default`) plus a disabled-hover reset. Family-level
    fix covering all icon-buttons.
  - Regression guard: navigation specs `R005` (first page) and `R006` (last
    page) now assert the disabled button's computed opacity is `< 1` while the
    still-active button stays fully opaque (`reader.page.ts navButtonOpacity`).

_All confirmed bugs above are fixed and covered by regression assertions._

When a real application bug is discovered:

```text
1. Keep the failing (or new) test that documents the expected behavior.
2. Add an item here: what fails, the reproducing test id, expected vs actual.
3. Fix the application code in a later pass, then flip the item to [x].
```
