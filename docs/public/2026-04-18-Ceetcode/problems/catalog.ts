import type { ProblemDefinition } from "../runtime/types";

export const problemCatalog: ProblemDefinition[] = [
  {
    id: "two-sum-pair-index",
    title: "Two Sum Pair Index",
    difficulty: "Easy",
    summary: "Return the index of the second value in the earliest matching pair.",
    statementMarkdown:
      "Given an integer array `nums` and an integer `target`, find the earliest index `i` where there exists a `j < i` and `nums[j] + nums[i] == target`. Return `i`, or `-1` if no pair exists.",
    examplesMarkdown:
      "- Input: `nums=[2,7,11,15]`, `target=9` -> Output: `1`\n- Input: `nums=[3,2,4]`, `target=6` -> Output: `2`\n- Input: `nums=[1,2,3]`, `target=100` -> Output: `-1`",
    constraintsMarkdown:
      "- `1 <= numsSize <= 10^4`\n- `-10^9 <= nums[i], target <= 10^9`\n- Return the first valid `i` scanning left to right.",
    signature: {
      functionName: "twoSumPairIndex",
      declaration: "int twoSumPairIndex(int* nums, int numsSize, int target)",
      returnTypeC: "int",
      returnKind: "int",
      arguments: [
        { name: "nums", cType: "int*", kind: "int_array", description: "Input numbers" },
        { name: "numsSize", cType: "int", kind: "int", description: "Length of nums" },
        { name: "target", cType: "int", kind: "int", description: "Target sum" }
      ]
    },
    starterCode: `int twoSumPairIndex(int* nums, int numsSize, int target) {
    for (int i = 0; i < numsSize; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] + nums[i] == target) {
                return i;
            }
        }
    }
    return -1;
}`,
    visibleTests: [
      {
        name: "sample-basic",
        input: { nums: [2, 7, 11, 15], numsSize: 4, target: 9 },
        expected: 1,
        scope: "official"
      },
      {
        name: "sample-second-pair",
        input: { nums: [3, 2, 4], numsSize: 3, target: 6 },
        expected: 2,
        scope: "official"
      },
      {
        name: "no-pair",
        input: { nums: [1, 2, 3], numsSize: 3, target: 100 },
        expected: -1,
        scope: "official"
      }
    ],
    defaultCustomTestsJson: `[
  {
    "name": "custom-duplicate-values",
    "input": { "nums": [3, 3], "numsSize": 2, "target": 6 },
    "expected": 1
  }
]`
  },
  {
    id: "valid-palindrome-ascii",
    title: "Valid Palindrome ASCII",
    difficulty: "Easy",
    summary: "Return true when a string is a case-insensitive alphanumeric palindrome.",
    statementMarkdown:
      "Given a string `s`, return `1` if it is a palindrome considering only ASCII letters and digits, ignoring case. Return `0` otherwise.",
    examplesMarkdown:
      "- Input: `\"A man, a plan, a canal: Panama\"` -> Output: `1`\n- Input: `\"race a car\"` -> Output: `0`",
    constraintsMarkdown:
      "- `1 <= length(s) <= 20000`\n- You may use `<ctype.h>` helpers for classification and lowercase conversion.",
    signature: {
      functionName: "isPalindromeAscii",
      declaration: "int isPalindromeAscii(const char* s)",
      returnTypeC: "int",
      returnKind: "bool",
      arguments: [{ name: "s", cType: "const char*", kind: "string", description: "Input string" }]
    },
    starterCode: `#include <ctype.h>
#include <string.h>

int isPalindromeAscii(const char* s) {
    int left = 0;
    int right = (int)strlen(s) - 1;

    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) {
            left++;
        }
        while (left < right && !isalnum((unsigned char)s[right])) {
            right--;
        }
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {
            return 0;
        }
        left++;
        right--;
    }

    return 1;
}`,
    visibleTests: [
      {
        name: "sample-true",
        input: { s: "A man, a plan, a canal: Panama" },
        expected: true,
        scope: "official"
      },
      {
        name: "sample-false",
        input: { s: "race a car" },
        expected: false,
        scope: "official"
      },
      {
        name: "numeric",
        input: { s: "12321" },
        expected: true,
        scope: "official"
      }
    ],
    defaultCustomTestsJson: `[
  {
    "name": "custom-spaces-only",
    "input": { "s": "   " },
    "expected": true
  }
]`
  },
  {
    id: "best-time-buy-sell-stock",
    title: "Best Time To Buy And Sell Stock",
    difficulty: "Easy",
    summary: "Compute the maximum achievable profit from one buy and one sell.",
    statementMarkdown:
      "Given an array `prices` where `prices[i]` is the stock price on day `i`, return the maximum profit from exactly one buy then one sell. If no profit is possible, return `0`.",
    examplesMarkdown:
      "- Input: `[7,1,5,3,6,4]` -> Output: `5`\n- Input: `[7,6,4,3,1]` -> Output: `0`",
    constraintsMarkdown: "- `1 <= pricesSize <= 10^5`\n- `0 <= prices[i] <= 10^4`",
    signature: {
      functionName: "maxProfit",
      declaration: "int maxProfit(int* prices, int pricesSize)",
      returnTypeC: "int",
      returnKind: "int",
      arguments: [
        { name: "prices", cType: "int*", kind: "int_array", description: "Daily prices" },
        { name: "pricesSize", cType: "int", kind: "int", description: "Length of prices" }
      ]
    },
    starterCode: `int maxProfit(int* prices, int pricesSize) {
    int minPrice = prices[0];
    int best = 0;
    for (int i = 1; i < pricesSize; i++) {
        int candidate = prices[i] - minPrice;
        if (candidate > best) {
            best = candidate;
        }
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        }
    }
    return best;
}`,
    visibleTests: [
      {
        name: "sample-profit",
        input: { prices: [7, 1, 5, 3, 6, 4], pricesSize: 6 },
        expected: 5,
        scope: "official"
      },
      {
        name: "sample-zero",
        input: { prices: [7, 6, 4, 3, 1], pricesSize: 5 },
        expected: 0,
        scope: "official"
      },
      {
        name: "single-day",
        input: { prices: [5], pricesSize: 1 },
        expected: 0,
        scope: "official"
      }
    ],
    defaultCustomTestsJson: `[
  {
    "name": "custom-late-profit",
    "input": { "prices": [2, 4, 1, 9], "pricesSize": 4 },
    "expected": 8
  }
]`
  }
];
