import { afterEach, expect, test } from "bun:test";
import { StorageClient } from "../src/storage-client.js";

const OriginalWorker = globalThis.Worker;

class FakeWorker extends EventTarget {
  postMessage() {}
}

afterEach(() => {
  globalThis.Worker = OriginalWorker;
});

test("flush surfaces failed debounced writes through status and rejection", async () => {
  globalThis.Worker = FakeWorker;
  const client = new StorageClient({ workerUrl: "fake-worker.js" });
  const statuses = [];
  client.addEventListener("save-status", (event) => statuses.push(event.detail.state));
  const scheduled = client.schedule("block:b1", async () => {
    throw new Error("IndexedDB write failed");
  }, 5000);
  const scheduledFailure = scheduled.catch((error) => error);

  await expect(client.flush()).rejects.toThrow("IndexedDB write failed");
  expect((await scheduledFailure).message).toBe("IndexedDB write failed");
  expect(statuses).toContain("dirty");
  expect(statuses).toContain("saving");
  expect(statuses).toContain("failed");
});
