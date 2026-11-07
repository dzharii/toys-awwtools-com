---
file: "tests/test_banned.sh"
---

This compiler test ensures the policy header remains active. It intentionally compiles invalid snippets and expects failure.

<!-- at: 1 -->
## Require the banned-function diagnostic for all fifteen macros

Each temporary C file includes system declarations before `pm.h`, then calls one forbidden function. A successful compile fails the test. An unrelated compiler error also fails the test because the expected `sorry_<name>_is_a_banned_function` token must appear. A trap removes temporary files. `make test` runs this check after the unit suite.

