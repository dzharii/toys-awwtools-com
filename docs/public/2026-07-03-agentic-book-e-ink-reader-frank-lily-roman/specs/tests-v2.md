---

A00 UI Regression Gap Closure Specification

---

This document defines the next implementation pass for the E Ink Reader UI regression suite.

The current suite already exists under `ui-regression-test-suite/`. It is a Bun, TypeScript, and Playwright development-only test project. It is explicitly not a runtime dependency of the static app. It tests the app through the rendered DOM, `data-testid` attributes, ARIA roles, and a read-only `window.__einkReader` inspection handle. It does not import application source modules. The suite also uses a Standard Post-Action Oracle that checks global invariants such as no page errors, no stuck overlays, valid reader state, no horizontal overflow, only the preference key in storage, no book-content persistence, and no unexpected network requests.

The current suite reports 92 passing automated tests and no confirmed application bugs. The existing `bugs-todo.md` records only two non-bug observations: reset clears the preference key instead of persisting defaults, and the `links.md` fixture marker exists inside a URL rather than visible text.

This specification does not replace the existing suite. It extends it. The agent must keep the current architecture, current page-object approach, current fixture-marker strategy, and current Standard Post-Action Oracle. The goal is to close the missing coverage areas identified in the previous review: boundary-class settings coverage, broader pairwise coverage, metadata and RSS validation, responsive settings behavior, full keyboard shortcut behavior, resilience tests, richer Roman developer-note fixtures, Markdown line-number verification, and journey-level surrounding-state validation.

The main directive is correctness of the application. Passing tests are useful only when they prove correct user-facing behavior. If a test fails, the agent must determine whether the application is wrong, the test is wrong, the fixture is wrong, the selector is wrong, or timing is unstable. Do not blindly modify tests to make them pass. Do not blindly modify product code only to satisfy a weak test. Use best judgment. The correct, usable, stable, privacy-preserving application is the goal. The test suite is a tool to reach that goal.

---

B00 Implementation Files To Add Or Modify

---

The agent should add or modify these test-suite files. Exact filenames may vary only if the resulting structure is clearer and remains consistent with the existing suite layout.

```text
ui-regression-test-suite/src/specs/metadata/metadata.spec.ts
ui-regression-test-suite/src/specs/rss/rss.spec.ts
ui-regression-test-suite/src/specs/settings/settings-boundary.spec.ts
ui-regression-test-suite/src/specs/pairwise/pairwise-expanded.spec.ts
ui-regression-test-suite/src/specs/responsive/settings-responsive.spec.ts
ui-regression-test-suite/src/specs/navigation/keyboard-shortcuts.spec.ts
ui-regression-test-suite/src/specs/accessibility/focus-and-shortcuts.spec.ts
ui-regression-test-suite/src/specs/files/dragdrop-and-large-files.spec.ts
ui-regression-test-suite/src/specs/txt/txt-structure.spec.ts
ui-regression-test-suite/src/specs/markdown/markdown-structure.spec.ts
ui-regression-test-suite/src/specs/markdown/markdown-links.spec.ts
ui-regression-test-suite/src/specs/markdown/markdown-code-line-numbers.spec.ts
ui-regression-test-suite/src/specs/privacy/storage-surfaces.spec.ts
ui-regression-test-suite/src/specs/offline/offline-runtime.spec.ts
ui-regression-test-suite/src/specs/resilience/missing-assets.spec.ts
ui-regression-test-suite/src/specs/journeys/journey-unsafe-markdown.spec.ts
ui-regression-test-suite/src/specs/journeys/journey-reduced-motion.spec.ts
ui-regression-test-suite/src/specs/journeys/journey-corrupted-preferences.spec.ts
ui-regression-test-suite/src/specs/journeys/journey-rapid-interaction.spec.ts
ui-regression-test-suite/src/specs/journeys/journey-roman-developer-notes.spec.ts
ui-regression-test-suite/src/framework/support/baseline.ts
ui-regression-test-suite/src/framework/support/adaptive-baseline.ts
ui-regression-test-suite/src/framework/support/pairwise.ts
ui-regression-test-suite/src/framework/support/markdown-assertions.ts
ui-regression-test-suite/src/framework/support/line-number-assertions.ts
ui-regression-test-suite/src/framework/support/metadata-assertions.ts
ui-regression-test-suite/src/framework/support/rss-assertions.ts
```

Update `ui-regression-test-suite/package.json` with category scripts for new categories if needed. The existing package already exposes category scripts for the main suite groups and `validate` runs typecheck plus the full Playwright suite.

Suggested additional scripts:

```json
{
  "test:metadata": "playwright test src/specs/metadata",
  "test:rss": "playwright test src/specs/rss",
  "test:offline": "playwright test src/specs/offline",
  "test:resilience": "playwright test src/specs/resilience"
}
```

If these scripts are added, update the suite README and AGENTS testing section.

---

C00 Test-Correctness Directive

---

The agent must repeat this operating principle during the implementation pass: the product must be correct, not merely test-green.

When a test fails, classify the failure before changing anything.

Use this classification:

```text
APP_BUG
The app violates the specification, user journey, privacy model, accessibility expectation, or visible behavior contract. Fix the app. Keep or strengthen the test.

TEST_BUG
The test asserts something the product does not promise, uses the wrong locator, waits incorrectly, or uses an invalid fixture. Fix the test.

HARNESS_TIMING
The behavior is correct but the test observes too early, races pagination, races font loading, or races E Ink transition cleanup. Improve waiting through app readiness, stable DOM state, or the existing oracle. Do not add arbitrary sleeps unless no better synchronization exists and the reason is documented.

PRODUCT_DECISION
The expected behavior is ambiguous. Use the specs, persona documents, current implementation, and best judgment. If a product decision is needed, document it in the test name, fixture note, or `bugs-todo.md` as an observation.

VISUAL_MANUAL_ONLY
The behavior is aesthetic and cannot be reliably asserted by DOM state. Keep the automated test to mechanical invariants and record manual review requirements.
```

If the app is incorrect, fix the app. If the test is incorrect, fix the test. If both are weak, improve both. Do not adapt the application into a worse architecture just to make a fragile test pass. Small application refactors are acceptable when they make the app more deterministic, more observable, more accessible, or more stable for real users. The app must not expose book content or internal mutable state merely for test convenience.

The agent must run targeted tests while developing and then run the full suite often. Run `bun run typecheck` after framework changes. Run the relevant category after adding each spec. Run `bun run validate` before considering the pass complete. If flakiness appears, isolate it, reproduce it, classify it, and fix the real cause.

---

D00 Surrounding-State Baseline Requirement

---

Every new UI regression test must verify not only the direct feature under test but also the surrounding application state.

Create a baseline helper in:

```text
ui-regression-test-suite/src/framework/support/baseline.ts
```

The helper should capture a stable state snapshot before an action and compare it after the action. The baseline must be adaptive. It must understand which fields are allowed to change for the action being tested and which fields must remain stable.

Suggested API:

```ts
type BaselineScope =
  | "global"
  | "open-screen"
  | "reader"
  | "settings"
  | "navigation"
  | "layout"
  | "storage"
  | "network"
  | "accessibility"
  | "content"
  | "eink";

type ExpectedChange =
  | "file-open"
  | "file-replace"
  | "file-reject"
  | "mode-change"
  | "setting-change"
  | "theme-change"
  | "font-change"
  | "page-turn"
  | "scroll"
  | "reload"
  | "viewport-change"
  | "error-recovery"
  | "metadata-read"
  | "rss-read"
  | "no-user-visible-change";

interface UiBaseline {
  url: string;
  viewport: { width: number; height: number };
  openScreenVisible: boolean;
  readerVisible: boolean;
  settingsVisible: boolean;
  busyVisible: boolean;
  toastText: string | null;
  readerMode: string | null;
  theme: string | null;
  contrast: string | null;
  eink: string | null;
  motion: string | null;
  titleText: string | null;
  progressText: string | null;
  contentMarkerVisible: boolean;
  readerBox: Rect | null;
  contentBox: Rect | null;
  bodyHasHorizontalOverflow: boolean;
  activeElementSummary: string | null;
  storageKeys: string[];
  storageContainsFixtureMarkers: boolean;
  externalNetworkCount: number;
  consoleErrorCount: number;
  pageErrorCount: number;
}
```

The comparison helper should accept an expected-change profile:

```ts
await baseline.expectAfter(actionName, {
  allowedChanges: ["readerMode", "progressText", "contentBox"],
  requiredStable: ["storage", "network", "noHorizontalOverflow", "noStuckOverlay"],
});
```

The agent may choose a cleaner API. The required behavior is what matters.

---

E00 Surrounding-State Items To Always Check

---

These checks must be part of the surrounding baseline or the Standard Post-Action Oracle. If a new test does not use the baseline helper, it must still explicitly check these items.

| Surrounding item | Required check                                                                      |
| ---------------- | ----------------------------------------------------------------------------------- |
| Browser health   | No uncaught page errors and no unexpected console errors.                           |
| Network          | No unexpected external runtime requests.                                            |
| Storage          | Only allowed preference storage exists; no fixture markers or book content persist. |
| Screen state     | Open screen and reader are not both visible.                                        |
| Busy state       | Busy overlay is not stuck after the action settles.                                 |
| E Ink state      | E Ink overlay is not stuck. Ghost overlay is not unreadably persistent.             |
| Settings state   | Settings open or closed state matches expectation.                                  |
| Reader mode      | Mode is valid and matches visible surface.                                          |
| Theme            | Theme value is valid and text remains visible.                                      |
| E Ink intensity  | Intensity value is valid and mechanics match broad expectation.                     |
| Motion           | Motion value is valid and reduced-motion mechanics are respected.                   |
| Content          | Expected fixture marker or expected empty/rejection state is visible.               |
| Layout           | Reader and content boxes have positive dimensions.                                  |
| Overflow         | Body-level horizontal overflow is absent.                                           |
| Progress         | Progress exists when expected and remains sane after navigation.                    |
| Focus            | Focus remains reachable and does not disappear after dialogs or keyboard actions.   |
| Recovery         | After an expected error, user can choose another file or continue reading.          |

For setting-change tests, the baseline must also check that unrelated user-facing state did not regress. Example: changing line height must not change theme, mode, E Ink setting, file title, storage privacy, or network behavior. It may change page count and content box height.

For file-replacement tests, the old fixture marker must disappear, the new fixture marker must appear, and storage must not contain either marker.

For viewport-change tests, dimensions may change, page count may change, and responsive layout may change. But the current document must remain readable, mode must remain valid, storage must remain clean, and settings must remain usable.

---

F00 Adaptive Baseline Profiles

---

Implement reusable expected-change profiles.

| Profile           | Allowed to change                                                                                   | Must remain stable                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `file-open`       | open screen visibility, reader visibility, title, content, progress, mode surface, E Ink transition | storage privacy, network, no errors, no horizontal overflow                          |
| `file-reject`     | notice text, toast or status, focus, possibly current reader if file rejected while reader is open  | previous loaded document remains readable if applicable, storage privacy, no network |
| `setting-change`  | affected CSS variable, page count, content box, progress, E Ink full refresh                        | document marker, storage privacy, network, mode unless setting is mode               |
| `mode-change`     | mode, visible content mount, progress, scroll/page state                                            | document marker, title, storage privacy, no network                                  |
| `page-turn`       | progress, visible content, E Ink partial refresh                                                    | title, settings, storage, network, valid mode                                        |
| `scroll`          | scroll position, maybe progress                                                                     | content marker, settings, storage, network, no E Ink heavy flashing                  |
| `viewport-change` | dimensions, pagination, maybe page count, settings panel layout                                     | content marker, storage, network, no overflow                                        |
| `reload`          | open screen visible, reader hidden, preferences restored                                            | book content not restored, no markers in storage                                     |
| `error-recovery`  | notice text and available actions                                                                   | app remains usable, no raw stack trace, no storage leak                              |
| `metadata-read`   | no app state should change                                                                          | all runtime state stable                                                             |
| `rss-read`        | no app state should change                                                                          | XML parse result valid, runtime app unaffected                                       |

These profiles should live in `adaptive-baseline.ts`. Every new test must choose one profile. If a test needs a custom profile, define it explicitly in the test with a short reason.

---

G00 Metadata Test Specification

---

Add `src/specs/metadata/metadata.spec.ts`.

The current project requires static metadata in the HTML head. The uploaded source shows title, description, canonical URL, RSS discovery, Open Graph tags, and X/Twitter tags already present in `index.html`. The suite must protect these from regression.

Test META001: primary metadata exists.

Steps:

```text
Open the app root.
Read document.title.
Read meta[name="description"].
Read link[rel="canonical"].
Run metadata-read baseline profile.
```

Expected result:

```text
Title is "E Ink Reader - Local TXT and Markdown Reading".
Description contains local TXT and Markdown, calm E Ink-style browser reader, page mode, scroll mode, local fonts, and no uploads.
Canonical URL is absolute and uses the deployed base URL.
No app runtime state changes.
```

Test META002: RSS discovery exists.

Steps:

```text
Open the app root.
Read link[rel="alternate"][type="application/rss+xml"].
```

Expected result:

```text
RSS discovery link exists.
Title is "E Ink Reader Updates".
Href points to feed.xml under the deployed base URL.
```

Test META003: Open Graph tags are complete.

Steps:

```text
Open the app root.
Read og:type, og:site_name, og:title, og:description, og:url, og:image, og:image:secure_url, og:image:type, og:image:width, og:image:height, og:image:alt, og:locale.
```

Expected result:

```text
All required tags exist.
og:type is website.
og:title matches product title.
og:description matches or is semantically equal to meta description.
og:image points to assets/social/social_logo_1200x630.jpg.
og:image:type is image/jpeg.
Width is 1200.
Height is 630.
Alt text describes the E Ink Reader preview.
```

Test META004: X/Twitter card tags are complete.

Steps:

```text
Open the app root.
Read twitter:card, twitter:title, twitter:description, twitter:image, twitter:image:alt.
```

Expected result:

```text
Card is summary_large_image.
Title and description match product promise.
Image URL is absolute.
Alt text exists.
```

Test META005: social image exists and dimensions match tags.

Steps:

```text
Resolve social image URL to local project asset path.
Load the image through the static server.
Use browser image naturalWidth and naturalHeight or Node image metadata.
```

Expected result:

```text
Image exists.
Image is 1200 by 630.
MIME type is JPEG or compatible with og:image:type.
```

If the server does not expose image metadata cleanly, implement a small test helper that reads the file from disk inside the test suite. This is acceptable because this is not app-source coupling; it validates a static asset contract.

---

H00 RSS Test Specification

---

Add `src/specs/rss/rss.spec.ts`.

The project requires `feed.xml`, RSS 2.0, user-oriented update items, and a static HTML head link. The AGENTS appendix states that every item must have `title`, `link`, `guid`, `pubDate`, and `description`, and the channel must have `title`, `link`, `description`, `language`, and `lastBuildDate`.

Test RSS001: feed exists and is valid XML.

Steps:

```text
Request /feed.xml from the static server.
Parse response text as XML in the browser or test process.
Check parser errors.
```

Expected result:

```text
HTTP status is 200.
XML parses without parsererror.
Root element is rss.
rss version is 2.0.
```

Test RSS002: channel metadata is complete.

Steps:

```text
Parse feed.xml.
Read channel title, link, description, language, lastBuildDate, generator if present.
```

Expected result:

```text
Title is "E Ink Reader Updates".
Link is the deployed product URL.
Description describes high-level updates for the local E Ink-style TXT and Markdown reader.
Language exists and is en-us or equivalent.
lastBuildDate exists and parses as a valid RFC 822-like date.
```

Test RSS003: each item has required fields.

Steps:

```text
Loop over every item.
Read title, link, guid, pubDate, description.
```

Expected result:

```text
No item is missing a required field.
guid is stable and non-empty.
pubDate parses as a date.
description is non-empty.
```

Test RSS004: items are user-oriented, not commit-style.

Steps:

```text
Inspect item descriptions with simple heuristics.
Reject descriptions that are too short, vague, or purely internal.
```

Expected result:

```text
Descriptions explain what changed and why it matters to a reader.
Descriptions do not contain only phrases like "fixed bugs", "refactor", "updated CSS", or "changed code".
```

This test should be conservative. It should catch clearly bad feed items, not enforce a rigid marketing style.

Test RSS005: feed item claims do not exceed implementation.

Steps:

```text
For each item, scan title and description for key feature claims.
For claims in the current product contract, verify the corresponding known feature exists or is covered by existing tests.
```

Expected result:

```text
No feed item claims unsupported formats, cloud sync, annotation, search index, PDF support, or automatic book restore.
```

---

I00 File Input Gap Tests

---

Add `src/specs/files/dragdrop-and-large-files.spec.ts` or extend the existing files suite.

Test FILE010: unsupported PDF directly from open screen.

Steps:

```text
Open fresh app.
Use file picker to open unsupported.pdf.
```

Expected result:

```text
Open screen remains usable.
Unsupported file message appears.
Reader does not open.
No blank screen.
No raw stack trace.
Run error-recovery baseline.
```

Test FILE011: Markdown drag-and-drop.

Steps:

```text
Open fresh app.
Drag standard-markdown.md onto the drop zone.
```

Expected result:

```text
Reader opens.
Markdown marker is visible.
Normal Markdown renders as HTML.
Run file-open baseline.
```

Test FILE012: `.markdown` drag-and-drop.

Steps:

```text
Open fresh app.
Drag standard-markdown.markdown or equivalent fixture.
```

Expected result:

```text
Reader opens.
Content marker visible.
File is treated as Markdown.
```

Test FILE013: large accepted file.

Steps:

```text
Open fresh app.
Open large-accepted.md.
Observe busy or warning state if present.
Wait for reader ready.
```

Expected result:

```text
The app does not freeze.
Reader eventually appears, or the app offers a safe scroll-mode fallback.
No stuck busy overlay.
No storage leak.
If the app has a large-file warning, assert the warning copy.
```

Test FILE014: file replacement after bad drop.

Steps:

```text
Load simple-prose.txt.
Drop unsupported.pdf while reader is open.
Then open standard-markdown.md.
```

Expected result:

```text
Unsupported file is rejected without destroying the current reader.
Then the valid Markdown file replaces the old content.
Old marker disappears.
New marker appears.
Storage remains clean.
```

Test FILE015: multi-file drop while reader is open.

Steps:

```text
Load standard-markdown.md.
Drop two files together.
```

Expected result:

```text
App rejects multi-file drop.
Current document remains readable.
Reader state remains valid.
```

The existing suite already covers some file cases, but these tests close the PDF, Markdown drag-and-drop, and large-file gaps.

---

J00 TXT Structure Tests

---

Add `src/specs/txt/txt-structure.spec.ts`.

Test TXT008: paragraph element structure.

Steps:

```text
Open simple-prose.txt.
Inspect rendered content paragraphs.
Count visible paragraph-like blocks.
Verify fixture title and paragraph markers appear in separate blocks.
```

Expected result:

```text
Plain text is not rendered as one giant paragraph.
Blank lines create readable separation.
Paragraph blocks have non-zero vertical spacing.
```

Test TXT009: command-output-like section.

Create fixture:

```text
tests/fixtures/txt-command-output.txt
```

Fixture should include:

```text
FIXTURE_TXT_COMMAND_OUTPUT

DEPLOYMENT CHECK

$ bun run validate
typecheck: ok
tests: ok
network: 0 external requests

Indented note:
    The reader should preserve this indentation enough
    that old technical notes remain understandable.
```

Steps:

```text
Open txt-command-output.txt.
Inspect visible command output.
```

Expected result:

```text
Content is readable.
Command-like lines are not collapsed into a single unreadable paragraph.
Indentation is either preserved or safely represented.
No body-level horizontal overflow.
```

Test TXT010: paragraph spacing after theme and font change.

Steps:

```text
Open simple-prose.txt.
Capture paragraph count and content marker.
Change theme.
Change font.
```

Expected result:

```text
Paragraph structure remains intact.
Spacing remains positive.
No paragraph blocks overlap.
```

---

K00 Markdown Structure Tests

---

Add `src/specs/markdown/markdown-structure.spec.ts`.

Test MD016: horizontal rule rendering.

Steps:

```text
Open standard-markdown.md.
Find rendered hr element or equivalent separator near fixture marker.
```

Expected result:

```text
Horizontal rule exists.
It is visible.
It does not exceed content width.
```

Test MD017: inline code rendering.

Steps:

```text
Open standard-markdown.md.
Find inline code elements.
```

Expected result:

```text
At least one inline code element exists.
It has text content matching fixture marker or expected inline code.
It is not styled like a block code element.
```

Test MD018: blockquote structure.

Steps:

```text
Open standard-markdown.md.
Find blockquote element.
```

Expected result:

```text
Blockquote exists.
Text is visible.
Blockquote is contained in content measure.
```

Test MD019: list structure.

Steps:

```text
Open standard-markdown.md.
Find ul and ol elements.
```

Expected result:

```text
Lists render as lists.
List items are visible.
Nested spacing does not cause overflow.
```

Test MD020: table containment after settings change.

Steps:

```text
Open markdown-table.md.
Set font size max.
Set measure min.
Set mobile viewport.
```

Expected result:

```text
Table remains contained.
If table scrolls internally, body still does not horizontally overflow.
Run setting-change and viewport-change baselines.
```

---

L00 Markdown Link Tests

---

Add `src/specs/markdown/markdown-links.spec.ts`.

Test LINK001: external links have safe attributes.

Steps:

```text
Open links.md.
Locate external link.
Read href, target, rel.
```

Expected result:

```text
Href points to expected URL.
Link does not auto-fetch.
If target is _blank, rel includes noopener or noreferrer.
If target is not _blank, clicking must not replace the reader unexpectedly.
```

Test LINK002: clicking external link is intentional.

Steps:

```text
Open links.md.
Register popup listener and navigation listener.
Click external link.
```

Expected result:

```text
Either a new page opens intentionally with safe behavior, or the app prevents same-tab destructive navigation by design.
Reader page remains available after the action.
No unexpected prefetch occurs before the click.
```

If the current product opens same-tab links intentionally, the agent must evaluate whether this violates the Roman requirement that accidental link taps should not throw the user out of the reader. If it is an application bug, fix the app. If it is a product decision, document it.

Test LINK003: malformed and javascript-like links are safe.

Steps:

```text
Open links.md and unsafe-markdown.md.
Locate malformed or javascript-like links if rendered.
```

Expected result:

```text
javascript: links are removed, neutralized, or rendered as safe text.
No script execution.
No navigation to javascript URL.
```

---

M00 Markdown Code Line Number Requirement

---

The Roman-focused test pass now requires code block line-number verification.

If the current app does not render line numbers, this is a product gap, not merely a test gap. Roman's use case includes code-heavy Markdown and developer notes. The social preview and Roman scenario repeatedly emphasize code snippets. The new test specification requires line numbers for fenced code blocks used in developer-note fixtures.

The agent must first inspect the current application behavior. If code blocks currently do not have line numbers, make a product decision:

```text
Preferred decision:
Add line numbers for fenced code blocks in Markdown rendering.

Acceptable alternate decision:
If line numbers are intentionally out of scope, document that decision, adjust this section, and add tests that verify code block structure without line numbers. This alternate should be chosen only if adding line numbers harms readability or creates excessive implementation risk.

Do not fake line numbers only in tests.
Do not assert line numbers if the app does not actually render them.
```

If line numbers are added, implement them in a way that does not copy code content into persistent storage and does not break code selection more than necessary.

Add page object support:

```text
ui-regression-test-suite/src/page-objects/code-block.page.ts
```

Suggested page object responsibilities:

```text
Find all code blocks inside the reader content.
Return code block count.
Return visible code text for a block.
Return line number texts for a block.
Return line count from rendered code.
Assert line numbers are sequential.
Assert line number count equals rendered code line count.
Assert code block is contained inside the reader content box.
Assert code block does not create body horizontal overflow.
```

Test CODE001: line numbers render for JavaScript block.

Fixture: `roman-leetcode-binary-search.md`.

Expected result:

```text
At least one JavaScript fenced code block exists.
Line numbers 1 through N are visible.
The first line number is 1.
The last line number equals the number of code lines.
Code text still preserves indentation.
```

Test CODE002: line numbers render for Python block.

Fixture: `roman-leetcode-sliding-window.md`.

Expected result:

```text
Python code block has sequential line numbers.
Blank lines are counted consistently.
Indentation remains readable.
```

Test CODE003: multiple code blocks line numbers restart per block.

Fixture: `roman-debugging-javascript.md`.

Expected result:

```text
First code block line numbers start at 1.
Second code block line numbers start at 1.
Line numbers do not continue across separate blocks unless the product explicitly chooses continuous numbering and documents it.
```

Test CODE004: mobile line-number containment.

Fixture: `roman-system-design-rate-limit.md`.

Steps:

```text
Set mobile narrow viewport.
Open fixture.
Switch to scroll mode.
Find all code blocks.
```

Expected result:

```text
Line numbers remain visible or accessible.
Code block body remains contained.
The page does not horizontally overflow.
Line-number gutter does not consume excessive width.
```

Test CODE005: theme compatibility.

Steps:

```text
Open roman-leetcode-binary-search.md.
Switch to high contrast.
Switch to dark theme.
```

Expected result:

```text
Line numbers remain readable in both themes.
Line-number contrast is sufficient relative to code background.
```

---

N00 Roman Developer Note Fixtures

---

Add a richer Roman fixture set to `scripts/make-fixtures.mjs`, regenerate `tests/fixtures/`, and record markers in `src/framework/support/fixtures.ts`.

The purpose is to simulate realistic developer notes rather than generic Markdown. These files should be used by Roman journey tests, code-block tests, mobile responsive tests, privacy tests, and Markdown structure tests.

Fixture file:

```text
tests/fixtures/roman-leetcode-binary-search.md
```

Suggested content:

````md
# Rotated Binary Search Notes
FIXTURE_ROMAN_BINARY_SEARCH_TITLE

Problem: Search in Rotated Sorted Array
Source: https://leetcode.com/problems/search-in-rotated-sorted-array/

## Why this matters

Binary search is easy to remember in the abstract and easy to break in practice.
The useful question is not "is the array sorted?".
The useful question is "which half is sorted right now?"

## JavaScript solution

```js
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}
````

## Complexity

| Case    |     Time | Space |
| ------- | -------: | ----: |
| Average | O(log n) |  O(1) |
| Worst   | O(log n) |  O(1) |

## Mistakes I made

* I forgot that equality on the left sorted half matters.
* I moved both pointers in one branch and skipped the target.
* I tested only arrays without duplicates.

> The point of the pattern is to keep one invariant alive.

````

Expected code line count for the JavaScript block: 27 if blank lines are counted as rendered lines. The agent must verify the exact count after fixture generation and update the test expectation. The test must not guess.

Fixture file:

```text
tests/fixtures/roman-leetcode-sliding-window.md
````

Suggested content:

````md
# Sliding Window Field Notes
FIXTURE_ROMAN_SLIDING_WINDOW_TITLE

Roman uses this note when he wants to remember whether a window should expand,
shrink, or reset.

## Pattern

1. Move the right pointer.
2. Add the new item into window state.
3. Shrink while the invariant is broken.
4. Record the answer only after the invariant is valid.

## Python example

```py
def length_of_longest_substring(text: str) -> int:
    seen: dict[str, int] = {}
    left = 0
    best = 0

    for right, char in enumerate(text):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1

        seen[char] = right
        best = max(best, right - left + 1)

    return best
````

## Debug questions

* What is the invariant?
* Which side of the window moves?
* Does the answer update before or after shrinking?
* What happens when the input is empty?

Inline reminder: `left` never moves backward.

````

Expected code line count: 14 if blank lines are counted. Verify after generation.

Fixture file:

```text
tests/fixtures/roman-debugging-javascript.md
````

Suggested content:

````md
# JavaScript Debugging Notes
FIXTURE_ROMAN_JS_DEBUG_TITLE

These are small reminders for production debugging. They are not a tutorial.
They are notes Roman wants to reread on a phone.

## Event loop checkpoint

```js
console.log("A");

queueMicrotask(() => {
  console.log("B");
});

setTimeout(() => {
  console.log("C");
}, 0);

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");
````

Expected order:

```text
A
E
B
D
C
```

## Fetch failure shape

```js
async function loadJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

## Notes

* Network failure rejects the promise.
* HTTP 500 does not reject by itself.
* `response.ok` is the part I always forget.

````

Expected behavior:

```text
There are at least three code blocks.
Line numbers restart for each fenced block.
Text code fence and JavaScript code fence both render safely.
No code block persists to localStorage.
````

Fixture file:

```text
tests/fixtures/roman-system-design-rate-limit.md
```

Suggested content:

````md
# Rate Limiter Notes
FIXTURE_ROMAN_RATE_LIMIT_TITLE

This note is for train reading. It must work on mobile.

## Token bucket idea

A bucket has capacity. Tokens refill over time. A request consumes one token.
If no token is available, reject or delay the request.

## Pseudocode

```txt
state:
  capacity = 100
  tokens = 100
  refill_rate = 10 tokens per second
  last_refill = now

on_request(user_id):
  elapsed = now - last_refill
  tokens = min(capacity, tokens + elapsed * refill_rate)
  last_refill = now

  if tokens >= 1:
    tokens = tokens - 1
    allow request
  else:
    reject request
````

## Trade-offs

| Approach       | Good for        | Risk            |
| -------------- | --------------- | --------------- |
| Fixed window   | simple counters | boundary bursts |
| Sliding window | smoother limits | more storage    |
| Token bucket   | burst tolerant  | clock bugs      |
| Leaky bucket   | steady output   | queue pressure  |

## Link reminders

* RFC 6585 status 429: https://www.rfc-editor.org/rfc/rfc6585
* Redis sorted sets are useful, but do not make the reader fetch anything.

````

Expected behavior:

```text
Mobile scroll mode remains stable.
Table remains contained.
Pseudocode line numbers render correctly if line numbers are implemented.
Remote link does not prefetch.
````

Fixture file:

```text
tests/fixtures/roman-mixed-quotes-and-code.md
```

Suggested content:

````md
# Quotes, Jokes, And Small Code
FIXTURE_ROMAN_MIXED_NOTES_TITLE

> "Programs must be written for people to read."
> Then, only incidentally, for machines to execute.

Roman writes small jokes in the same file as serious notes.

## Small shell reminder

```sh
git log --oneline --decorate --graph -12
git diff --stat main...HEAD
````

## Tiny JSON shape

```json
{
  "reader": "e-ink",
  "mode": "local",
  "storesBookContent": false
}
```

## Reminder

* Do not turn the reader into a note database.
* Do not store my snippets.
* Do not break my code blocks on mobile.

````

Expected behavior:

```text
Blockquotes render.
Shell and JSON fences render.
Line numbers restart per block if implemented.
Privacy tests must verify these markers and snippets are not stored.
````

---

O00 Settings Boundary Test Specification

---

Add `src/specs/settings/settings-boundary.spec.ts`.

The current suite covers some settings, but boundary coverage is too narrow. The existing preference contract includes font size, line height, measure, paragraph spacing, texture strength, margin, font family, theme, contrast, E Ink intensity, motion, mode, and refresh style. The previous source snapshot shows validated numeric ranges such as fontSize, lineHeight, measure, paraSpacing, textureStrength, and margin. The agent must confirm current ranges in `src/config/suite-config.ts` or the product contract before writing assertions.

Use data-driven tests. Each row must describe setting name, value, expected effect, allowed changes, and baseline profile.

Test SETB001: font size classes.

Values:

```text
minimum valid
default
maximum valid
below minimum injected through storage
above maximum injected through storage
```

Expected result:

```text
Valid values apply.
Invalid injected values clamp or reset.
Reader remains readable.
Page count remains valid.
No layout overflow.
```

Test SETB002: line height classes.

Values:

```text
minimum valid
default
maximum valid
below minimum injected
above maximum injected
```

Expected result:

```text
Line height changes visibly through computed style.
No clipped text.
No overlap.
Invalid values do not produce invalid CSS.
```

Test SETB003: measure classes.

Values:

```text
minimum valid
default
maximum valid
invalid tiny
invalid huge
```

Expected result:

```text
Reader column changes width.
Desktop remains centered.
Mobile has no horizontal overflow.
Invalid values clamp or reset.
```

Test SETB004: paragraph spacing classes.

Expected result:

```text
Paragraph spacing changes.
Paragraph blocks remain separated.
No negative margin collapse.
No overlap.
```

Test SETB005: margin classes.

Expected result:

```text
Margins change.
Content remains inside page.
Mobile does not lose all usable width.
Invalid negative margin is rejected or clamped.
```

Test SETB006: texture strength classes.

Expected result:

```text
Texture CSS variable changes.
Texture off leaves readable plain paper.
Texture max does not make text unreadable.
```

Test SETB007: contrast classes.

Expected result:

```text
Soft and normal contrast apply.
Text remains visible in every theme.
Invalid contrast resets to a valid value.
```

Test SETB008: alignment classes.

Expected result:

```text
Left and justify apply if both are supported.
Code blocks remain unaffected by text justification.
Invalid alignment resets.
```

Test SETB009: motion classes.

Expected result:

```text
system, reduced, and full apply.
Reduced disables aggressive E Ink mechanics.
Invalid motion resets.
```

Test SETB010: show progress on/off.

Expected result:

```text
Progress hides when off if product supports hiding.
Navigation remains usable.
Progress returns when on.
Invalid value resets.
```

Test SETB011: full refresh interval and ghosting if exposed.

Expected result:

```text
Changing interval or ghosting changes expected E Ink mechanics.
Values clamp safely.
Text remains readable.
```

If a setting exists in product code but not in settings UI, decide whether it should be tested through stored preferences or treated as internal. Do not expose hidden settings solely for tests unless the product benefits from doing so.

---

P00 Expanded Pairwise Test Specification

---

Add `src/specs/pairwise/pairwise-expanded.spec.ts`.

The existing pairwise suite has six combinations across mode, theme, E Ink intensity, and font. That is useful but not enough. The new suite must cover broader interactions.

Use factors:

```text
Fixture type: simple TXT, standard Markdown, code-heavy Roman note, unsafe Markdown, table Markdown.
Viewport: desktop, tablet portrait, mobile narrow, mobile landscape.
Mode: paged, scroll.
Font class: Literata, Atkinson Hyperlegible, Merriweather.
Font size class: minimum, default, maximum.
Line height class: minimum, default, maximum.
Theme: warm-paper, high-contrast, dark.
Contrast: soft, normal.
E Ink intensity: off, reduced, balanced, strong.
Motion: system, reduced.
Texture: off, default, maximum.
Progress: on, off.
```

The agent may implement a simple pairwise generator locally in the test suite. It may also hand-author a matrix if that is faster and clearer. Do not use external runtime dependencies. If a dev-only pairwise helper is added, keep it simple, readable, and documented.

Minimum expanded pairwise row count: 18.

Recommended row count: 24 to 32.

Each pairwise row must follow this action sequence:

```text
Create browser context with specified viewport and motion if needed.
Open app.
Open specified fixture.
Apply mode.
Apply font.
Apply font size.
Apply line height.
Apply theme.
Apply contrast.
Apply texture.
Apply E Ink intensity.
Apply progress setting.
Wait for reader ready.
Run setting-change or no-user-visible-change baseline as appropriate.
Run Standard Post-Action Oracle.
Verify fixture marker visible unless the fixture is intentionally rejected or unsafe content is removed.
Verify no storage leak.
Verify no external network.
```

Each row must produce a useful test title:

```text
PWX017 code-heavy mobile scroll high-contrast Atkinson max-size reduced-motion
```

When a row fails, the failure output must include all factor values. Pairwise failures without factor reporting are not acceptable.

---

Q00 Responsive Settings Test Specification

---

Add `src/specs/responsive/settings-responsive.spec.ts`.

The current responsive suite tests reading surfaces, but settings across viewports need deeper coverage.

Use viewports:

```text
desktop 1440x900
small desktop 1024x768
tablet portrait 768x1024
tablet landscape 1024x768
mobile narrow 390x844
mobile small 360x640
mobile landscape 844x390
```

Test RESPSET001: settings opens and fits at each viewport.

Steps:

```text
Open standard-markdown.md.
Set viewport.
Open settings.
```

Expected result:

```text
Settings panel/dialog is visible.
Close control is visible.
No body-level horizontal overflow.
At least first setting group is visible.
Controls are not clipped horizontally.
```

Test RESPSET002: all primary setting controls reachable at each viewport.

Steps:

```text
Open settings.
Scroll settings panel if needed.
Check controls for mode, font, font size, line height, theme, contrast, E Ink, motion, reset, close.
```

Expected result:

```text
Every primary control is reachable by locator.
Mobile layouts may require internal panel scroll but must not require body horizontal scroll.
```

Test RESPSET003: mobile landscape settings.

Steps:

```text
Set mobile landscape viewport.
Open code-heavy note.
Open settings.
Change font size.
Close settings.
```

Expected result:

```text
Settings remains usable in short-height landscape.
No close button clipping.
Reader remains visible after close.
```

Test RESPSET004: dynamic orientation change with settings open.

Steps:

```text
Open standard Markdown in tablet portrait.
Open settings.
Switch viewport to tablet landscape.
```

Expected result:

```text
Settings panel reflows.
Focused control remains usable or focus moves to safe container.
No overlay stuck.
No horizontal overflow.
```

Test RESPSET005: dynamic orientation change with document open.

Steps:

```text
Open long-book.txt in page mode.
Capture current marker or progress.
Switch tablet portrait to landscape.
```

Expected result:

```text
Pagination recalculates.
Reader remains valid.
Content remains near same area if possible.
No invalid progress.
```

---

R00 Keyboard And Accessibility Gap Specification

---

Add `src/specs/navigation/keyboard-shortcuts.spec.ts` and `src/specs/accessibility/focus-and-shortcuts.spec.ts`.

Test KEY001: Space advances page.

Steps:

```text
Open long-book.txt in page mode.
Capture progress.
Press Space.
```

Expected result:

```text
Page advances.
Progress changes.
No settings opens.
No body scroll weirdness.
```

Test KEY002: Shift+Space goes back.

Steps:

```text
Open long-book.txt.
Advance once.
Press Shift+Space.
```

Expected result:

```text
Page moves backward or returns near previous progress.
```

Test KEY003: PageDown advances.

Expected result:

```text
PageDown advances in page mode.
In scroll mode, PageDown scrolls down.
```

Test KEY004: PageUp goes back.

Expected result:

```text
PageUp moves backward in page mode.
In scroll mode, PageUp scrolls up.
```

Test KEY005: S opens settings.

Steps:

```text
Open a document.
Press "s" while reader is focused.
```

Expected result:

```text
Settings opens if this shortcut is implemented.
If not implemented, document the product decision and do not assert it.
```

Test KEY006: O opens file picker or open-file action.

Steps:

```text
Open app or reader.
Press "o" while not inside form control.
```

Expected result:

```text
Open file action is triggered if implemented.
If browser automation cannot observe picker directly, assert that the open input receives activation or the app exposes the expected state.
```

Test KEY007: shortcuts suppressed inside settings controls.

Steps:

```text
Open document.
Open settings.
Focus font-size range or select.
Press ArrowRight, ArrowLeft, Space, PageDown.
```

Expected result:

```text
The focused control behaves normally.
The reader page does not turn unexpectedly.
Settings does not close unexpectedly.
```

Test A11Y009: tab cycle through settings.

Steps:

```text
Open settings.
Press Tab enough times to cycle through controls.
```

Expected result:

```text
Focus remains inside settings while open.
Focus is always visible or on an element that can receive visible focus.
```

Test A11Y010: focus returns after close.

Steps:

```text
Open settings through settings button.
Close with Escape.
```

Expected result:

```text
Focus returns to settings button, reader stage, or another sensible reader control.
Focus is not lost to body with no visible indication.
```

Test A11Y011: progress live-region contract.

Steps:

```text
Open long-book.txt.
Inspect progress element role or aria-live.
Turn page.
```

Expected result:

```text
Progress text updates.
Accessible region is present if product promises live progress.
If no live region exists, decide whether to add it for accessibility.
```

Again, correctness comes first. If the test reveals that keyboard shortcuts conflict with form controls, fix the app. If the test assumes an unimplemented shortcut that the product does not promise, fix the test or update the product spec.

---

S00 Privacy Surface Extension

---

Add `src/specs/privacy/storage-surfaces.spec.ts`.

The current suite covers localStorage well. Extend coverage to other browser storage surfaces and diagnostics.

Test PRIV008: IndexedDB has no book content.

Steps:

```text
Open code-heavy Roman fixture.
Use browser APIs to list IndexedDB databases if supported.
```

Expected result:

```text
No app-created IndexedDB database contains fixture markers.
If browser does not support listing databases, record the test as skipped with reason.
```

Test PRIV009: Cache Storage has no book content.

Steps:

```text
Open standard Markdown.
Inspect caches.keys().
```

Expected result:

```text
No cache entries contain the opened file content.
If Cache Storage is unavailable, skip with reason.
```

Test PRIV010: debug logs omit book content.

Steps:

```text
Open code-heavy Roman fixture.
Enable debug mode if UI supports it.
Open diagnostics/log panel if present.
Copy or read visible diagnostics.
```

Expected result:

```text
Diagnostics may include file name, size, type, page count, and error names.
Diagnostics must not include fixture markers, code snippets, paragraphs, source Markdown, or rendered HTML.
```

Test PRIV011: read-only inspection handle contains no content.

Steps:

```text
Open code-heavy Roman fixture.
Evaluate window.__einkReader.
Deep scan serializable values.
```

Expected result:

```text
The handle may expose mode, page index, scroll fraction, file-open helper, and safe metadata.
It must not expose book source, rendered HTML, code snippets, paragraphs, or fixture marker text.
```

---

T00 Offline And Missing Asset Resilience

---

Add `src/specs/offline/offline-runtime.spec.ts` and `src/specs/resilience/missing-assets.spec.ts`.

Test OFF001: browser offline after initial app load.

Steps:

```text
Open app.
Set browser context offline if supported.
Open simple TXT using file injection.
Open standard Markdown using file injection.
Change settings.
```

Expected result:

```text
App remains functional.
No runtime request is attempted.
Local fonts and styles remain available.
```

Test OFF002: remote image still blocked offline.

Steps:

```text
Set offline.
Open remote-image.md.
```

Expected result:

```text
Remote image placeholder appears.
No request is attempted.
No crash.
```

Test RES001: missing Markdown parser behavior.

Implementation note:

```text
Use route interception or a copied test server variant to fail the vendor markdown parser request.
Do not modify production files permanently.
```

Expected result:

```text
Opening Markdown fails closed or offers plain-text fallback.
No unsafe Markdown render.
Error message is calm.
```

Test RES002: missing sanitizer behavior.

Expected result:

```text
Unsafe Markdown is not rendered as trusted HTML.
App fails closed or strips HTML through parser configuration.
No script execution.
```

Test RES003: missing selected font behavior.

Implementation options:

```text
Route font request to 404 in test context.
Seed preferences with that font selected.
Open document.
```

Expected result:

```text
App falls back to Literata or system serif.
Reader remains usable.
Calm toast appears if product implements it.
No infinite font wait.
```

Test RES004: localStorage setItem throws.

Steps:

```text
Before app boot, patch Storage.prototype.setItem to throw in addInitScript.
Open app.
Change a setting.
```

Expected result:

```text
Setting applies for current session.
App shows or logs preference-save warning.
No crash.
```

Test RES005: localStorage getItem throws.

Expected result:

```text
App uses defaults.
Open screen remains usable.
No crash.
```

These resilience tests must be handled carefully. If the test harness approach is too artificial and produces false failures, refine the harness. Do not corrupt the production app to simulate missing assets.

---

U00 Journey Expansion Specification

---

The current journey suite has Frank, Lily, and Roman flows. Keep those. Add four gap journeys plus a richer Roman developer-note journey.

Every journey must capture a pre-action baseline, run a sequence, and verify that surrounding functionality still works afterward. A journey is not complete if it only checks its final marker.

Test JOURNEY004: unsafe Markdown journey.

Steps:

```text
Open unsafe-markdown.md.
Verify unsafe marker text behavior.
Verify script sentinel remains false.
Verify no iframe, script, style, or javascript link survives as active DOM.
Switch theme.
Switch mode.
Open settings and close.
Reload.
```

Expected result:

```text
Unsafe content never executes.
Safe content remains readable.
Settings and mode changes do not reintroduce unsafe content.
Reload restores preferences but not document.
```

Test JOURNEY005: reduced motion journey.

Steps:

```text
Create reduced-motion browser context.
Open standard Markdown.
Turn page.
Switch theme.
Switch font.
Switch mode.
Set E Ink strong if UI allows.
Set E Ink off.
```

Expected result:

```text
Reduced motion is respected by default.
Manual override behavior is consistent with product decision.
No aggressive flashing unless explicitly enabled.
No stuck overlay.
```

Test JOURNEY006: corrupted preference journey.

Steps:

```text
Seed localStorage with invalid JSON.
Open app.
Verify recovery.
Seed localStorage with valid JSON but invalid values.
Reload.
Open standard Markdown.
Open settings.
```

Expected result:

```text
Defaults are used or invalid values are clamped.
Settings show valid values.
Reader remains usable.
No console error that indicates uncaught failure.
```

Test JOURNEY007: rapid dirty-state journey.

Steps:

```text
Open long-book.txt.
Click Next rapidly.
Open settings immediately.
Change mode.
Change font size.
Close settings.
Resize to mobile.
Change theme.
```

Expected result:

```text
Final state is valid.
No stuck E Ink overlay.
No invalid page count.
Content visible.
No horizontal overflow.
No storage leak.
```

Test JOURNEY008: Roman developer-note mobile review.

Steps:

```text
Set mobile narrow viewport.
Open roman-leetcode-sliding-window.md.
Switch to scroll mode.
Set Atkinson Hyperlegible.
Set high contrast.
Set E Ink reduced.
Scroll to Python code block.
Verify line numbers if implemented.
Verify code block containment.
Open settings.
Close settings.
Reload.
```

Expected result:

```text
Developer note remains readable.
Code line numbers are correct if product includes them.
No body horizontal overflow.
Preferences persist.
Book content does not persist.
```

Test JOURNEY009: Roman desktop careful reading.

Steps:

```text
Set desktop viewport.
Open roman-leetcode-binary-search.md.
Use page mode.
Turn pages.
Switch to Merriweather.
Increase line height.
Switch high contrast.
Turn more pages.
Open external link intentionally.
Return to app.
Reload.
```

Expected result:

```text
Code-heavy note remains readable in page mode.
Pagination remains valid after typography and contrast changes.
Link behavior is intentional and safe.
Preferences persist.
Book content does not.
```

Test JOURNEY010: Lily recovery then baseline check.

Steps:

```text
Open app.
Drop multiple files.
Open unsupported PDF.
Open empty TXT.
Open standard Markdown.
Switch to scroll mode.
Increase font size.
Reduce E Ink.
Close settings.
Run baseline.
```

Expected result:

```text
Every error is calm and recoverable.
Final valid document is readable.
The earlier errors did not corrupt settings, storage, network, reader mode, or file input.
```

---

V00 Roman Markdown Element Coverage

---

The Roman fixture tests must prove that developer Markdown is rendered properly.

Add helper assertions in `markdown-assertions.ts`.

Required helper checks:

```text
expectHeading(level, textOrMarker)
expectParagraphContaining(marker)
expectListItem(textOrMarker)
expectBlockquoteContaining(textOrMarker)
expectTableWithHeaders(headers)
expectInlineCode(text)
expectFencedCodeBlock(language, marker)
expectNoBodyHorizontalOverflow()
expectRemoteLinksNotPrefetched()
expectMarkdownMarkerNotPersisted(marker)
```

Use the Roman fixtures to verify:

| Markdown element       | Fixture                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| H1/H2/H3               | all Roman fixtures                                                     |
| Paragraphs             | all Roman fixtures                                                     |
| Inline code            | `roman-leetcode-sliding-window.md`                                     |
| Fenced JavaScript      | `roman-leetcode-binary-search.md`, `roman-debugging-javascript.md`     |
| Fenced Python          | `roman-leetcode-sliding-window.md`                                     |
| Fenced shell           | `roman-mixed-quotes-and-code.md`                                       |
| Fenced JSON            | `roman-mixed-quotes-and-code.md`                                       |
| Fenced text/pseudocode | `roman-system-design-rate-limit.md`                                    |
| Table                  | `roman-leetcode-binary-search.md`, `roman-system-design-rate-limit.md` |
| Blockquote             | `roman-leetcode-binary-search.md`, `roman-mixed-quotes-and-code.md`    |
| Links                  | `roman-system-design-rate-limit.md`                                    |
| Lists                  | all Roman fixtures                                                     |

If the current Markdown renderer does not support a feature that Markdown users reasonably expect, decide whether to implement it or document a limitation. Do not silently skip the test if the feature is part of the product promise.

---

W00 Flakiness Handling Rules

---

The agent must actively look for flaky tests.

Run each new spec repeatedly before merging it into the suite:

```text
bun run test:<category>
bun run test:<category>
bun run test:<category>
```

Then run:

```text
bun run validate
```

If a test is flaky, do not immediately increase timeouts. First identify why.

Common causes and required responses:

| Cause                                | Response                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Fonts not ready                      | Wait through existing reader readiness that includes font readiness. If app readiness is weak, improve the app or inspection handle. |
| Pagination still running             | Wait for reader ready and stable page count. Avoid fixed sleeps.                                                                     |
| E Ink overlay active                 | Wait for overlay cleanup through page object or oracle. If overlay can stick, fix app.                                               |
| Network guard false positive         | Classify local static server requests separately from external requests.                                                             |
| Selector unstable                    | Add or fix `data-testid` if the UI element is interactive.                                                                           |
| Test assumes exact copy too strongly | Use copy class or product contract unless exact wording is intentionally required.                                                   |
| Application state race               | Prefer application state stabilization. If the app allows invalid intermediate states to leak to users, fix the app.                 |

It is acceptable to refactor application code to reduce flakiness when the refactor also improves the real app. Examples: expose a read-only readiness flag without content, make E Ink transition cancellation deterministic, ensure pagination has a generation token, ensure settings changes are serialized, ensure file-open errors clear busy state. It is not acceptable to add test-only product behavior that users cannot rely on or that exposes private book content.

Again: test passing is not the goal. Correctness is the goal. Stable tests are valuable because they measure correctness reliably.

---

X00 Coverage Matrix Requirement

---

Create or update a coverage matrix:

```text
ui-regression-test-suite/COVERAGE.md
```

The matrix must map manual plan areas to automated specs.

Columns:

```text
Manual area
Existing coverage
New coverage added in this pass
Still manual-only
Known limitation or product decision
```

Include rows:

```text
Smoke
Files
TXT rendering
Markdown rendering
Markdown safety
Code line numbers
Page mode
Scroll mode
Navigation
Keyboard shortcuts
Settings
Settings boundaries
Responsive reader
Responsive settings
Accessibility
Privacy localStorage
Privacy other storage
E Ink mechanics
E Ink visual credibility
Metadata
RSS
Offline
Missing assets
Pairwise
Frank journey
Lily journey
Roman journey
Rapid interaction
Corrupted preferences
```

Mark E Ink visual credibility as manual-only unless screenshot comparison is explicitly implemented. Automated tests cannot reliably decide whether the effect feels like real E Ink.

---

Y00 Final Implementation Order

---

Implement in this order.

```text
1. Read current suite README, AGENTS T00/U00, existing page objects, existing oracle, existing fixtures, and current specs.
2. Add baseline and adaptive-baseline helpers.
3. Add metadata and RSS specs because they are deterministic and low-risk.
4. Add file-input gap specs.
5. Add TXT and Markdown structure specs.
6. Add Roman fixtures and code-block page object.
7. Decide and implement code line-number product support if needed.
8. Add code line-number specs.
9. Add settings boundary specs.
10. Add responsive settings specs.
11. Add keyboard/accessibility shortcut specs.
12. Add privacy storage-surface specs.
13. Add offline and resilience specs.
14. Expand pairwise suite.
15. Add missing journey specs.
16. Update coverage matrix.
17. Run targeted categories after each phase.
18. Run full validate.
19. Investigate every failure as app bug, test bug, harness timing, product decision, or visual manual-only.
20. Fix real application bugs.
21. Fix incorrect or flaky tests.
22. Update bugs-todo.md only for real application bugs or product observations.
```

Do not implement the pairwise expansion before the baseline helper exists. Pairwise tests without surrounding-state checks will miss the main class of interaction bugs.

Do not implement code line-number tests without first deciding whether line numbers are a product requirement and, if yes, implementing them in the application.

---

Z00 Completion Gate

---

This pass is complete only when the following are true:

```text
New metadata tests exist and pass.
New RSS tests exist and pass.
New file-input gap tests exist and pass.
New TXT structure tests exist and pass.
New Markdown structure and link tests exist and pass.
Roman developer-note fixtures exist and are registered.
Code-block page object exists.
Code line-number behavior is either implemented and tested, or explicitly documented as out of scope with alternative code-structure tests.
Settings boundary tests exist and pass.
Expanded pairwise matrix exists and passes.
Responsive settings tests exist and pass.
Keyboard shortcut and accessibility gap tests exist and pass.
Privacy storage-surface tests exist and pass or skip unsupported browser APIs with documented reasons.
Offline tests exist and pass.
Missing-asset resilience tests exist or documented product decisions exist for infeasible simulations.
Additional journey tests exist and pass.
Coverage matrix is updated.
All new tests use or extend the Standard Post-Action Oracle.
All new tests use adaptive surrounding-state baselines where appropriate.
No test imports application source modules.
No test relies on book content being stored.
No test leaks book content through window.__einkReader or logs.
bun run typecheck passes.
bun run validate passes.
Flaky tests were investigated and stabilized.
bugs-todo.md records real app bugs or product observations only.
```

The final review must ask the same question repeatedly: is the application correct, stable, useful, calm, private, and usable for Frank, Lily, and Roman? If the tests pass but the answer is no, the work is not done. If a test fails but the app is correct and the test is wrong, fix the test. If a test fails because the app is wrong, fix the app.

The success metric is not a green suite alone. The success metric is a correct application with a reliable suite that protects that correctness.
