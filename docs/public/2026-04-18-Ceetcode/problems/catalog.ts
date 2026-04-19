import type { ProblemDefinition } from "../runtime/types";

export const problemCatalog: ProblemDefinition[] = [
  {
    id: "new",
    title: "New",
    difficulty: "Easy",
    summary: "Scratchpad playground for arbitrary C99 experimentation.",
    statementMarkdown:
      "Use this scratchpad to run arbitrary C99 code in the browser runtime. This is not a scored challenge; it is a reusable playground.",
    examplesMarkdown:
      "- Edit the starter code freely.\n- Add temporary print statements.\n- Use Run to inspect compile/runtime logs and output quickly.",
    constraintsMarkdown:
      "- Keep code valid C99.\n- The default harness executes `problem()` and reports runtime behavior.\n- Add optional custom tests when you want explicit checks.",
    signature: {
      functionName: "problem",
      declaration: "int problem(void)",
      returnTypeC: "int",
      returnKind: "int",
      arguments: []
    },
    starterCode: `#include <stdio.h>

int problem(void) {
    printf("Hello, world!\\n");
    return 0;
}`,
    visibleTests: [
      {
        name: "scratchpad-run",
        input: {},
        expected: 0,
        scope: "official"
      }
    ],
    defaultCustomTestsJson: `[]`
  },
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
    id: "signal-state-from-remaining-time",
    title: "Signal State From Remaining Time",
    difficulty: "Easy",
    summary: "Return the signal color from a countdown timer based on exact and interval rules.",
    statementMarkdown:
      "You are given an integer `timer` representing seconds left on a traffic signal countdown. Return the current signal color using these rules:\n\n- `timer == 0` -> `\"Green\"`\n- `timer == 30` -> `\"Orange\"`\n- `30 < timer <= 90` -> `\"Red\"`\n- otherwise -> `\"Invalid\"`\n\nReturn text must match expected spelling and capitalization exactly.",
    examplesMarkdown:
      "- Input: `60` -> Output: `\"Red\"`\n- Input: `5` -> Output: `\"Invalid\"`\n- Input: `0` -> Output: `\"Green\"`\n- Input: `30` -> Output: `\"Orange\"`\n- Input: `90` -> Output: `\"Red\"`",
    constraintsMarkdown:
      "- `timer` is an integer.\n- Follow the rule order exactly.\n- Edge values around `0`, `30`, and `90` are critical.",
    signature: {
      functionName: "trafficSignal",
      declaration: "char* trafficSignal(int timer)",
      returnTypeC: "char*",
      returnKind: "string",
      arguments: [{ name: "timer", cType: "int", kind: "int", description: "Seconds left on signal countdown" }]
    },
    starterCode: `char* trafficSignal(int timer) {
    static char green[] = "Green";
    static char orange[] = "Orange";
    static char red[] = "Red";
    static char invalid[] = "Invalid";

    if (timer == 0) {
        return green;
    }
    if (timer == 30) {
        return orange;
    }
    if (timer > 30 && timer <= 90) {
        return red;
    }
    return invalid;
}`,
    visibleTests: [
      {
        name: "negative-invalid",
        input: { timer: -1 },
        expected: "Invalid",
        scope: "official"
      },
      {
        name: "zero-green",
        input: { timer: 0 },
        expected: "Green",
        scope: "official"
      },
      {
        name: "one-invalid",
        input: { timer: 1 },
        expected: "Invalid",
        scope: "official"
      },
      {
        name: "twenty-nine-invalid",
        input: { timer: 29 },
        expected: "Invalid",
        scope: "official"
      },
      {
        name: "thirty-orange",
        input: { timer: 30 },
        expected: "Orange",
        scope: "official"
      },
      {
        name: "thirty-one-red",
        input: { timer: 31 },
        expected: "Red",
        scope: "official"
      },
      {
        name: "eighty-nine-red",
        input: { timer: 89 },
        expected: "Red",
        scope: "official"
      },
      {
        name: "ninety-red",
        input: { timer: 90 },
        expected: "Red",
        scope: "official"
      },
      {
        name: "ninety-one-invalid",
        input: { timer: 91 },
        expected: "Invalid",
        scope: "official"
      }
    ],
    defaultCustomTestsJson: `[
  {
    "name": "custom-middle-red",
    "input": { "timer": 60 },
    "expected": "Red"
  },
  {
    "name": "custom-far-invalid",
    "input": { "timer": 1000 },
    "expected": "Invalid"
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
