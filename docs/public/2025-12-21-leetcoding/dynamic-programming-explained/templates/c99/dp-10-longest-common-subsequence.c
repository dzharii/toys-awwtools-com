/*
Title: Longest Common Subsequence
Problem: Given two strings, return the length of their longest common subsequence (not necessarily contiguous).
Constraints: 1 <= length <= 15, lowercase letters
Examples:
- Input: "abcde" and "ace" => Output: 3
- Input: "abc" and "abc" => Output: 3
- Input: "abc" and "def" => Output: 0
Edge cases: No common characters.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int passed = 0;
static int failed = 0;

#define ASSERT_INT_EQ(actual, expected, msg) do { \
  if ((actual) != (expected)) { \
    failed += 1; \
    printf("FAIL: %s (expected %d, got %d)\\n", msg, (expected), (actual)); \
  } else { \
    passed += 1; \
  } \
} while (0)

#define ASSERT_BOOL_EQ(actual, expected, msg) ASSERT_INT_EQ((actual) != 0, (expected) != 0, msg)

static unsigned int seed = 123456789u;
static unsigned int lcg(void) {
  seed = seed * 1664525u + 1013904223u;
  return seed;
}

static int rand_int(int min, int max) {
  return min + (int)(lcg() % (unsigned int)(max - min + 1));
}


int solve(const char *a, const char *b) {
  // TODO: implement
  return 0;
}


static int ref_solve(const char *a, const char *b) {
  int m = (int)strlen(a);
  int n = (int)strlen(b);
  int *dp = (int *)calloc((m + 1) * (n + 1), sizeof(int));
  for (int i = 1; i <= m; i += 1) {
    for (int j = 1; j <= n; j += 1) {
      int idx = i * (n + 1) + j;
      if (a[i - 1] == b[j - 1]) dp[idx] = dp[(i - 1) * (n + 1) + j - 1] + 1;
      else {
        int up = dp[(i - 1) * (n + 1) + j];
        int left = dp[i * (n + 1) + j - 1];
        dp[idx] = up > left ? up : left;
      }
    }
  }
  int ans = dp[m * (n + 1) + n];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  ASSERT_INT_EQ(solve("abcde", "ace"), 3, "deterministic");
  ASSERT_INT_EQ(solve("abc", "abc"), 3, "deterministic");
  ASSERT_INT_EQ(solve("abc", "def"), 0, "deterministic");
  ASSERT_INT_EQ(solve("aggtab", "gxtxayb"), 4, "deterministic");
  ASSERT_INT_EQ(solve("aaaa", "aa"), 2, "deterministic");
  ASSERT_INT_EQ(solve("ab", "ba"), 1, "deterministic");

}

static void test_random(void) {

  const char letters[] = "abc";
for (int t = 0; t < 20; t += 1) {
  int len1 = rand_int(1, 6);
  int len2 = rand_int(1, 6);
  char a[8];
  char b[8];
  for (int i = 0; i < len1; i += 1) a[i] = letters[rand_int(0, 2)];
  a[len1] = '\0';
  for (int j = 0; j < len2; j += 1) b[j] = letters[rand_int(0, 2)];
  b[len2] = '\0';
  int expected = ref_solve(a, b);
  ASSERT_INT_EQ(solve(a, b), expected, "random lcs");
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

