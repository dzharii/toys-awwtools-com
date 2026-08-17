---

A00 User Value and Context

---

The project provides a self-contained bookmarklet for users who write multi-line prompts or messages in browser-based editors where plain Enter normally submits the message. While the mode is active, plain Enter inserts a line break. The platform-appropriate primary shortcut, Ctrl+Enter on Windows and Linux or Cmd+Enter on Apple platforms, invokes a reliable send action when the page exposes one.

The useful outcome is a deliberate and visible editing mode that reduces accidental submission without permanently modifying the site. The mode must be easy to activate, easy to understand, and completely reversible from its own control panel or by running the bookmarklet again.

The supplied prototype established the required baseline behavior: activation through a bookmarklet, support for textareas and rich-text editors, plain Enter for newline, a modified Enter shortcut for sending, an active-mode notification, and cleanup when the notification is closed. The remastered implementation preserves those capabilities and adds isolated UI, explicit diagnostics, safer send resolution, stronger lifecycle management, and packaged installation files.

---

B00 Design Overview

---

The bookmarklet executes one unminified JavaScript function in the current page. It installs a capture-phase keyboard listener on `window`, creates a Shadow DOM control panel, and stores an idempotent controller on `window.__enterToNewlineBookmarkletController__`.

A second execution detects the controller and calls its `destroy` method instead of creating a duplicate instance. Closing the panel or pressing Deactivate calls the same destruction path. Destruction removes every registered listener, interval, UI node, and global controller reference.

Keyboard processing is event-driven. Dynamic page changes do not require a mutation observer because the listener resolves the editable target from each keyboard event's composed path. This supports editors inserted later by single-page applications and editors inside open Shadow DOM boundaries.

---

C00 Scope and Boundaries

---

The implementation covers editable `textarea` elements, `contenteditable=true` elements, Lexical editor roots or containers, and elements that expose `role=textbox` when a supported editable surface can be resolved from them.

The implementation changes only Enter-related keyboard behavior while the mode is active. It does not alter pasted content, other keyboard shortcuts, form validation, page data, network requests, account state, or server-side settings.

The project is ChatGPT-compatible but is not limited to ChatGPT. Generic form submission is preferred when available. ChatGPT-specific send-button locators are included as fallback strategies.

The bookmarklet does not guarantee sending on a page that exposes no reliable form or send control. In that case, the modified Enter event is passed to the page unchanged and a warning is recorded.

---

D00 User Interaction

---

REQ-001: Running the bookmarklet when no instance exists activates the mode and displays the control panel.

REQ-002: Running the bookmarklet while an instance exists deactivates the existing instance and does not create a replacement in the same execution.

REQ-003: Plain Enter in a supported editable inserts one newline and does not reach the page's normal Enter handler.

REQ-004: Ctrl+Enter on Windows and Linux or Cmd+Enter on Apple platforms invokes a reliable send action when one can be resolved.

REQ-005: Shift+Enter, Alt+Enter, and unrelated key combinations remain unchanged.

REQ-006: Closing the control panel deactivates the mode. The panel text must state that closing it restores the original keyboard behavior.

REQ-007: The panel can be dragged and its position is saved in origin-scoped local storage when storage is available.

REQ-008: The panel displays the active shortcuts, the last operational status, counters, and an expandable activity and diagnostics view.

---

E00 Component Architecture

---

The controller owns lifecycle state, cleanup tasks, diagnostics, counters, UI references, drag state, locator definitions, and theme state.

The locator registry contains stable identifiers, CSS selectors, and human-readable descriptions. Editable locators identify possible editor surfaces. Send locators identify page controls that can submit the current editor.

The target resolver examines `KeyboardEvent.composedPath()`. It returns the first eligible textarea or contenteditable surface and records which locator produced the match. A role or editor container may resolve to a nested supported editable.

The insertion subsystem selects a strategy based on the resolved element type. The send subsystem resolves the nearest safe action and executes it only when a reliable target exists.

The UI subsystem creates one fixed host element and attaches an open Shadow DOM root. All visual CSS is contained inside that root. Only host position, z-index, theme data, and version metadata exist on the parent page.

The diagnostics subsystem writes structured records to both the panel and the browser console. Records contain an operation name, severity, message, and sanitized context.

---

F00 Editable Target Resolution

---

LOC-EDIT-001 uses selector `textarea` and expects an enabled, writable textarea.

LOC-EDIT-002 uses selector `[contenteditable="true"]` and expects a contenteditable root.

LOC-EDIT-003 uses selector `[data-lexical-editor="true"]` and identifies a Lexical root or a container that contains a supported editable.

LOC-EDIT-004 uses selector `[role="textbox"]` and identifies an accessible textbox or a container that contains a supported editable.

A textarea is eligible only when it is not disabled, not read-only, and not `aria-disabled=true`.

A rich-text surface is eligible only when it is an `HTMLElement`, is not `aria-disabled=true`, and is contenteditable through `isContentEditable` or an explicit `contenteditable=true` attribute.

A matched textbox-like element that cannot be resolved to a supported editable is not modified. The first occurrence for that element produces a warning containing the matched element description, locator identifier, selector, locator description, and expected editable type.

Element descriptions contain structural attributes such as tag name, ID, role, contenteditable state, accessible label, test identifier, Lexical marker, and a limited class list. User-entered text is not included.

---

G00 Keyboard Behavior

---

The listener is registered on `window` in the capture phase so the bookmarklet can prevent the page's normal plain-Enter behavior before bubble-phase application handlers run.

Events are ignored when the mode is inactive, cleanup has started, the event is already default-prevented, composition is active, or the event uses IME key code 229.

Plain Enter is defined as `key=Enter` with no Shift, Ctrl, Meta, or Alt modifier.

The send shortcut is defined as `key=Enter`, no Shift or Alt modifier, and exactly the platform primary modifier. Apple platforms use Meta without Ctrl. Other platforms use Ctrl without Meta.

When plain Enter is handled, the implementation calls `preventDefault()` and `stopImmediatePropagation()` before insertion. This is required to avoid accidental page submission.

When the send shortcut has no reliable action, the event is not prevented. Native page behavior remains available.

---

H00 Newline Insertion Strategies

---

For a textarea, the implementation reads the current selection, calls `setRangeText("\n", start, end, "end")`, dispatches an input event, and verifies the expected value length and inserted character. This preserves the current selection replacement semantics and places the caret after the newline.

For a contenteditable surface, the implementation focuses the editor and ensures that the active selection is inside it. The first strategy uses `document.execCommand("insertLineBreak")` because current browser editing engines and many framework editors still integrate that command with native editing behavior and undo history.

If the browser rejects or does not accept the command, a Range-based fallback deletes the selected content, inserts a `br` element, adds a trailing `br` only when required to keep an end-of-editor caret visible, moves the caret after the inserted break, and dispatches an input event.

DEC-001: The deprecated `execCommand` API is retained as a compatibility strategy rather than the sole implementation. The Range path remains available when it fails. This is a deliberate tradeoff between API modernity and compatibility with browser-hosted rich-text editors.

A failed insertion produces an error with the operation name, target description, locator identifier, selector, locator description, error type, and truncated stack.

---

I00 Send Action Resolution

---

The send resolver first finds the nearest associated form, including forms reached through open Shadow DOM hosts.

When the form supports `requestSubmit`, the resolver uses an actionable submit control when one exists. If the form contains explicit submit controls but all are disabled or unavailable, the form is not force-submitted. If the form has no explicit submit control, `requestSubmit()` may be used without an argument.

When `requestSubmit` is unavailable, an actionable submit control may be clicked.

If form resolution does not produce an action, the resolver searches the form, the editor root, and the document using the send locator registry.

LOC-SEND-001 uses selector `button[data-testid="send-button"]` for ChatGPT-compatible send controls.

LOC-SEND-002 uses selector `button[data-testid="composer-submit-button"]` for composer implementations that expose that test identifier.

LOC-SEND-003 uses accessible Send labels as a general fallback.

An actionable control must be an `HTMLElement`, must not be disabled, hidden, `aria-disabled=true`, `display:none`, or `visibility:hidden`.

A successful send action means the page action was invoked. It does not claim that a server accepted or delivered the message.

---

J00 UI and Accessibility

---

The panel uses a restrained desktop utility-window design with system fonts, conventional borders, a title bar, a close button, keyboard labels, status area, counters, diagnostics, and a Deactivate button.

The panel is rendered in Shadow DOM to prevent page CSS from changing its layout and to prevent its own CSS from affecting the page.

The panel uses `role=dialog` and a descriptive accessible label. The status region uses `role=status` and `aria-live=polite`. Close and Deactivate controls have explicit accessible names.

The title bar is draggable with pointer input. Interactive controls do not initiate dragging. The panel position is clamped to the visible viewport during dragging and window resizing.

The design follows the page or operating-system dark preference. Theme detection is refreshed periodically to account for site theme changes.

---

K00 Diagnostics and Failure Handling

---

LOG-001: Activation records the version, platform shortcut, editable locators, and send locators.

LOG-002: Each intercepted plain Enter records the target, locator, and any container resolution.

LOG-003: Successful newline insertion records the strategy, input-event strategy, and selection range when applicable.

LOG-004: Successful send invocation records the shortcut, action identifier, action description, editor, and action target.

LOG-005: Missing send resolution records the expected form behavior and every attempted send locator.

LOG-006: Locator failures record the locator identifier, selector, description, and element context.

LOG-007: Cleanup records the deactivation reason and cleanup task count.

Warnings and errors update counters. Errors automatically expand the diagnostics view. Repeated fallback messages are throttled to avoid log flooding.

The panel retains up to 40 structured log records and displays the most recent 12. The controller exposes a read-only diagnostic snapshot through `getDiagnostics()` for browser-console inspection.

No log record contains editor text, message content, bearer tokens, cookies, or network data.

---

L00 Lifecycle and Cleanup

---

The controller registers every listener, timer, and compatibility handler through a cleanup registry.

Destruction is idempotent. Repeated calls after destruction perform no work.

Destruction marks the controller inactive before cleanup begins, records the reason, runs cleanup tasks in reverse order, removes the host, clears references, deletes the global controller only when it still points to the current instance, and reports cleanup failures to the browser console.

A health interval checks that the panel host remains connected. If external page code removes the host while the keyboard listener remains installed, the bookmarklet logs the missing host locator and deactivates itself. This prevents invisible keyboard interception.

Activation failure uses the same destruction path so partially installed listeners or nodes are removed.

---

M00 Security and Privacy

---

The bookmarklet performs no network requests and does not read authentication state, cookies, local message text, clipboard contents, or account data.

Local storage is used only for the numeric panel position and is scoped by the current origin. Storage failures degrade to the default position and produce a throttled warning.

Static UI strings are inserted into the Shadow DOM. Dynamic diagnostic values are assigned through `textContent` rather than interpreted as HTML.

The global controller exposes lifecycle and sanitized diagnostics only.

---

N00 Compatibility and Constraints

---

The implementation targets modern Chromium, Firefox, and Safari-class browsers with support for arrow functions, optional chaining, Shadow DOM, `KeyboardEvent.composedPath`, `Range`, and standard DOM events.

Browser bookmark URL length limits vary. The package provides both an installer link and text files so the user can choose drag installation or manual bookmark editing.

Page internals may change. Generic form behavior is more stable than site-specific send locators, but no bookmarklet can guarantee compatibility with every custom editor or closed Shadow DOM implementation.

Synthetic input events are not trusted browser events. Most controlled editors react to them, but a site may intentionally ignore synthetic events or immediately reconcile direct DOM changes.

The source remains readable and unminified. The bookmarklet source contains no code comments. The package contains no runtime dependencies.

---

O00 Test Strategy

---

TEST-001 validates JavaScript syntax with `node --check`.

TEST-002 validates package consistency between the readable source and generated bookmarklet files.

TEST-003 runs a headless Chromium harness containing a textarea, a contenteditable editor, and a form. The harness verifies textarea newline insertion, input-event dispatch, form submission through Ctrl+Enter, rich-text newline insertion, panel creation, Shadow DOM isolation, cleanup through the UI, controller removal, and unchanged key events after cleanup.

TEST-004 validates that the generated installer contains the expected bookmarklet and remains self-contained.

TEST-005 scans the package for the original pasted token pattern and for external runtime URLs. No authentication material is expected in this project.

---

P00 Packaging and Installation

---

The package contains the readable JavaScript source, a readable `javascript:` URL used by the installer, an optional percent-encoded bookmarklet URL, a self-contained installer page, a browser test harness, a static validation script, the original source material, this specification, a README, version metadata, and SHA-256 checksums.

The recommended installation path is to open the installer page and drag the Enter to Newline link to the bookmarks bar. The alternative path is to create a bookmark manually and copy the URL from the distribution text file.

The package version is 1.0.0.

---

Q00 Assumptions and Proposed Decisions

---

ASSUMPTION-001: The primary target is ChatGPT and similar browser composers, but generic form and editor compatibility is useful and remains within scope.

ASSUMPTION-002: A compact diagnostics panel is preferable to silent failure because the mode changes a fundamental keyboard action.

DEC-002: The UI is draggable and position-persistent because a fixed top-right panel can obscure page controls on some layouts.

DEC-003: The send shortcut is handled explicitly only when a reliable action exists. Passing the event through is safer than clicking an ambiguous control.

DEC-004: Dynamic editors are handled through event-time resolution rather than mutation observation. This reduces background work and naturally covers newly inserted editors.

DEC-005: Closing the panel is deactivation, not dismissal. An invisible active mode would be ambiguous and unsafe.
