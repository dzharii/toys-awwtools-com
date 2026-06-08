# Test Results

---

A00 Environment

---

Generated at: `2026-06-08T02:21:09.688Z`

Node.js: `v22.16.0`

sharp: `0.34.5`

Command used:

```sh
npm run samples:overwrite
```

---

B00 Summary

---

Converted images: `5`

Failed images: `0`

All five bundled images converted successfully. Each output passed the structural validation used by the sample runner: row count, column count, and non-empty text content.

---

C00 Per-File Results

---

| File | Input | Output grid | Output bytes | Validation |
| --- | ---: | ---: | ---: | --- |
| `anime-kernel-cat.jpg` | `1024x1024` | `104x62` | `6827` | `pass` |
| `cartoon-dog-room.jpg` | `600x400` | `96x38` | `3999` | `pass` |
| `formal-portrait.jpg` | `1024x1792` | `92x97` | `9350` | `pass` |
| `green-owl-yard.png` | `1024x1024` | `118x71` | `8767` | `pass` |
| `pixel-farmer.jpg` | `1024x1024` | `110x66` | `7641` | `pass` |

---

D00 Visual Sanity Notes

---

The outputs were inspected in plain text form. The validation is intentionally pragmatic rather than perceptual: it confirms that generated text is structurally sound and non-empty, then records a coarse visual check.

`anime-kernel-cat.jpg`: The generated text preserves the high-contrast figure outline and the visible overlay region near the hands.

`cartoon-dog-room.jpg`: The generated text preserves the flat cartoon regions, large eyes, body outline, chair area, and surrounding flame-like shapes.

`formal-portrait.jpg`: The generated text preserves the head, hair, beard, shoulders, suit, and tie structure.

`green-owl-yard.png`: The generated text preserves the centered owl shape, darker background mass, lawn, and side wall contrast.

`pixel-farmer.jpg`: The generated text preserves the square pixel-art composition, face region, hair mass, shoulders, sky, and farm background.

---

E00 Additional Checks

---

The sample runner passed `node --check`. The source module was imported successfully as an ES module. Logs are included in `test-results/node-check.txt`, `test-results/source-import-check.txt`, and `test-results/final-sample-run.log`.
