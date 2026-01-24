2026-01-24

A00 Project intent and problem statement
This project provides a small, dependency free, static website toolkit that renders a newspaper style page in the browser using only vanilla HTML, CSS, and JavaScript. The visual design target is a multi column, print inspired layout with a masthead, subhead line, optional weather box, and a repeating set of article columns that can contain headlines, bylines, paragraphs, citations, and figures. The baseline look and class naming are derived from the CodePen sample "Newspaper Style Design" by user "silkine" (owned by Silke V). ([CodePen][1])

The primary problem being solved is authoring ergonomics and correctness. The current HTML produces the intended layout, but it is manual and error prone to edit. The project introduces a DOM only builder library (main.js) that generates the same structure programmatically, enforces validation rules, emits structured logs, and surfaces all observable problems directly in the rendered page via an error banner at the top of the newspaper. Content authors should only edit content.js and should not need to modify index.html or main.js for routine content changes.

A01 High level user experience and value
The end user is a content author or developer who wants to produce a newspaper styled page quickly, with minimal distraction, and with immediate feedback when something is wrong. The newspaper should render even when some parts are invalid, but the page must clearly indicate that it is in an error state. The error display is part of the product, not a developer convenience, because the page is expected to be opened directly as a static site without tooling.

The authoring experience is intentionally split into two layers. The first layer is a stable layout and rules engine that encodes the structure and the constraints. The second layer is a readable content script that is meant to be scanned like an outline of the newspaper, where each column reads top to bottom as it will appear on the page.

B00 In scope and out of scope
In scope: a single page newspaper layout rendered client side; a fluent builder API exposed globally; DOM based rendering without innerHTML; a stable CSS contract that preserves the baseline look; validation with explicit error messages; structured logging mirrored to the console; an on page error banner that lists validation errors and optionally includes debug logs; responsive behavior via CSS media queries; a static attribution footer acknowledging the upstream design inspiration. ([CodePen][1])

Out of scope: bundlers, transpilers, module systems, or package managers; server side rendering; editing UI; drag and drop composition; rich text formatting beyond plain text and the fixed set of supported blocks; pagination across multiple newspaper pages; fetching remote content; analytics; user authentication; print fidelity guarantees; PDF export; arbitrary CSS theming beyond the documented CSS customization surface.

C00 Deliverables and file responsibilities
The implementation consists of four files with fixed roles.

index.html is the assembly file. It loads fonts, loads styles.css, provides exactly one mount element, loads main.js then content.js in that order, and contains a hard coded attribution footer referencing the upstream CodePen design and author. The mount element id and the script load order are not negotiable because content.js depends on the global API created by main.js.

styles.css contains the newspaper layout styles. It must preserve the baseline class names used by the sample layout so that the generated DOM structure maps directly to the expected look. It additionally defines the error banner styling and any minor compatibility adjustments that improve robustness.

main.js is the library. It exposes a single global namespace, constructs the DOM tree using document.createElement only, validates input, records logs, renders the error banner, and renders the newspaper content.

content.js is the only file intended for routine editing. It calls the fluent API to define the masthead and columns and then triggers rendering into the mount element.

D00 Core concepts and mental model
The system is a single pass builder that accumulates a declarative in memory representation of a newspaper page, validates the representation, then renders the DOM into a mount point.

The builder has a single mutable state instance per page. The state includes masthead fields, weather fields, and an ordered list of columns. Each column is itself a builder that stores a small set of structured blocks.

Rendering is best effort. Validation determines whether the page is in an error state. If there are validation errors, the system must still render the newspaper after the error banner, unless a fatal runtime exception prevents DOM construction.

E00 Public API surface and stability contract
The library exposes a global object on window named NewspaperKit. This name is stable and must not change without a major version break.

NewspaperKit.create(options) constructs a builder. options.mount is required and identifies where the page will render. mount accepts either a CSS selector string or a DOM Element. If mount cannot be resolved, the library must log an error and must not throw.

The builder exposes the following fluent methods and returns itself from each method to enable chaining.

masthead({ title, subhead }) sets the masthead title and the subhead line. title and subhead are required for a valid page. Values are treated as plain text.

weather({ title, details }) sets the weather box content. Weather is optional. If both fields are empty, the weather box is omitted.

addColumn(callback) appends a new column to the ordered list. callback receives a ColumnBuilder for authoring that column. If callback is missing or throws, the column is still appended but will likely fail validation.

render() performs validation and DOM rendering into the mount.

The ColumnBuilder exposes the following fluent methods and returns itself from each method.

headline({ level, text }) adds a headline line. level is an integer that maps to existing CSS classes hl1 through hl10. text is required and treated as plain text. The column has one primary headline and one optional secondary headline. If more than two headlines are provided, the builder must not silently drop them; it must log a warning and convert additional headlines into paragraph text blocks to preserve author intent in visible output.

byline(text) sets a byline line, rendered as a headline with a fixed CSS level consistent with the baseline look. byline is optional and treated as plain text.

p(text) adds a paragraph block. Empty strings are rejected with a warning and are not added.

paragraphs(arrayOfStrings) adds multiple paragraphs in order, applying the same rules as p.

citation(text) adds a citation block rendered with the citation styling. Empty strings are rejected with a warning and are not added.

figure({ src, alt, caption }) adds a figure block. src and alt are required for a valid figure. caption is optional but recommended. All fields are treated as plain text except src which is validated as a URL.

F00 DOM construction rules and prohibited behaviors
All DOM must be created via document.createElement and populated via textContent, setAttribute, dataset assignment, and appendChild. innerHTML is prohibited everywhere, including for convenience templates and for error banner rendering.

No event handler attributes may be set from user provided data. Attributes beginning with "on" must be ignored if provided through any helper layer.

Text is always inserted as text nodes. The content authoring layer must not allow raw HTML injection. This is a hard rule even if the site is "static", because the error banner and logs are intended to show arbitrary strings.

When rendering into a mount element, the library must clear previous content by removing child nodes, not by assigning innerHTML.

G00 Validation model, error states, and boundary conditions
Validation produces a deterministic list of human readable error strings. Each error string must identify the location of the problem using a stable path format that includes the column index when applicable.

Page level validation rules: masthead title is required and must be a non empty string after trimming; subhead is required and must be a non empty string after trimming; at least one column is required; more than eight columns is invalid and must produce an error intended to prevent unreadable output on typical viewports.

Column level validation rules: a primary headline is required; at least one body block must exist, where a body block is any of paragraph, citation, or figure.

Figure validation rules: src must parse as a URL and must use http or https protocol; alt must be a non empty string after trimming; if src is invalid, the system must still render the figure container in a degraded form but must avoid setting a broken or unsafe src value.

Runtime error rules: if the column callback throws, the system must log an error and continue; if rendering throws, the system must show a fatal error banner indicating that rendering failed and must include the debug log output in the banner.

H00 Logging requirements
The library records a structured log buffer as an ordered list. Each entry includes an ISO timestamp string, a level in the set debug, info, warn, error, and a message string. Entries may include structured data, but the library must not assume the data is JSON serializable.

Console mirroring is required by default. The library must prefix console messages with a stable tag so logs can be filtered.

The error banner must provide a "Show debug log" disclosure that renders the current log buffer in a plain text format. If the log cannot be serialized, the banner must still render a placeholder line indicating unserializable data, but it must not throw.

I00 On page error banner UX requirements
If validation produces one or more errors, the library must render an error banner at the top of the mount, above the newspaper content. The banner must be visually prominent and must not be confused with newspaper content. It must list each validation error as a separate line item. The banner must remain visible even if the newspaper itself renders successfully.

The banner must use appropriate ARIA so that screen readers announce it as an alert. The banner must not block rendering of the newspaper below it.

If there are no validation errors, the banner must not be rendered.

J00 Newspaper layout structure contract
The generated DOM must match the baseline class structure expected by the CSS. At minimum, the library must produce a masthead area containing a wrapper for the weather box and the main header, followed by a subhead line, followed by a content container holding a columns wrapper with one child per column.

Each column container uses the class name collumn and is placed directly under the columns wrapper, in the author specified order. The column head area contains headline spans with class headline and hlN where N matches the requested headline level. Paragraphs render as p elements. Citations render as a span with class citation. Figures render as a figure element with class figure containing an img element with class media and a figcaption element with class figcaption.

Ordering rule for v1: within a column, the head section appears first, then all paragraphs in insertion order, then all figures in insertion order, then all citations in insertion order. This is a deliberate simplification to keep the content API readable and to avoid complex interleaving rules. If interleaving is needed later, it must be introduced as an explicit block ordering API rather than as implicit behavior.

K00 Responsive behavior expectations
The CSS controls responsive behavior. The library must not implement responsive logic in JavaScript. The library must ensure that the weather box is optional and that the page still reads correctly when CSS hides it on smaller viewports.

The column structure must tolerate CSS switching from many columns on wide viewports to fewer columns on smaller viewports. The DOM must not assume a fixed number of columns per row.

L00 Content authoring workflow scenarios
Scenario 1, create a new newspaper page: Step 1. The author opens content.js and calls NewspaperKit.create with mount "#app". Step 2. The author sets weather and masthead strings. Step 3. The author adds one or more columns using addColumn and defines each column with headline, optional byline, and body blocks. Step 4. The author calls render. Step 5. The author opens index.html in a browser and reads the rendered page. If errors exist, the author reads the error banner and corrects content.js until the banner no longer appears.

Scenario 2, add a figure to an existing column: Step 1. The author locates the relevant addColumn block in content.js. Step 2. The author adds a figure call with a fully qualified http or https src, a descriptive alt string, and a caption. Step 3. The author refreshes the page. Step 4. If the image URL is invalid or alt is missing, the author reads the banner error message that points to the column and figure index and fixes the values.

Scenario 3, detect mistakes quickly without devtools: Step 1. The author opens the page and immediately looks at the top region. Step 2. If the error banner is present, the author treats the page as invalid even if the newspaper content appears visually correct. Step 3. The author resolves each listed error and repeats until the banner is absent.

M00 Specification by example for observable outcomes
Example 1, missing masthead title: If masthead.title is an empty string or whitespace, then render() must display an error banner containing an error that states the masthead title is required. The newspaper content must still render using an empty title string, meaning the header element exists but contains no visible text.

Example 2, figure with invalid src: If a figure src cannot be parsed as a URL, then the banner must include an error that identifies the column number and the figure number and states that the src is invalid. The rendered figure must not set a dangerous or malformed src attribute; the image may appear blank. The rest of the column must still render.

Example 3, more than two headlines: If a column has three headline() calls, then the first two headlines render as headline spans in the head section. The third headline text must still appear in the column body as a paragraph and the logger must emit a warning indicating the conversion.

Example 4, column with no body: If a column has only a headline and no paragraphs, citations, or figures, then the banner must contain a column specific error indicating the column has no body content. The column still renders its headline so the layout remains stable.

N00 Attribution requirements
index.html must include a readable attribution footer that credits the upstream inspiration as a CodePen sample titled "Newspaper Style Design" by user "silkine" and indicates that the project uses an adapted stylesheet and a DOM based builder API. The attribution must be hard coded in index.html and must not be generated by the builder. ([CodePen][1])

[1]: https://codepen.io/silkine/pen/QWBxVX?utm_source=chatgpt.com "Newspaper Style Design"
