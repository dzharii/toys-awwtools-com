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

function solve(cost) {
  // TODO: implement
  return 0;
}


function refSolve(cost) {
  const n = cost.length;
  let dp0 = 0;
  let dp1 = 0;
  for (let i = 2; i <= n; i += 1) {
    const next = Math.min(dp1 + cost[i - 1], dp0 + cost[i - 2]);
    dp0 = dp1;
    dp1 = next;
  }
  return dp1;
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

  assertEqual(solve([10,15,20]), 15, 'deterministic');
  assertEqual(solve([1,100,1,1,1,100,1,1,100,1]), 6, 'deterministic');
  assertEqual(solve([5,5]), 5, 'deterministic');
  assertEqual(solve([0,2,2,1]), 2, 'deterministic');
  assertEqual(solve([3,4,5,6]), 8, 'deterministic');
  assertEqual(solve([1,2]), 1, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 30; t += 1) {
  const len = randInt(2, 8);
  const cost = Array.from({ length: len }, () => randInt(0, 9));
  const expected = refSolve(cost);
  assertEqual(solve(cost), expected, `cost=${cost}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

