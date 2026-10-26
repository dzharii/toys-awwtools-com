# Initial implementation plan

Created: 2026-10-25

This append-only plan covers all six contracts contained in
`suggestions001-01-initial-specification.md`. Execution is tracked outside this
immutable document.

## Foundation and references (H00-H04, D00-D04, D11)

- Read AGENTS.md, both specification documents, the requirements workshop,
  reference-kit architecture, licensing notes, and the named original references.
- Pin TypeScript 7.0.2; use Bun scripts, strict browser/worker type checking,
  native Web Components, no runtime npm dependencies, and ignored build artifacts.
- Vendor Dexie 4.2.0 and microlight 0.0.7 with provenance and license notices.
- Implement a portable static build validating the manifest and every GTL file;
  bundle main and dedicated-worker entries and copy relative-path assets.
- Run the smallest static application in a real browser before expanding it.

## Template domain (L00-L13, H09)

- Model definitions, versions, literal/reference parts, metadata, and diagnostics.
- Parse uppercase directives, case-sensitive identifiers, LF/CRLF, structural
  indentation, significant internal blank lines, and relative text indentation.
- Support required/optional fields, generated guidance for undeclared references,
  repeated references, multiline input, choices with key/label interpolation,
  shared declarations, and independent template versions.
- Diagnose missing/empty/duplicate/mixed blocks, malformed references, invalid
  identifiers/options/input types, unsupported directives, and unused declarations.
- Implement pure substitution and validation without HTML interpretation.
- Ship the five project-description styles, Blank note, and useful choice/optional
  examples; validate an explicit stable-ID manifest and load source on demand.
- Test published examples, whitespace, malformed syntax, repeated fields, options,
  optional values, invalid answers, and immutability.

## Guided documents and interaction (A00-A09, U00-U08, U13-U14)

- Build the restrained dark three-region shell with document navigation, template
  and version selection, inline placeholder affordances, persistent docked
  guidance, selectable examples, current issues, and live read-only results.
- Keep fixed prose uneditable and expose real labeled value controls.
- Support title edits, independent New Document instances, related version
  navigation, recent ordering, restoration, and identified deletion confirmation.
- Treat untouched previews and reverted temporary edits as nonpersistent; preserve
  existing documents when their answers are cleared.
- Implement testable no-wrap keyboard policy, boundary arrows, native multiline
  up/down, normal Tab/selection/modifiers, IME safety, and focus restoration.
- Disable copy/export for incomplete required fields with a visible explanation.
- Implement plain and semantic rich clipboard, honest clipboard failures, and
  UTF-8 text/Markdown/safe semantic HTML downloads without UI decorations.

## Persistence, worker, and recovery (A07-A08, H05-H07, S00-S13)

- Define typed versioned worker envelopes, correlation, feature routing, boundary
  validation, structured errors, timeout/crash handling, and controlled restart.
- Centralize Dexie schema with documents and authoringDrafts, no revision history.
- Verify vendored Dexie in the bundled module worker using a real browser.
- Implement repository contracts, memory, worker-backed IndexedDB, and namespaced
  schema-versioned localStorage with atomic cross-tab concurrency protection.
- Persist template snapshots, stable document identity, timestamps, related groups,
  and revision counters; reject corrupt records without destructive resets.
- Save dirty coherent snapshots at a configurable default 60-second interval and
  on navigation/hidden; serialize writes and protect newer edits from old replies.
- Display temporary/dirty/saving/saved/failed/conflict states; retain in-memory work
  on all failures, allow retry, reload latest, or preserve conflict as a new document.
- Change stores without implicit migration/deletion; retain old-store working data
  and clearly distinguish its origin from the selected store.
- Test autosave coalescing, reloads, version isolation, empty previews, deletion,
  store switching, corrupt data, unavailable storage, stale replies, and two tabs.

## Settings and diagnostics (A11, H10-H11, U11, D07-D08)

- Generate Appearance, Editing, Storage, and Diagnostics controls from a typed
  schema containing labels, descriptions, defaults, validation, and controls.
- Apply settings immediately; persist preferences separately in localStorage;
  reload effective settings across tabs using storage events/BroadcastChannel.
- Notify workers, reconfigure autosave, and report blocked preference storage.
- Add styled/plain privacy-preserving logging with severity filtering and guarded
  parameter serialization; never log source, answers, or clipboard contents.

## Template Authoring (A10, S10, U12)

- Provide new/open bundled/reopen local draft actions in a distinct workspace.
- Implement an accessible source editor with microlight-inspired highlighting,
  synchronized scrolling, live source-location diagnostics, and error navigation.
- Preview using the production parser/renderer and editable preview-only answers.
- Autosave invalid source independently under the configured storage mode;
  restore it after reload without modifying bundled templates.
- Always allow `.gtl` source download, even when invalid, and explain publication.

## Release quality (A14, H12, U09-U14, D05-D13, code-quality appendix)

- Add semantic theme tokens, density/theme controls, original subdued backdrops,
  responsive navigation drawer, compact non-obscuring mobile guidance, safe-area
  and visual viewport handling, visible focus, reduced motion, and live statuses.
- Maintain source-level contracts and concise setup, architecture, language,
  storage, deployment, limitations, and third-party documentation.
- Run unit/feature/worker tests, strict type checks, production build, and actual
  browser end-to-end workflows including clipboard, exports, authoring, mobile,
  keyboard/IME/selection, reload, settings propagation, and concurrent saves.
- Inspect real desktop/mobile screenshots and browser console errors; perform
  model-assisted code review and fix material findings.
- Review all six specification sections against the final implementation, ensure
  subdirectory hosting works, and leave only intended source artifacts in Git.
