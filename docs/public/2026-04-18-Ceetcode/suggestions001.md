2026-04-18
A00. Product specification overview

This document specifies a static, browser-only coding platform for solving programming problems in C99 with a LeetCode-like user experience. The implementation target is a static website bundled with Bun, with all compilation and execution performed on the client side. The intended downstream consumer of this specification is Codex running in a Linux environment under WSL, which will use this document as the implementation contract.

The product goal is to let a user open a problem, edit a single C99 source file, run tests, and receive deterministic results without any server-side compilation or execution. The visual model is LeetCode-like: a problem panel on the left, a code editor on the right, and a tests/output area associated with the editor. The code is compiled and executed entirely in the browser. WebAssembly is the desired execution target because browsers natively compile and instantiate Wasm modules through the WebAssembly JavaScript APIs, and compiled modules can be instantiated repeatedly and shared with workers. ([MDN Web Docs][1])

B00. Product scope and non-goals

The platform supports single-file C99 submissions only. There is no multi-file project model in the initial version. The user writes one source file per problem, and the system supplies the harness and the test runner.

The platform supports LeetCode-style function problems rather than unrestricted shell-style programs. Standard input and standard output remain available for debugging and for selected problems, but the primary model is a harness API that calls a user-defined function according to a problem-specific signature. The harness owns test setup, invocation, assertion, and result reporting.

The language target is strict C99. The user explicitly does not want GNU extensions or a broader language mode. The standard library surface is the C99 library set, subject to what can be reasonably emulated in the browser runtime. The product should present this as "C99 in the browser" rather than as a generic hosted Unix C environment.

The initial version is not a general-purpose local IDE, not a multi-language system, and not a backend-assisted online judge. It is not required to support arbitrary filesystem access, processes, sockets, threads, or OS-specific behavior.

C00. Architecture decision summary

The system is fully client-side. Compilation happens in a dedicated Web Worker. Execution also happens in a dedicated worker context or a worker-managed WebAssembly instance so the main UI thread remains responsive. MDN explicitly documents Web Workers as the mechanism for background execution separate from the main thread, and WebAssembly modules can be compiled and instantiated through standard browser APIs. ([MDN Web Docs][1])

The preferred architecture is this: the user edits a single C99 file, the source is sent to a compiler worker, the worker compiles the code, the resulting compiled artifact is executed in the browser, and the harness collects return values, output, assertion failures, and runtime errors. The ideal artifact is a WebAssembly module produced inside the browser and then instantiated by the browser's WebAssembly runtime. That is technically aligned with the web platform, because browsers can validate, compile, instantiate, and re-instantiate Wasm modules directly. ([MDN Web Docs][1])

The chosen research path is TinyCC. However, this choice carries a major technical risk: TinyCC does not have an official WebAssembly backend, and available documentation and discussion indicate no established native Wasm-emission path in TCC itself. TCC is centered around native targets and very fast native compilation, not browser-oriented Wasm emission. ([GNU Mail][2])

Therefore the specification distinguishes between the product decision and the engineering risk. The product decision is "TCC-first". The engineering truth is that TCC-to-Wasm inside the browser is a research task, not a solved integration.

D00. User experience requirements

The user interface must follow a LeetCode-like layout. The left panel displays the problem statement, examples, constraints, and function signature. The right panel displays the code editor. Beneath or adjacent to the editor is a test area where the user can run sample tests, custom tests, and the official visible tests. Console output is visible when relevant, but the main result model is structured test feedback rather than a raw terminal log.

The primary interaction loop is fast edit-run-debug. The user presses Run, compilation starts immediately in the background, tests execute, and the UI updates with pass/fail results, return values, execution errors, and any captured output. The user should not need to manage files, build commands, or runtime configuration manually.

The editor should support syntax highlighting for C, inline diagnostics if available, keyboard shortcuts for Run and Submit, and persistent local draft recovery. The tests view should show input, expected result, actual result, and any captured output. The system should privilege clarity and deterministic behavior over advanced IDE features.

E00. Problem model and harness API

Each problem defines a canonical C function signature. The user implements only that function inside a single source file. The platform generates or provides a harness that includes test cases, type adapters where necessary, and validation logic.

A problem package must define the problem metadata, the textual statement, the required function signature, the visible sample tests, the hidden or locked tests if such a notion is later added locally, and the harness logic. The harness is responsible for constructing inputs, calling the user function, comparing expected and actual values, and serializing the results back to the UI.

The harness model must support primitive arguments, arrays, strings, structs where needed, and deterministic result comparison. The preferred comparison output is structured and problem-aware rather than text-only. Standard input and standard output are secondary facilities. They may be used for debugging or special problems, but they are not the default contract between problem and solution.

F00. Language and library support

The platform targets strict C99. The implementation must reject unsupported dialect features when feasible and must document any areas where practical browser constraints force partial behavior.

The runtime library surface should aim for broad C99 standard library coverage rather than a minimal subset. The user's decision is to support the standard C99 libraries, not a narrow educational subset. However, "support" here means browser-hosted emulation where necessary. It does not imply a full hosted OS environment.

The implementation should classify library support into three categories. Fully supported functions behave normally within the browser-hosted model. Emulated functions behave according to a browser-specific implementation that preserves expected C99 semantics as closely as possible. Unsupported functions should fail clearly and predictably. The resulting product documentation must state exactly which headers and functions are implemented, which are emulated, and which are unavailable.

G00. Compiler decision and implications

The chosen compiler path is TinyCC. This is a deliberate product decision driven by a desire for a small, fast, C-focused compiler. TCC's documented strengths are fast compilation, small size, and C99-oriented design. Its docs state that it compiles and links substantially faster than `gcc -O0` and is moving toward full ISO C99 support. ([Fabrice Bellard][3])

However, this specification must state the following clearly for Codex: TCC is not presently a browser-native Wasm compiler. Public documentation and discussion indicate that TCC is built around native machine-code targets and that there is no known official Wasm backend to rely on. ([GNU Mail][2])

Therefore Codex must treat TCC integration as a staged implementation:

Stage 1 is to get TCC itself running inside the browser environment, most likely as a WebAssembly-compiled tool running in a worker. Existing public experiments show that TCC can be run in the browser through WebAssembly-based approaches or emulator-based approaches, so this is plausible as an engineering task. ([GitHub][4])

Stage 2 is to determine whether TCC can be made to emit an artifact suitable for browser execution without introducing a full machine emulator in the final execution path.

Stage 3 is to finalize the execution path based on feasibility.

H00. Required execution-path investigation

Codex must evaluate the following execution strategies in order and document findings.

The first and preferred strategy is direct TCC-to-Wasm emission. In this model, TCC runs inside the browser worker and emits a WebAssembly binary module, which the browser then validates, compiles, and instantiates using the WebAssembly APIs. This is the target architecture because it is the cleanest static-site design. WebAssembly is the correct browser-native executable format, and browsers already provide the necessary compile and instantiate mechanisms. ([MDN Web Docs][1])

The second strategy is TCC-to-native-target plus browser-side translation or adaptation. This is less desirable because it introduces an extra code generation or binary translation layer and increases implementation complexity.

The third strategy is TCC-inside-emulator. In this model, TCC compiles user code for a native architecture that is then executed under an emulator running in the browser. Existing public proofs of concept show this approach is possible. ([GitHub][5])

The fourth strategy, which is the fallback if TCC cannot produce a viable browser-native execution pipeline, is to preserve the product UX and switch the backend while keeping the rest of the architecture unchanged. This fallback exists because the product requirement is browser-only C99 execution, while TCC is a chosen means rather than an inviolable end in itself.

I00. Required answer to the user's central question

The user's central question is whether a static browser application can run a compiler inside WebAssembly, have that compiler emit another WebAssembly module, and then run that emitted module entirely in the browser.

The answer is yes in principle. A browser can host one Wasm module that performs compilation work and can then pass bytes representing another Wasm module to JavaScript for validation, compilation, and instantiation. The web platform supports Wasm modules as binary values and supports compiling and instantiating modules dynamically. The limitation is not the browser platform. The limitation is whether the selected compiler can actually emit valid Wasm in the first place. ([MDN Web Docs][1])

So the browser platform supports "Wasm module produces bytes for another Wasm module, then runs it". The current risk is specifically TCC's lack of an established Wasm backend, not any browser prohibition against this architecture. ([GNU Mail][2])

J00. Runtime isolation and safety model

All compile and run operations must occur off the main thread. The main UI thread is reserved for rendering, editor interactions, and result presentation. The compile worker owns compiler initialization, source compilation, binary artifact production, and diagnostic reporting. A run worker or worker-owned execution context owns instantiation, host imports, stdout/stderr capture, timeout enforcement, and result serialization.

The runtime must enforce deterministic limits. It should support execution timeouts, memory ceilings where practical, and a bounded host import surface. The user code must not gain arbitrary access to the DOM, network, cookies, or persistent site internals unless such access is explicitly part of a future feature and separately sandboxed.

Because the app is static and browser-only, the runtime must assume the browser sandbox is the first line of isolation and the worker boundary is the second. The harness host functions are the only intended bridge between user code and the page.

K00. Build, bundling, and dependency strategy

The application is a static site built with Bun. Bun is used for bundling and local development, but third-party runtime dependencies should be vendored into the repository instead of being fetched dynamically from npm at runtime. Bun's bundler is suitable for building a static site bundle from local assets and modules. ([TinyGo][6])

The repository should contain a `lib/` or `vendor/` directory that stores pinned upstream artifacts or source snapshots. Codex should create scripts to fetch and verify these artifacts from authoritative upstream sources, record exact versions, and keep the app reproducible. The platform should avoid opaque runtime CDN dependencies wherever feasible.

L00. Suggested repository structure

Codex should structure the implementation as a monorepo-like static project with clear separations between UI, problem content, compiler integration, runtime, and vendored dependencies.

A suitable top-level structure is as follows in prose form. There should be an `app/` directory for the main browser UI. There should be a `worker/` directory for compile and run workers. There should be a `runtime/` directory for host imports, stdout/stderr capture, harness execution, and browser-specific emulation layers. There should be a `problems/` directory containing problem definitions, statements, and harness metadata. There should be a `vendor/` directory for TCC and any other third-party code. There should be a `scripts/` directory for fetch, build, and validation scripts. There should be a `docs/` directory for product and technical documentation.

M00. Problem package format

Each problem package should define an identifier, title, difficulty, statement, examples, constraints, signature specification, visible tests, and harness logic. The harness definition should be declarative where possible, but it may include generated C code or runtime metadata if needed.

The function signature must be explicit and machine-readable. For example, a problem might define a function returning `int` and taking `int* nums, int numsSize, int target`. The harness package then knows how to materialize test data, call the function, and compare the return value.

Codex should make the harness generation system general enough to support arrays, strings, structs, and multiple return conventions, but it should avoid becoming a full ABI laboratory in the first implementation.

N00. Output and diagnostics model

Compilation diagnostics must be captured with filename, line, column, severity, and message when available. Runtime errors must be classified separately from compile errors. Test failures must show the expected and actual values in a problem-aware manner.

The system should expose stdout and stderr as separate streams and associate them with a specific run. Console output is useful, but the primary result model is structured testing feedback. The UI should distinguish between "compiled but failed tests", "runtime trap or execution failure", and "compile error".

O00. Offline and cache behavior

The platform should work as a static site and should aim for offline usability after initial load. Compiler assets, editor assets, and problem metadata should be cached locally. The product should persist unsaved source drafts and last-opened problem state in browser storage.

Codex should design the asset model so large compiler-related binaries are cacheable and versioned. The system should tolerate refreshes and offline revisits without losing the user's code.

P00. Performance goals

The user experience target is "feels like LeetCode". That means the editor opens quickly, problem switching is responsive, draft recovery is immediate, and running small test cases feels fast enough for iterative coding.

Compilation startup latency must be minimized by caching initialized compiler assets where possible. The compiler worker should be long-lived rather than recreated on every run. The runtime should reuse instantiated host state where safe. The product should prefer predictable low-latency behavior over aggressive but fragile optimizations.

Q00. Engineering constraints for Codex

Codex will run in WSL/Linux and produce a static site project. Codex should optimize for local build reproducibility, clear separation between research code and production code, and explicit feature flags around the uncertain compiler path.

Codex must not assume that TCC-to-Wasm emission is already solved. It must instead implement discovery checkpoints and preserve a fallback path. The UI, problem model, harness API, and worker architecture should be built so that the compiler backend can be replaced if needed without rewriting the product.

R00. Required implementation phases

Phase 1 is the product shell. Build the static site, split the layout into problem/editor/tests, integrate the editor, and define the problem package format.

Phase 2 is the worker runtime shell. Implement compile and run workers, structured messaging, run lifecycle management, timeout handling, and output capture.

Phase 3 is the TCC research integration. Vendor TCC, attempt to compile or adapt it for browser execution, and validate whether it can serve as the compiler engine inside a worker.

Phase 4 is browser-native execution investigation. Attempt the preferred path of producing WebAssembly output. If that path is not feasible, document exactly why.

Phase 5 is fallback stabilization. If TCC cannot provide a viable browser-native execution pipeline, preserve the UX contract and swap only the backend component.

S00. Acceptance criteria

The initial product is acceptable when a user can open a static web page, load a problem, edit a single C99 source file, press Run, and see deterministic pass/fail results for visible tests without any server communication.

It is acceptable when compilation and execution do not block the UI, the editor preserves drafts locally, the layout matches the left-problem/right-editor mental model, and problem harnesses can call user-defined functions in a LeetCode-like style.

It is acceptable when the system clearly documents which parts of C99 library behavior are fully supported, emulated, or unavailable.

It is acceptable when the implementation documents whether TCC successfully emits browser-executable WebAssembly. If yes, that path becomes the default runtime. If not, the implementation must include a documented fallback that still satisfies the product goal of browser-only execution.

T00. Explicit decisions adopted from the user's comments

The following decisions are fixed by this specification. The product is single-file only. The problem model is LeetCode-like function implementation with harness-driven tests. The language target is strict C99. The site is fully client-side. Compilation and execution run in workers. The desired execution artifact is WebAssembly. The UI is LeetCode-like with problem panel, editor panel, and tests/output area. The runtime library goal is the C99 standard library surface rather than a deliberately minimal subset. The chosen first compiler path is TCC, with explicit acknowledgment that this is a research-heavy backend choice.

U00. Instruction to Codex

Implement the product so that the user-facing system is stable even if the compiler backend evolves. Treat TCC integration as an experimental primary path with a mandatory feasibility checkpoint. Build the UI, problem model, harness API, worker isolation, and result presentation first, and keep the backend boundary narrow and replaceable.

When evaluating TCC, answer this specific question with code and documentation: can the browser-hosted TCC path produce a browser-executable artifact, ideally WebAssembly, that can be instantiated and run entirely inside the static application? If yes, adopt that architecture. If no, preserve the product design and implement the nearest viable browser-only fallback while documenting the reason TCC could not satisfy the preferred path.

[1]: https://developer.mozilla.org/en-US/docs/WebAssembly?utm_source=chatgpt.com "WebAssembly - MDN Web Docs - Mozilla"
[2]: https://mail.gnu.org/archive/html/tinycc-devel/2020-02/msg00017.html?utm_source=chatgpt.com "Re: [Tinycc-devel] WebAssembly backend"
[3]: https://bellard.org/tcc/tcc-doc.html?utm_source=chatgpt.com "Tiny C Compiler Reference Documentation"
[4]: https://github.com/lupyuen/tcc-riscv32-wasm?utm_source=chatgpt.com "GitHub - lupyuen/tcc-riscv32-wasm"
[5]: https://github.com/pixeltris/webc86?utm_source=chatgpt.com "pixeltris/webc86: Compile / run C in a web browser via ..."
[6]: https://tinygo.org/docs/guides/webassembly/?utm_source=chatgpt.com "WebAssembly"
