// ../../../../../../C:/Home/my-github/toys-awwtools-com/docs/public/2026-05-05-bookmarklet-article-like-ai-wrote-it/src/bookmarklet.js
function BookmarkletMain() {
  var NS = "asb";
  var STATE_KEY = "__AI_STREAM_BOOKMARKLET_STATE__";
  var STYLE_ID = "ai-stream-bookmarklet-styles";
  var SPEEDS = {
    relaxed: { burst: 2, burstMs: 60, punctMs: 240, paraMs: 500, headMs: 750 },
    standard: { burst: 4, burstMs: 28, punctMs: 110, paraMs: 220, headMs: 380 },
    fast: { burst: 9, burstMs: 11, punctMs: 38, paraMs: 75, headMs: 130 }
  };
  var SPEED_CYCLE = ["relaxed", "standard", "fast"];
  function getState() {
    return window[STATE_KEY] || null;
  }
  function setState(ctrl2) {
    window[STATE_KEY] = ctrl2;
  }
  function clearState() {
    delete window[STATE_KEY];
  }
  function injectStyles() {
    if (document.getElementById(STYLE_ID))
      return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = buildCSS();
    document.head.appendChild(s);
  }
  function removeStyles() {
    var el = document.getElementById(STYLE_ID);
    if (el)
      el.remove();
  }
  function buildCSS() {
    var n = NS;
    return [
      "." + n + "-surface{position:relative;box-sizing:border-box;border-radius:14px;padding:28px 32px;margin:0;border:1px solid rgba(128,128,128,.15);background:var(--" + n + "-bg,rgba(255,255,255,.97));color:var(--" + n + "-fg,inherit);box-shadow:0 4px 32px rgba(0,0,0,.1),0 1px 4px rgba(0,0,0,.06);font-family:inherit;min-height:60px}",
      "." + n + "-surface." + n + "-dark{--" + n + "-bg:rgba(18,18,24,.97);--" + n + "-fg:rgba(238,238,244,.95);border-color:rgba(255,255,255,.09);box-shadow:0 4px 32px rgba(0,0,0,.45),0 1px 6px rgba(0,0,0,.3)}",
      "." + n + "-block{margin:.85em 0;opacity:0;transition:opacity 130ms ease}",
      "." + n + "-block." + n + "-vis{opacity:1}",
      "." + n + "-block." + n + "-active{background:rgba(99,102,241,.04);border-radius:4px;padding:2px 6px;margin-left:-6px;margin-right:-6px}",
      "." + n + "-surface." + n + "-dark ." + n + "-block." + n + "-active{background:rgba(139,92,246,.08)}",
      "@keyframes " + n + "-tok{from{opacity:.12;filter:blur(1.5px)}to{opacity:1;filter:blur(0)}}",
      "." + n + "-tok{animation:" + n + "-tok 100ms ease both}",
      "." + n + "-cursor{display:inline-block;width:2px;height:1.1em;background:rgba(99,102,241,.85);border-radius:1px;vertical-align:text-bottom;margin-left:1px}",
      "@keyframes " + n + "-pulse{from{opacity:.6}to{opacity:1}}",
      "." + n + "-cursor." + n + "-anim{animation:" + n + "-pulse 850ms ease-in-out infinite alternate}",
      "." + n + "-surface." + n + "-dark ." + n + "-cursor{background:rgba(167,139,250,.9)}",
      "." + n + "-controls{position:absolute;top:10px;right:10px;display:flex;align-items:center;gap:5px;z-index:10;font-family:system-ui,-apple-system,sans-serif;font-size:12px;flex-wrap:wrap;max-width:92%;justify-content:flex-end}",
      "." + n + "-status{background:rgba(99,102,241,.1);color:rgba(79,70,229,.9);border-radius:99px;padding:3px 10px;font-weight:600;letter-spacing:.01em;white-space:nowrap}",
      "." + n + "-surface." + n + "-dark ." + n + "-status{background:rgba(139,92,246,.15);color:rgba(167,139,250,.95)}",
      "." + n + "-btn{background:rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.1);border-radius:6px;padding:3px 9px;cursor:pointer;font-size:12px;font-family:system-ui,-apple-system,sans-serif;color:inherit;white-space:nowrap;transition:background 100ms;line-height:1.5}",
      "." + n + "-btn:hover{background:rgba(0,0,0,.13)}",
      "." + n + "-surface." + n + "-dark ." + n + "-btn{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12)}",
      "." + n + "-surface." + n + "-dark ." + n + "-btn:hover{background:rgba(255,255,255,.16)}",
      "." + n + "-progress{position:absolute;top:0;left:0;right:0;height:2px;background:rgba(99,102,241,.1);border-radius:14px 14px 0 0;overflow:hidden}",
      "." + n + "-pbar{height:100%;background:linear-gradient(90deg,rgba(99,102,241,.55),rgba(139,92,246,.8));transition:width 200ms ease;border-radius:inherit}",
      "." + n + "-pill{position:fixed;bottom:18px;right:18px;z-index:2147483646;display:flex;align-items:center;gap:5px;background:rgba(18,18,24,.93);color:rgba(238,238,244,.95);border-radius:99px;padding:7px 14px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;box-shadow:0 4px 20px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.11);transition:opacity 200ms;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);pointer-events:auto}",
      "." + n + "-pill ." + n + "-btn{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.14);color:inherit}",
      "." + n + "-pill ." + n + "-btn:hover{background:rgba(255,255,255,.18)}",
      "." + n + "-pill ." + n + "-status{background:transparent;color:rgba(167,139,250,.95);padding:0 4px}",
      "." + n + "-msg{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2147483647;background:rgba(18,18,24,.93);color:rgba(238,238,244,.95);border-radius:10px;padding:11px 18px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);max-width:380px;text-align:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;gap:10px}",
      "." + n + "-msg-x{cursor:pointer;opacity:.55;font-size:16px;flex-shrink:0;padding:0 2px}",
      "." + n + "-msg-x:hover{opacity:1}",
      "blockquote." + n + "-block{border-left:3px solid rgba(99,102,241,.35);padding-left:16px;margin-left:0;font-style:italic}",
      "." + n + "-surface." + n + "-dark blockquote." + n + "-block{border-left-color:rgba(139,92,246,.45)}",
      "pre." + n + '-block{background:rgba(0,0,0,.05);border-radius:8px;padding:14px 16px;overflow-x:auto;font-size:.875em;line-height:1.55;font-family:ui-monospace,"Cascadia Code","Fira Code","Courier New",monospace;white-space:pre}',
      "." + n + "-surface." + n + "-dark pre." + n + "-block{background:rgba(255,255,255,.06)}",
      "figure." + n + "-block{margin:0}",
      "figure." + n + "-block img{max-width:100%;border-radius:6px;display:block}",
      "figure." + n + "-block figcaption{font-size:.85em;opacity:.7;margin-top:6px}",
      "." + n + "-surface table{border-collapse:collapse;width:100%;font-size:.9em}",
      "." + n + "-surface th,." + n + "-surface td{border:1px solid rgba(128,128,128,.25);padding:6px 10px;text-align:left}",
      "." + n + "-surface th{background:rgba(99,102,241,.06);font-weight:600}",
      "@media (prefers-reduced-motion:reduce){",
      "  ." + n + "-block{transition:none}",
      "  ." + n + "-tok{animation:none;opacity:1;filter:none}",
      "  ." + n + "-cursor." + n + "-anim{animation:none}",
      "}"
    ].join(`
`);
  }
  function sleep(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }
  function isReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  }
  function isDarkPage(el) {
    var node = el || document.body;
    while (node && node !== document.documentElement) {
      var bg = window.getComputedStyle(node).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        var m = bg.match(/[\d.]+/g);
        if (m && m.length >= 3) {
          return 0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2] < 100;
        }
      }
      node = node.parentElement;
    }
    var htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
    if (htmlBg && htmlBg !== "rgba(0, 0, 0, 0)" && htmlBg !== "transparent") {
      var m2 = htmlBg.match(/[\d.]+/g);
      if (m2 && m2.length >= 3) {
        return 0.2126 * +m2[0] + 0.7152 * +m2[1] + 0.0722 * +m2[2] < 100;
      }
    }
    return false;
  }
  function getVisibleText(el) {
    var text = "";
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var p = node.parentElement;
        if (!p)
          return NodeFilter.FILTER_REJECT;
        var cs = window.getComputedStyle(p);
        if (cs.display === "none" || cs.visibility === "hidden")
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) {
      text += walker.currentNode.nodeValue;
    }
    return text;
  }
  function getLinkDensity(el) {
    var total = getVisibleText(el).trim().length;
    if (!total)
      return 1;
    var linkLen = 0;
    el.querySelectorAll("a").forEach(function(a) {
      linkLen += a.textContent.trim().length;
    });
    return linkLen / total;
  }
  function escHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function scoreElement(el) {
    var score = 0;
    var tag = el.tagName.toLowerCase();
    var cls = ((el.className || "") + " " + (el.id || "")).toLowerCase();
    if (tag === "article")
      score += 35;
    else if (tag === "main")
      score += 28;
    if (el.getAttribute("role") === "main")
      score += 22;
    var good = /\b(article|post|entry|content|story|blog|prose|markdown|bodytext|main[\-_]?content|page[\-_]?content|text[\-_]?body|entry[\-_]?content)\b/;
    var bad = /\b(nav(igation)?|sidebar|footer|header|comment|related|promo|advert|widget|menu|share|social|cookie|banner|popup|modal|newsletter|toc|breadcrumb|subnav|toolbar)\b/;
    if (good.test(cls))
      score += 22;
    if (bad.test(cls))
      score -= 45;
    var paras = el.querySelectorAll("p");
    score += Math.min(paras.length * 3, 30);
    var txtLen = getVisibleText(el).trim().length;
    if (txtLen < 200)
      score -= 25;
    else if (txtLen > 2000)
      score += 22;
    else
      score += txtLen / 120;
    var ld = getLinkDensity(el);
    if (ld > 0.55)
      score -= 32;
    else if (ld > 0.35)
      score -= 14;
    if (el.querySelectorAll("h1,h2,h3").length > 0)
      score += 12;
    var rect = el.getBoundingClientRect();
    if (rect.width < 200 || rect.height < 80)
      score -= 30;
    return score;
  }
  function findArticleTarget() {
    var semanticCandidates = [];
    ["article", "main", '[role="main"]'].forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(el) {
        if (getVisibleText(el).trim().length > 300)
          semanticCandidates.push(el);
      });
    });
    if (semanticCandidates.length) {
      semanticCandidates.sort(function(a, b) {
        return scoreElement(b) - scoreElement(a);
      });
      if (scoreElement(semanticCandidates[0]) > 15)
        return semanticCandidates[0];
    }
    var candidates = [];
    var seen = new Set;
    document.querySelectorAll("div,section,article,main").forEach(function(el) {
      if (seen.has(el))
        return;
      seen.add(el);
      if (getVisibleText(el).trim().length > 200)
        candidates.push(el);
    });
    candidates.sort(function(a, b) {
      return scoreElement(b) - scoreElement(a);
    });
    for (var i = 0;i < candidates.length; i++) {
      var c = candidates[i];
      if (scoreElement(c) > 8 && getVisibleText(c).trim().length > 300)
        return c;
    }
    var best = null, bestLen = 0;
    document.querySelectorAll("div,section").forEach(function(el) {
      var len = getVisibleText(el).trim().length;
      var r = el.getBoundingClientRect();
      if (len > bestLen && r.width > 200 && r.height > 100) {
        bestLen = len;
        best = el;
      }
    });
    return best;
  }
  function buildContentModel(rootEl) {
    var blocks = [];
    function collect(node, depth) {
      if (depth > 28 || !node)
        return;
      if (node.nodeType !== Node.ELEMENT_NODE)
        return;
      var el = node;
      var tag = el.tagName.toLowerCase();
      var cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden")
        return;
      if (el.id === STYLE_ID || el.classList.contains(NS + "-controls") || el.classList.contains(NS + "-pill") || el.classList.contains(NS + "-msg"))
        return;
      if (/^h[1-6]$/.test(tag)) {
        var t = el.textContent.trim();
        if (t)
          blocks.push({ type: "heading", level: +tag[1], html: el.innerHTML, text: t });
        return;
      }
      if (tag === "p") {
        var t = el.textContent.trim();
        if (t)
          blocks.push({ type: "paragraph", html: el.innerHTML, text: t });
        return;
      }
      if (tag === "blockquote") {
        var t = el.textContent.trim();
        if (t)
          blocks.push({ type: "blockquote", html: el.innerHTML, text: t });
        return;
      }
      if (tag === "pre") {
        var codeEl = el.querySelector("code") || el;
        var t = codeEl.textContent;
        if (t.trim())
          blocks.push({ type: "code", text: t, lines: t.split(`
`) });
        return;
      }
      if (tag === "ul" || tag === "ol") {
        var items = [];
        el.querySelectorAll("li").forEach(function(li) {
          var t2 = li.textContent.trim();
          if (t2)
            items.push({ html: li.innerHTML, text: t2 });
        });
        if (items.length)
          blocks.push({ type: "list", listType: tag, items });
        return;
      }
      if (tag === "table") {
        var t = el.textContent.trim();
        if (t)
          blocks.push({ type: "table", outerHTML: el.outerHTML });
        return;
      }
      if (tag === "figure") {
        var img = el.querySelector("img");
        var cap = el.querySelector("figcaption");
        if (img && img.src) {
          blocks.push({
            type: "image",
            src: img.src,
            alt: img.alt || "",
            captionHtml: cap ? cap.innerHTML : "",
            captionText: cap ? cap.textContent.trim() : ""
          });
        } else {
          Array.from(el.childNodes).forEach(function(c) {
            collect(c, depth + 1);
          });
        }
        return;
      }
      if (tag === "img") {
        if (el.src && (el.naturalWidth > 100 || el.width > 100 || +el.getAttribute("width") > 100)) {
          blocks.push({ type: "image", src: el.src, alt: el.alt || "", captionHtml: "", captionText: "" });
        }
        return;
      }
      if (tag === "hr") {
        blocks.push({ type: "separator" });
        return;
      }
      Array.from(el.childNodes).forEach(function(c) {
        collect(c, depth + 1);
      });
    }
    Array.from(rootEl.childNodes).forEach(function(c) {
      collect(c, 0);
    });
    return blocks.filter(function(b) {
      if (b.type === "separator" || b.type === "table" || b.type === "image")
        return true;
      return b.text && b.text.length > 0;
    });
  }
  function tokenizeHTML(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    var INLINE = new Set([
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "del",
      "ins",
      "mark",
      "code",
      "kbd",
      "var",
      "time",
      "abbr",
      "cite",
      "small",
      "sub",
      "sup",
      "span",
      "a"
    ]);
    var chunks = [];
    function walk(node, stack) {
      if (node.nodeType === Node.TEXT_NODE) {
        var words = node.nodeValue.match(/\S+\s*/g);
        if (!words)
          return;
        words.forEach(function(word) {
          if (!word.trim())
            return;
          var content = escHtml(word);
          for (var i = stack.length - 1;i >= 0; i--) {
            content = stack[i].o + content + stack[i].c;
          }
          chunks.push(content);
        });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE)
        return;
      var tag = node.tagName.toLowerCase();
      if (tag === "br") {
        chunks.push("<br>");
        return;
      }
      if (tag === "img") {
        var src = node.getAttribute("src") || "", alt = node.getAttribute("alt") || "";
        if (src)
          chunks.push('<img src="' + escHtml(src) + '" alt="' + escHtml(alt) + '" style="max-height:1.1em;vertical-align:middle">');
        return;
      }
      if (INLINE.has(tag)) {
        var openTag = "<" + tag;
        for (var a = 0;a < node.attributes.length; a++) {
          openTag += " " + node.attributes[a].name + '="' + escHtml(node.attributes[a].value) + '"';
        }
        openTag += ">";
        stack.push({ o: openTag, c: "</" + tag + ">" });
        Array.from(node.childNodes).forEach(function(c) {
          walk(c, stack);
        });
        stack.pop();
        return;
      }
      Array.from(node.childNodes).forEach(function(c) {
        walk(c, stack);
      });
    }
    Array.from(tmp.childNodes).forEach(function(c) {
      walk(c, []);
    });
    return chunks;
  }
  function makeCursor() {
    var c = document.createElement("span");
    c.className = NS + "-cursor " + NS + "-anim";
    c.setAttribute("aria-hidden", "true");
    return c;
  }
  async function streamChunks(container, chunks, ctrl2, speedOverride) {
    var cursor = makeCursor();
    container.appendChild(cursor);
    var reduced = isReducedMotion();
    var i = 0;
    while (i < chunks.length) {
      if (ctrl2.done)
        break;
      while (ctrl2.paused && !ctrl2.done) {
        await sleep(50);
      }
      if (ctrl2.done)
        break;
      var sp = SPEEDS[speedOverride || ctrl2.speed] || SPEEDS.standard;
      var bSize = reduced ? Math.ceil(chunks.length / 4) : sp.burst + (Math.random() < 0.5 ? 1 : 0);
      var end = Math.min(i + bSize, chunks.length);
      if (cursor.parentNode)
        cursor.remove();
      for (var j = i;j < end; j++) {
        var span = document.createElement("span");
        if (!reduced)
          span.className = NS + "-tok";
        span.innerHTML = chunks[j];
        container.appendChild(span);
      }
      container.appendChild(cursor);
      i = end;
      var delay = reduced ? 0 : sp.burstMs;
      if (!reduced && i < chunks.length) {
        var plain = (chunks[i - 1] || "").replace(/<[^>]+>/g, "").trimEnd();
        if (/[.!?]$/.test(plain))
          delay = sp.punctMs;
        else if (/[,;:]$/.test(plain))
          delay = Math.round(sp.punctMs * 0.55);
      }
      if (delay > 0)
        await sleep(delay);
    }
    if (cursor.parentNode)
      cursor.remove();
  }
  async function streamCodeLines(codeEl, lines, ctrl2) {
    var cursor = makeCursor();
    codeEl.appendChild(cursor);
    var reduced = isReducedMotion();
    for (var i = 0;i < lines.length; i++) {
      if (ctrl2.done)
        break;
      while (ctrl2.paused && !ctrl2.done) {
        await sleep(50);
      }
      var sp = SPEEDS[ctrl2.speed] || SPEEDS.standard;
      if (cursor.parentNode)
        cursor.remove();
      var span = document.createElement("span");
      if (!reduced)
        span.className = NS + "-tok";
      span.textContent = lines[i] + (i < lines.length - 1 ? `
` : "");
      codeEl.appendChild(span);
      codeEl.appendChild(cursor);
      var delay = reduced ? 0 : Math.max(Math.round(sp.burstMs * 0.65), 10);
      if (delay > 0)
        await sleep(delay);
    }
    if (cursor.parentNode)
      cursor.remove();
  }
  function instantRender(container, blocks) {
    blocks.forEach(function(block) {
      var el = makeBlockElement(block);
      el.classList.add(NS + "-vis");
      fillBlockInstant(el, block);
      container.appendChild(el);
    });
  }
  function fillBlockInstant(el, block) {
    switch (block.type) {
      case "heading":
      case "paragraph":
      case "blockquote":
        el.innerHTML = block.html;
        break;
      case "code":
        (el.querySelector("code") || el).textContent = block.text;
        break;
      case "list":
        block.items.forEach(function(item) {
          var li = document.createElement("li");
          li.innerHTML = item.html;
          el.appendChild(li);
        });
        break;
      case "table":
        el.innerHTML = block.outerHTML;
        el.style.overflowX = "auto";
        el.style.display = "block";
        break;
      case "image":
        var img = document.createElement("img");
        img.src = block.src;
        img.alt = block.alt;
        img.style.maxWidth = "100%";
        el.appendChild(img);
        if (block.captionText) {
          var cap = document.createElement("figcaption");
          cap.innerHTML = block.captionHtml || escHtml(block.captionText);
          el.appendChild(cap);
        }
        break;
    }
  }
  function makeBlockElement(block) {
    var tag;
    switch (block.type) {
      case "heading":
        tag = "h" + block.level;
        break;
      case "paragraph":
        tag = "p";
        break;
      case "blockquote":
        tag = "blockquote";
        break;
      case "code":
        var pre = document.createElement("pre");
        pre.className = NS + "-block";
        var code = document.createElement("code");
        pre.appendChild(code);
        return pre;
      case "list":
        tag = block.listType;
        break;
      case "table":
        tag = "div";
        break;
      case "image":
        tag = "figure";
        break;
      case "separator":
        tag = "hr";
        break;
      default:
        tag = "div";
    }
    var el = document.createElement(tag);
    el.className = NS + "-block";
    return el;
  }
  async function animateBlocks(surface, blocks, ctrl2, pbar) {
    var total = blocks.length;
    var reduced = isReducedMotion();
    for (var bi = 0;bi < blocks.length; bi++) {
      if (ctrl2.done)
        return;
      var block = blocks[bi];
      var el = makeBlockElement(block);
      surface.appendChild(el);
      await sleep(12);
      el.classList.add(NS + "-vis");
      el.classList.add(NS + "-active");
      var sp = SPEEDS[ctrl2.speed] || SPEEDS.standard;
      if (block.type === "heading") {
        var chunks = tokenizeHTML(block.html);
        var hSpeed = ctrl2.speed === "relaxed" ? "standard" : "fast";
        await streamChunks(el, chunks, ctrl2, hSpeed);
        if (!ctrl2.done)
          await sleep(reduced ? 0 : sp.headMs);
      } else if (block.type === "paragraph") {
        var chunks = tokenizeHTML(block.html);
        await streamChunks(el, chunks, ctrl2, null);
        if (!ctrl2.done)
          await sleep(reduced ? 0 : sp.paraMs);
      } else if (block.type === "blockquote") {
        var chunks = tokenizeHTML(block.html);
        await streamChunks(el, chunks, ctrl2, "relaxed");
        if (!ctrl2.done)
          await sleep(reduced ? 0 : Math.round(sp.paraMs * 1.5));
      } else if (block.type === "code") {
        var codeEl = el.querySelector("code") || el;
        await streamCodeLines(codeEl, block.lines, ctrl2);
        if (!ctrl2.done)
          await sleep(reduced ? 0 : sp.burstMs * 2);
      } else if (block.type === "list") {
        for (var ii = 0;ii < block.items.length; ii++) {
          if (ctrl2.done)
            break;
          while (ctrl2.paused && !ctrl2.done) {
            await sleep(50);
          }
          var li = document.createElement("li");
          el.appendChild(li);
          var chunks = tokenizeHTML(block.items[ii].html);
          await streamChunks(li, chunks, ctrl2, null);
          if (!ctrl2.done)
            await sleep(reduced ? 0 : sp.burstMs);
        }
      } else if (block.type === "table") {
        el.innerHTML = block.outerHTML;
        el.style.overflowX = "auto";
        el.style.display = "block";
      } else if (block.type === "image") {
        var img = document.createElement("img");
        img.src = block.src;
        img.alt = block.alt;
        img.style.maxWidth = "100%";
        if (!reduced) {
          img.style.opacity = "0";
          img.style.transform = "scale(.987)";
          img.style.transition = "opacity 380ms ease,transform 380ms ease";
          setTimeout(function() {
            img.style.opacity = "1";
            img.style.transform = "scale(1)";
          }, 30);
        }
        el.appendChild(img);
        if (block.captionText) {
          if (!ctrl2.done)
            await sleep(reduced ? 0 : 200);
          var cap = document.createElement("figcaption");
          el.appendChild(cap);
          var capChunks = tokenizeHTML(block.captionHtml || escHtml(block.captionText));
          await streamChunks(cap, capChunks, ctrl2, null);
        }
      } else if (block.type === "separator") {}
      el.classList.remove(NS + "-active");
      if (pbar)
        pbar.style.width = (bi + 1) / total * 100 + "%";
    }
  }
  function buildControlPanel(surface, ctrl2) {
    var panel = document.createElement("div");
    panel.className = NS + "-controls";
    var statusEl = document.createElement("span");
    statusEl.className = NS + "-status";
    statusEl.textContent = "Streaming";
    var pauseBtn = document.createElement("button");
    pauseBtn.className = NS + "-btn";
    pauseBtn.textContent = "Pause";
    pauseBtn.onclick = function() {
      if (ctrl2.paused) {
        ctrl2.resume();
        pauseBtn.textContent = "Pause";
        statusEl.textContent = "Streaming";
        if (panel._pill) {
          panel._pill.pauseEl.textContent = "Pause";
          panel._pill.statusEl.textContent = "Streaming";
        }
      } else {
        ctrl2.pause();
        pauseBtn.textContent = "Resume";
        statusEl.textContent = "Paused";
        if (panel._pill) {
          panel._pill.pauseEl.textContent = "Resume";
          panel._pill.statusEl.textContent = "Paused";
        }
      }
    };
    var skipBtn = document.createElement("button");
    skipBtn.className = NS + "-btn";
    skipBtn.textContent = "Skip";
    skipBtn.onclick = function() {
      ctrl2.skip();
    };
    var speedIdx = 1;
    var speedBtn = document.createElement("button");
    speedBtn.className = NS + "-btn";
    speedBtn.textContent = "Speed: Standard";
    speedBtn.onclick = function() {
      speedIdx = (speedIdx + 1) % SPEED_CYCLE.length;
      var name = SPEED_CYCLE[speedIdx];
      ctrl2.setSpeed(name);
      speedBtn.textContent = "Speed: " + name[0].toUpperCase() + name.slice(1);
    };
    var restoreBtn = document.createElement("button");
    restoreBtn.className = NS + "-btn";
    restoreBtn.textContent = "Restore";
    restoreBtn.onclick = function() {
      ctrl2.restore();
    };
    panel.appendChild(statusEl);
    panel.appendChild(pauseBtn);
    panel.appendChild(skipBtn);
    panel.appendChild(speedBtn);
    panel.appendChild(restoreBtn);
    surface.appendChild(panel);
    panel.markComplete = function() {
      statusEl.textContent = "Complete";
      pauseBtn.remove();
      skipBtn.remove();
      var replayBtn = document.createElement("button");
      replayBtn.className = NS + "-btn";
      replayBtn.textContent = "Replay";
      replayBtn.onclick = function() {
        ctrl2.replay();
      };
      panel.insertBefore(replayBtn, restoreBtn);
      if (panel._pill) {
        panel._pill.statusEl.textContent = "Complete";
      }
    };
    return panel;
  }
  function buildFixedPill(ctrl2) {
    var pill = document.createElement("div");
    pill.className = NS + "-pill";
    pill.id = NS + "-pill";
    var statusEl = document.createElement("span");
    statusEl.className = NS + "-status";
    statusEl.textContent = "Streaming";
    var pauseEl = document.createElement("button");
    pauseEl.className = NS + "-btn";
    pauseEl.textContent = "Pause";
    pauseEl.onclick = function() {
      if (ctrl2.paused)
        ctrl2.resume();
      else
        ctrl2.pause();
    };
    var restoreEl = document.createElement("button");
    restoreEl.className = NS + "-btn";
    restoreEl.textContent = "Restore";
    restoreEl.onclick = function() {
      ctrl2.restore();
    };
    pill.appendChild(statusEl);
    pill.appendChild(pauseEl);
    pill.appendChild(restoreEl);
    document.body.appendChild(pill);
    pill.statusEl = statusEl;
    pill.pauseEl = pauseEl;
    pill.style.opacity = "0";
    pill.style.pointerEvents = "none";
    return pill;
  }
  function showToast(msg, autoDismissMs) {
    var div = document.createElement("div");
    div.className = NS + "-msg";
    var txt = document.createElement("span");
    txt.textContent = msg;
    var x = document.createElement("span");
    x.className = NS + "-msg-x";
    x.textContent = "✕";
    x.setAttribute("role", "button");
    x.setAttribute("aria-label", "Dismiss");
    x.onclick = function() {
      div.remove();
    };
    div.appendChild(txt);
    div.appendChild(x);
    document.body.appendChild(div);
    if (autoDismissMs) {
      setTimeout(function() {
        if (div.parentNode)
          div.remove();
      }, autoDismissMs);
    }
    return div;
  }
  function startExperience(targetEl2) {
    var originalHTML = targetEl2.innerHTML;
    var originalStyle = targetEl2.getAttribute("style") || null;
    var isDark = isDarkPage(targetEl2);
    var _paused = false;
    var _done = false;
    var _speed = "standard";
    var surface = null;
    var blocks = null;
    var panelEl = null;
    var pillEl = null;
    var ioRef = null;
    var ctrl2 = {
      get paused() {
        return _paused;
      },
      get done() {
        return _done;
      },
      get speed() {
        return _speed;
      },
      pause: function() {
        _paused = true;
      },
      resume: function() {
        _paused = false;
      },
      setSpeed: function(s) {
        if (SPEEDS[s])
          _speed = s;
      },
      skip: function() {
        _done = true;
        if (!surface || !blocks)
          return;
        var toRemove = [];
        Array.from(surface.childNodes).forEach(function(c) {
          if (c !== panelEl && !(c.classList && c.classList.contains(NS + "-progress")))
            toRemove.push(c);
        });
        toRemove.forEach(function(c) {
          c.remove();
        });
        instantRender(surface, blocks);
        if (panelEl)
          surface.appendChild(panelEl);
        var pbar = surface.querySelector("." + NS + "-pbar");
        if (pbar)
          pbar.style.width = "100%";
        panelEl && panelEl.markComplete && panelEl.markComplete();
        if (ioRef)
          ioRef.disconnect();
      },
      restore: function() {
        _done = true;
        if (ioRef)
          ioRef.disconnect();
        var pill = document.getElementById(NS + "-pill");
        if (pill)
          pill.remove();
        targetEl2.style.transition = "opacity 240ms ease";
        targetEl2.style.opacity = "0";
        setTimeout(function() {
          targetEl2.innerHTML = originalHTML;
          if (originalStyle !== null)
            targetEl2.setAttribute("style", originalStyle);
          else
            targetEl2.removeAttribute("style");
          targetEl2.style.opacity = "0";
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              targetEl2.style.transition = "opacity 380ms ease";
              targetEl2.style.opacity = "";
              setTimeout(function() {
                targetEl2.style.transition = "";
              }, 400);
            });
          });
        }, 225);
        removeStyles();
        clearState();
      },
      replay: function() {
        _done = true;
        if (ioRef)
          ioRef.disconnect();
        var pill = document.getElementById(NS + "-pill");
        if (pill)
          pill.remove();
        targetEl2.style.transition = "opacity 180ms ease";
        targetEl2.style.opacity = "0";
        setTimeout(function() {
          targetEl2.innerHTML = originalHTML;
          if (originalStyle !== null)
            targetEl2.setAttribute("style", originalStyle);
          else
            targetEl2.removeAttribute("style");
          targetEl2.style.opacity = "0";
          setTimeout(function() {
            var newCtrl = startExperience(targetEl2);
            if (newCtrl)
              setState(newCtrl);
          }, 60);
        }, 180);
      }
    };
    targetEl2.style.transition = "opacity 280ms ease,filter 280ms ease";
    targetEl2.style.opacity = "0.22";
    targetEl2.style.filter = "blur(3px)";
    setTimeout(function() {
      if (_done)
        return;
      blocks = buildContentModel(targetEl2);
      if (!blocks.length) {
        targetEl2.style.opacity = "";
        targetEl2.style.filter = "";
        targetEl2.style.transition = "";
        showToast("Could not identify readable content on this page.", 5500);
        clearState();
        return;
      }
      targetEl2.innerHTML = "";
      targetEl2.style.opacity = "";
      targetEl2.style.filter = "";
      targetEl2.style.transition = "";
      surface = document.createElement("div");
      surface.className = NS + "-surface";
      if (isDark)
        surface.classList.add(NS + "-dark");
      targetEl2.appendChild(surface);
      var progressEl = document.createElement("div");
      progressEl.className = NS + "-progress";
      var pbar = document.createElement("div");
      pbar.className = NS + "-pbar";
      pbar.style.width = "0%";
      progressEl.appendChild(pbar);
      surface.appendChild(progressEl);
      panelEl = buildControlPanel(surface, ctrl2);
      pillEl = buildFixedPill(ctrl2);
      panelEl._pill = pillEl;
      ioRef = new IntersectionObserver(function(entries) {
        var vis = entries[0].isIntersecting;
        pillEl.style.opacity = vis ? "0" : "1";
        pillEl.style.pointerEvents = vis ? "none" : "auto";
      }, { threshold: 0.15 });
      ioRef.observe(surface);
      surface.setAttribute("aria-live", "polite");
      surface.setAttribute("aria-label", "Article replay started");
      animateBlocks(surface, blocks, ctrl2, pbar).then(function() {
        if (_done)
          return;
        pbar.style.width = "100%";
        panelEl.markComplete && panelEl.markComplete();
        surface.setAttribute("aria-label", "Article replay complete");
        if (ioRef)
          ioRef.disconnect();
      }).catch(function(err) {
        console.warn("[AI Stream Bookmarklet]", err);
      });
    }, 330);
    return ctrl2;
  }
  injectStyles();
  var existing = getState();
  if (existing) {
    existing.restore();
    return;
  }
  var targetEl = findArticleTarget();
  if (!targetEl) {
    showToast("Could not identify a main article on this page. Try on an article, blog post, or documentation page.", 6500);
    return;
  }
  var ctrl = startExperience(targetEl);
  if (ctrl)
    setState(ctrl);
}
window.BookmarkletMain = BookmarkletMain;
