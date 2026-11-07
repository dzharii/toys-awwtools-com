---
file: "src/content.config.ts"
---

This file connects Astro's content collection to Starlight's documentation loader and schema.

<!-- at: 1 -->
## Validate generated pages as Starlight documents

The loader reads the documentation pages generated under `src/content/docs`. The schema validates frontmatter such as titles and table-of-contents options. Authored inputs remain under `web/pages` and `web/file-notes`; generated content is replaced by each documentation build.

