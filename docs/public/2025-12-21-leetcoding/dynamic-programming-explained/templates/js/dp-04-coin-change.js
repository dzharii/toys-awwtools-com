/*
Title: Coin Change (Min Coins)
Problem: Given coin denominations and a target amount, return the fewest number of coins needed to make the amount, or -1 if impossible.
Constraints: 1 <= coins.length <= 8, 1 <= coins[i] <= 20, 0 <= amount <= 50
Examples:
- Input: coins=[1,2,5], amount=11 => Output: 3
- Input: coins=[2], amount=3 => Output: -1
- Input: coins=[1], amount=0 => Output: 0
Edge cases: Amount 0, unreachable amounts.

Test design coverage:
- Boundary tests: smallest sizes, zeros/empty when allowed, single-row/column when applicable.
- Equivalence classes: reachable vs unreachable states, varied distributions of values.
- Pitfall regression: known wrong iteration orders or invalid transitions.
- Randomized small tests with oracle.
*/

function solve(coins, amount) {
  // TODO: implement
  return 0;
}


function refSolve(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a += 1) {
    for (const coin of coins) {
      if (a - coin >= 0) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
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

  assertEqual(solve([1,2,5], 11), 3, 'deterministic');
  assertEqual(solve([2], 3), -1, 'deterministic');
  assertEqual(solve([1], 0), 0, 'deterministic');
  assertEqual(solve([1,3,4], 6), 2, 'deterministic');
  assertEqual(solve([2,5,10], 7), -1, 'deterministic');
  assertEqual(solve([1,2], 4), 2, 'deterministic');

});

run('random', () => {

  for (let t = 0; t < 30; t += 1) {
  const len = randInt(1, 4);
  const coins = Array.from({ length: len }, () => randInt(1, 6));
  const amount = randInt(0, 20);
  const expected = refSolve(coins, amount);
  assertEqual(solve(coins, amount), expected, `coins=${coins}, amount=${amount}`);
}

});

console.log(`Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) process.exit(1);

module.exports = { solve };

