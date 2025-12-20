2025-12-20
A00-00 Checklist usage notes

* This checklist is for implementing and verifying the current scope only.
* Anything labeled as future or deferred is excluded.
* Each checkbox should be verifiable by a quick manual test in the browser.

B00-00 Project structure and packaging

- [ ] App is a static site with HTML, CSS, and JS files.
- [ ] JS is loaded via script src tags, no bundler required.
- [ ] App works after initial load with no network access.
- [ ] No external runtime dependencies are required for core functionality.
- [ ] No browser permissions are requested beyond normal paste events.

C00-00 Page layout and UI composition

- [ ] The page is a single screen with a vertical layout that works on desktop and mobile.
- [ ] The control header is at the top and is visible without scrolling on typical screens.
- [ ] The header contains formatted paste toggle, insertion mode selector, and profile selector.
- [ ] The pipeline configuration area is visually separated from the editor.
- [ ] The editor occupies the main space and is a plain text editing surface (textarea is acceptable).
- [ ] A preview area exists and is collapsible (collapsed by default on small screens is acceptable).
- [ ] The preview does not block editing and is read-only.

D00-00 Formatted paste toggle and mode signaling

- [ ] There is a two-state control: formatted paste ON and formatted paste OFF.
- [ ] The current toggle state is obvious at a glance (distinct visual difference).
- [ ] When formatted paste is OFF, paste behavior is browser-default (no interception).
- [ ] When formatted paste is ON, paste is intercepted and transformed.

E00-00 Insertion mode selector and supported modes

- [ ] There is a selector that lets the user pick one insertion mode at a time.
- [ ] Insertion modes are implemented as insertion logic only (no transformation logic inside them).
- [ ] Insert at cursor works and replaces selection if a selection exists.
- [ ] Append to end works and ignores current selection.
- [ ] Prepend to start works and ignores current selection.
- [ ] Insert on new line at cursor works using the specified minimal newline rules.
- [ ] Append on new line at end works and enforces a preceding newline when needed.
- [ ] Delimiter-prefixed insertion exists, inserts delimiter + output at cursor or replaces selection.
- [ ] Delimiter-suffixed insertion exists, inserts output + delimiter at cursor or replaces selection.
- [ ] Delimiter-prefixed and delimiter-suffixed do not attempt delimiter duplication detection in this version.
- [ ] After insertion, caret/selection ends in a predictable position as defined per mode.

F00-00 Transformation pipeline model

- [ ] Pipeline is an ordered list of steps shown in the UI in execution order.
- [ ] Each step is a small operation that transforms a string into a string.
- [ ] Pipeline execution is sequential: step output becomes next step input.
- [ ] Steps are implemented as pure functions of (input string, config) -> output string.
- [ ] Steps never directly modify the editor or localStorage.
- [ ] Pipeline is configurable in the UI: add step, remove step, reorder steps.
- [ ] Reordering is supported via up/down controls (drag-and-drop is not required).
- [ ] The active pipeline is persisted and restored after refresh.

G00-00 Supported transformation steps for this version

- [ ] Trim step exists and trims leading/trailing whitespace.
- [ ] Optional whitespace collapsing for trim exists only if implemented and is OFF by default.
- [ ] Case transform step exists with these modes: lowercase, uppercase, snake_case, kebab-case, camelCase, PascalCase.
- [ ] Case transform has deterministic behavior for spaces, punctuation, underscore, and dash separators.
- [ ] Template wrap step exists and applies a template string to produce output.
- [ ] Template wrap supports ${value} placeholder.
- [ ] Template wrap supports ${json} placeholder as JSON.stringify(value).
- [ ] Template wrap UI includes a text input for the template.
- [ ] Template wrap UI provides a small set of built-in templates (at least examples like ", ${value}", "'${value}'", ""${value}"", ", ${json}").

H00-00 Profiles

- [ ] Profile selector exists in the header.
- [ ] Profiles are defined in code in a human-editable structure (plain objects).
- [ ] Profiles have id and display name at minimum.
- [ ] Selecting a profile copies its pipeline into the active pipeline editor.
- [ ] After loading a profile, the user can modify the active pipeline.
- [ ] Modifications affect only the active pipeline, not the profile definition.
- [ ] The selected profile id is persisted and restored (or blank if none selected).
- [ ] Profiles can optionally set a default insertion mode; if present, it applies on profile load.

I00-00 Preview area

- [ ] After each paste (when formatted paste is ON), store the raw clipboard text.
- [ ] After each paste (when formatted paste is ON), store the transformed output text.
- [ ] Preview UI displays raw and transformed values.
- [ ] Preview updates only on paste events, not on every keystroke.
- [ ] Preview is read-only and cannot edit the main document.
- [ ] Preview is collapsible.
- [ ] On small screens, preview is hidden/collapsed by default.

J00-00 Raw paste bypass behavior

- [ ] When formatted paste is ON, there is a reliable method to bypass formatting for a single paste.
- [ ] Desktop intent: Ctrl+Shift+V is supported as a raw paste bypass when feasible.
- [ ] If Ctrl+Shift+V cannot be reliably handled in a target browser, a modifier-key note is implemented (example: hold Shift during paste) and verified.
- [ ] Raw bypass results in default paste insertion (no transformation).
- [ ] Raw bypass does not permanently change the formatted paste toggle state.

K00-00 Editor behavior and selection handling

- [ ] Editor is a textarea (or another plain text surface) with stable selection APIs.
- [ ] Paste handler captures selectionStart/selectionEnd at paste time.
- [ ] Insert-at-cursor mode replaces selection when selectionStart != selectionEnd.
- [ ] Other insertion modes behave as specified regardless of selection (append/prepend ignore selection).
- [ ] Editor remains usable for normal typing and selection when formatted paste is ON or OFF.
- [ ] Undo behavior is reasonable for paste insertions (no excessive resets unrelated to paste).

L00-00 Persistence and workspace id

- [ ] On first run, generate a workspace id and store it as the current workspace id.
- [ ] GUID generation uses crypto.randomUUID() when available, otherwise crypto.getRandomValues fallback.
- [ ] Persist editor content to localStorage automatically.
- [ ] Persist formatted paste enabled state.
- [ ] Persist insertion mode id.
- [ ] Persist active pipeline JSON.
- [ ] Persist selected profile id (or empty).
- [ ] Persist optional UI state (preview collapsed, scroll position) if implemented.
- [ ] Persistence is debounced to avoid writing on every keystroke with no delay.
- [ ] Persistence flushes on visibilitychange to hidden.
- [ ] Persistence flushes on beforeunload.
- [ ] On reload, restore the last workspace state automatically.
- [ ] Restore editor content and focus editor on load.
- [ ] Restore insertion mode, formatted paste toggle state, pipeline, and profile selection.
- [ ] Restore scroll position if stored.

M00-00 Local storage schema verification

- [ ] A single namespace approach is used (app-level current workspace id plus per-workspace keys).
- [ ] Keys exist for at least: currentWorkspaceId, editorText, formattedPasteEnabled, insertionMode, activePipeline, selectedProfileId.
- [ ] All JSON reads are guarded with try/catch.
- [ ] If parsing fails, app falls back to defaults without crashing.
- [ ] If storage is unavailable or quota is exceeded, app remains functional and shows a minimal warning.

N00-00 Error handling and resilience

- [ ] If clipboard text is empty, paste results in no-op or empty insertion without errors.
- [ ] If a pipeline step throws, the app fails gracefully.
- [ ] On pipeline error, app performs raw paste insertion (or inserts original clipboard text) and continues running.
- [ ] A minimal, non-intrusive error indicator is displayed when an error occurs.
- [ ] The error indicator does not block editing.
- [ ] App does not crash on malformed persisted pipeline configs.

O00-00 Mobile UX checks

- [ ] Controls are usable by touch (adequate tap targets).
- [ ] Header controls remain discoverable without hover.
- [ ] Pipeline step controls are usable on narrow screens.
- [ ] Editor is the primary focus area and does not fight the on-screen keyboard.
- [ ] Preview is collapsible and does not consume excessive space on mobile.

P00-00 Spec-by-example acceptance tests

- [ ] Scenario: comma-prefix identifier.

- [ ] Setup: formatted paste ON, insertion mode delimiter-prefixed with delimiter ", ", pipeline empty or trim.

- [ ] Action: paste "colA" at caret.

- [ ] Expected: inserted text is ", colA" at caret, caret ends after inserted text.

- [ ] Scenario: JSON string insertion.

- [ ] Setup: formatted paste ON, pipeline includes template wrap "${json}", insertion mode insert at cursor.

- [ ] Action: paste hello.

- [ ] Expected: inserted text is ""hello"" (valid JSON string representation).

- [ ] Scenario: case transform to snake_case.

- [ ] Setup: pipeline includes case transform snake_case, insertion mode insert at cursor.

- [ ] Action: paste "My Column".

- [ ] Expected: inserted text is "my_column".

- [ ] Scenario: formatted paste OFF.

- [ ] Setup: formatted paste OFF.

- [ ] Action: paste any text.

- [ ] Expected: browser default paste occurs, no transformation, preview does not need to update.

Q00-00 Explicit exclusions check (must not accidentally ship)

- [ ] No TSV/CSV parsing logic is included as a feature.
- [ ] No multi-item splitting and join output features are exposed.
- [ ] No smart delimiter duplication avoidance is implemented.
- [ ] No cleanup presets like bullet/number stripping are exposed beyond optional trim/collapse if present.
- [ ] No multi-workspace management UI (create/rename/switch) is present in this version.

Finally, create high level readme.md to describe what this project does. Only business related information about the project, like features, usage scenarios; no developer information. 
