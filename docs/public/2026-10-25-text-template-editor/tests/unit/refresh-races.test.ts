import { expect, test } from "bun:test";
import { DocumentService } from "../../src/features/documents/service";
import type { DocumentRecord, StoredRecord } from "../../src/features/documents/model";
import { AuthoringService } from "../../src/features/template-authoring/service";
import type { AuthoringDraft } from "../../src/features/template-authoring/model";
import { MemoryRepository } from "../../src/platform/storage/repository";
import type { Repository } from "../../src/platform/storage/repository";
import { parseTemplate } from "../../src/features/templates/parser";

async function refreshRaces<T extends StoredRecord>(
  make: (repository: Repository<T>) => {
    save(title: string): Promise<void>;
    refresh(): Promise<void>;
    remove(): Promise<void>;
    active(): T | undefined;
  },
) {
  const memory = new MemoryRepository<T>();
  let hold = false;
  let release!: () => void;
  const owner = make({
    list: async () => {
      const snapshot = await memory.list();
      if (hold) {
        hold = false;
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      }
      return snapshot;
    },
    get: (id) => memory.get(id),
    save: (record, revision) => memory.save(record, revision),
    delete: (id, revision) => memory.delete(id, revision),
  });
  const delayedRefresh = async () => {
    hold = true;
    const pending = owner.refresh();
    await Bun.sleep(0);
    return { pending, release };
  };
  const empty = await delayedRefresh();
  await owner.save("First");
  empty.release();
  await empty.pending;
  expect(owner.active()?.title).toBe("First");
  const older = await delayedRefresh();
  await owner.save("Second");
  older.release();
  await older.pending;
  expect(owner.active()?.title).toBe("Second");
  expect(owner.active()?.revision).toBe(2);
  const deleted = await delayedRefresh();
  await owner.remove();
  deleted.release();
  await deleted.pending;
  expect(owner.active()).toBeUndefined();
  expect(await memory.list()).toHaveLength(0);
}
test("delayed document refresh cannot remove a new save, roll back revisions or revive deletion", async () => {
  await refreshRaces<DocumentRecord>((repository) => {
    const service = new DocumentService(() => repository);
    service.create("sample", parseTemplate("TEMPLATE: Sample\nTEXT:\n  text").template!);
    return {
      save: async (title) => {
        service.rename(title);
        await service.flushAll();
      },
      refresh: () => service.load("indexeddb"),
      remove: () => service.delete(service.active!),
      active: () => service.active?.record,
    };
  });
});
test("delayed authoring refresh cannot remove a new save, roll back revisions or revive deletion", async () => {
  await refreshRaces<AuthoringDraft>((repository) => {
    const service = new AuthoringService(() => repository);
    service.create();
    return {
      save: async (title) => {
        service.rename(title);
        await service.flushAll();
      },
      refresh: () => service.load("indexeddb"),
      remove: () => service.delete(service.active!),
      active: () => service.active?.record,
    };
  });
});
