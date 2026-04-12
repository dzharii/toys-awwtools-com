2026-04-12
A00

Specification: Self-contained bookmarklet for visible screenshot cursor and drag trail

B00

Purpose and product intent

This bookmarklet exists to solve a recurring screenshot problem: on many web pages and software surfaces, the real mouse cursor is not captured in screenshots, which makes instructions, demos, bug reports, and product documentation harder to understand. The bookmarklet must temporarily render a synthetic cursor that visually tracks the real pointer position so screenshots remain clear and intentional.

The bookmarklet is not a general UI automation tool. Its primary value is visual communication. It should help a user produce cleaner screenshots, clearer walkthroughs, and more legible examples by making pointer position, drag origin, and drag destination visible at the moment a screenshot is taken.

The interaction model must stay lightweight. A single bookmarklet activation should enable the feature on the current page, and another activation should disable it cleanly. While enabled, the synthetic cursor must be visible, aesthetically polished, and easy to distinguish against varied page backgrounds. It must never block interaction with the page. The user must still be able to click, drag, select, scroll, and otherwise interact normally.

C00

Scope

The product in scope is a self-contained bookmarklet that injects all required behavior and presentation into the current page at runtime. It should create and manage its own DOM nodes, styles, state, and event handling. It should display a synthetic cursor near or at the real pointer location, preserve page interactivity, and show a persistent drag trail that remains visible after a drag gesture until the next ordinary click clears it.

The product is not responsible for capturing the screenshot itself. It only prepares the page so that screenshots taken by the user, browser tooling, or external software visibly include a pointer representation and relevant drag path context.

D00

Deployment and architectural constraints

The solution must be implemented as a bookmarklet and must be fully self-contained. It must not require any external network requests, third-party libraries, build-time assets, icon fonts, image files, or external stylesheets. Everything required for operation must be created and injected by the bookmarklet at runtime.

The implementation must use modern JavaScript, CSS, and HTML concepts, but all CSS and HTML structures must be embedded into the page by the bookmarklet itself. The bookmarklet should be written as ordinary, readable JavaScript source, formatted for human review and maintenance. It must not be minified or mangled. It also must not contain comments.

The implementation must avoid `innerHTML`. DOM nodes must be created using raw DOM APIs such as `document.createElement`, attribute setters, property setters, text node creation where needed, and explicit tree assembly. Helper functions may be used to reduce repetition and overall code size, provided they remain internal to the bookmarklet and preserve readability.

A Shadow DOM based containment strategy should be part of the design. The bookmarklet should create a host element and attach a shadow root to isolate its visual layer from page CSS and reduce the risk of style collisions. This isolation is important because the bookmarklet will run on arbitrary pages with unknown style rules, resets, transforms, stacking contexts, and script behaviors. The specification should treat Shadow DOM as the default containment mechanism unless a specific platform constraint prevents it.

E00

Functional behavior

When the bookmarklet is activated on a page where it is not currently running, it must enable the visual overlay. When activated again on the same page while already running, it must disable itself and remove all injected state, elements, listeners, and styles. This toggle behavior should be deterministic and idempotent.

While enabled, the bookmarklet must continuously track the current pointer position and render a synthetic cursor at that position or with a carefully chosen small offset so the pointer remains visible and aesthetically aligned. The cursor must visually read as a conventional pointing arrow rather than an abstract dot or crosshair, because recognizability matters for screenshots and documentation.

The synthetic cursor must not intercept pointer interaction. It must be visually present only. All pointer input must continue to target the page underneath exactly as it would without the bookmarklet. This requirement applies to hovering, clicking, selecting text, dragging page elements, dragging resize handles, scrolling, and interacting with controls.

The bookmarklet must detect drag-like interaction and render a visible trail between the drag start location and the most recent drag position or final drag end position. The exact drag detection model should be based on a pointer down followed by pointer movement beyond a small threshold, rather than every minor jitter. This avoids accidental drag trails from tiny involuntary movements.

Once a drag trail has been created, it must remain visible after the drag ends. It should not disappear immediately on pointer up. It should remain on the page until the user performs a later ordinary click, at which point the prior trail should be cleared. This persistence is central to the screenshot workflow because the user often needs a moment after completing the drag to capture the image.

The bookmarklet may optionally show a brief click animation to improve screenshot storytelling and user orientation, but this behavior is secondary. If implemented, it should be subtle, brief, and non-distracting. It must never obscure controls, accumulate indefinitely, or compete visually with the primary cursor and drag trail. The specification should therefore treat click animation as optional rather than required.

F00

Cursor visual design requirements

The synthetic cursor must be highly visible on light, dark, colorful, textured, and busy backgrounds. It should resemble a familiar system pointer while still being strong enough to survive screenshot compression, document scaling, and presentation resizing.

The cursor should have a crisp silhouette, a solid primary fill or contrast structure, and a shadow treatment that separates it from the page content underneath. A thin outline or dual-tone construction is desirable so the cursor remains visible whether it is placed over white or black backgrounds. A soft shadow can provide depth, but the shadow should not become so diffuse that the cursor looks blurry in a screenshot.

The cursor should look intentional and polished. It should not appear like a debugging marker. The visual language should communicate "real pointer, but clearer for screenshots." The design should prioritize legibility over strict fidelity to any one operating system's default cursor.

The size should be large enough to remain readable in screenshots, but not so large that it feels cartoonish or covers important UI details. A moderate scale-up relative to a native cursor is acceptable and desirable for presentation use.

G00

Drag trail visual design requirements

The drag trail must clearly communicate origin, direction, and destination. It should remain readable in a static screenshot without requiring animation. A plain line is acceptable, but a visually richer treatment is preferable if it remains stable and lightweight.

The trail should begin at the drag start point and end at the most recent or final drag position. The end result should visually indicate that an object or selection was dragged from one location to another. The trail should remain readable against mixed page content, so it should include sufficient contrast, potentially through stroke plus shadow, layered stroke treatment, or a simple marker at each endpoint.

The trail should feel like a screenshot aid, not like a drawing annotation. It should be clean and restrained. The visual system should align with the cursor design so both elements feel part of the same overlay.

The trail must persist until a later ordinary click clears it. Only one persistent drag trail should be required at a time. If a new drag occurs before the old trail is cleared, the old trail may be replaced by the new one rather than maintaining a history of all drags. This keeps the page uncluttered and reduces implementation complexity.

H00

Interaction model

The bookmarklet should run as a page-level overlay with no visible control panel unless one is later explicitly added to the requirements. The immediate model is simple: invoke once to turn on, invoke again to turn off.

The overlay should follow the pointer across the viewport in real time with minimal lag. It should remain correctly positioned during scrolling, zooming, and interaction with page elements. The user should not need to recalibrate anything.

During pointer down and movement, the bookmarklet should determine whether the gesture has become a drag. A simple movement threshold is appropriate so that ordinary clicks do not accidentally become drag trails. When a true drag is detected, the trail should be displayed and updated as the pointer moves.

After the drag completes, the trail should remain visible. When the user later performs a normal click, the bookmarklet should clear the existing persistent trail. That clearing click should still go through to the page normally. Clearing the visual state must not consume or alter the underlying interaction.

The product should continue working across a variety of common page states, including scrolling containers, positioned elements, overlays, iframes that cannot be accessed from the parent context, and pages with aggressive CSS. For inaccessible cross-origin iframes, the overlay can only track pointer events available in the current document context. That limitation should be documented explicitly.

I00

State model

The bookmarklet should maintain a small internal runtime state sufficient to answer these questions: whether the feature is active, where the current pointer is, whether a pointer-down is in progress, whether a drag threshold has been crossed, what the drag origin is, what the drag endpoint is, and whether a persistent trail is currently displayed.

This state should be private to the bookmarklet and stored in a way that avoids collisions with application code on the page. A symbol-like property on `window`, a uniquely named property, or state anchored to the host element are all acceptable approaches as long as double activation and cleanup remain reliable.

The enabled and disabled transitions must be well defined. On enable, the bookmarklet creates its host, shadow root, visual elements, listeners, and initial state. On disable, it removes all of them completely and leaves no visible artifacts behind.

J00

DOM and styling requirements

All DOM nodes required for the overlay must be created through standard DOM APIs. The implementation must not use `innerHTML` or similar string-based HTML injection shortcuts. This rule applies to the main structure and to any optional helper UI.

The bookmarklet should create a top-level host element attached to the document in a way that gives it reliable visibility across page layouts. A shadow root should be attached to this host. The shadow tree should contain the synthetic cursor element and any drag trail elements or drawing surface needed.

Styling should be scoped within the shadow root so page CSS does not accidentally restyle the overlay. The overlay must use a very high stacking order so it remains visible above ordinary page content, but it still must not intercept pointer events. The visual layer should therefore be configured to be non-interactive.

The styling approach should be compact but explicit. The bookmarklet must carry all its required CSS internally. Since the code must remain readable and unminified, style generation should favor clarity over compression.

K00

Performance and responsiveness requirements

The overlay should feel immediate. Pointer movement must update smoothly enough that the synthetic cursor appears attached to the real pointer. The implementation should be efficient in both event handling and DOM updates.

The bookmarklet should avoid causing layout thrash or unnecessary reflow. Position updates should favor transform-based movement or other efficient rendering strategies. Drag trail updates should also be designed to minimize expensive DOM churn.

The runtime footprint should stay modest. This is a bookmarklet intended for ad hoc use on arbitrary pages. It should not attach excessive listeners, create deep DOM trees, or allocate unnecessary long-lived objects.

L00

Compatibility expectations

The bookmarklet is intended for modern browsers with good support for contemporary DOM APIs, CSS features, and Shadow DOM. The specification assumes a modern JavaScript environment and does not require legacy browser support.

The product should behave acceptably on typical desktop browsing scenarios where screenshots are most commonly taken. Touch-only environments are not the primary target, although pointer events may naturally cover some touch-capable systems. The main design target is mouse or trackpad driven desktop interaction.

Pages with restrictive security policies or hostile scripting environments may reduce functionality. The bookmarklet should still prefer standards-based implementation choices that maximize the chance of working on ordinary sites without special permissions.

M00

Non-functional requirements

The product should be robust against page CSS interference, concise in structure, and easy to inspect or revise later. Because the bookmarklet is intended to be maintained as source, readability matters. The produced JavaScript should therefore be well formatted and organized, even though it remains a single bookmarklet payload.

The code should be self-contained, have no comments, and avoid unnecessary abstractions. Helper functions are appropriate where they materially reduce duplication or improve clarity. The implementation should aim for a balance between compactness and maintainability.

Security-sensitive practices should be avoided. In particular, `innerHTML` must not be used. DOM construction should remain explicit and safe.

N00

Failure modes and limitations

If the page disables or interferes with injected scripting, the bookmarklet may fail to initialize. In that case, failure should be silent or at most limited to a lightweight runtime indication if one is later added. It should never break the host page deliberately.

If the pointer enters a context the current document cannot observe, such as certain cross-origin iframe boundaries, the synthetic cursor may no longer track perfectly until the pointer returns to the main accessible document context. This limitation is inherent to web security boundaries and should be documented rather than worked around with fragile assumptions.

If the page itself hides, transforms, or aggressively re-renders root-level nodes, the bookmarklet should still aim to remain stable by attaching near the document root and isolating itself through Shadow DOM. However, absolute guarantees are not possible on arbitrary hostile pages.

O00

Acceptance criteria

A successful implementation satisfies these observable outcomes.

When the bookmarklet is activated, a clearly visible synthetic cursor appears and follows the current pointer position.

When the bookmarklet is activated again, the feature turns off and removes all injected elements and listeners.

The synthetic cursor never blocks clicks, drags, selections, scrolling, or other normal interaction with the page.

A drag gesture creates a visible trail from the drag start point to the drag endpoint.

That drag trail remains visible after the drag ends.

The persistent drag trail is cleared by a later ordinary click and not before.

The visual styling remains legible across mixed backgrounds and includes enough contrast and depth to be useful in screenshots.

The implementation is fully self-contained, uses modern JavaScript, CSS, and DOM APIs, avoids `innerHTML`, and isolates styling through Shadow DOM or equivalent protected encapsulation.

P00

Usage scenarios

Scenario 1: Documenting a product workflow in screenshots

I am preparing internal documentation for a web application, and I need each screenshot to show where the user is supposed to click. Normally the real mouse pointer disappears in the screenshot, so the image feels ambiguous. I activate the bookmarklet before taking the screenshots. A synthetic cursor appears and tracks my pointer while I move through the interface. I position it over the relevant button, take the screenshot, and the image now clearly shows the intended click target without affecting the page itself.

Scenario 2: Showing a drag-and-drop interaction

I want to explain how to drag an item from one panel into another. A static screenshot of the final state is not enough because the viewer cannot tell where the item came from. I enable the bookmarklet, start the drag, and move the item to its destination. The bookmarklet renders a visible drag trail from the starting point to the ending point. After I release the mouse, the trail remains on the page long enough for me to take the screenshot. The resulting image communicates both the origin and destination of the drag.

Scenario 3: Creating a bug report with precise visual context

I am reporting a UI bug and need to show exactly where the problem appears when I hover or interact near a specific control. I enable the bookmarklet and reproduce the issue. The synthetic cursor stays visible on top of the affected area, which makes the screenshot easier for another engineer to interpret. Because the overlay does not intercept input, I can still interact with the page naturally while capturing the evidence I need.

Scenario 4: Preparing tutorial material for a presentation

I am building a slide deck that walks an audience through several steps in a browser-based tool. In presentation slides, small details often get lost, including the cursor position. I use the bookmarklet while collecting screenshots so the pointer remains obvious after resizing the images for slides. The shadowed, high-contrast cursor remains legible even when the screenshot is scaled down, which makes the tutorial easier to follow.

Scenario 5: Capturing a before-and-after interaction without clutter

I need to show one drag operation clearly, but I do not want the page covered with old annotations. I enable the bookmarklet, perform the drag, and the trail stays visible so I can capture the result. After that, I click somewhere else on the page to continue working. That ordinary click clears the previous trail, leaving the page clean for the next screenshot. This supports a repeated capture workflow without accumulating stale visual traces.

Q00

Recommended implementation direction for the later coding phase

When coding begins, the implementation should favor a compact overlay architecture with a single host element, a shadow root, a synthetic cursor element, and a minimal drawing mechanism for the persistent drag trail. Event handling should likely center on pointer events so movement, down, up, and drag threshold logic remain unified. DOM helpers should be used where they reduce repetition, but the code should remain direct and readable.

The coding phase should preserve the core priorities established here: screenshot clarity first, interaction pass-through always, persistent drag trail until cleared, no `innerHTML`, isolated styling, self-contained delivery, and readable non-minified JavaScript source.
