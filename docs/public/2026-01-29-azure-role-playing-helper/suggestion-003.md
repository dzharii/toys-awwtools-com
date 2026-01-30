2026-01-29

A00 Purpose of this document

This document defines an implementation checklist for the CalmRBAC UI and UX. It is intended to prevent regressions into generic form layouts and "default template" styling, and to specify the observable behaviors that make the experience feel like a fluent, editorial, single-task assistant. The checklist is written for implementers and reviewers to verify the final result against explicit requirements.

B00 UX intent, in one page

The user should experience a single page that reads like a calm note. The page begins with a few natural-language sentences that the user completes by choosing inline options. The controls feel embedded in the prose, not bolted on. Every selection instantly updates a guidance section below. The guidance looks like a continuation of the same voice, but clearly separated as "generated". The page never forces a submit action. Nothing feels like a "wizard". The user is never asked to interpret Azure terminology beyond their own intent.

The difference between this and common AI-generated UIs is deliberate restraint. There is no left nav, no cards grid, no oversized badges, no neon accents, no thick borders, no icon soup, no multi-panel dashboard. The entire UI is typographic and quiet: large serif italic narrative text, inline controls that look like part of the sentence, and a guidance section that updates smoothly.

C00 Acceptance checklist: global visual and layout

C10 Single-task composition

The page contains exactly one centered primary card ("paper") on a calm background. No additional panels, sidebars, or multi-step screens.

The primary card uses generous padding and a readable maximum width. The narrative text must not exceed a comfortable line length; if the viewport is wide, the card remains centered and does not stretch to full width.

The background is calm and low-saturation. It can be a subtle layered gradient or soft shapes. It must not resemble common admin themes or landing-page hero patterns.

C20 Typography

Narrative prose uses a serif face similar to Georgia, italicized. The narrative font size is large (desktop target 20px to 24px) with airy line height. The output guidance is slightly smaller (target 16px to 18px) but still comfortable.

Inline controls (selects and inputs) are not italic, even though they appear within italic prose. This contrast must be subtle but obvious enough to improve scanning.

Numbers and IDs (subscription ID, roleDefinitionId, scope strings) display in a monospaced style only when shown inline inside output. Monospace must be used sparingly and only for token-like values.

C30 Whitespace and rhythm

Paragraph spacing is consistent and intentional. There are no dense blocks of text. The narrative is divided into short, digestible paragraphs.

The output region is separated from the narrative by a light divider and spacing. The divider is subtle; the separation should feel editorial, not "componentized".

C40 Color and emphasis

Use one calm primary accent and one secondary accent. Accents are used for focus rings, gentle callout borders, and small micro-emphasis only.

Avoid high-contrast saturated colors. Avoid bright blues and neon greens commonly associated with templates.

Hover and focus states must be soft and wide, not sharp. The focus ring should look intentional and calm, not the browser default.

D00 Acceptance checklist: inline control behavior and "embedded in text" feel

D10 Inline control positioning

Each select/input is placed inline within a sentence so that the sentence reads naturally with the control occupying the spot of a phrase.

Controls align to the baseline of the surrounding text. If necessary, apply a small vertical adjustment so the control does not float above or sink below the text baseline.

Controls have rounded corners and a gentle border. They must not look like default browser widgets. They must not look like Material UI or Bootstrap defaults.

D20 Control sizing and padding

Controls are visually large enough to match the narrative. They should not look small relative to the sentence. Their padding and font size must be coherent with the prose.

Dropdowns must show the selected value clearly, with sufficient contrast and without truncation for common options.

D30 Selection completion highlighting (non-default value cue)

When a control value differs from its default, the control receives a subtle "completed" styling. This styling must be calm and minimal, for example:
A slightly warmer background tint.
A slightly stronger border using the accent color at low opacity.
A tiny inner shadow or underline effect.

Completion highlighting must never look like an error or warning. It must never use vivid colors. It must be visible enough that the user can glance and see which parts of the sentence they already specified.

If the user resets back to the default option, the completed styling must revert to the base styling.

D40 Inline micro-pictograms (emoji-as-pictogram requirement)

Use emoji as small, text-adjacent pictograms for key concepts such as roles, scope, and warning notes. They must be styled to feel integrated and non-childish.

Implementation rule: wrap emoji in a span with a class (for example, class="glyph"). Apply:
Slightly reduced opacity.
Slightly reduced size relative to surrounding text (for example 0.92em).
A small background pill or subtle contour that matches the card style (very light border, low opacity).
No bright background color.

Use pictograms sparingly. Target usage:
One pictogram in the "Suggested role" line.
One pictogram per callout type (prerequisite, cross-subscription, managed identity note, warning).
Avoid pictograms in every sentence.

E00 Acceptance checklist: dynamic guidance rendering and smoothness

E10 Always-on generation

There is no submit button. All changes re-render guidance immediately.

Re-rendering must not cause the page to jump or flicker. Avoid replacing the entire output region with new nodes if it causes layout thrash. Prefer updating inner content while maintaining stable container height when possible.

E20 Transition behavior

When conditional fields appear or disappear (cross-subscription IDs, service-specific layer options), animate:
Opacity from 0 to 1.
Vertical translate by a small amount (for example 6px to 10px).
Duration between 150ms and 220ms.
Easing that is gentle (avoid bouncy curves).

When the guidance text changes, do not animate every line. Use one subtle treatment:
Either a brief fade-in on the output body container, or a "soft refresh" where a thin accent line briefly brightens and returns to normal. Keep it minimal to avoid distraction.

E30 Continuity between narrative and generated text

The generated guidance must feel like the continuation of the narrative voice, but must still be clearly labeled as generated.

The output section includes a header with:
A short title like "Guidance".
A secondary hint line that shows the suggested role.

The output body uses the same typographic family but not italic by default. It can preserve some italic flavor for headings, but the body should be straight for readability.

The output section must be visually distinct from the narrative via spacing and a subtle background shift. It must not be a stark separate card.

E40 Callouts and severity levels

Callouts are visually gentle blocks inside output. They use a left border or subtle highlight. They never use harsh red or aggressive icons.

Callout types:
Prerequisite callout (always present): neutral, informational styling.
Managed identity callout (conditional): neutral.
Cross-subscription callout (conditional): neutral.
Service warning callout (conditional): slightly more emphasized but still calm (use secondary accent).
Non-RBAC blockers callout (conditional): neutral.

F00 Functional UX checklist: states, validations, and messaging

F10 Default state clarity

On first load, the page shows a coherent scenario with defaults. The output must already be meaningful and not say "select something to begin".

Defaults must be consistent with the main use case (service-to-service with managed identity, common target like Storage Blob).

F20 Missing data handling

If cross-subscription is selected and IDs are missing:
The output must contain a callout that clearly states both IDs are required to finalize the cross-subscription guidance.
The scenario recap must not invent IDs or display placeholders as if they are real values.
The suggested role line may still appear, but the hint must indicate the guidance is incomplete.

F30 Invalid data handling

Subscription IDs are syntactically validated as GUID strings.

If invalid:
Show a calm callout: "Subscription ID must look like xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx."
Do not show an error banner. Do not change the overall mood.

The inline input itself should receive a subtle invalid state, for example a slightly tinted background and a thin border using the secondary accent. Avoid bright red.

F40 Service-specific warning logic

If Key Vault secrets is selected, output must include the permission model warning.

If Kusto is selected, output must include the "service-specific roles" warning and avoid claiming "IAM is always sufficient".

If Cosmos DB data plane is selected, output must include the "Cosmos data plane role definitions differ" warning and avoid promising a single generic role assignment is enough.

G00 UX workflows to validate during review (manual test scripts)

G10 Quick success: managed identity to Storage Blob, same subscription

Open the page and do not touch anything. Confirm the narrative reads naturally and the output shows a suggested role and steps.

Change intent to write. Confirm the suggested role updates immediately. Confirm the inline control indicates "completed" state after leaving default.

Change scope to container-level. Confirm output steps mention container scope and recommend narrow scope.

G20 Cross-subscription reveal and completion

Switch subscription relation to different subscription. Confirm subscription ID fields slide in smoothly and do not jolt layout.

Leave IDs empty. Confirm output callout requests both IDs.

Enter one ID. Confirm output still requests the missing ID.

Enter an invalid ID. Confirm invalid callout and gentle invalid styling.

Enter both valid IDs. Confirm output now references target subscription as the location where the role assignment is created.

G30 Service warnings correctness

Select Key Vault secrets. Confirm the permission model warning appears every time and is visually distinct but calm.

Select Kusto. Confirm warning appears and the guidance does not overstate generic IAM steps.

Select Cosmos DB data plane. Confirm warning appears and guidance suggests role-definition selection rather than a single fixed role when appropriate.

H00 Anti-template rules (explicitly prohibit generic UI)

The implementer must not use:
A dashboard layout, left nav, top nav with multiple sections, or multiple cards grid.
Material UI, Bootstrap, Tailwind component libraries, or any prebuilt UI kit look-alikes.
Generic "AI assistant" style gradients, glassmorphism with neon edges, or chat-bubble UI.
Default browser form styling. Controls must be intentionally styled.

The intended design is editorial: one page, one card, prose-first, embedded controls, calm highlights, minimal pictograms.

I00 Emoji pictogram spec (styling and usage)

Emoji are treated as pictograms, not decoration.

Implementation checklist:
Emoji appear only inside span.glyph wrappers.
Glyph wrapper has slight padding and a very subtle border, matching the card stroke tone.
Glyph has slightly reduced opacity.
Glyph size is slightly smaller than the surrounding text and aligned to the text baseline.
Glyphs are used consistently for the same meaning. For example:
Role suggestion uses one consistent glyph (for example a key or badge).
Prerequisite uses one consistent glyph (for example a wrench).
Cross-subscription uses one consistent glyph (for example a link).
Warning uses one consistent glyph (for example a small caution sign), styled gently.

Glyph usage must not create a "gamified" or playful feel. Keep it subtle and restrained.

J00 Responsive behavior checklist

On mobile widths, the card remains readable with reduced padding but the same typographic character.

Conditional field rows become a single column. Labels remain readable.

Inline controls must not overflow the viewport. If necessary, the prose line breaks naturally and controls wrap with it. Do not force horizontal scrolling.

K00 Final UX review checklist (sign-off)

The page feels like a single note with embedded choices, not like a form.

The user can complete a scenario in under 15 seconds without scanning a dense interface.

The difference between static narrative text and generated guidance is clear, but the voice and aesthetic remain continuous.

Selections that differ from default are visually acknowledged with calm completion highlighting.

All state transitions are smooth and non-jarring.

Warnings are present where required and are calm but unmissable.

The entire UI is clearly not a generic template and does not resemble common dashboard or AI assistant UIs.
