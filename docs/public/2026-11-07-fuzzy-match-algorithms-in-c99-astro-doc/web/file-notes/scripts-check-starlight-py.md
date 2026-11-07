---
file: "scripts/check_starlight.py"
---

This post-build check validates the generated website against the project files. It catches missing pages and altered source before publication.

<!-- at: 1 -->
## Check links, headings, article coverage and exact source text

`HTMLParser` extracts IDs, links, headings and source-line text. Local links must resolve within `dist`, and fragments must identify actual elements. Every raw source download and every reconstructed displayed line must equal the source file. The check also requires Starlight metadata, local fonts, Pagefind assets, one global text-size selector and the absence of the retired Reading settings controls. Its JSON report records counts and source hashes.

