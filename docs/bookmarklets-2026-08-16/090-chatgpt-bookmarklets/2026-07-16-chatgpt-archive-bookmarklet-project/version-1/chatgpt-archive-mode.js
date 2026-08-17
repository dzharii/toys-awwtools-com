(() => {
  'use strict';

  const APP_KEY = '__CHATGPT_ARCHIVE_MODE_V1__';
  const APP_VERSION = '1.0.0';
  const UI_HOST_ID = 'cgpt-archive-mode-v1-ui';
  const HOST_STYLE_ID = 'cgpt-archive-mode-v1-styles';
  const STORAGE_KEY = 'cgpt-archive-mode.archived-conversation-ids.v1';
  const SIDEBAR_WIDTH = 600;
  const REQUEST_TIMEOUT_MS = 30000;
  const SCAN_DELAY_MS = 120;

  const LOCATORS = Object.freeze({
    sidebar: Object.freeze({
      description: 'Expanded ChatGPT sidebar',
      selectors: Object.freeze([
        '#stage-slideover-sidebar',
        '[id="stage-slideover-sidebar"]'
      ])
    }),
    history: Object.freeze({
      description: 'Scrollable ChatGPT chat-history area',
      selectors: Object.freeze([
        '#stage-slideover-sidebar nav[aria-label="Chat history"]',
        '#stage-slideover-sidebar [aria-label="Chat history"]',
        '#history'
      ])
    }),
    conversationRows: Object.freeze({
      description: 'Conversation links in the ChatGPT sidebar',
      selectors: Object.freeze([
        '#stage-slideover-sidebar a[data-sidebar-item="true"][href^="/c/"]',
        '#stage-slideover-sidebar a.__menu-item[href^="/c/"]',
        '#stage-slideover-sidebar a[href^="/c/"]',
        '#history a[href^="/c/"]'
      ])
    }),
    conversationTitle: Object.freeze({
      description: 'Visible title inside a conversation row',
      selectors: Object.freeze([
        '.truncate span[dir="auto"]',
        '.truncate span',
        '.truncate'
      ])
    })
  });

  const existing = window[APP_KEY];
  if (existing?.destroy) {
    existing.destroy('Archive mode disabled by a second invocation.');
    return;
  }

  const state = {
    destroyed: false,
    archivedIds: loadArchivedIds(),
    entriesById: new Map(),
    processedAnchors: new WeakSet(),
    observer: null,
    scanTimer: 0,
    uiHost: null,
    logList: null,
    status: null,
    originalSidebarWidth: document.documentElement.style.getPropertyValue('--sidebar-width'),
    dragCleanup: null,
    resizeHandle: null,
    resizeCleanup: null,
    tokenPromise: null
  };

  window[APP_KEY] = {
    version: APP_VERSION,
    destroy,
    scan: () => scheduleScan('manual')
  };

  void initialize();

  async function initialize() {
    try {
      await waitForBody();
      installStyles();
      createWindow();
      log('info', 'startup', 'Starting ChatGPT Archive Mode.', {
        version: APP_VERSION,
        page: location.href
      });
      widenSidebar();
      installSidebarResizer();
      installObserver();
      scheduleScan('startup');
      log('success', 'startup', 'Archive mode initialized.', {
        rememberedArchived: state.archivedIds.size
      });
    } catch (error) {
      log('error', 'startup', 'Archive mode failed to initialize.', {
        error: formatError(error),
        page: location.href
      });
      alert(`ChatGPT Archive Mode could not start: ${formatError(error)}`);
    }
  }

  async function waitForBody() {
    if (document.body) return;
    const startedAt = Date.now();
    while (!document.body && Date.now() - startedAt < 5000) {
      await delay(100);
    }
    if (!document.body) {
      throw new Error('Document body was not available within 5000ms.');
    }
  }

  function installStyles() {
    const oldStyle = document.getElementById(HOST_STYLE_ID);
    oldStyle?.remove();
    const style = document.createElement('style');
    style.id = HOST_STYLE_ID;
    style.textContent = `
      [data-cgpt-archive-row="true"] {
        position: relative !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 92px !important;
        align-items: center !important;
        column-gap: 6px !important;
        padding-inline-end: 6px !important;
        border-radius: 7px !important;
        transition: opacity 120ms ease, background-color 120ms ease, outline-color 120ms ease !important;
      }
      [data-cgpt-archive-row="true"] > a[href^="/c/"] {
        min-width: 0 !important;
      }
      [data-cgpt-archive-state="pending"] {
        background: rgba(59, 130, 246, 0.08) !important;
        outline: 1px solid rgba(59, 130, 246, 0.35) !important;
      }
      [data-cgpt-archive-state="archived"] {
        opacity: 0.5 !important;
        background: rgba(107, 114, 128, 0.1) !important;
        outline: 1px solid rgba(107, 114, 128, 0.3) !important;
      }
      [data-cgpt-archive-state="error"] {
        background: rgba(220, 38, 38, 0.08) !important;
        outline: 1px solid rgba(220, 38, 38, 0.35) !important;
      }
      [data-cgpt-archive-action-host="true"] {
        display: block !important;
        width: 92px !important;
        min-width: 92px !important;
        position: relative !important;
        z-index: 4 !important;
      }
      #${UI_HOST_ID} {
        all: initial;
        position: fixed;
        inset: 0;
        width: 0;
        height: 0;
        z-index: 2147483646;
      }
      [data-cgpt-archive-resizer="true"] {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 8px;
        cursor: ew-resize;
        z-index: 2147483645;
        background: transparent;
      }
      [data-cgpt-archive-resizer="true"]:hover {
        background: rgba(59, 130, 246, 0.25);
      }
    `;
    (document.head || document.documentElement).append(style);
    log('info', 'install-styles', 'Host-page styles installed.', {
      styleId: HOST_STYLE_ID
    });
  }

  function createWindow() {
    document.getElementById(UI_HOST_ID)?.remove();
    const host = document.createElement('div');
    host.id = UI_HOST_ID;
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        * { box-sizing: border-box; }
        .window {
          position: fixed;
          top: 72px;
          right: 28px;
          width: 430px;
          height: 310px;
          min-width: 320px;
          min-height: 180px;
          resize: both;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #6b7280;
          border-radius: 4px;
          background: #f3f4f6;
          color: #111827;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
          font: 12px/1.35 Segoe UI, Arial, sans-serif;
        }
        .titlebar {
          height: 32px;
          flex: 0 0 32px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 8px;
          border-bottom: 1px solid #9ca3af;
          background: #e5e7eb;
          cursor: move;
          user-select: none;
        }
        .title { flex: 1; font-weight: 600; }
        .status { color: #4b5563; font-size: 11px; }
        .close {
          width: 24px;
          height: 22px;
          border: 1px solid #9ca3af;
          border-radius: 3px;
          background: #f9fafb;
          color: #111827;
          cursor: pointer;
        }
        .close:hover { background: #fee2e2; border-color: #dc2626; }
        .log {
          flex: 1;
          margin: 0;
          padding: 8px;
          overflow: auto;
          list-style: none;
          background: #ffffff;
          font: 11px/1.45 Consolas, Monaco, monospace;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .entry { padding: 4px 2px; border-bottom: 1px solid #e5e7eb; }
        .entry[data-level="success"] { color: #166534; }
        .entry[data-level="warn"] { color: #92400e; }
        .entry[data-level="error"] { color: #b91c1c; }
        .entry[data-level="debug"] { color: #4b5563; }
      </style>
      <section class="window" role="dialog" aria-label="ChatGPT Archive Mode log window">
        <header class="titlebar">
          <span class="title">ChatGPT Archive Mode</span>
          <span class="status">Starting</span>
          <button class="close" type="button" title="Disable archive mode">x</button>
        </header>
        <ol class="log" aria-live="polite"></ol>
      </section>
    `;
    document.body.append(host);
    state.uiHost = host;
    state.logList = shadow.querySelector('.log');
    state.status = shadow.querySelector('.status');
    const windowElement = shadow.querySelector('.window');
    const titlebar = shadow.querySelector('.titlebar');
    shadow.querySelector('.close').addEventListener('click', () => destroy('Archive mode disabled from the utility window.'));
    installWindowDrag(windowElement, titlebar);
  }

  function installWindowDrag(windowElement, handle) {
    const onPointerDown = event => {
      if (event.button !== 0 || event.target.closest('button')) return;
      const rect = windowElement.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      windowElement.style.right = 'auto';
      handle.setPointerCapture(event.pointerId);

      const onPointerMove = moveEvent => {
        const maxLeft = Math.max(0, window.innerWidth - windowElement.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - windowElement.offsetHeight);
        const left = Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX));
        const top = Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY));
        windowElement.style.left = `${left}px`;
        windowElement.style.top = `${top}px`;
      };

      const onPointerUp = upEvent => {
        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener('pointermove', onPointerMove);
        handle.removeEventListener('pointerup', onPointerUp);
        handle.removeEventListener('pointercancel', onPointerUp);
      };

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);
    };

    handle.addEventListener('pointerdown', onPointerDown);
    state.dragCleanup = () => handle.removeEventListener('pointerdown', onPointerDown);
  }

  function widenSidebar() {
    const sidebar = queryFirst('sidebar', document, 'resize-sidebar', false);
    document.documentElement.style.setProperty('--sidebar-width', `${SIDEBAR_WIDTH}px`);
    if (!sidebar) {
      reportMissing('sidebar', 'resize-sidebar', 'The CSS variable was set, but the sidebar element was not found.');
      return;
    }
    log('success', 'resize-sidebar', 'Sidebar width increased.', {
      width: `${SIDEBAR_WIDTH}px`,
      element: describeElement(sidebar)
    });
  }

  function installSidebarResizer() {
    state.resizeHandle?.remove();
    const handle = document.createElement('div');
    handle.dataset.cgptArchiveResizer = 'true';
    document.body.append(handle);
    state.resizeHandle = handle;

    const positionHandle = () => {
      const sidebar = queryFirst('sidebar', document, 'position-sidebar-resizer', false);
      if (!sidebar) {
        handle.style.display = 'none';
        return;
      }
      const rect = sidebar.getBoundingClientRect();
      handle.style.display = 'block';
      const leftSide = rect.left < window.innerWidth / 2;
      handle.style.left = `${leftSide ? rect.right - 4 : rect.left - 4}px`;
    };

    const onPointerDown = event => {
      if (event.button !== 0) return;
      const sidebar = queryFirst('sidebar', document, 'resize-sidebar-drag', true);
      if (!sidebar) return;
      const rect = sidebar.getBoundingClientRect();
      const leftSide = rect.left < window.innerWidth / 2;
      handle.setPointerCapture(event.pointerId);
      log('info', 'resize-sidebar-drag', 'Sidebar resize started.', {
        element: describeElement(sidebar),
        initialWidth: Math.round(rect.width)
      });

      const onPointerMove = moveEvent => {
        const rawWidth = leftSide ? moveEvent.clientX : window.innerWidth - moveEvent.clientX;
        const width = Math.min(760, Math.max(360, Math.round(rawWidth)));
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
        positionHandle();
      };

      const onPointerUp = upEvent => {
        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener('pointermove', onPointerMove);
        handle.removeEventListener('pointerup', onPointerUp);
        handle.removeEventListener('pointercancel', onPointerUp);
        log('success', 'resize-sidebar-drag', 'Sidebar resize completed.', {
          width: document.documentElement.style.getPropertyValue('--sidebar-width')
        });
      };

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);
    };

    handle.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', positionHandle);
    positionHandle();
    state.resizeCleanup = () => {
      handle.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', positionHandle);
    };
  }

  function installObserver() {
    state.observer = new MutationObserver(records => {
      const addedNodes = records.reduce((count, record) => count + record.addedNodes.length, 0);
      if (addedNodes > 0) scheduleScan(`mutation:${addedNodes}`);
    });
    state.observer.observe(document.body, { childList: true, subtree: true });
    log('info', 'observe-chat-list', 'DOM observer installed for dynamically loaded conversation rows.', {
      root: describeElement(document.body)
    });
  }

  function scheduleScan(source) {
    if (state.destroyed) return;
    clearTimeout(state.scanTimer);
    state.scanTimer = window.setTimeout(() => scan(source), SCAN_DELAY_MS);
  }

  function scan(source) {
    if (state.destroyed) return;
    const history = queryFirst('history', document, 'scan-history', false);
    if (!history) {
      reportMissing('history', 'scan-history', 'Conversation controls cannot be installed until the history area exists.');
    }

    const anchors = queryAll('conversationRows', document);
    if (anchors.length === 0) {
      reportMissing('conversationRows', 'scan-conversation-rows', 'No conversation rows were available during this scan.');
      updateStatus();
      return;
    }

    let installed = 0;
    let skipped = 0;
    for (const anchor of anchors) {
      if (state.processedAnchors.has(anchor)) {
        skipped += 1;
        continue;
      }
      if (installConversationControl(anchor)) installed += 1;
    }

    log(installed > 0 ? 'success' : 'debug', 'scan-conversation-rows', 'Conversation row scan completed.', {
      source,
      found: anchors.length,
      installed,
      alreadyProcessed: skipped
    });
    updateStatus();
  }

  function installConversationControl(anchor) {
    const operation = 'install-archive-control';
    const id = extractConversationId(anchor.href);
    if (!id) {
      log('error', operation, 'Conversation identifier could not be extracted from the row URL.', {
        element: describeElement(anchor),
        href: anchor.getAttribute('href') || '',
        expectedPattern: '/c/{conversation-id}'
      });
      state.processedAnchors.add(anchor);
      return false;
    }

    const title = getConversationTitle(anchor);
    const container = anchor.closest('li') || anchor.parentElement;
    if (!container) {
      log('error', operation, 'Conversation row container was not found.', {
        conversationId: id,
        title,
        element: describeElement(anchor),
        expectedContainer: 'closest li or parentElement'
      });
      state.processedAnchors.add(anchor);
      return false;
    }

    const existingHost = Array.from(container.children).find(child => child.dataset?.cgptArchiveActionHost === 'true');
    if (existingHost) {
      state.processedAnchors.add(anchor);
      registerEntry(id, { anchor, container, host: existingHost, button: existingHost.shadowRoot?.querySelector('button'), title });
      applyState(id);
      return true;
    }

    const host = document.createElement('span');
    host.dataset.cgptArchiveActionHost = 'true';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { all: initial; display: block; width: 92px; }
        button {
          width: 92px;
          min-width: 92px;
          height: 32px;
          padding: 0 9px;
          border: 1px solid #6b7280;
          border-radius: 4px;
          background: #f9fafb;
          color: #111827;
          font: 600 12px/1 Segoe UI, Arial, sans-serif;
          cursor: pointer;
        }
        button:hover:not(:disabled) { background: #e5e7eb; border-color: #374151; }
        button:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }
        button[data-state="pending"] { cursor: wait; background: #dbeafe; border-color: #2563eb; }
        button[data-state="archived"] { cursor: default; background: #e5e7eb; color: #4b5563; }
        button[data-state="error"] { background: #fee2e2; border-color: #dc2626; color: #991b1b; }
        button:disabled { opacity: 0.85; }
      </style>
      <button type="button">Archive</button>
    `;
    const button = shadow.querySelector('button');
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      void archiveConversation(id, title);
    });

    container.dataset.cgptArchiveRow = 'true';
    container.append(host);
    state.processedAnchors.add(anchor);
    registerEntry(id, { anchor, container, host, button, title });
    applyState(id);
    log('info', operation, 'Archive control installed.', {
      conversationId: id,
      title,
      anchor: describeElement(anchor),
      container: describeElement(container)
    });
    return true;
  }

  function registerEntry(id, entry) {
    const entries = state.entriesById.get(id) || new Set();
    entries.add(entry);
    state.entriesById.set(id, entries);
  }

  async function archiveConversation(id, title) {
    const operation = `archive:${id}`;
    const currentState = getState(id);
    if (currentState === 'pending' || currentState === 'archived') {
      log('warn', operation, 'Archive action ignored because the conversation is not actionable.', {
        conversationId: id,
        title,
        currentState
      });
      return;
    }

    setState(id, 'pending');
    log('info', operation, 'Archiving conversation.', {
      conversationId: id,
      title,
      endpoint: `/backend-api/conversation/${id}`
    });

    try {
      const token = await getAccessToken();
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let response;
      try {
        const headers = {
          accept: '*/*',
          'content-type': 'application/json'
        };
        if (token) headers.authorization = `Bearer ${token}`;
        response = await fetch(`/backend-api/conversation/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          credentials: 'include',
          headers,
          body: JSON.stringify({ is_archived: true }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      const responseText = await response.text().catch(() => '');
      if (!response.ok) {
        throw new Error(`Archive request failed with HTTP ${response.status} ${response.statusText}. Response: ${responseText.slice(0, 300) || '[empty]'}`);
      }

      state.archivedIds.add(id);
      saveArchivedIds();
      setState(id, 'archived');
      log('success', operation, 'Conversation archived.', {
        conversationId: id,
        title,
        status: response.status,
        authorizationAttached: Boolean(token)
      });
    } catch (error) {
      setState(id, 'error');
      log('error', operation, 'Conversation archive operation failed.', {
        conversationId: id,
        title,
        endpoint: `/backend-api/conversation/${id}`,
        timeoutMs: REQUEST_TIMEOUT_MS,
        error: formatError(error)
      });
    }
  }

  async function getAccessToken() {
    if (state.tokenPromise) return state.tokenPromise;
    state.tokenPromise = (async () => {
      const operation = 'load-session-token';
      try {
        log('info', operation, 'Requesting the current ChatGPT session.', {
          endpoint: '/api/auth/session'
        });
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { accept: 'application/json' }
        });
        if (!response.ok) {
          log('warn', operation, 'Session endpoint did not return a successful response. Archive requests will use cookies only.', {
            status: response.status,
            statusText: response.statusText
          });
          return null;
        }
        const session = await response.json();
        const token = typeof session?.accessToken === 'string' ? session.accessToken : null;
        log(token ? 'success' : 'warn', operation, token ? 'Session access token loaded.' : 'Session response did not contain an access token. Archive requests will use cookies only.', {
          tokenPresent: Boolean(token),
          tokenValueLogged: false
        });
        return token;
      } catch (error) {
        log('error', operation, 'Session token lookup failed. Archive requests will use cookies only.', {
          endpoint: '/api/auth/session',
          error: formatError(error)
        });
        return null;
      }
    })();
    return state.tokenPromise;
  }

  function setState(id, status) {
    if (status === 'archived') state.archivedIds.add(id);
    for (const entry of state.entriesById.get(id) || []) {
      if (!entry.container.isConnected) continue;
      entry.container.dataset.cgptArchiveState = status;
      if (!entry.button) continue;
      entry.button.dataset.state = status;
      entry.button.disabled = status === 'pending' || status === 'archived';
      entry.button.textContent = status === 'pending' ? 'Archiving' : status === 'archived' ? 'Archived' : status === 'error' ? 'Retry' : 'Archive';
      entry.button.title = status === 'archived'
        ? `Archived: ${entry.title}`
        : status === 'error'
          ? `Archive failed. Retry: ${entry.title}`
          : `Archive: ${entry.title}`;
    }
    updateStatus();
  }

  function applyState(id) {
    setState(id, getState(id));
  }

  function getState(id) {
    if (state.archivedIds.has(id)) return 'archived';
    const entries = state.entriesById.get(id) || [];
    for (const entry of entries) {
      const status = entry.container.dataset.cgptArchiveState;
      if (status) return status;
    }
    return 'ready';
  }

  function updateStatus() {
    if (!state.status) return;
    const tracked = Array.from(state.entriesById.values()).reduce((total, entries) => total + entries.size, 0);
    state.status.textContent = `${tracked} rows, ${state.archivedIds.size} archived`;
  }

  function queryFirst(locatorName, root, operation, logFailure) {
    const locator = LOCATORS[locatorName];
    if (!locator) {
      log('error', operation, 'Unknown locator was requested.', { locatorName });
      return null;
    }
    for (const selector of locator.selectors) {
      try {
        const element = root.querySelector(selector);
        if (element) return element;
      } catch (error) {
        log('error', operation, 'DOM selector evaluation failed.', {
          locatorName,
          locatorDescription: locator.description,
          selector,
          root: describeElement(root),
          error: formatError(error)
        });
      }
    }
    if (logFailure) reportMissing(locatorName, operation);
    return null;
  }

  function queryAll(locatorName, root) {
    const locator = LOCATORS[locatorName];
    if (!locator) {
      log('error', 'query-all', 'Unknown locator was requested.', { locatorName });
      return [];
    }
    const result = [];
    const seen = new Set();
    for (const selector of locator.selectors) {
      try {
        for (const element of root.querySelectorAll(selector)) {
          if (!seen.has(element)) {
            seen.add(element);
            result.push(element);
          }
        }
      } catch (error) {
        log('error', 'query-all', 'DOM selector evaluation failed.', {
          locatorName,
          locatorDescription: locator.description,
          selector,
          root: describeElement(root),
          error: formatError(error)
        });
      }
    }
    return result;
  }

  function reportMissing(locatorName, operation, consequence = '') {
    const locator = LOCATORS[locatorName];
    log('error', operation, 'Expected page element was not found.', {
      locatorName,
      locatorDescription: locator?.description || 'Unknown locator',
      selectors: locator?.selectors?.join(' || ') || '[none]',
      root: 'document',
      page: location.href,
      consequence
    });
  }

  function getConversationTitle(anchor) {
    for (const selector of LOCATORS.conversationTitle.selectors) {
      const element = anchor.querySelector(selector);
      const text = element?.textContent?.trim();
      if (text) return text;
    }
    const ariaLabel = anchor.getAttribute('aria-label')?.trim();
    return ariaLabel || `Conversation ${extractConversationId(anchor.href) || 'unknown'}`;
  }

  function extractConversationId(href) {
    try {
      const pathname = new URL(href, location.href).pathname;
      const match = pathname.match(/^\/c\/([^/?#]+)/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }

  function loadArchivedIds() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return new Set(Array.isArray(parsed) ? parsed.filter(value => typeof value === 'string' && value.length > 0) : []);
    } catch {
      return new Set();
    }
  }

  function saveArchivedIds() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.archivedIds)));
      log('debug', 'save-archived-state', 'Archived conversation state saved.', {
        storageKey: STORAGE_KEY,
        count: state.archivedIds.size
      });
    } catch (error) {
      log('error', 'save-archived-state', 'Archived conversation state could not be saved.', {
        storageKey: STORAGE_KEY,
        error: formatError(error)
      });
    }
  }

  function describeElement(element) {
    if (!element) return '[null]';
    if (element === document) return 'document';
    if (element === document.body) return 'body';
    const tag = element.tagName?.toLowerCase?.() || element.nodeName || 'node';
    const id = element.id ? `#${element.id}` : '';
    const classes = typeof element.className === 'string'
      ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 4).map(name => `.${name}`).join('')
      : '';
    const href = element.getAttribute?.('href');
    return `${tag}${id}${classes}${href ? `[href="${href}"]` : ''}`;
  }

  function log(level, operation, message, context = {}) {
    const timestamp = new Date().toISOString();
    const safeContext = sanitizeContext(context);
    const line = `[${timestamp}] [${level.toUpperCase()}] [${operation}] ${message}${Object.keys(safeContext).length ? `\n${JSON.stringify(safeContext)}` : ''}`;
    console[level === 'debug' ? 'debug' : level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[ChatGPT Archive Mode] ${line}`);
    if (!state.logList) return;
    const item = document.createElement('li');
    item.className = 'entry';
    item.dataset.level = level;
    item.textContent = line;
    state.logList.append(item);
    while (state.logList.children.length > 500) state.logList.firstElementChild?.remove();
    state.logList.scrollTop = state.logList.scrollHeight;
  }

  function sanitizeContext(context) {
    const safe = {};
    for (const [key, value] of Object.entries(context)) {
      safe[key] = /token|authorization|cookie|secret/i.test(key) && !/present|attached|logged/i.test(key)
        ? '[redacted]'
        : String(value).replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]');
    }
    return safe;
  }

  function formatError(error) {
    if (error instanceof DOMException && error.name === 'AbortError') return `Request timed out after ${REQUEST_TIMEOUT_MS}ms.`;
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return String(error);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function destroy(reason) {
    if (state.destroyed) return;
    log('info', 'shutdown', reason || 'Archive mode disabled.', {
      trackedConversations: state.entriesById.size,
      archivedConversations: state.archivedIds.size
    });
    state.destroyed = true;
    clearTimeout(state.scanTimer);
    state.observer?.disconnect();
    state.dragCleanup?.();
    state.resizeCleanup?.();
    state.resizeHandle?.remove();
    state.uiHost?.remove();
    document.getElementById(HOST_STYLE_ID)?.remove();
    for (const entries of state.entriesById.values()) {
      for (const entry of entries) {
        entry.host?.remove();
        if (entry.container?.isConnected) {
          delete entry.container.dataset.cgptArchiveRow;
          delete entry.container.dataset.cgptArchiveState;
        }
      }
    }
    if (state.originalSidebarWidth) {
      document.documentElement.style.setProperty('--sidebar-width', state.originalSidebarWidth);
    } else {
      document.documentElement.style.removeProperty('--sidebar-width');
    }
    delete window[APP_KEY];
  }
})();
