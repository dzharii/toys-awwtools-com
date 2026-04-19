# Idiom Index (TODO)

## "Advance before use" scanning with assignment in the condition
- ID: ID-0001
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Advance before use" scanning with assignment in the condition | Lines: ~180-192
    Snippet: **"Advance before use" scanning with assignment in the condition**
    Snippet: int c;
- Notes: —

## "Append pointer" pattern for building strings efficiently
- ID: ID-0002
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Append pointer" pattern for building strings efficiently | Lines: ~296-308
    Snippet: **"Append pointer" pattern for building strings efficiently**
    Snippet: char out[256];
- Notes: —

## "Close on success, free on failure" with ownership transfer
- ID: ID-0003
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Close on success, free on failure" with ownership transfer | Lines: ~388-402
    Snippet: **"Close on success, free on failure" with ownership transfer**
    Snippet: char *buf = malloc(n);
- Notes: —

## "do while" loop
- ID: ID-0004
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: "do while" loop | Lines: ~14-25
    Snippet: "do while" loop
    Snippet: Description: Execute a block of code at least once and repeat while a condition remains true.
- Notes: —

## "Flexible array member" for variable-sized structs (C99 feature)
- ID: ID-0005
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla | Lines: ~256
    Snippet: typedef struct c99lc_stack_char_fla {
  - File: c99-leetcode.h | Anchor: c99lc_bitset | Lines: ~287
    Snippet: typedef struct c99lc_bitset {
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Flexible array member" for variable-sized structs (C99 feature) | Lines: ~601-617
    Snippet: **"Flexible array member" for variable-sized structs (C99 feature)**
    Snippet: struct Msg {
- Notes: —

## "Inline constant struct" as a default value without macros
- ID: ID-0006
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Inline constant struct" as a default value without macros | Lines: ~52-63
    Snippet: **"Inline constant struct" as a default value without macros**
    Snippet: static const struct Limits default_limits = { .min = 0, .max = 100 };
- Notes: —

## "Length-limited string scan" without copying
- ID: ID-0007
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Length-limited string scan" without copying | Lines: ~274-284
    Snippet: **"Length-limited string scan" without copying**
    Snippet: size_t i = 0;
- Notes: —

## "Loop that guarantees at least one iteration" with `do { } while (0)` (not just for macros)
- ID: ID-0008
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Loop that guarantees at least one iteration" with `do { } while (0)` (not just for macros) | Lines: ~209-222
    Snippet: **"Loop that guarantees at least one iteration" with `do { } while (0)` (not just for macros)**
    Snippet: do {
- Notes: —

## "One definition of a flag set" via an enum and bit masks
- ID: ID-0009
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "One definition of a flag set" via an enum and bit masks | Lines: ~827-837
    Snippet: **"One definition of a flag set" via an enum and bit masks**
    Snippet: enum {
- Notes: —

## "Optional output" pointers with a simple guard
- ID: ID-0010
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Optional output" pointers with a simple guard | Lines: ~641-650
    Snippet: **"Optional output" pointers with a simple guard**
    Snippet: if (out_value) *out_value = v;
- Notes: —

## "Return value capture" so you do not lose error information
- ID: ID-0011
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Return value capture" so you do not lose error information | Lines: ~351-361
    Snippet: **"Return value capture" so you do not lose error information**
    Snippet: int rc = do_work();
- Notes: —

## "Sentinel at end" arrays for tables of variable length
- ID: ID-0012
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Sentinel at end" arrays for tables of variable length | Lines: ~101-118
    Snippet: **"Sentinel at end" arrays for tables of variable length**
    Snippet: struct KV { const char *k; int v; };
- Notes: —

## "Two-pointer" walk for in-place filtering/compaction
- ID: ID-0013
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Two-pointer" walk for in-place filtering/compaction | Lines: ~154-167
    Snippet: **"Two-pointer" walk for in-place filtering/compaction**
    Snippet: size_t w = 0;
- Notes: —

## "User data" callbacks (poor man's closures)
- ID: ID-0014
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "User data" callbacks (poor man's closures) | Lines: ~671-682
    Snippet: **"User data" callbacks (poor man's closures)**
    Snippet: typedef int (*visit_fn)(void *user, const struct Node *n);
- Notes: —

## `enum` as compile-time integer constants
- ID: ID-0015
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `enum` as compile-time integer constants | Lines: ~119-129
    Snippet: **`enum` as compile-time integer constants**
    Snippet: enum { BUF_SZ = 4096, MAX_RETRIES = 5 };
- Notes: —

## `fgets` loop with newline trimming in one place
- ID: ID-0016
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `fgets` loop with newline trimming in one place | Lines: ~375-387
    Snippet: **`fgets` loop with newline trimming in one place**
    Snippet: while (fgets(line, sizeof line, fp)) {
- Notes: —

## `memchr` as a fast "find delimiter in bytes"
- ID: ID-0017
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `memchr` as a fast "find delimiter in bytes" | Lines: ~263-273
    Snippet: **`memchr` as a fast "find delimiter in bytes"**
    Snippet: const unsigned char *q = memchr(p, '\n', (size_t)(end - p));
- Notes: —

## `offsetof` from `<stddef.h>` for layout-aware code
- ID: ID-0018
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `offsetof` from `<stddef.h>` for layout-aware code | Lines: ~796-805
    Snippet: **`offsetof` from `<stddef.h>` for layout-aware code**
    Snippet: size_t off = offsetof(struct S, member);
- Notes: —

## `realloc` with a temporary to avoid losing the original pointer on failure
- ID: ID-0019
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `realloc` with a temporary to avoid losing the original pointer on failure | Lines: ~557-568
    Snippet: **`realloc` with a temporary to avoid losing the original pointer on failure**
    Snippet: void *tmp = realloc(p, n);
- Notes: —

## `snprintf` for bounded formatting and detecting truncation
- ID: ID-0020
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `snprintf` for bounded formatting and detecting truncation | Lines: ~285-295
    Snippet: **`snprintf` for bounded formatting and detecting truncation**
    Snippet: int m = snprintf(dst, dst_sz, "%s/%s", a, b);
- Notes: —

## `sscanf` is tempting, but `strto*` with end pointers composes better
- ID: ID-0021
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `sscanf` is tempting, but `strto*` with end pointers composes better | Lines: ~683-695
    Snippet: **`sscanf` is tempting, but `strto*` with end pointers composes better**
    Snippet: char *end;
- Notes: —

## `volatile` only for hardware/async boundaries, not for "thread safety"
- ID: ID-0022
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > `volatile` only for hardware/async boundaries, not for "thread safety" | Lines: ~806-816
    Snippet: **`volatile` only for hardware/async boundaries, not for "thread safety"**
    Snippet: volatile uint32_t *reg = (volatile uint32_t *)0x40000000u;
- Notes: —

## Abort program execution with error condition
- ID: ID-0023
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Abort program execution with error condition | Lines: ~64-75
    Snippet: Abort program execution with error condition
    Snippet: Description: Terminate the program immediately with a non-zero exit status.
- Notes: —

## Add LSB-first digit arrays with carry
- ID: ID-0024
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_digits_add_lsb_first | Lines: ~208
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_add_lsb_first(const unsigned char* a,
- Notes: —

## Align up/down with power-of-two alignment (common, but easy to botch)
- ID: ID-0025
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Align up/down with power-of-two alignment (common, but easy to botch) | Lines: ~503-513
    Snippet: **Align up/down with power-of-two alignment (common, but easy to botch)**
    Snippet: size_t align_up(size_t x, size_t a) { return (x + (a - 1)) & ~(a - 1); }
- Notes: —

## Allocate 1M bytes
- ID: ID-0026
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Allocate 1M bytes | Lines: ~125-136
    Snippet: Allocate 1M bytes
    Snippet: Description: Allocate a buffer of one million bytes from the heap.
- Notes: —

## Allocate using the pointed-to type, not repeating the type name
- ID: ID-0027
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Allocate using the pointed-to type, not repeating the type name | Lines: ~546-556
    Snippet: **Allocate using the pointed-to type, not repeating the type name**
    Snippet: T *p = malloc(sizeof *p);
- Notes: —

## Array difference using binary search lookup
- ID: ID-0028
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_array_int_diff | Lines: ~249
    Snippet: C99_LEETCODE_PUBLIC_DECL size_t c99lc_array_int_diff(
- Notes: —

## Assert condition
- ID: ID-0029
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Assert condition | Lines: ~14-25
    Snippet: Assert condition
    Snippet: Description: Verify that a condition holds true during program execution in debug builds.
- Notes: —

## Assign to string the japanese word ネコ
- ID: ID-0030
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Assign to string the japanese word ネコ | Lines: ~99-106
    Snippet: Assign to string the japanese word ネコ
    Snippet: Description: Initialize a UTF-8 string literal containing non-ASCII characters.
- Notes: —

## Assignment in condition to express "read then test"
- ID: ID-0031
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Assignment in condition to express "read then test" | Lines: ~766-775
    Snippet: **Assignment in condition to express "read then test"**
    Snippet: while ((n = fread(buf, 1, sizeof buf, fp)) != 0) { /* ... */ }
- Notes: —

## Binary digits to byte array
- ID: ID-0032
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Binary digits to byte array | Lines: ~71-97
    Snippet: Binary digits to byte array
    Snippet: Description: Convert a string of binary digits into a byte array.
- Notes: —

## Binary search in sorted array
- ID: ID-0033
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Binary search in sorted array | Lines: ~129-155
    Snippet: Binary search in sorted array
    Snippet: Description: Search a sorted integer array using binary search.
- Notes: —

## Binomial coefficient "n choose k"
- ID: ID-0034
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Binomial coefficient "n choose k" | Lines: ~197-217
    Snippet: Binomial coefficient "n choose k"
    Snippet: Description: Compute the binomial coefficient using an iterative integer method.
- Notes: —

## Bitset membership with unsigned shifts (avoid UB on signed)
- ID: ID-0035
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Bitset membership with unsigned shifts (avoid UB on signed) | Lines: ~514-524
    Snippet: **Bitset membership with unsigned shifts (avoid UB on signed)**
    Snippet: unsigned mask = 1u << bit;
- Notes: Related: Set, clear, and test a bit; packed bitset utilities in c99-leetcode.h.

## Boolean normalization with `!!`
- ID: ID-0036
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Boolean normalization with `!!` | Lines: ~776-785
    Snippet: **Boolean normalization with `!!`**
    Snippet: int ok = !!ptr;
- Notes: —

## Branchless "is power of two" (and exclude 0)
- ID: ID-0037
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Branchless "is power of two" (and exclude 0) | Lines: ~525-534
    Snippet: **Branchless "is power of two" (and exclude 0)**
    Snippet: int is_pow2(size_t x) { return x && ((x & (x - 1)) == 0); }
- Notes: —

## Break outer loop
- ID: ID-0038
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Break outer loop | Lines: ~116-143
    Snippet: Break outer loop
    Snippet: Description: Search a 2D integer matrix and stop immediately when a negative value is found.
- Notes: —

## Byte extraction with masks and shifts (portable endianness-agnostic logic)
- ID: ID-0039
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Byte extraction with masks and shifts (portable endianness-agnostic logic) | Lines: ~535-545
    Snippet: **Byte extraction with masks and shifts (portable endianness-agnostic logic)**
    Snippet: unsigned byte0 = (x >> 0) & 0xFFu;
- Notes: —

## Bytes to hex string
- ID: ID-0040
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Bytes to hex string | Lines: ~278-299
    Snippet: Bytes to hex string
    Snippet: Description: Convert a byte array into a hexadecimal string representation.
- Notes: —

## Calculate exponentiation of real numbers
- ID: ID-0041
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Calculate exponentiation of real numbers | Lines: ~131-143
    Snippet: Calculate exponentiation of real numbers
    Snippet: Description: Compute real-number exponentiation using the math library.
- Notes: —

## Call an external C function
- ID: ID-0042
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Call an external C function | Lines: ~33-45
    Snippet: Call an external C function
    Snippet: Description: Declare and call an external C function using a statically allocated array.
- Notes: —

## Character stack with flexible array member
- ID: ID-0043
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla | Lines: ~256
    Snippet: typedef struct c99lc_stack_char_fla {
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla_create | Lines: ~264
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_stack_char_fla* c99lc_stack_char_fla_create(size_t capacity);
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla_destroy | Lines: ~268
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_stack_char_fla_destroy(c99lc_stack_char_fla* stack);
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla_count | Lines: ~272
    Snippet: C99_LEETCODE_PUBLIC_DECL size_t c99lc_stack_char_fla_count(const c99lc_stack_char_fla* stack);
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla_push | Lines: ~276
    Snippet: C99_LEETCODE_PUBLIC_DECL bool c99lc_stack_char_fla_push(c99lc_stack_char_fla* stack, char c);
  - File: c99-leetcode.h | Anchor: c99lc_stack_char_fla_pop | Lines: ~280
    Snippet: C99_LEETCODE_PUBLIC_DECL bool c99lc_stack_char_fla_pop(c99lc_stack_char_fla* stack, char* out);
- Notes: —

## Check for overflow before multiply/add (portable pattern)
- ID: ID-0044
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Check for overflow before multiply/add (portable pattern) | Lines: ~491-502
    Snippet: **Check for overflow before multiply/add (portable pattern)**
    Snippet: if (b != 0 && a > SIZE_MAX / b) return -1;   /* a*b would overflow */
- Notes: Related: Check if integer addition will overflow.

## Check if any value in a list is larger than a limit
- ID: ID-0045
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Check if any value in a list is larger than a limit | Lines: ~46-63
    Snippet: Check if any value in a list is larger than a limit
    Snippet: Description: Scan an array and execute a callback if any element exceeds a given threshold.
- Notes: —

## Check if file exists
- ID: ID-0046
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Check if file exists | Lines: ~143-160
    Snippet: Check if file exists
    Snippet: Description: Check whether a file exists by attempting to open it.
- Notes: —

## Check if integer addition will overflow
- ID: ID-0047
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Check if integer addition will overflow | Lines: ~94-112
    Snippet: Check if integer addition will overflow
    Snippet: Description: Detect whether adding two signed integers would overflow.
- Notes: Related: Check for overflow before multiply/add (portable pattern).

## Check if integer is even
- ID: ID-0048
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_integers_is_even | Lines: ~100
    Snippet: C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_integers_is_even(int num);
- Notes: —

## Check if list contains a value
- ID: ID-0049
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Check if list contains a value | Lines: ~170-187
    Snippet: Check if list contains a value
    Snippet: Description: Perform a linear search to determine whether an integer value exists in an array.
- Notes: —

## Check if point is inside rectangle
- ID: ID-0050
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Check if point is inside rectangle | Lines: ~326-344
    Snippet: Check if point is inside rectangle
    Snippet: Description: Determine whether a point lies inside or on the boundary of an axis-aligned rectangle.
- Notes: —

## Check if string contains a word
- ID: ID-0051
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Check if string contains a word | Lines: ~55-67
    Snippet: Check if string contains a word
    Snippet: Description: Check whether a string contains another string as a substring.
- Notes: —

## Check if string contains only digits
- ID: ID-0052
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Check if string contains only digits | Lines: ~95-117
    Snippet: Check if string contains only digits
    Snippet: Description: Determine whether a string consists exclusively of decimal digit characters.
- Notes: —

## Check if string is blank
- ID: ID-0053
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Check if string is blank | Lines: ~279-297
    Snippet: Check if string is blank
    Snippet: Description: Check whether a string is empty or contains only whitespace characters.
- Notes: —

## Check palindrome in byte array
- ID: ID-0054
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_array_u8_is_palindrome | Lines: ~183
    Snippet: C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_array_u8_is_palindrome(const unsigned char* a,
- Notes: —

## Check string prefix
- ID: ID-0055
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Check string prefix | Lines: ~183-196
    Snippet: Check string prefix
    Snippet: Description: Check whether a string begins with a specified prefix.
- Notes: —

## Clamp a value to a range
- ID: ID-0056
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Clamp a value to a range | Lines: ~183-198
    Snippet: Clamp a value to a range
    Snippet: Description: Restrict an integer value to a minimum and maximum bound.
- Notes: —

## Comment out a single line
- ID: ID-0057
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Comment out a single line | Lines: ~110-117
    Snippet: Comment out a single line
    Snippet: Description: Add a comment line that is ignored by the compiler.
- Notes: Ambiguous: this is more a comment syntax example than a reusable technique.

## Compile-time array length (ARRAY_LEN/ARRAY_SIZE)
- ID: ID-0058
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Get list size | Lines: ~310-317
    Snippet: Get list size
    Snippet: Description: Determine the number of elements in a statically allocated array.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Compile-time array count (only works for actual arrays) | Lines: ~413-422
    Snippet: **Compile-time array count (only works for actual arrays)**
    Snippet: #define ARRAY_LEN(a) (sizeof(a) / sizeof((a)[0]))
- Notes: —

## Compile-time assertion (typedef trick)
- ID: ID-0059
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Compile-time assertion | Lines: ~268-290
    Snippet: Compile-time assertion
    Snippet: Description: Enforce invariants at compile time using C99 constructs.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Static assert" in C99 via typedef trick (portable) | Lines: ~423-433
    Snippet: **"Static assert" in C99 via typedef trick (portable)**
    Snippet: #define STATIC_ASSERT(expr) typedef char static_assertion[(expr) ? 1 : -1]
- Notes: —

## Complex number
- ID: ID-0060
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Complex number | Lines: ~1-13
    Snippet: Complex number
    Snippet: Description: Declare and manipulate a complex number using the C99 complex number support.
- Notes: —

## Compound literals for "temporary objects with an address"
- ID: ID-0061
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Compound literals for "temporary objects with an address" | Lines: ~40-51
    Snippet: **Compound literals for "temporary objects with an address"**
    Snippet: use_point(&(struct Point){ .x = 1, .y = 2 });
- Notes: —

## Compute GCD
- ID: ID-0062
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Compute GCD | Lines: ~262-276
    Snippet: Compute GCD
    Snippet: Description: Compute the greatest common divisor of two non-negative integers using the Euclidean algorithm.
- Notes: —

## Compute LCM
- ID: ID-0063
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Compute LCM | Lines: ~277-289
    Snippet: Compute LCM
    Snippet: Description: Compute the least common multiple of two non-negative integers using GCD.
- Notes: —

## Compute sum of integers
- ID: ID-0064
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Compute sum of integers | Lines: ~68-83
    Snippet: Compute sum of integers
    Snippet: Description: Compute the sum of all elements in an integer array.
- Notes: —

## Conditional assignment
- ID: ID-0065
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Conditional assignment | Lines: ~1-10
    Snippet: Conditional assignment
    Snippet: Description: Assign one of two string values depending on a boolean condition.
- Notes: —

## Container-of pattern (common, but not standard-library provided)
- ID: ID-0066
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Container-of pattern (common, but not standard-library provided) | Lines: ~618-630
    Snippet: **Container-of pattern (common, but not standard-library provided)**
    Snippet: #define OFFSETOF(type, member) ((size_t)&(((type *)0)->member))
- Notes: —

## Continue outer loop
- ID: ID-0067
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Continue outer loop | Lines: ~91-115
    Snippet: Continue outer loop
    Snippet: Description: Iterate over one array and skip elements that appear in another array using a controlled loop structure.
- Notes: —

## Convert integer to floating point number
- ID: ID-0068
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Convert integer to floating point number | Lines: ~26-35
    Snippet: Convert integer to floating point number
    Snippet: Description: Convert an integer value to a floating point value explicitly.
- Notes: —

## Convert integer to string
- ID: ID-0069
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Convert integer to string | Lines: ~84-96
    Snippet: Convert integer to string
    Snippet: Description: Convert an integer value to its decimal string representation.
- Notes: —

## Convert real number to string with 2 decimal places
- ID: ID-0070
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Convert real number to string with 2 decimal places | Lines: ~87-98
    Snippet: Convert real number to string with 2 decimal places
    Snippet: Description: Format a floating point value into a string with exactly two digits after the decimal point.
- Notes: —

## Convert string to camelCase
- ID: ID-0071
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_string_to_camel_case | Lines: ~331
    Snippet: C99_LEETCODE_PUBLIC_DECL size_t c99lc_string_to_camel_case(
- Notes: —

## Convert string to integer
- ID: ID-0072
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Convert string to integer | Lines: ~75-86
    Snippet: Convert string to integer
    Snippet: Description: Convert a decimal string to an integer with basic error handling.
- Notes: —

## Convert string to integer, explicit base
- ID: ID-0073
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Convert string to integer, explicit base | Lines: ~157-168
    Snippet: Convert string to integer, explicit base
    Snippet: Description: Convert a string to an integer using an explicit numeric base.
- Notes: —

## Copy string into buffer with capacity and null-terminate
- ID: ID-0074
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_helloworld_into | Lines: ~72
    Snippet: C99_LEETCODE_PUBLIC_DECL int c99lc_helloworld_into(char* out, size_t out_cap);
- Notes: —

## Count backwards
- ID: ID-0075
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Count backwards | Lines: ~11-24
    Snippet: Count backwards
    Snippet: Description: Print integers in descending order from a fixed starting value to zero.
- Notes: —

## Count decimal digits in integer
- ID: ID-0076
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_integers_count_digits | Lines: ~82
    Snippet: C99_LEETCODE_PUBLIC_DECL size_t c99lc_integers_count_digits(int x);
- Notes: —

## Count set bits (popcount)
- ID: ID-0077
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Count bits set in integer binary representation | Lines: ~77-93
    Snippet: Count bits set in integer binary representation
    Snippet: Description: Count the number of bits set to one in an unsigned integer.
  - File: c99-leetcode.h | Anchor: c99lc_integers_count_set_bits | Lines: ~96
    Snippet: C99_LEETCODE_PUBLIC_DECL int c99lc_integers_count_set_bits(int number);
- Notes: —

## Count substring occurrences
- ID: ID-0078
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Count substring occurrences | Lines: ~58-76
    Snippet: Count substring occurrences
    Snippet: Description: Count the number of non-overlapping occurrences of a substring within a string.
- Notes: —

## Count trailing zero bits
- ID: ID-0079
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Count trailing zero bits | Lines: ~25-45
    Snippet: Count trailing zero bits
    Snippet: Description: Count the number of consecutive zero bits starting from the least significant bit.
- Notes: —

## Counted push with post-increment (your pattern) plus the "guard" form
- ID: ID-0080
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Counted push with post-increment (your pattern) plus the "guard" form | Lines: ~130-141
    Snippet: **Counted push with post-increment (your pattern) plus the "guard" form**
    Snippet: if (array_count < ARRAY_CAP) {
- Notes: —

## Create a 2-dimensional array
- ID: ID-0081
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Create a 2-dimensional array | Lines: ~107-116
    Snippet: Create a 2-dimensional array
    Snippet: Description: Declare a two-dimensional array of double values using C99 variable length arrays.
- Notes: —

## Create a 2D Point data structure
- ID: ID-0082
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Create a 2D Point data structure | Lines: ~51-61
    Snippet: Create a 2D Point data structure
    Snippet: Description: Declare a lightweight structure representing a two-dimensional point using double-precision coordinates.
- Notes: —

## Create a 3-dimensional array
- ID: ID-0083
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Create a 3-dimensional array | Lines: ~117-126
    Snippet: Create a 3-dimensional array
    Snippet: Description: Declare a three-dimensional array of double values using C99 variable length arrays.
- Notes: —

## Create a Binary Tree data structure
- ID: ID-0084
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Create a Binary Tree data structure | Lines: ~123-134
    Snippet: Create a Binary Tree data structure
    Snippet: Description: Define a recursive structure for a binary tree node with left and right children.
- Notes: —

## Create a function
- ID: ID-0085
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Create a function | Lines: ~41-50
    Snippet: Create a function
    Snippet: Description: Define a function that computes and returns the square of an integer value.
- Notes: —

## Create a map (associative array)
- ID: ID-0086
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Create a map (associative array) | Lines: ~107-122
    Snippet: Create a map (associative array)
    Snippet: Description: Represent an associative mapping using an array of key-value structures, which is portable and explicit in C.
- Notes: —

## Create a procedure
- ID: ID-0087
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Create a procedure | Lines: ~29-40
    Snippet: Create a procedure
    Snippet: Description: Define a function that returns no value and performs side effects only.
- Notes: —

## Create a Tree data structure
- ID: ID-0088
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Create a Tree data structure | Lines: ~1-12
    Snippet: Create a Tree data structure
    Snippet: Description: Define a recursive tree node structure where each node may have zero or more children and access to its siblings.
- Notes: —

## Create temp file
- ID: ID-0089
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Create temp file | Lines: ~118-129
    Snippet: Create temp file
    Snippet: Description: Create a temporary file using a secure, system-provided mechanism.
- Notes: —

## ctype functions: cast to unsigned char, and do not pass pointers
- ID: ID-0090
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > ctype functions: cast to unsigned char, and do not pass pointers | Lines: ~253-262
    Snippet: **ctype functions: cast to unsigned char, and do not pass pointers**
    Snippet: if (isalpha((unsigned char)c)) { /* ... */ }
- Notes: —

## Current executable name
- ID: ID-0091
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Current executable name | Lines: ~222-234
    Snippet: Current executable name
    Snippet: Description: Extract the executable name from the program invocation path.
- Notes: —

## Custom allocation hooks via macros (malloc/free/realloc)
- ID: ID-0092
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: C99_LEETCODE_MALLOC / C99_LEETCODE_FREE / C99_LEETCODE_REALLOC | Lines: ~54-60
    Snippet: #define C99_LEETCODE_MALLOC(ctx, size) ((void)(ctx), malloc(size))
    Snippet: #define C99_LEETCODE_FREE(ctx, ptr) ((void)(ctx), free(ptr))
    Snippet: #define C99_LEETCODE_REALLOC(ctx, ptr, size) ((void)(ctx), realloc(ptr, size))
- Notes: —

## Date struct with year/month/day fields
- ID: ID-0093
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_reasonable_date | Lines: ~388
    Snippet: typedef struct c99lc_reasonable_date {
- Notes: —

## Days in month with leap-year adjustment
- ID: ID-0094
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_date_days_in_month | Lines: ~400
    Snippet: C99_LEETCODE_PUBLIC_DECL uint32_t c99lc_date_days_in_month(uint32_t year, uint32_t month);
- Notes: —

## Days since 1971-01-01 for date
- ID: ID-0095
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_date_days_since_1971 | Lines: ~404
    Snippet: C99_LEETCODE_PUBLIC_DECL uint32_t c99lc_date_days_since_1971(const c99lc_reasonable_date* d);
- Notes: —

## Debug logging macro (compiled out in release)
- ID: ID-0096
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Debug logging macro | Lines: ~254-267
    Snippet: Debug logging macro
    Snippet: Description: Emit debug-only log messages using conditional compilation.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Optional debug logging compiled out cleanly | Lines: ~477-490
    Snippet: **Optional debug logging compiled out cleanly**
    Snippet: #ifdef DEBUG
- Notes: —

## Declare an enumeration
- ID: ID-0097
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Declare an enumeration | Lines: ~1-13
    Snippet: Declare an enumeration
    Snippet: Description: Define an enumeration type with a fixed set of named integer constants.
- Notes: —

## Declare constant string
- ID: ID-0098
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Declare constant string | Lines: ~184-191
    Snippet: Declare constant string
    Snippet: Description: Declare a constant string literal.
- Notes: —

## Deduplicate sorted array in place
- ID: ID-0099
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_array_int_dedup_sorted | Lines: ~233
    Snippet: C99_LEETCODE_PUBLIC_DECL size_t c99lc_array_int_dedup_sorted(int* array, size_t size);
- Notes: —

## Delete file
- ID: ID-0100
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Delete file | Lines: ~172-183
    Snippet: Delete file
    Snippet: Description: Remove a file from the filesystem.
- Notes: —

## Depth-first traversal in a graph
- ID: ID-0101
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Depth-first traversal in a graph | Lines: ~54-78
    Snippet: Depth-first traversal in a graph
    Snippet: Description: Perform a depth-first traversal over a graph represented by adjacency lists.
- Notes: —

## Designated initializers to document intent and avoid field-order coupling
- ID: ID-0102
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Designated initializers to document intent and avoid field-order coupling | Lines: ~16-29
    Snippet: **Designated initializers to document intent and avoid field-order coupling**
    Snippet: struct Config cfg = {
- Notes: —

## Detect zero digit in base-10 representation
- ID: ID-0103
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_integers_has_zero_digit | Lines: ~108
    Snippet: C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_integers_has_zero_digit(int num);
- Notes: —

## Dynamic int array with capacity growth
- ID: ID-0104
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_leaf_values | Lines: ~368
    Snippet: typedef struct c99lc_leaf_values {
  - File: c99-leetcode.h | Anchor: c99lc_leaf_values_create | Lines: ~376
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_leaf_values* c99lc_leaf_values_create(size_t initial_capacity);
  - File: c99-leetcode.h | Anchor: c99lc_leaf_values_push | Lines: ~380
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_leaf_values_push(c99lc_leaf_values* lv, int item);
  - File: c99-leetcode.h | Anchor: c99lc_leaf_values_destroy | Lines: ~384
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_leaf_values_destroy(c99lc_leaf_values* lv);
- Notes: —

## Echo program implementation
- ID: ID-0105
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Echo program implementation | Lines: ~243-261
    Snippet: Echo program implementation
    Snippet: Description: Print all command-line arguments except the program name, separated by spaces.
- Notes: —

## Execute procedures depending on options
- ID: ID-0106
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Execute procedures depending on options | Lines: ~206-225
    Snippet: Execute procedures depending on options
    Snippet: Description: Execute different procedures based on parsed command-line options.
- Notes: —

## Exit program cleanly (EXIT_SUCCESS)
- ID: ID-0107
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Exit program cleanly | Lines: ~21-32
    Snippet: Exit program cleanly
    Snippet: Description: Terminate the program and indicate successful completion to the operating system.
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Stop program | Lines: ~113-124
    Snippet: Stop program
    Snippet: Description: Terminate program execution immediately and report successful completion.
- Notes: —

## Extract a substring
- ID: ID-0108
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Extract a substring | Lines: ~30-54
    Snippet: Extract a substring
    Snippet: Description: Extract a substring from a string using byte indices, allocating a new null-terminated string.
- Notes: —

## Extract file content to a string
- ID: ID-0109
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Extract file content to a string | Lines: ~97-128
    Snippet: Extract file content to a string
    Snippet: Description: Read the entire contents of a file into a dynamically allocated string using standard C I/O.
- Notes: —

## Find substring position
- ID: ID-0110
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Find substring position | Lines: ~167-183
    Snippet: Find substring position
    Snippet: Description: Find the byte index of the first occurrence of a substring within a string.
- Notes: —

## Fixed-capacity positive decimal digit buffer (LSB-first)
- ID: ID-0111
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_digits_positive_int_buffer | Lines: ~127
    Snippet: typedef struct c99lc_digits_positive_int_buffer {
  - File: c99-leetcode.h | Anchor: c99lc_digits_positive_int_init | Lines: ~136
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_init(
  - File: c99-leetcode.h | Anchor: c99lc_digits_positive_int_from_int | Lines: ~142
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_from_int(
  - File: c99-leetcode.h | Anchor: c99lc_digits_positive_int_from_big_endian_array | Lines: ~147
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_from_big_endian_array(
  - File: c99-leetcode.h | Anchor: c99lc_digits_positive_int_add | Lines: ~152
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_add(
  - File: c99-leetcode.h | Anchor: c99lc_digits_positive_int_to_big_endian_int_array | Lines: ~159
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_to_big_endian_int_array(
- Notes: —

## Flexible "build up an initializer" with trailing commas
- ID: ID-0112
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Flexible "build up an initializer" with trailing commas | Lines: ~64-77
    Snippet: **Flexible "build up an initializer" with trailing commas**
    Snippet: int xs[] = {
- Notes: —

## Format a number with grouped thousands
- ID: ID-0113
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Format a number with grouped thousands | Lines: ~264-277
    Snippet: Format a number with grouped thousands
    Snippet: Description: Format an integer with thousands separators using the current locale.
- Notes: —

## Format decimal number
- ID: ID-0114
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Format decimal number | Lines: ~184-196
    Snippet: Format decimal number
    Snippet: Description: Convert a fractional value in the range [0,1] into a percentage string with one decimal digit.
- Notes: —

## Formula with arrays
- ID: ID-0115
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Formula with arrays | Lines: ~104-125
    Snippet: Formula with arrays
    Snippet: Description: Apply an element-wise mathematical formula to multiple arrays of equal length.
- Notes: —

## Free and null a pointer
- ID: ID-0116
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Free and null a pointer | Lines: ~43-57
    Snippet: Free and null a pointer
    Snippet: Description: Release heap memory and clear the pointer to avoid accidental reuse.
- Notes: —

## Get an environment variable
- ID: ID-0117
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Get an environment variable | Lines: ~91-103
    Snippet: Get an environment variable
    Snippet: Description: Read an environment variable and fall back to a default value if it is not set.
- Notes: —

## Get current date
- ID: ID-0118
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Get current date | Lines: ~155-166
    Snippet: Get current date
    Snippet: Description: Retrieve the current date and time using the standard C time type.
- Notes: —

## Get file size
- ID: ID-0119
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Get file size | Lines: ~163-182
    Snippet: Get file size
    Snippet: Description: Determine the size of a file in bytes using standard C I/O.
- Notes: —

## Get folder containing current program
- ID: ID-0120
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Get folder containing current program | Lines: ~247-266
    Snippet: Get folder containing current program
    Snippet: Description: Determine the directory containing the currently executing program on Unix-like systems.
- Notes: —

## Get program working directory
- ID: ID-0121
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Get program working directory | Lines: ~235-246
    Snippet: Get program working directory
    Snippet: Description: Retrieve the current working directory path.
- Notes: —

## Handle invalid argument
- ID: ID-0122
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Handle invalid argument | Lines: ~137-152
    Snippet: Handle invalid argument
    Snippet: Description: Validate a function argument and report failure using an explicit status code.
- Notes: —

## Hex dump loop that is careful about signedness
- ID: ID-0123
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Hex dump loop that is careful about signedness | Lines: ~745-755
    Snippet: **Hex dump loop that is careful about signedness**
    Snippet: const unsigned char *b = buf;
- Notes: —

## Hex string to byte array
- ID: ID-0124
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Hex string to byte array | Lines: ~300-325
    Snippet: Hex string to byte array
    Snippet: Description: Convert a hexadecimal string into a byte array.
- Notes: —

## Hexadecimal digits of an integer
- ID: ID-0125
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Hexadecimal digits of an integer | Lines: ~130-142
    Snippet: Hexadecimal digits of an integer
    Snippet: Description: Convert an integer value to its hexadecimal string representation.
- Notes: —

## Increment decimal digit array in place
- ID: ID-0126
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_digits_increment | Lines: ~112
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_digits_increment(unsigned char* digits, size_t digits_size);
- Notes: —

## Integer exponentiation by squaring
- ID: ID-0127
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Integer exponentiation by squaring | Lines: ~14-29
    Snippet: Integer exponentiation by squaring
    Snippet: Description: Compute the power of a non-negative integer base raised to a non-negative integer exponent using exponentiation by squaring.
- Notes: —

## Interleave halves of array
- ID: ID-0128
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_array_int_interleave_halves | Lines: ~190
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_array_int_interleave_halves(int* dst, const int* src, size_t n);
- Notes: —

## Iterate over list indexes and values
- ID: ID-0129
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Iterate over list indexes and values | Lines: ~84-106
    Snippet: Iterate over list indexes and values
    Snippet: Description: Iterate over an array while accessing both index and value in a type-safe and explicit manner.
- Notes: —

## Iterate over list values
- ID: ID-0130
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Iterate over list values | Lines: ~62-83
    Snippet: Iterate over list values
    Snippet: Description: Iterate over each element of an array and apply a processing function to each element, with all required context explicitly defined.
- Notes: —

## Join a list of strings
- ID: ID-0131
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Join a list of strings | Lines: ~42-67
    Snippet: Join a list of strings
    Snippet: Description: Concatenate an array of strings into a single buffer using a fixed separator.
- Notes: —

## Join integer from LSB-first digit array
- ID: ID-0132
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_integers_join_digits_from_array | Lines: ~91
    Snippet: C99_LEETCODE_PUBLIC_DECL int c99lc_integers_join_digits_from_array(const unsigned char* src_array,
- Notes: —

## Last element of list
- ID: ID-0133
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Last element of list | Lines: ~241-250
    Snippet: Last element of list
    Snippet: Description: Retrieve the last element of a non-empty array.
- Notes: —

## Launch other program
- ID: ID-0134
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Launch other program | Lines: ~298-309
    Snippet: Launch other program
    Snippet: Description: Execute another program using the system shell.
- Notes: —

## Leap year check (Gregorian 4/100/400 rule)
- ID: ID-0135
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_date_is_leap_year | Lines: ~396
    Snippet: C99_LEETCODE_PUBLIC_DECL bool c99lc_date_is_leap_year(uint32_t year);
- Notes: —

## List files in directory
- ID: ID-0136
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: List files in directory | Lines: ~345-367
    Snippet: List files in directory
    Snippet: Description: List entries in a directory without recursion.
- Notes: —

## Local static for expensive one-time setup inside a function
- ID: ID-0137
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Local static for expensive one-time setup inside a function | Lines: ~78-90
    Snippet: **Local static for expensive one-time setup inside a function**
    Snippet: const char *lookup(int k) {
- Notes: —

## Make an infinite loop
- ID: ID-0138
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Make an infinite loop | Lines: ~32-41
    Snippet: Make an infinite loop
    Snippet: Description: Execute a loop without a termination condition.
- Notes: —

## Measure elapsed CPU time
- ID: ID-0139
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Measure elapsed CPU time | Lines: ~171-182
    Snippet: Measure elapsed CPU time
    Snippet: Description: Measure elapsed processor time using the standard C clock.
- Notes: —

## Memset a struct via its address, not by casting
- ID: ID-0140
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Memset a struct via its address, not by casting | Lines: ~579-588
    Snippet: **Memset a struct via its address, not by casting**
    Snippet: memset(&s, 0, sizeof s);
- Notes: —

## Multi-line string literal
- ID: ID-0141
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Multi-line string literal | Lines: ~1-11
    Snippet: Multi-line string literal
    Snippet: Description: Assign a string literal composed of multiple lines using implicit string literal concatenation.
- Notes: —

## Multiple return values
- ID: ID-0142
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Multiple return values | Lines: ~26-43
    Snippet: Multiple return values
    Snippet: Description: Return multiple values from a function by grouping them in a structure.
- Notes: —

## Multiply all the elements of a list
- ID: ID-0143
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Multiply all the elements of a list | Lines: ~192-205
    Snippet: Multiply all the elements of a list
    Snippet: Description: Multiply each element of an integer array by a constant factor.
- Notes: —

## Number of bytes of a type
- ID: ID-0144
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Number of bytes of a type | Lines: ~267-278
    Snippet: Number of bytes of a type
    Snippet: Description: Determine the number of bytes occupied by a variable.
- Notes: —

## Packed bitset with test/set/clear
- ID: ID-0145
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_bitset | Lines: ~287
    Snippet: typedef struct c99lc_bitset {
  - File: c99-leetcode.h | Anchor: c99lc_bitset_create | Lines: ~297
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_bitset* c99lc_bitset_create(size_t bits_capacity);
  - File: c99-leetcode.h | Anchor: c99lc_bitset_destroy | Lines: ~301
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_bitset_destroy(c99lc_bitset* bitset);
  - File: c99-leetcode.h | Anchor: c99lc_bitset_test | Lines: ~307
    Snippet: C99_LEETCODE_PUBLIC_DECL bool c99lc_bitset_test(const c99lc_bitset* bitset, size_t bit_index);
  - File: c99-leetcode.h | Anchor: c99lc_bitset_set | Lines: ~312
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_bitset_set(c99lc_bitset* bitset, size_t bit_index);
  - File: c99-leetcode.h | Anchor: c99lc_bitset_clear | Lines: ~317
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_bitset_clear(c99lc_bitset* bitset, size_t bit_index);
- Notes: Related: Bitset membership with unsigned shifts (avoid UB on signed); Set, clear, and test a bit.

## Parenthesis classification and matching
- ID: ID-0146
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_char_is_open_paren | Lines: ~338
    Snippet: C99_LEETCODE_PUBLIC_DECL bool c99lc_char_is_open_paren(char ch);
  - File: c99-leetcode.h | Anchor: c99lc_char_is_close_paren | Lines: ~342
    Snippet: C99_LEETCODE_PUBLIC_DECL bool c99lc_char_is_close_paren(char ch);
  - File: c99-leetcode.h | Anchor: c99lc_char_paren_reverse | Lines: ~347
    Snippet: C99_LEETCODE_PUBLIC_DECL char c99lc_char_paren_reverse(char ch);
- Notes: —

## Parse integer digits to LSB-first array
- ID: ID-0147
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_integers_parse_digits_to_array | Lines: ~86
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_integers_parse_digits_to_array(
- Notes: —

## Parse ISO date string YYYY-MM-DD with validation
- ID: ID-0148
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_reasonable_date_parse_from_string | Lines: ~408
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_reasonable_date_parse_from_string(
- Notes: —

## Parse uint32 from ASCII decimal string (validated)
- ID: ID-0149
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_integer_parse_uint32_from_string | Lines: ~353
    Snippet: C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_integer_parse_uint32_from_string(
- Notes: —

## Parse with `strtol` and keep the end pointer in the loop header
- ID: ID-0150
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Parse with `strtol` and keep the end pointer in the loop header | Lines: ~193-208
    Snippet: **Parse with `strtol` and keep the end pointer in the loop header**
    Snippet: for (char *p = s; *p; ) {
- Notes: —

## Pass a runnable procedure as parameter
- ID: ID-0151
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Pass a runnable procedure as parameter | Lines: ~153-162
    Snippet: Pass a runnable procedure as parameter
    Snippet: Description: Accept a function pointer as an argument and invoke it.
- Notes: —

## Pause execution for 5 seconds
- ID: ID-0152
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Pause execution for 5 seconds | Lines: ~144-162
    Snippet: Pause execution for 5 seconds
    Snippet: Description: Pause program execution for approximately five seconds using only standard C time facilities.
- Notes: —

## Pick a random element from a list
- ID: ID-0153
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Pick a random element from a list | Lines: ~157-169
    Snippet: Pick a random element from a list
    Snippet: Description: Select one element uniformly at random from a non-empty integer array.
- Notes: —

## Pick uniformly a random floating point number in [a..b)
- ID: ID-0154
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Pick uniformly a random floating point number in [a..b) | Lines: ~188-199
    Snippet: Pick uniformly a random floating point number in [a..b)
    Snippet: Description: Generate a floating point value greater than or equal to a and strictly less than b.
- Notes: —

## Pick uniformly a random integer in [a..b]
- ID: ID-0155
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Pick uniformly a random integer in [a..b] | Lines: ~200-219
    Snippet: Pick uniformly a random integer in [a..b]
    Snippet: Description: Generate a uniformly distributed integer in a closed interval while avoiding modulo bias.
- Notes: —

## Pointer iteration over array with end pointer
- ID: ID-0156
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Iterate with pointer and length | Lines: ~113-128
    Snippet: Iterate with pointer and length
    Snippet: Description: Process a contiguous buffer using pointer arithmetic and an explicit length.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Iterate pointers over arrays (often cleaner than indices) | Lines: ~142-153
    Snippet: **Iterate pointers over arrays (often cleaner than indices)**
    Snippet: for (int *p = a, *e = a + n; p != e; ++p) {
- Notes: —

## Preserve `errno` across cleanup that might clobber it
- ID: ID-0157
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Preserve `errno` across cleanup that might clobber it | Lines: ~362-374
    Snippet: **Preserve `errno` across cleanup that might clobber it**
    Snippet: int saved = errno;
- Notes: —

## Print `size_t` and pointers correctly
- ID: ID-0158
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Print `size_t` and pointers correctly | Lines: ~724-734
    Snippet: **Print `size_t` and pointers correctly**
    Snippet: printf("n=%zu\n", n);
- Notes: —

## Print Hello 10 times
- ID: ID-0159
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Print Hello 10 times | Lines: ~14-28
    Snippet: Print Hello 10 times
    Snippet: Description: Execute the same output operation a fixed number of times using a deterministic loop.
- Notes: —

## Print Hello World
- ID: ID-0160
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Print Hello World | Lines: ~1-13
    Snippet: Print Hello World
    Snippet: Description: Print a literal string followed by a newline to the standard output stream using a generic formatted output function.
- Notes: —

## Print integer array with brackets
- ID: ID-0161
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_print_integer_array | Lines: ~165
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_print_integer_array(const unsigned char* a, size_t n);
- Notes: —

## Print list elements by group of 2
- ID: ID-0162
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Print list elements by group of 2 | Lines: ~226-240
    Snippet: Print list elements by group of 2
    Snippet: Description: Print elements of an integer array two at a time.
- Notes: —

## Public declaration macro for C/C++ linkage (extern/static)
- ID: ID-0163
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: C99_LEETCODE_PUBLIC_DECL | Lines: ~33-41
    Snippet: #define C99_LEETCODE_PUBLIC_DECL static
    Snippet: #define C99_LEETCODE_PUBLIC_DECL extern "C"
- Notes: —

## Quine program
- ID: ID-0164
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Quine program | Lines: ~1-20
    Snippet: Quine program
    Snippet: Description: Output the program source code itself without reading from external files.
- Notes: —

## Read command line argument
- ID: ID-0165
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Read command line argument | Lines: ~141-154
    Snippet: Read command line argument
    Snippet: Description: Read the first command-line argument after the program name.
- Notes: —

## Read file line by line
- ID: ID-0166
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Read file line by line | Lines: ~156-170
    Snippet: Read file line by line
    Snippet: Description: Read a text file line by line using standard C I/O.
- Notes: Related: `fgets` loop with newline trimming in one place.

## Read integer from stdin
- ID: ID-0167
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Read integer from stdin | Lines: ~318-331
    Snippet: Read integer from stdin
    Snippet: Description: Read an integer value from standard input.
- Notes: —

## Recursive factorial (simple)
- ID: ID-0168
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Recursive factorial (simple) | Lines: ~1-13
    Snippet: Recursive factorial (simple)
    Snippet: Description: Compute the factorial of a non-negative integer using a simple recursive definition.
- Notes: —

## Rename file
- ID: ID-0169
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Rename file | Lines: ~169-180
    Snippet: Rename file
    Snippet: Description: Rename a file on the filesystem.
- Notes: —

## Repeated string
- ID: ID-0170
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Repeated string | Lines: ~46-70
    Snippet: Repeated string
    Snippet: Description: Create a new string consisting of a base string repeated a fixed number of times.
- Notes: —

## Resize dynamic array safely
- ID: ID-0171
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Resize dynamic array safely | Lines: ~26-42
    Snippet: Resize dynamic array safely
    Snippet: Description: Grow or shrink a dynamic allocation while preserving existing data.
- Notes: Related: `realloc` with a temporary to avoid losing the original pointer on failure.

## Result code enum for success/failure
- ID: ID-0172
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_result, C99LC_RESULT_* | Lines: ~50-51
    Snippet: typedef int c99lc_result;
    Snippet: enum { C99LC_RESULT_SUCCESS = 0, C99LC_RESULT_FAILED = 1 };
- Notes: —

## Return fraction and exponent of a real number
- ID: ID-0173
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Return fraction and exponent of a real number | Lines: ~76-90
    Snippet: Return fraction and exponent of a real number
    Snippet: Description: Decompose a floating point value into its normalized fraction and exponent.
- Notes: —

## Return static string literal
- ID: ID-0174
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_helloworld | Lines: ~68
    Snippet: C99_LEETCODE_PUBLIC_DECL const char* c99lc_helloworld(void);
  - File: c99-leetcode.h | Anchor: c99lc_version | Lines: ~76
    Snippet: C99_LEETCODE_PUBLIC_DECL const char* c99lc_version(void);
- Notes: —

## Return status/error code with output parameters
- ID: ID-0175
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Return status and output value | Lines: ~58-74
    Snippet: Return status and output value
    Snippet: Description: Return a success flag while writing the result through an output parameter.
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Return two values | Lines: ~34-62
    Snippet: Return two values
    Snippet: Description: Search a 2D integer matrix for a value and return its coordinates using output parameters.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Return error code, write outputs through pointers | Lines: ~631-640
    Snippet: **Return error code, write outputs through pointers**
    Snippet: int parse(const char *s, struct Result *out);
- Notes: —

## Reverse a string
- ID: ID-0176
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-00-e243d2ff-7904-434c-a3c1-bcfab09a8b70.txt | Anchor: Reverse a string | Lines: ~68-90
    Snippet: Reverse a string
    Snippet: Description: Create a new string containing the characters of the input string in reverse byte order. Multibyte encodings are not preserved.
- Notes: —

## Reverse array/list in place
- ID: ID-0177
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Reverse a list | Lines: ~13-33
    Snippet: Reverse a list
    Snippet: Description: Reverse the elements of an integer array in place.
  - File: c99-leetcode.h | Anchor: c99lc_array_int_reverse_in_place | Lines: ~172
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_array_int_reverse_in_place(int* array, size_t array_size);
- Notes: —

## Reverse loop without unsigned underflow traps
- ID: ID-0178
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Reverse loop without unsigned underflow traps | Lines: ~168-179
    Snippet: **Reverse loop without unsigned underflow traps**
    Snippet: for (size_t i = n; i-- > 0; ) {
- Notes: —

## Roman numeral conversion (char map + subtractive parse)
- ID: ID-0179
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_roman_char_to_int | Lines: ~360
    Snippet: C99_LEETCODE_PUBLIC_DECL int c99lc_roman_char_to_int(char ch);
  - File: c99-leetcode.h | Anchor: c99lc_roman_to_int | Lines: ~364
    Snippet: C99_LEETCODE_PUBLIC_DECL int c99lc_roman_to_int(const char* s);
- Notes: —

## Round floating point number to integer
- ID: ID-0180
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Round floating point number to integer | Lines: ~46-57
    Snippet: Round floating point number to integer
    Snippet: Description: Round a floating point value to the nearest integer, with ties rounded upward.
- Notes: —

## Safe memory allocation
- ID: ID-0181
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Safe memory allocation | Lines: ~8-25
    Snippet: Safe memory allocation
    Snippet: Description: Allocate memory and fail fast if allocation is unsuccessful.
- Notes: —

## Safe string copy with truncation
- ID: ID-0182
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Safe string copy with truncation | Lines: ~75-90
    Snippet: Safe string copy with truncation
    Snippet: Description: Copy a string into a fixed buffer while guaranteeing null termination.
- Notes: —

## Seed random generator
- ID: ID-0183
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Seed random generator | Lines: ~218-229
    Snippet: Seed random generator
    Snippet: Description: Initialize the pseudo-random number generator with a fixed seed.
- Notes: —

## Set, clear, and test a bit
- ID: ID-0184
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Set, clear, and test a bit | Lines: ~199-218
    Snippet: Set, clear, and test a bit
    Snippet: Description: Manipulate individual bits using bit masks.
- Notes: Related: Bitset membership with unsigned shifts (avoid UB on signed); packed bitset utilities in c99-leetcode.h.

## Shuffle a list
- ID: ID-0185
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-22-2c2fe867-285b-4863-b0c2-8fd1d306d3c8.txt | Anchor: Shuffle a list | Lines: ~135-156
    Snippet: Shuffle a list
    Snippet: Description: Randomly permute the elements of an integer array using the Fisher-Yates algorithm.
- Notes: —

## Simple stack using array
- ID: ID-0186
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Simple stack using array | Lines: ~219-253
    Snippet: Simple stack using array
    Snippet: Description: Implement a fixed-size stack using an array and an index.
- Notes: —

## Single-exit cleanup with `goto`
- ID: ID-0187
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Single-exit cleanup with `goto` | Lines: ~325-350
    Snippet: **Single-exit cleanup with `goto`**
    Snippet: int f(void) {
- Notes: —

## Single-header library with implementation macro and feature toggles
- ID: ID-0188
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: Header comment: Design/Build (C99_LEETCODE_IMPLEMENTATION) | Lines: ~10-21
    Snippet: - Single-header; include this file everywhere.
    Snippet: - In one translation unit: #define C99_LEETCODE_IMPLEMENTATION before include.
    Snippet: #define C99_LEETCODE_IMPLEMENTATION
- Notes: —

## Size-in, size-out for buffers (and report required size)
- ID: ID-0189
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Size-in, size-out for buffers (and report required size) | Lines: ~651-660
    Snippet: **Size-in, size-out for buffers (and report required size)**
    Snippet: int encode(char *dst, size_t dst_sz, size_t *out_sz);
- Notes: —

## Sort by a comparator (qsort/bsearch)
- ID: ID-0190
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Sort by a comparator | Lines: ~197-221
    Snippet: Sort by a comparator
    Snippet: Description: Sort an array of integers using qsort with a custom comparator.
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Sort by a property | Lines: ~127-155
    Snippet: Sort by a property
    Snippet: Description: Sort an array of structures by an integer field using qsort and a comparator.
  - File: c99-leetcode.h | Anchor: c99lc_array_int_compare | Lines: ~221
    Snippet: C99_LEETCODE_PUBLIC_DECL int c99lc_array_int_compare(const void* a, const void* b);
- Notes: —

## Source code inclusion
- ID: ID-0191
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Source code inclusion | Lines: ~44-53
    Snippet: Source code inclusion
    Snippet: Description: Include source code from another file directly into a function body.
- Notes: —

## Sparse array initialization with designated indices
- ID: ID-0192
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Sparse array initialization with designated indices | Lines: ~30-39
    Snippet: **Sparse array initialization with designated indices**
    Snippet: int map[256] = { [0 ... 255] = -1, ['A'] = 0, ['B'] = 1 };
- Notes: —

## Split a space-separated string
- ID: ID-0193
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Split a space-separated string | Lines: ~12-31
    Snippet: Split a space-separated string
    Snippet: Description: Split a mutable string into space-separated tokens using the standard C tokenizer.
- Notes: —

## Strict aliasing safe type-punning: use `memcpy`, not pointer casts
- ID: ID-0194
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Strict aliasing safe type-punning: use `memcpy`, not pointer casts | Lines: ~589-600
    Snippet: **Strict aliasing safe type-punning: use `memcpy`, not pointer casts**
    Snippet: float f;
- Notes: —

## String interpolation
- ID: ID-0195
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: String interpolation | Lines: ~118-130
    Snippet: String interpolation
    Snippet: Description: Format a string by inserting an integer value into a text template.
- Notes: Related: `snprintf` for bounded formatting and detecting truncation.

## Stringize and concatenate for generating names and messages
- ID: ID-0196
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Stringize and concatenate for generating names and messages | Lines: ~434-450
    Snippet: **Stringize and concatenate for generating names and messages**
    Snippet: #define STR_(x) #x
- Notes: —

## Successive conditions
- ID: ID-0197
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Successive conditions | Lines: ~79-94
    Snippet: Successive conditions
    Snippet: Description: Execute the first matching branch among several mutually exclusive conditions.
- Notes: —

## Sum digits in array
- ID: ID-0198
- Status: TODO
- Occurrences:
  - File: c99-leetcode.h | Anchor: c99lc_digits_sum | Lines: ~116
    Snippet: C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_digits_sum(const unsigned char* digits,
- Notes: —

## Swap values via temporary
- ID: ID-0199
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-33-10-4c730410-9586-4d22-a37d-4ff973c24b1b.txt | Anchor: Swap values | Lines: ~63-74
    Snippet: Swap values
    Snippet: Description: Swap the values of two integers using a temporary variable.
  - File: c99-leetcode.h | Anchor: c99lc_util_swap_u32 | Lines: ~176
    Snippet: C99_LEETCODE_PUBLIC_DECL void c99lc_util_swap_u32(uint32_t* a, uint32_t* b);
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Swap via temporary" plus the macro version (evaluate once) | Lines: ~786-795
    Snippet: **"Swap via temporary" plus the macro version (evaluate once)**
    Snippet: #define SWAP(a,b) do { __typeof__(a) _t = (a); (a) = (b); (b) = _t; } while (0)
- Notes: —

## Switch-driven state machine with intentional fallthrough
- ID: ID-0200
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Switch-driven state machine with intentional fallthrough | Lines: ~223-240
    Snippet: **Switch-driven state machine with intentional fallthrough**
    Snippet: switch (state) {
- Notes: —

## Test if string is empty
- ID: ID-0201
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Test if string is empty | Lines: ~144-156
    Snippet: Test if string is empty
    Snippet: Description: Check whether a string has zero length.
- Notes: —

## The canonical "walk a C string" pointer loop
- ID: ID-0202
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > The canonical "walk a C string" pointer loop | Lines: ~241-252
    Snippet: **The canonical "walk a C string" pointer loop**
    Snippet: for (const unsigned char *p = (const unsigned char *)s; *p; ++p) {
- Notes: —

## The comma operator for tight loops (use sparingly)
- ID: ID-0203
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > The comma operator for tight loops (use sparingly) | Lines: ~756-765
    Snippet: **The comma operator for tight loops (use sparingly)**
    Snippet: for (i = 0, p = a; i < n; ++i, ++p) { /* ... */ }
- Notes: —

## The do-while(0) macro wrapper so statements behave like statements
- ID: ID-0204
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > The do-while(0) macro wrapper so statements behave like statements | Lines: ~403-412
    Snippet: **The do-while(0) macro wrapper so statements behave like statements**
    Snippet: #define CHECK(x) do { if (!(x)) return -1; } while (0)
- Notes: —

## Tokenize without `strtok` by using `strcspn` and manual slicing
- ID: ID-0205
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Tokenize without `strtok` by using `strcspn` and manual slicing | Lines: ~309-324
    Snippet: **Tokenize without `strtok` by using `strcspn` and manual slicing**
    Snippet: for (char *p = s; *p; ) {
- Notes: —

## Trim prefix
- ID: ID-0206
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Trim prefix | Lines: ~251-263
    Snippet: Trim prefix
    Snippet: Description: Remove a prefix from a string if it is present.
- Notes: —

## Trim whitespace in place (two pointers)
- ID: ID-0207
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-31-38-3b747b60-01ea-44f3-8281-792384889c35.txt | Anchor: Trim whitespace from both ends | Lines: ~91-112
    Snippet: Trim whitespace from both ends
    Snippet: Description: Remove leading and trailing ASCII whitespace from a mutable string.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > "Trim in place" with two indices/pointers | Lines: ~707-723
    Snippet: **"Trim in place" with two indices/pointers**
    Snippet: char *p = s;
- Notes: —

## Truncate floating point number to integer
- ID: ID-0208
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-34-2403e879-2c5d-4104-9d58-963e6d705a37.txt | Anchor: Truncate floating point number to integer | Lines: ~36-45
    Snippet: Truncate floating point number to integer
    Snippet: Description: Convert a floating point value to an integer by truncating toward zero.
- Notes: —

## Turn a character into a string
- ID: ID-0209
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-20-669eb50a-d222-4e9e-a5c3-e44f635f3c9e.txt | Anchor: Turn a character into a string | Lines: ~161-171
    Snippet: Turn a character into a string
    Snippet: Description: Create a null-terminated string containing a single character.
- Notes: —

## Use `__FILE__` and `__LINE__` for trace points
- ID: ID-0210
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Use `__FILE__` and `__LINE__` for trace points | Lines: ~735-744
    Snippet: **Use `__FILE__` and `__LINE__` for trace points**
    Snippet: fprintf(stderr, "%s:%d: failed\n", __FILE__, __LINE__);
- Notes: —

## Use `const` to document and enforce read-only inputs
- ID: ID-0211
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Use `const` to document and enforce read-only inputs | Lines: ~661-670
    Snippet: **Use `const` to document and enforce read-only inputs**
    Snippet: int hash(const void *data, size_t n, uint32_t *out);
- Notes: —

## Use `restrict` (C99) when you can prove non-aliasing
- ID: ID-0212
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Use `restrict` (C99) when you can prove non-aliasing | Lines: ~817-826
    Snippet: **Use `restrict` (C99) when you can prove non-aliasing**
    Snippet: void saxpy(float *restrict y, const float *restrict x, size_t n, float a);
- Notes: —

## Use `sizeof (type){0}` to get a type size without naming an object
- ID: ID-0213
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Use `sizeof (type){0}` to get a type size without naming an object | Lines: ~91-100
    Snippet: **Use `sizeof (type){0}` to get a type size without naming an object**
    Snippet: size_t n = sizeof (struct Header){0};
- Notes: —

## Use clock as random generator seed
- ID: ID-0214
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Use clock as random generator seed | Lines: ~230-242
    Snippet: Use clock as random generator seed
    Snippet: Description: Seed the pseudo-random number generator using the current system time.
- Notes: —

## Use scansets in `sscanf` when you really do want it (bounded)
- ID: ID-0215
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Use scansets in `sscanf` when you really do want it (bounded) | Lines: ~696-706
    Snippet: **Use scansets in `sscanf` when you really do want it (bounded)**
    Snippet: char key[32];
- Notes: —

## Write to standard error stream
- ID: ID-0216
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-47-d68f13b1-3bee-4b23-ab0e-f857b45b97f5.txt | Anchor: Write to standard error stream | Lines: ~129-140
    Snippet: Write to standard error stream
    Snippet: Description: Print a formatted message to the standard error stream.
- Notes: —

## X-macro tables: one list, many derived artifacts
- ID: ID-0217
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > X-macro tables: one list, many derived artifacts | Lines: ~451-476
    Snippet: **X-macro tables: one list, many derived artifacts**
    Snippet: /* list */
- Notes: —

## Xor integers
- ID: ID-0218
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-10-732f6e85-6ad5-44c8-a2ba-624cbe2f5484.txt | Anchor: Xor integers | Lines: ~126-135
    Snippet: Xor integers
    Snippet: Description: Compute the bitwise exclusive OR of two integers.
- Notes: —

## Zero-initialize heap allocation with calloc
- ID: ID-0219
- Status: TODO
- Occurrences:
  - File: 2026-01-23T17-32-01-cbf67189-22c5-4e09-be52-cc1d99327932.txt | Anchor: Create a zeroed list of integers | Lines: ~98-109
    Snippet: Create a zeroed list of integers
    Snippet: Description: Allocate an integer array initialized with zeros.
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Zero-initialize heap objects with `calloc` when it matches the semantics | Lines: ~569-578
    Snippet: **Zero-initialize heap objects with `calloc` when it matches the semantics**
    Snippet: T *p = calloc(count, sizeof *p);
- Notes: —

## Zero-initialize scalars and aggregates with `{0}` (and know what it really does)
- ID: ID-0220
- Status: TODO
- Occurrences:
  - File: dev-c99-mini-idioms.md | Anchor: dev-c99-mini-idioms > Zero-initialize scalars and aggregates with `{0}` (and know what it really does) | Lines: ~4-15
    Snippet: **Zero-initialize scalars and aggregates with `{0}` (and know what it really does)**
    Snippet: int x = 0;
- Notes: —
