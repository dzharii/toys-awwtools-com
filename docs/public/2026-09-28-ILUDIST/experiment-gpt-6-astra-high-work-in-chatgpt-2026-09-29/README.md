# A00 / ILUD: ten independent applications

Open `index.html` to choose an application. Each folder under `apps/` is a complete static website with its own interface code, styles, catalogue, and local assets. Any application folder can be copied out and used independently.

There are no package dependencies, build requirements, API keys, remote fonts, or analytics. The application loads without contacting external services. Opening a recommended destination requires an internet connection.

## B00 / Run

On a desktop, open the root `index.html` directly in a modern browser. For a more consistent origin, local storage, and phone access, serve the extracted directory with Python 3:

```sh
cd ILUD
python3 -m http.server 8000
```

Then open `http://localhost:8000`. To use a phone on the same network, open the computer's local network address on port 8000. Mobile file-preview applications may not execute JavaScript, so use an HTTP or HTTPS static host for phone use. Clipboard access may be unavailable on plain HTTP; a selectable destination field is provided as a fallback.

No server-side application is involved. A conventional static host can serve the root collection or any individual application folder. This delivery has not been deployed.

## C00 / The ten interpretations

| Folder | Reference filename | Interaction |
| --- | --- | --- |
| `apps/01-cabinet` | `1000065894.png` | Brass tools select a category; the paper drawer advances through fixes. |
| `apps/02-compass` | `1000065895.png` | A three-way frustration selector leads through activity choices to a remedy. |
| `apps/03-routes` | `1000065896.png` | Four colored routes expose selectable stations and a destination ticket. |
| `apps/04-instrument` | `1000065897.png` | A rotary selector supports dragging, momentum, detents, taps, and keyboard arrows. |
| `apps/05-doors` | `1000065898.png` | Three architectural doors open to purpose-specific categories and fixes. |
| `apps/06-editorial` | `1000065899.png` | A section rail, folio turns, and related stories support editorial exploration. |
| `apps/07-reveal` | `1000065900.png` | A draggable comparison and native range control explain the effect of a fix. |
| `apps/08-atlas` | `1000065902.png` | Island hotspots light a route and populate a destination panel; the map can enlarge. |
| `apps/09-pathways` | `1000065901.png` | Three illuminated branches connect frustrations to activity nodes and actions. |
| `apps/10-folio` | `1000065903.png` | Layered paper cards can be swiped, lifted, bookmarked, and selected by tab. |

The supplied references are preserved under `references/`. The gallery thumbnails are labeled as references; they are not claimed as screenshots of the delivered apps. The implementations follow the reference compositions, materials, and interaction metaphors without including simulated phone hardware or operating-system status bars.

## D00 / Product behavior

Every app includes all 40 catalogue entries, purpose and service search, task/device/approach filters, saved fixes, recent destinations, individual source details, and local review flags. The main design-specific flow is supplemented by the All fixes browser so that weather, maps, travel, translation, communication, productivity, reading, and learning remain discoverable even when the visual metaphor presents six broad tools.

Query actions prepare an external destination and navigate in the same tab, preserving an ordinary browser Back path. Guide actions open a destination or official instructions in a new tab. Nothing claims that an external setting was changed automatically. No app requests location, camera, microphone, contacts, notifications, or account access.

Saved fixes, recently opened entry IDs, preferences, and review flags are stored in the browser under a separate key for each design. Query text is not written to storage. If storage is blocked, the application keeps the current visit usable and explains that saving is temporary. This is intentionally local state, with no account synchronization.

## E00 / Source and maintenance files

`research/catalog.json` is a readable, structured export of the catalogue. Each entry records its purpose, category, approach, direct URL or query builder, instructions, limitations, compatible device classes, installation requirement, source keys, source-review date, review interval, and null hands-on test date.

`research/SOURCES.md` maps entries to primary sources. `research/RESEARCH.md` explains inclusion decisions, rejected techniques, and evidence limits. `research/MOBILE.md` records the browser decisions. `research/ASSETS.md` identifies image origins.

The source-review date is September 29, 2026. After 90 days, entries show Review due. A local user flag does not send a report anywhere or imply a global catalogue update.

## F00 / Editing and rebuilding

The delivered `apps/` folders are immediately usable. Rebuilding is optional.

The canonical shared implementation lives in `authoring/base/`. Each independent layout and interaction lives in `authoring/designs/`. The catalogue is authored in `authoring/make_catalog.py`, which produces `authoring/catalog.json` and the browser's classic-script data file. This avoids fetch and module restrictions when opening local files.

After editing the canonical files, run:

```sh
python3 build.py
```

This refreshes the ten applications, gallery, catalogue export, and source register. Rebuilding overwrites the assembled application files, so make reusable edits under `authoring/`. Generated artwork required for rebuilding is included under `authoring/assets/`.

## G00 / Validation boundary

As requested, validation was limited to JavaScript syntax, structured catalogue consistency, local asset references, and ZIP integrity. No browser rendering, device gesture testing, visual comparison, accessibility audit, or end-to-end third-party service test was performed. This is a complete source delivery with those explicit validation limits, not a claim of pixel-perfect or device-tested reproduction.

The interfaces target current Safari, Chrome, Firefox, and Edge with native dialog, Pointer Events, CSS transforms, and standard browser storage. Sound is opt-in. Reduced motion follows the device setting and can also be selected in each app. Gestures have button, keyboard, select, or range-control alternatives.
