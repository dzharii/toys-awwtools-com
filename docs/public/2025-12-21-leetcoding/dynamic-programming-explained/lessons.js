const STATUS = {
  BASE: 'Base',
  COMPUTED: 'Computed',
  UNREACHABLE: 'Unreachable'
};

function createTable(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ value: null, status: 'Uncomputed' })));
}

function cloneTable(table) {
  return table.map((row) => row.map((cell) => ({ value: cell.value, status: cell.status })));
}

function recordStep(steps, table, r, c, reads, value, status, predecessor = null) {
  steps.push({
    index: steps.length,
    target: { r, c },
    reads,
    writeValue: value,
    status,
    predecessor
  });
  table[r][c].value = value;
  table[r][c].status = status;
}

function tableMeta(rows, cols, view = '2d') {
  return { rows, cols, view };
}

function extract1D(table, index) {
  return table[0][index].value;
}

function extract2D(table, r, c) {
  return table[r][c].value;
}

function reconstructPath(predecessors, end) {
  const path = [];
  let current = end;
  while (current) {
    path.push(`(${current.r},${current.c})`);
    current = predecessors[current.r]?.[current.c] || null;
  }
  return path.reverse();
}

function reconstructIndices(predecessors, endIndex) {
  const path = [];
  let current = endIndex;
  while (current !== null && current !== undefined) {
    path.push(current);
    current = predecessors[current];
  }
  return path.reverse();
}

const LESSONS = [
  {
    id: 'dp-01',
    title: 'Climbing Stairs',
    difficulty: 1,
    problemText: [
      'You are climbing a staircase with n steps. Each time you can climb either 1 or 2 steps.',
      'Return the number of distinct ways to reach the top (step n).',
      'Constraints: 1 <= n <= 30.'
    ].join('\n\n'),
    ioFormat: 'Input: n (integer). Output: number of distinct ways.',
    examples: [
      { input: { n: 1 }, output: 1 },
      { input: { n: 2 }, output: 2 },
      { input: { n: 3 }, output: 3 },
      { input: { n: 4 }, output: 5 },
      { input: { n: 5 }, output: 8 }
    ],
    defaultInput: { n: 5 },
    inputSchema: {
      allowRandomize: true,
      fields: [
        {
          key: 'n',
          label: 'Number of steps (n)',
          type: 'int',
          min: 1,
          max: 30,
          ui: 'slider',
          help: 'Drag to adjust the staircase height.'
        }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Ways to reach step i depends only on the two steps before it.'] },
      { level: 'StateSuggestion', text: ['Let dp[i] be the number of ways to reach step i.'] },
      { level: 'TransitionSuggestion', text: ['Combine the counts from i-1 and i-2 to get dp[i].'] },
      { level: 'Complexity', text: ['You can compute the table in linear time with O(n) space.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.n + 1 }),
      iterationOrder: 'i increasing from 2 to n',
      dependencyOffsets: [-1, -2],
      baseCaseInitializer: 'dp[0] = 1, dp[1] = 1',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'stairs', label: 'dp[i] for stairs', meaning: 'dp[i] = number of ways to reach step i', baseCases: ['dp[0] = 1', 'dp[1] = 1'] }
    ],
    transitionTemplate: 'dp[i] = dp[i-1] + dp[i-2]',
    codeTemplates: {
      tabulation: `function solve(n) {\n  // dp[i] = ways to reach step i\n  const dp = Array(n + 1).fill(0);\n  dp[0] = 1;\n  if (n >= 1) dp[1] = 1;\n  for (let i = 2; i <= n; i += 1) {\n    // TODO: update dp[i]\n  }\n  return dp[n];\n}\n`,
      memoization: `function solve(n) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function ways(i) {\n    if (i <= 1) return 1;\n    if (memo.has(i)) return memo.get(i);\n    const value = ways(i - 1) + ways(i - 2);\n    memo.set(i, value);\n    return value;\n  }\n  return ways(n);\n}\n`
    },
    selfCheck: [
      { prompt: 'What does dp[i] represent?', type: 'mc', options: ['Ways to reach step i', 'Minimum cost to reach step i', 'Maximum jumps'], answer: 'Ways to reach step i' },
      { prompt: 'Which base cases are required?', type: 'mc', options: ['dp[0] and dp[1]', 'dp[1] only', 'dp[2] only'], answer: 'dp[0] and dp[1]' },
      { prompt: 'Dependencies flow from smaller to larger indices.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity class?', type: 'mc', options: ['O(n)', 'O(n^2)', 'O(log n)'], answer: 'O(n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract1D(table, table[0].length - 1),
    computeSteps: (input) => {
      const cols = input.n + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      recordStep(steps, table, 0, 0, [], 1, STATUS.BASE);
      if (cols > 1) {
        recordStep(steps, table, 0, 1, [], 1, STATUS.BASE);
      }
      for (let i = 2; i < cols; i += 1) {
        const value = table[0][i - 1].value + table[0][i - 2].value;
        recordStep(steps, table, 0, i, [{ r: 0, c: i - 1 }, { r: 0, c: i - 2 }], value, STATUS.COMPUTED);
      }
      return { steps, initialTable, tableMeta: tableMeta(1, cols) };
    }
  },
  {
    id: 'dp-02',
    title: 'Min Cost Climbing Stairs',
    difficulty: 2,
    problemText: [
      'You are given an array cost where cost[i] is the cost of step i.',
      'You can start from step 0 or step 1 and each move climbs 1 or 2 steps.',
      'Return the minimum cost to reach the top (beyond the last index).',
      'Constraints: 2 <= cost.length <= 30, 0 <= cost[i] <= 100.'
    ].join('\n\n'),
    ioFormat: 'Input: cost array. Output: minimum cost to reach the top.',
    examples: [
      { input: { cost: [10, 15, 20] }, output: 15 },
      { input: { cost: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1] }, output: 6 },
      { input: { cost: [5, 5] }, output: 5 },
      { input: { cost: [0, 2, 2, 1] }, output: 2 },
      { input: { cost: [3, 4, 5, 6] }, output: 8 }
    ],
    defaultInput: { cost: [10, 15, 20] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'cost', label: 'Cost array', type: 'intArray', min: 0, max: 100, minLength: 2, maxLength: 30, help: 'Space or comma separated costs.' }
      ]
    },
    hints: [
      { level: 'Observation', text: ['The top is one step beyond the last index.'] },
      { level: 'StateSuggestion', text: ['Let dp[i] be the minimum cost to reach step i.'] },
      { level: 'TransitionSuggestion', text: ['dp[i] comes from min of (dp[i-1]+cost[i-1]) and (dp[i-2]+cost[i-2]).'] },
      { level: 'Complexity', text: ['A single pass computes the result in O(n).'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.cost.length + 1 }),
      iterationOrder: 'i increasing from 2 to n',
      dependencyOffsets: [-1, -2],
      baseCaseInitializer: 'dp[0] = 0, dp[1] = 0',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'mincost', label: 'dp[i] for min cost', meaning: 'dp[i] = minimum cost to reach step i', baseCases: ['dp[0] = 0', 'dp[1] = 0'] }
    ],
    transitionTemplate: 'dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])',
    codeTemplates: {
      tabulation: `function solve(cost) {\n  const n = cost.length;\n  const dp = Array(n + 1).fill(0);\n  for (let i = 2; i <= n; i += 1) {\n    // TODO: compute dp[i]\n  }\n  return dp[n];\n}\n`,
      memoization: `function solve(cost) {\n  // TODO: fill in memoization transition\n  const n = cost.length;\n  const memo = new Map();\n  function best(i) {\n    if (i <= 1) return 0;\n    if (memo.has(i)) return memo.get(i);\n    const value = Math.min(best(i - 1) + cost[i - 1], best(i - 2) + cost[i - 2]);\n    memo.set(i, value);\n    return value;\n  }\n  return best(n);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i] stores which quantity?', type: 'mc', options: ['Min cost to reach step i', 'Ways to reach step i', 'Max profit'], answer: 'Min cost to reach step i' },
      { prompt: 'Which steps are free to start?', type: 'mc', options: ['Step 0 or step 1', 'Only step 0', 'Only step 1'], answer: 'Step 0 or step 1' },
      { prompt: 'Dependencies use i-1 and i-2.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity class?', type: 'mc', options: ['O(n)', 'O(n log n)', 'O(2^n)'], answer: 'O(n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract1D(table, table[0].length - 1),
    computeSteps: (input) => {
      const cols = input.cost.length + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      recordStep(steps, table, 0, 0, [], 0, STATUS.BASE);
      if (cols > 1) {
        recordStep(steps, table, 0, 1, [], 0, STATUS.BASE);
      }
      for (let i = 2; i < cols; i += 1) {
        const left = table[0][i - 1].value + input.cost[i - 1];
        const right = table[0][i - 2].value + input.cost[i - 2];
        const value = Math.min(left, right);
        recordStep(steps, table, 0, i, [{ r: 0, c: i - 1 }, { r: 0, c: i - 2 }], value, STATUS.COMPUTED);
      }
      return { steps, initialTable, tableMeta: tableMeta(1, cols) };
    }
  },
  {
    id: 'dp-03',
    title: 'House Robber',
    difficulty: 2,
    problemText: [
      'You are given an array nums where nums[i] is the amount of money in the i-th house.',
      'Adjacent houses cannot be robbed on the same night.',
      'Return the maximum amount you can rob.',
      'Constraints: 1 <= nums.length <= 30, 0 <= nums[i] <= 100.'
    ].join('\n\n'),
    ioFormat: 'Input: nums array. Output: maximum rob amount.',
    examples: [
      { input: { nums: [1, 2, 3, 1] }, output: 4 },
      { input: { nums: [2, 7, 9, 3, 1] }, output: 12 },
      { input: { nums: [2, 1, 1, 2] }, output: 4 },
      { input: { nums: [5] }, output: 5 },
      { input: { nums: [4, 10, 3, 1, 5] }, output: 15 }
    ],
    defaultInput: { nums: [2, 7, 9, 3, 1] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'nums', label: 'House values', type: 'intArray', min: 0, max: 100, minLength: 1, maxLength: 30 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['At each house you either rob it (skip previous) or skip it (take previous best).'] },
      { level: 'StateSuggestion', text: ['Let dp[i] be the max money from the first i houses.'] },
      { level: 'TransitionSuggestion', text: ['dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]).'] },
      { level: 'Complexity', text: ['Linear time with constant extra space possible.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.nums.length + 1 }),
      iterationOrder: 'i increasing from 2 to n',
      dependencyOffsets: [-1, -2],
      baseCaseInitializer: 'dp[0] = 0, dp[1] = nums[0]',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'rob', label: 'dp[i] for max loot', meaning: 'dp[i] = max money from first i houses', baseCases: ['dp[0] = 0', 'dp[1] = nums[0]'] }
    ],
    transitionTemplate: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])',
    codeTemplates: {
      tabulation: `function solve(nums) {\n  const n = nums.length;\n  const dp = Array(n + 1).fill(0);\n  dp[1] = nums[0] ?? 0;\n  for (let i = 2; i <= n; i += 1) {\n    // TODO: compute dp[i]\n  }\n  return dp[n];\n}\n`,
      memoization: `function solve(nums) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function best(i) {\n    if (i <= 0) return 0;\n    if (i === 1) return nums[0];\n    if (memo.has(i)) return memo.get(i);\n    const value = Math.max(best(i - 1), best(i - 2) + nums[i - 1]);\n    memo.set(i, value);\n    return value;\n  }\n  return best(nums.length);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i] represents:', type: 'mc', options: ['Max money from first i houses', 'Ways to rob i houses', 'Min alarms'], answer: 'Max money from first i houses' },
      { prompt: 'Which houses can be robbed together?', type: 'mc', options: ['Non-adjacent', 'Adjacent only', 'All'], answer: 'Non-adjacent' },
      { prompt: 'Transition uses dp[i-1] and dp[i-2].', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(n)', 'O(n^2)', 'O(log n)'], answer: 'O(n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract1D(table, table[0].length - 1),
    computeSteps: (input) => {
      const cols = input.nums.length + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      recordStep(steps, table, 0, 0, [], 0, STATUS.BASE);
      if (cols > 1) {
        recordStep(steps, table, 0, 1, [], input.nums[0], STATUS.BASE);
      }
      for (let i = 2; i < cols; i += 1) {
        const skip = table[0][i - 1].value;
        const take = table[0][i - 2].value + input.nums[i - 1];
        const value = Math.max(skip, take);
        recordStep(steps, table, 0, i, [{ r: 0, c: i - 1 }, { r: 0, c: i - 2 }], value, STATUS.COMPUTED);
      }
      return { steps, initialTable, tableMeta: tableMeta(1, cols) };
    }
  },
  {
    id: 'dp-04',
    title: 'Coin Change (Min Coins)',
    difficulty: 3,
    problemText: [
      'You are given coins of different denominations and a total amount.',
      'Return the fewest number of coins needed to make up that amount. If it is not possible, return -1.',
      'Constraints: 1 <= coins.length <= 8, 1 <= coins[i] <= 20, 0 <= amount <= 50.'
    ].join('\n\n'),
    ioFormat: 'Input: coins array, amount. Output: minimum coin count or -1.',
    examples: [
      { input: { coins: [1, 2, 5], amount: 11 }, output: 3 },
      { input: { coins: [2], amount: 3 }, output: -1 },
      { input: { coins: [1], amount: 0 }, output: 0 },
      { input: { coins: [1, 3, 4], amount: 6 }, output: 2 },
      { input: { coins: [2, 5, 10], amount: 7 }, output: -1 }
    ],
    defaultInput: { coins: [1, 2, 5], amount: 11 },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'coins', label: 'Coin denominations', type: 'coinSet', min: 1, max: 20, minLength: 1, maxLength: 8, unique: true },
        { key: 'amount', label: 'Target amount', type: 'int', min: 0, max: 50 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Try building the answer from amount 0 up to the target.'] },
      { level: 'StateSuggestion', text: ['Let dp[a] be the minimum coins needed for amount a.'] },
      { level: 'TransitionSuggestion', text: ['dp[a] = min(dp[a], dp[a-coin] + 1) for each coin.'] },
      { level: 'Pitfall', text: ['Use Infinity for unreachable amounts so min comparisons stay clean.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.amount + 1 }),
      iterationOrder: 'amount increasing, coins inner',
      dependencyOffsets: 'allPrevious',
      baseCaseInitializer: 'dp[0] = 0, dp[a] = Infinity for a > 0',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'coin', label: 'dp[a] for min coins', meaning: 'dp[a] = minimum coins to make amount a', baseCases: ['dp[0] = 0'] }
    ],
    transitionTemplate: 'dp[i] = min(dp[i], dp[i-coin] + 1)',
    codeTemplates: {
      tabulation: `function solve(coins, amount) {\n  const dp = Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let a = 1; a <= amount; a += 1) {\n    for (const coin of coins) {\n      if (a - coin >= 0) {\n        // TODO: update dp[a]\n      }\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n`,
      memoization: `function solve(coins, amount) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function best(a) {\n    if (a === 0) return 0;\n    if (a < 0) return Infinity;\n    if (memo.has(a)) return memo.get(a);\n    let res = Infinity;\n    for (const coin of coins) {\n      res = Math.min(res, best(a - coin) + 1);\n    }\n    memo.set(a, res);\n    return res;\n  }\n  const ans = best(amount);\n  return ans === Infinity ? -1 : ans;\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[a] means:', type: 'mc', options: ['Min coins for amount a', 'Max coins for amount a', 'Ways to make amount a'], answer: 'Min coins for amount a' },
      { prompt: 'What is dp[0]?', type: 'mc', options: ['0', 'Infinity', '1'], answer: '0' },
      { prompt: 'Dependencies come from smaller amounts.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Complexity (n=amount, c=coins)?', type: 'mc', options: ['O(n*c)', 'O(n^2)', 'O(c)'], answer: 'O(n*c)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => {
      const value = extract1D(table, table[0].length - 1);
      return value === Infinity ? -1 : value;
    },
    computeSteps: (input) => {
      const cols = input.amount + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      recordStep(steps, table, 0, 0, [], 0, STATUS.BASE);
      for (let a = 1; a < cols; a += 1) {
        let best = Infinity;
        const reads = [];
        for (const coin of input.coins) {
          if (a - coin >= 0) {
            reads.push({ r: 0, c: a - coin });
            const candidate = table[0][a - coin].value + 1;
            if (candidate < best) best = candidate;
          }
        }
        const status = best === Infinity ? STATUS.UNREACHABLE : STATUS.COMPUTED;
        recordStep(steps, table, 0, a, reads, best, status);
      }
      return { steps, initialTable, tableMeta: tableMeta(1, cols) };
    }
  },
  {
    id: 'dp-05',
    title: 'Partition Equal Subset Sum',
    difficulty: 3,
    problemText: [
      'Given a set of positive integers nums, determine if you can partition it into two subsets with equal sum.',
      'Return true if possible, otherwise false.',
      'Constraints: 1 <= nums.length <= 20, 1 <= nums[i] <= 40.'
    ].join('\n\n'),
    ioFormat: 'Input: nums array. Output: boolean result.',
    examples: [
      { input: { nums: [1, 5, 11, 5] }, output: true },
      { input: { nums: [1, 2, 3, 5] }, output: false },
      { input: { nums: [2, 2, 3, 5] }, output: false },
      { input: { nums: [3, 3, 3, 4, 5] }, output: true },
      { input: { nums: [1, 1, 1, 1, 1, 1] }, output: true }
    ],
    defaultInput: { nums: [1, 5, 11, 5] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'nums', label: 'Set values', type: 'intArray', min: 1, max: 40, minLength: 1, maxLength: 20 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['If total sum is odd, equal partition is impossible.'] },
      { level: 'StateSuggestion', text: ['Let dp[i][s] be true if a subset of first i numbers can make sum s.'] },
      { level: 'TransitionSuggestion', text: ['dp[i][s] = dp[i-1][s] OR dp[i-1][s-nums[i-1]].'] },
      { level: 'Pitfall', text: ['Watch the off-by-one: dp uses counts, nums uses zero-based indexing.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => {
        const sum = input.nums.reduce((a, b) => a + b, 0);
        const target = Math.floor(sum / 2);
        return { rows: input.nums.length + 1, cols: target + 1 };
      },
      iterationOrder: 'i increasing, s increasing',
      dependencyOffsets: 'allPrevious2D',
      baseCaseInitializer: 'dp[0][0] = true, dp[0][s>0] = false',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'subset', label: 'dp[i][s] for subset sum', meaning: 'dp[i][s] = can make sum s with first i numbers', baseCases: ['dp[0][0] = true', 'dp[0][s>0] = false'] }
    ],
    transitionTemplate: 'dp[i][j] = dp[i-1][j] OR dp[i-1][j-nums[i-1]]',
    codeTemplates: {
      tabulation: `function solve(nums) {\n  const sum = nums.reduce((a, b) => a + b, 0);\n  if (sum % 2 !== 0) return false;\n  const target = sum / 2;\n  const dp = Array.from({ length: nums.length + 1 }, () => Array(target + 1).fill(false));\n  dp[0][0] = true;\n  for (let i = 1; i <= nums.length; i += 1) {\n    for (let s = 0; s <= target; s += 1) {\n      // TODO: fill dp[i][s]\n    }\n  }\n  return dp[nums.length][target];\n}\n`,
      memoization: `function solve(nums) {\n  // TODO: fill in memoization transition\n  const sum = nums.reduce((a, b) => a + b, 0);\n  if (sum % 2 !== 0) return false;\n  const target = sum / 2;\n  const memo = new Map();\n  function can(i, s) {\n    if (s === 0) return true;\n    if (i === 0) return false;\n    const key = i + ',' + s;\n    if (memo.has(key)) return memo.get(key);\n    let res = can(i - 1, s);\n    if (s >= nums[i - 1]) res = res || can(i - 1, s - nums[i - 1]);\n    memo.set(key, res);\n    return res;\n  }\n  return can(nums.length, target);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i][s] stands for:', type: 'mc', options: ['Subset sum reachability', 'Min subset size', 'Sum of first i numbers'], answer: 'Subset sum reachability' },
      { prompt: 'What happens if total sum is odd?', type: 'mc', options: ['Return false', 'Return true', 'Ignore'], answer: 'Return false' },
      { prompt: 'Dependencies come from previous row.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity class?', type: 'mc', options: ['O(n*target)', 'O(n^2)', 'O(target^2)'], answer: 'O(n*target)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table, meta) => {
      if (meta && meta.valid === false) return false;
      return Boolean(extract2D(table, table.length - 1, table[0].length - 1));
    },
    computeSteps: (input) => {
      const sum = input.nums.reduce((a, b) => a + b, 0);
      const valid = sum % 2 === 0;
      const target = Math.floor(sum / 2);
      const rows = input.nums.length + 1;
      const cols = target + 1;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      for (let s = 0; s < cols; s += 1) {
        const value = s === 0;
        recordStep(steps, table, 0, s, [], value, STATUS.BASE);
      }
      for (let i = 1; i < rows; i += 1) {
        for (let s = 0; s < cols; s += 1) {
          const reads = [{ r: i - 1, c: s }];
          let value = table[i - 1][s].value;
          if (s >= input.nums[i - 1]) {
            reads.push({ r: i - 1, c: s - input.nums[i - 1] });
            value = value || table[i - 1][s - input.nums[i - 1]].value;
          }
          recordStep(steps, table, i, s, reads, Boolean(value), STATUS.COMPUTED);
        }
      }
      const meta = tableMeta(rows, cols);
      meta.valid = valid;
      return { steps, initialTable, tableMeta: meta };
    }
  },
  {
    id: 'dp-06',
    title: 'Unique Paths',
    difficulty: 2,
    problemText: [
      'A robot is located at the top-left corner of an m x n grid.',
      'It can only move either down or right at any point in time.',
      'Return the number of unique paths to reach the bottom-right corner.',
      'Constraints: 1 <= m, n <= 10.'
    ].join('\n\n'),
    ioFormat: 'Input: m, n. Output: count of unique paths.',
    examples: [
      { input: { m: 3, n: 7 }, output: 28 },
      { input: { m: 3, n: 2 }, output: 3 },
      { input: { m: 7, n: 3 }, output: 28 },
      { input: { m: 3, n: 3 }, output: 6 },
      { input: { m: 1, n: 5 }, output: 1 }
    ],
    defaultInput: { m: 3, n: 7 },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'm', label: 'Rows (m)', type: 'int', min: 1, max: 10 },
        { key: 'n', label: 'Cols (n)', type: 'int', min: 1, max: 10 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['To reach (r,c), you must come from top or left.'] },
      { level: 'StateSuggestion', text: ['Let dp[r][c] be the number of ways to reach cell (r,c).'] },
      { level: 'TransitionSuggestion', text: ['dp[r][c] = dp[r-1][c] + dp[r][c-1].'] },
      { level: 'Complexity', text: ['Fill the grid once: O(m*n).'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => ({ rows: input.m, cols: input.n }),
      iterationOrder: 'row-major',
      dependencyOffsets: [{ dr: -1, dc: 0 }, { dr: 0, dc: -1 }],
      baseCaseInitializer: 'dp[0][c] = 1, dp[r][0] = 1',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'paths', label: 'dp[r][c] for paths', meaning: 'dp[r][c] = ways to reach cell (r,c)', baseCases: ['dp[0][c] = 1', 'dp[r][0] = 1'] }
    ],
    transitionTemplate: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]',
    codeTemplates: {
      tabulation: `function solve(m, n) {\n  const dp = Array.from({ length: m }, () => Array(n).fill(0));\n  for (let r = 0; r < m; r += 1) dp[r][0] = 1;\n  for (let c = 0; c < n; c += 1) dp[0][c] = 1;\n  for (let r = 1; r < m; r += 1) {\n    for (let c = 1; c < n; c += 1) {\n      // TODO: fill dp[r][c]\n    }\n  }\n  return dp[m - 1][n - 1];\n}\n`,
      memoization: `function solve(m, n) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function ways(r, c) {\n    if (r === 0 || c === 0) return 1;\n    const key = r + ',' + c;\n    if (memo.has(key)) return memo.get(key);\n    const value = ways(r - 1, c) + ways(r, c - 1);\n    memo.set(key, value);\n    return value;\n  }\n  return ways(m - 1, n - 1);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[r][c] means:', type: 'mc', options: ['Ways to reach (r,c)', 'Min cost to reach (r,c)', 'Steps remaining'], answer: 'Ways to reach (r,c)' },
      { prompt: 'Which cells are base cases?', type: 'mc', options: ['First row and first column', 'Only (0,0)', 'Last row'], answer: 'First row and first column' },
      { prompt: 'Dependencies come from top and left.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(m*n)', 'O(m+n)', 'O(2^(m+n))'], answer: 'O(m*n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1),
    computeSteps: (input) => {
      const rows = input.m;
      const cols = input.n;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const steps = [];

      for (let r = 0; r < rows; r += 1) {
        recordStep(steps, table, r, 0, [], 1, STATUS.BASE);
      }
      for (let c = 1; c < cols; c += 1) {
        recordStep(steps, table, 0, c, [], 1, STATUS.BASE);
      }
      for (let r = 1; r < rows; r += 1) {
        for (let c = 1; c < cols; c += 1) {
          const value = table[r - 1][c].value + table[r][c - 1].value;
          recordStep(steps, table, r, c, [{ r: r - 1, c }, { r, c: c - 1 }], value, STATUS.COMPUTED);
        }
      }
      return { steps, initialTable, tableMeta: tableMeta(rows, cols) };
    }
  },
  {
    id: 'dp-07',
    title: 'Unique Paths with Obstacles',
    difficulty: 3,
    problemText: [
      'You are given an m x n grid with obstacles marked as 1 and free cells marked as 0.',
      'The robot starts at (0,0) and can move only right or down.',
      'Return the number of unique paths to reach (m-1,n-1).',
      'Constraints: 1 <= m, n <= 8.'
    ].join('\n\n'),
    ioFormat: 'Input: obstacle grid. Output: number of unique paths.',
    examples: [
      { input: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }, output: 2 },
      { input: { grid: [[0, 1], [0, 0]] }, output: 1 },
      { input: { grid: [[0, 0], [1, 0]] }, output: 1 },
      { input: { grid: [[0]] }, output: 1 },
      { input: { grid: [[1]] }, output: 0 }
    ],
    defaultInput: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        {
          key: 'grid',
          label: 'Obstacle grid (0 free, 1 blocked)',
          type: 'gridBool',
          minRows: 1,
          maxRows: 8,
          minCols: 1,
          maxCols: 8,
          help: 'Enter rows with 0/1 values.'
        }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Obstacles reset the path count to zero.'] },
      { level: 'StateSuggestion', text: ['dp[r][c] = ways to reach cell (r,c) without crossing obstacles.'] },
      { level: 'TransitionSuggestion', text: ['If cell is blocked, dp[r][c] = 0; else add top and left.'] },
      { level: 'Pitfall', text: ['If start is blocked, answer is 0 immediately.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => ({ rows: input.grid.length, cols: input.grid[0].length }),
      iterationOrder: 'row-major',
      dependencyOffsets: [{ dr: -1, dc: 0 }, { dr: 0, dc: -1 }],
      baseCaseInitializer: 'dp[0][0] = 1 if not blocked',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'obstacle', label: 'dp[r][c] for paths with blocks', meaning: 'dp[r][c] = number of valid paths to (r,c)', baseCases: ['dp[0][0] = 1 if free, else 0'] }
    ],
    transitionTemplate: 'if blocked -> 0 else dp[i][j] = dp[i-1][j] + dp[i][j-1]',
    codeTemplates: {
      tabulation: `function solve(grid) {\n  const m = grid.length;\n  const n = grid[0].length;\n  const dp = Array.from({ length: m }, () => Array(n).fill(0));\n  dp[0][0] = grid[0][0] === 0 ? 1 : 0;\n  for (let r = 0; r < m; r += 1) {\n    for (let c = 0; c < n; c += 1) {\n      if (grid[r][c] === 1) {\n        dp[r][c] = 0;\n        continue;\n      }\n      if (r === 0 && c === 0) continue;\n      // TODO: update dp[r][c]\n    }\n  }\n  return dp[m - 1][n - 1];\n}\n`,
      memoization: `function solve(grid) {\n  // TODO: fill in memoization transition\n  const m = grid.length;\n  const n = grid[0].length;\n  const memo = new Map();\n  function ways(r, c) {\n    if (r < 0 || c < 0) return 0;\n    if (grid[r][c] === 1) return 0;\n    if (r === 0 && c === 0) return 1;\n    const key = r + ',' + c;\n    if (memo.has(key)) return memo.get(key);\n    const value = ways(r - 1, c) + ways(r, c - 1);\n    memo.set(key, value);\n    return value;\n  }\n  return ways(m - 1, n - 1);\n}\n`
    },
    selfCheck: [
      { prompt: 'Blocked cells contribute:', type: 'mc', options: ['0 paths', '1 path', 'Infinity'], answer: '0 paths' },
      { prompt: 'Start cell blocked means:', type: 'mc', options: ['Answer 0', 'Answer 1', 'Skip start'], answer: 'Answer 0' },
      { prompt: 'Dependencies come from top/left.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(m*n)', 'O(m+n)', 'O(2^(m+n))'], answer: 'O(m*n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1),
    computeSteps: (input) => {
      const rows = input.grid.length;
      const cols = input.grid[0].length;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const steps = [];

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const reads = [];
          if (input.grid[r][c] === 1) {
            recordStep(steps, table, r, c, reads, 0, STATUS.UNREACHABLE);
            continue;
          }
          if (r === 0 && c === 0) {
            recordStep(steps, table, r, c, [], 1, STATUS.BASE);
            continue;
          }
          let value = 0;
          if (r > 0) {
            reads.push({ r: r - 1, c });
            value += table[r - 1][c].value;
          }
          if (c > 0) {
            reads.push({ r, c: c - 1 });
            value += table[r][c - 1].value;
          }
          recordStep(steps, table, r, c, reads, value, STATUS.COMPUTED);
        }
      }
      return { steps, initialTable, tableMeta: tableMeta(rows, cols) };
    }
  },
  {
    id: 'dp-08',
    title: 'Minimum Path Sum',
    difficulty: 3,
    problemText: [
      'Given a grid of non-negative integers, find a path from top-left to bottom-right that minimizes the sum of numbers along the path.',
      'You may move only right or down.',
      'Constraints: 1 <= m, n <= 8, 0 <= grid[r][c] <= 9.'
    ].join('\n\n'),
    ioFormat: 'Input: grid. Output: minimum path sum.',
    examples: [
      { input: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] }, output: 7 },
      { input: { grid: [[1, 2, 3], [4, 5, 6]] }, output: 12 },
      { input: { grid: [[5]] }, output: 5 },
      { input: { grid: [[1, 2], [1, 1]] }, output: 3 },
      { input: { grid: [[1, 4, 2], [2, 1, 5], [3, 2, 1]] }, output: 7 }
    ],
    defaultInput: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'grid', label: 'Weight grid', type: 'gridInt', min: 0, max: 9, minRows: 1, maxRows: 8, minCols: 1, maxCols: 8 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['The optimal path to a cell uses the optimal path to its predecessor.'] },
      { level: 'StateSuggestion', text: ['Let dp[r][c] be the minimum sum to reach (r,c).'] },
      { level: 'TransitionSuggestion', text: ['dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).'] },
      { level: 'Complexity', text: ['O(m*n) time and space.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => ({ rows: input.grid.length, cols: input.grid[0].length }),
      iterationOrder: 'row-major',
      dependencyOffsets: [{ dr: -1, dc: 0 }, { dr: 0, dc: -1 }],
      baseCaseInitializer: 'dp[0][0] = grid[0][0]',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'minpath', label: 'dp[r][c] for min sum', meaning: 'dp[r][c] = minimum path sum to (r,c)', baseCases: ['dp[0][0] = grid[0][0]'] }
    ],
    transitionTemplate: 'dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])',
    codeTemplates: {
      tabulation: `function solve(grid) {\n  const m = grid.length;\n  const n = grid[0].length;\n  const dp = Array.from({ length: m }, () => Array(n).fill(0));\n  dp[0][0] = grid[0][0];\n  for (let r = 0; r < m; r += 1) {\n    for (let c = 0; c < n; c += 1) {\n      if (r === 0 && c === 0) continue;\n      // TODO: fill dp[r][c]\n    }\n  }\n  return dp[m - 1][n - 1];\n}\n`,
      memoization: `function solve(grid) {\n  // TODO: fill in memoization transition\n  const m = grid.length;\n  const n = grid[0].length;\n  const memo = new Map();\n  function best(r, c) {\n    if (r === 0 && c === 0) return grid[0][0];\n    if (r < 0 || c < 0) return Infinity;\n    const key = r + ',' + c;\n    if (memo.has(key)) return memo.get(key);\n    const value = grid[r][c] + Math.min(best(r - 1, c), best(r, c - 1));\n    memo.set(key, value);\n    return value;\n  }\n  return best(m - 1, n - 1);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[r][c] tracks:', type: 'mc', options: ['Min sum to reach (r,c)', 'Max sum to reach (r,c)', 'Steps remaining'], answer: 'Min sum to reach (r,c)' },
      { prompt: 'Which moves are allowed?', type: 'mc', options: ['Right and down', 'Any direction', 'Up and left'], answer: 'Right and down' },
      { prompt: 'Dependencies come from top/left.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(m*n)', 'O(m+n)', 'O(2^(m+n))'], answer: 'O(m*n)' }
    ],
    supportsReconstruction: true,
    outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1),
    computeSteps: (input) => {
      const rows = input.grid.length;
      const cols = input.grid[0].length;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const predecessors = Array.from({ length: rows }, () => Array(cols).fill(null));
      const steps = [];

      recordStep(steps, table, 0, 0, [], input.grid[0][0], STATUS.BASE);
      for (let c = 1; c < cols; c += 1) {
        const value = table[0][c - 1].value + input.grid[0][c];
        predecessors[0][c] = { r: 0, c: c - 1 };
        recordStep(steps, table, 0, c, [{ r: 0, c: c - 1 }], value, STATUS.COMPUTED, predecessors[0][c]);
      }
      for (let r = 1; r < rows; r += 1) {
        const value = table[r - 1][0].value + input.grid[r][0];
        predecessors[r][0] = { r: r - 1, c: 0 };
        recordStep(steps, table, r, 0, [{ r: r - 1, c: 0 }], value, STATUS.COMPUTED, predecessors[r][0]);
      }
      for (let r = 1; r < rows; r += 1) {
        for (let c = 1; c < cols; c += 1) {
          const top = table[r - 1][c].value;
          const left = table[r][c - 1].value;
          const useTop = top <= left;
          const value = input.grid[r][c] + Math.min(top, left);
          predecessors[r][c] = useTop ? { r: r - 1, c } : { r, c: c - 1 };
          recordStep(steps, table, r, c, [{ r: r - 1, c }, { r, c: c - 1 }], value, STATUS.COMPUTED, predecessors[r][c]);
        }
      }

      const path = reconstructPath(predecessors, { r: rows - 1, c: cols - 1 });
      return { steps, initialTable, tableMeta: tableMeta(rows, cols), reconstructionPath: path };
    }
  },
  {
    id: 'dp-09',
    title: 'Longest Increasing Subsequence',
    difficulty: 4,
    problemText: [
      'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
      'Constraints: 1 <= nums.length <= 20, -10 <= nums[i] <= 50.'
    ].join('\n\n'),
    ioFormat: 'Input: nums array. Output: LIS length.',
    examples: [
      { input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, output: 4 },
      { input: { nums: [0, 1, 0, 3, 2, 3] }, output: 4 },
      { input: { nums: [7, 7, 7, 7] }, output: 1 },
      { input: { nums: [1, 2, 3, 4, 5] }, output: 5 },
      { input: { nums: [4, 10, 4, 3, 8, 9] }, output: 3 }
    ],
    defaultInput: { nums: [10, 9, 2, 5, 3, 7, 101, 18] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'nums', label: 'Sequence values', type: 'intArray', min: -10, max: 50, minLength: 1, maxLength: 20 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Every index can be the end of some increasing subsequence.'] },
      { level: 'StateSuggestion', text: ['Let dp[i] be the length of the LIS that ends at i.'] },
      { level: 'TransitionSuggestion', text: ['dp[i] = 1 + max(dp[j]) for all j < i with nums[j] < nums[i].'] },
      { level: 'Complexity', text: ['O(n^2) with a simple DP approach.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.nums.length }),
      iterationOrder: 'i increasing with fan-in to all previous j',
      dependencyOffsets: 'allPrevious',
      baseCaseInitializer: 'dp[i] starts at 1',
      outputExtractor: (table) => Math.max(...table[0].map((cell) => cell.value || 0))
    },
    statePatterns: [
      { id: 'lis', label: 'dp[i] for LIS end', meaning: 'dp[i] = LIS length ending at i', baseCases: ['dp[i] = 1 for each i'] }
    ],
    transitionTemplate: 'dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i]',
    codeTemplates: {
      tabulation: `function solve(nums) {\n  const n = nums.length;\n  const dp = Array(n).fill(1);\n  for (let i = 1; i < n; i += 1) {\n    for (let j = 0; j < i; j += 1) {\n      if (nums[j] < nums[i]) {\n        // TODO: update dp[i]\n      }\n    }\n  }\n  return Math.max(...dp);\n}\n`,
      memoization: `function solve(nums) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function best(i) {\n    if (memo.has(i)) return memo.get(i);\n    let value = 1;\n    for (let j = 0; j < i; j += 1) {\n      if (nums[j] < nums[i]) {\n        value = Math.max(value, 1 + best(j));\n      }\n    }\n    memo.set(i, value);\n    return value;\n  }\n  let ans = 0;\n  for (let i = 0; i < nums.length; i += 1) ans = Math.max(ans, best(i));\n  return ans;\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i] represents:', type: 'mc', options: ['LIS ending at i', 'LIS starting at i', 'Global LIS'], answer: 'LIS ending at i' },
      { prompt: 'Dependencies consider all j<i.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Base value for dp[i] is:', type: 'mc', options: ['1', '0', 'nums[i]'], answer: '1' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(n^2)', 'O(n)', 'O(log n)'], answer: 'O(n^2)' }
    ],
    supportsReconstruction: true,
    outputExtractor: (table) => Math.max(...table[0].map((cell) => cell.value || 0)),
    computeSteps: (input) => {
      const cols = input.nums.length;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const predecessors = Array(cols).fill(null);
      const steps = [];

      for (let i = 0; i < cols; i += 1) {
        let best = 1;
        let bestPred = null;
        const reads = [];
        for (let j = 0; j < i; j += 1) {
          if (input.nums[j] < input.nums[i]) {
            reads.push({ r: 0, c: j });
            const candidate = table[0][j].value + 1;
            if (candidate > best) {
              best = candidate;
              bestPred = j;
            }
          }
        }
        predecessors[i] = bestPred;
        const status = i === 0 ? STATUS.BASE : STATUS.COMPUTED;
        recordStep(steps, table, 0, i, reads, best, status, bestPred !== null ? { r: 0, c: bestPred } : null);
      }

      let maxIndex = 0;
      for (let i = 1; i < cols; i += 1) {
        if (table[0][i].value > table[0][maxIndex].value) maxIndex = i;
      }
      const path = reconstructIndices(predecessors, maxIndex).map((idx) => `i=${idx}`);
      return { steps, initialTable, tableMeta: tableMeta(1, cols), reconstructionPath: path };
    }
  },
  {
    id: 'dp-10',
    title: 'Longest Common Subsequence',
    difficulty: 4,
    problemText: [
      'Given two strings text1 and text2, return the length of their longest common subsequence.',
      'A subsequence does not need to be contiguous.',
      'Constraints: 1 <= text1.length, text2.length <= 15. Characters are lowercase letters.'
    ].join('\n\n'),
    ioFormat: 'Input: text1, text2. Output: LCS length.',
    examples: [
      { input: { text1: 'abcde', text2: 'ace' }, output: 3 },
      { input: { text1: 'abc', text2: 'abc' }, output: 3 },
      { input: { text1: 'abc', text2: 'def' }, output: 0 },
      { input: { text1: 'aggtab', text2: 'gxtxayb' }, output: 4 },
      { input: { text1: 'aaaa', text2: 'aa' }, output: 2 }
    ],
    defaultInput: { text1: 'abcde', text2: 'ace' },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'text1', label: 'Text 1', type: 'string', minLength: 1, maxLength: 15, pattern: /^[a-z]+$/, patternMessage: 'Lowercase letters only.' },
        { key: 'text2', label: 'Text 2', type: 'string', minLength: 1, maxLength: 15, pattern: /^[a-z]+$/, patternMessage: 'Lowercase letters only.' }
      ]
    },
    hints: [
      { level: 'Observation', text: ['If last characters match, they extend the LCS by 1.'] },
      { level: 'StateSuggestion', text: ['Let dp[i][j] be the LCS length for prefixes of length i and j.'] },
      { level: 'TransitionSuggestion', text: ['If chars equal: dp[i][j]=dp[i-1][j-1]+1; else max of top/left.'] },
      { level: 'Complexity', text: ['O(m*n) time and space.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => ({ rows: input.text1.length + 1, cols: input.text2.length + 1 }),
      iterationOrder: 'row-major',
      dependencyOffsets: 'allPrevious2D',
      baseCaseInitializer: 'dp[0][*] = 0 and dp[*][0] = 0',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'lcs', label: 'dp[i][j] for LCS', meaning: 'dp[i][j] = LCS length for text1[0..i) and text2[0..j)', baseCases: ['dp[0][*] = 0', 'dp[*][0] = 0'] }
    ],
    transitionTemplate: 'if match -> dp[i-1][j-1]+1 else max(dp[i-1][j], dp[i][j-1])',
    codeTemplates: {
      tabulation: `function solve(text1, text2) {\n  const m = text1.length;\n  const n = text2.length;\n  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i += 1) {\n    for (let j = 1; j <= n; j += 1) {\n      // TODO: update dp[i][j]\n    }\n  }\n  return dp[m][n];\n}\n`,
      memoization: `function solve(text1, text2) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function best(i, j) {\n    if (i === 0 || j === 0) return 0;\n    const key = i + ',' + j;\n    if (memo.has(key)) return memo.get(key);\n    let value;\n    if (text1[i - 1] === text2[j - 1]) {\n      value = best(i - 1, j - 1) + 1;\n    } else {\n      value = Math.max(best(i - 1, j), best(i, j - 1));\n    }\n    memo.set(key, value);\n    return value;\n  }\n  return best(text1.length, text2.length);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i][j] represents:', type: 'mc', options: ['LCS length of prefixes', 'Common substring length', 'Edit distance'], answer: 'LCS length of prefixes' },
      { prompt: 'When chars match, dependency is:', type: 'mc', options: ['Diagonal', 'Top', 'Left'], answer: 'Diagonal' },
      { prompt: 'Base cases are zeroed row/col.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(m*n)', 'O(m+n)', 'O(m*n*log n)'], answer: 'O(m*n)' }
    ],
    supportsReconstruction: true,
    outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1),
    computeSteps: (input) => {
      const rows = input.text1.length + 1;
      const cols = input.text2.length + 1;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const predecessors = Array.from({ length: rows }, () => Array(cols).fill(null));
      const steps = [];

      for (let r = 0; r < rows; r += 1) {
        recordStep(steps, table, r, 0, [], 0, STATUS.BASE);
      }
      for (let c = 1; c < cols; c += 1) {
        recordStep(steps, table, 0, c, [], 0, STATUS.BASE);
      }

      for (let i = 1; i < rows; i += 1) {
        for (let j = 1; j < cols; j += 1) {
          const reads = [{ r: i - 1, c: j }, { r: i, c: j - 1 }, { r: i - 1, c: j - 1 }];
          let value;
          if (input.text1[i - 1] === input.text2[j - 1]) {
            value = table[i - 1][j - 1].value + 1;
            predecessors[i][j] = { r: i - 1, c: j - 1 };
          } else {
            const top = table[i - 1][j].value;
            const left = table[i][j - 1].value;
            if (top >= left) {
              value = top;
              predecessors[i][j] = { r: i - 1, c: j };
            } else {
              value = left;
              predecessors[i][j] = { r: i, c: j - 1 };
            }
          }
          recordStep(steps, table, i, j, reads, value, STATUS.COMPUTED, predecessors[i][j]);
        }
      }

      const path = reconstructPath(predecessors, { r: rows - 1, c: cols - 1 });
      return { steps, initialTable, tableMeta: tableMeta(rows, cols), reconstructionPath: path };
    }
  },
  {
    id: 'dp-11',
    title: 'Edit Distance',
    difficulty: 4,
    problemText: [
      'Given two strings word1 and word2, return the minimum number of operations to convert word1 to word2.',
      'Operations allowed: insert, delete, or replace a character.',
      'Constraints: 0 <= word1.length, word2.length <= 12. Characters are lowercase letters.'
    ].join('\n\n'),
    ioFormat: 'Input: word1, word2. Output: minimum edit distance.',
    examples: [
      { input: { word1: 'horse', word2: 'ros' }, output: 3 },
      { input: { word1: 'intention', word2: 'execution' }, output: 5 },
      { input: { word1: '', word2: 'a' }, output: 1 },
      { input: { word1: 'ab', word2: 'ab' }, output: 0 },
      { input: { word1: 'kitten', word2: 'sitting' }, output: 3 }
    ],
    defaultInput: { word1: 'horse', word2: 'ros' },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'word1', label: 'Word 1', type: 'string', minLength: 0, maxLength: 12, pattern: /^[a-z]*$/, patternMessage: 'Lowercase letters only.' },
        { key: 'word2', label: 'Word 2', type: 'string', minLength: 0, maxLength: 12, pattern: /^[a-z]*$/, patternMessage: 'Lowercase letters only.' }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Each cell compares prefixes of the two strings.'] },
      { level: 'StateSuggestion', text: ['Let dp[i][j] be the edit distance between word1[0..i) and word2[0..j).'] },
      { level: 'TransitionSuggestion', text: ['If chars match, take diagonal. Else take 1 + min(insert, delete, replace).'] },
      { level: 'Complexity', text: ['O(m*n) time with a full DP table.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => ({ rows: input.word1.length + 1, cols: input.word2.length + 1 }),
      iterationOrder: 'row-major',
      dependencyOffsets: 'allPrevious2D',
      baseCaseInitializer: 'dp[i][0]=i, dp[0][j]=j',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'edit', label: 'dp[i][j] for edit distance', meaning: 'dp[i][j] = min operations to convert word1 prefix to word2 prefix', baseCases: ['dp[i][0] = i', 'dp[0][j] = j'] }
    ],
    transitionTemplate: 'if equal -> dp[i-1][j-1] else 1 + min(top, left, diag)',
    codeTemplates: {
      tabulation: `function solve(word1, word2) {\n  const m = word1.length;\n  const n = word2.length;\n  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));\n  for (let i = 0; i <= m; i += 1) dp[i][0] = i;\n  for (let j = 0; j <= n; j += 1) dp[0][j] = j;\n  for (let i = 1; i <= m; i += 1) {\n    for (let j = 1; j <= n; j += 1) {\n      // TODO: update dp[i][j]\n    }\n  }\n  return dp[m][n];\n}\n`,
      memoization: `function solve(word1, word2) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function dist(i, j) {\n    if (i === 0) return j;\n    if (j === 0) return i;\n    const key = i + ',' + j;\n    if (memo.has(key)) return memo.get(key);\n    let value;\n    if (word1[i - 1] === word2[j - 1]) {\n      value = dist(i - 1, j - 1);\n    } else {\n      value = 1 + Math.min(dist(i - 1, j), dist(i, j - 1), dist(i - 1, j - 1));\n    }\n    memo.set(key, value);\n    return value;\n  }\n  return dist(word1.length, word2.length);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i][j] refers to:', type: 'mc', options: ['Edit distance of prefixes', 'LCS length', 'Number of edits remaining'], answer: 'Edit distance of prefixes' },
      { prompt: 'Base row/col counts deletions/insertions.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Dependencies include top, left, diag.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(m*n)', 'O(m+n)', 'O(2^(m+n))'], answer: 'O(m*n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1),
    computeSteps: (input) => {
      const rows = input.word1.length + 1;
      const cols = input.word2.length + 1;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const steps = [];

      for (let i = 0; i < rows; i += 1) {
        recordStep(steps, table, i, 0, [], i, STATUS.BASE);
      }
      for (let j = 1; j < cols; j += 1) {
        recordStep(steps, table, 0, j, [], j, STATUS.BASE);
      }

      for (let i = 1; i < rows; i += 1) {
        for (let j = 1; j < cols; j += 1) {
          const reads = [{ r: i - 1, c: j }, { r: i, c: j - 1 }, { r: i - 1, c: j - 1 }];
          let value;
          if (input.word1[i - 1] === input.word2[j - 1]) {
            value = table[i - 1][j - 1].value;
          } else {
            value = 1 + Math.min(table[i - 1][j].value, table[i][j - 1].value, table[i - 1][j - 1].value);
          }
          recordStep(steps, table, i, j, reads, value, STATUS.COMPUTED);
        }
      }
      return { steps, initialTable, tableMeta: tableMeta(rows, cols) };
    }
  },
  {
    id: 'dp-12',
    title: '0/1 Knapsack',
    difficulty: 4,
    problemText: [
      'You are given arrays weights and values, where weights[i] and values[i] represent the i-th item.',
      'Given a knapsack capacity W, return the maximum total value achievable without exceeding W.',
      'Each item can be taken at most once.',
      'Constraints: 1 <= n <= 10, 1 <= weights[i] <= 10, 1 <= values[i] <= 50, 0 <= W <= 20.'
    ].join('\n\n'),
    ioFormat: 'Input: weights, values, capacity W. Output: maximum total value.',
    examples: [
      { input: { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], W: 7 }, output: 9 },
      { input: { weights: [2, 3, 4], values: [4, 5, 6], W: 5 }, output: 9 },
      { input: { weights: [1], values: [10], W: 0 }, output: 0 },
      { input: { weights: [5, 4, 6, 3], values: [10, 40, 30, 50], W: 10 }, output: 90 },
      { input: { weights: [2, 2, 6], values: [6, 10, 12], W: 7 }, output: 16 }
    ],
    defaultInput: { weights: [1, 3, 4, 5], values: [1, 4, 5, 7], W: 7 },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'weights', label: 'Weights', type: 'intArray', min: 1, max: 10, minLength: 1, maxLength: 10 },
        { key: 'values', label: 'Values', type: 'intArray', min: 1, max: 50, minLength: 1, maxLength: 10 },
        { key: 'W', label: 'Capacity', type: 'int', min: 0, max: 20 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Each item can be either taken or skipped.'] },
      { level: 'StateSuggestion', text: ['dp[i][w] = best value using first i items with capacity w.'] },
      { level: 'TransitionSuggestion', text: ['dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight]+value).'] },
      { level: 'Pitfall', text: ['In 1D optimization, iterate capacity descending to avoid reusing items.'] }
    ],
    validateInput: (input) => {
      if (input.weights.length !== input.values.length) {
        return 'Weights and values must have the same length.';
      }
      return null;
    },
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '2D',
      tableSizeResolver: (input) => ({ rows: input.weights.length + 1, cols: input.W + 1 }),
      iterationOrder: 'i increasing, w increasing',
      dependencyOffsets: 'allPrevious2D',
      baseCaseInitializer: 'dp[0][w] = 0 and dp[i][0] = 0',
      outputExtractor: (table) => extract2D(table, table.length - 1, table[0].length - 1)
    },
    statePatterns: [
      { id: 'knap', label: 'dp[i][w] for knapsack', meaning: 'dp[i][w] = max value using first i items with capacity w', baseCases: ['dp[0][w] = 0', 'dp[i][0] = 0'] }
    ],
    transitionTemplate: 'dp[i][j] = max(dp[i-1][j], dp[i-1][j-weight] + value)',
    codeTemplates: {
      tabulation: `function solve(weights, values, W) {\n  const n = weights.length;\n  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));\n  for (let i = 1; i <= n; i += 1) {\n    for (let w = 0; w <= W; w += 1) {\n      // TODO: fill dp[i][w]\n    }\n  }\n  return dp[n][W];\n}\n`,
      memoization: `function solve(weights, values, W) {\n  // TODO: fill in memoization transition\n  const n = weights.length;\n  const memo = new Map();\n  function best(i, w) {\n    if (i === 0 || w === 0) return 0;\n    const key = i + ',' + w;\n    if (memo.has(key)) return memo.get(key);\n    let value = best(i - 1, w);\n    if (weights[i - 1] <= w) {\n      value = Math.max(value, best(i - 1, w - weights[i - 1]) + values[i - 1]);\n    }\n    memo.set(key, value);\n    return value;\n  }\n  return best(n, W);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i][w] means:', type: 'mc', options: ['Max value with i items and capacity w', 'Min weight with i items', 'Ways to fill capacity'], answer: 'Max value with i items and capacity w' },
      { prompt: '1D optimization must iterate w:', type: 'mc', options: ['Descending', 'Ascending', 'Either'], answer: 'Descending' },
      { prompt: 'Taking item uses previous row.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(n*W)', 'O(n^2)', 'O(W^2)'], answer: 'O(n*W)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table, meta) => {
      if (meta.view === '1d') return extract1D(table, table[0].length - 1);
      return extract2D(table, table.length - 1, table[0].length - 1);
    },
    computeSteps: (input, mode, lessonState) => {
      const use1D = lessonState.knapsackView === '1d';
      if (use1D) {
        const cols = input.W + 1;
        const initialTable = createTable(1, cols);
        const table = cloneTable(initialTable);
        const steps = [];
        for (let w = 0; w < cols; w += 1) {
          recordStep(steps, table, 0, w, [], 0, STATUS.BASE);
        }
        const order = lessonState.knapsackDirection === 'asc' ? 1 : -1;
        for (let i = 0; i < input.weights.length; i += 1) {
          const weight = input.weights[i];
          const value = input.values[i];
          if (order === 1) {
            for (let w = weight; w < cols; w += 1) {
              const current = table[0][w].value;
              const candidate = table[0][w - weight].value + value;
              const next = Math.max(current, candidate);
              recordStep(steps, table, 0, w, [{ r: 0, c: w }, { r: 0, c: w - weight }], next, STATUS.COMPUTED);
            }
          } else {
            for (let w = cols - 1; w >= weight; w -= 1) {
              const current = table[0][w].value;
              const candidate = table[0][w - weight].value + value;
              const next = Math.max(current, candidate);
              recordStep(steps, table, 0, w, [{ r: 0, c: w }, { r: 0, c: w - weight }], next, STATUS.COMPUTED);
            }
          }
        }
        return { steps, initialTable, tableMeta: tableMeta(1, cols, '1d') };
      }

      const rows = input.weights.length + 1;
      const cols = input.W + 1;
      const initialTable = createTable(rows, cols);
      const table = cloneTable(initialTable);
      const steps = [];

      for (let w = 0; w < cols; w += 1) {
        recordStep(steps, table, 0, w, [], 0, STATUS.BASE);
      }
      for (let i = 1; i < rows; i += 1) {
        recordStep(steps, table, i, 0, [], 0, STATUS.BASE);
      }

      for (let i = 1; i < rows; i += 1) {
        const weight = input.weights[i - 1];
        const value = input.values[i - 1];
        for (let w = 1; w < cols; w += 1) {
          const reads = [{ r: i - 1, c: w }];
          let best = table[i - 1][w].value;
          if (weight <= w) {
            reads.push({ r: i - 1, c: w - weight });
            best = Math.max(best, table[i - 1][w - weight].value + value);
          }
          recordStep(steps, table, i, w, reads, best, STATUS.COMPUTED);
        }
      }
      return { steps, initialTable, tableMeta: tableMeta(rows, cols, '2d') };
    }
  },
  {
    id: 'dp-13',
    title: 'Target Sum',
    difficulty: 3,
    problemText: [
      'Given an array nums and a target, you can assign + or - signs to each number.',
      'Return the number of different expressions that evaluate to target.',
      'Constraints: 1 <= nums.length <= 20, 0 <= nums[i] <= 9, -20 <= target <= 20.'
    ].join('\n\n'),
    ioFormat: 'Input: nums array, target. Output: number of expressions.',
    examples: [
      { input: { nums: [1, 1, 1, 1, 1], target: 3 }, output: 5 },
      { input: { nums: [1], target: 1 }, output: 1 },
      { input: { nums: [1], target: 2 }, output: 0 },
      { input: { nums: [2, 3, 5], target: 0 }, output: 2 },
      { input: { nums: [0, 0, 0, 0, 1], target: 1 }, output: 16 }
    ],
    defaultInput: { nums: [1, 1, 1, 1, 1], target: 3 },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 'nums', label: 'Numbers', type: 'intArray', min: 0, max: 9, minLength: 1, maxLength: 20 },
        { key: 'target', label: 'Target sum', type: 'int', min: -20, max: 20 }
      ]
    },
    hints: [
      { level: 'Observation', text: ['Transform to subset sum with P = (sum + target) / 2.'] },
      { level: 'StateSuggestion', text: ['Let dp[s] be the number of ways to reach sum s.'] },
      { level: 'TransitionSuggestion', text: ['For each num, update dp[s] += dp[s - num] in descending s.'] },
      { level: 'Pitfall', text: ['If sum + target is odd or negative, answer is 0.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => {
        const sum = input.nums.reduce((a, b) => a + b, 0);
        const target = Math.floor((sum + input.target) / 2);
        return { rows: 1, cols: Math.max(0, target) + 1 };
      },
      iterationOrder: 'nums outer, s descending',
      dependencyOffsets: 'allPrevious',
      baseCaseInitializer: 'dp[0] = 1',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'target', label: 'dp[s] for count', meaning: 'dp[s] = number of ways to reach sum s', baseCases: ['dp[0] = 1'] }
    ],
    transitionTemplate: 'dp[i] = dp[i] + dp[i-num]',
    codeTemplates: {
      tabulation: `function solve(nums, target) {\n  const sum = nums.reduce((a, b) => a + b, 0);\n  if ((sum + target) % 2 !== 0 || sum + target < 0) return 0;\n  const P = (sum + target) / 2;\n  const dp = Array(P + 1).fill(0);\n  dp[0] = 1;\n  for (const num of nums) {\n    for (let s = P; s >= num; s -= 1) {\n      // TODO: update dp[s]\n    }\n  }\n  return dp[P];\n}\n`,
      memoization: `function solve(nums, target) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function count(i, sum) {\n    if (i === nums.length) return sum === target ? 1 : 0;\n    const key = i + ',' + sum;\n    if (memo.has(key)) return memo.get(key);\n    const value = count(i + 1, sum + nums[i]) + count(i + 1, sum - nums[i]);\n    memo.set(key, value);\n    return value;\n  }\n  return count(0, 0);\n}\n`
    },
    selfCheck: [
      { prompt: 'Subset sum target P equals:', type: 'mc', options: ['(sum + target)/2', 'sum - target', 'sum / 2'], answer: '(sum + target)/2' },
      { prompt: 'dp[0] starts as:', type: 'mc', options: ['1', '0', 'Infinity'], answer: '1' },
      { prompt: 'Capacity loop should be descending.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Complexity for subset DP?', type: 'mc', options: ['O(n*P)', 'O(n^2)', 'O(P^2)'], answer: 'O(n*P)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table, meta) => {
      if (meta && meta.valid === false) return 0;
      return extract1D(table, table[0].length - 1);
    },
    computeSteps: (input) => {
      const sum = input.nums.reduce((a, b) => a + b, 0);
      const total = sum + input.target;
      if (total < 0 || total % 2 !== 0) {
        const initialTable = createTable(1, 1);
        const table = cloneTable(initialTable);
        const steps = [];
        recordStep(steps, table, 0, 0, [], 0, STATUS.BASE);
        const meta = tableMeta(1, 1);
        meta.valid = false;
        return { steps, initialTable, tableMeta: meta };
      }
      const P = total / 2;
      const cols = P + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      recordStep(steps, table, 0, 0, [], 1, STATUS.BASE);
      for (let i = 0; i < input.nums.length; i += 1) {
        const num = input.nums[i];
        for (let s = P; s >= num; s -= 1) {
          const current = table[0][s].value || 0;
          const add = table[0][s - num].value || 0;
          recordStep(steps, table, 0, s, [{ r: 0, c: s }, { r: 0, c: s - num }], current + add, STATUS.COMPUTED);
        }
      }
      return { steps, initialTable, tableMeta: tableMeta(1, cols) };
    }
  },
  {
    id: 'dp-14',
    title: 'Decode Ways',
    difficulty: 3,
    problemText: [
      'A message encoded as digits can be decoded where "1" -> A, "2" -> B, ..., "26" -> Z.',
      'Given a digit string s, return the number of ways to decode it.',
      'Constraints: 1 <= s.length <= 20, s contains digits only.'
    ].join('\n\n'),
    ioFormat: 'Input: digit string s. Output: number of decodings.',
    examples: [
      { input: { s: '12' }, output: 2 },
      { input: { s: '226' }, output: 3 },
      { input: { s: '06' }, output: 0 },
      { input: { s: '11106' }, output: 2 },
      { input: { s: '10' }, output: 1 }
    ],
    defaultInput: { s: '226' },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 's', label: 'Digit string', type: 'string', minLength: 1, maxLength: 20, pattern: /^[0-9]+$/, patternMessage: 'Digits only.', alphabet: '0123456789' }
      ]
    },
    hints: [
      { level: 'Observation', text: ['A zero must be paired with a preceding 1 or 2.'] },
      { level: 'StateSuggestion', text: ['Let dp[i] be the number of ways to decode the first i characters.'] },
      { level: 'TransitionSuggestion', text: ['Check one-digit and two-digit valid decodes to update dp[i].'] },
      { level: 'Pitfall', text: ['If the string starts with 0, the answer is 0.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.s.length + 1 }),
      iterationOrder: 'i increasing from 2 to n',
      dependencyOffsets: [-1, -2],
      baseCaseInitializer: 'dp[0]=1, dp[1]=1 if s[0]!=0 else 0',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'decode', label: 'dp[i] for decodes', meaning: 'dp[i] = number of decodings for prefix length i', baseCases: ['dp[0] = 1', 'dp[1] = (s[0] != 0)'] }
    ],
    transitionTemplate: 'dp[i] = (s[i-1] valid ? dp[i-1] : 0) + (two-digit valid ? dp[i-2] : 0)',
    codeTemplates: {
      tabulation: `function solve(s) {\n  const n = s.length;\n  const dp = Array(n + 1).fill(0);\n  dp[0] = 1;\n  dp[1] = s[0] === '0' ? 0 : 1;\n  for (let i = 2; i <= n; i += 1) {\n    // TODO: update dp[i]\n  }\n  return dp[n];\n}\n`,
      memoization: `function solve(s) {\n  // TODO: fill in memoization transition\n  const memo = new Map();\n  function ways(i) {\n    if (i === 0) return 1;\n    if (i < 0) return 0;\n    if (memo.has(i)) return memo.get(i);\n    let value = 0;\n    if (s[i - 1] !== '0') value += ways(i - 1);\n    const two = Number(s.slice(i - 2, i));\n    if (i >= 2 && two >= 10 && two <= 26) value += ways(i - 2);\n    memo.set(i, value);\n    return value;\n  }\n  return ways(s.length);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i] describes:', type: 'mc', options: ['Ways to decode prefix length i', 'Ways to decode suffix length i', 'Min decodes'], answer: 'Ways to decode prefix length i' },
      { prompt: 'dp[0] equals:', type: 'mc', options: ['1', '0', '2'], answer: '1' },
      { prompt: 'Dependencies use i-1 and i-2.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(n)', 'O(n^2)', 'O(log n)'], answer: 'O(n)' }
    ],
    supportsReconstruction: false,
    outputExtractor: (table) => extract1D(table, table[0].length - 1),
    computeSteps: (input) => {
      const cols = input.s.length + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const steps = [];
      recordStep(steps, table, 0, 0, [], 1, STATUS.BASE);
      if (cols > 1) {
        const val = input.s[0] === '0' ? 0 : 1;
        const status = val === 0 ? STATUS.UNREACHABLE : STATUS.BASE;
        recordStep(steps, table, 0, 1, [], val, status);
      }
      for (let i = 2; i < cols; i += 1) {
        let value = 0;
        const reads = [];
        if (input.s[i - 1] !== '0') {
          value += table[0][i - 1].value;
          reads.push({ r: 0, c: i - 1 });
        }
        const two = Number(input.s.slice(i - 2, i));
        if (two >= 10 && two <= 26) {
          value += table[0][i - 2].value;
          reads.push({ r: 0, c: i - 2 });
        }
        const status = value === 0 ? STATUS.UNREACHABLE : STATUS.COMPUTED;
        recordStep(steps, table, 0, i, reads, value, status);
      }
      return { steps, initialTable, tableMeta: tableMeta(1, cols) };
    }
  },
  {
    id: 'dp-15',
    title: 'Word Break',
    difficulty: 4,
    problemText: [
      'Given a string s and a dictionary of words, determine if s can be segmented into a sequence of dictionary words.',
      'Words can be reused multiple times.',
      'Constraints: 1 <= s.length <= 20, dictionary size <= 10, words are lowercase letters.'
    ].join('\n\n'),
    ioFormat: 'Input: string s and dictionary. Output: boolean result.',
    examples: [
      { input: { s: 'leetcode', dict: ['leet', 'code'] }, output: true },
      { input: { s: 'applepenapple', dict: ['apple', 'pen'] }, output: true },
      { input: { s: 'catsandog', dict: ['cats', 'dog', 'sand', 'and', 'cat'] }, output: false },
      { input: { s: 'cars', dict: ['car', 'ca', 'rs'] }, output: true },
      { input: { s: 'aaaaaaa', dict: ['aaaa', 'aaa'] }, output: true }
    ],
    defaultInput: { s: 'leetcode', dict: ['leet', 'code'] },
    inputSchema: {
      allowRandomize: true,
      fields: [
        { key: 's', label: 'String s', type: 'string', minLength: 1, maxLength: 20, pattern: /^[a-z]+$/, patternMessage: 'Lowercase letters only.' },
        { key: 'dict', label: 'Dictionary words', type: 'stringSet', minLength: 1, maxLength: 10, pattern: /^[a-z]+$/, patternMessage: 'Lowercase letters only.' }
      ]
    },
    hints: [
      { level: 'Observation', text: ['A prefix is valid if it ends at a word and the previous prefix is valid.'] },
      { level: 'StateSuggestion', text: ['Let dp[i] be true if s[0..i) can be segmented.'] },
      { level: 'TransitionSuggestion', text: ['dp[i] = any(dp[j] && s[j..i) in dict).'] },
      { level: 'Complexity', text: ['O(n^2) with a dictionary lookup.'] }
    ],
    dpModeSupport: { tabulation: true, memoization: true },
    visualizationSpec: {
      tableType: '1D',
      tableSizeResolver: (input) => ({ rows: 1, cols: input.s.length + 1 }),
      iterationOrder: 'i increasing with j scan',
      dependencyOffsets: 'allPrevious',
      baseCaseInitializer: 'dp[0] = true',
      outputExtractor: (table) => extract1D(table, table[0].length - 1)
    },
    statePatterns: [
      { id: 'wordbreak', label: 'dp[i] for word break', meaning: 'dp[i] = can segment s[0..i)', baseCases: ['dp[0] = true'] }
    ],
    transitionTemplate: 'dp[i] = any(dp[j] && s[j..i) in dict)',
    codeTemplates: {
      tabulation: `function solve(s, dict) {\n  const set = new Set(dict);\n  const n = s.length;\n  const dp = Array(n + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= n; i += 1) {\n    for (let j = 0; j < i; j += 1) {\n      if (dp[j] && set.has(s.slice(j, i))) {\n        dp[i] = true;\n        break;\n      }\n    }\n  }\n  return dp[n];\n}\n`,
      memoization: `function solve(s, dict) {\n  // TODO: fill in memoization transition\n  const set = new Set(dict);\n  const memo = new Map();\n  function can(start) {\n    if (start === s.length) return true;\n    if (memo.has(start)) return memo.get(start);\n    for (let end = start + 1; end <= s.length; end += 1) {\n      if (set.has(s.slice(start, end)) && can(end)) {\n        memo.set(start, true);\n        return true;\n      }\n    }\n    memo.set(start, false);\n    return false;\n  }\n  return can(0);\n}\n`
    },
    selfCheck: [
      { prompt: 'dp[i] indicates:', type: 'mc', options: ['Prefix s[0..i) can be segmented', 'Suffix s[i..] can be segmented', 'Number of segments'], answer: 'Prefix s[0..i) can be segmented' },
      { prompt: 'dp[0] equals:', type: 'mc', options: ['true', 'false', 'depends'], answer: 'true' },
      { prompt: 'Dependencies scan previous j.', type: 'mc', options: ['True', 'False'], answer: 'True' },
      { prompt: 'Time complexity?', type: 'mc', options: ['O(n^2)', 'O(n)', 'O(2^n)'], answer: 'O(n^2)' }
    ],
    supportsReconstruction: true,
    outputExtractor: (table) => Boolean(extract1D(table, table[0].length - 1)),
    computeSteps: (input) => {
      const cols = input.s.length + 1;
      const initialTable = createTable(1, cols);
      const table = cloneTable(initialTable);
      const predecessors = Array(cols).fill(null);
      const steps = [];
      recordStep(steps, table, 0, 0, [], true, STATUS.BASE);

      const dict = new Set(input.dict);
      for (let i = 1; i < cols; i += 1) {
        let value = false;
        let pred = null;
        const reads = [];
        for (let j = 0; j < i; j += 1) {
          if (table[0][j].value && dict.has(input.s.slice(j, i))) {
            reads.push({ r: 0, c: j });
            value = true;
            pred = j;
            break;
          }
        }
        predecessors[i] = pred;
        recordStep(steps, table, 0, i, reads, value, value ? STATUS.COMPUTED : STATUS.UNREACHABLE, pred !== null ? { r: 0, c: pred } : null);
      }

      let path = [];
      if (table[0][cols - 1].value) {
        const indices = [];
        let current = cols - 1;
        while (current !== 0 && predecessors[current] !== null) {
          indices.push(current);
          current = predecessors[current];
        }
        indices.push(0);
        indices.reverse();
        path = indices.map((idx) => `i=${idx}`);
      }

      return { steps, initialTable, tableMeta: tableMeta(1, cols), reconstructionPath: path };
    }
  }
];

window.LESSONS = LESSONS;
