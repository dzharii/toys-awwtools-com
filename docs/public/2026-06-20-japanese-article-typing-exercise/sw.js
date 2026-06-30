/*
 * Service worker for the Japanese Writing Practice PWA.
 *
 * Strategy:
 *   - Precache the full local app shell on install so practice works offline.
 *   - Navigations are network-first (so updates show up) with an offline
 *     fallback to the cached index.html app shell.
 *   - Other same-origin GET requests are cache-first, refreshed in the
 *     background (stale-while-revalidate) so lessons and assets load instantly
 *     and update quietly.
 *   - Cross-origin and non-GET requests are never intercepted; the browser
 *     handles them normally (e.g. Japanese text-to-speech, Tango export tab).
 *
 * Everything is resolved relative to the worker's own scope so the app keeps
 * working from its deep /public/<project>/ path and behind the custom domain.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `jp-writing-practice-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'rss.xml',

  // Built-in sample lessons (so the sample dropdown works offline)
  'texts/index.xml',
  'texts/soccer-event-2026-06-20.jp-lesson.xml',
  'texts/conbini-food-sidebar-420x530.jp-lesson.xml',
  'texts/conbini-food-sidebar-420x530.visual-atlas.jp-lesson.xml',
  'texts/coin-locker-station-sidebar-420x530.jp-lesson.xml',
  'texts/ramen-ticket-machine-sidebar-420x530.jp-lesson.xml',

  // Icons
  'img/icon-192.png',
  'img/icon-512.png',
  'img/icon-maskable-192.png',
  'img/icon-maskable-512.png',
  'img/apple-touch-icon.png',
  'img/favicon-32.png',
  'img/favicon-16.png',
  'favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Add each asset individually with {cache: 'reload'} so install always
      // fetches fresh copies, but a single missing optional asset does not
      // abort the whole install (unlike the atomic cache.addAll).
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
          .filter((key) => key.startsWith('jp-writing-practice-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle same-origin GET requests. Leave everything else (POST, range
  // media, cross-origin) to the browser.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for navigations so updates appear, with offline app-shell
  // fallback to the cached index.html.
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

  // Cache-first for static assets, refreshing the cache in the background.
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
