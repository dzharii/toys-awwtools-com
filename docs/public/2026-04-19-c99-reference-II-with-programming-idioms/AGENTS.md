# AGENTS.md

## Project purpose
- This project is an offline, self-contained C99 reference viewer.
- It intentionally stores reference data as embedded XML inside `index.html` and renders it with vanilla JavaScript.
- Design goal: one file can be opened locally, embedded elsewhere, or downloaded and mined for structured data.

## What is in this folder
- `index.html`: UI shell + all reference data embedded as multiple `<script type="application/xml" id="library-xml-...">...</script>` blocks.
- `app.js`: parser + renderer + search + copy-to-clipboard behavior.
- `styles.css`: layout and visual styles.
- `data-to-process/`: source XML snapshots used to build/embed the XML blocks.
- `lib-asvd-microlight-0.0.7/`: local syntax highlighter.

## Architecture in one pass
1. Browser loads `index.html`.
2. `app.js` finds XML blocks with selector:
   - `script[type="application/xml"][id^="library-xml-"]`
3. Each block is parsed with `DOMParser(..., 'application/xml')`.
4. Parsed model is rendered into `#content`; parse errors are shown in `#errors`.
5. Sidebar/search (`#toc`, `#searchInput`) are built from the parsed model.

## XML data model (important)
Top hierarchy used by the renderer:
- `document`
- `category` (`id`, `name`)
- `header` (`id`, `name`)
- `function` (`id`, `name`, `kind`)

Common function subnodes:
- `signature`
- `summary`
- `parameters` -> `param`
- `returns` -> `return`
- `notes` -> `note`
- `examples` -> `example`

Special case:
- `kind="internal_note"` is rendered as a header note card, not a normal function card.

## Why embedded XML is intentional
- Keeps UI and data in one distributable artifact.
- Enables zero-network usage from local disk.
- Allows third parties to:
  - embed this page as a viewer, or
  - download `index.html` and extract XML blocks for their own tooling.

## Data extraction contract (external consumers)
Consumers should treat each `script[type="application/xml"]` block as an independent XML document.
Recommended stable selectors:
- `script[type="application/xml"][id^="library-xml-"]`
- inside each XML: `category > header > function`

Do not rely on visual DOM output for data ingestion; use embedded XML blocks.

## Editing rules (high priority)
- Treat embedded XML as the source of truth for reference content.
- Keep XML well-formed; one broken block should not block others, but it will degrade content.
- Preserve stable ids (`category/header/function`) once published; external links/tools may depend on them.
- Keep `kind` semantics intact (`function`, `function_or_macro`, `idiom`, `internal_note`).
- If adding new blocks, keep `id="library-xml-..."` prefix so parser discovery still works.

## Safety and rendering constraints
- `app.js` sanitizes inline HTML in descriptive fields to an allowlist (`p`, `strong`, `em`, `code`, `a`, `br`).
- Rich HTML outside this allowlist will be escaped/flattened.
- External links in descriptive content should use `http://` or `https://`.

## Quick validation after edits
- Open `index.html` locally and verify:
  - no XML parse errors in `#errors`
  - sidebar/search still lists categories/functions
  - signatures/examples still render and copy buttons work
- Optional structural check:
```bash
python3 - <<'PY'
import re, xml.etree.ElementTree as ET
s=open('index.html', encoding='utf-8').read()
blocks=re.findall(r'<script[^>]*type="application/xml"[^>]*>(.*?)</script>', s, re.S)
for i,b in enumerate(blocks,1):
    ET.fromstring(b.strip())
print('ok:', len(blocks), 'xml blocks')
PY
```
