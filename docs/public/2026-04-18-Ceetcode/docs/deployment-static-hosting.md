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
- Keep paths rooted at `/` (the current app uses absolute paths such as `/assets/main.js` and `/vendor/...`).

## Local production check

```bash
npm run serve:dist
```

Open `http://127.0.0.1:4173/` and run at least one problem before publishing.

## GitHub Pages deployment (recommended pattern)

Use a workflow that:
1. installs Node + Bun,
2. runs `npm ci`, `npm run validate`, `npm run build`,
3. publishes `dist/` as Pages artifact.

Note: this app currently expects root-relative paths. Deploy to a root domain or configure hosting so `/` maps to the app root.

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
4. smoke-test deployed site (load + run + compile-error + runtime-error path)
5. verify social preview metadata (Open Graph/Twitter tags in `index.html`)
