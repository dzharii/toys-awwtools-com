# ILUD Transit

*The network of ways around AI — interpretation four of ten.*

A metro diagram of the whole ILUD catalogue. Every remedy is a station; every
approach is a line; every part of ordinary digital life is an interchange. You
do not browse a list here — you take a line and ride it.

## The model

| On the map | In the catalogue |
| --- | --- |
| Four coloured lines | the four **approaches** — Turn it off (orange), Use something else (blue), Work around it (sage), Find human-made (bronze) |
| 87 stations | the 87 **fixes** |
| 8 gold roundels down the centre | the 8 **categories**, in order: search, social, images, writing, shopping, browsing, video, everyday |
| Dashed ties from a roundel | which lines call at that part of life |
| A route drawn in gold | one of the five **intents** — the nuisance you actually have |

Station order is not arbitrary. Each line runs top to bottom through the
categories in taxonomy order, so the same latitude on every line is the same
part of life: everything level with the gold **Images** roundel is about
images, whichever line you happen to be riding.

## Riding it

- **Drag** to pan, **pinch** or **double-tap** to zoom, or use the three
  controls on the right (`+`, `−`, fit).
- **Tap a chip** at the top, or a **terminus roundel**, to take that line. The
  rest of the network drops to a quarter opacity and the station names appear —
  which is what makes 87 labels legible on a phone at all.
- **Tap a station** for its card: the outcome in plain words, one gold
  **Use this fix** button, and `…` for the full record.
- **▸** rides the line on its own — one stop every 2.6 seconds, the viewport
  travelling with the token, a rail-joint click at each station and a bell at
  the terminus.
- **Plan** turns an intent ("Search keeps answering instead of finding") into a
  route across several lines, drawn on the map.
- **Keep** puts a stop on your **Travelcard**; two or more can be plotted as a
  single journey.
- Keyboard: `↑` `↓` along the line, `←` `→` between lines, `/` for Find,
  `Esc` to step back.

## Why a query, not an instruction

Where a fix is a matter of *searching differently*, the card does not tell you
what to type. It takes what you type and opens the destination already in the
right mode — `Use this fix` → a field → the transformed URL in a new tab. The
mechanism is in the full record under **How it works**, for anyone who wants it.

## Sound

Rolling stock, synthesised in the browser with the Web Audio API — no files are
downloaded. Rail joints while travelling, a door chime on opening a sheet, a
validator stamp when a fix is kept, an inharmonic station bell at the end of the
line. Unlocked on first touch (as mobile browsers require) and switchable off
under **Notices → Settings**, where the motion can also be calmed.

## Technique

Vanilla HTML, CSS and JavaScript; no build step, no framework, no network fonts,
no tracking, no requests to anywhere. The map is one inline `<svg>`; the
viewport is a single `transform` on a `<g>`, which is why panning is smooth on a
four-year-old phone. Stations are placed by a small layout pass (`network.js`),
and the travelling token is positioned with `getPointAtLength` against a
binary search on the rail path, so it genuinely follows the rails round their
corners rather than being tweened between two points.

Opens from `file://` as happily as from a server. Everything it remembers —
your travelcard, where you have been, sound and motion — stays in this
browser's `localStorage` and is erasable from **Notices**.

## Files

```
index.html     structure, splash, HUD, dock, sheet
transit.css    the whole design system
transit.js     window.TRN — data indices, sound, panel stack, prefs, launch
network.js     window.NET — layout, rails, view, gestures, ride
panels.js      window.PANELS — record, find, plan, route, interchange,
               travelcard, notices, and boot()
data.js        window.ILUD_DATA — the shared catalogue (identical in all ten)
```
