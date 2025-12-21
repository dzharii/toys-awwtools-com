/*
Title: Longest Increasing Subsequence
Problem: Given an integer array nums, return the length of the longest strictly increasing subsequence.
Constraints: 1 <= nums.length <= 20, -10 <= nums[i] <= 50
Examples:
- Input: [10,9,2,5,3,7,101,18] => Output: 4
- Input: [0,1,0,3,2,3] => Output: 4
- Input: [7,7,7,7] => Output: 1
Edge cases: All equal numbers, already increasing.

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
  const n = nums.length;
  let best = 0;
  function dfs(i, last, len) {
    if (i === n) {
      if (len > best) best = len;
      return;
    }
    dfs(i + 1, last, len);
    if (last === null || nums[i] > last) dfs(i + 1, nums[i], len + 1);
  }
  dfs(0, null, 0);
  return best;
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

  assertEqual(solve([10,9,2,5,3,7,101,18]), 4, 'deterministic');
  assertEqual(solve([0,1,0,3,2,3]), 4, 'deterministic');
  assertEqual(solve([7,7,7,7]), 1, 'deterministic');
  assertEqual(solve([1,2,3,4,5]), 5, 'deterministic');
  assertEqual(solve([4,10,4,3,8,9]), 3, 'deterministic');
  assertEqual(solve([5]), 1, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 20; t += 1) {
  const len = randInt(1, 9);
  const nums = Array.from({ length: len }, () => randInt(-5, 9));
  const expected = refSolve(nums);
  assertEqual(solve(nums), expected, `nums=${nums}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

