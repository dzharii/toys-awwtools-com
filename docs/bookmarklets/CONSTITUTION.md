# Constitution

These rules are mandatory for all bookmarklet work in this repository.

## Always

1. Use modern JavaScript modules and Bun tooling.
2. Use Shadow DOM and Shadow Root for injected UI/CSS isolation.
3. Build bookmarklets from `src/bookmarklets/*` into `dist/`.
4. Review existing bookmarklets and shared helpers before extracting new shared code.
5. Periodically refactor for real reuse opportunities across existing and recently added bookmarklets.
6. Add brief, value-focused JSDoc for each helper method.
7. Add tests for new non-UI logic and keep tests passing.

## Never

1. Never use `innerHTML` or `insertAdjacentHTML`.
2. Never rely on host-page CSS for bookmarklet UI behavior.
3. Never extract shared helpers without proven reuse.
4. Never add external dependencies unless explicitly requested.

## Refactoring Guidance

When similar logic appears in multiple bookmarklets, consolidate it into narrowly scoped shared helpers only when the extraction makes call sites clearer. Example pattern: promote repeated inline clamp logic into a shared `clamp` helper once multiple real call sites exist.
