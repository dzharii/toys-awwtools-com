# 2026-02-22 Paragraphs as Social Media Posts Bookmarklet

A playful technical experiment that overlays a lightweight "social feed" interaction model onto long-form article pages.

## What This Is

This project is a bookmarklet that temporarily reframes article paragraphs as individual post cards. Each paragraph becomes a small card with:

- Like / Dislike reactions (with counts)
- Copy Link (deep link with text fragment)
- Share (Web Share API when available, with fallback)

It is designed to change how reading feels: from passive scrolling to lightweight paragraph-by-paragraph interaction.

## Intent and Experimental Hypothesis

The experiment asks a simple question:

- If a long article is turned into a series of small interactive paragraph "posts", does it become easier to notice what resonated, what did not, and what is worth sharing?

The bookmarklet does this without accounts, a backend, or network calls. Reactions are stored locally in the browser via `localStorage`, scoped to the current origin.

## Design Direction (Not a Facebook Clone)

The original idea of wrapping paragraphs in a Facebook-like frame was intentionally discarded.

This version uses a modern card-feed style instead:

- Rounded cards
- Compact reaction bar
- Clean, readable typography
- Subtle depth / translucent surface styling (with fallback when unsupported)

The goal is "social overlay" energy without copying any specific legacy social network UI.

## How To Use

1. Open `index.html` in this folder (or the published project page).
2. Drag the "Drag to Bookmarks" link to your bookmarks bar.
3. Open a long-form article page.
4. Click the bookmarklet.

The page will be transformed in-place for that session. Refresh the page to return to the original DOM.

## What Happens When You Run It

- The bookmarklet tries to identify the primary reading container using a pragmatic paragraph-text heuristic.
- Eligible `<p>` elements inside that container are transformed into card-style post components.
- Each transformed paragraph gets Like, Dislike, Copy Link, and Share controls.
- Reaction counts and your last reaction state persist across sessions on the same origin.

The DOM changes are temporary. Persistence applies to reaction data only.

## Privacy and Storage

- No network requests
- No analytics
- No external dependencies
- No cross-origin sync

Reaction data is stored only in `localStorage` on the current origin under a versioned key (`paragraphSocial.v1`).

Paragraph identity is based on a normalized paragraph text hash (SHA-256 via Web Crypto), which helps keep reactions stable across reloads.

## Copy Link and Share

Copy Link generates a deep link using a text fragment (`#:~:text=`) so supported browsers can open the page and highlight the paragraph.

Share uses the Web Share API when available and falls back to Copy Link behavior when it is not supported or fails.

If clipboard access is unavailable, the bookmarklet shows a manual copy prompt inside its own UI.

## Technical Notes

- Uses Shadow DOM for a root chrome layer (badge, toasts, fallback modal)
- Uses Shadow DOM per paragraph wrapper to isolate card styles from the host page
- Refresh is the supported "undo" path by design
- Re-running the bookmarklet on an already transformed page shows a small notice instead of double-wrapping

## Project Files

- `index.html`: installation page that generates a bookmarklet link from `bookmarklet_paragraph_social_mode.toString()`
- `paragraph-social.bookmarklet.js`: readable, self-contained bookmarklet implementation
- `readme.md`: project overview and usage notes

## Known Caveats

- Text fragment highlighting depends on browser support and page text matching
- Some highly dynamic or unusual page layouts may confuse the paragraph-container heuristic
- Clipboard and Web Share APIs can fail depending on browser/security context
