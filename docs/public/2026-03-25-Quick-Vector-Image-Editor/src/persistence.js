import {
    APP_ID,
    DOCUMENT_FORMAT_VERSION,
    DRAFT_WARN_RATIO,
    RELIABLE_DRAFT_BYTES,
    SNAPSHOT_RETENTION,
    STORAGE_STATE
} from "./constants.js";
import { formatBytes } from "./utils.js";
import { validateDraftRecord } from "./validation.js";

export class PersistenceService {
    constructor(logger) {
        this.logger = logger;
        this.db = null;
        this.storageState = STORAGE_STATE.AVAILABLE;
    }

    async init() {
        if (!globalThis.Dexie) {
            this.storageState = STORAGE_STATE.UNAVAILABLE;
            throw new Error("Dexie is not available on the page.");
        }
        const db = new globalThis.Dexie(`${APP_ID}-db`);
        db.version(1).stores({
            drafts: "++id,lineageId,saveSequence,savedAt,version,documentOrigin"
        });
        await db.open();
        this.db = db;
        const estimate = await this.getStorageEstimate();
        if (estimate?.quota && estimate.quota < (RELIABLE_DRAFT_BYTES * 2)) {
            this.storageState = STORAGE_STATE.DEGRADED;
            this.logger.warn("storage.estimate.degraded", {
                quota: estimate.quota,
                usage: estimate.usage
            });
        }
        return this.storageState;
    }

    async getStorageEstimate() {
        if (!navigator.storage?.estimate) {
            return null;
        }
        try {
            return await navigator.storage.estimate();
        } catch (error) {
            this.logger.warn("storage.estimate.failed", { message: String(error) });
            return null;
        }
    }

    async saveDraft(record) {
        if (!this.db) {
            throw new Error("Persistence database is not initialized.");
        }
        const recordId = await this.db.drafts.add({
            ...record,
            appId: APP_ID,
            version: DOCUMENT_FORMAT_VERSION
        });
        await this.trimLineage(record.lineageId);
        return recordId;
    }

    async trimLineage(lineageId) {
        const records = await this.db.drafts.where("lineageId").equals(lineageId).sortBy("saveSequence");
        const stale = records.slice(0, Math.max(0, records.length - SNAPSHOT_RETENTION));
        if (stale.length > 0) {
            await this.db.drafts.bulkDelete(stale.map((record) => record.id));
        }
    }

    async deleteDraftById(recordId) {
        if (!this.db) {
            return;
        }
        await this.db.drafts.delete(recordId);
    }

    async getRestoreCandidates() {
        if (!this.db) {
            return [];
        }
        const records = await this.db.drafts.toArray();
        return records.sort((left, right) => {
            const leftTime = Date.parse(left.savedAt || 0);
            const rightTime = Date.parse(right.savedAt || 0);
            return rightTime - leftTime || right.saveSequence - left.saveSequence;
        });
    }

    async restoreLatestValid(parseEditorSvg, logger) {
        const candidates = await this.getRestoreCandidates();
        const failures = [];
        for (const candidate of candidates) {
            const wrapperErrors = validateDraftRecord(candidate);
            if (wrapperErrors.length > 0) {
                failures.push({
                    id: candidate.id,
                    reason: wrapperErrors.join("; ")
                });
                continue;
            }
            try {
                const document = parseEditorSvg(candidate.svg);
                logger.info("draft.restore.success", {
                    recordId: candidate.id,
                    saveSequence: candidate.saveSequence,
                    savedAt: candidate.savedAt,
                    lineageId: candidate.lineageId
                });
                return {
                    record: candidate,
                    document,
                    failures
                };
            } catch (error) {
                failures.push({
                    id: candidate.id,
                    reason: String(error)
                });
            }
        }
        return {
            record: null,
            document: null,
            failures
        };
    }

    async evaluatePersistenceBudget(projectedBytes) {
        const estimate = await this.getStorageEstimate();
        const result = {
            supported: projectedBytes <= RELIABLE_DRAFT_BYTES,
            state: this.storageState,
            message: "",
            estimate
        };
        if (!estimate?.quota) {
            result.message = projectedBytes > RELIABLE_DRAFT_BYTES
                ? `Projected snapshot ${formatBytes(projectedBytes)} exceeds the app reliability target ${formatBytes(RELIABLE_DRAFT_BYTES)}.`
                : `Projected snapshot ${formatBytes(projectedBytes)} is within the app reliability target.`;
            return result;
        }
        const remaining = estimate.quota - (estimate.usage ?? 0);
        if (projectedBytes > RELIABLE_DRAFT_BYTES || projectedBytes > estimate.quota * DRAFT_WARN_RATIO || projectedBytes > remaining) {
            result.supported = false;
            result.state = STORAGE_STATE.DEGRADED;
            result.message = `Projected snapshot ${formatBytes(projectedBytes)} is likely to exceed reliable local draft persistence. Remaining quota estimate: ${formatBytes(remaining)}.`;
        } else {
            result.message = `Projected snapshot ${formatBytes(projectedBytes)} fits current quota estimate. Remaining quota estimate: ${formatBytes(remaining)}.`;
        }
        return result;
    }
}
