import { expect, test } from "bun:test";
import { AuthoringService } from "../../src/features/template-authoring/service";
import { decodeAuthoringDraft } from "../../src/features/template-authoring/model";
import type { AuthoringDraft } from "../../src/features/template-authoring/model";
import { MemoryRepository } from "../../src/platform/storage/repository";
import { AppError } from "../../src/platform/errors";
import { retainedCheckpoints } from "../../src/features/template-authoring/model";
import type { Checkpoint } from "../../src/features/template-authoring/model";
import { replaceTemplateName } from "../../src/features/template-authoring/template-name";
test("authoring drafts preserve invalid and empty source independently from generated documents", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const service = new AuthoringService(() => repository);
  service.create();
  service.update("TEMPLATE: Invalid\nTEXT:\n  {{$unclosed");
  await service.flushAll();
  expect(service.active?.status).toBe("saved");
  expect((await repository.list())[0]?.source).toContain("{{$unclosed");
  service.update("");
  await service.flushAll();
  expect((await repository.list())[0]?.source).toBe("");
  expect(await repository.list()).toHaveLength(1);
});

test("display title is independent, new stays temporary, and autosave creates no checkpoint", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const service = new AuthoringService(() => repository);
  service.create();
  await service.flushAll();
  expect(await repository.list()).toHaveLength(0);
  service.update("TEMPLATE: Different language name\nTEXT:\n  Hello");
  await service.flushAll();
  expect(service.active!.record.title).toBe("Untitled template");
  expect(service.active!.record.checkpoints).toHaveLength(0);
  service.rename("Independent display title");
  await service.flushAll();
  expect(service.active!.record.source).toContain("TEMPLATE: Different language name");
  expect(service.active!.record.checkpoints).toHaveLength(0);
});
test("edits arriving during a checkpoint save remain dirty and survive the next flush", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  let release!: () => void;
  let arrived!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const checkpointStarted = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  const service = new AuthoringService(() => ({
    list: () => repository.list(),
    get: (id) => repository.get(id),
    delete: (id, revision) => repository.delete(id, revision),
    save: async (record, revision) => {
      if (record.checkpoints.length) {
        arrived();
        await gate;
      }
      return repository.save(record, revision);
    },
  }));
  service.create("Source at Save now");
  const saving = service.saveNow();
  await checkpointStarted;
  service.update("Newer edits while saving");
  release();
  await saving;
  expect(service.active!.status).toBe("dirty");
  expect(service.active!.record.source).toBe("Newer edits while saving");
  expect(service.active!.record.checkpoints[0]?.source).toBe("Source at Save now");
  await service.flushAll();
  expect((await repository.list())[0]?.source).toBe("Newer edits while saving");
});
test("failed deletion releases operation state and notifies mounted controls", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const service = new AuthoringService(() => ({
    list: () => repository.list(),
    get: (id) => repository.get(id),
    save: (record, revision) => repository.save(record, revision),
    delete: async () => {
      throw new AppError("DENIED", "Deletion denied");
    },
  }));
  service.create("Retained source");
  await service.saveNow();
  const draft = service.active!;
  const busy: boolean[] = [];
  service.onChange = () => busy.push(service.isBusy(draft));
  await expect(service.delete(draft)).rejects.toThrow("Deletion denied");
  expect(busy).toEqual([true, false]);
  expect((await repository.list())[0]?.source).toBe("Retained source");
});
test("an unavailable checkpoint never mutates current source or stored history", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const service = new AuthoringService(() => repository);
  service.create("Exact current source\r\n");
  await service.saveNow();
  const before = structuredClone(service.active!.record);
  await expect(service.restoreCheckpoint("unavailable")).rejects.toThrow("unavailable");
  expect(service.active!.record).toEqual(before);
  expect((await repository.list())[0]).toEqual(before);
});
test("Save now deduplicates exact source, not revisions, names or normalized line endings", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const service = new AuthoringService(() => repository);
  service.create("exact\r\nsource\r\n");
  expect(await service.saveNow()).toBe(true);
  expect(await service.saveNow()).toBe(false);
  service.rename("Renamed");
  expect(await service.saveNow()).toBe(false);
  service.update("exact\nsource\n");
  expect(await service.saveNow()).toBe(true);
  expect(service.active!.record.checkpoints.map((item) => item.source)).toEqual([
    "exact\r\nsource\r\n",
    "exact\nsource\n",
  ]);
});
test("restore atomically protects unsaved source and a failed protection leaves it untouched", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  let fail = false;
  const service = new AuthoringService(() => ({
    list: () => repository.list(),
    get: (id) => repository.get(id),
    delete: (id, revision) => repository.delete(id, revision),
    save: (record, revision) => {
      if (fail) throw new AppError("QUOTA", "No room for recovery");
      return repository.save(record, revision);
    },
  }));
  service.create("First exact source\r\n");
  await service.saveNow();
  const first = structuredClone(service.active!.record.checkpoints[0]!);
  service.update("Second source");
  await service.saveNow();
  service.update("Newest unsaved source\r\n");
  fail = true;
  await expect(service.restoreCheckpoint(first.id)).rejects.toThrow("No room");
  expect(service.active!.record.source).toBe("Newest unsaved source\r\n");
  expect(service.active!.record.checkpoints).toHaveLength(2);
  fail = false;
  await service.restoreCheckpoint(first.id);
  expect(service.active!.record.source).toBe(first.source);
  expect(service.active!.record.checkpoints[0]).toEqual(first);
  expect(service.active!.record.checkpoints.at(-1)).toMatchObject({
    kind: "pre-restore",
    source: "Newest unsaved source\r\n",
  });
  await service.restoreCheckpoint(service.active!.record.checkpoints.at(-1)!.id);
  expect(service.active!.record.source).toBe("Newest unsaved source\r\n");
});
test("checkpoint failure is distinct from a successful current source save", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const service = new AuthoringService(() => ({
    list: () => repository.list(),
    get: (id) => repository.get(id),
    delete: (id, revision) => repository.delete(id, revision),
    save: (record, revision) => {
      if (record.checkpoints.length) throw new AppError("QUOTA", "Checkpoint unavailable");
      return repository.save(record, revision);
    },
  }));
  service.create("Source retained");
  await expect(service.saveNow()).rejects.toThrow("Source save succeeded");
  expect(service.active!.status).toBe("saved");
  expect((await repository.list())[0]!.source).toBe("Source retained");
  expect(service.active!.record.checkpoints).toHaveLength(0);
});
test("retention prunes only unnamed automatic recovery snapshots", () => {
  const checkpoints: Checkpoint[] = Array.from({ length: 35 }, (_, index) => ({
    id: String(index),
    draftId: "draft",
    source: String(index),
    createdAt: "2026-10-26",
    kind: index < 3 ? "explicit" : "pre-restore",
    ...(index === 3 ? { label: "Protected" } : {}),
  }));
  const retained = retainedCheckpoints(checkpoints);
  expect(retained).toHaveLength(29);
  expect(retained.slice(0, 4)).toEqual(checkpoints.slice(0, 4));
});
test("template name editing changes exactly the unambiguous value and preserves all other bytes", () => {
  const source = "TEMPLATE:\tOld name  \r\n\r\nTEXT:\r\n  Original text\r\n";
  expect(replaceTemplateName(source, "New name")).toBe(
    "TEMPLATE:\tNew name  \r\n\r\nTEXT:\r\n  Original text\r\n",
  );
  expect(() => replaceTemplateName("TEXT:\n  No name", "New")).toThrow("exactly one");
  expect(() => replaceTemplateName("TEMPLATE: One\nTEMPLATE: Two", "New")).toThrow("exactly one");
});
test("authoring failures retain source and remain visible during further editing", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  let failed = true;
  const service = new AuthoringService(() => ({
    list: () => repository.list(),
    get: (id) => repository.get(id),
    delete: (id, revision) => repository.delete(id, revision),
    save: async (record, revision) => {
      if (failed) throw new AppError("QUOTA", "Storage is full.");
      return repository.save(record, revision);
    },
  }));
  service.create();
  service.update("important source");
  await service.flushAll();
  service.update("more important source");
  expect(service.active?.status).toBe("failed");
  expect(service.active?.error).toBe("Storage is full.");
  failed = false;
  await service.flushAll();
  expect(service.active?.status).toBe("saved");
  expect((await repository.list())[0]?.source).toBe("more important source");
});
test("source records are decoded without requiring valid GTL", () => {
  const record = {
    id: "id",
    title: "Untitled",
    source: "bad GTL",
    sourceTemplateId: "",
    revision: 1,
    createdAt: "2026-10-25",
    updatedAt: "2026-10-25",
    checkpoints: [],
  };
  expect(decodeAuthoringDraft(record).source).toBe("bad GTL");
  expect(() => decodeAuthoringDraft({ ...record, source: null })).toThrow();
});
test("refreshing drafts preserves unsaved source and its original concurrency revision", async () => {
  const repository = new MemoryRepository<AuthoringDraft>();
  const first = new AuthoringService(() => repository);
  const second = new AuthoringService(() => repository);
  first.create();
  first.update("original source");
  await first.flushAll();
  await second.load("indexeddb");
  second.select(second.drafts[0]!);
  second.update("unsaved local source");
  first.update("newer saved source");
  await first.flushAll();
  await second.load("indexeddb");
  expect(second.active?.record.source).toBe("unsaved local source");
  expect(second.active?.record.revision).toBe(1);
  await second.flushAll();
  expect(second.active?.status).toBe("conflict");
  expect(second.active?.record.source).toBe("unsaved local source");
  expect((await repository.list())[0]?.source).toBe("newer saved source");
});
