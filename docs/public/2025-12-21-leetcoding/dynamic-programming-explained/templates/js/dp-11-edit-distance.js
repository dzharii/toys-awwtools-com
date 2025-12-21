/*
Title: Edit Distance
Problem: Given two strings, return the minimum number of insertions, deletions, or replacements to convert the first into the second.
Constraints: 0 <= length <= 12, lowercase letters
Examples:
- Input: "horse", "ros" => Output: 3
- Input: "intention", "execution" => Output: 5
- Input: "", "a" => Output: 1
Edge cases: Empty strings.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(word1, word2) {
  // TODO: implement
  return 0;
}


function refSolve(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
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

  assertEqual(solve("horse", "ros"), 3, 'deterministic');
  assertEqual(solve("intention", "execution"), 5, 'deterministic');
  assertEqual(solve("", "a"), 1, 'deterministic');
  assertEqual(solve("ab", "ab"), 0, 'deterministic');
  assertEqual(solve("kitten", "sitting"), 3, 'deterministic');
  assertEqual(solve("a", ""), 1, 'deterministic');

});

run('random', () => {

  const letters = ['a', 'b', 'c'];
for (let t = 0; t < 20; t += 1) {
  const len1 = randInt(0, 6);
  const len2 = randInt(0, 6);
  const a = Array.from({ length: len1 }, () => letters[randInt(0, 2)]).join('');
  const b = Array.from({ length: len2 }, () => letters[randInt(0, 2)]).join('');
  const expected = refSolve(a, b);
  assertEqual(solve(a, b), expected, `a=${a}, b=${b}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

