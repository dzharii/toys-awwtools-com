---
file: "scripts/prepare_starlight.py"
---

This repeatable build step joins authored file explanations with the exact current source. Astro Starlight renders the resulting pages.

<!-- at: 1 -->
## Prepare source records, file articles and evidence links

The script removes generated outputs, loads the standalone renderer and collects source paths, function locations and stable tags. Each file must have an authored explanation in `web/file-notes`; missing notes fail the build. Section anchors select contiguous source ranges. Every source line appears exactly once, while its original line ID remains linkable. The script copies raw files and measured evidence without changing their contents. It also creates the standalone offline reference; Pagefind excludes that duplicate copy.

