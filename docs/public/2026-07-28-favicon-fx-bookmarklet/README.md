---

A00 Favicon FX Bookmarklet

---

Favicon FX is a self-contained bookmarklet that reads the current page favicon when browser security permits, renders it through a Canvas-based effects pipeline, and replaces the active favicon with animated PNG data frames. It also injects a draggable Shadow DOM control panel so the effects can be combined without adopting the host page's styles.

---

B00 Installation

---

Open `index.html` in a browser. Drag the `Favicon FX Lab` button to the bookmarks bar. Navigate to a normal `http:` or `https:` page and activate the bookmark. Clicking the installation button instead of dragging it runs the bookmarklet on the installation page as a local test.

The generated `bookmarklet.txt` contains the same encoded JavaScript URL for manual bookmark creation. The readable implementation remains in `src/bookmarklet.js`; it is not minified or mangled.

---

C00 Development

---

The project has no runtime or development dependencies. Run `npm run build` after editing `src/bookmarklet.js`. The build writes `installer-data.js` and `bookmarklet.txt`. Run `npm test` to parse the source and verify the generated URL round trip.

---

D00 Public API

---

While active, the engine is available as `window.FaviconFX`. Typical calls are `FaviconFX.toggleEffect("spin")`, `FaviconFX.setEffect("hue", true, { speed: 0.4 })`, `FaviconFX.playPreset("cosmic")`, `FaviconFX.clearEffects()`, `FaviconFX.setMasterSpeed(1.5)`, `FaviconFX.stop()`, and `FaviconFX.start()`.

Custom effects can be registered with `FaviconFX.registerEffect(name, definition)`. The effect definition receives a mutable frame description and its parameter object. The complete contract is documented in `SPECIFICATION.md`.

---

E00 Browser Boundaries

---

A cross-origin favicon can only be sampled when its server allows cross-origin image use. When sampling fails, the bookmarklet generates a colorful fallback icon using the hostname initial and applies all effects to that generated icon. Browser-internal pages, extension stores, some strict Content Security Policy configurations, and pages that prohibit `javascript:` URLs can block bookmarklets or data-based favicons.

The bookmarklet changes only the current tab's document. Reloading or navigating restores normal page behavior.
