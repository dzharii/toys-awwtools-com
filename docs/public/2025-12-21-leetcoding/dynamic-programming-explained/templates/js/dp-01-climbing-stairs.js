/*
Title: Climbing Stairs
Problem: You are climbing a staircase with n steps. Each time you can climb either 1 or 2 steps. Return the number of distinct ways to reach step n.
Constraints: 1 <= n <= 30
Examples:
- Input: n=1 => Output: 1
- Input: n=2 => Output: 2
- Input: n=3 => Output: 3
Edge cases: Small n (1 or 2).

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(n) {
  // TODO: implement
  return 0;
}


function refSolve(n) {
  if (n <= 1) return 1;
  let a = 1;
  let b = 1;
  for (let i = 2; i <= n; i += 1) {
    const next = a + b;
    a = b;
    b = next;
  }
  return b;
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

  assertEqual(solve(1), 1, 'deterministic');
  assertEqual(solve(2), 2, 'deterministic');
  assertEqual(solve(3), 3, 'deterministic');
  assertEqual(solve(4), 5, 'deterministic');
  assertEqual(solve(5), 8, 'deterministic');
  assertEqual(solve(10), 89, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 30; t += 1) {
  const n = randInt(1, 20);
  const expected = refSolve(n);
  assertEqual(solve(n), expected, `n=${n}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

