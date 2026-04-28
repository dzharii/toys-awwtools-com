2026-04-26

see the following file that contains implementation checklists plus some additional instructions for OpenAI Codex: suggestions001-6.md

A00 Appendix C: UI Framework Directive

---

This appendix defines the user interface implementation rule for the Topic Research Notepad proof of concept. The application must be built using the provided retro-style web component and CSS library that was shared at the beginning of the project discussion.

The UI framework is not just visual inspiration. It is the required foundation for the application's interface.

---

B00 Required UI Foundation

---

Codex must use the provided retro-style UI library to build the application interface.

The library will be available in the project through source files, distribution files, or both. Codex should inspect the provided implementation and use its components, CSS conventions, layout primitives, and interaction patterns as the main UI vocabulary for the Topic Research Notepad.

The application should not introduce a separate unrelated visual system. It should not be implemented as a generic modern web app with unrelated CSS. It should look and behave as part of the provided retro tool ecosystem.

---

C00 Visual and Interaction Intent

---

The Topic Research Notepad should feel like a compact local productivity tool. It should use the same retro desktop-utility language as the existing library: framed panels, dense controls, toolbars, sidebars, tabs where appropriate, command rows, status strips, small action buttons, structured cards, and clear visual boundaries.

The interface should communicate that the app is a local instrument for collecting and organizing research. It should not feel like a blank consumer document editor or a generic dashboard.

The provided library should guide the design of the main shell, page sidebar, editor panel, block controls, source cards, table controls, search surface, status feedback, export controls, and error states.

---

D00 Permission to Modify the UI Library

---

Codex is allowed to modify the provided UI library if needed.

This includes modifying existing components, extending component APIs, adding new components, adjusting CSS, adding utility classes, fixing bugs, improving ergonomics, or creating application-specific components that are good candidates for later extraction into the main library.

This permission exists because the proof of concept should also help grow the UI library. If the Topic Research Notepad needs a component that does not exist yet, Codex may implement it in the library style rather than working around the missing component with unrelated ad hoc UI.

---

E00 Preferred Library Extension Approach

---

When Codex adds or changes UI library functionality, it should keep the library coherent.

New components should follow the naming, styling, structure, and API conventions of the existing library. They should not introduce a competing component philosophy.

Codex should prefer reusable primitives when a need appears more general than this one application. For example, a page sidebar item, status strip, block toolbar, source card, split-pane shell, compact command band, or editable grid may be useful beyond this app. Such pieces can be implemented as library-level components or clearly separated candidate components.

Application-specific behavior should remain in the app when it is not generally reusable. For example, IndexedDB save status, research page block rendering, and source-link persistence logic belong in the app. Generic visual primitives can belong in the library.

---

F00 Documentation Requirement for Library Changes

---

If Codex modifies the UI library, it should document the change.

The documentation can be placed in an implementation note, decision note, or library change note in Markdown. The note should explain what was added or changed, why the change was needed for the Topic Research Notepad, whether the change is application-specific or generally reusable, and whether it should be merged back into the main UI library later.

If a new component is added, Codex should document its intended use, public attributes or properties, events, slots if any, and basic styling expectations.

---

G00 No Parallel UI System

---

Codex should not build a parallel visual system beside the provided library.

App-specific CSS is allowed, but it should be integration CSS: layout rules, spacing adjustments, editor-specific behavior, and minor app-level styling. It should not replace the retro framework with a separate unrelated design system.

If Codex finds that the current library lacks a necessary component, it should either compose existing components or extend the library. It should not bypass the library by creating a visually incompatible custom interface.

---

H00 App Shell Expectations

---

The application shell should be built from the library's visual language.

The expected high-level UI includes a top command band, a page navigation sidebar, a main editor panel, optional local toolbars, block-level controls, search input, export controls, and bottom status strip.

Each of these areas should use the provided components or compatible components added by Codex. Panel borders, button styling, input styling, typography, spacing, and status affordances should remain consistent with the library.

---

I00 Editor Block Expectations

---

The editor blocks should also follow the library style.

Paragraph blocks may appear as clean editable rows or lightly framed content regions. Quote blocks should visually distinguish quoted material using library-compatible framing. Source link blocks should render as compact retro cards. Table blocks should use compact grid styling consistent with the library. Code blocks should use a monospaced framed region. Block toolbars should use compact retro buttons or command controls.

Pasted content must be normalized into these application-rendered block types. It must not carry external web page styling into the editor.

---

J00 When to Add New Components

---

Codex should consider adding a new library component when the same UI pattern appears more than once, when the pattern is likely reusable across tools, or when the current app would otherwise require a large amount of ad hoc markup.

Possible candidate components include a split-pane application shell, compact sidebar list, command band, status strip, editable card, source card, block toolbar, inline empty state, compact table editor, and search result list.

Codex should not over-abstract too early. A component should be added when it improves clarity or consistency, not merely because every visual element could become a component.

---

K00 Compatibility With Future Extension Integration

---

Because the application may later be integrated into the browser extension, UI code should avoid assumptions that only work on a standalone full page.

The application should be mountable into a container. Library components and app-specific styles should avoid broad global selectors where practical. Codex should prefer scoped classes, component encapsulation, or clear app root boundaries.

This does not require perfect Shadow DOM isolation in the proof of concept, but the UI should be written with future DOM injection in mind. A later extension version will need to coexist with arbitrary web page styles, so the standalone version should not become dependent on fragile global CSS leakage.

---

L00 Codex Direction

---

Codex must build the Topic Research Notepad UI using the provided retro-style web component and CSS library.

Codex may extend or modify the library when needed. Such changes are allowed and encouraged when they make the application cleaner, more consistent, or more reusable. Any meaningful library changes should be documented so they can be reviewed and potentially merged back into the main library.

The UI framework is a project requirement, not an optional reference.

