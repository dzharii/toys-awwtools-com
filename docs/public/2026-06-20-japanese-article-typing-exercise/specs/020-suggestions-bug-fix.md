---

E00 Bug Fix Change Request - Practice Flow, Speech Controls, Auto Advance, and Scroll

---

This change request describes defects found in the current practice UI and defines the required fixes. The goal is to make the main writing experience behave like a guided reading and typing flow: after an article is loaded, the learner should see only the article practice view, the active token should advance automatically while the app is playing, sentence speech should be available near the text, and scrolling should keep the previous and active sentence visible.

This change request should be treated as an MVP bug-fix pass, not as a post-MVP enhancement.

---

E01 Bug Reports

---

| Bug ID  | Area                  | Severity | Summary                                                                                                       |
| ------- | --------------------- | -------: | ------------------------------------------------------------------------------------------------------------- |
| BUG-001 | Loaded article layout |     High | Empty welcome panel remains visible after an article is loaded                                                |
| BUG-002 | Speech control        |     High | Text-to-speech works in Settings, but no sentence-level speech control appears in the practice view           |
| BUG-003 | Auto advance          |     High | The caret stops on a token and waits indefinitely instead of moving forward by timing                         |
| BUG-004 | Play / pause model    |     High | Play mode starts the timer, but does not drive token progression                                              |
| BUG-005 | Smart scroll          |     High | The practice surface does not keep previous sentence and active sentence reliably visible                     |
| BUG-006 | Scroll containment    |   Medium | Remaining text can occupy the page without a clear styled scroll region                                       |
| BUG-007 | Empty image column    |   Medium | When there is no article image, the left image column can create excessive unused space                       |
| BUG-008 | Session report layout |   Medium | Report content is too raw and table-like, with weak summary hierarchy                                         |
| BUG-009 | Source encoding       |   Medium | Some source strings appear mojibake in the uploaded code view and should be verified as UTF-8                 |
| BUG-010 | Current input model   |   Medium | The app records typed input, but the experience currently treats input completion as required for progression |

The current app already switches `emptyState.hidden = true` and `practiceArea.hidden = false` when `runtime.article` exists, but the screenshot shows the welcome content still visible, so the likely defect is CSS or layout visibility rather than the high-level render intent. The current render path also calls `renderSpeechButton()` and saves article state after rendering the article view. 

The current HTML contains a header-level `#speak-button` and the empty-state copy, but there is no sentence-level speech button near the previous sentence, active sentence, or remaining sentences. 

The current speech implementation can speak the active sentence and can detect Japanese voices, but the visible control is only the single header button governed by `renderSpeechButton()`. That explains why speech can work from Settings while still not being available where the user expects it in the active writing area. 

The current timer loop only increments elapsed time and updates the timer display. It does not compare elapsed token time against `resolveDelay(token)` and does not call `advanceToken()` or `completeCurrentToken()` automatically. 

---

E02 BUG-001 - Welcome Panel Remains After Article Load

---

Observed behavior: after importing an article, the page still shows the large `Japanese Writing Practice` welcome block above the active article. This makes the loaded article feel like it is below the onboarding page instead of replacing it.

Expected behavior: once a valid article is loaded, the welcome panel must disappear completely. The learner should see the practice surface from the first sentence onward. The empty state should exist only when no valid article is loaded.

Likely cause: the code sets the `hidden` property correctly, but CSS classes such as `.empty-state { display: grid; }` may override the browser's default `[hidden] { display: none; }` behavior. The fix should not rely only on default user-agent styling.

Required correction: add an explicit global hidden rule:

```css
[hidden] {
  display: none !important;
}
```

Also confirm that no layout code leaves the empty state inside the scrollable practice surface after `runtime.article` exists.

---

E03 BUG-002 - Missing Sentence-Level Text-to-Speech Controls

---

Observed behavior: text-to-speech works from Settings, but the main practice screen does not expose a convenient sentence speech button. The header-level speech button is either hidden, too subtle, or not positioned where the learner needs it.

Expected behavior: when browser Japanese text-to-speech is available, speech controls should appear near the sentence content itself.

Required controls:

| Sentence area             | Required speech control                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Previous sentence         | Small speech button near the sentence label or left edge                              |
| Active magnified sentence | Clearly visible but quiet speech button on the left side of the active sentence block |
| Remaining sentences       | Small speech button next to each rendered sentence or sentence row                    |
| Header                    | Optional global active-sentence speech button may remain                              |

The active sentence speech button should be the primary control. It should not dominate the layout. A small icon button is enough.

Suggested label and aria text:

```txt
音
Speak this sentence
```

For screen readers, use sentence-specific labels:

```txt
Speak active sentence
Speak previous sentence
Speak this remaining sentence
```

---

E04 BUG-003 - Caret Waits Forever on a Token

---

Observed behavior: the caret stops on one token and does not continue unless the learner types the correct input or manually presses Next.

Expected behavior: when the app is playing, the caret should move automatically after the token's resolved delay expires. Typing is still useful, but it is no longer mandatory for progression.

This is a product behavior change from the earlier stricter typing-validation loop. The new intended model is a guided writing timer. The learner can type during the allotted time, but if they miss the token, the app records that and continues.

Required behavior:

| Condition                                            | Result                                        |
| ---------------------------------------------------- | --------------------------------------------- |
| Learner types correct romaji before delay expires    | Complete token immediately and advance        |
| Learner types partial input and delay expires        | Record timed-out or missed token and advance  |
| Learner types wrong input and delay expires          | Record missed token and advance               |
| Learner types nothing and delay expires              | Record skipped or timed-out token and advance |
| Token is punctuation and punctuation practice is off | Auto-advance as already intended              |
| App is paused                                        | Do not advance                                |
| Modal or menu is open                                | Do not advance                                |
| Article is completed                                 | Do not advance                                |

The app should not wait indefinitely on any normal token while play mode is active.

---

E05 BUG-004 - Play Mode Does Not Drive Progression

---

Observed behavior: pressing play or resume starts the timer, but the token caret still does not move automatically.

Expected behavior: play mode should mean automatic pacing is active. Pause mode should mean automatic pacing is stopped.

Required state model:

| State       | Timer   | Caret auto-advance | User scrolling                                    |
| ----------- | ------- | ------------------ | ------------------------------------------------- |
| Playing     | Runs    | Enabled            | App may smart-scroll on token or sentence changes |
| Paused      | Stopped | Disabled           | User can scroll freely                            |
| Menu open   | Stopped | Disabled           | Dialog controls own focus                         |
| Report open | Stopped | Disabled           | Dialog controls own scroll                        |
| Completed   | Stopped | Disabled           | Report is shown                                   |

The existing `state.paused` and `state.timerStarted` values can remain, but automatic progression must be tied to them.

---

E06 BUG-005 - Smart Scroll Missing

---

Observed behavior: after progress moves through the article, the app does not reliably maintain the ideal reading frame.

Expected behavior: while the app is playing, the viewport should keep the previous sentence and active magnified sentence visible. The preferred anchor is the previous sentence zone. If there is no previous sentence, the anchor is the active sentence zone.

Required smart-scroll behavior:

| Situation                                     | Scroll behavior                                               |
| --------------------------------------------- | ------------------------------------------------------------- |
| Article first loads                           | Scroll to the active sentence area                            |
| Token advances inside same sentence           | Do not aggressively scroll unless active token is out of view |
| Sentence advances                             | Scroll so previous sentence and active sentence are visible   |
| User presses Play / Resume                    | Scroll to current practice frame                              |
| User pauses                                   | Stop automatic scrolling                                      |
| User manually scrolls while paused            | Preserve user scroll position                                 |
| Menu or dialog closes back into playing state | Scroll back to current practice frame if needed               |

The scroll should be smooth but short. It should not feel like the page is jumping constantly.

Recommended scroll target priority:

```txt
previous sentence anchor
active sentence anchor
practice area top
```

---

E07 BUG-006 - Scroll Region Is Not Explicit Enough

---

Observed behavior: the remaining article text can stretch the entire page and compete with the fixed header and bottom controls.

Expected behavior: the app window should have a clear internal scroll region. The header should remain visible. The bottom controls should remain visible. The article content between them should scroll.

Required layout model:

| Region           | Behavior                          |
| ---------------- | --------------------------------- |
| Header           | Fixed within app window           |
| Practice content | Scrollable                        |
| Bottom controls  | Fixed or sticky within app window |
| Modal overlays   | Cover app and pause timer         |

The scroll container should include the image column and reading column. The bottom control bar should not cover the final lines of remaining text. Add bottom padding to the scrollable content equal to or greater than the control bar height.

Suggested structure:

```html
<section id="practice-scroll" class="practice-scroll">
  <section id="practice-area" class="practice-area">
    ...
  </section>
</section>
<nav id="bottom-controls" class="bottom-controls">...</nav>
```

---

E08 BUG-007 - Empty Image Column Creates Too Much Blank Space

---

Observed behavior: when an article has no image, the left image area can leave a large blank region, making the active text appear too far to the right.

Expected behavior: when there is no active image and `showArticleImage` is on, the app may either collapse the image column or show a very subtle placeholder only if that placeholder is useful. For normal imported articles without images, the reading column should receive more space.

Required behavior:

| Image state              | Desktop layout                                                 |
| ------------------------ | -------------------------------------------------------------- |
| Relevant image exists    | Use image column plus reading column                           |
| No relevant image exists | Collapse image column or reduce it to a narrow reserved gutter |
| Image setting disabled   | Collapse image column                                          |
| Image failed to load     | Collapse image column and log warning                          |

This should make no-image articles feel intentional rather than broken.

---

E09 BUG-008 - Session Report Layout Is Too Raw

---

Observed behavior: the Session Report screenshot shows a long token table immediately dominating the modal. The report does not clearly present high-level progress first.

Expected behavior: the report should start with summary cards, then show categorized sections. Long token lists should be scrollable inside the report body, while actions remain visible at the bottom.

Required report hierarchy:

| Area                 | Content                                                               |
| -------------------- | --------------------------------------------------------------------- |
| Header               | Session Report title and short status message                         |
| Summary cards        | Active time, progress, completed tokens, accuracy                     |
| Review sections      | Slow tokens, missed tokens, skipped tokens, review candidates         |
| Sticky action footer | Return to Practice, Restart Article, Export / Share with Tango, Close |

Report tables should have headings and should not look like an unstructured dump of token rows.

---

E10 BUG-009 - Source Encoding Should Be Verified

---

Observed behavior: the uploaded code view shows mojibake for some Japanese strings and kana alias keys. If this reflects the actual source file rather than the upload parser, it will break UI labels and common alias handling.

Expected behavior: all source files should be saved as UTF-8. Japanese strings and kana keys must remain readable in source.

Required verification targets:

| Code area             | Required value style                                |
| --------------------- | --------------------------------------------------- |
| UI labels             | Real Japanese text, not mojibake                    |
| `COMMON_ALIASES` keys | Real kana such as `し`, `ち`, `つ`, `ふ`, `じ`, `を`, `ん` |
| Pause button text     | Real display text such as `▮▮ 一時停止` and `▶ 再開`      |
| Zone labels           | Real display text such as `前の文`, `現在の文`             |
| Subtitle              | Real `Zen タイピング`                                    |

If mojibake is present in the actual repository, fix file encoding and replace corrupted literals.

---

E11 BUG-010 - Input Should Not Block the Guided Flow

---

Observed behavior: the input field currently acts as if correct input is required before the app can move forward.

Expected behavior: the learner can type during the token's time window, but the app should still continue when the time window ends. Correct typing completes the token early. Incorrect, partial, or missing typing is recorded and the app advances.

The typing input can remain as an input mechanism, but it should not be the master condition for movement while play mode is active.

Suggested terminology for stats:

| Case                                | Suggested stat          |
| ----------------------------------- | ----------------------- |
| Correct before timeout              | `correct`               |
| Partial but not accepted by timeout | `timedOut`              |
| Wrong input by timeout              | `missed`                |
| Empty input by timeout              | `skipped` or `timedOut` |
| Manual Next                         | `skippedManual`         |

---

F00 Suggested Fixes

---

This section defines implementation changes. The coding agent should use its own judgment for exact function names, but the behavior must match the requirements.

---

F01 Fix Visibility of Empty State

---

Add a global hidden rule:

```css
[hidden] {
  display: none !important;
}
```

Then make the article-loaded state explicit with a body or root class:

```js
document.body.classList.toggle("has-article", Boolean(runtime.article));
```

Required rendering rule:

```txt
No article:
  show empty state
  hide practice area
  hide bottom controls
  hide session meta

Article loaded:
  hide empty state
  show practice area
  show bottom controls
  show session meta
```

Do not leave the welcome block in the DOM flow when `runtime.article` exists.

---

F02 Add Sentence-Level Speech Function

---

Replace the single-purpose speech function with a sentence-index based function:

```js
function speakSentence(sentenceIndex) {
  if (!runtime.article || !runtime.speechSupported || !runtime.japaneseVoice) return;

  const sentence = runtime.article.sentences[sentenceIndex];
  if (!sentence) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(sentence.text);
  utterance.lang = "ja-JP";
  utterance.voice = runtime.japaneseVoice;
  utterance.rate = Number(runtime.settings.speechRate) || 1;

  window.speechSynthesis.speak(utterance);
}
```

Keep `speakActiveSentence()` as a convenience wrapper:

```js
function speakActiveSentence() {
  speakSentence(runtime.state.sentenceIndex);
}
```

Add a helper for speech buttons:

```js
function createSentenceSpeakButton(sentenceIndex, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sentence-speak-button";
  button.textContent = "音";
  button.setAttribute("aria-label", label);
  button.hidden = !(runtime.speechSupported && runtime.japaneseVoice);
  button.addEventListener("click", () => speakSentence(sentenceIndex));
  return button;
}
```

---

F03 Render Speech Buttons in Sentence Zones

---

Update `renderPrevious()` to include a speech button when a previous sentence exists.

Update `renderActiveSentence(sentence)` so the active sentence block has a left-side speech button, separate from the token line. The button should not be inside the active token. It belongs to the sentence panel.

Suggested active sentence structure:

```html
<section class="active-sentence">
  <button class="sentence-speak-button active">音</button>
  <div id="active-sentence-line" class="sentence-line"></div>
  <input id="typing-input" ... />
  <span class="current-label">現在の文</span>
</section>
```

Update `renderRemaining()` so it renders remaining sentences as sentence rows, not only paragraph text blobs. Each row can include a small speech button.

Suggested remaining structure:

```html
<p class="remaining-sentence-row">
  <button class="sentence-speak-button small">音</button>
  <span>トムはコロラドから来ました。</span>
</p>
```

If speech is unavailable, hide all sentence speech buttons and do not reserve large space for them.

---

F04 Implement Auto-Advance by Resolved Delay

---

The timer loop must compare the active token elapsed time with the active token's resolved delay.

Recommended state additions:

```js
const runtime = {
  ...
  autoAdvanceEnabled: true,
  lastAutoAdvanceAt: 0
};
```

Recommended function:

```js
function shouldAutoAdvanceToken() {
  if (!runtime.article) return false;
  if (runtime.modalOpen) return false;
  if (runtime.state.paused) return false;
  if (!runtime.state.timerStarted) return false;
  if (runtime.state.completed) return false;

  const token = currentToken();
  if (!token) return false;

  const elapsed = runtime.state.activeElapsedMs - runtime.tokenStartActiveMs;
  return elapsed >= resolveDelay(token);
}
```

Update `tick()`:

```js
function tick() {
  const now = performance.now();

  if (runtime.article && !runtime.modalOpen && !runtime.state.paused && runtime.state.timerStarted && !runtime.state.completed) {
    runtime.state.activeElapsedMs += now - runtime.lastTickAt;
    els.timerValue.textContent = formatTime(runtime.state.activeElapsedMs);

    if (shouldAutoAdvanceToken()) {
      completeTimedOutToken();
    }
  }

  runtime.lastTickAt = now;
}
```

Add a timeout completion function:

```js
function completeTimedOutToken() {
  const token = currentToken();
  if (!token) return;

  const typed = runtime.state.typedInput || "";
  const normalized = normalizeRomaji(typed);
  const accepted = acceptedInputs(token);
  const correct = accepted.includes(normalized);

  completeCurrentToken({
    typed,
    missed: !correct,
    skipped: !typed,
    timedOut: true
  });
}
```

Update `completeCurrentToken()` to record `timedOut` if provided.

---

F05 Avoid Double Advance and Punctuation Loops

---

Auto-advance must not conflict with manual Next or punctuation auto-skip.

Required guards:

```txt
Do not auto-advance if completeCurrentToken is already running.
Do not auto-advance while render is in progress.
Do not auto-advance while punctuation auto-skip is processing.
Do not auto-advance if current token changed earlier in the same tick.
```

A simple implementation can use:

```js
runtime.advancing = false;
```

Then:

```js
function completeCurrentToken(options = {}) {
  if (runtime.advancing) return;
  runtime.advancing = true;

  try {
    ...
    advanceToken();
  } finally {
    runtime.advancing = false;
  }
}
```

If this causes nested punctuation advancement problems, split token recording from token advancement and make punctuation skipping iterative but guarded.

---

F06 Start and Resume Behavior

---

When the learner presses Pause while paused, this becomes Play / Resume.

Resume should:

```txt
set paused = false
set timerStarted = true
set lastTickAt = performance.now()
reset token timer only if this is a new token or first resume after article load
focus typing input
smart-scroll to the current practice frame
```

Do not reset the token timer every time the user briefly opens and closes a menu unless the menu intentionally pauses the timer. If menus pause the timer, elapsed token time should not include modal time.

---

F07 Smart Scroll Implementation

---

Add DOM anchors:

```html
<section id="practice-scroll" class="practice-scroll">
  <section id="previous-sentence" class="previous-sentence" data-scroll-anchor="previous"></section>
  <section class="active-sentence" data-scroll-anchor="active"></section>
</section>
```

Add function:

```js
function smartScrollToPracticeFrame(reason = "unknown") {
  if (!runtime.article) return;
  if (runtime.state.paused) return;
  if (runtime.modalOpen) return;

  const target =
    runtime.state.sentenceIndex > 0
      ? els.previousSentence
      : document.querySelector(".active-sentence");

  if (!target) return;

  requestAnimationFrame(() => {
    target.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: runtime.settings.caretAnimation === "off" ? "auto" : "smooth"
    });
  });
}
```

Call smart scroll after:

```txt
article import
resume
sentence advancement
manual sentence navigation while playing
closing modal into playing state
```

Do not call it every timer tick. That would fight the user's scroll and feel unstable.

---

F08 Create a Real Scroll Container

---

Change layout so the app has a scrollable content region between the header and bottom controls.

Recommended CSS direction:

```css
.app-window {
  max-height: calc(100vh - 48px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.practice-scroll {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--muted) transparent;
}

.practice-scroll::-webkit-scrollbar {
  width: 10px;
}

.practice-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.practice-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--muted) 55%, transparent);
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.practice-area {
  min-height: 100%;
  padding-bottom: calc(24px + var(--bottom-controls-height, 80px));
}
```

If bottom controls remain outside the scroll container, the scrollable content must have bottom padding so the final text is not hidden.

---

F09 Collapse Empty Image Column

---

Add a layout class when no usable image is shown:

```js
els.practiceArea.classList.toggle("no-article-image", !hasVisibleArticleImage);
```

CSS:

```css
.practice-area.no-article-image {
  grid-template-columns: minmax(0, 1fr);
}

.practice-area.no-article-image .article-art {
  display: none;
}
```

On mobile, the article image already behaves as a vertical banner, but the same no-image rule should hide it cleanly.

---

F10 Improve Session Report Structure

---

Keep the report as a modal, but split it into header, scrollable report body, and sticky footer.

Suggested modal structure:

```html
<section class="modal report-modal">
  <header class="modal-header">...</header>
  <div class="modal-body report-body">...</div>
  <footer class="modal-actions report-actions">...</footer>
</section>
```

Report body should start with summary cards:

```txt
Active time
Progress
Completed tokens
Accuracy
```

Only then show token tables. Each token section should have a clear heading and empty state.

Suggested table columns:

```txt
Token
Romaji
Result
Time
Expected
```

For timed-out tokens, show `Timed out`. For manual skips, show `Skipped`. For incorrect input, show `Missed`.

---

F11 Fix or Verify UTF-8 Source Encoding

---

Check actual files in the repository, not only the uploaded display. If mojibake exists, replace corrupted literals with UTF-8 Japanese.

Required replacements include:

```js
const COMMON_ALIASES = {
  "し": ["shi", "si"],
  "ち": ["chi", "ti"],
  "つ": ["tsu", "tu"],
  "ふ": ["fu", "hu"],
  "じ": ["ji", "zi"],
  "を": ["wo", "o"],
  "ん": ["n", "nn", "n'"]
};
```

Also verify UI strings:

```txt
Zen タイピング
前の文
現在の文
一時停止
再開
音
```

Add this HTML head requirement if missing:

```html
<meta charset="utf-8">
```

---

F12 Update Stats Model for Automatic Progression

---

Extend token records with timeout information.

Suggested record shape:

```js
{
  tokenId,
  text,
  romaji,
  typed,
  elapsed,
  expected,
  missed,
  skipped,
  timedOut,
  manualSkip,
  autoPunctuation
}
```

Definitions:

| Field             | Meaning                               |
| ----------------- | ------------------------------------- |
| `timedOut`        | Token advanced because delay expired  |
| `skipped`         | No useful input was typed             |
| `manualSkip`      | User pressed Next                     |
| `missed`          | Wrong or incomplete input was present |
| `autoPunctuation` | Punctuation advanced automatically    |

This will make the report more accurate and will make the future hard-words mode more useful.

---

G00 Acceptance Criteria for This Bug Fix

---

| ID     | Acceptance check                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------------- |
| AC-001 | After article import, the welcome panel is not visible anywhere in the page flow                      |
| AC-002 | With no article loaded, the welcome panel is visible and the practice area is hidden                  |
| AC-003 | When speech is available, the active sentence has a visible speech button near the sentence           |
| AC-004 | When speech is available, previous and remaining sentences can also expose sentence speech controls   |
| AC-005 | Clicking an active sentence speech button speaks the active sentence                                  |
| AC-006 | Clicking a remaining sentence speech button speaks that specific sentence                             |
| AC-007 | When speech is unavailable, sentence speech buttons are hidden                                        |
| AC-008 | Pressing Play / Resume starts timer and automatic caret movement                                      |
| AC-009 | If the learner types the correct romaji before timeout, the token advances immediately                |
| AC-010 | If the learner does not type before timeout, the token advances automatically                         |
| AC-011 | If the learner types wrong or partial input before timeout, the token advances and records the result |
| AC-012 | Pause stops both the timer and automatic caret movement                                               |
| AC-013 | Menu and modal states stop automatic caret movement                                                   |
| AC-014 | Sentence advancement scrolls the previous and active sentence into view while playing                 |
| AC-015 | Paused state does not auto-scroll while the learner manually scrolls                                  |
| AC-016 | The content area has a styled scroll region                                                           |
| AC-017 | Bottom controls remain visible and do not cover the last lines of text                                |
| AC-018 | No-image articles do not waste the full image column unless explicitly configured                     |
| AC-019 | Session Report starts with summary metrics before token lists                                         |
| AC-020 | Source strings and kana alias keys are valid UTF-8, not mojibake                                      |

---

H00 Implementation Priority

---

Fix order should be:

| Priority | Fix                                            |
| -------- | ---------------------------------------------- |
| 1        | Hide empty state correctly after article load  |
| 2        | Implement automatic token advancement by delay |
| 3        | Add smart scroll and scroll container          |
| 4        | Add sentence-level speech buttons              |
| 5        | Collapse empty image column                    |
| 6        | Improve session report hierarchy               |
| 7        | Verify UTF-8 source strings                    |

The first four items are core experience blockers. The app currently has the right foundation, but these issues prevent it from feeling like the intended guided writing flow.
