# ILUD — ten ways to a quieter web

ILUD helps people use ordinary digital tools with less unsolicited AI mediation. This collection contains **ten independent static web applications** interpreting the same 37 source-backed routes. Each design gives a different way to discover a solution: a route map, editorial issue, turning dial, paper folio, island atlas, workshop rack, opening doors, branching constellation, interactive comparison and guided wayfinder.

Open `index.html` to see the collection, or open any numbered application's `index.html` directly. Each child contains its own HTML, CSS, JavaScript, catalogue, source image, favicon, social preview and actual mobile screenshot. **No child imports runtime files from another child or from the parent.** External destinations require an internet connection; browsing the catalogues does not. Saved routes use your browser's local storage and do not sync between devices.

## Run and rebuild

Serve this folder with any static server (for example `python -m http.server 8000`), then open `http://localhost:8000/`. Direct `file://` opening also works in current desktop browsers. No server, account, API key or runtime installation is required for publishing.

To regenerate copied data, reference images, favicons and social previews:

```text
python -m pip install -r requirements.txt
python tools\build.py
npm install
npm test
python tools\build.py --zip
```

`npm test` uses an installed Chrome or Edge for mobile and desktop interaction checks and captures each app's **actual mobile screenshot**. `python tools\build.py --screenshots` provides a simpler headless-Chrome screenshot option, but the browser test produces correctly emulated mobile captures. The build script uses Windows Georgia/Arial where available and DejaVu Serif/Sans elsewhere for preview art. `Ilude.zip` contains the self-contained project under `2026-09-28\Ilude\` as specified. The working source lives here beside `AGENTS.md` because the local project instructions require all ten child applications beside it.

## Research and maintenance

Edit `shared\catalog.js` to update routes, then run `python tools\build.py` to copy the catalogue into every child. Each route includes a user-facing outcome, action, steps, caveat, source, method and documentation-review date. `research.md` explains how to recheck claims and why unreliable query folklore is not offered as a guaranteed fix. Dates are **source-review dates, not promises that a platform feature works identically for every account**. Test a changed direct URL and recheck the official source before changing a date. `shared\core.js` and `shared\base.css` are copied into each child for independent deployment; the interaction surfaces and designs live in their respective `index.html` files.

Optional sound is off by default on the dial and only starts in response to a user's interaction. Dragging also has button alternatives. All apps provide search, category browsing, details, sources and saved routes; no permissions, analytics or backend are used.
