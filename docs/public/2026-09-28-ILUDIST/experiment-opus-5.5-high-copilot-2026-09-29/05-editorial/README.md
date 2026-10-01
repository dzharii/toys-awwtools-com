# ILUD Quarterly

*Interpretation five of ten. Reference: `reference.png`.*

A printed quarterly on cream stock. The whole catalogue — eighty-seven researched
ways to use ordinary websites with less unwanted machine assistance — is set as
eight numbered chapters, one per category, with a lead article, a contents rail
down the right-hand edge, and a proper index at the back of the book.

## The idea

The Patron's letter asks that transitions "unfold like the opening of a folio
rather than the replacement of one generic card by another." So chapters here are
not tabs. They are leaves.

Swipe horizontally and the current page lifts at its outer edge and rotates about
the spine, following the finger the whole way. Past about a third of the sweep it
completes on its own; short of that it falls back. The gutter shadow sweeps across
as the leaf passes ninety degrees, at which point you see the blank back of the
sheet, as you would in any book. Arrow keys turn pages too, and so does the
contents rail, and so does the **Next chapter** plate at the foot of every chapter.

## What is in it

| | |
| --- | --- |
| Chapters | 8, one per category, numbered `01`–`08` |
| Entries | 87, numbered within their chapter and paginated `1`–`87` |
| Lead article | the strongest entry in each chapter, set large with an arch plate |
| Index | every service, alphabetical, with leader dots and page numbers |
| Marked pages | ribbons you lay in yourself, kept in this browser only |
| Colophon | how entries are chosen, what the issue contains, and the settings |

Every entry page carries the outcome as its headline, the mechanism folded away
behind **Show the mechanism**, what changes, how it works, the steps, what to do
if it stops working, other ways to get the same result, numbered footnote sources,
and the date the entry was last checked.

## The plates

There is no photography in this project and no generated imagery. Every plate —
the cover lunette, the tall arch beside each lead article, the small squares
beside each entry — is drawn at run time by `plates.js`: a seeded pseudo-random
composition of a wall, a floor, a round-headed opening, a leaning shaft of light,
sometimes a vessel, sometimes a drape, a cast shadow, a vignette and a film of
`feTurbulence` grain. The seed is the entry's id, so an entry's plate is always
the same plate.

## Sound

Paper, synthesised: band-passed noise sweeps for the turn of a leaf, a two-partial
tap for the detent and the stamp, a short scrape for the nib. Nothing is loaded
from a file. The audio context is created on the first touch, as mobile browsers
require, and the whole library can be switched off in the colophon.

## Motion and access

`Reduce motion` in the colophon — and `prefers-reduced-motion` at the system
level — turn the leaf into a plain swap and shorten every transition to nothing.
All navigation is reachable from the keyboard: `←` and `→` turn pages, `Escape`
closes the article sheet, and the browser's Back button pops one leaf of the
sheet stack at a time. Touch targets are at least forty-four pixels.

## Files

```
index.html     structure and metadata
ed.css         the press specification
plates.js      the drawn plates
ed.js          catalogue indices, sounds, ribbons, launching a fix
leaf.js        chapters, the contents rail, and the turn
article.js     the entry page, the index, marked pages, the colophon, boot
data.js        the shared ILUD catalogue (identical in all ten apps)
```

No build step, no dependencies, no network fonts. Open `index.html` and it runs,
including from `file://`.
