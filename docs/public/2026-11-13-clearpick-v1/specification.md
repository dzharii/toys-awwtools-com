# Clearpick software requirements specification

## A01 Purpose and intent

LeetCode's Medium and Hard labels describe broad difficulty bands. They do not tell a practicing engineer whether a problem offers a direct, discoverable route to a solution or hides a difficult insight behind a few lines of code. Searching discussions and solution repositories to make that distinction consumes practice time and can reveal the answer before the exercise begins. A short implementation is particularly misleading: recognizing a game invariant, proving a greedy choice, or deriving a mathematical identity may be the entire challenge.

Clearpick reduces that selection cost. It presents a deliberately curated list of officially Medium or Hard problems that a JavaScript engineer can reasonably approach with familiar programming tools. Both finding a valid approach and implementing it must be approachable. A longer direct simulation can be a better fit than a clever one-liner. Selection quality takes precedence over list size, recency, or maintaining an artificial quota of Hard problems.

The user opens a compact practice desk, sees unsolved choices first, and follows a title to LeetCode. Each row contains the official number, title, difficulty, an independently written description of the task, a small premise illustration, and completion status. No hints, algorithms, topic labels that reveal an approach, solutions, or reasoning appear in the practice interface. A random picker removes the remaining decision friction without automatically navigating away.

Completion data stays in the user's browser. The user installs a bookmarklet once, runs it while signed in to LeetCode, and returns automatically to Clearpick with accepted problem IDs. Clearpick validates and merges those IDs into browser-local progress. Repeated imports are safe; an older export never erases existing solved entries. The website needs no LeetCode credentials, server-side account integration, or progress database. Clearing this site's browser data resets it; a JSON backup supports moving progress between browsers.

The illustrations reduce the effort of scanning unfamiliar titles. A water-holding skyline, a row of word tiles, or matching documents makes the situation recognizable before the user opens the full statement. The artwork explains the task's objects and allowed transformation; it does not explain how to compute the answer efficiently. The same two recurring characters make the collection coherent, while each scene remains specific to its problem. Transparent backgrounds let these compact strips sit directly in both themes without turning the list into a gallery of cards.

Clearpick saves time at three points: discovering suitable exercises, avoiding already completed exercises, and choosing the next exercise. Its value depends on defensible editorial decisions, accurate summaries and examples, and reliable progress transfer. A larger catalog or attractive image cannot compensate for a difficult hidden insight, misleading scene, or lost progress. The interface therefore preserves the familiar list structure, uses readable text, and keeps research evidence outside the practice experience. Downloadable sources, references and an offline entry point let the owner inspect the work, retain it independently, and browse the same collection without a running server.

## B01 Scope and terminology

The release includes a static published website, source repository, readable bookmarklet source, research ledger, this specification, AGENTS.md, 74 individually generated illustrations, four original reference sheets, production records and an offline entry point. Preserve the existing Site identity and access policy when updating; the Site's current policy is public. Medium and Hard always mean LeetCode's observed official classification; approachable is our editorial judgment. Solved means LeetCode reported an accepted solution, not merely an attempt. Unknown locally means not yet imported as solved; it does not assert the user has never solved that problem. A catalog is the reviewed published subset, not a claim to cover all existing qualifying problems. Complete illustration coverage means all 74 entries in this release, including entries hidden by current filters.

No solutions, code execution, submission automation, manual completion toggles, automatic background synchronization, social features, server progress storage, or reset button are in scope. The research universe includes programming problems across all number ranges. SQL-only, shell-only and paid-only exercises are excluded from this release. Future catalog growth must use the same admission rules.

## C00 Research admission contract

The assumed practitioner knows JavaScript loops, arrays, strings, numeric sorting, Map, Set, basic linked lists and straightforward tree traversal. Familiarity with advanced algorithm names is not assumed. Rate discovery and implementation independently on a 1-5 scale. Discovery 1 follows the statement literally; 2 requires one local, readily explained observation; 3 requires a substantial invariant or pattern transfer; 4 requires a difficult reduction or proof; 5 requires specialist knowledge. Implementation 1 is direct basic operations; 2 is modest bookkeeping or a conventional traversal; 3 adds intricate state or custom structures; 4-5 entail substantial algorithmic machinery. Admit only entries scoring at most 2 on both dimensions.

For every candidate, verify the official ID, title, slug, difficulty, access level and constraints against LeetCode when accessible. Inspect at least one complete implementation written by a solution author and its explanation. Record exact URLs, retrieval date, approach, complexity, language-specific risks, scores, inclusion decision and its reason. A second independent implementation or official editorial is desirable for uncertain cases. Do not call a candidate verified solely from an AI-generated list, search snippet, acceptance percentage, code length, or community vote. If official access is unavailable, record the fallback metadata source and uncertainty explicitly.

Apply this ordered checklist: confirm identity and classification; read the task and constraints; derive the simplest plausible correct route; compare it with a complete published implementation; inspect edge cases and complexity; assess how a human discovers the route before seeing it; assess JavaScript implementation burden; reject hidden leaps; write a spoiler-free summary; record sources and decision. If a simple brute-force solution suffices under the actual constraints, it can qualify even when a more advanced optimization exists. Do not lower either score because the final code is short. Ambiguous cases remain deferred.

Examples: 3195's bounding rectangle is a direct task decomposition and a strong candidate. A vowel game whose answer is a single predicate can still fail discovery review because the game argument is the real work. A Hard problem with a familiar algorithm is not automatically approachable. No Hard entry is admitted merely to populate a filter.

## D00 Research records and coverage

The private research ledger stores admitted and rejected candidates separately from the shipped catalog. Each admitted record includes numeric ID, official title, stable slug, difficulty, original summary, both scores, reasoning, complexity, source URLs and checked date. Source evidence may contain spoilers and must never be copied into the practice UI. Published data contains only ID, title, slug, difficulty, summary and non-revealing audit metadata where needed.

Record inspected candidates and coverage limitations. The initial catalog is a reviewed edition; exhaustive discovery across the live LeetCode catalog is a continuing research task and must not be advertised as complete. Recheck entries on catalog updates, especially changed difficulty, constraints, access restrictions or broken links. Removing an entry from the catalog must not delete its saved solved ID.

## E01 Display and navigation requirements

| ID | Requirement |
| --- | --- |
| UI-01 | Render a compact, responsive practice table with number, title, original task summary, premise illustration, official Medium/Hard label and solved state. |
| UI-02 | Default to all reviewed entries, partitioned into unsolved followed by solved; sort each partition by numeric frontend ID ascending. Never sort IDs lexicographically. |
| UI-03 | Search title, number and summary case-insensitively. Combine search, difficulty and completion filters with AND. Provide clear filters and an informative empty result. |
| UI-04 | Allow All, Medium and Hard difficulty choices, including an honest empty Hard state when none qualify. Allow All, Unsolved and Solved completion choices. |
| UI-05 | Link titles to https://leetcode.com/problems/{validated-slug}/ in a new tab with noopener/noreferrer. Opening a problem does not mark it solved. |
| UI-06 | Show reviewed total, locally solved catalog count, remaining count and last successful import. Explain that status reflects the last import. |
| UI-07 | Keep solution hints, technique labels, reasoning and implementation snippets out of every problem row and picker result. |

## F00 Random selection

The picker samples uniformly from currently filtered, locally unsolved entries. It respects search and difficulty filters and never returns a solved entry, including when the Solved filter is active. Use crypto.getRandomValues with rejection sampling so modulo bias is avoided. Show the selected title, summary and an explicit Open on LeetCode link. Do not auto-open tabs. Disable or explain the picker when no eligible candidates remain. Selecting again may repeat a problem; do not imply a non-repeating queue.

## G03 Visual and accessibility requirements

Use LeetCode's familiar compact problem-list vocabulary and restrained amber difficulty accents without its logo, copied layouts, or assets. Clearpick's own dark visual system uses graphite #20252c, panel #282e36, rule #3b424d, text #edf0f4, secondary #aeb8c5 and amber #f2ba58, with muted green solved indicators. Its light theme uses background #f6f7f9, white panels, text #202b37, secondary #526174 and amber text #805400. Default to dark and persist an explicit theme choice in clearpick.theme, independently of progress. A denied theme write must not interrupt browsing. A system humanist sans stack keeps data dense and readable; tabular numerals align IDs. Use an anchored left editorial rail on wide screens, a single fluid table, and a narrow-screen stacked row treatment. Avoid a marketing hero and repeated cards. Do not display the introductory marketing heading or its description. Keep the established layout, sidebar, picker, controls and independence notice. Use 16px problem titles and 14px summaries on desktop, with 15px titles and 13px summaries on narrow screens. Keep the reviewed-edition badge beside the list metadata.

At widths of at least 1280px, place an unframed illustration after the title/summary cell and before the difficulty and progress cells. Use a 290px column, reduced to 240px through 1390px. Below 1280px, stack the image beneath its description so the text and status columns remain readable; below 741px use the established mobile row layout. Intermediate rows cap illustration width at 420px; mobile illustrations fit the available row width. Preserve the image's 6:1 aspect ratio. Do not reserve a tall gallery area, overlap text, clip controls, or introduce page-level horizontal overflow.

Controls must have visible labels, keyboard focus, semantic buttons and links, and text status in addition to color. Dialogs trap focus natively and restore focus on close. Announce import outcomes and picker results. Honor reduced motion. Support 360px-wide viewports without page-level horizontal scrolling. Filter changes must not move keyboard focus unexpectedly.

Illustrations repeat the task premise already supplied by text and use empty alternative text. They must not be the sole source of a rule or instruction. Every image declares width 960 and height 160, uses lazy loading and asynchronous decoding, and reserves its aspect ratio before loading. Both theme backgrounds must preserve recognizable character fills, relevant objects and readable labels.

On wide layouts with mouse hover, offer the stationary enlarged illustration callout specified in Q00. Keep the existing row sizes and artwork files unchanged. Do not offer this effect in stacked or touch layouts.

## H00 Bookmarklet export contract

Run only on HTTPS leetcode.com or www.leetcode.com, in the signed-in user's page context. Read the same-origin GraphQL API using the existing session. Reuse the supplied bookmarklet's request pattern: POST /graphql/, Content-Type application/json, credentials same-origin, optional x-csrftoken from csrftoken cookie, and GraphQL error validation. Never export a cookie, token, submission code, user ID, or session ID.

Use the current API observed in the attached network capture: problemsetQuestionListV2, QuestionFilterInput, questions { questionFrontendId status }, totalLength and hasMore. The capture shows SOLVED and TO_DO statuses. Reuse the captured empty filters and category all-code-essentials, paging from skip=0. Query userStatus { isSignedIn username } before collecting and after collecting to detect account changes. Only SOLVED records contribute IDs. Do not use recentAcSubmissionList, because it is a truncated recent history.

Fetch sequential pages of at most 100 records with a short inter-page pause, per-request timeout and bounded retries for network/429/5xx errors. Stop on API/schema errors and never navigate with a partial result. Validate every row, totals, duplicate IDs, pagination progress, upper bounds and stable account identity. If the catalog total changes during export, stop and request a retry. Show a removable progress overlay with Cancel; cancellation aborts requests and leaves the page in place. Prevent concurrent runs. The API is undocumented and may change; explain failures with a retry action and preserve existing Clearpick state.

## I00 Transfer format and routing

Version 1 payload example:

```json
{"version":1,"source":"leetcode.com","username":"example","exportedAt":"2026-11-13T20:00:00.000Z","solvedIds":[48,3195]}
```

IDs are frontend numbers, not internal database IDs. Encode UTF-8 JSON as base64url and navigate to the fixed deployed origin at /#import={payload}. This root hash route avoids static host route fallback requirements and acts as the client-side import endpoint. Never accept a destination from source-page content or imported data. The fragment is not sent as part of the HTTP request; browser history, extensions and script running on the destination can still see it. Strip it with history.replaceState immediately after reading, including on invalid input. Do not send progress to analytics or any server.

Bound decoded JSON to 200,000 characters, at most 20,000 solved IDs, positive safe integer IDs <=1,000,000, username to 100 safe characters and a valid timestamp no more than 24 hours in the future. Validate all fields and version before any write; deduplicate and sort IDs. Reject unsupported versions, malformed encoding, unexpected field types and mixed invalid arrays as a whole. For a generated transfer URL over 60,000 characters, download the identical JSON instead and instruct the user to import it on Clearpick. The same JSON parser supports backup file import with a size check before reading.

## J00 Local state and merge semantics

Use localStorage key clearpick.progress.v1 containing the validated transfer format plus lastImportedAt. A successful import unions incoming IDs with existing IDs for the same username, including IDs outside the current catalog. Reimporting the same payload adds zero IDs. A stale export never unsolves a problem. Last import records receipt time; exportedAt records the latest source snapshot time. Store only after all validation and account checks pass, and report both newly added IDs and solved catalog count.

If an import names a different username, present a clear account-switch decision before changing state. Confirmation replaces the previous account's progress; cancellation preserves it. Never silently combine two accounts. Clearing this origin's browser data resets progress. Backup export produces JSON with the same versioned shape and does not expose session material. Reflect changes from other tabs through the storage event. On denied storage, quota failure or corrupt saved data, keep browsing available, explain that progress could not be persisted, and do not claim a successful import. Do not silently destroy corrupt stored data.

## K00 Failure behavior and privacy

An invalid or partial import must leave saved progress unchanged. A failed export must remain on LeetCode. Login failure directs the user to sign in on LeetCode; a schema error reports that the API response changed. Do not attempt security or access-control workarounds. Render imported strings as text, never HTML. Use only validated fixed-origin LeetCode URLs for catalog links. No external fonts, tracking, embeds, credentials, databases or network requests are needed for the practice interface. Site hosting authentication is independent of LeetCode authentication.

## L01 Content ownership

Use official problem titles and destination links as identifiers and write brief task summaries independently. Do not reproduce full statements, example explanations, tests, solutions or editorial text. Illustrations may show a small accurate task example, using minimal labels and independently composed scenes. They must not expose an implementation method. Retain the user-supplied reference sheets as production references, without claiming that their provenance grants broader rights. Do not claim affiliation or that title/summary reuse guarantees legal clearance. Include a short independence notice and links to the source service. The user-triggered status exporter is an unofficial integration, not an endorsed API; do not add unattended scraping or authenticated research collection.

## M02 Architecture and project layout

Keep the application buildless: dist/index.html, dist/styles.css, dist/app.js, dist/core.js, dist/catalog.json and generated dist/bookmarklet.txt. Author readable bookmarklet source separately in bookmarklet.js and generate the install link for the deployed origin. docs/SPECIFICATION.md owns product requirements; docs/research.json and docs/research-notes.md own research evidence. tests/ exercises transfer validation, state merging, ordering, random boundaries and bookmarklet pagination with mocked GraphQL. AGENTS.md explains these boundaries. .openai/hosting.json identifies the existing Site. No runtime dependencies or build framework are necessary.

dist/illustrations.json maps decimal frontend ID strings to src, width, height and alt. Assets live in dist/assets/illustrations/{id}-{slug}.png. Keep illustration metadata separate from the spoiler-free catalog schema. references/ holds the four original attached PNGs; docs/illustrations/ holds the complete checklist, prompts and production notes. scripts/finish-illustration.py optimizes one accepted image and records its hash; scripts/validate-illustrations.py checks full coverage, dimensions, alpha and review records. Python/Pillow are maintenance tools only. scripts/build-offline.mjs produces root offline.html from the same application, styles, catalog and manifest; its image paths point to the delivered dist/ assets.

dist/illustration-preview.js owns one shared, non-interactive hover overlay, delegated row pointer events, image decoding, crossfades and dismissal. app.js initializes it and dismisses it before replacing rows. The offline builder includes this same module's implementation; do not introduce a separate offline version of the hover behavior.

## N02 Acceptance and release

Validate catalog uniqueness, allowed difficulty, score thresholds, nonempty summaries, safe slugs, source evidence and deterministic numeric order. Test import idempotency, stale union, invalid version/ID/date/encoding, cross-account separation, unknown catalog IDs, storage failures, cancellation, incomplete/repeated pagination and failed GraphQL responses. Use the supplied capture as a sanitized protocol fixture only; never commit the full capture, its cookies, or account response data.

Browser QA must exercise filters, random selection, empty states, valid and invalid fragment imports, persistence after reload, backup round trip, keyboard-accessible sync dialog and a narrow viewport. Check desktop and mobile portrait layouts in both themes, especially text width, image placement, status access and overflow. Verify that all 74 IDs map to distinct existing PNGs, each 960x160 with genuine alpha, and every checklist item is complete. Inspect each optimized asset on both backgrounds. Run the existing protocol/core tests, catalog validator and illustration/offline checks. Mocked bookmarklet tests establish protocol behavior; they do not establish live authenticated compatibility. Report that limitation if no signed-in live test is available. Publish the exact checked source commit and confirm terminal deployment success. Deliver the URL and a full-source archive including specification, AGENTS.md, reference sheets, optimized final illustrations, manifest, production records and offline entry point. State actual coverage and any unresolved blocker.

For the hover callout, verify opening, enlarged image correctness, a fixed panel rectangle while switching rows, a visible transition without a blank frame, the grace period across row gaps, exit, Escape and scroll dismissal. Check dark/light glass surfaces, no intercepted pointer targets, and the disabled state below the desktop breakpoint. Confirm reduced-motion rules remove transitions. A stale image decode must never overwrite a newer hovered target.

## O00 Illustration production contract

Process inventory entries individually and sequentially. Read the title and summary, consult the complete authoritative statement when needed, choose a task-specific scene, generate it using the supplied reference sheets, inspect semantic accuracy and character consistency, optimize it, inspect the light/dark proof, integrate its mapping and record completion before moving to the next entry. A failed or inaccurate generation remains incomplete until corrected. Never silently replace it with emoji, an icon, a generic scene or an unrelated asset.

Use sparse flat two-dimensional cartoon sketches with round cream heads, dot eyes, simple expressions, geometric bodies, thin limbs and slightly irregular teal outlines. The female keeps a small teal ponytail, curved forelock and peach shirt; the male keeps a short teal tuft and mustard shirt. Hats, tools, expressions and poses may vary. Cream, peach, mustard and mint dominate, with occasional blue. Keep relevant objects prominent and characters subordinate. Use one shallow horizontal scene, approximately 6:1, without panel borders, balloons, scenery, three-dimensional rendering or decorative backgrounds.

Every final file is an RGBA PNG with actual transparent empty space, including gaps between objects. Character and object interiors stay opaque where appropriate. Trim excess margins, retain padding, resize to 960x160 and optimize PNG compression without flattening alpha. Do not bake in white, the page color or checkerboard. Check clipped edges, stray pixels, halos, disappearing strokes and small-label readability against #f6f7f9 and #20252c.

Review depicted values and transformations explicitly: preserve all elements in rearrangements, verify sums and counts, respect adjacency and boundaries, distinguish indices from values, and show only actions permitted by the task. Fewer labels are preferable to an ambiguous numerical claim. A statement-defined operation or simple input/output scene is allowed; algorithm selection, data-structure guidance and implementation reasoning are not. Record generated, semanticAccuracy, characterConsistency, transparency, lightAndDark and integrated separately for every ID, with a review note, byte count, SHA-256 and explicit blocker when applicable. Preserve prompt text and the four reference filenames for reproducibility; prompt reconstruction must be labeled if an early exact prompt is unavailable.

## P00 Source and offline delivery

Deliver a ZIP containing the complete project tree without Git internals, credentials, account snapshots, full network captures or temporary QA files. Include all four unmodified reference sheets and all 74 optimized illustration assets; high-resolution rejected variants are not runtime dependencies. The README must identify the offline entry point, source layout, maintenance commands, published URL and data boundaries.

After extracting the ZIP, opening offline.html directly must show the full catalog and local illustrations without fetching JSON, modules, fonts or styles from a server. Search, filters, theme switching, random selection and JSON backup/import use the same application logic. Browser-local storage remains subject to browser support for file URLs; failures must leave browsing available. Offline and hosted progress are separate browser storage contexts; JSON is the explicit transfer mechanism. LeetCode links and bookmarklet synchronization require internet access, and the bookmarklet continues to return to the fixed published origin. Do not imply that downloading the source also downloads the user's hosted progress.

## Q00 Desktop illustration hover callout

Enable only when viewport width is at least 1280 CSS pixels, height is at least 480 CSS pixels, and the primary input supports fine-pointer hover. Handle mouse pointer entry on the illustration itself, not the entire problem row. A 110ms dwell prevents incidental crossings from opening a preview. Below that breakpoint, including mobile and intermediate stacked rows, the existing larger inline image remains the only presentation.

Use one shared overlay fixed to the viewport, with its cloud 20px from the top and 24px from the right. Its width is min(860px, viewport width minus 400px). Reserve a 6:1 image area inside 28px vertical and 24px horizontal padding. The cloud stays in the same position when the hovered problem changes; it does not follow mouse movement. Enlarge the existing transparent PNG without stretching its aspect ratio or adding labels, solutions or new artwork.

The main cloud uses rounded corners, a restrained border and shadow, a dark translucent glass tint of approximately 76% opacity, and a 16px backdrop blur. Keep this surface dark-tinted in both themes so the underlying page remains softly visible while the artwork stays prominent. Supply the translucent fill when backdrop blur is unsupported. The source PNG's transparent empty space remains transparent over this surface. Do not use an opaque black rectangle.

Connect the source thumbnail toward the cloud with three soft elliptical thought-cloud bubbles. Their centers interpolate between the thumbnail and cloud base; size and opacity increase toward the cloud, with feathered edges. Hide the tail when the source is behind or above the cloud so bubbles do not cross its contents. The tail may change with the active thumbnail; the main cloud must remain stationary.

Fade the overlay in and out over 180ms. Keep it open for a 180ms grace period after leaving a thumbnail; entering another thumbnail cancels closing. Decode the next image before crossfading two image layers over 180ms, retaining the previous image until the new one is ready. Invalidate stale timers and decode completions when the target changes or the preview is dismissed. A failed image decode must dismiss rather than show the wrong problem.

The overlay must not affect document layout, block mouse input, receive focus or add screen-reader content. It is a decorative enlargement of already described artwork and is marked aria-hidden. Escape, scroll, resize, window blur, loss of desktop eligibility, document hiding and row replacement dismiss it. Respect prefers-reduced-motion by removing fade and crossfade transitions. Do not require a click, alter solved progress or change search/filter behavior.
