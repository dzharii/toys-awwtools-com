XA00 Theme inversion and rendering isolation note for Codex

The tool window must support two operating-system-inspired themes: a Windows XP-inspired utility window theme and a macOS-inspired utility window theme.

Use inverted platform defaults on desktop. When the browser is running on macOS, the default theme must be the Windows XP-inspired theme. When the browser is running on Windows or Linux, the default theme must be the macOS-inspired theme.

This is a desktop rule. Do not treat iPhone or other mobile platforms as part of this desktop theme switch. The desktop target platforms are macOS, Windows, and Linux.

The intent is deliberate. The bookmarklet window should feel like a compact operating-system utility window, but with the opposite platform theme by default. This theme behavior must be explicit in the implementation and not left to guesswork.

B00 Shadow DOM requirement

Render the entire bookmarklet UI inside a shadow root.

Create a single host element in the page, attach a shadow root to it, and render all bookmarklet UI markup and styles inside that shadow root. All CSS for the tool window, controls, lists, inputs, buttons, dropdowns, inspector panes, resize handles, and footer must live inside the shadow root.

Do not rely on page CSS. Do not allow page CSS to style the bookmarklet UI. Do not leak bookmarklet CSS into the page.

The shadow root is required for both rendering isolation and style isolation. This is not optional.



A00 Operating-system-style window in bookmarklet context

The window should feel like a real utility window that was placed on top of the page, not like a web card floating in random space. That means the user should immediately recognize a window frame, a title bar, a content area, resize affordances, a clear active state, and predictable control placement. The visual grammar should come from desktop utility applications, but adapted to the constraints of a bookmarklet running inside an arbitrary web page.

In this context, the window is not the page. It is a temporary tool surface that helps inspect the page. Because of that, it should remain compact, movable, resizable, visually stable, and independent from page styling. It should always read as "tool over page", not "new page inside page".

B00 Window role and behavioral identity

The window should behave like a small inspector utility, somewhere between a DevTools panel and a finder/search utility. It is not a document editor. It is not a wizard. It is not a modal dialog. The user should be able to keep it open while still seeing and interacting with the underlying page.

That means the window must support three simultaneous truths. It must be visually present enough to be usable. It must not dominate the page. It must not steal too much attention when the user is looking at page elements. The design should therefore aim for dense but calm. It should be crisp, restrained, and technical.

C00 Placement and initial size

The default position should be near a screen edge, preferably top-right or top-left depending on available space and overlay conflicts. The initial position should avoid covering the center of the page because the center is often where the user is inspecting content.

The default size should feel like a utility inspector. A good starting point is roughly 460 to 540 pixels wide and 620 to 760 pixels tall on a typical desktop viewport. On smaller screens, the window should clamp itself within the viewport with margins. It should never render partially unreachable on first mount.

The window should maintain a small gap from the viewport edges so it feels placed intentionally rather than glued to the browser edge. That margin also helps the window shadow remain visible and keeps the tool separate from the host page.

D00 Outer frame and silhouette

The outer silhouette should clearly read as a contained window. It should have a single continuous frame, controlled corner radius, one shadow system, and one border system. The border and shadow should be subtle but real. Avoid decorative gradients, playful pastel fills, oversized radii, or card-stack visual language.

The frame should be strong enough to separate the tool from a noisy page background. On dark pages, the window must still have a crisp edge. On light pages, it must not disappear into the page. This is why the border and shadow system should be explicit rather than relying only on background contrast.

The frame should include visual states for active and inactive interaction. When the user is dragging, resizing, or typing into the tool, the window should look active. When the pointer is working on the underlying page, the active emphasis can soften slightly, but the window should remain readable.

E00 Title bar

The title bar is the identity anchor of the whole UI. It should be the first thing the user recognizes. It should be visually distinct from the body, but not oversized.

The title bar should contain the window title on the left and window controls on the right, following desktop utility conventions. The title text should be short and stable, for example "Page Object Recorder". A smaller subtitle can optionally appear below or beside it to show page state, selected object count, or current mode, but only if it remains compact.

The title bar height should be small and controlled. It should be tall enough to drag comfortably, but not so tall that it wastes vertical space. Something in the range of a compact desktop toolbar is appropriate. The title bar must be draggable across its empty surface, but dragging should not start when the user interacts with buttons, fields, tabs, or search inputs inside it.

The title bar should visually signal whether the window is movable and resizable. The user should not have to guess that it behaves like a real window.

F00 Window controls

The window controls should behave like utility window controls, not generic web buttons. They should be small, consistent, and visually secondary to the inspection content.

At minimum, include close. It is also reasonable to include collapse or compact mode if that is already supported. Avoid adding many controls in the title bar. The title bar is not the place for primary work actions like export or scan unless space is extremely constrained.

Close should always be immediately visible. It should not require opening a menu. The control should be small but easy to hit. Its visual style should be consistent with the chosen theme.

G00 Resizing affordances

If the window is described as operating-system-like, resizing must be explicit and solid. The user should be able to resize from edges and corners. Even if the resize handles are visually subtle, the cursor feedback must be correct and immediate.

The resize system should use invisible but generous hit zones on the outer edges, with corner priority when the pointer is near two edges at once. These hit zones should not interfere with internal content interaction. The actual visible edge can remain thin, but the effective drag target should be larger.

The window should enforce minimum size based on layout requirements. Minimum width should still allow a readable selector field and the basic inspector controls. Minimum height should still allow title bar, current object summary, selector field, and basic actions. The window should also clamp against the viewport so the user cannot lose the whole frame off-screen.

H00 Inner layout model

Inside the frame, the layout should be divided into clear structural layers. The best mental model is title bar, mode bar, main body, and footer.

The mode bar sits below the title bar and holds primary tool actions such as scan, select element, select area, and perhaps a compact indicator of active mode. This row should look like a toolbar, not like a form.

The main body is the working area. It should scroll internally. It contains the selected objects list and the inspector area, or a split view depending on available size. The footer holds export-related actions and status, and should remain stable in position.

The entire window should use a vertical layout system where only the main body scrolls. The title bar, mode bar, and footer should remain fixed within the window. This is one of the biggest differences between a usable tool window and an unstructured web panel.

I00 Single-column versus split layout

The layout should adapt between two modes depending on width. In narrower widths, use a single-column stacked layout. In wider widths, allow a split layout.

The narrow layout should stack sections in a logical order: selected objects first, then inspector details, then selector controls, then export. This ensures the user can still work in constrained space.

The wider layout should split the main body into two panes. The left pane should contain selected objects and candidate lists. The right pane should contain details for the currently focused object. This mirrors desktop inspector tools and gives better scanning speed. The split should be resizable if practical, but that is secondary to getting the basic window resize correct.

J00 Content zones and hierarchy

The visual hierarchy should communicate three levels of information. Global tool state, current selection state, and detailed selector state.

Global tool state includes current mode, whether the tool is idle or selecting, how many objects are selected, and whether the page was scanned. This belongs near the top because it orients the user.

Current selection state includes the selected object name, inferred type, confidence, and parent-child context. This should be the first block in the inspector pane because the user needs to know what they are editing.

Detailed selector state includes heuristic picker, editable selector field, test result, alternate selector candidates, and explanation. This is the most important working area, so it should be dense, stable, and visually tidy.

K00 Toolbar design

The toolbar should look like an operating-system utility toolbar: compact, horizontal, and action-focused.

Primary actions should be few. Scan, select element, select area, and maybe stop/cancel are the right level. Do not overload the toolbar with every secondary action.

The toolbar buttons should be sized consistently and grouped logically. Selection actions belong together. Scan and refresh belong together. Export should not be in the same visual group as selection because export is an outcome, not a mode.

The active selection mode should be visibly latched. When select element or select area is active, the user should see that immediately in the toolbar and in the page cursor.

L00 Selected objects list

The selected objects list should behave like a navigator. It should not be an uncontrolled series of expanding cards that redefine the window size.

Each row should present the object name, kind, inferred type, and confidence in compact form. Long names must be truncated in-row with ellipsis. Full names can appear on hover or in the details pane. The row height should be consistent.

The selected object list should support keyboard focus and pointer selection. The selected row should have a clear active state. If objects are hierarchical, indentation can be used, but keep it shallow and visually restrained.

The list should scroll independently if needed. A very long list must not push the inspector panel out of view.

M00 Inspector pane

The inspector pane is the main workbench. It should read like a property inspector, not like a random stack of form controls.

At the top, show a compact object header. This includes the object name, kind, inferred type, confidence score, and perhaps a tiny path summary such as "inside composer" or "collection item". This area should be stable in height.

Below that, show the heuristic selection block. Below that, show the editable selector block. Below that, show the test result and alternate selectors. Below that, show metadata or explanation. This order matters because it follows the user workflow: identify object, choose strategy, inspect selector, test it, compare alternatives.

Each sub-block should be visually separated by spacing and optional section labels, but avoid heavy cards inside cards. The inspector should feel dense and ordered, not boxed into many nested containers.

N00 Heuristic control design

The heuristic control should look like a proper compact picker. It should not stretch because of long heuristic names.

The closed control should show the active heuristic label in one line, clipped if needed. The full description belongs in the expanded list or a small helper area below.

When expanded, the heuristic list should appear as an anchored dropdown or popover inside the tool window. It should not resize the whole layout dramatically. The list should include a search field at the top and scroll internally if long.

Each option should show a short label and a very short description. The selected option should be clearly marked. Keyboard navigation should work if practical. This control should feel closer to a desktop inspector dropdown than to a large web select replacement.

O00 Selector field design

The selector field is critical. It should be treated like an editable code field, not a normal text input.

Use a monospace font. Use controlled padding. Use a single-line field for normal cases, but allow horizontal scrolling within the field. The field should not force the whole panel to scroll horizontally.

If selectors become very long, the field may optionally expand into a multi-line editor mode, but the default should remain compact. This editor should still preserve readability and precise cursor movement. The field should support manual editing without visual chaos.

The selector label, current heuristic, and selector type should be nearby. The user should not have to search the UI to understand what they are editing.

P00 Selector test area

The selector test area should behave like a small results console. After the user presses test, the result should appear close to the field and with low friction.

Show match count prominently. Also show scope, such as document-level or region-scoped. If the selector matches many items, indicate whether that is expected for a collection or a warning for a singleton.

Result tone should be informative, not decorative. Use restrained status styling. A successful unique match should read as quiet confirmation. A zero-match or over-broad match should read as a clear warning.

Q00 Alternate selector candidates

Alternate selector candidates should be shown in a compact ordered list beneath the main selector. Each row should include the selector type, the generated selector in clipped or scrollable monospace form, the score, and a short explanation.

Do not show all alternatives at equal visual weight. The preferred selector must remain visually dominant. Alternatives are for inspection, correction, and trust-building.

Each alternative should be selectable so the user can promote it to the main selector if desired. Promotion should be one click and should update the editable field immediately.

R00 Footer and export area

The footer should remain fixed within the window and should feel like the bottom action strip of a utility dialog.

Export is important, but it should not visually dominate the whole interface. The footer should contain export JSON, copy, perhaps clear selection, and possibly a compact status line showing clipboard success or validation state.

The footer should not grow unpredictably. Keep it one stable band. If export previews are needed, open them in the main body or a dedicated preview surface, not by expanding the footer endlessly.

S00 Typography

Typography should be restrained and utility-oriented. Use a system UI font for general interface text and a monospace font for selectors, JSON fragments, and technical metadata.

Use clear hierarchy through size and weight, but keep the range narrow. Large decorative headings are inappropriate. The window should feel like a compact tool where information density matters.

Labels should be short and plain. Avoid marketing language, decorative labels, or chatty text. The UI should sound like a utility built by someone who expects the user to work quickly.

T00 Spacing and density

Spacing should be deliberate and tight. Operating-system-like utility windows are not airy landing pages. They are compact and precise.

Use a consistent spacing scale and keep gaps small but readable. Controls that belong together should sit close together. Independent sections should have slightly larger separation. This is how the window reads as one coherent instrument instead of a stack of unrelated blocks.

Avoid large empty vertical gaps. Avoid big padded cards. Avoid over-rounding and excessive shadows. Most of the visual quality here comes from alignment, proportion, and constraint.

U00 Color and contrast

Color should serve structure, not decoration. The title bar, body background, borders, fields, and selected states should have a carefully controlled neutral palette. Accent color should be used sparingly for focus, selected mode, and active controls.

The window must remain legible over arbitrary page backgrounds. That means the frame, title bar, and fields need enough contrast regardless of whether the host page is dark, bright, busy, or image-heavy.

Theme colors should live behind CSS variables inside the shadow root. The two required themes should differ in tone and structure, but both should feel like serious utility interfaces.

V00 Theme interpretation inside bookmarklet

Because this is inside a bookmarklet, the theme should not feel like a full operating-system simulation. It should feel like an inspired utility window with strong OS references.

The macOS-inspired version should emphasize calm neutral surfaces, subtle title-bar treatment, rounded but controlled geometry, gentle shadow, and polished small controls. The Windows XP-inspired version should emphasize stronger frame contrast, a more pronounced title bar, tighter grouped sections, and a slightly more mechanical feel.

The theme switch should affect only the tool window and overlays owned by the tool. The host page must remain untouched.

W00 Motion and transitions

Motion should be minimal and functional. A small amount of easing is acceptable when opening dropdowns, showing popovers, or highlighting selection changes. Window drag and resize should feel immediate and direct, not animated.

Do not animate everything. Do not fade large surfaces dramatically. Do not add ornamental transitions. This is a utility window, so responsiveness is more important than flair.

Selection highlights on the page may animate lightly for clarity, but the tool window itself should remain steady.

X00 Shadow DOM and style containment

Because the window lives inside arbitrary pages, Shadow DOM is not optional from a UX standpoint. It protects the window from host styles and protects the page from tool styles.

The window root should include all structural styles, component styles, theme variables, focus states, and typography. The tool should establish its own baseline inside the shadow root: box sizing, font family, font smoothing, line height, control normalization, and overflow rules.

This isolation is part of the UX. A window that randomly breaks because the page applies `button { all: unset; }` or `font-size: 24px` is not a real tool window.

Y00 Page relationship and obstruction control

The tool window must respect the page underneath. It should not block too much of the content the user is inspecting. That is why the window should default to an edge position and maintain a compact footprint.

The selection overlays on the page should be visually distinct from the window itself. The window should act as the command surface. The page overlays should act as direct visual feedback. The two should not compete.

If the window covers an important area, the user should be able to drag it away easily. Compact mode can be considered later, but drag and resize are the first answer.

Z00 Human quality requirement

The strongest interpretation of "similar to an operating system window" is not visual imitation alone. It is behavioral discipline. The window must feel deliberate, proportioned, calm, dense, and unsurprising. Every control should appear where a user expects it. Every section should maintain its bounds. Long content should stay inside its own fields. The frame should not wobble because one row is too long. The toolbar should not look like a web form. The whole thing should look like a tool somebody would actually keep open while working.

AA00 Practical layout summary

The final mental model should be this. A floating utility window with a draggable title bar sits near the edge of the page. Below the title bar is a compact toolbar for scan and selection modes. The body is an internally scrolling inspector with a navigator pane and a detail pane, or a stacked version of those on narrow widths. The footer holds export and status. The whole window is resizable, themeable, shadow-root-contained, and robust against long technical strings.

That is what "operating-system-style window" should mean in this bookmarklet.


