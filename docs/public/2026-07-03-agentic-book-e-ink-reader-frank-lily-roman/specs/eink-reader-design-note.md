Date: 2026-07-03

---

A00 E Ink Reader Design Note For Autonomous Coding Agent

---

Build a static, local-first E Ink-style reader for `.txt` and Markdown files.

The app is a plain browser application made from HTML, CSS, JavaScript, and local assets. It must run from static files. It must not require npm, a bundler, a framework, a server, a database, or a build step. It may include optional developer scripts for downloading, verifying, and documenting vendored dependencies, but the runtime app itself must remain static and directly inspectable.

The app lets the user open a local book file through a file picker or by dragging and dropping the file into the page. The supported file formats are plain text and Markdown only. The app does not store imported book contents in IndexedDB, localStorage, sessionStorage, Cache Storage, cookies, or any other persistence layer. The user must reopen the book file each session. The app may persist user preferences, but not the book text.

The experience should imitate a real E Ink reading device as closely as practical on a normal LCD or OLED screen. The target is not a novelty animation. The target is a credible reading surface: grayscale rendering, matte paper tone, lower contrast, typographic calm, page settling, ghosting, flashing refresh, partial refresh behavior, and slow physical-feeling transitions. E Ink displays use charged pigment particles moving inside microcapsules, and that physical model should influence the simulation: changes should feel like pigment settling, not like a standard web fade. E Ink has global and partial update behaviors, and partial update behavior can leave ghosting or residual artifacts. Use this as the conceptual model for the effect. See the official E Ink technology explanation and e-paper refresh references for background.

The default reading font is Literata. Literata is suitable because it is a long-form digital reading serif and is available under the SIL Open Font License. The app must also let the user choose other bundled fonts from settings. All fonts must be downloaded, vendored, loaded locally, and accompanied by license files or license notes. No font may load from Google Fonts, Fontsource, CDN, or any external host at runtime.

The app must include settings for reading mode, typography, E Ink simulation intensity, page/scroll behavior, theme, spacing, and accessibility. The app must behave well on desktop, tablet, and mobile screens. It must be usable with keyboard, mouse, touch, and basic assistive technologies.

The coding agent must work autonomously. Use this design note as the source of direction, then make implementation decisions using best judgment. Do not stop for permission when a reasonable decision can be made from the requirements. When a decision is uncertain, research, compare options, choose the option that best satisfies the product goal, implement it, validate it, and revise if the validation shows the decision was wrong.

---

B00 Product Identity

---

This is an E Ink reading simulator, not a general document editor, not a Markdown authoring tool, not a file manager, and not a cloud reader.

The product should feel like opening a small standalone reading device in the browser. The user opens the page, drops a book file, adjusts the reading surface, and reads. Every interaction should preserve the illusion of a device-like reading environment.

The app should be quiet. The interface should not compete with the text. Controls should be visible when needed and unobtrusive while reading. The default state should prioritize reading immediately after a file is loaded.

The visual design should avoid common web-app cues that break the E Ink illusion. Avoid bright saturated colors, glossy gradients, sharp neon focus rings, heavy shadows, and excessive animation. Use restrained grayscale, paper-like warmth, subtle borders, and slow physical transitions.

The app should not pretend to be a real E Ink display. It should simulate the experience honestly and robustly on a normal screen. If a browser lacks advanced APIs, the app should degrade to a simpler but still readable experience.

The coding agent must treat visual quality as a core requirement, not polish. After implementing a visual feature, inspect it in a browser, test it with sample files, and refine it until it supports reading rather than distracting from reading.

---

C00 User Manual View Of The Finished App

---

The user opens `index.html` in a browser or serves the folder from a local static server.

The first screen shows a calm drop zone and a file picker button. It explains that only `.txt`, `.md`, and `.markdown` files are supported. It also states that the file is read locally in the browser and is not uploaded anywhere. This must be true.

The user drops or selects a file. The app validates the file type, reads the file, detects whether it is TXT or Markdown, parses it, normalizes the content, and enters the reader.

The reader shows the book content in either page mode or scroll mode. Page mode displays one page-like viewport at a time with next and previous navigation. Scroll mode displays a continuous reading column. The user can switch modes in settings.

The reader has an E Ink transition effect. In page mode, moving to the next or previous page should trigger a refresh-like transition. In scroll mode, major content jumps, file load, settings changes, and layout recalculation should also trigger a refresh-like transition. Font changes, theme changes, spacing changes, mode changes, and Markdown re-rendering should all use the E Ink transition unless motion is reduced or disabled.

The user can open settings. Settings allow font selection, font size, line height, page width, margins, theme, contrast, E Ink effect intensity, motion behavior, page mode versus scroll mode, and reading controls.

The user can close settings and continue reading. Preferences persist locally. The imported book content does not persist. If the user reloads the page or opens the app later, the app restores preferences but asks the user to reopen the book file.

The app must provide clear errors. If the file cannot be read, is too large, has an unsupported type, is invalid text, or Markdown parsing fails, the app shows a human-readable error with a safe next action. Do not fail silently. Do not expose raw stack traces to normal users. Keep technical detail available through developer logs and optional debug panel.

The coding agent must build and test the app from this user journey. Every feature should be validated against this flow before it is considered complete.

---

D00 Non-Negotiable Constraints

---

The runtime app must be static HTML, CSS, JavaScript, and assets.

No npm is allowed for the app. Do not create a runtime architecture that depends on `node_modules`, package resolution, bundling, Vite, Webpack, Rollup, Parcel, Next, React, Vue, Svelte, Astro, or any other framework or build tool.

Bun may be used for optional developer scripts. Bash and PowerShell may be used for optional developer scripts. These scripts may help download, verify, hash, or inspect vendored files. They must not be required for the already-vendored runtime app to execute.

All runtime dependencies must be vendored into the repository. Download dependency source files directly from an authoritative upstream, GitHub release, npm package file served by a CDN such as jsDelivr, or another traceable source. jsDelivr supports open-source files from npm and GitHub, which makes it acceptable as a download source for vendoring when the exact upstream file and version are documented.

All vendored JavaScript and CSS dependency files must be readable and unminified. Do not vendor `.min.js`, `.min.css`, obfuscated files, generated bundles with unreadable names, or files that require source maps to understand. If a dependency only provides minified browser builds, choose another dependency or implement the required subset manually.

All fonts must be vendored. Do not load fonts from Google Fonts, Adobe Fonts, Fontsource CDN, jsDelivr, unpkg, or any external URL at runtime. Vendored font files must include license documentation.

No external network requests are allowed during normal runtime use. This includes scripts, fonts, CSS, images, telemetry, analytics, update checks, and remote Markdown assets.

Only `.txt`, `.md`, and `.markdown` files are supported. Reject other file types clearly.

Markdown raw HTML must be stripped or escaped. The app must not render arbitrary raw HTML from the book file into the page. Even though the file is local, treat Markdown as untrusted input.

The app must not store imported book contents. Do not persist the book body in IndexedDB, localStorage, sessionStorage, cookies, Cache Storage, OPFS, or any other storage. Preferences may persist. Book contents may exist only in memory for the current session.

The app must support page mode and scroll mode.

The app must support desktop, tablet, and mobile layouts.

The app must include test documents in a dedicated test folder.

The app must include browser-based validation using Playwright when available. Playwright is acceptable for end-to-end testing because it is a browser testing tool for modern web apps and supports desktop, tablet, and mobile browser contexts.

The coding agent must not treat these constraints as suggestions. If an implementation choice conflicts with these constraints, choose another implementation.

---

E00 Agent Operating Loop

---

The coding agent must use this loop throughout the project: understand, research, compare, decide, implement, validate, refactor, document.

Understand means read the relevant section of this design note and identify the requirement, the user experience goal, the technical constraints, and the acceptance criteria.

Research means inspect local files first, then research external references only when needed for correctness, dependency choice, browser behavior, licensing, or visual fidelity. Research must be purposeful. Do not browse randomly. Use primary sources when possible.

Compare means consider at least two viable approaches when the decision affects architecture, dependencies, security, storage, rendering, animation, parsing, testing, or maintainability. Record the reasoning in concise comments, a development note, or commit-style summary when useful.

Decide means make the choice without waiting for user approval when the requirement provides enough direction. Prefer the option that improves product quality, code maintainability, offline behavior, debuggability, and the realism of the E Ink reading experience.

Implement means write small, inspectable, modular code. Avoid over-engineering. Avoid magic. Avoid hidden dependency chains. Keep names clear.

Validate means run the app, test sample files, inspect visual output, check the console, test errors, test reduced motion, test keyboard paths, test desktop/tablet/mobile viewports, and run Playwright tests when available.

Refactor means improve the code after validation. Remove duplication, clarify boundaries, tighten error handling, and simplify modules. Do not leave obviously messy code merely because it works once.

Document means update local notes, dependency manifests, test descriptions, and comments where they help future troubleshooting. Do not write bloated documentation. Write only what future maintainers need.

This loop is required for every significant feature. The coding agent must work autonomously inside this loop.

---

F00 Project Structure

---

Use a simple static project structure. The exact filenames may vary if the coding agent has a better reason, but the structure must stay inspectable and understandable.

Suggested structure:

```text
/
  index.html
  README.md
  LICENSES.md

  /assets
    /fonts
      /literata
      /charis-sil
      /source-serif-4
      /merriweather
      /atkinson-hyperlegible
      fonts.css
      licenses/
    /textures
      paper-noise.svg
      paper-noise.png
    /icons
      icon.svg

  /css
    reset.css
    base.css
    reader.css
    eink.css
    settings.css
    responsive.css

  /js
    app.js
    state.js
    file-open.js
    parser-txt.js
    parser-markdown.js
    renderer.js
    paginator.js
    scroll-reader.js
    settings.js
    preferences.js
    eink-effect.js
    logging.js
    errors.js
    accessibility.js
    utils.js

  /vendor
    /markdown-it
      markdown-it.js
      LICENSE
      VENDOR.md
    /dompurify
      purify.js
      LICENSE
      VENDOR.md

  /scripts
    vendor-check.mjs
    vendor-fetch.mjs
    vendor-manifest.json
    smoke-test.mjs
    serve-static.mjs

  /tests
    /fixtures
      simple.txt
      long-book.txt
      simple.md
      markdown-edge-cases.md
      large-headings.md
      unicode.txt
      unsupported.pdf
    /playwright
      reader.spec.js
      settings.spec.js
      markdown.spec.js
      responsive.spec.js
      accessibility.spec.js
```

Keep runtime JavaScript in `/js`. Keep third-party vendored code in `/vendor`. Keep fonts in `/assets/fonts`. Keep test documents in `/tests/fixtures`. Keep optional developer scripts in `/scripts`.

Do not put app logic into inline `<script>` blocks except for a tiny boot guard if absolutely necessary. Do not put large CSS blocks into `index.html`. The app should be easy to inspect file by file.

The coding agent may adjust file names and module boundaries, but must preserve the basic separation between app code, vendor code, assets, scripts, and tests. If a different structure is chosen, it must be simpler or more maintainable than the suggested structure.

---

G00 Runtime Architecture

---

Use a small vanilla JavaScript architecture.

The app should have explicit modules for file loading, parsing, document normalization, rendering, reading mode, settings, preferences, E Ink effect, logging, and error handling.

The app state should be centralized enough that behavior is understandable. Avoid scattered global variables. A simple state object is acceptable. A tiny event bus is acceptable if it reduces coupling. Do not introduce a framework.

Suggested state shape:

```js
const appState = {
  document: {
    loaded: false,
    fileName: null,
    fileType: null,
    characterCount: 0,
    lineCount: 0,
    title: null,
    sections: [],
    sourceText: null
  },
  reader: {
    mode: "paged",
    currentPageIndex: 0,
    scrollTop: 0,
    pageCount: 0,
    layoutReady: false
  },
  preferences: {
    fontFamily: "Literata",
    fontSize: 20,
    lineHeight: 1.55,
    measure: 68,
    theme: "warm-paper",
    contrast: "soft",
    einkIntensity: "balanced",
    motion: "system",
    refreshStyle: "adaptive"
  },
  ui: {
    settingsOpen: false,
    busy: false,
    lastError: null,
    debugEnabled: false
  }
};
```

Do not persist `document.sourceText`. It may exist in memory for the current session only.

Use DOM events carefully. Keep event binding centralized enough that reader interactions can be audited. Important events are file selection, drop, page next, page previous, scroll, settings open, settings close, preference change, resize, orientation change, reduced-motion change, and keyboard shortcuts.

The app should handle lifecycle events. On load, initialize preferences, set up UI, check reduced-motion preference, verify vendored dependencies are available, and show the file-open screen. On file load, parse and render. On settings changes, update preferences, re-layout when needed, and run the E Ink transition. On unload or reload, do not save book content.

The coding agent must avoid creating a hidden framework. Keep the architecture small enough that a future developer can troubleshoot it by reading the files directly.

---

H00 Dependency Policy

---

Vendored dependencies are allowed only when they clearly improve quality, safety, or maintainability.

The expected dependency set is small. A Markdown parser is likely needed. A sanitizer may be needed even if raw HTML is disabled, because defense in depth is valuable. `markdown-it` is a strong candidate because it is browser-compatible, configurable, CommonMark-oriented, and safe by default according to its project documentation. `DOMPurify` is a strong candidate for sanitization because it is a browser-side sanitizer for HTML, MathML, and SVG and is maintained as a dedicated security library.

The coding agent must research the current upstream files and choose the best dependency approach. The likely baseline is vendored `markdown-it` plus vendored `DOMPurify`, but this is not mandatory if the agent can implement a simpler, safer Markdown subset without lowering product quality. The decision must respect all constraints: no npm runtime, no build step, unminified vendored source, readable code, documented license, and no runtime external requests.

Do not vendor large libraries for small tasks. Do not add UI libraries, state management libraries, CSS frameworks, icon libraries, animation frameworks, syntax highlighters, analytics libraries, or file manager libraries unless there is a strong reason and the dependency passes the same vendor rules.

Every vendored dependency must have a `VENDOR.md` file containing the package name, upstream project, exact version or commit, download source, downloaded files, license, reason for inclusion, date vendored, and verification notes.

Example `VENDOR.md` content:

```md
# markdown-it

Purpose: Markdown parsing for local `.md` and `.markdown` files.

Version: [exact version]
Source: [exact upstream release or CDN file URL]
License: MIT
Vendored files:
- markdown-it.js
- LICENSE

Runtime network use: none.
Minified files: none.
Source maps: none required.

Verification:
- File is readable and unminified.
- License file included.
- Browser global or module loading tested.
- Raw HTML rendering disabled in app configuration.
```

Use `scripts/vendor-manifest.json` to track dependencies and fonts. The script may download missing dependencies, but it should not overwrite existing vendored files without an explicit flag or clear operator action.

The coding agent must verify dependencies after vendoring. If a file is minified, unreadable, license-missing, or unsuitable for direct browser use, reject it and choose another source.

---

I00 Font Policy

---

All fonts are local runtime assets.

The default body font is Literata. Literata should be used for the first reading experience because it is a long-form digital reading serif and is available under the SIL Open Font License.

The font menu should include a small curated set, not a massive font catalog. Suggested bundled fonts are Literata, Charis SIL, Source Serif 4, Merriweather, Atkinson Hyperlegible, and Noto Serif if file size remains acceptable. Atkinson Hyperlegible is especially useful for UI or accessibility-focused reading because it was designed to make similar characters more distinguishable for low-vision readers and is available under the SIL Open Font License.

The coding agent must research and verify each font before vendoring. Include license files. Prefer WOFF2 for browser delivery. Include regular, italic, bold, and bold italic only when needed. Avoid excessive weights. Variable fonts are acceptable if browser support and rendering quality are good.

Font loading must use local `@font-face` declarations. Use `font-display` deliberately. For a reader, avoid visible font popping after a book is already rendered. Consider loading core fonts before entering reader mode, or using a controlled refresh after font load.

Suggested `fonts.css` pattern:

```css
@font-face {
  font-family: "Literata";
  src: url("./literata/Literata-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Literata";
  src: url("./literata/Literata-Italic-Variable.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}
```

The reading UI should let the user select the body font. UI controls may use Atkinson Hyperlegible, system UI, or another bundled UI font. The font selector should show a sample line for each font if practical.

Do not modify font files unless the license allows it and the modified font name follows license requirements. Some SIL Open Font License families may have reserved font name restrictions, so the agent must verify license details before modification. Google Fonts notes that some OFL fonts use reserved font name requirements. The normal path is to use unmodified font files.

The coding agent must treat font choice as both a design and licensing task. Do not guess.

---

J00 File Input Requirements

---

The app must support file picker input and drag-and-drop input.

The file picker should accept `.txt`, `.md`, `.markdown`, and MIME types where useful. MIME types are not reliable enough by themselves, so validation must use extension, MIME type, and content fallback where reasonable.

Drag-and-drop should accept one file at a time. If the user drops multiple files, show a clear message and use no file unless the UI explicitly asks the user to choose one. Do not silently choose the first file.

Use browser File APIs for local reading. The FileReader API is a standard browser API for reading local user-provided files, and the browser Drag and Drop API supports dragging files from the operating system into a web page. Modern implementations may also use `Blob.text()` when appropriate. The coding agent must choose the cleanest browser-supported approach after checking target compatibility.

File validation must happen before parsing. Reject unsupported files with a readable message.

Suggested validation behavior:

```text
Accepted:
- .txt
- .md
- .markdown

Rejected:
- empty file
- multiple files
- files above configured size limit
- unsupported extension
- binary-looking content
- unreadable text
```

Set a practical file size limit. The exact value is an implementation decision. The agent should research browser memory behavior and test large text fixtures. A reasonable starting point is a warning above 2 MB and a hard limit somewhere around 10 MB to 20 MB unless testing proves larger files are safe. The app is a visual reader, not a bulk text processor.

The file-open screen must state that contents stay local and are not stored after the session. This statement must remain accurate.

The coding agent must test file loading with TXT, Markdown, empty files, large files, Unicode files, unsupported files, and multiple-file drag attempts.

---

K00 Text Parsing And Normalization

---

TXT files should render as readable prose with preserved paragraph structure.

Normalize line endings to `\n`. Remove or ignore a UTF-8 BOM. Preserve meaningful blank lines. Collapse excessive blank lines only where it improves reading and does not corrupt intentional spacing. Convert plain text paragraphs into semantic blocks. Avoid rendering the entire TXT file as a single `<pre>` unless the file appears to be structured code or fixed-width text.

Markdown files should be parsed into safe HTML. Raw HTML must be stripped or escaped. The app must not trust Markdown input.

If using `markdown-it`, configure it to disable raw HTML. Consider settings equivalent to `html: false`, with linkification and typographer behavior chosen based on reading quality. If using another parser, configure equivalent behavior. If implementing a custom parser, document the supported subset and make sure unsupported constructs fail safely.

After parsing Markdown, sanitize the generated HTML as defense in depth if a sanitizer is vendored. Configure sanitizer rules to allow only reading-safe tags and attributes. Do not allow script, style, event handler attributes, iframes, object embeds, remote image loading, external resource injection, or arbitrary inline CSS. Since the product supports text and Markdown reading, not web content rendering, restrictive sanitization is correct.

Images in Markdown require a product decision. The current core requirement is text and Markdown reading. The safest baseline is to ignore remote images, show local image syntax as text, or render a placeholder that says images are not supported in this version. Do not make runtime network requests to load remote images from Markdown. If the agent chooses to support embedded data images, it must validate memory and security impact.

Links in Markdown may render as text links, but the app must not surprise the user. External links should be visually subdued and open only by explicit user action. Consider showing the URL destination on hover or focus. Do not prefetch links.

Tables, code blocks, blockquotes, headings, lists, emphasis, horizontal rules, and inline code should render readably. Code blocks should not dominate the reading experience. Long code lines should wrap or scroll within the reading column depending on the chosen design.

The coding agent must create Markdown fixtures that include headings, paragraphs, emphasis, lists, blockquotes, code blocks, links, raw HTML, script-like content, tables if supported, Unicode, and malformed Markdown. Validate that raw HTML does not execute or render as trusted markup.

---

L00 Internal Document Model

---

Convert loaded files into a normalized internal document model before rendering.

The model should separate source input, metadata, sections, blocks, and layout state. The model does not need to be complex, but it must avoid making pagination and rendering depend on raw source strings scattered through the app.

Suggested document model:

```js
const normalizedDocument = {
  id: "session-only-generated-id",
  fileName: "book.md",
  fileType: "markdown",
  title: "Detected Or File Name Title",
  characterCount: 123456,
  wordEstimate: 20000,
  sections: [
    {
      id: "section-1",
      heading: "Chapter 1",
      level: 1,
      html: "<h1>Chapter 1</h1><p>...</p>",
      plainText: "Chapter 1\n..."
    }
  ]
};
```

The document ID must be session-only and not used to persist contents. It may help with logging and layout.

Detect a title using Markdown first heading, TXT first non-empty line, or filename fallback. Do not overcomplicate title extraction.

For long files, split into sections by Markdown headings or text boundaries. This helps rendering, pagination, and future troubleshooting. The agent should decide exact splitting strategy based on performance testing.

Do not store the source text after it is no longer needed if memory pressure is a concern. Since the content must not persist, it is acceptable to keep source text in memory while the session is active, but the code should be explicit that this is session-only.

The coding agent must validate the document model with both small and large fixtures before building pagination on top of it.

---

M00 Rendering Requirements

---

Render content semantically. Use `<main>`, `<article>`, headings, paragraphs, blockquotes, lists, code blocks, and other appropriate elements. Do not render everything as a flat string of `<div>` elements.

The reading column should default to a book-like measure. Start around 60 to 72 characters per line. The user may adjust page width or measure. Body text should default around 18 to 22 CSS pixels depending on viewport. Line height should default around 1.5 to 1.65.

Use low-contrast colors. Avoid pure black on pure white by default. A reasonable initial theme is warm paper background with dark charcoal text. Offer at least warm paper, cool paper, high contrast grayscale, and dark inverse modes if practical.

The page surface should include subtle paper grain. Use a local SVG or generated CSS texture. Keep the texture subtle. It should be almost invisible during reading and more noticeable only when the reader intentionally inspects the surface. Do not use heavy noise that makes text harder to read.

The renderer must avoid layout shifts during reading. Settings changes may reflow text, but the app should preserve approximate reading position. Page mode should preserve page index or nearest anchor. Scroll mode should preserve position by content anchor where possible.

The app must not depend on remote images, remote CSS, or remote fonts.

The coding agent must visually inspect typography in the browser after implementing rendering. Text should feel like a reader surface, not a generic web article.

---

N00 Page Mode

---

Page mode displays a single page-like reading viewport or spread-like surface depending on viewport size. The baseline should be one page. A two-page spread may be considered for wide desktop screens if it improves quality without creating complexity. The agent should use best judgment.

Page mode requires pagination. Pagination must account for current font, font size, line height, page width, viewport size, margins, and rendered Markdown elements. Pagination must recalculate when relevant settings change, when fonts load, when viewport size changes, and when orientation changes.

Pagination must avoid cutting important elements awkwardly when practical. It is acceptable to split long paragraphs, but avoid leaving headings alone at the bottom of a page. Avoid splitting code blocks in a confusing way unless necessary.

Navigation methods should include clickable/tappable zones, buttons, keyboard shortcuts, and touch gestures where practical. Suggested keyboard controls: ArrowRight or Space for next page, ArrowLeft for previous page, Home for beginning, End for end, Escape to close settings.

The app must show page position. Keep it subtle. Example: `Page 12 of 140` or a small progress indicator.

Page transitions must use the E Ink simulation. Next page and previous page are the most important transition path. The transition should account for direction if practical, but it should not look like a glossy slide animation. It should feel like a screen refresh.

The coding agent must test page mode with short, medium, and long fixtures; different fonts; mobile portrait; tablet landscape; and desktop widths.

---

O00 Scroll Mode

---

Scroll mode displays continuous content in a reading column.

Scroll mode still participates in the E Ink simulation. Since normal scroll movement can become unpleasant if every pixel scroll triggers a flash, do not run a heavy refresh for every scroll event. Use E Ink transitions for major state changes: file load, mode switch, settings changes, jump to top, jump to section, restore position, and possibly page-step navigation inside scroll mode. For normal continuous scrolling, use subtle texture and ghosting only if it does not harm usability.

The scroll surface must remain performant. Avoid expensive per-scroll effects. Do not repaint large canvases on every scroll unless testing proves it is safe.

Scroll mode should preserve reading position across settings changes using an anchor or percentage fallback. Since book content is not persisted, only preserve position within the active session and optional preference state where it does not imply content persistence.

Scroll mode should support keyboard navigation. Arrow keys, PageUp, PageDown, Home, and End should behave naturally.

The coding agent must make scroll mode feel intentionally designed, not a fallback. It should still look like an E Ink reader.

---

P00 E Ink Visual Simulation

---

The E Ink simulation is a core product feature.

The simulation should combine several cues: grayscale palette, matte paper tone, limited contrast, subtle paper texture, slight ghosting, flicker or flash during refresh, delayed settling, and optional dithering or speckle.

The default effect should be balanced. It should be visible enough that the app feels unlike a normal website, but not so aggressive that reading becomes tiring. The user must be able to reduce or disable motion and visual disturbance.

Suggested refresh sequence for page changes:

```text
1. Capture or preserve the outgoing visual state.
2. Begin a low-duration wash phase.
3. Briefly invert, brighten, darken, or desaturate the surface depending on chosen refresh style.
4. Show a faint residual imprint of the outgoing page.
5. Reveal the incoming page through stepped grayscale settling.
6. Leave minimal ghosting for authenticity.
7. Clear or reduce accumulated ghosting after full refresh events.
```

Do not implement this as a simple opacity fade unless no better fallback is available. A fade is not enough to suggest E Ink.

The effect may be implemented with CSS overlays, pseudo-elements, canvas snapshots, View Transition API, Web Animations API, or a hybrid. The View Transition API is relevant because it provides a browser mechanism for animated transitions between DOM states and can support single-page app view transitions. The coding agent must evaluate whether the API provides enough browser support and control. If it is not reliable enough, use a custom overlay transition.

Possible implementation layers:

```text
CSS-only baseline:
- reader overlay
- keyframe animation
- grayscale filters
- opacity flicker
- paper texture layer
- ghost layer

Canvas-enhanced mode:
- snapshot outgoing content
- apply threshold or dither
- blend old and new states
- render speckle or ghosting overlay

Advanced mode:
- View Transition API or Web Animations API
- optional OffscreenCanvas for image processing
```

OffscreenCanvas can run rendering work away from the DOM and in worker contexts, which may help if the agent chooses canvas-based image processing. Use it only if it improves performance or code clarity. Do not add complexity for its own sake.

E Ink simulation intensity should be configurable. Suggested values: off, reduced, balanced, strong. Reduced should keep paper styling but minimize flashing. Strong may include more visible inversion, speckle, and ghosting.

The app should simulate both full refresh and partial refresh. Full refresh should be used for file load, mode switch, theme switch, font switch, large layout recalculation, and periodic cleanup after several partial transitions. Partial refresh should be used for page turns and smaller changes when appropriate. Partial refresh may preserve faint ghosting. Full refresh should clear ghosting.

The coding agent must tune the effect in the browser. If the effect looks broken, flashy, cheap, or distracting, revise it. Visual acceptance matters.

---

Q00 Motion And Accessibility

---

The app must respect `prefers-reduced-motion`. This media feature indicates that the user has requested reduced non-essential motion at the system level.

If reduced motion is active, default to reduced E Ink effects. Do not use aggressive flashing, rapid inversion, shaking, or repeated flicker. The user may explicitly choose stronger effects, but the default must respect the system preference.

Avoid flashing patterns that could be unsafe or uncomfortable. Keep refresh flashes brief, limited, and user-configurable. Never require flashing for core usability.

All controls must be keyboard reachable. Focus states must be visible but visually compatible with the grayscale reader design. Use clear focus outlines. Do not remove outlines without replacement.

Settings must be operable by keyboard and touch. Dialogs must have focus management. Escape should close settings. The file picker and drop zone must have accessible labels.

The reader text must maintain sufficient contrast. Even when simulating low-contrast E Ink, do not make the text unreadable. Provide a higher contrast theme.

The coding agent must test reduced motion, keyboard-only operation, focus visibility, screen size changes, and basic semantic structure.

---

R00 Preferences

---

Preferences may persist locally. Book contents must not persist.

Use localStorage for simple preference persistence unless the agent has a better static-browser reason to choose another lightweight browser storage mechanism. Keep the stored object small and explicit.

Suggested persisted preferences:

```js
{
  "version": 1,
  "fontFamily": "Literata",
  "fontSize": 20,
  "lineHeight": 1.55,
  "measure": 68,
  "readerMode": "paged",
  "theme": "warm-paper",
  "contrast": "soft",
  "einkIntensity": "balanced",
  "refreshStyle": "adaptive",
  "motion": "system",
  "showProgress": true,
  "debugEnabled": false
}
```

Do not persist `sourceText`, parsed HTML, normalized sections, file body, rendered page HTML, or book cache. Do not store enough content to reconstruct the book.

Preference loading must be safe. Validate stored values before applying them. If preferences are corrupt, invalid, or from an older version, migrate or reset safely.

Settings changes should apply immediately when possible. If a change requires re-layout, show a subtle busy state and run the E Ink transition. Avoid losing reading position.

The coding agent must test corrupted localStorage values, missing preferences, preference migration, and reset behavior.

---

S00 Settings Interface

---

Settings should feel like a device settings panel, not an admin dashboard.

The panel should include sections for reading mode, typography, display, E Ink behavior, accessibility, and advanced diagnostics.

Reading mode settings include page mode and scroll mode.

Typography settings include font family, font size, line height, page width or measure, paragraph spacing, and optional text alignment. Avoid full justification by default unless it looks good with the selected font and layout.

Display settings include paper theme, contrast, margin size, texture strength, and dark mode if implemented.

E Ink behavior settings include intensity, refresh style, full refresh interval, ghosting amount, and motion preference. The user should be able to turn the effect off.

Accessibility settings include reduced motion override, high contrast theme, larger controls, and keyboard shortcut reference.

Advanced diagnostics may include debug mode, show layout boxes, show page count recalculation, export logs, or clear preferences. Keep this collapsed or hidden by default.

The settings panel must not require network access. Font choices must reflect locally available fonts.

The coding agent must make settings changes robust. Every setting must have validation, UI state, persistence where appropriate, and a visual update path.

---

T00 Error Handling

---

Errors must be clear, recoverable, and logged.

User-facing errors should explain what happened and what the user can do next. Examples: choose another file, reduce file size, reopen the file, switch to plain text mode, reset preferences, or report diagnostics.

Do not show raw exception objects to normal users. Do not show huge stack traces in the main UI. Log technical details to the console and optional debug panel.

Expected error cases:

```text
No file selected.
Multiple files dropped.
Unsupported file type.
Empty file.
File too large.
File read failed.
Text decoding failed.
Markdown parser unavailable.
Markdown parse failed.
Sanitizer unavailable.
Font failed to load.
Pagination failed.
Layout could not stabilize.
Preference load failed.
Preference save failed.
Browser feature unavailable.
Playwright test fixture failed during development.
```

Each critical path should use `try/catch` or promise rejection handling where appropriate. Errors should flow through a central error module so behavior is consistent.

If an error happens in the middle of a process and user choice is useful, show a safe choice. Example: if Markdown parsing fails, offer to reopen the file as plain text for this session. If pagination fails, offer to switch to scroll mode. If a selected font fails, fall back to Literata or system serif and show a warning.

The coding agent must test error paths intentionally. Do not only test successful loading.

---

U00 Logging And Diagnostics

---

Implement structured local logging for development and troubleshooting.

Logging must not send data anywhere. No analytics. No telemetry network requests. No remote crash reporting.

Use a small logging module with levels such as debug, info, warn, and error. Logs should include timestamps, event names, and relevant metadata. Do not log full book contents. Do not log large content excerpts. It is acceptable to log file name, file size, detected type, character count, section count, page count, preference keys, and error names.

Suggested log events:

```text
app:init
preferences:loaded
preferences:invalid
file:select
file:drop
file:validated
file:read:start
file:read:success
file:read:error
parser:txt:start
parser:markdown:start
parser:markdown:error
document:normalized
renderer:start
renderer:complete
pagination:start
pagination:complete
pagination:error
eink:refresh:start
eink:refresh:complete
settings:change
mode:switch
error:shown
```

Debug mode may expose recent logs in an advanced panel. The panel should allow copying logs. Copying logs must not include book content.

Console logs should be useful during development but not noisy in normal use. Use debug gating for verbose logs.

The coding agent must use logging to make failures diagnosable. If a future developer cannot tell where the loading or rendering pipeline failed, logging is insufficient.

---

V00 Performance Requirements

---

The app should remain responsive on common desktop, tablet, and mobile browsers.

Avoid rendering huge documents into an unnecessarily large DOM all at once if it causes slowdowns. For many books, rendering the full document may be acceptable. For larger documents, section-based rendering, lazy pagination, or chunked layout may be needed. The coding agent must test and choose the practical strategy.

Avoid expensive layout loops. Pagination can easily become slow if it repeatedly measures DOM after every small mutation. Batch DOM writes and reads. Use `requestAnimationFrame` where appropriate. Recalculate only when inputs change.

Avoid heavy canvas effects on every frame. E Ink transitions should be short and bounded. If using canvas snapshots, limit resolution or region size when necessary.

Settings changes should show a busy state if recalculation takes noticeable time. The app should not freeze without feedback.

The agent should define basic performance targets after testing. Suggested targets: small files load nearly instantly, medium files load without noticeable jank, large accepted files show progress or busy state, page turns complete within a comfortable reading-device-like duration, and settings changes recover predictably.

The coding agent must validate performance with long TXT and Markdown fixtures. If performance is poor, simplify the effect, chunk rendering, or refactor layout.

---

W00 Responsive Behavior

---

Desktop, tablet, and mobile behavior must be fully specified by implementation and tested.

Desktop should support keyboard-heavy reading, centered page surface, optional side controls, and comfortable wide margins.

Tablet should support touch page turns, orientation changes, and a page surface sized for hand-held reading. Controls should be touch-friendly but not oversized.

Mobile should support narrow reading width, larger touch targets, stable scroll mode, and page mode that does not feel cramped. Settings should become a full-screen or bottom-sheet style panel if that is more usable.

Orientation changes must trigger re-layout. Preserve the nearest reading position.

Touch controls should avoid accidental navigation. Edge tap zones are acceptable, but they must not block text selection or settings interaction. Swipe gestures are acceptable if they do not interfere with normal scrolling.

Viewport units should account for mobile browser chrome where possible. Avoid layouts that break when the address bar collapses or expands.

The coding agent must run Playwright or browser tests for desktop, tablet, and mobile viewport sizes. Visual inspection is required for at least one narrow mobile viewport and one tablet landscape viewport.

---

X00 Keyboard And Input Behavior

---

Keyboard operation is required.

Suggested shortcuts:

```text
Right Arrow: next page in page mode.
Left Arrow: previous page in page mode.
Space: next page in page mode.
Shift + Space: previous page in page mode.
PageDown: next page or scroll down.
PageUp: previous page or scroll up.
Home: beginning.
End: end.
Escape: close settings or dismiss non-critical overlay.
S: open settings, unless focus is inside an editable control.
O: open file picker, unless focus is inside an editable control.
```

Do not hijack keyboard input when focus is inside a form control, select, slider, text input, or button where default behavior matters.

Mouse behavior should support buttons and optional left/right reading zones.

Touch behavior should support tapping controls and optional page-turn zones. Gestures must be forgiving.

The coding agent must implement input handling centrally enough that conflicts can be debugged.

---

Y00 Markdown Rendering Details

---

Markdown headings should create visible structure without looking like a documentation site. Headings should feel like book chapter headings.

Paragraphs should have comfortable spacing. Avoid excessive Markdown default margins.

Blockquotes should be quiet and readable. Use a subtle border or indentation.

Code blocks should be legible. Use a local monospace fallback or bundled font only if necessary. Code blocks should not cause horizontal page overflow on mobile.

Lists should render readably but not with web-default spacing that looks too loose. Since the user dislikes heavy list formatting, the visual design should keep lists calm and compact.

Horizontal rules can act as section breaks.

Links should be low-key. External URLs should not be fetched by the app. Clicking a link may open it in a new tab only after explicit user action. Consider adding `rel="noopener noreferrer"`.

Raw HTML must not render as trusted HTML. It should either appear escaped as text or be stripped, based on the chosen design. The user's stated preference is strip and escape raw HTML. A practical interpretation is: do not execute or render raw HTML; preserve the user's visible text where safe; escape visible raw tags if preserving them helps the reader understand the source. The agent must choose a consistent behavior and test it.

The coding agent must verify Markdown security with fixtures containing `<script>`, inline event handlers, iframes, style tags, image tags with remote URLs, and malformed HTML.

---

Z00 Security And Privacy

---

The app is local-first and privacy-preserving by design.

Do not upload files. Do not call remote APIs. Do not load remote fonts. Do not load remote scripts. Do not load remote Markdown images. Do not send logs. Do not embed analytics.

Treat local files as untrusted input. A local Markdown file can still contain hostile HTML or confusing markup. Disable raw HTML and sanitize parsed output.

Do not use `innerHTML` with unsanitized content. If using `innerHTML` after Markdown parsing, ensure the output came from a safe parser configuration and sanitizer. For plain text, prefer text nodes or escaped conversion.

Use a restrictive Content Security Policy if practical for a static app. Since the app may run from `file://`, test CSP behavior carefully. If CSP causes local file issues, document the limitation and maintain safe coding practices.

Do not use `eval`, `new Function`, dynamic script injection, or inline event handlers.

The coding agent must inspect all paths where file contents enter the DOM.

---

AA00 Storage Rules

---

Persistent storage is allowed only for preferences and non-content operational state.

Allowed examples:

```text
Selected font name.
Font size.
Line height.
Reader mode.
Theme.
E Ink intensity.
Reduced motion override.
Debug enabled flag.
Last settings panel section.
```

Disallowed examples:

```text
Book source text.
Parsed book HTML.
Normalized book sections.
Page text.
Markdown AST containing book content.
Full-text search index.
Reading excerpts.
Bookmarks containing quoted book text.
Annotations containing copied book text.
```

Reading position is tricky because the book is not stored. In this version, the safest behavior is to preserve reading position only within the active session. If the app stores last position, it must store only generic metadata such as file name, file size, and approximate percentage, and it must not imply the book can be restored without reopening. The coding agent should avoid persisted reading position unless it is implemented with clear privacy and UX safeguards.

When the user reloads the app, show preferences but no book. The UI should say that the book must be reopened.

The coding agent must audit storage writes and ensure no book content is persisted.

---

AB00 Visual Design System

---

Use a grayscale-first design system.

Suggested color tokens:

```css
:root {
  --paper-bg: #f3f0e8;
  --paper-bg-cool: #eef0ed;
  --paper-bg-contrast: #faf9f4;
  --ink: #1f1f1c;
  --ink-soft: #34342f;
  --ink-muted: #686860;
  --line-soft: rgba(31, 31, 28, 0.16);
  --surface-shadow: rgba(31, 31, 28, 0.08);
}
```

Keep tokens centralized. Avoid hard-coded colors scattered throughout CSS.

The default theme should feel like warm paper under ambient light. A cool paper theme may feel closer to some devices. A high-contrast grayscale theme is required for readability. A dark theme is optional but useful.

Use subtle borders and texture. Avoid heavy card shadows. Avoid glossy buttons.

Controls should feel physical but restrained. A reader device can have minimal controls and clear state.

The coding agent must tune visual tokens in browser, not only in code.

---

AC00 E Ink Effect Technical Notes

---

The app should have a single E Ink effect controller.

The controller should expose methods such as:

```js
runFullRefresh(reason, updateDomCallback)
runPartialRefresh(reason, updateDomCallback)
runSettingsRefresh(reason, updateDomCallback)
runReducedRefresh(reason, updateDomCallback)
```

The exact API is up to the agent, but the app should not duplicate refresh logic across modules.

The effect controller should know whether reduced motion is active, whether the effect is disabled, what intensity is selected, and whether the current browser supports the chosen APIs.

A safe implementation pattern is:

```text
1. Lock user navigation briefly.
2. Add refresh overlay.
3. Run outgoing phase.
4. Apply DOM update.
5. Wait for layout or fonts if needed.
6. Run incoming phase.
7. Remove overlay.
8. Unlock navigation.
9. Log completion.
```

If an error occurs during refresh, unlock the UI and show the updated DOM without the effect. Never leave the app stuck behind an overlay.

Use CSS classes and variables for the baseline effect. Use JavaScript to coordinate timing and DOM updates. Canvas or View Transition API can be layered later if they improve realism.

The coding agent must test interruption cases: fast repeated page turns, settings changed during transition, resize during transition, reduced motion toggled, and error thrown inside the DOM update callback.

---

AD00 Pagination Technical Notes

---

Pagination is one of the hardest parts. Treat it as a feature requiring research and validation.

Possible approaches:

```text
CSS columns:
- Can flow text into page-like columns.
- May be simpler.
- Can be difficult for precise page controls and element measurement.

DOM measurement:
- Render content into hidden measuring container.
- Split blocks into pages based on height.
- More control, more complexity.

Hybrid:
- Section-level pagination with measured containers.
- Simpler than line-level splitting.
- Good enough if visual quality is acceptable.
```

The coding agent must evaluate these options and choose the best practical approach. The choice must balance visual quality, code maintainability, performance, and mobile behavior.

Do not spend excessive complexity on perfect print-quality pagination if it harms the product. The page experience should be credible and stable.

Page count must update after fonts load. Font loading affects layout. Use `document.fonts.ready` if appropriate and supported.

If pagination fails, fall back to scroll mode and show a clear warning.

The agent must create tests that verify page count exists, next/previous page changes visible content, settings changes recalculate pages, and page index remains valid after resize.

---

AE00 Font Loading And Layout Stability

---

Font loading is part of layout.

The app should know when the selected font is ready before final pagination. If the selected font is not ready, use a temporary layout state or render with fallback and then repaginate after font load.

Font changes should trigger a full E Ink refresh because real E Ink-like layout changes should feel like a device redraw.

If a font fails to load, fall back to Literata. If Literata fails, fall back to Georgia or generic serif. Log the failure and show a subtle warning.

Do not let font loading cause infinite pagination loops. Track layout generations or use cancellation tokens when recalculating.

The coding agent must test each bundled font with page and scroll modes.

---

AF00 Developer Scripts

---

Developer scripts are allowed as helper tools, not as runtime requirements.

Bun is allowed for scripts. Bash and PowerShell are allowed. Use the simplest script technology that is likely to work in the target environment.

`scripts/vendor-manifest.json` should describe every dependency and font source.

Suggested manifest shape:

```json
{
  "dependencies": [
    {
      "name": "markdown-it",
      "version": "x.y.z",
      "source": "https://cdn.jsdelivr.net/npm/markdown-it@x.y.z/dist/markdown-it.js",
      "target": "vendor/markdown-it/markdown-it.js",
      "licenseSource": "https://raw.githubusercontent.com/markdown-it/markdown-it/master/LICENSE",
      "licenseTarget": "vendor/markdown-it/LICENSE",
      "required": true,
      "unminified": true
    }
  ],
  "fonts": [
    {
      "name": "Literata",
      "versionOrCommit": "exact commit or release",
      "source": "exact font file URL",
      "target": "assets/fonts/literata/Literata-Variable.woff2",
      "licenseSource": "exact license URL",
      "licenseTarget": "assets/fonts/licenses/Literata-OFL.txt",
      "required": true
    }
  ]
}
```

The vendor check script should verify that expected files exist, licenses exist, vendored files are not minified by name, and file sizes are plausible. It should print a clear report.

The vendor fetch script may download missing files. If a file already exists, skip it by default and report that it exists. Add an explicit `--force` option only if useful.

Scripts should not require npm install. If using Bun standard APIs is enough, use Bun. If using shell, keep commands portable or provide Bash and PowerShell variants.

The coding agent must run vendor checks and fix missing vendor metadata before considering the project complete.

---

AG00 Testing Strategy

---

Testing must cover product behavior, visual behavior, accessibility behavior, and error behavior.

Use static fixture files under `/tests/fixtures`. Create at least these files:

```text
simple.txt
A short plain text document with several paragraphs.

long-book.txt
A long plain text file with many paragraphs and chapter-like breaks.

simple.md
Basic Markdown with headings, emphasis, blockquotes, lists, links, and code.

markdown-edge-cases.md
Raw HTML, script-like content, malformed Markdown, tables if supported, nested formatting, and unusual whitespace.

unicode.txt
Unicode text with accented characters, punctuation, non-Latin samples, and long lines.

large-headings.md
Many headings and sections to test navigation and layout.

unsupported.pdf
A small dummy or fixture placeholder used only to test rejection.
```

Use Playwright for browser tests when available. Playwright supports desktop and mobile browser contexts, so use it for responsive and interaction testing. If Playwright is not installed, the project should document how to run tests in the expected environment, but do not add npm as a project requirement.

Suggested Playwright test areas:

```text
App boots with no network dependency.
File picker path can load TXT through test injection if supported.
Drag-and-drop path can load TXT.
Markdown renders expected safe elements.
Raw HTML does not execute.
Unsupported file shows an error.
Settings open and close.
Font setting changes the reader class or CSS variable.
Page mode next/previous works.
Scroll mode switch works.
Reduced motion disables aggressive refresh.
Mobile viewport displays usable controls.
Tablet viewport preserves reader layout.
No book contents are present in localStorage after load.
```

The coding agent must create tests that are practical for a static app. If browser security prevents direct file picker automation, use a testing hook that simulates a File object in development tests without weakening production behavior.

Manual visual testing is also required. Automated tests cannot fully judge whether the E Ink effect feels credible. The agent must inspect the app in a browser.

---

AH00 Acceptance Criteria

---

The app opens from static files and shows a file-open screen.

The app loads `.txt` files through file picker and drag-and-drop.

The app loads `.md` and `.markdown` files through file picker and drag-and-drop.

Unsupported file types are rejected with a clear message.

Markdown raw HTML does not render as trusted HTML and cannot execute scripts.

The app does not store book contents in persistent storage.

Preferences persist across reloads.

Reloading the app restores preferences but not the book.

The default reading font is local Literata.

The user can change the reading font from local bundled fonts.

The reader supports page mode.

The reader supports scroll mode.

The user can switch between page and scroll mode.

The E Ink refresh effect appears on file load, page turn, mode switch, settings changes, and major layout changes.

Reduced motion is respected.

The app works on desktop, tablet, and mobile viewport sizes.

Keyboard navigation works.

Touch or click navigation works.

Settings are accessible and usable.

Errors are logged and user-facing messages are clear.

Vendor dependencies are local, readable, unminified, licensed, and documented.

Fonts are local, licensed, and documented.

No external network requests occur during normal runtime use.

Playwright or equivalent browser validation exists for core flows.

Test fixtures exist.

The code is modular, readable, and refactored after implementation.

The coding agent must not stop at a technically passing but visually poor result. The E Ink reading experience is part of acceptance.

---

AI00 Implementation Order

---

A sensible implementation order is:

```text
1. Create static project skeleton.
2. Add base HTML, CSS, and app bootstrap.
3. Add logging and error modules.
4. Add preference loading and settings state.
5. Vendor and load fonts.
6. Vendor and verify Markdown/sanitizer dependencies.
7. Implement file picker and drag-and-drop.
8. Implement TXT parser.
9. Implement Markdown parser with raw HTML disabled and sanitization.
10. Implement normalized document model.
11. Implement base reader rendering.
12. Implement scroll mode.
13. Implement page mode and pagination.
14. Implement E Ink effect baseline.
15. Apply E Ink effect to page turns and state changes.
16. Implement settings UI.
17. Implement responsive layouts.
18. Implement accessibility behavior and reduced motion.
19. Add fixtures.
20. Add Playwright tests.
21. Run browser inspection.
22. Refactor.
23. Run final vendor, storage, network, and visual checks.
```

The coding agent may reorder steps when there is a good reason. For example, it may prototype the E Ink effect earlier to validate the visual direction. However, do not leave core architecture, security, or storage rules until the end.

At each step, use the operating loop: understand, research, compare, decide, implement, validate, refactor, document.

---

AJ00 Code Quality Requirements

---

Code must be readable.

Prefer clear functions over clever abstractions. Prefer explicit module boundaries over hidden side effects. Prefer a small number of well-named files over one giant script.

Use modern browser JavaScript, but avoid syntax or APIs that unnecessarily reduce compatibility. If using a newer API, provide fallback or graceful degradation.

Do not use global mutable state casually. If state is global, make it intentional and centralized.

Do not mix parsing, rendering, settings, logging, and effects in one module.

Do not leave dead code, commented-out experiments, or console spam.

Use CSS custom properties for themes and typography. Keep animation names and variables clear.

Use comments for non-obvious decisions, especially around pagination, E Ink effect timing, Markdown security, and storage privacy. Avoid comments that restate the code.

The coding agent must refactor after features work. A first pass is not final if it leaves the system hard to debug.

---

AK00 Browser Support

---

Target current stable desktop and mobile browsers. The app should work in current Chrome, Edge, Firefox, and Safari where practical.

Do not require experimental browser flags.

Advanced visual features may degrade when unsupported. For example, if View Transition API is unavailable, use the custom overlay effect. If OffscreenCanvas is unavailable, use main-thread canvas carefully or CSS-only fallback. If a font loading API is unavailable, use timeout and fallback behavior.

Do not break the core reading experience because an advanced effect is unavailable.

The coding agent must test at least Chromium through Playwright or local browser automation. If other browsers are not available, document that limitation in project notes.

---

AL00 Network And Offline Verification

---

Runtime must be offline-capable after files are vendored.

The agent should test with DevTools network throttling or offline mode if available. The app should still load with all required scripts, styles, fonts, and textures.

No runtime request should go to Google Fonts, jsDelivr, unpkg, GitHub, CDN assets, analytics services, or any remote endpoint.

Markdown content must not trigger remote image loads. External links may exist as anchors, but they must not be prefetched or fetched by the app.

The coding agent must inspect network requests during runtime. If any unexpected external request appears, fix it.

---

AM00 Visual Quality Checklist

---

The first loaded book should immediately look like a reading device.

Text should be calm and comfortable.

The paper background should not be pure white.

The text should not be pure black unless high contrast mode is selected.

The reading width should not be too wide on desktop.

The mobile layout should not feel cramped.

Settings should not visually dominate the reader.

The E Ink transition should feel like refresh and settling, not a standard fade.

Ghosting should be subtle.

Strong E Ink mode may be more dramatic, but balanced mode should be usable for real reading.

Reduced motion mode should remain pleasant.

Font changes should visibly affect the reading experience and should not break layout.

The coding agent must inspect this visually. Automated tests are not enough.

---

AN00 Boundary Conditions

---

Test empty files.

Test whitespace-only files.

Test files with one extremely long line.

Test very long paragraphs.

Test many short paragraphs.

Test unusual Unicode.

Test Windows, Unix, and old Mac line endings.

Test Markdown with raw HTML.

Test Markdown with remote images.

Test Markdown with very deep heading structure.

Test repeated page turns.

Test resizing while paginating.

Test changing font while pagination is active.

Test changing settings during an E Ink transition.

Test reduced motion active before app load.

Test corrupted preferences.

Test missing vendor dependency.

Test missing font file.

Test sanitizer unavailable.

Test Markdown parser unavailable.

Test localStorage unavailable or throwing.

The coding agent must add handling for the failures that are realistic and important. Do not ignore boundary conditions that can corrupt the reader state.

---

AO00 UI Copy Requirements

---

UI copy should be short and functional.

Suggested file-open copy:

```text
Drop a TXT or Markdown book here.
The file is read locally in this browser. It is not uploaded or stored.
```

Unsupported file copy:

```text
This file type is not supported. Open a .txt, .md, or .markdown file.
```

Multiple file copy:

```text
Open one book file at a time.
```

Book not restored copy after reload:

```text
Preferences were restored. Reopen your book file to continue reading.
```

Markdown fallback copy:

```text
Markdown could not be rendered safely. You can reopen this file as plain text.
```

Large file warning copy:

```text
This file is large and may take longer to paginate.
```

Keep copy factual. Do not add marketing language.

---

AP00 Developer Documentation

---

Include a concise `README.md`.

The README should explain what the app does, how to run it as static files, supported formats, privacy behavior, dependency vendoring, optional scripts, tests, and known limitations.

Do not write a long marketing README. The README is for developers and testers.

Include `LICENSES.md` or equivalent license documentation for vendored dependencies and fonts.

Include `VENDOR.md` files next to vendored dependencies.

Include comments in `vendor-manifest.json` only if the chosen format allows it. If using JSON, do not include comments. If comments are needed, use a Markdown companion file.

The coding agent must keep documentation accurate. If implementation differs from suggested structure, update docs.

---

AQ00 Completion Definition

---

The project is complete when the app can be opened locally, loads TXT and Markdown books, renders them safely, supports page and scroll reading, simulates E Ink refresh across major interactions, offers local font preferences, persists preferences only, rejects unsupported files, handles errors clearly, works across desktop/tablet/mobile layouts, includes local vendored readable dependencies and fonts with licenses, includes fixtures and browser tests, and has been visually inspected and refactored.

The coding agent must make final quality decisions autonomously. If there are multiple acceptable options, choose the one that better serves the reader experience, security, maintainability, offline operation, and troubleshooting.

Do not deliver a random prototype. Deliver a coherent static reader.





