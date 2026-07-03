# Sliding Window Field Notes
FIXTURE_ROMAN_SLIDING_WINDOW_TITLE

Roman uses this note when he wants to remember whether a window should expand,
shrink, or reset.

## Pattern

1. Move the right pointer.
2. Add the new item into window state.
3. Shrink while the invariant is broken.
4. Record the answer only after the invariant is valid.

## Python example

```py
def length_of_longest_substring(text: str) -> int:
    seen: dict[str, int] = {}
    left = 0
    best = 0

    for right, char in enumerate(text):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1

        seen[char] = right
        best = max(best, right - left + 1)

    return best
```

## Debug questions

- What is the invariant?
- Which side of the window moves?
- Does the answer update before or after shrinking?
- What happens when the input is empty?

Inline reminder: `left` never moves backward. FIXTURE_ROMAN_SLIDING_WINDOW_INLINE

End. FIXTURE_ROMAN_SLIDING_WINDOW_END
