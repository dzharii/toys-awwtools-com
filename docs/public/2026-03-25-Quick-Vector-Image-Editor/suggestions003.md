A00. Product specification revision 02

A01. Document purpose revision 02

This document defines the first production release of a browser-based vector image editor implemented with vanilla HTML, modern CSS, and modern JavaScript, with no third-party runtime dependencies. It is the primary specification for design, implementation, and validation. It is intended to be handed directly to an implementer as the single source of truth.

This editor is designed for fast, high-frequency visual edits. It is not a general illustration suite and it is not a photo editor. Its purpose is to reduce the time and effort required to make practical edits to screenshots and other images, especially when the user needs to add text, highlights, shapes, or layered image compositions and export the result immediately.

A02. Product definition revision 02

The product is a single-page static web application that allows a user to create and edit a document composed of vector objects and embedded raster images. The user can place text, shapes, highlight elements, lines, and images on a canvas; move and resize those objects; arrange them in layers; navigate with pan and zoom; open supported documents from disk; and export the result as SVG, PNG, or JPEG.

The internal canonical document representation is SVG. The editor must preserve editor-specific information by storing metadata inside the SVG using explicit data attributes or another structured metadata mechanism defined by this document. The application must persist the current working draft using browser storage designed for document-sized payloads and must not rely on localStorage as the primary autosave store for image-heavy documents.

A03. Core problem being solved revision 02

The target user repeatedly has a simple but urgent need: take one or more screenshots or images and make a clear visual edit quickly. Existing tools often create too much friction for this task. They may be too large, too slow to use, overloaded with advanced features, poorly optimized for quick annotation, or unreliable for short editing sessions.

This product solves a narrower and more frequent problem set.

The user needs to do one or more of the following with minimal delay: add explanatory text; highlight an area with a rectangle, ellipse, line, or bar; place shapes over an image; move and resize annotations; combine multiple images into one composition; make screenshots the same visible size for comparison; stack one image over another using layers; pan and zoom around a larger composition; reopen a previously exported editor SVG; and export a final result in a common format.

The value is concrete. The product saves time, removes UI overhead, prevents accidental loss of work, and provides a predictable path from raw screenshot to shareable output.

A04. Product value and friction removal revision 02

The editor removes friction in eight specific ways.

First, it removes setup friction. The application is static and client-side. There is no account system, no required backend, no upload workflow, and no project synchronization dependency.

Second, it removes interface friction. The first release exposes only the tools needed for frequent daily edits. The interface remains intentionally smaller than a full design suite.

Third, it removes manipulation friction. Common actions such as selecting, moving, resizing, reordering, and editing text are direct and visible.

Fourth, it removes composition friction. Raster images are first-class objects inside a vector document, so the user can build image-based explanations and comparisons in one place.

Fifth, it removes navigation friction. Pan and zoom are core editing actions, not secondary features.

Sixth, it removes recovery friction. Autosave is always active, storage-aware, and designed to remain usable for ordinary screenshot-heavy documents.

Seventh, it removes reopen friction. The user can open an editor-generated SVG from disk and continue editing without reconstructing the document manually.

Eighth, it removes export friction. The user can export SVG, PNG, or JPEG directly from the working document without using another tool.

A05. Primary user scenarios revision 02

Scenario one is screenshot annotation. The user opens the app, inserts a screenshot, adds a short label and a highlight rectangle or ellipse, and exports a PNG for chat, email, documentation, or issue tracking.

Scenario two is comparison composition. The user inserts two screenshots, resizes them to comparable visible dimensions, aligns them side by side or in layers, adds labels, and exports a shareable image.

Scenario three is layered explanation. The user places a screenshot as a base, overlays another image on top, adds text and lines, and exports SVG for future editing and PNG or JPEG for immediate sharing.

Scenario four is reopen and refine. The user opens a previously exported editor SVG from disk, changes text and annotations, and exports a revised result.

Scenario five is quick markup recovery. The user edits a document, refreshes the page accidentally, returns to the application, and continues with the restored draft without rebuilding the work.

A06. First release product position revision 02

The first release is a focused editor for quick visual edits and light compositions. It must cover the common tasks described in this document with high execution quality. It is explicitly not required to match the feature breadth of a full desktop vector editor or raster graphics tool.

In this release, professional means the following: the core workflows are fast; the interactions are precise and consistent; the UI is restrained and coherent; storage and recovery behavior are explicit and trustworthy; exported output is reliable within the stated limits; and the implementation is modular enough to extend safely later.

B00. Scope revision 02

B01. In-scope capabilities revision 02

The first release must include these capabilities.

A document canvas with explicit width and height.

Creation of a new document.

Opening of supported document files from disk.

Insertion of raster image files as editable document objects.

Insertion of text objects.

Insertion of basic vector objects: rectangle, ellipse, and line.

Creation of bar-like emphasis elements using filled rectangles.

Selection of one object at a time.

Movement of selected objects.

Resizing of supported objects with visible handles.

Basic layer ordering controls.

Canvas pan.

Canvas zoom in, zoom out, and reset.

Object deletion.

Export to SVG.

Export to PNG.

Export to JPEG.

Automatic working-draft persistence.

Automatic recovery of recent valid working drafts.

A modular code structure with separation between editor features and shared internal libraries.

B02. First release shape set revision 02

The first release shape set is rectangle, ellipse, line, and text.

A circle highlight is implemented using ellipse geometry. If the user later needs a perfect circle, that may be introduced as a constrained ellipse behavior, but revision 02 does not require a separate circle object.

A bar is implemented as a rectangle with fill enabled and no stroke by default.

Arrowheads are out of scope for this release. Lines are plain lines only.

B03. Out-of-scope capabilities revision 02

The first release explicitly excludes the following.

Freehand drawing.

Bezier path editing.

Boolean path operations.

Cropping.

Masking.

Filters or effects.

Blend modes.

Collaboration.

Cloud save.

Accounts or authentication.

Server-side storage.

Rotation.

Skew or perspective transforms.

Grouping and ungrouping.

Layer locking.

Layer hiding.

Advanced typography controls beyond those defined in this document.

Plugin loading.

Third-party extension runtime.

Touch-first interaction design.

Mobile-first support.

Advanced accessibility work beyond baseline desktop usability.

Undo and redo are also out of scope for revision 02. This is a deliberate decision. The first release depends on direct manipulation, visible state, explicit open and export flows, and resilient draft persistence, not history stacks.

B04. Scope boundary rule revision 02

Any feature not named as in scope in this document is out of scope for revision 02. The implementer must not add behavior by inference if that behavior changes the interaction model, file format, persistence model, or UI complexity in a meaningful way.

C00. Design principles revision 02

C01. Functional principles revision 02

Every included feature must support at least one primary user scenario. Features that do not reduce repeated user friction are excluded.

The application must optimize for short-path completion. The user must be able to reach a useful result quickly with a small number of visible actions.

The editor must use SVG as the source of truth for editor-managed documents. In-memory state, export, open, persistence, and reload behavior must all derive from the same document model.

The system must favor explicit and deterministic rules over hidden intelligence. When multiple reasonable behaviors exist, the implementation must choose one rule and apply it consistently.

C02. UX principles revision 02

The UI must look professional through clarity, not through visual excess. Controls must be visible, stable, and understandable. Important actions must not be hidden behind ambiguous gestures.

Direct manipulation is preferred over dialog-driven editing. Selection, movement, resizing, and arrangement must happen on canvas whenever possible.

The editor must optimize for repeated use. The same user may perform many similar edits in one day. The common path must remain fast every time, not only on first use.

Recovery must be visible but low-friction. Automatic draft restoration is allowed, but the system must clearly identify restored working drafts and make draft replacement consequences visible.

C03. Architecture principles revision 02

Although the application is static and client-side, it must be built as a serious modular system. The codebase must separate domain logic from DOM wiring, persistence, parsing, rendering, and export.

Small editor-specific helper libraries are allowed and expected where they reduce repetition and improve clarity. They must remain narrow and internal. They must not become general-purpose frameworks.

C04. Reliability principles revision 00

The system must not overpromise persistence, SVG fidelity, or export success. Any guarantee made by the editor must be bounded by explicit format rules, storage rules, and rendering rules defined in this document.

D00. System model revision 02

D01. Mental model revision 02

A document consists of a canvas and an ordered list of objects. Each object has geometry, style, metadata, and an object type. Objects may be vector-native or raster-backed. Every object occupies exactly one position in the global z-order. Objects with higher z-order appear above objects with lower z-order.

The user edits one current document at a time. There is always one active tool. Selection is separate from the active tool except where this document defines a special rule. The viewport is a navigational view over the canvas and does not change the underlying document geometry.

The system distinguishes three related but separate concepts. The current document is the in-memory state being edited. The working draft is the most recent persisted recovery state stored by the application. The exported file is a user-generated file saved outside the application through an export action. Export does not replace the working draft. Working-draft persistence does not imply durable archival outside the browser.

D02. Entity model revision 02

The system must represent these entities.

Document. The root entity. It contains document metadata, canvas properties, the object list, and editor metadata.

Canvas. Defines logical width, logical height, and background behavior.

Object. A drawable entity in the document. Every object has a stable unique identifier, type, geometry, style, z-order position, and metadata.

Image object. A raster image placed in the document.

Text object. A text element with content and text style.

Rectangle object. A vector rectangle.

Ellipse object. A vector ellipse.

Line object. A vector line defined by two endpoints.

Selection. The currently selected object identifier or null. Revision 02 supports zero or one selected object only.

Viewport. The current pan offset and zoom scale used for editing.

Working draft record. A persisted wrapper containing one immutable saved snapshot plus recovery metadata.

D03. Object identity rules revision 02

Every object must have a stable unique identifier string. That identifier must persist across autosave, reload, export to SVG, and re-import of editor-generated SVG.

Object identifiers must not be reused within the same document, even if an object is deleted later.

D04. Coordinate model revision 02

All geometry is defined in document coordinates. Viewport transforms are applied only for rendering and interaction mapping.

The canvas origin is the top-left corner. Positive x extends to the right. Positive y extends downward.

All persisted numeric geometry values must be finite real numbers. NaN, positive infinity, and negative infinity are invalid and must never enter saved state.

D05. Layer model revision 02

The object list order is the layer order. The object at the end of the list is the frontmost object. The object at index zero is the backmost object.

All rendering, hit-testing, and selection precedence must use this same order. There must not be separate hidden layer lists.

E00. Functional specification revision 02

E01. Application startup revision 02

On application load, the system must initialize core services, inspect persistent draft storage, validate the most recent candidate working draft, and either restore the most recent valid draft or create a new empty document.

If one or more valid working drafts exist, the most recent valid draft becomes the active document automatically. The UI must show that the restored document is a recovered local draft.

If persisted data exists but fails validation, the system must discard that candidate, attempt older retained draft snapshots if available, and otherwise create a new empty document and show a visible non-blocking notice that a previous local draft could not be fully restored.

E02. New document behavior revision 02

The application must provide a New Document action. Invoking New Document replaces the current active document with a new empty document using default canvas settings.

If the current document is not empty, the system must require explicit confirmation before replacing it.

If the current document was restored from a working draft and has not yet been exported or opened from disk in the current session, the confirmation dialog must use stronger wording that the current recovered draft may become harder to recover later if replaced.

After New Document is confirmed, selection is cleared, the viewport is reset according to the standard open-document rule, and the new document becomes the current in-memory state. The previous draft must not be immediately destroyed. Draft retention rules defined later in this document apply.

E03. Document canvas defaults revision 02

The default canvas size is 1600 by 900 document units.

The default canvas background is white. Exported PNG and JPEG must also use a white background. Exported SVG must render with a white background as produced by the editor. Transparent canvas background is out of scope for revision 02.

E04. Image insertion revision 02

The user must be able to import one or more raster image files from local storage using a visible Insert Image action.

Supported input formats are the raster image formats that the browser can decode reliably for both on-screen rendering and export. At minimum, PNG and JPEG must be accepted. WebP may also be accepted if the browser environment supports it consistently.

Each inserted image becomes a distinct image object. The editor must embed the image data into the document representation. The application must not depend on the original local file path after insertion.

The default image sizing rule is as follows. If the source image fits within 80 percent of the canvas width and 80 percent of the canvas height, insert it at natural dimensions measured in document units. Otherwise, scale it down proportionally so that it fits inside that box. Upscaling on insertion is not allowed.

The default image placement rule is deterministic. The first inserted object is placed at x = 40, y = 40. Each immediately subsequent inserted object may be offset by +24 on x and +24 on y until the user performs a manual move. This rule prevents exact overlap during rapid insertion.

A newly inserted image must become selected immediately.

Before committing an inserted image to document state, the application must perform a persistence-envelope preflight check. If the addition would likely push the working draft beyond the supported autosave envelope defined by this specification, the application must warn the user before insertion completes. The user may still continue with insertion if the document can remain editable in memory, but the application must state whether reliable draft persistence is still expected.

E05. Text insertion revision 02

The user must be able to insert a text object using a visible Text tool or Insert Text action.

On insertion, a new text object is created with default content Text and enters text-edit mode immediately.

Default text style is: font family fixed system sans-serif stack; font size 24; font weight 400; fill color #111111; line height 1.2; text alignment left.

Revision 02 treats text as plain text only. Rich text is out of scope. Text wrapping is out of scope. Stored text is single-line text only. If the user pastes or types line breaks, the implementation must normalize them to spaces before storing the text object. This rule is mandatory, not optional.

Text position is anchored at the text baseline start point. The text object's stored x and y coordinates correspond to the SVG text element start point with dominant alignment behavior fixed by the implementation. The editor must use one consistent anchoring model for rendering, editing, serialization, and deserialization.

E06. Shape insertion revision 02

The user must be able to insert rectangle, ellipse, and line objects using dedicated tools or visible insertion actions.

Default object style is as follows. Rectangle uses transparent fill, 3-unit stroke, stroke color #ff3b30. Ellipse uses transparent fill, 3-unit stroke, stroke color #ff3b30. Line uses 3-unit stroke, stroke color #ff3b30.

Default inserted geometry is as follows. Rectangle width 180 and height 120. Ellipse width 180 and height 120. Line length 200 and horizontal orientation.

The default insertion position follows the same deterministic offset rule defined for images.

A newly inserted shape must become selected immediately.

E07. Selection behavior revision 02

Revision 02 supports single-object selection only.

Clicking an object selects that object.

Clicking empty canvas clears the selection.

If multiple objects overlap at the pointer location, clicking selects the frontmost eligible object according to the document layer order.

Eligibility for hit-testing is defined by explicit per-type rules. Image objects are hit-testable over their full rendered rectangular bounds. Text objects are hit-testable over their editor-defined text bounding box, not glyph outline only. Rectangles and ellipses are hit-testable over their full shape interior and stroke area even when fill is transparent. Lines are hit-testable using a screen-space minimum hit corridor defined later in this document.

When an object is selected, the editor must show a visible selection outline and the applicable manipulation handles.

If a fully covered lower object must be selected, the editor must provide a deterministic covered-object access rule. Revision 02 requires click-cycling at a fixed pointer location while holding Alt on Windows and Linux or Option on macOS. Each repeated modified click at the same pointer location must advance through hit-test candidates from front to back. The UI must not require a layer panel for covered-object selection.

E08. Object movement revision 02

A selected object must be movable by pointer drag.

Dragging starts when the pointer is pressed on the selected object's body and the pointer moves more than 3 screen pixels. This threshold prevents accidental drag on selection click.

Movement occurs in document space. The displayed movement must remain visually stable under pan and zoom.

Objects may be moved partially or fully outside the canvas bounds. Revision 02 does not clamp object geometry to the canvas area.

E09. Object resizing revision 02

Resizable object types are image, rectangle, ellipse, and line.

Text objects are not resized with drag handles in revision 02. Text size changes only through the properties panel. This is a deliberate rule to keep text behavior deterministic.

Image resizing must preserve aspect ratio at all times.

Rectangle and ellipse resizing may change width and height independently.

A line resizes by moving one endpoint at a time through visible endpoint handles.

Minimum object size rules are as follows. Image minimum width 4 and minimum height 4. Rectangle minimum width 4 and minimum height 4. Ellipse minimum width 4 and minimum height 4. Line minimum total length 4.

Resize attempts below the minimum must clamp to the minimum valid value.

E10. Layer order revision 02

The application must provide these layer actions for the selected object: bring forward, send backward, bring to front, and send to back.

Bring forward moves the object one position closer to the front. Send backward moves the object one position closer to the back. Bring to front moves the object to the frontmost layer. Send to back moves the object to the backmost layer.

If no object is selected, all layer controls are disabled.

If the selected object is already at the relevant boundary, the corresponding action is disabled.

E11. Deletion revision 02

The user must be able to delete the selected object using a visible Delete action and by pressing Delete or Backspace when the focus is not inside an active text input, numeric input, color input, file input, or text-edit state.

If no object is selected, delete must do nothing.

Deletion immediately removes the object from the document and schedules autosave using the standard dirty-state path.

Backspace must never trigger browser history navigation while the editor canvas or editor chrome has focus. The application must explicitly suppress default navigation behavior in relevant contexts.

E12. Pan and zoom revision 02

Pan and zoom are required core features.

The user must be able to pan the viewport using space plus drag. Middle-mouse drag may also pan if the environment supports it, but it is optional and must not be the only path.

The user must be able to zoom in, zoom out, and reset zoom using visible controls. These controls must be sufficient for users on trackpad-only or keyboard-limited devices.

Zoom limits are minimum 10 percent and maximum 800 percent.

The default zoom rule on document open is as follows. If the canvas is larger than the viewport, fit the canvas to the available viewport. Otherwise open at 100 percent.

Zoom triggered by visible controls is centered on the viewport center.

If wheel-based zoom is implemented, it should be centered on the pointer location. If that behavior cannot be made stable, viewport-centered zoom is acceptable. Wheel-based zoom must not depend on browser zoom shortcuts that vary across platforms.

Space-drag panning must not activate while focus is inside a text-editing field or any input control.

E13. Text editing revision 02

Text content must be editable after insertion and on later re-entry.

Single click selects a text object.

Double click on a selected text object enters text-edit mode. An explicit Edit Text action may also enter text-edit mode.

While in text-edit mode, keyboard input changes the text content. Escape exits text-edit mode and preserves the current text. Clicking outside the active text object exits text-edit mode and preserves the current text.

Required text controls in revision 02 are content, font size, and text color.

Font family is fixed to the system sans-serif stack and is not user-configurable in this release.

Text does not wrap. The editor must not implement automatic width-based wrapping for revision 02.

The editing surface may use an HTML text input overlay or an equivalent editor control, but the committed result must map back to one stored single-line text object using the same baseline start anchor used by the SVG representation. The implementation must calibrate edit-mode placement so that visible text position after commit matches non-edit display position within the text layout tolerance rules defined later in this document.

If a text object is newly inserted and the user exits text-edit mode with empty content, that new object must be removed automatically. If an existing text object is later edited to empty content, it remains as an empty text object.

E14. Basic styling controls revision 02

Revision 02 must include a minimal properties panel for the current selection.

For image objects, the panel must expose numeric position and size fields.

For rectangle and ellipse objects, the panel must expose stroke color, stroke width, fill color, numeric position, and numeric size fields.

For line objects, the panel must expose stroke color and stroke width. The panel may expose either explicit endpoints or an equivalent numeric representation, but the internal model must remain endpoint-based.

For text objects, the panel must expose content, font size, text color, and numeric position.

Color input may use the standard browser color picker control. Opacity, gradients, shadows, swatches, and palettes are out of scope.

E15. Export behavior revision 02

The user must be able to export the current document as SVG, PNG, and JPEG.

SVG export must serialize the canonical document, including editor metadata required for round-trip editing. The result must be a valid standalone SVG file.

PNG and JPEG export must render document content only. Editor overlays such as selection outlines, handles, hover indicators, hit-testing affordances, and UI chrome must not appear in exported files.

Raster export resolution is fixed at one output pixel per document unit. A 1600 by 900 document exports to a 1600 by 900 raster image. Higher-resolution export multipliers are out of scope.

JPEG export must always flatten onto a white background.

SVG export must preserve vector objects as vector elements and embedded raster images as embedded image data.

Before PNG or JPEG export begins, the application must perform a raster export preflight check. If the target canvas dimensions or estimated rasterization cost exceed the supported export envelope defined by this specification, the export must be blocked with a clear error notice before heavy work starts.

E16. Autosave and recovery revision 02

Autosave is always enabled while the application has usable browser storage.

The autosave rule is as follows. The editor marks the document dirty immediately after any committed mutation. It schedules autosave 500 milliseconds after the last mutation. It attempts immediate autosave when the page becomes hidden. It attempts immediate autosave before unload if the browser permits it.

Autosave writes the full canonical document representation, not a patch or incremental diff.

On startup, the most recent valid autosaved draft must be restored automatically if present.

The persisted payload must include a document format version number, a save sequence number, a saved-at timestamp, and the complete serialized document snapshot derived from one immutable document state snapshot.

Only the newest completed autosave may become the current working draft. Older save jobs that finish late must be discarded if their sequence number is lower than the current latest committed sequence.

If autosave fails because storage is unavailable, storage is full, or serialization fails, the application must show a visible non-blocking warning. Editing may continue in memory. The warning must remain accessible until autosave succeeds later or the user resets the document.

The UI must expose save-state feedback sufficient for the user to understand draft status. Revision 02 requires at least these visible states: all changes saved, save pending, and save failed.

F00. User interface specification revision 02

F01. Layout overview revision 02

The application uses a desktop-oriented layout with four primary regions: top toolbar, left tool rail, central canvas viewport, and right properties panel.

The canvas viewport must receive the majority of available space. The application is editing-focused and the document area is the primary surface.

A compact draft-status area must be visible in the top toolbar or status region. It must show whether the current document is a recovered draft, an opened file, or a new unsaved in-memory document, plus the current save-state feedback.

F02. Top toolbar revision 02

The top toolbar must contain high-frequency document and export actions.

Required controls are New Document, Open Document, Insert Image, Export SVG, Export PNG, Export JPEG, Zoom Out, Zoom percentage display, Zoom In, and Reset Zoom.

Controls must use clear labels. Icon-only controls are not sufficient unless a text label is also present or the meaning is unambiguous and always visible.

F03. Left tool rail revision 02

The left tool rail must contain the active editing tools.

Required tools are Select, Text, Rectangle, Ellipse, and Line.

A dedicated Pan tool is optional because space plus drag is already required.

Only one tool may be active at a time. The active tool must have a clear visual state.

F04. Right properties panel revision 02

The right properties panel must show context-sensitive controls for the current selection.

If nothing is selected, the panel must show document-level information, canvas information, or a neutral empty-state message.

The panel must not show controls irrelevant to the selected object type.

Numeric fields must support direct typing. Values are committed on Enter or on blur if valid. Invalid values must not change document state.

Canvas size editing, if supported in revision 02, must appear in the document-level section of this panel or in an explicit document settings section reachable from the main UI. It must not be hidden behind unrelated controls.

F05. Canvas viewport revision 02

The canvas viewport must render the document canvas against a neutral workspace background that contrasts clearly with the white canvas.

Canvas edges must remain visually obvious.

Content outside the visible viewport may be hidden by viewport clipping, but pan and zoom must allow the user to navigate to it.

Objects outside canvas bounds remain valid document objects and must remain editable when the viewport is moved to reveal them.

F06. Selection visuals revision 02

A selected object must display a visible non-exported selection outline.

Resize handles must remain usable at different zoom levels. Handle size must be defined in screen space, not document space.

Text objects in non-edit mode show selection bounds. In text-edit mode, the selection overlay must yield to text-edit affordances such as caret and active editing surface.

Line endpoint handles and thin object hit affordances must respect the minimum screen-space hit target rules defined later in this document, even if the visible line stroke is thinner.

F07. Enabled and disabled states revision 02

Controls that cannot act in the current context must remain visible but disabled.

Examples are as follows. Layer controls are disabled when no object is selected. Delete is disabled when no object is selected. Properties fields are disabled when no relevant selection exists. Export controls remain enabled whenever a document exists, including an empty document, subject to export preflight failure. Open Document and New Document remain available regardless of selection.

Disabled controls must not trigger side effects.

F08. Interaction feedback revision 02

Every successful state-changing action must produce immediate visible feedback.

Examples include a newly inserted object appearing immediately, selection becoming visible immediately, dragging updating geometry live, zoom controls updating the displayed zoom percentage, save-state feedback updating after persistence transitions, and error notices appearing when autosave, import, or export fails.

Normal editing must not be interrupted by unnecessary modal dialogs.

F09. Open and recovery indicators revision 00

When the current document comes from recovered browser storage, the UI must show a visible recovered draft indicator until the user dismisses it or performs an explicit open or new document action. When the current document comes from an opened file, the UI must show that state as opened document. When the current document is a new in-memory document not yet exported, the UI may show new document. The purpose is to reduce confusion between local draft recovery and explicit file open.

G00. Workflows revision 02

G01. Workflow: annotate a screenshot revision 02

The user opens the application and sees either a blank document or the last restored draft. The user clicks Insert Image and chooses a screenshot file. The screenshot appears on the canvas and becomes selected. The user drags it into position. The user selects the Rectangle tool and inserts a highlight rectangle over the screenshot. The rectangle appears with transparent fill and visible stroke. The user resizes and repositions it until it frames the relevant area. The user selects the Text tool and places a text object near the highlight. The text object opens in edit mode. The user types a label, exits editing, optionally changes font size or color in the properties panel, and then clicks Export PNG.

This workflow solves the immediate need to explain a screenshot quickly without switching between multiple tools or dealing with excessive UI overhead.

G02. Workflow: create a two-image comparison revision 02

The user inserts a first screenshot and then a second screenshot. Each becomes a separate image object. The user places them side by side. The user selects the first image and reads its width from the properties panel. The user selects the second image and sets its width to match. Because image resizing preserves aspect ratio, the height adjusts automatically. The user aligns the images, adds two text labels above them, and exports PNG or JPEG.

This workflow solves the need to create a visual before-and-after or side-by-side comparison quickly and predictably.

G03. Workflow: overlay one image over another revision 02

The user inserts a base screenshot and then inserts a second screenshot. The user moves the second screenshot on top of the first. If the layer order is wrong, the user uses bring to front or send backward. The user resizes the top image proportionally, adds text and one or more lines, and exports SVG for future editing or PNG for immediate sharing.

This workflow solves the need to create composite explanation graphics from multiple raster images without leaving the editor.

G04. Workflow: recover after accidental refresh revision 02

The user is editing a document and has already inserted images and annotations. The browser refreshes unexpectedly. When the user reopens the page, the application validates the most recent retained working draft, restores it automatically, marks it as a recovered draft, and shows the prior working state.

This workflow solves the risk of lost work in a static client-side application and is a core value feature of the product.

G05. Workflow: open a previous editor SVG revision 00

The user launches the application and clicks Open Document. The user selects an SVG previously exported by this editor. The application validates the file, parses its editor metadata, reconstructs the document model, and opens it as the current document. The UI marks the document as opened from file, not as an autosaved recovered draft. The user continues editing and exports a revised result.

This workflow solves the need for explicit reopen and revision of prior work outside browser-local draft persistence.

H00. Specification by example revision 02

H01. Example: overlapping objects selection revision 02

Given two objects overlap and both are selectable, when the user clicks the overlapping region, then the frontmost object in the document layer order becomes selected.

Given the selected object is moved behind the other object, when the user clears selection and clicks the same overlapping region again, then the now-frontmost object becomes selected.

H02. Example: image resize behavior revision 02

Given an image with aspect ratio 16:9, when the user drags a resize handle, then the width and height change proportionally and the aspect ratio remains 16:9 within ordinary floating-point precision.

Given the user commits a new width value in the properties panel, when the value is accepted, then the height updates automatically to preserve the existing aspect ratio.

H03. Example: export overlay exclusion revision 02

Given an object is selected and resize handles are visible, when the user exports SVG, PNG, or JPEG, then selection overlays, resize handles, hover outlines, and other editor-only visuals are absent from the exported file.

H04. Example: autosave debounce revision 02

Given the user moves an object several times in quick succession, when the final move completes, then the system may perform a single autosave 500 milliseconds after the last committed mutation rather than saving after each intermediate motion event.

Given the page becomes hidden before the debounce timer fires, when visibility changes, then the system must attempt an immediate autosave.

H05. Example: invalid local draft revision 02

Given persisted draft storage contains invalid JSON, malformed wrapper data, or an SVG payload that fails required validation, when the application starts, then the application must not crash, must not render partial corrupted content from that invalid snapshot, and must either restore an older valid retained draft or create a new empty document and show a recovery-failed notice.

H06. Example: out-of-bounds object placement revision 02

Given an image is moved so that part of it lies outside the canvas bounds, when the document is rendered, then the in-bounds portion remains visible and the object remains valid.

Given the user later pans the viewport, then the object remains selectable and movable.

H07. Example: empty new text object revision 02

Given the user inserts a text object, when the editor enters text-edit mode and the user deletes all content and exits immediately, then that newly created text object is removed.

Given an existing text object is later edited to empty content, when the user exits text-edit mode, then the empty object remains.

H08. Example: covered object selection revision 00

Given three overlapping objects are under the same pointer location, when the user holds Alt or Option and repeatedly clicks that location, then selection advances from the frontmost candidate to the next candidate behind it on each click until all candidates are cycled.

H09. Example: transparent shape hit-testing revision 00

Given a rectangle with transparent fill and visible stroke, when the user clicks inside the rectangle interior, then the rectangle is selectable because transparent fill shapes use full interior plus stroke hit-testing in revision 02.

I00. Data and file format specification revision 02

I01. Canonical format revision 02

The canonical document format is SVG augmented with editor metadata. The editor must be able to serialize its in-memory document model into SVG and reconstruct the same model from editor-generated SVG.

The application must not depend on sidecar metadata files for required editor behavior.

I02. Metadata strategy revision 02

Editor-specific metadata must preserve normal SVG rendering while enabling full round-trip editing.

The preferred strategy is as follows. Use standard SVG elements for the visual representation. Store editor metadata on those elements using namespaced data attributes. Store document-level editor metadata on the root svg element or in a dedicated metadata element.

Required metadata includes document format version, stable object id, editor object type where type is not safely inferable, and editor-only properties required for faithful reconstruction.

Metadata names must use a consistent prefix. The required prefix is data-ve-. Examples include data-ve-id, data-ve-type, and data-ve-version.

I03. Image embedding revision 02

Raster images inside SVG must be embedded, not externally referenced.

The required mechanism is a data URL attached to the SVG image element or another browser-compatible embedded resource representation that results in a standalone SVG file. The exported SVG must remain portable as a single standalone file.

I04. Local persistence representation revision 02

Primary working-draft persistence must use IndexedDB or an equivalent browser storage API designed for larger payloads. localStorage may be used only for small auxiliary metadata such as the identity of the latest draft record or lightweight session hints. It must not be the primary store for full image-heavy document snapshots.

A working-draft record must contain at minimum version, saveSequence, savedAt timestamp, documentOrigin marker, and svg string. It may also contain editor session metadata such as viewport state, recovery flags, or user-visible draft labels. The canonical visual document remains the embedded SVG string.

I05. Validation rules for persisted data revision 02

Persisted data must pass all of the following checks before restoration: the wrapper parses successfully; required keys exist; the version is supported or migratable; the svg field is a non-empty string; the SVG parses successfully; required editor metadata is coherent; all numeric values are finite; all object identifiers are unique; and the wrapper saveSequence is valid.

If any required validation fails, that snapshot must be rejected.

I06. Import rule revision 02

Revision 02 guarantees correct round-trip import only for SVG files produced by this editor and conforming to the editor metadata schema defined here.

Arbitrary third-party SVG files are not guaranteed to import as editable documents. They may be rejected. Revision 02 requires rejection, not partial import, for non-editor SVG in the explicit Open Document flow unless a later specification adds a separate import mode.

I07. Round-trip SVG definition revision 00

For revision 02, faithful round-trip means the following for editor-generated SVG opened in the same editor family and supported browser class.

The object count must remain identical.

Each object id must remain identical.

Each object type must remain identical.

Layer order must remain identical.

Numeric geometry values stored by the editor must be restored exactly or within normal floating-point serialization tolerance that does not alter visible editing semantics.

Style values controlled by revision 02 must remain identical.

Embedded image resources must remain present and associated with the same objects.

Canvas width and height must remain identical.

Editor metadata required for future reopening must remain present and valid.

Text content must remain identical after normalization rules are applied.

Visible text rendering is guaranteed only within the text-layout limitations defined by this document. Cross-device and cross-browser glyph metrics may differ. Therefore faithful round-trip for text means identical stored text properties and identical anchor coordinates, not pixel-identical rendering across all environments.

I08. Text layout compatibility rule revision 00

The editor uses a fixed system sans-serif stack. Because the actual resolved font may differ by operating system and browser, the product does not guarantee pixel-identical text rendering across different machines or browser engines. It guarantees that stored text content, font size, color, anchor coordinates, and single-line no-wrap semantics are preserved. Acceptance of text round-trip must therefore be based on preserved stored properties and stable editor reopen behavior, not absolute cross-platform pixel identity.

J00. Validation and input rules revision 02

J01. Numeric input validation revision 02

All numeric inputs must validate at commit time.

The following are invalid: empty string, non-numeric string, NaN, positive infinity, and negative infinity.

Invalid committed values must not mutate document state. The UI must restore or preserve the previous valid value.

Minimum numeric constraints are as follows. Canvas width and height must be greater than zero. Font size must be at least 1. Stroke width must be at least 0. Rectangle width and height must be at least 4. Ellipse width and height must be at least 4. Image width and height must be at least 4. Line length must be at least 4.

J02. File input validation revision 02

Image insertion must reject unsupported file types.

If a selected file cannot be decoded into a valid image, insertion must fail with a clear non-blocking notice and no partial object must remain in the document.

If an image is too large to be processed safely for insertion, persistence, or export, the operation must fail visibly or require explicit user confirmation if the editor can continue without guaranteed persistence.

J03. Text validation revision 02

Text content may be empty, subject to the special new-object removal rule defined in E13.

Because multiline text is out of scope in revision 02, line breaks must be normalized to spaces before commit.

Text content must be treated as plain text. No markup interpretation is allowed.

J04. Document open validation revision 00

The Open Document flow must accept SVG files only.

If the selected file is not valid XML, not valid SVG, or lacks the required editor metadata for supported document import, the open action must fail with a clear non-blocking notice and must not replace the current document.

If a valid editor-generated SVG is selected and successfully parsed, it becomes the current document after any required replacement confirmation defined by this specification.

K00. Error handling revision 02

K01. General error policy revision 02

Operational failures must be visible and contained. The application must not fail silently and must not corrupt the current in-memory document because a side effect failed.

User-facing notices must state what failed and whether the active document remains intact in memory.

K02. Required error cases revision 02

The application must handle at least these error cases: invalid retained draft snapshot; draft storage unavailable; draft storage quota or capacity failure; unsupported image file type; image decode failure; unsupported or invalid SVG open attempt; SVG export serialization failure; PNG or JPEG export preflight rejection; PNG or JPEG export rasterization failure; and unexpected internal validation failure.

Each case must produce a visible non-blocking notice.

K03. Crash prevention revision 02

A malformed persisted payload, invalid user input, unsupported opened file, or single invalid object must not crash the entire application.

Validation must be applied at all major boundaries: file import; open document parse; persisted load; properties panel commit; serialization; deserialization; and export preparation.

L00. State model revision 02

L01. Required state domains revision 02

The application must manage these state domains: document state, selection state, active tool state, viewport state, UI transient state, persistence state, and notification state.

Document state is the canonical editable content. Selection state is the selected object id or null. Active tool state is the current editing tool. Viewport state stores pan and zoom. UI transient state stores drag, resize, hover, text-edit, and dialog state. Persistence state stores dirty flag, autosave schedule state, latest requested save sequence, latest completed save sequence, last successful save time, storage availability, and recovery status. Notification state stores active notices.

L02. Editor modes revision 02

The editor must support these interaction modes: idle, object selected, dragging object, resizing object, text editing, panning, and object insertion if tool-driven placement is used.

Mode transitions must be explicit. A mode must not partially overlap another mode in a way that causes conflicting keyboard or pointer meaning.

While in text-edit mode, Delete and Backspace apply to text content, not object deletion. While panning, object drag must not begin. While a replacement confirmation dialog is open, canvas interactions must not mutate the document.

M00. Architecture specification revision 02

M01. Architecture goals revision 02

The implementation must remain maintainable, testable, and extendable. The codebase must support future editor growth without turning into a single tightly coupled DOM script.

M02. Structural style revision 02

The preferred style is feature-oriented modular decomposition with a small number of shared internal libraries.

The implementation must separate document domain model and mutation commands, SVG serialization and parsing, rendering, pointer and keyboard interaction mapping, UI construction and binding, persistence, export, validation, and notification handling.

The architecture may be described as lightly ports-and-adapters influenced, but it must remain simple. The required rule is that core editor logic must not depend directly on DOM structure; browser-specific integrations must be isolated behind clear modules; and UI composition may use small internal helper functions rather than external frameworks.

M03. Suggested module decomposition revision 02

The codebase should be organized around modules equivalent to the following logical areas.

Core document module defines schema, defaults, object factories, id generation, and domain validation.

Document commands module implements create, update, delete, reorder, and canvas-level mutations.

Selection module resolves and updates single-object selection.

Viewport module manages pan, zoom, coordinate conversion, and viewport state.

Interaction module translates pointer and keyboard input into domain actions and mode transitions.

Render module produces the editable scene and editor overlays.

Serialization module converts document state to SVG and parses editor-generated SVG back to document state.

Persistence module handles autosave, IndexedDB reads and writes, retention management, validation, and recovery.

Export module handles downloadable SVG generation and raster export pipeline.

Open/import module handles user-selected SVG file validation and document replacement flow.

UI module builds toolbar, tool rail, properties panel, notices, and confirmation prompts.

Editor UI helper library provides concise helpers for repeated editor UI patterns such as labeled controls, numeric field binding, action buttons, section wrappers, and notices.

SVG metadata helper library provides consistent reading and writing of editor metadata on SVG elements.

M04. Dependency direction revision 02

Domain modules must not depend on the concrete DOM. UI modules may depend on domain modules. Persistence and export modules may depend on serialization and validation modules. Open/import modules may depend on parsing and validation modules. Rendering may depend on domain state and viewport state, but business rules must remain in commands and validation modules.

This dependency direction is mandatory because it prevents editing behavior from being scattered across view code.

M05. Internal helper libraries revision 02

If repeated DOM and SVG manipulation patterns make the code verbose or error-prone, the implementer must create small internal helper libraries rather than duplicating logic throughout the app.

These helpers must be editor-specific and minimal. They must not introduce hidden lifecycle systems or abstraction layers that obscure data flow.

N00. Rendering model revision 02

N01. Rendering strategy revision 02

The preferred rendering strategy is SVG for document content plus a separate overlay layer for editor-only visuals.

Document objects must render in an SVG scene aligned with the canonical SVG data model.

Selection outlines, handles, hover indicators, hit corridors, and other non-exported editing affordances may render in a separate SVG or DOM overlay as long as coordinate mapping remains exact.

N02. Render ordering revision 02

Visual object rendering order must match the document layer order exactly.

Editor overlays must always render above document content and must never be included in exported output.

Text-edit controls may temporarily overlay content during editing, but committed content must return to canonical document state.

N03. Performance expectations revision 02

Revision 02 targets small to moderate documents typical of quick editing work.

The application must remain responsive with documents approximately in the range of up to 50 vector objects and up to 20 embedded images of normal screenshot scale, assuming persistence and export limits defined elsewhere in this document are not exceeded.

This is a practical target, not a hard schema limit. The implementation does not need virtualization or advanced scene culling in this release.

O00. Keyboard and pointer interaction revision 02

O01. Required keyboard shortcuts revision 02

Revision 02 must support these shortcuts on desktop: Delete or Backspace to delete the selected object when not editing text or typing in any input control, and Escape to exit text-edit mode or cancel the current transient interaction state where applicable.

Additional shortcuts such as duplication, arrow-key nudging, history commands, or keyboard zoom are out of scope unless explicitly added later.

O02. Pointer interaction rules revision 02

Single click selects.

Double click on selected text enters text-edit mode.

Drag on selected object body moves the object.

Drag on a resize handle resizes the object.

Drag on a line endpoint handle updates that endpoint.

Click on empty canvas clears selection.

Space plus drag pans.

Alt-click on Windows and Linux or Option-click on macOS cycles through overlapping hit candidates at the same pointer location from front to back.

Pointer capture or an equivalent mechanism must be used so drag interactions remain stable even if the pointer leaves the object bounds.

O03. Desktop input compatibility rules revision 00

All core functions must remain reachable without middle mouse support.

Backspace and Delete shortcuts must be suppressed when they would otherwise cause browser navigation or other browser-default destructive behavior outside the editor model.

Keyboard shortcuts must not fire while focus is inside text inputs, numeric inputs, color inputs, file inputs, or active text-edit overlays, except for the key handling explicitly owned by that control.

Space-drag panning must not interfere with normal typing in controls. The application must activate space-drag only when the editor canvas region or another non-text editor surface currently owns interaction focus.

Any optional wheel-plus-modifier zoom behavior must not rely on browser page zoom shortcuts and must degrade safely if the environment prevents it.

P00. Security and privacy revision 02

P01. Privacy model revision 02

The product is local-first. User content remains in the browser unless the user explicitly exports a file. The application must not require network access for normal editing behavior.

P02. Local storage considerations revision 02

Working drafts may contain sensitive screenshots or annotated information. Browser storage exists for convenience, not for confidentiality. The product must not imply that draft persistence is secure storage.

The application must provide a path to clear the current working draft by creating a new document and allowing standard retention rules to age out prior retained snapshots. A dedicated clear-draft action may be introduced later, but it is not required for revision 02.

Q00. Risks and mitigations revision 02

Q01. Risk: large image-heavy drafts exceed small browser storage mechanisms revision 02

Embedded images can make document snapshots far too large for localStorage and can stress browser persistence in general.

Mitigation is as follows. Primary draft persistence must use IndexedDB or equivalent larger-payload browser storage. The editor must define a supported autosave envelope, perform preflight checks before insertion and autosave, retain user-visible save-state feedback, and continue editing in memory when storage fails.

Q02. Risk: ambiguous text editing behavior revision 02

Text editing often becomes inconsistent in editors that blur the line between selection and direct editing.

Mitigation is as follows. Use explicit entry to text-edit mode, suppress object-level deletion while editing text, exclude multiline text and text box resize semantics from this release, and define one baseline-start anchor model for both editing and stored SVG.

Q03. Risk: unstable coordinate mapping under zoom revision 02

Pan and zoom can cause drag drift or incorrect hit-testing if coordinate conversion is spread across the codebase.

Mitigation is as follows. Centralize viewport math in one module and use one coordinate conversion path for interaction logic.

Q04. Risk: SVG round-trip mismatch revision 02

If SVG serialization and SVG parsing diverge, export and reopen will become unreliable.

Mitigation is as follows. Define exact metadata rules, reuse shared validation rules for both directions, define faithful round-trip precisely, and restrict guaranteed SVG import to editor-generated SVG only.

Q05. Risk: architectural collapse into one large script revision 02

Small client-side apps often degrade quickly into tightly coupled event handlers and implicit state.

Mitigation is as follows. Define the module boundaries from the beginning and keep domain logic, rendering, persistence, open/import, and UI assembly separate.

Q06. Risk: raster export failures on large documents revision 00

Large canvases or large embedded images can cause canvas allocation failure, long hangs, or browser-specific raster export limits.

Mitigation is as follows. Define an explicit raster export envelope, perform preflight before export, block clearly unsupported exports before expensive work begins, and report likely failure causes precisely.

R00. Non-functional requirements revision 02

R01. Browser target revision 02

The target environment is a modern desktop browser with support for ES modules, modern CSS, SVG, file input APIs, IndexedDB, and browser-side raster rendering.

Legacy browser support is out of scope.

R02. Dependency rule revision 02

No third-party runtime dependencies are allowed.

All production behavior must be implemented using platform APIs and in-house code.

Build tooling is not defined by this specification. A lightweight build step may be used if needed, but it must not change the runtime rule that the application itself has no third-party runtime dependencies.

R03. Maintainability requirement revision 02

Every file-format rule, validation rule, interaction rule, and persistence rule defined in this document must map to a clear implementation location. Business rules must not be hidden inside unrelated UI event handlers.

R04. Supported persistence envelope revision 00

Revision 02 must declare and enforce a persistence envelope for reliable working-draft autosave.

The required minimum supported envelope is at least one document containing 10 embedded screenshots of typical modern UI capture size, plus 50 vector and text objects, without losing the ability to autosave under normal modern desktop browser conditions.

The implementation may exceed this envelope, but it must not claim more than it can enforce. If current browser conditions make even the minimum envelope unavailable, the UI must state that reliable draft persistence is currently degraded.

R05. Supported raster export envelope revision 00

Revision 02 must declare and enforce a raster export envelope.

The required hard rule is that raster export must be blocked if the target export surface exceeds either 8192 pixels in width, 8192 pixels in height, or 67,108,864 total pixels. These values are conservative operational limits for revision 02 and are chosen to reduce browser instability.

An implementation may choose lower limits for reliability on target browsers, but it must not choose higher limits without evidence and explicit revision to this specification.

S00. Deferred roadmap revision 02

S01. Likely future extensions revision 02

The architecture should leave room for future capabilities such as undo and redo, grouping, rotation, cropping, arrowheads, opacity, more text controls, guides and snapping, multiple documents, larger persistence backends, broader SVG import, and tool extension mechanisms.

These items are explicitly deferred. They must not be included in revision 02 acceptance criteria or implementation checklists unless a later document adds them.

T00. Acceptance criteria revision 02

T01. Product-level acceptance revision 02

The first release is acceptable only if a user can complete the primary scenarios end to end without another editor during the core edit flow.

The user must be able to insert screenshots, annotate them with text and basic vector objects, resize and move elements precisely enough for practical daily work, compose multiple images in layers, navigate the canvas with pan and zoom, open a prior editor-generated SVG from disk, export SVG, PNG, and JPEG, refresh the page and recover recent work, and understand whether the current document is a recovered draft, an opened file, or a new document.

T02. Quality-level acceptance revision 02

The release is acceptable only if the UI is coherent and visibly professional, controls enable and disable correctly by context, ordinary screenshot-heavy documents remain recoverable within the declared persistence envelope, exported files exclude editor-only overlays, editor-generated SVG exports reopen correctly in the same editor according to the round-trip definition in this document, invalid or unsupported SVG open attempts fail safely, and the implementation is modular rather than a monolithic script.

T03. Fixture-based acceptance revision 00

The implementation must include fixture-based validation for at least these document cases: a document with multiple embedded screenshots; a document with overlapping shapes and covered objects; a document with out-of-bounds objects; a document containing text objects with different font sizes and colors; and a document near the raster export envelope.

For each fixture, the editor must verify that export, reopen, layer order, object count, geometry restoration, and required metadata restoration satisfy this specification.

U00. Implementation notes revision 02

U01. Selected explicit decisions revision 02

This specification makes the following binding decisions for revision 02.

The canonical format is SVG with embedded editor metadata.

Primary working-draft persistence uses IndexedDB or equivalent larger-payload browser storage, not localStorage.

localStorage may be used only for lightweight auxiliary metadata.

Autosave is always enabled when storage is available and uses full-document debounced writes.

Selection supports only zero or one selected object.

There is no grouping.

There is no rotation.

There is no cropping.

There are no arrowheads.

There is no freehand drawing.

There is no undo or redo.

Image resizing always preserves aspect ratio.

Text is plain single-line text only.

Text does not wrap.

Text objects are not resized with drag handles.

Text position uses one fixed baseline-start anchor model.

The default canvas size is 1600 by 900.

The default background is white.

The default text family is a fixed system sans-serif stack.

Raster export resolution is 1x document size.

Raster export is blocked beyond the declared export envelope.

Object insertion uses deterministic offset placement.

Invalid persisted drafts are discarded or skipped in favor of older valid retained snapshots.

Generic third-party SVG is not an editable import target in revision 02.

The codebase is feature-oriented with small shared internal libraries.

U02. Summary of solved user problems revision 02

The product solves the practical problem of quick visual editing without the startup cost and interaction burden of a full design suite. It gives the user a direct way to annotate screenshots, compose multiple images, add labels and highlights, control layers, reopen prior editor files, and export in common formats. It also protects recent work through browser-side draft persistence designed for image-heavy documents. The scope stays intentionally narrow so the everyday workflow remains fast, clear, and reliable.

V00. Open issues status revision 02

V01. No unresolved blockers revision 02

At revision 02, the specification is internally consistent and implementation-ready for the first release.

If this document is extended later, existing section codes must remain stable. Only the revision numbers of changed sections may increase.

W00. Persistence specification revision 00

W01. Primary storage backend revision 00

The editor must use IndexedDB as the required primary working-draft storage backend for revision 02 unless a functionally equivalent browser storage backend with comparable large-payload characteristics is intentionally substituted.

The persistence layer must isolate backend details behind a clear module boundary so future migration remains possible.

W02. Draft retention policy revision 00

The editor must retain more than one working-draft snapshot.

Revision 02 requires retention of at least the latest three successfully written full-document snapshots for the current document lineage, ordered by saveSequence.

The latest valid snapshot is the normal restore target. If the latest snapshot is invalid or unreadable, the editor must attempt older retained snapshots in descending saveSequence order.

Retention beyond three snapshots is allowed. Fewer than three is not allowed.

W03. Persistence availability states revision 00

The persistence subsystem must distinguish at least these states: available, degraded, and unavailable.

Available means current snapshot writes are succeeding.

Degraded means the editor can continue in memory but reliable background persistence is uncertain or partially unavailable, for example because preflight size estimates are near limits or a recent save failed.

Unavailable means the editor cannot write working-draft snapshots at all.

The UI must reflect these states through the save-state feedback channel.

W04. Preflight size policy revision 00

Before image insertion and before autosave, the persistence layer must estimate whether the next full-document snapshot is likely to remain inside the supported persistence envelope.

If the estimate indicates probable persistence failure, the editor must warn before the user loses the assumption of reliable recovery.

If the storage backend is already unavailable at application start, the application may still launch and allow editing in memory, but it must immediately state that automatic recovery is unavailable.

If storage becomes unavailable during editing, the current in-memory document remains editable. The editor must preserve that in-memory state until page unload or tab close, but it must clearly state that recent edits are no longer protected by working-draft persistence.

W05. Snapshot assembly rule revision 00

A working-draft snapshot must be assembled from one immutable in-memory document snapshot. Wrapper metadata and SVG content must describe the same document version. The implementation must not serialize SVG from one state and attach wrapper metadata from another mutation cycle.

W06. Stale write prevention revision 00

Each autosave request must receive a strictly increasing saveSequence number at scheduling time or snapshot time according to one consistent implementation rule.

When a save finishes, it may become the latest retained draft only if its saveSequence is greater than the currently committed latest saveSequence. Older completed saves must be discarded and must not overwrite newer retained drafts.

X00. Document open and replacement specification revision 00

X01. Open Document action revision 00

The application must provide an explicit Open Document action in the main toolbar.

The Open Document action accepts editor-generated SVG files only in revision 02.

Opening a document from disk replaces the current in-memory document only after required confirmation if the current document is not empty.

X02. Opened document semantics revision 00

A document opened from disk becomes the active current document. It is not the same as a recovered browser draft.

After a document is opened successfully, autosave may create working-draft snapshots for that opened document according to the standard persistence rules. The document origin marker in persisted storage must indicate that the active lineage came from an opened file rather than a newly created or recovered local draft.

X03. Unsupported SVG behavior revision 00

If the user selects an SVG file that does not match the editor metadata schema, the editor must reject it as an editable document and show a clear notice that the file is not a supported editor document.

Revision 02 does not allow flattening arbitrary SVG into a non-editable visual placeholder during Open Document. That behavior would create ambiguity and is out of scope.

X04. Replacement confirmation semantics revision 00

If the current document is not empty and the user invokes Open Document or New Document, the editor must show a confirmation dialog before replacement.

If the current document is a recovered local draft, the confirmation must explicitly mention that replacement may leave only retained snapshots for recovery and that the current active draft view will be replaced.

Y00. Hit-testing specification revision 00

Y01. General hit-testing order revision 00

Hit-testing must evaluate candidates from front to back by layer order. The first eligible candidate wins for ordinary click selection.

Modified click cycling must use the full candidate list at the pointer location, again ordered from front to back.

Y02. Minimum screen-space targets revision 00

Visible resize handles must expose at least a 10 by 10 screen-pixel hit target.

Line endpoint handles must expose at least a 10 by 10 screen-pixel hit target.

Ordinary line body hit-testing must use a minimum 8 screen-pixel corridor centered on the rendered line path, even if the visible stroke width is smaller.

These hit-target rules are measured in screen space, not document space.

Y03. Shape hit-testing semantics revision 00

Rectangles and ellipses are selectable through their full interior and stroke area regardless of whether fill is transparent.

Images are selectable through their full rectangular rendered bounds.

Text is selectable through the editor-defined text bounding box.

Lines are selectable through the defined line hit corridor and endpoint handles.

Y04. Covered object access revision 00

Covered object access is required.

The editor must not require users to rearrange layers before they can select lower objects. Alt-click or Option-click cycling at a fixed pointer location is the required mechanism in revision 02.

If the pointer location changes materially between modified clicks, the cycle context resets.

Z00. Text specification revision 00

Z01. Stored text model revision 00

A text object stores plain text content, anchor x, anchor y, font size, font weight, fill color, and any additional fixed properties required by the editor schema.

Revision 02 text objects represent one logical line only.

Z02. Wrapping and line-break rules revision 00

Automatic wrapping is not allowed.

Stored line breaks are not allowed.

If the user pastes content containing line breaks, the implementation must normalize each line break to a single space before storing the text object.

Z03. Edit-mode mapping revision 00

If the editor uses an HTML control for direct text entry, that control is an editing aid only. The committed text object must remain the canonical state. Entering and exiting text edit mode must not change the stored anchor model, layer order, or object identity.

The visual position of text after commit must match the pre-commit editing preview within the text layout tolerance defined by this specification.

Z04. Text round-trip limits revision 00

The editor guarantees stable reopen of stored text properties and anchor coordinates for editor-generated SVG.

The editor does not guarantee pixel-identical glyph rendering across operating systems or browser engines because the resolved system sans-serif font may differ. This is an accepted limitation of revision 02, not an implementation defect, provided stored properties and editing semantics remain stable.

AA00. Canvas size specification revision 00

AA01. Canvas configurability revision 00

Canvas size is configurable in revision 02.

The user must be able to change canvas width and height for the current document through explicit document-level controls.

AA02. Canvas resize semantics revision 00

Changing canvas size changes document bounds only. It does not rescale, reposition, or transform existing objects.

Existing object coordinates remain unchanged.

If the canvas is reduced, objects may end up partially or fully outside the new bounds. This is allowed. Export then uses the new canvas bounds, which may clip visible content that lies outside the canvas.

AA03. Destructive shrink confirmation revision 00

If the user reduces canvas size such that one or more existing objects would become partially or fully outside the new canvas bounds, the editor must show a confirmation warning before committing the resize.

The warning must state that export uses canvas bounds and that content outside the canvas may no longer appear in the exported result.

AA04. Canvas size UI location revision 00

Canvas size controls must appear in the document-level section of the properties panel or an equivalent document settings area directly reachable from the main editor UI.

They must not be hidden behind export-specific dialogs because canvas size is a document property, not merely an export option.

AB00. Export limits specification revision 00

AB01. Raster export preflight revision 00

Before PNG or JPEG export begins, the editor must validate at least these conditions: target width is within limit, target height is within limit, target total pixel count is within limit, and the document can be rasterized without known immediate incompatibility.

If preflight fails, export must not begin heavy rasterization work.

AB02. Export failure messaging revision 00

If raster export is blocked or fails, the error notice must report the most likely cause available to the editor. Examples include canvas too large, total pixel count too high, rasterization backend failure, or unsupported browser limitation.

Generic export failed without context is not acceptable if the implementation can determine a more specific cause.

AB03. SVG export reliability rule revision 00

SVG export is the primary durable editor file format. If PNG or JPEG export is blocked by raster limits, SVG export must remain available unless the document itself is invalid.

AC00. Recovery semantics specification revision 00

AC01. Recovery slot model revision 00

Recovery is not a single-slot model. Revision 02 requires retained snapshots as defined by the persistence specification.

The user must not lose all recoverable local state because one newer draft snapshot is corrupt or because the user created a new blank document after working on a recovered draft.

AC02. Recovery indicator meaning revision 00

Recovered draft means the current document was restored from browser-managed retained snapshots, not opened explicitly from a user-chosen file.

This indicator must remain visible long enough to be noticed. It may be dismissible, but it must not disappear immediately without user awareness.

AC03. Export versus recovery distinction revision 00

Export creates a user-visible file outside the application. Recovery snapshots are browser-managed internal working copies. Export does not disable autosave. Autosave does not replace the need for export if the user wants durable files outside browser storage.

AD00. Validation fixtures specification revision 00

AD01. Required fixture categories revision 00

The implementation test set must include at minimum these fixtures: image-heavy draft near persistence envelope, text-heavy document with multiple font sizes and colors, overlapping shapes and covered-object selection case, out-of-bounds object case, valid editor SVG reopen case, invalid editor SVG open rejection case, transparent shapes hit-testing case, and raster export near-limit case.

AD02. Required fixture outcomes revision 00

For each required fixture, the implementation must verify the applicable outcomes defined by this specification, including reopen validity, metadata preservation, object count, geometry stability, hit-testing behavior, persistence behavior, and export acceptance or rejection.

AE00. Final scope summary revision 00

AE01. Binding product summary revision 00

Revision 02 defines a focused browser-based vector image editor for quick screenshot annotation and composition. It uses SVG as the canonical editable format, supports explicit opening of editor-generated SVG from disk, uses IndexedDB-class browser storage for retained working drafts, defines precise text and hit-testing behavior, includes bounded raster export rules, and distinguishes clearly between current in-memory document, recovered working draft, and exported file.

That is the full binding specification for the first release.
