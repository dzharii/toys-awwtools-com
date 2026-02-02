Levenshtein Distance

Scope
This article defines the Levenshtein distance, explains its algorithmic foundations, and specifies a correct C99 implementation. The scope includes problem definition, dynamic programming formulation, correctness reasoning, complexity analysis, and common student errors. Topics such as approximate string matching optimizations, weighted edit costs, and Unicode normalization are out of scope.

Definition
Levenshtein distance is the minimum number of single character edits needed to transform one string into another string. The permitted edits are insertion, deletion, and substitution. Each edit has a unit cost of one.

The distance is symmetric and non negative. A distance of zero means the strings are identical.

Problem statement
Given two finite strings s and t over the same alphabet, compute the minimum total cost required to transform s into t using insertions, deletions, and substitutions. The algorithm must guarantee optimality, meaning no other valid sequence of edits has a smaller total cost.

Conceptual model
The algorithm compares prefixes of the two strings rather than the full strings at once. A prefix is the first k characters of a string, where k may be zero.

At each prefix pair, the algorithm asks a single question. What is the cheapest way to transform one prefix into the other. The answer depends only on smaller prefix pairs.

This optimal substructure property makes the problem suitable for dynamic programming.

Dynamic programming formulation
Let dp[i][j] denote the Levenshtein distance between the first i characters of s and the first j characters of t. The index i ranges from zero to the length of s. The index j ranges from zero to the length of t.

The value dp[i][j] represents a fully solved subproblem.

Base cases
When i equals zero, the source prefix is empty. Transforming an empty string into a prefix of length j requires j insertions. Therefore dp[0][j] equals j.

When j equals zero, the target prefix is empty. Transforming a prefix of length i into an empty string requires i deletions. Therefore dp[i][0] equals i.

These base cases anchor the dynamic programming table and prevent undefined access.

Recurrence relation
For i greater than zero and j greater than zero, the algorithm considers the last edit applied to reach dp[i][j]. Exactly one of three edits must occur.

Deletion removes the last character of the source prefix. Its cost is dp[i - 1][j] plus one.
Insertion adds the last character of the target prefix. Its cost is dp[i][j - 1] plus one.
Substitution replaces the last character of the source prefix with the last character of the target prefix. Its cost is dp[i - 1][j - 1] plus zero if the characters match, or one if they differ.

The value dp[i][j] equals the minimum of these three costs. This recurrence is complete and deterministic.

State transition diagram
The following diagram shows the dependency graph for a single table cell.

```mermaid
flowchart TD
    A[dp[i-1][j]] --> D[dp[i][j]]
    B[dp[i][j-1]] --> D[dp[i][j]]
    C[dp[i-1][j-1]] --> D[dp[i][j]]
```

The diagram shows that each cell depends only on its left, upper, and upper left neighbors. This property defines the valid iteration order.

Algorithm order
The dynamic programming table must be filled in an order that respects dependencies. A common choice is row major order starting from dp[0][0]. When computing dp[i][j], the states dp[i - 1][j], dp[i][j - 1], and dp[i - 1][j - 1] must already be initialized.

Time and space complexity
Let n be the length of s and let m be the length of t. The algorithm computes one table entry for each pair of prefixes. The total number of updates is n multiplied by m. The time complexity is O(nm).

Storing the full table requires (n plus one) times (m plus one) cells. The space complexity is O(nm).

Space optimization
Each table row depends only on the previous row. The algorithm can reuse memory by storing only two rows at a time. This reduces space complexity to O(m) while preserving correctness.

This optimization does not change the recurrence relation or the final result.

C99 implementation
The following function computes the Levenshtein distance using a full dynamic programming table. It follows the recurrence exactly and uses only C99 defined behavior.

```c
#include <stddef.h>
#include <string.h>
#include <stdint.h>

static size_t min3(size_t a, size_t b, size_t c)
{
    size_t m = a < b ? a : b;
    return m < c ? m : c;
}

size_t levenshtein_distance(const char *s, const char *t)
{
    size_t n = strlen(s);
    size_t m = strlen(t);

    size_t dp[n + 1][m + 1];

    for (size_t i = 0; i <= n; i++) {
        dp[i][0] = i;
    }

    for (size_t j = 0; j <= m; j++) {
        dp[0][j] = j;
    }

    for (size_t i = 1; i <= n; i++) {
        for (size_t j = 1; j <= m; j++) {
            size_t cost = s[i - 1] == t[j - 1] ? 0 : 1;
            dp[i][j] = min3(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[n][m];
}
```

This code uses a variable length array. This feature is defined by C99 but may have stack size limits. Large inputs may require heap allocation.

Common pitfalls
Students often confuse prefix indices with character indices. The index i refers to a prefix length. The expression s[i - 1] accesses the last character of that prefix.

Another frequent error is incorrect table initialization. Failing to initialize the zero row or zero column breaks the recurrence.

Filling the table in an invalid order causes reads from uninitialized memory, which results in undefined behavior.

If this still feels confusing
This section restates the algorithm using a concrete example and explicit state changes.

Example
Let s be "cat" and let t be "cut". Both strings have length three.

Initial state
The table has four rows and four columns. Row zero and column zero represent empty prefixes.

dp[0][0] equals zero.
dp[0][1] equals one.
dp[0][2] equals two.
dp[0][3] equals three.

dp[1][0] equals one.
dp[2][0] equals two.
dp[3][0] equals three.

Step one
Compute dp[1][1]. Compare the prefixes "c" and "c". The characters match, so substitution has zero cost. The minimum cost is zero.

Step two
Compute dp[1][2]. Compare prefixes "c" and "cu". The characters differ. The cheapest operation is insertion, giving a cost of one.

Step three
Compute dp[2][2]. Compare prefixes "ca" and "cu". One substitution changes 'a' to 'u'. The cost is one.

Final state
After filling the table, dp[3][3] equals one. A single substitution transforms "cat" into "cut".

At each step, the algorithm chooses the smallest valid edit cost based on already computed prefixes. No future information is required.

Exercises
Modify the implementation to use two rows instead of the full table.
Add input validation to handle null pointers.
Explain why swapping s and t does not change the result.

Outcome
After reading this article, a student can define Levenshtein distance, explain its dynamic programming formulation, implement it correctly in C99, and reason about its correctness, complexity, and common failure modes.
