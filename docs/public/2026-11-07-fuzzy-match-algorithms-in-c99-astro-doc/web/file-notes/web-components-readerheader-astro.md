---
file: "web/components/ReaderHeader.astro"
---

The header keeps search and text size visible on every page. It reuses Starlight's search, title and theme components.

<!-- at: 1 -->
## Place text size beside search and initialize shared controls

The labeled selector changes body and code sizes together. The navigation script attaches handlers after the document is ready and on Astro page loads. A data flag prevents duplicate listeners on the same selector. Narrow screens keep the selector visible and use Starlight's mobile navigation button.

