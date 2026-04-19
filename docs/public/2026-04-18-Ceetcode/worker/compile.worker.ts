/// <reference lib="webworker" />
import type { CompileWorkerRequest, CompileWorkerResponse } from "../runtime/compiler/messages";
import { generateHarnessSource } from "../runtime/harness/generate-harness";
import { parseCompileDiagnostics } from "../runtime/compiler/diagnostics";
import { createLogger } from "../runtime/logging";
import type { CompileResponsePayload } from "../runtime/types";

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
  showTiming: boolean;
  memfs: {
    addFile: (path: string, bytes: string | Uint8Array | ArrayBuffer) => void;
    getFileContents: (path: string) => Uint8Array;
  };
  clangFilename: string;
  lldFilename: string;
  clangCommonArgs: string[];
  getModule: (name: string) => Promise<WebAssembly.Module>;
  run: (module: WebAssembly.Module, ...args: string[]) => Promise<unknown>;
};

const globalSelf = self as DedicatedWorkerGlobalScope;
const vendorBaseUrl = new URL("../vendor/wasm-clang/", globalSelf.location.href);
const vendorAssetUrl = (name: string): string => new URL(name, vendorBaseUrl).toString();

(globalSelf as unknown as { importScripts: (...urls: string[]) => void }).importScripts(vendorAssetUrl("shared.js"));

let compilerApiPromise: Promise<InstanceType<typeof API>> | null = null;
const compileWorkerLog = createLogger("Worker", "Compile");

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
      compileWorkerLog.warn("compileStreaming failed; using ArrayBuffer fallback", {
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
    compileWorkerLog.warn("Wasm module served without application/wasm MIME; using ArrayBuffer compile fallback", {
      subcategory: "WasmLoad",
      context: { filename, resolvedUrl, contentType }
    });
  }

  return WebAssembly.compile(bytes);
}

function buildApi(): Promise<InstanceType<typeof API>> {
  if (!compilerApiPromise) {
    compileWorkerLog.info("Initializing compile worker API");
    let compileLog = "";
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
        compileLog += chunk;
      },
      clang: vendorAssetUrl("clang.wasm"),
      lld: vendorAssetUrl("lld.wasm"),
      memfs: vendorAssetUrl("memfs.wasm"),
      sysroot: vendorAssetUrl("sysroot.tar")
    }) as InstanceType<typeof API> & { __getLog?: () => string; __clearLog?: () => void };

    api.__getLog = () => compileLog;
    api.__clearLog = () => {
      compileLog = "";
    };

    compilerApiPromise = api.ready.then(() => api).catch((error) => {
      compilerApiPromise = null;
      throw error;
    });
  }

  return compilerApiPromise;
}

async function compileWithClang(api: InstanceType<typeof API>, inputPath: string, source: string, objectPath: string): Promise<void> {
  api.memfs.addFile(inputPath, source);
  const clang = await api.getModule(api.clangFilename);

  await api.run(
    clang,
    "clang",
    "-cc1",
    "-emit-obj",
    ...api.clangCommonArgs,
    "-std=c99",
    "-fno-threadsafe-statics",
    "-O2",
    "-o",
    objectPath,
    "-x",
    "c",
    inputPath
  );
}

async function linkObject(api: InstanceType<typeof API>, objectPath: string, outputPath: string): Promise<void> {
  const lld = await api.getModule(api.lldFilename);
  const stackSize = 1024 * 1024;

  await api.run(
    lld,
    "wasm-ld",
    "--no-threads",
    "--export-dynamic",
    "-z",
    `stack-size=${stackSize}`,
    "-Llib/wasm32-wasi",
    "lib/wasm32-wasi/crt1.o",
    objectPath,
    "-lc",
    "-lm",
    "-o",
    outputPath
  );
}

function makeFailure(runId: string, compilerLog: string, generatedSource: string, message: string): CompileResponsePayload {
  return {
    ok: false,
    runId,
    compilerLog,
    diagnostics: parseCompileDiagnostics(compilerLog),
    generatedSource,
    message
  };
}

globalSelf.onmessage = async (event: MessageEvent<CompileWorkerRequest>) => {
  if (event.data.type !== "compile") {
    return;
  }

  const { requestId, payload } = event.data;
  const { runId, problem, source, tests } = payload;

  const generated = generateHarnessSource(problem, source, tests);
  const inputPath = `${runId}.c`;
  const objectPath = `${runId}.o`;
  const wasmPath = `${runId}.wasm`;

  let responsePayload: CompileResponsePayload;
  compileWorkerLog.info("Compile request received", {
    context: {
      requestId,
      runId,
      problemId: problem.id,
      tests: tests.length,
      sourceLength: source.length
    }
  });

  try {
    const api = await buildApi();
    const logApi = api as InstanceType<typeof API> & { __getLog: () => string; __clearLog: () => void };
    logApi.__clearLog();

    await compileWithClang(api, inputPath, generated.fullSource, objectPath);
    await linkObject(api, objectPath, wasmPath);

    const wasmView = api.memfs.getFileContents(wasmPath);
    const wasmCopy = new Uint8Array(wasmView.length);
    wasmCopy.set(wasmView);

    responsePayload = {
      ok: true,
      runId,
      wasmBytes: wasmCopy.buffer,
      compilerLog: logApi.__getLog(),
      generatedSource: generated.fullSource
    };
    compileWorkerLog.info("Compile request succeeded", {
      context: {
        requestId,
        runId,
        wasmByteLength: wasmCopy.byteLength
      }
    });

    const response: CompileWorkerResponse = {
      requestId,
      type: "compile-result",
      payload: responsePayload
    };

    globalSelf.postMessage(response, [wasmCopy.buffer]);
    return;
  } catch (error) {
    compileWorkerLog.error("Compile request failed", {
      context: {
        requestId,
        runId,
        message: error instanceof Error ? error.message : String(error)
      }
    });
    const logApi = (await compilerApiPromise?.catch(() => null)) as
      | (InstanceType<typeof API> & { __getLog: () => string; __clearLog: () => void })
      | null;
    responsePayload = makeFailure(
      runId,
      logApi ? logApi.__getLog() : "",
      generated.fullSource,
      error instanceof Error ? error.message : String(error)
    );
  }

  const response: CompileWorkerResponse = {
    requestId,
    type: "compile-result",
    payload: responsePayload
  };
  globalSelf.postMessage(response);
};
