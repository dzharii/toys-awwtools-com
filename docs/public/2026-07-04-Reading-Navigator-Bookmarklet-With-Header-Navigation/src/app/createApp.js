/**
 * createApp: the runtime orchestrator.
 *
 * Wires identity, content detection, geometry, tracking, storage, restore,
 * overlays, scheduler, and the Shadow DOM UI into one self-contained app with a
 * single authoritative state object. Builds view-model snapshots for the UI and
 * owns the action handlers. Cleans everything up on close.
 */

import { CONFIG } from "../config.js";
import { createInitialState } from "./state.js";
import { createLifecycle } from "./lifecycle.js";
import { attachGlobalEvents } from "./events.js";
import { createScheduler } from "../scheduler/performanceScheduler.js";

import { computePageIdentity } from "../identity/pageIdentity.js";
import { detectContentRoot } from "../content/contentRoot.js";
import { buildHeadingIndex, findCurrentHeading, nearbyHeadings, referenceReadingY } from "../content/headingIndex.js";
import { segmentContent } from "../content/segmenter.js";
import { computeContentFingerprint, computeHeadingFingerprint, compareFingerprints } from "../content/fingerprint.js";

import { createGeometryCache } from "../geometry/geometryCache.js";
import { createReadingTracker } from "../tracking/readingTracker.js";
import { createIdleTracker } from "../tracking/idleTracker.js";
import { createViewportSampler } from "../tracking/viewportSampler.js";
import { computeReadState } from "../tracking/stateClassifier.js";

import { createProgressStore } from "../storage/progressStore.js";
import { serializeProgress } from "../storage/serialize.js";
import { resolveRestoreTarget, confidenceLabel } from "../restore/restoreEngine.js";
import { scrollToElement, scrollToOffset } from "../restore/scrollToTarget.js";

import { createOverlayMarkers } from "../overlays/overlayMarkers.js";
import { createShadowHost } from "../ui/shadowHost.js";
import { createAppShell } from "../ui/appShell.js";

import { now, wallNow } from "../utils/time.js";
import { getDocumentHeight, getViewportHeight, getScrollTop } from "../utils/dom.js";

export function createApp() {
  const state = createInitialState();
  const lifecycle = createLifecycle(state);
  const store = createProgressStore();
  const geometry = createGeometryCache();
  const overlays = createOverlayMarkers();

  let sectionSegmentIds = new Map(); // sectionIndex -> [segmentId]
  let storedRecord = null;
  let firstScanDone = false;
  let suppressSave = false; // guards against saves during clear/teardown

  // ---- Tracker with save-triggering callbacks ------------------------------
  const tracker = createReadingTracker({
    onLastFocusChange: () => {
      state.storage.status = store.isAvailable() && !state.settings.sessionOnly ? "saving" : state.storage.status;
      scheduler.scheduleSave("last-focus");
      scheduler.scheduleUiUpdate("last-focus");
    },
    onManualMarkChange: () => {
      scheduler.scheduleSave("manual-mark", true);
      scheduler.scheduleUiUpdate("manual-mark");
    },
    onSignificantStateChange: () => {
      scheduler.scheduleSave("state-change");
    },
  });

  const idle = createIdleTracker({
    onActivityResume: () => {
      if (sampler) sampler.resetSampleClock();
    },
  });
  lifecycle.register(() => idle.destroy());

  // ---- Scheduler -----------------------------------------------------------
  const scheduler = createScheduler({
    onSample: () => sampler.sample(),
    onGeometryRefresh: (reason) => refreshGeometry(reason),
    onUiUpdate: () => renderUi(),
    onSave: (reason) => doSave(reason),
  });
  lifecycle.register(() => scheduler.cancelAll());

  const sampler = createViewportSampler({
    geometry,
    tracker,
    idle,
    state,
    onSampled: () => scheduler.scheduleUiUpdate("sample"),
  });

  // ---- Shadow host + UI ----------------------------------------------------
  const shadow = createShadowHost();
  lifecycle.register(() => shadow.destroy());

  // Auto theme based on the user's color-scheme preference.
  try {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      state.settings.theme = "dark";
      shadow.setTheme("dark");
    }
  } catch (_e) {
    /* ignore */
  }

  const actions = buildActions();
  const shell = createAppShell(shadow.root, actions, state.settings);
  shadow.enableDrag(shell.elements.titlebar);
  shadow.enableResize(shell.elements.resizeHandle);

  overlays.mount();
  lifecycle.register(() => overlays.destroy());

  // ---- Boot ----------------------------------------------------------------
  function start() {
    try {
      state.page.identity = computePageIdentity();
      scan("startup");
      attachGlobalEvents({
        lifecycle,
        scheduler,
        state,
        actions,
        host: shadow.host,
        callbacks: {
          getContentRoot: () => state.page.contentRoot || document.body,
          onContentMutation: () => scan("mutation"),
          onRouteChange: () => handleRouteChange(),
          onResume: () => {
            sampler.resetSampleClock();
            scheduler.scheduleUiUpdate("resume");
          },
          onFlushSave: (reason) => scheduler.flushSaveNow(reason),
        },
      });
      scheduler.startSampling();
      scheduler.startPeriodicSave();
      lifecycle.setState("tracking");
      renderUi();
    } catch (err) {
      recordError(err);
      lifecycle.setState("failed");
      renderUi();
    }
  }

  // ---- Scan / segmentation -------------------------------------------------
  function scan(reason) {
    const t0 = now();
    const rootResult = detectContentRoot();
    state.page.contentRoot = rootResult.root;
    state.page.rootConfidence = rootResult.confidence;
    state.page.rootReason = rootResult.reason;

    const headings = buildHeadingIndex(rootResult.root);
    const segments = segmentContent(rootResult.root, headings);

    state.headings = headings;
    state.segments = segments;
    state.segmentsById = new Map(segments.map((s) => [s.id, s]));
    geometry.setData(headings, segments);

    // Section -> segment ids index for cheap heading-progress lookups.
    sectionSegmentIds = new Map();
    for (const seg of segments) {
      const key = seg.sectionIndex;
      if (!sectionSegmentIds.has(key)) sectionSegmentIds.set(key, []);
      sectionSegmentIds.get(key).push(seg.id);
    }

    // Fingerprints for content-drift detection.
    const identity = state.page.identity;
    identity.headingFingerprint = computeHeadingFingerprint(headings);
    identity.contentFingerprint = computeContentFingerprint(segments);

    shell.build(segments);
    state.performance.lastScanMs = now() - t0;

    if (!firstScanDone) {
      firstScanDone = true;
      loadAndHydrate();
    }
  }

  function loadAndHydrate() {
    const identity = state.page.identity;
    state.storage.available = store.isAvailable();
    state.storage.mode = store.getMode();
    if (!store.isAvailable()) {
      state.storage.status = "session-only";
    }

    const record = store.load(identity.key);
    storedRecord = record;
    if (record) {
      state.restore.fingerprint = compareFingerprints(
        {
          contentFingerprint: record.page ? record.page.contentFingerprint : null,
          headingFingerprint: record.page ? record.page.headingFingerprint : null,
        },
        {
          contentFingerprint: identity.contentFingerprint,
          headingFingerprint: identity.headingFingerprint,
        }
      );
      tracker.hydrate(record);
      if (record.timestamps && record.timestamps.lastSavedAt) {
        state.storage.lastSavedAt = record.timestamps.lastSavedAt;
      }
    }
  }

  function refreshGeometry(reason) {
    scheduler.runReadPhase(() => {
      const t0 = now();
      geometry.refresh();
      state.performance.lastGeometryMs = now() - t0;
      // Keep segmentsById mapping (same objects, updated coords).
      scheduler.scheduleUiUpdate("geometry:" + (reason || ""));
    });
  }

  function handleRouteChange() {
    // Persist current page, then re-initialize for the new page identity.
    doSave("route-change");
    tracker.statsBySegmentId.clear();
    tracker.resetVisibility();
    tracker.setLastFocus(null, null);
    tracker.clearManualMark();
    storedRecord = null;
    firstScanDone = false;
    state.page.identity = computePageIdentity();
    sampler.resetSampleClock();
    scan("route-change");
    renderUi();
  }

  // ---- Save ----------------------------------------------------------------
  function doSave(reason) {
    const identity = state.page.identity;
    if (!identity) return;
    if (suppressSave) return;
    if (state.settings.sessionOnly) {
      state.storage.status = "session-only";
      return;
    }
    const t0 = now();
    const record = serializeProgress({
      identity,
      tracker,
      getSegmentById: (id) => state.segmentsById.get(id) || null,
      lastRawScroll: state.restore.lastRawScroll,
      timestamps: {
        createdAt: storedRecord && storedRecord.timestamps ? storedRecord.timestamps.createdAt : identity.createdAt,
        lastOpenedAt: state.app.startedAt,
      },
    });
    const res = store.save(identity.key, record);
    state.performance.lastSaveMs = now() - t0;
    storedRecord = record;
    state.storage.mode = res.mode;
    state.storage.lastSavedAt = wallNow();
    state.storage.status = res.mode === "persistent" ? "saved" : "session-only";
    scheduler.scheduleUiUpdate("saved");
  }

  // ---- Restore -------------------------------------------------------------
  function currentLiveSegment() {
    const id = state.tracking.currentSegmentId || tracker.currentSegmentId;
    if (id && state.segmentsById.has(id)) return state.segmentsById.get(id);
    const vh = getViewportHeight();
    const bandCenter = getScrollTop() + vh * ((CONFIG.activeBandTopRatio + CONFIG.activeBandBottomRatio) / 2);
    return geometry.findSegmentAtY(bandCenter);
  }

  function targetFromLiveOrStored(kind) {
    const liveId = kind === "mark" ? tracker.manualMarkSegmentId : tracker.lastFocusSegmentId;
    if (liveId && state.segmentsById.has(liveId)) {
      const seg = state.segmentsById.get(liveId);
      return {
        segmentId: seg.id,
        segmentType: seg.type,
        scrollRatio: seg.scrollStartRatio,
        anchors: seg.anchors,
      };
    }
    if (storedRecord && storedRecord.restore) {
      return kind === "mark" ? storedRecord.restore.manualMark : storedRecord.restore.lastFocus;
    }
    return null;
  }

  function performRestore(kind) {
    const target = targetFromLiveOrStored(kind);
    const result = resolveRestoreTarget(target, {
      segmentsById: state.segmentsById,
      segments: state.segments,
      root: state.page.contentRoot || document.body,
      docHeight: getDocumentHeight(),
    });
    state.restore.lastRestoreResult = result;

    if (result.ok) {
      if (result.targetElement) {
        scrollToElement(result.targetElement);
        overlays.showRestoreHighlight(result.targetElement);
      } else if (typeof result.scrollTop === "number") {
        scrollToOffset(result.scrollTop);
      }
      sampler.resetSampleClock();
      shell.announce(result.message + " Confidence: " + confidenceLabel(result.confidence) + ".");
    } else {
      shell.announce(result.message);
    }
    scheduler.scheduleUiUpdate("restore");
  }

  // ---- Actions -------------------------------------------------------------
  function buildActions() {
    return {
      close: () => close(),
      toggleVisibility: () => {
        state.app.visible = !state.app.visible;
        shadow.root.style.display = state.app.visible ? "" : "none";
      },
      toggleMode: () => {
        state.app.mode = state.app.mode === "expanded" ? "compact" : "expanded";
        shadow.setMode(state.app.mode);
        scheduler.scheduleUiUpdate("mode");
      },
      togglePause: () => {
        state.tracking.pausedByUser = !state.tracking.pausedByUser;
        if (!state.tracking.pausedByUser) sampler.resetSampleClock();
        scheduler.scheduleUiUpdate("pause");
      },
      markSpot: () => {
        const seg = currentLiveSegment();
        if (seg) {
          tracker.setManualMark(seg, seg.headingPath, seg.anchors);
          shell.announce("Marked this spot in " + (seg.headingPath.join(" › ") || "this page") + ".");
        } else {
          shell.announce("No readable content to mark here.");
        }
        scheduler.scheduleUiUpdate("mark");
      },
      jumpToLastReading: () => performRestore("last-focus"),
      jumpToMark: () => performRestore("mark"),
      saveNow: () => {
        scheduler.flushSaveNow("save-now");
        shell.announce("Progress saved.");
      },
      clearProgress: () => {
        // Suppress any save triggered by resetting tracker state (e.g. the
        // immediate save that clearManualMark would otherwise fire), so the
        // record cannot be resurrected right after we delete it.
        suppressSave = true;
        try {
          tracker.statsBySegmentId.clear();
          tracker.setLastFocus(null, null);
          tracker.clearManualMark();
          storedRecord = null;
          store.remove(state.page.identity.key);
          scheduler.cancelPendingSave();
        } finally {
          suppressSave = false;
        }
        state.storage.status = store.isAvailable() ? "idle" : "session-only";
        state.storage.lastSavedAt = null;
        state.restore.fingerprint = null;
        shell.announce("Cleared saved progress for this page.");
        scheduler.scheduleUiUpdate("clear");
      },
      rescan: () => {
        scan("manual-rescan");
        refreshGeometry("manual-rescan");
        shell.announce("Rescanned the page.");
        scheduler.scheduleUiUpdate("rescan");
      },
      jumpToHeading: (headingId) => {
        const heading = state.headings.find((h) => h.id === headingId);
        if (heading && heading.element) {
          scrollToElement(heading.element);
          sampler.resetSampleClock();
          overlays.showRestoreHighlight(heading.element);
        }
      },
      jumpToLastInSection: (headingId) => {
        const heading = state.headings.find((h) => h.id === headingId);
        if (!heading) return;
        const ids = sectionSegmentIds.get(heading.sectionIndex) || [];
        // Prefer the segment with the most focused dwell in this section.
        let best = null;
        let bestMs = -1;
        for (const id of ids) {
          const stats = tracker.getStats(id);
          if (stats && stats.totalFocusedMs > bestMs) {
            bestMs = stats.totalFocusedMs;
            best = id;
          }
        }
        const seg = best ? state.segmentsById.get(best) : (ids[0] ? state.segmentsById.get(ids[0]) : null);
        if (seg && seg.element) {
          scrollToElement(seg.element);
          sampler.resetSampleClock();
          overlays.showRestoreHighlight(seg.element);
        } else if (heading.element) {
          scrollToElement(heading.element);
        }
      },
      jumpToSegment: (segmentId) => {
        const seg = state.segmentsById.get(segmentId);
        if (seg && seg.element) {
          scrollToElement(seg.element);
          sampler.resetSampleClock();
          overlays.showRestoreHighlight(seg.element);
        }
      },
      setFontScale: (v) => {
        state.settings.fontScale = v;
        shadow.setFontScale(v);
      },
      setOpacity: (v) => {
        state.settings.opacity = v;
        shadow.setOpacity(v);
      },
      setTheme: (v) => {
        state.settings.theme = v;
        shadow.setTheme(v);
      },
      setContrast: (v) => {
        state.settings.contrast = v;
        shadow.setContrast(v);
      },
      setSessionOnly: (on) => {
        state.settings.sessionOnly = on;
        if (on) {
          store.enableSessionOnly();
          state.storage.mode = "session-only";
          state.storage.status = "session-only";
        }
        scheduler.scheduleUiUpdate("session-only");
      },
      setDebug: (on) => {
        state.settings.debug = on;
        overlays.setDebug(on);
        scheduler.scheduleUiUpdate("debug");
      },
    };
  }

  // ---- View model + render -------------------------------------------------
  function computeStatesById() {
    const states = new Map();
    for (const seg of state.segments) {
      const stats = tracker.getStats(seg.id);
      states.set(seg.id, stats ? computeReadState(seg, stats) : "unseen");
    }
    return states;
  }

  function computeProgress(statesById) {
    const total = state.segments.length || 1;
    let read = 0;
    let seen = 0;
    let skimmed = 0;
    let unseen = 0;
    statesById.forEach((st) => {
      if (st === "probably-read" || st === "reread") read++;
      else if (st === "skimmed") skimmed++;
      else if (st === "seen") seen++;
      else unseen++;
    });
    return {
      probablyReadRatio: read / total,
      seenRatio: seen / total,
      skimmedRatio: skimmed / total,
      unreadRatio: unseen / total,
      readCount: read,
      total: state.segments.length,
    };
  }

  function sectionProgress(sectionIndex, statesById) {
    const ids = sectionSegmentIds.get(sectionIndex) || [];
    if (!ids.length) return { percent: 0, hasReadable: false };
    let read = 0;
    for (const id of ids) {
      const st = statesById.get(id);
      if (st === "probably-read" || st === "reread") read++;
    }
    return { percent: Math.round((read / ids.length) * 100), hasReadable: true };
  }

  function buildHeadingContext(statesById) {
    const vp = state.viewport;
    const scrollTop = vp ? vp.top : getScrollTop();
    const vh = vp ? vp.height : getViewportHeight();
    const refY = referenceReadingY(scrollTop, vh);
    const current = findCurrentHeading(state.headings, refY);

    if (!state.headings.length) {
      return { path: [], rows: [], emptyMessage: "No headings found. Reading progress is still tracked." };
    }

    const near = current ? nearbyHeadings(state.headings, current.id, 3, 3) : { above: [], below: [] };
    const ordered = [...near.above];
    if (current) ordered.push(current);
    ordered.push(...near.below);

    const lastFocusSection = sectionOfSegment(tracker.lastFocusSegmentId);
    const markSection = sectionOfSegment(tracker.manualMarkSegmentId);

    const rows = ordered.map((h) => {
      const prog = sectionProgress(h.sectionIndex, statesById);
      return {
        id: h.id,
        level: h.level,
        text: h.text,
        isCurrent: current && h.id === current.id,
        progressPercent: prog.percent,
        hasReadableContent: prog.hasReadable,
        hasLastFocus: lastFocusSection === h.sectionIndex,
        hasManualMark: markSection === h.sectionIndex,
      };
    });

    return { path: current ? current.path : [], rows };
  }

  function sectionOfSegment(segmentId) {
    if (!segmentId || !state.segmentsById.has(segmentId)) return null;
    return state.segmentsById.get(segmentId).sectionIndex;
  }

  function buildRestoreVm(progress) {
    const liveLast = tracker.lastFocusSegmentId;
    const hasLive = liveLast && state.segmentsById.has(liveLast);
    const hasStored = !!(storedRecord && storedRecord.restore && (storedRecord.restore.lastFocus || storedRecord.restore.manualMark));
    const hasManualMark = !!tracker.manualMarkSegmentId || !!(storedRecord && storedRecord.restore && storedRecord.restore.manualMark);
    const hasSaved = hasLive || hasStored || !!tracker.lastFocusSegmentId || !!tracker.manualMarkSegmentId;

    let lastContext = "";
    const contextSeg =
      (tracker.manualMarkSegmentId && state.segmentsById.get(tracker.manualMarkSegmentId)) ||
      (liveLast && state.segmentsById.get(liveLast));
    if (contextSeg && contextSeg.headingPath.length) lastContext = contextSeg.headingPath.join(" › ");

    // Predicted confidence for the primary target (before jumping).
    let confidence = "none";
    if (state.restore.lastRestoreResult) confidence = state.restore.lastRestoreResult.confidence;
    else if (hasLive || (tracker.manualMarkSegmentId && state.segmentsById.has(tracker.manualMarkSegmentId))) confidence = "high";
    else if (hasStored) confidence = "medium";

    let fingerprintWarning = "";
    if (state.restore.fingerprint && state.restore.fingerprint.match === "different") {
      fingerprintWarning = "Saved progress may belong to an older version of this page.";
    }

    return {
      hasSaved,
      hasManualMark,
      storageUnavailable: !store.isAvailable(),
      lastSavedAt: state.storage.lastSavedAt,
      lastContext,
      progressText: progress.total
        ? Math.round(progress.probablyReadRatio * 100) + "% probably read · " + progress.readCount + "/" + progress.total + " segments"
        : "",
      confidenceLabel: hasSaved ? confidenceLabel(confidence) : "",
    };
  }

  function trackingStatusLabel() {
    if (state.tracking.pausedByUser) return "paused";
    const label = state.tracking.statusLabel || "active";
    return label === "active" ? "tracking" : label;
  }

  function storageStatusLabel() {
    if (!store.isAvailable() || state.settings.sessionOnly) {
      return state.settings.sessionOnly ? "session-only" : "unavailable";
    }
    return state.storage.status || "idle";
  }

  function buildViewModel() {
    const statesById = computeStatesById();
    const progress = computeProgress(statesById);
    const vp = state.viewport;
    const docHeight = vp ? vp.docHeight : getDocumentHeight() || 1;

    return {
      mode: state.app.mode,
      paused: state.tracking.pausedByUser,
      trackingStatus: trackingStatusLabel(),
      storageStatus: storageStatusLabel(),
      segmentCount: state.segments.length,
      manualMarkSegmentId: tracker.manualMarkSegmentId,
      progress,
      headingContext: buildHeadingContext(statesById),
      restore: buildRestoreVm(progress),
      minimap: {
        statesById,
        currentSegmentId: state.tracking.currentSegmentId,
        lastFocusSegmentId: tracker.lastFocusSegmentId,
        manualMarkSegmentId: tracker.manualMarkSegmentId,
        viewport: vp
          ? { topRatio: vp.top / docHeight, bottomRatio: vp.bottom / docHeight }
          : null,
      },
      debug: {
        enabled: state.settings.debug,
        appVersion: state.app.version,
        rootConfidence: state.page.rootConfidence,
        rootReason: state.page.rootReason,
        segmentCount: state.segments.length,
        headingCount: state.headings.length,
        minimapNodes: Math.min(state.segments.length, CONFIG.maxMinimapNodes),
        lastScanMs: state.performance.lastScanMs,
        lastGeometryMs: state.performance.lastGeometryMs,
        lastSampleMs: state.performance.lastSampleMs,
        lastSaveMs: state.performance.lastSaveMs,
        velocity: state.tracking.velocity,
        velocityClass: state.tracking.velocityClass,
        storageMode: state.storage.mode,
        currentSegmentId: state.tracking.currentSegmentId,
        lastFocusSegmentId: tracker.lastFocusSegmentId,
        errorCount: state.diagnostics.errorCount,
        lastError: state.diagnostics.lastError,
      },
      _statesById: statesById,
    };
  }

  function renderUi() {
    if (lifecycle.isClosed()) return;
    const t0 = now();
    try {
      const vm = buildViewModel();
      shell.update(vm);
      overlays.update({
        segmentsById: state.segmentsById,
        currentSegmentId: state.tracking.currentSegmentId,
        lastFocusSegmentId: tracker.lastFocusSegmentId,
        manualMarkSegmentId: tracker.manualMarkSegmentId,
        viewport: state.viewport,
      });
    } catch (err) {
      recordError(err);
    }
    state.performance.lastRenderMs = now() - t0;
  }

  // ---- Errors / close ------------------------------------------------------
  function recordError(err) {
    state.diagnostics.errorCount += 1;
    state.diagnostics.lastError = err && err.message ? err.message : String(err);
  }

  function close() {
    if (lifecycle.isClosed()) return;
    // Best-effort final save before teardown.
    try {
      if (!state.settings.sessionOnly && store.isAvailable()) doSave("close");
    } catch (_e) {
      /* ignore */
    }
    lifecycle.cleanup();
    delete window.__readingNavigatorApp;
  }

  return {
    start,
    close,
    toggleVisibility: () => actions.toggleVisibility(),
    get state() {
      return state;
    },
    // Exposed for exploratory tests.
    _debug: { buildViewModel, scan, doSave, actions },
  };
}
