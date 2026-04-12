# Exploratory Tool Overview

## What It Is

The exploratory tool is a Playwright-powered browser-review layer for dense, judgment-heavy UI work.

It is not a replacement for acceptance tests.

It exists because acceptance tests answer "did the required flow still work?" while exploratory review answers harder questions:

- does the product still feel coherent after the feature works?
- did the latest change create visual debt outside the narrow assertion path?
- does the new surface deserve its space in the product?
- are we drifting into tunnel vision by checking only what we meant to change?

## What Problem It Solves

Stable acceptance tests are intentionally conservative. They should not churn every time a UI detail changes.

That stability creates a gap:

- acceptance is good at regression detection
- acceptance is weak at judgment, composition, visual consistency, and "look around" review

The exploratory layer fills that gap with repeatable browser sessions that preserve evidence instead of relying on memory.

## Core Design Principles

- Evidence first: every session writes screenshots, logs, a report, and a JSON manifest.
- Anti-tunnel-vision prompts: every guided step reminds the reviewer to inspect adjacent surfaces, not only the main assertion.
- Reusable sessions: a charter can be rerun later against the same project or adapted to another static web project.
- Safe coexistence with acceptance: cleanup is conservative by default so one run does not kill another run's browser.

## Two Operating Modes

### Guided charter runner

Use this when you want repeatable review:

- fixed steps
- fixed prompts
- reproducible screenshots
- structured markdown report

### Exploratory REPL

Use this when you want manual control:

- open the site
- move around freely
- take screenshots on demand
- record notes without throwing away artifact discipline

## Best Fit

This tool is a good fit when:

- the product is dense and visually judgment-heavy
- the user explicitly wants iterative quality review
- a feature is "technically working" but still needs design scrutiny
- you want a reusable review pattern for future browser projects

It is less useful for:

- low-UI backend-only tasks
- purely unit-testable changes
- one-off scripts where screenshots and visual reports add no value
