# ImageMagick WASM Filters Playground

This project is a single-page, offline image editing playground that demonstrates ImageMagick running in the browser via WebAssembly. It lets users load a local image, explore a catalog of focused effect widgets, and copy a matching ImageMagick CLI command for each effect.

## Main features

- Local-only processing: images stay on the device with no uploads.
- Independent widget cards: each effect runs asynchronously and has its own preview, parameters, CLI output, and download.
- Drag-and-drop ingestion with source preview and metadata.
- Built-in CLI generation for every widget.
- Download output for each widget with format selection.
- Diagnostics panel for runtime and job visibility.

## Running locally

Because WebAssembly loading is blocked on file:// in many browsers, run a local static server and open `index.html` from there.

Example:

```bash
python3 -m http.server
```
