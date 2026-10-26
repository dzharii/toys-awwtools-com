# Guided Document Editor — UI and Engineering Reference Kit

**Reference pack v0.1 | assembled October 25, 2026**

This is a **reference and design handoff**, not a working application or a finalized implementation specification. It combines two successive reviews from this conversation:

1. An analysis of `sovet-rdtl-0.13.1-source(1).zip` as inspiration for a dark, document-centered, chat-history-style interface.
2. An analysis of `browser-extension-src.zip` as inspiration for TypeScript, Bun, vendored JavaScript, Dexie/IndexedDB, typed messaging, live settings, Shadow DOM components, and feature-oriented worker dispatch.

It also records the reset in product direction: **the document is the interface**. Templates describe text, placeholders, hints, examples, and alternate versions. The UI supplies interactivity; we do not recreate a procedural questionnaire DSL.

## Start here

- [Documentation index](docs/INDEX.md)
- [Combined reference guide](docs/00-combined-reference.md) — one continuous handoff linking both reviews
- [UI/UX source review](docs/01-chat-ui-ux-analysis.md) — detailed visual, interaction, and state insights
- [Extension architecture source review](docs/02-extension-engineering-analysis.md) — exact source paths and recommended adaptations
- [Product and architectural brief](docs/03-proposed-app-brief.md) — shared design direction, explicit exclusions, open questions
- [Source file map](docs/04-source-map.md) — exact extracted paths, why each file matters, and copy/adapt guidance
- [Asset inventory](docs/05-assets-and-licenses.md) — copied backgrounds, vendored runtimes, provenance and notices
- [Implementation experiments](docs/06-prototypes-and-tests.md) — sequence of proofs before committing to architecture
- [PowerShell wizard origin](docs/07-original-wizard-and-recovery.md) — the five description styles and recovery motivation
- [Visual reference](index.html) — open as a local file; readable reports with inline SVG diagrams

## Directory map

```text
README.md
index.html                    Static dark documentation viewer; not the application
 docs/                        Full design discussions and synthesis
 diagrams/                    Editable SVG architecture and interaction diagrams
 assets/                      UI background references and contact sheet
 examples/                    Minimal sample templates and JSON manifest
 library/                     Vendored JS distributions copied from the extension
 reference/
   sovet-rdtl/                Selected original UI code, CSS, MIT LICENSE, and specs
   browser-extension-src/     Selected original settings/worker/UI/types source files
   powershell/                Earlier Add-Project.ps1 script as optional inspiration
 manifest/                    Machine-readable provenance and SHA-256 hashes
```

## Important source and architecture distinctions

- `sovet-rdtl` uses **Custom Elements with light DOM**, not Shadow DOM. Its eventing, sidebar, reader layout, modal source panel, and background image loader are reusable *patterns*; the editor is new work.
- `browser-extension-src` is a **Chrome Manifest V3 extension**. Its background worker is an extension service worker and uses Chrome APIs. A static website cannot copy those APIs unchanged. Proposed site architecture uses a **Dedicated Worker** for processing/IndexedDB, with a separate optional service worker for offline caching.
- The extension's `Dexie 4.2.0` file is **UMD**, designed to expose `globalThis.Dexie`. It is included unmodified, but loading it inside a Bun-built **module worker** must be tested. It is not an ESM module by itself.
- The supplied extension archive does not contain a project-wide root LICENSE. Referenced first-party extension code is copied from the user's archive for implementation study. Review redistribution rights before publishing a derivative package.
- UI backgrounds included here are **reference assets**, not approved final product graphics. The chat project's LICENSE describes its code as MIT-licensed and separately flags corpus/third-party materials.
- Build/runtime code is not bundled into a working app here. Bun, TypeScript, and web-component integration decisions are recommendations until exercised in prototypes.

## Recommended baseline

TypeScript (pin an explicitly verified stable version when implementing), Bun for development/bundling, no npm *runtime* dependencies, explicitly checked-in vendored runtime distributions, browser-native Web Components, Dexie/IndexedDB behind a storage adapter, a feature-scoped worker router, and a deliberately small document-template format.

## Provenance

- Input: `sovet-rdtl-0.13.1-source(1).zip` → `reference/sovet-rdtl/sovet-rdtl/...`.
- Input: `browser-extension-src.zip` → `reference/browser-extension-src/src/...`.
- Vendored libs: `browser-extension-src.zip` → `library/...` (exact bytes).
- Background contact sheet: supplied in the prior conversation, copied to `assets/background_contact_sheet.jpg`.
- The diagrams in `diagrams/` were redrawn for this kit from the ideas and diagrams in the prior reviews; they are not screenshots or source assets.

See `manifest/sha256sum.txt` and `manifest/provenance.json` for verification.
