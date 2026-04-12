# Coverage Matrix

This matrix separates what was tested, how it was tested, and what remains outside the audited scope.

## Tested

| Surface | Coverage type | Evidence | Result |
| --- | --- | --- | --- |
| Initial load and workspace render | Stable acceptance + exploratory | [acceptance log](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/logs/2026-04-12t00-27-10.242z.log), [landing screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-01-iteration-01-landing-inventory.png>) | Pass |
| Search, sort, reset, quick narrowing | Stable acceptance + exploratory | [acceptance log](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/logs/2026-04-12t00-27-10.242z.log), [narrow-state screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-06-iteration-06-search-sort-and-narrow-states.png>) | Pass |
| Sidebar disclosure and advanced filter surface | Exploratory | [sidebar screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-02-iteration-02-sidebar-and-filters.png>) | Pass |
| Recommendation strip and guide strip | Stable acceptance + exploratory | [overview screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-03-iteration-03-orientation-and-recommendations.png>) | Pass after fix |
| Roadmap filtering and roadmap node selection | Stable acceptance + exploratory | [roadmap screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-04-iteration-04-roadmap-operation.png>) | Pass |
| Catalog selection and compact mode | Stable acceptance + exploratory | [catalog screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-05-iteration-05-catalog-scanning.png>) | Pass |
| Pick next | Stable acceptance | [acceptance log](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/logs/2026-04-12t00-27-10.242z.log) | Pass |
| Solved, pinned, note, reload persistence | Stable acceptance + exploratory | [detail persistence screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-07-iteration-07-persistence-and-state-combination.png>) | Pass |
| Clear saved state | Stable acceptance | [acceptance log](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/logs/2026-04-12t00-27-10.242z.log) | Pass |
| Widen reading mode | Stable acceptance + exploratory | [detail screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-08-iteration-08-detail-reading-surface.png>) | Pass |
| Inline spoiler solutions | Stable acceptance + exploratory | [session report](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/report.md>) | Pass |
| Focused solution workspace | Stable acceptance + exploratory | [solution screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-09-iteration-09-solution-surfaces.png>) | Pass |
| Topic-guide navigation | Stable acceptance + exploratory | [topic screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-10-iteration-10-topic-guides-and-exit-path.png>) | Pass |
| Exploratory artifact integrity | Exploratory | [hostile session screenshots](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots>) | Pass after fix |

## Not Fully Tested

| Surface | Why it is not fully covered |
| --- | --- |
| External outbound navigation to LeetCode, GitHub, and third-party learning resources | Links are present and rendered, but this audit did not treat third-party site availability/content as part of the product acceptance surface |
| Clipboard behavior for `Copy code` and `Copy paths` | Buttons are visible; clipboard side effects were not asserted in this session |
| Keyboard-only navigation and focus order | This was not run as an accessibility-specific audit |
| Screen-reader narration quality | The audit did not include assistive-tech execution |
| Mobile and tablet layout | This session stayed on desktop viewport because the charter goal was full desktop product hostility, not responsive coverage |

## Current Acceptance Count

- Stable Playwright acceptance tests: `10 passed`
- Latest green run: [2026-04-12t00-27-10.242z.log](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/logs/2026-04-12t00-27-10.242z.log)
