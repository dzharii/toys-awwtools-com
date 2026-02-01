2026-02-01

A00 Document purpose and positioning

This document is a UX-oriented specification for a minimal JSON formatter and validator web tool. It describes the user-facing purpose, the intended value, and the concrete UI behaviors that must be implemented. It complements the functional specification by focusing on layout, interaction rules, visual states, accessibility, and user workflows. It ends with an implementation to-do list that includes work derived from both the functional specification and this UX specification.

B00 Product purpose and user value

The tool exists to help developers quickly validate and format JSON without opening an IDE. The core value is speed and clarity: paste JSON, immediately see whether it is valid, obtain a clean formatted representation, and if invalid, jump to the problem location even when the input is large. The tool must stay minimalistic in appearance and interaction, avoiding feature creep while still providing high-leverage conveniences that reduce repetitive manual work: formatting modes, copy/minify actions, and navigable error locations. It must remain responsive with large payloads and must not introduce editing lag.

C00 Target users and primary use cases

Primary users are developers working with API payloads, logs, configuration fragments, and JSON responses. Primary use cases are: verifying whether a pasted payload is valid JSON; producing a readable pretty-printed version; producing a minified version for transport or embedding; normalizing key order for diff readability when desired; locating parse failures quickly via error navigation; and inspecting basic structure and warnings such as duplicate keys.

D00 UX principles and constraints

The UI must remain visually minimal, calm, and deterministic. The user should not be asked questions or forced through steps. Every interaction must have a clear and immediate outcome. Native textarea controls are required and must not be replaced by a third-party editor. No syntax highlighting is included. No persistence is included. Keyboard Escape must not be required for any flow. Any control that changes user input must be explicit and user-initiated.

E00 Page layout and visual structure

The page uses a single centered container with a title at the top. Below the title are two editor panes arranged side-by-side on wide screens. On narrow screens the editors stack vertically with input above output. Each pane contains an editor header row and an editor body.

The editor header row contains the pane label, a compact status bar showing caret position, and any pane-specific controls. The tool-level toolbar is visually associated with the editors and placed in a consistent location, preferably between the header row and editor body or aligned to the top-right of the editor region. The structural summary panel sits below the editors, aligned with the container width.

Spacing, borders, and typography are minimal. The editors use monospace font. Line number gutters are visible but subdued. Status text and icons are legible and not overly saturated.

F00 Editors and gutters

F01 Input editor

The input editor is the primary interaction surface. It is editable and supports paste and typing. It includes a non-selectable line number gutter at the left, aligned to the text lines. The gutter must scroll vertically in sync with the textarea. The gutter must not intercept normal text selection inside the textarea.

F02 Output editor

The output editor is read-only and displays formatted JSON. It includes a matching line number gutter. It supports user selection for copying and caret navigation inside the read-only content.

F03 Gutter behavior for large documents

Line number rendering must be windowed. The user experience requirement is that scrolling stays smooth even for very large inputs. The gutter must not attempt to render one DOM element per line for large documents. The visible line numbers should appear continuous while scrolling, with no distracting flicker.

G00 Status bars and validation messaging

G01 Per-editor caret status

Each editor shows a caret status string in the form "Ln N:Col M". When the editor is not focused, it may show the last known caret position or a neutral placeholder; it must not jump erratically. When focused, it updates as the caret moves by typing, clicking, or selection changes. Updates must feel immediate while remaining performance-safe.

G02 Global validity status

The tool must communicate one of four states in the main status area near the input: Empty, Processing, Valid, Invalid. The displayed status must include text and must not rely on color alone. Color may be used as a secondary cue. The status area must be an aria-live region so state changes are announced to assistive technologies.

G03 Invalid state content and action affordance

When invalid, the status message must show a normalized error label and location when available. When a location is available, the status must include a prominent but minimal action control to navigate to the error, such as a link-like button labeled "Go to error". The control must be clearly clickable and must not be visually buried in dense text.

G04 Raw error details disclosure

Raw parser error text may be shown behind a "Details" disclosure to keep the default UI minimal. The disclosure must not dominate the page. It should be collapsible and closed by default.

H00 Error navigation and jump-to-location UX

H01 Go to error behavior

Activating "Go to error" must focus the input editor and move the caret to the error offset. It must scroll the editor so the caret is visible. It must not select text by default. This reduces the risk of accidental overwrite while preserving the speed benefit.

H02 Jump-to-location entry via caret status

The caret status display for each editor supports a jump entry mode. The UX is: the user double-clicks the caret status string, and it transforms into a small inline editor control that accepts a target in the form "N:M" representing line and column. This control includes a Go button and a Cancel button visible in the UI. Cancel must revert without navigation and without requiring keyboard Escape. The inline editor should be small and visually consistent with the minimal look.

H03 Jump entry validation feedback

If the user enters an invalid format, the inline editor must show a clear, small validation message near the control, for example "Use N:M". It must not use intrusive dialogs. If the user enters out-of-range values, the tool clamps the destination silently and navigates.

H04 Focus management

When entering jump edit mode, focus must move into the inline input field. When Go completes, focus moves to the target editor. When Cancel completes, focus returns to the status display area or remains stable; it must not jump to unrelated page elements.

I00 Toolbar UX and behavior

I01 Toolbar composition

The toolbar must include exactly these actions: Format, Minify, Copy Input, Copy Output, Clear Input, Swap Output to Input. Each action is a single button with an icon. Emoji icons are acceptable. Each button must have an accessible name via aria-label and a tooltip via title if visible labels are not used.

I02 Enablement and disabled states

Disabled buttons must be visually disabled and must not respond to clicks. The enablement rules are: Format and Minify enabled when input is non-empty; Copy Input enabled when input is non-empty; Copy Output enabled when output is non-empty; Clear Input enabled when input is non-empty; Swap Output to Input enabled when output is non-empty.

I03 Action confirmations

Copy actions may show a subtle transient confirmation such as "Copied" near the toolbar or status area for a short duration. This confirmation must not be a modal dialog and must not shift layout significantly.

I04 Focus behavior for actions

Format, Minify, and Swap Output to Input must focus the input editor after completion. Clear Input must focus the input editor after completion. Copy actions must preserve current focus.

J00 Formatting options UI

J01 Exposed settings

The UI must expose the formatting mode selector with three values: Pretty, Compact, Minify. It must expose indent width with two values: 2 and 4. It must expose Sort keys as a toggle. These controls must be compact and placed near the toolbar or near the output label, without expanding the page into a settings panel.

J02 Interaction rules for settings

Changing any setting triggers immediate reprocessing. If input is empty, settings changes do not trigger parsing and do not change output.

J03 Compact mode explanation

Because Compact is a specialized mode, the UI must provide a brief tooltip or help text that indicates its purpose: "Keeps small arrays/objects on one line when short". This should be optional and minimal.

K00 Processing UX and responsiveness

K01 Debounced typing

When the user types, validation and formatting must not occur on every keystroke. The UI should feel stable, not flickering between states. Debouncing of approximately 200 ms is required. During the debounce delay, the UI may remain in its previous Valid or Invalid state, or it may show Processing only once actual processing starts. The UI must not rapidly flip state with every keystroke.

K02 Paste behavior

On paste, processing occurs immediately. The UI transitions quickly to Processing if needed, then to Valid or Invalid. This is critical because paste is the dominant workflow.

K03 Large input behavior

For large inputs, processing may occur in the background via a worker. The UX requirement is that typing and scrolling remain responsive. While processing, show a subtle Processing state indicator. If the user changes the input while processing, the UI must not show stale results; the latest input always wins.

L00 Structural summary panel UX

L01 Placement and purpose

The summary panel provides quick structural cues without turning the tool into an IDE. It sits below the editors. It is visible only when the input is valid. It must not show stale information when invalid.

L02 Displayed fields

At minimum it displays: top-level type, input size, output size, node count, max depth, and duplicate key status. The panel must present this information in a compact, scannable form, such as a single-row grid or short labeled values. It must not become a dense table unless needed for duplicate details.

L03 Duplicate key reporting

If duplicates are detected and reporting is not skipped due to size, the panel shows a concise warning line and lists up to the first five duplicate occurrences. Each listed occurrence must be clickable and must navigate the input caret to the duplicate key location without selecting text. If more than five duplicates exist, show a minimal "and N more" indicator. If duplicate detection is skipped due to size, the panel must clearly say it was skipped and must not imply "none".

M00 Accessibility requirements

M01 Keyboard accessibility

All controls must be reachable by Tab. Buttons must be operable by Enter/Space. Jump entry must be operable without requiring Escape.

M02 Screen reader support

Validation status must be announced via aria-live. Buttons must have aria-labels. Duplicate items must have descriptive accessible names including the key name and location, for example "Duplicate key a at Ln 4 Col 10".

M03 Contrast and non-color cues

Valid and Invalid must be distinguishable by text and/or icon, not only by red/green. Disabled controls must be distinguishable.

N00 User workflows

N01 Validate and pretty-print a payload

User pastes a JSON payload into the input editor. The tool processes immediately. If valid, the status shows Valid. The output editor shows the formatted payload in the selected mode, default Pretty with indent 2. The user optionally toggles Sort keys to improve readability for diffing and sees output update immediately. The user clicks Copy Output to copy the formatted JSON.

N02 Minify for transport

User pastes JSON. User clicks Minify. Mode changes to Minify and the output updates. User clicks Copy Output. Focus remains stable.

N03 Locate an error in a large payload

User pastes a large payload that is invalid. The tool shows Invalid with a location when available and a Go to error control. User clicks Go to error. The input editor focuses and scrolls to the location with the caret placed at the error position. The user corrects the JSON. After typing stops, the tool reprocesses and transitions to Valid.

N04 Jump to a known location

User is told the issue is at line 120 column 7. User double-clicks the input caret status. The inline jump editor appears. User types "120:7" and clicks Go. The caret moves and the editor scrolls. The user edits and the tool revalidates after debounce.

N05 Detect duplicate keys

User pastes valid JSON that contains duplicate keys. The tool shows Valid and formatted output. The summary panel displays a duplicate key warning and lists occurrences. User clicks a listed duplicate. The caret jumps to that key in the input so the user can remove or rename it.

O00 UX-oriented acceptance criteria

O01 The UI remains minimal, with two editors, a compact toolbar, compact settings, and a compact summary panel.

O02 Error navigation is discoverable and actionable via a dedicated control. It places the caret but does not select.

O03 Line numbers remain aligned and scroll smoothly even for large documents.

O04 Caret position is accurate and updates without visible lag during editing.

O05 Jump-to-location is accessible via double-click and includes visible Go and Cancel.

O06 Toolbar actions are clearly enabled or disabled based on content, and disabled actions do nothing.

O07 Settings changes reprocess immediately and do not cause stale output to appear.

O08 Summary panel never displays stale values when invalid and clearly communicates duplicate detection results.

P00 Implementation to-do list

P01 Implement the two-pane responsive layout with a centered container, title, input and output panes, and a structural summary region.

P02 Implement native textarea-based editors for input and output, with output set to read-only.

P03 Implement non-selectable line number gutters for both editors with windowed rendering and scroll synchronization.

P04 Implement per-editor caret status bars showing "Ln N:Col M" with throttled updates that do not introduce typing lag.

P05 Implement caret position computation from selectionStart with 1-based line and column definitions consistent with LF newlines.

P06 Implement jump-to-location UX: double-click caret status to enter edit mode, accept "N:M", provide Go and Cancel buttons, clamp out-of-range values, and navigate caret and scroll without selecting text.

P07 Implement strict JSON parsing and state machine: Empty, Processing, Valid, Invalid, with deterministic transitions.

P08 Implement debounced processing for typing at approximately 200 ms and immediate processing for paste events.

P09 Implement large input handling with requestId-based stale result rejection, and a Web Worker pathway above the chosen threshold; ensure UI remains responsive and stale results never overwrite newer input.

P10 Implement normalized error model with stable categories, concise user-facing message, optional raw details disclosure, and location extraction with a clean fallback to "Location unavailable".

P11 Implement "Go to error" control that appears only when invalid and location is available, and navigates caret to offset without selecting text.

P12 Implement formatting pipeline: parse input, optional recursive sort-keys transform, then output generation based on mode.

P13 Implement formatting modes: Pretty via JSON.stringify with indent, Minify via JSON.stringify without spacing, Compact via a deterministic custom formatter with inline vs multiline rules and a fixed compact line length.

P14 Implement formatting settings UI: mode selector (Pretty, Compact, Minify), indent width (2, 4), sort keys toggle; trigger immediate reprocessing on change.

P15 Implement toolbar actions: Format (sets Pretty), Minify (sets Minify), Copy Input, Copy Output, Clear Input, Swap Output to Input, with correct enable/disable rules and specified focus behavior.

P16 Implement clipboard integration with graceful fallback messaging if clipboard write fails; add a subtle non-modal copied confirmation.

P17 Implement output update rules: clear output on Invalid, clear output on Empty, show formatted output on Valid.

P18 Implement structural summary panel visible only on Valid, showing top-level type (including primitive types), input size, output size, node count, and max depth.

P19 Implement duplicate key detection by scanning the original input text with a token-based parser sufficient to recognize object keys, tracking per-object key sets, recording duplicate locations, and disabling detection above the size threshold with an explicit skipped message.

P20 Implement duplicate key list interactions: list up to five duplicates, include "and N more" when applicable, make each item clickable to navigate to its location without selecting text.

P21 Implement accessibility: aria-live status announcements, aria-labels for icon buttons, keyboard navigation for all controls, non-color cues for validity and disabled state.

P22 Implement cross-browser tolerant error location extraction, supporting at minimum offset parsing from "position N" patterns and clean fallback behavior.

P23 Implement defensive handling for formatting failures due to memory or unexpected exceptions, showing a controlled Invalid/failed state rather than crashing.
