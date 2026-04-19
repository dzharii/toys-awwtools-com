# C99 Reference Embed API Quickstart

## What this API is for
Use this API to run the C99 reference as an iframe component inside a host app while preserving standalone behavior when opened directly.

The contract has two parts:
- Startup configuration through URL hash (`#embedded-reference-config=...`)
- Runtime control through `window.postMessage()`

Namespace and version:
- `contractNamespace`: `awwtools.c99-reference.embed`
- `schemaVersion`: `1`

## Startup hash example
Use URL-encoded JSON as the payload value.

```js
const startupConfig = {
  schemaVersion: 1,
  embeddingMode: {
    isEmbeddedInsideHostApplication: true,
    embeddedPresentationMode: 'panel',
    hideStandaloneTopNavigation: true,
    hideStandaloneFooterArea: true,
    useCompactSpacing: true
  },
  initialSearchState: {
    initialSearchQueryText: 'printf',
    initialSearchMatchMode: 'best-effort',
    autoRunInitialSearch: true
  },
  initialEntryState: {
    initialEntryIdentifier: 'c99-stdio-printf',
    initialEntrySectionIdentifier: 'examples',
    preferDirectEntryOpenOverSearchResults: true
  },
  hostThemeState: {
    hostThemeMode: 'named-host-preset',
    hostColorTokenPresetName: 'ceetcode-light'
  },
  integrationHints: {
    snippetActionMode: 'insert-into-host-editor',
    enableOutboundHeightReporting: true,
    enableHashDrivenInternalNavigation: true
  }
};

const encoded = encodeURIComponent(JSON.stringify(startupConfig));
iframe.src = `/public/2026-04-19-c99-reference-II-with-programming-idioms/#embedded-reference-config=${encoded}`;
```

## Parent -> iframe example

```js
const frame = document.getElementById('c99-reference-frame');

frame.contentWindow.postMessage({
  contractNamespace: 'awwtools.c99-reference.embed',
  schemaVersion: 1,
  messageType: 'OPEN_REFERENCE_ENTRY',
  requestIdentifier: 'req-open-printf',
  payload: {
    entryIdentifier: 'c99-stdio-printf',
    entrySectionIdentifier: 'examples',
    revealBehavior: 'focus-and-scroll'
  }
}, window.location.origin);
```

## Iframe -> parent snippet example

```js
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;

  const data = event.data;
  if (!data || data.contractNamespace !== 'awwtools.c99-reference.embed') return;

  if (data.messageType === 'REFERENCE_SNIPPET_INSERT_REQUESTED') {
    const { snippetText, insertionMode } = data.payload || {};
    insertSnippetIntoEditor(snippetText, insertionMode);
  }

  if (data.messageType === 'REFERENCE_SNIPPET_COPY_REQUESTED') {
    const { snippetText } = data.payload || {};
    navigator.clipboard.writeText(snippetText || '');
  }
});
```

## Supported parent -> iframe message types
- `INITIALIZE_REFERENCE_EMBEDDING_CONTEXT`
- `OPEN_REFERENCE_ENTRY`
- `EXECUTE_REFERENCE_SEARCH`
- `APPLY_HOST_THEME_TOKENS`
- `REQUEST_CURRENT_REFERENCE_STATE`
- `REQUEST_REFERENCE_HEIGHT_MEASUREMENT`
- `SET_REFERENCE_EMBEDDING_VISIBILITY_MODE`
- `REQUEST_REFERENCE_SNIPPET_BY_IDENTIFIER`

## Supported iframe -> parent message types
- `REFERENCE_EMBED_READY`
- `REFERENCE_CURRENT_ENTRY_CHANGED`
- `REFERENCE_SEARCH_STATE_CHANGED`
- `REFERENCE_HEIGHT_MEASUREMENT_CHANGED`
- `REFERENCE_SNIPPET_INSERT_REQUESTED`
- `REFERENCE_SNIPPET_COPY_REQUESTED`
- `REFERENCE_CURRENT_STATE_RESPONSE`
- `REFERENCE_SNIPPET_RESOLVED`
- `REFERENCE_ERROR_EVENT`

## Supported theme tokens
- `--embedded-reference-background-color`
- `--embedded-reference-panel-color`
- `--embedded-reference-surface-color`
- `--embedded-reference-text-color`
- `--embedded-reference-muted-text-color`
- `--embedded-reference-border-color`
- `--embedded-reference-accent-color`
- `--embedded-reference-link-color`
- `--embedded-reference-code-background-color`
- `--embedded-reference-code-text-color`
- `--embedded-reference-search-highlight-color`
- `--embedded-reference-font-family`
- `--embedded-reference-font-size`
- `--embedded-reference-line-height`
- `--embedded-reference-border-radius`
- `--embedded-reference-spacing-unit`

## Compatibility rules
- Unknown message types are ignored safely.
- Unknown payload fields are ignored safely.
- Malformed startup config fails softly and keeps the page usable.
- Theme tokens are applied only through CSS custom properties prefixed with `--embedded-reference-`.
- Height reporting is debounced to avoid noisy updates.
- The page still works as a standalone reference when no embed config is present.
