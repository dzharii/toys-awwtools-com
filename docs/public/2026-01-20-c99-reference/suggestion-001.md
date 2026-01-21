2026-01-20

P00 User A1: Systems programmer under time pressure v00
User A is implementing low-level code where correctness and portability matter, but the immediate problem is speed of recall. The user has a function name in mind, but does not remember parameter semantics, edge conditions, or the safest usage pattern. The user’s intent is to get an implementation-ready pattern in seconds without opening multiple tabs, reading long prose, or guessing about behavior. The primary success condition is that the user can jump directly to a function card, read a precise signature, understand parameter direction and constraints, and copy a minimal example that compiles.

User A opens the reference page locally. The user types a function name in the sidebar search, presses Enter, and lands on the exact function card with a stable URL fragment. The user expects the parameters to be described with explicit rules, not narrative ambiguity, and expects notes to call out portability hazards or non-obvious behavior. The user copies the example code and pastes it into their project, then adjusts types and error handling to match their local context. The application is successful if the user does not need external references to understand the default safe pattern and common pitfalls.

Q00 User B1: Application developer using Ctrl+F first v00
User B does not want new search metaphors. The user’s habit is to use native browser search and to scan visible content quickly. The user’s intent is to locate all mentions of a term, including within examples and notes, and to compare related functions on the same page. The user is frustrated by references that hide content behind collapsible sections because Ctrl+F cannot see hidden text.

User B opens the page and immediately uses Ctrl+F with a token such as an error macro name, a parameter name, or a format string specifier. The page must contain all documentation text in the DOM in expanded form so the browser search works reliably. The user then scrolls within the main pane to inspect multiple matches. The sidebar is used only to jump between sections when the user wants structure, not as a replacement for native search. The application is successful if Ctrl+F finds matches in function cards, notes, and examples without any extra steps and without requiring a UI state change.

R00 User C1: Portability-focused engineer validating cross-platform behavior v00
User C is responsible for code that must behave consistently across multiple platforms and toolchains. The user’s intent is not just to find a function, but to validate portability constraints and identify traps such as global state, thread-safety, static storage returns, or environment-dependent results. The user wants authoritative, deterministic rules that can be cited in internal documentation.

User C navigates by header grouping to confirm what must be included and what conceptual module a function belongs to. The user reads constraints and severity-tagged notes first, then scans examples that demonstrate defensive patterns. When the documentation indicates a known hazard, the user expects the note to include a clear rule and a recommended pattern, such as copying returned static data immediately or avoiding reliance on errno. The application is successful if the user can quickly answer: what must I pass, what can change globally, what is undefined or implementation-defined, what errors are detectable, and what is the recommended safe approach.

S00 User D1: Junior developer learning by example v00
User D is learning C standard library usage and wants a practical cheat sheet. The user’s intent is to understand typical usage patterns and to avoid common mistakes. The user is motivated by clarity and confidence, and is discouraged by references that provide only prototypes without showing correct calling patterns.

User D browses by category and reads examples before reading notes. The user expects each function to have at least one example that is minimal, compilable, and commented with intent. The user then reads parameter descriptions to connect each argument to its meaning. The application is successful if the user can copy an example, compile it with minimal edits, and correctly adapt it without misunderstanding parameter direction, lifetime rules, or return-value interpretation.

T00 User E1: Code reviewer verifying correctness quickly v00
User E is reviewing a pull request where C standard library calls are used. The user’s intent is to verify that the chosen function is appropriate and that it is used correctly under error conditions and edge cases. The user wants fast navigation and predictable layout to compare multiple functions and their semantics.

User E uses the sidebar search to jump to the function under review, then scans signature, returns, and notes. The user expects return-value behavior to be explicitly stated, including failure indicators, range issues, and undefined behavior triggers. The user then uses Ctrl+F to find related functions within the page and compare alternatives. The application is successful if the reviewer can confirm correctness criteria without leaving the page and can cite specific documented rules when requesting changes.

U00 User F1: Author building internal guidelines and templates v00
User F is creating internal engineering guidelines. The user’s intent is to standardize how the team uses certain C library functions by referencing consistent patterns and warnings. The user wants stable anchors and deterministic text so internal documents can link directly to function cards and remain valid over time.

User F navigates to the relevant category and function, then copies the signature and example into an internal template. The user relies on stable URL fragments for references in documentation and issue trackers. The application is successful if anchors are stable across builds of the static page, if the function card contains clearly labeled sections, and if notes are written in rules suitable for policy language.

V00 User G1: Performance-minded engineer scanning for safe primitives v00
User G is performance-sensitive but does not trade correctness for speed without evidence. The user’s intent is to find functions and patterns that avoid unnecessary allocations or undefined behavior and that scale to common workloads. The user wants short examples that show the intended usage and boundary checks.

User G searches by function family tokens, such as “mem” or “strto”, and uses header grouping to view adjacent functions. The user compares examples and notes to identify which functions are safe defaults. The application is successful if it supports quick scanning, consistent section ordering, and examples that demonstrate typical fast-path usage along with mandatory boundary handling.

W00 User H1: Debugging and incident response workflow v00
User H is in an incident response mindset. The user’s intent is to validate assumptions quickly and to detect which function behaviors could explain a bug, such as locale effects, floating exceptions, or subtle rounding and NaN handling. The user wants immediate access to notes that highlight non-obvious interactions and global state.

User H searches for relevant tokens and reads severity-tagged notes first. The user then uses examples as “known good” patterns to compare against production code. The user expects the documentation to call out global state and environment dependencies explicitly. The application is successful if the user can identify likely root-cause candidates from the notes and can apply a recommended diagnostic pattern directly from the examples.

X00 User I1: Offline, air-gapped, or restricted environment user v00
User I is working in an environment with no reliable network access or where external browsing is disallowed. The user’s intent is to have a complete, self-contained reference that works from a local file system. The user values determinism and simplicity, and does not want a toolchain or runtime dependencies.

User I opens index.html directly from disk. The page must load without network requests and must render correctly with embedded data. The user uses sidebar search and Ctrl+F to locate content. The application is successful if it functions entirely offline, renders quickly, and does not rely on external fonts, CDNs, or libraries.

Y00 User J1: Mixed intent, exploratory browsing to discover related functions v00
User J does not start with a single function name. The user’s intent is to explore a module and discover related functions, understand when to use each, and find examples that clarify differences. The user wants structure and narrative flow, but still expects specification-grade precision within each function card.

User J starts from the sidebar table of contents, opens a header section, and reads function cards in order. The user uses keywords and notes to understand conceptual groupings and to decide which function is most appropriate. The application is successful if grouping is clear, the table of contents is navigable, the main pane is readable for long scrolling sessions, and each function card remains consistent in layout and level of detail so comparisons are straightforward.


A00 Acknowledgement and style contract v00
This document is a normative specification. It uses explicit rules and deterministic behavior. Ambiguities are resolved by defining a concrete rule.

B00 Project context and repository layout v00
The implementation target is a single-page, static, offline-capable reference viewer for C99 library documentation, generated from multiple XML documents previously produced and saved as GUID-named files.

The coding agent will have access to the following workspace layout and must treat it as authoritative input context:

Folder PATH listing for volume WORK
Volume serial number is 5603-9368
D:.
|
+---data-to-process
|       2026-01-20T16-11-47-9fed4cbe-6012-4482-8d7d-c497a86a6364.xml
|       2026-01-20T16-12-30-bd774ff8-f2e4-4840-8484-d0941f5605ab.xml
|       2026-01-20T16-13-11-b1c0987c-1854-4b44-bf88-047f60a8b43e.xml
|       2026-01-20T16-15-03-9e1ddf04-13fc-4758-8da1-3e099d111f9b.xml
|       2026-01-20T16-15-38-6d2699d7-e5d4-4404-b205-cde029a06fae.xml
|       2026-01-20T16-16-07-80d6c6aa-9e24-446e-bce5-8a5f149ef61f.xml
|
---inspiration
app.js
index.html

The inspiration folder contains an example approach where XML is embedded in HTML under a script tag with type application/xml, and JavaScript parses and renders it. The implementation must reuse the approach conceptually, but it must be rewritten into a production-quality, implementation-ready version with a cleaner structure and a richer UI.

C00 Problem statement and goals v00
The problem is that standard library references are fragmented, inconsistent across platforms, and slow to consult during active programming. The goal is to provide a fast, readable, single-page reference that presents function signatures, parameter semantics, return behavior, notes, and copy-pasteable examples in a consistent layout that supports both in-page navigation and native browser searching.

Primary goals are: (1) single-page reference containing all documentation content, (2) all content visible in the DOM without collapsible hiding so browser Ctrl+F works across the entire content, (3) a left sidebar that provides an index and search for fast navigation by function, header, category, keyword, and identifier, and (4) minimal, non-distracting styling using system fonts, high readability, and strong contrast.

D00 Scope and non-scope v00
In scope: a static HTML + vanilla JavaScript + CSS application, with data embedded directly in the HTML as separate XML blocks, one per source file. The app parses the embedded XML at runtime and renders a complete reference page with sidebar navigation and full-text visibility.

In scope: parsing and rendering of categories, headers, functions, parameters, return descriptions, notes, examples, and keywords as represented in the XML files in data-to-process.

In scope: small data-quality improvements applied at integration time without modifying the files in data-to-process. Improvements may be achieved by editing the embedded copies inside the HTML, or by applying a deterministic transformation layer in JavaScript. The source files in data-to-process must never be edited.

Out of scope: any external libraries, frameworks, build tooling, bundlers, server components, network calls, analytics, user accounts, bookmarks/likes, personalization, and any feature requiring persistent storage beyond optional, explicitly specified UI state persistence.

Out of scope: merging the six XML files into a single XML document. The embedded data must keep them as separate blocks for maintainability.

Out of scope: collapsible sections, details/summary, or any UI that hides substantive content by default.

E00 System overview and mental model v00
The application is a static document viewer with three layers:

1. Data layer: multiple XML documents embedded into index.html under separate script tags of type application/xml.
2. Parse/index layer: app.js reads each embedded XML block, parses it with DOMParser, normalizes and validates it, and builds an in-memory index of navigable entities.
3. Render layer: app.js creates DOM nodes for the sidebar and main content and inserts them into the page. The resulting DOM contains all documentation text so Ctrl+F works.

The user’s mental model is: the sidebar is a fast navigation index, while the main pane is the full reference. Searching in the sidebar narrows the navigation list and provides jump-to behavior; it does not hide main content. The main pane is stable and scrollable; navigation moves the viewport and highlights the target.

F00 Data embedding requirements v00
F01 Embedded XML containers v00
The implementation must embed each XML file as its own script tag in index.html.

Rule: Each embedded block must use a unique id derived from the file name. A compliant example id format is library-xml-<filename-without-extension>. The type attribute must be exactly application/xml.

Rule: The embedded XML content must be literal XML text as produced, not JSON, not base64, and not HTML-escaped beyond what is required for valid HTML embedding. If the embedded XML contains the sequence </script>, it must be made safe by splitting the text node or otherwise ensuring the browser does not terminate the script element early. The transformation used must be deterministic and documented in comments in index.html.

Rule: The six XML blocks must remain separate. The application must iterate over all blocks and treat each as one independent source document.

F02 Separation of concerns v00
index.html must contain: the page structure, the embedded XML data blocks, and references to styles.css and app.js. styles.css must contain only styling. app.js must contain parsing, indexing, rendering, and behavior logic.

G00 XML parsing and normalization v00
G01 Parsing v00
Rule: app.js must locate all script tags with type application/xml and ids starting with library-xml-. It must parse each block using DOMParser with the application/xml or text/xml mode.

Rule: If a block fails to parse, the application must continue processing other blocks. The UI must surface a visible, non-modal error banner listing the failing block id and a concise error message.

G02 Canonical interpretation of the XML schema v00
The parser must treat the XML as following this conceptual schema, based on the existing documents:

A document contains one category element.
A category contains optional summary, keywords, notes, and one or more header elements.
A header contains a name and contains one or more function elements.
A function contains signature, summary, parameters, returns, notes, and examples.

Rule: When an expected element is missing, the renderer must omit that section cleanly rather than displaying placeholders.

Rule: The function element attribute kind controls rendering emphasis. kind="function" is a standard function card. kind="internal_note" is rendered as a visually de-emphasized informational block within the header section, not hidden.

G03 Text handling and safe formatting v00
The XML includes CDATA sections containing minimal inline HTML tags defined in its own textFormatting policy (p, strong, em, code, a, br). The renderer must support these tags.

Rule: Only the allowed tags p, strong, em, code, a, br are permitted to be interpreted as markup. All other tags must be escaped and rendered as text.

Rule: The a tag is permitted only with href attributes that begin with http://, https://, or a fragment #. Any other href value must be dropped and the anchor rendered as plain text.

Rule: No script execution is permitted from embedded content. The renderer must never use unsanitized innerHTML. If innerHTML is used at all, it must be applied only to content that has been sanitized to the allowed tag set and allowed attributes, per the rules above.

G04 Normalization and integration-time improvements v00
The application must not modify or overwrite the XML files in data-to-process.

Integration-time improvements are allowed only in the embedded copies inside index.html or via a deterministic transformation layer in app.js.

Rule: If transformation is done in app.js, it must be implemented as a pure function that maps source DOM to a normalized internal representation. It must not rewrite the embedded XML text.

Rule: Normalization is limited to presentation concerns. It must not change function names, ids, or signatures unless the change fixes an obvious typo and the original value is preserved in a sourceNote field in the internal representation and exposed in the UI as a small “Source text” note.

Rule: If conflicting ids appear across multiple documents, the system must disambiguate them by prefixing with the source block id in generated DOM ids and in sidebar navigation targets. This prevents broken anchors.

H00 Internal data model v00
H01 Core entities v00
The parser must build an internal representation with at least these entity types:

Category: id, name, summaryHtml, keywords[], notes[], headers[].
Header: id, name, summaryHtml, functions[], notes[].
Function: id, name, kind, signatureText, summaryHtml, parameters[], returns[], notes[], examples[].
Parameter: id, name, type, direction, descriptionHtml, constraints[].
Return: type, descriptionHtml.
Note: id, severity, topic, descriptionHtml.
Example: id, title, lang, codeText.

Rule: Every rendered function must have a stable DOM anchor id. The anchor id format must be deterministic and collision-free. The recommended format is fn:<sourceBlockId>:<functionIdOrNameNormalized>.

H02 Derived indices v00
The app must build a search index for the sidebar that includes:

1. function name
2. header name (for include discovery)
3. category name
4. keywords
5. parameter names
6. note topics and severities
7. signature text tokens

Rule: Indexing must be case-insensitive, ASCII-folded for A-Z only, and must preserve the original text for display. No locale-sensitive casing is required.

I00 Rendering requirements v00
I01 Global layout v00
The UI must be a single page with two primary regions:

1. Left sidebar: navigation and search.
2. Main content: full rendered documentation.

Rule: The sidebar must remain visible during scrolling on desktop widths by using position: sticky or equivalent. On narrow screens, the sidebar may collapse into a top bar with a toggle that shows the sidebar overlay, but the main content must remain fully visible and scrollable.

Rule: The application must not use collapsible sections for content within function documentation. All function content is rendered expanded.

I02 Sidebar content v00
The sidebar must include: a search input, a results/navigation list, and category/header grouping.

Rule: The search input filters the sidebar list only. It must not remove or hide main content.

Rule: The navigation list must include entries for categories, headers, and functions. Function entries must show function name and header name at minimum. Optionally show a short signature snippet.

Rule: When the search query is empty, the sidebar shows the full table of contents grouped by category then header then functions.

I03 Main content structure v00
The main content must render in this top-to-bottom order:

1. Category title and category summary.
2. Category keywords and category notes (if present).
3. For each header: header title and header summary.
4. For each header: function cards in the order they appear in the XML.

Rule: Function card layout must include, in order: function name, signature, summary, parameters, returns, notes, examples.

Rule: The signature must be rendered in a monospace block with copy-friendly formatting.

Rule: Examples must be rendered as code blocks using a monospace font, preserving whitespace. Code blocks must support one-click copy to clipboard.

Rule: Parameter direction must be visible as normalized labels: in, out, inout. If absent, direction is shown as in by default.

I04 Styling rules v00
The UI must be minimalistic and readable. The default font must be the platform system UI font stack for body text. Code must use a monospace stack.

Rule: Use a neutral background, high-contrast text, and subtle separators. Avoid heavy gradients, shadows, or animations.

Rule: The theme must avoid distracting colors. Use color only for meaning: note severity, link state, focus outlines, and the active navigation highlight.

Rule: All interactive controls must have visible focus state suitable for keyboard navigation.

J00 Interaction and behavior v00
J01 Navigation to anchors v00
Rule: Clicking a sidebar entry must scroll the main content to the corresponding anchor and update the URL fragment to that anchor id.

Rule: After navigation, the target function card or header must be visually highlighted for 1.5 seconds using a transient class. The highlight must not change layout.

J02 Search behavior v00
Rule: Sidebar search is incremental. Each keystroke updates the navigation list within 50 ms for typical data sizes (six XML docs). If computation exceeds this, debounce at 75 ms.

Rule: Matching must use substring matching over tokens. The match must consider function name first, then header, then keywords, then signature tokens, then parameter names. The ordering of results must be stable and deterministic.

Rule: Search results must display the matched entity type and its context (for example, function plus header). Do not hide non-matching main content.

J03 Copy-to-clipboard v00
Rule: Signature blocks and example code blocks must provide a copy button. Clicking copies the exact text content as rendered, without extra whitespace trimming beyond removing a trailing newline.

Rule: If clipboard write fails, the UI must show a small inline error message adjacent to the button and must not use alert().

J04 Keyboard behavior v00
Rule: The search input must be focusable via Tab. Pressing Enter in the search input navigates to the top result if one exists.

Rule: Pressing Escape while the search input is focused clears the search input.

Rule: All sidebar entries must be reachable by keyboard, and Enter activates navigation.

K00 Error handling and validation v00
K01 XML parse errors v00
Rule: If an XML block fails parsing, the main content must still render all other blocks. The sidebar must include an “Errors” section listing the failed block ids. The errors section must include a short message and a suggestion to check that embedded XML is well-formed.

K02 Missing or malformed fields v00
Rule: Missing summary, notes, returns, or examples must be treated as absent. No placeholder text is rendered.

Rule: Missing function signature must be rendered as a visible warning line inside that function card: “Signature missing in source.” This warning is not collapsible.

K03 Duplicate anchors v00
Rule: Anchor ids must be unique. If a collision occurs after normalization, the renderer must append a deterministic suffix “-2”, “-3”, etc., and the sidebar must target the final id.

L00 User workflows v00
L01 Find and use a function by name v00

1. The user opens index.html in a browser. The page loads with the sidebar on the left and the full reference on the right.
2. The user clicks the sidebar search input and types “strtol”.
3. The sidebar list filters to matching functions, showing “strtol” with its header context.
4. The user presses Enter. The main pane scrolls to the strtol function card, highlights it briefly, and the URL fragment updates.
5. The user reads the signature and parameter rules, then clicks the copy button on the example code block.
6. The user pastes the example into their codebase and adapts it.

L02 Browse by header and scan functions v00

1. The user scrolls the sidebar table of contents without typing.
2. The user selects a header, for example stdio.h, to jump to that header section.
3. The main pane scrolls to the header and shows all its functions expanded.
4. The user uses Ctrl+F and types “fopen” to jump inside the page. The match is found because content is not hidden.

L03 Verify tricky behaviors using notes v00

1. The user navigates to a function known to have pitfalls, such as localtime or mktime.
2. The user reads the notes section where severity is displayed.
3. The user copies an example that demonstrates defensive usage (copying tm, tm_isdst = -1).
4. The user adopts the pattern as a default template.

M00 Specification-by-example for observable outcomes v00
M01 Ctrl+F visibility v00
Given the page is fully rendered, when the user presses Ctrl+F and searches for a function name that exists in any XML block, the browser must find at least one match in the main content without requiring any expansion action.

M02 Sidebar search does not hide main content v00
Given the user types a query that matches only one function, the sidebar list must narrow to that function, and the main content must remain unchanged except for optional highlight when the user navigates.

M03 Anchor determinism v00
Given two XML blocks contain a function with the same function id, the rendered anchor ids must still be unique, and clicking either sidebar entry must navigate to the correct function card.

M04 XML block failure isolation v00
Given one embedded XML block is malformed, the app must still render content from the other blocks, and the error must be visible in the UI without blocking interaction.

N00 Deliverables and acceptance criteria v00
The implementation must produce exactly these deliverables in the workspace root or a clearly specified folder: index.html, app.js, styles.css.

Acceptance is achieved when all of the following are true:

1. index.html embeds all XML documents from D:\data-to-process as separate application/xml script blocks, without merging.
2. app.js parses all embedded blocks, renders a sidebar search and table of contents, and renders all documentation expanded in the main pane.
3. No external libraries are used. No network access is required.
4. Ctrl+F finds function names in the main pane because content is not hidden.
5. Copy-to-clipboard works for signatures and examples, with graceful failure messaging.
6. Parse failures in one XML block do not prevent rendering of other blocks, and errors are shown in-page.

O00 Deferred features v00
Bookmarks/likes, localStorage persistence, per-user preferences, theming customization, and content editing tools are explicitly deferred. If any deferred feature is implemented, it must be gated behind a disabled-by-default flag and must not alter the baseline behavior defined above.
