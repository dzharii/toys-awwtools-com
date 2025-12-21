/*
Title: Minimum Path Sum
Problem: Given a grid of non-negative integers, find a path from top-left to bottom-right with minimum sum moving only right or down.
Constraints: 1 <= m, n <= 8, 0 <= grid[r][c] <= 9
Examples:
- Input: [[1,3,1],[1,5,1],[4,2,1]] => Output: 7
- Input: [[1,2,3],[4,5,6]] => Output: 12
- Input: [[5]] => Output: 5
Edge cases: Single cell grid.

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
  dp[0][0] = grid[0][0];
  for (let r = 0; r < m; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (r === 0 && c === 0) continue;
      const top = r > 0 ? dp[r - 1][c] : Infinity;
      const left = c > 0 ? dp[r][c - 1] : Infinity;
      dp[r][c] = grid[r][c] + Math.min(top, left);
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

  assertDeepEqual(solve([[1,3,1],[1,5,1],[4,2,1]]), 7, 'deterministic');
  assertDeepEqual(solve([[1,2,3],[4,5,6]]), 12, 'deterministic');
  assertDeepEqual(solve([[5]]), 5, 'deterministic');
  assertDeepEqual(solve([[1,2],[1,1]]), 3, 'deterministic');
  assertDeepEqual(solve([[1,4,2],[2,1,5],[3,2,1]]), 7, 'deterministic');
  assertDeepEqual(solve([[0,0],[0,0]]), 0, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 25; t += 1) {
  const rows = randInt(1, 6);
  const cols = randInt(1, 6);
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(0, 9)));
  const expected = refSolve(grid);
  assertEqual(solve(grid), expected, 'random grid');
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

