---
file: "src/normalization.c"
---

The normalizer creates two representations of a property name: a joined lowercase key for character scorers and ordered tokens for the hybrid. Values never enter this module.

<!-- at: 1 -->
## Accept ASCII letters and digits while removing supported separators

`normalize` rejects bytes above 127 before using the standard character classifiers. It drops whitespace, hyphens and underscores, preserves digits, and calls `tolower` for case folding. Unsupported punctuation fails the operation instead of disappearing. The application retains the C locale; embedding callers must retain that locale for this ASCII contract. A result buffer is usable only after success.

<!-- at: /** Recognize the start -->
## Capture PascalCase boundaries before case folding

An uppercase letter starts a word after a lowercase letter or digit. An acronym ends before an uppercase letter followed by lowercase text: `HTTPServerURL` becomes `http`, `server`, `url`. Separators also close tokens. `Prepared.text` and `Prepared.tokens` own their bytes. More than 32 tokens is rejected.

<!-- at: /** Cache canonical -->
## Cache candidates and reject normalized schema collisions

Successful preparation bounds both copied strings to 128 bytes, so each `memcpy` includes a terminator within its destination. `Property` stores type and required-value metadata with those cached spellings. `Registry` borrows the property array. Registry initialization compares normalized names pairwise; `DatabaseConnectionString` and `Database_Connection_String` invalidate the whole schema rather than giving one name priority.


## Reference for the contracts used in this file

C99 section 7.4 defines character classification and its unsigned-char requirement. The explicit ASCII guard is a project policy applied before those calls. [Open reference](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf).
