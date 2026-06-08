# Using The ASCII Art Converter In Browser And Node.js

---

A00 Purpose

---

This package demonstrates the image-to-ASCII converter as a small, practical library. The browser path uses canvas APIs. The Node.js path uses `sharp` to decode image files and then calls the converter's lower-level pixel functions.

The package is designed as both documentation and a smoke-test harness. The five included images cover different visual cases: flat cartoon art, a dark green outdoor scene, pixel art, a tall portrait, and an anime-style image with text-like visual content.

---

B00 Conversion Pipeline

---

The converter follows a direct pipeline. It receives image pixels as RGBA data, optionally applies image adjustments, splits the image into a text grid, computes average cell color and luminance, maps luminance to a character preset, and returns text plus structured grid data.

In browsers, `convertImageToAscii()` loads the image and reads pixels through canvas. In Node.js, the sample runner uses `sharp` to do the decoding step and then calls `processImageData()` and `imageDataToAsciiGrid()`.

---

C00 Why Node.js Uses Sharp

---

Node.js does not provide browser canvas APIs by default. The source module intentionally does not force a Node canvas dependency into the core library. The sample runner uses `sharp` only for the Node usage example, where it reads JPEG and PNG files into raw RGBA data.

This keeps the converter lightweight while still giving server-side users a working path.

---

D00 Error Model

---

The polished source uses structured `AsciiArtError` failures. This allows applications to distinguish invalid options, decode failures, unsupported runtime APIs, oversized inputs, and oversized outputs.

The sample runner demonstrates this by catching each failure, normalizing it through `normalizeAsciiError()`, printing a clean message, writing the details into the JSON report, and continuing with the remaining files.

---

E00 Logging Model

---

The converter supports `onLogEvent`. The default logger is a no-op, so the conversion path can emit events without repeating null checks. Callers that want telemetry can provide a function and route events to console output, diagnostics, or product telemetry.

The sample runner only prints events when `ASCII_ART_DEBUG=1` is set.

---

F00 Sample Settings

---

The sample runner keeps settings explicit and simple. It uses only bundled charset presets. It does not use custom charset behavior. It uses `outputColumns` rather than forcing callers to reason about pixel scale. It also uses `detail`, where positive values sharpen detail and negative values soften the image.

The settings were selected to keep the ASCII outputs readable in plain text files while preserving enough structure to recognize the source image.

---

G00 Validation Strategy

---

The validation is intentionally pragmatic. The script verifies that every output is non-empty, every output has the expected number of rows, and every row has the expected column count. This does not prove subjective visual quality, but it does catch malformed conversion output, broken grid math, decode failures, empty text, and unstable line widths.

The generated outputs were also inspected at a coarse visual level. The cartoon sample preserves large outline regions, the yard sample preserves the centered owl and dark background mass, the pixel art sample preserves the portrait silhouette, the formal portrait preserves the head and shoulders structure, and the anime sample preserves the figure and high-contrast overlay region.

---

H00 Release Usefulness

---

This example package is useful before public release because it exercises valid JPEG and PNG inputs, tall and square images, low-detail and high-detail scenes, dark and bright source material, text-only Node.js output, option validation, overwrite behavior, and structured error reporting.

It is not a replacement for automated unit tests. It is a small reproducible usage example that can be run by a maintainer or a library user.
