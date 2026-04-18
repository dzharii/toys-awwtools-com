(() => {
  // worker/run.worker.ts
  var globalSelf = self;
  var vendorBaseUrl = new URL("../vendor/wasm-clang/", globalSelf.location.href);
  var vendorAssetUrl = (name) => new URL(name, vendorBaseUrl).toString();
  globalSelf.importScripts(vendorAssetUrl("shared.js"));
  var runtimeApiPromise = null;
  function buildApi() {
    if (!runtimeApiPromise) {
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
            return WebAssembly.compileStreaming(Promise.resolve(response));
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
      });
      api.__getLog = () => runtimeLog;
      api.__clearLog = () => {
        runtimeLog = "";
      };
      runtimeApiPromise = api.ready.then(() => api);
    }
    return runtimeApiPromise;
  }
  function makeFailure(runId, runtimeLog, message) {
    return {
      ok: false,
      runId,
      runtimeLog,
      message
    };
  }
  globalSelf.onmessage = async (event) => {
    if (event.data.type !== "run") {
      return;
    }
    const { requestId, payload } = event.data;
    const { runId, wasmBytes } = payload;
    const wasmPath = `${runId}-runtime.wasm`;
    const api = await buildApi();
    const logApi = api;
    logApi.__clearLog();
    let responsePayload;
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
    } catch (error) {
      responsePayload = makeFailure(runId, logApi.__getLog(), error.message);
    }
    const response = {
      requestId,
      type: "run-result",
      payload: responsePayload
    };
    globalSelf.postMessage(response);
  };
})();
