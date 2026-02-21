2026-02-11

A00 r00. Context and user value

The application already supports a fast reading workflow: load a folder, browse a project tree and TOC, and read file contents in a continuous scroll. The symbol references panel adds a second workflow: click a symbol and immediately see where it is referenced, grouped by file, with line-number jump targets. The remaining friction is that the user must still click away and navigate to validate whether a reference is meaningful, because a file name and a line number alone do not show the surrounding context.

This enhancement reduces that friction by reusing the existing preview window to show the referenced context on hover, directly from the symbol references panel. The user can keep the symbol references panel open, sweep across files and line chips, and visually confirm usage patterns without changing the main reading position, without opening additional panels, and without losing scroll context. The interaction is deliberately lightweight and reversible: it is hover-driven, read-only, and does not mutate the active file state.

The improvement is primarily about speed and cognitive load. It keeps the user in a single mental mode (inspection) rather than switching between inspection and navigation repeatedly. It also avoids UI noise by reusing an existing, already-optional preview window and by following the same timing, caching, and dismissal behavior that users already understand from TOC and tree preview hover.

B00 r00. Current behavior baseline

When the user clicks a symbol in the code view, a floating "Symbol references" panel appears. It shows summary counts and a References section grouped by file path. Each file group shows a hit count and one or more line-number chips (for example "L126") that act as navigation targets into the main view. Separately, the application includes a global preview feature that, when enabled, shows a floating preview window on hover over file entries in the project tree or TOC. The preview window displays the full source content of the target file in a scrollable container and is backed by caching of DOM clones.

This enhancement must not introduce a new preview system. It must route symbol-reference hover behavior through the same preview window instance, the same caching, and the same enable/disable toggle used by the existing preview feature.

C00 r00. Enhancement overview

The symbol references panel becomes preview-aware. When the user hovers over a file name in the References section, the preview window shows that referenced file. When the user hovers over a specific line chip, the preview window shows the same file and scrolls the preview content to bring the referenced line into view, with a temporary visual emphasis on the target line position.

Hover preview from symbol references is click-independent. Clicking continues to navigate in the main view exactly as before. Hover only updates the preview window content and does not change `state.activeFileId`, does not open or close file sections, and does not modify the URL hash.

D00 r00. UI and interaction rules

D01 r00. Eligibility and global enablement

Hover preview from symbol references is enabled only when the global preview feature is enabled. The deterministic rule is: if `state.preview.enabled` is false, pointer hover over symbol reference items produces no preview activity. This includes not creating the preview window.

Hover preview triggers only for mouse-like pointers. The deterministic rule is: if `event.pointerType` is present and not equal to "mouse", ignore the event for preview purposes. This matches the existing preview behavior.

D02 r00. Hover targets in the symbol references panel

Two hover targets are defined and must be implemented as preview anchors.

The file name for each reference group is a hover target. It must be rendered as an element that can be associated with a specific `fileId` and `filePath`. The preferred implementation is an anchor element with `data-file-id` and `data-file-path` set.

Each line-number chip within a reference group is also a hover target. It must be associated with the same `fileId` and additionally a 1-based integer line number. The preferred implementation is an anchor element with `data-file-id`, `data-file-path`, and `data-line` set, where `data-line` is a base-10 string.

D03 r00. Hover timing, switching, and dismissal

Hover preview timing must reuse the existing preview delays. The deterministic rule is: opening the preview window from a hover uses the existing open delay when the preview window is not already visible, and the existing switch delay when it is already visible. The implementation should reuse `PREVIEW_OPEN_DELAY` and `PREVIEW_SWITCH_DELAY` semantics and the existing pending-timer cancellation behavior.

The preview window must not reposition itself as a result of hovering over symbol references. It may be created if it does not exist, using the existing initial placement and last-placement behavior. After creation, subsequent hovers only update content and title and bump the inactivity timer, consistent with existing preview behavior.

Dismissal behavior remains unchanged. The preview window continues to dismiss using its existing outside-click and inactivity timer logic. Hovering symbol reference items bumps the inactivity timer in the same way as hovering TOC or tree entries.

E00 r00. Preview content behavior

E01 r00. File-name hover behavior

When hovering a file name in the References section, the preview window shows the full file content for that file. The preview title must follow the same convention used elsewhere, using the file base name and a stable prefix. If the existing preview title formatting is reused, no changes are required beyond ensuring the label is derived from `data-file-path`.

No line targeting is applied for file-name hover. The preview content scroll position is preserved for that file if the preview cache already contains a clone that has been scrolled by the user inside the preview window during the current preview lifetime. If the implementation does not currently preserve per-file scroll inside the preview clone, it may reset to top; this is acceptable for v1 of this enhancement and must be explicitly deterministic: file-name hover loads content at top.

E02 r00. Line-chip hover behavior

When hovering a line-number chip, the preview window shows the referenced file and scrolls the preview content so the target line is visible. The deterministic scroll rule is: compute an approximate vertical offset using the preview content line height, and scroll the preview content container to position the target line near the vertical center of the visible preview area, clamped to valid scroll range.

A temporary emphasis indicator must be shown at the approximate line position. This must not require re-tokenizing code, must not depend on any highlighting library, and must not modify the main document code DOM. The deterministic rule is: inject a single absolutely-positioned marker element into the preview clone container, positioned at `top = (line - 1) * lineHeight`, with a fixed height of one line. The marker uses a dedicated CSS class (for example `ref-preview-marker`) and is removed or updated on the next line-targeted hover.

The emphasis marker lifetime is tied to hover updates. The deterministic rule is: when switching to a different line chip or a different file, remove the old marker and add the new marker. When hovering a file name (no line), remove any existing marker.

F00 r00. Integration with existing preview implementation

F01 r00. Event routing

The existing hover preview system currently listens on the TOC list and tree container, and only recognizes anchors inside those containers. This enhancement extends event routing so the symbol references panel can participate.

The deterministic rule is: the symbol references panel root element must register the same pointerover, pointerout, and pointermove handlers used by TOC and tree hover preview. The handler must accept anchors within the symbol references panel that carry `data-file-id`. There are two acceptable implementations, and the chosen approach must be consistent across the codebase.

Option A is to generalize the anchor discovery logic so it recognizes anchors within an additional container, namely the symbol references panel root, without weakening the existing containment checks for TOC and tree.

Option B is to add a dedicated helper for symbol references that mirrors the existing anchor discovery logic but uses the symbol references panel root as its containment boundary. It must still call the same scheduling and show functions for preview, so the preview window instance and cache remain shared.

F02 r00. Anchor attributes and lookup

Hover targets must map to loaded files. The deterministic rule is: `data-file-id` must equal the internal file id used elsewhere (the `file.id` value created by `makeFileId(path)`), not a path string. The reference panel rendering code must therefore keep and pass file ids when it renders reference groups and line chips.

If a reference points to a file that is not currently loaded or has no preview source element available, hover does nothing. The deterministic rule is: rely on the existing `getPreviewSourceElement(fileId)` check and treat a null result as non-previewable.

F03 r00. Preview window content source and caching

The preview window must continue to use cloned DOM from the corresponding file section `<pre>` element in the main view, and it must continue to use the existing preview cache keyed by file id. This enhancement must not read file text again, must not create an alternate rendering path, and must not introduce a second cache.

When applying line targeting, the implementation must operate on the clone being displayed, not on the original file section. It must not add markers to the original file section DOM.

G00 r00. UX safety constraints

The hover preview behavior must not create accidental UI churn. The deterministic rule is: pointer movement inside the symbol references panel that does not cross into a new hover target does not trigger content reload, does not reinsert markers, and only bumps preview inactivity if the preview is already loaded for that same target.

Hover preview must not block interaction with the symbol references panel. The preview window must not steal focus and must not dismiss the symbol references panel. Hover preview is strictly supplementary and must remain read-only.

Hover preview must not interfere with scrolling in the main view. The indexing, navigation, and active file selection logic must remain unchanged by hover.

H00 r00. Boundary conditions and error handling

If the referenced file is currently hidden in the main view, hover preview still works, because preview is based on the existing file section DOM. Hover preview must not unhide the file and must not modify the hidden-files set.

If the referenced file section exists but its code content has not been rendered or is empty in the DOM, hover preview is treated as unavailable. This must not throw. It must fail closed and do nothing.

If the line number is out of bounds for the referenced file, the preview still loads the file but does not attempt to scroll or place a marker. The deterministic rule is: consider a line valid only if `1 <= line <= file.lineCount`.

I00 r00. Acceptance criteria

Hovering a reference group file name in the symbol references panel, with preview enabled, shows that file in the existing preview window without changing the main view position, the URL hash, or the active file state.

Hovering a line-number chip shows the referenced file in the preview window and scrolls the preview content so the target line is visible, with a temporary marker indicating the approximate line position.

Disabling preview via the existing preview toggle disables all hover preview behavior from the symbol references panel, without affecting click navigation.

Hover preview from symbol references shares the same preview window instance and cache as TOC and tree hover preview. Switching between hovering a TOC entry and a reference item reuses the same preview window and respects the same delays.

J00 r00. Out of scope for this increment

This increment does not add hover preview for definitions inside the symbol references panel unless definitions are rendered using the same file-id and line semantics described above. If definitions are present, they may be upgraded in a later increment using the same rules.

This increment does not require precise token-range highlighting of the symbol occurrence in the preview content. Only line-level positioning and a line marker are required.

This increment does not change how references are computed, indexed, grouped, or navigated on click.
