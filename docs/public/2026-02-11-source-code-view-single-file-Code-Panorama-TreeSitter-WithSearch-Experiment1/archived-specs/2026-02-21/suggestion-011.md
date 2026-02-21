2026-02-11

A00 r00. Purpose, value, and how this improves the experience

This feature adds "file reference intelligence" to the code panorama: whenever a filename or project-relative path appears inside the rendered code content, the viewer recognizes it as a reference to another file in the same loaded project and makes it interactive. The interaction is lightweight by default, but becomes powerful on demand: a user can immediately see whether a referenced file exists, jump to it, and see where else it is referenced. The point is not to replace search, but to remove the repeated, disruptive "copy filename, open search, run search, click results, go back" loop that happens constantly during reading and refactoring.

The value is highest in situations where the user is already reading code and is trying to answer quick questions: "where is this asset located", "is this referenced file missing", "what will I break if I rename this", and "where is this config referenced". Today, the app already gives an excellent "all files in one view" experience, but cross-file linkage still requires explicit searching and mental bookkeeping. Inline references turn the panorama into a navigable dependency map without forcing the user to switch panels or lose their reading position.

This change must not increase cognitive load. The app is already feature-rich with the directory tree, TOC, hover preview, search, stats, logs, and Tree-sitter tooling. The new feature therefore behaves like an opt-in layer: it stays visually subtle, avoids noisy false positives, avoids popups on hover, and only shows deeper information when the user explicitly clicks a reference. It is built with strict performance budgets, safe DOM operations, and guarded feature flags so it cannot degrade load, scroll, or rendering stability.

B00 r00. High-level user experience and interaction narrative

After a project is loaded, the user reads code in the main pane as usual. Some substrings that look like file references (for example `./assets/logo.svg`, `src/app.ts`, `manifest.json`, `#include "lib.h"` AND MANY OTHER WAYS) appear with a subtle inline treatment that indicates interactivity, without changing the code layout. The user can ignore these tokens entirely; nothing animates, nothing pops up, and scrolling feels the same.

When the user wants context, they click a reference token. A small, focused reference panel appears near the click location (or in a stable place if positioning would obscure content). The panel communicates one clear thing first: whether the reference resolves to an actual file in the loaded project. If it resolves, the panel offers a single primary action, "Open", which jumps the panorama to that file and makes it active (matching existing behavior). If the reference does not resolve, the panel clearly says "Not found in project" and optionally offers suggestions only if doing so is cheap and reliable.

If the user needs more, the same panel shows "Referenced by" information: a list of other files that mention this same target, with counts and click-to-jump for each occurrence. This reduces the need to open the search panel repeatedly, while still keeping search available for broad or fuzzy exploration.

The design prevents annoyance by using click-first interaction, conservative detection, and strong limits. It avoids hover popups, avoids over-highlighting, and never blocks the UI with heavy indexing work. The user can also disable the feature via a toggle in Settings if they prefer a pure viewer.

C00 r00. Constraints and integration context in this codebase

The app uses the Web File System Access API and a fallback file picker. It scans directories recursively while honoring `state.settings.ignores`, filters loaded text files by `state.settings.allow` and `maxFileSize`, stores loaded file records in `state.files`, renders each file as a `.file-section` with a `<pre><code>` containing `code.textContent = file.text`, supports navigation by hash and line via `navigateToFileLine()` and `scrollToApproxLine()`, and contains UI systems for TOC, tree, preview window, and search.

Syntax highlighting is now based on MicroLite, not Highlight.js. The reference feature must not depend on specific highlight DOM shape and must remain safe whether highlighting is applied before or after decoration. The feature must preserve code layout and avoid breaking highlighting.

D00 r00. Feature scope and definitions

A "reference token" is an inline substring in a loaded file's text that is detected as a likely project file reference. A reference token has:

* raw text as it appears in the file
* normalized reference string for matching and grouping
* resolution status: resolved, ambiguous, missing
* zero, one, or many matched project paths
* an optional mapping to a loaded `fileId` if the matched path belongs to a loaded text file

The "project inventory" is the set of all file paths discovered during scanning or file picker load, regardless of whether the file was loaded into `state.files`. This is required so references to assets like images or fonts can resolve even if not loaded.

The "reverse reference index" maps a target key to a list of occurrences across loaded text files. The target key is:

* the resolved canonical project path when the reference resolves uniquely
* otherwise the normalized reference string, so missing and ambiguous references can still show "who mentions this"

E00 r00. User-visible behavior and interaction details

E00 r00.1 Visual design and non-annoyance principles
Reference tokens are visually subtle. They do not look like errors unless missing. They do not add icons inside code. They do not change line height, wrapping rules, or monospaced alignment. A user who does not care can read as if the feature does not exist.

Resolved token styling: subtle underline or faint background. Missing token styling: slightly stronger, but still understated, with a "missing" color and optional dotted underline. Ambiguous token styling: similar to resolved but with a distinct indicator in the panel, not in the code.

No automatic popups. Hover does not open panels. The only hover behavior permitted is a standard cursor change and a native title attribute, and only if it is cheap.

E00 r00.2 Click behavior
Clicking a token opens a compact "Reference panel" that shows:

* the reference text
* resolution status: In project, Not found, Multiple matches
* primary action: Open (only when a target maps to a loaded fileId)
* secondary actions: Copy path, Show references

If ambiguous, the panel lists the possible matches and the user selects one to open. If the match exists in inventory but is not a loaded text file, the panel shows "Exists but not loaded" and offers Copy path, not Open.

E00 r00.3 "Referenced by" behavior
When the panel is open, it shows a list of other files that mention the same target key. Each row shows:

* file path
* count of occurrences in that file
* optionally the first occurrence line number
  Clicking a row navigates to that file and line using `navigateToFileLine(fileId, line)`.

The list is capped to prevent overload. It can show the top N referencing files (for example 50) and indicate "and more" if needed.

E00 r00.4 Navigation behavior
Open action navigates by setting hash to the target loaded fileId and calling `setActiveFile()`, consistent with existing patterns.

Occurrence navigation calls `navigateToFileLine()` using the stored line number from indexing.

E00 r00.5 Feature toggle
Add a Settings toggle "File references" default on. When off:

* no decoration occurs
* click handlers are not attached
* existing loaded decorations are cleared or simply not created depending on implementation cost

F00 r00. Data model additions and lifecycle

Add a new `state.refs` subtree reset during `resetStateForLoad()`:

* `enabled`: boolean
* `inventory`: `allPaths` Set, `byBasename` Map(basename -> paths[])
* `pathToLoadedFileId`: Map(path -> fileId) built after loading
* `index`: `byTarget` Map(targetKey -> targetEntry), `bySource` Map(fileId -> occurrence[])
* `build`: { running, runId, progress, pendingHandle, partial }
* `ui`: { activePanel, activeToken, lastOpenAt }

A `targetEntry` stores:

* `targetKey`
* `status`: resolved, missing, ambiguous
* `resolvedPaths`: array
* `occurrences`: array (capped)
* `countsBySource`: Map(fileId -> count)
* `totalCount`: integer

Inventory is filled during scanning, index is built after load completes.

G00 r00. Inventory capture tied to existing scanning code

G00 r00.1 Folder picker scan path
In `traverseDirectory()`, when `entry.kind === "file"`, record `path` into inventory before calling `processFileEntry(entry, path)`. Respect ignores: if `shouldIgnore(name)` or `pathHasIgnoredSegment(path)` would exclude it, do not add to inventory.

G00 r00.2 File picker path
In `loadFromFileList(files)`, record each `path` into inventory before allowlist filtering. If `pathHasIgnoredSegment(path)` excludes it, do not add.

G00 r00.3 Normalizing inventory paths
Normalize inventory paths into a canonical form:

* use forward slashes
* no leading slash
* collapse redundant segments
  Store both the canonical path and basename mapping:
* basename is last segment after slash
* map basename to list of canonical paths

H00 r00. Reference extraction heuristics for this app

The heuristics must be conservative to avoid noise. They are designed for line-by-line scanning so they can run in slices.

H00 r00.1 Reference extension set
Maintain an internal `REF_EXTS` set:

* all extensions in `state.settings.allow`
* plus `json` always
* plus common asset extensions: png,jpg,jpeg,gif,svg,webp,ico,bmp,ttf,otf,woff,woff2,eot,mp3,mp4,webm,wav,map

This set is for detection and resolution only. It does not change which files are loaded.

H00 r00.2 Candidate patterns applied in order

Pattern 1, quoted strings
Scan for substrings inside single quotes and double quotes. Extract content up to a safe max length (for example 260) and check if it contains a slash or ends with `.<ext>` where ext is in `REF_EXTS`. This captures the most common real references with low false positives.

Pattern 2, url(...) in CSS and similar
Detect `url(...)`, strip quotes inside, then validate using the same rules.

Pattern 3, import/require-style arguments
Without building a full parser, match common forms like `from "..."`, `require("...")`, `import("...")`. This is simply a specialized version of Pattern 1 with additional context, but it improves precision by restricting candidates to known constructs.

Pattern 4, unquoted path-like tokens
Find tokens containing `/` or `\` and ending with `.<ext>` in `REF_EXTS`. Use strict boundaries: token must be surrounded by whitespace or punctuation boundaries, not letters/digits. Convert backslashes to slashes.

Pattern 5, bare filenames
Match `name.<ext>` without any slashes, where name is at least 3 characters, contains at least one alphanumeric, and does not look like a domain. This is the noisiest pattern and should be last and possibly disabled by default if early testing shows too many false positives.

H00 r00.3 Exclusions
Exclude tokens that:

* contain `://`
* start with `http://` or `https://`
* start with `data:` or `blob:` or `mailto:`
* contain whitespace after trimming unless extracted from quotes and trimmed safely
* exceed 260 characters after normalization
* look like a domain, for example contain a dot TLD pattern and do not end in an extension from `REF_EXTS`

H00 r00.4 Normalization
For each candidate:

* trim surrounding quotes and trailing punctuation `,;:)` and leading `(`
* convert backslashes to slashes
* strip query/hash suffix after `?` or `#`
* resolve `./` and `../` segments only during resolution (keep normalized as the candidate string for grouping, but also keep a "normalizedPathLike" for resolution attempts)

I00 r00. Resolution strategy against inventory and loaded files

I00 r00.1 Build pathToLoadedFileId
After loading completes, create a Map from `file.path` to `file.id` for all `state.files`. Paths in `state.files` are already project-relative. Normalize them the same way as inventory paths to avoid mismatch.

I00 r00.2 Resolution rules
Given `sourcePath` and `candidate`:

* If candidate starts with `./` or `../`, resolve relative to the directory of `sourcePath`.
* If candidate starts with `/`, treat as root-relative: remove leading slash.
* If candidate contains a slash but no leading `./`, `../`, `/`, try root-relative first.
* If candidate has no slash, try source directory + basename, then global basename lookup. If global basename yields multiple matches, mark ambiguous.

Resolution returns:

* status and `resolvedPaths` array
* for each resolved path, optional `fileId` if in `pathToLoadedFileId`

I00 r00.3 Missing and ambiguous
Missing means no resolved paths. Ambiguous means more than one resolved path. Both states still create a target key for reverse indexing using the normalized candidate string.

J00 r00. Reverse index build, slicing, and performance

J00 r00.1 Build timing
Start after `finishLoad()` sets `state.phase = "loaded"`. Use slicing similar to search:

* maintain a run object with `files`, `fileIndex`, `lineIndex`, and pre-split lines
* process until a time budget is exceeded, then `setTimeout(..., 0)` to yield

J00 r00.2 Occurrence storage
Store occurrences with:

* `sourceFileId`, `sourcePath`
* `lineNumber`
* `matchStart`, `matchEnd` within the line for later highlighting if desired
* `raw`, `normalized`
* `targetKey`
* `resolutionStatus`, `resolvedPaths` (capped list)

J00 r00.3 Caps
Cap stored occurrences per target key to avoid memory blowups, but keep counts:

* `MAX_OCCURRENCES_PER_TARGET` for stored occurrences, for example 200
* `MAX_REFERENCING_FILES_SHOWN` for UI list, for example 50

J00 r00.4 Incremental behavior
This app does not edit file contents, so a one-shot index build is acceptable. If later you add editing, the index can be rebuilt per file by removing prior occurrences from `bySource` and updating `byTarget`.

K00 r00. Rendering and DOM decoration with MicroLite

K00 r00.1 Timing relative to MicroLite
MicroLite may highlight synchronously or asynchronously depending on how it is integrated. The reference decoration must be safe regardless. The simplest robust rule is: decorate after the code block is rendered and after any highlighting pass is applied, and ensure decoration is idempotent.

K00 r00.2 Idempotent decoration API
Add a function `decorateFileSectionReferences(fileId)` that:

* finds the `.file-section` for fileId
* finds the `<code>` element
* exits if a dataset marker like `code.dataset.refsDecorated === "true"` is present
* walks text nodes and wraps matched ranges with `<span class="file-ref">`
* sets `code.dataset.refsDecorated = "true"`

This function can be called from:

* `renderFileSection(record)` after creating `<code>`
* any MicroLite highlighting callback, if one exists
* an IntersectionObserver similar to existing `observeHighlightBlock`, but for references, so decoration only happens when in view

K00 r00.3 Safe text-node wrapping
Never operate via `innerHTML` replacement. Use a TreeWalker on the `<code>` element. For each text node, run candidate matching and do controlled splits with `document.createTextNode` and `span` insertion. Skip nodes already inside `.file-ref` spans.

K00 r00.4 Event handling
Attach a single delegated click handler on `els.fileContainer` for `.file-ref` spans to avoid per-token listeners. On click:

* read dataset values
* open the reference panel

L00 r00. Reference panel UI: reuse existing window patterns

This codebase already has `PreviewWindow` with robust positioning, sizing, and inactivity cleanup. Reuse it to avoid adding yet another overlay system.

Implement `openReferencePanel(anchorEl, tokenData)` as:

* ensure a preview-like window exists (either reuse PreviewWindow with a different title, or create a sibling lightweight window class if you want separation)
* position near the clicked token using `positionWindowNearElement(anchorEl)`
* fill content with a small DOM tree: status, actions, references list
* keep window stable until user clicks outside or inactivity timeout triggers, consistent with PreviewWindow behavior

This reuse prevents UI inconsistency and reduces code risk.

M00 r00. UX safeguards to prevent annoyance and regressions

M00 r00.1 No hover popups
Do not open panels on hover. This avoids accidental overlays while reading or selecting text.

M00 r00.2 Conservative detection default
Enable only the high-precision patterns by default: quoted strings, url(), import/require arguments, and path-like tokens with extensions. Keep bare filename detection either off by default or gated behind an internal flag until validated.

M00 r00.3 Visual subtlety
Do not color large portions of code. Keep styling minimal and consistent. Missing references should be noticeable but not "error red" by default.

M00 r00.4 Performance budgets
Index build must slice and yield. Decoration must be viewport-lazy so you do not process every file DOM at once on load. Store caps and avoid building enormous DOM trees.

M00 r00.5 Feature toggle and safe fallback
If any error occurs during extraction, indexing, or decoration, catch and log to the existing log system via `addLog("refs", "...")`, and disable further decoration for that file rather than failing globally.

N00 r00. Implementation plan for Codex within app.js

N00 r00.1 Add state and settings

* Extend `defaults` and settings UI with `fileRefs: true` (or similar)
* Add `state.refs` initialization and reset in `resetStateForLoad()`

N00 r00.2 Add inventory capture

* Add `recordInventoryPath(path)` and call it from directory traversal and file list load paths

N00 r00.3 Add index build scheduler

* Add `scheduleReferenceIndexBuild()` called from `finishLoad()`
* Implement slicing loop similar to search, scanning `state.files` line-by-line

N00 r00.4 Add decoration system

* Add delegated click handler on `els.fileContainer`
* Add lazy decoration hook: either a new IntersectionObserver on file sections or decorate when section is rendered and visible
* Implement text-node wrapping and datasets

N00 r00.5 Add reference panel UI

* Reuse PreviewWindow or implement a small parallel window with the same lifecycle and placement logic
* Populate it with resolved status, actions, and referencing list

O00 r00. Acceptance criteria

O00 r00.1 Base behavior
After load completes, some references become clickable tokens in the main code view without changing layout.

O00 r00.2 Resolution against inventory
A reference to an existing non-loaded asset resolves to "In project" and offers Copy path even if it cannot be opened as a loaded file section.

O00 r00.3 Navigation
Clicking Open for a resolved loaded file navigates using existing hash and line mechanisms and sets the active file.

O00 r00.4 Reverse references
The panel shows referencing files and clicking an item navigates to that file and the first occurrence line.

O00 r00.5 Non-annoyance
No panel opens on hover. Tokens are subtle. The feature can be disabled. Scrolling and search remain responsive during and after indexing.

O00 r00.6 No regressions
Directory tree, TOC, preview hover, search panel, stats, logs, and Tree-sitter continue to function as before. If MicroLite is disabled or changed, reference decoration remains safe because it operates on text nodes and is idempotent.
