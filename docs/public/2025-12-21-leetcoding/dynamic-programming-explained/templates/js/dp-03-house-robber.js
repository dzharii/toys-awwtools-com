/*
Title: House Robber
Problem: Given nums where nums[i] is money at house i, adjacent houses cannot be robbed. Return the maximum amount you can rob.
Constraints: 1 <= nums.length <= 30, 0 <= nums[i] <= 100
Examples:
- Input: [1,2,3,1] => Output: 4
- Input: [2,7,9,3,1] => Output: 12
- Input: [2,1,1,2] => Output: 4
Edge cases: Single house, alternating values.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(nums) {
  // TODO: implement
  return 0;
}


function refSolve(nums) {
  let prev2 = 0;
  let prev1 = 0;
  for (const val of nums) {
    const next = Math.max(prev1, prev2 + val);
    prev2 = prev1;
    prev1 = next;
  }
  return prev1;
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

  assertEqual(solve([1,2,3,1]), 4, 'deterministic');
  assertEqual(solve([2,7,9,3,1]), 12, 'deterministic');
  assertEqual(solve([2,1,1,2]), 4, 'deterministic');
  assertEqual(solve([5]), 5, 'deterministic');
  assertEqual(solve([4,10,3,1,5]), 15, 'deterministic');
  assertEqual(solve([2,1]), 2, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 30; t += 1) {
  const len = randInt(1, 10);
  const nums = Array.from({ length: len }, () => randInt(0, 20));
  const expected = refSolve(nums);
  assertEqual(solve(nums), expected, `nums=${nums}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

