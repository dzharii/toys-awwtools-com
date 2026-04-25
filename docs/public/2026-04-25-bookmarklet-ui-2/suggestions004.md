2026-04-19
A00. UI and UX design specification

This document defines the visual and interaction language of the AWW Bookmarklet UI Framework. It is a separate specification from the architecture and performance documents. Its purpose is to describe, in concrete and unmistakable terms, what the interface looks like, how it feels, how its parts relate to one another, and how the user understands and uses it.

The framework is not meant to resemble a modern web application's anonymous card system. It is meant to feel like a small, deliberate instrument panel that has been set down on top of the page. It is distinct from the page beneath it. It is self-contained. It is calm. It is clearly mechanical in structure, but not crude. It is familiar in the way an old utility window is familiar: title bar, menu bar, framed body, grouped controls, visible states, stable edges, no mystery about what can be clicked and what cannot.

Its ancestry is Windows 3.x, but it does not imitate that world so literally that it becomes costume. It takes the old grammar - framed surfaces, square geometry, menus that read like commands, buttons that look pressable, groups that explain themselves by how they are bordered - and translates that grammar into a restrained modern material. The result should feel like an old tool remade with contemporary materials: the same shape of thought, cleaner glass, steadier paint, more air, more legibility, less visual noise.

B00. First visual impression

When a user first sees one of these bookmarklet windows, the impression should be immediate and unmistakable. It is not a panel melted into the page. It is not a floating website card. It is a window, and it knows it is a window.

It sits above the page with a crisp outer border and a measured shadow that separates it from the content behind it without making it hover theatrically. Its outline is firm. The corners are square or nearly square. Its title bar reads as the top rail of a tool rather than as decoration. The body beneath it is lighter, flatter, quieter. The entire object is compact and self-possessed, with every surface carrying a function.

The page beneath it should still be visible as the world in which the tool has appeared, but the window should establish its own atmosphere at once. It should feel like a portable workspace laid over the document: temporary in origin, durable in presence.

C00. Shape and structure

The interface is built from rectangles, lines, and measured separations. The primary geometry is square. Curves are not a defining part of the system. If any radius appears at all, it is so slight that it reads as finishing tolerance rather than style. A user should perceive the framework as cut, framed, and assembled, not poured.

The window is organized in stacked bands. At the top is the title bar. Beneath that may sit the menu bar. Beneath that may sit a toolbar or command strip. Then comes the main body, where the actual work of the bookmarklet happens. At the bottom may sit a status bar. These bands are not arbitrary stripes. Each one has a distinct role, and the transition from one to the next is marked by a subtle border or rule so the eye can read the structure without effort.

This layered order matters. It gives the user orientation. Commands live near the top. Content occupies the center. Status settles at the bottom. The window should be readable from its skeleton alone.

D00. Color language

The color language should be restrained, practical, and precise. It should not depend on bright chroma for personality. The framework should feel painted in utility colors: pale mineral surfaces, washed steel blues, soft grays, quiet whites, and dark graphite borders. The accent color belongs primarily to active state, focus, selection, and certain title-bar conditions.

The default body surface should be a very light cool neutral, close to a misted off-white with a faint blue-gray cast. A good body color is in the family of `#EEF1F5` to `#F4F6F8`. It should feel cleaner than old desktop gray, but not stark like a modern blank web canvas. Panels inside the body may shift slightly lighter or slightly more opaque, such as `#F8FAFC` or a carefully softened translucent white if layered over page content.

Borders should be dark enough to articulate structure without looking black. A primary border in the family of `#232A33` works well for outer framing and important control edges. Secondary borders may sit closer to `#9BA5B3`, where they separate regions and organize content more gently.

The active title bar should be the strongest colored surface in the shell. It should suggest a deep washed blue, not a saturated jewel. A value in the family of `rgba(46, 92, 142, 0.78)` gives the right balance: blue enough to signal activity, soft enough to feel material rather than flat paint. The inactive title bar should recede into a cooler gray-blue, something like `rgba(136, 145, 160, 0.84)`. Active title text should be near-white, such as `#F8FBFF`, and should remain sharply legible.

Selection color should be stronger and more definite than the title bar. It should communicate state without hesitation. A selection blue in the family of `#1F5EAE` with light foreground text is appropriate. Focus indication may use a similar hue, perhaps a touch brighter or clearer, such as `#154FBC`, so that keyboard navigation remains visible and intentional.

The status bar should be quieter than the body, but not darker. It may use a muted light gray-blue, such as `#E5E8EE`, so that it is perceived as a footer surface, not as content.

E00. Material and light

The title bar is the one place where the framework is allowed to admit a modern material effect. It may behave like a narrow strip of frosted lacquered glass laid over the page, carrying the title and commands while allowing just enough of the world behind it to be felt. This should not be theatrical translucency. It should be controlled, faintly luminous, and practical.

The blur should be narrow in scope and low in drama. The user should never think "glassmorphism." The user should think, if they think about it at all, that the title bar is made of a slightly translucent material that catches light. A faint inner highlight along the upper edge may help. A slight vertical gradient can suggest surface and direction without becoming glossy.

The body of the window should not compete with the title bar. It should be mostly opaque and steady. Users perform their work there. Clarity matters more than atmosphere. The body is the desk. The title bar is the rail.

Shadows should be modest and structural. The main window shadow should place the object above the page without making it float like a modal card in a modern dashboard. A shadow such as `0 12px 32px rgba(0,0,0,0.18)` is enough for separation. Menus may use a similar but slightly tighter shadow. Shadows should not stack in layers of fog.

F00. Typography

Typography should be practical and unobtrusive. The system default should be a modern system UI stack. The text should look like it belongs to the machine the user is already on. This avoids fake nostalgia and improves readability across platforms.

The base size should be compact. Thirteen pixels for most internal UI text is appropriate. It keeps the framework efficient and tool-like without becoming cramped. Title text may be slightly heavier rather than larger. Buttons, menus, labels, tabs, and status text should all feel related, as if cut from the same sheet of type.

The title bar text should be bold enough to anchor the window, but not oversized. Menu labels should be plain, readable, and evenly spaced. Status text should be smaller in presence, but not in actual size, so that the user can glance at it without strain. The framework should never rely on tiny text to create density.

G00. The window

A window is the fundamental object of the system. It should look built, not generated. The outer edge is defined by a dark structural border. Just inside that border, a faint inner highlight or inset rule may soften the transition and give a slight impression of layered construction.

The window's title bar stretches the full width across the top. Beneath it, the menu bar reads as a distinct command surface. Beneath that, optional toolbar content may appear, though it should remain subordinate to the menu and title. The body occupies most of the interior, with generous enough padding to keep controls from colliding with the frame. The status bar, if present, closes the form.

A window should always look graspable. The user must understand instinctively that it can be moved by the title bar and resized from the edges or corners. These affordances do not need to be loudly illustrated, but the shell should suggest them through its structure. The title bar feels like a rail. The edges feel like boundaries. The corners feel like handles even when they are visually spare.

When active, the window sharpens slightly in color and presence. When inactive, it should recede but not disappear. The framework should avoid making inactive windows look disabled. Inactivity means "not current," not "not alive."

H00. The title bar

The title bar is the face of the window. It should be one compact band, approximately thirty-two pixels tall in the default shell. That height gives enough room for title text, a left-side system affordance, and right-side window commands without crowding.

On the left sits the system affordance. It may be an icon, a small symbolic control, or a compact framed button that represents the application menu. It should not be oversized. It should feel like the window's crest or latch. A single click on it opens the system or application menu. A double click closes the window. That behavior should feel old, deliberate, and satisfying rather than hidden.

The title text sits centrally and should truncate cleanly when space is tight. It does not need to be perfectly centered in mathematical terms if command buttons occupy the right and the system affordance occupies the left; what matters is optical balance. The text should not jitter, wrap, or reposition abruptly as the window changes width.

On the right are title commands, at minimum close. These commands should look like part of the title bar, not like borrowed modern icon buttons. They should be compact, framed, and tactile. Hovering them should slightly brighten their surface. Pressing them should darken and seat them.

The title bar should never become decorative clutter. It is a command rail, not an illustration.

I00. The menu bar

The menu bar is the formal command language of the framework. It should sit directly beneath the title bar, reading as a quiet strip of command headings: File, Edit, View, Help, and tool-specific equivalents. It should not be padded like a toolbar. It should be compact, ordered, and calm.

Each top-level menu trigger should appear as plain text on a shallow button-like plane. It should not look like a modern pill or tab. The user should understand that it is a heading which opens a vertical command list. On hover or focus, its surface should take on a faint button treatment: a light background shift, a border, a sense that it is ready to open. When open, it should remain visibly pressed into its menu state.

Menus themselves should drop down as framed panels with the same family resemblance as the main window: light body, dark border, slight shadow, compact line spacing, clear hover selection. Their interior should feel like a list of executable choices, not like a popover full of content.

Menu items should occupy enough height to be comfortable, approximately twenty-eight to thirty pixels tall. They should align left. Shortcut hints, if shown, should align toward the right and sit in a quieter tone until the item is selected. Separators should be thin rules, not large blank gaps.

A menu should feel quick to read. The user's eye should move from item to item with almost no friction. This requires consistent alignment, uniform padding, and selection color that is firm but not heavy.

J00. The body surface

The body of the window is where tools live. It should be padded with enough space that controls can breathe, but not so much that the shell loses its compact utility character. Twelve pixels of standard body padding is a good default. In more constrained shells it may tighten to eight.

The body is not an abstract blank canvas. It should feel like a work surface. Grouping, panel divisions, and internal sections should create understandable territory inside it. The user should be able to glance at a tool and see where inputs live, where options live, where results live, and where action buttons belong.

When a body contains many controls, the framework should encourage alignment and grouping rather than free-floating placement. Controls that belong together should sit in a grouped frame or aligned stack. Controls that represent settings should not look scattered across the floor of the window.

K00. Buttons

Buttons should look pressable in the old mechanical sense, but refined. They are not plain text links, not modern soft capsules, not giant call-to-action slabs. They are framed controls with a visible face.

The default button should have a light background in the same family as the window body, slightly differentiated so it can be read as a control surface. A restrained highlight from top to bottom can suggest that the surface catches light. Its border should be dark enough to define shape. A faint inner highlight may suggest that the face sits above the frame.

The default minimum height should be around thirty pixels. The minimum width should be enough that short labels do not feel cramped, around seventy-two pixels is reasonable. Horizontal padding should be generous enough that a single word does not crowd the border.

On hover, the face should brighten slightly or shift toward a cleaner white. On active press, the face should darken and appear to settle inward. This can be achieved by changing the background and reversing the sense of the inset highlight. The effect should be subtle but unmistakable. The user's finger or cursor should feel answered.

On keyboard focus, the button should receive a clean focus ring or inset highlight that is visible and direct. It should not rely on the hover treatment. On disabled state, the button should remain legible but subdued. It should not disappear into gray fog. The user should be able to tell what it is, even if it cannot be used.

Primary actions should not be made by inventing an entirely different button species. If emphasis is needed, it should come through placement, grouping, or a slightly stronger background tint rather than through modern loud accent fills. This framework values order over shout.

L00. Icon buttons

Icon buttons are the compact siblings of text buttons. They should share the same construction language: framed edge, light face, slight inner highlight, clear press response. Their shape should be square, approximately thirty by thirty pixels by default, and their icon should sit centered and balanced.

Icons should be simple, geometric, and cleanly drawn. They should resemble utility icons, not decorative illustrations. A line weight around one and a half pixels works well for small monochrome SVG marks. The icon should inherit the current color and should remain crisp at common zoom levels.

Icon buttons should be used where the action is widely understood or where the surrounding context makes the meaning clear. They should not become a replacement for clear labels in ambiguous contexts.

M00. Text inputs

A text input should look like an inset field cut into the surface. It should be lighter than the surrounding panel and should read as a place where text can be entered, selected, and edited. The border should be dark and clear. The face should be white or near-white, with a slight inner shadow or inset line to distinguish it from raised controls like buttons.

The default input height should match the vertical rhythm of the button family, around thirty pixels. Padding inside the field should give the text room to breathe. Placeholder text should be quieter than entered text but still legible.

On focus, the field should take a direct focus outline or accent border. The user must be able to tell at once that the cursor is there. Selection inside the field should use the framework's standard selection blue. Disabled fields should remain readable but softened.

The important thing about inputs in this system is that they should feel like working instruments. They are not floating underline fields or invisible modern text areas. They are framed places where information is entered and held.

N00. Textareas

A textarea should follow the same inset logic as a text input, but with a larger field of use. It should feel like a writing pane set into the window body. It may be resizable vertically if that supports the tool, but that resize behavior should not visually conflict with the outer window's own resize language.

Padding inside the textarea should support reading and editing longer notes. The field should be comfortable for multi-line text, with no cramped edges. Focus and selection behavior should match the input field.

When placed in a tool, a textarea should usually occupy a grouped section or panel rather than floating among unrelated controls. It is large enough to become a visual center of gravity.

O00. Checkboxes

A checkbox should be a small framed square with a clear edge and a plain interior when unchecked. It should sit beside a label, aligned so that the pair reads as one line of meaning. The box itself should be around thirteen pixels square in the stricter retro tradition or slightly larger if needed for comfort, but it should remain compact and precise.

When checked, the mark inside should be clear and simple. It may be a tick, a diagonal mark, or another appropriate symbol, but it should look deliberate, not hand-drawn. The mark should be dark and confident against the light field.

On focus, the checkbox and its label should read as the active target together. On disabled state, the label and box may soften, but the checked state should remain discernible.

Checkboxes are well suited for settings that can coexist independently. They should usually be grouped vertically with even spacing. Related checkboxes should not be scattered; they should appear as a cluster inside a shared group so the user understands their domain.

P00. Radio buttons

Radio buttons should feel like a close relative of the checkbox, but their circular form should communicate exclusivity. The outer ring should be crisp. The selected state should be indicated by a filled central dot, dark and centered, neither tiny nor oversized.

Like checkboxes, radio buttons belong with labels, and like checkboxes, they should usually be grouped. Their grouping is even more important because radios define one choice among several. The user should be able to read the group as a little field of alternatives.

Spacing should keep them distinct but compact. A radio group should look like a short declarative list, not a cloud of options.

Q00. Select fields and dropdowns

A select field should look like a text input joined to a compact command button. The field portion displays the current choice. The right side carries the dropdown affordance, typically a small framed segment with a downward indicator. This should resemble a built-in mechanical part of the control, not a separate detached icon.

The field itself should be inset like an input, but the dropdown segment may be slightly raised or framed differently to communicate pressability. When the control is active, the field and its arrow segment should still feel like one machine.

The open menu for a select should resemble the menu family of the framework: framed, light, compact, and clearly selectable.

R00. Tabs

Tabs should feel like file dividers or index cards seated along the top edge of a content frame. They should not be glossy segmented controls. The selected tab should appear joined to the content beneath it, while inactive tabs should appear adjacent and slightly recessed.

Their height should be modest, around twenty-eight pixels. Their border should be clear. The selected tab should rise visually into the panel surface by sharing its background or by seeming to interrupt the dividing line beneath it. Inactive tabs should remain readable but slightly flatter.

A tab strip should not become overcrowded. If there are too many tabs, another navigational pattern should be preferred. Tabs are for a small number of parallel views within the same working area.

The transition between tabs should be immediate and quiet. Content changes, the selected tab changes, and the user understands the new state without theatrical motion.

S00. Listboxes and lists

A listbox should look like a bordered interior surface, similar to an input field enlarged into a vertical browsing area. Its items should stack in a clear sequence. Each item should have enough height to be easily targeted, with a compact but comfortable vertical rhythm.

Unselected items should sit plainly in the list. A selected item should take on the framework's selection color, with clear foreground contrast. Focus should be visible. Keyboard movement should feel natural and expected: a visible march of selection through the list.

The listbox should feel useful for choosing, browsing, and reviewing options. It should not feel ornamental. When items include icons or richer content, the layout should still remain highly structured. A list is not a miniature card gallery in this framework. It is a disciplined column of choices.

T00. Status bars

The status bar is a narrow footer of information. It should sit at the bottom of the window like a quiet ledger strip. Its segments may be divided by subtle borders. Each segment should feel like a small inset panel carrying useful information: status text, count, mode, state, version, connection, or progress.

The status bar should never draw more attention than the body. Its role is to be present and available at a glance. It belongs to the tradition of tools that tell the user what state they are in without making ceremony of it.

U00. Group elements

The framework should include a group element. This is important. It is one of the strongest compositional tools inherited from old desktop UI, and it solves many layout problems cleanly.

A group element is a bordered or framed section that gathers related controls beneath a shared caption or visual heading. It tells the user, "These things belong together." It reduces the need for excess explanatory text. It creates local order.

Visually, the group should be a recessed or lightly framed rectangle with a title that either interrupts the top border or sits just above the frame. The frame should be lighter and quieter than the outer window border, because it is an interior organizing device, not a shell. The title should be plain and clear. The interior should have enough padding that controls do not touch the frame.

A group can contain a cluster of checkboxes, a radio set, an option field with related buttons, a compact form, or a result area. It can solve common UI problems such as organizing settings into categories, pairing inputs with their actions, separating destructive actions from normal actions, or presenting several controls that act on one concept.

For example, in a bookmarklet that automates page behavior, one group may contain "Selection Options" with checkboxes and radio buttons. Another group may contain "Output" with a textarea or results list. Another may contain "Actions" with buttons. Without these groups, the same controls would appear scattered and less understandable.

The group element should be one of the framework's default compositional primitives.

V00. Panels and subpanels

In addition to groups, the framework may use panel surfaces for slightly larger interior organization. A panel is broader and more architectural than a group. It may contain a full cluster of content, perhaps with its own toolbar or header line. Panels should feel like interior work trays or compartments inside the larger window.

Panels should usually use a slightly distinct surface tone from the main body and a quiet border. They should not become visually competitive with the window itself. Their purpose is to break a larger tool into readable working regions.

W00. Layout rhythm

Spacing in the framework should be consistent and modest. The rhythm should feel compact, orderly, and repeatable. Four pixels may serve as the smallest spacing unit, eight pixels as the main interior gap, and twelve pixels as the roomier section spacing. This creates a predictable cadence.

The user should never feel that controls are either cramped or drifting too far apart. Alignment matters. Labels, fields, buttons, and groups should line up where possible. The framework should reward grids, stacked flows, and aligned baselines. It should discourage arbitrary free placement.

X00. Interaction language

Every interactive element should answer the user clearly. Hover should suggest readiness. Focus should indicate keyboard ownership. Active press should feel like a physical response. Disabled state should indicate unavailability without erasing identity.

The framework should be emotionally neutral in its interactions. It should not bounce, shimmer, or animate in a way that calls attention to itself. State changes should be immediate and readable. The user should feel precision rather than flourish.

Dragging a window should feel firm and direct. The title bar is grasped, the window follows. Resizing should feel controlled. Menus should open quickly and align cleanly beneath their headings. Buttons should depress. Checkboxes should mark decisively. Tabs should switch without uncertainty.

Y00. Focus and keyboard presence

The framework should visibly respect keyboard use. A user moving through controls with the keyboard should never lose their place. Focus indication should be clean, colored, and unmistakable. It may be an outline, an inset line, or another direct accent treatment, but it must not be so subtle that it disappears against the pale surfaces of the system.

Keyboard focus should feel native to the interface, not bolted on afterward. Menus, tabs, listboxes, buttons, and fields should all show that they can be traversed, selected, opened, and used without a pointer.

Z00. Inactive and disabled states

Inactive windows should not become dull ruins of themselves. They should soften. The title bar should cool. The body may lose a touch of saturation or brightness, but the shell should still look like a living object waiting its turn. The user must still be able to identify which window it is and what it contains.

Disabled controls should remain visible as members of the interface. Their labels should not vanish into low-contrast fog. The system should avoid the common failure of making disabled things unreadable. The user's understanding matters even when action is unavailable.

AA00. How elements fit together

The strength of this framework comes not only from the design of each element in isolation, but from the way they sit together without argument. A title bar, menu bar, group box, input field, checkbox cluster, and action button should all look as though they belong to one workshop.

The outer shell is strongest. Interior groups are lighter. Controls sit within those groups. Buttons answer to fields. Labels explain controls. Status settles at the bottom. The eye moves from broad structure to fine interaction naturally.

A good tool built with this framework should look legible before the user reads a word. Its structure should already explain much of its purpose.

AB00. Example composition

Imagine a medium-sized bookmarklet window titled "Page Extraction Tool." The title bar is a narrow blue-gray frosted rail, active, clear, with a system icon on the left and a close button on the right. Beneath it sits a menu bar with File, View, and Help.

The body is divided into three groups. The first group is "Target" and contains a field showing the selected page region with two small buttons beside it: Refresh and Pick Again. The second group is "Options" and contains a vertical stack of checkboxes and a radio group that controls extraction mode. The third group is "Output" and contains a textarea or listbox where the extracted result appears.

At the bottom, a status bar quietly reports "Ready," the number of selected elements, and perhaps a short mode description. At the far lower right of the body, a button row offers Run and Close.

The user sees this arrangement and understands it before they inspect details. The shell says where commands are, where settings are, where results appear, and where final actions belong.

AC00. UX principles

The user experience of this framework should be based on clarity, containment, and trust.

Clarity means the structure explains itself. The user should not have to guess where actions are or what a control is meant to do.

Containment means the bookmarklet UI feels self-sufficient and does not dissolve into the host page. The user should feel they have a small dependable workspace.

Trust means the UI behaves consistently. Buttons always answer in the same language. Menus open in the same way. Focus is always visible. A grouped set of controls always feels grouped. The interface should not surprise the user with decorative behavior or shifting idioms.

AD00. Final design directive

The visual and interaction style of the AWW Bookmarklet UI Framework shall be that of a compact retro-modern utility shell: framed, square, calm, legible, tactile, and deliberate. It shall borrow the compositional intelligence of classic Windows interfaces, especially their clarity of hierarchy and grouping, while using more refined material, cleaner spacing, and stronger readability for the modern web. Every element shall look built for purpose. Every interaction shall answer plainly. Every grouping shall help the user understand the work. The result shall be a small world of its own laid over the page: distinct, practical, and vividly comprehensible.
