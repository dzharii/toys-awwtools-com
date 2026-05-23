# Sprite Assets

The source files in `../../img-source/` were inspected with ImageMagick.

Findings:
- `website-design.png` is a 1672x941 visual reference.
- Each sprite source sheet is 2172x724.
- The sheets contain title text, frame labels, grid lines, margins, and inconsistent whitespace.
- Raw sheets are not rendered in the UI.

Production output:
- `atlases/*.png`: cleaned 8x4 atlases, 2048x1024, 32 frames each.
- `sprites.json`: metadata used by the app and documented for future tooling.
- `scripts/slice-sprites.mjs`: repeatable slicing pipeline.

Runtime rendering:
- `render=sprite` draws exactly one 256x256 frame with CSS background-position.
- `frameIndex = clamp(round(progressRatio * 31), 0, 31)`.
- The right-side participant is flipped only when the selected source sprite faces the wrong direction.

Regenerate atlases:
```bash
node scripts/slice-sprites.mjs
```

Keep intermediate individual frames:
```bash
KEEP_SPRITE_FRAMES=1 node scripts/slice-sprites.mjs
```
