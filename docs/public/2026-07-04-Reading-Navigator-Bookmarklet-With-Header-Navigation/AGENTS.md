
2026-07-04

This is explicit directive that agent should use rather its own best judgment while implementing this app, adhering to the, being like a, making sure that we are implementing this bookmarklet app with a high quality. So, the agent, do not forget to use your best judgment in case can see when you're performing each of the tasks. This includes making decision what is enough, judging that the feature has been completed, judging the work that we should do and the work that we should not do, making judgment to resolve any inconsistencies or incoherencies or ambiguities inside our specification.
Do not automatically commit or push any changes to the repositrory. 
Never use git write commands. 


---

A00 Project Purpose

---

Reading Navigator is a bookmarklet-based reading assistant for long web pages. It helps a reader keep orientation inside article-like pages, documentation pages, essays, and reference pages by showing heading context, tracking approximate reading progress, and restoring the last meaningful reading position after reloads or interruptions.

The core problem is loss of reading context. Browser scroll position alone is not enough: it can be noisy, fragile after layout changes, and unrelated to where the reader last spent meaningful time. This project solves that by segmenting readable page content, tracking dwell time in the active reading area, classifying segments as unseen, seen, skimmed, probably read, active, or last focus, and providing a generic "Jump to last reading position" action.

This is a complete rewrite. The previous heading navigator bookmarklet is inspiration only. Do not treat the old implementation as code to patch. Rebuild the project with a new modular structure, new runtime architecture, and new build pipeline.

---

B00 Technology Stack

---

Use plain JavaScript only.

Use modern browser APIs where appropriate.

Use Bun for building and bundling.

Use Shadow DOM for runtime UI isolation.

Use CSS scoped to the injected bookmarklet UI.

Do not use frontend frameworks.

Do not add external runtime dependencies.

Do not add package dependencies unless explicitly approved.

Playwright is available on the system and may be used for exploratory browser testing. Treat it as a testing tool already available in the environment, not as an application dependency.

The distributed bookmarklet bundle should remain readable and unminified. Bundle modules together, but do not minify the release output unless explicitly requested later.

---

C00 Project Structure

---

Expected project layout:

```txt
.
├── AGENTS.md
├── suggestions.md
├── package.json
├── bun.lockb
├── src
│   ├── bookmarklet-entry.js
│   ├── main.js
│   ├── config.js
│   ├── app
│   │   ├── createApp.js
│   │   ├── lifecycle.js
│   │   ├── state.js
│   │   └── events.js
│   ├── identity
│   │   ├── pageIdentity.js
│   │   └── urlNormalize.js
│   ├── content
│   │   ├── contentRoot.js
│   │   ├── headingIndex.js
│   │   ├── segmenter.js
│   │   ├── anchors.js
│   │   └── fingerprint.js
│   ├── geometry
│   │   └── geometryCache.js
│   ├── tracking
│   │   ├── viewportSampler.js
│   │   ├── readingTracker.js
│   │   ├── stateClassifier.js
│   │   └── idleTracker.js
│   ├── restore
│   │   ├── restoreEngine.js
│   │   └── scrollToTarget.js
│   ├── storage
│   │   ├── progressStore.js
│   │   └── serialize.js
│   ├── ui
│   │   ├── shadowHost.js
│   │   ├── appShell.js
│   │   ├── statusBar.js
│   │   ├── restoreCard.js
│   │   ├── headingPanel.js
│   │   ├── minimapRail.js
│   │   ├── controlsPanel.js
│   │   ├── settingsPanel.js
│   │   ├── debugPanel.js
│   │   └── styles.css.js
│   ├── overlays
│   │   └── overlayMarkers.js
│   ├── scheduler
│   │   └── performanceScheduler.js
│   └── utils
│       ├── dom.js
│       ├── hash.js
│       ├── math.js
│       └── time.js
├── demo
│   └── demo-article.html
├── dist
│   ├── reading-navigator.bundle.js
│   ├── reading-navigator.loader-bookmarklet.txt
│   └── reading-navigator.inline-bookmarklet.txt
└── scripts
    └── build.js
````

The exact file list may evolve, but keep the same separation of concerns: identity, content detection, segmentation, geometry, tracking, restore, storage, UI, overlays, scheduling, and utilities.

---

D00 Build And Distribution

---

The source code lives in `src`.

The build output lives in `dist`.

Use Bun to bundle the JavaScript modules into browser-executable output.

The release bookmarklet must be generated from the bundled output, not manually assembled from copied source.

The bundled distribution code should be unminified and readable.

The build should generate at least these artifacts:

```txt
dist/reading-navigator.bundle.js
dist/reading-navigator.loader-bookmarklet.txt
dist/reading-navigator.inline-bookmarklet.txt
```

The loader bookmarklet may inject the bundled script from a known URL.

The inline bookmarklet may contain the bundled app directly.

The build script should report generated bookmarklet sizes.

---

E00 Runtime Architecture

---

The bookmarklet injects one self-contained application into the current page.

The app must detect if an instance already exists. It must not create duplicate panels or duplicate trackers.

The app UI must be hosted inside Shadow DOM.

The app must have a floating panel with expanded and compact modes.

Expanded mode should include current heading context, restore controls, tracking status, minimap, heading navigation, and settings.

Compact mode should show the minimum useful reading-progress UI, especially the minimap or rail.

The app must support heading navigation similar to the previous bookmarklet: scan headings, show current heading context, show nearby headings, and allow click-to-heading navigation.

The app must add reading tracking on top of heading navigation: readable root detection, segment creation, viewport sampling, active reading band, dwell-time accumulation, state classification, local progress persistence, and generic restore.

---

F00 Reading Tracking Requirements

---

Do not treat raw scroll position as the main restore target.

Track the last meaningful reading position based on focused dwell time inside the active reading band.

Use raw scroll position only as a fallback.

Segment the readable page into meaningful blocks such as headings, paragraphs, list items, blockquotes, code blocks, figures, and tables.

Classify segment state explicitly. Required states are `unseen`, `seen`, `skimmed`, `active`, `probably-read`, `reread`, `last-focus`, and `manual-mark`.

Use the phrase "probably read" for inferred reading state. Do not claim certainty.

The primary restore action must be generic: `Jump to last reading position`.

Do not include vendor-specific restore features or labels. The app must not mention a specific browser, text-to-speech tool, read-aloud implementation, or third-party product.

---

G00 Persistence And Privacy

---

Persist progress locally by normalized page identity.

Use localStorage for the first implementation.

Do not store full article text.

Do not store page HTML.

Do not store screenshots.

Do not send reading data to any server.

Use compact structural metadata, timestamps, segment statistics, and short hashes for restoration.

Support session-only mode when storage is unavailable or disabled.

Provide a control to clear progress for the current page.

Storage writes must be debounced. Do not write to localStorage on every sample.

---

H00 Performance Requirements

---

Performance is a core requirement.

Do not traverse the full DOM during normal tracking.

Do not run full segmentation on every scroll.

Do not call `getBoundingClientRect()` for all segments on every sample.

Do not rebuild the full UI on every sample.

Do not write localStorage on every sample.

Use cached geometry during normal tracking.

Use a moderate sampling interval, initially around 500 ms.

Pause or reduce tracking when the tab is hidden, the window is unfocused, the user is idle, or tracking is paused.

Use MutationObserver only as an invalidation signal. Do not rescan directly inside the observer callback.

Debounce mutation-based rescans.

Batch layout reads and DOM writes separately.

Use a scheduler module to coordinate sampling, rescans, UI updates, geometry refreshes, and storage saves.

---

I00 UI Requirements

---

The UI must be self-contained and must not leak styles into the host page.

Use `textContent` for page-derived text.

Do not inject page-derived content with `innerHTML`.

The panel must support close, pause, resume, save now, clear page progress, rescan, mark this spot, jump to last reading position, compact mode, and expanded mode.

The UI must show tracking status. Required statuses include tracking, paused, idle, hidden, unfocused, session only, saving, and saved.

The minimap must show unread, seen, skimmed, probably-read, active, last-focus, and manual mark states.

The restored target must be highlighted briefly after a jump.

Overlays must not alter page layout.

Overlays must not block text selection by default.

The UI must respect reduced-motion preferences.

---

J00 Testing And Validation

---

Use the local demo page for repeatable testing.

The demo page should include headings, paragraphs, lists, code blocks, tables, figures, long sections, and dynamic content.

Use Playwright for exploratory browser validation when helpful.

Playwright can load the demo page, inject or trigger the bookmarklet, inspect the Shadow DOM UI, scroll the page, reload the page, and verify that restore controls appear.

Testing should validate these cases:

```txt
- Bookmarklet starts without duplicate instances.
- Heading navigation works.
- Segments are created from readable content.
- Tracking updates segment state.
- Fast scrolling does not mark content as probably read.
- Idle, hidden, paused, and unfocused states do not accumulate dwell time.
- Progress is saved locally.
- Reload shows restore availability.
- Jump to last reading position works.
- Restored target is highlighted.
- Clear page progress works.
- Close removes UI, timers, observers, and overlays.
```

---

K00 Coding Rules

---

Keep code readable.

Use explicit names.

Prefer small modules with one clear responsibility.

Avoid hidden coupling between UI and tracking logic.

The tracker should not import UI modules.

The restore engine should not depend on panel implementation.

The UI should consume state snapshots or view models.

Centralize configuration in `src/config.js`.

Avoid magic numbers outside configuration.

Use defensive event handling.

Clean up every listener, observer, timer, and overlay on close.

Do not introduce external dependencies without approval.

Do not minify distribution output unless explicitly requested.

---

L00 Non-Goals

---

Do not build a browser extension.

Do not add a backend.

Do not add account login.

Do not implement cross-device sync.

Do not control third-party reading tools.

Do not store full page content.

Do not make the app vendor-specific.

Do not optimize by guessing. Add timing instrumentation first, then tune based on observed behavior.



---

M00 Appendix: Exploratory Testing With Playwright

---

At the final stage of development, use the Playwright installation already available on the system for exploratory browser testing.

Do not install Playwright automatically.

Do not add Playwright as a project dependency unless explicitly approved.

Before writing or running exploratory tests, check that Playwright is available. If Playwright cannot be found, stop the testing task and report that Playwright is unavailable.

Acceptable availability checks include commands such as:

```sh
node -e "console.log(require.resolve('playwright'))"
````

or another local-only check that does not install packages.

Do not use commands that may auto-install missing packages.

Create temporary exploratory test files inside the project folder under:

```txt
temp/
```

The `temp` folder is for local exploratory test code, screenshots, traces, and reports. Its contents must not be committed.

Add this file:

```txt
temp/.gitignore
```

with this content:

```gitignore
*
!.gitignore
```

Suggested temporary test layout:

```txt
temp/
├── .gitignore
├── exploratory-reading-navigator.spec.js
├── reports
│   └── exploratory-report.md
└── screenshots
    ├── RN-001-step-01-before-start.png
    ├── RN-001-step-02-after-start.png
    ├── RN-001-step-03-after-scroll.png
    └── RN-001-step-04-after-restore.png
```

Each exploratory test must be written as a sequence of explicit test steps. Every step must have a stable test ID and step ID.

Use IDs such as:

```txt
RN-001
RN-001-step-01
RN-001-step-02
RN-001-step-03
```

Each step must define:

| Field           | Requirement                                           |
| --------------- | ----------------------------------------------------- |
| Test ID         | Stable ID for the whole exploratory test.             |
| Step ID         | Stable ID for the step.                               |
| Purpose         | What the step is trying to validate.                  |
| Action          | What Playwright does.                                 |
| Expected result | What should be visible or true after the action.      |
| Screenshot path | Exact screenshot file path for the step.              |
| Actual result   | What was observed.                                    |
| Visual analysis | Detailed screenshot review.                           |
| Issues          | Any rendering, behavior, positioning, or UX problems. |

Every step must take a screenshot immediately after the action being tested.

The screenshot filename must include the test ID and step ID so the report can be correlated with the image without guessing.

Example screenshot naming:

```txt
temp/screenshots/RN-001-step-02-after-bookmarklet-start.png
```

The test report must be saved under:

```txt
temp/reports/
```

The report must reference each screenshot by relative path.

After every screenshot, perform a visual analysis. The analysis must not only confirm the specific element under test. It must also inspect the surrounding page and general rendering state.

For each screenshot, check:

| Area                | What to inspect                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Target feature      | Did the tested action produce the expected UI or behavior?                                      |
| Bookmarklet panel   | Is it visible, readable, correctly positioned, and not duplicated?                              |
| Page content        | Did the page remain readable and correctly laid out?                                            |
| Scroll position     | Did navigation or restore move to the intended location?                                        |
| Highlight or marker | Is the marker on the correct segment and not covering text badly?                               |
| Minimap             | Does it reflect the expected reading state?                                                     |
| Heading context     | Does the current heading or nearby heading display match the page position?                     |
| Overlays            | Are overlays subtle, non-blocking, and correctly removed when needed?                           |
| Unrelated rendering | Did any unrelated page area break, shift unexpectedly, or become obscured?                      |
| Errors              | Are there console errors, uncaught exceptions, failed resource loads, or visible broken states? |

The test report should use a table like this for each step:

```md
| Step ID | Action | Expected | Screenshot | Visual analysis | Issues |
|---|---|---|---|---|---|
| RN-001-step-02 | Trigger bookmarklet | Panel appears once with heading context | temp/screenshots/RN-001-step-02-after-bookmarklet-start.png | Panel is visible, Shadow DOM UI appears isolated, page content remains readable, no duplicate panel observed. | None |
```

If a screenshot shows a problem, record it explicitly with severity.

Suggested severity labels:

| Severity    | Meaning                                                            |
| ----------- | ------------------------------------------------------------------ |
| Blocker     | Prevents core testing or core use.                                 |
| Major       | Feature works incorrectly or causes serious UX/rendering problems. |
| Minor       | Cosmetic or non-blocking issue.                                    |
| Observation | Not necessarily wrong, but worth reviewing.                        |

Exploratory tests should cover at least these final validation paths:

```txt
- Start bookmarklet on demo page.
- Confirm no duplicate instance on repeated trigger.
- Confirm heading navigator appears and current context is plausible.
- Scroll slowly and confirm tracking state changes.
- Scroll quickly and confirm content is not incorrectly marked probably read.
- Mark current spot.
- Save progress.
- Reload page.
- Confirm restore card appears.
- Jump to last reading position.
- Confirm restored target is correct or clearly approximate.
- Confirm restored target highlight is visible and non-blocking.
- Clear page progress.
- Close bookmarklet and confirm UI, overlays, timers, and observers are removed.
```

Playwright tests in `temp` are exploratory, not permanent project tests. They may be rewritten freely during development. Important findings should be moved from the temporary report into project issues, implementation notes, or the main design note if they affect product decisions.
