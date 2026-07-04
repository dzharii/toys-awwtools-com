2026-07-04
---

A00 Mobile Page Swipe And RSS Date/Limit Change Request

---

Implement two changes.

First, add mobile page-turn swipe gestures in page mode only. A deliberate right-to-left swipe should go to the next page. A deliberate left-to-right swipe should go to the previous page if a previous page exists. Swipe page turns must be disabled in scroll mode.

Second, fix RSS update behavior. RSS item publication dates must not be future-dated. The agent must use the current date when adding RSS entries. The home screen updates panel must display only the latest 10 RSS items.

These changes must include UI regression tests. The agent must update or add Playwright tests for swipe behavior, keyboard left/right page navigation, scroll-mode non-swipe behavior, RSS date correctness, and RSS display limit. After implementation, run targeted tests and then the full UI regression suite.

---

B00 Screenshot Observations

---

The mobile screenshot shows that the reader is usable on a phone, but page navigation depends on bottom controls and keyboard-like previous/next buttons. A mobile user expects to move between pages with a horizontal swipe, especially when reading page-mode content.

The same screenshot also shows a dense mobile header with Close, title, Open, and Settings. Do not make the header more crowded for this change. Swipe must be implemented through the reader content surface, not by adding more visible controls.

The page content is in page mode. The bottom bar already has Prev and Next. Swipe should trigger the same page navigation logic as those controls, not a separate navigation path.

---

C00 Gesture Technology Decision

---

Use Pointer Events as the primary implementation.

Pointer Events are designed as a unified event model for pointing devices such as mouse, pen, and touch. That makes them preferable to adding separate touch and mouse handlers.

Use CSS `touch-action` carefully. `touch-action` tells the browser what native touch manipulations are allowed on an element. It is the correct place to avoid fighting the browser's scroll and zoom behavior.

Do not add a gesture library. This project is static, dependency-conscious, and already avoids unnecessary runtime dependencies. A deliberate horizontal swipe can be implemented with a small local module.

Do not use `preventDefault()` broadly on touch or pointer events. That can harm scrolling, selection, and browser gestures. Only suppress default behavior when a deliberate page-turn swipe has clearly been recognized and when suppression is necessary. Browser guidance around touch handling emphasizes care with default behavior because touch handling can affect scroll and generated click behavior.

---

D00 Swipe Availability Rules

---

Swipe page turning is available only when all of these are true:

```text id="jguxav"
The app is in reader state.
A document is loaded.
Reader mode is paged.
The viewport is mobile-sized or the input pointer type is touch.
Settings panel is closed.
No blocking notice, file-open action, or modal overlay is active.
No file read, parse, pagination, or E Ink transition is currently busy.
The pointer starts inside the page reading surface.
The pointer starts outside interactive controls, links, form controls, code-block horizontal scroll areas, and the reader header/footer controls.
```

Swipe page turning is disabled when any of these are true:

```text id="z5jbp6"
Reader mode is scroll.
Open screen is visible.
Settings panel is open.
The user starts on Close, Open, Settings, Prev, Next, RSS link, update link, or any form control.
The user starts inside a code block that can scroll horizontally.
The gesture is multi-touch.
The movement is mostly vertical.
The movement is too short.
The gesture takes too long.
The gesture is a text-selection-like drag.
The page is already at the boundary and the swipe would go past first or last page.
```

This must be implemented as product behavior, not only as test behavior.

---

E00 Swipe Threshold Definition

---

Use conservative thresholds to avoid accidental page turns.

A swipe is accepted only if all threshold checks pass.

Recommended initial constants:

```js id="xif19l"
const SWIPE_MIN_DISTANCE_PX = 96;
const SWIPE_MIN_DISTANCE_VIEWPORT_RATIO = 0.22;
const SWIPE_MAX_VERTICAL_DISTANCE_PX = 55;
const SWIPE_MAX_VERTICAL_TO_HORIZONTAL_RATIO = 0.45;
const SWIPE_MAX_DURATION_MS = 900;
const SWIPE_MIN_DURATION_MS = 80;
const SWIPE_MAX_START_EDGE_GUTTER_PX = 0;
```

Effective minimum distance:

```js id="itft8c"
const minDistance = Math.max(
  SWIPE_MIN_DISTANCE_PX,
  window.innerWidth * SWIPE_MIN_DISTANCE_VIEWPORT_RATIO
);
```

On a 390px-wide phone, `0.22` of the viewport is about 86px, so the fixed 96px threshold wins. On a wider mobile screen, the ratio scales upward. This makes the gesture deliberate.

Accepted next-page swipe:

```text id="dykylh"
deltaX <= -minDistance
abs(deltaY) <= 55
abs(deltaY) / abs(deltaX) <= 0.45
80ms <= duration <= 900ms
```

Accepted previous-page swipe:

```text id="a6y2nw"
deltaX >= minDistance
abs(deltaY) <= 55
abs(deltaY) / abs(deltaX) <= 0.45
80ms <= duration <= 900ms
```

Rejected gestures:

```text id="i3iajj"
30px horizontal movement: too short.
80px horizontal on 390px viewport: too short if fixed threshold is 96px.
120px horizontal with 90px vertical: too diagonal/vertical.
120px horizontal over 1800ms: too slow; likely drag or selection.
Two-finger gesture: reject.
Gesture starting on a button/link/input/code scroll area: reject.
Gesture in scroll mode: reject.
```

These thresholds are intentionally stricter than many generic swipe tutorials. Some generic guides use about 30px to 50px as a swipe threshold, but this reader should avoid accidental page turns during text interaction, so a longer threshold is the right product decision. The web platform references support the event model and scroll-control mechanism; the exact threshold is a product choice and must be tuned by testing.

---

F00 Swipe Gesture State Machine

---

Create a small swipe controller module.

Suggested file:

```text id="bfyqto"
js/page-swipe.js
```

Suggested state:

```js id="490hgn"
const swipeState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  startTime: 0,
  targetAllowed: false,
  canceled: false
};
```

Pointer down behavior:

```text id="qyayf4"
Ignore if not page mode.
Ignore if settings is open.
Ignore if busy or transition active.
Ignore if pointer is not primary.
Ignore if multi-touch-like state exists.
Ignore if target is interactive.
Ignore if target is inside a code block or element with horizontal scroll.
Record pointerId, startX, startY, startTime.
Call setPointerCapture if appropriate and safe.
Do not navigate.
Do not prevent default yet.
```

Pointer move behavior:

```text id="16o410"
Update lastX and lastY.
If movement is mostly vertical, mark canceled and release gesture.
If movement starts from an excluded target, remain canceled.
Do not turn page on pointermove.
Avoid preventDefault until the gesture is clearly horizontal and accepted.
```

Pointer up behavior:

```text id="e6e9uy"
Compute deltaX, deltaY, absX, absY, duration.
Reject if thresholds fail.
Reject if mode is no longer paged.
Reject if busy or settings became open.
If deltaX is negative and next page exists, call the same nextPage action used by Next button.
If deltaX is positive and previous page exists, call the same previousPage action used by Prev button.
Release pointer capture.
Reset state.
```

Pointer cancel behavior:

```text id="iucjpo"
Reset state.
Release pointer capture if held.
Do not navigate.
```

The swipe controller must call the existing page navigation functions. Do not duplicate page index manipulation inside swipe code.

---

G00 Target Exclusion Rules

---

Do not start a page-turn swipe from interactive or scroll-sensitive elements.

Create helper:

```js id="f3c0td"
function isSwipeExcludedTarget(target) {
  return Boolean(target.closest(`
    button,
    a,
    input,
    select,
    textarea,
    label,
    [role="button"],
    [role="link"],
    [contenteditable="true"],
    pre,
    code,
    .code-block,
    .reader__bar,
    .reader__footer,
    .settings,
    .toast,
    .notice
  `));
}
```

Adjust class names to current source.

Code blocks need special care. Roman uses code-heavy Markdown on mobile. If a code block scrolls horizontally, a horizontal gesture inside it should scroll the code block, not turn the page.

If the implementation adds line numbers or code-block wrappers later, update this exclusion helper to include those wrappers.

---

H00 CSS Touch Behavior

---

Do not globally disable touch behavior.

Recommended CSS:

```css id="6b2lk8"
.reader[data-mode="paged"] .reader__stage,
.reader[data-mode="paged"] .page-viewport {
  touch-action: pan-y pinch-zoom;
}

.reader[data-mode="scroll"] .reader__stage,
.reader[data-mode="scroll"] .reader__scroll {
  touch-action: pan-y pinch-zoom;
}

.reader pre,
.reader code,
.reader .code-block {
  touch-action: pan-x pan-y;
}
```

The exact CSS must be tested on mobile. The goal is:

```text id="pesv6y"
Vertical scrolling remains natural where vertical scrolling exists.
Pinch zoom is not unnecessarily blocked.
Code blocks can still be interacted with.
Horizontal page swipe can be detected in page mode.
Scroll mode remains normal scroll mode.
```

If `touch-action: pan-y` prevents the app from receiving horizontal pointer movement in some mobile browser, the agent must research and choose the least harmful alternative. Do not disable all touch behavior unless there is no other reliable solution.

---

I00 Boundary Behavior

---

At first page:

```text id="losytq"
Left-to-right previous-page swipe does nothing.
Prev button state remains consistent.
No error is shown.
No page index becomes negative.
Optional: a tiny no-op feedback may occur, but it must not be distracting.
```

At last page:

```text id="sj7o3j"
Right-to-left next-page swipe does nothing.
Next button state remains consistent.
No error is shown.
No page index exceeds page count.
```

During E Ink transition:

```text id="0lun55"
Ignore new swipe gestures until transition settles, or queue nothing.
Do not allow rapid swipes to corrupt page state.
```

After viewport change:

```text id="xve94b"
Swipe still works if mode remains paged and viewport remains mobile.
If viewport becomes desktop, swipe can remain available for touch pointer devices, but should not interfere with mouse drag selection.
```

---

J00 Keyboard Navigation Tests

---

Add or strengthen keyboard tests for previous and next page.

Required keys:

```text id="u18g7r"
ArrowRight: next page in page mode.
ArrowLeft: previous page in page mode.
PageDown: next page in page mode or natural scroll in scroll mode.
PageUp: previous page in page mode or natural scroll in scroll mode.
Space: next page in page mode when not focused on a form control.
Shift+Space: previous page in page mode when not focused on a form control.
```

The user explicitly requested left and right keyboard tests. At minimum, implement ArrowRight and ArrowLeft tests now. Add PageUp/PageDown/Space coverage if missing.

---

K00 Swipe Regression Test Requirements

---

Add UI regression tests for mobile swipe.

Suggested test file:

```text id="ipt3sk"
ui-regression-test-suite/src/specs/navigation/mobile-swipe.spec.ts
```

Add page object helper:

```text id="f7kezw"
ReaderPage.swipePageLeft()
ReaderPage.swipePageRight()
ReaderPage.shortSwipeLeft()
ReaderPage.diagonalSwipe()
ReaderPage.swipeInsideCodeBlock()
```

Use Playwright touchscreen or pointer events. If real touch simulation is unreliable in the environment, use `page.dispatchEvent()` with pointer events and document the limitation. Prefer actual browser-like interaction where practical.

Test SWIPE001: right-to-left swipe goes to next page in page mode.

Steps:

```text id="m9s74p"
Set mobile viewport.
Open long-book.txt.
Ensure mode is paged.
Capture progress.
Perform deliberate right-to-left swipe across the reader content surface.
```

Expected result:

```text id="mpu1d5"
Page advances.
Progress changes from Page 1 to Page 2 or equivalent.
No horizontal overflow.
No stuck E Ink overlay.
Standard oracle passes.
```

Test SWIPE002: left-to-right swipe goes to previous page in page mode.

Steps:

```text id="jubpei"
Set mobile viewport.
Open long-book.txt.
Navigate to page 2 using Next button or ArrowRight.
Perform deliberate left-to-right swipe across the reader content surface.
```

Expected result:

```text id="kco5qs"
Page goes back to page 1 or previous valid page.
Progress updates.
No invalid page index.
```

Test SWIPE003: short swipe does not turn page.

Steps:

```text id="4kqxf7"
Set mobile viewport.
Open long-book.txt.
Capture progress.
Perform horizontal movement below threshold, for example 40px.
```

Expected result:

```text id="5f16os"
Progress does not change.
No error.
No stuck overlay.
```

Test SWIPE004: diagonal/vertical movement does not turn page.

Steps:

```text id="tsjs78"
Set mobile viewport.
Open long-book.txt.
Capture progress.
Perform movement with vertical distance larger than allowed ratio.
```

Expected result:

```text id="5s5bwi"
Progress does not change.
This protects scroll-like gestures.
```

Test SWIPE005: swipe disabled in scroll mode.

Steps:

```text id="8gj6u0"
Set mobile viewport.
Open long-book.txt.
Switch to scroll mode.
Capture scroll position and any progress.
Perform deliberate horizontal swipe across content.
```

Expected result:

```text id="ahymee"
No page navigation occurs.
Mode remains scroll.
Normal scroll behavior is not broken.
```

Test SWIPE006: swipe starting on button does not turn page.

Steps:

```text id="nc6vff"
Set mobile viewport.
Open long-book.txt.
Start swipe gesture on Next, Prev, Close, Open, or Settings button.
```

Expected result:

```text id="bzylt0"
Gesture does not trigger an extra page turn.
Button behavior remains normal if tapped.
```

Test SWIPE007: swipe inside code block does not turn page.

Steps:

```text id="6aypi5"
Set mobile viewport.
Open code-heavy Roman fixture in page mode.
Find code block.
Perform horizontal swipe starting inside code block.
```

Expected result:

```text id="kfzwag"
No page turn occurs.
Code block interaction remains safe.
```

Test SWIPE008: boundary swipe at first page.

Steps:

```text id="ov5fo8"
Set mobile viewport.
Open long-book.txt on first page.
Swipe left-to-right.
```

Expected result:

```text id="g4rc88"
Still on first page.
No error.
Prev state remains disabled if button states exist.
```

Test SWIPE009: boundary swipe at last page.

Steps:

```text id="da7zxx"
Set mobile viewport.
Open short multi-page fixture or navigate to last page.
Swipe right-to-left.
```

Expected result:

```text id="gh8siv"
Still on last page.
No error.
Next state remains disabled if button states exist.
```

Test SWIPE010: rapid swipes do not corrupt page state.

Steps:

```text id="k42m5e"
Set mobile viewport.
Open long-book.txt.
Perform three deliberate next-page swipes with short waits.
```

Expected result:

```text id="q63wap"
Page index remains valid.
No overlay stuck.
No skipped invalid state.
```

---

L00 Keyboard Regression Tests

---

Add or strengthen:

```text id="0xv8h4"
ui-regression-test-suite/src/specs/navigation/keyboard-page-navigation.spec.ts
```

Test KEYLEFT001: ArrowRight advances page.

Expected:

```text id="plfhl8"
Progress changes forward.
```

Test KEYLEFT002: ArrowLeft returns to previous page.

Expected:

```text id="bzlqt1"
Progress changes backward.
```

Test KEYLEFT003: ArrowLeft on first page is safe no-op.

Expected:

```text id="ipy32i"
Progress remains first page.
No error.
```

Test KEYLEFT004: ArrowRight on last page is safe no-op.

Expected:

```text id="e71j6f"
Progress remains last page.
No error.
```

Test KEYLEFT005: Arrow keys do not turn page while settings control is focused.

Expected:

```text id="pthywq"
Focused setting control behaves normally.
Reader page does not change unexpectedly.
```

---

M00 RSS Date Rules

---

RSS entries must not be future-dated.

When the agent adds or updates RSS items, it must use the current actual date/time at implementation time.

Do not hardcode future dates.

Do not invent dates.

Do not copy example dates from specifications.

The RSS 2.0 specification uses `pubDate` and `lastBuildDate` date-time strings, and the RSS Advisory Board examples show RFC 822-style date strings such as `Sun, 29 Jan 2007 17:17:44 GMT`.

Implementation rule:

```text id="i7uhq9"
Before editing feed.xml, get the current local date/time from the system.
Use that date/time for the new item's pubDate.
Set channel lastBuildDate to the newest item pubDate.
Ensure no item pubDate is later than the current system time.
```

Preferred script behavior if feed updates are scripted:

```js id="9dhbps"
const now = new Date();
const pubDate = now.toUTCString();
```

Manual editing behavior:

```text id="268feg"
Run a date command or otherwise inspect the current system date.
Use the current date.
Do not use future sample dates.
```

---

N00 RSS Home Screen Limit

---

The home screen updates section must display at most 10 items.

Rule:

```text id="vrscri"
Sort RSS items by pubDate descending when valid.
If pubDate is missing or invalid, keep document order after dated items.
Render the latest 10 items.
Do not render item 11 or beyond on the home screen.
Keep feed.xml itself complete; the display limit is only for the home screen.
```

If there are fewer than 10 items, display all available items.

If there are zero items, show the empty state.

If some items are future-dated because of old feed mistakes, fix the feed dates. Do not rely only on the UI to hide the problem. Add tests to catch future dates.

Optional defensive behavior:

```text id="3kq92l"
If an RSS item has a pubDate in the future, the UI may still display it after sorting if it exists in feed.xml, but the feed validation test must fail. Preferred: feed.xml must be corrected so no future dates exist.
```

---

O00 RSS Date And Limit Tests

---

Add or extend:

```text id="1wxuzr"
ui-regression-test-suite/src/specs/rss/rss.spec.ts
ui-regression-test-suite/src/specs/rss/home-updates.spec.ts
```

Test RSSDATE001: no feed item is future-dated.

Steps:

```text id="7n9yiz"
Read feed.xml.
Parse every item pubDate.
Compare to current system time.
```

Expected result:

```text id="zq67fs"
Every valid pubDate is less than or equal to now plus a small tolerance.
Suggested tolerance: 5 minutes for clock differences.
```

Test RSSDATE002: lastBuildDate is not future-dated.

Expected:

```text id="2c0a58"
channel lastBuildDate is less than or equal to now plus tolerance.
```

Test RSSDATE003: lastBuildDate matches latest item date or is not older than latest item.

Expected:

```text id="0ixiv5"
lastBuildDate is equal to or later than the newest item pubDate.
It is not future-dated.
```

Test RSSHOME009: home screen displays at most 10 updates.

Steps:

```text id="mw3ec9"
Route or create a test feed with 12 valid items.
Open home screen.
Wait for updates panel.
Count visible update items.
```

Expected:

```text id="2js3vs"
Exactly 10 update items are visible.
The two oldest items are not visible.
```

Test RSSHOME010: home screen displays latest 10 by date.

Steps:

```text id="sptqoa"
Use a test feed with 12 items with known dates in shuffled document order.
Open home screen.
Read visible update titles.
```

Expected:

```text id="61losv"
The 10 newest items are displayed.
They are ordered newest to oldest.
Older item 11 and 12 are not displayed.
```

Test RSSHOME011: feed with fewer than 10 items.

Expected:

```text id="t2jvnc"
All available items are displayed.
No empty state is shown.
```

---

P00 AGENTS.md RSS Appendix Update

---

Add this text to the RSS workflow section in `AGENTS.md`.

````md id="q5t8uq"
---

RSS Date And Home Display Rules

---

When updating `feed.xml`, always use the current actual date and time for the new item's `pubDate`. Do not use example dates, future dates, or dates copied from prior specifications.

Before editing the feed, check the current system date. For scripted updates, use `new Date().toUTCString()` or an equivalent current-time source. RSS dates must be RFC 822-style date-time strings.

After adding a feed item:

```text
1. Set the item's pubDate to the current actual date/time.
2. Set channel lastBuildDate to the newest item date.
3. Verify no item pubDate is in the future.
4. Verify channel lastBuildDate is not in the future.
5. Validate that feed.xml is still well-formed RSS 2.0.
6. Run RSS regression tests.
````

The home screen updates panel displays only the latest 10 RSS items. Keep `feed.xml` complete, but limit the in-app updates list to 10 items after sorting by publication date descending.

If a future-dated RSS item is discovered, fix the feed. Do not hide the issue only in the UI.

````

---

Q00 Regression Suite Run Requirement

---

After implementing swipe and RSS changes, run:

```text id="5re1rc"
cd ui-regression-test-suite
bun run typecheck
bun run test:navigation
bun run test:responsive
bun run test:accessibility
bun run test:rss
bun run test:journeys
bun run validate
````

If swipe tests are flaky, investigate whether the flakiness reflects product gesture instability or test simulation instability. Do not weaken tests blindly. Product correctness and mobile usability are the priority.

If RSS date tests fail because the current feed has future dates, fix the feed.

If home screen RSS limit tests fail because more than 10 items render, fix the UI.

---

R00 Acceptance Criteria

---

This change is complete when all of these are true:

```text id="mecurl"
Mobile right-to-left swipe advances to next page in page mode.
Mobile left-to-right swipe goes to previous page in page mode.
Swipe does not trigger in scroll mode.
Short horizontal movement does not turn the page.
Diagonal or vertical movement does not turn the page.
Swipe starting on controls does not turn the page.
Swipe starting in code blocks does not turn the page.
Swipe at first page previous boundary is a safe no-op.
Swipe at last page next boundary is a safe no-op.
Rapid swipes do not corrupt page state.
Keyboard ArrowRight advances page.
Keyboard ArrowLeft returns to previous page.
Arrow keys do not hijack settings controls.
RSS items use current actual date when added.
No RSS item is future-dated.
RSS channel lastBuildDate is not future-dated.
Home screen displays at most 10 RSS update items.
Home screen displays the latest 10 items by date.
AGENTS.md documents RSS date and display limit rules.
UI regression tests cover swipe behavior.
UI regression tests cover keyboard page navigation.
UI regression tests cover RSS date behavior.
UI regression tests cover RSS home display limit.
Full regression suite passes.
Manual mobile check confirms swipe feels deliberate and does not interfere with ordinary reading.
```

The swipe threshold should remain conservative unless mobile testing proves it is too strict. Accidental page turns are worse than requiring a slightly longer deliberate swipe.
