---

A00 Social Preview And Install Page Finalization Design Note

---

This task must be implemented at the end of the development cycle. It is a final polishing and wrapping task, not an early architecture task. The social preview metadata, preview image, public page copy, and install link generation should be finalized only after the bookmarklet bundle, demo page, and primary UX are stable.

The goal is to create a production-ready `index.html` installation page for Reading Navigator. The page must explain the bookmarklet clearly, include honest social preview metadata, provide a generated drag-to-install bookmarklet link, and include a social preview image under the `assets` folder.

The previous project used an `index.html` install page with a visible bookmarklet install link, source display, generated size, and a script that built the bookmarklet `href` from a named bookmarklet function using `toString()`. The new project should preserve that core installation technique, but adapt it to the new Bun-bundled distribution artifact and the Reading Navigator product. :contentReference[oaicite:0]{index=0}

---

B00 Scope

---

This design note covers only the final public-facing install page polish.

It covers:

| Area | Included |
|---|---|
| Social metadata | `title`, `description`, Open Graph, X/Twitter cards, canonical URL, image metadata, alt text. |
| Social preview image | Required dimensions, asset path, design direction, validation, ImageMagick use. |
| Install page copy | Honest title and description for the page. |
| Bookmarklet install link | Dynamic generation from the built distribution bundle. |
| Dist bundle integration | Loading the generated distribution bundle into `index.html` and using it to produce the install link. |
| Validation | What must be checked before this task is considered complete. |

It does not cover the internal reading tracker implementation, storage model, segment model, restore engine, minimap behavior, or exploratory Playwright testing except where the install page needs a screenshot or asset generated from the final UI.

---

C00 Product Positioning

---

Reading Navigator should be described as a local-first bookmarklet that helps readers keep their place in long web pages.

The page should avoid exaggerated claims. It should not say the tool knows what the user has read with certainty. It should say it tracks approximate reading progress, identifies the last meaningful reading position, and helps the user return to that position.

The page should not use vendor-specific language. It should not mention any specific browser reading mode, text-to-speech implementation, or third-party product.

Recommended product title:

```txt
Reading Navigator - Bookmarklet for Long-Page Reading Progress
````

Recommended short title where space is limited:

```txt
Reading Navigator
```

Recommended primary description:

```txt
A local-first bookmarklet that tracks approximate reading progress on long web pages, shows heading context, and helps you jump back to your last meaningful reading position.
```

Recommended shorter social description:

```txt
Track approximate reading progress on long web pages and jump back to your last meaningful reading position with a local-first bookmarklet.
```

Do not use claims like:

```txt
Never lose your place again.
Automatically knows exactly what you read.
Works on every website.
AI-powered reading memory.
Perfect reading tracking.
```

Acceptable honest language:

```txt
helps you keep your place
tracks approximate reading progress
probably read
last meaningful reading position
local-first
bookmarklet
long articles and documentation
```

---

D00 Required Files And Folders

---

The final project should include these public-page files:

```txt
.
├── index.html
├── scripts
│   └── install.js
├── assets
│   ├── icons
│   │   ├── icon.svg
│   │   ├── icon-32.png
│   │   ├── icon-64.png
│   │   └── apple-touch-icon.png
│   └── social
│       ├── reading-navigator-social-1200x630.jpg
│       └── reading-navigator-social-1200x630.png
└── dist
    ├── reading-navigator.bundle.js
    ├── reading-navigator.loader-bookmarklet.txt
    └── reading-navigator.inline-bookmarklet.txt
```

The exact icon list can evolve, but the social preview image must exist in `assets/social`.

The JPEG should be the primary social card asset.

The PNG can be kept as a high-quality source or fallback.

The final Open Graph and X/Twitter metadata should point to the JPEG unless there is a specific reason to use PNG.

---

E00 Social Preview Image Requirements

---

The required social preview image size is:

```txt
1200 x 630 px
```

The final social preview file should be:

```txt
assets/social/reading-navigator-social-1200x630.jpg
```

A source or backup PNG may also be kept:

```txt
assets/social/reading-navigator-social-1200x630.png
```

The image should communicate the actual product without misleading the viewer.

Recommended visual concept:

| Area           | Content                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Background     | Calm article/documentation page, warm neutral or clean paper-like surface.                                         |
| Main visual    | A browser-like page with long text and headings.                                                                   |
| Bookmarklet UI | A compact floating Reading Navigator panel or rail showing heading context, progress states, and a restore action. |
| Text in image  | Minimal. Use product name and one clear phrase only.                                                               |
| Tone           | Utility, clarity, focus, reading continuity.                                                                       |
| Avoid          | Fake AI visuals, exaggerated dashboards, cluttered text, unreadable tiny UI, vendor-specific browser UI.           |

Recommended image text:

```txt
Reading Navigator
Keep your place in long web pages
```

The image may show a stylized UI, but it must not show features that do not exist. Since this task runs at the end of the development cycle, prefer using a real screenshot from the final demo page and compositing it into the social card.

If a generated or designed asset is used, it must still represent the implemented product honestly.

---

F00 ImageMagick Usage

---

ImageMagick is available on the system and may be used for asset validation and conversion.

Use ImageMagick to verify dimensions:

```sh
magick identify assets/social/reading-navigator-social-1200x630.jpg
```

The output must confirm:

```txt
1200x630
```

Use ImageMagick to convert or normalize a source image when needed:

```sh
magick assets/social/source.png \
  -resize 1200x630^ \
  -gravity center \
  -extent 1200x630 \
  -quality 90 \
  assets/social/reading-navigator-social-1200x630.jpg
```

Use ImageMagick to create a PNG backup if needed:

```sh
magick assets/social/reading-navigator-social-1200x630.jpg \
  assets/social/reading-navigator-social-1200x630.png
```

Do not rely on visual guessing for the final dimensions. Verify the file dimensions before completing the task.

---

G00 Public URL And Canonical URL

---

The final metadata must use the real production URL.

Social crawlers generally need absolute URLs for `og:url`, `og:image`, `og:image:secure_url`, canonical URL, and Twitter image.

Use a placeholder during development only:

```txt
https://example.com/reading-navigator/
```

Before final release, replace every placeholder with the real public URL.

Required URL fields:

| Field                  | Requirement                          |
| ---------------------- | ------------------------------------ |
| `link rel="canonical"` | Absolute final public page URL.      |
| `og:url`               | Same absolute final public page URL. |
| `og:image`             | Absolute URL to the social JPEG.     |
| `og:image:secure_url`  | Same HTTPS image URL.                |
| `twitter:image`        | Same HTTPS image URL.                |

Do not leave relative paths in social crawler metadata for the final release.

Relative paths are acceptable for local CSS, local scripts, favicons, and normal page images.

---

H00 Required Metadata Values

---

Use these final metadata values unless the product name changes.

```txt
Page title:
Reading Navigator - Bookmarklet for Long-Page Reading Progress

Meta description:
A local-first bookmarklet that tracks approximate reading progress on long web pages, shows heading context, and helps you jump back to your last meaningful reading position.

Open Graph title:
Reading Navigator - Bookmarklet for Long-Page Reading Progress

Open Graph description:
Track approximate reading progress on long web pages and jump back to your last meaningful reading position with a local-first bookmarklet.

X/Twitter title:
Reading Navigator - Bookmarklet for Long-Page Reading Progress

X/Twitter description:
Track approximate reading progress on long web pages and jump back to your last meaningful reading position with a local-first bookmarklet.

Image alt:
Reading Navigator preview showing a long article with a floating reading progress panel and a last reading position marker.
```

The description should stay under typical social preview truncation limits. Do not make it dense or promotional.

---

I00 Example Final Head Markup

---

This example is adapted for Reading Navigator. Replace `https://example.com/reading-navigator/` with the final production URL.

```html
<!doctype html>
<html lang="en" data-theme="reading-navigator" data-contrast="soft">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">

  <title>Reading Navigator - Bookmarklet for Long-Page Reading Progress</title>
  <meta
    name="description"
    content="A local-first bookmarklet that tracks approximate reading progress on long web pages, shows heading context, and helps you jump back to your last meaningful reading position."
  >

  <link rel="canonical" href="https://example.com/reading-navigator/">

  <link rel="icon" href="assets/icons/icon.svg" type="image/svg+xml">
  <link rel="icon" type="image/png" href="assets/icons/icon-32.png" sizes="32x32">
  <link rel="icon" type="image/png" href="assets/icons/icon-64.png" sizes="64x64">
  <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Reading Navigator">
  <meta property="og:title" content="Reading Navigator - Bookmarklet for Long-Page Reading Progress">
  <meta
    property="og:description"
    content="Track approximate reading progress on long web pages and jump back to your last meaningful reading position with a local-first bookmarklet."
  >
  <meta property="og:url" content="https://example.com/reading-navigator/">
  <meta
    property="og:image"
    content="https://example.com/reading-navigator/assets/social/reading-navigator-social-1200x630.jpg"
  >
  <meta
    property="og:image:secure_url"
    content="https://example.com/reading-navigator/assets/social/reading-navigator-social-1200x630.jpg"
  >
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta
    property="og:image:alt"
    content="Reading Navigator preview showing a long article with a floating reading progress panel and a last reading position marker."
  >
  <meta property="og:locale" content="en_US">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Reading Navigator - Bookmarklet for Long-Page Reading Progress">
  <meta
    name="twitter:description"
    content="Track approximate reading progress on long web pages and jump back to your last meaningful reading position with a local-first bookmarklet."
  >
  <meta
    name="twitter:image"
    content="https://example.com/reading-navigator/assets/social/reading-navigator-social-1200x630.jpg"
  >
  <meta
    name="twitter:image:alt"
    content="Reading Navigator preview showing a long article with a floating reading progress panel and a last reading position marker."
  >

  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/index.css">
</head>
<body>
```

The CSP can be adjusted if the final page structure requires different local assets. Do not add remote image, script, font, or analytics permissions without explicit approval.

---

J00 Install Page Bookmarklet Generation

---

The install page must not manually duplicate bookmarklet source.

The install page must load the generated distribution bundle and generate the draggable bookmarklet link from the built bookmarklet function.

The previous project used this pattern:

```js
function buildBookmarkletHref(fn) {
  return "javascript:(" + fn.toString() + ")();";
}
```

The new project should use the same principle, but the global function should come from the new distribution bundle.

Required build contract:

```txt
dist/reading-navigator.bundle.js exposes window.readingNavigatorBookmarklet
```

The exposed value must be a function.

The install page must fail clearly if the function is not available.

Recommended script loading order:

```html
<script src="dist/reading-navigator.bundle.js" defer></script>
<script src="scripts/install.js" defer></script>
```

The bundle must expose the installable function before `scripts/install.js` runs.

---

K00 Install Script Requirements

---

Create:

```txt
scripts/install.js
```

The install script must:

| Requirement          | Detail                                                      |
| -------------------- | ----------------------------------------------------------- |
| Find install link    | Use `[data-bookmarklet-install]`.                           |
| Find source display  | Use `[data-bookmarklet-source]` if present.                 |
| Find size display    | Use `[data-bookmarklet-length]` if present.                 |
| Find status target   | Use `[data-install-status]` if present.                     |
| Validate bundle      | Confirm `window.readingNavigatorBookmarklet` is a function. |
| Build href           | Convert the function to a bookmarklet URL.                  |
| Set link href        | Assign the generated `javascript:` URL to the install link. |
| Set link text        | Use direct drag-to-install text.                            |
| Show size            | Display character length.                                   |
| Avoid HTML injection | Use `textContent` for generated source and status.          |

Recommended install link text:

```txt
Drag Reading Navigator to your bookmarks bar
```

Recommended failure text:

```txt
Bookmarklet bundle did not load.
```

Recommended generated size text:

```txt
Generated size: 42,000 characters
```

---

L00 Example Install Script

---

This is an explicit implementation model. The final code may differ, but it must preserve the same behavior.

```js
(function () {
  "use strict";

  var BOOKMARKLET_NAME = "Drag Reading Navigator to your bookmarks bar";
  var INSTALLABLE_FUNCTION_NAME = "readingNavigatorBookmarklet";

  var installTarget = document.querySelector("[data-bookmarklet-install]");
  var sourceTarget = document.querySelector("[data-bookmarklet-source]");
  var lengthTarget = document.querySelector("[data-bookmarklet-length]");
  var statusTarget = document.querySelector("[data-install-status]");

  function setStatus(text) {
    if (!statusTarget) return;
    statusTarget.textContent = text;
  }

  function formatCount(value) {
    return Number(value).toLocaleString("en-US");
  }

  function buildInlineBookmarkletHref(fn) {
    var source = "(" + fn.toString() + ")();";
    return "javascript:" + encodeURIComponent(source);
  }

  function renderInstaller() {
    var fn = window[INSTALLABLE_FUNCTION_NAME];

    if (typeof fn !== "function") {
      setStatus("Bookmarklet bundle did not load.");
      if (installTarget) {
        installTarget.removeAttribute("href");
        installTarget.textContent = "Bookmarklet unavailable";
        installTarget.setAttribute("aria-disabled", "true");
      }
      return;
    }

    var href = buildInlineBookmarkletHref(fn);

    if (installTarget) {
      installTarget.href = href;
      installTarget.textContent = BOOKMARKLET_NAME;
      installTarget.setAttribute("aria-label", BOOKMARKLET_NAME);
    }

    if (sourceTarget) {
      sourceTarget.textContent = href;
    }

    if (lengthTarget) {
      lengthTarget.textContent = formatCount(href.length) + " characters";
    }

    setStatus("Bookmarklet link generated.");
  }

  renderInstaller();
})();
```

The install script must not use `innerHTML` for bookmarklet source or page-derived data.

The install script must not fetch remote code.

The install script must not create the bookmarklet from a stale source file. It must use the built distribution function.

---

M00 Hosted Loader Variant

---

If the project supports both hosted loader and inline bundle variants, the install page should render two install options.

The hosted loader should be primary.

The inline bundle should be marked as advanced or fallback.

Required labels:

```txt
Drag Reading Navigator to your bookmarks bar
Drag Inline Reading Navigator to your bookmarks bar
```

The hosted loader bookmarklet can be generated from `dist/reading-navigator.loader-bookmarklet.txt`.

The inline bookmarklet can be generated from `window.readingNavigatorBookmarklet.toString()` or from `dist/reading-navigator.inline-bookmarklet.txt`.

Do not confuse the two modes.

The page must display which mode each link installs.

The page must display generated sizes for both modes if both are present.

If the final project chooses only one install mode, use the inline generated function mode unless explicitly changed.

---

N00 Example Install Page Body Section

---

The install section should be direct and uncluttered.

```html
<main id="top">
  <section class="hero" aria-labelledby="page-title">
    <div class="hero-copy">
      <h1 id="page-title">Reading Navigator</h1>
      <p class="lead">
        A local-first bookmarklet for long web pages. Track approximate reading progress,
        see heading context, and jump back to your last meaningful reading position.
      </p>

      <div class="install-panel" id="install">
        <a class="bookmarklet-link" href="#" data-bookmarklet-install>Loading...</a>
        <p>
          Drag the link to your bookmarks bar. Then open a long article or documentation
          page and click the bookmarklet.
        </p>
        <p class="install-status" data-install-status></p>
      </div>
    </div>

    <figure class="hero-media" id="preview">
      <img
        src="assets/social/reading-navigator-social-1200x630.jpg"
        width="1200"
        height="630"
        alt="Reading Navigator preview showing a long article with a floating reading progress panel and a last reading position marker."
      >
      <figcaption>
        Reading Navigator runs inside the current page as a bookmarklet.
      </figcaption>
    </figure>
  </section>

  <section class="section" aria-labelledby="what-title">
    <h2 id="what-title">What it does</h2>
    <p>
      Reading Navigator scans the readable page, shows heading context, tracks approximate
      reading progress, and stores a local restore point for the current page.
    </p>
  </section>

  <section class="section" aria-labelledby="source-title">
    <h2 id="source-title">Install source</h2>
    <p>
      The install link is generated from the bundled distribution function exposed by
      <code>dist/reading-navigator.bundle.js</code>.
    </p>
    <details>
      <summary>Show generated bookmarklet URL</summary>
      <p>Generated size: <span data-bookmarklet-length>Loading...</span></p>
      <pre data-bookmarklet-source>Loading...</pre>
    </details>
  </section>
</main>

<script src="dist/reading-navigator.bundle.js" defer></script>
<script src="scripts/install.js" defer></script>
```

The visible page copy should be short. The detailed design note and developer instructions belong in markdown files, not in the public install page.

---

O00 Social Image Creation Workflow

---

The agent should create the social preview asset during this final polishing task.

Recommended workflow:

| Step | Action                                                                    |
| ---- | ------------------------------------------------------------------------- |
| 1    | Build the final bookmarklet bundle.                                       |
| 2    | Open the demo page.                                                       |
| 3    | Trigger the bookmarklet.                                                  |
| 4    | Position the page and Reading Navigator UI in a visually clear state.     |
| 5    | Capture or compose a 1200x630 social preview image.                       |
| 6    | Save the result to `assets/social/reading-navigator-social-1200x630.png`. |
| 7    | Convert to JPEG at `assets/social/reading-navigator-social-1200x630.jpg`. |
| 8    | Verify dimensions with ImageMagick.                                       |
| 9    | Update `index.html` metadata to point to the JPEG.                        |
| 10   | Verify that the page displays the asset correctly.                        |

The social image should remain readable at small preview sizes.

The product name should be large enough to read.

The tagline should be short.

The UI screenshot should not be cluttered.

The image must not show private or real third-party page content. Use the local demo page or neutral generated content.

---

P00 Metadata Validation Checklist

---

Before finishing this task, verify:

```txt
- The page has exactly one meaningful title.
- The meta description is present in initial HTML.
- Canonical URL is absolute.
- Open Graph title is present.
- Open Graph description is present.
- Open Graph URL is absolute.
- Open Graph image URL is absolute.
- Open Graph image secure URL is absolute.
- Open Graph image width is 1200.
- Open Graph image height is 630.
- Open Graph image alt text is present.
- X/Twitter card is summary_large_image.
- X/Twitter title is present.
- X/Twitter description is present.
- X/Twitter image URL is absolute.
- X/Twitter image alt text is present.
- Social image file exists.
- Social image dimensions are exactly 1200x630.
- The public install link text clearly says to drag it to the bookmarks bar.
- The install link is generated from the distribution bundle.
- The generated bookmarklet href starts with javascript:.
- The generated bookmarklet size is displayed.
- The page does not include misleading or vendor-specific claims.
```

---

Q00 Final Acceptance Criteria

---

This task is complete only when these conditions are met:

| Requirement             | Acceptance condition                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Final-stage timing      | Implemented after the main bookmarklet behavior is stable.                                     |
| Social metadata         | `index.html` contains final title, description, canonical, Open Graph, and X/Twitter metadata. |
| Honest positioning      | Copy describes approximate tracking and generic restore without exaggerated claims.            |
| Social image            | `assets/social/reading-navigator-social-1200x630.jpg` exists and is exactly 1200x630.          |
| Image validation        | ImageMagick was used to verify final dimensions.                                               |
| Install link generation | `index.html` loads `dist/reading-navigator.bundle.js` and `scripts/install.js`.                |
| Bundle contract         | The distribution bundle exposes `window.readingNavigatorBookmarklet`.                          |
| Dynamic href            | The install link is generated dynamically from the exposed distribution function.              |
| No duplicate source     | The install page does not maintain a separate hand-copied bookmarklet implementation.          |
| User action clarity     | The install link text says `Drag Reading Navigator to your bookmarks bar`.                     |
| Local-first page        | No remote scripts, fonts, analytics, or tracking resources are added.                          |
| CSP compatibility       | The page works under a restrictive static-site CSP using same-origin scripts and images.       |

