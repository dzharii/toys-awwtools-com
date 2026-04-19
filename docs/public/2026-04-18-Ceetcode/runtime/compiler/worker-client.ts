import type {
  CompileRequestPayload,
  CompileResponsePayload,
  RunRequestPayload,
  RunResponsePayload
} from "../types";
import { createLogger } from "../logging";
import type {
  CompileWorkerRequest,
  CompileWorkerResponse,
  RunWorkerRequest,
  RunWorkerResponse
} from "./messages";

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export interface WorkerClientErrorEvent {
  source: "compile-worker" | "run-worker";
  message: string;
}

interface WorkerCompilerClientOptions {
  onError?: (event: WorkerClientErrorEvent) => void;
}

const workerLog = createLogger("WorkerClient", "Bridge");

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export class WorkerCompilerClient {
  private compileWorker: Worker;

  private runWorker: Worker;

  private pendingCompile = new Map<string, PendingRequest<CompileResponsePayload>>();

  private pendingRun = new Map<string, PendingRequest<RunResponsePayload>>();

  private readonly options: WorkerCompilerClientOptions;

  constructor(options: WorkerCompilerClientOptions = {}) {
    this.options = options;
    workerLog.info("Initializing compiler/run workers");
    this.compileWorker = this.createCompileWorker();
    this.runWorker = this.createRunWorker();
  }

  private emitError(source: WorkerClientErrorEvent["source"], message: string): void {
    this.options.onError?.({ source, message });
  }

  private resolveWorkerUrl(fileName: string): URL {
    return new URL(`./${fileName}`, import.meta.url);
  }

  private createCompileWorker(): Worker {
    const worker = new Worker(this.resolveWorkerUrl("compile.worker.js"));
    workerLog.info("Compile worker created");
    worker.onmessage = (event: MessageEvent<CompileWorkerResponse>) => {
      const { requestId, payload } = event.data;
      const pending = this.pendingCompile.get(requestId);
      if (!pending) return;
      this.pendingCompile.delete(requestId);
      workerLog.info("Compile worker response received", {
        context: { requestId, ok: payload.ok, pending: this.pendingCompile.size }
      });
      pending.resolve(payload);
    };
    worker.onerror = (event) => {
      const reason = new Error(`Compile worker error: ${event.message}`);
      this.emitError("compile-worker", reason.message);
      workerLog.error("Compile worker error", {
        context: { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno }
      });
      for (const [id, pending] of this.pendingCompile.entries()) {
        this.pendingCompile.delete(id);
        pending.reject(reason);
      }
    };
    return worker;
  }

  private createRunWorker(): Worker {
    const worker = new Worker(this.resolveWorkerUrl("run.worker.js"));
    workerLog.info("Run worker created");
    worker.onmessage = (event: MessageEvent<RunWorkerResponse>) => {
      const { requestId, payload } = event.data;
      const pending = this.pendingRun.get(requestId);
      if (!pending) return;
      this.pendingRun.delete(requestId);
      workerLog.info("Run worker response received", {
        context: { requestId, ok: payload.ok, pending: this.pendingRun.size }
      });
      pending.resolve(payload);
    };
    worker.onerror = (event) => {
      const reason = new Error(`Run worker error: ${event.message}`);
      this.emitError("run-worker", reason.message);
      workerLog.error("Run worker error", {
        context: { message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno }
      });
      for (const [id, pending] of this.pendingRun.entries()) {
        this.pendingRun.delete(id);
        pending.reject(reason);
      }
    };
    return worker;
  }

  private resetRunWorker(): void {
    this.runWorker.terminate();
    this.emitError("run-worker", "Run worker was reset.");
    workerLog.warn("Run worker reset", {
      context: { pendingRequests: this.pendingRun.size }
    });
    for (const [id, pending] of this.pendingRun.entries()) {
      this.pendingRun.delete(id);
      pending.reject(new Error("Run worker was reset."));
    }
    this.runWorker = this.createRunWorker();
  }

  private resetCompileWorker(): void {
    this.compileWorker.terminate();
    this.emitError("compile-worker", "Compile worker was reset.");
    workerLog.warn("Compile worker reset", {
      context: { pendingRequests: this.pendingCompile.size }
    });
    for (const [id, pending] of this.pendingCompile.entries()) {
      this.pendingCompile.delete(id);
      pending.reject(new Error("Compile worker was reset."));
    }
    this.compileWorker = this.createCompileWorker();
  }

  async compile(payload: CompileRequestPayload, timeoutMs = 140_000): Promise<CompileResponsePayload> {
    const requestId = randomId("compile");
    const message: CompileWorkerRequest = { requestId, type: "compile", payload };
    const startedAt = Date.now();
    workerLog.info("Compile request dispatched", {
      context: {
        requestId,
        runId: payload.runId,
        sourceLength: payload.source.length,
        tests: payload.tests.length
      }
    });

    const resultPromise = new Promise<CompileResponsePayload>((resolve, reject) => {
      this.pendingCompile.set(requestId, { resolve, reject });
      this.compileWorker.postMessage(message);
    });

    const result = await this.withTimeout(resultPromise, timeoutMs, () => this.resetCompileWorker(), "Compilation timed out.");
    workerLog.info("Compile request finished", {
      context: {
        requestId,
        runId: payload.runId,
        ok: result.ok,
        elapsedMs: Date.now() - startedAt
      }
    });
    return result;
  }

  async run(payload: RunRequestPayload, timeoutMs = 20_000): Promise<RunResponsePayload> {
    const requestId = randomId("run");
    const message: RunWorkerRequest = { requestId, type: "run", payload };
    const startedAt = Date.now();
    workerLog.info("Run request dispatched", {
      context: {
        requestId,
        runId: payload.runId,
        wasmBytes: payload.wasmBytes.byteLength
      }
    });

    const resultPromise = new Promise<RunResponsePayload>((resolve, reject) => {
      this.pendingRun.set(requestId, { resolve, reject });
      this.runWorker.postMessage(message, [payload.wasmBytes]);
    });

    const result = await this.withTimeout(resultPromise, timeoutMs, () => this.resetRunWorker(), "Execution timed out.");
    workerLog.info("Run request finished", {
      context: {
        requestId,
        runId: payload.runId,
        ok: result.ok,
        elapsedMs: Date.now() - startedAt
      }
    });
    return result;
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    onTimeout: () => void,
    timeoutMessage: string
  ): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        onTimeout();
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      return result as T;
    } finally {
      if (timer !== null) {
        clearTimeout(timer);
      }
    }
  }

  dispose(): void {
    workerLog.info("Disposing worker client");
    this.compileWorker.terminate();
    this.runWorker.terminate();
    this.pendingCompile.clear();
    this.pendingRun.clear();
  }
}
