A00

Short fix spec for the misaligned center-row slot highlight background

The bug is a layout geometry mismatch between the visible character width and the tiny slot frame/highlight width. The letters are rendering wider than the per-reel frame that is supposed to contain them, so the highlight borders (and the center-band look) appear offset and too narrow.

This is not primarily an animation bug. It is a per-cell sizing bug (CSS + JS geometry contract).

B00

Where the bug is coming from

The brittle part is the current width calculation path:

* In `script.js`, `measureGeometry()` computes `reelWidthPx` from measured glyph width.
* Then it writes `--reel-fit-width`.
* In `style.css`, `.reel-frame` uses `width: max(var(--reel-width), var(--reel-fit-width));`
* But `.reel-frame` also has horizontal padding (`padding: 3px 4px`) and borders, which reduce the actual inner viewport width.
* Meanwhile `.reel-symbol` text size can scale responsively and visually exceed the inner viewport width, especially when effects/highlights are active.

So the measured width and the rendered slot interior are not the same box. That makes the layout brittle and causes exactly the "letter is not inside the slot border" problem you see.

C00

Primary fix (recommended): separate content width from frame width

Redesign the reel sizing contract so JS measures the symbol content width, and CSS derives the frame width from that content width plus known padding/border values.

In other words:

* JS should measure and set a CSS variable for the inner symbol/viewport width (content box width).
* CSS should size `.reel-viewport` from that variable.
* CSS should size `.reel-frame` from viewport width + frame padding + borders.

This removes the current ambiguity where `--reel-fit-width` is applied to the outer frame while the measurement is conceptually for the glyph.

D00

Exact places to change

In `style.css`:

* `.reel-frame`
* `.reel-viewport`
* `.reel-symbol`
* `:root` variables related to reel width / padding

In `script.js`:

* `measureGeometry()`
* possibly `measureMaxHexGlyphWidth()` output usage only (not the function itself)

E00

What to change in CSS (conceptually)

1. Introduce explicit horizontal sizing variables for reel internals, for example:

* reel frame horizontal padding
* reel symbol horizontal padding
* reel content fit width (set by JS)

2. Make `.reel-viewport` width explicit (the actual box that should contain the glyph).

3. Make `.reel-frame` width be computed from viewport width + frame padding + borders.

4. Keep `.reel-symbol { width: 100%; }`, but make sure the symbol padding is included in the viewport sizing, not fighting against it.

This makes the slot border and the character align reliably during resize.

F00

What to change in JS (conceptually)

In `measureGeometry()`:

Right now `reelWidthPx` is a hybrid estimate. Replace this with a measured content width value that intentionally includes:

* max glyph width
* symbol-side padding
* a small safety buffer (anti-alias / glow / bold edge tolerance)

Then write that to a new CSS variable (for the viewport/content width), not directly to the frame width.

This is the key fix for brittleness.

G00

Why this will fix the resize corruption too

When the window resizes, the font size changes and the glyph width changes. If the JS re-measures glyph width and updates the viewport width variable, the entire slot cell reflows from a single source of truth.

Right now the layout breaks because the outer frame width and inner symbol width are not tied cleanly. After the change, resize remains stable because:

* symbol width is measured
* viewport width is derived from symbol width
* frame width is derived from viewport width

H00

Secondary stabilizer (small but useful)

Add a tiny extra safety margin in the measured width for highlighted states, because lucky-match borders/glows make the visual misalignment more obvious even if the text technically fits.

This does not need to be large. A few pixels is enough. The goal is to prevent edge-touching under all states.

I00

Optional structural improvement (if Codex wants a cleaner redesign)

If Codex prefers a more robust layout, make each reel a small grid container with:

* fixed outer frame
* fixed inner viewport
* centered symbol strip

and move all horizontal padding responsibility to one layer only (preferably viewport or symbol, but not both frame and symbol). Right now the horizontal spacing responsibility is split across multiple layers, which is why it is fragile.

J00

Short copy-ready instruction for Codex

The per-reel slot highlight is misaligned because the reel cell width is being measured/applied to the wrong box. `measureGeometry()` computes a glyph-based width, but CSS applies it to `.reel-frame` while `.reel-frame` also has horizontal padding and borders, so the actual `.reel-viewport` is narrower than the measured character width. Please refactor reel sizing so JS sets an inner viewport/content width variable, then derive `.reel-frame` width from that value plus explicit frame padding/borders. This should make the highlighted slot border consistently contain the center character and remain stable on resize.
