/*
Title: Climbing Stairs
Problem: You are climbing a staircase with n steps. Each time you can climb either 1 or 2 steps. Return the number of distinct ways to reach step n.
Constraints: 1 <= n <= 30
Examples:
- Input: n=1 => Output: 1
- Input: n=2 => Output: 2
- Input: n=3 => Output: 3
Edge cases: Small n (1 or 2).

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


int solve(int n) {
  // TODO: implement
  return 0;
}


static int ref_solve(int n) {
  if (n <= 1) return 1;
  int a = 1;
  int b = 1;
  for (int i = 2; i <= n; i += 1) {
    int next = a + b;
    a = b;
    b = next;
  }
  return b;
}


static void test_deterministic(void) {

  ASSERT_INT_EQ(solve(1), 1, "deterministic");
  ASSERT_INT_EQ(solve(2), 2, "deterministic");
  ASSERT_INT_EQ(solve(3), 3, "deterministic");
  ASSERT_INT_EQ(solve(4), 5, "deterministic");
  ASSERT_INT_EQ(solve(5), 8, "deterministic");
  ASSERT_INT_EQ(solve(10), 89, "deterministic");

}

static void test_random(void) {

  for (int t = 0; t < 30; t += 1) {
  int n = rand_int(1, 20);
  int expected = ref_solve(n);
  ASSERT_INT_EQ(solve(n), expected, "random n");
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

