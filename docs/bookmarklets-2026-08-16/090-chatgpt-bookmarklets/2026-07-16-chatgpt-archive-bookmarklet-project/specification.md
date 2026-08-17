---

A00 User Value and Context

---

The project provides a self-contained ChatGPT bookmarklet for users who need to review a large chat history and archive selected conversations quickly. The primary user has many conversations in the ChatGPT sidebar and needs a clear, low-friction workflow for deciding which conversations to archive without repeatedly opening each conversation menu.

The useful outcome is a temporary archival mode inside the existing ChatGPT page. The mode expands the sidebar, adds an explicit archive control to each visible conversation row, processes newly loaded rows automatically, prevents duplicate archive actions, marks completed work clearly, and records all actions and failures in a movable utility window.

The project is intended for selective archival. It does not archive every conversation automatically and does not assign special behavior to titles containing emojis.

---

B00 Design Overview

---

The bookmarklet executes as one readable JavaScript function in the active ChatGPT page. It installs a temporary application layer composed of host-page integrations and an isolated Shadow DOM utility window.

Host-page integrations modify the ChatGPT sidebar width, discover conversation rows, add archive controls, and apply visual state to processed rows. The Shadow DOM window contains the application log and isolates its styles from ChatGPT styles.

A DOM observer detects conversation rows added during scrolling or virtualization. Each newly discovered row is processed once and synchronized with any duplicate row that references the same conversation identifier.

Archive operations use the authenticated ChatGPT browser session. The implementation must never contain a hard-coded bearer token. It may request the current session token from the page session endpoint and may use same-origin cookies through `credentials: "include"`.

---

C00 Scope and Boundaries

---

| ID | Requirement |
|---|---|
| SCP-001 | The project covers a bookmarklet that runs only inside an already authenticated ChatGPT browser page. |
| SCP-002 | The project covers sidebar expansion, optional manual sidebar resizing, conversation-row controls, archive requests, persistent local visual state, dynamic row discovery, and application logging. |
| SCP-003 | The project does not provide a browser extension, userscript package, remote service, backend, or account-wide bulk archival job. |
| SCP-004 | The project does not automatically archive conversations based on title, emoji, age, project membership, pinned state, or any other classification. |
| SCP-005 | The project does not guarantee compatibility with future ChatGPT DOM or internal endpoint changes. The ChatGPT sidebar DOM and backend endpoint are private application internals. |
| SCP-006 | The project must not log, store, package, or display bearer-token values, cookies, or equivalent credentials. |

---

D00 Actors and System Components

---

The user activates and deactivates archival mode, scrolls the ChatGPT history, chooses individual conversations, resizes the sidebar when needed, moves the utility window, and reviews logs.

The bookmarklet bootstrap function owns the application lifecycle. A second invocation disables the running instance and removes injected UI, observers, controls, styles, and temporary page state.

The locator registry defines every ChatGPT page element the application expects. Each locator contains a stable logical name, a human-readable description, and one or more CSS selector alternatives.

The conversation processor extracts conversation identifiers and titles, installs controls, tracks duplicate rows, and applies visual state.

The archive client obtains current session authorization when available and sends the archive request.

The state store tracks row entries, pending operations, archived conversation identifiers, diagnostic throttling, user interface references, and cleanup functions.

The logging subsystem writes structured events to both the Shadow DOM log window and the browser console.

---

E00 Activation and Shutdown Flow

---

| Step | Required behavior |
|---|---|
| ACT-001 | On first invocation, the bookmarklet creates one global application instance and begins initialization. |
| ACT-002 | Initialization waits briefly for `document.body` when the page is still loading. |
| ACT-003 | Initialization loads local settings and remembered archived conversation identifiers before processing rows. |
| ACT-004 | Initialization installs host styles, creates the Shadow DOM utility window, widens the sidebar, installs resize support, starts DOM monitoring, and performs an initial scan. |
| ACT-005 | Every initialization action is logged with an operation name and relevant context. |
| ACT-006 | On a second invocation, the existing instance shuts down rather than creating a duplicate instance. |
| ACT-007 | Shutdown disconnects observers, aborts active work where supported, removes injected elements and styles, restores the original sidebar width, and deletes the global application reference. |

---

F00 Locator Registry and DOM Discovery

---

All ChatGPT DOM dependencies must be defined in one locator registry. Each registry entry must include a description and ordered selector alternatives. Application code must refer to locators by logical name rather than scattering page selectors through unrelated functions.

The minimum locator set is shown below.

| Locator | Description | Expected targets |
|---|---|---|
| `documentHead` | Document head used for host-page styles | `head` |
| `documentBody` | Document body used for mounting and observation | `body` |
| `sidebar` | Expanded ChatGPT history sidebar | `#stage-slideover-sidebar` and compatible alternatives |
| `sidebarOpenButton` | Control that opens the sidebar when closed | Accessible open-sidebar button selectors |
| `historyScrollport` | Scrollable chat-history region | Chat-history navigation region or legacy `#history` |
| `conversationRows` | Conversation links containing a `/c/{id}` path | Sidebar conversation anchors |
| `conversationTitle` | Visible title inside a conversation row | Truncated title span or fallback title container |

When a selector throws, the log must include the locator name, locator description, failed selector, operation, root element description, and formatted exception.

When all alternatives fail, the application must log the missing locator. The error context must include the expected logical element, all selectors attempted, search root, current page URL, intended operation, and consequence of the failure.

Repeated missing-element reports may be throttled to keep the log usable. Recovery must be logged when a previously missing required element becomes available.

---

G00 Sidebar Behavior

---

The application must widen the ChatGPT sidebar to make titles and archive controls easy to distinguish. The preferred width is approximately 560 to 600 pixels, limited by minimum, maximum, and viewport-ratio constraints so the sidebar cannot consume an unusable portion of the page.

The sidebar width must be controlled through the ChatGPT `--sidebar-width` CSS variable when available. The original inline value must be saved and restored during shutdown.

A visible but unobtrusive resize handle must be positioned on the sidebar edge. Pointer dragging changes the width within configured limits. Resize start, completion, resulting width, and failures locating the sidebar must be logged.

The archive control must remain visible and clickable inside the widened row. It must not be placed behind ChatGPT trailing controls or inside the conversation anchor as a nested interactive element.

---

H00 Conversation Row Processing

---

A conversation row is any discovered sidebar anchor whose path contains `/c/{conversation-id}`. The processor extracts the identifier from the URL and obtains the visible title from the title locator with an accessible-label fallback.

| ID | Required behavior |
|---|---|
| ROW-001 | Every discovered conversation anchor is processed at most once per DOM instance. |
| ROW-002 | Multiple DOM rows with the same conversation identifier are registered as duplicate presentations of one logical conversation. |
| ROW-003 | State changes for one logical conversation are applied to every registered duplicate row. |
| ROW-004 | Rows that cannot provide a conversation identifier are skipped and logged with the element description, URL, and expected URL pattern. |
| ROW-005 | Rows without a usable parent container are skipped and logged with the anchor description and expected container strategy. |
| ROW-006 | Emoji characters in titles are preserved and receive no special processing rule. |
| ROW-007 | A scan summary records the scan source, number of rows found, number installed, number already processed, and relevant failures. |

---

I00 Archive Control Design

---

Each conversation row receives one dedicated archive control with a minimum target size suitable for repeated mouse use. The control must have a consistent width, a clear text label, visible hover and keyboard-focus states, and enough separation from ChatGPT controls to avoid accidental activation.

The control uses the following states.

| State | Button label | Enabled | Row treatment |
|---|---|---|---|
| `ready` | `Archive` | Yes | Normal row with installed control |
| `pending` | `Archiving` | No | Subtle pending highlight |
| `archived` | `Archived` | No | Faded row with explicit archived styling |
| `error` | `Retry` | Yes | Error highlight with retry affordance |

The archived state must be unambiguous. Fading alone is insufficient, so the disabled `Archived` label must remain visible. A second archive request for a pending or archived conversation must be blocked and logged as an ignored action.

Controls may use a small Shadow DOM host per row so their CSS is isolated from ChatGPT styles. Row-level highlighting necessarily affects the host page and may use data attributes plus an injected host stylesheet.

---

J00 Archive Request and Authentication

---

The archive operation sends a same-origin `PATCH` request to `/backend-api/conversation/{conversation-id}` with the JSON payload below.

```json
{
  "is_archived": true
}
```

The request must include `credentials: "include"`. The application may request the current ChatGPT session from `/api/auth/session` and attach an access token when one is available. The token must remain in memory only and must never be written into source code, local storage, logs, error messages, exported files, or the utility window.

The request must have a finite timeout. Version 2 uses a 30-second archive timeout and a shorter session lookup timeout. A rejected authorization response may trigger one session refresh and one retry. Unbounded retries are prohibited.

Before sending the request, the application logs the conversation identifier, title, operation identifier, endpoint, and timeout without credentials. After completion, it logs the HTTP status, duration, whether authorization was attached as a boolean, and the resulting state.

A non-success HTTP response is an error. The log may include a short sanitized response excerpt, status code, status text, operation identifier, conversation context, endpoint, and retry decision.

---

K00 State and Persistence

---

The application maintains in-memory state for the current page session and local persistence for completed archive identifiers and user interface settings.

Archived identifiers are stored as a JSON array in local storage. Versioned storage keys allow schema evolution. Version 2 may migrate identifiers from the Version 1 storage key.

Stored archived state is a usability aid, not authoritative server state. A conversation archived outside the bookmarklet may not be known locally. A conversation that no longer appears in the normal sidebar does not require an additional status request.

Window position, sidebar width, and similar presentation settings may be persisted. Persistence failures must not stop archival mode. They must be logged and the application must continue with defaults or in-memory state.

---

L00 Dynamic Loading and DOM Monitoring

---

The ChatGPT history can load or virtualize rows as the user scrolls. A `MutationObserver` must observe an appropriate stable root and schedule a debounced scan whenever relevant nodes are added.

The observer must not archive conversations automatically. It only installs controls and restores visual state.

The scan must tolerate repeated mutations, React replacement of existing rows, duplicate rows, temporary absence of the sidebar, and route changes. Version 2 includes periodic health checks to verify that required UI and monitoring components remain connected.

When a new row appears, the control should be installed quickly enough that it is available during normal scrolling. Processing must remain idempotent and avoid duplicate controls.

---

M00 Logging and Diagnostics

---

The log is the primary operational interface. Every meaningful action and failure must be recorded. Each event contains a timestamp, severity, operation name or operation identifier, human-readable message, and sanitized context object.

| Severity | Use |
|---|---|
| `debug` | Repeated scans, saved settings, or internal maintenance details |
| `info` | Operation start, discovery, installation, resize start, request start, and normal lifecycle actions |
| `success` | Completed initialization, control installation batches, archive completion, recovery, and resize completion |
| `warn` | Ignored duplicate action, degraded cookie-only authorization, retry decision, or recoverable condition |
| `error` | Missing required element, selector failure, request failure, timeout, persistence failure, UI failure, or unexpected exception |

Error messages must answer four questions: what operation failed, what the application was trying to accomplish, what object or element was involved, and what consequence follows.

For DOM failures, context must include the logical locator and selectors. For conversation failures, context must include the conversation identifier and title when known. For network failures, context must include the endpoint, method, timeout, HTTP status when available, retry count, and a sanitized error description.

Sensitive keys and bearer-like strings must be redacted before logging. The logger must cap retained entries to prevent unbounded memory growth.

---

N00 Utility Window Design

---

The utility window must use Shadow DOM and contain its own CSS. It should resemble a compact desktop utility rather than a decorative web panel. The visual design uses a neutral title bar, plain borders, standard controls, readable system fonts, and a scrolling monospaced log.

The window must be draggable by its title bar and resizable from its edges or browser-native resize affordance. It must remain above the ChatGPT interface without blocking the full page. Its close control disables archival mode and performs cleanup.

The title bar should display a concise running status, such as tracked row count and archived conversation count. The log area should automatically follow new entries unless the user is reviewing older entries, when supported.

The window must not depend on external CSS, fonts, images, frameworks, libraries, network assets, or build output.

---

O00 Failure Handling and Recovery

---

| Failure | Required response |
|---|---|
| Document body unavailable | Wait for a bounded period, log startup context, then fail visibly. |
| Sidebar unavailable | Log the sidebar locator and consequence, keep observing, and retry through scans or health checks. |
| History scrollport unavailable | Log the history locator and continue monitoring for recovery. |
| No conversation rows | Log a contextual diagnostic without terminating the application. |
| Invalid conversation URL | Skip that row and log the element and expected URL pattern. |
| Archive request timeout | Abort the request, set the control to `Retry`, and log timeout context. |
| HTTP authorization rejection | Refresh session authorization and retry once when supported. |
| Other HTTP failure | Set `Retry`, preserve the row, and log status plus sanitized response context. |
| Local storage failure | Continue with in-memory state and log the storage operation. |
| React replaces a processed row | Treat the replacement as a new DOM row and reinstall a synchronized control. |
| Utility UI is removed unexpectedly | Version 2 health checks may recreate or report the missing UI. |
| Unexpected page error | Version 2 may log relevant global errors and unhandled promise rejections while avoiding unrelated noise where possible. |

---

P00 Security and Privacy Constraints

---

**A bearer token must never be embedded in the bookmarklet.** A bookmarklet is visible source code and is not an acceptable credential store.

The packaged project must not contain the bearer token that appeared in the original proof-of-concept. Authentication values must be redacted from logs and diagnostics. The implementation records only boolean facts such as whether authorization was attached.

The bookmarklet has the permissions of JavaScript running in the ChatGPT page. It should perform only the requested archive operation, session lookup, DOM observation, local settings storage, and user-interface changes.

Because the implementation relies on private ChatGPT application internals, failure after a ChatGPT update must be handled as a compatibility problem, not by asking the user to paste a token into the source.

---

Q00 Version Definitions and Package Layout

---

Version 1 is the baseline implementation. It contains the core bookmarklet lifecycle, sidebar expansion, manual resizing, Shadow DOM log window, dynamic row discovery, archive controls, local archived-state persistence, session-based requests, and contextual logging.

Version 2 is the hardened implementation. It adds a broader locator registry, stronger diagnostics, diagnostic throttling and recovery reporting, operation identifiers, more complete request instrumentation, settings migration, duplicate-row synchronization, health checks, error redaction, bounded logs, and more defensive cleanup.

**Version 1 in this package is a reconstructed baseline derived from the initial requirements and proof-of-concept. It is not guaranteed to be byte-for-byte identical to the first generated artifact because the working paths were replaced by Version 2 before packaging.** Version 2 is the preserved final implementation from the second revision.

The archive layout is:

```text
chatgpt-archive-bookmarklet-project/
  README.md
  specification.md
  manifest.sha256
  version-1/
    VERSION
    chatgpt-archive-mode.js
    chatgpt-archive-bookmarklet.txt
    chatgpt-archive-bookmarklet-readable.txt
    chatgpt-archive-bookmarklet.html
  version-2/
    VERSION
    chatgpt-archive-mode.js
    chatgpt-archive-bookmarklet.txt
    chatgpt-archive-bookmarklet-readable.txt
    chatgpt-archive-bookmarklet.html
  reference/
    dom-snapshot.txt
    sidebar-screenshot.png
    design-note-format.txt
```

---

R00 Implementation Constraints and Tradeoffs

---

The source must remain readable, unminified modern JavaScript contained in one immediately invoked function expression. The JavaScript source contains no code comments. Generated bookmarklet files may percent-encode the source for URL compatibility, but the canonical `.js` file remains formatted.

Shadow DOM isolates the utility window and row control styles, but row fading and sidebar sizing require deliberate host-page CSS changes. This is an accepted boundary because the feature must visibly modify ChatGPT rows.

A mutation observer is selected over scroll-event-only processing because ChatGPT may add rows for reasons other than direct scrolling. Debouncing limits repeated work during large render batches.

Local archived-state persistence is selected over querying every row's server status because archived conversations normally leave the active history list and the private API does not provide a stable, documented per-row status contract for this tool.

The internal archive endpoint is selected because it matches the operation performed by the existing ChatGPT interface. The cost is maintenance risk when ChatGPT changes its private API.

---

S00 Acceptance Criteria

---

| ID | Acceptance criterion |
|---|---|
| ACC-001 | Activating the bookmarklet creates one utility window and does not create duplicate instances. |
| ACC-002 | The sidebar becomes substantially wider and can be resized within safe limits. |
| ACC-003 | Every visible `/c/{id}` conversation row receives one clearly visible archive control. |
| ACC-004 | Newly loaded conversation rows receive controls without manual bookmarklet re-execution. |
| ACC-005 | Clicking `Archive` starts one request, changes the control to `Archiving`, and blocks repeated clicks. |
| ACC-006 | A successful request changes all duplicate rows for that conversation to `Archived`, disables their controls, and applies visible faded styling. |
| ACC-007 | A failed request changes the control to `Retry` and logs actionable context. |
| ACC-008 | Missing DOM elements are logged with operation, locator name, locator description, selectors, search root, page URL, and consequence. |
| ACC-009 | Network failures are logged with conversation context, endpoint, timeout, status when available, and sanitized error data. |
| ACC-010 | No credential value appears in source files, local storage, exported files, console output, or the utility log. |
| ACC-011 | A second bookmarklet invocation removes the application and restores the original sidebar width. |
| ACC-012 | Both JavaScript versions pass a syntax check and the ZIP manifest matches the packaged files. |
