2026-02-02

A00 v00 Title and intent
Create or update a single page offline C99 library reference by ensuring the embedded XML inside `index.html` contains complete coverage of all C99 standard library headers, macros, types, and function signatures listed in `suggestion005`. The work product is a modified `index.html` whose XML data blocks are comprehensive, internally consistent, and renderable by the existing vanilla JS renderer without changes to renderer code.

A01 v00 Inputs and allowed files
Only two files may be read to make decisions: `index.html` and `suggestion005`. No other files, web searches, external references, or additional standards documents may be used. The agent must treat `suggestion005` as the sole source of truth for what must exist, and must treat `index.html` as the sole target to modify.

A02 v00 Scope of completeness
The final `index.html` must include, in its embedded XML, definitions for every C99 header and every macro, type, and function signature specified by `suggestion005`. This includes families of overload-like variants (for example, float and long double variants, and complex variants) when they are separately named in `suggestion005`. If `suggestion005` lists multiple prototypes for a logical family, each separately named symbol must exist as its own function entry in the XML.

A03 v00 Non goals
Do not change HTML layout, CSS, or JavaScript behavior unless strictly required to keep the page functioning after XML changes. Do not refactor existing content for style unless the refactor is required to fix structural inconsistency introduced by your additions. Do not remove existing entries unless they are duplicates of the same symbol and you can preserve one canonical entry.

A04 v00 What to edit in index.html
All edits must be confined to the embedded XML blocks under the hidden `<section id="data">` area, inside `<script type="application/xml">...</script>` elements. Do not add new external dependencies. Do not add new script tags of other types. Do not introduce any `</script>` sequence inside the XML payload.

A05 v00 Data model expectations
The existing XML uses a structure similar to the provided example: `document`, `category`, `header`, and within headers, `function` entries with `signature`, `summary`, `parameters`, `returns`, `examples`, plus optional keywords and formatting policy blocks. New entries must follow the same schema patterns already present in `index.html`. If you encounter multiple schema patterns within `index.html`, prefer the most common pattern used for functions in that same header, and keep your additions consistent within that header.

A06 v00 Matching and diff rules
A symbol in `suggestion005` is considered present in `index.html` only if a function or macro entry exists whose `name` matches exactly (case sensitive) and whose header association is correct for C99. A symbol with the right name but placed under the wrong header must be corrected by moving it to the correct header. A symbol that exists but has an incomplete set of prototypes compared to `suggestion005` must be updated to include the missing prototypes in a way consistent with how similar multi-prototype entries are represented elsewhere in `index.html` (either as multiple `signature` lines within one entry if that is how the file does it, or as separate entries if the file uses one signature per entry).

A07 v00 Placement rules for new content
New content must be inserted into the most appropriate existing location in the XML hierarchy.

If the header already exists in `index.html`, add missing symbols under that header. If the header does not exist, create a new `header` node under the best matching existing `category`, or create a new `category` if no existing category fits. Category naming should follow the style already used (descriptive, title case, and aligned to standard library groupings). Keep alphabetical ordering if the surrounding section is alphabetically ordered; otherwise keep the local ordering convention of that header.

A08 v00 ID and naming conventions
Every new XML node that requires an `id` must receive a unique `id` that does not collide with existing IDs in `index.html`.

Follow the established naming style in the file. For example, functions appear to use IDs like `fn.isalnum` with `name="isalnum"`, and parameters use IDs like `p.isalnum.c`. Continue this pattern for new functions and parameters. If an existing header uses a different convention, match that header’s convention.

A09 v00 Content requirements for each new symbol
For every new function or macro introduced, you must include at minimum:

A human readable signature block exactly matching what `suggestion005` provides for that symbol.
A short summary explaining what it does in one paragraph.
Parameter documentation that includes domain constraints and any C99 specific safety requirements (for example, integer domain rules, null pointer rules, locale dependence).
Return value documentation.
At least one example in C99 that is copy ready, compiles in principle, and demonstrates safe usage. The example should be minimal but must be meaningful and should include required headers.

If `suggestion005` includes notes about undefined behavior domains, required casts, or special constants, those must appear in constraints notes.

A10 v00 Macro and type entries
If `suggestion005` includes macro definitions and types, represent them using the nearest existing pattern in `index.html`. If the XML schema includes a dedicated node type for macros or types, use it. If the schema only represents functions, then introduce an explicit representation consistent with current practice in the file (for example, `macro` nodes if present, or `definition` nodes if present). Do not invent a brand new representation unless there is no other workable choice; if you must invent one, it must be minimal, self describing, and must not break rendering (for example, by using existing generic nodes already rendered as text blocks).

A11 v00 Example driven guidance using complex.h family
`suggestion005` may include sequences like the following and they must be represented completely:

double complex cacos(double complex z);
float complex cacosf(float complex z);
long double complex cacosl(long double complex z);
double complex casin(double complex z);
float complex casinf(float complex z);
long double complex casinl(long double complex z);
double complex catan(double complex z);
float complex catanf(float complex z);
long double complex catanl(long double complex z);
double complex ccos(double complex z);
float complex ccosf(float complex z);
long double complex ccosl(long double complex z);
double complex csin(double complex z);
float complex csinf(float complex z);
long double complex csinl(long double complex z);
double complex ctan(double complex z);
float complex ctanf(float complex z);
long double complex ctanl(long double complex z);

If `complex.h` exists, each of these must appear under it with correct signatures and consistent documentation patterns. If `complex.h` does not exist, you must add it under an appropriate category (for example, complex mathematics). Provide at least one example per logical family, but ensure each distinct symbol still has its own entry with at least summary, parameters, returns, and at least one example somewhere in that family. If the local convention in the file is one example per function, follow it.

A12 v00 Quality and safety rules for added text
Added text must remain within the allowed inline HTML policy already declared in the XML. Do not add unsupported tags. Prefer plain paragraphs and inline code. Use ASCII punctuation. Do not add excessively long prose; focus on deterministic rules, constraints, and safe usage.

A13 v00 Renderer compatibility constraints
Do not introduce XML constructs that the existing renderer is unlikely to handle. Before finalizing, ensure the XML remains well formed and that every opened tag is closed. Ensure that the XML inside the `<script type="application/xml">` remains valid XML and does not contain the literal sequence `</script>` anywhere.

A14 v00 Validation steps the agent must perform
Parse `index.html` and extract every embedded XML block under `<section id="data">`. Build a symbol index of all headers and all symbols currently defined, including function names and macro names and their signatures.

Parse `suggestion005` and extract the canonical list of required headers and symbols with their signatures.

Compute the set difference and classify each missing item as one of the following: missing header, missing symbol under existing header, wrong placement (symbol under wrong header), incomplete signature set, or duplicate conflicting definitions.

Apply edits to `index.html` XML to resolve every classification until the diff is empty.

After edits, re parse the modified XML and re run the diff to confirm zero missing items relative to `suggestion005`.

A15 v00 Output requirements
The agent must produce the updated `index.html` with all necessary XML modifications applied. The agent must also produce a concise change log describing what was added or moved. The change log must be deterministic and must include enough detail to review correctness, including header name and symbol name for each addition or move, and whether it was a new header, new symbol, moved symbol, or signature completion.

A16 v00 Acceptance criteria
All symbols listed in `suggestion005` exist in the embedded XML of `index.html` under the correct C99 header grouping.
No duplicate symbol definitions remain that would confuse lookup or navigation.
The embedded XML remains well formed and contains no `</script>` sequence.
The existing page can still render the table of contents and content sections without requiring changes to the JavaScript renderer.
Each newly added symbol has at least signature, summary, parameter constraints, returns, and at least one safe, copy ready C99 example (with the per family allowance described earlier only if consistent with local conventions).

A17 v00 Failure handling
If `suggestion005` contains an item that cannot be represented using the existing XML schema without risking renderer breakage, the agent must still include the item by using the most conservative representation that the renderer already displays as plain text content, while preserving header grouping and searchability. The agent must record this in the change log with the reason and the chosen representation.

A18 v00 Deliverables checklist
Updated `index.html` with embedded XML modified to satisfy `suggestion005`.
A change log file or section (plain text) summarizing all modifications.

---


B.1 Diagnostics <assert.h>
NDEBUG

void assert(scalar expression);

B.2 Complex <complex.h>
complex               imaginary               I
_Complex_I            _Imaginary_I

#pragma STDC CX_LIMITED_RANGE on-off-switch

double complex cacos(double complex z);
float complex cacosf(float complex z);
long double complex cacosl(long double complex z);
double complex casin(double complex z);
float complex casinf(float complex z);
long double complex casinl(long double complex z);
double complex catan(double complex z);
float complex catanf(float complex z);
long double complex catanl(long double complex z);
double complex ccos(double complex z);
float complex ccosf(float complex z);
long double complex ccosl(long double complex z);
double complex csin(double complex z);
float complex csinf(float complex z);
long double complex csinl(long double complex z);
double complex ctan(double complex z);
float complex ctanf(float complex z);
long double complex ctanl(long double complex z);
double complex cacosh(double complex z);
float complex cacoshf(float complex z);
long double complex cacoshl(long double complex z);
double complex casinh(double complex z);
float complex casinhf(float complex z);
long double complex casinhl(long double complex z);
double complex catanh(double complex z);
float complex catanhf(float complex z);
long double complex catanhl(long double complex z);
double complex ccosh(double complex z);
float complex ccoshf(float complex z);
long double complex ccoshl(long double complex z);
double complex csinh(double complex z);
float complex csinhf(float complex z);
long double complex csinhl(long double complex z);
double complex ctanh(double complex z);
float complex ctanhf(float complex z);
long double complex ctanhl(long double complex z);
double complex cexp(double complex z);
float complex cexpf(float complex z);
long double complex cexpl(long double complex z);
double complex clog(double complex z);
float complex clogf(float complex z);
long double complex clogl(long double complex z);
double cabs(double complex z);
float cabsf(float complex z);
long double cabsl(long double complex z);
double complex cpow(double complex x, double complex y);
float complex cpowf(float complex x, float complex y);
long double complex cpowl(long double complex x, long double complex y);
double complex csqrt(double complex z);
float complex csqrtf(float complex z);
long double complex csqrtl(long double complex z);
double carg(double complex z);
float cargf(float complex z);
long double cargl(long double complex z);
double cimag(double complex z);
float cimagf(float complex z);
long double cimagl(long double complex z);
double complex conj(double complex z);
float complex conjf(float complex z);
long double complex conjl(long double complex z);
double complex cproj(double complex z);
float complex cprojf(float complex z);
long double complex cprojl(long double complex z);
double creal(double complex z);
float crealf(float complex z);
long double creall(long double complex z);

B.3 Character handling <ctype.h>
int isalnum(int c);
int isalpha(int c);
int isblank(int c);
int iscntrl(int c);
int isdigit(int c);
int isgraph(int c);
int islower(int c);
int isprint(int c);
int ispunct(int c);
int isspace(int c);
int isupper(int c);
int isxdigit(int c);
int tolower(int c);
int toupper(int c);

B.5 Floating-point environment <fenv.h>
fenv_t                 FE_OVERFLOW             FE_TOWARDZERO
fexcept_t              FE_UNDERFLOW            FE_UPWARD
FE_DIVBYZERO           FE_ALL_EXCEPT           FE_DFL_ENV
FE_INEXACT             FE_DOWNWARD
FE_INVALID             FE_TONEAREST

#pragma STDC FENV_ACCESS on-off-switch

int feclearexcept(int excepts);
int fegetexceptflag(fexcept_t *flagp, int excepts);
int feraiseexcept(int excepts);
int fesetexceptflag(const fexcept_t *flagp, int excepts);
int fetestexcept(int excepts);
int fegetround(void);
int fesetround(int round);
int fegetenv(fenv_t *envp);
int feholdexcept(fenv_t *envp);
int fesetenv(const fenv_t *envp);
int feupdateenv(const fenv_t *envp);


B.6 Characteristics of floating types <float.h>
FLT_ROUNDS              DBL_MIN_EXP             FLT_MAX
FLT_EVAL_METHOD         LDBL_MIN_EXP            DBL_MAX
FLT_RADIX               FLT_MIN_10_EXP          LDBL_MAX
FLT_MANT_DIG            DBL_MIN_10_EXP          FLT_EPSILON
DBL_MANT_DIG            LDBL_MIN_10_EXP         DBL_EPSILON
LDBL_MANT_DIG           FLT_MAX_EXP             LDBL_EPSILON
DECIMAL_DIG             DBL_MAX_EXP             FLT_MIN
FLT_DIG                 LDBL_MAX_EXP            DBL_MIN
DBL_DIG                 FLT_MAX_10_EXP          LDBL_MIN
LDBL_DIG                DBL_MAX_10_EXP
FLT_MIN_EXP             LDBL_MAX_10_EXP



B.7 Format conversion of integer types <inttypes.h>
imaxdiv_t
PRIdN        PRIdLEASTN        PRIdFASTN        PRIdMAX     PRIdPTR
PRIiN        PRIiLEASTN        PRIiFASTN        PRIiMAX     PRIiPTR
PRIoN        PRIoLEASTN        PRIoFASTN        PRIoMAX     PRIoPTR
PRIuN        PRIuLEASTN        PRIuFASTN        PRIuMAX     PRIuPTR
PRIxN        PRIxLEASTN        PRIxFASTN        PRIxMAX     PRIxPTR
PRIXN        PRIXLEASTN        PRIXFASTN        PRIXMAX     PRIXPTR
SCNdN        SCNdLEASTN        SCNdFASTN        SCNdMAX     SCNdPTR
SCNiN        SCNiLEASTN        SCNiFASTN        SCNiMAX     SCNiPTR
SCNoN        SCNoLEASTN        SCNoFASTN        SCNoMAX     SCNoPTR
SCNuN        SCNuLEASTN        SCNuFASTN        SCNuMAX     SCNuPTR
SCNxN        SCNxLEASTN        SCNxFASTN        SCNxMAX     SCNxPTR

intmax_t imaxabs(intmax_t j);
imaxdiv_t imaxdiv(intmax_t numer, intmax_t denom);
intmax_t strtoimax(const char *restrict nptr, char **restrict endptr, int base);
uintmax_t strtoumax(const char *restrict nptr, char **restrict endptr,
                    int base);
intmax_t wcstoimax(const wchar_t *restrict nptr, wchar_t **restrict endptr,
                  int base);
uintmax_t wcstoumax(const wchar_t *restrict nptr, wchar_t **restrict endptr,
                    int base);

B.9 Sizes of integer types <limits.h>
CHAR_BIT        CHAR_MAX          INT_MIN           ULONG_MAX
SCHAR_MIN       MB_LEN_MAX        INT_MAX           LLONG_MIN
SCHAR_MAX       SHRT_MIN          UINT_MAX          LLONG_MAX
UCHAR_MAX       SHRT_MAX          LONG_MIN          ULLONG_MAX
CHAR_MIN        USHRT_MAX         LONG_MAX

B.10 Localization <locale.h>
struct lconv    LC_ALL            LC_CTYPE          LC_NUMERIC
NULL            LC_COLLATE        LC_MONETARY       LC_TIME

char *setlocale(int category, const char *locale);
struct lconv *localeconv(void);


B.11 Mathematics <math.h>
float_t               FP_INFINITE             FP_FAST_FMAL
double_t              FP_NAN                  FP_ILOGB0
HUGE_VAL              FP_NORMAL               FP_ILOGBNAN
HUGE_VALF             FP_SUBNORMAL            MATH_ERRNO
HUGE_VALL             FP_ZERO                 MATH_ERREXCEPT
INFINITY              FP_FAST_FMA             math_errhandling
NAN                   FP_FAST_FMAF

#pragma STDC FP_CONTRACT on-off-switch

int fpclassify(real - floating x);
int isfinite(real - floating x);
int isinf(real - floating x);
int isnan(real - floating x);
int isnormal(real - floating x);
int signbit(real - floating x);
double acos(double x);
float acosf(float x);
long double acosl(long double x);
double asin(double x);
float asinf(float x);
long double asinl(long double x);
double atan(double x);
float atanf(float x);
long double atanl(long double x);
double atan2(double y, double x);
float atan2f(float y, float x);
long double atan2l(long double y, long double x);
double cos(double x);
float cosf(float x);
long double cosl(long double x);
double sin(double x);
float sinf(float x);
long double sinl(long double x);
double tan(double x);
float tanf(float x);
long double tanl(long double x);
double acosh(double x);
float acoshf(float x);
long double acoshl(long double x);
double asinh(double x);
float asinhf(float x);
long double asinhl(long double x);
double atanh(double x);
float atanhf(float x);
long double atanhl(long double x);
double cosh(double x);
float coshf(float x);
long double coshl(long double x);
double sinh(double x);
float sinhf(float x);
long double sinhl(long double x);
double tanh(double x);
float tanhf(float x);
long double tanhl(long double x);
double exp(double x);
float expf(float x);
long double expl(long double x);
double exp2(double x);
float exp2f(float x);
long double exp2l(long double x);
double expm1(double x);
float expm1f(float x);
long double expm1l(long double x);
double frexp(double value, int *exp);
float frexpf(float value, int *exp);
long double frexpl(long double value, int *exp);
int ilogb(double x);
int ilogbf(float x);
int ilogbl(long double x);
double ldexp(double x, int exp);
float ldexpf(float x, int exp);
long double ldexpl(long double x, int exp);
double log(double x);
float logf(float x);
long double logl(long double x);
double log10(double x);
float log10f(float x);
long double log10l(long double x);
double log1p(double x);
float log1pf(float x);
long double log1pl(long double x);
double log2(double x);
float log2f(float x);
long double log2l(long double x);
double logb(double x);
float logbf(float x);
long double logbl(long double x);
double modf(double value, double *iptr);
float modff(float value, float *iptr);
long double modfl(long double value, long double *iptr);
double scalbn(double x, int n);
float scalbnf(float x, int n);
long double scalbnl(long double x, int n);
double scalbln(double x, long int n);
float scalblnf(float x, long int n);
long double scalblnl(long double x, long int n);
double cbrt(double x);
float cbrtf(float x);
long double cbrtl(long double x);
double fabs(double x);
float fabsf(float x);
long double fabsl(long double x);
double hypot(double x, double y);
float hypotf(float x, float y);
long double hypotl(long double x, long double y);
double pow(double x, double y);
float powf(float x, float y);
long double powl(long double x, long double y);
double sqrt(double x);
float sqrtf(float x);
long double sqrtl(long double x);
double erf(double x);
float erff(float x);
long double erfl(long double x);
double erfc(double x);
float erfcf(float x);
long double erfcl(long double x);
double lgamma(double x);
float lgammaf(float x);
long double lgammal(long double x);
double tgamma(double x);
float tgammaf(float x);
long double tgammal(long double x);
double ceil(double x);
float ceilf(float x);
long double ceill(long double x);
double floor(double x);
float floorf(float x);
long double floorl(long double x);
double nearbyint(double x);
float nearbyintf(float x);
long double nearbyintl(long double x);
double rint(double x);
float rintf(float x);
long double rintl(long double x);
long int lrint(double x);
long int lrintf(float x);
long int lrintl(long double x);
long long int llrint(double x);
long long int llrintf(float x);
long long int llrintl(long double x);
double round(double x);
float roundf(float x);
long double roundl(long double x);
long int lround(double x);
long int lroundf(float x);
long int lroundl(long double x);
long long int llround(double x);
long long int llroundf(float x);
long long int llroundl(long double x);
double trunc(double x);
float truncf(float x);
long double truncl(long double x);
double fmod(double x, double y);
float fmodf(float x, float y);
long double fmodl(long double x, long double y);
double remainder(double x, double y);
float remainderf(float x, float y);
long double remainderl(long double x, long double y);
double remquo(double x, double y, int *quo);
float remquof(float x, float y, int *quo);
long double remquol(long double x, long double y, int *quo);
double copysign(double x, double y);
float copysignf(float x, float y);
long double copysignl(long double x, long double y);
double nan(const char *tagp);
float nanf(const char *tagp);
long double nanl(const char *tagp);
double nextafter(double x, double y);
float nextafterf(float x, float y);
long double nextafterl(long double x, long double y);
double nexttoward(double x, long double y);
float nexttowardf(float x, long double y);
long double nexttowardl(long double x, long double y);
double fdim(double x, double y);
float fdimf(float x, float y);
long double fdiml(long double x, long double y);
double fmax(double x, double y);
float fmaxf(float x, float y);
long double fmaxl(long double x, long double y);
double fmin(double x, double y);
float fminf(float x, float y);
long double fminl(long double x, long double y);
double fma(double x, double y, double z);
float fmaf(float x, float y, float z);
long double fmal(long double x, long double y, long double z);
int isgreater(real - floating x, real - floating y);
int isgreaterequal(real - floating x, real - floating y);
int isless(real - floating x, real - floating y);
int islessequal(real - floating x, real - floating y);
int islessgreater(real - floating x, real - floating y);
int isunordered(real - floating x, real - floating y);

B.12 Nonlocal jumps <setjmp.h>
jmp_buf

int setjmp(jmp_buf env);
void longjmp(jmp_buf env, int val);

B.13 Signal handling <signal.h>
sig_atomic_t   SIG_IGN            SIGILL            SIGTERM
SIG_DFL        SIGABRT            SIGINT
SIG_ERR        SIGFPE             SIGSEGV
void (*signal(int sig, void (*func)(int)))(int);
int raise(int sig);


B.14 Variable arguments <stdarg.h>
va_list

type va_arg(va_list ap, type);
void va_copy(va_list dest, va_list src);
void va_end(va_list ap);
void va_start(va_list ap, parmN);

B.16 Common definitions <stddef.h>
ptrdiff_t       size_t            wchar_t           NULL

offsetof(type, member-designator)

B.17 Integer types <stdint.h>
intN_t                INT_LEASTN_MIN          PTRDIFF_MAX
uintN_t               INT_LEASTN_MAX          SIG_ATOMIC_MIN
int_leastN_t          UINT_LEASTN_MAX         SIG_ATOMIC_MAX
uint_leastN_t         INT_FASTN_MIN           SIZE_MAX
int_fastN_t           INT_FASTN_MAX           WCHAR_MIN
uint_fastN_t          UINT_FASTN_MAX          WCHAR_MAX
intptr_t              INTPTR_MIN              WINT_MIN
uintptr_t             INTPTR_MAX              WINT_MAX
intmax_t              UINTPTR_MAX             INTN_C(value)
uintmax_t             INTMAX_MIN              UINTN_C(value)
INTN_MIN              INTMAX_MAX              INTMAX_C(value)
INTN_MAX              UINTMAX_MAX             UINTMAX_C(value)
UINTN_MAX             PTRDIFF_MIN

B.18 Input/output <stdio.h>
size_t          _IOLBF            FILENAME_MAX      TMP_MAX
FILE            _IONBF            L_tmpnam          stderr
fpos_t          BUFSIZ            SEEK_CUR          stdin
NULL            EOF               SEEK_END          stdout
_IOFBF          FOPEN_MAX         SEEK_SET

int remove(const char *filename);
int rename(const char *old, const char *new);
FILE *tmpfile(void);
char *tmpnam(char *s);
int fclose(FILE *stream);
int fflush(FILE *stream);
FILE *fopen(const char *restrict filename, const char *restrict mode);
FILE *freopen(const char *restrict filename, const char *restrict mode,
              FILE *restrict stream);
void setbuf(FILE *restrict stream, char *restrict buf);
int setvbuf(FILE *restrict stream, char *restrict buf, int mode, size_t size);
int fprintf(FILE *restrict stream, const char *restrict format, ...);
int fscanf(FILE *restrict stream, const char *restrict format, ...);
int printf(const char *restrict format, ...);
int scanf(const char *restrict format, ...);
int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
int sprintf(char *restrict s, const char *restrict format, ...);
int sscanf(const char *restrict s, const char *restrict format, ...);
int vfprintf(FILE *restrict stream, const char *restrict format, va_list arg);
int vfscanf(FILE *restrict stream, const char *restrict format, va_list arg);
int vprintf(const char *restrict format, va_list arg);
int vscanf(const char *restrict format, va_list arg);
int vsnprintf(char *restrict s, size_t n, const char *restrict format,
              va_list arg);
int vsprintf(char *restrict s, const char *restrict format, va_list arg);
int vsscanf(const char *restrict s, const char *restrict format, va_list arg);
int fgetc(FILE *stream);
char *fgets(char *restrict s, int n, FILE *restrict stream);
int fputc(int c, FILE *stream);
int fputs(const char *restrict s, FILE *restrict stream);
int getc(FILE *stream);
int getchar(void);
char *gets(char *s);
int putc(int c, FILE *stream);
int putchar(int c);
int puts(const char *s);
int ungetc(int c, FILE *stream);
size_t fread(void *restrict ptr, size_t size, size_t nmemb,
            FILE *restrict stream);
size_t fwrite(const void *restrict ptr, size_t size, size_t nmemb,
              FILE *restrict stream);
int fgetpos(FILE *restrict stream, fpos_t *restrict pos);
int fseek(FILE *stream, long int offset, int whence);
int fsetpos(FILE *stream, const fpos_t *pos);
long int ftell(FILE *stream);
void rewind(FILE *stream);
void clearerr(FILE *stream);
int feof(FILE *stream);
int ferror(FILE *stream);
void perror(const char *s);

B.19 General utilities <stdlib.h>
size_t       ldiv_t             EXIT_FAILURE      MB_CUR_MAX
wchar_t      lldiv_t            EXIT_SUCCESS
div_t        NULL               RAND_MAX

double atof(const char *nptr);
int atoi(const char *nptr);
long int atol(const char *nptr);
long long int atoll(const char *nptr);
double strtod(const char *restrict nptr, char **restrict endptr);
float strtof(const char *restrict nptr, char **restrict endptr);
long double strtold(const char *restrict nptr, char **restrict endptr);
long int strtol(const char *restrict nptr, char **restrict endptr, int base);
long long int strtoll(const char *restrict nptr, char **restrict endptr,
                      int base);
unsigned long int strtoul(const char *restrict nptr, char **restrict endptr,
                          int base);
unsigned long long int strtoull(const char *restrict nptr,
                                char **restrict endptr, int base);
int rand(void);
void srand(unsigned int seed);
void *calloc(size_t nmemb, size_t size);
void free(void *ptr);
void *malloc(size_t size);
void *realloc(void *ptr, size_t size);
void abort(void);
int atexit(void (*func)(void));
void exit(int status);
void _Exit(int status);
char *getenv(const char *name);
int system(const char *string);
void *bsearch(const void *key, const void *base, size_t nmemb, size_t size,
              int (*compar)(const void *, const void *));
void qsort(void *base, size_t nmemb, size_t size,
          int (*compar)(const void *, const void *));
int abs(int j);
long int labs(long int j);
long long int llabs(long long int j);
div_t div(int numer, int denom);
ldiv_t ldiv(long int numer, long int denom);
lldiv_t lldiv(long long int numer, long long int denom);
int mblen(const char *s, size_t n);
int mbtowc(wchar_t *restrict pwc, const char *restrict s, size_t n);
int wctomb(char *s, wchar_t wchar);
size_t mbstowcs(wchar_t *restrict pwcs, const char *restrict s, size_t n);
size_t wcstombs(char *restrict s, const wchar_t *restrict pwcs, size_t n);

B.20 String handling <string.h>
size_t
NULL

void *memcpy(void *restrict s1, const void *restrict s2, size_t n);
void *memmove(void *s1, const void *s2, size_t n);
char *strcpy(char *restrict s1, const char *restrict s2);
char *strncpy(char *restrict s1, const char *restrict s2, size_t n);
char *strcat(char *restrict s1, const char *restrict s2);
char *strncat(char *restrict s1, const char *restrict s2, size_t n);
int memcmp(const void *s1, const void *s2, size_t n);
int strcmp(const char *s1, const char *s2);
int strcoll(const char *s1, const char *s2);
int strncmp(const char *s1, const char *s2, size_t n);
size_t strxfrm(char *restrict s1, const char *restrict s2, size_t n);
void *memchr(const void *s, int c, size_t n);
char *strchr(const char *s, int c);
size_t strcspn(const char *s1, const char *s2);
char *strpbrk(const char *s1, const char *s2);
char *strrchr(const char *s, int c);
size_t strspn(const char *s1, const char *s2);
char *strstr(const char *s1, const char *s2);
char *strtok(char *restrict s1, const char *restrict s2);
void *memset(void *s, int c, size_t n);
char *strerror(int errnum);
size_t strlen(const char *s);


B.21 Type-generic math <tgmath.h>
acos           sqrt               fmod              nextafter
asin           fabs               frexp             nexttoward
atan           atan2              hypot             remainder
acosh          cbrt               ilogb             remquo
asinh          ceil               ldexp             rint
atanh          copysign           lgamma            round
cos            erf                llrint            scalbn
sin            erfc               llround           scalbln
tan            exp2               log10             tgamma
cosh           expm1              log1p             trunc
sinh           fdim               log2              carg
tanh           floor              logb              cimag
exp            fma                lrint             conj
log            fmax               lround            cproj
pow            fmin               nearbyint         creal


B.22 Date and time <time.h>
NULL                  size_t                  time_t
CLOCKS_PER_SEC        clock_t                 struct tm

clock_t clock(void);
double difftime(time_t time1, time_t time0);
time_t mktime(struct tm *timeptr);
time_t time(time_t *timer);
char *asctime(const struct tm *timeptr);
char *ctime(const time_t *timer);
struct tm *gmtime(const time_t *timer);
struct tm *localtime(const time_t *timer);
size_t strftime(char *restrict s, size_t maxsize, const char *restrict format,
                const struct tm *restrict timeptr);


B.23 Extended multibyte/wide character utilities <wchar.h>
wchar_t       wint_t             WCHAR_MAX
size_t        struct tm          WCHAR_MIN
mbstate_t     NULL               WEOF

int fwprintf(FILE *restrict stream, const wchar_t *restrict format, ...);
int fwscanf(FILE *restrict stream, const wchar_t *restrict format, ...);
int swprintf(wchar_t *restrict s, size_t n, const wchar_t *restrict format,
            ...);
int swscanf(const wchar_t *restrict s, const wchar_t *restrict format, ...);
int vfwprintf(FILE *restrict stream, const wchar_t *restrict format,
              va_list arg);
int vfwscanf(FILE *restrict stream, const wchar_t *restrict format,
            va_list arg);
int vswprintf(wchar_t *restrict s, size_t n, const wchar_t *restrict format,
              va_list arg);
int vswscanf(const wchar_t *restrict s, const wchar_t *restrict format,
            va_list arg);
int vwprintf(const wchar_t *restrict format, va_list arg);
int vwscanf(const wchar_t *restrict format, va_list arg);
int wprintf(const wchar_t *restrict format, ...);
int wscanf(const wchar_t *restrict format, ...);
wint_t fgetwc(FILE *stream);
wchar_t *fgetws(wchar_t *restrict s, int n, FILE *restrict stream);
wint_t fputwc(wchar_t c, FILE *stream);
int fputws(const wchar_t *restrict s, FILE *restrict stream);
int fwide(FILE *stream, int mode);
wint_t getwc(FILE *stream);
wint_t getwchar(void);
wint_t putwc(wchar_t c, FILE *stream);
wint_t putwchar(wchar_t c);
wint_t ungetwc(wint_t c, FILE *stream);
double wcstod(const wchar_t *restrict nptr, wchar_t **restrict endptr);
float wcstof(const wchar_t *restrict nptr, wchar_t **restrict endptr);
long double wcstold(const wchar_t *restrict nptr, wchar_t **restrict endptr);
long int wcstol(const wchar_t *restrict nptr, wchar_t **restrict endptr,
                int base);
long long int wcstoll(const wchar_t *restrict nptr, wchar_t **restrict endptr,
                      int base);
unsigned long int wcstoul(const wchar_t *restrict nptr,
                          wchar_t **restrict endptr, int base);
unsigned long long int wcstoull(const wchar_t *restrict nptr,
                                wchar_t **restrict endptr, int base);
wchar_t *wcscpy(wchar_t *restrict s1, const wchar_t *restrict s2);
wchar_t *wcsncpy(wchar_t *restrict s1, const wchar_t *restrict s2, size_t n);
wchar_t *wmemcpy(wchar_t *restrict s1, const wchar_t *restrict s2, size_t n);
wchar_t *wmemmove(wchar_t *s1, const wchar_t *s2, size_t n);
wchar_t *wcscat(wchar_t *restrict s1, const wchar_t *restrict s2);
wchar_t *wcsncat(wchar_t *restrict s1, const wchar_t *restrict s2, size_t n);
int wcscmp(const wchar_t *s1, const wchar_t *s2);
int wcscoll(const wchar_t *s1, const wchar_t *s2);
int wcsncmp(const wchar_t *s1, const wchar_t *s2, size_t n);
size_t wcsxfrm(wchar_t *restrict s1, const wchar_t *restrict s2, size_t n);
int wmemcmp(const wchar_t *s1, const wchar_t *s2, size_t n);
wchar_t *wcschr(const wchar_t *s, wchar_t c);
size_t wcscspn(const wchar_t *s1, const wchar_t *s2);
wchar_t *wcspbrk(const wchar_t *s1, const wchar_t *s2);
*wchar_t *wcsrchr(const wchar_t *s, wchar_t c);
size_t wcsspn(const wchar_t *s1, const wchar_t *s2);
wchar_t *wcsstr(const wchar_t *s1, const wchar_t *s2);
wchar_t *wcstok(wchar_t *restrict s1, const wchar_t *restrict s2,
                wchar_t **restrict ptr);
wchar_t *wmemchr(const wchar_t *s, wchar_t c, size_t n);
size_t wcslen(const wchar_t *s);
wchar_t *wmemset(wchar_t *s, wchar_t c, size_t n);
size_t wcsftime(wchar_t *restrict s, size_t maxsize,
                const wchar_t *restrict format,
                const struct tm *restrict timeptr);
wint_t btowc(int c);
int wctob(wint_t c);
int mbsinit(const mbstate_t *ps);
size_t mbrlen(const char *restrict s, size_t n, mbstate_t *restrict ps);
size_t mbrtowc(wchar_t *restrict pwc, const char *restrict s, size_t n,
              mbstate_t *restrict ps);
size_t wcrtomb(char *restrict s, wchar_t wc, mbstate_t *restrict ps);
size_t mbsrtowcs(wchar_t *restrict dst, const char **restrict src, size_t len,
                mbstate_t *restrict ps);
size_t wcsrtombs(char *restrict dst, const wchar_t **restrict src, size_t len,
                mbstate_t *restrict ps);

B.24 Wide character classification and mapping utilities <wctype.h>
wint_t         wctrans_t          wctype_t          WEOF

int iswalnum(wint_t wc);
int iswalpha(wint_t wc);
int iswblank(wint_t wc);
int iswcntrl(wint_t wc);
int iswdigit(wint_t wc);
int iswgraph(wint_t wc);
int iswlower(wint_t wc);
int iswprint(wint_t wc);
int iswpunct(wint_t wc);
int iswspace(wint_t wc);
int iswupper(wint_t wc);
int iswxdigit(wint_t wc);
int iswctype(wint_t wc, wctype_t desc);
wctype_t wctype(const char *property);
wint_t towlower(wint_t wc);
wint_t towupper(wint_t wc);
wint_t towctrans(wint_t wc, wctrans_t desc);
wctrans_t wctrans(const char *property);

