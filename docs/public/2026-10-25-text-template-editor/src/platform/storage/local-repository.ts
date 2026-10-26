/**
 * Synchronous JSON storage is protected by a cross-tab Web Lock around the
 * read/compare/write operation. Without Web Locks we reject writes rather than
 * pretending localStorage can provide atomic optimistic concurrency.
 */
import type { StoredRecord } from "../../features/documents/model";
import { AppError, isRecord } from "../errors";
import { checkRevision } from "./repository";
import type { Repository } from "./repository";
export class LocalRepository<T extends StoredRecord> implements Repository<T> {
  constructor(
    private key: string,
    private decode: (value: unknown) => T,
  ) {}
  private read(): T[] {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new AppError(
        "CORRUPT_STORAGE",
        "Browser storage contains invalid JSON. It has not been reset or overwritten.",
      );
    }
    if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.records)) {
      throw new AppError(
        "CORRUPT_STORAGE",
        "Browser storage has an unsupported format. It has not been overwritten.",
      );
    }
    const records = value.records.map(this.decode);
    if (new Set(records.map((record) => record.id)).size !== records.length)
      throw new AppError("CORRUPT_STORAGE", "Browser storage contains duplicate identities.");
    return records;
  }
  async list(): Promise<T[]> {
    return this.read();
  }
  async get(id: string): Promise<T | undefined> {
    return this.read().find((record) => record.id === id);
  }
  private async locked<R>(action: () => R): Promise<R> {
    if (!navigator.locks)
      throw new AppError(
        "LOCKS_UNAVAILABLE",
        "Safe localStorage writes need Web Locks in a secure browser context. Use IndexedDB instead.",
      );
    return navigator.locks.request(this.key, action);
  }
  async save(record: T, expectedRevision: number): Promise<T> {
    return this.locked(() => {
      const records = this.read();
      checkRevision(
        records.find((item) => item.id === record.id),
        expectedRevision,
      );
      const saved = this.decode({ ...record, revision: expectedRevision + 1 });
      localStorage.setItem(
        this.key,
        JSON.stringify({
          schemaVersion: 1,
          records: [...records.filter((item) => item.id !== record.id), saved],
        }),
      );
      return saved;
    });
  }
  async delete(id: string, expectedRevision: number): Promise<void> {
    await this.locked(() => {
      const records = this.read();
      checkRevision(
        records.find((item) => item.id === id),
        expectedRevision,
      );
      localStorage.setItem(
        this.key,
        JSON.stringify({ schemaVersion: 1, records: records.filter((item) => item.id !== id) }),
      );
    });
  }
}
