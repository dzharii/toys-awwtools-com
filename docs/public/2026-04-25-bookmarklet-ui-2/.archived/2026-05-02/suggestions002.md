2026-04-19

A00. Final project specification

This document is the final base specification for the AWW Bookmarklet UI Framework. It defines the architectural decisions, implementation rules, component scope, runtime behavior, styling model, packaging model, and first milestone for the project. This specification supersedes earlier exploratory notes and resolves the inconsistencies that existed in the earlier draft. It is intended to be normative. Where this document says that the project shall, should, will, or must do something, that language is directive and final for the current phase of work.

This specification is based on two sources of project context that are part of the project record. First, it is based on the attached base reference files that demonstrate the Windows 3.x inspired UI vocabulary, including the CSS, HTML, and JavaScript patterns that were reviewed as the conceptual starting point for the system. Second, it is based on the initial implementation that already exists for this project, including the desktop root, window shell, title bar, geometry helpers, menu bar, menus, inputs, tabs, listbox, status bar, build scripts, and demo catalog. The purpose of this specification is not to repeat that code line by line. Its purpose is to define the final architectural contract that the implementation shall follow from this point onward.

B00. Restatement of the project task

The project is a reusable bookmarklet UI framework for utility-style tools that run on arbitrary web pages. The framework shall provide a compact desktop-like windowing environment for bookmarklets and page helpers. It shall support floating windows, title bars, application menus, focus management, resizing, dragging, compact form controls, list-style controls, tabbed panels, and small status surfaces. It shall be designed for incremental reuse so that new bookmarklet tools can be built from the same visual and behavioral foundation rather than creating one-off interfaces repeatedly.

The framework shall take its visual grammar from Windows 3.11 and related classic utility interfaces, but it shall not be a literal reproduction. It shall preserve the utility-oriented character of that interface language while modernizing it carefully for current browser contexts. The resulting system shall feel distinct, stable, compact, and practical. It shall not feel like a nostalgic skin pasted onto a generic modern application, and it shall not feel like a modern glossy application with superficial retro decoration. It shall instead read as a purpose-built retro-modern utility shell for injected bookmarklet tools.

C00. Project character and design intent

The framework shall be small, explicit, and durable. Its styling shall be based on recognizable framed windows, title bars, menu bars, structured control borders, and clear active and inactive states. Its modernization shall be limited to the places where modern browsers and modern expectations genuinely improve the result. Those places include cleaner spacing, improved readability, stable typography, narrow use of translucency, a restrained shadow model, better state contrast, better keyboard support, and stronger host-page isolation.

The framework shall remain visually disciplined. It shall not use loud design trends, soft oversized rounded geometry, deep decorative glow, large-area blur, or exaggerated shadow stacking. It shall preserve square or near-square structure, explicit borders, compact layout, and utility-oriented clarity. Its visual center shall be the title bar, window shell, menu structure, and control grammar.

D00. Use of reference files

The attached base CSS and related reference files shall be treated as design reference material, not as a direct implementation base. Their purpose is to define the conceptual vocabulary of the system. The new framework shall inherit the reference files' strengths, including role-based styling, compact control behavior, layout primitives, menus, tabs, list behaviors, and window interaction ideas. The new framework shall not copy their global selector model, their file organization, or their unscoped assumptions directly. The reference files are important because they define the design language that this framework is based on, and this specification explicitly recognizes that those attached files are part of the project discussion and part of the design basis.

E00. Use of current implementation

The current implementation shall be treated as a real architectural input, not as a throwaway prototype. The existing code already establishes several correct decisions that are now made final in this specification. Those decisions include the singleton desktop root, the open Shadow DOM strategy, namespaced custom elements, namespaced public CSS variables, idempotent custom-element registration, a non-blocking overlay root, window geometry helpers, a reusable window manager, simple command registry, component-level stylesheets, and an interactive catalog page for exercising components.

This specification adopts those directions and formalizes them. Where the implementation already made a good decision, this document keeps it. Where the earlier prose left an ambiguity, this document resolves it using the implemented direction unless a stronger architectural reason requires adjustment.

F00. Technology stack

The framework shall use modern JavaScript modules, modern CSS, HTML, Shadow DOM, and web components. It shall bundle with Bun. It shall use Lit as the only external UI dependency. Lit shall be installed through npm. Lit shall be pinned in `package.json` and lockfile. Lit shall then be bundled into the shipped build artifact. The project shall not vendor Lit source manually into the repository as the primary package strategy. The project shall not load Lit from a CDN at runtime. The authoritative package policy for Lit is therefore this: Lit is a pinned npm dependency, bundled locally into the bookmarklet output, and not treated as a runtime external.

This resolves the earlier inconsistency between manual vendoring language and npm installation language. The project has now decided to use npm for Lit installation, and that is the final decision for the framework.

G00. Dependency policy

The framework shall avoid external runtime dependencies other than the code bundled into its own output. Lit is the sole allowed library-level dependency for the base system. The framework shall not add CSS frameworks, utility frameworks, component kits, or general-purpose runtime state managers. The framework shall not depend on host-page assets, host-page fonts, host-page styles, or external icon delivery.

The framework may use built-in browser primitives and bundled SVG assets. The framework may add local development tooling dependencies if required by the build, but such dependencies shall not become runtime framework dependencies unless explicitly approved.

H00. Browser support baseline

The framework targets modern evergreen browsers. It assumes support for ECMAScript modules, custom elements, Shadow DOM, modern CSS custom properties, and modern DOM APIs. It does not target legacy browsers. It does not target Internet Explorer. It may provide graceful fallback for certain progressive features such as `backdrop-filter` and `adoptedStyleSheets`, but those fallbacks exist to preserve usability, not to widen support to obsolete environments.

The framework shall use `window.visualViewport` when available for geometry work. When `visualViewport` is unavailable, it shall fall back to the layout viewport through standard window dimensions.

I00. Architectural model

The framework shall be organized into four primary layers. The first layer is the core foundation. The second layer is the component layer. The third layer is the controller and service layer. The fourth layer is the tool layer.

The core foundation shall provide tokens, shared style infrastructure, constants, registration helpers, geometry helpers, theme application, z-index rules, and other low-level primitives. The component layer shall provide the custom elements and Lit-based elements that define the visible UI. The controller and service layer shall provide reusable runtime behavior such as window management, focus routing, command dispatch, and future reusable interaction controllers. The tool layer shall consist of bookmarklet applications and tool-specific shells built on top of the framework.

Modules shall remain independently importable where practical. The framework shall avoid implicit side effects except for deliberate custom-element registration entrypoints.

J00. Shadow DOM policy

The framework shall use open Shadow DOM for all core components in version one. This is a deliberate decision for inspectability, debugging, development ergonomics, and practical bookmarklet use. Closed shadow roots shall not be used for the core framework in version one. If a future specialized component needs different encapsulation behavior, that decision shall be explicit and local, not general.

Shadow DOM shall be the primary styling and structural isolation boundary. The framework shall not rely on global class names or global descendant selectors to shape component internals.

K00. Registration policy

All custom elements shall be registered idempotently. Repeated calls to bootstrap or register components shall not throw due to duplicate `customElements.define()` calls. Registration helpers shall check whether an element name is already registered before defining it. The framework shall tolerate repeated bookmarklet execution on the same page. This is a bookmarklet requirement, not an implementation detail.

L00. Global singleton policy

The framework shall expose one singleton desktop root per page for a given compatible framework version. The singleton shall be discoverable through a well-known global symbol. The framework shall also expose version metadata through a separate well-known global symbol. Repeated tool execution shall discover and reuse the existing root when the framework major version is compatible.

If the same framework is reinvoked, it shall not create duplicate overlay roots. If a tool is executed again, the framework may either focus an existing related tool window or create a new window according to tool policy, but it shall not duplicate the core root infrastructure unnecessarily.

If a future incompatible major version is ever loaded on the same page, the framework may choose isolation rather than unsafe reuse. That multi-version behavior is not a first-release priority, but the global symbol contract shall leave room for that distinction.

M00. Desktop root and overlay behavior

The desktop root shall be a fixed-position top-level overlay attached to the document in a deliberate and stable location. It shall span the viewport. It shall have a very high z-index so it can remain above typical host-page content. It shall not rely on host-page stacking contexts.

The overlay root shall be non-blocking by default. It shall use `pointer-events: none`. Only interactive child surfaces such as windows, menus, dialogs, and explicit modal scrims shall opt back into pointer interaction with `pointer-events: auto`. This is a core bookmarklet behavior requirement. The presence of the framework on a page shall not make the full page unclickable unless a tool explicitly presents a blocking modal state.

The desktop root shall own the window manager and shall serve as the mount point for floating windows and other top-level framework surfaces.

N00. Lifecycle and cleanup

The framework shall maintain a reference-counted or equivalent ownership-aware lifecycle for the desktop root. Each mounted tool instance shall increment usage. Each destroyed tool instance shall decrement usage. The root shall remain mounted while active tool usage remains non-zero. When the last tool is destroyed, the framework may remove the root and tear down listeners. The framework shall also support a full cleanup path for emergency or explicit teardown.

All global listeners, viewport listeners, and other long-lived side effects shall be removable. The framework shall not leave orphaned listeners or dead global state after teardown. Cleanup shall be part of the architecture, not an optional refinement.

O00. Geometry policy

The framework shall define one clear geometry policy for version one. Floating windows shall clamp to the visual viewport when available, otherwise to the layout viewport. Minimum visible title-bar area shall be preserved so the user can recover off-positioned windows. Minimum width and minimum height shall be enforced per window. Initial window spawn shall use a cascade offset pattern from a stable default origin. The framework shall not implement snapping, docking, or complex tiling in version one.

Dragging and resizing shall use pointer events. During active interaction, geometry updates shall remain stable and bounded. Geometry helpers shall be the source of truth for clamping, resizing, and spawn logic. Individual components shall not invent competing geometry rules.

P00. Window manager policy

The framework shall include a window manager service. The window manager shall own registration, deregistration, focus state, z-order, movement, resizing, and viewport reaction. It shall track all live windows mounted in the root. It shall maintain one active window reference. It shall ensure that the active window is visually marked active and stacked above inactive windows.

The window manager shall respond to viewport changes by clamping or repositioning windows according to the geometry policy. The window manager shall not implement complex desktop metaphors such as minimize-to-taskbar, workspace switching, or persistent docking in version one.

Q00. Window shell

The framework shall provide one core floating window component. That component shall be the main structural shell for bookmarklet tools. It shall support title bar, optional menu bar, optional toolbar region, main body region, and optional status bar region. It shall support pointer-based dragging and resizing. It shall support active and inactive visual states. It shall be closable unless explicitly configured otherwise in the future.

The core window shell shall remain rectangular and structurally explicit. It shall be robust enough to serve as the shared shell for multiple distinct bookmarklet tools.

R00. Title bar contract

The title bar is the framework's primary chrome surface. It shall display a title, an optional left-side system affordance, and right-side title actions such as close. It shall indicate active versus inactive state clearly. It shall be the draggable region for standard move interactions except where controls inside it intentionally consume interaction.

The left-side affordance contract is now explicitly defined. Single click on the left-side system affordance shall open or dispatch the system or application menu. Double click on that same affordance shall close the window. Keyboard activation through Enter or Space shall open the system or application menu. If a window is not closable, double-click close behavior shall be disabled or ignored according to window configuration.

This resolves the earlier incomplete title-bar behavior description.

S00. Menu bar and menu behavior

The framework shall support a desktop-style menu bar. The menu bar shall use a roving tabindex model in version one. Top-level menu triggers shall be keyboard reachable. Enter, Space, or ArrowDown on a menu trigger shall open its menu. Left and Right arrow keys shall move between top-level menu triggers. When a menu is open, Left and Right may move between top-level menus while preserving desktop-style behavior. Escape shall dismiss the current open menu state. Click outside shall dismiss open menus.

Menus shall support Up and Down arrow navigation, Home and End movement, Enter and Space activation, and typeahead for direct navigation among menu items. Separators shall be structural and non-focusable. Menu items may be represented as buttons or equivalent role-bearing nodes in version one, but the behavior shall be normalized by the menu component. Disabled items shall be visibly disabled and non-activatable. Checkbox and radio-style menu items may be added later only if required by real command needs. They are not required for the first milestone.

Open-on-hover behavior shall not be the primary menu model in version one. Menus shall primarily open through click or keyboard activation.

T00. Command registry

The framework shall include a command registry abstraction. Commands shall be defined by stable identifiers and executable behavior. A minimal command shape shall include an `id` and a `run(context)` function. Commands may also define `isEnabled(context)`, `isChecked(context)`, and `shortcut` metadata. Command registries shall be scoped per tool instance by default. The framework may expose a small shared layer for common system commands such as close or focus if needed.

Menus, toolbar actions, and future keyboard shortcuts shall resolve through the command model rather than each control embedding independent business logic. This keeps tool logic centralized and reduces UI drift.

U00. Input and form-control policy

The first release shall provide basic input components as stylized wrappers around internal native controls. `awwbookmarklet-input` and `awwbookmarklet-textarea` shall not be full form-associated custom elements in version one. They shall wrap native internal controls, forward practical attributes such as value, disabled, placeholder, name, rows where relevant, and dispatch input and change events appropriately. This is an intentional scope decision to keep the framework reliable and small.

Buttons and icon buttons shall follow the same principle. They shall be custom elements that wrap native internal controls and preserve expected activation behavior while keeping a consistent visual language.

V00. Tabs contract

Tabs shall be represented by a container component and child panel components. The version-one API shall treat slotted child panels as the source of truth. Each panel shall provide its label through an attribute. The tabs component shall render the tab strip from those child panels automatically. One panel shall be selected at a time. Keyboard interaction shall support Left, Right, Home, and End movement. Selection state shall remain explicit and visible. Tabs shall not support complex lazy-loading semantics or advanced nested tab management in version one unless required by a concrete tool.

W00. Listbox contract

The version-one listbox shall be single-select only. It shall support keyboard arrow movement, Home, End, and typeahead. It may support optional icons or richer option content, but it shall not support virtualization, grouped options, drag selection, or complex multiselect behavior in version one. The selected option shall be visually obvious. The listbox shall emit change information in a stable way when selection changes.

X00. Status bar contract

The framework shall provide a compact status bar component for utility feedback, status segments, counts, mode indicators, and lightweight footer information. The status bar shall remain structurally simple. It shall not grow into a command area or complex toolbar replacement. Its purpose is to support small utility status surfaces in classic application style.

Y00. Dialog policy

Dialogs are not part of the first implementation milestone unless the core floating window shell is already stable and the dialog can be delivered as a narrow wrapper over that shell without introducing modal complexity that destabilizes the base system. Therefore the version-one milestone does not require a general dialog system. If a simple dialog-like window is needed early, it shall be implemented as a controlled specialization of the window shell rather than as a separate complex modal framework.

This resolves the earlier ambiguity where dialog support was both included and deferred. For the current phase, dialogs are deferred from the core milestone unless needed as a very thin derivative.

Z00. Visual contract

The visual contract for version one is now fixed.

The default geometry shall be square or nearly square. The framework shall not use large modern radii. The default radius shall be zero. A very small radius, at most two pixels, may be permitted only on narrowly chosen internal surfaces if implementation proves that it improves rendering without diluting the design language. The default and intended appearance remains square.

The framework shall use one explicit border vocabulary. Structural borders shall be clear and consistent. The framework shall use one restrained shadow family. It shall not use multiple competing shadow idioms. It shall use one title-bar translucency treatment. It shall use one default typography stack based on system UI fonts. It shall not use decorative gradients except where a narrow highlight treatment is intentionally used to preserve the feel of utility chrome. It shall not use heavy faux-3D embossing everywhere. Instead, it shall use a selective and disciplined combination of border, highlight, and subtle depth.

AA00. Title-bar material rule

The title bar may use a frosted or semi-transparent material treatment. That treatment shall be subtle. It shall preserve title legibility. It shall not rely on blur for usability. If `backdrop-filter` is unsupported or disabled, the framework shall fall back to an opaque or semi-opaque tokenized title-bar color that still preserves contrast and active-state clarity. Correctness shall not depend on translucency. Translucency is an enhancement, not a requirement.

The framework shall not blur large areas of the interface. Large-area blur is explicitly out of scope. Material use shall remain narrow and structural.

AB00. Typography policy

The framework shall use a system UI font stack by default. It shall not attempt to enforce legacy bitmap system fonts as its main typography. The typography shall remain compact, legible, and neutral. Text in controls, menus, title bars, and status areas shall remain readable across arbitrary host-page backgrounds and zoom levels.

AC00. Token policy

The framework shall use a tokenized styling model. Public CSS variables shall use the `--awwbookmarklet-` prefix. The exported public token contract shall remain deliberately limited and documented. Internal implementation variables may exist inside component styles, but only the documented exported tokens are stable public API.

Tokens shall be organized into semantic tiers. Structural tokens shall define surface roles, border roles, spacing, size, and focus roles. Effect tokens shall define shadow and material behavior. Component styles shall consume these semantic tokens rather than relying on repeated hardcoded literals.

The project shall ship one built-in theme in version one. The presence of a theme service does not imply multiple themes or a public theme switcher in the first release. The theme service exists to apply and centralize the token set cleanly and to avoid architectural churn later. Version one does not include multiple skins.

AD00. CSS organization

The framework shall use plain modern CSS. It shall organize CSS with a clear internal layer model such as reset, tokens, base, components, states, and utilities. The exact expression of that layering may be via `@layer`, stylesheet modules, or both, but the conceptual ordering shall remain fixed.

The framework shall maintain a shared foundation stylesheet for reset, base, and common utility rules. It shall maintain component-level stylesheets for major component families. It shall use constructable stylesheets and `adoptedStyleSheets` where supported. If `adoptedStyleSheets` is unavailable, the framework shall fall back to injecting a `<style>` element into the shadow root using cached stylesheet text. The source-of-truth stylesheet content shall remain equivalent across both paths.

AE00. Public parts contract

The framework shall expose a limited stable parts contract for styling and inspection. The version-one supported parts shall include only the parts that the framework intentionally documents. Those parts shall include at least `titlebar`, `body`, `tablist`, and any other parts that the core components already expose intentionally. Additional internal element names shall not be treated as public API merely because they exist in the DOM. This resolves the earlier ambiguity between example part names and supported part API.

AF00. Host-page isolation rules

The framework shall assume that host pages may be hostile, messy, or unusual. Host pages may include global resets, transforms, aggressive z-index usage, capture-phase event listeners, keyboard interference, CSS variable pollution, or unusual box-model rules. The framework shall protect itself primarily through Shadow DOM, explicit top-level mounting, and namespaced tokens. It shall avoid leaking styles into the host page. It shall avoid depending on the host page's CSS, DOM structure, or reset behavior.

The framework itself shall mutate only its own mount point and narrowly scoped integration hooks required for bookmarklet behavior. Tool modules built on top of the framework may interact with the host page's DOM for their own purposes, but that tool behavior is outside the core framework contract.

AG00. Event policy

The framework shall minimize global event listeners. It shall prefer listeners on its own components and root surfaces. When document-level or window-level listeners are necessary, they shall be limited, explicit, and removable. Capture-phase listeners shall be used only where required by correct interaction behavior, such as certain drag, resize, or outside-dismiss flows. The framework shall not stop propagation broadly. It shall stop propagation only when doing so is necessary to preserve framework-owned behavior. The framework shall remain a good citizen on the page while still being resilient enough to operate in arbitrary host environments.

AH00. Z-index policy

The desktop root shall use a very high base z-index so that bookmarklet windows remain visible above typical page content. Internal window stacking shall be controlled numerically by the window manager. Windows shall not use ad hoc arbitrary z-index values independent of the manager. Menus, popups, and related surfaces shall stack above the window content within the framework's own stacking model. The framework shall not rely on page-local stacking assumptions.

AI00. Packaging and build policy

The repository shall use Bun for build orchestration and bundling. Lit shall be installed through npm and pinned. The build shall produce a bookmarklet-friendly runtime artifact and a development-friendly artifact. Development output shall prioritize inspectability and debugging. Production output may optimize size, but the framework shall not adopt opaque build strategies that make bookmarklet debugging impractical.

The build shall not require runtime network fetches for framework dependencies. The shipped bookmarklet runtime shall be self-contained relative to its bundled dependency set.

AJ00. Repository structure

The repository shall remain organized around a stable structure. The `src/core/` area shall contain constants, theme logic, shared style logic, geometry helpers, define helpers, command helpers, and similar foundational code. The `src/components/` area shall contain the web components and Lit-based elements. The `src/controllers/` area may be used for extracted interaction controllers as the framework matures. The `src/bookmarklet/` area shall contain the bookmarklet bootstrap. The `src/demo/` area shall contain the component catalog and practical playground. The `demo/` directory may contain a shell page for exercising the demo in the browser. A `test/` area shall be added as formal tests are introduced.

The current implementation already reflects much of this structure, and that direction is adopted by this specification.

AK00. Demo and catalog requirement

The project shall include an interactive component catalog or playground page. This is not optional. The catalog is part of the framework development workflow. It shall serve as a lightweight storybook-like environment for exercising the desktop root, windows, menu bar, menus, buttons, icon buttons, inputs, textarea, tabs, listbox, and status bar. It shall also provide at least one example of spawning live floating windows against the singleton root. The existing demo direction is correct and shall remain part of the project.

AL00. Example tool requirement

The first release shall include one small example bookmarklet tool built on top of the shared primitives. The example tool shall demonstrate that the framework is sufficient to build a real interface without ad hoc styling that bypasses the design system. The example tool does not need to be a complex production utility. It may be a simple demo shell, page metadata viewer, note panel, or similarly narrow bookmarklet app. What matters is that it proves the framework can support a real windowed tool end to end.

AM00. Accessibility baseline

The framework shall meet a practical version-one accessibility baseline. All core interactions shall be keyboard operable. Focus indicators shall remain visible. Menus, tabs, listboxes, and any dialog-like surfaces shall use appropriate roles and states. No critical action shall be available only through pointer input. Disabled states shall remain understandable. Text contrast shall remain strong enough for utility use, including on translucent title bars. Accessibility in version one is not a decorative add-on. It is part of the base implementation standard.

AN00. Performance baseline

The framework shall remain lightweight and responsive. Shared stylesheets shall be reused where possible. Large-area blur shall not be used. Drag and resize interactions shall avoid avoidable layout thrash. The framework shall not duplicate the desktop root or custom-element registrations across repeated bookmarklet execution. The runtime shall stay small enough to remain reasonable for bookmarklet use on arbitrary pages.

AO00. What the framework shall not do in version one

The framework shall not port the old reference CSS structure literally. It shall not start with many skins. It shall not begin with dark mode. It shall not begin with a full desktop environment, taskbar, or icon field. It shall not attempt to mimic every historical detail of Windows 3.11. It shall not create a large dependency surface. It shall not introduce advanced data-grid, tree-view, or inspector frameworks into the first milestone. It shall not create decorative visual complexity that weakens the practical shell.

These constraints are now normative and no longer phrased as tentative taste.

AP00. First milestone

The first milestone shall deliver a stable reusable bookmarklet window shell. That milestone shall include the singleton desktop root, the window manager, the core window component, title bar behavior, resizing, dragging, active and inactive window states, menu bar, menus, buttons, icon buttons, input, textarea, tabs, listbox, status bar, tokenized default theme, shared style infrastructure, and the interactive catalog page. It shall also include at least one example tool shell.

The first milestone shall not require dialogs as a full feature area, multi-theme switching, docking, snapping, multiselect listboxes, rich data grids, or advanced visual skins.

AQ00. Acceptance criteria

The first milestone shall be accepted only when all of the following are true.

The same bookmarklet can be executed repeatedly without duplicating the desktop root unsafely.

At least one window can be created, focused, dragged, resized, and closed reliably.

The title bar correctly supports the left-side system affordance, including single-click menu behavior and double-click close behavior.

The title bar material treatment has a deterministic fallback when blur is unavailable.

The menu bar and menus are keyboard-usable and pointer-usable.

The input, textarea, tabs, listbox, and status bar are visually coherent with the shell.

The framework survives on arbitrary host pages without obvious style collapse or root duplication.

The example tool can be built using shared primitives without bypassing the framework's design language.

AR00. Final directive summary

The AWW Bookmarklet UI Framework shall be implemented as a compact, reusable, retro-modern bookmarklet UI shell based on Windows 3.11 inspired interface grammar and modern browser architecture. It shall use web components, open Shadow DOM, modern CSS, modern JavaScript modules, Bun bundling, and Lit installed through npm and bundled locally. It shall derive its design vocabulary from the attached base reference files and its immediate architectural direction from the existing initial implementation. It shall preserve explicit utility chrome and compact interaction while modernizing only where that improves layering, readability, and host-page resilience. It shall begin with one strong default visual treatment, one stable floating-window shell, and one disciplined component set. From that base, future bookmarklet tools and future framework growth shall proceed incrementally without architectural reset.
