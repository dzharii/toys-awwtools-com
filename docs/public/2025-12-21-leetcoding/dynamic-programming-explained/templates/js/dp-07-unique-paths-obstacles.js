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

function solve(grid) {
  // TODO: implement
  return 0;
}


function refSolve(grid) {
  const m = grid.length;
  const n = grid[0].length;
  const dp = Array.from({ length: m }, () => Array(n).fill(0));
  dp[0][0] = grid[0][0] === 0 ? 1 : 0;
  for (let r = 0; r < m; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (grid[r][c] === 1) {
        dp[r][c] = 0;
        continue;
      }
      if (r === 0 && c === 0) continue;
      const top = r > 0 ? dp[r - 1][c] : 0;
      const left = c > 0 ? dp[r][c - 1] : 0;
      dp[r][c] = top + left;
    }
  }
  return dp[m - 1][n - 1];
}


function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Fail: ${message}. Expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    throw new Error(`Fail: ${message}. Expected ${b}, got ${a}`);
  }
}

let seed = 123456789;
function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed;
}

function randInt(min, max) {
  return min + (rand() % (max - min + 1));
}

let passed = 0;
let failed = 0;

function run(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    failed += 1;
    console.error(`Test failed: ${name}`);
    console.error(err.message);
  }
}

run('deterministic', () => {

  assertDeepEqual(solve([[0,0,0],[0,1,0],[0,0,0]]), 2, 'deterministic');
  assertDeepEqual(solve([[0,1],[0,0]]), 1, 'deterministic');
  assertDeepEqual(solve([[0]]), 1, 'deterministic');
  assertDeepEqual(solve([[1]]), 0, 'deterministic');
  assertDeepEqual(solve([[0,0],[1,0]]), 1, 'deterministic');
  assertDeepEqual(solve([[0,0],[0,0]]), 2, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 25; t += 1) {
  const rows = randInt(1, 6);
  const cols = randInt(1, 6);
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (randInt(0, 9) < 2 ? 1 : 0)));
  const expected = refSolve(grid);
  assertEqual(solve(grid), expected, 'random grid');
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

