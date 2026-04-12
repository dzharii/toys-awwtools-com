# Iteration Log

## Iteration 1

Read the four requirement documents, extracted the hard requirements, and confirmed that the repo root had no existing site implementation to preserve.

## Iteration 2

Inspected all six local repositories and mapped their different indexing styles:

- `doocs_leetcode`: solution directories with explanation pages.
- `haoel_leetcode`: README index table with direct solution links.
- `kamyu104_LeetCode-Solutions`: large category tables with tagged entries.
- `neetcode-gh_leetcode`: machine-readable problem metadata plus articles, hints, and language files.
- `test-123`: flat file mirror with slug-based filenames.
- `wisdompeak_LeetCode`: topic folders with per-problem readmes and code.

## Iteration 3

Built the canonical generator and LeetCode validation path:

- Added a curated 49-problem Medium-only blueprint.
- Added GraphQL validation against LeetCode for title, slug, difficulty, and topic tags.
- Added high-precision and broad repository matching.
- Emitted `data/problems.json`, `data/problems.js`, and `data/generation-summary.json`.

## Iteration 4

Reviewed the first generator run and tightened the scan strategy:

- Pruned `.git` and other noisy directories from repo traversal.
- Kept broad matching only as a fallback.
- Recorded explicit exclusions for items removed because of difficulty or overlap.

## Iteration 5

Implemented the main site:

- Built a dense filter deck with search, phase, concept, clarity, effort, and signal filters.
- Added split-view browsing with authored detail cards.
- Added persistent solved state, pins, notes, compact mode, and selected-problem state.
- Added an interactive SVG roadmap tied to the same filtered dataset.

## Iteration 6

Added the teaching layer:

- Created separate HTML topic-guide pages for linked lists, tree traversal, BFS, DFS, graph traversal, two pointers, sliding window, backtracking, and dynamic programming.
- Linked topic pages from the main explorer and linked the topic pages back to relevant curated problems.
- Added examples, traces, and small C snippets where they clarified the concept.

## Iteration 7

Ran a coherence pass across data, UI, and navigation:

- Ensured the main explorer works without `fetch`, so `file://` remains usable.
- Added hash-based deep linking from topic guides into the main explorer.
- Checked that roadmap state, list state, and detail state stay synchronized.

## Iteration 8

Ran a verification pass:

- `python -m py_compile scripts/generate_dataset.py`
- `node --check app.js`
- `node --check topic.js`
- `node --check data/topic-guides.js`

Residual constraint:

- The generator is correct but not fast on this filesystem. That is acceptable for this project because the site itself is fully static after generation.
