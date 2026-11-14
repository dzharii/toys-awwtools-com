# Catalog research audit

Reviewed November 13, 2026. This first edition contains 74 problems: 73 officially Medium and one officially Hard. The pool screened was 114 individually retrieved problem writeups, including 13 Hard candidates. This is a curated first edition, not a claim that every qualifying LeetCode problem has been found. The supplied research conversation was used to discover candidates, not to establish truth or inherit its ease judgments.

## Definition of an approachable problem

The target reader writes JavaScript and already understands loops, arrays, strings, numeric sorting, Map, Set, elementary indexing, and basic linked-list operations. Elementary level-order traversal is acceptable when it can be implemented with current/next-level arrays. Familiarity with a specialized algorithm is not assumed. A short published implementation alone never establishes low difficulty.

Discovery and implementation are scored independently from 1 to 5. Discovery 1 means directly translate the statement or enumerate a small explicitly bounded search space. Discovery 2 permits one elementary decomposition, representation, or local argument whose correctness can be explained in a short paragraph. Discovery 3 or higher involves a nonobvious invariant, reduction, proof, or specialized pattern. Implementation 1 means a direct scan or ordinary built-in operations with few cases. Implementation 2 permits several straightforward passes, counters, simple parsing, or elementary traversal. Implementation 3 or higher involves interacting invariants, difficult boundaries, custom advanced data structures, or substantial grammar/state complexity. Admission requires both scores at most 2.

These scores are editorial judgments about the documented qualifying approach, not measured success rates or guarantees that every person will find a problem easy. Long but literal bookkeeping is acceptable. Optional harder follow-ups do not disqualify an otherwise valid elementary approach; a mandatory time or space requirement does.

## Verification performed

For each admitted entry, the official LeetCode problem page was retrieved through the web reader or search index and its ID, title, difficulty, statement, and relevant constraints were checked. Direct executor HTTP requests to LeetCode returned 403; that restriction was not bypassed. All 74 entries have official-page evidence rather than relying solely on repository difficulty labels. The `officialEvidence` field identifies the retrieved official page and source reference. Each entry also includes the official URL in `sources`.

Full solution-author writeups and their implementations were retrieved from Doocs' own GitHub repository. Every cached writeup matches its Git blob digest in repository tree snapshot `3e974d9e6912b6fd2a09f8a506b56d0d1e500c6c`. Evidence URLs in `research.json` pin that snapshot, so later repository edits do not silently change the reviewed evidence. Implementations, constraints, correctness reasoning, JavaScript numeric limits, and optional-versus-mandatory follow-ups were considered. Individual admission reasoning, complexity, and prerequisites are recorded separately from spoiler-free public summaries.

No implementation was submitted to LeetCode during this review. Source-author implementations are evidence of an approach, not a new acceptance claim by this project. For problems 75, 670, 1007, 1472, 1630, 1769, 1823, 2583, 2593, and 3713, the qualifying explanation explicitly chooses an elementary alternative to or variant of the displayed reference implementation. The alternatives were checked for correctness and feasibility against the problem constraints; they are marked in `qualifyingApproach`. This is significant for 670 (at most nine digits), 1769 (at most four million box pairs), and 1823 (at most 500 players), where exhaustive simulation is simpler than the compact optimized reference.

## Hard admission

Problem 42, Trapping Rain Water, qualifies only through the extra-memory approach: compute highest walls from both sides, then calculate each column's contribution. The physical bounding argument is elementary and the implementation is ordinary array scans. Its Hard label remains unchanged. This admission does not claim that the constant-space two-pointer approach is equally easy. The other 12 screened Hard candidates were excluded on discovery or implementation burden.

## Screened candidates not admitted

Deferred entries are not declared unsuitable. They require a separate final metadata/approach review before promotion. This makes the remaining research explicit instead of silently implying completeness.

| ID | Decision | Reason |
|---:|---|---|
| 41 | Reject | The mandatory constant-space requirement rules out the obvious Set approach; cyclic placement needs an additional invariant. |
| 54 | Defer | Spiral traversal is literal, but turning and thin-matrix boundary cases need a fuller implementation-risk review. |
| 59 | Defer | Similar spiral-state and boundary review to 54; not admitted on code length alone. |
| 65 | Reject | The valid-number grammar has several interacting sign, decimal, and exponent cases. |
| 68 | Reject | Space distribution, last-line handling, and single-word formatting exceed the implementation threshold. |
| 135 | Reject | Deriving and proving the two-direction candy allocation is a nontrivial insight. |
| 224 | Reject | Nested expression state and unary signs exceed the implementation threshold. |
| 233 | Reject | Digit DP or place-value counting requires a specialized reduction. |
| 238 | Reject | The no-division, linear-time requirement makes prefix/suffix product discovery less direct than the qualifying baseline. |
| 239 | Reject | Linear-time maxima need a monotonic deque invariant or an equivalent specialized approach. |
| 273 | Reject | Literal translation is plausible, but grammar, grouping, zero handling, and whitespace produce implementation burden above 2. |
| 297 | Reject | Tree encoding/decoding requires a reliable paired format and reconstruction state beyond the basic traversal baseline. |
| 622 | Defer | Circular-queue capacity, wraparound, and empty/full-state behavior need a dedicated implementation review. |
| 654 | Defer | A direct recursive construction may qualify, but recursion/iteration and worst-case shape deserve separate JavaScript review. |
| 1094 | Defer | Small location bounds may permit literal trip coverage counting; verify that alternative and official metadata before promotion. |
| 1109 | Reject | Difference-array discovery is not automatic from the interval-booking statement. |
| 1387 | Defer | Direct simulation is plausible, but guaranteed sequence behavior and computation bounds need explicit final review. |
| 1395 | Reject | The qualifying efficient count needs the less direct middle-element product decomposition. |
| 1402 | Reject | A tiny sorting/suffix-sum implementation hides a substantial selection and ordering proof. |
| 1793 | Reject | Monotonic-boundary or expanding-window reasoning exceeds discovery 2. |
| 2508 | Reject | Odd-degree reduction and exhaustive edge-case pairing need a nonobvious graph-parity argument. |
| 2575 | Defer | Streaming modular arithmetic may qualify for a reader familiar with the remainder recurrence; prerequisite judgment is unresolved. |
| 2671 | Defer | Two-level frequency updates are plausible, but zero counts, absent deletion, and update consistency need a fuller review. |
| 2841 | Defer | Fixed-window sum plus distinct counts may qualify; window-removal bookkeeping needs final review. |
| 2864 | Reject | Official source-author metadata classifies it Easy, outside the requested Medium/Hard scope. |
| 2900 | Reject | Official source-author metadata classifies it Easy, outside the requested Medium/Hard scope. |
| 2958 | Reject | The variable-size frequency window and shrink invariant exceed the selected discovery baseline. |
| 2971 | Reject | Polygon feasibility and proving which sorted prefixes suffice require a separate mathematical reduction. |
| 2974 | Reject | Official source-author metadata classifies it Easy, outside the requested Medium/Hard scope. |
| 3016 | Defer | Frequency-to-key-position assignment may qualify, but the minimum-cost proof needs its own final review. |
| 3101 | Defer | Counting all subarrays from run lengths needs a distinct counting argument, not merely recognizing alternating adjacency. |
| 3191 | Defer | Forced left-to-right flips may qualify after checking the minimality argument and tail behavior. |
| 3192 | Reject | A short parity-state implementation hides why suffix operations can be collapsed and forced. |
| 3301 | Defer | Sorted greedy height assignment needs an explicit optimality review before admission. |
| 3618 | Defer | Prime preprocessing adds a sieve prerequisite not included in the initial baseline; possible later expansion. |
| 3805 | Reject | Canonicalizing cipher-equivalent strings requires a less obvious modular normalization. |
| 3810 | Reject | Counting distinct mismatches is short only after deriving the global-operation reduction. |
| 3853 | Defer | Repeated merges and positions in the evolving string need a careful equivalence review. |
| 3868 | Reject | Frequency cancellation, parity feasibility, and minimum-swap cost require a nontrivial proof. |
| 3904 | Defer | Prefix/suffix extrema appear promising; official metadata and final qualifying-approach review remain outstanding. |

## Maintenance checklist

Before adding a problem, verify official ID/title/difficulty and access requirements; read the statement and constraints without its solution; write down the simplest plausible approach; inspect a solution author's actual implementation; justify feasibility under the maximum constraints; explain correctness without skipping the key observation; score discovery and implementation independently; check JavaScript integer precision, indexing, sort comparators, recursion depth, and queue costs; record alternative approaches and whether they were actually submitted; draft an original short summary without algorithm names, hints, invariants, examples revealing the answer, or solution code; then verify the public projection exposes only ID, title, official difficulty, summary, and original LeetCode link. If any required evidence is missing, defer admission.

A future catalog-completeness claim requires an inventory of the entire official problem universe with each Medium/Hard assigned included, rejected, or pending and a reviewed date. The repository tree was retrieved to locate paths, not to claim that its complete catalog has undergone that review. Premium-only and unavailable candidates also require explicit access checks before admission. All currently admitted problem statements were available from official retrieval without a paid problem-statement wall.

## Public coverage text

74 hand-picked problems: 73 Medium and 1 Hard. Screened 114 candidates. Selected for straightforward reasoning and implementation in JavaScript. This is a reviewed first edition, not an exhaustive catalog. Last reviewed November 13, 2026. No solutions or hints are shown in the practice list.
