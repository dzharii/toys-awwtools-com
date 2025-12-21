/*
Title: Word Break
Problem: Given a string s and dictionary words, determine if s can be segmented into a sequence of dictionary words.
Constraints: 1 <= s.length <= 20, dictionary size <= 10, lowercase letters
Examples:
- Input: s="leetcode", dict=["leet","code"] => Output: true
- Input: s="catsandog", dict=["cats","dog","sand","and","cat"] => Output: false
- Input: s="cars", dict=["car","ca","rs"] => Output: true
Edge cases: Single character, overlapping words.

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


int solve(const char *s, const char **dict, int dictSize) {
  // TODO: implement
  return 0;
}


static int has_word(const char *s, int start, int end, const char **dict, int dictSize) {
  int len = end - start;
  for (int i = 0; i < dictSize; i += 1) {
    if ((int)strlen(dict[i]) != len) continue;
    if (strncmp(s + start, dict[i], len) == 0) return 1;
  }
  return 0;
}
static int ref_solve(const char *s, const char **dict, int dictSize) {
  int n = (int)strlen(s);
  int *dp = (int *)calloc(n + 1, sizeof(int));
  dp[0] = 1;
  for (int i = 1; i <= n; i += 1) {
    for (int j = 0; j < i; j += 1) {
      if (dp[j] && has_word(s, j, i, dict, dictSize)) {
        dp[i] = 1;
        break;
      }
    }
  }
  int ans = dp[n];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  {
    const char *dict[] = {"leet", "code"};
    ASSERT_BOOL_EQ(solve("leetcode", dict, 2), 1, "deterministic");
  }
  {
    const char *dict[] = {"apple", "pen"};
    ASSERT_BOOL_EQ(solve("applepenapple", dict, 2), 1, "deterministic");
  }
  {
    const char *dict[] = {"cats", "dog", "sand", "and", "cat"};
    ASSERT_BOOL_EQ(solve("catsandog", dict, 5), 0, "deterministic");
  }
  {
    const char *dict[] = {"car", "ca", "rs"};
    ASSERT_BOOL_EQ(solve("cars", dict, 3), 1, "deterministic");
  }
  {
    const char *dict[] = {"aaaa", "aaa"};
    ASSERT_BOOL_EQ(solve("aaaaaaa", dict, 2), 1, "deterministic");
  }
  {
    const char *dict[] = {"b"};
    ASSERT_BOOL_EQ(solve("a", dict, 1), 0, "deterministic");
  }

}

static void test_random(void) {

  const char letters[] = "abc";
for (int t = 0; t < 20; t += 1) {
  int dictSize = rand_int(1, 6);
  const char **dict = (const char **)malloc(sizeof(char *) * dictSize);
  char dictStorage[6][6];
  for (int i = 0; i < dictSize; i += 1) {
    int len = rand_int(1, 4);
    for (int k = 0; k < len; k += 1) dictStorage[i][k] = letters[rand_int(0, 2)];
    dictStorage[i][len] = '\0';
    dict[i] = dictStorage[i];
  }
  int sLen = rand_int(1, 8);
  char s[10];
  for (int k = 0; k < sLen; k += 1) s[k] = letters[rand_int(0, 2)];
  s[sLen] = '\0';
  int expected = ref_solve(s, dict, dictSize);
  ASSERT_BOOL_EQ(solve(s, dict, dictSize), expected, "random word break");
  free(dict);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}
