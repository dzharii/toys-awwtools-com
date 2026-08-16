2026-08-16

# 2026-08-16.GOLF.A-00

## A-00. Purpose, motivation, and implementation standard

DIRECTIVE: Treat this document as the implementation and quality-assurance contract for the complete project. Use it together with ALPHA through FOXTROT. Do not treat it as optional project notes. Before declaring any implementation task complete, use the relevant acceptance criteria in this document to verify the result.

DIRECTIVE: Understand the product before writing substantial implementation code. Read the specifications in order, inspect the repository, inspect the supplied visual references, understand the generated-file model, and understand both primary user workflows. Do not begin by translating isolated requirement sentences directly into code without understanding how those requirements contribute to the finished product.

The project intentionally uses simple technology to create a surprisingly complete product. A local authoring command converts an ordinary public URL into a persistent repository record containing a short URL, deterministic metadata, and a recognizable screenshot. Git and GitHub Pages provide persistence and publication. The browser turns those records into a visually rich journal without requiring a server, database, account system, or remote processing service.

The value of the project comes from the combination of these properties rather than from any one feature.

The authoring workflow should be exceptionally easy to use. The user supplies a URL. The software performs the mechanical work, validates its result, and either creates a complete link record or explains precisely why it could not.

The resulting short URL should be useful outside the journal. It should expose a meaningful social preview that helps the user recognize the destination when the link is pasted into a chat or another application.

The journal should turn a collection of otherwise forgettable URLs into a visual memory aid. The user should be able to recognize saved material from the screenshot, title, source, and date, browse it chronologically, and interact with it through a deliberately tactile journal presentation.

The implementation should remain technically modest while the finished experience feels deliberate, polished, and elegant.

DIRECTIVE: Optimize for the finished user experience rather than architectural sophistication. Prefer the smallest dependable implementation that fulfills the specifications completely. A simple solution that is reliable, understandable, fast, and visually refined is better than a generalized architecture built for hypothetical future requirements.

DIRECTIVE: Treat quality as including functional correctness, visual correctness, interaction correctness, diagnostic quality, performance, boundary behavior, and maintainability. Passing automated tests is necessary where tests are appropriate, but it is not by itself evidence that this project is finished.

DIRECTIVE: Remember the core product goal throughout implementation: create low-technology software that is simple to operate, convenient to browse, visually elegant, reliable in ordinary and boundary conditions, and pleasant enough that its simplicity feels intentional rather than primitive.

## B-00. Judgment, reasoning, and specification interpretation

DIRECTIVE: Use your best engineering judgment. The specifications are intentionally explicit, but implementation still requires reasoning about browser behavior, filesystem behavior, visual geometry, asynchronous state, and boundary conditions. Do not mechanically implement an interpretation that is obviously inconsistent with the overall product goal.

DIRECTIVE: When a requirement appears ambiguous, first resolve it from the complete specification set, existing repository conventions, surrounding requirements, user scenarios, and the stated product motivation. Prefer the interpretation that preserves simplicity, correctness, and user value.

DIRECTIVE: When two requirements appear to conflict, investigate the conflict rather than silently choosing one. Determine whether a later specification clarifies an earlier requirement. Prefer the interpretation that preserves explicit invariants and the product's primary user workflows.

DIRECTIVE: You may make a small implementation-level correction when literal compliance would clearly undermine the product's stated goal, but do so deliberately. Verify that the change does not break another specification, keep the correction minimal, and record the reasoning in the implementation summary when it is materially different from the written specification.

DIRECTIVE: Do not use "best judgment" as permission to redesign the product. Do not introduce additional product features, speculative extensibility, architectural layers, controls, workflows, dependencies, or configuration merely because they might be useful.

DIRECTIVE: Rubber-duck important implementation decisions before committing to them. Explain the problem to yourself in concrete terms: what the user is doing, what state exists before the operation, what must be true afterward, which invariants can fail, and how the result will be verified.

DIRECTIVE: For nontrivial logic, explicitly challenge your first solution. Ask what happens with invalid input, missing files, network timeouts, duplicate records, stale cache, malformed HTML, incomplete images, tiny windows, long titles, rapid user input, touch input, interrupted writes, and other relevant boundaries from the specifications.

DIRECTIVE: Prefer implementations whose correctness can be inspected directly. Repository formats should be readable as files. Diagnostic output should explain state. Visual constants should be centralized. Algorithms such as screenshot selection should expose enough DEBUG information to understand their decisions.

## C-00. Work sequence and project understanding

DIRECTIVE: Before changing code, establish the scope of the requested work. Identify which specifications govern it, which existing modules it touches, which invariants must remain true, which user workflows it affects, and which validation methods will prove correctness.

DIRECTIVE: Read neighboring code before editing. Reuse established project conventions when they are sound. Do not create parallel utilities, duplicate constants, duplicate parsers, or alternative state models when an existing project mechanism already owns that concern.

DIRECTIVE: Inspect the actual repository state before relying on assumptions about filenames, directory structure, dependencies, configuration, or generated records.

DIRECTIVE: For presentation work, inspect the supplied journal reference images before implementation. The images are part of the design context. Distinguish intentional art direction from image-generation defects as required by ECHO.

DIRECTIVE: Implement in coherent increments that can be validated independently. A useful pattern is:

```text
understand requirement
-> inspect existing implementation
-> plan minimal change
-> implement
-> run focused automated validation
-> run the actual user workflow
-> inspect diagnostics
-> visually inspect when applicable
-> inspect surrounding behavior
-> correct defects
-> run broader regression validation
```

DIRECTIVE: Do not postpone all validation until the end of a large implementation. Defects become more expensive and harder to localize when multiple unverified assumptions are layered together.

## D-00. Simplicity and implementation discipline

DIRECTIVE: Keep the public application static. Do not introduce a server, runtime database, CMS, remote processing service, service worker, analytics backend, or other infrastructure unless a specification is explicitly revised to require it.

DIRECTIVE: Keep repository state understandable through direct filesystem inspection. Generated records, the manifest, metadata, and preview files should remain straightforward enough that a developer can diagnose them with ordinary file and Git tools.

DIRECTIVE: Keep dependencies minimal. A new dependency must solve a concrete requirement materially better than the platform or already required tooling. Do not add a dependency merely to avoid writing a small amount of clear project-specific code.

DIRECTIVE: Avoid generalized abstractions for requirements that have one fixed implementation in this finished project. Do not add provider systems, plugin interfaces, database adapters, configurable ID strategies, generalized animation engines, or future-oriented extension points.

DIRECTIVE: Write concise implementation code, but do not compress logic until it becomes opaque. Straightforward code with clear invariants is preferable to clever code that is difficult to verify.

DIRECTIVE: Centralize important fixed values where duplication could produce inconsistency. This includes repository constants, cache TTL, fetch timeouts, page size, preview dimensions, zoom bounds, page-turn duration, and similar project-wide values.

DIRECTIVE: Preserve separation of concerns where it materially improves correctness. The journal data layer should not own paper animation. Presentation should not parse manifest syntax independently. Capture heuristics should not mutate repository state. Diagnostic formatting should not be reinvented at every call site.

## E-00. Functional verification

DIRECTIVE: Verify behavior through the same interfaces the user will use. Do not validate a CLI workflow solely by calling an internal function. Do not validate the journal solely by inspecting JavaScript state. Run the command, load the real page, interact with it, and inspect the actual generated artifacts.

DIRECTIVE: Use automated tests for deterministic logic where they add value. Good candidates include URL validation, ID validation, manifest parsing, metadata sanitization, pagination calculations, cache expiration, error formatting, and other logic with well-defined inputs and outputs.

DIRECTIVE: Do not replace end-to-end verification with unit tests. This project depends heavily on integration between filesystem generation, browser behavior, static hosting assumptions, image generation, DOM parsing, caching, and visual presentation.

DIRECTIVE: Test both successful and failing paths. A feature is not complete merely because its primary success case works.

DIRECTIVE: Validate invariants after operations rather than assuming the sequence of writes produced a valid result. For authoring, inspect the generated record and manifest. For the journal, verify requested IDs against parsed record metadata. For interaction, verify logical page state after animation.

DIRECTIVE: When a failure is intentionally tested, verify not only that an error occurred but that the repository or browser state after the failure is correct.

## F-00. Visual quality assurance

DIRECTIVE: Treat visual inspection as mandatory engineering validation for every feature that affects rendered output, journal geometry, screenshots, loading states, errors, responsive behavior, motion, pan, zoom, or scrolling.

DIRECTIVE: Use Playwright and available browser tooling to render the actual application at representative viewport sizes and capture screenshots. Do not rely on mental interpretation of CSS.

DIRECTIVE: Analyze captured screenshots thoroughly. Inspect alignment, spacing, clipping, typography, image scaling, material treatment, shadows, binding geometry, card density, page framing, overflow, loading states, errors, and any unintended browser artifacts.

DIRECTIVE: Inspect the primary change first, then deliberately inspect the rest of the screenshot. Validation is exploratory as well as targeted. A change may satisfy its immediate requirement while introducing a defect elsewhere in the composition.

For example, when validating a new preview-border treatment, do not inspect only the preview border. Also inspect whether the change altered card dimensions, row alignment, page density, title wrapping, page margins, rendering performance, or the overall visual hierarchy.

When validating page-turn animation, inspect the turning sheet, but also inspect the resting sheet, the gutter, underlying pages, shadows, entry content, leather boundary, and resulting spread.

When validating zoom, inspect whether zoom itself works, but also inspect framing, scroll range, pan boundaries, desk visibility, text readability, interaction hint placement, and recovery from extreme camera positions.

DIRECTIVE: Compare the implementation against the supplied visual references, but do not copy reference defects. Use the references to judge atmosphere, hierarchy, proportion, density, and material language.

DIRECTIVE: Take screenshots at multiple points in an animation when motion is visually significant. Start and end states alone cannot reveal impossible intermediate geometry.

DIRECTIVE: Validate mobile presentation with mobile-sized viewports and touch-relevant behavior. Do not infer mobile correctness solely from shrinking a desktop browser.

DIRECTIVE: Validate desktop presentation at both comfortable and intentionally constrained window sizes. A layout that works only at one ideal resolution is not accepted.

DIRECTIVE: Repeat visual inspection after corrections. Do not assume that a visually motivated fix improved the composition until the new rendering has actually been inspected.

DIRECTIVE: Spend enough validation time to become confident in visual correctness. Do not skip visual verification because the implementation appears straightforward.

## G-00. Playwright and browser-based validation

DIRECTIVE: Use Playwright as the primary automation tool for browser-based project verification. Use it to exercise the journal, inspect DOM state, capture screenshots, validate responsive layouts, test loading behavior, test interaction sequences, and reproduce browser-visible failures.

DIRECTIVE: Use a real browser rendering path when validating anything that depends on CSS layout, fonts, image sizing, scroll behavior, pointer input, touch behavior, animation, DOM parsing, or browser caching.

DIRECTIVE: Capture diagnostic information when an automated browser validation fails. Preserve the relevant URL, viewport, current page or spread, interaction state, and screenshot when useful.

DIRECTIVE: Do not write browser tests that only assert implementation details while ignoring the user-visible result. Prefer observable behavior such as "Pages 3 and 4 are visible after one desktop forward navigation" over an assertion on an incidental internal variable name.

DIRECTIVE: Where pixel-perfect equality would be brittle, validate geometry and visual relationships semantically and supplement those assertions with screenshot inspection.

DIRECTIVE: Use screenshots as evidence, not merely artifacts. Review them before considering the validation complete.

## H-00. Exploratory regression review

DIRECTIVE: After the requested feature passes its focused validation, perform a broader exploratory pass over surrounding functionality.

The purpose is to discover defects that were not explicitly predicted by the implementation plan.

A change to manifest parsing may affect journal startup.

A change to card dimensions may affect page-turn geometry.

A change to zoom transforms may affect pointer hit testing.

A change to generated metadata may affect both social previews and journal parsing.

A change to error wrapping may accidentally remove stack information.

DIRECTIVE: During exploratory review, inspect at least the upstream and downstream boundaries of the changed subsystem.

DIRECTIVE: When practical, run one complete successful user workflow after a substantial cross-cutting change.

For this project, the strongest end-to-end regression path is:

```text
add URL locally
-> inspect generated record
-> inspect manifest
-> serve static project locally
-> open journal
-> find generated entry
-> inspect preview and metadata
-> open short link
-> confirm redirect behavior
```

DIRECTIVE: Also run one relevant failure scenario for the changed subsystem.

## I-00. Diagnostics and error validation

DIRECTIVE: Apply FOXTROT to every new or modified failure path. Do not leave newly written code with generic messages merely because the exact failure was not shown as an example in the specification.

DIRECTIVE: Verify errors as user experiences, not just as thrown objects. Trigger representative errors and inspect the actual terminal or journal presentation.

DIRECTIVE: Verify that user-facing errors are concise, apologetic where FOXTROT requires it, specific, non-repetitive, and actionable only when a real action is known.

DIRECTIVE: Verify that console diagnostics contain the context needed to troubleshoot the same failure: module, stage, resource, important parameters, error code, and mutation or rollback state where relevant.

DIRECTIVE: Do not use a raw object dump or `JSON.stringify()` as a substitute for formatted diagnostics. Bounded serialized context may supplement a deliberately formatted diagnostic.

DIRECTIVE: Verify that nonfatal degradation does not unnecessarily interrupt the user. Cache failure, stale fallback, or one failed preview should remain scoped according to FOXTROT.

DIRECTIVE: Inspect unexpected-error boundaries and make sure they preserve original stack traces.

## J-00. Data integrity and failure safety

DIRECTIVE: Treat repository invariants as part of correctness, not as advisory conventions.

DIRECTIVE: Never overwrite an existing short-link directory.

DIRECTIVE: Never expose a new ID in `links.txt` before its required record files are complete and validated.

DIRECTIVE: If repository mutation fails after changes begin, execute the rollback behavior defined by BRAVO and report both the primary failure and any rollback failure.

DIRECTIVE: Verify failed operations by inspecting repository state afterward. "An exception was thrown" is not proof that rollback worked.

DIRECTIVE: Treat generated HTML and external page metadata as untrusted input at every boundary described by ALPHA and BRAVO.

DIRECTIVE: Preserve URL semantics exactly as specified. Do not introduce convenient normalization that changes duplicate identity.

DIRECTIVE: Treat the manifest as authoritative for published membership and chronology.

## K-00. Boundary-case discipline

DIRECTIVE: Handle boundary cases that are inherent to the specified workflows even when they are uncommon.

Relevant examples include:

```text
empty archive
one entry
partial final page
duplicate URL
ID collision
malformed manifest
missing record
malformed record metadata
missing preview
network timeout
HTTP 404
stale cache
localStorage unavailable
very long title
empty sanitized title
empty sanitized description
unsupported Unicode content
slow page
infinite-scroll page
large DOM
login wall
CAPTCHA or anti-bot challenge
no valid screenshot region
JPEG conversion failure
concurrent authoring invocation
manifest update failure
rollback failure
small desktop window
mobile portrait viewport
orientation change
rapid page-navigation input
pan beginning over a link
zoom at minimum and maximum bounds
reduced-motion preference
```

DIRECTIVE: Do not invent pathological requirements unrelated to the real product. Boundary testing should protect actual project invariants and user workflows rather than become an exercise in theoretical completeness.

## L-00. Performance and responsiveness

DIRECTIVE: Validate performance where the specification provides explicit limits or where user experience depends on responsiveness.

DIRECTIVE: Confirm that journal startup does not fetch the complete archive.

DIRECTIVE: Confirm that record-request concurrency remains bounded.

DIRECTIVE: Confirm that repeated page navigation uses memory or persistent cache where appropriate.

DIRECTIVE: Confirm that screenshot generation does not use unbounded full-page captures.

DIRECTIVE: Confirm that extremely long pages do not produce work proportional to the complete document length beyond the bounded CHARLIE search.

DIRECTIVE: Inspect page-turn, pan, and zoom motion for persistent jank. If an elaborate effect performs poorly, simplify the effect rather than adding disproportionate rendering infrastructure.

DIRECTIVE: Use available browser performance information when a visual interaction appears slow. Do not optimize blindly.

## M-00. Final implementation review

DIRECTIVE: Before declaring the project complete, perform a deliberate final review against every specification from ALPHA through GOLF.

DIRECTIVE: Do not treat previous incremental validation as a substitute for final integration review. Incremental validation proves pieces; final review proves the assembled product.

DIRECTIVE: Inspect the Git diff or equivalent changed-file set. Confirm that the implementation contains no accidental generated debug artifacts, temporary screenshots, temporary records, unused experiments, duplicate assets, or unrelated changes.

DIRECTIVE: Remove development-only instrumentation that is no longer needed, but preserve the intentional DEBUG diagnostics required by the specifications.

DIRECTIVE: Confirm that no implementation shortcut weakened the project's low-tech architecture.

DIRECTIVE: Confirm that all visual-reference images remain reference material rather than copied application screens.

DIRECTIVE: Confirm that the finished user workflows feel coherent. The user should not encounter an implementation detail that requires understanding the architecture to operate the tool.

## N-00. Project acceptance checklist

DIRECTIVE: Use the following checklist as the final project to-do and validation outline. Do not mark an item complete until its stated validation has been performed.

### 1. Repository model

* [ ] REQUIREMENT: Implement the ALPHA repository layout with root `links.txt` and one `lnk/<id>/` directory per saved target.
  ACCEPTANCE: Inspect a generated repository and confirm that a complete record contains only the required generated files and follows the specified path structure.
  VALIDATION: Create at least two records and inspect the filesystem directly.

* [ ] REQUIREMENT: Generate exactly 8-character case-sensitive IDs from the specified 62-character alphabet using secure randomness.
  ACCEPTANCE: IDs match the format, collision checks occur before commit, and existing directories are never overwritten.
  VALIDATION: Test ID validation separately and simulate an existing candidate directory to verify collision handling.

* [ ] REQUIREMENT: Preserve the serialized original HTTP or HTTPS target without semantic canonicalization.
  ACCEPTANCE: Query order, fragment, and other specified URL components survive record generation.
  VALIDATION: Add representative URLs containing query parameters and fragments and inspect `lnk:target`.

* [ ] REQUIREMENT: Prevent duplicate serialized targets.
  ACCEPTANCE: Adding an existing target produces the FOXTROT-compliant duplicate error and modifies no files.
  VALIDATION: Add a URL successfully, record repository state, add the same URL again, and compare state afterward.

* [ ] REQUIREMENT: Maintain `links.txt` newest first with every published record represented exactly once.
  ACCEPTANCE: Newly added IDs appear at the beginning without changing relative order of existing IDs.
  VALIDATION: Add several links sequentially and inspect manifest order.

### 2. Generated short-link record

* [ ] REQUIREMENT: Generate `index.html` containing all ALPHA project metadata and required Open Graph metadata.
  ACCEPTANCE: Metadata exists in initial static HTML and can be parsed without executing JavaScript.
  VALIDATION: Open the generated file as text and parse it through the same DOM-based mechanism used by the journal.

* [ ] REQUIREMENT: Generate a real `preview.jpg` JPEG at approximately 90% quality.
  ACCEPTANCE: The file decodes as JPEG, is exactly 1200 x 630 pixels, is non-empty, and no final PNG copy remains.
  VALIDATION: Inspect image metadata programmatically and visually inspect the JPEG.

* [ ] REQUIREMENT: Implement static client-side redirect behavior with metadata remaining available to crawlers.
  ACCEPTANCE: Opening the short URL in a browser navigates to the stored target, while the initial HTML independently contains the metadata.
  VALIDATION: Serve the repository locally and exercise the generated short-link route in Playwright.

* [ ] REQUIREMENT: Escape every generated HTML value correctly.
  ACCEPTANCE: Titles and descriptions containing allowed quotation or punctuation characters cannot alter generated markup.
  VALIDATION: Generate a record from controlled metadata containing relevant boundary characters and parse the resulting HTML.

### 3. Metadata sanitization

* [ ] REQUIREMENT: Apply the ALPHA/BRAVO allowed-script and punctuation rules consistently to externally sourced title and description text.
  ACCEPTANCE: Latin, Cyrillic, Han, Hiragana, and Katakana content survives as specified while emoji, unsupported scripts, disallowed punctuation, symbols, digits, and formatting characters do not.
  VALIDATION: Run a deterministic sanitizer test matrix covering allowed and disallowed classes.

* [ ] REQUIREMENT: Replace disallowed characters with spaces, collapse whitespace, and trim invalid edge punctuation.
  ACCEPTANCE: Sanitization does not concatenate words that were separated by removed characters.
  VALIDATION: Verify representative emoji, em-dash, unsupported-script, and punctuation examples.

* [ ] REQUIREMENT: Apply `(no title)` and `(no description)` when sanitization leaves an empty result.
  ACCEPTANCE: Empty metadata does not make an otherwise valid capture fail.
  VALIDATION: Test both placeholders explicitly.

* [ ] REQUIREMENT: Respect title and description length limits after sanitization.
  ACCEPTANCE: Truncation does not split a Unicode code point and final stored text still satisfies edge-cleanup rules.
  VALIDATION: Test long multilingual strings.

### 4. Authoring command

* [ ] REQUIREMENT: Provide one simple command that normally requires only the target URL.
  ACCEPTANCE: The user does not supply ID, title, description, date, preview name, or manifest position.
  VALIDATION: Run the complete command from a clean valid repository.

* [ ] REQUIREMENT: Validate repository, configuration, and dependencies before expensive browser work.
  ACCEPTANCE: Missing configuration or dependencies fail before page capture and before repository mutation.
  VALIDATION: Simulate at least one missing dependency and one invalid site-base configuration.

* [ ] REQUIREMENT: Use Playwright rather than Puppeteer.
  ACCEPTANCE: The target renders through the specified Playwright Chromium workflow.
  VALIDATION: Inspect dependency and execution path and run an actual capture.

* [ ] REQUIREMENT: Perform duplicate detection before capture and final duplicate recheck before commit where concurrency permits a race.
  ACCEPTANCE: Concurrent or overlapping authoring does not produce two records for the same target.
  VALIDATION: Simulate or automate two competing add operations.

* [ ] REQUIREMENT: Treat record creation and manifest update as one transaction-like operation.
  ACCEPTANCE: Failure before success does not intentionally leave the manifest pointing at an incomplete record.
  VALIDATION: Inject or simulate failure before manifest commit and inspect repository state.

* [ ] REQUIREMENT: Roll back a committed new record when manifest update fails where possible.
  ACCEPTANCE: Successful rollback restores previous state; rollback failure clearly reports uncertain repository state.
  VALIDATION: Exercise both successful and failed rollback paths if practical through controlled filesystem failure simulation.

* [ ] REQUIREMENT: Never commit or push automatically.
  ACCEPTANCE: Successful generation modifies local project files only.
  VALIDATION: Inspect command behavior and Git state after execution.

### 5. Playwright page readiness

* [ ] REQUIREMENT: Use the fixed CHARLIE desktop viewport, scale factor, and 100% browser zoom.
  ACCEPTANCE: Capture geometry is deterministic and does not depend on arbitrary local browser dimensions.
  VALIDATION: Inspect Playwright context values during DEBUG execution.

* [ ] REQUIREMENT: Bound navigation and stabilization waits.
  ACCEPTANCE: The tool cannot remain indefinitely blocked on network idle, fonts, images, animations, or DOM conditions.
  VALIDATION: Exercise a deliberately slow or continuously requesting page.

* [ ] REQUIREMENT: Disable or neutralize nondeterministic animation and media where specified.
  ACCEPTANCE: Repeated captures of stable content select materially consistent regions.
  VALIDATION: Capture an animated test page several times and compare results.

* [ ] REQUIREMENT: Handle ordinary non-content overlays conservatively without bypassing access controls.
  ACCEPTANCE: Cookie or dismissible overlays may be removed, while login, CAPTCHA, paywall, and anti-bot barriers are not circumvented.
  VALIDATION: Test representative controlled overlay and access-barrier pages.

### 6. Preview region selection

* [ ] REQUIREMENT: Select a real rendered page region rather than scaling a full-page screenshot.
  ACCEPTANCE: Preview text remains near normal browser scale and useful content is recognizable.
  VALIDATION: Visually inspect previews from long article and documentation pages.

* [ ] REQUIREMENT: Use deterministic DOM and layout heuristics without AI.
  ACCEPTANCE: Candidate discovery and scoring can be explained through DEBUG diagnostics.
  VALIDATION: Run DEBUG capture and inspect candidate counts, signals, scores, and selected crop.

* [ ] REQUIREMENT: Prefer headings, readable text, meaningful images, and main content while penalizing navigation, advertising, footer, overlays, and empty regions.
  ACCEPTANCE: Representative articles, docs, product pages, and interface pages select useful content rather than site chrome.
  VALIDATION: Capture a diverse controlled sample and visually inspect every result.

* [ ] REQUIREMENT: Keep candidate analysis bounded by the specified search area and candidate limits.
  ACCEPTANCE: Extremely long or complex pages do not trigger unbounded traversal or full-page bitmap generation.
  VALIDATION: Exercise a long/infinite page and inspect timings and candidate metrics.

* [ ] REQUIREMENT: Apply deterministic tie-breaking and the single densest-content fallback.
  ACCEPTANCE: Repeated equivalent runs do not select arbitrary unrelated regions.
  VALIDATION: Test a page with multiple similarly scored candidates.

* [ ] REQUIREMENT: Fail when no genuinely useful preview region exists.
  ACCEPTANCE: No blank, generic, synthetic, or logo-only placeholder is silently committed.
  VALIDATION: Exercise a deliberately unusable page.

### 7. Manifest loading and pagination

* [ ] REQUIREMENT: Load the full lightweight `links.txt` manifest while avoiding eager loading of every record.
  ACCEPTANCE: Archive size increases manifest parsing work but does not cause one record request per archived link at startup.
  VALIDATION: Test with a large fixture manifest and inspect request counts.

* [ ] REQUIREMENT: Validate manifest IDs, order, and uniqueness.
  ACCEPTANCE: Invalid and duplicate lines produce explicit repository errors rather than silent correction.
  VALIDATION: Test malformed and duplicate manifest fixtures.

* [ ] REQUIREMENT: Preserve six entries per logical page.
  ACCEPTANCE: Page boundaries remain stable across desktop and mobile presentation.
  VALIDATION: Test archives with 0, 1, 5, 6, 7, 12, 13, and other boundary counts.

* [ ] REQUIREMENT: Preserve newest-first manifest order throughout page resolution.
  ACCEPTANCE: Cache completion or network response order never reorders entries.
  VALIDATION: Artificially delay selected record responses and inspect rendered order.

### 8. Journal record loading

* [ ] REQUIREMENT: Fetch generated `index.html` only for visible or bounded nearby records.
  ACCEPTANCE: Initial two-page desktop view resolves at most its required records plus defined adjacent prefetch.
  VALIDATION: Record all journal network requests at startup.

* [ ] REQUIREMENT: Parse fetched record HTML inertly.
  ACCEPTANCE: Redirect scripts and meta refresh do not execute during metadata loading.
  VALIDATION: Load records through the actual journal and confirm no unintended navigation occurs.

* [ ] REQUIREMENT: Validate required record metadata and confirm stored `lnk:id` matches the requested ID.
  ACCEPTANCE: Malformed records become explicit failed entries without shifting pagination.
  VALIDATION: Test missing metadata and ID-mismatch fixtures.

* [ ] REQUIREMENT: Keep failed entries in their manifest positions.
  ACCEPTANCE: Neighboring cards and later pages retain deterministic indexes.
  VALIDATION: Corrupt one record in the middle of a page and inspect layout and pagination.

### 9. Browser cache

* [ ] REQUIREMENT: Cache parsed record metadata in localStorage for exactly the DELTA one-hour TTL.
  ACCEPTANCE: Fresh entries avoid record HTML requests and stale entries refresh when needed.
  VALIDATION: Control `cachedAt` values around the one-hour boundary.

* [ ] REQUIREMENT: Keep manifest membership authoritative over cached entries.
  ACCEPTANCE: A cached deleted ID is not displayed after a current manifest omits it.
  VALIDATION: Cache an entry, remove it from the manifest fixture, and reload.

* [ ] REQUIREMENT: Continue without persistent cache when localStorage is unavailable.
  ACCEPTANCE: Journal functionality remains correct using memory/network and produces only an appropriate warning.
  VALIDATION: Run with storage access deliberately blocked.

* [ ] REQUIREMENT: Allow stale record fallback only under DELTA's stated conditions.
  ACCEPTANCE: Stale content cannot resurrect an ID absent from the current manifest.
  VALIDATION: Test both permitted stale fallback and deleted-record rejection.

* [ ] REQUIREMENT: Bound concurrent record requests and deduplicate simultaneous requests for the same ID.
  ACCEPTANCE: Request count and concurrency remain within DELTA limits during rapid navigation.
  VALIDATION: Instrument controlled delayed responses and observe active requests.

### 10. Journal visual composition

* [ ] REQUIREMENT: Implement the ECHO physical journal metaphor rather than a generic bookmark dashboard.
  ACCEPTANCE: The rendered application clearly reads as an open leather journal containing paper pages and saved web clippings.
  VALIDATION: Capture desktop and mobile screenshots and compare them with the supplied art-direction references.

* [ ] REQUIREMENT: Render six entries per page using the fixed 2 x 3 layout.
  ACCEPTANCE: Preview, title, hostname, and date remain readable and consistently aligned.
  VALIDATION: Inspect full and partial pages using varied realistic content.

* [ ] REQUIREMENT: Keep the preview visually dominant and preserve its aspect ratio.
  ACCEPTANCE: Generated screenshots remain recognizable and are not distorted.
  VALIDATION: Inspect dark, light, text-heavy, and image-heavy previews.

* [ ] REQUIREMENT: Apply only subtle worn treatment to preview edges.
  ACCEPTANCE: The border suggests physical age while the center remains clean and source colors remain accurate.
  VALIDATION: Inspect at default zoom and close zoom.

* [ ] REQUIREMENT: Maintain coherent leather, warm paper, binding, page depth, shadows, and desk environment.
  ACCEPTANCE: Materials form one plausible physical object without copied image-generation defects.
  VALIDATION: Review the full scene, not just individual cards.

* [ ] REQUIREMENT: Exclude mockup-only artifacts.
  ACCEPTANCE: No fake phone status bar, bottom explanatory plaque, impossible paper folds, or unrelated UI chrome exists.
  VALIDATION: Compare final screenshots against the "keep/remove" guidance in ECHO.

### 11. Responsive journal

* [ ] REQUIREMENT: Show two logical pages only when both remain practically readable; otherwise show one.
  ACCEPTANCE: Responsive mode is based on usable geometry rather than device identity.
  VALIDATION: Resize through wide desktop, narrow desktop, tablet-like, and phone-like widths.

* [ ] REQUIREMENT: Preserve six-entry logical page boundaries across responsive transitions.
  ACCEPTANCE: Resizing never reorders records or changes the logical grouping of entries.
  VALIDATION: Record the current visible IDs before and after mode changes.

* [ ] REQUIREMENT: Preserve the reader's approximate logical location across resize and orientation changes.
  ACCEPTANCE: Switching from spread to single-page mode does not reset to Page 1.
  VALIDATION: Resize while browsing a later spread.

* [ ] REQUIREMENT: Do not shrink the journal below its minimum readable visual size merely to fit a small window.
  ACCEPTANCE: Overflow becomes reachable through scrolling and panning instead.
  VALIDATION: Use an intentionally small desktop window and inspect title, source, date, and preview readability.

### 12. Scroll, pan, and zoom

* [ ] REQUIREMENT: Use ordinary mouse-wheel and trackpad vertical input for scrolling.
  ACCEPTANCE: Wheel input reveals vertically hidden journal content and never changes logical journal pages.
  VALIDATION: Test a viewport shorter than the journal scene.

* [ ] REQUIREMENT: Use `Ctrl + wheel` for application zoom on supported desktop input.
  ACCEPTANCE: Modified wheel changes journal camera scale without simultaneously scrolling.
  VALIDATION: Exercise zoom from default toward both bounds and inspect camera state.

* [ ] REQUIREMENT: Present the small desktop zoom instruction in unused desk space where there is sufficient room.
  ACCEPTANCE: `Ctrl + wheel to zoom` is discoverable without overlapping or competing with journal content.
  VALIDATION: Inspect wide and constrained desktop screenshots; confirm omission where space is insufficient.

* [ ] REQUIREMENT: Use primary-button drag for desktop pan.
  ACCEPTANCE: The scene follows the pointer after the drag threshold and retains a valid bounded position.
  VALIDATION: Pan at default, minimum, and maximum zoom.

* [ ] REQUIREMENT: Distinguish card activation from pan.
  ACCEPTANCE: A normal click opens the card; a drag exceeding the threshold pans and does not open the link.
  VALIDATION: Automate both pointer sequences.

* [ ] REQUIREMENT: Bound pan and zoom.
  ACCEPTANCE: The journal cannot become unrecoverably lost and zoom cannot exceed defined limits.
  VALIDATION: Repeatedly attempt to exceed every camera boundary.

* [ ] REQUIREMENT: Support mobile vertical scroll and pinch zoom while preserving clear horizontal page-navigation intent.
  ACCEPTANCE: Vertical reading gestures do not accidentally turn pages.
  VALIDATION: Exercise touch or credible touch-emulation sequences on a mobile viewport.

### 13. Page navigation and animation

* [ ] REQUIREMENT: Advance by spreads on desktop and single logical pages on mobile.
  ACCEPTANCE: Desktop sequence is 1-2, 3-4, 5-6; mobile sequence is 1, 2, 3.
  VALIDATION: Navigate repeatedly in both modes and inspect visible page numbers and IDs.

* [ ] REQUIREMENT: Implement one coherent sheet turn rather than complex paper physics.
  ACCEPTANCE: The moving page remains attached to the binding, underlying pages remain stable, and no duplicate floating sheets appear.
  VALIDATION: Capture multiple animation frames in both directions and inspect each frame.

* [ ] REQUIREMENT: Prevent repeated input from corrupting pagination during an active animation.
  ACCEPTANCE: Rapid commands leave one valid final spread/page.
  VALIDATION: Issue repeated forward/back navigation during transitions.

* [ ] REQUIREMENT: Respect reduced-motion preference.
  ACCEPTANCE: Navigation remains functional with a minimal-motion transition.
  VALIDATION: Emulate reduced motion and repeat page navigation.

### 14. Loading and failure presentation

* [ ] REQUIREMENT: Preserve grid geometry while entries load.
  ACCEPTANCE: Loading placeholders occupy final card positions and resolved data does not shift neighboring entries.
  VALIDATION: Delay record responses and inspect intermediate screenshots.

* [ ] REQUIREMENT: Keep individual record failures local to their grid positions.
  ACCEPTANCE: One broken record does not create a global journal error or remove its pagination slot.
  VALIDATION: Return a record 404 within an otherwise valid page.

* [ ] REQUIREMENT: Keep preview failures local to preview rectangles.
  ACCEPTANCE: Title, source, date, and link remain usable.
  VALIDATION: Return a missing preview image for one valid record.

* [ ] REQUIREMENT: Show complete manifest failure at journal scope.
  ACCEPTANCE: The application does not pretend a failed manifest request means an empty archive.
  VALIDATION: Exercise network failure and HTTP 404 separately and inspect the different messages.

### 15. Diagnostics

* [ ] REQUIREMENT: Implement the FOXTROT normalized diagnostic model and formatting helpers.
  ACCEPTANCE: Important errors have stable code, module, stage, summary, reason, and relevant context.
  VALIDATION: Trigger representative failures from authoring, capture, repository, manifest, record, and cache modules.

* [ ] REQUIREMENT: Keep user-facing error text concise and deliberately formatted.
  ACCEPTANCE: Errors do not expose raw exception objects, repeated invariants, irrelevant stack traces, or generic administrator/restart advice.
  VALIDATION: Review every representative user-visible failure manually.

* [ ] REQUIREMENT: Use controlled subsystem-specific apology wording where FOXTROT requires a user-facing interruption.
  ACCEPTANCE: Messages remain brief, sincere, and distinguishable without becoming theatrical.
  VALIDATION: Compare error samples from authoring, capture, repository, and journal scopes.

* [ ] REQUIREMENT: Preserve detailed local debugging context.
  ACCEPTANCE: Console diagnostics identify operation/session, affected resource, stage, parameters, error code, and rollback state where applicable.
  VALIDATION: Diagnose intentionally produced failures using logs only, without modifying code.

* [ ] REQUIREMENT: Do not use raw object dumping or `JSON.stringify()` as the primary error presentation.
  ACCEPTANCE: Human-readable formatted context appears first; bounded serialization is secondary DEBUG detail only.
  VALIDATION: Inspect logging call sites and runtime output.

* [ ] REQUIREMENT: Preserve stack traces for unexpected programming failures.
  ACCEPTANCE: Unexpected exceptions remain debuggable while expected operational errors stay concise.
  VALIDATION: Trigger one controlled unexpected exception in development validation.

### 16. Local telemetry and privacy

* [ ] REQUIREMENT: Provide local timing information for expensive authoring and journal operations in DEBUG mode.
  ACCEPTANCE: Slow stages can be identified without adding temporary instrumentation.
  VALIDATION: Inspect one authoring timing report and one journal loading report.

* [ ] REQUIREMENT: Keep logs bounded.
  ACCEPTANCE: No full HTML, binary images, huge DOM structures, unbounded child output, cookies, or authentication material are emitted.
  VALIDATION: Review logs from intentionally problematic targets.

* [ ] REQUIREMENT: Send no diagnostic telemetry to a remote service.
  ACCEPTANCE: Project network activity consists only of specified target-page loading, static journal resources, and intentional external-link navigation.
  VALIDATION: Inspect browser and authoring network activity.

### 17. Visual QA

* [ ] REQUIREMENT: Inspect supplied reference images before and during ECHO implementation.
  ACCEPTANCE: Final presentation preserves their intended hierarchy and atmosphere without reproducing their defects.
  VALIDATION: Perform explicit side-by-side review.

* [ ] REQUIREMENT: Capture and inspect representative desktop screenshots.
  ACCEPTANCE: Journal framing, two-page geometry, grid alignment, binding, shadows, desk, and interaction hint are visually coherent.
  VALIDATION: Review standard and constrained desktop screenshots.

* [ ] REQUIREMENT: Capture and inspect representative mobile screenshots.
  ACCEPTANCE: One-page composition remains readable, vertically scrollable, and visually consistent with desktop.
  VALIDATION: Review at least two portrait viewport sizes.

* [ ] REQUIREMENT: Perform exploratory visual review beyond the immediate changed element.
  ACCEPTANCE: Each major presentation validation considers both the primary feature and surrounding composition.
  VALIDATION: Record or summarize discovered surrounding issues during implementation and correct them before completion.

* [ ] REQUIREMENT: Inspect animation intermediate states.
  ACCEPTANCE: No transient impossible geometry exists.
  VALIDATION: Capture several frames during forward and backward turns.

### 18. Accessibility and input

* [ ] REQUIREMENT: Keep every journal entry keyboard reachable.
  ACCEPTANCE: Visible focus exists and Enter opens the focused entry.
  VALIDATION: Navigate a complete page without a pointer.

* [ ] REQUIREMENT: Support keyboard journal navigation.
  ACCEPTANCE: Arrow/Page keys move in the specified direction without corrupting focused interactive controls.
  VALIDATION: Exercise navigation in single-page and spread modes.

* [ ] REQUIREMENT: Respect reduced motion.
  ACCEPTANCE: The complete journal remains usable when motion is reduced.
  VALIDATION: Run the primary browsing workflow under the preference.

* [ ] REQUIREMENT: Keep touch targets practical.
  ACCEPTANCE: Page-edge or retry controls are not tiny or inaccessible.
  VALIDATION: Inspect and interact at mobile scale.

### 19. End-to-end successful workflow

* [ ] REQUIREMENT: Complete the full product path from URL authoring to journal browsing.
  ACCEPTANCE: A new URL becomes a valid repository record, produces a recognizable JPEG preview, appears newest-first in the journal after publication, exposes correct social metadata, and redirects through its short URL.
  VALIDATION: Run the complete workflow with one real representative public page and inspect every stage.

* [ ] REQUIREMENT: Confirm the Git diff is minimal and understandable.
  ACCEPTANCE: A normal add operation produces only the expected manifest change and new record files.
  VALIDATION: Inspect Git status and diff after authoring.

### 20. End-to-end failure safety

* [ ] REQUIREMENT: Verify at least one pre-mutation authoring failure.
  ACCEPTANCE: The error is actionable and repository state is unchanged.
  VALIDATION: Use invalid input, duplicate target, or missing dependency.

* [ ] REQUIREMENT: Verify at least one capture-stage failure.
  ACCEPTANCE: No final record or manifest mutation remains.
  VALIDATION: Use a controlled unusable or blocked page.

* [ ] REQUIREMENT: Verify a journal record failure.
  ACCEPTANCE: Only the affected card fails while surrounding browsing remains functional.
  VALIDATION: Use a missing or malformed record fixture.

* [ ] REQUIREMENT: Verify a journal-level manifest failure.
  ACCEPTANCE: The failure is clearly distinguished from an empty archive.
  VALIDATION: Exercise both network failure and missing-manifest response where practical.

### 21. Final cleanup

* [ ] REQUIREMENT: Remove temporary or experimental artifacts before completion.
  ACCEPTANCE: Repository contains no debug screenshots, abandoned capture files, temporary manifests, temporary records, or unused implementation experiments.
  VALIDATION: Inspect repository status and relevant directories.

* [ ] REQUIREMENT: Remove unused dependencies and dead code introduced during experimentation.
  ACCEPTANCE: Every retained dependency and major helper serves a current specified requirement.
  VALIDATION: Review dependency declarations and unreachable/unused modules.

* [ ] REQUIREMENT: Preserve intentional diagnostic and test infrastructure.
  ACCEPTANCE: Cleanup does not remove DEBUG diagnostics, validation helpers, or tests required to maintain confidence in the finished project.
  VALIDATION: Run the final validation suite after cleanup.

### 22. Final confidence gate

* [ ] REQUIREMENT: Do not declare the project complete until Codex has enough evidence to be confident in functional and visual correctness.
  ACCEPTANCE: Automated checks pass, primary workflows pass, relevant failure workflows pass, final screenshots have been inspected, surrounding behavior has received exploratory review, and no known high-impact defects remain.
  VALIDATION: Perform one final ALPHA-through-GOLF review and rerun the most important end-to-end paths after the final code change.

## O-00. Completion directive

DIRECTIVE: Use this document throughout implementation, not only at the end. The acceptance checklist is both the project completion outline and the required validation plan.

DIRECTIVE: When completing an individual implementation task, identify the checklist items it advances and execute the corresponding validation before moving on.

DIRECTIVE: When implementation discovers a defect outside the immediate task, assess whether it violates the project specifications or acceptance criteria. If it does, correct it rather than deliberately leaving a known inconsistency because it was discovered during exploratory validation.

DIRECTIVE: Do not claim completion based on confidence alone. Build confidence from evidence: generated artifacts, tests, browser behavior, screenshots, console diagnostics, repository inspection, boundary scenarios, and direct use of the finished workflow.

DIRECTIVE: The target is not merely software that technically operates. The target is a finished small product whose simple architecture, dependable behavior, diagnostics, and visual presentation all reinforce the same user experience.

