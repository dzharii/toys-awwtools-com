---

A00 Purpose and Quality Definition

---

This document defines what implementation quality means for the Grid and Atlas Helper project, how that quality is produced during development, and how it is verified before a feature is considered complete.

Quality in this project is not defined as the maximum possible number of abstractions, tests, comments, compatibility branches, configuration options, or visual effects.

Quality means that the application:

1. Solves the specified user problem correctly.
2. Produces pixel-accurate grid and slicing results.
3. Presents a stable, clear, and internally consistent interface.
4. Behaves predictably under normal and relevant edge conditions.
5. Uses code that another developer can read, verify, and change without reconstructing hidden assumptions.
6. Contains no unnecessary architecture or code whose purpose cannot be explained.
7. Remains responsive for the supported image and grid sizes.
8. Fails in a controlled and understandable way.
9. Preserves user work where reasonably possible.
10. Can be verified through explicit acceptance checks.

A quality implementation is one in which the visual design, interaction behavior, calculations, exported output, code structure, and error handling agree with one another.

A visually polished interface that exports incorrect cells is not a quality implementation.

A mathematically correct implementation with inconsistent controls, inaccessible interactions, or incomprehensible code is also not a quality implementation.

Quality must be evaluated as a combined property of:

* correctness;
* usability;
* consistency;
* maintainability;
* performance;
* resilience;
* accessibility;
* scope discipline;
* verifiability.

---

B00 Quality Priorities

---

When quality goals conflict, the project shall use the following priority order:

```text
1. Correct output and data integrity
2. Preservation of user work
3. Clear and predictable behavior
4. Accessibility and operability
5. Maintainable implementation
6. Responsive interaction
7. Visual refinement
8. Optional convenience
```

This order does not mean that visual quality is unimportant. It means that visual refinement must not compromise calculations, state reliability, or user understanding.

For example, an animated transition must be removed or simplified if it causes:

* delayed state feedback;
* inaccurate pointer positioning;
* difficult keyboard operation;
* unnecessary rendering work;
* visual ambiguity.

An abstraction must be removed or reduced if it makes ordinary behavior harder to trace.

A compatibility branch must not be added merely because a theoretical browser could behave differently. It must correspond to an explicitly supported environment or an observed failure in a supported browser.

---

C00 Supported Environment and Scope Discipline

---

The project shall explicitly define its supported browser environment.

A recommended initial support target is:

```text
Current and previous major versions of:
- Chrome
- Edge
- Firefox
- Safari
```

The project may use modern browser capabilities available across those targets.

Unsupported environments should not receive speculative compatibility code.

The implementation should not include:

* Internet Explorer support;
* obsolete vendor-prefixed CSS without demonstrated need;
* polyfills for APIs not used by the application;
* alternate code paths for discontinued browsers;
* touch workarounds for devices outside the supported scope;
* abstractions designed only for an imagined future framework migration.

Every compatibility branch should answer:

```text
Which supported environment requires this?
What failure does it prevent?
How is the branch verified?
When can it be removed?
```

If these questions cannot be answered, the branch should normally not be added.

Scope discipline also applies to product features.

A feature should be implemented only when it is:

* defined by the specification;
* necessary to support a defined feature;
* required for correctness, accessibility, resilience, or security;
* approved as a deliberate extension.

A developer should not add unrelated convenience features merely because they are easy to implement.

---

D00 Definition of Done

---

A feature is complete only when all applicable conditions below are satisfied.

The behavior matches the functional specification.

The layout and interaction match the UX and UI specification.

The implementation follows the quality rules in this document.

The feature has explicit acceptance criteria.

The acceptance criteria have been manually or automatically verified.

Normal, boundary, invalid-input, and recovery behavior have been checked.

Keyboard operation has been checked where the feature is interactive.

Visual states have been checked at supported viewport sizes.

No unexplained console errors or warnings occur during the tested workflow.

No temporary debugging code remains.

No dead code, unused imports, obsolete CSS selectors, or unreferenced assets remain.

Names accurately describe the implemented concepts.

Non-obvious formulas and invariants are documented.

Error messages explain both the problem and its consequence.

The feature does not create unnecessary storage writes, renders, event handlers, object URLs, or retained large objects.

The feature can be understood through code inspection without depending on undocumented conversation history.

---

E00 Quality Categories

---

Implementation quality shall be reviewed through the following categories:

| Category                 | Primary concern                                        |
| ------------------------ | ------------------------------------------------------ |
| Domain correctness       | Grid, pixel, slice, and export calculations            |
| Visual system            | Consistent dimensions, spacing, typography, and states |
| Icons and SVG assets     | Coherent, accessible, maintainable visual symbols      |
| Controls and buttons     | Predictable appearance and interaction                 |
| Layout                   | Stable panel geometry and responsive behavior          |
| Forms and validation     | Clear editing, normalization, and errors               |
| State management         | One authoritative state and consistent derived output  |
| Rendering                | Accurate, efficient preview and export rendering       |
| Atlas navigation         | Correct selection, preview, and traversal behavior     |
| Persistence              | Safe presets, URL state, and local session storage     |
| Export                   | Deterministic files, names, ZIP contents, and failures |
| Code architecture        | Clear separation without unnecessary abstraction       |
| Naming and documentation | Readable intent and recorded invariants                |
| Performance              | Responsive supported workflows                         |
| Resilience               | Controlled failure and recovery                        |
| Accessibility            | Keyboard, focus, semantics, and nonvisual information  |
| Verification             | Repeatable acceptance and regression checks            |

Each category must define:

```text
Expected quality
Implementation practices
Verification method
Failure indicators
```

---

F00 Visual Design System

---

The application shall use a small explicit visual system rather than individually styling each control.

The visual system should define reusable tokens for:

* spacing;
* control heights;
* border widths;
* radii;
* colors;
* font sizes;
* font weights;
* focus indicators;
* panel widths;
* icon dimensions;
* disabled opacity;
* status severity colors;
* z-index layers.

Example CSS custom properties:

```css
:root {
  --space-1: 4px;
  --space-2: 6px;
  --space-3: 8px;
  --space-4: 12px;
  --space-5: 16px;

  --control-height-compact: 30px;
  --control-height-default: 36px;

  --border-width: 1px;
  --border-radius-small: 4px;
  --border-radius-default: 6px;

  --icon-size-small: 14px;
  --icon-size-default: 16px;
  --icon-size-large: 20px;

  --panel-border-color: #d9dee7;
  --focus-color: #1677d2;
}
```

Values should not be scattered as unrelated literals throughout CSS.

A value may remain local when it is genuinely unique.

A token should be introduced when:

* the same conceptual value appears in multiple components;
* changing it should update a family of elements;
* it expresses part of the design system.

The project must avoid creating tokens for every isolated measurement. Excessive tokenization makes styling harder to trace.

---

G00 Spacing and Alignment Quality

---

All controls shall align to an intentional grid.

Labels within a section should begin at a consistent horizontal coordinate.

Related inputs should share heights and baseline alignment.

Units such as `px`, `%`, and counts should occupy predictable positions.

The implementation should use CSS Grid for structured forms instead of compensating with arbitrary margins.

Preferred:

```css
.form-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
```

Avoid repeated local adjustments such as:

```css
.cell-width-input {
  margin-left: 13px;
}

.row-input {
  margin-left: 17px;
}
```

A visual alignment decision should be applied to all equivalent controls.

For example, if numeric fields in the Grid Geometry section are 72 pixels wide, equivalent pixel-count fields in Borders and Separators should normally use the same width.

Different widths are acceptable when the semantic range differs significantly, but the variation should be deliberate.

Quality verification includes checking:

* label alignment;
* input alignment;
* unit alignment;
* vertical centering;
* equal control heights;
* consistent section padding;
* no one-pixel accidental offsets;
* no clipped focus rings;
* no controls touching panel boundaries.

---

H00 SVG Icon System

---

Icons should be implemented as SVG.

SVG is preferred because it provides:

* resolution independence;
* CSS color control;
* small source assets;
* clear geometry;
* reliable scaling;
* accessibility options;
* no need for multiple bitmap resolutions.

The project should maintain one coherent icon family.

Icons may be:

* created specifically for the project;
* adapted from a license-compatible icon set;
* composed from shared project geometry.

The project must not combine visibly incompatible icon styles without deliberate normalization.

Examples of incompatible mixing include:

* filled icons beside thin outline icons;
* rounded icons beside sharp geometric icons;
* different apparent stroke weights;
* inconsistent optical sizes;
* icons using different baseline conventions.

---

I00 SVG Icon Geometry

---

Most interface icons should use a shared coordinate system.

Recommended default:

```html
viewBox="0 0 24 24"
```

Compact icons may still render at:

```text
14 x 14 CSS px
16 x 16 CSS px
20 x 20 CSS px
```

The viewBox remains constant while the rendered dimensions change.

Outline icons should use a consistent stroke width.

Recommended default:

```text
1.75 or 2 viewBox units
```

The project should choose one default after visual review.

Common SVG attributes:

```html
fill="none"
stroke="currentColor"
stroke-linecap="round"
stroke-linejoin="round"
vector-effect="non-scaling-stroke"
```

`vector-effect="non-scaling-stroke"` should be used only after testing. It may produce inconsistent visual results at very small rendered sizes. A consistent viewBox and rendering size is often sufficient.

Icon geometry must remain legible at the smallest supported size.

Small details that disappear at 14 or 16 pixels should be removed rather than preserved as noise.

---

J00 SVG Icon Optical Quality

---

Geometric centering is not always visually centered.

Each icon should be reviewed for optical balance.

For example:

* a download arrow may require slightly more top space than bottom space;
* a folder icon may appear low because of its tab;
* a reload arrow may require a small horizontal adjustment;
* a border-and-separator icon may need simplified internal lines.

Icons should appear to occupy a consistent visual area even when their shapes differ.

An icon should not look significantly smaller merely because its path occupies less of the viewBox.

Quality review should compare icons side by side at actual interface size.

The following icons are expected:

```text
Application logo
Grid Creator
Atlas Slicer
Open Image
Reload
Fit
Show Grid
Grid Color
Download
Download ZIP
Download Cell PNG
Source Image
Grid Geometry
Borders and Separators
Traversal Order
Incomplete Cell Policy
Naming Template
Export
Selected Cell
Recommendations
Export Summary
Expand
Collapse
Help
Previous
Next
Pan
Zoom In
Zoom Out
Reset View
Transparent Background
Warning
Information
Success
Error
```

The list may evolve, but new icons must follow the same visual rules.

---

K00 Application Logo Quality

---

The application logo should be recognizable at small size.

It should not attempt to illustrate every application capability.

A suitable concept is an abstract combination of:

* a grid;
* a highlighted cell;
* a slicing boundary;
* a small atlas arrangement.

The logo should remain legible at:

```text
16 x 16 px
20 x 20 px
24 x 24 px
32 x 32 px
```

The logo may use a limited accent color, but ordinary toolbar icons should primarily use `currentColor`.

The logo should not include text inside the SVG.

The logo must have a simplified favicon-compatible form.

---

L00 SVG Asset Organization

---

Recommended structure:

```text
src/
  icons/
    icon-registry.js
    svg/
      app-logo.svg
      open-image.svg
      reload.svg
      fit.svg
      show-grid.svg
      download.svg
      source-image.svg
      grid-geometry.svg
      borders-separators.svg
      traversal-order.svg
      naming-template.svg
```

Two implementation approaches are acceptable.

Approach 1 uses inline SVG component functions.

Approach 2 loads SVG files through an icon registry.

For a static native JavaScript application, inline SVG templates or a small registry are usually simplest.

Example:

```js
const ICONS = {
  download: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      ...
    </svg>
  `
};
```

The project must not duplicate the same SVG source in multiple UI modules.

---

M00 SVG Accessibility

---

Decorative icons inside text-labeled controls should use:

```html
aria-hidden="true"
focusable="false"
```

The text label provides the accessible name.

An icon-only control must have an explicit accessible label:

```html
<button type="button" aria-label="Collapse Source Image section">
  ...
</button>
```

Important meaning must not exist only inside the icon.

A warning card must contain text such as `Warning` or an explicit description, not only a warning triangle.

---

N00 SVG Acceptance Checks

---

Each icon must be checked at every rendered size used by the application.

Acceptance conditions:

* the icon is recognizable without magnification;
* its stroke weight matches neighboring icons;
* it appears optically centered;
* it does not clip;
* it uses `currentColor` unless color is semantically required;
* hover, active, disabled, and high-contrast states remain legible;
* decorative icons are hidden from assistive technology;
* icon-only controls have accessible labels;
* SVG markup contains no editor metadata or unnecessary groups;
* IDs inside SVGs do not conflict when multiple copies are present;
* the asset has a known license or was created for the project.

A visual icon sheet should be maintained during development to compare the complete family.

---

O00 Button Categories

---

Buttons shall be classified by role.

Recommended categories:

| Category           | Example                      |
| ------------------ | ---------------------------- |
| Primary action     | Download ZIP                 |
| Standard action    | Open Image                   |
| Toggle action      | Show Grid                    |
| Segmented option   | 100%, 200%, 400%             |
| Destructive action | Clear all presets            |
| Inline action      | Apply Suggestion             |
| Icon-only utility  | Collapse section             |
| Navigation         | Previous sprite, Next sprite |

A button's visual style should communicate its role.

There should normally be only one dominant primary action within a local region.

The application may show Download ZIP in both the header and Export Summary, but these are two locations for the same primary command rather than two competing commands.

---

P00 Button Dimensions and Internal Alignment

---

Buttons belonging to the same toolbar should share:

* height;
* border radius;
* font size;
* icon size;
* icon-to-text gap;
* vertical alignment.

Recommended toolbar button:

```text
Height: 36 px
Horizontal padding: 12 to 16 px
Icon size: 16 px
Icon-label gap: 7 to 8 px
Border radius: 5 px
```

Compact inline buttons may use:

```text
Height: 30 px
Horizontal padding: 9 to 12 px
Icon size: 14 px
```

The icon and label should be vertically centered through flexbox.

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

Manual top offsets should not be used to align individual icons unless optical review proves a shared icon requires correction.

---

Q00 Button Grouping

---

Buttons should be grouped according to task meaning.

The selected toolbar contains these conceptual groups:

```text
File input:
[Open Image] [Reload]

Viewport scale:
[Fit] [100%] [200%] [400%]

Overlay:
[Show Grid]

Export:
[Download ZIP]
```

Controls inside one group have a small gap or shared segmented border.

Different groups have a larger gap or a subtle divider.

Recommended spacing:

```text
Inside a group: 0 to 4 px
Between related groups: 10 to 14 px
Between major groups: 16 to 24 px
```

The percentage controls may use a segmented control because they are mutually exclusive presets.

Fit should remain visually related but distinct because it is an adaptive calculation rather than a fixed percentage.

A group must not depend only on spacing. The semantics should also be apparent from control labels and behavior.

---

R00 Button States

---

Every button must define:

```text
Default
Hover
Pressed
Focus-visible
Disabled
Busy
Selected, where applicable
```

The state must not be communicated only by color.

For example, Show Grid should use:

* selected background;
* selected border;
* `aria-pressed="true"`;
* stable label.

Disabled controls should remain readable.

Busy primary buttons should display a stable width to avoid layout movement.

Example:

```text
Download ZIP
-> Preparing...
-> Encoding 124 / 768
-> Creating ZIP...
```

The button may display a spinner, but the changing text should not cause adjacent controls to move.

---

S00 Button Interaction Quality

---

A button activates once per deliberate action.

The implementation must prevent:

* duplicate export activation;
* accidental activation during drag;
* activation from both `pointerup` and `click`;
* repeated asynchronous operations after rapid clicks.

Native `<button>` elements should be used.

Div elements with click handlers should not substitute for buttons.

Buttons inside forms must explicitly declare:

```html
type="button"
```

unless they intentionally submit a form.

Keyboard activation using Enter and Space must work through native behavior.

---

T00 Button Acceptance Tests

---

Every button should have a behavioral acceptance entry.

Example for Open Image:

```text
Given no image is loaded
When Open Image is activated
Then the browser file picker opens

Given a supported image is selected
When decoding succeeds
Then the atlas appears
And source metadata updates
And export becomes available

Given decoding fails
Then the previous image remains unchanged
And an understandable error appears
```

Example for Show Grid:

```text
Given the grid is visible
When Show Grid is activated
Then the overlay disappears
And slicing coordinates remain unchanged
And exported images remain unchanged
And aria-pressed becomes false
```

Example for Download ZIP:

```text
Given valid slices exist
When Download ZIP is activated
Then exactly one export begins
And duplicate activation is disabled
And progress is shown
And the resulting archive is downloaded
And the archive contains the expected files and manifest
```

Visual checks must also confirm:

* correct size;
* correct spacing;
* correct selected state;
* focus ring visibility;
* disabled appearance;
* no text clipping;
* no layout shift during busy state.

---

U00 Form Controls

---

The application contains numeric inputs, selects, checkboxes, color controls, template inputs, and file inputs.

Native controls should be used where they provide correct semantics and behavior.

Custom controls should be introduced only when native controls cannot provide the required interaction or consistent rendering.

Every control must have:

* an explicit label;
* a defined value type;
* a valid range;
* a normalization rule;
* an error behavior;
* a keyboard behavior;
* a persistence classification;
* an identified state property.

Controls must not maintain independent undocumented state.

---

V00 Numeric Input Quality

---

Numeric inputs should permit temporary editing states.

For example, while replacing `32` with `64`, the field may temporarily be empty.

The application should distinguish:

```text
Edit string
Committed numeric value
Validation result
```

It should not immediately replace an empty edit with zero.

On commit through blur or Enter:

* parse the value;
* require an integer where geometry requires integers;
* validate the range;
* update state if valid;
* restore the previous committed value if invalid;
* show an inline explanation.

Spinner behavior should not accidentally change values while the user scrolls the tools panel.

Wheel changes should be prevented unless deliberately supported and the control is focused.

---

W00 Select and Segmented Control Quality

---

Select controls should use concise, explicit option labels.

Avoid vague options such as:

```text
Default
Normal
Special
```

Prefer:

```text
Row-Major: Left to Right, Top to Bottom
Column-Major: Top to Bottom, Left to Right
```

Segmented controls should only be used for a small set of closely related mutually exclusive options.

Suitable examples:

```text
100% | 200% | 400%
Grid Creator | Atlas Slicer
Transparent | Solid
```

A segmented control should not contain unrelated commands.

---

X00 Panels, Sections, and Scroll Areas

---

Panel geometry must remain stable while content updates.

Recommendations must not push controls in the left panel.

The left and right panels should use independent vertical scrolling.

The central image viewport uses pan and zoom rather than causing page scrolling.

The sprite strip uses horizontal scrolling.

Every scroll container should have:

* a visible boundary;
* keyboard accessibility;
* retained scroll position where appropriate;
* no nested same-direction scroll area without clear need.

The application should avoid scroll traps.

A wheel over the left tools panel should scroll the panel.

A wheel over the atlas viewport should zoom according to the specified interaction.

A wheel over the sprite strip should scroll the strip horizontally.

These differing behaviors should be deliberate and tested.

---

Y00 Responsive Layout Quality

---

The primary supported experience is desktop.

The layout must be tested at representative widths such as:

```text
1920 x 1080
1600 x 900
1440 x 900
1280 x 800
```

At widths below the three-panel threshold, the right panel should collapse before the central workspace becomes unusably narrow.

The implementation should use explicit breakpoints based on actual layout pressure rather than arbitrary device names.

A breakpoint is justified when:

* toolbar controls wrap poorly;
* central image width becomes too small;
* form labels clip;
* right-panel content cannot display values;
* the sprite strip loses practical navigation space.

Visual review should confirm that responsive transitions do not create hidden or duplicated actions.

---

Z00 Domain Calculation Quality

---

All grid and slice geometry must be implemented in pure calculation modules.

The same calculated layout must drive:

* preview rendering;
* selected-cell metadata;
* recommendations;
* sprite strip;
* individual download;
* ZIP export;
* manifest contents.

No renderer or UI component should independently recalculate cell positions.

A single function should define a cell rectangle for a given row and column.

Example:

```js
calculateCellRectangle(gridDefinition, columnIndex, rowIndex)
```

The result must use zero-based coordinates and half-open rectangles.

Domain functions must not read DOM state.

Inputs and outputs must be explicit objects.

---

AA00 Formula Documentation

---

Every nontrivial grid formula should include a short explanation of its invariant.

Useful documentation:

```js
// Separators exist only between cells. The final cell has no
// trailing separator, so N cells contain N - 1 separators.
const separatorPixels = Math.max(0, cellCount - 1) * separatorSize;
```

A formula comment should explain why the formula is correct, not narrate the operators.

Examples must be included in module-level documentation for:

* no separator;
* one-pixel separator;
* outer border;
* partial final cell;
* fixed count overflow;
* nonzero origin.

The implementation should not depend on comments to compensate for confusing names. Both code and comments should be clear.

---

AB00 State Management Quality

---

There shall be one authoritative application state.

UI elements should render from that state.

A control change should dispatch or invoke an explicit state update rather than directly changing unrelated controls.

Recommended update shape:

```js
updateApplicationState(draft => {
  draft.gridDefinition.cell.widthPixels = nextCellWidth;
});
```

The state update process should:

1. Apply the candidate change.
2. Normalize supported values.
3. Validate invariants.
4. Recalculate derived layout.
5. Revalidate selection.
6. Notify relevant renderers.
7. Schedule persistence.

Derived values should not be duplicated as editable state.

For example, total cell count should be calculated from rows and columns.

---

AC00 DOM Construction Quality

---

Native DOM construction can become verbose.

The project should reduce repeated mechanical code without introducing an opaque UI framework inside the application.

Small helpers are appropriate for recurring patterns.

Examples:

```js
createElement(tagName, options)
createButton(options)
createLabeledField(options)
createSection(options)
bindIntegerInput(options)
bindSelect(options)
```

A helper is justified when it removes repeated structure while keeping behavior visible.

A helper is not justified when:

* it supports only one call site;
* it accepts many unrelated options;
* developers must inspect its implementation to understand ordinary markup;
* it creates hidden subscriptions;
* it embeds domain logic;
* it becomes a private declarative framework.

Good helper:

```js
createToolbarButton({
  label: "Show Grid",
  icon: "grid",
  pressed: state.viewport.showGrid,
  onClick: toggleGridVisibility
});
```

Poor helper:

```js
makeComponent({
  type: 7,
  behavior: "auto",
  data: config,
  flags: 146
});
```

---

AD00 UI Component Boundaries

---

A UI module should correspond to a recognizable application region or interaction.

Suitable modules:

```text
app-header.js
mode-tabs.js
atlas-toolbar.js
tools-panel.js
grid-geometry-section.js
sprite-preview-strip.js
selected-cell-panel.js
recommendations-panel.js
export-summary-panel.js
status-bar.js
```

A component should own:

* its DOM structure;
* rendering of its state;
* local event wiring;
* cleanup of local resources.

A component should not own domain calculations that are shared with export or other UI regions.

Components should communicate through state updates and explicit callbacks rather than querying one another's DOM.

---

AE00 Event Subscription Quality

---

Event subscriptions must be visible and removable.

Where components have a lifecycle, they should expose cleanup.

Example:

```js
export function createAtlasToolbar(context) {
  const abortController = new AbortController();

  button.addEventListener(
    "click",
    handleClick,
    { signal: abortController.signal }
  );

  return {
    element,
    destroy() {
      abortController.abort();
    }
  };
}
```

The implementation should avoid anonymous event functions when the handler needs:

* cleanup;
* reuse;
* testing;
* nontrivial logic;
* stack-trace clarity.

Event delegation is appropriate for repeated dynamic elements such as sprite thumbnails.

Delegation should not be used when it obscures which interactions a component supports.

---

AF00 Rendering Quality

---

Preview rendering should be separated from export rendering.

The preview may adapt to viewport size.

Export must use exact configured source dimensions.

Rendering should be scheduled through `requestAnimationFrame` so multiple state changes in one event cycle produce one visual update.

The implementation should not use a long debounce for direct visual feedback.

Recommended timing:

```text
State update: immediate
Derived calculations: immediate
Preview render: next animation frame
URL update: debounced
Session storage: debounced
Explicit preset save: immediate on command
```

The source atlas should not be copied into a full-size canvas on every overlay change.

Grid and selection overlays should be independently redrawable.

---

AG00 Performance Quality

---

Performance quality means supported workflows remain responsive, not that every theoretical operation is optimized.

The implementation should first use clear algorithms with appropriate complexity.

Optimization should be based on:

* observed interaction delay;
* measured memory retention;
* repeated expensive work;
* large supported inputs.

Relevant performance risks include:

```text
Repeated full-image redraw
Thousands of thumbnail DOM elements
Repeated PNG encoding
Retained object URLs
Unbounded preview cache
Local-storage writes on each input event
Multiple animation frames for one state change
Repeated layout measurement
```

The browser performance tools should be used before adding complex optimizations.

---

AH00 Sprite Preview Strip Quality

---

The sprite strip should not create thousands of fully rendered thumbnails at once.

The implementation should initially support lazy generation and a bounded cache.

For large atlases, virtualization should render only:

* visible items;
* a small overscan range.

The selected item must remain synchronized with:

* the atlas highlight;
* selected-cell panel;
* naming preview;
* status bar.

Navigation order must use the configured traversal order.

Thumbnail centering must be deterministic.

If the selected thumbnail is already visible, the strip should not move unnecessarily.

---

AI00 Export Quality

---

Export output must be deterministic.

Given the same source image and configuration, the application should produce:

* the same slice rectangles;
* the same names;
* the same manifest records;
* the same ordering.

ZIP binary bytes may differ because of metadata or compression implementation, but archive contents must be logically equivalent.

Before generating the archive, the exporter must validate:

* source image availability;
* valid geometry;
* slice rectangles;
* filename uniqueness;
* incomplete-cell policy;
* supported image format;
* total export count.

An export must not begin partially and later discover a predictable naming collision.

---

AJ00 Object and Resource Lifecycle

---

Large browser resources must have explicit ownership.

Resources include:

```text
Object URLs
ImageBitmap objects
Canvas elements
Blob objects
Thumbnail caches
Decoded source images
ZIP instances
Event subscriptions
Animation frame requests
```

When replacing an image:

* cancel or invalidate prior decoding;
* revoke the old object URL;
* release the old bitmap where supported;
* clear incompatible preview cache entries;
* preserve configuration.

When destroying a component:

* remove event subscriptions;
* cancel scheduled work;
* release owned references.

Resource cleanup should not be scattered throughout unrelated modules.

---

AK00 Error Handling Quality

---

Errors should be handled at the layer that can add useful context.

A low-level module may throw:

```text
Canvas encoding returned null.
```

The export service should contextualize it:

```text
Could not encode sprite 124 as PNG.
```

The UI should present:

```text
The export stopped because sprite 124 could not be encoded as PNG.
Your source image and settings are unchanged.
```

Errors must not be silently swallowed.

Expected invalid user input should not be treated as an exceptional program crash.

Unexpected failures should retain diagnostic context in the console while showing a clear user-facing message.

---

AL00 Naming Quality

---

Names should describe domain meaning.

Prefer:

```js
selectedColumnIndex
sourceImageWidthPixels
separatorWidthPixels
completeCellCount
createSpriteFileName
calculateRequiredCanvasWidth
```

Avoid:

```js
x1
data2
thing
value
process
temp
doStuff
handleData
```

Short names are acceptable in very small mathematical scopes where their meaning is conventional and documented.

For example:

```js
for (let row = 0; row < rowCount; row += 1) {
```

is clearer than unnecessarily verbose alternatives.

Single-letter names such as `x`, `y`, `r`, or `c` are acceptable inside a small geometry formula when the function signature and context make them unambiguous.

They should not be used across long functions or unrelated concepts.

---

AM00 Function Extraction Rules

---

A block should be extracted into a function when one or more of the following apply:

* it represents a domain operation with a useful name;
* it is reused;
* it contains nontrivial branching;
* it separates one abstraction level from another;
* it can be verified independently;
* its current placement obscures the containing function's purpose;
* its name removes the need for a lengthy explanatory comment.

Example:

```js
const sliceRectangles = createCompleteSliceRectangles(
  gridDefinition,
  imageDimensions
);
```

This is preferable to embedding all enumeration logic inside the click handler for Download ZIP.

A block should not be extracted merely to reduce line count.

Avoid functions that only rename one obvious expression without adding conceptual value.

Example of unnecessary extraction:

```js
function getOne() {
  return 1;
}
```

---

AN00 Function Size and Abstraction Level

---

There is no strict maximum line count.

A function should normally operate at one conceptual level.

A toolbar click handler may orchestrate:

```text
validate
prepare metadata
start export
update progress
download result
```

It should not contain detailed pixel-copy loops, filename token parsing, DOM mutation, and ZIP compression configuration in the same body.

A long function is acceptable when it is a clear linear algorithm whose extraction would fragment understanding.

A short function is not automatically good if it hides behavior behind a chain of trivial calls.

Review should ask:

```text
Can the function's purpose be stated in one sentence?
Do all statements support that purpose?
Are details expressed at a consistent level?
Can error paths be followed?
```

---

AO00 Comment Rules

---

Comments are required for:

* formulas;
* invariants;
* browser-specific behavior;
* performance decisions;
* lifecycle ownership;
* intentional limitations;
* non-obvious error recovery;
* reasons a simpler-looking approach is incorrect.

Comments should not repeat syntax.

Prefer:

```js
// The source File object is session-only. It cannot be restored from
// localStorage after a full page reload, so only metadata is persisted.
```

Avoid:

```js
// Set file to null.
sourceFile = null;
```

A temporary workaround comment must identify:

```text
the observed problem;
the affected environment;
the removal condition;
```

Avoid unexplained `TODO` comments.

A TODO should describe a concrete missing requirement or approved improvement.

---

AP00 Code Volume and Necessary Complexity

---

Every module and abstraction should justify its existence.

During review, developers should ask of each code block:

```text
Which requirement does this implement?
Which failure does this prevent?
Which repeated pattern does this simplify?
Would removing it change supported behavior?
```

Code should be removed when it:

* supports no current requirement;
* is unreachable;
* duplicates another implementation;
* provides speculative extension points;
* wraps a stable browser API without adding domain meaning;
* preserves an abandoned design;
* handles an unsupported environment;
* is only referenced by obsolete tests.

The project should not attempt to minimize line count at the expense of clarity.

The goal is necessary code, not shortest code.

---

AQ00 Avoiding Premature Generalization

---

The first instance of a pattern should usually be implemented clearly at its point of use.

The second instance should be compared for genuine similarity.

A shared abstraction should normally be introduced when:

* behavior is conceptually the same;
* differences can be represented clearly;
* the abstraction has a stable name;
* reuse reduces maintenance risk.

Two controls that happen to contain a label and input are not necessarily the same component if their validation and interaction differ substantially.

A generic form engine is not required for this project unless repeated implementation proves it simpler than explicit code.

---

AR00 Self-Review and Rubber-Duck Review

---

Before a significant change is considered complete, the developer should perform a structured self-review.

The developer should explain the change as though describing it to another developer who has not seen the implementation.

The explanation should cover:

```text
What user problem is solved?
Where does the authoritative state live?
What inputs are accepted?
What output is produced?
What invariants must remain true?
What errors can occur?
Which resources are created and released?
How is the feature verified?
```

During this explanation, any statement such as `it just works`, `this is needed somehow`, or `this is probably fine` indicates an area requiring further inspection.

The developer should then reread the code from the perspective of:

* a future maintainer;
* a user performing the workflow;
* a tester trying to break the workflow;
* a browser executing repeated interactions.

---

AS00 Refactoring Review

---

Refactoring should occur after behavior is understood and verified.

The review should look for:

* duplicated calculations;
* duplicated DOM structures;
* misleading names;
* mixed abstraction levels;
* hidden state;
* large handlers;
* unnecessary wrappers;
* stale comments;
* repeated literals;
* unclear ownership;
* complex branching;
* unnecessary compatibility code.

A refactor must preserve externally observable behavior unless behavior change is explicitly intended.

A refactor should make at least one quality property measurably better:

```text
easier to read;
easier to verify;
less duplicated;
less coupled;
less stateful;
more explicit;
more efficient;
more resilient.
```

Refactoring for aesthetic preference alone should be limited.

---

AT00 Manual Acceptance Testing

---

Manual acceptance testing is required for the final integrated interface even when automated tests exist.

Manual testing should use defined scenarios rather than casual exploration.

Each scenario should state:

```text
Initial state
Action
Expected visual result
Expected state result
Expected exported result, if applicable
Recovery or cleanup
```

Representative scenarios include:

```text
Open a valid PNG
Replace the current image
Enter valid cell dimensions
Enter invalid cell dimensions
Toggle grid visibility
Zoom using fixed buttons
Zoom using the wheel
Pan with middle mouse
Select cells at each edge
Navigate through the sprite strip
Change traversal order
Change incomplete-cell policy
Apply a recommendation
Download one cell
Download a ZIP
Import and load a preset
Restore state from URL
Recover from corrupted local storage
```

---

AU00 Visual Acceptance Testing

---

Visual acceptance testing should verify the interface at representative viewport dimensions and states.

A baseline screenshot set should include:

```text
Grid Creator, default state
Grid Creator, warning state
Atlas Slicer, image loaded
Atlas Slicer, selected cell
Atlas Slicer, partial cells
Atlas Slicer, export in progress
Atlas Slicer, narrow desktop layout
Error state
Disabled state
Keyboard focus state
```

Automated screenshot comparison may be used, but it should tolerate minor browser text-rendering differences.

Visual review should inspect:

* panel widths;
* toolbar grouping;
* button dimensions;
* icon alignment;
* text truncation;
* section spacing;
* scrollbars;
* focus indicators;
* card severity styling;
* selected-cell alignment;
* thumbnail centering;
* no accidental overflow.

Visual testing must not replace behavioral testing.

---

AV00 Domain Acceptance Testing

---

Core grid calculations should have automated example-based checks even though the original project does not require a full unit-test infrastructure.

A lightweight browser or Node-compatible test module is sufficient.

Required calculation examples include:

```text
100 px canvas, 10 px cells, no separator
100 px canvas, 10 px cells, 1 px separator
1 px outer border
Asymmetric borders
Fixed-count overflow
Partial next cell
Nonzero origin
Row-major indexing
Column-major indexing
Partial-cell crop
Transparent padding
```

The tests should assert exact rectangles and counts.

Example:

```js
assert.deepEqual(
  calculateCellRectangle(definition, 1, 0),
  {
    x: 11,
    y: 0,
    width: 10,
    height: 10
  }
);
```

The calculation module is sufficiently important to justify direct automated verification.

---

AW00 Export Acceptance Testing

---

ZIP output should be inspected programmatically where practical.

Acceptance checks:

* archive opens successfully;
* expected file count is present;
* filenames match the template;
* manifest exists when enabled;
* manifest rectangles match calculated rectangles;
* selected source pixels match exported PNG pixels;
* separator pixels are excluded;
* outer-border pixels are excluded;
* transparent padding remains transparent;
* cropped partial files use expected dimensions;
* duplicate names block export;
* no zero-byte files are present.

A small deterministic fixture atlas should be created for verification.

The fixture should contain clearly distinguishable pixel regions so coordinate errors are obvious.

---

AX00 Accessibility Acceptance Testing

---

Accessibility checks should include:

* keyboard-only completion of primary workflows;
* visible focus on every interactive control;
* correct mode-tab semantics;
* section expand and collapse semantics;
* button accessible names;
* decorative icon hiding;
* meaningful form labels;
* error association with fields;
* status announcements that are not excessive;
* non-color severity labels;
* usable zoom at increased browser text size.

The central canvas must be accompanied by textual selected-cell information.

A canvas-only representation is insufficient.

---

AY00 Performance Acceptance Testing

---

Performance should be tested using representative supported data.

Recommended fixtures:

```text
1024 x 1024 atlas
2048 x 2048 atlas
4000 x 2000 atlas
4096 x 4096 atlas
Several hundred cells
Several thousand cells
```

Checks should include:

* image load time;
* input-to-preview response;
* wheel zoom smoothness;
* pan smoothness;
* selected-cell response;
* thumbnail strip navigation;
* memory after replacing images repeatedly;
* ZIP generation behavior;
* UI responsiveness during export.

No hard millisecond guarantee is required initially, but visible delays should be investigated.

A useful initial interaction target is that ordinary control changes appear in the next animation frame under normal load.

---

AZ00 Resilience Acceptance Testing

---

The application should be intentionally tested against:

```text
Unsupported image file
Corrupted image
Very large image
Zero complete cells
Invalid imported JSON
Unsupported schema version
Corrupted local storage
Storage quota failure
PNG encoding failure
Rapid image replacement
Repeated export clicks
Navigation during preview generation
```

The expected result is controlled failure without loss of unrelated configuration.

A failure should never leave the UI in a permanently disabled state.

---

BA00 Review Checklist for New UI Components

---

Before accepting a new UI component, verify:

```text
Does it correspond to a defined user need?
Is its location consistent with the UX specification?
Does it use existing spacing and typography tokens?
Does it reuse an established control style?
Are all states defined?
Is it keyboard operable?
Does it have an accessible name?
Does it preserve layout stability?
Does it clean up subscriptions and resources?
Does it render from authoritative state?
Does it require a new abstraction?
If so, is that abstraction justified?
Are its behaviors covered by acceptance scenarios?
```

---

BB00 Review Checklist for New Code Modules

---

Before accepting a new module, verify:

```text
Does the filename describe one domain or UI responsibility?
Is its public API small and explicit?
Does it depend on lower-level modules in a sensible direction?
Does it contain duplicated functionality?
Does it expose unnecessary implementation detail?
Are ownership and cleanup clear?
Are errors contextualized?
Are names descriptive?
Are comments focused on reasons and invariants?
Can obsolete or speculative code be removed?
Can a future developer understand why the module exists?
```

---

BC00 Quality Failure Indicators

---

The following conditions indicate declining quality:

* similar buttons use unrelated dimensions;
* icons have visibly different stroke styles;
* controls move when recommendations appear;
* multiple modules calculate cell coordinates independently;
* UI components read values directly from other components;
* event handlers mutate several DOM regions manually;
* code contains unused extension points;
* output paths are shown despite browser download behavior;
* invalid inputs silently clamp without explanation;
* export begins before predictable validation completes;
* large image resources remain retained after replacement;
* comments narrate obvious syntax while formulas remain undocumented;
* functions are split into many trivial wrappers;
* one large function mixes UI, geometry, persistence, and export;
* compatibility code has no supported target;
* visual states exist without keyboard or semantic states;
* acceptance criteria rely on phrases such as `looks correct`.

These indicators should trigger review and correction before further feature work compounds the problem.

---

BD00 Balanced Quality Standard

---

The project should not pursue perfection without regard to cost.

A balanced quality decision considers:

```text
User impact
Likelihood of failure
Severity of failure
Implementation complexity
Maintenance cost
Verification cost
Supported environment
```

A rare issue that corrupts exported sprite coordinates deserves significant protection.

A rare cosmetic difference on an unsupported legacy browser does not.

A helper used by ten consistent controls is likely valuable.

A generic framework designed for hypothetical future controls is not.

A comment explaining an unusual browser lifecycle limitation is valuable.

A comment attached to every ordinary assignment is not.

The quality process should produce confidence and clarity, not bureaucracy.

---

BE00 Final Quality Standard

---

A high-quality implementation of Grid and Atlas Helper should give the impression that every visible control, calculation, module, and message has a specific reason to exist.

The application should appear visually coherent because shared design rules are used rather than because individual elements were manually adjusted until they looked acceptable.

The code should be understandable because domain concepts, state ownership, and lifecycle boundaries are explicit rather than because every line has a comment.

The application should remain reliable because correctness, resource cleanup, invalid input, and failure behavior are designed before release rather than patched after accidental failures.

Verification should be concrete.

For any implemented feature, the team should be able to answer:

```text
What requirement does it satisfy?
How should it look?
How should it behave?
What state does it read and write?
What can fail?
How is it tested?
How do we know it is complete?
```

When those answers are precise and the implementation matches them, the project meets its intended quality standard.
