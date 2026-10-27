/**
 * Source drafts use separate identities and repositories from generated documents.
 * Invalid source is saved verbatim. Optimistic revisions protect competing tabs.
 */
import type { StorageMode } from "../settings/schema";
import type { SaveStatus } from "../documents/model";
import type { Repository } from "../../platform/storage/repository";
import { AppError, errorMessage } from "../../platform/errors";
import { retainedCheckpoints } from "./model";
import type { AuthoringDraft, Checkpoint } from "./model";
import { localCopyTitle, validatedTitle } from "../../platform/ui/titles";
import { replaceTemplateName } from "./template-name";
export interface WorkingAuthoringDraft {
  record: AuthoringDraft;
  origin: StorageMode;
  status: SaveStatus;
  changeId: number;
  error: string;
  checkpointError: string;
}
export const starterSource =
  "TEMPLATE: A new idea\n\nTEXT:\n  Hello {{$name}}.\n\n$name: Who is this for?\n  HINT: Start with a name.\n  EXAMPLE: Alex\n";
export class AuthoringService {
  active: WorkingAuthoringDraft | null = null;
  drafts: WorkingAuthoringDraft[] = [];
  mode: StorageMode = "indexeddb";
  error = "";
  onChange: (navigation: boolean) => void = () => {};
  private pending = new Map<WorkingAuthoringDraft, Promise<void>>();
  private operations = new WeakSet<WorkingAuthoringDraft>();
  private deleted = new WeakSet<WorkingAuthoringDraft>();
  private initialSources = new WeakMap<WorkingAuthoringDraft, string>();
  private mutationEpoch = 0;
  private loadRequest = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  constructor(private repository: (mode: StorageMode) => Repository<AuthoringDraft>) {}
  dispose(): void {
    clearInterval(this.timer);
  }
  isBusy(draft: WorkingAuthoringDraft | null): boolean {
    return !!draft && this.operations.has(draft);
  }
  configureAutosave(seconds: number): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.flushAll();
    }, seconds * 1000);
  }
  async load(mode: StorageMode): Promise<void> {
    this.mode = mode;
    const request = ++this.loadRequest;
    const epoch = this.mutationEpoch;
    try {
      const records = await this.repository(mode).list();
      if (this.mode !== mode || request !== this.loadRequest) return;
      if (epoch !== this.mutationEpoch) return this.load(mode);
      const ids = new Set(records.map((record) => record.id));
      this.drafts = this.drafts.filter((draft) => {
        if (draft.origin !== mode || draft.record.revision === 0 || ids.has(draft.record.id))
          return true;
        if (draft.status === "saved") {
          this.deleted.add(draft);
          if (this.active === draft) this.active = null;
          return false;
        }
        if (!this.operations.has(draft) && !this.pending.has(draft)) {
          draft.status = "conflict";
          draft.error =
            "This draft was deleted in another tab. Preserve a local copy to keep your source.";
        }
        return true;
      });
      for (const record of records) {
        const existing = this.drafts.find(
          (draft) => draft.origin === mode && draft.record.id === record.id,
        );
        if (existing && existing.status !== "saved") continue;
        if (existing) {
          if (record.revision >= existing.record.revision) existing.record = record;
        } else
          this.drafts.push({
            record,
            origin: mode,
            status: "saved",
            changeId: 0,
            error: "",
            checkpointError: "",
          });
      }
      this.error = "";
    } catch (error) {
      if (this.mode === mode && request === this.loadRequest) this.error = errorMessage(error);
    }
    this.onChange(false);
  }
  create(source = starterSource, sourceTemplateId = "", title = "Untitled template"): void {
    if (this.active) void this.flush(this.active);
    const timestamp = new Date().toISOString();
    const working: WorkingAuthoringDraft = {
      record: {
        id: crypto.randomUUID(),
        title: validatedTitle(title),
        source,
        sourceTemplateId,
        revision: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        checkpoints: [],
      },
      origin: this.mode,
      status: "temporary",
      changeId: 0,
      error: "",
      checkpointError: "",
    };
    this.active = working;
    this.drafts.push(working);
    this.initialSources.set(working, source);
    this.onChange(true);
  }
  select(draft: WorkingAuthoringDraft): void {
    if (this.active) void this.flush(this.active);
    this.active = draft;
    this.onChange(true);
  }
  update(source: string): void {
    const draft = this.active;
    if (!draft || draft.origin !== this.mode) return;
    if (draft.record.source === source) return;
    draft.record.source = source;
    this.changed(draft);
  }
  rename(title: string, draft = this.active): void {
    if (!draft || draft.origin !== this.mode) return;
    const normalized = validatedTitle(title);
    if (normalized === draft.record.title) return;
    draft.record.title = normalized;
    this.changed(draft);
  }
  changeTemplateName(name: string): void {
    if (this.active) this.update(replaceTemplateName(this.active.record.source, name));
  }
  private changed(draft: WorkingAuthoringDraft): void {
    draft.record.updatedAt = new Date().toISOString();
    draft.changeId++;
    if (draft.status !== "conflict" && draft.status !== "failed") {
      draft.status =
        draft.record.revision === 0 &&
        draft.record.title === "Untitled template" &&
        draft.record.source === this.initialSources.get(draft)
          ? "temporary"
          : "dirty";
      draft.error = "";
    }
    this.onChange(false);
  }
  async flushAll(): Promise<void> {
    await Promise.all(this.drafts.map((draft) => this.flush(draft)));
  }
  async flush(draft: WorkingAuthoringDraft): Promise<void> {
    if (this.operations.has(draft) || this.deleted.has(draft)) return;
    const pending = this.pending.get(draft);
    if (pending) {
      await pending;
      if (draft.status === "dirty") await this.flush(draft);
      return;
    }
    if (draft.origin !== this.mode || ["temporary", "saved", "conflict"].includes(draft.status))
      return;
    const task = this.saveSnapshot(draft);
    this.pending.set(draft, task);
    await task;
    this.pending.delete(draft);
  }
  private async saveSnapshot(draft: WorkingAuthoringDraft): Promise<void> {
    this.mutationEpoch++;
    const changeId = draft.changeId;
    const record = structuredClone(draft.record);
    draft.status = "saving";
    this.onChange(false);
    try {
      const saved = await this.repository(draft.origin).save(record, record.revision);
      draft.record.revision = saved.revision;
      draft.status = changeId === draft.changeId ? "saved" : "dirty";
      draft.error = "";
    } catch (error) {
      draft.status =
        error instanceof AppError && error.code === "SAVE_CONFLICT" ? "conflict" : "failed";
      draft.error = errorMessage(error);
    }
    this.mutationEpoch++;
    this.onChange(false);
  }
  preserveCopy(): void {
    const current = this.active;
    if (!current) return;
    this.create(current.record.source, current.record.sourceTemplateId);
    this.active!.record.title = localCopyTitle(current.record.title);
    this.active!.status = "dirty";
    this.onChange(false);
    void this.flush(this.active!);
  }
  async reopenLatest(): Promise<void> {
    const draft = this.active;
    if (!draft) return;
    const record = await this.repository(draft.origin).get(draft.record.id);
    if (!record)
      throw new AppError("DRAFT_DELETED", "This draft was deleted. Preserve a local copy instead.");
    draft.record = record;
    draft.status = "saved";
    draft.error = "";
    this.onChange(true);
  }
  async delete(draft: WorkingAuthoringDraft): Promise<void> {
    if (draft.origin !== this.mode)
      throw new AppError(
        "INACTIVE_STORE",
        "Switch to this draft's storage mode before deleting it.",
      );
    this.beginOperation(draft);
    try {
      await this.pending.get(draft);
      if (draft.record.revision)
        await this.repository(draft.origin).delete(draft.record.id, draft.record.revision);
      this.deleted.add(draft);
      this.drafts = this.drafts.filter((item) => item !== draft);
      const wasActive = this.active === draft;
      if (wasActive) this.active = null;
      this.onChange(wasActive);
    } finally {
      this.operations.delete(draft);
      this.mutationEpoch++;
      this.onChange(false);
    }
  }
  private beginOperation(draft: WorkingAuthoringDraft): void {
    if (draft.origin !== this.mode)
      throw new AppError("INACTIVE_STORE", "Switch to this draft's storage mode first.");
    if (this.operations.has(draft) || this.deleted.has(draft))
      throw new AppError("DRAFT_BUSY", "This draft is already being changed. Wait and retry.");
    if (draft.status === "conflict")
      throw new AppError("SAVE_CONFLICT", "Resolve the save conflict before changing checkpoints.");
    this.operations.add(draft);
    this.mutationEpoch++;
    this.onChange(false);
  }
  async saveNow(draft = this.active, label?: string): Promise<boolean> {
    if (!draft) throw new AppError("NO_DRAFT", "Open a template draft first.");
    this.beginOperation(draft);
    const source = draft.record.source;
    draft.checkpointError = "";
    try {
      await this.pending.get(draft);
      if (draft.status === "conflict") throw new AppError("SAVE_CONFLICT", draft.error);
      if (draft.status !== "saved") await this.saveSnapshot(draft);
      if (["failed", "conflict"].includes(draft.status))
        throw new AppError("SOURCE_SAVE_FAILED", draft.error);
      if (draft.record.checkpoints.at(-1)?.source === source) return false;
      const checkpoint: Checkpoint = {
        id: crypto.randomUUID(),
        draftId: draft.record.id,
        source,
        createdAt: new Date().toISOString(),
        kind: "explicit",
        ...(label?.trim() ? { label: validatedTitle(label) } : {}),
      };
      const changeId = draft.changeId;
      const snapshot = structuredClone(draft.record);
      snapshot.checkpoints.push(checkpoint);
      try {
        const saved = await this.repository(draft.origin).save(snapshot, snapshot.revision);
        draft.record.revision = saved.revision;
        draft.record.checkpoints = saved.checkpoints;
        draft.status = draft.changeId === changeId ? "saved" : "dirty";
      } catch (error) {
        draft.checkpointError = `Source save succeeded, but the checkpoint could not be saved: ${errorMessage(error)}`;
        if (error instanceof AppError && error.code === "SAVE_CONFLICT") {
          draft.status = "conflict";
          draft.error = errorMessage(error);
        }
        throw new AppError("CHECKPOINT_SAVE_FAILED", draft.checkpointError);
      }
      return true;
    } finally {
      this.operations.delete(draft);
      this.mutationEpoch++;
      this.onChange(false);
    }
  }
  async restoreCheckpoint(checkpointId: string, draft = this.active): Promise<boolean> {
    if (!draft) throw new AppError("NO_DRAFT", "Open a template draft first.");
    this.beginOperation(draft);
    draft.checkpointError = "";
    try {
      await this.pending.get(draft);
      if (draft.status === "conflict") throw new AppError("SAVE_CONFLICT", draft.error);
      const target = draft.record.checkpoints.find((item) => item.id === checkpointId);
      if (!target)
        throw new AppError(
          "CHECKPOINT_MISSING",
          "This checkpoint is unavailable. Return to current source or refresh history.",
        );
      if (target.source === draft.record.source) return true;
      const changeId = draft.changeId;
      const currentSource = draft.record.source;
      const snapshot = structuredClone(draft.record);
      snapshot.checkpoints = retainedCheckpoints([
        ...snapshot.checkpoints,
        {
          id: crypto.randomUUID(),
          draftId: draft.record.id,
          source: currentSource,
          createdAt: new Date().toISOString(),
          kind: "pre-restore",
        },
      ]);
      // One revision-checked transaction protects current source and installs the
      // restored source together. A failed protection write changes neither.
      snapshot.source = target.source;
      snapshot.updatedAt = new Date().toISOString();
      const saved = await this.repository(draft.origin).save(snapshot, snapshot.revision);
      draft.record.revision = saved.revision;
      draft.record.checkpoints = saved.checkpoints;
      const applied = draft.changeId === changeId;
      if (applied) {
        draft.record.source = saved.source;
        draft.record.updatedAt = saved.updatedAt;
        draft.changeId++;
        draft.status = "saved";
      } else draft.status = "dirty";
      draft.error = "";
      return applied;
    } catch (error) {
      draft.checkpointError = `Restore did not replace your current source: ${errorMessage(error)}`;
      if (error instanceof AppError && error.code === "SAVE_CONFLICT") {
        draft.status = "conflict";
        draft.error = errorMessage(error);
      }
      throw error;
    } finally {
      this.operations.delete(draft);
      this.mutationEpoch++;
      this.onChange(false);
    }
  }
}
