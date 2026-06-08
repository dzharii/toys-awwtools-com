# ASCII Art Converter Sample Package

---

A00 Overview

---

This package contains a browser-oriented image-to-ASCII module, a Node.js sample runner, five sample images, generated `.txt` outputs, and validation results.

The source module is in `src/ascii-art-converter.js`. The Node.js runner is in `examples/node-convert-samples.mjs`. The runner reads all images from `samples/input`, converts each image into ASCII text, and writes one output file per image into `samples/output` using the original filename plus `.txt`.

---

B00 Install

---

Use Node.js 20 or newer.

```sh
npm install
```

The Node.js example uses `sharp` to decode image files into RGBA pixel data. The converter itself remains a plain JavaScript module.

---

C00 Run The Sample Conversion

---

To convert all bundled sample images:

```sh
npm run samples
```

When an output file already exists, the script asks before overwriting it.

To overwrite existing outputs without prompting:

```sh
npm run samples:overwrite
```

To run conversion and validation without writing output files:

```sh
npm run validate
```

To print converter log events during the run:

```sh
ASCII_ART_DEBUG=1 npm run samples:overwrite
```

---

D00 Output Behavior

---

For an input file named `formal-portrait.jpg`, the runner writes:

```txt
samples/output/formal-portrait.jpg.txt
```

Each text output contains a short metadata header followed by the generated ASCII art. The runner also writes a JSON report to:

```txt
test-results/latest-node-run.json
```

---

E00 Browser Usage

---

In a browser, use `convertImageToAscii()` directly with a `File`, `Blob`, image element, canvas, video element, ImageBitmap, URL, or URL string.

```js
import { convertImageToAscii } from "./src/ascii-art-converter.js";

const result = await convertImageToAscii(fileInput.files[0], {
  outputColumns: 100,
  charsetPreset: "standard",
  colorMode: "monochrome",
  renderCanvas: true,
  onLogEvent(event) {
    console.debug(event.type, event.message, event.details);
  }
});

pre.textContent = result.text;
document.body.append(result.canvas);
```

For user-facing error handling:

```js
import { AsciiArtError, convertImageToAscii, normalizeAsciiError } from "./src/ascii-art-converter.js";

try {
  const result = await convertImageToAscii(fileInput.files[0]);
  pre.textContent = result.text;
} catch (error) {
  const normalized = normalizeAsciiError(error);
  console.error(normalized.code, normalized.message, normalized.details);
  alert(normalized.message);
}
```

---

F00 Node.js Usage

---

The main conversion function depends on browser canvas APIs. In Node.js, decode the image with `sharp`, create a small `ImageData` polyfill, and call the lower-level pixel functions.

```js
import sharp from "sharp";

class NodeImageData {
  constructor(data, width, height) {
    this.data = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
    this.width = width;
    this.height = height;
  }
}

globalThis.ImageData ??= NodeImageData;

const { processImageData, imageDataToAsciiGrid } = await import("./src/ascii-art-converter.js");

const decoded = await sharp("./samples/input/formal-portrait.jpg")
  .rotate()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const imageData = new ImageData(
  new Uint8ClampedArray(decoded.data.buffer, decoded.data.byteOffset, decoded.data.length),
  decoded.info.width,
  decoded.info.height
);

const options = {
  outputColumns: 92,
  charsetPreset: "detailed",
  renderCanvas: false,
  colorMode: "monochrome"
};

const processed = processImageData(imageData, options);
const grid = imageDataToAsciiGrid(processed, options);

console.log(grid.text);
```

The bundled runner implements this pattern and adds file iteration, overwrite prompts, validation, and reporting.

---

G00 Options Used By The Sample Runner

---

The runner uses per-image settings in `SAMPLE_SETTINGS` inside `examples/node-convert-samples.mjs`. These settings are intentionally conservative: they use output column counts between 92 and 118, text-only rendering, bundled charset presets, and the public `detail` option.

No custom charset mode is used or documented in this package.

---

H00 Error Handling

---

The converter exports `AsciiArtError` and `normalizeAsciiError()`. Expected error codes include invalid options, unsupported source values, image decode failures, oversized input, oversized output, unavailable canvas APIs, unavailable DOM helpers, and failed exports.

The Node.js runner catches each image conversion error, normalizes it, prints a clean error line, and continues to the next image. A failed run exits with a non-zero status after writing the JSON report.

---

I00 Validation

---

The runner validates that every generated ASCII output is non-empty, has the expected row count, and has a consistent line width matching the computed column count.

The bundled outputs were generated with Node.js and `sharp`; details are in `test-results/latest-node-run.json` and `TEST_RESULTS.md`.
