/*
Title: Target Sum
Problem: Given nums and a target, assign + or - signs to each number and return the number of expressions that evaluate to target.
Constraints: 1 <= nums.length <= 20, 0 <= nums[i] <= 9, -20 <= target <= 20
Examples:
- Input: [1,1,1,1,1], target=3 => Output: 5
- Input: [1], target=1 => Output: 1
- Input: [1], target=2 => Output: 0
Edge cases: Zeros in nums.

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


int solve(const int *nums, int n, int target) {
  // TODO: implement
  return 0;
}


static const int *g_nums;
static int g_n;
static int g_target;
static int g_count;

static void dfs_target(int idx, int sum) {
  if (idx == g_n) {
    if (sum == g_target) g_count += 1;
    return;
  }
  dfs_target(idx + 1, sum + g_nums[idx]);
  dfs_target(idx + 1, sum - g_nums[idx]);
}

static int ref_solve(const int *nums, int n, int target) {
  g_nums = nums;
  g_n = n;
  g_target = target;
  g_count = 0;
  dfs_target(0, 0);
  return g_count;
}


static void test_deterministic(void) {

  {
    int arr0[] = {1, 1, 1, 1, 1};
    ASSERT_INT_EQ(solve(arr0, 5, 3), 5, "deterministic array");
  }
  {
    int arr0[] = {1};
    ASSERT_INT_EQ(solve(arr0, 1, 1), 1, "deterministic array");
  }
  {
    int arr0[] = {1};
    ASSERT_INT_EQ(solve(arr0, 1, 2), 0, "deterministic array");
  }
  {
    int arr0[] = {2, 3, 5};
    ASSERT_INT_EQ(solve(arr0, 3, 0), 2, "deterministic array");
  }
  {
    int arr0[] = {0, 0, 0, 0, 1};
    ASSERT_INT_EQ(solve(arr0, 5, 1), 16, "deterministic array");
  }
  {
    int arr0[] = {2, 2};
    ASSERT_INT_EQ(solve(arr0, 2, 0), 2, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 20; t += 1) {
  int len = rand_int(1, 10);
  int *nums = (int *)malloc(sizeof(int) * len);
  for (int i = 0; i < len; i += 1) nums[i] = rand_int(0, 5);
  int target = rand_int(-10, 10);
  int expected = ref_solve(nums, len, target);
  ASSERT_INT_EQ(solve(nums, len, target), expected, "random target");
  free(nums);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}
