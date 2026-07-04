/* Reading Navigator v0.1.0 — bundled, unminified. Generated 2026-07-04T20:16:58.192Z. Do not edit by hand. */
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __moduleCache = /* @__PURE__ */ new WeakMap;
  var __toCommonJS = (from) => {
    var entry = __moduleCache.get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function")
      __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
        get: () => from[key],
        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
      }));
    __moduleCache.set(from, entry);
    return entry;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: (newValue) => all[name] = () => newValue
      });
  };

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/bookmarklet-entry.js
  var exports_bookmarklet_entry = {};
  __export(exports_bookmarklet_entry, {
    run: () => run
  });

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/config.js
  var CONFIG = {
    appName: "Reading Navigator",
    appVersion: "0.1.0",
    schemaVersion: 1,
    hostId: "reading-navigator-bookmarklet-host",
    hostDataAttr: "data-reading-navigator",
    storagePrefix: "rn:v1:",
    identityKeyVersion: 1,
    sampleIntervalMs: 500,
    maxSampleGapMs: 5000,
    activeBandTopRatio: 0.25,
    activeBandBottomRatio: 0.75,
    currentHeadingRefRatio: 0.35,
    idleSoftMs: 20000,
    idleHardMs: 60000,
    saveDebounceMs: 2000,
    periodicSaveMs: 20000,
    maxStoredRecords: 200,
    maxRecordAgeDays: 90,
    mutationDebounceMs: 1500,
    maxMinimapNodes: 300,
    lastFocusMinFocusedMs: 2000,
    lastFocusMinActiveRatio: 0.25,
    restoreHighlightMs: 2600,
    velocity: {
      slowMaxPxPerSec: 80,
      normalMaxPxPerSec: 300,
      skimMaxPxPerSec: 1200
    },
    velocitySmoothingSamples: 3,
    segmentGroupMinHeightPx: 28,
    virtualSplitViewportMultiple: 1.5,
    maxSegments: 4000,
    rootMinParagraphs: 3,
    shortcuts: {
      togglePanel: { alt: true, shift: false, key: "r" },
      jumpLastReading: { alt: true, shift: true, key: "r" },
      markSpot: { alt: true, shift: false, key: "m" },
      pauseResume: { alt: true, shift: false, key: "p" },
      compactExpand: { alt: true, shift: false, key: "c" }
    },
    debug: false
  };
  var READ_THRESHOLD_BASE_MS = {
    heading: 1000,
    paragraph: 3500,
    "list-item": 2500,
    blockquote: 4000,
    code: 8000,
    figure: 5000,
    table: 9000,
    section: 6000,
    "unknown-block": 4000
  };

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/utils/time.js
  function now() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }
  function wallNow() {
    return Date.now();
  }
  function formatRelativeTime(wallMs, referenceMs) {
    const ref = typeof referenceMs === "number" ? referenceMs : Date.now();
    const deltaSec = Math.round((ref - wallMs) / 1000);
    if (!isFinite(deltaSec))
      return "unknown";
    if (deltaSec < 5)
      return "just now";
    if (deltaSec < 60)
      return deltaSec + " seconds ago";
    const minutes = Math.round(deltaSec / 60);
    if (minutes < 60)
      return minutes + (minutes === 1 ? " minute ago" : " minutes ago");
    const hours = Math.round(minutes / 60);
    if (hours < 24)
      return hours + (hours === 1 ? " hour ago" : " hours ago");
    const days = Math.round(hours / 24);
    if (days < 30)
      return days + (days === 1 ? " day ago" : " days ago");
    const months = Math.round(days / 30);
    if (months < 12)
      return months + (months === 1 ? " month ago" : " months ago");
    const years = Math.round(months / 12);
    return years + (years === 1 ? " year ago" : " years ago");
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/app/state.js
  function createInitialState() {
    return {
      app: {
        version: CONFIG.appVersion,
        instanceId: "rn_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        mode: "expanded",
        lifecycle: "booting",
        startedAt: wallNow(),
        visible: true
      },
      page: {
        identity: null,
        contentRoot: null,
        rootConfidence: "unknown",
        rootReason: ""
      },
      headings: [],
      segments: [],
      segmentsById: new Map,
      restore: {
        lastFocus: null,
        manualMark: null,
        lastRawScroll: null,
        lastRestoreResult: null,
        fingerprint: null
      },
      tracking: {
        pausedByUser: false,
        currentSegmentId: null,
        velocity: 0,
        velocityClass: "slow",
        statusLabel: "tracking",
        sampleCount: 0
      },
      viewport: null,
      performance: {
        geometryDirty: false,
        contentDirty: false,
        lastScanMs: 0,
        lastGeometryMs: 0,
        lastSampleMs: 0,
        lastRenderMs: 0,
        lastSaveMs: 0
      },
      storage: {
        available: true,
        mode: "persistent",
        dirty: false,
        lastSavedAt: null,
        status: "idle"
      },
      settings: {
        fontScale: 1,
        opacity: 1,
        contrast: "soft",
        theme: "light",
        sessionOnly: false,
        debug: CONFIG.debug
      },
      diagnostics: {
        errorCount: 0,
        lastError: null
      }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/app/lifecycle.js
  function createLifecycle(state) {
    const disposers = [];
    let closed = false;
    function setState(next) {
      if (state && state.app)
        state.app.lifecycle = next;
    }
    function register(disposeFn) {
      if (typeof disposeFn === "function")
        disposers.push(disposeFn);
      return disposeFn;
    }
    function addListener(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      register(() => {
        try {
          target.removeEventListener(type, handler, options);
        } catch (_e) {}
      });
    }
    function trackObserver(observer) {
      register(() => {
        try {
          observer.disconnect();
        } catch (_e) {}
      });
      return observer;
    }
    function cleanup() {
      if (closed)
        return;
      closed = true;
      setState("closing");
      for (let i = disposers.length - 1;i >= 0; i--) {
        try {
          disposers[i]();
        } catch (_e) {}
      }
      disposers.length = 0;
    }
    function isClosed() {
      return closed;
    }
    return { register, addListener, trackObserver, cleanup, setState, isClosed };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/utils/dom.js
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const key in props) {
        if (!Object.prototype.hasOwnProperty.call(props, key))
          continue;
        const value = props[key];
        if (value == null)
          continue;
        if (key === "class" || key === "className") {
          node.className = value;
        } else if (key === "text") {
          node.textContent = value;
        } else if (key === "dataset" && typeof value === "object") {
          for (const dk in value)
            node.dataset[dk] = value[dk];
        } else if (key === "style" && typeof value === "object") {
          for (const sk in value)
            node.style[sk] = value[sk];
        } else if (key.slice(0, 2) === "on" && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key in node && key !== "list") {
          try {
            node[key] = value;
          } catch (_e) {
            node.setAttribute(key, value);
          }
        } else {
          node.setAttribute(key, value);
        }
      }
    }
    if (children != null) {
      appendChildren(node, children);
    }
    return node;
  }
  function appendChildren(node, children) {
    const list = Array.isArray(children) ? children : [children];
    for (const child of list) {
      if (child == null || child === false)
        continue;
      if (typeof child === "string" || typeof child === "number") {
        node.appendChild(document.createTextNode(String(child)));
      } else {
        node.appendChild(child);
      }
    }
  }
  function clearChildren(node) {
    while (node.firstChild)
      node.removeChild(node.firstChild);
  }
  function normalizeText(raw) {
    return String(raw || "").replace(/\s+/g, " ").trim();
  }
  function getScrollTop() {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }
  function getDocumentHeight() {
    const b = document.body;
    const e = document.documentElement;
    return Math.max(b ? b.scrollHeight : 0, b ? b.offsetHeight : 0, e ? e.clientHeight : 0, e ? e.scrollHeight : 0, e ? e.offsetHeight : 0);
  }
  function getViewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight || 0;
  }
  function isElementVisible(element) {
    if (!element || element.nodeType !== 1)
      return false;
    const style = window.getComputedStyle(element);
    if (!style)
      return false;
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
      return false;
    }
    if (parseFloat(style.opacity) === 0)
      return false;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1)
      return false;
    return true;
  }
  function isInsideAppHost(element) {
    if (!element)
      return false;
    let node = element;
    while (node) {
      if (node.id === CONFIG.hostId)
        return true;
      if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute(CONFIG.hostDataAttr)) {
        return true;
      }
      node = node.parentNode || (node.host ? node.host : null);
    }
    return false;
  }
  function computeDomPath(element, root) {
    if (!element || element.nodeType !== 1)
      return "";
    const parts = [];
    let node = element;
    const stopAt = root || document.body;
    while (node && node.nodeType === 1 && node !== stopAt) {
      const tag = node.tagName.toLowerCase();
      let index = 1;
      let sibling = node.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === node.tagName)
          index++;
        sibling = sibling.previousElementSibling;
      }
      parts.unshift(tag + ":nth-of-type(" + index + ")");
      node = node.parentElement;
      if (parts.length > 30)
        break;
    }
    return parts.join(">");
  }
  function resolveDomPath(domPath, root) {
    if (!domPath)
      return null;
    const scope = root || document.body;
    try {
      return scope.querySelector(":scope>" + domPath.split(">").join(">"));
    } catch (_e) {
      return manualResolveDomPath(domPath, scope);
    }
  }
  function manualResolveDomPath(domPath, scope) {
    const segments = domPath.split(">");
    let current = scope;
    for (const seg of segments) {
      const match = /^([a-z0-9-]+):nth-of-type\((\d+)\)$/i.exec(seg);
      if (!match || !current)
        return null;
      const tag = match[1].toUpperCase();
      const nth = parseInt(match[2], 10);
      let count = 0;
      let found = null;
      for (const child of current.children) {
        if (child.tagName === tag) {
          count++;
          if (count === nth) {
            found = child;
            break;
          }
        }
      }
      if (!found)
        return null;
      current = found;
    }
    return current;
  }
  function prefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_e) {
      return false;
    }
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/identity/urlNormalize.js
  var TRACKING_PARAM_EXACT = new Set([
    "fbclid",
    "gclid",
    "msclkid",
    "dclid",
    "gbraid",
    "wbraid",
    "yclid",
    "mc_eid",
    "mc_cid",
    "igshid",
    "ref",
    "ref_src",
    "ref_url",
    "spm",
    "scm",
    "_hsenc",
    "_hsmi",
    "vero_id",
    "oly_enc_id",
    "oly_anon_id"
  ]);
  var TRACKING_PARAM_PREFIX = ["utm_", "pk_", "piwik_", "matomo_", "hsa_"];
  function isTrackingParam(name) {
    const lower = name.toLowerCase();
    if (TRACKING_PARAM_EXACT.has(lower))
      return true;
    for (const prefix of TRACKING_PARAM_PREFIX) {
      if (lower.indexOf(prefix) === 0)
        return true;
    }
    return false;
  }
  var DEFAULT_PORTS = { "http:": "80", "https:": "443" };
  function normalizeUrl(href) {
    let url;
    try {
      url = new URL(href);
    } catch (_e) {
      return String(href || "").split("#")[0];
    }
    const protocol = url.protocol;
    const hostname = url.hostname.toLowerCase();
    let portPart = "";
    if (url.port && DEFAULT_PORTS[protocol] !== url.port) {
      portPart = ":" + url.port;
    }
    let pathname = url.pathname.replace(/\/{2,}/g, "/");
    if (pathname === "")
      pathname = "/";
    const kept = [];
    url.searchParams.forEach((value, key) => {
      if (!isTrackingParam(key))
        kept.push([key, value]);
    });
    kept.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1);
    let query = "";
    if (kept.length) {
      const parts = kept.map(([k, v]) => v === "" ? encodeURIComponent(k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
      query = "?" + parts.join("&");
    }
    return protocol + "//" + hostname + portPart + pathname + query;
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/app/events.js
  function attachGlobalEvents(deps) {
    const { lifecycle, scheduler, state, actions, callbacks, host } = deps;
    const cb = callbacks || {};
    lifecycle.addListener(window, "scroll", () => {
      scheduler.scheduleUiUpdate("scroll");
    }, { passive: true });
    lifecycle.addListener(window, "resize", () => {
      scheduler.scheduleGeometryRefresh("resize");
      scheduler.scheduleUiUpdate("resize");
    }, { passive: true });
    lifecycle.addListener(document, "visibilitychange", () => {
      if (!document.hidden && cb.onResume)
        cb.onResume();
      scheduler.scheduleUiUpdate("visibility");
    });
    lifecycle.addListener(window, "focus", () => {
      if (cb.onResume)
        cb.onResume();
      scheduler.scheduleUiUpdate("focus");
    });
    lifecycle.addListener(window, "blur", () => {
      scheduler.scheduleUiUpdate("blur");
    });
    lifecycle.addListener(window, "pagehide", () => {
      if (cb.onFlushSave)
        cb.onFlushSave("pagehide");
    });
    lifecycle.addListener(window, "load", () => {
      scheduler.scheduleGeometryRefresh("window-load");
    }, { once: true });
    const contentRoot = cb.getContentRoot ? cb.getContentRoot() : document.body;
    let mutationTimer = null;
    const observer = new MutationObserver((mutations) => {
      let relevant = false;
      for (const m of mutations) {
        if (m.target && isInsideAppHost(m.target))
          continue;
        if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) {
          relevant = true;
          break;
        }
      }
      if (!relevant)
        return;
      state.performance.contentDirty = true;
      if (mutationTimer)
        return;
      mutationTimer = setTimeout(() => {
        mutationTimer = null;
        if (state.performance.contentDirty && cb.onContentMutation)
          cb.onContentMutation();
      }, CONFIG.mutationDebounceMs);
    });
    try {
      observer.observe(contentRoot || document.body, { childList: true, subtree: true });
      lifecycle.trackObserver(observer);
      lifecycle.register(() => {
        if (mutationTimer)
          clearTimeout(mutationTimer);
      });
    } catch (_e) {}
    let lastUrl = normalizeUrl(window.location.href);
    const checkRoute = () => {
      const current = normalizeUrl(window.location.href);
      if (current !== lastUrl) {
        lastUrl = current;
        if (cb.onRouteChange)
          cb.onRouteChange();
      }
    };
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    let historyWrapped = false;
    try {
      history.pushState = function() {
        const ret = originalPushState.apply(this, arguments);
        try {
          checkRoute();
        } catch (_e) {}
        return ret;
      };
      history.replaceState = function() {
        const ret = originalReplaceState.apply(this, arguments);
        try {
          checkRoute();
        } catch (_e) {}
        return ret;
      };
      historyWrapped = true;
      lifecycle.register(() => {
        if (historyWrapped) {
          history.pushState = originalPushState;
          history.replaceState = originalReplaceState;
        }
      });
    } catch (_e) {}
    lifecycle.addListener(window, "popstate", checkRoute);
    const routePoll = setInterval(checkRoute, 2000);
    lifecycle.register(() => clearInterval(routePoll));
    function isTypingContext(target) {
      if (!target)
        return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
        return true;
      if (target.isContentEditable)
        return true;
      return false;
    }
    function matches(e, def) {
      return !!def && e.altKey === !!def.alt && e.shiftKey === !!def.shift && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === def.key;
    }
    lifecycle.addListener(document, "keydown", (e) => {
      if (e.key === "Escape" && host && document.activeElement === host) {
        actions.close();
        return;
      }
      if (isTypingContext(e.target))
        return;
      const s = CONFIG.shortcuts;
      if (matches(e, s.togglePanel)) {
        e.preventDefault();
        actions.toggleVisibility();
      } else if (matches(e, s.jumpLastReading)) {
        e.preventDefault();
        actions.jumpToLastReading();
      } else if (matches(e, s.markSpot)) {
        e.preventDefault();
        actions.markSpot();
      } else if (matches(e, s.pauseResume)) {
        e.preventDefault();
        actions.togglePause();
      } else if (matches(e, s.compactExpand)) {
        e.preventDefault();
        actions.toggleMode();
      }
    });
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/scheduler/performanceScheduler.js
  function createScheduler(callbacks) {
    const cb = callbacks || {};
    let sampleTimer = null;
    let sampleIntervalMs = CONFIG.sampleIntervalMs;
    let geometryTimer = null;
    let uiTimer = null;
    let saveTimer = null;
    let periodicSaveTimer = null;
    const dirty = {
      content: false,
      geometry: false,
      ui: false,
      save: false
    };
    let stopped = false;
    const rafReads = [];
    const rafWrites = [];
    let rafHandle = 0;
    const idleQueue = [];
    let idleHandle = 0;
    function markDirty(type) {
      if (type in dirty)
        dirty[type] = true;
    }
    function isDirty(type) {
      return !!dirty[type];
    }
    function clearDirty(type) {
      if (type in dirty)
        dirty[type] = false;
    }
    function startSampling(intervalMs) {
      if (stopped)
        return;
      if (typeof intervalMs === "number")
        sampleIntervalMs = intervalMs;
      stopSampling();
      sampleTimer = setInterval(() => {
        if (stopped)
          return;
        try {
          if (cb.onSample)
            cb.onSample();
        } catch (_e) {}
      }, sampleIntervalMs);
    }
    function stopSampling() {
      if (sampleTimer) {
        clearInterval(sampleTimer);
        sampleTimer = null;
      }
    }
    function setSampleInterval(intervalMs) {
      if (intervalMs === sampleIntervalMs)
        return;
      sampleIntervalMs = intervalMs;
      if (sampleTimer)
        startSampling(intervalMs);
    }
    function scheduleGeometryRefresh(reason) {
      markDirty("geometry");
      if (geometryTimer || stopped)
        return;
      geometryTimer = setTimeout(() => {
        geometryTimer = null;
        if (stopped || !dirty.geometry)
          return;
        try {
          if (cb.onGeometryRefresh)
            cb.onGeometryRefresh(reason);
        } catch (_e) {}
      }, 120);
    }
    function scheduleUiUpdate(reason) {
      markDirty("ui");
      if (uiTimer || stopped)
        return;
      uiTimer = setTimeout(() => {
        uiTimer = null;
        if (stopped || !dirty.ui)
          return;
        clearDirty("ui");
        try {
          if (cb.onUiUpdate)
            cb.onUiUpdate(reason);
        } catch (_e) {}
      }, 60);
    }
    function scheduleSave(reason, immediate) {
      markDirty("save");
      if (stopped)
        return;
      if (immediate) {
        if (saveTimer) {
          clearTimeout(saveTimer);
          saveTimer = null;
        }
        runSave(reason);
        return;
      }
      if (saveTimer)
        return;
      saveTimer = setTimeout(() => {
        saveTimer = null;
        runSave(reason);
      }, CONFIG.saveDebounceMs);
    }
    function runSave(reason) {
      if (!dirty.save)
        return;
      clearDirty("save");
      try {
        if (cb.onSave)
          cb.onSave(reason);
      } catch (_e) {}
    }
    function startPeriodicSave() {
      if (periodicSaveTimer || stopped)
        return;
      periodicSaveTimer = setInterval(() => {
        if (stopped)
          return;
        if (dirty.save)
          runSave("periodic");
      }, CONFIG.periodicSaveMs);
    }
    function flushSaveNow(reason) {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      markDirty("save");
      runSave(reason || "flush");
    }
    function cancelPendingSave() {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      clearDirty("save");
    }
    function runReadPhase(fn) {
      if (typeof fn === "function")
        rafReads.push(fn);
      ensureRaf();
    }
    function runWritePhase(fn) {
      if (typeof fn === "function")
        rafWrites.push(fn);
      ensureRaf();
    }
    function ensureRaf() {
      if (rafHandle || stopped)
        return;
      const raf = window.requestAnimationFrame || ((f) => setTimeout(() => f(Date.now()), 16));
      rafHandle = raf(() => {
        rafHandle = 0;
        const reads = rafReads.splice(0, rafReads.length);
        const writes = rafWrites.splice(0, rafWrites.length);
        for (const r of reads) {
          try {
            r();
          } catch (_e) {}
        }
        for (const w of writes) {
          try {
            w();
          } catch (_e) {}
        }
      });
    }
    function runIdle(fn) {
      if (typeof fn !== "function")
        return;
      idleQueue.push(fn);
      if (idleHandle || stopped)
        return;
      const ric = window.requestIdleCallback || ((f) => setTimeout(() => f({ timeRemaining: () => 8 }), 200));
      idleHandle = ric(() => {
        idleHandle = 0;
        const tasks = idleQueue.splice(0, idleQueue.length);
        for (const t of tasks) {
          try {
            t();
          } catch (_e) {}
        }
      });
    }
    function cancelAll() {
      stopped = true;
      stopSampling();
      if (geometryTimer)
        clearTimeout(geometryTimer);
      if (uiTimer)
        clearTimeout(uiTimer);
      if (saveTimer)
        clearTimeout(saveTimer);
      if (periodicSaveTimer)
        clearInterval(periodicSaveTimer);
      geometryTimer = uiTimer = saveTimer = periodicSaveTimer = null;
      if (rafHandle && window.cancelAnimationFrame)
        window.cancelAnimationFrame(rafHandle);
      if (idleHandle && window.cancelIdleCallback)
        window.cancelIdleCallback(idleHandle);
      rafHandle = 0;
      idleHandle = 0;
      rafReads.length = 0;
      rafWrites.length = 0;
      idleQueue.length = 0;
    }
    return {
      markDirty,
      isDirty,
      clearDirty,
      startSampling,
      stopSampling,
      setSampleInterval,
      scheduleGeometryRefresh,
      scheduleUiUpdate,
      scheduleSave,
      startPeriodicSave,
      flushSaveNow,
      cancelPendingSave,
      runReadPhase,
      runWritePhase,
      runIdle,
      cancelAll,
      get sampleIntervalMs() {
        return sampleIntervalMs;
      }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/identity/pageIdentity.js
  function computePageIdentity() {
    const originalUrl = window.location.href;
    const normalizedUrl = normalizeUrl(originalUrl);
    const key = CONFIG.storagePrefix + normalizedUrl;
    return {
      version: CONFIG.identityKeyVersion,
      key,
      normalizedUrl,
      originalUrl,
      origin: window.location.origin,
      pathname: window.location.pathname,
      title: document.title || "",
      createdAt: wallNow(),
      contentFingerprint: null,
      headingFingerprint: null
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/content/contentRoot.js
  var NEGATIVE_TAGS = new Set(["NAV", "HEADER", "FOOTER", "ASIDE", "FORM", "BUTTON"]);
  var NEGATIVE_PATTERN = /(^|[\s_-])(nav|menu|header|footer|sidebar|aside|comment|comments|promo|advert|ad|ads|banner|cookie|consent|share|social|related|recommend|widget|breadcrumb|pagination|masthead|subscribe|newsletter)([\s_-]|$)/i;
  var POSITIVE_PATTERN = /(^|[\s_-])(article|content|post|entry|main|story|body|markdown|prose|doc|documentation|readme)([\s_-]|$)/i;
  function looksNegative(element) {
    if (NEGATIVE_TAGS.has(element.tagName))
      return true;
    const role = element.getAttribute && element.getAttribute("role");
    if (role && /(navigation|banner|complementary|contentinfo|search)/i.test(role))
      return true;
    const id = element.id || "";
    const cls = typeof element.className === "string" ? element.className : "";
    return NEGATIVE_PATTERN.test(id) || NEGATIVE_PATTERN.test(cls);
  }
  function looksPositive(element) {
    const role = element.getAttribute && element.getAttribute("role");
    if (role && /(main|article)/i.test(role))
      return true;
    const id = element.id || "";
    const cls = typeof element.className === "string" ? element.className : "";
    return POSITIVE_PATTERN.test(id) || POSITIVE_PATTERN.test(cls);
  }
  function isInsideNegativeRegion(element) {
    let node = element.parentElement;
    let depth = 0;
    while (node && depth < 6) {
      if (looksNegative(node))
        return true;
      node = node.parentElement;
      depth++;
    }
    return false;
  }
  function scoreCandidate(element) {
    if (!isElementVisible(element))
      return null;
    if (isInsideAppHost(element))
      return null;
    const paragraphs = element.querySelectorAll("p");
    const headings = element.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const links = element.querySelectorAll("a");
    const paragraphCount = paragraphs.length;
    const headingCount = headings.length;
    const text = normalizeText(element.textContent || "");
    const textLength = text.length;
    if (paragraphCount === 0 && headingCount === 0)
      return null;
    const rect = element.getBoundingClientRect();
    const visibleHeight = rect.height;
    let linkTextLength = 0;
    for (const link of links)
      linkTextLength += (link.textContent || "").length;
    const linkDensity = textLength > 0 ? linkTextLength / textLength : 1;
    let score = 0;
    score += paragraphCount * 12;
    score += headingCount * 8;
    score += Math.min(2000, textLength) * 0.05;
    score += Math.min(4000, visibleHeight) * 0.02;
    score -= linkDensity * 120;
    if (element.tagName === "ARTICLE")
      score += 60;
    if (element.tagName === "MAIN")
      score += 50;
    if (looksPositive(element))
      score += 40;
    if (looksNegative(element))
      score -= 120;
    if (isInsideNegativeRegion(element))
      score -= 60;
    return {
      element,
      score,
      paragraphCount,
      headingCount,
      textLength,
      linkDensity
    };
  }
  function detectContentRoot() {
    const selectors = [
      "article",
      "main",
      '[role="main"]',
      ".post",
      ".entry-content",
      ".article-content",
      ".markdown-body",
      ".prose",
      "#content",
      "#main",
      ".content"
    ];
    const seen = new Set;
    const candidates = [];
    for (const sel of selectors) {
      let nodes;
      try {
        nodes = document.querySelectorAll(sel);
      } catch (_e) {
        continue;
      }
      for (const node of nodes) {
        if (seen.has(node))
          continue;
        seen.add(node);
        const scored = scoreCandidate(node);
        if (scored)
          candidates.push(scored);
      }
    }
    for (const node of document.querySelectorAll("section, div")) {
      if (candidates.length > 60)
        break;
      if (seen.has(node))
        continue;
      if (node.querySelectorAll("p").length < CONFIG.rootMinParagraphs)
        continue;
      seen.add(node);
      const scored = scoreCandidate(node);
      if (scored)
        candidates.push(scored);
    }
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (best && best.score > 0 && best.paragraphCount >= 1) {
      let confidence = "medium";
      if (best.score > 200 && best.paragraphCount >= CONFIG.rootMinParagraphs)
        confidence = "high";
      else if (best.score < 60)
        confidence = "low";
      return {
        root: best.element,
        confidence,
        reason: best.element.tagName.toLowerCase() + " with " + best.paragraphCount + " paragraphs, " + best.headingCount + " headings",
        fallbackUsed: false,
        score: Math.round(best.score)
      };
    }
    return {
      root: document.body,
      confidence: "low",
      reason: "no strong content root found; using document body",
      fallbackUsed: true,
      score: 0
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/utils/hash.js
  function hashString(input) {
    const str = typeof input === "string" ? input : String(input == null ? "" : input);
    let hash = 2166136261;
    for (let i = 0;i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
    }
    return hash.toString(36);
  }
  function hashTextSample(text, maxChars) {
    const limit = typeof maxChars === "number" ? maxChars : 120;
    const normalized = String(text || "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, limit);
    return hashString(normalized);
  }
  function combineHashes(parts) {
    return hashString((parts || []).join("|"));
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/utils/math.js
  function clamp(value, min, max) {
    if (value < min)
      return min;
    if (value > max)
      return max;
    return value;
  }
  function intersectionLength(aStart, aEnd, bStart, bEnd) {
    const start = Math.max(aStart, bStart);
    const end = Math.min(aEnd, bEnd);
    return Math.max(0, end - start);
  }
  function intersectionRatio(segTop, segBottom, winTop, winBottom) {
    const height = segBottom - segTop;
    if (height <= 0)
      return 0;
    const overlap = intersectionLength(segTop, segBottom, winTop, winBottom);
    return clamp(overlap / height, 0, 1);
  }
  function lastIndexAtOrBelow(sortedItems, target) {
    let lo = 0;
    let hi = sortedItems.length - 1;
    let result = -1;
    while (lo <= hi) {
      const mid = lo + hi >> 1;
      if (sortedItems[mid].top <= target) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }
  function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/content/headingIndex.js
  function buildHeadingIndex(root) {
    const scope = root || document.body;
    const scrollTop = getScrollTop();
    const nodes = scope.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const headings = [];
    let counter = 0;
    for (const node of nodes) {
      if (isInsideAppHost(node))
        continue;
      if (!isElementVisible(node))
        continue;
      const text = normalizeText(node.textContent || "");
      if (!text)
        continue;
      const level = parseInt(node.tagName.charAt(1), 10);
      const rect = node.getBoundingClientRect();
      const id = "h_" + String(counter).padStart(5, "0");
      counter++;
      headings.push({
        id,
        element: node,
        level,
        text,
        textHash: hashTextSample(text, 80),
        top: rect.top + scrollTop,
        bottom: rect.bottom + scrollTop,
        path: [],
        domPath: computeDomPath(node, scope),
        sectionIndex: headings.length,
        anchor: {
          elementId: node.id || null,
          domPath: computeDomPath(node, scope)
        }
      });
    }
    for (let i = 0;i < headings.length; i++) {
      const path = [];
      let currentLevel = headings[i].level;
      for (let j = i - 1;j >= 0; j--) {
        if (headings[j].level < currentLevel) {
          path.unshift(headings[j].text);
          currentLevel = headings[j].level;
          if (currentLevel === 1)
            break;
        }
      }
      path.push(headings[i].text);
      headings[i].path = path;
    }
    return headings;
  }
  function refreshHeadingGeometry(headings, scrollTop) {
    const st = typeof scrollTop === "number" ? scrollTop : getScrollTop();
    for (const heading of headings) {
      const rect = heading.element.getBoundingClientRect();
      heading.top = rect.top + st;
      heading.bottom = rect.bottom + st;
    }
  }
  function findCurrentHeading(headings, referenceY) {
    if (!headings.length)
      return null;
    const idx = lastIndexAtOrBelow(headings, referenceY);
    if (idx < 0)
      return headings[0];
    return headings[idx];
  }
  function nearbyHeadings(headings, currentId, above, below) {
    const a = typeof above === "number" ? above : 3;
    const b = typeof below === "number" ? below : 3;
    const index = headings.findIndex((h) => h.id === currentId);
    if (index < 0)
      return { above: [], below: [] };
    return {
      above: headings.slice(Math.max(0, index - a), index),
      below: headings.slice(index + 1, index + 1 + b)
    };
  }
  function referenceReadingY(scrollTop, viewportHeight) {
    return scrollTop + viewportHeight * CONFIG.currentHeadingRefRatio;
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/content/anchors.js
  function computeAnchors(element, options) {
    const opts = options || {};
    const text = normalizeText(element.textContent || "");
    const headingPath = opts.headingPath || [];
    return {
      elementId: element.id || null,
      closestHeadingId: opts.closestHeadingId || null,
      headingPathHash: headingPath.length ? combineHashes(headingPath.map((h) => hashTextSample(h, 80))) : null,
      domPath: computeDomPath(element, opts.root),
      textHash: text ? hashTextSample(text, 160) : null,
      scrollRatio: typeof opts.scrollRatio === "number" ? opts.scrollRatio : null
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/content/segmenter.js
  var ATOMIC_SELECTOR = "p,li,blockquote,pre,figure,table,h1,h2,h3,h4,h5,h6,dd,dt";
  function classifyType(element) {
    const tag = element.tagName;
    if (/^H[1-6]$/.test(tag))
      return "heading";
    if (tag === "P")
      return "paragraph";
    if (tag === "LI" || tag === "DD" || tag === "DT")
      return "list-item";
    if (tag === "BLOCKQUOTE")
      return "blockquote";
    if (tag === "PRE")
      return "code";
    if (tag === "FIGURE")
      return "figure";
    if (tag === "TABLE")
      return "table";
    if (tag === "SECTION")
      return "section";
    return "unknown-block";
  }
  function textBucket(length) {
    if (length < 80)
      return "short";
    if (length < 400)
      return "medium";
    return "long";
  }
  function hasAncestorIn(element, set) {
    let node = element.parentElement;
    while (node) {
      if (set.has(node))
        return true;
      node = node.parentElement;
    }
    return false;
  }
  function collectAtomics(root) {
    const all = Array.from(root.querySelectorAll(ATOMIC_SELECTOR));
    const kept = [];
    const keptSet = new Set;
    for (const node of all) {
      if (isInsideAppHost(node))
        continue;
      if (!isElementVisible(node))
        continue;
      if (node.tagName[0] !== "H" && hasAncestorIn(node, keptSet))
        continue;
      const text = normalizeText(node.textContent || "");
      const hasMedia = node.querySelector("img,svg,canvas,video,picture");
      if (!text && !hasMedia)
        continue;
      kept.push(node);
      keptSet.add(node);
    }
    if (kept.length < 2) {
      for (const node of root.querySelectorAll("div,section")) {
        if (isInsideAppHost(node) || !isElementVisible(node))
          continue;
        if (node.querySelector(ATOMIC_SELECTOR))
          continue;
        const text = normalizeText(node.textContent || "");
        if (text.length < 20)
          continue;
        if (hasAncestorIn(node, keptSet))
          continue;
        kept.push(node);
        keptSet.add(node);
      }
    }
    return kept;
  }
  function segmentContent(root, headings) {
    const scope = root || document.body;
    const scrollTop = getScrollTop();
    const docHeight = getDocumentHeight() || 1;
    const viewportHeight = getViewportHeight() || 800;
    const headingList = headings || [];
    const atomics = collectAtomics(scope);
    const raw = [];
    for (const element of atomics) {
      const rect = element.getBoundingClientRect();
      const top = rect.top + scrollTop;
      const bottom = rect.bottom + scrollTop;
      const height = Math.max(0, bottom - top);
      if (height <= 0)
        continue;
      raw.push({
        element,
        type: classifyType(element),
        top,
        bottom,
        height,
        text: normalizeText(element.textContent || "")
      });
    }
    raw.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
    const grouped = [];
    for (const item of raw) {
      const prev = grouped[grouped.length - 1];
      const small = item.height < CONFIG.segmentGroupMinHeightPx;
      if (prev && small && prev._small && prev.type === item.type && item.type !== "heading" && sameSection(headingList, prev.top, item.top)) {
        prev.bottom = item.bottom;
        prev.height = prev.bottom - prev.top;
        prev.elements.push(item.element);
        prev.text = (prev.text + " " + item.text).slice(0, 600);
      } else {
        grouped.push({
          element: item.element,
          elements: [item.element],
          type: item.type,
          top: item.top,
          bottom: item.bottom,
          height: item.height,
          text: item.text,
          _small: small
        });
      }
    }
    const expanded = [];
    const splitLimit = viewportHeight * CONFIG.virtualSplitViewportMultiple;
    for (const seg of grouped) {
      if (seg.elements.length === 1 && seg.height > splitLimit) {
        const bands = Math.min(6, Math.ceil(seg.height / viewportHeight));
        for (let i = 0;i < bands; i++) {
          const fracStart = i / bands;
          const fracEnd = (i + 1) / bands;
          expanded.push({
            element: seg.element,
            elements: [seg.element],
            type: seg.type,
            top: seg.top + seg.height * fracStart,
            bottom: seg.top + seg.height * fracEnd,
            height: seg.height / bands,
            text: seg.text,
            virtual: true,
            virtualIndex: i,
            fracStart,
            fracEnd
          });
        }
      } else {
        expanded.push(seg);
      }
    }
    const limited = expanded.slice(0, CONFIG.maxSegments);
    let blockCounter = -1;
    let prevBlockElement = null;
    let prevWasVirtual = false;
    for (const seg of limited) {
      const startsNewBlock = !seg.virtual || seg.element !== prevBlockElement || !prevWasVirtual || seg.virtualIndex === 0;
      if (startsNewBlock)
        blockCounter++;
      seg._blockIndex = blockCounter;
      prevBlockElement = seg.element;
      prevWasVirtual = !!seg.virtual;
    }
    const segments = [];
    const sectionLocalCounters = {};
    for (let i = 0;i < limited.length; i++) {
      const seg = limited[i];
      const heading = nearestHeadingAbove(headingList, seg.top);
      const sectionIndex = heading ? heading.sectionIndex : -1;
      if (!(sectionIndex in sectionLocalCounters))
        sectionLocalCounters[sectionIndex] = 0;
      const localIndex = sectionLocalCounters[sectionIndex]++;
      const baseId = "s_" + String(seg._blockIndex).padStart(5, "0");
      let id = baseId;
      let parentId = null;
      if (seg.virtual) {
        parentId = baseId;
        id = baseId + "_v" + String(seg.virtualIndex).padStart(2, "0");
      }
      const scrollStartRatio = seg.top / docHeight;
      const scrollEndRatio = seg.bottom / docHeight;
      const record = {
        id,
        parentId,
        element: seg.element,
        elements: seg.elements || [seg.element],
        type: seg.type,
        top: seg.top,
        bottom: seg.bottom,
        height: seg.height,
        virtual: !!seg.virtual,
        virtualIndex: seg.virtual ? seg.virtualIndex : null,
        fracStart: seg.virtual ? seg.fracStart : null,
        fracEnd: seg.virtual ? seg.fracEnd : null,
        scrollStartRatio,
        scrollEndRatio,
        headingId: heading ? heading.id : null,
        headingElementId: heading && heading.element ? heading.element.id || null : null,
        headingPath: heading ? heading.path.slice() : [],
        sectionIndex,
        localIndex,
        textLengthBucket: textBucket(seg.text.length),
        anchors: computeAnchors(seg.element, {
          root: scope,
          closestHeadingId: heading && heading.element ? heading.element.id || null : null,
          headingPath: heading ? heading.path : [],
          scrollRatio: scrollStartRatio
        })
      };
      segments.push(record);
    }
    return segments;
  }
  function nearestHeadingAbove(headings, y) {
    if (!headings.length)
      return null;
    const idx = lastIndexAtOrBelow(headings, y);
    if (idx < 0)
      return null;
    return headings[idx];
  }
  function sameSection(headings, topA, topB) {
    const a = nearestHeadingAbove(headings, topA);
    const b = nearestHeadingAbove(headings, topB);
    return a === b;
  }
  function refreshSegmentGeometry(segments, scrollTop, docHeight) {
    const st = typeof scrollTop === "number" ? scrollTop : getScrollTop();
    const dh = docHeight || getDocumentHeight() || 1;
    const rectCache = new Map;
    function rectFor(element) {
      let r = rectCache.get(element);
      if (!r) {
        r = element.getBoundingClientRect();
        rectCache.set(element, r);
      }
      return r;
    }
    for (const seg of segments) {
      if (seg.virtual) {
        const r = rectFor(seg.element);
        const elemTop = r.top + st;
        const elemHeight = Math.max(0, r.bottom - r.top);
        seg.top = elemTop + elemHeight * seg.fracStart;
        seg.bottom = elemTop + elemHeight * seg.fracEnd;
        seg.height = Math.max(0, seg.bottom - seg.top);
      } else if (seg.elements && seg.elements.length > 1) {
        const first = rectFor(seg.elements[0]);
        const last = rectFor(seg.elements[seg.elements.length - 1]);
        seg.top = first.top + st;
        seg.bottom = last.bottom + st;
        seg.height = Math.max(0, seg.bottom - seg.top);
      } else {
        const r = rectFor(seg.element);
        seg.top = r.top + st;
        seg.bottom = r.bottom + st;
        seg.height = Math.max(0, seg.bottom - seg.top);
      }
      seg.scrollStartRatio = seg.top / dh;
      seg.scrollEndRatio = seg.bottom / dh;
    }
    segments.sort((a, b) => a.top - b.top);
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/content/fingerprint.js
  function computeHeadingFingerprint(headings) {
    if (!headings || !headings.length)
      return null;
    const parts = headings.map((h) => h.level + ":" + h.textHash);
    return combineHashes(parts);
  }
  function computeContentFingerprint(segments) {
    if (!segments || !segments.length)
      return null;
    const typeCounts = {};
    let totalHeight = 0;
    for (const seg of segments) {
      typeCounts[seg.type] = (typeCounts[seg.type] || 0) + 1;
      totalHeight += seg.height || 0;
    }
    const typePart = Object.keys(typeCounts).sort().map((t) => t + ":" + typeCounts[t]).join(",");
    const bucketPart = "n" + segments.length + "|h" + Math.round(totalHeight / 100);
    return combineHashes([typePart, bucketPart]);
  }
  function compareFingerprints(stored, current) {
    if (!stored || !stored.contentFingerprint && !stored.headingFingerprint) {
      return { match: "unknown", reason: "no stored fingerprint" };
    }
    const headingMatch = stored.headingFingerprint === current.headingFingerprint;
    const contentMatch = stored.contentFingerprint === current.contentFingerprint;
    if (headingMatch && contentMatch)
      return { match: "exact", reason: "structure matches" };
    if (headingMatch || contentMatch)
      return { match: "partial", reason: "page changed somewhat" };
    return { match: "different", reason: "page structure changed significantly" };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/geometry/geometryCache.js
  function createGeometryCache() {
    let headings = [];
    let segments = [];
    let version = 0;
    let lastRefreshMs = 0;
    function setData(nextHeadings, nextSegments) {
      headings = nextHeadings || [];
      segments = nextSegments || [];
      segments.sort((a, b) => a.top - b.top);
      version += 1;
    }
    function refresh() {
      const start = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      const scrollTop = getScrollTop();
      const docHeight = getDocumentHeight() || 1;
      refreshHeadingGeometry(headings, scrollTop);
      refreshSegmentGeometry(segments, scrollTop, docHeight);
      segments.sort((a, b) => a.top - b.top);
      version += 1;
      const end = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      lastRefreshMs = end - start;
      return lastRefreshMs;
    }
    function findSegmentsNearRange(rangeTop, rangeBottom) {
      if (!segments.length)
        return [];
      const startIdx = Math.max(0, lastIndexAtOrBelow(segments, rangeBottom));
      const result = [];
      for (let i = startIdx;i >= 0; i--) {
        const seg = segments[i];
        if (seg.bottom < rangeTop) {
          if (seg.top < rangeTop - 4000)
            break;
          continue;
        }
        if (seg.top > rangeBottom)
          continue;
        result.push(seg);
      }
      for (let i = startIdx + 1;i < segments.length; i++) {
        const seg = segments[i];
        if (seg.top > rangeBottom)
          break;
        result.push(seg);
      }
      return result;
    }
    function findSegmentAtY(y) {
      if (!segments.length)
        return null;
      const idx = lastIndexAtOrBelow(segments, y);
      if (idx < 0)
        return segments[0];
      for (let i = idx;i >= 0 && i >= idx - 4; i--) {
        if (segments[i].top <= y && segments[i].bottom >= y)
          return segments[i];
      }
      return segments[idx];
    }
    return {
      setData,
      refresh,
      findSegmentsNearRange,
      findSegmentAtY,
      get headings() {
        return headings;
      },
      get segments() {
        return segments;
      },
      get version() {
        return version;
      },
      get lastRefreshMs() {
        return lastRefreshMs;
      }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/tracking/stateClassifier.js
  function getReadThresholdMs(segment) {
    const base = READ_THRESHOLD_BASE_MS[segment.type] || 4000;
    const heightFactor = Math.min(2.5, Math.max(0.75, (segment.height || 260) / 260));
    return Math.round(base * heightFactor);
  }
  function computeReadState(segment, stats) {
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
  function shouldPromoteToLastFocus(stats, sampleContext) {
    if (!sampleContext.canAccumulate)
      return false;
    if (sampleContext.velocityClass === "skim")
      return false;
    if (sampleContext.velocityClass === "jump")
      return false;
    if (stats.totalFocusedMs < CONFIG.lastFocusMinFocusedMs)
      return false;
    if (stats.maxActiveRatio < CONFIG.lastFocusMinActiveRatio)
      return false;
    return true;
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/tracking/readingTracker.js
  function freshStats(segmentId) {
    return {
      segmentId,
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
      stateUpdatedAt: null
    };
  }
  var VELOCITY_ACTIVE_FACTOR = {
    slow: 1,
    normal: 0.6,
    skim: 0.12,
    jump: 0,
    none: 0.8
  };
  function createReadingTracker(callbacks) {
    const cb = callbacks || {};
    const statsBySegmentId = new Map;
    let prevVisible = new Set;
    let prevActive = new Set;
    let nextVisible = new Set;
    let nextActive = new Set;
    let currentSegmentId = null;
    let lastFocusSegmentId = null;
    let lastFocusSavedAt = null;
    let manualMarkSegmentId = null;
    let manualMark = null;
    const session = {
      startedAt: wallNow(),
      activeTrackedMs: 0,
      pausedMs: 0,
      idleMs: 0,
      hiddenMs: 0,
      sampleCount: 0
    };
    function ensureStats(segmentId) {
      let s = statsBySegmentId.get(segmentId);
      if (!s) {
        s = freshStats(segmentId);
        statsBySegmentId.set(segmentId, s);
      }
      return s;
    }
    function getStats(segmentId) {
      return statsBySegmentId.get(segmentId) || null;
    }
    function beginSample() {
      nextVisible = new Set;
      nextActive = new Set;
    }
    function applyExposure(segment, data) {
      const stats = ensureStats(segment.id);
      const wc = data.wallClock;
      const focusFactor = typeof data.focusFactor === "number" ? data.focusFactor : 1;
      stats.lastVelocityClass = data.velocityClass;
      if (data.visibleRatio > 0) {
        nextVisible.add(segment.id);
        if (!prevVisible.has(segment.id)) {
          stats.visitCount += 1;
          if (!stats.firstSeenAt)
            stats.firstSeenAt = wc;
        }
        stats.lastSeenAt = wc;
        if (data.visibleRatio > stats.maxVisibleRatio)
          stats.maxVisibleRatio = data.visibleRatio;
        stats.totalVisibleMs += data.deltaMs * data.visibleRatio * focusFactor;
      }
      if (data.activeRatio > 0) {
        nextActive.add(segment.id);
        if (!prevActive.has(segment.id)) {
          stats.activeVisitCount += 1;
          if (!stats.firstActiveAt)
            stats.firstActiveAt = wc;
        }
        stats.lastActiveAt = wc;
        if (data.activeRatio > stats.maxActiveRatio)
          stats.maxActiveRatio = data.activeRatio;
        const rawActive = data.deltaMs * data.activeRatio * focusFactor;
        stats.totalActiveMs += rawActive;
        const velFactor = VELOCITY_ACTIVE_FACTOR[data.velocityClass] || 0.5;
        stats.totalFocusedMs += rawActive * velFactor;
        if (data.centerOverlap > 0) {
          stats.centerlineMs += data.deltaMs * data.centerOverlap * focusFactor;
        }
      }
      if ((data.velocityClass === "skim" || data.velocityClass === "jump") && data.visibleRatio > 0) {
        if (!prevVisible.has(segment.id))
          stats.fastPassCount += 1;
      }
      const nextState = computeReadState(segment, stats);
      if (nextState !== stats.state) {
        stats.state = nextState;
        stats.stateUpdatedAt = wc;
        if (cb.onSignificantStateChange)
          cb.onSignificantStateChange(segment.id, nextState);
      }
    }
    function endSample(context) {
      prevVisible = nextVisible;
      prevActive = nextActive;
      session.sampleCount += 1;
      const ctx = context || {};
      currentSegmentId = ctx.currentSegment ? ctx.currentSegment.id : null;
      if (ctx.currentSegment && ctx.currentSegmentStats) {
        const promote = shouldPromoteToLastFocus(ctx.currentSegmentStats, {
          canAccumulate: ctx.canAccumulate,
          velocityClass: ctx.velocityClass
        });
        if (promote && currentSegmentId !== lastFocusSegmentId) {
          setLastFocus(currentSegmentId, ctx.currentSegment);
        }
      }
    }
    function accountSessionTime(deltaMs, statusLabel, paused) {
      if (paused) {
        session.pausedMs += deltaMs;
      } else if (statusLabel === "hidden") {
        session.hiddenMs += deltaMs;
      } else if (statusLabel === "idle") {
        session.idleMs += deltaMs;
      } else if (statusLabel === "active") {
        session.activeTrackedMs += deltaMs;
      }
    }
    function setLastFocus(segmentId, segment) {
      lastFocusSegmentId = segmentId;
      lastFocusSavedAt = wallNow();
      if (cb.onLastFocusChange)
        cb.onLastFocusChange(segmentId, segment);
    }
    function setManualMark(segment, headingPath, anchors) {
      manualMarkSegmentId = segment ? segment.id : null;
      manualMark = segment ? {
        segmentId: segment.id,
        headingPath: headingPath || [],
        savedAt: wallNow(),
        anchors: anchors || segment.anchors || null
      } : null;
      if (cb.onManualMarkChange)
        cb.onManualMarkChange(manualMark);
    }
    function clearManualMark() {
      manualMarkSegmentId = null;
      manualMark = null;
      if (cb.onManualMarkChange)
        cb.onManualMarkChange(null);
    }
    function hydrate(persisted) {
      if (!persisted)
        return;
      if (persisted.segments) {
        for (const id in persisted.segments) {
          const s = freshStats(id);
          Object.assign(s, persisted.segments[id]);
          s.segmentId = id;
          statsBySegmentId.set(id, s);
        }
      }
      if (persisted.restore) {
        if (persisted.restore.lastFocus && persisted.restore.lastFocus.segmentId) {
          lastFocusSegmentId = persisted.restore.lastFocus.segmentId;
          lastFocusSavedAt = persisted.restore.lastFocus.savedAt || null;
        }
        if (persisted.restore.manualMark && persisted.restore.manualMark.segmentId) {
          manualMarkSegmentId = persisted.restore.manualMark.segmentId;
          manualMark = persisted.restore.manualMark;
        }
      }
    }
    function resetVisibility() {
      prevVisible = new Set;
      prevActive = new Set;
    }
    return {
      statsBySegmentId,
      session,
      ensureStats,
      getStats,
      beginSample,
      applyExposure,
      endSample,
      accountSessionTime,
      setLastFocus,
      setManualMark,
      clearManualMark,
      hydrate,
      resetVisibility,
      get currentSegmentId() {
        return currentSegmentId;
      },
      get lastFocusSegmentId() {
        return lastFocusSegmentId;
      },
      get lastFocusSavedAt() {
        return lastFocusSavedAt;
      },
      get manualMarkSegmentId() {
        return manualMarkSegmentId;
      },
      get manualMark() {
        return manualMark;
      },
      set lastFocusSegmentId(v) {
        lastFocusSegmentId = v;
      }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/tracking/idleTracker.js
  function createIdleTracker(options) {
    const opts = options || {};
    const onActivityResume = typeof opts.onActivityResume === "function" ? opts.onActivityResume : null;
    let lastActivityAt = wallNow();
    let wasIdle = false;
    let destroyed = false;
    function markActivity() {
      if (destroyed)
        return;
      const wasIdleBefore = isHardIdle();
      lastActivityAt = wallNow();
      if (wasIdleBefore && onActivityResume) {
        onActivityResume();
      }
      wasIdle = false;
    }
    function msSinceActivity() {
      return wallNow() - lastActivityAt;
    }
    function isHardIdle() {
      return msSinceActivity() >= CONFIG.idleHardMs;
    }
    function isSoftIdle() {
      const delta = msSinceActivity();
      return delta >= CONFIG.idleSoftMs && delta < CONFIG.idleHardMs;
    }
    function isHidden() {
      return typeof document !== "undefined" && document.hidden === true;
    }
    function isFocused() {
      try {
        return document.hasFocus();
      } catch (_e) {
        return true;
      }
    }
    function accumulationFactor() {
      if (isHidden())
        return 0;
      if (!isFocused())
        return 0;
      if (isHardIdle())
        return 0;
      if (isSoftIdle())
        return 0.5;
      return 1;
    }
    function statusLabel() {
      if (isHidden())
        return "hidden";
      if (!isFocused())
        return "unfocused";
      if (isHardIdle())
        return "idle";
      return "active";
    }
    const activityEvents = ["scroll", "pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
    const listeners = [];
    function addListener(target, type, handler, opts2) {
      target.addEventListener(type, handler, opts2 || { passive: true });
      listeners.push({ target, type, handler, opts: opts2 || { passive: true } });
    }
    const onActivity = () => markActivity();
    for (const type of activityEvents) {
      addListener(window, type, onActivity);
    }
    const onVisibility = () => {
      if (!isHidden())
        markActivity();
    };
    addListener(document, "visibilitychange", onVisibility);
    const onFocus = () => markActivity();
    addListener(window, "focus", onFocus);
    function destroy() {
      destroyed = true;
      for (const l of listeners) {
        try {
          l.target.removeEventListener(l.type, l.handler, l.opts);
        } catch (_e) {}
      }
      listeners.length = 0;
    }
    return {
      markActivity,
      msSinceActivity,
      isHidden,
      isFocused,
      isHardIdle,
      isSoftIdle,
      accumulationFactor,
      statusLabel,
      destroy,
      get lastActivityAt() {
        return lastActivityAt;
      }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/tracking/viewportSampler.js
  function classifyVelocity(pxPerSec) {
    const v = CONFIG.velocity;
    if (pxPerSec <= v.slowMaxPxPerSec)
      return "slow";
    if (pxPerSec <= v.normalMaxPxPerSec)
      return "normal";
    if (pxPerSec <= v.skimMaxPxPerSec)
      return "skim";
    return "jump";
  }
  function createViewportSampler(deps) {
    const { geometry, tracker, idle, state, onSampled } = deps;
    let lastSampleAt = 0;
    let lastScrollTop = getScrollTop();
    const velocityWindow = [];
    let lastSampleMs = 0;
    function resetSampleClock() {
      lastSampleAt = 0;
      lastScrollTop = getScrollTop();
      velocityWindow.length = 0;
    }
    function smoothedVelocity(instant) {
      velocityWindow.push(instant);
      if (velocityWindow.length > CONFIG.velocitySmoothingSamples)
        velocityWindow.shift();
      let sum = 0;
      for (const v of velocityWindow)
        sum += v;
      return sum / velocityWindow.length;
    }
    function getViewportSnapshot() {
      const scrollTop = getScrollTop();
      const viewportHeight = getViewportHeight();
      const docHeight = getDocumentHeight() || 1;
      const top = scrollTop;
      const bottom = scrollTop + viewportHeight;
      return {
        top,
        bottom,
        height: viewportHeight,
        center: top + viewportHeight / 2,
        bandTop: top + viewportHeight * CONFIG.activeBandTopRatio,
        bandBottom: top + viewportHeight * CONFIG.activeBandBottomRatio,
        docHeight,
        scrollRatio: bottom / docHeight
      };
    }
    function sample() {
      const t = now();
      if (lastSampleAt === 0) {
        lastSampleAt = t;
        lastScrollTop = getScrollTop();
        publishSnapshot(getViewportSnapshot(), null, null, "slow");
        return;
      }
      const deltaMs = t - lastSampleAt;
      if (deltaMs <= 0 || deltaMs > CONFIG.maxSampleGapMs) {
        resetSampleClock();
        lastSampleAt = t;
        tracker.resetVisibility();
        return;
      }
      const start = now();
      const viewport = getViewportSnapshot();
      const scrollDelta = Math.abs(viewport.top - lastScrollTop);
      const instantVelocity = scrollDelta / (deltaMs / 1000);
      const velocity = smoothedVelocity(instantVelocity);
      const velocityClass = classifyVelocity(velocity);
      const paused = state.tracking.pausedByUser === true;
      const statusLabel = paused ? "paused" : idle.statusLabel();
      const focusFactor = paused ? 0 : idle.accumulationFactor();
      const canAccumulate = focusFactor > 0;
      tracker.accountSessionTime(deltaMs, statusLabel, paused);
      const bandCenter = (viewport.bandTop + viewport.bandBottom) / 2;
      const currentSegment = geometry.findSegmentAtY(bandCenter);
      if (canAccumulate) {
        const candidates = geometry.findSegmentsNearRange(viewport.top, viewport.bottom);
        const wc = wallNow();
        tracker.beginSample();
        for (const seg of candidates) {
          const visibleRatio = intersectionRatio(seg.top, seg.bottom, viewport.top, viewport.bottom);
          if (visibleRatio <= 0)
            continue;
          const activeRatio = intersectionRatio(seg.top, seg.bottom, viewport.bandTop, viewport.bandBottom);
          const centerOverlap = intersectionRatio(seg.top, seg.bottom, bandCenter - 8, bandCenter + 8);
          tracker.applyExposure(seg, {
            deltaMs,
            visibleRatio,
            activeRatio,
            centerOverlap,
            velocityClass,
            focusFactor,
            wallClock: wc
          });
        }
        const currentStats = currentSegment ? tracker.getStats(currentSegment.id) : null;
        tracker.endSample({
          currentSegment,
          currentSegmentStats: currentStats,
          velocityClass,
          canAccumulate: true
        });
      } else {
        tracker.resetVisibility();
        tracker.endSample({
          currentSegment,
          currentSegmentStats: null,
          velocityClass,
          canAccumulate: false
        });
      }
      state.restore.lastRawScroll = {
        scrollTop: viewport.top,
        scrollRatio: viewport.scrollRatio,
        savedAt: wallNow()
      };
      lastSampleAt = t;
      lastScrollTop = viewport.top;
      lastSampleMs = now() - start;
      state.performance.lastSampleMs = lastSampleMs;
      state.tracking.sampleCount = tracker.session.sampleCount;
      publishSnapshot(viewport, currentSegment, velocity, velocityClass, statusLabel);
    }
    function publishSnapshot(viewport, currentSegment, velocity, velocityClass, statusLabel) {
      state.viewport = viewport;
      state.tracking.currentSegmentId = currentSegment ? currentSegment.id : null;
      state.tracking.velocity = velocity || 0;
      state.tracking.velocityClass = velocityClass || "slow";
      state.tracking.statusLabel = statusLabel || (state.tracking.pausedByUser ? "paused" : idle.statusLabel());
      if (typeof onSampled === "function")
        onSampled();
    }
    return {
      sample,
      resetSampleClock,
      getViewportSnapshot,
      get lastSampleMs() {
        return lastSampleMs;
      }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/storage/progressStore.js
  var INDEX_KEY = CONFIG.storagePrefix + "__index";
  function detectStorage() {
    try {
      const testKey = CONFIG.storagePrefix + "__test";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (_e) {
      return null;
    }
  }
  function createProgressStore() {
    let backend = detectStorage();
    const sessionData = new Map;
    let sessionOnly = !backend;
    function getMode() {
      if (sessionOnly)
        return "session-only";
      return "persistent";
    }
    function isAvailable() {
      return !sessionOnly && !!backend;
    }
    function enableSessionOnly() {
      sessionOnly = true;
    }
    function readIndex() {
      if (!backend)
        return {};
      try {
        const raw = backend.getItem(INDEX_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (_e) {
        return {};
      }
    }
    function writeIndex(index) {
      if (!backend)
        return;
      try {
        backend.setItem(INDEX_KEY, JSON.stringify(index));
      } catch (_e) {}
    }
    function touchIndex(key) {
      const index = readIndex();
      index[key] = wallNow();
      writeIndex(index);
      pruneIfNeeded(index);
    }
    function pruneIfNeeded(index) {
      if (!backend)
        return;
      const entries = Object.keys(index).map((k) => ({ key: k, at: index[k] }));
      const cutoff = wallNow() - CONFIG.maxRecordAgeDays * 24 * 60 * 60 * 1000;
      let changed = false;
      for (const e of entries) {
        if (e.at < cutoff) {
          try {
            backend.removeItem(e.key);
          } catch (_err) {}
          delete index[e.key];
          changed = true;
        }
      }
      const remaining = Object.keys(index).map((k) => ({ key: k, at: index[k] }));
      if (remaining.length > CONFIG.maxStoredRecords) {
        remaining.sort((a, b) => a.at - b.at);
        const excess = remaining.length - CONFIG.maxStoredRecords;
        for (let i = 0;i < excess; i++) {
          try {
            backend.removeItem(remaining[i].key);
          } catch (_err) {}
          delete index[remaining[i].key];
          changed = true;
        }
      }
      if (changed)
        writeIndex(index);
    }
    function load(key) {
      if (sessionOnly) {
        return sessionData.get(key) || null;
      }
      try {
        const raw = backend.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (_e) {
        return null;
      }
    }
    function save(key, record) {
      if (sessionOnly) {
        sessionData.set(key, record);
        return { ok: true, mode: "session-only" };
      }
      try {
        backend.setItem(key, JSON.stringify(record));
        touchIndex(key);
        return { ok: true, mode: "persistent" };
      } catch (_e) {
        sessionOnly = true;
        sessionData.set(key, record);
        return { ok: false, mode: "session-only", error: "storage-write-failed" };
      }
    }
    function remove(key) {
      sessionData.delete(key);
      if (!backend)
        return true;
      try {
        backend.removeItem(key);
        const index = readIndex();
        if (index[key]) {
          delete index[key];
          writeIndex(index);
        }
        return true;
      } catch (_e) {
        return false;
      }
    }
    return {
      isAvailable,
      getMode,
      enableSessionOnly,
      load,
      save,
      remove
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/storage/serialize.js
  function compactSegmentStats(stats) {
    return {
      totalVisibleMs: Math.round(stats.totalVisibleMs),
      totalActiveMs: Math.round(stats.totalActiveMs),
      totalFocusedMs: Math.round(stats.totalFocusedMs),
      visitCount: stats.visitCount,
      activeVisitCount: stats.activeVisitCount,
      maxVisibleRatio: roundTo(stats.maxVisibleRatio, 3),
      maxActiveRatio: roundTo(stats.maxActiveRatio, 3),
      fastPassCount: stats.fastPassCount,
      firstSeenAt: stats.firstSeenAt,
      lastSeenAt: stats.lastSeenAt,
      state: stats.state
    };
  }
  function buildRestoreTarget(segmentId, segment, savedAt) {
    if (!segmentId)
      return null;
    const anchors = segment ? segment.anchors : null;
    return {
      segmentId,
      savedAt: savedAt || wallNow(),
      headingPathHash: anchors ? anchors.headingPathHash : null,
      segmentType: segment ? segment.type : null,
      scrollRatio: segment ? segment.scrollStartRatio : anchors ? anchors.scrollRatio : null,
      anchors: anchors ? {
        elementId: anchors.elementId,
        closestHeadingId: anchors.closestHeadingId,
        headingPathHash: anchors.headingPathHash,
        domPath: anchors.domPath,
        textHash: anchors.textHash,
        scrollRatio: anchors.scrollRatio
      } : null
    };
  }
  function serializeProgress(deps) {
    const { identity, tracker, getSegmentById, timestamps } = deps;
    const segments = {};
    tracker.statsBySegmentId.forEach((stats, id) => {
      if (stats.state === "unseen" && stats.totalVisibleMs <= 0)
        return;
      segments[id] = compactSegmentStats(stats);
    });
    const lastFocusSegment = tracker.lastFocusSegmentId ? getSegmentById(tracker.lastFocusSegmentId) : null;
    const manualMark = tracker.manualMark;
    return {
      schemaVersion: CONFIG.schemaVersion,
      appVersion: CONFIG.appVersion,
      page: {
        key: identity.key,
        originalUrl: identity.originalUrl,
        normalizedUrl: identity.normalizedUrl,
        title: identity.title,
        contentFingerprint: identity.contentFingerprint,
        headingFingerprint: identity.headingFingerprint
      },
      timestamps: {
        createdAt: timestamps && timestamps.createdAt || identity.createdAt,
        lastOpenedAt: timestamps && timestamps.lastOpenedAt || wallNow(),
        lastSavedAt: wallNow()
      },
      restore: {
        lastFocus: buildRestoreTarget(tracker.lastFocusSegmentId, lastFocusSegment, tracker.lastFocusSavedAt),
        manualMark: manualMark ? {
          segmentId: manualMark.segmentId,
          savedAt: manualMark.savedAt,
          headingPathHash: manualMark.anchors && manualMark.anchors.headingPathHash ? manualMark.anchors.headingPathHash : null,
          segmentType: getSegmentById(manualMark.segmentId) ? getSegmentById(manualMark.segmentId).type : null,
          scrollRatio: manualMark.anchors && typeof manualMark.anchors.scrollRatio === "number" ? manualMark.anchors.scrollRatio : null,
          anchors: manualMark.anchors || null
        } : null,
        lastRawScroll: deps.lastRawScroll || null
      },
      session: {
        startedAt: tracker.session.startedAt,
        activeTrackedMs: Math.round(tracker.session.activeTrackedMs),
        idleMs: Math.round(tracker.session.idleMs),
        hiddenMs: Math.round(tracker.session.hiddenMs),
        pausedMs: Math.round(tracker.session.pausedMs),
        sampleCount: tracker.session.sampleCount
      },
      segments
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/restore/restoreEngine.js
  function makeResult(ok, extra) {
    return Object.assign({
      ok,
      confidence: "none",
      method: "none",
      targetSegmentId: null,
      targetElement: null,
      scrollTop: null,
      message: ""
    }, extra || {});
  }
  function segmentScrollTop(segment) {
    return Math.max(0, segment.top - window.innerHeight * 0.3);
  }
  function resolveRestoreTarget(target, deps) {
    const { segmentsById, segments, root, docHeight } = deps;
    if (!target) {
      return makeResult(false, {
        message: "No saved reading position for this page."
      });
    }
    const anchors = target.anchors || {};
    if (target.segmentId && segmentsById.has(target.segmentId)) {
      const seg = segmentsById.get(target.segmentId);
      return makeResult(true, {
        confidence: "high",
        method: "segment-id",
        targetSegmentId: seg.id,
        targetElement: seg.element,
        scrollTop: segmentScrollTop(seg),
        message: "Restored to your last reading position."
      });
    }
    if (anchors.elementId) {
      const el2 = document.getElementById(anchors.elementId);
      if (el2 && !isInsideAppHost(el2)) {
        const seg = findSegmentByElement(segments, el2);
        return makeResult(true, {
          confidence: "high",
          method: "element-id",
          targetSegmentId: seg ? seg.id : null,
          targetElement: el2,
          scrollTop: seg ? segmentScrollTop(seg) : elementScrollTop(el2),
          message: "Restored to your last reading position."
        });
      }
    }
    if (anchors.closestHeadingId) {
      const headingEl = document.getElementById(anchors.closestHeadingId);
      if (headingEl && !isInsideAppHost(headingEl)) {
        const seg = findSegmentUnderHeading(segments, anchors.closestHeadingId, target.segmentType);
        const el2 = seg ? seg.element : headingEl;
        return makeResult(true, {
          confidence: seg ? "high" : "medium",
          method: "closest-heading-id",
          targetSegmentId: seg ? seg.id : null,
          targetElement: el2,
          scrollTop: seg ? segmentScrollTop(seg) : elementScrollTop(headingEl),
          message: "Restored near your last reading position."
        });
      }
    }
    if (anchors.headingPathHash) {
      const matches = segments.filter((s) => s.anchors && s.anchors.headingPathHash === anchors.headingPathHash);
      const typed = target.segmentType ? matches.filter((s) => s.type === target.segmentType) : matches;
      const pool = typed.length ? typed : matches;
      if (pool.length) {
        const seg = nearestByScrollRatio(pool, target.scrollRatio);
        return makeResult(true, {
          confidence: pool.length === 1 ? "medium" : "medium",
          method: "heading-path-plus-index",
          targetSegmentId: seg.id,
          targetElement: seg.element,
          scrollTop: segmentScrollTop(seg),
          message: "Restored near your last reading position."
        });
      }
    }
    if (anchors.domPath) {
      const el2 = resolveDomPath(anchors.domPath, root);
      if (el2 && !isInsideAppHost(el2)) {
        const seg = findSegmentByElement(segments, el2);
        return makeResult(true, {
          confidence: "medium",
          method: "dom-path",
          targetSegmentId: seg ? seg.id : null,
          targetElement: el2,
          scrollTop: seg ? segmentScrollTop(seg) : elementScrollTop(el2),
          message: "Restored to an approximate reading position."
        });
      }
    }
    if (anchors.textHash) {
      const matches = segments.filter((s) => s.anchors && s.anchors.textHash === anchors.textHash);
      if (matches.length) {
        const unique = matches.length === 1;
        const seg = unique ? matches[0] : nearestByScrollRatio(matches, target.scrollRatio);
        return makeResult(true, {
          confidence: unique ? "medium" : "low",
          method: "text-hash",
          targetSegmentId: seg.id,
          targetElement: seg.element,
          scrollTop: segmentScrollTop(seg),
          message: unique ? "Restored near your last reading position." : "Restored to an approximate reading position."
        });
      }
    }
    if (typeof target.scrollRatio === "number") {
      const scrollTop = Math.max(0, target.scrollRatio * (docHeight || 1) - window.innerHeight * 0.3);
      return makeResult(true, {
        confidence: "low",
        method: "scroll-ratio",
        targetSegmentId: null,
        targetElement: null,
        scrollTop,
        message: "Restored to an approximate scroll position. The page may have changed."
      });
    }
    return makeResult(false, {
      message: "Saved progress exists, but the target could not be found on this page."
    });
  }
  function findSegmentByElement(segments, element) {
    for (const s of segments) {
      if (s.element === element)
        return s;
      if (s.elements && s.elements.indexOf(element) !== -1)
        return s;
    }
    for (const s of segments) {
      if (s.element && s.element.contains && s.element.contains(element))
        return s;
    }
    return null;
  }
  function findSegmentUnderHeading(segments, headingElementId, type) {
    const under = segments.filter((s) => s.headingElementId === headingElementId);
    if (!under.length)
      return null;
    if (type) {
      const typed = under.filter((s) => s.type === type);
      if (typed.length)
        return typed[0];
    }
    return under[0];
  }
  function nearestByScrollRatio(pool, scrollRatio) {
    if (typeof scrollRatio !== "number")
      return pool[0];
    let best = pool[0];
    let bestDelta = Infinity;
    for (const s of pool) {
      const delta = Math.abs((s.scrollStartRatio || 0) - scrollRatio);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = s;
      }
    }
    return best;
  }
  function elementScrollTop(element) {
    try {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      return Math.max(0, rect.top + scrollTop - window.innerHeight * 0.3);
    } catch (_e) {
      return 0;
    }
  }
  function confidenceLabel(confidence) {
    switch (confidence) {
      case "high":
        return "Exact or near exact";
      case "medium":
        return "Likely";
      case "low":
        return "Approximate";
      default:
        return "Not available";
    }
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/restore/scrollToTarget.js
  function scrollToElement(element) {
    if (!element)
      return false;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    try {
      if (typeof element.scrollIntoView === "function") {
        element.scrollIntoView({ behavior, block: "center", inline: "nearest" });
        return true;
      }
    } catch (_e) {}
    try {
      const rect = element.getBoundingClientRect();
      const targetTop = rect.top + getScrollTop() - window.innerHeight * 0.35;
      window.scrollTo({ top: Math.max(0, targetTop), behavior });
      return true;
    } catch (_e2) {
      return false;
    }
  }
  function scrollToOffset(scrollTop) {
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    try {
      window.scrollTo({ top: Math.max(0, scrollTop), behavior });
      return true;
    } catch (_e) {
      try {
        window.scrollTo(0, Math.max(0, scrollTop));
        return true;
      } catch (_e2) {
        return false;
      }
    }
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/overlays/overlayMarkers.js
  var LAYER_ID = CONFIG.hostId + "-overlays";
  function createOverlayMarkers() {
    let layer = null;
    let currentBar = null;
    let lastFocusBar = null;
    let manualBar = null;
    let debugBand = null;
    let highlightBox = null;
    let highlightTimer = null;
    let debugEnabled = false;
    function mount() {
      if (layer)
        return;
      layer = document.createElement("div");
      layer.id = LAYER_ID;
      layer.setAttribute(CONFIG.hostDataAttr, "overlay");
      Object.assign(layer.style, {
        position: "fixed",
        left: "0",
        top: "0",
        width: "0",
        height: "0",
        margin: "0",
        padding: "0",
        border: "0",
        pointerEvents: "none",
        zIndex: "2147483646"
      });
      currentBar = makeBar("rgba(37, 99, 235, 0.85)");
      lastFocusBar = makeBar("rgba(217, 119, 6, 0.9)");
      manualBar = makeBar("rgba(147, 51, 234, 0.9)");
      layer.appendChild(currentBar);
      layer.appendChild(lastFocusBar);
      layer.appendChild(manualBar);
      document.body.appendChild(layer);
    }
    function makeBar(color) {
      const bar = document.createElement("div");
      Object.assign(bar.style, {
        position: "fixed",
        left: "0",
        width: "4px",
        height: "0",
        background: color,
        borderRadius: "0 3px 3px 0",
        boxShadow: "0 0 4px " + color,
        pointerEvents: "none",
        opacity: "0",
        transition: prefersReducedMotion() ? "none" : "top 0.15s linear, height 0.15s linear, opacity 0.2s"
      });
      return bar;
    }
    function positionBar(bar, segment, scrollTop) {
      if (!bar)
        return;
      if (!segment) {
        bar.style.opacity = "0";
        return;
      }
      const screenTop = segment.top - scrollTop;
      const height = Math.max(6, Math.min(segment.height, window.innerHeight));
      if (screenTop + height < 0 || screenTop > window.innerHeight) {
        bar.style.opacity = "0";
        return;
      }
      bar.style.top = screenTop + "px";
      bar.style.height = height + "px";
      bar.style.opacity = "1";
    }
    function update(info) {
      if (!layer || !info)
        return;
      const scrollTop = info.viewport ? info.viewport.top : getScrollTop();
      const byId = info.segmentsById;
      positionBar(currentBar, byId && info.currentSegmentId ? byId.get(info.currentSegmentId) : null, scrollTop);
      positionBar(lastFocusBar, byId && info.lastFocusSegmentId ? byId.get(info.lastFocusSegmentId) : null, scrollTop);
      positionBar(manualBar, byId && info.manualMarkSegmentId ? byId.get(info.manualMarkSegmentId) : null, scrollTop);
      if (debugEnabled && info.viewport) {
        showDebugBand(info.viewport, scrollTop);
      } else if (debugBand) {
        debugBand.style.opacity = "0";
      }
    }
    function showDebugBand(viewport, scrollTop) {
      if (!debugBand) {
        debugBand = document.createElement("div");
        Object.assign(debugBand.style, {
          position: "fixed",
          left: "0",
          width: "100%",
          background: "rgba(37, 99, 235, 0.08)",
          borderTop: "1px dashed rgba(37,99,235,0.5)",
          borderBottom: "1px dashed rgba(37,99,235,0.5)",
          pointerEvents: "none"
        });
        layer.appendChild(debugBand);
      }
      debugBand.style.top = viewport.bandTop - scrollTop + "px";
      debugBand.style.height = viewport.bandBottom - viewport.bandTop + "px";
      debugBand.style.opacity = "1";
    }
    function setDebug(on) {
      debugEnabled = !!on;
      if (!debugEnabled && debugBand)
        debugBand.style.opacity = "0";
    }
    function showRestoreHighlight(element) {
      if (!layer || !element)
        return;
      if (highlightTimer) {
        clearTimeout(highlightTimer);
        highlightTimer = null;
      }
      if (!highlightBox) {
        highlightBox = document.createElement("div");
        Object.assign(highlightBox.style, {
          position: "fixed",
          pointerEvents: "none",
          border: "2px solid rgba(217, 119, 6, 0.95)",
          borderRadius: "6px",
          background: "rgba(217, 119, 6, 0.12)",
          boxShadow: "0 0 0 4px rgba(217,119,6,0.15)",
          opacity: "0",
          transition: prefersReducedMotion() ? "none" : "opacity 0.25s ease",
          zIndex: "2147483646"
        });
        layer.appendChild(highlightBox);
      }
      const reposition = () => {
        const rect = element.getBoundingClientRect();
        highlightBox.style.top = rect.top - 4 + "px";
        highlightBox.style.left = rect.left - 4 + "px";
        highlightBox.style.width = rect.width + 8 + "px";
        highlightBox.style.height = rect.height + 8 + "px";
      };
      reposition();
      highlightBox.style.opacity = "1";
      highlightTimer = setTimeout(() => {
        if (highlightBox)
          highlightBox.style.opacity = "0";
        highlightTimer = null;
      }, CONFIG.restoreHighlightMs);
    }
    function destroy() {
      if (highlightTimer) {
        clearTimeout(highlightTimer);
        highlightTimer = null;
      }
      if (layer && layer.parentNode)
        layer.parentNode.removeChild(layer);
      layer = currentBar = lastFocusBar = manualBar = debugBand = highlightBox = null;
    }
    return { mount, update, setDebug, showRestoreHighlight, destroy };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/styles.css.js
  var STYLES = `
:host {
  all: initial;
  --rn-bg: #ffffff;
  --rn-fg: #1f2328;
  --rn-muted: #57606a;
  --rn-border: #d0d7de;
  --rn-accent: #2563eb;
  --rn-accent-fg: #ffffff;
  --rn-focus: #d97706;
  --rn-manual: #9333ea;
  --rn-panel-shadow: 0 8px 32px rgba(0,0,0,0.18);
  --rn-radius: 10px;
  --rn-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --rn-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --rn-font-scale: 1;
  --rn-opacity: 1;
  /* state colors */
  --rn-unseen: #e5e7eb;
  --rn-seen: #93c5fd;
  --rn-skimmed: #fcd34d;
  --rn-read: #34d399;
  --rn-reread: #059669;
  --rn-active: #2563eb;
  --rn-lastfocus: #d97706;
  --rn-mark: #9333ea;
}

.rn-root, .rn-root * {
  box-sizing: border-box;
}

.rn-root {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 340px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  background: var(--rn-bg);
  color: var(--rn-fg);
  font-family: var(--rn-font);
  font-size: calc(13px * var(--rn-font-scale));
  line-height: 1.45;
  border: 1px solid var(--rn-border);
  border-radius: var(--rn-radius);
  box-shadow: var(--rn-panel-shadow);
  opacity: var(--rn-opacity);
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:host([data-theme="dark"]) {
  --rn-bg: #161b22;
  --rn-fg: #e6edf3;
  --rn-muted: #9198a1;
  --rn-border: #30363d;
  --rn-accent: #4d8bf0;
  --rn-unseen: #30363d;
}

:host([data-contrast="high"]) {
  --rn-border: #000000;
  --rn-fg: #000000;
  --rn-panel-shadow: 0 0 0 2px #000000, 0 8px 32px rgba(0,0,0,0.4);
}
:host([data-theme="dark"][data-contrast="high"]) {
  --rn-border: #ffffff;
  --rn-fg: #ffffff;
}

/* Title bar */
.rn-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--rn-accent);
  color: var(--rn-accent-fg);
  cursor: grab;
  user-select: none;
  flex: 0 0 auto;
}
.rn-titlebar.rn-dragging { cursor: grabbing; }
.rn-title {
  font-weight: 600;
  font-size: calc(13px * var(--rn-font-scale));
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rn-titlebar-buttons { display: flex; gap: 4px; flex: 0 0 auto; }

.rn-iconbtn {
  all: unset;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--rn-accent-fg);
  font-size: 14px;
  line-height: 1;
}
.rn-iconbtn:hover { background: rgba(255,255,255,0.18); }
.rn-iconbtn:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

/* Body scroll area */
.rn-body {
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
}

.rn-section { display: flex; flex-direction: column; gap: 6px; }
.rn-section-title {
  font-size: calc(11px * var(--rn-font-scale));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--rn-muted);
  font-weight: 600;
  margin: 0;
}

/* Status bar */
.rn-statusbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.rn-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: calc(11px * var(--rn-font-scale));
  font-weight: 600;
  background: var(--rn-unseen);
  color: var(--rn-fg);
}
.rn-pill.rn-tracking { background: #dcfce7; color: #166534; }
.rn-pill.rn-paused { background: #fef3c7; color: #92400e; }
.rn-pill.rn-idle, .rn-pill.rn-hidden, .rn-pill.rn-unfocused { background: #e5e7eb; color: #57606a; }
.rn-pill.rn-session-only { background: #fee2e2; color: #991b1b; }
.rn-pill.rn-saving { background: #dbeafe; color: #1e40af; }
.rn-pill.rn-saved { background: #dcfce7; color: #166534; }
:host([data-theme="dark"]) .rn-pill { background: #30363d; }

/* Heading context */
.rn-heading-path {
  font-size: calc(12px * var(--rn-font-scale));
  color: var(--rn-fg);
  word-break: break-word;
}
.rn-heading-path .rn-crumb { color: var(--rn-muted); }
.rn-heading-path .rn-crumb-current { color: var(--rn-fg); font-weight: 600; }

.rn-heading-list { display: flex; flex-direction: column; gap: 2px; }
.rn-heading-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.rn-heading-jump {
  all: unset;
  cursor: pointer;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 6px;
  min-width: 0;
}
.rn-heading-jump:hover { background: rgba(37,99,235,0.08); }
.rn-heading-jump:focus-visible { outline: 2px solid var(--rn-accent); }
.rn-heading-jump.rn-current { background: rgba(37,99,235,0.12); font-weight: 600; }
.rn-heading-text {
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: calc(12px * var(--rn-font-scale));
}
.rn-lvl { color: var(--rn-muted); font-size: calc(10px * var(--rn-font-scale)); font-family: var(--rn-mono); flex: 0 0 auto; }

.rn-progressbar {
  flex: 0 0 54px;
  height: 6px;
  background: var(--rn-unseen);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.rn-progressbar > i {
  display: block;
  height: 100%;
  background: var(--rn-read);
  width: 0%;
}
.rn-section-flags { display: inline-flex; gap: 3px; flex: 0 0 auto; }
.rn-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.rn-dot.rn-lf { background: var(--rn-lastfocus); }
.rn-dot.rn-mk { background: var(--rn-mark); }

/* Restore card */
.rn-card {
  border: 1px solid var(--rn-border);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(217,119,6,0.06);
}
.rn-card.rn-empty { background: transparent; color: var(--rn-muted); }
.rn-card-row { display: flex; justify-content: space-between; gap: 8px; font-size: calc(12px * var(--rn-font-scale)); }
.rn-card-label { color: var(--rn-muted); }
.rn-card-warn { color: #92400e; font-size: calc(11px * var(--rn-font-scale)); }

.rn-btn {
  all: unset;
  cursor: pointer;
  text-align: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: calc(12px * var(--rn-font-scale));
  font-weight: 600;
  background: var(--rn-unseen);
  color: var(--rn-fg);
  border: 1px solid var(--rn-border);
}
.rn-btn:hover { filter: brightness(0.97); }
.rn-btn:focus-visible { outline: 2px solid var(--rn-accent); outline-offset: 1px; }
.rn-btn.rn-primary { background: var(--rn-accent); color: var(--rn-accent-fg); border-color: transparent; }
.rn-btn.rn-danger { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
.rn-btn:disabled, .rn-btn[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }

/* Controls grid */
.rn-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.rn-controls .rn-wide { grid-column: 1 / -1; }

/* Settings */
.rn-setting-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rn-setting-row label { font-size: calc(12px * var(--rn-font-scale)); color: var(--rn-fg); }
.rn-setting-row input[type="range"] { flex: 1 1 auto; }
.rn-seg-toggle { display: inline-flex; border: 1px solid var(--rn-border); border-radius: 6px; overflow: hidden; }
.rn-seg-toggle button {
  all: unset; cursor: pointer; padding: 3px 8px; font-size: calc(11px * var(--rn-font-scale));
}
.rn-seg-toggle button.rn-on { background: var(--rn-accent); color: var(--rn-accent-fg); }

/* Minimap rail */
.rn-minimap-wrap { display: flex; gap: 8px; }
.rn-minimap {
  position: relative;
  flex: 0 0 22px;
  width: 22px;
  min-height: 160px;
  background: var(--rn-unseen);
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
}
.rn-mini-seg { position: absolute; left: 0; width: 100%; }
.rn-mini-seg.s-unseen { background: transparent; }
.rn-mini-seg.s-seen { background: var(--rn-seen); }
.rn-mini-seg.s-skimmed { background: var(--rn-skimmed); }
.rn-mini-seg.s-probably-read { background: var(--rn-read); }
.rn-mini-seg.s-reread { background: var(--rn-reread); }
.rn-mini-seg.s-active { background: var(--rn-active); }
.rn-mini-viewport {
  position: absolute; left: 0; width: 100%;
  background: rgba(37,99,235,0.18);
  border-top: 1px solid var(--rn-active);
  border-bottom: 1px solid var(--rn-active);
  pointer-events: none;
}
.rn-mini-marker { position: absolute; left: 0; width: 100%; height: 2px; pointer-events: none; }
.rn-mini-marker.rn-lf { background: var(--rn-lastfocus); box-shadow: 0 0 3px var(--rn-lastfocus); height: 3px; }
.rn-mini-marker.rn-mk { background: var(--rn-mark); box-shadow: 0 0 3px var(--rn-mark); height: 3px; }

.rn-legend { display: flex; flex-direction: column; gap: 3px; flex: 1 1 auto; justify-content: center; }
.rn-legend-item { display: flex; align-items: center; gap: 6px; font-size: calc(10px * var(--rn-font-scale)); color: var(--rn-muted); }
.rn-legend-swatch { width: 12px; height: 8px; border-radius: 2px; flex: 0 0 auto; }

/* Progress summary */
.rn-progress-summary { display: flex; height: 8px; border-radius: 4px; overflow: hidden; }
.rn-progress-summary > span { display: block; height: 100%; }

/* Debug */
.rn-debug { font-family: var(--rn-mono); font-size: calc(10px * var(--rn-font-scale)); color: var(--rn-muted); white-space: pre-wrap; }

/* Empty state */
.rn-empty-state { color: var(--rn-muted); font-size: calc(12px * var(--rn-font-scale)); text-align: center; padding: 8px; }

/* Compact mode */
:host([data-mode="compact"]) .rn-root { width: 210px; }
:host([data-mode="compact"]) .rn-collapsible { display: none; }
:host([data-mode="compact"]) .rn-minimap { min-height: 220px; }

/* Resize handle */
.rn-resize {
  position: absolute;
  width: 14px; height: 14px;
  right: 2px; bottom: 2px;
  cursor: nwse-resize;
  background:
    linear-gradient(135deg, transparent 50%, var(--rn-muted) 50%, var(--rn-muted) 60%, transparent 60%, transparent 70%, var(--rn-muted) 70%, var(--rn-muted) 80%, transparent 80%);
  opacity: 0.6;
}

/* ARIA live region visually hidden */
.rn-live {
  position: absolute !important;
  width: 1px; height: 1px;
  overflow: hidden; clip: rect(0 0 0 0);
  white-space: nowrap;
}

.rn-confirm {
  display: flex; flex-direction: column; gap: 8px;
  padding: 10px; border: 1px solid var(--rn-border); border-radius: 8px;
  background: var(--rn-bg);
}
.rn-confirm-actions { display: flex; gap: 6px; }
.rn-confirm-actions .rn-btn { flex: 1 1 0; }

@media (prefers-reduced-motion: reduce) {
  .rn-root, .rn-root * { transition: none !important; scroll-behavior: auto !important; }
}
`;

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/shadowHost.js
  function createShadowHost() {
    const host = document.createElement("div");
    host.id = CONFIG.hostId;
    host.setAttribute(CONFIG.hostDataAttr, "host");
    host.setAttribute("data-mode", "expanded");
    host.setAttribute("data-theme", "light");
    host.setAttribute("data-contrast", "soft");
    host.style.all = "initial";
    const shadowRoot = host.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    shadowRoot.appendChild(styleEl);
    const root = el("div", { class: "rn-root", role: "region", "aria-label": CONFIG.appName });
    shadowRoot.appendChild(root);
    document.body.appendChild(host);
    const cleanups = [];
    function setMode(mode) {
      host.setAttribute("data-mode", mode === "compact" ? "compact" : "expanded");
    }
    function setTheme(theme) {
      host.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    }
    function setContrast(contrast) {
      host.setAttribute("data-contrast", contrast === "high" ? "high" : "soft");
    }
    function setFontScale(scale) {
      root.style.setProperty("--rn-font-scale", String(scale));
    }
    function setOpacity(opacity) {
      root.style.setProperty("--rn-opacity", String(opacity));
    }
    function enableDrag(handle) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;
      const onDown = (e) => {
        if (e.button !== undefined && e.button !== 0)
          return;
        dragging = true;
        handle.classList.add("rn-dragging");
        const rect = root.getBoundingClientRect();
        root.style.left = rect.left + "px";
        root.style.top = rect.top + "px";
        root.style.right = "auto";
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        e.preventDefault();
      };
      const onMove = (e) => {
        if (!dragging)
          return;
        const maxLeft = window.innerWidth - 60;
        const maxTop = window.innerHeight - 40;
        const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + (e.clientX - startX)));
        const nextTop = Math.min(maxTop, Math.max(0, startTop + (e.clientY - startY)));
        root.style.left = nextLeft + "px";
        root.style.top = nextTop + "px";
      };
      const onUp = () => {
        dragging = false;
        handle.classList.remove("rn-dragging");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      handle.addEventListener("pointerdown", onDown);
      cleanups.push(() => {
        handle.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      });
    }
    function enableResize(handle) {
      let resizing = false;
      let startX = 0;
      let startY = 0;
      let startW = 0;
      let startH = 0;
      const onDown = (e) => {
        resizing = true;
        const rect = root.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startW = rect.width;
        startH = rect.height;
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        e.preventDefault();
        e.stopPropagation();
      };
      const onMove = (e) => {
        if (!resizing)
          return;
        const nextW = Math.max(200, Math.min(window.innerWidth - 20, startW + (e.clientX - startX)));
        const nextH = Math.max(160, Math.min(window.innerHeight - 20, startH + (e.clientY - startY)));
        root.style.width = nextW + "px";
        root.style.height = nextH + "px";
        root.style.maxHeight = "none";
      };
      const onUp = () => {
        resizing = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      handle.addEventListener("pointerdown", onDown);
      cleanups.push(() => {
        handle.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      });
    }
    function destroy() {
      for (const fn of cleanups) {
        try {
          fn();
        } catch (_e) {}
      }
      cleanups.length = 0;
      if (host.parentNode)
        host.parentNode.removeChild(host);
    }
    return {
      host,
      shadowRoot,
      root,
      setMode,
      setTheme,
      setContrast,
      setFontScale,
      setOpacity,
      enableDrag,
      enableResize,
      destroy
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/statusBar.js
  var TRACKING_LABELS = {
    tracking: "Tracking",
    active: "Tracking",
    paused: "Paused",
    idle: "Idle",
    hidden: "Hidden",
    unfocused: "Unfocused",
    "session-only": "Session only"
  };
  var STORAGE_LABELS = {
    saved: "Saved",
    saving: "Saving",
    "session-only": "Session only",
    unavailable: "Restore unavailable",
    idle: ""
  };
  function createStatusBar() {
    const element = el("div", { class: "rn-statusbar", role: "status", "aria-live": "polite" });
    function pill(text, cls) {
      return el("span", { class: "rn-pill " + cls, text });
    }
    function update(vm) {
      clearChildren(element);
      const tStatus = vm.trackingStatus || "tracking";
      const tLabel = TRACKING_LABELS[tStatus] || "Tracking";
      element.appendChild(pill(tLabel, "rn-" + tStatus));
      const sStatus = vm.storageStatus;
      const sLabel = STORAGE_LABELS[sStatus];
      if (sLabel) {
        element.appendChild(pill(sLabel, "rn-" + sStatus));
      }
      if (vm.segmentCount != null) {
        element.appendChild(pill(vm.segmentCount + " segments", "rn-info"));
      }
    }
    return { element, update };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/restoreCard.js
  function createRestoreCard(actions) {
    const element = el("div", { class: "rn-section" });
    const title = el("p", { class: "rn-section-title", text: "Restore" });
    const card = el("div", { class: "rn-card" });
    element.appendChild(title);
    element.appendChild(card);
    function row(label, value) {
      return el("div", { class: "rn-card-row" }, [
        el("span", { class: "rn-card-label", text: label }),
        el("span", { text: value })
      ]);
    }
    function update(vm) {
      clearChildren(card);
      const r = vm.restore || {};
      if (!r.hasSaved) {
        card.className = "rn-card rn-empty";
        if (r.storageUnavailable) {
          card.appendChild(el("div", { text: "Restore after reload is unavailable (storage disabled). Progress is kept for this session only." }));
        } else {
          card.appendChild(el("div", { text: "No saved progress for this page yet. Keep reading and it will remember your place." }));
        }
        return;
      }
      card.className = "rn-card";
      if (r.lastSavedAt) {
        card.appendChild(row("Last saved", formatRelativeTime(r.lastSavedAt)));
      }
      if (r.lastContext) {
        card.appendChild(row("Last context", r.lastContext));
      }
      if (r.progressText) {
        card.appendChild(row("Progress", r.progressText));
      }
      if (r.confidenceLabel) {
        card.appendChild(row("Confidence", r.confidenceLabel));
      }
      if (r.fingerprintWarning) {
        card.appendChild(el("div", { class: "rn-card-warn", text: r.fingerprintWarning }));
      }
      if (r.hasManualMark) {
        const primary = el("button", {
          class: "rn-btn rn-primary",
          type: "button",
          text: "Jump to marked position",
          onClick: () => actions.jumpToMark()
        });
        const secondary = el("button", {
          class: "rn-btn",
          type: "button",
          text: "Jump to last reading position",
          onClick: () => actions.jumpToLastReading()
        });
        card.appendChild(primary);
        card.appendChild(secondary);
      } else {
        const primary = el("button", {
          class: "rn-btn rn-primary",
          type: "button",
          text: "Jump to last reading position",
          onClick: () => actions.jumpToLastReading()
        });
        card.appendChild(primary);
      }
    }
    return { element, update };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/headingPanel.js
  function createHeadingPanel(actions) {
    const element = el("div", { class: "rn-section" });
    const title = el("p", { class: "rn-section-title", text: "Heading context" });
    const breadcrumb = el("div", { class: "rn-heading-path" });
    const list = el("div", { class: "rn-heading-list" });
    element.appendChild(title);
    element.appendChild(breadcrumb);
    element.appendChild(list);
    function renderBreadcrumb(path) {
      clearChildren(breadcrumb);
      if (!path || !path.length) {
        breadcrumb.appendChild(el("span", { class: "rn-crumb", text: "No current heading" }));
        return;
      }
      path.forEach((text, i) => {
        const isLast = i === path.length - 1;
        breadcrumb.appendChild(el("span", { class: isLast ? "rn-crumb-current" : "rn-crumb", text }));
        if (!isLast)
          breadcrumb.appendChild(document.createTextNode(" › "));
      });
    }
    function renderRow(row) {
      const jump = el("button", {
        class: "rn-heading-jump" + (row.isCurrent ? " rn-current" : ""),
        type: "button",
        title: "Jump to: " + row.text,
        onClick: () => actions.jumpToHeading(row.id)
      });
      jump.appendChild(el("span", { class: "rn-lvl", text: "H" + row.level }));
      jump.appendChild(el("span", { class: "rn-heading-text", text: row.text }));
      const bar = el("div", { class: "rn-progressbar", title: row.progressPercent + "% probably read" });
      const fill = el("i");
      fill.style.width = row.progressPercent + "%";
      bar.appendChild(fill);
      jump.appendChild(bar);
      const flags = el("span", { class: "rn-section-flags" });
      if (row.hasLastFocus)
        flags.appendChild(el("span", { class: "rn-dot rn-lf", title: "Last reading position in this section" }));
      if (row.hasManualMark)
        flags.appendChild(el("span", { class: "rn-dot rn-mk", title: "Marked spot in this section" }));
      const rowEl = el("div", { class: "rn-heading-row" }, [jump, flags]);
      if (row.hasLastFocus || row.hasReadableContent) {
        const jumpLast = el("button", {
          class: "rn-iconbtn",
          type: "button",
          text: "⤓",
          title: "Jump to last read spot in this section",
          style: { color: "var(--rn-muted)" },
          onClick: (e) => {
            e.stopPropagation();
            actions.jumpToLastInSection(row.id);
          }
        });
        rowEl.appendChild(jumpLast);
      }
      return rowEl;
    }
    function update(vm) {
      const ctx = vm.headingContext || {};
      renderBreadcrumb(ctx.path);
      clearChildren(list);
      if (!ctx.rows || !ctx.rows.length) {
        list.appendChild(el("div", { class: "rn-empty-state", text: ctx.emptyMessage || "No headings found on this page." }));
        return;
      }
      for (const row of ctx.rows) {
        list.appendChild(renderRow(row));
      }
    }
    return { element, update };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/minimapRail.js
  var STATE_PRIORITY = {
    unseen: 0,
    seen: 1,
    skimmed: 2,
    "probably-read": 3,
    reread: 4,
    active: 5
  };
  var LEGEND = [
    ["Unseen", "var(--rn-unseen)"],
    ["Seen", "var(--rn-seen)"],
    ["Skimmed", "var(--rn-skimmed)"],
    ["Probably read", "var(--rn-read)"],
    ["Active", "var(--rn-active)"],
    ["Last focus", "var(--rn-lastfocus)"],
    ["Marked", "var(--rn-mark)"]
  ];
  function createMinimapRail(actions) {
    const element = el("div", { class: "rn-section" });
    const title = el("p", { class: "rn-section-title", text: "Reading map" });
    const wrap = el("div", { class: "rn-minimap-wrap" });
    const rail = el("div", { class: "rn-minimap", role: "slider", "aria-label": "Reading progress map", tabindex: "0" });
    const legend = el("div", { class: "rn-legend" });
    const viewportMarker = el("div", { class: "rn-mini-viewport" });
    const lastFocusMarker = el("div", { class: "rn-mini-marker rn-lf" });
    const manualMarker = el("div", { class: "rn-mini-marker rn-mk" });
    buildLegend();
    wrap.appendChild(rail);
    wrap.appendChild(legend);
    element.appendChild(title);
    element.appendChild(wrap);
    let buckets = [];
    let bucketBySegmentId = new Map;
    let lastStateByBucket = [];
    function buildLegend() {
      clearChildren(legend);
      for (const [label, color] of LEGEND) {
        const item = el("div", { class: "rn-legend-item" });
        const sw = el("span", { class: "rn-legend-swatch" });
        sw.style.background = color;
        item.appendChild(sw);
        item.appendChild(el("span", { text: label }));
        legend.appendChild(item);
      }
    }
    function build(segments) {
      clearChildren(rail);
      buckets = [];
      bucketBySegmentId = new Map;
      lastStateByBucket = [];
      if (!segments || !segments.length) {
        rail.appendChild(el("div", { class: "rn-empty-state", text: "" }));
        return;
      }
      const perBucket = Math.max(1, Math.ceil(segments.length / CONFIG.maxMinimapNodes));
      for (let i = 0;i < segments.length; i += perBucket) {
        const group = segments.slice(i, i + perBucket);
        const startRatio = group[0].scrollStartRatio || 0;
        const endRatio = group[group.length - 1].scrollEndRatio || startRatio + 0.01;
        const segmentIds = group.map((s) => s.id);
        const node = el("div", { class: "rn-mini-seg s-unseen" });
        const topPct = Math.max(0, Math.min(100, startRatio * 100));
        const hPct = Math.max(0.4, Math.min(100 - topPct, (endRatio - startRatio) * 100));
        node.style.top = topPct + "%";
        node.style.height = hPct + "%";
        const bucketIndex = buckets.length;
        node.addEventListener("click", () => actions.jumpToSegment(segmentIds[0]));
        rail.appendChild(node);
        buckets.push({ node, segmentIds, startRatio, endRatio });
        lastStateByBucket.push("unseen");
        for (const id of segmentIds)
          bucketBySegmentId.set(id, bucketIndex);
      }
      rail.appendChild(viewportMarker);
      rail.appendChild(lastFocusMarker);
      rail.appendChild(manualMarker);
    }
    function aggregateState(segmentIds, statesById, currentSegmentId) {
      let best = "unseen";
      let bestPriority = -1;
      for (const id of segmentIds) {
        let st = statesById.get(id) || "unseen";
        if (id === currentSegmentId)
          st = "active";
        const p = STATE_PRIORITY[st] != null ? STATE_PRIORITY[st] : 0;
        if (p > bestPriority) {
          bestPriority = p;
          best = st;
        }
      }
      return best;
    }
    function update(vm) {
      const mm = vm.minimap;
      if (!mm)
        return;
      const statesById = mm.statesById || new Map;
      for (let i = 0;i < buckets.length; i++) {
        const b = buckets[i];
        const state = aggregateState(b.segmentIds, statesById, mm.currentSegmentId);
        if (state !== lastStateByBucket[i]) {
          b.node.className = "rn-mini-seg s-" + state;
          lastStateByBucket[i] = state;
        }
      }
      if (mm.viewport) {
        const topPct = Math.max(0, Math.min(100, mm.viewport.topRatio * 100));
        const hPct = Math.max(1, Math.min(100 - topPct, (mm.viewport.bottomRatio - mm.viewport.topRatio) * 100));
        viewportMarker.style.top = topPct + "%";
        viewportMarker.style.height = hPct + "%";
        viewportMarker.style.display = "block";
      }
      positionMarker(lastFocusMarker, mm.lastFocusSegmentId);
      positionMarker(manualMarker, mm.manualMarkSegmentId);
    }
    function positionMarker(marker, segmentId) {
      if (segmentId == null || !bucketBySegmentId.has(segmentId)) {
        marker.style.display = "none";
        return;
      }
      const b = buckets[bucketBySegmentId.get(segmentId)];
      marker.style.top = Math.max(0, Math.min(100, b.startRatio * 100)) + "%";
      marker.style.display = "block";
    }
    return { element, build, update };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/controlsPanel.js
  function createControlsPanel(actions) {
    const element = el("div", { class: "rn-section" });
    const title = el("p", { class: "rn-section-title", text: "Controls" });
    const grid = el("div", { class: "rn-controls" });
    const confirmSlot = el("div");
    element.appendChild(title);
    element.appendChild(grid);
    element.appendChild(confirmSlot);
    const pauseBtn = el("button", { class: "rn-btn", type: "button", text: "Pause", onClick: () => actions.togglePause() });
    const markBtn = el("button", { class: "rn-btn", type: "button", text: "Mark this spot", onClick: () => actions.markSpot() });
    const saveBtn = el("button", { class: "rn-btn", type: "button", text: "Save now", onClick: () => actions.saveNow() });
    const rescanBtn = el("button", { class: "rn-btn", type: "button", text: "Rescan", onClick: () => actions.rescan() });
    const clearBtn = el("button", {
      class: "rn-btn rn-danger rn-wide",
      type: "button",
      text: "Clear page progress",
      onClick: () => showConfirm()
    });
    grid.appendChild(pauseBtn);
    grid.appendChild(markBtn);
    grid.appendChild(saveBtn);
    grid.appendChild(rescanBtn);
    grid.appendChild(clearBtn);
    function showConfirm() {
      clearChildren(confirmSlot);
      const box = el("div", { class: "rn-confirm" });
      box.appendChild(el("div", { text: "Delete saved reading progress for this page? This cannot be undone." }));
      const row = el("div", { class: "rn-confirm-actions" });
      row.appendChild(el("button", {
        class: "rn-btn rn-danger",
        type: "button",
        text: "Delete",
        onClick: () => {
          clearChildren(confirmSlot);
          actions.clearProgress();
        }
      }));
      row.appendChild(el("button", {
        class: "rn-btn",
        type: "button",
        text: "Cancel",
        onClick: () => clearChildren(confirmSlot)
      }));
      box.appendChild(row);
      confirmSlot.appendChild(box);
    }
    function update(vm) {
      pauseBtn.textContent = vm.paused ? "Resume" : "Pause";
      const hasMark = vm.manualMarkSegmentId != null;
      markBtn.textContent = hasMark ? "Move mark here" : "Mark this spot";
    }
    return { element, update };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/settingsPanel.js
  function createSettingsPanel(actions, initial) {
    const settings = Object.assign({ fontScale: 1, opacity: 1, contrast: "soft", theme: "light", sessionOnly: false, debug: false }, initial || {});
    const element = el("div", { class: "rn-section rn-collapsible" });
    element.appendChild(el("p", { class: "rn-section-title", text: "Settings" }));
    const fontRange = el("input", { type: "range", min: "0.85", max: "1.6", step: "0.05", value: String(settings.fontScale) });
    fontRange.addEventListener("input", () => {
      settings.fontScale = parseFloat(fontRange.value);
      actions.setFontScale(settings.fontScale);
    });
    element.appendChild(settingRow("Font size", fontRange));
    const opacityRange = el("input", { type: "range", min: "0.4", max: "1", step: "0.05", value: String(settings.opacity) });
    opacityRange.addEventListener("input", () => {
      settings.opacity = parseFloat(opacityRange.value);
      actions.setOpacity(settings.opacity);
    });
    element.appendChild(settingRow("Opacity", opacityRange));
    const themeToggle = segToggle(["light", "dark"], settings.theme, (v) => {
      settings.theme = v;
      actions.setTheme(v);
    });
    element.appendChild(settingRow("Theme", themeToggle));
    const contrastToggle = segToggle(["soft", "high"], settings.contrast, (v) => {
      settings.contrast = v;
      actions.setContrast(v);
    });
    element.appendChild(settingRow("Contrast", contrastToggle));
    const sessionCheck = el("input", { type: "checkbox", checked: settings.sessionOnly });
    sessionCheck.addEventListener("change", () => {
      settings.sessionOnly = sessionCheck.checked;
      actions.setSessionOnly(settings.sessionOnly);
    });
    element.appendChild(settingRow("Session-only (no saving)", sessionCheck));
    const debugCheck = el("input", { type: "checkbox", checked: settings.debug });
    debugCheck.addEventListener("change", () => {
      settings.debug = debugCheck.checked;
      actions.setDebug(settings.debug);
    });
    element.appendChild(settingRow("Debug mode", debugCheck));
    function settingRow(label, control) {
      const id = "rn-set-" + label.replace(/\s+/g, "-").toLowerCase();
      if (control.tagName === "INPUT")
        control.id = id;
      const row = el("div", { class: "rn-setting-row" });
      row.appendChild(el("label", { for: id, text: label }));
      row.appendChild(control);
      return row;
    }
    function segToggle(options, current, onChange) {
      const wrap = el("div", { class: "rn-seg-toggle", role: "group" });
      const buttons = [];
      for (const opt of options) {
        const btn = el("button", {
          type: "button",
          class: opt === current ? "rn-on" : "",
          text: opt.charAt(0).toUpperCase() + opt.slice(1),
          onClick: () => {
            for (const b of buttons)
              b.classList.remove("rn-on");
            btn.classList.add("rn-on");
            onChange(opt);
          }
        });
        buttons.push(btn);
        wrap.appendChild(btn);
      }
      return wrap;
    }
    function update() {}
    return { element, update, settings };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/debugPanel.js
  function createDebugPanel() {
    const element = el("div", { class: "rn-section rn-collapsible" });
    element.appendChild(el("p", { class: "rn-section-title", text: "Debug" }));
    const pre = el("div", { class: "rn-debug" });
    element.appendChild(pre);
    element.style.display = "none";
    function update(vm) {
      if (!vm.debug || !vm.debug.enabled) {
        element.style.display = "none";
        return;
      }
      element.style.display = "";
      const d = vm.debug;
      const lines = [
        "version: " + d.appVersion,
        "root confidence: " + d.rootConfidence + " (" + d.rootReason + ")",
        "segments: " + d.segmentCount + "  headings: " + d.headingCount,
        "minimap nodes: " + d.minimapNodes,
        "last scan: " + fmt(d.lastScanMs) + " ms",
        "last geometry: " + fmt(d.lastGeometryMs) + " ms",
        "last sample: " + fmt(d.lastSampleMs) + " ms",
        "last save: " + fmt(d.lastSaveMs) + " ms",
        "velocity: " + fmt(d.velocity) + " px/s (" + d.velocityClass + ")",
        "storage: " + d.storageMode,
        "current: " + (d.currentSegmentId || "-"),
        "last focus: " + (d.lastFocusSegmentId || "-"),
        "errors: " + (d.errorCount || 0)
      ];
      if (d.lastError)
        lines.push("last error: " + d.lastError);
      pre.textContent = lines.join(`
`);
    }
    function fmt(n) {
      return typeof n === "number" ? Math.round(n * 100) / 100 : "-";
    }
    return { element, update };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/ui/appShell.js
  function createAppShell(root, actions, initialSettings) {
    clearChildren(root);
    const titleText = el("span", { class: "rn-title", text: CONFIG.appName });
    const compactBtn = el("button", { class: "rn-iconbtn", type: "button", title: "Compact / expand", "aria-label": "Toggle compact mode", text: "▭", onClick: () => actions.toggleMode() });
    const pauseBtn = el("button", { class: "rn-iconbtn", type: "button", title: "Pause / resume", "aria-label": "Pause or resume tracking", text: "⏸", onClick: () => actions.togglePause() });
    const closeBtn = el("button", { class: "rn-iconbtn", type: "button", title: "Close", "aria-label": "Close Reading Navigator", text: "✕", onClick: () => actions.close() });
    const titlebar = el("div", { class: "rn-titlebar" }, [titleText, el("span", { class: "rn-titlebar-buttons" }, [pauseBtn, compactBtn, closeBtn])]);
    const statusBar = createStatusBar();
    const progressSummary = el("div", { class: "rn-progress-summary", title: "Reading progress" });
    const restoreCard = createRestoreCard(actions);
    const headingPanel = createHeadingPanel(actions);
    const minimap = createMinimapRail(actions);
    const controls = createControlsPanel(actions);
    const settings = createSettingsPanel(actions, initialSettings);
    const debug = createDebugPanel();
    const statusSection = el("div", { class: "rn-section" }, [statusBar.element, progressSummary]);
    const body = el("div", { class: "rn-body" }, [
      minimap.element,
      statusSection,
      wrapCollapsible(restoreCard.element),
      wrapCollapsible(headingPanel.element),
      wrapCollapsible(controls.element),
      settings.element,
      debug.element
    ]);
    const live = el("div", { class: "rn-live", role: "status", "aria-live": "assertive" });
    const resizeHandle = el("div", { class: "rn-resize", title: "Resize" });
    root.appendChild(titlebar);
    root.appendChild(body);
    root.appendChild(live);
    root.appendChild(resizeHandle);
    function wrapCollapsible(node) {
      node.classList.add("rn-collapsible");
      return node;
    }
    function build(segments) {
      minimap.build(segments);
    }
    const components = [statusBar, restoreCard, headingPanel, minimap, controls, settings, debug];
    function update(vm) {
      for (const c of components) {
        try {
          c.update(vm);
        } catch (_e) {}
      }
      renderProgressSummary(vm.progress);
      pauseBtn.textContent = vm.paused ? "▶" : "⏸";
    }
    function renderProgressSummary(progress) {
      clearChildren(progressSummary);
      if (!progress)
        return;
      const parts = [
        [progress.probablyReadRatio, "var(--rn-read)"],
        [progress.skimmedRatio, "var(--rn-skimmed)"],
        [progress.seenRatio, "var(--rn-seen)"],
        [progress.unreadRatio, "var(--rn-unseen)"]
      ];
      for (const [ratio, color] of parts) {
        if (!ratio)
          continue;
        const span = el("span");
        span.style.width = Math.max(0, ratio * 100) + "%";
        span.style.background = color;
        progressSummary.appendChild(span);
      }
    }
    let lastAnnouncement = "";
    function announce(text) {
      if (!text || text === lastAnnouncement)
        return;
      lastAnnouncement = text;
      live.textContent = "";
      setTimeout(() => {
        live.textContent = text;
      }, 30);
    }
    return {
      build,
      update,
      announce,
      settings,
      elements: { titlebar, resizeHandle }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/app/createApp.js
  function createApp() {
    const state = createInitialState();
    const lifecycle = createLifecycle(state);
    const store = createProgressStore();
    const geometry = createGeometryCache();
    const overlays = createOverlayMarkers();
    let sectionSegmentIds = new Map;
    let storedRecord = null;
    let firstScanDone = false;
    let suppressSave = false;
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
      }
    });
    const idle = createIdleTracker({
      onActivityResume: () => {
        if (sampler)
          sampler.resetSampleClock();
      }
    });
    lifecycle.register(() => idle.destroy());
    const scheduler = createScheduler({
      onSample: () => sampler.sample(),
      onGeometryRefresh: (reason) => refreshGeometry(reason),
      onUiUpdate: () => renderUi(),
      onSave: (reason) => doSave(reason)
    });
    lifecycle.register(() => scheduler.cancelAll());
    const sampler = createViewportSampler({
      geometry,
      tracker,
      idle,
      state,
      onSampled: () => scheduler.scheduleUiUpdate("sample")
    });
    const shadow = createShadowHost();
    lifecycle.register(() => shadow.destroy());
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        state.settings.theme = "dark";
        shadow.setTheme("dark");
      }
    } catch (_e) {}
    const actions = buildActions();
    const shell = createAppShell(shadow.root, actions, state.settings);
    shadow.enableDrag(shell.elements.titlebar);
    shadow.enableResize(shell.elements.resizeHandle);
    overlays.mount();
    lifecycle.register(() => overlays.destroy());
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
            onFlushSave: (reason) => scheduler.flushSaveNow(reason)
          }
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
      sectionSegmentIds = new Map;
      for (const seg of segments) {
        const key = seg.sectionIndex;
        if (!sectionSegmentIds.has(key))
          sectionSegmentIds.set(key, []);
        sectionSegmentIds.get(key).push(seg.id);
      }
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
        state.restore.fingerprint = compareFingerprints({
          contentFingerprint: record.page ? record.page.contentFingerprint : null,
          headingFingerprint: record.page ? record.page.headingFingerprint : null
        }, {
          contentFingerprint: identity.contentFingerprint,
          headingFingerprint: identity.headingFingerprint
        });
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
        scheduler.scheduleUiUpdate("geometry:" + (reason || ""));
      });
    }
    function handleRouteChange() {
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
    function doSave(reason) {
      const identity = state.page.identity;
      if (!identity)
        return;
      if (suppressSave)
        return;
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
          lastOpenedAt: state.app.startedAt
        }
      });
      const res = store.save(identity.key, record);
      state.performance.lastSaveMs = now() - t0;
      storedRecord = record;
      state.storage.mode = res.mode;
      state.storage.lastSavedAt = wallNow();
      state.storage.status = res.mode === "persistent" ? "saved" : "session-only";
      scheduler.scheduleUiUpdate("saved");
    }
    function currentLiveSegment() {
      const id = state.tracking.currentSegmentId || tracker.currentSegmentId;
      if (id && state.segmentsById.has(id))
        return state.segmentsById.get(id);
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
          anchors: seg.anchors
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
        docHeight: getDocumentHeight()
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
          if (!state.tracking.pausedByUser)
            sampler.resetSampleClock();
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
          if (!heading)
            return;
          const ids = sectionSegmentIds.get(heading.sectionIndex) || [];
          let best = null;
          let bestMs = -1;
          for (const id of ids) {
            const stats = tracker.getStats(id);
            if (stats && stats.totalFocusedMs > bestMs) {
              bestMs = stats.totalFocusedMs;
              best = id;
            }
          }
          const seg = best ? state.segmentsById.get(best) : ids[0] ? state.segmentsById.get(ids[0]) : null;
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
        }
      };
    }
    function computeStatesById() {
      const states = new Map;
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
        if (st === "probably-read" || st === "reread")
          read++;
        else if (st === "skimmed")
          skimmed++;
        else if (st === "seen")
          seen++;
        else
          unseen++;
      });
      return {
        probablyReadRatio: read / total,
        seenRatio: seen / total,
        skimmedRatio: skimmed / total,
        unreadRatio: unseen / total,
        readCount: read,
        total: state.segments.length
      };
    }
    function sectionProgress(sectionIndex, statesById) {
      const ids = sectionSegmentIds.get(sectionIndex) || [];
      if (!ids.length)
        return { percent: 0, hasReadable: false };
      let read = 0;
      for (const id of ids) {
        const st = statesById.get(id);
        if (st === "probably-read" || st === "reread")
          read++;
      }
      return { percent: Math.round(read / ids.length * 100), hasReadable: true };
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
      if (current)
        ordered.push(current);
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
          hasManualMark: markSection === h.sectionIndex
        };
      });
      return { path: current ? current.path : [], rows };
    }
    function sectionOfSegment(segmentId) {
      if (!segmentId || !state.segmentsById.has(segmentId))
        return null;
      return state.segmentsById.get(segmentId).sectionIndex;
    }
    function buildRestoreVm(progress) {
      const liveLast = tracker.lastFocusSegmentId;
      const hasLive = liveLast && state.segmentsById.has(liveLast);
      const hasStored = !!(storedRecord && storedRecord.restore && (storedRecord.restore.lastFocus || storedRecord.restore.manualMark));
      const hasManualMark = !!tracker.manualMarkSegmentId || !!(storedRecord && storedRecord.restore && storedRecord.restore.manualMark);
      const hasSaved = hasLive || hasStored || !!tracker.lastFocusSegmentId || !!tracker.manualMarkSegmentId;
      let lastContext = "";
      const contextSeg = tracker.manualMarkSegmentId && state.segmentsById.get(tracker.manualMarkSegmentId) || liveLast && state.segmentsById.get(liveLast);
      if (contextSeg && contextSeg.headingPath.length)
        lastContext = contextSeg.headingPath.join(" › ");
      let confidence = "none";
      if (state.restore.lastRestoreResult)
        confidence = state.restore.lastRestoreResult.confidence;
      else if (hasLive || tracker.manualMarkSegmentId && state.segmentsById.has(tracker.manualMarkSegmentId))
        confidence = "high";
      else if (hasStored)
        confidence = "medium";
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
        progressText: progress.total ? Math.round(progress.probablyReadRatio * 100) + "% probably read · " + progress.readCount + "/" + progress.total + " segments" : "",
        confidenceLabel: hasSaved ? confidenceLabel(confidence) : ""
      };
    }
    function trackingStatusLabel() {
      if (state.tracking.pausedByUser)
        return "paused";
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
          viewport: vp ? { topRatio: vp.top / docHeight, bottomRatio: vp.bottom / docHeight } : null
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
          lastError: state.diagnostics.lastError
        },
        _statesById: statesById
      };
    }
    function renderUi() {
      if (lifecycle.isClosed())
        return;
      const t0 = now();
      try {
        const vm = buildViewModel();
        shell.update(vm);
        overlays.update({
          segmentsById: state.segmentsById,
          currentSegmentId: state.tracking.currentSegmentId,
          lastFocusSegmentId: tracker.lastFocusSegmentId,
          manualMarkSegmentId: tracker.manualMarkSegmentId,
          viewport: state.viewport
        });
      } catch (err) {
        recordError(err);
      }
      state.performance.lastRenderMs = now() - t0;
    }
    function recordError(err) {
      state.diagnostics.errorCount += 1;
      state.diagnostics.lastError = err && err.message ? err.message : String(err);
    }
    function close() {
      if (lifecycle.isClosed())
        return;
      try {
        if (!state.settings.sessionOnly && store.isAvailable())
          doSave("close");
      } catch (_e) {}
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
      _debug: { buildViewModel, scan, doSave, actions }
    };
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/main.js
  function run() {
    try {
      if (window.__readingNavigatorApp) {
        window.__readingNavigatorApp.toggleVisibility();
        return window.__readingNavigatorApp;
      }
      const staleHost = document.getElementById(CONFIG.hostId);
      if (staleHost && staleHost.parentNode)
        staleHost.parentNode.removeChild(staleHost);
      const staleOverlay = document.getElementById(CONFIG.hostId + "-overlays");
      if (staleOverlay && staleOverlay.parentNode)
        staleOverlay.parentNode.removeChild(staleOverlay);
      const app = createApp();
      window.__readingNavigatorApp = app;
      app.start();
      return app;
    } catch (err) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[Reading Navigator] failed to start:", err);
      }
      return null;
    }
  }

  // ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/src/bookmarklet-entry.js
  if (typeof window !== "undefined") {
    window.readingNavigatorBookmarklet = run;
  }
})();
