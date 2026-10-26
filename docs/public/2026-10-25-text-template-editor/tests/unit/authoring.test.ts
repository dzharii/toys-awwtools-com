import { expect, test } from "bun:test";
import { AuthoringService } from "../../src/features/template-authoring/service";
import { decodeAuthoringDraft } from "../../src/features/template-authoring/model";
import type { AuthoringDraft } from "../../src/features/template-authoring/model";
import { MemoryRepository } from "../../src/platform/storage/repository";
import { AppError } from "../../src/platform/errors";
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
