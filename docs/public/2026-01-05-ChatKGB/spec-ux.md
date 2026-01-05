2026-01-05
A00 UI and UX refactor context (UI-only)

ChatKGB is a visual and presentational reskin of the existing ELIZA terminal page. The interaction pattern stays the same: a scrolling text transcript and a single-line input that submits on Enter. This document specifies only UI and UX styling changes, with light structural additions to HTML that exist solely to support layout and theming. No behavioral logic changes are required for the goals here.

The target feel is a Soviet-era bureaucratic console, inspired by the mood of "Papers, Please": dim, utilitarian, slightly worn, procedural, with restrained propaganda-era accent cues. The page should feel like an interrogation record terminal rather than a neon CRT hacker screen. The current green-on-black look is replaced with a darker warm background, muted amber/cream text, and selective muted red accents for stamps and warnings. The design must remain readable and not become a novelty filter that harms legibility.

Any CSS and HTML shown below is reference only. The implementer should adapt class names and structure to the existing file and use best judgment to maintain quality and avoid breaking current behavior.

B00 Design principles and constraints

The interface must remain fast, offline, and single-file friendly. The existing terminal usability must be preserved: strong contrast, predictable scrolling, no distracting animation by default, and input always visible.

The new look should communicate "bureaucratic record system" more than "retro CRT". The aesthetic should come primarily from palette, spacing, typography, separators, and small ornamental motifs (stamps, dossier header), not from heavy blur or aggressive scanlines.

The design should degrade gracefully. If a texture or overlay is unsupported, the page must still look correct and readable.

C00 Color system and palette

Use CSS variables so the theme can be tuned in one place. The baseline palette is warm dark background with desaturated amber text and a restrained red accent.

Recommended variables (adjust as needed for readability on real displays):

```css
:root {
  /* Core background */
  --bg: #0b0d0a;            /* near-black with slight warmth */
  --bg-2: #0f120d;          /* panels, header blocks */
  --bg-3: #151a12;          /* subtle elevation */

  /* Text */
  --fg: #d6cfb6;            /* dirty cream */
  --fg-dim: #a79f86;        /* secondary text */
  --fg-faint: #7a745f;      /* meta, separators */

  /* Accent */
  --accent: #a0352a;        /* muted red (stamp) */
  --accent-2: #7f6a2b;      /* olive/gold secondary accent */
  --warn: #b36b2c;          /* amber warning */

  /* Lines and borders */
  --line: rgba(214, 207, 182, 0.18);
  --line-strong: rgba(214, 207, 182, 0.28);

  /* Focus */
  --focus: rgba(163, 106, 44, 0.55);

  /* Shadows */
  --shadow: rgba(0, 0, 0, 0.45);
}
```

If the existing page supports multiple color modes (green/amber/white), keep those modes but redefine them as "themes" that still fit the Soviet-era concept. "Amber" becomes the default ChatKGB theme. "Green" becomes a secondary "archival terminal" theme with less neon.

D00 Typography and text treatment

Keep a monospace font, but choose a more utilitarian set. Prefer system monospace with a slightly heavier weight and improved readability. Avoid ultrathin raster looks.

Recommended font stack:

```css
:root {
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
}
```

Increase letter spacing slightly and reduce line glare. Force uppercase in the transcript display for tone, but do not force uppercase in the input element if that would harm user typing comfort. Instead, transform only the rendered transcript lines.

Recommended baseline:

```css
body {
  font-family: var(--mono);
  font-size: 16px;
  line-height: 1.35;
  letter-spacing: 0.02em;
  background: var(--bg);
  color: var(--fg);
}
```

E00 Layout and key UI elements

E01 Container and framing

The current page reads like raw terminal output at the top. Shift to a framed console layout with a fixed header and fixed input, and a scrollable log in between. This is a visual and UX improvement without changing how messages are appended.

Minimum structural intent:

A top "Case Header" panel that never scrolls away.
A middle scroll area that contains the transcript.
A bottom input bar that never scrolls away.

Reference HTML shape (adapt to existing IDs and elements):

```html
<div class="ckgb">
  <header class="ckgb__header">
    <div class="ckgb__title">CHATKGB</div>
    <div class="ckgb__meta">
      <span class="ckgb__kv">CASE: 0001</span>
      <span class="ckgb__kv">SUBJECT: UNREGISTERED</span>
      <span class="ckgb__kv">SESSION: ACTIVE</span>
    </div>
    <div class="ckgb__status">
      <span class="ckgb__kv">PROMPT: ☭</span>
      <span class="ckgb__kv">THEME: AMBER</span>
      <span class="ckgb__kv">TRACE: OFF</span>
    </div>
  </header>

  <main class="ckgb__log" id="log"></main>

  <footer class="ckgb__input">
    <span class="ckgb__prompt">☭</span>
    <input id="input" class="ckgb__field" autocomplete="off" />
  </footer>
</div>
```

If adding a header feels too invasive, implement the same layout by styling existing elements and inserting a minimal wrapper div, but the fixed header improves the "bureaucratic terminal" vibe significantly.

E02 Spacing and alignment

Use generous padding and consistent gutters so the screen feels like a form and a record. Keep the transcript left-aligned with a fixed gutter. Avoid centered text.

Suggested container sizing:

```css
.ckgb {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}
.ckgb__header,
.ckgb__input {
  padding: 14px 18px;
}
.ckgb__log {
  padding: 16px 18px 22px 18px;
  overflow: auto;
}
```

E03 Header styling

The header should look like a stamped dossier card: boxed, slightly elevated, with thin divider lines and muted accents.

```css
.ckgb__header {
  background: linear-gradient(180deg, var(--bg-2), var(--bg));
  border-bottom: 1px solid var(--line-strong);
  box-shadow: 0 8px 24px var(--shadow);
}

.ckgb__title {
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 14px;
  color: var(--fg);
}

.ckgb__meta,
.ckgb__status {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: var(--fg-dim);
  font-size: 13px;
}

.ckgb__kv {
  padding-left: 10px;
  position: relative;
}
.ckgb__kv::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 1px;
  background: var(--line-strong);
}
```

E04 Transcript typography and separators

The transcript should feel like a typed record with rigid structure. Add subtle separators, exchange numbers, and labels. Even if labels are produced by JS, CSS can style them.

If the transcript is currently plain text, consider wrapping each appended line in a span or div with a class. If that is too invasive, use CSS for preformatted blocks and add minimal pseudo-structure via monospace and borders.

Reference styling for line blocks:

```css
.ckgb__log {
  font-size: 15px;
  color: var(--fg);
  text-transform: uppercase;
}

.ckgb__line {
  white-space: pre-wrap;
  word-break: break-word;
}

.ckgb__line--subject {
  color: var(--fg);
}

.ckgb__line--officer {
  color: var(--fg-dim);
}

.ckgb__divider {
  margin: 10px 0 12px 0;
  height: 1px;
  background: var(--line);
}
```

E05 Input bar

Make the input feel like a terminal prompt on a metal desk: a darker strip, hard edges, strong focus ring. Prompt glyph "☭" should be visually anchored and slightly accented.

```css
.ckgb__input {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-2);
  border-top: 1px solid var(--line-strong);
}

.ckgb__prompt {
  color: var(--accent-2);
  font-weight: 700;
  width: 16px;
  text-align: center;
}

.ckgb__field {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--fg);
  font: inherit;
  padding: 10px 0;
  caret-color: var(--accent-2);
}

.ckgb__field:focus {
  box-shadow: 0 0 0 3px var(--focus);
  border-radius: 2px;
}
```

F00 Soviet-era "Papers, Please" atmosphere effects (subtle, optional)

F01 Paper grain and worn panel texture

Use a very subtle noise overlay. Keep it faint and disable it for users who prefer reduced motion if you implement animated noise (recommended: static only).

```css
.ckgb::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(214, 207, 182, 0.10), transparent 35%),
    radial-gradient(circle at 70% 60%, rgba(163, 53, 42, 0.08), transparent 40%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: overlay;
}
```

F02 Vignette

A light vignette adds "desk terminal" depth without harming legibility.

```css
.ckgb::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
  opacity: 0.35;
}
```

F03 Scanlines and CRT blur

Do not apply blur by default. Scanlines, if used, must be extremely subtle and should be optional (a theme toggle or an existing *crt command). If *crt exists, repurpose it to enable only a light scanline overlay, not text blur.

G00 Accent components: stamps, warnings, and callouts

G01 Stamp styling

A "stamp" line is a purely visual annotation appended after certain OFFICER lines. Style it as boxed, red, slightly skewed, but do not rotate text so much that it becomes unreadable.

```css
.ckgb__stamp {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  border: 1px solid rgba(160, 53, 42, 0.75);
  color: var(--accent);
  letter-spacing: 0.08em;
  font-weight: 700;
  font-size: 12px;
  transform: skewX(-8deg);
  opacity: 0.92;
}
```

If you cannot add a real DOM element, you can simulate stamp styling by wrapping the stamp token in brackets and coloring that line.

G02 Warning callouts

For script load errors or command errors, use a warning style that still fits the theme, using amber rather than bright red.

```css
.ckgb__warn {
  color: var(--warn);
}
```

H00 Theme toggles and compatibility with existing color commands

If the page already supports commands like *green, *amber, *white, *black, implement them as theme switches that set a data attribute on the root container, not as ad hoc style overrides. This keeps the system maintainable and makes it easy to add ChatKGB variants.

Reference approach:

```css
.ckgb[data-theme="amber"] { /* defaults already in :root or scoped */ }
.ckgb[data-theme="green"] {
  --fg: #b8e6b8;
  --fg-dim: #89b889;
  --accent-2: #59a06b;
  --bg: #070a07;
  --bg-2: #0a120a;
  --accent: #a0352a; /* keep stamps muted red */
}
.ckgb[data-theme="paper"] {
  --bg: #0c0b08;
  --bg-2: #14110b;
  --fg: #d2c7ae;
  --accent-2: #8a7a3a;
}
```

If the current code modifies CSS directly, the implementer can map that behavior to setting `data-theme` and updating the status line. This document does not require that mapping, but it is the cleanest way to support both legacy commands and the new visual system.

I00 Accessibility and readability requirements

Contrast must remain high. The cream text on dark background should be readable in normal daylight. Avoid pure red for long text blocks. Red is for stamps, not paragraphs.

Focus states must be clearly visible on the input field. Do not remove outlines without replacing them.

Support `prefers-reduced-motion`. If any animations exist, disable them under reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  .ckgb::before,
  .ckgb::after {
    animation: none !important;
  }
}
```

J00 Acceptance criteria for UI-only delivery

The page opens with the new theme active by default (amber Soviet-era palette) and remains legible.

The transcript area scrolls independently, with header and input always visible.

The prompt glyph "☭" is visible to the left of the input field. If the glyph cannot render, there is a clear fallback and the UI remains usable.

The look is recognizably "bureaucratic dossier terminal" rather than neon CRT. Any scanlines or blur are optional and off by default.

No CSS changes break existing behavior for input, commands, or transcript rendering.


Open Graph tags to include:

```html
<meta property="og:type" content="website">
<meta property="og:title" content="ChatKGB">
<meta property="og:description" content="A Soviet-era terminal parody: ChatKGB interrogates your inputs in retro console style.">
<meta property="og:image" content="./logo.png">
<meta property="og:image:alt" content="ChatKGB poster style logo featuring the hammer and sickle and a retro terminal scene">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="ChatKGB">
<meta name="twitter:description" content="A Soviet-era terminal parody: ChatKGB interrogates your inputs in retro console style.">
<meta name="twitter:image" content="./logo.png">
```
