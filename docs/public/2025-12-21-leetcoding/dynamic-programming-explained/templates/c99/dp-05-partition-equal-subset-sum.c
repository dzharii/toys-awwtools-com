/*
Title: Partition Equal Subset Sum
Problem: Given positive integers nums, determine if the array can be partitioned into two subsets with equal sum.
Constraints: 1 <= nums.length <= 20, 1 <= nums[i] <= 40
Examples:
- Input: [1,5,11,5] => Output: true
- Input: [1,2,3,5] => Output: false
- Input: [3,3,3,4,5] => Output: true
Edge cases: Odd total sum, single element.

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


static int ref_solve(const int *nums, int n) {
  int sum = 0;
  for (int i = 0; i < n; i += 1) sum += nums[i];
  if (sum % 2 != 0) return 0;
  int target = sum / 2;
  int *dp = (int *)calloc(target + 1, sizeof(int));
  dp[0] = 1;
  for (int i = 0; i < n; i += 1) {
    int num = nums[i];
    for (int s = target; s >= num; s -= 1) {
      if (dp[s - num]) dp[s] = 1;
    }
  }
  int ans = dp[target];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  {
    int arr0[] = {1, 5, 11, 5};
    ASSERT_BOOL_EQ(solve(arr0, 4), 1, "deterministic array");
  }
  {
    int arr0[] = {1, 2, 3, 5};
    ASSERT_BOOL_EQ(solve(arr0, 4), 0, "deterministic array");
  }
  {
    int arr0[] = {3, 3, 3, 4, 5};
    ASSERT_BOOL_EQ(solve(arr0, 5), 1, "deterministic array");
  }
  {
    int arr0[] = {1};
    ASSERT_BOOL_EQ(solve(arr0, 1), 0, "deterministic array");
  }
  {
    int arr0[] = {2, 2, 3, 5};
    ASSERT_BOOL_EQ(solve(arr0, 4), 0, "deterministic array");
  }
  {
    int arr0[] = {1, 1, 1, 1, 1, 1};
    ASSERT_BOOL_EQ(solve(arr0, 6), 1, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 30; t += 1) {
  int len = rand_int(1, 12);
  int *nums = (int *)malloc(sizeof(int) * len);
  for (int i = 0; i < len; i += 1) nums[i] = rand_int(1, 10);
  int expected = ref_solve(nums, len);
  ASSERT_BOOL_EQ(solve(nums, len), expected, "random subset");
  free(nums);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}
