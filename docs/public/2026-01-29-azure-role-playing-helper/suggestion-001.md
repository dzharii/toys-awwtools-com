2026-01-29
ACK. I understand and will follow the requested specification style and quality standard.

A00 Project overview

CalmRBAC is a single-screen, zero-setup, client-only web page that helps Azure users choose the correct role assignment for common "identity X needs access to service Y" scenarios. The page blends a short narrative with embedded form controls so the user reads the scenario as natural language while making precise selections. As the user changes selections, the page immediately generates the guidance that would otherwise require searching documentation, remembering naming conventions, and mentally translating intent into the correct data-plane or management-plane role.

The primary value is speed and correctness under everyday pressure. Users do not need to know whether they should be in Access control (IAM), whether the role is a data role or a management role, whether cross-subscription changes anything, or which of several similarly named roles is the right one. CalmRBAC reduces the decision to a small number of stable concepts: who is calling, where it runs, what it needs to do, what it needs to access, and where that target lives. From that, it produces concrete, minimally permissive role and scope recommendations, along with explicit prerequisite checks that often block progress in real organizations (for example, lacking permission to create role assignments, or confusing portal navigation permissions with data access).

The interaction is designed to feel like a quiet, well-edited note addressed to the user. It should feel calm and unhurried while being operationally decisive. The typography is large and editorial. The choices are embedded in the prose so the user never feels they are "filling a form"; they feel they are clarifying a statement, and the page responds with a precise plan.

B00 Scope and non-goals

In scope is guidance for role assignment oriented access in Azure with a focus on the common path: use Microsoft Entra principals (including managed identities) and assign built-in roles at the narrowest reasonable scope.

In scope is dynamic, continuous guidance generation without a submit button.

In scope is cross-subscription guidance, including revealing additional required inputs and reflecting them in output.

In scope is explicit warnings when a target service has a distinct permission model or typical pitfalls that look like RBAC problems but are not (networking restrictions, permission model mismatches).

Out of scope is executing any Azure API calls, validating whether the role assignment actually exists, validating whether the identity can obtain a token, or validating network reachability.

Out of scope is maintaining an exhaustive catalog of Azure services and roles. The tool intentionally covers a curated set of high-frequency services and standard intents.

Out of scope is storing user input remotely or locally. The tool must be stateless beyond in-memory UI state.

C00 Implementation constraints

The implementation is a vanilla HTML, CSS, JavaScript application with separate files. No frameworks. No build tooling required. The page must run by opening index.html locally in a browser and must also run when served as static content.

All guidance text is generated locally in the browser. No network calls. No telemetry.

D00 Mental model and terminology

Principal is the security identity that will receive the role assignment. CalmRBAC supports the principal categories in D10.

Runtime is the Azure compute or integration surface that will obtain tokens and call the target service (Functions, App Service, VM, AKS, etc.). Runtime is used to tailor the wording and to remind the user that an identity must actually be configured on that runtime.

Target service is the Azure service to be accessed. Each target service has a service model describing: supported scopes (resource, sub-resource), recommended roles per intent, and service-specific warnings.

Intent is what the principal needs to do at the target service. CalmRBAC uses a small intent set so the role recommendation is deterministic.

Scope is where the role assignment is applied. Scope determines how broad the access is. CalmRBAC always prefers the narrowest scope that still matches the chosen target.

Management-plane access refers to managing Azure resource settings via Azure Resource Manager (ARM). Data-plane access refers to reading or writing the data handled by the service. CalmRBAC defaults to data-plane roles when the user chooses data intents, and only suggests management-plane roles when the user explicitly chooses a management intent.

E00 UX principles and visual identity

The page is one task on one screen. It must feel like an editorial card floating over a calm, soft background. It must not resemble a default dashboard, admin template, or AI "control panel" aesthetic.

Typography requirements: the narrative uses Georgia (or a Georgia-like serif) with italic styling for prose. Embedded controls (selects and inputs) use the same typeface but not italic, to preserve readability and scanning. The base narrative font size is large and comfortable, target range 20px to 24px on desktop, with a line height that makes the prose feel airy rather than compressed. Output guidance uses slightly smaller but still readable text, target range 16px to 18px.

Spacing and alignment requirements: the card has generous padding, consistent vertical rhythm, and minimal visual noise. The narrative paragraphs should align left and maintain consistent line width, targeting a readable measure. Controls embedded in the text must sit on the baseline, with subtle vertical adjustment if needed so they appear naturally inline.

Color requirements: use low-saturation, calm tones. The background should be a subtle gradient or layered soft shapes, avoiding high contrast. The card background should be translucent or lightly textured. Use one primary accent tone (teal or deep green) and one secondary accent tone (muted purple or warm berry) only for micro-emphasis (focus rings, subtle border accents, small brand mark). Avoid bright primaries.

Motion requirements: subtle transitions only. When conditional fields appear or disappear, animate opacity and vertical shift slightly over 150ms to 220ms. Focus states on controls should be soft and wide rather than sharp. Avoid bouncing or springy motion.

F00 Page structure and layout

The page consists of a single centered "paper" card with four regions.

Region 1, header: a small brand mark, product name, and one-line tagline. The brand mark is a simple geometric shape or layered gradient block; it should feel custom rather than icon-library generic.

Region 2, narrative form: three short paragraphs in first-person language with embedded dropdowns. The prose is the primary UI. Each dropdown reads like a phrase completion, not like a labeled form field.

Region 3, conditional fields: additional inputs appear only when needed (cross-subscription IDs, scope chooser, optional target name). These inputs are visually separated from the narrative by a light divider and spacing, but remain within the same card.

Region 4, generated guidance: a titled output area that always remains visible. It contains a short "Suggested role" hint line and a multi-paragraph guidance body. It also contains callouts for prerequisites and warnings. Callouts are styled as gentle bordered blocks, not alarming banners.

The page must be responsive. On narrow screens, the conditional field rows become a single column. Narrative remains readable, with font size reducing slightly and padding tightening while preserving comfort.

G00 Interaction model

There is no submit button. Any change to any control triggers an immediate re-render of the generated guidance. Rendering must be stable and non-jumpy; the output area must not collapse or shift dramatically between states. If output length changes significantly, it should reflow naturally without abrupt scroll jumps.

Controls in the narrative are the primary interaction points. Conditional fields appear when the user selects options that require extra detail. Conditional fields must not appear unless required by a deterministic rule (see H00).

The output must be generated even when required fields are missing, but must clearly indicate what is missing and how that affects the guidance. The tool must not silently assume subscription IDs or resource names.

H00 State model and conditional field rules

H10 Base state

Base state is when subscription relation is "same subscription". In base state, subscription ID inputs are hidden.

In base state, the scope selector is visible. The available scope options depend on the chosen target service.

In base state, the target name input is visible and optional.

H20 Cross-subscription state

Cross-subscription state is when subscription relation is "different subscription". In this state, two inputs become visible: "My subscription ID" and "Target subscription ID".

Both subscription IDs are required for the output to be considered complete. If either is empty or invalid, the output must include a callout explaining what is missing and must avoid presenting subscription-specific wording that implies the IDs are known.

H30 Service-specific scope rules

Each target service defines a set of supported scope levels. CalmRBAC must only present scopes that are meaningful for that service. If the user switches to a service with fewer scopes, the selected scope must reset to that service's default scope deterministically.

Default scope rule: choose the narrowest scope that is commonly assignable in the portal for that service and maps to the user intent, typically "sub-resource" when applicable, otherwise "resource".

H40 Principal-specific messaging rules

If principal is a managed identity (system-assigned or user-assigned), the output must include a managed identity callout that states: the runtime must be configured to use that identity and must obtain a Microsoft Entra token at runtime; the target service does not "pull" the identity.

If principal is a user or group, the output must include a portal usability note if the chosen service is commonly tested via the portal and may require additional management-plane Reader permissions for navigation.

I00 Inputs and allowed values

I10 Principal type options

Allowed values are: user, group, service principal (app registration), managed identity (system-assigned), managed identity (user-assigned), workload identity (OIDC federation).

Default value is managed identity (user-assigned), because the tool is primarily oriented around service-to-service access.

I20 Runtime options

Allowed values are: Azure Functions, Azure App Service, VM or VM scale set, AKS, Logic Apps, Other.

Default value is Azure Functions.

I30 Intent options

Allowed values are: read data, write data, administer access or data, manage the Azure resource (settings).

Default value is read data.

Interpretation rule: "manage the Azure resource (settings)" is management-plane intent and must produce management-plane role guidance. All other intents are data-plane intents and must produce data-plane role guidance.

I40 Target service options

Allowed values are the curated list in J00.

Default value is Azure Storage (Blob / ADLS Gen2).

I50 Subscription relation options

Allowed values are: my current subscription, a different subscription.

Default value is my current subscription.

I60 Subscription ID validation

Subscription ID inputs are validated as GUID-like strings of the form 8-4-4-4-12 hex. Validation is syntactic only. If invalid, show a callout in output that states the expected format.

I70 Target name input

Target name is optional free text. It is used only to make the output more concrete, displayed as monospaced inline text. It must never be required for output completeness.

J00 Service catalog and role mapping

This section defines the first-release catalog. The implementer must encode these mappings as data, not as hard-coded prose, so that changes are localized.

J10 Azure Storage (Blob / ADLS Gen2)

Supported scopes: storage account (resource), specific container (sub-resource), resource group (broader).

Data roles by intent:
Read data maps to Storage Blob Data Reader.
Write data maps to Storage Blob Data Contributor.
Administer access or data maps to Storage Blob Data Owner.

Management-plane role by intent:
Manage the Azure resource (settings) maps to Contributor (management plane).

Service notes:
If the user is testing via the Azure portal, include a note that portal navigation may require ARM Reader in addition to data-plane roles, otherwise the user might see containers but be unable to browse or may not see expected navigation surfaces.

J20 Azure Storage (Files)

Supported scopes: storage account (resource), specific file share (sub-resource).

Data roles by intent:
Read data maps to Storage File Data SMB Share Reader (or Privileged Reader if explicit override capability is required).
Write data maps to Storage File Data SMB Share Contributor (or Elevated Contributor if modifying ACLs is required).
Administer access or data maps to Storage File Data SMB Share Elevated Contributor (or Privileged Contributor when override is required).

Management-plane role by intent:
Manage the Azure resource (settings) maps to Contributor (management plane).

Service notes:
Include a note that Azure Files access is often sensitive to identity integration and SMB semantics; the tool provides role guidance but does not configure identity-based access.

J30 Azure Key Vault (Secrets)

Supported scopes: vault (resource), resource group (broader).

Data roles by intent:
Read data maps to Key Vault Secrets User.
Write data maps to Key Vault Secrets Officer.
Administer access or data maps to Key Vault Administrator.

Management-plane role by intent:
Manage the Azure resource (settings) maps to Key Vault Contributor (management plane only).

Mandatory warning:
Key Vault has two permission models. The output must include a warning that the recommended roles only apply when the vault is configured to use Azure RBAC permissions. If the vault uses access policies, the user must grant permissions via access policies instead.

J40 Azure Service Bus

Supported scopes: namespace (resource), specific queue or topic (sub-resource).

Data roles by intent:
Read data maps to Azure Service Bus Data Receiver.
Write data maps to Azure Service Bus Data Sender.
Administer access or data maps to Azure Service Bus Data Owner.

Management-plane role by intent:
Manage the Azure resource (settings) maps to Contributor (management plane).

J50 Azure Event Hubs

Supported scopes: namespace (resource), specific event hub (sub-resource).

Data roles by intent:
Read data maps to Azure Event Hubs Data Receiver.
Write data maps to Azure Event Hubs Data Sender.
Administer access or data maps to Azure Event Hubs Data Owner.

Management-plane role by intent:
Manage the Azure resource (settings) maps to Contributor (management plane).

J60 Azure Data Explorer (Kusto)

Supported scopes: cluster (resource), specific database (sub-resource).

Role guidance by intent:
Read data maps to Kusto role Viewer at the chosen scope.
Write data maps to Kusto role Ingestor (or equivalent ingest role) at database scope when possible.
Administer access or data maps to Kusto role Admin at the chosen scope.

Management-plane role by intent:
Manage the Azure resource (settings) maps to Contributor (management plane).

Mandatory warning:
Kusto uses service-specific security roles and assignment flows. The output must include a warning that the user should expect a Kusto permission blade and that the steps may not be identical to generic "IAM and done".

J70 Azure Cosmos DB for NoSQL (data plane)

Supported scopes: Cosmos account (resource).

Role guidance by intent:
Read data maps to a Cosmos DB data plane role definition with reader semantics (built-in or custom).
Write data maps to a Cosmos DB data plane role definition with contributor semantics (built-in or custom).
Administer access or data maps to a broad Cosmos DB data plane role, frequently custom.

Management-plane role by intent:
Manage the Azure resource (settings) maps to a Cosmos management-plane contributor-type role.

Mandatory warning:
Cosmos DB data plane RBAC is service-specific. The output must not imply that a generic IAM role always suffices. It must indicate that Cosmos uses its own role definitions and assignments and that the user may need to create or choose a role definition appropriate for their API and scenario.

K00 Generated guidance content and structure

The output has two parts: an always-visible "Suggested role" line and a guidance body.

K10 Suggested role line

If the mapping is a single named built-in role, display: "Suggested role: <role name>".

If the mapping is a service-specific role family (Kusto, Cosmos), display: "Suggested role: <role family summary>" and keep the precise role names in the body.

If required inputs are missing (for example, subscription IDs in cross-subscription state), the suggested role line still renders, but the output hint adds: "Complete the missing fields to finalize scope wording."

K20 Guidance body template

The body must include, in this order, with service-specific insertion where needed:

Paragraph 1, scenario recap: a single paragraph that restates the user's selections in readable form, including whether the target is in the same subscription or a different one, and including the selected scope level and optional target name.

Paragraph 2, steps: a deterministic, short sequence labeled as "Step 1", "Step 2", etc. The steps must reference the Azure portal path at a conceptual level, using consistent phrasing: open the target resource, go to Access control (IAM), add role assignment, select the principal, select role, choose scope, validate.

Paragraph 3, validation: a paragraph that describes a minimal validation action appropriate to intent, phrased generically (for example, "perform a single small read" or "perform a single small write"). Do not claim the tool can validate.

Callout A, prerequisite: always include a callout that states the creator of the assignment must have permission to create role assignments at the target scope. Use the explicit permission phrasing and include common role examples as illustrative, not exhaustive.

Callout B, managed identity note: included only when principal is managed identity.

Callout C, cross-subscription note: included only in cross-subscription state. It must state that the role assignment is created in the target subscription at the target scope, and that the principal can come from another subscription but the assigner must have privileges in the target subscription.

Callout D, service warnings: included when defined in J00 (Key Vault, Kusto, Cosmos). Warnings must be visually distinct but calm.

Callout E, common non-RBAC blockers: include a short optional callout when the target service is one of Storage, Key Vault, Service Bus, Event Hubs. This callout states that network controls (firewalls, private endpoints, public access settings) can prevent access even if RBAC is correct. This callout must be phrased as a diagnostic reminder, not as a troubleshooting guide.

L00 Error handling and incomplete states

The UI must never show a blank output. Even in incomplete states, output must guide the user toward completion.

If cross-subscription is selected and any subscription ID is empty, output includes a callout: "Cross-subscription requires both subscription IDs. Enter both IDs to generate subscription-specific guidance." The scenario recap must avoid embedding unknown IDs.

If a subscription ID fails syntactic validation, output includes a callout: "Subscription ID must look like xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx."

If the user selects an intent that is incompatible with a service mapping (for example, a service entry lacks a management-plane role mapping), the tool must fall back to a safe message: "This intent requires management-plane guidance. This service entry does not define a management-plane role mapping. Choose a data intent or extend the catalog." This should not happen for the catalog defined in J00; it is a boundary condition rule.

M00 Accessibility and usability requirements

All form controls must have programmatic labels (visible or screen-reader-only). The output region must be aria-live polite so screen readers announce changes without being disruptive.

Keyboard navigation must be correct. Tab order follows the narrative order first, then conditional fields, then output.

Focus styling must be visible and consistent with the calm theme (soft focus ring, not thin default outlines).

N00 User workflows (specification by scenario)

N10 Same subscription, managed identity to Storage Blob read

User leaves principal as user-assigned managed identity, runtime as Azure Functions, selects read data, selects Azure Storage (Blob / ADLS Gen2), selects same subscription, selects scope "specific container", optionally enters target name "images". Output immediately shows suggested role Storage Blob Data Reader, includes managed identity callout, includes steps referencing Access control (IAM) on the container scope, and includes the portal navigation note about possibly needing ARM Reader for human portal testing.

N20 Cross subscription, service bus sender

User selects service principal, runtime Other, intent write data, target Azure Service Bus, subscription relation different subscription. Subscription ID fields appear. User enters my subscription ID and target subscription ID. Output shows suggested role Azure Service Bus Data Sender and includes a cross-subscription callout stating the assignment is created in the target subscription at the chosen scope.

N30 Key Vault secret write with permission model warning

User selects managed identity, runtime App Service, intent write data, target Azure Key Vault (Secrets). Output suggests Key Vault Secrets Officer and includes a mandatory warning that the vault must be using Azure RBAC permission model for these roles to apply.

N40 Kusto read with service-specific warning

User selects workload identity, runtime AKS, intent read data, target Kusto. Output suggests Kusto Viewer role at database scope (if selected) and includes a warning that Kusto permissions are service-specific and the portal flow differs from generic IAM-only guidance.

O00 Content and tone rules for generated text

All output text must be written in plain, direct sentences. Avoid exclamation marks. Avoid marketing language. Avoid vague phrases like "might need" without context. When uncertainty is intrinsic (for example, networking), phrase it as a clear diagnostic fork: "If RBAC is correct but access fails, check network restrictions."

Use consistent naming for portal navigation surfaces, notably "Access control (IAM)" and "Add role assignment".

P00 Acceptance criteria checklist

The implementation is acceptable only if all the following are true.

The page works offline, with separate HTML, CSS, and JavaScript files and no external dependencies.

All guidance updates continuously as the user changes inputs, with no submit button and no noticeable lag.

The UI matches the editorial, calm, typographic design requirements: large Georgia italic narrative, non-italic controls, soft background, card-like paper, consistent spacing, and subtle transitions.

Cross-subscription selection reveals exactly two subscription ID fields, and the output adapts correctly, including incomplete and invalid states.

Every catalog service in J00 produces a deterministic role recommendation for each intent, and includes the mandatory warnings and notes described.

The output always includes the prerequisite callout about permission to create role assignments.

Managed identity selections always produce the managed identity callout.

No output includes external links or citations.

No user data is stored, transmitted, or persisted beyond the current page state.
