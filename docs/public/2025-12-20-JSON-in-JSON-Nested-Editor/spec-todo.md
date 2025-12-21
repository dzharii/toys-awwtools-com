2025-12-20

A00-00 Checklist usage notes

* This checklist covers only the approved v1 scope in the main specification.
* Each checkbox must be verifiable by a concrete manual test in a browser.
* The implementer should treat any unchecked item as incomplete, even if “mostly works”.

B00-00 Project packaging and runtime

- [ ] App is a static site (HTML, CSS, JS).
- [ ] JS is loaded via legacy script src tags (no bundler required).
- [ ] App runs fully in the browser after load with no network dependency.
- [ ] No external frameworks are required for core behavior.

C00-00 Core UI layout: tile-based editor

- [ ] The main UI is a horizontal row of tiles (columns) from left to right.
- [ ] The leftmost tile is always the root tile.
- [ ] Opening embedded content creates a new tile to the right of its parent.
- [ ] Tile hierarchy is visually obvious (spacing, connector, breadcrumb, or similar).
- [ ] If tiles overflow screen width, horizontal scrolling is supported.
- [ ] The active tile is always fully visible (auto-scroll into view on open / focus).
- [ ] Each tile has a header area and an editor area.
- [ ] Tile header shows at least: document mode (Text/JSON) and validation state (Valid/Invalid).
- [ ] Tile header exposes relevant actions: commit and close (as applicable).

D00-00 Editor surface and interaction basics

- [ ] Each tile uses a plain text editing surface (textarea acceptable).
- [ ] No syntax highlighting is required.
- [ ] The active tile editor can receive focus and accept input normally.
- [ ] Disabled tiles cannot be focused and cannot accept input or selection.

E00-00 Active tile rule and parent disabling

- [ ] Only the deepest (rightmost) tile is editable.
- [ ] When a child tile is opened, its parent tile becomes disabled immediately.
- [ ] All ancestors of the active tile are disabled (not only the direct parent).
- [ ] When the active tile is closed, its parent becomes editable again.
- [ ] Attempting to type in a disabled tile has no effect.

F00-00 Root tile mode detection and state transitions

- [ ] Root tile supports both text and JSON modes.
- [ ] On paste or load into root, app attempts JSON.parse on full content.
- [ ] If JSON.parse succeeds: root enters JSON mode and formats immediately.
- [ ] If JSON.parse fails and content is not considered JSON: root remains text mode (no formatting).
- [ ] If content is “intended JSON but invalid”: root enters JSON mode in Invalid state (formatting disabled).
- [ ] Root tile mode updates when content transitions from invalid JSON to valid JSON (and vice versa).
- [ ] Root tile clearly indicates Valid vs Invalid when in JSON mode.

G00-00 JSON formatting rules (root and any JSON tile)

- [ ] JSON formatting is applied on initial load into a JSON tile.
- [ ] JSON formatting is applied on commit for JSON tiles.
- [ ] JSON formatting is not applied automatically on every keystroke.
- [ ] Formatting uses a consistent indentation style (define and use one style everywhere).
- [ ] Formatting is applied to the entire document (whitespace preservation is not required).

H00-00 Cursor preservation rules for formatted JSON tiles

- [ ] Before formatting, capture cursor position as (lineNumber, column).
- [ ] After formatting, restore cursor to the same lineNumber when possible.
- [ ] If lineNumber exceeds new document line count, clamp to last line.
- [ ] Restore column by clamping to the restored line length.
- [ ] Focus remains in the same tile after formatting and cursor restoration.

I00-00 Validity model per tile

- [ ] Each tile has a validation state: Valid or Invalid.
- [ ] Text tiles are always Valid (no JSON validation required).
- [ ] JSON tiles are Valid only if JSON.parse succeeds.
- [ ] Tile UI indicates Invalid state clearly.
- [ ] When Invalid, commit is disabled (for JSON tiles).
- [ ] Invalid state does not crash the app and does not corrupt parent tiles.

J00-00 Opening a derived editor: eligibility and gating

- [ ] Embedded editing is available only when the parent tile is in JSON mode and Valid.
- [ ] Embedded editing is available only when cursor is inside a JSON string value token.
- [ ] Property name strings are not eligible; embedded editing must be disabled there.
- [ ] If cursor is not inside any string value token, embedded editing is disabled.
- [ ] If parent JSON is Invalid, embedded editing is disabled.
- [ ] Disabled state includes a clear reason or is at least not confusing (no silent failure).

K00-00 Embedded editor open action and mode selection UI

- [ ] There is an “Edit embedded” action accessible when eligible.
- [ ] Invoking “Edit embedded” requires choosing one of: Edit as text, Edit as JSON.
- [ ] Mode selection UI is compact (dialog, popover, or dropdown is acceptable).
- [ ] After selecting mode, a new tile opens to the right and becomes active.
- [ ] The parent becomes disabled immediately after the child opens.
- [ ] The child tile header shows its mode (Text or JSON) and state.

L00-00 Decoding and encoding rules for derived tiles

- [ ] Derived tile content is based on the parent’s selected string value.

- [ ] On open, the parent JSON string value is decoded using JSON string decoding semantics.

- [ ] The child tile displays the decoded content (real quotes/newlines as text).

- [ ] On commit, the child content is encoded back into a JSON string value for the parent.

- [ ] For Edit as text:

  - [ ] Commit encodes child content with JSON string escaping rules.
  - [ ] Parent receives the encoded string as the string value at the original location.

- [ ] For Edit as JSON:

  - [ ] Child is a JSON tile (expects JSON content).
  - [ ] Commit is disabled until child content is valid JSON.
  - [ ] On commit, child JSON is formatted with the standard formatter.
  - [ ] The formatted JSON text is then JSON-string-escaped and written into the parent string value.

M00-00 Parent update behavior on commit

- [ ] On child commit, replace exactly the original string value in the parent with the newly encoded value.
- [ ] Parent is updated only on commit (no live propagation on keystrokes).
- [ ] After parent update, if parent is JSON mode, reformat the parent document.
- [ ] After updating parent, the parent remains disabled (because child tile is still open).
- [ ] The updated parent content is visible immediately (read-only display is fine).

N00-00 Propagation across multiple levels

- [ ] With tiles Root -> Child -> Grandchild open:

  - [ ] Committing grandchild updates child’s string value and reformats child if JSON.
  - [ ] Committing child updates root’s string value and reformats root if JSON.
- [ ] No upward propagation occurs without explicit commit at each level.
- [ ] Parent tiles remain unchanged when a child is edited but not committed.

O00-00 Dirty tracking and close behavior

- [ ] Each tile tracks last committed content.

- [ ] A tile is clean if current content equals last committed.

- [ ] A tile is dirty if current content differs from last committed.

- [ ] Closing a clean tile:

  - [ ] Closes immediately with no prompt.
  - [ ] Re-enables parent tile for editing.

- [ ] Closing a dirty tile:

  - [ ] Prompts user: Discard changes or Cancel.
  - [ ] Discard closes without propagating.
  - [ ] Cancel keeps tile open and active.

- [ ] Dirty invalid JSON tile:

  - [ ] Commit is disabled.
  - [ ] Close always prompts discard/cancel.

P00-00 Tile header action behavior

- [ ] Commit button exists on non-root tiles (and on root tile if desired, but not required).
- [ ] Commit button is enabled/disabled according to tile mode and validity.
- [ ] Close button exists on non-root tiles.
- [ ] Close button follows the dirty rules above.
- [ ] Header clearly indicates which tile is active and editable.

Q00-00 Specification-by-example acceptance tests

- [ ] Root valid JSON detection:

  - [ ] Paste valid JSON into root.
  - [ ] Expect: root switches to JSON mode, formats immediately, shows Valid.

- [ ] Root text detection:

  - [ ] Paste non-JSON text into root.
  - [ ] Expect: root stays Text mode, no formatting, embedded editing disabled.

- [ ] Root invalid JSON state:

  - [ ] Paste malformed JSON into root.
  - [ ] Expect: root JSON mode, Invalid state, formatting disabled, embedded editing disabled.

- [ ] Open embedded JSON from string value:

  - [ ] Root JSON valid with a property whose value is a JSON string (stringified JSON).
  - [ ] Place cursor inside the string value.
  - [ ] Invoke Edit embedded -> Edit as JSON.
  - [ ] Expect: new tile opens, parent disables, child shows decoded JSON (formatted on load).

- [ ] Disallow embedded edit on property name:

  - [ ] Place cursor in a property name string token.
  - [ ] Expect: Edit embedded disabled.

- [ ] Disallow embedded edit outside string:

  - [ ] Place cursor in a number, brace, whitespace, etc.
  - [ ] Expect: Edit embedded disabled.

- [ ] Commit embedded JSON:

  - [ ] Edit child JSON to change a value.
  - [ ] Commit.
  - [ ] Expect: parent updates string value to encoded formatted JSON, parent reformats.

- [ ] Commit embedded text with newlines:

  - [ ] Open a string as text.
  - [ ] Add multiple lines.
  - [ ] Commit.
  - [ ] Expect: parent string contains escaped newlines, parent remains valid JSON.

- [ ] Multi-level nesting:

  - [ ] Open root -> child -> grandchild by repeating “Edit embedded”.
  - [ ] Commit grandchild then child.
  - [ ] Expect: changes reach root only after committing back up.

- [ ] Dirty close prompt:

  - [ ] Open child, type changes, do not commit.
  - [ ] Close.
  - [ ] Expect: discard/cancel prompt.
  - [ ] Discard leaves parent unchanged.

- [ ] Clean close:

  - [ ] Open child, make changes, commit (child becomes clean).
  - [ ] Close.
  - [ ] Expect: no prompt, parent remains updated.

- [ ] Cursor restoration:

  - [ ] Put cursor at a mid-document line in a JSON tile.
  - [ ] Trigger formatting via commit (or initial format for a derived JSON tile).
  - [ ] Expect: cursor stays on same line number if possible; otherwise clamps.

R00-00 Robustness and error handling

- [ ] All JSON.parse operations are guarded to avoid uncaught exceptions.
- [ ] All JSON.stringify and formatting operations are guarded.
- [ ] If decoding a parent string fails, child tile opens with an error/invalid state and no crash.
- [ ] If encoding fails (should be unlikely), do not corrupt parent; show error.
- [ ] The app remains responsive with multiple tiles open.

S00-00 Explicit exclusions (must not ship in v1)

- [ ] No automatic scanning for embedded JSON candidates.
- [ ] No search feature.
- [ ] No parallel editing of parent while child is open.
- [ ] No live keystroke-based propagation.
- [ ] No formatting preservation of original JSON whitespace beyond standardized reformat.
- [ ] No diff view.
- [ ] No multi-workspace management.
- [ ] No undo across tile boundaries (browser default undo within a tile is acceptable).

Finally, create high level readme.md to describe what this project does. Only business related information about the project, like features, usage scenarios; no developer information. 
