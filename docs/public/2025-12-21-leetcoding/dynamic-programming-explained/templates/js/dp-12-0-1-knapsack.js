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

function solve(weights, values, W) {
  // TODO: implement
  return 0;
}


function refSolve(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i += 1) {
    for (let w = 0; w <= W; w += 1) {
      dp[i][w] = dp[i - 1][w];
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][W];
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

  assertEqual(solve([1,3,4,5], [1,4,5,7], 7), 9, 'deterministic');
  assertEqual(solve([2,3,4], [4,5,6], 5), 9, 'deterministic');
  assertEqual(solve([1], [10], 0), 0, 'deterministic');
  assertEqual(solve([5,4,6,3], [10,40,30,50], 10), 90, 'deterministic');
  assertEqual(solve([2,2,6], [6,10,12], 7), 16, 'deterministic');
  assertEqual(solve([3], [4], 6), 4, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 25; t += 1) {
  const n = randInt(1, 8);
  const weights = Array.from({ length: n }, () => randInt(1, 6));
  const values = Array.from({ length: n }, () => randInt(1, 10));
  const W = randInt(0, 12);
  const expected = refSolve(weights, values, W);
  assertEqual(solve(weights, values, W), expected, 'random knapsack');
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

