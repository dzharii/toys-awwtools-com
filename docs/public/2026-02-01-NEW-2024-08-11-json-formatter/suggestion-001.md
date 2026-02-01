2026-02-01
A00 Acknowledgment and document purpose

This document defines the requirements for a minimal JSON formatter and validator web tool. It is written as an implementation-ready specification intended to be used as the single source of truth by an automated coding agent or third-party implementer. The scope is limited to features explicitly approved in the conversation: actionable error navigation, line numbers with caret position, a small set of workflow actions, performance-safe validation and formatting, formatting modes and options, accessibility polish, and a structural summary panel including duplicate key detection. No persistence, no syntax highlighting, and no third-party code editor components are included.

B00 Product overview and value proposition

The tool provides a fast, minimal UI for taking pasted JSON text, validating it, formatting it into a readable representation, and enabling quick navigation to issues when parsing fails. The primary user is a developer who needs to inspect, clean, and reformat JSON payloads quickly without opening a full IDE. The value is realized through three concrete outcomes: immediate correctness feedback, deterministic and configurable formatting, and rapid error location for large inputs via line numbers, caret position, and jump-to-location interactions.

C00 In-scope and out-of-scope

In scope is strict JSON validation using the platform JSON parser, formatted output generation, error location extraction and navigation, line number gutters for both input and output, caret position status for both editors, a jump-to-line:column control, a toolbar with format and utility actions, input debouncing and optional background processing for large inputs, formatting options (indent width, sort keys, formatting mode), an accessibility-compliant status presentation, and a structural summary panel including duplicate key detection.

Out of scope is syntax highlighting, inline range highlighting inside the textarea, replacing the textarea with CodeMirror or any other editor component, JSON5 or relaxed parsing, JSON Schema validation, URL-based sharing, storing any content in localStorage or other persistence, and any server-side functionality.

D00 Terminology and mental model

Input editor means the left-hand textarea where users paste or type JSON. Output editor means the right-hand textarea that displays the formatted result and is read-only. Status bar means the compact UI strip associated with an editor that displays caret position and allows jump entry. Toolbar means the set of action buttons placed near the editors. Parse attempt means running strict JSON parsing against the current input editor content. Formatting means producing output editor content from the parsed value according to the current formatting options. Location means a specific character offset in the input string, along with its derived line and column.

Offsets and columns in this spec are based on JavaScript string indexing using UTF-16 code units, because that is what browser APIs and JSON.parse error positions commonly use. Line numbers are 1-based. Columns are 1-based and count code units since the last LF (newline, U+000A).

E00 UI layout and interaction model

The UI is a single page containing a title, two editor panes, and an area for status and actions. The input editor is editable and the output editor is read-only. Both editors present a non-selectable line number gutter aligned with the text content. Each editor has its own status bar displaying the current caret position as "Ln N:Col M". The input editor additionally participates in validation and error navigation.

The toolbar is visually minimal and placed in a consistent location adjacent to the editors, with icon-based buttons and accessible text via aria-label. The structural summary panel is shown in a compact region below the editors (or below the output editor) and updates only when the input parses successfully.

The UI must not rely on keyboard Escape for any critical flow. Canceling the jump-to-location edit mode is done via a visible Cancel control.

F00 System states and transitions

The system operates in these states, determined solely by the current input content and the most recent completed processing result.

State F01 Empty. Input editor trimmed content is empty. Output editor is empty. Error status is empty. Structural summary panel is hidden or shows a neutral "No input" message.

State F02 Editing. User is typing or pasting. Processing may be pending due to debouncing. Output editor shows the last successful formatted result, unless configured to clear during pending processing as defined in this spec (see H00).

State F03 Valid. The most recent processing completed successfully. Output editor contains formatted JSON for the current input content and current formatting options. Status indicates validity. Structural summary panel shows computed values.

State F04 Invalid. The most recent processing completed with a parse failure. Output editor is cleared. Status indicates invalidity and shows a normalized error message. If a location is available, the status is actionable and supports jump-to-error.

State F05 Processing. A parse/format task is actively running (main thread for small inputs or worker for large inputs). Status indicates processing. If the user edits the input during processing, results from older tasks must be discarded (see I00).

Transitions are triggered by input changes, option changes (indent, sort, mode), and toolbar actions. Any option change in Valid state triggers a reformat. Any option change in Invalid state triggers a re-parse attempt, because formatting options may require parsing to apply (sort keys, compact mode).

G00 Validation and error handling requirements

G01 Parsing rules. The tool validates strictly according to JSON as implemented by the host environment JSON.parse. No relaxed syntax is supported. If the user input includes comments, trailing commas, or single-quoted strings, the tool must report Invalid.

G02 Normalized error model. On parse failure, the tool must produce a normalized error object with these fields: category, message, rawMessage, location. Category is a stable string chosen from a fixed set defined below. Message is a concise user-facing string derived from category, optionally including location. RawMessage is the original exception message from the environment for optional display in a details view. Location is either null (unknown) or an object containing offset, line, column, and a confidence tag.

G03 Error categories. Category is determined by applying ordered matching rules to the raw error message and any extracted metadata. The category set is: unterminated_string, unexpected_token, unexpected_end, invalid_number, invalid_escape, invalid_unicode, duplicate_key_warning, generic_syntax_error. The category duplicate_key_warning is used only for valid JSON where duplicate keys were detected; it does not represent a parse failure.

Category selection rules are deterministic. If the raw message contains "Unterminated string" (case-insensitive match), category is unterminated_string. Else if it contains "Unexpected end" or "Unexpected end of JSON input", category is unexpected_end. Else if it contains "Unexpected token", category is unexpected_token. Else if it contains "number" and "JSON" in a syntax context, category is invalid_number. Else if it contains "escape" and "string", category is invalid_escape. Else if it contains "unicode" and "escape", category is invalid_unicode. Else category is generic_syntax_error.

G04 Location extraction. The tool must attempt to extract an error location from the thrown error object. The location extraction procedure is:

Step 1. If the error object exposes a numeric position property (for example error.position) and it is a finite integer, treat it as offset.

Step 2. Else, attempt to parse an offset from rawMessage using a regular expression that matches common browser wording, including "position N", "at position N", or "(line X column Y)" patterns. At minimum, support extracting offset from "position N" where N is an integer.

Step 3. If an offset was extracted, compute line and column deterministically from the current input string by scanning from the start to offset and counting LF. This computed line and column has confidence "computed_from_offset".

Step 4. If no offset was extracted but rawMessage includes explicit line and column integers, treat those as line and column with confidence "reported_by_parser". If reported line and column are present, the tool may also compute an offset from them by scanning the input to that line and column. If it computes an offset, the confidence remains "reported_by_parser" and the tool must not label it as computed.

Step 5. If neither offset nor line/column can be extracted, location is null and the UI must display "Location unavailable" rather than fabricating numbers.

G05 Actionable error behavior. If location is non-null and the error is a parse failure, the error UI must present a clickable element labeled "Go to error" (or equivalent) that moves the input caret to the error location. The action must not select a range by default. It must place the caret at the computed offset and ensure it is scrolled into view.

G06 Raw error details. The raw environment message may be displayed only in a secondary disclosure UI (for example "Details") to keep the primary UI minimal. The default view uses the normalized category and computed location.

H00 Formatting behavior and output generation

H01 Formatting modes. The tool provides three output modes, exactly: pretty, compact, minify.

In pretty mode, formatting uses multiline indentation based on indent width. In minify mode, formatting produces the shortest valid JSON with no unnecessary whitespace. In compact mode, formatting is multiline but attempts to render small arrays and small objects on a single line when doing so keeps the line under a defined maximum length.

H02 Indent width. Indent width is a user setting with allowed values exactly {2, 4}. The default is 2.

H03 Sort keys. Sort keys is a user setting with allowed values {off, on}. Default is off. When on, object keys are sorted lexicographically using JavaScript default string sort order (code unit order). Arrays are never reordered.

H04 Compact mode maximum line length. Compact mode uses a fixed maximum line length compactLineMax with default 80 and allowed range 40 to 160. If the UI does not expose this setting, the implementation must still use a constant 80. This spec assumes default 80.

H05 Output generation pipeline. When input parses successfully, output generation proceeds as follows:

Step 1. Parse the input string into a value using JSON.parse.

Step 2. If sort keys is on, transform the parsed value by recursively sorting object keys. This transformation must produce a deep-cloned value so that key ordering is explicitly applied and not dependent on engine insertion order. The transformation must preserve number, string, boolean, null exactly. It must preserve arrays in original order and must transform each element recursively.

Step 3. Format the resulting value according to the selected mode:

Pretty mode uses JSON.stringify(value, null, indentWidth).

Minify mode uses JSON.stringify(value).

Compact mode uses a deterministic pretty-printer defined below in H06.

H06 Compact pretty-printer rules. Compact mode must be implemented via a custom formatter rather than post-processing pretty output. The formatter is recursive and must always produce valid JSON.

For primitive values, return JSON.stringify(value).

For arrays, if array length is 0, return "[]". Otherwise, compute an inline candidate by formatting each element using the compact formatter at the next depth but forcing the result to have no surrounding newlines (the same formatter naturally has no newlines for primitives and small containers). Join elements with ", " and wrap with "[" and "]". If the inline candidate contains no LF and its total length is less than or equal to compactLineMax, return the inline candidate. Otherwise, return multiline form: an opening bracket, then each element formatted at next depth preceded by newline and indentation, elements separated by commas, then a closing bracket aligned to the current depth.

For objects, if object has 0 keys, return "{}". Determine key order based on sort keys setting. Compute inline candidate by joining '"key": value' pairs with ", " and wrapping with "{ " and " }" such that there is exactly one space after "{" and before "}" and exactly one space after each comma. If inline candidate contains no LF and its length is less than or equal to compactLineMax, return inline candidate. Otherwise, return multiline form: "{", then each '"key": value' pair on its own line at next depth with indentation, pairs separated by commas, then "}" aligned to current depth.

Indentation for compact mode multiline form uses the configured indent width. The formatter must use LF newlines.

H07 Output editor updates. In Valid state, output editor shows the formatted string. In Invalid state, output editor is cleared to empty string. In Empty state, output editor is empty string.

H08 Copy fidelity. Copying output must copy exactly the contents of the output editor, including newlines, with no additional prefixes.

I00 Performance and processing model

I01 Debounced validation. Input changes from typing must not trigger immediate parse on every keystroke. The tool must debounce parse/format with a delay of 200 ms after the most recent input event. Paste events must trigger an immediate parse attempt without waiting for debounce, because paste is commonly a complete JSON payload.

I02 Option-change processing. Any change to formatting settings (mode, indent width, sort keys) must trigger reprocessing. Reprocessing uses the same scheduling rules as typing, except it must run immediately because it is user-initiated and does not create continuous streams. If the input is empty, option changes do not trigger parsing.

I03 Large input threshold and worker offload. If input size exceeds largeInputChars, processing must run in a Web Worker. largeInputChars is 1,000,000 characters by default. If Web Worker is unavailable, processing runs on the main thread but must show Processing state and must remain correct. For inputs below the threshold, processing runs on the main thread.

I04 Stale result rejection. Each processing request must carry a monotonically increasing requestId. When results return, they are applied only if requestId equals the latest issued requestId at the time of completion. Any older completion is discarded without UI changes. This rule applies to worker and main-thread processing.

I05 UI responsiveness during processing. When entering Processing state, the status must display a non-disruptive indicator. The user must be able to continue editing the input while processing is running. Edits during processing trigger new requestIds.

I06 Line number rendering performance. The line number gutter must not render one DOM node per line for large documents. It must use a windowed approach based on scroll position. The gutter renders only the visible range plus a small buffer. The gutter content is updated on scroll using requestAnimationFrame to avoid scroll jank.

J00 Line numbers and caret position requirements

J01 Line number gutters. Both input and output editors must display line numbers. The gutter must be visually aligned with editor content and must not be selectable (CSS user-select: none). The gutter must scroll in sync with the editor without lag.

J02 Windowed line number algorithm. Each editor must compute lineHeight from computed styles or by measuring a single-line element. On scroll, compute firstVisibleLine = floor(scrollTop / lineHeight) + 1. Compute visibleLineCount = ceil(clientHeight / lineHeight) + 2. Render a contiguous list of line numbers from firstVisibleLine to firstVisibleLine + visibleLineCount - 1, clamped to totalLines. Apply a top padding equal to (firstVisibleLine - 1) * lineHeight to vertically align numbers to the text.

J03 Total line count. totalLines is 1 plus the count of LF characters in the editor content. This must update after input changes (debounced) and after output updates (immediate).

J04 Caret position display. Each editor status bar must display the caret position as Ln N:Col M. For the output editor, caret position refers to selectionStart when the user focuses it to copy and navigates. For read-only output, caret still exists. For the input editor, caret position updates on keyup, mouseup, input, and selectionchange while the editor is focused. Updates must be throttled with requestAnimationFrame to avoid impacting typing performance.

J05 Caret line and column computation. The line and column are computed from selectionStart using a deterministic scan. For performance, implementations may maintain a cached line break index structure for the current content, but caching must not introduce incorrect results. If caching is used, it must be rebuilt only when content changes, not on every caret movement.

K00 Jump to location behavior

K01 Jump to error. When in Invalid state and location is available, the status area must include a control that, when activated, moves the input editor caret to the error offset and scrolls it into view. It must not select text.

K02 Jump by line and column. Each editor status bar must support entering a target location. The default presentation is read-only text Ln N:Col M. On double-click of this text, the status bar enters Edit mode for jump entry.

K03 Jump entry format. In Edit mode, the status bar shows a single-line input field containing "N:M" where N is line and M is column. A Go button triggers navigation. A Cancel button exits Edit mode without navigation. Keyboard Escape must not be required.

K04 Go behavior and validation. When Go is activated, parse the input as two positive integers separated by ":" with optional surrounding whitespace. If parsing fails, show an inline error message in the status bar area and remain in Edit mode. If line is less than 1, clamp to 1. If line is greater than totalLines, clamp to totalLines. If column is less than 1, clamp to 1. If column exceeds the length of the target line plus 1, clamp to end of line plus 1.

K05 Index computation from line and column. Compute the offset by scanning the content to the start of the target line and then adding column - 1 code units. Line starts are defined by LF. The computation must be consistent with J05.

K06 Navigation target. For the input editor, Go moves the caret in the input editor. For the output editor, Go moves the caret in the output editor. The tool does not synchronize input and output caret locations.

L00 Toolbar actions

L01 Toolbar buttons. The toolbar provides exactly these actions: Format, Minify, Copy Input, Copy Output, Clear Input, Swap Output to Input.

L02 Button availability rules. Format and Minify are enabled when input is non-empty. Copy Input is enabled when input is non-empty. Copy Output is enabled when output is non-empty. Clear Input is enabled when input is non-empty. Swap Output to Input is enabled when output is non-empty.

L03 Action definitions.

Format sets mode to pretty and triggers immediate reprocessing.

Minify sets mode to minify and triggers immediate reprocessing.

Copy Input writes the current input editor value to the clipboard using the Clipboard API where available. On success, the UI may show a transient confirmation in the global status area without modal dialogs.

Copy Output writes the current output editor value to the clipboard with the same rules as Copy Input.

Clear Input sets input editor value to empty string, which places the tool in Empty state and clears output and summary.

Swap Output to Input replaces the input editor value with the current output editor value, focuses the input editor, and triggers immediate reprocessing. This enables a workflow of formatting, then continuing edits on the formatted result.

L04 Icons and accessible names. Each button must have an icon (emoji is acceptable) and must have an aria-label describing its action. Visible text labels are optional; if omitted, tooltips via title are required.

M00 Structural summary panel

M01 Visibility rules. The structural summary panel is shown only in Valid state. In other states it is hidden or shows a neutral placeholder without stale data.

M02 Metrics. When shown, the panel must display at minimum: top-level type (object or array), size in characters of input, size in characters of output, estimated node count, and maximum depth.

Definitions are deterministic. Top-level type is determined from parsed value. If value is an array, show "array". If value is a non-null object, show "object". Other top-level JSON values are allowed by JSON (for example a number or string). In that case, show "primitive" and the primitive type (string, number, boolean, null).

Estimated node count is the count of JSON values in the tree including the root, each array element, and each object value. Object keys are not counted as nodes.

Maximum depth counts the root as depth 1. Each nested array or object increases depth by 1.

M03 Duplicate key detection. When in Valid state, the tool must detect duplicate keys in the original input text and report them in the panel. A duplicate key is defined as two or more occurrences of the same key string within the same object scope. Keys in different objects are not duplicates of each other.

M04 Duplicate detection algorithm requirements. JSON.parse cannot detect duplicates reliably because it overwrites prior keys. Therefore, duplicate detection must scan the original input text using a token-based approach.

The scanner must recognize JSON structural tokens, string tokens (including escape handling sufficient to identify key strings correctly), and must maintain a stack of contexts indicating whether the current scope is an object expecting a key, an object expecting a value, or an array expecting a value.

When the scanner is in object scope and expecting a key, the next string token is treated as a key. The scanner must decode escape sequences in the key string so that equivalent keys compare equal even if escaped differently (for example "\u0061" equals "a"). The scanner must maintain a Set of keys for each object scope. If a key is already present in the Set, record a duplicate occurrence with its location (offset, line, column) and the key text. The scanner continues.

M05 Duplicate reporting. If no duplicates are found, show "Duplicate keys: none". If duplicates are found, show the count of duplicate occurrences and list at least the first 5 with their key and location. Each listed duplicate must be clickable to jump the input caret to the duplicate key location using the same navigation behavior as K01. If more than 5 exist, show "and N more" without listing all by default.

M06 Size-based disabling. If input exceeds duplicateScanChars, duplicate detection may be skipped to protect performance. duplicateScanChars defaults to 1,000,000 characters. If skipped, the panel must explicitly state "Duplicate key detection skipped due to size" and must not imply "none".

N00 Accessibility and UX requirements

N01 Status messaging. The global validation status must be conveyed both visually and via ARIA. The status area must be an aria-live region with polite announcements. It must announce transitions among Valid, Invalid, Processing, and Empty.

N02 Color is not the only signal. Valid and Invalid must have text labels, not only red/green color. Icons may be used in addition to text.

N03 Focus management. Clicking "Go to error" or a duplicate key item must focus the input editor. Toolbar actions that change content must maintain a predictable focus: Format, Minify, and Swap Output to Input focus the input editor; Copy actions preserve current focus; Clear Input focuses input editor.

N04 Keyboard navigation. All toolbar buttons and jump entry controls must be reachable by Tab navigation. The jump entry Edit mode must be operable with Enter for Go and a visible Cancel control for cancel. Escape is not required.

O00 Specification by example

O01 Example: empty input. User loads the page and sees empty input and empty output. Status shows no error. Structural panel is not shown. Line gutters show line 1 only. Caret status shows Ln 1:Col 1 when the editor is focused.

O02 Example: valid small object. User pastes {"b":2,"a":1} into input. The system immediately processes due to paste. State becomes Valid. Output shows formatted JSON according to current mode. If sort keys is off and mode is pretty with indent 2, output is:
{
"b": 2,
"a": 1
}
If sort keys is on, output is:
{
"a": 1,
"b": 2
}
The structural panel shows top-level object, node count 3 (root object plus two number values), max depth 1 or 2 depending on definition; this spec defines root depth 1 and numbers do not add depth, so max depth is 1.

O03 Example: invalid unterminated string. User types {"aaa":"a} into input. After debounce, processing runs and fails. State becomes Invalid. Output clears. Status shows "Invalid JSON: unterminated_string" and shows a line and column if available. If the environment reports "position 13", the tool computes line 1 col 14 (1-based) and displays "Ln 1:Col 14". The status includes Go to error. Clicking Go to error focuses input and places caret at offset 13.

O04 Example: jump by editing status bar. Input has 200 lines. User wants to go to line 150 column 10. User double-clicks the input status text "Ln 1:Col 1". It becomes an input containing "1:1" plus Go and Cancel buttons. User types "150:10" and clicks Go. The caret moves to that location and the editor scrolls to show it. If the user types "9999:9999", the tool clamps to the end of the document.

O05 Example: compact mode. Input is {"a":[1,2,3],"b":{"c":1,"d":2}}. In compact mode with compactLineMax 80 and indent 2, the output is allowed to keep small arrays and objects inline. A valid output is:
{
"a": [1, 2, 3],
"b": { "c": 1, "d": 2 }
}
If the inline candidate exceeds the max length, the formatter switches that container to multiline.

O06 Example: duplicate keys. Input is {"a":1,"a":2}. JSON.parse returns {a:2} and Valid state is reached. Duplicate scanner detects that "a" appears twice in the same object scope and records the second occurrence location. The structural panel shows "Duplicate keys: 1" and lists key a at its location. Clicking it jumps caret to the second "a" key.

P00 Non-functional requirements and constraints

P01 Minimal dependencies. The implementation must not introduce a heavy editor dependency. It must use native textarea elements.

P02 Cross-browser. The implementation must work in current Chromium-based browsers and Firefox. Error message formats differ; location extraction must be tolerant and must fall back cleanly.

P03 Determinism. Given the same input and settings, output must be stable. Compact mode must be deterministic according to H06.

P04 Safety. The tool must not automatically modify user input except when the user explicitly triggers actions that do so (Clear Input, Swap Output to Input). Error navigation must not select text by default and must not modify input.

Q00 Implementation notes that are normative

These notes are requirements, not suggestions.

Q01 Scrolling caret into view in a textarea. After setting selectionStart and selectionEnd to the target offset, the implementation must ensure the caret is visible. The preferred approach is to use a hidden mirror element to compute the pixel position, but that is optional. A simpler approach that is acceptable is to set focus and then adjust scrollTop based on lineHeight and computed target line number.

Q02 Worker message contract. If Web Worker is used, the main thread sends {requestId, inputText, options}. The worker responds with {requestId, ok, formattedText, errorModel, summaryModel}. The main thread applies only matching requestId results as defined in I04.

Q03 Memory limits. When formatting, if JSON.stringify or the compact printer throws due to memory pressure, the tool must transition to Invalid with category generic_syntax_error and message "Formatting failed" and must not crash the UI.

R00 Acceptance criteria

The implementation is accepted if the following are true for manual testing.

R01 Error navigation works: for errors with extracted offsets, clicking Go to error places the input caret at the correct location and scrolls it into view without selecting text.

R02 Line numbers render for both editors and scroll in sync, and for large documents they remain responsive due to windowed rendering.

R03 Caret position in both status bars updates accurately and does not introduce typing lag for large inputs.

R04 Jump entry works via double-click, Go, and Cancel without requiring keyboard Escape.

R05 Toolbar actions work exactly as specified, are enabled and disabled correctly, and do not introduce unexpected input changes.

R06 Debouncing reduces parse frequency during typing but paste triggers immediate processing.

R07 Formatting modes produce valid JSON and match the rules for pretty, compact, and minify, including indent width and sort keys behavior.

R08 Structural panel appears only on Valid, shows correct top-level type, sizes, node count, max depth, and duplicate detection results, and duplicate entries are clickable and navigate correctly.

R09 Status messaging is accessible via aria-live and does not rely solely on color.

