---

A00 Close Document And Home Updates Feature Specification

---

Add two related user-facing features to the E Ink Reader.

First, add a clear way to close the currently opened document and return to the home screen. The reader currently has a document title on the left and reader actions such as Open and Settings on the right. The source snapshot shows cached reader elements for `readerTitle`, `settingsButton`, and `openButton2`, but no close-document control.

Second, extend the home screen so it displays the project's own RSS update feed below the file-open drop zone. The project already has RSS feed requirements, an RSS discovery link, and a visible RSS link on the open screen. The new feature makes the feed content visible in the app itself, not only available as a link. The existing project documentation states that the feed lives at `feed.xml`, that it is static RSS 2.0, and that update items should be high-level and user-oriented.

The feature must preserve the product's core rules: static runtime, local assets, no external runtime requests, no book-content persistence, safe rendering, calm UI, responsive behavior, and complete UI regression coverage.

---

B00 User Problem

---

When a document is open, the user can open another file or open settings, but there is no obvious way to close the current document and return to the home screen. This creates a state-management gap. A reader should have a clear "close document" action because the home screen is where the user opens a new file, sees the privacy explanation, sees supported formats, and now sees project updates.

The home screen currently has the file-open drop zone and an RSS link. That is useful, but it does not let users see what changed in the application without leaving the app. The application should read its own local `feed.xml` and display recent project updates in the same calm visual style as the rest of the app.

---

C00 Product Behavior Summary

---

When a document is open, the reader top bar must include a close-document button near the document title on the left side.

When the user activates the close-document button, the app returns to the home screen.

Closing the document must clear the active in-memory document state. It must not clear user preferences. It must not persist or restore book content. It must not reload the whole page unless the agent has a strong reason and the behavior remains smooth.

The home screen must show the existing file-open card at the top and a new "Project updates" RSS section below it.

The RSS section must fetch and parse the local `feed.xml`, then display recent update items. It must be styled coherently with the E Ink reader design: warm paper, grayscale, subtle borders, calm spacing, and no visual noise.

The home screen must become vertically scrollable if the combined drop zone and updates section exceed the viewport height.

---

D00 Close Document UI

---

Add a button on the left side of the reader bar, next to the document title.

The preferred reader bar layout is:

```text id="1v4n7y"
[Close] [document title................................] [Open] [Settings]
```

The close control should be visually padded and readable. It should not be an unlabeled icon-only "X" in the default desktop layout. Lily should understand it without guessing. Use text such as:

```text id="2t0x9t"
Close
```

The accessible name should be more explicit:

```text id="kx2jkl"
Close current document and return to home screen
```

On narrow mobile widths, the visible label may remain `Close`, while the title truncates with ellipsis. Do not hide the close control behind Settings. Closing the document is a core navigation action.

Use a real button:

```html id="b18qw2"
<button
  id="close-document-button"
  data-testid="reader-button-close-document"
  class="reader__close button button--quiet"
  type="button"
  aria-label="Close current document and return to home screen"
>
  Close
</button>
```

Exact class names may differ, but the `data-testid` must exist. The project requires every user-interactive runtime element to have a `data-testid`, and the test suite expects page objects to remain synchronized with those hooks.

---

E00 Close Document State Behavior

---

Closing a document must perform a controlled state transition.

Required behavior:

```text id="4y2ij3"
Reader hides.
Open screen becomes visible.
Active document state is cleared from memory.
Rendered content is cleared or detached.
Page index resets.
Scroll position resets.
Progress text resets or hides.
Settings panel closes if it is open.
Busy state clears.
Toast state clears or is allowed to expire harmlessly.
E Ink overlay is not stuck.
Preferences remain unchanged.
localStorage remains preferences-only.
No book content is written to localStorage, IndexedDB, Cache Storage, logs, or window.__einkReader.
```

The close action should use a full E Ink-style refresh or a calm reduced-motion-compatible transition. The transition must not look like a browser navigation jump. If reduced motion is active or E Ink is off, close should be immediate and calm.

Do not show the old book title on the home screen after close. Do not keep old page progress visible. Do not leave old document content in hidden DOM if it can confuse tests, accessibility snapshots, or privacy audits. If the implementation keeps temporary hidden nodes for transition purposes, they must be removed after the transition settles.

Suggested user-facing notice after close:

```text id="dzx34q"
Document closed.
Open a TXT or Markdown file to continue reading.
```

This notice is optional. If used, keep it calm and short. It should not overwrite a more important error. It should not imply the book can be restored. It should not re-show the "Welcome back" restored-preferences notice unless this is a fresh page load.

---

F00 Close Document Edge Cases

---

If the user closes while settings are open, settings must close and the app must return to the home screen.

If the user closes during an E Ink page transition, the app must cancel or finish the transition safely. The final state must be home screen visible, reader hidden, no stuck overlay.

If the user closes while a file is still being read, parsed, or paginated, the app should either disable the close button until safe or support cancellation. Do not allow a late pagination result to reopen the reader after close.

If the user closes and immediately opens another file, the app must open the new file normally.

If the user closes in scroll mode, scroll position must reset. Reopening a file should not start at the old scroll position.

If the user closes in page mode after navigating to page 21, reopening a different file should not inherit page 21.

---

G00 Home Updates Section

---

Add a new section below the drop zone on the open screen.

The section should be visually similar in width and visual language to the existing drop zone. It should not be inside the drop zone. It should sit below the drop zone with clear vertical spacing.

Suggested structure:

```html id="0kfe1r"
<section
  id="updates-panel"
  data-testid="open-screen-region-updates"
  class="updates-panel"
  aria-labelledby="updates-title"
>
  <div class="updates-panel__header">
    <h2 id="updates-title">Project updates</h2>
    <a
      href="feed.xml"
      class="updates-panel__rss-link"
      data-testid="open-screen-link-updates-rss"
    >
      RSS feed
    </a>
  </div>

  <p class="updates-panel__intro">
    Recent changes to the local E Ink-style reader.
  </p>

  <div
    id="updates-list"
    data-testid="open-screen-list-updates"
    class="updates-list"
  ></div>
</section>
```

Exact markup may differ. The semantics must remain clear: a section with a heading, an RSS link, and a list of update items.

Display up to five most recent RSS items by default. Three is acceptable on very small screens if the design is cleaner, but the test should not depend on an exact maximum unless the product contract sets one. A simple and stable default is five.

Each update item should show:

```text id="m4gbkr"
Title.
Publication date, if valid.
Description.
Optional "Read update" link if the item link is present.
```

The item should not look like a news feed from another product. It should look like part of this reader.

Suggested item layout:

```text id="6kogjg"
Project updates

Safe Markdown rendering
Jul 03, 2026
Raw HTML is not rendered as trusted content, remote images are blocked, and unsafe Markdown can be reopened as plain text.

Read update
```

Use concise typography. Do not overload the home screen.

---

H00 RSS Fetch And Parse Behavior

---

Fetch the feed from a relative local URL:

```text id="18pzaf"
feed.xml
```

Do not use an absolute remote URL at runtime. The app is local-first and must not depend on external network access.

Use `fetch("feed.xml", { cache: "no-store" })` or equivalent if the agent decides this is appropriate. Static browser caching is acceptable if it does not create stale behavior in normal use. Do not add any remote dependency.

Parse the XML using `DOMParser`.

Required parser behavior:

```text id="2b9hdu"
Read channel title if needed.
Read item title.
Read item description.
Read item link.
Read item guid.
Read item pubDate.
Sort by pubDate descending if dates are valid.
Fall back to document order if dates are missing or invalid.
Limit rendered items.
```

Render text safely. Use `textContent`, not unsanitized `innerHTML`.

RSS descriptions may contain escaped HTML or entities. The app may decode entities through XML parsing, but it must display the resulting value as text. Do not render HTML from the feed as trusted markup.

If a feed item has an HTML description such as:

```xml id="cdr95l"
<description>Markdown rendering is &lt;strong&gt;safer&lt;/strong&gt; now.</description>
```

The UI should display text, not create a `<strong>` element from feed content.

Links from feed items should be normal anchors. If they open a new tab, use `rel="noopener noreferrer"`. If they point to same-page fragments, same-tab navigation is acceptable. Do not prefetch item links.

---

I00 RSS Failure And Empty States

---

If `feed.xml` cannot be fetched, the app must not show a broken panel or console-only failure.

Show a calm fallback:

```text id="wbo35g"
Updates are unavailable in this local session.
You can still open the RSS feed directly.
```

Keep the RSS feed link visible.

If the feed exists but has no items, show:

```text id="ir1fzh"
No project updates are listed yet.
```

If the feed is invalid XML, show:

```text id="55yaez"
Updates could not be read right now.
```

Log technical details to the structured logger if debug mode is enabled, but do not show parser exceptions to normal users.

RSS failure must not block file opening. The file-open card must remain usable even if the updates panel fails.

RSS failure must not break the open screen layout.

---

J00 Home Screen Scrolling And Layout

---

The current home screen is centered and sized for the drop zone. The updates panel will make the home screen taller. Adjust layout so the home screen can scroll vertically.

Required behavior:

```text id="55y8wh"
Open screen supports vertical scrolling when content exceeds viewport height.
Reader mode remains fixed and usable.
Scroll behavior on the home screen does not break reader scroll mode.
The drop zone remains near the top-center on normal desktop viewports.
The updates panel appears below the drop zone with comfortable spacing.
On mobile, the drop zone and updates panel stack vertically and fit the viewport width.
No body-level horizontal overflow is introduced.
```

Do not simply remove `overflow: hidden` from the entire body if that breaks reader layout. The source uses bounded viewport layout for the app, and previous testing specifically cares that scroll mode works correctly. Choose a scoped solution, such as making the open screen itself scrollable while preserving the reader's bounded layout.

Suggested layout direction:

```text id="krqcv0"
#app remains viewport bounded.
.open-screen becomes overflow-y: auto.
.open-screen uses align-items: flex-start instead of permanent vertical centering when updates are present.
.open-screen__content or equivalent wrapper centers the cards and provides top/bottom padding.
.dropzone and .updates-panel share max-width.
```

The home screen should still look calm and intentional. It should not feel like a long web page with unrelated cards.

---

K00 Styling Requirements

---

The close button must match the reader bar style. It should be visually quiet but discoverable.

Use existing tokens: `--paper-bg`, `--paper-surface`, `--ink`, `--ink-muted`, `--line-soft`, `--line-strong`, and `--radius`.

The updates panel must look coherent with the drop zone. Suggested style:

```text id="5lzg6q"
Same max width as drop zone.
Paper-surface background.
Subtle border.
Small radius.
Comfortable padding.
Heading in UI font.
Item titles clear but not oversized.
Descriptions in readable muted ink.
Dates smaller and muted.
RSS link subdued.
```

Avoid saturated colors. Avoid card shadows that make the home screen look like a dashboard. Avoid "marketing website" styling. This is still the E Ink Reader.

Mobile behavior:

```text id="ovsk9y"
Use smaller padding.
Keep readable line height.
Do not truncate update titles too aggressively.
Ensure RSS link is tappable.
Ensure close button remains tappable in reader bar.
```

---

L00 RSS Content Security

---

Treat `feed.xml` as local project content, but still render defensively.

Required rules:

```text id="fbrcig"
Do not use unsanitized innerHTML for feed titles or descriptions.
Do not execute scripts from feed content.
Do not render feed-provided HTML as DOM.
Do not fetch images or enclosures from feed items.
Do not auto-load item links.
Do not store feed content in localStorage.
Do not mix feed parsing with Markdown parsing.
```

RSS feed content is not book content, but it still should not be stored in user preference storage. Keep it in memory for the current page session.

---

M00 Accessibility Requirements

---

The close-document button must be keyboard reachable.

The close-document button must work with Enter and Space.

The close-document button must have a clear accessible name.

When the user closes the document, focus should move to a sensible home-screen element. Preferred target:

```text id="dmfbij"
Open file button
```

If a "Document closed" notice is shown, it may receive accessible announcement through an existing notice/live-region pattern, but focus should not be trapped there.

The updates panel must have a heading. The list of updates should be navigable by screen readers. Use semantic list markup if practical:

```html id="kbkw6f"
<ul>
  <li>...</li>
</ul>
```

Dates should use `<time datetime="...">` when valid.

The RSS feed link must be keyboard reachable and have understandable text.

Reduced motion must be respected when closing a document. Do not force a full flash on users who request reduced motion.

---

N00 State And API Changes

---

Add an application method for closing the document.

Suggested method name:

```text id="u0dqgx"
closeDocument()
```

Responsibilities:

```text id="oxnnjj"
Cancel or ignore pending file-load/layout work if needed.
Close settings if open.
Clear active document state.
Clear current rendered content.
Reset page and scroll reader state.
Hide reader.
Show open screen.
Reset title/progress surfaces.
Run full E Ink transition or reduced close transition.
Move focus to the open file button after transition.
Log app:document-close without content.
```

Do not log book text. Do not log source Markdown. Do not log rendered HTML.

Update the read-only inspection handle if needed, but keep it content-safe. It may expose:

```text id="e1ydw1"
documentLoaded: false
readerVisible: false
openScreenVisible: true
mode
theme
```

It must not expose old document text.

Add an updates module if useful:

```text id="4f21sb"
js/rss-updates.js
```

Suggested responsibilities:

```text id="r40mzn"
fetchProjectUpdates()
parseRssFeed(xmlText)
normalizeRssItems(items)
renderUpdates(items)
renderUpdatesLoading()
renderUpdatesEmpty()
renderUpdatesError()
```

Keep the RSS module independent from Markdown parsing.

---

O00 RSS Feed Update Requirement For This Feature

---

Because this is a user-facing feature, update `feed.xml` in the same implementation pass.

Add a new RSS item describing the feature in user-oriented language.

Suggested item title:

```text id="21xwwt"
Home screen project updates and document close action
```

Suggested description:

```text id="3n6bb4"
The reader now lets you close the current document and return to the home screen. The home screen also shows recent project updates from the local RSS feed, while keeping file reading local and private.
```

Update `lastBuildDate`.

Ensure `feed.xml` remains valid RSS 2.0. The existing RSS workflow requires every user-facing feature to update the feed in the same implementation pass.

The home updates panel should display this new item after implementation.

---

P00 UI Regression Test Requirements

---

Add automated UI regression tests for all new behavior.

The project already requires that new user-facing behavior adds or extends specs under the matching test category and keeps the test suite decoupled from product source.

Do not implement this feature without tests.

Required new or updated test files:

```text id="68g6f1"
ui-regression-test-suite/src/specs/navigation/close-document.spec.ts
ui-regression-test-suite/src/specs/rss/home-updates.spec.ts
ui-regression-test-suite/src/specs/responsive/home-updates-responsive.spec.ts
ui-regression-test-suite/src/specs/accessibility/close-and-updates-accessibility.spec.ts
ui-regression-test-suite/src/specs/privacy/close-document-privacy.spec.ts
ui-regression-test-suite/src/specs/journeys/home-return-and-updates.spec.ts
```

If the suite already has better locations for these specs, use them. The coverage must remain explicit.

Update page objects:

```text id="gozehe"
ReaderPageObject: add closeDocument button locator and closeDocument() action.
OpenScreenPageObject: add updates panel, updates list, RSS link, update item locators.
Toast/Notice helper: support document-closed notice if implemented.
```

Update product constants if the suite centralizes test IDs:

```text id="ekcwfb"
reader-button-close-document
open-screen-region-updates
open-screen-list-updates
open-screen-link-updates-rss
open-screen-update-item
```

Run the full test suite after implementation:

```text id="4e2h5c"
cd ui-regression-test-suite
bun run typecheck
bun run test:navigation
bun run test:rss
bun run test:responsive
bun run test:accessibility
bun run test:privacy
bun run test:journeys
bun run validate
```

If a test fails, decide whether the application is wrong or the test is wrong. Correct application behavior is the priority.

---

Q00 Close Document Test Cases

---

Test CLOSE001: close button appears when document is open.

Steps:

```text id="00xt87"
Open the app.
Open simple-prose.txt.
Locate reader-button-close-document.
```

Expected result:

```text id="9hn01d"
Close button is visible.
Close button is enabled.
Close button has accessible name "Close current document and return to home screen" or equivalent.
Document title remains visible.
Open and Settings controls remain visible.
Standard oracle passes.
```

Test CLOSE002: close returns to home screen.

Steps:

```text id="pm9cpc"
Open simple-prose.txt.
Click Close.
Wait for home screen.
```

Expected result:

```text id="41xefe"
Reader is hidden.
Open screen is visible.
Drop zone is visible.
Open file button is visible.
Updates panel is visible or in loading/empty/error state.
Old document title is not visible as reader title.
Old content marker is not visible.
Progress is hidden or reset.
No stuck busy overlay.
No stuck E Ink overlay.
```

Test CLOSE003: close clears in-memory document without clearing preferences.

Steps:

```text id="csvdh8"
Open standard-markdown.md.
Change theme to dark or high contrast.
Close document.
Inspect localStorage.
Open settings or inspect html attributes.
```

Expected result:

```text id="y0x17l"
Preference remains.
Book content marker is not in localStorage.
Reader is closed.
Home screen uses current theme.
```

Test CLOSE004: close after page navigation.

Steps:

```text id="w85wxs"
Open long-book.txt.
Go to page 3 or later.
Click Close.
Open simple-prose.txt.
```

Expected result:

```text id="341w3a"
New file starts in a valid initial page state.
Old page number does not carry over.
Progress is sane.
Old long-book marker is absent.
```

Test CLOSE005: close from scroll mode.

Steps:

```text id="g3xgtj"
Open long-book.txt.
Switch to scroll mode.
Scroll down.
Click Close.
Open long-book.txt again.
```

Expected result:

```text id="i9dt9v"
Home screen appears after close.
Reopened document does not inherit old scrollTop unless product explicitly chooses active-session restoration for same file before close. Preferred behavior: close resets document reading position.
```

Test CLOSE006: close while settings open.

Steps:

```text id="s4ct8j"
Open standard-markdown.md.
Open settings.
Click Close if close button remains visible, or press Escape then Close if settings covers it.
```

Expected result:

```text id="41vdrp"
Final state is home screen.
Settings is closed.
No overlay remains.
```

If settings intentionally covers the reader bar and close is not reachable while settings is open, add a test that Escape closes settings and then Close works. If the product should allow close from inside settings, add a close action inside settings as a separate product decision.

Test CLOSE007: keyboard activation.

Steps:

```text id="vbhfvb"
Open simple-prose.txt.
Tab to Close.
Press Enter.
Reopen file.
Tab to Close.
Press Space.
```

Expected result:

```text id="tquf6x"
Both keyboard activations return to home screen.
Focus lands on Open file button or another sensible home control.
```

Test CLOSE008: close does not create network or storage side effects.

Steps:

```text id="mtnoqx"
Open code-heavy Markdown.
Click Close.
Inspect network and storage diagnostics.
```

Expected result:

```text id="b55n78"
No external request.
No fixture marker in storage.
No source code snippet in storage.
No window.__einkReader content leak.
```

---

R00 Home Updates RSS Test Cases

---

Test RSSHOME001: updates panel appears on home screen.

Steps:

```text id="w48pmb"
Open app fresh.
Locate open-screen-region-updates.
```

Expected result:

```text id="t68nln"
Updates panel is visible below the drop zone.
Heading says "Project updates" or equivalent.
RSS feed link exists.
Open file area remains visible and usable.
```

Test RSSHOME002: feed items render from feed.xml.

Steps:

```text id="p20fyt"
Open app fresh.
Wait for updates list to settle.
Read update items.
```

Expected result:

```text id="qhxoq2"
At least one update item is visible if feed.xml has items.
Item title is visible.
Description is visible.
Date is visible if pubDate is valid.
No raw XML is shown.
No parser error is shown.
```

Test RSSHOME003: RSS item content is rendered as text, not HTML.

Steps:

```text id="k0qevs"
Serve or route a test feed item with escaped HTML in description.
Open app.
Inspect rendered item.
```

Expected result:

```text id="bnqpvr"
The description does not create unexpected HTML nodes from feed content.
Scripts, if present in test feed text, do not execute.
Description appears as safe text or sanitized plain text.
```

Test RSSHOME004: RSS feed failure state.

Steps:

```text id="exlj94"
Route feed.xml to 404 or network failure in Playwright.
Open app.
```

Expected result:

```text id="fh8a4o"
Updates panel shows calm unavailable message.
RSS feed link remains visible.
Open file button still works.
No unhandled page error.
```

Test RSSHOME005: invalid XML state.

Steps:

```text id="y1eugl"
Route feed.xml to invalid XML.
Open app.
```

Expected result:

```text id="z71tnu"
Updates panel shows calm could-not-read message.
Open screen remains usable.
No raw parser exception visible to user.
```

Test RSSHOME006: empty feed state.

Steps:

```text id="kzgz6w"
Route feed.xml to valid RSS with zero items.
Open app.
```

Expected result:

```text id="7jpyoy"
Updates panel shows "No project updates are listed yet" or equivalent.
```

Test RSSHOME007: updates panel after closing document.

Steps:

```text id="6s3x4d"
Open standard-markdown.md.
Click Close.
Wait for home screen.
```

Expected result:

```text id="vkjgtc"
Updates panel is present.
Feed items are visible or graceful fallback appears.
Open file button works.
```

Test RSSHOME008: RSS rendering does not create external requests.

Steps:

```text id="v1ncff"
Open app.
Capture network.
Wait for updates.
```

Expected result:

```text id="r4zij1"
Request to same-origin feed.xml is allowed.
No external RSS, image, enclosure, or item-link request occurs.
```

---

S00 Responsive Tests For Home Updates

---

Test RESPUPD001: desktop home layout.

Steps:

```text id="ou9mnp"
Set desktop viewport.
Open app.
```

Expected result:

```text id="c9p5we"
Drop zone is centered.
Updates panel is below the drop zone.
Both share a coherent width.
No horizontal overflow.
```

Test RESPUPD002: mobile home layout.

Steps:

```text id="l0sb2l"
Set mobile narrow viewport.
Open app.
```

Expected result:

```text id="golj8w"
Drop zone fits viewport.
Updates panel fits viewport.
Home screen scrolls vertically if needed.
RSS link is tappable.
No horizontal overflow.
```

Test RESPUPD003: home screen vertical scroll.

Steps:

```text id="fjlqpf"
Use a shorter viewport or route feed.xml with several items.
Open app.
Attempt to scroll open screen.
```

Expected result:

```text id="3oaq7l"
Open screen scrolls.
Reader scroll mode is not involved because no document is open.
File-open controls remain reachable.
```

Test RESPUPD004: reader layout unaffected.

Steps:

```text id="bycb5i"
Open app and wait for updates panel.
Open long-book.txt.
Switch to scroll mode.
Scroll reader.
```

Expected result:

```text id="fs3gzr"
Reader scroll behavior remains correct.
Home screen updates layout did not break reader's bounded viewport layout.
```

---

T00 Accessibility Tests For Close And Updates

---

Test A11Y_CLOSE001: close button accessible name.

Steps:

```text id="udk8i3"
Open a document.
Query button by role and accessible name.
```

Expected result:

```text id="dxdv9w"
Close button is discoverable by role button and name.
```

Test A11Y_CLOSE002: focus after close.

Steps:

```text id="6tyguq"
Open document.
Focus Close button.
Press Enter.
```

Expected result:

```text id="8bb8dl"
Home screen appears.
Focus lands on Open file button or a sensible home control.
```

Test A11Y_UPDATES001: updates region semantics.

Steps:

```text id="n1ny3n"
Open app.
Inspect updates panel.
```

Expected result:

```text id="cq2o18"
Panel has a heading.
Items are grouped as list or equivalent semantic structure.
RSS feed link is keyboard reachable.
Dates use time elements when valid.
```

Test A11Y_UPDATES002: keyboard navigation through home screen.

Steps:

```text id="a1709w"
Open app.
Tab through Open file button, RSS link, update item links.
```

Expected result:

```text id="303mk4"
Focus is visible.
No focus trap.
No unreachable controls.
```

---

U00 Privacy And Storage Tests

---

Test PRIV_CLOSE001: close does not persist document content.

Steps:

```text id="af2tr4"
Open code-heavy Markdown fixture.
Click Close.
Inspect localStorage.
Inspect window.__einkReader serialized output.
```

Expected result:

```text id="vi5f1d"
No fixture marker, paragraph, code snippet, source Markdown, or rendered HTML appears in persistent storage or inspection handle.
```

Test PRIV_UPDATES001: RSS content is not stored in preferences.

Steps:

```text id="3awe2s"
Open app.
Wait for updates.
Inspect localStorage.
```

Expected result:

```text id="h8pa76"
RSS item titles/descriptions are not stored in the preferences object.
```

Test PRIV_CLOSE002: close clears visible old content.

Steps:

```text id="ddug9q"
Open standard-markdown.md.
Click Close.
Inspect visible DOM text for fixture marker.
```

Expected result:

```text id="5rvbdf"
Old fixture marker is not visible.
If hidden DOM is inspected, old content should be absent unless a short transition is active. After transition settles, it must be absent.
```

---

V00 Journey Tests

---

Test JOURNEY_CLOSE_UPDATES001: close and home updates journey.

Steps:

```text id="iy609a"
Open app.
Wait for updates panel.
Open standard-markdown.md.
Turn a page.
Open settings.
Close settings.
Click Close.
Read updates panel.
Open simple-prose.txt.
Click Close.
```

Expected result:

```text id="xjrj6f"
Document can be closed repeatedly.
Home screen remains usable.
Updates panel remains available after close.
Opening another file after close works.
No storage leak.
No network leak.
No stuck overlay.
```

Test JOURNEY_LILY_CLOSE001: Lily calm close flow.

Steps:

```text id="xncmdj"
Open simple-prose.txt.
Click Close.
Observe home screen.
Open unsupported.pdf.
Observe error.
Read updates panel.
Open standard-markdown.md.
```

Expected result:

```text id="jwhhz1"
Close is understandable.
Home screen gives clear next action.
Error recovery remains calm.
Updates panel does not distract from file opening.
```

Test JOURNEY_ROMAN_CLOSE001: Roman technical note close flow.

Steps:

```text id="d23tlb"
Open code-heavy Roman fixture.
Switch to scroll mode.
Scroll to code block.
Click Close.
Inspect storage.
Open another Roman fixture.
```

Expected result:

```text id="o6hjp0"
Code-heavy content closes cleanly.
No code snippet persists.
Reopening another technical note works.
Updates panel does not affect code-note rendering.
```

---

W00 Manual Visual Review Requirements

---

After implementation, perform manual visual checks using screenshots similar to the provided examples.

Check reader view:

```text id="96uyr6"
Close button appears on the left near the document title.
Close button is padded enough to click.
Document title still has enough room.
Open and Settings remain aligned on the right.
Reader bar does not feel crowded.
Mobile reader bar still works.
```

Check home screen:

```text id="nyozk4"
Drop zone remains calm and centered.
Updates panel appears below with coherent spacing.
Updates panel width matches or visually aligns with the drop zone.
RSS items are readable.
The panel does not make the home screen feel like a generic marketing page.
Vertical scrolling feels intentional when needed.
```

If the visual result feels awkward, fix it. Automated tests cannot decide whether the home screen feels coherent.

---

X00 Files Likely To Change

---

Expected runtime changes:

```text id="huv64n"
index.html
css/base.css
css/reader.css
css/responsive.css
js/app.js
js/state.js
js/rss-updates.js or equivalent new module
feed.xml
README.md if feature list is documented there
AGENTS.md if test instructions or new feature workflow need updating
```

Expected test changes:

```text id="8rt3q7"
ui-regression-test-suite/src/page-objects/reader.page.ts
ui-regression-test-suite/src/page-objects/open-screen.page.ts
ui-regression-test-suite/src/config/testids.ts or equivalent
ui-regression-test-suite/src/specs/navigation/close-document.spec.ts
ui-regression-test-suite/src/specs/rss/home-updates.spec.ts
ui-regression-test-suite/src/specs/responsive/home-updates-responsive.spec.ts
ui-regression-test-suite/src/specs/accessibility/close-and-updates-accessibility.spec.ts
ui-regression-test-suite/src/specs/privacy/close-document-privacy.spec.ts
ui-regression-test-suite/src/specs/journeys/home-return-and-updates.spec.ts
```

Do not change vendored dependencies for this feature. RSS parsing can use browser-native `fetch` and `DOMParser`.

---

Y00 Implementation Order

---

Implement in this order:

```text id="vay3m1"
1. Read current app source for reader bar, open screen, app state, file open, and settings behavior.
2. Add close-document button markup with data-testid.
3. Add closeDocument application method.
4. Wire close button event.
5. Verify close from page mode manually.
6. Verify close from scroll mode manually.
7. Add home screen layout wrapper if needed.
8. Add updates panel markup.
9. Add RSS updates module using local feed.xml and DOMParser.
10. Render loading, success, empty, invalid, and unavailable states.
11. Style close button and updates panel.
12. Make open screen vertically scrollable without breaking reader scroll mode.
13. Update feed.xml with a new user-facing item.
14. Update UI regression page objects.
15. Add close-document tests.
16. Add home updates RSS tests.
17. Add responsive, accessibility, privacy, and journey tests.
18. Run targeted tests.
19. Run the full validation suite.
20. Perform manual visual review.
21. Fix issues found by tests or visual inspection.
```

Do not defer tests. This is user-facing behavior and must be protected by UI regression coverage.

---

Z00 Acceptance Criteria

---

The feature is complete only when all of these are true:

```text id="4tmxjf"
Reader bar has a visible Close button near the document title.
Close button has data-testid reader-button-close-document.
Close button has a clear accessible name.
Close returns to the home screen.
Close clears current document state.
Close clears rendered document content after transition settles.
Close does not clear preferences.
Close does not persist book content.
Close works from page mode.
Close works from scroll mode.
Close works after page navigation.
Close behaves safely with settings open.
Home screen shows updates panel below the drop zone.
Updates panel reads local feed.xml.
Updates panel displays recent RSS items.
Updates panel handles feed failure calmly.
Updates panel handles invalid XML calmly.
Updates panel handles empty feed calmly.
Feed content is rendered as safe text.
RSS item links do not prefetch.
Home screen scrolls vertically when needed.
Reader scroll mode remains correct.
Mobile home screen has no horizontal overflow.
feed.xml includes a new item for this feature.
RSS remains valid XML.
UI regression tests cover close behavior.
UI regression tests cover home updates behavior.
UI regression tests cover responsive home updates behavior.
UI regression tests cover accessibility behavior.
UI regression tests cover privacy and no-content persistence.
Full UI regression suite passes.
Manual visual review confirms the feature feels coherent.
```

The priority remains product correctness. If a test passes but the close button feels hidden, the home updates panel feels noisy, or the home screen layout feels broken, fix the application.
