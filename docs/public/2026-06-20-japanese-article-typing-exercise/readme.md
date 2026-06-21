# Japanese Article Typing Exercise

A static browser app for practicing Japanese writing by rewriting one annotated article sentence by sentence.

## Highlights

- Imports a custom lesson HTML file with token text, romaji, meanings, timing, and optional images.
- Shows previous sentence context, a magnified active sentence, remaining article text, and token-level hints.
- Advances through tokens with guided timing while recording correct, missed, skipped, and timed-out tokens.
- Uses browser text-to-speech for Japanese sentence playback when a Japanese voice is available.
- Saves the latest article, position, timing, statistics, and settings in localStorage for refresh recovery.
- Exports the plain Japanese article text to a Tango import URL.

## Files

- `index.html`: static app shell.
- `styles.css`: e-ink inspired reading and writing surface.
- `app.js`: lesson parsing, practice state, speech, storage, reporting, and export logic.
- `texts/`: sample lesson files.
- `specs/`: product notes and bug-fix change requests.
