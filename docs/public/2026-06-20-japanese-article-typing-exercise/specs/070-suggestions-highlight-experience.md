2026-06-29
---

A00 Change Request: Token Guidance Highlighting

---

We want to add optional token guidance to the Japanese writing practice app.

The app already loads lesson files where each `jp-token` has a semantic `type`, such as `word`, `particle`, `place`, `name`, `verb`, `adjective`, `number`, `date`, `phrase`, or `punctuation`.

This change uses that existing token metadata to help learners see Japanese sentence structure more clearly. The XML stores only the semantic role. The app decides how to display that role.

The important product rule is this: guidance must help the learner without taking over the reading experience.

Some learners will like the extra structure. Some learners will find it distracting. The design must support both. The learner must be able to turn the helpers off directly from the main practice screen at any time.

---

B00 User Problem

---

Japanese text has no spaces between words. A beginner can often read individual kana or recognize a few kanji, but still struggle to see where one word ends and the next begins.

For example:

```txt
今日は上野で映画を見ます。
```

A learner may need help seeing this as:

```txt
今日は / 上野 / で / 映画 / を / 見ます / 。
```

The app already knows these boundaries because the article file is tokenized:

```html
<jp-token text="今日は" type="phrase" ...></jp-token>
<jp-token text="上野" type="place" ...></jp-token>
<jp-token text="で" type="particle" ...></jp-token>
<jp-token text="映画" type="word" ...></jp-token>
<jp-token text="を" type="particle" ...></jp-token>
<jp-token text="見ます" type="verb" ...></jp-token>
<jp-token text="。" type="punctuation"></jp-token>
```

The change should make this structure visible when the learner wants it.

---

C00 Product Goal

---

Add a `Guidance` control to the practice screen.

The learner can choose how much helper UI they want:

1. `Focus Only`
2. `Word Boundaries`
3. `Grammar Colors`
4. `Review Highlights`

Default mode:

```txt
Focus Only
```

This keeps the current calm experience by default.

The learner can turn all extra highlighting off by choosing `Focus Only`.

This control must be available from the main practice screen, not hidden only inside Settings. The learner should be able to change the mode while practicing, without opening a large dialog.

---

D00 Main Screen Placement

---

Add the `Guidance` control to the practice screen near the existing bottom controls.

Preferred desktop placement:

```txt
Bottom practice controls row
Left side or center-left
Before Previous / Pause / Next
```

Recommended desktop layout:

```txt
Guidance: [Focus Only v]    Previous    Pause    Next
```

Preferred mobile placement:

```txt
A compact row directly above Previous / Pause / Next
```

Recommended mobile layout:

```txt
Guidance
[Focus Only v]

Previous    Pause    Next
```

The control should remain visible during practice as long as the bottom controls are visible.

The control should not be placed only in the hamburger menu.

The control should not be placed only in Settings.

The control should not require a modal just to turn highlighting off.

The main product requirement is that the user can quickly disable the experience if it feels distracting.

---

E00 Control Behavior

---

Use a simple select control for the first implementation.

Suggested markup:

```html
<label class="guidance-control">
  <span>Guidance</span>
  <select id="guidance-mode-select">
    <option value="focus">Focus Only</option>
    <option value="boundaries">Word Boundaries</option>
    <option value="grammar">Grammar Colors</option>
    <option value="review">Review Highlights</option>
  </select>
</label>
```

Behavior:

1. Changing the select updates the screen immediately.
2. The selected value is saved in settings.
3. The selected value survives refresh.
4. The control is visible on the practice screen.
5. The same setting is also available in Settings under Display.
6. `Focus Only` removes all extra helper highlighting.

The select should feel quiet. It should not look like a large toolbar. It should use the same visual language as the current app controls.

---

F00 Guidance Modes

---

`Focus Only` is the current default practice experience.

Only the active token receives the normal focus/caret treatment. No extra token coloring appears. No word boundary helper appears. No review highlighting appears.

This mode is for learners who want the current calm reading surface.

`Word Boundaries` shows token segmentation without semantic colors.

Every visible token gets a very subtle boundary treatment. The goal is to help the learner see token separation, not to teach grammar roles.

Conceptual display:

```txt
[今日は][上野][で][映画][を][見ます][。]
```

The actual UI should not insert brackets. Use subtle underline, soft shadow, or rounded background.

`Grammar Colors` highlights tokens based on `token.type`.

Particles, verbs, places, names, dates, numbers, adjectives, phrases, words, and punctuation each get a stable visual treatment. The Japanese text color should stay normal. The highlight sits behind the text.

`Review Highlights` shows tokens that deserve attention based on session history.

At minimum, highlight tokens that were missed, skipped, or timed out. This mode helps the learner review weak points without coloring the whole sentence by grammar role.

---

G00 User Experience Requirements

---

The feature must be useful, but it must stay optional.

The learner should never feel trapped in a colorful or noisy mode. `Focus Only` should always be one click or tap away from the main practice screen.

The guidance control should stay available throughout the session.

The active token must remain the strongest visual element. If Grammar Colors is active and the active token is a verb, the active token still looks like the current active token first, and like a verb second.

The text must remain readable in light and dark themes.

The guidance styles must work when Japanese text wraps across multiple lines.

The guidance styles must not move romaji and meaning hints away from the active token.

The guidance styles must not insert real spaces into Japanese text.

The guidance styles must not change typing validation.

The guidance styles must not change token order.

The guidance styles must not change exported plain text.

---

H00 Data Model

---

Add one setting:

```js
wordGuidanceMode: "focus"
```

Allowed values:

```js
const GUIDANCE_MODES = [
  { value: "focus", label: "Focus Only" },
  { value: "boundaries", label: "Word Boundaries" },
  { value: "grammar", label: "Grammar Colors" },
  { value: "review", label: "Review Highlights" }
];
```

Add it to `DEFAULT_SETTINGS`:

```js
const DEFAULT_SETTINGS = {
  ...
  wordGuidanceMode: "focus"
};
```

Apply it to the document body:

```js
document.body.dataset.guidanceMode = runtime.settings.wordGuidanceMode || "focus";
```

This should happen inside `applySettings()`.

The XML file does not store guidance mode. This is a user preference, not article metadata.

---

I00 Token Rendering

---

Every visible token should render as a token span with its semantic type.

Example output:

```html
<span class="token" data-token-type="particle" data-token-key="4:2">を</span>
```

Required DOM metadata:

```txt
class="token"
data-token-type="<token type>"
data-token-key="<sentence index>:<token index>"
```

Recommended accessibility metadata:

```html
<span
  class="token"
  data-token-type="verb"
  data-token-key="2:5"
  title="Verb - 見ます"
  aria-label="見ます, Verb">
  見ます
</span>
```

Use token type labels:

```js
const TOKEN_TYPE_LABELS = {
  word: "Word",
  particle: "Particle",
  punctuation: "Punctuation",
  phrase: "Phrase",
  name: "Name",
  date: "Date",
  number: "Number",
  place: "Place",
  verb: "Verb",
  adjective: "Describer"
};
```

Use `Describer` in the UI for `adjective`. Keep the stored XML value as `adjective`.

---

J00 Render All Visible Sentences from Tokens

---

The active sentence is already token-aware. The previous sentence and remaining sentences should also render from tokens.

Affected areas:

1. Previous sentence
2. Active sentence
3. Remaining article text

This is required because Word Boundaries and Grammar Colors should work consistently across the whole reading surface.

The previous sentence should show token spans without active romaji or meaning hints.

The active sentence should show token spans and preserve the current active token hints.

The remaining sentences should show token spans without active hints.

Suggested helper shape:

```js
function renderSentenceTokens(sentence, options = {}) {
  const fragment = document.createDocumentFragment();

  sentence.tokens.forEach(token => {
    const span = document.createElement("span");
    span.className = "token";
    decorateTokenRole(span, token, sentence);

    if (options.focusTokenIndex === token.tokenIndex) {
      decorateFocusToken(span, token);
    } else {
      span.textContent = token.text;
    }

    fragment.append(span);
  });

  return fragment;
}
```

The actual function names can differ. The important part is that all visible sentence zones become token-aware.

---

K00 Grammar Color Palette

---

Use soft backgrounds and stronger lower-edge accents. Keep the Japanese text color unchanged.

Light theme token colors:

1. `word`: background `#EAF2F6`, edge `#0072B2`
2. `place`: background `#E4F0E8`, edge `#007A5A`
3. `name`: background `#F2E3D8`, edge `#A44C00`
4. `verb`: background `#EAF1DF`, edge `#4D7C00`
5. `adjective`: background `#EFE6F3`, edge `#8A4F73`
6. `particle`: background `#F4EAD1`, edge `#A95A00`
7. `phrase`: background `#ECE7DC`, edge `#676E4B`
8. `date`: background `#F8F2E6`, edge `#7B6500`
9. `number`: background `#EEF0F5`, edge `#4F63A3`
10. `punctuation`: transparent background, edge `var(--line-strong)`

Dark theme token colors:

1. `word`: background `#24323A`, edge `#56B4E9`
2. `place`: background `#25352E`, edge `#33B58B`
3. `name`: background `#3A2D27`, edge `#D55E00`
4. `verb`: background `#2A3427`, edge `#8DBD45`
5. `adjective`: background `#352B3A`, edge `#CC79A7`
6. `particle`: background `#3B3522`, edge `#E69F00`
7. `phrase`: background `#302E29`, edge `#A8AD82`
8. `date`: background `#27271F`, edge `#F0E442`
9. `number`: background `#292D3A`, edge `#8EA0E8`
10. `punctuation`: transparent background, edge `var(--line-strong)`

Define these as CSS variables.

Example:

```css
:root {
  --guide-word-bg: #eaf2f6;
  --guide-word-edge: #0072b2;
  --guide-place-bg: #e4f0e8;
  --guide-place-edge: #007a5a;
  --guide-name-bg: #f2e3d8;
  --guide-name-edge: #a44c00;
  --guide-verb-bg: #eaf1df;
  --guide-verb-edge: #4d7c00;
  --guide-adjective-bg: #efe6f3;
  --guide-adjective-edge: #8a4f73;
  --guide-particle-bg: #f4ead1;
  --guide-particle-edge: #a95a00;
  --guide-phrase-bg: #ece7dc;
  --guide-phrase-edge: #676e4b;
  --guide-date-bg: #f8f2e6;
  --guide-date-edge: #7b6500;
  --guide-number-bg: #eef0f5;
  --guide-number-edge: #4f63a3;
}
```

Dark theme:

```css
[data-theme="dark"] {
  --guide-word-bg: #24323a;
  --guide-word-edge: #56b4e9;
  --guide-place-bg: #25352e;
  --guide-place-edge: #33b58b;
  --guide-name-bg: #3a2d27;
  --guide-name-edge: #d55e00;
  --guide-verb-bg: #2a3427;
  --guide-verb-edge: #8dbd45;
  --guide-adjective-bg: #352b3a;
  --guide-adjective-edge: #cc79a7;
  --guide-particle-bg: #3b3522;
  --guide-particle-edge: #e69f00;
  --guide-phrase-bg: #302e29;
  --guide-phrase-edge: #a8ad82;
  --guide-date-bg: #27271f;
  --guide-date-edge: #f0e442;
  --guide-number-bg: #292d3a;
  --guide-number-edge: #8ea0e8;
}
```

---

L00 CSS Guidance Styling

---

Use the body dataset to activate modes.

Word Boundaries mode:

```css
body[data-guidance-mode="boundaries"] .token {
  border-radius: 0.22em;
  padding-inline: 0.06em;
  box-shadow: inset 0 -0.06em 0 var(--guide-boundary-edge);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

Grammar Colors mode:

```css
body[data-guidance-mode="grammar"] .token {
  border-radius: 0.22em;
  padding-inline: 0.08em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

body[data-guidance-mode="grammar"] .token[data-token-type="particle"] {
  background: var(--guide-particle-bg);
  box-shadow: inset 0 -0.09em 0 var(--guide-particle-edge);
}

body[data-guidance-mode="grammar"] .token[data-token-type="verb"] {
  background: var(--guide-verb-bg);
  box-shadow: inset 0 -0.09em 0 var(--guide-verb-edge);
}
```

Add selectors for all supported token types.

Focus token override:

```css
.token.focus-token {
  position: relative;
  z-index: 1;
}
```

If Grammar Colors weakens the active token visually, add a focused override using the app's existing active token variables.

The active token should never become visually weaker than surrounding colored tokens.

---

M00 Review Highlights

---

Review Highlights mode should use current session stats.

Minimum supported review states:

1. Missed token
2. Skipped token
3. Timed-out token

Priority:

```txt
missed > skipped > timed out
```

Suggested class names:

```txt
review-missed
review-skipped
review-slow
```

Suggested helper:

```js
function buildReviewTokenMap() {
  const map = new Map();

  runtime.stats.records.forEach(record => {
    if (!record.tokenId) return;

    const current = map.get(record.tokenId) || {};

    if (record.missed) current.missed = true;
    if (record.skipped) current.skipped = true;
    if (record.timedOut) current.slow = true;

    map.set(record.tokenId, current);
  });

  return map;
}
```

Apply classes while rendering tokens:

```js
if (runtime.settings.wordGuidanceMode === "review") {
  const review = reviewMap.get(token.id);

  if (review?.missed) span.classList.add("review-missed");
  else if (review?.skipped) span.classList.add("review-skipped");
  else if (review?.slow) span.classList.add("review-slow");
}
```

Suggested review colors:

```css
:root {
  --review-missed-bg: #f8e4df;
  --review-missed-edge: #b64b35;
  --review-skipped-bg: #ede7dc;
  --review-skipped-edge: #8a7861;
  --review-slow-bg: #f4ead1;
  --review-slow-edge: #a95a00;
}

[data-theme="dark"] {
  --review-missed-bg: #3b2824;
  --review-missed-edge: #e07a62;
  --review-skipped-bg: #302e29;
  --review-skipped-edge: #b7a891;
  --review-slow-bg: #3b3522;
  --review-slow-edge: #e69f00;
}
```

Review CSS:

```css
body[data-guidance-mode="review"] .token.review-missed {
  background: var(--review-missed-bg);
  box-shadow: inset 0 -0.1em 0 var(--review-missed-edge);
}

body[data-guidance-mode="review"] .token.review-skipped {
  background: var(--review-skipped-bg);
  box-shadow: inset 0 -0.1em 0 var(--review-skipped-edge);
}

body[data-guidance-mode="review"] .token.review-slow {
  background: var(--review-slow-bg);
  box-shadow: inset 0 -0.1em 0 var(--review-slow-edge);
}
```

---

N00 Legend

---

Grammar Colors should include a small legend.

The legend should not be permanently large. It should be available when needed and quiet when not needed.

Recommended behavior:

1. Show a small `Legend` button next to the Guidance control when mode is `Grammar Colors`.
2. Clicking `Legend` opens a compact dialog or popover.
3. The legend explains each role with the same color treatment used in the sentence.
4. Closing the legend returns focus to the practice flow.

Recommended label:

```txt
Legend
```

Legend entries:

1. Word
2. Place
3. Name
4. Verb
5. Describer
6. Particle
7. Phrase
8. Date
9. Number
10. Punctuation

Example legend item:

```html
<span class="legend-swatch" data-token-type="particle"></span>
<span>Particle</span>
```

The legend is important because users should not have to memorize colors.

---

O00 Settings Dialog

---

Add the same setting to the existing Settings dialog under Display.

Label:

```txt
Word guidance
```

Description:

```txt
Controls token boundary and grammar role highlighting.
```

Options:

1. Focus Only
2. Word Boundaries
3. Grammar Colors
4. Review Highlights

The setting should update immediately and save immediately.

The Settings dialog is a secondary location. The main practice-screen control is required.

---

P00 Accessibility

---

Color cannot be the only cue.

Every rendered token should have token role metadata.

Add `title` where practical:

```txt
Verb - 見ます
Particle - を
Place - 上野
```

Add `aria-label` where practical:

```txt
見ます, Verb
を, Particle
上野, Place
```

Use a lower-edge style in addition to background color.

Use a legend for Grammar Colors.

Keep Japanese text contrast high by preserving the normal text color. The highlight should be a background or edge treatment, not a replacement text color.

---

Q00 Mobile Requirements

---

The control must work on mobile without crowding the screen.

Recommended mobile layout:

```txt
Guidance
[Focus Only v]

Previous    Pause    Next
```

If the current bottom controls row becomes too crowded, put the Guidance control on its own row directly above the navigation buttons.

The control should be touch-friendly.

The select should not cover the active sentence.

The select should not overlap the bottom safe area.

Long Japanese text should wrap cleanly with token highlights.

The active token hint should remain attached to the active token after wrapping.

---

R00 Files Likely to Change

---

Expected files:

1. `index.html`

Add the practice-screen Guidance control and optional Legend button.

2. `styles.css`

Add guidance mode styles, token type palette, review highlight styles, legend styles, and mobile layout adjustments.

3. `app.js`

Add `wordGuidanceMode`, bind the control, apply body dataset, render token metadata, render previous and remaining text from tokens, add review highlight mapping, and add helper functions.

4. `rss.xml`

Update because this is a visible learner-facing feature.

No color data should be added to lesson XML files.

---

S00 Implementation Plan

---

Phase 1: Add setting and control.

Add `wordGuidanceMode` to default settings. Add the select control to the practice screen. Add the same option to Settings under Display. Persist the value. Apply it to `document.body.dataset.guidanceMode`.

Phase 2: Render token metadata.

Ensure every visible token span has `data-token-type`, `data-token-key`, `title`, and `aria-label`. Render previous and remaining sentences from token spans instead of plain sentence text.

Phase 3: Add Word Boundaries mode.

Add subtle boundary styling. Confirm the learner can see token segmentation without semantic color.

Phase 4: Add Grammar Colors mode.

Add CSS variables and selectors for all token types. Confirm light and dark themes stay readable.

Phase 5: Add Review Highlights mode.

Use session stats to mark missed, skipped, and timed-out tokens.

Phase 6: Add Legend.

Add a compact legend for Grammar Colors. Keep it small and optional.

Phase 7: Update RSS.

Follow the existing RSS update rules.

---

T00 Acceptance Criteria

---

The app starts in `Focus Only` mode by default.

The practice screen has a visible `Guidance` control.

The learner can turn helpers off from the main practice screen by selecting `Focus Only`.

The learner can switch modes without opening Settings.

The selected mode persists after refresh.

`Focus Only` preserves the current visual experience.

`Word Boundaries` shows token segmentation in previous, active, and remaining text.

`Grammar Colors` highlights tokens based on `token.type`.

`Review Highlights` highlights missed, skipped, and timed-out tokens.

The active token remains visually dominant in every mode.

Romaji and meaning hints remain attached to the active token.

Highlights work when text wraps across lines.

Light theme remains readable.

Dark theme remains readable.

Mobile layout remains usable.

The XML lesson files do not store color values.

Unknown token types render as `word` and log a warning.

Grammar Colors has an available legend.

The RSS feed is updated.

---

U00 Manual Verification

---

Start the app with a sample lesson.

Confirm the default mode:

```txt
Guidance shows Focus Only.
The practice screen looks like the current app.
Only the active token is strongly highlighted.
```

Switch to Word Boundaries:

```txt
Every visible token boundary becomes softly visible.
Japanese text still reads naturally.
No actual spaces are inserted.
```

Switch to Grammar Colors:

```txt
Particles, verbs, places, names, dates, numbers, adjectives, phrases, and words use distinct soft highlights.
The current active token remains the strongest visual element.
The legend explains the color roles.
```

Switch to Review Highlights:

```txt
Skip a token.
Mistype a token.
Let a token time out.
Review Highlights marks those tokens.
The highlight survives navigation within the current session.
```

Refresh the page:

```txt
The selected guidance mode is restored.
The current article and practice state still restore normally.
```

Test dark theme:

```txt
Grammar Colors remain readable.
Review Highlights remain readable.
Word Boundaries remain subtle.
```

Test mobile width:

```txt
Guidance control is usable.
Long Japanese sentences wrap cleanly.
Highlights do not break active token hints.
Bottom controls do not cover content.
```

---

V00 Developer Notes

---

Keep this change restrained.

The goal is not to redesign the app. The goal is to add optional learner helpers to the current calm reading surface.

Use the existing app architecture.

Use the existing settings persistence path.

Use safe DOM creation and `textContent`.

Use `token.type` as the source of truth.

Do not add dependencies.

Do not add a build step.

Do not store colors in XML.

Do not make Grammar Colors the default.

Do not hide the off switch in Settings only.

Do not make the page visually loud.

The best version of this feature feels like a quiet reading aid: useful when enabled, easy to disable, and never in the learner's way.
