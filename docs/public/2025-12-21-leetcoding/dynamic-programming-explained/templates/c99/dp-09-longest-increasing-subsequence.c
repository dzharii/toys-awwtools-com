/*
Title: Longest Increasing Subsequence
Problem: Given an integer array nums, return the length of the longest strictly increasing subsequence.
Constraints: 1 <= nums.length <= 20, -10 <= nums[i] <= 50
Examples:
- Input: [10,9,2,5,3,7,101,18] => Output: 4
- Input: [0,1,0,3,2,3] => Output: 4
- Input: [7,7,7,7] => Output: 1
Edge cases: All equal numbers, already increasing.

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


int solve(const int *nums, int n) {
  // TODO: implement
  return 0;
}


static const int *g_nums;
static int g_n;
static int g_best;

static void dfs_lis(int idx, int last, int has_last, int len) {
  if (idx == g_n) {
    if (len > g_best) g_best = len;
    return;
  }
  dfs_lis(idx + 1, last, has_last, len);
  if (!has_last || g_nums[idx] > last) dfs_lis(idx + 1, g_nums[idx], 1, len + 1);
}

static int ref_solve(const int *nums, int n) {
  g_nums = nums;
  g_n = n;
  g_best = 0;
  dfs_lis(0, 0, 0, 0);
  return g_best;
}


static void test_deterministic(void) {

  {
    int arr0[] = {10, 9, 2, 5, 3, 7, 101, 18};
    ASSERT_INT_EQ(solve(arr0, 8), 4, "deterministic array");
  }
  {
    int arr0[] = {0, 1, 0, 3, 2, 3};
    ASSERT_INT_EQ(solve(arr0, 6), 4, "deterministic array");
  }
  {
    int arr0[] = {7, 7, 7, 7};
    ASSERT_INT_EQ(solve(arr0, 4), 1, "deterministic array");
  }
  {
    int arr0[] = {1, 2, 3, 4, 5};
    ASSERT_INT_EQ(solve(arr0, 5), 5, "deterministic array");
  }
  {
    int arr0[] = {4, 10, 4, 3, 8, 9};
    ASSERT_INT_EQ(solve(arr0, 6), 3, "deterministic array");
  }
  {
    int arr0[] = {5};
    ASSERT_INT_EQ(solve(arr0, 1), 1, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 20; t += 1) {
  int len = rand_int(1, 9);
  int *nums = (int *)malloc(sizeof(int) * len);
  for (int i = 0; i < len; i += 1) nums[i] = rand_int(-5, 9);
  int expected = ref_solve(nums, len);
  ASSERT_INT_EQ(solve(nums, len), expected, "random lis");
  free(nums);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}
