2026-04-11

Y00 Selector heuristic configuration

The tool must let the user see, change, and rerun selector optimization heuristics for each selected object.

When the user selects an element or region, the details panel should show the automatically chosen selector heuristic. This should appear as a compact control, such as `Heuristic: Stable attributes first`. The control should open a searchable dropdown. The dropdown should list all available selector optimization heuristics, with short descriptions.

When the user chooses a different heuristic, the tool should immediately regenerate selector candidates for the selected object and update the preferred selector, score, match count, and explanation.

The user should also be able to edit the resulting selector manually. After editing, the tool should test the selector and show whether it matches zero, one, or many elements. Manual edits should not be overwritten unless the user explicitly reruns a heuristic.

Z00 Automatic heuristic selection

The tool should automatically choose a selector optimization heuristic based on the selected object.

For a normal button, input, or link, default to stable attributes first.

For a control inside a meaningful area, such as a send button inside a composer, default to region-scoped semantic selector.

For a repeated item, such as messages or sidebar rows, default to collection item selector.

For weakly semantic DOM with no useful attributes, default to short resilient CSS path.

For cases where CSS cannot express the relation well, default to XPath relational fallback.

The selected heuristic should be visible to the user and changeable.

AA00 Selector optimization heuristics

`stableAttributesFirst`

Use stable authored attributes before anything else. Prefer `data-testid`, `data-test`, `data-qa`, `data-cy`, `aria-label`, `name`, `placeholder`, meaningful `id`, `role`, `type`, and stable `href`.

This is the default for well-authored pages.

`regionScopedSemantic`

Find a stable parent region first, then create a selector relative to that region. This is preferred for composer controls, modal buttons, toolbar buttons, navigation items, and sidebar controls.

Example intent: find `sendButton` inside `composer`, not every send button on the page.

`accessibleRoleAndName`

Prefer selectors based on role and accessible name. This is useful for automation frameworks that can later generate Playwright-style locators such as role plus name.

The JSON should still store neutral selector data, not Playwright-only syntax.

`shortUniqueCss`

Generate the shortest CSS selector that uniquely identifies the target in the current scope while avoiding fragile tokens.

This is useful when stable attributes exist but no single attribute is enough.

`resilientCssPath`

Generate a CSS path using stable ancestor and descendant segments. Avoid absolute paths and avoid `nth-child` unless necessary.

This is useful for component-heavy pages with weak accessibility.

`textAnchored`

Use visible text, label text, placeholder text, title, or nearby text as a selector anchor.

This is useful for labeled controls and navigation items, but should be penalized when text is long, dynamic, localized, or user-generated.

`collectionItem`

Generate a selector for repeated item units rather than one selected instance. Use sibling similarity, repeated structure, and local child selectors.

This is preferred for messages, conversation rows, search results, menu items, table rows, and cards.

`parentChildRelative`

Generate selectors as parent object plus child selector. This preserves page-object hierarchy without requiring a long global selector.

This is useful for message body inside message item, send button inside composer, or row menu inside conversation row.

`xpathRelationalFallback`

Generate XPath when useful relationships cannot be expressed cleanly in CSS, such as nearest ancestor, sibling relation, or label-adjacent control.

This should not be the default when good CSS is available.

`manualSelector`

Use the selector typed by the user. The tool should validate it and mark it as manual. It should not score it as automatically stable unless the validation checks pass.

AB00 Selector discovery heuristics

`nativeInteractables`

Find native interactive elements: `button`, `input`, `textarea`, `select`, `option`, `a[href]`, `summary`, `label`, and form-associated controls.

`ariaInteractables`

Find elements with interactive ARIA roles: `button`, `link`, `textbox`, `searchbox`, `combobox`, `checkbox`, `radio`, `tab`, `menuitem`, `option`, `switch`, `slider`, `spinbutton`, and `listbox`.

`editableTargets`

Find message inputs and editors using `textarea`, text-like `input`, `contenteditable`, `role="textbox"`, `role="searchbox"`, placeholder, label, and nearby submit controls.

`eventLikeControls`

Find custom controls through `tabindex`, inline event handlers, keyboard handlers, pointer behavior, and clickable-looking ancestors.

`landmarkRegions`

Find regions through semantic tags and roles: `nav`, `header`, `footer`, `aside`, `main`, `form`, `dialog`, `section`, `role="navigation"`, `role="dialog"`, `role="toolbar"`, `role="main"`, `role="feed"`, and `role="log"`.

`visualRegions`

Find visually meaningful containers using bounding boxes, scrollability, layout direction, position, size, density, and repeated child alignment.

`chatComposer`

Find composer regions by detecting an editable target grouped with send, attach, emoji, formatting, or submit-like controls.

`chatTranscript`

Find transcript regions by detecting scrollable message-like content, repeated vertical blocks, text density, and proximity to a composer.

`repeatedCollections`

Find repeated rows, cards, messages, menu items, search results, and navigation entries using sibling similarity, subtree shape, repeated dimensions, and repeated child roles.

`navigationClusters`

Find navbars and sidebars through clusters of short links, buttons, tabs, menu items, active states, icons, badges, and repeated rows.

`modalSurface`

Find active modal or dialog surfaces using dialog roles, fixed positioning, overlay/backdrop patterns, elevated z-index, and contained action controls.

`assertableContent`

Find non-interactive but automation-relevant content such as message bodies, titles, labels, timestamps, badges, status text, error messages, and toast messages.

AC00 UX requirement for heuristic controls

The selector details panel should include three editable areas: heuristic selector, generated selector, and selector test result.

The heuristic selector is a searchable dropdown.

The generated selector is an editable text field.

The test result shows match count, scope, score, and highlighted matches.

Changing the heuristic regenerates the selector.

Editing the selector switches the object to manual mode.

Pressing test validates the current selector without changing the selected object.

AD00 Heuristic metadata

Each heuristic should expose metadata so the UI can describe it.

Each heuristic should have an id, label, description, applicable object kinds, priority, and explanation template.

Each generated selector candidate should store the heuristic that produced it.

The export JSON should include `heuristicId` on the preferred selector and on alternative selectors. This makes later debugging possible.
