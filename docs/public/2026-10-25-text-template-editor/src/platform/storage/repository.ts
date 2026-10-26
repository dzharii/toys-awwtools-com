/** Common persistence contract. Save/delete compare revisions atomically in each adapter. */
import type { StoredRecord } from "../../features/documents/model";
export interface Repository<T extends StoredRecord> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  save(record: T, expectedRevision: number): Promise<T>;
  delete(id: string, expectedRevision: number): Promise<void>;
}
export class MemoryRepository<T extends StoredRecord> implements Repository<T> {
  private records = new Map<string, T>();
  async list(): Promise<T[]> {
    return structuredClone([...this.records.values()]);
  }
  async get(id: string): Promise<T | undefined> {
    return structuredClone(this.records.get(id));
  }
  async save(record: T, expectedRevision: number): Promise<T> {
    checkRevision(this.records.get(record.id), expectedRevision);
    const saved = structuredClone({ ...record, revision: expectedRevision + 1 });
    this.records.set(record.id, saved);
    return structuredClone(saved);
  }
  async delete(id: string, expectedRevision: number): Promise<void> {
    checkRevision(this.records.get(id), expectedRevision);
    this.records.delete(id);
  }
}
import { AppError } from "../errors";
export function checkRevision(current: StoredRecord | undefined, expected: number): void {
  if ((current?.revision ?? 0) !== expected)
    throw new AppError(
      "SAVE_CONFLICT",
      "Another tab changed or deleted this item. Your local work is still here.",
    );
}
