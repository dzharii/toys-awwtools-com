const CACHE_NAME = "ceetcode-static-v2";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./assets/main.js",
  "./assets/compile.worker.js",
  "./assets/run.worker.js",
  "./vendor/wasm-clang/clang.wasm",
  "./vendor/wasm-clang/lld.wasm",
  "./vendor/wasm-clang/memfs.wasm",
  "./vendor/wasm-clang/sysroot.tar"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const shouldPreferNetwork =
    requestUrl.pathname.endsWith("/index.html") ||
    requestUrl.pathname.endsWith("/sw.js") ||
    requestUrl.pathname.includes("/assets/") ||
    requestUrl.pathname.includes("/vendor/wasm-clang/");

  if (shouldPreferNetwork) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
        return networkResponse;
      });
    })
  );
});
