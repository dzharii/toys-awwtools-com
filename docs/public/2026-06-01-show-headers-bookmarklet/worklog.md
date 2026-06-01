# Show Headers Bookmarklet worklog

## Original request

The project started as a small static web build for an existing browser bookmarklet. The requested output was a new `show-headers-bookmarklet` subfolder in the current repository, containing a one-page HTML/CSS/JS project with no frameworks.

The main product requirement was to preserve the existing bookmarklet behavior almost unchanged while cleaning up the source. The anonymous bookmarklet wrapper needed to become a named function, `showDocumentHeadersBookmarklet`, and the project page needed to generate the install link dynamically from `showDocumentHeadersBookmarklet.toString()`. That kept the installed bookmarklet and the maintained source tied to the same implementation.

The page also needed to explain installation clearly, generate visual assets, include favicon and social preview images, show a screenshot of the bookmarklet running, and preserve the ChatGPT conversation URL used for writing, design, image, and review guidance.

## What happened

The work moved through several phases. First, the existing bookmarklet was turned into a static project structure. The bookmarklet source was placed in `bookmarklet.js`, formatted, and exposed as `showDocumentHeadersBookmarklet`. The page script then generated the `javascript:` install URL from that function instead of duplicating the source.

After the basic project page existed, the focus shifted to presentation and installation clarity. ChatGPT was used through Chrome after the required relay handshake. The early prompts asked for planning, page copy, design direction, SEO/social metadata guidance, and image prompts. ChatGPT also generated source imagery for the social preview and icon assets.

The first page implementation needed several review passes. It had the right basic pieces, but the page felt cluttered and unfinished in places. Later prompts asked ChatGPT to critique the page as a production static project rather than as a rough prototype. Those reviews led to concrete layout, copy, and visual changes.

Screenshot work caused the most process friction. Chrome browser control blocked attempts to use `file://`, `localhost`, `data:`, and third-party `javascript:` URL execution. That led to a placeholder screenshot/failure explanation in an intermediate version, which was not acceptable for a production page. The user later provided VS Code Live Preview at `http://127.0.0.1:5500/index.html` and pointed out that the embedded browser could be used for screenshots. That made visual validation and the final demo screenshot possible.

The README was added near the end. ChatGPT first proposed style directions, then drafted a short user-facing README, tightened it, and reviewed the final version. The final ChatGPT README verdict was Ready. A final page blocker check also returned No blockers.

## What was built

The final project folder is `show-headers-bookmarklet`.

It contains `index.html`, `styles.css`, `app.js`, `bookmarklet.js`, `demo-article.html`, `README.md`, an `assets` folder, and `docs/chatgpt-conversation-url.txt`.

`bookmarklet.js` defines `showDocumentHeadersBookmarklet`. It contains the formatted bookmarklet source and no `//` comments. `app.js` generates the bookmarklet install `href` from `showDocumentHeadersBookmarklet.toString()`, so the bookmarklet source lives in one place.

The final page presents the project, explains installation, shows a real demo screenshot at `assets/bookmarklet-on-article.png`, and includes social/favicon assets. The install affordance now visibly reads "Drag Show Headers to your bookmarks bar", followed by direct instruction to open an article and click the bookmarklet from the bookmarks bar.

The project also includes a small local demo article page used to show the bookmarklet running in a controlled page.

## What worked

The strongest technical decision was keeping the bookmarklet source in one place. Generating the install link from `showDocumentHeadersBookmarklet.toString()` reduced the risk of the page installer drifting away from the maintained bookmarklet source.

The repeated critical review passes also helped. The page improved most when review prompts focused on production readiness rather than general design. The clearest acceptance condition was the 1280x720 first-viewport check: the H1, lead, drag link, instruction, and demo screenshot all needed to be visible without scrolling. That exposed layout problems that were not obvious from reading the source alone.

The final copy worked because it became more direct. The project did not need a marketing-style hero or a long explanation. It needed to say what the tool does, show it running, and make the install action unmistakable.

The README process also worked well after the scope was narrowed. A plain utility README fit the project better than a documentation-heavy or promotional format.

## Challenges and mistakes

The first implementation was too cluttered. It repeated "Show Headers" and "Show Headers Bookmarklet" across the header, hero, and hero image. The hero also included the eyebrow label "Browser bookmarklet", which did not add useful information.

The social preview image was initially used as page content. That caused the title to repeat again and made the hero compete with itself. A caption also said "ChatGPT-generated social preview...", which exposed process details and made the page feel unfinished.

The install affordance was not clear enough at first. The primary link initially read "Show Headers", and a nearby "Copy link" button competed with it. That made the most important user action ambiguous. The final label, "Drag Show Headers to your bookmarks bar", made the interaction explicit.

The screenshot section was another mistake in the intermediate version. Because browser control initially blocked local and third-party execution paths, the page temporarily included placeholder/failure text. That was useful during debugging but wrong for a production-facing page. It was removed and replaced with a real embedded-browser screenshot of `demo-article.html` running the bookmarklet.

The visual design also needed correction. The first theme was too beige-heavy and soft, and the early hero layout had too much vertical whitespace. Even after the screenshot was added, the hero text was vertically centered against the tall image, which pushed the install panel too low. The final pass top-aligned the hero columns, reduced the H1 size, flattened the install panel, and made the install action visible in the first viewport.

Image generation had a specific asset-quality problem. The first icon output used fake checkerboard transparency even though true alpha transparency was requested. The fix was to request a flat `#00ff00` chroma-key background and convert it with ImageMagick so the final favicon PNGs retained alpha.

## How feedback changed the result

User feedback directly changed the page from a visually busy project page into a lean install-focused page.

The repeated title problem led to removing the hero eyebrow, removing the social preview from the hero, and keeping the page identity simpler. The process-caption problem led to removing references to ChatGPT and generated assets from the rendered page.

The install ambiguity led to a stronger primary action. The link text became "Drag Show Headers to your bookmarks bar", and the instruction directly below it explains the next step. The install panel was flattened so it did not look like a separate content card competing with the rest of the hero.

The screenshot feedback changed both content and process. The placeholder/failure explanation was removed, and the final page now uses a real screenshot of the bookmarklet running on the local demo article page.

The viewport feedback changed the final layout. The hero columns were top-aligned, the H1 was reduced to utility-page scale, and the screenshot was treated as supporting evidence rather than the dominant first-viewport element.

The README feedback kept the documentation short and user-facing. It retained the important source note about `showDocumentHeadersBookmarklet.toString()` but avoided turning the README into internal architecture documentation.

## Final state

The static project is accepted by the user. The page is concise, install-focused, and free of process, placeholder, and failure language.

The bookmarklet source remains in `bookmarklet.js` as `showDocumentHeadersBookmarklet`, and `app.js` generates the install `href` from `toString()`. The final install link is explicit about dragging to the bookmarks bar.

The project includes the final page, styles, scripts, demo article, README, visual assets, and preserved ChatGPT conversation URL. `README.md` is user-facing and was approved by ChatGPT review.

Validation checks passed. `node --check` passed for `bookmarklet.js` and `app.js`. A VM check confirmed that `showDocumentHeadersBookmarklet` exists and generated a `javascript:` href of length 30,680 from `toString()`. `Select-String` found zero `//` occurrences in `bookmarklet.js`. ImageMagick confirmed that `social-preview.png` is 1200x630, the demo/review screenshots are 1265x720, and favicon PNGs retain alpha. The embedded browser screenshot showed the H1, lead, drag link, instruction, and demo screenshot in the first viewport. ChatGPT's final blocker check returned No blockers.

## What would make this process smoother next time

For a similar project, the ideal starting input would include the source bookmarklet, the exact desired project folder name, required file names, browser assumptions, viewport acceptance criteria, asset requirements, and a clear statement of non-goals. In this case, the single-source bookmarklet requirement was known early and helped the implementation. The visual and screenshot requirements took longer to stabilize.

The screenshot process should be defined before implementation starts. A local demo page, the intended screenshot viewport, and the capture method should be part of the initial plan. For this project, knowing upfront that VS Code Live Preview and the embedded browser could be used would have avoided the failed `file://`, `localhost`, `data:`, and third-party execution attempts.

Image asset requirements should also be more operational. For transparent icons, the prompt should ask for a flat chroma-key background or another verifiable processing path, not just "transparent PNG". The final asset checklist should include dimensions, alpha verification, and whether generated social art is only for metadata or may appear on the page.

The install affordance should be treated as a core acceptance criterion, not a copy detail. For bookmarklet projects, the primary link should explain the drag action in its visible text, and the first viewport should show the install step without scrolling.

Future prompts should also separate page content from implementation details. Process notes, failed browser-control attempts, generated-asset captions, and placeholder explanations should stay out of rendered production pages. They belong in a worklog or issue notes, not the user-facing UI.

A good next-time workflow would be: define constraints and acceptance checks, build the static page and single-source bookmarklet wiring, create or capture required assets, validate install behavior on the local demo, review the first viewport at the target size, remove all process language, then write the README and worklog after the page is stable.
