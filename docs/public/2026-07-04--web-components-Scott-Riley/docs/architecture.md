# Architecture

The repository is split by responsibility:

```text
packages/tokens      Design decisions and generated CSS variables
packages/components  Framework-agnostic custom elements and component CSS
docs                 Living documentation and examples
scripts              Project-level generation and verification scripts
examples             Tiny framework portability examples
```

## Token Layer

`packages/tokens/src/tokens.json` is the source of truth for global, semantic, and theme tokens. The build script resolves references like `{global.space.md}` and emits:

- `tokens.css` for global and semantic tokens.
- `theme-default.css`, `theme-dark.css`, and `theme-high-contrast.css`.
- `tokens.json` for documentation and verification.

Components consume semantic aliases such as `--theme-color-action-primary-bg` and `--semantic-radius-control`, not raw palette trivia.

## Component Layer

`packages/components/src/components` contains the custom elements. Components are intentionally small:

- Attributes define public API.
- Rendering produces semantic HTML.
- CSS consumes tokens through custom properties.
- Metadata in `component-definitions.js` generates the custom elements manifest.

The manifest is a documentation contract. If a prop is not documented there, it is not part of the public API.

Elena is installed and configured in `packages/components/elena.config.mjs` because the source article uses Elena as the Progressive Web Component build tool. The default project build remains explicit and educational: it copies readable source modules, emits bundled CSS, and writes the manifest from reviewed metadata. The Elena build can be run with:

```bash
npm run build:elena --workspace=@my-ds/components
```

The remaining migration step is to convert native component classes to `Elena(HTMLElement)` classes and then promote Elena to the default package build.

## Documentation Layer

VitePress reads generated artifacts from the packages:

- `custom-elements.json` powers component headers and prop tables.
- `tokens.json` powers token tables.
- The same component CSS and token CSS used by consumers are used by docs examples.

This keeps documentation honest. If the package output breaks, the docs break too.

## Build Order

```bash
npm run build:tokens
npm run build:lib
npm run docs:generate
npm run docs:build
```

That sequence makes dependencies explicit: docs are downstream of the token and component packages.
