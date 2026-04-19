20r26-04-19

A00. ceetcode-reference-window-integration-change-request.md

# CeetCode Reference Window Integration Change Request

## A00. Purpose

This document defines the integration change request for embedding the C99 reference project into CeetCode as a first-class in-app tool. The reference already exists in the repository under `external-app-c99-reference`, and the integration must use the embed API already designed for that project. The goal is not merely to show the reference inside an iframe. The goal is to make the reference feel like a practical, polished, low-friction companion to solving C99 problems in the browser.

Codex must treat this as an integration task across two cooperating parts of the same project tree. The CeetCode application is the host. The C99 reference is the embedded external application. Codex must inspect `external-app-c99-reference/embed-api-quickstart.md` and the implementation in `external-app-c99-reference/app.js`, then integrate through that API. If essential to complete the integration properly, Codex may modify files inside `external-app-c99-reference`. Such modifications should stay purposeful, limited, and aligned with the embed contract rather than becoming unrelated refactors.

The implementation should preserve both modes of using the reference. The first mode is a standalone full experience opened in a new browser tab or window. The second mode is an embedded in-app floating reference window with a slimmer, embedded presentation.

## A01. Repository and deployment context

The CeetCode application is served on the web from:

```text id="pumz40"
https://toys.awwtools.com/public/2026-04-18-Ceetcode/dist/
```

The reference can be available from the parent folder as:

```text id="syyjlwm"
https://toys.awwtools.com/public/2026-04-18-Ceetcode/external-app-c99-reference
```

This same-origin relationship is intentional and trusted. The integration must use the formal embed API rather than ad hoc DOM coupling wherever practical, but same-origin trust means the experience can be made smooth without defensive cross-site limitations.

## B00. Core user scenario

The main scenario is this.

A person is solving a C99 programming problem inside CeetCode. They are reading the problem, typing code, running tests, and iterating. In the middle of that work, they need to recall a function signature, an idiom, a library usage pattern, or a subtle detail of the C99 standard library. They do not want to leave the page. They do not want to search the web. They do not want to lose mental focus by opening documentation in a separate unrelated environment.

Instead, they click a `Reference` control inside CeetCode. A floating reference window opens above the current application, still within the same page. It looks deliberate and polished, like a lightweight operating-system-style tool window rather than a raw iframe dropped onto the page. It has a title bar, it can be dragged, it can be resized, it can be closed, and it is large enough to be immediately useful. The embedded reference adapts to the host theme and embedded width. It feels slim and practical rather than bloated.

The person searches for `printf`, `memset`, `qsort`, `strlen`, or another entry. They read the result. They may insert or copy a snippet if the integration supports it. Then they either close the window or leave it open on the side while continuing to code. The experience should reduce interruption, not add another layer of UI friction.

This is the center of gravity for all design decisions in this feature.

## B01. Secondary user scenario: open the reference in a new tab or new window

Sometimes the person does not want the slim embedded experience. Sometimes they want the full standalone reference with its default layout, normal chrome, and full reading space.

CeetCode must therefore also support opening the reference in a new tab or new window using a target-blank style action. In this mode, the reference should behave as its standalone application. It should use its own default colors, default layout, and full standalone experience. This mode is useful when the person wants to browse more deeply, compare many entries, or keep the reference separate from the coding surface.

The standalone mode and embedded mode are both required. They solve different moments of need.

## B02. Additional scenario: reference stays open while coding continues

A strong integrated workflow is not only "open, read, close." Another important scenario is "open, consult repeatedly, keep nearby."

The floating reference window should support being left open while the person continues interacting with the editor and the rest of CeetCode. The window should not dominate the page or block the core workflow unnecessarily. It should be movable and resizable so the person can place it where it helps rather than where it interferes. The UI should let the person settle into a rhythm where the reference is available as a nearby tool surface.

This means the floating window must be manageable, visually contained, and not annoying.

## B03. Additional scenario: narrow layout and constrained space

The embedded reference window should still be usable when the host page has limited width. Even if the floating window is smaller than ideal, the embedded presentation should remain legible and the reference should respond through the embed API to compact mode and smaller dimensions.

This does not mean the floating window should be allowed to become arbitrarily tiny. It means the integration should enforce practical minimum dimensions and use embedded layout hints so the reference can adapt gracefully when space is constrained.

## C00. Required host-side feature

CeetCode must gain a reference integration feature with two entry paths.

The first entry path opens the reference embedded inside a floating in-app window.

The second entry path opens the reference in a new tab or new browser window for full standalone use.

Codex should choose the exact control layout in the top UI using best judgment, but the existence of both actions must be clear and usable. A good pattern would be a primary `Reference` button that opens the floating window and a nearby secondary action such as `Open in new tab`, `Pop out`, or an icon/button associated with external opening. Codex may refine the wording, but the meaning must remain obvious.

## C01. Floating reference window behavior

The embedded reference must appear in a floating window inside CeetCode.

This floating window should visually resemble a lightweight operating-system window rather than a plain modal. It must have a title bar. The title bar should have a frosted or translucent visual effect if that can be achieved cleanly in the current visual system. The styling should remain tasteful and not distract from readability.

The title bar controls should visually resemble window controls in a Windows-like style. The exact appearance does not need to mimic any operating system perfectly, but it should clearly communicate window actions.

The floating window must support these capabilities.

It must open.

It must close.

It must be draggable by the title bar.

It must be resizable from all four sides, and corners if convenient.

It must stay above the main application while open.

It must start at a sensible default size.

It must respect reasonable minimum dimensions so the embedded reference remains readable.

It must not open so large that it overwhelms the whole app by default.

It may optionally remember prior size and position if Codex judges that useful and non-annoying, but this is not required unless it clearly improves usability.

## C02. Default window size and placement

The default floating window size should be computed relative to the current viewport.

The requested intent is that the window should feel substantial enough to be immediately useful, not like a tiny accessory. At the same time, it should not obscure the entire host application on first open.

Codex should choose a balanced default, likely somewhat larger than one quarter of the current window width and tall enough to show meaningful reference content without immediate scrolling. The exact calculation may depend on viewport width and height. The result should feel deliberate.

A good implementation should also position the floating window so it is fully visible on first open and not awkwardly attached to the extreme edges of the viewport.

## C03. Window title behavior

The window title must include a stable product label such as `C99 Reference`.

If practical through the embed API, the title should also reflect the currently viewed entry. For example, the title may become `C99 Reference - printf` or `C99 Reference - memset`.

This dynamic title should update when the embedded reference reports that the current entry has changed. If that signal is not yet available or is temporarily unavailable, the integration should still work with a static `C99 Reference` title.

## D00. Embedded reference presentation requirements

The embedded reference must use a slim presentation mode.

This means the embedded instance should hide standalone-only UI where appropriate, reduce unnecessary chrome, use tighter spacing where safe, and visually fit inside the smaller working surface of the floating window. The reference should feel intentionally adapted to embedding, not simply squeezed.

The host must pass embed configuration through the API so the reference knows it is embedded and can switch into the correct presentation. Codex must use the existing embed contract and quickstart guidance from the reference project, not invent a parallel private protocol unless essential corrections are needed.

The embedded reference should match the host color theme closely enough that it feels part of CeetCode. It does not need to become visually identical to every host component, but it should avoid clashing with the application palette.

## D01. Standalone reference opening requirements

When the person opens the reference in a new tab or window, the reference should use its full standalone experience.

This mode should not force embedded styling, compact spacing, or hidden chrome. It should be the default reference application, as designed by the reference project.

This distinction matters because the embedded mode is for quick access and contextual lookup, while the standalone mode is for deeper reading and broader browsing.

## E00. Integration architecture requirements

Codex must integrate through the reference embed API.

Codex must inspect `external-app-c99-reference/embed-api-quickstart.md` and the current implementation in `external-app-c99-reference/app.js` before integrating.

If needed, Codex may refine the embed API implementation inside `external-app-c99-reference` so that the integration becomes robust and clean. Those changes should remain aligned with the previously established embed contract and the purpose of reusable embedding.

The host-side floating-window implementation should be placed in a reusable module or modules rather than being hardcoded inside one page script. This is important because similar integration mechanics may be reused later for other external tools or internal utility surfaces.

Codex should therefore create a base integration capability for embeddable tool windows if that improves structure. This may include a generic floating window controller, drag logic, resize logic, focus or z-index management, and associated CSS isolated from unrelated UI.

## E01. Suggested modular structure

Codex should consider implementing this feature in separable pieces.

One module should deal with the floating window shell itself.

One module should deal with drag behavior.

One module should deal with resize behavior.

One module should deal with C99 reference host integration, including iframe creation, startup config, runtime message handling, and title synchronization.

One CSS area or stylesheet section should contain the floating window visuals so they are not scattered throughout unrelated host styles.

The exact file names are left to Codex, but the result should be reusable and maintainable.

## F00. Embedded API usage requirements

The host must configure the embedded iframe using the established startup contract.

The host must request embedded presentation mode, hidden standalone chrome where appropriate, compact spacing where useful, and host theme adaptation.

The host must listen for outbound events from the embedded reference, especially readiness, current-entry changes, height updates if relevant, and snippet-related events if available.

If the reference can report the current entry title or identifier, the host should use that information to update the floating window title.

If the reference supports snippet insertion requests, the host should connect that path into the CeetCode editor in a way consistent with the rest of the product.

If API changes are required to make these flows work well in practice, Codex may refine the reference-side implementation and documentation.

## F01. Example embedded workflow expectations

A person opens the floating reference window.

The host creates the iframe and passes embedded startup configuration.

The embedded reference loads in compact embedded mode.

The host may optionally pre-focus the search input or pre-open a useful entry if there is a contextual reason.

The person searches for a function or idiom.

The reference updates inside the window.

The title bar may update to reflect the viewed entry.

The person reads, resizes the window if needed, drags it out of the way if needed, and continues coding.

The person closes the window when done.

This flow should feel stable, light, and practical.

## G00. UI and UX guardrails

The floating window must not be annoying.

It must not open too small.

It must not open too large.

It must not be visually noisy.

It must not block the person's work more than necessary.

It must be easy to move.

It must be easy to resize.

It must be easy to close.

It must be easy to reopen.

It must display embedded reference content cleanly at its default size.

It must support enough minimum width and height that the embedded reference remains readable.

The title bar and controls must be understandable at a glance.

If a frosted title bar effect is used, it must remain readable and not create low-contrast text or muddy controls.

Window dragging and resizing must feel smooth rather than fragile.

The host should manage stacking and focus sensibly so the floating window does not behave unpredictably.

## G01. Interaction niceties Codex may implement

Codex may add extra quality-of-life behavior if it improves usability and remains consistent with the product.

Examples include bringing the window to front on interaction, restoring previous position if still valid, constraining the window to remain at least partly visible inside the viewport, and adjusting position if the viewport shrinks.

Codex may also add a title bar action for opening the current reference in a full tab, if that helps bridge between embedded and standalone modes.

These are optional improvements, but they align well with the design intent.

## H00. To-do and verification guardrails

Codex must treat the following as acceptance guardrails for implementation.

The host application must expose a clear way to open the reference embedded inside a floating in-app window.

The host application must expose a clear way to open the reference in a new tab or new window for full standalone use.

The embedded floating window must open at a sensible default size and position.

The floating window must be draggable by its title bar.

The floating window must be resizable from all four sides, and corners if implemented.

The floating window must be closable.

The floating window must remain visually above the application while open.

The embedded reference must render in a slim embedded layout suitable for the window size.

The embedded reference must match the host visual theme well enough to feel integrated.

The embedded reference must remain readable and navigable inside the floating window.

The host must use the existing embed API contract and inspect `embed-api-quickstart.md` and `app.js` from the reference project.

The host must listen for relevant reference events and use them where beneficial, especially title updates if possible.

If modifying the reference project becomes essential, changes must remain focused on improving embed support and must not damage standalone behavior.

The floating-window implementation should be placed in reusable modules or similarly reusable structure rather than mixed indiscriminately into unrelated code.

## H01. Acceptance verification scenarios

Verification should include this primary scenario.

Open CeetCode.

Open a coding problem.

Open the embedded reference window.

Search for a known C99 function.

Read the entry in the embedded window.

Resize the window and confirm the content remains usable.

Drag the window and confirm the movement feels stable.

Continue interacting with CeetCode while the window remains open.

Close the window.

Reopen it.

Verification should also include this standalone scenario.

Open the reference from CeetCode in a new tab or new window.

Confirm that the full standalone reference experience appears with its normal layout and colors.

Verification should also include this integration scenario.

If the embedded reference can emit current-entry changes, verify that the floating window title updates accordingly.

If the embedded reference can emit snippet insertion requests, verify that CeetCode can receive and apply them correctly.

## I00. Direction to Codex regarding refactoring

Codex should feel free to refactor local host-side integration code if needed to achieve a clean implementation.

Codex may also modify the reference project inside `external-app-c99-reference` if and only if that is essential for proper integration, API completion, or embed-mode correctness.

Such changes should be careful and documented through code structure and comments where necessary.

Codex should prefer extracting general floating-window functionality into reusable modules, because this pattern may be reused later for other integrations.

## J00. Documentation and implementation expectations

The integration code should be understandable and traceable.

The host-side implementation should make it clear where the floating-window shell lives, where drag and resize behavior live, and where the reference API integration lives.

If Codex changes the reference API behavior, it should also update the relevant quickstart or reference-side documentation so future integrators are not forced to reverse-engineer the final behavior.

The resulting system should make CeetCode feel like it contains a real built-in research tool rather than a bolted-on external page.

## K00. Final direction

Implement the C99 reference integration as a polished embedded tool window plus a full standalone opening path.

Optimize for the main user scenario: the person is coding in C99 in the browser, opens the reference quickly from inside CeetCode, searches for a function or idiom, reads it in a slim but usable embedded window, possibly uses the result in code, and then continues without losing momentum.

Use the embed API as the integration backbone.

Keep the window manageable, readable, draggable, resizable, and easy to close.

Keep the code modular so similar integrations can be built on the same foundation later.
