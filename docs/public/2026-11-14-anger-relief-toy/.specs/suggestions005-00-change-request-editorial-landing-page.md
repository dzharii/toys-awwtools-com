# Technical task: An editorial landing page for Anger Relief Toy

Feature 005 | Revision 00 | November 14, 2026

## A00. Assignment and intended result

Create the actual landing page described here, using the supplied project folder and its three extension versions. Deliver one static `index.html` at the shared folder root, beside the version directories. Local screenshot and download assets may accompany it. This assignment is to implement the website, not merely propose a design or return another specification.

The page should read and look like a compact, illustrated technical-magazine article. Its reader wants to understand the extension, decide whether it is worth trying, download it, and install it. Give that reader a clear account of the useful parts and the limitations. The purpose is informed choice, not promotion.

Write as a technically competent editor who values accuracy. Use concrete descriptions, restrained opinions and evidence. Do not invent hands-on impressions, testimonials, independent endorsements, compatibility results or performance claims. Visual playfulness should come mainly from authentic screenshots, the extension's colored icons and the page's composition.

Use the proposed article copy in this task as a substantive starting point. Inspect the actual files, correct inaccuracies, fill meaningful gaps, edit repetition and use your best judgment to produce a coherent finished page. You are authorized to refine layout, copy, image selection and presentation without requesting approval for routine decisions.

## B00. Read the project and establish the facts

Start with root `AGENTS.md`, then any applicable instructions inside the three version folders. Read the main specification, the interaction redesign, the audio/dial change request and relevant acceptance requirements. Preserve implemented specifications and the extension builds. This website task does not authorize silently modifying extension behavior or rewriting historical evidence.

The supplied folder listing includes these principal directories:

| Directory | Intended editorial role |
| --- | --- |
| `2026-11-14-anger-relief-toy-v001/` | Original eight-tool foundation and historical reference |
| `2026-11-14-anger-relief-toy-v002/` | Persistent equipment and lightweight interface redesign |
| `2026-11-14-anger-relief-toy-v003/` | Current eighteen-tool build, audio, rotating dial and middle-button hold |
| Root `.specs/` and version-local `.specs/` | Requirements, historical frames and design studies |

Inspect each version's `README.md`, `dist/manifest.json`, relevant `docs/`, generated catalog or effect metadata, and available test/acceptance records. Use source where needed to resolve a factual question. Review `docs/verification.md`, effect `acceptance.json` files and any `evidence/` directory that is actually present. The pasted folder listing is an inventory, not proof that all referenced assets or tests exist or passed. Empty reference-material directories, missing ZIP files and missing screenshots must not become working-looking links.

Distinguish implemented behavior, experimentally demonstrated behavior, and proposed behavior. A requirement written in a specification does not prove implementation. Passing component tests do not prove native browser behavior or subjective audio quality.

The latest build is expected to contain eighteen tools. Verify the enabled collection rather than counting every research candidate or source file. Do not present deferred tools, such as Katamari Collector or Web Spider, as available features.

Public release labels for this page are **0.0.1, 0.0.2 and 0.0.3**, corresponding to folders v001, v002 and v003. The current release is **0.0.3**, as requested by the project owner. Existing manifests inspected during preparation use **0.1.0, 0.2.0 and 0.3.0**. Check this in the supplied copies. Do not change those binaries or pretend the manifest reports the public label. If the mismatch persists, use a short note near release history: "This page uses project release labels 0.0.1-0.0.3. The v003 browser manifest reports 0.3.0." Include the discrepancy in your handoff as well.

## C00. Page structure and editorial economy

Keep the page compact. Aim for roughly 900-1,200 words of visible editorial content, excluding collapsed installation details, captions and the tool list. Treat this as a guide, not a quota. Avoid repeating the same feature explanation in the introduction, cards, screenshots and conclusion.

The opening screen must contain the product name, a useful description, current release, Chromium-only scope, the current download link, an Install link and one representative screenshot. At 920x720 and 1440x900, the download and installation entry must be visible without scrolling. At 390x844, the essential description and download must still be easy to find without passing a large illustration.

Use this reading order: compact masthead and opening spread; what using it involves; a concise tool collection overview; three-version comparison; installation; limitations and verification; small source/folder notes. Related sections may share an editorial spread or sidebar. The installation section should be reachable immediately through an anchor, not hidden behind a long feature story.

Use at most three or four main screenshot figures, with small comparison panels where useful. Do not make eighteen full-width feature cards or an endless screenshot gallery. Keep download access available through a restrained header link or another compact treatment. Repeating one download link near installation is sufficient.

Do not reproduce the complete filesystem tree. A reader needs to know which version is current, what older folders represent, where the loadable build is, and what the source/documentation folders are for. They do not need SDK internals, every test filename or the acceptance questionnaire on the main page.

## D00. Visual direction

Build an editorial composition inspired by the extension's lightweight glass interface and colorful, softly shaded object icons. Use an off-white or very light cool background, dark readable text, fine rules, restrained translucent surfaces and small accent colors drawn from the tools. Avoid saturated blue slabs, heavy metallic framing, dark dashboard styling and extensive blur behind article text.

The magazine character should come from typography, image placement, captions, compact facts, asymmetrical columns and deliberate spacing. Consider a restrained serif for article reading with a system sans-serif for controls and facts, using local/system fonts rather than remote font services. Keep body text around 16-18px, functional labels at least 14px and comfortable line lengths. A pragmatic headline should not consume half the viewport.

Do not turn this into a conventional SaaS sales page. Avoid huge promotional hero sections, giant empty gutters, repeated rounded feature-card grids, fake badges, pricing panels, email capture, animated counters and testimonials. Do not copy the extension's action dial as a decorative nonfunctional website control. Screenshots can show the real dial; site navigation should remain ordinary and clear.

Make screenshots legible at their displayed size. A cropped control detail is usually more useful than a large browser screenshot with unreadable UI. Preserve enough surrounding page context to explain what the extension changes. Use modest shadows and clear figure captions. Support narrow viewports, browser zoom, reduced motion and print without clipping essential content.

## E00. Proposed opening and usage copy

Use this copy as the editorial baseline, revising it when the inspected build or new observations warrant a change.

**Masthead:** Anger Relief Toy

**Headline:** Temporary tools for ordinary webpages

**Opening paragraph:**

Anger Relief Toy adds a small collection of visual tools to the page you are reading. You can punch a comment, scatter a paragraph, add a temporary crack or move a spotlight across the screen. The changes are visual and local to your tab. They are not reactions sent to other people, and they are not intended to edit the content saved by the website.

**Release line:** Project release 0.0.3 | 18 tools | Chromium-based desktop browsers | Manual installation

**Primary link label:** Download 0.0.3

**Secondary link label:** Installation instructions

**Download clarification:** Download the ZIP, extract it, then load the extension folder through your browser's Extensions page. This is an unpacked build, not a store installation.

**Article heading:** What using it involves

Open the extension on an ordinary webpage and choose a tool. Element tools respond to a deliberate primary-pointer click. Punch and Text Bomb remain equipped after an animation finishes, so you can use them on another target without selecting them again.

The inventory stays at the bottom of the page with three controls. Switch opens tool selection. End effect stops the current visual result while leaving the tool equipped. Put away clears the tool and its temporary interface. Document and viewport tools start when selected; reselect one to restart it after End effect.

The action dial is a circular browser for the collection. Drag around its rim to reveal more tools, or use its arrow-key navigation. All tools opens a searchable catalog with categories, Favorites and Recent. The on-page catalog can be moved aside by its title bar.

The popup shows the shortcut actually assigned by the browser. Alt+Shift+A is the suggested binding, but it may be different or unassigned on your installation. The optional middle-mouse shortcut opens the dial after a stationary 1.8-second hold. It is off by default and works only in a tab where the extension has already been activated. Its setting explains which native middle-button actions it replaces.

Sound is optional. The current build includes short effect cues, a global volume setting, mute and separate control over dial sounds. Quiet activation cues are used where continuous sound would add little, such as the flashlight.

Do not write "we found", "we enjoyed" or "in our testing" around these descriptions unless you actually observed and recorded the relevant behavior during this assignment.

## F00. Proposed tool collection and version comparison

**Heading:** What is in the collection

The current build contains eighteen tools. Some act on one target; others affect several visible elements or the viewport. These are temporary illustrations, not a full physical reconstruction of the webpage.

Present this as a compact table, grouped list or similarly readable editorial element. Reuse the actual tool icons where helpful; do not put a large individual card around every name.

| Group | Tools and concise description |
| --- | --- |
| Impact and deformation | Punch adds a comic impact; Rubber gives the target an elastic wobble; Wrecking Ball stages a pendulum strike. |
| Fracture and breakup | Shatter divides a target into fragments; Screen Crack adds a temporary crack overlay; Text Bomb scatters words after a fuse; Disintegrate breaks a target illustration into drifting tiles. |
| Motion and perspective | Gravity drops bounded representations of visible content; Vortex pulls a target inward; Page Dance moves several page elements; Depth Page adds layered perspective. |
| Surface and environmental effects | Burn the Page stages a charring effect; Television Glitch offsets bands of a target; Color Splash adds paint; Celebration Cannon releases confetti; Snowfall and Matrix Rain add viewport fields. |
| Lighting | Flashlight follows the pointer and stays available until ended. |

Verify the exact displayed names, grouping and behavior. If a useful distinction is not apparent in actual use, explain it honestly rather than inventing one.

**Heading:** How the three versions differ

| Project release | What changed | What it represents |
| --- | --- | --- |
| 0.0.1 / v001 | Eight effects, searchable catalog and an initial action wheel. | The basic collection and extension framework. Short-lived activation made repeated use less continuous. |
| 0.0.2 / v002 | Persistent equipment, inventory and cursor cues, lighter visual design, visible shortcut guidance and a centered, movable on-page catalog. | The shift from launching individual animations to keeping a tool ready. The old circular mouse gesture remained experimental rather than an integrated release feature. |
| 0.0.3 / v003 | Stable three-control inventory, shared audio, rotating full-collection dial, integrated opt-in middle-button hold and ten additional effects. | The current build, with eighteen tools and quicker sequential discovery. Normal Tab and Enter page targeting from the earlier interaction model has been removed. |

Add one short paragraph about the purpose of the progression: the project first established individual effects, then made interaction persistent, then improved control stability, sound and collection navigation. Do not frame every historical decision as a failure or imply that all proposed features shipped.

The current version must be the clear default download. Older versions are historical context, not competing recommendations. If older downloads are offered, label them explicitly and verify their files.

## G00. Proposed installation content

**Heading:** Install the current build

**Lead:** Use a Chromium-based desktop browser that permits unpacked extensions. Download and extract the ZIP before opening the browser's extension manager. Select the folder that directly contains `manifest.json`, not the ZIP file.

Provide Chrome, Edge and Other Chromium instructions in a compact accessible layout. On smaller screens, native details/summary panels or another keyboard-accessible disclosure are acceptable. Keep the current download link visible next to these instructions.

**Google Chrome:**

Open `chrome://extensions`. Turn on Developer mode, choose Load unpacked, and select the extracted extension folder containing `manifest.json`. When working from the complete project folder, that folder is `2026-11-14-anger-relief-toy-v003/dist`. Open an ordinary webpage, then click the extension in the browser toolbar. Pinning its toolbar icon is optional.

**Microsoft Edge:**

Open `edge://extensions`. Turn on Developer mode, choose Load unpacked, and select the extracted extension folder containing `manifest.json`. In the complete project folder, select `2026-11-14-anger-relief-toy-v003/dist`. Open an ordinary webpage and launch the extension from Edge's Extensions menu or its pinned toolbar icon.

**Other Chromium-based browsers:**

Use the browser's Extensions manager and its equivalent unpacked-extension controls, if available. Menu names, shortcut assignments and browser policies can differ. Being Chromium-based does not establish that this extension has been verified in that particular browser. Firefox and Safari are outside this project's supported scope.

**After installation:**

Choose a tool from the popup or open the dial with the assigned shortcut. If the shortcut is unassigned, configure it in the browser's extension keyboard-shortcut settings. Start on a normal article or a supplied demonstration page. Browser settings pages, extension stores and other protected pages may reject activation.

Keep the extracted extension folder in place. For an update, load or reload the current build through the extension manager and refresh open pages before testing it. Remove the extension through that same manager when finished. Managed browsers may disable developer installation; explain the restriction without suggesting a policy bypass.

Verify these instructions against the installed browser and current primary documentation. Starting references are Google's Hello World extension tutorial at `https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world` and Microsoft's sideloading guide at `https://learn.microsoft.com/microsoft-edge/extensions-chromium/getting-started/extension-sideloading`. These are references to paraphrase accurately, not prose to copy wholesale.

## H00. Proposed limitations, compatibility and folder notes

**Heading:** Useful boundaries to know

Effects use bounded local illustrations of page backgrounds and text. They do not reproduce every image, embedded application or complex layout exactly. Some tools intentionally cover or distort part of the page while active. Put away is the direct return to normal interaction.

The project targets Chromium-based browsers, with Chrome and Edge as the primary intended browsers. Browser testing is limited to the Chromium family; that does not mean every Chromium product or operating system has been tested. State the actual browser and version used for your new verification, if any.

The supplied review records distinguish passing component checks from native browser verification. Earlier Chromium startup attempts were blocked by the development environment. Do not convert that into a permanent product failure or an unsupported claim that the current build has completed browser, audio-comfort and platform testing. Reassess the environment and report what you actually verify.

The middle-button shortcut is optional because middle clicking already has browser functions. When enabled, its hold behavior applies to eligible noninteractive areas after extension activation. Links, editable fields and controls are excluded by design. Platform-specific native behavior still needs actual testing. The keyboard shortcut remains an alternative.

**Privacy note, after source verification:**

The inspected build uses local rendering and sound synthesis, with no account or external runtime service. Activation is requested for the current tab rather than through persistent access to every site. Its permissions are activeTab, scripting and storage. Avoid absolute claims such as "cannot affect a website", "completely safe" or "works everywhere".

**Heading:** What the folders contain

The v003 folder is the current version. Its `dist` directory is the ready-to-load extension. The v001 and v002 folders preserve earlier stages for comparison. Source, documentation and research accompany the builds for readers who want to inspect implementation decisions or attribution. You do not need Bun or the development tools to load the supplied `dist` build.

Keep this explanation to a short paragraph or small facts table. Optional source and documentation links belong here or near the download, not in a large filesystem listing. Do not expose local Windows drive paths, private absolute paths or development profiles on the public page.

## I00. Actual screenshots and truthful image editing

Use the already installed Playwright tooling and a compatible installed Chromium browser first. If only the browser binary is missing, install the necessary compatible Playwright Chromium binary when the environment permits. Do not replace working tooling or download unrelated dependencies. Inspect available capabilities rather than assuming a previous environment's startup failure still applies.

Load the actual packaged extension with a persistent browser context and its real `dist` build. Use project-controlled synthetic article and discussion pages with believable text, links and controls. Do not execute original third-party bookmarklets. Capture the real popup/catalog, dial, inventory, effects and relevant installation steps where possible. Do not substitute a page that merely imitates extension UI for an extension test.

The core editorial image set should include a current dial and inventory over a discussion page; a same-target before/during/after sequence demonstrating an effect and cleanup; and a useful catalog or control detail. A small historical v001/v002 comparison may use clearly labeled frames already supplied. Select images for explanatory value rather than filling an image quota. A screenshot cannot prove sound or long-term persistence; use observation and assertions for those claims.

Retain original captures outside the published image set. Create clean crops, moderate resizing and optional restrained annotations with deterministic image-processing tools. Do not generate or redraw screenshot pixels, insert UI that was not present, hide a relevant failure or label a generated concept as a working product. Label montage panels and historical versions clearly. Captions must explain what is shown and identify the version or demonstration context when useful.

Prefer optimized WebP or PNG with explicit dimensions, descriptive alt text and readable text at the final displayed size. Load the lead image promptly; lazy-load secondary images. Target a light page, roughly 2MB or less of initial page/image transfer where readable screenshots allow it. Do not blur text to satisfy an arbitrary byte target.

If native extension execution is blocked, record the exact command, browser and error in the handoff. Existing authentic frames may illustrate their actual historical version. Existing concept images may appear only if unmistakably labeled as design studies, never as screenshots of v003. Do not fabricate current-version evidence or imply that layout-only webpage screenshots verify extension behavior. The website can still be completed, with its claims and captions limited to available evidence.

## J00. Static implementation and working downloads

Use one `index.html` with inline CSS and only the small amount of JavaScript genuinely needed. No application framework, backend, remote font, analytics, third-party widget, installation script or build step should be required to view the finished page. Ordinary article content, installation instructions and download links must remain usable without JavaScript. Small local image assets are allowed and expected.

Use semantic landmarks, one main heading, logical reading order, descriptive figure captions, proper links and buttons, visible focus and usable contrast. Native disclosures are preferable to a complicated custom tab system. Do not autoplay sound or video. Do not add an interactive effect simulator that could be mistaken for the real installed extension.

Use relative paths so the site works from the shared folder through a normal static HTTP server and remains readable when opened as a local file. Keep browser-internal addresses as copyable text; do not promise ordinary website links can navigate to protected browser settings pages.

There must be a real current-version download, not a placeholder or a link to a directory. Reuse a verified extension-only archive when available. If it is absent, create a ZIP from the existing v003 `dist` directory without altering its contents. Put `manifest.json` at the ZIP root, so readers extract one loadable extension directory. Clearly distinguish an extension-only download from an optional full-source archive.

Suggested companion paths are `assets/landing/` for published images and `downloads/anger-relief-toy-v003.zip` for the installation archive. These are organizational choices, not permission to leave nonexistent URLs. Test every local image, anchor and download against the files actually delivered. Preserve historical project directories and original evidence.

## K00. Verification and editorial review

Use Playwright to inspect the finished website at 920x720, 1440x900 and 390x844, and at 200% zoom where feasible. Capture final page screenshots. Check visible first-screen download/install access, readable screenshot crops, compact editorial rhythm, keyboard navigation, disclosure behavior, image loading, overflow and sticky elements. Ensure nothing covers the download, captions or focused controls.

Test local links and the downloaded ZIP itself. Extract it in a clean location and confirm the extension folder contains its manifest and required files. When browser capabilities permit, load that extracted download rather than only the original development directory. Verify a representative journey: installation, choosing Punch, repeated use, switching through the dial, catalog selection, ending an effect and putting away. Check optional hold behavior and sound separately rather than inferring them from images.

Compare all three versions against actual code and evidence before publishing their differences. Review every sentence for exaggeration, vague filler, unsupported first-person experience or technical detail that distracts an ordinary installer. Keep meaningful limitations beside the relevant feature or installation context, rather than hiding them behind a generic disclaimer.

Before finishing, answer these questions in the handoff and fix reasonable deficiencies immediately: Can a new reader explain what the extension does? Is the current download visible immediately? Do installation steps match the delivered archive? Are version labels and manifest values honest? Are screenshots authentic and correctly labeled? Are supported scope and actual testing distinguished? Are the older versions understandable without reading internal specifications? Does the page feel like a compact professional article rather than an advertisement? Are any controls, links or claims still unfinished?

## L00. Deliverables and autonomous finishing

Deliver the working root `index.html`, its optimized local image assets and the real current installation archive. Include a short implementation note identifying factual corrections to the draft, screenshot provenance, browser checks performed, link/archive verification and genuine blockers. Supply a ZIP containing the website and everything its published relative links require, while preserving access to the original project files.

Do not stop at the first plausible layout. Inspect the finished page, remove unnecessary weight, improve unclear crops, correct copy and retest. You are encouraged to fill gaps and make better editorial or technical decisions within this scope. Do not preserve a weak design merely because it is already implemented.

Completion means a reader can understand the product and its evolution, see authentic evidence, find a working download and follow the correct installation path without a sales pitch or a long search through the page.
