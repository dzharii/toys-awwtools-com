2026-02-13

A00 UX specification overview (rev 00)

This document specifies the user experience and user interface for 2026-02-13-fancy-media-player, a static, single-page, audio-first web application for ad hoc folder-based listening, preview, and file list extraction. The user opens a local folder, the app incrementally indexes audio-capable media files recursively, and the user plays tracks, sees a digital visualization, selects subsets, and copies relative paths or filenames to the clipboard.

The UX is optimized for professional users who value density, speed, and determinism over tutorials. The application must avoid blocking the UI during indexing, must visibly communicate progress and status, and must allow immediate interaction with already-indexed items while scanning continues. The UI must occupy the full viewport with minimal padding, maximize information-per-pixel, and remain legible and ergonomic.

This UX spec intentionally constrains behavior and layout to reduce implementer interpretation. Where a decision could be ambiguous (for example, single-click vs double-click playback), this spec defines a single rule and treats alternatives as out of scope for rev 00.

B00 Users, intent, and value narrative (rev 00)

The user arrives with a local folder that contains audio files (often nested) and a concrete, time-bounded task: “preview what is in here” and “extract file names/paths for further work.” This is not library management. The user does not want to import into a heavyweight media app, does not want to create persistent playlists, and does not want to pollute an existing music library with temporary items. The expected pattern is open, scan, act, exit. The app’s value is that it provides a clean, isolated workspace scoped to a single folder selection.

The user experience is designed around the idea of “folder as session.” A session starts when a folder is selected and ends when the tab is closed or a new folder is selected. Within the session, the user expects three things to be fast and trustworthy: locating an item in a large hierarchy, starting playback quickly, and copying an exact list of items they selected. The app must support high-volume folders (thousands of files) without freezing and must remain usable before indexing completes.

The app should feel like a technical tool rather than entertainment software: clear status indicators, deterministic actions, minimal animation beyond the visualization, and zero modal “wizard” flows. When something cannot be played or metadata cannot be extracted, the UI must communicate this as a stable attribute of the row rather than an interruptive prompt.

C00 Usage scenarios and problem statements (rev 00)

C01 Scenario 1: Ad hoc folder auditioning without installation

The user has received a folder of audio assets (for example, stems, drafts, exported mixes, or a collection from a collaborator). They want to quickly audition content without installing a player, importing into a library, or reorganizing files. The user opens the web app, selects the folder, and immediately begins playing files as they appear in the list while indexing continues. The user can skim by double-clicking rows and letting auto-advance play through a sequence. The user closes the tab afterward; no persistent state is required for the primary workflow.

The value here is the “zero setup, zero side effects” property. The user’s machine remains unchanged. There is no library database, no playlist persistence, and no reliance on external services. The app is disposable and repeatable: each folder selection is its own session.

C02 Scenario 2: Large hierarchy triage and shortlist extraction

The user has a folder tree with many subfolders representing versions, takes, or categories. They need to shortlist a subset for follow-up (for example, “these 12 tracks are the candidates”). They open the folder, collapse irrelevant folder groups, and use checkboxes to select the shortlisted files. They then copy the selected relative paths as a newline-separated list and paste it into a ticket, a note, or a script input. Playback is used to validate choices and confirm that a given file is the desired take. The user expects the copied list to remain stable and predictable relative to the folder root they selected.

The value here is combining listening with deterministic export. The selection model is independent of playback so the user can select a set while continuing to audition other files. Copy output is tailored for downstream tooling, and relative paths allow the list to be meaningful when shared with someone who has the same folder structure or when used in automation within that folder context.

C03 Scenario 3: QA pass for media compatibility and corrupt files

The user is validating a batch export for compatibility and integrity. They want to identify which files are playable in modern browsers and which are not, and they want a quick way to detect decoding errors or malformed files. The app indexes and marks playability per item. The user can attempt playback on any “maybe” item, and failures are recorded in-row as disabled or error states. The user selects all problematic items and copies their relative paths to report issues or run remediation scripts.

The value here is a fast, human-in-the-loop “smoke test.” The app provides immediate feedback on playability classification and detects decode errors during metadata load or playback attempts. The user does not need specialized QA tooling; the browser becomes the test harness.

C04 Scenario 4: “What is this file?” metadata discovery and organization assist

The user has a folder of audio where filenames are messy, truncated, or unhelpful. They want to identify tracks by embedded tags (title, artist, album) or at least by duration and size. The app shows human-friendly duration and file size and, when possible, displays extracted tags. The user uses the metadata columns to distinguish duplicates and identify meaningful items. They may copy filenames or paths after identifying the right files to rename later using their own tools.

The value here is surfacing “identity signals” beyond the filename, without requiring a dedicated tagging application. The app remains read-only while still enabling organization work by exporting the relevant paths/names.

C05 Scenario 5: Rapid sampling and navigation during creative work

The user is producing audio or video and has a folder of candidate samples or cues. They need to quickly skim content, jump around, and keep focus in the browser while working in another tool. The app supports keyboard navigation and tight controls so the user can keep one hand on the keyboard and one on the mouse. Auto-advance and “play next playable” help the user move through a set without constant manual intervention. The visualization provides a quick sense of intensity and dynamics even without focused listening.

The value here is reducing friction in a “flow” task. The app behaves like a lightweight, single-purpose audition tool that does not demand attention for library management or configuration.

C06 Scenario 6: Controlled sharing of lists without sharing content

The user wants to share a list of tracks that exist in a folder structure (for example, a cue sheet draft), but they do not want to upload files or expose content to a service. The app runs locally in the browser and the user copies only relative paths (or names) into a document. The result is a clean, portable list that can be compared, reviewed, or used as a reference, while the media itself remains local.

The value here is privacy-preserving extraction. The app does not transmit data and does not require external accounts or sync.

D00 UX principles and how they support the scenarios (rev 00)

D01 Immediate utility and “session starts with folder”

The first interaction must be a single clear action: Open folder. This supports the ad hoc nature of the scenarios and sets a mental model that the folder is the scope. The app must not distract with preferences, onboarding, or empty chrome. The Empty state must be minimal and purposeful: a prominent Open folder control and a brief statement that the app will scan recursively and will not upload files.

After folder selection, the user must see evidence that indexing is underway within 250 ms of returning from the picker. Evidence means the status strip changes to Scanning and displays an increasing indexed counter. Even if the folder is huge, the user must feel that the system is responding and progressing.

D02 Continuous responsiveness during scanning

Indexing must be incremental and must never freeze the UI. This directly supports the large hierarchy triage scenario and the rapid sampling scenario. The user must be able to scroll, collapse folders, select checkboxes, and start playback of already-indexed files while the scan continues. The scan status must remain visible but non-modal. The user should never be forced to wait for scanning to finish to begin work.

The UX rule is that “scan is background work.” Foreground work is browsing and playback. The app’s UI must always prioritize the responsiveness of foreground interactions over scan speed.

D03 Information density without clutter

The UI must provide sufficient columns to make decisions quickly: a primary identity label, duration, size, and playability status at minimum. Folder grouping provides context without consuming width. Controls must be compact and icon-first where obvious (play/pause), but text labels must be used where ambiguity would harm speed (copy actions). This supports professional users who scan visually and rely on stable spatial layouts.

“Density” does not mean tiny text. The default typography must remain readable, but the layout must avoid large paddings, oversized headers, or decorative empty areas. The visualization is allowed to be visually rich because it conveys signal, but it must not reduce playlist usability.

D04 Deterministic selection and export

Checkbox selection must be independent of the current playing item, and selection state must never change implicitly due to playback. This is critical for shortlist extraction and QA scenarios. The user must trust that “Copy selected” exports exactly what they selected, in a stable order, without hidden filters.

The export format must be exact and predictable. Relative paths use forward slashes and are always relative to the selected root. The UI must label exports explicitly as “relative paths” and “filenames” so the user understands what will be copied.

D05 Playability as a first-class attribute

Unsupported or failed files must be visible but clearly disabled for playback. This supports QA and avoids confusion during auditioning. The user must never discover unplayability only after a silent failure; the row must already communicate “Unsupported” or “Error” and playback activation must be blocked. “Maybe” means the browser might play it; attempting playback is allowed and will refine the row state.

D06 Fast navigation and minimal modes

The user should not need multiple screens. The experience must be one screen with two panes. The only “mode” is whether scanning is ongoing; all other features remain accessible. This supports ad hoc use and reduces cognitive load.

E00 Interaction model and ergonomics (rev 00)

E01 Mouse interaction rules

Single-click on a row sets focus (the “current row”) and updates the right pane’s track details preview, but does not start playback. Double-click starts playback if the row is playable. Double-click on an unplayable row must do nothing except preserve focus. Clicking the checkbox toggles selection without changing playback state.

Clicking a folder header toggles collapse/expand. A collapsed folder header must show a count of items inside. Collapsing must not destroy selection state for items inside; selection persists even when rows are hidden.

Right pane controls must be reachable without fine motor precision. Buttons must have consistent hit areas. The seek bar must be usable with click-to-seek and drag-to-seek once duration is known.

E02 Keyboard interaction rules

The app must support keyboard-first navigation as a first-class path. Focus begins in the playlist after scanning begins. Arrow Up/Down moves the current row. Page Up/Down scrolls by viewport-sized increments. Enter starts playback of the current row if playable. Space toggles play/pause when a track is loaded; if no track is loaded, Space must start playback of the current row if playable. Ctrl+C must not be overridden globally; copy operations are explicit via buttons. The app may provide dedicated shortcuts for copy selected, but only if they do not conflict with common browser shortcuts; the default rev 00 behavior is that copy uses UI buttons.

E03 Playback continuity and auto-advance

While scanning continues, playback must be stable. Auto-advance must skip unplayable items and proceed to the next playable in current playlist order. The user must be able to manually skip next/previous among playable items. If the current track becomes unavailable (for example, permission loss), playback stops and the row is marked error.

E04 Feedback and microcopy rules

Status messages must be terse and numeric. During scanning, show “Scanning: N indexed, M candidates, P playable, E errors.” After scanning completes, show “Indexed: N files, Playable: P, Unsupported: U, Errors: E.” The word “Unsupported” is reserved for codec/container unplayability; “Error” is reserved for failures to read/probe/play due to exceptions or permission issues.

Non-blocking error banners must include an action if one exists. For example, permission loss banner text must include “Re-open folder” as a clickable action that triggers the folder picker.

F00 UI layout specification (rev 00)

F01 Viewport structure

The viewport is divided into three horizontal bands: a top status strip, a main content region, and an optional bottom micro-strip for transient toast-like confirmations. The bottom strip must never cover essential controls; it occupies a thin line and auto-hides after 2 seconds for success confirmations (for example, “Copied 12 paths”).

The top status strip is fixed height and always visible. The main region fills the remaining height and contains the two-pane layout.

F02 Two-pane layout geometry

On screens wider than 900 px, the main region is split: left playlist pane at approximately 65 percent width and right player/visualization pane at approximately 35 percent width. The split is fixed in rev 00 to avoid adding complexity; no resizer handle is required.

On screens narrower than 900 px, the main region stacks vertically: player/visualization pane on top with fixed height (at least 240 px), playlist below filling remaining space. Controls remain visible; playlist remains scrollable.

F03 Status strip contents and placement

Left side: Open folder button, scan status text, and a small spinner indicator during Scanning.

Right side: selection actions cluster containing Select all, Clear selection, Copy paths, Copy names. These controls are disabled when the playlist is empty. Copy actions are enabled only when selection count is greater than zero; when disabled they must still be visible to communicate capability.

F04 Playlist pane layout

The playlist pane is a grid with a header row and scrollable body. The header row must remain sticky during scroll. Column widths must favor the primary name column. The checkbox column is narrow. Duration and size columns are compact and right-aligned. Playability status column is compact and left-aligned. A folder grouping header spans the grid width and is visually distinct but minimal.

Folder headers must show the folder relative path (or folder name if within root) and an item count. They also show a collapse indicator. The header itself is not selectable; clicking it collapses/expands.

Rows must have a hover state and a focused state. The focused state is the “current row.” The playing row has a separate indicator (for example, a small glyph in the name column or a highlighted left border). If a row is both focused and playing, the playing indicator dominates.

F05 Player pane layout

The player pane is divided vertically into: track info header, transport controls row, seek row, and visualization canvas occupying the remainder.

Track info header displays, in one line if possible, “Title - Artist” when available, else filename. A secondary line shows relative path (truncated with middle-ellipsis), and on the right shows duration and size. Truncation must preserve file extension visibility.

Transport controls row includes Previous, Play/Pause, Next, and optionally Stop. These are compact rectangular buttons. The play/pause button is visually primary. A Random control is not included in rev 00 unless explicitly requested later; the “random file by double-click” requirement is satisfied by user choice rather than shuffle.

Seek row includes current time, seek bar, and total duration. The seek bar is disabled until duration is known. Volume control sits at the end of the seek row as a compact slider with a mute button.

Visualization occupies all remaining space and renders a digital spectrum or waveform with a clean, technical aesthetic. The background is dark or neutral, with bright signal strokes. The visualization must never overlap controls and must adapt to resizing.

G00 Visual design rules (rev 00)

G01 Style intent

The UI must look modern and professional, with a technical tool vibe. Decorative gradients, heavy shadows, and oversized rounded corners are disallowed in rev 00. The design should read as “dense, intentional, minimal.”

G02 Space usage

Default padding is minimal. Gaps exist only to separate distinct functional clusters. The playlist must show as many rows as possible without reducing readability below an acceptable threshold.

G03 Color and state semantics

There must be consistent color semantics for states: playing, focused, selected, unsupported, error. Unsupported rows must appear muted. Error rows must be distinct and include a short reason string in a tooltip or a small detail area. Selected rows must be visually obvious without overpowering the playing indicator.

G04 Typography

Use a single sans-serif font stack available by default. Use consistent numeric alignment for durations and sizes. Avoid oversized headings. The track name column must remain legible at a glance.

H00 Track identity display and metadata strategy (rev 00)

H01 Display name rule

The primary display name shown in the grid must be determined as follows: if tag title exists and is non-empty, use it; else use filename without extension; if filename is empty or invalid, use the relativePath last segment. If tag artist exists, show it in a secondary style adjacent to title or in a separate column if the implementer chooses; rev 00 default is a single name column that can render “Title - Artist” when both exist.

H02 Metadata availability messaging

Metadata extraction is best-effort. The UI must not promise metadata. Rows without tags simply show filename-based identity. The player pane may show “No tags” as a subtle note in the track info area if the user expects tags.

H03 Artwork handling

If embedded artwork is extracted, it may be shown as a small square thumbnail in the player pane track info header. It must not consume more than the height of the track header area. If absent, no placeholder artwork box should be shown; reclaim the space.

I00 Scanning experience and progress presentation (rev 00)

I01 Progressive reveal of content

As files are discovered, folder groups and rows must appear incrementally. The list must not wait for scanning to complete before rendering. The user must be able to interact with already-rendered content immediately.

I02 Progress counters and meaning

The scan status must be explicit and numeric. “Indexed” counts all files discovered. “Candidates” counts files matching candidate extensions. “Playable” counts files classified playable-probably or playable-maybe by canPlayType. “Errors” counts read/probe failures. The user must be able to understand at a glance what the scan is doing and how much has been found so far, without estimating time remaining.

I03 Completion behavior

When scanning completes, the spinner disappears and the status text switches to a completed summary. No modal or alert is allowed. If errors occurred, the completed summary must still display the error count.

I04 Large folder behavior

For very large folders, the app must remain responsive and must not attempt to render an unbounded number of DOM nodes at once. The UX requirement is that scrolling remains smooth and row interaction remains responsive. If virtualization is implemented, it must not break selection persistence. Selecting a row that later scrolls out of the render window must remain selected when it returns.

J00 Playability labeling and user expectations (rev 00)

J01 Row label rules

Playable-probably rows show “Playable.” Playable-maybe rows show “Maybe.” Unplayable by canPlayType shows “Unsupported.” Probe failures show “Error.” These labels must be short and consistent across grid and player pane.

J02 User action on “Maybe”

A “Maybe” row is allowed to play. On successful load, the label can be upgraded to “Playable.” On failure, it must be downgraded to “Unsupported” or “Error” depending on failure type. The user must see the updated label immediately after the attempt.

J03 Video container handling in audio-only UI

If the file is a video container that contains audio, playback is allowed but the UI must never show video. The row remains in the same grid. The player pane remains the same. The user experiences it as an audio track.

K00 Selection and clipboard UX (rev 00)

K01 Selection visibility and count

The status strip must show selection count when selection is non-empty, for example “Selected: 12.” This supports shortlist and QA scenarios by keeping selection state visible even when the user scrolls.

K02 Select all semantics

Select all selects all currently indexed rows, including unsupported and error rows. If folder groups are collapsed, their hidden rows are still included because collapse is a view control, not a filter. This is deterministic and prevents confusion.

K03 Copy semantics and confirmation

Copy paths copies relative paths for selected rows in the current playlist order, one per line, with forward slashes. Copy names copies display names or filenames; rev 00 rule is to copy relativePath if the user needs deterministic identifiers, and copy filenames only when explicitly requested via the Copy names button. After copy succeeds, show a transient bottom-strip confirmation with the count copied. If copy fails, show a persistent error banner and provide a visible fallback text area containing the exact export text for manual copy.

L00 Detailed screen walkthrough (rev 00)

L01 Empty state screen

The page shows a compact top strip with Open folder on the left and disabled selection controls on the right. The main region shows a centered, single-paragraph instruction: “Open a folder to index audio files recursively. Files stay local.” No other UI appears. The intent is to avoid distractions and guide the user to the only required first action.

L02 Scanning state screen

After folder selection, the left pane shows folder headers and rows appearing progressively. The top strip shows a spinner and counters incrementing. The right pane shows the player controls in a disabled state with a neutral visualization idle render, indicating the player is ready but no track is loaded. The user can scroll and interact immediately. Double-click on a playable row starts playback and the visualization becomes active.

L03 Playing state screen

The playing row is indicated clearly in the grid. The right pane shows track info, a working seek bar, and the visualization running. The user can continue to select rows, copy selections, collapse folders, and navigate without interrupting playback. If the user double-clicks another playable row, playback switches immediately to that track. Auto-advance moves through playable items in order.

L04 Error and unsupported presentation

Unsupported rows are muted and clearly labeled. Error rows additionally show an error indicator. Clicking or double-clicking them does not start playback. The user can still check them for selection and copy purposes. If a playback attempt fails mid-track, playback stops, the row becomes error, and an error banner appears with a short reason.

M00 UI component specification (rev 00)

M01 Buttons and controls

All buttons are rectangular with consistent height. Icon buttons are allowed for transport controls (previous, play/pause, next). Text buttons are required for actions that could have irreversible meaning to the user’s workflow, specifically copy actions and open folder. Disabled buttons remain visible.

M02 Grid rows and columns

The grid header remains sticky. Columns are: checkbox, name, duration, size, status. Name is left-aligned and expands. Duration and size are right-aligned and use monospaced digits if feasible (or tabular-nums font feature). Status is left-aligned and short.

M03 Truncation

Long names and paths must truncate with ellipsis. In the player pane, relative path truncation must preserve the filename and extension by using middle-ellipsis behavior. In the grid, name truncation is end-ellipsis.

M04 Visualization component

The visualization is a canvas occupying the available space in the player pane. It supports dynamic resizing. The visualization must be readable at a glance and must not be over-stylized. It must be visually calm when paused and active when playing.

N00 UX acceptance criteria (rev 00)

The application must allow a user to select a folder and begin playing an indexed track before scanning completes, without visible UI freezing during scanning.

The playlist must remain usable with thousands of items: scroll remains smooth, row hover/focus states remain responsive, and selection persists across scrolling and folder collapse.

Copy operations must be deterministic: the exported text matches the selected rows exactly, uses consistent path formatting, and provides a visible fallback if clipboard APIs fail.

Playback must be predictable: double-click plays, single-click focuses, unsupported rows cannot be played, and auto-advance skips unsupported rows.

The interface must be space-efficient: the playlist shows a high number of visible rows per viewport, controls are compact, and no large decorative regions exist beyond the visualization which provides functional feedback.
