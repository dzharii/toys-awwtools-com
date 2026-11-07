# Source comment and readability changes

The review keeps the benchmark behavior and makes the code easier to follow. Short comments explain the movement, the reason and the relevant limit. Tags connect related ideas without depending on line numbers.

## Refactoring changes by module

| Area | Change | Why |
|---|---|---|
| Parser | Named start/end offsets; documented exclusive ranges | See exactly which bytes become the key and value |
| Normalizer | Separate word-boundary helper; named character checks | Understand case/separator handling before tokens disappear |
| Resolver | Named ranking helper, accepted-status helper and acceptance decisions | Separate candidate ordering from permission to bind |
| Edit algorithms | Split rolling edit rows from full Damerau-Levenshtein matrix; worked examples beside loops | Understand which earlier cells each recurrence needs |
| N-grams | Separate frequency cosine from set overlap | See why repeated grams matter to one method and not the others |
| Jaro / longest common subsequence / Ratcliff / hybrid | Descriptive movement variables and small examples | Follow flags, rows, pending regions and token alignment |
| Configuration | Document two-pass validation/application and duplicate indexing | Explain why errors leave the destination unchanged |
| Dataset | Named label/duplicate checks; removed redundant conditional | Make answer-key validation independent of algorithm scores |
| Calibration | Named cost/tie decisions and explicit nested policy loops | Show what changes during tuning and what stays frozen |
| Main | Separate CLI parsing and whole-grid calibration | Read the experiment order in one place |
| Report | One writer per topic; shared wrong-target predicate | Avoid navigating one long output function |
| Tests | Explain the independent graph oracle and rollback checks | Show what the assertions establish |
| Build/docs | Add .gitignore, guided static-site config and optional Doxyfile | Keep generated files out of source control and rebuild the site locally |

## Reviewed source, tests and documentation

Every original C implementation, shared header, test function and Makefile was read and reviewed. The original README and both methodology/algorithm references were checked for consistency. CSV manifests and generated reports remain data: their intent, structure and results are validated rather than filled with comments.

The twelve algorithms retain their scoring formulas. Threshold selection, dataset labels, mutation order, costs and CLI behavior are preserved. Runtime may change because readable helper boundaries can change generated machine code.

## Before-and-after verification results

`reports/regression.md` records the before/after comparison. The preserved pre-review case results, summary and calibration grid are in `tests/baseline/`. Run `make verify` after a standard seven-repetition benchmark to repeat the comparison. It checks matching decisions, scores, selected policies, dataset regeneration and the test logs.

`make test` checks C correctness. `make sanitize` checks address/undefined behavior. The delivered full sanitizer experiment also covers calibration, evaluation, maximum-length cases, performance loops and report output. Leak checking remains unavailable on the execution host and is recorded separately.

## Source files in processing order

Start at `docs/start-here.md` or `dist/index.html`. Follow a single key before opening an algorithm. Use the tag index to jump between a definition, the resolver and its tests.

## Intermediate costs, worked calculations and reference links

The algorithm loops now name deletion, insertion and replacement totals rather than nesting the three expressions. Adjacent comments explain prefix counts, recycled row pointers, the shifted full-distance matrix and gram-frequency merging. The file articles show small calculations for each scoring family, with literal answer checks in the C test suite. The restricted adjacent-swap method and longest common subsequence are expanded before their abbreviated code names appear.

The remaining C files explain the places where storage or policy is easy to misread: `memcpy` terminators, overlapping `memmove`, `strtol` error channels, top-two score margins, static calibration caches, percentile indices and canonical binding slots. The vendor `banned.h` remains byte-identical.

[Algorithm explanations and reference materials](docs/learning-resources.md) links the primary sources and distinguishes their definitions from this project's weights, tie rules and acceptance policy. `AGENTS.md` records the commenting and regression rules for future changes.
