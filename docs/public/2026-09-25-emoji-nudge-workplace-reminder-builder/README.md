# A00 Emoji Nudge

A tiny atelier for wordless workplace diplomacy. Build a peculiar emoji character, tune its tone, and send a gentle nudge, thank-you, or review reminder without typing a sentence.

Open `index.html` to use the app directly. For the best clipboard behavior, serve the folder over HTTPS or use `python3 -m http.server 8000` and open `http://localhost:8000`. Every runtime asset is included. HTML, CSS, and JavaScript run directly in the browser.

# B00 Project contents

`index.html` contains the complete semantic interface and native fallback options. `styles.css` owns the responsive container layouts and theme. `catalog.js` is the central catalog of numeric Unicode sequences and presets. `app.js` implements state, preview, sharing, clipboard operations, and enhancement. `favicon.ico`, `favicon.png`, and `social-preview.jpg` supply the local identity assets.

The `.specs` folder contains numbered product, interaction, architecture, catalog, deployment, and validation documents. `tools/build.py` regenerates native options after catalog edits. `tools/configure-deployment.py` sets absolute metadata URLs. `tools/verify.py` checks the packaged source and catalog with Python's standard library.

# C00 Development

Edit `catalog.js` and then run `python3 tools/build.py`. The application needs no build for normal use. Run `node --check app.js` and `python3 tools/verify.py` after changes. Python is only a maintenance convenience; it is not a runtime dependency.

Use `?debug=1` to expose the read-only diagnostic helpers at `window.nudgeDebug`, including the generated clipboard HTML. The helpers are described in `.specs/006-validation-and-compatibility.md`.

# D00 Publishing

Run `python3 tools/configure-deployment.py https://your-domain.example/emoji-nudge/` with your real public address. Upload `index.html`, `styles.css`, `catalog.js`, `app.js`, `favicon.ico`, `favicon.png`, and `social-preview.jpg` to the same static directory. Serve over HTTPS. Documentation and tools can stay in the source archive. Consult `.specs/005-static-deployment-and-embedding.md` for iframe and clipboard configuration.

The archive contains editable source and a deployment-ready asset set. Canonical and social-image URLs initially use `https://example.com/emoji-nudge/` because the final hosting address is deployment-specific.
