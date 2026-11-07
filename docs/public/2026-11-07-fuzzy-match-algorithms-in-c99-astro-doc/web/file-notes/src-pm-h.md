---
file: "src/pm.h"
---

This shared header is beside the C sources in `src/`. It defines the structures and function declarations exchanged by parsing, matching, binding and benchmarking.

<!-- at: 1 -->
## Represent ownership, bounds and stage outputs

`Entry` contains parsed strings. `Prepared` contains joined characters plus tokens. `Property` caches canonical representations. `Resolution` stores a status and two candidate indices; -1 means no candidate. Most arrays own their bytes. `Registry.p` borrows an array whose lifetime must cover every lookup. `Evaluation` retains a frozen policy, counts, per-case records and timings. The final include enables Git's banned-function macros for every translation unit using this API. Include system headers first so those macros cannot alter their declarations.


## Reference for the contracts used in this file

C99 sections 6.5.2.2 and 6.5.6 cover function calls and pointer arithmetic. The comments here add project-specific ownership and index contracts. [Open reference](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf).
