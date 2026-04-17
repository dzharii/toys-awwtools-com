# Architecture

## Purpose

Define folder boundaries and ownership in this bookmarklets workspace.

## Repository Shape

```text
.
  AGENTS.md
  CONSTITUTION.md
  README.md
  package.json
  bunfig.toml
  scripts/
    build.mjs
    new-bookmarklet.mjs
    lib/
  src/
    bookmarklets/
      <bookmarklet-name>/
        index.js
        README.md
    shared/
      dom/
      ui/
      text/
      math/
      browser/
  tests/
  dist/
  docs/
```

## Boundary Rules

1. `src/bookmarklets/*` owns local bookmarklet behavior.
2. Bookmarklets must not import another bookmarklet's local modules.
3. Reusable pieces move to `src/shared/*` only after reuse is proven.
4. `dist/` is generated output, not source of truth.
5. `tests/` covers non-UI logic paths.

## UI Architecture

1. Bookmarklet UI should be mounted in a dedicated host node.
2. The host should attach a Shadow Root for style isolation.
3. UI should be assembled with DOM API element creation.
4. Cleanup logic should remove mounts and listeners on close/toggle.

## Evolution Model

Build locally, compare patterns, extract narrowly, and stop when clarity no longer improves.
