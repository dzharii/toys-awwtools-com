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
