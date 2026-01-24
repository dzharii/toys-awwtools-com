/* c99-leetcode.h - v0.1 - single-header C99 utilities
   Public Domain or MIT, your choice, see end of file.

   Overview
     Tiny stb-style header providing small, dependency-free helpers commonly
     needed in coding challenge style problems: integer digit routines,
     bit counting and parity, array reversal, Roman numeral conversion,
     ASCII decimal parsing, a minimal int vector, and simple date helpers.

   Design
     - Single-header; include this file everywhere.
     - In one translation unit: #define C99_LEETCODE_IMPLEMENTATION before include.
     - Optional C99_LEETCODE_STATIC makes definitions 'static' in that TU.
     - Optional C99_LEETCODE_NO_STDIO omits printf-based helpers.
     - No hidden global state. Allocation hooks are provided but optional.

   Build
     In one source file:
       #define C99_LEETCODE_IMPLEMENTATION
       #include "c99-leetcode.h"
     In all other files:
       #include "c99-leetcode.h"
*/

#ifndef C99_LEETCODE_H_INCLUDE
#define C99_LEETCODE_H_INCLUDE

#ifdef __cplusplus
extern "C" {
#endif

/* Public declaration macro: resolves to extern or extern "C" for C++. */
#ifndef C99_LEETCODE_PUBLIC_DECL
#ifdef C99_LEETCODE_STATIC
#define C99_LEETCODE_PUBLIC_DECL static
#else
#ifdef __cplusplus
#define C99_LEETCODE_PUBLIC_DECL extern "C"
#else
#define C99_LEETCODE_PUBLIC_DECL extern
#endif
#endif
#endif

/* Standard integer and boolean types */
#include <stdint.h>
#include <stdbool.h>

/* Result code (moved early so later declarations can use it) */
typedef int c99lc_result;
enum { C99LC_RESULT_SUCCESS = 0, C99LC_RESULT_FAILED = 1 };

/* Optional configuration hooks for future allocation needs. */
#ifndef C99_LEETCODE_NO_ALLOC
#include <stddef.h>
#ifndef C99_LEETCODE_MALLOC
#include <stdlib.h>
#define C99_LEETCODE_MALLOC(ctx, size) ((void)(ctx), malloc(size))
#define C99_LEETCODE_FREE(ctx, ptr) ((void)(ctx), free(ptr))
#define C99_LEETCODE_REALLOC(ctx, ptr, size) ((void)(ctx), realloc(ptr, size))
#endif
#endif

/* Public API */

/* Returns a pointer to a constant, null-terminated "Hello, World!" string.
   Storage duration is static; caller must not free the returned pointer. */
C99_LEETCODE_PUBLIC_DECL const char* c99lc_helloworld(void);

/* Copies "Hello, World!" into out and null-terminates.
   Returns bytes written excluding the terminator, or 0 if out is NULL or out_cap is 0. */
C99_LEETCODE_PUBLIC_DECL int c99lc_helloworld_into(char* out, size_t out_cap);

/* Returns the library version string such as "0.1".
   String has static storage duration; caller must not free it. */
C99_LEETCODE_PUBLIC_DECL const char* c99lc_version(void);

/* Integer utilities */

/* Counts the number of decimal digits in x.
   Example: 0 -> 1, 90991 -> 5; ignores the sign for negative inputs. */
C99_LEETCODE_PUBLIC_DECL size_t c99lc_integers_count_digits(int x);

/* Decomposes source into decimal digits written LSB-first into dest_array.
   Writes up to dest_array_size digits; negative numbers produce absolute digits. */
C99_LEETCODE_PUBLIC_DECL void c99lc_integers_parse_digits_to_array(
    int source, unsigned char* dest_array, size_t dest_array_size);

/* Reconstructs an integer from digits stored LSB-first in src_array.
   Returns 0 if src_array is NULL or src_array_size is 0. */
C99_LEETCODE_PUBLIC_DECL int c99lc_integers_join_digits_from_array(const unsigned char* src_array,
    size_t src_array_size);

/* Counts set bits (population count) in number treated as unsigned.
   Works for all int values by casting to unsigned during the count. */
C99_LEETCODE_PUBLIC_DECL int c99lc_integers_count_set_bits(int number);

/* Returns 1 if num is even, otherwise 0.
   Handles negative and positive values consistently. */
C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_integers_is_even(int num);

/* Returns 1 if the base-10 representation of num contains at least one '0' digit, else 0.
   Behavior:
       - 0 returns 1 (its only digit is zero).
       - Negative values are examined by their absolute value.
   Examples: 101 -> 1, 123 -> 0, 909 -> 1.
   Complexity: O(d) where d is the number of decimal digits. */
C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_integers_has_zero_digit(int num);

/* Increments a big-endian decimal digit array in place by 1.
   Digits must be in [0,9]; carry ripples from the least significant end. */
C99_LEETCODE_PUBLIC_DECL void c99lc_digits_increment(unsigned char* digits, size_t digits_size);

/* Sums the decimal digits in digits[0..digits_size).
   Returns 0 if digits is NULL or digits_size is 0. */
C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_digits_sum(const unsigned char* digits,
    size_t digits_size);

/* Fixed-capacity positive decimal digit buffer.
   Represents a non-negative integer in base-10 with digits stored least-significant first.
   Intended for problems like LeetCode 989 (Add to Array-Form of Integer) to avoid dynamic
   allocation in intermediate steps.
   Invariants:
     - size in [1, capacity] when representing a value.
     - digits[i] in [0,9].
*/
typedef struct c99lc_digits_positive_int_buffer {
    size_t size; /* number of used digits */
    size_t capacity; /* total available slots in digits[] */
    unsigned char* digits; /* LSB-first digit storage */
} c99lc_digits_positive_int_buffer;

/* Initializes buf with external storage digits[0..capacity).
   After init the represented value is 0 (size==1, digits[0]==0).
   Returns C99LC_RESULT_FAILED if arguments invalid (buf==NULL, digits==NULL, capacity==0). */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_init(
    c99lc_digits_positive_int_buffer* buf, unsigned char* digits_mem, size_t capacity);

/* Parses non-negative integer k into buf (overwriting previous contents).
   Requires k>=0 and buf previously initialized. Returns C99LC_RESULT_FAILED on NULL buf or
   if capacity insufficient (when k has more digits than capacity). */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_from_int(
    c99lc_digits_positive_int_buffer* buf, int k);

/* Loads digits from a big-endian array src[0..n) (as typically provided by LeetCode where
   the first element is the most significant digit). Fails if n==0, buf NULL, or n>capacity. */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_from_big_endian_array(
    c99lc_digits_positive_int_buffer* buf, const int* src, size_t n);

/* Adds two buffers a and b storing LSB-first digits and writes result into out.
   Fails if out capacity < max(a.size,b.size)+1 or any pointer NULL. Out may alias neither a nor b. */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_add(
    const c99lc_digits_positive_int_buffer* a,
    const c99lc_digits_positive_int_buffer* b,
    c99lc_digits_positive_int_buffer* out);

/* Writes big-endian int array of the number in buf into dst[0..dst_cap). On success sets *out_size.
   Fails if dst_cap < buf->size. dst and buf must be non-null. */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_positive_int_to_big_endian_int_array(
    const c99lc_digits_positive_int_buffer* buf, int* dst, size_t dst_cap, size_t* out_size);

#ifndef C99_LEETCODE_NO_STDIO
/* Prints digits as "[d0, d1, ...]\n" to stdout.
   Safe to call with NULL pointer (prints an empty list). */
C99_LEETCODE_PUBLIC_DECL void c99lc_print_integer_array(const unsigned char* a, size_t n);
#endif

/* Arrays and utilities */

/* Reverses array[0..array_size) in place.
   No-op if array is NULL or array_size is 0. */
C99_LEETCODE_PUBLIC_DECL void c99lc_array_int_reverse_in_place(int* array, size_t array_size);

/* Swaps two 32-bit unsigned integers pointed to by a and b.
   No-op if either pointer is NULL. */
C99_LEETCODE_PUBLIC_DECL void c99lc_util_swap_u32(uint32_t* a, uint32_t* b);

/* Returns 1 if a[0..n) forms a palindrome when read from index 0 to n-1.
     Behavior:
         - Returns 1 for n == 0 or n == 1 (empty and single-element sequences are palindromes).
         - Returns 0 if a is NULL and n > 0.
     Intended for digit arrays or general byte sequences. */
C99_LEETCODE_PUBLIC_DECL unsigned char c99lc_array_u8_is_palindrome(const unsigned char* a,
    size_t n);

/* Interleave halves of an int array.
    Input:  src holds 2*n ints as [x1, x2, ..., xn, y1, y2, ..., yn].
    Output: dst becomes [x1, y1, x2, y2, ..., xn, yn].
    No allocation; no-op if pointers are NULL or n==0. */
C99_LEETCODE_PUBLIC_DECL void c99lc_array_int_interleave_halves(int* dst, const int* src, size_t n);

/* Adds two non-negative integers represented as base-10 digit arrays stored LSB-first.
     Inputs:
         a[0..a_size) and b[0..b_size) hold digits with a[0] the least significant digit.
     Output:
         Writes the sum into out[0..*out_size) also LSB-first.
         On success returns C99LC_RESULT_SUCCESS and sets *out_size to the number of digits
         written (never exceeding out_cap).
     Failure cases:
         - Any required pointer is NULL (a/b/out/out_size) while its size is > 0.
         - out_cap is insufficient for max(a_size, b_size) + 1 potential carry digit.
       In these cases returns C99LC_RESULT_FAILED and leaves *out_size unmodified.
     Notes:
         - Digits must each be in the range [0,9]; behavior is undefined otherwise.
         - Accepts zero-length operands (treated as value 0).
         - This helper is allocation-free and intended for small / medium sized numbers
           typical in coding challenge contexts. */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_digits_add_lsb_first(const unsigned char* a,
    size_t a_size,
    const unsigned char* b,
    size_t b_size,
    unsigned char* out,
    size_t out_cap,
    size_t* out_size);

/* Comparison function for int arrays compatible with qsort and bsearch.
   Returns negative if *a < *b, zero if *a == *b, positive if *a > *b.
   Avoids overflow by using subtraction comparison idiom.
   Example: qsort(array, size, sizeof(int), c99lc_array_int_compare);
   Complexity: O(1). */
C99_LEETCODE_PUBLIC_DECL int c99lc_array_int_compare(const void* a, const void* b);

/* Removes consecutive duplicate elements from a sorted int array in place.
   Input: array[0..size) must be sorted in ascending order.
   Output: Unique elements are compacted at the beginning of array.
   Returns: The new size (count of distinct elements).
   Behavior:
       - Returns 0 if array is NULL or size is 0.
       - Returns 1 if size is 1.
       - Does not modify elements beyond the returned size.
   Example: [1,1,2,3,3,3,4] becomes [1,2,3,4] and returns 4.
   Complexity: O(n) where n is size. */
C99_LEETCODE_PUBLIC_DECL size_t c99lc_array_int_dedup_sorted(int* array, size_t size);

/* Finds elements in source that are not present in sorted_lookup array.
   Inputs:
       - source[0..source_size): Array to search in.
       - sorted_lookup[0..lookup_size): Sorted array of values to exclude.
       - out[0..source_size): Destination buffer for difference elements.
   Output:
       - Writes elements from source not found in sorted_lookup into out.
       - Returns the count of elements written to out.
   Behavior:
       - Returns 0 if source is NULL, source_size is 0, or sorted_lookup is NULL.
       - sorted_lookup must be sorted in ascending order for correct results.
       - Uses binary search for efficient lookup (O(log m) per element).
   Example: source=[1,2,3,4], sorted_lookup=[2,4] -> out=[1,3], returns 2.
   Complexity: O(n log m) where n=source_size, m=lookup_size. */
C99_LEETCODE_PUBLIC_DECL size_t c99lc_array_int_diff(
    const int* source, size_t source_size, const int* sorted_lookup, size_t lookup_size, int* out);

/* Stack utilities */

/* Fixed-capacity character stack using flexible array member.
   Provides a simple LIFO container for character data with allocation at creation time. */
typedef struct c99lc_stack_char_fla {
    size_t capacity; /* maximum number of characters the stack can hold */
    size_t count; /* current number of characters in the stack */
    char items[]; /* flexible array member for character storage */
} c99lc_stack_char_fla;

/* Creates a character stack with specified capacity.
   Returns NULL on allocation failure or if capacity is 0. */
C99_LEETCODE_PUBLIC_DECL c99lc_stack_char_fla* c99lc_stack_char_fla_create(size_t capacity);

/* Destroys a character stack and frees its memory.
   Safe to call with NULL pointer. */
C99_LEETCODE_PUBLIC_DECL void c99lc_stack_char_fla_destroy(c99lc_stack_char_fla* stack);

/* Returns the current number of characters in the stack.
   Returns 0 if stack is NULL. */
C99_LEETCODE_PUBLIC_DECL size_t c99lc_stack_char_fla_count(const c99lc_stack_char_fla* stack);

/* Pushes a character onto the stack.
   Returns true on success, false if stack is NULL or at capacity. */
C99_LEETCODE_PUBLIC_DECL bool c99lc_stack_char_fla_push(c99lc_stack_char_fla* stack, char c);

/* Pops a character from the stack and stores it in *out.
   Returns true on success, false if stack is NULL, empty, or out is NULL. */
C99_LEETCODE_PUBLIC_DECL bool c99lc_stack_char_fla_pop(c99lc_stack_char_fla* stack, char* out);

/* Bitset utilities */

/* Compact bitset using uint8_t array with flexible array member.
   Stores bits packed into bytes, providing efficient storage for boolean flags.
   Bit indices are zero-based; bit i resides in items[i/8] at position (i%8). */
typedef struct c99lc_bitset {
    size_t bytes_capacity; /* number of bytes allocated in items[] */
    size_t bits_capacity; /* maximum number of bits that can be stored */
    uint8_t items[]; /* flexible array member for bit storage */
} c99lc_bitset;

/* Creates a bitset capable of storing up to bits_capacity bits.
   All bits are initialized to 0.
   Returns NULL on allocation failure or if bits_capacity is 0.
   Complexity: O(n) where n = (bits_capacity + 7) / 8. */
C99_LEETCODE_PUBLIC_DECL c99lc_bitset* c99lc_bitset_create(size_t bits_capacity);

/* Destroys a bitset and frees its memory.
   Safe to call with NULL pointer. */
C99_LEETCODE_PUBLIC_DECL void c99lc_bitset_destroy(c99lc_bitset* bitset);

/* Tests whether the bit at bit_index is set (1) or clear (0).
   Returns true if the bit is set, false otherwise.
   Behavior is undefined if bit_index >= bitset->bits_capacity or bitset is NULL.
   Complexity: O(1). */
C99_LEETCODE_PUBLIC_DECL bool c99lc_bitset_test(const c99lc_bitset* bitset, size_t bit_index);

/* Sets the bit at bit_index to 1.
   Behavior is undefined if bit_index >= bitset->bits_capacity or bitset is NULL.
   Complexity: O(1). */
C99_LEETCODE_PUBLIC_DECL void c99lc_bitset_set(c99lc_bitset* bitset, size_t bit_index);

/* Clears the bit at bit_index to 0.
   Behavior is undefined if bit_index >= bitset->bits_capacity or bitset is NULL.
   Complexity: O(1). */
C99_LEETCODE_PUBLIC_DECL void c99lc_bitset_clear(c99lc_bitset* bitset, size_t bit_index);

/* String utilities */

/* Converts source string to camelCase by capitalizing letters after spaces and lowercasing others.
   Writes result into buffer[0..buffer_capacity), returns number of characters written.
   Only alphabetic characters are copied; spaces and other characters are skipped.
   First character is always lowercase if it's alphabetic.
   Parameters:
     - source: null-terminated input string
     - buffer: destination buffer for camelCase result
     - buffer_capacity: maximum characters to write (excluding null terminator)
   Returns: number of characters written, or 0 if source/buffer is NULL or buffer_capacity is 0.
   Complexity: O(n) where n is strlen(source). */
C99_LEETCODE_PUBLIC_DECL size_t c99lc_string_to_camel_case(
    const char* source, char* buffer, size_t buffer_capacity);

/* Character classification helpers */

/* Returns true if the character is an opening parenthesis: '(', '{', or '['.
   Returns false for any other character. */
C99_LEETCODE_PUBLIC_DECL bool c99lc_char_is_open_paren(char ch);

/* Returns true if the character is a closing parenthesis: ')', '}', or ']'.
   Returns false for any other character. */
C99_LEETCODE_PUBLIC_DECL bool c99lc_char_is_close_paren(char ch);

/* Returns the matching parenthesis for the given character.
   Maps '(' to ')', '{' to '}', '[' to ']' and vice versa.
   Returns '\0' if the character is not a recognized parenthesis. */
C99_LEETCODE_PUBLIC_DECL char c99lc_char_paren_reverse(char ch);

/* Parsing helpers */

/* Parses ASCII decimal digits from input[0..input_size) into *out.
   Fails on non-digits or empty input; returns a C99LC_RESULT_* code. */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_integer_parse_uint32_from_string(
    const char* input, size_t input_size, uint32_t* out);

/* Roman numerals */

/* Maps a single Roman numeral character to its integer value.
   Returns 0 for unsupported characters. */
C99_LEETCODE_PUBLIC_DECL int c99lc_roman_char_to_int(char ch);

/* Converts a Roman numeral string using standard subtractive notation.
   Returns 0 for NULL or for a string that contributes no valid symbols. */
C99_LEETCODE_PUBLIC_DECL int c99lc_roman_to_int(const char* s);

/* Lightweight dynamic array for ints */

typedef struct c99lc_leaf_values {
    size_t size;
    size_t capacity;
    int* items;
} c99lc_leaf_values;

/* Allocates a growable array of int with initial_capacity (1 if 0).
   Returns NULL on allocation failure. */
C99_LEETCODE_PUBLIC_DECL c99lc_leaf_values* c99lc_leaf_values_create(size_t initial_capacity);

/* Appends item to the end of the vector, growing capacity as needed.
   If reallocation fails the push is dropped. */
C99_LEETCODE_PUBLIC_DECL void c99lc_leaf_values_push(c99lc_leaf_values* lv, int item);

/* Frees the vector and its storage.
   Safe to call with NULL. */
C99_LEETCODE_PUBLIC_DECL void c99lc_leaf_values_destroy(c99lc_leaf_values* lv);

/* Date helpers */

typedef struct c99lc_reasonable_date {
    uint32_t year;
    uint32_t month;
    uint32_t day;
} c99lc_reasonable_date;

/* Returns true if year is a Gregorian leap year.
   Applies the 4, 100, 400 rule. */
C99_LEETCODE_PUBLIC_DECL bool c99lc_date_is_leap_year(uint32_t year);

/* Returns the number of days in the given month of year.
   Returns 0 if month is out of range 1..12. */
C99_LEETCODE_PUBLIC_DECL uint32_t c99lc_date_days_in_month(uint32_t year, uint32_t month);

/* Counts days since 1971-01-01 for date d.
   Returns 0 if d is NULL; assumes d contains a valid date. */
C99_LEETCODE_PUBLIC_DECL uint32_t c99lc_date_days_since_1971(const c99lc_reasonable_date* d);

/* Parses "YYYY-MM-DD" into out and validates month and day ranges.
   Returns C99LC_RESULT_SUCCESS on success, otherwise C99LC_RESULT_FAILED. */
C99_LEETCODE_PUBLIC_DECL c99lc_result c99lc_reasonable_date_parse_from_string(
    const char* date_string, c99lc_reasonable_date* out);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* C99_LEETCODE_H_INCLUDE */

/*=============================================================================
   IMPLEMENTATION
  =============================================================================*/
#ifdef C99_LEETCODE_IMPLEMENTATION

/* Definition macro: empty for global symbols, or 'static' when C99_LEETCODE_STATIC. */
#ifndef C99_LEETCODE_PUBLIC_DEF
#ifdef C99_LEETCODE_STATIC
#define C99_LEETCODE_PUBLIC_DEF static
#else
#define C99_LEETCODE_PUBLIC_DEF
#endif
#endif

/* Private namespace prefix 'c99lc__' for internal symbols. */
static const char c99lc__hello_literal[] = "Hello, World!";
static const char c99lc__version_literal[] = "0.1";

C99_LEETCODE_PUBLIC_DEF const char* c99lc_helloworld(void) {
    return c99lc__hello_literal;
}

C99_LEETCODE_PUBLIC_DEF int c99lc_helloworld_into(char* out, size_t out_cap) {
    /* Fast-fail if buffer cannot hold even the terminator. */
    const bool has_writable_buffer = (out != NULL) && (out_cap > 0u);
    if (!has_writable_buffer) return 0;

    const char* hello = c99lc__hello_literal;
    size_t write_index = 0u;
    const size_t last_writable_index = out_cap - 1u; /* keep space for '\0' */

    while (hello[write_index] != '\0' && write_index < last_writable_index) {
        out[write_index] = hello[write_index];
        ++write_index;
    }

    out[write_index] = '\0';
    return (int)write_index;
}

C99_LEETCODE_PUBLIC_DEF const char* c99lc_version(void) {
    return c99lc__version_literal;
}

/* ---- Integer utilities implementation ----------------------------------- */
#include <stddef.h> /* size_t */
#include <ctype.h> /* isalpha, toupper, tolower */

C99_LEETCODE_PUBLIC_DEF size_t c99lc_integers_count_digits(int x) {
    if (x == 0) return 1u;

    size_t digit_count = 0u;
    if (x < 0) x = -x;

    while (x > 0) {
        x /= 10;
        ++digit_count;
    }
    return digit_count;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_integers_parse_digits_to_array(
    int source, unsigned char* dest_array, size_t dest_array_size) {
    if (!dest_array || dest_array_size == 0u) return;

    for (size_t i = 0; i < dest_array_size; ++i) {
        const int quotient = source / 10;
        int digit = source - quotient * 10; /* avoids % pitfalls for negatives */
        if (digit < 0) digit = -digit;
        dest_array[i] = (unsigned char)digit;
        source = quotient;
    }
}

C99_LEETCODE_PUBLIC_DEF int c99lc_integers_join_digits_from_array(const unsigned char* src_array,
    size_t src_array_size) {
    if (!src_array || src_array_size == 0u) return 0;

    int value = 0;
    for (size_t i = 0; i < src_array_size; ++i) {
        const size_t index_from_msb = (src_array_size - 1u) - i;
        value = value * 10 + (int)src_array[index_from_msb];
    }
    return value;
}

C99_LEETCODE_PUBLIC_DEF int c99lc_integers_count_set_bits(int number) {
    unsigned int v = (unsigned int)number;
    int bits_set_count = 0;
    while (v != 0u) {
        v &= (v - 1u);
        ++bits_set_count;
    }
    return bits_set_count;
}

C99_LEETCODE_PUBLIC_DEF unsigned char c99lc_integers_is_even(int num) {
    const bool is_even = ((num % 2) == 0);
    return (unsigned char)(is_even ? 1u : 0u);
}

C99_LEETCODE_PUBLIC_DEF unsigned char c99lc_integers_has_zero_digit(int num) {
    if (num == 0) return 1u; /* defined: 0 has a zero digit */
    if (num < 0) num = -num;
    while (num > 0) {
        const int digit = num % 10;
        if (digit == 0) return 1u;
        num /= 10;
    }
    return 0u;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_digits_increment(unsigned char* digits, size_t digits_size) {
    if (!digits || digits_size == 0u) return;

    unsigned char carry = 1u;
    for (size_t i = digits_size; i-- > 0u && carry != 0u;) {
        const unsigned char sum = (unsigned char)(digits[i] + carry);
        const bool overflowed_base10 = (sum >= 10u);
        digits[i] = overflowed_base10 ? 0u : sum;
        carry = overflowed_base10 ? 1u : 0u;
    }
}

C99_LEETCODE_PUBLIC_DEF unsigned char c99lc_digits_sum(const unsigned char* digits,
    size_t digits_size) {
    if (!digits || digits_size == 0u) return 0u;

    unsigned int total = 0u;
    for (size_t i = 0; i < digits_size; ++i)
        total += digits[i];
    return (unsigned char)total;
}

/* ---- c99lc_digits_pos_buffer implementation -------------------------------- */
C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_digits_positive_int_init(
    c99lc_digits_positive_int_buffer* buf, unsigned char* digits_mem, size_t capacity) {
    if (!buf || !digits_mem || capacity == 0u) return C99LC_RESULT_FAILED;
    buf->size = 1u;
    buf->capacity = capacity;
    buf->digits = digits_mem;
    buf->digits[0] = 0u;
    return C99LC_RESULT_SUCCESS;
}

C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_digits_positive_int_from_int(
    c99lc_digits_positive_int_buffer* buf, int k) {
    if (!buf || !buf->digits || buf->capacity == 0u || k < 0) return C99LC_RESULT_FAILED;
    if (k == 0) {
        buf->size = 1u;
        buf->digits[0] = 0u;
        return C99LC_RESULT_SUCCESS;
    }
    size_t needed = 0u;
    int tmp = k;
    while (tmp > 0) {
        ++needed;
        tmp /= 10;
    }
    if (needed > buf->capacity) return C99LC_RESULT_FAILED;
    buf->size = 0u;
    while (k > 0) {
        buf->digits[buf->size++] = (unsigned char)(k % 10);
        k /= 10;
    }
    return C99LC_RESULT_SUCCESS;
}

C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_digits_positive_int_from_big_endian_array(
    c99lc_digits_positive_int_buffer* buf, const int* src, size_t n) {
    if (!buf || !buf->digits || !src || n == 0u || n > buf->capacity) return C99LC_RESULT_FAILED;
    /* src[0] is most significant; we store LSB-first */
    buf->size = 0u;
    for (size_t i = 0; i < n; ++i) {
        const int value = src[n - 1u - i];
        if (value < 0 || value > 9) return C99LC_RESULT_FAILED;
        buf->digits[buf->size++] = (unsigned char)value;
    }
    if (buf->size == 0u) { /* ensure at least one digit */
        buf->digits[0] = 0u;
        buf->size = 1u;
    }
    return C99LC_RESULT_SUCCESS;
}

C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_digits_positive_int_add(
    const c99lc_digits_positive_int_buffer* a,
    const c99lc_digits_positive_int_buffer* b,
    c99lc_digits_positive_int_buffer* out) {
    if (!a || !b || !out) return C99LC_RESULT_FAILED;
    if (!a->digits || !b->digits || !out->digits) return C99LC_RESULT_FAILED;
    const size_t max_input = (a->size > b->size) ? a->size : b->size;
    const size_t required = max_input + 1u;
    if (out->capacity < required) return C99LC_RESULT_FAILED;
    size_t w = 0u;
    int carry = 0;
    for (size_t i = 0; i < max_input; ++i) {
        const int da = (i < a->size) ? (int)a->digits[i] : 0;
        const int db = (i < b->size) ? (int)b->digits[i] : 0;
        int s = da + db + carry;
        out->digits[w++] = (unsigned char)(s % 10);
        carry = s / 10;
    }
    if (carry) out->digits[w++] = (unsigned char)carry;
    out->size = w;
    return C99LC_RESULT_SUCCESS;
}

C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_digits_positive_int_to_big_endian_int_array(
    const c99lc_digits_positive_int_buffer* buf, int* dst, size_t dst_cap, size_t* out_size) {
    if (!buf || !dst || !out_size || !buf->digits) return C99LC_RESULT_FAILED;
    if (buf->size > dst_cap) return C99LC_RESULT_FAILED;
    for (size_t i = 0; i < buf->size; ++i) {
        dst[i] = (int)buf->digits[buf->size - 1u - i];
    }
    *out_size = buf->size;
    return C99LC_RESULT_SUCCESS;
}

C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_digits_add_lsb_first(const unsigned char* a,
    size_t a_size,
    const unsigned char* b,
    size_t b_size,
    unsigned char* out,
    size_t out_cap,
    size_t* out_size) {
    const bool pointers_ok = ((a_size == 0u) || a) && ((b_size == 0u) || b) && out && out_size;
    if (!pointers_ok) return C99LC_RESULT_FAILED;

    const size_t max_input = (a_size > b_size) ? a_size : b_size;
    const size_t required_cap = max_input + 1u; /* +1 for potential final carry */
    if (out_cap < required_cap) {
        /* Even if carry not produced we conservatively require cap for clarity */
        return C99LC_RESULT_FAILED;
    }

    size_t write_index = 0u;
    int carry = 0;
    for (size_t i = 0; i < max_input; ++i) {
        const int da = (i < a_size) ? (int)a[i] : 0;
        const int db = (i < b_size) ? (int)b[i] : 0;
        int s = da + db + carry;
        out[write_index++] = (unsigned char)(s % 10);
        carry = s / 10;
    }
    if (carry) out[write_index++] = (unsigned char)carry;
    *out_size = write_index;
    return C99LC_RESULT_SUCCESS;
}

#ifndef C99_LEETCODE_NO_STDIO
#include <stdio.h>
C99_LEETCODE_PUBLIC_DEF void c99lc_print_integer_array(const unsigned char* a, size_t n) {
    if (!a) {
        fputs("[]\n", stdout);
        return;
    }

    fputc('[', stdout);
    for (size_t index = 0; index < n; ++index) {
        fprintf(stdout, "%u", (unsigned)a[index]);
        const bool has_more = (index + 1u) < n;
        if (has_more) fputs(", ", stdout);
    }
    fputs("]\n", stdout);
}
#endif

/* ---- String utilities implementation ------------------------------------ */

C99_LEETCODE_PUBLIC_DEF size_t c99lc_string_to_camel_case(
    const char* source, char* buffer, size_t buffer_capacity) {
    if (!source || !buffer || buffer_capacity == 0u) return 0u;

    size_t buffer_size = 0u;
    const char* p = source;
    const char* prev_p = p;
    bool first_char = true;

    while (*p && buffer_size < buffer_capacity) {
        if (isalpha((unsigned char)*p)) {
            char ch = *p;

            bool should_capitalize = (*prev_p == ' ') && !first_char;

            if (should_capitalize) {
                ch = (char)toupper((unsigned char)ch);
            } else {
                ch = (char)tolower((unsigned char)ch);
            }
            buffer[buffer_size++] = ch;

            first_char = false;
        }

        prev_p = p;
        p++;
    }
    return buffer_size;
}

/* ---- Stack utilities implementation ------------------------------------ */

C99_LEETCODE_PUBLIC_DEF c99lc_stack_char_fla* c99lc_stack_char_fla_create(size_t capacity) {
    if (capacity == 0) return NULL;

    c99lc_stack_char_fla* stack = (c99lc_stack_char_fla*)C99_LEETCODE_MALLOC(NULL,
        sizeof(c99lc_stack_char_fla) + capacity * sizeof(char));

    if (stack) {
        stack->capacity = capacity;
        stack->count = 0;
    }
    return stack;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_stack_char_fla_destroy(c99lc_stack_char_fla* stack) {
    if (stack) { C99_LEETCODE_FREE(NULL, stack); }
}

C99_LEETCODE_PUBLIC_DEF size_t c99lc_stack_char_fla_count(const c99lc_stack_char_fla* stack) {
    return stack ? stack->count : 0;
}

C99_LEETCODE_PUBLIC_DEF bool c99lc_stack_char_fla_push(c99lc_stack_char_fla* stack, char c) {
    if (!stack || stack->count >= stack->capacity) return false;
    stack->items[stack->count++] = c;
    return true;
}

C99_LEETCODE_PUBLIC_DEF bool c99lc_stack_char_fla_pop(c99lc_stack_char_fla* stack, char* out) {
    if (!stack || stack->count == 0 || !out) return false;
    stack->count--;
    *out = stack->items[stack->count];
    return true;
}

/* ---- Bitset utilities implementation ----------------------------------- */

C99_LEETCODE_PUBLIC_DEF c99lc_bitset* c99lc_bitset_create(size_t bits_capacity) {
    if (bits_capacity == 0) return NULL;

    const size_t bits_in_byte = 8;
    const size_t bytes_capacity = (bits_capacity + bits_in_byte - 1) / bits_in_byte;

    c99lc_bitset* bitset = (c99lc_bitset*)C99_LEETCODE_MALLOC(NULL,
        sizeof(c99lc_bitset) + bytes_capacity * sizeof(uint8_t));

    if (bitset) {
        bitset->bytes_capacity = bytes_capacity;
        bitset->bits_capacity = bits_capacity;
        /* Initialize all bits to 0 */
        for (size_t i = 0; i < bytes_capacity; ++i) {
            bitset->items[i] = 0;
        }
    }
    return bitset;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_bitset_destroy(c99lc_bitset* bitset) {
    if (bitset) { C99_LEETCODE_FREE(NULL, bitset); }
}

C99_LEETCODE_PUBLIC_DEF bool c99lc_bitset_test(const c99lc_bitset* bitset, size_t bit_index) {
    const size_t byte_index = bit_index / 8;
    const size_t bit_position = bit_index % 8;
    return (bitset->items[byte_index] >> bit_position) & 1;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_bitset_set(c99lc_bitset* bitset, size_t bit_index) {
    const size_t byte_index = bit_index / 8;
    const size_t bit_position = bit_index % 8;
    bitset->items[byte_index] |= (uint8_t)(1 << bit_position);
}

C99_LEETCODE_PUBLIC_DEF void c99lc_bitset_clear(c99lc_bitset* bitset, size_t bit_index) {
    const size_t byte_index = bit_index / 8;
    const size_t bit_position = bit_index % 8;
    bitset->items[byte_index] &= (uint8_t)(~(1 << bit_position));
}

/* ---- Character classification helpers implementation ------------------- */

C99_LEETCODE_PUBLIC_DEF bool c99lc_char_is_open_paren(char ch) {
    return ch == '(' || ch == '{' || ch == '[';
}

C99_LEETCODE_PUBLIC_DEF bool c99lc_char_is_close_paren(char ch) {
    return ch == ')' || ch == '}' || ch == ']';
}

C99_LEETCODE_PUBLIC_DEF char c99lc_char_paren_reverse(char ch) {
    static const char c99lc__paren_pairs[][2] = {
        {'(', ')'},
        {'{', '}'},
        {'[', ']'},
    };

    const size_t lookup_count = sizeof(c99lc__paren_pairs) / sizeof(c99lc__paren_pairs[0]);
    for (size_t i = 0; i < lookup_count; i++) {
        if (c99lc__paren_pairs[i][0] == ch) { return c99lc__paren_pairs[i][1]; }
        if (c99lc__paren_pairs[i][1] == ch) { return c99lc__paren_pairs[i][0]; }
    }
    return '\0'; /* not recognized */
}

/* Arrays and utilities */
C99_LEETCODE_PUBLIC_DEF void c99lc_array_int_reverse_in_place(int* array, size_t array_size) {
    if (!array || array_size == 0u) return;

    int* left = array;
    int* right = array + array_size - 1u;

    while (left < right) {
        const int tmp = *left;
        *left = *right;
        *right = tmp;
        ++left;
        --right;
    }
}

C99_LEETCODE_PUBLIC_DEF void c99lc_util_swap_u32(uint32_t* a, uint32_t* b) {
    if (!a || !b) return;
    const uint32_t tmp = *a;
    *a = *b;
    *b = tmp;
}

C99_LEETCODE_PUBLIC_DEF unsigned char c99lc_array_u8_is_palindrome(const unsigned char* a,
    size_t n) {
    if (n <= 1u) return 1u;
    if (!a) return 0u;

    size_t i = 0u;
    size_t j = n - 1u;
    while (i < j) {
        if (a[i] != a[j]) return 0u;
        ++i;
        --j;
    }
    return 1u;
}

/* Interleave */
C99_LEETCODE_PUBLIC_DEF void c99lc_array_int_interleave_halves(int* dst, const int* src, size_t n) {
    if (!dst || !src || n == 0u) return;

    const int* xs = src; /* first half */
    const int* ys = src + n; /* second half */
    int* out = dst;

    for (size_t i = 0; i < n; ++i) {
        *out++ = xs[i];
        *out++ = ys[i];
    }
}

/* Array comparison, deduplication, and diff utilities */
C99_LEETCODE_PUBLIC_DEF int c99lc_array_int_compare(const void* a, const void* b) {
    const int* ia = (const int*)a;
    const int* ib = (const int*)b;
    /* Avoid overflow: use comparison idiom instead of subtraction */
    return (*ia > *ib) - (*ia < *ib);
}

C99_LEETCODE_PUBLIC_DEF size_t c99lc_array_int_dedup_sorted(int* array, size_t size) {
    if (!array || size == 0u) return 0u;
    if (size == 1u) return 1u;

    size_t write_index = 0u;
    for (size_t read_index = 1u; read_index < size; ++read_index) {
        if (array[read_index] != array[write_index]) {
            ++write_index;
            array[write_index] = array[read_index];
        }
    }
    return write_index + 1u;
}

C99_LEETCODE_PUBLIC_DEF size_t c99lc_array_int_diff(
    const int* source, size_t source_size, const int* sorted_lookup, size_t lookup_size, int* out) {
    if (!source || source_size == 0u || !sorted_lookup) return 0u;

    size_t out_count = 0u;
    for (size_t i = 0u; i < source_size; ++i) {
        const void* found =
            bsearch(&source[i], sorted_lookup, lookup_size, sizeof(int), c99lc_array_int_compare);
        if (!found) { out[out_count++] = source[i]; }
    }
    return out_count;
}

/* Parsing */
C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_integer_parse_uint32_from_string(
    const char* input, size_t input_size, uint32_t* out) {

    const bool inputs_valid = (input != NULL) && (out != NULL) && (input_size > 0u);
    if (!inputs_valid) return C99LC_RESULT_FAILED;

    uint32_t value = 0u;
    for (size_t i = 0; i < input_size; ++i) {
        const unsigned char ch = (unsigned char)input[i];
        const bool is_digit = (ch >= '0') && (ch <= '9');
        if (!is_digit) return C99LC_RESULT_FAILED;

        const uint32_t digit = (uint32_t)(ch - '0');
        value = value * 10u + digit;
    }

    *out = value;
    return C99LC_RESULT_SUCCESS;
}

/* Roman numerals */
C99_LEETCODE_PUBLIC_DEF int c99lc_roman_char_to_int(char ch) {
    switch (ch) {
        case 'I':
            return 1;
        case 'V':
            return 5;
        case 'X':
            return 10;
        case 'L':
            return 50;
        case 'C':
            return 100;
        case 'D':
            return 500;
        case 'M':
            return 1000;
        default:
            return 0;
    }
}

C99_LEETCODE_PUBLIC_DEF int c99lc_roman_to_int(const char* s) {
    if (!s) return 0;

    size_t length = 0u;
    while (s[length] != '\0')
        ++length;
    if (length == 0u) return 0;

    int running_total = 0;
    int prev_value = 0;

    for (size_t i = length; i > 0u;) {
        --i;
        const int current_value = c99lc_roman_char_to_int(s[i]);
        const bool is_subtractive = (current_value < prev_value);
        running_total += is_subtractive ? -current_value : current_value;
        prev_value = current_value;
    }
    return running_total;
}

/* Dynamic array */
C99_LEETCODE_PUBLIC_DEF c99lc_leaf_values* c99lc_leaf_values_create(size_t initial_capacity) {
    c99lc_leaf_values* lv =
        (c99lc_leaf_values*)C99_LEETCODE_MALLOC(NULL, sizeof(c99lc_leaf_values));
    if (!lv) return NULL;

    lv->size = 0u;
    lv->capacity = initial_capacity ? initial_capacity : 1u;
    lv->items = (int*)C99_LEETCODE_MALLOC(NULL, lv->capacity * sizeof *lv->items);

    if (!lv->items) {
        C99_LEETCODE_FREE(NULL, lv);
        return NULL;
    }
    return lv;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_leaf_values_push(c99lc_leaf_values* lv, int item) {
    if (!lv) return;

    const bool needs_growth = (lv->size == lv->capacity);
    if (needs_growth) {
        const size_t new_capacity = lv->capacity ? (lv->capacity * 2u) : 1u;
        int* grown = (int*)C99_LEETCODE_REALLOC(NULL, lv->items, new_capacity * sizeof *lv->items);
        if (!grown) return; /* drop push if realloc fails */
        lv->items = grown;
        lv->capacity = new_capacity;
    }

    lv->items[lv->size++] = item;
}

C99_LEETCODE_PUBLIC_DEF void c99lc_leaf_values_destroy(c99lc_leaf_values* lv) {
    if (!lv) return;
    C99_LEETCODE_FREE(NULL, lv->items);
    C99_LEETCODE_FREE(NULL, lv);
}

/* Date helpers */
C99_LEETCODE_PUBLIC_DEF bool c99lc_date_is_leap_year(uint32_t year) {
    const bool divisible_by_4 = (year % 4u) == 0u;
    const bool divisible_by_100 = (year % 100u) == 0u;
    const bool divisible_by_400 = (year % 400u) == 0u;

    return (divisible_by_4 && !divisible_by_100) || divisible_by_400;
}

C99_LEETCODE_PUBLIC_DEF uint32_t c99lc_date_days_in_month(uint32_t year, uint32_t month) {
    static const unsigned char days_in_month_lookup[12] =
        {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    const bool month_out_of_range = (month < 1u) || (month > 12u);
    if (month_out_of_range) return 0u;

    const bool is_february_leap = (month == 2u) && c99lc_date_is_leap_year(year);
    return (uint32_t)days_in_month_lookup[month - 1u] + (uint32_t)(is_february_leap ? 1u : 0u);
}

C99_LEETCODE_PUBLIC_DEF uint32_t c99lc_date_days_since_1971(const c99lc_reasonable_date* d) {
    if (!d) return 0u;

    uint32_t days_total = 0u;

    for (uint32_t year = 1971u; year < d->year; ++year)
        days_total += c99lc_date_is_leap_year(year) ? 366u : 365u;

    for (uint32_t month = 1u; month < d->month; ++month)
        days_total += c99lc_date_days_in_month(d->year, month);

    days_total += (d->day - 1u);
    return days_total;
}

C99_LEETCODE_PUBLIC_DEF c99lc_result c99lc_reasonable_date_parse_from_string(
    const char* date_string, c99lc_reasonable_date* out) {
    if (!date_string || !out) return C99LC_RESULT_FAILED;

    size_t len = 0u;
    while (date_string[len] != '\0')
        ++len;

    const bool length_is_iso10 = (len == 10u);
    if (!length_is_iso10) return C99LC_RESULT_FAILED;

    const bool has_separators = (date_string[4] == '-') && (date_string[7] == '-');
    if (!has_separators) return C99LC_RESULT_FAILED;

    if (c99lc_integer_parse_uint32_from_string(date_string, 4, &out->year) != C99LC_RESULT_SUCCESS)
        return C99LC_RESULT_FAILED;
    if (c99lc_integer_parse_uint32_from_string(date_string + 5u, 2, &out->month) !=
        C99LC_RESULT_SUCCESS)
        return C99LC_RESULT_FAILED;
    if (c99lc_integer_parse_uint32_from_string(date_string + 8u, 2, &out->day) !=
        C99LC_RESULT_SUCCESS)
        return C99LC_RESULT_FAILED;

    const bool month_valid = (out->month >= 1u) && (out->month <= 12u);
    if (!month_valid) return C99LC_RESULT_FAILED;

    const uint32_t dim = c99lc_date_days_in_month(out->year, out->month);
    const bool day_valid = (dim != 0u) && (out->day >= 1u) && (out->day <= dim);
    if (!day_valid) return C99LC_RESULT_FAILED;

    return C99LC_RESULT_SUCCESS;
}

#endif /* C99_LEETCODE_IMPLEMENTATION */

/*
------------------------------------------------------------------------------
This software is available under 2 licenses -- choose whichever you prefer.
------------------------------------------------------------------------------
ALTERNATIVE A - MIT License
Copyright (c) 2025 Dmytro Zharii
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
------------------------------------------------------------------------------
ALTERNATIVE B - Public Domain (www.unlicense.org)
This is free and unencumbered software released into the public domain.
Anyone is free to copy, modify, publish, use, compile, sell, or distribute this
software, either in source code form or as a compiled binary, for any purpose,
commercial or non-commercial, and by any means.
In jurisdictions that recognize copyright laws, the author or authors of this
software dedicate any and all copyright interest in the software to the public
domain. We make this dedication for the benefit of the public at large and to
the detriment of our heirs and successors. We intend this dedication for an
overt act of relinquishment in perpetuity of all present and future rights to
this software under copyright law.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
------------------------------------------------------------------------------
*/
