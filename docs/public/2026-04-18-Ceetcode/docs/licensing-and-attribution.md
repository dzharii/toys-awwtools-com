# Licensing and Attribution

This document summarizes third-party components used by Ceetcode and where their license texts are stored in this repository.

This is an engineering traceability summary, not legal advice.

## Vendored compiler/runtime artifacts

### TinyCC research vendor

- Path: `vendor/tinycc/`
- Upstream: https://github.com/TinyCC/tinycc
- Pinned commit: `vendor/meta/versions.json` (`tinycc.commit`)
- License file included: `vendor/tinycc/COPYING`
- License indicated by included text: GNU LGPL v2.1

### wasm-clang fallback runtime backend

- Path: `vendor/wasm-clang/`
- Upstream: https://github.com/binji/wasm-clang
- Pinned commit: `vendor/meta/versions.json` (`wasmClang.commit`)
- License files included:
  - `vendor/wasm-clang/LICENSE`
  - `vendor/wasm-clang/LICENSE.llvm`
  - `vendor/wasm-clang/LICENSE.vasm`
- License indications in included files:
  - Apache License 2.0
  - LLVM Apache 2.0 with LLVM exceptions

## npm package dependencies and observed licenses

Direct dependencies currently in use:

- `@codemirror/*` packages: MIT
- `marked`: MIT
- `zod`: MIT
- `@playwright/test`: Apache-2.0
- `playwright`: Apache-2.0
- `typescript`: Apache-2.0

(Observed from installed package manifests in `node_modules/*/package.json`.)

## Attribution statement for product context

Ceetcode is an independent C99 browser practice product inspired by online coding-practice websites.

References to external product names (for inspiration context) are nominative and non-affiliative. Trademarks belong to their respective owners.

## Publication readiness checklist

Before publishing publicly:

1. Keep vendor license files in repository and in built artifacts where required.
2. Keep `vendor/meta/versions.json` up to date (`npm run validate`).
3. Preserve this attribution document in source control.
4. Re-run acceptance tests before release (`npm run test:acceptance`).
5. If distribution model changes, re-check third-party license obligations with legal review.
