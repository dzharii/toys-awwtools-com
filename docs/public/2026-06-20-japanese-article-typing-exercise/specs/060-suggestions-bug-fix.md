---

A00 Bug Fix Change Request - Typing When Automatic Caret Movement Is Off

---

This change request documents the N7 typing bug and the required state-model cleanup.

The app must support manual typing practice when `Automatic caret movement` is off. Turning off automatic movement must only disable timeout-based token advancement. It must not disable romaji input, manual navigation, or correct-input advancement.

The modal behavior remains strict: when a menu, settings sheet, report, export dialog, import dialog, or confirmation dialog is open, typing input is blocked and timing is suspended. The bug is not that modals block input. The bug is when temporary modal state leaks into saved practice pause state after the modal closes.

---

A01 Bug Report

---

| ID      | Area                    | Severity | Summary                                                                 |
| ------- | ----------------------- | -------: | ----------------------------------------------------------------------- |
| BUG-025 | Manual typing mode      |     High | Romaji input can appear rejected after automatic caret movement is off  |
| BUG-026 | State model             |     High | Temporary modal/menu pause can be confused with intentional pause state |
| BUG-027 | Settings side effects   |   Medium | Changing automatic movement can incorrectly unpause a real paused state |
| BUG-028 | Code complexity         |   Medium | Repeated pause/modal/timer boolean chains make regressions easy         |

Observed behavior:

```txt
Automatic caret movement: Off
Typing input: visible
Typing into the romaji field does not keep characters
```

Expected behavior:

| Automatic caret movement | Typing input | Expected behavior                                      |
| ------------------------ | ------------ | ------------------------------------------------------ |
| On                       | On           | Correct typing advances early; timer can also advance. |
| On                       | Off          | Timer advances without typing input.                   |
| Off                      | On           | Correct typing advances; timer never advances.         |
| Off                      | Off          | User navigates manually with buttons or arrows.        |

---

A02 Root Cause

---

The root cause is state conflation.

The app has two different concepts:

| Concept                 | Correct state owner       | Meaning                                                     |
| ----------------------- | ------------------------- | ----------------------------------------------------------- |
| Intentional pause       | `runtime.state.paused`    | The learner paused practice and this may be saved/restored. |
| Temporary modal blocker | `runtime.modalOpen`       | A dialog/menu is open, so input and timing are suspended.   |

`runtime.state.paused` must not be used as the modal/menu blocker. If a modal path sets or leaves `runtime.state.paused = true`, then `handleTypingInput()` rejects input after the modal closes:

```js
if (!runtime.article || runtime.modalOpen || runtime.state.paused || runtime.state.completed) {
  els.typingInput.value = runtime.state.typedInput || "";
  return;
}
```

That rejection resets the visible input field to the saved typed value, often an empty string. To the learner, it looks like every typed character is immediately erased.

The modal itself should still block typing while open. That part is correct and should remain:

```txt
modal open -> no typing, no focus, no timer, no auto-advance
```

---

B00 Required Fix

---

Keep `automaticCaretMovement` independent from typing.

The typing path must not check `automaticCaretMovement`. It should only reject input when typing is actually blocked:

```js
function isTypingBlocked() {
  return !runtime.article || runtime.modalOpen || runtime.state.paused || runtime.state.completed;
}
```

The auto-advance path is the only path that should care about `automaticCaretMovement`:

```js
function shouldAutoAdvanceToken() {
  if (!runtime.settings.automaticCaretMovement) return false;
  if (!isPracticeRunning()) return false;
  ...
}
```

Use a shared running-state helper for timer and auto-advance checks:

```js
function isPracticeRunning() {
  return Boolean(
    runtime.article &&
    !runtime.modalOpen &&
    !runtime.state.paused &&
    runtime.state.timerStarted &&
    !runtime.state.completed
  );
}
```

Changing the `Automatic caret movement` setting should update only the setting. It must not blindly call:

```js
runtime.state.paused = false;
```

That would hide this bug in one path while creating another bug: an intentionally paused learner could open Settings, toggle automatic movement, close Settings, and unexpectedly resume practice.

---

B01 Final Invariants

---

| Invariant                                | Rule                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Modal blocks input                       | `runtime.modalOpen` blocks typing, focus, timer, and auto-advance.   |
| Pause means real practice pause          | `runtime.state.paused` is only intentional pause or completion.      |
| Typing is independent from auto movement | `handleTypingInput()` must not check `automaticCaretMovement`.       |
| Auto movement is isolated                | `shouldAutoAdvanceToken()` owns the automatic movement setting gate. |
| Settings preserve pause intent           | Toggling automatic movement does not unpause an intentionally paused session. |
| Saved sessions stay simple               | Do not add a second pause marker unless a separate state needs it.   |

---

C00 Saved-State Impact

---

With typing blocked by `runtime.modalOpen` and completion state, a restored `paused: true` value no longer makes manual typing mode appear stuck. The restore path does not need an extra pause marker or a compatibility unpause branch.

This keeps saved state smaller and avoids a second pause concept. If the learner saved an intentionally paused session, it can remain paused after refresh. If an old session has `paused: true` from a previous modal leak, typing is still usable because pause is not the text-input blocker.

---

D00 Acceptance Criteria

---

| ID     | Acceptance check                                                                 |
| ------ | -------------------------------------------------------------------------------- |
| AC-062 | With automatic movement off and typing visible, typed characters remain visible. |
| AC-063 | With automatic movement off, correct romaji advances the current token.          |
| AC-064 | With automatic movement off, the timer never advances the caret by timeout.      |
| AC-065 | With any modal open, typing input is ignored and the field is restored safely.   |
| AC-066 | Closing Settings after changing automatic movement does not leave practice stuck.|
| AC-067 | Opening Settings while intentionally paused and closing it keeps practice paused.|
| AC-068 | `handleTypingInput()` has no dependency on `automaticCaretMovement`.             |
| AC-069 | `shouldAutoAdvanceToken()` contains the only automatic-movement gate.            |
| AC-070 | Menu and Escape menu paths do not set `runtime.state.paused = true`.             |
| AC-071 | No extra pause marker state is required or saved.                                |
| AC-072 | A restored paused manual-mode session still allows romaji typing when visible.   |

---

E00 Verification Notes

---

Recommended checks:

```txt
node --check app.js
static check: handleTypingInput has no automaticCaretMovement reference
static check: shouldAutoAdvanceToken has the automaticCaretMovement gate
static check: automatic movement settings handler does not write runtime.state.paused
browser check: modal blocks input while open
browser check: manual typing works after Settings closes with automatic movement off
browser check: intentionally paused practice stays paused after Settings closes
```

The browser checks are important because the original symptom is interaction-level: the input field appears to erase typed characters.
