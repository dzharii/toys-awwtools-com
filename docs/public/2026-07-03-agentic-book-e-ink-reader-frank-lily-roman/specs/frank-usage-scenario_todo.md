# specs/frank-usage-scenario_todo.md

Source: specs/frank-usage-scenario.md
Pass: Frank (demanding daily long-form reader)

Frank reads for hours and will leave for a better tool if the app feels weak,
generic, or uncomfortable. These items judge serious reading quality, typography,
page/scroll behavior, privacy, full feature coverage, and credible E Ink feel.

---

## A00 Acceptance Checklist

### Serious reading comfort
- [x] Default surface is warm off-white paper with local Literata, not a raw white page.
- [x] Line width (measure) is constrained to a comfortable range, not full-bleed.
- [x] Line height and paragraph spacing default to relaxed, book-like values.
- [x] Subtle paper grain adds texture without harming legibility (adjustable).
- [x] Left alignment by default with optional justification.
- [x] Long single-line text wraps rather than overflowing.

### Page mode as a first-class experience
- [x] Page turns feel intentional, with an E Ink wash + ghost, not a jump-cut.
- [x] Page count is stable — the progress readout does not jitter between values.
- [x] Forward/back, first/last, and click zones all work.
- [x] Reading position is preserved across font/size/measure changes.

### Scroll mode as a real alternative
- [x] Scroll mode is smooth and does not flash on ordinary scrolling.
- [x] Position is preserved when switching between page and scroll.

### Typography control that matters to a power reader
- [x] Multiple high-quality serif choices (Literata, Source Serif 4, Charis SIL, Merriweather).
- [x] A legible option (Atkinson Hyperlegible) for tired eyes.
- [x] Size, line height, measure, paragraph spacing, alignment all adjustable and persistent.

### Visual E Ink credibility
- [x] Grayscale wash + ghost image during refresh.
- [x] Occasional full refresh vs frequent partial refresh (configurable interval).
- [x] Intensity levels so Frank can tune the effect.
- [x] Reduced-motion path stays calm and legible.

### Privacy Frank can trust
- [x] No book content is ever stored; only preferences persist.
- [x] No network requests while reading.

### Feature completeness
- [x] Themes (warm/cool/dark/high-contrast) + contrast toggle for different lighting.
- [x] Diagnostics available for the curious without cluttering the main UI.
- [x] Recovers cleanly from bad files without losing the session.

---

## B00 Validation Checklist

- [x] Read a long book fixture end-to-end in page mode; page turns and count are stable.
- [x] Switched to scroll mode mid-book; position preserved; no flashing on scroll.
- [x] Changed font family and size; text reflowed and position was preserved.
- [x] Toggled themes including dark and high-contrast.
- [x] Confirmed no stored book content and no network requests.
- [ ] Manual: judged whether the E Ink effect and paper surface feel good over a long session.

---

## C00 Risks And Edge Cases

- [x] Page-count instability (font-load race) — fixed; verified stable across re-measure.
- [x] Paper not filling the screen in page mode — fixed (absolute-positioned paper).
- [x] Scroll mode not scrolling — fixed (bounded viewport height).
- [ ] Very large books: paginates with a warning; extreme sizes not stress-tested for turn latency.

---

## D00 Final Review

- [x] Earlier design flaws found during Frank review were fixed, not papered over.
- [x] Reading defaults are book-like out of the box.
- [ ] Remaining limitation: subjective comfort/credibility needs a human long-form session.
