2025-12-20

A00-00 Document purpose and scope

This document defines the complete, implementation-ready specification for the project named “Embedded JSON / JSON-in-JSON Editor”. It merges product vision, problem definition, UX and UI behavior, usage scenarios, specification-by-example, and technical behavior into a single authoritative reference. The goal is to make the intended behavior clear enough that an implementer can build the application without needing to invent missing rules or make subjective UX decisions.

This specification describes only the first stable version. All future or experimental ideas are explicitly excluded.

B00-00 Problem statement and motivation

Configuration systems frequently embed structured data inside string values of outer documents. A common pattern is JSON documents containing stringified JSON, which may itself contain further embedded JSON. This occurs in cloud templates, infrastructure definitions, policy documents, and application configuration files.

Editing such documents using standard editors is extremely difficult. Users must manually escape quotes, manage indentation, and reason about multiple layers of encoding. Errors are easy to introduce and hard to detect, especially when nesting is deep.

The purpose of this project is to make editing embedded structured content safe and practical by providing a recursive, tile-based editing experience. Each level of embedded content is edited in its own editor, while the system handles decoding, encoding, formatting, and controlled propagation back to parent documents.

C00-00 Core concept and mental model

The application is a multi-tile editor. Each tile represents a document. A document can be either plain text or JSON. Tiles form a linear parent-child chain. A child tile is always derived from a specific string value inside its parent tile.

The leftmost tile is the root document. Additional tiles open to the right as the user edits embedded content. The chain visually represents nesting depth. It must always be clear which tile was derived from which parent.

At any given time, only the deepest tile in the chain is editable. All ancestor tiles are visible but disabled. This rule prevents conflicting edits and simplifies propagation logic.

Edits made in a child tile do not affect the parent until the user explicitly commits them. On commit, changes propagate upward through the chain, re-encoding and reformatting as needed, until the root document reflects the updated content.

D00-00 Supported document types and modes

Every tile operates in one of two document modes: text mode or JSON mode.

Text mode treats the document as raw text. No structural parsing is performed. When a text document is derived from a parent JSON string, JSON string decoding is applied before display, and JSON string encoding is applied on commit.

JSON mode treats the document as JSON. The editor expects valid JSON for commit. Invalid intermediate states are allowed during editing, but commit is disabled until the document is valid JSON.

The root tile supports both text and JSON. Mode selection for the root tile follows explicit rules defined later in this document.

E00-00 Root tile mode selection rules

When content is first introduced into the root tile, either by paste or initial load, the application attempts to parse it as JSON.

If the content parses successfully as JSON, the root tile enters JSON mode. The document is immediately formatted using the standard formatter.

If the content does not parse as JSON, the root tile remains in text mode. No formatting is applied.

If the content appears to be JSON but parsing fails, the root tile is still considered JSON mode but enters an invalid state. Formatting does not occur, and embedded editing is disabled until the JSON becomes valid.

The user is not required to manually select root mode. Mode is inferred from content and updated when content transitions between valid and invalid JSON.

F00-00 Page layout and visual structure

The application uses a horizontal, tile-based layout.

Tiles are arranged left to right. Each tile occupies a vertical column. The root tile is always leftmost. Each derived editor opens as a new tile to the right of its parent.

Tiles include a header and an editor area. The header displays the document mode, validation state, and available actions such as commit and close. Visual cues indicate which tile is active and which tiles are disabled.

When the total width exceeds the viewport, horizontal scrolling is enabled. The active tile must always be fully visible.

The visual design must make parent-child relationships obvious through spacing, alignment, and subtle connectors. Users must not confuse tiles as independent documents.

G00-00 Editor behavior and interaction rules

Each tile contains a plain text editing surface. There is no syntax highlighting or semantic assistance.

Only the active tile is editable. Disabled tiles cannot receive focus, input, or selection.

In JSON mode, formatting is applied only on initial load and on commit. Formatting does not occur automatically during typing.

Cursor position is tracked by line number and column. After formatting, the cursor is restored to the same line number when possible. If the original line no longer exists, the cursor moves to the nearest valid line. Column position is clamped to line length.

H00-00 Opening a derived editor

Opening a derived editor is only possible when the parent tile is in JSON mode and is currently valid JSON.

The user places the cursor inside a JSON string value token. Property name strings are explicitly excluded; only string values on the right-hand side of key-value pairs are eligible.

The user invokes the “Edit embedded” action. This action is disabled if the cursor is not inside a valid string value token or if the parent JSON is invalid.

Upon invocation, the user selects an edit mode: edit as text or edit as JSON.

A new tile opens to the right. The parent tile becomes disabled. The child tile loads the decoded string value as its initial content.

If edit as JSON is selected and the decoded content is not valid JSON, the child tile opens in JSON mode but immediately enters an invalid state. Commit is disabled until the content becomes valid.

I00-00 Editing workflow and commit semantics

The user edits content freely in the active tile. Invalid intermediate states are allowed.

Commit is an explicit user action triggered by a button in the tile header.

In text mode, commit is always enabled.

In JSON mode, commit is enabled only when the content parses as valid JSON.

On commit, the following sequence occurs. The child content is encoded according to its mode. For text mode, JSON string escaping rules are applied. For JSON mode, the JSON document is formatted using the standard formatter and then encoded as a JSON string literal.

The encoded value replaces the original string value in the parent document. The parent document is then reformatted if it is in JSON mode. Cursor restoration rules are applied.

After commit, the child tile becomes clean. The parent remains disabled until the child tile is closed.

J00-00 Propagation rules and consistency guarantees

Propagation occurs only on commit. There is no live propagation on each keystroke.

Propagation is strictly upward. Parent tiles never modify child content.

At all times, every committed document in the chain is valid according to its mode.

K00-00 Closing tiles and dirty state handling

Each tile tracks a last committed state.

A tile is clean if its current content matches the last committed state. A tile is dirty if it differs.

Closing behavior follows explicit rules.

If a tile is clean, closing it immediately closes the tile and re-enables its parent.

If a tile is dirty, the user is prompted to either discard changes or cancel closing. Discard closes the tile without propagating changes. Cancel keeps the tile open.

A dirty but invalid JSON tile cannot be committed and will always trigger a discard confirmation on close.

L00-00 Specification by example: root mode behavior

Example. The user pastes valid JSON into the root tile. The application detects valid JSON, switches to JSON mode, formats the document, and enables embedded editing.

Example. The user pastes arbitrary text into the root tile. The application remains in text mode. Embedded editing is disabled.

Example. The user pastes malformed JSON. The application enters JSON mode but marks the document invalid. Formatting and embedded editing are disabled until the JSON is fixed.

M00-00 Specification by example: opening embedded editors

Example. The parent JSON is valid. The cursor is inside a string value. The user selects edit as JSON. A child tile opens showing the decoded string. The parent becomes disabled.

Example. The cursor is inside a property name string. The edit embedded action is disabled.

Example. The cursor is outside any string token. The edit embedded action is disabled.

N00-00 Specification by example: commit behavior

Example. Parent JSON contains `"config": "{\"a\":1}"`. The user opens the value as JSON, edits it to `{ "a": 2 }`, and commits. The parent updates to `"config": "{\n  \"a\": 2\n}"` and is reformatted.

Example. Parent JSON contains a multiline text string. The user edits it as text and commits. The parent string value contains escaped newlines and quotes, and the parent JSON remains valid.

O00-00 Specification by example: disabled parent behavior

Example. The root tile is editable. The user opens a child tile. The root tile becomes read-only and cannot be focused or edited.

Example. The user closes the child tile. The root tile becomes editable again.

P00-00 Specification by example: cursor restoration

Example. The user commits a child edit. The parent JSON is reformatted. The cursor in the parent returns to the same line number as before commit.

Example. The document shrinks and the previous line number no longer exists. The cursor moves to the last line of the document.

Q00-00 Error handling and validation states

Each tile explicitly indicates whether it is valid or invalid. Commit controls are disabled when invalid.

Parsing and serialization are guarded. Errors never crash the application.

Errors in child tiles never propagate upward until resolved and committed.

R00-00 Non-goals and explicit exclusions

This version does not include automatic discovery of embedded JSON, search, multi-tile parallel editing, live propagation, formatting preservation, diff views, or advanced navigation.

S00-00 Implementation constraints

The application is a static HTML, CSS, and JavaScript app using legacy script loading.

JSON parsing and serialization rely on standard JSON APIs.

Tiles are modeled internally as a chain with explicit parent-child relationships and stable identifiers.

Persistence is optional for this version.

T00-00 Success criteria

Users can edit deeply embedded JSON without manually escaping content.

Parent-child relationships are always clear.

Propagation occurs only on explicit commit.

The application behaves predictably, even with multiple nested levels.

This document defines the complete, unambiguous specification for the first version of the Embedded JSON Editor.
