2026-06-29
---

A00 Change Request: Optional Visual Vocabulary Atlas Support

---

We want to add optional picture hints to the Japanese lesson app.

The lesson XML may contain a visual vocabulary atlas. The atlas is a sprite sheet: one raster image divided into fixed cells. Tokens can reference a sprite key with `visual="..."`. When the learner hovers, focuses, or taps a token that has a valid visual sprite, the app shows a small custom tooltip with the matching image.

The important rule: this feature must never break normal practice.

If the lesson has no atlas, the app behaves exactly as it does today. If the atlas XML is malformed, the image is missing, the sprite key is unknown, or the atlas image cannot be used, the app logs a warning and continues without picture hints.

This is an optional learner helper, not a required lesson feature.

---

B00 XML Shape We Need to Support

---

The app should support this optional lesson-level block:

```xml
<jp-visual-atlases>
  <jp-visual-atlas
    key="conbini-visual-atlas-01"
    asset="conbini-visual-atlas-01"
    profile="practical-19x19-66"
    width="1254"
    height="1254"
    columns="19"
    rows="19"
    cell-size="66"
    style="zen-editorial-icon-v1"
    title="Conbini visual vocabulary atlas">
    <jp-sprite
      key="onigiri"
      text="おにぎり"
      reading="おにぎり"
      meaning="rice ball"
      type="word"
      concept-kind="object"
      cell="10"
      row="0"
      col="10"
      art="triangular rice ball with black seaweed wrap" />
  </jp-visual-atlas>
</jp-visual-atlases>
```

The actual atlas image lives in `jp-assets`:

```xml
<jp-assets>
  <jp-image
    asset="conbini-visual-atlas-01"
    mime="image/png"
    alt="Conbini visual vocabulary sprite atlas"
    title="Conbini visual vocabulary atlas">
    <jp-image-data>
      data:image/png;base64,...
    </jp-image-data>
  </jp-image>
</jp-assets>
```

Tokens opt into picture hints with `visual`:

```xml
<jp-token
  text="おにぎり"
  type="word"
  delay="medium"
  reading="おにぎり"
  romaji="onigiri"
  meaning="rice ball"
  visual="onigiri">
</jp-token>
```

Tokens without `visual` have no picture hint.

---

C00 Data Model

---

Extend the parsed lesson model with optional visual atlas data.

Suggested shape:

```js
lesson.visualAtlases = [
  {
    key: "conbini-visual-atlas-01",
    asset: "conbini-visual-atlas-01",
    profile: "practical-19x19-66",
    width: 1254,
    height: 1254,
    columns: 19,
    rows: 19,
    cellSize: 66,
    style: "zen-editorial-icon-v1",
    title: "Conbini visual vocabulary atlas",
    imageDataUrl: "data:image/png;base64,...",
    sprites: new Map([
      ["onigiri", {
        key: "onigiri",
        atlasKey: "conbini-visual-atlas-01",
        text: "おにぎり",
        reading: "おにぎり",
        meaning: "rice ball",
        type: "word",
        conceptKind: "object",
        cell: 10,
        row: 0,
        col: 10,
        x: 660,
        y: 0,
        size: 66
      }]
    ])
  }
];

lesson.visualSprites = new Map([
  ["onigiri", spriteRecord]
]);
```

Keep `lesson.visualSprites` as a flattened lookup so rendering can resolve `token.visual` quickly.

Token model should preserve the new attribute:

```js
token.visual = tokenEl.getAttribute("visual") || "";
```

Do not require `visual`.

---

D00 Parser Rules

---

The parser should read visual atlases after it reads assets, or it should resolve atlas assets after both sections are parsed.

Recommended parser order:

```txt
Parse lesson metadata.
Parse sections, sentences, and tokens.
Parse jp-assets into asset map.
Parse jp-visual-atlases.
Resolve every atlas asset from the asset map.
Build sprite lookup.
Attach token.visual values during token parsing.
Validate visual references softly.
```

Soft validation means warnings only. Do not reject the lesson.

Example parser helper:

```js
function parseVisualAtlases(root, assetMap) {
  const atlasRecords = [];
  const spriteLookup = new Map();

  const atlasEls = root.querySelectorAll("jp-visual-atlas");

  atlasEls.forEach(atlasEl => {
    const parsed = parseOneVisualAtlas(atlasEl, assetMap);

    if (!parsed) {
      return;
    }

    atlasRecords.push(parsed);

    parsed.sprites.forEach(sprite => {
      if (spriteLookup.has(sprite.key)) {
        console.warn(`[visual-atlas] Duplicate sprite key ignored: ${sprite.key}`);
        return;
      }

      spriteLookup.set(sprite.key, sprite);
    });
  });

  return {
    visualAtlases: atlasRecords,
    visualSprites: spriteLookup
  };
}
```

---

E00 Atlas Validation

---

This feature currently supports one fixed atlas profile:

```txt
profile: practical-19x19-66
width: 1254
height: 1254
columns: 19
rows: 19
cell-size: 66
```

Validation should be strict for the atlas, but soft for the lesson.

If atlas validation fails, disable that atlas and continue.

Validation checks:

```txt
jp-visual-atlas exists only as optional data.
key is present.
asset is present.
asset resolves to a jp-image.
image data is a valid data URL.
width is numeric.
height is numeric.
columns is numeric.
rows is numeric.
cell-size is numeric.
width === 1254.
height === 1254.
columns === 19.
rows === 19.
cellSize === 66.
width / columns === cellSize.
height / rows === cellSize.
every sprite key is present.
every sprite cell is in range 0..360.
every sprite row is in range 0..18.
every sprite col is in range 0..18.
cell === row * 19 + col.
```

Warning examples:

```js
console.warn("[visual-atlas] Missing atlas asset: conbini-visual-atlas-01");
console.warn("[visual-atlas] Invalid atlas geometry for conbini-visual-atlas-01");
console.warn("[visual-atlas] Sprite onigiri has invalid cell coordinates");
console.warn("[visual-atlas] Token references unknown visual sprite: onigiri");
```

Warnings should help development, but they should not interrupt the learner.

---

F00 Sprite Coordinate Math

---

For the fixed atlas:

```txt
cellSize = 66
columns = 19
```

Coordinate formula:

```js
function spritePosition(sprite) {
  return {
    x: sprite.col * 66,
    y: sprite.row * 66
  };
}
```

Or from cell:

```js
function cellToPosition(cell) {
  const col = cell % 19;
  const row = Math.floor(cell / 19);

  return {
    row,
    col,
    x: col * 66,
    y: row * 66
  };
}
```

Example:

```txt
cell 10 -> row 0, col 10, x 660, y 0
cell 19 -> row 1, col 0, x 0, y 66
cell 55 -> row 2, col 17, x 1122, y 132
```

---

G00 Settings

---

Add one user setting:

```js
pictureHintsEnabled: true
```

Default recommendation:

```js
pictureHintsEnabled: true
```

Reason: the feature is passive. It only appears when the learner hovers, focuses, or taps a token. It does not change the sentence display by itself.

The user must be able to turn it off directly from the main practice screen.

Add it to persisted settings:

```js
const DEFAULT_SETTINGS = {
  // existing settings...
  pictureHintsEnabled: true
};
```

Apply the setting during render and tooltip behavior checks.

---

H00 Main Practice Screen Control

---

Add a compact control on the main practice screen.

Recommended placement:

```txt
Bottom practice controls row.
Near Guidance mode.
Visible during practice.
Not hidden only inside Settings.
```

Suggested UI:

```html
<label class="picture-hints-control">
  <input id="picture-hints-toggle" type="checkbox" />
  <span>Picture hints</span>
</label>
```

Behavior:

```txt
Checked: hover/focus/tap picture hints are enabled.
Unchecked: all visual atlas tooltips are disabled.
```

This control must be available while practicing. If the learner finds the image hints distracting, they should be able to turn them off immediately.

Also add the same setting in the Settings dialog under Display, but the main-screen toggle is required.

---

I00 Token Rendering Changes

---

Every token span should carry its visual key if the token has one.

Example DOM:

```html
<span
  class="token"
  data-token-type="word"
  data-token-key="12:4"
  data-visual="onigiri">
  おにぎり
</span>
```

Rendering helper:

```js
function decorateTokenVisual(span, token, lesson) {
  if (!token.visual) {
    return;
  }

  const sprite = lesson.visualSprites?.get(token.visual);

  if (!sprite) {
    span.dataset.visualMissing = token.visual;
    return;
  }

  span.dataset.visual = token.visual;
  span.classList.add("has-visual-hint");
}
```

Do not render an inline image inside the sentence. The sentence should remain normal text. The image appears only in the custom tooltip.

---

J00 Desktop Tooltip Behavior

---

On desktop, show the picture hint when the user hovers over a token with a valid sprite.

Also support keyboard focus.

Triggers:

```txt
pointerenter on token with data-visual
pointermove while active
pointerleave hides tooltip
focusin on token with data-visual
focusout hides tooltip
Escape hides tooltip
```

The tooltip follows the mouse cursor during hover.

The tooltip should be a custom app element, not the browser `title` tooltip.

Suggested DOM:

```html
<div id="visual-hint-tooltip" class="visual-hint-tooltip" hidden>
  <div class="visual-hint-sprite"></div>
</div>
```

Optional small caption can be added later. For v1, keep image-only or image plus tiny meaning if it already fits the app style. The main requirement is the image.

Pointer behavior:

```js
function onTokenPointerEnter(event) {
  const tokenEl = event.target.closest(".token[data-visual]");

  if (!tokenEl) return;
  if (!runtime.settings.pictureHintsEnabled) return;

  const sprite = getSpriteForTokenElement(tokenEl);

  if (!sprite) return;

  showVisualHint(sprite, event.clientX, event.clientY);
}

function onTokenPointerMove(event) {
  if (!visualHintState.visible) return;

  moveVisualHint(event.clientX, event.clientY);
}

function onTokenPointerLeave() {
  hideVisualHint();
}
```

Positioning:

```js
function moveVisualHint(clientX, clientY) {
  const offset = 18;
  const tooltip = els.visualHintTooltip;

  let left = clientX + offset;
  let top = clientY + offset;

  const rect = tooltip.getBoundingClientRect();
  const padding = 12;

  if (left + rect.width > window.innerWidth - padding) {
    left = clientX - rect.width - offset;
  }

  if (top + rect.height > window.innerHeight - padding) {
    top = clientY - rect.height - offset;
  }

  tooltip.style.left = `${Math.max(padding, left)}px`;
  tooltip.style.top = `${Math.max(padding, top)}px`;
}
```

---

K00 Mobile Tooltip Behavior

---

On mobile, there is no hover.

Show the picture hint when the user taps a token with a valid sprite.

Behavior:

```txt
Tap token with visual sprite -> show custom hint.
Tap another visual token -> replace hint content.
Tap outside hint and token -> hide hint.
Scroll page -> hide hint or keep it pinned only if simple and stable.
Escape/back behavior is not required for v1.
```

Recommended mobile placement:

```txt
Fixed near the top of the practice area.
Centered horizontally.
Not under the finger.
Not covering the active token if avoidable.
```

Suggested mobile visual behavior:

```txt
A small floating card appears near the top.
The card contains the sprite image.
The card fades out when user taps elsewhere or continues practice.
```

Use the same `#visual-hint-tooltip` element, but apply a mobile class:

```js
function showVisualHintForTap(sprite) {
  renderVisualHintSprite(sprite);

  els.visualHintTooltip.classList.add("visual-hint-tooltip-mobile");
  els.visualHintTooltip.hidden = false;
}
```

Mobile CSS can pin it:

```css
.visual-hint-tooltip.visual-hint-tooltip-mobile {
  position: fixed;
  left: 50%;
  top: 72px;
  transform: translateX(-50%);
}
```

If the app already has a top header, adjust `top` so the tooltip appears below it.

---

L00 Tooltip Sprite Rendering

---

The tooltip should show a cropped region from the atlas image.

Use CSS background positioning.

Suggested sprite display size:

```txt
desktop: 132 x 132 px
mobile: 148 x 148 px
source cell: 66 x 66 px
scale factor desktop: 2
scale factor mobile: about 2.24
```

Use 132 px first because it scales exactly from 66 px.

Sprite render helper:

```js
function renderVisualHintSprite(sprite) {
  const displaySize = 132;
  const scale = displaySize / sprite.size;

  const spriteEl = els.visualHintTooltip.querySelector(".visual-hint-sprite");

  spriteEl.style.width = `${displaySize}px`;
  spriteEl.style.height = `${displaySize}px`;
  spriteEl.style.backgroundImage = `url("${sprite.imageDataUrl}")`;
  spriteEl.style.backgroundSize = `${sprite.atlasWidth * scale}px ${sprite.atlasHeight * scale}px`;
  spriteEl.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
}
```

For a `1254 x 1254` atlas and `132 px` display size:

```txt
scale = 132 / 66 = 2
background-size = 2508 x 2508
```

Example for `onigiri` at row 0, col 10:

```txt
source x = 660
source y = 0
display scale = 2
background-position = -1320px 0px
```

---

M00 Tooltip CSS

---

Base CSS:

```css
.visual-hint-tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  padding: 8px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--paper) 94%, white 6%);
  border: 1px solid var(--line);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(8px);
}

.visual-hint-tooltip[hidden] {
  display: none;
}

.visual-hint-sprite {
  width: 132px;
  height: 132px;
  border-radius: 12px;
  background-repeat: no-repeat;
  image-rendering: auto;
}

.token.has-visual-hint {
  cursor: help;
}
```

Dark theme support:

```css
[data-theme="dark"] .visual-hint-tooltip {
  background: color-mix(in srgb, var(--paper) 88%, black 12%);
  border-color: var(--line-strong);
}
```

Mobile:

```css
@media (max-width: 720px) {
  .visual-hint-tooltip {
    pointer-events: auto;
  }

  .visual-hint-tooltip.visual-hint-tooltip-mobile {
    left: 50%;
    top: 72px;
    transform: translateX(-50%);
  }

  .visual-hint-tooltip.visual-hint-tooltip-mobile .visual-hint-sprite {
    width: 148px;
    height: 148px;
  }
}
```

When using 148 px, the scale is fractional. That is acceptable for display. The source crop math remains exact.

For the cleanest first version, use `132 x 132` on both desktop and mobile.

---

N00 Event Binding

---

Use delegated event listeners from the practice root instead of binding every token individually.

Suggested binding:

```js
els.practiceRoot.addEventListener("pointerenter", onVisualTokenPointerEnter, true);
els.practiceRoot.addEventListener("pointermove", onVisualTokenPointerMove, true);
els.practiceRoot.addEventListener("pointerleave", onVisualTokenPointerLeave, true);
els.practiceRoot.addEventListener("click", onVisualTokenClick, true);
els.practiceRoot.addEventListener("focusin", onVisualTokenFocusIn);
els.practiceRoot.addEventListener("focusout", onVisualTokenFocusOut);
document.addEventListener("keydown", onVisualHintKeyDown);
document.addEventListener("pointerdown", onDocumentPointerDown);
```

Click behavior should handle mobile and desktop gracefully.

```js
function onVisualTokenClick(event) {
  const tokenEl = event.target.closest(".token[data-visual]");

  if (!tokenEl) return;
  if (!runtime.settings.pictureHintsEnabled) return;

  const sprite = getSpriteForTokenElement(tokenEl);

  if (!sprite) return;

  if (isCoarsePointer()) {
    event.preventDefault();
    showVisualHintForTap(sprite);
  }
}

function isCoarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}
```

---

O00 Missing or Broken Atlas Behavior

---

The app must stay resilient.

Cases and behavior:

```txt
No jp-visual-atlases:
No picture hint feature for this lesson.
No warning needed.

jp-visual-atlas exists but asset missing:
Warn once.
Ignore that atlas.

Atlas geometry invalid:
Warn once.
Ignore that atlas.

Sprite has invalid row, col, or cell:
Warn once.
Skip that sprite.

Token has visual but sprite missing:
Warn once per sprite key.
Token still renders normally.

Image data invalid:
Warn once.
Ignore that atlas.

Picture hints setting is off:
Do not show tooltip.
No warning.
```

Use a small warning helper to avoid console spam:

```js
const visualAtlasWarnings = new Set();

function warnVisualAtlasOnce(code, message) {
  if (visualAtlasWarnings.has(code)) {
    return;
  }

  visualAtlasWarnings.add(code);
  console.warn(message);
}
```

Example:

```js
warnVisualAtlasOnce(
  `missing-sprite:${token.visual}`,
  `[visual-atlas] Token references unknown sprite: ${token.visual}`
);
```

---

P00 Accessibility

---

Picture hints are supplementary. The app should remain usable without them.

Requirements:

```txt
Do not remove existing romaji or meaning hints.
Do not make picture hints required to complete practice.
Do not rely on picture hints for validation.
Respect pictureHintsEnabled.
Support keyboard focus where token spans are focusable.
Hide tooltip on Escape.
```

If tokens are not currently keyboard-focusable, do not force a large focus refactor in this change. But if the active token already receives focus or can be targeted, show the picture hint on focus.

Potential future improvement:

```html
<span class="token has-visual-hint" tabindex="0" aria-label="おにぎり, rice ball, picture hint available">
  おにぎり
</span>
```

For v1, avoid adding hundreds of tab stops unless the current app already supports token-level keyboard navigation.

---

Q00 Settings UI Sync

---

The main-screen toggle and Settings dialog must stay synchronized.

When user changes main-screen toggle:

```js
runtime.settings.pictureHintsEnabled = els.pictureHintsToggle.checked;
saveSettings();
applySettings();
hideVisualHint();
```

When user changes Settings dialog:

```js
runtime.settings.pictureHintsEnabled = value;
saveSettings();
applySettings();
render();
hideVisualHint();
```

When `applySettings()` runs:

```js
document.body.dataset.pictureHints =
  runtime.settings.pictureHintsEnabled ? "on" : "off";

els.pictureHintsToggle.checked = !!runtime.settings.pictureHintsEnabled;
```

If no valid visual atlas exists for the current lesson, the toggle may be disabled or hidden.

Recommended behavior:

```txt
If lesson has no valid visual sprites, hide the Picture hints toggle.
If lesson has valid visual sprites, show the toggle.
```

Alternative acceptable behavior:

```txt
Always show the toggle, but disable it when no atlas exists.
```

I recommend hiding it when no atlas exists to reduce UI noise.

---

R00 Files Likely to Change

---

`app.js`

Add XML parsing for `jp-visual-atlases`, preserve token `visual`, build sprite lookup, add tooltip behavior, add event handlers, add setting persistence, add resilience warnings.

`index.html`

Add `Picture hints` toggle to the main practice controls. Add tooltip root:

```html
<div id="visual-hint-tooltip" class="visual-hint-tooltip" hidden>
  <div class="visual-hint-sprite"></div>
</div>
```

`styles.css`

Add toggle styling if needed, tooltip styling, token cursor styling, mobile tooltip placement.

`rss.xml`

Update because this is a visible learner-facing feature.

Lesson XML files

Optional. Only lessons that want picture hints need `jp-visual-atlases`, atlas image asset, and token `visual` attributes.

---

S00 Implementation Plan

---

Phase 1: Parse optional atlas XML.

Read `jp-visual-atlases`, resolve image asset, validate geometry, build `lesson.visualSprites`.

Phase 2: Preserve token visual references.

Read `visual` from `jp-token`. Add `data-visual` only when the sprite resolves.

Phase 3: Add setting and main-screen toggle.

Add `pictureHintsEnabled`. Persist it. Add the main practice screen control. Hide or disable it when current lesson has no valid visual sprites.

Phase 4: Add custom tooltip.

Create one tooltip element. Render cropped sprite with CSS background positioning. Show on hover and focus. Follow cursor on pointer move. Hide on pointer leave and Escape.

Phase 5: Add mobile tap behavior.

On coarse pointer, tap a visual token to show the tooltip as a fixed top card. Tap outside to hide.

Phase 6: Add resilience warnings.

Malformed atlas should never break practice. Warn once and continue.

Phase 7: Update RSS.

Add a short learner-facing note.

---

T00 Acceptance Criteria

---

The app loads old lessons without atlas XML.

Old lessons behave the same as before.

The app loads a lesson with `jp-visual-atlases`.

The app resolves the atlas image from `jp-assets`.

Tokens with valid `visual` references get `data-visual`.

Tokens without `visual` render normally.

Malformed atlas XML logs warnings but does not break the lesson.

Missing atlas image logs a warning and disables picture hints for that atlas.

Unknown token visual keys log a warning once and render normally.

The main practice screen has a `Picture hints` control when valid visual sprites exist.

The user can turn picture hints off from the main practice screen.

When picture hints are off, hover, focus, and tap do not show the tooltip.

On desktop, hovering a visual token shows a custom tooltip with the sprite image.

On desktop, the tooltip follows the mouse cursor.

On pointer leave, the tooltip disappears.

On mobile, tapping a visual token shows a fixed custom hint card with the sprite image.

Tapping outside hides the mobile hint.

The tooltip uses the correct sprite cell from the atlas.

The tooltip does not use browser `title` behavior as the primary UI.

The feature does not affect typing validation.

The feature does not affect romaji or meaning hints.

The feature does not affect plain text export.

---

U00 Manual Test Script

---

Use an old lesson without atlas XML.

```txt
Expected: lesson loads normally.
Expected: no picture hint errors.
Expected: Picture hints control is hidden or disabled.
```

Use the conbini lesson with a valid atlas.

```txt
Expected: lesson loads normally.
Expected: Picture hints control appears.
Expected: tokens such as おにぎり, コーヒー, 袋, レシート, カード have picture hints.
```

Hover on desktop:

```txt
Hover おにぎり.
Expected: custom tooltip appears.
Expected: tooltip shows rice ball sprite.
Expected: tooltip follows cursor.
Expected: pointer leave hides tooltip.
```

Turn feature off:

```txt
Uncheck Picture hints.
Hover おにぎり.
Expected: no tooltip appears.
Expected: normal typing still works.
```

Test mobile:

```txt
Tap おにぎり.
Expected: fixed hint card appears near top.
Tap outside.
Expected: hint disappears.
```

Break the XML intentionally:

```txt
Set visual="missing_key" on one token.
Expected: warning in console.
Expected: token renders normally.
Expected: app does not crash.
```

Break the atlas asset intentionally:

```txt
Change jp-visual-atlas asset to missing asset.
Expected: warning in console.
Expected: lesson loads normally.
Expected: picture hints are disabled for that lesson.
```

---

V00 Developer Notes

---

Keep this feature small and optional.

The atlas is a learning aid, not part of the core typing engine.

Do not block lesson loading because of atlas problems.

Do not add separate image files per token.

Do not put sprite coordinates on tokens.

Do not render icons inline inside Japanese sentences.

Do not let the tooltip fight with the active token UI.

Do not require the learner to use picture hints.

The correct behavior is quiet: when the atlas exists and the user wants it, picture hints appear. When the atlas is absent, broken, or disabled, the app continues like nothing happened.
