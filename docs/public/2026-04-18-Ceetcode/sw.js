const CACHE_NAME = "ceetcode-static-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/style.css",
  "/assets/main.js",
  "/assets/compile.worker.js",
  "/assets/run.worker.js",
  "/vendor/wasm-clang/clang",
  "/vendor/wasm-clang/lld",
  "/vendor/wasm-clang/memfs",
  "/vendor/wasm-clang/sysroot.tar"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

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
