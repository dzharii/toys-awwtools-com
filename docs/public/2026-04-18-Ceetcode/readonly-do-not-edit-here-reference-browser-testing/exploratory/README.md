# Exploratory Testing Workflow

This layer sits beside the stable acceptance suite.

Acceptance tests answer: did the core flows still work?

Exploratory sessions answer: what does the product feel like after it works, and what else looks off while moving through it?

## Goals

- preserve a stable acceptance baseline
- add a reusable guided browser sweep for broader visual and interaction review
- create reproducible screenshots and session reports
- reduce tunnel vision by attaching explicit "look around" prompts to each step
- make the same workflow portable to future static web projects

## Two Modes

### Guided Charter Runner

Use this when you want a repeatable exploratory sweep:

```bash
node browser-tests/scripts/run-exploratory-session.js --charter explorer-desktop-sweep
```

By default it:

- runs the acceptance suite first
- starts a fresh exploratory browser session
- executes the charter steps
- captures ordered screenshots
- records evidence snapshots and observations
- writes a markdown report and JSON manifest

Useful flags:

```bash
node browser-tests/scripts/run-exploratory-session.js \
  --charter explorer-content-expansion-sweep \
  --baseline skip \
  --intent "Review the new learning layer as a real product surface." \
  --question "Does the catalog still feel curated?|Are the new topic pages worth opening?"
```

- `--baseline acceptance|skip`
- `--intent "..."` to record the current review goal
- `--question "Q1|Q2|Q3"` to inject run-specific quality questions
- `--headed` to run the charter in a visible browser

### Exploratory REPL

Use this when you want ad hoc browser control:

```bash
node browser-tests/scripts/exploratory-repl.js
```

Commands:

- `snapshot`
- `checkpoint <label>`
- `screenshot <label>`
- `note <text>`
- `select <problem-id>`
- `search <text>`
- `quick <view-id>`
- `reset`
- `roadmap`
- `roadmap-select <problem-id>`
- `guide`
- `back`
- `exit`

You can also start the REPL with review context:

```bash
node browser-tests/scripts/exploratory-repl.js \
  --intent "Ad hoc design review after a CSS pass" \
  --question "Does the selected state read clearly?|Does the detail pane still feel calm?"
```

## Session Artifact Model

Each exploratory run writes into its own session folder:

- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/report.md`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/manifest.json`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/environment.json`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/session.log`
- `browser-tests/exploratory/sessions/<run-id>-<session-slug>/screenshots/*.png`

Screenshot names are deterministic inside a session:

- `<run-id>-<session-slug>-<step-number>-<step-slug>.png`

That gives:

- chronological ordering
- low collision risk
- easy cross-reference from the report

## Anti-Tunnel-Vision Pattern

Every guided step includes:

- an explicit intent
- a focus statement
- the recorded action list
- explicit "look around" prompts
- optional review questions
- a state snapshot
- a screenshot

The point is to avoid only checking whether the intended click worked.

The reviewer is reminded to also scan:

- neighboring layout
- stale or mismatched state
- spacing and overflow
- copy quality
- consistency between navigation, catalog, and detail panes

## Current Guided Charter

Reusable charters currently included:

- `charters/explorer-desktop-sweep.json`
- `charters/explorer-content-expansion-sweep.json`
- `charters/explorer-full-product-hostile-audit.json`
- `charters/explorer-suggestions006-audit.json`
- `charters/explorer-suggestions007-audit.json`

The desktop sweep covers:

1. landing workspace
2. selected-row and detail sync
3. quick-view narrowing
4. single-result search state
5. roadmap-driven selection
6. topic-guide navigation

The content-expansion sweep covers:

1. landing after catalog growth
2. a newer linked-list addition
3. a graph-counting addition
4. the solution workspace
5. a prefix-sums search flow
6. the new prefix-sums guide

The full hostile audit covers:

1. landing trust and feature inventory
2. left rail and advanced filters
3. recommendations and guide-strip quality
4. roadmap operation and density
5. compact catalog scanning
6. narrow search/sort states
7. saved-state combination and reload
8. widened detail reading quality
9. inline and modal solution surfaces
10. topic-guide quality and return path

The suggestions006 audit covers:

1. opening hierarchy
2. roadmap visibility
3. roadmap-to-catalog linkage
4. catalog selected-state clarity
5. detail pane reading quality
6. topic-guide integration

The suggestions007 audit covers:

1. the default non-spoiling detail state
2. widened reading mode
3. collapsed spoiler visibility
4. revealed inline source attribution
5. the focused multi-language solution workspace

## Charter Action Model

The runner is now action-driven instead of hardcoded to one project flow.

Each step can declare:

- `intent`
- `focus`
- `lookAround`
- `reviewQuestions`
- `actions`
- `observation`

Supported actions:

- `open`
- `selectProblemByTitle`
- `selectProblemById`
- `searchFor`
- `clickQuickView`
- `resetFilters`
- `openRoadmap`
- `selectRoadmapProblem`
- `openFirstGuideFromOverview`
- `openGuideByTitle`
- `goBackToExplorer`
- `openSolutions`
- `closeSolutions`
- `selectSolutionLanguage`
- `selectSolutionSource`
- `toggleDetailWidth`
- `togglePinned`
- `toggleCompactCatalog`
- `setSort`
- `toggleAdvancedFilters`
- `clickSidebarToken`
- `scrollSurface`
- `reload`
- `clearSavedState`
- `selectInlineSolutionLanguage`
- `openInlineSolutionSpoiler`
- `markSolved`
- `writeNote`
- `observe`
- `wait`

## Practical Use

Recommended sequence:

1. Run acceptance.
2. Run a guided exploratory charter.
3. Review the report and screenshots.
4. Record evidence-based observations.
5. Only then decide whether the product needs another UI/content pass.
