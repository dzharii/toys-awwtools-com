# CalmRBAC — Azure Role Assignment Helper

CalmRBAC is a single-page guide that helps teams plan Azure RBAC role assignments with clarity and least-privilege intent. It turns a few choices about who needs access, what they need to do, and where the resource lives into concrete scope guidance, role selections, and ready-to-run examples.

Value
- Reduces RBAC guesswork by translating intent into the right built-in role and scope language.
- Keeps assignments narrow by surfacing scope tradeoffs and service-specific constraints.
- Shortens handoffs between humans and infrastructure by producing copy/paste-ready examples.

What it does
- Guides users through a narrative flow for principal type, access method or workload, intent, target service, subscription relation, and scope level.
- Emits step-by-step guidance and validations, including cross-subscription requirements and service-specific caveats.
- Generates PowerShell and Bicep snippets tailored to the selected role, scope, and principal identifiers.
- Collects identifiers needed to build a precise scope resource ID for each supported Azure service.
- Visualizes the resulting assignment with a sketched diagram for quick alignment across teams.

Key features
- Least-privilege scope recommendations per service (storage, key vault, service bus, event hubs).
- Built-in role mapping across data-plane and management-plane intents.
- Callouts for managed identity steps, portal visibility, and network gating risks.
- Debug-friendly logging and warning surfaces when identifiers or scope are incomplete.
