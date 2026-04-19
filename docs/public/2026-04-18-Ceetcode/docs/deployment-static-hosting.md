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
- `favicon.ico`, `favicon-*.png`, `apple-touch-icon.png`
- `social/og-image.png`
- `assets/*`
- `vendor/wasm-clang/*`
- `vendor/meta/versions.json`

Critical compiler assets in `vendor/wasm-clang/` include:
- `clang.wasm`
- `lld.wasm`
- `memfs.wasm`
- `sysroot.tar`

## Hosting requirements

- Serve files over HTTP(S) as static assets.
- Ensure `.wasm` files are reachable without rewrite/fallback routing.
- Prefer correct Wasm MIME (`application/wasm`) for `.wasm` responses.
- Keep `dist/` structure intact (`assets/`, `vendor/`, `sw.js`).
- Runtime paths are base-relative, so subpath hosting is supported.

If your static host rewrites unknown paths to `index.html` (common in some preview servers), compiler startup can fail because HTML bytes are not valid wasm. Keep direct file serving enabled for `dist/vendor/wasm-clang/*.wasm`.

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
- Service worker uses a versioned cache and network-first fetch for `assets/*` and `vendor/wasm-clang/*` to reduce stale-worker issues after deploy.
- When updating vendored runtime/compiler assets, rebuild and redeploy full `dist/`.
- Keep `vendor/meta/versions.json` updated (`npm run validate`) to preserve traceability.

## Release checklist

1. `npm run validate`
2. `npm run build`
3. `npm run test:acceptance`
4. commit and push updated `dist/`
5. smoke-test deployed site (load + run + compile-error + runtime-error path)
6. verify social preview metadata (Open Graph/Twitter tags in `dist/index.html`)
