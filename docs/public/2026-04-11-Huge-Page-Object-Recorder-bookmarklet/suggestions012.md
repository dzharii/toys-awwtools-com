2026-04-12

A00

This section describes the popup-window feature as a set of usage scenarios written from the user's point of view. The purpose is to show how the feature is used in practice, what problem it solves in each situation, what the user expects to happen, and what the application should do in response. These scenarios are not implementation notes. They are examples of real usage, written in normal prose, to clarify the intended behavior of the feature.

B00

I am inspecting a page and the inline recorder is covering the part of the interface that I need to study. I have already opened the recorder, and it is floating over the page as an inline utility window. At this moment, I want to inspect a control or a content area that is physically behind the recorder window, or so close to it that the recorder makes the page difficult to read. I do not want to close the recorder, because I am already using it, and I do not want to lose my current state.

In this situation, I look at the recorder header and click the button labeled "Open in popup window". My expectation is that the recorder moves out of the page and opens in a real browser popup window. The original page should immediately become more visible because the recorder is no longer covering it. The popup should show the same recorder session that I was already using. It should keep my selected objects, my current mode, my current selector edits, and any generated results that were already visible before I clicked the button. I should feel that the same tool has been detached from the page, not that a second unrelated copy has been launched.

C00

I am working on a page where browser popups are currently blocked. I click "Open in popup window" because I want to move the recorder out of the page, but the browser prevents the popup from opening. In this situation, I should not be left confused about what happened. I should not see the inline recorder disappear, and I should not lose my work.

What I expect instead is that the recorder stays inline and shows a clear message telling me that the popup was blocked and that I need to allow popups for the page. The message should be direct and actionable. After I allow popups in the browser, I should be able to click the same button again and retry the action. The important part of this scenario is that popup failure must be safe. It must not destroy the current session, must not leave the recorder half-detached, and must not require me to restart my work.

D00

I am already in the middle of a recording session. I have scanned the page, selected several objects, changed a selector manually, and maybe opened the JSON preview. Only after doing all of that do I decide that I want to continue in a popup window because the page is crowded and I need more space. This is the state-preservation scenario.

When I click "Open in popup window", I expect all of that work to come with me. The popup should open with the same session state that existed inline a moment before. I should still see the selected objects in the navigator, the same current object in the inspector, the same editable selector text, the same heuristic choice, and the same export preview visibility. I should not need to recreate selections, rerun the scan, or restore my edits manually. From my point of view as a user, I am not starting over. I am simply changing where the tool is displayed.

E00

I am using the recorder in popup mode because I want the inspected page to remain fully visible. While the popup is open, I continue to interact with the page itself. I move the mouse over the page, inspect different regions, select an element, maybe drag an area, and then I look back at the popup to review what the recorder captured. This is the main detached-workflow scenario.

In this mode, I expect the page and the popup to behave as one coordinated tool. The inspected page is where the target interface lives, so the hover highlights and area selection behavior should still work there. The popup is where I review results, change heuristics, edit selectors, run selector tests, and export JSON. I should never feel that the popup has lost connection to the page that it belongs to. It should remain obvious that the popup is the control panel for the currently inspected page and tab. The popup should help me see more of the page, not split the session into two separate worlds.

F00

I am working in popup mode and I decide that I want to return the recorder to the page again. Maybe I am done with the difficult part of the page, or maybe I want everything back in one place. In the popup window, I click the button labeled "Return to page". This is the reverse-transfer scenario.

What I expect is simple. The popup should close or otherwise stop being the active host, and the inline recorder should come back with the exact same session state I had in the popup a moment earlier. The current selection should still be there. The current object should still be selected. The selector editor should still contain my current changes. The mode, status, theme, and other session state should remain intact. From my perspective, this is the same tool returning to its previous place, not a reset or a recreation.

G00

I am in popup mode and I close the popup using the browser's own close button in the native window frame, not the recorder's internal controls. This is an important real-life scenario because many users will naturally close the popup that way. In some cases I may do it by accident.

In this situation, I expect the application to protect me from accidental loss of work. If the session contains meaningful unsaved work, such as selected objects or manual edits, the popup should warn me before it closes, using the browser's normal leave-page confirmation. If I continue and the popup closes anyway, the recorder should not disappear completely. Instead, the inline recorder should come back on the original page with the latest session state preserved. That way, even though I closed the popup itself, I did not lose the recorder session. The popup is only one presentation of the session, not the session itself.

H00

I am using the popup window for a longer period of time. While I am doing that, the state of the session keeps changing. I select more objects, remove one object, edit a selector, test it, switch heuristics, and open the JSON preview. This is the live-sync scenario.

As a user, I expect the popup to always show the current state of the recorder, not a stale copy from when it first opened. Every meaningful change should appear there as I continue working. If I return inline later, the inline recorder should reflect that same latest state. The core expectation here is continuity. I should be able to trust that the recorder session is one coherent thing, and that the popup is only another view of it, always kept up to date.

I00

I open the popup window, but later something unexpected happens. The popup crashes, the browser reloads it, the connection is interrupted, or the original page changes state in some way that could break coordination between the two windows. This is the resilience scenario.

In that kind of situation, I expect the recorder to fail safely. The preferred behavior is that the original page remains the source of truth and can restore the inline recorder automatically if the popup disappears or becomes unusable. I should not lose the selected objects or current edits merely because the detached window had a problem. The application should recover in the direction that preserves work and preserves control. As a user, I should feel that the popup is convenient but not dangerous.

J00

I open the popup because the inline window is too intrusive, but once the popup is open I do not want to see another fake window frame inside it. I already have the browser's own title bar, window controls, and native resizing behavior. This is the presentation-consistency scenario.

What I expect in the popup is a simplified recorder layout. The fake desktop-style title bar, drag behavior, and custom resize handles that make sense inline should not be repeated inside the popup. Instead, the recorder content should begin with a clean top toolbar or header that gives me the recorder-specific controls I still need, such as returning to the page, focusing the inspected page, changing theme, or closing the recorder. This makes the detached mode feel intentional and native. It should look like a real popup tool window, not like a fake mini-window rendered inside another window.

K00

I am switching between modes because my needs change during one session. At first I work inline because that is quick. Then I move to popup mode because I need to inspect a part of the page that was covered. Later I return inline because I want a simpler workflow again. This is the full journey scenario and it represents the intended everyday use of the feature.

The experience I expect throughout this journey is continuity, clarity, and safety. I can start recording quickly inline. I can detach the recorder when I need more visibility. I can continue working without losing context. I can come back to inline mode when that becomes more convenient. If something goes wrong, such as popup blocking or accidental popup closure, the tool should keep my work safe and give me a clear next step. The feature solves the practical problem that the recorder itself can obstruct the page under test, while still preserving the recorder as a stable, stateful working session.

---

A00 Summary

Yes, this is possible to implement, and it does not require a server. The correct mental model is not "move the whole tool into another application", but "keep the recorder session attached to the inspected page, and let the UI render in either an inline host or a browser popup host". The popup must be opened from a direct user gesture because browsers apply popup-blocker and user-activation rules to `window.open()`. Communication between the opener page and the popup can be done with `postMessage()`, and same-origin windows can also use `BroadcastChannel` if we want a secondary recovery channel. A browser-controlled close warning in the popup is also possible through `beforeunload`, but the browser owns the dialog text and behavior. A script-opened popup can generally be script-closed as well. ([MDN Web Docs][1])

The current screenshot shows the exact motivation for this feature: the inline recorder covers the page under test and reduces visibility of the inspected surface. The new feature should let the recorder session detach its UI into a popup window while preserving the active session state, selected objects, selector edits, heuristic choices, and export state. When the popup closes or the user explicitly returns to the page, the UI should come back inline without losing the session.

B00 Product goal

The product goal is to support two presentation modes for the same recorder session:

1. Inline mode, which is the current in-page floating window.
2. Popup mode, where the recorder UI is rendered in a browser popup window and the inspected page remains fully visible.

The recorder must continue to inspect and interact with the original page DOM in both modes. Popup mode must not create a second independent recorder session. It must be another view over the same session.

The popup is therefore a remote UI host, not a new primary runtime. The inspected page remains the authority because that is where the DOM under test exists, where hover and area selection happen, and where selectors are validated against the live document.

C00 Non-goals

This change is not a generic multi-window collaboration feature. It is not a full client-server architecture. It is not a requirement to persist state across browser restarts. It is not a requirement to support cross-origin communication between unrelated sites. It is not a requirement to keep both full UIs active and editable at the same time in two windows.

The default model should be one active recorder session with one primary state owner and one visible control surface at a time. The inline surface may remain partially alive as a fallback shell when popup mode is active, but it should not present itself as a second authoritative UI.

D00 Current architectural problem

The current `createOverlayApp(window)` implementation is strongly host-bound. It mixes together five responsibilities:

1. Session state and state mutation.
2. Page overlays and hit-testing on the inspected page.
3. Inline UI construction and DOM refs.
4. User actions and event binding.
5. Persistence of a small subset of UI state.

That coupling is acceptable for one host, but it is the main obstacle to popup mode. Popup mode requires the recorder to separate "session controller" from "UI host". Right now the UI and the logic are intertwined inside one shadow-root oriented implementation.

This change should therefore be treated as an architectural refactor plus a feature. The feature is "open in popup". The enabling refactor is "extract the recorder session core so it can drive more than one host".

E00 Proposed architecture

The implementation should be reorganized around three layers.

The first layer is `RecorderSessionCore`. This becomes the single source of truth. It owns the full mutable state, the selected objects, current mode, scan records, export preview state, theme, heuristic filter, selector state, popup mode metadata, dirty flags, and persistence hooks. It exposes explicit actions such as `scan()`, `selectElement()`, `selectArea()`, `setMode()`, `removeObject()`, `setManualSelector()`, `rerunHeuristic()`, `copyJson()`, `toggleJson()`, `openPopup()`, `returnInline()`, and `destroy()`.

The second layer is `InspectionRuntime`. This remains attached to the opener page and owns everything that must touch the inspected document directly: hover highlights, drag area rectangles, `elementFromPoint`, selector tests against the live document, and scan routines against the live document. This layer never migrates to the popup.

The third layer is `ViewHost`. A view host renders the recorder controls and inspector panels into some window context. There will be two implementations:

* `InlineViewHost`, which renders the current shadow-root window inside the page.
* `PopupViewHost`, which renders the UI into a browser popup window.

The core talks to one current active host and optionally maintains a dormant fallback inline host. The runtime always stays on the inspected page.

F00 Ownership model

The opener page must remain the session owner. This is the most important design decision in the entire feature.

The reasons are practical:

The opener page has direct access to the page under test.

The opener page already owns the overlays, event listeners, and the recorder singleton.

The popup does not need to inspect the page DOM itself. It only needs to show state and dispatch user commands.

If the popup is accidentally closed, the session can continue in the opener page.

This means the popup should be a thin remote UI client. It sends commands to the opener and receives state snapshots and incremental updates back. `postMessage()` is specifically designed to communicate between a page and a popup that it opened, and the popup can reference the opener through `window.opener`. Message payloads are structured-cloned, so serializable state snapshots can be sent directly without custom string serialization. Same-origin browsing contexts can also communicate through `BroadcastChannel`, which makes it a reasonable optional recovery channel if we want reconnect behavior after reloads. ([MDN Web Docs][2])

G00 Transport design

The primary transport should be direct window-to-window messaging.

The simplest reliable model is this:

The opener calls `window.open()` from a direct click on the new title-bar button. If the popup opens successfully, the opener injects or builds the popup document and boots a lightweight popup client. The opener and popup then establish a session handshake with a generated `sessionId`. Commands flow from popup to opener. State snapshots and state patches flow from opener to popup.

The message protocol should be explicit and versioned. Use a small message envelope:

`{ protocol: "huge-por-v1", sessionId, type, payload }`

Required message types should include:

`popup-ready`
`session-snapshot`
`session-patch`
`run-action`
`action-result`
`focus-inspected-page`
`request-inline-return`
`popup-closing`
`popup-closed`
`error`

Codex should use best judgment about whether to implement full patch-based sync or simpler full-snapshot sync. My recommendation is to begin with full snapshot sync after every meaningful mutation, then optimize later only if needed. The state size in this tool is manageable, and simpler synchronization is less fragile.

H00 Popup opening flow

The popup must be opened only from a trusted user action. Browsers require popup opening to happen in response to user interaction, and transient user activation can be consumed by `window.open()`. If this is delayed or indirect, popup blocking becomes likely. ([MDN Web Docs][1])

The flow should be:

User clicks "Open in popup window" from the current inline title bar.

The click handler immediately calls `window.open()` with a named popup and stable feature string.

If the returned window reference is null, undefined, or already closed, treat the popup as blocked.

If the popup opens, the opener assigns popup mode metadata, creates the popup DOM shell, mounts `PopupViewHost`, sends an initial full session snapshot, and then hides or minimizes the inline control surface.

The feature should prefer reusing an existing recorder popup for the same session rather than creating multiple popups. If a popup already exists and is not closed, the button should focus that popup and refresh its state.

I00 Popup blocked handling

Popup-blocking behavior must be a first-class scenario. `window.open()` is subject to popup blockers, and multi-window applications must work within that user-gesture constraint. ([MDN Web Docs][1])

If the popup fails to open, the inline recorder must remain fully functional. It should show a clear inline status or toast such as:

"Popup window was blocked by the browser. Allow popups for this page and try again."

This should not be a silent failure. It should not destroy or hide the inline recorder. It should not leave the session in a half-transition state.

J00 State preservation requirements

State preservation is not optional in this feature. The transfer between inline and popup modes must preserve all meaningful working state.

The preserved state should include at minimum:

Session mode such as inspect or area.

Selected objects.

Selected object id.

Generated selectors, alternative selectors, selector test results.

Manual selector edits.

Heuristic choice and heuristic filter.

Export preview visibility and export text.

Theme id.

Status message.

Counter and stable generated ids for current session objects.

Popup mode metadata.

Any "dirty" state used for close warnings.

Inline frame position and size should remain preserved for when the user returns inline. Popup window geometry should be tracked separately.

The session core should serialize a recoverable snapshot to sessionStorage after each meaningful mutation. That is not because transfer itself needs storage, but because storage gives us recovery if the popup reloads, if the inline host is remounted, or if a partial reconnect is needed. The current implementation only persists frame and theme. This feature should extend persistence to session state in a controlled, versioned format.

K00 Two-view behavior

Inline mode and popup mode are not identical presentations.

Inline mode keeps the current custom window frame, drag behavior, resize handles, and page-contained shell.

Popup mode should not render a fake OS window inside the popup. The browser already provides the native window chrome. In popup mode:

The custom traffic-light title bar and resize handles should be removed.

The top area should become a compact application header or toolbar, not a draggable faux title bar.

The browser tab or window title should show something like "Page Object Recorder - <page title>".

The popup header should still expose essential actions such as "Return to page", "Focus inspected page", "Theme", and "Close recorder".

The popup should feel like a detached tool window, not a page pretending to be a window inside another window.

L00 UI changes

In inline mode, add a new text button in the current title bar:

"Open in popup window"

Do not use an icon only. Use text exactly as a discoverable action. It can later be shortened if needed, but the first version should be explicit.

In popup mode, the top toolbar should include:

"Return to page"
"Focus inspected page"
"Close recorder"

The close control inside the popup should close the recorder session or return it inline based on the chosen product rule. I recommend this behavior:

"Return to page" transfers the UI back inline and closes the popup host.
"Close recorder" destroys the whole recorder session.
The native browser close button only closes the popup window, after warning if needed, and the opener should automatically restore the inline host.

M00 Popup close semantics

There are three close paths and they must behave differently.

Path one is native popup close using browser or OS chrome. This closes the popup window itself. If there is unsaved volatile state or the product wants explicit confirmation, attach a `beforeunload` handler in the popup. The browser will show a browser-controlled confirmation dialog; custom text is not guaranteed to be shown. The standard pattern is `event.preventDefault()` and also setting `event.returnValue` for legacy support. ([MDN Web Docs][3])

Path two is popup toolbar action "Return to page". This should not destroy the session. It should migrate the visible host back inline and then close the popup window. Since the popup was created by script, `window.close()` is generally allowed for that popup. ([MDN Web Docs][4])

Path three is popup toolbar action "Close recorder". This should tear down the full session, remove overlays from the inspected page, and close the popup. Again, script-created popup windows are generally script-closable. ([MDN Web Docs][4])

N00 Should the popup warn on close

Yes, but only under a controlled rule.

Do not always warn. Constant close prompts become hostile. The rule should be based on a meaningful dirty condition. A good first rule is:

Warn if popup mode is active and the session contains selected objects or manual edits that have not been explicitly exported or intentionally cleared.

The warning text itself must be generic from the browser. The application should only decide whether to request it. This is a browser-controlled confirmation, not a custom modal. ([MDN Web Docs][3])

O00 Inline fallback restoration

The opener page must continuously know whether the popup is still alive. The popup relationship can be monitored through the `Window.closed` property, and a popup can also notify the opener through explicit messages before closing. If the popup disappears unexpectedly, the opener should restore the inline host automatically with the latest session state. ([MDN Web Docs][5])

The restoration policy should be:

If popup closes unexpectedly, restore inline host.
If opener detects lost connection, restore inline host.
If opener page itself is unloading, the popup should either close or show a disconnected state and offer only limited actions.

P00 Detailed refactor plan

The codebase should be split along these lines.

`src/session-core.js`
Owns state, actions, subscriptions, persistence, and transfer lifecycle.

`src/inspection-runtime.js`
Owns page overlays, hit-testing, scan, selector validation against the inspected document, and document listeners.

`src/view-hosts/inline-view.js`
Renders the current inline recorder shell. Keeps shadow DOM and custom window mechanics.

`src/view-hosts/popup-view.js`
Renders the popup UI inside a real popup window document. No custom drag or resize. Uses browser-native chrome.

`src/transport/window-channel.js`
Wraps `postMessage()` with protocol validation, origin checks, session id checks, and message dispatch. If Codex decides a reconnect channel is needed, this module may also manage an optional `BroadcastChannel` fallback for same-origin session recovery. `postMessage()` should always use a specific target origin, not `"*"`, when the origin is known. ([MDN Web Docs][2])

`src/popup-manager.js`
Owns popup open, focus, blocked detection, lifecycle monitoring, and close behavior.

The existing `overlay.js` should then shrink into an assembly layer that creates the core, runtime, and initial inline host.

Q00 Recommended implementation rule

Keep the recorder logic single-owned by the opener page.

Do not attempt to run full scanning logic independently in the popup against the opener DOM. Even if same-origin access makes some of that technically possible, it would increase coupling and failure modes. The popup should dispatch intents such as "rerun heuristic", "remove object", "set selector", and "copy JSON". The opener executes them. The opener then publishes the new state.

This keeps the source of truth singular and makes popup close recovery simple.

R00 Popup document creation

The popup window should be created empty and then populated via explicit DOM APIs. Avoid stringly `document.write()` if possible. This matches the existing Trusted Types-safe direction of the project.

The popup document should contain:

A minimal document title.
A root app container.
A style element or CSS injection path appropriate for popup host.
A small boot script or direct host mount call.

The popup should reuse as much existing panel markup and section rendering logic as possible, but it should not reuse the inline titlebar and resize chrome.

S00 Theme and layout behavior

Theme state should be shared across hosts because it is session state, not host-local state. If the user changes the theme in the popup, the same theme should be used when returning inline.

Layout state should be split:

Inline host stores inline frame position and size.
Popup host stores popup outer dimensions and perhaps preferred toolbar density.

Do not force popup geometry back onto the inline host or vice versa.

T00 Edge cases to handle

The following edge cases should be explicitly accounted for in the implementation:

The popup is blocked.
The popup opens, then the user closes it immediately.
The popup is already open and the user clicks "Open in popup window" again.
The popup loses connection to the opener.
The opener page navigates or reloads while popup is open.
The popup reloads while the opener remains open.
The popup is moved to another monitor or resized independently.
Clipboard copy is triggered from the popup while the inspected page remains in the opener.
Area selection is active when popup transfer starts.
A selector test is running or just completed during transfer.
The user edits a selector in popup and then returns inline.
The user closes the popup through native chrome versus internal toolbar action.

Codex should use best judgment to add any additional edge cases discovered during implementation.

U00 UX rules

The UX must remain calm and predictable.

Opening popup should feel like "detaching the tool", not "starting a second copy".
Blocked popup should keep the user in place and explain what happened.
Returning inline should be instant and preserve work.
Unexpected popup closure should not lose the session.
Popup mode should reduce visual clutter by removing fake titlebar chrome.
The popup should always make it obvious which page or tab it belongs to. The document title should include the inspected page title or hostname.

V00 Security and origin rules

Because the popup and opener exchange state, the transport must validate both `origin` and session id on every message. `postMessage()` supports safe communication between popup and opener, but the receiver must validate the sender and the sender should use a specific target origin. ([MDN Web Docs][2])

This feature is intended for same-origin popup windows created by the recorder itself. Do not add `"*"` target origins for convenience.

W00 Testing strategy

This feature requires both unit and DOM-integration tests.

The unit layer should cover:

Session state transfer from inline to popup and back.
Snapshot serialization and recovery.
Popup manager decisions for blocked, opened, reused, and closed popups.
Dirty-state calculation for close warning behavior.
Transport protocol validation and message routing.

The DOM integration layer should cover:

Opening popup from a direct click.
Blocked popup fallback.
Popup host render without inline custom titlebar.
State preservation across transfer.
Automatic inline restoration after popup close.
Toolbar actions "Return to page", "Focus inspected page", and "Close recorder".
Live state updates from opener to popup after changes such as select object, rerun heuristic, and manual selector edit.

Happy DOM may not fully emulate real popup windows. Codex should therefore keep popup-manager logic testable behind abstractions and use stubs for popup window references where needed. The goal is confidence in our own orchestration logic, not browser-vendor-perfect popup rendering.

X00 Acceptance criteria

This change is complete when all of the following are true.

The inline recorder has a visible "Open in popup window" action.

Clicking that action from a direct user gesture opens a browser popup when allowed and keeps the session state intact. Popup opening must be done from the click path because browsers enforce popup blocker and user activation rules around `window.open()`. ([MDN Web Docs][1])

If the popup is blocked, the recorder remains inline and shows a clear notification.

When popup mode is active, the UI is rendered in the popup without the old fake window chrome.

The page overlays and inspection behavior continue to operate against the opener page.

User actions in the popup update the same session state used inline.

Returning to inline restores the inline host with no session loss.

Closing the popup via native browser chrome restores inline mode automatically unless the whole session is intentionally closed.

The popup can request a browser close confirmation when the session is dirty, using `beforeunload`. ([MDN Web Docs][3])

Internal "Close recorder" in popup closes the script-opened popup and destroys the recorder session. ([MDN Web Docs][4])

Y00 Final instruction to Codex

Implement this as a controlled architectural refactor with a feature on top, not as an ad hoc hack inside the current `overlay.js`. Keep the opener page as the session owner. Treat the popup as a remote UI host. Preserve state by design, not by last-minute copying. Handle popup blocked flow explicitly. Remove fake window chrome in popup mode. Use your best judgment wherever the specification is under-detailed or where browser behavior forces compromise. The goal is a stable detached-tool workflow that makes the inspected page visible again without losing recorder context.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/Window/open?utm_source=chatgpt.com "Window: open() method - Web APIs - MDN Web Docs - Mozilla"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage?utm_source=chatgpt.com "Window: postMessage() method - Web APIs - MDN Web Docs"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event?utm_source=chatgpt.com "Window: beforeunload event - Web APIs | MDN"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Window/close?utm_source=chatgpt.com "Window: close() method - Web APIs - MDN Web Docs - Mozilla"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/Window/closed?utm_source=chatgpt.com "Window: closed property - Web APIs - MDN Web Docs - Mozilla"

---

Z00 Implementation notes (first pass)

Implemented in this pass:

1. Popup transfer flow in `src/overlay.js` with explicit actions:
   - Inline titlebar action `Open in popup window`.
   - Popup-mode controls `Return to page`, `Focus inspected page`, and `Close recorder`.
   - Safe blocked-popup fallback status without detaching inline host.

2. Session and popup lifecycle modules:
   - `src/session-core.js` for recoverable session snapshot persistence and dirty tracking.
   - `src/popup-manager.js` for popup open/reuse/blocked detection, closure monitoring, and geometry capture.
   - `src/transport/window-channel.js` for protocol envelope/origin/session validation utilities.

3. Popup presentation behavior:
   - Popup mode removes fake traffic lights and custom resize handles.
   - Popup mode uses full-window layout inside the popup host.
   - Native popup close restores inline host automatically.

4. Persistence and dirty behavior:
   - Session snapshot now persists selected objects, selector/editor state, mode/theme/frame/export flags, and counters.
   - Dirty close warning in popup mode uses `beforeunload` with browser-native confirmation behavior.

5. Tests added:
   - `test/dom/overlay-popup.test.js`
   - `test/popup-manager.test.js`
   - `test/window-channel.test.js`
   - `test/setup/happydom.js` now clears storage after each test for isolation.

Validation:
- `bun test` -> pass (95/95)
- `bun run build` -> pass

Notes:
- This pass keeps opener-page ownership and single-session continuity, while introducing popup host transfer and safe restoration.
- Transport module is implemented and validated, but the current popup host transfer path primarily uses same-origin direct host migration plus lifecycle guards; protocol utilities are ready for stricter message-routed sync in a follow-up pass if needed.
