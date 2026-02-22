function bookmarklet_paragraph_social_mode() {
  "use strict";

  var ROOT_TAG = "psocial-root";
  var POST_TAG = "psocial-post";
  var ROOT_MARKER_ATTR = "data-psocial-root";
  var WRAPPER_MARKER_ATTR = "data-psocial-wrapper";
  var STORAGE_KEY = "paragraphSocial.v1";
  var STORAGE_VERSION = 1;
  var TOAST_TTL_MS = 2600;
  var MAX_EXCERPT_CHARS = 180;
  var MIN_PARAGRAPH_CHARS = 40;
  var MIN_STRONG_PARAGRAPH_CHARS = 60;
  var MAX_LINK_TEXT_RATIO = 0.55;
  var MAX_PARAGRAPHS = 250;

  var state = {
    rootHost: null,
    rootShadow: null,
    toastLayer: null,
    badgeEl: null,
    modalEl: null,
    modalTextarea: null,
    modalCloseButton: null,
    pendingToasts: [],
    store: createEmptyStore(),
    storageDisabled: false,
    postViewsByHash: new Map(),
    currentManualCopyText: "",
  };

  if (document.querySelector(ROOT_TAG + "[" + ROOT_MARKER_ATTR + "]")) {
    notifyAlreadyActive();
    return;
  }

  run().catch(function (err) {
    console.error("[paragraph-social]", err);
    ensureRootChrome();
    showToast("Paragraph Social Mode failed to initialize.", "error");
  });

  async function run() {
    if (!window.crypto || !window.crypto.subtle || typeof TextEncoder !== "function") {
      ensureRootChrome();
      showToast("Web Crypto is unavailable in this browser.", "error");
      return;
    }

    var allParagraphs = Array.prototype.slice.call(document.querySelectorAll("p"));
    if (!allParagraphs.length) {
      ensureRootChrome();
      showToast("No paragraphs found on this page.", "info");
      return;
    }

    var anchorCandidate = findFirstVisibleParagraph(allParagraphs);
    var anchorNormalizedText = anchorCandidate ? normalizeSemanticText(anchorCandidate.textContent || "") : "";

    loadStore();

    var contentContext = choosePrimaryContentContainer();
    if (!contentContext || !contentContext.container) {
      ensureRootChrome();
      showToast("Could not identify a primary reading area.", "error");
      return;
    }

    var eligible = collectEligibleParagraphs(contentContext.container);
    if (!eligible.length) {
      ensureRootChrome();
      showToast("No eligible reading paragraphs found.", "info");
      return;
    }

    ensureRootChrome();
    showToast("Paragraph Social Mode active.", "success");

    var anchorHash = null;
    var prepared = [];
    for (var i = 0; i < eligible.length; i += 1) {
      var item = eligible[i];
      var hash = await sha256Hex(item.normalizedText);
      if (!anchorHash && anchorNormalizedText && item.normalizedText === anchorNormalizedText) {
        anchorHash = hash;
      }
      prepared.push({
        paragraphEl: item.paragraphEl,
        normalizedText: item.normalizedText,
        hash: hash,
        index: i + 1,
      });
    }

    var hostByHash = new Map();
    for (var j = 0; j < prepared.length; j += 1) {
      var preparedItem = prepared[j];
      var host = transformParagraph(preparedItem, prepared.length);
      if (!hostByHash.has(preparedItem.hash)) {
        hostByHash.set(preparedItem.hash, host);
      }
    }

    restoreScrollAnchor(anchorHash, anchorNormalizedText, hostByHash, prepared);
  }

  function notifyAlreadyActive() {
    var existingRoot = document.querySelector(ROOT_TAG + "[" + ROOT_MARKER_ATTR + "]");
    if (existingRoot && typeof existingRoot.__psocialShowToast === "function") {
      existingRoot.__psocialShowToast("Already active. Refresh to reset.", "info");
      return;
    }

    var notice = document.createElement("div");
    notice.textContent = "Paragraph Social Mode: Already active. Refresh to reset.";
    notice.style.position = "fixed";
    notice.style.top = "10px";
    notice.style.right = "10px";
    notice.style.zIndex = "2147483647";
    notice.style.padding = "10px 12px";
    notice.style.background = "rgba(17, 24, 39, 0.95)";
    notice.style.color = "#fff";
    notice.style.border = "1px solid rgba(255,255,255,0.18)";
    notice.style.borderRadius = "12px";
    notice.style.font = "12px/1.3 system-ui, sans-serif";
    document.body.appendChild(notice);
    setTimeout(function () {
      if (notice && notice.parentNode) {
        notice.parentNode.removeChild(notice);
      }
    }, 2200);
  }

  function createEmptyStore() {
    return {
      version: STORAGE_VERSION,
      records: {},
    };
  }

  function loadStore() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      state.storageDisabled = true;
      state.pendingToasts.push({ message: "localStorage unavailable. Running without persistence.", kind: "error" });
      state.store = createEmptyStore();
      return;
    }

    if (!raw) {
      state.store = createEmptyStore();
      return;
    }

    try {
      var parsed = JSON.parse(raw);
      state.store = normalizeStoreShape(parsed);
    } catch (err2) {
      state.store = createEmptyStore();
      state.pendingToasts.push({ message: "Storage data was unreadable and was reset in memory.", kind: "error" });
    }
  }

  function normalizeStoreShape(parsed) {
    if (!parsed || typeof parsed !== "object") {
      return createEmptyStore();
    }

    var recordsIn = parsed.records && typeof parsed.records === "object" ? parsed.records : parsed;
    var out = createEmptyStore();
    var keys = Object.keys(recordsIn);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var rec = recordsIn[key];
      if (!rec || typeof rec !== "object") {
        continue;
      }
      out.records[key] = {
        likesCount: clampNonNegativeInteger(rec.likesCount),
        dislikesCount: clampNonNegativeInteger(rec.dislikesCount),
        myReaction: normalizeReaction(rec.myReaction),
        lastUpdatedIso: typeof rec.lastUpdatedIso === "string" ? rec.lastUpdatedIso : "",
        sourceUrl: typeof rec.sourceUrl === "string" ? rec.sourceUrl : "",
        excerpt: typeof rec.excerpt === "string" ? rec.excerpt.slice(0, MAX_EXCERPT_CHARS) : "",
      };
      if (
        out.records[key].likesCount === 0 &&
        out.records[key].dislikesCount === 0 &&
        out.records[key].myReaction === null
      ) {
        delete out.records[key];
      }
    }
    return out;
  }

  function clampNonNegativeInteger(value) {
    var n = Number(value);
    if (!isFinite(n) || n <= 0) {
      return 0;
    }
    return Math.max(0, Math.floor(n));
  }

  function normalizeReaction(value) {
    return value === "like" || value === "dislike" ? value : null;
  }

  function persistStoreOrWarn() {
    if (state.storageDisabled) {
      return false;
    }

    try {
      pruneEmptyRecords();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.store));
      return true;
    } catch (err) {
      state.storageDisabled = true;
      showToast("Could not save reactions (storage quota or access error).", "error");
      return false;
    }
  }

  function pruneEmptyRecords() {
    var records = state.store.records || {};
    var keys = Object.keys(records);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var rec = records[key];
      if (!rec) {
        delete records[key];
        continue;
      }
      if (
        clampNonNegativeInteger(rec.likesCount) === 0 &&
        clampNonNegativeInteger(rec.dislikesCount) === 0 &&
        normalizeReaction(rec.myReaction) === null
      ) {
        delete records[key];
      }
    }
  }

  function ensureRootChrome() {
    if (state.rootHost && state.rootShadow) {
      return;
    }

    var host = document.createElement(ROOT_TAG);
    host.setAttribute(ROOT_MARKER_ATTR, "");
    host.style.all = "initial";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "none";
    host.style.display = "block";

    var shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML =
      '<style>' +
      rootChromeStyles() +
      '</style>' +
      '<div class="overlay" aria-live="polite">' +
      '  <div class="badge" id="psocialBadge">Paragraph Social Mode</div>' +
      '  <div class="toasts" id="psocialToasts"></div>' +
      '  <div class="modal-backdrop" id="psocialModalBackdrop" hidden>' +
      '    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="psocialModalTitle">' +
      '      <div class="modal-title" id="psocialModalTitle">Copy link manually</div>' +
      '      <p class="modal-copy">Clipboard access failed. Copy this paragraph link:</p>' +
      '      <textarea id="psocialManualCopy" readonly></textarea>' +
      '      <div class="modal-actions">' +
      '        <button type="button" id="psocialSelect">Select</button>' +
      '        <button type="button" id="psocialClose">Close</button>' +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    document.body.appendChild(host);

    state.rootHost = host;
    state.rootShadow = shadow;
    state.toastLayer = shadow.getElementById("psocialToasts");
    state.badgeEl = shadow.getElementById("psocialBadge");
    state.modalEl = shadow.getElementById("psocialModalBackdrop");
    state.modalTextarea = shadow.getElementById("psocialManualCopy");
    state.modalCloseButton = shadow.getElementById("psocialClose");

    var selectButton = shadow.getElementById("psocialSelect");
    selectButton.addEventListener("click", function () {
      selectManualCopyText();
    });
    state.modalCloseButton.addEventListener("click", function () {
      closeManualCopyPrompt();
    });
    state.modalEl.addEventListener("click", function (event) {
      if (event.target === state.modalEl) {
        closeManualCopyPrompt();
      }
    });

    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Escape") {
          closeManualCopyPrompt();
        }
      },
      true
    );

    host.__psocialShowToast = showToast;

    if (state.pendingToasts.length) {
      for (var i = 0; i < state.pendingToasts.length; i += 1) {
        var pending = state.pendingToasts[i];
        showToast(pending.message, pending.kind);
      }
      state.pendingToasts.length = 0;
    }
  }

  function rootChromeStyles() {
    return [
      ":host{all:initial;}",
      ".overlay{position:fixed;inset:0;pointer-events:none;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;}",
      ".badge{position:fixed;top:12px;right:12px;pointer-events:auto;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(15,23,42,.92);box-shadow:0 10px 30px rgba(0,0,0,.28);font-size:12px;font-weight:650;letter-spacing:.02em;max-width:min(72vw,360px);}",
      ".toasts{position:fixed;right:12px;top:56px;display:flex;flex-direction:column;gap:8px;max-width:min(84vw,420px);}",
      ".toast{pointer-events:auto;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(15,23,42,.95);color:#f8fafc;font-size:12px;line-height:1.35;box-shadow:0 12px 26px rgba(0,0,0,.30);opacity:0;transform:translateY(-4px);animation:psocialToastIn .16s ease-out forwards;}",
      ".toast.error{border-color:rgba(248,113,113,.35);}",
      ".toast.success{border-color:rgba(52,211,153,.35);}",
      ".modal-backdrop[hidden]{display:none !important;}",
      ".modal-backdrop{position:fixed;inset:0;pointer-events:auto;background:rgba(2,6,23,.50);display:flex;align-items:center;justify-content:center;padding:16px;}",
      ".modal{width:min(680px,100%);border-radius:18px;border:1px solid rgba(255,255,255,.16);background:rgba(15,23,42,.95);box-shadow:0 24px 60px rgba(0,0,0,.45);padding:16px;}",
      ".modal-title{font-size:14px;font-weight:700;color:#f8fafc;}",
      ".modal-copy{margin:8px 0 10px 0;color:#cbd5e1;font-size:12px;line-height:1.4;}",
      "textarea{width:100%;min-height:120px;resize:vertical;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(2,6,23,.65);color:#f8fafc;padding:10px;box-sizing:border-box;font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace;}",
      ".modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;}",
      "button{appearance:none;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#f8fafc;padding:8px 10px;font-size:12px;font-weight:600;cursor:pointer;}",
      "button:hover{background:rgba(255,255,255,.10);}",
      "button:focus-visible{outline:2px solid #7dd3fc;outline-offset:2px;}",
      "@keyframes psocialToastIn{to{opacity:1;transform:translateY(0)}}",
      "@media (prefers-reduced-motion:reduce){.toast{animation:none;opacity:1;transform:none;}}",
    ].join("");
  }

  function showToast(message, kind) {
    if (!state.toastLayer) {
      state.pendingToasts.push({ message: message, kind: kind || "info" });
      return;
    }

    var toast = document.createElement("div");
    toast.className = "toast" + (kind ? " " + kind : "");
    toast.textContent = message;
    state.toastLayer.appendChild(toast);

    setTimeout(function () {
      if (!toast.parentNode) {
        return;
      }
      toast.style.transition = "opacity .16s ease, transform .16s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-2px)";
      setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 180);
    }, TOAST_TTL_MS);
  }

  function openManualCopyPrompt(text) {
    ensureRootChrome();
    state.currentManualCopyText = text;
    state.modalTextarea.value = text;
    state.modalEl.hidden = false;
    selectManualCopyText();
  }

  function selectManualCopyText() {
    if (!state.modalTextarea || state.modalEl.hidden) {
      return;
    }
    state.modalTextarea.focus();
    state.modalTextarea.select();
    try {
      state.modalTextarea.setSelectionRange(0, state.modalTextarea.value.length);
    } catch (err) {
      /* no-op */
    }
  }

  function closeManualCopyPrompt() {
    if (!state.modalEl || state.modalEl.hidden) {
      return;
    }
    state.modalEl.hidden = true;
    if (state.modalCloseButton) {
      state.modalCloseButton.blur();
    }
  }

  function findFirstVisibleParagraph(paragraphs) {
    var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    for (var i = 0; i < paragraphs.length; i += 1) {
      var p = paragraphs[i];
      if (!isElementVisible(p)) {
        continue;
      }
      var rect = p.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < viewportH) {
        return p;
      }
    }
    return null;
  }

  function choosePrimaryContentContainer() {
    var paragraphs = Array.prototype.slice.call(document.querySelectorAll("p"));
    var candidateMap = new Map();
    var orderedCandidates = [];

    for (var i = 0; i < paragraphs.length; i += 1) {
      var p = paragraphs[i];
      if (!isElementVisible(p)) {
        continue;
      }
      if (isInsideExcludedSubtree(p)) {
        continue;
      }

      var normalized = normalizeSemanticText(p.textContent || "");
      if (normalized.length < MIN_STRONG_PARAGRAPH_CHARS) {
        continue;
      }

      var linkRatio = estimateLinkTextRatio(p, normalized.length);
      if (linkRatio > MAX_LINK_TEXT_RATIO) {
        continue;
      }

      var ancestors = getCandidateAncestors(p);
      for (var j = 0; j < ancestors.length; j += 1) {
        var node = ancestors[j];
        if (!candidateMap.has(node)) {
          var entry = {
            node: node,
            textLen: 0,
            paragraphCount: 0,
            linkPenalty: 0,
            depth: getDomDepth(node),
            order: orderedCandidates.length,
          };
          candidateMap.set(node, entry);
          orderedCandidates.push(entry);
        }
        var candidate = candidateMap.get(node);
        candidate.textLen += normalized.length;
        candidate.paragraphCount += 1;
        candidate.linkPenalty += Math.round(linkRatio * normalized.length);
      }
    }

    if (!orderedCandidates.length) {
      return null;
    }

    var bestScore = -Infinity;
    for (var k = 0; k < orderedCandidates.length; k += 1) {
      var c = orderedCandidates[k];
      c.score = scoreCandidateContainer(c);
      if (c.score > bestScore) {
        bestScore = c.score;
      }
    }

    var shortlist = orderedCandidates.filter(function (c) {
      return c.score >= bestScore * 0.85;
    });

    shortlist.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.depth !== a.depth) return b.depth - a.depth;
      if (b.paragraphCount !== a.paragraphCount) return b.paragraphCount - a.paragraphCount;
      return a.order - b.order;
    });

    return {
      container: shortlist[0].node,
      score: shortlist[0].score,
      paragraphCount: shortlist[0].paragraphCount,
    };
  }

  function getCandidateAncestors(paragraphEl) {
    var out = [];
    var node = paragraphEl.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      if (isCandidateContainerElement(node)) {
        out.push(node);
      }
      node = node.parentElement;
    }
    if (document.querySelector("main")) {
      var mainEl = document.querySelector("main");
      if (mainEl && out.indexOf(mainEl) === -1 && mainEl.contains(paragraphEl)) {
        out.push(mainEl);
      }
    }
    if (document.body && out.indexOf(document.body) === -1) {
      out.push(document.body);
    }
    return out;
  }

  function isCandidateContainerElement(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }
    if (isExcludedTag(el.tagName)) {
      return false;
    }
    if (looksLikeBoilerplate(el)) {
      return false;
    }
    var tag = el.tagName.toLowerCase();
    if (tag === "article" || tag === "main" || tag === "section") {
      return true;
    }
    if (el.getAttribute("role") === "main") {
      return true;
    }
    return tag === "div";
  }

  function scoreCandidateContainer(candidate) {
    var node = candidate.node;
    var tag = node.tagName ? node.tagName.toLowerCase() : "";
    var tagBonus = tag === "article" ? 220 : tag === "main" ? 180 : tag === "section" ? 60 : 0;
    var tagPenalty = tag === "body" ? 420 : 0;
    var paragraphBonus = candidate.paragraphCount * 80;
    var linkPenalty = candidate.linkPenalty * 2;
    var boilerplatePenalty = looksLikeBoilerplate(node) ? 1000 : 0;
    return candidate.textLen + paragraphBonus + tagBonus - tagPenalty - linkPenalty - boilerplatePenalty;
  }

  function collectEligibleParagraphs(container) {
    var paragraphs = Array.prototype.slice.call(container.querySelectorAll("p"));
    var results = [];

    for (var i = 0; i < paragraphs.length && results.length < MAX_PARAGRAPHS; i += 1) {
      var p = paragraphs[i];
      if (!isElementVisible(p)) {
        continue;
      }
      if (isInsideExcludedSubtree(p)) {
        continue;
      }
      if (p.closest(POST_TAG)) {
        continue;
      }

      var normalizedText = normalizeSemanticText(p.textContent || "");
      if (normalizedText.length < MIN_PARAGRAPH_CHARS) {
        continue;
      }

      var linkRatio = estimateLinkTextRatio(p, normalizedText.length);
      if (linkRatio > MAX_LINK_TEXT_RATIO) {
        continue;
      }

      results.push({
        paragraphEl: p,
        normalizedText: normalizedText,
      });
    }

    return results;
  }

  function isInsideExcludedSubtree(el) {
    var node = el;
    while (node && node !== document.body && node !== document.documentElement) {
      if (node.nodeType !== 1) {
        node = node.parentElement;
        continue;
      }
      if (isExcludedTag(node.tagName) || looksLikeBoilerplate(node)) {
        return true;
      }
      if (node.hasAttribute("contenteditable")) {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  }

  function isExcludedTag(tagName) {
    if (!tagName) return false;
    var tag = String(tagName).toLowerCase();
    return (
      tag === "nav" ||
      tag === "header" ||
      tag === "footer" ||
      tag === "aside" ||
      tag === "form" ||
      tag === "menu" ||
      tag === "dialog" ||
      tag === "figure" ||
      tag === "figcaption" ||
      tag === "noscript" ||
      tag === "button" ||
      tag === "label" ||
      tag === "textarea" ||
      tag === "select" ||
      tag === "option"
    );
  }

  function looksLikeBoilerplate(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }

    var role = (el.getAttribute("role") || "").toLowerCase();
    if (
      role === "navigation" ||
      role === "banner" ||
      role === "contentinfo" ||
      role === "complementary" ||
      role === "dialog" ||
      role === "menu"
    ) {
      return true;
    }

    var token = ((el.id || "") + " " + (el.className && typeof el.className === "string" ? el.className : ""))
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (!token) {
      return false;
    }

    return /(nav|menu|sidebar|comment|footer|header|popup|modal|share|ad-| ad |ads|promo|toolbar|breadcrumb|related|recommend)/.test(
      " " + token + " "
    );
  }

  function estimateLinkTextRatio(paragraphEl, normalizedTextLength) {
    if (!normalizedTextLength) {
      return 0;
    }
    var links = paragraphEl.querySelectorAll("a");
    if (!links.length) {
      return 0;
    }
    var linkTextChars = 0;
    for (var i = 0; i < links.length; i += 1) {
      linkTextChars += normalizeSemanticText(links[i].textContent || "").length;
    }
    return Math.min(1, linkTextChars / normalizedTextLength);
  }

  function isElementVisible(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }
    var style = window.getComputedStyle(el);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      Number(style.opacity) === 0
    ) {
      return false;
    }
    var rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }
    return true;
  }

  function getDomDepth(el) {
    var depth = 0;
    var node = el;
    while (node && node.parentElement) {
      depth += 1;
      node = node.parentElement;
    }
    return depth;
  }

  function normalizeSemanticText(text) {
    return String(text || "")
      .replace(/\u00ad/g, "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function sha256Hex(text) {
    var enc = new TextEncoder();
    var bytes = enc.encode(text);
    var digest = await window.crypto.subtle.digest("SHA-256", bytes);
    var array = new Uint8Array(digest);
    var hex = "";
    for (var i = 0; i < array.length; i += 1) {
      var part = array[i].toString(16);
      hex += part.length === 1 ? "0" + part : part;
    }
    return hex;
  }

  function transformParagraph(item, totalCount) {
    var originalP = item.paragraphEl;
    var computed = window.getComputedStyle(originalP);
    var host = document.createElement(POST_TAG);
    host.setAttribute(WRAPPER_MARKER_ATTR, "");
    host.setAttribute("data-psocial-hash", item.hash);
    host.style.display = "block";
    host.style.marginTop = computed.marginTop;
    host.style.marginBottom = computed.marginBottom;
    host.style.marginLeft = computed.marginLeft;
    host.style.marginRight = computed.marginRight;
    host.style.width = "auto";
    host.style.boxSizing = "border-box";
    host.style.fontFamily = computed.fontFamily;
    host.style.fontSize = computed.fontSize;
    host.style.lineHeight = computed.lineHeight;
    host.style.fontWeight = computed.fontWeight;
    host.style.letterSpacing = computed.letterSpacing;
    host.style.color = computed.color;
    host.style.setProperty("--psocial-body-font-family", computed.fontFamily || "system-ui, sans-serif");
    host.style.setProperty("--psocial-body-font-size", computed.fontSize || "1rem");
    host.style.setProperty("--psocial-body-line-height", computed.lineHeight || "1.6");
    host.style.setProperty("--psocial-body-color", computed.color || "#111827");

    var shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML =
      '<style>' +
      postCardStyles() +
      "</style>" +
      '<article class="card" part="card">' +
      '  <div class="header" aria-hidden="true">Paragraph ' +
      item.index +
      " / " +
      totalCount +
      "</div>" +
      '  <div class="body" part="body"></div>' +
      '  <div class="footer" part="footer">' +
      '    <button class="btn like" type="button" aria-label="Like paragraph" aria-pressed="false"><span class="label">Like</span> <span class="count" data-kind="like">0</span></button>' +
      '    <button class="btn dislike" type="button" aria-label="Dislike paragraph" aria-pressed="false"><span class="label">Dislike</span> <span class="count" data-kind="dislike">0</span></button>' +
      '    <button class="btn tertiary copy" type="button" aria-label="Copy paragraph link">Copy Link</button>' +
      '    <button class="btn tertiary share" type="button" aria-label="Share paragraph">Share</button>' +
      "  </div>" +
      "</article>";

    var bodyEl = shadow.querySelector(".body");
    bodyEl.textContent = item.normalizedText;

    var record = getRecordForView(item.hash, item.normalizedText);
    var view = {
      hash: item.hash,
      normalizedText: item.normalizedText,
      excerpt: buildExcerpt(item.normalizedText),
      host: host,
      shadow: shadow,
      likeButton: shadow.querySelector(".like"),
      dislikeButton: shadow.querySelector(".dislike"),
      likeCountEl: shadow.querySelector('.count[data-kind="like"]'),
      dislikeCountEl: shadow.querySelector('.count[data-kind="dislike"]'),
      copyButton: shadow.querySelector(".copy"),
      shareButton: shadow.querySelector(".share"),
    };

    registerView(item.hash, view);
    renderViewFromRecord(view, record);
    wireViewEvents(view);

    originalP.parentNode.replaceChild(host, originalP);
    return host;
  }

  function postCardStyles() {
    return [
      ":host{display:block;contain:layout style;}",
      "*{box-sizing:border-box;}",
      ".card{--bg-solid:rgba(255,255,255,.92);--bg-glass:rgba(255,255,255,.68);--text:#0f172a;--muted:#64748b;--border:rgba(15,23,42,.12);--accent:#0284c7;--accent-bg:rgba(2,132,199,.12);--bad:#dc2626;--bad-bg:rgba(220,38,38,.10);border:1px solid var(--border);border-radius:16px;padding:12px 12px 10px;background:var(--bg-solid);box-shadow:0 10px 28px rgba(2,6,23,.08);color:var(--text);font-family:var(--psocial-body-font-family,system-ui,sans-serif);}",
      "@supports ((backdrop-filter: blur(8px)) or (-webkit-backdrop-filter: blur(8px))){.card{background:var(--bg-glass);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}}",
      "@media (prefers-color-scheme:dark){.card{--bg-solid:rgba(15,23,42,.92);--bg-glass:rgba(15,23,42,.70);--text:#e5e7eb;--muted:#94a3b8;--border:rgba(255,255,255,.12);box-shadow:0 14px 34px rgba(0,0,0,.26);}}",
      ".header{font-size:11px;line-height:1.2;color:var(--muted);font-weight:650;letter-spacing:.03em;text-transform:uppercase;margin:0 0 8px 0;}",
      ".body{margin:0;color:var(--psocial-body-color,var(--text));font-family:var(--psocial-body-font-family,system-ui,sans-serif);font-size:var(--psocial-body-font-size,1rem);line-height:var(--psocial-body-line-height,1.6);white-space:normal;word-break:normal;}",
      ".footer{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center;}",
      ".btn{appearance:none;border:1px solid var(--border);border-radius:999px;padding:7px 10px;background:rgba(255,255,255,.6);color:var(--text);font:600 12px/1.1 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:transform .12s ease,background-color .12s ease,border-color .12s ease;}",
      "@media (prefers-color-scheme:dark){.btn{background:rgba(255,255,255,.04);}}",
      ".btn:hover{transform:translateY(-1px);}",
      ".btn:active{transform:translateY(0);}",
      ".btn:focus-visible{outline:2px solid #38bdf8;outline-offset:2px;}",
      ".btn[aria-pressed=\"true\"].like{border-color:rgba(2,132,199,.35);background:var(--accent-bg);color:#0369a1;}",
      ".btn[aria-pressed=\"true\"].dislike{border-color:rgba(220,38,38,.35);background:var(--bad-bg);color:#b91c1c;}",
      "@media (prefers-color-scheme:dark){.btn[aria-pressed=\"true\"].like{color:#7dd3fc;}.btn[aria-pressed=\"true\"].dislike{color:#fca5a5;}}",
      ".btn.tertiary{font-weight:550;}",
      ".count{display:inline-block;min-width:1ch;text-align:right;font-variant-numeric:tabular-nums;opacity:.9;}",
      "@media (prefers-reduced-motion:reduce){.btn{transition:none;}.btn:hover,.btn:active{transform:none;}}",
    ].join("");
  }

  function registerView(hash, view) {
    if (!state.postViewsByHash.has(hash)) {
      state.postViewsByHash.set(hash, []);
    }
    state.postViewsByHash.get(hash).push(view);
  }

  function ensureRecord(hash, normalizedText) {
    var record = state.store.records[hash];
    if (!record) {
      record = {
        likesCount: 0,
        dislikesCount: 0,
        myReaction: null,
        lastUpdatedIso: "",
        sourceUrl: location.href,
        excerpt: buildExcerpt(normalizedText),
      };
      state.store.records[hash] = record;
    } else {
      record.likesCount = clampNonNegativeInteger(record.likesCount);
      record.dislikesCount = clampNonNegativeInteger(record.dislikesCount);
      record.myReaction = normalizeReaction(record.myReaction);
      if (!record.excerpt) {
        record.excerpt = buildExcerpt(normalizedText);
      }
    }
    return record;
  }

  function getRecordForView(hash, normalizedText) {
    var existing = state.store.records[hash];
    if (!existing) {
      return {
        likesCount: 0,
        dislikesCount: 0,
        myReaction: null,
        lastUpdatedIso: "",
        sourceUrl: "",
        excerpt: buildExcerpt(normalizedText),
      };
    }
    existing.likesCount = clampNonNegativeInteger(existing.likesCount);
    existing.dislikesCount = clampNonNegativeInteger(existing.dislikesCount);
    existing.myReaction = normalizeReaction(existing.myReaction);
    if (!existing.excerpt) {
      existing.excerpt = buildExcerpt(normalizedText);
    }
    return existing;
  }

  function buildExcerpt(text) {
    if (!text) return "";
    if (text.length <= MAX_EXCERPT_CHARS) {
      return text;
    }
    return text.slice(0, MAX_EXCERPT_CHARS - 1).trimEnd() + "...";
  }

  function renderViewFromRecord(view, record) {
    view.likeCountEl.textContent = String(clampNonNegativeInteger(record.likesCount));
    view.dislikeCountEl.textContent = String(clampNonNegativeInteger(record.dislikesCount));
    view.likeButton.setAttribute("aria-pressed", record.myReaction === "like" ? "true" : "false");
    view.dislikeButton.setAttribute("aria-pressed", record.myReaction === "dislike" ? "true" : "false");
  }

  function wireViewEvents(view) {
    view.likeButton.addEventListener("click", function () {
      applyReaction(view.hash, view.normalizedText, "like");
    });
    view.dislikeButton.addEventListener("click", function () {
      applyReaction(view.hash, view.normalizedText, "dislike");
    });
    view.copyButton.addEventListener("click", function () {
      handleCopyLink(view.normalizedText);
    });
    view.shareButton.addEventListener("click", function () {
      handleShare(view.normalizedText);
    });
  }

  function applyReaction(hash, normalizedText, nextReaction) {
    var record = ensureRecord(hash, normalizedText);
    var prevReaction = record.myReaction;

    if (prevReaction === nextReaction) {
      if (nextReaction === "like") {
        record.likesCount = Math.max(0, clampNonNegativeInteger(record.likesCount) - 1);
      } else if (nextReaction === "dislike") {
        record.dislikesCount = Math.max(0, clampNonNegativeInteger(record.dislikesCount) - 1);
      }
      record.myReaction = null;
    } else if (nextReaction === "like") {
      if (prevReaction === "dislike") {
        record.dislikesCount = Math.max(0, clampNonNegativeInteger(record.dislikesCount) - 1);
      }
      record.likesCount = clampNonNegativeInteger(record.likesCount) + 1;
      record.myReaction = "like";
    } else if (nextReaction === "dislike") {
      if (prevReaction === "like") {
        record.likesCount = Math.max(0, clampNonNegativeInteger(record.likesCount) - 1);
      }
      record.dislikesCount = clampNonNegativeInteger(record.dislikesCount) + 1;
      record.myReaction = "dislike";
    }

    record.lastUpdatedIso = new Date().toISOString();
    record.sourceUrl = location.href;
    record.excerpt = buildExcerpt(normalizedText);

    if (record.likesCount === 0 && record.dislikesCount === 0 && record.myReaction === null) {
      delete state.store.records[hash];
    }

    persistStoreOrWarn();
    refreshViews(hash, normalizedText);
  }

  function refreshViews(hash, normalizedText) {
    var views = state.postViewsByHash.get(hash) || [];
    var record =
      state.store.records[hash] ||
      {
        likesCount: 0,
        dislikesCount: 0,
        myReaction: null,
        excerpt: buildExcerpt(normalizedText),
      };
    for (var i = 0; i < views.length; i += 1) {
      renderViewFromRecord(views[i], record);
    }
  }

  async function handleCopyLink(normalizedText) {
    var url = buildParagraphDeepLink(normalizedText);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(url);
        showToast("Paragraph link copied.", "success");
        return;
      }
      throw new Error("Clipboard API unavailable");
    } catch (err) {
      openManualCopyPrompt(url);
      showToast("Clipboard unavailable. Use manual copy.", "info");
    }
  }

  async function handleShare(normalizedText) {
    var url = buildParagraphDeepLink(normalizedText);
    var excerpt = buildShareExcerpt(normalizedText);

    if (typeof navigator.share === "function") {
      try {
        var shareData = {
          title: document.title || "Shared paragraph",
          text: excerpt,
          url: url,
        };
        if (typeof navigator.canShare === "function") {
          try {
            if (!navigator.canShare(shareData)) {
              throw new Error("navigator.canShare returned false");
            }
          } catch (canShareErr) {
            throw canShareErr;
          }
        }
        await navigator.share(shareData);
        showToast("Share sheet opened.", "success");
        return;
      } catch (err) {
        if (err && err.name === "AbortError") {
          return;
        }
      }
    }

    await handleCopyLink(normalizedText);
  }

  function buildShareExcerpt(normalizedText) {
    var maxChars = 210;
    var excerpt = normalizedText.length > maxChars ? normalizedText.slice(0, maxChars - 1).trimEnd() + "..." : normalizedText;
    return "Quoted paragraph: " + excerpt;
  }

  function buildParagraphDeepLink(normalizedText) {
    var baseUrl;
    try {
      var u = new URL(location.href);
      u.hash = "";
      baseUrl = u.toString();
    } catch (err) {
      baseUrl = String(location.href || "").split("#")[0];
    }

    if (!normalizedText) {
      return baseUrl;
    }

    var startWindow = sliceByCodepoints(normalizedText, 0, 90).trim();
    var endWindow = "";
    if (normalizedText.length > 140) {
      endWindow = sliceTailByCodepoints(normalizedText, 44).trim();
    }

    var fragment = encodeURIComponent(startWindow);
    if (endWindow && endWindow !== startWindow) {
      fragment += "," + encodeURIComponent(endWindow);
    }

    return baseUrl + "#:~:text=" + fragment;
  }

  function sliceByCodepoints(text, start, count) {
    var arr = Array.from(text);
    return arr.slice(start, start + count).join("");
  }

  function sliceTailByCodepoints(text, count) {
    var arr = Array.from(text);
    return arr.slice(Math.max(0, arr.length - count)).join("");
  }

  function restoreScrollAnchor(anchorHash, anchorNormalizedText, hostByHash, prepared) {
    var targetHost = null;
    if (anchorHash && hostByHash.has(anchorHash)) {
      targetHost = hostByHash.get(anchorHash);
    }

    if (!targetHost && anchorNormalizedText) {
      for (var i = 0; i < prepared.length; i += 1) {
        if (prepared[i].normalizedText === anchorNormalizedText && hostByHash.has(prepared[i].hash)) {
          targetHost = hostByHash.get(prepared[i].hash);
          break;
        }
      }
    }

    if (targetHost && typeof targetHost.scrollIntoView === "function") {
      try {
        targetHost.scrollIntoView({ block: "center", inline: "nearest" });
      } catch (err) {
        try {
          targetHost.scrollIntoView();
        } catch (err2) {
          /* no-op */
        }
      }
    }
  }
}

window.bookmarklet_paragraph_social_mode = bookmarklet_paragraph_social_mode;
