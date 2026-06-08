# ASCII Art Atelier

ASCII Art Atelier is a dependency-free, browser-only image-to-ASCII converter. It runs as a static website and processes images locally without uploads.

## Features

- Drop or select PNG, JPG, JPEG, and WEBP images up to 10 MB.
- Tune scale, character set, brightness, contrast, detail, inversion, color mode, and output width.
- Preview ASCII text in real time.
- Copy the result or download it as a TXT file.
- Calm validation, recoverable error states, and copyable troubleshooting details.

## How to use

Open the page, import an image, adjust the settings, then use **Copy text** or **Download TXT**.

## Local development

There is no build step or package installation.

Serve this folder with any static file server:

```sh
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Some browsers allow opening `index.html` directly, but Chromium blocks local ES module imports on `file://` pages. A local server also provides the secure context needed for reliable clipboard behavior.

## Deployment

The project can be deployed as-is to GitHub Pages or any static file host. It does not require a build step.

## Project structure

```text
index.html                     Page structure and controls
styles.css                    Responsive product styling
app.js                        UI state, validation, conversion, and export flow
src/ascii-art-converter.js    Image-to-ASCII conversion module
favicon.svg                   Local site icon
```

## Privacy

Images are read from the selected local `File` object and processed in the browser. The app has no backend, telemetry, or network dependency.

## Implementation note

The converter module is maintained separately in `src/ascii-art-converter.js`; the product UI imports its public browser API directly.
