# Major UX improvements: implementation plan

Created 2026-10-26. This document is immutable. Execution progress and later design
decisions are tracked separately, not by rewriting this plan.

## Authority and research

- Implement the complete physical `suggestions001-02-change-request-major-ux-improvements.md`,
  including its embedded A01-Z01 documents, acceptance matrices and completion rules.
- Preserve the initial specification and applicable code-organization guidance,
  except where this change explicitly supersedes them.
- Apply the overriding AGENTS development directive: migration implementations,
  compatibility converters, migration validation and migration-specific tests are
  intentionally excluded. Do not overwrite or clear unrelated browser data.
- Keep the canonical project root in `D:\my-github\toys-awwtools-com\docs\public`.
- Retain the independent automation framework and its production-source boundary,
  served-build provenance, diagnostic collection and stable test-ID contract.

Research completed before implementation:

- Read the complete major specification, its complete illustrated recording
  transcript, relevant frames, current AGENTS, architecture documents and the
  applicable code-organization document.
- Revisit the original conversation's language, guidance, storage and worker
  requirements. Approved specifications take precedence over exploratory ideas.
- Review connected Prompt Menu source and CSS: native radio tiles, live sample
  previews, floating prompt geometry, collapse/restore, pointer capture, resizing
  and reading size. Do not reproduce its missing drag threshold, focus stealing,
  responsive preference mutation or reset-position-only pseudo-docking.
- Review Skill editor highlighting and native undo/selection/scroll synchronization;
  preserve the vendored Microlight attribution and native textarea editing.
- Review SovietRDTL palette, sidebar, focus, mobile scrolling and persistence;
  do not copy corrupt-data-to-empty behavior.
- Review Emoji Nudge native select/popover enhancement and focus restoration.
- Review GTL kit typed settings and correlated runtime messaging, and the actual
  extension's request wrapper and previously studied independent test framework.
- Research state-preserving DOM moves, Pointer Events and VisualViewport. Prefer
  continuously mounted panel bodies so placement itself requires no DOM move.

## 1. Layout foundation and first runnable increment

- Define typed panel IDs, workspace contexts, placement, visibility, floating
  rectangles, remembered dock widths and active same-edge tabs.
- Keep desired desktop arrangement distinct from effective responsive geometry.
- Implement pure validation, per-entry corruption isolation, defaults, clamping,
  initial right/left/above/below placement and center-width allocation.
- Persist namespaced/versioned layout independently of document storage mode;
  compare normalized settled state, avoid no-op writes, retain memory state on
  failure, deduplicate warnings and expose retry/reset.
- Mount stable panel bodies and implement a floating field editor activated by
  real document placeholders. Open without a field shows neutral guidance.
- Build/type-check/unit-test this increment and open the actual browser before
  implementing the remaining panel behaviors.

## 2. Shared panel interactions

- Integrate Documents navigation, separate Authoring navigation/history, Field
  editor, Issues and compact Settings through the same panel implementation.
- Implement Float, Dock left, Dock right, Collapse, Restore, Close and individual
  geometry reset; omit meaningless current-placement commands.
- Group expanded same-edge panels into a tabbed dock with one active body.
- Release all allocated width when the final expanded member collapses/closes;
  retain labeled edge restoration and an always-available Panels mechanism.
- Preserve expanded floating geometry through compact draggable titlebar collapse.
- Implement primary-pointer titlebar dragging with a four-pixel threshold, pointer
  capture and cleanup on up/cancel/lost capture/window blur/document hiding.
- Implement floating horizontal/vertical/corner resize, dock-width resize, bounded
  keyboard move/resize/center commands and deterministic session stacking.
- Keep manipulation frames presentation-only: no parsing, rendering, saving or
  search indexing. Persist only settled deliberate changes.
- Preserve control identity, focus, caret, selection, IME/native undo and internal
  scrolling across placement, resizing, collapse/restore and settings updates.
- Give each workspace independent remembered arrangement. Workspace reset changes
  only panel layout; individual reset changes only that panel's placement/geometry.
- Adapt competing docks before the center becomes unusable. Handle 1920, 1366,
  768, 360 and 320 widths, 200% zoom, reduced motion and VisualViewport changes.
- Verify keyboard/touch dismissal and focus return; avoid body overflow and
  background scroll traps. Review architecture and panel code at this milestone.

## 3. Document lifecycle and truthful navigation

- Add archive state/timestamp without changing content updatedAt for archive alone.
- Implement Active/Archived/Recent filters with stable browser UI persistence,
  updatedAt-descending/ID tie sorting and a validated Recent limit of 1-100.
- Preserve filter when creating New Document; do not persist untouched selectors.
- Provide visible, stable-ID row actions in order Archive/Restore, Rename, Delete.
- Add focused/prefilled explicit Rename with Enter/Escape/cancel, nonempty and
  200-Unicode-code-point validation, duplicate-title support and no-op avoidance.
- Propagate title changes to rows, heading/breadcrumb and export filename without
  changing source, answers, identity or related-version associations.
- Archive newest coherent state, coordinate pending saves, provide identity-stable
  Undo and permanent restore from Archived, select the next visible active item.
- Keep archived documents fully editable/exportable without implicit restoration;
  expose status and Restore beside their title.
- Confirm deletion with exact identity context for duplicate titles, remove only
  that record, clear stale editing UI and prevent pending saves from recreating it.
- Reconcile other-tab deletion without losing dirty recoverable content.
- Cover all lifecycle operations in IndexedDB, localStorage and memory modes;
  exercise concurrent writes, save failures and deletion/autosave races.

## 4. Authoring identity and recoverable checkpoints

- Separate display title from the GTL TEMPLATE name; default to Untitled template.
- New alone stays temporary; meaningful source, deliberate rename or Save now
  establishes a draft. Rename has the same title validation and no-op semantics.
- Implement immutable stable-ID checkpoints with draft identity, exact source,
  timestamp, kind and optional label, independent of record revision/GTL VERSION.
- Save now flushes current source and creates a checkpoint only if exact source
  differs from the latest relevant checkpoint. Distinguish current-save failure
  from checkpoint-save failure without discarding the current source.
- Ordinary autosave, typing, navigation, rename and download create no checkpoints.
- Retain 25 automatic recovery snapshots; never silently prune explicit/named ones.
- Provide separate Template drafts navigation and selected-draft history.
- Inspect checkpoints read-only with Historical version, Restore this version and
  Back to current. Missing snapshots leave current source intact and recoverable.
- Before restoring, durably retain current in-memory source; any protection failure
  blocks replacement. Restoring never mutates the selected historical snapshot.
- Clearly label memory-mode history session-only.
- Confirm draft deletion including checkpoint consequences; never delete bundled
  templates or ordinary documents.
- Implement explicit GTL Template name edit only for exactly one safe TEMPLATE
  directive, preserving other bytes/line endings; otherwise explain and offer source.
- Distinguish bundled read-only inspection from Create editable copy; repeated
  inspection creates no drafts or duplicate saved records.
- Preserve invalid current source, truthful diagnostics, exact source download,
  preview-answer isolation and native source editing continuity.
- Unit-test atomicity, races, exact-source deduplication, retention and failure;
  review lifecycle/checkpoint code before final UI integration.

## 5. Template discovery, samples and styles

- Index only registered template data: title, description/category, version names,
  literal text, questions, hints, examples and options; never user answers/drafts.
- Rank exact title, prefix, words, version, metadata, prose, guidance and bounded
  fuzzy matches deterministically; normalize accents/punctuation/hyphens/spacing.
- Prefer all query terms; constrain short fuzzy queries and preserve manifest/ID
  ties. Return one result per template with useful version/guidance match reasons.
- Keep a stable native search input through live updates, space and composition;
  clearing restores manifest order without selecting a template.
- Distinguish index/load failure from zero matches; provide retry.
- Add delayed hover with crossing grace, keyboard preview, explicit touch Preview,
  selectable/scrollable sample, Escape/outside dismissal and stale-request guards.
- Generate samples with the production parser/renderer and deterministic quality
  fixtures/examples/options; honestly mark unresolved data and isolate bad templates.
- Sample version selection never creates a document, changes active style, shares
  answers or writes content storage.
- Use visible accessible native radio style tiles with meaningful structural
  excerpts for small desktop sets and an appropriate compact mobile presentation.
- Restore existing related-version documents without sharing answers.
- Unit-test title/guidance/JSON/email/fuzzy/ranking/ties and sample determinism;
  browser-test noncommittal previews, input continuity and failed/stale loading.

## 6. Unified settings, readable editing and functional copy

- Extend the existing typed schema/service, not a parallel preference owner, with
  document/field-editor Normal/Large sizes, browser suggestions and Recent limit.
- Synchronize full Settings, compact nonmodal Settings and local size controls.
- Retain full storage/autosave/diagnostic controls and expose layout reset/full
  Settings from the compact panel.
- Apply roughly 20-30% larger reading text without changing source/export bytes.
- Default browser suggestions On; Off adds autocomplete=off to applicable answer,
  rename and template-name text inputs without remounting; On removes override.
- Keep native search/source/select semantics and accurately explain browser control.
- Preserve effective session values on failed persistence, expose accurate errors,
  and do not interrupt editing/manipulation on cross-tab updates.
- Render unresolved inline fields as $identifier, preserve active identity and
  repeated-field consistency, and keep optional empty targets operable.
- Focus the actual answer control immediately on activation; avoid recreation or
  select-all for repeated activation. Preserve undo, selection, IME and native Tab.
- Keep Examples Use and Copy independent, expose truthful clipboard errors.
- Make Generated result read-only, multiline/selectable and complete. Gate only
  completed-result copy/export, explain unresolved fields and provide navigation.
- Remove specified slogans, decorative dots and aggregate counters; use functional
  Field editor/Examples/Template fields/Generated result/Templates/Template drafts.
- Keep useful storage facts, save failures, incomplete/invalid/history distinctions.

## 7. Independent acceptance, integration and completion

- Update existing smoke/AC01-AC07 Page Objects/components/Flows and independent
  expected fixtures; add coherent journeys where genuinely needed, not per-control
  tests. Keep selectors and orchestration behind the suite's public boundaries.
- Cover real pointer/keyboard manipulation, same-edge tabs, measured center-width
  recovery, restored geometry, layout corruption/failure/no-op persistence, workspace
  independence, compact viewport/zoom behavior and active editor DOM continuity.
- Cover catalog guidance/style matching, noncommittal preview and style switching;
  document rename/archive/Undo/restore/filter/delete; checkpoint inspect/restore/
  failure; compact/full/local settings synchronization and reading byte invariants.
- Retain prior completion gates, multiline/choice behavior, export content, native
  undo, worker/local/memory isolation, recovery and concurrent-tab coverage.
- Update mutation sensitivity needles to the new architecture and execute the
  framework's meaningful defect/restored-baseline checks.
- Build/type-check/run focused tests after meaningful increments, inspect actual
  browser appearance and diagnostics repeatedly, fix relevant issues before moving on.
- Perform model-assisted milestone/final review and resolve actionable findings.
- Run final formatting, unit/infrastructure tests, fresh production build and full
  independent browser suite, including repeated parallel acceptance execution.
- Update README, architecture/ADRs, COVERAGE and VALIDATION with actual evidence,
  explicit nonimplemented/physical-device limitations and migration exclusion.
- Inspect scoped final diff; preserve prior work, tracked dist assets and vendored
  notices; keep generated browser artifacts/caches out of Git.
- Reconcile every acceptance/completion requirement and all execution TODOs.
- Only after complete verified persistent results, attempt `shutdown /h` once as
  specifically requested. If it fails, do not force shutdown or try alternatives.
