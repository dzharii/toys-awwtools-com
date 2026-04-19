/// <reference lib="webworker" />
import type { RunWorkerRequest, RunWorkerResponse } from "../runtime/compiler/messages";
import { createLogger } from "../runtime/logging";
import type { RunResponsePayload } from "../runtime/types";

declare const API: new (options: {
  readBuffer: (filename: string) => Promise<ArrayBuffer>;
  compileStreaming: (filename: string) => Promise<WebAssembly.Module>;
  hostWrite: (chunk: string) => void;
  clang?: string;
  lld?: string;
  memfs?: string;
  sysroot?: string;
}) => {
  ready: Promise<void>;
  memfs: {
    addFile: (path: string, bytes: string | Uint8Array | ArrayBuffer) => void;
  };
  run: (module: WebAssembly.Module, ...args: string[]) => Promise<unknown>;
};

const globalSelf = self as DedicatedWorkerGlobalScope;
const vendorBaseUrl = new URL("../vendor/wasm-clang/", globalSelf.location.href);
const vendorAssetUrl = (name: string): string => new URL(name, vendorBaseUrl).toString();

(globalSelf as unknown as { importScripts: (...urls: string[]) => void }).importScripts(vendorAssetUrl("shared.js"));

let runtimeApiPromise: Promise<InstanceType<typeof API>> | null = null;
const runWorkerLog = createLogger("Worker", "Runtime");

function buildApi(): Promise<InstanceType<typeof API>> {
  if (!runtimeApiPromise) {
    runWorkerLog.info("Initializing runtime worker API");
    let runtimeLog = "";
    const api = new API({
      readBuffer: async (filename) => {
        const response = await fetch(filename);
        if (!response.ok) {
          throw new Error(`Failed to read ${filename}: HTTP ${response.status}`);
        }
        return response.arrayBuffer();
      },
      compileStreaming: async (filename) => {
        const response = await fetch(filename);
        if (!response.ok) {
          throw new Error(`Failed to compile module ${filename}: HTTP ${response.status}`);
        }
        if (WebAssembly.compileStreaming) {
          const streamingResponse = response.clone();
          try {
            return await WebAssembly.compileStreaming(Promise.resolve(streamingResponse));
          } catch (streamingError) {
            // Some static hosts return a non-wasm content type; fall back to byte compilation.
            runWorkerLog.warn("compileStreaming failed; using ArrayBuffer fallback", {
              subcategory: "WasmLoad",
              context: { filename, reason: streamingError instanceof Error ? streamingError.message : String(streamingError) }
            });
          }
        }
        return WebAssembly.compile(await response.arrayBuffer());
      },
      hostWrite: (chunk) => {
        runtimeLog += chunk;
      },
      clang: vendorAssetUrl("clang"),
      lld: vendorAssetUrl("lld"),
      memfs: vendorAssetUrl("memfs"),
      sysroot: vendorAssetUrl("sysroot.tar")
    }) as InstanceType<typeof API> & { __getLog?: () => string; __clearLog?: () => void };

    api.__getLog = () => runtimeLog;
    api.__clearLog = () => {
      runtimeLog = "";
    };

    runtimeApiPromise = api.ready.then(() => api);
  }

  return runtimeApiPromise;
}

function makeFailure(runId: string, runtimeLog: string, message: string): RunResponsePayload {
  return {
    ok: false,
    runId,
    runtimeLog,
    message
  };
}

globalSelf.onmessage = async (event: MessageEvent<RunWorkerRequest>) => {
  if (event.data.type !== "run") {
    return;
  }

  const { requestId, payload } = event.data;
  const { runId, wasmBytes } = payload;

  const wasmPath = `${runId}-runtime.wasm`;
  const api = await buildApi();
  const logApi = api as InstanceType<typeof API> & { __getLog: () => string; __clearLog: () => void };
  logApi.__clearLog();

  let responsePayload: RunResponsePayload;
  runWorkerLog.info("Run request received", {
    context: { requestId, runId, wasmByteLength: wasmBytes.byteLength }
  });

  try {
    const bytes = new Uint8Array(wasmBytes);
    api.memfs.addFile(wasmPath, bytes);
    const module = await WebAssembly.compile(bytes);
    await api.run(module, wasmPath);

    responsePayload = {
      ok: true,
      runId,
      runtimeLog: logApi.__getLog()
    };
    runWorkerLog.info("Run request succeeded", {
      context: { requestId, runId }
    });
  } catch (error) {
    runWorkerLog.error("Run request failed", {
      context: {
        requestId,
        runId,
        message: error instanceof Error ? error.message : String(error)
      }
    });
    responsePayload = makeFailure(runId, logApi.__getLog(), (error as Error).message);
  }

  const response: RunWorkerResponse = {
    requestId,
    type: "run-result",
    payload: responsePayload
  };

  globalSelf.postMessage(response);
};
