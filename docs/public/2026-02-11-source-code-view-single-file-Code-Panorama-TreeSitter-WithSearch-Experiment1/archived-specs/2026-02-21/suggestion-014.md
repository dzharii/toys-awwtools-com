2026-02-14
A00 Rationale and user value (rev 00)

This feature exists to make large projects navigable when the table of contents (TOC) becomes too long to scan visually. Users routinely need to narrow the TOC to the subset of files they care about (for example only a package, only assets, only a feature folder) without changing what is actually loaded into the project view. Adding fast filtering and exclusions directly in the TOC reduces time spent scrolling, reduces cognitive load, and makes the UI practical for large repositories.

The value is highest when the project contains many files, deeply nested paths, or mixed concerns (source, content, assets, build output). The user benefit is immediate: the TOC becomes an interactive "working set" view that can be searched and trimmed without affecting the underlying loaded files or the rest of the application.

B00 Scope and non-goals (rev 00)

This change is strictly scoped to the TOC UI and behavior only. The search and exclusion controls must be implemented inside the existing TOC details/summary area so they are not visible unless the TOC section is expanded.

Non-goals:
No changes to project loading, file scanning, file rendering, directory tree behavior, code search, references, symbol refs, preview, or persistence unless explicitly required for TOC-only state handling.
No regex search. Only wildcard patterns.
No hard deletion of DOM nodes representing TOC items. Hidden items must remain in the DOM and be toggled by CSS state to support reversible exclusions.

C00 Existing context to preserve (rev 00)

The TOC currently renders each file as an LI with:
A checkbox (class "toc-checkbox") used for selection-based actions.
A label element that is either:
An anchor (class "toc-link") when the file is not hidden, pointing to "#<fileId>" and wiring click to setActiveFile(fileId), or
A span (class "toc-text") when the file is hidden.

Each LI stores metadata via:
data-file-id
data-file-path

The file path string is displayed as text content (for example "src/content/assets/bookmarks.css") and corresponds to path segments such as "src", "content", "assets".

D00 Feature 1: Wildcard search within the TOC (rev 00)

D01 Goals and user experience (rev 00)

Add a search input inside the TOC details content (above the list) that filters which TOC items are visible. This search affects only the TOC list. It does not hide file sections in the main content area and does not alter the underlying file model. Users can type while the list updates interactively.

The search must be case-insensitive.

The search language is wildcard-only:
"*" matches any sequence of characters (including path separators).
"?" matches exactly one character.
No other special syntax is required.
If the user provides no wildcard, treat the pattern as a literal substring match that can occur anywhere (equivalent to "*query*"). This makes the feature useful without requiring users to learn syntax.

The matching target is the displayed file path string (the TOC path), not file contents. Matching should apply to the full path, so patterns can target a directory segment ("src/*") or a suffix ("*.css").

D02 Performance and debouncing (rev 00)

Because projects can contain many files, filtering must be debounced. The UI should not re-filter on every keystroke immediately. Use a small debounce window so typing remains responsive while still updating "live". The debounce duration should be tuned for perceived responsiveness and CPU usage (for example around 100-200 ms). The implementation must avoid re-creating DOM nodes for each keystroke; it should toggle visibility classes on existing LI nodes.

Filtering should work even when the TOC contains thousands of items.

D03 UI details and affordances (rev 00)

The search input should include a short inline hint (placeholder and/or helper text) stating wildcard support. Example hint text: "Filter paths (wildcards: * and ?), case-insensitive".

The UI should show a small result summary near the search input, such as "Showing X of Y". This should reflect items hidden by the search pattern but should not necessarily include items hidden by exclusions (see below) unless the design chooses to report both. If both are reported, it must be clear which is which.

Provide a quick clear action (for example an "x" button inside the input) that resets the search string. Clearing search restores all items except those excluded by the exclusion feature.

E00 Feature 2: Path segment chips with hover highlight and exclusion (rev 00)

E01 Goals and user experience (rev 00)

Enhance each TOC path presentation so users can quickly understand structure and exclude entire directory trees without typing patterns.

Key behavior:
By default (not hovering any path segment), the TOC path looks normal (no color-coded segment background). The path should remain readable and compact.

On hover over a path segment (for example hovering "assets" within "src/content/assets/bookmarks.css"):
That segment becomes visually highlighted with a non-destructive color treatment.
All other visible TOC items that include the same segment name in the same segment position should highlight that corresponding segment as well (global highlight). This helps users see "all items under assets at that depth" without clicking anything.

While hovering a segment, an exclusion control appears associated with that segment. Clicking this exclusion control excludes all TOC entries that belong to that segment's directory subtree (see below). This exclusion should be reversible via a reset action.

E02 Path segmentation rendering (rev 00)

For each TOC entry, the displayed path string must be rendered as a sequence of span elements representing segments, separated by a delimiter that visually preserves the path (typically "/"). For example:
"src/content/assets/bookmarks.css" becomes:
span.segment("src") + "/" + span.segment("content") + "/" + span.segment("assets") + "/" + span.filename("bookmarks.css")
Whether the filename is treated as a segment is implementation-defined, but exclusion applies to directory segments, not filenames, unless explicitly enabled. The primary use case is excluding folders.

Each segment span must carry enough metadata for:
Its normalized segment text (case-insensitive comparisons).
Its segment index (depth position from root, e.g. 0 for "src", 1 for "content", 2 for "assets").
Its full directory prefix (the path up to and including that segment, e.g. "src/content/assets" for the "assets" segment).
The file id and file path it belongs to (to support event delegation and toggling visibility).

E03 Highlight color system (rev 00)

The color treatment must be readable and non-destructive. The user explicitly wants consistent coloring for the same folder name (for the same segment position) across the TOC.

Constraints:
Text must remain legible under the highlight treatment.
The highlight should be subtle (light background or transparent background with a border), not a heavy fill that reduces contrast.
The implementation should prefer a deterministic color assignment so the same segment name always maps to the same hue, and different names tend to map to different hues.

Implementation guidance:
Use a stable hashing function of (segmentNameLowercased + ":" + segmentIndex) to pick a hue bucket.
Use modern perceptual color spaces if available (for example oklch) to produce consistent lightness and controlled chroma.
If oklch is unavailable, use HSL with constrained saturation and lightness, and apply a border rather than a strong fill.
Use CSS variables to express computed color values and apply them only during hover highlight states.

Default state must have no highlight color visible. Only on hover (or when a segment is part of the current global highlight) should the color style appear.

E04 Exclusion control design and selection behavior (rev 00)

When hovering a segment, show a small clickable exclusion icon near that segment. The user suggested a small "x" emoji, but the implementation may choose an icon glyph or a button element.

Critical behavior:
The exclusion control should not become part of text selection when a user selects the path text. This implies the control must be a separate element (for example a button) and styled with user-select: none. The path text itself should remain selectable if the user drags to copy it.
The control must be keyboard accessible. It should be focusable and activatable with Enter/Space, and it must have an accessible label like "Exclude folder src/content/assets".

The control should only be visible while hovering a segment (or while the segment is focused via keyboard). It should not clutter the UI.

E05 Exclusion semantics (rev 00)

Clicking exclusion on a directory segment excludes all TOC entries whose file path starts with that segment's directory prefix plus a path separator. Example:
If the user clicks exclude on the "assets" segment within "src/content/assets/bookmarks.css", the excluded prefix is "src/content/assets". All TOC items with paths beginning "src/content/assets/" are excluded from the TOC view.

The exclusion is scoped to the TOC only. It must not:
Remove file sections from main content.
Change hidden file state used elsewhere.
Change selection state except as needed to keep UI coherent (see below).

Multiple exclusions may be active simultaneously.

Excluded items must not be removed from the DOM tree. They must be hidden using a dedicated CSS class (for example "is-excluded") or attribute. This supports a fast revert and avoids re-rendering costs.

E06 Interaction with selection and existing TOC actions (rev 00)

If a TOC item is excluded, its checkbox should not count toward "selected" operations. The simplest rule is that excluded items are not visible and are treated as not selectable.

If the user excludes a segment and some of those items were previously selected, the selection should be updated so excluded items are removed from the selection set, and the TOC controls (copy/hide/show) update accordingly.

E07 Animation and feedback (rev 00)

When excluding items, apply a short CSS transition to indicate removal (for example fade-out and slight height collapse), then toggle the hidden class. The transition should be short and not block the UI.

The UI should provide a minimal status indicator that exclusions are active, such as a small chip "Exclusions: N" near the reset control.

F00 Reset and recovery (rev 00)

Provide a control at the top of the TOC (inside the same details content) that allows the user to revert exclusions.

Minimum requirement:
A single "Reset filters" (or "Reset exclusions") action that clears all exclusions at once and restores all items subject to the current search pattern.

If both search and exclusions exist, the reset behavior must be clear:
Option A: Separate actions: "Clear search" and "Clear exclusions".
Option B: One action that clears both search and exclusions.
Prefer separate actions to avoid surprising users who want to keep their search pattern while restoring excluded folders.

Because excluded items remain in the DOM, reset must simply remove the exclusion class from all affected items and clear the internal excluded-prefix set.

G00 Combined behavior: search + exclusion + hover highlight (rev 00)

The TOC visibility of any item is the conjunction of:
Not excluded by any active exclusion prefix, and
Matches the current wildcard search (or search is empty), and
Not hidden due to existing "hidden files" feature (existing behavior must remain in effect).

Hover highlight should apply only to items currently visible in the TOC list. Hidden or excluded items do not need to respond visually.

If the user hovers a segment that is present in currently visible items, global highlighting should paint those segments consistently across the visible subset.

H00 Usage scenarios and examples (rev 00)

H01 Quick find by wildcard (rev 00)

User opens the TOC details section and types:
"src/*/assets/*.css"
The TOC list reduces to only matching asset CSS files regardless of case. The list updates after a short debounce while typing. The user clicks a result to navigate.

H02 Find by simple substring without wildcards (rev 00)

User types "bookmarks.css".
The system treats it as "*bookmarks.css*" and filters accordingly, case-insensitive.

H03 Visual grouping by hover (rev 00)

The user scans the TOC and hovers "assets" in one row. All other visible rows that contain "assets" at the same segment depth highlight their "assets" segment. This confirms where assets are located across the project.

H04 Exclude a deep folder subtree (rev 00)

The user wants to remove noise from the TOC. They hover "src/content/assets" segment "assets" and click the exclusion icon. All items under "src/content/assets/" disappear from the TOC list with a quick fade. The rest of the app remains unchanged. The user continues working with a smaller TOC.

H05 Multiple exclusions (rev 00)

The user excludes "src/content/assets" and also excludes "src/generated". Both subtrees disappear. A small indicator shows two exclusions active.

H06 Recovery (rev 00)

The user clicks "Clear exclusions" and the excluded items return immediately (subject to the current search field). No page reload, no rescanning.

I00 Data model and state handling for Codex (rev 00)

Maintain TOC-only state that tracks:
Current search pattern string (raw).
Compiled wildcard matcher or equivalent.
Active exclusion prefixes (for example a Set of normalized directory prefixes).
A per-TOC-item computed path segments array (optional cache) to avoid repeated splitting while filtering.

The state must not leak into core file state such as state.files or hiddenFiles beyond what is necessary to update selection and the TOC UI.

J00 Accessibility and keyboard behavior (rev 00)

Search input must be reachable by keyboard when the TOC details is open.

Segment highlighting should work for keyboard focus as well as mouse hover. If a segment (or its row) can be focused, focusing it should trigger the same highlight behavior as hover.

Exclusion control must be a real interactive element with:
tabindex,
aria-label that includes the segment and path prefix,
Enter/Space activation.

K00 Acceptance criteria (rev 00)

K01 Wildcard search (rev 00)

Typing in the TOC search input filters only the TOC entries, case-insensitive, supporting "*" and "?" semantics.
Filtering is debounced and remains responsive for large TOCs.
Clearing the input restores all non-excluded items.

K02 Segment hover highlight (rev 00)

Paths are rendered as segments.
No segment styling appears when not hovering or focused.
Hovering a segment highlights that segment and highlights corresponding segments in other visible rows that share the same segment name at the same depth.

K03 Exclusion (rev 00)

Hovering a segment reveals an exclusion control.
Clicking exclusion hides all TOC items under that segment prefix, without removing DOM nodes.
Excluded items can be restored via a reset control.
Excluded items do not participate in selection-based operations, and selection state updates to remove newly excluded items.

K04 Scope constraints (rev 00)

All controls and UI changes live inside the TOC details area and do not appear when the TOC details is collapsed.
No behavioral changes occur outside the TOC except those strictly necessary to keep selection and TOC controls consistent.
