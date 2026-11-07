---
file: "src/main.c"
---

The entry point enforces experiment order. Dataset generation is an explicit command; a normal benchmark cannot rewrite the answer labels.

<!-- at: 1 -->
## Parse commands and validate numeric arguments

`strtoul` parses numeric options, while the end pointer and `errno` reject trailing junk and overflow. Command handling separates a completed help/list request from an invalid argument. The manifest header must agree with the requested seed and dataset version.

<!-- at: /** Finish the complete grid -->
## Freeze every calibrated policy before held-out evaluation

`calibrate_all` completes and closes the grid CSV first. `main` then evaluates the held-out manifest with those frozen policies and measures each method. Correctness tests and dataset validation run before calibration. A failed stage exits nonzero instead of generating a plausible report from partial results.


## Reference for the contracts used in this file

The reproduction instructions explain the seed, frozen manifests and command-line modes. Generation is explicit so an ordinary benchmark cannot rewrite its answer key. [Open reference](/build-commands/).
