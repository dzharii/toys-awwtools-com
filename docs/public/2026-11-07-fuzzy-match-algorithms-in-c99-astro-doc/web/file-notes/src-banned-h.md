---
file: "src/banned.h"
---

This is the unmodified header downloaded from Git. It is policy code, not a declaration of safer replacement functions. Provenance and the upstream license are in `licenses/`.

<!-- at: 1 -->
## Turn forbidden function calls into compiler errors

A call such as `strcpy(a,b)` expands to the undeclared identifier `sorry_strcpy_is_a_banned_function`. The compiler rejects it before linking. The project includes this header through `pm.h`, after system declarations. `make banned-check` attempts every banned call and requires that specific diagnostic. The initial failing project build and all 26 flagged call sites are preserved under `reports/`.


## Reference for the contracts used in this file

The provenance document records the pinned upstream Git header and license. It remains unmodified; the project demonstrates its bans with expected compilation failures. [Open reference](/standard-library-review/).
