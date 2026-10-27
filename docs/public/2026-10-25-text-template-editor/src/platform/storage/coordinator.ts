/** Adapter selection does not migrate data. Working records retain their origin. */
import { decodeDocument } from "../../features/documents/model";
import type { DocumentRecord } from "../../features/documents/model";
import { decodeAuthoringDraft } from "../../features/template-authoring/model";
import type { AuthoringDraft } from "../../features/template-authoring/model";
import type { StorageMode } from "../../features/settings/schema";
import { AppError, isRecord } from "../errors";
import { logger } from "../diagnostics/logger";
import type { StoredRecord } from "../../features/documents/model";
import { WorkerClient } from "../messaging/worker-client";
import { LocalRepository } from "./local-repository";
import { MemoryRepository } from "./repository";
import type { Repository } from "./repository";
export class StorageCoordinator {
  readonly worker = new WorkerClient();
  private documentStores: Record<StorageMode, Repository<DocumentRecord>>;
  private authoringStores: Record<StorageMode, Repository<AuthoringDraft>>;
  private channel =
    typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("gtl.content-changes.v1");
  private listeners = new Set<(scope: "documents" | "authoring", mode: StorageMode) => void>();
  warning = "";
  constructor() {
    this.documentStores = {
      indexeddb: {
        list: async () =>
          this.decodeList(await this.worker.request("documents.list", null), decodeDocument),
        get: async (id) => {
          const value = await this.worker.request("documents.get", { id });
          return value === undefined ? undefined : decodeDocument(value);
        },
        save: async (record, expectedRevision) =>
          decodeDocument(await this.worker.request("documents.save", { record, expectedRevision })),
        delete: async (id, expectedRevision) => {
          await this.worker.request("documents.delete", { id, expectedRevision });
        },
      },
      local: new LocalRepository("gtl.documents.v1", decodeDocument),
      memory: new MemoryRepository(),
    };
    this.authoringStores = {
      indexeddb: {
        list: async () =>
          this.decodeList(await this.worker.request("authoring.list", null), decodeAuthoringDraft),
        get: async (id) => {
          const value = await this.worker.request("authoring.get", { id });
          return value === undefined ? undefined : decodeAuthoringDraft(value);
        },
        save: async (record, expectedRevision) =>
          decodeAuthoringDraft(
            await this.worker.request("authoring.save", { record, expectedRevision }),
          ),
        delete: async (id, expectedRevision) => {
          await this.worker.request("authoring.delete", { id, expectedRevision });
        },
      },
      local: new LocalRepository("gtl.authoring.v1", decodeAuthoringDraft),
      memory: new MemoryRepository(),
    };
    for (const mode of ["indexeddb", "local", "memory"] as const) {
      this.documentStores[mode] = this.observed(this.documentStores[mode], "documents", mode);
      this.authoringStores[mode] = this.observed(this.authoringStores[mode], "authoring", mode);
    }
    this.channel?.addEventListener("message", (event: MessageEvent<unknown>) => {
      const value = event.data;
      if (
        !isRecord(value) ||
        (value.scope !== "documents" && value.scope !== "authoring") ||
        (value.mode !== "indexeddb" && value.mode !== "local")
      )
        return;
      for (const listener of this.listeners) listener(value.scope, value.mode);
    });
  }
  subscribe(listener: (scope: "documents" | "authoring", mode: StorageMode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private observed<T extends StoredRecord>(
    repository: Repository<T>,
    scope: "documents" | "authoring",
    mode: StorageMode,
  ): Repository<T> {
    const notify = () => {
      if (mode === "memory") return;
      try {
        this.channel?.postMessage({ scope, mode });
      } catch {
        this.warning =
          "Changes were saved, but could not be announced to other tabs. Refocus or reload those tabs to refresh.";
        logger.warn("storage.notification.failed", { storageMode: mode });
      }
    };
    return {
      list: () => repository.list(),
      get: (id) => repository.get(id),
      save: async (record, revision) => {
        const saved = await repository.save(record, revision);
        notify();
        return saved;
      },
      delete: async (id, revision) => {
        await repository.delete(id, revision);
        notify();
      },
    };
  }
  private decodeList<T>(value: unknown, decode: (value: unknown) => T): T[] {
    if (!Array.isArray(value))
      throw new AppError("INVALID_RESPONSE", "Storage returned an invalid collection.");
    return value.map(decode);
  }
  documents(mode: StorageMode): Repository<DocumentRecord> {
    return this.documentStores[mode];
  }
  authoring(mode: StorageMode): Repository<AuthoringDraft> {
    return this.authoringStores[mode];
  }
}
