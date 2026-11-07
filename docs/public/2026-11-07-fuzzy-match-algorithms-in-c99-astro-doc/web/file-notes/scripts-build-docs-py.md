---
file: "scripts/build_docs.py"
---

The standalone reference works when opened directly from disk. This renderer uses only Python's standard library and shares source highlighting with the Starlight preparation step.

<!-- at: 1 -->
## Escape source bytes before adding links and highlighting

`html.escape` handles text escaping. The small Markdown renderer supports this project's offline guide subset, not arbitrary Markdown. Tag definitions and C function names become links. Highlighting wraps tokens in spans without changing the copied text. The renderer emits numbered lines and a manifest; the independent checker compares those lines with the actual files. Astro, not this script, owns the published documentation layout.

