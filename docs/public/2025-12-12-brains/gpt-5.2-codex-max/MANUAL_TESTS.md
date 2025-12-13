# Manual Acceptance Checks

Open `index.html` in a modern browser and walk through the list.

## Visual shell (Milestone 1)

- On load, the character reads as a side-profile head and the cavity is clearly visible.
- The cavity shows the “nothing in there” label (empty state).

## Life (Milestone 2)

- Watch for ~30 seconds: the head subtly bobs (breathing) and the eye blinks occasionally.
- The pupil does small micro-saccades (tiny drifts + quick snaps), without sliding outside the eye.

## First brain (Milestone 3)

- Type a short phrase: the text appears inside the cavity (never outside it), and the rim stays on top.
- Delete back to empty: the brain fades/drains away and the empty label returns.

## Adaptive filling (Milestone 4)

Paste each string and confirm “short looks big, long looks dense”:

- One character: `A`
- Short phrase: `tiny thought`
- URL: `https://example.com/something?brain=true#lol`
- Paragraph:
  `This is a slightly longer paragraph of words that should coil up nicely inside the head cavity.`
- Extreme (don’t worry if it gets abstract): paste a few hundred characters (or run `BrainToy.services.debug.runSmokeTests()`).

## Fluid reflow + stability (Milestone 5–6)

- Type quickly: the layout updates smoothly (no harsh jumps, no flicker).
- Hold a key down: the page stays responsive.
- Resize the window: the brain reflows without breaking clipping.
- Toggle `reduced motion`: breathing and eye motion stop, and brain “pop” animations are minimized.

## Console helpers

- `BrainToy.services.debug.toggleDebug(true)`
- `BrainToy.services.debug.runSmokeTests()`

