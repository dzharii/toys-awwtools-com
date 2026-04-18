/// <reference lib="webworker" />
import type { CompileWorkerRequest, CompileWorkerResponse } from "../runtime/compiler/messages";
import { generateHarnessSource } from "../runtime/harness/generate-harness";
import { parseCompileDiagnostics } from "../runtime/compiler/diagnostics";
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

function buildApi(): Promise<InstanceType<typeof API>> {
  if (!compilerApiPromise) {
    let compileLog = "";
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
          return WebAssembly.compileStreaming(Promise.resolve(response));
        }
        const bytes = await response.arrayBuffer();
        return WebAssembly.compile(bytes);
      },
      hostWrite: (chunk) => {
        compileLog += chunk;
      },
      clang: vendorAssetUrl("clang"),
      lld: vendorAssetUrl("lld"),
      memfs: vendorAssetUrl("memfs"),
      sysroot: vendorAssetUrl("sysroot.tar")
    }) as InstanceType<typeof API> & { __getLog?: () => string; __clearLog?: () => void };

    api.__getLog = () => compileLog;
    api.__clearLog = () => {
      compileLog = "";
    };

    compilerApiPromise = api.ready.then(() => api);
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

  const api = await buildApi();
  const logApi = api as InstanceType<typeof API> & { __getLog: () => string; __clearLog: () => void };
  logApi.__clearLog();

  let responsePayload: CompileResponsePayload;

  try {
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

    const response: CompileWorkerResponse = {
      requestId,
      type: "compile-result",
      payload: responsePayload
    };

    globalSelf.postMessage(response, [wasmCopy.buffer]);
    return;
  } catch (error) {
    responsePayload = makeFailure(runId, logApi.__getLog(), generated.fullSource, (error as Error).message);
  }

  const response: CompileWorkerResponse = {
    requestId,
    type: "compile-result",
    payload: responsePayload
  };
  globalSelf.postMessage(response);
};
