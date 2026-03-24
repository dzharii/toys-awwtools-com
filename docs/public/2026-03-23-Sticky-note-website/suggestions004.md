A00 Scope and intent

This document is a separate UX specification for a desktop-only floating preview window that opens external links from notes in an embedded preview frame. The feature is intended to feel native to the sticky-note board rather than like a generic browser tooltip or detached modal. It should behave like a small movable utility window that visually belongs to the page.

This feature is an enhancement layer. It must not be required for the page to function. The base experience remains the same: notes contain links that can be opened normally. The preview window exists to support quick inspection of the primary linked resource without forcing immediate navigation away from the board.

The preview should only activate in environments with sufficient screen space and appropriate pointer behavior. It is explicitly a desktop-oriented interaction. On smaller screens or touch-dominant environments, the feature should not appear.

A01 Product goal

The goal is to let the user quickly inspect the primary external destination associated with a sticky note while keeping the board visible and usable. The preview should feel like a lightweight auxiliary window, not a takeover. It should support quick glanceability, optional repositioning, and fast dismissal.

The preview must preserve the user's ability to continue reading the hovered note. This is a central requirement. The preview window must not cover the note that triggered it unless no better placement is possible and the system is forced into a constrained fallback. Even then, overlap should be minimized.

The preview should appear only when the external page can actually be embedded. If embedding is blocked by the target site, the window should not appear.

A02 Core interaction model

When the user hovers a note, the system should consider showing a preview for that note's primary URL. The preview should not appear instantly. There should be a deliberate hover delay so the feature feels intentional and does not flash constantly during casual pointer movement.

During that delay, the system should begin checking whether the primary target can be loaded in an iframe. The preview window should only become visible after both conditions are met: the user has hovered long enough and the target appears embeddable enough to justify showing the window.

If the target cannot be embedded, no preview window should appear. The note remains fully usable in its normal state, and normal link behavior remains available through direct click or an explicit open action.

A03 Desktop-only activation rules

This feature should activate only on desktop-like environments with enough viewport area to support a floating window without harming the board experience. The page should treat this as a responsive capability decision, not just a visual styling decision.

The preview should remain disabled when viewport size is too small, when pointer precision is absent, or when the layout would become obstructive. In practical terms, the feature should rely on conditions such as wide enough viewport width and a fine pointer environment.

The exact thresholds can be implementation-defined, but the UX requirement is clear: if the preview would feel cramped, overlapping, or unstable, it should not exist.

A04 Preview window concept

The preview should be presented as a floating miniature window inspired by an operating system utility window. It should have a title-bar-like top frame, a close affordance, and an explicit open-in-new-tab affordance. It should be draggable. It should not be resizable in the first version.

The visual language should match the page. It should feel like a crafted object sitting above the board surface, not a generic browser dialog. A slight rotation, restrained translucency, and subtle material styling are appropriate as long as readability and performance remain strong.

The preview must still feel like a utility surface rather than another sticky note. It should belong to the same visual world without being confused with content cards.

A05 Relationship to the sticky-note aesthetic

The preview window should visually harmonize with the board through shared materials, border softness, shadows, and mild angle or perspective treatment. However, it should be more stable and more structured than the notes. Sticky notes are informal content objects. The preview window is an interaction utility.

A good design direction is a gently rotated floating pane with a muted title bar, a single close control, and a restrained translucent frame. The body should be mostly occupied by the iframe. The rotation should be subtle. It should suggest that the preview belongs to the handmade board world without making the iframe content itself hard to view.

Do not over-style the preview chrome. The external page inside the frame is already visually busy and unknown. The surrounding window should remain calm.

A06 Trigger behavior

The trigger is hovering the sticky note, not hovering a specific small icon. This makes the interaction easier to discover and keeps it integrated with the note-level browsing experience.

However, the preview should be sourced from the note's primary URL only. If a note contains multiple links, the first designated primary URL should be the preview candidate. The implementation should not guess among secondary links based only on DOM order unless the note markup explicitly identifies the primary link.

The hover interaction should start an internal timer. A delay around two seconds is directionally appropriate because it reduces accidental activation. The exact number can be tuned slightly, but the delay should feel intentional rather than instant.

A07 Preload-before-show requirement

The preview window should not appear empty and then fail. The system should first attempt to load the target internally and show the preview only once there is enough evidence that embedding is allowed and content is actually progressing.

This requirement matters because many external sites block iframe embedding. The user should not see a large floating frame appear only to reveal an error or a blank denial state in normal operation.

The preferred behavior is silent failure for blocked targets. If embedding is not possible, the preview simply does not appear. The note still works as a normal link destination when clicked directly.

A08 Embedding-failure behavior

If the target site denies iframe loading, the preview feature should fail quietly and not show a preview window. The note should not flash an error or create a large dead panel. This is a normal limitation of the web, not an exceptional user mistake.

If the implementation can detect failure confidently and early, it should cancel preview display. If failure becomes apparent only after an attempted load, the window should remain hidden rather than revealing an error UI by default.

The exception is developer diagnostics, which may exist in internal debugging but should not be user-facing.

A09 Visibility timing model

The preview lifecycle should have three phases: hover intent, hidden loading attempt, and visible preview.

During hover intent, the system waits for the hover delay and confirms that the user still appears interested in the same note.

During hidden loading attempt, the system begins testing or loading the primary URL in a non-visible preview context. The window remains hidden.

During visible preview, the window fades into view only after the target appears embeddable and active enough to justify display.

This sequencing avoids noisy false starts and produces a calmer experience.

A10 Appearance animation

When the preview becomes eligible to display, it should enter with a light fade-in. A small amount of positional easing is acceptable, but the movement must remain restrained. The preview should feel like it materializes into place near the note, not like it flies in dramatically.

The animation should be brief and subtle. The user should perceive polish, not delay. The fade should not introduce blur or expensive motion effects.

There should be no elaborate exit animation required for ordinary dismissal. A quick fade-out or immediate disappearance is acceptable.

A11 Placement principle

The preview window should be placed near the hovered note, but not on top of it. The core requirement is that the user can still see and read the note they are interacting with. The preview must therefore choose a position that avoids covering the source note whenever reasonably possible.

This is a preference hierarchy problem, not a fixed-coordinate rule. The system should choose the best available location relative to the hovered note, available viewport space, and any previously remembered user position.

The preview should generally appear offset from the note boundary, not flush against it. A small gap helps the preview feel separate and preserves the note's visibility.

A12 Placement strategy

When first positioning the preview for a note, the system should evaluate candidate placements around the source note. Right-side placement is often preferable when space allows, especially when the note is on the left or center of the page. Left-side placement is appropriate when the note is near the right edge. Vertical adjustments may place the preview slightly above or below the note depending on room.

The system should prefer locations that satisfy these goals in order: keep the entire preview inside the viewport, avoid covering the hovered note, remain visually near the note, and preserve a stable understandable pattern.

The preview does not need to always appear on the same side. Adaptive placement is correct here.

A13 Remembered position behavior

The preview window should be draggable, and the system should remember the user's preferred screen position across uses. The remembered value is screen position within the page viewport context, not note-relative position.

This remembered position should act as a preferred anchor for future preview openings. However, it is not absolute. If the remembered position would place the preview off-screen, partially clipped, or directly covering the currently hovered note, the system must adjust it.

In other words, remembered position is a strong preference, but contextual clamping and non-obstruction rules can override it.

A14 Dragging model

The preview window should be draggable by its top bar or equivalent window chrome. The iframe content itself should not be the drag target. Dragging should feel direct and lightweight. There is no need for inertia, complex snapping, or resize handles.

During dragging, the window should remain visually stable. The page should not select text or trigger other awkward browser behaviors. The drag interaction should be bounded to the viewport so the user cannot lose the window entirely off-screen.

Once dragging ends, the new position should be saved so later previews reopen in that preferred area, subject to clamping and note-avoidance logic.

A15 Clamping behavior

The preview window must always remain fully visible within the usable viewport. If a remembered position or attempted drag would place part of the window outside the viewport, the system should clamp the coordinates so the entire window stays visible.

This clamping logic must also run when the viewport changes size. If the browser window becomes smaller after the position was saved, the preview should be re-positioned so it remains fully visible.

The same principle applies when the page is reopened on a different screen size. Remembered coordinates must be treated as preferences, then normalized against current available space.

A16 Note-obstruction avoidance

Avoiding obstruction of the source note is a key UX requirement. When opening the preview, the system should test whether the candidate preview rectangle overlaps the currently hovered note. If it does, the system should try another candidate placement.

If the remembered position overlaps the hovered note, the system should attempt to shift the preview to another nearby legal position rather than stubbornly respecting the remembered location.

This is not a hard ban in impossible situations, but it is a strong preference. The system should actively try to avoid blocking the note. The user should still be able to inspect the note while the preview is visible.

A17 Conflict resolution between remembered position and note avoidance

This is the main rule that needs explicit clarification. The preview should remember the user's chosen position, but that memory should not override usability in the current moment.

The proper policy is this: use the remembered position first, then validate it. If it is fully visible and does not meaningfully obstruct the source note, use it. If it fails either test, compute the nearest acceptable adjusted position that keeps the window on-screen and reduces or eliminates obstruction.

The remembered position is therefore persistent but conditional.

A18 Window chrome requirements

The preview chrome should contain at least a close control and an open-in-new-tab control. The close control should immediately dismiss the preview. The open-in-new-tab control should open the current preview URL as a normal new tab destination.

The close affordance should be obvious and easy to target. The open-in-new-tab action should be discoverable but secondary. The title bar may optionally show a simplified host name or label if available, but the first version does not need complex title management.

Do not overload the window chrome with many controls. This is a glance tool, not a mini-browser.

A19 Window body requirements

The body of the preview window should be almost entirely occupied by the iframe. The iframe should fill the available interior width and height beneath the chrome. There should not be decorative internal padding that wastes viewing area.

The preview does not need browser-style navigation controls beyond open-in-new-tab. It is not intended to become a fully interactive browsing environment. It is a quick embedded glance surface.

The iframe should inherit the window frame dimensions and remain clipped cleanly within the preview shell.

A20 Transparency and material treatment

A small amount of window transparency is acceptable and fits the visual direction, but it must be restrained. The preview should not become hard to read or produce layered visual confusion with the board behind it.

The window frame may have slight translucency. The iframe content area itself should remain visually solid enough to be readable. Excessive transparency would make the preview content compete with the board texture and note colors underneath.

The preview should also cast a controlled shadow so it reads as floating above the board. That shadow should not be so large or blurred that it causes a noticeable performance penalty.

A21 Opening and closing behavior

The preview should open only after the hover delay and successful hidden load check. It should close when the user explicitly closes it, when the triggering interaction is no longer relevant and the preview was not pinned by continued interaction, or when the user leaves the note and the preview entirely in a way that indicates abandonment.

Because the preview is draggable and interactive, the closing model must be careful. If the user moves from the note into the preview window, the preview should remain open. It should not vanish merely because the original note hover ended. Once the user is interacting with the preview, it becomes its own temporary focus surface.

A good policy is to allow the preview to stay open while the pointer is over the note or the preview, and close after a short grace delay when neither is true, unless explicitly pinned in a later version. The first version does not need a dedicated pin feature unless desired later.

A22 Desktop hover stability

Hover-triggered UI can become fragile if it flickers while the user moves the pointer between the source note and the preview. The implementation should include a small tolerance or grace period so that crossing the gap between them does not immediately destroy the preview.

This is especially important because the preview is intentionally placed near but not touching the note. The system should behave as though note and preview belong to one temporary hover cluster.

The user should be able to move into the window without fighting the timing model.

A23 Performance and restraint

This feature can become heavy if implemented carelessly. It adds iframe loading, draggable floating UI, positioning logic, and possible animation. The implementation must remain restrained.

Only one preview window should exist at a time. Do not create multiple live previews. Do not pre-create large hidden iframes for many notes. The system should manage a single reusable preview window instance that updates target content as needed.

The window movement and fade should be lightweight. Avoid expensive visual effects or continuous recalculation loops.

A24 Security and browser-reality considerations

The implementation must accept that many sites will not load in iframes due to browser security headers or embedding policies. This is not a bug in the page. The specification explicitly treats preview as opportunistic.

Do not try to bypass embedding restrictions. If the site does not allow iframe embedding, simply do not show the preview. The user can still open the link normally in a new tab.

The system should also avoid assuming full introspection into iframe content, because cross-origin restrictions limit what can be detected once the page is loaded.

A25 Suggested content-source rule

Each note should explicitly identify one preview-eligible primary URL. This should not be inferred only from whichever link appears first visually unless the note markup contract guarantees that the first link is always primary.

The best approach is to define the primary preview source semantically in the note markup. That will make the behavior predictable and maintainable when the HTML is edited manually later.

If no primary preview URL is provided, the note should not participate in preview behavior.

A26 Responsive disablement behavior

On mobile and constrained layouts, preview behavior should be fully disabled rather than partially degraded. Do not attempt a smaller floating preview for narrow screens. That would likely obstruct the page and create poor interaction.

The standard mobile behavior should remain direct navigation through normal links and explicit open actions. The floating preview is a desktop enhancement only.

If the viewport transitions from desktop to constrained size while a preview is open, the preview should close and remain disabled.

A27 Accessibility and usability considerations

Because this is hover-first behavior, it is inherently desktop-oriented and pointer-oriented. The interface must not make core functionality depend on it. All destinations must remain reachable through ordinary link interactions.

The preview controls must be keyboard reachable if the preview is open. The close action and open-in-new-tab action should be focusable and operable. The dragging behavior does not need a complex keyboard equivalent in the first version because dragging is convenience, not core access, but the feature must not trap keyboard focus.

If reduced-motion preferences are present, the preview should appear and disappear with reduced or no animation.

A28 Failure and edge-case behavior

If the preview target is slow, the system should not reveal a large blank window too quickly. The hidden-load-first requirement should protect against this. If the target never becomes eligible within a reasonable time, abort preview display.

If the remembered position becomes invalid due to viewport changes, clamp it.

If the preferred position and all good alternatives still overlap the note substantially, choose the least obstructive visible position and preserve usability of the close control and note as much as possible.

If the note has no previewable URL, do nothing.

A29 Recommended implementation direction

The cleanest implementation is a single shared floating preview controller attached to the page. It should manage one reusable preview window element, one iframe, one stored preferred position, one active source note, and one active URL.

On hover of a preview-enabled note, the controller should start the delayed preview workflow. If the target becomes eligible, it should compute position, validate remembered coordinates, avoid covering the note where possible, clamp to viewport, and then reveal the window.

Dragging should update and persist the position. Closing should hide the window without destroying the controller. Reuse is preferable to repeated creation and removal of DOM structures.

A30 Self-verification checklist for Codex

Verify that the preview feature is disabled on small or touch-oriented layouts.

Verify that hovering a note does not instantly show a preview and that an intentional delay is present.

Verify that the preview is sourced from the note's primary designated URL.

Verify that the system attempts to load the target before showing the window.

Verify that blocked or non-embeddable sites do not produce a visible empty or broken preview window.

Verify that the preview appears with a restrained fade-in and not with a large or distracting motion effect.

Verify that the preview window visually fits the board's aesthetic without being mistaken for another sticky note.

Verify that the window includes a close control and an open-in-new-tab control.

Verify that the iframe fills the usable body area of the window.

Verify that the window is draggable by its frame and not resizable.

Verify that the window position is remembered across uses.

Verify that remembered position is clamped to the current viewport and never leaves the window partially off-screen.

Verify that when the remembered position would cover the hovered note, the system repositions the preview to reduce or remove the overlap.

Verify that the preview generally appears near the hovered note but not on top of it.

Verify that moving the pointer from the note into the preview does not immediately dismiss the preview.

Verify that only one preview window can exist at a time.

Verify that the feature does not materially degrade scroll smoothness or interaction performance.

Verify that reduced-motion settings reduce or remove preview animation.

Verify that the page remains fully usable without the preview feature.

A31 Final design stance

The correct version of this feature should feel like a polite desktop convenience layered onto the board, not like a pop-up gimmick. It should be slow enough to avoid accidental activation, smart enough to avoid blocking the note, stable enough to remember where the user wants it, and restrained enough to feel integrated with the page rather than competing with it.
