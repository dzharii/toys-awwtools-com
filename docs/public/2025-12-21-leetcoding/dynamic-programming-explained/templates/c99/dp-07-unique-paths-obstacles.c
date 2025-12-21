/*
Title: Unique Paths with Obstacles
Problem: Given an m x n grid with obstacles (1) and free cells (0), count unique paths from top-left to bottom-right moving only right or down.
Constraints: 1 <= m, n <= 8
Examples:
- Input: [[0,0,0],[0,1,0],[0,0,0]] => Output: 2
- Input: [[0,1],[0,0]] => Output: 1
- Input: [[1]] => Output: 0
Edge cases: Blocked start or end cell.

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


int solve(const int *grid, int rows, int cols) {
  // TODO: implement
  return 0;
}


static int ref_solve(const int *grid, int rows, int cols) {
  int *dp = (int *)calloc(rows * cols, sizeof(int));
  dp[0] = grid[0] == 0 ? 1 : 0;
  for (int r = 0; r < rows; r += 1) {
    for (int c = 0; c < cols; c += 1) {
      if (grid[r * cols + c] == 1) {
        dp[r * cols + c] = 0;
        continue;
      }
      if (r == 0 && c == 0) continue;
      int top = r > 0 ? dp[(r - 1) * cols + c] : 0;
      int left = c > 0 ? dp[r * cols + c - 1] : 0;
      dp[r * cols + c] = top + left;
    }
  }
  int ans = dp[rows * cols - 1];
  free(dp);
  return ans;
}


static void test_deterministic(void) {

  {
    int grid[] = {0, 0, 0, 0, 1, 0, 0, 0, 0};
    ASSERT_INT_EQ(solve(grid, 3, 3), 2, "deterministic grid");
  }
  {
    int grid[] = {0, 1, 0, 0};
    ASSERT_INT_EQ(solve(grid, 2, 2), 1, "deterministic grid");
  }
  {
    int grid[] = {0};
    ASSERT_INT_EQ(solve(grid, 1, 1), 1, "deterministic grid");
  }
  {
    int grid[] = {1};
    ASSERT_INT_EQ(solve(grid, 1, 1), 0, "deterministic grid");
  }
  {
    int grid[] = {0, 0, 1, 0};
    ASSERT_INT_EQ(solve(grid, 2, 2), 1, "deterministic grid");
  }
  {
    int grid[] = {0, 0, 0, 0};
    ASSERT_INT_EQ(solve(grid, 2, 2), 2, "deterministic grid");
  }

}

static void test_random(void) {

  for (int t = 0; t < 25; t += 1) {
  int rows = rand_int(1, 6);
  int cols = rand_int(1, 6);
  int *grid = (int *)malloc(sizeof(int) * rows * cols);
  for (int i = 0; i < rows * cols; i += 1) {
    grid[i] = rand_int(0, 9) < 2 ? 1 : 0;
  }
  int expected = ref_solve(grid, rows, cols);
  ASSERT_INT_EQ(solve(grid, rows, cols), expected, "random obstacles");
  free(grid);
}

}

int main(void) {

  test_deterministic();

  test_random();

  printf("Passed: %d, Failed: %d\n", passed, failed);

  return failed > 0 ? 1 : 0;

}

