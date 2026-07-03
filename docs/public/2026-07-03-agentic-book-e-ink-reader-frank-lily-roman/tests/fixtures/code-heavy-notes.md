# FIXTURE_CODE_HEAVY_TITLE

Engineering notes with fenced code blocks.

## JavaScript

```js
// FIXTURE_CODE_HEAVY_JS_SNIPPET
function longLineExample() {
  const aVeryLongVariableNameThatShouldNotForceHorizontalPageScroll = "abcdefghijklmnopqrstuvwxyz0123456789_abcdefghijklmnopqrstuvwxyz";
  return aVeryLongVariableNameThatShouldNotForceHorizontalPageScroll.length;
}
```

Inline `const x = 1;` should stay inline.

## Shell

```bash
echo "FIXTURE_CODE_HEAVY_BASH" && ls -la /very/long/path/that/keeps/going/and/going/and/going/to/test/wrapping
```

End. FIXTURE_CODE_HEAVY_END
