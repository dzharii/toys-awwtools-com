/**
 * Owns immediate document state, related-version navigation, and autosave.
 * Writes are serialized per identity. A completed snapshot advances the revision
 * but cannot mark edits made during the write as saved.
 */
import type { TemplateDefinition } from "../templates/model";
import { placeholderNames } from "../templates/model";
import type { StorageMode } from "../settings/schema";
import { AppError, errorMessage } from "../../platform/errors";
import { logger } from "../../platform/diagnostics/logger";
import type { Repository } from "../../platform/storage/repository";
import { hasMeaningfulUserInput } from "./model";
import type { DocumentRecord, WorkingDocument } from "./model";
export type DocumentChange = "navigation" | "content" | "state";
export class DocumentService {
  active: WorkingDocument | null = null;
  readonly working = new Map<string, WorkingDocument>();
  mode: StorageMode = "indexeddb";
  loadError = "";
  private listeners = new Set<(change: DocumentChange) => void>();
  private inFlight = new Map<WorkingDocument, Promise<void>>();
  private timer: ReturnType<typeof setInterval> | undefined;
  constructor(
    private repository: (mode: StorageMode) => Repository<DocumentRecord>,
    private now = () => new Date().toISOString(),
    private id: () => string = () => crypto.randomUUID(),
  ) {}
  subscribe(listener: (change: DocumentChange) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private emit(change: DocumentChange): void {
    for (const listener of this.listeners) listener(change);
  }
  private key(mode: StorageMode, id: string): string {
    return `${mode}:${id}`;
  }
  get documents(): WorkingDocument[] {
    return [...this.working.values()]
      .filter((item) => item.record.revision > 0 || hasMeaningfulUserInput(item.record))
      .sort((a, b) => b.record.updatedAt.localeCompare(a.record.updatedAt));
  }
  async load(mode: StorageMode): Promise<void> {
    this.mode = mode;
    try {
      const records = await this.repository(mode).list();
      // Do not let a slow old-store load replace the user's current store choice.
      if (this.mode !== mode) return;
      for (const record of records) {
        const key = this.key(mode, record.id);
        const existing = this.working.get(key);
        if (!existing) this.working.set(key, this.fromRecord(record, mode));
        else if (existing.status === "saved") existing.record = record;
      }
      this.loadError = "";
    } catch (error) {
      if (this.mode !== mode) return;
      this.loadError = errorMessage(error);
      logger.error("documents.load.failed", { storageMode: mode });
    }
    this.emit("state");
  }
  private fromRecord(record: DocumentRecord, mode: StorageMode): WorkingDocument {
    return {
      record,
      origin: mode,
      status: "saved",
      error: "",
      changeId: 0,
      activePlaceholder:
        placeholderNames(
          record.templateSnapshot.versions.find(
            (version) => version.id === record.templateVersionId,
          )!,
        )[0] ?? "",
    };
  }
  configureAutosave(seconds: number): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.flushAll();
    }, seconds * 1000);
  }
  dispose(): void {
    clearInterval(this.timer);
  }
  create(
    templateId: string,
    template: TemplateDefinition,
    versionId = template.versions[0]!.id,
    groupId = this.id(),
  ): void {
    const version = template.versions.find((item) => item.id === versionId);
    if (!version)
      throw new AppError("VERSION_NOT_FOUND", "The selected writing style is not available.");
    if (this.active) void this.flush(this.active);
    const timestamp = this.now();
    const record: DocumentRecord = {
      id: this.id(),
      title: version.name,
      templateId,
      templateVersionId: versionId,
      templateSnapshot: structuredClone(template),
      relatedGroupId: groupId,
      answers: {},
      createdAt: timestamp,
      updatedAt: timestamp,
      revision: 0,
    };
    const working: WorkingDocument = {
      record,
      origin: this.mode,
      status: "temporary",
      changeId: 0,
      error: "",
      activePlaceholder: placeholderNames(version)[0] ?? "",
    };
    this.working.set(this.key(working.origin, record.id), working);
    this.active = working;
    this.emit("navigation");
  }
  select(working: WorkingDocument): void {
    if (this.active && this.active !== working) void this.flush(this.active);
    this.active = working;
    this.emit("navigation");
  }
  switchVersion(versionId: string): void {
    const current = this.active;
    if (!current || current.origin !== this.mode) return;
    const related = [...this.working.values()].find(
      (item) =>
        item.origin === current.origin &&
        item.record.relatedGroupId === current.record.relatedGroupId &&
        item.record.templateVersionId === versionId,
    );
    if (related) this.select(related);
    else
      this.create(
        current.record.templateId,
        current.record.templateSnapshot,
        versionId,
        current.record.relatedGroupId,
      );
  }
  updateAnswer(name: string, value: string): void {
    const working = this.active;
    if (!working || working.origin !== this.mode) return;
    const version = working.record.templateSnapshot.versions.find(
      (item) => item.id === working.record.templateVersionId,
    )!;
    if (!placeholderNames(version).includes(name))
      throw new AppError(
        "UNKNOWN_PLACEHOLDER",
        "This field does not belong to the active writing style.",
      );
    working.record.answers = { ...working.record.answers, [name]: value };
    this.changed(working);
  }
  rename(title: string): void {
    if (!this.active || this.active.origin !== this.mode) return;
    this.active.record.title = title;
    this.changed(this.active);
  }
  private changed(working: WorkingDocument): void {
    working.changeId++;
    working.record.updatedAt = this.now();
    if (working.status !== "conflict") {
      if (working.record.revision === 0 && !hasMeaningfulUserInput(working.record)) {
        working.status = "temporary";
        working.error = "";
      } else if (working.status !== "failed") {
        working.status = "dirty";
        working.error = "";
      }
    }
    this.emit("content");
  }
  async flushAll(): Promise<void> {
    await Promise.all([...this.working.values()].map((item) => this.flush(item)));
  }
  async flush(working: WorkingDocument): Promise<void> {
    const existing = this.inFlight.get(working);
    if (existing) {
      await existing;
      if (working.status === "dirty") await this.flush(working);
      return;
    }
    if (
      working.origin !== this.mode ||
      working.status === "conflict" ||
      working.status === "saved" ||
      working.status === "temporary"
    )
      return;
    const save = this.saveSnapshot(working);
    this.inFlight.set(working, save);
    await save;
    this.inFlight.delete(working);
  }
  private async saveSnapshot(working: WorkingDocument): Promise<void> {
    const changeId = working.changeId;
    const snapshot = structuredClone(working.record);
    working.status = "saving";
    this.emit("state");
    try {
      const saved = await this.repository(working.origin).save(snapshot, snapshot.revision);
      working.record.revision = saved.revision;
      working.status = working.changeId === changeId ? "saved" : "dirty";
      working.error = "";
      logger.debug("document.autosave.completed", {
        documentId: saved.id,
        storageMode: working.origin,
      });
    } catch (error) {
      working.status =
        error instanceof AppError && error.code === "SAVE_CONFLICT" ? "conflict" : "failed";
      working.error = errorMessage(error);
      logger.warn("document.autosave.failed", {
        documentId: snapshot.id,
        storageMode: working.origin,
        conflict: working.status === "conflict",
      });
    }
    this.emit("state");
  }
  async delete(working: WorkingDocument): Promise<void> {
    if (working.origin !== this.mode)
      throw new AppError(
        "INACTIVE_STORE",
        "Switch to this document's storage mode before deleting it.",
      );
    await this.inFlight.get(working);
    if (working.record.revision > 0)
      await this.repository(working.origin).delete(working.record.id, working.record.revision);
    this.working.delete(this.key(working.origin, working.record.id));
    if (this.active === working) this.active = null;
    this.emit("navigation");
  }
  preserveLocalCopy(): void {
    const current = this.active;
    if (!current) return;
    const record = structuredClone(current.record);
    record.id = this.id();
    record.relatedGroupId = this.id();
    record.revision = 0;
    record.title = `${record.title || "Untitled"} (local copy)`;
    record.createdAt = this.now();
    record.updatedAt = record.createdAt;
    const working = { ...this.fromRecord(record, this.mode), status: "dirty" as const };
    this.working.set(this.key(this.mode, record.id), working);
    this.active = working;
    this.emit("navigation");
    void this.flush(working);
  }
  async reopenLatest(): Promise<void> {
    const current = this.active;
    if (!current) return;
    const record = await this.repository(current.origin).get(current.record.id);
    if (!record)
      throw new AppError(
        "DOCUMENT_DELETED",
        "The stored document was deleted. Preserve your local work as a new document instead.",
      );
    const working = this.fromRecord(record, current.origin);
    this.working.set(this.key(current.origin, record.id), working);
    this.active = working;
    this.emit("navigation");
  }
}
