# Anger Relief Toy 0.2.0

A Manifest V3 extension for Edge and Chrome. Equip a playful tool, use it repeatedly on a webpage, switch through the action wheel, and put it away to restore ordinary browsing. Eight effects, no production dependencies or remote scripts.

## Load the build

Extract the project archive. In `chrome://extensions` or `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select the project's `dist` folder containing `manifest.json`. When updating an existing unpacked installation, reload the extension and refresh already-open test pages.

Click the extension toolbar icon to browse tools. **Open action wheel** displays the actual browser-assigned shortcut, not merely the suggested Alt+Shift+A binding. If unassigned, use the browser's Extensions > Keyboard shortcuts page to assign Open action wheel. Browser-controlled shortcuts can take precedence over the suggested binding.

## Use tools continuously

Equipping Punch, Shatter, Text Bomb, Rubber, or Vortex keeps it ready after each animation. Click another element directly; there is no Again button. Rapid actions replace the previous invocation, so only one animation owns resources at once.

Flashlight stays active until ended, switched, or put away. It follows the pointer and supports arrow keys. Gravity and Screen Crack likewise have no short automatic timeout. Gravity uses up to twelve visible target illustrations and floor bounces, while Screen Crack is a temporary viewport overlay.

The bottom inventory shows your tool and provides **Switch**, **End effect**, and **Put away**. End effect stops the current visual result while keeping the tool selected. **Use tool** restarts a selected non-element mode after it has ended. Put away releases equipment, effects, target interception and cursor feedback. One-shot restore time applies to individual repeatable invocations only.

The wheel and full catalog preserve equipment when closed. Escape closes an open menu first; otherwise it puts away the tool. All tools opens a centered catalog. Drag its title bar to move it; focus that title bar and use arrow keys for a keyboard alternative. The native toolbar popup stays browser-positioned.

Tab cycles eligible targets and inventory controls; Enter uses the selected target. The wheel supports Tab and arrow navigation. System reduced motion always applies. Form values, editable drafts, embedded frames, audio/video and canvas contents are protected from capture.

Scrolling, resizing or a changing target may end a snapshot animation without losing selection. Viewport effects adapt without being unequipped. Hidden tabs suspend active work; returning restores continuous pointer modes or leaves repeatable tools ready. Full navigation, refresh and route changes end the document session.

## Build and test

Use Bun 1.4.4, the tested version. Run `bun install --frozen-lockfile`, `bun run build`, `bun run check`, and `bun run test`. `bun run package` produces `anger-relief-toy-extension.zip` with only the loadable extension files. Development dependencies are pinned in `bun.lock`; none enter the shipped runtime.

`bun run test:browser` uses an installed Playwright browser or `/usr/bin/chromium`, with `CHROMIUM_EXECUTABLE` and `HEADED=1` overrides. It does not download a browser automatically. The suite loads the unchanged packaged extension and exercises the actual shortcut, repeated Punch/Text Bomb, ten-second Flashlight, centered/dragged catalog, menu preservation, reduced motion, host controls, scroll/resize and refresh at 920x720 and 1440x1000. It captures screenshots and video when native Chromium can run.

Synthetic fixtures include `tests/fixtures/discussion.html` and the earlier message playground. Serve them over localhost for normal activeTab testing. File URLs require the browser's separate Allow access to file URLs extension setting.

The optional circle gesture is a development-only experiment. `bun run prototype:gesture` creates `.temp/gesture-prototype/index.html`. Its explicit opt-in uses Shift+middle on noninteractive space and captures native autoscroll for that gesture. No gesture listeners, production toggle, persistent host permission, or global page injection are shipped. Native browser interference must be validated before integration.

## Design and verification status

The redesign uses a light translucent radial control and colored, softly shaded object icons, following the user's feedback during five image-generation concepts/refinements. Source artwork and concept references are included in the change request's companion assets folder. The functional controls are DOM/SVG/CSS, not a flattened mockup.

Type checks, builds and component tests pass. The current environment was checked again: Chromium still fails at process socket creation. Native browser screenshots, actual keybinding behavior, visual/motion comparison, hardware performance and branded Edge/Chrome compatibility remain unverified. Generated concepts and the icon contact sheet are explicitly not browser evidence. The implementation is delivered for review; the change request is not marked finally accepted while those gates remain open.

See [interaction semantics](docs/interaction-003.md), [design decision](.specs/suggestions003-00-change-request-interaction-navigation-and-visual-redesign.assets/design-exploration/decision.md), [copy audit](docs/copy-audit-003.md), [verification](docs/verification.md), and [acceptance index](docs/acceptance-index.md).

## Rendering limits

Effects use bounded local illustrations of target backgrounds/text, not pixel-perfect screenshots. External images, complex CSS, canvas/video and embedded applications are not reproduced. Snapshot canvases use CSS-pixel resolution. The extension restores only the visibility property it owns; a concurrent same-value host write cannot be distinguished from extension ownership. Complex host stacking/top-layer content and high-DPI rendering still require native compatibility review. No effect modifies server-side data or intentionally sends a host action.
