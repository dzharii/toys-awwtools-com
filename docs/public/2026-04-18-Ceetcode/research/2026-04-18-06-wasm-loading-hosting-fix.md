# Wasm Loading Reliability on GitHub Pages / Preview Servers (2026-04-18)

## Problem

Two runtime failures were reported during compile worker bootstrap:

1. `Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.`
2. `WebAssembly.compile(): section ... extends past end of the module` / invalid magic word.

## Reproduction

Validated behavior with two local static server profiles:

- Profile A: serves extensionless binaries as `application/octet-stream` (but real bytes).
- Profile B: rewrites extensionless paths to `index.html` (HTML bytes).

Result:

- Profile A worked only when fallback-to-bytes path executed.
- Profile B failed because `clang/lld/memfs` requests received HTML bytes, which cannot compile as wasm.

## Root Causes

1. Extensionless wasm assets (`clang`, `lld`, `memfs`) are fragile across static hosts and preview servers.
2. Compile worker initialization errors occurred before request-level `try/catch`, producing uncaught worker errors.
3. Service-worker cache strategy could keep stale worker assets across deployments.

## Fixes Implemented

1. Switched worker runtime asset paths to explicit `.wasm` files:
   - `clang.wasm`
   - `lld.wasm`
   - `memfs.wasm`
2. Build pipeline now emits `.wasm` aliases in `dist/vendor/wasm-clang/`.
3. Added strict wasm-byte validation before compilation:
   - checks wasm magic bytes (`00 61 73 6d`)
   - emits actionable error with content-type, URL, and payload preview when invalid.
4. Moved worker API initialization under request-level `try/catch`, returning structured compile/run failures instead of uncaught promise errors.
5. Updated service worker:
   - new cache version (`ceetcode-static-v2`)
   - `skipWaiting()` + `clients.claim()`
   - network-first strategy for `assets/*` and `vendor/wasm-clang/*` to reduce stale deploy artifacts.
6. Updated service worker registration with `{ updateViaCache: "none" }` and explicit `registration.update()`.

## Verification

- Typecheck: `npx tsc --noEmit` passed.
- Acceptance tests: `npm run test:acceptance` passed.
- Previously failing rewrite-style server profile now passes run workflow when `.wasm` assets are used.

## Operational Guidance

- Publish full `dist/`.
- Ensure host serves `dist/vendor/wasm-clang/*.wasm` as files (no SPA rewrite interception).
- If a browser still runs stale worker assets after deploy, one refresh cycle after SW update should move to the new cache version.

## External References

- MDN `WebAssembly.instantiateStreaming()` notes `.wasm` files should be served as `application/wasm` for streaming path.
  - https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/instantiateStreaming_static
- MDN `WebAssembly.compileStreaming()` documents rejection on bad response metadata (including bad MIME).
  - https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/compileStreaming_static
- GitHub Pages docs explain MIME behavior is extension-driven via `mime-db`, and per-file/per-repo custom MIME overrides are not supported.
  - https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
