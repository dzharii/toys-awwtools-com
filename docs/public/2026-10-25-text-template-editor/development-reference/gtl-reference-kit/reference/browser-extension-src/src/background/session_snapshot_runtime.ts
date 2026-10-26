import { isSupportedHttpUrl } from '../content/atools/_shared/url_picker_canonical.js';

type SessionSnapshotImageFormat = 'jpeg' | 'png';

interface SessionSnapshotCaptureOptions {
    imageFormat: SessionSnapshotImageFormat;
    jpegQuality: number;
    settleDelayMs: number;
    throttleMs: number;
}

interface SessionSnapshotDescriptionPayload {
    description: string;
    descriptionMarkdown: string;
    descriptionMode: 'article_markdown' | 'fallback_text' | 'empty';
    descriptionStage: string;
    diagnostics: Record<string, unknown>;
}

type SessionSnapshotCaptureResult = Record<string, unknown> & { state?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object';
}

const DEFAULT_CAPTURE_OPTIONS: SessionSnapshotCaptureOptions = {
    imageFormat: 'jpeg',
    jpegQuality: 80,
    settleDelayMs: 200,
    throttleMs: 600
};

const MAX_DELAY_MS = 5000;
const DESCRIPTION_ATTEMPT_TIMEOUT_MS = 1800;
const DESCRIPTION_RETRY_DELAYS_MS = [250, 500];
const SESSION_SNAPSHOT_DESCRIPTION_INJECTION_FILE_SETS: Array<{ pathMode: 'root_dist' | 'dist_relative'; files: string[] }> = [
    {
        pathMode: 'root_dist',
        files: [
            'dist/settings/settings_runtime.js',
            'dist/content/libs/readability-0.6.0.js',
            'dist/content/libs/readability-readerable-0.6.0.js',
            'dist/content/libs/turndown-7.0.0.js',
            'dist/content/session_snapshot_description.js'
        ]
    },
    {
        pathMode: 'dist_relative',
        files: [
            'settings/settings_runtime.js',
            'content/libs/readability-0.6.0.js',
            'content/libs/readability-readerable-0.6.0.js',
            'content/libs/turndown-7.0.0.js',
            'content/session_snapshot_description.js'
        ]
    }
];

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function createEmptyDescriptionPayload() {
    return {
        description: '',
        descriptionMarkdown: '',
        descriptionMode: 'empty' as const,
        descriptionStage: 'empty',
        diagnostics: {}
    };
}

function logSessionSnapshotWarning(message: string, context: Record<string, unknown> | undefined = {}) {
    if (globalThis.lpLog && typeof globalThis.lpLog.warn === 'function') {
        globalThis.lpLog.warn(message, context);
        return;
    }
    console.warn(message, context);
}

function logSessionSnapshotInfo(message: string, context: Record<string, unknown> | undefined = {}) {
    if (globalThis.lpLog && typeof globalThis.lpLog.info === 'function') {
        globalThis.lpLog.info(message, context);
        return;
    }
    console.info(message, context);
}

function coerceBoundedInteger(value: unknown, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    const rounded = Math.round(parsed);
    return Math.max(0, Math.min(MAX_DELAY_MS, rounded));
}

function normalizeImageFormat(value: unknown): SessionSnapshotImageFormat {
    return value === 'png' ? 'png' : 'jpeg';
}

function normalizeJpegQuality(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_CAPTURE_OPTIONS.jpegQuality;
    }
    return Math.max(1, Math.min(100, Math.round(parsed)));
}

/** Normalizes untrusted snapshot options into bounded capture timings and image settings. */
export function normalizeSessionSnapshotCaptureOptions(rawOptions: unknown): SessionSnapshotCaptureOptions {
    const options = isRecord(rawOptions) ? rawOptions : {};
    const imageFormat = normalizeImageFormat(options.imageFormat);
    return {
        imageFormat,
        jpegQuality: normalizeJpegQuality(options.jpegQuality),
        settleDelayMs: coerceBoundedInteger(options.settleDelayMs, DEFAULT_CAPTURE_OPTIONS.settleDelayMs),
        throttleMs: coerceBoundedInteger(options.throttleMs, DEFAULT_CAPTURE_OPTIONS.throttleMs)
    };
}

/** Applies the product URL policy for tabs that can be included in a session snapshot. */
export function isSupportedSessionSnapshotUrl(rawUrl: unknown): boolean {
    // Product wrapper around shared URL policy; keep user-facing messages local.
    return isSupportedHttpUrl(rawUrl);
}

/** Converts snapshot URL policy failures into a user-facing tab rejection reason. */
export function getUnsupportedSessionSnapshotReason(rawUrl: unknown): string {
    const candidate = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!candidate) {
        return 'Missing tab URL.';
    }
    try {
        if (isSupportedHttpUrl(candidate)) {
            return '';
        }
        return 'Cannot capture this type of page.';
    }
    catch {
        return 'Invalid tab URL.';
    }
}

/** Sanitizes cross-process tab id payloads before capture or close operations. */
export function normalizeSessionSnapshotTabIds(rawTabIds: unknown): number[] {
    const source = Array.isArray(rawTabIds) ? rawTabIds : [];
    const deduped = new Set<number>();
    for (const item of source) {
        if (!Number.isInteger(item) || item <= 0) {
            continue;
        }
        deduped.add(item);
    }
    return Array.from(deduped);
}

export function normalizeSessionSnapshotCloseTabIds(rawTabIds: unknown) {
    return normalizeSessionSnapshotTabIds(rawTabIds);
}

/**
 * Classify description extraction runtime errors into deterministic categories.
 */
export function classifySessionSnapshotDescriptionError(error: unknown): 'receiver_unavailable' | 'timeout' | 'runtime_error' {
    const message = String(error instanceof Error ? error.message : error || '').toLowerCase();
    if (message.includes('description_timeout')) {
        return 'timeout';
    }
    if (message.includes('receiving end does not exist') ||
        message.includes('could not establish connection') ||
        message.includes('message port closed')) {
        return 'receiver_unavailable';
    }
    return 'runtime_error';
}

/**
 * Classify preflight injection failures for deterministic diagnostics.
 */
export function classifySessionSnapshotPreflightError(error: unknown): 'preflight_tab_unavailable' | 'preflight_tab_unsupported' | 'preflight_inject_failed' | 'unsupported_page' | 'permission_denied' | 'tab_not_found' | 'runtime_error' {
    const message = String(error instanceof Error ? error.message : error || '').toLowerCase();
    if (message.includes('no tab with id') || message.includes('tab not found')) {
        return 'preflight_tab_unavailable';
    }
    if (message.includes('cannot access contents of url') ||
        message.includes('extensions gallery cannot be scripted') ||
        message.includes('the extensions gallery cannot be scripted') ||
        message.includes('cannot access a chrome://') ||
        message.includes('cannot access a chrome-extension://')) {
        return 'preflight_tab_unsupported';
    }
    return 'preflight_inject_failed';
}

/**
 * Classify close-tab failures to keep batch behavior deterministic.
 */
export function classifySessionSnapshotCloseTabError(error: unknown): 'tab_not_found' | 'runtime_error' {
    const message = String(error instanceof Error ? error.message : error || '').toLowerCase();
    if (message.includes('no tab with id') || message.includes('tab not found')) {
        return 'tab_not_found';
    }
    return 'runtime_error';
}

/**
 * Expose deterministic injection file candidates for diagnostics and tests.
 */
export function getSessionSnapshotDescriptionInjectionFileSets(): Array<{ pathMode: 'root_dist' | 'dist_relative'; files: string[] }> {
    return SESSION_SNAPSHOT_DESCRIPTION_INJECTION_FILE_SETS.map((candidate) => ({
        pathMode: candidate.pathMode,
        files: [...candidate.files]
    }));
}

/**
 * Normalize arbitrary extraction payload into a strict description object.
 */
export function normalizeSessionSnapshotDescriptionPayload(response: unknown): SessionSnapshotDescriptionPayload {
    if (!isRecord(response)) {
        return createEmptyDescriptionPayload();
    }
    const description = typeof response.description === 'string' ? response.description : '';
    const descriptionMarkdown = typeof response.descriptionMarkdown === 'string'
        ? response.descriptionMarkdown
        : '';
    const descriptionMode = response.extractionMode === 'article_markdown' || response.extractionMode === 'fallback_text'
        ? response.extractionMode
        : 'empty';
    const descriptionStage = typeof response.extractionStage === 'string'
        ? response.extractionStage
        : 'empty';
    const diagnostics = isRecord(response.diagnostics)
        ? response.diagnostics
        : {};
    return {
        description,
        descriptionMarkdown,
        descriptionMode,
        descriptionStage,
        diagnostics
    };
}

function toTabSummary(tab: chrome.tabs.Tab) {
    if (!tab || !Number.isInteger(tab.id) || !Number.isInteger(tab.windowId)) {
        return null;
    }
    const url = typeof tab.url === 'string' ? tab.url : '';
    const unsupportedReason = getUnsupportedSessionSnapshotReason(url);
    return {
        tabId: tab.id,
        windowId: tab.windowId,
        title: typeof tab.title === 'string' ? tab.title : '',
        url,
        supported: unsupportedReason.length === 0,
        unsupportedReason
    };
}

/** Returns current-window tab summaries with capture support already classified. */
export async function listCurrentWindowTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const summaries = [];
    for (const tab of tabs) {
        const summary = toTabSummary(tab);
        if (summary) {
            summaries.push(summary);
        }
    }
    return summaries;
}

async function getDescriptionExtractionTabDiagnostics(tabId: number) {
    try {
        const tab = await chrome.tabs.get(tabId);
        const url = typeof tab?.url === 'string' ? tab.url : '';
        const tabStatus = typeof tab?.status === 'string' ? tab.status : 'unknown';
        return {
            tabId,
            url,
            tabStatus,
            unsupportedReason: getUnsupportedSessionSnapshotReason(url),
            discarded: tab?.discarded === true
        };
    }
    catch (error) {
        return {
            tabId,
            url: '',
            tabStatus: 'unavailable',
            unsupportedReason: '',
            discarded: false,
            tabLookupError: String(error instanceof Error ? error.message : error || '')
        };
    }
}

/**
 * Ensure extractor prerequisites are injected before any sendMessage attempt.
 */
async function ensureDescriptionExtractorReady(tabId: number) {
    const startedAt = Date.now();
    const tabDiagnostics = await getDescriptionExtractionTabDiagnostics(tabId);

    if (tabDiagnostics.unsupportedReason) {
        return {
            ok: false,
            preflight: {
                tabId,
                url: tabDiagnostics.url,
                tabStatus: tabDiagnostics.tabStatus,
                unsupportedReason: tabDiagnostics.unsupportedReason,
                elapsedMs: Date.now() - startedAt,
                errorCode: 'preflight_tab_unsupported'
            }
        };
    }

    const pathErrors: Array<{ pathMode: string; message: string; errorCode: string }> = [];
    const candidates = getSessionSnapshotDescriptionInjectionFileSets();

    for (const candidate of candidates) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: candidate.files
            });
            return {
                ok: true,
                preflight: {
                    tabId,
                    url: tabDiagnostics.url,
                    tabStatus: tabDiagnostics.tabStatus,
                    pathMode: candidate.pathMode,
                    pathErrors,
                    elapsedMs: Date.now() - startedAt
                }
            };
        }
        catch (error) {
            const errorMessage = String(error instanceof Error ? error.message : error || '');
            const errorCode = classifySessionSnapshotPreflightError(error);
            pathErrors.push({
                pathMode: candidate.pathMode,
                message: errorMessage,
                errorCode
            });
            if (errorCode === 'preflight_tab_unavailable' || errorCode === 'preflight_tab_unsupported') {
                return {
                    ok: false,
                    preflight: {
                        tabId,
                        url: tabDiagnostics.url,
                        tabStatus: tabDiagnostics.tabStatus,
                        pathMode: candidate.pathMode,
                        pathErrors,
                        elapsedMs: Date.now() - startedAt,
                        errorCode,
                        lastErrorMessage: errorMessage
                    }
                };
            }
        }
    }

    return {
        ok: false,
        preflight: {
            tabId,
            url: tabDiagnostics.url,
            tabStatus: tabDiagnostics.tabStatus,
            pathErrors,
            elapsedMs: Date.now() - startedAt,
            errorCode: 'preflight_inject_failed',
            lastErrorMessage: pathErrors.at(-1)?.message || ''
        }
    };
}

async function extractDescription(tabId: number) {
    const timeoutToken = Symbol('session_snapshot_description_timeout');
    const startedAt = Date.now();
    const attempts = DESCRIPTION_RETRY_DELAYS_MS.length + 1;
    const errorCodes: string[] = [];
    let lastErrorMessage = '';
    let preflight = await ensureDescriptionExtractorReady(tabId);
    const preflightHistory = [preflight.preflight];

    if (!preflight.ok) {
        logSessionSnapshotWarning('[LP Session Snapshot] Description extraction preflight failed.', {
            ...preflight.preflight,
            tabId
        });
        return {
            ...createEmptyDescriptionPayload(),
            descriptionWarning: 'Description unavailable.',
            descriptionDebug: {
                stage: 'preflight_failure',
                mode: 'empty',
                attempts: 0,
                errorCodes: [String(preflight.preflight.errorCode || 'preflight_inject_failed')],
                elapsedMs: Date.now() - startedAt,
                lastErrorMessage: String(preflight.preflight.lastErrorMessage || ''),
                preflight: preflight.preflight,
                preflightHistory
            }
        };
    }

    for (let attemptIndex = 0; attemptIndex < attempts; attemptIndex += 1) {
        try {
            const response = await Promise.race([
                chrome.tabs.sendMessage(tabId, {
                    action: 'sessionSnapshot.extractDescription'
                }),
                sleep(DESCRIPTION_ATTEMPT_TIMEOUT_MS).then(() => timeoutToken)
            ]);
            if (response === timeoutToken) {
                throw new Error('description_timeout');
            }

            const payload = normalizeSessionSnapshotDescriptionPayload(response);
            const elapsedMs = Date.now() - startedAt;
            const descriptionWarning = payload.descriptionMode === 'empty'
                ? 'Description unavailable.'
                : '';

            if (descriptionWarning) {
                logSessionSnapshotWarning('[LP Session Snapshot] Description extraction returned empty payload.', {
                    tabId,
                    url: preflight.preflight.url,
                    tabStatus: preflight.preflight.tabStatus,
                    attempt: attemptIndex + 1,
                    stage: payload.descriptionStage,
                    elapsedMs,
                    diagnostics: payload.diagnostics,
                    preflight: preflight.preflight
                });
            }
            else if (payload.descriptionMode === 'fallback_text') {
                logSessionSnapshotInfo('[LP Session Snapshot] Description extraction used fallback text.', {
                    tabId,
                    url: preflight.preflight.url,
                    tabStatus: preflight.preflight.tabStatus,
                    attempt: attemptIndex + 1,
                    stage: payload.descriptionStage,
                    elapsedMs,
                    preflight: preflight.preflight
                });
            }

            return {
                ...payload,
                descriptionWarning,
                descriptionDebug: {
                    stage: payload.descriptionStage,
                    mode: payload.descriptionMode,
                    attempts: attemptIndex + 1,
                    errorCodes,
                    elapsedMs,
                    diagnostics: payload.diagnostics,
                    preflight: preflight.preflight,
                    preflightHistory
                }
            };
        }
        catch (error) {
            const errorCode = classifySessionSnapshotDescriptionError(error);
            errorCodes.push(errorCode);
            lastErrorMessage = String(error instanceof Error ? error.message : error || '');
            logSessionSnapshotWarning('[LP Session Snapshot] Description extraction attempt failed.', {
                tabId,
                url: preflight.preflight.url,
                tabStatus: preflight.preflight.tabStatus,
                attempt: attemptIndex + 1,
                attempts,
                errorCode,
                lastErrorMessage,
                preflight: preflight.preflight
            });

            if (attemptIndex < DESCRIPTION_RETRY_DELAYS_MS.length) {
                if (errorCode === 'receiver_unavailable') {
                    const reinjection = await ensureDescriptionExtractorReady(tabId);
                    preflight = reinjection;
                    preflightHistory.push(reinjection.preflight);
                    if (!reinjection.ok) {
                        logSessionSnapshotWarning('[LP Session Snapshot] Description extraction reinjection failed.', {
                            attempt: attemptIndex + 1,
                            ...reinjection.preflight,
                            tabId
                        });
                    }
                }
                await sleep(DESCRIPTION_RETRY_DELAYS_MS[attemptIndex] ?? 0);
                continue;
            }
        }
    }

    const elapsedMs = Date.now() - startedAt;
    logSessionSnapshotWarning('[LP Session Snapshot] Description extraction failed after retries.', {
        tabId,
        url: preflight.preflight.url,
        tabStatus: preflight.preflight.tabStatus,
        elapsedMs,
        attempts,
        errorCodes,
        lastErrorMessage,
        preflightHistory
    });
    return {
        ...createEmptyDescriptionPayload(),
        descriptionWarning: 'Description unavailable.',
        descriptionDebug: {
            stage: 'runtime_failure',
            mode: 'empty',
            attempts,
            errorCodes,
            elapsedMs,
            lastErrorMessage,
            preflight: preflight.preflight,
            preflightHistory
        }
    };
}

/** Coordinates tab activation, screenshot capture, description extraction, and active-tab restore. */
export async function captureSelection(rawTabIds: number[], rawOptions: unknown) {
    const options = normalizeSessionSnapshotCaptureOptions(rawOptions);
    const selectedTabIds = normalizeSessionSnapshotTabIds(rawTabIds);
    const results: SessionSnapshotCaptureResult[] = [];

    if (selectedTabIds.length === 0) {
        return {
            options,
            results
        };
    }

    logSessionSnapshotInfo('[session-snapshot] Attempting to capture tab selection', { tabCount: selectedTabIds.length });

    const tabsInWindow = await chrome.tabs.query({ currentWindow: true });
    const tabById = new Map<number, chrome.tabs.Tab>();
    let originalActiveTabId: number | null = null;

    for (const tab of tabsInWindow) {
        if (Number.isInteger(tab.id)) {
            tabById.set(tab.id as number, tab);
        }
        if (tab.active && Number.isInteger(tab.id)) {
            originalActiveTabId = tab.id as number;
        }
    }

    const imageCaptureDetails: chrome.extensionTypes.ImageDetails = options.imageFormat === 'png'
        ? { format: 'png' }
        : { format: 'jpeg', quality: options.jpegQuality };

    try {
        for (const tabId of selectedTabIds) {
            const tab = tabById.get(tabId);
            if (!tab || !Number.isInteger(tab.windowId)) {
                results.push({
                    tabId,
                    state: 'error',
                    stateMessage: 'Tab not found in current window.'
                });
                continue;
            }

            const urlOriginal = typeof tab.url === 'string' ? tab.url : '';
            const unsupportedReason = getUnsupportedSessionSnapshotReason(urlOriginal);
            if (unsupportedReason) {
                results.push({
                    tabId,
                    windowId: tab.windowId,
                    title: typeof tab.title === 'string' ? tab.title : '',
                    urlOriginal,
                    state: 'skipped',
                    stateMessage: unsupportedReason
                });
                continue;
            }

            try {
                await chrome.tabs.update(tabId, { active: true });
                await sleep(options.settleDelayMs);

                const screenshotDataUrl = await new Promise<string>((resolve, reject) => {
                    chrome.tabs.captureVisibleTab(tab.windowId as number, imageCaptureDetails, (dataUrl) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message || 'capture_failed'));
                            return;
                        }
                        resolve(dataUrl);
                    });
                });
                await sleep(options.throttleMs);

                const descriptionResult = await extractDescription(tabId);

                results.push({
                    tabId,
                    windowId: tab.windowId,
                    title: typeof tab.title === 'string' ? tab.title : '',
                    urlOriginal,
                    description: descriptionResult.description,
                    descriptionMarkdown: descriptionResult.descriptionMarkdown,
                    descriptionMode: descriptionResult.descriptionMode,
                    descriptionWarning: descriptionResult.descriptionWarning,
                    descriptionDebug: descriptionResult.descriptionDebug,
                    screenshotDataUrl,
                    screenshotExt: options.imageFormat === 'png' ? 'png' : 'jpeg',
                    state: 'captured',
                    stateMessage: ''
                });
            }
            catch (error) {
                results.push({
                    tabId,
                    windowId: tab.windowId,
                    title: typeof tab.title === 'string' ? tab.title : '',
                    urlOriginal,
                    state: 'error',
                    stateMessage: error instanceof Error ? error.message : 'Capture failed.'
                });
            }
        }
    }
    finally {
        if (Number.isInteger(originalActiveTabId)) {
            try {
                await new Promise<void>((resolve, reject) => {
                    chrome.tabs.update(originalActiveTabId as number, { active: true }, () => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message || 'tabs_update_failed'));
                            return;
                        }
                        resolve();
                    });
                });
            }
            catch {
                // Ignore restore errors.
            }
        }
    }

    const captured = results.filter((r) => r.state === 'captured').length;
    const skipped = results.filter((r) => r.state === 'skipped').length;
    const failed = results.filter((r) => r.state === 'error').length;
    logSessionSnapshotInfo('[session-snapshot] Tab selection captured', { captured, skipped, failed });

    return {
        options,
        results
    };
}

/** Closes selected tabs as a batch while reporting per-tab failures without aborting the rest. */
export async function closeTabs(rawTabIds: number[]) {
    const requestedTabIds = normalizeSessionSnapshotCloseTabIds(rawTabIds);
    const closedTabIds: number[] = [];
    const alreadyClosedTabIds: number[] = [];
    const failed: Array<{ tabId: number; errorCode: string; message: string }> = [];

    for (const tabId of requestedTabIds) {
        try {
            await new Promise<void>((resolve, reject) => {
                chrome.tabs.remove(tabId, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message || 'tabs_remove_failed'));
                        return;
                    }
                    resolve();
                });
            });
            closedTabIds.push(tabId);
        }
        catch (error) {
            const errorCode = classifySessionSnapshotCloseTabError(error);
            const message = String(error instanceof Error ? error.message : error || 'Failed to close tab.');
            if (errorCode === 'tab_not_found') {
                alreadyClosedTabIds.push(tabId);
                logSessionSnapshotInfo('[LP Session Snapshot] Tab already unavailable during close; treating as closed.', {
                    tabId,
                    errorCode,
                    message
                });
                continue;
            }
            failed.push({
                tabId,
                errorCode,
                message
            });
            logSessionSnapshotWarning('[LP Session Snapshot] Failed to close tab; continuing with remaining tabs.', {
                tabId,
                errorCode,
                message
            });
        }
    }

    logSessionSnapshotInfo('[LP Session Snapshot] Close tabs completed.', {
        requestedCount: requestedTabIds.length,
        closedCount: closedTabIds.length,
        alreadyClosedCount: alreadyClosedTabIds.length,
        failedCount: failed.length,
        failedTabIds: failed.map((item) => item.tabId)
    });

    return {
        ok: failed.length === 0,
        requestedTabIds,
        closedTabIds,
        alreadyClosedTabIds,
        failed
    };
}
