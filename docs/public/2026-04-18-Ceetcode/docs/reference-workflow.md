# Reference Workflow

Ceetcode includes an embedded C99 reference window designed for quick lookups during editing.

## Core Behavior

- `Reference` opens the floating C99 reference tool window.
- The first open loads the reference app.
- Closing the tool window hides it; reopening restores the same loaded state.
- Pop-out is available from the floating window title bar (`Pop Out`) for a standalone tab.

## Selection-Driven Lookup

- Select a symbol in the editor (for example `printf` or `memset`).
- Click `Reference`.
- The embedded reference starts a lookup seeded from the selected text.

If no selection exists, opening `Reference` reuses the current reference state.

## Embedded Narrow-Width Behavior

In embedded mode, search controls remain visible even at narrow widths. You can continue typing to get rich match results with context metadata.

## Safety Note

`Reset To Starter` is a destructive action and requires explicit confirmation.
