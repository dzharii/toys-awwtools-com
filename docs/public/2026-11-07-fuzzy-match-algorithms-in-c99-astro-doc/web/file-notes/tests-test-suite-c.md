---
file: "tests/test_suite.c"
---

The suite stops invalid implementations before ranking them. Literal cases check behavior, and an independent graph supplies small-string edit distances.

<!-- at: 1 -->
## Check parser and normalization contracts at their boundaries

The parser table distinguishes missing equals signs, empty keys and valid empty values. Capacity cases test the exact limit and one byte over it. Normalization cases check separators, PascalCase/acronym tokens, unsupported punctuation and non-ASCII rejection.

<!-- at: /* Independent shortest-path oracle -->
## Compare edit algorithms with shortest routes through a spelling graph

Graph nodes are strings over `abc` up to length four. An edge represents one allowed edit. Breadth-first search obtains shortest routes without using an edit-matrix recurrence. Length-three input pairs check Levenshtein and full Damerau-Levenshtein, while `ca -> abc` distinguishes restricted adjacent swaps from the full method. Additional assertions test score range, identity and symmetry.

<!-- at: /** Reverse registry order -->
## Test ranking and transactional configuration binding

Reversing candidates must preserve decisions and score margins. Equal-score fuzzy candidates reject automatic assignment. Integration cases cover integer limits, booleans, duplicates, required values and rollback. A complete ten-line input checks the original configuration example.

<!-- at: /** Check ctype integration -->
## Exercise every nonzero byte after the standard-library change

Literal ASCII ranges define the expected classifier behavior independently of `<ctype.h>`. The loop checks normalization and parser trimming for bytes 1 through 255, including values that become negative plain chars. The equals byte deliberately produces an empty-key parsing error. These checks verify the replacements rather than merely exercising their calls.


## Reference for the contracts used in this file

The algorithm reference guide links the definitions used by literal answer checks. The edit-graph oracle searches edit paths independently of the matrix implementation. [Open reference](/reference/learning-resources/).
