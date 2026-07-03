# JavaScript Debugging Notes
FIXTURE_ROMAN_JS_DEBUG_TITLE

These are small reminders for production debugging. They are not a tutorial.
They are notes Roman wants to reread on a phone.

## Event loop checkpoint

```js
console.log("A");

queueMicrotask(() => {
  console.log("B");
});

setTimeout(() => {
  console.log("C");
}, 0);

Promise.resolve().then(() => {
  console.log("D");
});

console.log("E");
```

Expected order:

```text
A
E
B
D
C
```

## Fetch failure shape

```js
async function loadJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

## Notes

- Network failure rejects the promise.
- HTTP 500 does not reject by itself.
- `response.ok` is the part I always forget.

End. FIXTURE_ROMAN_JS_DEBUG_END
