# Contract coverage and product gaps

This is an assertion register, not a line-coverage percentage or a claim that
unimplemented features pass. The product implements `suggestions001-01` and the
major UX change request `suggestions001-02`. Two smoke tests gate 18 acceptance
cases across AC01-AC16 (AC13 runs in three stores). Assertions below distinguish
browser proof, product-domain coverage, and remaining manual/environment limits.
Migration implementation and migration-specific tests are **not applicable** under
the overriding dated development-mode directive in `AGENTS.md`.

## Implemented current-product contracts

| ID              | Real operations and assertions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Specification relationship                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| SM01            | Core surfaces and three templates; copy disabled initially; no forced answer focus; placeholder/restore focus; real guidance hiding; Issues toggle; ready result; native export Escape/outside dismissal and trigger focus                                                                                                                                                                                                                                                                                                                                                   | Minimal current writing readiness gate                                                                    |
| SM02            | Settings apply; authoring/new-source actual focus; saved draft in original context; simultaneous separate context has default preferences, zero documents/drafts                                                                                                                                                                                                                                                                                                                                                                                                             | Source/settings readiness; order-independent isolation                                                    |
| AC01            | Untouched/reverted previews not saved; out-of-order field values; copied/used/edited examples; exact independent output; rename retains identity; navigation save/reload; all representative answers; alternate-version answer separation; real plain/rich clipboard; exact `.txt`, `.md`, `.html` names/bytes; genuinely opened replacement template versus preserved saved snapshot                                                                                                                                                                                        | Original A00-A09, GTL rendering, working drafts, autosave/history, export; automation AC01 current subset |
| AC02            | Answer/selection survive guidance hide/show with observed editing focus; Issues remains independent; accessible Settings focus; dark/light scans; theme/background/density; log selections persist; keyboard hints; reject 0, fractional and over-limit intervals; interval autosave without navigation; cross-tab preference updates; reload restores content/settings                                                                                                                                                                                                      | Original A11, shared settings and editing continuity                                                      |
| AC03            | Separate explicitly created instances/IDs/answers; rename same identity; incomplete work remains navigable and copy-gated; delete names target and defaults to Cancel; cancellation; confirmed deletion removes only target; reload preserves remaining list and both answers                                                                                                                                                                                                                                                                                                | Original lifecycle/storage invariants; automation AC03 current subset                                     |
| AC04            | Fresh source focus; invalid source saved/downloaded verbatim; diagnostic navigation focuses source; reload exact invalid bytes; native source undo; field removal/recreation; safe prototype-like names and choices; two GTL versions/live result; stable draft identity; preview answers do not persist or create documents; bundled-copy isolation; cancel/confirm draft deletion retains other source and built-ins                                                                                                                                                       | Original A10, GTL, source data safety; automation AC04 current subset                                     |
| AC05            | Real IndexedDB durability; two-tab document revision conflict and preserved copy; clean source/revision refresh; conflicting source preserved as copy; inactive-store read-only controls; real localStorage reload/concurrency and confirmed reopen-latest; correct store identities; memory document/source works then disappears; previous persistent stores remain readable; concurrent independent context starts clean/default                                                                                                                                          | Original S00-S13, worker-backed storage, preferences; automation AC05 excluding waived migration work     |
| AC06            | Subdirectory hosting; native version keyboard focus; boundary navigation; selected ranges/modifiers/composition event guards; native answer undo; Tab/Shift+Tab; filled-field restoration; sidebar focus survives interval save; multiline blank note/email exact newlines; no implicit choice; visible choice labels; optional field behavior; authored markup stays literal and HTML export escapes it; Escape and outside rename; measured 390x844/390x520 usable input/panel bounds and overflow; mobile navigation closes; document/settings/source accessibility scans | Original U00-U14; T05-T06, T19-T23, T25, T28; accessibility                                               |
| AC07            | Quota failure retains latest edits and truthful critical failure with Issues closed; incomplete copy/export gating; exact recovery JSON; retry saves newest answer; denied plain/rich clipboard never claims success; independently saved content opens and stays editable during a deliberately stalled unrelated search fetch; failed-template search/preview distinguished from no matches and genuinely retried; corrupt collection bytes never overwritten; cold manifest retry; unavailable worker and blocked preferences still permit writing                        | Errors/data integrity; P18, T13, T16, T27                                                                 |
| AC08            | Real pointer drag/resize and keyboard movement/resize; active input identity, focus, selected range, composition guard and native undo preserved; exactly one settled layout write, zero content transactions/worker messages; microdrag is a no-op; same-edge tabs and roving focus; shared dock resize; final collapse measurably reclaims full width; close/restore/float; viewport clamping and individual reset; axe                                                                                                                                                    | P01-P09, P15-P16, P19-P22, P25; gesture side effects                                                      |
| AC09            | Geometry bounds/no overflow at 1920/1366/768/360/320; desktop intent bytes unchanged by adaptation; exact desktop rectangle restored; reload; independent Authoring reset leaves Documents layout intact; cross-tab last stored writer adopted on reload; reduced motion/forced colors and axe; 320px screenshot                                                                                                                                                                                                                                                             | P10, P12-P13, P23, P26; responsive environment matrix                                                     |
| AC10            | Denied layout writes keep functional geometry with visible session warning; explicit retry persists; corrupt layout recovers defaults and retains warning until reset; exact content records and answers unchanged                                                                                                                                                                                                                                                                                                                                                           | P11, P14; layout recovery independent of content storage                                                  |
| AC11            | JSON guidance excerpt; misspelled email ranking; stable focused search with literal Space; deterministic email sample; two preview styles never change current result or create records; explicit preview focus/Close return and keyboard Escape without reopening; Clear restores manifest order; explicit Use chooses intended style; private answers never indexed                                                                                                                                                                                                        | T01-T04, T14-T15, T18; noncommittal discovery                                                             |
| AC12            | Local document size, compact field size and suggestions preference; exact 1.25 reading scale; input identity/selection retained; answer autocomplete suppression; exact export bytes unchanged; full Settings reflects compact/local choices; reload durability and same content identity                                                                                                                                                                                                                                                                                    | T07, T10-T11, T24, T26                                                                                    |
| AC13 (3 stores) | Actual IndexedDB/local/memory archive/Undo/restore; duplicate-titled records targeted by full ID; archive timestamp separate from content updatedAt; archived edits remain archived; Active/Archived/Recent filtering and Recent limit; exact-record delete/cancel; reload expectations appropriate to each store                                                                                                                                                                                                                                                            | D01-D05, D09-D11, D16; D06 migration excluded                                                             |
| AC14            | Independent draft/GTL names, updated heading/breadcrumb; exact current-source checkpoints and dedup; readonly history/current editor visibility; exact historical download; return preserves current native undo; failed pre-restore protection leaves source/history intact; successful restore protects unsaved current source and keeps immutable prior snapshots; reload same identity/history                                                                                                                                                                           | A03-A05, A10-A12, A14, A18                                                                                |
| AC15            | Source save succeeds but checkpoint write fails; accurate history error, no stale success notice, stored newest source and unchanged old history; retry creates checkpoint and clears error                                                                                                                                                                                                                                                                                                                                                                                  | A14; distinct partial-success failure precondition                                                        |
| AC16            | Controlled one-second authoring autosave stores newest source, preserves semantic draft-navigation focus, and creates no extra checkpoint; New template from persistent Authoring navigation on full Settings opens/focuses a fresh editor                                                                                                                                                                                                                                                                                                                                   | A06, A09; authoring navigation continuity                                                                 |
| Infrastructure  | Aliased/static/dynamic/type/re-export/require source escapes rejected; computed loads rejected; internal cycles allowed; product-to-suite imports rejected; source junction rejected; configuration inheritance/includes/aliases/linked dependencies rejected; absent/stale/new-input builds rejected; empty worker and changed compiled bytes rejected; stale served GTL rejected despite matching metadata/core bundles                                                                                                                                                    | Framework independence/build provenance, seven Bun tests                                                  |

AC01 also checks the displayed 14-word count. AC02 uses a controlled shared-context
clock to verify that a newly selected one-second autosave interval leaves the edit
unsaved at 999 milliseconds and saves it after the next millisecond. The clock
continues running during accessibility scans. AC04 exercises both source diagnostic
navigation entrypoints. AC06 verifies mobile-drawer Escape and focus return.

AC05 additionally verifies that memory-only authoring history is explicitly
session-only and disappears on reload. AC14's missing-checkpoint counterpart,
exact whitespace/line-ending distinctions, safe TEMPLATE-name boundaries,
checkpoint retention, concurrent editing during save, failed-delete operation
release, archive/save and delete/save races, and stale-refresh generations are
product-domain tests. Geometry corruption/isolation, allocation, deterministic
ranking, samples, and raw/native source mapping also have focused unit coverage.

The old 23 browser tests were consolidated rather than retained as a duplicate
runner. There are now 75 product-owned Bun tests, plus seven suite infrastructure
tests. Tests do not import product parsers/renderers to generate expected text.

## Requirement reconciliation and remaining scope

The former major-UX product gaps are implemented and protected above. Dedicated
new journeys are justified in GUIDED-UX-011: gesture side effects, layout failure
preconditions, three-store archive identity, atomic restore, and checkpoint
partial-success faults should not be hidden inside unrelated mega-scenarios.

Migration rows, including D06 and the legacy database/preferences environment,
are intentionally **not applicable**, not passed compatibility tests.
Generated-document content revision history, deleted-item recycling, publication
backends, and automatic recovery-file import are not product features.
The register is not a claim that every Z01 row has a separate browser assertion.

## Remaining verification limits

- Chromium is the executed gate. No new Firefox or Safari acceptance run is
  claimed. Safari remains essential-only/low-priority per `AGENTS.md`.
- Composition events verify the application's navigation guard; they do not
  emulate a complete OS IME candidate/commit interaction.
- Viewport resizing and measurable geometry are real browser checks, not proof
  of physical-phone virtual-keyboard behavior or a native browser-toolbar 200%
  zoom run. Narrow reflow is exercised down to 320px; no native zoom certification
  or every-device/browser claim is made.
- axe scans supplement focus/keyboard/geometry assertions; they are not a full
  screen-reader/manual accessibility certification.
- Hidden/page-close saves remain best effort. The suite does not guarantee
  survival of a forced browser/process/OS crash.
- Recovery JSON preserves work for manual recovery; automatic recovery import is
  absent. Authoring source-history inspection/protected restore is covered.
- Native downloads/clipboard contain the exact asserted synthetic content; no
  operating-system clipboard interoperability with every external editor is claimed.

## Reference adaptations actually reviewed

The live eye05 suite's application factory, fixture, base/control classes,
diagnostics/timings, Mini Browser Page Object/Flow, isolation/boundary tests,
failure-injection and focus specifications, and root ADR-001 through ADR-007
informed this implementation. Its persistent extension launcher/reset logic,
order-dependent isolation sequence, regex-only import checks, and unbounded
captures were deliberately not copied.

Connected Prompt Menu browser/source examples informed realistic control/focus
checks, but its production-derived expected-prompt oracle was rejected. Skill
editor source/tests informed native textarea/undo and safe highlight checks,
without fixed sleeps. Soviet storage tests informed pre-delay durability,
concurrency and quota/retry checks, not its incompatible corrupt-state reset.
Emoji Nudge's native popover/clipboard implementation informed light dismissal
and truthful errors; its mock-only historical validation was not treated as
browser proof. Earlier relevant-source review of the GTL reference kit, full
requirements conversation, and all AGENTS-listed references is retained in the
project investigation history; no reference source is imported by this suite.
