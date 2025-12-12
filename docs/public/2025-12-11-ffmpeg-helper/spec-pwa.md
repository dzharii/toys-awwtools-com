## M00 PWA packaging and install specification

M00.01 Goal
The project must be installable as a Progressive Web App on Android so it can be launched like a native app, work offline, and keep its UI state (settings, templates) between runs.

M00.02 User value
Installing as a PWA reduces friction. The user opens one icon, gets a full screen experience, and can use the tool without network access after the first successful load.

M00.03 Delivery shape
The app remains a static site: index.html, style.css, main.js, manifest.webmanifest, service-worker.js, and icons. No build step is required.

M00.04 Hosting requirement
The app must be served over HTTPS (or localhost for development) so the service worker and install flow work reliably.

M00.05 Install behavior on Android
When opened in a Chromium based browser, the site must be detected as installable. After install, it must launch in standalone display mode, not in a normal browser tab, and must not show the browser URL bar during normal usage.

M00.06 Offline behavior
After the first successful load, the app must load again with airplane mode enabled. The UI must render and allow generating commands. Template and settings persistence continues to rely on localStorage.

M00.07 Update behavior
When a new version is deployed, the app must eventually update its cached assets. The UI must either automatically reload on next launch or show a small "Update available" banner with a reload button. The chosen strategy must be implemented consistently and documented.

## N00 PWA implementation details

N00.01 Web app manifest
Add a file named manifest.webmanifest and link it from index.html with rel="manifest".

Manifest fields required for this project:

N00.01.01 name and short_name
Use a short_name that fits under an Android home screen icon label.

N00.01.02 start_url and scope
start_url should be "./" (or "/" depending on hosting). scope must include all app files. Keep both consistent with hosting path, especially if served from a subdirectory.

N00.01.03 display
display must be "standalone" to run like an app. Optionally add display_override with "standalone" first.

N00.01.04 background_color and theme_color
Set both so the splash screen and status bar look intentional. Keep them aligned with the default theme.

N00.01.05 icons
Provide at least 192x192 and 512x512 PNG icons. Include maskable icons for Android. The icons should be physically present in the repo and referenced by correct paths in the manifest.

N00.02 App identity in HTML
In index.html, include:

N00.02.01 meta viewport (already present).
N00.02.02 meta theme-color that matches the manifest theme_color.
N00.02.03 link rel="manifest" to the manifest file.
N00.02.04 optional apple-touch-icon is not required for the Android target, but can be added if desired.

N00.03 Service worker
Add a file service-worker.js and register it from main.js (or a small inline script in index.html) only when supported.

N00.03.01 Registration rules
Register on window load or after DOMContentLoaded. Do not block initial rendering. Log registration success and errors to console in a single prefix namespace.

N00.03.02 Cache strategy
Use a versioned cache name, for example ffh-cache-v1.

The recommended strategy for this project:

N00.03.02.01 App shell assets
Cache-first for the app shell: index.html, style.css, main.js, manifest.webmanifest, and icons. These must be available offline.

N00.03.02.02 Navigation requests
For navigation requests (mode: "navigate"), respond with cached index.html if offline, otherwise fetch and update cache. This enables direct launches.

N00.03.02.03 Other requests
Network-first is acceptable for any external links, but this app should not rely on external resources to function. Ideally, there are no runtime external dependencies.

N00.03.03 Cache population
During install, pre-cache the known app shell file list. Keep the list explicit and small. Avoid caching unknown directories.

N00.03.04 Activation and cleanup
On activate, remove older cache versions. This prevents stale files from accumulating.

N00.03.05 Update signaling
Pick one update model:

N00.03.05.01 Simple model
Let updates apply on next launch naturally. The new service worker activates after all clients close.

N00.03.05.02 User-visible model
When a new service worker is waiting, show a small banner "Update available" with a reload button that calls skipWaiting in the worker and then reloads the page.

If the user-visible model is implemented, document it in the UI in a minimal way.

N00.04 Offline first UX details
When offline, the app should still show a subtle status indicator, for example "Offline" in the header, so the user understands why external links may not open.

N00.05 PWA scope and storage notes
The PWA stores settings and templates in localStorage scoped to its origin. If the app is hosted under different domains or paths, storage does not transfer. This is why import/export remains important even with PWA install.

N00.06 Security constraints reminder
The PWA cannot gain filesystem path access beyond the browser sandbox. Installing as a PWA does not change that. The base directory model remains required.

## O00 Verification to-do list for a coding agent

O00.01 Files and wiring
O00.01.01 Confirm index.html links manifest.webmanifest via rel="manifest".
O00.01.02 Confirm index.html includes meta name="theme-color" matching the manifest.
O00.01.03 Confirm service-worker.js exists at the expected path and is registered by main.js.
O00.01.04 Confirm all icon files referenced by the manifest exist and load without 404.

O00.02 Manifest correctness
O00.02.01 Validate manifest JSON parses and is served with a correct content type.
O00.02.02 Confirm start_url and scope match the deployed path.
O00.02.03 Confirm display is "standalone".
O00.02.04 Confirm at least 192 and 512 icons exist, and at least one is maskable.

O00.03 Service worker behavior
O00.03.01 Confirm service worker registers successfully in Chrome DevTools Application tab.
O00.03.02 Confirm install event pre-caches the app shell list.
O00.03.03 Confirm activate event deletes old cache versions.
O00.03.04 Confirm fetch handler serves app shell assets offline.

O00.04 Offline functional test
O00.04.01 Load the app once online.
O00.04.02 Enable airplane mode.
O00.04.03 Relaunch the PWA from the home screen icon.
O00.04.04 Confirm the page loads, renders templates, and generates commands.
O00.04.05 Confirm copy to clipboard still works where supported.

O00.05 Installability test on Android
O00.05.01 Open the site in Android Chrome.
O00.05.02 Confirm the "Install app" option appears (menu or prompt).
O00.05.03 Install and launch.
O00.05.04 Confirm it opens in standalone (no URL bar in normal use).
O00.05.05 Confirm orientation and viewport scale behave correctly.

O00.06 Update test
O00.06.01 Deploy a trivial version change (for example a visible version string).
O00.06.02 Confirm the new service worker is installed and either activates on next launch (simple model) or triggers an update banner (user-visible model).
O00.06.03 Confirm after update the cached files match the new version and the app still works offline.

O00.07 Quality gates
O00.07.01 Confirm no runtime dependency on external CDNs (unless explicitly intended).
O00.07.02 Confirm no mixed content warnings (everything HTTPS).
O00.07.03 Confirm console is free of uncaught exceptions during normal use.
O00.07.04 Confirm localStorage persistence still works inside the installed PWA.

O00.08 Completion report format
O00.08.01 For each item O00.01 through O00.07, report PASS or FAIL.
O00.08.02 For each FAIL, include: what was observed, the likely cause, and the exact file and line area to change.
O00.08.03 Provide a final summary: installability status, offline status, update status, and any remaining risks.
