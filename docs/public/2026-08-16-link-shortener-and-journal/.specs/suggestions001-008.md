2026-08-16

# 2026-08-16.HOTEL.A-00

## A-00. Incremental Change Request: Journal Interaction, Entry Metadata, Navigation Controls, and Site-Specific Capture

This specification is an incremental change request for the existing ALPHA through GOLF specification set. It does not rewrite or revise the earlier specification files. Earlier requirements remain authoritative except where this document explicitly replaces or extends a specific behavior.

The current implementation already contains application-level `Ctrl`/`Cmd + wheel` zoom, pointer-based panning, drag-click suppression, and six-entry journal cards. It also currently stores sanitized title and description metadata with substantially shorter hard limits than requested here.  

This change request addresses six concrete problems observed in the implemented product:

1. Application-level `Ctrl + wheel` zoom duplicates browser-native zoom and creates undesirable interaction complexity.
2. Dragging to pan can select page text and other content.
3. Clicking a journal entry does not reliably open its destination in a new tab.
4. Journal cards do not display the saved description, even though generated records already contain description and Open Graph description metadata.
5. Generic screenshot candidate selection fails on important structured sites such as YouTube.
6. Page turning is available through the keyboard but lacks clear, elegant mouse/touch navigation affordances at the sides of the journal.

The objective is not to redesign the project. The objective is to remove unnecessary custom behavior, fix interaction defects, expose already available metadata more usefully, add a small deterministic extension mechanism for exceptional websites, and make journal navigation discoverable without sacrificing the existing visual design.

The current YouTube failure is reproducible with:

```text
npm run add-link https://www.youtube.com/watch?v=un_O5WrZDNc
```

The existing implementation reaches preview selection, inspects 87 candidate regions, attempts its fallback, and terminates with `CAPTURE_NO_VALID_REGION`. 

## B-00. Precedence and implementation discipline

This document modifies earlier requirements only in the following areas:

| Area                              | New rule                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| `Ctrl + wheel`                    | Remove application-level handling; use browser-native zoom    |
| Custom zoom hint                  | Remove                                                        |
| Application camera zoom constants | Remove if no longer required by another interaction           |
| Mouse-wheel behavior              | Ordinary wheel remains ordinary browser/page scrolling        |
| Pan text selection                | Prevent selection during a pan interaction                    |
| Entry activation                  | Normal click opens destination in a new tab                   |
| Journal card content              | Add description                                               |
| Stored title limit                | Increase to 1000 characters                                   |
| Stored description limit          | Increase to 1000 characters                                   |
| Site-specific capture             | Add exact-hostname capture adapters, beginning with YouTube   |
| Page navigation                   | Add visible side navigation affordances for pointer/touch use |

Everything else in ALPHA through GOLF remains unchanged.

In particular, this specification does not change the six-entry logical page, the two-page desktop spread, one-page constrained/mobile presentation, manifest model, static hosting model, JPEG preview contract, cache model, page-turn animation, diagnostics philosophy, or validation requirements.

Codex MUST treat HOTEL as an additive correction layer over the existing specification set. When HOTEL conflicts directly with an earlier requirement in one of the areas listed above, HOTEL takes precedence.

## C-00. Remove application-level Ctrl-wheel zoom

The application currently intercepts modified wheel events, calls `preventDefault()`, changes an internal camera zoom value, and recalculates journal geometry.  That mechanism must be removed.

Modern browsers already provide browser-level zoom through `Ctrl + wheel`, `Cmd + wheel`, keyboard shortcuts, browser menus, and platform-specific gestures. The application should not duplicate that capability.

The resulting desktop interaction model is deliberately simpler:

| Input                                                | Result                                 |
| ---------------------------------------------------- | -------------------------------------- |
| Mouse wheel                                          | Normal browser/page vertical scrolling |
| Trackpad scroll                                      | Normal browser/page scrolling          |
| `Ctrl + wheel`                                       | Browser-native browser zoom            |
| `Cmd + wheel` where the browser/platform supports it | Browser-native behavior                |
| Left mouse drag                                      | Application pan                        |
| Left/Right keyboard arrows                           | Journal page navigation                |
| Side page controls                                   | Journal page navigation                |

The application MUST NOT register a wheel listener whose purpose is to intercept `Ctrl`, `Meta`, or another modifier and implement journal zoom.

The application MUST NOT call `preventDefault()` on `Ctrl + wheel` for application zoom.

The application MUST NOT maintain a second scale factor whose purpose is to imitate browser zoom.

The existing `Ctrl + wheel to zoom` instructional hint must also be removed. It would become misleading because the zoom operation now belongs to the browser rather than the application.

The earlier minimum-readable-size principle remains relevant to the application's own responsive layout. The journal must still avoid automatically shrinking itself to illegible dimensions simply to fit a small application viewport. However, browser zoom is outside that layout model.

The expected result is simpler:

```text
application
  -> controls journal layout, scrolling overflow, pan, page turns

browser
  -> controls browser zoom
```

This separation eliminates duplicated zoom state and reduces the number of geometry combinations that the application must maintain.

### User scenario

The user opens the journal and presses `Ctrl` while turning the mouse wheel.

The browser performs its ordinary native zoom.

The journal does not intercept the gesture and does not maintain a separate zoom value.

After the browser zooms the document, the user can still scroll and pan the journal as necessary.

### Acceptance

The implementation passes when no application-level modified-wheel zoom handler remains, the obsolete zoom instruction is absent, browser-native `Ctrl + wheel` works normally, ordinary wheel scrolling still works, and journal panning remains usable after browser zoom at representative zoom levels.

Tests that currently assert application camera-scale changes from `Ctrl + wheel` must be removed or rewritten. The current browser test explicitly verifies the custom zoom implementation and therefore must change with this requirement. 

## D-00. Prevent text selection while panning

The current panning implementation begins tracking on `pointerdown`, but `user-select: none` is applied only after movement crosses the pan threshold and the `is-panning` class is added.  

This creates a race with native browser selection behavior. Between pointer-down and recognition of the gesture as a pan, the browser remains free to begin selecting text. Once selection has started, adding `user-select: none` later does not necessarily produce a clean interaction. This matches the observed behavior where dragging the journal leaves titles, metadata, or other text visibly selected.

The fix should preserve normal click behavior while making a drag behave like manipulation of an image or map.

### Required gesture lifecycle

On a valid primary-pointer press that may become a pan, the application should enter a temporary `pan-armed` state.

Conceptually:

```text
pointer down
    |
    +-- arm possible pan
    +-- temporarily prevent text selection
    +-- remember starting pointer position
    +-- remember starting pan position

movement below threshold
    |
    +-- still potentially a click

movement exceeds threshold
    |
    +-- become actual pan
    +-- prevent native pointer-drag behavior
    +-- move journal

pointer up
    |
    +-- if no pan occurred:
    |      restore normal selection state
    |      allow click
    |
    +-- if pan occurred:
           restore normal selection state
           suppress only the click belonging to this drag
```

The implementation SHOULD use a temporary CSS state such as:

```text
.is-pan-armed
.is-panning
```

with `user-select: none` applied while the pointer is held for a potential pan.

The state MUST be removed on:

```text
pointerup
pointercancel
lostpointercapture
```

and any equivalent cleanup path.

The implementation should also use `event.preventDefault()` after the gesture has unambiguously become a pan when this is useful to suppress browser-native drag or selection behavior.

If a selection range has already appeared because of browser timing, entering confirmed pan mode MAY clear the selection through the Selection API. This is a defensive cleanup, not the primary mechanism.

Native image dragging remains disabled.

### Important limitation

Normal stationary page content does not need to be permanently unselectable.

The requirement is specifically to prevent text selection as an accidental side effect of the pan interaction.

Do not globally apply permanent:

```css
user-select: none;
```

to the complete document simply because it is easy.

### Acceptance

Repeatedly dragging across titles, descriptions, hostnames, dates, paper, previews, and desk space must move the journal without leaving blue text-selection highlights.

A normal click without meaningful drag must still activate a journal card.

Keyboard text/focus behavior must remain unaffected.

Codex must test this after browser-native zoom as well as at default browser zoom.

## E-00. Fix journal-card activation and open links in a new tab

A journal tile is intended to behave as one large link target. The current implementation creates an anchor for each entry, but it does not set `target="_blank"`. It also stores a `dragSuppressed` flag on the card after a pan begins on that card and clears that flag only when a later click handler consumes it. 

That implementation has two problems.

First, even a successful ordinary anchor activation navigates the current tab rather than opening the requested destination in a new tab.

Second, the current drag-suppression state can become sticky. If a drag finishes without the browser emitting the corresponding click, `data-drag-suppressed="true"` remains on the anchor. A later legitimate click can then be incorrectly prevented. This is a plausible explanation for the observed "link cursor appears, but clicking the tile does nothing" defect and should be explicitly verified during implementation. 

### Required behavior

A normal journal-card activation MUST open the original target in a new browsing tab.

The generated card anchor should therefore behave equivalently to:

```html
<a
  href="https://target.example/..."
  target="_blank"
  rel="noopener noreferrer"
>
```

The entire card remains the clickable area.

A drag used for panning MUST NOT open the destination.

A normal click after a previous drag MUST work immediately.

### Recommended fix for drag suppression

Do not keep persistent drag-suppression state on the card DOM element.

Prefer gesture-local state owned by the active pointer interaction.

Conceptually:

```text
gesture.didPan = false

pointer movement crosses threshold:
    gesture.didPan = true

click generated for that same completed gesture:
    if gesture.didPan:
        prevent this click once

clear gesture suppression immediately
```

If the browser does not emit a click following the drag, the suppression state must expire automatically and MUST NOT affect a future independent click.

A short-lived global or gesture-token mechanism is acceptable. A permanently stored card dataset flag is not.

### Validation scenario

Codex MUST test at least these sequences:

```text
click card
-> one new tab opens

drag card to pan
-> no tab opens

click same card immediately after that drag
-> one new tab opens

drag on paper
-> journal pans
-> no tab opens

click another card
-> one new tab opens
```

The same behavior must be checked after the document has been browser-zoomed.

Mobile tap must continue to activate the entry normally. Mobile page-swipe detection must not accidentally open a card.

## F-00. Add description to journal cards

Generated link records already contain a normal description and `og:description`, and current records demonstrate useful descriptive text that is not presently shown in journal cards.  The current card renderer appends only preview, title, hostname, and date. 

The description should now become part of the normal tile.

The information hierarchy becomes:

```text
preview
title
description
source hostname
date added
```

The description exists to give the user one additional memory cue when a screenshot and title alone do not explain the destination.

It must remain secondary to the title.

### Card description presentation

The description should use smaller, quieter typography than the title.

It should display no more than two visual lines in the normal card.

Use CSS line clamping or the equivalent presentation behavior so overflow ends visually with an ellipsis.

Conceptually:

```css
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
```

A standards-compatible equivalent may be used where available.

The exact implementation should be selected according to browser support in the project's target environment.

The ellipsis is a presentation effect. It does not need to become part of the stored description string.

The existing six-entry page geometry MUST remain intact.

Adding descriptions MUST NOT cause:

```text
rows to become irregular
cards to overlap
the final row to leave the page
preview images to become unrecognizably small
titles to become unreadable
source/date metadata to disappear
```

Codex should adjust card spacing and typography carefully rather than casually increasing page height.

### Empty description

If a record contains the established `(no description)` placeholder, Codex should use best visual judgment. The preferred behavior is to omit the description line from that card rather than spend two lines displaying a placeholder that provides no user value.

The underlying record remains unchanged.

### Accessibility

The description is supplementary content. The card's primary accessible name should remain based on the title. Do not create excessively verbose accessible link labels by automatically concatenating every metadata field.

## G-00. Increase stored metadata limits

Earlier BRAVO behavior limits sanitized title and description values to 160 and 320 characters respectively and explicitly omits ellipsis from stored metadata.  This incremental change replaces those limits.

The new hard limits are:

```text
title:       1000 Unicode code points
description: 1000 Unicode code points
```

The limits apply after sanitization.

All existing ALPHA sanitization rules remain in effect.

The stored strings still must:

```text
use only permitted scripts and punctuation
replace disallowed characters as previously specified
collapse whitespace
remain HTML-escaped correctly
avoid splitting Unicode code points
```

The purpose of the 1000-character hard limit is defensive. It prevents pathological remote metadata from becoming arbitrarily large while allowing the journal and social metadata to retain substantially more source information.

The normal journal does not display all 1000 characters. Visual limits belong to CSS.

For journal presentation:

```text
title       -> existing visually bounded title area
description -> maximum two lines with visual ellipsis
```

The metadata record therefore keeps useful source information while the journal remains compact.

No Unicode ellipsis needs to be appended to generated metadata merely because the journal visually truncates it.

### Metadata source priority

The existing deterministic preference for `og:title` and `og:description` remains appropriate. The current capture implementation already checks Open Graph values before document-title or visible-text fallbacks. 

HOTEL does not require AI summarization or rewriting.

## H-00. Site-specific capture adapters

Generic DOM capture works well for many ordinary articles, documentation pages, and websites, but it is not reasonable to assume one page-region heuristic will produce a good preview for every major web application.

YouTube demonstrates the problem. The target page can load successfully while generic candidate selection still finds no region that satisfies the normal screenshot requirements. The actual observed command terminates after 87 candidate inspections with `CAPTURE_NO_VALID_REGION`. 

The correct solution is not to weaken CHARLIE's general validity rules until arbitrary YouTube DOM happens to pass.

Instead, the capture pipeline should gain a deliberately small extension mechanism for well-known websites whose representative content can be obtained through a deterministic site-specific rule.

This mechanism should be called a site-specific capture adapter, handler, or similarly explicit name. "Plugin" is acceptable conceptually, but the project does not need runtime plugin discovery or a generalized external extension system.

### Architecture

The capture pipeline should have one centralized hostname registry.

Conceptually:

```text
hostname
    |
    v
site adapter registry
    |
    +-- exact match found -> site-specific capture attempt
    |
    +-- no match ----------> normal CHARLIE capture
```

A simple `Map` or plain object is sufficient.

For example:

```text
youtube.com     -> youtubeAdapter
www.youtube.com -> youtubeAdapter
m.youtube.com   -> youtubeAdapter
youtu.be        -> youtubeAdapter
```

Exact hostnames are preferred.

Do not build a general-purpose regular-expression routing system when explicit hostname aliases solve the actual requirement.

Hostname matching should be:

```text
case-insensitive through URL hostname normalization
port independent
path independent
```

A hostname that merely contains the text `youtube.com` must not match.

For example:

```text
youtube.com.evil.example
```

must not invoke the YouTube adapter.

### Adapter interface

The adapter contract should remain narrow.

Conceptually, an adapter receives enough context to inspect the already opened page and target URL:

```text
target URL
Playwright Page
capture output requirements
logger / operation context
```

It may return:

```text
preview strategy/result
optional metadata candidates
diagnostic context
```

The generic authoring workflow remains responsible for:

```text
sanitization
final JPEG dimensions
JPEG validation
generated HTML
repository transaction
manifest update
```

A site adapter must not duplicate those concerns.

The adapter changes content extraction, not the repository model.

### Adapter selection should be observable

DEBUG output should identify:

```text
target hostname
matched adapter, if any
adapter strategy selected
adapter success or failure
whether generic fallback was attempted
```

Example:

```text
[DEBUG] [capture] Site-specific capture adapter selected

Hostname:
  www.youtube.com

Adapter:
  youtube

Strategy:
  video thumbnail
```

This is required so a developer can understand why the normal candidate algorithm was bypassed.

## I-00. YouTube capture adapter

The first required adapter is YouTube.

It must support the normal URL forms required for the user's use case, including at least:

```text
https://www.youtube.com/watch?v=<video-id>
https://youtube.com/watch?v=<video-id>
https://m.youtube.com/watch?v=<video-id>
https://youtu.be/<video-id>
```

Additional official YouTube host forms may be supported if they can be handled without complicating the adapter.

### Objective

For a YouTube video, the useful visual memory is the video's own thumbnail.

The adapter should therefore produce the preview from the video's thumbnail rather than trying to choose an arbitrary rectangular area from the complete YouTube application UI.

The resulting `preview.jpg` remains exactly:

```text
1200 x 630
JPEG
approximately 90% quality
```

as defined by the existing project contract.

### Thumbnail discovery

The adapter should use a deterministic source.

Codex should inspect the actual rendered YouTube page and choose the simplest robust mechanism.

Acceptable approaches include:

1. obtaining the representative thumbnail URL from structured metadata already available in the rendered document;
2. determining the video ID and using an official/static YouTube thumbnail URL pattern;
3. querying the rendered page for the thumbnail resource that YouTube itself exposes.

The implementation should not add a remote AI service, unofficial scraping API dependency, or third-party proxy.

The adapter SHOULD prefer an image belonging to YouTube's own delivery infrastructure.

If multiple thumbnail resolutions are available, prefer the highest usable resolution that can produce a clean 1200 x 630 result without excessive enlargement.

### Thumbnail transformation

A video thumbnail will often have a different aspect ratio from 1200 x 630.

Do not distort it.

Use a centered cover crop or another deterministic focal crop.

Conceptually:

```text
source thumbnail
        |
        v
scale preserving aspect ratio
        |
        v
center crop to 1200 x 630
        |
        v
encode JPEG at project quality
```

If the source image is smaller than the required output, Codex must inspect actual YouTube thumbnail sizes and choose the highest available source before deciding whether modest enlargement is acceptable.

Do not stretch the image independently in X and Y.

### Metadata

The general metadata extraction pipeline may continue to obtain title and description from the normal deterministic page metadata.

The YouTube adapter does not need to invent a title or description.

The specific requirement introduced here concerns reliable preview extraction.

If implementation work reveals that the adapter can obtain more reliable title/description values from the same structured source with very little additional complexity, it may provide those candidates to the shared metadata pipeline. They must still pass through the shared sanitizer and new 1000-character hard limits.

### Failure behavior

If the exact hostname matches a site adapter but the adapter cannot obtain a valid site-specific preview, the system SHOULD make one bounded attempt using the generic CHARLIE capture pipeline unless doing so is demonstrably pointless or would violate a site-specific invariant.

If both strategies fail, the final error should explain both facts in diagnostic output:

```text
site adapter:
  youtube

adapter result:
  no usable thumbnail

generic fallback:
  no valid page region

error code:
  CAPTURE_NO_VALID_REGION
```

The user-facing error remains concise.

### Required YouTube validation

The exact reported URL:

```text
https://www.youtube.com/watch?v=un_O5WrZDNc
```

is a required acceptance fixture.

The command:

```text
npm run add-link https://www.youtube.com/watch?v=un_O5WrZDNc
```

must successfully produce a valid record unless the video itself has become unavailable or access-restricted at validation time.

Validation must confirm:

```text
record created
manifest updated
preview.jpg is valid JPEG
preview is 1200 x 630
preview clearly represents the video
preview is not a generic YouTube application screenshot
generated short URL works
journal displays the entry correctly
```

Codex must visually inspect the resulting preview.

## J-00. Future site adapters

The adapter registry exists because several popular sites may eventually need narrow deterministic handling.

HOTEL does not require implementing adapters for an arbitrary list of websites now.

Do not create speculative empty modules for dozens of sites.

The extension mechanism is successful if adding the next supported hostname requires approximately:

```text
create one adapter module
register one or more exact hostnames
implement one deterministic extraction strategy
add focused tests
```

No modifications to repository generation, manifest logic, journal parsing, or generic capture selection should be necessary.

This is extensibility serving a demonstrated problem, not an invitation to build a generic crawling framework.

## K-00. Visible page-turn controls

The journal already supports keyboard page navigation, and the existing page-turn animation should remain.

However, page navigation must also be visible and directly operable with a mouse or touch input.

Add one navigation affordance on each horizontal side of the journal.

Conceptually:

```text
            journal spread

    <                             >
previous                       next
```

The controls should sit near the vertical middle of the journal, with a restrained margin between the control and the physical leather edge.

They should appear spatially associated with the book rather than with the browser viewport.

### Visual form

The control should use an elegant directional triangular or chevron-like form.

The exact shape is a visual-design decision.

It should feel compatible with:

```text
dark leather
warm paper
subtle brass/gold details
restrained physical lighting
```

It must not resemble:

```text
a large Bootstrap button
a floating mobile FAB
a bright blue browser control
a cartoon arrow
```

The control is static except for ordinary hover/focus feedback.

The user's "glow" requirement should be interpreted as a restrained visual indication of availability, not an animated neon effect.

### Enabled state

When navigation in that direction is possible, the control should appear active.

For example:

```text
warm highlight
slightly brighter edge
restrained brass/gold tone
subtle static glow or shadow
```

A hover state may strengthen the indication slightly.

### Disabled state

When navigation in that direction is impossible, the same control remains visible but is visually off.

For example:

```text
lower contrast
muted gray/brown tone
no highlight
no glow
```

It must not activate page navigation.

Keeping the disabled control visible communicates that navigation exists while also showing that the reader has reached the boundary.

### State examples

At the beginning of the archive:

```text
previous: disabled
next:     enabled, if older pages exist
```

In the middle:

```text
previous: enabled
next:     enabled
```

At the end:

```text
previous: enabled, if newer pages exist
next:     disabled
```

If only one logical page exists:

```text
previous: disabled
next:     disabled
```

## L-00. Page-turn control behavior

Clicking the right control performs the exact same logical navigation as the existing forward keyboard action.

Clicking the left control performs the exact same logical navigation as the existing backward keyboard action.

There MUST NOT be separate pagination implementations for keyboard and pointer controls.

Conceptually:

```text
ArrowRight
right control click
mobile forward control/tap

        -> same turn(+1) operation
```

and:

```text
ArrowLeft
left control click
mobile backward control/tap

        -> same turn(-1) operation
```

The existing animation remains the visual result.

The controls must respect the current transition lock. Repeated clicking during an active page turn must not corrupt pagination.

Disabled controls should use real semantic disabled state when implemented as `<button>` elements.

They must be keyboard reachable when enabled.

They need appropriate accessible labels such as:

```text
Previous pages
Next pages
```

Do not rely on the triangle shape alone for accessibility.

## M-00. Relationship between pan and navigation controls

The side controls must be excluded from pan initiation.

A pointer press on a navigation control belongs to the navigation control.

It must not:

```text
begin panning
select text
open a journal entry
```

The current panning implementation already excludes page-edge buttons from pointer tracking.  The updated control design should retain this clean event ownership.

Controls should have enough spacing from the book that accidental clicks are unlikely, but they should remain visually associated with the journal.

Panning the journal must not leave the navigation controls in nonsensical positions. Codex should decide whether the controls belong to the journal scene or to a stable overlay aligned to the journal's current bounds. The result must be visually inspected after panning and browser zoom.

The user should always understand which journal direction the control refers to.

## N-00. Mobile navigation controls

The same navigation concept must remain available on mobile, but desktop-sized side ornaments are inappropriate on a narrow screen.

On constrained/mobile presentation:

```text
controls become smaller
touch target remains practical
visual triangle/chevron remains recognizable
controls do not cover entry cards
```

Possible placements include:

```text
small controls centered on the left/right outside page edge
controls partially embedded into safe leather margin
another equivalent position discovered through visual testing
```

Codex should choose the placement through actual screenshots and touch testing.

The controls MUST NOT reduce the width of the page enough to make the two-column entry grid materially less readable.

The controls supplement the existing touch page gesture. They do not replace ordinary vertical scrolling.

## O-00. Visual quality requirements for the new controls

The page controls are a visual addition to an already established composition, so they require the same ECHO/GOLF visual QA discipline as the journal itself.

Codex must inspect:

```text
wide desktop
constrained desktop
single-page/mobile
first page
middle page
last page
hover
focus
disabled state
during page turn
after browser zoom
after pan
```

The controls should look intentional at all states.

They must not visually dominate the screenshots or journal title.

Their size, distance from the leather, highlight intensity, and vertical position should be adjusted through screenshot comparison rather than selected once and assumed correct.

The controls should read as part of the journal experience within a moment of looking at the page.

## P-00. Interaction ownership

The interaction system must explicitly assign each gesture to one behavior.

This is important because several of the observed bugs are symptoms of overlapping event ownership.

The required ownership model is:

| Interaction                                | Owner               |
| ------------------------------------------ | ------------------- |
| Normal wheel                               | Browser/page scroll |
| Modified browser zoom gesture              | Browser             |
| Click on journal entry                     | Entry link          |
| Drag beyond pan threshold                  | Pan controller      |
| Click on previous/next control             | Page navigation     |
| Keyboard left/right                        | Page navigation     |
| Mobile vertical drag                       | Scroll              |
| Mobile intentional horizontal page gesture | Page navigation     |
| Mobile tap on entry                        | Entry link          |

One interaction must not accidentally activate another.

In particular:

```text
pan must not select text
pan must not open a link
link click must not pan
page-control click must not pan
ordinary wheel must not turn page
browser zoom must not mutate application zoom state
```

Codex should treat these as explicit interaction invariants.

## Q-00. Diagnostics

All new behavior remains subject to FOXTROT.

Site-adapter selection and fallback should have DEBUG diagnostics.

Adapter failure should retain the normal capture operation ID and stage information.

Normal card clicks, panning, and page-control use do not need routine console logging.

Unexpected interaction errors may log useful state such as:

```text
current page
presentation mode
gesture type
transition state
```

but must not create noisy logs for successful input.

A capture-adapter failure should be diagnosable without adding temporary logging after the failure occurs.

For example:

```text
[ERROR] [capture] Site-specific preview extraction failed

Operation:
  add-CuWhMQ

Stage:
  site-specific preview

Hostname:
  www.youtube.com

Adapter:
  youtube

Target:
  https://www.youtube.com/watch?v=un_O5WrZDNc

Adapter result:
  No usable thumbnail was found.

Generic fallback:
  No page region satisfied the minimum content requirements.

Error code:
  CAPTURE_NO_VALID_REGION
```

Equivalent failure paths introduced by future adapters must follow the same diagnostic standard.

## R-00. Validation requirements

Codex MUST validate this change request as a complete interaction and authoring regression, not as isolated source edits.

The current specification set explicitly requires exploratory review because changes to zoom transforms can affect pointer hit testing and changes to generated metadata can affect journal parsing and presentation. 

The minimum validation set for HOTEL is:

### Browser-native zoom

```text
open journal
use Ctrl + wheel
verify browser zoom occurs
verify no application camera zoom handler runs
verify no Ctrl-wheel hint remains
verify page remains scrollable
verify pan remains usable
verify link click remains usable
```

### Pan without selection

```text
drag from paper
drag across title
drag across description
drag across hostname
drag from preview
repeat after browser zoom
```

No accidental selection should remain after any case.

### Entry activation

```text
click entry -> opens exactly one new tab
pan starting on entry -> opens no tab
click same entry immediately afterward -> opens exactly one new tab
```

### Description layout

Test cards containing:

```text
short description
long description
1000-character description
(no description)
one-line title
long title
dark preview
light preview
```

Inspect both pages of a desktop spread and a mobile page.

### YouTube

Run the exact failed URL reported above and inspect the generated preview.

The successful result must then be exercised through the journal and short-link workflow.

### Page controls

Test:

```text
first page
middle page
last page
single-page archive
keyboard navigation
mouse navigation
rapid repeated clicks
mobile controls
mobile swipe
reduced motion
```

Take screenshots of enabled and disabled states.

### Regression

After all focused tests pass, run the complete normal workflow:

```text
add URL
-> inspect generated record
-> inspect preview
-> inspect manifest
-> serve journal
-> locate new entry
-> inspect description
-> click card
-> verify new tab
-> navigate pages with side control
-> navigate pages with keyboard
-> pan journal
-> browser zoom
-> repeat click
```

## S-00. Acceptance criteria

HOTEL is complete only when all of the following are true.

### Zoom and scrolling

* [ ] The application no longer implements its own `Ctrl + wheel` or `Cmd + wheel` zoom.
* [ ] The obsolete zoom hint has been removed.
* [ ] Browser-native zoom remains usable.
* [ ] Ordinary wheel and trackpad scrolling remain browser-native scrolling behavior.
* [ ] No obsolete application camera-zoom test or unreachable zoom code remains unless another active requirement still needs it.

### Panning

* [ ] Panning works with the primary mouse button.
* [ ] Text does not become selected while the user pans.
* [ ] Preview images do not enter native image-drag behavior.
* [ ] Temporary selection suppression is cleaned up after pointer completion or cancellation.
* [ ] Normal click/focus behavior remains available when no pan occurs.

### Journal link activation

* [ ] The entire normal card remains a link target.
* [ ] A normal card activation opens the original target in a new tab.
* [ ] The link uses `noopener noreferrer`.
* [ ] A pan beginning over a card does not open the link.
* [ ] A legitimate click immediately following a previous pan works.
* [ ] No persistent stale drag-suppression flag can block a later independent click.

### Metadata and descriptions

* [ ] Journal cards display the description between title and source metadata.
* [ ] Description presentation uses no more than two lines.
* [ ] Visual overflow uses an ellipsis/clamp treatment.
* [ ] The description does not destabilize the six-entry page grid.
* [ ] `(no description)` does not waste normal card space.
* [ ] Stored sanitized titles support up to 1000 Unicode code points.
* [ ] Stored sanitized descriptions support up to 1000 Unicode code points.
* [ ] Existing sanitization and escaping rules remain intact.
* [ ] Stored strings do not require an appended Unicode ellipsis.

### Site-specific capture

* [ ] One centralized exact-hostname adapter registry exists.
* [ ] Unknown hostnames continue through generic CHARLIE capture.
* [ ] The YouTube hostname aliases required by HOTEL map to one YouTube adapter.
* [ ] Hostname matching cannot be spoofed by suffix-containing unrelated domains.
* [ ] The YouTube adapter produces previews from representative video-thumbnail imagery.
* [ ] Thumbnail output preserves aspect ratio and is not stretched.
* [ ] Final output remains exactly 1200 x 630 JPEG at project quality.
* [ ] Adapter output passes the normal JPEG validation path.
* [ ] Adapter choice and fallback behavior are diagnosable.
* [ ] Generic capture remains available as bounded fallback where appropriate.
* [ ] Adding another future supported hostname does not require rewriting the general capture architecture.
* [ ] `https://www.youtube.com/watch?v=un_O5WrZDNc` has been exercised as an acceptance case and succeeds if the video remains publicly available.

### Page controls

* [ ] Previous and next controls exist near the horizontal sides of the journal.
* [ ] Their visual language fits the established leather-journal design.
* [ ] Enabled state is visibly brighter than disabled state.
* [ ] Disabled controls remain visible but inactive.
* [ ] No continuous or distracting glow animation exists.
* [ ] First-page previous state is disabled.
* [ ] Last-page next state is disabled.
* [ ] Middle pages expose both directions.
* [ ] Clicking a control uses the existing page-turn mechanism.
* [ ] Keyboard and mouse navigation produce identical logical page changes.
* [ ] Controls cannot trigger panning.
* [ ] Repeated control clicks during page animation cannot corrupt page state.
* [ ] Mobile controls are appropriately smaller without reducing practical touch area.
* [ ] Mobile controls do not cover journal entry content.
* [ ] Controls have accessible names and keyboard focus behavior.

### Visual validation

* [ ] Desktop screenshots were captured after the changes.
* [ ] Mobile screenshots were captured after the changes.
* [ ] Descriptions were inspected with real content.
* [ ] Side controls were inspected in enabled and disabled states.
* [ ] Pan behavior was tested while dragging across actual text.
* [ ] Browser zoom was tested at several browser zoom values.
* [ ] Layout around the primary changed feature was also inspected for regressions.
* [ ] The YouTube preview was visually inspected.
* [ ] No known interaction defect remains merely because automated tests pass.

## T-00. Implementation note for Codex

Codex should first reproduce the reported bugs against the current implementation before modifying them. In particular, reproduce the text-selection problem and the card-click failure so the fix can be validated against the actual cause rather than only against an assumption.

The existing source strongly suggests two concrete causes worth investigating: selection suppression is enabled only after the drag threshold is crossed, and drag suppression is stored on the card until a future click clears it.   These are suggested diagnoses, not permission to skip reproduction.

Codex should favor removing complexity where HOTEL makes it unnecessary. The custom application zoom path is such a case.

The site-adapter work is the opposite case: it adds a small amount of explicit structure because an actual important target demonstrates that the generic algorithm is insufficient. Keep that structure narrow and evidence-driven.

After implementation, use the validation requirements in this document together with the existing GOLF quality directives. Do not consider this change request complete until the visible product, interaction behavior, generated artifacts, YouTube authoring workflow, and surrounding journal behavior have all been exercised and inspected.


