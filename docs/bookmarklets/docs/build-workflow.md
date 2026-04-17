# Build Workflow

## Commands

```bash
bun run build
bun run scripts/build.mjs --name <bookmarklet-name>
bun run new <bookmarklet-name>
bun test
```

## Build Output

For each bookmarklet, build writes:

1. `dist/<name>.bundle.js`
2. `dist/<name>.bookmarklet.txt` (copy-ready `javascript:` URL)

## Naming

Prefer date-prefixed kebab-case names, for example `2026-04-16-link-cleaner`.

## Notes

- Entries are discovered from `src/bookmarklets/*/index.js`.
- Folders starting with `_` are ignored.
- Build compiles bookmarklets from source into `dist/`.
