# Static Hosting Deployment Guide

This project builds to static files only. There is no backend service for compile or run execution.

## Deployment prerequisites

- Node.js (for npm scripts)
- Bun (used by `scripts/build-site.mjs` for bundling)

## Build commands

```bash
npm install
npm run validate
npm run build
```

Build output is generated in:
- `dist/`

On GitHub Pages in this monorepo, the runtime entry URL is:
- `/public/2026-04-18-Ceetcode/dist/`

## What must be deployed

Deploy the full `dist/` directory, including:
- `index.html`
- `style.css`
- `sw.js`
- `assets/*`
- `vendor/wasm-clang/*`
- `vendor/meta/versions.json`

## Hosting requirements

- Serve files over HTTP(S) as static assets.
- Ensure correct content type for Wasm binaries (`application/wasm`) where possible.
- Keep `dist/` structure intact (`assets/`, `vendor/`, `sw.js`).
- Runtime paths are base-relative, so subpath hosting is supported.

## Local production check

```bash
npm run serve:dist
```

Open `http://127.0.0.1:4173/` and run at least one problem before publishing.

## GitHub Pages deployment (recommended pattern)

This project uses manual artifact publishing:

1. Run `npm run build`.
2. Commit updated `dist/` output.
3. Push repository changes.

The landing link in `docs/index.html` should target:
- `/public/2026-04-18-Ceetcode/dist/`

## Netlify / Cloudflare Pages / Vercel static

Use the same build command:
- Build command: `npm run build`
- Publish/output directory: `dist`

## Caching and updates

- Service worker caches app shell and compiler assets for offline reuse.
- When updating vendored runtime/compiler assets, rebuild and redeploy full `dist/`.
- Keep `vendor/meta/versions.json` updated (`npm run validate`) to preserve traceability.

## Release checklist

1. `npm run validate`
2. `npm run build`
3. `npm run test:acceptance`
4. commit and push updated `dist/`
5. smoke-test deployed site (load + run + compile-error + runtime-error path)
6. verify social preview metadata (Open Graph/Twitter tags in `dist/index.html`)
