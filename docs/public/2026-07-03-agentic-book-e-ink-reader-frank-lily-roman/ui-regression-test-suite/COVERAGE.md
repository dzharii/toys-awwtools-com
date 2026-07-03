# E Ink Reader — UI Regression Coverage Matrix

This document maps the automated UI regression suite
(`ui-regression-test-suite/`) to the behaviors it protects. The suite tests the
static app **only through its rendered DOM contract** (`data-testid`, ARIA, and
the read-only `window.__einkReader` handle) and never imports app source. Every
action ends with the Standard Post-Action Oracle
(`src/framework/support/oracle.ts`) and, for gap-closure specs, an adaptive
surrounding-state baseline (`src/framework/support/baseline.ts`).

**Total: 198 automated tests across 32 spec files. All passing.**

## Category matrix

| Category        | Tests | Spec files                                                                 | What it protects |
| --------------- | ----- | -------------------------------------------------------------------------- | ---------------- |
| smoke           | 8     | `smoke/smoke.spec.ts`                                                       | App boots, open screen ready, metadata/handles present, no console noise. |
| files           | 15    | `files/files.spec.ts`, `files/dragdrop-and-large-files.spec.ts`            | Picker + drag-and-drop, `.txt/.md/.markdown`, PDF rejection, large files, multi-file drop, replace-after-reject. |
| txt             | 10    | `txt/txt.spec.ts`, `txt/txt-structure.spec.ts`                            | Plain-text paragraphs, blank-line separation, command-output indentation, structure across theme/font change. |
| markdown        | 24    | `markdown/markdown.spec.ts`, `markdown-structure.spec.ts`, `markdown-links.spec.ts`, `markdown-code-line-numbers.spec.ts` | Headings/lists/blockquote/hr/tables, safe HTML, link safety, code-block line numbers. |
| metadata        | 5     | `metadata/metadata.spec.ts`                                                | Static head: title, description, canonical, RSS discovery, Open Graph, Twitter card, social image dimensions. |
| rss             | 5     | `rss/rss.spec.ts`                                                          | `feed.xml` valid RSS 2.0, channel + item fields, user-oriented copy, no over-claiming. |
| navigation      | 14    | `navigation/navigation.spec.ts`, `navigation/keyboard-shortcuts.spec.ts`  | Page/scroll nav, Home/End, progress, all keyboard shortcuts + gating while settings open / typing. |
| settings        | 16    | `settings/settings.spec.ts`, `settings/settings-boundary.spec.ts`         | Every setting applies + persists; numeric ranges accept min/max and clamp out-of-range. |
| responsive      | 19    | `responsive/responsive.spec.ts`, `responsive/settings-responsive.spec.ts` | No overflow across 6 viewports; settings sheet usable + changes persist on desktop/tablet/mobile. |
| accessibility   | 10    | `accessibility/accessibility.spec.ts`, `accessibility/focus-and-shortcuts.spec.ts` | Accessible names, keyboard-only nav, focus trap (Tab + Shift+Tab), focus reachable after dialogs/keys, reduced motion. |
| privacy         | 12    | `privacy/privacy.spec.ts`, `privacy/storage-surfaces.spec.ts`             | Only prefs key persists; no content in localStorage, sessionStorage, IndexedDB, CacheStorage, cookies; survives reload. |
| offline         | 4     | `offline/offline-runtime.spec.ts`                                         | With cross-origin traffic blocked the app boots + reads; every runtime asset is same-origin. |
| resilience      | 3     | `resilience/missing-assets.spec.ts`                                       | Missing default/all fonts → text still renders; changing to a missing font never hangs. |
| eink            | 9     | `eink/eink.spec.ts`                                                        | E Ink intensity levels, transitions settle, reduced-motion mechanics, no stuck overlay. |
| pairwise        | 27    | `pairwise/pairwise.spec.ts`, `pairwise/pairwise-expanded.spec.ts`         | Hand-picked + all-pairs generated combos of mode×theme×eink×font×motion×contrast×align. |
| journeys        | 17    | `journeys/journeys.spec.ts` + 5 gap-closure journeys                      | Frank/Lily/Roman sessions, unsafe markdown, reduced motion, corrupted prefs, rapid interaction, Roman on mobile. |

## Gap-closure journeys (spec extension)

| Spec file                                   | Journey |
| ------------------------------------------- | ------- |
| `journeys/journey-unsafe-markdown.spec.ts`  | Injected script/iframe/handlers/`javascript:` links are neutralized; nothing executes; no requests; clean surrounding state. |
| `journeys/journey-reduced-motion.spec.ts`   | OS + explicit reduced motion: calm page turns, clean repagination, no stuck overlay. |
| `journeys/journey-corrupted-preferences.spec.ts` | 4 corrupt payloads (bad JSON, array, primitive, wrong version/types) → boots to defaults, reads, rewrites clean prefs. |
| `journeys/journey-rapid-interaction.spec.ts` | Burst page turns, rapid settings/mode toggles, rapid file replace → valid final state, no stuck overlay, clean storage. |
| `journeys/journey-roman-developer-notes.spec.ts` | Code-heavy notes on a phone: contained + line-numbered code, safe links, no persistence, no overflow. |

## Surrounding-state baseline

Gap-closure specs use `createBaseline(app, markers)` with an adaptive
expected-change profile (`src/framework/support/adaptive-baseline.ts`). The
baseline captures a state snapshot before an action and, after it, asserts that
only the fields the profile allows changed while all hard invariants (network,
storage privacy, layout overflow, overlay clearance, error counts) stayed
stable. Profiles: `fileOpen`, `fileReplace`, `fileReject`, `modeChange`,
`settingChange`, `themeChange`, `contrastChange`, `fontChange`, `einkChange`,
`motionChange`, `pageTurn`, `scroll`, `viewportChange`, `settingsOpen`,
`settingsClose`, `reload`, `errorRecovery`, `metadataRead`, `rssRead`,
`noChange`.

## Running

```bash
cd ui-regression-test-suite
bun run typecheck        # tsc --noEmit; no product code is imported
bun run test             # full suite (198 tests)
bun run test:<category>  # any category above, e.g. bun run test:offline
bun run validate         # typecheck + full suite
```
