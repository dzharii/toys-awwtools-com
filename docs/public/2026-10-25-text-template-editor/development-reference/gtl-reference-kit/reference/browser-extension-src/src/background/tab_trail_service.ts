import {
    TAB_TRAIL_DIAGNOSTIC_CODE,
    TAB_TRAIL_LIMITS,
    TAB_TRAIL_MESSAGE,
    TAB_TRAIL_NODE_STATUS,
    TAB_TRAIL_SOURCE_KIND,
    TAB_TRAIL_TABLES,
    buildTabTrailDisplayUrl,
    buildTabTrailUrlKey,
    buildTabTrailViewModel,
    clampTabTrailWindowPosition,
    clampTabTrailWindowSize,
    createTabTrailId,
    normalizeTabTrailFlow,
    normalizeTabTrailNode,
    normalizeTabTrailSourceKind,
    normalizeTabTrailUiState,
    sanitizeTabTrailFaviconUrl,
    sanitizeTabTrailText
} from '../shared/tab_trail_core';
import type {
    TabTrailFlow,
    TabTrailNode,
    TabTrailUiState,
    TabTrailWindowPosition,
    TabTrailWindowSize
} from '../shared/tab_trail_core';
import { FEATURE_SURFACE_NAME_TAB_TRAIL } from '../shared/feature_surface_names';

type UnknownRecord = Record<string, unknown>;
type ChromeLike = typeof chrome | null;
type TimerHandle = ReturnType<typeof setTimeout>;

interface TabTrailLogger {
    debug(...args: unknown[]): void;
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
}

interface DexieTableLike {
    get(key: unknown): Promise<UnknownRecord | undefined>;
    put(record: UnknownRecord): Promise<unknown>;
    delete(key: unknown): Promise<unknown>;
    toArray(): Promise<UnknownRecord[]>;
    where(index: string): { equals(value: unknown): { toArray(): Promise<UnknownRecord[]> } };
}

interface DexieDatabaseLike {
    table(name: string): DexieTableLike;
}

interface TabTrailStore {
    getFlow(flowId: string): Promise<UnknownRecord | null | undefined>;
    putFlow(flow: TabTrailFlow): Promise<TabTrailFlow>;
    deleteFlow(flowId: string): Promise<unknown>;
    listFlows(): Promise<UnknownRecord[]>;
    getNode(nodeId: string): Promise<UnknownRecord | null | undefined>;
    getNodeByTabId(tabId: number | null): Promise<UnknownRecord | null | undefined>;
    putNode(node: TabTrailNode): Promise<TabTrailNode>;
    deleteNode(nodeId: string): Promise<unknown>;
    listNodesByFlow(flowId: string): Promise<UnknownRecord[]>;
    listNodes(): Promise<UnknownRecord[]>;
    getUiState(flowId: string): Promise<UnknownRecord | null | undefined>;
    putUiState(uiState: TabTrailUiState): Promise<TabTrailUiState>;
    deleteUiState(flowId: string): Promise<unknown>;
    listUiStates(): Promise<UnknownRecord[]>;
    getMeta(key: string): Promise<UnknownRecord | null | undefined>;
    putMeta(record: UnknownRecord & { key: string }): Promise<UnknownRecord & { key: string }>;
}

interface MemoryTabTrailStoreSeed {
    flows?: UnknownRecord[];
    nodes?: UnknownRecord[];
    uiStates?: UnknownRecord[];
}

interface TabTrailServiceOptions {
    store?: TabTrailStore;
    chromeApi?: ChromeLike;
    logger?: TabTrailLogger;
    now?: () => number;
    random?: () => number;
    sendTabMessage?: (tabId: number, message: UnknownRecord) => Promise<UnknownRecord | null | undefined>;
    injectOverlayScript?: (tabId: number) => Promise<UnknownRecord>;
    getTab?: (tabId: number) => Promise<chrome.tabs.Tab | null>;
    queryTabs?: (queryInfo: chrome.tabs.QueryInfo) => Promise<chrome.tabs.Tab[]>;
    focusTab?: (tabId: number, windowId?: number | null) => Promise<chrome.tabs.Tab | undefined>;
    removeTab?: (tabId: number) => Promise<UnknownRecord>;
    delay?: (ms: number) => Promise<void>;
    setTimeout?: typeof setTimeout;
    clearTimeout?: typeof clearTimeout;
    refreshDebounceMs?: number;
}

interface TabTrailDiagnostics extends UnknownRecord {
    enabled: boolean;
    storageAvailable: boolean;
    activeFlowCount: number;
    openNodeCount: number;
    closedNodeCount: number;
    retainedFlowCount: number;
    lastCleanupAtMs: number;
    lastErrorCode: string | null;
    lastOpenRequest: UnknownRecord | null;
    lastFocusRequest: UnknownRecord | null;
    timings: Record<string, number>;
    lastCleanup?: UnknownRecord;
}

function isRecord(value: unknown): value is UnknownRecord {
    return !!value && typeof value === 'object';
}

function isTabTrailNode(value: TabTrailNode | null): value is TabTrailNode {
    return value !== null;
}

function isTabTrailFlow(value: TabTrailFlow | null): value is TabTrailFlow {
    return value !== null;
}

function isTabTrailUiState(value: TabTrailUiState | null): value is TabTrailUiState {
    return value !== null;
}

/** Provides an isolated Tab Trail store for tests and service fallback paths. */
export function createMemoryTabTrailStore(initial: MemoryTabTrailStoreSeed = {}): TabTrailStore & { inspect(): MemoryTabTrailStoreSeed } {
    const flows = new Map<string, UnknownRecord>((initial.flows || []).map((record) => [String(record.flowId || ''), Object.assign({}, record)]));
    const nodes = new Map<string, UnknownRecord>((initial.nodes || []).map((record) => [String(record.nodeId || ''), Object.assign({}, record)]));
    const uiStates = new Map<string, UnknownRecord>((initial.uiStates || []).map((record) => [String(record.flowId || ''), Object.assign({}, record)]));
    const meta = new Map<string, UnknownRecord>();
    return {
        async getFlow(flowId) { return cloneRecord(flows.get(flowId)); },
        async putFlow(flow) { flows.set(flow.flowId, cloneRecord(flow)); return flow; },
        async deleteFlow(flowId) { flows.delete(flowId); },
        async listFlows() { return Array.from(flows.values()).map((record) => cloneRecord(record)); },
        async getNode(nodeId) { return cloneRecord(nodes.get(nodeId)); },
        async getNodeByTabId(tabId) {
            return Array.from(nodes.values()).find((node) => node.tabId === tabId && node.status !== TAB_TRAIL_NODE_STATUS.CLOSED) || null;
        },
        async putNode(node) { nodes.set(node.nodeId, cloneRecord(node)); return node; },
        async deleteNode(nodeId) { nodes.delete(nodeId); },
        async listNodesByFlow(flowId) {
            return Array.from(nodes.values()).filter((node) => node.flowId === flowId).map((record) => cloneRecord(record));
        },
        async listNodes() { return Array.from(nodes.values()).map((record) => cloneRecord(record)); },
        async getUiState(flowId) { return cloneRecord(uiStates.get(flowId)); },
        async putUiState(uiState) { uiStates.set(uiState.flowId, cloneRecord(uiState)); return uiState; },
        async deleteUiState(flowId) { uiStates.delete(flowId); },
        async listUiStates() { return Array.from(uiStates.values()).map((record) => cloneRecord(record)); },
        async getMeta(key) { return cloneRecord(meta.get(key)); },
        async putMeta(record) { meta.set(record.key, cloneRecord(record)); return record; },
        inspect() {
            return {
                flows: Array.from(flows.values()).map((record) => cloneRecord(record)),
                nodes: Array.from(nodes.values()).map((record) => cloneRecord(record)),
                uiStates: Array.from(uiStates.values()).map((record) => cloneRecord(record))
            };
        }
    };
}

/** Adapts the shared Dexie database tables to the Tab Trail persistence interface. */
export function createDexieTabTrailStore(getDb: () => DexieDatabaseLike | null): TabTrailStore {
    function table(name: string): DexieTableLike {
        const db = getDb();
        if (!db) {
            throw new Error('tab_trail_storage_unavailable');
        }
        return db.table(name);
    }
    return {
        async getFlow(flowId) { return table(TAB_TRAIL_TABLES.FLOWS).get(flowId); },
        async putFlow(flow) { await table(TAB_TRAIL_TABLES.FLOWS).put(flow); return flow; },
        async deleteFlow(flowId) { return table(TAB_TRAIL_TABLES.FLOWS).delete(flowId); },
        async listFlows() { return table(TAB_TRAIL_TABLES.FLOWS).toArray(); },
        async getNode(nodeId) { return table(TAB_TRAIL_TABLES.NODES).get(nodeId); },
        async getNodeByTabId(tabId) {
            const records = await table(TAB_TRAIL_TABLES.NODES).where('tabId').equals(tabId).toArray();
            return records.find((node) => node && node.status !== TAB_TRAIL_NODE_STATUS.CLOSED) || null;
        },
        async putNode(node) { await table(TAB_TRAIL_TABLES.NODES).put(node); return node; },
        async deleteNode(nodeId) { return table(TAB_TRAIL_TABLES.NODES).delete(nodeId); },
        async listNodesByFlow(flowId) {
            return table(TAB_TRAIL_TABLES.NODES).where('flowId').equals(flowId).toArray();
        },
        async listNodes() { return table(TAB_TRAIL_TABLES.NODES).toArray(); },
        async getUiState(flowId) { return table(TAB_TRAIL_TABLES.UI_STATE).get(flowId); },
        async putUiState(uiState) { await table(TAB_TRAIL_TABLES.UI_STATE).put(uiState); return uiState; },
        async deleteUiState(flowId) { return table(TAB_TRAIL_TABLES.UI_STATE).delete(flowId); },
        async listUiStates() { return table(TAB_TRAIL_TABLES.UI_STATE).toArray(); },
        async getMeta(key) { return table(TAB_TRAIL_TABLES.META).get(key); },
        async putMeta(record) { await table(TAB_TRAIL_TABLES.META).put(record); return record; }
    };
}

function cloneRecord<T extends UnknownRecord>(record: T): T;
function cloneRecord<T extends UnknownRecord>(record: T | null | undefined): T | null;
function cloneRecord<T extends UnknownRecord>(record: T | null | undefined): T | null {
    return record ? JSON.parse(JSON.stringify(record)) as T : null;
}

function resolveTabId(tab: unknown): number | null {
    if (!isRecord(tab)) {
        return null;
    }
    return Number.isInteger(tab.id) ? tab.id as number : null;
}

function resolveWindowId(tab: unknown): number | null {
    if (!isRecord(tab)) {
        return null;
    }
    return Number.isInteger(tab.windowId) ? tab.windowId as number : null;
}

function safeLogger(logger?: TabTrailLogger): TabTrailLogger {
    return logger || {
        debug: function () {},
        info: function () {},
        warn: function () {},
        error: function () {}
    };
}

function delayMs(ms: number): Promise<void> {
    return new Promise(function (resolve) {
        setTimeout(resolve, Math.max(0, Math.floor(Number(ms) || 0)));
    });
}

/** Converts Chrome tab metadata into bounded Tab Trail node fields. */
export function buildTabTrailNodeFromTab(tab: Partial<chrome.tabs.Tab>, base: UnknownRecord = {}, nowMs = Date.now()): UnknownRecord {
    // DEV NOTE [TT-PRIV-4Q9M]:
    // Titles/URLs are untrusted local UI metadata. Store bounded values and never log raw values.
    const rawUrl = sanitizeTabTrailText(tab?.url || tab?.pendingUrl || base.url || '', TAB_TRAIL_LIMITS.URL_MAX);
    const title = sanitizeTabTrailText(tab?.title || base.title || '', TAB_TRAIL_LIMITS.TITLE_MAX) || 'Untitled tab';
    return Object.assign({}, base, {
        tabId: resolveTabId(tab),
        windowId: resolveWindowId(tab),
        title,
        url: rawUrl,
        urlKey: buildTabTrailUrlKey(rawUrl),
        displayUrl: buildTabTrailDisplayUrl(rawUrl),
        favIconUrl: sanitizeTabTrailFaviconUrl(tab?.favIconUrl || base.favIconUrl || ''),
        openerTabId: Number.isInteger(tab?.openerTabId) ? tab.openerTabId : (Number.isInteger(base.openerTabId) ? base.openerTabId : null),
        openerWindowId: Number.isInteger(base.openerWindowId) ? base.openerWindowId : null,
        updatedAtMs: nowMs,
        incognito: tab?.incognito === true || base.incognito === true
    });
}

/** Creates the background orchestrator for Tab Trail storage, overlays, and tab events. */
export function createTabTrailService(options: TabTrailServiceOptions = {}) {
    const store = options.store || createMemoryTabTrailStore();
    const chromeApi = options.chromeApi || null;
    const logger = safeLogger(options.logger);
    const now = typeof options.now === 'function' ? options.now : Date.now;
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const sendTabMessage = typeof options.sendTabMessage === 'function'
        ? options.sendTabMessage
        : defaultSendTabMessage(chromeApi);
    const injectOverlayScript = typeof options.injectOverlayScript === 'function'
        ? options.injectOverlayScript
        : defaultInjectOverlayScript(chromeApi);
    const getTab = typeof options.getTab === 'function' ? options.getTab : defaultGetTab(chromeApi);
    const queryTabs = typeof options.queryTabs === 'function' ? options.queryTabs : defaultQueryTabs(chromeApi);
    const focusTab = typeof options.focusTab === 'function' ? options.focusTab : defaultFocusTab(chromeApi);
    const removeTab = typeof options.removeTab === 'function' ? options.removeTab : defaultRemoveTab(chromeApi);
    const wait = typeof options.delay === 'function' ? options.delay : delayMs;
    const setTimeoutFn = typeof options.setTimeout === 'function' ? options.setTimeout : setTimeout;
    const clearTimeoutFn = typeof options.clearTimeout === 'function' ? options.clearTimeout : clearTimeout;
    const refreshDebounceMs = Math.max(100, Math.min(250, Math.floor(Number(options.refreshDebounceMs) || 150)));
    const openFlowRefreshTimers = new Map<string, TimerHandle>();
    const warnings: Record<string, boolean> = Object.create(null);
    const diagnostics: TabTrailDiagnostics = {
        enabled: true,
        storageAvailable: true,
        activeFlowCount: 0,
        openNodeCount: 0,
        closedNodeCount: 0,
        retainedFlowCount: 0,
        lastCleanupAtMs: 0,
        lastErrorCode: null,
        lastOpenRequest: null,
        lastFocusRequest: null,
        timings: Object.create(null)
    };

    function warnOnce(code: string, details: UnknownRecord = {}) {
        diagnostics.lastErrorCode = code;
        if (warnings[code]) {
            return;
        }
        warnings[code] = true;
        logger.warn('[LP TabTrail]', code, details);
    }

    async function ensureNodeForTab(tab: chrome.tabs.Tab, optionsForNode: UnknownRecord = {}): Promise<TabTrailNode> {
        const tabId = resolveTabId(tab);
        if (!Number.isInteger(tabId)) {
            throw new Error('tab_id_missing');
        }
        if (tab.incognito === true) {
            // DEV NOTE [TT-INCOGNITO-5V8Q]:
            // First version avoids persisting incognito lineage so normal and incognito trails cannot mix.
            throw new Error('tab_trail_incognito_unavailable');
        }
        let existing = normalizeTabTrailNode(await store.getNodeByTabId(tabId));
        if (existing) {
            const updated = normalizeTabTrailNode(buildTabTrailNodeFromTab(tab, existing, now()))!;
            updated.status = TAB_TRAIL_NODE_STATUS.OPEN;
            updated.closedAtMs = null;
            await safePutNode(updated);
            await refreshFlowCounts(updated.flowId);
            return updated;
        }
        let parentNode = optionsForNode.parentNode ? normalizeTabTrailNode(optionsForNode.parentNode) : null;
        const openerTabId = Number.isInteger(tab.openerTabId) ? tab.openerTabId as number : null;
        if (!parentNode && openerTabId !== null) {
            parentNode = normalizeTabTrailNode(await store.getNodeByTabId(openerTabId));
            if (!parentNode) {
                const openerTab = await getTab(openerTabId).catch(function () { return null; });
                if (openerTab) {
                    parentNode = await ensureNodeForTab(openerTab, { sourceKind: TAB_TRAIL_SOURCE_KIND.OPENER });
                }
            }
        }
        const timestamp = now();
        const nodeId = createTabTrailId('ttn', timestamp, random);
        const sourceKind = normalizeTabTrailSourceKind(optionsForNode.sourceKind || (parentNode ? TAB_TRAIL_SOURCE_KIND.OPENER : TAB_TRAIL_SOURCE_KIND.UNKNOWN));
        let flowId = parentNode ? parentNode.flowId : createTabTrailId('ttf', timestamp, random);
        let rootNodeId = parentNode ? parentNode.rootNodeId : nodeId;
        const node = normalizeTabTrailNode(buildTabTrailNodeFromTab(tab, {
            nodeId,
            flowId,
            parentNodeId: parentNode ? parentNode.nodeId : null,
            rootNodeId,
            openerTabId,
            openerWindowId: parentNode ? parentNode.windowId : null,
            createdAtMs: timestamp,
            updatedAtMs: timestamp,
            lastActiveAtMs: timestamp,
            closedAtMs: null,
            status: TAB_TRAIL_NODE_STATUS.OPEN,
            sourceKind,
            childCount: 0,
            schemaVersion: 1
        }, timestamp))!;
        await safePutNode(node);
        if (parentNode) {
            parentNode.childCount = Math.max(0, Number(parentNode.childCount) || 0) + 1;
            parentNode.updatedAtMs = timestamp;
            await safePutNode(parentNode);
        }
        await ensureFlowForNode(node, parentNode);
        diagnostics.lastErrorCode = null;
        return node;
    }

    async function ensureFlowForNode(node: TabTrailNode, parentNode: TabTrailNode | null): Promise<void> {
        let existing = normalizeTabTrailFlow(await store.getFlow(node.flowId));
        const timestamp = now();
        if (!existing) {
            existing = normalizeTabTrailFlow({
                flowId: node.flowId,
                rootNodeId: node.rootNodeId,
                rootTabId: parentNode ? parentNode.tabId : node.tabId,
                createdAtMs: timestamp,
                updatedAtMs: timestamp,
                lastActiveAtMs: timestamp,
                status: 'active',
                pinned: false,
                title: parentNode ? parentNode.title : node.title,
                displayUrl: parentNode ? parentNode.displayUrl : node.displayUrl,
                sourceKind: node.sourceKind,
                openNodeCount: 0,
                closedNodeCount: 0,
                incognito: node.incognito === true
            })!;
        }
        existing.updatedAtMs = timestamp;
        existing.lastActiveAtMs = timestamp;
        await safePutFlow(existing);
        await refreshFlowCounts(node.flowId);
    }

    async function safePutNode(node: TabTrailNode): Promise<void> {
        try {
            await store.putNode(node);
        }
        catch (_error) {
            diagnostics.storageAvailable = false;
            warnOnce(TAB_TRAIL_DIAGNOSTIC_CODE.STORAGE_WRITE_FAILED, { operation: 'putNode' });
        }
    }

    async function safePutFlow(flow: TabTrailFlow): Promise<void> {
        try {
            await store.putFlow(flow);
        }
        catch (_error) {
            diagnostics.storageAvailable = false;
            warnOnce(TAB_TRAIL_DIAGNOSTIC_CODE.STORAGE_WRITE_FAILED, { operation: 'putFlow' });
        }
    }

    async function safePutUiState(uiState: TabTrailUiState): Promise<void> {
        try {
            await store.putUiState(uiState);
        }
        catch (_error) {
            diagnostics.storageAvailable = false;
            warnOnce(TAB_TRAIL_DIAGNOSTIC_CODE.STORAGE_WRITE_FAILED, { operation: 'putUiState' });
        }
    }

    async function refreshFlowCounts(flowId: string): Promise<void> {
        const nodes = (await store.listNodesByFlow(flowId)).map(normalizeTabTrailNode).filter(isTabTrailNode);
        const flow = normalizeTabTrailFlow(await store.getFlow(flowId));
        if (!flow) {
            return;
        }
        flow.openNodeCount = nodes.filter((node) => node.status === TAB_TRAIL_NODE_STATUS.OPEN).length;
        flow.closedNodeCount = nodes.filter((node) => node.status === TAB_TRAIL_NODE_STATUS.CLOSED).length;
        flow.updatedAtMs = now();
        await safePutFlow(flow);
    }

    async function buildViewForNode(node: TabTrailNode) {
        const startedAt = now();
        const nodes = await store.listNodesByFlow(node.flowId);
        const uiState = normalizeTabTrailUiState(await store.getUiState(node.flowId));
        const view = buildTabTrailViewModel(nodes, node.nodeId, uiState);
        diagnostics.timings.pathBuildMs = Math.max(0, now() - startedAt);
        return view;
    }

    async function renderOverlayForNode(node: TabTrailNode, view: UnknownRecord) {
        const tabId = Number.isInteger(node.tabId) ? node.tabId as number : null;
        if (tabId === null) {
            return { ok: false, code: 'tab_missing', message: 'Target tab is unavailable.' };
        }
        const startedAt = now();
        const delays = [0, 120, 300];
        let injectedOverlayScript = false;
        let lastSendErrorCode: string | null = null;
        let lastInjectErrorCode: string | null = null;
        let injectionSkipped = false;
        for (let index = 0; index < delays.length; index += 1) {
            const delay = delays[index] ?? 0;
            if (delay > 0) {
                await wait(delay);
            }
            try {
                const response = await sendTabMessage(tabId, {
                    action: TAB_TRAIL_MESSAGE.RENDER_OVERLAY,
                    view
                });
                if (!response || response.ok !== true) {
                    if (!response) {
                        const error = new Error('tab_trail_overlay_ack_missing') as Error & { code: string };
                        error.code = 'tab_trail_overlay_ack_missing';
                        throw error;
                    }
                    return {
                        ok: false,
                        code: typeof response.code === 'string' ? response.code : 'tab_trail_overlay_render_failed',
                        message: typeof response.message === 'string' ? response.message : `The ${FEATURE_SURFACE_NAME_TAB_TRAIL} overlay failed to render.`,
                        kind: 'overlay_render_failure',
                        lastSendErrorCode: typeof response.code === 'string' ? response.code : 'tab_trail_overlay_render_failed'
                    };
                }
                diagnostics.timings.overlayRenderMs = Math.max(0, now() - startedAt);
                diagnostics.timings.overlayRetryCount = index;
                return { ok: true };
            }
            catch (_error) {
                lastSendErrorCode = classifyOverlaySendError(_error);
                if (!injectedOverlayScript && isMissingOverlayReceiverCode(lastSendErrorCode)) {
                    injectedOverlayScript = true;
                    try {
                        const injection = await injectOverlayScript(tabId);
                        if (!injection || injection.ok !== true) {
                            lastInjectErrorCode = typeof injection?.code === 'string' ? injection.code : 'tab_trail_overlay_injection_failed';
                            injectionSkipped = injection?.skipped === true;
                            diagnostics.timings.overlayRenderMs = Math.max(0, now() - startedAt);
                            diagnostics.timings.overlayRetryCount = index;
                            warnOnce(lastInjectErrorCode, {
                                tabId,
                                injectionSkipped
                            });
                            return {
                                ok: false,
                                code: lastInjectErrorCode,
                                message: `The ${FEATURE_SURFACE_NAME_TAB_TRAIL} overlay could not be injected.`,
                                kind: 'overlay_injection_failure',
                                lastSendErrorCode,
                                lastInjectErrorCode,
                                injectionSkipped
                            };
                        }
                    }
                    catch (injectError) {
                        lastInjectErrorCode = classifyOverlayInjectError(injectError);
                        logger.error('[LP TabTrail]', 'overlay_injection_failed', {
                            tabId,
                            code: lastInjectErrorCode
                        });
                        diagnostics.timings.overlayRenderMs = Math.max(0, now() - startedAt);
                        diagnostics.timings.overlayRetryCount = index;
                        return {
                            ok: false,
                            code: lastInjectErrorCode,
                            message: `The ${FEATURE_SURFACE_NAME_TAB_TRAIL} overlay could not be injected.`,
                            kind: 'overlay_injection_failure',
                            lastSendErrorCode,
                            lastInjectErrorCode,
                            injectionSkipped
                        };
                    }
                }
                if (index === delays.length - 1) {
                    warnOnce(TAB_TRAIL_DIAGNOSTIC_CODE.OVERLAY_UNAVAILABLE, {
                        tabId,
                        lastSendErrorCode,
                        lastInjectErrorCode,
                        injectionSkipped
                    });
                    diagnostics.timings.overlayRenderMs = Math.max(0, now() - startedAt);
                    diagnostics.timings.overlayRetryCount = index;
                    return {
                        ok: false,
                        code: TAB_TRAIL_DIAGNOSTIC_CODE.OVERLAY_UNAVAILABLE,
                        message: `${FEATURE_SURFACE_NAME_TAB_TRAIL} overlay could not be injected or reached on this page.`,
                        kind: 'overlay_listener_missing',
                        lastSendErrorCode,
                        lastInjectErrorCode,
                        injectionSkipped
                    };
                }
            }
        }
        return {
            ok: false,
            code: TAB_TRAIL_DIAGNOSTIC_CODE.OVERLAY_UNAVAILABLE,
            message: `${FEATURE_SURFACE_NAME_TAB_TRAIL} overlay could not be injected or reached on this page.`,
            kind: 'overlay_listener_missing',
            lastSendErrorCode,
            lastInjectErrorCode,
            injectionSkipped
        };
    }

    async function resolveOpenFlowRefreshTarget(flowId: unknown) {
        const safeFlowId = sanitizeTabTrailText(flowId, 120);
        if (!safeFlowId) {
            return { ok: false, code: 'flow_id_missing' };
        }
        const uiState = normalizeTabTrailUiState(await store.getUiState(safeFlowId));
        if (!uiState || uiState.open !== true) {
            return { ok: false, code: 'flow_closed' };
        }
        const activeTabId = Number.isInteger(uiState.lastActiveTabId) ? uiState.lastActiveTabId : uiState.anchorTabId;
        const activeNode = normalizeTabTrailNode(await store.getNodeByTabId(activeTabId));
        if (!activeNode || activeNode.flowId !== safeFlowId || activeNode.status !== TAB_TRAIL_NODE_STATUS.OPEN) {
            return { ok: false, code: 'active_tab_not_in_flow' };
        }
        return { ok: true, flowId: safeFlowId, uiState, node: activeNode };
    }

    async function refreshOpenFlowOverlay(flowId: unknown, reason = 'tab_event') {
        const target = await resolveOpenFlowRefreshTarget(flowId);
        if (target.ok !== true) {
            return { ok: true, skipped: true, code: target.code, flowId: sanitizeTabTrailText(flowId, 120), reason };
        }
        const readyTarget = target as { flowId: string; node: TabTrailNode };
        const view = await buildViewForNode(readyTarget.node);
        const overlayResult = await renderOverlayForNode(readyTarget.node, view);
        return {
            ok: overlayResult.ok === true,
            code: overlayResult.ok ? null : overlayResult.code,
            flowId: readyTarget.flowId,
            reason,
            view
        };
    }

    async function scheduleOpenFlowOverlayRefresh(flowId: unknown, reason = 'tab_event') {
        const target = await resolveOpenFlowRefreshTarget(flowId);
        if (target.ok !== true) {
            return { ok: true, scheduled: false, skipped: true, code: target.code, flowId: sanitizeTabTrailText(flowId, 120), reason };
        }
        const readyTarget = target as { flowId: string };
        const existing = openFlowRefreshTimers.get(readyTarget.flowId);
        if (existing !== undefined) {
            clearTimeoutFn(existing);
        }
        const timer = setTimeoutFn(function onTabTrailRefreshTimer() {
            openFlowRefreshTimers.delete(readyTarget.flowId);
            return refreshOpenFlowOverlay(readyTarget.flowId, reason).catch(function () {
                warnOnce(TAB_TRAIL_DIAGNOSTIC_CODE.OVERLAY_UNAVAILABLE, { flowId: readyTarget.flowId, reason });
            });
        }, refreshDebounceMs);
        openFlowRefreshTimers.set(readyTarget.flowId, timer);
        return { ok: true, scheduled: true, flowId: readyTarget.flowId, reason, debounceMs: refreshDebounceMs };
    }

    async function openForTab(tab: chrome.tabs.Tab, payload: UnknownRecord = {}) {
        if (tab?.incognito === true) {
            return { ok: false, code: 'tab_trail_incognito_unavailable', message: `${FEATURE_SURFACE_NAME_TAB_TRAIL} is unavailable in incognito windows.` };
        }
        const startedAt = now();
        const node = await ensureNodeForTab(tab, { sourceKind: payload.sourceKind || TAB_TRAIL_SOURCE_KIND.UNKNOWN });
        const timestamp = now();
        const existingState = normalizeTabTrailUiState(await store.getUiState(node.flowId));
        const uiState = normalizeTabTrailUiState({
            flowId: node.flowId,
            open: true,
            anchorTabId: existingState?.anchorTabId || node.tabId,
            lastActiveTabId: node.tabId,
            windowPosition: payload.windowPosition || existingState?.windowPosition || null,
            windowSize: payload.windowSize || existingState?.windowSize || null,
            openedAtMs: existingState?.openedAtMs || timestamp,
            updatedAtMs: timestamp,
            closedAtMs: null
        })!;
        await safePutUiState(uiState);
        const view = await buildViewForNode(node);
        const overlayResult = await renderOverlayForNode(node, view);
        diagnostics.lastOpenRequest = {
            ok: overlayResult.ok === true,
            flowId: node.flowId,
            tabId: node.tabId,
            pathLength: view.pathToRoot.length,
            childCount: view.currentChildren.length,
            warningCodes: view.warnings.slice(),
            errorCode: overlayResult.ok ? null : overlayResult.code
        };
        diagnostics.timings.openMs = Math.max(0, now() - startedAt);
        return {
            ok: overlayResult.ok === true,
            code: overlayResult.ok ? null : overlayResult.code,
            message: overlayResult.ok ? '' : (overlayResult.message || `${FEATURE_SURFACE_NAME_TAB_TRAIL} overlay could not open on this page.`),
            flowId: node.flowId,
            currentNodeId: node.nodeId,
            view,
            uiState,
            errorCode: overlayResult.ok ? null : overlayResult.code,
            overlayError: overlayResult.ok ? null : {
                code: overlayResult.code,
                kind: overlayResult.kind || 'overlay_failure',
                message: overlayResult.message || '',
                lastSendErrorCode: overlayResult.lastSendErrorCode || null,
                lastInjectErrorCode: overlayResult.lastInjectErrorCode || null,
                injectionSkipped: overlayResult.injectionSkipped === true
            }
        };
    }

    async function closeForFlow(flowId: string) {
        const uiState = normalizeTabTrailUiState(await store.getUiState(flowId));
        const timestamp = now();
        const nextState = normalizeTabTrailUiState(Object.assign({}, uiState || { flowId }, {
            flowId,
            open: false,
            updatedAtMs: timestamp,
            closedAtMs: timestamp
        }))!;
        await safePutUiState(nextState);
        const existingRefresh = openFlowRefreshTimers.get(flowId);
        if (existingRefresh !== undefined) {
            clearTimeoutFn(existingRefresh);
            openFlowRefreshTimers.delete(flowId);
        }
        const nodes = (await store.listNodesByFlow(flowId)).map(normalizeTabTrailNode).filter(isTabTrailNode);
        await Promise.all(nodes.filter((node) => Number.isInteger(node.tabId)).map((node) => {
            return sendTabMessage(node.tabId as number, { action: TAB_TRAIL_MESSAGE.CLOSE_OVERLAY, flowId }).catch(function () {});
        }));
        return { ok: true, flowId };
    }

    async function focusNode(flowId: string, nodeId: string, sourceTabId: number | null) {
        const startedAt = now();
        const node = normalizeTabTrailNode(await store.getNode(nodeId));
        if (!node || node.flowId !== flowId) {
            diagnostics.lastFocusRequest = { ok: false, sourceTabId: sourceTabId || null, targetTabId: null, sameFlow: false, errorCode: 'node_not_found' };
            return { ok: false, code: 'node_not_found', message: 'Could not find that tab.' };
        }
        if (node.status !== TAB_TRAIL_NODE_STATUS.OPEN || !Number.isInteger(node.tabId)) {
            diagnostics.lastFocusRequest = { ok: false, sourceTabId: sourceTabId || null, targetTabId: node.tabId || null, sameFlow: true, errorCode: 'tab_closed' };
            return { ok: false, code: 'tab_closed', message: 'Tab is closed.' };
        }
        const targetTabId = node.tabId as number;
        try {
            await focusTab(targetTabId, node.windowId);
            const uiState = normalizeTabTrailUiState(await store.getUiState(flowId));
            if (uiState && uiState.open) {
                uiState.lastActiveTabId = targetTabId;
                uiState.updatedAtMs = now();
                await safePutUiState(uiState);
            }
            if (Number.isInteger(sourceTabId) && sourceTabId !== targetTabId) {
                sendTabMessage(sourceTabId as number, { action: TAB_TRAIL_MESSAGE.CLOSE_OVERLAY, flowId }).catch(function () {});
            }
            const view = await buildViewForNode(node);
            const overlayResult = await renderOverlayForNode(node, view);
            diagnostics.lastFocusRequest = {
                ok: true,
                sourceTabId: sourceTabId || null,
                targetTabId,
                sameFlow: true,
                errorCode: overlayResult.ok ? null : overlayResult.code
            };
            diagnostics.timings.focusMs = Math.max(0, now() - startedAt);
            return { ok: true, flowId, nodeId, view, overlayReopened: overlayResult.ok === true, errorCode: overlayResult.ok ? null : overlayResult.code };
        }
        catch (_error) {
            warnOnce(TAB_TRAIL_DIAGNOSTIC_CODE.FOCUS_FAILED, { targetTabId });
            diagnostics.lastFocusRequest = { ok: false, sourceTabId: sourceTabId || null, targetTabId, sameFlow: true, errorCode: TAB_TRAIL_DIAGNOSTIC_CODE.FOCUS_FAILED };
            return { ok: false, code: TAB_TRAIL_DIAGNOSTIC_CODE.FOCUS_FAILED, message: 'Could not focus tab.' };
        }
    }

    async function closeNode(flowId: string, nodeId: string) {
        const safeFlowId = sanitizeTabTrailText(flowId, 120);
        const safeNodeId = sanitizeTabTrailText(nodeId, 120);
        const node = normalizeTabTrailNode(await store.getNode(safeNodeId));
        if (!node || node.flowId !== safeFlowId) {
            return { ok: false, code: 'node_not_found', message: 'Could not find that tab.' };
        }
        if (node.status !== TAB_TRAIL_NODE_STATUS.OPEN || !Number.isInteger(node.tabId)) {
            return { ok: false, code: 'tab_closed', message: 'Tab is already closed.' };
        }
        const nodeTabId = node.tabId as number;
        try {
            await removeTab(nodeTabId);
            node.status = TAB_TRAIL_NODE_STATUS.CLOSED;
            node.closedAtMs = now();
            node.updatedAtMs = node.closedAtMs;
            await safePutNode(node);
            await refreshFlowCounts(node.flowId);
            const refresh = await scheduleOpenFlowOverlayRefresh(node.flowId, 'node_close');
            return { ok: true, flowId: node.flowId, nodeId: node.nodeId, tabId: nodeTabId, refresh };
        }
        catch (_error) {
            warnOnce('tab_trail_close_node_failed', { flowId: safeFlowId, nodeId: safeNodeId });
            return { ok: false, code: 'tab_trail_close_node_failed', message: 'Could not close tab.' };
        }
    }

    async function updateWindowState(flowId: string, payload: { windowPosition?: unknown; windowSize?: unknown; requestedSize?: unknown; viewport?: { width?: number; height?: number } } = {}) {
        const uiState = (normalizeTabTrailUiState(await store.getUiState(flowId)) || normalizeTabTrailUiState({ flowId, open: true }))!;
        uiState.windowPosition = clampTabTrailWindowPosition(payload.windowPosition, payload.viewport || {});
        if (payload.windowSize || payload.requestedSize) {
            uiState.windowSize = clampTabTrailWindowSize(payload.requestedSize || payload.windowSize);
        }
        uiState.updatedAtMs = now();
        await safePutUiState(uiState);
        return { ok: true, uiState };
    }

    async function handleTabCreated(tab: chrome.tabs.Tab) {
        if (!Number.isInteger(tab?.id)) {
            return { ok: false, code: 'tab_id_missing' };
        }
        if (tab.incognito === true) {
            return { ok: true, skipped: true, code: 'tab_trail_incognito_unavailable' };
        }
        const node = await ensureNodeForTab(tab, { sourceKind: Number.isInteger(tab.openerTabId) ? TAB_TRAIL_SOURCE_KIND.OPENER : TAB_TRAIL_SOURCE_KIND.UNKNOWN });
        const refresh = await scheduleOpenFlowOverlayRefresh(node.flowId, 'tab_created');
        return { ok: true, node, refresh };
    }

    async function handleTabUpdated(tabId: number, changeInfo: Partial<chrome.tabs.Tab> = {}, tab: Partial<chrome.tabs.Tab> = {}) {
        const existing = normalizeTabTrailNode(await store.getNodeByTabId(tabId));
        if (!existing) {
            return { ok: true, skipped: true };
        }
        const mergedTab = Object.assign({}, tab, {
            id: tabId,
            title: typeof changeInfo.title === 'string' ? changeInfo.title : tab.title,
            url: typeof changeInfo.url === 'string' ? changeInfo.url : (tab.url || tab.pendingUrl),
            favIconUrl: typeof changeInfo.favIconUrl === 'string' ? changeInfo.favIconUrl : tab.favIconUrl
        });
        const updated = normalizeTabTrailNode(buildTabTrailNodeFromTab(mergedTab, existing, now()))!;
        updated.status = TAB_TRAIL_NODE_STATUS.OPEN;
        await safePutNode(updated);
        await refreshFlowCounts(updated.flowId);
        const meaningfulUpdate = ['title', 'url', 'favIconUrl', 'status'].some(function (key) {
            return Object.prototype.hasOwnProperty.call(changeInfo || {}, key);
        });
        const refresh = meaningfulUpdate ? await scheduleOpenFlowOverlayRefresh(updated.flowId, 'tab_updated') : { ok: true, scheduled: false, skipped: true, code: 'tab_update_not_meaningful' };
        return { ok: true, node: updated, refresh };
    }

    async function handleTabActivated(activeInfo: { tabId?: number }) {
        const tabId = activeInfo && Number.isInteger(activeInfo.tabId) ? activeInfo.tabId as number : null;
        if (!Number.isInteger(tabId)) {
            return { ok: false, code: 'tab_id_missing' };
        }
        const node = normalizeTabTrailNode(await store.getNodeByTabId(tabId));
        if (!node) {
            return { ok: true, skipped: true };
        }
        node.lastActiveAtMs = now();
        node.status = TAB_TRAIL_NODE_STATUS.OPEN;
        await safePutNode(node);
        const uiState = normalizeTabTrailUiState(await store.getUiState(node.flowId));
        if (uiState && uiState.open === true) {
            uiState.lastActiveTabId = tabId;
            uiState.updatedAtMs = now();
            await safePutUiState(uiState);
            const view = await buildViewForNode(node);
            await renderOverlayForNode(node, view);
        }
        return { ok: true, node };
    }

    async function handleTabRemoved(tabId: number) {
        const node = normalizeTabTrailNode(await store.getNodeByTabId(tabId));
        if (!node) {
            return { ok: true, skipped: true };
        }
        node.status = TAB_TRAIL_NODE_STATUS.CLOSED;
        node.closedAtMs = now();
        node.updatedAtMs = node.closedAtMs;
        await safePutNode(node);
        await refreshFlowCounts(node.flowId);
        const refresh = await scheduleOpenFlowOverlayRefresh(node.flowId, 'tab_removed');
        return { ok: true, node, refresh };
    }

    async function recordExtensionOpen(parentTab: chrome.tabs.Tab, childTab: chrome.tabs.Tab) {
        if (parentTab?.incognito === true || childTab?.incognito === true) {
            return { ok: true, skipped: true, code: 'tab_trail_incognito_unavailable' };
        }
        const parent = await ensureNodeForTab(parentTab, { sourceKind: TAB_TRAIL_SOURCE_KIND.UNKNOWN });
        const existingChild = normalizeTabTrailNode(await store.getNodeByTabId(resolveTabId(childTab)));
        if (existingChild && existingChild.nodeId !== parent.nodeId) {
            const hadParent = Boolean(existingChild.parentNodeId);
            existingChild.parentNodeId = parent.nodeId;
            existingChild.flowId = parent.flowId;
            existingChild.rootNodeId = parent.rootNodeId || parent.nodeId;
            existingChild.openerTabId = parent.tabId;
            existingChild.openerWindowId = parent.windowId;
            existingChild.sourceKind = TAB_TRAIL_SOURCE_KIND.EXTENSION_OPEN_URL;
            existingChild.updatedAtMs = now();
            await safePutNode(existingChild);
            if (!hadParent) {
                parent.childCount = Math.max(0, Number(parent.childCount) || 0) + 1;
                parent.updatedAtMs = now();
                await safePutNode(parent);
            }
            await ensureFlowForNode(existingChild, parent);
            await refreshFlowCounts(existingChild.flowId);
            const refresh = await scheduleOpenFlowOverlayRefresh(existingChild.flowId, 'extension_open');
            return { ok: true, parentNodeId: parent.nodeId, childNodeId: existingChild.nodeId, flowId: existingChild.flowId, refresh };
        }
        const child = await ensureNodeForTab(childTab, {
            parentNode: parent,
            sourceKind: TAB_TRAIL_SOURCE_KIND.EXTENSION_OPEN_URL
        });
        const refresh = await scheduleOpenFlowOverlayRefresh(child.flowId, 'extension_open');
        return { ok: true, parentNodeId: parent.nodeId, childNodeId: child.nodeId, flowId: child.flowId, refresh };
    }

    async function reconcileCurrentTabs(tabs?: chrome.tabs.Tab[]) {
        const currentTabs = Array.isArray(tabs) ? tabs : await queryTabs({});
        const openIds = new Set(currentTabs.map((tab) => resolveTabId(tab)).filter(Number.isInteger));
        const nodes = (await store.listNodes()).map(normalizeTabTrailNode).filter(isTabTrailNode);
        let closedCount = 0;
        for (const node of nodes) {
            if (node.status === TAB_TRAIL_NODE_STATUS.OPEN && Number.isInteger(node.tabId) && !openIds.has(node.tabId as number)) {
                node.status = TAB_TRAIL_NODE_STATUS.UNKNOWN;
                node.updatedAtMs = now();
                await safePutNode(node);
                closedCount += 1;
            }
        }
        return { ok: true, reconciledTabs: openIds.size, unknownNodes: closedCount };
    }

    async function cleanup() {
        const startedAt = now();
        const meta = await store.getMeta('tabTrailCleanup').catch(function () { return null; });
        const lastCleanupAtMs = Number(meta?.lastCleanupAtMs);
        if (meta && Number.isFinite(lastCleanupAtMs) && startedAt - lastCleanupAtMs < TAB_TRAIL_LIMITS.CLEANUP_INTERVAL_MS) {
            return { ok: true, skipped: true };
        }
        const flows = (await store.listFlows()).map(normalizeTabTrailFlow).filter(isTabTrailFlow);
        const nodes = (await store.listNodes()).map(normalizeTabTrailNode).filter(isTabTrailNode);
        const nowMs = now();
        const flowById = new Map(flows.map((flow) => [flow.flowId, flow]));
        let deletedFlows = 0;
        let deletedNodes = 0;
        let deletedUiStates = 0;
        let orphanRepairs = 0;
        const nodesByFlow = new Map();
        for (const node of nodes) {
            if (!nodesByFlow.has(node.flowId)) {
                nodesByFlow.set(node.flowId, []);
            }
            nodesByFlow.get(node.flowId).push(node);
        }
        for (const node of nodes) {
            const flow = flowById.get(node.flowId);
            const closedAge = Number.isFinite(node.closedAtMs) ? nowMs - Number(node.closedAtMs) : 0;
            if (!flow && node.status !== TAB_TRAIL_NODE_STATUS.OPEN) {
                await store.deleteNode(node.nodeId);
                deletedNodes += 1;
                continue;
            }
            if (!flow && node.status === TAB_TRAIL_NODE_STATUS.OPEN) {
                const repairedFlow = normalizeTabTrailFlow({
                    flowId: node.flowId,
                    rootNodeId: node.nodeId,
                    rootTabId: node.tabId,
                    createdAtMs: node.createdAtMs,
                    updatedAtMs: nowMs,
                    lastActiveAtMs: node.lastActiveAtMs,
                    status: 'active',
                    title: node.title,
                    displayUrl: node.displayUrl,
                    sourceKind: node.sourceKind,
                    openNodeCount: 1,
                    closedNodeCount: 0,
                    incognito: node.incognito === true
                })!;
                await safePutFlow(repairedFlow);
                flowById.set(repairedFlow.flowId, repairedFlow);
                orphanRepairs += 1;
                continue;
            }
            const flowNodes = nodesByFlow.get(node.flowId) || [];
            const isClosedSingleRoot = flowNodes.length === 1 && node.parentNodeId === null && node.status === TAB_TRAIL_NODE_STATUS.CLOSED;
            if (isClosedSingleRoot && closedAge > TAB_TRAIL_LIMITS.SINGLE_NODE_ROOT_RETENTION_HOURS * 60 * 60 * 1000) {
                await store.deleteNode(node.nodeId);
                deletedNodes += 1;
                continue;
            }
            if (node.status === TAB_TRAIL_NODE_STATUS.CLOSED && closedAge > TAB_TRAIL_LIMITS.CLOSED_FLOW_RETENTION_DAYS * 24 * 60 * 60 * 1000) {
                await store.deleteNode(node.nodeId);
                deletedNodes += 1;
            }
        }
        const remainingNodes = (await store.listNodes()).map(normalizeTabTrailNode).filter(isTabTrailNode);
        const remainingFlowIds = new Set(remainingNodes.map((node) => node.flowId));
        for (const flow of flows) {
            const flowNodes = remainingNodes.filter((node) => node.flowId === flow.flowId);
            const hasOpenNode = flowNodes.some((node) => node.status === TAB_TRAIL_NODE_STATUS.OPEN);
            const newestClosedAt = Math.max(0, ...flowNodes.map((node) => Number.isFinite(node.closedAtMs) ? Number(node.closedAtMs) : 0));
            const canDeleteClosedFlow = !hasOpenNode && newestClosedAt > 0 && nowMs - newestClosedAt > TAB_TRAIL_LIMITS.CLOSED_FLOW_RETENTION_DAYS * 24 * 60 * 60 * 1000;
            if (!remainingFlowIds.has(flow.flowId) || canDeleteClosedFlow) {
                await store.deleteFlow(flow.flowId);
                deletedFlows += 1;
                remainingFlowIds.delete(flow.flowId);
            }
        }
        const uiStates = (await store.listUiStates()).map(normalizeTabTrailUiState).filter(isTabTrailUiState);
        for (const uiState of uiStates) {
            if (!remainingFlowIds.has(uiState.flowId)) {
                await store.deleteUiState(uiState.flowId);
                deletedUiStates += 1;
            }
        }
        await store.putMeta({ key: 'tabTrailCleanup', lastCleanupAtMs: nowMs, updatedAtMs: nowMs, schemaVersion: 1 });
        diagnostics.lastCleanupAtMs = nowMs;
        diagnostics.timings.cleanupMs = Math.max(0, now() - startedAt);
        diagnostics.lastCleanup = { deletedFlows, deletedNodes, deletedUiStates, orphanRepairs };
        return { ok: true, deletedFlows, deletedNodes, deletedUiStates, orphanRepairs };
    }

    async function getDiagnostics() {
        const flows = (await store.listFlows()).map(normalizeTabTrailFlow).filter(isTabTrailFlow);
        const nodes = (await store.listNodes()).map(normalizeTabTrailNode).filter(isTabTrailNode);
        diagnostics.activeFlowCount = flows.filter((flow) => flow.status === 'active').length;
        diagnostics.retainedFlowCount = flows.length;
        diagnostics.openNodeCount = nodes.filter((node) => node.status === TAB_TRAIL_NODE_STATUS.OPEN).length;
        diagnostics.closedNodeCount = nodes.filter((node) => node.status === TAB_TRAIL_NODE_STATUS.CLOSED).length;
        return cloneRecord(diagnostics);
    }

    async function handleMessage(request: UnknownRecord, sender: chrome.runtime.MessageSender = {}) {
        const payload = request && typeof request.payload === 'object' ? request.payload as UnknownRecord : request || {};
        const senderTab = sender.tab || null;
        const senderTabId = resolveTabId(senderTab);
        switch (request.type || request.action) {
            case TAB_TRAIL_MESSAGE.OPEN_FOR_CURRENT_TAB: {
                let tab = senderTab;
                if (!tab && Number.isInteger(payload.tabId)) {
                    tab = await getTab(payload.tabId as number);
                }
                if (!tab) {
                    const tabs = await queryTabs({ active: true, currentWindow: true });
                    tab = Array.isArray(tabs) ? tabs[0] || null : null;
                }
                if (!tab) {
                    return { ok: false, code: 'tab_unavailable', message: `${FEATURE_SURFACE_NAME_TAB_TRAIL} is unavailable on this page.` };
                }
                return openForTab(tab, payload);
            }
            case TAB_TRAIL_MESSAGE.GET_VIEW: {
                const nodeId = sanitizeTabTrailText(payload.nodeId, 120);
                const requestedTabId = Number.isInteger(payload.tabId) ? payload.tabId as number : senderTabId;
                const node = nodeId ? normalizeTabTrailNode(await store.getNode(nodeId)) : normalizeTabTrailNode(await store.getNodeByTabId(requestedTabId));
                if (!node) {
                    return { ok: false, code: 'node_not_found' };
                }
                return { ok: true, view: await buildViewForNode(node) };
            }
            case TAB_TRAIL_MESSAGE.FOCUS_NODE:
                return focusNode(sanitizeTabTrailText(payload.flowId, 120), sanitizeTabTrailText(payload.nodeId, 120), senderTabId);
            case TAB_TRAIL_MESSAGE.CLOSE_NODE:
                return closeNode(sanitizeTabTrailText(payload.flowId, 120), sanitizeTabTrailText(payload.nodeId, 120));
            case TAB_TRAIL_MESSAGE.CLOSE_FOR_FLOW:
                return closeForFlow(sanitizeTabTrailText(payload.flowId, 120));
            case TAB_TRAIL_MESSAGE.UPDATE_WINDOW_STATE:
                return updateWindowState(sanitizeTabTrailText(payload.flowId, 120), payload);
            case TAB_TRAIL_MESSAGE.GET_DIAGNOSTICS:
                return { ok: true, tabTrail: await getDiagnostics() };
            default:
                return { ok: false, code: 'unsupported_tab_trail_message' };
        }
    }

    return {
        ensureNodeForTab,
        openForTab,
        closeForFlow,
        focusNode,
        closeNode,
        updateWindowState,
        handleTabCreated,
        handleTabUpdated,
        handleTabActivated,
        handleTabRemoved,
        recordExtensionOpen,
        reconcileCurrentTabs,
        cleanup,
        getDiagnostics,
        handleMessage,
        buildViewForNode,
        refreshOpenFlowOverlay,
        scheduleOpenFlowOverlayRefresh
    };
}

function defaultSendTabMessage(chromeApi: ChromeLike): (tabId: number, message: UnknownRecord) => Promise<UnknownRecord | null | undefined> {
    return function send(tabId: number, message: UnknownRecord): Promise<UnknownRecord | null | undefined> {
        return new Promise(function (resolve, reject) {
            if (!chromeApi?.tabs?.sendMessage) {
                reject(new Error('tabs_send_message_unavailable'));
                return;
            }
            chromeApi.tabs.sendMessage(tabId, message, function (response: unknown) {
                if (chromeApi.runtime?.lastError) {
                    reject(new Error(chromeApi.runtime.lastError.message || 'tabs_send_message_failed'));
                    return;
                }
                resolve(isRecord(response) ? response : null);
            });
        });
    };
}

function classifyOverlaySendError(error: unknown): string {
    const code = isRecord(error) && typeof error.code === 'string' ? error.code : '';
    const message = error instanceof Error ? error.message : String(error || '');
    if (code === 'tab_trail_overlay_ack_missing' || message === 'tab_trail_overlay_ack_missing') {
        return 'tab_trail_overlay_ack_missing';
    }
    if (/receiving end does not exist/i.test(message) || /could not establish connection/i.test(message)) {
        return 'tab_trail_overlay_listener_missing';
    }
    return 'tabs_send_message_failed';
}

function isMissingOverlayReceiverCode(code: string | null): boolean {
    return code === 'tab_trail_overlay_listener_missing' || code === 'tab_trail_overlay_ack_missing';
}

function classifyOverlayInjectError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error || '');
    if (/cannot access contents/i.test(message) || /scripting_unavailable/i.test(message)) {
        return 'tab_trail_overlay_injection_unavailable';
    }
    return 'tab_trail_overlay_injection_failed';
}

function defaultInjectOverlayScript(chromeApi: ChromeLike): (tabId: number) => Promise<UnknownRecord> {
    return function inject(tabId: number): Promise<UnknownRecord> {
        return new Promise(function (resolve, reject) {
            if (!Number.isInteger(tabId)) {
                resolve({ ok: false, skipped: true, code: 'tab_id_invalid' });
                return;
            }
            if (!chromeApi?.scripting?.executeScript) {
                resolve({ ok: false, skipped: true, code: 'scripting_unavailable' });
                return;
            }
            const manifest = typeof chromeApi.runtime?.getManifest === 'function'
                ? chromeApi.runtime.getManifest()
                : {} as chrome.runtime.Manifest;
            const background = manifest?.background;
            const serviceWorkerPath = background && 'service_worker' in background ? background.service_worker : '';
            const prefix = serviceWorkerPath.startsWith('dist/') ? 'dist/' : '';
            chromeApi.scripting.executeScript({
                target: { tabId },
                files: [prefix + 'content/tab_trail_overlay.js']
            }, function () {
                if (chromeApi.runtime?.lastError) {
                    reject(new Error(chromeApi.runtime.lastError.message || 'scripting_execute_failed'));
                    return;
                }
                resolve({ ok: true });
            });
        });
    };
}

function defaultGetTab(chromeApi: ChromeLike): (tabId: number) => Promise<chrome.tabs.Tab | null> {
    return function get(tabId: number): Promise<chrome.tabs.Tab | null> {
        return new Promise(function (resolve, reject) {
            if (!chromeApi?.tabs?.get) {
                reject(new Error('tabs_get_unavailable'));
                return;
            }
            chromeApi.tabs.get(tabId, function (tab: chrome.tabs.Tab) {
                if (chromeApi.runtime?.lastError) {
                    reject(new Error(chromeApi.runtime.lastError.message || 'tabs_get_failed'));
                    return;
                }
                resolve(tab || null);
            });
        });
    };
}

function defaultQueryTabs(chromeApi: ChromeLike): (queryInfo: chrome.tabs.QueryInfo) => Promise<chrome.tabs.Tab[]> {
    return function query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
        return new Promise(function (resolve, reject) {
            if (!chromeApi?.tabs?.query) {
                reject(new Error('tabs_query_unavailable'));
                return;
            }
            chromeApi.tabs.query(queryInfo || {}, function (tabs: chrome.tabs.Tab[]) {
                if (chromeApi.runtime?.lastError) {
                    reject(new Error(chromeApi.runtime.lastError.message || 'tabs_query_failed'));
                    return;
                }
                resolve(tabs || []);
            });
        });
    };
}

function defaultFocusTab(chromeApi: ChromeLike): (tabId: number, windowId?: number | null) => Promise<chrome.tabs.Tab | undefined> {
    return function focus(tabId: number, windowId?: number | null): Promise<chrome.tabs.Tab | undefined> {
        return new Promise(function (resolve, reject) {
            if (!chromeApi?.tabs?.update) {
                reject(new Error('tabs_update_unavailable'));
                return;
            }
            chromeApi.tabs.update(tabId, { active: true }, function (tab?: chrome.tabs.Tab) {
                if (chromeApi.runtime?.lastError) {
                    reject(new Error(chromeApi.runtime.lastError.message || 'tabs_update_failed'));
                    return;
                }
                if (Number.isInteger(windowId) && chromeApi.windows?.update) {
                    chromeApi.windows.update(windowId as number, { focused: true }, function () {
                        resolve(tab);
                    });
                    return;
                }
                resolve(tab);
            });
        });
    };
}

function defaultRemoveTab(chromeApi: ChromeLike): (tabId: number) => Promise<UnknownRecord> {
    return function remove(tabId: number): Promise<UnknownRecord> {
        return new Promise(function (resolve, reject) {
            if (!chromeApi?.tabs?.remove) {
                reject(new Error('tabs_remove_unavailable'));
                return;
            }
            chromeApi.tabs.remove(tabId, function () {
                if (chromeApi.runtime?.lastError) {
                    reject(new Error(chromeApi.runtime.lastError.message || 'tabs_remove_failed'));
                    return;
                }
                resolve({ ok: true });
            });
        });
    };
}
