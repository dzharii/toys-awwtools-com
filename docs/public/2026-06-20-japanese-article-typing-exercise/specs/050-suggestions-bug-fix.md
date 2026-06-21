---

A00 Bug Fix Change Request - Active Token Hint Overlap

---

This change request describes one focused UI bug: the active token hints can overlap the magnified sentence text. In the screenshot, the active token is `お茶`, and the lower hint area shows `おちゃ` and `tea`. That lower hint overlaps the next line of the sentence, making both the hint and the Japanese text harder to read.

The current source confirms why this happens. `renderActiveSentence()` appends `focus-hint-top` and `focus-hint-bottom` inside the focused token span, so the hints are attached to the active token. That part is correct. The CSS then absolutely positions the bottom hint below the token with `top: calc(100% + 0.48em)`. Because the hint is absolutely positioned, it does not reserve vertical space in the sentence layout. When the magnified sentence wraps to another line, the bottom hint can float over the next Japanese line.  

The main specification already requires romaji and meaning to stay visually attached to the active token, positioned relative to the token rather than the whole sentence container. So the fix should not detach the hint from the token. It should preserve token attachment while making the overlay readable and less destructive. 

---

A01 Bug Report

---

| ID      | Area               | Severity | Summary                                                                                  |
| ------- | ------------------ | -------: | ---------------------------------------------------------------------------------------- |
| BUG-020 | Active token hints |   Medium | Reading and meaning hints can overlap wrapped Japanese sentence text                     |
| BUG-021 | Hint readability   |   Medium | The lower hint has no background protection, so overlapping text visually mixes together |
| BUG-022 | Theme support      |      Low | Hint overlay background should adapt to Light and Dark themes                            |

Observed behavior: when the active sentence wraps across multiple lines, the lower token hint can overlap the following Japanese line. This happens more often for large active sentence text, large font settings, long sentences, and tokens positioned near the end of a wrapped line.

Expected behavior: the active token hint should stay attached to the active token, but it should remain readable. If it overlaps sentence text, the hint should sit on a calm semi-transparent paper-like background. The background should make the hint readable while still allowing the underlying text to remain faintly visible.

The fix should not move the hint to a detached global area. The hint belongs to the caret.

The codding agent must read this image below and confirm there is visual bug first and that it is clearly visible. 

![image-20260620223223756](050-suggestions-bug-fix.assets/image-20260620223223756.png)



---

A02 Root Cause

---

The root cause is the combination of these rules:

```css
.focus-hint-bottom {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(100% + 0.48em);
}
```

The hint is positioned relative to `.focus-token`, but it is removed from normal line layout. The surrounding `.sentence-line` can wrap normally, but the bottom hint does not increase line height or push the next line down. The current `.sentence-line` uses large type and a line-height of `1.72`, which is usually enough but not guaranteed for every sentence, token, and font-size combination. 

So the bug is not that the hint is attached to the token. That is intended. The bug is that the attached hint is visually unprotected when it overlays nearby sentence text.

---

B00 Suggested Fix

---

The preferred fix has two layers.

First, add a theme-aware semi-transparent background to the active token hints. This directly solves readability when overlap occurs.

Second, slightly increase the protected visual area around the focused token so the overlap is less frequent.

---

B01 Add Theme Variables for Hint Backgrounds

---

Add these variables to the Light theme:

```css
:root,
[data-theme="light"] {
  --hint-surface: color-mix(in srgb, var(--paper) 82%, transparent);
  --hint-surface-strong: color-mix(in srgb, var(--paper) 90%, transparent);
  --hint-border: color-mix(in srgb, var(--line-strong) 60%, transparent);
}
```

Add equivalent Dark theme variables:

```css
[data-theme="dark"] {
  --hint-surface: color-mix(in srgb, var(--paper) 78%, transparent);
  --hint-surface-strong: color-mix(in srgb, var(--paper) 88%, transparent);
  --hint-border: color-mix(in srgb, var(--line-strong) 70%, transparent);
}
```

The important part is that the hint background should be mostly visible but still slightly transparent. The target is roughly 80 percent surface visibility and 20 percent transparency.

---

B02 Apply Background to Token Hints

---

Update both hint containers:

```css
.focus-hint-top,
.focus-hint-bottom {
  z-index: 3;
  padding: 0.18em 0.42em;
  border: 1px solid var(--hint-border);
  border-radius: 999px;
  background: var(--hint-surface);
  backdrop-filter: blur(2px);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--ink) 8%, transparent);
}
```

For the lower hint, use a slightly stronger background because it is more likely to overlap the sentence:

```css
.focus-hint-bottom {
  background: var(--hint-surface-strong);
}
```

This keeps the hint readable without making it look like a loud badge.

---

B03 Improve Lower Hint Layout

---

The lower hint currently uses a grid with multiple child spans. Keep that structure, but make it a compact pill or small stacked capsule:

```css
.focus-hint-bottom {
  top: calc(100% + 0.38em);
  display: inline-grid;
  gap: 0.12em;
  justify-items: center;
  max-width: min(14em, 42vw);
  white-space: nowrap;
}
```

If reading and meaning are both enabled, the capsule can stack them. If only meaning is enabled, it remains one line.

For very long meanings, prevent the capsule from becoming too wide:

```css
.focus-hint-bottom span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

B04 Give the Focused Token More Visual Clearance

---

Add a little bottom margin to the focused token. This can increase the line box and reduce overlap:

```css
.token.focus-token {
  margin: 0 0.06em 0.34em;
}
```

If this affects line rhythm too much, use a smaller value:

```css
.token.focus-token {
  margin-bottom: 0.22em;
}
```

This does not replace the background fix. It only reduces how often the overlap happens.

---

B05 Mobile Adjustment

---

On mobile, the sentence wraps more often, so use a stronger compact style:

```css
@media (max-width: 900px) {
  .focus-hint-top,
  .focus-hint-bottom {
    padding: 0.16em 0.36em;
    max-width: min(12em, 56vw);
    backdrop-filter: blur(2px);
  }

  .focus-hint-bottom {
    top: calc(100% + 0.34em);
  }

  .token.focus-token {
    margin-bottom: 0.28em;
  }
}
```

This keeps hints readable on narrow screens without making the active sentence layout too tall.

---

B06 Optional Stronger Fix If Overlap Still Happens

---

If overlap remains common after the background fix, add a class to the active sentence when hints are visible:

```js
els.activeSentence.classList.toggle(
  "has-token-bottom-hint",
  runtime.settings.showMeaning || runtime.settings.showReading
);
```

Then increase active sentence line height only when needed:

```css
.active-sentence.has-token-bottom-hint .sentence-line {
  line-height: 1.9;
}
```

On mobile:

```css
@media (max-width: 900px) {
  .active-sentence.has-token-bottom-hint .sentence-line {
    line-height: 2.02;
  }
}
```

This is more layout-changing than the background fix, so it should be treated as the second step, not the first step.

---

C00 Acceptance Criteria

---

| ID     | Acceptance check                                                                         |
| ------ | ---------------------------------------------------------------------------------------- |
| AC-039 | The lower token hint remains attached to the active token                                |
| AC-040 | The lower token hint is readable when it overlaps Japanese sentence text                 |
| AC-041 | The upper romaji hint is readable when it overlaps nearby text                           |
| AC-042 | Hint backgrounds are theme-specific and work in Light and Dark themes                    |
| AC-043 | Hint backgrounds are semi-transparent, not fully opaque blocks                           |
| AC-044 | The active sentence remains visually calm and Zen-like                                   |
| AC-045 | Long meanings do not stretch the hint capsule across the whole sentence                  |
| AC-046 | Mobile wrapped sentences keep hints readable                                             |
| AC-047 | The fix does not move hints to a detached global area                                    |
| AC-048 | The focused token frame, arrow pointer, romaji, reading, and meaning still move together |

---

D00 Implementation Priority

---

| Priority | Fix                                                                            |
| -------- | ------------------------------------------------------------------------------ |
| 1        | Add theme variables for hint surfaces                                          |
| 2        | Add semi-transparent background, padding, border, and z-index to hint elements |
| 3        | Compact the lower hint layout and limit width                                  |
| 4        | Add small bottom margin to the focused token                                   |
| 5        | If needed, increase sentence line-height only when bottom hints are visible    |

The minimum acceptable fix is the themed semi-transparent hint background. The more complete fix is background plus small spacing plus responsive mobile tuning.
