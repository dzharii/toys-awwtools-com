A00. UX and UI decision specification revision 00

A01. Document purpose revision 00

This document defines the UX and UI design decisions for the first release of the vector image editor specified in the main product specification revision 02. It is a companion specification. It does not restate the full product behavior. It defines how the product should present that behavior to the user, how the interaction model should reduce friction, which alternatives were considered, and why the chosen design is the best fit for the product's purpose.

This document is not a visual style guide and not a loose design memo. It is a decision record and implementation guide for UX and UI behavior. Where this document conflicts with informal design preferences, this document wins. Where it conflicts with the main product specification, the main product specification wins unless explicitly revised later.

A02. Relationship to the main product specification revision 00

This document inherits the scope, constraints, and product goals from the main product specification revision 02. In particular, it assumes all of the following are already fixed by the product specification: the editor is desktop-oriented; it is optimized for fast screenshot annotation and simple image composition; it uses SVG as the canonical format; it supports explicit open and export actions; it uses browser-side persistence; it is intentionally narrow; and it must feel professional through speed, precision, clarity, and reliability rather than breadth.

This document therefore focuses on one question: given that product scope, what UX and UI decisions produce the fastest, clearest, least error-prone editing experience for the target user?

A03. Core UX problem revision 00

The core UX problem is not "how to expose many editing features." The core UX problem is "how to let the user complete a useful visual edit with the least possible cognitive friction while preserving confidence and control."

The target user usually wants one of these outcomes: annotate one screenshot, compare two screenshots, overlay one image on another, add text and highlights, export quickly, copy quickly, or reopen and revise a previous editor document. The editing session is often short. The user usually has a result in mind before opening the application. That means the UI must minimize detours, mode confusion, and setup overhead.

The UX must therefore optimize for the following:
fast time to first edit;
fast time to export or copy;
low ambiguity in tool behavior;
strong visibility of important actions;
safe recovery and document replacement behavior;
predictable manipulation of layers, text, images, and shapes;
low clutter during short editing sessions.

A04. UX design objective revision 00

The first release must optimize for rapid completion of lightweight editing tasks. The application should feel like a sharp instrument, not a workspace the user has to learn deeply before it becomes useful.

The UX must create value in five concrete ways.

First, it must shorten the path from image import to visible edit.

Second, it must shorten the path from visible edit to shareable output.

Third, it must reduce the chance that users lose work or misunderstand the current document state.

Fourth, it must make common manipulations feel obvious without requiring tool hunting.

Fifth, it must preserve enough structure that the editor can grow later without redesigning the entire interaction model.

B00. UX decision method revision 00

B01. Decision framework revision 00

Each major UX decision in this document follows the same pattern.

First, define the user problem.

Second, consider five plausible options.

Third, evaluate the options using the product's actual use case rather than generic design fashion.

Fourth, select one option as the binding design for revision 00.

Fifth, explain the trade-off and why the selected option brings more value to the user than the alternatives.

This is required because UX quality depends less on isolated local decisions and more on whether the decisions form one coherent system.

B02. UX evaluation criteria revision 00

Every UX option in this document is evaluated against these criteria:
speed for first-time and repeat use;
clarity of available actions;
low interaction ambiguity;
low implementation risk relative to product scope;
compatibility with the main product specification;
ability to support quick screenshot-based editing;
ability to support precise editing without overwhelming the user.

The winning option is not the most feature-rich option. It is the option that best serves the primary workflow of quick annotation and composition.

C00. Decision 1: overall application layout revision 00

C01. User problem revision 00

The user needs to import images, edit them directly, adjust selected objects, navigate the canvas, and export quickly. The layout must keep the canvas central while keeping key actions visible. The layout must also avoid forcing the user into deep menus or excessive panel switching.

C02. Option 1: single-toolbar minimal layout revision 00

This option uses one top toolbar and a large canvas area. Most controls appear in the top bar. Object properties appear in floating popovers or context menus.

This layout is visually simple and leaves maximum space for the canvas. It may feel lightweight at first glance.

Its main weakness is that it compresses too many responsibilities into one region. Import, export, zoom, tool selection, and object editing compete for the same attention. Contextual editing becomes harder to discover and slower to use. It also encourages hidden controls, which conflicts with the product's clarity goal.

This option improves visual simplicity but weakens editing clarity.

C03. Option 2: left tools, top actions, right inspector, central canvas revision 00

This option uses a stable four-region layout: top toolbar for document and output actions, left vertical rail for tools, central canvas viewport for editing, and right panel for context-sensitive properties.

This layout separates concerns cleanly. The user can quickly understand where to look for each type of action. The canvas remains central, tools remain always visible, and object settings remain discoverable without modal dialogs.

Its main cost is slightly more visual structure and slightly less canvas width than a minimal layout. That trade-off is acceptable because the target workflows depend heavily on repeated access to properties and tools.

This option strongly supports quick edits without hiding control.

C04. Option 3: floating panels over canvas revision 00

This option uses a large central canvas with floating moveable panels for tools, layers, properties, and export.

This can look powerful and flexible, and it resembles advanced design software.

Its main weakness is that it increases window management burden. Floating UI competes with the content being edited. It is slower for short sessions, creates occlusion, and adds complexity that the first release does not need.

This option increases flexibility but reduces speed and calmness.

C05. Option 4: modal step-based workflow layout revision 00

This option treats the editor like a guided flow: import, edit, arrange, export. The UI reveals controls in phases rather than showing them all at once.

This can reduce clutter for narrow tasks.

Its main weakness is that the product is not a linear wizard. Users often jump between movement, text edits, layer changes, and export. A phase-based layout would feel constraining and would slow expert repetition.

This option reduces initial visual load but harms fluid editing.

C06. Option 5: bottom inspector with canvas-first layout revision 00

This option uses a top toolbar, left tools, center canvas, and bottom horizontal inspector instead of a right panel.

This can preserve more horizontal space for the canvas.

Its main weakness is that object properties often require vertical stacking and grouped controls. A bottom panel either becomes too tall or too compressed. It also forces the user's gaze away from the selected object and away from the most common desktop conventions for editing tools.

This option is workable but less readable for property editing.

C07. Selected layout revision 00

The selected layout is Option 2: top toolbar, left tool rail, central canvas viewport, right properties panel.

This is the best fit for the product because it creates a stable mental model with minimal search cost. The user knows that document actions and output are at the top, creation tools are on the left, editing happens in the center, and details of the selected object appear on the right.

This layout brings value to the user in specific ways. It reduces time spent hunting for controls. It keeps the canvas dominant. It preserves fast access to import and export. It makes the application feel professional because the UI remains stable while the content changes. It also supports future growth without requiring a layout rewrite.

C08. Binding layout rule revision 00

Revision 00 of the UX/UI design uses the four-region layout as the required interaction frame. Later decisions in this document must assume that layout and remain coherent with it.

D00. Decision 2: primary editing model revision 00

D01. User problem revision 00

The user needs to perform quick edits without thinking about editor mechanics. The interaction model must answer a basic question: does the editor primarily behave like a direct-manipulation canvas, a form-driven editing tool, a mode-heavy drawing program, or a hybrid?

D02. Option 1: direct manipulation first, properties second revision 00

In this model, the user edits mainly by clicking, dragging, resizing, and selecting directly on the canvas. The right panel refines details but does not dominate the workflow.

This model matches the product's goals well. It makes common operations fast and keeps attention on the content.

Its weakness is that it requires careful interaction design to remain precise. That is acceptable because precision is already required by the product.

D03. Option 2: inspector-driven editing revision 00

In this model, most changes happen through fields and controls in the right panel. The canvas is more of a preview surface.

This can improve precision for numeric editing and structured property control.

Its main weakness is that it makes quick edits feel slow and administrative. That is the opposite of the product's purpose.

D04. Option 3: mode-heavy drawing program revision 00

In this model, each tool strongly changes behavior, and the user spends more time explicitly entering and exiting modes.

This can work for full-featured illustration tools.

Its main weakness is that it increases friction for short sessions, increases mistake risk, and makes the editor feel heavier than intended.

D05. Option 4: command-palette driven interaction revision 00

This model emphasizes keyboard command search, contextual actions, and transient UI.

It can be fast for expert users.

Its main weakness is that it hides capabilities from casual or occasional users and makes the UI less self-explanatory. It also conflicts with the requirement for clearly visible actions.

D06. Option 5: hybrid with direct manipulation and strong contextual inspector revision 00

This model treats the canvas as primary for movement, resize, and placement, while the inspector provides exact adjustments, color changes, font size, layer controls, and numeric values.

This preserves speed while retaining control. It is slightly more complex than pure direct manipulation but more suitable for practical editing tasks.

D07. Selected editing model revision 00

The selected model is Option 5: hybrid editing with direct manipulation as the primary path and contextual inspector as the secondary refinement path.

This is the best choice because it matches how the target user works. The user usually wants to drag things into place quickly, but also sometimes needs exact width, font size, or layer adjustment. A pure direct-manipulation model would make precision harder. A pure inspector model would slow down common actions. The hybrid model resolves both needs.

The user value is clear. The user gets immediate speed without losing control. They can act quickly first and refine only when refinement is necessary. This removes friction without removing precision.

E00. Decision 3: how tools are exposed revision 00

E01. User problem revision 00

The user needs to create common objects fast: text, rectangle, ellipse, line, and selection. Tool choice must be visible and low-effort. The editor must avoid making the user open menus for frequent actions.

E02. Option 1: dedicated left tool rail revision 00

Tools appear as persistent vertical buttons on the left edge.

This keeps creation affordances always visible and easy to scan. It fits well with desktop editing conventions and with the selected layout.

Its only weakness is that it consumes some horizontal space. That cost is small and acceptable.

E03. Option 2: top-toolbar tool group revision 00

Tools appear in a group in the top toolbar beside document actions.

This reduces the number of regions on screen.

Its weakness is mixing creation tools with document actions and exports. That increases visual competition and reduces scan clarity.

E04. Option 3: insert menu only revision 00

The user clicks an Insert menu and then chooses text or shapes from a dropdown.

This reduces visible UI.

Its weakness is slower access to the exact actions the user uses most. It creates unnecessary clicks for common tasks.

E05. Option 4: context-triggered quick-add menu on canvas revision 00

The user clicks a floating plus button or right-clicks the canvas to insert objects.

This can be elegant in some apps.

Its weakness is that it makes capability discovery weaker and adds gesture dependence. It is less reliable for a primary editing toolset.

E06. Option 5: keyboard-only or palette-first tool access revision 00

The user chooses tools mostly through shortcuts or command search.

This can be efficient for expert users.

Its weakness is poor discoverability and poor alignment with the first-release audience.

E07. Selected tool exposure revision 00

The selected option is Option 1: dedicated left tool rail.

This choice supports quick editing because the user does not need to open menus to insert text or shapes. It improves productivity by keeping the most frequent creation actions one click away. It also reinforces the mental model that the left side is for "what I add," while the right side is for "how the selected thing behaves."

F00. Decision 4: how import and export are exposed revision 00

F01. User problem revision 00

Import and export are the bookends of most editing sessions. The user often enters the application to insert an image and leaves once the final image is copied or saved. These actions must therefore be more prominent than in a full design suite.

F02. Option 1: top-level persistent actions revision 00

Insert Image, Open Document, Export SVG, Export PNG, Export JPEG, and Copy actions are placed in the top toolbar and remain visible.

This minimizes search time and shortens the critical path.

Its only weakness is toolbar density, but the product is narrow enough that this remains manageable.

F03. Option 2: file menu with grouped actions revision 00

Import, open, and export are grouped under a File menu.

This is familiar in desktop software.

Its weakness is that it adds one extra step to the most important actions and makes the app feel more like a heavy desktop program.

F04. Option 3: landing-screen emphasis only revision 00

Import and open are prominent only before editing begins. Once a document is active, these actions move into menus.

This can simplify the main editing screen.

Its weakness is that users often import additional images mid-session. Hiding import after startup would slow a common workflow.

F05. Option 4: floating action buttons near canvas revision 00

Open, insert, export, and copy are shown as floating buttons near the canvas.

This may feel modern and immediate.

Its weakness is that it competes with the content and adds visual distraction. It is not appropriate for a professional editing surface.

F06. Option 5: export drawer revision 00

The main toolbar shows one Export button that opens an export drawer with multiple formats and copy options.

This reduces immediate toolbar width.

Its weakness is that it makes a high-frequency action less direct. The application is intentionally small enough that separate export actions are acceptable.

F07. Selected import and export exposure revision 00

The selected option is Option 1: top-level persistent actions in the top toolbar.

This is the best choice because it treats the real workflow honestly. The user often starts with insert or open and finishes with export or copy. Those actions should therefore be first-class UI elements, not secondary menu items.

This choice improves UX by making the start and end of the workflow extremely fast. It also makes the application feel lightweight because the user can understand the whole lifecycle at a glance.

F08. Copy-to-clipboard rule revision 00

Because rapid sharing is a primary use case, the first UX/UI design must include a visible Copy action for raster output if the browser environment supports it reliably. The preferred behavior is Copy PNG to clipboard. If clipboard image write is unsupported, the UI must either disable the action with explanation or fall back to export-only behavior. Copy must sit beside export actions in the top toolbar because it is part of the same workflow outcome.

G00. Decision 5: how properties are edited revision 00

G01. User problem revision 00

The user needs to change selected object details such as width, position, stroke width, fill, color, font size, and layer order. These changes must be clear, contextual, and quick.

G02. Option 1: permanent right inspector with grouped sections revision 00

The selected object's available controls are always shown in a dedicated right panel. Controls are grouped into sections such as position, size, appearance, text, and arrangement.

This gives consistent discoverability and minimizes modal disruption.

Its weakness is persistent UI width, but that is acceptable in the chosen layout.

G03. Option 2: floating contextual mini-toolbar revision 00

When an object is selected, a small floating toolbar appears nearby with key settings.

This can feel fast for tiny edits.

Its weakness is limited capacity and visual occlusion. It also becomes fragile with multiple object types and detailed controls.

G04. Option 3: inspector hidden behind expandable drawer revision 00

The right panel stays collapsed unless the user opens it.

This saves space.

Its weakness is making refinement slower and less discoverable. It also weakens the product's "professional but fast" positioning.

G05. Option 4: modal property dialogs revision 00

Each object type has a settings dialog.

This can simplify the main screen.

Its weakness is severe interruption cost and poor fit for iterative editing.

G06. Option 5: mixed inline controls and popovers revision 00

Some controls appear near the selection, some in top bars, some in popovers.

This can reduce travel distance.

Its weakness is inconsistency. The user must remember where different settings live.

G07. Selected properties editing model revision 00

The selected option is Option 1: permanent right inspector with grouped sections.

This is the best fit because it balances stability and context. The user always knows where to look when they need exact control. The panel changes with the selection, so it remains relevant without becoming a general dumping ground.

This improves productivity because the user can move quickly on the canvas and then glance right for precise corrections. It also reduces the chance of UI drift as features expand later.

H00. Decision 6: how object creation works on the canvas revision 00

H01. User problem revision 00

After choosing a tool, how should the user create a new object? The choice affects speed, precision, and mode clarity.

H02. Option 1: click once to place default object revision 00

The user chooses a tool and clicks once. The editor creates a default-sized object at that location, selected immediately.

This is very fast and low effort. It works especially well for text and for the product's quick-edit goals.

Its weakness is that the user may need to resize immediately afterward.

H03. Option 2: click and drag to create with initial size revision 00

The user chooses a tool and drags to create the object at the desired size.

This can be precise for shapes.

Its weakness is that it makes insertion slower, especially for short sessions and casual use.

H04. Option 3: hybrid by object type revision 00

Text inserts on click. Shapes can insert either as default size on click or as drawn size on drag. The tool's first pointer movement decides which behavior occurs.

This supports both speed and precision, but only if it is kept simple.

Its weakness is slightly more implementation complexity.

H05. Option 4: place through inspector or form revision 00

The user adds objects through buttons and numeric fields.

This is precise but too slow and too indirect.

H06. Option 5: drag from tool icon onto canvas revision 00

The user drags a tool representation onto the canvas to create an object.

This is visually interesting but unnecessary and less efficient.

H07. Selected object creation model revision 00

The selected option is Option 3: hybrid by object type.

The binding rule is:
text inserts on click and enters edit mode immediately;
rectangle, ellipse, and line may be created by click for default geometry or click-drag for initial size;
if the pointer is released without meaningful drag distance, the editor inserts the default-sized object at the click location;
if the pointer is dragged beyond the creation threshold, the object is created at the dragged geometry.

This is the best solution because it serves both fast and deliberate users without introducing more UI. It improves productivity by allowing the fastest path for common use while still supporting immediate precision when the user wants it.

I00. Decision 7: how selection should feel revision 00

I01. User problem revision 00

Selection is the foundation of almost everything else. If selection feels unreliable, the editor feels broken. The UX must make selection easy, especially for thin objects, transparent shapes, and overlapped items.

I02. Option 1: strict geometry hit-testing only revision 00

Selection works only on the visible object geometry.

This sounds precise.

Its weakness is poor usability for thin lines and transparent shapes. It would make the editor feel frustrating.

I03. Option 2: forgiving hit-testing with explicit rules revision 00

Selection uses object-specific rules with minimum screen-space targets and cycling for covered items.

This is more usable and still deterministic.

Its weakness is that it requires clear documentation and consistent implementation. That is acceptable and already aligned with the main product specification.

I04. Option 3: bounding-box only selection revision 00

Everything selects by rectangular bounds.

This is easy to implement.

Its weakness is poor fidelity and surprising results for complex shapes and overlapped content.

I05. Option 4: selection only through layer list revision 00

The user must often use a layer panel or list to select objects precisely.

This can be precise but is too slow and too administrative for quick editing.

I06. Option 5: lasso or marquee first revision 00

The editor emphasizes selection areas and lasso interactions.

This is useful in complex design tools but unnecessary for the first release.

I07. Selected selection model revision 00

The selected option is Option 2: forgiving hit-testing with explicit rules.

This is the best choice because it protects the user's sense of control. A quick editing tool must feel easier than the raw geometry would suggest. Thin lines need easier selection. Transparent highlights need to remain easy to grab. Covered objects need a deterministic access path.

This improves user experience by removing "why can't I select this?" frustration, which is one of the fastest ways to make a tool feel unreliable.

J00. Decision 8: how text editing should feel revision 00

J01. User problem revision 00

Text is a high-frequency task and a high-risk UX area. The product only needs simple text, but it needs to make simple text feel stable and obvious.

J02. Option 1: inline SVG text editing revision 00

The editor attempts to edit text directly inside the SVG rendering surface.

This appears elegant in theory.

Its weakness is inconsistent browser behavior, caret complexity, and measurement instability.

J03. Option 2: overlay input anchored to the text object revision 00

When the user edits text, the editor places an HTML input overlay aligned to the text position. On commit, it writes back to the text object.

This is stable, familiar, and well suited to single-line editing.

Its weakness is the need for careful alignment between edit mode and display mode.

J04. Option 3: right-panel-only text editing revision 00

The user edits text content mainly through the inspector.

This is reliable but too detached from the content and too slow for quick annotations.

J05. Option 4: modal text dialog revision 00

The user edits text in a popup dialog.

This is interruptive and inappropriate for the product.

J06. Option 5: inline edit strip at bottom or top revision 00

The user selects text and edits it in a dedicated edit strip separate from the canvas.

This is workable but visually disconnected from the content.

J07. Selected text editing model revision 00

The selected option is Option 2: anchored HTML overlay input for text editing.

This is the best trade-off for the product. It gives the user familiar text entry behavior, preserves direct manipulation, and keeps editing close to the object itself. The user does not need to switch mental context or look away from the content.

The user value is immediate. Adding labels becomes a near-frictionless action. This directly serves screenshot annotation, which is one of the product's main reasons to exist.

K00. Decision 9: how layer ordering is exposed revision 00

K01. User problem revision 00

Users need layer control, but the first release does not include a full layers panel. The UX must still allow common stack adjustments quickly.

K02. Option 1: layer buttons in the right inspector revision 00

When an object is selected, the inspector shows Bring Forward, Send Backward, Bring to Front, and Send to Back.

This is clear, direct, and consistent with object-specific editing.

Its weakness is that the user needs a selection first, which is acceptable because layer changes always act on a selected object.

K03. Option 2: top toolbar arrangement group revision 00

Layer buttons sit in the top toolbar all the time.

This makes them visible, but it also increases toolbar clutter and weakens the top bar's focus on document-level actions.

K04. Option 3: context menu only revision 00

Layer actions appear only on right click.

This hides an important action and reduces discoverability.

K05. Option 4: mini floating arrangement bar on selection revision 00

A small toolbar appears near the selected object.

This may seem efficient, but it adds canvas clutter and visual instability.

K06. Option 5: layers drawer revision 00

A small layers drawer or list is always available.

This can be powerful, but it adds UI and conceptual overhead that the first release does not need.

K07. Selected layer exposure revision 00

The selected option is Option 1: layer controls in the right inspector.

This is best because it keeps arrangement tied to the selected object and avoids expanding the surface area of the application. It solves the real problem without introducing a more complex panel model.

L00. Decision 10: how document status and recovery are communicated revision 00

L01. User problem revision 00

The editor has multiple document origins: new document, opened file, recovered local draft. It also has persistence states such as save pending and save failed. If the user cannot tell what state they are in, trust drops quickly.

L02. Option 1: explicit status area always visible revision 00

A compact status area in the top toolbar or status strip shows document origin and save state.

This creates clarity with low cognitive cost.

Its weakness is some persistent UI occupancy, which is acceptable.

L03. Option 2: temporary toast only revision 00

Recovery and save information appears only in notices.

This reduces fixed UI.

Its weakness is that users can miss it and then lose context.

L04. Option 3: hidden status inside menus revision 00

Draft state is visible only in a file menu or about panel.

This is too hidden for a reliability-critical feature.

L05. Option 4: large banner for all states revision 00

Document state is communicated with strong banners at the top.

This can work for severe failures but is too visually heavy for normal conditions.

L06. Option 5: no visible save state except on failure revision 00

Only failures are shown.

This minimizes clutter but weakens user confidence.

L07. Selected document status model revision 00

The selected option is Option 1: compact explicit status area always visible.

This is the best choice because it makes the application's reliability model legible. The user should be able to tell whether they are editing a recovered draft, a newly created document, or an opened file, and whether their changes are safely persisted.

This improves UX by turning invisible risk into visible reassurance.

M00. Decision 11: how export and copy should conclude the workflow revision 00

M01. User problem revision 00

The user often does not want a "project management" ending. They want the result in a usable form immediately. The final interaction should therefore be extremely short.

M02. Option 1: dedicated export buttons plus copy button revision 00

The toolbar shows Export SVG, Export PNG, Export JPEG, and Copy PNG.

This is fastest and most explicit.

Its weakness is toolbar width, but the app scope is small enough to absorb it.

M03. Option 2: single export button with dropdown revision 00

One Export button opens a list of output actions.

This reduces width.

Its weakness is one extra step on a core path.

M04. Option 3: export dialog after clicking a main button revision 00

The user clicks Export and then sees a larger dialog.

This is useful in apps with many export options, but unnecessary here.

M05. Option 4: auto-copy after export revision 00

The app exports and copies automatically.

This is too presumptive and may surprise users.

M06. Option 5: keyboard or command-palette driven output revision 00

Output is optimized for expert commands.

This is too hidden for the first release.

M07. Selected output model revision 00

The selected option is Option 1: dedicated export buttons plus copy button.

This is best because the product is explicitly about quick turnaround. The user should be able to finish the task without one more menu, one more dialog, or one more conceptual step. This is a direct productivity gain.

N00. Cohesive UX model revision 00

N01. Combined design logic revision 00

The selected decisions form one coherent UX model.

The layout is stable and region-based.

The canvas is primary.

Tools are persistent on the left.

Document lifecycle actions are persistent on the top.

Properties live on the right.

Editing is mainly direct manipulation, refined through the inspector.

Text editing happens near the content.

Selection is forgiving and explicit.

Layer control is contextual, not global.

Document status is visible.

Output is immediate.

This coherence matters. A UX can fail even if each local choice seems reasonable in isolation. The choices above work together because they all support the same underlying promise: quick, clear, trustworthy editing.

N02. UX tone revision 00

The UI should feel calm, precise, and competent. It should not feel playful, experimental, or overloaded. The visual hierarchy should reinforce utility: canvas first, action clarity second, decoration last.

The application should present itself as lightweight, but that does not mean visually empty. It means the user is never forced to wrestle with the interface before they can edit.

O00. Required screen structure revision 00

O01. Top toolbar contents revision 00

The top toolbar must contain, in a clear left-to-right grouping, at minimum:
New Document;
Open Document;
Insert Image;
Copy PNG if supported;
Export SVG;
Export PNG;
Export JPEG;
zoom controls;
document status and save status.

The exact visual grouping may vary, but import/open actions must appear before output actions, and output actions must remain easy to reach.

O02. Left tool rail contents revision 00

The left tool rail must contain, in stable order:
Select;
Text;
Rectangle;
Ellipse;
Line.

A Pan tool is optional if space-drag is already present, but it may be included if the design stays visually restrained.

O03. Right inspector structure revision 00

The right inspector must use grouped sections. At minimum, the section pattern should allow:
object identity or type label;
position and size;
appearance;
text controls when relevant;
arrangement;
document-level settings when no object is selected.

The right inspector must not become a grab bag of unrelated controls. Grouping must remain strict.

O04. Canvas viewport behavior revision 00

The canvas viewport must remain the dominant visual region. The workspace background must contrast with the canvas. Canvas edges must remain obvious. Editor overlays must be clear but not visually aggressive. The selection system must feel forgiving rather than brittle.

P00. User value narratives revision 00

P01. Fast screenshot annotation narrative revision 00

The user opens the editor, clicks Insert Image, drops in a screenshot, clicks Rectangle, drags a highlight, clicks Text, types a label, and clicks Copy PNG. The result is already on the clipboard and can be pasted into chat.

The value here is speed with low mental overhead. The user did not navigate menus, open dialogs, or hunt for tools. The UI reduced the task to visible direct actions.

P02. Quick comparison narrative revision 00

The user imports two screenshots, places them side by side, matches width in the right panel, adds two labels, and exports PNG.

The value here is structured clarity. The layout allows the user to manipulate visually in the center and refine precisely on the right without losing context.

P03. Recover and continue narrative revision 00

The user accidentally refreshes the page. The editor reopens to the recovered draft and clearly shows that status. The user trusts the state, makes one more adjustment, and exports.

The value here is confidence. The UI makes recovery visible rather than mysterious.

P04. Reopen and revise narrative revision 00

The user opens an SVG they exported yesterday, sees it load as an opened document, changes text, and exports again.

The value here is continuity. The user sees the editor as a practical working tool, not a temporary one-shot annotation gadget.

Q00. UX risks and how the selected design avoids them revision 00

Q01. Risk: the app feels too much like a full design suite revision 00

This risk appears if too many controls are visible or too many panels behave independently.

The chosen design avoids this by limiting the tool set, fixing the layout, and keeping the inspector contextual rather than global.

Q02. Risk: the app feels too hidden or too magic revision 00

This risk appears if important actions move into menus, context menus, floating popovers, or invisible gestures.

The chosen design avoids this by making tools, open, insert, export, copy, and save state visible at all times.

Q03. Risk: the app feels unreliable revision 00

This risk appears if selection is hard, text shifts unpredictably, or recovery state is unclear.

The chosen design avoids this through forgiving hit-testing, near-object text editing, and explicit document status.

Q04. Risk: the app becomes visually busy revision 00

This risk appears if many UI regions compete equally for attention.

The chosen design avoids this by giving clear visual priority to the canvas and limiting the first-release controls.

R00. Binding UX rules revision 00

R01. Primary UX principle revision 00

When there is a trade-off between adding more control surface and preserving fast completion of common editing tasks, the design must prefer fast completion unless the added control is necessary for correctness or trust.

R02. Visibility principle revision 00

Actions that begin or end the user workflow must remain visible. This includes open, insert image, export, copy, and document status.

R03. Stability principle revision 00

Primary UI regions must remain stable during editing. The layout must not reconfigure dramatically based on mode. Only contextual content inside stable regions may change.

R04. Proximity principle revision 00

Actions that conceptually act on the selected object belong near the selected-object context, primarily in the right inspector. Actions that act on the whole document belong in the top toolbar. Actions that create new objects belong in the left tool rail.

R05. Friction principle revision 00

Every additional click, panel toggle, dialog, or hidden gesture must be justified by clear user value. If it does not reduce mistakes or improve control meaningfully, it should not exist in the first release.

S00. Next design work implied by this document revision 00

S01. Future companion documents revision 00

This decision specification is sufficient to guide layout and interaction design at a high level, but it should later be complemented by narrower companion documents:
a screen-level UI specification;
a component behavior specification;
an interaction state specification;
a visual hierarchy and styling specification;
a UX validation checklist against the main product workflows.

These later documents must preserve the decisions made here unless a future revision explicitly changes them.

T00. Final selected UX direction revision 00

T01. Selected UX direction revision 00

The first release UX uses a stable four-region desktop layout with top document actions, left creation tools, central canvas editing, and right contextual properties. It uses direct manipulation as the primary editing model, supported by a persistent inspector for refinement. It keeps import, open, export, and copy actions visible because they are part of the core workflow, not secondary features. It uses forgiving selection behavior and near-object text editing to reduce frustration. It shows document origin and save state explicitly so the user can trust the system.

This is the selected UX direction because it best serves the actual product promise: a lightweight, professional editor for fast, practical visual edits that remove friction instead of adding it.
