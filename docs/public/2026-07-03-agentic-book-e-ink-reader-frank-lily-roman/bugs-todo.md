# bugs-todo.md

Tracking file for application bugs surfaced by the automated UI regression suite
(`ui-regression-test-suite/`). Test-harness mismatches are NOT recorded here —
only genuine application defects and behaviors worth a product decision.

Status legend: `[ ]` open, `[x]` fixed/closed, `[~]` observation (not a bug).

---

## Summary

As of the gap-closure pass, **all 198 automated tests pass** and **no confirmed
application bugs were found**. Every failure encountered while writing the suite
was a test-harness mismatch (wrong marker, wrong locator, an incorrect
assumption about intended behavior, or an induced-condition console error), which
was corrected in the test code rather than the app.

The items below are minor behavioral observations recorded for a future product
review. They are not defects and none currently fail a test.

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

_None at this time._

When a real application bug is discovered:

```text
1. Keep the failing (or new) test that documents the expected behavior.
2. Add an item here: what fails, the reproducing test id, expected vs actual.
3. Fix the application code in a later pass, then flip the item to [x].
```
