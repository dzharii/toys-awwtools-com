2026-04-19
A00. C99 reference iframe API contract specification

## A00. Purpose

This document defines the embed contract for the C99 reference application when it is loaded inside another application, especially the current browser-based C99 coding environment. The contract is designed for same-origin trusted embedding, but it should still remain reusable and stable enough for future integrations in other projects.

The design goal is to make the embedded reference feel native inside the host application while preserving the standalone behavior of the reference site. The reference should continue to work by itself when opened directly, but when embedded it should accept startup configuration through the URL fragment and runtime communication through a formal window messaging API. Browsers support fragment identifiers through `URL.hash` and notify fragment changes through the `hashchange` event, and window-to-window communication is supported through `window.postMessage()` and the `message` event. ([MDN Web Docs][1])

## B00. Contract design principles

The contract must be descriptive rather than cryptic. Parameter names should be long enough to remain understandable in six months. The contract must also be extensible. New fields and commands should be addable without breaking old integrations.

The contract should separate two kinds of configuration. The first kind is startup configuration that belongs in the iframe URL fragment. The second kind is runtime interaction that belongs in the message channel between parent and iframe. Fragment state is a good fit for initial embedded mode, layout mode, initial search, initial entry, and similar load-time intent. Runtime commands such as changing the current entry, inserting a snippet, or applying a new theme belong in `postMessage()`. ([MDN Web Docs][1])

The contract should avoid direct parent-to-iframe DOM manipulation as the primary API, even though same-origin access through `contentWindow` and `contentDocument` is technically available. Same-origin iframe DOM access works, but it couples the host to internal document structure and makes the reference harder to evolve as a reusable component. ([MDN Web Docs][2])

The theming contract should prefer controlled design tokens over arbitrary CSS injection. CSS custom properties are meant for this kind of theming, participate in the cascade, and can be set dynamically with `style.setProperty()`. ([MDN Web Docs][3])

## C00. Embed model overview

The embed model has three layers.

The first layer is fragment-based startup configuration. The host builds the iframe URL and appends a fragment payload that tells the reference it is embedded and what initial state it should load.

The second layer is runtime messaging. After the iframe loads, the parent and the reference exchange structured messages using `postMessage()`.

The third layer is optional same-origin optimization. Because the project is trusted and same-origin, the host may inspect iframe readiness or perform diagnostic access through `contentWindow`, but this is not the public contract and should not be required for correct operation. ([MDN Web Docs][4])

## D00. Fragment format

The iframe must accept startup configuration through the URL fragment. The fragment should use a single top-level namespace to avoid collisions with any internal standalone hash navigation the reference may already use.

The recommended fragment root is:

```text
#embedded-reference-config=...
```

The value should be a URL-safe encoded JSON object. This is more extensible than packing many independent hash keys by hand. The root object should contain a schema version and one or more named sections.

The recommended top-level shape is:

```json
{
  "schemaVersion": 1,
  "embeddingMode": {...},
  "initialViewState": {...},
  "initialSearchState": {...},
  "initialEntryState": {...},
  "hostThemeState": {...},
  "integrationHints": {...}
}
```

This structure reduces ambiguity because each field lives inside a descriptive category. The browser fragment is available through `URL.hash`, and changes can be detected with `hashchange`. ([MDN Web Docs][1])

## E00. Required fragment sections

### E00. embeddingMode

This section tells the reference whether it is embedded and how it should behave at a high level.

Recommended fields:

```json
{
  "isEmbeddedInsideHostApplication": true,
  "embeddedPresentationMode": "panel",
  "hideStandaloneTopNavigation": true,
  "hideStandaloneFooterArea": true,
  "useCompactSpacing": true
}
```

`embeddedPresentationMode` should allow values such as `panel`, `drawer`, `full-height-pane`, or `mobile-full-view`. This gives the reference enough context to choose spacing and chrome.

### E01. initialViewState

This section controls which broad view opens first.

Recommended fields:

```json
{
  "initialPrimaryView": "reference-browser",
  "initialFocusTarget": "search-input",
  "autoScrollSelectedEntryIntoView": true
}
```

### E02. initialSearchState

This section defines the initial search behavior.

Recommended fields:

```json
{
  "initialSearchQueryText": "printf",
  "initialSearchMatchMode": "best-effort",
  "autoRunInitialSearch": true
}
```

### E03. initialEntryState

This section defines which exact entry should open if known.

Recommended fields:

```json
{
  "initialEntryIdentifier": "c99-stdio-printf",
  "initialEntrySectionIdentifier": "examples",
  "preferDirectEntryOpenOverSearchResults": true
}
```

### E04. hostThemeState

This section tells the iframe how to adapt visually to the host.

Recommended fields:

```json
{
  "hostThemeMode": "inherit-from-host",
  "hostColorTokenPresetName": "ceetcode-light",
  "hostDensityMode": "compact",
  "hostTypographyScale": "normal"
}
```

The preset name is useful for stable shared skins. If more control is needed, runtime token application should happen through messages rather than through raw fragment CSS.

### E05. integrationHints

This section gives extra behavioral hints.

Recommended fields:

```json
{
  "snippetActionMode": "insert-into-host-editor",
  "enableOutboundHeightReporting": true,
  "enableOutboundSelectionReporting": true,
  "enableHashDrivenInternalNavigation": true
}
```

## F00. Fragment parsing rules

The iframe should parse only the one namespaced fragment payload it owns. Unknown sections must be ignored safely. Unknown fields inside known sections must also be ignored safely. This is how the contract remains forward-compatible.

If the fragment payload is malformed, the iframe should continue loading in standalone-safe behavior or embedded-safe defaults rather than fail hard.

If both a fragment configuration and a runtime `INITIALIZE_REFERENCE_EMBEDDING_CONTEXT` message are received, the recommended precedence rule is this: fragment establishes baseline startup state, then runtime message may refine or override live state.

## G00. Runtime messaging transport

Runtime communication must use `window.postMessage()` and the receiving side must listen to the `message` event. This is the standard browser mechanism for communication between a page and an embedded iframe. ([MDN Web Docs][4])

Even though the integration is same-origin and trusted, the message payload should still include a contract namespace and a message type. This keeps the API readable and makes debugging easier.

The recommended envelope is:

```json
{
  "contractNamespace": "awwtools.c99-reference.embed",
  "schemaVersion": 1,
  "messageType": "OPEN_REFERENCE_ENTRY",
  "requestIdentifier": "req-123",
  "payload": {}
}
```

`contractNamespace` prevents accidental collisions with unrelated messages.
`schemaVersion` allows future expansion.
`requestIdentifier` is optional but useful for request-response flows.

## H00. Parent-to-iframe message types

### H00. INITIALIZE_REFERENCE_EMBEDDING_CONTEXT

This message initializes or refreshes the host context after load.

```json
{
  "messageType": "INITIALIZE_REFERENCE_EMBEDDING_CONTEXT",
  "payload": {
    "hostApplicationIdentifier": "ceetcode-browser-runtime",
    "embeddedPresentationMode": "panel",
    "hostThemeMode": "inherit-from-host",
    "snippetActionMode": "insert-into-host-editor"
  }
}
```

### H01. OPEN_REFERENCE_ENTRY

This message tells the iframe to open a specific known entry.

```json
{
  "messageType": "OPEN_REFERENCE_ENTRY",
  "payload": {
    "entryIdentifier": "c99-stdio-printf",
    "entrySectionIdentifier": "examples",
    "revealBehavior": "focus-and-scroll"
  }
}
```

### H02. EXECUTE_REFERENCE_SEARCH

This message tells the iframe to run a search.

```json
{
  "messageType": "EXECUTE_REFERENCE_SEARCH",
  "payload": {
    "searchQueryText": "malloc",
    "searchMatchMode": "best-effort",
    "replaceCurrentSearchState": true
  }
}
```

### H03. APPLY_HOST_THEME_TOKENS

This message applies host styling tokens.

```json
{
  "messageType": "APPLY_HOST_THEME_TOKENS",
  "payload": {
    "themeTokenMap": {
      "--embedded-reference-background-color": "#f5f4ef",
      "--embedded-reference-panel-color": "#ffffff",
      "--embedded-reference-text-color": "#1f2328",
      "--embedded-reference-border-color": "#d8d3c7",
      "--embedded-reference-accent-color": "#0d8b7b",
      "--embedded-reference-code-background-color": "#f0eee7"
    }
  }
}
```

The iframe should map these onto CSS custom properties through controlled application logic rather than treating arbitrary CSS as trusted stylesheet content. CSS custom properties and `setProperty()` are the correct browser primitives for this. ([MDN Web Docs][3])

### H04. REQUEST_CURRENT_REFERENCE_STATE

This message asks the iframe to report its current state.

```json
{
  "messageType": "REQUEST_CURRENT_REFERENCE_STATE",
  "payload": {
    "includeCurrentSearchState": true,
    "includeCurrentEntryState": true,
    "includeCurrentHeightMeasurement": true
  }
}
```

### H05. REQUEST_REFERENCE_HEIGHT_MEASUREMENT

This message explicitly asks the iframe to report its preferred height.

```json
{
  "messageType": "REQUEST_REFERENCE_HEIGHT_MEASUREMENT",
  "payload": {
    "measurementMode": "document-scroll-height"
  }
}
```

### H06. SET_REFERENCE_EMBEDDING_VISIBILITY_MODE

This message changes broad visual mode after load.

```json
{
  "messageType": "SET_REFERENCE_EMBEDDING_VISIBILITY_MODE",
  "payload": {
    "embeddedPresentationMode": "mobile-full-view",
    "hideStandaloneTopNavigation": true,
    "useCompactSpacing": true
  }
}
```

### H07. REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER

This message requests a specific snippet payload without necessarily changing the visible selection.

```json
{
  "messageType": "REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER",
  "payload": {
    "snippetIdentifier": "printf-basic-usage"
  }
}
```

## I00. Iframe-to-parent message types

### I00. REFERENCE_EMBED_READY

This message announces that the iframe is ready.

```json
{
  "messageType": "REFERENCE_EMBED_READY",
  "payload": {
    "referenceApplicationIdentifier": "c99-reference-ii",
    "supportedSchemaVersion": 1,
    "supportedMessageTypes": [
      "OPEN_REFERENCE_ENTRY",
      "EXECUTE_REFERENCE_SEARCH",
      "APPLY_HOST_THEME_TOKENS"
    ]
  }
}
```

### I01. REFERENCE_CURRENT_ENTRY_CHANGED

This message announces that the visible current entry changed.

```json
{
  "messageType": "REFERENCE_CURRENT_ENTRY_CHANGED",
  "payload": {
    "entryIdentifier": "c99-stdio-printf",
    "entryTitle": "printf",
    "entrySectionIdentifier": "examples"
  }
}
```

### I02. REFERENCE_SEARCH_STATE_CHANGED

This message announces that the current search changed.

```json
{
  "messageType": "REFERENCE_SEARCH_STATE_CHANGED",
  "payload": {
    "searchQueryText": "strcmp",
    "visibleResultCount": 4
  }
}
```

### I03. REFERENCE_HEIGHT_MEASUREMENT_CHANGED

This message reports preferred height for dynamic iframe sizing.

```json
{
  "messageType": "REFERENCE_HEIGHT_MEASUREMENT_CHANGED",
  "payload": {
    "preferredHeightInPixels": 1180,
    "measurementMode": "document-scroll-height"
  }
}
```

### I04. REFERENCE_SNIPPET_INSERT_REQUESTED

This is one of the most important messages. It tells the parent that the person chose a snippet and wants it inserted into the editor.

```json
{
  "messageType": "REFERENCE_SNIPPET_INSERT_REQUESTED",
  "payload": {
    "snippetIdentifier": "printf-basic-usage",
    "snippetLanguage": "c",
    "snippetText": "printf(\"Hello, world!\\n\");",
    "insertionMode": "insert-at-cursor"
  }
}
```

### I05. REFERENCE_SNIPPET_COPY_REQUESTED

This message tells the parent that the person chose copy behavior rather than direct insertion.

```json
{
  "messageType": "REFERENCE_SNIPPET_COPY_REQUESTED",
  "payload": {
    "snippetIdentifier": "malloc-array-example",
    "snippetLanguage": "c",
    "snippetText": "int *items = malloc(count * sizeof(int));"
  }
}
```

### I06. REFERENCE_CURRENT_STATE_RESPONSE

This message answers `REQUEST_CURRENT_REFERENCE_STATE`.

```json
{
  "messageType": "REFERENCE_CURRENT_STATE_RESPONSE",
  "payload": {
    "currentEntryIdentifier": "c99-string-strlen",
    "currentSearchQueryText": "strlen",
    "preferredHeightInPixels": 1040
  }
}
```

### I07. REFERENCE_ERROR_EVENT

This message reports a non-fatal integration error.

```json
{
  "messageType": "REFERENCE_ERROR_EVENT",
  "payload": {
    "errorCode": "UNKNOWN_ENTRY_IDENTIFIER",
    "errorMessage": "The requested entry could not be found.",
    "relatedRequestIdentifier": "req-321"
  }
}
```

## J00. Hash behavior inside the iframe

The embedded reference should still be able to use internal hash-based navigation for its own state, but it must distinguish between host configuration and internal navigation state.

The recommended rule is this. The startup fragment payload uses the namespaced root `embedded-reference-config`. After initialization, the reference may continue to use its own internal fragment conventions for entry-level navigation if needed, but it should preserve or internally mirror the startup config instead of destroying it blindly.

A safer alternative is to consume the startup config once and then move internal navigation state into in-memory state or into a second namespaced fragment field. Since browsers expose and update fragment identifiers through `URL.hash` and `hashchange`, either model is viable, but the namespacing must remain explicit. ([MDN Web Docs][1])

## K00. Theme token contract

The iframe should support a stable token vocabulary rather than arbitrary CSS text.

Recommended token names:

```text
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

These tokens should be applied to the iframe root element or document root through `setProperty()`. CSS custom properties are inherited and participate in the cascade, which makes them a good basis for host-driven theming. ([MDN Web Docs][3])

## L00. Extensibility rules

Unknown message types must be ignored safely.
Unknown payload fields must be ignored safely.
Every outbound message should include `schemaVersion`.
Every request that expects a response should support `requestIdentifier`.
The reference should publish its supported schema version and a list of recognized message types in `REFERENCE_EMBED_READY`.

These rules keep the API evolvable and reduce friction when future properties are added.

## M00. Same-origin operational note

Because the embed is same-origin and trusted, the parent can technically inspect or manipulate the iframe through `contentWindow` and `contentDocument`. That can be useful for debugging and temporary experiments, but it should not replace the public contract above. Same-origin iframe access exists, but the reusable integration contract should still be based on fragment config and message exchange. ([MDN Web Docs][2])

Also, if sandboxing is considered later, note that MDN explicitly warns that with same-origin embeds it is strongly discouraged to combine `allow-scripts` and `allow-same-origin`, because that effectively removes meaningful sandbox protection. ([MDN Web Docs][5])

## N00. Recommended first implementation subset

For the first implementation, I would support this minimal but complete subset.

The fragment supports `schemaVersion`, `embeddingMode`, `initialSearchState`, `initialEntryState`, and `hostThemeState`.

The runtime API supports `INITIALIZE_REFERENCE_EMBEDDING_CONTEXT`, `OPEN_REFERENCE_ENTRY`, `EXECUTE_REFERENCE_SEARCH`, `APPLY_HOST_THEME_TOKENS`, `REFERENCE_EMBED_READY`, `REFERENCE_CURRENT_ENTRY_CHANGED`, `REFERENCE_HEIGHT_MEASUREMENT_CHANGED`, and `REFERENCE_SNIPPET_INSERT_REQUESTED`.

That subset is already enough to make the reference useful as an embedded research and snippet panel inside the main coding app.

## O00. Final recommendation

Use the fragment only for initial embed intent and use `postMessage()` for everything interactive after load. Use descriptive names, namespaced payload sections, stable schema versions, and CSS custom property tokens instead of arbitrary CSS injection. That design is easy to extend, easy to debug, and much less ambiguous than a short-flag API. ([MDN Web Docs][4])

If you want, the next step is to turn this into a Codex-facing implementation spec with exact field names frozen and a small example of parent-side and iframe-side pseudocode.

[1]: https://developer.mozilla.org/en-US/docs/Web/API/URL/hash?utm_source=chatgpt.com "URL: hash property - Web APIs - MDN Web Docs"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow?utm_source=chatgpt.com "HTMLIFrameElement: contentWindow property - Web APIs"
[3]: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--%2A?utm_source=chatgpt.com "Custom properties (--*): CSS variables - MDN Web Docs"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage?utm_source=chatgpt.com "Window: postMessage() method - Web APIs - MDN Web Docs"
[5]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe?utm_source=chatgpt.com "<iframe>: The Inline Frame element - HTML - MDN Web Docs"
