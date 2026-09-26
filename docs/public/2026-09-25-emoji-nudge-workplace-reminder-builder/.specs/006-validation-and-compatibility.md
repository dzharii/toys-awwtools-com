# A00 Validation performed

The JavaScript syntax check passed. The Python package verifier passed ASCII-source validation, catalog-to-native-option parity, valid preset references, 21 unique preset combinations, local runtime-asset presence, and seven favicon resolutions. The social image was visually inspected and confirmed as a 1200 by 630 JPEG.

The behavioral harness evaluates the actual app.js against a small DOM mock. It passed preset application, exact recognition, hidden discovery, reset, fragment precedence, saved-state restore, invalid input recovery, blocked local storage, clipboard point sizing and line count, empty optional rows, Shuffle validity, blocked clipboard selection fallback, Copy Link fallback, and valid/invalid optional agent-tool input. This exercises application logic; it does not establish browser rendering or platform clipboard compatibility.

A browser test run was attempted with Playwright. This workspace had no installed browser binary, and the browser download failed. Therefore visual browser QA, real native/customizable-select interaction, rich clipboard success, actual Popover API behavior, and Microsoft 365 paste results remain unverified. Optional WebMCP execution was checked in the mock registry; a supported browser registry was unavailable.

# B00 Reproduce source checks

Run python3 tools/verify.py, node --check app.js, and node tools/check-behavior.cjs from the project folder. Run python3 tools/build.py after catalog edits to refresh fallback options. The behavioral harness uses Node's standard library only and remains a development tool.

# C00 Browser acceptance matrix

| Environment | Checks to complete |
| --- | --- |
| Chrome and Edge | Customizable preset previews, option selection, Copy HTML/plain representations, Popover dismissal |
| Firefox | Native selector labels, change events, full manual selection, rich clipboard capability fallback |
| Safari on macOS and iOS | Native/enhanced controls according to support, Cmd+C guidance, touch layout and clipboard |
| Teams embed | Container width, tenant iframe restrictions, Copy fallback and direct paste |
| SharePoint embed | Script/frame policy, narrow layout, local storage restrictions and manual copy |
| Outlook web | Table paste, size retention, all three spacing levels, plain-text destination |
| Outlook desktop | Windows emoji availability, table line boxes, spacing and paste rendering |

# D00 Interaction review procedure

Check the default at 1180, 768, 390, and 320 CSS pixels, including a narrow iframe in a wide window. Confirm native labels, visible focus, all six selectors, preview-first behavior, absence of horizontal overflow, and practical touch targets. Increase text scaling to 200 percent. Toggle dark mode and reduced motion. Try size 56 with Context enabled. Confirm compact preview scaling leaves copied font size at 56 pt.

Apply each preset, manually reconstruct one, then change a single component and observe Custom. Reconstruct all three hidden combinations from document 004. Exercise Shuffle, Reset, returning to a saved state, an incoming shared fragment, malformed IDs, a future schema version, and blocked storage.

# E00 Clipboard acceptance procedure

Use Copy, Select followed by the platform shortcut, double-click selection, and a partial manual selection. Exercise an allowed rich clipboard environment and a frame with blocked clipboard access. Success feedback must follow a successful operation. Block Copy Link and confirm that its selectable URL appears. Paste into Teams, Outlook web, and Outlook desktop at each supported size with Tight, Normal, and Relaxed spacing. Confirm the same glyph order in a plain-text editor.

Append ?debug=1 before the fragment to inspect window.nudgeDebug.clipboardContent().html and .plain. The generated table is an implementation candidate for Outlook compatibility, not a claim that every Outlook version preserves it identically. Tune the independent HTML renderer using observed paste results.

# F00 Release configuration

Set final canonical and preview-image URLs with tools/configure-deployment.py. Verify the public JPEG is accessible to link-preview crawlers. Confirm the chosen host allows the intended SharePoint or Teams embedding origin. Retain this validation record alongside any subsequent real-device results.
