---
file: "src/parser.c"
---

The parser separates syntax from matching. It returns two bounded strings; it does not decide whether the key names a property or whether its value has the right type.

<!-- at: 1 -->
## Split at the first equals sign and trim the edges

The bounded scan rejects oversized lines before the unrestricted `strchr` search. Four index adjustments trim key and value without changing internal bytes. `<ctype.h>` supplies `isspace`; converting each byte to `unsigned char` avoids undefined behavior for negative plain-char values. The executable keeps the initial C locale. ` key = a=b; ` becomes key `key` and value `a=b;`. An empty value is valid syntax; an empty key is not. Capacity checks happen before `memcpy`, and each output receives its own terminator.


## Reference for the contracts used in this file

C99 section 7.21.2 explains byte-copy contracts. `memcpy` copies exactly the requested range; this parser appends each string terminator itself. [Open reference](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf).
