# Release Checklist

## Functional

1. Bookmarklet performs the intended task on realistic pages.
2. Repeat invocation behavior is intentional.

## Build

1. `bun run build` succeeds.
2. Output includes one `.bundle.js` and one `.bookmarklet.txt` per bookmarklet.

## Isolation

1. No leaked globals unless explicitly required.
2. UI uses isolated mount and Shadow DOM styling.
3. UI is assembled without `innerHTML`/`insertAdjacentHTML`.
4. Cleanup path exists for long-lived UI/state.

## Quality

1. No unjustified abstraction.
2. Reuse review completed.
3. Local README present and current.
4. Docs updated if rules or structure changed.

## Tests

1. `bun test` passes.
2. New non-UI logic includes unit coverage.
