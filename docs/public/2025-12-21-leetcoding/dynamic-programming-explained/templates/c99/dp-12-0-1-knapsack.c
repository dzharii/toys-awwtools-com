/*
Title: 0/1 Knapsack
Problem: Given weights and values and capacity W, return the maximum total value with each item used at most once.
Constraints: 1 <= n <= 10, 1 <= weights[i] <= 10, 1 <= values[i] <= 50, 0 <= W <= 20
Examples:
- Input: w=[1,3,4,5], v=[1,4,5,7], W=7 => Output: 9
- Input: w=[2,3,4], v=[4,5,6], W=5 => Output: 9
- Input: w=[1], v=[10], W=0 => Output: 0
Edge cases: Capacity 0, single item.

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


int solve(const int *weights, const int *values, int n, int W) {
  // TODO: implement
  return 0;
}


static int ref_solve(const int *weights, const int *values, int n, int W) {
  int *dp = (int *)calloc((n + 1) * (W + 1), sizeof(int));
  for (int i = 1; i <= n; i += 1) {
    for (int w = 0; w <= W; w += 1) {
      int idx = i * (W + 1) + w;
      int best = dp[(i - 1) * (W + 1) + w];
      if (weights[i - 1] <= w) {
        int cand = dp[(i - 1) * (W + 1) + (w - weights[i - 1])] + values[i - 1];
        if (cand > best) best = cand;
      }
      dp[idx] = best;
    }
  }
  int ans = dp[n * (W + 1) + W];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  {
    int arr0[] = {1, 3, 4, 5};
    int arr1[] = {1, 4, 5, 7};
    ASSERT_INT_EQ(solve(arr0, arr1, 4, 7), 9, "deterministic array");
  }
  {
    int arr0[] = {2, 3, 4};
    int arr1[] = {4, 5, 6};
    ASSERT_INT_EQ(solve(arr0, arr1, 3, 5), 9, "deterministic array");
  }
  {
    int arr0[] = {1};
    int arr1[] = {10};
    ASSERT_INT_EQ(solve(arr0, arr1, 1, 0), 0, "deterministic array");
  }
  {
    int arr0[] = {5, 4, 6, 3};
    int arr1[] = {10, 40, 30, 50};
    ASSERT_INT_EQ(solve(arr0, arr1, 4, 10), 90, "deterministic array");
  }
  {
    int arr0[] = {2, 2, 6};
    int arr1[] = {6, 10, 12};
    ASSERT_INT_EQ(solve(arr0, arr1, 3, 7), 16, "deterministic array");
  }
  {
    int arr0[] = {3};
    int arr1[] = {4};
    ASSERT_INT_EQ(solve(arr0, arr1, 1, 6), 4, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 25; t += 1) {
  int n = rand_int(1, 8);
  int *weights = (int *)malloc(sizeof(int) * n);
  int *values = (int *)malloc(sizeof(int) * n);
  for (int i = 0; i < n; i += 1) {
    weights[i] = rand_int(1, 6);
    values[i] = rand_int(1, 10);
  }
  int W = rand_int(0, 12);
  int expected = ref_solve(weights, values, n, W);
  ASSERT_INT_EQ(solve(weights, values, n, W), expected, "random knapsack");
  free(weights);
  free(values);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}
