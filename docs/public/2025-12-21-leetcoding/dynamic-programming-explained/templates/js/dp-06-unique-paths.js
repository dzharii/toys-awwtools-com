/*
Title: Unique Paths
Problem: A robot starts at the top-left of an m x n grid and can move only right or down. Return the number of unique paths to the bottom-right.
Constraints: 1 <= m, n <= 10
Examples:
- Input: m=3,n=7 => Output: 28
- Input: m=3,n=2 => Output: 3
- Input: m=3,n=3 => Output: 6
Edge cases: Single row or single column.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(m, n) {
  // TODO: implement
  return 0;
}


function refSolve(m, n) {
  const dp = Array.from({ length: m }, () => Array(n).fill(0));
  for (let r = 0; r < m; r += 1) dp[r][0] = 1;
  for (let c = 0; c < n; c += 1) dp[0][c] = 1;
  for (let r = 1; r < m; r += 1) {
    for (let c = 1; c < n; c += 1) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
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

  assertEqual(solve(3, 7), 28, 'deterministic');
  assertEqual(solve(3, 2), 3, 'deterministic');
  assertEqual(solve(3, 3), 6, 'deterministic');
  assertEqual(solve(1, 5), 1, 'deterministic');
  assertEqual(solve(2, 2), 2, 'deterministic');
  assertEqual(solve(2, 3), 3, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 30; t += 1) {
  const m = randInt(1, 8);
  const n = randInt(1, 8);
  const expected = refSolve(m, n);
  assertEqual(solve(m, n), expected, `m=${m}, n=${n}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

