# Binary Search Patterns

Problem: https://example.com/problems/search

Key idea: use the sorted half.

```js
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) { if (nums[left] <= target && target < nums[mid]) right = mid - 1; else left = mid + 1; }
    else { if (nums[mid] < target && target <= nums[right]) left = mid + 1; else right = mid - 1; }
  }
  return -1;
}
```

A very long single code line:

```
const url = "https://example.com/very/long/path/that/keeps/going/and/going/and/should/not/break/the/whole/page/layout/horizontally?query=1&more=2&evenmore=3";
```

Inline `code` and a [link](https://example.com/).
