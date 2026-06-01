(function () {
  "use strict";

  var bookmarkletName = "Drag Show Headers to your bookmarks bar";
  var installTarget = document.querySelector("[data-bookmarklet-install]");
  var sourceTarget = document.querySelector("[data-bookmarklet-source]");
  var lengthTarget = document.querySelector("[data-bookmarklet-length]");
  var copyButton = document.querySelector("[data-copy-bookmarklet]");
  var statusTarget = document.querySelector("[data-copy-status]");

  function buildBookmarkletHref(fn) {
    return "javascript:(" + fn.toString() + ")();";
  }

  function setStatus(text) {
    if (!statusTarget) return;
    statusTarget.textContent = text;
  }

  function renderInstaller() {
    if (typeof window.showDocumentHeadersBookmarklet !== "function") {
      setStatus("Bookmarklet source did not load.");
      return;
    }

    var href = buildBookmarkletHref(window.showDocumentHeadersBookmarklet);

    if (installTarget) {
      installTarget.href = href;
      installTarget.textContent = bookmarkletName;
      installTarget.setAttribute("aria-label", "Drag Show Headers to your bookmarks bar");
    }

    if (sourceTarget) {
      sourceTarget.textContent = href;
    }

    if (lengthTarget) {
      lengthTarget.textContent = href.length.toLocaleString() + " characters";
    }

    if (copyButton) {
      copyButton.addEventListener("click", function () {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          setStatus("Clipboard copy is not available in this browser context.");
          return;
        }

        navigator.clipboard
          .writeText(href)
          .then(function () {
            setStatus("Bookmarklet copied.");
          })
          .catch(function () {
            setStatus("Copy failed. Select the source text instead.");
          });
      });
    }
  }

  renderInstaller();
})();
