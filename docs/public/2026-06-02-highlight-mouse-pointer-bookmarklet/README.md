# Highlight Mouse Pointer Bookmarklet

A static page for installing a bookmarklet that makes the mouse pointer easier
to follow during screen shares, walkthroughs, reviews, and recordings.

## Install

Open `index.html` in a browser.

Drag **Drag to bookmarks bar: Highlight Mouse Pointer** to the browser's
bookmarks bar.

Open a regular web page, then click the saved bookmarklet to toggle the pointer
highlight. Click it again to remove the highlight.

## What it does

The bookmarklet hides the native cursor while active and draws a translucent
green pointer marker that follows the mouse. It morphs into an arrow over
clickable targets and hides over text fields so normal text cursor behavior
remains available.

## Project files

`bookmarklet.js` is the source of truth and defines
`highlightMousePointerBookmarklet`.

`app.js` generates the install URL from
`highlightMousePointerBookmarklet.toString()`.

`demo.html` is a local validation page with links, buttons, form controls,
editable text, and dense content.

`assets/screenshot.png` is captured from the local demo page with the bookmarklet
running.

## Validation

Run:

```sh
node --check bookmarklet.js
node --check app.js
```

Open `demo.html`, verify the highlight follows the pointer, morphs over
clickable targets, hides over text inputs, and toggles off cleanly.
