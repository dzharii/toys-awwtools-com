---
file: "Makefile"
---

The Makefile keeps the C experiment independent of the optional documentation toolchain. Both normal and sanitizer builds include headers from `src/`.

<!-- at: 1 -->
## Build, test and benchmark without regenerating labels

`make` uses GCC C99 and the documented warning flags. `make test` runs assertions and compile-negative banned-function probes. `make sanitize` builds AddressSanitizer and UndefinedBehaviorSanitizer separately from optimized timing. `make benchmark` reruns calibration, held-out evaluation and timing. Only `make datasets` regenerates labels. Documentation targets call their separate Node/Python tools; `clean` removes executables while retaining evidence.

