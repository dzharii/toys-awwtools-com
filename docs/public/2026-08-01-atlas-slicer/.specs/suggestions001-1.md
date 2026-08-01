# Grid and Sprite Atlas Helper: Developer Implementation Specification
2026-08-01

/c/6a6da4a8-0058-83e8-819c-1befc4d8fed0

---

A00 Product Value and Problem Definition

---

The Grid and Sprite Atlas Helper is a static browser application for designing pixel-accurate image grids and using those grids to slice sprite atlases.

The application solves two closely related problems.

The first problem is grid creation. A user knows some combination of canvas dimensions, cell dimensions, cell counts, separator widths, outer-border requirements, colors, and background requirements. The application converts those values into a precise raster grid that can be inspected, adjusted, saved as a preset, shared through a URL, and exported as a PNG.

The second problem is atlas slicing. A user provides an existing image containing regularly arranged sprites. The application applies the same grid model to that image, previews the detected slices, identifies incomplete cells, and exports the extracted sprites individually or together in a ZIP archive.

The application must reduce manual arithmetic. Users should not need to calculate whether a 12-pixel cell plus a 1-pixel separator fits into a 100-pixel image, determine which edge contains a truncated cell, or manually calculate every sprite rectangle. The application performs those calculations continuously and explains the result.

The application must also reduce ambiguity. Terms such as cell size, separator, outer border, offset, cell count, and canvas size must have one consistent meaning throughout the UI, preset schema, URL format, rendering code, and slicing code.

The primary user value is not merely drawing lines. The application provides a reusable, inspectable definition of a grid. That definition can be used to:

1. Generate a reference grid for another graphics application.
2. Verify whether a proposed atlas layout fits a target image size.
3. Reproduce the same grid later without manually entering values.
4. Share a grid configuration through a URL or JSON file.
5. Apply a grid definition to an existing atlas.
6. Export individual sprites using predictable coordinates and names.
7. Detect incomplete or unused image areas before the atlas is integrated into another system.
8. Move between grid design and atlas slicing without redefining the layout.

The application is intentionally local and static. It requires no server, account, database, build process, or network connection after the files have been downloaded.

---

B00 Scope

---

The application shall contain two primary modes presented as top-level tabs:

| Mode         | Purpose                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| Grid Creator | Generate and export a raster grid image.                                           |
| Atlas Slicer | Load an image, overlay a grid, preview slice boundaries, and export sprite images. |

Both modes shall use one shared grid definition model.

The application shall support:

| Capability                      | Grid Creator |                   Atlas Slicer |
| ------------------------------- | -----------: | -----------------------------: |
| Canvas width and height         |          Yes |  Derived from image by default |
| Cell width and height           |          Yes |                            Yes |
| Requested row and column count  |          Yes |                            Yes |
| Separator width and height      |          Yes |                            Yes |
| Outer border                    |          Yes |                            Yes |
| Grid origin offset              |          Yes |                            Yes |
| Grid line color                 |          Yes |                   Preview only |
| Grid line opacity               |          Yes |                   Preview only |
| Solid or transparent background |          Yes | Not applicable to source image |
| Pan and zoom                    |          Yes |                            Yes |
| Fit-to-view                     |          Yes |                            Yes |
| Presets                         |          Yes |                            Yes |
| URL serialization               |          Yes |                            Yes |
| JSON import and export          |          Yes |                            Yes |
| PNG export                      |          Yes |             Individual sprites |
| ZIP export                      | Not required |                            Yes |
| Layout recommendations          |          Yes |                            Yes |
| Truncation diagnostics          |          Yes |                            Yes |

The first release shall not include:

| Excluded capability                      | Reason                                               |
| ---------------------------------------- | ---------------------------------------------------- |
| Server-side storage                      | The application is local and static.                 |
| User accounts                            | No server-side identity is required.                 |
| Cloud synchronization                    | Outside the project scope.                           |
| Automatic content-aware sprite detection | The grid is explicitly defined by the user.          |
| Irregular polygonal slicing              | Slices are rectangular.                              |
| Arbitrary per-cell dimensions            | One regular cell size is used for a grid region.     |
| Image editing tools                      | The application is not a raster editor.              |
| Automated unit-test infrastructure       | Not requested for this project.                      |
| Build or bundling pipeline               | The application must run directly from static files. |

---

C00 Runtime and Project Structure

---

The application shall use HTML, CSS, and native modern JavaScript modules.

No package manager, transpiler, bundler, framework, or compilation step shall be required.

Recommended directory structure:

```text
grid-atlas-helper/
  index.html
  src/
    main.js
    app.js
    state/
      app-state.js
      defaults.js
      schema.js
      migrations.js
    grid/
      grid-math.js
      grid-renderer.js
      grid-recommendations.js
      grid-validation.js
    atlas/
      image-loader.js
      atlas-slicer.js
      sprite-exporter.js
      sprite-naming.js
    persistence/
      local-storage.js
      preset-service.js
      url-state.js
      json-transfer.js
    viewport/
      viewport-controller.js
      pointer-controller.js
    ui/
      bindings.js
      controls.js
      dialogs.js
      notifications.js
      status-panel.js
    export/
      png-export.js
      zip-export.js
    utils/
      debounce.js
      numbers.js
      colors.js
      files.js
  styles/
    main.css
    controls.css
    workspace.css
    dialogs.css
  vendor/
    jszip-3.10.1.js
```

The application entry point shall use:

```html
<body>
  <div id="app"></div>

  <script src="./vendor/jszip-3.10.1.js"></script>
  <script type="module" src="./src/main.js"></script>
</body>
```

The supplied `jszip-3.10.1.js` file is a UMD browser build. In a browser it creates `window.JSZip`. It is not a native ES module and should not be loaded using an `import` statement directly.

The classic script must appear before the module entry script. Classic scripts without `async` or `defer` execute before the following module script is evaluated.

The ZIP adapter may isolate access to the global dependency:

```js
export function createZipArchive() {
  if (typeof window.JSZip !== "function") {
    throw new Error(
      "JSZip is unavailable. Ensure vendor/jszip-3.10.1.js is loaded before main.js."
    );
  }

  return new window.JSZip();
}
```

This isolates the global dependency and prevents direct references to `window.JSZip` throughout the application.

The application should normally be served from a local static server rather than opened through a `file:` URL. Native module loading is restricted under `file:` URLs in common browsers.

Example local commands include:

```bash
python3 -m http.server 8080
```

or:

```bash
npx serve .
```

The application itself must not depend on either command. They are development and local-hosting options only.

---

D00 Terminology

---

The following terms are normative.

| Term             | Definition                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Canvas           | The complete output image area measured in pixels.                                                                     |
| Cell             | The usable rectangular image area belonging to one grid item or sprite. Separators and borders are not part of a cell. |
| Cell width       | Number of usable horizontal pixels inside one cell.                                                                    |
| Cell height      | Number of usable vertical pixels inside one cell.                                                                      |
| Column           | One vertical sequence of cells.                                                                                        |
| Row              | One horizontal sequence of cells.                                                                                      |
| Separator        | Pixel space between adjacent cells. A rendered separator normally contains the visible grid line.                      |
| Separator width  | Horizontal pixel distance between adjacent cell rectangles.                                                            |
| Separator height | Vertical pixel distance between adjacent cell rectangles.                                                              |
| Outer border     | Reserved pixels around the outside of the grid region.                                                                 |
| Grid origin      | Top-left coordinate at which the outer grid region begins.                                                             |
| Content origin   | Top-left coordinate of the first cell after accounting for the outer border.                                           |
| Grid region      | The rectangle occupied by cells, separators, and optional outer borders.                                               |
| Remainder        | Unused pixels remaining after complete cells are laid out.                                                             |
| Truncated cell   | A potential next cell that intersects the available area but does not have its complete requested dimensions.          |
| Complete cell    | A cell whose entire pixel rectangle lies inside the available image area.                                              |
| Fit              | A layout in which all requested complete cells fit in the available region.                                            |
| Exact fit        | A fit with zero unused pixels after the final cell or outer border.                                                    |
| Preview scale    | A display-only scale applied to the canvas in the workspace.                                                           |
| Export scale     | The actual pixel dimensions of an exported image. Preview scale never changes export scale.                            |
| Atlas            | A source image containing multiple sprites arranged in a regular grid.                                                 |
| Slice            | One rectangular image extracted from an atlas cell.                                                                    |
| Preset           | A versioned, serializable collection of supported application parameters.                                              |

The UI must use the term separator rather than line width when discussing layout arithmetic. A visible line may occupy a separator, but the separator is the spacing that affects cell coordinates.

A cell size of `10 x 10` always means exactly 10 usable pixels by 10 usable pixels. Separator pixels and outer-border pixels never reduce that cell size.

---

E00 Coordinate System and Pixel Semantics

---

All geometry shall use zero-based image coordinates.

For an image with width `100` and height `100`:

```text
Valid x coordinates: 0 through 99
Valid y coordinates: 0 through 99
```

A rectangle is represented as:

```js
{
  x,
  y,
  width,
  height
}
```

The rectangle includes pixels:

```text
x through x + width - 1
y through y + height - 1
```

It excludes:

```text
x + width
y + height
```

This is equivalent to a half-open range:

```text
[x, x + width)
[y, y + height)
```

For a cell beginning at `x = 0` with `width = 10`, the cell contains pixels `0` through `9`. The next coordinate is `10`.

When the separator width is `1`, coordinate `10` belongs to the separator. The next cell begins at coordinate `11`.

Example:

```text
Cell 0:      x = 0 through 9
Separator:  x = 10
Cell 1:      x = 11 through 20
Separator:  x = 21
Cell 2:      x = 22 through 31
```

When an outer border of `1` pixel is enabled:

```text
Outer border: x = 0
Cell 0:       x = 1 through 10
Separator:    x = 11
Cell 1:       x = 12 through 21
```

The same rules apply independently on the y-axis.

All internal calculations shall use integer pixel values. Decimal cell dimensions, separator dimensions, offsets, counts, and output image dimensions are invalid.

Preview zoom may be fractional because it is a display transform rather than image geometry.

---

F00 Shared Grid Data Model

---

The current grid definition shall use descriptive property names.

Recommended schema:

```js
const gridDefinition = {
  schemaVersion: 1,

  canvas: {
    widthPixels: 100,
    heightPixels: 100
  },

  gridOrigin: {
    xPixels: 0,
    yPixels: 0
  },

  cell: {
    widthPixels: 10,
    heightPixels: 10
  },

  count: {
    columnMode: "automatic",
    rowMode: "automatic",
    requestedColumns: 10,
    requestedRows: 10
  },

  separator: {
    widthPixels: 1,
    heightPixels: 1
  },

  outerBorder: {
    enabled: false,
    leftPixels: 0,
    topPixels: 0,
    rightPixels: 0,
    bottomPixels: 0
  },

  gridAppearance: {
    lineColor: "#000000",
    lineOpacity: 1,
    lineStyle: "solid"
  },

  background: {
    mode: "transparent",
    color: "#ffffff",
    opacity: 1
  },

  rendering: {
    pixelSnapping: true
  },

  atlas: {
    traversalOrder: "row-major",
    incompleteCellPolicy: "skip",
    emptyCellPolicy: "include",
    outputImageFormat: "png",
    outputScale: 1
  },

  naming: {
    prefix: "sprite",
    startIndex: 1,
    minimumIndexDigits: 3,
    rowStartIndex: 0,
    columnStartIndex: 0,
    template: "{prefix}_{index}",
    extensionMode: "automatic"
  }
};
```

The model shall keep layout configuration separate from viewport state.

Viewport state is session state and shall not be treated as part of the reusable grid definition by default:

```js
const viewportState = {
  zoomPercent: 100,
  panXCssPixels: 0,
  panYCssPixels: 0,
  fitMode: "manual"
};
```

The loaded atlas image itself shall never be serialized into local storage, a URL, or a normal preset. The image may be too large, may contain private material, and cannot be reliably reconstructed from a URL parameter.

A preset may contain the original image filename as optional informational metadata, but loading the preset must not imply that the image can be restored.

---

G00 Layout Modes

---

Each axis shall support two ways to define the layout.

| Mode            | User controls                                                        | System calculates                         |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| Automatic count | Canvas size, cell size, separators, borders, origin                  | Maximum complete cell count and remainder |
| Fixed count     | Canvas size, requested count, cell size, separators, borders, origin | Used region, overflow, or unused area     |

A later enhancement may introduce a third mode in which the user locks the cell count and asks the system to calculate a fitting cell size. The initial implementation can provide this through recommendations rather than through a permanent axis mode.

The width and height axes shall be calculated independently. A layout can fit horizontally but truncate vertically.

The UI shall clearly identify which fields are authoritative. For example, when column mode is automatic, the requested-column field should be disabled or visually marked as calculated. When column mode is fixed, the requested-column field becomes editable.

The application must not silently modify authoritative user input merely to obtain a fit. It may calculate alternatives and offer an Apply action.

---

H00 Core Grid Formulas

---

For each axis, define:

```text
C = canvas dimension
O = grid origin offset
B1 = leading outer-border width
B2 = trailing outer-border width
S = separator width
D = cell dimension
N = number of complete cells
```

For the horizontal axis:

```text
C = canvas width
O = grid origin x
B1 = left border
B2 = right border
S = separator width
D = cell width
N = column count
```

For the vertical axis:

```text
C = canvas height
O = grid origin y
B1 = top border
B2 = bottom border
S = separator height
D = cell height
N = row count
```

The available dimension after the origin and outer borders is:

```text
A = C - O - B1 - B2
```

When `N >= 1`, the dimension required for `N` complete cells is:

```text
requiredDimension(N) = B1 + (N * D) + ((N - 1) * S) + B2
```

When the grid origin is included:

```text
requiredCanvasDimension(N) =
  O + B1 + (N * D) + ((N - 1) * S) + B2
```

The maximum number of complete cells that can fit is:

```text
N = floor((A + S) / (D + S))
```

This formula works because the final cell does not require a trailing separator.

The used dimension for the calculated cells is:

```text
usedDimension =
  O + B1 + (N * D) + (max(0, N - 1) * S) + B2
```

The remaining space after the grid is:

```text
remainder = C - usedDimension
```

A positive remainder means unused canvas space remains after the complete grid.

A zero remainder means the layout is an exact fit.

A negative remainder means the fixed requested layout overflows the canvas.

The cell stride is:

```text
horizontalStride = cellWidth + separatorWidth
verticalStride = cellHeight + separatorHeight
```

The top-left coordinate of a cell at zero-based column `c` and row `r` is:

```text
cellX(c) = originX + leftBorder + c * horizontalStride
cellY(r) = originY + topBorder + r * verticalStride
```

The complete cell rectangle is:

```js
{
  x: cellX(column),
  y: cellY(row),
  width: cellWidth,
  height: cellHeight
}
```

The rectangle is valid when:

```text
x >= 0
y >= 0
x + width <= canvasWidth
y + height <= canvasHeight
```

For atlas slicing, only valid complete rectangles may be exported under the default incomplete-cell policy.

---

I00 Exact-Fit Examples

---

Example 1: borderless 100-pixel image, 10-pixel cells, no separators.

Input:

```text
Canvas width: 100
Origin x: 0
Left border: 0
Right border: 0
Cell width: 10
Separator width: 0
```

Calculation:

```text
A = 100 - 0 - 0 - 0 = 100
N = floor((100 + 0) / (10 + 0)) = 10
used = 0 + 0 + 10 * 10 + 9 * 0 + 0 = 100
remainder = 100 - 100 = 0
```

Result:

```text
10 complete columns
No unused pixels
No truncation
Exact fit
```

Example 2: borderless 100-pixel image, 10-pixel cells, 1-pixel separators.

Input:

```text
Canvas width: 100
Cell width: 10
Separator width: 1
```

Calculation:

```text
N = floor((100 + 1) / (10 + 1))
N = floor(101 / 11)
N = 9

used = 9 * 10 + 8 * 1
used = 98

remainder = 100 - 98
remainder = 2
```

Result:

```text
9 complete columns
2 unused pixels on the right
A tenth cell does not fit
```

Cell coordinates:

```text
Column 0: x = 0 through 9
Column 1: x = 11 through 20
Column 2: x = 22 through 31
...
Column 8: x = 88 through 97
Unused:   x = 98 through 99
```

Example 3: 1-pixel outer border, 10-pixel cells, 1-pixel separators, 100-pixel image.

Input:

```text
Canvas width: 100
Left border: 1
Right border: 1
Cell width: 10
Separator width: 1
```

Calculation:

```text
A = 100 - 1 - 1 = 98
N = floor((98 + 1) / 11)
N = 9

used = 1 + 9 * 10 + 8 * 1 + 1
used = 100

remainder = 0
```

Result:

```text
9 complete columns
Exact fit
```

Coordinates:

```text
Left border: x = 0
Column 0:    x = 1 through 10
Separator:   x = 11
Column 1:    x = 12 through 21
...
Column 8:    x = 89 through 98
Right border:x = 99
```

Example 4: asymmetric border.

Input:

```text
Canvas width: 128
Origin x: 4
Left border: 2
Right border: 6
Cell width: 16
Separator width: 2
```

Calculation:

```text
A = 128 - 4 - 2 - 6
A = 116

N = floor((116 + 2) / (16 + 2))
N = floor(118 / 18)
N = 6

used = 4 + 2 + 6 * 16 + 5 * 2 + 6
used = 118

remainder = 128 - 118
remainder = 10
```

The grid contains six complete columns and leaves 10 unused pixels after the right border.

---

J00 Truncation Semantics

---

A truncated cell exists when some pixels are available for a potential next cell, but fewer than the requested cell dimension are available.

For one axis, calculate the coordinate at which the next cell would begin:

```text
nextCellStart =
  O + B1 + N * D + N * S
```

The number of pixels available for the next cell before the trailing border is:

```text
partialCellPixels =
  C - B2 - nextCellStart
```

Interpretation:

```text
partialCellPixels <= 0:
No partial next cell exists.

0 < partialCellPixels < D:
A next cell is truncated.

partialCellPixels >= D:
The complete-cell calculation is inconsistent and must be treated as an implementation defect.
```

Example:

```text
Canvas width: 100
Cell width: 12
Separator width: 1
No outer border
```

Calculation:

```text
N = floor((100 + 1) / (12 + 1))
N = floor(101 / 13)
N = 7

used = 7 * 12 + 6 * 1
used = 90

next cell start = 7 * 12 + 7 * 1
next cell start = 91

partial cell pixels = 100 - 91
partial cell pixels = 9
```

Result:

```text
7 complete columns
1 potential truncated column containing 9 of 12 required pixels
3 cell pixels are missing
```

The separator after the seventh complete cell occupies coordinate `90`. The truncated eighth cell would begin at `91` and extend through `99`.

The application must distinguish unused space from a truncated cell.

If the remaining pixels are located before the next cell start or are intentionally outside a fixed-count grid, they are unused space.

If the next cell has started and only part of its required area is present, it is truncated.

In fixed-count mode, overflow is more direct:

```text
overflow = requiredCanvasDimension(requestedCount) - C
```

When overflow is positive, the requested layout cannot fit.

Example:

```text
Canvas width: 100
Requested columns: 8
Cell width: 12
Separator width: 1
```

Calculation:

```text
required = 8 * 12 + 7 * 1
required = 103

overflow = 103 - 100
overflow = 3
```

The eighth cell is short by three pixels.

---

K00 Outer Border and Separator Rendering

---

The outer border and separators shall be treated as reserved raster regions rather than as vector strokes centered on a path.

This avoids half-pixel positioning, anti-aliasing, and ambiguous ownership of line pixels.

For a one-pixel separator, the application shall fill exactly one integer pixel column or row.

For a two-pixel separator, it shall fill exactly two integer pixel columns or rows.

The default grid line rendering shall therefore use `fillRect`, not `stroke`.

Example vertical separator:

```js
context.fillRect(separatorX, gridTop, separatorWidth, gridHeight);
```

Example horizontal separator:

```js
context.fillRect(gridLeft, separatorY, gridWidth, separatorHeight);
```

The outer border shall be rendered by filling the reserved outer-border rectangles.

Supported line styles shall be:

| Style  | Required behavior                                                         |
| ------ | ------------------------------------------------------------------------- |
| Solid  | Fill every separator and border pixel.                                    |
| Dashed | Render repeated opaque and transparent segments along the line direction. |
| Dotted | Render repeated compact segments with gaps.                               |

Solid is the default and should be the primary supported style.

Dashed and dotted lines introduce additional decisions for phase, segment length, and intersections. Their behavior must be deterministic.

Recommended defaults:

```text
Dashed segment length = max(2, separator thickness * 4)
Dashed gap length = segment length
Dotted segment length = max(1, separator thickness)
Dotted gap length = max(1, separator thickness * 2)
Pattern phase begins at grid origin.
```

At intersections, a pixel shall be drawn when either the horizontal or vertical line pattern marks it as visible.

Transparent pixels in a dashed or dotted line remain background pixels. In atlas mode, they reveal the source image.

The renderer shall disable image smoothing:

```js
context.imageSmoothingEnabled = false;
```

Export rendering must not depend on CSS dimensions, device pixel ratio, viewport zoom, or browser display scaling.

---

L00 Background Model

---

Grid Creator shall support two background modes.

| Mode        | Behavior                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| Transparent | The output canvas is cleared to transparent before grid rendering.            |
| Solid       | The output canvas is filled with the configured background color and opacity. |

The default shall be transparent.

The background UI shall contain:

```text
Background mode
Background color
Background opacity
```

The color and opacity controls may remain visible in transparent mode but shall be disabled or visually inactive.

The UI must display the exact normalized color value. A color picker alone is insufficient.

Recommended presentation:

```text
[Color picker] [#RRGGBB] [Opacity percentage]
```

The application shall accept:

```text
#RGB
#RRGGBB
```

It shall normalize stored and displayed values to uppercase or lowercase consistently. Recommended canonical form:

```text
#rrggbb
```

The alpha value shall be stored separately as a number from `0` through `1`.

Transparent PNG export shall preserve alpha.

The PNG export path must not temporarily composite the result against the workspace background. The checkerboard shown in the preview is a UI visualization only and must not be part of the exported image.

---

M00 Application Layout and UX Structure

---

The recommended desktop layout is:

```text
+-----------------------------------------------------------+
| Application title | Grid Creator | Atlas Slicer | Presets |
+--------------------+--------------------------------------+
|                    |                                      |
| Settings panel     | Preview workspace                    |
|                    |                                      |
| Canvas             | Canvas or atlas                      |
| Grid geometry      | Pan and zoom                         |
| Appearance         | Selection overlay                    |
| Recommendations    |                                      |
| Export             |                                      |
|                    |                                      |
+--------------------+--------------------------------------+
| Status summary | Coordinates | Zoom | Fit or warning      |
+-----------------------------------------------------------+
```

The settings panel should normally be on the left. A right-side settings panel is also acceptable, but the location must remain consistent between modes.

The primary preview shall receive more screen space than the controls.

The settings panel shall be scrollable independently from the preview workspace.

The preview workspace shall not force the entire browser page to scroll when a large image is loaded. It shall be a bounded region with overflow hidden and custom pan and zoom behavior.

The two tabs shall preserve mode-specific state while sharing grid configuration.

Switching from Atlas Slicer to Grid Creator shall retain the active grid dimensions, separators, borders, offsets, counts, and line appearance. The Grid Creator canvas dimensions may optionally be synchronized to the loaded atlas dimensions through an explicit action:

```text
Use atlas dimensions
```

The application must not silently replace Grid Creator dimensions merely because an atlas is loaded.

The primary controls shall be grouped as:

```text
Canvas or Source
Grid Geometry
Borders and Separators
Appearance
Layout Result
Recommendations
Presets and Sharing
Export
```

Advanced controls such as asymmetric borders, nonzero grid origin, naming templates, and incomplete-cell policies may be collapsed initially, provided their current values remain visible in the layout summary.

---

N00 Input Control Behavior

---

Numeric geometry fields shall use a combination of direct numeric input and increment controls.

For frequently adjusted values, a range slider may also be provided. Where both a slider and numeric field exist, they are two views of the same state value.

The bindings shall be state-driven:

```text
User control change
-> normalize candidate value
-> validate candidate value
-> update application state
-> recompute derived layout
-> update every bound control
-> update diagnostics
-> schedule preview rendering
-> update URL according to URL policy
```

Controls shall not update each other directly. All updates must pass through the central state.

This avoids circular event handlers and inconsistent values.

For example, cell width may be represented by:

```text
Range slider
Number input
Derived layout summary
Preview
URL state
Current preset dirty state
```

All five are synchronized from one state value.

Range sliders should use practical interactive limits, while numeric fields may accept larger values.

Example:

```text
Cell width slider: 1 through 512
Cell width numeric input: 1 through canvas maximum
```

When a numeric value exceeds the slider maximum, the numeric value remains valid. The slider should clamp its visual thumb to its maximum and display an out-of-range indicator, or its maximum should expand to include the current value.

The application must not silently reduce a valid numeric input merely because a slider has a narrower range.

Recommended step sizes:

| Property                |                                                Step |
| ----------------------- | --------------------------------------------------: |
| Canvas width and height |                                             1 pixel |
| Cell width and height   |                                             1 pixel |
| Separator dimensions    |                                             1 pixel |
| Border dimensions       |                                             1 pixel |
| Origin offsets          |                                             1 pixel |
| Row and column counts   |                                                   1 |
| Opacity                 |                                           1 percent |
| Zoom                    | 5 percent through buttons, continuous through wheel |

Mouse wheel over a numeric field must not change the value unless the field is focused and the application deliberately supports that behavior. Accidental geometry changes while scrolling the panel should be prevented.

---

O00 Validation and Normalization

---

Geometry values shall follow these constraints:

| Property          | Minimum |                     Maximum |
| ----------------- | ------: | --------------------------: |
| Canvas width      |       1 | Implementation safety limit |
| Canvas height     |       1 | Implementation safety limit |
| Cell width        |       1 | Implementation safety limit |
| Cell height       |       1 | Implementation safety limit |
| Separator width   |       0 | Implementation safety limit |
| Separator height  |       0 | Implementation safety limit |
| Border values     |       0 | Implementation safety limit |
| Origin values     |       0 |            Canvas dimension |
| Requested columns |       1 | Implementation safety limit |
| Requested rows    |       1 | Implementation safety limit |

An empty numeric field is an incomplete edit, not immediately the number zero.

While the user is typing, the application should preserve the edit string. State should be committed when:

```text
The value becomes parseable and valid.
The field loses focus.
The user presses Enter.
```

When focus leaves an invalid field, the application shall restore the last valid value and show a concise inline explanation.

Examples of invalid input:

```text
Blank canvas width
Cell width of 0
Negative separator
Decimal row count
Non-numeric text
Origin outside the canvas
```

A valid but impractical value must not be labeled invalid merely because it produces a warning.

Example:

```text
Canvas width: 100
Cell width: 1000
```

This configuration is mathematically valid but produces zero complete cells. It should generate a warning and recommendations rather than an input error.

The implementation shall define a canvas safety limit based on both dimensions and total pixel count.

Recommended initial limits:

```text
Maximum dimension: 16384 pixels
Recommended maximum pixel count: 67,108,864 pixels
Hard maximum pixel count: determined through capability probing
```

The pixel-count calculation is:

```text
pixelCount = width * height
estimatedRGBABytes = pixelCount * 4
```

A `4000 x 2000` canvas contains:

```text
8,000,000 pixels
Approximately 32,000,000 raw RGBA bytes
```

Additional memory is needed during PNG encoding, atlas extraction, ZIP generation, and browser canvas management.

The application must catch allocation and encoding failures and report them without losing the current configuration.

---

P00 Derived Layout Result

---

The application shall continuously calculate a layout result object.

Recommended shape:

```js
const layoutResult = {
  horizontal: {
    availablePixels: 100,
    completeCellCount: 9,
    requestedCellCount: null,
    usedPixels: 98,
    remainderPixels: 2,
    overflowPixels: 0,
    partialCellPixels: 0,
    missingPartialCellPixels: 0,
    exactFit: false
  },

  vertical: {
    availablePixels: 100,
    completeCellCount: 9,
    requestedCellCount: null,
    usedPixels: 98,
    remainderPixels: 2,
    overflowPixels: 0,
    partialCellPixels: 0,
    missingPartialCellPixels: 0,
    exactFit: false
  },

  totalCompleteCells: 81,
  hasOverflow: false,
  hasTruncation: false,
  hasUnusedSpace: true,
  isExactFit: false
};
```

The status summary shall expose the most useful derived values without requiring the user to inspect every field.

Example:

```text
9 columns x 9 rows
81 complete cells
Grid region: 98 x 98 px
Unused area: 2 px right, 2 px bottom
```

For fixed count overflow:

```text
Requested: 8 columns x 8 rows
Required region: 103 x 103 px
Canvas: 100 x 100 px
Overflow: 3 px right, 3 px bottom
```

For truncation:

```text
7 complete columns
The next column contains 9 of 12 required pixels
3 additional pixels are required
```

The preview may show incomplete areas using a subtle overlay. The textual layout result remains authoritative.

---

Q00 Recommendation Engine

---

The recommendation engine shall produce actionable alternatives rather than silently modifying the grid.

Only one primary recommendation shall be emphasized at a time.

Additional alternatives may be available through a secondary control such as:

```text
Other options
```

Each recommendation shall contain:

```js
{
  id: "increase-canvas-width-to-exact-fit",
  severity: "suggestion",
  title: "Increase canvas width to 103 px",
  explanation: "The requested 8 columns require 3 additional pixels.",
  changes: {
    "canvas.widthPixels": 103
  }
}
```

Applying a recommendation shall be one state transaction. It shall be reversible through Undo.

Recommendation priority shall be:

```text
1. Invalid or impossible state preventing rendering.
2. Fixed-count overflow.
3. Partial or truncated cells.
4. Zero complete cells.
5. Mismatch between requested and calculated count.
6. Small adjustment producing an exact fit.
7. Large unused area.
8. Optional optimization suggestions.
```

Severity levels:

| Severity    | Meaning                                                                        | Presentation                         |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| Error       | The requested operation cannot be completed.                                   | Clear but localized error treatment. |
| Warning     | Output is possible, but part of the requested layout is incomplete or omitted. | Muted warning treatment.             |
| Suggestion  | Output is valid, but an alternative may fit more cleanly.                      | Neutral informational treatment.     |
| Information | Describes the current result.                                                  | Standard text.                       |

Red should be reserved for errors that block an action.

Truncation should normally be a warning, not an error.

Unused space should normally be a suggestion or information.

The recommendation engine shall support at least the following recommendation families.

| Condition                                        | Possible recommendation                               |
| ------------------------------------------------ | ----------------------------------------------------- |
| Fixed layout overflows                           | Increase canvas dimension to the required value.      |
| Fixed layout overflows                           | Reduce cell dimension to the largest fitting value.   |
| Fixed layout overflows                           | Reduce requested cell count.                          |
| Automatic layout has a truncated next cell       | Increase canvas to complete the next cell.            |
| Automatic layout has a truncated next cell       | Decrease cell size to produce an exact fit.           |
| Automatic layout leaves a small remainder        | Reduce canvas to the used dimension.                  |
| Automatic layout leaves substantial unused space | Increase cell count if count is fixed below capacity. |
| Grid contains zero complete cells                | Reduce cell size or increase canvas size.             |
| Grid origin consumes substantial space           | Reset origin to zero.                                 |
| Border consumes substantial space                | Reduce or disable the outer border.                   |
| Atlas contains incomplete edge cells             | Skip incomplete cells or adjust the layout.           |

Exact canvas size for a requested count:

```text
recommendedCanvas =
  origin +
  leadingBorder +
  requestedCount * cellDimension +
  (requestedCount - 1) * separatorDimension +
  trailingBorder
```

Largest cell dimension that fits a requested count:

```text
maximumFittingCellDimension =
  floor(
    (
      canvasDimension -
      origin -
      leadingBorder -
      trailingBorder -
      (requestedCount - 1) * separatorDimension
    ) / requestedCount
  )
```

Example:

```text
Canvas width: 100
Requested columns: 8
Separator width: 1
No border
```

Calculation:

```text
maximum cell width =
  floor((100 - 7) / 8)
maximum cell width =
  floor(93 / 8)
maximum cell width = 11
```

Recommendation:

```text
Set cell width to 11 px.
Eight columns will use 95 px and leave 5 unused pixels.
```

The engine should prefer exact-fit recommendations when the adjustment is small.

A small adjustment may initially be defined as:

```text
absolute change <= 8 pixels
or
relative change <= 5 percent
```

This threshold is a presentation heuristic, not part of grid correctness.

---

R00 Grid Creator Mode

---

Grid Creator shall generate a raster image containing the configured background and grid.

The mode shall provide:

```text
Canvas width and height
Grid origin
Cell width and height
Automatic or fixed counts
Requested row and column count
Horizontal and vertical separator dimensions
Outer-border controls
Grid line color
Grid line opacity
Grid line style
Background mode
Background color
Background opacity
Preview zoom and pan
Fit-to-view
PNG export
Preset operations
URL sharing
JSON import and export
```

The preview shall show the complete canvas bounds.

Transparent backgrounds shall be displayed over a checkerboard or another recognizable transparency pattern. The checkerboard shall remain outside the export rendering.

Unused canvas space shall remain visible.

Optional diagnostic overlays may show:

```text
Grid bounds
Complete-cell bounds
Truncated-cell area
Unused area
Canvas origin
Current cell under pointer
```

These overlays shall not be exported unless the application later introduces an explicit diagnostic-export feature.

Grid rendering shall occur from the grid definition, not from the visible preview DOM.

The export canvas must use the exact configured pixel dimensions.

Export filename default:

```text
grid-{width}x{height}-cell-{cellWidth}x{cellHeight}.png
```

Example:

```text
grid-100x100-cell-10x10.png
```

The filename must be sanitized and must not contain filesystem-reserved characters.

---

S00 Atlas Slicer Mode

---

Atlas Slicer shall allow the user to load an image from the local device.

Supported source formats shall be based on browser decoding support. The UI should explicitly advertise common formats:

```text
PNG
JPEG
WebP
GIF first frame, when decoded by the browser
```

Animated-image frame extraction is outside the initial scope. If an animated image is loaded, browser decoding may expose only one frame.

The application shall load the image locally using a file input and an object URL or `createImageBitmap`.

The source image must not be uploaded.

After loading, the application shall display:

```text
Source filename
Natural width
Natural height
File type
File size
Calculated complete rows and columns
Total complete slices
Incomplete edge-cell status
```

The source image natural dimensions shall become the atlas canvas dimensions.

The width and height fields in Atlas Slicer shall normally be read-only because they come from the source image.

The user shall be able to apply:

```text
Grid origin
Outer borders
Cell dimensions
Separators
Counts
Traversal order
Incomplete-cell policy
Naming template
Output format
```

The grid overlay shall be rendered separately from the source image so it can be enabled or disabled without altering source pixels.

The overlay color and opacity may reuse the shared grid appearance.

Atlas export must extract source image pixels only. Grid overlay pixels must never be included in exported sprites.

---

T00 Atlas Slice Coordinates

---

For a source image with a regular grid, each complete slice shall use:

```text
sliceX =
  originX +
  leftBorder +
  columnIndex * (cellWidth + separatorWidth)

sliceY =
  originY +
  topBorder +
  rowIndex * (cellHeight + separatorHeight)

sliceWidth = cellWidth
sliceHeight = cellHeight
```

Example 1: borderless atlas with one-pixel separators.

Input:

```text
Image: 100 x 100
Cell: 10 x 10
Separator: 1 x 1
Origin: 0, 0
Outer border: disabled
```

Cell at column `0`, row `0`:

```text
x = 0
y = 0
width = 10
height = 10
```

Source pixels:

```text
x = 0 through 9
y = 0 through 9
```

Cell at column `1`, row `0`:

```text
x = 0 + 1 * (10 + 1) = 11
y = 0
width = 10
height = 10
```

Source pixels:

```text
x = 11 through 20
y = 0 through 9
```

Coordinate `x = 10` is skipped because it belongs to the separator.

Example 2: one-pixel outer border and one-pixel separators.

Input:

```text
Image: 100 x 100
Cell: 10 x 10
Separator: 1 x 1
Outer border: 1 on all sides
Origin: 0, 0
```

First cell:

```text
x = 0 + 1 = 1
y = 0 + 1 = 1
width = 10
height = 10
```

Source pixels:

```text
x = 1 through 10
y = 1 through 10
```

Second horizontal cell:

```text
x = 1 + 1 * 11 = 12
y = 1
```

The left outer border occupies `x = 0`. The separator occupies `x = 11`.

Example 3: atlas origin offset.

Input:

```text
Image: 512 x 256
Grid origin: 8, 4
Outer border: 2 on all sides
Cell: 32 x 32
Separator: 1 x 1
```

Cell at column `3`, row `2`:

```text
x = 8 + 2 + 3 * 33
x = 109

y = 4 + 2 + 2 * 33
y = 72
```

Slice rectangle:

```js
{
  x: 109,
  y: 72,
  width: 32,
  height: 32
}
```

The slicing implementation shall calculate all rectangles before export and validate them against image bounds.

---

U00 Atlas Traversal Order

---

The slicer shall support at least two traversal orders.

| Order        | Sequence                                           |
| ------------ | -------------------------------------------------- |
| Row-major    | Left to right within a row, then top to bottom.    |
| Column-major | Top to bottom within a column, then left to right. |

Row-major shall be the default.

For a grid with three columns and two rows, row-major order is:

```text
(0,0), (1,0), (2,0), (0,1), (1,1), (2,1)
```

Column-major order is:

```text
(0,0), (0,1), (1,0), (1,1), (2,0), (2,1)
```

The zero-based logical row and column indices shall remain unchanged regardless of traversal order. Only sequential export index assignment changes.

The preview shall allow the user to display sequence numbers inside cells. This is a diagnostic overlay and must not alter exported images.

---

V00 Incomplete Atlas Cells

---

Incomplete cells can occur on the right edge, bottom edge, or bottom-right corner.

The initial implementation shall support these policies:

| Policy          | Behavior                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Skip            | Export only complete cells. This is the default.                                                        |
| Pad transparent | Export a full-size sprite and copy available source pixels into it, leaving missing pixels transparent. |
| Pad with color  | Export a full-size sprite and fill missing pixels with a selected color.                                |
| Crop partial    | Export the available rectangle using smaller dimensions.                                                |

The application shall show a warning before export when incomplete cells exist and the selected policy includes or omits them.

Example:

```text
Requested cell: 12 x 12
Available partial cell: 9 x 12
Policy: Skip
```

Result:

```text
The partial cell is not exported.
```

With transparent padding:

```text
Output size: 12 x 12
Copied source area: 9 x 12
Transparent area: 3 x 12
```

With cropping:

```text
Output size: 9 x 12
```

Cropping produces nonuniform output dimensions. The UI must state this consequence.

When a cell is incomplete on both axes, transparent or color padding shall position available pixels at the top-left of the output cell unless a future alignment option is introduced.

A separator area by itself must never be exported as a partial cell.

---

W00 Sprite Naming

---

The user shall be able to configure predictable filenames.

Supported naming tokens:

| Token      | Meaning                     |
| ---------- | --------------------------- |
| `{prefix}` | User-defined prefix.        |
| `{index}`  | Sequential traversal index. |
| `{row}`    | Logical row index.          |
| `{column}` | Logical column index.       |
| `{x}`      | Source x coordinate.        |
| `{y}`      | Source y coordinate.        |
| `{width}`  | Exported sprite width.      |
| `{height}` | Exported sprite height.     |

Default configuration:

```text
Prefix: sprite
Template: {prefix}_{index}
Start index: 1
Minimum index digits: 3
```

Default filenames:

```text
sprite_001.png
sprite_002.png
sprite_003.png
```

Example coordinate-based template:

```text
{prefix}_r{row}_c{column}
```

Output:

```text
enemy_r0_c0.png
enemy_r0_c1.png
enemy_r1_c0.png
```

The preview shall show at least three example filenames before export.

All filename components shall be sanitized.

Unsafe or unsupported characters shall be replaced with `_`.

Names shall not contain:

```text
/
\
:
*
?
"
<
>
|
NUL
```

Duplicate generated filenames must be detected before export.

If duplicates occur, export shall be blocked until the naming configuration is corrected or the application applies a deterministic disambiguation suffix.

Blocking is preferable because silent renaming may break downstream references.

---

X00 Atlas Export and JSZip Integration

---

The user shall be able to export:

```text
One selected sprite as PNG
All complete or policy-approved sprites as a ZIP archive
A manifest describing exported slices
```

Recommended ZIP structure:

```text
atlas-name-slices.zip
  sprites/
    sprite_001.png
    sprite_002.png
    sprite_003.png
  manifest.json
```

Recommended manifest:

```json
{
  "schemaVersion": 1,
  "source": {
    "fileName": "atlas.png",
    "widthPixels": 100,
    "heightPixels": 100
  },
  "gridDefinition": {},
  "traversalOrder": "row-major",
  "incompleteCellPolicy": "skip",
  "sprites": [
    {
      "fileName": "sprites/sprite_001.png",
      "index": 1,
      "row": 0,
      "column": 0,
      "sourceRectangle": {
        "x": 0,
        "y": 0,
        "width": 10,
        "height": 10
      },
      "outputRectangle": {
        "width": 10,
        "height": 10
      },
      "complete": true
    }
  ]
}
```

The complete grid definition shall be included in the manifest so the extraction can be reproduced.

The application shall generate image blobs using `canvas.toBlob`.

A Promise wrapper is recommended:

```js
export function canvasToBlob(canvas, mimeType = "image/png", quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("The browser failed to encode the canvas."));
      },
      mimeType,
      quality
    );
  });
}
```

ZIP flow:

```js
const zip = createZipArchive();
const spriteFolder = zip.folder("sprites");

for (const sprite of sprites) {
  const blob = await renderSpriteToBlob(sprite);
  spriteFolder.file(sprite.fileName, blob);
}

zip.file(
  "manifest.json",
  JSON.stringify(manifest, null, 2)
);

const archiveBlob = await zip.generateAsync(
  {
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6
    }
  },
  metadata => {
    updateExportProgress(metadata.percent);
  }
);

downloadBlob(archiveBlob, archiveFileName);
```

Compression level `6` is a reasonable default. PNG data is already compressed, so higher ZIP compression levels may provide little benefit while increasing export time.

ZIP export shall show progress and shall prevent duplicate export activation while an export is running.

The user shall be able to cancel before ZIP generation starts. JSZip generation itself has limited cancellation support in this integration, so the UI must not claim that an active compression operation can always be cancelled immediately.

For very large atlases, sequential sprite processing is safer than rendering every sprite into memory simultaneously.

Recommended export pipeline:

```text
Calculate metadata.
Validate names and rectangles.
Create ZIP.
Render one sprite.
Encode one sprite to Blob.
Add Blob to ZIP.
Release temporary canvas references.
Continue with the next sprite.
Generate final ZIP Blob.
Download ZIP.
```

The implementation should reuse one temporary canvas where practical.

---

Y00 Preview Workspace, Pan, and Zoom

---

Preview zoom is display-only. It shall never change the source image, grid calculations, cell dimensions, or exported output dimensions.

Supported interactions:

| Interaction                            | Behavior                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Mouse wheel                            | Zoom around pointer position.                                            |
| Ctrl or Command plus wheel             | May also zoom, but normal wheel zoom is required by the product request. |
| Middle-button drag                     | Pan.                                                                     |
| Space plus primary-button drag         | Pan.                                                                     |
| Primary-button drag on empty workspace | Optional pan mode.                                                       |
| Zoom dropdown                          | Set a predefined zoom percentage.                                        |
| Zoom numeric field                     | Set an explicit zoom percentage.                                         |
| Fit button                             | Fit the entire canvas or image into the workspace.                       |
| 100% button                            | Display one source pixel as one CSS pixel.                               |
| Reset view                             | Reset pan and zoom.                                                      |

Recommended zoom range:

```text
Minimum: 5%
Maximum: 3200%
```

Recommended dropdown values:

```text
Fit
25%
50%
75%
100%
125%
150%
200%
400%
800%
1600%
3200%
```

The displayed zoom percentage shall reflect the actual zoom after wheel interaction.

Wheel zoom shall preserve the image coordinate beneath the pointer.

Let:

```text
p = pointer position in workspace coordinates
t = current pan translation
z1 = current zoom
z2 = new zoom
```

The source coordinate beneath the pointer is:

```text
source = (p - t) / z1
```

The new translation preserving that source point is:

```text
t2 = p - source * z2
```

Applied independently:

```js
const sourceX = (pointerX - panX) / oldZoom;
const sourceY = (pointerY - panY) / oldZoom;

const nextPanX = pointerX - sourceX * nextZoom;
const nextPanY = pointerY - sourceY * nextZoom;
```

Wheel zoom shall call `preventDefault` within the workspace so the page does not scroll while zooming.

Zoom deltas should be normalized across devices.

A multiplicative zoom model is recommended:

```js
const zoomFactor = Math.exp(-event.deltaY * 0.0015);
const nextZoom = clamp(oldZoom * zoomFactor, minZoom, maxZoom);
```

Trackpad input can produce many events. The application shall update the CSS transform immediately but may schedule expensive redraw work through `requestAnimationFrame`.

At high integer zoom levels, pixel edges should remain crisp.

Recommended CSS:

```css
.preview-canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  transform-origin: 0 0;
}
```

A pixel grid overlay may be enabled automatically at very high zoom levels, such as `800%` or above, but it must be separate from the application grid.

---

Z00 Rendering Architecture

---

The application should use separate rendering layers.

Recommended workspace structure:

```html
<div class="workspace">
  <div class="viewport-transform">
    <canvas class="source-layer"></canvas>
    <canvas class="grid-layer"></canvas>
    <canvas class="interaction-layer"></canvas>
  </div>
</div>
```

Grid Creator may use:

```text
Source layer: background and export grid
Grid layer: optional diagnostics
Interaction layer: hover and selection
```

Atlas Slicer may use:

```text
Source layer: loaded atlas image
Grid layer: grid overlay
Interaction layer: selected cell, sequence labels, truncation overlays
```

An alternative is to use one offscreen export canvas and separate visible preview canvases.

The authoritative export renderer shall be separate from viewport transformations.

The rendering pipeline shall be:

```text
State change
-> compute normalized state
-> compute layout result
-> create render description
-> schedule preview rendering
-> update UI summary
```

The preview renderer shall be scheduled using `requestAnimationFrame`.

Only one preview render shall be pending at a time.

Example:

```js
let renderFrameId = null;

export function scheduleRender(render) {
  if (renderFrameId !== null) {
    return;
  }

  renderFrameId = requestAnimationFrame(() => {
    renderFrameId = null;
    render();
  });
}
```

Form input changes do not require a separate long debounce before visual feedback. Rendering should feel immediate.

Recommended strategy:

```text
State and control synchronization: immediate
Layout calculations: immediate
Preview drawing: requestAnimationFrame
URL updates: debounce by 200 to 400 ms
Local session-state persistence: debounce by 300 to 600 ms
Preset saves: explicit user action
Large atlas diagnostics: requestAnimationFrame or deferred task
```

A long render debounce would make sliders feel disconnected and should be avoided.

For large source images, do not redraw the atlas image into a new full-resolution canvas for every grid change. Keep the decoded source image and redraw only the lightweight overlay.

Export rendering may create a full-resolution canvas because exact pixel output is required.

---

AA00 State Management and Data Flow

---

The application shall use one central application state object.

Recommended state structure:

```js
const state = {
  schemaVersion: 1,
  activeMode: "grid-creator",
  gridDefinition: {},
  gridCreator: {
    canvasWidthPixels: 100,
    canvasHeightPixels: 100
  },
  atlasSlicer: {
    sourceImage: null,
    sourceMetadata: null,
    selectedCell: null
  },
  viewportByMode: {
    gridCreator: {},
    atlasSlicer: {}
  },
  currentPreset: {
    id: null,
    name: null,
    dirty: false
  },
  ui: {
    activeDialog: null,
    expandedSections: []
  }
};
```

State updates shall be transactional.

Example API:

```js
updateState(draft => {
  draft.gridDefinition.cell.widthPixels = 12;
});
```

Every committed update shall:

```text
Normalize values.
Validate invariants.
Produce a new state revision.
Recalculate derived layout.
Notify UI subscribers.
Schedule rendering.
Mark the current preset dirty when applicable.
Schedule URL and session persistence.
```

Derived values shall not be persisted as authoritative values.

For example, `completeCellCount` should be calculated from the grid definition. It should not be stored in presets unless included as non-authoritative diagnostic metadata.

The implementation should avoid a generic string-key data-binding system that hides behavior. Explicit binding functions are easier to debug in a dependency-free application.

Example:

```js
bindIntegerInput({
  element: canvasWidthInput,
  read: state => state.gridDefinition.canvas.widthPixels,
  write: (draft, value) => {
    draft.gridDefinition.canvas.widthPixels = value;
  }
});
```

---

AB00 Undo and Reset Behavior

---

The application should support Undo and Redo for configuration changes.

This is particularly useful when applying recommendations or importing presets.

Recommended history policy:

```text
Maximum history entries: 100
Continuous slider changes within 300 ms: coalesced into one entry
Recommendation application: one entry
Preset load: one entry
JSON import: one entry
Mode switch: not necessarily a history entry
Pan and zoom: excluded from configuration history
```

Required reset actions:

```text
Reset current mode settings
Reset grid definition to defaults
Reset viewport
Clear loaded atlas
Clear all locally stored presets
```

Destructive reset actions shall require confirmation when they would discard unsaved preset changes or remove stored presets.

---

AC00 Preset Storage

---

Presets shall be stored under a namespaced local-storage key.

Recommended application namespace:

```text
com.gridAtlasHelper
```

Recommended keys:

```text
com.gridAtlasHelper.presets.v1
com.gridAtlasHelper.session.v1
com.gridAtlasHelper.preferences.v1
```

Do not use generic keys such as:

```text
settings
presets
config
state
```

Preset collection format:

```json
{
  "storageSchemaVersion": 1,
  "presets": [
    {
      "presetId": "2f38e5f8-4db3-45e5-8d22-693928f5f636",
      "presetName": "16px sprites with separators",
      "createdAt": "2026-08-01T07:00:00.000Z",
      "updatedAt": "2026-08-01T07:05:00.000Z",
      "applicationSchemaVersion": 1,
      "configuration": {}
    }
  ]
}
```

Preset IDs shall use `crypto.randomUUID()` when available.

Preset operations:

```text
Create preset
Save changes
Save as new preset
Rename preset
Duplicate preset
Delete preset
Load preset
Export preset as JSON
Import preset from JSON
```

Loading a preset shall not automatically overwrite the preset if the user later edits the configuration. The application shall mark it as modified.

Example status:

```text
16px sprites with separators - Modified
```

Before switching presets with unsaved changes, the application may offer:

```text
Save
Discard
Cancel
```

Autosaving the current working session is acceptable. Autosaving a named preset without an explicit product decision is not recommended because it makes experimentation destructive.

---

AD00 Preset Schema Evolution

---

Every serialized object shall contain an explicit schema version.

Property names shall be descriptive and stable.

Do not use compact URL-oriented keys inside the canonical preset schema.

Avoid:

```json
{
  "cw": 10,
  "ch": 10,
  "sx": 1
}
```

Prefer:

```json
{
  "cell": {
    "widthPixels": 10,
    "heightPixels": 10
  },
  "separator": {
    "widthPixels": 1,
    "heightPixels": 1
  }
}
```

Loading shall follow this sequence:

```text
Parse JSON.
Verify that the root is an object.
Read schemaVersion.
Reject unsupported future schema versions.
Migrate older schema versions sequentially.
Apply defaults for newly introduced optional properties.
Validate every supported property.
Ignore unknown properties while preserving them when practical.
Produce normalized current-version configuration.
```

Migration API:

```js
const migrations = {
  1: migrateVersion1ToVersion2,
  2: migrateVersion2ToVersion3
};
```

Unknown fields should not cause the entire preset to fail unless they violate security or structural constraints.

A future-version preset cannot be safely interpreted. The application shall report:

```text
This preset uses schema version 4. This application supports versions through 3.
```

The application must not pretend to load a future version by discarding unknown data.

---

AE00 JSON Import and Export

---

JSON export shall produce a readable, indented document.

Recommended structure:

```json
{
  "documentType": "grid-atlas-helper-preset",
  "schemaVersion": 1,
  "exportedAt": "2026-08-01T07:00:00.000Z",
  "presetName": "Example preset",
  "configuration": {}
}
```

Import shall validate:

```text
Valid JSON syntax
Expected document type
Supported schema version
Expected object structure
Valid numeric ranges
Valid enum values
Valid colors
Safe naming template
```

Import errors shall identify the property when possible.

Example:

```text
Cannot import preset: configuration.cell.widthPixels must be an integer greater than zero.
```

An imported document shall be previewed before it replaces current state.

The confirmation shall summarize important changes:

```text
Canvas: 100 x 100 -> 512 x 512
Cell: 10 x 10 -> 32 x 32
Separator: 1 x 1 -> 2 x 2
Background: transparent -> #ffffff
```

---

AF00 URL State and Shareable Links

---

Supported configuration values shall be serializable into the URL.

The URL shall not contain:

```text
Loaded image bytes
Object URLs
Local filesystem paths
ZIP output
Unsaved binary data
```

The recommended approach is to serialize configuration into the hash fragment:

```text
https://example.test/grid-helper/#config=...
```

Using the hash avoids sending configuration to a server in normal HTTP requests.

Two encoding strategies are acceptable.

Strategy 1 uses individual readable parameters:

```text
#mode=grid-creator&canvasWidthPixels=100&canvasHeightPixels=100&cellWidthPixels=10
```

Strategy 2 uses one encoded JSON payload:

```text
#state=<base64url-encoded-json>
```

A hybrid strategy is recommended:

```text
#v=1&mode=grid-creator&state=<base64url-encoded-json>
```

The canonical JSON schema remains descriptive. Encoding may reduce URL length without changing schema names.

URL decoding shall:

```text
Read the URL schema version.
Decode the payload.
Parse JSON.
Migrate if necessary.
Validate.
Apply only supported configuration.
Display an error if decoding fails.
```

State precedence at startup shall be:

```text
1. Valid URL configuration
2. Saved session state
3. Application defaults
```

A URL configuration shall not automatically create or overwrite a local preset.

The application shall provide:

```text
Copy shareable URL
Update URL automatically
Restore URL configuration
Clear URL configuration
```

Automatic URL updates shall be debounced.

The application shall use `history.replaceState` for routine changes so every slider movement does not create a browser-history entry.

An explicit Share action may use `history.pushState` or simply copy the current canonical URL.

When a URL exceeds a practical threshold, the UI shall warn that some systems may not preserve it reliably.

A reasonable warning threshold is approximately 2,000 characters, while still allowing the user to copy it.

---

AG00 Session Recovery

---

The current unnamed working state should be saved separately from named presets.

Session state may include:

```text
Active mode
Current grid definition
Current Grid Creator canvas dimensions
Viewport preferences
Last selected preset ID
Panel expansion state
```

Session state shall not include:

```text
Loaded atlas image bytes
Generated sprite blobs
Generated ZIP blobs
Object URLs
Temporary canvases
```

On reload, the application may restore the Atlas Slicer grid configuration and source filename metadata, but it must ask the user to load the image again.

Example:

```text
Previous atlas settings restored.
Reload "characters.png" to continue slicing.
```

---

AH00 User Scenarios

---

Scenario 1: Generate a transparent reference grid.

The user needs a `1024 x 1024` transparent PNG containing `32 x 32` cells separated by one-pixel lines.

Input:

```text
Mode: Grid Creator
Canvas: 1024 x 1024
Cell: 32 x 32
Separator: 1 x 1
Outer border: disabled
Background: transparent
Grid color: #00ff00
```

Calculation per axis:

```text
N = floor((1024 + 1) / 33)
N = 31

used = 31 * 32 + 30 * 1
used = 1022

remainder = 2
```

System response:

```text
31 x 31 complete cells
961 total cells
2 unused pixels on the right
2 unused pixels on the bottom
```

Primary recommendation:

```text
Reduce canvas to 1022 x 1022 for an exact fit.
```

Alternative recommendation:

```text
Increase canvas to 1055 x 1055 to fit 32 x 32 complete cells.
```

The user may ignore both recommendations and export the valid `1024 x 1024` image.

Scenario 2: Design exactly 10 columns and 10 rows.

Input:

```text
Canvas: 100 x 100
Requested grid: 10 x 10
Cell: 10 x 10
Separator: 1 x 1
Outer border: disabled
```

Required dimension:

```text
10 * 10 + 9 * 1 = 109
```

System response:

```text
The requested layout requires 109 x 109 px.
The current canvas is short by 9 px on each axis.
```

Primary recommendation:

```text
Set canvas size to 109 x 109.
```

Alternative:

```text
Set cell size to 9 x 9.
```

With `9 x 9` cells:

```text
10 * 9 + 9 * 1 = 99
```

One unused pixel remains on each axis.

Scenario 3: Slice an atlas with a border.

The user loads a `100 x 100` PNG.

Input:

```text
Cell: 10 x 10
Separator: 1 x 1
Outer border: 1 px on every side
Traversal: row-major
Naming: icon_{index}
```

Calculation:

```text
9 columns
9 rows
81 sprites
Exact fit
```

First rectangles:

```text
icon_001.png: x=1,  y=1, width=10, height=10
icon_002.png: x=12, y=1, width=10, height=10
icon_003.png: x=23, y=1, width=10, height=10
```

The ZIP contains 81 images and one manifest.

Scenario 4: Slice an atlas with incomplete right-edge content.

The user loads a `100 x 64` atlas.

Input:

```text
Cell: 12 x 16
Separator: 1 x 0
No outer border
```

Horizontal calculation:

```text
7 complete columns
9 pixels available in the partial eighth column
3 pixels missing
```

Vertical calculation:

```text
4 complete rows
Exact vertical fit
```

System response:

```text
28 complete sprites
4 incomplete right-edge sprites
```

Default export policy skips the four incomplete sprites.

The user may choose transparent padding to export all 32 positions.

Scenario 5: Use a grid preset in both modes.

The user creates a preset named:

```text
Game atlas 24px
```

Configuration:

```text
Cell: 24 x 24
Separator: 2 x 2
Outer border: 2 px
Grid color: #ff00ff
```

The user loads this preset in Grid Creator and exports a transparent grid reference.

The user then switches to Atlas Slicer, loads the completed artwork, and uses the same grid definition to extract sprites.

The grid definition remains consistent between both operations.

Scenario 6: Share a configuration.

The user adjusts a layout and selects Copy shareable URL.

The URL contains the versioned grid configuration.

A second user opens the URL.

The application validates the configuration and opens the corresponding mode with the same parameters.

No source atlas image is included. The second user must load their own image.

Scenario 7: Recover after accidental reload.

The user configures an atlas grid but has not created a preset.

The browser is reloaded.

The application restores the session configuration and indicates that the local source image must be selected again.

Scenario 8: Export a nonuniform partial edge.

The user selects Crop partial.

The application warns:

```text
Four exported files will be 9 x 16 px. The remaining files will be 12 x 16 px.
```

The user confirms and exports.

The manifest records the individual output dimensions.

---

AI00 Performance Requirements

---

Interactive configuration changes should remain responsive for common canvas sizes, including:

```text
2000 x 2000
4000 x 2000
4096 x 4096
```

The application shall avoid reading full pixel data during ordinary grid preview.

Do not call `getImageData` merely to display or slice known rectangles.

Sprite extraction can use `drawImage` with source rectangles:

```js
context.drawImage(
  sourceImage,
  sourceX,
  sourceY,
  sourceWidth,
  sourceHeight,
  0,
  0,
  destinationWidth,
  destinationHeight
);
```

Large operations shall expose progress.

The UI shall remain usable while configuration values are edited. ZIP creation may temporarily occupy the main thread because JSZip and browser canvas encoding are not guaranteed to be fully off-main-thread.

Potential later optimization:

```text
Move geometry calculation to a Web Worker.
Use OffscreenCanvas where supported.
Move selected image-processing operations to a worker.
```

These are not required for the initial implementation.

Rendering optimization rules:

```text
Do not recreate the full source canvas when only overlay settings change.
Do not render while the preview element is hidden.
Coalesce multiple state changes into one animation-frame render.
Do not write local storage on every input event.
Revoke obsolete object URLs.
Reuse temporary canvases where safe.
Release large Blob and image references after download.
```

A preview may render at workspace resolution instead of full source resolution, provided the export renderer remains pixel-accurate.

At high zoom, the application may render only the visible viewport region. This is an optimization, not an initial requirement.

---

AJ00 Reliability and Resilience

---

Every external input shall be treated as untrusted.

External inputs include:

```text
Uploaded images
Imported JSON
URL state
Local-storage contents
Preset names
Filename templates
Numeric form input
Color input
```

The application shall handle local-storage failures.

Possible causes include:

```text
Storage disabled
Quota exceeded
Private browsing restrictions
Corrupted stored JSON
Manual modification
```

Failure to save a preset must be visible. The UI must not report success when persistence failed.

Corrupted local storage shall not prevent the application from starting.

Recovery flow:

```text
Attempt to parse stored document.
If parsing fails, retain the raw value temporarily.
Start with defaults.
Show a recoverable storage warning.
Offer to clear corrupted application storage.
```

Image decoding errors shall produce:

```text
The selected file could not be decoded as an image.
```

Canvas allocation or encoding errors shall preserve current state and provide a practical explanation.

ZIP-generation errors shall identify whether failure occurred during:

```text
Sprite rendering
Image encoding
Manifest creation
ZIP compression
Download preparation
```

All object URLs shall be revoked after use:

```js
URL.revokeObjectURL(url);
```

The application must guard against stale asynchronous operations.

Example: the user loads Image A and immediately loads Image B. If Image A finishes decoding after Image B, Image A must not replace Image B.

A request token or operation generation shall be used:

```js
const requestId = ++latestImageRequestId;

const image = await decodeImage(file);

if (requestId !== latestImageRequestId) {
  releaseImage(image);
  return;
}
```

---

AK00 Accessibility

---

All controls shall have programmatically associated labels.

Color must not be the only indicator of errors, warnings, or recommendations.

Tabs shall use appropriate tab semantics:

```text
role="tablist"
role="tab"
role="tabpanel"
aria-selected
```

Dialogs shall manage focus.

Keyboard operation shall support:

```text
Tab navigation
Arrow-key tab switching
Enter or Space activation
Escape to close dialogs
Keyboard-accessible numeric controls
Keyboard-accessible preset operations
Keyboard-accessible export
```

The preview workspace shall provide textual geometry information outside the canvas. Canvas pixels alone are not an accessible description.

Status messages should use appropriate live regions without announcing every slider movement excessively.

Errors may use an assertive live region.

Routine recalculation summaries should either be non-live or politely debounced.

Visible focus indicators are required.

---

AL00 Responsive Behavior

---

Desktop is the primary environment.

At narrower widths, the interface shall stack:

```text
Top tabs
Preview workspace
Settings panel
Status summary
```

The preview shall remain usable at widths where the settings panel cannot remain beside it.

Controls with paired width and height values shall remain visually associated.

The application does not need to provide a mobile-first sprite-production workflow, but it must not become unusable on a tablet-sized viewport.

Middle-mouse pan is not available on touch devices. Touch support should include:

```text
One-finger pan
Two-finger pinch zoom
```

Touch support may be implemented after the desktop interactions if development must be phased.

---

AM00 Privacy and Security

---

All processing shall occur locally in the browser.

The application shall make no network requests during normal operation.

The source image must not be uploaded or embedded into shareable URLs.

Preset names, imported JSON, filename templates, and URL values shall be displayed using text nodes or `textContent`, not inserted through `innerHTML`.

The application shall not execute code from imported JSON.

The Content Security Policy should be compatible with native modules and the local vendor script.

Recommended starting policy when served through HTTP headers or a compatible meta element:

```text
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' blob: data:;
connect-src 'none';
object-src 'none';
base-uri 'none';
```

No inline script should be required.

---

AN00 Documentation and Code Clarity

---

The code should be organized around domain concepts rather than around individual HTML controls.

Preferred module names:

```text
grid-math.js
grid-renderer.js
atlas-slicer.js
grid-recommendations.js
preset-service.js
url-state.js
```

Avoid modules such as:

```text
helpers.js
misc.js
utils2.js
things.js
```

Utility modules are acceptable only for genuinely generic operations.

Functions shall use descriptive names.

Prefer:

```js
calculateMaximumCompleteCellCount()
calculateRequiredCanvasDimension()
createSliceRectangles()
serializePresetForUrl()
```

Avoid:

```js
calc()
doGrid()
handleThing()
processData()
```

Comments shall explain behavior, invariants, formulas, browser limitations, and non-obvious decisions.

Comments should not restate obvious syntax.

Useful comment:

```js
// A separator exists only between cells. There is no trailing separator
// after the final requested cell, so the required dimension uses N - 1.
const separatorPixels = Math.max(0, cellCount - 1) * separatorWidth;
```

Unhelpful comment:

```js
// Multiply count by width.
const size = count * width;
```

Every grid formula module shall document:

```text
Coordinate convention
Inclusive and exclusive bounds
Whether borders are included
Whether the final separator is included
How partial cells are classified
```

Public domain functions should use JSDoc.

Example:

```js
/**
 * Calculates the maximum number of complete cells along one axis.
 *
 * Cell pixels exclude separator and outer-border pixels.
 * Coordinates are zero-based and rectangles use half-open ranges.
 *
 * @param {object} input
 * @param {number} input.canvasDimension
 * @param {number} input.origin
 * @param {number} input.leadingBorder
 * @param {number} input.trailingBorder
 * @param {number} input.cellDimension
 * @param {number} input.separatorDimension
 * @returns {number}
 */
export function calculateMaximumCompleteCellCount(input) {
  const available =
    input.canvasDimension -
    input.origin -
    input.leadingBorder -
    input.trailingBorder;

  if (available < input.cellDimension) {
    return 0;
  }

  return Math.floor(
    (available + input.separatorDimension) /
    (input.cellDimension + input.separatorDimension)
  );
}
```

Important invariants should be asserted during development.

Example:

```js
console.assert(cellWidth >= 1);
console.assert(separatorWidth >= 0);
console.assert(sliceX + sliceWidth <= imageWidth);
```

Production behavior must not depend exclusively on `console.assert`. User-facing operations still require proper validation and error handling.

---

AO00 Recommended Grid Math API

---

The grid-math module should expose pure functions.

Recommended API:

```js
calculateAxisLayout(input)
calculateGridLayout(gridDefinition)
calculateCellRectangle(gridDefinition, columnIndex, rowIndex)
enumerateCompleteCellRectangles(gridDefinition)
enumeratePartialCellRectangles(gridDefinition)
calculateRequiredCanvasSize(gridDefinition, counts)
calculateMaximumFittingCellSize(gridDefinition, counts)
calculateExactFitAlternatives(gridDefinition)
```

Example axis input:

```js
{
  canvasDimension: 100,
  originPixels: 0,
  leadingBorderPixels: 0,
  trailingBorderPixels: 0,
  cellDimensionPixels: 12,
  separatorDimensionPixels: 1,
  countMode: "automatic",
  requestedCellCount: null
}
```

Example axis result:

```js
{
  completeCellCount: 7,
  usedDimensionPixels: 90,
  remainderPixels: 10,
  nextCellStartPixels: 91,
  partialCellPixels: 9,
  missingPartialCellPixels: 3,
  requiredDimensionPixels: null,
  overflowPixels: 0,
  exactFit: false
}
```

Pure calculation functions shall not:

```text
Read DOM controls
Write DOM controls
Access local storage
Display notifications
Render canvases
Modify global state
```

This separation makes the formulas inspectable and reduces the risk of UI behavior changing layout arithmetic.

---

AP00 Recommended Renderer API

---

Grid rendering should accept an explicit render description.

Example:

```js
renderGrid({
  context,
  canvasWidthPixels,
  canvasHeightPixels,
  gridDefinition,
  layoutResult,
  includeBackground: true,
  includeGrid: true,
  includeDiagnostics: false
});
```

Atlas overlay rendering:

```js
renderAtlasOverlay({
  context,
  sourceWidthPixels,
  sourceHeightPixels,
  gridDefinition,
  layoutResult,
  selectedCell,
  showSequenceNumbers: false,
  showIncompleteCells: true
});
```

The renderer shall not recalculate layout independently. It shall consume the same layout result used by the UI and slicer.

This prevents the preview, summary, and export operations from disagreeing.

---

AQ00 Error and Status Language

---

Messages shall state the condition and consequence.

Prefer:

```text
The requested 8 columns require 103 px. The canvas is 3 px too narrow.
```

Avoid:

```text
Invalid grid.
```

Prefer:

```text
Four incomplete cells will be skipped during export.
```

Avoid:

```text
Warning: truncation!
```

Prefer:

```text
No complete cells fit. Reduce the cell width or increase the canvas width.
```

Avoid:

```text
Error 104.
```

Success notifications should be reserved for explicit operations:

```text
Preset saved.
URL copied.
JSON imported.
81 sprites exported.
```

Continuous recalculation should update status text without producing toast notifications.

---

AR00 Default Configuration

---

Recommended Grid Creator defaults:

```json
{
  "canvas": {
    "widthPixels": 512,
    "heightPixels": 512
  },
  "gridOrigin": {
    "xPixels": 0,
    "yPixels": 0
  },
  "cell": {
    "widthPixels": 32,
    "heightPixels": 32
  },
  "count": {
    "columnMode": "automatic",
    "rowMode": "automatic",
    "requestedColumns": 16,
    "requestedRows": 16
  },
  "separator": {
    "widthPixels": 1,
    "heightPixels": 1
  },
  "outerBorder": {
    "enabled": false,
    "leftPixels": 0,
    "topPixels": 0,
    "rightPixels": 0,
    "bottomPixels": 0
  },
  "gridAppearance": {
    "lineColor": "#000000",
    "lineOpacity": 1,
    "lineStyle": "solid"
  },
  "background": {
    "mode": "transparent",
    "color": "#ffffff",
    "opacity": 1
  }
}
```

Recommended Atlas Slicer defaults:

```text
Reuse the active shared grid definition.
Traversal: row-major
Incomplete-cell policy: skip
Naming prefix: sprite
Start index: 1
Minimum digits: 3
Output: PNG
```

The default one-pixel separator implements the requested default visible grid-line width.

---

AS00 Acceptance Criteria

---

The implementation is functionally acceptable when all of the following statements are true.

Grid calculations use zero-based coordinates and preserve the requested cell dimensions independently from separators and borders.

A `10 x 10` cell always exports or renders 10 usable pixels by 10 usable pixels.

With no outer border, a cell beginning at `x = 0` and width `10` contains pixels `0` through `9`.

With a one-pixel separator, the next cell begins at `x = 11`.

With a one-pixel left outer border, the first 10-pixel cell begins at `x = 1` and contains pixels `1` through `10`.

Grid Creator exports a PNG with exactly the configured canvas dimensions.

Transparent exports preserve alpha.

Preview zoom and pan do not affect exported pixel dimensions or cell coordinates.

The system identifies complete cells, unused areas, fixed-layout overflow, and partial cells separately.

At least one actionable recommendation is shown when a small configuration adjustment can resolve overflow or complete a truncated cell.

Recommendations are never applied without user action.

Named presets persist under a namespaced local-storage key.

Corrupted preset or session storage does not prevent application startup.

JSON presets contain an explicit schema version and descriptive property names.

Shareable URLs restore supported configuration values.

Shareable URLs do not contain source image bytes.

Atlas Slicer uses natural source-image dimensions.

Atlas slicing skips separator and border pixels.

Atlas slicing never includes the visible preview overlay in exported sprites.

The default atlas export order is left-to-right and top-to-bottom.

Sprite filenames are deterministic and checked for duplicates.

The ZIP archive contains individual sprite files and a manifest.

The provided JSZip browser build is loaded before the ES-module application entry point and is accessed through `window.JSZip` or an adapter around it.

Large but reasonable images such as `4000 x 2000` can be previewed without rerendering source pixels for every grid setting change.

The user receives a useful error when canvas allocation, image decoding, local storage, PNG encoding, or ZIP generation fails.

---

AT00 Suggested Implementation Sequence

---

Phase 1 establishes the domain model and grid mathematics.

Deliverables:

```text
Grid schema
Axis formulas
Complete-cell enumeration
Partial-cell detection
Fixed-count overflow
Recommendations
```

Phase 2 establishes Grid Creator.

Deliverables:

```text
Application shell
Controls
State bindings
Canvas rendering
Background modes
Pan and zoom
PNG export
```

Phase 3 establishes persistence and sharing.

Deliverables:

```text
Session recovery
Preset CRUD
JSON import and export
URL state
Schema migration structure
```

Phase 4 establishes Atlas Slicer.

Deliverables:

```text
Image loading
Grid overlay
Cell selection
Traversal order
Incomplete-cell policies
Sprite naming
Single-sprite export
```

Phase 5 establishes ZIP export.

Deliverables:

```text
JSZip adapter
Sequential sprite encoding
Manifest generation
Progress display
ZIP download
```

Phase 6 establishes hardening.

Deliverables:

```text
Large-image handling
Storage error recovery
Asynchronous race protection
Accessibility review
Responsive layout
Final code documentation
```

The grid calculation module should be implemented before the visual interface. Rendering, recommendations, atlas extraction, and manifests must all consume the same geometry model.

---

AU00 Final Technical Decisions

---

The application shall use native browser modules for application code and load the supplied JSZip file as a classic UMD script before the module entry point.

Grid geometry shall use integer pixel rectangles and half-open coordinate ranges.

Cell dimensions shall exclude separators and outer borders.

Separators shall be represented as reserved pixel regions, not centered vector strokes.

The final cell in a row or column shall not require a trailing separator.

Outer borders shall support independent left, top, right, and bottom dimensions, with a convenience control for setting all sides together.

The application shall maintain one shared grid definition across Grid Creator and Atlas Slicer.

Viewport transformations shall remain separate from export geometry.

Configuration changes shall update state and derived calculations immediately. Preview rendering shall be coalesced through `requestAnimationFrame`. URL and session persistence shall be debounced.

Recommendations shall be explicit, actionable, reversible, and applied only after user action.

Presets shall use descriptive, versioned JSON schemas and namespaced local-storage keys.

Atlas extraction shall operate on source-image pixels and shall never include preview overlays.

Bulk atlas export shall use the supplied JSZip dependency and include a machine-readable manifest.

The source image shall remain local, shall not be stored in presets or URLs, and shall need to be selected again after a browser reload.

The resulting application shall behave as a small professional graphics utility: exact about pixels, transparent about calculations, conservative about modifying input, and efficient enough for ordinary multi-megapixel grid and atlas work.
