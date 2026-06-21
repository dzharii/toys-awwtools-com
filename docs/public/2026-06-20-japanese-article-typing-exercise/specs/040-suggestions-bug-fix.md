---

A00 Bug Fix Change Request - Backward Navigation, Mobile Input, Button Consistency, and Practice Mode Parity

---

This change request documents a second bug-fix pass for the Japanese writing practice app. The main defects are concentrated around backward navigation, punctuation skipping, mobile input focus, button styling, and the relationship between automatic caret movement and manual typing practice.

The current code already has the pieces for manual navigation, punctuation skipping, automatic token advance, typing input, settings, and modal actions. The problem is that some of these pieces are coupled in the wrong direction. The most important example is punctuation skipping: it runs after render, so it affects backward navigation even though it was probably intended only for forward progression.

---

A01 Confirmed Code-Level Cause

---

The punctuation navigation issue is confirmed.

The app currently calls `requestAnimationFrame(skipOptionalPunctuation)` at the end of `render()`. This means every render can trigger punctuation skipping, regardless of why the render happened. That includes renders caused by ArrowLeft and previous-button navigation. 

The current `skipOptionalPunctuation()` checks whether punctuation practice is disabled. If the current token is punctuation, it calls `completeCurrentToken({ autoPunctuation: true, silent: true })`. That completion path calls `advanceToken()`, which moves forward. So when ArrowLeft lands on punctuation, the next render immediately moves the caret forward again. 

The current `movePrevious()` does a simple local decrement. If `tokenIndex > 0`, it moves to the previous token. If the current token is the first token of a sentence, it moves to the last token of the previous sentence. That last token is usually punctuation. Then render runs, punctuation skipping fires, and the app advances back to the next sentence. This explains both reported symptoms: ArrowLeft cannot pass punctuation, and ArrowLeft cannot reliably move into the previous sentence. 

The mobile keyboard issue is also confirmed by code structure. `focusTyping()` always focuses `#typing-input` whenever an article exists, no modal is open, and the app is not paused. The app calls `focusTyping()` after navigation, resume, restart, reset, and token advancement. On mobile this will trigger the software keyboard, which hides the practice text. 

The current Settings UI has input and display groups, but it does not include a setting for mobile typing input visibility or automatic caret movement as a separate feature. It currently has `Manual navigation`, `Punctuation practice`, display toggles, and caret animation, but no setting that means "show typing input on mobile" or "automatic caret movement on/off". 

The modal action buttons are created through `buttonClass(kind)`, which maps actions to `primary-button`, `danger-button`, `secondary-button`, or `quiet-button`. That is correct structurally, but the CSS should normalize those button classes inside modal footers so the visual height and alignment are consistent. 

---

A02 Phase 1 - Bug Reports and Feature Corrections

---

| ID      | Area                         | Severity | Summary                                                                                      |
| ------- | ---------------------------- | -------: | -------------------------------------------------------------------------------------------- |
| BUG-011 | Backward navigation          |     High | ArrowLeft cannot move past punctuation                                                       |
| BUG-012 | Sentence boundary navigation |     High | ArrowLeft cannot reliably move into the previous sentence                                    |
| BUG-013 | Punctuation policy           |     High | Punctuation auto-skip runs during render instead of only during forward movement             |
| BUG-014 | Mobile input                 |     High | Mobile typing input receives focus and opens the phone keyboard                              |
| BUG-015 | Practice mode parity         |     High | Typing should work whether automatic caret movement is on or off                             |
| BUG-016 | Settings                     |   Medium | There is no explicit setting for automatic caret movement                                    |
| BUG-017 | Settings                     |   Medium | There is no explicit setting for typing input visibility on mobile                           |
| BUG-018 | Button styling               |   Medium | Modal action buttons have inconsistent heights and visual weight                             |
| BUG-019 | Report semantics             |   Medium | Passive automatic movement can make accuracy look like failure rather than no-input practice |

---

A03 BUG-011 - ArrowLeft Cannot Move Past Punctuation

---

Observed behavior: when the active token is just after a punctuation token, pressing ArrowLeft does not land on the previous word. It appears to stop or bounce near the punctuation.

Expected behavior: when punctuation practice is disabled, punctuation should not block backward navigation. ArrowLeft should move to the previous meaningful typed token.

Example:

```txt
「はい。アメリカが勝ちましたからみんな元気です。」
```

If the active token is `アメリカ`, pressing ArrowLeft should land on `はい`, not get stuck on `。`.

When punctuation practice is disabled, punctuation is display content, not a navigation trap.

Root cause: `movePrevious()` lands on punctuation, then `render()` schedules `skipOptionalPunctuation()`, and that skip moves forward again.

---

A04 BUG-012 - ArrowLeft Cannot Reliably Move Into Previous Sentence

---

Observed behavior: ArrowRight can move forward into the next sentence, but ArrowLeft cannot reliably move back into the previous sentence.

Expected behavior: ArrowLeft at the beginning of a sentence should move to the previous sentence's last meaningful token. Shift + ArrowLeft should move to the previous sentence in sentence mode.

Example:

```txt
Sentence 1: トムは言いました。
Sentence 2: 「はい。アメリカが勝ちましたからみんな元気です。」
```

If the caret is at the first token of Sentence 2, pressing ArrowLeft should move to `言いました`, not get stuck at `。` or return to Sentence 2.

Root cause: the previous sentence's last token is normally punctuation. The app lands on that punctuation and immediately skips forward because punctuation skipping is tied to render.

---

A05 BUG-013 - Punctuation Auto-Skip Runs in the Wrong Layer

---

The current punctuation auto-skip is too global. It runs after render, so it cannot distinguish why the current token became punctuation.

These cases must behave differently:

| Case                                      | Correct behavior                                    |
| ----------------------------------------- | --------------------------------------------------- |
| Forward auto-advance lands on punctuation | Skip forward if punctuation practice is off         |
| Manual Next lands on punctuation          | Skip forward if punctuation practice is off         |
| ArrowLeft lands near punctuation          | Skip backward over punctuation                      |
| Shift + ArrowLeft moves sentence          | Land on a meaningful token in the previous sentence |
| User enables punctuation practice         | Punctuation becomes navigable and typeable          |

The defect is not that punctuation is skipped. The defect is that punctuation is always skipped forward.

---

A06 BUG-014 - Mobile Typing Input Opens the Phone Keyboard

---

Observed behavior: on mobile, the typing input becomes focused and the mobile keyboard opens. This covers a large part of the screen and interferes with the main use case, which is reading the guided text while typing elsewhere or simply following the caret.

Expected behavior: on smaller screens, the typing input should be hidden and should not receive focus by default.

Mobile default should be reading-guidance mode:

```txt
Automatic caret movement: on
Typing input: hidden
Phone keyboard: not opened
```

The user should be able to enable mobile typing input later in Settings, but it should not be the default.

---

A07 BUG-015 - Practice Mode Parity When Auto Movement Is Off

---

The app needs two independent features:

| Feature                  | Meaning                                                |
| ------------------------ | ------------------------------------------------------ |
| Typing input             | User can type romaji and correct input moves the caret |
| Automatic caret movement | Timer moves the caret forward when delay expires       |

Turning off automatic caret movement must not turn off typing.

Correct behavior:

| Automatic movement | Typing input | Expected result                                      |
| ------------------ | ------------ | ---------------------------------------------------- |
| On                 | On           | Correct typing advances early; timeout also advances |
| On                 | Off          | Caret advances by timer only                         |
| Off                | On           | Correct typing advances; no timeout advance          |
| Off                | Off          | User navigates only with buttons or arrow keys       |

The only difference between auto movement on and off should be whether the timer advances the caret automatically. All manual navigation and typing behavior should remain available.

---

A08 BUG-016 - Missing Automatic Caret Movement Setting

---

The current app has `startTimer`, delay settings, and caret animation, but it needs a separate setting for automatic caret movement. `startTimer` describes when timing starts. It should not also mean whether the caret advances automatically.

Required setting:

```txt
Automatic caret movement
```

Recommended values:

```txt
On
Off
```

Default:

```txt
On
```

When Off, `shouldAutoAdvanceToken()` must return false, but typing validation must still work.

---

A09 BUG-017 - Missing Mobile Typing Input Setting

---

The app needs a setting that controls whether the typing input is shown and focused.

Recommended setting:

```txt
Typing input
```

Recommended values:

```txt
Desktop only
Always show
Hidden
```

Default:

```txt
Desktop only
```

Meaning:

| Value        | Desktop        | Mobile                |
| ------------ | -------------- | --------------------- |
| Desktop only | Show and focus | Hide and do not focus |
| Always show  | Show and focus | Show and allow focus  |
| Hidden       | Hide           | Hide                  |

This setting keeps desktop typing practice intact while protecting the mobile reading experience.

---

A10 BUG-018 - Modal Button Heights Are Inconsistent

---

Observed behavior: in the Session Report, `Return to Practice` appears visually smaller or misaligned compared with `Restart Article` and `Export / Share with Tango`.

Expected behavior: all modal action buttons should have one consistent height, padding model, border model, and alignment.

The visual role can differ, but size should not.

Correct rule:

```txt
Primary, secondary, danger, and quiet action buttons inside modal footers must share the same height.
```

The empty-state `Upload Article` button can have its own margin, but global `.primary-button` styles should not create different spacing inside modal footers.

---

A11 BUG-019 - Report Accuracy Is Misleading for Passive Practice

---

Observed behavior: after automatic caret movement completes the article, the report can show very low accuracy, such as 3 percent, even when the user may have intentionally used passive reading mode.

Expected behavior: report statistics should distinguish typed mistakes from no-input timeouts.

Recommended report metrics:

| Metric               | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| Completion           | How much of the article was traversed                   |
| Typed accuracy       | Accuracy among tokens where the learner typed something |
| Auto-advanced tokens | Tokens moved by timer without accepted input            |
| Missed tokens        | Tokens with wrong input                                 |
| Skipped tokens       | Tokens manually skipped                                 |

No-input timeout should not be treated as the same thing as wrong input. It can be a separate `timedOut` or `autoAdvanced` result.

---

B00 Phase 2 - Suggested Fixes

---

This phase describes the implementation corrections. The coding agent should treat these as targeted changes to the current codebase, not a rewrite.

---

B01 Replace Render-Level Punctuation Skipping

---

Remove this behavior from `render()`:

```js
requestAnimationFrame(skipOptionalPunctuation);
```

Do not run punctuation skipping after every render.

Instead, punctuation skipping should be part of explicit movement logic. The app must know whether the user is moving forward or backward.

Create a directional position resolver:

```js
function isInteractiveToken(token) {
  if (!token) return false;
  if (!isPunctuation(token)) return true;
  return runtime.settings.punctuationPractice;
}
```

Create a flattened position model:

```js
function getFlatTokens() {
  return runtime.article.sentences.flatMap(sentence =>
    sentence.tokens.map(token => ({
      sentenceIndex: sentence.index,
      tokenIndex: token.tokenIndex,
      globalIndex: token.globalIndex,
      token
    }))
  );
}
```

Create directional lookup:

```js
function findInteractivePosition(fromGlobalIndex, direction) {
  const flat = getFlatTokens();
  let index = flat.findIndex(item => item.globalIndex === fromGlobalIndex);

  if (index < 0) return null;

  index += direction;

  while (index >= 0 && index < flat.length) {
    if (isInteractiveToken(flat[index].token)) {
      return {
        sentenceIndex: flat[index].sentenceIndex,
        tokenIndex: flat[index].tokenIndex
      };
    }

    index += direction;
  }

  return null;
}
```

This makes the rule explicit:

```txt
Forward movement skips punctuation forward.
Backward movement skips punctuation backward.
Render never decides navigation direction.
```

---

B02 Add a Central Position Setter

---

Create one function that changes the active position.

```js
function setPracticePosition(position, reason = "unknown") {
  if (!position) return false;

  runtime.state.sentenceIndex = position.sentenceIndex;
  runtime.state.tokenIndex = position.tokenIndex;
  runtime.state.typedInput = "";
  runtime.state.completed = false;

  els.typingInput.classList.remove("invalid");
  resetTokenTimer();
  render();

  if (shouldFocusTyping()) focusTyping();
  if (!runtime.state.paused) smartScrollToPracticeFrame(reason);

  return true;
}
```

All manual navigation should go through this function.

---

B03 Fix ArrowLeft Token Navigation

---

Replace the current local decrement logic with directional lookup.

Suggested behavior:

```js
function movePrevious(sentenceMode = false) {
  if (!canNavigate(sentenceMode)) return;

  if (sentenceMode) {
    moveToPreviousSentence();
    return;
  }

  const token = currentToken();
  const position = findInteractivePosition(token.globalIndex, -1);
  setPracticePosition(position, "manual-previous");
}
```

If the current token is the first meaningful token of a sentence, this will naturally find the last meaningful token in the previous sentence. Punctuation at sentence end will not block navigation.

---

B04 Fix Shift + ArrowLeft Sentence Navigation

---

Sentence-mode previous should not land on sentence-ending punctuation. It should land on the first meaningful token of the previous sentence, or optionally the last meaningful token if that feels more natural. The current specification said Shift + ArrowLeft moves to the previous sentence. For implementation, the clearer default is first meaningful token of the previous sentence.

Suggested function:

```js
function firstInteractiveTokenInSentence(sentenceIndex) {
  const sentence = runtime.article.sentences[sentenceIndex];
  if (!sentence) return null;

  const token = sentence.tokens.find(isInteractiveToken);
  if (!token) return null;

  return {
    sentenceIndex,
    tokenIndex: token.tokenIndex
  };
}
```

Then:

```js
function moveToPreviousSentence() {
  const targetSentenceIndex = Math.max(0, runtime.state.sentenceIndex - 1);
  const position = firstInteractiveTokenInSentence(targetSentenceIndex);
  setPracticePosition(position, "manual-previous-sentence");
}
```

If the desired behavior is to move to the last meaningful token of the previous sentence, use `lastInteractiveTokenInSentence()` instead. The important point is that sentence punctuation must not become a trap.

---

B05 Fix ArrowRight and Forward Punctuation Skipping

---

Forward movement should still skip punctuation when punctuation practice is off.

Suggested helper:

```js
function findNextInteractivePositionFromCurrent() {
  const token = currentToken();
  if (!token) return null;
  return findInteractivePosition(token.globalIndex, 1);
}
```

After completing a token:

```js
function advanceToken() {
  const token = currentToken();
  if (!token) return;

  const next = findInteractivePosition(token.globalIndex, 1);

  if (next) {
    setPracticePosition(next, "advance-token");
    return;
  }

  completeArticle();
}
```

This eliminates the need for `skipOptionalPunctuation()` in the normal render cycle.

If the app still needs `skipOptionalPunctuation()` for import recovery, make it directional and call it only from forward contexts.

---

B06 Keep Punctuation Practice Mode Correct

---

When `punctuationPractice` is true:

```txt
Punctuation tokens are interactive.
ArrowLeft can land on punctuation.
ArrowRight can land on punctuation.
Typing punctuation may be required.
Auto-advance delay can apply to punctuation.
```

When `punctuationPractice` is false:

```txt
Punctuation tokens are rendered as text.
Punctuation tokens are not active practice stops.
Forward navigation skips punctuation forward.
Backward navigation skips punctuation backward.
Reports should not count silent punctuation as typed attempts.
```

This should be the invariant for all navigation paths.

---

B07 Add Automatic Caret Movement Setting

---

Add a setting to `DEFAULT_SETTINGS`:

```js
automaticCaretMovement: true
```

Add it to Settings, likely inside the Practice group:

```js
section.append(toggleSetting(
  "Automatic caret movement",
  "Move to the next token automatically when the token delay expires.",
  runtime.settings.automaticCaretMovement,
  value => runtime.settings.automaticCaretMovement = value
));
```

Update `shouldAutoAdvanceToken()`:

```js
function shouldAutoAdvanceToken() {
  if (!runtime.settings.automaticCaretMovement) return false;
  if (!runtime.article || runtime.modalOpen || runtime.state.paused || !runtime.state.timerStarted || runtime.state.completed) return false;
  if (runtime.advancing || runtime.rendering) return false;

  const token = currentToken();
  if (!token) return false;

  return runtime.state.activeElapsedMs - runtime.tokenStartActiveMs >= resolveDelay(token);
}
```

This makes automatic movement independent from typing.

---

B08 Preserve Typing When Automatic Movement Is Off

---

`handleTypingInput()` should continue to work whether `automaticCaretMovement` is on or off.

Required behavior:

```txt
Correct input advances token.
Incorrect input is marked quietly.
Partial input remains editable.
Enter can confirm if input is accepted.
Manual arrows work.
Timer does not force movement when automaticCaretMovement is off.
```

Do not put automatic movement checks inside `handleTypingInput()`. Typing validation is separate.

---

B09 Add Typing Input Visibility Setting

---

Add a setting:

```js
typingInputMode: "desktop-only"
```

Supported values:

```txt
desktop-only
always
hidden
```

Add to Settings, preferably inside the Input group:

```js
section.append(selectSetting(
  "Typing input",
  "Controls whether the romaji input box is shown and focused.",
  runtime.settings.typingInputMode,
  [
    ["desktop-only", "Desktop only"],
    ["always", "Always show"],
    ["hidden", "Hidden"]
  ],
  value => runtime.settings.typingInputMode = value
));
```

Add a media-query helper:

```js
function isMobileViewport() {
  return window.matchMedia("(max-width: 700px)").matches;
}
```

Add a display helper:

```js
function shouldShowTypingInput() {
  const mode = runtime.settings.typingInputMode || "desktop-only";

  if (mode === "always") return true;
  if (mode === "hidden") return false;

  return !isMobileViewport();
}
```

Add a focus helper:

```js
function shouldFocusTyping() {
  return (
    runtime.article &&
    !runtime.modalOpen &&
    !runtime.state.paused &&
    shouldShowTypingInput()
  );
}
```

Update `focusTyping()`:

```js
function focusTyping() {
  if (!shouldFocusTyping()) return;
  requestAnimationFrame(() => els.typingInput.focus());
}
```

---

B10 Hide Mobile Typing Input With CSS and State

---

Use both JS state and CSS. CSS alone hides the box, but JS must also avoid focus.

Add body or root state:

```js
function applySettings() {
  ...
  document.body.classList.toggle("typing-input-hidden", !shouldShowTypingInput());
}
```

CSS:

```css
.typing-input-hidden #typing-input {
  display: none;
}
```

Also add the mobile default rule as a safety net:

```css
@media (max-width: 700px) {
  body:not(.typing-input-forced) #typing-input {
    display: none;
  }
}
```

If using only one source of truth, prefer the JS class so the Settings option can override the mobile default.

---

B11 Keep Mobile Reading Mode as Default

---

Default mobile behavior:

```txt
Typing input hidden.
No software keyboard opens.
Automatic caret movement remains available.
Arrow/button navigation remains available.
Speech buttons remain available.
The active text stays visible.
```

If the user enables `Typing input: Always show`, then mobile can show the input and allow keyboard focus. That is an explicit opt-in.

---

B12 Unify Modal Button CSS

---

Normalize all modal action buttons in one place.

```css
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.modal-actions .primary-button,
.modal-actions .secondary-button,
.modal-actions .danger-button,
.modal-actions .quiet-button {
  min-height: 48px;
  height: 48px;
  padding: 0 22px;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  white-space: nowrap;
  border-radius: 8px;
}
```

Move empty-state button spacing out of the global button class:

```css
.empty-state .primary-button {
  margin-top: 16px;
}
```

Do not put `margin-top` on `.primary-button` globally. It causes modal action inconsistency.

---

B13 Improve Report Semantics for Passive Practice

---

Update stats so timeout with no input is not treated as a typed mistake.

Current logic records timeout states in `completeTimedOutToken()`, and `buildReport()` calculates accuracy from completed records. That can make passive practice look like failure. The auto-advance path and report builder are already separated enough to fix this without changing the full architecture. 

Recommended record classification:

```js
function completeTimedOutToken() {
  const token = currentToken();
  if (!token) return;

  const typed = runtime.state.typedInput || "";
  const normalized = normalizeRomaji(typed);
  const correct = acceptedInputs(token).includes(normalized);

  completeCurrentToken({
    typed,
    missed: Boolean(normalized) && !correct,
    skipped: !normalized,
    timedOut: true,
    noInput: !normalized
  });
}
```

Update report metrics:

```txt
Completion: all traversed tokens
Typed accuracy: only tokens with typed input
Auto-advanced: timedOut and noInput
Missed: typed input but incorrect
Skipped: manual skip
```

If there were no typed attempts, display:

```txt
Typed accuracy: No typed attempts
```

Do not show `3% accuracy` for a mostly passive guided-reading session unless the user actually typed many wrong answers.

---

B14 Preserve Desktop Typing Practice

---

Desktop behavior should stay strong.

Default desktop behavior:

```txt
Typing input shown.
Typing input focused after resume, token movement, sentence movement, and article load.
Correct romaji advances token immediately.
Automatic movement advances token only if enabled.
Arrow keys work.
```

The mobile fix must not remove desktop typing.

This is why the fix should use `shouldShowTypingInput()` and `shouldFocusTyping()` instead of deleting the input behavior.

---

B15 Acceptance Criteria

---

| ID     | Acceptance check                                                                        |
| ------ | --------------------------------------------------------------------------------------- |
| AC-021 | Pressing ArrowLeft after a punctuation mark lands on the previous meaningful token      |
| AC-022 | Pressing ArrowLeft at the first token of a sentence can move into the previous sentence |
| AC-023 | When punctuation practice is off, punctuation never traps backward navigation           |
| AC-024 | When punctuation practice is on, punctuation can be selected and practiced              |
| AC-025 | `render()` no longer performs unconditional forward punctuation skipping                |
| AC-026 | Forward auto-advance skips punctuation forward when punctuation practice is off         |
| AC-027 | Backward navigation skips punctuation backward when punctuation practice is off         |
| AC-028 | Automatic caret movement can be turned on and off in Settings                           |
| AC-029 | Turning automatic caret movement off does not disable typing input                      |
| AC-030 | Correct romaji advances the caret even when automatic movement is off                   |
| AC-031 | Mobile default does not focus the typing input                                          |
| AC-032 | Mobile default does not open the phone keyboard during practice                         |
| AC-033 | Mobile typing input can be enabled from Settings                                        |
| AC-034 | Desktop typing input remains visible and focused by default                             |
| AC-035 | Modal action buttons share consistent height and alignment                              |
| AC-036 | Empty-state button spacing does not affect modal buttons                                |
| AC-037 | Report separates typed mistakes from no-input auto-advanced tokens                      |
| AC-038 | Passive completion does not show misleading low typed accuracy                          |

---

B16 Implementation Priority

---

| Priority | Fix                                                       |
| -------- | --------------------------------------------------------- |
| 1        | Remove render-level punctuation auto-skip                 |
| 2        | Implement directional interactive-token navigation        |
| 3        | Fix ArrowLeft and Shift + ArrowLeft behavior              |
| 4        | Add `automaticCaretMovement` setting                      |
| 5        | Add `typingInputMode` setting and mobile default hiding   |
| 6        | Update `focusTyping()` so it respects mobile and settings |
| 7        | Normalize modal button CSS                                |
| 8        | Improve report semantics for passive auto-advance         |

The critical fix is the punctuation navigation model. Once punctuation skipping is directional instead of render-driven, the ArrowLeft and previous-sentence bugs should disappear.
