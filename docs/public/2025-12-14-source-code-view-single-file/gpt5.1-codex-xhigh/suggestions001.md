# Fixes and suggestions iteration 1
Date: 2025-12-14



Actual Screenshot: 

![image-20251214100621332](suggestions001.assets/image-20251214100621332.png)



A00 Fixes and Suggestions, Iteration 1 (rev 03)

This document defines required UX and UI fixes for the initial empty and loading screens, plus a full visual redesign. Built-in search is out of scope and must be removed entirely. The focus is a clear first-run flow, correct control states, strong orientation, a usable project tree, and readable stats.

B00 Scope and hard removals (rev 01)

Search removal

- Delete search as a feature and delete all related UI, state, and logic.
- Remove search input, Case and Whole checkboxes, Clear button, match counters, keyboard shortcuts for search, results list, match highlighting, indexing, snippet generation for search, and any worker code used only for search.
- Remove any sidebar sections dedicated to results. Sidebar is tree-only.

Empty state responsibility

- Since search is removed, the empty state must clearly explain what the app does and how to start, without relying on "search loaded code" as a hint.

C00 First-run empty state and primary action (rev 01)

Problem: The user lands on an empty page with a dense header and no strong focal point. The main content area is blank and does not tell the user what to do.

Change: Replace the empty main pane with a centered "Project not loaded" panel. This panel is the visual focus of the screen and must include a large primary button.

Empty-state panel content

- Title: "No project loaded"
- One sentence: "Open a folder to load code locally and view it as one page."
- Secondary sentence in smaller text: "Nothing is uploaded. Works best in Chrome or Edge."
- Primary button (large): "Open folder"
- Secondary button (small or link): "Use file picker"
- Optional help link: "Browser support" that opens a short modal explaining folder picker limits

Behavior

- If folder picker is unsupported, show an inline message: "Folder picker not supported in this browser. Use file picker." and focus the fallback button.
- In empty state, hide any busy counters and avoid rendering a blank whitespace-only canvas.

D00 Global layout redesign (rev 01)

Problem: The current header mixes identity, actions, counters, and inactive controls, creating noise before load.

Change: Use a three-zone layout with clear hierarchy.

Zone 1: Top bar (thin, calm)

- Left: app name and short subtitle
- Right: Settings only
- No counters and no load actions here

Zone 2: Control bar (contextual)

- Empty state: can be hidden, or show only a small "Ready" status chip
- Loading state: show progress and Cancel
- Loaded state: show compact project summary stats and active file indicator

Zone 3: Body

- Empty state: hide the sidebar and show the centered empty-state panel
- Loading and loaded: show sidebar (tree) and main code pane

E00 Control correctness and discoverability (rev 01)

Problem: Multiple entry points to load content are present but not clearly ranked. Cancel can appear available when it should not.

Change: Make "Open folder" the only primary action. "Use file picker" is secondary and must not compete visually.

Change: Cancel must be disabled and visually inactive unless a scan or read is in progress. When enabled, it must stop scanning and reading as soon as possible and switch state to "Cancelled" while keeping already loaded content visible.

Change: Settings stays accessible but separated from load controls by placement (top bar) and spacing.

F00 Control state model (enable, disable, visibility) (rev 01)

State: Empty (no project loaded)

- Enabled: Open folder (primary), Use file picker (secondary), Settings
- Disabled: Cancel
- Hidden: progress counters, project summary counters (optional: show only "0 files"), active file details beyond "Active: none"

State: Loading (scanning and reading)

- Enabled: Cancel, Settings (optional, but must not break load)
- Disabled: Open folder, Use file picker (prevent concurrent loads)
- Visible: a single progress line with consistent labels: state (Scanning or Reading), dirs visited, files included, files read, skipped, errors, bytes read, lines
- Sidebar: either appears with incremental tree growth, or shows a "Loading project..." placeholder until first nodes exist

State: Loaded (ready)

- Enabled: Open folder (as "Load another"), Use file picker (optional), Settings, sidebar interactions
- Disabled: Cancel
- Visible: project summary stats and active file indicator

State: Cancelled (partial load)

- Enabled: Open folder, Use file picker, Settings
- Disabled: Cancel
- Visible: neutral banner "Loading cancelled. X files loaded."

G00 Header information density and consistency (rev 01)

Problem: Counters can be duplicated and hard to interpret.

Change: Define one authoritative set of counters and one location for them. Prefer one compact status line in the control bar only when loading or after load.

Change: Use unambiguous labels.

- "files included" means passed filters
- "files read" means successfully read into memory
- "bytes read" always refers to read volume

Change: Use human units for bytes (KB, MB, GB) with exact value on hover. Lines remain integer.

Change: In empty state, hide the wall of zeros. Only show "Ready" or "No project loaded."

H00 Sidebar and tree navigation redesign (rev 01)

Problem: Sidebar currently mixes tree and results and shows inert placeholders before load.

Change: Sidebar becomes "Navigator" with "Project tree" only.

- Remove any "Search results" section and any "Tree and results" wording.
- In empty state: hide sidebar entirely.
- In loading: show a loading placeholder or incremental tree, but do not show dummy nodes that imply loaded structure when none exists.
- In loaded: show full tree with expand and collapse like common editors.

Tree behavior

- Directories expand and collapse via caret and via clicking the directory row.
- Files open by clicking and jump main pane to the file section header.
- The active file must be highlighted in the tree based on scroll position.

Pinned vs overlay

- Default after load: pinned
- Pin toggle must reflect true state and be labeled by action: "Pin" or "Unpin"
- Unpinned mode collapses to a thin edge handle and expands on hover as an overlay
- Overlay auto-collapses after a short delay when the pointer leaves, unless pinned

Resizable sidebar

- When pinned, user can drag to resize within min and max widths.

I00 Orientation and active file context (rev 01)

Problem: Without search, orientation must rely on tree and visible file context.

Change: Add a dedicated active file indicator that is always present in the control bar during loading and loaded states.

- Empty: "Active: none"
- Loaded: "Active: " truncated with full path on hover
- Optional: "Line: " when line tracking exists

Change: File section headers must be strong orientation anchors.

- Show path, language badge, line count, size
- Provide a one-click copy-path action
- Use sticky or near-sticky styling where feasible so the user keeps context while scrolling

J00 Stats presentation and split between progress and summary (rev 01)

Problem: Stats can be noisy in empty state and unclear between "progress" and "project summary".

Change: Split stats into two layers.

Progress stats, visible only during loading

- state, dirs visited, files included, files read, skipped, errors, bytes read, lines (sum of read files)

Project summary stats, visible once any files are loaded

- files loaded, total lines, total bytes, skipped, errors
- optional: top languages by lines, largest files

Change: Provide an optional Stats panel button that opens a compact overlay listing language breakdown and largest files. Keep it hidden until at least one file is loaded.

K00 Visual theme redesign (rev 01)

Problem: The current green-heavy header dominates the screen and increases visual fatigue.

Goal: Replace with a neutral, code-friendly palette and calm surfaces.

Theme rules

- Background: off-white or very light gray
- Top bar: near-white surface with subtle bottom border
- Control bar: slightly tinted light surface distinct from body
- Sidebar: light-gray surface distinct from main pane
- Primary accent: a single calm blue used for primary button, active selection, focus ring
- Borders: muted gray
- Error: restrained red used only for errors
- Warning: amber used only for warnings
- Code area: near-white with monospace font and comfortable line height
- Avoid large saturated color blocks behind controls

Button hierarchy

- Primary button: filled accent, strong contrast, large size in empty state
- Secondary button: outline or ghost style, same accent, lower weight
- Disabled controls: clearly disabled with reduced opacity and no hover affordance

Typography

- One UI font stack for controls and labels
- Monospace only for code
- Use consistent spacing and alignment; avoid scattered counters

L00 Loading screen flow (user flow and UI transitions) (rev 01)

Step 1: Arrival

- User sees centered empty-state panel with a large "Open folder" button.
- No sidebar, no progress counters, no dead controls.

Step 2: Selection

- Clicking Open folder launches folder picker when supported.
- If unsupported, the UI guides to "Use file picker" without leaving the page.

Step 3: Loading

- UI switches to Loading state.
- Control bar shows progress and Cancel.
- Open folder and file picker disable.

Step 4: Ready

- Sidebar appears with tree.
- Project summary stats appear.
- Active file indicator updates as user scrolls or opens a file from the tree.
- Cancel disables.

Step 5: Cancelled

- If user cancels, show a neutral banner with partial totals. Already loaded content remains available.

M00 Additional small UX improvements (rev 01)

Keyboard-first

- In empty state, Enter activates "Open folder".
- Esc closes modals and panels.

Error messaging

- If permission denied, show inline message with a retry button.
- If zero eligible files are found, show "No supported source files found" and a link to Settings to adjust filters.

Reduce noise

- Hide zeros in empty state.
- During loading, show one coherent progress line, not multiple scattered counters.

N00 Acceptance checks for this iteration (rev 01)

Empty state shows a centered panel with a large primary Open folder button and short explanation. The main pane is not blank.

There is no search input, no search toggles, no match counters, and no results panel. No search logic remains in code.

Cancel is disabled while idle and enabled only during loading.

"Open folder" is primary, "Use file picker" is secondary and only shown or emphasized when needed.

Stats are consistent, not duplicated, and split between progress and project summary. Empty state does not show a wall of zeros.

Sidebar is tree-only, supports expand and collapse, supports pinned and overlay behavior, and highlights the active file based on scroll.

The green-heavy theme is replaced with neutral surfaces, a single accent color, readable typography, and clear separators.
