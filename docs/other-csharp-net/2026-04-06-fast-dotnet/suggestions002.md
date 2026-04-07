A00. Task overview

Redesign the frontend in `wwwroot` so this project stops looking like a one-off demo page and becomes a clean, editable starter UI for localhost tools.

This is now a broader frontend task than a visual refresh. The goal is not only to improve the look of the current page, but also to turn the page into a practical starting point that a user can open, understand, and quickly replace with their own content. The project should feel like a lightweight local app shell that already has sensible structure, typography, spacing, components, and interaction patterns.

The work should be limited to frontend files under `wwwroot`, primarily HTML, CSS, and JavaScript. The intended result is a small, understandable starter interface that users can customize without learning a large frontend stack first.

B00. Scope

Work in `wwwroot/index.html` and any directly related frontend files under `wwwroot`.

You may split CSS and JavaScript into separate files if that improves clarity and maintainability. You may reorganize the HTML structure completely. You may replace the current markup, styling, and client-side script in full if needed.

Do not introduce a build step. Do not introduce a frontend framework. Do not add package managers, bundlers, transpilers, or external runtime dependencies. This project should stay simple to open and edit.

Do not change backend behavior, routes, endpoint contracts, or server-side startup logic unless a very small frontend-supporting change is strictly required. The expected work is frontend-only.

C00. Product intent

This project is a localhost-only developer tool. It serves a local HTTPS web page and a few API endpoints. It is not a marketing site, not a public product homepage, and not an admin dashboard.

The frontend should reflect that identity. It should feel like a refined technical starting point for building local browser-based utilities. It should look intentional and polished, but not overdesigned. It should help users get started quickly, and then get out of their way.

The project should no longer feel like a finished demo that showcases its own content. Instead, it should feel like a starter UI that invites the user to replace the content with their own.

D00. Main objective

Produce a redesigned frontend that serves two purposes at the same time.

First, it should look better and feel less templated. The current design relies too heavily on generated-looking patterns such as pill labels, repeated soft cards, and generic rounded panels. Replace that with a more specific and more disciplined design language.

Second, it should behave like a starter kit for the user. A beginner should be able to open `wwwroot/index.html`, understand what is placeholder content, remove it, replace it with their own sections, and continue building without friction. The HTML structure and CSS conventions should actively support that workflow.

E00. Design direction

Use a restrained technical editorial style.

The design should be driven mainly by typography, spacing, grouping, and alignment. Avoid heavy use of cards and decorative containers. Avoid the visual language of generic SaaS templates. Avoid anything that feels "cute", padded for its own sake, or component-library-like.

The page should feel like a carefully designed developer-facing document with a small amount of interactivity. It should be calm, legible, and direct. The visual system should communicate technical clarity rather than generic startup polish.

F00. Secondary goal: editable starter template

The frontend must be designed as something users will immediately modify.

This means the HTML should not read like a rigid finished product. It should have a clear, understandable structure, with visible content regions that can be deleted, renamed, or replaced. A beginner should be able to find the main title, the intro copy, the action area, the sample sections, and the example controls without having to reverse-engineer the whole page.

The current project content should be treated as starter content. It should be useful as an example, but clearly replaceable. The user should get the sense that the page is theirs to shape, not yours to preserve.

G00. Core user experience requirement

A first-time user who opens the project should be able to do all of the following with minimal effort:

Run the app and see a clean interface.

Understand what the project is and where to start.

Recognize which parts of the page are just example content.

Delete or replace the example content without breaking the layout.

Add a new button, a new block of text, a new form control, or a new section by copying simple existing patterns.

Keep the page visually coherent while doing so.

This requirement is as important as the visual redesign itself.

H00. Layout principles

The page should answer three things immediately: what this is, how to start, and where to put your own content.

Use a left-aligned layout. Avoid a centered marketing-hero composition. The page should feel like a tool page or starter document, not like a promotional landing page.

The structure should be section-based. Use spacing, headings, and rules to separate content. Do not wrap every informational area in its own card. The page should feel coherent from top to bottom rather than divided into many equally weighted panels.

The first screen should include a clear title, a short project explanation, a concise quick-start area, and a visible editable area or example app area that suggests where the user can begin customizing.

I00. Information architecture

Reorganize the page so the content is easier to understand and easier to replace.

A good target structure is:

A project header with title and short explanation.

A compact quick-start section with local URL and one or two useful commands.

A short note that this page is intended to be edited and that the example content can be replaced.

An example app area showing a few common UI patterns the user can reuse.

A compact technical reference area for API endpoints and live API testing.

This structure should feel like a starter template for local tools, not like documentation pasted into the page.

J00. Example-content strategy

The page should include starter content, but starter content should be obviously editable.

Do not make the entire page about this project's own explanatory text. Reduce that. Replace large blocks of project-specific prose with example UI patterns and concise annotations where needed.

The user should see a realistic starter surface that they can adapt. For example, a section with a title, paragraph, action buttons, a form row, an output panel, and a utility list is more useful than several cards explaining the project.

The page should communicate, through structure rather than through long instructions, that "you can replace this with your own app".

K00. Frontend starter kit requirement

In addition to redesigning the page, introduce a small internal CSS component system that makes it easy for users to build on top of the project.

This is not a third-party framework. This should be a very small, self-contained CSS layer designed specifically for this project. It should provide sensible defaults for typography, spacing, layout, buttons, inputs, panels, stacks, rows, and code blocks.

The purpose of this layer is to make HTML editing easier for users. A beginner should be able to add a class to a button or section and get a decent result without inventing all the CSS from scratch.

L00. CSS system naming

Create a clear class naming convention for this internal frontend layer. All custom framework-style classes should use a consistent prefix so it is obvious which classes belong to the starter UI system.

Use a short project-specific prefix, for example `lf-`, and apply it consistently to layout, component, and utility classes.

This is important for two reasons. First, it makes the starter system easy to understand. Second, it helps the user distinguish their own classes from the provided classes.

M00. CSS system goals

The CSS system should be small, readable, and practical.

It should provide a strong typographic base. It should provide predictable spacing. It should provide a few reliable layout primitives. It should provide reusable button, input, section, surface, and feedback styles. It should make the page feel designed even when the user starts changing content.

It should not become a large abstraction layer. Avoid overengineering. The point is to help users move quickly.

N00. CSS system contents

Provide a minimal but useful set of reusable primitives and components.

The system should include a page wrapper and content-width control.

It should include vertical spacing helpers and horizontal row/group helpers.

It should include heading, body, muted text, and code text styling.

It should include button styles for primary and secondary actions.

It should include input and textarea styles with good default spacing and borders.

It should include a simple panel or surface class for the few places where grouping genuinely benefits from a contained box.

It should include a code-block style and an inline-code style.

It should include a simple status or note style for lightweight informational messages.

It should include clean table or list styling for endpoint references if a table or list is used.

All of these should be intentionally small and easy to inspect in CSS.

O00. Visual character of the CSS system

The CSS system should support the restrained technical editorial direction.

Typography should be the primary design tool.

Spacing should create most of the visual separation.

Borders and rules should be subtle and sharp rather than soft and oversized.

Background surfaces should be used sparingly.

Rounded corners, if used, should be moderate and controlled, not large and omnipresent.

Accent color should be limited and purposeful. It should mostly appear on interactive elements and selected emphasis areas.

The result should feel calm, modern, technical, and slightly editorial, not component-library-generic.

P00. Typography requirements

Typography should carry hierarchy and tone.

Use a strong page title. Use clearly differentiated section headings. Use readable body text with controlled line length. Use a distinct monospace treatment for commands, routes, code, and machine-readable values.

The page should feel typographically intentional. Headings should not be oversized for drama. Body text should not be too large. The text system should support scanning first and reading second.

Avoid decorative labels above headings unless they convey actual state or useful metadata. Do not reintroduce the current pill-label pattern.

Q00. Layout primitives

The user should be able to build new layouts with a few simple patterns.

Provide a straightforward vertical stack pattern for most page sections.

Provide a simple horizontal row pattern for action groups and compact control groupings.

Provide a responsive grid or split layout only if it remains very simple and degrades cleanly on smaller widths.

Do not create a heavy layout system. Keep it obvious. Someone reading the HTML should be able to understand how a section is arranged at a glance.

R00. Component primitives

Provide a small set of starter components that users can reuse.

At minimum, create clean styles for buttons, text inputs, textareas, labels, select controls if applicable, panels, code blocks, and result/output areas.

These components should have neutral names and generic utility. They should not be tied too tightly to the current demo content.

The goal is for a user to be able to build a small local app UI by copying the provided patterns and changing the labels.

S00. Example app section

Add a prominent example content area that demonstrates how a user can start building their own interface.

This area should not feel like a fake product demo. It should feel like starter scaffolding. Include a few example controls that are realistic and easy to repurpose. For example, a section title, a short description, a button row, an input field, a textarea, and an output area would be useful.

This section should visually signal that it is the place where the user can begin replacing content. It should look more like an editable workspace than like documentation.

T00. Replaceability and editability

The HTML structure should make replacement obvious.

Use semantic sections and clear grouping.

Use clean, understandable class names.

Use comments sparingly, but where they materially help a beginner identify replaceable regions, add short comments in the HTML.

Do not bury the main editable content inside several nested wrappers that all look equally important. Keep the markup readable.

The user should be able to search for a clearly named section and replace it without fear.

U00. Beginner friendliness

Design the starter markup and CSS with a beginner user in mind.

A user should not need to understand advanced CSS architecture to make changes. The class system should be discoverable by inspection. The HTML should show a few good examples of how to compose the provided classes.

Where helpful, choose names that communicate intent rather than implementation. For example, a class name that implies "stacked section" or "action row" is better than a cryptic generic class.

The project should reward copy-paste modification. A user should be able to copy an existing button row or form block, change labels and IDs, and continue building.

V00. JavaScript scope

Keep the JavaScript simple and local to the page.

Preserve or improve the existing live API check behavior. If the example content introduces any small interactions, keep them clear and lightweight.

Do not build a complex frontend architecture. Do not add a framework. Do not create indirection that makes the starter harder to understand.

If JavaScript is split into a separate file, make sure the relationship between the HTML and script remains obvious.

W00. Live API check

Keep the live API check as the main real interaction backed by the server.

Its UI should fit the new visual direction. It should remain easy to find, easy to trigger, and easy to understand.

The output area should look dependable and readable. It should not resemble a decorative card. It should feel like a practical result panel.

If useful, place this within the example app area or adjacent to the technical reference area, but keep it visually integrated into the page rather than isolated as a separate design style.

X00. Technical reference presentation

Preserve practical technical reference information, but make it more compact.

The endpoint list should be easy to scan. Present methods, routes, and short explanations in a clean technical format. Avoid turning endpoints into marketing-style tiles.

Commands and URLs should be clearly presented and easy to copy. Code blocks should feel functional and precise.

The quick-start and API reference areas should support the user without dominating the whole page.

Y00. Content balance

Reduce the amount of explanatory prose about the project itself.

Increase the amount of useful starter structure the user can build on.

The page should not spend most of its space telling the user what the project is. It should show the user what they can do with it. Keep project description concise and let the rest of the page demonstrate capability.

Z00. Accessibility and usability

Even though this is a small localhost tool, basic usability should be taken seriously.

Maintain readable contrast.

Keep interactive controls visibly interactive.

Use proper labels for inputs.

Preserve keyboard usability for buttons and form controls.

Make code and result areas legible.

Avoid overly small text, overly low contrast, or ambiguous click targets.

A01. Responsive behavior

The page should remain usable on narrower widths without becoming cramped or broken.

The layout does not need to be optimized for many device classes, but it should collapse cleanly. Multi-column arrangements should stack when needed. Spacing should remain deliberate. Controls should remain readable.

Do not chase complex responsiveness. Keep the responsive behavior straightforward and robust.

B01. File organization

If the current `index.html` contains too much inline CSS or JavaScript, it is acceptable to split them into `wwwroot` files such as `styles.css` and `app.js`, or similarly clear names.

If you do split files, keep the structure simple and conventional. The result should still be easy for a beginner to navigate.

The organization should help a user answer three questions quickly: where is the HTML, where are the styles, and where is the JavaScript.

C01. Internal consistency

The final frontend should feel like one system.

Typography, spacing, button styles, panel styles, and code presentation should all belong to the same visual language. Avoid mixing multiple design vocabularies.

If you introduce a starter CSS system with prefixed classes, use it consistently across the page.

D01. Things to avoid

Avoid the current soft-card template style.

Avoid repeated pill badges and decorative labels.

Avoid overusing background-filled boxes.

Avoid centered landing-page composition.

Avoid introducing a fake-product feel.

Avoid excessive ornamental CSS.

Avoid turning the page into documentation-only content.

Avoid making the example app area feel like a toy.

Avoid abstractions that make editing harder for beginners.

E01. Quality bar

The final result should satisfy all of the following.

It should look clearly better than the current design.

It should feel more specific to a local technical utility.

It should provide a reusable small CSS system with prefixed classes.

It should make starter content visibly editable and replaceable.

It should help a beginner add their own content with minimal friction.

It should preserve the project's practical usefulness as a local app shell.

F01. Decision rule

If any part of this specification is ambiguous, incomplete, or internally inconsistent, use your own best judgment.

When choosing between alternatives, prefer the option that best supports this combination of goals: a refined technical editorial look, simple frontend-only implementation, beginner-friendly editability, and a small reusable prefixed CSS system that helps users turn the starter into their own local app.

G01. Deliverable

Deliver an updated frontend implementation in `wwwroot` that includes the redesign, the starter-template restructuring, the prefixed CSS system, and the improved beginner-friendly editability.

The final page should no longer read as a fixed project demo. It should read as a polished localhost app starter that users can immediately adapt into their own tool.
