# Browser layout and control checks

Chrome checks used the published source articles. The iframe supplied a measured CSS viewport; it did not emulate a physical phone or touch input.

| Viewport | Document width | Source width | Article width | Horizontal overflow |
|---|---:|---:|---:|---|
| Desktop, 1363 px wide | 1348 px excluding scrollbar | 1021.5 px | 1021.5 px | None |
| Portrait, 390 x 844 | 375 px excluding scrollbar | 343 px | 343 px | None |
| Landscape, 844 x 390 | 829 px excluding scrollbar | 523.25 px | 523.25 px | None |
| Small portrait, 320 x 640 | 305 px excluding scrollbar | 273 px | 273 px | None |

All tested source lines used pre-wrap. The 320-pixel page still fit at 22-pixel body text. The mobile menu opened and followed its parsing-guide link. Text size remained visible beside search. Desktop keyboard resizing changed 272 to 288 pixels; dragging set 320 pixels and survived reload. Collapse reduced navigation to a 52-pixel rail. The original Reading settings panel and wrapping toggle were absent. Search returned 18 visible result links for Levenshtein. Light and dark source/diagram rendering were inspected.

The navigation controls were made sticky after the landscape check showed that scrolling its links could move Hide out of view. The final verification checks this correction separately.

The optional Playwright CLI suite could not launch the local browser: Chromium exited with SIGTRAP. The normal Playwright browser download endpoint returned a Site Unavailable HTML document. These are verification limits, not passes. Interactive Chrome supplied the results above. The reusable CLI check remains in scripts/check_layout.mjs for other hosts.
