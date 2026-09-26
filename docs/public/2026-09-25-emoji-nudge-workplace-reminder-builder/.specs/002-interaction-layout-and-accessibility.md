# A00 Working surface

The desktop shell caps at 1120 CSS pixels, with a compact brand header and one bordered workspace. Controls and preview share the main row. Container width at 760 pixels switches the composition to preview-first. At 390 pixels, padding and secondary labels tighten further. The primary controls stay in a two-column grid. The preview is a white surface in both themes.

# B00 Interaction contract

Preset selection applies all six component IDs atomically and preserves size and spacing. A component edit recalculates exact preset recognition. Shuffle samples the curated catalog and preserves output preferences. Reset restores all default values. Every selection rerenders visible character rows and stores the new configuration. Context renders at 65 percent of the base size with a small visual gap. The other rows use the full base size.

# C00 Transfer and focus

Copy reports success only after an API or legacy copy operation succeeds. If both fail, the character remains selected and the status explains the keyboard shortcut. Select focuses the character without scrolling and selects its entire contents. A single click focuses it while preserving browser selection behavior; a double-click selects all rows. A full manual copy supplies both HTML and plain text. A partial manual selection retains native browser copying behavior.

The secondary menu opens at the upper right. Its first control receives focus. Escape returns focus to the trigger in the explicit fallback path. Native popover light-dismiss behavior is preserved. Reset closes the menu and returns to its trigger. A blocked Copy Link operation reveals a read-only input with the full URL selected.

# D00 Native enhancement

The HTML contains all options before JavaScript. JavaScript enables the controls and enhances them only when CSS.supports reports base-select. Enhanced options include decorative emoji spans and readable labels. Preset options show a miniature full composition. The disabled Custom option describes an unmatched state. Static preview text remains manually copyable if JavaScript is unavailable.

# E00 Accessible presentation

Labels are explicitly associated with selects. The preview has a descriptive accessible label assembled from the selected component names. Action results use a polite status region. Focus rings have a clear offset, touch controls have a 44-pixel minimum height, and reduced motion disables the bounce. Layout uses flexible widths and natural document scrolling. Standard browser tab and select interactions remain authoritative.
