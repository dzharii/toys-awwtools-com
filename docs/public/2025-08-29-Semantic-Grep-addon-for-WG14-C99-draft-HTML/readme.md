# Semantic Grep add‑on for WG14 C99 draft HTML — Implementation (Current State)

This repo contains a vanilla JavaScript add‑on that overlays a fast, context‑aware search UI on top of the WG14/N1256 C99 TC3 HTML. The original HTML stays essentially untouched: we add a single `<script defer src="c99-semgrep.js">` tag; all DOM/CSS is injected at runtime.

The target is the single‑file C99 draft with hierarchical headings and large paragraphs, e.g., library sections like 7.19.6 and functions like `snprintf`, `vsnprintf`. [port70.net][1]

## What’s Implemented

- Search UI: fixed bar with Search, Only matches, Fuzzy, Clear, Help, and a live counter.
- Block filtering: shows only matching content blocks (`p, pre, dl, table, ol, ul`) plus the section heading of matched sections.
- Non‑intrusive highlighting: soft background + thin inner border for matched substrings; light outline around matched blocks.
- Sentence‑aware snippets: long paragraphs are trimmed to a soft window around matches (no broken words/sentences). Applies to `<p>` only; lists/tables/code remain intact.
- Stray text handling: free‑standing visible text nodes are wrapped at runtime so they participate in show/hide like blocks.
- Fuzzy search: VS Code‑style token matching (subsequence with bonuses for word starts, consecutive letters, and prefixes). Example: `snprf` matches `snprintf`.
- URL state: `#q=…&m=1|0&fz=1|0` for query, Only matches, and Fuzzy toggle.
- Performance: browser‑local inverted index, `requestIdleCallback`/chunked indexing, 200 ms debounce, LRU caches, rAF‑batched DOM writes.
- Accessibility: keyboard focus via `/`, `Esc` clears, semantic labels; highlight wrappers are inert spans that don’t affect reading order.

## Files

- `WG14_N1256 Septermber 7, 2007 ISO_IEC 9899_TC3.html` — source HTML (patched only to add the script tag at the end).
- `c99-semgrep.js` — the entire add‑on (UI, CSS injection, indexing, search, snippets, fuzzy, highlights, state).

## UI and Controls

- Search input: placeholder “Search C99…”.
- Buttons:
  - Only matches: collapses non‑matching blocks; headings shown only when their section contains a match.
  - Fuzzy: toggles fuzzy token expansion (on by default).
  - Clear: resets query, removes highlights/outlines/snippets, restores full document.
- Counter: “N blocks shown of M”.
- Shortcuts: `/` focuses the search; `Esc` clears and blurs. (No Enter shortcut is bound.)

## Search Semantics

- Case‑insensitive; ASCII‑ish normalization with diacritics folding.
- Tokens: space‑separated; terms are ANDed across blocks.
- Phrases: quoted strings are exact substring matches.
- Wildcards: `term*` (prefix), `*term` (suffix), `*term*` (contains).
- Fuzzy (toggle): VS Code‑like subsequence scoring with bonuses for word starts, consecutive letters, and prefixes. Each input token expands to top scoring vocabulary tokens; results are still ANDed across tokens. Highlights include the expanded words.

## Context and Snippets

- Blocks: `p, pre, dl, table, ol, ul` become searchable units; each gets a stable `sg-block` class at runtime. Headings `h1…h6` mark sections.
- Only Matches: hides all unmatched blocks; headings of unmatched sections are hidden.
- Snippets: for `<p>` blocks, a soft window is computed around earliest→latest match, aligned to word/sentence boundaries with a total max length; outside text is wrapped in temporary `sg-trim` spans (`display:none`).
- No permanent DOM changes: wrappers are added/removed per query.

## URL State

- `q`: query string (tokens, phrases, wildcards).
- `m`: `1` Only matches on; `0` show all.
- `fz`: `1` Fuzzy on; `0` fuzzy off.

## Configuration (optional)

Set before the script tag or in the console as `window.SemGrepDocsConfig` to tweak behavior:

```js
window.SemGrepDocsConfig = {
  headingSelector: 'h1,h2,h3,h4,h5,h6',
  blockSelector: 'p,pre,dl,table,ol,ul',
  excludeSelector: '',
  contextRadius: 0,
  snippet: { enabled: true, maxChars: 700, leadChars: 220, trailChars: 220, sentencePunct: '.!?', applyOnOnlyMatches: true },
  fuzzy:   { enabled: true, maxPerToken: 50, minScore: 3 }
};
```

## Implementation Notes

- Indexing: inverted index from token→block‑ids; vocabulary reused for fuzzy expansion.
- Fuzzy engine: subsequence scoring (prefix/word‑start/consecutive bonuses), expands each token to ≤50 candidates; cached.
- Highlighting: boundary‑aware in original text; no nested wrappers; caps work per frame to keep UI smooth.
- Stray text: text nodes outside known blocks/headings are wrapped in a lightweight `span.sg-block.sg-stray` at runtime so they hide/show correctly.
- Dark mode: theme‑aware colors via CSS variables; thin borders avoid relying on color alone.

## Acceptance Criteria (met)

- Single new tag in HTML: `<script defer src="c99-semgrep.js"></script>`.
- With an empty query, the document renders as before plus the fixed search bar.
- Typing `printf` (or `snprintf`, `vsnprintf`) filters quickly and shows only matching blocks and their section headings.
- Inline highlights are soft, and matched blocks carry a light outline.
- Clearing removes highlights, outlines, and snippet trimming with no artifacts.
- URL hash persists `q`, `m`, and `fz`.
- No external network requests; no frameworks.

## Known Limits / Next Steps

- Snippets apply to paragraphs only; extending to lists/pre/tables needs extra safety.
- Highlights do not span across element boundaries inside a block.
- Optional “context radius” (include neighbor blocks) exists but is 0 by default.
- Possible enhancement: Enter to jump to first match; section chips; worker indexing.

## How To Integrate

- Copy `c99-semgrep.js` next to the C99 HTML and add at the end of the file:

```html
<script defer src="c99-semgrep.js"></script>
```

[1]: https://port70.net/~nsz/c/c99/n1256.html "WG14/N1256  ISO/IEC 9899:TC3"
