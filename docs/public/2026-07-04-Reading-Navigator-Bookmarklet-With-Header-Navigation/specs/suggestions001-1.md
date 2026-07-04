---

A00 Design Note Title

---

Reading Navigator Bookmarklet - Developer Design Note

This design note defines a complete rewrite of the existing heading navigator bookmarklet into a new bookmarklet-based reading assistant. The old implementation is a reference for product behavior and lessons learned only. The new version must be designed, structured, and implemented from scratch.

The prior implementation already proved several useful ideas: a named bookmarklet function, an installer that generates a bookmarklet URL from source, heading scanning, a floating Shadow DOM panel, nearby-heading navigation, click-to-heading jumps, rescan, drag, resize, theme, contrast, opacity, and font controls. Those results inform the new design, but the new code must not be treated as an incremental patch over the old code. 

---

B00 Product Purpose

---

The new bookmarklet is a generic reading-position assistant for long web pages.

Its purpose is to help the user keep and restore reading context on article-like pages, documentation pages, essays, reference pages, and other long-form browser content.

The tool must answer these questions while the user reads:

| Question                               | Required answer from the tool                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Where am I in this document?           | Current heading path, current segment, current scroll area, and current reading state.                      |
| What have I probably read?             | A visual and computed state for segments with enough dwell-time evidence.                                   |
| What did I only skim or pass over?     | A separate visual and computed state for fast-passed or lightly seen segments.                              |
| Where was I last meaningfully reading? | A persisted restore target based on focused dwell time, not raw scroll position alone.                      |
| How do I return there?                 | A generic "Jump to last reading position" action, with restore confidence and a temporary visual highlight. |
| What remains unread?                   | A minimap or heatmap showing unread, seen, skimmed, read, active, and last-reading regions.                 |

The tool must not encode features for one specific browser, operating system, read-aloud feature, text-to-speech feature, vendor, or third-party product. Any workflow that requires returning to a prior reading area must be handled by the generic restore feature.

The core phrase in the UI should be "last reading position" or "last meaningful reading position". The UI must not contain vendor-specific labels such as "Read Aloud position".

---

C00 Non-Goals

---

The tool is not a browser extension.

The tool is not a replacement for browser history, native scroll restoration, or text-to-speech controls.

The tool does not control external reading tools.

The tool does not store full article text.

The tool does not send reading data to a server by default.

The tool does not claim to know with certainty that the user read a segment. It only computes a probable reading state from viewport exposure, dwell time, focus, idle status, and scroll behavior.

The tool does not need perfect semantic extraction in version 1. It needs a practical segmentation model that works well on common long-form pages and degrades safely.

The tool must not add noticeable lag to reading, scrolling, or text selection.

---

D00 Rewrite Decision

---

This is a complete rewrite.

The prior code may be used to identify existing behavior and acceptance expectations. The new code must not be organized as a modification of the old monolithic function.

The new codebase must be modular during development.

The development source must use JavaScript modules.

The development source must use plain JavaScript only.

The runtime UI must be self-contained.

The runtime UI must be injected into the current page.

The runtime UI must be isolated from page styles as much as practical.

The runtime UI must not require a framework.

The runtime UI must not require a browser extension.

The runtime UI must not require an account, service login, or backend to function.

The build process must use Bun to bundle the modules into bookmarklet-ready artifacts.

---

E00 High-Level Architecture

---

The project has three layers.

| Layer              | Purpose                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Development source | Modular JavaScript files, readable names, tests or fixtures where practical, no minification as the primary source.                                                 |
| Build output       | Bun-generated browser bundle, plus bookmarklet URL output or hosted-loader output.                                                                                  |
| Runtime app        | A self-contained injected reading assistant running in the current page with its own Shadow DOM UI, state, sampler, segment model, persistence, and restore engine. |

The runtime app has these main subsystems:

```txt
Bookmarklet entry
    |
    v
Bootstrap
    |
    +--> Page identity
    +--> Shadow host
    +--> App shell
    +--> Content root detector
    +--> Heading index
    +--> Segmenter
    +--> Geometry cache
    +--> Reading tracker
    +--> Progress store
    +--> Restore engine
    +--> Minimap
    +--> Overlay markers
    +--> Performance scheduler
    +--> Lifecycle manager
```

The bookmarklet entry must be small and robust. It must load or execute the app, then let the app control its own lifecycle.

The runtime app must have one authoritative app state object. Individual modules may own internal caches, but user-facing reading state must flow through a central state model so UI, persistence, restore, and debug output do not diverge.

---

F00 Distribution And Bookmarklet Loading

---

The project must support a clean development structure and a practical install path.

The development source must be split into modules.

The build must produce at least one browser-executable bundle.

The install page must produce a draggable bookmarklet link.

The preferred implementation should support two build modes:

| Build mode                | Description                                                          | Use case                                                                     |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Hosted loader bookmarklet | Bookmarklet injects a script tag pointing to the built bundle.       | Easier updates, smaller bookmarklet URL, practical daily use.                |
| Inline bundle bookmarklet | Bookmarklet contains the full bundled code in the `javascript:` URL. | More self-contained, useful when hosted loading is not desired or available. |

The hosted loader must be treated as the normal installation path unless testing proves it is blocked too often on target pages.

The inline bundle must be treated as a fallback path because bookmarklet URL length can become a practical limit.

The build must make the difference explicit. It must not leave the developer guessing which artifact is installed.

Example build outputs:

```txt
dist/
  reading-navigator.bundle.js
  reading-navigator.bundle.min.js
  reading-navigator.loader-bookmarklet.txt
  reading-navigator.inline-bookmarklet.txt
  reading-navigator.inline-bookmarklet.pretty.txt
  manifest.json
```

The source must remain readable. The distributable bundle may be minified, but the developer-facing source must not depend on reading minified output.

The installer must show the generated bookmarklet length for both hosted and inline variants.

The app must expose a visible version in debug UI and persisted records.

---

G00 Runtime Lifecycle

---

The bookmarklet must have deterministic lifecycle behavior.

When the bookmarklet is clicked for the first time on a page, it must start the app.

When the bookmarklet is clicked again on the same page and the app is open, the default behavior should toggle the UI visibility, not necessarily destroy all tracking state.

The close action inside the panel must stop tracking, detach listeners, disconnect observers, flush pending state if persistence is enabled, and remove the injected UI.

The app must support these runtime states:

| State          | Meaning                                                            |
| -------------- | ------------------------------------------------------------------ |
| `booting`      | The app is initializing modules and reading stored state.          |
| `ready`        | The app is initialized and can track or restore.                   |
| `tracking`     | The app is actively sampling reading position.                     |
| `paused`       | The user paused tracking. Navigation and restore remain available. |
| `idle`         | The user appears inactive. Tracking is reduced or stopped.         |
| `hidden`       | The tab is hidden. Dwell time must not accumulate.                 |
| `session-only` | Persistence is unavailable or disabled.                            |
| `closing`      | The app is detaching and flushing state.                           |
| `failed`       | Initialization failed in a recoverable or displayed way.           |

Lifecycle events must be centralized. Modules must not independently attach global listeners without registering cleanup with the lifecycle manager.

Required cleanup targets include scroll listeners, resize listeners, pointer listeners, keyboard listeners, visibility listeners, focus listeners, mutation observers, timers, scheduled tasks, and overlay elements.

---

H00 Runtime Isolation

---

The app must inject a host element into the page.

The host element must use a stable ID or data attribute so the app can detect an existing instance.

The primary UI must run inside Shadow DOM.

The Shadow DOM mode may be `open` for development and debugging. If a later build supports `closed`, that must be a deliberate separate decision.

The Shadow DOM stylesheet must start from an isolation baseline. The UI should not inherit page fonts, line heights, button styles, or colors unless explicitly intended.

The app must not use global CSS selectors that target page content except for controlled overlay markers.

The app must not add global styles that could affect the host page.

The app must not mutate page elements except for temporary, reversible overlay markers and generated IDs only when the feature explicitly permits it.

The first implementation should avoid assigning IDs to page content unless necessary. For restore anchors, prefer non-mutating anchor metadata over writing generated IDs into the document.

---

I00 Existing Behavior To Preserve As Product Behavior

---

The new tool must preserve the useful behavior from the old heading navigator.

It must scan headings from `h1` through `h6`.

It must ignore hidden or non-rendered headings.

It must normalize heading text.

It must show current heading context.

It must show nearby headings above and below the current context.

It must allow click-to-heading navigation.

It must provide a manual rescan.

It must use a floating panel.

It must allow moving the panel.

It must allow resizing the panel.

It must include close behavior.

It must provide readable UI on both light and dark pages.

It must have a high-contrast or stronger-contrast option.

It must provide opacity and font-size controls unless these are replaced by a better accessibility panel.

It must show an empty state when no usable headings or readable segments are found.

It must avoid injecting untrusted page text as HTML. Page-derived text must be assigned with `textContent`, not `innerHTML`.

---

J00 New Core Feature Summary

---

The rewrite adds these core capabilities.

| Feature                      | Required behavior                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| Readable root detection      | Find the main content area instead of scanning the entire page blindly.                   |
| Document segmentation        | Divide readable content into trackable segments.                                          |
| Geometry cache               | Store segment positions and update them only when needed.                                 |
| Viewport sampling            | Track which segments are visible and active over time.                                    |
| Active reading band          | Treat the middle reading zone as more meaningful than the full viewport.                  |
| Dwell-time tracking          | Accumulate time spent on segments, weighted by visibility and active-band overlap.        |
| Scroll-speed filtering       | Do not mark fast-passed content as read.                                                  |
| Idle and visibility gating   | Do not count time when the user is away or the tab is hidden.                             |
| Segment state classification | Classify segments as unseen, seen, skimmed, active, probably read, reread, or last focus. |
| Local progress storage       | Persist compact reading progress per page.                                                |
| Last meaningful position     | Store the best restore target based on focused dwell time.                                |
| Manual mark                  | Let the user mark a position explicitly.                                                  |
| Generic restore              | Jump to the last reading position without referencing specific third-party tools.         |
| Restore confidence           | Tell the user whether the restore target is exact or approximate.                         |
| Minimap or heatmap           | Show a compact visual map of reading progress.                                            |
| Heading progress integration | Show read state summarized by heading section.                                            |
| Performance scheduler        | Prevent scanning, sampling, rendering, and saving from competing aggressively.            |

---

K00 Page Identity

---

The app must identify the page so progress can be restored after reload.

The page key must be deterministic.

The page key must not include obvious tracking noise.

The page key must not rely only on document title.

The page key must not rely only on scroll height.

The primary key input should be normalized URL.

The secondary identity inputs should help detect mismatches.

Suggested normalized URL rules:

| Input                        | Rule                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| Protocol                     | Keep.                                                              |
| Hostname                     | Keep, lowercased.                                                  |
| Port                         | Keep only if non-default.                                          |
| Pathname                     | Keep. Normalize repeated slashes where safe.                       |
| Hash                         | Drop by default. Keep only if route detection marks it meaningful. |
| Query                        | Keep meaningful parameters. Drop tracking parameters.              |
| `utm_*`                      | Drop.                                                              |
| `fbclid`, `gclid`, `msclkid` | Drop.                                                              |
| Empty query                  | Omit.                                                              |

The app must compute an identity object, not just a string.

Example identity object:

```js
const pageIdentity = {
  version: 1,
  key: "rn:v1:https://example.com/articles/deep-dive",
  normalizedUrl: "https://example.com/articles/deep-dive",
  originalUrl: window.location.href,
  origin: window.location.origin,
  pathname: window.location.pathname,
  title: document.title || "",
  createdAt: Date.now(),
  contentFingerprint: null,
  headingFingerprint: null,
};
```

The content fingerprint must be weak and privacy-preserving. It should use structure and hashes, not stored text.

The heading fingerprint can be computed from normalized heading levels and short hashes of heading text.

The content fingerprint can be computed from segment type counts, approximate text lengths, and short hashes.

The app must store the fingerprint with progress.

On restore, if the stored fingerprint is very different from the current fingerprint, the UI must show a warning such as "Saved progress may belong to an older version of this page."

---

L00 Readable Root Detection

---

The app must detect the most likely content root before segmentation.

It must not blindly segment every paragraph in the entire document if a narrower article root exists.

The root detector must score candidate containers.

Candidate roots include `article`, `main`, `[role="main"]`, and large content containers.

The score should consider paragraph count, heading count, text density, visible height, link density, and whether the element is inside obvious non-content areas.

The detector should avoid `nav`, `header`, `footer`, `aside`, modal dialogs, cookie banners, comment sections, and recommendation lists where possible.

The detector must produce a result object.

Example:

```js
const contentRootResult = {
  root: articleElement,
  confidence: "high",
  reason: "article element with headings and paragraph density",
  fallbackUsed: false,
};
```

If no good root exists, the app may use `document.body`, but the UI should show lower confidence in debug mode.

The root detector must ignore the bookmarklet host element.

The root detector must run on startup, explicit rescan, and confirmed route/content change.

The root detector must not run during normal sampling.

---

M00 Heading Index

---

The heading index is a first-class subsystem.

The app must collect visible headings inside the readable root.

If readable root detection fails and `document.body` is used, headings should still be collected from the root but the app must avoid headings inside the bookmarklet UI.

Each heading record must include a runtime element reference, heading level, normalized text, top and bottom coordinates, heading path, and anchor candidates.

Example heading record:

```js
const heading = {
  id: "h_12",
  element: el,
  level: 2,
  text: "Adding props",
  textHash: "a91fc2",
  top: 1240,
  bottom: 1288,
  path: ["Article Title", "Adding props"],
  anchor: {
    elementId: el.id || null,
    domPath: "main>section:nth-of-type(3)>h2:nth-of-type(1)",
  },
};
```

The heading path must be computed by walking backward through prior headings and selecting parent headings with lower heading levels.

The current heading should be the nearest heading above the active reading reference point.

The active reading reference point should default to 35 percent from the top of the viewport or the center of the active reading band. This value must be configurable internally.

The heading index must support binary lookup by vertical coordinate.

The heading index must expose section ranges. A section starts at a heading and ends before the next heading of the same or higher level, or at the end of the readable root.

---

N00 Document Segmentation

---

The app must divide the readable root into segments.

A segment is the smallest unit used for reading-state tracking, minimap display, and restore targeting.

Segments must be based on visible content blocks, not scroll percentages alone.

Candidate elements include headings, paragraphs, list items, blockquotes, preformatted code blocks, figures, tables, and content sections.

The segmenter must reject invisible elements.

The segmenter must reject elements with negligible dimensions unless they contain meaningful visible text or media.

The segmenter must reject elements inside the bookmarklet UI.

The segmenter must prefer readable block elements over deeply nested inline nodes.

The segmenter must avoid creating excessive micro-segments.

The segmenter must produce stable segment IDs for the current content version.

Segment IDs may be derived from segment order plus structural context. They must not depend on random values.

Example segment record:

```js
const segment = {
  id: "s_00042",
  element: paragraphEl,
  type: "paragraph",
  top: 2140,
  bottom: 2288,
  height: 148,
  scrollStartRatio: 0.276,
  scrollEndRatio: 0.295,
  headingId: "h_00007",
  headingPath: ["Web Components", "Adding props"],
  sectionIndex: 4,
  localIndex: 2,
  textLengthBucket: "medium",
  anchors: {
    elementId: null,
    closestHeadingId: "props",
    headingPathHash: "f23ba1",
    domPath: "article>section:nth-of-type(4)>p:nth-of-type(2)",
    textHash: "be19cc",
    scrollRatio: 0.276,
  },
};
```

Segment type values must be explicit.

Required segment types:

| Type            | Meaning                                                           |
| --------------- | ----------------------------------------------------------------- |
| `heading`       | `h1` through `h6`.                                                |
| `paragraph`     | Readable paragraph block.                                         |
| `list-item`     | Individual list item or grouped list items.                       |
| `code`          | `pre`, code block, or large code-like region.                     |
| `blockquote`    | Quoted block.                                                     |
| `figure`        | Figure, image with caption, diagram, or media block.              |
| `table`         | Table or table-like readable block.                               |
| `section`       | Virtual section segment when no better child segmentation exists. |
| `unknown-block` | Visible block that is probably readable but not classified.       |

The segmenter must group small adjacent elements.

A small text segment may be grouped if its visible height is below a threshold and it is adjacent to another compatible segment under the same heading.

A compatible segment means same heading section, same general content flow, and no strong semantic boundary between the segments.

The segmenter must split very large blocks virtually.

A virtual split is allowed when one DOM element is taller than the viewport or contains many lines. The virtual segments share the same element but have different coordinate ranges.

Virtual segments must have IDs that include the parent segment ID and virtual index.

Example:

```js
const virtualSegment = {
  id: "s_00018_v02",
  parentId: "s_00018",
  element: preEl,
  type: "code",
  top: 4200,
  bottom: 4800,
  virtual: true,
  virtualIndex: 2,
};
```

The first version may implement virtual splitting only for very tall elements, not every paragraph.

---

O00 Geometry Cache

---

The geometry cache stores segment and heading coordinates.

The tracker must use cached coordinates during normal sampling.

The app must not call `querySelectorAll`, `getClientRects`, or `getBoundingClientRect` for all segments during every sample.

The geometry cache must refresh on startup.

The geometry cache must refresh after explicit rescan.

The geometry cache must refresh after window resize.

The geometry cache must refresh after meaningful content mutation, but only after debounce.

The geometry cache must refresh after likely layout shifts, such as images loading inside the readable root.

The geometry cache must mark itself dirty rather than immediately recomputing in the same event callback.

The geometry refresh must batch reads separately from writes.

The geometry refresh must not update the UI repeatedly during the same pass.

Pseudo-code:

```js
function refreshGeometry() {
  scheduler.runReadPhase(() => {
    const scrollTop = getScrollTop();

    for (const heading of headings) {
      const rect = heading.element.getBoundingClientRect();
      heading.top = rect.top + scrollTop;
      heading.bottom = rect.bottom + scrollTop;
    }

    for (const segment of segments) {
      const rect = segment.element.getBoundingClientRect();
      segment.top = rect.top + scrollTop;
      segment.bottom = rect.bottom + scrollTop;
      segment.height = Math.max(0, segment.bottom - segment.top);
    }
  });

  state.geometryVersion += 1;
  state.geometryDirty = false;
}
```

The actual implementation must avoid layout thrash. It must not interleave DOM writes into the loop that reads layout.

---

P00 Viewport Sampling

---

The sampler observes the viewport and updates reading statistics.

The sampler must not perform full segmentation.

The sampler must not perform full heading scans.

The sampler must not rebuild the panel.

The sampler must read current scroll position, viewport height, focus state, visibility state, and cached segment coordinates.

The default sampling interval should be 500 ms.

The interval may be reduced to 250 ms only if testing shows no jank and the additional precision is useful.

The interval must slow down or stop when the user is idle, the tab is hidden, the window is unfocused, tracking is paused, or the app is closing.

The sampler must use `performance.now()` for elapsed runtime calculations.

The sampler must use `Date.now()` for persisted wall-clock timestamps.

The sampler must compute an active reading band.

Default active reading band:

```js
const bandTop = viewportTop + viewportHeight * 0.25;
const bandBottom = viewportTop + viewportHeight * 0.75;
```

The active reading band must be configurable internally.

The sampler must compute at least these values:

| Value                    | Meaning                                            |
| ------------------------ | -------------------------------------------------- |
| `viewportTop`            | Absolute top coordinate of viewport.               |
| `viewportBottom`         | Absolute bottom coordinate of viewport.            |
| `viewportCenter`         | Absolute center coordinate of viewport.            |
| `bandTop`                | Absolute top coordinate of active reading band.    |
| `bandBottom`             | Absolute bottom coordinate of active reading band. |
| `deltaMs`                | Time since last valid sample.                      |
| `scrollDeltaPx`          | Absolute scroll movement since last sample.        |
| `scrollVelocityPxPerSec` | Scroll speed estimate.                             |

The sampler must find intersecting segments from cached geometry.

For version 1, a simple binary search plus nearby scan is acceptable.

The app should maintain segments sorted by `top`.

Pseudo-code:

```js
function sampleViewport() {
  if (!tracker.canAccumulate()) {
    tracker.recordNonAccumulatingSample();
    return;
  }

  const now = performance.now();
  const deltaMs = now - tracker.lastSampleAt;

  if (deltaMs <= 0 || deltaMs > config.maxSampleGapMs) {
    tracker.resetSampleClock(now);
    return;
  }

  const viewport = getViewportSnapshot();
  const candidates = geometry.findSegmentsNearRange(
    viewport.top,
    viewport.bottom
  );

  for (const segment of candidates) {
    const visibleRatio = intersectionRatio(segment.top, segment.bottom, viewport.top, viewport.bottom);
    const activeRatio = intersectionRatio(segment.top, segment.bottom, viewport.bandTop, viewport.bandBottom);

    tracker.applyExposure(segment.id, {
      deltaMs,
      visibleRatio,
      activeRatio,
      scrollVelocity: viewport.scrollVelocityPxPerSec,
      wallClock: Date.now(),
    });
  }

  tracker.lastSampleAt = now;
}
```

The sampler must not accumulate dwell time for long gaps. If a laptop sleeps or the tab is frozen, the next sample must reset timing instead of adding a huge duration.

Suggested `maxSampleGapMs` is 5000 ms.

---

Q00 Scroll-Speed Classification

---

Scroll velocity must affect reading-state updates.

Fast scrolling must not mark content as read.

The tracker must distinguish slow reading movement from scanning and jumps.

Suggested initial thresholds:

| Velocity            | Meaning                 | Tracking effect                                        |
| ------------------- | ----------------------- | ------------------------------------------------------ |
| 0 to 80 px/s        | Stable or slow reading. | Full dwell credit.                                     |
| 80 to 300 px/s      | Normal movement.        | Partial dwell credit.                                  |
| 300 to 1200 px/s    | Skimming.               | Visible credit only, little or no active dwell credit. |
| More than 1200 px/s | Jump or fast pass.      | Do not mark as read. Increment fast-pass evidence.     |

These values are defaults, not permanent truths. They must be configuration values.

A wheel scroll or Page Down movement may create a high instantaneous velocity. The tracker should avoid overreacting to one sample. It should use a short moving average or classify only after enough evidence.

When velocity is high, the app may still update the current viewport marker and raw scroll position.

When velocity is high, the app must not update the last meaningful reading position.

---

R00 Focus, Visibility, And Idle Gating

---

The tracker must not count reading time when the user is not plausibly reading.

The document visibility state must gate accumulation.

If `document.hidden` is true, dwell time must not accumulate.

If the window is not focused, dwell time should not accumulate by default.

A configuration option may allow reduced accumulation while unfocused later, but version 1 should not count unfocused time.

Idle detection must prevent a page left open from being counted as read.

Idle signals include scroll events, pointer movement, keydown, pointerdown, focus, and visibility change.

The app must track last user activity time.

Suggested idle behavior:

| Time since activity  | State         | Tracking effect                        |
| -------------------- | ------------- | -------------------------------------- |
| 0 to 20 seconds      | Active        | Full accumulation if other gates pass. |
| 20 to 60 seconds     | Possibly idle | Reduced or cautious accumulation.      |
| More than 60 seconds | Idle          | No dwell accumulation.                 |

The exact thresholds must be configurable.

The UI must show `Idle` when idle gating is active.

When the user becomes active again, the sampler must reset its sample clock to avoid counting the idle gap.

---

S00 Reading Statistics

---

Each segment must have a stats object.

The stats object must be separate from geometry.

Geometry changes must not erase reading stats.

Required segment stats:

```js
const segmentStats = {
  segmentId: "s_00042",
  firstSeenAt: null,
  lastSeenAt: null,
  firstActiveAt: null,
  lastActiveAt: null,
  totalVisibleMs: 0,
  totalActiveMs: 0,
  totalFocusedMs: 0,
  centerlineMs: 0,
  visitCount: 0,
  activeVisitCount: 0,
  maxVisibleRatio: 0,
  maxActiveRatio: 0,
  fastPassCount: 0,
  lastVelocityClass: "none",
  state: "unseen",
  stateUpdatedAt: null,
};
```

`firstSeenAt`, `lastSeenAt`, `firstActiveAt`, and `lastActiveAt` must use wall-clock timestamps from `Date.now()`.

Duration values must use milliseconds.

The tracker must update `visitCount` when a segment transitions from not visible to visible.

The tracker must update `activeVisitCount` when a segment transitions from not active to active.

The tracker must update `fastPassCount` only when the segment is crossed or exposed during a high-velocity sample.

The tracker must maintain a separate current session stats object.

Session stats must include session start time, active tracked time, paused time, idle time, hidden time, and count of samples.

---

T00 Segment States

---

The app must derive segment states from stats.

Segment states must be explicit strings.

Required states:

| State           | Meaning                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unseen`        | The segment has not entered the viewport.                                                                                                                |
| `seen`          | The segment was visible, but there is not enough evidence of reading.                                                                                    |
| `skimmed`       | The segment was passed or visited too quickly to count as read.                                                                                          |
| `active`        | The segment is currently inside the active reading band.                                                                                                 |
| `probably-read` | The segment has enough dwell evidence to count as probably read.                                                                                         |
| `reread`        | The segment has meaningful dwell evidence across multiple visits after already being probably read.                                                      |
| `last-focus`    | The segment is the current last meaningful reading position.                                                                                             |
| `manual-mark`   | The segment was explicitly marked by the user. This may coexist with other states in the data model, but the UI may display it as a top-priority marker. |

The state classifier must not rely on raw scroll position alone.

The state classifier must be deterministic.

The state classifier must be testable with synthetic stats.

Suggested version 1 threshold logic:

```js
function classifySegment(segment, stats, context) {
  if (context.currentSegmentId === segment.id) return "active";
  if (context.manualMarkSegmentId === segment.id) return "manual-mark";
  if (context.lastFocusSegmentId === segment.id) return "last-focus";

  const thresholdMs = getReadThresholdMs(segment);

  if (stats.totalFocusedMs >= thresholdMs && stats.activeVisitCount > 1) {
    return "reread";
  }

  if (stats.totalFocusedMs >= thresholdMs) {
    return "probably-read";
  }

  if (stats.fastPassCount > 0 && stats.totalActiveMs < thresholdMs * 0.35) {
    return "skimmed";
  }

  if (stats.totalVisibleMs > 0) {
    return "seen";
  }

  return "unseen";
}
```

`manual-mark` and `last-focus` should be treated as overlays or flags internally so that the underlying read state is not lost.

Recommended internal model:

```js
const segmentViewState = {
  readState: "probably-read",
  isCurrent: false,
  isLastFocus: true,
  isManualMark: false,
};
```

---

U00 Read Thresholds

---

Read thresholds must vary by segment type and size.

Short segments must not require the same dwell time as long segments.

Long code blocks, tables, and diagrams must not be marked as read after only a tiny exposure.

Suggested initial threshold function:

```js
function getReadThresholdMs(segment) {
  const baseByType = {
    heading: 1000,
    paragraph: 3500,
    "list-item": 2500,
    blockquote: 4000,
    code: 8000,
    figure: 5000,
    table: 9000,
    section: 6000,
    "unknown-block": 4000,
  };

  const base = baseByType[segment.type] || 4000;
  const heightFactor = Math.min(2.5, Math.max(0.75, segment.height / 260));

  return Math.round(base * heightFactor);
}
```

The threshold function must be internal configuration in version 1.

The UI must avoid saying "read" as certainty. It should prefer "Probably read" for computed read state.

The minimap legend must distinguish "Probably read" from "Seen" and "Skimmed".

---

V00 Last Meaningful Reading Position

---

The last meaningful reading position is the primary restore target.

It must not be identical to raw scroll position.

It must be based on a segment with enough active-band or focused dwell evidence.

It must not update while scrolling fast.

It must not update while idle.

It must not update while hidden.

It must not update while paused.

It must not update from a segment that is only briefly visible.

Suggested rule:

```js
function shouldPromoteToLastFocus(segment, stats, sampleContext) {
  if (!sampleContext.canAccumulate) return false;
  if (sampleContext.velocityClass === "fast") return false;
  if (sampleContext.velocityClass === "jump") return false;
  if (stats.totalFocusedMs < config.lastFocusMinFocusedMs) return false;
  if (stats.maxActiveRatio < config.lastFocusMinActiveRatio) return false;
  return true;
}
```

Suggested defaults:

| Config                    | Value                             |
| ------------------------- | --------------------------------- |
| `lastFocusMinFocusedMs`   | 2000 ms                           |
| `lastFocusMinActiveRatio` | 0.25                              |
| `lastFocusVelocityMax`    | Normal movement, not skim or jump |

When the last meaningful position changes, the app must update in-memory state and schedule a debounced save.

The UI must show the last meaningful position in the panel.

The minimap must show the last meaningful position.

The restore card must use the last meaningful position as the primary target unless a manual mark exists.

---

W00 Manual Mark

---

The app must include a manual mark feature.

The control label should be `Mark this spot`.

Manual mark means the user explicitly chooses the current reading area as a restore target.

Manual mark should override automatic last meaningful position for primary restore while it exists.

Manual mark must be persisted.

Manual mark must be shown in the minimap.

Manual mark must be shown in the restore card.

Manual mark must have a clear/remove action.

Manual mark must not erase automatic tracking data.

Manual mark should store the current best segment, current heading context, wall-clock timestamp, and anchor candidates.

If the current viewport contains multiple active segments, the mark should use the segment nearest the active band center.

---

X00 Restore Engine

---

The restore engine resolves a saved target into a current page location.

It must support exact and approximate restore.

It must expose confidence.

It must never assume the page structure is unchanged.

It must not auto-scroll by default on startup.

The primary restore button must be `Jump to last reading position`.

If a manual mark exists, the restore card may show `Jump to marked position` as the primary action and `Jump to last reading position` as a secondary action.

The restore engine must use a fallback chain.

Fallback order:

| Step | Anchor                                    | Confidence if matched              |
| ---- | ----------------------------------------- | ---------------------------------- |
| 1    | Existing element ID                       | High                               |
| 2    | Closest heading ID plus segment offset    | High or medium                     |
| 3    | Heading hierarchy path plus segment index | Medium                             |
| 4    | DOM path from readable root               | Medium or low                      |
| 5    | Text fingerprint hash                     | Medium if unique, low if ambiguous |
| 6    | Approximate scroll ratio                  | Low                                |

The restore engine must return a structured result.

Example:

```js
const restoreResult = {
  ok: true,
  confidence: "medium",
  method: "heading-path-plus-index",
  targetSegmentId: "s_00042",
  targetElement: paragraphEl,
  scrollTop: 2180,
  message: "Restored near the last reading position.",
};
```

If restore fails, the result must be explicit.

```js
const restoreResult = {
  ok: false,
  confidence: "none",
  method: "none",
  message: "Saved progress exists, but the target could not be found on this page.",
};
```

After a restore jump, the app must briefly highlight the restored target.

The highlight must not change layout.

The highlight must not block text selection.

The highlight must respect reduced motion preferences.

The restore action should scroll the target into a comfortable reading position, not necessarily the very top of the viewport.

Suggested scroll behavior:

```js
targetElement.scrollIntoView({
  behavior: prefersReducedMotion() ? "auto" : "smooth",
  block: "center",
  inline: "nearest",
});
```

If `scrollIntoView` fails or is unavailable, the app must fall back to `window.scrollTo`.

---

Y00 Restore Card UX

---

The expanded panel must show restore state.

If saved progress exists, the card must show:

| Field          | Required content                                                |
| -------------- | --------------------------------------------------------------- |
| Last saved     | Relative or absolute time.                                      |
| Last context   | Nearest heading path or best available label.                   |
| Progress       | Approximate probably-read percentage and current segment count. |
| Confidence     | Exact, likely, approximate, or unavailable.                     |
| Primary action | `Jump to last reading position` or `Jump to marked position`.   |

If saved progress does not exist, the card should not take much space. It can show `No saved progress for this page` in a secondary area or debug view.

If storage is unavailable, the card must show that restore after reload is unavailable.

Restore confidence labels should be user-facing, not internal.

| Internal | UI label            |
| -------- | ------------------- |
| `high`   | Exact or near exact |
| `medium` | Likely              |
| `low`    | Approximate         |
| `none`   | Not available       |

The restore card must not mention any external tool or product.

---

Z00 Minimap And Heatmap

---

The app must include a compact visual representation of the readable page.

The minimap must show the full readable document, not necessarily the full browser document including navigation, footers, comments, and unrelated content.

The minimap must be vertical.

The minimap must show current viewport position.

The minimap must show current active segment.

The minimap must show last meaningful reading position.

The minimap must show manual mark if present.

The minimap must distinguish these segment states:

| State         | Visual meaning                                 |
| ------------- | ---------------------------------------------- |
| Unseen        | Not encountered.                               |
| Seen          | Visible at some point but not enough evidence. |
| Skimmed       | Passed too quickly.                            |
| Probably read | Enough dwell evidence.                         |
| Active        | Current reading band.                          |
| Last focus    | Last meaningful reading position.              |
| Manual mark   | User-selected restore target.                  |

The minimap must not create thousands of DOM nodes on large pages.

For more than a configured number of segments, the minimap must group segments into buckets.

Suggested maximum visible minimap nodes: 300.

For pages with more than 300 segments, group by scroll range or heading section.

The minimap must update cheaply.

The minimap must not rerender every segment on every sample.

The minimap should apply state diffs.

Clicking a minimap region should jump to the corresponding segment or bucket.

Hovering a minimap region should show heading context and state when practical.

In compact mode, the minimap can be the primary visible UI.

---

AA00 Heading Navigator Integration

---

The existing heading navigator concept remains part of the new app.

The expanded panel must show a heading context section.

The heading section must show the current heading path.

The nearby headings section must show headings above and below the current heading.

Each heading row should include a progress indicator for its section.

Heading section progress should be computed from child segments.

Required heading summary values:

| Value                  | Meaning                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| Total segments         | Number of trackable segments in this heading section.            |
| Probably-read segments | Count of probably-read or reread child segments.                 |
| Seen segments          | Count of seen child segments.                                    |
| Skimmed segments       | Count of skimmed child segments.                                 |
| Unseen segments        | Count of unseen child segments.                                  |
| Last focus inside      | Whether last meaningful position is inside this heading section. |
| Manual mark inside     | Whether manual mark is inside this heading section.              |

Heading click behavior must remain simple.

Primary click on a heading row jumps to that heading.

A secondary control may jump to the last reading segment inside that heading section.

The secondary control must not make normal heading navigation ambiguous.

Example row design:

```txt
H2 Adding props                62% probably read
   Current section             Last focus inside
   [Jump heading] [Jump last in section]
```

For compactness, the real UI can reduce this to icons and a small progress bar, but the underlying state must support the full information.

---

AB00 Panel UX

---

The panel title should be `Reading Navigator`.

The panel must have expanded and compact modes.

Expanded mode must include current context, restore card, heading navigator, minimap, tracking status, and controls.

Compact mode must include the minimap rail, current status, and restore marker.

The panel must be draggable.

The panel must be resizable.

The panel must be closable.

The panel must be able to collapse to compact mode without stopping tracking.

The panel must support pause and resume.

Required controls:

| Control                         | Required behavior                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `Pause`                         | Stop dwell accumulation. Keep navigation and restore available.                           |
| `Resume`                        | Resume tracking if visibility, focus, and idle gates allow it.                            |
| `Mark this spot`                | Save current active segment as manual mark.                                               |
| `Jump to last reading position` | Restore to automatic last meaningful position.                                            |
| `Jump to marked position`       | Restore to manual mark when present.                                                      |
| `Save now`                      | Flush pending progress to storage.                                                        |
| `Clear page progress`           | Delete saved progress for current page after confirmation.                                |
| `Rescan`                        | Rebuild content root, headings, segments, and geometry while preserving compatible stats. |
| `Compact`                       | Switch to compact mode.                                                                   |
| `Expand`                        | Switch to expanded mode.                                                                  |
| `Close`                         | Stop app and remove UI.                                                                   |

Tracking status labels:

| Label          | Meaning                                   |
| -------------- | ----------------------------------------- |
| `Tracking`     | Dwell time can accumulate.                |
| `Paused`       | User paused tracking.                     |
| `Idle`         | User inactivity gate is active.           |
| `Hidden`       | Tab visibility gate is active.            |
| `Unfocused`    | Window focus gate is active.              |
| `Session only` | Persistence unavailable or disabled.      |
| `Saving`       | A save is currently scheduled or running. |
| `Saved`        | Latest meaningful state was persisted.    |

The UI must not require the user to understand implementation terms such as segment ID, anchor candidate, or geometry cache unless debug mode is enabled.

---

AC00 On-Page Markers And Highlights

---

The app may render subtle on-page overlays.

All overlays must be controlled by the bookmarklet and removed on close.

Overlays must not alter page layout.

Overlays must not cover the text in a way that blocks reading.

Overlays must not block text selection or links by default.

Required overlay types:

| Overlay                | Required behavior                                                   |
| ---------------------- | ------------------------------------------------------------------- |
| Current segment marker | Subtle marker for the segment currently in the active reading band. |
| Last reading marker    | Subtle marker showing where the app would restore.                  |
| Manual mark marker     | Distinct marker for user-selected restore point.                    |
| Restore highlight      | Temporary highlight after a jump.                                   |
| Debug active band      | Optional debug-only overlay showing active reading band.            |

The debug active band overlay must be off by default.

The restore highlight must fade or disappear after a short time.

If reduced motion is enabled, the highlight must appear and disappear without animation or with minimal transition.

---

AD00 Persistence Model

---

The app must persist progress locally.

Version 1 should use `localStorage`.

The persistence module must be isolated so the storage backend can change later.

The app must support session-only mode.

Storage writes must be debounced.

Storage writes must be compact.

Storage writes must not happen every sample.

Storage writes should happen when one of these occurs:

| Event                               | Save behavior                         |
| ----------------------------------- | ------------------------------------- |
| Last meaningful position changes    | Schedule save soon.                   |
| Manual mark changes                 | Save immediately or near immediately. |
| User clicks Save now                | Save immediately.                     |
| Segment states change significantly | Schedule save.                        |
| Page lifecycle `pagehide`           | Attempt immediate compact save.       |
| App closes                          | Attempt final save.                   |
| Periodic checkpoint                 | Save at a low frequency if dirty.     |

Suggested save debounce: 1500 ms to 3000 ms.

Suggested periodic checkpoint: every 15 to 30 seconds while dirty.

The app must never depend only on unload events, because unload and beforeunload are not reliable.

The persisted record must include schema version.

Example persisted record:

```js
const progressRecord = {
  schemaVersion: 1,
  appVersion: "0.1.0",
  page: {
    key: "rn:v1:https://example.com/articles/deep-dive",
    originalUrl: "https://example.com/articles/deep-dive?utm_source=x",
    normalizedUrl: "https://example.com/articles/deep-dive",
    title: "Deep Dive",
    contentFingerprint: "c1a0d4",
    headingFingerprint: "h8fa31",
  },
  timestamps: {
    createdAt: 1783180000000,
    lastOpenedAt: 1783180300000,
    lastSavedAt: 1783180600000,
  },
  restore: {
    lastFocus: {
      segmentId: "s_00042",
      savedAt: 1783180595000,
      headingPathHash: "f23ba1",
      headingTextHash: "a91fc2",
      segmentType: "paragraph",
      scrollRatio: 0.276,
      anchors: {
        elementId: null,
        closestHeadingId: "props",
        headingPathHash: "f23ba1",
        domPath: "article>section:nth-of-type(4)>p:nth-of-type(2)",
        textHash: "be19cc",
        scrollRatio: 0.276
      }
    },
    manualMark: null,
    lastRawScroll: {
      scrollTop: 2180,
      scrollRatio: 0.281,
      savedAt: 1783180598000
    }
  },
  segments: {
    "s_00042": {
      totalVisibleMs: 9000,
      totalActiveMs: 6200,
      totalFocusedMs: 5100,
      visitCount: 2,
      activeVisitCount: 1,
      maxVisibleRatio: 0.92,
      maxActiveRatio: 0.65,
      fastPassCount: 0,
      state: "probably-read"
    }
  }
};
```

The record must not contain full article text.

The record may contain short hashes.

The record should not contain excessive per-sample logs.

The record must be pruned or compacted for very large pages.

---

AE00 Privacy Requirements

---

The app must default to local-only storage.

The app must not send progress data anywhere.

The app must not store full article content.

The app must not store raw selected text.

The app must not store screenshots.

The app must not store page HTML.

Text fingerprints must be hashes or compact irreversible signatures.

The UI must provide a way to clear progress for the current page.

The UI should provide a way to enable session-only mode.

Session-only mode must disable persistence writes for reading progress.

If persistence fails, the app must degrade to session-only mode and show a status.

The app should include site-level cleanup later, but current-page cleanup is required in MVP.

---

AF00 Dynamic Page Handling

---

Modern pages can mutate after load. The app must handle this without causing lag.

A MutationObserver may be used, but only as an invalidation signal.

The MutationObserver callback must not rescan the page directly.

The observer must ignore the bookmarklet host and Shadow DOM.

The observer must ignore irrelevant changes where possible.

The observer must set dirty flags.

The scheduler must coalesce many mutations into one refresh.

Suggested mutation policy:

| Mutation type                            | Response                                                           |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Child nodes added inside readable root   | Mark content dirty. Debounce rescan.                               |
| Child nodes removed inside readable root | Mark content dirty. Debounce rescan.                               |
| Attribute changed on many elements       | Ignore unless it affects visibility or layout-relevant attributes. |
| Mutations outside readable root          | Ignore unless root detection confidence is low.                    |
| Mutation inside bookmarklet UI           | Always ignore.                                                     |

Suggested debounce for content rescan: 1000 ms to 3000 ms after mutation quiets.

The app must support manual Rescan as a fallback.

The app must detect route changes in single-page apps.

Route changes can be detected by wrapping or observing `history.pushState`, `history.replaceState`, `popstate`, and URL polling as a fallback.

On route change, the app must recompute page identity.

If the page identity changes, the app must load the matching progress record or start a new session.

The app must not destroy the previous state until the new content identity is confirmed.

---

AG00 Performance Requirements

---

Performance is a design requirement, not an optimization afterthought.

The app must not make reading or scrolling feel slower.

The app must not sample every animation frame.

The app must not traverse the full DOM during normal tracking.

The app must not rebuild the entire UI on every scroll event.

The app must not write localStorage on every sample.

The app must not run expensive work directly inside MutationObserver callbacks.

The app must centralize scheduling.

Performance budget targets for version 1:

| Operation         | Target                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| Normal sample     | Less than 2 ms on typical article pages.                                        |
| UI diff update    | Less than 4 ms when state changes.                                              |
| Initial scan      | Can be more expensive, but should usually stay below 100 ms on normal articles. |
| Full rescan       | Debounced and visible only if necessary.                                        |
| localStorage save | Debounced and compact.                                                          |
| Minimap update    | Diffed or bucketed, not full rebuild on every sample.                           |

These are practical targets, not hard guarantees.

The app must include debug measurements for expensive operations.

Debug mode should be able to show last scan time, last geometry refresh time, last sample time, segment count, minimap node count, and last save time.

---

AH00 Performance Scheduler

---

The scheduler coordinates expensive work.

Modules must not create independent high-frequency loops without registering them.

The scheduler must support:

| Capability       | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| Throttle         | Limit scroll or resize reaction frequency.                    |
| Debounce         | Wait for mutations or resize to settle.                       |
| Dirty flags      | Mark work needed without doing it immediately.                |
| Read phase       | Batch layout reads.                                           |
| Write phase      | Batch DOM writes.                                             |
| Idle work        | Run low-priority work when the browser is idle, if available. |
| Save queue       | Debounce localStorage writes.                                 |
| Shutdown cleanup | Cancel all timers and pending tasks.                          |

Suggested scheduler interface:

```js
const scheduler = {
  markDirty(type) {},
  scheduleSample() {},
  scheduleGeometryRefresh(reason) {},
  scheduleUiUpdate(reason) {},
  scheduleSave(reason) {},
  runReadPhase(fn) {},
  runWritePhase(fn) {},
  cancelAll() {},
};
```

`requestIdleCallback` may be used if available, but the app must not depend on it.

Fallback must use `setTimeout`.

The scheduler must prevent these tasks from running aggressively at the same time: segmentation, geometry refresh, UI update, minimap render, and storage save.

---

AI00 Lag Sources And Mitigations

---

The design must explicitly handle known lag sources.

| Lag source              | Risk                                          | Mitigation                                                                            |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Full DOM scan           | Large pages can be expensive.                 | Scan only readable root. Run on startup, rescan, route change, or debounced mutation. |
| Layout reads            | `getBoundingClientRect` can force layout.     | Batch reads. Avoid mixing reads and writes. Use cached coordinates during sampling.   |
| High-frequency sampling | CPU usage and battery drain.                  | Default 500 ms interval. Stop or slow when idle, hidden, paused, or compact.          |
| Scroll event work       | Scroll jank.                                  | Scroll events only update dirty/current flags. Sampling loop does real work later.    |
| UI rerender             | Panel jank.                                   | Diff updates. Do not rebuild full panel on every sample.                              |
| localStorage writes     | Synchronous blocking.                         | Debounce writes. Save compact records. Save only dirty state.                         |
| MutationObserver noise  | Modern pages mutate constantly.               | Use observer as dirty signal only. Debounce rescans. Ignore irrelevant mutations.     |
| Minimap DOM nodes       | Thousands of nodes can be expensive.          | Bucket segments. Cap visible nodes. Use compact rendering.                            |
| Text hashing            | Expensive and privacy-sensitive if overdone.  | Hash only anchor candidates during segmentation. Store hashes only.                   |
| Route detection         | Wrapping history incorrectly can break pages. | Wrap carefully, preserve original behavior, and fail open.                            |

The app must fail open. If a performance-sensitive feature fails, the app should disable that feature rather than break the page.

---

AJ00 UI Rendering Model

---

The UI should be component-based internally, even without a framework.

Each component should have explicit render and update behavior.

Recommended UI components:

| Component     | Responsibility                                                |
| ------------- | ------------------------------------------------------------- |
| AppShell      | Root layout, mode, title bar, close, compact/expanded switch. |
| StatusBar     | Tracking state, storage state, save state.                    |
| RestoreCard   | Saved progress and restore actions.                           |
| HeadingPanel  | Current path, nearby headings, heading progress.              |
| MinimapRail   | Heatmap, viewport marker, last-focus marker, manual mark.     |
| ControlsPanel | Pause, resume, mark, save, clear, rescan.                     |
| SettingsPanel | Font scale, opacity, contrast, theme.                         |
| DebugPanel    | Performance and state diagnostics.                            |
| OverlayLayer  | On-page markers outside Shadow DOM if required.               |

The UI must avoid full `innerHTML` replacement for frequently changing views.

For page-derived text, the UI must use `textContent`.

For static internal templates, `innerHTML` may be allowed only if the string is controlled by the app and not mixed with page content.

The UI should update from state snapshots.

Example state snapshot:

```js
const viewModel = {
  mode: "expanded",
  trackingStatus: "tracking",
  storageStatus: "saved",
  currentHeadingPath: ["Article title", "Adding props"],
  currentSegmentId: "s_00042",
  lastFocusSegmentId: "s_00040",
  manualMarkSegmentId: null,
  progress: {
    probablyReadRatio: 0.51,
    seenRatio: 0.12,
    skimmedRatio: 0.08,
    unreadRatio: 0.29,
  },
};
```

---

AK00 Accessibility And Keyboard Behavior

---

The panel must be keyboard usable.

Buttons must be real `button` elements.

Interactive minimap regions must be keyboard reachable only if doing so remains usable. If not, provide equivalent controls elsewhere.

The panel must expose meaningful labels.

The app must not trap focus unless a modal confirmation is open.

The close button must be keyboard reachable.

The destructive clear action must require confirmation.

The restore result must be announced in an ARIA live region.

Tracking status changes may be announced politely, but not so often that they become noisy.

The app must respect `prefers-reduced-motion`.

When reduced motion is enabled, smooth scrolling should be disabled or replaced with instant scrolling.

The UI must remain usable at higher font scales.

The UI must support high contrast mode.

The overlay markers must not be the only way to understand state. The panel must also show the state textually.

---

AL00 Keyboard Shortcuts

---

Keyboard shortcuts are optional for MVP but should be designed.

Shortcuts must not override common page shortcuts aggressively.

Shortcuts should be disabled while the user is typing in inputs, textareas, editable elements, or code editors.

Suggested shortcuts:

| Action                        | Candidate shortcut                |
| ----------------------------- | --------------------------------- |
| Toggle panel                  | Alt+R                             |
| Jump to last reading position | Alt+Shift+R                       |
| Mark this spot                | Alt+M                             |
| Pause or resume tracking      | Alt+P                             |
| Compact or expand             | Alt+C                             |
| Close                         | Escape when panel focus is inside |

Shortcuts must be configurable internally.

Shortcuts must be listed in a help or debug panel if implemented.

No shortcut should be required to use the product.

---

AM00 Error Handling

---

The app must handle failure cases explicitly.

If Shadow DOM is unavailable, the app should show a minimal fallback panel or fail with a clear message.

If readable root detection fails, the app should fall back to body and show lower confidence in debug mode.

If no headings are found, the app should still segment paragraphs and support progress tracking.

If no segments are found, the app should show "No readable segments found on this page."

If storage is unavailable, the app should enter session-only mode.

If restore target cannot be found, the app should offer approximate scroll restore if available.

If approximate restore is unavailable, the restore card should show that saved progress cannot be used.

If the page changes during tracking, the app should preserve compatible stats where possible and avoid crashing.

All event handlers must be defensive.

The app must not throw uncaught errors during normal reading.

Debug mode may show captured errors.

---

AN00 Data Model Summary

---

The app state should be explicit and serializable where practical.

Top-level state shape:

```js
const appState = {
  app: {
    version: "0.1.0",
    instanceId: "rn_1783180000000_abcd",
    mode: "expanded",
    lifecycle: "tracking",
    startedAt: 1783180000000,
  },
  page: {
    identity: null,
    contentRoot: null,
    rootConfidence: "unknown",
  },
  headings: [],
  segments: [],
  statsBySegmentId: new Map(),
  restore: {
    lastFocus: null,
    manualMark: null,
    lastRawScroll: null,
    lastRestoreResult: null,
  },
  tracking: {
    pausedByUser: false,
    hidden: false,
    focused: true,
    idle: false,
    lastActivityAt: 1783180000000,
    lastSampleAt: 0,
    sampleCount: 0,
  },
  performance: {
    geometryDirty: false,
    contentDirty: false,
    lastScanMs: 0,
    lastSampleMs: 0,
    lastRenderMs: 0,
    lastSaveMs: 0,
  },
  storage: {
    available: true,
    mode: "persistent",
    dirty: false,
    lastSavedAt: null,
  },
};
```

Serializable persisted state must not include DOM elements, maps, functions, observers, timers, or cyclic references.

Runtime state may include DOM references.

The persistence module must convert runtime state to a compact plain object before saving.

---

AO00 Module Plan

---

The codebase should use modules with clear responsibilities.

Recommended module files:

```txt
src/
  main.js
  bookmarklet-entry.js
  config.js
  app/createApp.js
  app/lifecycle.js
  app/state.js
  app/events.js
  identity/pageIdentity.js
  identity/urlNormalize.js
  content/contentRoot.js
  content/headingIndex.js
  content/segmenter.js
  content/anchors.js
  content/fingerprint.js
  geometry/geometryCache.js
  tracking/viewportSampler.js
  tracking/readingTracker.js
  tracking/stateClassifier.js
  tracking/idleTracker.js
  restore/restoreEngine.js
  restore/scrollToTarget.js
  storage/progressStore.js
  storage/serialize.js
  ui/shadowHost.js
  ui/appShell.js
  ui/statusBar.js
  ui/restoreCard.js
  ui/headingPanel.js
  ui/minimapRail.js
  ui/controlsPanel.js
  ui/settingsPanel.js
  ui/debugPanel.js
  ui/styles.css.js
  overlays/overlayMarkers.js
  scheduler/performanceScheduler.js
  utils/dom.js
  utils/math.js
  utils/time.js
  utils/hash.js
```

Every module must have one primary responsibility.

Modules that read the DOM must be clearly separated from modules that write the DOM.

The tracker must not import UI components.

The UI may consume state snapshots but should not own tracking logic.

The restore engine may use segment, anchor, and geometry modules, but it should not know about the panel implementation.

---

AP00 Configuration

---

The app must centralize configuration.

Configuration should be plain JavaScript.

Example:

```js
export const CONFIG = {
  appName: "Reading Navigator",
  hostId: "reading-navigator-bookmarklet-host",
  sampleIntervalMs: 500,
  maxSampleGapMs: 5000,
  activeBandTopRatio: 0.25,
  activeBandBottomRatio: 0.75,
  idleSoftMs: 20000,
  idleHardMs: 60000,
  saveDebounceMs: 2000,
  periodicSaveMs: 20000,
  mutationDebounceMs: 1500,
  maxMinimapNodes: 300,
  maxStoredRecords: 200,
  maxRecordAgeDays: 90,
  velocity: {
    slowMaxPxPerSec: 80,
    normalMaxPxPerSec: 300,
    skimMaxPxPerSec: 1200,
  },
};
```

Magic numbers must not be scattered through the code.

Configuration values should be documented in code comments.

The user-facing UI does not need to expose all configuration values in version 1.

---

AQ00 Build Plan With Bun

---

The build must use Bun.

The source modules must be bundled for browser execution.

The build should generate a hosted bundle and bookmarklet text outputs.

Example build script concept:

```js
import { build } from "bun";
import { readFile, writeFile } from "node:fs/promises";

await build({
  entrypoints: ["src/bookmarklet-entry.js"],
  outdir: "dist",
  target: "browser",
  format: "iife",
  minify: false,
  sourcemap: "external",
});

const bundle = await readFile("dist/bookmarklet-entry.js", "utf8");

const inlineBookmarklet =
  "javascript:(()=>{" +
  encodeURIComponent(bundle) +
  "})();";

await writeFile("dist/reading-navigator.inline-bookmarklet.txt", inlineBookmarklet);
```

The exact implementation may differ, but the build must make artifact purpose explicit.

The build must validate that the generated bookmarklet starts with `javascript:`.

The build must validate that the bundle contains the configured app name or version.

The build should warn when inline bookmarklet length exceeds a configured limit.

The install page must not manually duplicate bookmarklet source.

---

AR00 Installer Page Requirements

---

The installer page is not the core app, but it is part of the project.

The installer page must make installation unambiguous.

The primary link text should communicate the drag action.

The page should not be visually cluttered.

The page should avoid process language.

The page should show what the tool does and how to install it.

The page should expose both install options if both are supported.

Suggested install options:

| Option        | Label                                                 |
| ------------- | ----------------------------------------------------- |
| Hosted loader | `Drag Reading Navigator to your bookmarks bar`        |
| Inline bundle | `Drag Inline Reading Navigator to your bookmarks bar` |

The hosted loader should be visually primary.

The inline bundle should be advanced or fallback.

The page should display generated bookmarklet size.

The page may include a demo page for testing.

The demo page should include headings, paragraphs, code blocks, lists, and long content so tracking and minimap behavior can be tested.

---

AS00 Demo And Test Fixtures

---

A controlled demo page is required.

The demo page must include:

| Content                        | Purpose                         |
| ------------------------------ | ------------------------------- |
| Multiple `h1` to `h4` headings | Heading index validation.       |
| Long paragraphs                | Segment dwell tracking.         |
| Short paragraphs               | Segment grouping validation.    |
| Lists                          | List item segmentation.         |
| Code blocks                    | Code threshold validation.      |
| Table                          | Table threshold validation.     |
| Figure or image                | Layout shift validation.        |
| Dynamic content button         | Mutation debounce validation.   |
| Tall section                   | Minimap and restore validation. |

The demo page must allow manual testing of restore after reload.

The demo page should include a button that simulates late content loading.

The demo page should include enough height to test long-document behavior.

The demo must not depend on external content.

---

AT00 Acceptance Criteria

---

MVP is acceptable only if the following are true.

The bookmarklet starts on a normal article-like page.

The app injects one isolated UI instance.

Clicking the bookmarklet again does not create duplicate UI.

The app detects headings and readable segments.

The app tracks visible and active-band dwell time.

The app does not mark fast-passed content as probably read.

The app pauses accumulation when the tab is hidden.

The app stops accumulation when idle.

The app stores progress locally when persistence is available.

The app survives page reload and offers `Jump to last reading position`.

The restore action jumps to a useful location.

The restored target is highlighted.

The app shows whether restore was exact, likely, or approximate.

The minimap shows unread, seen, skimmed, probably-read, active, last-focus, and manual mark states.

The heading navigator still supports current heading context and click-to-heading navigation.

The panel supports pause, resume, mark, save, clear page progress, rescan, compact, expand, and close.

The app can be closed without leaving visible UI or active timers.

The app does not noticeably lag scrolling on the demo page.

The app does not store full article text.

The app does not mention any vendor-specific reading or text-to-speech tool.

---

AU00 Implementation Order

---

The recommended implementation order is:

| Phase | Work                                                                                      |
| ----- | ----------------------------------------------------------------------------------------- |
| 1     | Create project skeleton, Bun build, bookmarklet entry, installer artifact generation.     |
| 2     | Implement Shadow DOM host, app shell, lifecycle, close, compact/expanded modes.           |
| 3     | Implement content root detection, heading index, and heading panel.                       |
| 4     | Implement segmenter and geometry cache.                                                   |
| 5     | Implement viewport sampler using cached geometry.                                         |
| 6     | Implement reading tracker, idle/focus/visibility gating, and state classifier.            |
| 7     | Implement progress store with localStorage, schema versioning, and session-only fallback. |
| 8     | Implement restore engine, restore card, and restored-position highlight.                  |
| 9     | Implement minimap rail with grouped rendering.                                            |
| 10    | Integrate heading section progress and last-in-section behavior.                          |
| 11    | Implement mutation invalidation and route-change handling.                                |
| 12    | Add debug performance panel and tuning metrics.                                           |
| 13    | Validate demo page, reload restore, large page behavior, and no lingering cleanup.        |

Do not build the minimap before the segment and stats model is stable.

Do not build restore before anchors and persistence are stable.

Do not optimize by guessing. Add basic timing instrumentation first, then tune.

---

AV00 Explicit Design Decisions

---

The restore feature is generic.

The tool restores to the last meaningful reading position, not to a vendor-specific feature position.

The app estimates reading. It does not claim certainty.

The active reading band is more important than the full viewport.

Raw scroll position is a fallback, not the main restore target.

Manual mark overrides automatic restore when present.

MutationObserver is an invalidation signal, not a rescan loop.

Normal sampling uses cached geometry.

Full DOM traversal is not allowed in the normal sampling path.

Storage writes are debounced.

The minimap must be grouped or diffed for large pages.

The old implementation is inspiration only.

The new project is a fresh modular JavaScript rewrite bundled with Bun.

---

AW00 Open Questions For Later, Not MVP Blockers

---

Whether the hosted loader or inline bundle should be the default for all users can be adjusted after testing.

Whether to use canvas for the minimap can be decided after segment counts and DOM rendering performance are measured.

Whether to expose threshold tuning in the UI can wait.

Whether to support cross-device sync is out of scope.

Whether to store richer anonymous analytics is out of scope and conflicts with the local-first default.

Whether to support import/export of progress can wait.

Whether to support multiple named manual marks can wait.

Whether to support custom keyboard shortcuts can wait.

Whether to support closed Shadow DOM can wait.

---

AX00 Compact Developer Summary

---

Build a new bookmarklet-based reading assistant from scratch. Use modular plain JavaScript in development, Bun for bundling, and a self-contained Shadow DOM runtime UI. Preserve the useful heading navigator behavior from the prior project, but extend it into a generic reading tracker.

The app detects the readable root, segments the article into trackable blocks, samples the viewport at a moderate interval, tracks active-band dwell time, classifies segments by probable reading state, persists compact local progress, and offers a generic `Jump to last reading position` restore action after reload or interruption.

The app must be performance-aware by design. It must avoid full DOM traversal during normal tracking, use cached geometry, debounce mutation handling, batch layout reads and writes, debounce storage saves, and group minimap rendering on large pages.

The app must stay generic. It must not encode browser-specific or vendor-specific restore features. It restores the user's visual and semantic reading location, and that generic behavior supports any external workflow where the user needs to recover their place.
