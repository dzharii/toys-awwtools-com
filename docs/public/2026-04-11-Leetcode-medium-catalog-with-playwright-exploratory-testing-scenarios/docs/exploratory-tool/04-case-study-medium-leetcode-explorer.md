# Case Study: Medium LeetCode Explorer

## Why This Project Needed The Tool

This project is a dense decision-support UI with:

- curation-heavy catalog design
- a detail-reading surface
- roadmap interactions
- topic-guide navigation
- persistent state
- a solution workspace with attributed code

That is exactly the kind of interface where "all tests pass" is not enough.

## How The Tool Was Introduced

The initial acceptance harness already covered stable scenarios, but it could not answer questions like:

- does the page still feel curated after adding more problems?
- does a single-result search state look intentional?
- does the solution modal feel like a real study tool?
- do topic guides feel useful or thin?

The exploratory runner and REPL were added to close that gap.

## What Was Added During The Project

### First pass

- session-scoped folders
- markdown report
- JSON manifest
- deterministic screenshot names
- anti-tunnel-vision prompts

### Second pass

- action-driven charters instead of a hardcoded walk
- manual REPL commands
- observation capture
- environment snapshots

### Third pass

- solution-workspace actions and checks
- richer acceptance diagnostics
- final screenshots for every acceptance scenario
- run manifests that list screenshots and diagnostics
- safer cleanup after a concurrent-run failure

## Real Issues The Tool Exposed

### Page-object base URL coupling

The exploratory session failed outside Playwright Test's normal base URL handling.

Fix:

- `browser-tests/page-objects/explorer-page.js` now accepts an explicit base URL

### Uncaught app runtime errors

The exploratory run surfaced scroll-element reference errors in the app.

Fix:

- `app.js` now caches the required scroll containers correctly

### Sparse-result design weakness

The site technically worked, but a narrow search result looked visually empty and low quality.

Fix:

- the explorer now renders a focused-view helper card for very small result slices

### Concurrent cleanup interference

Running acceptance and exploratory sessions together showed that diff-based browser killing could terminate another active session.

Fix:

- `browser-tests/utils/process-cleanup.js` now defaults to safe logging instead of forceful cross-run termination

## How The Tool Was Used For The Solution Workspace

The latest content-focused charter was extended to:

- open a selected problem
- enter the solution workspace
- verify language ordering and attribution visually
- inspect whether annotations help or merely add noise

That review was important because a solution viewer can pass functional tests while still feeling like a code dump.

## Reuse Guidance For Future Projects

Reuse this tool when you need:

- stable acceptance plus human-judgment review
- screenshots that can be traced back to a named session
- repeatable charters for design review
- manual REPL exploration without losing artifact discipline

Adapt the charter JSON and page object first. Do not start by forking the runner logic unless the product shape genuinely changed.
