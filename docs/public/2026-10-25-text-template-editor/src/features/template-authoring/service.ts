/**
 * Source drafts use separate identities and repositories from generated documents.
 * Invalid source is saved verbatim. Optimistic revisions protect competing tabs.
 */
import type { StorageMode } from "../settings/schema";
import type { SaveStatus } from "../documents/model";
import type { Repository } from "../../platform/storage/repository";
import { AppError, errorMessage } from "../../platform/errors";
import { parseTemplate } from "../templates/parser";
import type { AuthoringDraft } from "./model";
export interface WorkingAuthoringDraft {
  record: AuthoringDraft;
  origin: StorageMode;
  status: SaveStatus;
  changeId: number;
  error: string;
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
  private timer: ReturnType<typeof setInterval> | undefined;
  constructor(private repository: (mode: StorageMode) => Repository<AuthoringDraft>) {}
  configureAutosave(seconds: number): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.flushAll();
    }, seconds * 1000);
  }
  async load(mode: StorageMode): Promise<void> {
    this.mode = mode;
    try {
      const records = await this.repository(mode).list();
      if (this.mode !== mode) return;
      for (const record of records) {
        const existing = this.drafts.find(
          (draft) => draft.origin === mode && draft.record.id === record.id,
        );
        if (existing && existing.status !== "saved") continue;
        if (existing) existing.record = record;
        else this.drafts.push({ record, origin: mode, status: "saved", changeId: 0, error: "" });
      }
      this.error = "";
    } catch (error) {
      if (this.mode === mode) this.error = errorMessage(error);
    }
    this.onChange(false);
  }
  create(source = starterSource, sourceTemplateId = ""): void {
    if (this.active) void this.flush(this.active);
    const timestamp = new Date().toISOString();
    const working: WorkingAuthoringDraft = {
      record: {
        id: crypto.randomUUID(),
        title: parseTemplate(source).template?.name || "Untitled template",
        source,
        sourceTemplateId,
        revision: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      origin: this.mode,
      status: "temporary",
      changeId: 0,
      error: "",
    };
    this.active = working;
    this.drafts.push(working);
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
    draft.record.source = source;
    const name = /^TEMPLATE:\s*(.+)$/m.exec(source)?.[1]?.trim();
    if (name) draft.record.title = name;
    draft.record.updatedAt = new Date().toISOString();
    draft.changeId++;
    if (draft.status !== "conflict" && draft.status !== "failed") {
      draft.status = "dirty";
      draft.error = "";
    }
    this.onChange(false);
  }
  async flushAll(): Promise<void> {
    await Promise.all(this.drafts.map((draft) => this.flush(draft)));
  }
  async flush(draft: WorkingAuthoringDraft): Promise<void> {
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
    this.onChange(false);
  }
  preserveCopy(): void {
    const current = this.active;
    if (!current) return;
    this.create(current.record.source, current.record.sourceTemplateId);
    this.active!.record.title = `${current.record.title} (local copy)`;
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
    await this.pending.get(draft);
    if (draft.record.revision)
      await this.repository(draft.origin).delete(draft.record.id, draft.record.revision);
    this.drafts = this.drafts.filter((item) => item !== draft);
    if (this.active === draft) this.active = null;
    this.onChange(true);
  }
}
