# Writing-first UX remediation and validation

Implemented `suggestions003-01-mojor-ux-redesign-again.md` in the canonical
`D:\my-github\toys-awwtools-com\docs\public\2026-10-25-text-template-editor`
checkout. Its embedded identifier differs from its filename; the user's
specification and the required implementation TODO remain unchanged.

## Outcome and finding reconciliation

The existing static application, native editors, services, panel manager and
independent acceptance framework are retained. Setup now yields to writing;
source is readable; narrow Settings and contextual guidance have useful
geometry. No migrations, compatibility layers, runtime dependencies or commits
were added. Fresh tracked `dist` output remains the static deployment.

| Finding | Implemented result and observed protection                                                                                                                                                                                                                                                         |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX-A01  | Instance-local microlight resets prevent another mounted editor restoring vendor inline colors. Actual directive, placeholder, punctuation and value tokens use theme-aware colors and matching 14px native/highlight typography. AC17 measures every rendered class in twelve appearances.        |
| UX-A02  | Active document title is the primary heading. Template/style setup uses reversible native disclosures, explicit style confirmation and compact committed composition. AC01/AC06/AC11 retain independent-version and noncommittal-preview assertions; AC17 checks the visible writing/result route. |
| UX-A03  | Untouched neutral guidance is 320×180; active guidance starts at a useful 380×600, clamped to available space. Field/question/hint precede the answer; Examples is immediately discoverable. Explicit user geometry is retained. Units, AC08/AC09 and AC17 protect geometry and native editing.    |
| UX-A04  | Short source starts compact; native resizing and height buttons remain available. View live preview / Back to source preserve caret, selection and internal scrolling. AC04 and supplementary long-source/200% probes exercise the actual controls.                                                |
| UX-A05  | Secondary controls use coherent readable 12–14px text and useful targets. Card Preview lives in its own card footer. Original screenshots were reviewed across all twelve appearances.                                                                                                             |
| UX-A06  | Both shared Settings surfaces say Plain; the stored value and effective appearance are unchanged. AC12 and AC17 exercise the shared preferences.                                                                                                                                                   |
| UX-A07  | Draft title is explicitly distinguished from the GTL template name. Existing name/source/history protections remain in AC04 and AC14–AC16.                                                                                                                                                         |
| UX-M01  | Settings observes its actual container width, not just the viewport. Labels, controls and descriptions stack in a ~300px dock; full Settings remains readable. AC12 measures the actual shared-dock rows; the 320px editorial probe checks full Settings.                                          |
| UX-M02  | The reported missing Large answer scaling did **not** reproduce: actual answer typography already grows exactly 25%. That behavior was preserved, not reimplemented. AC12 retains the exact scale and input-identity/selection assertions.                                                         |
| UX-M03  | One-field templates omit Previous, Next, position and misleading multi-field keyboard help. AC06 checks their absence while retaining native multiline keyboard behavior.                                                                                                                          |
| UX-M04  | Structured generated-content counting excludes unresolved decoration without deleting authored marker-like text. Empty note, singular word, multiline, fixed prose and repeated values are protected by units and AC06. One-field completion also uses singular wording.                           |
| UX-M05  | Redundant body headings and shared-dock title repetition are removed only where visible identity remains. Collapse/close retain explicit accessible names. All public panel commands remain available.                                                                                             |
| UX-M06  | Global New Document works independently of the visible dock tab and opens genuinely unselected discovery. FW01 additionally proves late initialization cannot replace that explicit choice.                                                                                                        |
| UX-M07  | Save state/count sit near the document title; progress belongs to the field section. Ordinary incomplete Issues are quiet and explanatory; actual storage errors remain prominent and actionable. AC07 preserves exact recovery payloads and truthful save failures.                               |
| UX-M08  | Multiline controls use additional allocated panel height without remounting native inputs. An enlarged-panel probe measures >100px useful growth and exact input identity; AC08 protects focus, selection and undo through panel manipulation.                                                     |
| UX-M09  | Preview is visually attached to its card. Its actual positioned height is bounded to the remaining viewport, keeping Close/Use reachable. AC11 retains noncommitment, focus and explicit Use assertions.                                                                                           |
| UX-M10  | Shared-dock identity and global actions are coherent without removing native navigation. The toolbar responds to actual main-container width; short-mobile document history cannot collapse to zero height. AC06/AC09/AC12 retain their navigation/geometry checks.                                |
| UX-M11  | Sampled widths include 1920, 1440, 1366, 768, 390, 360 and 320; actual native Chromium 200% zoom was also exercised. Narrow restore handles reserve their own gutter rather than covering source or Settings text.                                                                                 |
| UX-M12  | The complete existing editing, storage, recovery, conflict, archive, rename, source-history and export journeys remain. The final gate is rerun after editorial/review corrections, not inferred from screenshots.                                                                                 |

The baseline reproduced excessive neutral guidance, clipped docked Settings,
one-field navigation, incorrect empty/singular counts and creation hidden by
another dock tab. Global horizontal overflow was not assumed from the old
audit: actual narrow geometry was measured, and demonstrated toolbar/history/
preview defects were corrected.

## Source and acceptance impact

Product changes:

- `src\app\app-shell.ts`, `styles.css`: global discovery, initialization/navigation
  guard, native disclosures, source navigation, readable typography, ordinary
  versus operational Issues and actual-container toolbar layout.
- `src\features\documents\ui\document-workspace.ts`, `document-list.ts`:
  document hierarchy, disclosure state, accurate metadata and short-height history.
- `src\features\templates\renderer.ts`, `ui\version-picker.ts`,
  `ui\template-catalog.ts`, `ui\guidance-panel.ts`: structured word counting,
  candidate versus committed style, card previews and contextual native answers.
- `src\features\template-authoring\ui\source-editor.ts`: per-instance
  highlighting and bounded initial/adjustable height without replacing native editing.
- `src\features\settings\schema.ts`, `ui\settings-page.ts`: shared wording/help,
  accessible description associations and actual-container form layout.
- `src\platform\ui\panels\layout.ts`, `panel-manager.ts`: automatic neutral/active
  geometry, context reconciliation, dynamic toolbar bounds and accessible restores.
- `tests\unit\templates.test.ts`, `panels.test.ts`: focused generated-content
  counting and automatic-geometry cases.

All seven existing Page Objects were reviewed. Document Workspace, Navigation
and Catalog now distinguish unselected discovery, deliberate catalog opening and
explicit style confirmation. Field Editor's opening uses real public activation
to restore intended focus. Authoring and PanelControls use public raise/collapse
operations when legitimate floating panels overlap a target; no forced clicks
or focus repair were introduced. Settings exposes measured row bounds.
The existing creation Flow retains its intended template/style prerequisites
through the owning Page Objects; it does not duplicate selectors or production logic.

SM01/SM02 and AC01–AC16 retain their meaningful assertions. AC04, AC06, AC08,
AC09, AC12 and FW01 gained focused phases in the existing journeys. AC17 adds
one substantial discovery → style → composition → source → neutral-return
journey under twelve isolated appearance preconditions. Its independent
`support\rendered-contrast.ts` observes computed text colors/background
composition without importing product modules or logging source content.
See the exact assertion register in
[COVERAGE](../ui-regression-test-suite/COVERAGE.md).
The deliberate candidate/commit decision is recorded as GUIDED-UX-013.

## Review-driven corrections

A bounded model-assisted code review reproduced two additional real defects.
First, Authoring → New Document could retain a 600px neutral guidance panel
because context switching reset the active flag before geometry reconciliation.
Automatic geometry now reconciles on context change/reset while explicit user
geometry remains untouched. Second, delayed initialization could override an
explicit New Document choice. Startup now captures the navigation generation
before its first await; its public initialization indicator survives navigation
until storage/templates really finish. AC17 and FW01 respectively protect these.

Final original-image editorial inspection also found a narrow restore label
covering source/Settings text. It is now a compact, accessibly named edge handle
with a conditional content gutter. AC09 measures both its width and separation
from the workspace. Blank note's completion wording was corrected to
**1 of 1 field filled**.

New assertions first failed against the pre-fix build: FW01 lost the startup
indicator; AC17 measured 600px neutral height; AC09 measured a 121.375px restore
control. All three passed after correction. The first conditional-gutter CSS
selector targeted the wrong ancestor; the new geometric assertion caught that
attempt too. The selector now uses the actual `gtl-app` host, and the original
320px screenshots visibly show unobstructed content.

Other intermediate failures were classified before changes:

- **Product/layout regressions:** an off-viewport preview, fixed-height wrapped
  toolbar, short-mobile zero-height document list and stale neutral geometry.
- **Intentional contract changes:** discovery is unselected, catalog/style setup
  can be collapsed, style browsing requires explicit commitment, one-field
  navigation does not exist. Tests establish those real prerequisites.
- **Test defects:** a nonexistent style label, invalid `INPUT: text` sample and
  interactions with a covered floating panel. Correct labels/grammar and public
  panel actions replaced those assumptions; assertions were not suppressed.
- **Environment/capture limitations:** full-Chromium native settings require an
  owned persistent profile; long Windows profile paths produced IndexedDB
  `UnknownError`. Short owned profiles succeeded and are removed after closure.
  Native zoom plus full-page CDP screenshots clipped the result; supplemental
  native-zoom captures reuse the capture action with viewport-only screenshots.

## Executed verification

Windows; Bun 1.3.9; Node 22.16.0; TypeScript 7.0.2; Playwright 1.58.2;
Chromium 145.0.7632.6. Retries remain zero. Product commands run at the project
root; Suite commands run in `ui-regression-test-suite`.

| Command                                     | Observed result                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Product: `bun test tests\unit`              | 77 passed; 263 assertions.                                                                                            |
| Product: `bun run build`                    | Three TypeScript contexts and fresh browser/worker/template deployment passed after final source changes.             |
| Suite: `bun run typecheck`                  | Independent boundaries, seven registered concrete surfaces, strict types passed.                                      |
| Suite: `bun run test:unit`                  | 28 passed; 76 assertions, including the final complete gate.                                                          |
| Suite: `bun run test:all`                   | Final post-editorial gate: all 40 passed in 3.4 minutes; nine smoke and 31 acceptance cases, zero retries.            |
| Suite: focused reviewed regressions         | `FW01                                                                                                                 | AC09 | AC17 · dark-plain-comfortable`: three passed after the reproduced fixes. |
| Suite: final `AC06` / `AC09` focused checks | Single-field wording/keyboard journey and corrected narrow restore/gutter journey passed.                             |
| Suite: supplementary editorial config       | Two substantial probes passed after final changes, including actual native 200% zoom and narrow/source/dialog states. |

Focused commands and logs:

```powershell
bunx playwright test --project acceptance --no-deps --grep 'FW01|AC09|AC17 · dark-plain-comfortable' --output '..\temp\ux-redesign\after-final-review-fixes' --reporter list
bunx playwright test --project acceptance --no-deps --grep 'AC06|AC09' --output '..\temp\ux-redesign\editorial-corrections' --reporter list
bunx playwright test --project acceptance --no-deps --grep 'AC09' --output '..\temp\ux-redesign\editorial-gutter-final' --reporter list
$env:GUIDED_PORT='4188'
bunx playwright test --config '..\temp\ux-redesign\playwright.editorial.config.ts'
```

The combined `AC06|AC09` run passed AC06 but caught the initial gutter mistake;
the later dedicated AC09 run passed the actual corrected implementation.
Preserved logs distinguish these runs rather than relabeling a failed run.
The fresh final complete gate uses `bun run test:all` and writes
`temp\ux-redesign\final-ui-regression.log`.

Product and suite `bun run format:check` passed. The root formatter now excludes
the historical generated `temporary` audit directory, just as it excludes new
`temp` evidence; those original audit files were not reformatted or rewritten.

## Original screenshot and contrast evidence

All artifacts are ignored, local and synthetic. The historical audit under
`temporary\ux-audit` was not rewritten. Current matrix evidence consists of
**60 original PNGs**, five per appearance, not 120 counting attachments and not
the historical audit's 84 captures. Original Settings, discovery, style,
composition and source screens were visually reviewed for every appearance,
not inferred from a contact sheet. Final corrected special states were opened
again after their last regeneration.

Original matrix filenames are
`<theme>-<background>-<density>-{settings,discovery-neutral,style-selection,composition-field,source}.png`.
They live in test-specific directories under `temp\ux-redesign\matrix`;
the final complete run refreshes equivalent originals and contrast JSON under
`temp\ui-regression-test-suite\test-results`.

Each syntax class was measured across all twelve configurations:

| Rendered class | Dark minimum         | Light minimum        | Font |
| -------------- | -------------------- | -------------------- | ---- |
| Directive      | 10.481778580928657:1 | 6.572045918906317:1  | 14px |
| Placeholder    | 9.502270949263151:1  | 7.2143852694007355:1 | 14px |
| Punctuation    | 15.301208770542205:1 | 14.849910539238982:1 | 14px |
| Value          | 15.301208770542205:1 | 14.849910539238982:1 | 14px |

The worst unrounded ratio is **6.572045918906317:1**, above the required 4.5:1.
These are actual rendered foreground/local-background measurements, not palette
estimates. The opaque editor background makes decorative page gradients irrelevant.
Unsupported color/opacity composition fails measurement rather than fabricating a ratio.

Supplementary originals are under `temp\ux-redesign\editorial` in two
test-specific directories, with these exact filenames:

- `actual-browser-200-percent-writing.png`, `actual-browser-200-percent-source.png`
- `new-document-with-settings-owning-dock.png`, `enlarged-multiline-field.png`
- `ordinary-incomplete-issues.png`, `completed-blank-note.png`, `document-rename-dialog.png`
- `320px-full-settings-and-toolbar.png`, `320px-long-source-native-scroll.png`
- `320px-invalid-source.png`, `320px-draft-confirmation.png`

The genuine save-failure original is
`temp\ui-regression-test-suite\test-results\acceptance-recovery.accept-6ad73--never-report-false-success-acceptance\save-failure-issues.png`.
It shows truthful failure/retry/recovery alongside still-editable work, unlike
the quiet ordinary-incomplete Issues state.

Native 200% uses Chromium's own `chrome://settings/appearance` zoom selector in
a clean full-Chromium persistent context. Measured DPR changes 1 → 2 and layout
viewport 1440×1000 → 720×500. This is not CSS zoom or only a resized viewport.
The same probe writes through the actual native answer, switches to source,
uses preview/back, and observes restored source focus. A separate narrow probe
sets both reading preferences Large and still measures 14px source.

## Limits and remaining defects

The fresh final complete regression passed after all editorial and review-driven
source corrections. No remaining reproduced functional/editorial defect is known
within the executed scope.

Chromium is the executed browser scope. No new Firefox/Safari acceptance run,
physical software-keyboard or full OS IME certification, manual screen-reader
certification, every-device guarantee or full WCAG-conformance claim is made.
Axe, focus, native editing, selected contrast classes and measured reflow are
specific evidence, not comprehensive accessibility certification. Native zoom
was tested in the named Chromium version, not every browser.

Deliberately overlapping floating panels remain user-controlled; public
raise/collapse actions are legitimate navigation, not a guarantee of
simultaneous visibility. Full-page screenshots do not stitch independently
scrolling panel bodies. Hidden/page-close saving remains best effort rather
than crash durability. Recovery JSON has no automatic-import workflow.
Migration requirements are not applicable under the development-mode directive.
