(function () {
  "use strict";

  // Labels (per spec K00/M00). Kept as constants so copy stays consistent.
  var INLINE_LABEL = "Reading Navigator";
  var FN_NAME = "readingNavigatorBookmarklet";
  var BUNDLE_PATH = "dist/reading-navigator.bundle.js";

  function $(sel) {
    return document.querySelector(sel);
  }

  var statusTarget = $("[data-install-status]");
  var loaderLink = $("[data-bookmarklet-install]");
  var loaderSource = $("[data-bookmarklet-source]");
  var loaderLength = $("[data-bookmarklet-length]");
  var inlineLink = $("[data-bookmarklet-install-inline]");
  var inlineSource = $("[data-bookmarklet-source-inline]");
  var inlineLength = $("[data-bookmarklet-length-inline]");

  function setStatus(text) {
    if (statusTarget) statusTarget.textContent = text;
  }

  function formatCount(value) {
    try {
      return Number(value).toLocaleString("en-US") + " characters";
    } catch (_e) {
      return value + " characters";
    }
  }

  function disableLink(link, text) {
    if (!link) return;
    link.removeAttribute("href");
    link.textContent = text;
    link.setAttribute("aria-disabled", "true");
  }

  // Build the hosted-loader bookmarklet dynamically. The loader is fully
  // self-contained (it only injects the hosted bundle and calls the exposed
  // function), so building it from toString() is safe and honest. The bundle
  // URL is derived from this page's own location so it is absolute in prod.
  function buildLoaderHref(bundleUrl) {
    function loaderBookmarklet(url, name) {
      if (window[name]) {
        window[name]();
        return;
      }
      var s = document.createElement("script");
      s.src = url;
      s.onload = function () {
        try {
          if (window[name]) window[name]();
        } catch (e) {
          if (window.console) console.error(e);
        }
      };
      s.onerror = function () {
        alert("Reading Navigator: failed to load script.");
      };
      document.body.appendChild(s);
    }
    var src =
      "(" + loaderBookmarklet.toString() + ")(" + JSON.stringify(bundleUrl) + "," + JSON.stringify(FN_NAME) + ");";
    return "javascript:" + encodeURI(src);
  }

  function render() {
    var fn = window[FN_NAME];

    if (typeof fn !== "function") {
      setStatus("Bookmarklet bundle did not load. Rebuild the project (bun run build) and reload this page.");
      disableLink(loaderLink, "Bookmarklet unavailable");
      disableLink(inlineLink, "Bookmarklet unavailable");
      return;
    }

    var bundleUrl;
    try {
      bundleUrl = new URL(BUNDLE_PATH, window.location.href).href;
    } catch (_e) {
      bundleUrl = BUNDLE_PATH;
    }

    // --- Primary: hosted loader (small, robust) ---
    var loaderHref = buildLoaderHref(bundleUrl);
    if (loaderHref.indexOf("javascript:") === 0 && loaderLink) {
      loaderLink.href = loaderHref;
      loaderLink.textContent = LOADER_LABEL;
      loaderLink.setAttribute("aria-label", LOADER_LABEL);
    }
    if (loaderSource) loaderSource.textContent = loaderHref;
    if (loaderLength) loaderLength.textContent = formatCount(loaderHref.length);

    // --- Advanced: inline self-contained bundle (from the build artifact) ---
    var pack = window.readingNavigatorBookmarklets;
    var inlineHref = pack && typeof pack.inline === "string" ? pack.inline : "";
    if (inlineHref && inlineHref.indexOf("javascript:") === 0) {
      if (inlineLink) {
        inlineLink.href = inlineHref;
        inlineLink.textContent = INLINE_LABEL;
        inlineLink.setAttribute("aria-label", INLINE_LABEL);
      }
      if (inlineSource) inlineSource.textContent = inlineHref;
      if (inlineLength) inlineLength.textContent = formatCount(inlineHref.length);
    } else {
      disableLink(inlineLink, "Inline bookmarklet unavailable");
      if (inlineSource) inlineSource.textContent = "Run \"bun run build\" to generate the inline bookmarklet.";
      if (inlineLength) inlineLength.textContent = "unavailable";
    }

    setStatus("Bookmarklet links generated. Drag a link to your bookmarks bar.");
  }

  render();
})();
