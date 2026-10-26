import { expect, test } from "bun:test";
import { recordHandler } from "../../src/features/documents/worker-handler";
import { decodeAuthoringDraft } from "../../src/features/template-authoring/model";
import type { AuthoringDraft } from "../../src/features/template-authoring/model";
import { MemoryRepository } from "../../src/platform/storage/repository";
import { routeRequest } from "../../src/platform/messaging/worker-router";
import { WorkerClient } from "../../src/platform/messaging/worker-client";
const request = (scope: string, type: string, payload: unknown) => ({
  protocolVersion: 1,
  requestId: "test",
  scope,
  type,
  payload,
});
test("worker routing validates envelopes, scopes, operations, payloads and handler failures", async () => {
  const handlers = new Map([
    ["authoring", recordHandler(new MemoryRepository<AuthoringDraft>(), decodeAuthoringDraft)],
  ]);
  for (const [input, code] of [
    [{}, "INVALID_REQUEST"],
    [request("missing", "list", null), "UNKNOWN_SCOPE"],
    [request("authoring", "missing", null), "UNKNOWN_OPERATION"],
    [request("authoring", "save", {}), "INVALID_REQUEST"],
  ] as const)
    expect(await routeRequest(input, handlers)).toMatchObject({ ok: false, error: { code } });
  expect(await routeRequest(request("authoring", "list", null), handlers)).toMatchObject({
    ok: true,
    result: [],
  });
  expect(
    await routeRequest(
      request("broken", "list", null),
      new Map([
        [
          "broken",
          async () => {
            throw new Error("failure");
          },
        ],
      ]),
    ),
  ).toMatchObject({ ok: false, error: { code: "STORAGE_OPERATION_FAILED" } });
});
class FakeWorker extends EventTarget {
  sent: unknown[] = [];
  postMessage(message: unknown): void {
    this.sent.push(message);
  }
  terminate(): void {}
}
test("worker timeouts reject, late replies are ignored, and subsequent requests still work", async () => {
  const worker = new FakeWorker();
  const client = new WorkerClient(() => worker, 10);
  await expect(client.request("system.ping", null)).rejects.toMatchObject({
    code: "WORKER_TIMEOUT",
  });
  const late = worker.sent[0] as { requestId: string };
  worker.dispatchEvent(
    new MessageEvent("message", {
      data: { protocolVersion: 1, requestId: late.requestId, ok: true, result: "late" },
    }),
  );
  const next = client.request("system.ping", null);
  const current = worker.sent[1] as { requestId: string };
  worker.dispatchEvent(
    new MessageEvent("message", {
      data: { protocolVersion: 1, requestId: current.requestId, ok: true, result: "ready" },
    }),
  );
  expect(await next).toBe("ready");
});
test("worker restarts reject outstanding requests", async () => {
  const client = new WorkerClient(() => new FakeWorker());
  const pending = client.request("system.ping", null);
  client.restart();
  await expect(pending).rejects.toMatchObject({ code: "WORKER_RESTARTED" });
});
