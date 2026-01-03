2026-01-02

WASM Package available at: 
./lib/magick-wasm-0.0.37/dist 
Do not use bundlers, do not use npm to install any additional modules. 
Repository: https://github.com/dlemstra/magick-wasm
(Package Author: Dirk Lemstra)

Main Specification

A00 Project purpose and value proposition

This project is a single-page, local-only image editing playground intended to demonstrate the practical capabilities of ImageMagick running in the browser via WebAssembly. The application lets a user load one image from their computer into the page (without uploading to any server), then explore a catalog of independent editing widgets. Each widget applies exactly one effect family (or one fixed multi-step pipeline) to its own copy of the source image and renders a preview. The widgets run asynchronously so that parameter changes do not block scrolling, input handling, or other widgets.

The application solves three concrete problems.

First, it provides a safe, privacy-preserving way to try image transformations without sending images to remote services. The user selects a file locally; the app processes it locally; the app provides outputs locally.

Second, it provides a hands-on learning environment for beginners. Each widget includes a short explanation of what the effect does in plain language, plus short explanations for each parameter so a novice can form an intuition without needing prior ImageMagick knowledge.

Third, it bridges interactive experimentation and real-world automation. Every widget must emit a copy-pastable ImageMagick command line that reproduces the widget’s current settings. This allows a user to prototype visually and then reuse the exact same operation in a terminal workflow.

The outcome of a successful implementation is a stable, deterministic, offline-capable demo that makes it obvious that ImageMagick operations can be driven from a web UI, computed asynchronously, and translated into CLI equivalents.

Repository reference for the WebAssembly library to be integrated into the project:

```text
https://github.com/dlemstra/magick-wasm
```

B00 In scope

The application is a static HTML, JavaScript, and CSS application that can be opened locally or served by any static file server. It uses the WebAssembly ImageMagick implementation from the referenced repository. It provides a top-of-page image ingestion control (drag and drop and file picker), a stable “Source Preview”, and a vertical catalog of widgets.

Each widget must satisfy all of the following.

It renders an output preview inside a fixed-size preview frame that does not resize the page layout.

It exposes parameters using modern built-in HTML5 controls where applicable (for example, range sliders, checkboxes, select dropdowns, color input, text input). Custom controls are allowed only when a built-in control cannot represent the interaction.

It processes asynchronously and is cancelable so that rapid knob changes do not cause the UI to freeze or produce stale outputs.

It is independent from other widgets. Widget parameter changes affect only that widget’s output, not any other widget.

It emits a deterministic, copy-pastable ImageMagick CLI command line representing the widget’s current settings.

The application must provide a per-widget download action that exports the widget output as a file without any server interaction.

The application must avoid network calls for any purpose beyond loading local static assets that ship with the app.

C00 Out of scope

No server-side processing. No uploading of images to remote servers.

No multi-step freeform pipeline editor where the user stacks arbitrary operations. The only combined operations are fixed pipeline widgets defined by this specification.

No collaborative features, user accounts, cloud storage, or persistent sharing links.

No requirement to match the pixel-exact output of any specific desktop ImageMagick build across all platforms. The primary requirement is internal consistency and correct mapping from UI parameters to the operations executed in the WebAssembly runtime, plus a reasonable CLI representation of the same intent.

No GPU-specific shader pipeline or WebGL-based filtering is required. Processing is performed by the WebAssembly ImageMagick runtime.

No “compare widget” is included. Comparison is handled implicitly via the source preview and the per-widget output preview.

D00 Primary user workflows

Workflow 1: Explore effects on a single image

The user opens the page, drags an image file onto the top drop zone, and releases. The page immediately displays the image in the Source Preview frame. The widget catalog becomes active. The user scrolls down and sees multiple widget cards, each with a title, a short description, and a preview frame. As each widget comes into view, it renders an output preview using default parameters. The user adjusts one widget’s knobs, observes the preview update after a short delay, and continues scrolling. Other widgets remain unaffected.

Workflow 2: Learn what a parameter does

The user opens the “Posterize and Dither” widget. They read a one-paragraph description explaining posterization and dithering in plain language. They change “Colors” from 16 to 4 and see the image become flatter and more stylized. They then enable dithering and see the flat regions gain patterned dots to simulate missing shades. The per-parameter short hints clarify what each knob controls.

Workflow 3: Reuse the effect in a terminal

The user adjusts “Unsharp Mask” parameters until the preview looks right. Below the widget, the app shows a command line. The user copies it and later pastes it into a terminal on a machine with ImageMagick installed, replacing input and output filenames as needed. The user expects the output to be conceptually the same as the widget output.

Workflow 4: Export locally

The user clicks the “Download” control on a widget. The app generates an output file in the chosen format and triggers a download. The filename includes the widget name and a timestamp. The user can also right-click the output preview image element and choose “Save image as…” when supported by the browser.

E00 Core concepts and mental model

The system has exactly one Source Image per session. The Source Image is the original file bytes selected by the user. The Source Image is immutable in the application logic.

A Widget is an independent effect module. It has its own parameters, its own processing job lifecycle, its own output image, and its own CLI command string. Widgets never modify the Source Image and never share state with other widgets beyond reading the Source Image.

A Processing Job is a single asynchronous attempt to render one widget output from the Source Image and the widget’s current parameters. Jobs are cancelable by staleness rules: when a newer job supersedes an older one, the older job’s result must be discarded and must not replace the UI.

Preview frames are layout-stable containers that display images with aspect-preserving scaling. All previews (source and widget outputs) must use the same visual rules so outputs are comparable.

F00 UI layout and presentation rules

The page layout is vertically stacked and scrollable.

At the top of the page, the Image Ingestion Area contains a drag-and-drop target and a file picker button. The drag-and-drop target must show a visible hover state while a file is dragged over it. The file picker must accept common image types (at minimum PNG, JPEG, WebP). If the user selects a non-image file, the app must reject it with a clear message.

Below the ingestion area is the Source Preview Area. It shows the currently loaded Source Image in a fixed-size preview frame. The Source Preview frame must never change its size based on the image dimensions.

Below the Source Preview Area is the Widget Catalog. Each widget is rendered as a card with the following structure.

Card header: widget name and a one-sentence purpose.

Card body: a preview frame showing the widget output.

Card controls: parameter controls and their short per-control hints.

Card footer: the generated ImageMagick CLI command line in a copy-friendly format and a “Copy” action. The footer also contains a “Download” action and an output format selector if the widget supports multiple output formats.

The page must remain usable on narrow screens. On small widths, controls may stack vertically. The preview frames must maintain consistent sizing and must not overflow horizontally.

G00 Interaction rules and consistency

Before a Source Image is loaded, all widget controls must be disabled and each widget preview frame must show a placeholder state indicating that an image is required.

When a Source Image is loaded, widgets become enabled. Each widget becomes eligible to process only when it is considered visible by lazy rules (defined in I00). A widget may also process when the user explicitly expands its controls or interacts with it.

For parameter changes, the widget must not recompute on every input event synchronously. It must debounce and process asynchronously. The standard debounce is 150 ms after the last change. A widget may choose a larger debounce for heavy operations (defined per widget).

While a widget is processing, the widget must show a non-intrusive “Processing” indicator and must keep showing the previous valid output until the new output is ready. If no prior output exists, it shows a neutral placeholder inside the preview frame.

If processing fails, the widget must display an error message inside the card, keep the last valid output if available, and provide a “Reset to defaults” action.

H00 Accessibility and usability constraints

All interactive controls must be keyboard reachable and have accessible labels.

Range sliders must expose their current value numerically (for example in a value label adjacent to the slider) because a novice needs precision and feedback.

Select dropdowns must include plain-language option names, not internal ImageMagick option names.

Color pickers must show both a color input and a hex string field.

Error messages must be readable and specific, stating what failed and what the user can do next.

The application must not disable the browser context menu globally. Right-click should behave normally.

I00 Lazy processing and visibility rules

A widget is considered eligible to auto-render when either condition is true.

Condition 1: At least 25 percent of the widget card is visible in the viewport.

Condition 2: The user expands the widget controls area or interacts with any control inside the widget.

When eligible, a widget must render once using default parameters (unless it already has an output for the current Source Image and current parameters).

When not eligible, the widget must not start new processing jobs. It may display a cached output from prior eligibility.

When the Source Image changes, all widget outputs must be invalidated and considered stale. Widgets should not recompute until they become eligible again, to preserve responsiveness.

J00 Application states

The application has a top-level state machine.

State: NoSource
Meaning: No image loaded. Widgets disabled.

State: SourceLoaded
Meaning: Source bytes are available and Source Preview is visible. Widgets enabled but lazy.

State: ProcessingWasmUnavailable
Meaning: The WebAssembly runtime failed to load or initialize. Widgets must show a global error and must not attempt to process.

State: SourceError
Meaning: The selected file could not be read or decoded. The ingestion area shows the error and the app remains in NoSource.

Each widget has an internal state.

State: IdleDisabled
Meaning: No source, control disabled.

State: IdleReady
Meaning: Source exists but widget has not processed yet.

State: Queued
Meaning: A job is scheduled due to eligibility or parameter changes.

State: Running
Meaning: A job is executing in the background.

State: Ready
Meaning: Output is available for current parameters.

State: Error
Meaning: Last attempted job failed.

K00 Technical stack and runtime environment

The app is a static application composed of HTML, CSS, and JavaScript.

JavaScript must be written as ES modules.

The WebAssembly ImageMagick library is integrated as a local dependency, vendored into the project directory. The application must not depend on remote CDNs. All assets needed to run offline must be bundled in the project directory.

The app must be runnable by opening the HTML via a local static server. If the browser requires a server context for WebAssembly loading, the project must include a minimal instruction file stating that a local static server is required, but the application itself remains static.

L00 Threading model and non-blocking requirement

All ImageMagick processing must run off the main UI thread. The required implementation approach is to run the WebAssembly ImageMagick runtime in a Web Worker (or equivalent off-main-thread execution model supported by the chosen integration) and communicate via message passing.

The main thread is responsible for UI rendering, user input, debouncing, job scheduling, cancellation by staleness, and displaying results.

A widget job must never block input handling. If the worker is busy, jobs queue at the scheduler and must be deduplicated by “latest wins” rules.

M00 Image ingestion and decoding

The ingestion control accepts drag-and-drop and file picker.

On file selection, the app reads the file bytes into memory. The Source Image is stored as raw bytes plus metadata: filename, mime type (if provided), byte length.

The Source Preview is rendered by decoding the file in the browser. If decoding fails, the app shows a SourceError and clears SourceLoaded state.

The app must compute basic derived metadata: pixel width, pixel height, and megapixels. This metadata is displayed near the Source Preview.

The app must enforce a maximum pixel budget to avoid crashes. The default maximum is 40 megapixels (for example 8000 x 5000). If the image exceeds this, the app must reject it with an error that suggests resizing the image first. This limit may be adjustable in a configuration constant.

N00 Preview rendering and layout stability rules

All previews (source and widget outputs) are displayed inside a fixed-size preview frame. The frame size is constant across widgets and does not depend on the image dimensions.

The image must be scaled to fit within the frame while preserving aspect ratio (“contain”). Empty space must be shown as a neutral background.

The preview frame must not cause layout reflow when the image changes. The frame height is fixed, not auto.

The preview should be rendered as an img element when possible to allow right-click “save image as” behavior. If canvas is required for intermediate rendering, the widget must convert the result to a blob URL and set it as img src.

O00 Output generation, formats, and download behavior

Each widget must provide a “Download” action.

On download, the widget requests the worker to generate an output file blob corresponding to the widget output. The user may select an output format. The format options must be limited to formats that are supported by the integrated WebAssembly ImageMagick build. If the app cannot reliably discover supported formats at runtime, the app must provide a conservative fixed set (PNG and JPEG at minimum) and hide unsupported options.

The download filename format is:

`<sourceBaseName>__<widgetSlug>__<YYYYMMDD-HHMMSS>.<ext>`

The widget must also display output metadata: output dimensions, output file size in bytes, and output format.

P00 Command line generation contract

Every widget must output a copy-pastable ImageMagick command line that represents the widget’s current parameters.

The command line must be complete, not a fragment. It must include an input placeholder and an output placeholder. The required template is:

`magick "INPUT" <options> "OUTPUT"`

The option ordering must be stable and deterministic. Each widget defines its own option order and must keep it constant.

The UI must show the command line in a monospaced block and provide a one-click copy action that copies exactly the visible command string.

The command line must reflect only the widget operation. It must not include unrelated operations such as resizing to preview size unless the widget’s purpose is resizing.

If a widget includes optional steps based on toggles, the command line must include or omit options accordingly, never leaving placeholder options in place.

If a widget is a no-op (for example text watermark widget with empty text), the command line must still be valid and must represent a no-op operation, or the widget must clearly indicate “No command available because no operation is applied” and disable copy. The preferred behavior is to represent a no-op as:

`magick "INPUT" "OUTPUT"`

Q00 Processing scheduler, debouncing, and cancellation

Each widget maintains an internal parameter version counter. Any parameter change increments the version.

A widget job is identified by the tuple: SourceImageId, WidgetId, ParamVersion.

Debounce rule: the widget schedules a job 150 ms after the last parameter change. During debounce, it is in Queued state.

Latest wins rule: when a new job is scheduled, any older queued or running job for the same widget becomes stale. The worker may not be able to truly cancel CPU work; however, the main thread must discard stale results. A worker response must include the job identifier, and the main thread must ignore responses that do not match the widget’s latest job identifier.

Concurrency rule: the worker processes one job at a time by default. The scheduler may allow limited parallelism only if the integrated runtime supports safe parallel instances. The default requirement is single-worker, serialized jobs to avoid memory spikes.

R00 Error handling and diagnostics

Error categories.

File rejection errors: unsupported type, too large (bytes), too many pixels, decode failure.

Runtime errors: WebAssembly load failure, worker initialization failure.

Processing errors: ImageMagick operation failure, unsupported option, out-of-memory, timeouts.

For each error, the UI must show a short message and a suggested user action.

Each widget must include a “Reset to defaults” control that restores parameters to defaults and schedules a render.

The app must include a developer-friendly diagnostics panel (collapsed by default) that shows runtime info: wasm loaded state, worker ready state, last error string, and a rolling log of job start and completion events. This panel is for implementers and does not need elaborate styling.

S00 Widget framework and card contract

All widgets are defined by a shared contract.

Identity: id, name, short description, category.

Defaults: default parameter values.

Controls: a set of parameters with metadata: type (range, checkbox, select, color, text), label, short hint, min, max, step, default, and value formatting.

Processing function: a function that converts Source bytes and parameters into output bytes using ImageMagick in the worker.

CLI function: a function that converts parameters into a CLI option string appended to `magick "INPUT"`.

Debounce override: optional per-widget debounce time and optional “Run” button requirement for heavy operations.

The card UI must show, in order: name, short description, preview, controls, CLI block, actions (Copy, Download).

T00 Widget catalog and required widgets

The implementation must include all widgets in U00 through AM00. Widgets must appear in the catalog in the order defined by this specification to keep the experience predictable for users and for test automation.

Each widget section below defines.

What it does: a novice-friendly paragraph.

Parameters: each parameter has a short description and a clear range.

Processing notes: any heavy-job rules.

CLI template: the required CLI representation. The implementer must map the parameters to the correct ImageMagick options available in the WebAssembly build. If an option is unavailable in the WebAssembly build, the widget must be disabled and must show “Unavailable in this build” with no processing and no CLI.

U00 Auto-fix and hygiene

What it does: This widget fixes common “why does this look wrong” issues. It applies the camera’s embedded rotation so the image is upright, converts colors into a standard display space so colors look consistent, and optionally removes hidden metadata such as camera details. It is useful as a first step before any creative edits.

Parameters.

Auto-orient (checkbox, default on). Rotates and flips the image based on embedded orientation metadata.

Convert to sRGB (checkbox, default on). Converts the image into sRGB for consistent display.

Strip metadata (checkbox, default off). Removes metadata to reduce file size and remove hidden info.

Normalize (select: Off, Mild, Strong; default Off). “Normalize” increases overall contrast by stretching tones to use more of the available range. Mild is subtle; Strong is more aggressive.

Processing notes: standard debounce 150 ms.

CLI template (option order fixed: auto-orient, colorspace, strip, normalize):

```text
magick "INPUT" -auto-orient -colorspace sRGB -strip -normalize "OUTPUT"
```

Rules: include only options enabled by parameters. If Normalize is Off, omit normalize options entirely.

V00 Levels and gamma

What it does: This widget remaps brightness values. “Black point” makes dark areas darker by pushing more pixels to black. “White point” makes bright areas brighter by pushing more pixels to white. “Gamma” changes midtones without moving pure black and pure white much. It is useful to fix images that look washed out or too dark.

Parameters.

Black point (range 0 to 50 percent, step 1, default 0). Higher values make shadows darker and can lose detail in dark areas.

White point (range 50 to 100 percent, step 1, default 100). Lower values make highlights brighter and can lose detail in bright areas.

Gamma (range 0.2 to 3.0, step 0.05, default 1.0). Values below 1 brighten midtones; values above 1 darken midtones.

Channel (select: RGB, Red, Green, Blue; default RGB). Limits the adjustment to specific channels for color correction.

Processing notes: standard debounce.

CLI template (use the appropriate ImageMagick level operator consistent with the chosen mapping; option order: channel selection, black/white, gamma):

```text
magick "INPUT" <CHANNEL_PREFIX> -level <BLACK>,<WHITE> -gamma <GAMMA> "OUTPUT"
```

Rules: CHANNEL_PREFIX is empty for RGB or uses the ImageMagick channel selection syntax supported by the build. Black and White values are expressed in percent. If the implementation uses a combined operator that accepts gamma in one option, it must still keep the same visible parameter meanings and produce an equivalent CLI.

W00 Brightness and contrast

What it does: This widget changes how light and dark the image appears. Brightness shifts overall lightness. Contrast increases the difference between light and dark regions so the image looks less flat.

Parameters.

Brightness (range -100 to +100, step 1, default 0). Negative darkens; positive brightens.

Contrast (range -100 to +100, step 1, default 0). Negative reduces contrast; positive increases contrast.

Processing notes: standard debounce.

CLI template (option order: brightness/contrast):

```text
magick "INPUT" -brightness-contrast <BRIGHTNESS>x<CONTRAST> "OUTPUT"
```

X00 White balance and tint

What it does: This widget changes the color “temperature” of the image. Warmer makes the image more yellow/orange (like indoor light). Cooler makes it more blue (like shade). Tint shifts toward green or magenta, which helps remove color casts.

Parameters.

Temperature (range -100 to +100, step 1, default 0). Negative cools; positive warms.

Tint (range -100 to +100, step 1, default 0). Negative shifts green; positive shifts magenta.

Strength (range 0 to 100, step 1, default 100). Scales the effect so small changes are easy.

Processing notes: standard debounce.

CLI template: must represent the chosen mapping (for example via color matrix or modulation). The command must be deterministic and must place options in the fixed order: temperature, tint, strength.

```text
magick "INPUT" <WHITE_BALANCE_OPTIONS_DERIVED_FROM_PARAMS> "OUTPUT"
```

Rule: the implementation must document in code comments how the mapping is computed so CLI remains stable. If the build cannot support the required operations, disable the widget.

Y00 Color tuning (Hue, saturation, brightness)

What it does: This widget changes overall color intensity and hue. Saturation makes colors more vivid or more muted. Hue rotates colors around the color wheel (for example reds become oranges). Brightness changes overall lightness.

Parameters.

Brightness (range 0 to 200, step 1, default 100). 100 means no change.

Saturation (range 0 to 200, step 1, default 100). 100 means no change.

Hue rotation (range -180 to +180 degrees, step 1, default 0). 0 means no change.

Processing notes: standard debounce.

CLI template (option order: modulate):

```text
magick "INPUT" -modulate <BRIGHTNESS>,<SATURATION>,<HUE> "OUTPUT"
```

Rule: Hue is expressed in the units required by the chosen operator. The UI must make the unit clear.

Z00 Smart contrast (Sigmoidal contrast)

What it does: This widget increases contrast in a way that keeps the darkest and brightest extremes from becoming harsh too quickly. It can make an image feel clearer and more “finished” without crushing blacks or blowing highlights as easily as a simple contrast slider.

Parameters.

Amount (range 0 to 20, step 0.1, default 0). Higher increases contrast.

Midpoint (range 0 to 100 percent, step 1, default 50). Controls which brightness level is most affected.

Protect highlights (checkbox, default on). When on, caps the strongest highlight push to reduce clipping.

Processing notes: standard debounce.

CLI template (option order: protect rule options if any, then sigmoidal):

```text
magick "INPUT" -sigmoidal-contrast <AMOUNT>x<MIDPOINT>% "OUTPUT"
```

Rule: if Protect highlights is implemented via additional steps, those steps must precede sigmoidal in the CLI and must be documented in code comments.

AA00 Sharpness (Unsharp mask)

What it does: This widget sharpens edges to make details look clearer. It works by boosting edge contrast. Too much sharpening causes halos and noise, so the controls are designed to stay in a usable range.

Parameters.

Radius (range 0 to 10, step 0.1, default 1.0). The size of edges to affect.

Sigma (range 0.1 to 5.0, step 0.1, default 1.0). Blur amount used in edge detection.

Amount (range 0 to 5.0, step 0.1, default 1.0). Strength of sharpening.

Threshold (range 0 to 20, step 1, default 0). Ignores small differences; higher reduces sharpening of noise.

Processing notes: standard debounce.

CLI template (option order: unsharp):

```text
magick "INPUT" -unsharp <RADIUS>x<SIGMA>+<AMOUNT>+<THRESHOLD> "OUTPUT"
```

AB00 Denoise

What it does: This widget reduces random speckles and grain. It can make low-light images look smoother. Too much denoise can smear fine details, so the controls encourage moderate use.

Parameters.

Strength (range 0 to 10, step 0.1, default 0). Higher removes more noise.

Passes (range 1 to 3, step 1, default 1). More passes increase smoothing but can reduce detail.

Preserve edges (checkbox, default on). When on, uses a denoise approach that reduces edge loss if supported by the build.

Processing notes: standard debounce 250 ms.

CLI template (option order: denoise, repeated passes if selected):

```text
magick "INPUT" -noise <STRENGTH> "OUTPUT"
```

Rule: If the implementation uses a different denoise operator, it must still expose Strength and Passes with the same visible behavior and must output the correct corresponding CLI.

AC00 Blur (Gaussian)

What it does: This widget softens the image. It is useful for removing detail, creating backgrounds, or simulating shallow focus when combined with masks in other widgets.

Parameters.

Radius (range 0 to 20, step 0.1, default 0).

Sigma (range 0.1 to 10.0, step 0.1, default 1.0).

Processing notes: standard debounce.

CLI template:

```text
magick "INPUT" -gaussian-blur <RADIUS>x<SIGMA> "OUTPUT"
```

AD00 Vignette and tilt-shift

What it does: Vignette darkens the corners to draw attention to the center. Tilt-shift simulates a shallow band of focus by keeping a horizontal band sharp while blurring above and below it. This can create a “miniature” look.

Parameters.

Mode (select: Vignette only, Tilt-shift only, Both; default Both).

Vignette strength (range 0 to 100, step 1, default 20). Higher darkens edges more.

Vignette radius (range 0 to 100, step 1, default 50). Higher spreads the vignette wider.

Focus center Y (range 0 to 100 percent, step 1, default 50). Vertical position of the sharp band.

Focus band height (range 5 to 100 percent, step 1, default 30). Height of the sharp band.

Feather (range 0 to 100, step 1, default 50). Softness of transition between sharp and blurred.

Blur strength (range 0 to 10, step 0.1, default 2.0). Blur outside the focus band.

Processing notes: debounce 300 ms due to multi-step pipeline.

CLI template: must be a fixed order pipeline. Order is tilt-shift steps first, then vignette.

```text
magick "INPUT" <TILT_SHIFT_PIPELINE_OPTIONS> <VIGNETTE_OPTIONS> "OUTPUT"
```

Rule: the widget must output the full pipeline in one command string, not multiple commands.

AE00 Edge and emboss

What it does: This widget highlights edges or creates a raised “embossed” look. Edge detection makes outlines stand out. Emboss makes the image look like it is carved or stamped.

Parameters.

Mode (select: Edge detect, Emboss; default Edge detect).

Strength (range 0 to 100, step 1, default 50). Higher makes edges or emboss effect stronger.

Detail (range 0 to 100, step 1, default 50). Adjusts how fine or broad the edges appear.

Processing notes: standard debounce 250 ms.

CLI template (option order: mode operator):

```text
magick "INPUT" <EDGE_OR_EMBOSS_OPTIONS> "OUTPUT"
```

AF00 Posterize and dither

What it does: Posterize reduces the number of distinct colors so the image looks flatter and more graphic. Dithering adds patterns of pixels to fake missing shades, which can make posterized images look smoother or more stylized.

Parameters.

Colors (range 2 to 64, step 1, default 16). Lower means flatter and more stylized.

Dither (checkbox, default off). Enables dithering during quantization.

Dither method (select, default Floyd-Steinberg). Available methods must reflect what the build supports. If unsure, provide: Off, Ordered, Floyd-Steinberg.

Strength (range 0 to 100, step 1, default 100). Scales dithering intensity if supported; otherwise hide this control.

Processing notes: debounce 350 ms due to heavier quantization.

CLI template (option order: posterize/quantize, dither settings):

```text
magick "INPUT" -posterize <COLORS> <DITHER_OPTIONS> "OUTPUT"
```

Rule: If the implementation uses `-colors` or a quantization operator rather than `-posterize`, the widget must still expose “Colors” with the same meaning and must emit the correct corresponding CLI.

AG00 Threshold and duotone

What it does: Threshold turns the image into black and white by picking a cutoff: pixels brighter than the cutoff become white, darker become black. Duotone maps the image into two chosen colors instead of pure black and white, which creates a stylized two-ink print look.

Parameters.

Mode (select: Threshold, Duotone; default Threshold).

Threshold level (range 0 to 100 percent, step 1, default 50). Higher makes more pixels become “dark”.

Light color (color picker, default #ffffff). Used in Duotone mode as the “bright” color.

Dark color (color picker, default #000000). Used in Duotone mode as the “dark” color.

Feather (range 0 to 20, step 1, default 0). Softens the boundary by adding a small smoothing step before thresholding.

Processing notes: debounce 250 ms.

CLI template (option order: optional feather step, then threshold, then optional color mapping):

```text
magick "INPUT" <OPTIONAL_FEATHER_STEP> -threshold <LEVEL>% <OPTIONAL_DUOTONE_MAPPING> "OUTPUT"
```

Rule: Duotone mapping must be implemented deterministically and must be representable in CLI (for example via color lookup or a gradient map approach supported by the build).

AH00 Pixelate and mosaic

What it does: Pixelate turns the image into large blocks so details are hidden. This is useful for anonymizing faces or creating retro pixel art effects.

Parameters.

Block size (range 2 to 100, step 1, default 10). Higher makes larger blocks.

Mode (select: Pixelate, Mosaic; default Pixelate). Mosaic may use different resampling or patterning if supported.

Preserve edges (checkbox, default off). If supported, reduces edge smearing.

Processing notes: standard debounce 250 ms.

CLI template: typically implemented as downscale then upscale with nearest-neighbor, or equivalent.

```text
magick "INPUT" <PIXELATE_PIPELINE_OPTIONS> "OUTPUT"
```

Rule: The CLI must show both scale steps explicitly if that is the implementation approach.

AI00 Crop and straighten

What it does: Crop cuts out a rectangular region. Straighten rotates the image slightly to fix a tilted horizon. This widget helps users frame the subject and correct small alignment issues.

Parameters.

Crop rectangle (interactive selection on the widget preview). Must be adjustable by dragging corners and edges.

Rotation (range -10 to +10 degrees, step 0.1, default 0). Small rotations only.

Background fill (color picker, default #000000). Color used for empty corners after rotation.

Auto-trim (checkbox, default off). If enabled, trims uniform borders after rotation if supported.

Processing notes: interactive crop changes should debounce 200 ms. Rotation changes debounce 200 ms.

CLI template (option order: rotate, optional trim, crop). Rotation must occur before crop unless the UI explicitly indicates otherwise.

```text
magick "INPUT" -rotate <DEGREES> <OPTIONAL_TRIM> -crop <WxH+X+Y> +repage "OUTPUT"
```

Rule: Crop coordinates must be based on the original image coordinate space, not the preview scale. The implementation must correctly map preview selection to source pixels.

AJ00 Resize and resample

What it does: Resize changes the image dimensions. Resampling method affects how sharp or smooth the result looks. This widget is useful for preparing images for the web or for specific size requirements.

Parameters.

Target width (number input, default source width). Must allow blank to mean “auto”.

Target height (number input, default source height). Must allow blank to mean “auto”.

Lock aspect ratio (checkbox, default on). If on, changing one dimension updates the other to preserve aspect.

Resample filter (select, default “Auto”). Options must be a small curated set (for example: Nearest, Triangle, Lanczos, Mitchell) depending on support.

Fit mode (select: Exact, Fit within, Fill and crop; default Fit within). Defines how dimensions are applied when both width and height are specified.

Processing notes: debounce 200 ms.

CLI template (option order: filter, resize):

```text
magick "INPUT" <OPTIONAL_FILTER> -resize <GEOMETRY> "OUTPUT"
```

Rule: The geometry string must reflect Fit mode. For example, Fit within uses a constrain flag, Fill and crop uses resize then crop, and the CLI must show those steps explicitly.

AK00 Perspective and distort

What it does: This widget changes the image shape to correct perspective (for example a photographed document) or to create a skewed effect. Users adjust corner points to “pull” the image into a new shape.

Parameters.

Mode (select: Keystone left, Keystone right, Free four-corner; default Keystone left).

Corner handles (interactive). In Free mode, four corners are draggable.

Interpolation (select, default Auto). Curated options.

Processing notes: heavy. Require an explicit “Run” button by default. While dragging handles, show an overlay preview outline, but do not recompute until the user releases or clicks Run. Debounce 400 ms after drag release if Run is not required.

CLI template:

```text
magick "INPUT" -distort Perspective <MAPPING_COORDS> "OUTPUT"
```

Rule: Coordinates must be in source pixel space and must be emitted deterministically in the same order each time.

AL00 Border, frame, drop shadow

What it does: This widget adds a border or frame and optionally a shadow to make the image look like a card or print. It is useful for presentation and quick styling.

Parameters.

Border size (range 0 to 100 px, step 1, default 0).

Border color (color picker, default #ffffff).

Frame size (range 0 to 100 px, step 1, default 0). If frame is different from border in implementation, describe it in UI text.

Shadow enabled (checkbox, default off).

Shadow offset X (range -50 to 50 px, step 1, default 10).

Shadow offset Y (range -50 to 50 px, step 1, default 10).

Shadow blur (range 0 to 50 px, step 1, default 15).

Shadow opacity (range 0 to 100 percent, step 1, default 50).

Processing notes: debounce 250 ms.

CLI template: must show the border/frame addition and shadow composition explicitly and in fixed order.

```text
magick "INPUT" <BORDER_FRAME_OPTIONS> <SHADOW_COMPOSITE_OPTIONS> "OUTPUT"
```

AM00 Chroma key

What it does: This widget removes a background color (like green screen) by making that color transparent. It is useful for cutting out a subject photographed against a solid background.

Parameters.

Key color (color picker, default #00ff00). The color to remove.

Tolerance (range 0 to 100, step 1, default 10). Higher removes a wider range of similar colors.

Feather (range 0 to 50, step 1, default 5). Softens edges to avoid jagged cutouts.

Spill reduction (range 0 to 100, step 1, default 0). Reduces green tint on the subject if supported.

Background preview (select: Checkerboard, White, Black; default Checkerboard). Only affects how transparency is displayed, not output unless user exports with a background fill option.

Processing notes: debounce 300 ms.

CLI template:

```text
magick "INPUT" <CHROMA_KEY_OPTIONS> "OUTPUT"
```

Rule: Output must preserve alpha (use PNG or another alpha-capable format by default).

AN00 Local contrast / clarity

What it does: This widget increases contrast on small details rather than across the whole image. It can make textures and edges feel clearer without making the entire image harsher.

Parameters.

Strength (range 0 to 100, step 1, default 0).

Radius (range 0 to 20, step 1, default 5). Larger radius affects broader features.

Skin-safe (checkbox, default on). When on, caps Strength to a conservative maximum (for example 60) to reduce harshness.

Processing notes: debounce 300 ms.

CLI template:

```text
magick "INPUT" <LOCAL_CONTRAST_OPTIONS> "OUTPUT"
```

AO00 LUT-based color grading (CLUT)

What it does: This widget applies a preset “look” to the image, like a filter pack. It is useful for quickly getting a consistent style without manually adjusting many sliders.

Parameters.

Look preset (select, default “None”). Presets are bundled as local assets shipped with the app.

Strength (range 0 to 100, step 1, default 100). 0 means original image, 100 means full look.

Processing notes: debounce 300 ms. Preset change triggers immediate queued render.

CLI template: must represent applying the CLUT and blending with original to match Strength.

```text
magick "INPUT" <APPLY_CLUT_AND_BLEND_OPTIONS> "OUTPUT"
```

Rule: Preset assets must be local and must not be downloaded at runtime.

AP00 Stylize (Sketch, charcoal, oil paint)

What it does: This widget turns photos into obvious artistic styles. It is intended for demonstration and for novice exploration of “big change” effects.

Parameters.

Mode (select: Sketch, Charcoal, Oil paint; default Sketch).

Amount (range 0 to 100, step 1, default 50). Higher makes the style more intense.

Detail (range 0 to 100, step 1, default 50). Higher preserves finer detail when supported.

Processing notes: debounce 400 ms due to heavier compute.

CLI template:

```text
magick "INPUT" <MODE_SPECIFIC_STYLIZE_OPTIONS> "OUTPUT"
```

AQ00 Motion effects (Linear blur, radial blur)

What it does: This widget adds directional blur (like movement) or radial blur (like spinning). It is useful for creative emphasis and for showcasing non-trivial filtering.

Parameters.

Mode (select: Linear, Radial; default Linear).

Strength (range 0 to 100, step 1, default 0). Higher increases blur.

Angle (range 0 to 360 degrees, step 1, default 0). Linear mode direction.

Radial center bias (range -100 to 100, step 1, default 0). Optional; shifts perceived center if supported. Hide if unsupported.

Processing notes: debounce 300 ms.

CLI template:

```text
magick "INPUT" <MOTION_OR_RADIAL_BLUR_OPTIONS> "OUTPUT"
```

AR00 Watermark and annotate

What it does: This widget adds text on top of the image for labeling, attribution, or watermarking.

Parameters.

Text (text input, default empty). Empty text means no operation.

Position (select 9-grid, default Bottom right).

Font size (range 8 to 200 px, step 1, default 32).

Color (color picker, default #ffffff).

Opacity (range 0 to 100 percent, step 1, default 60).

Shadow (checkbox, default on).

Shadow offset (range 0 to 20 px, step 1, default 2).

Shadow blur (range 0 to 20 px, step 1, default 4).

Processing notes: debounce 200 ms.

CLI template (option order: fill, font, pointsize, gravity, annotate, optional shadow):

```text
magick "INPUT" <ANNOTATE_OPTIONS> "OUTPUT"
```

Rule: If Text is empty, disable processing and disable copy/download with a message “Enter text to enable watermark.”

AS00 Content-aware resize (Liquid rescale)

What it does: This widget resizes an image while trying to preserve important content. It can shrink backgrounds while keeping the main subject less distorted. It is computationally expensive and is included to showcase advanced capabilities.

Parameters.

Target width (number input, required).

Target height (number input, required).

Energy bias (select: Balanced, Protect edges, Protect faces; default Balanced). If only some modes are possible, provide only supported ones.

Processing notes: must require explicit “Run” button. No live recompute while typing. Show an estimated cost message “This operation may take longer.”

CLI template:

```text
magick "INPUT" -liquid-rescale <WxH> "OUTPUT"
```

Rule: If unsupported by the build, disable the widget with “Unavailable in this build.”

AT00 Combined pipeline: Clean photo

What it does: This is a one-knob “make it look clean and ready to share” pipeline. It reduces noise slightly, increases contrast gently, sharpens mildly, and adds a small color boost.

Parameters.

Strength (range 0 to 100, step 1, default 50). Scales all steps together.

Extra sharpen (checkbox, default off). Adds a bit more sharpening at high Strength.

Processing notes: debounce 400 ms.

CLI template: fixed order pipeline. The emitted CLI must include each step explicitly in the chosen order.

```text
magick "INPUT" <DENOISE_STEP> <SMART_CONTRAST_STEP> <SHARPEN_STEP> <COLOR_BOOST_STEP> "OUTPUT"
```

Rule: The mapping from Strength to each step must be monotonic and must be documented in code comments.

AU00 Combined pipeline: Portrait pop

What it does: This pipeline makes a portrait look clearer and more focused. It smooths noise lightly, enhances micro-contrast conservatively, sharpens with a cap to reduce halos, and adds a subtle vignette.

Parameters.

Strength (range 0 to 100, step 1, default 50).

Vignette amount (range 0 to 100, step 1, default 20).

Processing notes: debounce 450 ms.

CLI template:

```text
magick "INPUT" <MILD_DENOISE> <LOCAL_CONTRAST> <CAPPED_SHARPEN> <VIGNETTE> "OUTPUT"
```

AV00 Combined pipeline: Vintage film

What it does: This pipeline creates a faded, warm, film-like look. Blacks are lifted slightly, colors are softened, a small grain is added, and corners are darkened.

Parameters.

Strength (range 0 to 100, step 1, default 50).

Grain (range 0 to 100, step 1, default 20).

Processing notes: debounce 450 ms.

CLI template:

```text
magick "INPUT" <LIFT_BLACKS_STEP> <SATURATION_REDUCE_STEP> <TONE_SPLIT_STEP> <GRAIN_STEP> <VIGNETTE_STEP> "OUTPUT"
```

AW00 Combined pipeline: Comic poster

What it does: This pipeline produces a bold, graphic look by reducing colors and emphasizing edges. It is designed to make the effect obvious with a small set of controls.

Parameters.

Colors (range 2 to 32, step 1, default 8).

Edge strength (range 0 to 100, step 1, default 50).

Dither mode (select: Off, Ordered, Floyd-Steinberg; default Off).

Processing notes: debounce 500 ms.

CLI template:

```text
magick "INPUT" <EDGE_STEP> <POSTERIZE_STEP> <DITHER_STEP> "OUTPUT"
```

AX00 Combined pipeline: Teal-orange cinematic

What it does: This pipeline applies a popular cinematic color grading style by pushing shadows cooler and highlights warmer, plus a controlled contrast increase.

Parameters.

Strength (range 0 to 100, step 1, default 50).

Contrast (range 0 to 100, step 1, default 50).

Vignette (checkbox, default off).

Processing notes: debounce 450 ms.

CLI template:

```text
magick "INPUT" <SMART_CONTRAST_STEP> <TEAL_ORANGE_BALANCE_STEP> <OPTIONAL_VIGNETTE_STEP> "OUTPUT"
```

AY00 Format and optimization (conditional widget)

What it does: This widget converts the image to a chosen output format and adjusts quality and metadata to reduce file size. It is practical for preparing images for the web.

This widget is included only if the WebAssembly ImageMagick build supports the required encoders. If not, the widget must be hidden entirely (preferred) or shown as disabled with a clear “Unavailable in this build” message.

Parameters.

Format (select: PNG, JPEG, WebP, plus any supported; default PNG).

Quality (range 1 to 100, step 1, default 85). Shown only for lossy formats.

Strip metadata (checkbox, default on).

Progressive (checkbox, default off). Shown only if supported for the chosen format.

Processing notes: debounce 250 ms.

CLI template:

```text
magick "INPUT" <FORMAT_AND_QUALITY_OPTIONS> "OUTPUT"
```

Rule: This widget’s preview output must reflect the chosen format settings as much as possible, but the primary observable outcome is file size and download behavior.

AZ00 Modern HTML control requirements

All sliders must use input type="range" with visible numeric value.

All colors must use input type="color" plus a synchronized text field for hex entry.

All booleans must use checkbox controls.

All enumerations must use select dropdowns.

All numeric fields must use input type="number" with min, max, and step constraints.

Only crop and perspective widgets may use custom pointer interactions for handles. These interactions must be implemented in a way that remains usable on touch devices.

BA00 Storage, persistence, and reset behavior

The application is not required to persist state across page reloads.

Within a single session, the app may store widget parameter states in memory. When a new Source Image is loaded, widget parameters must remain as the user last set them, but outputs are invalidated and recomputed lazily. This makes it easy to apply the same settings to multiple images.

The app must provide a global “Reset all widgets” action that resets all widget parameters to defaults and clears outputs. This action must require a confirmation click to avoid accidental loss of tuned settings.

BB00 Testing and acceptance criteria

A test image loaded into the app must appear in the Source Preview without changing the page layout.

Scrolling the widget catalog with no interaction must remain responsive, and widgets must render as they become visible.

Rapid slider changes in one widget must not lock the UI and must not update other widgets.

For any widget, the displayed CLI string must change deterministically with parameter changes and must be copyable via the Copy action.

Download must produce a local file whose dimensions and format match the widget’s output metadata.

If the WebAssembly runtime fails to load, the app must show a clear global error and must not crash.

If a widget operation is unsupported in the build, the widget must be disabled with a clear message and must not attempt processing.

BC00 Implementation remarks for the coding agent

The implementer must treat this document as the single source of truth for behavior. Where an ImageMagick option name or syntax differs across environments, the implementer must prioritize correct behavior in the WebAssembly runtime and output the closest correct CLI representation consistent with the same parameter meanings and operation order.

The implementer must document in code comments any non-trivial parameter-to-option mapping (for example temperature/tint mapping, duotone mapping, clarity mapping, teal-orange balance mapping) so that future revisions of this specification can refine CLI outputs without guesswork.


