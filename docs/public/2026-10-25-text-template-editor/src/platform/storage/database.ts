/** One schema owner. Feature repositories cannot independently upgrade this database. */
import Dexie from "../../vendor/dexie/dexie-4.2.0.js";
import type { StoredRecord } from "../../features/documents/model";
import { checkRevision } from "./repository";
import type { Repository } from "./repository";
const database = new Dexie("guided-document-editor");
database.version(1).stores({
  documents: "&id,updatedAt,relatedGroupId",
  authoringDrafts: "&id,updatedAt",
});
export class DexieRepository<T extends StoredRecord> implements Repository<T> {
  private table;
  constructor(
    table: "documents" | "authoringDrafts",
    private decode: (value: unknown) => T,
  ) {
    this.table = database.table(table);
  }
  async list(): Promise<T[]> {
    return (await this.table.toArray()).map(this.decode);
  }
  async get(id: string): Promise<T | undefined> {
    const value = await this.table.get(id);
    return value === undefined ? undefined : this.decode(value);
  }
  async save(record: T, expectedRevision: number): Promise<T> {
    return database.transaction("rw", this.table, async () => {
      checkRevision(await this.get(record.id), expectedRevision);
      const saved = this.decode({ ...record, revision: expectedRevision + 1 });
      await this.table.put(saved);
      return saved;
    });
  }
  async delete(id: string, expectedRevision: number): Promise<void> {
    await database.transaction("rw", this.table, async () => {
      checkRevision(await this.get(id), expectedRevision);
      await this.table.delete(id);
    });
  }
}
