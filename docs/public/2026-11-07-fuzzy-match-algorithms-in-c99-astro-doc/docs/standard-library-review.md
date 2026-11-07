# Standard-library changes and banned-function enforcement

## Replacements after reviewing every C source file

| Area | Previous code | Current code and reason |
|---|---|---|
| Parser whitespace | Local ASCII-space helper | `isspace((unsigned char)byte)` in the initial C locale |
| Normalization and token boundaries | Local upper/lower/digit tests and manual case arithmetic | `isalnum`, `isupper`, `islower`, `isdigit`, `tolower`; reject bytes above 127 before normalization |
| Weighted costs and integer validation | Repeated digit-range tests | `isdigit` with unsigned-char arguments |
| Dataset formatting | Addition/subtraction of 32 | `toupper` and `tolower` |
| Gram sorting | Insertion sort | Standard `qsort` with an overflow-safe comparator |
| Report ranking | Nested swap sort | `qsort` over records containing their comparison keys |
| Edit-cost minimum | Local three-way minimum helper | C99 `fmin` |
| String copies | 25 `strcpy` calls | `memcpy` including the terminator after destination/source bounds are established |
| UTC conversion | One `gmtime` call | POSIX `gmtime_r` with caller-owned storage; timestamp unavailable on a C99-only platform without a permitted converter |

Character classification follows the C locale present at program startup. The executable never calls `setlocale`. Embedding callers must retain the C locale for the documented ASCII behavior. All character-classifier arguments are unsigned-char values. The unit suite checks bytes 1 through 255 against literal ASCII expectations.

## Functions deliberately retained

The parser's bounded length scan remains because C99 has no `strnlen`; replacing it with `strlen` would remove the early oversize bound. Mutation shifts use standard `memmove` because source and destination overlap. Manifest loading uses `strchr` and `strcspn`; `strtok` loses empty fields and is banned. Integer conversion already uses `strtol`/`strtoul` with range and end checks. The fixed xorshift generator remains because C99 does not specify a reproducible `rand` sequence across implementations.

The matching recurrences, top-two candidate scan, calibration search and CSV quote escaping implement application behavior absent from the C99 library. C has no standard JSON, CSV or fuzzy-matching parser. No replacement package is required for these operations.

## Unmodified Git header and inclusion order

`src/banned.h` is downloaded verbatim from Git. `src/pm.h` includes it at the end; all project C translation units include that shared header after system headers. This lets system declarations compile normally, then turns forbidden calls in project code into compiler errors. No ban is undefined or bypassed. Provenance, its SHA-256 and Git's license are in `licenses/`.

## Recorded failure before fixing calls

The first build with the header exited with status 2. It diagnosed `sorry_strcpy_is_a_banned_function` and `sorry_gmtime_is_a_banned_function`. `reports/banned-initial-build.log` retains the actual compiler output. `reports/banned-call-review.csv` records the original 26 call sites and replacements.

`make banned-check` compiles fifteen small negative probes and requires each banned-function diagnostic. It rejects an unrelated compilation failure as insufficient evidence. `make test` runs these probes after the ordinary assertion suite.

## Allocation and portability consequences

The C source explicitly allocates no heap objects inside a scorer. Standard `qsort` may use internal workspace or allocations; C99 does not specify its algorithm or allocation policy. Reported gram-array bounds exclude that library storage. All runtime measurements were repeated after these changes.

POSIX timing and UTC conversion are isolated. The C99 timer fallback remains `clock`; the UTC timestamp is reported unavailable if no permitted conversion is available. This avoids reimplementing calendar conversion or bypassing the banned header.

[C99 committee draft N1256](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf) specifies character handling in 7.4, sorting in 7.20.5, copying in 7.21.2 and time conversion in 7.23.
