2026-08-16

# 2026-08-16.CHARLIE.A-00

## A-00. Page Capture and Social Preview Generation

This specification defines how the local authoring tool renders a target web page with Playwright and produces the visual preview stored as:

```text
lnk/<short-id>/preview.jpg
```

The preview is used in two places.

It is the Open Graph image for the generated short URL.

It is also the primary visual representation of the saved link inside the journal.

The preview must therefore optimize for recognition and readability rather than for visual completeness.

This specification defines browser configuration, readiness, metadata candidate extraction, overlay handling, capture-region discovery, scoring, crop selection, image generation, JPEG encoding, validation, performance limits, failure behavior, and diagnostics.

The process MUST be deterministic and MUST NOT use AI.

## B-00. Motivation

The purpose of the preview is to help the user recognize a saved page later.

A generic website logo is insufficient.

A screenshot of an entire long page scaled into a small social card is also insufficient because text and important visual details become unreadable.

The desired preview behaves more like a physical clipping from the source page.

The tool should identify a useful rectangular region of the rendered page and capture that region at approximately its natural browser scale.

A good preview might contain:

```text
an article heading and opening paragraph
a heading and related photograph
a product name and product image
a diagram and its caption
a documentation heading and explanatory text
a recognizable application interface
```

The preview should provide enough context that the user can often remember the destination before opening the link.

## C-00. Core capture principle

The preview MUST be selected from actual rendered page content.

The implementation MUST NOT generate a synthetic card containing reconstructed text.

The implementation MUST NOT use the remote site's logo as a fallback social card unless that logo naturally appears inside the selected page region.

The implementation MUST NOT create an image from only Open Graph metadata.

The implementation MUST NOT capture an entire page and scale it down to fit the final dimensions.

The desired process is:

```text
render page at normal readable scale
identify useful content
identify a rectangular region of the rendered page
capture that region
perform only minimal final resizing when required
encode as JPEG
```

Content should remain visually close to the size at which it appeared in the browser.

## D-00. No AI

Capture analysis MUST use deterministic document and layout heuristics.

It MUST NOT use:

```text
vision models
language models
OCR-based semantic understanding
image classifiers
embedding models
remote analysis services
AI-generated crop decisions
```

The algorithm may inspect browser-accessible properties such as:

```text
DOM structure
element roles
tag names
computed styles
bounding rectangles
visible text length
heading presence
image dimensions
viewport position
element density
overlap
```

These inputs are sufficient for this project.

## E-00. Browser technology

Playwright is the required browser automation technology.

Puppeteer MUST NOT be introduced.

The normal capture workflow uses a Chromium browser engine.

Using one fixed engine reduces environmental variation between captures.

The browser SHOULD run headless during normal operation.

A visible debugging mode may be implemented for development, but it MUST NOT affect the normal capture algorithm.

## F-00. Browser viewport

The capture browser MUST use a fixed desktop viewport.

The viewport is:

```text
width: 1440 CSS pixels
height: 1000 CSS pixels
device scale factor: 1
```

The browser MUST use a device scale factor of `1`.

This establishes a predictable relationship between CSS pixels and output image pixels.

The capture workflow MUST NOT emulate a mobile device.

The browser MUST NOT automatically zoom the page.

Browser page zoom MUST remain at 100 percent.

The implementation MUST NOT use browser zoom as a mechanism for fitting more content into the preview.

## G-00. Preview dimensions

The final preview canvas MUST be:

```text
1200 x 630 pixels
```

This is a project-defined fixed output format.

Every completed `preview.jpg` MUST have exactly these dimensions.

The aspect ratio is therefore approximately:

```text
1.9048 : 1
```

The algorithm should prefer selecting an actual page region with this aspect ratio.

The implementation MUST NOT maintain multiple social-preview sizes.

One fixed image is sufficient for this project.

## H-00. Relationship between viewport and output

Because the browser viewport is 1440 pixels wide and the output preview is 1200 pixels wide, the algorithm can normally capture a 1200 x 630 CSS-pixel region directly from the rendered page.

This is the preferred case.

Conceptually:

```text
browser page
+------------------------------------------------------+
|                                                      |
|       +--------------------------------------+       |
|       |                                      |       |
|       |        selected 1200 x 630           |       |
|       |                                      |       |
|       +--------------------------------------+       |
|                                                      |
+------------------------------------------------------+
```

When a 1200 x 630 region can be selected directly, the resulting image SHOULD be captured without rescaling.

This preserves readable text and natural page detail.

## I-00. Permitted final resizing

A perfect 1200 x 630 source rectangle may not always be possible.

A small amount of final resizing is permitted when necessary.

The source rectangle SHOULD remain within approximately 10 percent of the final dimensions in either direction.

For example, capturing:

```text
1180 x 620
```

and resizing to:

```text
1200 x 630
```

is acceptable.

Capturing:

```text
2400 x 1260
```

and scaling it down to:

```text
1200 x 630
```

is not acceptable as the normal strategy.

The algorithm should modify the crop region before resorting to significant scaling.

## J-00. Page navigation

Playwright navigates to the serialized target URL supplied by BRAVO.

Normal server-side and browser redirects are allowed.

The final browser URL may differ from the stored target.

The capture algorithm operates on the final rendered document reached after navigation.

The stored short-link target remains unchanged as defined by BRAVO.

## K-00. Navigation timeout

Initial page navigation MUST use a bounded timeout.

The navigation timeout is:

```text
30 seconds
```

The tool MUST NOT wait indefinitely.

A navigation timeout ends the capture unless Playwright has already loaded a usable document and the readiness algorithm explicitly determines that capture can safely continue.

Any such continuation must be deterministic and logged.

## L-00. Initial readiness

After navigation, the tool waits for:

```text
DOMContentLoaded
```

or an equivalent Playwright state indicating that the document structure is available.

The tool MUST NOT require the page to reach a permanent `networkidle` state.

Many modern pages continuously make network requests, maintain analytics connections, or update background data.

Waiting indefinitely for zero network activity would therefore be unreliable.

## M-00. Secondary readiness window

After DOM readiness, the capture workflow allows a bounded stabilization period.

The default stabilization budget is:

```text
5 seconds
```

During this period, the tool may wait for:

```text
document fonts
initial visible images
major layout shifts
client-rendered article content
```

The full capture process MUST proceed when the budget expires if a usable page state exists.

The tool MUST NOT keep extending this window because individual resources continue loading.

## N-00. Font readiness

If the browser exposes `document.fonts.ready`, the capture workflow SHOULD wait for it within the existing stabilization budget.

Failure of one remote font to load MUST NOT automatically cause capture failure.

The page may be captured using fallback fonts if the rest of the content is usable.

A font timeout MAY be logged at DEBUG level.

## O-00. Image readiness

The tool should allow visible images relevant to the initial content region time to load.

It MUST NOT wait for every image in a long document.

Images outside the current analysis region should not block readiness.

The capture algorithm MAY query image elements whose bounding rectangles intersect approximately the first two viewport heights.

Images that remain incomplete after the stabilization window are treated according to the page state that actually exists at capture time.

## P-00. Layout stability

The algorithm should avoid capturing during obvious initial layout movement.

A simple deterministic stability test is sufficient.

Conceptually:

```text
sample major content rectangles
wait briefly
sample again

if movement is small:
    consider layout stable
else:
    repeat within stabilization budget
```

The implementation MUST NOT create a complex general-purpose visual stability engine.

The goal is only to avoid capturing an obviously unfinished initial layout.

## Q-00. Animation handling

Animations can produce nondeterministic screenshots.

Before final region analysis and capture, the tool SHOULD disable CSS animations and transitions in the current document.

This may be done by injecting a local stylesheet that effectively applies:

```text
animation: none
transition: none
```

to rendered content.

The implementation SHOULD also pause animated scrolling behavior where practical.

The capture process MUST NOT wait for decorative animations to finish naturally.

## R-00. Video handling

Automatically playing video can make screenshots nondeterministic.

The capture workflow SHOULD pause HTML media elements before analysis.

The tool MUST NOT require media playback to identify a valid capture region.

A video element may still appear as a visible frame if it naturally occupies part of a selected region.

The implementation MUST NOT download or process the complete video.

## S-00. Scrolling policy

The algorithm may scroll the page while searching for useful content.

Scrolling must be deterministic.

The system should inspect a bounded portion of the page rather than traversing arbitrary document length.

The normal search area is:

```text
from document top
through the first 4000 CSS pixels of vertical document content
```

If the document is shorter, the entire document may be considered.

The tool MUST NOT scan tens or hundreds of thousands of pixels merely because a page uses infinite scrolling.

## T-00. Lazy-loaded content

Some useful content may load only after scrolling.

During bounded analysis, the algorithm MAY scroll through candidate areas to trigger ordinary lazy loading.

The process SHOULD pause briefly after each meaningful scroll position.

The total lazy-loading activity must remain within the capture time budget.

The tool MUST NOT intentionally trigger infinite feeds.

The tool MUST NOT repeatedly scroll to the bottom waiting for more content.

## U-00. Capture time budget

After successful initial navigation, preview analysis and generation SHOULD complete within an additional:

```text
20 seconds
```

under normal conditions.

This includes stabilization, bounded scrolling, candidate discovery, screenshot capture, and image preparation before external JPEG encoding.

This is a performance target rather than a hard guarantee for every filesystem or browser environment.

No individual wait may be unbounded.

## V-00. Overlay problem

Pages frequently contain overlays that obscure useful content.

Common examples include:

```text
cookie consent banners
newsletter popups
application-install banners
notification prompts
fixed promotional panels
modal dialogs
sticky headers
sticky footers
```

The capture algorithm may remove or dismiss nonessential overlays when they obstruct the candidate region.

It must do so conservatively.

## W-00. Overlay detection

A visible element may be considered an overlay candidate when several conditions are present.

Useful signals include:

```text
position: fixed
position: sticky
high z-index
large overlap with viewport content
modal or dialog semantics
large viewport coverage
placement independent of document flow
```

No single CSS property should automatically cause deletion.

For example, a site's fixed navigation header should not necessarily be removed merely because it is `position: fixed`.

## X-00. Overlay removal preference

When an overlay is clearly non-content and dismissible, the tool may first attempt to use an obvious dismissal control.

Examples of candidate controls include accessible buttons labeled conceptually as:

```text
close
dismiss
reject
continue without
not now
```

The tool SHOULD prefer rejecting optional consent rather than accepting it when a clear reject action exists.

The capture tool MUST NOT intentionally grant optional notification, location, camera, microphone, or similar permissions.

## Y-00. Overlay hiding fallback

If a clearly identified non-content overlay cannot be dismissed reliably, the capture tool MAY hide that element locally in the browser page solely for screenshot generation.

This modification affects only the temporary Playwright document.

It does not modify the remote site.

The action should be logged at DEBUG level with enough context to identify the hidden element category.

## Z-00. Access-control boundaries

The tool MUST distinguish ordinary presentation overlays from access-control barriers.

It MUST NOT bypass:

```text
authentication walls
paywalls
CAPTCHA challenges
anti-bot challenges
authorization prompts
restricted-content gates
```

If the rendered page is dominated by such an access barrier and the actual requested content cannot be captured, preview generation MUST fail.

The system should not save a CAPTCHA or login wall as if it were the intended article.

## AA-00. Initial content analysis

Once the page is stable enough, the algorithm analyzes visible and near-visible DOM regions.

The analysis should favor content-bearing elements.

Useful candidate roots include:

```text
article
main
section
role=main
large content containers
large heading-containing containers
documentation content regions
product-detail regions
```

The algorithm should not assume that semantic HTML is present.

Generic `div` containers may also become candidates based on their visual and textual properties.

## AB-00. Candidate rectangle

A candidate is a rectangular page region that may be expanded or adjusted into the final 1200 x 630 crop.

Each candidate should contain at least one meaningful content signal.

Examples are:

```text
a heading
a substantial text block
a sufficiently large image
a meaningful combination of text and image
a visually substantial interface region
```

Candidate generation should use actual rendered bounding rectangles rather than DOM tree position alone.

## AC-00. Candidate source hierarchy

The algorithm should first search for strong semantic candidates.

Conceptually, candidate discovery priority is:

```text
article or main content containers
heading-centered content groups
text-and-image groups
large meaningful images with nearby text
large readable text regions
other substantial visible content
```

The hierarchy is a search preference rather than an unconditional selection rule.

All candidates still pass through scoring and validity checks.

## AD-00. Heading signals

Headings are strong recognition signals.

The algorithm should recognize visible:

```text
h1
h2
h3
elements with heading role
large prominent text functioning as a heading
```

`h1` should receive the strongest heading preference.

A region containing an `h1` and supporting content is normally preferable to an equally sized region containing only body text.

The algorithm must not assume that every page has an `h1`.

## AE-00. Text signals

Readable textual content contributes positively to candidate quality.

The algorithm may measure:

```text
visible character count
number of text lines
font size
text-area density
presence of multiple words
distance from a heading
```

Very small text should contribute little or no positive score.

Text hidden by CSS or outside the rendered layout must not count.

Script, style, metadata, and non-rendered text must not count.

## AF-00. Minimum useful text size

Text should generally be considered useful when its computed font size is at least:

```text
14 CSS pixels
```

Headings may naturally be larger.

The algorithm MAY consider slightly smaller text when no stronger content exists, but it should not prefer a region whose main information is effectively unreadable at the final preview size.

## AG-00. Image signals

Rendered images can strongly improve recognizability.

An image receives positive weight when it has meaningful displayed dimensions.

A useful image should normally be at least approximately:

```text
200 x 120 CSS pixels
```

Small icons, favicons, avatars, social buttons, decorative glyphs, and tracking pixels should not materially improve a candidate score.

The algorithm should use rendered dimensions rather than intrinsic dimensions alone.

## AH-00. Background images

Meaningful CSS background images may be considered when they occupy a substantial visible region.

The implementation does not need to inspect every computed background image in the document.

It may restrict this analysis to already identified candidate containers.

Decorative page backgrounds should not dominate scoring.

## AI-00. Content balance

A candidate containing both recognizable text and meaningful imagery should normally score higher than a similarly positioned candidate containing only one of those signals.

This is not absolute.

A documentation page containing a strong heading and readable code or prose can be an excellent preview without a photograph.

Likewise, a visual page may have one highly recognizable image with little text.

The scoring system must therefore combine signals rather than requiring a fixed card template.

## AJ-00. Negative signals

The following characteristics should reduce candidate quality:

```text
navigation-dominated region
footer-dominated region
advertising
cookie or consent UI
login forms
large empty space
mostly icons
mostly buttons
social-sharing controls
related-content lists
comment sections
very small text
extreme visual clutter
```

The implementation does not need semantic understanding of each case.

DOM roles, tag names, class names, dimensions, element density, and relative position can provide practical deterministic signals.

## AK-00. Navigation regions

Regions dominated by:

```text
nav
role=navigation
menus
site-wide link collections
```

should receive a strong negative score.

A site header may still appear at the top edge of a capture when useful article content immediately follows it.

The objective is not to erase every trace of website chrome.

The objective is to prevent chrome from becoming the primary content of the preview.

## AL-00. Footer regions

Candidates inside a page footer should normally be rejected.

The first 4000-pixel search limit already makes accidental footer selection less likely on long pages.

On short pages, semantic `<footer>` or `contentinfo` regions should receive strong negative weight.

## AM-00. Advertisement regions

The algorithm should avoid obvious advertisement containers where they can be identified deterministically.

Useful signals may include:

```text
ad-oriented element IDs
ad-oriented class names
iframe advertising containers
common advertisement dimensions
labels such as Advertisement or Sponsored
```

The tool does not need a comprehensive ad-blocking engine.

Simple exclusion heuristics are sufficient.

## AN-00. Candidate crop construction

A promising content element will rarely have exactly the final preview dimensions.

The algorithm should therefore construct a 1200 x 630 crop around the candidate.

The crop should preserve the candidate's most useful content while remaining inside the rendered document.

For a heading-centered candidate, the crop should usually place the heading in the upper portion of the preview rather than exactly at the vertical center.

This leaves room for supporting content below it.

## AO-00. Horizontal crop positioning

The crop should prefer the horizontal content area rather than blindly centering on the full document.

If the page contains a narrow central article column, the selected 1200-pixel crop may include surrounding whitespace or adjacent useful imagery.

The crop must not extend beyond valid document coordinates.

If the document's rendered width is less than 1200 pixels, the fallback behavior defined later applies.

## AP-00. Vertical crop positioning

The algorithm should avoid placing the main heading directly against the top border.

When practical, approximately:

```text
40 to 120 CSS pixels
```

of contextual content or spacing may remain above the primary heading.

This is a preference, not a strict requirement.

A crop should move as necessary to retain more important text or imagery.

## AQ-00. Candidate scoring model

The implementation should use a small explicit scoring function rather than a chain of undocumented special cases.

Exact numeric weights may be adjusted during implementation, but the score must represent the following conceptual terms:

```text
score =
    heading value
  + readable text value
  + meaningful image value
  + text-image balance value
  + main-content semantic value
  + useful viewport-position value
  - navigation penalty
  - footer penalty
  - advertisement penalty
  - overlay penalty
  - empty-space penalty
  - tiny-content penalty
```

The scoring function should remain inspectable and reasonably small.

It must not become a generalized visual-ranking framework.

## AR-00. Deterministic tie-breaking

When multiple candidates receive effectively equal scores, selection must be deterministic.

Tie-breaking order is:

```text
candidate appearing earlier vertically
candidate closer to document horizontal center
candidate with larger readable text area
candidate discovered earlier by stable DOM traversal
```

The algorithm MUST NOT choose randomly among equal candidates.

This makes repeated captures easier to troubleshoot.

## AS-00. Preferred top-page content

Content near the beginning of a document receives a modest preference because titles, introductions, and primary imagery commonly occur there.

This preference must not be so strong that a navigation-heavy header defeats a clearly superior article region slightly farther down the page.

The search algorithm should therefore treat vertical position as one score component rather than an absolute rule.

## AT-00. Candidate validity

A high numerical score does not automatically make a candidate valid.

Before capture, the selected region must satisfy minimum visual-content requirements.

At least one of the following should normally be true:

```text
contains a meaningful heading and additional readable text
contains meaningful readable text and a substantial image
contains a substantial recognizable image plus contextual text
contains a visually substantial application or diagram region
contains a sufficiently large meaningful text block when imagery is absent
```

A region consisting almost entirely of blank space or site navigation is invalid.

## AU-00. Minimum content density

The selected crop should contain meaningful rendered content over a substantial portion of its area.

A simple approximate density test may be used.

The implementation should reject a crop when the overwhelming majority of the rectangle is visually empty and a better candidate exists.

The tool does not need pixel-level computer vision.

DOM bounding-box coverage is sufficient for this estimate.

## AV-00. Text clipping

Important headings should not be cut through horizontally or vertically at the crop boundary when this can be avoided.

The algorithm should know the bounding rectangles of high-value text elements.

If a crop boundary cuts through the primary heading, it should adjust the crop within valid bounds.

Likewise, a single line of supporting text should not be deliberately included with half of its line box outside the image when a small crop shift would avoid it.

## AW-00. Image clipping

Images may be partially cropped when that produces a better overall preview.

The algorithm does not need to preserve entire photographs.

However, a candidate should avoid useless crops that preserve only a narrow strip of an image.

When an image is the dominant recognition signal, enough of the rendered image must remain visible to be meaningful.

## AX-00. Page screenshots versus element screenshots

The preferred implementation is a page-region screenshot using an explicit clipping rectangle.

It should not rely exclusively on `element.screenshot()` because the desired crop commonly combines a heading with neighboring text or imagery beyond one DOM element.

Element screenshots may be used as intermediate measurements or for special cases, but the output contract remains a selected rectangular page region.

## AY-00. Screenshot background

The screenshot should reflect the rendered page.

The tool must not replace the page background with a synthetic branded background.

If the page has transparent regions, the browser's normal rendered background should be used.

The preview should resemble an authentic clipping of the source page.

## AZ-00. Metadata title candidate extraction

Although BRAVO owns the final sanitization contract, capture-time inspection determines candidate priority.

The raw title candidate order is:

```text
og:title
document <title>
first useful h1
first useful heading functioning as the primary title
```

The first non-empty candidate should normally be used.

However, candidates that are obviously unusable because they contain no visible or meaningful textual data after basic extraction may be skipped.

Sanitization is then performed according to ALPHA and BRAVO.

## BA-00. Metadata description candidate extraction

The raw description candidate order is:

```text
og:description
meta[name="description"]
substantial text immediately associated with the primary heading
first substantial visible paragraph in the selected main-content region
```

The tool MUST NOT generate a semantic summary.

When using visible fallback text, it should extract existing page text as-is before sanitization and truncation.

## BB-00. Metadata and capture independence

Metadata selection and screenshot-region selection are related but independent.

A page might provide excellent Open Graph metadata while its best screenshot occurs elsewhere.

Conversely, a visually strong page may provide no useful metadata.

The screenshot algorithm MUST NOT simply capture the DOM element from which title metadata was extracted.

It should independently select the best visual region.

## BC-00. Text extraction

When visible DOM text is used as a metadata fallback, extraction should use rendered human-readable text.

The implementation should avoid collecting:

```text
hidden text
script contents
style contents
ARIA implementation text not visually present
navigation lists
footer boilerplate
cookie banners
```

A short deterministic extraction helper is sufficient.

## BD-00. Metadata diagnostic logging

At DEBUG level, the tool should record the source chosen for each metadata field.

Example:

```text
Metadata title source:
  og:title

Metadata description source:
  first visible paragraph in main content
```

The log should not dump large raw values.

A bounded sanitized excerpt may be shown when necessary for debugging.

## BE-00. Capture candidate diagnostics

DEBUG logging should make candidate selection understandable.

For the leading candidates, the tool should be able to report information conceptually similar to:

```text
Candidate 1:
  source: article
  bounds: x=120 y=280 width=1080 height=740
  heading: yes
  readable text: 1840 chars
  meaningful images: 1
  score: 86

Candidate 2:
  source: section
  bounds: x=90 y=1300 width=1160 height=650
  heading: yes
  readable text: 920 chars
  meaningful images: 2
  score: 74
```

The exact numeric score is implementation-specific.

The important requirement is that a developer can understand why one region defeated another without instrumenting the algorithm manually.

## BF-00. Selected crop diagnostics

The final crop should be logged at DEBUG level.

Example:

```text
Selected preview crop:
  x: 120
  y: 240
  width: 1200
  height: 630
  source candidate: article
  score: 86
```

If the crop was adjusted to prevent clipping or stay inside document bounds, the adjustment should also be available in DEBUG output.

## BG-00. Screenshot capture

After final crop selection, Playwright captures exactly that region.

The screenshot operation should preferably produce either:

```text
JPEG directly
```

or an intermediate format that can be losslessly processed before the final JPEG conversion.

If Playwright's JPEG output satisfies the required quality and dimensions, direct JPEG output is preferred because it eliminates an unnecessary conversion step.

## BH-00. JPEG quality

The completed preview MUST use JPEG encoding at approximately:

```text
90 percent quality
```

The implementation may express this as the corresponding quality parameter accepted by Playwright or ImageMagick.

The value is intentionally high enough to retain readable text while reducing repository size relative to PNG.

The project does not require lossless preview storage.

## BI-00. JPEG color handling

The generated JPEG should use a normal browser-compatible RGB color representation.

The tool should avoid unusual color profiles or image modes that produce inconsistent browser rendering.

If ImageMagick is used, the conversion should yield an ordinary web-compatible JPEG.

Advanced color-management configuration is unnecessary.

## BJ-00. Intermediate image files

If an intermediate PNG is required, it must exist only in the temporary working area.

The completed record contains only:

```text
index.html
preview.jpg
```

The tool MUST NOT preserve both:

```text
preview.png
preview.jpg
```

The JPEG is authoritative.

## BK-00. Output validation

Before returning the preview to BRAVO, the capture pipeline must validate the resulting file.

The validation must confirm:

```text
file exists
file size is greater than zero
file is decodable as JPEG
width is exactly 1200 pixels
height is exactly 630 pixels
```

A file named `.jpg` that cannot be decoded as JPEG is invalid.

## BL-00. Minimum file sanity

An implausibly tiny output may indicate a failed or blank screenshot.

The implementation SHOULD treat an extremely small JPEG as suspicious.

A fixed hard minimum may be used as a sanity check, but it should not be the primary validity test because simple pages can compress efficiently.

Image dimensions and content-region validity remain more important.

## BM-00. Blank preview prevention

The tool must not accept a completely or nearly blank capture when a page otherwise contained detectable content.

The implementation may compare the selected candidate's DOM coverage before capture rather than performing sophisticated image analysis afterward.

If the selected region unexpectedly renders empty due to a browser or screenshot failure, generation should fail rather than produce a misleading preview.

## BN-00. Narrow pages

A document may render at less than 1200 CSS pixels of useful width.

The algorithm should first determine whether the page itself still occupies the normal 1440-pixel viewport with a narrower centered content column.

In that normal case, the final crop can still be 1200 pixels wide and include surrounding page background.

If the actual rendered document is genuinely narrower, the tool may capture the available width and minimally upscale it to 1200 pixels if the upscale remains within the approximately 10 percent tolerance defined earlier.

If significantly greater enlargement would be required, capture should use the wider browser viewport context rather than magnifying a small content element.

## BO-00. Short pages

A document may have less than 630 CSS pixels of meaningful vertical content.

The algorithm may include surrounding page background to produce the required 630-pixel crop.

It MUST NOT vertically stretch the page content simply to fill the image.

The crop should remain an authentic representation of the rendered document.

## BP-00. Very long pages

The algorithm examines only the bounded search region defined in this specification.

A 100,000-pixel page should therefore not be materially more expensive than another page once the search limit has been reached.

The tool MUST NOT generate a full-page bitmap for candidate analysis.

Candidate scoring should use DOM measurements.

## BQ-00. Infinite scrolling pages

The tool must not chase infinite content.

The 4000-pixel search boundary remains authoritative even when scrolling causes additional document content to load below it.

The first useful representative region is sufficient.

The project is a link archive, not a content mirroring system.

## BR-00. Single-page applications

A client-rendered application may initially contain very little content at `DOMContentLoaded`.

The bounded stabilization period allows such pages time to render.

If meaningful content appears within the readiness budget, normal candidate analysis proceeds.

If the page remains effectively empty after the budget expires, capture fails with a readiness or candidate-selection error.

The tool MUST NOT wait indefinitely for application-specific state.

## BS-00. Documentation pages

Documentation pages often contain:

```text
navigation sidebar
main heading
body text
code blocks
```

The algorithm should penalize the navigation sidebar and favor the main documentation area.

A good preview may contain the page heading, several lines of explanatory text, and part of a code block.

There is no requirement that a preview contain an image.

## BT-00. Article pages

For a typical article containing:

```text
site header
headline
subtitle
hero image
opening paragraphs
```

the preferred region usually contains the headline and at least one of:

```text
subtitle
hero image
opening text
```

The site header may appear partially if naturally adjacent, but it should not consume most of the preview.

## BU-00. Product pages

For a typical product page, useful signals may include:

```text
product name
large product image
short descriptive text
```

Price may naturally appear if it is part of the selected region, but the algorithm does not need a special price extractor.

The system should avoid selecting only recommendation carousels or site navigation when stronger product-detail content exists.

## BV-00. Application interfaces

Some links represent web applications rather than articles.

Such pages may lack conventional headings and paragraphs.

A large structured interface region can still be a valid preview when it contains substantial visible UI and is not merely a login screen or blank shell.

The candidate algorithm should therefore allow visually substantial non-article regions to compete even when semantic text signals are weaker.

## BW-00. Image-centric pages

An image-centric page may provide little text.

If one large meaningful image dominates the visible page and represents the destination well, a candidate centered on that image is valid.

The algorithm should include nearby title or caption text when available.

It should not reject the page merely because it lacks article-style text.

## BX-00. Pages dominated by login UI

If the target resolves to a page whose useful visible content is primarily:

```text
sign in
register
enter password
authentication challenge
```

and the requested destination content is unavailable, generation must fail.

The error should indicate that the page rendered successfully but the actual content appears inaccessible without authentication.

The system should not create a misleading login-page preview.

## BY-00. CAPTCHA and anti-bot challenge

If Playwright reaches a clear CAPTCHA or anti-bot challenge, the workflow must fail.

The tool must not attempt to solve or circumvent the challenge.

The error should distinguish this from a network failure.

Example:

```text
Unable to generate preview.

Stage:
  page readiness

Reason:
  The target rendered an access challenge instead of the requested content.

Target:
  https://example.com/article
```

## BZ-00. Error pages

The tool should reject obvious error documents such as:

```text
404 Not Found
500 Internal Server Error
Service Unavailable
Access Denied
```

when they represent failure to obtain the intended destination.

Detection may use HTTP status together with obvious visible page signals.

The implementation does not need a broad multilingual error-page classifier.

## CA-00. Screenshot failure

If Playwright fails to capture the selected rectangle, the preview operation fails.

The error must include:

```text
target URL
capture stage
selected rectangle
Playwright error message
```

when those values exist.

The capture workflow may perform one immediate retry if the page and browser remain valid and the failure appears transient.

More than one automatic screenshot retry is unnecessary.

## CB-00. JPEG conversion failure

If external conversion is required and conversion fails, the preview operation fails.

Diagnostics should include:

```text
input temporary path
output temporary path
converter executable
exit status
bounded stderr
```

The command must not retain an unconverted PNG as the final preview.

## CC-00. Candidate discovery failure

If no valid region can be found after bounded analysis, capture must fail.

The system MUST NOT silently substitute a blank or generic project image.

A useful error is conceptually:

```text
Unable to generate preview.

Target:
  https://example.com/page

Stage:
  preview selection

Reason:
  No page region satisfied the minimum content requirements.

Analysis:
  14 candidate regions inspected.
  0 candidates passed final validity checks.
```

Detailed candidate information belongs in DEBUG logs.

## CD-00. Metadata failure versus capture failure

Missing metadata does not necessarily prevent capture.

Missing capture content does.

Therefore:

```text
no usable title -> use (no title)
no usable description -> use (no description)
no usable preview region -> fail
```

This distinction must remain explicit.

Every successful record requires a real preview image.

## CE-00. Deterministic fallback candidate

If semantic candidate discovery produces no valid candidate, the algorithm may use one final deterministic fallback.

The fallback examines the top portion of the rendered page after overlay handling.

It attempts to locate the densest meaningful content region within the first:

```text
1600 vertical CSS pixels
```

using visible text and image bounding boxes.

If a valid 1200 x 630 crop can be constructed there, it may be used.

If this fallback also fails, preview generation fails.

The system must not add additional arbitrary fallback chains.

## CF-00. Fallback diagnostics

When the fallback algorithm is used, this should be visible in normal diagnostic output at WARN or DEBUG level.

Example:

```text
Preview selection fallback:
  No semantic content candidate passed validation.
  Using densest-content search within the first 1600 CSS pixels.
```

Successful fallback is not a fatal error.

## CG-00. Cropping around fallback content

The fallback crop should be centered around the densest useful content while respecting document bounds.

It should apply the same:

```text
heading preservation
text clipping avoidance
image usefulness
empty-space checks
```

as ordinary candidate crops.

Fallback changes discovery, not quality standards.

## CH-00. Capture stability verification

Immediately before screenshot capture, the tool SHOULD verify that the selected candidate has not moved materially since analysis.

If the candidate rectangle changes substantially, the algorithm may recalculate the crop once.

It MUST NOT enter an indefinite re-analysis loop.

One bounded re-analysis is sufficient.

## CI-00. DOM mutation after analysis

Dynamic sites may alter or remove content after candidate selection.

If the selected content disappears before capture, the tool should attempt one bounded candidate re-analysis.

If no valid replacement exists, capture fails.

This behavior should be visible in DEBUG logs.

## CJ-00. Sticky elements during scroll

Sticky headers and sidebars can change location while the tool scrolls.

Candidate analysis should use the element's rendered rectangle at the relevant scroll position.

A sticky header that overlaps the final selected crop should be treated as an overlay or negative-content element according to its size and role.

The implementation should not assume static document coordinates for sticky elements.

## CK-00. Fixed viewport overlays

A fixed overlay may appear at every scroll position.

If it occupies a significant portion of the 1200 x 630 crop and is not meaningful destination content, it should be dismissed or hidden before final capture when safely possible.

The selected crop should then be remeasured if layout changed.

## CL-00. Scrollbar handling

Browser scrollbars should not become a meaningful part of the preview.

The implementation SHOULD configure or style the capture environment so that the screenshot does not contain visually distracting scrollbars when Playwright permits this reliably.

This must not require modifying the target site's layout substantially.

## CM-00. Browser prompts

Native browser prompts and permission requests must not block capture.

The Playwright context should default to denying or not granting optional browser permissions.

Unexpected dialogs should be dismissed where safe.

The tool MUST NOT interact with dialogs that would perform destructive or unrelated actions.

## CN-00. New windows and popups

The capture workflow operates on the original target page.

Unexpected popup windows should not replace the capture target.

The tool may close unsolicited popup pages.

If navigation intentionally transforms the original page into a different final URL, normal redirect handling applies.

## CO-00. Download responses

If navigation results in a file download instead of a renderable web page, preview generation fails.

The project does not attempt to render downloaded PDFs, archives, executables, or other non-HTML resources through a separate preview system.

This specification concerns rendered web pages.

Support for other resource types is out of scope.

## CP-00. PDF browser viewers

If a URL renders through the browser's built-in PDF viewer rather than a normal document, behavior may differ between Playwright environments.

PDF-specific capture is not required.

The tool should fail clearly if no normal DOM content suitable for the defined candidate algorithm is available.

The project should not add a PDF rendering subsystem merely for this case.

## CQ-00. Cross-origin content

Cross-origin iframes may appear within target pages.

The screenshot can naturally include their rendered pixels.

The algorithm does not need to introspect inaccessible cross-origin DOM content.

Candidate scoring should primarily rely on accessible parent-document layout.

A large visible iframe may contribute as a rendered region when its bounds are meaningful, but the tool must not depend on reading its internal DOM.

## CR-00. Canvas content

Canvas-based interfaces may contain important visual information that is not represented as DOM text.

A sufficiently large visible canvas may contribute as a meaningful visual region.

The algorithm does not need to inspect canvas pixels semantically.

Its rendered size, position, surrounding text, and surrounding structure are sufficient signals.

## CS-00. SVG content

Rendered SVG may be considered meaningful imagery when its displayed dimensions are substantial.

Small icon SVG elements should not meaningfully improve candidate scores.

The algorithm may treat large SVG regions similarly to images for scoring purposes.

## CT-00. Code blocks

Large readable code blocks can be useful recognition signals for documentation or technical articles.

A visible `pre` or code-containing region may contribute positively when:

```text
font size is readable
area is substantial
it appears near meaningful surrounding text
```

A candidate consisting only of a tiny code fragment should not defeat a stronger content region.

## CU-00. Tables

A substantial visible table may contribute to candidate quality.

The tool does not need to interpret table semantics.

If a table is too dense to remain readable at natural scale, it should not receive excessive positive weight merely because it contains many characters.

Visual area and readable font size remain important.

## CV-00. Candidate count limit

Candidate analysis must remain bounded.

The tool SHOULD evaluate no more than approximately:

```text
100 candidate regions
```

during normal processing.

If the DOM produces many thousands of possible containers, lower-value candidates should be filtered before scoring.

The exact internal filtering strategy is implementation detail.

The algorithm must not perform expensive scoring over every DOM node.

## CW-00. DOM inspection limit

The implementation should avoid repeatedly traversing the complete document tree.

A single structured traversal plus bounded candidate refinement is preferred.

The capture algorithm should remain practical on complex pages with large DOMs.

Performance should be observable through debug timing logs.

## CX-00. Timing diagnostics

DEBUG logging should include major capture durations.

Conceptually:

```text
Navigation:            1.8s
Stabilization:         2.4s
Candidate discovery:   0.2s
Candidate scoring:     0.1s
Screenshot:            0.3s
JPEG processing:       0.1s
Total capture:         4.9s
```

Exact formatting is implementation-specific.

The purpose is to identify unexpectedly slow stages without adding manual instrumentation.

## CY-00. Normal console output

Normal non-debug output should not print every candidate score.

A concise successful flow may report:

```text
Opening target...
Page ready.
Selecting preview...
Preview captured.
```

BRAVO controls the overall command presentation.

CHARLIE supplies meaningful stage and diagnostic information.

## CZ-00. Error logging

Every capture-ending error must identify a stable stage.

Relevant capture stages include:

```text
browser launch
page navigation
page readiness
overlay handling
metadata extraction
preview candidate discovery
preview selection
preview capture
JPEG conversion
preview validation
```

The error should also identify the target URL.

When a rectangle had already been selected, capture-related failures should include that rectangle in DEBUG diagnostics.

## DA-00. Screenshot debug artifact

The normal workflow MUST NOT leave diagnostic screenshots in the repository.

A development-only debug mode MAY save additional temporary images showing:

```text
candidate regions
selected crop
full viewport
```

These artifacts must remain outside the final `lnk/<id>/` record.

Debug artifacts are not part of the repository format and must not be generated during normal operation.

## DB-00. Reproducibility

Given the same rendered target content, browser version, viewport, and DOM layout, repeated capture attempts should normally select the same region.

The following sources of intentional variation should be minimized:

```text
random candidate ordering
animation timing
changing viewport size
unbounded asynchronous waiting
different browser engines
arbitrary scrolling
```

Perfect byte-for-byte image reproducibility across browser versions is not required.

Deterministic selection behavior is required.

## DC-00. Capture algorithm summary

The complete capture algorithm is conceptually:

```text
open target in Chromium
wait for DOM readiness
enter bounded stabilization period
wait for fonts where practical
allow relevant initial images to load
disable animations and transitions
pause media
dismiss or hide safe non-content overlays
inspect bounded upper page region
discover candidate content regions
score candidates
construct 1200 x 630 crops
validate crops
select highest-scoring valid crop
if none exists:
    run one densest-content fallback
if still none exists:
    fail
verify selected content has not moved materially
capture selected rectangle
encode as JPEG at about 90 percent quality
validate JPEG and exact dimensions
return preview artifact
```

Implementation code may be structured differently, but observable behavior must remain consistent with this sequence.

## DD-00. User scenario: article

The user adds an article.

The rendered page contains a site navigation header, a large article heading, an opening paragraph, and a hero image.

The capture algorithm penalizes the navigation area.

It identifies the article container and heading.

It constructs a 1200 x 630 region containing the heading, part of the opening paragraph, and part or all of the hero image.

The text remains near its normal rendered scale.

The resulting image is encoded as `preview.jpg`.

When the link is later shown in the journal or a social preview, the user can recognize the article from the heading and imagery.

## DE-00. User scenario: documentation

The target is a technical documentation page.

The page has a narrow left navigation sidebar and a wide content column containing:

```text
API Reference
```

followed by explanatory text and code.

The algorithm gives the navigation area a negative score and favors the main content region.

The resulting preview contains the documentation heading and readable technical content rather than a miniature image of the entire documentation site.

## DF-00. User scenario: emoji-heavy title

The target renders correctly and exposes:

```text
🚀 New Runtime — 日本語 & Русский 🔥
```

as `og:title`.

CHARLIE chooses `og:title` as the raw title source.

BRAVO sanitizes it to:

```text
New Runtime 日本語 Русский
```

The screenshot itself remains an authentic page capture and is not modified to remove emoji that happen to be visibly rendered inside the webpage.

The sanitization contract applies to generated textual metadata, not to pixels inside the screenshot.

## DG-00. User scenario: consent banner

The target initially shows a large cookie banner covering the lower half of the viewport.

The banner is identified as an overlay.

A clear reject or dismiss control is available.

The capture workflow dismisses the banner without granting optional permissions.

The underlying article becomes visible.

Candidate analysis proceeds on the unobstructed document.

## DH-00. User scenario: login wall

The target resolves to a login form and does not expose the intended content.

The algorithm determines that the visible page is dominated by authentication UI.

No valid content candidate representing the destination is available.

Capture fails.

No `preview.jpg` becomes part of a committed link record.

The error states that the page loaded but the requested content appears inaccessible without authentication.

## DI-00. User scenario: long article

The target is a very long article.

The document height is more than 50,000 pixels.

The tool does not capture the full page.

It examines only the bounded initial search region.

A strong heading-and-image candidate appears at approximately `y=650`.

The tool selects that region and completes capture without processing the remaining tens of thousands of pixels.

## DJ-00. User scenario: sparse homepage

The target has little semantic markup but presents a substantial visual interface in the upper page.

No `article` or `main` candidate passes the strong semantic search.

The fallback densest-content search finds a region containing a large application panel and readable text.

That region passes final validity checks and becomes the preview.

The fallback use is recorded in diagnostics.

## DK-00. User scenario: unusable page

The page renders only a blank shell with a small loading spinner.

After the stabilization budget, the spinner remains and no meaningful text, image, application interface, or content region exists.

Semantic candidate discovery fails.

The fallback also fails.

The operation ends with:

```text
Stage:
  preview selection

Reason:
  No page region satisfied the minimum content requirements.
```

No synthetic placeholder image is created.

## DL-00. User scenario: dynamic layout shift

The tool selects a candidate.

Before capture, a late-loading image shifts the article downward by 300 pixels.

The pre-capture stability verification detects significant movement.

The algorithm performs one bounded re-analysis.

It selects the article at its new position and captures it.

If the layout continues changing after that bounded retry, the operation fails rather than looping indefinitely.

## DM-00. Security and input boundaries

Remote page content is untrusted.

The capture workflow must not construct shell commands from remote metadata.

The capture workflow must not use remote page strings as filesystem paths.

The capture workflow must not execute scripts extracted from the page outside the browser context.

The browser itself naturally executes the target page's JavaScript as part of rendering.

That execution occurs inside the Playwright browser context.

The local Node.js process must maintain the boundary between rendered remote content and local command execution.

## DN-00. Browser isolation

A fresh browser context SHOULD be created for each add-link operation.

The context should not inherit ordinary personal browser cookies or saved sessions.

The workflow MUST NOT read the user's default browser profile.

The capture should represent what a clean unauthenticated visitor can normally access.

This also improves reproducibility.

## DO-00. Browser storage

Browser storage created during capture is temporary.

The tool does not need to persist:

```text
cookies
localStorage
sessionStorage
IndexedDB
service-worker state
```

between separate add-link operations.

Each capture should begin from a clean context unless implementation constraints explicitly require otherwise.

## DP-00. Network interception

A general-purpose ad blocker or request-filtering proxy is not required.

The tool may use narrow Playwright request handling if necessary to prevent clearly irrelevant or harmful resource classes from disrupting capture, but this should remain minimal.

The default behavior should be to render the page normally.

Over-aggressive resource blocking can alter layout and create inaccurate previews.

## DQ-00. Remote page integrity

The goal is to capture the target as it normally appears, with only limited modifications necessary for determinism and visibility.

Permitted local modifications include:

```text
disabling animation
pausing media
dismissing nonessential overlays
hiding clearly obstructive non-content overlays
temporary scroll positioning
```

The tool should not:

```text
rewrite article text
remove arbitrary page sections
rearrange content
change font sizes
replace images
inject project branding
```

The preview should remain recognizable as the original page.

## DR-00. Performance constraints

The capture implementation must not solve visual selection through brute-force screenshot generation.

It should not capture dozens of full-size images merely to compare them.

DOM analysis should narrow the candidate set before screenshot generation.

Under normal conditions, one final preview screenshot should be sufficient.

A small number of debug or retry captures may occur only when explicitly justified.

## DS-00. Memory constraints

The workflow must avoid full-page screenshots of extremely long documents.

It must avoid retaining multiple large screenshot buffers unnecessarily.

Temporary image buffers should be released after conversion or validation.

This keeps the local tooling suitable for ordinary developer machines without introducing streaming-image infrastructure.

## DT-00. Implementation simplicity

The capture algorithm may be sophisticated enough to select useful content, but its implementation should remain inspectable.

It should consist of understandable stages such as:

```text
readiness
cleanup
candidate discovery
candidate measurement
scoring
crop construction
capture
validation
```

The implementation MUST NOT introduce:

```text
computer-vision frameworks
machine-learning dependencies
general browser-crawling frameworks
image-search indexes
remote screenshot services
```

Playwright, ordinary browser APIs, Node.js, and the selected JPEG tooling are sufficient.

## DU-00. Acceptance conditions

CHARLIE is satisfied when all of the following are true.

The target is rendered using Playwright Chromium.

The browser uses a fixed 1440 x 1000 desktop viewport at device scale factor 1.

Page zoom remains 100 percent.

Navigation and all readiness waits are bounded.

The process does not require permanent network idle.

Animations and transitions are disabled before final capture where practical.

Media playback is paused.

Nonessential obstructive overlays may be safely dismissed or hidden.

Authentication barriers, CAPTCHA challenges, and access-control mechanisms are not bypassed.

Candidate analysis is limited to a bounded upper portion of the page.

Candidate analysis relies on deterministic DOM and layout signals rather than AI.

Headings, readable text, meaningful images, and main-content semantics contribute positively.

Navigation, footer content, advertisements, overlays, empty space, and tiny content contribute negatively.

Candidate analysis is bounded in candidate count and DOM work.

Tie-breaking is deterministic.

The preferred crop is an actual 1200 x 630 CSS-pixel page region captured near 1:1 scale.

Large full-page screenshots are not scaled down to create previews.

The final image is exactly 1200 x 630 pixels.

The final image is a real JPEG.

JPEG quality is approximately 90 percent.

No PNG remains in the completed record.

The screenshot represents actual rendered target content.

Missing title or description does not cause capture failure.

Missing usable visual content does cause capture failure.

A single deterministic densest-content fallback is available when normal semantic candidate selection fails.

The tool does not generate placeholder cards when no useful page region exists.

Major capture stages and timing are diagnosable through console logs.

DEBUG output can explain candidate selection and the final crop without requiring additional instrumentation.

The capture workflow remains bounded in time and memory for extremely long or complex pages.

The completed preview can be passed to BRAVO as a validated `preview.jpg`.

## DV-00. Next specification

The next specification is:

```text
2026-08-16.DELTA.A-00
Journal Data Loading, Pagination, and Cache
```

It will define how the static journal reads `links.txt`, resolves individual link records, parses their generated HTML metadata, maintains newest-first ordering, groups entries into journal pages or spreads, limits network requests, prefetches nearby entries, stores browser-side cached records, applies the one-hour cache lifetime, detects manifest changes, handles removed or malformed records, recovers from network failures, and exposes sufficient diagnostics for troubleshooting the journal's data-loading behavior.

