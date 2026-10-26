/** Correlated requests reject on timeout/crash; late replies cannot resolve a newer request. */
import { AppError } from "../errors";
import { isResponse } from "./protocol";
import type { Operations, RequestEnvelope } from "./protocol";
export class WorkerClient {
  private worker: Pick<Worker, "postMessage" | "addEventListener" | "terminate"> | null = null;
  private pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  constructor(
    private factory: () => Pick<Worker, "postMessage" | "addEventListener" | "terminate"> = () =>
      new Worker(new URL("worker.js", document.baseURI), { type: "module" }),
    private timeout = 15000,
  ) {}
  restart(): void {
    this.failAll(
      new AppError("WORKER_RESTARTED", "The storage worker restarted. Retry saving your changes."),
    );
    this.worker?.terminate();
    this.worker = null;
  }
  private failAll(error: Error): void {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }
  private connect(): Pick<Worker, "postMessage" | "addEventListener" | "terminate"> {
    if (this.worker) return this.worker;
    const worker = this.factory();
    worker.addEventListener("message", (event: MessageEvent<unknown>) => {
      if (!isResponse(event.data)) {
        this.failAll(
          new AppError(
            "INVALID_RESPONSE",
            "The storage worker returned an invalid response. Retry the operation.",
          ),
        );
        return;
      }
      const response = event.data;
      const pending = this.pending.get(response.requestId);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(response.requestId);
      if (response.ok) pending.resolve(response.result);
      else pending.reject(new AppError(response.error.code, response.error.message));
    });
    const failed = () => {
      this.failAll(
        new AppError(
          "WORKER_FAILED",
          "The storage worker stopped. Your work is still in this tab. Retry to reconnect.",
        ),
      );
      worker.terminate();
      if (this.worker === worker) this.worker = null;
    };
    worker.addEventListener("error", failed);
    worker.addEventListener("messageerror", failed);
    this.worker = worker;
    return worker;
  }
  request<K extends keyof Operations>(
    operation: K,
    payload: Operations[K]["payload"],
  ): Promise<Operations[K]["result"]> {
    return new Promise((resolve, reject) => {
      let worker: Pick<Worker, "postMessage" | "addEventListener" | "terminate">;
      try {
        worker = this.connect();
      } catch {
        reject(
          new AppError(
            "WORKER_UNAVAILABLE",
            "Could not start browser storage. Retry, or choose Memory only in Settings.",
          ),
        );
        return;
      }
      const requestId = crypto.randomUUID();
      const [scope, type] = operation.split(".");
      const envelope: RequestEnvelope = {
        protocolVersion: 1,
        requestId,
        scope: scope!,
        type: type!,
        payload,
      };
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(
          new AppError(
            "WORKER_TIMEOUT",
            "Browser storage took too long. Your work is still here. Retry saving.",
          ),
        );
      }, this.timeout);
      // Feature repositories validate result payloads before returning domain data.
      this.pending.set(requestId, {
        resolve: (value) => resolve(value as Operations[K]["result"]),
        reject,
        timer,
      });
      try {
        worker.postMessage(envelope);
      } catch {
        clearTimeout(timer);
        this.pending.delete(requestId);
        reject(
          new AppError(
            "WORKER_SEND_FAILED",
            "Could not send work to browser storage. Retry the operation.",
          ),
        );
      }
    });
  }
}
