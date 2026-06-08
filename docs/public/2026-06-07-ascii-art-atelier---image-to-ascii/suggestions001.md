---

A00 Project Goal

---

Create a production-ready static website named ASCII Art Atelier.

ASCII Art Atelier is a browser-only image-to-ASCII-art converter. A user opens the page, drops or selects an image, adjusts conversion settings, sees the ASCII output update in the browser, then copies or downloads the generated text.

The project value is directness. The tool should feel like a small, precise workshop: open the page, import an image, tune the result, export the ASCII. No account, no server, no upload, no backend, no build step, no package manager requirement for runtime use.

The website should be suitable for GitHub Pages or any static file host. Opening `index.html` in a modern browser should work.

The intended user is a normal technical or creative user who wants to quickly turn an image into ASCII art. The interface should not feel like a developer demo. It should feel like a finished small web product.

---

B00 Implementation Philosophy

---

Implement this as a static, dependency-free browser application.

Use plain HTML, CSS, and JavaScript. Do not add React, Vue, Svelte, Vite, Webpack, Tailwind, Bootstrap, npm runtime packages, or any build system.

Do not minify the source. Keep the code readable.

The final app should be composed of separate production files, not one large inline HTML file. Use the mockup as visual source material, but organize the real project idiomatically.

Expected implementation style:

```txt
index.html
styles.css
app.js
src/ascii-art-converter.js
README.md
```

Additional files are allowed when useful, but avoid unnecessary structure. This is a small static website.

Codex should make practical implementation decisions when something is unclear. Prefer the simplest production-ready decision that preserves the design, keeps the UI usable, and avoids unnecessary architecture.

---

C00 Source Examples Are Read-Only

---

Codex will receive this folder structure:

```txt
D:.
|
\---source-examples
    |   design-mockup.html
    |   design-revision-2026-06-07.png
    |
    \---ascii-art-converter-release
        |   .gitignore
        |   package-lock.json
        |   package.json
        |   README.md
        |   TEST_RESULTS.md
        |
        +---docs
        |       technical-article.md
        |
        +---examples
        |       node-convert-samples.mjs
        |
        +---samples
        |   +---input
        |   |       anime-kernel-cat.jpg
        |   |       cartoon-dog-room.jpg
        |   |       formal-portrait.jpg
        |   |       green-owl-yard.png
        |   |       pixel-farmer.jpg
        |   |
        |   \---output
        |           anime-kernel-cat.jpg.txt
        |           cartoon-dog-room.jpg.txt
        |           formal-portrait.jpg.txt
        |           green-owl-yard.png.txt
        |           pixel-farmer.jpg.txt
        |
        +---src
        |       ascii-art-converter.js
        |
        \---test-results
                final-node-run.json
                final-sample-run.log
                latest-node-run.json
                node-check.txt
                source-import-check.txt
```

The `source-examples` folder is reference material only.

Do not reference files from `source-examples` in the final website.

Do not write paths such as `source-examples/design-mockup.html` or `source-examples/ascii-art-converter-release/src/ascii-art-converter.js` into production code.

Do not make the final app depend on sample images, sample outputs, test logs, package files, or documentation files from `source-examples`.

The only implementation file that must be copied into the production project is:

```txt
source-examples/ascii-art-converter-release/src/ascii-art-converter.js
```

Copy it into:

```txt
src/ascii-art-converter.js
```

After copying, import from the copied local file:

```js
import {
  ASCII_CHARSETS,
  DEFAULT_ASCII_OPTIONS,
  AsciiArtError,
  convertImageToAscii,
  copyAsciiText,
  downloadText,
  validateAsciiOptions
} from "./src/ascii-art-converter.js";
```

If the exact exported names differ in the available source file, inspect the file and use its real exports. Do not invent imports that do not exist. If the converter exposes no `validateAsciiOptions`, implement UI-side validation in `app.js` based on the converter option limits.

---

D00 Required Source Review Step

---

Before writing final files, Codex must inspect and understand these two visual/design sources:

```txt
source-examples/design-mockup.html
source-examples/design-revision-2026-06-07.png
```

Use them to recreate the selected Design A direction.

The final UI should be visually close to the mockup, but not a literal fragile copy. Turn the mockup into a proper static product page with maintainable HTML structure, reusable CSS classes, responsive behavior, and real interaction.

The design direction is:

Elegant French-inspired minimal interface.

Ivory paper-like background.

Large serif wordmark.

Small fleur-de-lis-like mark or equivalent simple decorative symbol.

Main left workspace.

Right settings sidebar.

Large upload area.

Selected image summary card.

Live ASCII preview panel.

Copy text and download TXT actions.

Local processing privacy note.

No help button.

No theme toggle.

No about button.

All UI text must be English.

---

E00 Product Behavior

---

When the user opens the page, show an empty but useful interface.

The upload area should invite the user to drop an image or click to select a file.

When the user selects or drops a valid image, the app should immediately convert it to ASCII and update the preview.

When the user changes settings, the app should update the preview in real time, but avoid excessive work. Use a small debounce or throttle for settings changes. A delay around 120 ms to 250 ms is acceptable.

The app must never upload the image anywhere. Use the selected `File` object directly in the browser.

The app should support at least:

```txt
PNG
JPG / JPEG
WEBP
```

If the copied converter supports more browser image formats, the UI may accept them only if that does not make error handling confusing. Keep the visible promise conservative.

The app should show the selected file name, image dimensions if available, and file size.

The app should show ASCII metadata after conversion:

```txt
Columns
Rows
Approximate character count
Source dimensions
```

The app should allow the user to copy generated ASCII text.

The app should allow the user to download generated ASCII text as a `.txt` file.

The app should keep a clear empty state before an image is loaded.

---

F00 Required UI Layout

---

The desktop layout should follow the selected Design A mockup.

At desktop width, use this visual structure:

```txt
+--------------------------------------------------------------+
| ASCII Art Atelier                         Processed locally note |
| Image to ASCII Art - In Your Browser                        |
+--------------------------------------------------------------+
|                                      |                       |
|  1 Import an image                   |  3 Settings           |
|  +-------------------------------+   |  Scale                |
|  | Drop your image here          |   |  Character set        |
|  +-------------------------------+   |  Brightness           |
|  selected file card                  |  Contrast             |
|                                      |  Softness / detail    |
|  2 ASCII preview                     |  Invert colors        |
|  +-------------------------------+   |  Original color mode  |
|  | ASCII output                  |   |  Output columns       |
|  |                               |   |  Live preview         |
|  +-------------------------------+   |                       |
|  Copy text      Download TXT         |                       |
+--------------------------------------------------------------+
```

The desktop grid should use CSS Grid with one flexible workspace column and one fixed/clamped settings column.

Recommended layout values:

```css
--container-max: 1320px;
--sidebar-width: clamp(320px, 30vw, 420px);
```

At medium viewport widths, stack the sidebar below the workspace.

At mobile widths, use a single-column layout. The settings panel should still be visible and usable. It does not need to become a fully functional bottom sheet in this version, but the CSS should be mobile-friendly and should not overflow horizontally.

Do not reproduce the phone preview shown in the mockup as a decorative element. The real app itself must be responsive instead.

---

G00 Header Requirements

---

The header should contain only:

```txt
ASCII Art Atelier
Image to ASCII Art - In Your Browser
Processed locally. No upload.
```

Remove the unnecessary buttons from the mockup:

```txt
No theme toggle.
No help button.
No about button.
```

Use a decorative mark near the title. A text symbol is acceptable, for example:

```txt
⚜
```

If this symbol is used, keep it decorative and mark it with `aria-hidden="true"`.

The header should not dominate mobile layout. On small screens, reduce the title size and hide or shorten the subtitle if necessary.

---

H00 Upload Area Requirements

---

The upload area must support both click-to-select and drag-and-drop.

Use a hidden file input and a styled label or button.

The dropzone should have:

```txt
Upload icon
"Drop your image here"
"or click to select a file"
"PNG, JPG, WEBP up to 10 MB"
```

Use English text only.

Add drag-over visual feedback. The dropzone should visibly change border color or background when a file is dragged over it.

When a file is selected, show a selected file card.

The selected file card should show:

```txt
Thumbnail preview if possible
File name
Image dimensions
File size
Valid status
```

If thumbnail creation fails but conversion succeeds, continue gracefully and show a generic image placeholder.

---

I00 ASCII Preview Requirements

---

The preview panel should contain a scrollable ASCII frame.

Use a `pre` element for plain text output.

Use a monospaced font stack:

```css
/* macOS, Windows, Linux, generic fallback */
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

The preview should use `white-space: pre`.

The ASCII output may be wider than the visible panel. Horizontal scrolling is acceptable and preferred over wrapping, because wrapping breaks ASCII layout.

The preview area should have a minimum height large enough to be useful:

```css
min-height: clamp(320px, 38vw, 430px);
```

On mobile, reduce the minimum height but keep the preview scrollable.

Before conversion, show a placeholder message inside the preview area:

```txt
ASCII output will appear here after you import an image.
```

After successful conversion, replace the placeholder with generated ASCII.

---

J00 Settings Controls

---

Implement these settings in the sidebar.

Use safe defaults from `DEFAULT_ASCII_OPTIONS` when possible.

The visible settings should map to the converter options as closely as possible:

```txt
Scale -> scale
Character set -> charsetPreset
Brightness -> brightness
Contrast -> contrast
Softness / detail -> detail if available, otherwise sharpness if that is the real converter option
Invert colors -> invertColors
Original color mode -> colorMode: "original" when on, "monochrome" when off
Output columns -> outputColumns
Live preview -> UI-only setting
```

Do not expose unsupported options.

Do not expose custom charset.

Do not expose custom color mode.

Character set choices should be built from `ASCII_CHARSETS`. If the converter exports presets, generate the dropdown from those exports where practical.

If some presets are visually awkward or not appropriate for a first release, keep the dropdown simple but do not invent values that the converter does not support.

Recommended visible presets:

```txt
Minimal
Simple
Standard
Detailed
Extended
Blocks
Dots
Binary
```

If `dots` uses Unicode braille-like glyphs, it is acceptable to include it. If it causes display problems, keep the preset but let the browser render it normally.

---

K00 Settings Validation

---

Validate UI values before conversion.

The validation should be simple and visible. Do not rely on browser default validation bubbles.

Show inline validation messages near the relevant control when practical.

At minimum, validate:

```txt
Selected file must exist.
Selected file must be an image.
Selected file must be PNG, JPG, JPEG, or WEBP by MIME type or extension.
Selected file should not exceed 10 MB.
Output columns should be between 40 and 240.
Scale should be within the converter-supported range.
Brightness should be within the converter-supported range.
Contrast should be within the converter-supported range.
Softness / detail should be within the converter-supported range.
```

When an invalid setting is entered through a text input, clamp it if the UI is designed to be forgiving, but still keep validation clear.

Preferred behavior:

```txt
Sliders are naturally bounded.
Text inputs are normalized on blur/change.
If a value is outside the allowed range, show a short message and do not run conversion until fixed.
```

Example validation message:

```txt
Output columns must be between 40 and 240.
```

The settings panel should have a small status line for valid output columns, similar to:

```txt
Value is valid
```

Keep validation calm and precise.

---

L00 Conversion Flow

---

Implement conversion flow in `app.js`.

Recommended state shape:

```js
const state = {
  file: null,
  objectUrl: "",
  result: null,
  isConverting: false,
  livePreview: true,
  settings: {
    scale: 8,
    charsetPreset: "standard",
    brightness: 0,
    contrast: 12,
    detail: 0,
    invertColors: false,
    colorMode: "monochrome",
    outputColumns: 120,
    renderCanvas: false
  }
};
```

Use the real converter options from the copied converter file. If `detail` is not present but `sharpness` is present, use the real supported option. Do not pass unsupported options.

For text preview, `renderCanvas` should be `false` unless the app later needs canvas output. This page only needs text preview and TXT download.

Recommended conversion call:

```js
const result = await convertImageToAscii(state.file, {
  ...state.settings,
  renderCanvas: false,
  onLogEvent(event) {
    console.debug("[ASCII Art Atelier]", event.type, event);
  }
});
```

If the converter does not support `onLogEvent`, do not pass it. Inspect the file.

After conversion:

```js
state.result = result;
asciiOutput.textContent = result.text;
columnsLabel.textContent = String(result.columns);
rowsLabel.textContent = String(result.rowCount);
charactersLabel.textContent = String(result.text.length);
```

Use a conversion sequence token to avoid race conditions. If the user changes settings quickly, older conversion results should not overwrite newer results.

Example:

```js
let conversionRunId = 0;

async function runConversion() {
  const runId = ++conversionRunId;

  try {
    setBusy(true);
    const result = await convertImageToAscii(state.file, getConverterOptions());

    if (runId !== conversionRunId) {
      return;
    }

    renderResult(result);
  } catch (error) {
    if (runId !== conversionRunId) {
      return;
    }

    renderError(error);
  } finally {
    if (runId === conversionRunId) {
      setBusy(false);
    }
  }
}
```

---

M00 Error Handling

---

Handle errors explicitly.

If the converter throws an `AsciiArtError`, show its message. If it throws a generic error, show a safe generic message and log the original error to the console.

User-facing errors should be short and actionable.

Examples:

```txt
Please select a valid image file.
This image is too large. Select an image up to 10 MB.
The image could not be decoded. Try a different PNG, JPG, or WEBP file.
The browser could not read pixels from this image.
Conversion failed. Try a smaller image or different settings.
```

Error UI should be visible but not aggressive. Use a red or warm alert block in the workspace, similar to the Design E error style or the validation styling in Design A.

Do not use `alert()`.

Do not crash the app on bad file input.

Do not leave the UI in a permanent "converting" state after an error.

---

N00 Copy And Download Behavior

---

The Copy text button should copy the generated ASCII text to the clipboard.

If no result exists, disable the button or show a short message:

```txt
Import an image before copying ASCII text.
```

Prefer using the converter's `copyAsciiText()` export if available. Otherwise use:

```js
await navigator.clipboard.writeText(state.result.text);
```

Handle clipboard failure gracefully.

The Download TXT button should download the generated ASCII text.

Preferred filename behavior:

```txt
original-file-name-ascii.txt
```

Example:

```txt
portrait-pixel-ascii.txt
```

Sanitize the filename. Remove path separators and unsafe characters.

If the converter exports `downloadText()`, use it. Otherwise create a Blob and an object URL in `app.js`.

Disable the download button until a result exists.

---

O00 CSS And Visual Implementation

---

Use the mockup CSS as inspiration, but place production styles in `styles.css`.

Use CSS variables for colors, spacing, radius, fonts, and layout widths.

Recommended variables:

```css
:root {
  --page: #f7f4ee;
  --surface: #fffdf9;
  --surface-soft: #fbf8f2;
  --surface-muted: #f3eee5;
  --line: #ded6ca;
  --line-strong: #c8bcae;
  --ink: #1f1d1a;
  --ink-soft: #58524b;
  --ink-muted: #8a8176;
  --accent: #9a7a3f;
  --success: #4d8b55;
  --danger: #b85545;
  --container-max: 1320px;
  --sidebar-width: clamp(320px, 30vw, 420px);
}
```

Use these font stacks:

```css
--font-display: Georgia, "Times New Roman", serif;
--font-ui: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
```

Do not import external fonts. No Google Fonts. No remote CSS.

The UI should work without network access.

Use modern CSS:

```txt
CSS Grid for the main layout.
Flexbox for compact rows.
clamp() for responsive sizes.
CSS variables for design tokens.
```

Avoid absolute positioning unless needed for small decorative details.

Avoid fixed pixel widths for main content except where clamped.

Make sure the app has no horizontal page overflow on mobile.

---

P00 HTML Requirements

---

`index.html` should be a complete standalone HTML document.

Include:

```txt
doctype
html lang="en"
charset utf-8
viewport
title
description meta
Open Graph meta tags
Twitter card meta tags
theme-color meta
link to styles.css
script type="module" pointing to app.js
```

Recommended title:

```txt
ASCII Art Atelier - Image to ASCII Art
```

Recommended description:

```txt
Convert images into ASCII art directly in your browser. Private, static, and client-side.
```

Recommended Open Graph content:

```html
<meta property="og:title" content="ASCII Art Atelier">
<meta property="og:description" content="Convert images into ASCII art directly in your browser. No uploads.">
<meta property="og:type" content="website">
```

Do not reference a non-existent social image unless you create one. It is acceptable to omit `og:image`.

Use accessible labels for controls.

Use real form controls for settings. Do not make sliders out of divs.

Use buttons for actions.

Use `aria-live` for conversion status and error messages.

Use semantic structure:

```txt
header
main
section
aside
form
```

---

Q00 Accessibility Requirements

---

Keyboard users must be able to:

```txt
Select a file.
Tab through settings.
Adjust sliders.
Toggle checkboxes.
Copy text.
Download TXT.
```

The dropzone should be associated with the file input.

All inputs should have labels.

Status and error messages should be visible and announced through `aria-live`.

Buttons should have disabled states when unavailable.

Color should not be the only indication of validity. Include text such as:

```txt
Value is valid
Output columns must be between 40 and 240.
```

The ASCII preview should be focusable if it scrolls:

```html
<div class="ascii-frame" tabindex="0">
```

---

R00 Responsive Behavior

---

Desktop:

Use two columns. Workspace on the left, settings on the right.

Tablet:

Stack the settings panel below the workspace when the viewport is too narrow.

Mobile:

Use one column.

The header should compress.

The selected file card should reduce thumbnail size.

The ASCII preview should remain horizontally scrollable.

Action buttons may become two equal columns.

The settings panel should remain readable, with controls not squeezed below useful width.

No mobile viewport should require horizontal scrolling of the entire page. Only the ASCII preview itself may scroll horizontally.

Recommended breakpoints:

```css
@media (max-width: 1060px) {
  /* stack main layout */
}

@media (max-width: 720px) {
  /* mobile spacing, smaller header, compact cards */
}

@media (max-width: 430px) {
  /* very small controls */
}
```

---

S00 README Requirements

---

Create `README.md`.

Keep it concise and useful.

Recommended sections:

```txt
ASCII Art Atelier
Features
How to use
Local development
Deployment
Project structure
Privacy
Credits / implementation note
```

The README should explain:

```txt
The app is fully static.
There is no build step.
Images are processed locally in the browser.
The converter code lives in src/ascii-art-converter.js.
Open index.html directly or serve the folder with a static file server.
```

Example local usage text:

```txt
Open index.html in a modern browser, or serve the folder:

python -m http.server 8080

Then open:

http://localhost:8080
```

Mention GitHub Pages deployment:

```txt
This project can be deployed as-is to GitHub Pages because it does not require a build step.
```

Do not describe Node.js sample conversion scripts from the source examples as part of this final web app. Those examples are only reference material.

---

T00 Files To Produce

---

Produce at least these final files at the repository root:

```txt
index.html
styles.css
app.js
README.md
ascii-art-converter.js
```

Optional files are acceptable only if they are clearly useful:

```txt
favicon.svg
site.webmanifest
assets/social-preview.svg
```

Do not include:

```txt
node_modules
package.json unless there is a strong reason
package-lock.json
source-examples references
sample input images
sample ASCII output files
test logs from source-examples
```

Because there is no build system, a `package.json` is not required.

If Codex creates an optional `favicon.svg`, use a simple local SVG. Do not use remote assets.

---

U00 Production Quality Checklist

---

Before finishing, Codex should verify:

```txt
index.html opens in a browser.
The design resembles Design A.
All visible text is English.
There are no Help, About, or Theme buttons.
No source-examples path is referenced in final code.
src/ascii-art-converter.js is copied locally.
The app imports from ./src/ascii-art-converter.js.
Selecting a valid image produces ASCII output.
Dragging and dropping a valid image produces ASCII output.
Changing settings updates the output.
Invalid files show a useful error.
Copy text works when a result exists.
Download TXT works when a result exists.
Buttons are disabled before a result exists.
The page is usable on mobile widths.
The page has no global horizontal overflow.
README.md describes how to use and deploy the app.
```

If running browser tests is not available, Codex should still inspect the code and reason through the flow. If any behavior cannot be verified in the environment, state that explicitly in the final response.

---

V00 Acceptance Criteria

---

The project is complete when the final static site behaves like this:

A user can open `index.html`.

The user sees a polished ASCII Art Atelier page styled after the selected Design A mockup.

The user can select or drop an image.

The image is converted locally in the browser using the copied converter module.

The ASCII preview updates when settings change.

The user can copy the ASCII text.

The user can download the ASCII text.

Bad input produces calm, clear errors.

No server, build step, dependency install, or network request is required.

The code is readable enough for a normal software engineer to maintain.

---

W00 Codex Decision Rule

---

When this specification is explicit, follow it.

When this specification and the source examples disagree, prefer this specification.

When the copied converter API differs from the examples in this specification, inspect the real converter file and adapt to its actual exports and option names.

When something is ambiguous, make the smallest reasonable production decision. Do not stop unless the ambiguity blocks implementation completely.

Do not over-engineer. This is a static production page, not a framework app.

Do not leave TODO placeholders for core behavior. Implement the upload, conversion, settings, copy, download, validation, and responsive layout.

---

X00 Final Response Expected From Codex

---

When finished, Codex should report:

```txt
Files created or modified.
Whether src/ascii-art-converter.js was copied locally.
How to run the page.
What was verified.
Any limitations or assumptions.
```

The response should be factual and concise. Do not claim browser verification if it was not actually performed.

---

Y00 Appendix A - User-Facing Error Handling

---

This appendix defines how ASCII Art Atelier should behave when something goes wrong.

The application should treat unhappy paths as normal product states, not as exceptional visual failures. A bad file, invalid setting, conversion failure, clipboard rejection, or download issue should be shown clearly, calmly, and close to the place where the user can fix it.

The user should always be able to answer these questions:

```txt
What failed?
Why did it fail?
What can I do next?
Can I copy useful details for troubleshooting?
Has the problem been resolved?
```

Do not use `alert()`.

Do not show raw stack traces in the main UI.

Do not hide errors only in the console.

Do not leave stale errors visible after the user fixes the issue.

Do not make the user guess whether the app is still converting, failed, or ready.

---

Y01 Error Placement Model

---

Use three levels of error presentation.

Level 1: inline validation near the control that caused the problem.

Use this for invalid settings. For example, if the user enters an output column value outside the allowed range, show the message directly below the output columns control.

Example:

```txt
Output columns must be between 40 and 240.
```

Level 2: operation alert in the main workspace.

Use this for file import errors, image decode errors, conversion errors, copy errors, and download errors. The alert should appear in the main workspace, directly above the ASCII preview panel. This position is preferred because it is visible after upload and before the result area.

Example layout:

```txt
+--------------------------------------------------+
| 1 Import an image                                |
| [dropzone]                                      |
| [selected file card]                            |
+--------------------------------------------------+

+--------------------------------------------------+
| ! Could not convert this image                   |
| The file was selected, but the browser could not |
| decode it as PNG, JPG, or WEBP.                 |
|                                                  |
| [Try another image] [Copy error details]         |
+--------------------------------------------------+

+--------------------------------------------------+
| 2 ASCII preview                                  |
| ASCII output will appear here after a valid      |
| image is converted.                              |
+--------------------------------------------------+
```

Level 3: preview fallback state.

If conversion fails, the ASCII preview should not show stale output from a previous successful conversion unless the UI explicitly says that the preview is stale. For the first release, use the simpler rule: clear the preview on conversion failure and replace it with a failed-state placeholder.

Example:

```txt
No ASCII output is available for the current image.
Fix the issue above or import another image.
```

---

Y02 Error Card Design

---

The main operation error card should use the same visual language as the rest of the Design A interface.

It should be calm and visible, not alarming. Use a soft warm red or muted terracotta border and background.

Recommended structure:

```html
<section class="operation-message operation-message-error" role="alert" aria-live="assertive">
  <div class="operation-message-icon" aria-hidden="true">!</div>
  <div class="operation-message-content">
    <h3>Could not convert this image</h3>
    <p>The file was selected, but the browser could not decode it as PNG, JPG, or WEBP.</p>

    <details>
      <summary>Technical details</summary>
      <pre>Error code: IMAGE_DECODE_FAILED
File: portrait.png
Size: 12.4 MB
Operation: convert-image</pre>
    </details>

    <div class="operation-message-actions">
      <button type="button">Try another image</button>
      <button type="button">Copy error details</button>
    </div>
  </div>
</section>
```

Recommended CSS direction:

```css
.operation-message {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  margin: 18px 0;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.operation-message-error {
  color: var(--ink);
  background: #fff3ef;
  border-color: #e4b5aa;
}

.operation-message-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: #fff;
  background: var(--danger);
  border-radius: 999px;
  font-weight: 700;
}

.operation-message h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.operation-message p {
  margin: 6px 0 0;
  color: var(--ink-soft);
}
```

Codex may refine the class names, but the behavior and visual hierarchy should remain.

---

Y03 Error Message Anatomy

---

Each user-facing operation error should have four parts.

The title should state the failure in plain English.

The description should explain what happened and what the user can do.

The technical details should be available behind a disclosure element.

The actions should include one practical next step and one copy-details action when useful.

Example structure:

```txt
Title:
Could not convert this image

Description:
The file was selected, but the browser could not decode it as PNG, JPG, or WEBP. Try another image or export the source image again.

Technical details:
Error code: IMAGE_DECODE_FAILED
Operation: convert-image
File: portrait.png
File type: image/png
File size: 12.4 MB
Settings: scale=8, charsetPreset=standard, outputColumns=120

Actions:
Try another image
Copy error details
```

Do not show long JavaScript stack traces in the visible card. The stack trace can be logged to the console. If copying error details includes a stack trace, place it after the human-readable summary and label it clearly.

---

Y04 Required Error Scenarios

---

Implement user-facing handling for these scenarios.

No file selected:

```txt
Title: No image selected
Message: Import an image before converting.
Action: Choose image
```

Unsupported file type:

```txt
Title: Unsupported file type
Message: Select a PNG, JPG, JPEG, or WEBP image.
Technical detail example:
Error code: UNSUPPORTED_FILE_TYPE
File: notes.txt
File type: text/plain
```

File too large:

```txt
Title: Image is too large
Message: Select an image up to 10 MB, or resize the image before importing it.
Technical detail example:
Error code: FILE_TOO_LARGE
File: large-photo.jpg
File size: 18.7 MB
Limit: 10 MB
```

Image decode failed:

```txt
Title: Could not read this image
Message: The browser could not decode the file as a supported image. Try another PNG, JPG, or WEBP file.
Technical detail example:
Error code: IMAGE_DECODE_FAILED
File: broken.webp
```

Canvas pixel read failed:

```txt
Title: Browser could not read image pixels
Message: The image loaded, but the browser could not read its pixels. Try importing the image as a local file.
Technical detail example:
Error code: CROSS_ORIGIN_PIXELS_UNREADABLE
Operation: convert-image
```

Conversion failed because output is too large:

```txt
Title: ASCII output is too large
Message: Reduce output columns, increase scale, or try a smaller image.
Technical detail example:
Error code: OUTPUT_TOO_LARGE
Output cells: 420000
Limit: 250000
```

Invalid setting:

```txt
Title: Settings need attention
Message: Fix the highlighted setting before converting.
Inline message:
Output columns must be between 40 and 240.
```

Clipboard copy failed:

```txt
Title: Could not copy ASCII text
Message: Your browser blocked clipboard access. Select the ASCII text manually or try again after focusing the page.
Technical detail example:
Error code: CLIPBOARD_UNAVAILABLE
Operation: copy-ascii-text
```

Download failed:

```txt
Title: Could not download ASCII text
Message: The browser could not create the text download. Try copying the ASCII text instead.
Technical detail example:
Error code: DOWNLOAD_FAILED
Operation: download-ascii-text
```

Unexpected error:

```txt
Title: Something went wrong
Message: Conversion failed unexpectedly. Try another image or use smaller output settings.
Technical detail example:
Error code: UNEXPECTED_ERROR
Operation: convert-image
```

---

Y05 Error Resolution Behavior

---

When the user fixes an error, the UI must make the resolution clear.

If a file validation error is shown and the user selects a valid file, remove the file error immediately after validation succeeds.

If a settings validation error is shown and the user changes the value into range, remove the inline error and restore the valid status text.

If conversion previously failed and the next conversion succeeds, remove the operation error card, restore normal metadata, enable Copy and Download actions, and replace the failed preview state with the new ASCII output.

If conversion is running after an error, show a neutral busy state such as:

```txt
Converting image...
```

Do not show the previous error and a busy state as if both are active. Either hide the previous error during retry or mark it as previous. Prefer hiding it during retry.

Recommended state transitions:

```txt
empty -> validating-file -> converting -> ready
empty -> validating-file -> file-error
ready -> settings-changed -> converting -> ready
ready -> settings-changed -> validation-error
ready -> converting -> conversion-error
conversion-error -> settings-changed -> converting -> ready
conversion-error -> file-selected -> validating-file -> converting -> ready
```

After resolution, the UI may briefly show a success message:

```txt
Conversion successful. Preview updated.
```

The success message should be low priority and dismiss itself or be replaced by normal status text. Do not require the user to close success messages.

---

Y06 Copyable Troubleshooting Details

---

Every operation error card should include a "Copy error details" button.

The copied text should be plain text, not JSON only. It should be readable when pasted into an issue, email, or chat.

Recommended format:

```txt
ASCII Art Atelier error report

Message:
Could not convert this image.

Error:
The file was selected, but the browser could not decode it as PNG, JPG, or WEBP.

Details:
Error code: IMAGE_DECODE_FAILED
Operation: convert-image
File name: portrait.png
File type: image/png
File size: 12400000 bytes
Image dimensions: unavailable
Browser: Mozilla/5.0 (...)
Timestamp: 2026-06-07T18:24:31.000Z

Settings:
scale: 8
charsetPreset: standard
brightness: 0
contrast: 12
detail: 0
invertColors: false
colorMode: monochrome
outputColumns: 120
renderCanvas: false
```

Include the file name because it helps troubleshooting. Do not include image contents, base64 data, object URLs, raw pixel data, or generated ASCII output in error details.

If copying error details fails, update the message area with a small fallback:

```txt
Could not copy error details. You can expand Technical details and copy them manually.
```

---

Y07 Error Object Normalization

---

Create a small UI-side helper that normalizes unknown errors into one predictable shape.

Recommended shape:

```js
function normalizeUiError(error, context = {}) {
  const isAsciiError = error && error.name === "AsciiArtError";

  return {
    code: isAsciiError ? error.code : "UNEXPECTED_ERROR",
    title: getErrorTitle(error, context),
    message: getErrorMessage(error, context),
    operation: context.operation || "unknown",
    details: {
      ...context,
      originalMessage: error?.message || String(error),
      converterDetails: isAsciiError ? error.details : undefined
    },
    cause: error
  };
}
```

Do not let raw thrown values leak into the UI without normalization.

The UI should render normalized errors only.

---

Y08 Error Rendering Contract

---

Implement these UI functions or equivalent functions with the same responsibilities:

```js
function showOperationError(uiError) {
  // Renders the main workspace error card.
  // Updates aria-live region.
  // Clears success status.
  // Keeps controls usable.
}

function clearOperationError() {
  // Removes the main workspace error card.
  // Clears stale aria-live error text.
}

function showFieldError(fieldName, message) {
  // Renders inline validation error under one control.
  // Sets aria-invalid="true" on the related input.
}

function clearFieldError(fieldName) {
  // Removes inline validation error.
  // Removes aria-invalid when valid.
}

function renderFailedPreview(message) {
  // Replaces stale ASCII output with a failed-state placeholder.
}

function renderReadyPreview(result) {
  // Renders generated ASCII and metadata.
  // Enables copy/download.
}
```

The exact names can differ, but the responsibilities should be explicit in the implementation.

---

Z00 Appendix B - Observability And Logging

---

This appendix defines the console logging and observability behavior for ASCII Art Atelier.

The app is static and browser-only. There is no server telemetry. Observability means clear, structured console logs that help developers and users troubleshoot local behavior.

Use console logging intentionally. Log important operation boundaries and outcomes. Do not log every slider movement character-by-character. Do not log image contents, base64 strings, object URLs, pixel buffers, generated ASCII text, or full converter result objects.

The goal is "enough to troubleshoot" without turning the browser console into noise.

---

Z01 Logging Principles

---

Use structured console logs.

Each operation log should include:

```txt
timestamp
level
operation
event
message
details
```

Use stable operation names:

```txt
app-init
file-select
file-drop
file-validate
thumbnail-render
settings-change
settings-validate
convert-image
copy-ascii-text
download-ascii-text
error-details-copy
```

Use stable event names:

```txt
start
success
failure
skip
cancel
validation-error
state-change
```

Use log levels:

```txt
debug
info
warn
error
```

Recommended console methods:

```txt
console.debug for detailed but low-priority events
console.info for user-initiated operation starts and successes
console.warn for validation problems and recoverable issues
console.error for operation failures
```

In production, keep logs enabled because this is a developer-friendly local tool and there is no server telemetry. However, the logs must remain concise.

---

Z02 Logger Helper

---

Implement a small logger helper in `app.js`.

Recommended shape:

```js
const LOG_PREFIX = "[ASCII Art Atelier]";

function logEvent(level, operation, event, message, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    operation,
    event,
    message,
    details: sanitizeLogDetails(details)
  };

  const method = level === "error"
    ? "error"
    : level === "warn"
      ? "warn"
      : level === "info"
        ? "info"
        : "debug";

  console[method](LOG_PREFIX, entry);
}
```

The logger should always sanitize details before logging.

Recommended sanitizer:

```js
function sanitizeLogDetails(details) {
  const safe = { ...details };

  delete safe.objectUrl;
  delete safe.imageData;
  delete safe.pixelData;
  delete safe.canvas;
  delete safe.asciiText;
  delete safe.result;

  return safe;
}
```

Do not log `File` objects directly. Extract safe metadata instead.

Recommended file metadata helper:

```js
function getFileLogDetails(file) {
  if (!file) {
    return { hasFile: false };
  }

  return {
    hasFile: true,
    fileName: file.name,
    fileType: file.type || "unknown",
    fileSizeBytes: file.size,
    lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null
  };
}
```

---

Z03 Conversion Operation Logging

---

Every conversion attempt should produce one start log and one terminal log.

Start log example:

```js
logEvent("info", "convert-image", "start", "Starting image conversion.", {
  ...getFileLogDetails(state.file),
  settings: getSafeSettingsForLog(),
  livePreview: state.livePreview
});
```

Success log example:

```js
logEvent("info", "convert-image", "success", "Image conversion completed.", {
  fileName: state.file?.name || null,
  sourceWidth: result.sourceWidth,
  sourceHeight: result.sourceHeight,
  columns: result.columns,
  rows: result.rowCount,
  characterCount: result.text.length
});
```

Failure log example:

```js
logEvent("error", "convert-image", "failure", "Image conversion failed.", {
  ...getFileLogDetails(state.file),
  errorCode: uiError.code,
  errorMessage: uiError.message,
  settings: getSafeSettingsForLog()
});
```

Skipped conversion example:

```js
logEvent("debug", "convert-image", "skip", "Conversion skipped because no valid file is selected.", {
  reason: "missing-file"
});
```

Race cancellation example:

```js
logEvent("debug", "convert-image", "cancel", "Ignored stale conversion result.", {
  runId,
  activeRunId: conversionRunId
});
```

Do not log `result.text`.

Do not log arrays from the converter result, such as characters, red, green, blue, or luminance.

---

Z04 File Selection And Drop Logging

---

When the user selects a file through the file picker, log the operation.

```js
logEvent("info", "file-select", "start", "User selected a file.", {
  ...getFileLogDetails(file)
});
```

When the user drops a file, log the operation.

```js
logEvent("info", "file-drop", "start", "User dropped a file.", {
  fileCount: event.dataTransfer?.files?.length || 0,
  ...getFileLogDetails(file)
});
```

When validation succeeds:

```js
logEvent("debug", "file-validate", "success", "Selected file passed validation.", {
  ...getFileLogDetails(file)
});
```

When validation fails:

```js
logEvent("warn", "file-validate", "validation-error", "Selected file failed validation.", {
  ...getFileLogDetails(file),
  errorCode: uiError.code,
  errorMessage: uiError.message
});
```

If multiple files are dropped, use the first file and log that decision.

```js
logEvent("warn", "file-drop", "skip", "Multiple files were dropped. Only the first file will be used.", {
  fileCount
});
```

---

Z05 Settings Logging

---

Settings changes should be logged, but not too aggressively.

Do not log every intermediate slider `input` event at high volume. For sliders, log only after the debounced conversion is scheduled or when the value is committed, depending on implementation.

Recommended behavior:

```txt
On input: update UI immediately.
On debounced conversion schedule: log one settings-change event.
On invalid setting: log one validation-error event.
```

Example settings change log:

```js
logEvent("debug", "settings-change", "state-change", "Conversion settings changed.", {
  changed: {
    outputColumns: 120,
    brightness: 0
  },
  settings: getSafeSettingsForLog()
});
```

Example validation failure:

```js
logEvent("warn", "settings-validate", "validation-error", "Settings validation failed.", {
  field: "outputColumns",
  value: 500,
  message: "Output columns must be between 40 and 240."
});
```

Example validation recovery:

```js
logEvent("debug", "settings-validate", "success", "Settings validation recovered.", {
  field: "outputColumns",
  value: 120
});
```

Do not log the entire DOM event.

Do not log input elements.

Do not log excessive repeated slider values.

---

Z06 Copy And Download Logging

---

When copying ASCII text starts:

```js
logEvent("info", "copy-ascii-text", "start", "Copying ASCII text to clipboard.", {
  characterCount: state.result?.text?.length || 0
});
```

When copying succeeds:

```js
logEvent("info", "copy-ascii-text", "success", "ASCII text copied to clipboard.", {
  characterCount: state.result.text.length
});
```

When copying fails:

```js
logEvent("error", "copy-ascii-text", "failure", "Could not copy ASCII text.", {
  errorCode: uiError.code,
  errorMessage: uiError.message
});
```

When TXT download starts:

```js
logEvent("info", "download-ascii-text", "start", "Preparing ASCII text download.", {
  fileName: downloadFileName,
  characterCount: state.result?.text?.length || 0
});
```

When TXT download succeeds:

```js
logEvent("info", "download-ascii-text", "success", "ASCII text download was triggered.", {
  fileName: downloadFileName,
  characterCount: state.result.text.length
});
```

When TXT download fails:

```js
logEvent("error", "download-ascii-text", "failure", "Could not download ASCII text.", {
  fileName: downloadFileName,
  errorCode: uiError.code,
  errorMessage: uiError.message
});
```

Do not log the ASCII text itself.

---

Z07 Converter `onLogEvent` Integration

---

If `src/ascii-art-converter.js` supports an `onLogEvent` option, wire it into the UI logger.

Example:

```js
const result = await convertImageToAscii(state.file, {
  ...getConverterOptions(),
  renderCanvas: false,
  onLogEvent(event) {
    logEvent("debug", "convert-image", event.type || "converter-event", "Converter event.", {
      phase: event.phase,
      message: event.message,
      details: event.details
    });
  }
});
```

If the converter does not support `onLogEvent`, do not pass it.

Do not modify the converter only to force logging unless the converter already exposes a logger option. The UI layer can provide enough operational logs around the converter call.

If converter events include large data, sanitize them before logging.

---

Z08 Safe Settings For Logs

---

Create a helper that returns only safe, relevant settings.

Recommended shape:

```js
function getSafeSettingsForLog() {
  return {
    scale: state.settings.scale,
    charsetPreset: state.settings.charsetPreset,
    brightness: state.settings.brightness,
    contrast: state.settings.contrast,
    detail: state.settings.detail,
    invertColors: state.settings.invertColors,
    colorMode: state.settings.colorMode,
    outputColumns: state.settings.outputColumns,
    renderCanvas: false
  };
}
```

If the converter uses `sharpness` instead of `detail`, log the real setting name used by the implementation.

Do not log derived image data.

Do not log generated ASCII.

---

Z09 Error Details Copy Logging

---

When the user clicks "Copy error details", log the attempt.

```js
logEvent("info", "error-details-copy", "start", "Copying error details.", {
  errorCode: currentUiError.code,
  operation: currentUiError.operation
});
```

When it succeeds:

```js
logEvent("info", "error-details-copy", "success", "Error details copied.", {
  errorCode: currentUiError.code,
  operation: currentUiError.operation
});
```

When it fails:

```js
logEvent("error", "error-details-copy", "failure", "Could not copy error details.", {
  errorCode: currentUiError.code,
  operation: currentUiError.operation,
  copyErrorMessage: error?.message || String(error)
});
```

The copied error report and the console log are related but not identical. The copied report is for humans. The console log is for operational tracing.

---

Z10 Logging During Recovery

---

When an error is cleared because the user fixed the issue, log that recovery.

Examples:

```js
logEvent("info", "file-validate", "success", "File validation recovered after previous error.", {
  previousErrorCode: previousUiError?.code,
  ...getFileLogDetails(file)
});
```

```js
logEvent("debug", "settings-validate", "success", "Settings validation recovered after previous error.", {
  field: "outputColumns",
  previousValue: 500,
  currentValue: 120
});
```

```js
logEvent("info", "convert-image", "success", "Conversion recovered after previous failure.", {
  previousErrorCode: previousUiError?.code,
  columns: result.columns,
  rows: result.rowCount,
  characterCount: result.text.length
});
```

The UI should also reflect recovery by clearing the error card and restoring the normal preview state.

---

Z11 Final Logging Checklist

---

Before finishing, Codex should verify that these operation paths produce useful console logs:

```txt
Page initialization.
File selected through file picker.
File dropped into dropzone.
Invalid file rejected.
Valid file accepted.
Image conversion started.
Image conversion succeeded.
Image conversion failed.
Settings changed.
Settings validation failed.
Settings validation recovered.
Stale conversion result ignored.
Copy ASCII text started.
Copy ASCII text succeeded or failed.
Download TXT started.
Download TXT succeeded or failed.
Error details copied or failed to copy.
```

The logs should include file metadata, selected settings, operation names, outcomes, and error codes where relevant.

The logs should not include image data, object URLs, base64 content, generated ASCII text, raw canvas objects, or full converter result objects.



