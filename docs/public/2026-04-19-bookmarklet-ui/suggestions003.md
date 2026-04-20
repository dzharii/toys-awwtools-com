2026-04-19

A00. Performance specification

This document is the performance specification for the AWW Bookmarklet UI Framework. It is a separate normative document that complements the main project specification. Its purpose is to define the performance and responsiveness rules that the implementer shall follow at all times while building, extending, or refactoring the framework. This document exists to prevent performance degradation on arbitrary host pages, to preserve responsiveness during direct manipulation, and to ensure that the bookmarklet UI remains safe to run on pages that are already expensive.

This document is directive. It is not advisory. It defines what the implementer shall consider, what the implementer shall avoid, what failure modes the implementer shall anticipate, and what mitigation strategies shall be built into the framework from the start. Any implementation decision that conflicts with this document shall be treated as a design issue and resolved before the implementation is considered complete.

B00. Performance model

The framework shall be designed around the fact that it runs on third-party pages that may already be slow, overloaded, visually complex, or event-heavy. The framework does not control the host page. It therefore shall assume hostile performance conditions by default.

The framework shall be optimized for two distinct performance modes. The first mode is idle mode. Idle mode means the UI is mounted but the user is not currently dragging, resizing, typing, opening menus, or otherwise interacting with the framework. In idle mode, the framework shall perform near-zero recurring work. The second mode is interaction mode. Interaction mode means the user is actively moving a window, resizing a surface, navigating a menu, typing into a control, or otherwise manipulating the UI. In interaction mode, the framework may perform bounded work, but that work shall be tightly limited, frame-aware, and localized to the active surface.

The implementer shall always think in terms of idle cost versus interaction cost. These costs shall not be mixed. Anything that introduces steady idle work must be treated as a risk unless it is essential and explicitly justified.

C00. Primary performance goal

The primary performance goal of the framework is that the presence of the bookmarklet UI shall not noticeably degrade the host page when idle, and that direct interactions with the bookmarklet UI shall remain responsive and visually stable under normal use on modern desktop-class browsers.

This means the framework shall protect two things at the same time. First, it shall protect the user from the bookmarklet UI making the page feel slower overall. Second, it shall protect the bookmarklet UI itself from becoming sluggish or unstable while the user is working with it.

D00. Secondary performance goals

The framework shall also satisfy the following secondary goals.

The framework shall scale cleanly for the intended version-one window count, which is a small number of concurrent windows rather than a full desktop environment.

The framework shall degrade gracefully under load. When performance pressure increases, the framework shall preserve the correctness and usability of core interactions before it preserves optional visual fidelity.

The framework shall not accumulate performance debt over time through leaked listeners, retained DOM references, repeated registration, redundant style injection, or repeated root creation.

The framework shall preserve responsiveness under viewport changes, browser zoom, narrow viewports, and host-page contention.

E00. Performance assumptions

The implementer shall assume that any or all of the following may be true on a host page.

The page may already have a large DOM tree.

The page may already be running many observers, timers, or animations.

The page may already be using heavy CSS, sticky layers, video overlays, or dynamic layouts.

The page may already attach document-level capture listeners or pointer listeners.

The page may already be close to the frame budget before the bookmarklet UI is injected.

The page may re-render aggressively when layout or style changes occur.

The page may run inside constrained viewport conditions, including split-screen, browser side panels, high zoom, or small desktop windows.

The performance specification exists because these assumptions are normal, not exceptional.

F00. Idle work rules

When the framework is idle, it shall avoid recurring work. No component shall poll for state. No component shall continuously measure layout. No component shall run an animation loop merely to maintain visual presence. No global scheduler shall run when there is no active interaction that requires it.

Observers, timers, and listeners shall be created only when necessary and removed when no longer needed. The idle framework shall not maintain hidden processing merely to keep optional visual features alive. The implementer shall treat idle overhead as a first-class regression category.

If a feature introduces idle cost, the implementer shall ask whether that feature can be made event-driven, deferred, or disabled by default. If not, the feature shall be reconsidered.

G00. Interaction work rules

During direct interaction, the framework shall remain responsive by ensuring that work is bounded, localized, and frame-aware. Raw input events may arrive more frequently than the screen can update. The framework therefore shall not treat every raw input event as a signal to perform unlimited DOM work.

Pointer events, keyboard events, and other high-frequency input shall update internal state immediately if needed, but visible DOM commits shall be coalesced so that the framework performs at most one visual update per frame for a given active interaction path.

This is one of the central rules of the performance specification. The implementer shall not bypass it casually.

H00. Frame-coalescing requirement

All high-frequency direct-manipulation interactions shall use frame-coalesced rendering. This includes at least dragging, resizing, and any future continuous gestures or interactive overlays.

The required model is as follows. Input events may record the latest intended state immediately. Visual DOM writes shall then be flushed in a single `requestAnimationFrame` step. If several input events arrive before the next frame, only the latest relevant state shall be rendered. Intermediate stale states shall be discarded.

This requirement exists to prevent event storms from turning into DOM storms. The implementer shall treat direct DOM writes inside raw pointermove handlers as a high-risk pattern and avoid them unless the write is known to be trivial and cannot accumulate.

I00. Dragging policy

Dragging shall be implemented with a transform-first strategy whenever possible. During active dragging, the window should move visually using a compositor-friendly translation path rather than committing layout-affecting position values on every raw pointer event. Final geometry shall be committed at the end of the drag, or at a bounded cadence no more than once per frame if intermediate committed state is required.

This means the implementer shall distinguish between preview position and committed position. The preview position is what the user sees during the drag. The committed position is the authoritative geometry stored by the window manager.

The reason for this rule is that repeated `left` and `top` writes on every pointermove can create unnecessary layout and paint pressure. On pages that are already busy, this can make dragging feel sticky, laggy, or uneven. The transform-first rule is intended to protect both the bookmarklet UI and the host page from that avoidable cost.

J00. Resizing policy

Resizing is inherently more expensive than dragging because size changes often affect internal layout. The framework therefore shall treat resize as a high-cost interaction and constrain it accordingly.

Resize updates shall be visually committed no more than once per frame. The implementer shall avoid chaining multiple DOM reads and writes during a single resize step. Size-dependent recalculation shall be minimized while the pointer is down. Internal content that depends on the final size should defer non-essential recalculation until the resize completes or until the next coalesced frame boundary.

The implementer shall not assume that because resizing must touch width and height, unrestricted raw pointer-driven writes are acceptable. Resize requires extra discipline, not less.

K00. Layout read and write discipline

The framework shall follow a strict layout read/write discipline. Geometry reads such as `getBoundingClientRect()`, viewport measurements, and computed dimensions shall be grouped before layout-affecting writes whenever possible. The framework shall not alternate between reads and writes repeatedly in the same interaction step unless there is a strong unavoidable reason.

The implementer shall be aware of forced synchronous layout as a primary performance risk. A seemingly harmless pattern such as reading a rect, writing width, reading another rect, writing another style, and then reading again can introduce layout thrash. This kind of work often becomes visible only under stress, which is why it must be prevented structurally rather than discovered late.

L00. Viewport and geometry rules

The framework shall use `visualViewport` when available and shall otherwise fall back to layout viewport measurements. All geometry operations shall be bounded by the framework's geometry policy. Window movement and resize logic shall preserve minimum visible title-bar area and minimum usable dimensions.

The implementer shall not create alternate geometry logic inside individual components. All clamping, spawn calculation, and viewport reaction shall be centralized. This prevents performance and correctness drift.

Viewport changes such as resize, zoom-like effects, split-screen adjustments, or browser chrome changes shall cause only the minimum required repositioning work. Reactions to viewport changes shall iterate only over live windows that actually need clamping or correction.

M00. Responsive shell rules

Responsiveness for this framework is not the same as responsive web page layout. Here, responsiveness means that the shell remains usable under constrained dimensions and changing viewport conditions without unnecessary performance cost.

The framework shall support three shell states. The first is normal state. The second is compact state. The third is constrained state.

In normal state, the full shell is shown with title bar, optional menu bar, standard padding, optional status bar, and default internal density.

In compact state, the shell reduces chrome density. Padding may tighten. Title text truncation may occur earlier. Optional secondary status segments may collapse. Menu triggers may become more compact. The goal is to preserve usability when space is reduced.

In constrained state, only essential shell affordances shall be guaranteed. The title bar, close or system affordances, and the main content surface shall remain usable. Optional chrome may collapse, stack, or simplify.

The implementer shall ensure that these shell states are driven by clear rules rather than accidental overflow behavior. A shell that merely fits inside the viewport but becomes awkward to operate is not responsive enough.

N00. Responsive content rules

The shell alone is not enough. Tool content placed inside the shell shall also be expected to follow a compact utility-content model. Internal layouts should fall back cleanly to single-column flow under narrow width. Secondary controls should wrap or stack rather than overflow unpredictably. Status information should collapse intelligently. Body content should scroll internally rather than forcing shell breakage.

This rule exists because a window can be geometrically responsive while its contents remain functionally broken. The implementer of framework primitives shall provide enough layout guidance and example usage that tools built on top of the framework inherit good responsive defaults.

O00. Visual effects budget

The framework shall maintain a strict effects budget. Effects that are known to be expensive, such as blur, filters, and deep layered shadows, shall be used narrowly and predictably.

Title-bar translucency is permitted because it is part of the chosen visual language, but it shall remain subtle and localized. The body of the window shall not rely on blur. Large-area blur shall not be used. Inactive state styling shall prefer cheap token-based color and contrast shifts over broad `filter` effects on large surfaces whenever those cheaper changes can communicate the same state sufficiently.

The implementer shall assume that multiple overlapping windows multiply the cost of visual effects. An effect that is acceptable for one active window may become problematic when several windows, menus, and title bars are visible at once. For this reason, all effect choices shall be evaluated not only in isolation but also in realistic multi-window scenarios.

P00. Shadow and compositing rules

The framework shall use one restrained shadow family. Shadow style shall remain shallow and consistent. The implementer shall not stack multiple heavy shadows or glow effects in a way that increases compositing cost without improving clarity.

The implementer shall also think in terms of compositing layers. Transform-based dragging, narrow title-bar material, and menus may create or encourage separate layers. That is acceptable when controlled. What is not acceptable is uncontrolled layer proliferation due to broad effects on large surfaces or constantly changing filters during interaction.

Q00. Containment and isolation rules

The framework should use CSS containment selectively on self-contained internal surfaces where doing so reduces the layout and paint scope safely. Menus, status bars, tab panel interiors, and other bounded regions are candidates for containment, provided that focus, positioning, and overflow behavior remain correct.

Containment shall not be used blindly. It is a performance tool, not a default decoration. The implementer shall apply it where it reduces invalidation scope and where it does not interfere with intended rendering or interaction behavior.

R00. Listener and event-binding rules

The framework shall minimize listener count and listener churn. Component code shall prefer stable delegated handling where appropriate rather than rebinding large numbers of per-item listeners repeatedly during refresh cycles. Event listeners shall be attached once where possible, and refresh logic shall not multiply listeners over time.

The implementer shall pay special attention to code paths that rerun after `slotchange`, dynamic child replacement, or menu refresh. Any code that discovers children and then attaches handlers in a loop shall be reviewed for idempotence and duplication risk.

Listeners that exist only for active interactions, such as global pointer listeners during drag or resize, shall be attached only for the lifetime of that interaction and removed immediately afterward.

S00. Lifecycle hook rules

Lifecycle hooks such as `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`, and `slotchange` handlers shall perform only bounded work. They shall not perform expensive tree scans, repeated measurement loops, or global registration churn. They shall not do work proportional to host-page size. They shall remain local to the component and its own mounted subtree.

The implementer shall assume that lifecycle hooks can be triggered more often than expected in dynamic bookmarklet use. Therefore they must remain cheap, predictable, and side-effect disciplined.

T00. Style sharing rules

The framework shall reuse styles efficiently. Shared styles shall be provided through constructable stylesheets and `adoptedStyleSheets` where supported. When those APIs are unavailable, the framework shall use cached stylesheet text and inject a minimal `<style>` element into the shadow root. The framework shall not generate large duplicated style text repeatedly for identical components when a shared mechanism exists.

This rule is both a memory rule and a performance rule. Reusing styles reduces parse overhead, memory overhead, and repeated setup cost.

U00. Root and registration safety rules

Repeated execution of the bookmarklet shall not duplicate the desktop root or re-register elements unsafely. This is performance-critical because repeated root creation and repeated registration errors are not merely correctness issues; they can also create cumulative memory and listener overhead.

The implementer shall preserve idempotent custom-element registration, singleton root discovery, and safe bootstrap behavior at all times. Any change that risks repeated root duplication shall be treated as a performance and architecture regression.

V00. Memory discipline rules

Performance includes memory behavior. The framework shall keep temporary interaction state small and short-lived. Drag state, resize state, typeahead buffers, temporary collections, and menu-open state shall be released as soon as the related interaction ends. Closed windows shall release references. Detached DOM nodes shall not remain strongly referenced by managers, registries, or component caches.

The implementer shall actively defend against performance decay over time. A framework that starts fast but slows down after repeated open-close cycles is not acceptable. Retained references, leaked listeners, and cumulative style or DOM duplication are explicit risks that shall be checked during development.

W00. Scaling assumptions

Version one of the framework is optimized for a small number of concurrent windows rather than many-window desktop emulation. The intended operating range is a modest set of simultaneously open utility windows. The framework shall remain efficient in that range. Beyond that range, best-effort behavior is acceptable, but the implementation shall not accidentally scale poorly within the intended normal range.

This scaling assumption exists so the implementer can make focused tradeoffs without pretending the framework must handle workloads it is not designed for.

X00. Host-page contention rules

The framework shall assume that host pages may contribute significant main-thread load, expensive style recalculation, or aggressive observer behavior. The framework shall therefore avoid implementation patterns that amplify contention. It shall not do broad DOM mutation. It shall not force unnecessary layout on the page. It shall not rely on document-wide measurement loops. It shall not install global behavior that remains active while idle unless such behavior is essential.

The framework's core responsibility is to isolate itself enough that it remains usable without making the host page meaningfully worse. This must remain true even when the host page is already imperfect.

Y00. Degradation strategy

When conditions are poor, the framework shall degrade gracefully. It shall preserve correctness and direct manipulation first. Optional fidelity may be reduced before core interaction quality is sacrificed. Expensive diagnostics, optional transitions, or richer effects may be reduced or disabled if a future implementation introduces adaptive behavior, but the architecture shall already be prepared for that possibility by keeping optional features separate from core correctness.

The implementer shall not build visual features in such a way that turning them off would break the shell.

Z00. Failure scenarios the implementer shall anticipate

The implementer shall explicitly anticipate pointer-event overload. This happens when the user drags or resizes the framework window on a host page that is already busy. If raw input drives unrestricted DOM writes, frames drop and the interaction feels sticky. The mitigation is frame-coalesced updates, bounded geometry work, and transform-first dragging.

The implementer shall explicitly anticipate compositing overload. This happens when several framework windows are open, each with layered shadows, blur, inactive-state filters, menus, or other effects. During focus changes or movement, the browser recomposites too much. The mitigation is a strict effects budget and cheaper inactive-state styling.

The implementer shall explicitly anticipate lifecycle churn. This happens when repeated mounting, unmounting, slot changes, or child refreshes gradually increase listeners or repeated work. The mitigation is idempotent binding, bounded hooks, and cleanup discipline.

The implementer shall explicitly anticipate viewport stress. This happens when the user changes zoom, narrows the viewport, or uses split-screen, and the shell remains technically on-screen but functionally awkward. The mitigation is explicit compact and constrained shell modes.

The implementer shall explicitly anticipate host-page contention. This happens when the framework mixes layout reads and writes or performs broad invalidation on a page that is already heavy. The mitigation is centralized geometry logic, read/write discipline, containment, and localized DOM work.

AA00. Premature optimizations that are required now

The framework shall adopt certain early optimizations immediately because they are structural safeguards rather than speculative tuning.

The framework shall use frame-coalesced interaction updates.

The framework shall use transform-first dragging whenever possible.

The framework shall centralize geometry logic.

The framework shall reuse styles through shared stylesheets or cached style text.

The framework shall keep root mounting and registration idempotent.

The framework shall keep listeners bounded and removable.

The framework shall treat layout read/write separation as a rule, not as a later cleanup task.

These optimizations are not optional polish. They are part of the baseline architecture because they prevent a large class of predictable regressions.

AB00. Premature optimizations that are not required now

The implementer shall not over-engineer speculative systems that have no demonstrated need in version one. The framework does not need virtualization for listbox in version one. It does not need full desktop snapping. It does not need automatic performance self-tuning at runtime. It does not need complex scheduling infrastructure beyond what is required to coalesce high-frequency interactions safely.

The goal is to prevent predictable regressions, not to build a performance framework around a small utility shell.

AC00. Measurement and validation rules

Performance work shall be validated, not assumed. The implementer shall test the framework under at least three conditions. The first condition is a clean page with minimal host noise. The second condition is a heavy or noisy page with complex layout and scripting. The third condition is a constrained viewport or high-zoom environment.

The implementer shall verify that idle mode remains quiet. The implementer shall verify that repeated bookmarklet execution does not duplicate roots or cumulative listeners. The implementer shall verify that dragging and resizing do not generate more than one visual flush per frame. The implementer shall verify that opening a menu or focusing a window does not cause broad unrelated DOM work. The implementer shall verify that viewport changes scale with the number of open windows rather than the size of the host page.

This validation may begin as a manual checklist but shall become part of the framework's acceptance practice.

AD00. Performance review checklist

Whenever the implementer adds or changes a component, interaction, or service, the following questions shall be asked.

Does this feature add idle work when nothing is happening?

Does this feature bind listeners repeatedly or in a way that can accumulate?

Does this feature perform layout reads after layout writes in the same step?

Does this feature write DOM in response to every raw pointer event?

Does this feature introduce broad visual effects on large surfaces?

Does this feature remain usable under narrow or constrained shell conditions?

Does this feature create DOM or style duplication across repeated tool launches?

Does this feature clean up all references and listeners when removed?

If any answer indicates risk, the implementation shall be revised before it is considered complete.

AE00. Performance acceptance criteria

A change shall satisfy the performance specification only when it preserves near-zero idle overhead, keeps direct manipulation responsive, avoids duplicate roots and registrations, bounds lifecycle work, limits effects cost, and remains usable under constrained viewport conditions.

A feature that is visually attractive but causes drag stutter, resize hitching, cumulative memory growth, or noticeable host-page slowdown is not acceptable. Performance is part of correctness for this framework.

AF00. Final directive summary

The implementer shall treat performance as a core architectural dimension of the AWW Bookmarklet UI Framework. The framework runs on arbitrary pages and therefore must defend both itself and the user from avoidable slowdowns. It shall remain nearly free when idle. It shall remain bounded and frame-aware during direct manipulation. It shall use transform-first dragging, coalesced DOM updates, strict layout read/write discipline, selective containment, restrained effects, centralized geometry, efficient style sharing, and rigorous cleanup. It shall remain responsive under viewport stress and host-page contention. It shall degrade gracefully under load. It shall be validated under realistic conditions rather than assumed to be fast because the code appears simple. This performance specification shall remain in force for all implementation work on the project.
