# Documentation index

Read in order:

1. **[00-combined-reference.md](00-combined-reference.md)** — the joint overview, explicitly preserving the two independent analyses and their relationship.
2. **[01-chat-ui-ux-analysis.md](01-chat-ui-ux-analysis.md)** — detailed UI review of the supplied SovietRDTL source, including layout, component behavior, editing ideas, dark backgrounds, copying, and accessibility.
3. **[02-extension-engineering-analysis.md](02-extension-engineering-analysis.md)** — detailed browser extension review, with the exact source paths for Dexie, settings, worker, messages, UI framework, Bun, and export tools.
4. **[03-proposed-app-brief.md](03-proposed-app-brief.md)** — product goal, accepted constraints, explicitly proposed architecture, and unresolved design questions.
5. **[04-source-map.md](04-source-map.md)** — inspect source files by purpose with original paths preserved.
6. **[05-assets-and-licenses.md](05-assets-and-licenses.md)** — vendors, backgrounds, licenses, and usage status.
7. **[06-prototypes-and-tests.md](06-prototypes-and-tests.md)** — implementation-agent checklist and validation experiments.
8. **[07-original-wizard-and-recovery.md](07-original-wizard-and-recovery.md)** — the original PowerShell questionnaire and crash-recovery inspiration.

## Visual diagrams

- [Reader/editor desktop layout](../diagrams/01-desktop-layout.svg)
- [Document creation/editing lifecycle](../diagrams/02-document-workflow.svg)
- [Feature-oriented web architecture](../diagrams/03-feature-architecture.svg)
- [Worker/request flow](../diagrams/04-worker-message-flow.svg)
- [Settings propagation](../diagrams/05-settings-flow.svg)
- [Mobile interaction concept](../diagrams/06-mobile-layout.svg)

These diagrams are vector files; they can be edited in any SVG-compatible editor. They depict **proposed GTL UX/architecture**, not the literal runtime structure of either reference project.

## Status terminology

- **Observed** — verified directly in extracted source.
- **Proposed** — an architectural or interaction recommendation for the GTL application.
- **Pending** — a decision or technical experiment not yet validated.
