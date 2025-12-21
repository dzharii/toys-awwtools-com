/*
Title: Decode Ways
Problem: Given a digit string s, count the number of ways to decode it where 1->A, 2->B, ..., 26->Z.
Constraints: 1 <= s.length <= 20, digits only
Examples:
- Input: "12" => Output: 2
- Input: "226" => Output: 3
- Input: "06" => Output: 0
Edge cases: Leading zeros, invalid pairs.

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


int solve(const char *s) {
  // TODO: implement
  return 0;
}


static int ref_solve(const char *s) {
  int n = (int)strlen(s);
  int *dp = (int *)calloc(n + 1, sizeof(int));
  dp[0] = 1;
  dp[1] = s[0] == '0' ? 0 : 1;
  for (int i = 2; i <= n; i += 1) {
    if (s[i - 1] != '0') dp[i] += dp[i - 1];
    int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
    if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
  }
  int ans = dp[n];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  ASSERT_INT_EQ(solve("12"), 2, "deterministic");
  ASSERT_INT_EQ(solve("226"), 3, "deterministic");
  ASSERT_INT_EQ(solve("06"), 0, "deterministic");
  ASSERT_INT_EQ(solve("11106"), 2, "deterministic");
  ASSERT_INT_EQ(solve("10"), 1, "deterministic");
  ASSERT_INT_EQ(solve("27"), 1, "deterministic");

}

static void test_random(void) {

  const char digits[] = "01234";
for (int t = 0; t < 25; t += 1) {
  int len = rand_int(1, 8);
  char s[10];
  for (int i = 0; i < len; i += 1) s[i] = digits[rand_int(0, 4)];
  s[len] = '\0';
  int expected = ref_solve(s);
  ASSERT_INT_EQ(solve(s), expected, "random decode");
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

