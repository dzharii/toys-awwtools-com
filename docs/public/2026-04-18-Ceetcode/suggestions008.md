2026-04-18
A00. editor-and-responsive-ui-bugfix-change-request.md

# Editor and Responsive UI Bugfix Change Request

## A00. Purpose

This document defines a focused change request for a set of usability and presentation bugs in the current application. The product is already working and usable, but several details in the editor and responsive interface reduce clarity and polish. This request asks Codex to improve those areas without changing the core product model.

The bugs described here come from direct use of the current interface across desktop and smaller-width layouts. The requested fixes should preserve the existing structure of the application while making the coding experience clearer, more visually legible, and more consistent.

Codex should use its own best judgment when resolving ambiguities. Where a specific implementation detail is not dictated here, Codex should choose the option that best improves readability, consistency, and user confidence.

## B00. Scope of this change

This change request covers five main areas.

The first area is missing syntax highlighting in the code editor.

The second area is incorrect indentation behavior when pressing Enter inside the editor.

The third area is insufficient detail and presentation in the test-results pane, especially missing test input visibility.

The fourth area is code formatting support in the editor.

The fifth area is a responsive-layout issue on narrower widths where the top navigation and mode switch become visually confusing.

There is also one optional diagnostic check for the unhandled-errors bar on mobile browsers, because it may be behaving as if it were sticky when scrolling.

## C00. Bug 1: code editor lacks visible syntax highlighting

In the current state, the code editor is readable as plain text, but the code is not visually highlighted in a meaningful way. This makes the editing experience flatter than it should be and makes it harder to scan function signatures, keywords, types, string literals, comments, and punctuation structure.

The problem is visible in the current screenshots. The editor surface shows C code, but the content appears effectively unthemed or only minimally differentiated. This is especially noticeable because the surrounding UI already has a distinct visual style, while the editor looks comparatively unfinished.

Codex should fix this by enabling proper syntax highlighting for C code in the current CodeMirror setup. CodeMirror 6 exposes functionality such as highlighting and other editor features through extensions, and its theming model is also extension-based rather than something that appears automatically. Language support in CodeMirror is similarly provided through language packages that include parsing and syntax-related metadata such as highlighting and indentation. ([CodeMirror][1])

Codex should also research and choose a color scheme that fits the current overall application look. The requested outcome is not simply "turn on any theme". The chosen theme should match the calm, pale, structured look of the current interface and should not clash with the beige and green UI that already exists.

A strong implementation direction is to use a light theme tuned to the existing UI rather than dropping in a harsh dark-editor palette. CodeMirror's official documentation and examples show that themes are applied as extensions, and the official ecosystem includes well-known theme packages such as One Dark, which also makes clear that theme selection is meant to be explicit and configurable. ([CodeMirror][2])

For this product, Codex should prefer a light, low-contrast, editor-focused palette that still preserves strong enough token distinction. If Codex finds an existing CodeMirror theme that already fits well, it may use it. If not, it should build a custom theme on top of CodeMirror's theming system so the editor visually belongs to the application instead of feeling imported from somewhere else. ([CodeMirror][2])

The desired end state is that comments, keywords, includes, strings, numeric literals, function names, types, operators, and punctuation become meaningfully distinguishable at a glance.

## D00. Bug 2: pressing Enter creates the wrong indentation width

In the current editor behavior, pressing Enter creates a new line with two spaces of indentation, but the visible source code formatting uses four-space indentation. This creates an immediate mismatch between what the editor inserts automatically and what the code appears to expect.

This is especially disruptive because the current code examples and starter templates visually read as four-space-indented code. A person typing inside such a file reasonably expects the next line to preserve the surrounding indentation pattern. Instead, the editor inserts two spaces, which makes the code feel off and forces manual cleanup.

Codex should fix this so that Enter preserves the intended indentation style. The preferred behavior is that when the user presses Enter, the next line should use an indentation width consistent with the surrounding code and with the project's chosen formatting style. For this product, the requested style is four spaces.

CodeMirror supports configurable indentation behavior. Its documented configuration surface includes the indentation unit, and its language system also provides syntax-aware indentation behavior. The platform also exposes programmatic indentation support such as `indentRange`, which is useful when implementing formatting features. ([discuss.CodeMirror][3])

Codex should therefore inspect the current CodeMirror configuration and correct the indentation unit and related editor setup so that Enter, indentation commands, and auto-formatting all agree on four spaces. If the current behavior is caused by a mismatch between generic setup and language-specific indentation rules, Codex should resolve that mismatch rather than layering hacks on top of it.

The desired result is that editing feels natural. When a person presses Enter after a four-space-indented block, the new line should continue that style instead of introducing two-space indentation.

## E00. Bug 3: test result cards do not show the input values

The current test-results pane is already useful because it shows pass or fail, expected values, and actual values. That is a good baseline. However, it omits an important part of understanding the result: the input that produced that result.

This omission is especially noticeable in the right-hand lower pane where test result cards are listed. A person can see that a test named something like `sample-true` or `custom-spaces-only` passed, and they can see expected and actual values, but they cannot immediately see the test input that was executed unless they go elsewhere and reconstruct it manually.

Codex should improve the test result presentation so each result can also display its input values in a readable way. The UI should not simply dump a giant raw object into every test card, because that would become noisy. Instead, the UI should show the test input in a structured, visually understandable form.

A good implementation direction is to add an expandable or collapsible details region per test result. The collapsed state can keep the current concise summary. The expanded state can reveal the input payload, and possibly any other structured details that help explain the run. If Codex adopts collapsible behavior, the interface must make the affordance obvious. A person should immediately understand that the card can be expanded. The control should not rely on subtle iconography alone.

Codex may use explicit wording such as "Show input" and "Hide input", or a similarly clear expand or collapse label. If an HTML `details` and `summary` pattern works well within the current design, that is acceptable, but the presentation must be visually coherent with the rest of the interface.

The input should be rendered in a readable JSON-like summary or pretty form. It should preserve enough structure to help a person understand which values were passed into the solution function. For large inputs, Codex may truncate by default and allow expansion, but the design should still make the full input accessible.

The goal here is that a person looking at a test result can answer three immediate questions from one place: what input was used, what was expected, and what actually happened.

## F00. Bug 4: editor needs code formatting support

The editor currently allows code entry, but it does not yet provide an auto-formatting feature for C code. Given that this environment is intended for frequent iteration, formatting support would remove friction and make the editor feel more complete.

Codex should add a code-formatting capability to the editor. This may be implemented as a formatting action, an auto-format command, or a similar clearly exposed behavior. The exact trigger may be chosen by Codex, but the feature should be accessible and predictable.

CodeMirror itself exposes indentation helpers, but full source formatting is generally integrated through external formatters rather than being a complete built-in feature. CodeMirror community guidance around formatting commonly points to integrating a browser-capable formatter such as Prettier for languages where that makes sense, while CodeMirror itself provides indentation-oriented tools such as `indentRange`. ([discuss.CodeMirror][4])

Because this product is for C99, Codex should evaluate the most practical browser-compatible formatting route for C-family code in the current architecture. If a robust formatter is already available in the project stack, use it. If not, Codex should choose the most maintainable and realistic path rather than inventing a fragile homemade formatter.

The important part is not the brand name of the formatter. The important part is that a person can normalize the code structure without manually reindenting every block. Formatting behavior should align with the project's chosen four-space indentation style.

## G00. Bug 5: narrow-width top controls become visually confusing

At narrower widths, around the point where the application shifts away from the full side-by-side desktop layout, a responsive mode appears that introduces a visible switch between views such as `Problem` and `Code`. This behavior is functionally useful, but the visual presentation is confusing.

The issue is not that the responsive switch exists. The issue is that it does not look semantically clear. In the provided screenshot, the top area contains a `Problem` and `Code` switch near the main title and controls, while elsewhere in the same line there is also the problem-selection dropdown labeled `Problem`. This produces two different uses of the same word in very close proximity. One is a layout-mode switch. The other is a content selector. The result looks odd and makes the hierarchy of controls harder to understand.

A person seeing that top row on a narrower layout may reasonably hesitate. They may ask which `Problem` changes the current problem, which one changes the visible panel, and whether `Code` is a mode, a tab, or something else. That hesitation is avoidable and should be removed.

Codex should redesign this narrow-width mode switch so it reads more clearly as navigation between views. The most likely solution is to make it visually tab-like rather than button-like. The current switch should look like it belongs to a tab bar or segmented control whose job is to choose the visible pane. It should not visually compete with the problem-selection dropdown.

Codex should evaluate placement as well. One valid direction is to place the responsive pane switch lower in the layout, closer to the content region it controls, rather than mixing it into the same semantic zone as the problem selector and run controls. Another valid direction is to keep it near the top but visually restyle it as a clearly separate tab group.

The exact redesign is left to Codex, but the following must be true in the final result.

The person must be able to tell immediately which control chooses the current problem from the list.

The person must be able to tell immediately which control switches between viewing the problem description and viewing the code editor on narrow screens.

Those two concepts must stop looking like they are the same kind of control.

The final narrow-width presentation should feel deliberate rather than improvised.

## H00. Optional diagnostic check: unhandled errors banner may remain sticky on mobile

There is one additional issue that could not be reproduced reliably on desktop during this review, but it has been observed on Android in a mobile browser.

The `Unhandled Errors` area at the top of the page may remain floating or visually pinned while scrolling, as if it were sticky. That behavior is undesirable for this interface. The unhandled-errors strip should not behave like a persistent overlay while the person scrolls deeper into the page. It should remain part of normal page flow unless there is an intentional, explicitly designed reason otherwise.

Codex should investigate this behavior on smaller mobile browsers and verify whether any sticky positioning, fixed positioning, or scroll-container interaction is causing the bar to stay visible when it should scroll away.

If the issue is present, Codex should remove the sticky behavior and ensure that the banner participates in normal scrolling. If the issue turns out to be browser-specific or tied to an accidental CSS interaction, Codex should still harden the implementation so the top error area does not hover unnecessarily over the content.

This is a secondary item, but it should be checked while working on responsive fixes.

## I00. Research direction for Codex

Codex should treat this as both a bugfix pass and a light design-refinement pass.

For the editor, Codex should inspect the current CodeMirror integration and verify which extensions are missing or misconfigured. CodeMirror's official documentation makes clear that highlighting, language support, and themes are explicit extensions, so the most likely cause is incomplete editor configuration rather than an unavoidable limitation. ([CodeMirror][1])

For syntax colors, Codex should research existing CodeMirror themes and either select one that matches the application's light UI or build a custom theme extension tuned to the current palette. The result should look integrated with the application rather than like a default demo editor. ([CodeMirror][2])

For indentation, Codex should verify the indentation unit, Enter behavior, and any language-aware indentation extensions so that the editor consistently uses four spaces. ([discuss.CodeMirror][3])

For formatting, Codex should evaluate the most practical browser-side path for C code formatting and integrate a solution that is maintainable in this project's architecture. ([discuss.CodeMirror][4])

For the responsive layout, Codex should test the width at which the pane switch appears and redesign that mode switch with clearer semantics and clearer visual grouping.

## J00. Acceptance requirements

This change request is complete when the following are true.

The code editor shows meaningful C syntax highlighting.

The chosen CodeMirror theme matches the overall UI more naturally and does not feel visually disconnected.

Pressing Enter inside the editor preserves four-space indentation behavior rather than inserting two spaces unexpectedly.

The editor includes a usable code-formatting capability that aligns with the project's formatting style.

The test-results area allows a person to see the input values for each test in a readable way.

If test detail expansion is used, the expand or collapse affordance is visually obvious and understandable.

On narrow layouts, the control used to switch between problem view and code view looks and behaves like a clearly distinct navigation control rather than being confused with the problem-selection dropdown.

The responsive top area is easier to understand at a glance.

The unhandled-errors area has been checked on mobile behavior, and if sticky behavior was present, it has been removed.

## K00. Directions to Codex

Implement these changes as a polish and usability pass over the existing working product.

Use the screenshots and the descriptions above to locate the relevant controls and behaviors.

For editor fixes, prefer correct CodeMirror configuration over visual workarounds.

For syntax highlighting, choose or build a theme that fits the current interface and keeps code readable.

For indentation and formatting, preserve a consistent four-space style across editor behavior.

For test results, add input visibility in a way that improves understanding without making the UI noisy.

For the narrow responsive layout, redesign the `Problem` and `Code` switch so it reads clearly as pane navigation and no longer visually collides with the nearby problem selector.

Use your own judgment for exact implementation details, but keep the result calm, readable, and clearly better than the current state.

[1]: https://codemirror.net/docs/ref/?utm_source=chatgpt.com "Reference Manual"
[2]: https://codemirror.net/examples/styling/?utm_source=chatgpt.com "Example: Styling"
[3]: https://discuss.codemirror.net/t/codemirror-6-set-indentation-unit/2972?utm_source=chatgpt.com "CodeMirror 6 set indentation unit"
[4]: https://discuss.codemirror.net/t/code-formatting-in-code-mirror/3405?utm_source=chatgpt.com "Code formatting in code mirror"
