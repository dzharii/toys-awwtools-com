# Verification of the source changes

Parser, algorithm, resolution and configuration-binding checks passed. The source explanations preserve matching behavior, selected policies and frozen datasets.

AddressSanitizer and UndefinedBehaviorSanitizer checks passed for the unit suite and complete experiment. Leak checking is unavailable on this execution host.

Timing varies between runs. [Measured algorithm tradeoffs](docs/measured-results.md) explains the recovery, risks and lookup costs. The raw comparison evidence remains in `reports/regression.json`.
