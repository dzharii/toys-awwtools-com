# Algorithm explanations and C reference materials

## Start with one prefix calculation

A prefix is the part of a name read so far. A dynamic-programming table saves answers for those smaller parts, then reuses them. For `cat` and `cut`, the cell for `ca` and `cu` compares deletion, insertion and replacement. Their costs are 2, 2 and 1. That cell stores 1, and the final matching `t` adds zero.

[Lloyd Allison's edit-distance explanation](https://www.allisons.org/ll/AlgDS/Dynamic/Edit/) connects those three choices to table cells and recycled rows. Read the recurrence, then the two-row storage note. Our shared routine keeps a third row for adjacent swaps. [Jeff Erickson's dynamic-programming chapter](https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf), section 3.7, develops the same prefix reasoning with edit alignments. These references explain the method; the examples and comments here are written for this project's C implementation.

## Distinguish the two adjacent-swap distances

Optimal String Alignment, often abbreviated OSA, means the restricted adjacent-letter-swap method here. A swapped substring cannot be edited again under its recurrence. Full Damerau-Levenshtein allows further edits. Both count `ab -> ba` as one edit. Only the full method finds `ca -> ac -> abc` at cost 2; the restricted method returns 3.

[RapidFuzz's restricted-method reference](https://rapidfuzz.github.io/RapidFuzz/Usage/distance/OSA.html) documents its distance and normalization. [Its full-method reference](https://rapidfuzz.github.io/RapidFuzz/Usage/distance/DamerauLevenshtein.html) includes the `CA` to `ABC` example. These are comparison definitions, not runtime dependencies. The full recurrence is described by Lowrance and Wagner in [An Extension of the String-to-String Correction Problem](https://doi.org/10.1145/321879.321880). In our source, the important extra state is the last occurrence of each letter.

## Count matched letters and shared starts

[NIST's Jaro-Winkler entry](https://xlinux.nist.gov/dads/HTML/jaroWinkler.html) describes the matched-character family and the preference for matching starts. Our Jaro article shows the three fractions for `martha` and `marhta`. Our Winkler adapter uses the explicitly documented variant: a 0.1 prefix factor, at most four letters, only when the base score exceeds 0.7. A shared start is evidence of similar spelling, not of equal configuration meaning.

## Separate ordered letters from contiguous blocks

[NIST's longest-common-subsequence definition](https://xlinux.nist.gov/dads/HTML/longestCommonSubsequence.html) explains why gaps are allowed: `abc` and `ac` share the sequence `ac`. The word "longest" means the method keeps as many letters as possible while retaining order. The source function is named `lcs_score`; LCS expands to longest common subsequence.

[NIST's Ratcliff/Obershelp entry](https://xlinux.nist.gov/dads/HTML/ratcliffObershelp.html) describes selecting a common block and repeating on its two sides. A block must be contiguous. Our implementation fixes tie orientation and uses an explicit stack; its score is `2 * selected letters / total letters`. Those implementation choices are stated beside the code.

## Compare windows as sets or frequency vectors

Manning, Raghavan and Schutze's [Introduction to Information Retrieval, section 19.6](https://nlp.stanford.edu/IR-book/html/htmledition/near-duplicates-and-shingling-1.html) explains shingles and Jaccard overlap. Their example uses word windows; this project uses character windows. Our exact gram extraction, boundary policy and Dice coefficient are defined in the source article rather than borrowed from their preprocessing.

[Section 6.3.1 on dot products](https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html) explains cosine as a normalized dot product. Here each coordinate counts one trigram. The worked `aaaba` versus `aaaa` table shows why repeated windows matter to cosine but not set overlap.

## Recognize project-specific variants

Weighted edit costs and the ordered-token hybrid are experiments defined here. The edit-distance recurrence supplies the mechanism; horizontal keyboard neighbors, digit costs and the 65/35 mixture are fixed project choices. They are not universal rules endorsed by the linked references. The hybrid aligns words in order, using character edit costs to price a misspelled word.

## Read C storage and library calls

The public [C99 committee draft with technical corrigenda, N1256](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1256.pdf) is the reference for language and standard-library contracts. Section 6.5.6 covers pointer arithmetic; section 7.4 covers character classification; section 7.21.2 covers `memcpy` and `memmove`; section 7.20.1 covers numeric conversion; section 7.20.5 covers searching and sorting; section 7.23 covers time. It is a reference document, so use the named section rather than reading it end to end.

`memmove` handles overlapping source and destination ranges. `memcpy` requires non-overlapping ranges and copies exactly the requested bytes. Character-classification functions require an unsigned-char value or EOF. `strtol` reports the first unconsumed character as well as range errors. Comments explain those contracts at their call sites.

The [POSIX clock_gettime reference](https://pubs.opengroup.org/onlinepubs/9799919799/functions/clock_gettime.html) documents the monotonic clock used on this host. The isolated fallback uses C99 `clock()` and measures CPU time instead of elapsed wall time.

## Write comments that explain a decision or representation

The [Linux kernel commenting section](https://docs.kernel.org/process/coding-style.html#commenting) emphasizes purpose and reasons and discourages redundant commentary. We apply that restraint, while explaining unfamiliar calculations and storage details needed by learners. The repository's `AGENTS.md` records the rules for future changes. A useful comment answers a concrete question: "What does this cell store?", "Why is this index one larger?", or "Why must this copy include the terminator?"
