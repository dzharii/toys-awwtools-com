/*
 * PWA bootstrap: registers the service worker using a scope-relative path so
 * it works from the deep /public/<project>/ location and behind the custom
 * domain. Registration is best-effort; if it fails the app keeps working.
 */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  // Resolve sw.js relative to this script so the worker scope covers the whole
  // app folder regardless of where it is served from.
  var swUrl = new URL('sw.js', document.currentScript.src).href;
  var scope = new URL('./', swUrl).href;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swUrl, { scope: scope }).then(
      function (reg) {
        // When a new worker finishes installing, ask it to activate immediately
        // so the next controllerchange reloads the page with fresh assets.
        reg.addEventListener('updatefound', function () {
          var installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', function () {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              installing.postMessage('SKIP_WAITING');
            }
          });
        });
      },
      function (err) {
        console.warn('[pwa] service worker registration failed:', err);
      }
    );

    var reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
})();
