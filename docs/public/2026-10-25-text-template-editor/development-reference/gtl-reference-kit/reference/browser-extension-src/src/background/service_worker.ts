// Service Worker for Link Preview Extension
// Handles declarativeNetRequest rules to bypass X-Frame-Options and CSP headers
// Handles bookmark database storage and synchronization across tabs
// Import shared settings runtime and Dexie for IndexedDB operations
import {
    captureActivePageScreenshot,
    extractActivePageDescription
} from './page_screenshot_runtime';
import { FEATURE_SURFACE_NAME_TAB_TRAIL } from '../shared/feature_surface_names';
import {
    captureSelection as captureSessionSnapshotSelection,
    closeTabs as closeSessionSnapshotTabs,
    listCurrentWindowTabs as listSessionSnapshotCurrentWindowTabs
} from './session_snapshot_runtime';
import {
    cancelWebContentSelectV2Session,
    handleWebContentSelectV2Extraction,
    handleWebContentSelectV2FrameOwnerIdentified,
    handleWebContentSelectV2OverlayEvent,
    openWebContentSelectV2Session
} from './page_content_select_v2_runtime';
import { normalizeHttpOpenUrl } from './url_opening';
import {
    createDexieTabTrailStore,
    createTabTrailService
} from './tab_trail_service';
import {
    TAB_TRAIL_MESSAGE,
    TAB_TRAIL_SOURCE_KIND,
    TAB_TRAIL_TABLES
} from '../shared/tab_trail_core';
import {
    deriveHostnameFromUrl,
    normalizeCanonicalUrl,
    normalizeHttpUrl
} from '../content/atools/_shared/url_picker_canonical.js';
import {
    EMBEDDED_NAVIGATION_RULE_ID_MIN,
    EMBEDDED_NAVIGATION_RULE_TTL_MS,
    buildEmbeddedNavigationHeaderBypassRule,
    buildEmbeddedNavigationRuleKey,
    isEmbeddedNavigationRuleId,
    nextEmbeddedNavigationRuleId,
    normalizeEmbeddedNavigationTarget
} from './embedded_navigation_rules';
import {
    MINIBUFFER_EDITOR_CAPABILITY_REGISTER,
    MINIBUFFER_EDITOR_CAPABILITY_REVOKE,
    minibufferEditorCapabilityStorageKey
} from '../content/atools/_shared/minibuffer_editor_protocol';

type UnknownRecord = Record<string, unknown>;
type BookmarksDb = InstanceType<typeof Dexie>;
type BookmarkScope = 'activity' | 'manual';
type BookmarkEntryKind = 'automatic' | 'manual';
type BookmarkChangeType = 'created' | 'updated' | 'deleted';
type TabTrailMessageType = (typeof TAB_TRAIL_MESSAGE)[keyof typeof TAB_TRAIL_MESSAGE];

interface BookmarkRecord extends UnknownRecord {
    id?: string;
    url?: string;
    normalizedUrl?: string;
    canonicalUrl?: string;
    hostname?: string;
    title?: string;
    snippet?: string;
    userComment?: string;
    createdReason?: string;
    createdAt?: number;
    firstVisitedAt?: number;
    lastVisitedAt?: number;
    lastInteractionAt?: number;
    visitCount?: number;
    hasManualBookmark?: boolean;
    hasActivity?: boolean;
    lastPickerSelectedAt?: number;
    pickerSelectionCount?: number;
    faviconDataUrl?: string;
    faviconUpdatedAt?: number;
    updatedAtEpochMs?: number;
}

interface BuildBookmarkPayloadInput {
    id: string;
    url: string;
    title?: unknown;
    snippet?: unknown;
    userComment?: unknown;
    reason?: unknown;
    visitCountOverride?: unknown;
    lastInteractionAtOverride?: unknown;
    firstVisitedAtOverride?: unknown;
}

interface BookmarkEntryPayloadInput {
    id?: string;
    title: unknown;
    url: string;
    urlKind?: unknown;
    userNote?: unknown;
    capturedSnippet?: unknown;
    systemLabels?: unknown;
    userLabelIds?: unknown;
    visitCount?: unknown;
    createdAt?: unknown;
    lastInteractionAt?: unknown;
    firstVisitedAt?: unknown;
    lastVisitedAt?: unknown;
}

interface BookmarkEntryRecord extends UnknownRecord {
    id: string;
    title: string;
    url: string;
    urlKind: string;
    normalizedUrl: string;
    canonicalUrl: string;
    hostname: string;
    userNote: string;
    capturedSnippet: string;
    systemLabels: string[];
    userLabelIds: string[];
    visitCount: number;
    createdAt: number;
    updatedAt: number;
    lastInteractionAt: number;
    firstVisitedAt: number;
    lastVisitedAt: number;
}

interface BookmarkLabelPayloadInput {
    name?: unknown;
    icon?: unknown;
    tone?: unknown;
    sortOrder?: unknown;
}

interface BookmarkLabelRecord extends UnknownRecord {
    id: string;
    name: string;
    icon: string;
    tone: string;
    sortOrder: number;
    createdAt: number;
    updatedAt: number;
    archivedAt: number | null;
}

interface UrlPickerSignalRecord extends BookmarkRecord {
    normalizedUrl: string;
    canonicalUrl: string;
    url: string;
    hostname: string;
    title: string;
    lastPickerSelectedAt: number;
    pickerSelectionCount: number;
    faviconDataUrl: string;
    faviconUpdatedAt: number;
    updatedAtEpochMs: number;
}

interface UrlPickerSignalUpdates extends UnknownRecord {
    markSelected?: boolean;
    faviconDataUrl?: unknown;
    hostname?: unknown;
    title?: unknown;
}

interface ActivitySnapshotInput {
    url: unknown;
    title: unknown;
    snippet?: unknown;
    visitCount?: unknown;
    lastInteractionAt?: unknown;
    firstVisitedAt?: unknown;
}

interface EmbeddedNavigationOptions {
    context?: unknown;
    surfaceId?: unknown;
    requestId?: unknown;
}

interface EmbeddedNavigationRuleEntry {
    ruleId: number;
    hostname: string;
    tabId: number | null;
    refCount: number;
    tokens: Set<string>;
    contexts: Set<string>;
    createdAtEpochMs: number;
    lastUsedAtEpochMs: number;
    lastPreparedUrlOrigin: string;
    isTabScoped: boolean;
}
importScripts('../settings/settings_runtime.js');
importScripts('../content/libs/dexie-4.2.0.js');
lpLog.initFromSettings();
lpLog.info('[LP] Build version:', __LP_BUILD_VERSION);
let embeddedNavigationRuleIdCounter = EMBEDDED_NAVIGATION_RULE_ID_MIN;
const embeddedNavigationRules = new Map<string, EmbeddedNavigationRuleEntry>();
const embeddedNavigationTokens = new Map<string, string>();
const EMBEDDED_NAVIGATION_TTL_ALARM_NAME = 'LP_EMBEDDED_NAVIGATION_TTL';
let lastAppliedSettingsSignature = '';
let repeatedSettingsSignature = '';
let repeatedSettingsCount = 0;
let repeatedSettingsAt = 0;
const SETTINGS_LOOP_WINDOW_MS = 2000;
const SETTINGS_LOOP_MAX_REPEATS = 5;
let settingsReady = lpSettings.loadSettingsDocument().then(async (doc) => {
    await reconcileEmbeddedNavigationSessionRules();
    await applyServiceWorkerSettingsDocument(doc, 'startup');
    return doc;
}).catch((error) => {
    lpLog.error('[LP] Failed to load settings on startup:', error);
    return lpSettings.getDefaultDocument();
});

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && typeof error.message === 'string') {
        return error.message;
    }
    return typeof error === 'string' ? error : 'unknown_error';
}

/** Redacts URLs to safe components before writing service-worker logs. */
function getSafeUrlLogDetails(rawUrl: unknown): UnknownRecord {
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
        return { urlType: 'missing' };
    }
    try {
        const parsed = new URL(rawUrl);
        return {
            urlType: parsed.protocol.replace(':', '') || 'unknown',
            protocol: parsed.protocol,
            hostname: parsed.hostname || '',
            origin: parsed.origin === 'null' ? '' : parsed.origin,
            hasPath: parsed.pathname && parsed.pathname !== '/',
            hasQuery: parsed.search.length > 0,
            hasHash: parsed.hash.length > 0
        };
    }
    catch (_error) {
        return { urlType: 'invalid' };
    }
}

function getSenderLogDetails(sender: chrome.runtime.MessageSender): UnknownRecord {
    const tab = sender.tab;
    return {
        senderTabId: Number.isInteger(tab?.id) ? tab?.id : null,
        senderFrameId: Number.isInteger(sender.frameId) ? sender.frameId : null
    };
}

function logOperationAttempt(tag: string, message: string, details: UnknownRecord = {}): void {
    lpLog.info(`${tag} Attempting to ${message}`, details);
}

function logOperationSuccess(tag: string, message: string, details: UnknownRecord = {}): void {
    lpLog.info(`${tag} ${message}`, details);
}

function logOperationWarn(tag: string, message: string, details: UnknownRecord = {}): void {
    lpLog.warn(`${tag} ${message}`, details);
}

function logOperationFailure(tag: string, message: string, error: unknown, details: UnknownRecord = {}): void {
    lpLog.error(`${tag} ${message}`, {
        ...details,
        reason: getErrorMessage(error)
    });
}
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[lpSettings.SETTINGS_STORAGE_KEY]) {
        return;
    }
    settingsReady = lpSettings.loadSettingsDocument(true).then(async (doc) => {
        await applyServiceWorkerSettingsDocument(doc, 'storage');
        return doc;
    }).catch((error) => {
        lpLog.error('[LP] Failed to refresh settings after change:', error);
        return lpSettings.getDefaultDocument();
    });
});
// ============ Bookmark Database ============
const MANUAL_TABLE = 'BookmarksManual';
const ACTIVITY_TABLE = 'BookmarksActivity';
const URL_SIGNALS_TABLE = 'UrlPickerSignals';
const MINIBUFFER_COMMAND_USAGE_TABLE = 'MinibufferCommandUsage';
const MINIBUFFER_COMMAND_USAGE_DAILY_TABLE = 'MinibufferCommandUsageDaily';
const MINIBUFFER_COMMAND_USAGE_META_TABLE = 'MinibufferCommandUsageMeta';
// V2 bookmark tables (new unified model)
const BOOKMARK_ENTRIES_TABLE = 'BookmarkEntries';
const BOOKMARK_LABELS_TABLE = 'BookmarkLabels';
const BOOKMARK_ENTRIES_LIMIT = 500;
// System label constants (stable identifiers, not display strings)
const SYSTEM_LABEL_MANUAL = 'system:manual';
const SYSTEM_LABEL_AUTOMATIC = 'system:automatic';
const MANUAL_LIMIT = 100;
const ACTIVITY_LIMIT = 250;
const URL_PICKER_FAVICON_MAX_LENGTH = 4096;
let bookmarksDb: BookmarksDb | null = null;
let pickerRecordCompactionPromise: Promise<void> | null = null;
const tabTrailStore = createDexieTabTrailStore(function getTabTrailDb() {
    return bookmarksDb;
});
const tabTrailService = createTabTrailService({
    chromeApi: chrome,
    store: tabTrailStore,
    logger: lpLog
});
/** Opens the extension database and registers every schema version used by background features. */
async function initBookmarksDb() {
    try {
        if (bookmarksDb && typeof bookmarksDb.isOpen === 'function' && bookmarksDb.isOpen()) {
            return true;
        }
        logOperationAttempt('[bookmark]', 'open local bookmarks database');
        bookmarksDb = new Dexie('lpBookmarksDb');
        bookmarksDb.version(6).stores({
            [MANUAL_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            [ACTIVITY_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            Reminders: 'id, status, dueAtEpochMs, remindAtEpochMs, remindBeforeMinutes, updatedAtEpochMs, deliveryState',
            [URL_SIGNALS_TABLE]: '&normalizedUrl, lastPickerSelectedAt, pickerSelectionCount, updatedAtEpochMs, faviconUpdatedAt',
            // DEV NOTE: Minibuffer usage tables store command ids, stable stats keys, counters, and timestamps only.
            // They must not store minibuffer input, command parameters, selected text, URLs, clipboard content, or output.
            [MINIBUFFER_COMMAND_USAGE_TABLE]: '&statsKey, commandId, canonicalName, lastUsedAtMs, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_DAILY_TABLE]: '&dayKey, statsKey, day, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_META_TABLE]: '&key, updatedAtMs'
        });
        bookmarksDb.version(7).stores({
            [MANUAL_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            [ACTIVITY_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            Reminders: 'id, status, dueAtEpochMs, remindAtEpochMs, remindBeforeMinutes, updatedAtEpochMs, deliveryState',
            [URL_SIGNALS_TABLE]: '&normalizedUrl, lastPickerSelectedAt, pickerSelectionCount, updatedAtEpochMs, faviconUpdatedAt',
            [MINIBUFFER_COMMAND_USAGE_TABLE]: '&statsKey, commandId, canonicalName, lastUsedAtMs, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_DAILY_TABLE]: '&dayKey, statsKey, day, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_META_TABLE]: '&key, updatedAtMs',
            // DEV NOTE [TT-SCHEMA-7A1M]: Chrome tabId is session-only and only supports current focusing/event correlation.
            // Tab Trail persists nodeId/flowId so closed nodes and same-URL tabs remain distinct local records.
            // Stored title/URL are bounded local UI metadata; diagnostics never log raw title or full URL.
            [TAB_TRAIL_TABLES.FLOWS]: '&flowId, rootNodeId, rootTabId, status, lastActiveAtMs, updatedAtMs',
            [TAB_TRAIL_TABLES.NODES]: '&nodeId, flowId, tabId, windowId, parentNodeId, rootNodeId, status, lastActiveAtMs, closedAtMs, [flowId+parentNodeId], [flowId+status]',
            [TAB_TRAIL_TABLES.UI_STATE]: '&flowId, open, lastActiveTabId, updatedAtMs',
            [TAB_TRAIL_TABLES.META]: '&key, updatedAtMs'
        });
        // DEV NOTE [BM-SCHEMA-8]: V2 unified bookmark model.
        // BookmarkEntries replaces BookmarksManual + BookmarksActivity split.
        // Old tables remain intact; old data is not auto-migrated.
        // BookmarkLabels stores user-defined labels with stable IDs.
        // userNote = user-authored text. capturedSnippet = system-captured page text.
        // systemLabels = ['system:manual'|'system:automatic'].
        // userLabelIds = string[] of BookmarkLabels IDs.
        // urlKind = 'http' | 'https' — records the stored URL scheme.
        bookmarksDb.version(8).stores({
            [MANUAL_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            [ACTIVITY_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            Reminders: 'id, status, dueAtEpochMs, remindAtEpochMs, remindBeforeMinutes, updatedAtEpochMs, deliveryState',
            [URL_SIGNALS_TABLE]: '&normalizedUrl, lastPickerSelectedAt, pickerSelectionCount, updatedAtEpochMs, faviconUpdatedAt',
            [MINIBUFFER_COMMAND_USAGE_TABLE]: '&statsKey, commandId, canonicalName, lastUsedAtMs, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_DAILY_TABLE]: '&dayKey, statsKey, day, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_META_TABLE]: '&key, updatedAtMs',
            [TAB_TRAIL_TABLES.FLOWS]: '&flowId, rootNodeId, rootTabId, status, lastActiveAtMs, updatedAtMs',
            [TAB_TRAIL_TABLES.NODES]: '&nodeId, flowId, tabId, windowId, parentNodeId, rootNodeId, status, lastActiveAtMs, closedAtMs, [flowId+parentNodeId], [flowId+status]',
            [TAB_TRAIL_TABLES.UI_STATE]: '&flowId, open, lastActiveTabId, updatedAtMs',
            [TAB_TRAIL_TABLES.META]: '&key, updatedAtMs',
            [BOOKMARK_ENTRIES_TABLE]: 'id, urlKind, normalizedUrl, lastInteractionAt, *systemLabels, *userLabelIds',
            [BOOKMARK_LABELS_TABLE]: '&id, name, createdAt, archivedAt'
        });
        // DEV NOTE [BM-SCHEMA-9]: The removed reminder feature no longer has
        // an active store. This current schema drops the historical Reminders
        // table while preserving the remaining local data stores.
        bookmarksDb.version(9).stores({
            [MANUAL_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            [ACTIVITY_TABLE]: 'id, &url, lastInteractionAt, createdReason, hasManualBookmark, hasActivity',
            [URL_SIGNALS_TABLE]: '&normalizedUrl, lastPickerSelectedAt, pickerSelectionCount, updatedAtEpochMs, faviconUpdatedAt',
            [MINIBUFFER_COMMAND_USAGE_TABLE]: '&statsKey, commandId, canonicalName, lastUsedAtMs, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_DAILY_TABLE]: '&dayKey, statsKey, day, updatedAtMs',
            [MINIBUFFER_COMMAND_USAGE_META_TABLE]: '&key, updatedAtMs',
            [TAB_TRAIL_TABLES.FLOWS]: '&flowId, rootNodeId, rootTabId, status, lastActiveAtMs, updatedAtMs',
            [TAB_TRAIL_TABLES.NODES]: '&nodeId, flowId, tabId, windowId, parentNodeId, rootNodeId, status, lastActiveAtMs, closedAtMs, [flowId+parentNodeId], [flowId+status]',
            [TAB_TRAIL_TABLES.UI_STATE]: '&flowId, open, lastActiveTabId, updatedAtMs',
            [TAB_TRAIL_TABLES.META]: '&key, updatedAtMs',
            [BOOKMARK_ENTRIES_TABLE]: 'id, urlKind, normalizedUrl, lastInteractionAt, *systemLabels, *userLabelIds',
            [BOOKMARK_LABELS_TABLE]: '&id, name, createdAt, archivedAt'
        });
        await bookmarksDb.open();
        await ensurePickerRecordsCompacted();
        logOperationSuccess('[bookmark]', 'Opened local bookmarks database', {
            databaseName: 'lpBookmarksDb'
        });
        return true;
    }
    catch (error) {
        logOperationFailure('[bookmark]', 'Failed to open local bookmarks database', error, {
            databaseName: 'lpBookmarksDb'
        });
        return false;
    }
}
// Generate UUID for bookmark IDs
function generateBookmarkId(type: BookmarkScope): string {
    const prefix = type === 'activity' ? 'bm_activity_' : 'bm_manual_';
    return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
function getTableByScope(scope: unknown): DexieTable<BookmarkRecord> | null {
    if (!bookmarksDb) {
        return null;
    }
    if (scope === 'activity')
        return bookmarksDb.table<BookmarkRecord>(ACTIVITY_TABLE);
    if (scope === 'manual')
        return bookmarksDb.table<BookmarkRecord>(MANUAL_TABLE);
    return null;
}
function getScopeFromId(id: unknown): BookmarkScope | null {
    if (typeof id !== 'string')
        return null;
    if (id.startsWith('bm_activity_'))
        return 'activity';
    if (id.startsWith('bm_manual_'))
        return 'manual';
    return null;
}
function decorateBookmark(bookmark: BookmarkRecord | null | undefined, scope?: BookmarkScope | null): (BookmarkRecord & { bookmarkType: BookmarkScope }) | null {
    if (!bookmark)
        return null;
    const resolvedScope = scope || (bookmark.createdReason === 'activity' ? 'activity' : 'manual');
    return {
        ...bookmark,
        createdReason: resolvedScope === 'activity' ? 'activity' : 'manual',
        hasManualBookmark: resolvedScope !== 'activity',
        hasActivity: resolvedScope === 'activity',
        bookmarkType: resolvedScope === 'activity' ? 'activity' : 'manual'
    };
}
function normalizeStoredHttpUrl(rawUrl: unknown): string {
    return normalizeHttpUrl(rawUrl);
}
function normalizeStoredCanonicalUrl(rawUrl: unknown): string {
    return normalizeCanonicalUrl(rawUrl);
}
function deriveHostname(rawUrl: unknown): string {
    return deriveHostnameFromUrl(rawUrl);
}
function toSafeEpoch(rawValue: unknown): number {
    const numeric = Number(rawValue);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}
function getFiniteNumber(rawValue: unknown, fallback: number): number {
    return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : fallback;
}
function getStringProperty(value: unknown, key: string): string {
    if (!value || typeof value !== 'object') {
        return '';
    }
    const candidate = (value as UnknownRecord)[key];
    return typeof candidate === 'string' ? candidate : '';
}
function sanitizeCompactText(rawValue: unknown, maxLength = 500): string {
    const text = typeof rawValue === 'string' ? rawValue.replace(/\s+/g, ' ').trim() : '';
    return text ? text.slice(0, maxLength) : '';
}
async function findBookmarkRecordByNormalizedUrl(tableName: string, normalizedUrl: string): Promise<BookmarkRecord | null> {
    if (!bookmarksDb || !normalizedUrl) {
        return null;
    }
    const table = bookmarksDb.table(tableName);
    const records = await table.toArray() as BookmarkRecord[];
    return records.find((record) => {
        const candidateUrl = normalizeStoredHttpUrl(record?.normalizedUrl || record?.url);
        return candidateUrl === normalizedUrl;
    }) || null;
}
async function findBookmarkRecordByUrl(tableName: string, rawUrl: unknown): Promise<BookmarkRecord | null> {
    const normalizedUrl = normalizeStoredHttpUrl(rawUrl);
    const canonicalUrl = normalizeStoredCanonicalUrl(rawUrl);
    if (!bookmarksDb || !normalizedUrl) {
        return null;
    }
    const table = bookmarksDb.table(tableName);
    const records = await table.toArray() as BookmarkRecord[];
    const exactMatch = records.find((record) => getBookmarkExactUrl(record) === normalizedUrl);
    if (exactMatch) {
        return exactMatch;
    }
    if (!canonicalUrl) {
        return null;
    }
    return records.find((record) => getBookmarkCanonicalUrl(record) === canonicalUrl) || null;
}
async function findUrlPickerSignalByUrl(rawUrl: unknown): Promise<BookmarkRecord | null> {
    const normalizedUrl = normalizeStoredHttpUrl(rawUrl);
    const canonicalUrl = normalizeStoredCanonicalUrl(rawUrl);
    const table = getUrlSignalsTable();
    if (!table || !normalizedUrl) {
        return null;
    }
    const records = await table.toArray() as BookmarkRecord[];
    const exactMatch = records.find((record) => normalizeStoredHttpUrl(record?.normalizedUrl || record?.url) === normalizedUrl);
    if (exactMatch) {
        return exactMatch;
    }
    if (!canonicalUrl) {
        return null;
    }
    return records.find((record) => normalizeStoredCanonicalUrl(record?.canonicalUrl || record?.normalizedUrl || record?.url) === canonicalUrl) || null;
}
function getUrlSignalsTable(): DexieTable<UrlPickerSignalRecord> | null {
    if (!bookmarksDb) {
        return null;
    }
    return bookmarksDb.table<UrlPickerSignalRecord>(URL_SIGNALS_TABLE);
}
function sanitizeFaviconDataUrl(rawValue: unknown): string {
    const value = typeof rawValue === 'string' ? rawValue.trim() : '';
    if (!value.startsWith('data:image/')) {
        return '';
    }
    if (value.length > URL_PICKER_FAVICON_MAX_LENGTH) {
        return '';
    }
    return value;
}
function getBookmarkCanonicalUrl(record: BookmarkRecord | null | undefined): string {
    return normalizeStoredCanonicalUrl(record?.canonicalUrl || record?.normalizedUrl || record?.url);
}
function getBookmarkExactUrl(record: BookmarkRecord | null | undefined): string {
    return normalizeStoredHttpUrl(record?.normalizedUrl || record?.url);
}
function getBookmarkFreshness(record: BookmarkRecord | null | undefined): number {
    return Math.max(
        toSafeEpoch(record?.lastInteractionAt),
        toSafeEpoch(record?.lastVisitedAt),
        toSafeEpoch(record?.firstVisitedAt),
        toSafeEpoch(record?.createdAt)
    );
}
function getSignalFreshness(record: BookmarkRecord | null | undefined): number {
    return Math.max(
        toSafeEpoch(record?.lastPickerSelectedAt),
        toSafeEpoch(record?.faviconUpdatedAt),
        toSafeEpoch(record?.updatedAtEpochMs)
    );
}
function comparePreferredUrlRecord(left: BookmarkRecord, right: BookmarkRecord, freshnessFn: (record: BookmarkRecord) => number): number {
    const leftFreshness = freshnessFn(left);
    const rightFreshness = freshnessFn(right);
    if (rightFreshness !== leftFreshness) {
        return rightFreshness - leftFreshness;
    }
    const leftUrl = getBookmarkExactUrl(left);
    const rightUrl = getBookmarkExactUrl(right);
    if (leftUrl.length !== rightUrl.length) {
        return leftUrl.length - rightUrl.length;
    }
    return leftUrl.localeCompare(rightUrl);
}
function pickPreferredBookmarkText(records: BookmarkRecord[], fieldName: keyof BookmarkRecord, maxLength: number): string {
    const sorted = [...records].sort((left, right) => comparePreferredUrlRecord(left, right, getBookmarkFreshness));
    for (const record of sorted) {
        const text = sanitizeCompactText(record?.[fieldName], maxLength);
        if (text) {
            return text;
        }
    }
    return '';
}
function pickPreferredSignalText(records: BookmarkRecord[], fieldName: keyof BookmarkRecord, maxLength: number): string {
    const sorted = [...records].sort((left, right) => comparePreferredUrlRecord(left, right, getSignalFreshness));
    for (const record of sorted) {
        const text = sanitizeCompactText(record?.[fieldName], maxLength);
        if (text) {
            return text;
        }
    }
    return '';
}
function groupRecordsByCanonical(records: BookmarkRecord[], canonicalAccessor: (record: BookmarkRecord) => string): Map<string, BookmarkRecord[]> {
    const groups = new Map<string, BookmarkRecord[]>();
    for (const record of records) {
        const canonicalUrl = canonicalAccessor(record);
        if (!canonicalUrl) {
            continue;
        }
        const group = groups.get(canonicalUrl);
        if (group) {
            group.push(record);
        }
        else {
            groups.set(canonicalUrl, [record]);
        }
    }
    return groups;
}
function mergeBookmarkGroup(records: BookmarkRecord[], scope: BookmarkScope): BookmarkRecord {
    const sorted = [...records].sort((left, right) => comparePreferredUrlRecord(left, right, getBookmarkFreshness));
    const primary = sorted[0];
    const normalizedUrl = getBookmarkExactUrl(primary);
    const canonicalUrl = getBookmarkCanonicalUrl(primary) || normalizeStoredCanonicalUrl(normalizedUrl) || normalizedUrl;
    let firstVisitedAt = 0;
    for (const record of records) {
        const candidate = toSafeEpoch(record?.firstVisitedAt || record?.createdAt);
        if (candidate > 0) {
            firstVisitedAt = firstVisitedAt > 0 ? Math.min(firstVisitedAt, candidate) : candidate;
        }
    }
    return {
        ...primary,
        url: normalizedUrl,
        normalizedUrl,
        canonicalUrl,
        hostname: pickPreferredBookmarkText(records, 'hostname', 120) || deriveHostname(normalizedUrl),
        title: pickPreferredBookmarkText(records, 'title', 240) || deriveHostname(normalizedUrl) || normalizedUrl,
        snippet: pickPreferredBookmarkText(records, 'snippet', 1000),
        userComment: pickPreferredBookmarkText(records, 'userComment', 1000),
        createdReason: scope,
        createdAt: firstVisitedAt || toSafeEpoch(primary?.createdAt) || Date.now(),
        lastInteractionAt: Math.max(...records.map((record) => toSafeEpoch(record?.lastInteractionAt))),
        lastVisitedAt: Math.max(...records.map((record) => toSafeEpoch(record?.lastVisitedAt || record?.lastInteractionAt))),
        firstVisitedAt: firstVisitedAt || toSafeEpoch(primary?.createdAt) || Date.now(),
        visitCount: Math.max(1, records.reduce((sum, record) => sum + Math.max(0, Math.trunc(Number(record?.visitCount) || 0)), 0)),
        hasManualBookmark: scope !== 'activity',
        hasActivity: scope === 'activity'
    };
}
function mergeSignalGroup(records: BookmarkRecord[]): UrlPickerSignalRecord {
    const sorted = [...records].sort((left, right) => comparePreferredUrlRecord(left, right, getSignalFreshness));
    const primary = sorted[0];
    const normalizedUrl = getBookmarkExactUrl(primary);
    const canonicalUrl = normalizeStoredCanonicalUrl(primary?.canonicalUrl || normalizedUrl) || normalizedUrl;
    let faviconDataUrl = '';
    let faviconUpdatedAt = 0;
    for (const record of sorted) {
        const nextFavicon = sanitizeFaviconDataUrl(record?.faviconDataUrl);
        const nextFreshness = toSafeEpoch(record?.faviconUpdatedAt || record?.updatedAtEpochMs || record?.lastPickerSelectedAt);
        if (nextFavicon && (!faviconDataUrl || nextFreshness >= faviconUpdatedAt)) {
            faviconDataUrl = nextFavicon;
            faviconUpdatedAt = nextFreshness;
        }
    }
    return {
        ...primary,
        normalizedUrl,
        canonicalUrl,
        url: normalizedUrl,
        hostname: pickPreferredSignalText(records, 'hostname', 120) || deriveHostname(normalizedUrl),
        title: pickPreferredSignalText(records, 'title', 240),
        lastPickerSelectedAt: Math.max(...records.map((record) => toSafeEpoch(record?.lastPickerSelectedAt))),
        pickerSelectionCount: records.reduce((sum, record) => sum + Math.max(0, Math.trunc(Number(record?.pickerSelectionCount) || 0)), 0),
        faviconDataUrl,
        faviconUpdatedAt,
        updatedAtEpochMs: Math.max(...records.map((record) => toSafeEpoch(record?.updatedAtEpochMs)))
    };
}
async function compactBookmarkTable(tableName: string, scope: BookmarkScope): Promise<void> {
    if (!bookmarksDb) {
        return;
    }
    const table = bookmarksDb.table(tableName);
    const records = await table.toArray() as BookmarkRecord[];
    const groups = groupRecordsByCanonical(records, getBookmarkCanonicalUrl);
    for (const [canonicalUrl, group] of groups.entries()) {
        const merged = mergeBookmarkGroup(group, scope);
        const firstGroupRecord = group[0];
        const staleIds = group
            .map((record) => record.id)
            .filter((id): id is string => typeof id === 'string' && id !== merged.id);
        if (group.length === 1 &&
            firstGroupRecord &&
            merged.canonicalUrl === canonicalUrl &&
            merged.normalizedUrl === getBookmarkExactUrl(firstGroupRecord) &&
            sanitizeCompactText(firstGroupRecord.hostname, 120) === merged.hostname) {
            if (firstGroupRecord.canonicalUrl !== merged.canonicalUrl || firstGroupRecord.normalizedUrl !== merged.normalizedUrl) {
                await table.put(merged);
            }
            continue;
        }
        await table.put(merged);
        if (staleIds.length > 0) {
            await table.bulkDelete(staleIds);
        }
    }
}
async function compactUrlPickerSignalsTable(): Promise<void> {
    const table = getUrlSignalsTable();
    if (!table) {
        return;
    }
    const records = await table.toArray() as BookmarkRecord[];
    const groups = groupRecordsByCanonical(records, (record) => normalizeStoredCanonicalUrl(record?.canonicalUrl || record?.normalizedUrl || record?.url));
    for (const [canonicalUrl, group] of groups.entries()) {
        const merged = mergeSignalGroup(group);
        const firstGroupRecord = group[0];
        const staleIds = group
            .map((record) => normalizeStoredHttpUrl(record?.normalizedUrl || record?.url))
            .filter((id): id is string => !!id && id !== merged.normalizedUrl);
        if (group.length === 1 &&
            firstGroupRecord &&
            merged.canonicalUrl === canonicalUrl &&
            merged.normalizedUrl === normalizeStoredHttpUrl(firstGroupRecord.normalizedUrl || firstGroupRecord.url)) {
            if (firstGroupRecord.canonicalUrl !== merged.canonicalUrl) {
                await table.put(merged);
            }
            continue;
        }
        await table.put(merged);
        if (staleIds.length > 0) {
            await table.bulkDelete(staleIds);
        }
    }
}
async function compactManualActivityCollisions(): Promise<void> {
    if (!bookmarksDb) {
        return;
    }
    const manualTable = bookmarksDb.table(MANUAL_TABLE);
    const activityTable = bookmarksDb.table(ACTIVITY_TABLE);
    const manualRecords = await manualTable.toArray() as BookmarkRecord[];
    const activityRecords = await activityTable.toArray() as BookmarkRecord[];
    const activityGroups = groupRecordsByCanonical(activityRecords, getBookmarkCanonicalUrl);
    for (const manualRecord of manualRecords) {
        const canonicalUrl = getBookmarkCanonicalUrl(manualRecord);
        if (!canonicalUrl || !activityGroups.has(canonicalUrl)) {
            continue;
        }
        const activityGroup = activityGroups.get(canonicalUrl) || [];
        const merged = mergeBookmarkGroup([manualRecord, ...activityGroup], 'manual');
        merged.id = manualRecord.id;
        await manualTable.put(merged);
        await activityTable.bulkDelete(activityGroup.map((record) => record.id).filter((id): id is string => typeof id === 'string'));
    }
}
async function compactPickerRelatedRecords(): Promise<void> {
    if (!bookmarksDb) {
        return;
    }
    await compactBookmarkTable(MANUAL_TABLE, 'manual');
    await compactBookmarkTable(ACTIVITY_TABLE, 'activity');
    await compactUrlPickerSignalsTable();
    await compactManualActivityCollisions();
}
async function ensurePickerRecordsCompacted(): Promise<void> {
    if (pickerRecordCompactionPromise) {
        return pickerRecordCompactionPromise;
    }
    logOperationAttempt('[url-picker]', 'compact picker-related local records');
    pickerRecordCompactionPromise = compactPickerRelatedRecords().catch((error) => {
        pickerRecordCompactionPromise = null;
        logOperationFailure('[url-picker]', 'Failed to compact picker-related local records', error);
    }).then((result) => {
        if (pickerRecordCompactionPromise) {
            logOperationSuccess('[url-picker]', 'Compacted picker-related local records');
        }
        return result;
    });
    return pickerRecordCompactionPromise;
}
async function enforceTableLimit(tableName: string, maxCount: number): Promise<void> {
    if (!bookmarksDb) {
        return;
    }
    const table = bookmarksDb.table(tableName);
    const total = await table.count();
    if (total <= maxCount)
        return;
    const overflow = total - maxCount;
    const oldest = await table.orderBy('lastInteractionAt').limit(overflow).toArray() as BookmarkRecord[];
    const idsToDelete = oldest.map((b) => b.id).filter((id): id is string => typeof id === 'string');
    if (idsToDelete.length) {
        await table.bulkDelete(idsToDelete);
        lpLog.debug(`[LP Bookmarks] Trimmed ${tableName}, removed ${idsToDelete.length} oldest entries`);
    }
}
/** Builds the legacy bookmark record while preserving manual and activity scope semantics. */
function buildBookmarkPayload({ id, url, title, snippet, userComment, reason, visitCountOverride, lastInteractionAtOverride, firstVisitedAtOverride }: BuildBookmarkPayloadInput): BookmarkRecord {
    const now = Date.now();
    const scope = reason === 'activity' ? 'activity' : 'manual';
    const normalizedUrl = normalizeStoredHttpUrl(url);
    const resolvedVisitCount = getFiniteNumber(visitCountOverride, 1);
    const resolvedLastInteraction = getFiniteNumber(lastInteractionAtOverride, now);
    const resolvedFirstVisited = getFiniteNumber(firstVisitedAtOverride, resolvedLastInteraction);
    return {
        id,
        url: normalizedUrl || url,
        normalizedUrl: normalizedUrl || '',
        canonicalUrl: normalizeStoredCanonicalUrl(normalizedUrl || url),
        hostname: deriveHostname(normalizedUrl || url),
        title: sanitizeCompactText(title, 240),
        createdReason: scope,
        createdAt: now,
        lastInteractionAt: resolvedLastInteraction,
        lastVisitedAt: resolvedLastInteraction,
        firstVisitedAt: resolvedFirstVisited,
        snippet: sanitizeCompactText(snippet, 1000),
        userComment: sanitizeCompactText(userComment, 1000),
        visitCount: resolvedVisitCount,
        hasManualBookmark: scope !== 'activity',
        hasActivity: scope === 'activity'
    };
}
/** Creates or merges a legacy bookmark and notifies open tabs about the resulting record. */
async function createBookmark(url: string, title: unknown, snippet: unknown, reason: BookmarkScope = 'manual', userComment: unknown = ''): Promise<BookmarkRecord | null> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        const requestedScope = reason === 'activity' ? 'activity' : 'manual';
        logOperationAttempt('[bookmark]', 'create bookmark record', {
            scope: requestedScope,
            ...getSafeUrlLogDetails(url)
        });
        const normalizedUrl = normalizeStoredHttpUrl(url);
        if (!normalizedUrl) {
            logOperationWarn('[bookmark]', 'Rejected bookmark creation because URL is invalid', {
                scope: requestedScope,
                ...getSafeUrlLogDetails(url)
            });
            throw new Error('Invalid bookmark URL.');
        }
        const scope = reason === 'activity' ? 'activity' : 'manual';
        const table = getTableByScope(scope);
        if (!table || !bookmarksDb) {
            throw new Error('Bookmarks table unavailable.');
        }
        let mergedVisitCount = 1;
        let mergedLastInteraction = Date.now();
        let mergedFirstVisitedAt = mergedLastInteraction;
        const existingSameScope = await findBookmarkRecordByUrl(scope === 'manual' ? MANUAL_TABLE : ACTIVITY_TABLE, normalizedUrl);
        if (scope === 'manual') {
            const existingActivity = await findBookmarkRecordByUrl(ACTIVITY_TABLE, normalizedUrl);
            if (existingActivity) {
                mergedVisitCount += existingActivity.visitCount || 0;
                mergedLastInteraction = Math.max(mergedLastInteraction, existingActivity.lastInteractionAt || 0);
                mergedFirstVisitedAt = Math.min(mergedFirstVisitedAt, toSafeEpoch(existingActivity.firstVisitedAt || existingActivity.createdAt || mergedLastInteraction));
                await bookmarksDb.table<BookmarkRecord>(ACTIVITY_TABLE).delete(existingActivity.id);
                notifyBookmarkChange('deleted', { id: existingActivity.id });
            }
        }
        if (existingSameScope) {
            mergedVisitCount += existingSameScope.visitCount || 0;
            mergedLastInteraction = Math.max(mergedLastInteraction, existingSameScope.lastInteractionAt || 0);
            mergedFirstVisitedAt = Math.min(mergedFirstVisitedAt, toSafeEpoch(existingSameScope.firstVisitedAt || existingSameScope.createdAt || mergedLastInteraction));
            const updatedBookmark = buildBookmarkPayload({
                id: existingSameScope.id || generateBookmarkId(scope),
                url: normalizedUrl,
                title: sanitizeCompactText(title, 240) || existingSameScope.title || normalizedUrl,
                snippet: sanitizeCompactText(snippet, 1000) || existingSameScope.snippet || '',
                userComment: sanitizeCompactText(userComment, 1000) || existingSameScope.userComment || '',
                reason,
                visitCountOverride: mergedVisitCount,
                lastInteractionAtOverride: mergedLastInteraction,
                firstVisitedAtOverride: mergedFirstVisitedAt
            });
            await table.put(updatedBookmark);
            notifyBookmarkChange('updated', decorateBookmark(updatedBookmark, scope));
            if (scope === 'manual') bridgeCreateManualEntry(normalizedUrl, title, snippet).catch(() => {});
            logOperationSuccess('[bookmark]', 'Updated existing bookmark during create request', {
                id: updatedBookmark.id,
                scope,
                hostname: updatedBookmark.hostname || ''
            });
            return decorateBookmark(updatedBookmark, scope);
        }
        const bookmark = buildBookmarkPayload({
            id: generateBookmarkId(scope),
            url: normalizedUrl,
            title,
            snippet,
            userComment,
            reason,
            visitCountOverride: mergedVisitCount,
            lastInteractionAtOverride: mergedLastInteraction,
            firstVisitedAtOverride: mergedFirstVisitedAt
        });
        await table.add(bookmark);
        if (scope === 'manual') {
            await enforceTableLimit(MANUAL_TABLE, MANUAL_LIMIT);
        }
        else {
            await enforceTableLimit(ACTIVITY_TABLE, ACTIVITY_LIMIT);
        }
        // Notify all tabs about the new bookmark
        notifyBookmarkChange('created', decorateBookmark(bookmark, scope));
        if (scope === 'manual') bridgeCreateManualEntry(normalizedUrl, title, snippet).catch(() => {});
        logOperationSuccess('[bookmark]', 'Created bookmark record', {
            id: bookmark.id,
            scope,
            hostname: bookmark.hostname || ''
        });
        return decorateBookmark(bookmark, scope);
    }
    catch (error) {
        logOperationFailure('[bookmark]', 'Failed to create bookmark record', error, {
            scope: reason === 'activity' ? 'activity' : 'manual',
            ...getSafeUrlLogDetails(url)
        });
        throw error;
    }
}
/** Looks up manual bookmarks before activity records so explicit saves win. */
async function getBookmarkByUrl(url: string): Promise<(BookmarkRecord & { bookmarkType: BookmarkScope }) | null> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        logOperationAttempt('[bookmark]', 'look up bookmark by URL', getSafeUrlLogDetails(url));
        const normalizedUrl = normalizeStoredHttpUrl(url);
        if (!normalizedUrl) {
            logOperationWarn('[bookmark]', 'Skipped bookmark lookup because URL is invalid', getSafeUrlLogDetails(url));
            return null;
        }
        const manual = await findBookmarkRecordByUrl(MANUAL_TABLE, normalizedUrl);
        if (manual) {
            logOperationSuccess('[bookmark]', 'Completed bookmark lookup', {
                found: true,
                scope: 'manual',
                hostname: manual.hostname || ''
            });
            return decorateBookmark(manual, 'manual');
        }
        const activity = await findBookmarkRecordByUrl(ACTIVITY_TABLE, normalizedUrl);
        if (activity) {
            logOperationSuccess('[bookmark]', 'Completed bookmark lookup', {
                found: true,
                scope: 'activity',
                hostname: activity.hostname || ''
            });
            return decorateBookmark(activity, 'activity');
        }
        logOperationSuccess('[bookmark]', 'Completed bookmark lookup', {
            found: false,
            ...getSafeUrlLogDetails(url)
        });
        return null;
    }
    catch (error) {
        logOperationFailure('[bookmark]', 'Failed to look up bookmark by URL', error, getSafeUrlLogDetails(url));
        return null;
    }
}
/** Applies sanitized legacy bookmark updates and broadcasts the refreshed record. */
async function updateBookmark(id: string, updates: BookmarkRecord, scopeHint: BookmarkScope | null = null): Promise<boolean> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        const scope = scopeHint || getScopeFromId(id) || (updates.hasActivity ? 'activity' : 'manual');
        logOperationAttempt('[bookmark]', 'update bookmark record', {
            id,
            scope
        });
        const table = getTableByScope(scope);
        if (!table) {
            logOperationWarn('[bookmark]', 'Rejected bookmark update because scope is unknown', {
                id,
                scope
            });
            throw new Error('Unknown bookmark scope for update');
        }
        await table.update(id, {
            ...updates,
            normalizedUrl: normalizeStoredHttpUrl(updates?.normalizedUrl || updates?.url) || undefined,
            canonicalUrl: normalizeStoredCanonicalUrl(updates?.canonicalUrl || updates?.normalizedUrl || updates?.url) || undefined,
            hostname: deriveHostname(updates?.normalizedUrl || updates?.url) || undefined,
            lastInteractionAt: Date.now()
        });
        // Get updated bookmark and notify tabs
        const bookmark = await table.get(id);
        notifyBookmarkChange('updated', decorateBookmark(bookmark, scope));
        logOperationSuccess('[bookmark]', 'Updated bookmark record', {
            id,
            scope,
            hostname: bookmark?.hostname || ''
        });
        return true;
    }
    catch (error) {
        logOperationFailure('[bookmark]', 'Failed to update bookmark record', error, {
            id,
            scope: scopeHint || getScopeFromId(id) || ''
        });
        throw error;
    }
}
/** Deletes a scoped legacy bookmark and broadcasts the removal. */
async function deleteBookmark(id: string, scopeHint: BookmarkScope | null = null): Promise<boolean> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        const scope = scopeHint || getScopeFromId(id);
        logOperationAttempt('[bookmark]', 'delete bookmark record', {
            id,
            scope: scope || ''
        });
        const table = scope ? getTableByScope(scope) : null;
        if (!table) {
            logOperationWarn('[bookmark]', 'Rejected bookmark delete because scope is unknown', {
                id,
                scope: scope || ''
            });
            throw new Error('Unknown bookmark scope for delete');
        }
        await table.delete(id);
        // Notify all tabs about deletion
        notifyBookmarkChange('deleted', { id });
        logOperationSuccess('[bookmark]', 'Deleted bookmark record', {
            id,
            scope
        });
        return true;
    }
    catch (error) {
        logOperationFailure('[bookmark]', 'Failed to delete bookmark record', error, {
            id,
            scope: scopeHint || getScopeFromId(id) || ''
        });
        throw error;
    }
}
/** Combines legacy manual and activity bookmarks into one recency-ordered list. */
async function getAllBookmarks() {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        const db = bookmarksDb;
        if (!db) throw new Error('Bookmarks database unavailable.');
        const manual = await db.table<BookmarkRecord>(MANUAL_TABLE)
            .orderBy('lastInteractionAt')
            .reverse()
            .toArray() as BookmarkRecord[];
        const activity = await db.table<BookmarkRecord>(ACTIVITY_TABLE)
            .orderBy('lastInteractionAt')
            .reverse()
            .toArray() as BookmarkRecord[];
        const combined = [
            ...manual.map((b) => decorateBookmark(b, 'manual')),
            ...activity.map((b) => decorateBookmark(b, 'activity'))
        ].filter((item): item is BookmarkRecord & { bookmarkType: BookmarkScope } => !!item)
            .sort((a, b) => (b.lastInteractionAt || 0) - (a.lastInteractionAt || 0));
        return combined;
    }
    catch (error) {
        lpLog.error('[LP Bookmarks] Failed to get bookmarks:', error);
        return [];
    }
}
// ============ V2 Bookmark Entries (new unified model) ============
// DEV NOTE: BookmarkEntries is the new unified bookmark/history table.
// Old BookmarksManual/BookmarksActivity tables remain untouched.
// userNote = user-authored text only; capturedSnippet = system-captured page text.
// systemLabels identifies the entry kind: system:manual or system:automatic.

function generateEntryId(kind: 'automatic' | 'manual'): string {
    const prefix = kind === 'automatic' ? 'bme_auto_' : 'bme_man_';
    return prefix + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
}

function generateLabelId(): string {
    return 'lbl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function detectUrlKind(rawUrl: string): 'http' | 'https' | 'other' {
    if (typeof rawUrl !== 'string') return 'other';
    const lower = rawUrl.trim().toLowerCase();
    if (lower.startsWith('https:')) return 'https';
    if (lower.startsWith('http:')) return 'http';
    return 'other';
}

/**
 * Build a new BookmarkEntry record.
 */
function buildBookmarkEntryPayload(opts: BookmarkEntryPayloadInput): BookmarkEntryRecord {
    const now = Date.now();
    const rawUrl = opts.url || '';
    const urlKind = typeof opts.urlKind === 'string' ? opts.urlKind : detectUrlKind(rawUrl);
    const normalizedUrl = normalizeStoredHttpUrl(rawUrl) || rawUrl;
    const canonicalUrl = normalizeStoredCanonicalUrl(normalizedUrl) || '';
    const hostname = deriveHostname(normalizedUrl) || '';
    const systemLabels = Array.isArray(opts.systemLabels) ? opts.systemLabels.filter((id): id is string => typeof id === 'string') : [SYSTEM_LABEL_MANUAL];
    const userLabelIds = Array.isArray(opts.userLabelIds) ? opts.userLabelIds.filter((id): id is string => typeof id === 'string' && id.length > 0) : [];
    const visitCount = getFiniteNumber(opts.visitCount, 1) > 0 ? getFiniteNumber(opts.visitCount, 1) : 1;
    const lastInteractionAt = getFiniteNumber(opts.lastInteractionAt, now) > 0 ? getFiniteNumber(opts.lastInteractionAt, now) : now;
    const firstVisitedAt = getFiniteNumber(opts.firstVisitedAt, lastInteractionAt) > 0 ? getFiniteNumber(opts.firstVisitedAt, lastInteractionAt) : lastInteractionAt;
    const entryKind: BookmarkEntryKind = systemLabels.includes(SYSTEM_LABEL_AUTOMATIC) ? 'automatic' : 'manual';
    return {
        id: opts.id || generateEntryId(entryKind),
        title: sanitizeCompactText(opts.title, 240) || hostname || rawUrl,
        url: normalizedUrl,
        urlKind,
        normalizedUrl,
        canonicalUrl,
        hostname,
        userNote: sanitizeCompactText(opts.userNote || '', 2000),
        capturedSnippet: sanitizeCompactText(opts.capturedSnippet || '', 1000),
        systemLabels,
        userLabelIds,
        visitCount,
        createdAt: getFiniteNumber(opts.createdAt, now) > 0 ? getFiniteNumber(opts.createdAt, now) : now,
        updatedAt: now,
        lastInteractionAt,
        firstVisitedAt,
        lastVisitedAt: getFiniteNumber(opts.lastVisitedAt, lastInteractionAt) > 0 ? getFiniteNumber(opts.lastVisitedAt, lastInteractionAt) : lastInteractionAt
    };
}

/** Get BookmarkEntries table or null */
function getEntriesTable(): DexieTable<BookmarkEntryRecord> | null {
    return bookmarksDb ? bookmarksDb.table<BookmarkEntryRecord>(BOOKMARK_ENTRIES_TABLE) : null;
}

/** Get BookmarkLabels table or null */
function getLabelsTable(): DexieTable<BookmarkLabelRecord> | null {
    return bookmarksDb ? bookmarksDb.table<BookmarkLabelRecord>(BOOKMARK_LABELS_TABLE) : null;
}

/** Lists unified bookmark entries while filtering out records with unsupported URLs. */
async function getAllBookmarkEntries(): Promise<BookmarkEntryRecord[]> {
    if (!bookmarksDb) await initBookmarksDb();
    try {
        const table = getEntriesTable();
        if (!table) return [];
        const entries = await table.orderBy('lastInteractionAt').reverse().toArray();
        return entries.filter((entry) => Boolean(normalizeStoredHttpUrl(entry?.normalizedUrl || entry?.url)));
    } catch (error) {
        lpLog.error('[LP BM V2] Failed to get entries:', error);
        return [];
    }
}

/** Applies bounded user-editable fields to a unified bookmark entry. */
async function updateBookmarkEntry(id: unknown, updates: UnknownRecord): Promise<BookmarkEntryRecord | undefined> {
    if (!bookmarksDb) await initBookmarksDb();
    const table = getEntriesTable();
    if (!table) throw new Error('BookmarkEntries table unavailable');
    if (typeof id !== 'string' || !id) throw new Error('Entry ID required');
    const existing = await table.get(id);
    if (!existing) throw new Error('Entry not found: ' + id);
    const now = Date.now();
    const safeUpdates: Partial<BookmarkEntryRecord> = { updatedAt: now };
    if ('title' in updates) safeUpdates.title = sanitizeCompactText(updates.title, 240) || existing.title;
    if ('userNote' in updates) safeUpdates.userNote = sanitizeCompactText(updates.userNote || '', 2000);
    if ('capturedSnippet' in updates) safeUpdates.capturedSnippet = sanitizeCompactText(updates.capturedSnippet || '', 1000);
    if ('userLabelIds' in updates) safeUpdates.userLabelIds = Array.isArray(updates.userLabelIds) ? updates.userLabelIds.filter((lid) => typeof lid === 'string' && lid.length > 0) : existing.userLabelIds;
    if ('url' in updates) {
        const normalized = normalizeStoredHttpUrl(updates.url);
        if (normalized) {
            safeUpdates.url = normalized;
            safeUpdates.normalizedUrl = normalized;
            safeUpdates.canonicalUrl = normalizeStoredCanonicalUrl(normalized) || '';
            safeUpdates.hostname = deriveHostname(normalized) || '';
            safeUpdates.urlKind = detectUrlKind(normalized);
        }
    }
    await table.update(id, safeUpdates);
    const updated = await table.get(id);
    notifyBookmarkChange('updated', updated);
    return updated;
}

async function deleteBookmarkEntry(id: unknown): Promise<boolean> {
    if (!bookmarksDb) await initBookmarksDb();
    const table = getEntriesTable();
    if (!table) throw new Error('BookmarkEntries table unavailable');
    if (typeof id !== 'string' || !id) throw new Error('Entry ID required');
    await table.delete(id);
    lpLog.debug('[LP BM V2] Deleted entry:', id);
    notifyBookmarkChange('deleted', { id });
    return true;
}

async function enforceBookmarkEntriesLimit() {
    const table = getEntriesTable();
    if (!table) return;
    const total = await table.count();
    if (total <= BOOKMARK_ENTRIES_LIMIT) return;
    const overflow = total - BOOKMARK_ENTRIES_LIMIT;
    const oldest = await table.orderBy('lastInteractionAt').limit(overflow).toArray();
    // Only trim automatic entries first; preserve manual entries.
    const autoIds = oldest.filter((e) => e.systemLabels?.includes(SYSTEM_LABEL_AUTOMATIC)).map((e) => e.id);
    if (autoIds.length > 0) {
        await table.bulkDelete(autoIds.slice(0, overflow));
    }
}

async function listBookmarkLabels(): Promise<BookmarkLabelRecord[]> {
    if (!bookmarksDb) await initBookmarksDb();
    try {
        const table = getLabelsTable();
        if (!table) return [];
        return await table.orderBy('createdAt').toArray();
    } catch (error) {
        lpLog.error('[LP BM V2] Failed to list labels:', error);
        return [];
    }
}

async function createBookmarkLabel({ name, icon, tone, sortOrder }: BookmarkLabelPayloadInput): Promise<BookmarkLabelRecord> {
    if (!bookmarksDb) await initBookmarksDb();
    const table = getLabelsTable();
    if (!table) throw new Error('BookmarkLabels table unavailable');
    const safeName = sanitizeCompactText(name, 60);
    if (!safeName) throw new Error('Label name is required');
    const ALLOWED_ICONS = ['tag', 'star', 'heart', 'bookmark', 'flag', 'folder', 'code', 'link', 'file', 'info', 'check', 'clock', 'bell', 'lock', 'eye'];
    const ALLOWED_TONES = ['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'orange', 'teal'];
    const now = Date.now();
    const label = {
        id: generateLabelId(),
        name: safeName,
        icon: typeof icon === 'string' && ALLOWED_ICONS.includes(icon) ? icon : 'tag',
        tone: typeof tone === 'string' && ALLOWED_TONES.includes(tone) ? tone : 'blue',
        sortOrder: getFiniteNumber(sortOrder, now),
        createdAt: now,
        updatedAt: now,
        archivedAt: null
    };
    await table.add(label);
    lpLog.debug('[LP BM V2] Created label:', label.id);
    return label;
}

async function updateBookmarkLabel(id: unknown, updates: UnknownRecord): Promise<BookmarkLabelRecord | undefined> {
    if (!bookmarksDb) await initBookmarksDb();
    const table = getLabelsTable();
    if (!table) throw new Error('BookmarkLabels table unavailable');
    if (typeof id !== 'string' || !id) throw new Error('Label ID required');
    const existing = await table.get(id);
    if (!existing) throw new Error('Label not found: ' + id);
    const ALLOWED_ICONS = ['tag', 'star', 'heart', 'bookmark', 'flag', 'folder', 'code', 'link', 'file', 'info', 'check', 'clock', 'bell', 'lock', 'eye'];
    const ALLOWED_TONES = ['blue', 'green', 'yellow', 'red', 'purple', 'gray', 'orange', 'teal'];
    const safeUpdates: Partial<BookmarkLabelRecord> = { updatedAt: Date.now() };
    if ('name' in updates) {
        const safeName = sanitizeCompactText(updates.name, 60);
        if (safeName) safeUpdates.name = safeName;
    }
    if ('icon' in updates && typeof updates.icon === 'string' && ALLOWED_ICONS.includes(updates.icon)) safeUpdates.icon = updates.icon;
    if ('tone' in updates && typeof updates.tone === 'string' && ALLOWED_TONES.includes(updates.tone)) safeUpdates.tone = updates.tone;
    if ('sortOrder' in updates && typeof updates.sortOrder === 'number' && Number.isFinite(updates.sortOrder)) safeUpdates.sortOrder = updates.sortOrder;
    await table.update(id, safeUpdates);
    return await table.get(id);
}

async function deleteBookmarkLabel(id: unknown): Promise<{ deletedLabelId: string; affectedEntryCount: number }> {
    if (!bookmarksDb) await initBookmarksDb();
    const labelsTable = getLabelsTable();
    const entriesTable = getEntriesTable();
    if (!labelsTable || !entriesTable) throw new Error('Tables unavailable');
    if (typeof id !== 'string' || !id) throw new Error('Label ID required');
    // Remove label from all entries that reference it
    const affected = await entriesTable.filter((entry) => Array.isArray(entry.userLabelIds) && entry.userLabelIds.includes(id)).toArray();
    for (const entry of affected) {
        await entriesTable.update(entry.id, {
            userLabelIds: entry.userLabelIds.filter((lid) => lid !== id),
            updatedAt: Date.now()
        });
    }
    await labelsTable.delete(id);
    lpLog.debug('[LP BM V2] Deleted label:', id, 'removed from', affected.length, 'entries');
    return { deletedLabelId: id, affectedEntryCount: affected.length };
}

/**
 * Bridge: upsert a system:manual BookmarkEntry when a manual bookmark is saved via the
 * legacy createBookmark() flow. Called as fire-and-forget; never throws.
 */
async function bridgeCreateManualEntry(normalizedUrl: string, title: unknown, snippet: unknown): Promise<void> {
    try {
        if (!bookmarksDb) return;
        const table = getEntriesTable();
        if (!table) return;
        if (!normalizedUrl) return;
        const now = Date.now();
        const safeTitle = sanitizeCompactText(title, 240) || deriveHostname(normalizedUrl) || normalizedUrl;
        const safeSnippet = sanitizeCompactText(snippet || '', 1000);
        const existing = await table.where('normalizedUrl').equals(normalizedUrl).first().catch(() => null);
        if (existing) {
            await table.update(existing.id, {
                systemLabels: [SYSTEM_LABEL_MANUAL],
                title: safeTitle || existing.title,
                capturedSnippet: safeSnippet || existing.capturedSnippet || '',
                lastInteractionAt: now,
                updatedAt: now
            });
        } else {
            const entry = buildBookmarkEntryPayload({
                url: normalizedUrl,
                title: safeTitle,
                capturedSnippet: safeSnippet,
                systemLabels: [SYSTEM_LABEL_MANUAL],
                lastInteractionAt: now
            });
            await table.add(entry);
            await enforceBookmarkEntriesLimit();
        }
    } catch (err) {
        lpLog.warn('[LP BM V2] Bridge manual entry failed:', getErrorMessage(err));
    }
}

async function recordBookmarkEntryActivity(url: unknown, title: unknown, capturedSnippet: unknown): Promise<BookmarkEntryRecord | null | undefined> {
    if (!bookmarksDb) await initBookmarksDb();
    const table = getEntriesTable();
    if (!table) return null;
    const normalizedUrl = normalizeStoredHttpUrl(url);
    if (!normalizedUrl) return null;
    logOperationAttempt('[bookmark]', 'record automatic bookmark activity entry', getSafeUrlLogDetails(normalizedUrl));
    const now = Date.now();
    const safeTitle = sanitizeCompactText(title, 240) || deriveHostname(normalizedUrl) || normalizedUrl;
    const safeSnippet = sanitizeCompactText(capturedSnippet || '', 1000);
    // Use indexed lookup on normalizedUrl (no full table scan)
    const existing = await table.where('normalizedUrl').equals(normalizedUrl)
        .first();
    if (existing) {
        const updatedEntry: Partial<BookmarkEntryRecord> = {
            title: safeTitle || existing.title,
            capturedSnippet: safeSnippet || existing.capturedSnippet || '',
            visitCount: (existing.visitCount || 0) + 1,
            lastInteractionAt: now,
            lastVisitedAt: now,
            firstVisitedAt: toSafeEpoch(existing.firstVisitedAt || existing.createdAt || now) || now,
            updatedAt: now
        };
        if (!existing.systemLabels?.includes(SYSTEM_LABEL_MANUAL)) {
            updatedEntry.systemLabels = [SYSTEM_LABEL_AUTOMATIC];
        }
        await table.update(existing.id, updatedEntry);
        const updated = await table.get(existing.id);
        notifyBookmarkChange('updated', updated);
        logOperationSuccess('[bookmark]', 'Recorded automatic bookmark activity entry', {
            entryId: existing.id,
            outcome: 'updated',
            hostname: updated?.hostname || ''
        });
        return updated;
    }
    // Create new automatic entry
    const entry = buildBookmarkEntryPayload({
        url: normalizedUrl,
        title: safeTitle,
        urlKind: detectUrlKind(normalizedUrl),
        capturedSnippet: safeSnippet,
        systemLabels: [SYSTEM_LABEL_AUTOMATIC],
        visitCount: 1,
        lastInteractionAt: now,
        firstVisitedAt: now
    });
    await table.add(entry);
    await enforceBookmarkEntriesLimit();
    notifyBookmarkChange('created', entry);
    logOperationSuccess('[bookmark]', 'Recorded automatic bookmark activity entry', {
        entryId: entry.id,
        outcome: 'created',
        hostname: entry.hostname || ''
    });
    return entry;
}
// Record activity for a URL (keyboard interaction)
async function recordActivity(url: unknown, title: unknown, snippet: unknown = ''): Promise<BookmarkRecord | null> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        logOperationAttempt('[bookmark]', 'record bookmark activity', getSafeUrlLogDetails(url));
        const normalizedUrl = normalizeStoredHttpUrl(url);
        if (!normalizedUrl) {
            logOperationWarn('[bookmark]', 'Rejected bookmark activity recording because URL is invalid', getSafeUrlLogDetails(url));
            throw new Error('Invalid activity URL.');
        }
        const safeSnippet = sanitizeCompactText(snippet, 1000);
        const safeTitle = sanitizeCompactText(title, 240) || deriveHostname(normalizedUrl) || normalizedUrl;
        // Write to BookmarkEntries (V2 table). Awaited to survive MV3 service worker lifecycle.
        try {
            await recordBookmarkEntryActivity(normalizedUrl, safeTitle, safeSnippet);
        } catch (bridgeErr) {
            lpLog.warn('[LP BM V2] Activity bridge write failed:', getErrorMessage(bridgeErr));
        }
        const existingManual = await findBookmarkRecordByUrl(MANUAL_TABLE, normalizedUrl);
        if (existingManual) {
            const db = bookmarksDb;
            if (!db) throw new Error('Bookmarks database unavailable.');
            await db.table<BookmarkRecord>(MANUAL_TABLE).update(existingManual.id, {
                url: normalizedUrl,
                normalizedUrl,
                canonicalUrl: normalizeStoredCanonicalUrl(normalizedUrl),
                hostname: deriveHostname(normalizedUrl),
                title: safeTitle,
                snippet: safeSnippet || existingManual.snippet || '',
                lastInteractionAt: Date.now(),
                lastVisitedAt: Date.now(),
                firstVisitedAt: toSafeEpoch(existingManual.firstVisitedAt || existingManual.createdAt || Date.now()),
                hasManualBookmark: true,
                visitCount: Math.max(1, Number(existingManual.visitCount) || 1) + 1
            });
            const updatedManual = await db.table<BookmarkRecord>(MANUAL_TABLE).get(existingManual.id);
            notifyBookmarkChange('updated', decorateBookmark(updatedManual, 'manual'));
            logOperationSuccess('[bookmark]', 'Recorded bookmark activity against manual bookmark', {
                id: existingManual.id,
                hostname: updatedManual?.hostname || ''
            });
            return decorateBookmark(updatedManual, 'manual');
        }
        const existing = await findBookmarkRecordByUrl(ACTIVITY_TABLE, normalizedUrl);
        if (existing) {
            // Update existing bookmark
            const db = bookmarksDb;
            if (!db) throw new Error('Bookmarks database unavailable.');
            await db.table<BookmarkRecord>(ACTIVITY_TABLE).update(existing.id, {
                url: normalizedUrl,
                normalizedUrl,
                canonicalUrl: normalizeStoredCanonicalUrl(normalizedUrl),
                hostname: deriveHostname(normalizedUrl),
                title: safeTitle,
                snippet: safeSnippet || existing.snippet || '',
                lastInteractionAt: Date.now(),
                lastVisitedAt: Date.now(),
                firstVisitedAt: toSafeEpoch(existing.firstVisitedAt || existing.createdAt || Date.now()),
                hasActivity: true,
                visitCount: (existing.visitCount || 0) + 1
            });
            // Get updated bookmark and notify tabs
            const updated = await db.table<BookmarkRecord>(ACTIVITY_TABLE).get(existing.id);
            notifyBookmarkChange('updated', decorateBookmark(updated, 'activity'));
            logOperationSuccess('[bookmark]', 'Recorded bookmark activity against existing activity bookmark', {
                id: existing.id,
                hostname: updated?.hostname || ''
            });
            return decorateBookmark(updated, 'activity');
        }
        else {
            // Create new activity bookmark
            const bookmark = await createBookmark(normalizedUrl, safeTitle, safeSnippet, 'activity', '');
            await enforceTableLimit(ACTIVITY_TABLE, ACTIVITY_LIMIT);
            logOperationSuccess('[bookmark]', 'Recorded bookmark activity as new activity bookmark', {
                id: bookmark?.id || '',
                hostname: bookmark?.hostname || ''
            });
            return bookmark;
        }
    }
    catch (error) {
        logOperationFailure('[bookmark]', 'Failed to record bookmark activity', error, getSafeUrlLogDetails(url));
        throw error;
    }
}
async function listUrlPickerSignals() {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    try {
        logOperationAttempt('[url-picker]', 'list picker signal records');
        const table = getUrlSignalsTable();
        if (!table) {
            logOperationWarn('[url-picker]', 'Skipped listing picker signal records because table is unavailable');
            return [];
        }
        const signals = await table.toArray();
        logOperationSuccess('[url-picker]', 'Listed picker signal records', {
            count: signals.length
        });
        return signals;
    }
    catch (error) {
        logOperationFailure('[url-picker]', 'Failed to list picker signal records', error);
        return [];
    }
}
/** Persists URL picker ranking signals while bounding title, hostname, and favicon data. */
async function upsertUrlPickerSignal(url: unknown, updates: UrlPickerSignalUpdates = {}): Promise<UrlPickerSignalRecord> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    logOperationAttempt('[url-picker]', 'persist picker URL signal', {
        markSelected: updates.markSelected === true,
        hasFavicon: typeof updates.faviconDataUrl === 'string' && updates.faviconDataUrl.startsWith('data:image/'),
        ...getSafeUrlLogDetails(url)
    });
    const normalizedUrl = normalizeStoredHttpUrl(url);
    if (!normalizedUrl) {
        logOperationWarn('[url-picker]', 'Rejected picker URL signal because URL is invalid', getSafeUrlLogDetails(url));
        throw new Error('Invalid picker URL.');
    }
    const table = getUrlSignalsTable();
    if (!table) {
        logOperationWarn('[url-picker]', 'Rejected picker URL signal because table is unavailable', getSafeUrlLogDetails(normalizedUrl));
        throw new Error('Picker signals table unavailable.');
    }
    const now = Date.now();
    const existing = await findUrlPickerSignalByUrl(normalizedUrl);
    const record = {
        normalizedUrl,
        canonicalUrl: normalizeStoredCanonicalUrl(existing?.canonicalUrl || normalizedUrl) || normalizedUrl,
        url: normalizedUrl,
        hostname: sanitizeCompactText(updates.hostname, 120) || deriveHostname(normalizedUrl),
        title: sanitizeCompactText(updates.title, 240) || sanitizeCompactText(existing?.title, 240) || '',
        lastPickerSelectedAt: toSafeEpoch(existing?.lastPickerSelectedAt),
        pickerSelectionCount: Math.max(0, Math.trunc(Number(existing?.pickerSelectionCount) || 0)),
        faviconDataUrl: sanitizeFaviconDataUrl(updates.faviconDataUrl) || sanitizeFaviconDataUrl(existing?.faviconDataUrl),
        faviconUpdatedAt: toSafeEpoch(existing?.faviconUpdatedAt),
        updatedAtEpochMs: now
    };
    if (updates.markSelected === true) {
        record.lastPickerSelectedAt = now;
        record.pickerSelectionCount += 1;
    }
    if (record.faviconDataUrl && updates.faviconDataUrl) {
        record.faviconUpdatedAt = now;
    }
    await table.put(record);
    const existingKey = normalizeStoredHttpUrl(existing?.normalizedUrl || existing?.url);
    if (existingKey && existingKey !== normalizedUrl) {
        await table.delete(existingKey);
    }
    logOperationSuccess('[url-picker]', 'Persisted picker URL signal', {
        markSelected: updates.markSelected === true,
        hostname: record.hostname || '',
        selectionCount: record.pickerSelectionCount
    });
    return record;
}
/** Toggles a picker URL between manual bookmark and retained activity snapshot. */
async function toggleUrlPickerBookmark(url: unknown, title: unknown = '', snippet: unknown = '') {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    logOperationAttempt('[url-picker]', 'toggle picker bookmark', getSafeUrlLogDetails(url));
    const normalizedUrl = normalizeStoredHttpUrl(url);
    if (!normalizedUrl) {
        logOperationWarn('[url-picker]', 'Rejected picker bookmark toggle because URL is invalid', getSafeUrlLogDetails(url));
        throw new Error('Invalid bookmark URL.');
    }
    const manual = await findBookmarkRecordByUrl(MANUAL_TABLE, normalizedUrl);
    if (manual) {
        const fallbackTitle = sanitizeCompactText(manual.title || title, 240) || deriveHostname(normalizedUrl) || normalizedUrl;
        const fallbackSnippet = sanitizeCompactText(manual.userComment || manual.snippet || snippet, 1000);
        const visitCount = Math.max(1, Number(manual.visitCount) || 1);
        const lastInteractionAt = toSafeEpoch(manual.lastInteractionAt || manual.lastVisitedAt || Date.now()) || Date.now();
        const firstVisitedAt = toSafeEpoch(manual.firstVisitedAt || manual.createdAt || lastInteractionAt) || lastInteractionAt;
        await deleteBookmark(manual.id || '', 'manual');
        await createActivitySnapshot({
            url: normalizedUrl,
            title: fallbackTitle,
            snippet: fallbackSnippet,
            visitCount,
            lastInteractionAt,
            firstVisitedAt
        });
        logOperationSuccess('[url-picker]', 'Toggled picker bookmark off and preserved activity snapshot', {
            hostname: deriveHostname(normalizedUrl) || ''
        });
        return {
            isBookmarked: false
        };
    }
    const bookmark = await createBookmark(normalizedUrl, sanitizeCompactText(title, 240) || deriveHostname(normalizedUrl) || normalizedUrl, sanitizeCompactText(snippet, 1000), 'manual', sanitizeCompactText(snippet, 1000));
    logOperationSuccess('[url-picker]', 'Toggled picker bookmark on', {
        bookmarkId: bookmark?.id || '',
        hostname: bookmark?.hostname || ''
    });
    return {
        isBookmarked: true,
        bookmark
    };
}
/** Writes an activity record that preserves visit history after a manual bookmark is removed. */
async function createActivitySnapshot({ url, title, snippet = '', visitCount = 1, lastInteractionAt = Date.now(), firstVisitedAt = lastInteractionAt }: ActivitySnapshotInput): Promise<(BookmarkRecord & { bookmarkType: BookmarkScope }) | null> {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
    const normalizedUrl = normalizeStoredHttpUrl(url);
    if (!normalizedUrl) {
        return null;
    }
    const existing = await findBookmarkRecordByUrl(ACTIVITY_TABLE, normalizedUrl);
    const payload = buildBookmarkPayload({
        id: existing?.id || generateBookmarkId('activity'),
        url: normalizedUrl,
        title,
        snippet,
        userComment: '',
        reason: 'activity',
        visitCountOverride: visitCount,
        lastInteractionAtOverride: lastInteractionAt,
        firstVisitedAtOverride: firstVisitedAt
    });
    const db = bookmarksDb;
    if (!db) throw new Error('Bookmarks database unavailable.');
    await db.table<BookmarkRecord>(ACTIVITY_TABLE).put(payload);
    notifyBookmarkChange(existing ? 'updated' : 'created', decorateBookmark(payload, 'activity'));
    await enforceTableLimit(ACTIVITY_TABLE, ACTIVITY_LIMIT);
    return decorateBookmark(payload, 'activity');
}
// Notify all tabs about bookmark changes
function notifyBookmarkChange(changeType: BookmarkChangeType, bookmark: unknown): void {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            const tabId = tab.id;
            if (typeof tabId !== 'number' || !Number.isInteger(tabId)) {
                return;
            }
            chrome.tabs.sendMessage(tabId, {
                type: 'LP_BOOKMARK_CHANGED',
                changeType: changeType, // 'created', 'updated', 'deleted'
                bookmark: bookmark
            }).catch(() => {
                // Tab might not have content script, ignore error
            });
        });
    });
}
function buildServiceWorkerSettingsSignature(doc: LpSettingsDocument): string {
    const get = (keyPath: string) => lpSettings.getEffectiveValue(doc, keyPath);
    return JSON.stringify({
        loggingLevel: get('logging.level') || 'error',
        headerBypassEnabled: get('privacySecurity.enableHeaderBypass') !== false
    });
}
function trackRepeatedServiceWorkerSettingsSignature(signature: string): boolean {
    const now = Date.now();
    if (repeatedSettingsSignature === signature && (now - repeatedSettingsAt) <= SETTINGS_LOOP_WINDOW_MS) {
        repeatedSettingsCount += 1;
    }
    else {
        repeatedSettingsSignature = signature;
        repeatedSettingsCount = 1;
    }
    repeatedSettingsAt = now;
    if (repeatedSettingsCount > SETTINGS_LOOP_MAX_REPEATS) {
        lpLog.warn('[LP] Ignoring repeated identical settings event burst in service worker');
        return true;
    }
    return false;
}
async function applyServiceWorkerSettingsDocument(doc: LpSettingsDocument, source = 'startup'): Promise<boolean> {
    const signature = buildServiceWorkerSettingsSignature(doc);
    if (source === 'storage') {
        if (trackRepeatedServiceWorkerSettingsSignature(signature)) {
            return false;
        }
        if (signature === lastAppliedSettingsSignature) {
            lpLog.debug('[LP] Service worker settings unchanged; skipping reapply');
            return false;
        }
    }
    lastAppliedSettingsSignature = signature;
    lpLog.setLevelFromSettingsDocument(doc);
    const headerBypassEnabled = lpSettings.getEffectiveValue(doc, 'privacySecurity.enableHeaderBypass');
    if (!headerBypassEnabled) {
        await removeAllEmbeddedNavigationRules('setting_disabled');
    }
    return true;
}
async function ensureBookmarksDbReady() {
    if (!bookmarksDb) {
        await initBookmarksDb();
    }
}
// Initialize database on service worker startup
initBookmarksDb();
chrome.tabs.onCreated.addListener((tab) => {
    initBookmarksDb().then(function () {
        return tabTrailService.handleTabCreated(tab);
    }).catch(function (error) {
        lpLog.warn('[LP TabTrail] on_created_failed', { tabId: tab?.id || null, code: error instanceof Error ? error.message : 'unknown' });
    });
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    initBookmarksDb().then(function () {
        return tabTrailService.handleTabUpdated(tabId, changeInfo, tab);
    }).catch(function (error) {
        lpLog.warn('[LP TabTrail] on_updated_failed', { tabId: Number.isInteger(tabId) ? tabId : null, code: error instanceof Error ? error.message : 'unknown' });
    });
});
chrome.tabs.onActivated.addListener((activeInfo) => {
    initBookmarksDb().then(function () {
        return tabTrailService.handleTabActivated(activeInfo);
    }).catch(function (error) {
        lpLog.warn('[LP TabTrail] on_activated_failed', { tabId: activeInfo?.tabId || null, code: error instanceof Error ? error.message : 'unknown' });
    });
});
chrome.tabs.onRemoved.addListener((tabId) => {
    initBookmarksDb().then(function () {
        return tabTrailService.handleTabRemoved(tabId);
    }).catch(function (error) {
        lpLog.warn('[LP TabTrail] on_removed_failed', { tabId: Number.isInteger(tabId) ? tabId : null, code: error instanceof Error ? error.message : 'unknown' });
    });
});
initBookmarksDb().then(function () {
    return tabTrailService.reconcileCurrentTabs();
}).then(function () {
    return tabTrailService.cleanup();
}).catch(function (error) {
    lpLog.warn('[LP TabTrail] startup_reconcile_failed', { code: error instanceof Error ? error.message : 'unknown' });
});
// ============ End Bookmark Database ============
/** Wraps Chrome's callback-based DNR update API in a promise. */
function updateEmbeddedNavigationSessionRules(options: { removeRuleIds?: number[]; addRules?: chrome.declarativeNetRequest.Rule[] }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        chrome.declarativeNetRequest.updateSessionRules(options, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message || 'embedded_navigation_dnr_update_failed'));
                return;
            }
            resolve();
        });
    });
}
/** Wraps Chrome's callback-based DNR session-rule read API in a promise. */
function getEmbeddedNavigationSessionRules(): Promise<chrome.declarativeNetRequest.Rule[]> {
    return new Promise<chrome.declarativeNetRequest.Rule[]>((resolve, reject) => {
        chrome.declarativeNetRequest.getSessionRules((rules) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message || 'embedded_navigation_dnr_read_failed'));
                return;
            }
            resolve(Array.isArray(rules) ? rules : []);
        });
    });
}
function getEnabledDnrRulesets(): Promise<string[]> {
    return new Promise<string[]>((resolve) => {
        if (!chrome.declarativeNetRequest.getEnabledRulesets) {
            resolve([]);
            return;
        }
        chrome.declarativeNetRequest.getEnabledRulesets((rulesetIds) => {
            if (chrome.runtime.lastError) {
                lpLog.debug('[LP EmbeddedNav] Failed to read enabled DNR rulesets:', chrome.runtime.lastError.message);
                resolve([]);
                return;
            }
            resolve(Array.isArray(rulesetIds) ? rulesetIds : []);
        });
    });
}
function logEmbeddedNavigationEvent(event: string, details: Record<string, unknown> = {}) {
    lpLog.debug('[LP EmbeddedNav]', {
        event,
        timestamp: Date.now(),
        ...details
    });
}
function createEmbeddedNavigationToken() {
    return `embedded_nav_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}
/** Allocates the next unused embedded-navigation DNR rule id within the reserved range. */
function allocateEmbeddedNavigationRuleId() {
    const usedRuleIds = new Set(Array.from(embeddedNavigationRules.values()).map((entry) => entry.ruleId));
    let candidate = embeddedNavigationRuleIdCounter;
    for (let attempts = 0; attempts < 100000; attempts += 1) {
        if (!usedRuleIds.has(candidate)) {
            embeddedNavigationRuleIdCounter = nextEmbeddedNavigationRuleId(candidate);
            return candidate;
        }
        candidate = nextEmbeddedNavigationRuleId(candidate);
    }
    throw new Error('embedded_navigation_rule_id_exhausted');
}
/** Schedules the cleanup alarm that expires temporary embedded-navigation bypass rules. */
function scheduleEmbeddedNavigationTtlAlarm() {
    if (embeddedNavigationRules.size === 0) {
        chrome.alarms.clear(EMBEDDED_NAVIGATION_TTL_ALARM_NAME);
        return;
    }
    chrome.alarms.create(EMBEDDED_NAVIGATION_TTL_ALARM_NAME, {
        delayInMinutes: 1
    });
}
/** Scopes embedded-navigation contexts so global rules cannot collide with tab-scoped rules. */
function normalizeEmbeddedNavigationContext(context: unknown, tabId: number | null): string {
    const raw = typeof context === 'string' && context.trim() ? context.trim() : 'embedded_navigation';
    return Number.isInteger(tabId) ? raw : `${raw}:global_scope`;
}
/**
 * Prepares a temporary embedded-navigation bypass rule
 * and returns the release token used for cleanup.
 */
async function prepareEmbeddedNavigation(rawUrl: unknown, options: EmbeddedNavigationOptions = {}, sender: chrome.runtime.MessageSender = {}): Promise<UnknownRecord> {
    const requestId = typeof options.requestId === 'string' && options.requestId
        ? options.requestId
        : createEmbeddedNavigationToken();
    logOperationAttempt('[iframe-action]', 'prepare embedded navigation header bypass', {
        requestId,
        context: options.context || '',
        surfaceId: options.surfaceId || '',
        ...getSafeUrlLogDetails(rawUrl),
        ...getSenderLogDetails(sender)
    });
    const normalized = normalizeEmbeddedNavigationTarget(rawUrl);
    if (!normalized.ok) {
        logOperationWarn('[iframe-action]', 'Refused embedded navigation header bypass preparation', {
            requestId,
            reason: normalized.error,
            context: options.context || ''
        });
        logEmbeddedNavigationEvent('embedded_navigation_prepare_failure', {
            requestId,
            reason: normalized.error,
            context: options.context || ''
        });
        return {
            success: false,
            error: normalized.error
        };
    }
    const senderTabId = typeof sender.tab?.id === 'number' && Number.isInteger(sender.tab.id) ? sender.tab.id : null;
    const context = normalizeEmbeddedNavigationContext(options.context, senderTabId);
    logEmbeddedNavigationEvent('embedded_navigation_prepare_start', {
        requestId,
        context,
        surfaceId: options.surfaceId || '',
        hostname: normalized.hostname,
        tabId: senderTabId,
        isTabScoped: Number.isInteger(senderTabId)
    });
    await sweepExpiredEmbeddedNavigationRules('prepare');
    const doc = await settingsReady;
    const headerBypassEnabled = lpSettings.getEffectiveValue(doc, 'privacySecurity.enableHeaderBypass') !== false;
    logEmbeddedNavigationEvent('embedded_navigation_setting_resolved', {
        requestId,
        hostname: normalized.hostname,
        enabled: headerBypassEnabled
    });
    if (!headerBypassEnabled) {
        logOperationWarn('[iframe-action]', 'Skipped embedded navigation header bypass because it is disabled', {
            requestId,
            hostname: normalized.hostname,
            context
        });
        return {
            success: true,
            bypassEnabled: false,
            navigationToken: '',
            scope: {
                hostname: normalized.hostname,
                tabId: senderTabId,
                context
            }
        };
    }
    const key = buildEmbeddedNavigationRuleKey(senderTabId, normalized.hostname);
    const token = createEmbeddedNavigationToken();
    const existing = embeddedNavigationRules.get(key);
    if (existing) {
        existing.refCount += 1;
        existing.tokens.add(token);
        existing.contexts.add(context);
        existing.lastUsedAtEpochMs = Date.now();
        embeddedNavigationTokens.set(token, key);
        scheduleEmbeddedNavigationTtlAlarm();
        logEmbeddedNavigationEvent('embedded_navigation_rule_reuse', {
            requestId,
            token,
            ruleId: existing.ruleId,
            hostname: existing.hostname,
            tabId: existing.tabId,
            refCount: existing.refCount,
            isTabScoped: existing.isTabScoped
        });
        const response = {
            success: true,
            bypassEnabled: true,
            navigationToken: token,
            ruleId: existing.ruleId,
            scope: {
                hostname: existing.hostname,
                tabId: existing.tabId,
                context,
                isTabScoped: existing.isTabScoped
            }
        };
        logOperationSuccess('[iframe-action]', 'Prepared embedded navigation using existing header bypass rule', {
            requestId,
            ruleId: existing.ruleId,
            hostname: existing.hostname,
            tabId: existing.tabId,
            refCount: existing.refCount
        });
        return response;
    }
    const ruleId = allocateEmbeddedNavigationRuleId();
    const rule = buildEmbeddedNavigationHeaderBypassRule({
        ruleId,
        hostname: normalized.hostname,
        tabId: senderTabId
    });
    logEmbeddedNavigationEvent('embedded_navigation_rule_install_start', {
        requestId,
        token,
        ruleId,
        hostname: normalized.hostname,
        tabId: senderTabId,
        isTabScoped: Number.isInteger(senderTabId)
    });
    await updateEmbeddedNavigationSessionRules({
        addRules: [rule]
    });
    const now = Date.now();
    embeddedNavigationRules.set(key, {
        ruleId,
        hostname: normalized.hostname,
        tabId: senderTabId,
        refCount: 1,
        tokens: new Set([token]),
        contexts: new Set([context]),
        createdAtEpochMs: now,
        lastUsedAtEpochMs: now,
        lastPreparedUrlOrigin: normalized.origin,
        isTabScoped: Number.isInteger(senderTabId)
    });
    embeddedNavigationTokens.set(token, key);
    scheduleEmbeddedNavigationTtlAlarm();
    logEmbeddedNavigationEvent('embedded_navigation_rule_install_success', {
        requestId,
        token,
        ruleId,
        hostname: normalized.hostname,
        tabId: senderTabId,
        isTabScoped: Number.isInteger(senderTabId)
    });
    logOperationSuccess('[iframe-action]', 'Prepared embedded navigation header bypass rule', {
        requestId,
        ruleId,
        hostname: normalized.hostname,
        tabId: senderTabId,
        isTabScoped: Number.isInteger(senderTabId)
    });
    return {
        success: true,
        bypassEnabled: true,
        navigationToken: token,
        ruleId,
        scope: {
            hostname: normalized.hostname,
            tabId: senderTabId,
            context,
            isTabScoped: Number.isInteger(senderTabId)
        }
    };
}
/** Releases a temporary embedded-navigation token and removes its DNR rule when unused. */
async function releaseEmbeddedNavigation(token: string, reason: string = 'release') {
    if (!token || typeof token !== 'string') {
        logOperationWarn('[iframe-action]', 'Skipped embedded navigation header bypass release because token is missing', {
            reason
        });
        return { success: true, released: false, reason: 'missing_token' };
    }
    const key = embeddedNavigationTokens.get(token);
    if (!key) {
        logOperationWarn('[iframe-action]', 'Skipped embedded navigation header bypass release because token is unknown', {
            reason
        });
        logEmbeddedNavigationEvent('embedded_navigation_release_success', {
            token,
            released: false,
            reason: 'unknown_token'
        });
        return { success: true, released: false, reason: 'unknown_token' };
    }
    const entry = embeddedNavigationRules.get(key);
    embeddedNavigationTokens.delete(token);
    if (!entry) {
        logOperationWarn('[iframe-action]', 'Skipped embedded navigation header bypass release because rule entry is missing', {
            reason
        });
        return { success: true, released: false, reason: 'missing_entry' };
    }
    logOperationAttempt('[iframe-action]', 'release embedded navigation header bypass rule', {
        ruleId: entry.ruleId,
        hostname: entry.hostname,
        tabId: entry.tabId,
        reason
    });
    logEmbeddedNavigationEvent('embedded_navigation_release_start', {
        token,
        ruleId: entry.ruleId,
        hostname: entry.hostname,
        tabId: entry.tabId,
        reason
    });
    entry.tokens.delete(token);
    entry.refCount = Math.max(0, entry.refCount - 1);
    entry.lastUsedAtEpochMs = Date.now();
    if (entry.refCount > 0 || entry.tokens.size > 0) {
        logEmbeddedNavigationEvent('embedded_navigation_release_success', {
            token,
            ruleId: entry.ruleId,
            hostname: entry.hostname,
            released: true,
            removedRule: false,
            refCount: entry.refCount
        });
        logOperationSuccess('[iframe-action]', 'Released embedded navigation token while keeping shared header bypass rule', {
            ruleId: entry.ruleId,
            hostname: entry.hostname,
            refCount: entry.refCount
        });
        return { success: true, released: true, removedRule: false };
    }
    await updateEmbeddedNavigationSessionRules({
        removeRuleIds: [entry.ruleId]
    });
    embeddedNavigationRules.delete(key);
    scheduleEmbeddedNavigationTtlAlarm();
    logEmbeddedNavigationEvent('embedded_navigation_release_success', {
        token,
        ruleId: entry.ruleId,
        hostname: entry.hostname,
        released: true,
        removedRule: true
    });
    logOperationSuccess('[iframe-action]', 'Released embedded navigation header bypass rule', {
        ruleId: entry.ruleId,
        hostname: entry.hostname
    });
    return { success: true, released: true, removedRule: true };
}
async function removeAllEmbeddedNavigationRules(reason: string = 'remove_all') {
    const ruleIds = Array.from(embeddedNavigationRules.values()).map((entry) => entry.ruleId);
    logOperationAttempt('[iframe-action]', 'remove embedded navigation header bypass rules', {
        reason,
        count: ruleIds.length
    });
    embeddedNavigationRules.clear();
    embeddedNavigationTokens.clear();
    if (ruleIds.length > 0) {
        await updateEmbeddedNavigationSessionRules({
            removeRuleIds: ruleIds
        });
    }
    scheduleEmbeddedNavigationTtlAlarm();
    logEmbeddedNavigationEvent('embedded_navigation_all_rules_removed_by_setting_disable', {
        reason,
        count: ruleIds.length
    });
    logOperationSuccess('[iframe-action]', 'Removed embedded navigation header bypass rules', {
        reason,
        count: ruleIds.length
    });
}
/** Removes stale embedded-navigation DNR rules that outlived their temporary sessions. */
async function sweepExpiredEmbeddedNavigationRules(reason: string = 'ttl') {
    const now = Date.now();
    const expiredEntries = Array.from(embeddedNavigationRules.entries()).filter(([, entry]) => {
        return now - entry.lastUsedAtEpochMs > EMBEDDED_NAVIGATION_RULE_TTL_MS;
    });
    if (expiredEntries.length === 0) {
        return 0;
    }
    const expiredRuleIds = expiredEntries.map(([, entry]) => entry.ruleId);
    logOperationAttempt('[iframe-action]', 'sweep expired embedded navigation header bypass rules', {
        reason,
        count: expiredRuleIds.length
    });
    expiredEntries.forEach(([key, entry]) => {
        entry.tokens.forEach((token) => embeddedNavigationTokens.delete(token));
        embeddedNavigationRules.delete(key);
        logEmbeddedNavigationEvent('embedded_navigation_rule_ttl_expired', {
            ruleId: entry.ruleId,
            hostname: entry.hostname,
            tabId: entry.tabId,
            reason
        });
    });
    await updateEmbeddedNavigationSessionRules({
        removeRuleIds: expiredRuleIds
    });
    scheduleEmbeddedNavigationTtlAlarm();
    logOperationSuccess('[iframe-action]', 'Swept expired embedded navigation header bypass rules', {
        reason,
        count: expiredRuleIds.length
    });
    return expiredRuleIds.length;
}
async function reconcileEmbeddedNavigationSessionRules() {
    try {
        logOperationAttempt('[iframe-action]', 'reconcile embedded navigation header bypass rules on startup');
        const rules = await getEmbeddedNavigationSessionRules();
        const orphanRuleIds = rules
            .map((rule) => rule.id)
            .filter((ruleId) => isEmbeddedNavigationRuleId(ruleId));
        if (orphanRuleIds.length > 0) {
            await updateEmbeddedNavigationSessionRules({
                removeRuleIds: orphanRuleIds
            });
        }
        logEmbeddedNavigationEvent('embedded_navigation_rules_reconciled_on_startup', {
            removedCount: orphanRuleIds.length
        });
        logOperationSuccess('[iframe-action]', 'Reconciled embedded navigation header bypass rules on startup', {
            removedCount: orphanRuleIds.length
        });
    }
    catch (error) {
        logOperationWarn('[iframe-action]', 'Failed to reconcile embedded navigation header bypass rules on startup', {
            reason: getErrorMessage(error)
        });
    }
}
async function getEmbeddedNavigationDebugState(): Promise<UnknownRecord> {
    const [enabledRulesets, sessionRules] = await Promise.all([
        getEnabledDnrRulesets(),
        getEmbeddedNavigationSessionRules().catch(() => [])
    ]);
    return {
        activeRules: Array.from(embeddedNavigationRules.values()).map((entry) => ({
            ruleId: entry.ruleId,
            hostname: entry.hostname,
            tabId: entry.tabId,
            refCount: entry.refCount,
            contexts: Array.from(entry.contexts),
            createdAtEpochMs: entry.createdAtEpochMs,
            lastUsedAtEpochMs: entry.lastUsedAtEpochMs,
            isTabScoped: entry.isTabScoped
        })),
        enabledRulesets,
        sessionRuleCountInReservedRange: sessionRules.filter((rule) => isEmbeddedNavigationRuleId(rule.id)).length
    };
}
// Backward-compatible wrappers for older content builds.
async function disableFramingHeaders(url: unknown, sender: chrome.runtime.MessageSender = {}): Promise<number> {
    const response = await prepareEmbeddedNavigation(url, { context: 'legacy_disable_framing_headers' }, sender);
    if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Failed to disable headers');
    }
    return Number.isFinite(Number(response.ruleId)) ? Number(response.ruleId) : 0;
}
function enableFramingHeaders(): Promise<void> {
    return removeAllEmbeddedNavigationRules('legacy_enable_framing_headers');
}
function sendTextExpanderError(
    sendResponse: (response: UnknownRecord) => void,
    requestId: string,
    code: string,
    message: string,
    details: unknown = null
): void {
    lpLog.warn('[LP TextExpander SW] Error response', { requestId, code, details: details || null });
    sendResponse({
        ok: false,
        requestId: requestId || '',
        error: {
            code,
            message,
            details: details || null
        }
    });
}
function sendTextExpanderSuccess(sendResponse: (response: UnknownRecord) => void, requestId: string, result: UnknownRecord | null | undefined): void {
    lpLog.debug('[LP TextExpander SW] Success response', {
        requestId,
        disposition: result?.disposition || null,
        tabId: result?.tabId || null
    });
    sendResponse({
        ok: true,
        requestId: requestId || '',
        result: result || {}
    });
}
function getTabTrailMessageType(request: UnknownRecord): TabTrailMessageType | '' {
    const type = typeof request?.type === 'string' ? request.type : '';
    const action = typeof request?.action === 'string' ? request.action : '';
    const value = type || action;
    return (Object.values(TAB_TRAIL_MESSAGE) as string[]).includes(value) ? value as TabTrailMessageType : '';
}
async function handleOpenUrlFromHere(payload: UnknownRecord, sender: chrome.runtime.MessageSender): Promise<UnknownRecord> {
    const url = normalizeHttpOpenUrl(payload?.url);
    logOperationAttempt('[text-expander]', 'open URL from current tab context', {
        ...getSafeUrlLogDetails(url),
        ...getSenderLogDetails(sender)
    });
    const createProperties: chrome.tabs.CreateProperties = { url };
    const senderTab = sender.tab;
    if (typeof senderTab?.id === 'number' && Number.isInteger(senderTab.id)) {
        createProperties.openerTabId = senderTab.id;
    }
    if (typeof senderTab?.windowId === 'number' && Number.isInteger(senderTab.windowId)) {
        createProperties.windowId = senderTab.windowId;
    }
    const tab = await new Promise<chrome.tabs.Tab>(function (resolve, reject) {
        chrome.tabs.create(createProperties, function (createdTab) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message || 'Failed to open tab.'));
                return;
            }
            resolve(createdTab);
        });
    });
    logOperationSuccess('[text-expander]', 'Opened URL from current tab context', {
        tabId: tab?.id || null,
        ...getSafeUrlLogDetails(url)
    });
    const parentTab = sender.tab;
    if (parentTab && tab) {
        tabTrailService.recordExtensionOpen(parentTab, tab).catch(function (error) {
            lpLog.warn('[LP TabTrail] extension_open_record_failed', {
                senderTabId: parentTab.id || null,
                childTabId: tab.id || null,
                code: error instanceof Error ? error.message : 'unknown'
            });
        });
    }
    return { tabId: tab?.id || null, disposition: 'new_tab' };
}
/** Routes scoped text-expander requests to tab actions, URL opening, and Tab Trail handlers. */
function handleTextExpanderMessage(request: UnknownRecord, sender: chrome.runtime.MessageSender, sendResponse: (response: UnknownRecord) => void): boolean {
    const requestId = typeof request?.requestId === 'string' ? request.requestId : '';
    if (!requestId) {
        sendTextExpanderError(sendResponse, '', 'invalid_request_id', 'Missing requestId.');
        return false;
    }
    const type = typeof request?.type === 'string' ? request.type : '';
    const payload = request?.payload && typeof request.payload === 'object' ? request.payload as UnknownRecord : {};
    lpLog.debug('[LP TextExpander SW] Request received', {
        type,
        requestId,
        senderTabId: sender?.tab?.id || null
    });
    const tabTrailType = getTabTrailMessageType(request);
    if (tabTrailType) {
        initBookmarksDb().then(function () {
            return tabTrailService.handleMessage({ type: tabTrailType, payload }, sender);
        }).then(function (result) {
            if (result && result.ok === false) {
                const errorResult = result as UnknownRecord;
                const code = typeof errorResult.code === 'string' ? errorResult.code : 'tab_trail_failed';
                const message = typeof errorResult.message === 'string' ? errorResult.message : `${FEATURE_SURFACE_NAME_TAB_TRAIL} is unavailable.`;
                sendTextExpanderError(sendResponse, requestId, code, message, errorResult.overlayError || null);
                return;
            }
            sendTextExpanderSuccess(sendResponse, requestId, result as UnknownRecord);
        }).catch(function (error) {
            sendTextExpanderError(sendResponse, requestId, 'tab_trail_failed', error instanceof Error ? error.message : `${FEATURE_SURFACE_NAME_TAB_TRAIL} failed.`);
        });
        return true;
    }
    if (type === 'OPEN_URL_FROM_HERE') {
        initBookmarksDb().then(function () {
            return handleOpenUrlFromHere(payload, sender);
        }).then(function (result) {
            sendTextExpanderSuccess(sendResponse, requestId, result);
        }).catch(function (error) {
            sendTextExpanderError(sendResponse, requestId, 'open_url_from_here_failed', error instanceof Error ? error.message : 'Failed to open URL.');
        });
        return true;
    }
    if (type === 'open_url') {
        const url = typeof payload.url === 'string' ? payload.url.trim() : '';
        const disposition = payload.disposition === 'current_tab' ? 'current_tab' : 'new_tab';
        logOperationAttempt('[text-expander]', 'open URL from background request', {
            disposition,
            ...getSafeUrlLogDetails(url),
            ...getSenderLogDetails(sender)
        });
        if (!url) {
            logOperationWarn('[text-expander]', 'Rejected background URL open because URL is missing', {
                disposition,
                requestId
            });
            sendTextExpanderError(sendResponse, requestId, 'invalid_url', 'Missing URL.');
            return false;
        }
        try {
            new URL(url);
        }
        catch (_error) {
            logOperationWarn('[text-expander]', 'Rejected background URL open because URL is invalid', {
                disposition,
                requestId,
                ...getSafeUrlLogDetails(url)
            });
            sendTextExpanderError(sendResponse, requestId, 'invalid_url', 'Invalid URL.');
            return false;
        }
        try {
            const parsedUrl = new URL(url);
            lpLog.debug('[LP TextExpander SW] open_url validated', {
                requestId,
                disposition,
                origin: parsedUrl.origin,
                pathLen: parsedUrl.pathname.length,
                queryLen: parsedUrl.search.length
            });
        }
        catch (_ignore) {
            // already validated above
        }
        if (disposition === 'current_tab') {
            const senderTabId = sender.tab?.id;
            if (!Number.isInteger(senderTabId)) {
                logOperationWarn('[text-expander]', 'Rejected current-tab URL open because sender tab is unavailable', {
                    requestId,
                    disposition,
                    ...getSafeUrlLogDetails(url)
                });
                sendTextExpanderError(sendResponse, requestId, 'invalid_sender', 'Current tab unavailable.');
                return false;
            }
            chrome.tabs.update(senderTabId, { url }, (tab) => {
                if (chrome.runtime.lastError) {
                    logOperationFailure('[text-expander]', 'Failed to open URL in current tab', chrome.runtime.lastError, {
                        requestId,
                        ...getSafeUrlLogDetails(url)
                    });
                    sendTextExpanderError(sendResponse, requestId, 'tabs_update_failed', chrome.runtime.lastError.message || 'Failed to update tab.');
                    return;
                }
                logOperationSuccess('[text-expander]', 'Opened URL in current tab', {
                    requestId,
                    tabId: tab?.id || senderTabId,
                    ...getSafeUrlLogDetails(url)
                });
                sendTextExpanderSuccess(sendResponse, requestId, {
                    tabId: tab?.id || senderTabId,
                    disposition
                });
            });
            return true;
        }
        const createProperties: chrome.tabs.CreateProperties = { url };
        const senderTab = sender.tab;
        if (typeof senderTab?.id === 'number' && Number.isInteger(senderTab.id)) {
            createProperties.openerTabId = senderTab.id;
        }
        if (typeof senderTab?.windowId === 'number' && Number.isInteger(senderTab.windowId)) {
            createProperties.windowId = senderTab.windowId;
        }
        chrome.tabs.create(createProperties, (tab) => {
            if (chrome.runtime.lastError) {
                logOperationFailure('[text-expander]', 'Failed to open URL in new tab', chrome.runtime.lastError, {
                    requestId,
                    ...getSafeUrlLogDetails(url)
                });
                sendTextExpanderError(sendResponse, requestId, 'tabs_create_failed', chrome.runtime.lastError.message || 'Failed to open tab.');
                return;
            }
            const parentTab = senderTab;
            if (parentTab && tab) {
                initBookmarksDb().then(function () {
                    return tabTrailService.recordExtensionOpen(parentTab, tab);
                }).catch(function (error) {
                    lpLog.warn('[LP TabTrail] extension_open_record_failed', {
                        senderTabId: parentTab.id || null,
                        childTabId: tab.id || null,
                        code: error instanceof Error ? error.message : 'unknown'
                    });
                });
            }
            logOperationSuccess('[text-expander]', 'Opened URL in new tab', {
                requestId,
                tabId: tab?.id || null,
                ...getSafeUrlLogDetails(url)
            });
            sendTextExpanderSuccess(sendResponse, requestId, {
                tabId: tab?.id || null,
                disposition
            });
        });
        return true;
    }
    if (type === 'notify') {
        sendTextExpanderError(sendResponse, requestId, 'not_supported', 'Notifications are not supported.');
        return false;
    }
    sendTextExpanderError(sendResponse, requestId, 'unsupported_type', 'Unsupported message type.');
    return false;
}
// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.action === MINIBUFFER_EDITOR_CAPABILITY_REGISTER) {
        const instanceId = typeof request.instanceId === 'string' ? request.instanceId : '';
        const bootstrapToken = typeof request.bootstrapToken === 'string' ? request.bootstrapToken : '';
        if (!sender.tab?.id || instanceId.length < 32 || bootstrapToken.length < 32) {
            sendResponse({ ok: false, error: 'invalid_minibuffer_capability' });
            return false;
        }
        chrome.storage.session.set({ [minibufferEditorCapabilityStorageKey(instanceId)]: bootstrapToken })
            .then(() => sendResponse({ ok: true }))
            .catch(() => sendResponse({ ok: false, error: 'minibuffer_capability_storage_failed' }));
        return true;
    }
    if (request?.action === MINIBUFFER_EDITOR_CAPABILITY_REVOKE) {
        const instanceId = typeof request.instanceId === 'string' ? request.instanceId : '';
        if (!sender.tab?.id || instanceId.length < 32) {
            sendResponse({ ok: false, error: 'invalid_minibuffer_capability' });
            return false;
        }
        chrome.storage.session.remove(minibufferEditorCapabilityStorageKey(instanceId))
            .then(() => sendResponse({ ok: true }))
            .catch(() => sendResponse({ ok: false, error: 'minibuffer_capability_storage_failed' }));
        return true;
    }
    if (request && request.scope === 'lp_text_expander') {
        return handleTextExpanderMessage(request, sender, sendResponse);
    }
    const tabTrailType = getTabTrailMessageType(request);
    if (tabTrailType) {
        initBookmarksDb().then(function () {
            return tabTrailService.handleMessage({ type: tabTrailType, payload: request?.payload || request || {} }, sender);
        }).then(function (result) {
            sendResponse(result);
        }).catch(function (error) {
            lpLog.warn('[LP TabTrail] message_failed', {
                type: tabTrailType,
                senderTabId: sender?.tab?.id || null,
                code: error instanceof Error ? error.message : 'unknown'
            });
            sendResponse({ ok: false, code: 'tab_trail_failed', message: error instanceof Error ? error.message : `${FEATURE_SURFACE_NAME_TAB_TRAIL} failed.` });
        });
        return true;
    }
    lpLog.debug('[background-runtime] Runtime message received', {
        action: typeof request?.action === 'string' ? request.action : '',
        type: typeof request?.type === 'string' ? request.type : '',
        ...getSenderLogDetails(sender)
    });
    if (request.action === 'prepareEmbeddedNavigation') {
        prepareEmbeddedNavigation(request.url, {
            context: request.context,
            surfaceId: request.surfaceId,
            requestId: request.requestId
        }, sender).then((response) => {
            sendResponse(response);
        }).catch((error) => {
            logEmbeddedNavigationEvent('embedded_navigation_rule_install_failure', {
                context: request.context || '',
                message: error instanceof Error ? error.message : String(error)
            });
            sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
        });
        return true;
    }
    if (request.action === 'releaseEmbeddedNavigation') {
        releaseEmbeddedNavigation(request.navigationToken, request.reason || 'release').then((response) => {
            sendResponse(response);
        }).catch((error) => {
            logEmbeddedNavigationEvent('embedded_navigation_release_failure', {
                token: typeof request.navigationToken === 'string' ? request.navigationToken : '',
                message: error instanceof Error ? error.message : String(error)
            });
            sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
        });
        return true;
    }
    if (request.action === 'debugEmbeddedNavigationState') {
        logOperationAttempt('[background-runtime]', 'read embedded navigation debug state', getSenderLogDetails(sender));
        getEmbeddedNavigationDebugState().then((stateSnapshot) => {
            logOperationSuccess('[background-runtime]', 'Read embedded navigation debug state', {
                activeRuleCount: Array.isArray(stateSnapshot.activeRules) ? stateSnapshot.activeRules.length : 0,
                sessionRuleCountInReservedRange: stateSnapshot.sessionRuleCountInReservedRange || 0
            });
            sendResponse({ success: true, state: stateSnapshot });
        }).catch((error) => {
            logOperationFailure('[background-runtime]', 'Failed to read embedded navigation debug state', error);
            sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
        });
        return true;
    }
    if (request.action === 'disableFramingHeaders') {
        disableFramingHeaders(request.url, sender).then((ruleId) => {
            sendResponse({ success: true, ruleId });
        }).catch((error) => {
            lpLog.error('[LP] Error disabling headers:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep message channel open for async response
    }
    if (request.action === 'enableFramingHeaders') {
        enableFramingHeaders().then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            lpLog.error('[LP] Error enabling headers:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'checkHeaders') {
        // Simple HEAD request to check if we can access the URL
        logOperationAttempt('[background-runtime]', 'check URL header accessibility', getSafeUrlLogDetails(request.url));
        fetch(request.url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => {
            logOperationSuccess('[background-runtime]', 'Checked URL header accessibility', {
                canAccess: true,
                ...getSafeUrlLogDetails(request.url)
            });
            sendResponse({ canAccess: true });
        })
            .catch(() => {
            logOperationWarn('[background-runtime]', 'Checked URL header accessibility and fetch was blocked', {
                canAccess: false,
                ...getSafeUrlLogDetails(request.url)
            });
            sendResponse({ canAccess: false });
        });
        return true;
    }
    if (request.action === 'miniBrowserOpenInNewTab' || request.action === 'openHttpUrlInNewTab') {
        let nextUrl = '';
        const tag = request.action === 'miniBrowserOpenInNewTab' ? '[mini-browser]' : '[background-runtime]';
        logOperationAttempt(tag, 'open HTTP URL in new tab', {
            action: request.action,
            ...getSafeUrlLogDetails(request.url),
            ...getSenderLogDetails(sender)
        });
        try {
            nextUrl = normalizeHttpOpenUrl(request.url);
        }
        catch (error) {
            logOperationWarn(tag, 'Rejected HTTP URL new-tab open request', {
                action: request.action,
                reason: getErrorMessage(error),
                ...getSafeUrlLogDetails(request.url)
            });
            sendResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Invalid URL.'
            });
            return false;
        }
        const createProperties: chrome.tabs.CreateProperties = { url: nextUrl };
        const senderTab = sender.tab;
        if (typeof senderTab?.id === 'number' && Number.isInteger(senderTab.id)) {
            createProperties.openerTabId = senderTab.id;
        }
        if (typeof senderTab?.windowId === 'number' && Number.isInteger(senderTab.windowId)) {
            createProperties.windowId = senderTab.windowId;
        }
        chrome.tabs.create(createProperties, (tab) => {
            if (chrome.runtime.lastError) {
                logOperationFailure(tag, 'Failed to open HTTP URL in new tab', chrome.runtime.lastError, {
                    action: request.action,
                    ...getSafeUrlLogDetails(nextUrl)
                });
                sendResponse({
                    success: false,
                    error: chrome.runtime.lastError.message || 'Failed to open tab.'
                });
                return;
            }
            if (senderTab && tab) {
                initBookmarksDb().then(function () {
                    return tabTrailService.recordExtensionOpen(senderTab, tab);
                }).catch(function (error) {
                    lpLog.warn('[LP TabTrail] extension_open_record_failed', {
                        senderTabId: senderTab.id || null,
                        childTabId: tab.id || null,
                        code: error instanceof Error ? error.message : 'unknown'
                    });
                });
            }
            logOperationSuccess(tag, 'Opened HTTP URL in new tab', {
                action: request.action,
                tabId: tab?.id || null,
                ...getSafeUrlLogDetails(nextUrl)
            });
            sendResponse({
                success: true,
                tabId: tab?.id || null
            });
        });
        return true;
    }
    if (request.action === 'sessionSnapshot.listCurrentWindowTabs') {
        logOperationAttempt('[session-snapshot]', 'list current-window tabs', getSenderLogDetails(sender));
        listSessionSnapshotCurrentWindowTabs().then((tabs) => {
            logOperationSuccess('[session-snapshot]', 'Listed current-window tabs', {
                count: Array.isArray(tabs) ? tabs.length : 0
            });
            sendResponse({ success: true, tabs });
        }).catch((error) => {
            logOperationFailure('[session-snapshot]', 'Failed to list current-window tabs', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'sessionSnapshot.captureSelection') {
        logOperationAttempt('[session-snapshot]', 'capture selected tabs', {
            requestedTabCount: Array.isArray(request.tabIds) ? request.tabIds.length : 0
        });
        captureSessionSnapshotSelection(request.tabIds || [], request.options || {}).then((result) => {
            logOperationSuccess('[session-snapshot]', 'Captured selected tabs', {
                capturedCount: Array.isArray(result?.results) ? result.results.filter((item) => item.state === 'captured').length : 0,
                failedCount: Array.isArray(result?.results) ? result.results.filter((item) => item.state === 'error').length : 0
            });
            sendResponse({ success: true, ...result });
        }).catch((error) => {
            logOperationFailure('[session-snapshot]', 'Failed to capture selected tabs', error, {
                requestedTabCount: Array.isArray(request.tabIds) ? request.tabIds.length : 0
            });
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'sessionSnapshot.closeTabs') {
        logOperationAttempt('[session-snapshot]', 'close selected tabs', {
            requestedTabCount: Array.isArray(request.tabIds) ? request.tabIds.length : 0
        });
        closeSessionSnapshotTabs(request.tabIds || []).then((result) => {
            logOperationSuccess('[session-snapshot]', 'Closed selected tabs', {
                closedCount: Array.isArray(result?.closedTabIds) ? result.closedTabIds.length : 0
            });
            sendResponse({ success: true, ...result });
        }).catch((error) => {
            logOperationFailure('[session-snapshot]', 'Failed to close selected tabs', error, {
                requestedTabCount: Array.isArray(request.tabIds) ? request.tabIds.length : 0
            });
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'pageScreenshot.captureActive') {
        logOperationAttempt('[page-screenshot]', 'capture active page screenshot', {
            hasCompareUrl: typeof request.compareUrlOriginal === 'string' && request.compareUrlOriginal.length > 0
        });
        captureActivePageScreenshot(request.options || {}, request.compareUrlOriginal || '').then((result) => {
            logOperationSuccess('[page-screenshot]', 'Captured active page screenshot', {
                ok: result?.ok !== false,
                hasScreenshot: typeof result?.screenshotDataUrl === 'string' && result.screenshotDataUrl.startsWith('data:image/'),
                source: result?.source || ''
            });
            sendResponse({ success: true, ...result });
        }).catch((error) => {
            logOperationFailure('[page-screenshot]', 'Failed to capture active page screenshot', error);
            sendResponse({ success: false, ok: false, errorCode: 'capture_failed', error: error.message });
        });
        return true;
    }
    if (request.action === 'pageScreenshot.extractDescription') {
        logOperationAttempt('[page-screenshot]', 'extract active page description');
        extractActivePageDescription().then((result) => {
            logOperationSuccess('[page-screenshot]', 'Extracted active page description', {
                ok: result?.ok !== false,
                paragraphCount: Number(result?.paragraphCount || 0),
                textLength: Number(result?.textLength || 0)
            });
            sendResponse({ success: true, ...result });
        }).catch((error) => {
            logOperationFailure('[page-screenshot]', 'Failed to extract active page description', error);
            sendResponse({ success: false, ok: false, errorCode: 'extract_failed', error: error.message });
        });
        return true;
    }
    if (request.action === 'pageContentSelectV2.openSession') {
        openWebContentSelectV2Session(request, sender).then((result) => {
            if (result.ok === true) {
                logOperationSuccess('[web-content-select-v2]', 'Opened selection session', {
                    sessionId: getStringProperty(result, 'sessionId')
                });
            }
            else {
                logOperationWarn('[web-content-select-v2]', 'Refused selection session open request', {
                    reason: result.error || 'open_session_refused'
                });
            }
            sendResponse({ success: result.ok === true, ...result });
        }).catch((error) => {
            logOperationFailure('[web-content-select-v2]', 'Failed to open selection session', error);
            sendResponse({ success: false, ok: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'pageContentSelectV2.cancelSession') {
        cancelWebContentSelectV2Session(request).then((result) => {
            sendResponse({ success: result.ok === true, ...result });
        }).catch((error) => {
            logOperationFailure('[web-content-select-v2]', 'Failed to cancel selection session', error);
            sendResponse({ success: false, ok: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'pageContentSelectV2.extractComposed') {
        handleWebContentSelectV2Extraction(request, sender).then((result) => {
            sendResponse({ success: result.ok === true, ...result });
        }).catch((error) => {
            logOperationFailure('[web-content-select-v2]', 'Failed composed-page extraction', error);
            sendResponse({ success: false, ok: false, error: 'composed_extraction_failed' });
        });
        return true;
    }
    if (request.action === 'pageContentSelectV2.frameOwnerIdentified') {
        const result = handleWebContentSelectV2FrameOwnerIdentified(request, sender);
        sendResponse({ success: result.ok === true, ...result });
        return false;
    }
    if (request.action === 'pageContentSelectV2.overlayEvent') {
        handleWebContentSelectV2OverlayEvent(request, sender).then((result) => {
            sendResponse({ success: result.ok === true, ...result });
        }).catch((error) => {
            logOperationFailure('[web-content-select-v2]', 'Failed to process overlay event', error);
            sendResponse({ success: false, ok: false, error: error.message });
        });
        return true;
    }
    // ============ Bookmark Operations ============
    if (request.action === 'createBookmark') {
        createBookmark(request.url, request.title, request.snippet, request.reason || 'manual', request.userComment || '').then((bookmark) => {
            sendResponse({ success: true, bookmark });
        }).catch((error) => {
            lpLog.error('[LP Bookmarks] Error creating bookmark:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'getBookmarkByUrl') {
        getBookmarkByUrl(request.url).then((bookmark) => {
            sendResponse({ success: true, bookmark });
        }).catch((error) => {
            lpLog.error('[LP Bookmarks] Error getting bookmark:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'updateBookmark') {
        updateBookmark(request.id, request.updates, request.scope).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            lpLog.error('[LP Bookmarks] Error updating bookmark:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'deleteBookmark') {
        deleteBookmark(request.id, request.scope).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            lpLog.error('[LP Bookmarks] Error deleting bookmark:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'getAllBookmarks') {
        getAllBookmarks().then((bookmarks) => {
            sendResponse({ success: true, bookmarks });
        }).catch((error) => {
            lpLog.error('[LP Bookmarks] Error getting all bookmarks:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    // ============ V2 Bookmark Entry Operations ============
    if (request.action === 'getAllBookmarkEntries') {
        Promise.all([getAllBookmarkEntries(), listBookmarkLabels()]).then(([entries, labels]) => {
            sendResponse({ success: true, entries, labels });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error getting entries:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'updateBookmarkEntry') {
        updateBookmarkEntry(request.id, request.updates || {}).then((entry) => {
            sendResponse({ success: true, entry });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error updating entry:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'deleteBookmarkEntry') {
        deleteBookmarkEntry(request.id).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error deleting entry:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'listBookmarkLabels') {
        listBookmarkLabels().then((labels) => {
            sendResponse({ success: true, labels });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error listing labels:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'createBookmarkLabel') {
        createBookmarkLabel(request).then((label) => {
            sendResponse({ success: true, label });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error creating label:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'updateBookmarkLabel') {
        updateBookmarkLabel(request.id, request.updates || {}).then((label) => {
            sendResponse({ success: true, label });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error updating label:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'deleteBookmarkLabel') {
        deleteBookmarkLabel(request.id).then((result) => {
            sendResponse({ success: true, ...result });
        }).catch((error) => {
            lpLog.error('[LP BM V2] Error deleting label:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'getUrlPickerRecords') {
        Promise.all([
            getAllBookmarks(),
            listUrlPickerSignals()
        ]).then(([bookmarks, signals]) => {
            sendResponse({ success: true, bookmarks, signals });
        }).catch((error) => {
            lpLog.error('[LP URL Picker] Error getting picker records:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'recordUrlPickerSelection') {
        upsertUrlPickerSignal(request.url, {
            title: request.title,
            hostname: request.hostname,
            markSelected: true
        }).then((signal) => {
            sendResponse({ success: true, signal });
        }).catch((error) => {
            lpLog.error('[LP URL Picker] Error recording picker selection:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'updateUrlPickerPageMetadata') {
        upsertUrlPickerSignal(request.url, {
            title: request.title,
            hostname: request.hostname,
            faviconDataUrl: request.faviconDataUrl
        }).then((signal) => {
            sendResponse({ success: true, signal });
        }).catch((error) => {
            lpLog.error('[LP URL Picker] Error updating picker metadata:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'toggleUrlPickerBookmark') {
        toggleUrlPickerBookmark(request.url, request.title, request.snippet).then((result) => {
            sendResponse({ success: true, ...result });
        }).catch((error) => {
            lpLog.error('[LP URL Picker] Error toggling picker bookmark:', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    if (request.action === 'recordActivity') {
        logOperationAttempt('[bookmark]', 'record automatic activity bookmark after settings check', getSafeUrlLogDetails(request.url));
        Promise.all([
            lpSettings.getSetting('privacySecurity.enableAutomaticActivityBookmarks'),
            lpSettings.getSetting('bookmarks.enableAutomaticBookmarksCollection')
        ]).then(([privacyEnabled, bookmarksEnabled]) => {
            if (!privacyEnabled || !bookmarksEnabled) {
                logOperationWarn('[bookmark]', 'Skipped automatic activity bookmark recording because collection is disabled', {
                    privacyEnabled,
                    bookmarksEnabled,
                    ...getSafeUrlLogDetails(request.url)
                });
                sendResponse({ success: true, disabled: true });
                return;
            }
            recordActivity(request.url, request.title, request.snippet).then((bookmark) => {
                logOperationSuccess('[bookmark]', 'Recorded automatic activity bookmark after settings check', {
                    bookmarkId: bookmark?.id || '',
                    scope: bookmark?.bookmarkType || bookmark?.createdReason || ''
                });
                sendResponse({ success: true, bookmark });
            }).catch((error) => {
                logOperationFailure('[bookmark]', 'Failed to record automatic activity bookmark after settings check', error, getSafeUrlLogDetails(request.url));
                sendResponse({ success: false, error: error.message });
            });
        }).catch((error) => {
            logOperationFailure('[bookmark]', 'Failed to read automatic activity bookmark settings', error);
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    // ============ End Bookmark Operations ============
});
chrome.alarms.onAlarm.addListener((alarm) => {
    if (!alarm) {
        return;
    }
    if (alarm.name === EMBEDDED_NAVIGATION_TTL_ALARM_NAME) {
        logOperationAttempt('[iframe-action]', 'handle embedded navigation TTL alarm');
        sweepExpiredEmbeddedNavigationRules('alarm').catch((error) => {
            logOperationWarn('[iframe-action]', 'Failed to handle embedded navigation TTL alarm', {
                reason: getErrorMessage(error)
            });
        });
        return;
    }
});
// Open settings page in a new tab when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
    const settingsUrl = chrome.runtime.getURL('dist/settings/settings.html');
    logOperationAttempt('[settings]', 'open settings page from extension action');
    chrome.tabs.create({ url: settingsUrl }, (tab) => {
        if (chrome.runtime.lastError) {
            logOperationFailure('[settings]', 'Failed to open settings page from extension action', chrome.runtime.lastError);
            return;
        }
        logOperationSuccess('[settings]', 'Opened settings page from extension action', {
            tabId: tab?.id || null
        });
    });
});
// Clean up rules when extension is disabled/removed
chrome.runtime.onSuspend.addListener(() => {
    logOperationAttempt('[background-runtime]', 'suspend service worker and clean up header bypass rules');
    enableFramingHeaders();
});
lpLog.info('[background-runtime] Service worker initialized');
