# TCC Feasibility Checkpoint
Date: 2026-04-18

## Goal
Determine if TinyCC can satisfy the preferred browser-native TCC->Wasm emission path for this product.

## Inputs
- Vendored TinyCC source: `vendor/tinycc`
- Direct source inspection and local build experiments

## Experiments

### 1) Backend/target inspection
Command:
- `rg -n "wasm|webassembly|wasm32|wasi" vendor/tinycc`

Result:
- No WebAssembly backend implementation surfaced.
- Source tree contains backends for native targets (e.g., `i386-*`, `x86_64-*`, `arm-*`, `riscv64-*`).

### 2) Configure/build and target capability check
Commands:
- `cd vendor/tinycc && ./configure --help`
- `cd vendor/tinycc && ./configure --cpu=x86_64 --targetos=Linux && make -j2`
- `cd vendor/tinycc && ./tcc -h`

Observed:
- Help/options expose native target paths and cross options but no wasm target mode.
- Local native build succeeded.

### 3) Wasm-target probing
Commands:
- `./tcc -c /tmp/tcc_probe.c -o /tmp/tcc_probe.wasm -mwasm32`
- `od -An -tx1 -N16 /tmp/tcc_probe.wasm`
- `./tcc -c /tmp/tcc_probe.c -o /tmp/tcc_probe.wasm --target=wasm32`
- `./configure --cpu=wasm32 --targetos=Linux`

Observed:
- `-mwasm32` did not produce a Wasm binary; output magic bytes were ELF (`7f 45 4c 46 ...`).
- `--target=wasm32` rejected as invalid option.
- `--cpu=wasm32` rejected (`Unsupported CPU`).

## Conclusion
For this codebase and toolchain state, TinyCC does not provide a direct wasm32 backend path required for browser-native TCC->Wasm emission.

## Decision impact
- TCC remains vendored and documented as primary research path.
- Production browser execution path uses fallback backend (`wasm-clang`) while preserving adapter boundary and UX contract.
