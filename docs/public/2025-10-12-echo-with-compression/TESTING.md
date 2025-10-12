# Echo v2 - Testing Guide

Date: 2025-10-12

## Manual Testing Checklist

### Prerequisites
- Local HTTP server running (e.g., `python -m http.server 8080`)
- Open browser to `http://localhost:8080/index.html`
- Open browser console to check for errors

---

## Test Suite

### 1. Basic Compose Mode

**Test Case 1.1: Open compose mode**
- [ ] Navigate to `index.html#new`
- [ ] Verify page loads without JavaScript errors
- [ ] Verify form is visible with all fields
- [ ] Verify live preview panel is visible

**Test Case 1.2: Create simple post**
- [ ] Enter Name: "Test User"
- [ ] Enter Text: "Hello, World!"
- [ ] Click "Generate link"
- [ ] Verify URL changes to `#p=...`
- [ ] Verify "Copy Link" toast appears
- [ ] Verify URL contains compressed token (should have a dot separator)

**Test Case 1.3: Verify compression**
- [ ] Create post with text: "aaaaaaaaaa" (10 a's)
- [ ] Click "Generate link"
- [ ] Check URL length - should be shorter than uncompressed base64 would be
- [ ] Note: compressed token format is `base64(header).base64(payload)`

---

### 2. View Mode

**Test Case 2.1: View compressed post**
- [ ] After creating a post in compose mode
- [ ] Verify automatic redirect to view mode (#p=...)
- [ ] Verify post displays correctly with entered name and text
- [ ] Verify no JavaScript errors in console

**Test Case 2.2: Direct view from URL**
- [ ] Copy a generated URL with #p=...
- [ ] Open in new tab/window
- [ ] Verify post loads and displays correctly
- [ ] Verify all content matches original

**Test Case 2.3: Invalid compressed token**
- [ ] Navigate to `index.html#p=invalid-token`
- [ ] Verify error message displays
- [ ] Verify app doesn't crash
- [ ] Verify fallback to compose mode

---

### 3. Edit Mode

**Test Case 3.1: Edit existing post**
- [ ] View a post (#p=...)
- [ ] Click "Edit" button
- [ ] Verify URL changes to #e=...
- [ ] Verify form is pre-filled with post data
- [ ] Verify live preview shows current content

**Test Case 3.2: Modify and regenerate**
- [ ] In edit mode, change text content
- [ ] Click "Generate link"
- [ ] Verify new URL is generated
- [ ] Verify changes are reflected in view mode

---

### 4. Compression Round-Trip

**Test Case 4.1: Simple ASCII text**
- [ ] Create post: "The quick brown fox jumps over the lazy dog"
- [ ] Generate link
- [ ] View the post
- [ ] Verify text matches exactly

**Test Case 4.2: UTF-8 Unicode characters**
- [ ] Create post with Unicode: "Hello 世界 🌍 Привет"
- [ ] Generate link
- [ ] View the post
- [ ] Verify all Unicode characters display correctly

**Test Case 4.3: Newlines and whitespace**
- [ ] Create post with multiple lines:
  ```
  Line 1

  Line 3 (with blank line above)
    Indented line
  ```
- [ ] Generate link
- [ ] Verify newlines and indentation preserved

**Test Case 4.4: Special characters**
- [ ] Create post with: `<>&"'{}[]()+=!@#$%^&*`
- [ ] Generate link
- [ ] Verify all special characters preserved
- [ ] Verify no XSS issues (characters should be escaped in HTML)

**Test Case 4.5: Long repetitive text**
- [ ] Create post with highly repetitive text (e.g., 500 characters of "aaaabbbbcccc")
- [ ] Generate link
- [ ] Verify compression is effective (check URL length)
- [ ] Verify decompression works correctly

---

### 5. Theme Switching

**Test Case 5.1: Light to dark theme**
- [ ] Create post with theme: light
- [ ] Generate link and view
- [ ] Click "Toggle Theme"
- [ ] Verify theme switches to dark
- [ ] Verify URL updates with new theme

**Test Case 5.2: Theme persistence**
- [ ] Set theme to dark in compose
- [ ] Generate link
- [ ] Copy and open in new tab
- [ ] Verify dark theme is applied

---

### 6. Media Features

**Test Case 6.1: HTTPS images**
- [ ] Add image URL: `https://via.placeholder.com/300`
- [ ] Generate link and view
- [ ] Verify image displays

**Test Case 6.2: HTTP images blocked**
- [ ] Add image URL: `http://example.com/image.jpg`
- [ ] Generate link and view
- [ ] Verify warning message about blocked image

**Test Case 6.3: YouTube video**
- [ ] Add YouTube URL: `https://youtu.be/dQw4w9WgXcQ`
- [ ] Verify preview shows video ID
- [ ] Generate link and view
- [ ] Verify YouTube embed displays

---

### 7. Error Handling

**Test Case 7.1: Corrupt token header**
- [ ] Navigate to `index.html#p=abc123.def456`
- [ ] Verify graceful error handling
- [ ] Verify error message displays

**Test Case 7.2: Missing dot separator**
- [ ] Navigate to `index.html#p=abcdefghijklmnop`
- [ ] Verify error: "Invalid token: missing header dot"

**Test Case 7.3: Invalid base64**
- [ ] Navigate to `index.html#p=!!!invalid!!!.???wrong???`
- [ ] Verify error handling

---

### 8. Copy Link Functionality

**Test Case 8.1: Copy from view mode**
- [ ] View a post
- [ ] Click "Copy Link"
- [ ] Verify toast appears
- [ ] Paste clipboard - verify full URL is copied

**Test Case 8.2: Copy from header**
- [ ] Click "Copy Link" from top header
- [ ] Verify current URL is copied

---

### 9. Performance Testing

**Test Case 9.1: Small post (< 100 chars)**
- [ ] Create minimal post
- [ ] Measure time to generate link (should be instant)
- [ ] Check URL length

**Test Case 9.2: Medium post (500-1000 chars)**
- [ ] Create post with ~750 characters of varied text
- [ ] Measure time to generate link
- [ ] Verify responsive UI

**Test Case 9.3: Large post (5000 chars)**
- [ ] Create post with ~5000 characters
- [ ] Measure time to generate link
- [ ] Verify compression is effective
- [ ] Verify decompression works

---

### 10. Edge Cases

**Test Case 10.1: Empty text**
- [ ] Leave text field empty
- [ ] Click "Generate link"
- [ ] Verify validation or graceful handling

**Test Case 10.2: Maximum width and font**
- [ ] Set width to 4096
- [ ] Set font to 48
- [ ] Generate and view
- [ ] Verify layout respects settings

**Test Case 10.3: Minimum width and font**
- [ ] Set width to 320
- [ ] Set font to 12
- [ ] Generate and view
- [ ] Verify layout respects settings

---

## Compression Verification Tests

### Manual Compression Check

To verify compression is working:

1. **Create uncompressed baseline**:
   - Text: "aaaaaaaaaa" (10 a's)
   - Expected uncompressed JSON: `{"v":1,"n":"","t":"aaaaaaaaaa","i":[],"y":"","s":"","c":"light","w":1024,"f":24}`
   - Base64 length of JSON: ~112 chars
   - URL-safe base64: ~112 chars

2. **Check compressed URL**:
   - Generate link with same text
   - URL format should be: `#p=<token>`
   - Token should contain a dot: `header.payload`
   - Total length should be significantly less than 112 chars for repetitive text

3. **Verify token structure**:
   - Open browser console
   - Extract token from URL (after `#p=`)
   - Split on first dot
   - Decode header (first part): should be JSON with TextZip metadata
   - Example: `{"v":1,"alg":"BWT+MTF+RLE+HUF","n":X,"pi":Y,"hbits":Z,"rleLen":W}`

### Automated Tests (Future)

Future improvements could include:
- Unit tests for TextZip compress/decompress
- Round-trip property tests
- Performance benchmarks
- Compression ratio measurements
- Browser compatibility tests

---

## Known Issues and Limitations

### Expected Behavior

1. **O(n²log n) BWT**: May be slow for posts > 10KB
2. **No backward compatibility**: v1 URLs won't work in v2
3. **Browser requirement**: Modern browsers only (ES6+, TextEncoder/Decoder)

### Debugging Tips

**If compression fails:**
- Check browser console for errors
- Verify TextZip global object exists
- Check that textzip.js loads before app.js

**If decompression fails:**
- Verify token has dot separator
- Check token is valid base64 (after URL-safe restoration)
- Look for specific error messages in console

**Common error messages:**
- "Invalid token: missing header dot" - token format is wrong
- "Unsupported version" - header version mismatch
- "Unsupported alg" - algorithm mismatch
- "Corrupt payload: ..." - data corruption during transmission

---

## Success Criteria

✅ All test cases pass without errors
✅ Compression reduces URL length for typical content
✅ Round-trip works correctly for all character types
✅ Error handling is graceful and informative
✅ UI is responsive and functional
✅ No JavaScript errors in console
✅ Works in Chrome, Firefox, Safari, Edge

---

## Test Results Log

Date: _______
Tester: _______
Browser: _______

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 | ☐ Pass ☐ Fail | |
| 1.2 | ☐ Pass ☐ Fail | |
| 1.3 | ☐ Pass ☐ Fail | |
| ... | ... | |
