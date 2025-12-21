/*
Title: Target Sum
Problem: Given nums and a target, assign + or - signs to each number and return the number of expressions that evaluate to target.
Constraints: 1 <= nums.length <= 20, 0 <= nums[i] <= 9, -20 <= target <= 20
Examples:
- Input: [1,1,1,1,1], target=3 => Output: 5
- Input: [1], target=1 => Output: 1
- Input: [1], target=2 => Output: 0
Edge cases: Zeros in nums.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(nums, target) {
  // TODO: implement
  return 0;
}


function refSolve(nums, target) {
  let count = 0;
  function dfs(i, sum) {
    if (i === nums.length) {
      if (sum === target) count += 1;
      return;
    }
    dfs(i + 1, sum + nums[i]);
    dfs(i + 1, sum - nums[i]);
  }
  dfs(0, 0);
  return count;
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

  assertEqual(solve([1,1,1,1,1], 3), 5, 'deterministic');
  assertEqual(solve([1], 1), 1, 'deterministic');
  assertEqual(solve([1], 2), 0, 'deterministic');
  assertEqual(solve([2,3,5], 0), 2, 'deterministic');
  assertEqual(solve([0,0,0,0,1], 1), 16, 'deterministic');
  assertEqual(solve([2,2], 0), 2, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 20; t += 1) {
  const len = randInt(1, 10);
  const nums = Array.from({ length: len }, () => randInt(0, 5));
  const target = randInt(-10, 10);
  const expected = refSolve(nums, target);
  assertEqual(solve(nums, target), expected, 'random target sum');
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

