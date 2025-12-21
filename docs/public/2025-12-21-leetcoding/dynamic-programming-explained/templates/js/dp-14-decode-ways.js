/*
Title: Decode Ways
Problem: Given a digit string s, count the number of ways to decode it where 1->A, 2->B, ..., 26->Z.
Constraints: 1 <= s.length <= 20, digits only
Examples:
- Input: "12" => Output: 2
- Input: "226" => Output: 3
- Input: "06" => Output: 0
Edge cases: Leading zeros, invalid pairs.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(s) {
  // TODO: implement
  return 0;
}


function refSolve(s) {
  const n = s.length;
  const dp = Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = s[0] === '0' ? 0 : 1;
  for (let i = 2; i <= n; i += 1) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    const two = Number(s.slice(i - 2, i));
    if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
  }
  return dp[n];
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

  assertEqual(solve("12"), 2, 'deterministic');
  assertEqual(solve("226"), 3, 'deterministic');
  assertEqual(solve("06"), 0, 'deterministic');
  assertEqual(solve("11106"), 2, 'deterministic');
  assertEqual(solve("10"), 1, 'deterministic');
  assertEqual(solve("27"), 1, 'deterministic');

});

run('random', () => {

  const digits = ['0', '1', '2', '3', '4'];
for (let t = 0; t < 25; t += 1) {
  const len = randInt(1, 8);
  const s = Array.from({ length: len }, () => digits[randInt(0, digits.length - 1)]).join('');
  const expected = refSolve(s);
  assertEqual(solve(s), expected, `s=${s}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

