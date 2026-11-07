---
file: ".gitignore"
---

The ignore file separates authored inputs and execution evidence from rebuildable files.

<!-- at: 1 -->
## Keep source and reports while excluding generated caches

Executables, Node dependencies, Astro content caches, generated Markdown pages and `dist` are rebuildable. They stay outside source commits. The release ZIP explicitly adds the built site and offline reference, so ignoring them in Git does not remove them from the downloadable deliverable.

