# C99 fuzzy configuration property matching: implementation, benchmark and documentation specification

Build a standalone C99 application that compares fuzzy matching methods for configuration property names. Deliver the executable source, frozen datasets, measured reports, an annotated-source documentation website and a ZIP containing the source and generated HTML.

This specification describes the completed design. Requirements use "must". Recorded findings illustrate a completed experiment; they are not values to hardcode or results that a new implementation may claim without running it.

Sections A through P retain their original subjects and revise A00 through P00. Sections Q through U specify the commenting, library review, documentation website, measured observations and publication requirements added during development. Keep each section's letter when revising this document; increment only the revision of a section that changes.

---

## A01. Project objective

Implement a reproducible evaluation framework, compiled with GCC in C99 mode, for resolving human-written configuration names against a registry of canonical properties.

The input is an array of null-terminated strings:

```ini
database connection strng = Server=localhost;Database=AppDb;
maximum concurent request count = 100
enable detailed error loging = true
```

The intended names are `DatabaseConnectionString`, `MaximumConcurrentRequestCount` and `EnableDetailedErrorLogging`. The proposed names may differ through casing, supported separators, missing or extra letters, substitutions or transpositions.

The framework must answer which method, together with its acceptance policy, provides useful typo recovery while avoiding incorrect configuration assignments. Selecting the most similar candidate is only an intermediate calculation. The resolver must also decide whether to accept, report ambiguity or reject.

A wrong automatic assignment is more serious than an unnecessary rejection. For example, applying a milliseconds value to a seconds property can pass integer validation and still change application behavior substantially.

The application must execute correctness checks, calibrate policies on separate development data, freeze those policies, evaluate held-out inputs, measure runtime and generate its findings from the recorded results. No algorithm receives hidden aliases, property-specific exceptions or a preselected ranking.

The benchmark core must require only GCC, Make and the C standard library. Isolated POSIX helpers are permitted as specified below. Node and Python are documentation and verification tools, not dependencies of the matching executable.

---

## B02. Background and original configuration model

### B02.1. Compiler-checked properties

The original schema was a C# class:

```csharp
public class ApplicationConfiguration
{
    public required string DatabaseConnectionString { get; init; }
    public required string AuthenticationServerEndpoint { get; init; }
    public required string ApplicationEnvironmentName { get; init; }
    public required int MaximumConcurrentRequestCount { get; init; }
    public required int DefaultRequestTimeoutSeconds { get; init; }
    public required bool EnableDetailedErrorLogging { get; init; }
    public required string ExternalNotificationServiceUrl { get; init; }
    public required string TemporaryFileStorageDirectory { get; init; }
    public required int BackgroundTaskExecutionIntervalSeconds { get; init; }
    public required bool EnableAutomaticConfigurationReload { get; init; }
}
```

C# checks property identifiers used in an object initializer. A misspelled identifier is a compilation error.

### B02.2. Dictionary string keys

A dictionary key is an arbitrary string, so the compiler cannot provide the same schema check:

```csharp
var configuration = new Dictionary<string, object>
{
    ["DatabaseConnectionString"] = "Server=localhost;Database=AppDb;",
    ["maximum concurent request count"] = 100
};
```

The dictionary example motivates runtime name resolution. It is not a runtime dependency or a second implementation to maintain.

### B02.3. C99 input representation

The implemented representation is a C array of `key = value` strings. Parsing extracts two strings. Name resolution uses only the key; value validation occurs after a property has been accepted.

Formatting variants such as these should resolve through normalization alone:

```text
Database Connection String
database-connection-string
DATABASE_CONNECTION_STRING
```

`database connection strng` needs fuzzy matching because normalization cannot restore the missing letter.

---

## C01. Canonical property registry and example configuration

### C01.1. Authoritative names and value types

The baseline registry must contain the following names. All are required in a complete baseline configuration.

| Canonical property | Value type |
|---|---|
| DatabaseConnectionString | string |
| AuthenticationServerEndpoint | string |
| ApplicationEnvironmentName | string |
| MaximumConcurrentRequestCount | integer |
| DefaultRequestTimeoutSeconds | integer |
| EnableDetailedErrorLogging | boolean |
| ExternalNotificationServiceUrl | string |
| TemporaryFileStorageDirectory | string |
| BackgroundTaskExecutionIntervalSeconds | integer |
| EnableAutomaticConfigurationReload | boolean |

Canonical names, types and required flags belong to registry data. Algorithms must not contain these names or infer a property from its value.

Each property caches its normalized name and ordered tokens. A registry identifies a property array, its size and whether normalization created a schema collision. The registry borrows the array; it does not free it.

### C01.2. Complete configuration example

```c
static const char *configuration[] = {
    "database connection strng = Server=localhost;Database=AppDb;",
    "authentication server endpint = https://auth.example.com",
    "application environment name = Production",
    "maximum concurent request count = 100",
    "default request timeout seconds = 30",
    "enable detailed error loging = true",
    "external notification service url = https://api.example.com/notifications",
    "temporary file storage directory = /var/app/temp",
    "background task execution interval seconds = 60",
    "enable automatic configuration relod = false"
};
```

The intended targets follow the order of the registry table. Test the complete batch with an explicitly supplied reference policy, such as Levenshtein similarity at least 0.90, runner-up margin at least 0.02 and maximum edit cost 2. This integration example is separate from the policy later selected by calibration.

### C01.3. Additional registries

Supply the baseline registry, an adversarial registry with confusable names, a short-name registry, a maximum-length registry, a deliberately colliding registry and a separate calibration registry.

The reference adversarial registry contains the baseline names plus the alternatives in I01. The short registry contains `Host`, `Port`, `Path`, `Mode`, `Name`, `Timeout`, `Read`, `Write`, `Min`, `Max`, `V1` and `V2`.

Performance scaling registries are separate data. They must retain the baseline names and add deterministic unrelated names and names with common prefixes. Their timings do not establish matching safety for real large schemas.

---

## D02. INI-like entry parsing

### D02.1. Delimiter and whitespace rules

The first equals sign separates the key from the value. Later equals signs and semicolons are literal value characters.

```text
Input:  " database connection strng = Server=localhost;Database=AppDb; "
Key:    "database connection strng"
Value:  "Server=localhost;Database=AppDb;"
```

Trim surrounding ASCII whitespace from both fields. Preserve internal whitespace and punctuation until later stages. ASCII whitespace means space, tab, newline, carriage return, vertical tab and form feed.

`name=` is syntactically valid and produces an empty value. `name` has no separator and is a parsing error. ` =value` has an empty key and is a parsing error.

Sections, escaping, quote interpretation and inline comments are outside the format. For example, `name=' x '` retains the quote characters, and `name=a;b=c` retains `a;b=c`. Do not silently add full INI behavior.

### D02.2. Bounds and copies

Use these reference bounds, counting bytes before the terminating null character:

| Input or representation | Maximum |
|---|---:|
| Complete entry | 1280 bytes |
| Raw property name | 128 bytes |
| Value | 1024 bytes |
| Prepared tokens | 32 |
| Properties in a registry | 1000 |
| Cases in one loaded dataset | 1000 |

A destination array for a string needs one additional byte for `\0`. Reject oversized data explicitly; do not truncate it into a different valid key or value.

Bound the initial input scan before calling an unbounded library search. After that check, use `strchr(line, '=')`. Represent slices with exclusive end indices, validate their lengths, copy with `memcpy` and append a terminator.

```c
memcpy(out->key, line + key_start, key_end - key_start);
out->key[key_end - key_start] = '\0';
```

The comment beside this copy should explain that `memcpy` copies bytes and does not append a string terminator.

### D02.3. Parsing is independent of matching

```ini
this property does not exist = 100
```

This line parses successfully. Its key may then produce `MATCH_UNKNOWN`. Keep parsing errors, invalid identifiers, unresolved names and invalid values as separate diagnostics.

Values remain strings until binding. Do not parse a number or boolean to influence candidate ranking.

---

## E02. Name resolution and configuration binding

### E02.1. Processing sequence

Parse the entry, prepare the key, check schema validity, try a unique exact normalized match, then score candidates if necessary. Apply the score threshold, runner-up margin and optional edit cap. Only an accepted name may proceed to value validation and duplicate detection.

Validate the complete configuration before applying it. A rejected name must stop that batch's application; it must not proceed to binding merely because suggestions are available.

| Stage | Example | Result |
|---|---|---|
| Parse | `database connection strng = a=b;` | key and literal value |
| Prepare | `database connection strng` | joined normalized text plus tokens |
| Exact lookup | normalized spelling still lacks `i` | no exact match |
| Fuzzy decision | acceptable score and lead | canonical property or rejection |
| Validate value | nonempty string | valid value |
| Check batch | canonical slot not already used | no duplicate |
| Apply | every entry and required field valid | replace destination configuration |

### E02.2. ASCII normalization and tokenization

Retain the C locale. Use standard character-classification functions with unsigned-character arguments, after rejecting bytes outside ASCII.

Accept ASCII letters, digits, underscore, hyphen and ASCII whitespace in names. Lowercase letters and remove the supported separators. Preserve digits. Reject other punctuation, control bytes and non-ASCII bytes; do not silently erase them. An empty normalized result is invalid.

```text
"Default_Request Timeout" -> "defaultrequesttimeout"
"ApiEndpointV2"          -> "apiendpointv2"
"database.connection"    -> invalid identifier
"---"                    -> invalid identifier
```

Enforce the raw key limit before normalization. A long sequence of removable separators must not bypass it.

Capture tokens before concatenation loses word boundaries. Split on supported separators, lowercase-to-uppercase transitions, digit-to-uppercase transitions and acronym-to-word transitions:

```text
DefaultRequestTimeoutSeconds -> [default, request, timeout, seconds]
default requst timeout       -> [default, requst, timeout]
HTTPServerURL                -> [http, server, url]
ApiEndpointV2                -> [api, endpoint, v2]
```

Do not split `HTTP` into four tokens. Do not guess missing boundaries in `defaultrequesttimeout`; that input exposes one token. Document this limitation of token-aware scoring.

### E02.3. Exact matches and schema collisions

A unique exact normalized match must be accepted before fuzzy thresholds are considered. Formatting-only resolution must be counted as exact, not as fuzzy recovery.

If two canonical names normalize to the same string, invalidate the entire registry:

```text
DatabaseConnectionString
Database_Connection_String
```

The resolver must not select either entry or continue matching unrelated keys against that invalid schema.

### E02.4. Candidate scoring and outcomes

Every fuzzy method evaluates every eligible canonical property through the same interface. Every returned score must be finite. Larger scores mean greater similarity. Define the score range for each method; do not equate a similarity score with a probability that binding is correct.

Retain the best and second-best candidates. A full candidate sort is unnecessary for ordinary resolution. Lexical name order may settle suggestion display order when scores tie, but must not turn a tie into an accepted match.

```c
typedef enum {
    MATCH_EXACT,
    MATCH_FUZZY,
    MATCH_AMBIGUOUS,
    MATCH_UNKNOWN,
    MATCH_INVALID
} MatchStatus;

typedef struct {
    MatchStatus status;
    int first, second;       /* canonical indices, or -1 */
    double best, runner;     /* scores, including after rejection */
} Resolution;
```

Use `MATCH_INVALID` for unsupported identifiers or invalid schemas. Use `MATCH_UNKNOWN` when the absolute score or edit cap fails, and `MATCH_AMBIGUOUS` when sufficient similarity lacks a sufficient lead. Suggestions remain diagnostic data and are never applied automatically.

Treat score differences within `1e-12` as ties for the decision policy. Equal scores reject even when the configured margin is zero. Registry order changes must not change acceptance or tied suggestions.

### E02.5. Transactional value binding

String properties require a nonempty value. Boolean spellings are exactly `true` and `false`. Integer values permit an optional leading sign followed by decimal digits and must fit `INT_MIN` through `INT_MAX` on the target C implementation. On the tested 32-bit-`int` platform, this is -2147483648 through 2147483647.

Use `strtol`, check range errors and require complete consumption. `100seconds`, a lone sign, embedded whitespace and `1.0` are invalid integer values. A syntactically empty value may therefore fail binding after parsing succeeds.

```ini
maximum concurent request count = abc
```

This can resolve to the right property and still fail value validation. Count it as a binding error, not a name-matching failure.

Detect duplicates by resolved canonical index, not by raw input spelling:

```ini
database connection strng = Server=localhost;
database-connection-string = Server=production;
```

Both lines target the same slot. Reject the batch instead of overwriting the first value.

Provide a validation-only operation and an application operation. The application operation validates all entries, duplicates and required properties before changing the destination. It may then repeat deterministic parsing and resolution to apply typed values. Inputs, registry and policy must remain unchanged across both passes. Any validation failure leaves the previous configuration intact.

---

## F03. Matching algorithms and score definitions

Implement all twelve methods below, plus the exact-normalized baseline. Sharing helpers is permitted; treating one formula under several thresholds as several algorithms is not.

Let `n` and `m` be normalized character lengths. A prefix is the part of a string read so far. Prepared scoring inputs are validated, nonempty ASCII names within the declared bounds. Low-level helper tests may additionally exercise empty strings, but the public prepared-input interface must not divide by zero.

### F03.1. Required methods

| ID | Method | Score or calculation |
|---|---|---|
| ALG01 | Levenshtein | `1 - edit_distance / max(n,m)` |
| ALG02 | Optimal String Alignment, the restricted adjacent-letter-swap method | `1 - restricted_distance / max(n,m)` |
| ALG03 | Full Damerau-Levenshtein | `1 - full_distance / max(n,m)` |
| ALG04 | Weighted Levenshtein | `1 - weighted_distance / max(weighted_length_a, weighted_length_b)` |
| ALG05 | Jaro | mean of matched-character coverage and order agreement |
| ALG06 | Jaro-Winkler | Jaro plus a bounded shared-prefix bonus |
| ALG07 | Longest common subsequence | `2 * common_length / (n+m)` |
| ALG08 | Trigram Jaccard | distinct three-character intersection divided by union |
| ALG09 | Bigram Sorensen-Dice | `2 * shared / (left_set_size + right_set_size)` |
| ALG10 | Trigram cosine | frequency dot product divided by vector lengths |
| ALG11 | Ratcliff-Obershelp | `2 * selected_block_letters / (n+m)` |
| ALG12 | Ordered token hybrid | `0.65 * character_similarity + 0.35 * token_similarity` |

Avoid unexplained abbreviations in prose. If `OSA` appears in a code identifier or external reference, define it visibly as Optimal String Alignment and explain the restricted swap rule. Likewise, expand `LCS` as longest common subsequence and explain that gaps are allowed.

### F03.2. Unit-cost edit distances

Levenshtein assigns cost 1 to insertion, deletion and unequal substitution, and cost 0 to keeping an equal character. A cell stores the cheapest cost of converting one prefix into the other.

The ordinary recurrence uses the previous row, current-row predecessor and diagonal predecessor. A shared implementation may keep three rotating rows to support the restricted swap method. Pointer selection reuses arrays; it must not copy a full matrix on each iteration.

The restricted swap method also considers crossed adjacent characters at cost 1 from the cell two rows and columns earlier. Its recurrence cannot edit that swapped substring again. Full Damerau-Levenshtein uses older character occurrences and permits combinations the restricted recurrence cannot represent:

| Input and target | Ordinary Levenshtein | Restricted swaps | Full Damerau-Levenshtein |
|---|---:|---:|---:|
| `ab` to `ba` | 2 | 1 | 1 |
| `ca` to `abc` | 3 | 3 | 2 |

The full method can use `ca -> ac -> abc`: swap, then insert `b`. Implement the unrestricted last-occurrence recurrence, not another copy of the restricted recurrence under a different name.

For the full method, the logical table is `(n+2) * (m+2)`. The reference implementation reserves a fixed `(KEY_MAX+2) * (KEY_MAX+2)` array, so its reported workspace reflects the maximum bound, not just the current strings. Store the most recent input occurrence of each ASCII character and the latest matching column. Explain that logical prefix cell `(i,j)` lives at physical cell `[i+1][j+1]`; the extra border blocks nonexistent earlier matches. An unsigned-short matrix accommodates the reference length bound and sentinel.

For an explicit full-distance recurrence, use one-based character positions `i` and `j`. Before updating matches at the current cell, let `p` be the previous input occurrence of the candidate character, and `q` the previous matching candidate column in this input row. Compare:

```text
replace = D[i][j] + (input[i-1] != candidate[j-1])
insert  = D[i+1][j] + 1
delete  = D[i][j+1] + 1
swap    = D[p][q] + (i-p-1) + 1 + (j-q-1)
D[i+1][j+1] = min(replace, insert, delete, swap)
```

Initialize guard row/column zero to `n+m`, `D[i+1][1]` to `i`, and `D[1][j+1]` to `j`. Missing occurrences use guard index zero. Reset the row's last matching column before each input row, capture its old value before updating it for an equal character, and update the input character's last occurrence after completing the row.

All three methods take `O(n*m)` time per candidate. Rolling rows need linear workspace; the full method needs matrix workspace.

### F03.3. Weighted edit costs

Use global, documented prices:

| Operation | Cost |
|---|---:|
| Keep an equal character | 0 |
| Insert or delete a letter | 1 |
| Insert or delete a digit | 2 |
| Unequal substitution involving a digit | 2 |
| Substitute horizontally adjacent letters in one listed keyboard row | 0.5 |
| Other unequal letter substitution | 1 |

The keyboard rows are `qwertyuiop`, `asdfghjkl` and `zxcvbnm`. Diagonal neighbors and other keyboard layouts are not included. Equal digits still cost zero.

Weighted length assigns weight 1 to a letter and 2 to a digit. For `v1` and `v2`, distance 2 and weighted length 3 give similarity `1 - 2/3`, about 0.333. For `a` and `s`, the substitution costs 0.5.

Preserve the reference normalization formula, but document its range accurately. It is not guaranteed to stay nonnegative: `1a` to `b2` costs 4, each weighted length is 3, and the score is `1 - 4/3`, about -0.333. Such a score is poor similarity and fails the positive acceptance thresholds. Do not claim that every algorithm's raw score is in `[0,1]`. Clamping or choosing a different denominator would be a separately identified scoring change requiring reevaluation.

Use two rolling rows of floating-point costs. The method takes `O(n*m)` time with linear row workspace, with keyboard checks adding work to substitutions. Its prices must not depend on a particular schema or held-out error.

### F03.4. Jaro and Jaro-Winkler

For Jaro, use a matching window of `max(0, floor(max(n,m)/2)-1)`. Greedily match each input character to the first unused equal candidate character inside that window. A character may be used once. Keep match flags for both strings.

Let `M` be the number of matched characters and `H` the number of disagreements when reading only the matched subsequences in order:

```text
Jaro = (M/n + M/m + (M - H/2)/M) / 3
```

No matches give zero; identical strings give one. For `martha` and `marhta`, all six characters match, two are out of order, and the score is `(1 + 1 + 5/6)/3 = 17/18`, about 0.944.

Jaro-Winkler adds a prefix bonus only when Jaro exceeds 0.7:

```text
prefix = min(common_leading_characters, 4)
score = Jaro + prefix * 0.1 * (1 - Jaro)
```

For base score 0.9 and three leading matches, the result is 0.93. This is the specified variant; do not assume every published Jaro-Winkler variant has these exact rules.

Both methods have quadratic worst-case matching work and linear match-flag workspace. A high score or long shared prefix does not establish equivalent configuration meaning.

### F03.5. Longest common subsequence

Keep the longest shared sequence of characters in order, allowing gaps. For `abc` and `ac`, the common sequence is `ac`, length 2, so the score is `4/5 = 0.8`.

Equal characters extend the shorter-prefix result. A mismatch keeps the better result from skipping either character. It does not reset the cell to zero; that would require a contiguous block.

Use two rolling rows. Time is `O(n*m)` and workspace is linear. Missing meaningful words can still leave a high score.

### F03.6. Character-window methods

A bigram contains two adjacent characters; a trigram contains three. Extract unpadded windows:

```text
abcd -> trigrams [abc, bcd]
abce -> trigrams [abc, bce]
```

Pack each window into an integer, sort with `qsort`, then merge sorted runs. Do not invent start/end padding. Identical strings score one. Otherwise, if either input has no window of the required size, return zero.

Jaccard and Dice use sets, so repeated windows count once. Trigram Jaccard for the example above is `1/3`. Bigram Dice for `{ab,bc}` and `{ab,bd}` is `2*1/(2+2) = 0.5`.

Cosine uses frequencies. For `aaaba` and `aaaa`, the counts for `[aaa,aab,aba]` are `[1,1,1]` and `[2,0,0]`. Their dot product is 2 and squared-length sums are 3 and 4. The score is `2/sqrt(3*4)`, about 0.577.

Packing and merging are linear in input length. Explicit window arrays use linear workspace. C99 does not prescribe `qsort` complexity or internal allocation behavior, so identify these as library-dependent rather than claiming a portable fixed sorting cost or zero total allocation.

### F03.7. Ratcliff-Obershelp

Select a longest shared contiguous block, count its characters, then repeat on the unmatched left and right regions. Use a bounded explicit stack of regions instead of unbounded recursion. Regions store offsets and lengths into the original strings, not copied substrings.

For `abxxcd` and `abyycd`, select `ab`, then `cd` in the right regions. Four selected letters give `2*4/(6+6) = 2/3`.

Normalize pair orientation lexically before scanning. For equally long blocks, retain the first block under the specified scan order. This makes the selected variant deterministic and symmetric. It remains a greedy block method, not a minimum-edit algorithm.

Use two rolling rows to find contiguous blocks; a mismatch resets the temporary block length. A conservative time bound is `O((n+m)*n*m)`, with linear row and pending-region workspace. Good observed timings do not replace the worst-case bound.

### F03.8. Ordered token hybrid

Compute character similarity using ALG01. Independently align the ordered token sequences. Token insertion and deletion cost 1. Token substitution costs the Levenshtein distance between the two token strings divided by their longer character length.

```text
requst -> request: token substitution cost = 1/7
```

Let `D` be the minimum token-alignment cost, and `T` and `U` the token counts:

```text
token_similarity = 1 - D/max(T,U)
hybrid = 0.65*character_similarity + 0.35*token_similarity
```

For `request` versus `RequestTimeout`, character distance is `7/14` and token cost is `1/2`. Both similarities are 0.5; the mixture is also 0.5.

The weights are fixed project choices, not values learned from held-out data or prescribed by a reference. Ordered alignment penalizes reordering; it is not a token-set method and does not infer synonyms.

A conservative bound is `O(n*m + T*U*L*L)` for maximum token length `L`. Reuse rolling token rows and character-edit workspace. Lowercase concatenated inputs lose word boundaries and can behave differently from spaced input.

### F03.9. Exact baseline and fair inputs

The separate exact-normalized baseline performs no fuzzy scoring. It accepts formatting variants and rejects misspellings unless they exactly spell another canonical property. Its scorer entry may be null because the shared resolver handles exact matching first. Exact matching recognizes spelling; it cannot detect a semantic mistake that happens to spell another valid property correctly.

All fuzzy methods share normalization, active registries, cases and decision-layer rules. Character methods use joined text; only token-aware scoring additionally uses the preserved tokens. Optional aliases, property-specific thresholds or value-aware matching belong to separate named experiments, not hidden advantages in this comparison.

---

## G01. Calibration, confidence and safety policy

### G01.1. Decision parameters and order

A policy contains minimum similarity, minimum best-versus-runner-up lead and an optional maximum edit cost. Maximum edit cost applies only to ALG01 through ALG04; `-1` disables that cap.

For fuzzy input, check the absolute threshold first, then ambiguity, then the edit cap. A singleton registry has no runner-up to compare. A tied score must never win automatically.

```text
Best score:       0.94
Runner-up:        0.93
Minimum score:    0.90
Required margin:  0.02
Outcome:         ambiguous, because 0.94 - 0.93 = 0.01
```

An initial reference policy of similarity 0.90 and maximum distance 2 is a hypothesis and an integration-test setting, not the final policy for every method. A Jaro score of 0.90 and an edit-based score of 0.90 do not mean the same thing.

### G01.2. Calibration search

Search the following grid using calibration data only:

| Parameter | Values |
|---|---|
| Minimum score | 0.50 through 1.00 in steps of 0.02, plus 1.000001 |
| Minimum margin | 0, 0.01, 0.02, 0.04, 0.08, 0.12, 0.20 |
| Maximum edit cost | unlimited, 1, 2, 3 for the edit methods |

A score threshold above one disables fuzzy acceptance while leaving exact matching active. Prepare calibration queries and candidate scores once, then reuse them while testing policies.

Minimize the cost in G01.3. Equal-cost policies prefer the higher threshold, then higher margin. Remaining ties retain the first cap in the declared order, with unlimited first. Record the complete grid, not only the winner.

Finish selecting every algorithm's policy before evaluating held-out inputs. Threshold sensitivity examples may shift a frozen threshold by -0.04 and +0.04 on calibration data while holding other parameters fixed. They must not retune using held-out failures.

### G01.3. Configurable error cost

Use default severe-error cost 100 and unnecessary-rejection cost 1:

```text
cost = wrong_cost * (wrong_target + unknown_accepted + ambiguous_accepted)
     + reject_cost * unnecessary_target_rejections
```

Correct matches, safely rejected unknowns and safely rejected ambiguous inputs cost zero. Rejecting an ambiguous input as unknown is safe but diagnostically incomplete; it does not count as a correct ambiguity diagnosis.

Expose both weights through the command line. Keep each severe-error count visible beside the weighted total so one incorrect assignment cannot disappear inside an aggregate score.

---

## H02. Calibration data, held-out cases and correctness tests

### H02.1. Dataset sizes and separation

Provide at least 120 calibration cases, 380 distinct held-out resolution cases, 40 parser cases and 20 binding cases. The reference dataset uses 184 calibration cases and exactly the following held-out distribution:

| Held-out category | Cases |
|---|---:|
| Exact canonical names | 20 |
| Casing, spaces and supported separators | 30 |
| Single-character deletions | 25 |
| Single-character insertions | 25 |
| Single-character substitutions | 25 |
| Adjacent transpositions | 25 |
| Multiple simultaneous errors | 30 |
| Punctuation and token-boundary variations | 25 |
| Missing words and partial identifiers | 20 |
| Reordered words and semantic-looking alternatives | 20 |
| Near-collision and adversarial names | 45 |
| Unknown names | 35 |
| Ambiguous identifiers | 30 |
| Short and maximum-length boundaries | 25 |

These are distinct labeled inputs, not repeated timing iterations. Keep category labels in every case. Surface variants of one ambiguous phrase are not independent semantic examples; report that limitation.

The calibration vocabulary must be disjoint from held-out canonical names. Assign closely related mutation families and entire calibration schemas to one split. The reference calibration set uses separate telemetry, session, queue, trace, transport, archive and scheduler properties. It contains formatting cases, deterministic mutations, unknowns and application-defined ambiguities.

### H02.2. Positive and rejected examples

Include the complete configuration from C01 and examples such as:

```text
databse connection string             -> DatabaseConnectionString
DatabaseConnetionString               -> DatabaseConnectionString
maximum concurrent request cnt        -> MaximumConcurrentRequestCount
enable detailed error loging          -> EnableDetailedErrorLogging
enable automatic configuration relod  -> EnableAutomaticConfigurationReload
```

Unknown examples include `unknown configuration field`, `database encryption key`, `maximum worker thread priority`, `notification retry policy` and `authentication provider certificate`.

Define ambiguity by the active schema and application meaning. For example, `auth server endpoint` is ambiguous when both authentication and authorization endpoints exist. A missing word may instead be labeled unknown under a conservative policy; do not derive either label from an algorithm's score tie.

Reordered and semantic-looking inputs are conservatively rejected in the baseline experiment. `server URL` is not an implicit alias for `AuthenticationServerEndpoint`. Do not add aliases to make an algorithm appear more accurate.

### H02.3. Label corrections retained from the review

The reference dataset version is `2026-11-v2`. An earlier negative example was a plausible typo of the registered milliseconds property. Replace that mislabeled negative with the explicitly unsupported unit in `default request timeout nanoseconds`.

Keep `default request timeout miliseconds` as a positive adversarial typo targeting `DefaultRequestTimeoutMilliseconds`. Keep `maximum concurrent request cnt` as a target-labeled partial name. These label corrections must not change calibration labels, scoring rules or the calibration search grid. Rerun the evaluation after correcting labels and preserve the dataset version with the results.

### H02.4. Case metadata and validation

Each resolution case must preserve a stable ID, schema ID, category, raw key, expected outcome, intended canonical target if any, and family ID.

```c
typedef enum {
    EXPECT_RESOLVED,
    EXPECT_UNKNOWN,
    EXPECT_AMBIGUOUS,
    EXPECT_INVALID
} Expected;
```

The resolution manifest contains keys, not complete entries. Parsing errors belong to the parser suite; `EXPECT_INVALID` covers unsupported keys and schema collisions. This replaces the original suggestion to mix parser errors into a name-only resolution manifest.

Use input columns `id,schema,category,input,expected,target,family`. Reference numeric labels are 0, 1, 2 and 3 in the enum order above. A resolved case requires a target present in its active registry. Other outcomes must have an empty target.

Reject duplicate IDs, duplicate raw-input/schema pairs, unknown schema IDs, unsupported categories, overlong fields, malformed outcome values and labels that contradict a unique exact canonical name. A generated typo must not become a different legitimate property. Check raw-key and schema validity before scoring.

The reference fixed-field capacities, excluding terminators, are:

| Field | Maximum bytes |
|---|---:|
| Case ID and schema ID | 31 each |
| Category | 47 |
| Raw key and canonical target | 128 each |
| Mutation family ID | 63 |

Reject datasets beyond the declared case bound and include one terminator byte in each string array. Larger limits require coordinated changes to caches, loaders and tests.

The frozen input manifest uses an explicitly limited unquoted CSV format without commas or newlines inside fields. The loader must reject unsupported rows rather than misparse them. Output CSV text fields must be properly quoted and escaped.

### H02.5. Deterministic generation and reconstruction

Use a fixed default seed of 42. The reference generator is C99 xorshift32 with shifts left 13, right 17, left 5. Seed zero maps to `0x9e3779b9` because an all-zero xorshift state would remain zero.

Generate deletion, insertion, substitution, adjacent-swap and multiple-error mutations with explicit intended targets. Skip unchanged substitutions and equal-letter swaps. Retry duplicates or conflicting labels with a finite attempt limit. Preserve final manifests in the project.

Ordinary builds and benchmarks must never regenerate manifests. Require an explicit `--generate` operation, then require the benchmark seed and dataset version to agree with manifest metadata.

For byte-identical reproduction of the reference experiment, use the supplied frozen manifests. This README describes how to rebuild the system; it does not enumerate every reference row. If an agent has only this README, it must create a new documented dataset version meeting these requirements and report fresh results. It must not claim the recorded reference findings as its own output.

---

## I01. Dangerous collisions and boundary behavior

### I01.1. Adversarial names that coexist

The following alternatives must coexist with their baseline counterparts:

| Existing property | Confusable alternative |
|---|---|
| AuthenticationServerEndpoint | AuthorizationServerEndpoint |
| DefaultRequestTimeoutSeconds | DefaultRequestTimeoutMilliseconds |
| MaximumConcurrentRequestCount | MaximumConcurrentRequestsCount |
| EnableDetailedErrorLogging | EnableDetailedAccessLogging |
| ExternalNotificationServiceUrl | InternalNotificationServiceUrl |
| TemporaryFileStorageDirectory | TemporaryFileCacheDirectory |
| BackgroundTaskExecutionIntervalSeconds | BackgroundTaskExecutionIntervalMinutes |
| EnableAutomaticConfigurationReload | EnableAutomaticConfigurationReset |

Also include `MinimumConnectionCount`/`MaximumConnectionCount`, `InputBufferSize`/`OutputBufferSize`, `ReadCacheEnabled`/`WriteCacheEnabled`, `FeatureEnabled`/`FeatureDisabled`, `ApiEndpointV1`/`ApiEndpointV2`, and `ConnectionCount`/`ConnectionLimit`.

Types must not disambiguate these names during matching. The adversarial experiment tests names independently of whether a supplied value would happen to fit both candidates.

### I01.2. Units and distinguishing words

```ini
default request timeout miliseconds = 30000
```

The intended target is milliseconds. Assigning the value to seconds is an incorrect-target match even though the integer is syntactically valid for either property.

By contrast, `default request timeout nanoseconds` is an unknown key in this registry. Accepting it as seconds is a false acceptance of an unknown, not an incorrect-target assignment for a labeled positive. The report must preserve this distinction.

Investigate common-prefix behavior, especially Jaro-Winkler, but do not infer causation from a small observed association. Compare intended and accepted names when counting shared prefixes; do not confuse a rejected suggestion with an applied setting.

### I01.3. Short names, digits and long names

Exercise short properties because one edit changes a larger fraction of `Port` than of a long configuration identifier. Include `V1` and `V2` distinctions; only the weighted method gives digits a higher edit price.

Test a one-character name, raw keys exactly at the 128-byte limit, one byte beyond it, and two maximum-length names differing near the end. An overlong input must not become a valid truncated identifier.

### I01.4. Required edge cases

Test empty and separator-only keys, all supported whitespace characters, empty values, missing equals signs, literal later equals signs, unsupported punctuation, non-ASCII bytes, normalization collisions, tied fuzzy scores, reordered registries, all scores below threshold, duplicate canonical bindings, invalid typed values, missing required properties and rollback after a failed batch.

Include both ordinary adjacent swaps and `ca -> abc` to distinguish the two transposition methods. Include token reordering and semantic-looking alternatives as separate categories. Unknown, ambiguous and invalid outcomes must remain separate in the results.

---

## J01. Matching metrics and timing methodology

### J01.1. Outcome counts and denominators

Record correct exact and fuzzy matches, wrong-target accepts, unknown accepts, ambiguous accepts, rejected intended targets, safely rejected unknowns, correctly diagnosed ambiguities, safe ambiguity-as-unknown outcomes and invalid-input/schema outcomes.

Report these definitions explicitly:

| Metric | Definition |
|---|---|
| Fuzzy precision for intended targets | correct fuzzy / (correct fuzzy + wrong-target accepts) |
| Fuzzy recall | correct fuzzy / target-labeled inputs without an exact normalized match |
| Correct target coverage | (correct exact + correct fuzzy) / all target-labeled inputs |
| Acceptance purity | all correct accepts / all accepts, including unknown and ambiguous false accepts |
| Unsafe assignments | wrong-target + unknown accepted + ambiguous accepted |
| Weighted cost | the formula in G01.3 |

The intended-target precision excludes unknown and ambiguous false accepts. It must therefore appear with unsafe counts and acceptance purity, not as a complete safety measure. Print undefined ratios as unavailable, not as invented perfect precision.

Keep normalization-only performance separate from typo recovery. Do not rank by overall accuracy inflated by easy formatting cases. Add category-specific results and an adversarial breakdown.

A failure to diagnose an ambiguous key as ambiguous is a diagnostic failure, even if rejecting it as unknown is safe. Preserve both the safety classification and whether the expected diagnostic was met.

### J01.2. Confusion and concrete errors

For accepted wrong-target cases, report intended/accepted property pairs and their frequencies. Include intended-target score, winning score, runner-up score, threshold and margin in per-case evidence.

Unknown and ambiguous acceptances must be reported even if no positive input was assigned to the wrong target. A zero wrong-target count does not mean the resolver made no dangerous assignments.

### J01.3. Separate resolution and scoring timings

Use an optimized benchmark binary, not the sanitizer binary. Warm both paths before measuring:

| Path | Included work |
|---|---|
| End-to-end name resolution | normalization, tokenization, exact lookup, scoring when needed, ranking and acceptance policy |
| Scoring only | compare prepared input with every prepared candidate; no exact bypass, ranking or policy |

Parsing and binding are outside the defined end-to-end name-resolution measurement. Printing, report generation, file operations and dataset creation must be outside both timed paths. Candidate preparation is outside scoring; extracting per-comparison grams remains inside the gram scorer.

Measure query preparation and canonical preprocessing separately. Report that collision validation currently makes registry construction quadratic in registry size.

Use a consumed result, such as a volatile checksum, to prevent the compiler from deleting the calculation. Allocate timing sample arrays outside the measured interval. Do not claim control over allocation inside the C library's `qsort`.

### J01.4. Scaling probes and repetitions

Benchmark registries of 10, 50, 100 and 1000 properties. The reference harness uses twelve deterministic typo probes per size, including baseline names and names from the generated tail. Reuse identical probes and registries for every method.

Default execution uses five repetitions. The delivered comparison and regression workflow use seven. Repetition count must be configurable from 1 through 100. A repetition is another pass over probes in one process, not an independent process launch or host restart.

Larger registries must contain both unrelated names and deliberately similar names. Document their synthetic construction and do not use them as accuracy evidence for a real thousand-property application.

### J01.5. Clocks and latency statistics

Prefer `clock_gettime(CLOCK_MONOTONIC)` for elapsed wall time where supported. Isolate a standard C99 `clock()` fallback, which measures CPU time. Report the timer actually used and its units. Do not silently mix clock sources inside a run if a timer fails.

Record total matching time, mean, pooled median, P95, P99 and queries per second. Also record the median, minimum and maximum of per-repetition mean latency to show variation across passes.

Use nearest-rank percentiles: sort samples, take rank `ceil(p*N)`, then subtract one for the C array index. With 84 samples, the P95 rank is 80 and the index is 79. Median for an even sample count averages the middle pair.

Timer overhead is included and can dominate the exact baseline. Exact-baseline scoring-only timing measures score-array filling, not a fuzzy calculation. Report these limits rather than inventing a correction.

### J01.6. Memory and statistical limits

Document per-algorithm bounded arrays, candidate/query representations and explicit per-query allocations. The reference scoring code uses no explicit heap allocation; `qsort` internals are implementation-dependent. Calibration caches and benchmark samples are outside the ordinary matching workspace.

Report source-derived workspace bounds as bounds, not measured peak resident memory. If process memory was not instrumented, say unavailable. Large static calibration caches also make the reference calibration routine sequential and non-reentrant.

Provide a confidence interval or a clear finite-sample limitation for unsafe rates. The reference report uses a descriptive Wilson 95% interval among valid resolution inputs. Generated families and repeated semantic phrases violate simple independence assumptions; do not present the interval as a population guarantee.

---

## K01. Rankings, recorded findings and recommendations

### K01.1. Safety-first ordering

Rank fuzzy methods by unsafe assignments ascending, correct fuzzy recoveries descending, then ten-property median resolution time ascending. Timing breaks matching-quality ties; it does not offset a severe error.

The balanced ranking first minimizes configurable weighted cost, then applies the safety-first criteria. The performance-focused choice must have the minimum observed unsafe count among fuzzy methods and recover at least one fuzzy input. This is an empirical eligibility rule, not a safety certification.

Report the exact baseline separately. Distinguish the safest fuzzy policy from the conservative option of exact-only automatic binding. If several methods remain tied, state the tie or the measured tiebreaker.

### K01.2. Findings from the recorded reference run

The corrected seed-42 reference dataset produced the following results under separately calibrated policies:

| Method | Typos correctly recovered | Unsafe assignments |
|---|---:|---:|
| Levenshtein | 174/185 | 0 |
| Restricted adjacent swaps | 174/185 | 0 |
| Full Damerau-Levenshtein | 174/185 | 0 |
| Weighted Levenshtein | 174/185 | 0 |
| Jaro | 159/185 | 13 |
| Jaro-Winkler | 126/185 | 1 |
| Longest common subsequence | 174/185 | 3 |
| Trigram Jaccard | 163/185 | 22 |
| Bigram Dice | 166/185 | 24 |
| Trigram cosine | 164/185 | 26 |
| Ratcliff-Obershelp | 174/185 | 3 |
| Ordered token hybrid | 165/185 | 17 |

These values are recorded observations, not required outputs for a reconstruction with different inputs. The edit methods made the same acceptance decisions in this experiment. Their additional scoring rules did not improve accepted results here, although their distances differ on the worked transposition example.

Levenshtein was the selected reference policy, with minimum similarity 0.88, margin 0.04 and no edit cap. A recorded optimized run on November 7, 2026 at 11:27 Pacific Standard Time measured about 62 microseconds per ten-property lookup for Levenshtein, versus about 71 for the two swap variants and 330 for weighted edits. These were host-specific synthetic probe timings and must be regenerated after implementation changes.

### K01.3. Findings explained through real strings

Levenshtein correctly recovered `default request timeout miliseconds` as `DefaultRequestTimeoutMilliseconds`.

For `maximumconcurrentrequestscmunt`, its intended plural-count target scored about 0.967 and the runner-up about 0.933. The lead of about 0.033 was below the 0.04 margin, so the resolver returned ambiguity rather than guessing.

Longest common subsequence and Ratcliff-Obershelp accepted the unknown `default request timeout nanoseconds` as `DefaultRequestTimeoutSeconds`. Jaro-Winkler accepted the incomplete `application environment` as `ApplicationEnvironmentName`. Gram methods accepted reordered names that this dataset intentionally labels unknown.

These examples explain why spelling overlap and a high score can still be unsafe. Distinguish an observed association from a causal explanation: different calibrated policies contribute to these outcomes.

### K01.4. Practical recommendation

Recommend from the current measured run, never from the method's reputation. In the recorded reference experiment, Levenshtein provided the recovery of the more complex edit methods with lower measured cost. That supports choosing the simpler method for the original schema under that policy.

Keep exact normalized matching first. Preserve rejections and show suggestions for correction. Where silent mistakes are unacceptable, use exact-only automatic binding and fuzzy suggestions for human review. Reviewed aliases may help known abbreviations, but they are a separate feature and must not be inferred by character similarity.

A new schema, typo population or severity model requires representative calibration and a fresh hold-out. Synthetic scaling timings do not establish safe automatic correction in larger registries.

---

## L02. Project structure, interfaces and commands

### L02.1. Reference organization

Place headers beside the source they describe. The shared header is `src/pm.h`; do not recreate a separate `include/` hierarchy. Algorithm modules may share that header. Keep active utilities separate from completed one-time migrations.

```text
property-match-benchmark/
  README.md
  AGENTS.md
  Makefile
  Doxyfile
  .gitignore
  astro.config.mjs
  package.json
  package-lock.json
  src/
    pm.h
    banned.h
    main.c
    parser.c
    normalization.c
    configuration.c
    resolver.c
    dataset.c
    evaluation.c
    benchmark.c
    report.c
    sanitizer_options.c
    algorithms/
      algorithms.c
      edit.c
      jaro.c
      lcs.c
      grams.c
      ratcliff.c
      hybrid.c
  tests/
    test_suite.c
    test_banned.sh
    calibration_cases.csv
    evaluation_cases.csv
    baseline/
  scripts/
    annotate_results.py
    prepare_starlight.py
    build_docs.py
    verify_regression.py
    check_starlight.py
    check_docs.py
    check_layout.mjs
  ad-hoc/
  docs/
    algorithms.md
    methodology.md
    learning-resources.md
    measured-results.md
    reader-site.md
    standard-library-review.md
    review.md
    site.json
  web/
    file-notes/
    components/
    pages/
    styles/
  public/
    diagrams/
    licenses/
  licenses/
  reports/
  dist/
```

`dist/` is generated, ignored by Git and included in release archives. Astro-generated content, source indexes, raw downloads and offline mirrors are also rebuildable outputs. Keep manifests, reference evidence, documentation configuration, dependency lockfile and required licenses under version control.

### L02.2. Shared scorer interface

Prepared input contains joined normalized text and ordered tokens. Cached properties contain canonical name, normalized name, tokens, type and required flag.

```c
typedef double (*ScoreFunction)(const Prepared *, const Property *);

typedef struct {
    const char *id;
    const char *name;
    ScoreFunction score;
    const char *definition;
    const char *complexity;
    size_t workspace;
} Algorithm;
```

Use stable IDs `EXACT` and `ALG01` through `ALG12`. Entry zero is the exact baseline. Algorithms consume borrowed read-only input; returned scores do not authorize binding. The resolver, calibration and benchmark must call the registered interface consistently.

### L02.3. CLI behavior

Support `--help`, `--list-algorithms`, `--self-test`, `--benchmark`, `--generate`, `--seed`, `--repetitions`, `--wrong-cost`, `--reject-cost`, `--report` and `--csv`.

```sh
make
make test
make sanitize
./property_match_tests --benchmark --repetitions 1 \
  --report reports/sanitizer_evaluation.md --csv reports/sanitizer_results.csv
./property_match_bench --benchmark --seed 42 --repetitions 7 \
  --report reports/evaluation.md --csv reports/results.csv
make feedback
make verify
```

The full sanitizer and optimized experiments write companion files in the same `reports/` directory. Run the optimized experiment last before feedback and regression verification so its timings supply the reading-facing observations.

Running without arguments performs the default experiment. `--self-test` runs correctness checks without the experiment. Ordinary benchmark execution also checks correctness before calibrating or ranking.

Validate unknown options, missing values, negative numeric inputs, overflow and trailing junk. Costs and seed accept integers from 0 through 4294967295 in the reference CLI. Repetitions must be 1 through 100. Invalid arguments return a nonzero status.

Run from the project root. The shell examples assume a POSIX-compatible shell; translate environment-variable syntax on other hosts. Create output parent directories before writing. `--report` and `--csv` select the primary Markdown and per-case output files; companion summary, timing and calibration-grid files remain in `reports/`.

Explicit generation replaces the manifests:

```sh
./property_match_bench --generate --seed 123
./property_match_bench --benchmark --seed 123
```

A different seed or dataset version is a different experiment. The delivered baseline comparison and hand-reviewed observation text must not silently follow it without review.

### L02.4. Make targets and compiler flags

Provide `make`, `make test`, `make benchmark`, `make sanitize`, `make clean`, `make banned-check`, `make feedback`, `make verify`, `make docs`, `make docs-check`, `make docs-offline` and optional `make doxygen`.

The normal build uses:

```text
-std=c99 -O2 -Wall -Wextra -Wpedantic -Wconversion -Wshadow
```

The correctness build additionally uses debug information, `-O1`, `-fsanitize=address,undefined` and `-fno-omit-frame-pointer`. Include `src`, compile algorithm and test subdirectories and link the math library. Do not provide an incomplete compile example that omits the algorithm modules.

`make test` must fail on a correctness or required compiler-probe failure. `make benchmark` generates runtime evidence. `make feedback` is a separate Python documentation step. `make clean` removes executables while preserving datasets and recorded evidence.

Keep sanitizer performance outside comparative timings. Document actual compiler version and flags. If LeakSanitizer cannot inspect the execution host, disable only leak checking through a sanitizer-only hook, report that limit and keep AddressSanitizer and UndefinedBehaviorSanitizer active. On a compatible host, support `make -B SANITIZER_LEAKS=1 sanitize` to enable leak checking.

---

## M01. Runtime-generated reports and evidence

### M01.1. Report contents

Generate a readable terminal summary, a complete Markdown report and machine-readable CSVs. The report must contain the following topics, with descriptive headings:

| Topic | Required content |
|---|---|
| Matching findings | measured recommendation, recovery, unsafe assignments and main limitation |
| Environment | actual timestamp, platform, compiler, flags, timer, repetitions, seed, dataset version and registry sizes |
| Algorithms | formulas, preprocessing, complexity, workspace and limitations |
| Methodology | labels, normalization, decision order, calibration split and cost model |
| Accuracy | disjoint counts, defined ratios and category results |
| Runtime | resolution and scoring paths at every registry size, with variability |
| Collisions | confusable properties, rejected suggestions and accepted wrong-target pairs |
| Errors | real successful, rejected and unsafe input examples |
| Thresholds | selected policies, full calibration grid and calibration-only sensitivity |
| Rankings | explicit safety, balanced and performance criteria |
| Recommendation | applicability to the original schema and limits for other schemas |
| Limitations | finite data, synthetic probes, missing measurements and possible future variants |
| Source-linked observations | concise comparisons feeding the articles and code comments in T01 |

Do not insert invented placeholders in the finished output. If a measurement is unavailable, say what was not collected and why. Abort ranking when correctness checks fail; do not present a broken implementation as another legitimate competitor.

### M01.2. Evidence files

| File | Purpose |
|---|---|
| `reports/evaluation.md` | complete measured report |
| `reports/results.csv` | per-case intent, decision, candidates, scores, policy and error classification |
| `reports/summary.csv` | per-method outcome counts and frozen policies |
| `reports/runtime.csv` | both timing paths, registry sizes and latency statistics |
| `reports/calibration_grid.csv` | evaluated calibration policies and their costs |
| `reports/source-feedback.json` | source-observation inputs, timestamp and hashes |
| `reports/regression.json` | detailed behavior and reproducibility checks |
| `reports/regression.md` | concise explanation of verification coverage |
| execution and sanitizer logs | original run diagnostics, separate from conclusions |

Preserve all failing test IDs in per-case evidence. Quote and escape output CSV strings so a diagnostic cannot change the column structure. Use an explicit unavailable marker for absent candidates or scores; for example, `expected_score=-1` means no intended-target score was collected. It must not be confused with a genuine low raw score from a scorer.

### M01.3. Useful numerical detail

Lead with numbers that explain behavior: recovered typos with a denominator, unsafe assignments, edit costs, score margins and relevant lookup time. Do not promote assertion totals, function counts, source-line totals or generated-page counts as conclusions.

A useful explanation is: "The first candidate scored 0.967, but its lead was only 0.033 against the required 0.04, so the key was rejected." An assertion total does not explain that decision and belongs in audit evidence if needed.

Retain sample sizes, repetition settings, compiler flags and hashes where they support reproducibility or interpretation. Keep them in methodology or detailed evidence rather than repeating them beside every conclusion.

Use aligned terminal columns and compact Markdown tables. Plain output must remain readable without ANSI colors or Unicode box-drawing characters. Respect `NO_COLOR` if color is added.

---

## N01. Acceptance criteria

### N01.1. Build and correctness

The complete core must compile as C99 with the documented GCC warnings and no project warnings. Required correctness checks must pass. Sanitizer results must identify coverage and unavailable leak checks accurately.

Parsing, normalization, canonical lookup, ambiguous/unknown/invalid outcomes, typed validation, duplicate detection, required fields and transactional application must satisfy their examples.

### N01.2. Algorithms and independent tests

Implement the exact baseline and all twelve specified methods through the common interface. Test known numeric answers, score ranges appropriate to each formula, identity, symmetry for the selected variants and boundary behavior.

Use an independent shortest-path edit graph for small strings, rather than copying the distance recurrence into the oracle. The reference oracle uses strings over `abc` through length four and checks shorter source/target pairs with and without adjacent-swap edges. Include the `ca -> abc` distinction, digit-weight examples and the weighted score-range counterexample from F03.3.

Check candidate-order independence, ties with zero configured margin, exact-match threshold bypass, unsupported bytes, capacities and rollback. Exercise standard character classification against literal ASCII expectations, not against itself.

### N01.3. Evaluation and reporting

Validate the dataset sizes and category distribution in H02. Calibrate only on the development split, freeze policies before evaluation, and run every method against identical held-out inputs.

Generate real timings, complete per-case evidence, aggregate counts, calibration policies, meaningful error examples and a recommendation derived from measured results. Verify that the aggregate counts agree with the individual classifications.

### N01.4. Documentation and release

The website must be generated by the configured publishing engine, display exact source with the accompanying articles, support the specified reader controls and work at the required mobile viewports. Local links, source downloads, line anchors and search assets must pass checks.

The release must include source, frozen datasets, build/configuration files, licenses, reports and generated HTML. Another user must be able to build the C benchmark with GCC and Make alone, or read the included static documentation without rebuilding it.

---

## O01. Implementation and validation sequence

### O01.1. Establish behavior before benchmarking

Create registry data, bounded parsing, normalization and exact lookup first. Verify the original configuration and distinguish parsing errors from unresolved names. Add type validation, duplicates, required properties and atomic application.

Implement the algorithm library with known-answer and independent checks. Construct and audit the calibration and held-out manifests before any policy selection. Confirm IDs, labels, schema references, category coverage and split separation.

### O01.2. Run the experiment

Calibrate all policies, persist the grid and freeze the choices. Evaluate the untouched held-out cases and retain every decision. Measure the warmed optimized implementation separately from correctness instrumentation. Generate Markdown and CSVs from those records.

Review both unsafe accepts and rejected intended names. Explain the selected policy, its mistakes and its applicability; do not replace an inconvenient result with a handcrafted exception.

### O01.3. Improve explanations without changing scoring

Review the complete first-party C codebase, concentrating on algorithm state and low-level data movement. Apply the commenting and refactoring rules in Q01 and standard-library rules in R00.

Preserve a pre-edit baseline of per-case results, summaries, selected policies and calibration output. After readability-only changes, compare those values exactly, regenerate manifests in an isolated directory and rerun appropriate correctness and sanitizer checks. Timing is remeasured, not required to match.

Do not silently update the baseline to hide a regression. A deliberate scoring or label change creates a separately documented experiment and requires new evaluation.

### O01.4. Rebuild and inspect the documentation

Refresh measured observations, build the maintained-engine website and standalone offline reference, and validate source fidelity and links. Inspect desktop, portrait and landscape reading, including source wrapping, navigation controls, text-size persistence and search.

Record failed or unavailable browser checks as limits. Do not substitute a tool-launch attempt for a pass. After fixing an observed layout problem, inspect the corrected behavior.

### O01.5. Review this specification before delivery

Compare the finished document with the original A00-P00 requirements and the implemented behavior. Review each requirement, example and qualification for omission or contradiction. Repeat the review for the later commenting, layout, standard-library, observation and packaging decisions.

Check that every number either defines behavior, identifies an input bound, supports reproducibility or explains a measured finding. Remove decorative statistics and vague claims. Read the complete result again after revisions; do not deliver a collection of change notes in place of the complete specification.

---

## P01. Final deliverables

Deliver the complete C99 source and Makefile, frozen calibration and held-out manifests, correctness and binding tests, runtime-generated report and CSVs, algorithm documentation, this README specification and the contributor guidance in `AGENTS.md`.

Also deliver the documentation-engine configuration, authored file articles, local fonts and licenses, exact diagrams, reusable build/check tools, retained one-time scripts in `ad-hoc/`, and the release archive described in U02.

The work is complete only after the application has actually compiled and run, its evidence has been reviewed, the documentation has been generated and checked, and the archive has been inspected. Source code alone is insufficient.

The user-facing delivery message should link the relevant files and published site when applicable, state the practical changes and any material unresolved limitation, and avoid listing internal verification counters. Provide the complete updated deliverable rather than excerpts or placeholders.

---

## Q01. Source comments, file articles and technical wording

### Q01.1. Literate explanations beside exact code

Provide an article for every first-party file displayed on the documentation site, including C/header files and reusable documentation utilities. Place explanations next to the exact blocks they explain. Keep parsing, normalization, scoring, policy and reporting responsibilities clear.

Start each algorithm explanation with its goal, input representation, the meaning of its state and its returned score. Explain unfamiliar storage or indexing at the place it appears. Do not narrate ordinary assignments or repeat a function name as a comment.

An algorithm article should read as a connected technical explanation, not merely a collapsed function list followed by a source dump.

### Q01.2. Named intermediate values and a worked calculation

Prefer names that explain cumulative costs over nested arithmetic:

```c
int different_letters = input[input_index - 1] != candidate[candidate_index - 1];
double delete_cost = previous[candidate_index] + 1;
double insert_cost = current[candidate_index - 1] + 1;
double replace_cost = previous[candidate_index - 1] + (different_letters ? 1 : 0);
current[candidate_index] = fmin(delete_cost, fmin(insert_cost, replace_cost));
```

Put a small calculation beside that block:

| Finish `ca -> cu` by | Saved smaller problem | Add | Total |
|---|---|---:|---:|
| Delete `a` | `c -> cu` costs 1 | 1 | 2 |
| Insert `u` | `ca -> c` costs 1 | 1 | 2 |
| Replace `a` with `u` | `c -> c` costs 0 | 1 | 1 |

Store 1. The next `t` matches in `cat -> cut`, so the final distance remains 1. Explain that prefix lengths use character counts, while C byte indices start at zero.

A concise source comment should preserve this calculation for readers outside the website:

```c
/* Worked cell, ca -> cu:
 * delete a: cost(c,cu)+1 = 1+1 = 2
 * insert u: cost(ca,c)+1 = 1+1 = 2
 * replace a: cost(c,c)+1 = 0+1 = 1. Keep the cheapest: 1.
 * The next t/t in cat -> cut adds zero, so the final distance is 1. */
```

Keep these worked examples when adding measured findings. Do not replace them with benchmark statistics.

### Q01.3. Explain C representation where it reduces reading effort

Explain that row pointers select existing buffers, `sizeof *pointer` refers to the pointed-to object, exclusive slice ends determine byte counts, `memcpy` does not append a terminator, and `memmove` is needed for overlapping suffix shifts.

For the full edit matrix, explain the extra border and shifted indices. For grams, explain packed windows, sorted runs and presence versus frequency. For Ratcliff-Obershelp, distinguish region-relative offsets from whole-string positions. For calibration and binding, explain storage ownership and the point where application becomes committed.

Refactor only when it improves reading. Introduce a descriptive boolean for a compound condition used once; introduce a helper when it represents a repeated operation or a distinct responsibility. Preserve floating-point evaluation order when renaming calculations so a readability edit does not quietly change scores.

### Q01.4. Headings, references and stable tags

Use headings that identify their subject: "Levenshtein stores edit costs for pairs of prefixes" or "Reject a candidate when its runner-up is too close". Avoid slogans such as "Understand one decision at a time" and generic claims such as "Look at what matters".

Review every authored heading. Prefer normal technical prose, concrete verbs, short paragraphs and examples with an identifiable result. Expand unfamiliar abbreviations at first use. Use normal ASCII punctuation in editable prose and avoid marketing language or decorative emphasis.

Use stable searchable tags such as `PM-Lv2pR6`. Define each tag once and link references back to its definition. Tags must remain useful after line numbers change and be searchable in the website and an editor:

```sh
rg 'PM-Lv2pR6' src tests docs scripts ad-hoc
```

Link relevant primary references in the file articles and explain what to read there. General definitions do not prescribe this project's weights, thresholds, normalization choices or tie rules.

### Q01.5. Contributor guidance

Create `AGENTS.md` with the commenting, acronym, worked-example, reference, library-use, regression and numerical-detail rules. Include the Linux kernel commenting guidance as a reference, while explicitly retaining the short mechanism explanations needed by learners in this project.

The important distinction is between explaining a non-obvious representation and narrating obvious syntax. "These pointers reuse existing rows; no array is copied" is useful context. "Increment the loop counter" usually is not.

### Q01.6. Reference materials and what they explain

Use the following links in the relevant articles, with a sentence explaining their purpose. The implementation's formulas and tests remain authoritative for its particular variants.

| Reference | Read it for |
|---|---|
| [Lloyd Allison: edit distance](https://www.allisons.org/ll/AlgDS/Dynamic/Edit/) | prefix costs, the three edit choices and recycled rows |
| [Jeff Erickson: dynamic programming, section 3.7](https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf) | deriving edit distance through alignments and smaller prefix problems |
| [RapidFuzz: restricted adjacent swaps](https://rapidfuzz.github.io/RapidFuzz/Usage/distance/OSA.html) | the named restricted-distance interface and normalization conventions |
| [RapidFuzz: full Damerau-Levenshtein](https://rapidfuzz.github.io/RapidFuzz/Usage/distance/DamerauLevenshtein.html) | unrestricted distance and the `CA` to `ABC` distinction |
| [Lowrance and Wagner: extension of string correction](https://doi.org/10.1145/321879.321880) | the unrestricted last-occurrence recurrence |
| [NIST: Jaro-Winkler](https://xlinux.nist.gov/dads/HTML/jaroWinkler.html) | matched-character similarity and the common-prefix family |
| [NIST: longest common subsequence](https://xlinux.nist.gov/dads/HTML/longestCommonSubsequence.html) | ordered matches with gaps, unlike contiguous substrings |
| [NIST: Ratcliff/Obershelp](https://xlinux.nist.gov/dads/HTML/ratcliffObershelp.html) | selecting a longest block and repeating on the remaining sides |
| [Stanford: shingling and near duplicates](https://nlp.stanford.edu/IR-book/html/htmledition/near-duplicates-and-shingling-1.html) | window sets and Jaccard overlap; the book uses word windows, while this project uses characters |
| [Stanford: dot products](https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html) | normalized dot products used by cosine similarity |
| [C99 committee draft N1256](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf) | character handling, pointer arithmetic, copying, numeric conversion, sorting and time-library contracts |
| [Linux kernel commenting guidance](https://docs.kernel.org/process/coding-style.html#commenting) | useful purpose/reason comments and restraint against redundant narration |
| [pstack unslop](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md) | reviewing prose for vague claims, padding and formulaic wording |
| [Pinned Git banned header](https://github.com/git/git/blob/7bef658135944d26acf3e1ec9316ca11f4369cf8/banned.h) | the actual prohibited-function macros |
| [Starlight documentation](https://starlight.astro.build/) | maintaining the documentation engine rather than recreating its built-in navigation and search |

Do not describe the weighted keyboard prices or 65/35 hybrid mixture as literature-backed defaults. They are project choices. Avoid copying long explanations from references; write the local example in the project's own terms.

---

## R00. Standard-library review and Git's banned functions

### R00.1. Prefer the appropriate C library operation

Review every first-party C file for handwritten replacements of standard functionality. Use `isspace`, `isalnum`, `isdigit`, case-conversion functions, `strchr`, `memcpy`, `memmove`, `strtol`, `qsort` and `fmin` where their contracts match the required behavior.

For ASCII whitespace under the retained C locale:

```c
while (key_start < key_end && isspace((unsigned char)line[key_start])) {
    ++key_start;
}
```

The unsigned cast is required because character-classification functions accept an unsigned-character value or EOF. Reject non-ASCII identifier bytes before locale-dependent classification.

Keep justified custom logic. C99 has no standard bounded string-length function, so a bounded scan before `strchr` remains appropriate. PascalCase tokenization, schema-collision checks and transactional binding are application logic, not replacements for standard-library functions.

Do not substitute compiler extensions or nonstandard convenience functions into the portable core without an isolated, documented fallback.

### R00.2. Vendor and enforce the upstream header

Include the unmodified Git `banned.h` at `src/banned.h`. The reference copy is pinned to upstream commit `7bef658135944d26acf3e1ec9316ca11f4369cf8`, with SHA-256:

```text
cd92ffebcbf514fb57a2b971ffa0af5be9a284f9eff89c336d9eebc2d6714bcc
```

Retain the upstream license and provenance under `licenses/`. Do not edit the header to permit a convenient call. A different upstream revision must be an explicit reviewed dependency update.

Include system headers before `pm.h`; include `banned.h` at the end of the shared project header. This prevents the macros from rewriting system declarations while still enforcing bans throughout project translation units.

For a new reconstruction, compile with the header before fixing prohibited calls and preserve actual diagnostics. If the initial source is already clean, record that fact and use intentional negative probes; do not invent a failed build or add an unsafe call to production merely to manufacture evidence.

### R00.3. Replacements and compiler probes

Replace unbounded string copies with capacity-checked operations. Use `memcpy` only after proving bounds and non-overlap; use `memmove` for overlapping mutation suffixes. Avoid replacing one banned function with another or hiding a call behind a wrapper.

Use isolated `gmtime_r` for UTC formatting where POSIX is supported. If only the permitted C99 library is available and the ban prevents a reentrant conversion, report the timestamp as unavailable rather than bypassing the ban.

`make banned-check` must compile isolated snippets for prohibited calls, require failure for the intended ban diagnostic and fail if a call unexpectedly compiles. An unrelated missing-header error is not a successful probe.

Preserve the initial compiler log and a concise replacement rationale. Keep vendor-file explanations in an article instead of modifying the vendored bytes.

---

## S02. Static documentation website and reader controls

### S02.1. Publishing engine and configuration

Use Astro Starlight for the main site. Keep its routing, search, theme support and responsive navigation; customize the necessary components and CSS instead of replacing the engine with a handwritten main-site renderer.

The delivered dependency snapshot uses Astro 7.4.7, Starlight 0.42.10 and the checked-in package lock. Preserve tested versions for reproduction; upgrades require fresh build and layout checks. The snapshot requires Node 22.23.4 or later as declared in `package.json`, and Python 3.9 or later for preparation and verification. Documentation generation using local timezone names also requires timezone data available to Python.

Keep `astro.config.mjs`, `package.json`, the lockfile, source inventory, components, styles and build scripts in the source. Disable Astro telemetry in build and development commands with `ASTRO_TELEMETRY_DISABLED=1`.

Doxygen is an optional conventional API/source view configured by `Doxyfile`; it is not the main reader experience. The separate lightweight offline renderer is retained only for direct-from-disk reading.

### S02.2. Source fidelity and navigation

Author file explanations in `web/file-notes/`. Bind sections to literal source anchors:

```text
<!-- at: /** [PM-Lv2pR6] -->
```

Anchors must occur exactly once and in source order. The generator must reject missing, obsolete or unordered anchors, missing articles and duplicate source coverage. Render each actual source line exactly once across the article, with stable `L1`, `L2` and later line anchors and a complete raw-source download.

Do not maintain a second manually copied source listing in the article. Escape source before adding highlighting and links. Verify both the rendered text and raw downloads against the actual file bytes.

Source articles suppress the right-hand contents column to leave more room for code. Other guide pages may use Starlight's normal page contents. Provide grouped navigation for configuration processing, algorithms, source references, tests and reports. Include Pagefind full-text search, local reference-tag links, per-page contents where helpful and a source-file index. Do not display total source-line counts.

### S02.3. Width, fonts and always-wrapped code

Source articles must use the available main column with modest side gutters, approximately 16-32 pixels at normal desktop settings. Avoid a centered narrow code panel surrounded by large empty margins. Keep prose to a readable line length while allowing source blocks more width.

Always wrap source lines, including long identifiers and comments. Remove the source-wrapping toggle and the Reading settings panel. Line numbers remain navigation aids, not a source-size statistic.

Serve Atkinson Hyperlegible for body text and JetBrains Mono for code from local assets, with their licenses. Preserve legible light, dark and system theme behavior.

### S02.4. Visible text size and sidebar controls

Place a clearly labeled text-size control beside search. The reference choices are 18, 20 and 22 pixel body text; code scales with the selection. Keep the control visible on small screens.

Put Hide/Show on the navigation itself. On desktop, Hide collapses the sidebar to a narrow Show rail. Keep its controls sticky when navigation links scroll.

Make desktop navigation resizable by dragging its right edge. Provide a focusable keyboard separator: Left/Right adjust width, Shift increases the step, and Home restores the default. The reference default is 272 pixels, with a 200-pixel minimum and a maximum of 420 pixels or 42% of the viewport, whichever is smaller within the supported desktop range.

Persist text size, collapse state and width in browser storage. A failed storage operation must not break current-page controls. Ignore retired wrapping/focus settings. Reader preferences must not be sent to a service.

Use the reference 50rem breakpoint for desktop navigation. Below it, use Starlight's menu behavior rather than a permanently occupied desktop sidebar. Do not force desktop resizing controls into the mobile menu.

### S02.5. Diagrams and accessibility

Use small exact diagrams for relationships such as the three predecessor cells or the resolution decision. Keep labels tied to the nearby calculation. Store diagrams as inspectable SVG or another precise representation; do not use generated raster art for a mathematical diagram that must be exact.

Provide useful alternative text, visible keyboard focus, labeled controls, a skip link, sufficient contrast and reduced-motion behavior. Make long tables scroll locally rather than widening the entire document.

### S02.6. Desktop, portrait and landscape checks

Inspect the site at a desktop width and at least these CSS viewports: portrait 390x844, landscape 844x390 and small portrait 320x640. Check wrapping, page overflow, search, theme readability, mobile menu links, visible text size, persistence, sidebar collapse and desktop resizing.

A browser frame with measured CSS dimensions is a responsive-layout test, not physical-device or touch emulation. State that distinction. If an automated browser cannot launch, preserve the failure and use an available interactive browser where possible; do not report unavailable automation as a pass.

The reference review found that scrolling navigation could move Hide out of view in landscape. Sticky navigation controls are part of the corrected design and must be rechecked after layout changes.

### S02.7. Build and standalone reading

```sh
npm ci
npm run build
npm run check:docs
make docs-offline
python3 scripts/check_docs.py
```

The main output is `dist/`. Its standalone mirror is `dist/offline/`; `make docs-offline` can also generate the separate `offline/` directory.

Open `dist/offline/index.html` directly for the lightweight reference. For the complete Starlight site, serve the generated directory:

```sh
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`. Local fonts, diagrams, source and ordinary navigation must be included. External reference links require internet access. Do not claim that every full-site search feature works under `file://`.

---

## T01. Feed measured results back into algorithm explanations

### T01.1. Recorded evidence, not hand-entered benchmark claims

After a completed standard run, `make feedback` must update clearly marked observation blocks in algorithm comments and file articles. Documentation preparation also refreshes them from the existing report.

The reference feedback utility consumes the standard paths `reports/evaluation.md`, `reports/results.csv`, `reports/summary.csv` and `reports/runtime.csv`. Custom `--report` or `--csv` paths do not automatically redirect it; use the standard paths or explicitly adapt all input paths together.

Read per-case outcomes, summary counts, frozen policies, runtime data and the run timestamp. Verify consistency before generating prose. Record input hashes and selected example IDs in `reports/source-feedback.json`.

This step changes explanations only. It must not run a different scorer, tune policies, edit labels or replace a worked calculation with statistics. Keep it outside timed intervals and outside the C benchmark's dependency chain.

### T01.2. Content of an observed-results section

Lead with the useful tradeoff, give the relevant recovery denominator and unsafe count, compare with a named alternative, then show actual successful or problematic strings. Include rounded median lookup time where it helps explain cost, with registry size and units written clearly.

An example based on the reference run is:

> Levenshtein recovered 174 of 185 typos with no observed unsafe acceptance. The two swap variants and weighted method accepted the same inputs in this run. The added edit rules therefore did not improve accepted results on this dataset.

Follow with the milliseconds recovery and the rejected near-collision example from K01. Show a score difference when that explains rejection. A rejected suggestion is not an incorrect automatic assignment.

Describe timings as separate synthetic lookup probes on the recorded host, not measurements of the nearby example string. Explain that a microsecond is one millionth of a second where useful. Round reading-facing values; retain raw precision in CSV evidence.

Date observations. Keep the machine timestamp in UTC and make the reader-facing timezone explicit. The reference guide uses `America/Los_Angeles`; a republished project may deliberately choose and document another timezone. Never print local time as UTC.

### T01.3. Regeneration and invalidation

Use stable method IDs and case IDs to select examples, but read the strings, scores and outcomes from the current files. Replace only marked generated sections and make the operation idempotent for unchanged inputs.

If a new dataset or policy invalidates a hand-reviewed comparative interpretation, stop for review or omit that interpretation with an explicit explanation. Do not keep an old conclusion attached to new numbers. A missing or inconsistent measurement is unavailable, not zero.

Keep the compact cross-method comparison in `docs/measured-results.md` and link to individual implementation articles. Include a source-linked observations section in the report. Avoid repeating the full report in every article.

---

## U02. Publication, packaging and handoff

### U02.1. Publishing configuration

Make the generated static output deployable to ordinary static hosting. Keep the site origin and any hosting configuration explicit. The reference output assumes deployment at an origin root. Moving to another domain requires changing the configured origin and rebuilding.

Hosting under a prefix, such as `https://example.com/property-guide/`, also requires prefix-aware authored links, generated source URLs, raw downloads, search assets and stylesheet/script paths. Do not assume changing Astro's base setting repairs custom root-relative links such as `/code/src-algorithms-edit-c/`. Rebuild and verify the complete site at the destination prefix, or deploy at an origin root.

Provider-specific project identifiers belong to hosting metadata, not algorithm logic or a requirement to use the original host. Do not embed credentials, private access tokens or machine-specific paths in a release.

Publish only when requested or authorized for that delivery. Preserve an existing site's audience unless instructed otherwise. When the user says they will publish manually, deliver the files and instructions without changing the live site.

### U02.2. Complete release archive

Create a ZIP containing the complete project source, README specification, `AGENTS.md`, Makefile, frozen manifests, tests, documentation sources and configuration, dependency lockfile, licenses, measured report/CSVs and generated `dist/` HTML output.

Include a short `OPEN-WEBSITE.txt` with the two local-reading options from S02.7. Include release metadata tying the archive to its source revision and recorded run. The archive must be useful without access to the assistant's workspace or the original hosting provider.

Exclude `.git/`, credentials, installed `node_modules/`, caches, temporary browser files and machine-specific executables. Keep these exclusions in `.gitignore` where appropriate. Ignoring `dist/` in source control must not cause it to be omitted from the ZIP.

Keep completed one-time editorial scripts in `ad-hoc/` with their purpose recorded. Do not make them part of the normal build. Keep reusable report, feedback, documentation and verification tools in `scripts/`.

### U02.3. Release verification and delivery wording

Verify archive integrity and compare included source and generated HTML with the checked build. Confirm the entry pages, local assets, manifests and required licenses are present. Do not package stale HTML generated before the latest source comments or observed-results refresh.

Preserve complete machine-readable evidence, but describe the release in terms of what a reader can understand and reproduce. A useful handoff links the README, source archive and website as applicable, explains the measured tradeoff and identifies a material limitation. It does not advertise how many assertions, functions or HTML pages were produced.

The final criterion is empirical and practical: another developer or model can rebuild the evaluation, understand the algorithms beside their C implementation, inspect real unsafe matches, and choose a policy from measured evidence without treating fuzzy similarity as proof of the user's intent.
