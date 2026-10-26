# Third-party notices and reference provenance

## Dexie 4.2.0

- Source: the user-supplied reference kit,
  `development-reference/gtl-reference-kit/library/dexie-4.2.0.js`.
- Upstream: <https://github.com/dexie/Dexie.js/tree/v4.2.0>
- License: Apache-2.0; full text in `src/vendor/dexie/LICENSE`.
- Distribution: `src/vendor/dexie/dexie-4.2.0.js`, preserved byte for byte,
  including its Apache banner and embedded Microsoft notice.
- Adapter: `src/platform/storage/database.ts`. Local narrow TypeScript
  declarations are separate from the JavaScript distribution.
- Upgrade: retain notices, review schema/transaction behavior, and rerun real
  module-worker IndexedDB and competing-tab tests.

## microlight 0.0.7

- Source: the user's skill-language-editor reference,
  `lib/lib-asvd-microlight-0.0.7/microlight.js`.
- Upstream: <https://github.com/asvd/microlight>
- Copyright: 2016 asvd, MIT; full text in `src/vendor/microlight/LICENSE`.
- Distribution: `src/vendor/microlight/microlight.js`, copied byte for byte from
  the supplied reference (which already customizes its token colors).
- Adapter: `src/features/template-authoring/ui/source-editor.ts`; GTL colors
  override distribution styles without changing its source.
- Upgrade: preserve MIT attribution and verify textarea/highlight alignment,
  scrolling, literal text safety, composition, and native undo.

## SovietRDTL UI reference

The dark palette, sidebar organization, semantic event/DOM helper patterns, and
responsive reading surface are adapted from the supplied SovietRDTL reference.
No conversation engine, corpus, media, or reference background image is shipped.
The following code notice is retained for those adaptations:

MIT License

Copyright (c) 2026 SovetRDTL contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The browser-extension references informed schema-driven settings, repositories,
and correlated messaging; extension-specific source and APIs are not shipped.
The prompt-menu reference informed the persistent preview treatment. All final
decorative backgrounds are original CSS color studies; the favicon is original
SVG. Unneeded JSZip, Markdown-It, and Turndown distributions are not bundled.
