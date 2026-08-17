(() => {
  'use strict';

  const APP_KEY = '__CHATGPT_ARCHIVE_MODE__';
  const APP_VERSION = '2.0.0';
  const ROOT_CLASS = 'cgpt-archive-mode-enabled';
  const HOST_STYLE_ID = 'cgpt-archive-mode-host-styles';
  const UI_HOST_ID = 'cgpt-archive-mode-ui-host';
  const ARCHIVED_STORAGE_KEY = 'cgpt-archive-mode.archived-conversation-ids.v2';
  const LEGACY_ARCHIVED_STORAGE_KEY = 'cgpt-archive-mode.archived-conversation-ids.v1';
  const SETTINGS_STORAGE_KEY = 'cgpt-archive-mode.settings.v2';
  const REQUEST_TIMEOUT_MS = 30000;
  const SESSION_TIMEOUT_MS = 15000;
  const SCAN_DEBOUNCE_MS = 120;
  const HEALTH_CHECK_MS = 5000;
  const DIAGNOSTIC_REPEAT_MS = 30000;
  const MIN_SIDEBAR_WIDTH = 360;
  const PREFERRED_SIDEBAR_WIDTH = 560;
  const MAX_SIDEBAR_WIDTH = 760;
  const MAX_SIDEBAR_VIEWPORT_RATIO = 0.68;
  const MAX_LOG_ENTRIES = 1200;

  const LOCATORS = Object.freeze({
    documentHead: Object.freeze({
      description: 'Document head used to install host-page styles',
      selectors: Object.freeze(['head'])
    }),
    documentBody: Object.freeze({
      description: 'Document body used to mount the Shadow DOM window and observe page changes',
      selectors: Object.freeze(['body'])
    }),
    sidebar: Object.freeze({
      description: 'Expanded ChatGPT history sidebar',
      selectors: Object.freeze([
        '#stage-slideover-sidebar',
        '[id="stage-slideover-sidebar"]',
        'aside[aria-label="Chat history"]'
      ])
    }),
    sidebarOpenButton: Object.freeze({
      description: 'Control that opens the ChatGPT sidebar',
      selectors: Object.freeze([
        'button[aria-label="Open sidebar"]',
        '[data-testid="open-sidebar-button"]',
        'button[aria-controls="stage-slideover-sidebar"][aria-expanded="false"]'
      ])
    }),
    historyScrollport: Object.freeze({
      description: 'Scrollable ChatGPT chat-history container',
      selectors: Object.freeze([
        '#stage-slideover-sidebar nav[aria-label="Chat history"]',
        '#stage-slideover-sidebar [aria-label="Chat history"]',
        '#history'
      ])
    }),
    conversationRows: Object.freeze({
      description: 'Chat history links whose URL contains a conversation identifier',
      selectors: Object.freeze([
        '#stage-slideover-sidebar a[data-sidebar-item="true"][href^="/c/"]',
        '#stage-slideover-sidebar a.__menu-item[href^="/c/"]',
        '#stage-slideover-sidebar a[href^="/c/"]',
        '#history a[href^="/c/"]'
      ])
    }),
    conversationTitle: Object.freeze({
      description: 'Visible title inside a ChatGPT conversation row',
      selectors: Object.freeze([
        '.truncate span[dir="auto"]',
        '.truncate span',
        '.truncate'
      ])
    })
  });

  const existingApp = window[APP_KEY];
  if (existingApp && typeof existingApp.destroy === 'function') {
    existingApp.destroy('Archive mode disabled by a second bookmarklet invocation.');
    return;
  }

  const state = {
    destroyed: false,
    started: false,
    originalSidebarWidth: document.documentElement.style.getPropertyValue('--sidebar-width'),
    archivedIds: new Set(),
    statusById: new Map(),
    entriesById: new Map(),
    entriesByAnchor: new Map(),
    diagnostics: new Map(),
    activeControllers: new Set(),
    pendingLogs: [],
    logList: null,
    statusText: null,
    uiHost: null,
    uiShadow: null,
    logWindow: null,
    sidebarResizer: null,
    observer: null,
    observerRoot: null,
    scanTimer: 0,
    scanSources: new Set(),
    healthTimer: 0,
    archiveSequence: 0,
    scanSequence: 0,
    accessTokenPromise: null,
    dragCleanup: null,
    sidebarResizeCleanup: null,
    windowResizeCleanup: null,
    scrollCleanup: null,
    pageErrorCleanup: null,
    lastStatusText: '',
    lastScanSummary: null,
    sidebarSide: 'left',
    settings: {}
  };

  window[APP_KEY] = {
    version: APP_VERSION,
    destroy,
    scan: () => scheduleScan('manual-api'),
    getState: () => ({
      version: APP_VERSION,
      destroyed: state.destroyed,
      trackedRows: state.entriesByAnchor.size,
      rememberedArchived: state.archivedIds.size,
      statuses: Object.fromEntries(state.statusById)
    })
  };

  void start();

  async function start() {
    log('info', 'startup', 'Starting ChatGPT Archive Mode.', {
      version: APP_VERSION,
      page: location.href,
      readyState: document.readyState
    });

    try {
      await waitForDocumentBody();
      loadSettings();
      loadArchivedIds();
      installHostStyles();
      createShadowUi();
      installPageErrorLogging();
      await ensureSidebarAvailable();
      widenSidebar();
      installDomMonitoring();
      installScrollMonitoring();
      installHealthChecks();
      state.started = true;
      scheduleScan('startup');
      log('success', 'startup', 'Archive mode initialized.', {
        version: APP_VERSION,
        rememberedArchived: state.archivedIds.size
      });
    } catch (error) {
      log('error', 'startup', 'Archive mode initialization failed.', {
        error: formatError(error),
        page: location.href,
        readyState: document.readyState
      });
      showFatalFallback(error);
    }
  }

  async function waitForDocumentBody() {
    const operation = 'locate-document-body';
    const existingBody = queryFirst('documentBody', document, operation, false);
    if (existingBody) return existingBody;

    log('info', operation, 'Waiting for the document body before mounting the application.', locatorContext('documentBody', document));

    const startedAt = Date.now();
    while (Date.now() - startedAt < 5000) {
      await delay(100);
      const body = queryFirst('documentBody', document, operation, false);
      if (body) return body;
    }

    reportMissingLocator('documentBody', operation, document, 'error');
    throw new Error('The document body did not become available within 5000ms.');
  }

  function loadSettings() {
    const operation = 'load-settings';
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      state.settings = parsed && typeof parsed === 'object' ? parsed : {};
      log('info', operation, 'Application settings loaded.', {
        hasSavedSidebarWidth: Number.isFinite(state.settings.sidebarWidth),
        hasSavedWindowPosition: Boolean(state.settings.windowPosition)
      });
    } catch (error) {
      state.settings = {};
      log('error', operation, 'Could not read saved application settings. Defaults will be used.', {
        storageKey: SETTINGS_STORAGE_KEY,
        error: formatError(error)
      });
    }
  }

  function saveSettings(patch, operation) {
    try {
      state.settings = { ...state.settings, ...patch };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
      log('debug', operation, 'Application settings saved.', {
        storageKey: SETTINGS_STORAGE_KEY,
        fields: Object.keys(patch).join(', ')
      });
    } catch (error) {
      log('error', operation, 'Could not save application settings.', {
        storageKey: SETTINGS_STORAGE_KEY,
        fields: Object.keys(patch).join(', '),
        error: formatError(error)
      });
    }
  }

  function loadArchivedIds() {
    const operation = 'load-archived-state';
    try {
      const currentRaw = localStorage.getItem(ARCHIVED_STORAGE_KEY);
      const legacyRaw = currentRaw ? null : localStorage.getItem(LEGACY_ARCHIVED_STORAGE_KEY);
      const raw = currentRaw || legacyRaw;
      const parsed = raw ? JSON.parse(raw) : [];
      const ids = Array.isArray(parsed) ? parsed.filter(isConversationId) : [];
      state.archivedIds = new Set(ids);
      for (const id of state.archivedIds) state.statusById.set(id, 'archived');
      log('info', operation, 'Remembered archive state loaded.', {
        storageKey: currentRaw ? ARCHIVED_STORAGE_KEY : legacyRaw ? LEGACY_ARCHIVED_STORAGE_KEY : ARCHIVED_STORAGE_KEY,
        archivedCount: state.archivedIds.size
      });
    } catch (error) {
      state.archivedIds = new Set();
      log('error', operation, 'Could not read remembered archive state. The application will continue with an empty local state.', {
        storageKey: ARCHIVED_STORAGE_KEY,
        error: formatError(error)
      });
    }
  }

  function saveArchivedIds(operationId) {
    const operation = 'save-archived-state';
    try {
      const ids = Array.from(state.archivedIds).slice(-5000);
      localStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(ids));
      log('debug', operation, 'Remembered archive state saved.', {
        operationId,
        storageKey: ARCHIVED_STORAGE_KEY,
        archivedCount: ids.length
      });
    } catch (error) {
      log('error', operation, 'The conversation was archived, but its local archived marker could not be persisted.', {
        operationId,
        storageKey: ARCHIVED_STORAGE_KEY,
        error: formatError(error)
      });
    }
  }

  function installHostStyles() {
    const operation = 'install-host-styles';
    const existingStyle = document.getElementById(HOST_STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
      log('debug', operation, 'Removed a stale host-style element before reinstalling it.', {
        styleElementId: HOST_STYLE_ID
      });
    }

    const style = document.createElement('style');
    style.id = HOST_STYLE_ID;
    style.textContent = `
      html.${ROOT_CLASS} #stage-slideover-sidebar {
        transition: width 120ms linear !important;
      }

      html.${ROOT_CLASS} [data-cgpt-archive-row-container="true"] {
        position: relative !important;
      }

      html.${ROOT_CLASS} a[data-cgpt-archive-id] {
        position: relative !important;
        min-height: 38px !important;
        margin: 2px 7px !important;
        padding-inline-end: 154px !important;
        border: 1px solid color-mix(in srgb, currentColor 16%, transparent) !important;
        border-radius: 7px !important;
        transition: opacity 100ms linear, filter 100ms linear, background 100ms linear, border-color 100ms linear, box-shadow 100ms linear !important;
      }

      html.${ROOT_CLASS} a[data-cgpt-archive-status="ready"] {
        background: color-mix(in srgb, #2563eb 7%, transparent) !important;
        border-color: color-mix(in srgb, #2563eb 34%, transparent) !important;
        box-shadow: inset 3px 0 0 color-mix(in srgb, #2563eb 76%, transparent) !important;
      }

      html.${ROOT_CLASS} a[data-cgpt-archive-status="pending"] {
        background: color-mix(in srgb, #b45309 11%, transparent) !important;
        border-color: color-mix(in srgb, #b45309 48%, transparent) !important;
        box-shadow: inset 3px 0 0 color-mix(in srgb, #b45309 82%, transparent) !important;
      }

      html.${ROOT_CLASS} a[data-cgpt-archive-status="archived"] {
        opacity: 0.58 !important;
        filter: grayscale(0.62) saturate(0.5) !important;
        background: color-mix(in srgb, #047857 11%, transparent) !important;
        border-color: color-mix(in srgb, #047857 50%, transparent) !important;
        box-shadow: inset 3px 0 0 color-mix(in srgb, #047857 86%, transparent) !important;
      }

      html.${ROOT_CLASS} a[data-cgpt-archive-status="error"] {
        background: color-mix(in srgb, #b91c1c 10%, transparent) !important;
        border-color: color-mix(in srgb, #b91c1c 54%, transparent) !important;
        box-shadow: inset 3px 0 0 color-mix(in srgb, #b91c1c 88%, transparent) !important;
      }

      html.${ROOT_CLASS} [data-cgpt-archive-button-host="true"] {
        position: absolute !important;
        inset-inline-end: 58px !important;
        top: 50% !important;
        z-index: 12 !important;
        display: inline-flex !important;
        transform: translateY(-50%) !important;
        pointer-events: auto !important;
      }
    `;

    const head = queryFirst('documentHead', document, operation, false);
    const target = head || document.documentElement;
    if (!head) reportMissingLocator('documentHead', operation, document, 'error');
    target.appendChild(style);
    document.documentElement.classList.add(ROOT_CLASS);

    log('success', operation, 'Host-page styles installed.', {
      target: describeElement(target),
      styleElementId: HOST_STYLE_ID
    });
  }

  function createShadowUi() {
    const operation = 'create-shadow-ui';
    document.getElementById(UI_HOST_ID)?.remove();

    const body = queryFirst('documentBody', document, operation, true);
    const host = document.createElement('div');
    host.id = UI_HOST_ID;
    host.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483646',
      'pointer-events:none',
      'font-family:"Segoe UI",Tahoma,Arial,sans-serif'
    ].join(';');

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        *, *::before, *::after { box-sizing: border-box; }

        .sidebar-resizer {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 556px;
          width: 10px;
          z-index: 2;
          display: block;
          cursor: col-resize;
          pointer-events: auto;
          touch-action: none;
          background: transparent;
        }

        .sidebar-resizer::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 4px;
          width: 2px;
          background: #0b5cab;
          opacity: 0;
        }

        .sidebar-resizer:hover::after,
        .sidebar-resizer[data-active="true"]::after {
          opacity: 1;
        }

        .utility-window {
          position: fixed;
          top: 72px;
          right: 24px;
          width: min(580px, calc(100vw - 32px));
          height: 370px;
          min-width: 380px;
          min-height: 180px;
          max-width: calc(100vw - 12px);
          max-height: calc(100vh - 12px);
          display: grid;
          grid-template-rows: 34px minmax(0, 1fr) 26px;
          overflow: hidden;
          resize: both;
          pointer-events: auto;
          color: #202020;
          background: #f0f0f0;
          border: 1px solid #6b6b6b;
          border-radius: 4px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
        }

        .utility-window.minimized {
          width: 360px;
          height: 34px !important;
          min-width: 280px;
          min-height: 34px;
          resize: none;
          grid-template-rows: 34px;
        }

        .utility-window.minimized .log-view,
        .utility-window.minimized .statusbar {
          display: none;
        }

        .titlebar {
          display: flex;
          align-items: center;
          min-width: 0;
          padding: 0 4px 0 10px;
          color: #ffffff;
          background: #0b5cab;
          border-bottom: 1px solid #083f76;
          cursor: move;
          user-select: none;
          touch-action: none;
        }

        .title {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 600;
        }

        .window-controls {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .window-control {
          min-width: 30px;
          height: 25px;
          padding: 0 7px;
          color: #ffffff;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 2px;
          cursor: pointer;
          font: 12px/1 "Segoe UI", Tahoma, Arial, sans-serif;
        }

        .window-control:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .window-control.close:hover {
          background: #c42b1c;
          border-color: #c42b1c;
        }

        .log-view {
          min-height: 0;
          overflow: auto;
          background: #ffffff;
          border: 1px solid #b7b7b7;
          margin: 6px;
          scrollbar-width: thin;
        }

        .log-entry {
          padding: 5px 6px;
          border-bottom: 1px solid #e2e2e2;
          font: 11px/1.35 Consolas, "Courier New", monospace;
        }

        .log-entry:last-child {
          border-bottom: 0;
        }

        .log-primary {
          display: grid;
          grid-template-columns: 74px 56px 132px minmax(0, 1fr);
          gap: 7px;
          align-items: start;
        }

        .log-time { color: #666666; }
        .log-level { font-weight: 700; text-transform: uppercase; }
        .log-level.debug { color: #5f6368; }
        .log-level.info { color: #075985; }
        .log-level.success { color: #047857; }
        .log-level.warn { color: #8a5200; }
        .log-level.error { color: #b42318; }
        .log-operation { color: #333333; font-weight: 600; overflow-wrap: anywhere; }
        .log-message { min-width: 0; color: #202020; overflow-wrap: anywhere; }

        .log-context {
          margin-top: 3px;
          padding-left: 137px;
          color: #5a5a5a;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .statusbar {
          display: flex;
          align-items: center;
          min-width: 0;
          padding: 0 8px;
          color: #333333;
          background: #e6e6e6;
          border-top: 1px solid #b7b7b7;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 767px) {
          .sidebar-resizer { display: none; }
          .utility-window {
            top: 8px;
            right: 8px;
            width: calc(100vw - 16px);
            min-width: 280px;
          }
          .log-primary {
            grid-template-columns: 68px 50px minmax(0, 1fr);
          }
          .log-operation { display: none; }
          .log-context { padding-left: 0; }
        }
      </style>

      <div class="sidebar-resizer" title="Resize the ChatGPT sidebar" aria-label="Resize the ChatGPT sidebar"></div>

      <section class="utility-window" role="dialog" aria-label="ChatGPT Archive Mode activity log">
        <header class="titlebar">
          <div class="title">ChatGPT Archive Mode</div>
          <div class="window-controls">
            <button class="window-control clear" type="button" title="Clear log" aria-label="Clear log">Clear</button>
            <button class="window-control minimize" type="button" title="Minimize" aria-label="Minimize">_</button>
            <button class="window-control close" type="button" title="Disable archive mode" aria-label="Disable archive mode">X</button>
          </div>
        </header>
        <div class="log-view" aria-live="polite" aria-relevant="additions"></div>
        <footer class="statusbar">Initializing...</footer>
      </section>
    `;

    body.appendChild(host);

    state.uiHost = host;
    state.uiShadow = shadow;
    state.logList = requireShadowElement(shadow, '.log-view', operation, 'Log list inside the archive utility window');
    state.statusText = requireShadowElement(shadow, '.statusbar', operation, 'Status bar inside the archive utility window');
    state.logWindow = requireShadowElement(shadow, '.utility-window', operation, 'Draggable archive utility window');
    state.sidebarResizer = requireShadowElement(shadow, '.sidebar-resizer', operation, 'Sidebar resize handle');

    restoreWindowPosition();
    installWindowDragging(state.logWindow, requireShadowElement(shadow, '.titlebar', operation, 'Window title bar'));
    installWindowResizeLogging(state.logWindow);
    installSidebarResizing(state.sidebarResizer);
    installWindowControls(shadow);
    flushPendingLogs();

    log('success', operation, 'Shadow DOM utility window created.', {
      host: describeElement(host),
      shadowMode: 'open',
      windowSize: `${Math.round(state.logWindow.getBoundingClientRect().width)}x${Math.round(state.logWindow.getBoundingClientRect().height)}`
    });
  }

  function restoreWindowPosition() {
    const operation = 'restore-window-position';
    const position = state.settings.windowPosition;
    if (!position || !state.logWindow) return;

    const left = clamp(Number(position.left), 0, Math.max(0, window.innerWidth - 80));
    const top = clamp(Number(position.top), 0, Math.max(0, window.innerHeight - 34));
    if (!Number.isFinite(left) || !Number.isFinite(top)) {
      log('error', operation, 'Saved window position is invalid and was ignored.', { position: JSON.stringify(position) });
      return;
    }

    state.logWindow.style.right = 'auto';
    state.logWindow.style.bottom = 'auto';
    state.logWindow.style.left = `${left}px`;
    state.logWindow.style.top = `${top}px`;
    log('debug', operation, 'Saved window position restored.', { left, top });
  }

  function installWindowControls(shadow) {
    const operation = 'install-window-controls';
    const clearButton = requireShadowElement(shadow, '.clear', operation, 'Clear-log button');
    const minimizeButton = requireShadowElement(shadow, '.minimize', operation, 'Minimize-window button');
    const closeButton = requireShadowElement(shadow, '.close', operation, 'Close-window button');

    clearButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      state.logList.replaceChildren();
      log('info', 'clear-log', 'The activity log was cleared by the user.');
    });

    minimizeButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const minimized = state.logWindow.classList.toggle('minimized');
      minimizeButton.textContent = minimized ? '[]' : '_';
      minimizeButton.title = minimized ? 'Restore' : 'Minimize';
      log('info', 'toggle-window-size', minimized ? 'The utility window was minimized.' : 'The utility window was restored.');
    });

    closeButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      destroy('Archive mode disabled from the utility window.');
    });

    log('success', operation, 'Utility-window controls installed.', {
      controls: 'clear, minimize, close'
    });
  }

  function installWindowDragging(windowElement, titlebar) {
    const operation = 'install-window-dragging';
    let dragging = false;
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;

    const onPointerMove = event => {
      if (!dragging || event.pointerId !== pointerId) return;
      const maxLeft = Math.max(0, window.innerWidth - Math.min(windowElement.offsetWidth, 80));
      const maxTop = Math.max(0, window.innerHeight - 34);
      const left = clamp(event.clientX - offsetX, 0, maxLeft);
      const top = clamp(event.clientY - offsetY, 0, maxTop);
      windowElement.style.left = `${left}px`;
      windowElement.style.top = `${top}px`;
    };

    const stopDragging = event => {
      if (!dragging || (event && event.pointerId !== pointerId)) return;
      dragging = false;
      try {
        if (pointerId !== null && titlebar.hasPointerCapture(pointerId)) titlebar.releasePointerCapture(pointerId);
      } catch (error) {
        log('warn', 'release-window-pointer', 'Could not release the title-bar pointer capture after dragging.', {
          pointerId,
          error: formatError(error),
          element: describeElement(titlebar)
        });
      }

      pointerId = null;
      const rect = windowElement.getBoundingClientRect();
      saveSettings({ windowPosition: { left: Math.round(rect.left), top: Math.round(rect.top) } }, 'save-window-position');
      log('info', 'move-window', 'The utility window was moved.', {
        left: Math.round(rect.left),
        top: Math.round(rect.top)
      });
    };

    titlebar.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      const rect = windowElement.getBoundingClientRect();
      dragging = true;
      pointerId = event.pointerId;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      windowElement.style.right = 'auto';
      windowElement.style.bottom = 'auto';
      windowElement.style.left = `${rect.left}px`;
      windowElement.style.top = `${rect.top}px`;

      try {
        titlebar.setPointerCapture(pointerId);
      } catch (error) {
        dragging = false;
        pointerId = null;
        log('error', 'capture-window-pointer', 'Could not capture the pointer for window dragging.', {
          element: describeElement(titlebar),
          error: formatError(error)
        });
        return;
      }

      log('debug', 'move-window', 'Window dragging started.', {
        pointerId,
        startLeft: Math.round(rect.left),
        startTop: Math.round(rect.top)
      });
      event.preventDefault();
    });

    titlebar.addEventListener('pointermove', onPointerMove);
    titlebar.addEventListener('pointerup', stopDragging);
    titlebar.addEventListener('pointercancel', stopDragging);

    state.dragCleanup = () => {
      titlebar.removeEventListener('pointermove', onPointerMove);
      titlebar.removeEventListener('pointerup', stopDragging);
      titlebar.removeEventListener('pointercancel', stopDragging);
    };

    log('success', operation, 'Window dragging installed.', {
      titlebar: describeElement(titlebar)
    });
  }

  function installWindowResizeLogging(windowElement) {
    const operation = 'install-window-resize-monitor';
    if (typeof ResizeObserver !== 'function') {
      log('warn', operation, 'ResizeObserver is unavailable, so utility-window resize actions cannot be logged.', {
        expectedApi: 'window.ResizeObserver'
      });
      return;
    }

    let timer = 0;
    let previousSize = '';
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry || state.destroyed) return;
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      const size = `${width}x${height}`;
      if (size === previousSize) return;
      previousSize = size;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        log('info', 'resize-window', 'The utility window was resized.', { width, height });
      }, 300);
    });

    observer.observe(windowElement);
    state.windowResizeCleanup = () => {
      clearTimeout(timer);
      observer.disconnect();
    };

    log('success', operation, 'Utility-window resize monitoring installed.', {
      element: describeElement(windowElement)
    });
  }

  async function ensureSidebarAvailable() {
    const operation = 'ensure-sidebar-available';
    const sidebar = queryFirst('sidebar', document, operation, false);
    if (sidebar && sidebar.getBoundingClientRect().width > 0) {
      markLocatorRecovered('sidebar', operation, sidebar);
      return sidebar;
    }

    reportMissingLocator('sidebar', operation, document, 'error');
    const openButton = queryFirst('sidebarOpenButton', document, operation, false);
    if (!openButton) {
      reportMissingLocator('sidebarOpenButton', operation, document, 'error');
      return null;
    }

    try {
      log('info', operation, 'Attempting to open the ChatGPT sidebar.', {
        control: describeElement(openButton),
        locator: LOCATORS.sidebarOpenButton.selectors.join(' OR ')
      });
      openButton.click();
    } catch (error) {
      log('error', operation, 'Could not activate the sidebar-open control.', {
        control: describeElement(openButton),
        error: formatError(error)
      });
      return null;
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt < 2500) {
      await delay(100);
      const openedSidebar = queryFirst('sidebar', document, operation, false);
      if (openedSidebar && openedSidebar.getBoundingClientRect().width > 0) {
        markLocatorRecovered('sidebar', operation, openedSidebar);
        log('success', operation, 'The ChatGPT sidebar became available.', {
          sidebar: describeElement(openedSidebar),
          width: Math.round(openedSidebar.getBoundingClientRect().width)
        });
        return openedSidebar;
      }
    }

    reportMissingLocator('sidebar', operation, document, 'error');
    return null;
  }

  function installSidebarResizing(handle) {
    const operation = 'install-sidebar-resizing';
    let resizing = false;
    let pointerId = null;
    let startingWidth = 0;

    const onPointerMove = event => {
      if (!resizing || event.pointerId !== pointerId) return;
      const rawWidth = state.sidebarSide === 'right' ? window.innerWidth - event.clientX : event.clientX;
      setSidebarWidth(clampSidebarWidth(rawWidth), 'resize-sidebar-live', false);
      positionSidebarResizer();
    };

    const stopResizing = event => {
      if (!resizing || (event && event.pointerId !== pointerId)) return;
      resizing = false;
      handle.dataset.active = 'false';

      try {
        if (pointerId !== null && handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
      } catch (error) {
        log('warn', 'release-sidebar-pointer', 'Could not release the sidebar-resize pointer capture.', {
          pointerId,
          element: describeElement(handle),
          error: formatError(error)
        });
      }

      pointerId = null;
      const finalWidth = Math.round(readSidebarWidth());
      saveSettings({ sidebarWidth: finalWidth }, 'save-sidebar-width');
      log('info', 'resize-sidebar', 'Sidebar resizing completed.', {
        startingWidth: Math.round(startingWidth),
        finalWidth,
        side: state.sidebarSide
      });
    };

    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      const sidebar = queryFirst('sidebar', document, 'start-sidebar-resize', false);
      if (!sidebar) {
        reportMissingLocator('sidebar', 'start-sidebar-resize', document, 'error');
        return;
      }

      updateSidebarSide(sidebar);
      resizing = true;
      pointerId = event.pointerId;
      startingWidth = readSidebarWidth();
      handle.dataset.active = 'true';

      try {
        handle.setPointerCapture(pointerId);
      } catch (error) {
        resizing = false;
        pointerId = null;
        handle.dataset.active = 'false';
        log('error', 'capture-sidebar-pointer', 'Could not capture the pointer for sidebar resizing.', {
          element: describeElement(handle),
          error: formatError(error)
        });
        return;
      }

      log('debug', 'resize-sidebar', 'Sidebar resizing started.', {
        startingWidth: Math.round(startingWidth),
        side: state.sidebarSide
      });
      event.preventDefault();
    });

    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', stopResizing);
    handle.addEventListener('pointercancel', stopResizing);

    state.sidebarResizeCleanup = () => {
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', stopResizing);
      handle.removeEventListener('pointercancel', stopResizing);
    };

    positionSidebarResizer();
    log('success', operation, 'Sidebar resize handle installed.', {
      handle: describeElement(handle)
    });
  }

  function widenSidebar() {
    const operation = 'widen-sidebar';
    const sidebar = queryFirst('sidebar', document, operation, false);
    if (!sidebar) {
      reportMissingLocator('sidebar', operation, document, 'error');
      state.sidebarResizer.style.display = 'none';
      return;
    }

    updateSidebarSide(sidebar);
    state.sidebarResizer.style.display = '';
    const currentWidth = readSidebarWidth();
    const savedWidth = Number(state.settings.sidebarWidth);
    const desiredWidth = Number.isFinite(savedWidth)
      ? savedWidth
      : Math.max(currentWidth * 2, PREFERRED_SIDEBAR_WIDTH);
    const targetWidth = clampSidebarWidth(desiredWidth);

    setSidebarWidth(targetWidth, operation, true);
    positionSidebarResizer();

    requestAnimationFrame(() => {
      const measuredWidth = readSidebarWidth();
      if (Math.abs(measuredWidth - targetWidth) > 16) {
        log('error', 'verify-sidebar-width', 'The requested sidebar width was not applied as expected.', {
          requestedWidth: Math.round(targetWidth),
          measuredWidth: Math.round(measuredWidth),
          cssVariable: '--sidebar-width',
          sidebar: describeElement(sidebar)
        });
      } else {
        log('success', 'verify-sidebar-width', 'The widened sidebar width was verified.', {
          requestedWidth: Math.round(targetWidth),
          measuredWidth: Math.round(measuredWidth),
          sidebar: describeElement(sidebar)
        });
      }
    });
  }

  function setSidebarWidth(width, operation, shouldLog) {
    const clampedWidth = clampSidebarWidth(width);
    try {
      document.documentElement.style.setProperty('--sidebar-width', `${Math.round(clampedWidth)}px`);
      if (shouldLog) {
        log('info', operation, 'Sidebar width requested through the ChatGPT CSS variable.', {
          cssVariable: '--sidebar-width',
          width: Math.round(clampedWidth)
        });
      }
    } catch (error) {
      log('error', operation, 'Could not set the ChatGPT sidebar width CSS variable.', {
        cssVariable: '--sidebar-width',
        requestedWidth: Math.round(clampedWidth),
        error: formatError(error)
      });
    }
  }

  function readSidebarWidth() {
    const sidebar = queryFirst('sidebar', document, 'read-sidebar-width', false);
    if (sidebar) {
      const measuredWidth = sidebar.getBoundingClientRect().width;
      if (Number.isFinite(measuredWidth) && measuredWidth > 0) return measuredWidth;
    }

    const rawValue = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width');
    const parsedValue = Number.parseFloat(rawValue);
    if (Number.isFinite(parsedValue) && parsedValue > 0) return parsedValue;

    logDiagnostic('invalid-sidebar-width', 'error', 'read-sidebar-width', 'No valid sidebar width could be measured or parsed. A fallback width will be used.', {
      measuredLocator: LOCATORS.sidebar.selectors.join(' OR '),
      cssVariable: '--sidebar-width',
      cssValue: rawValue || '[empty]',
      fallbackWidth: MIN_SIDEBAR_WIDTH
    });
    return MIN_SIDEBAR_WIDTH;
  }

  function clampSidebarWidth(width) {
    const viewportMaximum = Math.max(MIN_SIDEBAR_WIDTH, window.innerWidth * MAX_SIDEBAR_VIEWPORT_RATIO);
    const maximum = Math.min(MAX_SIDEBAR_WIDTH, viewportMaximum);
    return clamp(Number(width) || PREFERRED_SIDEBAR_WIDTH, MIN_SIDEBAR_WIDTH, maximum);
  }

  function updateSidebarSide(sidebar) {
    const rect = sidebar.getBoundingClientRect();
    state.sidebarSide = rect.left <= Math.max(8, window.innerWidth - rect.right) ? 'left' : 'right';
  }

  function positionSidebarResizer() {
    if (!state.sidebarResizer) return;
    const sidebar = queryFirst('sidebar', document, 'position-sidebar-resizer', false);
    if (!sidebar || sidebar.getBoundingClientRect().width <= 0) {
      state.sidebarResizer.style.display = 'none';
      reportMissingLocator('sidebar', 'position-sidebar-resizer', document, 'error');
      return;
    }

    markLocatorRecovered('sidebar', 'position-sidebar-resizer', sidebar);
    state.sidebarResizer.style.display = '';
    const rect = sidebar.getBoundingClientRect();
    updateSidebarSide(sidebar);
    const handleLeft = state.sidebarSide === 'right' ? rect.left - 5 : rect.right - 5;
    state.sidebarResizer.style.left = `${Math.round(handleLeft)}px`;
    state.sidebarResizer.style.top = `${Math.max(0, Math.round(rect.top))}px`;
    state.sidebarResizer.style.height = `${Math.max(0, Math.round(rect.height))}px`;
  }

  function installDomMonitoring() {
    const operation = 'install-dom-monitoring';
    const body = queryFirst('documentBody', document, operation, true);

    state.observer?.disconnect();
    state.observer = new MutationObserver(mutations => {
      if (state.destroyed) return;
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'href' && isConversationAnchor(mutation.target)) {
          scheduleScan('conversation-href-change');
          return;
        }

        if (mutation.type === 'childList' && mutationCouldAffectSidebar(mutation)) {
          scheduleScan('sidebar-dom-change');
          return;
        }
      }
    });

    state.observer.observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
    state.observerRoot = body;

    log('success', operation, 'DOM monitoring installed.', {
      observerRoot: describeElement(body),
      observedMutations: 'childList, href attributes'
    });
  }

  function mutationCouldAffectSidebar(mutation) {
    const target = mutation.target;
    if (target instanceof Element && matchesAnyOrDescendant(target, LOCATORS.sidebar.selectors)) return true;
    if (target instanceof Element && target.closest(LOCATORS.sidebar.selectors.join(','))) return true;

    for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (matchesAnyOrDescendant(node, LOCATORS.sidebar.selectors)) return true;
      if (matchesAnyOrDescendant(node, LOCATORS.conversationRows.selectors)) return true;
    }

    for (const node of mutation.removedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches?.('[data-cgpt-archive-id], [data-cgpt-archive-button-host="true"]')) return true;
      if (node.querySelector?.('[data-cgpt-archive-id], [data-cgpt-archive-button-host="true"]')) return true;
    }

    return false;
  }

  function matchesAnyOrDescendant(element, selectors) {
    for (const selector of selectors) {
      try {
        if (element.matches(selector) || element.querySelector(selector)) return true;
      } catch (error) {
        logDiagnostic(`invalid-selector:${selector}`, 'error', 'evaluate-dom-mutation', 'A configured selector could not be evaluated.', {
          selector,
          error: formatError(error),
          element: describeElement(element)
        });
      }
    }
    return false;
  }

  function installScrollMonitoring() {
    const operation = 'install-scroll-monitoring';
    const onScroll = event => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const sidebar = queryFirst('sidebar', document, 'detect-sidebar-scroll', false);
      if (!sidebar || !sidebar.contains(target)) return;
      scheduleScan('sidebar-scroll');
    };

    document.addEventListener('scroll', onScroll, true);
    state.scrollCleanup = () => document.removeEventListener('scroll', onScroll, true);

    const scrollport = queryFirst('historyScrollport', document, operation, false);
    if (!scrollport) reportMissingLocator('historyScrollport', operation, document, 'error');

    log('success', operation, 'Sidebar scroll monitoring installed.', {
      eventTarget: 'document capture phase',
      expectedScrollport: LOCATORS.historyScrollport.selectors.join(' OR '),
      locatedScrollport: scrollport ? describeElement(scrollport) : '[not found]'
    });
  }

  function installHealthChecks() {
    const operation = 'install-health-checks';
    clearInterval(state.healthTimer);
    state.healthTimer = window.setInterval(() => {
      if (state.destroyed) return;

      const body = queryFirst('documentBody', document, 'health-check-body', false);
      if (!body) {
        reportMissingLocator('documentBody', 'health-check-body', document, 'error');
      } else if (body !== state.observerRoot) {
        log('warn', 'health-check-body', 'The document body changed. DOM monitoring will be reinstalled.', {
          previousObserverRoot: describeElement(state.observerRoot),
          currentBody: describeElement(body)
        });
        installDomMonitoring();
      }

      if (!document.getElementById(HOST_STYLE_ID)) {
        log('error', 'health-check-styles', 'The host-style element is missing. It will be reinstalled.', {
          expectedElementId: HOST_STYLE_ID,
          operationNeeded: 'install-host-styles'
        });
        installHostStyles();
      }

      if (!state.uiHost?.isConnected) {
        log('error', 'health-check-ui', 'The Shadow DOM utility host is no longer connected to the document.', {
          expectedElementId: UI_HOST_ID,
          operationNeeded: 'create-shadow-ui'
        });
      }

      const sidebar = queryFirst('sidebar', document, 'health-check-sidebar', false);
      if (!sidebar) {
        reportMissingLocator('sidebar', 'health-check-sidebar', document, 'error');
      } else {
        markLocatorRecovered('sidebar', 'health-check-sidebar', sidebar);
        positionSidebarResizer();
      }

      scheduleScan('health-check');
    }, HEALTH_CHECK_MS);

    log('success', operation, 'Periodic health checks installed.', {
      intervalMs: HEALTH_CHECK_MS
    });
  }

  function installPageErrorLogging() {
    const operation = 'install-page-error-logging';
    const onError = event => {
      if (state.destroyed) return;
      const filename = String(event.filename || '');
      const stack = event.error?.stack || '';
      const belongsToArchiveMode = stack.includes('CHATGPT_ARCHIVE_MODE') || filename.startsWith('javascript:');
      if (!belongsToArchiveMode) return;
      log('error', 'uncaught-script-error', 'An uncaught script error occurred.', {
        message: event.message || formatError(event.error),
        filename: filename || '[inline bookmarklet]',
        line: event.lineno || '[unknown]',
        column: event.colno || '[unknown]'
      });
    };

    const onUnhandledRejection = event => {
      if (state.destroyed) return;
      log('error', 'unhandled-promise-rejection', 'An unhandled promise rejection occurred while archive mode was active.', {
        reason: formatError(event.reason)
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    state.pageErrorCleanup = () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };

    log('success', operation, 'Application-level error logging installed.');
  }

  function scheduleScan(source) {
    if (state.destroyed) return;
    state.scanSources.add(source || 'unspecified');
    if (state.scanTimer) return;

    state.scanTimer = window.setTimeout(() => {
      state.scanTimer = 0;
      const sources = Array.from(state.scanSources);
      state.scanSources.clear();
      scanConversationRows(sources);
    }, SCAN_DEBOUNCE_MS);
  }

  function scanConversationRows(sources) {
    if (state.destroyed) return;

    const scanId = ++state.scanSequence;
    const operation = `scan-${scanId}`;
    const startedAt = performance.now();
    const removedEntries = cleanupDisconnectedEntries();
    const sidebar = queryFirst('sidebar', document, operation, false);

    log('debug', operation, 'Conversation-row scan started.', {
      sources: sources.join(', '),
      removedDisconnectedEntries: removedEntries
    });

    if (!sidebar) {
      reportMissingLocator('sidebar', operation, document, 'error');
      updateStatusBar({ lastScan: `scan ${scanId}: sidebar missing` });
      return;
    }

    markLocatorRecovered('sidebar', operation, sidebar);
    positionSidebarResizer();
    const anchors = queryAll('conversationRows', document, operation, false);

    if (anchors.length === 0) {
      reportMissingLocator('conversationRows', operation, sidebar, 'error');
      updateStatusBar({ lastScan: `scan ${scanId}: no rows` });
      return;
    }

    markLocatorRecovered('conversationRows', operation, anchors[0]);
    let installed = 0;
    let refreshed = 0;
    let invalid = 0;
    let ready = 0;
    let archived = 0;
    let pending = 0;
    let failed = 0;

    for (const anchor of anchors) {
      const idResult = extractConversationId(anchor);
      if (!idResult.ok) {
        invalid += 1;
        log('error', 'extract-conversation-id', 'A matched conversation row did not contain a usable conversation identifier.', {
          scanId,
          expectedPathPattern: '/c/{conversation-id}',
          href: anchor.getAttribute('href') || '[missing]',
          row: describeElement(anchor),
          error: idResult.error
        });
        continue;
      }

      const id = idResult.id;
      const currentEntry = state.entriesByAnchor.get(anchor);
      if (currentEntry && currentEntry.id === id && currentEntry.host.isConnected) {
        const title = extractConversationTitle(anchor, id, scanId);
        if (title !== currentEntry.title) {
          currentEntry.title = title;
          updateEntryAccessibility(currentEntry);
          refreshed += 1;
        }
        applyConversationStatus(id, resolveInitialStatus(id), false, operation);
      } else {
        if (currentEntry) removeEntry(currentEntry, 'row-reused-with-different-conversation');
        const installedEntry = installArchiveControl(anchor, id, scanId);
        if (installedEntry) installed += 1;
        else invalid += 1;
      }

      const status = resolveInitialStatus(id);
      if (status === 'archived') archived += 1;
      else if (status === 'pending') pending += 1;
      else if (status === 'error') failed += 1;
      else ready += 1;
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const summary = {
      scanId,
      matchedRows: anchors.length,
      installed,
      refreshed,
      invalid,
      ready,
      archived,
      pending,
      failed,
      removedDisconnectedEntries: removedEntries,
      durationMs,
      sources: sources.join(', ')
    };

    state.lastScanSummary = summary;
    log(installed || refreshed || invalid ? 'info' : 'debug', operation, 'Conversation-row scan completed.', summary);
    updateStatusBar({ lastScan: `scan ${scanId}: ${anchors.length} rows, ${installed} added, ${invalid} invalid` });
  }

  function extractConversationId(anchor) {
    try {
      const href = anchor.getAttribute('href');
      if (!href) return { ok: false, error: 'The href attribute is missing.' };
      const baseUrl = location.origin && location.origin !== 'null' ? location.origin : document.baseURI || 'https://chatgpt.com/';
      const url = new URL(href, baseUrl);
      const match = url.pathname.match(/^\/c\/([^/?#]+)/);
      if (!match) return { ok: false, error: `The pathname "${url.pathname}" does not match /c/{conversation-id}.` };
      const id = decodeURIComponent(match[1]);
      if (!isConversationId(id)) return { ok: false, error: `The extracted identifier "${id}" is not valid.` };
      return { ok: true, id };
    } catch (error) {
      return { ok: false, error: formatError(error) };
    }
  }

  function isConversationId(value) {
    return typeof value === 'string' && value.length >= 8 && value.length <= 128 && /^[A-Za-z0-9_-]+$/.test(value);
  }

  function extractConversationTitle(anchor, id, scanId) {
    const operation = 'extract-conversation-title';
    for (const selector of LOCATORS.conversationTitle.selectors) {
      try {
        const titleNode = anchor.querySelector(selector);
        const text = titleNode?.textContent?.trim();
        if (text) {
          markLocatorRecovered(`conversationTitle:${id}`, operation, titleNode);
          return text;
        }
      } catch (error) {
        log('error', operation, 'A configured conversation-title selector could not be evaluated.', {
          scanId,
          conversationId: id,
          selector,
          row: describeElement(anchor),
          error: formatError(error)
        });
      }
    }

    const ariaLabel = anchor.getAttribute('aria-label')?.trim();
    if (ariaLabel) {
      logDiagnostic(`title-fallback-aria:${id}`, 'error', operation, 'The visible title element was not found. The row aria-label will be used as a fallback.', {
        scanId,
        conversationId: id,
        elementDescription: LOCATORS.conversationTitle.description,
        locator: LOCATORS.conversationTitle.selectors.join(' OR '),
        row: describeElement(anchor),
        fallback: 'aria-label'
      });
      return ariaLabel.replace(/, pinned conversation$/i, '').trim();
    }

    logDiagnostic(`title-fallback-id:${id}`, 'error', operation, 'Neither a visible title element nor an aria-label was found. The conversation identifier will be used as the title.', {
      scanId,
      conversationId: id,
      elementDescription: LOCATORS.conversationTitle.description,
      locator: LOCATORS.conversationTitle.selectors.join(' OR '),
      row: describeElement(anchor),
      fallback: 'conversation id'
    });
    return id;
  }

  function installArchiveControl(anchor, id, scanId) {
    const operation = 'install-archive-control';
    const title = extractConversationTitle(anchor, id, scanId);
    const container = anchor.parentElement;

    if (!container) {
      log('error', operation, 'The conversation row has no parent container, so an archive control cannot be positioned safely.', {
        scanId,
        conversationId: id,
        title,
        expectedElement: 'Parent element of the conversation link',
        row: describeElement(anchor)
      });
      return null;
    }

    try {
      const staleHost = container.querySelector(`:scope > [data-cgpt-archive-button-host="true"][data-conversation-id="${cssEscape(id)}"]`);
      staleHost?.remove();

      const host = document.createElement('span');
      host.dataset.cgptArchiveButtonHost = 'true';
      host.dataset.conversationId = id;
      host.setAttribute('role', 'presentation');

      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host {
            all: initial;
            display: inline-flex;
            font-family: "Segoe UI", Tahoma, Arial, sans-serif;
          }

          button {
            min-width: 88px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 11px;
            color: #ffffff;
            background: #0b5cab;
            border: 1px solid #08447f;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
            cursor: pointer;
            font: 600 12px/1 "Segoe UI", Tahoma, Arial, sans-serif;
            white-space: nowrap;
          }

          button:hover:not(:disabled) {
            background: #094d91;
          }

          button:active:not(:disabled) {
            background: #073f77;
            transform: translateY(1px);
          }

          button:focus-visible {
            outline: 2px solid #ffffff;
            outline-offset: 1px;
            box-shadow: 0 0 0 4px #0b5cab;
          }

          button:disabled {
            cursor: default;
          }

          button[data-state="pending"] {
            color: #ffffff;
            background: #8a5200;
            border-color: #6f4100;
          }

          button[data-state="archived"] {
            color: #ffffff;
            background: #047857;
            border-color: #035f46;
          }

          button[data-state="error"] {
            color: #ffffff;
            background: #b42318;
            border-color: #8f1c13;
          }
        </style>
        <button type="button" data-state="ready">Archive</button>
      `;

      const button = shadow.querySelector('button');
      if (!button) {
        throw new Error('The archive button was not found inside the newly created Shadow DOM host.');
      }

      const entry = { id, title, anchor, container, host, shadow, button };
      anchor.dataset.cgptArchiveId = id;
      container.dataset.cgptArchiveRowContainer = 'true';

      button.addEventListener('pointerdown', stopRowEvent);
      button.addEventListener('click', event => {
        stopRowEvent(event);
        void archiveConversation(id, entry.title);
      });
      button.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
      });

      container.appendChild(host);
      state.entriesByAnchor.set(anchor, entry);
      if (!state.entriesById.has(id)) state.entriesById.set(id, new Set());
      state.entriesById.get(id).add(entry);
      updateEntryAccessibility(entry);
      applyConversationStatus(id, resolveInitialStatus(id), false, operation);

      log('debug', operation, 'Archive control installed for a conversation row.', {
        scanId,
        conversationId: id,
        title,
        row: describeElement(anchor),
        container: describeElement(container),
        controlHost: describeElement(host),
        initialStatus: resolveInitialStatus(id)
      });

      return entry;
    } catch (error) {
      log('error', operation, 'Could not install an archive control for a conversation row.', {
        scanId,
        conversationId: id,
        title,
        row: describeElement(anchor),
        container: describeElement(container),
        expectedOperation: 'Create a sibling Shadow DOM control and position it inside the row container',
        error: formatError(error)
      });
      return null;
    }
  }

  function stopRowEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function updateEntryAccessibility(entry) {
    const archived = resolveInitialStatus(entry.id) === 'archived';
    entry.host.setAttribute('aria-label', archived ? `${entry.title} is archived` : `Archive ${entry.title}`);
    entry.button.setAttribute('aria-label', archived ? `${entry.title} is archived` : `Archive ${entry.title}`);
  }

  function removeEntry(entry, reason) {
    const operation = 'remove-archive-control';
    try {
      entry.host.remove();
      delete entry.anchor.dataset.cgptArchiveId;
      delete entry.anchor.dataset.cgptArchiveStatus;
      state.entriesByAnchor.delete(entry.anchor);

      const entries = state.entriesById.get(entry.id);
      entries?.delete(entry);
      if (entries?.size === 0) state.entriesById.delete(entry.id);

      if (!entry.container.querySelector(':scope > [data-cgpt-archive-button-host="true"]')) {
        delete entry.container.dataset.cgptArchiveRowContainer;
      }

      log('debug', operation, 'Archive control removed.', {
        conversationId: entry.id,
        title: entry.title,
        reason
      });
    } catch (error) {
      log('error', operation, 'Could not completely remove an archive control.', {
        conversationId: entry.id,
        title: entry.title,
        reason,
        row: describeElement(entry.anchor),
        controlHost: describeElement(entry.host),
        error: formatError(error)
      });
    }
  }

  function cleanupDisconnectedEntries() {
    let removed = 0;
    for (const entry of Array.from(state.entriesByAnchor.values())) {
      if (!entry.anchor.isConnected || !entry.container.isConnected || !entry.host.isConnected) {
        removeEntry(entry, 'row-or-control-disconnected');
        removed += 1;
      }
    }
    return removed;
  }

  function resolveInitialStatus(id) {
    if (state.archivedIds.has(id)) return 'archived';
    return state.statusById.get(id) || 'ready';
  }

  function applyConversationStatus(id, status, shouldLog, operation) {
    const previousStatus = state.statusById.get(id);
    state.statusById.set(id, status);
    const entries = state.entriesById.get(id);

    if (entries) {
      for (const entry of entries) {
        entry.anchor.dataset.cgptArchiveStatus = status;
        entry.button.dataset.state = status;

        if (status === 'pending') {
          entry.button.textContent = 'Archiving...';
          entry.button.disabled = true;
          entry.button.title = `Archiving ${entry.title}`;
        } else if (status === 'archived') {
          entry.button.textContent = 'Archived';
          entry.button.disabled = true;
          entry.button.title = `${entry.title} is archived. Repeat archiving is disabled.`;
        } else if (status === 'error') {
          entry.button.textContent = 'Retry';
          entry.button.disabled = false;
          entry.button.title = `The previous archive request for ${entry.title} failed. Click to retry.`;
        } else {
          entry.button.textContent = 'Archive';
          entry.button.disabled = false;
          entry.button.title = `Archive ${entry.title}`;
        }

        updateEntryAccessibility(entry);
      }
    }

    if (shouldLog && previousStatus !== status) {
      log('info', operation || 'update-conversation-status', 'Conversation status changed.', {
        conversationId: id,
        previousStatus: previousStatus || '[unset]',
        status,
        visibleRows: entries?.size || 0
      });
    }

    updateStatusBar();
  }

  async function archiveConversation(id, title) {
    const operationId = `archive-${++state.archiveSequence}`;
    const currentStatus = resolveInitialStatus(id);

    log('info', 'archive-click', 'Archive control activated.', {
      operationId,
      conversationId: id,
      title,
      currentStatus
    });

    if (currentStatus === 'pending') {
      log('warn', 'archive-click', 'Duplicate archive action ignored because a request is already in progress.', {
        operationId,
        conversationId: id,
        title
      });
      return;
    }

    if (currentStatus === 'archived' || state.archivedIds.has(id)) {
      applyConversationStatus(id, 'archived', false, operationId);
      log('warn', 'archive-click', 'Duplicate archive action ignored because the conversation is already marked archived.', {
        operationId,
        conversationId: id,
        title
      });
      return;
    }

    applyConversationStatus(id, 'pending', true, operationId);
    log('info', operationId, 'Starting conversation archive request.', {
      conversationId: id,
      title,
      endpoint: `/backend-api/conversation/${id}`,
      method: 'PATCH'
    });

    try {
      const result = await sendArchiveRequest(id, operationId);
      state.archivedIds.add(id);
      applyConversationStatus(id, 'archived', true, operationId);
      saveArchivedIds(operationId);
      log('success', operationId, 'Conversation archived successfully.', {
        conversationId: id,
        title,
        httpStatus: result.status,
        attempts: result.attempts,
        authorizationAttached: result.authorizationAttached
      });
    } catch (error) {
      applyConversationStatus(id, 'error', true, operationId);
      log('error', operationId, 'Conversation archive request failed.', {
        conversationId: id,
        title,
        expectedOperation: 'PATCH the conversation resource with { is_archived: true }',
        endpoint: `/backend-api/conversation/${id}`,
        error: formatError(error),
        errorName: error?.name || '[unknown]'
      });
    }
  }

  async function sendArchiveRequest(id, operationId) {
    const path = `/backend-api/conversation/${encodeURIComponent(id)}`;
    let attempts = 0;
    let token = await getSessionAccessToken(false, operationId);
    let authorizationAttached = Boolean(token);

    attempts += 1;
    let response = await performFetch({
      operationId,
      purpose: 'archive-conversation',
      url: path,
      timeoutMs: REQUEST_TIMEOUT_MS,
      options: createArchiveRequestOptions(token)
    });

    if (response.status === 401 || response.status === 403) {
      log('warn', operationId, 'The archive request was rejected by authorization. The session token will be refreshed and the request retried once.', {
        conversationId: id,
        httpStatus: response.status,
        attempt: attempts,
        endpoint: path
      });

      token = await getSessionAccessToken(true, operationId);
      authorizationAttached = Boolean(token);
      attempts += 1;
      response = await performFetch({
        operationId,
        purpose: 'archive-conversation-retry',
        url: path,
        timeoutMs: REQUEST_TIMEOUT_MS,
        options: createArchiveRequestOptions(token)
      });
    }

    if (!response.ok) {
      const responseDetails = await readResponseDetails(response, operationId, path);
      const error = new Error(`Archive endpoint returned HTTP ${response.status} ${response.statusText || 'request failed'}.`);
      error.name = 'ArchiveHttpError';
      error.httpStatus = response.status;
      error.responseDetails = responseDetails;
      throw new Error(`${error.message}${responseDetails ? ` Response: ${responseDetails}` : ''}`);
    }

    return {
      status: response.status,
      attempts,
      authorizationAttached
    };
  }

  function createArchiveRequestOptions(token) {
    const headers = {
      accept: '*/*',
      'content-type': 'application/json',
      'oai-language': document.documentElement.lang || navigator.language || 'en-US'
    };

    if (token) headers.authorization = `Bearer ${token}`;

    return {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers,
      body: JSON.stringify({ is_archived: true })
    };
  }

  async function getSessionAccessToken(forceRefresh, operationId) {
    const operation = 'get-session-access-token';
    if (!forceRefresh && state.accessTokenPromise) {
      log('debug', operation, 'Reusing the in-memory session-token lookup result.', { operationId });
      return state.accessTokenPromise;
    }

    state.accessTokenPromise = (async () => {
      log('info', operation, forceRefresh ? 'Refreshing the current ChatGPT session token.' : 'Looking up the current ChatGPT session token.', {
        operationId,
        endpoint: '/api/auth/session',
        tokenValueLogged: false
      });

      try {
        const response = await performFetch({
          operationId,
          purpose: forceRefresh ? 'refresh-session-token' : 'read-session-token',
          url: '/api/auth/session',
          timeoutMs: SESSION_TIMEOUT_MS,
          options: {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            headers: { accept: 'application/json' }
          }
        });

        if (!response.ok) {
          log('error', operation, 'The session endpoint did not return a successful response. The archive request will continue using authenticated cookies only.', {
            operationId,
            endpoint: '/api/auth/session',
            httpStatus: response.status,
            statusText: response.statusText || '[empty]'
          });
          return null;
        }

        let session;
        try {
          session = await response.json();
        } catch (error) {
          log('error', operation, 'The session endpoint response was not valid JSON. The archive request will continue using authenticated cookies only.', {
            operationId,
            endpoint: '/api/auth/session',
            contentType: response.headers.get('content-type') || '[missing]',
            error: formatError(error)
          });
          return null;
        }

        const token = session?.accessToken || session?.access_token || session?.user?.accessToken || null;
        if (typeof token !== 'string' || token.length <= 20) {
          log('warn', operation, 'No usable access token was found in the session response. The archive request will use authenticated cookies only.', {
            operationId,
            endpoint: '/api/auth/session',
            checkedFields: 'accessToken, access_token, user.accessToken',
            tokenValueLogged: false
          });
          return null;
        }

        log('success', operation, 'A current session access token was found and retained only in memory.', {
          operationId,
          endpoint: '/api/auth/session',
          tokenValueLogged: false,
          tokenLength: token.length
        });
        return token;
      } catch (error) {
        log('error', operation, 'The session-token lookup failed. The archive request will continue using authenticated cookies only.', {
          operationId,
          endpoint: '/api/auth/session',
          expectedOperation: 'GET the authenticated session document',
          error: formatError(error)
        });
        return null;
      }
    })();

    return state.accessTokenPromise;
  }

  async function performFetch({ operationId, purpose, url, options, timeoutMs }) {
    const controller = new AbortController();
    state.activeControllers.add(controller);
    const method = options.method || 'GET';
    const authorizationAttached = Boolean(options.headers?.authorization);
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = performance.now();

    log('info', 'network-request', 'Network request started.', {
      operationId,
      purpose,
      method,
      url,
      timeoutMs,
      credentials: options.credentials || '[default]',
      authorizationAttached,
      authorizationValueLogged: false
    });

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      log(response.ok ? 'success' : 'warn', 'network-response', 'Network response received.', {
        operationId,
        purpose,
        method,
        url,
        httpStatus: response.status,
        statusText: response.statusText || '[empty]',
        durationMs: Math.round(performance.now() - startedAt),
        authorizationAttached
      });
      return response;
    } catch (error) {
      const timedOut = error?.name === 'AbortError';
      log('error', 'network-request', timedOut ? 'Network request timed out.' : 'Network request failed before a response was received.', {
        operationId,
        purpose,
        method,
        url,
        timeoutMs,
        durationMs: Math.round(performance.now() - startedAt),
        authorizationAttached,
        expectedOperation: `${method} ${url}`,
        error: timedOut ? `Timed out after ${timeoutMs}ms.` : formatError(error)
      });
      if (timedOut) {
        const timeoutError = new Error(`Request timed out after ${timeoutMs}ms: ${method} ${url}`);
        timeoutError.name = 'RequestTimeoutError';
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timer);
      state.activeControllers.delete(controller);
    }
  }

  async function readResponseDetails(response, operationId, url) {
    const operation = 'read-error-response';
    try {
      const text = sanitizeSensitiveText((await response.text()).trim().replace(/\s+/g, ' ')).slice(0, 600);
      log('debug', operation, 'Error response details read.', {
        operationId,
        url,
        httpStatus: response.status,
        detailsLength: text.length
      });
      return text;
    } catch (error) {
      log('error', operation, 'Could not read the failed network response body.', {
        operationId,
        url,
        httpStatus: response.status,
        error: formatError(error)
      });
      return '';
    }
  }

  function updateStatusBar(extra = {}) {
    if (!state.statusText || state.destroyed) return;

    const counts = { ready: 0, pending: 0, archived: 0, error: 0 };
    const visibleIds = new Set();
    for (const entry of state.entriesByAnchor.values()) visibleIds.add(entry.id);
    for (const id of visibleIds) {
      const status = resolveInitialStatus(id);
      counts[status] = (counts[status] || 0) + 1;
    }

    const parts = [
      `${state.entriesByAnchor.size} visible rows`,
      `${visibleIds.size} conversations`,
      `${counts.ready} ready`,
      `${counts.pending} pending`,
      `${counts.archived} archived`,
      `${counts.error} errors`,
      `${state.archivedIds.size} remembered`
    ];

    if (extra.lastScan) parts.push(extra.lastScan);
    const text = parts.join(' | ');
    if (text !== state.lastStatusText) {
      state.statusText.textContent = text;
      state.lastStatusText = text;
    }
  }

  function queryFirst(locatorKey, root, operation, required) {
    const locator = LOCATORS[locatorKey];
    if (!locator) {
      log('error', operation, 'An unknown locator key was requested.', {
        locatorKey,
        knownLocatorKeys: Object.keys(LOCATORS).join(', ')
      });
      if (required) throw new Error(`Unknown locator key: ${locatorKey}`);
      return null;
    }

    for (const selector of locator.selectors) {
      try {
        const element = root.querySelector(selector);
        if (element) {
          markLocatorRecovered(locatorKey, operation, element);
          return element;
        }
      } catch (error) {
        log('error', operation, 'A configured locator selector could not be evaluated.', {
          locatorKey,
          elementDescription: locator.description,
          selector,
          searchRoot: describeElement(root),
          error: formatError(error)
        });
      }
    }

    if (required) {
      reportMissingLocator(locatorKey, operation, root, 'error');
      throw new Error(`Required element not found: ${locator.description}`);
    }

    return null;
  }

  function queryAll(locatorKey, root, operation, required) {
    const locator = LOCATORS[locatorKey];
    if (!locator) {
      log('error', operation, 'An unknown locator key was requested.', {
        locatorKey,
        knownLocatorKeys: Object.keys(LOCATORS).join(', ')
      });
      if (required) throw new Error(`Unknown locator key: ${locatorKey}`);
      return [];
    }

    const found = new Set();
    for (const selector of locator.selectors) {
      try {
        for (const element of root.querySelectorAll(selector)) found.add(element);
      } catch (error) {
        log('error', operation, 'A configured locator selector could not be evaluated.', {
          locatorKey,
          elementDescription: locator.description,
          selector,
          searchRoot: describeElement(root),
          error: formatError(error)
        });
      }
    }

    const result = Array.from(found);
    if (result.length > 0) markLocatorRecovered(locatorKey, operation, result[0]);
    if (required && result.length === 0) {
      reportMissingLocator(locatorKey, operation, root, 'error');
      throw new Error(`Required elements not found: ${locator.description}`);
    }
    return result;
  }

  function reportMissingLocator(locatorKey, operation, root, level) {
    const locator = LOCATORS[locatorKey];
    const key = `missing-locator:${locatorKey}:${operation.replace(/-\d+$/, '')}`;
    logDiagnostic(key, level, operation, 'Expected element was not found.', locatorContext(locatorKey, root));
  }

  function locatorContext(locatorKey, root) {
    const locator = LOCATORS[locatorKey];
    return {
      locatorKey,
      elementDescription: locator?.description || '[unknown locator]',
      locator: locator?.selectors?.join(' OR ') || '[none]',
      searchRoot: describeElement(root),
      page: location.pathname,
      readyState: document.readyState,
      operationNeeded: `Locate ${locator?.description || locatorKey}`
    };
  }

  function markLocatorRecovered(locatorKey, operation, element) {
    const prefix = `missing-locator:${locatorKey}:`;
    for (const [key, diagnostic] of state.diagnostics) {
      if (!key.startsWith(prefix) || !diagnostic.active) continue;
      diagnostic.active = false;
      log('success', operation, 'A previously missing expected element is available again.', {
        locatorKey,
        elementDescription: LOCATORS[locatorKey]?.description || '[unknown locator]',
        element: describeElement(element)
      });
    }
  }

  function logDiagnostic(key, level, operation, message, context) {
    const now = Date.now();
    const existing = state.diagnostics.get(key);
    if (existing?.active && now - existing.lastLoggedAt < DIAGNOSTIC_REPEAT_MS) return;
    state.diagnostics.set(key, { active: true, lastLoggedAt: now });
    log(level, operation, message, context);
  }

  function requireShadowElement(shadow, selector, operation, description) {
    const element = shadow.querySelector(selector);
    if (element) return element;
    log('error', operation, 'An expected element was not found inside the application Shadow DOM.', {
      elementDescription: description,
      locator: selector,
      searchRoot: 'Archive Mode ShadowRoot',
      operationNeeded: `Locate ${description}`
    });
    throw new Error(`Shadow DOM element not found: ${description}`);
  }

  function isConversationAnchor(node) {
    if (!(node instanceof HTMLAnchorElement)) return false;
    return extractConversationId(node).ok;
  }

  function log(level, operation, message, context = {}) {
    const record = {
      time: new Date(),
      level: normalizeLogLevel(level),
      operation: String(operation || 'unspecified'),
      message: String(message || ''),
      context: sanitizeContext(context)
    };

    writeConsoleLog(record);

    if (!state.logList || !state.logList.isConnected) {
      state.pendingLogs.push(record);
      if (state.pendingLogs.length > MAX_LOG_ENTRIES) state.pendingLogs.shift();
      return;
    }

    renderLogRecord(record);
  }

  function flushPendingLogs() {
    if (!state.logList) return;
    const records = state.pendingLogs.splice(0);
    for (const record of records) renderLogRecord(record);
  }

  function renderLogRecord(record) {
    if (!state.logList || state.destroyed) return;

    const row = document.createElement('div');
    row.className = 'log-entry';

    const primary = document.createElement('div');
    primary.className = 'log-primary';

    const time = document.createElement('span');
    time.className = 'log-time';
    time.textContent = record.time.toLocaleTimeString([], { hour12: false });

    const level = document.createElement('span');
    level.className = `log-level ${record.level}`;
    level.textContent = record.level;

    const operation = document.createElement('span');
    operation.className = 'log-operation';
    operation.textContent = record.operation;

    const message = document.createElement('span');
    message.className = 'log-message';
    message.textContent = record.message;

    primary.append(time, level, operation, message);
    row.appendChild(primary);

    const contextText = formatContext(record.context);
    if (contextText) {
      const context = document.createElement('div');
      context.className = 'log-context';
      context.textContent = contextText;
      row.appendChild(context);
    }

    state.logList.appendChild(row);
    while (state.logList.childElementCount > MAX_LOG_ENTRIES) state.logList.firstElementChild?.remove();
    state.logList.scrollTop = state.logList.scrollHeight;
  }

  function writeConsoleLog(record) {
    const method = record.level === 'error'
      ? 'error'
      : record.level === 'warn'
        ? 'warn'
        : record.level === 'debug'
          ? 'debug'
          : 'info';
    console[method](`[ChatGPT Archive Mode] [${record.operation}] ${record.message}`, record.context);
  }

  function normalizeLogLevel(level) {
    return ['debug', 'info', 'success', 'warn', 'error'].includes(level) ? level : 'info';
  }

  function sanitizeContext(context) {
    const result = {};
    for (const [key, value] of Object.entries(context || {})) {
      if (/authorization|token|cookie|secret/i.test(key) && !/logged|attached|length/i.test(key)) {
        result[key] = '[redacted]';
      } else if (value instanceof Element) {
        result[key] = describeElement(value);
      } else if (value instanceof Error) {
        result[key] = formatError(value);
      } else if (typeof value === 'string') {
        result[key] = sanitizeSensitiveText(value);
      } else if (value === undefined) {
        result[key] = '[undefined]';
      } else if (value === null) {
        result[key] = '[null]';
      } else if (typeof value === 'object') {
        try {
          result[key] = sanitizeSensitiveText(JSON.stringify(value));
        } catch {
          result[key] = String(value);
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  function formatContext(context) {
    return Object.entries(context)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join('; ');
  }

  function sanitizeSensitiveText(value) {
    return String(value)
      .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
      .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]');
  }

  function describeElement(value) {
    if (!value) return '[null]';
    if (value === document) return 'document';
    if (value instanceof ShadowRoot) return 'ShadowRoot';
    if (!(value instanceof Element)) return String(value);

    const tag = value.tagName.toLowerCase();
    const id = value.id ? `#${value.id}` : '';
    const classes = Array.from(value.classList).slice(0, 4).map(name => `.${name}`).join('');
    const attributes = [];
    for (const name of ['href', 'aria-label', 'data-testid', 'data-sidebar-item', 'data-cgpt-archive-id']) {
      const attributeValue = value.getAttribute(name);
      if (attributeValue) attributes.push(`[${name}="${truncate(attributeValue, 100)}"]`);
    }
    return truncate(`${tag}${id}${classes}${attributes.join('')}`, 320);
  }

  function showFatalFallback(error) {
    const message = `ChatGPT Archive Mode could not start. ${formatError(error)} Check the browser console for contextual logs.`;
    try {
      window.alert(message);
    } catch {
      console.error(message);
    }
  }

  function destroy(finalMessage) {
    if (state.destroyed) return;

    log('info', 'shutdown', finalMessage || 'Archive mode shutdown started.', {
      trackedRows: state.entriesByAnchor.size,
      activeRequests: state.activeControllers.size
    });
    state.destroyed = true;

    clearTimeout(state.scanTimer);
    clearInterval(state.healthTimer);
    state.observer?.disconnect();
    state.dragCleanup?.();
    state.sidebarResizeCleanup?.();
    state.windowResizeCleanup?.();
    state.scrollCleanup?.();
    state.pageErrorCleanup?.();

    for (const controller of state.activeControllers) controller.abort();
    state.activeControllers.clear();

    for (const entry of Array.from(state.entriesByAnchor.values())) {
      try {
        entry.host.remove();
        delete entry.anchor.dataset.cgptArchiveId;
        delete entry.anchor.dataset.cgptArchiveStatus;
        if (!entry.container.querySelector(':scope > [data-cgpt-archive-button-host="true"]')) {
          delete entry.container.dataset.cgptArchiveRowContainer;
        }
      } catch (error) {
        console.error('[ChatGPT Archive Mode] Failed to clean an archive control during shutdown.', {
          conversationId: entry.id,
          error: formatError(error)
        });
      }
    }

    state.entriesByAnchor.clear();
    state.entriesById.clear();
    document.getElementById(HOST_STYLE_ID)?.remove();
    document.documentElement.classList.remove(ROOT_CLASS);

    try {
      if (state.originalSidebarWidth) {
        document.documentElement.style.setProperty('--sidebar-width', state.originalSidebarWidth);
      } else {
        document.documentElement.style.removeProperty('--sidebar-width');
      }
    } catch (error) {
      console.error('[ChatGPT Archive Mode] Failed to restore the original sidebar width.', {
        error: formatError(error),
        originalSidebarWidth: state.originalSidebarWidth
      });
    }

    state.uiHost?.remove();
    delete window[APP_KEY];
    console.info('[ChatGPT Archive Mode] Archive mode disabled and page modifications removed.');
  }

  function formatError(error) {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return sanitizeSensitiveText(error);
    if (error instanceof Error) {
      const parts = [error.name, error.message].filter(Boolean);
      return sanitizeSensitiveText(parts.join(': '));
    }
    try {
      return sanitizeSensitiveText(JSON.stringify(error));
    } catch {
      return sanitizeSensitiveText(String(error));
    }
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/[^A-Za-z0-9_-]/g, character => `\\${character}`);
  }

  function truncate(value, maximumLength) {
    const text = String(value);
    return text.length <= maximumLength ? text : `${text.slice(0, maximumLength - 1)}…`;
  }

  function delay(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }
})();
