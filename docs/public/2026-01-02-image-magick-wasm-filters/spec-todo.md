2026-01-02

## TODO List for acceptance testing

* [ ] Application shell

  * [ ] Single-page static UI loads with no runtime errors
  * [ ] No network calls required after initial page load
  * [ ] Global app states implemented (NoSource, SourceLoaded, WasmUnavailable, SourceError)
  * [ ] Global "Reset all widgets" action resets parameters and clears outputs, with confirmation

* [ ] Image ingestion

  * [ ] Drag-and-drop target accepts image files and shows drag-over visual state
  * [ ] File picker accepts common image types (at minimum PNG, JPEG, WebP)
  * [ ] Non-image files are rejected with a clear message
  * [ ] File read into memory (bytes plus filename and mime when available)
  * [ ] Pixel budget enforcement rejects images above the maximum megapixels with a clear message
  * [ ] Decode failure handling sets SourceError and clears SourceLoaded

* [ ] Source preview and source metadata

  * [ ] Source Preview renders the loaded image in a fixed-size frame
  * [ ] Source Preview scaling preserves aspect ratio ("contain") and never changes page layout
  * [ ] Source metadata displayed (pixel width, pixel height, megapixels, byte length)

* [ ] Widget catalog structure

  * [ ] Catalog renders widget cards in the specified order
  * [ ] Each card includes: header (name + purpose), preview frame, controls, CLI block, actions (Copy, Download)
  * [ ] Before source load: all widgets show placeholder preview and controls disabled
  * [ ] After source load: widgets enable and respect lazy-processing eligibility rules

* [ ] Lazy processing behavior

  * [ ] Widget becomes eligible when at least 25 percent visible in viewport
  * [ ] Widget becomes eligible when user expands or interacts with the widget
  * [ ] Eligible widget auto-renders once with defaults (if no current output exists)
  * [ ] Ineligible widget does not start new processing jobs
  * [ ] On new source image: all widget outputs are invalidated and recompute only when eligible

* [ ] Non-blocking processing architecture

  * [ ] ImageMagick WebAssembly processing runs off the main UI thread
  * [ ] Main thread remains responsive during processing (scrolling and controls usable)
  * [ ] Single serialized worker job processing (or equivalent safe scheduling) implemented by default

* [ ] Per-widget scheduling rules

  * [ ] Default debounce of 150 ms after last parameter change
  * [ ] Per-widget debounce overrides implemented where specified
  * [ ] Latest-wins staleness handling discards stale worker responses
  * [ ] Widget keeps previous output visible during processing and shows a Processing indicator
  * [ ] Widget displays error state on failures and preserves last valid output if available

* [ ] Widget UI consistency and controls

  * [ ] Range controls show numeric value labels reflecting current value
  * [ ] Number inputs enforce min/max/step constraints
  * [ ] Select controls use plain-language option names
  * [ ] Color controls use a color picker plus synchronized hex text entry
  * [ ] Only crop and perspective widgets use custom handle interactions; all other controls use native HTML controls
  * [ ] "Reset to defaults" exists per widget and re-renders output

* [ ] Preview rendering contract

  * [ ] Every widget output preview is displayed in a fixed-size frame matching the catalog rule
  * [ ] Output preview uses aspect-preserving scaling ("contain")
  * [ ] Preview rendering uses an image element when possible (supports right-click save where available)
  * [ ] Output metadata displayed per widget (dimensions, file size in bytes, output format)

* [ ] Command line generation contract

  * [ ] Every widget displays a complete CLI command line in the form: magick "INPUT" <options> "OUTPUT"
  * [ ] CLI option order is stable and deterministic within each widget
  * [ ] CLI block is copy-friendly (monospace) and has a one-click Copy action
  * [ ] Optional steps are included or omitted based on toggles (no placeholder options shown)
  * [ ] Widgets that cannot apply an effect (for example empty watermark text) disable copy with a clear message or emit a valid no-op command as specified

* [ ] Download and local export

  * [ ] Each widget provides a Download action that triggers a local download with no server interaction
  * [ ] Output format selection is offered where supported; at minimum PNG and JPEG are available
  * [ ] Output filename format matches the specified pattern with widget slug and timestamp
  * [ ] Alpha-preserving default behavior for transparency-producing widgets (notably Chroma key)

* [ ] Error handling and diagnostics

  * [ ] File rejection errors display actionable messages (type, size, pixel budget, decode failure)
  * [ ] WebAssembly load/initialize failure displays a global error and disables processing
  * [ ] Widget processing failures display an in-card error with Reset to defaults
  * [ ] Collapsed diagnostics panel exists with wasm state, worker state, last error, and rolling job log

* [ ] Accessibility and keyboard interaction

  * [ ] All controls are keyboard reachable and have accessible labels
  * [ ] Slider values are readable and updated as the slider changes
  * [ ] Errors are readable and do not rely on color alone to convey meaning

* [ ] Widget implementations (each must render preview, expose parameters, process asynchronously, emit CLI, support download)

  * [ ] Auto-fix and hygiene

    * [ ] Auto-orient toggle
    * [ ] Convert to sRGB toggle
    * [ ] Strip metadata toggle
    * [ ] Normalize select (Off, Mild, Strong)
  * [ ] Levels and gamma

    * [ ] Black point percent slider
    * [ ] White point percent slider
    * [ ] Gamma slider
    * [ ] Channel select (RGB, Red, Green, Blue)
  * [ ] Brightness and contrast

    * [ ] Brightness slider (-100 to +100)
    * [ ] Contrast slider (-100 to +100)
  * [ ] White balance and tint

    * [ ] Temperature slider (-100 to +100)
    * [ ] Tint slider (-100 to +100)
    * [ ] Strength slider (0 to 100)
  * [ ] Color tuning (Hue, saturation, brightness)

    * [ ] Brightness slider (0 to 200, 100 = no change)
    * [ ] Saturation slider (0 to 200, 100 = no change)
    * [ ] Hue rotation slider (-180 to +180)
  * [ ] Smart contrast

    * [ ] Amount slider (0 to 20)
    * [ ] Midpoint slider (0 to 100 percent)
    * [ ] Protect highlights toggle
  * [ ] Sharpness (Unsharp mask)

    * [ ] Radius control
    * [ ] Sigma control
    * [ ] Amount control
    * [ ] Threshold control
  * [ ] Denoise

    * [ ] Strength control
    * [ ] Passes control (1 to 3)
    * [ ] Preserve edges toggle
  * [ ] Blur (Gaussian)

    * [ ] Radius control
    * [ ] Sigma control
  * [ ] Vignette and tilt-shift

    * [ ] Mode select (Vignette only, Tilt-shift only, Both)
    * [ ] Vignette strength control
    * [ ] Vignette radius control
    * [ ] Focus center Y control
    * [ ] Focus band height control
    * [ ] Feather control
    * [ ] Blur strength control
  * [ ] Edge and emboss

    * [ ] Mode select (Edge detect, Emboss)
    * [ ] Strength control
    * [ ] Detail control
  * [ ] Posterize and dither

    * [ ] Colors control (2 to 64)
    * [ ] Dither toggle
    * [ ] Dither method select (curated supported set)
    * [ ] Optional dither strength control shown only if supported
  * [ ] Threshold and duotone

    * [ ] Mode select (Threshold, Duotone)
    * [ ] Threshold level percent control
    * [ ] Light color picker (Duotone)
    * [ ] Dark color picker (Duotone)
    * [ ] Feather control
  * [ ] Pixelate and mosaic

    * [ ] Block size control
    * [ ] Mode select (Pixelate, Mosaic)
    * [ ] Preserve edges toggle (shown only if supported)
  * [ ] Crop and straighten

    * [ ] Interactive crop rectangle selection mapped to source pixels
    * [ ] Rotation control (-10 to +10 degrees)
    * [ ] Background fill color picker
    * [ ] Auto-trim toggle (shown only if supported)
  * [ ] Resize and resample

    * [ ] Target width number input (blank = auto allowed)
    * [ ] Target height number input (blank = auto allowed)
    * [ ] Lock aspect ratio toggle
    * [ ] Resample filter select (small curated set)
    * [ ] Fit mode select (Exact, Fit within, Fill and crop)
  * [ ] Perspective and distort

    * [ ] Mode select (Keystone left, Keystone right, Free four-corner)
    * [ ] Interactive corner handles mapped to source pixels
    * [ ] Interpolation select (curated)
    * [ ] Heavy-operation behavior: Run button required or equivalent non-live recompute rule
  * [ ] Border, frame, drop shadow

    * [ ] Border size control
    * [ ] Border color picker
    * [ ] Frame size control
    * [ ] Shadow enabled toggle
    * [ ] Shadow offset X control
    * [ ] Shadow offset Y control
    * [ ] Shadow blur control
    * [ ] Shadow opacity control
  * [ ] Chroma key

    * [ ] Key color picker
    * [ ] Tolerance control
    * [ ] Feather control
    * [ ] Spill reduction control (shown only if supported)
    * [ ] Background preview select (Checkerboard, White, Black) affecting preview only
    * [ ] Output preserves alpha by default
  * [ ] Local contrast / clarity

    * [ ] Strength control
    * [ ] Radius control
    * [ ] Skin-safe toggle that caps strength
  * [ ] LUT-based color grading (CLUT)

    * [ ] Look preset select (local bundled presets)
    * [ ] Strength control (0 to 100)
    * [ ] No runtime download of presets
  * [ ] Stylize

    * [ ] Mode select (Sketch, Charcoal, Oil paint)
    * [ ] Amount control
    * [ ] Detail control
  * [ ] Motion effects

    * [ ] Mode select (Linear, Radial)
    * [ ] Strength control
    * [ ] Angle control (Linear)
    * [ ] Optional radial center bias control shown only if supported
  * [ ] Watermark and annotate

    * [ ] Text input (empty disables operation)
    * [ ] Position select (9-grid)
    * [ ] Font size control
    * [ ] Color picker
    * [ ] Opacity control
    * [ ] Shadow toggle
    * [ ] Shadow offset control
    * [ ] Shadow blur control
  * [ ] Content-aware resize (Liquid rescale)

    * [ ] Target width required
    * [ ] Target height required
    * [ ] Energy bias select (supported subset)
    * [ ] Heavy-operation behavior: explicit Run button required
    * [ ] Disabled with a clear message if unsupported in the build
  * [ ] Combined pipeline: Clean photo

    * [ ] Strength control scaling all steps
    * [ ] Extra sharpen toggle
    * [ ] Fixed pipeline order in processing and CLI
  * [ ] Combined pipeline: Portrait pop

    * [ ] Strength control
    * [ ] Vignette amount control
    * [ ] Fixed pipeline order in processing and CLI with sharpening cap behavior
  * [ ] Combined pipeline: Vintage film

    * [ ] Strength control
    * [ ] Grain control
    * [ ] Fixed pipeline order in processing and CLI
  * [ ] Combined pipeline: Comic poster

    * [ ] Colors control
    * [ ] Edge strength control
    * [ ] Dither mode select
    * [ ] Fixed pipeline order in processing and CLI
  * [ ] Combined pipeline: Teal-orange cinematic

    * [ ] Strength control
    * [ ] Contrast control
    * [ ] Vignette toggle
    * [ ] Fixed pipeline order in processing and CLI
  * [ ] Format and optimization (conditional)

    * [ ] Widget hidden or disabled with clear message if unsupported in the build
    * [ ] Format select (supported subset, at minimum PNG and JPEG if available)
    * [ ] Quality control shown only for lossy formats
    * [ ] Strip metadata toggle
    * [ ] Progressive toggle shown only if supported
    * [ ] Preview and output metadata reflect chosen format settings

After implementation is completed, create short, business level oriented high level readme file, describing what this project is about 
and what are the main features.