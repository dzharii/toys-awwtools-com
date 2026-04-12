# Medium LeetCode Explorer

This repository contains a static, research-backed, repository-aware decision tool for choosing transition-friendly **Medium** LeetCode problems, plus a parallel set of standalone topic-guide pages.

This README is intentionally comprehensive. Its job is to capture:

- what the project is trying to do
- what the original requirement set demanded
- what inputs and constraints shape the implementation
- how the data layer works
- how the UI is supposed to behave
- what the topic-guide layer is for
- what local repositories are incorporated
- what design direction the product is now using

It is meant to act as the project brief, implementation guide, and maintenance reference in one place.

## Project Purpose

This is **not** a generic LeetCode index.

This is a decision-grade explorer for a very specific user:

- someone who has largely outgrown Easy problems
- someone who wants better Medium choices, not more Medium choices
- someone who cares about statement clarity, pattern payoff, and time efficiency
- someone who wants a curated study companion, not a raw dump of tags or titles

The core question the product should help answer is:

> What Medium problem should I solve next if I want useful practice, low statement friction, and strong reusable pattern value?

That means the product is intentionally biased toward:

- clean or reasonably clean statements
- one dominant idea instead of three chained tricks
- problems that teach reusable templates or mental models
- problems that are worth doing at this stage of growth
- problems that do not mainly derive their value from confusion, awkwardness, or arbitrary implementation pain

## What The Project Is Supposed To Feel Like

The intended mental model is:

- a private problem-choosing cockpit
- a curated technical workspace
- part decision tool, part study planner, part concept knowledge base

It should reduce:

- decision fatigue
- low-value Medium attempts
- time lost on noisy problem statements
- random browsing through public lists

It should increase:

- confidence in choosing the next problem
- pattern recognition
- progression awareness
- awareness of local reference material after solving

## Primary Requirement Themes

The original requirement set demanded much more than "build a single page with filters."

The major themes were:

1. Curated, not maximal.
2. Decision support, not mere classification.
3. Medium-only final collection.
4. Strong use of local repositories as first-class inputs.
5. Fresh validation of canonical LeetCode URLs and difficulty.
6. Full URLs preserved in the final content.
7. Multiple real iterations, not one-pass generation.
8. Separate topic-guide pages as a required teaching layer.
9. Anti-spoiler editorial discipline.
10. A meaningful interactive SVG visualization.
11. Persistent local progress state.
12. Deliberate UI/UX and design research, not generic AI dashboard styling.

## Intended User And Curation Philosophy

The site is optimized for the Easy-to-Medium transition zone.

A strong candidate problem for this project usually has most of these traits:

- Medium difficulty
- clear or reasonably clear statement
- one dominant reusable idea
- moderate implementation effort rather than chaotic bookkeeping
- strong educational return for interview prep
- good fit for linked lists, trees, BFS, DFS, graph traversal, sliding window, two pointers, backtracking, or manageable DP

The collection is not meant to become a universal LeetCode encyclopedia.

A problem earns inclusion by fitting the collection well relative to the others, not just by being famous.

## Mandatory Inputs

The product had to combine three source classes:

1. Earlier research seed material
2. Mandatory local repository inspection
3. Fresh external validation and design research

### Research Seed Files

The project was driven by the following root-level documents:

- `suggestions001.md`
- `suggestions002.md`
- `suggestions003.md`
- `deep-research-report (1).md`

Those documents defined both the content direction and the quality bar.

### Local Repositories That Must Be Inspected

The implementation had to inspect and incorporate all of these:

- `doocs_leetcode`
- `haoel_leetcode`
- `kamyu104_LeetCode-Solutions`
- `neetcode-gh_leetcode`
- `test-123`
- `wisdompeak_LeetCode`

These repositories are not optional decoration. They are part of the product value.

For each selected problem, the product should know which repositories contain it and expose that clearly to the user.

## Why Repository Awareness Matters

The repository layer is one of the project's strongest differentiators.

It allows the interface to answer questions like:

- Does a local reference solution already exist for this problem?
- Does a local explanation or structured writeup exist?
- Is this problem especially well covered in a given repo?
- If I solve this next, do I already have local material for review afterward?

Repository presence is a ranking signal, but not the only one.

A problem should not be included just because many repos contain it.

## Required Product Outcomes

The product was expected to deliver all of the following:

- a static site with no framework dependency
- a curated Medium-only problem collection
- strong decision-support metadata
- filtering and narrowing tools
- a clear recommendation layer
- localStorage persistence for solved state
- local repository coverage surfaced in the UI
- an interactive SVG progression or concept map
- separate standalone topic-guide HTML pages
- meaningful cross-linking between problems and topic guides
- an in-app solution workspace with explicit attribution
- maintainable generated data

## Solution Workspace

The project now includes an in-app solution workspace for every curated problem.

This feature exists to answer a different post-solve question:

> Now that I picked or solved this problem, what credible implementations and writeups do I already have available locally?

The solution workspace is intentionally separate from the anti-spoiler selection layer on the main detail pane.

### Requirements It Satisfies

- every curated problem has a generated solution payload
- implementations are grouped by language
- languages are shown in a consistent preferred order
- each implementation is attributed to its source repository
- each implementation includes a direct source-file URL when origin metadata exists
- supporting writeups are shown separately from code
- inline review annotations call out decision points and state management instead of dumping raw code with no guidance

### Current Data Shape

Generated solution payloads live under:

- `data/solutions/*.json`

Each payload includes:

- problem id
- solution counts
- ordered language groups
- per-source attribution
- implementation review notes
- inline annotation ranges
- supporting writeups

The dataset generator writes a `solutionSummary` onto each problem row so the UI can show coverage before loading the full payload.

See [notes/solution-source-research.md](./notes/solution-source-research.md) for the sourcing and attribution policy.

## Anti-Spoiler Rule

One of the strongest editorial constraints is that the site should help the user decide whether a problem is worth doing **without explaining exactly how to solve it**.

That applies to:

- problem overviews
- why-solve notes
- caveats
- topic-guide pages

The content standard is:

- explain what the problem is broadly about
- explain why it matters
- explain what it trains
- explain how it fits the progression
- do not reveal the operational recipe for solving it

The topic guides may teach the concept deeply, but they should still avoid turning into disguised walkthroughs of the curated problems.

## Iteration Standard

The requirement set explicitly demanded real iteration, roughly in the range of 6 to 10 meaningful passes.

That means:

- source gathering
- repository inspection
- dataset normalization
- problem-by-problem evaluation
- pruning and overlap cleanup
- product-level UX review
- topic-guide clarity review
- design-direction resets when the page quality was not good enough

An iteration only counts if the work materially improves structure, content, prioritization, design, or usability.

See [notes/iteration-log.md](./notes/iteration-log.md) for the concrete pass history used in this repo.

## Current Design Direction

The original interface direction was rejected and then rejected again.

The current direction is now intentionally based on:

- **Option 2: GitHub Editorial Product** as the visual base
- **Option 1: Editor Workbench** as the layout discipline

That means:

- sharper neutral palette
- stronger text contrast
- fewer decorative surfaces
- a persistent left sidebar
- a stable desktop workspace
- a scrollable catalog pane
- a persistent detail pane
- much stronger active and selected states
- reduced chip usage
- roadmap treated as a collapsible workspace instrument instead of a giant decorative slab

The design is intended to feel:

- calmer
- more mature
- more technical
- more editorial
- less like a pastel dashboard

## Current Information Architecture

The main page is now organized into a tool-oriented workspace:

### Left Sidebar

Purpose:

- quick-view navigation
- topic-guide entry points
- advanced filters
- progress snapshot

### Top Bar

Purpose:

- search
- sort
- compact mode
- pick-next action
- reset action

### Recommendation Surface

Purpose:

- show strong next-problem suggestions immediately
- answer the user's practical question before the full catalog

### Guide Links

Purpose:

- keep topic guides visibly integrated into the main experience

### Collapsible Roadmap

Purpose:

- show progression and grouped structure
- support filtering and selection
- stay available without dominating the page

### Stable Workspace

Purpose:

- keep catalog and detail visible together on large screens
- let the catalog scroll without losing the selected detail
- make the product feel like a tool, not a long marketing page

## Desktop Behavior Expectations

On large screens:

- the sidebar should remain stable
- the catalog should have its own scroll area
- the detail pane should remain visible while browsing
- selection should be unmistakable

This is a deliberate correction against the earlier long-page, full-document scrolling behavior.

## Mobile / Narrow Layout Expectations

On narrower screens:

- the layout collapses into a single-column flow
- the detail pane becomes a normal section below the catalog
- the site still works without relying on hover
- controls remain keyboard accessible

## Data Model Expectations

Each problem record is meant to be decision-grade.

The current generated dataset includes fields such as:

- `id`
- `number`
- `title`
- `difficulty`
- `leetcodeUrl`
- `concepts`
- `phase`
- `lane`
- `transitionFriendliness`
- `clarity`
- `effort`
- `readiness`
- `overview`
- `whySolve`
- `whatYouPractice`
- `interestNote`
- `caveat`
- `classic`
- `newerGem`
- `starter`
- `recommendedOrder`
- `expectedMentalModel`
- `topicGuides`
- `memberships`
- `sourceUrls`
- `validatedTopicTags`
- `repoCoverage`

The frontend is intentionally data-driven so the site structure can stay clean while the dataset carries the real editorial intelligence.

## Dataset Generation Responsibilities

The generator in `scripts/generate_dataset.py` is responsible for:

- maintaining the curated problem blueprint
- validating canonical LeetCode metadata through GraphQL
- ensuring published problems are still Medium
- scanning the local repositories
- normalizing matches
- producing canonical output files
- writing a summary report

### Generated Files

- `data/problems.json`
- `data/problems.js`
- `data/generation-summary.json`
- `data/leetcode_validation_cache.json`

### Generator Notes

- The first full run is slower on this filesystem because the local repo scan is large.
- LeetCode validation is cached.
- The final site does not rely on `fetch`, so it still works from `file://`.

## Repository Scan Notes

Different repositories expose different useful signals.

### `doocs_leetcode`

Contributes:

- solution directories
- README-style explanations
- multilingual code presence

### `haoel_leetcode`

Contributes:

- README index table
- direct solution links
- clear presence detection

### `kamyu104_LeetCode-Solutions`

Contributes:

- category-oriented tables
- strong high-precision indexing
- broad solution coverage

### `neetcode-gh_leetcode`

Contributes:

- machine-readable metadata
- articles
- hints
- language file presence
- membership cues such as NeetCode 150 / Blind 75

### `test-123`

Contributes:

- flat local source mirror
- lightweight code-presence signal

### `wisdompeak_LeetCode`

Contributes:

- topic-organized structure
- per-problem readmes
- useful category flavor for traversal-heavy problems

## Topic-Guide Layer

Separate topic-guide pages are required, not optional.

Their job is different from the main decision tool.

### Main Decision Tool

Answers:

- what should I solve next?
- why is it worth doing now?
- how readable is it?
- how much effort will it probably take?
- what local support do I have?

### Topic Guides

Answer:

- what is this concept?
- why does it matter?
- how should I think about it?
- what does it look like in practice?
- what mistakes do beginners often make?
- which curated problems are good practice for it?

### Required Topic Families

The current project includes separate HTML pages for:

- linked lists
- tree traversal
- BFS
- DFS
- graph traversal
- two pointers
- sliding window
- backtracking
- dynamic programming

### Teaching Standard

Topic pages are supposed to:

- build intuition from simpler framing upward
- include examples, traces, or tables where useful
- use compact C snippets only when they genuinely clarify
- avoid spoiling curated problems directly
- feel like real teaching material rather than code scraps

## SVG Requirement

The site must contain a meaningful SVG visualization.

The SVG is expected to:

- show progression or grouped concept structure
- support selection or filtering
- reflect solved state
- reflect selected state
- scale cleanly
- behave like part of the product rather than a decorative compliance artifact

The current implementation keeps it available as a collapsible workspace object to reduce top-level clutter.

## Persistence Requirements

The site uses `localStorage` for lightweight persistent state.

Current persisted state includes:

- solved problems
- pinned problems
- local notes
- selected problem
- compact mode
- filter state
- sort mode

The persistence model should fail gracefully if `localStorage` is unavailable.

## Current File Map

### Main App

- `index.html`
- `styles.css`
- `app.js`

### Data

- `data/problems.json`
- `data/problems.js`
- `data/generation-summary.json`
- `data/leetcode_validation_cache.json`
- `data/topic-guides.js`

### Topic Pages

- `topics/two-pointers.html`
- `topics/sliding-window.html`
- `topics/linked-lists.html`
- `topics/tree-traversal.html`
- `topics/bfs.html`
- `topics/dfs.html`
- `topics/graph-traversal.html`
- `topics/backtracking.html`
- `topics/dynamic-programming.html`
- `topic.js`

### Documentation / Process

- `README.md`
- `notes/iteration-log.md`

### Generation

- `scripts/generate_dataset.py`

### Browser Validation Harness

- `playwright.config.js`
- `package.json`
- `browser-tests/README.md`
- `browser-tests/exploratory/README.md`
- `browser-tests/tests/explorer.spec.js`
- `browser-tests/page-objects/explorer-page.js`
- `browser-tests/scripts/run-browser-tests.js`
- `browser-tests/scripts/run-exploratory-session.js`
- `browser-tests/scripts/exploratory-repl.js`
- `browser-tests/scripts/static-server.js`
- `browser-tests/exploratory/charters/`
- `browser-tests/exploratory/sessions/`
- `browser-tests/utils/environment.js`
- `browser-tests/utils/exploratory-session.js`
- `browser-tests/utils/logger.js`
- `browser-tests/utils/process-cleanup.js`
- `browser-tests/utils/server-control.js`
- `browser-tests/logs/`
- `browser-tests/screenshots/`
- `browser-tests/artifacts/`

## How To Open The Site

You can open [index.html](./index.html) directly in a browser.

Because the runtime uses a bundled JavaScript dataset instead of `fetch`, the main site works from `file://`.

If you prefer a local server:

```bash
python -m http.server 8000
```

Then open:

- `http://127.0.0.1:8000/`

## How To Rebuild The Dataset

```bash
python scripts/generate_dataset.py
```

This will:

- validate problems against LeetCode
- rescan the local repositories
- regenerate the canonical dataset files

## Browser Harness And Acceptance Validation

The project now includes a reusable Playwright-based browser harness for validating the current static site and future iterations.

### Why It Exists

This was added to satisfy the testing-focused follow-up requirement:

- inspect the real execution environment instead of assuming it
- install and configure a Chrome-compatible Playwright target
- serve the site locally rather than opening raw files
- exercise the app through browser automation
- capture logs and screenshots
- clean up browser and server processes explicitly
- document acceptance scenarios clearly

### Environment Summary Captured By The Harness

The first-run setup summary established:

- working directory: `/mnt/d/git-repos-leetcode-codex-research-2026-02-27`
- platform: Debian GNU/Linux 13 on WSL2
- shell: `bash`
- Node.js: `v22.21.0`
- npm: `11.8.0`
- Python: `3.14.2`
- `apt-get`: available
- system Chrome / Chromium before setup: not present on `PATH`
- site type: static site
- site entry point: `index.html`

The harness writes a fresh machine-readable environment snapshot on every run to:

- `browser-tests/logs/*-environment.json`

### Browser Target

The harness uses:

- Playwright for Node.js
- Chromium in headless mode as the explicit Chrome-compatible target
- desktop viewport `1920x1080`

Chromium is installed through Playwright with system dependencies:

```bash
npx playwright install --with-deps chromium
```

### Server Model

The harness does not open local files directly.

It starts a lightweight Node HTTP server, waits for `/__health`, runs the tests against that base URL, and then shuts the server down.

### Logging And Artifacts

Each run produces or may produce:

- a run log in `browser-tests/logs/`
- an environment summary JSON in `browser-tests/logs/`
- named screenshots in `browser-tests/screenshots/`
- Playwright traces, failure screenshots, and HTML report files in `browser-tests/artifacts/`

The runner also logs:

- browser launch parameters
- server startup and shutdown
- navigation events
- page console errors
- request failures
- assertion progress
- cleanup status

### Acceptance Scenarios Covered

The current acceptance suite covers these scenarios:

1. The site loads successfully from the local server.
2. The main workspace renders with catalog, detail pane, and collapsible roadmap support.
3. Selecting a problem updates the detail pane and the active row state.
4. Quick-view filtering and search reduce the visible catalog in expected ways.
5. The roadmap renders and can drive selection.
6. Solved state and local notes persist across reload within the same browser session.
7. Topic-guide navigation works from the explorer.

The test implementation for these scenarios lives in:

- `browser-tests/tests/explorer.spec.js`

### How To Run Browser Validation

Install dependencies:

```bash
npm install
npx playwright install --with-deps chromium
```

Run the full acceptance suite:

```bash
npm run test:browser:acceptance
```

Run the full browser harness without narrowing:

```bash
npm run test:browser
```

Run the guided exploratory sweep:

```bash
npm run test:browser:explore
```

Run the ad hoc exploratory REPL:

```bash
npm run test:browser:repl
```

### Latest Acceptance Result

Latest full acceptance run completed successfully with:

- command: `npm run test:browser:acceptance`
- result: `6 passed`
- logs: `browser-tests/logs/2026-04-11t04-15-17.265z.log`
- environment snapshot: `browser-tests/logs/2026-04-11t04-15-17.265z-environment.json`

Representative named screenshots from that run include:

- `browser-tests/screenshots/2026-04-11t04-15-17.265z-initial-page-load.png`
- `browser-tests/screenshots/2026-04-11t04-15-17.265z-after-selecting-decode-ways.png`
- `browser-tests/screenshots/2026-04-11t04-15-17.265z-after-filtering.png`
- `browser-tests/screenshots/2026-04-11t04-15-17.265z-after-roadmap-selection.png`
- `browser-tests/screenshots/2026-04-11t04-15-17.265z-before-reload-persistence.png`
- `browser-tests/screenshots/2026-04-11t04-15-17.265z-topic-guide-page.png`

## Exploratory Testing Layer

The project now also includes a separate exploratory-testing workflow built on top of the stable acceptance harness.

Its purpose is different:

- acceptance proves that the main flows still work
- exploratory sessions help inspect broader layout, state consistency, copy quality, and neighboring regressions without tunnel vision

This layer includes:

- a guided charter runner
- an ad hoc REPL
- deterministic session folders
- markdown reports
- screenshot evidence
- explicit “look around” prompts for each step

See:

- `browser-tests/exploratory/README.md`
- `notes/exploratory-testing.md`

## Verification Commands

Useful checks:

```bash
python -m py_compile scripts/generate_dataset.py
node --check app.js
node --check topic.js
node --check data/topic-guides.js
npm run test:browser:acceptance
```

## External References Used During The Project

The work incorporated or referenced:

- LeetCode GraphQL for canonical validation: `https://leetcode.com/graphql`
- Sean Prashad patterns: `https://seanprashad.com/leetcode-patterns/`
- Primer introduction: `https://primer.github.io/design/guides/introduction/`
- Primer foundations: `https://primer.style/product/getting-started/foundations/`
- VS Code theme/workbench guidance: `https://code.visualstudio.com/api/extension-guides/color-theme`
- Atlassian navigation article: `https://www.atlassian.com/blog/announcements/introducing-new-navigation`
- W3C SVG accessibility reference: `https://www.w3.org/TR/SVG/access`
- USWDS search guidance: `https://designsystem.digital.gov/components/search/`

## What This README Is Trying To Preserve

This README exists so the project can be understood without reconstructing the whole conversation history.

It should preserve:

- the original ambition of the assignment
- the strictness of the quality bar
- the fact that the project is supposed to be curated and judgment-heavy
- the role of the local repositories
- the importance of anti-spoiler writing
- the reason separate topic guides exist
- the reason the final UI moved toward a sharper editorial/workbench design

If this project is extended later, changes should be judged against that standard, not against a weaker "it renders and filters" standard.
