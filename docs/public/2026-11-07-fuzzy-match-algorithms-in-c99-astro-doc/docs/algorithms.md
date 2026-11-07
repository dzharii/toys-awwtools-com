# Similarity formulas and implementation limits

## Scoring inputs, score range and memory allocation

Each scorer accepts a Prepared input and a cached Property and returns a similarity in [0,1]. All valid inputs are nonempty ASCII identifiers of at most 128 bytes before normalization. Every method sees the same registry, normalization and exact-first decision policy. There are no aliases, value-based disambiguation or schema-specific scoring exceptions.

Candidate normalization and tokenization happen once during registry construction. Per-comparison n-grams and edit workspaces are computed inside the scorer; they are not cached across queries. A query's name and tokens are prepared once. Token-aware scoring receives those tokens, while character algorithms use the concatenated normalized text. Every eligible candidate is scored on a fuzzy lookup. Lexical tie ordering determines diagnostic suggestions, and score ties always reject automatic binding.

The fixed arrays use KEY_MAX=128 and TOKEN_MAX=32. Project scorers make no explicit heap allocations. Standard-library `qsort` may allocate internal workspace; C99 does not specify its allocation policy. The normal resolver prepares one query, uses scalar top-two state and reuses scorer stack storage for each candidate. Calibration caches scores separately and is outside the timing path. Complexity uses n/m for character lengths and T/U for token counts. The runtime report supplies sizeof-derived workspace bounds on the actual target. Compiler frame layout may add padding; these are algorithm array sizes rather than measured resident process memory.

## ALG01: Levenshtein insertion, deletion and substitution

Unit-cost insertion, deletion and substitution. A rolling dynamic program stores three rows (the same routine also implements the restricted adjacent-swap method). Similarity is `1 - d / max(n,m)`. Time is O(n*m), workspace O(m). It counts an adjacent swap as two edits and has no semantic model.

## ALG02: Restricted adjacent swaps with Optimal String Alignment

Optimal String Alignment is the formal name for the restricted adjacent-letter-swap method, often abbreviated OSA. The rolling unit-cost edit recurrence additionally considers one adjacent transposition from cell i-2,j-2. A substring cannot be edited repeatedly under this recurrence. Similarity is `1 - restricted_distance / max(n,m)`. Time is O(n*m), workspace O(m). The restricted method is not unrestricted Damerau-Levenshtein and need not satisfy the metric triangle inequality. In the distinguishing test `ca -> abc`, the restricted distance is 3 and the full distance is 2.

## ALG03: Unrestricted Damerau-Levenshtein distance

The Lowrance-Wagner last-occurrence recurrence stores a full (n+2)*(m+2) unsigned-short matrix, 128 last-occurrence indices and a last-match column for the current row. It allows repeated edits and unrestricted adjacent-transposition sequences with unit costs. Time is O(n*m), workspace O(n*m+128). Similarity is `1 - full_distance / max(n,m)`. At the length limit, the maximum sentinel value is 256, fitting unsigned short. The normalized resolver guarantees ASCII before indices are used.

The independent shortest-path oracle exercises repeated edits and transpositions rather than reproducing this recurrence. Length-three pairs over abc are compared with graph distances through intermediate strings of length up to four. This is extensive small-domain evidence, not a proof for every 128-byte input.

## ALG04: Weighted edit costs for letters and digits

Insertion/deletion cost 2 for digits, 1 for letters. Unequal substitutions involving a digit cost 2; horizontally adjacent letters in `qwertyuiop`, `asdfghjkl`, or `zxcvbnm` cost 0.5; all other unequal substitutions cost 1. Equal characters cost zero. Case and separators have already been normalized. The digit substitution model is global and does not assume that version changes are harmless.

Similarity is `1 - weighted_distance / max(weighted_length(a),weighted_length(b))`, where weighted length gives digits weight 2 and letters weight 1. This denominator bounds the optimal distance because aligning the shorter prefix and then inserting/deleting the rest never costs more than the larger weighted length. Two rolling double rows give O(m) workspace and O(n*m) time. Horizontal adjacency is a limited typing model; keyboard geometry, language and context are not learned from evaluation cases.

## ALG05: Jaro character matches and transpositions

The matching window is `max(0, floor(max(n,m)/2)-1)`. Characters are greedily matched to the first unused equal character inside the window. With M matches and H out-of-order matched characters, the score is `(M/n + M/m + (M-H/2)/M)/3`. Zero matches score zero; identical strings score one. The implementation stores two bounded match-flag arrays and scans in O(n*m) worst-case time with O(n+m) workspace. Repeated-character matching can be unintuitive. No prefix bonus is applied.

## ALG06: Jaro-Winkler prefix adjustment

When Jaro > 0.7, add `0.1 * min(common_prefix_length,4) * (1-Jaro)`; otherwise return Jaro unchanged. Complexity and workspace follow Jaro. Long shared prefixes can make closely related names appear more alike even when their suffixes encode different units or meanings. The run calibrates this method separately rather than borrowing edit-distance thresholds.

## ALG07: Longest common subsequence

Two rolling unsigned-short rows compute ordered subsequence length L. Similarity is `2*L/(n+m)`. Time O(n*m), workspace O(m). It rewards order preservation, but widely separated matches can score well even when meaningful words are missing.

## ALG08: Trigram set overlap with Jaccard

Encode each unpadded three-byte gram into a uint32_t, sort with standard C99 `qsort` and merge unique values. Similarity is set intersection divided by set union. Packing and merging take O(n+m); sorting time and extra workspace depend on the C library. The explicit gram arrays use O(n+m) space. Repetition is ignored. Inputs shorter than three characters score zero unless identical. No artificial boundary padding is used.

## ALG09: Bigram set overlap with Dice

Use unpadded two-byte gram sets and score `2*intersection/(set_size_a+set_size_b)`. The same `qsort` and merge implementation applies. Its explicit arrays use O(n+m) space; sorting costs depend on the C library. Unlike trigram Jaccard, this method uses a different feature length and coefficient. It may overvalue character fragments and ignores word order beyond each gram.

## ALG10: Trigram frequency cosine

Keep repeated trigrams as frequency counts. Merge sorted runs to compute dot product and squared norms; return `dot/sqrt(norm_a*norm_b)`. Complexity library-dependent sorting time, workspace O(n+m). Repeated substrings influence this method but not Jaccard or Dice. Short inputs have the same explicit empty-feature policy as the trigram set method.

## ALG11: Ratcliff-Obershelp matching blocks

Find a longest common contiguous block, count it, and repeat for the unmatched regions to its left and right. Similarity is twice the accumulated matched length divided by n+m. Equal-length block ties use the first block under a fixed lexical orientation of the pair, making tie behavior deterministic and symmetric. An explicit bounded region stack replaces recursion, and two rolling substring rows are reused. O((n+m)*n*m) is a conservative time bound; workspace is O(n+m). Greedy block selection is not a minimum-edit alignment.

## ALG12: Ordered token and character alignment

ASCII whitespace, hyphen and underscore split tokens. PascalCase splitting recognizes lowercase-to-uppercase, digit-to-uppercase and acronym-to-word transitions (`HTTPServerURL -> HTTP | Server | URL`). Digits otherwise stay with the surrounding token. This segmentation is deterministic and language-agnostic.

Compute normalized character Levenshtein similarity C. Align the ordered token sequences with unit token gaps and substitution cost equal to `Levenshtein(token_a,token_b)/max(token_lengths)`. Let D be the minimum token-alignment cost. The score is `0.65*C + 0.35*(1-D/max(T,U))`. This is an ordered alignment, not a token set: reordering has a penalty. The mixing weights are fixed implementation choices and never tuned using held-out labels.

A conservative time bound is O(n*m + T*U*L^2) for maximum token length L; rolling token rows plus character-edit workspace use O(U+L) storage. Lowercase concatenated names expose one token, which may hurt this hybrid when canonical names retain PascalCase boundaries. The report measures that limitation directly.

## Exact matching after ASCII normalization

Case folding, removal of supported separators and unique exact lookup only. Time O(R*L), no scoring workspace beyond the shared prepared query. This baseline recovers formatting differences without correction risk from fuzzy similarity. It can still bind a semantically mistaken key that exactly spells another canonical name, a risk no name-only method can infer.

## Algorithm papers and reference definitions

Lowrance, R. and Wagner, R. A. (1975), [An Extension of the String-to-String Correction Problem](https://doi.org/10.1145/321879.321880), JACM 22(2), 177-183. The original paper's unit-cost transposition recurrence motivates ALG03; this implementation is independently authored and additionally checked by the edit graph.

NIST Dictionary of Algorithms and Data Structures, [Jaro-Winkler](https://xlinux.nist.gov/dads/HTML/jaroWinkler.html), describes the matched-character/transposition family and prefix preference. ALG05/06 explicitly document the implemented window, boost and cutoff rather than implying that all published variants are identical.

NIST Dictionary of Algorithms and Data Structures, [Ratcliff/Obershelp pattern recognition](https://xlinux.nist.gov/dads/HTML/ratcliffObershelp.html), describes longest-common-block recursion. ALG11 additionally fixes tie orientation and uses a bounded explicit stack.

## Worked calculations and further reading

The [algorithm explanation guide](docs/learning-resources.md) maps each implementation to primary reference materials and explains what to read there. The file articles place small calculations beside the actual C source, including the three costs for `ca -> cu`, Jaro's three agreements and trigram frequency counts.
