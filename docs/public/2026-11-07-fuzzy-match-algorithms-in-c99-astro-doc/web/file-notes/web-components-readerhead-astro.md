---
file: "web/components/ReaderHead.astro"
---

This component extends Starlight's document head and restores preferences before the page is painted.

<!-- at: 1 -->
## Load local fonts and restore validated preferences

The regular body font is preloaded from the built assets. Saved text-size choices are accepted only from the known options; sidebar width is accepted only inside its numeric bounds. Retired focus and wrapping settings are ignored. Invalid JSON or disabled storage falls back to defaults. Source wrapping no longer depends on a stored setting.

