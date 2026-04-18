(() => {
  // runtime/harness/generate-harness.ts
  function escapeCString(value) {
    return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\"/g, "\\\"");
  }
  function toCInt(value) {
    if (typeof value === "boolean")
      return value ? 1 : 0;
    if (typeof value === "number")
      return value | 0;
    throw new Error(`Expected int-compatible value, got ${String(value)}`);
  }
  function buildArgDeclaration(testIndex, argName, kind, value) {
    const safeName = `arg_${testIndex}_${argName}`.replace(/[^a-zA-Z0-9_]/g, "_");
    if (kind === "int") {
      return { declaration: `int ${safeName} = ${toCInt(value)};`, expression: safeName };
    }
    if (kind === "bool") {
      return { declaration: `int ${safeName} = ${toCInt(value)};`, expression: safeName };
    }
    if (kind === "string") {
      if (typeof value !== "string") {
        throw new Error(`Expected string input for ${argName}`);
      }
      return {
        declaration: `const char* ${safeName} = "${escapeCString(value)}";`,
        expression: safeName
      };
    }
    if (kind === "int_array") {
      if (!Array.isArray(value)) {
        throw new Error(`Expected int array input for ${argName}`);
      }
      const ints = value.map((item) => toCInt(item));
      const literal = ints.length > 0 ? ints.join(", ") : "0";
      const declaration = `int ${safeName}_storage[${Math.max(ints.length, 1)}] = {${literal}};
    int* ${safeName} = ${safeName}_storage;`;
      return { declaration, expression: safeName };
    }
    throw new Error(`Unsupported argument kind: ${kind}`);
  }
  function buildExpectedLiteral(problem, value) {
    if (problem.signature.returnKind === "string") {
      if (typeof value !== "string") {
        throw new Error("Expected string return value");
      }
      return `"${escapeCString(value)}"`;
    }
    return String(toCInt(value));
  }
  function buildExpectedDisplay(problem, value) {
    if (problem.signature.returnKind === "string") {
      return typeof value === "string" ? value : "<invalid-string-expected>";
    }
    if (problem.signature.returnKind === "bool") {
      return toCInt(value) === 0 ? "false" : "true";
    }
    return String(toCInt(value));
  }
  function generateHarnessSource(problem, userSource, tests) {
    const sections = [];
    sections.push(`#include <stdio.h>`);
    sections.push(`#include <string.h>`);
    sections.push(`#include <stdint.h>`);
    sections.push(`#include <stdlib.h>`);
    sections.push(``);
    sections.push(`// User submission follows.`);
    sections.push(userSource.trim());
    sections.push(``);
    sections.push(`static void cee_print_escaped(const char* value) {`);
    sections.push(`    if (value == NULL) { printf("<null>"); return; }`);
    sections.push(`    while (*value) {`);
    sections.push(`        if (*value == '\\n') { printf("\\\\n"); }`);
    sections.push(`        else if (*value == '\\r') { printf("\\\\r"); }`);
    sections.push(`        else if (*value == '|') { printf("\\\\|"); }`);
    sections.push(`        else if (*value == '\\\\') { printf("\\\\\\\\"); }`);
    sections.push(`        else { putchar(*value); }`);
    sections.push(`        value++;`);
    sections.push(`    }`);
    sections.push(`}`);
    sections.push(``);
    sections.push(`int main(void) {`);
    sections.push(`    int cee_passed = 0;`);
    sections.push(`    int cee_failed = 0;`);
    tests.forEach((test, index) => {
      sections.push(``);
      sections.push(`    // Test ${index}: ${test.name}`);
      const callExpressions = [];
      for (const arg of problem.signature.arguments) {
        if (!(arg.name in test.input)) {
          throw new Error(`Missing test input value for argument ${arg.name} in test ${test.name}`);
        }
        const argValue = test.input[arg.name];
        const generated = buildArgDeclaration(index, arg.name, arg.kind, argValue);
        sections.push(`    ${generated.declaration}`);
        callExpressions.push(generated.expression);
      }
      sections.push(`    // Run target function from user code.`);
      if (problem.signature.returnKind === "string") {
        const expectedLiteral = buildExpectedLiteral(problem, test.expected);
        sections.push(`    const char* cee_expected_${index} = ${expectedLiteral};`);
        sections.push(`    const char* cee_actual_${index} = ${problem.signature.functionName}(${callExpressions.join(", ")});`);
        sections.push(`    int cee_pass_${index} = ((cee_expected_${index} == NULL && cee_actual_${index} == NULL) || (cee_expected_${index} != NULL && cee_actual_${index} != NULL && strcmp(cee_expected_${index}, cee_actual_${index}) == 0));`);
        sections.push(`    if (cee_pass_${index}) { cee_passed++; } else { cee_failed++; }`);
        sections.push(`    printf("__CEETEST__|${index}|%s|${escapeCString(test.name)}|", cee_pass_${index} ? "PASS" : "FAIL");`);
        sections.push(`    cee_print_escaped(cee_expected_${index});`);
        sections.push(`    printf("|");`);
        sections.push(`    cee_print_escaped(cee_actual_${index});`);
        sections.push(`    printf("\\n");`);
      } else {
        const expectedLiteral = buildExpectedLiteral(problem, test.expected);
        const expectedDisplay = buildExpectedDisplay(problem, test.expected);
        sections.push(`    int cee_expected_${index} = ${expectedLiteral};`);
        sections.push(`    int cee_actual_${index} = ${problem.signature.functionName}(${callExpressions.join(", ")});`);
        sections.push(`    int cee_pass_${index} = (cee_actual_${index} == cee_expected_${index});`);
        sections.push(`    if (cee_pass_${index}) { cee_passed++; } else { cee_failed++; }`);
        sections.push(`    printf("__CEETEST__|${index}|%s|${escapeCString(test.name)}|${escapeCString(expectedDisplay)}|%d\\n", cee_pass_${index} ? "PASS" : "FAIL", cee_actual_${index});`);
      }
    });
    sections.push(``);
    sections.push(`    printf("__CEESUMMARY__|%d|%d|%d\\n", cee_passed, cee_failed, ${tests.length});`);
    sections.push(`    return 0;`);
    sections.push(`}`);
    return {
      fullSource: sections.join(`
`),
      testCount: tests.length
    };
  }

  // runtime/harness/parse-harness-output.ts
  function stripAnsi(value) {
    return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
  }

  // runtime/compiler/diagnostics.ts
  var diagnosticRegex = /^(?<file>[^:\n]+):(?<line>\d+):(?<column>\d+):\s*(?<severity>warning|error|note|fatal error):\s*(?<message>.+)$/;
  function parseCompileDiagnostics(compilerLog) {
    const diagnostics = [];
    const clean = stripAnsi(compilerLog);
    for (const line of clean.split(/\r?\n/)) {
      const match = line.match(diagnosticRegex);
      if (!match || !match.groups)
        continue;
      diagnostics.push({
        file: match.groups.file,
        line: Number(match.groups.line),
        column: Number(match.groups.column),
        severity: match.groups.severity,
        message: match.groups.message.trim()
      });
    }
    return diagnostics;
  }

  // worker/compile.worker.ts
  var globalSelf = self;
  var vendorBaseUrl = new URL("../vendor/wasm-clang/", globalSelf.location.href);
  var vendorAssetUrl = (name) => new URL(name, vendorBaseUrl).toString();
  globalSelf.importScripts(vendorAssetUrl("shared.js"));
  var compilerApiPromise = null;
  function buildApi() {
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
      });
      api.__getLog = () => compileLog;
      api.__clearLog = () => {
        compileLog = "";
      };
      compilerApiPromise = api.ready.then(() => api);
    }
    return compilerApiPromise;
  }
  async function compileWithClang(api, inputPath, source, objectPath) {
    api.memfs.addFile(inputPath, source);
    const clang = await api.getModule(api.clangFilename);
    await api.run(clang, "clang", "-cc1", "-emit-obj", ...api.clangCommonArgs, "-std=c99", "-fno-threadsafe-statics", "-O2", "-o", objectPath, "-x", "c", inputPath);
  }
  async function linkObject(api, objectPath, outputPath) {
    const lld = await api.getModule(api.lldFilename);
    const stackSize = 1024 * 1024;
    await api.run(lld, "wasm-ld", "--no-threads", "--export-dynamic", "-z", `stack-size=${stackSize}`, "-Llib/wasm32-wasi", "lib/wasm32-wasi/crt1.o", objectPath, "-lc", "-lm", "-o", outputPath);
  }
  function makeFailure(runId, compilerLog, generatedSource, message) {
    return {
      ok: false,
      runId,
      compilerLog,
      diagnostics: parseCompileDiagnostics(compilerLog),
      generatedSource,
      message
    };
  }
  globalSelf.onmessage = async (event) => {
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
    const logApi = api;
    logApi.__clearLog();
    let responsePayload;
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
      const response2 = {
        requestId,
        type: "compile-result",
        payload: responsePayload
      };
      globalSelf.postMessage(response2, [wasmCopy.buffer]);
      return;
    } catch (error) {
      responsePayload = makeFailure(runId, logApi.__getLog(), generated.fullSource, error.message);
    }
    const response = {
      requestId,
      type: "compile-result",
      payload: responsePayload
    };
    globalSelf.postMessage(response);
  };
})();
