# Anger Relief Toy

A little harmless havoc. A Manifest V3 extension with eight temporary visual tools, a searchable toolbox, an action wheel, and a modular TypeScript effect SDK. No runtime dependencies, accounts, analytics, or remote scripts.

## Try the built extension

Extract `anger-relief-toy-extension.zip` into a folder. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, choose **Load unpacked**, and select that extracted folder (the one containing `manifest.json`). Pin Anger Relief Toy, open an ordinary HTTP or HTTPS webpage, and click its toolbar icon.

Choose a tool. Element tools ask you to aim and click; viewport and page tools start directly. Press **Escape** or **Stop all** to restore the page. **Again** prepares a fresh activation. **Alt+Shift+A** opens the action wheel; browser shortcut settings can change this binding. Tab cycles eligible targets and Enter selects. The searchable catalog is also keyboard accessible.

Favorites, recent selections, and settings are stored locally. The on-page catalog is reached from the wheel. Strength and automatic restore time are shared; flashlight radius, darkness, and softness are configurable. System reduced motion is always respected. All effects restore automatically within ten seconds.

For a synthetic playground, open `tests/fixtures/playground.html` from the source archive. Loading an extension on file URLs requires explicitly enabling "Allow access to file URLs" in the extension's details. Alternatively serve the fixture over localhost. No real account or website is required.

## Included tools

| Tool | Interaction | Result |
| --- | --- | --- |
| Punch | Choose an element | Compressed illustrated surface, impact burst, sparks |
| Shatter | Choose an element | Ten triangular surface fragments fall away |
| Gravity | Whole visible page | Up to twelve illustrated elements drop and bounce |
| Text Bomb | Choose an element | Short fuse, then up to 65 words scatter |
| Flashlight | Pointer or arrow keys | A soft circle of light follows you |
| Screen Crack | Screen | A centered spiderweb crack overlay |
| Rubber | Choose an element | Damped elastic stretch and squish |
| Vortex | Choose an element | A surface folds into a small black hole |

## Develop

Install Bun 1.4.4 (the tested version), then run `bun install --frozen-lockfile`. All packages are development-only and pinned in `bun.lock`. Run `bun run build`, `bun run check`, and `bun run test`. Run `bun run test:browser` on a machine that allows Chromium to launch. The runner prefers installed Playwright browser binaries, then `/usr/bin/chromium`; `CHROMIUM_EXECUTABLE` selects another installed binary and `HEADED=1` shows the browser. It never downloads browsers automatically.

`bun run package` rebuilds, checks types, runs component tests, and produces `anger-relief-toy-extension.zip`. Browser verification is a separate release gate; packaging alone does not approve a release. `bun run format` formats project code without modifying the original supplied specifications.

See [architecture](docs/architecture.md), [adding an effect](docs/adding-effects.md), [security](docs/security.md), [verification](docs/verification.md), and [research summary](research/summary.md).

## Current acceptance status

This is an implemented foundation package for development review, not an independently approved production release. TypeScript, Bun builds, and DOM-emulator tests pass. Actual Playwright browser startup was blocked by this workspace's socket restrictions. The shared desktop browser also rejected local-file access. No animation screenshots, real extension injection results, branded Edge/Chrome compatibility results, or frame/heap performance measurements are claimed.

Every feature remains `review-pending`, with all 187 questionnaire responses in its `acceptance.json`. Real-browser visual inspection, performance profiling, and independent security/quality review are release blockers. Source audit breadth is intentionally limited to behavior references for this foundation; the broader historical discovery effort remains ongoing.

## Limits

Snapshots are local illustrations of backgrounds and text, not pixel-perfect screenshots. External images, embedded applications, canvas/video content, form fields, and editable drafts are not captured. Complex CSS, top-layer dialogs, extreme page stacking, and browser-private pages can limit the illusion. Original DOM content remains in place; only owned visibility styles are temporarily applied and restored without overwriting a host update. Same-value concurrent visibility writes cannot be distinguished from extension ownership. Effects stop on geometry-changing scrolling/resizing instead of following the page. The initial release supports only the top document and open shadow roots.
