# Change request: see the prompt while choosing

Pragmatic development note, October 10, 2026. This supersedes the old manual-edit behavior and centered-only layout in the original specification. The reference screenshots are useful visual guidance, not a requirement to preserve their defects.

**Document contract:** `SPECIFICATION.md` remains the unchanged historical baseline, including its original section codes and complete examples. This note overrides the baseline's mixed manual/generated editing, destructive preset behavior, centered-only layout, and creation-time browser-verification limits. `CHANGE_REQUEST_PRESET_TILES.md` adds the later preset requirement. Both session notes remain mutable until completion is declared, then become immutable records; later work must add a new change request rather than rewrite these decisions.

## Why

Choosing options currently changes a prompt far below the viewport, so the user cannot see the effect. Editing that generated textarea also creates an unsafe mixed ownership model: presets can destroy user edits. Keep generation and authorship separate, and make changes visible without distracting motion.

## Invariants

- The menu is the sole source of the generated prompt. Regenerate it deterministically after every setting change.
- The bottom generated textarea and floating preview always show the same current text, always read-only. Never turn either into an editor.
- A clone is an independent string captured at creation, not a reference to the generated prompt. Only the user's own edits change it.
- Presets, reset, imports, regeneration, preview resizing, and preference changes never replace or delete existing clones.
- Creating multiple clones is supported without an arbitrary UI count limit. Storage quotas and the existing 1 MB import limit are real boundaries, reported explicitly.
- A single latest-change comparison is enough; this is not revision history, a merge editor, or per-keystroke tracking of authored drafts.
- Keep the standalone, dependency-free, single-HTML build and opt-in, local-only persistence. No automatic network traffic or transmission of private prompts.

## Floating window: explicit interaction checklist

- [x] See a readable live prompt on the right when working through the menu; keep it fixed to the viewport while the page scrolls.
- [x] Use a small left page margin on wide screens and reserve a right-hand lane for the initially docked window. It must not cover menu controls by default.
- [x] Scroll the prompt independently, select text, and use normal copy shortcuts. The generated preview is not editable.
- [x] Copy the entire current generated prompt, download it, or clone it directly from the preview.
- [x] Jump to the original full prompt at the bottom.
- [x] Collapse/close the preview to a narrow vertical title bar at the right edge. Closing does not lose state or disable generation.
- [x] Expand by clicking or keyboard-activating that title. Expose collapsed state with `aria-expanded`.
- [x] Drag the title bar to move the window. User-directed floating or enlarged positions may overlap the menu; the default dock may not.
- [x] Resize from all four edges and all four corners, with sensible minimum dimensions and viewport bounds.
- [x] Offer keyboard alternatives: arrow keys move the focused title bar; arrow keys resize a focused edge/corner; Shift uses larger steps.
- [x] Maximize to the viewport and restore the previous size/position. This is a window-size action, not the browser Fullscreen API.
- [x] Return to the right-hand dock/reset layout in one action if a moved/resized window becomes inconvenient.
- [x] Keep all controls reachable after viewport changes, browser zoom, and short-window resizing. Recompute bounds rather than allowing an offscreen title.
- [x] Escape collapses a focused preview and focuses its reopen tab. Expanding focuses the title control; never steal focus on an ordinary setting change.
- [x] Automatically hide the redundant floating preview while enough of the original generated textarea is actually visible. Bring it back when that textarea leaves view; retain size, preferences, and collapsed state.
- [x] Do not auto-hide a preview containing keyboard focus. Do not hide merely because a heading or a few pixels of the bottom section enter view.
- [x] Start collapsed on narrow screens to protect the menu. Opening there is an explicit overlay; resizing and docking remain viewport-constrained.
- [x] Hide duplicate floating controls in print output.

## Latest-change feedback and preferences

- [x] Compare previous and next generated text with a word/whitespace-aware Myers diff, preserving exact whitespace and unchanged text. Bound work for large edits and use a prefix/suffix replacement fallback, rather than blocking the page.
- [x] Subtly highlight inserted/replaced words in the current preview. Fade the highlight, not the text; no bouncing, flashing, or moving paragraphs.
- [x] Explain removals with a compact word-count summary and an expandable removed-text area, rather than silently making deleted text disappear or mixing old text into the current prompt.
- [x] Show only the latest comparison and its origin (setting/preset/reset/import). Rapid updates replace older feedback.
- [x] Offer footer preferences: highlight changes, follow the latest change, readable normal/large text, and automatic hiding beside the full prompt.
- [x] Follow-scroll only the preview's internal content; never scroll the menu or steal selection/focus after a setting change.
- [x] Respect `prefers-reduced-motion`: static highlighting is acceptable, animated fading is not.
- [x] Announce a short change summary politely to assistive technology, not the entire prompt on every update. Color is supplementary, not the only change signal.
- [x] Store preferences only with explicit browser-saving opt-in. Geometry is session-only, avoiding restoration of offscreen coordinates on another display.

The requested "diff for normal users" means readable current prompt text with quiet changed-word emphasis and a plain-language update summary, not a developer-oriented unified diff. Deleted/replaced paragraphs are available as old context separately; they never contaminate current generated text or copied/downloaded output.

## Clone and edit: explicit interaction checklist

- [x] Replace "Edit prompt" with "Clone and edit". Each click appends an editable prompt card below the generated section, copies the exact current generated text, and focuses its editor.
- [x] Label the area "Your prompt clones / user notes", give each clone an editable name, and show its creation date/time.
- [x] Keep each textarea independent of all menu updates, including presets and reset. Do not silently synchronize a clone even if the user has not edited it yet.
- [x] Support independent copying, text download, and confirmed deletion for each clone. Canceling deletion leaves the clone and its focusable editor intact.
- [x] Preserve other clones when one is edited/deleted; keep accessible labels unique and restore focus sensibly after deletion.
- [x] Allow empty authored drafts; disable copying/downloading empty text, not editing or deleting it.
- [x] Keep drafts in this page session when saving is off. Explain that reload loses unsaved drafts and warn on navigation/reload while unsaved clones exist.
- [x] Save/restore clones together with settings when Remember is on, including edits. Report quota/storage failures and keep the in-memory drafts usable.
- [x] Export settings, preferences, and clones together. Import settings atomically; append imported clones using new IDs, preserving the existing workspace. Repeated imports intentionally add copies, not overwrite by ID.
- [x] Migrate old non-null `manualPrompt` data into a labeled editable clone; never use it as generated output and never silently discard it.
- [x] Reset affects menu settings only; it retains clones and preview preferences. Presets retain assignment, established decisions, and special instructions.

## Whole-page polish and review

- [x] Inspect all seven reference screenshots and the real baseline, all SVG symbols/illustrations, and every widget—not just new functionality.
- [x] Shorten Why-first connectors so they terminate at node outlines; center the question mark without a line running through it.
- [x] Give Trace-first arrows a clear gap and coherent neutral styling; align drawings and retain the green accent only where useful.
- [x] Align heading/button pictograms with modern flex layout, consistent icon boxes, and wrapping text; do not use arbitrary baseline offsets.
- [x] Review desktop, medium-width, narrow mobile, short-screen, expanded, collapsed, maximized, scrolled, and clone states.
- [x] During screenshot review, record meaningful inconsistencies as actionable todos and fix them. Ignore immaterial one-pixel differences. Do not mistake source assertions for browser evidence.
- [x] Check radio/checkbox keyboard use, focus visibility, long labels, empty task, literal user text, disabled actions, import errors, clipboard fallback, and reduced motion.

## Additional conventions chosen for this implementation

These make the happy path solid without introducing an unnecessary workspace framework: recoverable right docking, keyboard movement/resizing, focus-safe auto-hiding, confirmed clone deletion, unsaved-draft warning, legacy migration, append-only clone import, bounded diff work, and viewport-constrained geometry. A collapsed tab is the requested "close" behavior; there is no second permanently hidden state. No auto-merging of authored text, cross-tab synchronization, cloud saving, rich-text editing, or indefinite diff history.

## Precise operational contracts and examples

- Desktop means at least 1100 viewport pixels. The menu starts with 24 pixels of left padding and a maximum 1008-pixel container. Its default reserved right lane is 460 pixels; collapsing reduces that reservation to 60. Narrow screens reserve 44 pixels for the right-edge tab.
- The default window is at most 420 pixels wide and 720 high, initially 16 pixels from the right and 88 from the top, adjusted to fit the viewport. Movement/resizing enforce 12-pixel outer bounds and nominal 320 x 380 minimum dimensions; smaller viewports take precedence over those minima. All eight resize handles work. Maximize fills the viewport inside those bounds; restore returns to the previous geometry.
- Current prompt text is 14 pixels, with a 16-pixel Large preference. Long text wraps and scrolls internally. Short screens keep footer controls independently scrollable instead of clipping them.
- Auto-hide requires at least `min(180px, 45% of textarea height)` of the bottom generated textarea to be visible. Merely seeing its title is insufficient. A focused expanded preview or reopen tab is not automatically hidden.
- Diff work is bounded at 30,000 edit-frontier steps; large replacements retain equal prefix/suffix text and replace the middle. Exact word/whitespace reconstruction is tested. The background fades over five seconds when motion is allowed; highlight markers clear after six seconds. Removed/replaced paragraph context and the latest summary remain until the next update.
- Follow-scroll is optional. It never scrolls the page, and active preview selections are mapped onto the new text where possible. Ctrl+A / Command+A inside the preview selects only the current prompt.
- Workspace JSON remains schema version 1. It contains menu settings, `promptClones`, `previewPreferences`, and the selected-preset state described in the second note. Preview defaults are highlight/follow/autoHide on, Normal text, and expanded on wide screens; narrow screens start collapsed.
- Each clone contains a unique ID, editable name, independent text string, and ISO creation timestamp displayed in local time. Names are limited to 120 characters, IDs to 100, and text to 100,000 UTF-16 code units. Existing task/context/special-instructions limits remain 20,000 each. Cloning has no arbitrary count cap; import retains its 1,000,000-byte limit.
- A legacy manual prompt has no original creation timestamp, so migration records the recovery time and labels it "Imported manual prompt". It never becomes generated output.
- Preset selection is an explicit request to apply its menu configuration and preserves assignment/context/special text. Reset is an explicit request to restore all menu defaults, including those fields, but never authored clones, preview preferences, or the Remember preference. Existing clones remain safe after every import, which appends imported clones instead of replacing them.
- Empty assignments disable generated Copy/Download/Clone actions and show guidance. Existing nonempty clones remain copyable. Empty authored drafts remain editable/deletable, with their own copy/download disabled.
- Browser saving is opt-in and local only. Turning it off removes saved browser data, not current page drafts. Storage failures retain the in-memory workspace and explain recovery. Unsaved clones warn before navigation/reload; saving successfully or exporting their current contents resolves that warning. Exporting does not enable browser saving.
- Exports larger than 1 MB still download but show an explicit import-portability warning. Individual text downloads remain available. Invalid imports are rejected before state changes. User/imported text is always text, never interpreted as HTML; browser textareas normalize line endings for synchronized display.
- Example: generate version A, clone it, edit the clone, select a preset to generate B, and clone B. Both authored copies remain independent and editable. Resetting the menu or importing a configuration changes neither copy. Deleting one requires confirmation and leaves the other intact.
- Example: select No diagrams. The current preview shows the new visualization instruction with quiet emphasis; old diagram text is shown only in the optional removed/replaced context. Copy still produces only the current prompt.

## Workflow requirements retained from the conversation

- [x] Read all project documents, source, examples, and supplied reference images before choosing a design; understand the existing behavior, not just the requested patch.
- [x] Check and use useful preinstalled tools. Use the existing global Playwright/Chromium for real-browser validation and ImageMagick for reference-image review; do not substitute source inspection for browser evidence.
- [x] For every screenshot review, do both jobs: validate the primary feature, then inspect the entire screenshot for relationships and meaningful inconsistencies among other components, even ones unrelated to the current edit.
- [x] Review widget by widget and all SVG assets. Add meaningful newly found layout defects to the work list before fixing them. Balance quality against nitpicking; ignore immaterial one-pixel spacing differences.
- [x] Treat screenshots/specification mockups as recommendations. They can contain errors; do not reproduce broken layouts merely for fidelity.
- [x] Use development-partner judgment to turn the happy path into solid interactions. Explicitly record additional common UX conventions and their reasons, rather than silently invent behavior.
- [x] Write pragmatic, precise notes in the implementer's own words, including why the features exist, invariants, complete developer checklists, omitted edge cases, examples, and acceptance criteria.
- [x] Finish the preview/clones/SVG/layout work before implementing the subsequently requested preset tiles. Compare alternatives and discard inferior experiments, as specified in the second note.
- [x] As the absolute final work phase, audit every received requirement against the baseline, session amendments, implementation, and evidence. Fill documentation or implementation gaps before declaring done.

## Acceptance evidence

The delivered `index.html` must be rebuilt from source. Node regressions must cover exact prompt/diff reconstruction, malformed workspace data, cloning safety, imports, persistence, and existing generation behavior. Real Playwright checks must exercise movement/resizing/collapse/maximize, auto-hide and return, read-only synchronization, clone independence across destructive old paths, keyboard use, reduced motion, download/copy fallback, and no horizontal overflow. Capture and visually inspect the whole page plus detailed state screenshots; record actual commands/results and limitations in `VALIDATION.md`.

## Final requirement audit

Completed after implementation and browser review, not used as a substitute for them. Each individual checklist item above and in the preset note was checked against the received requests and delivered behavior.

| Requirement group | Final requirement location | Evidence / resolution |
| --- | --- | --- |
| Understand the small project and use installed tooling | Workflow requirements | All project documents/examples/source and seven reference screenshots read; existing Playwright and ImageMagick used |
| Live visibility, left margin, right lane, fixed scrolling, no default overlap | Floating-window checklist; operational contracts | Desktop geometry and synchronization browser checks; whole-page screenshots |
| Close to vertical title, expand, drag, full resize, maximize/restore, recovery, complete UX list | Floating-window checklist | Pointer/keyboard checks, eight resize handles, collapsed/expanded/short-screen screenshots |
| Compare regenerated versions; quiet emphasis; show additions/replacements/removals; footer preferences | Latest-change checklist; operational contracts | Exact diff reconstruction, changed-word feedback, old-paragraph context, highlight/follow/text-size/reduced-motion checks |
| Keep bottom design; generated views always read-only; hide redundant floating preview and bring it back | Invariants; floating-window checklist | Bottom synchronization/auto-hide/return/focus-safety browser checks |
| Never lose authored changes; repeatable editable independent clones with creation times | Clone checklist; operational examples | Preset/reset/import preservation, multiple clones, legacy migration, saved-draft restoration |
| Polish Why-first, Code-first, Trace-first, palette/separation, icon/text alignment | Whole-page polish checklist | Node-boundary connectors and neutral arrow gaps fixed; Code-first retained; modern flex alignment; all SVGs reviewed |
| Review the full screenshot and other widgets, log meaningful issues, avoid pixel nitpicks | Workflow and whole-page checklists | Seven-width whole-page review; narrow header/card labels, removal readability/counts, and preset wrapping logged and fixed |
| Replace unclear dropdown with small memorable tiles, clear summaries, local hints, visible selection | `CHANGE_REQUEST_PRESET_TILES.md`, Chosen interaction | New SVG pictograms, hover/focus/touch detail checks, actual-setting summaries, checked/bordered/checkmarked tiles |
| Allow additional tiles, avoid narrow descriptions, experiment creatively, implement afterward | Preset note, Layout experiments and extension rule | Grid/strip comparison plus inline-phone refinement; seven-tile test; comfortable wrapping minimum; phase order retained |
| Make omissions, conventions, reasoning, examples, and acceptance explicit | Both notes, conventions/contracts/acceptance | Keyboard recovery, bounds, import/persistence limits, draft protection, Custom semantics, and test commands documented |
| Final audit; session notes mutable until done, immutable afterward; preserve original specification | Document contract; this audit | Historical specification retained unchanged; current behavior captured in amendments; no requested feature or current-request todo left unresolved |

The final combined suite passes 36 tests. Existing 2,187 prompt combinations and complete examples remain valid. `VALIDATION.md` records actual browser evidence and limits; no cross-browser, full assistive-technology, or model-answer-quality guarantee is implied.
