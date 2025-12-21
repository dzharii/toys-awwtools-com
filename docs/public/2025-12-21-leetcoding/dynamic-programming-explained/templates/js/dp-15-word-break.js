/*
Title: Word Break
Problem: Given a string s and dictionary words, determine if s can be segmented into a sequence of dictionary words.
Constraints: 1 <= s.length <= 20, dictionary size <= 10, lowercase letters
Examples:
- Input: s="leetcode", dict=["leet","code"] => Output: true
- Input: s="catsandog", dict=["cats","dog","sand","and","cat"] => Output: false
- Input: s="cars", dict=["car","ca","rs"] => Output: true
Edge cases: Single character, overlapping words.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(s, dict) {
  // TODO: implement
  return false;
}


function refSolve(s, dict) {
  const set = new Set(dict);
  const n = s.length;
  const dp = Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i += 1) {
    for (let j = 0; j < i; j += 1) {
      if (dp[j] && set.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
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

  assertEqual(solve("leetcode", ["leet","code"]), true, 'deterministic');
  assertEqual(solve("applepenapple", ["apple","pen"]), true, 'deterministic');
  assertEqual(solve("catsandog", ["cats","dog","sand","and","cat"]), false, 'deterministic');
  assertEqual(solve("cars", ["car","ca","rs"]), true, 'deterministic');
  assertEqual(solve("aaaaaaa", ["aaaa","aaa"]), true, 'deterministic');
  assertEqual(solve("a", ["b"]), false, 'deterministic');

});

run('random', () => {

  const letters = ['a', 'b', 'c'];
for (let t = 0; t < 20; t += 1) {
  const wordCount = randInt(1, 6);
  const dict = Array.from({ length: wordCount }, () => {
    const len = randInt(1, 4);
    return Array.from({ length: len }, () => letters[randInt(0, 2)]).join('');
  });
  const sLen = randInt(1, 8);
  const s = Array.from({ length: sLen }, () => letters[randInt(0, 2)]).join('');
  const expected = refSolve(s, dict);
  assertEqual(solve(s, dict), expected, 'random word break');
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

