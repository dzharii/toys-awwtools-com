/*
  Semantic Grep for large HTML specs (vanilla JS)
  - Floating search bar, block filtering, sentence-aware snippets, non-intrusive highlights
  - Minimal intrusion: one script tag; all UI/CSS injected at runtime
  - Reusable: configurable via window.SemGrepDocsConfig
*/
(function () {
  'use strict';

  // --- Config ---
  var CFG = Object.assign({
    headingSelector: 'h1,h2,h3,h4,h5,h6',
    blockSelector: 'p,pre,dl,table,ol,ul',
    excludeSelector: '',
    debounceMs: 200,
    cacheSize: 32,
    contextRadius: 0,
    snippet: { enabled: true, maxChars: 700, leadChars: 220, trailChars: 220, sentencePunct: '.!?', applyOnOnlyMatches: true },
    fuzzy: { enabled: true, maxPerToken: 50, minScore: 3 },
    ui: { placeholder: 'Search C99...', label: 'Semantic grep', onlyMatchesLabel: 'Only matches', fuzzyLabel: 'Fuzzy', clearLabel: 'Clear', helpLabel: 'Help' },
    ids: { root: 'sg-root', style: 'sg-style', input: 'sg-q', only: 'sg-only', fuzzy: 'sg-fuzzy', clear: 'sg-clear', counter: 'sg-counter', helpBtn: 'sg-help-btn', help: 'sg-help' },
    classes: { hidden: 'sg-hidden', only: 'sg-only', mark: 'sg-mark', block: 'sg-block', hasMatch: 'sg-has-match', trim: 'sg-trim' }
  }, window.SemGrepDocsConfig || {});

  // --- State ---
  var SG = {
    ready: false,
    onlyMatches: true,
    fuzzyOn: true,
    blocks: [], blockToSection: [], headings: [], sectionToBlocks: new Map(),
    index: new Map(), textCache: [], tokensCache: [], vocab: [],
    queryCache: new Map(), fuzzyCache: new Map(),
    lastHighlighted: new Set(), lastOutlined: new Set(), lastTrimmed: new Set()
  };

  // --- Helpers ---
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function debounce(fn, ms) { var t = 0; return function () { clearTimeout(t); var a = arguments, c = this; t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function isWordChar(c) { return !!c && /[A-Za-z0-9_]/.test(c); }
  function normalizeText(s) { try { s = s.normalize('NFD'); } catch (e) {} s = s.replace(/[\u0300-\u036f]/g, ''); s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, '-'); return s.replace(/\s+/g, ' ').trim().toLowerCase(); }
  function tokenize(s) { var m = s.match(/[a-z0-9_]+/g); return m ? m : []; }
  function lruGet(map, key) { if (!map.has(key)) return; var v = map.get(key); map.delete(key); map.set(key, v); return v; }
  function lruSet(map, key, val, max) { if (map.has(key)) map.delete(key); map.set(key, val); while (map.size > max) map.delete(map.keys().next().value); }

  // --- CSS ---
  function injectCSS() {
    if (document.getElementById(CFG.ids.style)) return;
    var css = '' +
      ':root{--sg-mark-bg:rgba(255,229,100,.30);--sg-mark-border:rgba(160,140,0,.35);--sg-block-outline:rgba(0,0,0,.20)}' +
      '@media (prefers-color-scheme: dark){:root{--sg-mark-bg:rgba(255,210,70,.22);--sg-mark-border:rgba(255,235,150,.40);--sg-block-outline:rgba(255,255,255,.25)}}' +
      '#' + CFG.ids.root + '{position:fixed;top:0;left:0;right:0;z-index:9999;font:14px system-ui,Segoe UI,Arial,sans-serif;background:#fff;border-bottom:1px solid #ddd}' +
      '.sg-wrap{max-width:1200px;margin:0 auto;padding:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
      '.sg-input{flex:1 1 420px;min-width:260px;padding:6px 8px;border:1px solid #bbb;border-radius:4px}' +
      '.sg-btn{padding:6px 10px;border:1px solid #bbb;border-radius:4px;background:#f7f7f7;cursor:pointer}' +
      '.sg-btn[aria-pressed="true"]{background:#e8f3ff;border-color:#7fb1ff}' +
      '.sg-counter{margin-left:auto;opacity:.7}' +
      '.' + CFG.classes.hidden + '{display:none !important}' +
      '.' + CFG.classes.mark + '{background:var(--sg-mark-bg);box-shadow:inset 0 0 0 1px var(--sg-mark-border);border-radius:3px}' +
      '.' + CFG.classes.block + '.' + CFG.classes.hasMatch + '{outline:1px solid var(--sg-block-outline);outline-offset:2px;border-radius:4px}' +
      '.' + CFG.classes.trim + '{display:none !important}' +
      '.sg-help{position:fixed;top:48px;right:16px;max-width:360px;background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px 12px;box-shadow:0 6px 24px rgba(0,0,0,.12);display:none}' +
      '.sg-help.show{display:block}' +
      CFG.headingSelector.split(',').map(function (h) { return h + '{scroll-margin-top:56px}'; }).join('');
    var style = document.createElement('style'); style.id = CFG.ids.style; style.appendChild(document.createTextNode(css)); document.head.appendChild(style);
  }

  // --- UI ---
  function injectBar() {
    if (document.getElementById(CFG.ids.root)) return;
    var root = document.createElement('div'); root.id = CFG.ids.root;
    var wrap = document.createElement('div'); wrap.className = 'sg-wrap';
    wrap.innerHTML = '' +
      '<input id="' + CFG.ids.input + '" class="sg-input" type="search" placeholder="' + CFG.ui.placeholder + '" aria-label="' + CFG.ui.label + '" />' +
      '<button id="' + CFG.ids.only + '" class="sg-btn" aria-pressed="true" title="Toggle only matches">' + CFG.ui.onlyMatchesLabel + '</button>' +
      '<button id="' + CFG.ids.fuzzy + '" class="sg-btn" aria-pressed="true" title="Toggle fuzzy tokens">' + CFG.ui.fuzzyLabel + '</button>' +
      '<button id="' + CFG.ids.clear + '" class="sg-btn">' + CFG.ui.clearLabel + '</button>' +
      '<button id="' + CFG.ids.helpBtn + '" class="sg-btn" aria-haspopup="dialog" aria-controls="' + CFG.ids.help + '">?' + '</button>' +
      '<span id="' + CFG.ids.counter + '" class="sg-counter"></span>';
    root.appendChild(wrap);
    var help = document.createElement('div'); help.id = CFG.ids.help; help.className = 'sg-help';
    help.innerHTML = '<strong>Semantic Grep</strong><br/>' +
      'Shortcuts: <code>/</code> focus, <code>Esc</code> clear.<br/>' +
      'Query: AND terms, quoted phrases, wildcards <code>term*</code>, <code>*term</code>, <code>*term*</code>.<br/>' +
      'Fuzzy: VS Code-like token matching (e.g., <code>snprf</code> → <code>snprintf</code>).';
    root.appendChild(help);
    document.body.appendChild(root);
    requestAnimationFrame(function () { var h = root.getBoundingClientRect().height; document.body.style.paddingTop = Math.ceil(h) + 'px'; });
  }

  // --- Collection ---
  function buildCollections() {
    var exclude = CFG.excludeSelector ? new Set($all(CFG.excludeSelector)) : new Set();
    var headingSet = new Set(CFG.headingSelector.split(',').map(function (t) { return t.trim().toUpperCase(); }));
    var blockSet = new Set(CFG.blockSelector.split(',').map(function (t) { return t.trim().toUpperCase(); }));

    (function wrapStrays() { try {
      var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
      var within = CFG.blockSelector + ',' + CFG.headingSelector + ',#' + CFG.ids.root;
      while ((n = tw.nextNode())) {
        var v = n.nodeValue; if (!v || !v.trim()) continue; var p = n.parentElement; if (!p) continue;
        if (p.closest('#' + CFG.ids.root)) continue; if (p.closest(within)) continue; if (exclude.has(p)) continue;
        var span = document.createElement('span'); span.className = CFG.classes.block + ' sg-stray'; p.insertBefore(span, n); span.appendChild(n);
      }
    } catch (e) {} })();

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null), node, secId = -1;
    SG.blocks = []; SG.blockToSection = []; SG.headings = []; SG.sectionToBlocks = new Map();
    while ((node = walker.nextNode())) {
      if (exclude.has(node)) continue; if (node.closest('#' + CFG.ids.root)) continue;
      var tag = node.tagName.toUpperCase();
      if (headingSet.has(tag)) { secId = SG.headings.length; SG.headings.push(node); }
      else if (blockSet.has(tag) || node.classList.contains('sg-stray')) {
        node.classList.add(CFG.classes.block); SG.blocks.push(node); SG.blockToSection.push(secId);
        if (secId >= 0) { if (!SG.sectionToBlocks.has(secId)) SG.sectionToBlocks.set(secId, []); SG.sectionToBlocks.get(secId).push(SG.blocks.length - 1); }
      }
    }
  }

  // --- Index ---
  function buildIndex(done) {
    SG.index = new Map(); SG.textCache = new Array(SG.blocks.length); SG.tokensCache = new Array(SG.blocks.length);
    var i = 0; function step(deadline) {
      while (i < SG.blocks.length && (!deadline || deadline.timeRemaining() > 8)) {
        var t = normalizeText(SG.blocks[i].textContent || ''); SG.textCache[i] = t; var toks = tokenize(t); SG.tokensCache[i] = toks;
        var seen = new Set(); for (var k = 0; k < toks.length; k++) { var tok = toks[k]; if (seen.has(tok)) continue; seen.add(tok); var arr = SG.index.get(tok); if (!arr) SG.index.set(tok, arr = []); arr.push(i); }
        i++;
      }
      if (i < SG.blocks.length) { if ('requestIdleCallback' in window) window.requestIdleCallback(step); else setTimeout(step, 16); }
      else { SG.ready = true; SG.vocab = Array.from(SG.index.keys()); if (done) done(); }
    }
    if ('requestIdleCallback' in window) window.requestIdleCallback(step); else setTimeout(step, 0);
  }

  // --- Query parsing ---
  function parseQuery(raw) {
    var q = String(raw || '').trim(); if (!q) return { raw: '', tokens: [], phrases: [], wildcards: [], norm: '' };
    var phrases = []; q = q.replace(/"([^"]+)"/g, function (_, ph) { phrases.push(normalizeText(ph)); return ' '; });
    var parts = q.split(/\s+/).filter(Boolean); var tokens = []; var wildcards = [];
    parts.forEach(function (p) { var isPrefix = /\*$/.test(p) && !/^\*/.test(p); var isSuffix = /^\*/.test(p) && !/\*$/.test(p); var isContains = /^\*/.test(p) && /\*$/.test(p); var core = p.replace(/^\*/, '').replace(/\*$/, ''); core = normalizeText(core); if (isPrefix || isSuffix || isContains) wildcards.push({ type: isContains ? 'contains' : (isPrefix ? 'prefix' : 'suffix'), val: core }); else tokens.push(core); });
    var norm = (tokens.join(' ') + ' | ' + phrases.join(' ')) + (wildcards.length ? ' | *' : '');
    return { raw: raw, tokens: tokens, phrases: phrases, wildcards: wildcards, norm: norm };
  }

  // --- Fuzzy matching ---
  function fuzzyScore(pattern, word) {
    var p = pattern, w = word; if (!p) return -Infinity; var pi = 0, wi = 0, score = 0, consec = 0, last = -2;
    if (w.indexOf(p) === 0) score += 50; else if (w.indexOf(p) !== -1) score += 20;
    while (pi < p.length && wi < w.length) { if (p.charCodeAt(pi) === w.charCodeAt(wi)) { var bonus = 1; if (wi === 0 || !isWordChar(w[wi - 1])) bonus += 6; if (wi === last + 1) { consec++; bonus += Math.min(4, 1 + consec); } else consec = 0; score += bonus; last = wi; pi++; wi++; } else wi++; }
    if (pi < p.length) return -Infinity; score += Math.max(0, 6 - Math.floor(w.length / 4)); return score;
  }
  function fuzzyExpandToken(pattern) { var cached = lruGet(SG.fuzzyCache, pattern); if (cached) return cached; var results = []; var p0 = pattern[0]; for (var i = 0; i < SG.vocab.length; i++) { var tok = SG.vocab[i]; if (tok.length < pattern.length) continue; if (p0 && tok.indexOf(p0) === -1) continue; var s = fuzzyScore(pattern, tok); if (s !== -Infinity && s >= CFG.fuzzy.minScore) results.push({ tok: tok, score: s }); } results.sort(function (a, b) { return b.score - a.score; }); if (results.length > CFG.fuzzy.maxPerToken) results.length = CFG.fuzzy.maxPerToken; lruSet(SG.fuzzyCache, pattern, results, 64); return results; }

  // --- Search core ---
  function intersect(a, bSet) { var out = []; for (var i = 0; i < a.length; i++) if (bSet.has(a[i])) out.push(a[i]); return out; }
  function uniqueSorted(ids) { ids.sort(function (x, y) { return x - y; }); var out = [], prev = -1; for (var i = 0; i < ids.length; i++) { var v = ids[i]; if (v !== prev) out.push(v); prev = v; } return out; }

  function runQuery(qObj) {
    if (!SG.ready) return [];
    var cacheKey = JSON.stringify({ q: qObj.norm, w: qObj.wildcards, m: SG.onlyMatches, fz: SG.fuzzyOn });
    var cached = lruGet(SG.queryCache, cacheKey); if (cached) return cached.slice();

    var candidate = null; var fuzzyTerms = [];
    if (qObj.tokens.length) {
      qObj.tokens.forEach(function (tok, idx) {
        var set = new Set();
        if (CFG.fuzzy.enabled && SG.fuzzyOn) {
          var ex = fuzzyExpandToken(tok); if (SG.index.has(tok)) ex.unshift({ tok: tok, score: 1000 });
          var seen = new Set(); for (var e = 0; e < ex.length; e++) { var t = ex[e].tok; if (seen.has(t)) continue; seen.add(t); var arr = SG.index.get(t); if (!arr) continue; fuzzyTerms.push(t); for (var a = 0; a < arr.length; a++) set.add(arr[a]); }
        } else {
          var list = SG.index.get(tok) || []; for (var a2 = 0; a2 < list.length; a2++) set.add(list[a2]);
        }
        var arrSet = Array.from(set); if (idx === 0) candidate = arrSet; else candidate = intersect(candidate, new Set(arrSet));
      });
    } else { candidate = SG.textCache.map(function (_, i) { return i; }); }

    if (qObj.phrases.length) { candidate = candidate.filter(function (id) { var text = SG.textCache[id]; for (var j = 0; j < qObj.phrases.length; j++) if (text.indexOf(qObj.phrases[j]) === -1) return false; return true; }); }

    if (qObj.wildcards.length) {
      candidate = candidate.filter(function (id) { var toks = SG.tokensCache[id]; for (var j = 0; j < qObj.wildcards.length; j++) { var wc = qObj.wildcards[j]; var ok = false; for (var k = 0; k < toks.length; k++) { var t = toks[k]; if (wc.type === 'prefix' && t.indexOf(wc.val) === 0) { ok = true; break; } if (wc.type === 'suffix' && t.lastIndexOf(wc.val) === t.length - wc.val.length) { ok = true; break; } if (wc.type === 'contains' && t.indexOf(wc.val) !== -1) { ok = true; break; } } if (!ok) return false; } return true; });
    }

    if (CFG.contextRadius > 0 && candidate.length) { var more = new Set(candidate); candidate.forEach(function (id) { var sec = SG.blockToSection[id]; var arr = SG.sectionToBlocks.get(sec) || []; var pos = arr.indexOf(id); if (pos !== -1) for (var r = 1; r <= CFG.contextRadius; r++) { if (arr[pos - r] != null) more.add(arr[pos - r]); if (arr[pos + r] != null) more.add(arr[pos + r]); } }); candidate = Array.from(more); }

    candidate = uniqueSorted(candidate); qObj.fuzzyTerms = fuzzyTerms.slice(0, 100); lruSet(SG.queryCache, cacheKey, candidate, CFG.cacheSize); return candidate;
  }

  // --- Visibility & outlines ---
  function updateCounter(shown, total) { var el = document.getElementById(CFG.ids.counter); if (el) el.textContent = shown + ' blocks shown of ' + total; }
  function toggleVisibility(visibleIds) {
    var total = SG.blocks.length; if (!SG.onlyMatches) { for (var i = 0; i < total; i++) SG.blocks[i].classList.remove(CFG.classes.hidden); for (var h = 0; h < SG.headings.length; h++) SG.headings[h].classList.remove(CFG.classes.hidden); updateCounter(total, total); return; }
    var vis = new Uint8Array(total); for (var k = 0; k < visibleIds.length; k++) vis[visibleIds[k]] = 1; var shown = 0; for (var i2 = 0; i2 < total; i2++) { var on = !!vis[i2]; if (on) { shown++; SG.blocks[i2].classList.remove(CFG.classes.hidden); } else SG.blocks[i2].classList.add(CFG.classes.hidden); }
    for (var s = 0; s < SG.headings.length; s++) { var arr = SG.sectionToBlocks.get(s) || []; var any = false; for (var j = 0; j < arr.length; j++) { if (vis[arr[j]]) { any = true; break; } } var head = SG.headings[s]; if (head) { if (any) head.classList.remove(CFG.classes.hidden); else head.classList.add(CFG.classes.hidden); } }
    updateCounter(shown, total);
  }
  function updateBlockOutlines(matchedIds) { var next = new Set(matchedIds); SG.lastOutlined.forEach(function (id) { if (!next.has(id)) { var el = SG.blocks[id]; if (el) el.classList.remove(CFG.classes.hasMatch); } }); next.forEach(function (id) { var el = SG.blocks[id]; if (el) el.classList.add(CFG.classes.hasMatch); }); SG.lastOutlined = next; }

  // --- Highlights ---
  function clearHighlightsIn(ids) {
    for (var i = 0; i < ids.length; i++) {
      var el = SG.blocks[ids[i]]; if (!el) continue;
      var marks = el.querySelectorAll('.' + CFG.classes.mark);
      for (var j = 0; j < marks.length; j++) {
        var m = marks[j]; var p = m.parentNode; if (!p) continue;
        while (m.firstChild) p.insertBefore(m.firstChild, m);
        p.removeChild(m);
      }
      if (el.normalize) el.normalize();
    }
  }
  function clearAllHighlights() {
    var ids = Array.from(SG.lastHighlighted);
    if (!ids.length) ids = SG.blocks.map(function (_, i) { return i; });
    clearHighlightsIn(ids);
    SG.lastHighlighted.clear();
  }
  function applyHighlightsForMatched(matchedIds, qObj) {
    var union = new Set(matchedIds); SG.lastHighlighted.forEach(function (id) { union.add(id); });
    clearHighlightsIn(Array.from(union));
    if (!matchedIds.length) { SG.lastHighlighted.clear(); return; }

    var cap = Math.min(matchedIds.length, 600);
    var className = CFG.classes.mark;

    function collectRanges(text, q) {
      var lower = text.toLowerCase(); var ranges = [];
      function add(a, b) { if (a < b) ranges.push([a, b]); }
      // tokens
      for (var ti = 0; ti < q.tokens.length; ti++) {
        var tok = q.tokens[ti], pos = 0, idx;
        while ((idx = lower.indexOf(tok, pos)) !== -1) { var b = lower[idx - 1], a = lower[idx + tok.length]; if (!isWordChar(b) && !isWordChar(a)) add(idx, idx + tok.length); pos = idx + tok.length; }
      }
      // phrases
      for (var pi = 0; pi < q.phrases.length; pi++) { var ph = q.phrases[pi], ppos = 0, pidx; while ((pidx = lower.indexOf(ph, ppos)) !== -1) { add(pidx, pidx + ph.length); ppos = pidx + ph.length; } }
      // fuzzy expanded terms
      if (q.fuzzyTerms && q.fuzzyTerms.length) {
        for (var fi = 0; fi < q.fuzzyTerms.length; fi++) { var ft = q.fuzzyTerms[fi], fpos = 0, fidx; while ((fidx = lower.indexOf(ft, fpos)) !== -1) { var b2 = lower[fidx - 1], a2 = lower[fidx + ft.length]; if (!isWordChar(b2) && !isWordChar(a2)) add(fidx, fidx + ft.length); fpos = fidx + ft.length; } }
      }
      // wildcards
      for (var wi = 0; wi < q.wildcards.length; wi++) {
        var wc = q.wildcards[wi], w = wc.val, wpos = 0, widx;
        while ((widx = lower.indexOf(w, wpos)) !== -1) {
          if (wc.type === 'prefix') { var b3 = lower[widx - 1]; if (!isWordChar(b3)) { var end = widx + w.length; while (end < lower.length && isWordChar(lower[end])) end++; add(widx, end); } wpos = widx + 1; }
          else if (wc.type === 'suffix') { var a3 = lower[widx + w.length]; if (!isWordChar(a3)) { var start = widx; while (start > 0 && isWordChar(lower[start - 1])) start--; add(start, widx + w.length); } wpos = widx + 1; }
          else { add(widx, widx + w.length); wpos = widx + 1; }
        }
      }
      // merge overlaps
      ranges.sort(function (a, b) { return a[0] - b[0]; }); var merged = []; for (var i = 0; i < ranges.length; i++) { var r = ranges[i]; if (!merged.length || r[0] > merged[merged.length - 1][1]) merged.push(r); else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]); }
      return merged;
    }

    function highlightNode(node, q) {
      try {
        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), n, texts = [];
        while ((n = walker.nextNode())) { if (n.nodeValue && n.nodeValue.trim()) texts.push(n); }
        for (var i = 0; i < texts.length; i++) {
          var tnode = texts[i]; var s = tnode.nodeValue; var ranges = collectRanges(s, q); if (!ranges.length) continue;
          var frag = document.createDocumentFragment(); var last = 0;
          for (var r = 0; r < ranges.length; r++) { var a = ranges[r][0], b = ranges[r][1]; if (a > last) frag.appendChild(document.createTextNode(s.slice(last, a))); var span = document.createElement('span'); span.className = className; span.textContent = s.slice(a, b); frag.appendChild(span); last = b; }
          if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
          tnode.parentNode.replaceChild(frag, tnode);
        }
      } catch (e) { /* continue */ }
    }

    for (var i = 0; i < cap; i++) { var el = SG.blocks[matchedIds[i]]; highlightNode(el, qObj); }
    SG.lastHighlighted = new Set(matchedIds.slice(0, cap));
  }

  // --- Snippet trimming ---
  function nearestLeftBoundary(text, idx) { var i = Math.max(0, Math.min(idx, text.length)); var punct = CFG.snippet.sentencePunct; for (var k = i; k > 0; k--) { var c = text[k - 1]; if (punct.indexOf(c) !== -1) return k; if (/\s/.test(c)) return k; } return 0; }
  function nearestRightBoundary(text, idx) { var i = Math.max(0, Math.min(idx, text.length)); var punct = CFG.snippet.sentencePunct; for (var k = i; k < text.length; k++) { var c = text[k]; if (punct.indexOf(c) !== -1) return k + 1; if (/\s/.test(c)) return k; } return text.length; }
  function computeWindowForText(text, qObj) {
    // Use tokens/phrases/wildcards/fuzzy terms to find match extents
    var lower = text.toLowerCase(); var starts = [], ends = [];
    function pushRange(a, b) { starts.push(a); ends.push(b); }
    function scanTerm(term) { var pos = 0, idx; while ((idx = lower.indexOf(term, pos)) !== -1) { pushRange(idx, idx + term.length); pos = idx + term.length; } }
    for (var t1 = 0; t1 < qObj.tokens.length; t1++) scanTerm(qObj.tokens[t1]);
    for (var p1 = 0; p1 < qObj.phrases.length; p1++) scanTerm(qObj.phrases[p1]);
    if (qObj.fuzzyTerms) for (var f1 = 0; f1 < qObj.fuzzyTerms.length; f1++) scanTerm(qObj.fuzzyTerms[f1]);
    if (starts.length === 0) return null; var first = Math.min.apply(null, starts), last = Math.max.apply(null, ends);
    var start = nearestLeftBoundary(text, Math.max(0, first - CFG.snippet.leadChars));
    var end = nearestRightBoundary(text, Math.min(text.length, last + CFG.snippet.trailChars));
    if (end - start > CFG.snippet.maxChars) { var need = (end - start) - CFG.snippet.maxChars; var shaveL = Math.floor(need / 2), shaveR = need - shaveL; start = nearestRightBoundary(text, start + shaveL); end = nearestLeftBoundary(text, end - shaveR); }
    if (start >= end) return null; return { start: start, end: end };
  }
  function clearTrimmingIn(ids) {
    for (var i = 0; i < ids.length; i++) { var el = SG.blocks[ids[i]]; if (!el) continue; var trims = el.querySelectorAll('.' + CFG.classes.trim); for (var j = 0; j < trims.length; j++) { var t = trims[j]; var p = t.parentNode; if (!p) continue; while (t.firstChild) p.insertBefore(t.firstChild, t); p.removeChild(t); if (p.normalize) p.normalize(); } }
  }
  function clearAllTrimming() { if (!SG.lastTrimmed.size) return; clearTrimmingIn(Array.from(SG.lastTrimmed)); SG.lastTrimmed.clear(); }
  function applySnippetsForMatched(matchedIds, qObj) {
    var cap = Math.min(matchedIds.length, 600); var newTrim = new Set();
    for (var i = 0; i < cap; i++) {
      var id = matchedIds[i], el = SG.blocks[id]; if (!el) continue; var tag = el.tagName.toUpperCase(); if (tag !== 'P') { if (SG.lastTrimmed.has(id)) clearTrimmingIn([id]); continue; }
      var text = el.textContent || ''; var win = computeWindowForText(text, qObj); if (!win) { if (SG.lastTrimmed.has(id)) clearTrimmingIn([id]); continue; }
      if (win.start <= 0 && win.end >= text.length) { if (SG.lastTrimmed.has(id)) clearTrimmingIn([id]); continue; }
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, pos = 0;
      while ((n = walker.nextNode())) { var s = n.nodeValue || ''; var len = s.length; var nodeStart = pos, nodeEnd = pos + len; var keepA = Math.max(win.start, nodeStart); var keepB = Math.min(win.end, nodeEnd);
        if (keepA <= keepB) {
          if (keepA > nodeStart) { var leftLen = keepA - nodeStart; var leftText = s.slice(0, leftLen); var leftNode = document.createTextNode(leftText); var wrapL = document.createElement('span'); wrapL.className = CFG.classes.trim; wrapL.appendChild(leftNode); n.parentNode.insertBefore(wrapL, n); s = s.slice(leftLen); len = s.length; n.nodeValue = s; nodeStart = keepA; }
          if (keepB < nodeEnd) { var rightIndex = keepB - nodeStart; var rightText = s.slice(rightIndex); var rightNode = document.createTextNode(rightText); var wrapR = document.createElement('span'); wrapR.className = CFG.classes.trim; wrapR.appendChild(rightNode); if (n.nextSibling) n.parentNode.insertBefore(wrapR, n.nextSibling); else n.parentNode.appendChild(wrapR); n.nodeValue = s.slice(0, rightIndex); }
        } else { var wrap = document.createElement('span'); wrap.className = CFG.classes.trim; n.parentNode.insertBefore(wrap, n); wrap.appendChild(n); }
        pos += len;
      }
      newTrim.add(id);
    }
    SG.lastTrimmed.forEach(function (id) { if (!newTrim.has(id)) clearTrimmingIn([id]); }); SG.lastTrimmed = newTrim;
  }

  // --- URL state ---
  function setHash(q, only) { try { var params = new URLSearchParams(); if (q) params.set('q', q); if (only) params.set('m', '1'); else params.set('m', '0'); params.set('fz', SG.fuzzyOn ? '1' : '0'); var next = '#' + params.toString(); if (location.hash !== next) history.replaceState(null, '', next); } catch (e) {} }
  function parseHashIntoUI() { try { var params = new URLSearchParams(location.hash.slice(1)); var q = params.get('q') || ''; var m = params.get('m'); SG.onlyMatches = (m == null) ? true : (m === '1'); var fz = params.get('fz'); SG.fuzzyOn = (fz == null) ? true : (fz === '1'); var input = document.getElementById(CFG.ids.input); var onlyBtn = document.getElementById(CFG.ids.only); var fuzzyBtn = document.getElementById(CFG.ids.fuzzy); if (input) input.value = q; if (onlyBtn) { onlyBtn.setAttribute('aria-pressed', String(SG.onlyMatches)); document.body.classList.toggle(CFG.classes.only, SG.onlyMatches); } if (fuzzyBtn) { fuzzyBtn.setAttribute('aria-pressed', String(SG.fuzzyOn)); } return q; } catch (e) { return ''; } }

  // --- Orchestration ---
  function performSearch(raw) {
    var qObj = parseQuery(raw); var ids = runQuery(qObj);
    requestAnimationFrame(function () {
      toggleVisibility(ids);
      updateBlockOutlines((qObj.tokens.length || qObj.phrases.length || qObj.wildcards.length || (qObj.fuzzyTerms && qObj.fuzzyTerms.length)) ? ids : []);
      if (qObj.tokens.length || qObj.phrases.length || qObj.wildcards.length || (qObj.fuzzyTerms && qObj.fuzzyTerms.length)) {
        if (CFG.snippet.enabled && (!CFG.snippet.applyOnOnlyMatches || SG.onlyMatches)) applySnippetsForMatched(ids, qObj); else clearAllTrimming();
        applyHighlightsForMatched(ids, qObj);
      } else { clearAllHighlights(); clearAllTrimming(); }
    });
    return { ids: ids, qObj: qObj };
  }

  function main() {
    injectCSS(); injectBar(); buildCollections();
    buildIndex(function () {
      var initial = parseHashIntoUI(); performSearch(initial);
      var input = document.getElementById(CFG.ids.input); var onlyBtn = document.getElementById(CFG.ids.only); var clearBtn = document.getElementById(CFG.ids.clear); var helpBtn = document.getElementById(CFG.ids.helpBtn); var help = document.getElementById(CFG.ids.help); var fuzzyBtn = document.getElementById(CFG.ids.fuzzy);
      var onInput = debounce(function () { var val = input.value; performSearch(val); setHash(val, SG.onlyMatches); }, CFG.debounceMs);
      input.addEventListener('input', onInput);
      clearBtn.addEventListener('click', function () { input.value = ''; clearAllHighlights(); updateBlockOutlines([]); performSearch(''); setHash('', SG.onlyMatches); input.focus(); });
      onlyBtn.addEventListener('click', function () { SG.onlyMatches = !(this.getAttribute('aria-pressed') === 'true'); this.setAttribute('aria-pressed', String(SG.onlyMatches)); document.body.classList.toggle(CFG.classes.only, SG.onlyMatches); var cur = input.value; performSearch(cur); setHash(cur, SG.onlyMatches); });
      fuzzyBtn.addEventListener('click', function () { SG.fuzzyOn = !(this.getAttribute('aria-pressed') === 'true'); this.setAttribute('aria-pressed', String(SG.fuzzyOn)); var cur = input.value; performSearch(cur); setHash(cur, SG.onlyMatches); });
      helpBtn.addEventListener('click', function () { help.classList.toggle('show'); });
      document.addEventListener('keydown', function (e) { if (e.key === '/') { e.preventDefault(); input.focus(); } if (e.key === 'Escape') { if (help.classList.contains('show')) help.classList.remove('show'); else { input.value = ''; clearAllHighlights(); updateBlockOutlines([]); performSearch(''); setHash('', SG.onlyMatches); input.blur(); } } });
      window.addEventListener('hashchange', function () { var q = parseHashIntoUI(); performSearch(q); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();

  // Debug API
  window.SemanticGrep = { version: '1.1.0', rerun: function () { var q = document.getElementById(CFG.ids.input).value; performSearch(q); }, config: CFG };
})();
