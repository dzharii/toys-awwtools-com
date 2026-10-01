# ILUD Folio

*A card index for a cleared internet.*

The third of ten interpretations of the ILUD catalogue. Where the Atlas is a
world you sail and the Instrument is a dial you turn, the Folio is a **tray of
index cards** — cream stock, brass eyelets, a Didone display face and tabbed
dividers down the right-hand edge.

## The idea

A card index is the oldest random-access database in the world, and it is still
the most legible one. Each of the 87 remedies is a card. The top card lies open;
the rest wait beneath it in a cascade. You do not scroll a list — you *handle*
the cards.

## How it behaves

| Gesture | Result |
| --- | --- |
| Swipe the top card left or right | It flicks to the back of the drawer |
| Tap a card lower in the stack | It rises to the top |
| Tap the open card | The full record slides up |
| Drag the open card upward | The same |
| **Use fix** | The card *turns over* to its writing side |
| Right-edge tabs | Change drawer, with a riffle |
| The sun, top right | Deals one card at random from the whole catalogue |
| ← → ↑ ↓ | The same four things, without a finger |

The writing side is where the work happens. For a remedy that transforms a
search, there is a ruled line and a **Go** button: type what you actually wanted
to find, and the destination opens already in its plain mode. For a remedy that
is a setting, the back of the card carries the steps.

## The four screens behind the tray

* **The record** — the whole entry: what changes, step by step, why it works
  (folded away until asked for), what to watch out for, the alternatives, and
  the sources with the date each was last checked.
* **The index** — free-text search across titles, services, tags and mechanisms,
  plus five *nuisances* to start from when you do not have a word for the
  problem, and the cards you looked at last.
* **The pocket** — cards you kept. Stored in this browser and nowhere else.
* **The colophon** — how to use the tray, the two switches, the research
  policy, and a button that forgets everything on the device.

## Sound

Every sound is synthesised by the browser at run time — there are no audio
files. The library is paper, not metal: a card sliding from a stack (filtered
noise swelling through a band-pass), a corner flicked past the thumb, nine
overlapping bursts for a riffle, a soft cardboard thud, a pencil tick on a tab,
a rubber stamp when a card goes into the pocket. The engine is unlocked by the
first touch, as mobile browsers require, and there is a switch in the colophon.

`navigator.vibrate` is used where it exists (Android) and silently skipped where
it does not (iOS).

## Accessibility

* Every card is a focusable button with a full label; the tray is fully
  operable from the keyboard.
* `prefers-reduced-motion` is honoured, and there is an explicit **Calm the
  motion** switch for people whose system setting says otherwise.
* Touch targets are at or above 44 px; safe-area insets are respected top and
  bottom.
* The sheet is a modal dialog with Escape, a close control, a drag-to-dismiss
  handle and hardware-back support.

## Files

```
index.html     structure and metadata
folio.css      the whole design system
folio.js       data indices, storage, sound, the page sheet
stack.js       the tray: layout by rank, gestures, tabs, the card flip
page.js        record / index / pocket / colophon, and the boot
data.js        the shared catalogue (generated — do not edit here)
reference.png  the approved design reference
```

No build step, no framework, no network calls. Open `index.html` and it works,
including from `file://`.

## Data

`data.js` is generated from `_research/` by `node _tools/build-data.js` and
copied into every app. Edit the research, not this copy.
