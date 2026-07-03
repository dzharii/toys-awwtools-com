# AGENTS.md

you must read and understand: ./doc_detailed_project_description.md 

---

A00 Project Mission

---

Build a static, local-first E Ink-style reader for local TXT and Markdown files.

The runtime app must be plain HTML, CSS, JavaScript, and local assets. It must not require npm, a framework, a build step, a server, a database, account login, cloud storage, remote fonts, remote scripts, analytics, or runtime network access.

The app must let a user open one local `.txt`, `.md`, or `.markdown` file through file picker or drag-and-drop. The app must render the file as a calm E Ink-like reading surface with page mode, scroll mode, local fonts, local settings, safe Markdown handling, clear errors, responsive layouts, keyboard and touch input, and a realistic visual refresh effect.

Book contents must not be persisted. User preferences may be persisted. The user must reopen the book file each session.

Work autonomously. Use best judgment. Research when needed. Make decisions. Validate those decisions. Refactor when the result is not clean enough. Do not wait for user approval when the specifications provide enough direction.

---

B00 Source Documents

---

Read these files before implementation begins:

```text
specs/eink-reader-design-note.md
specs/frank-usage-scenario.md
specs/lily-usage-scenario.md
specs/roman-usage-scenario.md
```

These files are the project authority.

The design note defines the required product, constraints, architecture, quality bar, dependency policy, security policy, rendering behavior, visual simulation, testing expectations, and acceptance criteria.

The Frank scenario defines the demanding daily-reader perspective. Frank tests whether the app is good enough for serious long-form reading, typography, privacy, page mode, scroll mode, visual quality, and complete feature coverage.

The Lily scenario defines the occasional-reader perspective. Lily tests smoothness, clarity, calm recovery, nontechnical error messages, obvious controls, minimal confusion, and whether the app works without requiring software expertise.

The Roman scenario defines the experienced software engineer perspective. Roman tests technical Markdown, code blocks, mobile note review, local/offline integrity, inspectable behavior, diagnostics, safe Markdown, reliable settings, and engineering quality.

The agent may read all files at the beginning to build full context. Implementation must still proceed in the sequence defined below.

---

C00 Required Implementation Sequence

---

Implement the project in four passes.

Pass 1 is the design note pass.

Read:

```text
specs/eink-reader-design-note.md
```

Create:

```text
specs/eink-reader-design-note_todo.md
```

The todo file must contain a complete acceptance checklist extracted from the design note. The checklist must be specific enough to drive implementation. It must include product behavior, runtime constraints, dependency vendoring, font vendoring, file loading, TXT parsing, Markdown parsing, security, storage, rendering, page mode, scroll mode, E Ink simulation, settings, accessibility, responsive behavior, logging, error handling, testing, and documentation.

Validate the todo file before implementing. Check whether any requirement from the design note was missed. Add missing items before coding.

Implement the app against this todo list. After implementation, review the todo list item by item. Mark completed items only when they have been implemented and validated. If implementation reveals that a todo item was incomplete or ambiguous, revise the todo item using best judgment, then satisfy the revised item.

Run tests. Inspect the app manually. Refactor. Do not move to the Frank pass until the design note todo is complete or any remaining limitation is explicitly documented with a reason.

Pass 2 is the Frank pass.

Read:

```text
specs/frank-usage-scenario.md
```

Create:

```text
specs/frank-usage-scenario_todo.md
```

Extract Frank-specific acceptance requirements. Focus on serious reading quality, long-form comfort, typography, page and scroll behavior, privacy, full feature coverage, realistic E Ink behavior, desktop/tablet/mobile reading, strong defaults, and recovery from mistakes.

Validate the Frank todo list against the already implemented app. Some items may already be satisfied by the design note pass. Keep them in the todo list and mark them only after validation.

Use Frank's perspective while reviewing the app. Ask whether the software would satisfy a demanding reader who can leave for a better tool. If something was implemented technically but feels weak, generic, visually poor, or inconvenient for real reading, fix it.

If Frank's requirements reveal that an earlier design decision was wrong, go back and change the implementation. Then rerun relevant tests. Refactor after fixes.

Pass 3 is the Lily pass.

Read:

```text
specs/lily-usage-scenario.md
```

Create:

```text
specs/lily-usage-scenario_todo.md
```

Extract Lily-specific acceptance requirements. Focus on smoothness, obvious first use, nontechnical UI copy, calm errors, easy recovery, mobile simplicity, minimal configuration burden, understandable settings, and no confusing intermediate states.

Validate the Lily todo list against the current app. Use Lily's perspective while reviewing. Ask whether an occasional user with less software troubleshooting experience can open a file, read, adjust basics, recover from mistakes, and leave without confusion.

If a feature that worked for Frank feels too technical, too dense, too noisy, or too confusing for Lily, revise the UI while preserving Frank's power-user needs. Prefer progressive disclosure. Keep main paths simple and move technical details into diagnostics or advanced sections.

If Lily's requirements contradict an earlier implementation detail, do not ignore the conflict. Re-evaluate the design. Use best judgment to satisfy both perspectives when possible. If impossible, prioritize the core product constraints, safety, privacy, and reading usability.

Run tests. Add or update tests for Lily-specific error messages and smooth recovery paths. Refactor.

Pass 4 is the Roman pass.

Read:

```text
specs/roman-usage-scenario.md
```

Create:

```text
specs/roman-usage-scenario_todo.md
```

Extract Roman-specific acceptance requirements. Focus on technical Markdown, code-heavy notes, mobile review, links, code block containment, diagnostics, local/offline runtime, inspectable implementation, safe Markdown, preference persistence without content persistence, and engineering quality.

Validate the Roman todo list against the current app. Use Roman's perspective while reviewing. Ask whether an experienced software engineer would trust the app as a serious local reader for code notes and technical documentation.

If Lily-driven simplification removed useful technical detail, restore it through advanced diagnostics or clear optional controls without making the main experience confusing. If Frank-driven visual choices harm code readability, adjust typography, contrast, code block styling, or theme behavior.

Run tests with code-heavy Markdown fixtures. Inspect mobile rendering. Confirm no book or note content is persisted. Confirm no external network requests occur at runtime. Refactor.

---

D00 Todo File Requirements

---

Each generated todo file must be written as Markdown.

Each todo file must start with the source document path and the pass name.

Each todo file must include acceptance items that can be checked manually or by tests.

Each todo item must be concrete. Avoid vague items like "make UI good." Replace them with verifiable items like "default reader uses local Literata, off-white paper background, constrained line width, and readable line height."

Each todo file must include a validation section.

Each todo file must include a risk section for requirements that are easy to miss.

Each todo file must include a final review section.

Suggested todo structure:

```md
# specs/eink-reader-design-note_todo.md

Source: specs/eink-reader-design-note.md
Pass: Design Note

---

A00 Acceptance Checklist

- [ ] Runtime app is static HTML, CSS, JavaScript, and local assets.
- [ ] No npm, framework, bundler, server, or build step is required for runtime.
- [ ] Runtime makes no external network requests.
- [ ] TXT files can be opened through file picker.
- [ ] TXT files can be opened through drag-and-drop.

---

B00 Validation Checklist

- [ ] App was opened locally.
- [ ] Browser console was checked.
- [ ] Runtime network requests were checked.
- [ ] Storage was checked for book content.
- [ ] Desktop viewport was tested.
- [ ] Mobile viewport was tested.

---

C00 Risks And Edge Cases

- [ ] Large files do not freeze the app without feedback.
- [ ] Markdown raw HTML does not render as trusted HTML.
- [ ] Font loading failure falls back safely.

---

D00 Final Review

- [ ] All implemented items were retested after refactoring.
- [ ] Remaining limitations are documented.
```

Do not treat the example as exhaustive. Extract the actual todo items from the source document.

Before coding each pass, inspect the todo file and ask whether it misses any requirement from the source document. Fix the todo file first. Then implement.

After coding each pass, inspect the todo file again. Do not mark an item done just because code exists. Mark it done only when the app behavior was validated.

---

E00 Autonomous Work Standard

---

Work without interactive clarification unless the repository is missing the specification files entirely or a requirement is impossible under the hard constraints.

Use best judgment often. The specifications intentionally define product direction, constraints, personas, and quality criteria without micromanaging every implementation detail.

When there are multiple viable approaches, compare them briefly, choose one, implement it, validate it, and revise if the result is poor.

When the app behavior satisfies one persona but harms another, reconcile the conflict through design. Use progressive disclosure, safer defaults, advanced diagnostics, responsive layout differences, and settings where appropriate.

Do not stop after the first working version. After each pass, refactor the code. Remove duplication. Improve names. Simplify state flow. Strengthen error handling. Add tests for the behavior that was just added or repaired.

The agent must repeatedly use this loop:

```text
Read.
Extract requirements.
Create todo.
Validate todo completeness.
Plan implementation.
Implement.
Test.
Inspect visually.
Compare against persona.
Fix.
Refactor.
Update todo.
Move to next pass.
```

---

F00 Product Quality Priorities

---

Prioritize reading quality.

The app exists to make local TXT and Markdown files feel better to read. Typography, layout, page width, line height, paper tone, code block readability, and visual calm are not optional polish.

Prioritize safety.

Markdown input is untrusted. Raw HTML must not execute. External resources from Markdown must not load automatically. Book contents must not persist.

Prioritize offline integrity.

Every runtime dependency and font must be local and documented. Runtime must not depend on CDN access.

Prioritize recoverability.

Errors must be understandable and actionable. The app must never leave the user behind a stuck overlay, endless spinner, blank page, or raw stack trace.

Prioritize inspectability.

The code should be readable. Dependencies should be readable and unminified. Vendored assets should have license records. Logs should help diagnose failures without leaking book content.

Prioritize responsiveness.

Desktop, tablet, and mobile must be tested. Page mode and scroll mode must both feel intentional.

---

G00 Hard Constraints

---

Do not use npm for runtime.

Do not require `node_modules`.

Do not introduce a framework.

Do not require a bundler.

Do not require a server for runtime.

Do not load runtime scripts from a CDN.

Do not load runtime fonts from a CDN.

Do not use minified-only vendored dependency files.

Do not use source maps as a substitute for readable dependency source.

Do not store book contents.

Do not render raw Markdown HTML as trusted HTML.

Do not automatically load remote images from Markdown.

Do not send telemetry.

Do not add analytics.

Do not convert the app into a note manager, editor, sync system, cloud library, or multi-file document database.

Optional developer scripts may use Bun, Bash, or PowerShell. Optional tests may use Playwright. These tools must not become runtime requirements.

---

H00 Expected Project Files

---

The repository should contain the static app, local assets, vendored dependencies, scripts, tests, and specs.

Expected high-level structure:

```text
AGENTS.md
index.html
README.md
LICENSES.md

assets/
css/
js/
vendor/
scripts/
tests/
specs/
```

Expected specs:

```text
specs/eink-reader-design-note.md
specs/frank-usage-scenario.md
specs/lily-usage-scenario.md
specs/roman-usage-scenario.md
```

Expected generated todo files:

```text
specs/eink-reader-design-note_todo.md
specs/frank-usage-scenario_todo.md
specs/lily-usage-scenario_todo.md
specs/roman-usage-scenario_todo.md
```

The exact app module names may vary if there is a good reason, but the repository must remain simple, static, and inspectable.

---

I00 Dependency And Font Handling

---

Vendor all runtime dependencies.

Vendor all runtime fonts.

Use readable, unminified dependency sources.

Include license files or license notes for every vendored dependency and font.

Track vendored sources in a manifest.

Optional vendor scripts may download missing files from documented upstream locations. If a file already exists, the script should skip it by default and report it. Do not overwrite vendored files silently.

At runtime, the app must use only local vendored files.

The default reading font must be local Literata.

Other font choices must also be local.

If a selected font is missing, fall back safely and show a calm message.

---

J00 Testing Expectations

---

Create test fixtures for TXT, Markdown, code-heavy Markdown, unsafe Markdown, Unicode, long files, empty files, and unsupported files.

Use Playwright if available. If Playwright is not available, document the limitation and still perform manual browser validation.

Test desktop, tablet, and mobile viewports.

Test page mode and scroll mode.

Test file picker and drag-and-drop where practical.

Test Markdown safety.

Test storage to confirm book content is not persisted.

Test offline runtime behavior.

Test reduced motion.

Test settings persistence.

Test error recovery.

Test code block behavior on mobile.

Test missing dependency and missing font behavior if practical.

Manual visual inspection is required. Automated tests cannot decide whether the E Ink simulation feels credible or whether the reading surface is comfortable.

---

K00 Persona Review Rules

---

During the Frank pass, review the app as a serious reader. Ask whether the app is good enough for long reading sessions and whether the E Ink visual experience feels intentional.

During the Lily pass, review the app as an occasional user who dislikes confusion. Ask whether every message is clear, every mistake is recoverable, and the app can be used without technical knowledge.

During the Roman pass, review the app as an experienced software engineer reading code-heavy Markdown notes on mobile and desktop. Ask whether code blocks, links, diagnostics, offline behavior, local assets, and privacy behavior are technically trustworthy.

If a later persona reveals a flaw in an earlier implementation, go back and fix it. Do not preserve a poor decision merely because it came from an earlier pass.

If the personas pull in different directions, use this resolution order:

```text
1. Hard constraints and safety.
2. Privacy and no content persistence.
3. Reading usability.
4. Accessibility and recoverability.
5. Offline/static runtime integrity.
6. Persona-specific comfort.
7. Visual polish.
```

When possible, satisfy multiple personas by using defaults, settings, responsive behavior, and advanced panels.

---

L00 Final Completion Gate

---

The project is not complete until all four todo files exist, all four passes have been implemented and validated, and the final app satisfies the design note plus Frank, Lily, and Roman usage scenarios.

Before finalizing, perform a final review:

```text
Read all four todo files.
Confirm completed items were actually validated.
Run available automated tests.
Perform manual desktop inspection.
Perform manual mobile inspection.
Check browser console.
Check runtime network requests.
Check persistent storage.
Check vendored dependency files.
Check font loading.
Check Markdown safety.
Check page mode.
Check scroll mode.
Check E Ink transitions.
Check reduced motion.
Check error messages.
Refactor any code that is fragile or hard to troubleshoot.
Update README and license notes if needed.
```

If any item remains incomplete, either fix it or document the limitation with a precise reason. Do not hide known gaps.

The final result should be a coherent static E Ink-style reader that can satisfy Frank's seriousness, Lily's need for smooth clarity, and Roman's engineering standards.

---

M00 Social Preview And Update Feed

---

The project ships social preview metadata and a static RSS update feed.

The social preview must make a concise, honest promise: this is a local TXT and Markdown reader with an E Ink-like reading surface, local fonts, page and scroll modes, and no uploads.

All social metadata must be static in the HTML head, not injected by JavaScript. Social crawlers may not run JavaScript, so title, description, canonical URL, RSS discovery link, Open Graph tags, and X/Twitter card tags must appear in the initial HTML of `index.html`.

Canonical product strings (keep in sync with the head, feed, README, and repo index):

```text
Title:       E Ink Reader - Local TXT and Markdown Reading
Description: Read local TXT and Markdown files in a calm E Ink-style browser reader with page mode, scroll mode, local fonts, and no uploads.
```

The social image is a local project asset:

```text
assets/social/social_logo_1200x630.jpg   (1200 x 630, JPG)
```

The image must be `1200 x 630`, PNG or JPG (never SVG for social compatibility). If the image is replaced, update `og:image:type`, `og:image:width`, and `og:image:height` to match the real file.

Deployed base URL for absolute tags (do not use `https://example.com/` placeholders):

```text
https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/
```

If the app is not yet deployed at a URL, keep placeholders clearly marked and do not invent a production URL.

---

N00 Required HTML Head Metadata

---

`index.html` head must contain primary metadata (title, description, canonical), RSS discovery, Open Graph tags (type, site_name, title, description, url, image, image:secure_url, image:type, image:width, image:height, image:alt, locale), and X/Twitter card tags (card=summary_large_image, title, description, image, image:alt). Absolute `og:image`/`twitter:image` URLs must point at the deployed image path above. Validate that the metadata is static, in the head, and matches implemented behavior. If a described feature does not exist, either revise the copy or finish the feature.

---

O00 RSS Update Feed

---

The user-facing update feed lives at `feed.xml` at the project root. It is static RSS 2.0 XML, requires no server and no npm, and is maintained manually (an optional developer script may help).

The head must include discovery:

```html
<link rel="alternate" type="application/rss+xml" title="E Ink Reader Updates"
  href="https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/feed.xml">
```

A non-intrusive RSS link is also shown on the open screen (`.rss-link`, pointing at `feed.xml`).

The feed contains high-level, user-oriented updates, not a commit log. Do not list internal refactors unless users benefit (reliability, performance, security, accessibility, privacy, maintainability). Each item should answer: what changed, why it matters to a reader, which workflow improves, any visible behavior change, any compatibility/privacy/safety note.

Poor: `Updated parser and fixed bugs.`
Better: `Markdown rendering is safer and clearer. Raw HTML is escaped or removed before display, code blocks stay contained on mobile, and malformed Markdown can be reopened as plain text.`

---

P00 Feed Item Format

---

Use RSS 2.0. Every `<item>` includes `title`, `link`, `guid` (stable, `isPermaLink="false"`, e.g. `eink-reader-update-0001`), `pubDate` (RFC 822, e.g. `Fri, 03 Jul 2026 00:00:00 -0700`), and `description`. If there is no separate update page, link to the homepage with a fragment (e.g. `#updates-safe-markdown`). The channel needs `title`, `link`, `description`, `language`, and `lastBuildDate`. Keep descriptions plain-text (escape any HTML). Replace placeholder dates/URLs with real project values before release.

---

Q00 RSS Update Workflow For New Features

---

Whenever a change affects users — a visible feature, user-facing behavior, file handling, accessibility, privacy, security, visual behavior, or a meaningful user-facing bug fix — update `feed.xml` in the same implementation pass. Do not defer feed updates.

```text
1. Decide whether the change affects users.
2. If yes, write a high-level, user-oriented update.
3. Give enough detail that a subscriber understands what improved.
4. Avoid internal implementation noise.
5. Add an <item> with title, link, guid, pubDate, description.
6. Update channel lastBuildDate to the newest item's pubDate.
7. Validate that feed.xml is still well-formed XML.
8. Confirm the HTML head still links to feed.xml.
```

Changes that need a feed item include: TXT/Markdown loading, raw-HTML sanitization, page/scroll modes, font settings, E Ink transition controls, reduced-motion support, mobile code-block handling, preference persistence, storage-privacy fixes, offline-dependency fixes, large-file handling, clearer errors. Changes that usually do not: internal renames, code moves without behavior change, CSS reformatting, test-helper or comment-only edits. If unsure, add the item.

---

R00 RSS Writing Style

---

Write for users, not maintainers. Say what the reader can do now or what works better now.

Prefer: `Markdown notes with code blocks now read better on phones. Long code lines stay inside the code block instead of pushing the whole page sideways.`
Avoid: `Refactored Markdown renderer and adjusted CSS overflow handling.`

Prefer: `Book contents are still not stored. Preferences are remembered, but reopening the app asks you to choose the file again.`
Avoid: `Changed localStorage payload.`

Each update should be useful to Frank (serious reading quality), Lily (clarity and calm recovery), or Roman (technical reliability, code readability, local behavior, diagnostics).

---

S00 Social And RSS Validation Checklist

---

```text
HTML title is concise and descriptive.
Meta description is honest and not too long.
Open Graph title, description, url, and image are present.
Open Graph image width and height match the actual image.
Open Graph image alt text is present.
X/Twitter card uses summary_large_image with title, description, image, image alt.
Social image exists at assets/social/social_logo_1200x630.jpg and is 1200 x 630 PNG/JPG.
HTML head links to feed.xml; feed.xml exists.
feed.xml is well-formed RSS 2.0 XML.
Channel has title, link, description, language, lastBuildDate.
Every item has title, link, guid, pubDate, description.
Item descriptions are user-oriented, not commit-style.
No item claims a feature that is not implemented.
No placeholder production URL remains before release.
```

Fix any failed item before final completion.


---

T00 Automated UI Regression Tests

---

The repository ships an automated UI regression suite under `ui-regression-test-suite/`. It automates the manual test plan in `specs/tests-manual-plan-v01.md` and follows the architecture in `doc_automated_testing_plan.md`. The suite is a development tool only. It is NOT a runtime dependency: the app still runs with no npm, no build, and no server.

How to run:

```text
cd ui-regression-test-suite
bun install                 # first time only (installs Playwright + types)
bunx playwright install chromium   # first time only (browser binary)
bun run test                # full suite (198 tests, all categories)
bun run test:<category>     # one category, e.g. bun run test:smoke
bun run typecheck           # tsc --noEmit
bun run validate            # typecheck + full suite
```

Category scripts: `test:smoke`, `test:files`, `test:txt`, `test:markdown`, `test:metadata`, `test:rss`, `test:navigation`, `test:settings`, `test:responsive`, `test:accessibility`, `test:privacy`, `test:offline`, `test:resilience`, `test:eink`, `test:pairwise`, `test:journeys`. The full category-to-behavior matrix is in `ui-regression-test-suite/COVERAGE.md`.

Suite layout:

```text
ui-regression-test-suite/
  src/config/          product-contract constants (enums, ranges, error copy, viewports)
  src/framework/       app factory, page-object base, timeouts, diagnostics, storage/network guards, oracle, base-test
  src/page-objects/    open-screen, reader, settings, toast, busy, code-block
  src/flows/           reusable multi-step actions (open file, apply prefs, switch mode, reload)
  src/specs/           one folder per test category
  scripts/             make-fixtures.mjs (regenerates tests/fixtures/)
```

Design principles (do not violate):

- The suite is DECOUPLED from product source. It interacts only through the DOM contract: `data-testid` attributes, ARIA roles, and the read-only `window.__einkReader` inspection handle. It never imports app JS modules.
- Every spec ends actions with the Standard Post-Action Oracle (`expectStandardOracle`) which asserts global invariants: no page/console errors, no stuck busy/E Ink overlay, open XOR reader, valid enums, no horizontal overflow, only the preferences key in storage, no book content in storage, and no unexpected network requests. Gap-closure specs additionally use an adaptive surrounding-state baseline (`src/framework/support/baseline.ts` + `adaptive-baseline.ts`) that snapshots state before an action and asserts only the fields the chosen profile permits changed.
- When a spec fails, classify before changing anything (APP_BUG / TEST_BUG / HARNESS_TIMING / PRODUCT_DECISION / VISUAL_MANUAL_ONLY). Fix the app for real defects; fix the test for harness mistakes. Never expose book content or internal mutable state solely for test convenience. Offline/resilience specs use Playwright route interception (`page.route`) and must never modify production files. Record genuine defects and product-decision observations in `bugs-todo.md`.
- Fixtures live in `tests/fixtures/` (project root) and each carries a unique text marker (e.g. `FIXTURE_LONG_BOOK_CH1`). Tests assert against markers, not brittle text blocks. Regenerate with `node scripts/make-fixtures.mjs` (or `bun scripts/make-fixtures.mjs`) after adding a fixture in `scripts/make-fixtures.mjs`.

U00 Test ID Requirements For App Code

---

Every user-interactive element in the runtime app MUST carry a `data-testid` attribute. This is a hard requirement for maintainability of the automated suite. When adding or changing interactive UI, add or update the `data-testid` and keep the page objects in sync.

Naming convention (kebab-case): `<feature>-<surface>-<type>-<name>`

- `feature`: the area, e.g. `reader`, `open-screen`, `settings`, `toast`, `busy`.
- `surface`: `screen`, `region`, `button`, `input`, `status`, `select`, `range`, `segment`.
- `name`: the specific control, e.g. `next`, `prev`, `theme`, `font-size`.

Examples already in the app:

```text
open-screen-button-open        settings-region-dialog
reader-button-next             settings-region-advanced
reader-button-prev             settings-button-advanced-toggle
reader-button-settings         toast-region
busy-region                    open-screen-status-notice
```

Settings controls are generated in `js/settings.js`; its `kebab()` helper maps each camelCase preference key to a `settings-<segment|select|range>-<kebab-key>` testid. The page object `settings.page.ts` mirrors that mapping, so a new preference gets a testid automatically as long as the generator convention holds.

Rules when changing the app:

```text
1. New interactive element  -> add a data-testid using the convention above.
2. New preference control    -> follow the js/settings.js kebab() pattern (testid is derived).
3. New fixture need          -> add it to scripts/make-fixtures.mjs, regenerate, record its marker in src/framework/support/fixtures.ts.
4. New user-facing behavior  -> add/extend a spec under the matching src/specs/<category>/ folder.
5. Never couple tests to app internals beyond data-testid, ARIA, and window.__einkReader.
6. Keep window.__einkReader read-only and free of book content.
```

If a test fails because of a genuine application bug (not a harness mismatch), record it in `bugs-todo.md` at the project root and keep the test in place (it documents the expected behavior).
