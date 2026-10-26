# Assets, vendored libraries, provenance, and licenses

The kit carries selected source code and binary dependencies from user-supplied archives. These are **references**, not a new blanket grant of third-party intellectual-property rights.

## Library files (byte-for-byte copies)

| Kit path | Original archive path | Purpose | Status |
| --- | --- | --- | --- |
| `library/dexie-4.2.0.js` | `browser-extension-src.zip:src/content/libs/dexie-4.2.0.js` | IndexedDB adapter | Required reference vendor |
| `library/jszip-3.10.1.js` | `...:src/content/libs/jszip-3.10.1.js` | ZIP export | Optional reference vendor |
| `library/markdown-it-14.2.0.js` | `...:src/content/libs/markdown-it-14.2.0.js` | Markdown rendering | Optional reference vendor |
| `library/turndown-7.0.0.js` | `...:src/content/libs/turndown-7.0.0.js` | HTML to Markdown | Optional reference vendor |

They are *not* imported automatically by the documentation preview or any shipped app. `index.html` is a static visual guide.

- Dexie banner: **Apache License 2.0**, Version 4.2.0. The source ZIP does not separately bundle Dexie's full license text.
- JSZip banner: **MIT or GPLv3** and a note about its internal pako dependency; refer to upstream licensing and preserve any applicable notices.
- markdown-it banner: **MIT**, version 14.2.0.
- Turndown: the copied distribution's opening does not present a clear full license statement; verify its license and include the correct notice before shipping it in a released product.

For released software, the implementation team should obtain/verify the applicable full license files; this reference kit preserves the distribution banners, source provenance, and an inventory rather than fabricating license content.

## Source code licensing

The copied chat UI code is accompanied by `reference/sovet-rdtl/sovet-rdtl/LICENSE`: MIT License, 2026 SovietRDTL contributors. That license explicitly states that corpus texts and third-party materials have separate terms. The kit excludes conversation corpus text and unrelated media.

The extension ZIP does not include a project-wide root LICENSE. Its `retroos-ui-v001` files label themselves as vendored, editable framework source. Treat the included extension and vendored framework files as **user-supplied study references**; check authority and applicable licenses before redistributing them beyond the intended development context.

## Background images

The chat archive has 20 background compositions, with desktop and mobile variants. The kit includes **only eight source WebPs** (four desktop/mobile pairs):

- room-04-desk
- room-07-study
- room-17-balcony
- room-20-workshop

All are under `assets/source-backgrounds/` with original hashed filenames. `assets/background_contact_sheet.jpg` is the contact sheet generated during the earlier exploration; it shows the entire set of 20 scene variants as low-resolution visual references.

These backgrounds demonstrate layering, responsiveness, and mood. Do not assume the underlying image-generation or third-party usage rights follow the MIT *code* license. Plan original, clearly licensed artwork for production.

## Editable SVG diagrams

These drawings were created for this reference kit from the earlier assistant's layouts and architectural explanations:

- `diagrams/01-desktop-layout.svg`: sidebar + document + nonmodal guidance.
- `diagrams/02-document-workflow.svg`: new document → template version → inline editing → result/history.
- `diagrams/03-feature-architecture.svg`: UI/app state → worker router → vertical features → repository/adapters.
- `diagrams/04-worker-message-flow.svg`: request envelope, correlation, response/errors.
- `diagrams/05-settings-flow.svg`: settings state updates UI/worker/tabs and persistence.
- `diagrams/06-mobile-layout.svg`: mobile drawer and compact guidance layout.

These are schematic proposals, **not screenshots** of either source project. SVG is editable, scalable, and self-contained (no external fonts or image resources).

## Package verification

- `manifest/provenance.json`: original path, copied path, size and SHA-256 for selected originals.
- `manifest/sha256sum.txt`: SHA-256 for every included file except itself.

A mismatch signals damage or modification. There is intentionally no vendored `node_modules` directory and no npm runtime installation instruction.
