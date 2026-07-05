# Framework-Agnostic Design System

This folder contains a complete educational design-system project based on the article in `index.md`.

Highlights:

- Token package with generated theme CSS.
- Component package with custom elements and generated manifest.
- Elena installed and configured for the component package migration path.
- VitePress documentation with live examples and prop tables.
- Static `index.html` preview for GitHub Pages after running `npm run build`.
- Framework examples for vanilla HTML, React, Vue, and Svelte.

Run it locally:

```bash
npm install
npm run build
npm run docs:dev
```

Useful verification commands:

```bash
npm run test
npm run release:check
npm run build:elena --workspace=@my-ds/components
```

The default build is intentionally explicit so the generated manifest and CSS bundle are easy to inspect. Elena is configured in `packages/components/elena.config.mjs` to match the article's intended tooling path.

## Generated Files

This project lives inside a static GitHub Pages `public/` tree. For that reason, generated package artifacts under `packages/*/dist/` are intentionally not ignored. They make the root `index.html` preview work after `npm run build`.

VitePress docs are meant to be served by `npm run docs:dev` or deployed at a configured web root. Do not use `base: "./"` to make the built VitePress folder directly file-portable; it causes nested route links such as `/foundations/foundations/spacing` during client-side navigation.

When reviewing implementation quality, start with the source files:

- `packages/tokens/src/`
- `packages/components/src/`
- `docs/`
- `scripts/`
- `tests/`

Generated artifacts should be regenerated, not hand-edited.
