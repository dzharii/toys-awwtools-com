Date: 2025-12-24

A00 Purpose and scope

This feature adds a Code search panel that lets the user search the currently loaded, in-memory project contents and jump to matches. The feature provides grep-style searching with two query modes (Text and Regular expression), a scope selector (All files vs Visible files), optional case sensitivity, and an optional live typing mode that is disabled by default.

This feature does not implement fuzzy search. This feature does not implement keyboard-only navigation beyond Enter-to-search in the input. All match navigation is via mouse clicks.

B00 UI placement and structure

B00.1 Location
The Code search UI is added to the existing Table of contents area, as a new expandable/collapsible block placed adjacent to the Table of contents block (either directly above or directly below it). The Code search block must visually match the Table of contents block style and layout conventions (padding, typography, border, and button styles) so it reads as a peer component.

B00.2 Container type
The Code search block is implemented as an HTML <details> element with a <summary> header, matching the pattern used for per-file sections elsewhere in the app.

B00.3 Default state
The Code search <details> element is collapsed by default on initial load and after each project load.

B00.4 Summary header content
The <summary> line displays:

1. Title text: "Code search".
2. A compact status area on the right side that shows one of the following:
   2.1. Idle: "0 matches".
   2.2. After a successful search: "<N> matches" where N is the number of matches currently shown (after applying caps).
   2.3. While searching: "Searching..." plus an optional progress count "X/Y files" if available.

B00.5 Body layout
When expanded, the body contains two regions in order:

1. Controls region (query input and options).
2. Results region (scrollable list of matches).

B00.6 Focus behavior
When the Code search block is expanded by user action, focus is moved to the query text input.

C00 Search controls and options

C00.1 Controls in the controls region
The controls region contains, left-to-right:

1. Mode selector (combobox):
   1.1. Option value "Text".
   1.2. Option value "Regular expression".
2. Scope selector (combobox):
   2.1. Option value "All files".
   2.2. Option value "Visible files" (files not currently hidden via Table of contents Hide action).
3. Query text input (single-line).
4. Checkbox "Case sensitive" (unchecked by default).
5. Checkbox "Live typing" (unchecked by default).
6. Primary button "Search".
7. Secondary button "Cancel" (hidden/disabled when no search is running, enabled only during an active search run).

C00.2 Enter behavior
Pressing Enter while focus is in the query input triggers the same behavior as clicking the Search button, subject to validation rules.

C00.3 Availability rules
If the project is not in the loaded phase (loading, empty, cancelled), then:

1. The Code search block remains present.
2. All controls are disabled.
3. The results region shows a short message: "Available after load completes."

C00.4 Mode switching behavior
Changing the mode selector does not clear the query input. Mode switching affects:

1. How the query is interpreted and compiled.
2. How match highlighting is computed.
3. Which validation errors can occur (regex compilation errors exist only in Regular expression mode, and also in Text mode when wildcards are used as described below).

D00 Query semantics

D00.1 Search unit
Search operates at the line level. A "match" is a single line within a file that matches the compiled query. Multi-line matches are not supported.

D00.2 Text mode base semantics
In Text mode, the query is treated as a plain text pattern and matched within each line.

1. Default matching is case-insensitive unless "Case sensitive" is checked.
2. Plain text mode supports an asterisk wildcard as described in D00.3.
3. Plain text mode does not interpret regular expression metacharacters other than the wildcard rules described in D00.3.

D00.3 Asterisk wildcard support in Text mode
In Text mode, the asterisk character "*" is treated as a wildcard matching zero or more characters within a single line.

1. If the query contains no "*", matching is simple substring matching.
2. If the query contains one or more "*", the query is converted to an internal regular expression and matched as a regex against each line.
3. Conversion rules for wildcard queries:
   3.1. All characters other than "*" are escaped so they match literally.
   3.2. Each "*" becomes ".*".
   3.3. The resulting regex is not implicitly anchored. It may match anywhere in the line.
   3.4. Matching is still within a single line only.
4. Example conversions:
   4.1. "foo*bar" matches "foo___bar" and "foobar".
   4.2. "*todo*" matches any line containing "todo" anywhere.
   4.3. "a*b*c" matches a line containing "a" then later "b" then later "c".

D00.4 Regular expression mode semantics
In Regular expression mode, the query is compiled as a regular expression and applied to each line.

1. Default matching is case-insensitive unless "Case sensitive" is checked.
2. The regex is applied to each line independently.
3. A line is considered a match if the regex matches anywhere within the line (equivalent to using regex.search semantics, not full-line match).

D00.5 Minimum query length rules
To prevent pathological runs, minimum lengths are enforced:

1. Explicit search (Search button or Enter):
   1.1. Query must be at least 2 non-whitespace characters after trimming.
   1.2. If not, the search is not started and an inline validation message is shown: "Enter at least 2 characters."
2. Live typing:
   2.1. Query must be at least 3 non-whitespace characters after trimming.
   2.2. If not, no search is started and any prior results remain visible.

E00 Live typing behavior

E00.1 Default
Live typing is disabled by default.

E00.2 Debounce
When Live typing is enabled, changes to the query input schedule a search with debounce:

1. Debounce delay is 250 ms.
2. If the user types again before the delay elapses, the pending scheduled search is cancelled and rescheduled.

E00.3 Cancellation and restart
If a search run is currently executing and Live typing schedules a new search, the current run is cancelled immediately and replaced with the new run after debounce.

E00.4 When live typing does not run
Live typing must not start a search in these cases:

1. Query length is below the minimum length for live typing (E00.4 references D00.5.2).
2. The current mode is Regular expression mode and the regex is invalid (error shown, no run started).
3. The project is not in loaded phase.

F00 Search execution and performance

F00.1 High-level rule
Search execution must not block the UI for a noticeable continuous interval. The search process must yield back to the browser regularly.

F00.2 Cooperative chunking
Search runs in chunks with a time budget:

1. The search loop processes files/lines until it reaches a per-slice time budget.
2. The time budget per slice is 8 to 12 ms (implementation may choose a value in this range).
3. After a slice completes, the search yields (via a zero-delay continuation mechanism such as setTimeout(0), requestAnimationFrame, or requestIdleCallback when available).
4. The search continues with the next slice until completion or cancellation.

F00.3 Progress reporting
While running, the summary header shows "Searching..." and may additionally show "X/Y files" where:

1. Y is the total number of files in the selected scope.
2. X is the number of files already processed for the current run.

F00.4 Cancellation semantics

1. Starting a new search run cancels any in-progress run immediately.
2. Clicking the Cancel button cancels the current run immediately.
3. Cancellation stops further scanning and stops further results updates.
4. After cancellation, the UI status returns to idle and retains the most recently committed results from the cancelled run (partial results), clearly labeled "Partial results" in the results region header.

F00.5 Result cap
To prevent DOM explosion and uncontrolled work, results are capped:

1. A global cap of 200 matches is enforced for displayed results.
2. Once 200 matches have been collected, the search may stop early without scanning remaining files.
3. The UI must indicate when results are capped by showing a short note above the results list: "Showing first 200 matches."

F00.6 Scope application

1. All files scope includes both visible and hidden files.
2. Visible files scope includes only files that are not in the hidden set.
3. The scope is evaluated at search start. If the user hides or shows files during a run, the current run continues using the original file set, and the next run uses the updated scope state.

G00 Results model and rendering

G00.1 Result item fields
Each match result item includes:

1. File identifier (fileId).
2. File path (path).
3. Line number (1-based).
4. Match range within the matched line for highlighting:
   4.1. For plain Text mode without "*" wildcard: the start and end index of the substring match.
   4.2. For Regular expression mode and Text mode with wildcards: the start and end index of the overall regex match (first match on the line).
5. Preview snippet text consisting of up to 7 lines: the matched line plus up to 3 lines before and up to 3 lines after, clamped to file boundaries.

G00.2 Ordering
Results are presented in deterministic order:

1. Primary sort by file path ascending (localeCompare).
2. Secondary sort by line number ascending.
3. If multiple matches occur on the same line, only the first match on that line is included in this version.

G00.3 Results region structure
The results region is a vertically scrollable list with a fixed max height relative to the viewport (so it does not push the main content excessively). The list is updated incrementally during execution.

G00.4 Result row layout
Each match is rendered as a "result card" with:

1. A header line showing:
   1.1. File path (as clickable link).
   1.2. Line number (as clickable link).
2. A preview block showing the snippet lines:
   2.1. Each snippet line displays its line number.
   2.2. The matched line is visually emphasized.
   2.3. The matched span in the matched line is highlighted.

G00.5 Click targets
The following click interactions are supported:

1. Clicking the file path navigates to the matched line in that file.
2. Clicking the line number navigates to the matched line in that file.
3. Clicking any line within the preview block navigates to that specific line in that file.

H00 Navigation and deep linking

H00.1 Fragment format
Search navigation uses standard browser fragment navigation by setting location.hash to a structured fragment:

1. Format: "#<fileId>@<line>"
2. <fileId> is the existing file section id.
3. <line> is a 1-based integer line number.

H00.2 Hash change handling
The hash change handler must be extended to support both existing and new formats:

1. If the fragment matches "#<fileId>" with no "@", behavior remains unchanged: scroll to the file section start.
2. If the fragment matches "#<fileId>@<line>":
   2.1. Ensure the file section is expanded.
   2.2. Scroll to the approximate line using the existing approximate line mechanism.
   2.3. Set the active file to <fileId>.

H00.3 Hidden file navigation rule
If a navigation target refers to a hidden file:

1. The file must be automatically unhidden before navigation proceeds.
2. Unhiding means removing the fileId from the hidden set and updating relevant UI (directory tree and Table of contents).
3. After unhide, navigation proceeds as normal.

I00 Error handling and validation UX

I00.1 Inline error placement
All query errors are displayed inline within the Code search block, directly below the controls region and above the results region. Errors must not use modal dialogs.

I00.2 Invalid regex errors
If Regular expression mode is active and the regex fails to compile:

1. No search run starts.
2. The error message "Invalid regular expression." is shown.
3. Additional detail is shown in a secondary line or tooltip, derived from the runtime error message, truncated to a reasonable length.
4. The Search button remains enabled, but clicking Search repeats validation and continues to refuse to run until fixed.
5. If Live typing is enabled, it must not start a run while invalid.

I00.3 Empty or too-short query errors
If the query violates minimum length rules (D00.5), the search does not start and a concise message is shown (D00.5 defines exact wording).

I00.4 Results retention on errors
If a search attempt fails validation, the existing results list remains unchanged so the user does not lose context.

J00 Interaction with existing UI and state

J00.1 Relationship to Table of contents selection/hide
The search feature does not alter Table of contents selection. It may unhide files only as described in H00.3 when the user navigates to a hidden match.

J00.2 Load/reset behavior
On project load start (resetStateForLoad):

1. Any in-progress search is cancelled.
2. The Code search block is collapsed.
3. The query input is cleared.
4. The results list is cleared.
5. Options reset to defaults:
   5.1. Mode = Text.
   5.2. Scope = All files.
   5.3. Case sensitive unchecked.
   5.4. Live typing unchecked.

J00.3 Persistence
In this version, Code search settings are not persisted to localStorage. They are reset on each project load as defined above.

K00 Usage scenarios

K00.1 Scenario 1: Quick substring search across all files
The user loads a project, expands Code search, leaves Mode as Text, leaves Scope as All files, types "timeout", and clicks Search. The results list populates with up to 200 matching lines across files, ordered by file path and line number. The user clicks a result line number and is taken to that line in the file.

K00.2 Scenario 2: Case-sensitive identifier search
The user searches for "TreeSitter" where case matters. They check Case sensitive, keep Mode as Text, and click Search. Only lines containing the exact case-sensitive substring are returned.

K00.3 Scenario 3: Text wildcard search
The user wants lines that mention a function call pattern where the middle part varies. They type "render*Panel" in Text mode and click Search. The system treats "*" as a wildcard, matches lines where "render" occurs before "Panel" on the same line, and highlights the matched span.

K00.4 Scenario 4: Regex search with an alternation
The user switches Mode to Regular expression without clearing the query, enters "open(Settings|Support)Panel", and clicks Search. Matches return for either panel open call. The matched regex span is highlighted.

K00.5 Scenario 5: Invalid regex error guidance
The user selects Regular expression mode and types an invalid pattern like "(abc". On Search, the system shows "Invalid regular expression." directly under the controls, with a brief detail. No new search starts and existing results remain visible.

K00.6 Scenario 6: Visible files scope after hiding noise
The user hides generated files via Table of contents Hide. They set Scope to Visible files and search for "TODO". The search scans only visible files, reducing time and irrelevant matches.

K00.7 Scenario 7: Navigating to a hidden file match from All files scope
The user sets Scope to All files and searches for "webpack". A match exists in a file that is currently hidden. When the user clicks the match, the system automatically unhides the file and navigates to the target line.

L00 Specification by example

L00.1 Text mode without wildcard
Given query "abc" in Text mode, Case sensitive unchecked, and a line "xxAbCyy", the line matches because matching is case-insensitive. The highlighted span corresponds to "AbC" within the line.

L00.2 Text mode with wildcard
Given query "a*c" in Text mode, Case sensitive unchecked:

1. Line "xxacyy" matches.
2. Line "xxaZZcYY" matches.
3. Line "xxaYY" does not match.
   Highlighting covers the full regex match from the first "a" through the "c".

L00.3 Regex mode basic
Given query "\bstate\b" in Regular expression mode, Case sensitive unchecked:

1. Line "const state = {}" matches and highlights "state".
2. Line "statement" does not match if the regex is a word boundary match.

L00.4 Result cap behavior
Given a query that would produce 500 matching lines, the system stops after collecting 200 matches, shows exactly 200 results, and displays "Showing first 200 matches."

L00.5 Minimum length behavior
Given query "a" (trimmed length 1):

1. Clicking Search shows "Enter at least 2 characters." and does not start a run.
2. If Live typing is enabled, typing "a" does not start a run and does not change results.

M00 Out of scope

M00.1 Not implemented in this version

1. Fuzzy search of files or content.
2. Replace operations.
3. Multi-line matches.
4. Regex flags beyond case sensitivity control.
5. Search result export/copy actions.
6. Keyboard navigation of results beyond Enter-to-search.
7. Ranking or scoring of results beyond deterministic ordering.

N00 Verification checklist

N00.1 UI structure

1. Code search is a <details>/<summary> block, collapsed by default, styled consistently with Table of contents.
2. Controls appear above results and are disabled when project is not loaded.
3. Summary shows idle, running, and result count states.

N00.2 Query behavior

1. Text mode substring search works case-insensitively by default.
2. Case sensitive checkbox flips matching behavior for both modes.
3. "*" wildcard in Text mode converts to regex and behaves as defined.
4. Regular expression mode compiles and searches as defined.
5. Minimum length rules are enforced for explicit search and live typing.

N00.3 Performance

1. Search yields in slices and does not freeze the UI during large scans.
2. Cancel button cancels promptly.
3. Starting a new search cancels the previous run.
4. Global cap of 200 matches is enforced and communicated.

N00.4 Results and navigation

1. Results include file path, line number, and a 3-before/3-after preview.
2. Clicking a result navigates to "#<fileId>@<line>" and scrolls to the line.
3. Hidden target files are automatically unhidden before navigation.


# User Scenarios

A00 Code search usage scenarios narrative guide

A00.1 Intent
This document describes how a user applies Code search in practice. It assumes a project is loaded and Code search is available as a collapsed-by-default details/summary block near the Table of contents. The emphasis is on user goals, the friction they face, and how the feature supports a smooth workflow.

B00 Scenario 1: Find a remembered word without knowing where it is
A user remembers seeing the word "timeout" in the project, but does not recall which file it was in. They expand Code search, keep the mode set to Text, and type timeout. They do not change any options, because the default case-insensitive behavior is what they want. They click Search and watch results arrive. They skim the snippets until they see a line that clearly belongs to the code path they care about, then click the line number to jump into the file at the exact line.

C00 Scenario 2: Match an identifier where letter case matters
A user is looking for an identifier like AuthToken, and they know the case is significant. They type AuthToken, enable Case sensitive, and run the search. The results omit lines containing authtoken or AUTHTOKEN, which reduces noise. The user clicks the file path in the result header to open the match in context, then scrolls a little to understand how the identifier is created and used.

D00 Scenario 3: Use asterisk wildcards to bridge unknown text
A user wants to find lines where a handler name starts with "handle" and ends with "Click", but the middle is inconsistent across components. They stay in Text mode and type handle*Click. The search returns matches like handleSaveClick and handleRetryClick. The user uses the snippet context to pick the correct component, then clicks the snippet line to jump directly to that line.

E00 Scenario 4: Switch to regex mode to match alternatives
A user needs to find code that calls either sendEvent or logEvent. They change the mode to Regular expression and type (sendEvent|logEvent). They click Search. The results show lines that include either form. The user clicks a match where the surrounding lines suggest it is part of the telemetry pipeline, then validates the call site behavior.

F00 Scenario 5: Get clear feedback when a regex is invalid
A user attempts a regex and makes a syntax mistake, such as typing (userId without a closing parenthesis. They click Search. Instead of starting a scan, the UI shows an inline error directly under the controls: "Invalid regular expression." A short detail line helps them identify what is wrong. They fix the regex and click Search again. The search then runs normally.

G00 Scenario 6: Hide irrelevant files first, then search only what remains visible
A user is working on application logic and has already hidden generated output folders and vendor code using the Table of contents hide controls. They switch Code search Scope to Visible files and search for TODO. Because the search only scans the visible set, results are faster and more relevant. The user clicks into a match that appears to describe unfinished work in a module they are currently editing.

H00 Scenario 7: Search everything even if some files are hidden
A user is not confident that the target string is in the visible set. They keep Scope set to All files and search for "docker". A match appears in a file that is currently hidden. When they click the match, the app automatically unhides the file and navigates to the correct line, so the user can inspect it immediately.

I00 Scenario 8: Use snippet context to avoid jumping into the wrong place
A user searches for "retry" and gets a large list. They do not want to click ten matches just to find the right one. Instead, they read the three-lines-before and three-lines-after preview. One snippet shows retry logic in a networking layer, another shows retry logic in a UI polling loop. The user chooses the snippet that fits their goal and clicks the exact preview line they want, landing directly at the correct location.

J00 Scenario 9: Prefer explicit search to keep typing responsive in large projects
A user loads a very large codebase and wants to avoid any lag while typing. They leave Live typing off. They type a complete query like "connection refused" and click Search once. The UI stays responsive while they type and edit, and work only begins when they explicitly trigger the search. If the query is too broad, they refine it and click Search again.

K00 Scenario 10: Enable live typing for quick iteration on small scopes
A user is working with a small project, or they have restricted Scope to Visible files and hidden most folders. They enable Live typing because they want results to update as they refine a query. They type cache, then expand it to cacheKey, then cacheKey*ttl. The results update after short pauses. If they delete back to a very short query, the UI does not start a search run, which prevents useless scanning for low-signal input.

L00 Scenario 11: Cancel a broad search when it is no longer useful
A user starts a search for "error" across All files and realizes it will produce far more results than they need. While the search is in progress, the panel indicates it is searching and the Cancel button is available. They click Cancel. Scanning stops quickly and partial results remain visible. The user then narrows the query to something more specific like "error: invalid header" and starts a new search.

M00 Scenario 12: Refine queries without losing useful prior results on validation failures
A user searches for "parse config" and gets a helpful list. They then decide to switch to Regular expression mode to match variations, but they accidentally type an invalid pattern. The UI shows an inline regex error and does not start a new run, and the previous results remain visible. The user can still refer to those earlier hits while fixing the regex, which supports exploration without losing context.

N00 Scenario 13: Search for literal punctuation-heavy strings without thinking about escaping
A user wants to locate a literal string like "--feature-flag" or "X-Request-Id:" in the codebase. They stay in Text mode and paste the string directly. Because Text mode treats the input as literal text unless they intentionally use asterisks, they do not have to worry about regex escaping rules. They use the results to trace where headers or flags are set and handled.

O00 Scenario 14: Use regex for structured matching like word boundaries
A user wants to find the identifier state only when it is a standalone word, not when it appears inside larger words like statement or interstate. They switch to Regular expression mode and type \bstate\b. The matches become precise. They click into a result where the surrounding snippet shows a state object definition and confirm they found the right concept.

P00 Scenario 15: Narrow from discovery to precision using scope and case sensitivity
A user starts with a broad Text search for "auth" to discover where authentication is handled. They hide unrelated folders, switch Scope to Visible files, and search again. Then they turn on Case sensitive to find a specific type name like AuthConfig. The workflow moves from exploration to precision, with each step reducing noise and increasing confidence that remaining results are relevant.

Q00 Scenario 16: Use the results list as confirmation rather than navigating everywhere
A user has modified a constant name and wants to confirm no old references remain. They search for the old name. When results appear, they scan the list and verify it is empty. In the opposite case, if a few matches remain, they only navigate to those few. The results list acts as a checklist to confirm completeness, not just a navigation tool.

R00 Scenario 17: Navigate by searching instead of expanding the directory tree
A user is unfamiliar with the project structure and does not want to expand many folders in the directory tree. They search for a distinctive phrase like "rate limiter" or "session cookie". The first relevant match appears quickly. They click it and land inside the file, using search as the primary navigation path rather than browsing directories.

S00 Scenario 18: Understand why search is unavailable and recover without confusion
A user expands Code search before the project has finished loading. The controls are disabled and the panel clearly indicates that search becomes available after loading. The user waits for load completion, returns to the same panel, and runs their search without needing to guess why nothing happened earlier.




