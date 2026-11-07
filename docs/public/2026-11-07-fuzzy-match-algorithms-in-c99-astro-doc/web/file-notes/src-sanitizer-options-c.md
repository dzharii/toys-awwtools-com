---
file: "src/sanitizer_options.c"
---

This file configures the sanitizer runtime for the restricted execution host. It does not alter matching or disable address/undefined-behavior checks.

<!-- at: 1 -->
## Control leak checking independently of the other sanitizers

Sanitizer builds expose a runtime-options hook. `SANITIZER_LEAKS=0` avoids LeakSanitizer process-inspection operations unavailable on this host. On an unrestricted machine, `make -B SANITIZER_LEAKS=1 sanitize` enables leak checking. Ordinary optimized builds do not define this hook.


## Reference for the contracts used in this file

The project build instructions explain AddressSanitizer and UndefinedBehaviorSanitizer checks and the host limitation on leak detection. [Open reference](/build-commands/).
