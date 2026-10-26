/** Adapter selection does not migrate data. Working records retain their origin. */
import { decodeDocument } from "../../features/documents/model";
import type { DocumentRecord } from "../../features/documents/model";
import { decodeAuthoringDraft } from "../../features/template-authoring/model";
import type { AuthoringDraft } from "../../features/template-authoring/model";
import type { StorageMode } from "../../features/settings/schema";
import { AppError } from "../errors";
import { WorkerClient } from "../messaging/worker-client";
import { LocalRepository } from "./local-repository";
import { MemoryRepository } from "./repository";
import type { Repository } from "./repository";
export class StorageCoordinator {
  readonly worker = new WorkerClient();
  private documentStores: Record<StorageMode, Repository<DocumentRecord>>;
  private authoringStores: Record<StorageMode, Repository<AuthoringDraft>>;
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
