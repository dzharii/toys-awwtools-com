import type {
  CompileRequestPayload,
  CompileResponsePayload,
  RunRequestPayload,
  RunResponsePayload
} from "../types";
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

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export class WorkerCompilerClient {
  private compileWorker: Worker;

  private runWorker: Worker;

  private pendingCompile = new Map<string, PendingRequest<CompileResponsePayload>>();

  private pendingRun = new Map<string, PendingRequest<RunResponsePayload>>();

  constructor() {
    this.compileWorker = this.createCompileWorker();
    this.runWorker = this.createRunWorker();
  }

  private createCompileWorker(): Worker {
    const worker = new Worker("/assets/compile.worker.js");
    worker.onmessage = (event: MessageEvent<CompileWorkerResponse>) => {
      const { requestId, payload } = event.data;
      const pending = this.pendingCompile.get(requestId);
      if (!pending) return;
      this.pendingCompile.delete(requestId);
      pending.resolve(payload);
    };
    worker.onerror = (event) => {
      const reason = new Error(`Compile worker error: ${event.message}`);
      for (const [id, pending] of this.pendingCompile.entries()) {
        this.pendingCompile.delete(id);
        pending.reject(reason);
      }
    };
    return worker;
  }

  private createRunWorker(): Worker {
    const worker = new Worker("/assets/run.worker.js");
    worker.onmessage = (event: MessageEvent<RunWorkerResponse>) => {
      const { requestId, payload } = event.data;
      const pending = this.pendingRun.get(requestId);
      if (!pending) return;
      this.pendingRun.delete(requestId);
      pending.resolve(payload);
    };
    worker.onerror = (event) => {
      const reason = new Error(`Run worker error: ${event.message}`);
      for (const [id, pending] of this.pendingRun.entries()) {
        this.pendingRun.delete(id);
        pending.reject(reason);
      }
    };
    return worker;
  }

  private resetRunWorker(): void {
    this.runWorker.terminate();
    for (const [id, pending] of this.pendingRun.entries()) {
      this.pendingRun.delete(id);
      pending.reject(new Error("Run worker was reset."));
    }
    this.runWorker = this.createRunWorker();
  }

  private resetCompileWorker(): void {
    this.compileWorker.terminate();
    for (const [id, pending] of this.pendingCompile.entries()) {
      this.pendingCompile.delete(id);
      pending.reject(new Error("Compile worker was reset."));
    }
    this.compileWorker = this.createCompileWorker();
  }

  async compile(payload: CompileRequestPayload, timeoutMs = 140_000): Promise<CompileResponsePayload> {
    const requestId = randomId("compile");
    const message: CompileWorkerRequest = { requestId, type: "compile", payload };

    const resultPromise = new Promise<CompileResponsePayload>((resolve, reject) => {
      this.pendingCompile.set(requestId, { resolve, reject });
      this.compileWorker.postMessage(message);
    });

    return this.withTimeout(resultPromise, timeoutMs, () => this.resetCompileWorker(), "Compilation timed out.");
  }

  async run(payload: RunRequestPayload, timeoutMs = 20_000): Promise<RunResponsePayload> {
    const requestId = randomId("run");
    const message: RunWorkerRequest = { requestId, type: "run", payload };

    const resultPromise = new Promise<RunResponsePayload>((resolve, reject) => {
      this.pendingRun.set(requestId, { resolve, reject });
      this.runWorker.postMessage(message, [payload.wasmBytes]);
    });

    return this.withTimeout(resultPromise, timeoutMs, () => this.resetRunWorker(), "Execution timed out.");
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
    this.compileWorker.terminate();
    this.runWorker.terminate();
    this.pendingCompile.clear();
    this.pendingRun.clear();
  }
}
