2026-04-12 

A00 Purpose

This is a new change request for the next stage of the DOM test suite. The earlier change introduced Happy DOM and basic DOM-oriented coverage. This change is specifically about extending that suite with strongly data-driven test runners. The goal is to move from "some DOM tests exist" to "broad, diverse, table-defined DOM scenarios exist, and they can expose regressions that only appear in one environment or one boundary condition".

The central requirement is that the suite must be readable from the scenario tables alone. A reviewer should be able to read a row and understand the page shape, the mutation or condition being tested, the action performed, and the expected outcome without opening the implementation. The test code should execute shared runner logic against those tables, but the tables themselves are the primary documentation.

Codex should treat this as a pragmatic change request. The intent is broad confidence, not theoretical completeness. If any part of this specification is inconsistent, too expensive, or technically awkward under Happy DOM, Codex should use its best judgment to resolve the inconsistency, fill in gaps, and land the best working subset that preserves the spirit of the request.

B00 Core direction for Codex

Codex should not create one giant generic matrix and call it done. The suite should be organized into multiple goal-specific data-driven runners. Each runner should have its own fixture assumptions, action contract, and expected-result schema. This keeps rows short, readable, and semantically meaningful.

Codex should also avoid copy-pasting long descriptions into many rows. Shared behavior belongs in the runner description and fixture description. Each row should document only what is unique about that scenario. The description should still be strong enough to stand alone, but it should not repeat the same base fixture explanation 20 times.

The preferred outcome is a small number of reusable fixture families, a small number of reusable runner functions, and a large number of curated scenario rows. The runner code should be stable. The scenario tables should be easy to extend.

C00 What "data-driven" means in this suite

In this suite, a data-driven test means the following.

The test runner uses one piece of execution code for a family of cases.

Each case row is declarative. It should define the fixture family, the important mutations, the operation to run, and the expected result.

The row should have a human-readable title and a human-readable description.

The row should not hide important logic inside custom callbacks unless absolutely necessary. The more the row is plain data, the more useful it becomes as living documentation.

The suite should support both exact expectations and partial expectations. For example, some selector tests can assert an exact preferred selector string, while others should assert a family of acceptable outputs such as "must use a stable authored attribute" or "must not use generated class tokens".

D00 Diversity strategy

The suite must not repeatedly test the same logic on one environment only. It needs enough environmental diversity that a code change can pass in one setup and fail in another. That is the entire point of this extension.

The diversity should be intentional, not random. Use equivalence classes to cover the major semantic categories. Use boundary testing to hit the edges where scoring or classification changes. Use pairwise thinking to choose combinations across important dimensions without exploding into an unmaintainable full Cartesian product.

The important dimensions in this codebase are naming source, visibility, disabled state, stable attribute presence, generated-token noise, ancestor strength, repeated-child count, scrollability, region type, control type, selector scope, and overlay state.

Codex should design the matrix with pairwise coverage in mind, but should commit explicit curated rows to the repository. Do not generate unreadable machine-computed combinations at runtime. The rows must stay reviewable.

E00 Required runner architecture

The suite should be split into separate runners rather than one mega runner. The recommended structure is six runners.

The first runner is feature extraction scenarios. It verifies how real DOM elements produce feature objects.

The second runner is scanner discovery scenarios. It verifies which nodes are eligible, promoted, rejected, or deduplicated.

The third runner is heuristic classification scenarios. It verifies kind, inferred type, discovery heuristic signals, and naming.

The fourth runner is selector scenarios. It verifies selector candidate generation, preferred selector choice, scope behavior, validation, and manual override behavior.

The fifth runner is area and region scenarios. It verifies selection overlap, repeated-collection detection, ranking, and parent-child assignment.

The sixth runner is overlay interaction scenarios. It verifies UI state transitions and result rendering in a controlled, table-defined way, without trying to simulate a full browser.

Each runner should accept a scenario table that is specific to that runner. Do not force one universal case schema across all runners if that reduces clarity.

F00 Scenario row design

Each row should include a stable id, a short title, a concise but explicit description, a fixture family name, a mutation block, an operation identifier, and an expected block. The exact field names are adjustable, but the overall shape should remain close to this.

```js
{
  id: "SEL03",
  title: "Chat send button prefers data-testid over generated classes",
  description: "Chat composer uses textarea input, send button has data-testid, and surrounding nodes use noisy generated classes. Selector generation should pick the authored attribute and ignore unstable class tokens.",
  fixture: "chat",
  mutate: {
    composerControl: "textarea",
    sendButtonSignal: "data-testid",
    noiseProfile: "generated-classes"
  },
  act: "buildSelectorState:sendButton",
  expect: {
    preferredSelector: '[data-testid="send-button"]',
    preferredSelectorType: "css",
    matchCount: 1,
    disallowSelectorContains: ["css-", "jsx-", "sc-"]
  }
}
```

The description field is mandatory. The title is mandatory. The expected block should support exact values and soft assertions. The operation identifier should map to a runner-defined action so that rows remain declarative.

G00 Fixture families and environments

The suite should not maintain dozens of unrelated page builders. It should maintain a small number of strong fixture families with mutation inputs.

The "chat" family should remain the most important. It should support sidebar on or off, transcript on or off, scrollable transcript, repeated message cards, conversation rows, textarea versus contenteditable composer, stable attributes on buttons, aria labels, placeholder text, timestamps, disabled actions, and noise injection.

The "form" family should support label-for wiring, aria-labelledby, placeholder-only inputs, title-only inputs, named controls, select-like controls, file input, hidden controls, disabled controls, and grouped action rows.

The "shell" family should support header, nav, main, aside, footer, toolbar, content cards, repeated links, and mixed landmark roles.

The "dialog" family should support role=dialog, title, close button, primary action, secondary action, body content, and background noise outside the modal.

The "collection" family should support repeated cards, repeated rows, repeated message items, repeated navigation links, and table-like rows.

The "noise" family should support decorative spans, aria-hidden icons, generated class names, small zero-area nodes, ignored overlay nodes, disabled controls, and one or two meaningful controls buried inside.

Codex should decide whether to implement these as pure builder functions, HTML templates plus mutation passes, or a hybrid. The change request does not require one specific implementation pattern. It requires readable, stable, diverse environments.

H00 Shared test environment rules

All data-driven DOM tests should run on a reset DOM. No row may depend on leakage from another row. Geometry-sensitive tests should use explicit `getBoundingClientRect()` stubs rather than relying on layout. Scrollability-sensitive tests should set `scrollHeight`, `clientHeight`, `scrollWidth`, and `clientWidth` directly. Visibility-sensitive tests should set `computedStyle` explicitly when needed.

The fixture builders should make common mutations easy to read. For example, `noiseProfile: "generated-classes"` should inject generated-looking ids and classes across the page without each row needing to describe the exact class strings. Similarly, `visibility: "hidden"` or `repeatCount: 3` should be enough to express the scenario.

I00 Coverage selection method

The first pass should target 30 data-driven rows across the six runners defined above. That is enough to establish the pattern and cover the highest-value equivalence classes and boundaries. After those 30 are stable, the suite can expand further.

The rows should be chosen using three filters. First, each row should cover a meaningfully different semantic class. Second, the set of rows should create pairwise diversity across the important dimensions. Third, at least some rows in each runner should be explicit boundary cases where one threshold or one fallback decision becomes important.

The test suite should not try to enumerate every permutation. It should choose rows that are high value and easy to understand.

J00 Runner 1: feature extraction data-driven scenarios

This runner should operate on real DOM elements and verify `extractElementFeatures`, `computeAccessibleName`, `isElementVisible`, `isElementDisabled`, `isScrollableElement`, and `getMeaningfulAncestor` behavior. The runner should produce a compact assertion summary from the feature object and compare it to the row expectation.

Common runner assumption: unless a row overrides it, the base element is visible, enabled, has a non-zero rect, and lives in a normal DOM tree.

| Case ID | Title                                             | Description                                                                                                                                                                       | Fixture | Mutation or setup                                       | Operation                               | Expected result                                                                                            |
| ------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FE01    | Textarea uses aria-label as accessible name       | Chat composer uses a textarea with aria-label and placeholder. The feature extractor should prefer the authored aria-label over placeholder and inner text.                       | chat    | composerControl=textarea, composerNameSource=aria-label | extractFeatures:composer                | accessibleName="Message input", tagName="textarea", contentEditable=false                                  |
| FE02    | Input falls back to associated label              | Form page uses a label with for=id and the input has no aria-label. The extractor should derive the accessible name from the associated label text.                               | form    | inputNameSource=label-for, placeholder=""               | extractFeatures:primaryInput            | accessibleName="Email address", isNativeInteractable=true                                                  |
| FE03    | Placeholder is used when no stronger label exists | Form page has an input with placeholder only and no label, no title, and no aria-label. This covers the placeholder fallback equivalence class.                                   | form    | inputNameSource=placeholder-only                        | extractFeatures:primaryInput            | accessibleName="Search docs", placeholder="Search docs"                                                    |
| FE04    | Hidden element is not visible                     | Noise page includes a meaningful-looking button that is visually hidden by computedStyle visibility hidden. This must be treated as not visible even though it has text and role. | noise   | targetVisibility=hidden-style                           | extractFeatures:hiddenButton            | visible=false                                                                                              |
| FE05    | Scrollable transcript is detected from dimensions | Chat page includes a transcript container with repeated messages and scrollHeight greater than clientHeight. This should be classified as scrollable even without browser layout. | chat    | transcriptScrollable=true, repeatCount=8                | extractFeatures:transcript              | scrollable=true, repeatedChildTagNames contains "article" or "div" depending on fixture                    |
| FE06    | Strong parent becomes meaningful ancestor         | A weak child element sits inside a richer parent region with editing and action signals. Ancestor promotion should prefer the meaningful parent over the weak leaf.               | chat    | selectWeakChildInsideComposer=true                      | getMeaningfulAncestor:weakComposerChild | ancestorTagName in ["form", "section", "div"], ancestorContainsButtons=true, ancestorContainsEditable=true |

K00 Runner 2: scanner discovery data-driven scenarios

This runner should build a page, call `scanDocument`, and compare a compact discovery summary. The summary should include discovered ids or semantic aliases, counts by kind where helpful, and presence or absence of specific meaningful nodes.

Common runner assumption: unless overridden, all meaningful nodes are visible and enabled.

| Case ID | Title                                                     | Description                                                                                                                                                                                                 | Fixture | Mutation or setup                                      | Operation    | Expected result                                                               |
| ------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------- |
| SC01    | Scanner finds major chat controls and regions             | A normal chat page contains sidebar, transcript, composer textarea, send button, and attach button. Scanner should discover meaningful automation candidates rather than a flood of decorative descendants. | chat    | sidebar=true, transcript=true, composer=true           | scanDocument | includesMeaningful=["composer","sendButton","transcript"], excludesNoise=true |
| SC02    | Scanner skips ignored subtree                             | Noise page contains a valid button inside a subtree marked with the tool ignore attribute. That button should not appear in scan results.                                                                   | noise   | ignoredSubtreeContainsButton=true                      | scanDocument | excludesMeaningful=["ignoredButton"]                                          |
| SC03    | Scanner skips decorative aria-hidden nodes                | Noise page contains decorative aria-hidden icons with no text and no interactive semantics near meaningful controls. Decorative nodes should be filtered out.                                               | noise   | decorativeIcons=true                                   | scanDocument | excludesDecorative=true, stillIncludesMeaningful=["mainAction"]               |
| SC04    | Scanner rejects disabled controls                         | Form page contains a disabled submit button and an enabled cancel button. Scanner should not include the disabled action.                                                                                   | form    | submitDisabled=true, cancelEnabled=true                | scanDocument | excludesMeaningful=["submitButton"], includesMeaningful=["cancelButton"]      |
| SC05    | Scanner deduplicates descendants promoted to one ancestor | Chat page contains several nested descendants inside the composer. Ancestor promotion should not produce duplicate records for many children that map to the same meaningful container.                     | chat    | denseComposerDescendants=true                          | scanDocument | uniqueMeaningfulAncestorCountForComposer=1                                    |
| SC06    | Scanner still finds signal in a noisy shell               | Shell page contains many generated classes, decorative nodes, and content cards, but still has a nav cluster and a toolbar. Scanner should preserve meaningful signal in clutter.                           | shell   | noiseProfile=generated-classes, toolbar=true, nav=true | scanDocument | includesMeaningful=["navigation","toolbar"], excludesMostlyDecorative=true    |

L00 Runner 3: heuristic classification data-driven scenarios

This runner should convert real scanned records or extracted features into object models and verify `kind`, `inferredType`, confidence band, and selected discovery heuristic signals where useful.

Common runner assumption: confidence should usually be asserted as a band or minimum, not as an exact floating-point value, unless the row is specifically about a threshold.

| Case ID | Title                                                          | Description                                                                                                                                                        | Fixture | Mutation or setup                                                | Operation                               | Expected result                                                               |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| HE01    | Composer region classified from editable plus actions          | Chat page contains a composer container with an editable target and nearby send and attach actions. This is the canonical composer region case.                    | chat    | composerControl=textarea, attachButton=true, sendButton=true     | createObjectModel:composerRegion        | kind="region", inferredType="composer", confidenceMin=0.7                     |
| HE02    | Transcript region classified from scrollable repeated messages | Chat page contains repeated message items inside a scrollable container. The classifier should choose a transcript-like region rather than generic content.        | chat    | transcriptScrollable=true, repeatCount=6, timestampMessages=true | createObjectModel:transcript            | kind="region", inferredType="transcript"                                      |
| HE03    | Conversation rows become collection                            | Sidebar contains repeated conversation row elements that are visually similar and represent a repeated unit. The classifier should recognize collection semantics. | chat    | sidebar=true, conversationRowCount=5                             | createObjectModel:conversationRowsGroup | kind="collection", inferredType in ["conversationRows","genericRepeatedList"] |
| HE04    | Link-only navigation is recognized as navigation region        | Shell page uses a nav landmark with repeated links and no editing controls. The classifier should recognize a navigation-like region rather than a generic panel.  | shell   | nav=true, repeatedLinks=6                                        | createObjectModel:navigationRegion      | kind="region", inferredType="navigation"                                      |
| HE05    | Status text becomes content, not control                       | Dialog page includes a static status message that mentions sent or failed, but it is not interactive. It should be classified as content.                          | dialog  | includeStatusText=true                                           | createObjectModel:statusNode            | kind="content", inferredType="statusText"                                     |
| HE06    | Menu-like button becomes control with menu semantics           | Shell toolbar includes a button with text "More" and no stable attributes. It should still classify as a control and infer menu trigger behavior.                  | shell   | toolbar=true, moreButtonText="More"                              | createObjectModel:moreButton            | kind="control", inferredType="menuTrigger"                                    |

M00 Runner 4: selector data-driven scenarios

This runner should take a selected object or an element-derived object model, run `buildSelectorState`, and verify preferred selector behavior, selector type, match count, and ranking constraints. This is one of the most important data-driven runners because it exposes fallback behavior that can vary across environments.

Common runner assumption: unless overridden, the target element exists exactly once and the fixture builder has stable ids for semantic aliases.

| Case ID | Title                                                | Description                                                                                                                                                              | Fixture    | Mutation or setup                                            | Operation                               | Expected result                                                                                                                             |
| ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| SEL01   | data-testid wins over noisy classes                  | Chat send button has data-testid and surrounding nodes use generated-looking classes. Preferred selector should use the authored test attribute.                         | chat       | sendButtonSignal=data-testid, noiseProfile=generated-classes | buildSelectorState:sendButton           | preferredSelector='[data-testid="send-button"]', preferredSelectorType="css", matchCount=1                                                  |
| SEL02   | Meaningful id is accepted when stable                | Form submit button has a stable semantic id and no test attribute. Selector generation should accept the id because it is human-authored and not generated.              | form       | submitSignal=stable-id                                       | buildSelectorState:submitButton         | preferredSelectorStartsWith="#", disallowGeneratedToken=true                                                                                |
| SEL03   | Generated id is rejected in favor of better fallback | Toolbar action has a generated-looking id but also has aria-label. The selector should avoid the unstable id and use a more resilient signal.                            | shell      | actionSignal=generated-id-plus-aria-label                    | buildSelectorState:toolbarAction        | preferredSelectorContains='[aria-label="Open settings"]' or equivalent stable fallback, disallowSelectorContains=["#css", "#jsx", "#react"] |
| SEL04   | Parent-scoped child selector is used inside a region | Chat send button lives inside a recognized composer region. The selector state should prefer a parent-relative semantic child selector when parent scoping is available. | chat       | sendButtonSignal=text-only, parentRegionRecognized=true      | buildSelectorState:sendButtonWithParent | scope="parent", preferredHeuristic in ["regionScopedSemantic","parentChildRelative"]                                                        |
| SEL05   | Collection selector matches repeated items           | Repeated message cards have no stable ids but share a repeated authored structure. Collection selector generation should return a selector that matches multiple items.  | collection | itemCount=5, itemStableClass=true                            | buildSelectorState:messageCollection    | preferredSelectorType="css", matchCount=5 or expectedRepeatedCount                                                                          |
| SEL06   | Manual selector overrides automatic ranking          | User-edited selector is supplied for a known control. Manual mode should become preferred even if an automatic stable selector also exists.                              | chat       | manualSelector='button[aria-label="Send"]'                   | buildSelectorState:sendButtonManual     | preferredHeuristic="manualSelector", preferredSelector='button[aria-label="Send"]'                                                          |

N00 Runner 5: area and region data-driven scenarios

This runner should create a set of records from a page with explicit rectangles, call `analyzeAreaSelection`, and verify the selected result set, ranking, collection detection, and parent assignment. The rows should define the selection rectangle declaratively.

Common runner assumption: all relevant elements have explicit non-overlapping or intentionally overlapping rects so the result is deterministic.

| Case ID | Title                                                       | Description                                                                                                                                                                             | Fixture    | Mutation or setup                          | Operation            | Expected result                                                         |
| ------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------ | -------------------- | ----------------------------------------------------------------------- |
| RG01    | Selection over composer returns region plus child controls  | The selection rectangle fully covers the composer area, including input and action buttons. Results should include the region and relevant child controls with parent assignment.       | chat       | selectRect=composerBounds                  | analyzeAreaSelection | includesKinds=["region","control"], parentAssignedToChildControls=true  |
| RG02    | Selection over transcript detects repeated collection       | The selection rectangle covers a repeated message area with at least three similar items. The analysis should surface a collection candidate rather than only isolated leaves.          | chat       | selectRect=transcriptBounds, repeatCount=6 | analyzeAreaSelection | includesKind="collection", collectionSampleCountMin=3                   |
| RG03    | Partial overlap favors strong region over weak edge content | The selection rectangle clips the edge of a region and fully covers small content leaves. Ranking should still favor the stronger region candidate when overlap and score are combined. | shell      | partialRegionOverlap=true                  | analyzeAreaSelection | topResultKind="region"                                                  |
| RG04    | Nested regions assign nearest reasonable parent             | Dialog page contains a modal region with a nested footer action area. Area analysis should assign child controls to the closest containing region rather than the page root.            | dialog     | selectRect=modalBoundsWithFooter           | analyzeAreaSelection | childControlsParent="modal" or nearestNestedRegion=true                 |
| RG05    | Crowded selection is capped to top ranked results           | A noisy page has more than eight overlapping records inside the selection area. The analysis should return only the top ranked subset and keep high-signal nodes.                       | noise      | overlappingCount=14                        | analyzeAreaSelection | resultCount=8, includesHighSignalNodes=true                             |
| RG06    | Similar but not identical repeated shapes do not over-merge | Collection page includes repeated cards of one type and a few structurally different promo cards nearby. Grouping should not collapse the mismatched cards into the main collection.    | collection | mixedRepeatedShapes=true                   | analyzeAreaSelection | mainCollectionDetected=true, mismatchedCardsExcludedFromCollection=true |

O00 Runner 6: overlay state and UI action data-driven scenarios

This runner should remain narrower than the others because full browser interaction fidelity is not the goal. It should still be data-driven where practical. Each row should define a start state, a sequence of UI actions or simulated events, and the expected stable UI outcome.

Common runner assumption: Happy DOM is used for structure and event dispatch, not for true rendering. Geometry and hit testing should be stubbed if needed. Codex should not make this runner brittle.

| Case ID | Title                                              | Description                                                                                                                                                   | Fixture | Mutation or setup                                       | Operation                | Expected result                                                                   |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| OV01    | Mount creates recorder shell and overlays          | Overlay mounts on a simple page and should create the host, shadow root, window shell, and page overlay nodes.                                                | shell   | minimalPage=true                                        | mountOverlay             | hostExists=true, shadowRootExists=true, windowExists=true, overlayNodesExist=true |
| OV02    | Scan action refreshes selected candidate inventory | Overlay mounts on a chat page, then the scan button is pressed. The navigator list should reflect meaningful scanned candidates.                              | chat    | sidebar=true, transcript=true, composer=true            | mountAndClick:scan       | selectedListNotEmpty=true, statusMentionsScan=true                                |
| OV03    | Mode switch to area clears hover mode behavior     | Overlay starts in inspect mode and then switches to area mode through the toolbar. Stable UI state should show area mode and drop inspect hover expectations. | shell   | minimalPage=true                                        | mountAndClick:selectArea | mode="area", statusMentionsArea=true                                              |
| OV04    | Clear action empties selected objects              | Overlay starts with selected objects already added through a controlled setup path. Clear should remove them and reset export preview visibility.             | chat    | preselectObjects=["composer","sendButton"]              | mountAndClick:clear      | selectedCount=0, exportPreviewHidden=true                                         |
| OV05    | Show JSON reveals serialized export preview        | Overlay starts with a few selected objects and the user toggles JSON preview. The preview textarea should become visible and contain serialized content.      | chat    | preselectObjects=["composer","sendButton","transcript"] | mountAndClick:showJson   | exportPreviewVisible=true, exportTextContains=["objects","selector","kind"]       |
| OV06    | Copy JSON uses clipboard and updates status        | Overlay starts with selected objects and clipboard is stubbed. Copy JSON should call clipboard writeText and show a success-oriented status message.          | chat    | preselectObjects=["composer"], clipboardStub=true       | mountAndClick:copyJson   | clipboardCalled=true, statusMentionsCopy=true                                     |

P00 Additional pairwise and boundary guidance

The 30 rows above are the initial committed matrix. Codex should use them as the seed set, not the final ceiling. When expanding later, use pairwise reasoning across the following axes.

For feature extraction, the main axes are naming source, visibility mode, disabled mode, and geometry mode.

For scanner, the main axes are meaningful signal density, ignore attribute presence, disabled or hidden status, and ancestor-promotion pressure.

For heuristics, the main axes are repeated-child count, scrollability, landmark role, editing signal, action-word signal, and content density.

For selectors, the main axes are stable attribute type, generated-token noise, parent scope availability, exact match count, and manual override presence.

For region analysis, the main axes are overlap ratio, containment depth, repeated-group similarity, and crowding level.

For overlay, the main axes are start state, action sequence, and presence or absence of selected objects.

Boundary cases should always be explicitly represented. For example, repeated count at 2 versus 3, just-below-scrollable versus just-above-scrollable, one exact selector match versus multiple matches, and visible versus zero-area rectangles. Those edges are where regressions often hide.

Q00 How to keep the rows readable

Each row description should be one compact paragraph. It should mention the semantic page shape, the condition under test, and the expected behavior. It should not explain every builder default. The builder defaults belong in fixture documentation.

Titles should be meaningful. Use names such as "Generated id is rejected in favor of better fallback", not generic titles such as "Case 4" or "Selector test B". The title should tell a reviewer why the row exists.

The runner should also print the row id and title into the test name so failures are obvious. A failure output such as `SEL03 Generated id is rejected in favor of better fallback` is much more useful than `selector matrix row 3`.

R00 Implementation guidance for the row format

Codex should prefer a compact row schema that is mostly serializable data. For example, use enums and small mutation objects rather than embedding page-builder closures into every row. The runner should interpret the mutation object and call fixture helpers consistently.

That said, do not be dogmatic. If one or two rows need a custom callback because they represent an otherwise hard-to-express edge case, that is acceptable. The priority is still clarity and maintainability.

The `expect` block should support both exact assertions and predicate-style assertions. For example, exact fields can be `preferredSelector`, `kind`, or `matchCount`. Predicate fields can be `confidenceMin`, `disallowSelectorContains`, `includesMeaningful`, or `statusMentionsCopy`.

S00 Recommended code organization

The test code should be organized so that each runner has three things nearby: the runner implementation, the scenario table, and the fixture family helpers it depends on. Do not scatter one runner's logic across many files unless that improves reuse.

A good pattern is to keep fixture families in a shared folder, keep each runner in its own file, and keep the scenario table either in the same file or in a sibling data file if the table is large. The exact layout is flexible.

The important structural rule is this: a reviewer must be able to open a runner and quickly find the fixture assumptions, the table, and the assertion mapping.

T00 What Codex should not do

Codex should not convert this into a giant copy-pasted suite of imperative tests. The whole purpose is to move toward grouped scenario tables.

Codex should not make the rows so abstract that they stop being human-readable. A row full of opaque flags with no title and no description defeats the purpose.

Codex should not overfit expectations to incidental implementation details. For example, do not assert exact confidence decimals unless the row is explicitly about that threshold. Do not assert the full explanation string when a few essential substrings are enough.

Codex should not chase perfect browser fidelity in overlay scenarios. If a case becomes flaky because of hit-testing or rendering behavior under Happy DOM, narrow it to a stable structural contract.

U00 Acceptance criteria

This change should be considered complete when the suite contains at least the six goal-specific runners defined above, the initial 30 scenario rows or a technically justified near-equivalent subset, and strong fixture documentation so that the rows are readable without decoding builder internals.

It should also be complete only when a reviewer can read the scenario tables and understand what is covered, what environment each row uses, and what behavior is expected. The tables are part of the deliverable, not just an implementation detail.

If Codex finds that one or two proposed rows are incoherent or not technically viable, Codex should replace them with rows of equivalent coverage and document the substitution in the change summary.

V00 Final instruction to Codex

Use your best judgment. Resolve inconsistencies locally. Fill gaps where the specification is under-detailed. Keep the suite data-driven, grouped, and diverse. Prefer broad behavioral confidence over maximal theoretical scope. When forced to choose, choose the implementation that leaves behind the clearest scenario tables, the strongest regression signal, and the least brittle maintenance burden.

W00 First-pass implementation status (executed)

Implemented six goal-specific data-driven runners with declarative rows and shared fixture families. The implemented matrix currently contains 37 rows:

- Feature runner: 6 rows (`FE01..FE06`)
- Scanner runner: 6 rows (`SC01..SC06`)
- Heuristic runner: 6 rows (`HE01..HE06`)
- Selector runner: 6 rows (`SEL01..SEL06`)
- Region runner: 6 rows (`RG01..RG06`)
- Overlay runner: 7 rows (`OV01..OV07`)

The extra overlay row (`OV07`) was intentionally added to cover the prior heuristic-dropdown regression from earlier suggestions.

X00 Second-pass reconciliation across `suggestions001..009.md`

After implementing the `suggestions010` matrix, all prior specs were reviewed for incremental requirements and conflicts. The following additional high-value coverage was included because earlier suggestions made them explicit and they were not fully protected by previous tests:

1. Manual selector override durability even when manual selector text duplicates an automatic candidate.
2. Area-selection rectangle visibility lifecycle (visible while dragging, hidden on pointer up).
3. Heuristic popover close behavior on Escape while keeping selector controls accessible.
4. Nested region parent assignment under area analysis for region-first modeling behavior.
5. Scanner filtering guarantees for ignored subtree, decorative aria-hidden nodes, disabled nodes, and noisy DOM shells.

Y00 Technical substitutions and conflict resolution

A few rows from the prose spec were interpreted with stable contracts rather than brittle UI assumptions:

- Overlay "scan refreshes selected list" language was treated as a status/state contract, because scan updates candidate inventory but does not auto-select objects.
- Nested dialog parenting scenarios required preserving nested landmark identity during ancestor promotion; implementation was adjusted so landmark strength is considered for both current and parent nodes.
- Manual selector precedence required preserving manual heuristic candidates even when selector text collides with an automatic candidate; selector dedupe key now includes heuristic id.

Z00 Deliberate omissions to keep suite healthy

The suite intentionally avoids low-value or brittle assertions such as:

- Pixel-accurate rendering/layout assertions in Happy DOM.
- Deep CSS visual-style snapshots for theme appearance.
- Exhaustive Cartesian mutation combinations.

Coverage focuses on behaviorally distinct, regression-prone contracts with readable scenario rows and reusable runner logic.
