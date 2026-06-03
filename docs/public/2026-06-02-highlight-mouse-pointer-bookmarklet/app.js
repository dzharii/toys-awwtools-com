(function () {
  "use strict";

  var bookmarkletName = "Drag to bookmarks bar: Highlight Mouse Pointer";
  var installTarget = document.querySelector("[data-bookmarklet-install]");
  var sourceTarget = document.querySelector("[data-bookmarklet-source]");
  var lengthTarget = document.querySelector("[data-bookmarklet-length]");
  var statusTarget = document.querySelector("[data-copy-status]");

  function buildBookmarkletHref(fn) {
    return "javascript:(" + fn.toString() + ")();";
  }

  function setStatus(text) {
    if (!statusTarget) return;
    statusTarget.textContent = text;
  }

  function renderInstaller() {
    if (typeof window.highlightMousePointerBookmarklet !== "function") {
      setStatus("Bookmarklet source did not load.");
      return;
    }

    var href = buildBookmarkletHref(window.highlightMousePointerBookmarklet);

    if (installTarget) {
      installTarget.href = href;
      installTarget.textContent = bookmarkletName;
      installTarget.setAttribute(
        "aria-label",
        "Drag Highlight Mouse Pointer to your bookmarks bar"
      );
    }

    if (sourceTarget) {
      sourceTarget.textContent = href;
    }

    if (lengthTarget) {
      lengthTarget.textContent = href.length.toLocaleString() + " characters";
    }
  }

  renderInstaller();
})();
