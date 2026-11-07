---
file: "ad-hoc/rewrite_headings.py"
---

This retained editorial migration records the earlier heading cleanup. It is in `ad-hoc/` because the rewrite has already been applied and is not a normal build step.

<!-- at: 1 -->
## Preserve the old wording-to-heading migration without rerunning it

The replacement table names technical subjects for former generic headings. The script edits Markdown, report string literals and the older offline renderer, then rewrites the original heading audit CSV. Running it again would replace that historical before/after audit with the current text. Current prose should be edited in its owning file; current rendered headings are checked by the ordinary documentation validation.

