2026-05-06

# Quick Sketch Bookmarklet — Final Product Requirement And Implementation Specification

## A00 Product Summary

**Product name:** Quick Sketch Bookmarklet.

**Product type:** Self-contained browser bookmarklet that injects a compact floating sketch, annotation, and simple Paint-style drawing utility into the current web page.

**Primary use case:** Create, annotate, edit, copy, cut, move, or download a quick hand-drawn or shape-based image inside the web page where the user is already working, without switching to another application.

**Final product direction:** Quick Sketch Bookmarklet is not a full whiteboard or design editor. It is a compact, local-first, Microsoft Paint-inspired browser overlay for fast visual communication. It supports blank sketching, image annotation, freehand drawing, translucent highlighting, erasing, primitive geometry shapes, solid filled shapes, text annotations, numbered and symbolic stamps, rectangle selection with contextual actions, moving selections, cutting selections, copying selections, cropping to a selected region, creating zoom callouts from selected regions, creating spotlight focus overlays from selected regions, viewport zoom, clearing the annotation layer, copying the selected region, downloading the selected region, copying the full canvas, downloading the full canvas, undo/redo, keyboard shortcuts, in-product help, a resilient wrapping command header, internal scrolling, dragging, resizing, and closing.

The product must remain lightweight, self-contained, and immediately useful.

---

## B00 Product Description

Quick Sketch Bookmarklet is a lightweight drawing and annotation utility that appears directly on top of any web page. The user invokes it from a browser bookmarklet. The bookmarklet injects a floating window into the current page. The window contains a compact two-row command header, a scrollable canvas viewport, and export/edit actions.

The user can draw freehand, erase annotations, import or paste images, draw over images, create primitive shapes, create filled solid shapes, type text, select a rectangular region, move that selected region, cut it, copy it, delete it, crop it, turn it into a zoom callout, copy the selected region or full canvas, and download the selected region or full canvas as PNG.

The product is optimized for fast communication, not high-fidelity design.

---

## C00 Product Value

Users often need to communicate visual intent faster than text allows. A rough sketch can show “move this here,” “circle this area,” “this region is wrong,” “connect these steps,” or “this layout should look like this” more efficiently than a long written explanation.

The bookmarklet removes the friction of opening a separate drawing application. The user can invoke the tool directly on top of ChatGPT, Slack, Gmail, GitHub Issues, Jira, Linear, Zendesk, Notion, documentation tools, admin dashboards, or any other web application.

The final version increases usefulness by adding simple Paint-like operations:

* Shapes for fast diagrams and UI annotations.
* Highlighter marks for translucent emphasis over screenshots or drawings.
* Solid filled shapes for masking, highlighting, and visual blocks.
* Text for typed labels.
* Numbered, check, cross, and warning stamps for structured visual review.
* Rectangle selection for moving, cutting, copying, or deleting a region.
* Contextual selection action bar for fast local actions near selected content.
* Crop to selection for isolating the relevant part of an image or sketch.
* Zoom callouts for magnifying important screenshot details.
* Spotlight overlays for high-contrast focus on one region.
* View zoom for navigating and composing detailed annotations on large screenshots.
* In-product Help and shortcuts for faster repeated use.
* Undoable annotation clearing for quickly restarting markup while keeping an imported screenshot or image.

The product remains local-first and does not upload data.

---

## D00 Product Non-Goals

The product must not become Excalidraw, Figma, Miro, FigJam, or a full diagram editor.

The product should not include:

* Cloud storage.
* Accounts or login.
* Collaboration.
* Infinite canvas.
* Layers panel.
* Object inspector.
* Shape libraries beyond primitive geometry.
* Rich text formatting.
* Font picker.
* Font size picker.
* Object snapping.
* Alignment tools.
* Project files.
* Templates.
* Multi-user sharing.
* Remote analytics.
* Server-side export.

The added selection tool is intentionally primitive and Paint-like. It is not a full object-selection system. Selection operates as a flattened rectangular bitmap region.

---

## E00 User Personas And Contexts

Primary users include developers, designers, product managers, founders, support engineers, researchers, educators, and anyone communicating visual ideas in a browser.

Common contexts:

* ChatGPT visual clarification.
* UI layout explanation.
* Bug reporting.
* Screenshot annotation.
* Quick wireframing.
* Support communication.
* Diagramming a small workflow.
* Masking or highlighting a part of a screenshot.
* Adding typed labels to an image or sketch.

---

## F00 Core Product Principles

1. **Compactness:** The window must remain small and non-intrusive by default.
2. **Canvas-first layout:** Most of the surface is reserved for drawing.
3. **Resilient command header:** Help and Close remain visible while the larger control set wraps safely below the title row.
4. **Button-driven reliability:** Important actions are visible buttons because host pages may intercept keyboard shortcuts.
5. **Local-first behavior:** No drawing, image, clipboard, or page data is sent to a server.
6. **Self-containment:** The bookmarklet injects its own DOM, CSS, SVG icons, event handlers, and state.
7. **Shadow DOM isolation:** Host page CSS should not affect the sketch UI.
8. **Paint-like simplicity:** The tool supports quick primitive operations, not complex object editing.
9. **Safe fallback behavior:** Clipboard failures should not break the workflow because download remains available.

---

## G00 Final MVP Scope

The final MVP includes:

* Bookmarklet invocation.
* Idempotent injection.
* Shadow DOM isolation.
* High z-index floating window.
* Draggable title bar.
* Resizable bottom-right handle.
* Compact resilient command header.
* Internal scrollable canvas viewport.
* High-DPI canvas rendering.
* Freehand pen.
* Translucent highlighter.
* Eraser.
* Color selector.
* Stroke width selector.
* View zoom from 50% to 200%.
* Undo/redo.
* Image paste/import.
* Copy full canvas.
* Download full canvas.
* Download selected region when selection exists.
* Help overlay.
* Keyboard shortcuts while the panel is focused.
* Primitive outline shapes.
* Primitive filled solid shapes.
* Text annotations.
* Numbered and symbolic stamps.
* Rectangle selection.
* Contextual selection action bar.
* Move selected region.
* Copy selected region.
* Cut selected region.
* Delete selected region.
* Crop document to selected region.
* Create zoom callout from selected region.
* Create spotlight focus overlay from selected region.
* Clear all annotations while preserving the background image.
* Close behavior.
* Local-only state.

---

## H00 Technical Platform

The implementation target is a bookmarklet, not a browser extension.

The bookmarklet is a single JavaScript URI starting with:

```javascript
javascript:(function quickSketchBookmarklet() {
  "use strict";
})();
```

The injected UI uses:

* Plain JavaScript.
* Shadow DOM.
* HTML canvas.
* Pointer Events.
* Clipboard API where available.
* File input fallback for image import.
* Inline SVG icons.
* No external runtime dependencies.
* No remote CSS, fonts, scripts, images, analytics, or services.

---

## I00 Bookmarklet Packaging

The final deliverable is a readable bookmarklet JavaScript source that can be converted into a bookmarklet URI.

The bookmarklet must be safe to run multiple times. It uses a unique root element id:

```text
qs-bookmarklet-root
```

If the root already exists, running the bookmarklet again raises or focuses the existing window instead of creating duplicates.

The root is appended to `document.body` or `document.documentElement`.

---

## J00 DOM And CSS Isolation

The bookmarklet creates one host element and attaches an open Shadow DOM root.

The UI, style rules, buttons, menus, canvas, file input, selection overlay, text editor, resize handle, and status messages live inside the shadow root.

The host page must not be modified except for adding the bookmarklet root element.

The bookmarklet must not change host page layout, scroll position, CSS classes, global CSS, global event handlers, or application state.

---

## K00 Visual Design Specification

The visual target is a compact floating utility card inspired by the annotated reference screenshot and the final tested implementation.

The window has:

* Rounded corners.
* Neutral light background.
* Subtle border.
* Soft shadow.
* Compact two-row command header.
* Always-visible Help and Close controls.
* Wrapping command controls that do not overlap or disappear at narrow widths.
* White drawing surface.
* Internal scrollbars.
* Bottom-right resize handle.
* High z-index overlay behavior.

Recommended default dimensions in the final version:

```text
Width: approximately 760px
Height: approximately 440px
Minimum width: approximately 390px
Minimum height: approximately 320px
```

The dimensions may clamp responsively to the viewport.

The command header minimum height is approximately:

```text
116px
```

---

## L00 Window Anatomy

The window has these regions:

1. **Command header**

   * Top row with drag grip/title and always-visible Help and Close buttons.
   * Wrapping command row with drawing tools, Stamp, Shape, Color, stroke width, zoom, history, import, selection actions, copy, and download.
   * Dropdown menus render over the canvas and stay constrained inside the panel instead of being clipped by toolbar overflow or panel edges.

2. **Canvas viewport**

   * Scrollable internal viewport.
   * Contains full document canvas.
   * Contains selection overlay.
   * Contains text editor when active.

3. **Resize affordance**

   * Bottom-right corner handle.
   * Resizes viewport/window without scaling artwork.

4. **Status region**

   * Small transient pill for success/failure feedback.

---

## M00 Toolbar Specification

Final toolbar controls:

| Control             | Behavior                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Drag grip/title     | Moves the floating window.                                                                    |
| Pen                 | Freehand drawing.                                                                             |
| Highlighter         | Draws wide translucent strokes using the current color.                                       |
| Eraser              | Erases annotation pixels while preserving imported image unless selection/cut/delete is used. |
| Rectangle selection | Selects a rectangular flattened region.                                                       |
| Text                | Places a text annotation.                                                                     |
| Stamp dropdown      | Chooses numbered, check, cross, or warning stamps.                                            |
| Shape dropdown      | Chooses primitive outline or solid shapes.                                                    |
| Color               | Chooses drawing, shape, and text color.                                                       |
| Stroke width        | Chooses pen, eraser, and outline shape stroke width.                                          |
| View zoom           | Scales the canvas viewport without changing document pixels or export size.                   |
| Undo                | Reverts last committed operation or group.                                                    |
| Redo                | Restores last undone operation or group.                                                      |
| Clear               | Clears all annotation operations while preserving the imported background image.               |
| Paste/import image  | Attempts clipboard image import, falls back to file picker.                                   |
| Cut                 | Cuts selected region when selection exists.                                                   |
| Crop                | Crops the document to the selected visible region when selection exists.                       |
| Callout             | Creates a magnified inset from the selected visible region.                                   |
| Spotlight           | Dims everything outside the selected region and draws a focus border.                         |
| Selection action bar | Offers Copy, Cut, Crop, Callout, Spotlight, and Download beside active selections.           |
| Copy                | Copies selected region if selection exists; otherwise copies full canvas.                     |
| Download            | Downloads selected region if selection exists; otherwise downloads full canvas PNG.           |
| Help                | Opens a compact shortcuts and workflow reference inside the sketch window.                    |
| Close               | Removes the sketch window.                                                                    |

The command header remains compact but is no longer forced into a single fixed-height row. The top row keeps Help and Close visible. The command row wraps groups when the panel is narrow. Stamp, Shape, and Color dropdown menus must remain visible and usable after wrapping, including when a trigger sits near the panel edge.

---

## N00 Shape Tool Specification

The shape dropdown contains:

1. Line.
2. Arrow.
3. Rectangle.
4. Solid rectangle.
5. Ellipse / circle.
6. Solid ellipse / circle.
7. Rounded rectangle.
8. Solid rounded rectangle.

Shape behavior:

* User chooses a shape from the dropdown.
* Shape tool becomes active.
* User drags on the canvas.
* A live preview is shown during drag.
* The shape is committed as one undoable operation on pointer release.
* Shape color uses current color.
* Outline shape width uses current stroke width.
* Solid filled shapes use current color as fill color.
* Solid filled shapes do not require a separate fill selector.

Modifier behavior:

| Modifier                                    | Behavior                     |
| ------------------------------------------- | ---------------------------- |
| Shift + rectangle/ellipse/rounded rectangle | Constrains to square/circle. |
| Shift + line/arrow                          | Snaps to 0°, 45°, 90°, etc.  |
| Alt/Option + rectangular shape              | Draws from center.           |

---

## O00 Text Tool Specification

The text tool allows simple typed annotations.

Behavior:

* User selects Text tool.
* User clicks the canvas.
* A small inline text editor appears.
* User types text.
* User clicks Done or presses Ctrl/Cmd + Enter to commit.
* User clicks Cancel or presses Escape to cancel.
* Committed text becomes one undoable operation.
* Text uses current drawing color.
* Text uses default font settings.

Default text styling:

```text
Font family: Arial, Helvetica, sans-serif
Font size: approximately 24px
Line height: approximately 1.25
```

No font picker, font size picker, bold, italic, underline, alignment, or rich text formatting is included in the final MVP.

---

## O10 Stamp Tool Specification

The stamp tool places compact visual markers with one click or tap.

Stamp presets:

1. Numbered badge.
2. Check.
3. Cross.
4. Warning.

Stamp behavior:

* Stamps use the current color.
* Numbered badges auto-increment from 1 through 9 and then wrap back to 1.
* Numbered stamps store the resolved number at placement time.
* Check, cross, and warning stamps do not change the next number.
* Each placed stamp is one undoable operation.
* Stamps are rendered into exports and can be captured by selection, crop, callout, copy, and download.

---

## P00 Rectangle Selection Specification

The final version includes a primitive Paint-style rectangle selection tool.

Selection behavior:

* User selects rectangle selection mode.
* User drags a rectangle on the canvas.
* A dashed selection overlay appears.
* If the selected region is large enough, the selection remains active.
* A compact contextual action bar appears near the active selection.
* If the user clicks and drags inside an active selection, the selected flattened region moves.
* Escape clears selection.
* Delete or Backspace deletes selected region.
* Cut copies the selected region to clipboard and then removes it from the canvas.
* Crop replaces the document with the selected visible region.
* Copy copies the selected region when a selection exists.
* Copy copies the full canvas when no selection exists.
* Callout creates a magnified inset from the selected region.
* Spotlight creates a dimmed focus overlay around the selected region.

Contextual selection action bar:

* Appears only when a stable selection exists.
* Hides while creating or moving a selection.
* Provides Copy, Cut, Crop, Callout, Spotlight, and Download actions.
* Is positioned in scaled viewport coordinates so it stays aligned at different zoom levels.
* Is a DOM UI overlay and is excluded from exports.

Important model detail:

Selection is **flattened bitmap selection**, similar to simple Paint behavior. It does not select individual vector objects, strokes, shapes, or text as editable objects. The selected region is captured from the composed canvas image.

Moving a selection:

* Captures the selected region as a bitmap.
* Whites out the original selected area.
* Places the captured bitmap at the new location.
* Commits that move as one grouped undoable operation.

Deleting a selection:

* Covers the selected area with white.
* Commits as one undoable operation.

Cutting a selection:

* Copies the selected region as PNG.
* Covers the selected area with white if copy succeeds.
* Commits the removal as one undoable operation.

Cropping a selection:

* Captures the selected region from the composed visible canvas.
* Replaces the document with the captured region as a new local background image.
* Resizes the document to the selected region.
* Clears active annotation operations because the cropped content is flattened into the new background.
* Commits the transformation as one undoable document snapshot.

Creating a callout from a selection:

* Captures the selected region from the composed visible canvas.
* Places a magnified copy near the selected region.
* Draws a source highlight rectangle, connector, and target inset border using the current color.
* Commits the callout as one undoable annotation operation.

Creating a spotlight from a selection:

* Uses the selected rectangle as the clear focus area.
* Dims the canvas outside the selected rectangle.
* Draws a focus border using the current color.
* Commits the spotlight as one undoable annotation operation.

---

## Q00 Canvas Viewport And Document Surface

The canvas viewport is scrollable inside the floating window.

The default document surface is larger than the default visible viewport:

```text
Default document width: 900px
Default document height: 650px
```

The drawing surface has:

* White background.
* Subtle visible dot grid in the editor view.
* Internal horizontal and vertical scrolling.
* High-DPI canvas backing store.
* Pointer coordinate conversion into document-space coordinates.

The editor grid is visible in the UI but excluded from exported PNGs.

View zoom:

* Supports 50%, 75%, 100%, 150%, and 200%.
* Scales only the viewport presentation.
* Does not alter document dimensions, operation coordinates, or export resolution.
* Keeps the viewport centered on approximately the same document point when zoom changes.
* Scales selection overlays and text editor placement so they align with document-space content.

---

## R00 Drawing Behavior

The pen tool is active by default.

Freehand drawing uses:

* Pointer Events.
* Pointer capture.
* Smooth midpoint quadratic curves.
* Rounded caps.
* Rounded joins.
* Device pixel ratio scaling.
* One undo operation per completed stroke.

Only the primary pointer button draws.

Pen strokes use current color and stroke width.

The highlighter tool draws wide translucent strokes. It uses the current color, scales up from the current stroke width, and renders with fixed opacity so highlighted screenshots and drawings remain visible underneath.

---

## S00 Eraser Behavior

The eraser removes user-created annotation pixels from the annotation layer.

For normal erasing:

* Imported background image is preserved.
* Pen strokes, shapes, filled shapes, and text can be visually erased because they are rendered into the annotation layer.
* Eraser operations are undoable and redoable.
* Eraser size is based on stroke width, with an enlarged effective width.

Important distinction:

* The eraser is annotation-layer oriented.
* Rectangle selection delete/cut/move is flattened-canvas oriented and can white-out any visible content in the selected region, including imported background imagery.

This distinction keeps normal annotation erasing safe while allowing Paint-like selection editing.

---

## T00 Color And Stroke Width

Color control:

* Default color is black.
* Red and blue are available.
* Custom color picker is available.
* Color affects pen, highlighter, shape outlines, filled shapes, and text.

Stroke width control:

```text
1px
2px
4px
8px
```

Default stroke width:

```text
2px
```

Stroke width affects:

* Pen.
* Highlighter size basis.
* Eraser size basis.
* Outline shapes.
* Arrow line and arrowhead scale.

Filled solid shapes use the current color as fill.

---

## U00 Undo And Redo

Undo/redo operates at committed operation level.

Undoable operations include:

* Pen stroke.
* Highlighter stroke.
* Eraser stroke.
* Shape.
* Filled shape.
* Text.
* Image import/background replacement.
* Selection delete.
* Selection cut removal.
* Selection move group.
* Selection callout.
* Selection spotlight.
* Clear annotations.
* Crop to selection/document snapshot.

A selection move is stored as a grouped command:

1. White-out original region.
2. Insert bitmap patch at new region.

Redo restores the same command or group.

Performing a new operation after undo clears redo history.

Clear annotations is stored as an undoable command that snapshots the current annotation operation list. Undo restores that list exactly. Redo clears it again. Clear does not remove the imported background image or resize the document.

Crop to selection is stored as a document snapshot command. Undo restores the previous document dimensions, background image, and annotation operations. Redo reapplies the cropped document.

Recommended history limit:

```text
100 committed operations
```

---

## V00 Image Paste And Import

Image import behavior remains central to annotation workflow.

The image import button:

1. Attempts to read an image from clipboard using Clipboard API.
2. If unavailable, blocked, denied, or no image exists, opens file picker fallback.

Accepted image types:

```text
image/png
image/jpeg
image/webp
image/gif
```

Imported image behavior:

* Imported image becomes the background layer.
* Image is placed at top-left.
* If too large, image is scaled down so longest side does not exceed approximately 2400px.
* Document surface expands to contain the imported image when needed.
* User can draw, shape, text, erase annotations, and select regions over the image.

---

## W00 Export: Copy

Copy behavior is context-sensitive.

When no selection exists:

* Copy exports the full composed drawing surface as PNG.
* It excludes UI, scrollbars, toolbar, host page, resize handle, and selection overlay.
* It includes background image, strokes, shapes, filled shapes, text, selection edits, and annotation content.

When a selection exists:

* Copy exports only the selected rectangle as PNG.
* The selected region is copied from the flattened composed canvas.
* Selection overlay itself is not included.

Clipboard write uses `navigator.clipboard.write()` and `ClipboardItem` where supported.

If clipboard write fails:

* Show compact failure status.
* Download remains available as fallback.

---

## X00 Export: Cut

Cut is available only when a selection exists.

Cut behavior:

1. Captures the selected rectangle from the composed canvas.
2. Attempts to copy it as PNG to clipboard.
3. If copy succeeds, whites out the selected area.
4. Clears selection.
5. Commits the removal as an undoable operation.

If clipboard copy fails, the canvas is not modified.

---

## Y00 Export: Download

Download always exports the full composed drawing surface as PNG.

Download does not export:

* Toolbar.
* Floating window chrome.
* Scrollbars.
* Selection overlay.
* Text editor UI.
* Host page.

Download filename format:

```text
quick-sketch-YYYY-MM-DD-HHMMSS.png
```

Download is local-only and does not require a server.

---

## Z00 Selection Delete

When a selection exists, Delete or Backspace removes the selected region by covering it with white.

This is committed as one undoable operation.

The selection overlay is cleared after deletion.

---

## AA00 Rendering Architecture

Rendering remains model-driven.

Rendering order:

1. White canvas background.
2. Optional visible editor grid.
3. Imported background image.
4. Annotation layer:

   * Pen strokes.
   * Outline shapes.
   * Filled shapes.
* Text operations.
* Stamp operations.
* Eraser operations.
   * Clear rectangle operations.
   * Image patch operations.
   * Active stroke preview.
   * Active shape preview.
   * Temporary selection move clearing.
5. Composite annotation layer over background.
6. UI overlays such as selection rectangle, selection action bar, and text editor are DOM overlays and are not exported.
7. View zoom is presentation-only and is not included in exported PNGs.

Export rendering:

* Same model, but no editor grid.
* No active uncommitted stroke.
* No active uncommitted shape.
* No selection overlay.
* No toolbar/window UI.

---

## AB00 Data Model

Final document model fields:

```text
documentWidth
documentHeight
backgroundImage
operations
undoStack
redoStack
activeTool
activeShapeType
activeStampType
nextStampNumber
strokeColor
strokeWidth
viewScale
activeStroke
activeShape
selection
activeSelectionDrag
activeSelectionMove
textEditor
windowRect
viewportScroll
objectUrls
```

Supported operation types:

```text
stroke
highlight
eraser
shape
text
stamp
clearRect
imagePatch
callout
spotlight
background command
group command
clearAnnotations command
documentSnapshot command
```

Stroke operation:

```text
{
  type: "stroke",
  points,
  color,
  width,
  createdAt
}
```

Highlighter operation:

```text
{
  type: "highlight",
  points,
  color,
  width,
  createdAt
}
```

Eraser operation:

```text
{
  type: "eraser",
  points,
  width,
  createdAt
}
```

Shape operation:

```text
{
  type: "shape",
  shapeType,
  color,
  width,
  x1,
  y1,
  x2,
  y2,
  createdAt
}
```

Shape types:

```text
line
arrow
rectangle
filledRectangle
ellipse
filledEllipse
roundedRectangle
filledRoundedRectangle
```

Text operation:

```text
{
  type: "text",
  text,
  x,
  y,
  width,
  color,
  fontSize,
  lineHeight,
  fontFamily,
  createdAt
}
```

Clear rectangle operation:

```text
{
  type: "clearRect",
  x,
  y,
  width,
  height,
  createdAt
}
```

Image patch operation:

```text
{
  type: "imagePatch",
  canvas,
  x,
  y,
  width,
  height,
  createdAt
}
```

Stamp operation:

```text
{
  type: "stamp",
  stampType,
  stampText,
  x,
  y,
  size,
  color,
  createdAt
}
```

Callout operation:

```text
{
  type: "callout",
  canvas,
  sourceRect,
  targetRect,
  color,
  width,
  createdAt
}
```

Spotlight operation:

```text
{
  type: "spotlight",
  rect,
  color,
  width,
  opacity,
  createdAt
}
```

---

## AC00 Clipboard Behavior

Clipboard read:

* Used for image import.
* Requires user action.
* May fail due to browser permissions or context.
* File picker fallback is required.

Clipboard write:

* Used for copying full canvas.
* Used for copying selected region.
* Used before cutting selected region.
* Requires user action.
* May fail due to browser permissions or context.
* Download remains fallback for full canvas export.

Selection cut should not remove content if clipboard write fails.

Download behavior:

* Downloads full canvas when no selection exists.
* Downloads the selected flattened visible region when a rectangle selection exists.
* Does not require clipboard permission.
* Uses object URLs for local download and revokes them shortly after triggering the download.

---

## AD00 Status Feedback

Compact transient status messages include:

```text
Copied
Copied selection
Downloaded
Downloaded selection
No image found in clipboard
Clipboard blocked
Clipboard blocked. Use Download.
Image imported
Image import failed
Export failed
Cut selection
Deleted selection
Text added
No selection
Nothing to clear
Cleared annotations
Cropped selection
Crop failed
Callout added
Callout failed
Spotlight added
Spotlight failed
Pen tool
Highlighter tool
Eraser tool
Selection tool
Text tool
Stamp tool
Stamp 1
Check stamp
Cross stamp
Warning stamp
Zoom 50%
Zoom 75%
Zoom 100%
Zoom 150%
Zoom 200%
```

Status messages disappear automatically after a short duration.

Blocking alerts are not used for normal feedback.

---

## AE00 Accessibility And Interaction Details

All toolbar controls should be real button or select elements.

Controls must have accessible labels through text, title, aria-label, or aria-pressed.

Active tool state is reflected visually and through `aria-pressed`.

Canvas has an accessible label.

The Help overlay uses dialog semantics inside the Shadow DOM and lists the main tool, history, clipboard, and selection shortcuts.
The Help overlay also notes that Zoom changes the view without changing export size.
The Help overlay also notes that selection actions appear beside selected content.

Keyboard shortcuts are local to the sketch window:

| Shortcut             | Behavior                                                   |
| -------------------- | ---------------------------------------------------------- |
| Escape               | Close menus, cancel text, clear selection, or close panel. |
| ?                    | Toggle Help.                                               |
| P                    | Activate Pen.                                              |
| H                    | Activate Highlighter.                                      |
| E                    | Activate Eraser.                                           |
| S                    | Activate Rectangle selection.                              |
| T                    | Activate Text.                                             |
| N                    | Activate Stamp.                                            |
| Ctrl/Cmd + Z         | Undo.                                                      |
| Ctrl/Cmd + Shift + Z | Redo.                                                      |
| Ctrl/Cmd + Y         | Redo.                                                      |
| Delete / Backspace   | Delete selected region.                                    |
| Ctrl/Cmd + C         | Copy selection when selection exists.                      |
| Ctrl/Cmd + X         | Cut selection when selection exists.                       |
| Ctrl/Cmd + Enter     | Commit text editor.                                        |

Keyboard shortcuts must not be global page hijacks.

---

## AF00 Security And Privacy

The bookmarklet must not:

* Upload drawing data.
* Upload pasted images.
* Upload selected regions.
* Upload clipboard contents.
* Read host page content except for injecting its own UI.
* Capture host page screenshots automatically.
* Use external analytics.
* Use external scripts.
* Use external styles.
* Use cloud storage.
* Persist drawing data in localStorage or IndexedDB in V1.

All state is in memory and discarded when the window is closed or the page reloads.

---

## AG00 Performance Requirements

The tool should open immediately.

Drawing should feel responsive for normal sketch sizes.

The implementation uses requestAnimationFrame for rendering.

Image imports are scaled to avoid excessive memory use.

Recommended maximum imported image longest side:

```text
2400px
```

Recommended maximum export area:

```text
approximately 16 million pixels
```

Cleanup should remove event listeners, DOM references, text editor UI, and object URLs.

---

## AH00 Browser Compatibility Expectations

Primary target:

```text
Modern Chromium-based desktop browsers
```

The implementation should also work in other modern browsers where required APIs are available.

Clipboard access may be blocked in some contexts. This is expected and must be handled gracefully.

Download must remain reliable even when clipboard copy fails.

---

## AI00 Final Acceptance Checklist

The final version is acceptable when:

* Running bookmarklet injects exactly one floating sketch window.
* Running bookmarklet again raises existing window.
* UI is inside Shadow DOM.
* Host page layout is not modified.
* Window is compact, rounded, shadowed, and high z-index.
* Command header uses a stable title row plus wrapping controls row.
* Help and Close remain visible at default and minimum panel widths.
* Controls wrap instead of overlapping or being truncated.
* Stamp, Shape, and Color dropdown menus are visible and usable.
* Window can be dragged.
* Window cannot be dragged completely off-screen.
* Window can be resized from bottom-right.
* Canvas viewport has internal scrollbars.
* Host page does not scroll when using canvas viewport.
* Pen draws immediately by default.
* Freehand strokes are smooth.
* Highlighter draws translucent emphasis marks.
* Eraser removes annotation marks.
* Eraser preserves imported image during normal erasing.
* Color selector works.
* Stroke width selector works.
* View zoom scales the visible canvas without changing exported pixel size.
* Undo/redo works for strokes.
* Undo/redo works for highlighter strokes.
* Undo/redo works for eraser.
* Undo/redo works for shapes.
* Undo/redo works for filled shapes.
* Undo/redo works for text.
* Undo/redo works for stamps.
* Undo/redo works for selection delete/cut/move operations.
* Clear removes annotation operations without removing the imported background image.
* Undo/redo works for Clear.
* Image paste/import works where clipboard allows.
* File picker fallback works.
* Imported image appears as background.
* User can draw over imported image.
* Shape dropdown includes line, arrow, rectangle, solid rectangle, ellipse, solid ellipse, rounded rectangle, and solid rounded rectangle.
* Shape preview appears while dragging.
* Shape commits on pointer release.
* Shift constrains shape proportions or line angle.
* Alt/Option supports drawing rectangular shapes from center.
* Text tool places an inline editor.
* Text commits as canvas content.
* Stamp tool places numbered, check, cross, and warning marks.
* Rectangle selection can be created.
* Contextual selection action bar appears for active selections.
* Selection can be moved.
* Selection can be copied.
* Selection can be cut.
* Selection can be deleted.
* Selection can be cropped into a new document.
* Undo/redo works for crop.
* Selection can be turned into a magnified callout.
* Undo/redo works for callouts.
* Selection can be turned into a spotlight focus overlay.
* Undo/redo works for spotlights.
* Help opens and closes inside the sketch window.
* P, H, E, S, and T activate their respective tools when the panel is focused.
* Copy exports selected region when selection exists.
* Copy exports full canvas when no selection exists.
* Download exports selected region when selection exists.
* Download exports full canvas when no selection exists.
* Export excludes UI and host page.
* Close removes injected UI and cleans up state.
* No external runtime dependencies are used.
* No data is sent to a server.

---

## AJ00 Final Product Principle

The final Quick Sketch Bookmarklet is a compact, local-first, browser-native, Paint-inspired annotation utility. It should stay simple enough to open instantly and use without explanation, but powerful enough to support quick sketching, image annotation, primitive diagrams, labels, filled blocks, and basic rectangular selection editing directly inside any web page.
