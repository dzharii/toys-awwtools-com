/*
Title: Min Cost Climbing Stairs
Problem: Given cost array where cost[i] is the cost of step i, you can start from step 0 or 1 and climb 1 or 2 steps. Return the minimum cost to reach the top beyond the last index.
Constraints: 2 <= cost.length <= 30, 0 <= cost[i] <= 100
Examples:
- Input: [10,15,20] => Output: 15
- Input: [1,100,1,1,1,100,1,1,100,1] => Output: 6
- Input: [5,5] => Output: 5
Edge cases: Length 2 arrays, zeros in cost.

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


int solve(const int *cost, int n) {
  // TODO: implement
  return 0;
}


static int ref_solve(const int *cost, int n) {
  int dp0 = 0;
  int dp1 = 0;
  for (int i = 2; i <= n; i += 1) {
    int a = dp1 + cost[i - 1];
    int b = dp0 + cost[i - 2];
    int next = a < b ? a : b;
    dp0 = dp1;
    dp1 = next;
  }
  return dp1;
}


static void test_deterministic(void) {

  {
    int arr0[] = {10, 15, 20};
    ASSERT_INT_EQ(solve(arr0, 3), 15, "deterministic array");
  }
  {
    int arr0[] = {1, 100, 1, 1, 1, 100, 1, 1, 100, 1};
    ASSERT_INT_EQ(solve(arr0, 10), 6, "deterministic array");
  }
  {
    int arr0[] = {5, 5};
    ASSERT_INT_EQ(solve(arr0, 2), 5, "deterministic array");
  }
  {
    int arr0[] = {0, 2, 2, 1};
    ASSERT_INT_EQ(solve(arr0, 4), 2, "deterministic array");
  }
  {
    int arr0[] = {3, 4, 5, 6};
    ASSERT_INT_EQ(solve(arr0, 4), 8, "deterministic array");
  }
  {
    int arr0[] = {1, 2};
    ASSERT_INT_EQ(solve(arr0, 2), 1, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 30; t += 1) {
  int len = rand_int(2, 8);
  int *cost = (int *)malloc(sizeof(int) * len);
  for (int i = 0; i < len; i += 1) cost[i] = rand_int(0, 9);
  int expected = ref_solve(cost, len);
  ASSERT_INT_EQ(solve(cost, len), expected, "random cost");
  free(cost);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

