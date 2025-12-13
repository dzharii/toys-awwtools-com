# Hand tests / acceptance checks

Run by opening `index.html` in a modern browser (Chrome/Edge/Firefox/Safari).

## Smoke inputs

1. One character: `a`
2. Short phrase: `put a thought in my head`
3. URL: `https://example.com/this/is/a/very/silly/url?with=params&and=more`
4. Paragraph:
   - `A longer paragraph lands here. It should get smaller and denser, but never spill outside the skull. The rim stays on top. The character keeps breathing. The joke holds.`
5. Extreme (paste a lot):
   - paste `brains ` repeated until it feels “too long”

## Visual shell (Milestone 1)

- On load, the head is in profile and the cavity is visibly hollow.
- The cavity shows “nothing in there” and subtle dust motes.

## Life (Milestone 2)

- Watch for ~30 seconds: the head gently bobs/sways.
- The pupil makes tiny micro-saccades.
- Occasional blinks happen (unless Reduced motion is on).

## First brain (Milestone 3)

- Type the first non-space character: brain text appears inside the cavity (never outside).
- The skull rim stays visually on top of the brain text.

## Adaptive filling (Milestone 4)

- One character becomes large and feels like it occupies most of the cavity.
- Medium input becomes a readable snake-like coil.
- Very long input becomes dense “brain noise” but stays clipped.

## Fluid reflow (Milestone 5)

- Type quickly: the brain reflows without harsh jumps or flicker.
- Delete to empty: the brain drains away and the empty cavity vibe returns.

## Stability and polish (Milestone 6)

- Paste extreme input: the page stays responsive (it may truncate internally).
- Resize the window: everything remains stable, and the brain reflows.
- Toggle “Reduced motion”: animations reduce immediately.

