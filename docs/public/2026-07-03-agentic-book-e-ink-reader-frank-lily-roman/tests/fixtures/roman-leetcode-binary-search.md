# Rotated Binary Search Notes
FIXTURE_ROMAN_BINARY_SEARCH_TITLE

Problem: Search in Rotated Sorted Array
Source: https://leetcode.com/problems/search-in-rotated-sorted-array/

## Why this matters

Binary search is easy to remember in the abstract and easy to break in practice.
The useful question is not "is the array sorted?".
The useful question is "which half is sorted right now?"

## JavaScript solution

```js
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}
```

## Complexity

| Case    | Time     | Space |
| ------- | -------- | ----- |
| Average | O(log n) | O(1)  |
| Worst   | O(log n) | O(1)  |

## Mistakes I made

- I forgot that equality on the left sorted half matters.
- I moved both pointers in one branch and skipped the target.
- I tested only arrays without duplicates.

> The point of the pattern is to keep one invariant alive. FIXTURE_ROMAN_BINARY_SEARCH_QUOTE

End. FIXTURE_ROMAN_BINARY_SEARCH_END
