/*
Title: Unique Paths
Problem: A robot starts at the top-left of an m x n grid and can move only right or down. Return the number of unique paths to the bottom-right.
Constraints: 1 <= m, n <= 10
Examples:
- Input: m=3,n=7 => Output: 28
- Input: m=3,n=2 => Output: 3
- Input: m=3,n=3 => Output: 6
Edge cases: Single row or single column.

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


int solve(int m, int n) {
  // TODO: implement
  return 0;
}


static int ref_solve(int m, int n) {
  int *dp = (int *)malloc(sizeof(int) * m * n);
  for (int r = 0; r < m; r += 1) dp[r * n] = 1;
  for (int c = 0; c < n; c += 1) dp[c] = 1;
  for (int r = 1; r < m; r += 1) {
    for (int c = 1; c < n; c += 1) {
      dp[r * n + c] = dp[(r - 1) * n + c] + dp[r * n + c - 1];
    }
  }
  int ans = dp[m * n - 1];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  ASSERT_INT_EQ(solve(3, 7), 28, "deterministic");
  ASSERT_INT_EQ(solve(3, 2), 3, "deterministic");
  ASSERT_INT_EQ(solve(3, 3), 6, "deterministic");
  ASSERT_INT_EQ(solve(1, 5), 1, "deterministic");
  ASSERT_INT_EQ(solve(2, 2), 2, "deterministic");
  ASSERT_INT_EQ(solve(2, 3), 3, "deterministic");

}

static void test_random(void) {

  for (int t = 0; t < 30; t += 1) {
  int m = rand_int(1, 8);
  int n = rand_int(1, 8);
  int expected = ref_solve(m, n);
  ASSERT_INT_EQ(solve(m, n), expected, "random grid");
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

