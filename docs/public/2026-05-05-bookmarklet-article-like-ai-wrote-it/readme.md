# AI Stream Article — Bookmarklet

A browser bookmarklet that transforms the main article content of any page into an AI-chat-style streaming presentation.

## What it does

Click the bookmarklet on any article, blog post, essay, or documentation page.  
The main text area softens, clears, and the same content streams back in — word by word, paragraph by paragraph — as if an AI assistant is composing it live.

No AI is involved. No content is rewritten, summarized, or sent anywhere. The effect is purely visual and entirely reversible.

## Features

- **Smart extraction** — Finds the main readable content on a wide range of sites (articles, docs, Wikipedia, blogs, news)
- **AI-style streaming** — Burst-based token reveal, cursor presence, block-level pacing, punctuation pauses
- **Block awareness** — Headings, paragraphs, blockquotes, code blocks, lists, images, and tables each animate differently
- **Full controls** — Pause, Resume, Skip, Replay, Speed (Relaxed / Standard / Fast), and Restore
- **Reversible** — Original page content is restored on demand, no permanent DOM changes
- **Dark mode** — Detects dark-background pages and adapts the surface theme
- **Reduced motion** — Respects `prefers-reduced-motion`
- **Private** — No network requests, no data stored, runs only in the current tab

## Install

Open `index.html` in a browser and drag the **AI Stream Article** button into your bookmarks bar.

## Build

Requires [Bun](https://bun.sh).

```bash
# Install (no dependencies required beyond Bun itself)
bun install

# Build
bun run build
# → dist/bookmarklet.bundle.js

# Watch mode
bun run watch
```

The bundle is human-readable, not minified.

## Project structure

```
src/
  bookmarklet.js          Complete self-contained BookmarkletMain function
dist/
  bookmarklet.bundle.js   Bun output (loaded by index.html)
index.html                Installation page
package.json              Bun build config
```

## Usage

1. Visit an article page
2. Click **AI Stream Article** in your bookmarks bar
3. Watch the article replay with AI-like streaming effects
4. Use on-page controls (Pause, Skip, Speed, Restore) as desired
5. Click the bookmarklet again or press **Restore** to return to the original page
