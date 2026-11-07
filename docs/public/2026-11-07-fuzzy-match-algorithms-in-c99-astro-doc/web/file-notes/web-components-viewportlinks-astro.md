---
file: "web/components/ViewportLinks.astro"
---

This component is a repeatable manual layout-test utility. It is on the unlisted layout-check page, outside the normal article navigation.

<!-- at: 1 -->
## Size the article's CSS viewport inside a frame

Each button supplies a literal width/height pair and updates the iframe's dimensions. The frame has its own viewport, so its media queries use 390, 844 or 320 pixels rather than the outer desktop width. The test records the frame's `innerWidth` and `innerHeight` to verify that geometry. The scroll container contains the deliberately wide landscape test without widening the outer page. This checks layout and ordinary controls, not physical touch input or a device's browser chrome.
