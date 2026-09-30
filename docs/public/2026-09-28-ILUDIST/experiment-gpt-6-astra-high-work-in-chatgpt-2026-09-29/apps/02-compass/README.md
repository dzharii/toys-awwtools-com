# A00 / ILUD: The Guided Compass

Move from a frustration to a practical path.

Open `index.html` in a modern desktop browser, or serve this entire folder with a static HTTP server. No installation, build step, API key, or network request is required to load the application. External destinations require a connection. Mobile file-preview apps may not execute JavaScript; serve over HTTP or HTTPS for phone use.

## B00 / Files and behavior

`app.js` and `theme.css` implement this design. `core.js` supplies catalogue search, source details, optional sound, bookmarks, local flags, and preferences. `catalog.js` contains the same 40 researched records as the other applications. Each folder is independent and can be copied or deployed by itself.

Reference: `1000065895.png`. The reference is in the archive's `references` directory. No screenshot is used as an interactive interface.

Saved records are isolated under the local-storage namespace `ilud.v1.02-compass`. Search queries are not persisted. There is no backend or telemetry.

## C00 / Research and validation limits

Sources reviewed September 29, 2026. No external fix was tested end to end. JavaScript syntax and packaging checks were performed; browser rendering, gestures, device accessibility, and external account settings were not validated. See the archive's `research` directory for provenance and maintenance guidance.
