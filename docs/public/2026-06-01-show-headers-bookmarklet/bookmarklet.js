function showDocumentHeadersBookmarklet() {
  "use strict";
  /* =========================     Config     ========================= */
  var CONFIG = {
    maxAbove: 5,
    maxBelow: 5,
    headingSelector: "h1, h2, h3, h4, h5, h6",
    defaultPosition: { top: 80, left: 40 },
    defaultSize: { width: 380, height: 340 },
    defaultOpacity: 0.95,
    /* Font controls */
    defaultFontScale: 1.05,
    minFontScale: 0.85,
    maxFontScale: 1.45,
    /* Theme: "minuet" or "glass" */
    defaultTheme: "minuet",
    /* Contrast mode makes text and borders stronger */
    defaultHighContrast: true,
    updateThrottleMs: 60,
  };
  /* =========================     Utilities     ========================= */
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
  function safeText(s) {
    return (s == null ? "" : String(s)).replace(/\s+/g, " ").trim();
  }
  function getHeadingLevel(el) {
    var tag = el && el.tagName ? el.tagName.toUpperCase() : "";
    if (!/^H[1-6]$/.test(tag)) return null;
    return parseInt(tag.slice(1), 10);
  }
  function isElementVisibleEnough(el) {
    if (!el || !el.getClientRects || el.getClientRects().length === 0)
      return false;
    var style = window.getComputedStyle(el);
    if (!style) return true;
    if (style.visibility === "hidden" || style.display === "none") return false;
    return true;
  }
  function nowMs() {
    return typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  }
  function throttle(fn, waitMs) {
    var last = 0;
    var timer = null;
    var pendingArgs = null;
    function invoke() {
      timer = null;
      last = nowMs();
      fn.apply(null, pendingArgs || []);
      pendingArgs = null;
    }
    return function () {
      pendingArgs = Array.prototype.slice.call(arguments);
      var t = nowMs();
      var remaining = waitMs - (t - last);
      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        invoke();
        return;
      }
      if (!timer) {
        timer = setTimeout(invoke, remaining);
      }
    };
  }
  function ensureId(el, prefix) {
    if (el.id && el.id.trim()) return el.id;
    var base =
      prefix +
      "-" +
      Math.random().toString(36).slice(2) +
      "-" +
      Date.now().toString(36);
    el.id = base;
    return el.id;
  }
  function computeScrollTop() {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }
  function scrollToElement(el) {
    if (!el) return;
    try {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } catch (e) {
      el.scrollIntoView(true);
    }
  }
  /* =========================     Heading Index     ========================= */
  function collectHeadings() {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll(CONFIG.headingSelector),
    );
    var headings = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var lvl = getHeadingLevel(el);
      if (!lvl) continue;
      if (!isElementVisibleEnough(el)) continue;
      var text = safeText(el.textContent);
      if (!text) {
        text =
          safeText(el.getAttribute("aria-label")) ||
          safeText(el.getAttribute("title")) ||
          "(untitled heading)";
      }
      headings.push({
        el: el,
        level: lvl,
        text: text,
        topAbs: 0,
        id: ensureId(el, "bm-hdr"),
      });
    }
    return headings;
  }
  function refreshHeadingPositions(headings) {
    var scrollTop = computeScrollTop();
    for (var i = 0; i < headings.length; i++) {
      var rect = headings[i].el.getBoundingClientRect();
      headings[i].topAbs = rect.top + scrollTop;
    }
  }
  function findNearestIndexAtScroll(headings, yAbs) {
    if (!headings.length) return -1;
    var lo = 0;
    var hi = headings.length - 1;
    var best = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      var t = headings[mid].topAbs;
      if (t <= yAbs) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best;
  }
  function buildContextPath(headings, index) {
    if (index < 0 || index >= headings.length) return [];
    var path = [];
    var currLevel = headings[index].level;
    path.unshift(headings[index]);
    for (var i = index - 1; i >= 0; i--) {
      var h = headings[i];
      if (h.level < currLevel) {
        path.unshift(h);
        currLevel = h.level;
        if (currLevel === 1) break;
      }
    }
    return path;
  }
  function sliceClosest(headings, currentIndex, aboveCount, belowCount) {
    var above = [];
    var below = [];
    if (currentIndex >= 0) {
      var startAbove = clamp(currentIndex - aboveCount, 0, headings.length - 1);
      above = headings.slice(startAbove, currentIndex + 1);
    } else {
      above = [];
    }
    if (currentIndex + 1 < headings.length) {
      var endBelow = clamp(currentIndex + 1 + belowCount, 0, headings.length);
      below = headings.slice(currentIndex + 1, endBelow);
    } else {
      below = [];
    }
    return { above: above, below: below };
  }
  /* =========================     UI (Shadow DOM Window)     ========================= */
  var HOST_ID = "bm-header-navigator-host";
  function alreadyInjected() {
    return !!document.getElementById(HOST_ID);
  }
  function removeExisting() {
    var host = document.getElementById(HOST_ID);
    if (host && host.parentNode) host.parentNode.removeChild(host);
  }
  function createHost() {
    var host = document.createElement("div");
    host.id = HOST_ID;
    host.style.position = "fixed";
    host.style.zIndex = "2147483647";
    host.style.top = "0";
    host.style.left = "0";
    host.style.width = "0";
    host.style.height = "0";
    document.documentElement.appendChild(host);
    return host;
  }
  function createShadowRoot(host) {
    return host.attachShadow({ mode: "open" });
  }
  function createStyles() {
    var style = document.createElement("style");
    style.textContent =
      ":host{ all: initial; }\n" +
      ".bm-root{\n" +
      "  --bm-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;\n" +
      "  --bm-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace;\n" +
      "  --bm-radius: 10px;\n" +
      "  --bm-border: rgba(0,0,0,0.38);\n" +
      "  --bm-border-strong: rgba(0,0,0,0.55);\n" +
      "  --bm-shadow: 0 18px 46px rgba(0,0,0,0.40);\n" +
      "  --bm-shadow-inset: inset 0 1px 0 rgba(255,255,255,0.55);\n" +
      "  --bm-titlebar-glass: rgba(220,230,235,0.22);\n" +
      "  --bm-titlebar-glass-2: rgba(220,230,235,0.08);\n" +
      "  --bm-title-text: rgba(15,18,22,0.92);\n" +
      "  --bm-body-bg: rgba(236, 239, 242, 0.96);\n" +
      "  --bm-body-text: rgba(20, 24, 28, 0.95);\n" +
      "  --bm-subtle-text: rgba(20, 24, 28, 0.70);\n" +
      "  --bm-item-bg: rgba(255,255,255,0.70);\n" +
      "  --bm-item-bg-hover: rgba(255,255,255,0.90);\n" +
      "  --bm-item-border: rgba(0,0,0,0.10);\n" +
      "  --bm-accent: rgba(38, 125, 255, 0.18);\n" +
      "  --bm-accent-border: rgba(38, 125, 255, 0.30);\n" +
      "  --bm-btn-bg: rgba(255,255,255,0.72);\n" +
      "  --bm-btn-bg-hover: rgba(255,255,255,0.92);\n" +
      "  --bm-btn-border: rgba(0,0,0,0.22);\n" +
      "  --bm-btn-text: rgba(10,12,14,0.92);\n" +
      "  --bm-backdrop-blur: blur(16px) saturate(140%);\n" +
      "}\n" +
      ".bm-root[data-theme=%27glass%27]{\n" +
      "  --bm-titlebar-glass: rgba(255,255,255,0.22);\n" +
      "  --bm-titlebar-glass-2: rgba(255,255,255,0.08);\n" +
      "  --bm-title-text: rgba(255,255,255,0.92);\n" +
      "  --bm-body-bg: rgba(18, 20, 26, 0.62);\n" +
      "  --bm-body-text: rgba(255,255,255,0.92);\n" +
      "  --bm-subtle-text: rgba(255,255,255,0.70);\n" +
      "  --bm-item-bg: rgba(255,255,255,0.06);\n" +
      "  --bm-item-bg-hover: rgba(255,255,255,0.10);\n" +
      "  --bm-item-border: rgba(255,255,255,0.12);\n" +
      "  --bm-btn-bg: rgba(0,0,0,0.18);\n" +
      "  --bm-btn-bg-hover: rgba(0,0,0,0.28);\n" +
      "  --bm-btn-border: rgba(255,255,255,0.18);\n" +
      "  --bm-btn-text: rgba(255,255,255,0.92);\n" +
      "  --bm-border: rgba(255,255,255,0.14);\n" +
      "  --bm-border-strong: rgba(255,255,255,0.22);\n" +
      "  --bm-shadow-inset: inset 0 1px 0 rgba(255,255,255,0.12);\n" +
      "}\n" +
      ".bm-root[data-contrast=%27high%27]{\n" +
      "  --bm-border: var(--bm-border-strong);\n" +
      "  --bm-item-border: rgba(0,0,0,0.18);\n" +
      "}\n" +
      ".bm-root[data-theme=%27glass%27][data-contrast=%27high%27]{\n" +
      "  --bm-item-border: rgba(255,255,255,0.18);\n" +
      "}\n" +
      ".bm-window{\n" +
      "  position: fixed;\n" +
      "  top: " +
      CONFIG.defaultPosition.top +
      "px;\n" +
      "  left: " +
      CONFIG.defaultPosition.left +
      "px;\n" +
      "  width: " +
      CONFIG.defaultSize.width +
      "px;\n" +
      "  height: " +
      CONFIG.defaultSize.height +
      "px;\n" +
      "  box-sizing: border-box;\n" +
      "  border-radius: 12px;\n" +
      "  overflow: hidden;\n" +
      "  font-family: var(--bm-font);\n" +
      "  opacity: " +
      CONFIG.defaultOpacity +
      ";\n" +
      "  transform: translateZ(0);\n" +
      "  user-select: none;\n" +
      "  box-shadow: var(--bm-shadow);\n" +
      "  border: 1px solid var(--bm-border);\n" +
      "  background: var(--bm-body-bg);\n" +
      "  -webkit-backdrop-filter: var(--bm-backdrop-blur);\n" +
      "  backdrop-filter: var(--bm-backdrop-blur);\n" +
      "}\n" +
      ".bm-titlebar{\n" +
      "  height: 38px;\n" +
      "  display: flex;\n" +
      "  align-items: center;\n" +
      "  padding: 0 10px;\n" +
      "  box-sizing: border-box;\n" +
      "  gap: 10px;\n" +
      "  cursor: grab;\n" +
      "  position: relative;\n" +
      "  background: linear-gradient(180deg, var(--bm-titlebar-glass), var(--bm-titlebar-glass-2));\n" +
      "  border-bottom: 1px solid var(--bm-border);\n" +
      "}\n" +
      ".bm-titlebar:active{ cursor: grabbing; }\n" +
      ".bm-titlebar::before{\n" +
      "  content: %27%27;\n" +
      "  position: absolute;\n" +
      "  inset: 0;\n" +
      "  pointer-events: none;\n" +
      "  box-shadow: var(--bm-shadow-inset);\n" +
      "}\n" +
      ".bm-titlebar::after{\n" +
      "  content: %27%27;\n" +
      "  position: absolute;\n" +
      "  inset: 0;\n" +
      "  pointer-events: none;\n" +
      "  background:\n" +
      "    radial-gradient(120px 60px at 20% 40%, rgba(255,255,255,0.20), transparent 70%),\n" +
      "    radial-gradient(140px 70px at 75% 30%, rgba(255,255,255,0.14), transparent 72%);\n" +
      "  filter: blur(0.6px);\n" +
      "  opacity: 0.75;\n" +
      "}\n" +
      ".bm-leftmark{\n" +
      "  width: 12px;\n" +
      "  height: 12px;\n" +
      "  border-radius: 2px;\n" +
      "  background: rgba(0,0,0,0.22);\n" +
      "  border: 1px solid rgba(255,255,255,0.20);\n" +
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.22);\n" +
      "}\n" +
      ".bm-root[data-theme=%27glass%27] .bm-leftmark{\n" +
      "  background: rgba(255,255,255,0.18);\n" +
      "  border: 1px solid rgba(255,255,255,0.22);\n" +
      "}\n" +
      ".bm-title{\n" +
      "  font-size: calc(12px * var(--bm-font-scale));\n" +
      "  font-weight: 600;\n" +
      "  letter-spacing: 0.2px;\n" +
      "  color: var(--bm-title-text);\n" +
      "  white-space: nowrap;\n" +
      "  overflow: hidden;\n" +
      "  text-overflow: ellipsis;\n" +
      "  flex: 1;\n" +
      "  text-align: center;\n" +
      "  padding-right: 56px;\n" +
      "}\n" +
      ".bm-controls{\n" +
      "  display: flex;\n" +
      "  align-items: center;\n" +
      "  gap: 8px;\n" +
      "}\n" +
      ".bm-btn{\n" +
      "  appearance: none;\n" +
      "  border: 1px solid var(--bm-btn-border);\n" +
      "  background: var(--bm-btn-bg);\n" +
      "  color: var(--bm-btn-text);\n" +
      "  padding: 5px 10px;\n" +
      "  border-radius: 6px;\n" +
      "  font-size: calc(12px * var(--bm-font-scale));\n" +
      "  cursor: pointer;\n" +
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);\n" +
      "}\n" +
      ".bm-btn:hover{ background: var(--bm-btn-bg-hover); }\n" +
      ".bm-btn:active{ transform: translateY(1px); }\n" +
      ".bm-btn-close{\n" +
      "  width: 28px;\n" +
      "  padding: 5px 0;\n" +
      "  font-weight: 800;\n" +
      "}\n" +
      ".bm-content{\n" +
      "  height: calc(100% - 38px);\n" +
      "  display: flex;\n" +
      "  flex-direction: column;\n" +
      "  box-sizing: border-box;\n" +
      "}\n" +
      ".bm-scroll{\n" +
      "  overflow: auto;\n" +
      "  padding: 10px 10px 10px 10px;\n" +
      "  box-sizing: border-box;\n" +
      "  user-select: text;\n" +
      "  color: var(--bm-body-text);\n" +
      "  -webkit-font-smoothing: antialiased;\n" +
      "  text-rendering: optimizeLegibility;\n" +
      "}\n" +
      ".bm-sectionlabel{\n" +
      "  font-size: calc(11px * var(--bm-font-scale));\n" +
      "  color: var(--bm-subtle-text);\n" +
      "  margin: 10px 0 6px 0;\n" +
      "  letter-spacing: 0.25px;\n" +
      "}\n" +
      ".bm-path{\n" +
      "  font-size: calc(11px * var(--bm-font-scale));\n" +
      "  color: var(--bm-body-text);\n" +
      "  margin-bottom: 8px;\n" +
      "  border: 1px solid var(--bm-item-border);\n" +
      "  background: var(--bm-item-bg);\n" +
      "  border-radius: 10px;\n" +
      "  padding: 8px 10px;\n" +
      "}\n" +
      ".bm-pathline{ margin: 3px 0; }\n" +
      ".bm-item{\n" +
      "  display: flex;\n" +
      "  align-items: flex-start;\n" +
      "  gap: 10px;\n" +
      "  padding: 7px 9px;\n" +
      "  border-radius: 10px;\n" +
      "  cursor: pointer;\n" +
      "  border: 1px solid var(--bm-item-border);\n" +
      "  background: var(--bm-item-bg);\n" +
      "  margin-bottom: 6px;\n" +
      "}\n" +
      ".bm-item:hover{\n" +
      "  background: var(--bm-item-bg-hover);\n" +
      "}\n" +
      ".bm-item.bm-current{\n" +
      "  background: var(--bm-accent);\n" +
      "  border-color: var(--bm-accent-border);\n" +
      "}\n" +
      ".bm-level{\n" +
      "  font-size: calc(11px * var(--bm-font-scale));\n" +
      "  opacity: 0.9;\n" +
      "  min-width: 32px;\n" +
      "  text-align: center;\n" +
      "  border: 1px solid var(--bm-item-border);\n" +
      "  border-radius: 6px;\n" +
      "  padding: 2px 6px;\n" +
      "  margin-top: 1px;\n" +
      "  background: rgba(0,0,0,0.04);\n" +
      "  font-family: var(--bm-mono);\n" +
      "}\n" +
      ".bm-root[data-theme=%27glass%27] .bm-level{\n" +
      "  background: rgba(0,0,0,0.18);\n" +
      "  border-color: var(--bm-item-border);\n" +
      "}\n" +
      ".bm-text{\n" +
      "  font-size: calc(12px * var(--bm-font-scale));\n" +
      "  line-height: calc(1.25rem * var(--bm-font-scale));\n" +
      "  opacity: 0.98;\n" +
      "  word-break: break-word;\n" +
      "}\n" +
      ".bm-footer{\n" +
      "  display: flex;\n" +
      "  align-items: center;\n" +
      "  justify-content: space-between;\n" +
      "  gap: 10px;\n" +
      "  padding: 8px 10px;\n" +
      "  border-top: 1px solid var(--bm-border);\n" +
      "  background: rgba(0,0,0,0.04);\n" +
      "}\n" +
      ".bm-root[data-theme=%27glass%27] .bm-footer{\n" +
      "  background: rgba(0,0,0,0.10);\n" +
      "}\n" +
      ".bm-small{\n" +
      "  font-size: calc(11px * var(--bm-font-scale));\n" +
      "  color: var(--bm-subtle-text);\n" +
      "  white-space: nowrap;\n" +
      "}\n" +
      ".bm-slider{ width: 120px; }\n" +
      ".bm-resize{\n" +
      "  position: absolute;\n" +
      "  width: 16px;\n" +
      "  height: 16px;\n" +
      "  right: 6px;\n" +
      "  bottom: 6px;\n" +
      "  cursor: nwse-resize;\n" +
      "  border-radius: 3px;\n" +
      "  background: linear-gradient(135deg, rgba(0,0,0,0.20), rgba(0,0,0,0.00));\n" +
      "  opacity: 0.55;\n" +
      "}\n" +
      ".bm-root[data-theme=%27glass%27] .bm-resize{\n" +
      "  background: linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.00));\n" +
      "}\n" +
      "@media (prefers-contrast: more){\n" +
      "  .bm-root{ --bm-border: var(--bm-border-strong); }\n" +
      "}\n" +
      "@media (forced-colors: active){\n" +
      "  .bm-window{ forced-color-adjust: none; background: Canvas; color: CanvasText; border-color: CanvasText; }\n" +
      "  .bm-titlebar{ background: Canvas; border-bottom-color: CanvasText; }\n" +
      "  .bm-title{ color: CanvasText; }\n" +
      "  .bm-scroll{ color: CanvasText; }\n" +
      "  .bm-item{ background: Canvas; border-color: CanvasText; }\n" +
      "  .bm-item.bm-current{ background: Highlight; border-color: Highlight; }\n" +
      "  .bm-text{ color: CanvasText; }\n" +
      "  .bm-btn{ background: Canvas; color: CanvasText; border-color: CanvasText; }\n" +
      "}\n";
    return style;
  }
  function createRoot(shadow) {
    var root = document.createElement("div");
    root.className = "bm-root";
    root.setAttribute("data-theme", CONFIG.defaultTheme);
    root.setAttribute(
      "data-contrast",
      CONFIG.defaultHighContrast ? "high" : "normal",
    );
    root.style.setProperty("--bm-font-scale", String(CONFIG.defaultFontScale));
    shadow.appendChild(root);
    return root;
  }
  function createUI(root) {
    var win = document.createElement("div");
    win.className = "bm-window";
    var titlebar = document.createElement("div");
    titlebar.className = "bm-titlebar";
    var leftmark = document.createElement("div");
    leftmark.className = "bm-leftmark";
    var title = document.createElement("div");
    title.className = "bm-title";
    title.textContent = "Header Navigator";
    var controls = document.createElement("div");
    controls.className = "bm-controls";
    var themeBtn = document.createElement("button");
    themeBtn.className = "bm-btn";
    themeBtn.type = "button";
    themeBtn.textContent = "Theme";
    var contrastBtn = document.createElement("button");
    contrastBtn.className = "bm-btn";
    contrastBtn.type = "button";
    contrastBtn.textContent = "Contrast";
    var refreshBtn = document.createElement("button");
    refreshBtn.className = "bm-btn";
    refreshBtn.type = "button";
    refreshBtn.textContent = "Rescan";
    var closeBtn = document.createElement("button");
    closeBtn.className = "bm-btn bm-btn-close";
    closeBtn.type = "button";
    closeBtn.textContent = "X";
    controls.appendChild(themeBtn);
    controls.appendChild(contrastBtn);
    controls.appendChild(refreshBtn);
    controls.appendChild(closeBtn);
    titlebar.appendChild(leftmark);
    titlebar.appendChild(title);
    titlebar.appendChild(controls);
    var content = document.createElement("div");
    content.className = "bm-content";
    var scroller = document.createElement("div");
    scroller.className = "bm-scroll";
    var footer = document.createElement("div");
    footer.className = "bm-footer";
    var opacityLabel = document.createElement("div");
    opacityLabel.className = "bm-small";
    opacityLabel.textContent = "Opacity";
    var opacity = document.createElement("input");
    opacity.className = "bm-slider";
    opacity.type = "range";
    opacity.min = "0.25";
    opacity.max = "1";
    opacity.step = "0.01";
    opacity.value = String(CONFIG.defaultOpacity);
    var fontLabel = document.createElement("div");
    fontLabel.className = "bm-small";
    fontLabel.textContent = "Font";
    var fontScale = document.createElement("input");
    fontScale.className = "bm-slider";
    fontScale.type = "range";
    fontScale.min = String(CONFIG.minFontScale);
    fontScale.max = String(CONFIG.maxFontScale);
    fontScale.step = "0.01";
    fontScale.value = String(CONFIG.defaultFontScale);
    var rightFoot = document.createElement("div");
    rightFoot.className = "bm-small";
    rightFoot.textContent = "";
    footer.appendChild(opacityLabel);
    footer.appendChild(opacity);
    footer.appendChild(fontLabel);
    footer.appendChild(fontScale);
    footer.appendChild(rightFoot);
    content.appendChild(scroller);
    content.appendChild(footer);
    var resize = document.createElement("div");
    resize.className = "bm-resize";
    win.appendChild(titlebar);
    win.appendChild(content);
    win.appendChild(resize);
    root.appendChild(win);
    return {
      root: root,
      win: win,
      titlebar: titlebar,
      title: title,
      scroller: scroller,
      themeBtn: themeBtn,
      contrastBtn: contrastBtn,
      refreshBtn: refreshBtn,
      closeBtn: closeBtn,
      opacity: opacity,
      fontScale: fontScale,
      footerRight: rightFoot,
      resize: resize,
    };
  }
  function renderEmpty(scroller, message) {
    scroller.innerHTML = "";
    var div = document.createElement("div");
    div.className = "bm-path";
    div.textContent = message;
    scroller.appendChild(div);
  }
  function renderPath(scroller, path) {
    if (!path.length) return;
    var box = document.createElement("div");
    box.className = "bm-path";
    for (var i = 0; i < path.length; i++) {
      var line = document.createElement("div");
      line.className = "bm-pathline";
      line.textContent = "H" + path[i].level + "  " + path[i].text;
      box.appendChild(line);
    }
    scroller.appendChild(box);
  }
  function renderSectionLabel(scroller, text) {
    var label = document.createElement("div");
    label.className = "bm-sectionlabel";
    label.textContent = text;
    scroller.appendChild(label);
  }
  function renderHeadingItem(scroller, heading, isCurrent, onClick) {
    var item = document.createElement("div");
    item.className = "bm-item" + (isCurrent ? " bm-current" : "");
    var level = document.createElement("div");
    level.className = "bm-level";
    level.textContent = "H" + heading.level;
    var text = document.createElement("div");
    text.className = "bm-text";
    text.textContent = heading.text;
    item.appendChild(level);
    item.appendChild(text);
    item.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      onClick(heading);
    });
    scroller.appendChild(item);
  }
  function setWindowOpacity(win, val) {
    win.style.opacity = String(clamp(val, 0.25, 1));
  }
  function setFontScale(root, val) {
    root.style.setProperty(
      "--bm-font-scale",
      String(clamp(val, CONFIG.minFontScale, CONFIG.maxFontScale)),
    );
  }
  function toggleTheme(root) {
    var current = root.getAttribute("data-theme") || "minuet";
    var next = current === "minuet" ? "glass" : "minuet";
    root.setAttribute("data-theme", next);
  }
  function toggleContrast(root) {
    var current = root.getAttribute("data-contrast") || "normal";
    var next = current === "high" ? "normal" : "high";
    root.setAttribute("data-contrast", next);
  }
  /* =========================     Drag and Resize     ========================= */
  function attachDrag(ui) {
    var dragging = false;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;
    function onDown(e) {
      if (e.button !== 0) return;
      var target = e.target;
      if (target && target.closest && target.closest(".bm-btn")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      var rect = ui.win.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      e.preventDefault();
      e.stopPropagation();
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      ui.win.style.left = startLeft + dx + "px";
      ui.win.style.top = startTop + dy + "px";
      e.preventDefault();
      e.stopPropagation();
    }
    function onUp() {
      dragging = false;
    }
    ui.titlebar.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
    return function detach() {
      ui.titlebar.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
    };
  }
  function attachResize(ui) {
    var resizing = false;
    var startX = 0;
    var startY = 0;
    var startW = 0;
    var startH = 0;
    function onDown(e) {
      if (e.button !== 0) return;
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      var rect = ui.win.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      e.preventDefault();
      e.stopPropagation();
    }
    function onMove(e) {
      if (!resizing) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      ui.win.style.width = clamp(startW + dx, 280, 820) + "px";
      ui.win.style.height = clamp(startH + dy, 190, 900) + "px";
      e.preventDefault();
      e.stopPropagation();
    }
    function onUp() {
      resizing = false;
    }
    ui.resize.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
    return function detach() {
      ui.resize.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("mouseup", onUp, true);
    };
  }
  /* =========================     Controller     ========================= */
  function createController(ui) {
    var headings = [];
    var disposed = false;
    function scan() {
      headings = collectHeadings();
      refreshHeadingPositions(headings);
      ui.footerRight.textContent = headings.length
        ? headings.length + " headings"
        : "No headings";
      return headings.length;
    }
    function updateView() {
      if (disposed) return;
      if (!headings.length) {
        renderEmpty(ui.scroller, "No headings found on this page.");
        return;
      }
      refreshHeadingPositions(headings);
      var scrollTop = computeScrollTop();
      var viewportMiddleAbs = scrollTop + window.innerHeight * 0.35;
      var idx = findNearestIndexAtScroll(headings, viewportMiddleAbs);
      var current = idx >= 0 ? headings[idx] : null;
      ui.scroller.innerHTML = "";
      if (!current) {
        renderEmpty(ui.scroller, "You are above the first heading.");
        var firstPath = buildContextPath(headings, 0);
        renderPath(ui.scroller, firstPath);
        renderSectionLabel(ui.scroller, "Next headings");
        var nextSlice = sliceClosest(headings, -1, 0, CONFIG.maxBelow);
        for (var i0 = 0; i0 < nextSlice.below.length; i0++) {
          renderHeadingItem(
            ui.scroller,
            nextSlice.below[i0],
            false,
            function (h) {
              scrollToElement(h.el);
            },
          );
        }
        return;
      }
      var path = buildContextPath(headings, idx);
      renderPath(ui.scroller, path);
      var slices = sliceClosest(
        headings,
        idx,
        CONFIG.maxAbove,
        CONFIG.maxBelow,
      );
      renderSectionLabel(ui.scroller, "Closest above");
      for (var i1 = 0; i1 < slices.above.length; i1++) {
        var h1 = slices.above[i1];
        renderHeadingItem(ui.scroller, h1, h1 === current, function (h) {
          scrollToElement(h.el);
        });
      }
      renderSectionLabel(ui.scroller, "Closest below");
      for (var i2 = 0; i2 < slices.below.length; i2++) {
        var h2 = slices.below[i2];
        renderHeadingItem(ui.scroller, h2, false, function (h) {
          scrollToElement(h.el);
        });
      }
    }
    var throttledUpdate = throttle(updateView, CONFIG.updateThrottleMs);
    function onScrollOrResize() {
      throttledUpdate();
    }
    function start() {
      scan();
      updateView();
      window.addEventListener("scroll", onScrollOrResize, { passive: true });
      window.addEventListener("resize", onScrollOrResize, { passive: true });
    }
    function stop() {
      disposed = true;
      window.removeEventListener("scroll", onScrollOrResize, { passive: true });
      window.removeEventListener("resize", onScrollOrResize, { passive: true });
    }
    function rescanAndUpdate() {
      scan();
      updateView();
    }
    return {
      start: start,
      stop: stop,
      update: updateView,
      rescan: rescanAndUpdate,
    };
  }
  /* =========================     Entry     ========================= */
  if (alreadyInjected()) {
    removeExisting();
    return;
  }
  var host = createHost();
  var shadow = createShadowRoot(host);
  shadow.appendChild(createStyles());
  var root = createRoot(shadow);
  var ui = createUI(root);
  setWindowOpacity(ui.win, CONFIG.defaultOpacity);
  setFontScale(ui.root, CONFIG.defaultFontScale);
  var detachDrag = attachDrag(ui);
  var detachResize = attachResize(ui);
  var controller = createController(ui);
  ui.opacity.addEventListener("input", function () {
    setWindowOpacity(ui.win, parseFloat(ui.opacity.value));
  });
  ui.fontScale.addEventListener("input", function () {
    setFontScale(ui.root, parseFloat(ui.fontScale.value));
  });
  ui.themeBtn.addEventListener("click", function () {
    toggleTheme(ui.root);
  });
  ui.contrastBtn.addEventListener("click", function () {
    toggleContrast(ui.root);
  });
  ui.refreshBtn.addEventListener("click", function () {
    controller.rescan();
  });
  ui.closeBtn.addEventListener("click", function () {
    controller.stop();
    detachDrag();
    detachResize();
    removeExisting();
  });
  controller.start();
}
