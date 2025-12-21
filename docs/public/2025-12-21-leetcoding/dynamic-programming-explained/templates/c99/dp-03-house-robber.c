/*
Title: House Robber
Problem: Given nums where nums[i] is money at house i, adjacent houses cannot be robbed. Return the maximum amount you can rob.
Constraints: 1 <= nums.length <= 30, 0 <= nums[i] <= 100
Examples:
- Input: [1,2,3,1] => Output: 4
- Input: [2,7,9,3,1] => Output: 12
- Input: [2,1,1,2] => Output: 4
Edge cases: Single house, alternating values.

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
  int prev2 = 0;
  int prev1 = 0;
  for (int i = 0; i < n; i += 1) {
    int next = prev1 > prev2 + nums[i] ? prev1 : prev2 + nums[i];
    prev2 = prev1;
    prev1 = next;
  }
  return prev1;
}


static void test_deterministic(void) {

  {
    int arr0[] = {1, 2, 3, 1};
    ASSERT_INT_EQ(solve(arr0, 4), 4, "deterministic array");
  }
  {
    int arr0[] = {2, 7, 9, 3, 1};
    ASSERT_INT_EQ(solve(arr0, 5), 12, "deterministic array");
  }
  {
    int arr0[] = {2, 1, 1, 2};
    ASSERT_INT_EQ(solve(arr0, 4), 4, "deterministic array");
  }
  {
    int arr0[] = {5};
    ASSERT_INT_EQ(solve(arr0, 1), 5, "deterministic array");
  }
  {
    int arr0[] = {4, 10, 3, 1, 5};
    ASSERT_INT_EQ(solve(arr0, 5), 15, "deterministic array");
  }
  {
    int arr0[] = {2, 1};
    ASSERT_INT_EQ(solve(arr0, 2), 2, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 30; t += 1) {
  int len = rand_int(1, 10);
  int *nums = (int *)malloc(sizeof(int) * len);
  for (int i = 0; i < len; i += 1) nums[i] = rand_int(0, 20);
  int expected = ref_solve(nums, len);
  ASSERT_INT_EQ(solve(nums, len), expected, "random nums");
  free(nums);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

