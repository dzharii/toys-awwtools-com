# Code Review

Scope: static review of the bookmarklet UI framework in `src/`, with extra attention to naming, interaction CSS, layout behavior, and future maintenance risk.

Verification run:

- `npm test` passed.
- `npm run build` passed.

## Part One (Summary)

1. **Dropdown menus are positioned in the wrong coordinate model.** `awwbookmarklet-menu` uses viewport-fixed math while living inside a contained, overflow-hidden window.
2. **Menus can be clipped by the window.** Window `overflow: hidden` conflicts with dropdowns that need to escape the window rectangle.
3. **Button components likely emit duplicate clicks.** Native composed clicks already escape the shadow root, then the wrapper dispatches another host click.
4. **Form components likely emit duplicate input/change events.** Several wrappers redispatch events without stopping the native composed event.
5. **Radio groups do not behave like real radio groups.** Each radio owns a separate shadow-root native radio, so same-name grouping is unreliable.
6. **Input value reflection is internally inconsistent.** `AwwTextarea` writes the property, but `AwwInput` and `AwwRange` mostly write attributes.
7. **Select is not a usable value-owning form control yet.** `AwwSelect` clones options but does not expose or reflect selected value.
8. **Tab IDs collide across component instances.** Unnamed tab groups produce IDs like `tabs-tab-0` and `tabs-panel-0`.
9. **Tabs mutate their own observed attributes.** The mutation observer watches `selected`, while selection logic also toggles `selected`.
10. **Listbox lacks focus/active-descendant semantics.** Selection changes visually, but option focus and screen-reader active state are underspecified.
11. **Pointer dragging is fragile across iframes and lost pointer capture.** Drag/resize uses global listeners rather than pointer capture.
12. **Resize from west/north edges has misleading pointer behavior at minimum size.** Clamping changes width but also preserves an aggressively moving `x`/`y`.
13. **Viewport clamping can produce impossible sizes on tiny screens.** `clampRect` can return `width > viewport.width`.
14. **Owner cleanup leaks when windows are removed externally.** Runtime release is tied to custom close events, not generic disconnection.
15. **Version names are contradictory.** `package.json` says `0.1.0`, while `FRAMEWORK_VERSION` says `1.0.0`.
16. **Public token names include unused promises.** `--awwbookmarklet-frost-opacity` exists in the theme but does not affect the CSS.
17. **Global names are too broad for hostile bookmarklet pages.** `globalThis.awwbookmarklet` and `Symbol.for("awwbookmarklet...")` may collide with older copies or unrelated page scripts.
18. **`desktopRoot`, `primaryRoot`, and `rootsByVersion` naming is partially misleading.** The root is not a desktop in the OS sense and `primaryRoot` is just the most recently acquired version.
19. **`system` and `title-command` naming is too generic.** These class/part names do not say what command surface they represent.
20. **The demo uses fixed two-column layout where the window can be resized smaller.** CSS grid in the demo does not adapt to narrow window widths.
21. **Inline demo styles hide framework layout problems.** The example exercises components but does not prove the component API is ergonomic or reusable.
22. **Tests miss the risky behavior.** Existing tests cover pure helpers, not shadow event propagation, menus, drag/resize, radio grouping, or responsive layout.

## Part Two (Details)

### 1. Dropdown menus are positioned in the wrong coordinate model

`src/components/menu.js:5` declares the menu host as `position: fixed`, and `openAt()` uses `trigger.getBoundingClientRect()` from `src/components/menubar.js:112` as viewport coordinates. That sounds coherent only if the menu is fixed relative to the viewport.

The menu is not actually independent of the window. It is a light-DOM child of `awwbookmarklet-menubar`, which is slotted into `awwbookmarklet-window`. The window host uses `contain: layout style` at `src/components/window.js:9`, `overflow: hidden` at `src/components/window.js:16`, and `will-change: transform` at `src/components/window.js:18`. These are exactly the kinds of properties that create containing/blocking behavior for positioned descendants and make "fixed" descendants behave unlike page-level fixed overlays.

Future symptom: open File/View/Help after dragging the window. The menu can appear offset, especially if the window is not at `(0, 0)`, because viewport coordinates are being assigned to an element that may be laid out in an ancestor coordinate space.

Action: choose one ownership model. Either portal menus to `awwbookmarklet-desktop-root` and keep viewport math, or keep menus inside the window and compute coordinates relative to the window/menubar containing block. The name `openAt(anchorRect)` is too vague; if it keeps viewport math, rename to `openAtViewportRect()` or accept an explicit `{ left, top, coordinateSpace }`.

### 2. Menus can be clipped by the window

The window host clips children with `overflow: hidden` at `src/components/window.js:16`. A dropdown menu is a descendant of that window. Even if the browser honors `position: fixed`, containment and clipping make this a risky combination.

Future symptom: a menu opened near the bottom of a small window may be partly invisible even though `openAt()` tries to fit it into the viewport at `src/components/menu.js:103-114`. The fit logic checks the browser viewport, not the clipping ancestor.

Action: render popups in an unclipped overlay layer. If the window intentionally clips its internal content, popup surfaces should not be descendants of the clipped box.

### 3. Button components likely emit duplicate clicks

`AwwButton` listens to the internal native button click and dispatches a new `MouseEvent("click")` from the host at `src/components/button.js:34-40`. `AwwIconButton` repeats the same pattern at `src/components/icon-button.js:94-100`.

Native click events from a real button are already bubbling and composed. That means a consumer listening on `<awwbookmarklet-button>` can receive the native retargeted click and then the synthetic click. A "Run" button can run twice. A "Close" button can call close twice. Duplicate close may be masked, but duplicate submit/run actions are not benign.

Action: do not redispatch `click`. Let the native composed event cross the shadow boundary, or stop the native event before dispatching a clearly named custom event such as `awwbookmarklet-button-activate`. Prefer the first option unless there is a strong abstraction reason.

### 4. Form components likely emit duplicate input/change events

`AwwInput` dispatches `input` and `change` from the host at `src/components/input.js:105-112`. `AwwRange` dispatches `input` at `src/components/range.js:257-260`. `AwwTextarea` dispatches at `src/components/textarea.js:24-31`. `AwwCheckbox` and `AwwRadio` dispatch `change` at `src/components/checkbox.js:39-42` and `src/components/radio.js:48-51`.

The same duplication risk applies as with buttons: native input/change events often escape shadow roots. Some browsers and event types differ, which makes this worse, not better. Consumers may get duplicate events in one browser and single events in another.

Action: standardize the event strategy. Either rely on native composed events where supported and document it, or stop propagation and emit framework-specific events. Do not emit a native-named event unless the wrapper exactly preserves native semantics.

### 5. Radio groups do not behave like real radio groups

`AwwRadio` places each native `<input type="radio">` inside its own shadow root at `src/components/radio.js:45`. It mirrors the `name` attribute to that internal input at `src/components/radio.js:70`, but same-name native radio grouping depends on form/tree ownership. Separate shadow roots are not a reliable group.

The demo expects two radios with `name="mode"` to be mutually exclusive at `src/demo/example-tool.js:71-72`. They can become paradoxical: both hosts may retain `checked`, because selecting one does not clear sibling hosts.

Action: implement group coordination at the custom element layer. When one `AwwRadio` becomes checked, find sibling `awwbookmarklet-radio[name="..."]` in the same logical group and clear them. Longer-term, consider a dedicated `awwbookmarklet-radio-group` so the grouping boundary is explicit.

### 6. Input value reflection is internally inconsistent

`AwwTextarea` handles `value` by assigning `this.control.value = next ?? ""` at `src/components/textarea.js:43-46`. `AwwInput` handles `value` by `this.control.setAttribute(name, next)` at `src/components/input.js:129-134`. `AwwRange` does the same at `src/components/range.js:269-274`.

For text inputs, setting the `value` attribute is not equivalent to setting the current value once the input has become dirty. This creates a bad future bug: `el.value = "reset"` can update the host attribute but leave the visible input unchanged.

Action: for all value-owning controls, set the DOM property for `value`, not only the attribute. Use the attribute only as initial/default value if that distinction is intentional. The name `MIRRORED_ATTRIBUTES` is misleading because some entries are not safe to mirror mechanically.

### 7. Select is not a usable value-owning form control yet

`AwwSelect` clones light-DOM `<option>` nodes into an internal `<select>` at `src/components/select.js:217-228`. It dispatches `change` at `src/components/select.js:187-189`, but it does not expose `value`, does not reflect the selected option back to the host/light DOM, and does not observe a host `value` attribute.

This makes the component much harder to use than it looks. A developer will naturally try `select.value`, `select.setAttribute("value", "full")`, or inspecting the selected light-DOM option. None is a complete contract.

Action: implement `get value()`, `set value()`, observe `value`, sync the internal select value, and decide whether light-DOM selected state is source-of-truth or just declarative initialization.

### 8. Tab IDs collide across component instances

`AwwTabs` creates tab IDs from `${this.id || "tabs"}-tab-${index}` at `src/components/tabs.js:90`, and panel IDs from `${this.id || "tabs"}-panel-${panelIndex}` at `src/components/tabs.js:117`.

Two unnamed `<awwbookmarklet-tabs>` instances will create duplicate IDs. Even worse, the tab button lives in shadow DOM and the panel lives in light DOM, so the ARIA relationship is already harder for assistive tech to resolve. Duplicate IDs make it ambiguous.

Action: generate a per-instance internal ID prefix. Keep user-provided `id` if needed, but do not rely on it for uniqueness. A module counter or `crypto.randomUUID()` fallback would be enough.

### 9. Tabs mutate their own observed attributes

The observer watches subtree attributes including `selected` at `src/components/tabs.js:65-66`. The selection routine toggles `selected` on every panel at `src/components/tabs.js:114-116`. This means ordinary internal selection writes schedule another `#refresh()`.

This may not infinite-loop today because repeated writes often stabilize, but it is a brittle pattern. A future change that always rewrites labels, IDs, or selected state could create thrash. It also makes performance worse when panels contain large subtrees because the observer is configured with `subtree: true`.

Action: disconnect the observer while applying internal selection, or observe only direct child panels and external mutations. The method name `#refresh()` is too broad; split "read panel declarations" from "apply selected index".

### 10. Listbox lacks focus/active-descendant semantics

`AwwListbox` keeps focus on a shadow `<div role="listbox" tabindex="0">` at `src/components/listbox.js:194` while options are slotted light-DOM children. Selection is represented by `aria-selected` and `data-selected` at `src/components/listbox.js:218-222`, but there is no `aria-activedescendant`, no stable option IDs, and no option focus movement.

Keyboard users can change selection, but assistive tech may not get a clear active option announcement. The implementation is close enough to look finished, which is dangerous because accessibility bugs tend to survive until late.

Action: either move focus to options, or keep focus on the listbox and set `aria-activedescendant` to a unique selected-option ID. Also add disabled option handling before this component is treated as general-purpose.

### 11. Pointer dragging is fragile across iframes and lost pointer capture

Window drag/resize starts on a titlebar or handle, then attaches `pointermove` and `pointerup` to `window` at `src/components/window.js:351-354`. It does not call `setPointerCapture()` on the initiating element.

This works in simple demos but can fail in arbitrary pages: if the pointer crosses an iframe, if the browser starts a native operation, or if another overlay captures pointer events, the window can get stuck until the next cancel/up path fires.

Action: capture the pointer on pointerdown, track the initiating `pointerId`, and ignore unrelated pointer events. The helper name `#attachPointerFlow()` hides the fact that this is specifically "global uncaptured drag listeners."

### 12. Resize from west/north edges has misleading pointer behavior at minimum size

During west/north resize, `#flushResizeFrame()` changes both size and position at `src/components/window.js:435-442`, then calls `clampRect()` at `src/components/window.js:444`. If the pointer keeps moving after min size is reached, the window can continue shifting even though width/height is clamped.

Future symptom: users drag the west edge to shrink; after min width, the right edge may no longer feel anchored. That feels like a layout bug, not a deliberate constraint.

Action: clamp width/height before deriving `x`/`y` for west/north edges, or compute the anchored opposite edge explicitly. Add tests for west/north resizing at min size.

### 13. Viewport clamping can produce impossible sizes on tiny screens

`clampRect()` calculates `width = Math.max(minWidth, Math.min(rect.width, viewport.width))` at `src/core/geometry.js:26`. If the viewport is 280px wide and `minWidth` is 320, the result is 320. That may be a deliberate minimum, but it contradicts the idea of clamping to the viewport.

The same issue exists for spawn size: `getSpawnRect()` can calculate `viewport.width - 12`, then `clampRect()` can expand it back to `minWidth`.

Action: decide whether "minimum component size" or "fit visible viewport" wins on tiny screens. If minimum wins, rename `clampRect()` to something more specific like `constrainWindowRect()` and document that it may exceed viewport size.

### 14. Owner cleanup leaks when windows are removed externally

`openBookmarkletWindow()` releases its owner on `awwbookmarklet-window-closed` at `src/bookmarklet/index.js:23` and has a microtask fallback after close request at `src/bookmarklet/index.js:24-28`. If a consumer does `win.remove()` directly, `AwwWindow.disconnectedCallback()` unregisters it from the manager, but `releaseDesktopRoot(owner)` is never called.

Future symptom: the desktop root stays mounted forever with an owner record that no longer has a visible window. On repeated bookmarklet runs, this becomes a page-level leak.

Action: add a `disconnectedCallback`-level release hook, a `MutationObserver` in the runtime, or return an explicit controller object with `close()`/`dispose()` and document that direct DOM removal is unsupported. The current API returns only `win`, which invites direct DOM removal.

### 15. Version names are contradictory

`package.json` declares version `0.1.0`, while `src/core/constants.js:1` declares `FRAMEWORK_VERSION = "1.0.0"`. The runtime uses this framework version to key global root ownership.

This is not just cosmetic. If a future release updates npm/package version but forgets `FRAMEWORK_VERSION`, incompatible builds may share the same root. If `FRAMEWORK_VERSION` gets bumped independently, compatible builds may create unnecessary duplicate roots.

Action: derive framework version from the package during build, or rename it to `ROOT_PROTOCOL_VERSION` if it is intentionally not the package version.

### 16. Public token names include unused promises

`PUBLIC_TOKENS.frostOpacity` is declared at `src/core/constants.js:54`, set in the default theme at `src/themes/default-theme.js:24`, and listed in `README.md`. The actual titlebar CSS uses hardcoded rgba-ish token colors and `backdrop-filter` at `src/components/window.js:39-46`, but does not reference `--awwbookmarklet-frost-opacity`.

The name promises a public customization knob. Future theme authors will set it and see nothing happen.

Action: either wire the token into the titlebar/window background calculations or remove it from public tokens until it works.

### 17. Global names are too broad for hostile bookmarklet pages

The bundle writes `globalThis.awwbookmarklet` at `src/bookmarklet/index.js:45-49`. It also uses global symbols such as `Symbol.for("awwbookmarklet.desktopRootsByVersion")` at `src/core/constants.js:24-28`.

On arbitrary pages, global namespace is not friendly. An older copy of this framework, a page script, or another bookmarklet can reuse the same name. `Symbol.for` makes the collision intentionally cross-realm/global registry.

Action: include a stronger namespace such as `awwtools.bookmarkletUi`, or expose a less collision-prone global. For symbols, include the package name and a protocol version in the key.

### 18. Root naming is partially misleading

`desktopRoot`, `primaryRoot`, and `rootsByVersion` sound like there is one active desktop surface. In reality, `rootsByVersion` permits many roots, and `primaryRoot` is whichever version was most recently acquired at `src/core/runtime.js:104-106`.

That "primary" behavior will surprise future code that assumes it means focused, topmost, current, or only root. It is none of those.

Action: rename `primaryRoot` to `lastAcquiredRoot` or remove it until there is a clear consumer. Rename `desktopRoot` to `overlayRoot` if the abstraction is really a page overlay.

### 19. `system` and `title-command` naming is too generic

The titlebar uses `.system` for the system menu button and `.title-command` for close/other commands at `src/components/window.js:55-66` and `src/components/window.js:152-155`.

Inside shadow DOM these names are not global CSS collisions, but they still become part names (`part="system-button"`, `part="close-button"`) and maintenance vocabulary. "system" is especially vague: operating system, framework system, window menu, or app menu?

Action: rename internal classes to `.system-menu-button` and `.window-command-button`, or at least reserve "system" for a clearly documented window-control concept.

### 20. The demo uses fixed two-column layout where the window can be resized smaller

The demo body uses two-column grids at `src/demo/example-tool.js:56`, `src/demo/example-tool.js:64`, and `src/demo/example-tool.js:95`. The framework allows the window down to 320px wide at `src/components/window.js:14` and `src/core/constants.js:213`.

Those two facts conflict. At narrow widths, the demo can overflow horizontally or compress controls into unreadable shapes. This matters because the demo is probably the visual regression surface people will trust.

Action: use responsive grid tracks in the demo, for example `repeat(auto-fit, minmax(...))`, or add a window-content breakpoint class. Also test at minimum window dimensions.

### 21. Inline demo styles hide framework layout problems

`buildExampleToolWindow()` directly assigns inline CSS for toolbar/body/grid layout at `src/demo/example-tool.js:35-117`. That makes the example quick to build, but it does not validate whether the framework components compose well without per-instance style patching.

Future problem: consumers copy the inline layout instead of using stable framework parts/tokens. The demo becomes de facto API, but it is not named, documented, or reusable.

Action: move repeated layout concepts into small framework components or documented utility classes/parts. At minimum, add a second demo that uses only public component APIs and minimal inline style.

### 22. Tests miss the risky behavior

The current tests cover commands, geometry, and theme merging. They do not instantiate custom elements in a browser-like environment, and they do not verify shadow event propagation, menu positioning, menu clipping, radio grouping, select value sync, tab IDs, drag/resize, or narrow layouts.

The existing green test suite is therefore not evidence that the UI works. It is evidence that a few pure helpers work.

Action: add browser-level tests. The most valuable first tests are: clicking an `awwbookmarklet-button` fires one consumer click; File menu appears adjacent to its trigger after the window is moved; menu is not clipped by the window; same-name radios are mutually exclusive; `AwwInput.value = "x"` updates visible text after user input; and the demo has no horizontal overflow at minimum window width.
