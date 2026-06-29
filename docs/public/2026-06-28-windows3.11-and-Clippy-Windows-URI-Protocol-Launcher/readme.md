# Windows 3.11 URI Launcher with Clippy

A retro Program Manager-style desktop, in the browser, that launches real Windows URI links. Open program-group icons, browse 353 curated launchers, search, copy, inspect details, edit templates, and ask Windows to open apps, Settings pages, and system surfaces. Clippy guides first-time users.

## How to run

- Open `index.html` directly, or serve the folder: `python -m http.server` then visit `index.html`. Clippy assets load best over a server, but the launcher works either way.

## Highlights

- Windows 3.11 desktop: draggable/focusable program-group windows, active/inactive title bars, menu bar, status bars, taskbar, dotted focus.
- 13 program groups: Windows Apps, Settings (nested subgroups), Capture, Store, System and Security, Network and Devices, Accessibility, Privacy, Personalization, Gaming and Xbox, Legacy and Optional, All Links, Help.
- Icon and details views; concrete links use `href`-based Open, templates open a Template Editor.
- Global search (press `/`) across title, URI, description, tags, category, status, with aliases (wifi, snip, bt, defender...).
- Concise, rate-limited Clippy assistant. Hide/Mute/Help controls. Launcher works if Clippy fails.
- Local retro SVG icons, no CDN, no web fonts, no external runtime assets.

## Notes

- Launches are user-initiated and never claim success; status shows `Launch requested`.
- Non-Windows shows a banner; browse/copy stay enabled. Templates can't launch with placeholders.
- Vendored, cleaned subsets: `vendor/win3x/` (classic stylesheets, MIT) and `vendor/clippy/` (clippy.js + jQuery). Data in `src/data/links.js`.
