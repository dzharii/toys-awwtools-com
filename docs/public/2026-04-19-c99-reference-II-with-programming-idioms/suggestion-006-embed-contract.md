2026-04-19

A00. c99-reference-embed-api-implementation-spec.md

# C99 Reference Embed API Implementation Specification

## A00. Purpose

This document specifies the embedded integration API that must be implemented inside the C99 reference project. The goal is to allow the reference application to run both as a standalone reference site and as an embedded component inside a same-origin host application, especially the browser-based C99 coding environment.

The embedded API must support initial configuration through the URL hash, runtime control through window messaging, controlled host-driven theming, entry navigation, search control, snippet insertion requests, and height reporting for layout integration.

This specification is written for Codex as the implementation contract. Codex should implement the API inside the reference project, preserve standalone behavior, and add a separate short implementer-facing document summarizing the API in simpler operational terms.

## A01. Required deliverables

Codex must implement the embed API inside the reference project itself.

Codex must preserve the reference application's standalone mode.

Codex must add embed-aware behavior that activates only when the embed contract is present.

Codex must add a short second document, written separately from this specification, that explains the API for implementers in a concise examples-first format. That short document should describe the purpose, startup hash format, supported message types, theming model, and the most common integration flows.

Codex must use best judgment to resolve ambiguity, provided the final behavior remains compatible with this specification.

## B00. Architectural intent

The embedded reference must behave as a reusable component rather than as a DOM fragment controlled from the outside. The primary contract must be explicit and public.

The public contract has two parts.

The first part is startup configuration via the URL hash.

The second part is runtime communication via `window.postMessage`.

Same-origin direct access through iframe DOM APIs may exist for debugging or optional optimizations, but it must not be required for normal operation and must not be treated as the public integration model.

The embedded reference must remain stable if the host application evolves. Unknown options and unknown future message fields must be ignored safely.

## B01. Core behavior goals

When embedded, the reference must be able to hide standalone chrome, open on a specific entry, run a search immediately, adopt host theme tokens, report preferred height, and request snippet insertion into the host editor.

When opened standalone, the reference must continue to work normally even if no embed configuration is provided.

When invalid embed input is provided, the reference must fail softly and continue operating with safe defaults.

## C00. Namespace and versioning rules

The embed API must use explicit namespacing and versioning everywhere.

The contract namespace is:

```text id="0axrj4"
awwtools.c99-reference.embed
```

The initial schema version is:

```text id="bpmv9s"
1
```

All structured message envelopes must include both the contract namespace and schema version.

All startup hash payloads must include the schema version.

Unknown future schema fields must be ignored safely.

If the reference encounters a schema version it does not understand, it should attempt best-effort parsing of the parts it recognizes and ignore the rest.

## D00. Startup configuration through URL hash

### D00. General rule

The iframe URL hash is used only for startup configuration and optionally for internal navigation that remains namespaced. The startup payload must be encoded as a single JSON object placed under a single descriptive hash key.

The required hash key is:

```text id="em0dr8"
embedded-reference-config
```

The full hash shape is:

```text id="vq2e39"
#embedded-reference-config=<url-safe-encoded-json>
```

The encoded payload should be a URL-safe encoded UTF-8 JSON string. Codex may use Base64 URL-safe encoding, percent-encoded JSON, or another robust reversible encoding, but it must document the exact encoding in the short implementer-facing guide.

### D01. Startup payload shape

The decoded JSON object must support this top-level structure:

```json id="uvzjex"
{
  "schemaVersion": 1,
  "embeddingMode": {},
  "initialViewState": {},
  "initialSearchState": {},
  "initialEntryState": {},
  "hostThemeState": {},
  "integrationHints": {}
}
```

All sections are optional except `schemaVersion`.

### D02. embeddingMode section

This section declares that the reference is embedded and describes broad presentation behavior.

Supported fields:

```json id="3o53ns"
{
  "isEmbeddedInsideHostApplication": true,
  "embeddedPresentationMode": "panel",
  "hideStandaloneTopNavigation": true,
  "hideStandaloneFooterArea": true,
  "useCompactSpacing": true
}
```

`embeddedPresentationMode` must accept at least these values:

```text id="ufuxdk"
panel
drawer
full-height-pane
mobile-full-view
```

If the field is absent, the reference should assume `panel` when embedded mode is active.

### D03. initialViewState section

This section controls broad opening behavior.

Supported fields:

```json id="w0rlbm"
{
  "initialPrimaryView": "reference-browser",
  "initialFocusTarget": "search-input",
  "autoScrollSelectedEntryIntoView": true
}
```

Supported `initialFocusTarget` values should include at least:

```text id="wmtb2i"
search-input
current-entry
none
```

### D04. initialSearchState section

This section controls initial search.

Supported fields:

```json id="oskg9c"
{
  "initialSearchQueryText": "printf",
  "initialSearchMatchMode": "best-effort",
  "autoRunInitialSearch": true
}
```

Supported `initialSearchMatchMode` values should include at least:

```text id="1afnb1"
best-effort
exact-title-first
entry-identifier-first
```

### D05. initialEntryState section

This section controls opening a known entry directly.

Supported fields:

```json id="n9hm9u"
{
  "initialEntryIdentifier": "c99-stdio-printf",
  "initialEntrySectionIdentifier": "examples",
  "preferDirectEntryOpenOverSearchResults": true
}
```

If both an initial entry and a search query are provided, direct entry open must take precedence when `preferDirectEntryOpenOverSearchResults` is true.

### D06. hostThemeState section

This section communicates host theme intent at startup.

Supported fields:

```json id="ke8nxy"
{
  "hostThemeMode": "inherit-from-host",
  "hostColorTokenPresetName": "ceetcode-light",
  "hostDensityMode": "compact",
  "hostTypographyScale": "normal"
}
```

Supported `hostThemeMode` values should include at least:

```text id="d40w36"
standalone-default
inherit-from-host
named-host-preset
```

The startup theme state should establish an initial visual mode only. More precise theming should happen through runtime theme-token messages.

### D07. integrationHints section

This section communicates behavioral preferences relevant to embedding.

Supported fields:

```json id="7xpi4e"
{
  "snippetActionMode": "insert-into-host-editor",
  "enableOutboundHeightReporting": true,
  "enableOutboundSelectionReporting": true,
  "enableHashDrivenInternalNavigation": true
}
```

Supported `snippetActionMode` values should include at least:

```text id="r79q04"
insert-into-host-editor
copy-only
host-decides
```

## E00. Startup parsing behavior

The reference must inspect the URL hash during initialization.

If the hash contains `embedded-reference-config`, the reference must decode and parse it.

If the hash payload is malformed, the reference must not crash. It must log or internally record the problem and continue with standalone-safe or embed-safe defaults.

Unknown sections must be ignored.

Unknown fields inside known sections must be ignored.

After startup config has been applied, the reference may continue to use its own internal state model. It is not required to preserve the startup JSON literally in the hash forever, but if the application modifies the hash later it must not do so in a way that destroys compatibility with the embed model accidentally.

Codex should prefer a clean internal separation between one-time startup config and normal application navigation state.

## F00. Runtime messaging contract

### F00. General rule

Runtime interaction must use `window.postMessage` with a structured message envelope.

The required envelope shape is:

```json id="xhqkf0"
{
  "contractNamespace": "awwtools.c99-reference.embed",
  "schemaVersion": 1,
  "messageType": "OPEN_REFERENCE_ENTRY",
  "requestIdentifier": "req-001",
  "payload": {}
}
```

`requestIdentifier` is optional for fire-and-forget messages but strongly recommended for request-response flows.

The iframe must ignore messages whose `contractNamespace` does not match.

The iframe must ignore messages whose `messageType` is unknown.

The iframe should not throw when a known message arrives with partially missing payload data. It should use best-effort validation, then either ignore the message or emit an error event.

### F01. Transport discipline

Codex should keep the runtime message handling centralized in one embed-controller module inside the reference project.

That controller should be responsible for parsing, validating, dispatching, and emitting events.

The rest of the reference application should talk to that controller through internal functions rather than scattering `message` event logic across unrelated modules.

## G00. Parent-to-iframe message types

### G00. INITIALIZE_REFERENCE_EMBEDDING_CONTEXT

Purpose: establish or refresh host integration context after load.

Payload shape:

```json id="smxa7y"
{
  "hostApplicationIdentifier": "ceetcode-browser-runtime",
  "embeddedPresentationMode": "panel",
  "hostThemeMode": "inherit-from-host",
  "snippetActionMode": "insert-into-host-editor"
}
```

Expected behavior: the reference updates its embed state, visual mode, and behavior hints without requiring reload.

### G01. OPEN_REFERENCE_ENTRY

Purpose: open a known entry directly.

Payload shape:

```json id="91xqgi"
{
  "entryIdentifier": "c99-stdio-printf",
  "entrySectionIdentifier": "examples",
  "revealBehavior": "focus-and-scroll"
}
```

Supported `revealBehavior` values should include:

```text id="46suap"
focus-and-scroll
scroll-only
open-silently
```

Expected behavior: if the entry exists, the reference navigates to it and may emit `REFERENCE_CURRENT_ENTRY_CHANGED`. If the entry does not exist, the reference emits `REFERENCE_ERROR_EVENT`.

### G02. EXECUTE_REFERENCE_SEARCH

Purpose: perform a search from the host.

Payload shape:

```json id="2jhfgj"
{
  "searchQueryText": "malloc",
  "searchMatchMode": "best-effort",
  "replaceCurrentSearchState": true
}
```

Expected behavior: the reference updates its search UI, runs the search, and emits `REFERENCE_SEARCH_STATE_CHANGED`.

### G03. APPLY_HOST_THEME_TOKENS

Purpose: apply host-driven design tokens.

Payload shape:

```json id="sb703d"
{
  "themeTokenMap": {
    "--embedded-reference-background-color": "#f5f4ef",
    "--embedded-reference-panel-color": "#ffffff",
    "--embedded-reference-text-color": "#1f2328",
    "--embedded-reference-border-color": "#d8d3c7",
    "--embedded-reference-accent-color": "#0d8b7b",
    "--embedded-reference-code-background-color": "#f0eee7"
  }
}
```

Expected behavior: the reference applies the token map through controlled assignment to CSS custom properties.

The reference must not evaluate arbitrary CSS text through this API.

### G04. REQUEST_CURRENT_REFERENCE_STATE

Purpose: request current entry, search, and height state.

Payload shape:

```json id="c7zwt3"
{
  "includeCurrentSearchState": true,
  "includeCurrentEntryState": true,
  "includeCurrentHeightMeasurement": true
}
```

Expected behavior: the reference replies with `REFERENCE_CURRENT_STATE_RESPONSE`.

### G05. REQUEST_REFERENCE_HEIGHT_MEASUREMENT

Purpose: ask the iframe for a preferred height measurement.

Payload shape:

```json id="ij6z9q"
{
  "measurementMode": "document-scroll-height"
}
```

Expected behavior: the reference measures its preferred height and emits `REFERENCE_HEIGHT_MEASUREMENT_CHANGED`.

### G06. SET_REFERENCE_EMBEDDING_VISIBILITY_MODE

Purpose: change broad embedded presentation mode after load.

Payload shape:

```json id="1knmzk"
{
  "embeddedPresentationMode": "mobile-full-view",
  "hideStandaloneTopNavigation": true,
  "useCompactSpacing": true
}
```

Expected behavior: the reference updates its layout and chrome visibility without full reload.

### G07. REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER

Purpose: request a known snippet payload without changing visible entry selection necessarily.

Payload shape:

```json id="9x4xom"
{
  "snippetIdentifier": "printf-basic-usage"
}
```

Expected behavior: the reference responds with either `REFERENCE_SNIPPET_RESOLVED` or `REFERENCE_ERROR_EVENT`.

## H00. Iframe-to-parent message types

### H00. REFERENCE_EMBED_READY

Purpose: announce readiness and capabilities.

Payload shape:

```json id="ng5wct"
{
  "referenceApplicationIdentifier": "c99-reference-ii",
  "supportedSchemaVersion": 1,
  "supportedMessageTypes": [
    "OPEN_REFERENCE_ENTRY",
    "EXECUTE_REFERENCE_SEARCH",
    "APPLY_HOST_THEME_TOKENS"
  ]
}
```

This message should be emitted once the embedded reference is ready to receive commands.

### H01. REFERENCE_CURRENT_ENTRY_CHANGED

Purpose: inform the host that the active entry changed.

Payload shape:

```json id="hrm9z2"
{
  "entryIdentifier": "c99-stdio-printf",
  "entryTitle": "printf",
  "entrySectionIdentifier": "examples"
}
```

### H02. REFERENCE_SEARCH_STATE_CHANGED

Purpose: inform the host that the current search changed.

Payload shape:

```json id="sqhdfw"
{
  "searchQueryText": "strcmp",
  "visibleResultCount": 4
}
```

### H03. REFERENCE_HEIGHT_MEASUREMENT_CHANGED

Purpose: provide preferred height for iframe sizing.

Payload shape:

```json id="dvaqa0"
{
  "preferredHeightInPixels": 1180,
  "measurementMode": "document-scroll-height"
}
```

This event may be emitted either in response to a request or proactively when height changes materially and outbound height reporting is enabled.

### H04. REFERENCE_SNIPPET_INSERT_REQUESTED

Purpose: request insertion of a snippet into the host editor.

Payload shape:

```json id="7qmdj3"
{
  "snippetIdentifier": "printf-basic-usage",
  "snippetLanguage": "c",
  "snippetText": "printf(\"Hello, world!\\n\");",
  "insertionMode": "insert-at-cursor"
}
```

Supported `insertionMode` values should include at least:

```text id="mjlwm3"
insert-at-cursor
replace-current-selection
append-to-editor
host-decides
```

This is one of the most important outbound events and must be implemented clearly.

### H05. REFERENCE_SNIPPET_COPY_REQUESTED

Purpose: ask the host to copy a snippet instead of inserting it.

Payload shape:

```json id="o9vhvl"
{
  "snippetIdentifier": "malloc-array-example",
  "snippetLanguage": "c",
  "snippetText": "int *items = malloc(count * sizeof(int));"
}
```

### H06. REFERENCE_CURRENT_STATE_RESPONSE

Purpose: answer `REQUEST_CURRENT_REFERENCE_STATE`.

Payload shape:

```json id="cwq7tz"
{
  "currentEntryIdentifier": "c99-string-strlen",
  "currentSearchQueryText": "strlen",
  "preferredHeightInPixels": 1040
}
```

### H07. REFERENCE_SNIPPET_RESOLVED

Purpose: return a requested snippet by identifier.

Payload shape:

```json id="wa39b6"
{
  "snippetIdentifier": "printf-basic-usage",
  "snippetLanguage": "c",
  "snippetText": "printf(\"%d\\n\", value);"
}
```

### H08. REFERENCE_ERROR_EVENT

Purpose: report a non-fatal integration error.

Payload shape:

```json id="e94nzt"
{
  "errorCode": "UNKNOWN_ENTRY_IDENTIFIER",
  "errorMessage": "The requested entry could not be found.",
  "relatedRequestIdentifier": "req-321"
}
```

Codex should define a small stable error-code vocabulary and document it in the short guide.

## I00. Theme token contract

The embedded reference must support a stable set of CSS custom property tokens. These tokens form the supported theming API.

Required token names:

```text id="48ud23"
--embedded-reference-background-color
--embedded-reference-panel-color
--embedded-reference-surface-color
--embedded-reference-text-color
--embedded-reference-muted-text-color
--embedded-reference-border-color
--embedded-reference-accent-color
--embedded-reference-link-color
--embedded-reference-code-background-color
--embedded-reference-code-text-color
--embedded-reference-search-highlight-color
--embedded-reference-font-family
--embedded-reference-font-size
--embedded-reference-line-height
--embedded-reference-border-radius
--embedded-reference-spacing-unit
```

Codex may add more tokens if useful, but these must exist as the stable initial set.

The reference must apply tokens to the document root or another single high-level theme root in a controlled way. Token application must not depend on injecting raw stylesheet text from the host.

If a token is missing, the reference should fall back to its internal default value.

## I01. Theme application example inside the reference

Codex should implement something like this internally:

```js id="trcdvv"
function applyHostThemeTokens(themeTokenMap) {
    if (!themeTokenMap || typeof themeTokenMap !== "object") return;
    const root = document.documentElement;
    for (const [tokenName, tokenValue] of Object.entries(themeTokenMap)) {
        if (!tokenName.startsWith("--embedded-reference-")) continue;
        root.style.setProperty(tokenName, String(tokenValue));
    }
}
```

This sample is illustrative. Codex may improve it, but the final implementation should preserve the same controlled behavior.

## J00. Internal implementation requirements inside the reference project

Codex must introduce a dedicated embed controller or equivalent module.

That controller must handle startup hash parsing, runtime message parsing, validation, event emission, and the public embed-state model.

Codex should avoid scattering embed behavior across unrelated UI code.

Codex should preserve a clear separation between standalone UI and embedded UI. The reference should derive embedded visibility rules from a central embed-state object instead of ad hoc DOM conditionals.

Codex should implement a clean internal model for:

embedded mode,
current entry state,
current search state,
host theme state,
integration hints,
height reporting state.

Codex should implement safe defaults for all of them.

## J01. Recommended internal state shape

A practical internal state object would look conceptually like this:

```js id="68a05r"
const embedState = {
    schemaVersion: 1,
    isEmbeddedInsideHostApplication: false,
    embeddedPresentationMode: "panel",
    hideStandaloneTopNavigation: false,
    hideStandaloneFooterArea: false,
    useCompactSpacing: false,
    hostThemeMode: "standalone-default",
    hostThemeTokens: {},
    snippetActionMode: "host-decides",
    enableOutboundHeightReporting: false,
    enableOutboundSelectionReporting: false,
    currentSearchQueryText: "",
    currentEntryIdentifier: null
};
```

Codex may rename fields internally, but the behavior implied by this state must be supported.

## K00. Height reporting rules

Height reporting is required because the iframe may be embedded in a dynamic panel and must be able to help the host size it intelligently.

If `enableOutboundHeightReporting` is true, the reference should measure its preferred height and emit `REFERENCE_HEIGHT_MEASUREMENT_CHANGED` when the height changes materially.

Codex may use `ResizeObserver`, mutation-driven measurement, or a simpler measured-update approach if it is reliable enough.

The implementation should avoid noisy constant height chatter. Minor measurement jitter should not spam the host. Codex should apply a threshold or debounce if needed.

## K01. Height reporting example

Illustrative example:

```js id="7yhp7m"
function reportHeightIfNeeded() {
    const preferredHeightInPixels = document.documentElement.scrollHeight;
    emitEmbedMessage("REFERENCE_HEIGHT_MEASUREMENT_CHANGED", {
        preferredHeightInPixels,
        measurementMode: "document-scroll-height"
    });
}
```

Codex may use a better implementation, but the final behavior must match the contract.

## L00. Snippet workflow requirements

The snippet workflow is a core capability of the embed API.

The reference must be able to expose snippets associated with functions, idioms, or examples.

The reference UI in embedded mode should provide a clear action for snippet usage. Depending on host hints and current context, this may result in `REFERENCE_SNIPPET_INSERT_REQUESTED` or `REFERENCE_SNIPPET_COPY_REQUESTED`.

The embedded reference should not directly manipulate the parent editor DOM. It should request the action through the messaging contract and let the host decide how to apply it.

Codex should make the snippet request flow usable both from dedicated snippet controls and from entry-level action buttons if the data model supports them.

## L01. Snippet insertion example from the iframe

Illustrative outbound event:

```js id="h1v95m"
emitEmbedMessage("REFERENCE_SNIPPET_INSERT_REQUESTED", {
    snippetIdentifier: "printf-basic-usage",
    snippetLanguage: "c",
    snippetText: "printf(\"Hello, world!\\n\");",
    insertionMode: "insert-at-cursor"
});
```

## M00. Parent-side usage examples for the short guide

Codex must include examples in the short implementer-facing documentation. The examples should be concise and operational. At minimum, the short guide should include examples equivalent to the following.

### M00. Example: iframe HTML with startup config

```html id="ko0wci"
<iframe
    id="c99-reference-frame"
    src="/public/2026-01-23-c99-reference-II-with-programming-idioms/#embedded-reference-config=ENCODED_PAYLOAD"
    title="C99 Reference">
</iframe>
```

### M01. Example: parent builds startup payload

```js id="d8z0sd"
const startupConfig = {
    schemaVersion: 1,
    embeddingMode: {
        isEmbeddedInsideHostApplication: true,
        embeddedPresentationMode: "panel",
        hideStandaloneTopNavigation: true,
        hideStandaloneFooterArea: true,
        useCompactSpacing: true
    },
    initialSearchState: {
        initialSearchQueryText: "printf",
        initialSearchMatchMode: "best-effort",
        autoRunInitialSearch: true
    },
    hostThemeState: {
        hostThemeMode: "inherit-from-host",
        hostColorTokenPresetName: "ceetcode-light",
        hostDensityMode: "compact",
        hostTypographyScale: "normal"
    },
    integrationHints: {
        snippetActionMode: "insert-into-host-editor",
        enableOutboundHeightReporting: true,
        enableOutboundSelectionReporting: true,
        enableHashDrivenInternalNavigation: true
    }
};

const encodedPayload = encodeURIComponent(JSON.stringify(startupConfig));
const iframe = document.getElementById("c99-reference-frame");
iframe.src = `/public/2026-01-23-c99-reference-II-with-programming-idioms/#embedded-reference-config=${encodedPayload}`;
```

Codex may use a different encoding helper, but the short guide must show one concrete complete example.

### M02. Example: parent sends an entry-open command

```js id="a5m3h5"
const iframeWindow = document.getElementById("c99-reference-frame").contentWindow;

iframeWindow.postMessage({
    contractNamespace: "awwtools.c99-reference.embed",
    schemaVersion: 1,
    messageType: "OPEN_REFERENCE_ENTRY",
    requestIdentifier: "req-open-printf",
    payload: {
        entryIdentifier: "c99-stdio-printf",
        entrySectionIdentifier: "examples",
        revealBehavior: "focus-and-scroll"
    }
}, window.location.origin);
```

### M03. Example: parent receives snippet insertion request

```js id="n12qf5"
window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;

    const data = event.data;
    if (!data || data.contractNamespace !== "awwtools.c99-reference.embed") return;

    if (data.messageType === "REFERENCE_SNIPPET_INSERT_REQUESTED") {
        const { snippetText, insertionMode } = data.payload || {};
        insertSnippetIntoEditor(snippetText, insertionMode);
    }
});
```

### M04. Example: reference emits ready event

```js id="15f20r"
emitEmbedMessage("REFERENCE_EMBED_READY", {
    referenceApplicationIdentifier: "c99-reference-ii",
    supportedSchemaVersion: 1,
    supportedMessageTypes: [
        "INITIALIZE_REFERENCE_EMBEDDING_CONTEXT",
        "OPEN_REFERENCE_ENTRY",
        "EXECUTE_REFERENCE_SEARCH",
        "APPLY_HOST_THEME_TOKENS",
        "REQUEST_CURRENT_REFERENCE_STATE",
        "REQUEST_REFERENCE_HEIGHT_MEASUREMENT",
        "SET_REFERENCE_EMBEDDING_VISIBILITY_MODE",
        "REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER"
    ]
});
```

## N00. Suggested helper functions inside the reference

Codex should create small reusable helpers rather than open-coding everything repeatedly.

Recommended helpers include:

`parseEmbeddedReferenceConfigFromHash()`

`applyEmbeddedReferenceStartupConfig(config)`

`emitEmbedMessage(messageType, payload, requestIdentifier)`

`handleIncomingEmbedMessage(event)`

`applyHostThemeTokens(themeTokenMap)`

`openReferenceEntryByIdentifier(entryIdentifier, options)`

`executeReferenceSearch(query, options)`

`emitCurrentReferenceStateResponse(requestIdentifier)`

`emitHeightMeasurementChanged()`

`requestSnippetInsert(snippet)`

The exact names may differ, but the implementation should be similarly structured and discoverable.

## O00. Validation and safety rules

The embed API must validate inputs conservatively.

String identifiers must be treated as data, not as selectors or code.

Theme token values must be treated as plain token values and applied only through the supported CSS custom property mechanism.

Malformed or unknown messages must not break the reference app.

Errors should be reported through `REFERENCE_ERROR_EVENT` where appropriate.

Codex should add internal logging hooks if the project has or will have a logging facility, but the API must not depend on that logging for correctness.

## P00. Standalone compatibility requirements

The standalone reference experience must remain intact.

If the page is opened without embed config, it must behave as the standalone reference.

If the page is opened with embed config but without a host listening for messages, it must still be readable and usable.

If the page is embedded but no runtime messages are ever sent, startup behavior from the hash must still work.

## Q00. Documentation task for Codex

In addition to implementing the API, Codex must create a second short documentation file for implementers.

That short file must be concise, examples-first, and easy to skim. It must include:

a short description of what the embed API is for,

a startup hash example,

a parent-to-iframe messaging example,

an iframe-to-parent snippet example,

the list of supported message types,

the list of supported theme tokens,

the main compatibility rules,

the note that the reference still works standalone.

That short document should be written in Codex's own words, but it must stay consistent with this specification.

## R00. Acceptance requirements

This work is complete when the following are true.

The C99 reference can run standalone exactly as before.

The C99 reference can detect and parse startup embed configuration from the URL hash.

The C99 reference can switch into embedded presentation mode.

The C99 reference can receive and process the required runtime message types.

The C99 reference can emit the required outbound message types.

The C99 reference can apply host theme tokens through CSS custom properties.

The C99 reference can report preferred height.

The C99 reference can request snippet insertion through the message contract.

The C99 reference ignores unknown future fields safely.

The implementation includes the short implementer-facing documentation file.

The implementation includes enough examples in documentation that another engineer can embed the reference without reverse-engineering the code.

## S00. Final direction to Codex

Implement the embed API as a stable public integration layer inside the C99 reference project.

Keep the contract descriptive, explicit, and easy to extend.

Prefer centralized embed handling over scattered conditionals.

Prefer stable schema names over short cryptic flags.

Prefer controlled token-based theming over raw CSS injection.

Preserve standalone behavior fully.

Write the short follow-up documentation file after implementation so the API is easy to use by future host applications.
