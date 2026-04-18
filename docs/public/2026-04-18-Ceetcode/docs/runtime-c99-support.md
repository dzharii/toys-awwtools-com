# C99 Runtime Support Status

Current runtime is browser-hosted clang/lld + WASI-style libc from `wasm-clang` sysroot.

## Classification

- Supported: common C99 library paths used for algorithm problems (`stdio`, `stdlib`, `string`, `ctype`, math basics).
- Emulated: environment/time/process-adjacent behavior where browser-hosted WASI differs from OS-hosted C.
- Unsupported: full OS process and signal semantics.

## Known limitations

- `stderr` is not exposed as a separate channel by the current memfs host callback API; output is currently merged in runtime logs.
- The system targets algorithm-style function problems, not full hosted Unix behavior.
- Browser sandbox restrictions apply (no real filesystem/process/socket model for user code).

## User-facing behavior

- Compile errors are shown separately from runtime/test outcomes.
- Runtime output is surfaced with structured harness results.
- Deterministic harness result markers are parsed from program output.
