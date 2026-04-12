A00 Change request: safe UI rendering and tool window redesign

This change request fixes two urgent issues in the bookmarklet implementation.

First, the current UI mounting code uses `innerHTML`, which fails on pages that enforce Trusted Types. The observed error is:

```text
This document requires 'TrustedHTML' assignment. The action has been blocked.
Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.
```

Second, the current tool window layout is not usable. Long selector text expands the layout, the panel becomes too narrow or too tall, horizontal scrolling appears in awkward places, and the visual design looks like an accidental test fixture rather than a serious inspector tool.

This change request should be treated as high priority because the current implementation can fail to mount on real sites and the current UI makes the tool difficult to use even when it works.

B00 Required fix: remove unsafe HTML insertion

The implementation must not use `innerHTML` for creating the bookmarklet UI.

Codex should replace all UI construction that uses `innerHTML` with explicit DOM construction through `document.createElement`, `append`, `replaceChildren`, `setAttribute`, `classList`, `textContent`, and event listeners.

This requirement also applies to related APIs that parse HTML strings into DOM, such as `insertAdjacentHTML`, `outerHTML`, `Range#createContextualFragment`, and `template.innerHTML`. Avoid them for the bookmarklet UI.

The tool must be able to mount on pages with Trusted Types enabled.

C00 Required helper layer for UI construction

Because explicit DOM construction is repetitive, add a small internal helper layer for creating UI elements.

Do not import a framework. Do not add runtime dependencies. Do not use `$` as an API name.

Create a minimal helper module, for example `src/ui/dom.js`, with functions for common UI construction tasks: create an element, assign class names, set text, set attributes, attach event handlers, append children, create buttons, create labels, create inputs, create textareas, and create sections.

The helper layer should be small and boring. It exists only to make safe DOM construction readable.

The helper layer must always use `textContent` for user-facing text and selector strings. Selector strings, element names, heuristic labels, explanations, and exported JSON must never be inserted as HTML.

D00 Required isolation: Shadow DOM

The bookmarklet UI should render inside a shadow root.

Create a single host element attached to `document.documentElement` or `document.body`, then attach a shadow root and render the entire tool UI inside that root.

All tool styles must live inside the shadow root. The UI should not depend on page CSS, and page CSS should not break the tool UI.

Use a local reset inside the shadow root. Set predictable box sizing, font rendering, button behavior, input behavior, overflow behavior, and scroll behavior for tool elements.

Do not apply global styles to the host page except for temporary page overlays and selection outlines that are strictly required for element highlighting.

E00 Required redesign: usable tool window

Redesign the floating panel as an actual tool window, not a loose stack of boxes.

The window should have a title bar, close button, compact toolbar, main content area, inspector/details area, and footer/export area. It should look intentional, dense, and usable.

The panel must not be broken by long selector text, long element names, long heuristic labels, or long generated descriptions. Long text should be clipped, wrapped, or placed in scrollable fields depending on context. A single selector must never control the width of the whole window.

Selector fields should use monospace text and should allow horizontal scrolling inside the field when necessary. The whole window should not become horizontally scrollable because of one selector.

F00 Required resizing behavior

The tool window must be resizable.

Support resizing from the left edge, right edge, top edge, bottom edge, and corners if practical. At minimum, support right, bottom, and bottom-right resizing, but the preferred result is full edge and corner resizing.

The window must enforce minimum width and height. The user should not be able to resize it into an unusable state.

The window should remember its size and position during the current page session. Persisting across browser sessions is optional and should not be prioritized.

G00 Required layout constraints

The panel should use a sane default size, for example around 420 to 560 pixels wide and 520 to 720 pixels tall, while still adapting to smaller viewports.

The panel must never extend permanently beyond the viewport. If the user resizes or drags it near an edge, keep enough of the title bar visible so it can be moved again.

The main content area should scroll vertically inside the window. The page itself should not scroll because the tool panel content is too tall.

Candidate cards, selector rows, heuristic lists, and export controls should have consistent spacing and predictable overflow behavior.

H00 Required visual direction

Do not use the current pastel coffee-colored style. Do not use arbitrary decorative colors. Do not create a novelty layout.

Design the tool as a compact operating-system-style utility window.

Use a theme system. The theme should be implemented through CSS custom properties inside the shadow root. Themes should control colors, border radius, shadows, title bar style, button style, field style, typography, and focus state.

Implement at least two themes: a macOS-inspired utility window theme and a Windows XP-inspired utility window theme. These should be inspired by those interfaces, not exact copies. Do not use official logos, system icons, copied assets, or trademarked imagery.

For fun, use the opposite platform default. If the detected platform is macOS, default to the Windows XP-inspired theme. If the detected platform is Windows or Linux, default to the macOS-inspired theme.

I00 Theme quality requirement

The macOS-inspired theme should feel like a calm floating utility panel: light neutral background, subtle title bar, rounded corners, crisp borders, restrained shadow, compact controls, and clear focus states.

The Windows XP-inspired theme should feel like a classic utility dialog: stronger title bar, sharper sections, compact system-like controls, clear borders, and high readability.

Both themes must prioritize usability over imitation. The inspector must remain readable, compact, and functional.

J00 Navigation and information architecture

Rethink the internal navigation of the panel.

The user should immediately understand the main modes: scan, select element, select area, review selected objects, inspect selector, export.

Avoid making the panel look like a random document. It should behave like a tool.

Use clear sections. The current selected object should be obvious. The heuristic selector should be close to the generated selector. The selector test result should be close to the selector field. Export should be available but not visually dominant until objects are selected.

K00 Heuristic dropdown behavior

The heuristic picker should not be a raw overflowing list.

Use a compact dropdown or popover with a search field. It should show heuristic name and a short description. It should not expand the whole panel width.

The currently selected heuristic must be visible. When the user changes the heuristic, rerun selector generation immediately and update the selector, score, match count, and explanation.

L00 Selector editing behavior

The generated selector should be editable.

When the user edits the selector manually, mark the selector mode as manual. Do not overwrite the manual selector unless the user clicks rerun heuristic or selects another heuristic.

The selector test button should validate the current selector and show match count. Matching elements should be highlighted on the page.

M00 Files likely affected

Codex should inspect the current project and adjust file names as needed, but the expected changes are likely in these areas:

```text
src/overlay.js
src/entry.js
src/selectors.js
src/heuristics.js
src/ui/dom.js
src/ui/window.js
src/ui/themes.js
src/ui/styles.js
test/*.test.js
dist/bookmarklet.js
```

If these files do not exist yet, create the smallest structure needed to keep the code maintainable.

N00 Testing requirements

Add or update tests so the UI helper layer can be tested without relying on `innerHTML`.

Add a test or static assertion that the source does not use `innerHTML`, `outerHTML`, or `insertAdjacentHTML` for UI rendering.

Add tests for selector text safety: selector strings and labels should be assigned as text, not HTML.

Run `bun test`.

The build output must still produce a readable self-contained script.

O00 Acceptance criteria

The tool mounts successfully on a page that requires TrustedHTML assignment.

The bookmarklet UI is built without `innerHTML`.

The UI renders inside a shadow root.

The tool window is resizable and remains usable after resizing.

Long selector strings no longer break the layout.

The heuristic dropdown is usable and does not overflow the panel.

The generated selector field is editable and testable.

The visual design looks like a deliberate compact utility window, not an accidental generated layout.

The final bundled script remains self-contained, readable, non-minified, and non-mangled.
