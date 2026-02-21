2026-02-21

A00
This task documents the current codebase by adding JSDoc comments to every named function (and class method) with intent-focused descriptions. Each comment should stay brief (one or two sentences) and emphasize what value the function provides or what responsibility it owns, avoiding step-by-step implementation details that can drift over time. Parameter and return annotations should describe the meaning of inputs and outputs at a behavioral level, and mention notable side effects only when they are part of the contract (for example, updating UI, mutating shared state, scheduling async work, or attaching event listeners).

B00
File: `app.js`

Function: `createAppContext`

```js
/**
 * Builds the core application context (DOM handles, event bus, state, and UI adapter)
 * so the runtime can operate without global lookups.
 *
 * @param {Document} [doc=document] Document to bind DOM queries and UI adapter to.
 * @returns {{els: Object, bus: Object, appState: Object, ui: Object}} Initialized app context bundle.
 */
```

Function: `bootstrap`

```js
/**
 * Initializes the app runtime once the document is ready by constructing the context
 * and handing it off to the runtime entrypoint.
 *
 * @returns {void}
 */
```

C00
File: `modules/app-runtime.js`
Note: The source you provided ends mid-function (`runTreeSitterParseForFile` continues but is cut off). The JSDoc suggestions below cover every named function and class method visible in the provided excerpt. If you paste the remainder, I will continue from the cutoff.

Function: `resolveAssetUrl`

```js
/**
 * Produces an absolute URL string for a runtime asset relative to this module.
 *
 * @param {string} path Asset path relative to the project root assets layout.
 * @returns {string} Absolute URL for loading the asset.
 */
```

Function: `createInitialRefsState`

```js
/**
 * Creates the initial in-memory state container for file reference detection and UI.
 *
 * @param {boolean} [enabled=true] Whether the feature should start enabled.
 * @returns {Object} Reference feature state object.
 */
```

Function: `createInitialSymbolRefsState`

```js
/**
 * Creates the initial in-memory state container for symbol reference indexing and UI.
 *
 * @param {boolean} [enabled=true] Whether the feature should start enabled.
 * @returns {Object} Symbol reference feature state object.
 */
```

Function: `createInitialTocFilterState`

```js
/**
 * Creates the initial state for table-of-contents filtering, exclusions, and caching.
 *
 * @returns {Object} TOC filter state object.
 */
```

Function: `createInitialTreeSitterQueueState`

```js
/**
 * Creates the initial state for the background Tree-sitter parsing queue.
 *
 * @returns {Object} Tree-sitter queue state object.
 */
```

Function: `createInitialTreeSitterProgressState`

```js
/**
 * Creates the initial progress counters for background analysis and parsing.
 *
 * @returns {Object} Tree-sitter progress state object.
 */
```

Function: `loadSettings`

```js
/**
 * Loads persisted user settings, applying defaults when values are missing.
 *
 * @returns {Object} Effective settings object.
 */
```

Function: `saveSettings`

```js
/**
 * Persists the current in-memory settings to durable storage.
 *
 * @returns {void}
 */
```

Function: `loadTreeSitterState`

```js
/**
 * Loads persisted Tree-sitter UI/runtime state (window placement and language config).
 *
 * @returns {Object} Stored Tree-sitter state snapshot.
 */
```

Function: `saveTreeSitterState`

```js
/**
 * Persists the current Tree-sitter UI state (notably window placement) to storage.
 *
 * @returns {void}
 */
```

Function: `normalizeTreeSitterRuntimeState`

```js
/**
 * Ensures the Tree-sitter runtime state has all required fields and safe defaults
 * after loading from storage or after resets.
 *
 * @returns {void}
 */
```

Function: `clearTreeSitterQueueHandle`

```js
/**
 * Cancels any scheduled Tree-sitter queue work and clears associated handles
 * so parsing can be safely stopped or rescheduled.
 *
 * @returns {void}
 */
```

Function: `isFileHidden`

```js
/**
 * Checks whether a file is currently hidden from the main viewer and navigation.
 *
 * @param {string} fileId File identifier.
 * @returns {boolean} True if the file is hidden.
 */
```

Function: `getFileSection`

```js
/**
 * Locates the rendered DOM section for a given file in the main viewer.
 *
 * @param {string} fileId File identifier.
 * @returns {HTMLElement|null} The file section element, or null if not present.
 */
```

Function: `applyFileVisibility`

```js
/**
 * Applies the current hidden/visible state to a file's rendered section in the DOM.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
```

Function: `getTocFilesInOrder`

```js
/**
 * Returns the currently loaded files ordered consistently for TOC rendering.
 *
 * @returns {Array<Object>} Sorted list of file records.
 */
```

Function: `normalizeTocPath`

```js
/**
 * Normalizes a path string into a consistent slash-based form suitable for matching.
 *
 * @param {string} value Raw path value.
 * @returns {string} Normalized path.
 */
```

Function: `normalizeTocPrefix`

```js
/**
 * Normalizes a path prefix into a canonical, case-insensitive form for exclusions.
 *
 * @param {string} value Raw prefix value.
 * @returns {string} Normalized lowercase prefix.
 */
```

Function: `hashString`

```js
/**
 * Produces a stable non-negative integer hash for a string, used for UI coloring/grouping.
 *
 * @param {string} value Input string.
 * @returns {number} Non-negative hash value.
 */
```

Function: `compileTocPathMatcher`

```js
/**
 * Compiles the current TOC query into a fast path-matching function supporting wildcards.
 *
 * @param {string} rawQuery User-provided query text.
 * @returns {(path: string) => boolean | null} Matcher function, or null when query is empty.
 */
```

Function: `getOrBuildTocSegments`

```js
/**
 * Builds (or retrieves cached) directory and filename segments for a file path,
 * enabling richer TOC rendering and interactions.
 *
 * @param {Object} file File record.
 * @returns {Object} Segmentation metadata for rendering and matching.
 */
```

Function: `isTocPathExcluded`

```js
/**
 * Checks whether a path is excluded by the current TOC exclusion prefixes.
 *
 * @param {string} path File path.
 * @returns {boolean} True if excluded.
 */
```

Function: `doesTocPathMatchQuery`

```js
/**
 * Checks whether a path matches the current TOC filter query (or passes when no query).
 *
 * @param {string} path File path.
 * @returns {boolean} True if the path should be considered a match.
 */
```

Function: `isTocPathVisible`

```js
/**
 * Determines whether a path should be visible in the TOC under current query and exclusions.
 *
 * @param {string} path File path.
 * @returns {boolean} True if visible.
 */
```

Function: `getTocSelectableFileIds`

```js
/**
 * Computes the set of file IDs that are currently visible and eligible for bulk TOC actions.
 *
 * @returns {Set<string>} Selectable file IDs.
 */
```

Function: `getTocActionableSelectedFileIds`

```js
/**
 * Computes the set of currently selected file IDs that are still actionable
 * (for example, not excluded by active filters).
 *
 * @returns {Set<string>} Actionable selected file IDs.
 */
```

Function: `updateTocFilterMeta`

```js
/**
 * Updates TOC filter UI indicators (counts, exclusions status, and control enablement).
 *
 * @param {number} total Total number of TOC entries.
 * @param {number} visible Number currently visible under filters.
 * @returns {void}
 */
```

Function: `setTocSegmentHoverKey`

```js
/**
 * Updates the current TOC segment hover state and triggers highlight synchronization.
 *
 * @param {string} key Stable hover key for a segment.
 * @returns {void}
 */
```

Function: `getTocSegmentHoverKeyFromDataset`

```js
/**
 * Builds a stable hover key from dataset values for segment-based highlighting.
 *
 * @param {string} segmentLower Lowercased segment text.
 * @param {string|number} segmentIndex Segment index within the path.
 * @returns {string} Hover key or empty string when invalid.
 */
```

Function: `resolveTocSegmentHoverKeyFromTarget`

```js
/**
 * Extracts a TOC segment hover key from an event target within the TOC UI.
 *
 * @param {EventTarget} target Event target.
 * @returns {string} Hover key or empty string when none applies.
 */
```

Function: `applyTocSegmentHighlight`

```js
/**
 * Applies global hover highlighting to all matching TOC segments for visual grouping.
 *
 * @returns {void}
 */
```

Function: `syncTocCheckboxesFromSelection`

```js
/**
 * Synchronizes TOC checkbox UI state from the current selection set.
 *
 * @returns {void}
 */
```

Function: `pruneTocSelectionForExclusions`

```js
/**
 * Removes selected files that became excluded, keeping selection consistent with filters.
 *
 * @returns {boolean} True if the selection changed.
 */
```

Function: `applyTocVisibilityState`

```js
/**
 * Applies current TOC query and exclusion rules to the rendered TOC rows and selection.
 *
 * @returns {void}
 */
```

Function: `updateTocFilterMatcher`

```js
/**
 * Recomputes the active TOC matcher from the current raw query string.
 *
 * @returns {void}
 */
```

Function: `applyTocFiltersNow`

```js
/**
 * Immediately applies TOC filtering and exclusion effects and refreshes related controls.
 *
 * @returns {void}
 */
```

Function: `scheduleTocFilterApply`

```js
/**
 * Debounces TOC filter application to keep the UI responsive while typing.
 *
 * @returns {void}
 */
```

Function: `clearTocQuery`

```js
/**
 * Clears the TOC filter query and re-applies filters to return to an unfiltered view.
 *
 * @returns {void}
 */
```

Function: `clearTocExclusions`

```js
/**
 * Clears all TOC exclusion prefixes and re-applies filters to restore visibility.
 *
 * @returns {void}
 */
```

Function: `renderTocPathLabel`

```js
/**
 * Builds the TOC path label UI for a file, including clickable segments and exclusion controls.
 *
 * @param {Object} file File record.
 * @param {boolean} isHidden Whether the file is currently hidden (affects link behavior).
 * @returns {HTMLElement} Rendered label node.
 */
```

Function: `scheduleTocRender`

```js
/**
 * Schedules a TOC re-render on the next animation frame to batch UI updates.
 *
 * @returns {void}
 */
```

Function: `renderTableOfContents`

```js
/**
 * Renders the TOC UI from current files and state, wiring selection and navigation behavior.
 *
 * @returns {void}
 */
```

Function: `updateTocControls`

```js
/**
 * Updates TOC action button enablement based on current visibility and selection state.
 *
 * @returns {void}
 */
```

Function: `handleTocSelectAll`

```js
/**
 * Selects all currently visible and eligible files in the TOC for bulk actions.
 *
 * @returns {void}
 */
```

Function: `handleTocResetSelection`

```js
/**
 * Clears the current TOC selection set and updates the corresponding UI.
 *
 * @returns {void}
 */
```

Function: `copySelectedFiles`

```js
/**
 * Copies the currently selected files as a combined markdown snippet to the clipboard.
 *
 * @returns {void}
 */
```

Function: `hideSelectedFiles`

```js
/**
 * Hides the currently selected files from the viewer and refreshes navigation surfaces.
 *
 * @returns {void}
 */
```

Function: `showSelectedFiles`

```js
/**
 * Unhides the currently selected files and refreshes navigation surfaces.
 *
 * @returns {void}
 */
```

Function: `handleTocFilterInput`

```js
/**
 * Handles TOC filter input changes, updating state and scheduling a debounced apply.
 *
 * @returns {void}
 */
```

Function: `handleTocSegmentPointerOver`

```js
/**
 * Tracks pointer entry over TOC segments to enable cross-row segment highlighting.
 *
 * @param {PointerEvent} event Pointer event.
 * @returns {void}
 */
```

Function: `handleTocSegmentPointerOut`

```js
/**
 * Clears or transfers TOC segment hover highlighting when the pointer leaves a segment.
 *
 * @param {PointerEvent} event Pointer event.
 * @returns {void}
 */
```

Function: `handleTocSegmentFocusIn`

```js
/**
 * Enables TOC segment highlighting when segment links receive keyboard focus.
 *
 * @param {FocusEvent} event Focus event.
 * @returns {void}
 */
```

Function: `handleTocSegmentFocusOut`

```js
/**
 * Clears or transfers TOC segment highlighting when focus moves away.
 *
 * @param {FocusEvent} event Focus event.
 * @returns {void}
 */
```

Function: `handleTocSegmentExclusion`

```js
/**
 * Handles clicks on TOC exclusion controls to hide entire folder prefixes from the TOC.
 *
 * @param {Event} event Click event.
 * @returns {void}
 */
```

Class: `PreviewWindow`
Method: `constructor`

```js
/**
 * Creates a floating preview window with drag/resize behavior and inactivity auto-close.
 *
 * @param {Object} [options] Window sizing and behavior options.
 */
```

Method: `installActivityListeners`

```js
/**
 * Installs lightweight listeners that treat user interaction as activity to prevent auto-close.
 *
 * @returns {void}
 */
```

Method: `bumpActivity`

```js
/**
 * Marks the window as recently used by extending the auto-destroy timer.
 *
 * @returns {void}
 */
```

Method: `destroy`

```js
/**
 * Tears down the preview window, removing DOM elements and releasing event handlers.
 *
 * @returns {void}
 */
```

Method: `scheduleDestroy`

```js
/**
 * Schedules automatic window destruction after a period of inactivity.
 *
 * @param {number} ms Inactivity timeout in milliseconds.
 * @returns {void}
 */
```

Method: `setTitle`

```js
/**
 * Sets the visible title for the preview window.
 *
 * @param {string} text Title text.
 * @returns {void}
 */
```

Method: `loadContent`

```js
/**
 * Replaces the preview window contents with the provided node.
 *
 * @param {Node|null} node Content root to display.
 * @returns {void}
 */
```

Method: `positionWindowNearElement`

```js
/**
 * Positions the window near a target element while keeping it within the viewport.
 *
 * @param {Element} el Anchor element.
 * @param {Object} [options] Placement options (fit behavior and side preference).
 * @returns {void}
 */
```

Method: `updateGeometry`

```js
/**
 * Applies the current stored geometry (x, y, width, height) to the window DOM.
 *
 * @returns {void}
 */
```

Method: `clampToViewport`

```js
/**
 * Adjusts the current geometry so the window remains fully within the viewport constraints.
 *
 * @returns {void}
 */
```

Method: `applyResizeConstraints`

```js
/**
 * Normalizes a proposed geometry to satisfy minimum sizes and viewport bounds.
 *
 * @param {{x:number,y:number,width:number,height:number}} next Proposed geometry.
 * @returns {{x:number,y:number,width:number,height:number}} Constrained geometry.
 */
```

Method: `setupDragHandlers`

```js
/**
 * Enables dragging the window by its header using pointer interactions.
 *
 * @returns {void}
 */
```

Method: `cancelDrag`

```js
/**
 * Cancels any in-progress drag interaction and clears internal drag state.
 *
 * @returns {void}
 */
```

Method: `setupResizeHandlers`

```js
/**
 * Enables edge/corner resizing behavior with pointer interactions and cursor feedback.
 *
 * @returns {void}
 */
```

Method: `startResize`

```js
/**
 * Begins a resize interaction for a given hit region.
 *
 * @param {PointerEvent} e Pointer event.
 * @param {string} region Resize region identifier (n, s, e, w, ne, nw, se, sw).
 * @returns {void}
 */
```

Method: `performResize`

```js
/**
 * Updates the window geometry during an active resize interaction.
 *
 * @param {PointerEvent} e Pointer event.
 * @returns {void}
 */
```

Method: `stopResize`

```js
/**
 * Ends an active resize interaction, keeping the final geometry.
 *
 * @returns {void}
 */
```

Method: `cancelResize`

```js
/**
 * Cancels an active resize interaction and restores the window to its pre-resize geometry.
 *
 * @returns {void}
 */
```

Method: `_installOutsideClickToDismiss`

```js
/**
 * Installs a capture-phase outside click handler that closes the window when clicking away.
 *
 * @returns {() => void} Teardown function to remove the handler.
 */
```

Function: `ensurePreviewWindow`

```js
/**
 * Returns an active preview window, creating one if needed and restoring last placement when available.
 *
 * @returns {{win: PreviewWindow, created: boolean, usedLastPlacement: boolean}} Window info.
 */
```

Function: `destroyPreviewWindow`

```js
/**
 * Closes and cleans up the active preview window, persisting placement for next use.
 *
 * @returns {void}
 */
```

Function: `clearPreviewCache`

```js
/**
 * Clears cached preview DOM clones to release memory and force fresh cloning next time.
 *
 * @returns {void}
 */
```

Function: `prunePreviewCache`

```js
/**
 * Evicts least-recently-used preview cache entries to keep memory use within configured limits.
 *
 * @returns {void}
 */
```

Function: `getPreviewSourceElement`

```js
/**
 * Locates the rendered <pre> element that serves as the source for preview cloning.
 *
 * @param {string} fileId File identifier.
 * @returns {HTMLElement|null} Source <pre> element or null if unavailable.
 */
```

Function: `getPreviewClone`

```js
/**
 * Returns a cached clone of a file's rendered preview source, cloning if necessary.
 *
 * @param {string} fileId File identifier.
 * @param {HTMLElement} sourceEl Source element to clone from.
 * @returns {HTMLElement} Cloned preview node.
 */
```

Function: `getPreviewLabel`

```js
/**
 * Derives a human-friendly label for a preview target from the originating UI element or file data.
 *
 * @param {Element|null} entry UI element that initiated the preview.
 * @param {string} fileId File identifier.
 * @returns {string} Label text.
 */
```

Function: `getPreviewTitle`

```js
/**
 * Builds the preview window title for a file preview interaction.
 *
 * @param {Element|null} entry UI element that initiated the preview.
 * @param {string} fileId File identifier.
 * @returns {string} Title text.
 */
```

Function: `clearPendingPreview`

```js
/**
 * Cancels any scheduled preview-open operation and clears pending preview state.
 *
 * @returns {void}
 */
```

Function: `getVisiblePaneMetrics`

```js
/**
 * Computes viewport-relative geometry for the main content pane to guide preview placement decisions.
 *
 * @returns {{top:number,height:number,width:number}} Pane metrics.
 */
```

Function: `setInitialPreviewPlacement`

```js
/**
 * Places a new preview window in a sensible default position and size relative to the main pane.
 *
 * @param {PreviewWindow} win Preview window instance.
 * @returns {void}
 */
```

Function: `storePreviewPlacement`

```js
/**
 * Stores the current preview window placement for reuse across preview sessions.
 *
 * @param {PreviewWindow} win Preview window instance.
 * @returns {void}
 */
```

Function: `applyLastPlacement`

```js
/**
 * Applies a previously stored placement to a preview window if available.
 *
 * @param {PreviewWindow} win Preview window instance.
 * @returns {boolean} True if placement was applied.
 */
```

Function: `getFileLineCount`

```js
/**
 * Returns the best-known line count for a file, using indexed data when available.
 *
 * @param {Object|null} file File record.
 * @returns {number} Line count (0 when unknown).
 */
```

Function: `clampLineNumberForFile`

```js
/**
 * Clamps a requested line number to a valid range for a given file.
 *
 * @param {Object|null} file File record.
 * @param {number} lineNumber Requested line number.
 * @returns {number} Valid line number (0 when file has no lines).
 */
```

Function: `getPreviewLineFromEntry`

```js
/**
 * Reads an optional line target from a preview-triggering element and validates it against the file.
 *
 * @param {Element|null} entry Trigger element.
 * @param {string} fileId File identifier.
 * @returns {number|null} Valid line number or null when none applies.
 */
```

Function: `clearPreviewLineMarker`

```js
/**
 * Removes any rendered line marker elements from a preview content subtree.
 *
 * @param {ParentNode|null} root Root to clean markers from.
 * @returns {void}
 */
```

Function: `clearPreviewLineMarkersInCache`

```js
/**
 * Clears all line markers from cached preview clones and the active preview content.
 *
 * @returns {void}
 */
```

Function: `applyPreviewLineTarget`

```js
/**
 * Highlights and scrolls to a target line within preview content when a line number is provided.
 *
 * @param {PreviewWindow} win Preview window instance.
 * @param {HTMLElement} clone Preview content clone.
 * @param {string} fileId File identifier.
 * @param {number} lineNumber Target line number.
 * @returns {void}
 */
```

Function: `showPreviewForEntry`

```js
/**
 * Opens or updates the preview window to display a file (optionally centered on a target line).
 *
 * @param {Element|null} entry Trigger element for labeling/context.
 * @param {string} fileId File identifier.
 * @param {number|null} [lineNumber=null] Optional line number to focus.
 * @returns {boolean} True if preview was shown, false if unavailable/disabled.
 */
```

Function: `schedulePreviewOpen`

```js
/**
 * Schedules a delayed preview open/switch, canceling prior pending work to avoid flicker.
 *
 * @param {Element} entry Hovered/clicked entry element.
 * @param {string} fileId File identifier.
 * @param {number|null} lineNumber Optional line number.
 * @param {number} delayMs Delay in milliseconds before opening.
 * @returns {void}
 */
```

Function: `getPreviewAnchorFromEvent`

```js
/**
 * Resolves whether an event originated from a supported preview anchor within known containers.
 *
 * @param {Event} event DOM event.
 * @returns {HTMLAnchorElement|null} Anchor eligible for preview, or null.
 */
```

Function: `handlePreviewPointerOver`

```js
/**
 * Handles hover entry into previewable links and schedules preview opening when appropriate.
 *
 * @param {PointerEvent} event Pointer event.
 * @returns {void}
 */
```

Function: `handlePreviewPointerOut`

```js
/**
 * Handles hover exit from previewable links and cancels pending preview actions.
 *
 * @param {PointerEvent} event Pointer event.
 * @returns {void}
 */
```

Function: `handlePreviewPointerMove`

```js
/**
 * Treats pointer movement over the active hovered entry as activity to keep the preview alive.
 *
 * @param {PointerEvent} event Pointer event.
 * @returns {void}
 */
```

Function: `attachHoverPreviewHandlers`

```js
/**
 * Attaches delegated hover handlers to a container to enable preview-on-hover behavior.
 *
 * @param {HTMLElement} container Container element to bind to.
 * @returns {void}
 */
```

Function: `setupHoverPreview`

```js
/**
 * Enables hover preview behavior on supported navigation surfaces (TOC and directory tree).
 *
 * @returns {void}
 */
```

Function: `handlePreviewViewportResize`

```js
/**
 * Keeps the preview window placement valid when the viewport size changes.
 *
 * @returns {void}
 */
```

Function: `setPreviewEnabled`

```js
/**
 * Enables or disables hover preview behavior and updates related UI state.
 *
 * @param {boolean} enabled Whether preview should be enabled.
 * @returns {void}
 */
```

Function: `ensureActiveFileVisible`

```js
/**
 * Ensures there is a valid active file selection and that it points to a visible file when possible.
 *
 * @returns {void}
 */
```

Function: `parseHashValue`

```js
/**
 * Parses the location hash into a file target and optional line target.
 *
 * @param {string} hash Location hash string.
 * @returns {{fileId: string, line: number|null}} Parsed navigation target.
 */
```

Function: `ensureFileVisible`

```js
/**
 * Unhides a file if needed so it can be navigated to and viewed.
 *
 * @param {string} fileId File identifier.
 * @returns {boolean} True if the file visibility changed.
 */
```

Function: `navigateToFileLine`

```js
/**
 * Navigates to a specific file and line by updating the location hash and ensuring visibility.
 *
 * @param {string} fileId File identifier.
 * @param {number} line 1-based line number.
 * @returns {void}
 */
```

Function: `setSearchError`

```js
/**
 * Displays a search validation or runtime error in the search panel UI.
 *
 * @param {string} message Primary error message.
 * @param {string} detail Optional detailed message.
 * @returns {void}
 */
```

Function: `clearSearchError`

```js
/**
 * Clears any visible search error state from the search panel UI.
 *
 * @returns {void}
 */
```

Function: `updateSearchSummary`

```js
/**
 * Updates the search panel summary text to reflect running progress or final match counts.
 *
 * @returns {void}
 */
```

Function: `updateSearchResultsMeta`

```js
/**
 * Updates search results metadata UI (for example, indicating partial results).
 *
 * @returns {void}
 */
```

Function: `updateSearchCapNotice`

```js
/**
 * Toggles the UI notice that indicates results were capped for performance.
 *
 * @returns {void}
 */
```

Function: `updateSearchButtons`

```js
/**
 * Updates search panel button visibility and enablement based on search run state.
 *
 * @returns {void}
 */
```

Function: `updateSearchAvailability`

```js
/**
 * Enables or disables search UI based on whether a project is loaded, and reconciles running state.
 *
 * @returns {void}
 */
```

Function: `resetSearchPanel`

```js
/**
 * Resets the search panel to its default state and clears any in-progress or prior results.
 *
 * @returns {void}
 */
```

Function: `getSearchScopeFiles`

```js
/**
 * Returns the file list applicable to a search scope (all files or only visible files).
 *
 * @param {string} scope Scope identifier (e.g., "all" or "visible").
 * @returns {Array<Object>} Sorted list of file records.
 */
```

Function: `appendSearchResults`

```js
/**
 * Appends any newly found search results to the results list in the UI.
 *
 * @returns {void}
 */
```

Function: `buildSearchResultCard`

```js
/**
 * Builds a UI card representing a single search hit with contextual snippet and navigation links.
 *
 * @param {Object} result Search result record.
 * @returns {HTMLElement} Rendered result card.
 */
```

Function: `finishSearchRun`

```js
/**
 * Finalizes the current search run, leaving results in place and updating UI state.
 *
 * @returns {void}
 */
```

Function: `cancelSearchRun`

```js
/**
 * Cancels the current search run and updates UI, optionally marking results as partial.
 *
 * @param {string} reason Cancellation reason (e.g., "user", "reset", "new").
 * @returns {void}
 */
```

Function: `runSearchSlice`

```js
/**
 * Executes a time-sliced portion of the active search to keep the UI responsive.
 *
 * @param {Object} run Mutable search run state.
 * @returns {void}
 */
```

Function: `startSearchRun`

```js
/**
 * Validates inputs and starts a new search run over the selected scope and mode.
 *
 * @param {string} source Trigger source (e.g., "live" or "explicit").
 * @returns {void}
 */
```

Function: `scheduleLiveSearch`

```js
/**
 * Debounces live search execution while the user edits the query, canceling prior runs as needed.
 *
 * @returns {void}
 */
```

Function: `maybeYield`

```js
/**
 * Opportunistically yields control to the event loop to keep long operations responsive.
 *
 * @param {{value:number}} lastYieldRef Mutable reference tracking the last yield timestamp.
 * @returns {Promise<void>} Promise that resolves after yielding when needed.
 */
```

Function: `createNormalizedSymbolContribution`

```js
/**
 * Normalizes a symbol contribution into a consistent shape suitable for indexing and display.
 *
 * @param {Object} file File record associated with the contribution.
 * @param {Object|null} contribution Raw contribution data (heuristic or Tree-sitter).
 * @param {string} source Source label (e.g., "heuristic" or "tree").
 * @returns {Object} Normalized contribution object.
 */
```

Function: `cancelSymbolReferenceBuild`

```js
/**
 * Cancels any in-progress symbol index build and clears pending build work.
 *
 * @returns {void}
 */
```

Function: `cancelSymbolReferenceIncremental`

```js
/**
 * Cancels any pending or running incremental symbol update work.
 *
 * @returns {void}
 */
```

Function: `destroySymbolReferencePanel`

```js
/**
 * Closes and resets the symbol reference panel window and its UI bookkeeping.
 *
 * @returns {void}
 */
```

Function: `resetSymbolReferenceStateForLoad`

```js
/**
 * Resets symbol reference state in preparation for loading a new project, honoring settings.
 *
 * @returns {void}
 */
```

Function: `attachSymbolReferenceDelegates`

```js
/**
 * Attaches event delegates needed for symbol reference interactions within the file viewer.
 *
 * @returns {void}
 */
```

Function: `detachSymbolReferenceDelegates`

```js
/**
 * Removes event delegates for symbol reference interactions.
 *
 * @returns {void}
 */
```

Function: `getSymbolContributionForFile`

```js
/**
 * Returns the best available symbol contribution for a file, preferring Tree-sitter when present.
 *
 * @param {string} fileId File identifier.
 * @returns {Object|null} Contribution for the file, or null if none available.
 */
```

Function: `refreshEffectiveSymbolContribution`

```js
/**
 * Refreshes the effective contribution map for a file so indexing uses the best available data.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
```

Function: `createSymbolIndexEntry`

```js
/**
 * Creates a new symbol index entry bucket used to accumulate definitions and references.
 *
 * @param {string} symbol Symbol text.
 * @returns {Object} Initialized symbol index entry.
 */
```

Function: `shouldSkipWeakBridgeSymbol`

```js
/**
 * Determines whether a weak "bridge" symbol should be ignored to reduce noisy cross-file linking.
 *
 * @param {string} symbol Symbol text.
 * @param {string} bridgeClass Bridge classification.
 * @param {Map<string, Set<string>>} weakFileMap Weak symbol to file-set map.
 * @param {Set<string>} treeDefinitionSymbols Symbols with Tree-sitter definitions.
 * @returns {boolean} True if the symbol should be skipped.
 */
```

Function: `collectWeakBridgeStats`

```js
/**
 * Collects cross-file occurrence signals used to decide whether weak bridge symbols are meaningful.
 *
 * @param {Object} contribution Symbol contribution for a file.
 * @param {Map<string, Set<string>>} weakFileMap Weak symbol to file-set map.
 * @param {Set<string>} treeDefinitionSymbols Symbols with Tree-sitter definitions.
 * @returns {void}
 */
```

Function: `addSymbolOccurrenceToIndex`

```js
/**
 * Incorporates a single symbol occurrence into the aggregated project-wide symbol index.
 *
 * @param {Map<string, Object>} bySymbol Index map keyed by symbol.
 * @param {Object} contribution Contribution metadata for the originating file.
 * @param {Object} occurrence Occurrence record (definition or reference).
 * @returns {void}
 */
```

Function: `runSymbolIndexRebuildSlice`

```js
/**
 * Builds the project-wide symbol index in time slices, updating progress and UI as it advances.
 *
 * @param {Object} run Mutable rebuild run state.
 * @returns {void}
 */
```

Function: `startSymbolIndexRebuild`

```js
/**
 * Starts a full rebuild of the project-wide symbol index from current effective contributions.
 *
 * @param {string} [reason="baseline"] Reason label for the rebuild.
 * @param {Function|null} [onComplete=null] Optional callback invoked when rebuild completes.
 * @returns {void}
 */
```

Function: `runSymbolBaselineSlice`

```js
/**
 * Builds baseline per-file symbol contributions (heuristic-first) in slices to keep the UI responsive.
 *
 * @param {Object} run Mutable baseline run state.
 * @returns {void}
 */
```

Function: `scheduleSymbolReferenceBaselineBuild`

```js
/**
 * Resets and schedules a baseline symbol analysis pass across all loaded files.
 *
 * @returns {void}
 */
```

Function: `scheduleSymbolReferenceIncrementalUpdate`

```js
/**
 * Schedules an incremental symbol contribution refresh for a file after it changes or is re-parsed.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
```

Function: `runSymbolReferenceIncrementalBatch`

```js
/**
 * Processes a batch of pending incremental symbol updates and triggers an index rebuild as needed.
 *
 * @returns {void}
 */
```

Function: `getSymbolReferenceStatusText`

```js
/**
 * Produces a compact status line describing symbol indexing progress for display in the control bar.
 *
 * @returns {string} Status text or empty string when not applicable.
 */
```

Function: `ensureSymbolReferencePanelWindow`

```js
/**
 * Returns the symbol reference panel window, creating it when necessary.
 *
 * @returns {PreviewWindow} Panel window instance.
 */
```

Function: `createSymbolReferenceActionButton`

```js
/**
 * Creates a standardized action button used inside the symbol reference panel.
 *
 * @param {string} label Button label text.
 * @param {string} className CSS class string.
 * @param {Function} onClick Click handler.
 * @returns {HTMLButtonElement} Button element.
 */
```

Function: `openSearchForSymbol`

```js
/**
 * Opens the search panel pre-filled to search for a symbol across the project.
 *
 * @param {string} symbol Symbol to search for.
 * @returns {void}
 */
```

Function: `buildSymbolReferencePanelContent`

```js
/**
 * Builds the full UI content for the symbol reference panel for a given symbol.
 *
 * @param {string} symbol Target symbol.
 * @param {string} sourceFileId File that initiated the request (for context).
 * @returns {HTMLElement} Panel content root node.
 */
```

Function: `openSymbolReferencePanel`

```js
/**
 * Opens the symbol reference panel anchored near the triggering element.
 *
 * @param {Element} anchorEl Element used for positioning the panel.
 * @param {string} symbol Target symbol.
 * @param {string} sourceFileId File that initiated the request.
 * @returns {void}
 */
```

Function: `scheduleSymbolReferencePanelRefresh`

```js
/**
 * Debounces refresh of the active symbol reference panel to reflect the latest index version.
 *
 * @returns {void}
 */
```

Function: `getCaretOffsetWithinCode`

```js
/**
 * Computes the caret offset within a code block for a pointer event, enabling token extraction.
 *
 * @param {HTMLElement} code Code element containing text.
 * @param {MouseEvent|PointerEvent} event Event providing viewport coordinates.
 * @returns {number|null} Character offset within the code text, or null when unavailable.
 */
```

Function: `extractSymbolFromClick`

```js
/**
 * Extracts a symbol from a click context, preferring an explicit selection when present.
 *
 * @param {MouseEvent|PointerEvent} event Click event.
 * @param {HTMLElement} code Code element.
 * @returns {string|null} Extracted symbol or null when none applies.
 */
```

Function: `handleSymbolReferenceClick`

```js
/**
 * Handles clicks in code blocks to open the symbol reference panel for the clicked identifier.
 *
 * @param {MouseEvent} event Click event.
 * @returns {void}
 */
```

Function: `syncSymbolReferenceFeatureEnabled`

```js
/**
 * Applies the symbol reference enablement setting by wiring or unwiring handlers and builds.
 *
 * @returns {void}
 */
```

Function: `attachReferenceDelegates`

```js
/**
 * Attaches event delegates for file reference token interactions within the file viewer.
 *
 * @returns {void}
 */
```

Function: `detachReferenceDelegates`

```js
/**
 * Removes event delegates for file reference token interactions.
 *
 * @returns {void}
 */
```

Function: `destroyReferencePanel`

```js
/**
 * Closes and clears the active file reference panel window.
 *
 * @returns {void}
 */
```

Function: `teardownReferenceObserver`

```js
/**
 * Disposes the observer used to lazily decorate file reference tokens as sections enter view.
 *
 * @returns {void}
 */
```

Function: `cancelReferenceIndexBuild`

```js
/**
 * Cancels any in-progress reference index build and clears pending build work.
 *
 * @returns {void}
 */
```

Function: `resetReferenceStateForLoad`

```js
/**
 * Resets file reference state in preparation for loading a new project, honoring settings.
 *
 * @returns {void}
 */
```

Function: `setReferenceDecorated`

```js
/**
 * Marks a code block as decorated (or not) for file reference tokens to prevent redundant work.
 *
 * @param {HTMLElement} code Code element.
 * @param {boolean} value Whether decoration is complete.
 * @returns {void}
 */
```

Function: `markReferenceDecorationFailed`

```js
/**
 * Records a decoration failure for a file section to avoid repeated attempts and stabilize UX.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
```

Function: `clearReferenceDecorationsInCode`

```js
/**
 * Removes any rendered reference token wrappers from a code element and restores plain text.
 *
 * @param {HTMLElement} code Code element.
 * @returns {void}
 */
```

Function: `clearAllReferenceDecorations`

```js
/**
 * Clears reference token decorations across all rendered files and resets decoration tracking.
 *
 * @returns {void}
 */
```

Function: `rebuildPathToLoadedFileMap`

```js
/**
 * Rebuilds the lookup map from normalized project paths to loaded file IDs for fast navigation.
 *
 * @returns {void}
 */
```

Function: `recordInventoryPathForRefs`

```js
/**
 * Records a project path into the reference inventory so candidates can be resolved later.
 *
 * @param {string} path Project-relative path.
 * @returns {void}
 */
```

Function: `ensureReferenceObserver`

```js
/**
 * Ensures the IntersectionObserver for lazy reference decoration exists and is configured.
 *
 * @returns {void}
 */
```

Function: `observeReferenceSection`

```js
/**
 * Observes a file section so reference tokens can be decorated when it enters the viewport.
 *
 * @param {HTMLElement} section File section element.
 * @returns {void}
 */
```

Function: `observeAllReferenceSections`

```js
/**
 * Begins observing all current file sections for lazy reference decoration.
 *
 * @returns {void}
 */
```

Function: `buildReferenceRangesForFile`

```js
/**
 * Converts reference occurrences into sorted non-overlapping character ranges for safe DOM wrapping.
 *
 * @param {Object} file File record.
 * @param {Array<Object>} occurrences Occurrence records for the file.
 * @returns {Array<{start:number,end:number,occurrence:Object}>} Non-overlapping ranges.
 */
```

Function: `collectTextNodesWithOffsets`

```js
/**
 * Collects text nodes under a code element with cumulative offsets to support range-based wrapping.
 *
 * @param {HTMLElement} code Code element.
 * @returns {Array<{node:Text,start:number,end:number}>} Text nodes with offsets.
 */
```

Function: `wrapReferenceTextSegment`

```js
/**
 * Wraps a matching text segment in a reference token element that can be clicked or focused.
 *
 * @param {Text} node Text node to split and wrap.
 * @param {number} start Start offset within the text node.
 * @param {number} end End offset within the text node.
 * @param {Object} occurrence Resolved occurrence metadata.
 * @param {string} sourceFileId Source file identifier.
 * @returns {void}
 */
```

Function: `decorateFileSectionReferences`

```js
/**
 * Decorates a file section by wrapping detected reference-like substrings with interactive tokens.
 *
 * @param {string} fileId File identifier.
 * @returns {boolean} True when decoration is complete or not needed, false when it should be retried later.
 */
```

Function: `updateReferenceTargetStatus`

```js
/**
 * Merges reference resolution statuses to maintain a conservative overall status for a target.
 *
 * @param {string|null} current Current status.
 * @param {string} next Next status to merge in.
 * @returns {string} Combined status.
 */
```

Function: `pushReferenceOccurrence`

```js
/**
 * Records a resolved reference occurrence into both per-source and per-target indexes.
 *
 * @param {Object} file Source file record.
 * @param {number} lineNumber 1-based line number of the occurrence.
 * @param {Object} candidate Extracted candidate token info.
 * @param {Object} resolution Resolution result for the candidate.
 * @returns {void}
 */
```

Function: `runReferenceIndexSlice`

```js
/**
 * Builds the project reference index in time slices to keep the UI responsive during indexing.
 *
 * @param {Object} run Mutable build run state.
 * @returns {void}
 */
```

Function: `scheduleReferenceIndexBuild`

```js
/**
 * Resets and schedules a full rebuild of the file reference index for the currently loaded project.
 *
 * @returns {void}
 */
```

Function: `syncReferenceFeatureEnabled`

```js
/**
 * Applies the file reference enablement setting by wiring or unwiring handlers and indexing.
 *
 * @returns {void}
 */
```

Function: `ensureReferencePanelWindow`

```js
/**
 * Returns the file reference panel window, creating it when necessary.
 *
 * @returns {PreviewWindow} Panel window instance.
 */
```

Function: `parseRefTokenDataset`

```js
/**
 * Parses the dataset payload from a rendered reference token into a stable token data object.
 *
 * @param {HTMLElement} el Reference token element.
 * @returns {{raw:string, normalized:string, targetKey:string, status:string, resolvedPaths:string[]}|null} Token data.
 */
```

Function: `openResolvedReferencePath`

```js
/**
 * Navigates to a resolved project path when the target exists among loaded files.
 *
 * @param {string} path Normalized project path.
 * @returns {boolean} True if navigation succeeded.
 */
```

Function: `buildReferencePanelContent`

```js
/**
 * Builds the UI content for the file reference panel, including resolution status and backlinks.
 *
 * @param {Object} tokenData Parsed token data.
 * @param {string} sourceFileId Source file initiating the panel.
 * @returns {HTMLElement} Panel content root node.
 */
```

Function: `openReferencePanel`

```js
/**
 * Opens the file reference panel anchored near the triggering element.
 *
 * @param {Element} anchorEl Element used for positioning the panel.
 * @param {Object} tokenData Parsed token data.
 * @param {string} sourceFileId Source file initiating the panel.
 * @returns {void}
 */
```

Function: `handleReferenceTokenClick`

```js
/**
 * Handles clicks on reference tokens to open the reference panel for the clicked token.
 *
 * @param {MouseEvent} event Click event.
 * @returns {void}
 */
```

Function: `handleReferenceTokenKeydown`

```js
/**
 * Handles keyboard activation on reference tokens to open the reference panel.
 *
 * @param {KeyboardEvent} event Keydown event.
 * @returns {void}
 */
```

Function: `resetStateForLoad`

```js
/**
 * Resets all runtime state and UI surfaces to prepare for loading a new project.
 *
 * @returns {void}
 */
```

Function: `updateControlBar`

```js
/**
 * Refreshes the main control bar to reflect current load, parsing, indexing, and selection state.
 *
 * @returns {void}
 */
```

Function: `updateSidebarVisibility`

```js
/**
 * Shows or hides the sidebar and its edge affordance based on whether a project is active.
 *
 * @returns {void}
 */
```

Function: `updateEmptyOverlay`

```js
/**
 * Updates the empty-state overlay and main panel interactivity based on whether files are loaded.
 *
 * @returns {void}
 */
```

Function: `updateOffsets`

```js
/**
 * Recomputes layout CSS variables used to position stacked UI elements.
 *
 * @returns {void}
 */
```

Function: `updateSidebarPinLabel`

```js
/**
 * Updates the sidebar pin button label to match current pinned/unpinned state.
 *
 * @returns {void}
 */
```

Function: `applyStaticButtonLabels`

```js
/**
 * Applies standard icon+label formatting to static UI buttons and chips.
 *
 * @returns {void}
 */
```

Function: `showEmptySupportMessage`

```js
/**
 * Displays or hides the empty-state support message depending on folder picker availability.
 *
 * @returns {void}
 */
```

Function: `hideBanner`

```js
/**
 * Hides the status banner and clears its content and kind.
 *
 * @returns {void}
 */
```

Function: `showBanner`

```js
/**
 * Shows a status banner message with a semantic kind for styling and user feedback.
 *
 * @param {string} text Banner text.
 * @param {string} [kind="info"] Banner kind identifier.
 * @returns {void}
 */
```

Function: `pickFolder`

```js
/**
 * Prompts the user to pick a folder and initiates project loading, falling back with guidance on failure.
 *
 * @returns {Promise<void>}
 */
```

Function: `loadFromDirectoryHandle`

```js
/**
 * Loads a project by traversing a directory handle and ingesting supported files into state and UI.
 *
 * @param {FileSystemDirectoryHandle} handle Directory handle chosen by the user.
 * @returns {Promise<void>}
 */
```

Function: `traverseDirectory`

```js
/**
 * Recursively traverses a directory handle, applying ignore rules and processing eligible files.
 *
 * @param {FileSystemDirectoryHandle} dirHandle Directory to traverse.
 * @param {string} prefix Current path prefix.
 * @returns {Promise<void>}
 */
```

Function: `shouldIgnore`

```js
/**
 * Checks whether a directory or file name matches the configured ignore list.
 *
 * @param {string} name Segment name.
 * @returns {boolean} True if the segment should be ignored.
 */
```

Function: `pathHasIgnoredSegment`

```js
/**
 * Checks whether any segment of a path is ignored by current settings.
 *
 * @param {string} path Project path.
 * @returns {boolean} True if the path contains an ignored segment.
 */
```

Function: `isAllowedFile`

```js
/**
 * Determines whether a file should be loaded based on extension allowlist and size limits.
 *
 * @param {string} path File path.
 * @param {number} size File size in bytes.
 * @returns {{allowed:boolean, reason?:string, ext?:string}} Allow decision and metadata.
 */
```

Function: `processFileEntry`

```js
/**
 * Validates a directory entry and, when eligible, reads and stores it as a loaded source file.
 *
 * @param {FileSystemFileHandle} entry File entry handle.
 * @param {string} path Project-relative path.
 * @returns {Promise<void>}
 */
```

Function: `readAndStoreFile`

```js
/**
 * Reads a file's text content and stores a normalized record while updating UI, aggregates, and analysis queues.
 *
 * @param {File} file Browser File object.
 * @param {string} path Project-relative path.
 * @param {string} extHint Extension hint used for language classification.
 * @returns {Promise<void>}
 */
```

Function: `updateLargest`

```js
/**
 * Updates the "largest files" aggregate list with a new file record.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
```

Function: `formatLineNumberParts`

```js
/**
 * Formats a line number into leading and significant digit parts for aligned gutter rendering.
 *
 * @param {number} lineNumber 1-based line number.
 * @returns {{leading:string, significant:string}} Split formatted parts.
 */
```

Function: `buildLineNumberGutter`

```js
/**
 * Builds the line-number gutter DOM for a given line count.
 *
 * @param {number} lineCount Number of lines in the file.
 * @returns {HTMLElement} Gutter element.
 */
```

Function: `insertIntoTree`

```js
/**
 * Inserts a loaded file into the directory tree model and refreshes the tree UI.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
```

Function: `sortTree`

```js
/**
 * Sorts a directory tree node in-place so directories appear before files with stable name ordering.
 *
 * @param {Object} node Tree node.
 * @returns {void}
 */
```

Function: `renderDirectoryTree`

```js
/**
 * Renders the directory tree UI from the current in-memory tree model and active selection state.
 *
 * @returns {void}
 */
```

Function: `handleTreeClick`

```js
/**
 * Handles click interactions on directory nodes to toggle expansion.
 *
 * @param {Object} node Tree node.
 * @returns {void}
 */
```

Function: `renderFileSection`

```js
/**
 * Renders a file into the main viewer as an expandable section with actions and line gutter.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
```

Function: `attachObserver`

```js
/**
 * Attaches observers and handlers for active file tracking, highlighting, and reference decoration.
 *
 * @param {HTMLElement} section File section element.
 * @returns {void}
 */
```

Function: `observeHighlightBlock`

```js
/**
 * Registers a code block with the syntax highlighter observer for deferred highlighting.
 *
 * @param {HTMLElement} code Code element.
 * @returns {void}
 */
```

Function: `setActiveFile`

```js
/**
 * Sets the active file for navigation and status display, ensuring it is visible and reflected in the UI.
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
```

Function: `updateActiveLine`

```js
/**
 * Updates the active indicator with an approximate line number based on scroll position in the active file.
 *
 * @returns {void}
 */
```

Function: `handleHashChange`

```js
/**
 * Responds to hash navigation changes by scrolling to the target file (and optional line) and activating it.
 *
 * @returns {void}
 */
```

Function: `maybeWarnMemory`

```js
/**
 * Shows a warning banner when loaded content exceeds a configured memory threshold.
 *
 * @returns {void}
 */
```

Function: `finishLoad`

```js
/**
 * Finalizes the load process by updating phase, triggering indexes/analysis, and refreshing UI state.
 *
 * @returns {void}
 */
```

Function: `maybeYieldEmptyEnter`

```js
/**
 * Handles keyboard shortcuts in the empty state for opening a project or closing panels.
 *
 * @param {KeyboardEvent} e Key event.
 * @returns {void}
 */
```

Function: `closePanels`

```js
/**
 * Closes all open panels and transient windows to return to the main viewer.
 *
 * @returns {void}
 */
```

Function: `openSettings`

```js
/**
 * Opens the settings panel and populates form controls with current settings values.
 *
 * @returns {void}
 */
```

Function: `closeSettings`

```js
/**
 * Closes the settings panel.
 *
 * @returns {void}
 */
```

Function: `saveSettingsFromForm`

```js
/**
 * Reads settings from the form, persists them, and applies feature toggles to the running UI.
 *
 * @returns {void}
 */
```

Function: `applyDisplaySettings`

```js
/**
 * Applies viewer display-related settings to rendered file panes.
 *
 * @returns {void}
 */
```

Function: `openStatsPanel`

```js
/**
 * Opens the stats panel when a project is loaded and stats are available.
 *
 * @returns {void}
 */
```

Function: `renderStatsPanel`

```js
/**
 * Renders summary statistics such as top languages and largest files into the stats panel.
 *
 * @returns {void}
 */
```

Function: `closeStatsPanel`

```js
/**
 * Closes the stats panel.
 *
 * @returns {void}
 */
```

Function: `openLogPanel`

```js
/**
 * Opens the log panel and renders the current load/index log entries.
 *
 * @returns {void}
 */
```

Function: `closeLogPanel`

```js
/**
 * Closes the log panel.
 *
 * @returns {void}
 */
```

Function: `openSupportPanel`

```js
/**
 * Opens the support/help panel.
 *
 * @returns {void}
 */
```

Function: `closeSupportPanel`

```js
/**
 * Closes the support/help panel.
 *
 * @returns {void}
 */
```

Function: `addLog`

```js
/**
 * Adds a timestamped entry to the internal log and refreshes UI status where relevant.
 *
 * @param {string} path Associated path or subsystem label.
 * @param {string} reason Reason or message.
 * @returns {void}
 */
```

Function: `setupSidebarResize`

```js
/**
 * Enables drag resizing for the sidebar and updates CSS variables as the user resizes.
 *
 * @returns {void}
 */
```

Function: `toggleSidebarPin`

```js
/**
 * Toggles whether the sidebar is pinned or behaves as an overlay.
 *
 * @returns {void}
 */
```

Function: `openSidebarOverlay`

```js
/**
 * Opens the sidebar overlay when unpinned.
 *
 * @returns {void}
 */
```

Function: `collapseSidebarOverlay`

```js
/**
 * Schedules collapsing the sidebar overlay when unpinned to reduce visual clutter.
 *
 * @returns {void}
 */
```

Function: `handleTreeKeydown`

```js
/**
 * Handles keyboard navigation for the directory tree (move focus and activate items).
 *
 * @param {KeyboardEvent} e Key event.
 * @returns {void}
 */
```

Function: `findNodeById`

```js
/**
 * Finds a node within the directory tree model by its path or file identifier.
 *
 * @param {Object} node Root node to search from.
 * @param {string} id Node identifier.
 * @returns {Object|null} Matching node or null.
 */
```

Function: `handleFileInput`

```js
/**
 * Handles file picker input changes and initiates loading from the selected file list.
 *
 * @param {Event} evt Input change event.
 * @returns {void}
 */
```

Function: `loadFromFileList`

```js
/**
 * Loads a project from an explicit file list (for browsers without directory picker support).
 *
 * @param {File[]} files Selected files.
 * @returns {Promise<void>}
 */
```

Function: `cancelLoad`

```js
/**
 * Requests cancellation of an in-progress load and stops background parsing work.
 *
 * @returns {void}
 */
```

Function: `applyWrapToggle`

```js
/**
 * Applies the wrap setting, persists it, and communicates constraints that affect viewer behavior.
 *
 * @returns {void}
 */
```

Function: `applyStatsToggle`

```js
/**
 * Applies the stats display toggle and reconciles any stats-related banner state.
 *
 * @returns {void}
 */
```

Function: `applyFileRefsToggle`

```js
/**
 * Applies the file reference feature toggle and reconciles runtime handlers and indexing.
 *
 * @returns {void}
 */
```

Function: `applySymbolRefsToggle`

```js
/**
 * Applies the symbol reference feature toggle and reconciles runtime handlers and indexing.
 *
 * @returns {void}
 */
```

Function: `clampTreeSitterWindow`

```js
/**
 * Clamps Tree-sitter window geometry to sensible bounds within the current viewport.
 *
 * @param {Object} win Stored window geometry.
 * @returns {Object} Clamped geometry.
 */
```

Function: `updateTreeSitterPlacement`

```js
/**
 * Applies current Tree-sitter window placement to the DOM and persists it.
 *
 * @returns {void}
 */
```

Function: `updateTreeSitterWindowUI`

```js
/**
 * Updates Tree-sitter window visibility/minimized state and refreshes its rendered content.
 *
 * @returns {void}
 */
```

Function: `handleTreeButtonClick`

```js
/**
 * Toggles the Tree-sitter window between closed, open, and minimized states.
 *
 * @returns {void}
 */
```

Function: `openTreeSitterWindow`

```js
/**
 * Opens the Tree-sitter window and resumes background parsing and runtime initialization.
 *
 * @returns {void}
 */
```

Function: `closeTreeSitterWindow`

```js
/**
 * Closes the Tree-sitter window and pauses background parsing work.
 *
 * @returns {void}
 */
```

Function: `minimizeTreeSitterWindow`

```js
/**
 * Minimizes the Tree-sitter window into a draggable chip and pauses background parsing work.
 *
 * @returns {void}
 */
```

Function: `restoreTreeSitterWindow`

```js
/**
 * Restores the minimized Tree-sitter window and resumes background parsing work.
 *
 * @returns {void}
 */
```

Function: `handleTreeSitterDrag`

```js
/**
 * Enables dragging the Tree-sitter window to reposition it.
 *
 * @param {MouseEvent} e Mouse event.
 * @returns {void}
 */
```

Function: `handleTreeSitterResize`

```js
/**
 * Enables resizing the Tree-sitter window via its resize handle.
 *
 * @param {MouseEvent} e Mouse event.
 * @returns {void}
 */
```

Function: `handleChipDrag`

```js
/**
 * Enables dragging the minimized Tree-sitter chip vertically to reposition it.
 *
 * @param {MouseEvent} e Mouse event.
 * @returns {void}
 */
```

Function: `handleViewportResize`

```js
/**
 * Re-applies Tree-sitter placement constraints when the viewport changes size.
 *
 * @returns {void}
 */
```

Function: `maybeInitTreeSitterRuntime`

```js
/**
 * Lazily initializes the Tree-sitter runtime when requested, recording errors for user visibility.
 *
 * @returns {Promise<void>}
 */
```

Function: `loadTreeSitterLanguage`

```js
/**
 * Loads and caches a Tree-sitter language grammar for a given language kind when available.
 *
 * @param {string} kind Language kind key.
 * @returns {Promise<Object|null>} Loaded language object or null when unavailable.
 */
```

Function: `cancelPendingTreeSitterParse`

```js
/**
 * Cancels any pending Tree-sitter parse work without necessarily clearing all queued intent.
 *
 * @returns {void}
 */
```

Function: `cancelTreeSitterQueue`

```js
/**
 * Cancels Tree-sitter queue processing and optionally clears all pending files.
 *
 * @param {string} [_reason="cancel"] Reason label for diagnostics.
 * @param {boolean} [clearPending=true] Whether to clear all queued work.
 * @returns {void}
 */
```

Function: `pauseTreeSitterQueue`

```js
/**
 * Pauses Tree-sitter queue processing and clears active handles without dropping queued intent.
 *
 * @returns {void}
 */
```

Function: `resumeTreeSitterQueue`

```js
/**
 * Resumes Tree-sitter queue processing by scheduling work and refreshing status.
 *
 * @returns {void}
 */
```

Function: `scheduleTreeSitterStatusRefresh`

```js
/**
 * Debounces refresh of Tree-sitter status and UI to avoid excessive rendering.
 *
 * @returns {void}
 */
```

Function: `pushTreeSitterError`

```js
/**
 * Records a Tree-sitter error entry with bounded history for display and troubleshooting.
 *
 * @param {string} path File path or subsystem label.
 * @param {string} error Error message.
 * @returns {void}
 */
```

Function: `refreshTreeSitterProgress`

```js
/**
 * Recomputes Tree-sitter progress counters from per-file parse state.
 *
 * @returns {void}
 */
```

Function: `getTreeSitterQueueStatusText`

```js
/**
 * Produces user-facing status text describing Tree-sitter analysis and queue progress.
 *
 * @param {{compact?: boolean}} [options] Formatting options.
 * @returns {string} Status text or empty string when not applicable.
 */
```

Function: `updateTreeSitterParseButtonLabel`

```js
/**
 * Updates the Tree-sitter parse button label to reflect whether it will parse, pause, resume, or rebuild.
 *
 * @returns {void}
 */
```

Function: `ensureTreeSitterFileState`

```js
/**
 * Ensures a file has a corresponding Tree-sitter tracking entry for analysis and parsing phases.
 *
 * @param {Object} file File record.
 * @returns {Object|null} File state entry or null when file is invalid.
 */
```

Function: `computeFileFingerprint`

```js
/**
 * Computes a stable fingerprint for a file's current content to detect when parsing results are stale.
 *
 * @param {Object} file File record.
 * @returns {string} Fingerprint string.
 */
```

Function: `runImmediateFileAnalysis`

```js
/**
 * Performs lightweight, immediate analysis for a file (symbols and reference candidates) to power early UX.
 *
 * @param {Object} file File record.
 * @returns {void}
 */
```

Function: `getFileById`

```js
/**
 * Retrieves a loaded file record by its file identifier.
 *
 * @param {string} fileId File identifier.
 * @returns {Object|null} File record or null if not found.
 */
```

Function: `enqueueFileForBackgroundParsing`

```js
/**
 * Enqueues a file for background Tree-sitter parsing, optionally prioritizing or forcing a re-parse.
 *
 * @param {Object} file File record.
 * @param {string} [reason="loaded"] Reason label influencing queue priority.
 * @param {boolean} [force=false] Whether to force re-parsing even if unchanged.
 * @returns {void}
 */
```

Function: `prioritizeFileInParseQueue`

```js
/**
 * Prioritizes a file in the Tree-sitter parse queue so it is analyzed sooner (typically for active navigation).
 *
 * @param {string} fileId File identifier.
 * @returns {void}
 */
```

Function: `scheduleTreeSitterQueueSlice`

```js
/**
 * Schedules a unit of Tree-sitter queue work using idle time when possible to minimize UI disruption.
 *
 * @returns {void}
 */
```

Function: `runTreeSitterQueueSlice`

```js
/**
 * Processes a limited slice of the Tree-sitter parse queue, updating progress and triggering finalization work.
 *
 * @param {number} runId Queue run identifier for cancellation safety.
 * @param {IdleDeadline|null} deadline Idle callback deadline, when available.
 * @returns {Promise<void>}
 */
```

Function: `runTreeSitterParseForFile`

```js
/**
 * Parses a single file with Tree-sitter (when supported) and updates cached analysis outputs and per-file state.
 *
 * @param {Object} file File record.
 * @param {number} runId Queue run identifier for cancellation safety.
 * @returns {Promise<void>}
 */
```
