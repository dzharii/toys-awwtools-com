# Source file map — original paths and reuse guidance

This is an implementation-agent index. Paths below are **exact paths inside the uploaded archives**. Copies in the reference kit preserve the same relative path under a source archive name. No names were anonymized.

## Chat UI reference: `sovet-rdtl-0.13.1-source(1).zip`

Prefix for extracted copies: `reference/sovet-rdtl/`.

| Original path | Evidence / why inspect | Approach |
| --- | --- | --- |
| `sovet-rdtl/src/ui/components/sov-app.js` | App shell, subscriptions, navigation, dialogs, event coordination | Adapt shell logic, not chat engine |
| `sovet-rdtl/src/ui/components/sov-sidebar.js` | Vertical history, selected state, new/remove | Reuse UI behavior with Document semantics |
| `sovet-rdtl/src/ui/components/sov-chat.js` | Efficient message updates, scroll position | Study; do not copy chat auto-scroll into editor |
| `sovet-rdtl/src/ui/components/sov-message.js` | Message typography, info affordance, content boundaries | Adapt visual treatment only |
| `sovet-rdtl/src/ui/components/sov-origin-panel.js` | Async guidance loading, request invalidation, focus restoration | Convert modal dialog into nonmodal dock |
| `sovet-rdtl/src/ui/components/sov-backdrop.js` | Picture mobile source, cache, image fallback | Reuse approach for dark atmospheric backgrounds |
| `sovet-rdtl/src/ui/components/sov-composer.js` | Draft preservation, viewport and input focus | Use only as input/viewport reference; no chat composer |
| `sovet-rdtl/src/ui/dom.js` | `el`, `button`, `emit`, icon SVG | Adapt tiny utilities and event conventions |
| `sovet-rdtl/src/adapters/local-storage.js` | JSON state persistence, conflict/error handling | Adapt adapter contract; not primary Dexie store |
| `sovet-rdtl/src/app/chat-service.js` | Observable state subscriptions and mutations | Study event-to-state separation |
| `sovet-rdtl/src/domain/chat-state.js` | Validation of persisted conversation state | Adapt validation principle only |
| `sovet-rdtl/src/domain/persistent-state.js` | Persisted state shape | Study serialization boundary |
| `sovet-rdtl/src/config/backgrounds.js` | Background image manifest | Reuse asset registry concept |
| `sovet-rdtl/src/main.js` | Browser composition/bootstrapping | Study startup responsibilities |
| `sovet-rdtl/styles.css` | Exact dark tokens, sidebar sizing, mobile layout and focus | Visual reference |
| `sovet-rdtl/README.md` / `.specs/` | Original project architecture and behavior framing | Original-source evidence |
| `sovet-rdtl/LICENSE` | MIT license for code with corpus caveat | Preserve |

**Original file availability:** exact extracted file copies are under `reference/sovet-rdtl/sovet-rdtl/...`. The kit does not include the conversation corpus, unrelated sound/media, or the original full application distribution.

## Extension engineering reference: `browser-extension-src.zip`

Prefix for extracted copies: `reference/browser-extension-src/`.

| Original path | Evidence / why inspect | Approach |
| --- | --- | --- |
| `src/background/service_worker.ts` | Central MV3 worker, Dexie init, message router, settings subscriptions | **Architecture anti-example** for monolithic worker; inspect specific mechanisms |
| `src/background/tab_trail_service.ts` | Store abstraction with Dexie and in-memory alternatives | Main repository pattern reference |
| `src/content/runtime_messaging.ts` | Typed request/response envelopes, correlation and errors | Port to Worker `postMessage` transport |
| `src/settings/settings_runtime.ts` | Settings definitions, defaults/overrides, normalization, reset | Main settings schema reference |
| `src/settings/settings.ts` | Dynamic settings controls and interaction | Adapt to native Web Components |
| `src/settings/settings.html` / `settings.css` | Existing settings layout/markup | UI reference |
| `src/types/globals.d.ts` | UMD-global library typing | Replace with more encapsulated vendor adapters |
| `src/content/text_expander_minibuffer_model.ts` | Questions, examples, completions, allowed values | Inspiration only: much too broad for new minimal DSL |
| `src/vendor/retroos-ui-v001/src/components/field.ts` | Shadow DOM, help and error states | Reuse component conventions |
| `src/vendor/retroos-ui-v001/src/components/input.ts` | Custom native input wrapper | Reuse conventions |
| `src/vendor/retroos-ui-v001/src/components/textarea.ts` | Custom textarea wrapper | Reuse conventions |
| `src/vendor/retroos-ui-v001/src/components/tabs.ts` | Accessible choice navigation | UI inspiration |
| `src/vendor/retroos-ui-v001/src/components/listbox.ts` | Selection components | UI inspiration |
| `src/vendor/retroos-ui-v001/src/components/dialog.ts` | Dialog semantics | UI inspiration |
| `src/vendor/retroos-ui-v001/src/components/toast.ts` | Feedback notifications | UI inspiration |
| `src/vendor/retroos-ui-v001/src/core/styles.ts` | Constructed stylesheet caching and fallback | Reuse approach |
| `src/vendor/retroos-ui-v001/src/core/define.ts` | Define custom elements once | Reuse approach |
| `src/vendor/retroos-ui-v001/src/core/sanitize.ts` | Content sanitization helpers | Validate capabilities for HTML export |
| `src/vendor/retroos-ui-v001/tsconfig.json` | Strict ES2025 + bundler TS config | Configuration reference |
| `src/vendor/retroos-ui-v001/scripts/build.mts` | Bun-based build script | Configuration reference |
| `src/content/atools/session-snapshot-v001/js/session_snapshot_zip.ts` | JSZip export packaging | Adapt export logic |
| `src/content/atools/markdown-to-html-v001/js/markdown-to-html-core.ts` | Markdown→HTML core without UI | Adapt export isolation |
| `src/content/atools/rich-text-to-markdown-v001/js/rich-text-to-markdown.ts` | Rich HTML→Markdown conversion | Reference optional export path |
| `src/content/libs/dexie-4.2.0.js` | Dexie UMD 4.2.0, Apache 2.0 header | Copied byte-for-byte to `library/` and source mirror |
| `src/content/libs/jszip-3.10.1.js` | JSZip UMD | Copied as optional vendor |
| `src/content/libs/markdown-it-14.2.0.js` | Markdown parser UMD | Copied as optional vendor |
| `src/content/libs/turndown-7.0.0.js` | Rich HTML→Markdown UMD | Copied as optional vendor |

For the vendored UI framework, the kit includes all its `src/` TypeScript source and its `scripts/` tools, but excludes `node_modules`, generated distributions and archived build outputs. This is a **reference subset**, not a standalone reinstall of the original framework.

## Mapping from reference to proposed feature module

| New feature | Best reference(s) | Additional new work |
| --- | --- | --- |
| Documents | `sov-sidebar.js`, `chat-service.js`, `tab_trail_service.ts` | Document model, editor semantics, create/load/save APIs |
| Placeholder guidance | `sov-origin-panel.js`, RetroOS `field.ts` | Nonmodal, focus-safe dock and pinned hint state |
| Template parser/loader | `text_expander_minibuffer_model.ts` (concepts only) | Minimal `.gtl` parser; manifest/cache |
| History | `local-storage.js`, Tab Trail store | Revision snapshots, restore and retention |
| Settings | `settings_runtime.ts`, `settings.ts` | Browser transport, feature notifications, mode migration |
| Worker transport | `runtime_messaging.ts`, `service_worker.ts` | Dedicated Worker router, retry/error/timeout handling |
| Export | `session_snapshot_zip.ts`, markdown conversion | Semantic text/HTML/Markdown/ZIP export |
| Theme/backgrounds | `styles.css`, `sov-backdrop.js`, `backgrounds.js` | Responsive image themes, accessibility and contrast |
