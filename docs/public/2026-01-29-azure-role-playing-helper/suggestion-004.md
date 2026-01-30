2026-01-29

Q00 Appendix: Auto-generated handwritten access diagram (read-only)

Q10 Purpose and user value

The diagram is a visual receipt of the scenario the user has composed in the narrative. It reinforces the mental model that the textual guidance describes: a principal is used by a runtime to call a target service, and access is granted by a specific role at a specific scope. It exists to reduce misunderstandings that commonly occur when users conflate identity, compute, subscription boundaries, and RBAC scope.

The diagram is strictly read-only. The user cannot move nodes, edit labels, or add connections. The diagram updates automatically as the form-in-text selections change.

Q20 Scope and non-goals

In scope is a single fixed-topology diagram that renders a maximum of three nodes (Principal, Runtime, Target) and two directed edges (Principal -> Runtime, Runtime -> Target), plus one or two subscription containers behind them, plus a small legend.

In scope is a responsive layout that adapts to available width by switching between a horizontal layout and a vertical layout at a deterministic breakpoint.

In scope is user-controlled resizing of the diagram area (container height) without editing the diagram content. Resizing affects only the diagram viewport, not the logical structure.

Out of scope is any general diagramming capability, arbitrary graphs, auto-layout beyond the fixed layouts defined here, drag-and-drop, zoom-to-edit, or exporting.

Q30 Rendering technology and containment

The diagram must be rendered as SVG inside a dedicated container below the generated guidance section. The SVG is regenerated on each scenario change, but the container element remains stable to avoid layout jumps.

The diagram container must have:
A title line, "Diagram".
A short hint line indicating it is generated and read-only.
A fixed minimum height and a user-adjustable height.

The diagram must not be rendered until the base scenario is available. If the scenario is incomplete in a way that would produce misleading subscription semantics, the diagram shows a placeholder state (Q80).

Q40 Visual grammar

Q41 Node types and shapes

Principal node:
Shape is a rounded capsule (pill) or circle-with-label, with a subtle hand-drawn stroke.
Label is the principal type label (for example "User-assigned managed identity").
Optional sublabel is the principal category (for example "Principal") in small text.

Runtime node:
Shape is a rounded rectangle with a subtle hand-drawn stroke.
Label is the runtime label (for example "Azure Functions").

Target node:
Shape is a rounded rectangle with either a slightly heavier stroke or a small corner fold motif to distinguish it from runtime.
Label is the target service label (for example "Azure Storage: Blob").

All nodes must be visually consistent with the CalmRBAC editorial theme: calm colors, soft strokes, minimal fill tint. No glossy effects, no heavy shadows, no bold iconography.

Q42 Edges and direction

There are exactly two directed edges:
Edge 1: Principal -> Runtime.
Edge 2: Runtime -> Target.

Edges must be drawn as curved or slightly arced paths, not perfectly straight lines, to support the hand-drawn style. Each edge ends with a single arrowhead marker. Arrowhead styling must match stroke tone and width.

Edges must not overlap node labels. Edge routing is fixed by layout and must not require collision resolution.

Q43 Edge labels and intent badges

The edge Runtime -> Target must include a label that contains:
The recommended role name (or role family summary when role is not a single fixed built-in role).
The scope summary (for example "Scope: container" or "Scope: vault").

The label must be readable and must not exceed a maximum line count:
In horizontal layout: max 2 lines.
In vertical layout: max 3 lines.

An intent badge is shown adjacent to the edge label. It must encode one of: read, write, administer, manage-resource. The badge is small, calm, and text-based with an optional pictogram glyph. It must not look like a modern "chip" component; it should feel editorial.

Q44 Subscription containers

The diagram uses soft containers to visualize subscription boundaries:
Same-subscription mode: one container labeled "Subscription" with optional subscription ID shown only if known.
Cross-subscription mode: two containers labeled "My subscription" and "Target subscription", optionally showing their IDs if provided and valid.

Container styling:
A rounded rectangle or soft outline behind nodes.
Very subtle fill tint and border.
Title text at top-left of the container, small and calm.

In cross-subscription mode, the Runtime -> Target edge must visibly cross from the source container to the target container. No additional visual effects are required; crossing the boundary is sufficient.

Q45 Legend

A small legend must appear below the SVG or inside the SVG at a consistent corner (bottom-right preferred). It must include:
A mapping from intent badge to meaning: read, write, admin, manage resource.
A single sentence clarifying what arrows represent: token-based request from runtime to target and authorization by RBAC at scope.

Legend text must be short and never dominate the diagram.

Q50 Handwritten whiteboard style requirements

The "handwritten" look must be achieved by subtle imperfection, not by degrading readability.

Required characteristics:
Strokes use round linecaps and round joins.
Strokes have slight wobble: paths are not perfectly geometric.
Borders and arrows have consistent stroke weight across the diagram.

Determinism requirement:
The wobble must be stable for a given scenario selection. It must not change on every render. Use a deterministic seed derived from the scenario (principal type, runtime, service, intent, scope). The same selections must produce the same wobble so the diagram feels stable.

Text styling:
Primary labels must remain highly readable. Use the product’s serif typography by default.
If a script-like font is used to enhance handwritten feel, it must be limited to small accents (for example container titles or the "Diagram" hint), not the main node labels, unless readability can be guaranteed across platforms. The default safe requirement is: keep node labels in the same serif family as the rest of the page.

Texture and noise:
Optional. If used, it must be extremely subtle and must not create visual grain that affects text clarity.

Q60 Resizing and responsiveness

Q61 User-controlled resizing

The diagram container height is user-resizable. The user can resize vertically only.

Implementation constraints:
Use a simple native resizable container or a small custom handle at the bottom edge of the diagram area.
Resizing changes only the viewport height. The diagram layout scales to fit the available height without clipping labels.
Resizing does not affect other content positioning except natural flow.

Persistence:
Optional. If persistence is implemented, it must be local-only (for example localStorage). If not implemented, default height is acceptable. If persistence is implemented, it must be deterministic and not store any scenario content, only a numeric height value.

Q62 Responsive layout modes

The diagram has exactly two layout modes:

Horizontal layout (default):
Nodes laid left-to-right: Principal on the left, Runtime centered, Target on the right.
Subscription containers span behind nodes. In cross-subscription mode, containers occupy left and right halves with a visible boundary gap.

Vertical layout (narrow screens):
Nodes stacked top-to-bottom: Principal, then Runtime, then Target.
Subscription containers stack similarly: "My subscription" container behind Principal and Runtime, "Target subscription" container behind Target.

Breakpoint rule:
Switch to vertical layout at a fixed width threshold (for example 720px). The threshold must be a single constant.

Q70 Data mapping from scenario to diagram

The diagram content is derived from the same internal data model as the textual guidance.

Node labels:
Principal node label equals the principal selection label.
Runtime node label equals the runtime selection label.
Target node label equals the target service selection label.

Edge label content:
Role: use the computed suggested role line. If the tool uses a role family summary, the diagram uses the summary.
Scope: use the selected scope level label (for example "container", "vault", "namespace"), not a full resource ID string.

Subscription container labels:
If same-subscription: label "Subscription" and optionally include subscription ID only if it is available in the scenario model. If the UI does not collect subscription ID in same-subscription mode, do not display an ID.
If cross-subscription: label "My subscription" and "Target subscription". Show IDs only if the respective fields exist and are syntactically valid.

Q80 Placeholder and incomplete states

The diagram must never show misleading cross-subscription semantics.

Placeholder rule:
If cross-subscription mode is selected and either subscription ID is missing or invalid, the diagram area shows a placeholder state instead of rendering the full containers.

Placeholder design:
A calm, lightly outlined empty canvas with a single short message:
"Complete subscription IDs to render the boundary diagram."
The message must be consistent with the product tone and must not appear as an error.

In same-subscription mode, the diagram always renders.

Q90 Accessibility requirements

The diagram container includes a text alternative describing the current scenario in one sentence. This can be placed as visually hidden text adjacent to the SVG.

The SVG must have:
A title element and a desc element.
Aria attributes so screen readers can identify it as a generated diagram.

The diagram must not be the only place where critical information is displayed. The role, scope, and steps must remain in the textual guidance.

Q100 Performance and stability requirements

Diagram rendering must be lightweight. No external libraries.

Re-rendering must not cause flicker. The container remains stable. Prefer updating the SVG content node in place rather than removing and re-inserting the entire section.

Deterministic wobble seeding is mandatory to prevent motion-like jitter on each render.

Q110 Implementation checklist (diagram-specific)

The implementer must confirm each item below.

The diagram renders as SVG and is placed below the textual guidance, within the main card.

There is exactly one topology: three nodes and two arrows. No extra nodes or edges exist in any state.

The diagram is read-only with no drag handles, no edit affordances, and no interactive editing.

The diagram container height is user-resizable vertically. Resizing does not distort text or clip labels.

The diagram switches between horizontal and vertical layout at a fixed breakpoint.

Cross-subscription mode displays two subscription containers only when both subscription IDs are present and syntactically valid; otherwise it shows the placeholder state.

Role and scope appear on the Runtime -> Target edge label, and intent is encoded with a small calm badge.

The handwritten look is implemented via subtle deterministic wobble and round strokes, without compromising readability.

The legend is present, short, and consistent.

The diagram includes accessible title/description and a text alternative outside the SVG.
