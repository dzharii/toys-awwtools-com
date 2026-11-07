---
file: "package.json"
---

The package file declares only the optional documentation toolchain. The C program does not load these dependencies.

<!-- at: 1 -->
## Pin documentation dependencies and define reproducible commands

Exact dependency versions and the lockfile let `npm ci` reproduce the documentation installation. `build` prepares current source pages and runs Astro. `check:docs` verifies generated output. Node must meet the declared engine requirement. Dataset generation and C compilation remain Make/GCC operations.

