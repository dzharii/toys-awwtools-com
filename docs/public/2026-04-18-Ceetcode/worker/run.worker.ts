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

const wasmMagic = [0x00, 0x61, 0x73, 0x6d] as const;

function isWasmBinary(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === wasmMagic[0] &&
    bytes[1] === wasmMagic[1] &&
    bytes[2] === wasmMagic[2] &&
    bytes[3] === wasmMagic[3]
  );
}

function formatMagic(bytes: Uint8Array): string {
  return [...bytes.slice(0, 4)].map((value) => value.toString(16).padStart(2, "0")).join(" ");
}

function previewAscii(bytes: Uint8Array): string {
  const previewBytes = bytes.slice(0, 96);
  const text = new TextDecoder().decode(previewBytes).replace(/\s+/g, " ").trim();
  return text.slice(0, 80);
}

async function fetchWasmBytes(filename: string): Promise<{ bytes: ArrayBuffer; contentType: string; resolvedUrl: string }> {
  const response = await fetch(filename);
  if (!response.ok) {
    throw new Error(`Failed to load wasm module ${filename}: HTTP ${response.status}`);
  }

  const bytes = await response.arrayBuffer();
  const view = new Uint8Array(bytes);
  const contentType = response.headers.get("content-type") ?? "unknown";
  const resolvedUrl = response.url || filename;
  if (!isWasmBinary(view)) {
    throw new Error(
      `Invalid wasm bytes for ${filename} (${resolvedUrl}); content-type=${contentType}; magic=${formatMagic(view)}; preview="${previewAscii(view)}"`
    );
  }

  return { bytes, contentType, resolvedUrl };
}

async function compileWasmModule(filename: string): Promise<WebAssembly.Module> {
  const { bytes, contentType, resolvedUrl } = await fetchWasmBytes(filename);

  if (WebAssembly.compileStreaming && /^application\/wasm(?:;|$)/i.test(contentType)) {
    try {
      const streamResponse = new Response(bytes, {
        headers: { "Content-Type": "application/wasm" }
      });
      return await WebAssembly.compileStreaming(Promise.resolve(streamResponse));
    } catch (streamingError) {
      runWorkerLog.warn("compileStreaming failed; using ArrayBuffer fallback", {
        subcategory: "WasmLoad",
        context: {
          filename,
          resolvedUrl,
          reason: streamingError instanceof Error ? streamingError.message : String(streamingError)
        }
      });
    }
  }

  if (!/^application\/wasm(?:;|$)/i.test(contentType)) {
    runWorkerLog.warn("Wasm module served without application/wasm MIME; using ArrayBuffer compile fallback", {
      subcategory: "WasmLoad",
      context: { filename, resolvedUrl, contentType }
    });
  }

  return WebAssembly.compile(bytes);
}

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
      compileStreaming: compileWasmModule,
      hostWrite: (chunk) => {
        runtimeLog += chunk;
      },
      clang: vendorAssetUrl("clang.wasm"),
      lld: vendorAssetUrl("lld.wasm"),
      memfs: vendorAssetUrl("memfs.wasm"),
      sysroot: vendorAssetUrl("sysroot.tar")
    }) as InstanceType<typeof API> & { __getLog?: () => string; __clearLog?: () => void };

    api.__getLog = () => runtimeLog;
    api.__clearLog = () => {
      runtimeLog = "";
    };

    runtimeApiPromise = api.ready.then(() => api).catch((error) => {
      runtimeApiPromise = null;
      throw error;
    });
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

  let responsePayload: RunResponsePayload;
  runWorkerLog.info("Run request received", {
    context: { requestId, runId, wasmByteLength: wasmBytes.byteLength }
  });

  try {
    const api = await buildApi();
    const logApi = api as InstanceType<typeof API> & { __getLog: () => string; __clearLog: () => void };
    logApi.__clearLog();

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
    const logApi = (await runtimeApiPromise?.catch(() => null)) as
      | (InstanceType<typeof API> & { __getLog: () => string; __clearLog: () => void })
      | null;
    responsePayload = makeFailure(runId, logApi ? logApi.__getLog() : "", error instanceof Error ? error.message : String(error));
  }

  const response: RunWorkerResponse = {
    requestId,
    type: "run-result",
    payload: responsePayload
  };

  globalSelf.postMessage(response);
};
