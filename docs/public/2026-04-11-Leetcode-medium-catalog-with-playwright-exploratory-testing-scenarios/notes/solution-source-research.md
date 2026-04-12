# Solution Source Research Notes

This note records how the in-app solution workspace was sourced, attributed, and validated.

## Goal

For every curated problem, the site should expose actual implementations, grouped by language, with explicit attribution instead of anonymous pasted code.

That means each solution payload should capture:

- repository name
- repository origin URL
- source file URL
- local file path
- language
- implementation review annotations

## Source Families Used

The solution corpus is built from local repository content, not scraped live at render time.

Primary source families:

- `doocs_leetcode`
- `haoel_leetcode`
- `kamyu104_LeetCode-Solutions`
- `neetcode-gh_leetcode`
- `wisdompeak_LeetCode`

`test-123` was inspected as part of the required local inputs but did not provide stable origin metadata for solution attribution.

## Repository Origin Verification

Local `.git/config` inspection was used to confirm origin URLs:

- `doocs_leetcode` -> `https://github.com/doocs/leetcode`
- `haoel_leetcode` -> `https://github.com/haoel/leetcode`
- `kamyu104_LeetCode-Solutions` -> `https://github.com/kamyu104/LeetCode-Solutions`
- `neetcode-gh_leetcode` -> `https://github.com/neetcode-gh/leetcode`
- `wisdompeak_LeetCode` -> `https://github.com/wisdompeak/LeetCode`

These verified origins are used to construct stable blob URLs for file attribution.

## Search And Validation Notes

Web search was used as a cross-check for repository identity and public URL shape before wiring attribution into the generated payloads.

Representative checks:

- GitHub repo identity and canonical casing
- public availability of the matched repositories
- compatibility of local path conventions with GitHub blob URLs

Local repository inspection was then used to confirm the real file layout:

- `kamyu104_LeetCode-Solutions/Python/merge-nodes-in-between-zeros.py`
- `doocs_leetcode/solution/2100-2199/2181.Merge Nodes in Between Zeros/Solution.py`
- `neetcode-gh_leetcode/python/0003-longest-substring-without-repeating-characters.py`
- `doocs_leetcode/.../README_EN.md`
- `neetcode-gh_leetcode/articles/count-ways-to-build-good-strings.md`
- `wisdompeak_LeetCode/.../Readme.md`

## Attribution Policy

The UI does not present code as original project authorship.

Each implementation shown in the solution workspace includes:

- repository badge
- direct link to the repository root
- direct link to the source file
- local path for traceability inside the workspace

Supporting writeups are shown separately from executable implementations so article-style explanations are not confused with source code.

## Selection And Matching Policy

The generator currently includes only `high-precision` repository matches in the solution corpus.

Why:

- loose title matching risks incorrect attribution
- the solution workspace needs trust more than breadth
- high-precision matching keeps the displayed sources anchored to the curated problem ids

## Language Ordering Policy

Solutions are rendered by language in a consistent preferred order:

1. Python
2. C++
3. Java
4. Go
5. TypeScript
6. JavaScript
7. Rust
8. Kotlin
9. Swift
10. C#
11. C
12. Ruby
13. PHP
14. Scala
15. Dart
16. Elixir
17. Shell
18. SQL

This avoids random repo-order presentation and keeps the workspace predictable.

## Annotation Policy

Inline annotations are generated as review notes, not as claims of original source commentary.

They are meant to explain:

- the state being tracked
- the main pass or decision point
- the part of the implementation where branching matters
- the common local failure mode for the pattern

That keeps the code view useful while preserving attribution boundaries.

## Validation Snapshot

Post-generation checks confirmed:

- `data/solutions/*.json` exists for all 71 curated problems
- none of the solution payloads are empty
- language grouping is present for every problem
- language ordering is stable

Example validation result:

- `decode-ways.json` includes ordered languages and attributed implementations from multiple repositories
