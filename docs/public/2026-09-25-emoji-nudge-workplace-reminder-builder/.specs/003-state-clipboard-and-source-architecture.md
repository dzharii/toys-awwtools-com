# A00 Files and responsibility

index.html supplies the semantic shell and generated baseline options. catalog.js is the authoritative vocabulary. app.js owns state and rendering. styles.css owns appearance, container breakpoints, platform enhancement, and reduced motion. Python maintenance scripts run independently of the browser and keep the distributable editable with standard tools.

# B00 State schema

The six component keys are h, e, g, c, f, and x. They represent Head, Expression, Gesture, Clothing, Footwear, and Context. The remaining fields are size and spacing. Defaults are cap, request, request-hands, shorts, ballet, none, 44, and normal. Valid sizes are 32, 38, 44, 50, and 56. Spacing multipliers are 1.0, 1.06, and 1.2.

localStorage uses emoji-nudge:v1. The hash schema is v=1 with the same eight state fields. Incoming recognized fragment state wins over saved state; saved state wins over defaults. Missing and invalid incoming fields recover to defaults. Unknown versions recover through the ordinary startup fallback. Hash changes reconstruct the visible state. history.replaceState keeps the shareable URL current without adding an entry per edit. Storage and history exceptions are contained.

# C00 Rendering and data integrity

All component values must resolve against their category's catalog. Expression has no empty entry. Other None values have empty code-point arrays. String.fromCodePoint produces the visible Unicode. Rendering uses textContent and explicit DOM construction, preserving data boundaries. Clipboard strings contain catalog-derived emoji, fixed markup, and validated numeric sizes. The only user-derived values accepted into state are catalog IDs and bounded preferences.

# D00 Clipboard pipeline

A user gesture first attempts navigator.clipboard.write with ClipboardItem carrying text/html and text/plain Blobs. Failure or missing capability selects the preview and attempts document.execCommand('copy'). The copy event enriches a full selected character with the independent clipboard renderer. If the legacy command fails, selected text and keyboard guidance remain visible.

The HTML uses a presentation table with zero spacing and padding, centered cells, explicit font families, point sizes, line heights, and mso-line-height-rule:at-least. The plain version joins visible glyphs with newlines. Context uses 65 percent of the base size in HTML. The native preview and output are separate so compact-screen scaling never changes the requested paste size. Receiving applications ultimately control how much rich formatting they retain.

# E00 Diagnostics and agent access

A debug query parameter exposes getState, clipboardContent, validate, presets, and catalog through window.nudgeDebug. The default page keeps these helpers private. If document.modelContext.registerTool is available, configure_emoji_nudge accepts a visible preset ID, validates it, applies the same state transition as the picker, and returns the resulting state. The integration is optional and failures leave the UI usable.

# F00 Maintenance

Edit the structured catalog in catalog.js, then run python3 tools/build.py to regenerate native HTML options. The script derives fallback emoji character references from the same numeric arrays. Run the source verifier and JavaScript syntax check. Stable IDs should remain stable when labels change so saved state and shared fragments continue to resolve.
