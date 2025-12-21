/*
Title: Coin Change (Min Coins)
Problem: Given coin denominations and a target amount, return the fewest number of coins needed to make the amount, or -1 if impossible.
Constraints: 1 <= coins.length <= 8, 1 <= coins[i] <= 20, 0 <= amount <= 50
Examples:
- Input: coins=[1,2,5], amount=11 => Output: 3
- Input: coins=[2], amount=3 => Output: -1
- Input: coins=[1], amount=0 => Output: 0
Edge cases: Amount 0, unreachable amounts.

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


int solve(const int *coins, int n, int amount) {
  // TODO: implement
  return 0;
}


static int ref_solve(const int *coins, int n, int amount) {
  int *dp = (int *)malloc(sizeof(int) * (amount + 1));
  for (int i = 0; i <= amount; i += 1) dp[i] = 1 << 29;
  dp[0] = 0;
  for (int a = 1; a <= amount; a += 1) {
    for (int i = 0; i < n; i += 1) {
      int coin = coins[i];
      if (a - coin >= 0 && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;
    }
  }
  int ans = dp[amount] >= (1 << 28) ? -1 : dp[amount];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  {
    int arr0[] = {1, 2, 5};
    ASSERT_INT_EQ(solve(arr0, 3, 11), 3, "deterministic array");
  }
  {
    int arr0[] = {2};
    ASSERT_INT_EQ(solve(arr0, 1, 3), -1, "deterministic array");
  }
  {
    int arr0[] = {1};
    ASSERT_INT_EQ(solve(arr0, 1, 0), 0, "deterministic array");
  }
  {
    int arr0[] = {1, 3, 4};
    ASSERT_INT_EQ(solve(arr0, 3, 6), 2, "deterministic array");
  }
  {
    int arr0[] = {2, 5, 10};
    ASSERT_INT_EQ(solve(arr0, 3, 7), -1, "deterministic array");
  }
  {
    int arr0[] = {1, 2};
    ASSERT_INT_EQ(solve(arr0, 2, 4), 2, "deterministic array");
  }

}

static void test_random(void) {

  for (int t = 0; t < 30; t += 1) {
  int len = rand_int(1, 4);
  int *coins = (int *)malloc(sizeof(int) * len);
  for (int i = 0; i < len; i += 1) coins[i] = rand_int(1, 6);
  int amount = rand_int(0, 20);
  int expected = ref_solve(coins, len, amount);
  ASSERT_INT_EQ(solve(coins, len, amount), expected, "random coins");
  free(coins);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

