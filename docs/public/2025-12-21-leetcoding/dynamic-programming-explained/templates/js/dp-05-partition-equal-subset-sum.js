/*
Title: Partition Equal Subset Sum
Problem: Given positive integers nums, determine if the array can be partitioned into two subsets with equal sum.
Constraints: 1 <= nums.length <= 20, 1 <= nums[i] <= 40
Examples:
- Input: [1,5,11,5] => Output: true
- Input: [1,2,3,5] => Output: false
- Input: [3,3,3,4,5] => Output: true
Edge cases: Odd total sum, single element.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(nums) {
  // TODO: implement
  return false;
}


function refSolve(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum % 2 !== 0) return false;
  const target = sum / 2;
  const dp = Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let s = target; s >= num; s -= 1) {
      dp[s] = dp[s] || dp[s - num];
    }
  }
  return dp[target];
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

  assertEqual(solve([1,5,11,5]), true, 'deterministic');
  assertEqual(solve([1,2,3,5]), false, 'deterministic');
  assertEqual(solve([3,3,3,4,5]), true, 'deterministic');
  assertEqual(solve([1]), false, 'deterministic');
  assertEqual(solve([2,2,3,5]), false, 'deterministic');
  assertEqual(solve([1,1,1,1,1,1]), true, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 30; t += 1) {
  const len = randInt(1, 12);
  const nums = Array.from({ length: len }, () => randInt(1, 10));
  const expected = refSolve(nums);
  assertEqual(solve(nums), expected, `nums=${nums}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

