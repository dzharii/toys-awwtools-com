# Findings And Fixes

Findings are ordered by severity and by whether they were fixed during the audit.

## Fixed During This Audit

### F-001: Overview guide strip rendered `undefined`

- Severity: High
- Status: Fixed
- Evidence: pre-fix overview screenshot from the first hostile run showed guide cards with literal `undefined` values in the right-side strip
- Root cause: `renderGuideGrid()` expected `guide.description`, but `dataset.topicGuides` only provided `id`, `title`, and `path`
- Fix:
  - overview guide cards now fall back to real guide summaries
  - sidebar guide cards now also use real guide summaries instead of filler text
  - summaries now truncate at a word boundary instead of being cut mid-word
  - stable acceptance now asserts that the page body does not contain `undefined`
- Code:
  - [app.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/app.js)
  - [browser-tests/tests/explorer.spec.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/tests/explorer.spec.js)

### F-002: Focused exploratory screenshots were written to the wrong artifact bucket

- Severity: Medium
- Status: Fixed
- Evidence: the first hostile session produced an empty session screenshot folder while images were written into the global `browser-tests/screenshots` directory
- Root cause: the page-object screenshot helper relied on `BROWSER_TEST_RUN_ID` and `BROWSER_TEST_SCREENSHOT_DIR`, but the exploratory session did not set those environment variables
- Fix:
  - the exploratory session now sets and restores its own screenshot env vars
  - focused screenshots now land in the correct session folder with reproducible names
- Code:
  - [browser-tests/utils/exploratory-session.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/utils/exploratory-session.js)

### F-003: Stable suite missed visible user controls

- Severity: Medium
- Status: Fixed
- Evidence: `Pick next` and `Clear saved state` were visible controls but only had exploratory coverage
- Fix:
  - added a stable acceptance scenario that exercises `Pick next` and `Clear saved state`
  - acceptance total increased from 9 to 10 passing tests
- Code:
  - [browser-tests/page-objects/explorer-page.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/page-objects/explorer-page.js)
  - [browser-tests/tests/explorer.spec.js](/mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/tests/explorer.spec.js)

## Open Quality Issues

### O-001: Roadmap panel is operational but not space-efficient

- Severity: Medium
- Status: Open
- Evidence: [roadmap screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-04-iteration-04-roadmap-operation.png>)
- Why it matters: the map works, but a large portion of the panel is consumed by low-information whitespace and duplicated labeling. That makes the map feel larger than its explanatory payoff.
- Recommendation:
  - reduce left explanatory column height or width
  - tighten chip row spacing
  - move the visual map upward or condense the empty upper field

### O-002: Compact catalog rows are serviceable but still tiring

- Severity: Medium
- Status: Open
- Evidence: [catalog screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-05-iteration-05-catalog-scanning.png>)
- Why it matters: in compact mode the rows depend on small metadata text and repeated `Mark` / `Pin` buttons with similar visual weight. That makes prolonged scanning more fatiguing than it should be.
- Recommendation:
  - downweight low-value metadata further
  - give the primary row identity more emphasis than the side actions
  - consider merging or demoting secondary row buttons in compact mode

### O-003: Topic-guide pages remain coherent but visually compressed

- Severity: Medium
- Status: Open
- Evidence: [topic guide screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-10-iteration-10-topic-guides-and-exit-path.png>)
- Why it matters: the page is readable, but on desktop it still feels like a dense stack of similarly styled cards instead of a more relaxed editorial guide.
- Recommendation:
  - create stronger sectional rhythm
  - vary surface treatment more deliberately
  - let the hero and the main guidance sections breathe more on larger screens

### O-004: Lower detail-pane reading area still feels visually light

- Severity: Low
- Status: Open
- Evidence: [detail screenshot](</mnt/d/git-repos-leetcode-codex-research-2026-02-27/browser-tests/exploratory/sessions/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit/screenshots/2026-04-12t00-24-06.020z-explorer-full-product-hostile-audit-08-iteration-08-detail-reading-surface.png>)
- Why it matters: widened reading mode helps, but the lower-detail sections still feel under-shaped relative to the strength of the top summary sections.
- Recommendation:
  - give lower sections clearer grouping and denser information value
  - reduce the sense of “light boxes continuing downward”
  - revisit whether the two-column micro-sections are the right pattern for short text
