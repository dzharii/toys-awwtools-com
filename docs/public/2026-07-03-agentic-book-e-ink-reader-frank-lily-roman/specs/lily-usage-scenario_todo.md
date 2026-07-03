# specs/lily-usage-scenario_todo.md

Source: specs/lily-usage-scenario.md
Pass: Lily (occasional reader who dislikes confusion)

Lily is not a software troubleshooter. She wants to open a file, read, adjust a
couple of basics, recover from mistakes, and never get stuck. Every message must
be plain language and every state must be obvious.

---

## A00 Acceptance Checklist

### Obvious first use
- [x] The open screen clearly invites opening or dragging a file.
- [x] Both a visible Open button and drag-and-drop work.
- [x] Supported file types are stated in plain language.

### Smoothness and clarity
- [x] Loading shows a brief "Reading…" busy state, not a frozen screen.
- [x] The reader appears with a calm refresh, not a jarring flash.
- [x] Controls (Open, Settings, Prev/Next, progress) are labelled and easy to find.

### Calm, non-technical messages
- [x] Empty file: "This file is empty … Open another book file." (no jargon).
- [x] Unsupported file: explains which types are supported. (no error codes shown).
- [x] Markdown-with-HTML: a gentle note that some HTML was skipped for safety.
- [x] No raw stack traces or technical error codes are shown to the user.

### Easy recovery from mistakes
- [x] Opening a wrong file returns to the open screen with a clear message.
- [x] Opening a new file replaces the current one cleanly.
- [x] No stuck overlay, endless spinner, or blank page after any error.

### Minimal configuration burden
- [x] Sensible defaults mean Lily can read without touching settings.
- [x] Settings are grouped and understandable; advanced/technical items are tucked away (progressive disclosure).
- [x] Font size and theme are easy to change and take effect immediately.

### Mobile simplicity
- [x] On mobile the layout is single-column with large touch targets.
- [x] Settings becomes a full/bottom sheet that is easy to dismiss.
- [x] Tap zones turn pages without needing precise aiming.

---

## B00 Validation Checklist

- [x] Opened a file via the button and via drag-and-drop.
- [x] Triggered empty and unsupported files; confirmed plain-language messages and clean return to the open screen.
- [x] Changed theme and font size; changes applied instantly and persisted.
- [x] Verified no console errors that might surface as confusing behavior.
- [x] Verified mobile viewport layout and settings sheet.
- [ ] Manual: judged whether wording feels friendly and non-intimidating.

---

## C00 Risks And Edge Cases

- [x] A technical toast could confuse Lily — safety/large-file notes are phrased plainly.
- [x] Getting "stuck" mid-refresh — refreshes are serialized and always unlock.
- [x] Losing her place after changing a setting — position is preserved.
- [ ] First-time discoverability of tap zones — zones exist; on-screen hinting is minimal by design.

---

## D00 Final Review

- [x] Power-user detail from the Frank pass did not make the main path noisier for Lily (diagnostics are opt-in).
- [x] All error paths lead back to a usable state.
- [ ] Remaining limitation: tone/wording friendliness is a subjective human judgement.
