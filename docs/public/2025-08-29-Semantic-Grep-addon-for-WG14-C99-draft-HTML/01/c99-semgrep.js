/*
  Semantic Grep for large HTML specs (vanilla JS)
  - Adds a floating search bar and filters the page to matching blocks
  - Minimal intrusion: a single script tag in the HTML
  - Reusable: configurable selectors and behaviors via window.SemGrepDocsConfig
*/
(function () {
  'use strict';

  // Config with safe defaults; can be overridden via window.SemGrepDocsConfig
  var CFG = Object.assign({
    headingSelector: 'h1,h2,h3,h4,h5,h6',
    blockSelector: 'p,pre,dl,table,ol,ul',
    excludeSelector: '', // e.g. '.toc, nav'
    debounceMs: 200,
    cacheSize: 32,
    contextRadius: 0, // number of neighboring blocks to include for context
    // Snippet mode: trims matched blocks to soft-sized windows around matches
    snippet: {
      enabled: true,
      maxChars: 700,     // total visible per block (soft)
      leadChars: 220,    // before first match
      trailChars: 220,   // after last match
      sentencePunct: '.!?', // sentence boundary hints
      applyOnOnlyMatches: true // apply when Only matches is on
    },
    ui: {
      placeholder: 'Search C99...',
      label: 'Semantic grep',
      onlyMatchesLabel: 'Only matches',
      clearLabel: 'Clear',
      helpLabel: 'Help'
    },
    ids: {
      root: 'sg-root',
      style: 'sg-style',
      input: 'sg-q',
      only: 'sg-only',
      clear: 'sg-clear',
      counter: 'sg-counter',
      helpBtn: 'sg-help-btn',
      help: 'sg-help'
    },
    classes: {
      hidden: 'sg-hidden',
      only: 'sg-only',
      mark: 'sg-mark',
      block: 'sg-block',
      hasMatch: 'sg-has-match',
      trim: 'sg-trim'
    }
  }, window.SemGrepDocsConfig || {});

  // State
  var SG = {
    ready: false,
    onlyMatches: true,
    blocks: [], // Element[]
    blockToSection: [], // number[]
    headings: [], // Element[] by section id
    sectionToBlocks: new Map(), // secId -> number[] block indices
    index: new Map(), // token -> number[] block indices
    textCache: [], // normalized text per block
    tokensCache: [], // token arrays per block (normalized)
    queryCache: new Map(), // LRU cache: key -> result indices
    lastHighlighted: new Set(),
    lastOutlined: new Set(),
    lastTrimmed: new Set() // block ids currently trimmed to snippet
  };

  // Utilities
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function debounce(fn, ms) {
    var t = 0;
    return function () {
      clearTimeout(t);
      var args = arguments, ctx = this;
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  // Diacritics folding + ASCII-ish normalization
  function normalizeText(s) {
    try {
      s = s.normalize('NFD'); // split accents
    } catch (e) { /* older browsers may not support */ }
    s = s.replace(/[\u0300-\u036f]/g, ''); // remove diacritics
    // map fancy quotes/dashes to ascii
    s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, '-');
    // collapse whitespace, lower
    s = s.replace(/\s+/g, ' ').trim().toLowerCase();
    return s;
  }

  function tokenize(s) {
    // Keep word-ish tokens including underscore and digits
    var m = s.match(/[a-z0-9_]+/g);
    return m ? m : [];
  }

  function lruGet(map, key) {
    if (!map.has(key)) return undefined;
    var val = map.get(key);
    map.delete(key); // refresh
    map.set(key, val);
    return val;
  }
  function lruSet(map, key, val, max) {
    if (map.has(key)) map.delete(key);
    map.set(key, val);
    while (map.size > max) {
      var firstKey = map.keys().next().value;
      map.delete(firstKey);
    }
  }

  // DOM injection
  function injectCSS() {
    if (document.getElementById(CFG.ids.style)) return;
    var css = '' +
      // color variables
      ':root{' +
        '--sg-mark-bg: rgba(255, 229, 100, 0.30);' +
        '--sg-mark-border: rgba(160, 140, 0, 0.35);' +
        '--sg-block-outline: rgba(0,0,0,0.20);' +
      '}' +
      '@media (prefers-color-scheme: dark){:root{' +
        '--sg-mark-bg: rgba(255, 210, 70, 0.22);' +
        '--sg-mark-border: rgba(255, 235, 150, 0.40);' +
        '--sg-block-outline: rgba(255,255,255,0.25);' +
      '}}' +
      '#' + CFG.ids.root + '{position:fixed;top:0;left:0;right:0;z-index:9999;' +
        'font:14px system-ui,Segoe UI,Arial,sans-serif;background:#fff;border-bottom:1px solid #ddd}' +
      '.' + 'sg-wrap' + '{max-width:1200px;margin:0 auto;padding:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
      '.' + 'sg-input' + '{flex:1 1 420px;min-width:260px;padding:6px 8px;border:1px solid #bbb;border-radius:4px}' +
      '.' + 'sg-btn' + '{padding:6px 10px;border:1px solid #bbb;border-radius:4px;background:#f7f7f7;cursor:pointer}' +
      '.' + 'sg-btn[aria-pressed="true"]' + '{background:#e8f3ff;border-color:#7fb1ff}' +
      '.' + 'sg-counter' + '{margin-left:auto;opacity:.7}' +
      '.' + CFG.classes.hidden + '{display:none !important}' +
      '.' + CFG.classes.mark + '{background:var(--sg-mark-bg);box-shadow:inset 0 0 0 1px var(--sg-mark-border);border-radius:3px}' +
      '.' + CFG.classes.block + '.' + CFG.classes.hasMatch + '{outline:1px solid var(--sg-block-outline);outline-offset:2px;border-radius:4px}' +
      '.' + CFG.classes.trim + '{display:none !important}' +
      '.' + 'sg-help' + '{position:fixed;top:48px;right:16px;max-width:360px;background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px 12px;box-shadow:0 6px 24px rgba(0,0,0,.12);display:none}' +
      '.' + 'sg-help.show' + '{display:block}' +
      // Keep anchors/headers from hiding behind the fixed bar
      CFG.headingSelector.split(',').map(function (h) { return h + '{scroll-margin-top:56px}'; }).join('') +
      '';
    var style = document.createElement('style');
    style.id = CFG.ids.style;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function injectBar() {
    if (document.getElementById(CFG.ids.root)) return;
    var root = document.createElement('div');
    root.id = CFG.ids.root;
    var wrap = document.createElement('div');
    wrap.className = 'sg-wrap';
    wrap.innerHTML = '' +
      '<input id="' + CFG.ids.input + '" class="sg-input" type="search" ' +
      ' placeholder="' + CFG.ui.placeholder + '" aria-label="' + CFG.ui.label + '" />' +
      '<button id="' + CFG.ids.only + '" class="sg-btn" aria-pressed="true" title="Toggle only matches">' + CFG.ui.onlyMatchesLabel + '</button>' +
      '<button id="' + CFG.ids.clear + '" class="sg-btn">' + CFG.ui.clearLabel + '</button>' +
      '<button id="' + CFG.ids.helpBtn + '" class="sg-btn" aria-haspopup="dialog" aria-controls="' + CFG.ids.help + '">?' + '</button>' +
      '<span id="' + CFG.ids.counter + '" class="sg-counter"></span>';
    root.appendChild(wrap);

    var help = document.createElement('div');
    help.id = CFG.ids.help;
    help.className = 'sg-help';
    help.innerHTML = '' +
      '<strong>Semantic Grep</strong><br/>' +
      'Shortcuts: <code>/</code> focus, <code>Esc</code> clear.<br/>' +
      'Query: AND terms, quoted phrases, wildcards <code>term*</code>, <code>*term</code>, <code>*term*</code>.';
    root.appendChild(help);

    document.body.appendChild(root);
    requestAnimationFrame(function () {
      var h = root.getBoundingClientRect().height;
      document.body.style.paddingTop = Math.ceil(h) + 'px';
    });
  }

  function buildCollections() {
    var exclude = CFG.excludeSelector ? new Set($all(CFG.excludeSelector)) : new Set();
    var headingSet = new Set(CFG.headingSelector.split(',').map(function (t) { return t.trim().toUpperCase(); }));
    var blockSet = new Set(CFG.blockSelector.split(',').map(function (t) { return t.trim().toUpperCase(); }));

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
    var secId = -1;
    var sectionStart = -1;
    var node;

    SG.blocks = [];
    SG.blockToSection = [];
    SG.headings = [];
    SG.sectionToBlocks = new Map();

    while ((node = walker.nextNode())) {
      if (exclude.has(node)) continue;
      var tag = node.tagName;
      if (headingSet.has(tag)) {
        secId = SG.headings.length;
        SG.headings.push(node);
        sectionStart = SG.blocks.length;
      } else if (blockSet.has(tag)) {
        node.classList.add(CFG.classes.block); // stable class for styling/outline
        SG.blocks.push(node);
        SG.blockToSection.push(secId);
        if (secId >= 0) {
          if (!SG.sectionToBlocks.has(secId)) SG.sectionToBlocks.set(secId, []);
          SG.sectionToBlocks.get(secId).push(SG.blocks.length - 1);
        }
      }
    }
  }

  function buildIndex(done) {
    SG.index = new Map();
    SG.textCache = new Array(SG.blocks.length);
    SG.tokensCache = new Array(SG.blocks.length);

    var i = 0;
    function step(deadline) {
      var start = i;
      // Process in chunks to keep UI responsive
      while (i < SG.blocks.length && (!deadline || deadline.timeRemaining() > 8)) {
        var t = normalizeText(SG.blocks[i].textContent || '');
        SG.textCache[i] = t;
        var toks = tokenize(t);
        SG.tokensCache[i] = toks;
        var seen = new Set();
        for (var k = 0; k < toks.length; k++) {
          var tok = toks[k];
          if (seen.has(tok)) continue;
          seen.add(tok);
          var arr = SG.index.get(tok);
          if (!arr) SG.index.set(tok, arr = []);
          arr.push(i);
        }
        i++;
      }
      if (i < SG.blocks.length) {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(step);
        } else {
          setTimeout(step, 16);
        }
      } else {
        SG.ready = true;
        if (done) done();
      }
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(step);
    } else {
      setTimeout(step, 0);
    }
  }

  function parseQuery(raw) {
    var q = String(raw || '').trim();
    if (!q) return { raw: '', tokens: [], phrases: [], wildcards: [], norm: '' };
    var phrases = [];
    q = q.replace(/"([^"]+)"/g, function (_, ph) { phrases.push(normalizeText(ph)); return ' '; });
    var parts = q.split(/\s+/).filter(Boolean);
    var tokens = [];
    var wildcards = [];
    parts.forEach(function (p) {
      if (!p) return;
      var isPrefix = /\*$/.test(p) && !/^\*/.test(p);
      var isSuffix = /^\*/.test(p) && !/\*$/.test(p);
      var isContains = /^\*.\*$/.test(p) || (/^\*/.test(p) && /\*$/.test(p));
      var core = p.replace(/^\*/, '').replace(/\*$/, '');
      core = normalizeText(core);
      if (isPrefix || isSuffix || isContains) {
        wildcards.push({ type: isContains ? 'contains' : (isPrefix ? 'prefix' : 'suffix'), val: core });
      } else {
        tokens.push(core);
      }
    });
    var norm = (tokens.join(' ') + ' | ' + phrases.join(' ')) + (wildcards.length ? ' | *' : '');
    return { raw: raw, tokens: tokens, phrases: phrases, wildcards: wildcards, norm: norm };
  }

  function intersect(a, bSet) {
    var out = [];
    for (var i = 0; i < a.length; i++) if (bSet.has(a[i])) out.push(a[i]);
    return out;
  }

  function uniqueSorted(ids) {
    ids.sort(function (x, y) { return x - y; });
    var out = []; var prev = -1;
    for (var i = 0; i < ids.length; i++) { var v = ids[i]; if (v !== prev) out.push(v); prev = v; }
    return out;
  }

  function runQuery(qObj) {
    if (!SG.ready) return [];
    var cacheKey = JSON.stringify({ q: qObj.norm, w: qObj.wildcards, m: SG.onlyMatches });
    var cached = lruGet(SG.queryCache, cacheKey);
    if (cached) return cached.slice();

    var candidate = null; // array of ids
    if (qObj.tokens.length) {
      qObj.tokens.forEach(function (tok, idx) {
        var list = SG.index.get(tok) || [];
        if (idx === 0) candidate = list.slice();
        else {
          var bset = new Set(list);
          candidate = intersect(candidate, bset);
        }
      });
    } else {
      // start from all blocks if no indexed tokens
      candidate = SG.textCache.map(function (_, i) { return i; });
    }

    // Phrase filtering
    if (qObj.phrases.length) {
      candidate = candidate.filter(function (id) {
        var text = SG.textCache[id];
        for (var j = 0; j < qObj.phrases.length; j++) {
          if (text.indexOf(qObj.phrases[j]) === -1) return false;
        }
        return true;
      });
    }

    // Wildcards filtering using tokensCache for precision
    if (qObj.wildcards.length) {
      candidate = candidate.filter(function (id) {
        var toks = SG.tokensCache[id];
        for (var j = 0; j < qObj.wildcards.length; j++) {
          var wc = qObj.wildcards[j];
          var ok = false;
          for (var k = 0; k < toks.length; k++) {
            var t = toks[k];
            if (wc.type === 'prefix' && t.indexOf(wc.val) === 0) { ok = true; break; }
            if (wc.type === 'suffix' && t.lastIndexOf(wc.val) === t.length - wc.val.length) { ok = true; break; }
            if (wc.type === 'contains' && t.indexOf(wc.val) !== -1) { ok = true; break; }
          }
          if (!ok) return false;
        }
        return true;
      });
    }

    // Context escalation: include neighboring blocks within same section
    if (CFG.contextRadius > 0 && candidate.length) {
      var more = new Set(candidate);
      candidate.forEach(function (id) {
        var sec = SG.blockToSection[id];
        var arr = SG.sectionToBlocks.get(sec) || [];
        var pos = arr.indexOf(id);
        if (pos !== -1) {
          for (var r = 1; r <= CFG.contextRadius; r++) {
            if (arr[pos - r] != null) more.add(arr[pos - r]);
            if (arr[pos + r] != null) more.add(arr[pos + r]);
          }
        }
      });
      candidate = Array.from(more);
    }

    candidate = uniqueSorted(candidate);
    lruSet(SG.queryCache, cacheKey, candidate, CFG.cacheSize);
    return candidate;
  }

  function updateCounter(shown, total) {
    var el = document.getElementById(CFG.ids.counter);
    if (el) el.textContent = String(shown) + ' blocks shown of ' + String(total);
  }

  function toggleVisibility(visibleIds) {
    var total = SG.blocks.length;
    if (!SG.onlyMatches) {
      // show all
      for (var i = 0; i < total; i++) SG.blocks[i].classList.remove(CFG.classes.hidden);
      // show headings
      for (var h = 0; h < SG.headings.length; h++) SG.headings[h].classList.remove(CFG.classes.hidden);
      updateCounter(total, total);
      return;
    }
    var vis = new Uint8Array(total);
    for (var k = 0; k < visibleIds.length; k++) vis[visibleIds[k]] = 1;
    var shown = 0;
    for (var i = 0; i < total; i++) {
      var on = !!vis[i];
      if (on) { shown++; SG.blocks[i].classList.remove(CFG.classes.hidden); }
      else SG.blocks[i].classList.add(CFG.classes.hidden);
    }
    // Toggle headings based on section visibility
    for (var s = 0; s < SG.headings.length; s++) {
      var arr = SG.sectionToBlocks.get(s) || [];
      var any = false;
      for (var j = 0; j < arr.length; j++) { if (vis[arr[j]]) { any = true; break; } }
      var head = SG.headings[s];
      if (!head) continue;
      if (any) head.classList.remove(CFG.classes.hidden);
      else head.classList.add(CFG.classes.hidden);
    }
    updateCounter(shown, total);
  }

  function clearHighlightsIn(ids) {
    // Clear marks only within given block ids
    for (var i = 0; i < ids.length; i++) {
      var el = SG.blocks[ids[i]];
      if (!el) continue;
      var marks = el.querySelectorAll('.' + CFG.classes.mark);
      for (var j = 0; j < marks.length; j++) {
        var m = marks[j];
        var parent = m.parentNode;
        if (!parent) continue;
        while (m.firstChild) parent.insertBefore(m.firstChild, m);
        parent.removeChild(m);
      }
      if (el.normalize) el.normalize();
    }
  }

  function clearAllHighlights() {
    // Use last known highlighted set for efficiency; fallback to full document if empty
    var ids = Array.from(SG.lastHighlighted);
    if (!ids.length) {
      var marks = $all('.' + CFG.classes.mark);
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        var p = m.parentNode; if (!p) continue;
        while (m.firstChild) p.insertBefore(m.firstChild, m);
        p.removeChild(m);
        if (p.normalize) p.normalize();
      }
    } else {
      clearHighlightsIn(ids);
    }
    SG.lastHighlighted.clear();
  }

  function updateBlockOutlines(matchedIds) {
    // Toggle sg-has-match using set diff
    var next = new Set(matchedIds);
    // Remove from previous not in next
    SG.lastOutlined.forEach(function (id) {
      if (!next.has(id)) {
        var el = SG.blocks[id]; if (el) el.classList.remove(CFG.classes.hasMatch);
      }
    });
    // Add for new ones
    next.forEach(function (id) {
      var el = SG.blocks[id]; if (el) el.classList.add(CFG.classes.hasMatch);
    });
    SG.lastOutlined = next;
  }

  // --- Snippet trimming (sentence-friendly soft windows) ---
  function collectTextNodesUnder(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var out = []; var n;
    while ((n = w.nextNode())) { out.push(n); }
    return out;
  }

  function nearestLeftBoundary(text, idx) {
    // move left to whitespace or punctuation boundary; prefer sentence punctuation
    var i = Math.max(0, Math.min(idx, text.length));
    var punct = CFG.snippet.sentencePunct;
    for (var k = i; k > 0; k--) {
      var c = text[k - 1];
      if (punct.indexOf(c) !== -1) return k; // just after punctuation
      if (/\s/.test(c)) return k;
    }
    return 0;
  }
  function nearestRightBoundary(text, idx) {
    var i = Math.max(0, Math.min(idx, text.length));
    var punct = CFG.snippet.sentencePunct;
    for (var k = i; k < text.length; k++) {
      var c = text[k];
      if (punct.indexOf(c) !== -1) return k + 1; // just after punctuation
      if (/\s/.test(c)) return k;
    }
    return text.length;
  }

  function computeWindowForText(text, qObj) {
    // Reuse highlight collector to get match ranges within a simple string
    var lower = text.toLowerCase();
    var fakeQ = { tokens: qObj.tokens, phrases: qObj.phrases, wildcards: qObj.wildcards };
    // local function must mirror collectRangesForText used in highlighting
    function isWordChar(c) { return !!c && /[A-Za-z0-9_]/.test(c); }
    function rangesFor(lowerStr) {
      var ranges = [];
      function add(a,b){ if(a<b) ranges.push([a,b]); }
      // tokens
      for (var ti=0; ti<fakeQ.tokens.length; ti++){
        var tok = fakeQ.tokens[ti]; var pos=0, idx;
        while((idx=lowerStr.indexOf(tok,pos))!==-1){
          var before = lowerStr[idx-1], after = lowerStr[idx+tok.length];
          if(!isWordChar(before)&&!isWordChar(after)) add(idx, idx+tok.length);
          pos = idx + tok.length;
        }
      }
      // phrases
      for (var pi=0; pi<fakeQ.phrases.length; pi++){
        var ph=fakeQ.phrases[pi]; var p=0, j;
        while((j=lowerStr.indexOf(ph,p))!==-1){ add(j, j+ph.length); p=j+ph.length; }
      }
      // wildcards
      for (var wi=0; wi<fakeQ.wildcards.length; wi++){
        var wc=fakeQ.wildcards[wi]; var w=wc.val; var p2=0, k;
        while((k=lowerStr.indexOf(w,p2))!==-1){
          if (wc.type==='prefix'){
            var b = lowerStr[k-1]; if(!isWordChar(b)){ var e=k+w.length; while(e<lowerStr.length&&isWordChar(lowerStr[e])) e++; add(k,e);} }
          else if (wc.type==='suffix'){
            var a = lowerStr[k+w.length]; if(!isWordChar(a)){ var s=k; while(s>0&&isWordChar(lowerStr[s-1])) s--; add(s,k+w.length);} }
          else add(k,k+w.length);
          p2 = k+1;
        }
      }
      ranges.sort(function(a,b){return a[0]-b[0];});
      var merged=[]; for(var i=0;i<ranges.length;i++){ var r=ranges[i]; if(!merged.length||r[0]>merged[merged.length-1][1]) merged.push(r); else merged[merged.length-1][1]=Math.max(merged[merged.length-1][1], r[1]); }
      return merged;
    }
    var ranges = rangesFor(lower);
    if (!ranges.length) return null;
    var first = ranges[0][0];
    var last = ranges[ranges.length-1][1];
    var lead = CFG.snippet.leadChars, trail = CFG.snippet.trailChars, maxLen = CFG.snippet.maxChars;
    var start = Math.max(0, first - lead);
    var end = Math.min(text.length, last + trail);
    // adjust to sentence/word boundaries
    start = nearestLeftBoundary(text, start);
    end = nearestRightBoundary(text, end);
    // enforce max
    if (end - start > maxLen) {
      var need = end - start - maxLen;
      // shave half from both sides at whitespace boundaries
      var shaveL = Math.floor(need/2), shaveR = need - shaveL;
      start = nearestRightBoundary(text, start + shaveL);
      end = nearestLeftBoundary(text, end - shaveR);
    }
    if (start < 0) start = 0; if (end > text.length) end = text.length; if (start >= end) return null;
    return { start: start, end: end };
  }

  function clearTrimmingIn(ids) {
    for (var i = 0; i < ids.length; i++) {
      var el = SG.blocks[ids[i]]; if (!el) continue;
      // unwrap sg-trim spans under this element
      var trims = el.querySelectorAll('.' + CFG.classes.trim);
      for (var j = 0; j < trims.length; j++) {
        var t = trims[j]; var p = t.parentNode; if (!p) continue;
        while (t.firstChild) p.insertBefore(t.firstChild, t);
        p.removeChild(t);
        if (p.normalize) p.normalize();
      }
    }
  }
  function clearAllTrimming() {
    if (!SG.lastTrimmed.size) return;
    clearTrimmingIn(Array.from(SG.lastTrimmed));
    SG.lastTrimmed.clear();
  }

  function applySnippetsForMatched(matchedIds, qObj) {
    // Trim only paragraph-like blocks for safety
    var cap = Math.min(matchedIds.length, 600);
    var newTrimmed = new Set();
    for (var i = 0; i < cap; i++) {
      var id = matchedIds[i];
      var el = SG.blocks[id]; if (!el) continue;
      var tag = el.tagName.toUpperCase();
      if (tag !== 'P') { // restore if previously trimmed
        if (SG.lastTrimmed.has(id)) clearTrimmingIn([id]);
        continue;
      }
      var text = el.textContent || '';
      var win = computeWindowForText(text, qObj);
      if (!win) { if (SG.lastTrimmed.has(id)) clearTrimmingIn([id]); continue; }

      // If window covers whole text, ensure no trimming remains
      if (win.start <= 0 && win.end >= text.length) { if (SG.lastTrimmed.has(id)) clearTrimmingIn([id]); continue; }

      // Apply trimming by wrapping outside window segments with sg-trim spans
      // Walk text nodes and split as needed
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var pos = 0, n;
      while ((n = walker.nextNode())) {
        var s = n.nodeValue || ''; var len = s.length;
        var nodeStart = pos; var nodeEnd = pos + len;
        var keepA = Math.max(win.start, nodeStart);
        var keepB = Math.min(win.end, nodeEnd);
        if (keepA <= keepB) {
          // Left trim
          if (keepA > nodeStart) {
            var leftLen = keepA - nodeStart;
            var leftText = s.slice(0, leftLen);
            var leftNode = document.createTextNode(leftText);
            var wrapL = document.createElement('span'); wrapL.className = CFG.classes.trim; wrapL.appendChild(leftNode);
            n.parentNode.insertBefore(wrapL, n);
            s = s.slice(leftLen); len = s.length; n.nodeValue = s; nodeStart = keepA; // update
          }
          // Right trim
          if (keepB < nodeEnd) {
            var rightIndex = keepB - nodeStart; // in current node string
            var rightText = s.slice(rightIndex);
            var rightNode = document.createTextNode(rightText);
            var wrapR = document.createElement('span'); wrapR.className = CFG.classes.trim; wrapR.appendChild(rightNode);
            if (n.nextSibling) n.parentNode.insertBefore(wrapR, n.nextSibling);
            else n.parentNode.appendChild(wrapR);
            n.nodeValue = s.slice(0, rightIndex);
          }
        } else {
          // Entire node outside window -> wrap whole
          var wrap = document.createElement('span'); wrap.className = CFG.classes.trim;
          n.parentNode.insertBefore(wrap, n);
          wrap.appendChild(n);
        }
        pos += len;
      }
      newTrimmed.add(id);
    }

    // Remove trims for blocks no longer matched
    SG.lastTrimmed.forEach(function (id) { if (!newTrimmed.has(id)) clearTrimmingIn([id]); });
    SG.lastTrimmed = newTrimmed;
  }

  function applyHighlightsForMatched(matchedIds, qObj) {
    // Clear prior highlights in changed region only
    var union = new Set(matchedIds);
    SG.lastHighlighted.forEach(function (id) { union.add(id); });
    clearHighlightsIn(Array.from(union));

    if (!qObj.tokens.length && !qObj.phrases.length && !qObj.wildcards.length) { SG.lastHighlighted = new Set(); return; }

    var cap = Math.min(matchedIds.length, 600);
    var className = CFG.classes.mark;

    function isWordChar(c) { return !!c && /[A-Za-z0-9_]/.test(c); }

    function collectRangesForText(text, q) {
      var lower = text.toLowerCase();
      var ranges = [];

      function add(a, b) { if (a < b) ranges.push([a, b]); }

      // tokens (word-boundary matches)
      for (var ti = 0; ti < q.tokens.length; ti++) {
        var tok = q.tokens[ti];
        var pos = 0; var idx;
        while ((idx = lower.indexOf(tok, pos)) !== -1) {
          var before = lower[idx - 1];
          var after = lower[idx + tok.length];
          if (!isWordChar(before) && !isWordChar(after)) add(idx, idx + tok.length);
          pos = idx + tok.length;
        }
      }

      // phrases (substring)
      for (var pi = 0; pi < q.phrases.length; pi++) {
        var ph = q.phrases[pi];
        var ppos = 0; var pidx;
        while ((pidx = lower.indexOf(ph, ppos)) !== -1) {
          add(pidx, pidx + ph.length);
          ppos = pidx + ph.length;
        }
      }

      // wildcards
      for (var wi = 0; wi < q.wildcards.length; wi++) {
        var wc = q.wildcards[wi];
        var w = wc.val;
        var wpos = 0; var widx;
        while ((widx = lower.indexOf(w, wpos)) !== -1) {
          if (wc.type === 'prefix') {
            // starts at word start; extend to end of word
            var b = lower[widx - 1];
            if (!isWordChar(b)) {
              var end = widx + w.length;
              while (end < lower.length && isWordChar(lower[end])) end++;
              add(widx, end);
            }
            wpos = widx + 1;
          } else if (wc.type === 'suffix') {
            // ends at word end; extend start to word start
            var a = lower[widx + w.length];
            if (!isWordChar(a)) {
              var start = widx;
              while (start > 0 && isWordChar(lower[start - 1])) start--;
              add(start, widx + w.length);
            }
            wpos = widx + 1;
          } else { // contains
            add(widx, widx + w.length);
            wpos = widx + 1;
          }
        }
      }

      // merge overlaps
      ranges.sort(function (a, b) { return a[0] - b[0]; });
      var merged = [];
      for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        if (!merged.length || r[0] > merged[merged.length - 1][1]) merged.push(r);
        else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]);
      }
      return merged;
    }

    function highlightNode(node, q) {
      try {
        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
        var textNodes = []; var n;
        while ((n = walker.nextNode())) { if (n.nodeValue && n.nodeValue.trim()) textNodes.push(n); }
        for (var i = 0; i < textNodes.length; i++) {
          var tnode = textNodes[i];
          var s = tnode.nodeValue;
          var ranges = collectRangesForText(s, q);
          if (!ranges.length) continue;
          var frag = document.createDocumentFragment();
          var last = 0;
          for (var r = 0; r < ranges.length; r++) {
            var a = ranges[r][0], b = ranges[r][1];
            if (a > last) frag.appendChild(document.createTextNode(s.slice(last, a)));
            var span = document.createElement('span'); span.className = className; span.textContent = s.slice(a, b);
            frag.appendChild(span);
            last = b;
          }
          if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
          tnode.parentNode.replaceChild(frag, tnode);
        }
      } catch (e) { /* continue */ }
    }

    for (var i = 0; i < cap; i++) {
      var el = SG.blocks[matchedIds[i]];
      highlightNode(el, qObj);
    }
    SG.lastHighlighted = new Set(matchedIds.slice(0, cap));
  }

  function setHash(q, only) {
    try {
      var params = new URLSearchParams();
      if (q) params.set('q', q);
      if (only) params.set('m', '1'); else params.set('m', '0');
      var next = '#' + params.toString();
      if (location.hash !== next) {
        history.replaceState(null, '', next);
      }
    } catch (e) { /* ignore */ }
  }

  function parseHashIntoUI() {
    try {
      var params = new URLSearchParams(location.hash.slice(1));
      var q = params.get('q') || '';
      var m = params.get('m');
      SG.onlyMatches = (m == null) ? true : (m === '1');
      var input = document.getElementById(CFG.ids.input);
      var onlyBtn = document.getElementById(CFG.ids.only);
      if (input) input.value = q;
      if (onlyBtn) {
        onlyBtn.setAttribute('aria-pressed', String(SG.onlyMatches));
        document.body.classList.toggle(CFG.classes.only, SG.onlyMatches);
      }
      return q;
    } catch (e) { return ''; }
  }

  function performSearch(raw) {
    var qObj = parseQuery(raw);
    var matchedIds = runQuery(qObj);
    requestAnimationFrame(function () {
      toggleVisibility(matchedIds);
      updateBlockOutlines(qObj.tokens.length || qObj.phrases.length || qObj.wildcards.length ? matchedIds : []);
      // Snippet trimming prior to highlighting
      if (qObj.tokens.length || qObj.phrases.length || qObj.wildcards.length) {
        if (CFG.snippet.enabled && (!CFG.snippet.applyOnOnlyMatches || SG.onlyMatches)) {
          applySnippetsForMatched(matchedIds, qObj);
        } else {
          clearAllTrimming();
        }
        applyHighlightsForMatched(matchedIds, qObj);
      } else {
        clearAllHighlights();
        clearAllTrimming();
      }
    });
    return { ids: matchedIds, qObj: qObj };
  }

  function main() {
    injectCSS();
    injectBar();
    buildCollections();
    buildIndex(function () {
      // After indexing, run initial search from hash or empty
      var initial = parseHashIntoUI();
      var result = performSearch(initial);
      // Wire events
      var input = document.getElementById(CFG.ids.input);
      var onlyBtn = document.getElementById(CFG.ids.only);
      var clearBtn = document.getElementById(CFG.ids.clear);
      var helpBtn = document.getElementById(CFG.ids.helpBtn);
      var help = document.getElementById(CFG.ids.help);

      var onInput = debounce(function () {
        var val = input.value;
        performSearch(val);
        setHash(val, SG.onlyMatches);
      }, CFG.debounceMs);

      input.addEventListener('input', onInput);
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearAllHighlights();
        updateBlockOutlines([]);
        performSearch('');
        setHash('', SG.onlyMatches);
        input.focus();
      });
      onlyBtn.addEventListener('click', function () {
        SG.onlyMatches = !(this.getAttribute('aria-pressed') === 'true');
        this.setAttribute('aria-pressed', String(SG.onlyMatches));
        document.body.classList.toggle(CFG.classes.only, SG.onlyMatches);
        var current = input.value;
        var res = performSearch(current);
        setHash(current, SG.onlyMatches);
      });
      helpBtn.addEventListener('click', function () {
        help.classList.toggle('show');
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === '/') { e.preventDefault(); input.focus(); }
        if (e.key === 'Escape') {
          if (help.classList.contains('show')) help.classList.remove('show');
          else {
            input.value = '';
            clearAllHighlights();
            updateBlockOutlines([]);
            performSearch('');
            setHash('', SG.onlyMatches);
            input.blur();
          }
        }
      });

      window.addEventListener('hashchange', function () {
        var q = parseHashIntoUI();
        performSearch(q);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
  else main();

  // Expose a tiny debug API without polluting global namespace
  window.SemanticGrep = {
    version: '1.0.0',
    rerun: function () { var q = document.getElementById(CFG.ids.input).value; performSearch(q); },
    config: CFG
  };
})();
