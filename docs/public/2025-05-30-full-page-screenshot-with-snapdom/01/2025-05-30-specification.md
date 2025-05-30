Date: 2025-05-30

**1. Introduction**
 This document defines the technical specification for a bookmarklet-based tool that bundles the snapdom.js library with a minimal UI. When the user clicks the bookmarklet, it opens a movable, draggable window containing:

1. An automatically generated ISO-8601 date header.
2. A rich-text editor (contentEditable) pre-populated with that date, the current page’s URL, and its domain in curly braces.
3. A blockquote into which a screenshot of the visible viewport is inserted.
4. Controls to crop the screenshot, apply image filters (including 16-color dithering), and copy the composed rich text to the clipboard.

**2. High-Level Workflow**

1. User clicks the bookmarklet.
2. The bundled script loads snapdom.capture and UI code.
3. A floating window is injected into the page.
4. The editor area is pre-filled with:
   1. Current date in YYYY-MM-DD format.
   2. The page’s URL as a rich hyperlink.
   3. The page’s domain in curly braces.
5. snapdom.capture is invoked on document.documentElement (clamped to viewport).
6. The resulting image URL is inserted as an `<img>` inside a `<blockquote>`.
7. The controls panel offers: crop, filter buttons, copy content, close window.
8. User applies optional edits then clicks “Copy Content” to copy the editor’s innerHTML.

**3. Detailed Component Specification**

3.1 Bundling

1. Produce a single ES module (snapdom.bookmarklet.js) containing:
   1. Entire snapdom.js source.
   2. UI code.
2. Wrap in an IIFE that exports a global `__SnapdomBookmarklet__` initializer.

3.2 Bookmarklet Loader

1. `javascript:(function(){…})();` snippet that:
   1. Injects a `<script>` tag with src pointing to the bundled file.
   2. On load, calls `__SnapdomBookmarklet__.init()`.

3.3 API Functions

```javascript
/**
  -- Initialize the bookmarklet UI and event handlers
  -- @returns {void}
**/
function init() { … }

/**
  -- Opens the floating editor window
  -- @returns {HTMLElement} reference to window container
**/
function openEditorWindow() { … }

/**
  -- Captures viewport screenshot and inserts into editor
  -- @param {HTMLElement} editorDiv
  -- @returns {Promise<void>}
**/
async function captureAndInsert(editorDiv) { … }

/**
  -- Applies image filter to the screenshot
  -- @param {HTMLImageElement} img
  -- @param {string} filterName ("dither" | "grayscale" | etc)
  -- @returns {void}
**/
function applyFilter(img, filterName) { … }

/**
  -- Enables cropping of the screenshot
  -- @param {HTMLImageElement} img
  -- @returns {void}
**/
function enableCrop(img) { … }

/**
  -- Copies the editor’s content to clipboard
  -- @param {HTMLElement} editorDiv
  -- @returns {Promise<void>}
**/
async function copyContent(editorDiv) { … }
```

3.4 UI Structure

1. Container DIV with fixed positioning, draggable via title bar.
2. Title bar: shows “Save Link Snapshot”, close button.
3. Two-column layout:
   1. Left pane: contentEditable DIV, prefilled template.
   2. Right pane: button panel (Capture, Crop, Dither, Copy, Close).

3.5 Editor Prefill Template

```html
<div data-snapdom-editor>
  <p>2025-05-30</p>
  <p><a href="https://current.page.url">https://current.page.url</a> {current.domain.com}</p>
  <blockquote></blockquote>
</div>
```

3.6 Screenshot Capture

1. Call `snapdom.capture(document.documentElement, {scale:1})`.
2. Convert returned dataURL into an `<img>` of width=viewportWidth.
3. Insert into the `<blockquote>` element.

3.7 Image Cropping

1. Overlay transparent crop rectangle on the `<img>`.
2. On drag handles, adjust selection.
3. On confirm, draw cropped portion onto a `<canvas>`, replace `<img>`’s src.

3.8 Image Filtering

1. Provide buttons: “Dither”.
2. On click, draw image onto offscreen `<canvas>`.
3. Apply 16-color dithering algorithm.
4. Set `<img>` src to resulting dataURL.

3.9 Copy to Clipboard

1. Use `navigator.clipboard.write()` with ClipboardItem of type “text/html”.
2. Content = `editorDiv.innerHTML`.

**4. User Stories and Examples**

4.1 Story 1: Quick Snapshot

1. Given the user is on any webpage.
2. When they click the bookmarklet.
3. Then a window appears, pre-populated with today’s date, the page URL as a link, the domain in braces, and an empty blockquote.
4. And the captured screenshot is inserted below.
5. And the user clicks “Copy Content”.
6. Then the rich HTML is on their clipboard, ready to paste.

4.2 Story 2: Cropping and Dithering

1. Given the editor window is open with a screenshot.
2. When the user clicks “Crop” and selects a region.
3. And then clicks “Dither”.
4. Then the image in the blockquote is cropped and has 16-color dithering applied.
5. And “Copy Content” copies the updated HTML.

**5. Example HTML Output**

```html
<p>2025-05-30</p>
<p><a href="https://example.com/page">https://example.com/page</a> {example.com}</p>
<blockquote>
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA…">
</blockquote>
```

**6. Implementation Notes**

1. All DOM mutations must be namespaced under a unique container ID to avoid conflicts.
2. Ensure the floating window’s z-index is very high.
3. Bundle size should stay under 200 KB; consider tree-shaking unused snapdom exports.
4. The cropping and filtering code may reuse a shared `<canvas>` element.
5. Testing across major browsers required, especially Safari’s handling of toDataURL.





