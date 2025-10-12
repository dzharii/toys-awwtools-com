# Echo v2 - Quick Start Guide

**Version**: 2.0
**Date**: October 12, 2025

---

## What is Echo?

Echo v2 is a single-page web application that lets you create and share posts entirely through URLs. All content is stored in the URL fragment using transparent compression.

**Key Benefits:**
- ✅ No server required
- ✅ No accounts or login
- ✅ Share by copying URL
- ✅ Works offline after first load
- ✅ Compressed URLs (30-70% smaller)
- ✅ Privacy-focused (data stays in URL)

---

## Quick Start (5 Minutes)

### 1. Run the Application

**Option A: Local Development**
```bash
# Navigate to the project folder
cd path/to/2025-10-12-echo

# Start a simple HTTP server
python -m http.server 8080

# Open browser to:
http://localhost:8080/index.html
```

**Option B: Direct File Opening** (may have CORS issues)
```
Simply open index.html in your browser
```

**Option C: Deploy to Static Host**
```
Upload all files to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service
```

---

### 2. Create Your First Post

1. **Open compose mode**
   Navigate to: `index.html#new`

2. **Fill in the form**
   - Name: Your display name (optional)
   - Text: Your post content (required)
   - Images: HTTPS URLs only (optional)
   - YouTube: Video URL (optional)
   - Theme: Light or Dark
   - Width: Max content width (default 1024px)
   - Font: Base font size (default 24px)

3. **Generate link**
   - Click "Generate link" button
   - URL changes to `#p=<compressed-token>`
   - "Copy Link" toast appears

4. **Share**
   - Copy the full URL from address bar
   - Share via email, chat, social media
   - Anyone with the link can view your post

---

### 3. View a Post

1. Open a URL ending with `#p=...`
2. Post displays automatically
3. Options available:
   - **Copy Link**: Copy current URL to clipboard
   - **Edit**: Modify the post (goes to `#e=...`)
   - **Toggle Theme**: Switch between light/dark

---

### 4. Edit a Post

1. View a post (`#p=...`)
2. Click "Edit" button
3. URL changes to `#e=...`
4. Form pre-fills with post data
5. Make changes
6. Click "Generate link" to create updated version
7. New URL is generated (old URL remains unchanged)

---

## File Structure

```
2025-10-12-echo/
├── index.html       # Main page (load this)
├── app.css          # Styles
├── app.js           # Application logic
├── textzip.js       # Compression module
├── readme.md        # Full documentation
└── *.md            # Additional documentation
```

**Required files** to run:
- ✅ index.html
- ✅ app.css
- ✅ app.js
- ✅ textzip.js

---

## Understanding URLs

### URL Modes

| Mode | Format | Purpose |
|------|--------|---------|
| New | `#new` | Open blank compose form |
| View | `#p=<token>` | Display a post |
| Edit | `#e=<token>` | Edit existing post |

### Compression Token Format

```
#p=<url-safe-token>

Where token = base64(header).base64(payload)

header = JSON with metadata:
{
  "v": 1,
  "alg": "BWT+MTF+RLE+HUF",
  "n": <original-bytes>,
  "pi": <bwt-index>,
  "hbits": <huffman-bits>,
  "rleLen": <rle-bytes>
}

payload = compressed data bytes
```

**URL-Safe Transformations:**
- `+` → `-`
- `/` → `_`
- Trim trailing `=`

---

## Usage Examples

### Example 1: Simple Text Post

```
1. Open: index.html#new
2. Name: "Alice"
3. Text: "Hello, World! This is my first Echo post."
4. Click: "Generate link"
5. Result: index.html#p=eyJ2IjoxLCJhbGci...
6. Share the URL!
```

### Example 2: Post with Image

```
1. Open: index.html#new
2. Text: "Check out this cool image!"
3. Image: https://via.placeholder.com/600x400
4. Click: "Add" to add image
5. Click: "Generate link"
6. Share!
```

### Example 3: Post with YouTube

```
1. Open: index.html#new
2. Text: "Watch this video!"
3. YouTube: https://youtu.be/dQw4w9WgXcQ
4. Verify video ID shows in preview
5. Click: "Generate link"
6. Share!
```

### Example 4: Dark Theme Post

```
1. Open: index.html#new
2. Text: "Dark mode is awesome!"
3. Theme: Select "Dark"
4. Click: "Generate link"
5. Post displays in dark theme
```

---

## Features Overview

### ✅ What Works

- **Text posts** with preserved newlines
- **HTTPS links** auto-linked in text
- **HTTPS images** (single or multiple)
- **YouTube embeds** (youtube.com and youtu.be)
- **Light/Dark themes**
- **Custom width** (320-4096px)
- **Custom font size** (12-48px)
- **Copy to clipboard**
- **Live preview** in compose mode
- **Transparent compression** (automatic)

### ⚠️ What Doesn't Work

- **HTTP links/images** (blocked for security)
- **JavaScript in URLs** (blocked for security)
- **Posts > 10KB** (may be slow due to compression)
- **Old v1 URLs** (not compatible with v2)

---

## Tips & Tricks

### Optimize Compression

**Best compression results:**
- Repetitive text compresses very well
- Long words compress better than short
- Structured data (JSON-like) compresses well

**Poor compression:**
- Random characters
- Short posts (<50 chars)
- Unique, non-repetitive content

### Avoid Long URLs

- Keep text concise
- Use one or two images max
- Avoid very long URLs (>2000 chars may have issues)
- Remove unnecessary whitespace

### Security Tips

- Only use HTTPS for images and links
- Don't include sensitive information (URLs are public)
- Remember: content is in the URL itself
- Anyone with URL can see your post

---

## Troubleshooting

### Problem: "Invalid post data" error

**Possible causes:**
- Corrupt or truncated URL
- URL was modified after generation
- Copied incomplete URL

**Solution:**
- Copy full URL including `#p=...`
- Don't edit the token manually
- If editing, use "Edit" button

---

### Problem: Images don't display

**Causes:**
- HTTP URLs (not HTTPS) are blocked
- Image server doesn't allow embedding
- CORS issues

**Solution:**
- Use only HTTPS image URLs
- Try different image host
- Use public image services (imgur, placeholder, etc.)

---

### Problem: YouTube video doesn't show

**Causes:**
- Invalid video ID
- Unsupported URL format
- Network issues

**Solution:**
- Use standard YouTube URLs: `youtube.com/watch?v=...` or `youtu.be/...`
- Verify video exists and is not private
- Check video ID is exactly 11 characters

---

### Problem: URL is too long

**Causes:**
- Too much content
- Many images
- Poor compression on random text

**Solutions:**
- Reduce text length
- Remove some images
- Remove custom timestamp
- Split into multiple posts

---

### Problem: JavaScript errors in console

**Causes:**
- textzip.js not loaded
- File loading order wrong
- Browser compatibility issue

**Solutions:**
- Verify textzip.js loads before app.js
- Check browser console for specific error
- Use modern browser (Chrome, Firefox, Safari, Edge)
- Clear cache and reload

---

## Browser Requirements

### Minimum Requirements

- **JavaScript**: ES6+ support (2015+)
- **APIs**: TextEncoder, TextDecoder, btoa, atob
- **Uint8Array**: Native support
- **JSON**: Native JSON.parse/stringify

### Tested Browsers

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

❓ Older browsers may work but are untested

---

## Keyboard Shortcuts

Currently, Echo v2 has no custom keyboard shortcuts. Standard browser shortcuts work:

- `Ctrl+C` / `Cmd+C`: Copy
- `Ctrl+V` / `Cmd+V`: Paste
- `Ctrl+A` / `Cmd+A`: Select all (in text fields)

---

## Privacy & Security

### What Echo Does

- ✅ Stores data only in URL
- ✅ No server-side storage
- ✅ No cookies
- ✅ No tracking
- ✅ No analytics
- ✅ Blocks HTTP resources

### What You Should Know

- 🔒 Anyone with URL can view content
- 🔒 URLs may be logged by browsers/servers
- 🔒 Don't share sensitive information
- 🔒 URLs are not encrypted (only compressed)

---

## Getting Help

### Documentation

- **readme.md**: Full project documentation
- **textzip-spec.md**: Compression technical details
- **TESTING.md**: Testing procedures
- **CHANGELOG.md**: Version history
- **PROJECT-SUMMARY.md**: Complete overview

### Common Questions

**Q: Can I use Echo offline?**
A: Yes! After first load, works completely offline.

**Q: Where is my data stored?**
A: Only in the URL. No server, no database.

**Q: Can I edit someone else's post?**
A: No. "Edit" creates a new URL. Original is unchanged.

**Q: What happens to old v1 URLs?**
A: They won't work in v2. Different compression format.

**Q: Is there a character limit?**
A: Technically no, but URLs >2000 chars may have issues.

**Q: Can I customize the CSS?**
A: Yes! Edit app.css to change styles.

---

## Next Steps

1. ✅ Read this guide
2. ✅ Create your first post
3. ✅ Share with friends
4. 📖 Read full documentation (readme.md)
5. 🧪 Try advanced features (images, videos)
6. 🛠️ Customize for your needs
7. 🚀 Deploy to your own domain

---

## Credits

**Echo v2** - URL-based content sharing with transparent compression

- **Compression**: BWT + MTF + RLE0 + Huffman
- **Zero dependencies**: Pure JavaScript
- **Open source**: Use and modify freely

Built with ❤️ for simplicity and privacy.

---

**Version**: 2.0
**Last Updated**: October 12, 2025
**Documentation**: See readme.md for details
