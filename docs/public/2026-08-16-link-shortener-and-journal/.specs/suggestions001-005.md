2026-08-16

# 2026-08-16.ECHO.A-01

## A-00. Journal Presentation and Interaction

This specification defines how the saved-link archive is presented and manipulated as a physical journal. It covers the visual composition, journal materials, link-entry layout, desktop and mobile presentation, pagination, page turning, scrolling, panning, zooming, loading and failure states, accessibility, performance, and the visual-verification process required during implementation.

The feature exists to make a collection of saved links pleasant and immediately recognizable. The journal metaphor is not decoration added around a conventional bookmark grid. It is the primary interface. The user should feel that they are looking through a physical book of web clippings, while still receiving the practical advantages of a responsive web application.

The implementation audience is Codex, but the specification is intentionally written as human-readable technical prose. Wherever visual interpretation could lead to materially different implementations, this document states the expected behavior explicitly.

The supplied mobile and desktop mockup images are part of the design context and MUST be inspected during implementation. They establish the intended visual language, proportions, density, and atmosphere. They are sketches, not pixel-perfect contracts. Image-generation artifacts visible in them MUST NOT be copied merely because they appear in a reference.

The final implementation must be more usable and more internally consistent than the sketches.

## B-01. Design intent and interpretation of the reference images

The reference images establish a coherent visual hierarchy.

At the outermost level is a dark environment. Inside it sits a dark brown leather journal. Inside the leather are warm cream pages. Inside the pages are colorful website previews and dark readable typography.

The hierarchy can be summarized as:

```text
dark wooden environment
    -> dark brown leather journal
        -> warm cream paper
            -> colorful saved-page previews
            -> dark textual metadata
```

This nesting is fundamental to the design. The surroundings create depth, the leather establishes the physical object, the paper creates a quiet reading surface, and the screenshots provide the visual memory of the saved links.

A representative desktop reference demonstrates the intended composition particularly well. The journal is centered in a landscape viewport and viewed almost directly from above. Two identically sized portrait pages form one coherent open spread. A narrow shaded gutter marks the binding without consuming much space. Each page contains six records arranged as two columns by three rows. The screenshot is visually dominant within each record; the title follows immediately underneath, then the source hostname and date. Page margins, card gaps, and typography are regular enough to feel typeset, but the paper and leather prevent the result from feeling like a modern dashboard.

The mobile references show the same object from a closer camera position. The application does not become a different card-list design. One journal page occupies most of the viewport, while leather remains visible around the paper and a dark surrounding environment remains visible near the edges. The six-entry, two-column page composition remains recognizable.

The references also contain elements that MUST NOT be implemented. The generated mockups include large explanatory plaques below the journal and artificial mobile status bars. Those are annotations used to explain the mockups, not application UI. Some sketches also contain unnatural curled paper and geometrically impossible stacks of turning pages. Those are generation defects, not desired behavior.

The final implementation therefore adopts the references selectively:

| Reference characteristic                    | Final implementation                 |
| ------------------------------------------- | ------------------------------------ |
| Dark brown leather journal                  | Keep                                 |
| Warm cream, mildly aged paper               | Keep                                 |
| Two-column, three-row page                  | Keep                                 |
| Screenshot, title, host, date               | Keep                                 |
| Dark wooden environment                     | Keep, mainly visible when zoomed out |
| Sparse pen or similar desk prop             | Allowed                              |
| Small interaction hint in unused desk space | Add                                  |
| Large annotation plaque below journal       | Remove                               |
| Simulated phone time, Wi-Fi, battery        | Remove                               |
| Large permanent curled corners              | Remove                               |
| Multiple floating/folding sheets            | Remove                               |
| Excessive environment at default zoom       | Reduce                               |
| Content-first closer framing                | Strengthen                           |

The interaction hint is an explicit exception to the general rule against application chrome. It is a single small instructional element intended to make the image-like navigation model discoverable. It must remain visually subordinate to the journal and must not become a toolbar, legend, or permanent panel.

The mockups are therefore an art-direction reference. The implementation must preserve their character while prioritizing actual link content.

## C-00. Journal composition and content hierarchy

The journal opens directly to saved links. There is no mandatory closed-cover screen, welcome page, or blank introductory leaf.

On a desktop viewport wide enough to show two readable pages, the initial state is the first open spread:

```text
left:  Page 1
right: Page 2
```

This exposes the twelve newest links immediately.

On a constrained or mobile viewport, the initial state is a single Page 1 containing the six newest links.

DELTA defines six entries per logical page, and this number remains fixed in the presentation layer. A full page uses a 2 x 3 grid:

```text
+----------------------+----------------------+
| Entry 1              | Entry 2              |
|                      |                      |
+----------------------+----------------------+
| Entry 3              | Entry 4              |
|                      |                      |
+----------------------+----------------------+
| Entry 5              | Entry 6              |
|                      |                      |
+----------------------+----------------------+
```

Desktop shows two such pages side by side. Mobile shows one.

The page itself is a portrait sheet with a consistent aspect ratio. Exact dimensions are implementation constants rather than hard-coded scattered values, but both desktop pages MUST use identical geometry. Page padding, grid gaps, preview dimensions, title blocks, and metadata baselines should likewise come from a small centralized set of design constants.

Each page may contain a restrained header consisting of:

```text
LINK JOURNAL
Page N
```

with a quiet rule or small ornament. The header is structural rather than promotional. It should consume only the space needed to orient the reader.

The record itself has a strict information hierarchy:

```text
preview screenshot
title
source hostname
date added
```

The description stored in the record is not shown in the normal journal grid. It would compete with the preview and reduce visual density. The journal should favor visual recognition over displaying every available metadata field.

The screenshot is the dominant element and should occupy approximately the upper half of the record. It preserves the 1200 x 630 preview aspect ratio generated by CHARLIE and MUST NOT be stretched. Small clipping is acceptable only when needed to maintain consistent card geometry.

The title uses a readable editorial serif and normally supports two or three lines. Cards use a fixed title area so that one long title cannot push lower rows out of alignment. Longer titles are visually clamped; their stored metadata is unchanged.

The hostname and date are quieter supporting information. A small globe-like source icon is acceptable, but it must remain subordinate to the text.

For example:

```text
+--------------------------------+
|                                |
|      generated preview         |
|                                |
+--------------------------------+
  Building Better Static Tools
  ◉ example.com
  Added May 16, 2026
```

The complete visible record acts as the link target. The user should not have to click a tiny title. No `Open`, `Share`, `More`, `Delete`, or equivalent action buttons belong on normal records.

The final page may contain fewer than six records. Existing records keep their normal grid geometry and occupy the earliest available slots. Empty positions remain paper. The remaining records do not expand to fill the empty area.

## D-01. Physical materials, surrounding environment, and interaction hint

The journal should read visually as one physical object rather than several CSS rectangles.

The cover is deep brown leather with visible but restrained grain, rounded outside corners, stitched or embossed perimeter detail, and slightly brighter raised edges. It should look used and well maintained, not glossy, plastic, heavily scratched, or theatrically antique.

The cover requires visible thickness. A small outer offset, directional shadow, inner edge highlight, and darker leather-to-paper boundary are enough. The implementation should prefer CSS gradients, shadows, and small reusable textures over a large prerendered book image.

The paper is warm cream rather than white. Mild aging may appear through subtle paper grain, slightly darker outer edges, and small tonal variation. The center reading area must remain clean. Aging is a material cue and must never reduce text contrast.

The desktop spread has a visible central gutter. Its purpose is to communicate binding and depth, not to divide the UI into two unrelated panels. The page surfaces should curve inward only slightly toward the gutter, with a narrow shadow suggesting depth. Both pages remain visually part of the same book.

Several physical pages may be suggested underneath the active page through one or two small offset edges. Do not simulate a large stack of individually visible sheets.

The screenshot previews receive their own light aging treatment. This is deliberately different from recoloring the whole image. The center of every preview should retain the original screenshot color and clarity. Only the perimeter may receive a subtle worn-paper effect such as slight irregularity, minor fading, or very light warm discoloration.

The desired result is approximately:

```text
clean screenshot center
        |
        |
small 2-8 px visual transition near boundary
        |
faint physical wear
```

The preview must NOT be sepia-toned, heavily scratched, blurred, torn, burned, stained, or obscured.

At the default camera position the journal content dominates the viewport. The surrounding environment is intentionally understated. The application should show enough leather and darkness around the pages to preserve the physical metaphor, but it should not waste substantial viewport area displaying a decorative desk.

Zooming out reveals the richer environment. The journal sits on a dark wooden desk, preferably dark walnut or a similarly warm low-contrast material. The wood grain is visible but quiet. One restrained prop such as a dark pen may appear near an outside edge. Props MUST NOT overlap content and MUST NOT become controls.

This distinction between camera positions is important:

```text
100% default zoom
-> pages and link content dominate

zoomed out
-> entire leather journal becomes visible
-> more cast shadow becomes visible
-> surrounding wooden desk becomes visible
-> sparse desk prop may become visible
```

The environment therefore rewards exploration without imposing itself on normal reading.

One small interaction hint MUST appear in otherwise unused environment space near the top of the scene when sufficient surrounding desk space exists. Its purpose is to explain the non-obvious desktop camera interaction.

The preferred text is:

```text
Ctrl + wheel to zoom
```

The wording may be adapted on macOS to communicate the corresponding Command modifier if the implementation reliably detects that environment, but the normal documented interaction remains Ctrl + mouse wheel.

The hint must be visually small, quiet, and secondary. It should resemble a restrained annotation printed or engraved into the surrounding scene rather than a toolbar notification. It must not overlap the journal, page contents, navigation regions, or desk props.

The hint does not need to describe every interaction. It exists specifically to reveal zoom behavior. Regular wheel scrolling and click-drag panning should remain natural enough not to require persistent explanatory text.

If the viewport is too small to provide genuine unused desk space without competing with content, the hint may be omitted. Content visibility takes precedence.

No bottom caption, large annotation plaque, toolbar, fake phone status bar, decorative product header, footer, sidebar, or other application chrome is added around the book.

## E-00. Page navigation and physical page turning

Chronology runs from newest to oldest as the reader moves deeper into the journal.

Desktop navigation moves by spread:

| Current desktop spread | Next      | Previous  |
| ---------------------- | --------- | --------- |
| Pages 1-2              | Pages 3-4 | none      |
| Pages 3-4              | Pages 5-6 | Pages 1-2 |
| Pages 5-6              | Pages 7-8 | Pages 3-4 |

Mobile navigation moves one logical page at a time:

```text
1 -> 2 -> 3 -> 4 -> ...
```

Moving toward larger page numbers means moving toward older links.

Page turning must communicate this spatial relationship rather than acting as decorative animation.

The final animation must be substantially simpler than the distorted page bends visible in some mockups.

On desktop, a forward page turn behaves conceptually as follows:

```text
1. Current spread is resting flat.

2. The right-hand sheet begins rotating around the center binding.

3. The sheet remains mostly planar.
   A small perspective deformation or modest outer-corner curl is allowed.

4. A soft moving shadow separates the sheet from the page beneath it.

5. The back of the turning sheet is briefly visible.

6. The next spread is revealed.

7. The turning sheet settles into the new resting geometry.
```

The resting left page does not fold. Pages beneath the turning sheet remain fixed. The turning sheet stays attached to the binding throughout the transition.

Backward navigation mirrors this behavior from the opposite direction.

The animation MUST NOT produce:

```text
two pages curling together
multiple floating sheets
detached triangular paper shapes
large permanent outer-edge curls
paper intersecting the leather
different parts of the same sheet moving independently
```

A normal page turn should take approximately 350-550 ms. The final value should be tuned visually. The transition should feel like a page but remain fast enough for repeated browsing.

CSS perspective, transforms, transform origin, opacity, and shadows are the preferred implementation tools. A full paper-physics simulation, WebGL scene, canvas rendering engine, or page-flip framework is not justified unless straightforward browser primitives prove insufficient.

While a page transition is active, another transition MUST NOT corrupt pagination state. The simplest acceptable behavior is to ignore additional page-turn commands until the current transition completes.

Navigation can be initiated by keyboard, a restrained page-edge affordance, or an intentional horizontal touch gesture. Large permanent navigation buttons are unnecessary. Page-edge interaction areas must live outside link-card click targets.

The user should never accidentally open a link when trying to turn the page, and should never turn a page when activating a record.

When `prefers-reduced-motion: reduce` is active, the page turn becomes a brief crossfade or immediate state replacement.

## F-01. Camera model: scrolling, panning, and zooming

The journal is treated as a large physical scene viewed through a camera. This interaction model allows the application to preserve readable content instead of solving every viewport constraint by shrinking the journal.

Three interactions have distinct responsibilities:

| Input                                   | Behavior                      |
| --------------------------------------- | ----------------------------- |
| Mouse wheel                             | Scroll vertically             |
| Ctrl + mouse wheel                      | Zoom journal camera in or out |
| Hold left mouse button and drag         | Pan journal camera            |
| Trackpad vertical scroll                | Scroll vertically             |
| Trackpad pinch / supported zoom gesture | Zoom                          |
| Mobile vertical drag                    | Scroll vertically             |
| Mobile pinch                            | Zoom                          |
| Mobile deliberate horizontal swipe      | Turn journal page             |

These responsibilities MUST remain separate. A normal mouse-wheel action does not turn pages and does not zoom. Ctrl + wheel is the explicit desktop zoom gesture.

### Default camera scale

The default application camera scale is:

```text
100%
```

This is an application-level journal scale, not the browser's own page zoom.

At 100%, the camera is intentionally content-focused. On desktop, both pages should normally be readable without immediate user adjustment. On mobile, one page should occupy most of the available width even when its complete height extends beyond the viewport.

The initial implementation should support approximately:

```text
minimum zoom: 70%
default zoom: 100%
maximum zoom: 140%
```

These bounds may be tuned during visual testing if they fail the acceptance scenarios, but zoom MUST remain bounded.

### Minimum readable scene size

The application must define a minimum readable journal size rather than continuously shrinking the journal to fit every possible viewport.

The exact pixel threshold is a visual implementation constant and MUST be established through testing at the supported typography and page geometry. It should represent the smallest rendered journal size at which preview content, entry titles, hostnames, and dates remain practically readable.

When fitting the complete journal or spread into the viewport would require scaling below this minimum readable size, the application MUST stop shrinking the journal.

Instead, overflow becomes scrollable.

Conceptually:

```text
requested fit scale >= minimum readable scale
-> journal may fit viewport

requested fit scale < minimum readable scale
-> clamp at minimum readable scale
-> allow viewport overflow
-> user reaches hidden content through scrolling and panning
```

This rule is central to the content-first design.

The application must never solve an undersized window by reducing the journal until its content becomes decorative and unreadable.

### Mouse-wheel scrolling

A regular mouse-wheel action scrolls vertically through the current scene.

For example, when the lower row of a page extends below the viewport:

```text
wheel down
-> viewport moves downward
-> lower journal content becomes visible
```

The same input MUST NOT:

```text
change page
change spread
change zoom
```

When the complete scene fits vertically, normal wheel input may have no visible effect because there is nothing to scroll.

Trackpad vertical scrolling follows the same rule.

### Ctrl + mouse-wheel zoom

Holding Ctrl while using the mouse wheel changes application zoom.

Conceptually:

```text
Ctrl + wheel up
-> zoom in

Ctrl + wheel down
-> zoom out
```

The implementation MUST prevent the same gesture from simultaneously performing ordinary scene scrolling.

Where browser behavior makes Ctrl + wheel normally trigger browser-level page zoom, the application should intercept the gesture only when it can do so reliably and without degrading accessibility. The intent is that the journal itself zooms rather than the entire browser interface.

On macOS, an equivalent Command-modified behavior may be supported where appropriate, but the implementation must remain consistent and discoverable.

Zooming out reveals more environment. Zooming in supports close inspection of previews and text.

The current focal region should remain approximately stable while zooming. If the pointer is over the journal, zoom should preferably occur around that pointer position. At minimum, changing zoom must not continually snap the scene back to its initial center.

### Desktop panning

Desktop pan uses primary-button drag:

```text
pointer down on movable area
        |
movement stays below threshold
        |
release
-> normal click behavior if target is interactive

pointer down
        |
movement exceeds threshold
        |
enter pan mode
        |
journal follows pointer
        |
release
-> retain new pan position
```

A threshold around 5-8 CSS pixels is sufficient to distinguish a click from a drag.

Panning should work when drag begins over desk space, non-interactive leather, paper margins, or another non-actionable portion of the scene.

If the pointer begins over a link entry and movement exceeds the threshold, the gesture becomes a pan and MUST suppress the link activation.

If movement remains below the threshold and the pointer is released over the entry, the entry opens normally.

Native image dragging must be disabled so preview images do not create browser ghost images while the user pans.

The cursor should communicate the interaction where appropriate:

```text
movable non-interactive area -> grab
active pan -> grabbing
link card -> pointer
```

### Pan boundaries

Pan position is bounded.

The user may move the scene enough to inspect content that extends outside the viewport and may expose additional desk around the journal, but the journal must not be draggable completely out of recoverable view.

Bounds must be recalculated when:

```text
viewport size changes
zoom changes
single-page/spread mode changes
```

### Mobile scrolling, panning, and zooming

The same capabilities must remain usable on mobile, but touch conventions take precedence.

Single-finger vertical movement scrolls the journal view.

Pinch changes the application zoom.

A deliberate horizontal swipe changes the logical journal page.

The implementation must distinguish horizontal page navigation from vertical reading movement so diagonal gestures do not unexpectedly turn pages.

Mobile should not require a desktop-style click-and-drag pan gesture. When the journal is zoomed such that content extends horizontally outside the viewport, touch movement may pan the enlarged scene naturally, but vertical reading must remain reliable.

The practical mobile model is:

```text
one finger vertical
-> scroll current journal page

pinch
-> zoom

zoomed content extends beyond viewport
-> touch movement can reveal overflow

clear horizontal swipe at navigation intent
-> turn journal page
```

The implementation MUST be tested on touch input, not only through desktop pointer emulation.

### Page changes and camera preservation

When changing logical pages, the application should normally preserve the current zoom.

On mobile, a new page begins at a useful top position so the user does not arrive on the next page at the previous page's bottom scroll position.

On desktop, pan may be partially normalized after page navigation so the newly selected spread remains visible, but the application should avoid unexpected complete camera resets.

Zoom persistence applies only within the active session. Reloading the application may return to the default 100% scale.

## G-01. Responsive behavior and interaction states

Responsive design changes how many logical pages are visible, not the nature of the journal.

The principal modes are:

| Mode                     | Visible logical pages | Entries visible in a full journal unit | Navigation increment |
| ------------------------ | --------------------: | -------------------------------------: | -------------------: |
| Wide desktop / landscape |                     2 |                                     12 |              2 pages |
| Constrained / mobile     |                     1 |                                      6 |               1 page |

The breakpoint should be selected from actual readability testing rather than by blindly adopting a conventional framework width. If two complete pages can fit while previews, titles, source lines, and dates remain readable, show a spread. Otherwise show one page.

A landscape tablet may therefore show two pages while a portrait tablet shows one.

The six-entry logical page remains fixed across responsive states.

The mobile page may be taller than the viewport. This is expected. Do not scale all six records until the entire page fits vertically.

The same minimum-readable-size rule defined in F-01 applies across responsive modes. When a window becomes too small to contain the journal at a readable scale, scrolling and overflow are the correct behavior. Continuous automatic shrinking below readable size is not.

Interactive states remain intentionally understated.

Normal entry states are:

| State             | Presentation                                       |
| ----------------- | -------------------------------------------------- |
| Resting           | Printed/clipped appearance on paper                |
| Hover             | Very small emphasis: slight tonal or border change |
| Keyboard focus    | Clearly visible focus treatment                    |
| Pressed           | Brief restrained feedback                          |
| Loading           | Stable placeholder retaining card geometry         |
| Failed            | Compact failure state in the same grid position    |
| Stale cached data | Optional tiny `Cached` indicator                   |

Cards should never perform large hover lifts or dashboard-style animations.

Keyboard operation MUST remain complete. At minimum, Tab and Shift+Tab move through entries and navigation controls, Enter opens the focused entry, Right Arrow/PageDown moves toward older pages, and Left Arrow/PageUp moves toward newer pages when those keys are not needed by another focused control.

The small `Ctrl + wheel to zoom` interaction hint is intended primarily for pointer-based desktop use. It SHOULD NOT consume scarce space in the single-page mobile layout. Touch interactions should instead remain conventional enough that persistent instruction text is unnecessary.

## H-00. Loading, failure, and incomplete-content presentation

Data-layer states from DELTA must fit into the journal without changing the page geometry.

A record that is still loading occupies its final grid position. The placeholder should resemble quiet paper rather than a modern animated skeleton. A faint preview block and subtle title lines are sufficient. If motion is used, prefer a slow low-contrast opacity pulse.

When the entry resolves, its final content replaces the placeholder without moving neighboring cells.

A record-level failure also remains in place. The journal must not silently remove the failed record because that would shift subsequent entries and destroy the physical pagination model.

A failed record can use a restrained card such as:

```text
Link unavailable

Retry
```

Technical details remain in the browser console and are specified by FOXTROT. The page itself communicates only what the reader needs.

If the preview JPEG fails while metadata remains valid, retain the normal card size and display a neutral preview placeholder. The title, source, date, and link remain usable.

A stale cached record may show a tiny `Cached` indicator if useful. This is an exceptional state, not permanent metadata shown on every card.

An entirely empty archive is different from one failed record. The journal remains visible, but Page 1 may contain a minimal centered message such as:

```text
The journal is empty.
```

No onboarding wizard or explanatory product screen is needed.

The final archive page requires no explicit "end of archive" banner. Physical inability to continue forward is sufficient.

## I-00. Implementation boundaries and performance

The visual implementation should remain simpler than its appearance suggests.

The preferred technology remains plain HTML, CSS, and JavaScript. A large frontend framework, 3D library, physics engine, WebGL renderer, canvas book engine, or page-flipping package should not be added simply to imitate paper.

The implementation should conceptually separate a small set of concerns:

```text
scene / camera
journal shell
logical page
entry card
page-navigation controller
page-turn visual layer
loading and error presentation
responsive layout
```

This is enough separation to make visual behavior understandable without constructing a generalized component framework.

Important visual constants should be centralized, including page aspect ratio, page padding, grid gap, gutter width, leather edge thickness, page-turn duration, drag threshold, default zoom, and zoom limits.

CSS should provide most of the material treatment:

```text
gradients
box shadows
inset shadows
border treatment
transforms
perspective
opacity
```

Small optimized local textures may be used for leather, paper, desk grain, or screenshot-edge wear when CSS alone does not produce the required result.

Do not use separate high-resolution texture images for every page.

The live DOM should contain only the page content required for the current view and nearby page-turn states. Rendering hundreds of hidden pages is unnecessary. DELTA already bounds the active data set.

The page turn, panning, and zooming should primarily animate compositor-friendly transforms and opacity. The target is smooth interaction on an ordinary modern mobile device and desktop browser. The design should prefer a simpler physically plausible animation over a more elaborate animation that introduces persistent frame drops.

## J-00. Visual implementation and inspection procedure

Visual inspection is a required implementation activity, not optional polish.

The supplied reference images will be available to Codex. Codex MUST inspect them directly before implementing the journal and repeatedly during implementation.

A functional DOM with six cards is not sufficient proof of completion.

The appropriate development loop is:

```text
implement one major visual concern
        |
render real application
        |
capture or inspect screenshot
        |
compare with reference images
        |
identify visual mismatch
        |
adjust
        |
repeat
```

This process should occur after substantial changes to page geometry, grid spacing, typography, material treatment, camera scale, responsive behavior, screenshot aging, or page animation.

The visual review should specifically examine the following.

| Area               | What to inspect                                                           |
| ------------------ | ------------------------------------------------------------------------- |
| Overall silhouette | Journal dominates scene and reads as one physical object                  |
| Camera framing     | Content large enough at 100%; desk appears progressively when zooming out |
| Leather            | Dark brown, restrained grain, believable edge thickness                   |
| Paper              | Warm, clean, mildly aged, readable                                        |
| Binding            | Narrow, centered, physically coherent                                     |
| Grid               | Equal columns, consistent row geometry and page margins                   |
| Preview            | Recognizable, aligned, subtly worn only at edges                          |
| Titles             | Readable, clamped consistently                                            |
| Metadata           | Host and date aligned and secondary                                       |
| Desk               | Dark, quiet, subordinate                                                  |
| Page turn          | One coherent attached sheet; no impossible folding                        |
| Mobile             | Single page remains readable and vertically scrollable                    |
| Desktop            | Both pages readable without excessive empty environment                   |

The implementation should be visually tested with varied realistic content: dark and light previews, text-heavy and image-heavy previews, one-line titles, three-line titles, long hostnames, partial pages, loading cells, and error cells.

Page-turn inspection deserves special attention. Codex must inspect intermediate frames, not only the resting states. A transition passes only when the turning sheet remains attached to the binding, underlying sheets remain stable, shadows move consistently with the sheet, and no floating or duplicated paper appears.

The camera interaction must likewise be inspected visually and functionally at several window sizes. Codex MUST verify that the minimum-readable-size rule prevents over-shrinking, that ordinary wheel scrolling reveals overflow, that Ctrl + wheel zooms without simultaneously scrolling, that drag panning remains bounded, and that mobile pinch and scrolling do not conflict.

## K-01. User scenarios

### Opening the journal on desktop

The user opens the site on a desktop browser with 40 saved links.

The application immediately shows an open leather journal containing Pages 1 and 2. There is no cover-opening step.

The twelve newest records are visible. Each page contains six cards. The journal fills most of the useful viewport. Cream paper is bright enough for easy reading. Dark leather frames the pages. Only a modest part of the wooden desk is visible.

If there is enough unused desk space, a small quiet instruction near the top states:

```text
Ctrl + wheel to zoom
```

It does not overlap or compete with the journal.

The user can immediately recognize links from their screenshots and titles.

### Looking more closely at a saved page

A screenshot contains small but recognizable interface detail.

The user holds Ctrl and moves the mouse wheel upward.

The application zooms from 100% toward 125%.

The journal camera moves closer while retaining approximately the same focal region. Less desk and leather are visible, and the preview occupies more screen space.

The user releases Ctrl and uses the normal mouse wheel. The viewport scrolls rather than changing zoom.

The user then holds the left mouse button over unused page space and drags slightly to inspect the right side of the spread.

The journal pans like a large image.

The user releases the button. Nothing snaps unexpectedly back to the center.

### Pulling back to see the physical journal

The user holds Ctrl and moves the mouse wheel downward until the journal reaches approximately 75%.

Both pages, the full leather cover, the journal cast shadow, and a larger area of the dark wooden desk become visible. A pen near the outer edge of the scene may become visible.

No toolbar, large label, caption, or unrelated application information appears. The small zoom hint may remain in unobtrusive desk space.

### Small desktop window

The user narrows the browser window.

Fitting the complete spread would require shrinking it below the minimum readable size.

The journal therefore stops shrinking.

The viewport now contains only part of the complete scene.

The user uses the normal mouse wheel to scroll vertically and left-button drag to pan horizontally or diagonally where needed.

Titles, source hostnames, dates, and preview images remain readable because the application did not reduce them below the accepted minimum scale.

### Scrolling on a constrained screen

The mobile viewport shows Page 1 but only its upper rows fit vertically.

The user performs a normal vertical touch scroll.

The viewport moves down the physical page and exposes the lower entries.

The journal does not change to Page 2.

Likewise, a desktop mouse wheel scrolls the viewport and never turns pages unless Ctrl is being held for application zoom.

### Turning to older links on desktop

The user is looking at Pages 1 and 2 and activates forward navigation.

The right sheet rotates around the gutter with a short perspective transition. A moving shadow indicates that the sheet is lifting. Underlying geometry stays still.

The turn completes in roughly half a second and Pages 3 and 4 become the resting spread.

At no point do two sheets curl together or appear detached from the binding.

### Turning pages on mobile

The user is looking at Page 3 and performs an intentional horizontal swipe.

The application identifies horizontal intent rather than vertical scrolling.

A simplified single-sheet page transition occurs and Page 4 becomes active.

The viewport returns to the useful top position of Page 4 while preserving the current journal zoom.

### Mobile zoom

The user places two fingers on a mobile journal page and performs a pinch-out gesture.

The journal enlarges.

Because the enlarged page may now extend beyond the viewport in both dimensions, normal touch movement can reveal the hidden content.

A subsequent vertical reading gesture remains vertical scrolling rather than being interpreted as a page turn.

A clear horizontal navigation gesture remains necessary to move to another logical page.

### Activating a link versus panning

The user presses on a card and releases without meaningful pointer movement.

The link opens.

On another attempt, the user presses the same card and drags more than the pan threshold before releasing.

The journal pans and the link does not open.

This distinction makes the image-like camera interaction compatible with whole-card link targets.

### Partial final page

The archive contains 15 records.

Pages 1 and 2 are full. Page 3 contains three entries.

The three cards use their normal size and occupy the first three slots in order. The remaining grid positions remain empty cream paper.

The existing cards do not stretch or recenter into a new layout.

## L-01. Acceptance criteria

The implementation is accepted only when both functionality and visual inspection satisfy the following conditions.

### Composition and content

The application opens directly to journal content. Desktop shows two logical pages when both remain readable; mobile or constrained view shows one. Each logical page contains six fixed entry positions arranged as two columns by three rows.

Every normal record visibly contains its screenshot, title, hostname, and date. Screenshot previews remain recognizable at default scale. Long titles do not change grid geometry. Empty slots on partial pages remain empty.

The journal occupies most of the viewport at 100% application zoom. Decorative environment never forces the content to become unnecessarily small.

When fitting the complete journal would require scaling below the defined minimum readable size, the journal remains at or above that minimum and the viewport becomes scrollable instead.

### Physical visual language

The journal reads as one coherent dark-brown leather object containing warm cream pages. Leather, paper, binding, page edges, and shadows have enough depth to communicate material without becoming theatrical.

The journal rests on a dark wooden desk. More desk becomes visible as the user zooms out. Sparse props such as one pen are acceptable but remain secondary.

Preview screenshots preserve their source colors and clarity. Only their perimeter receives restrained age or wear treatment.

No fake mobile status bar, bottom annotation plaque, dashboard toolbar, sidebar, footer, large pagination controls, or other unrelated application chrome appears.

A single small zoom instruction may appear in unused desktop environment space. It communicates `Ctrl + wheel to zoom`, remains visually subordinate, and disappears or is omitted when insufficient desk space exists.

### Page interaction

Desktop navigation moves by two pages and mobile navigation by one.

Page-turn animation shows one coherent sheet attached to the binding. The animation contains no floating duplicates, multi-sheet folding, impossible intersections, or exaggerated permanent curled pages.

Forward and backward directions remain physically consistent.

Reduced-motion mode provides the same navigation without the physical page animation.

### Scroll, pan, and zoom

Regular mouse-wheel input scrolls vertically.

Trackpad vertical input scrolls vertically.

Regular wheel input does not change journal pages and does not change zoom.

Ctrl + mouse wheel changes application zoom in and out and does not simultaneously scroll the scene.

The zoom interaction works consistently enough that the small desktop instruction is accurate.

Primary-button drag pans the journal on desktop.

Click and drag are separated by a movement threshold so a pan does not activate a link.

Pan bounds prevent the journal from becoming unrecoverably lost outside the viewport.

Application zoom begins at 100%, is bounded, preserves the user's approximate focal region, and reveals progressively more physical environment when zoomed out.

The journal does not shrink below the minimum readable size merely to fit a small window.

When the journal exceeds the viewport, scrolling and panning make hidden content reachable.

Mobile vertical touch movement scrolls the current page.

Mobile pinch zooms the journal.

Mobile zoomed content remains navigable.

Horizontal mobile page gestures remain distinguishable from vertical reading movement.

The mobile interaction model has been tested on touch-capable behavior, not inferred solely from mouse interaction.

### Responsive behavior and accessibility

Changing between one-page and two-page presentation preserves the user's approximate logical location and does not reorder records.

The journal remains readable at representative mobile, tablet, standard desktop, and large desktop viewports.

All entries remain keyboard reachable, focus is clearly visible, Enter opens a focused entry, and keyboard page navigation exists.

Reduced-motion preferences are honored.

### Required visual verification

Codex has inspected the supplied reference images directly.

Codex has repeatedly rendered and visually inspected the application during implementation rather than relying only on DOM inspection or automated tests.

Desktop and mobile screenshots have been compared against the reference direction.

Intermediate page-turn frames have been inspected.

Pan, zoom, regular scrolling, Ctrl + wheel zooming, minimum readable sizing, partial pages, long titles, loading records, failed records, light previews, and dark previews have been visually tested.

At least one intentionally small desktop window has been tested to verify that content remains readable and overflow is reachable by scrolling and panning.

At least one mobile viewport has been tested to verify vertical scrolling and pinch zoom behavior.

The final review confirms consistent page margins, equal grid columns, stable row geometry, aligned previews, aligned metadata, centered binding, coherent shadows, readable typography, restrained material aging, and the absence of image-generation defects copied from the sketches.

The implementation is not accepted solely because functional tests pass. For this specification, visual inspection is part of correctness.

## M-00. Next specification

The next specification is:

```text
2026-08-16.FOXTROT.A-00
Diagnostics, Errors, Telemetry, and System Acceptance
```

FOXTROT will define the cross-cutting diagnostic contract for both local authoring and the browser application: stable log structure, actionable errors, console troubleshooting, failure context, privacy boundaries, repository-consistency diagnostics, boundary conditions, and final end-to-end system acceptance.

