/*
 * Service worker for the Clippy Launcher PWA.
 *
 * Strategy:
 *   - Precache the full local app shell on install so the launcher works offline.
 *   - Serve same-origin GET requests cache-first, falling back to the network and
 *     then to the cached index.html for navigations (offline app shell).
 *   - Never touch cross-origin requests or non-GET requests; let the browser handle
 *     them normally. External URI launches (ms-settings:, etc.) are not fetches and
 *     are unaffected by the worker.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `clippy-launcher-${CACHE_VERSION}`;

// Resolve everything relative to the worker's own scope so the app keeps working
// regardless of the deep /public/<project>/ path it is served from.
const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.webmanifest',

  // Styles
  'src/styles/win311.css',
  'vendor/win3x/theme.css',
  'vendor/win3x/skins/3.1.css',
  'vendor/clippy/clippy.css',

  // Scripts
  'src/data/links.js',
  'src/data/categories.js',
  'src/ui/icons.js',
  'src/ui/app.js',
  'src/ui/clippy-controller.js',
  'src/ui/pwa.js',
  'vendor/clippy/jquery.min.js',
  'vendor/clippy/clippy.min.js',

  // Clippy agent assets (loaded locally by the controller)
  'vendor/clippy/agents/Clippy/agent.js',
  'vendor/clippy/agents/Clippy/map.png',
  'vendor/clippy/agents/Clippy/sounds-mp3.js',
  'vendor/clippy/agents/Clippy/sounds-ogg.js',

  // win3x UI svg assets referenced from theme.css
  'vendor/win3x/arrow-right.svg',
  'vendor/win3x/checkmark.svg',
  'vendor/win3x/close.svg',
  'vendor/win3x/dropdown-arrow.svg',
  'vendor/win3x/maximize.svg',
  'vendor/win3x/menu-checkmark.svg',
  'vendor/win3x/minimize.svg',
  'vendor/win3x/restore.svg',
  'vendor/win3x/scroll-down.svg',
  'vendor/win3x/scroll-left.svg',
  'vendor/win3x/scroll-right.svg',
  'vendor/win3x/scroll-up.svg',

  // Icons
  'img/icon-192.png',
  'img/icon-512.png',
  'img/icon-maskable-192.png',
  'img/icon-maskable-512.png',
  'img/apple-touch-icon.png',
  'img/favicon-32.png',
  'img/favicon-16.png',
  'img/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll is atomic; if one asset fails the install fails. Use individual
      // requests with {cache: 'reload'} so we always fetch fresh copies on install,
      // but tolerate optional assets that might be missing.
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[sw] precache skipped:', url, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('clippy-launcher-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle same-origin GET requests. Leave everything else (POST, cross-origin
  // CDN-less external resources, protocol launches) to the browser.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations so updates show up, with offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('index.html'))
        )
    );
    return;
  }

  // Cache-first for static assets, updating the cache in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Allow the page to trigger an immediate activation after an update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
