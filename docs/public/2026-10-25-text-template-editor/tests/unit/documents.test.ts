import { describe, expect, test } from "bun:test";
import { DocumentService } from "../../src/features/documents/service";
import { decodeDocument, hasMeaningfulUserInput } from "../../src/features/documents/model";
import type { DocumentRecord } from "../../src/features/documents/model";
import { MemoryRepository } from "../../src/platform/storage/repository";
import type { Repository } from "../../src/platform/storage/repository";
import { AppError } from "../../src/platform/errors";
import { parseTemplate } from "../../src/features/templates/parser";
import { validatedTitle } from "../../src/platform/ui/titles";
import { filteredDocuments } from "../../src/features/documents/filter";
const template = parseTemplate(
  "TEMPLATE: Shared\nVERSION: One\n  TEXT:\n    {{$name}}\nVERSION: Two\n  TEXT:\n    Hello {{$name}}\n$name: Name?",
).template!;
function setup(repository: Repository<DocumentRecord> = new MemoryRepository()) {
  let id = 0;
  const service = new DocumentService(
    () => repository,
    () => "2026-10-25T12:00:00.000Z",
    () => `id-${++id}`,
  );
  service.create("shared", template);
  return { service, repository };
}
describe("document lifecycle", () => {
  test("selection and focus do not persist; reverted temporary input leaves no document", async () => {
    const { service, repository } = setup();
    expect(hasMeaningfulUserInput(service.active!.record)).toBe(false);
    service.updateAnswer("name", "Alex");
    service.updateAnswer("name", " \t ");
    await service.flushAll();
    expect(await repository.list()).toHaveLength(0);
    expect(service.documents).toHaveLength(0);
  });

  test("rename validates Unicode code points, preserves internal spaces and avoids no-op writes", async () => {
    const { service, repository } = setup();
    const title = "\u{1F600}".repeat(200);
    service.rename(title);
    await service.flushAll();
    const revision = service.active!.record.revision;
    service.rename(`  ${title}  `);
    await service.flushAll();
    expect(service.active!.record.revision).toBe(revision);
    expect((await repository.list())[0]!.title).toBe(title);
    expect(validatedTitle("  A  B: C  ")).toBe("A  B: C");
    expect(() => service.rename(title + "a")).toThrow("200");
    expect(() => service.rename(" \t ")).toThrow("nonempty");
  });
  test("archive and restore persist latest answers without masquerading as content edits", async () => {
    const { service, repository } = setup();
    service.updateAnswer("name", "Latest");
    const working = service.active!;
    const updatedAt = working.record.updatedAt;
    await service.setArchived(working, true);
    expect((await repository.list())[0]).toMatchObject({
      id: working.record.id,
      updatedAt,
      answers: { name: "Latest" },
    });
    expect(working.record.archivedAt).toBeDefined();
    expect(filteredDocuments(service.documents, "active", 10)).toHaveLength(0);
    expect(filteredDocuments(service.documents, "archived", 10)).toHaveLength(1);
    await service.setArchived(working, false);
    expect(working.record.archivedAt).toBeUndefined();
    expect(working.record.updatedAt).toBe(updatedAt);
  });
  test("archive waits for an older save and captures newer coherent answers", async () => {
    const repository = new MemoryRepository<DocumentRecord>();
    let release!: () => void,
      writes = 0;
    const { service } = setup({
      list: () => repository.list(),
      get: (id) => repository.get(id),
      delete: (id, revision) => repository.delete(id, revision),
      save: async (record, revision) => {
        if (++writes === 1)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return repository.save(record, revision);
      },
    });
    service.updateAnswer("name", "Older");
    const first = service.flushAll();
    const archive = service.setArchived(service.active!, true);
    service.updateAnswer("name", "Newest");
    release();
    await Promise.all([first, archive]);
    expect((await repository.list())[0]!.answers.name).toBe("Newest");
    expect((await repository.list())[0]!.archivedAt).toBeDefined();
  });
  test("delete blocks queued autosaves from reviving the same identity", async () => {
    const repository = new MemoryRepository<DocumentRecord>();
    let release!: () => void,
      writes = 0;
    const { service } = setup({
      list: () => repository.list(),
      get: (id) => repository.get(id),
      delete: (id, revision) => repository.delete(id, revision),
      save: async (record, revision) => {
        if (++writes === 1)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return repository.save(record, revision);
      },
    });
    service.updateAnswer("name", "Older");
    const working = service.active!;
    const first = service.flushAll();
    service.updateAnswer("name", "Newer");
    const queued = service.flushAll();
    const deletion = service.delete(working);
    release();
    await Promise.all([first, queued, deletion]);
    await service.flush(working);
    expect(await repository.list()).toHaveLength(0);
    expect(writes).toBe(1);
    expect(service.active).toBeNull();
  });
  test("refresh reconciles deleted clean documents but retains dirty deleted work as a conflict", async () => {
    const { service, repository } = setup();
    service.rename("Saved");
    await service.flushAll();
    const working = service.active!;
    await repository.delete(working.record.id, working.record.revision);
    await service.load("indexeddb");
    expect(service.active).toBeNull();
    expect(service.documents).toHaveLength(0);
    service.create("shared", template);
    service.rename("Dirty");
    await service.flushAll();
    const dirty = service.active!;
    service.updateAnswer("name", "Retain me");
    await repository.delete(dirty.record.id, dirty.record.revision);
    await service.load("indexeddb");
    expect(dirty.status).toBe("conflict");
    expect(dirty.record.answers.name).toBe("Retain me");
  });
  test("repeated saves update one identity and existing empty documents are retained", async () => {
    const { service, repository } = setup();
    service.updateAnswer("name", "Alex");
    await service.flushAll();
    service.updateAnswer("name", "Morgan");
    await service.flushAll();
    service.updateAnswer("name", "");
    await service.flushAll();
    expect(await repository.list()).toHaveLength(1);
    expect((await repository.list())[0]).toMatchObject({ revision: 3, answers: { name: "" } });
  });
  test("an explicit title creates a save-worthy document", async () => {
    const { service, repository } = setup();
    service.rename("A project");
    await service.flushAll();
    expect(await repository.list()).toHaveLength(1);
  });
  test("versions are independent and switching back reopens the same document", async () => {
    const { service, repository } = setup();
    const original = service.active;
    service.updateAnswer("name", "Alex");
    await service.flushAll();
    service.switchVersion("version-2");
    expect(service.active!.record.answers).toEqual({});
    service.updateAnswer("name", "Morgan");
    await service.flushAll();
    service.switchVersion("version-1");
    expect(service.active).toBe(original);
    expect(service.active!.record.answers.name).toBe("Alex");
    expect(await repository.list()).toHaveLength(2);
    service.create("shared", template);
    expect(service.active!.record.answers).toEqual({});
    expect(service.active!.record.relatedGroupId).not.toBe(original!.record.relatedGroupId);
  });
  test("deleting one version leaves its related document intact", async () => {
    const { service, repository } = setup();
    service.updateAnswer("name", "Alex");
    await service.flushAll();
    const original = service.active!;
    service.switchVersion("version-2");
    service.updateAnswer("name", "Morgan");
    await service.flushAll();
    await service.delete(original);
    expect(await repository.list()).toHaveLength(1);
    expect((await repository.list())[0]?.answers.name).toBe("Morgan");
  });
  test("storage failures retain editable answers and retry the same identity", async () => {
    const memory = new MemoryRepository<DocumentRecord>();
    let fail = true;
    const { service } = setup({
      list: () => memory.list(),
      get: (id) => memory.get(id),
      delete: (id, revision) => memory.delete(id, revision),
      save: async (record, revision) => {
        if (fail) throw new AppError("QUOTA", "Storage is full.");
        return memory.save(record, revision);
      },
    });
    service.updateAnswer("name", "Important");
    const id = service.active!.record.id;
    await service.flushAll();
    expect(service.active!.status).toBe("failed");
    expect(service.active!.record.answers.name).toBe("Important");
    fail = false;
    await service.flushAll();
    expect(service.active!.record.id).toBe(id);
    expect(service.active!.status).toBe("saved");
  });
  test("a completed older save cannot clear newer edits", async () => {
    const memory = new MemoryRepository<DocumentRecord>();
    let release: (() => void) | undefined;
    let saves = 0;
    const { service } = setup({
      list: () => memory.list(),
      get: (id) => memory.get(id),
      delete: (id, revision) => memory.delete(id, revision),
      save: async (record, revision) => {
        saves++;
        await new Promise<void>((resolve) => {
          release = resolve;
        });
        return memory.save(record, revision);
      },
    });
    service.updateAnswer("name", "Old");
    const first = service.flushAll();
    service.updateAnswer("name", "New");
    release!();
    await first;
    expect(saves).toBe(1);
    expect(service.active!.status).toBe("dirty");
    expect(service.active!.record.answers.name).toBe("New");
    expect((await memory.list())[0]?.answers.name).toBe("Old");
    const second = service.flushAll();
    release!();
    await second;
    expect(service.active!.status).toBe("saved");
  });
  test("a navigation flush waits for an active save and then persists newer pending edits", async () => {
    const memory = new MemoryRepository<DocumentRecord>();
    let release: (() => void) | undefined;
    let writes = 0;
    const { service } = setup({
      list: () => memory.list(),
      get: (id) => memory.get(id),
      delete: (id, revision) => memory.delete(id, revision),
      save: async (record, revision) => {
        writes++;
        if (writes === 1)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return memory.save(record, revision);
      },
    });
    service.updateAnswer("name", "First");
    const autosave = service.flushAll();
    service.updateAnswer("name", "Latest");
    const navigation = service.flushAll();
    release!();
    await Promise.all([autosave, navigation]);
    expect(writes).toBe(2);
    expect((await memory.list())[0]?.answers.name).toBe("Latest");
    expect(service.active!.status).toBe("saved");
  });
  test("competing revision saves conflict and retain the losing tab's local answers", async () => {
    const { service, repository } = setup();
    service.updateAnswer("name", "Initial");
    service.rename("\u{1f642}".repeat(200));
    await service.flushAll();
    const other = new DocumentService(() => repository);
    await other.load("indexeddb");
    other.select(other.documents[0]!);
    service.updateAnswer("name", "Winner");
    await service.flushAll();
    other.updateAnswer("name", "Local");
    await other.flushAll();
    expect(other.active!.status).toBe("conflict");
    expect(other.active!.record.answers.name).toBe("Local");
    expect((await repository.list())[0]?.answers.name).toBe("Winner");
    other.preserveLocalCopy();
    expect([...other.active!.record.title]).toHaveLength(200);
    expect(other.active!.record.title.endsWith(" (local copy)")).toBe(true);
    await other.flushAll();
    expect(await repository.list()).toHaveLength(2);
  });
  test("store switching preserves memory and never silently writes to another store", async () => {
    const first = new MemoryRepository<DocumentRecord>(),
      second = new MemoryRepository<DocumentRecord>();
    const service = new DocumentService((mode) => (mode === "indexeddb" ? first : second));
    service.create("shared", template);
    service.updateAnswer("name", "Local");
    await service.load("memory");
    await service.flushAll();
    expect(service.active!.record.answers.name).toBe("Local");
    expect(await second.list()).toHaveLength(0);
    expect(await first.list()).toHaveLength(0);
    await service.load("indexeddb");
    await service.flushAll();
    expect(await first.list()).toHaveLength(1);
  });
  test("corrupt records and invalid snapshots fail visibly rather than becoming blank data", () => {
    const { service } = setup();
    expect(() =>
      decodeDocument({ ...service.active!.record, templateSnapshot: { source: "bad" } }),
    ).toThrow("snapshot");
    expect(() => decodeDocument({ ...service.active!.record, revision: -1 })).toThrow();
  });
});
