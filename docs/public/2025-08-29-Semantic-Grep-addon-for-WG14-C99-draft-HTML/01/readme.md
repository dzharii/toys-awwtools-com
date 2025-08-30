# Project implementation specification - Semantic Grep add-on for WG14 C99 draft HTML

## Purpose

Deliver an add-on that overlays a fast, context aware search UI on top of the C99 draft HTML, showing full semantic blocks that contain matches instead of isolated lines. The original HTML must remain essentially untouched. Only a single script tag is added to the HTML. All other DOM, CSS, and behavior are injected at runtime by vanilla JavaScript.

The target document is the WG14 N1256 C99 TC3 draft HTML mirror. It is a single large HTML file with headings and sections such as 7.19.6 Formatted input and output and functions like swprintf, vsnprintf, etc. ([port70.net][1])

## Quoted user intent

* "Find a way to add some JavaScript and CSS to the known C99 draft specification HTML."
* "All the logic should be implemented in a separate JavaScript file and JavaScript include should be placed in that file."
* "Do not add a lot of HTML into the original file."
* "Have JavaScript render all new HTML that is needed."
* "It should recognize the HTML and render a UI for its own purposes."
* "It is supposed to be like a search bar and it is supposed to be working as a semantic grep."
* "When I search for S and print, include entire blocks, entire paragraphs that have this context."
* "Reduce the content to only blocks that have something to do with the query."
* "Optimize while I am typing, debounce or throttle, keep the experience smooth."
* "Vanilla JavaScript CSS HTML, no bundlers, no external libraries."

## Scope

* One script file adds a floating search bar and result controls.
* The script detects semantic blocks in the existing HTML and toggles visibility to show only matching blocks.
* The script injects all required CSS at runtime.
* No external dependencies, no bundlers, no build step.

## Non goals

* No modification of the document structure on disk beyond adding one script tag.
* No indexing on a server, no network calls.
* No framework, no web components, no shadow DOM.

## Target document assumptions that drive implementation

* The document is a single large HTML page with a clear heading hierarchy h1 to h6 and content blocks p, pre, dl, table that belong to those headings. Example headings include the Library chapter and function sections such as 7.24.2.3 The swprintf function and index entries for vsnprintf and related functions. ([port70.net][1])
* Internal anchors and cross references exist but do not need to be modified. ([port70.net][1])

## High level behavior

* On page load, the script builds a client side index of candidate blocks that can be shown or hidden.
* The script renders a fixed search UI at the top of the viewport.
* As a user types, queries are debounced and evaluated against the index.
* Matching blocks remain visible and are highlighted. Non matching blocks are collapsed via CSS without removing them from the DOM.
* The user can toggle Show all vs Only matches and clear the filter quickly.
* The URL hash is updated so the state can be shared or reloaded.

## Definitions

* Block: the smallest meaningful content unit to display. Candidates are p, pre, dl, table, ol, ul.
* Section: a heading h1..h6 and its following sibling content until the next heading of the same or higher rank.
* Context escalation: when a match lands inside a small block, optionally include nearby sibling blocks and the section heading to give context.

## Requirements - user visible

* A single search input labeled Semantic grep with placeholder text Search C99...
* A counter that shows N blocks shown of M.
* A toggle Only matches that hides non matching blocks.
* A clear button that resets the query.
* Keyboard shortcuts: / to focus, Esc to clear and blur, Enter to lock the highlight selection.
* Match highlighting inside blocks with a neutral background and no layout shift.
* A small help flyout listing shortcuts.

## Requirements - search semantics

* Case insensitive by default.
* Simple tokenization: space separated terms are ANDed.
* Quoted phrases "..." are treated as exact substring matches.
* Optional prefixes: term\* for prefix match, \*term for suffix match, *term* for contains. No regex in v1.
* Diacritics folding and ASCII only normalization.
* Stop words are not removed. Keep behavior predictable for spec language.

## Requirements - performance

* Build a one time inverted index in the browser on first load.
* Use requestIdleCallback when available to spread indexing work. Fallback to time sliced setTimeout loops.
* Debounce input by 200 ms. Use rAF batched DOM writes to toggle classes.
* Cache last K queries and results in memory for backspacing.
* Avoid innerHTML on large fragments. Only toggle CSS classes and set data attributes.
* Avoid reflow storms. Write classes to a DocumentFragment list then batch apply.

## Requirements - accessibility

* All injected UI elements are keyboard reachable and screen reader labeled.
* The search input has aria-label and role=search.
* Toggle buttons have aria-pressed.
* Announce result counts via aria-live=polite.

## Requirements - resilience

* If indexing is not yet complete, the UI must still accept queries and use a partial index with a small spinner beside the input.
* If the script fails, the document remains fully readable as delivered.

## File layout and integration

* Single file c99-semgrep.js placed alongside the HTML or a static assets directory.
* HTML change is a single line script include with defer.
* No separate .css file. Styles are injected by the script via a <style> element.

## The only change in the C99 HTML

```html
<!-- Add before </body> -->
<script src="c99-semgrep.js" defer></script>
```

## DOM injection contract

* The script creates a top level container <div id="sg-root" role="region" aria-label="Semantic grep"> and appends it to document.body.
* The script adds a <style id="sg-style"> element to document.head to hold all CSS.
* All classes and ids use the sg- prefix to avoid collisions.

## CSS rules injected by the script

* .sg-bar is a fixed top bar with 100 percent width, z-index above page nav, pointer events enabled, minimal box shadow.
* body gets padding-top to prevent content jump. The padding is applied once after the bar height is measured.
* .sg-hidden sets display to none for unmatched blocks.
* .sg-mark wraps matched substrings and uses lightweight background and outline for high contrast.
* Reduced motion media query disables any transitions.

## Selecting blocks and sections

* Candidate block selector: p, pre, dl, table, ol, ul.
* Heading selector: h1, h2, h3, h4, h5, h6.
* For each heading node, compute a Section with start index at the heading and end index at the next heading of same or higher rank.
* For each candidate block, record its enclosing Section id to support context escalation.
* This approach aligns with the C99 draft structure where content is organized under hierarchical headings and numbered sections. ([port70.net][1])

## Indexing algorithm

* On DOMContentLoaded, collect NodeList of blocks. Assign them sequential ids sg-b-1..N.
* For each block, extract visible textContent, lower case, collapse whitespace.
* Tokenize by /\[A-Za-z0-9\_]+/ to keep identifiers like vsnprintf intact.
* Build an inverted index Map token -> Uint32Array of block ids.
* Store block meta: {id, sectionId, startOffset, length, elementRef}.
* Build a second Map for phrases which uses a rolling ngram index of size 3 for substring search when quotes are used.
* Defer heavy work with requestIdleCallback, processing chunks of K blocks to keep TTI snappy.

## Query evaluation

* Parse into tokens and phrases.
* For tokens, intersect the posting lists.
* For phrase terms, post filter candidate blocks by substring search over the cached normalized block text.
* If the result set is under a threshold like 200 blocks, apply context escalation to include their section heading and up to X sibling blocks on either side when present.
* Update result count and toggle .sg-hidden on all blocks in a batched write inside requestAnimationFrame.

## Debounce and throttling

* Debounce keystrokes with a 200 ms timer. Restart on input events.
* While a search is running, show a small inline spinner in the input.
* Use a micro task queue to interleave long result sets: apply visibility toggles in batches of 500 nodes per frame.

## State and shareability

* Persist query, onlyMatches toggle, and context settings to window\.location.hash using a compact encoding q=...,m=1,c=0.
* On load, parse hash and reapply the filter.

## Keyboard and pointer UX

* Press / to focus the search input.
* Press Esc to clear and blur.
* Press Enter to jump to the first visible matched block.
* Click on the result counter to scroll to the top.

## Error handling and telemetry

* No network telemetry. Log warnings to console only when URL has sglog=1.
* Guard all DOM writes in try blocks.

## Browser support

* Modern evergreen browsers. requestIdleCallback is optional. Feature detect.
* No ES module syntax. Use an IIFE and only ES5 compatible constructs plus querySelectorAll.

## Security considerations

* No eval and no dynamic script injection other than the single static include.
* All HTML inserted is authored by us and uses text nodes. Highlight spans are created via text splitting, not innerHTML.

## Minimal code skeleton

Only example! Implementer must use their own judgment and change or keep parts as needed.

```js
/* c99-semgrep.js */
(function(){
  "use strict";

  var SG = {
    blocks: [],
    index: new Map(),
    textCache: [],
    sectionOf: [],
    ready: false
  };

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  function injectCSS(){
    var css =
      "#sg-root{position:fixed;top:0;left:0;right:0;z-index:9999;font:14px system-ui,Segoe UI,Arial,sans-serif;background:#fff;border-bottom:1px solid #ddd}"+
      ".sg-wrap{max-width:1200px;margin:0 auto;padding:8px}"+
      ".sg-input{width:60%;padding:6px 8px;border:1px solid #bbb;border-radius:4px}"+
      ".sg-btn{margin-left:8px}"+
      ".sg-counter{margin-left:12px;opacity:.7}"+
      ".sg-hidden{display:none !important}"+
      ".sg-mark{background:rgba(255,235,130,.9);outline:1px solid rgba(0,0,0,.1)}";
    var style = document.createElement("style");
    style.id = "sg-style";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function injectBar(){
    var root = document.createElement("div");
    root.id = "sg-root";
    var wrap = document.createElement("div");
    wrap.className = "sg-wrap";
    wrap.innerHTML =
      "<input id='sg-q' class='sg-input' type='search' placeholder='Search C99...' aria-label='Semantic grep' />"+
      "<button id='sg-only' class='sg-btn' aria-pressed='true' title='Toggle only matches'>Only matches</button>"+
      "<button id='sg-clear' class='sg-btn'>Clear</button>"+
      "<span id='sg-counter' class='sg-counter'></span>";
    root.appendChild(wrap);
    document.body.appendChild(root);
    requestAnimationFrame(function(){
      var barH = root.getBoundingClientRect().height;
      document.body.style.paddingTop = barH + "px";
    });
  }

  function collect(){
    var headings = $all("h1,h2,h3,h4,h5,h6");
    var blocks = $all("p,pre,dl,table,ol,ul");
    var sectionIdOfNode = new Map();
    var current = 0, i;

    for(i=0;i<headings.length;i++){
      sectionIdOfNode.set(headings[i], i);
    }
    // Walk DOM order and assign section ids
    var all = $all("body *");
    for(i=0;i<all.length;i++){
      var n = all[i];
      if(sectionIdOfNode.has(n)) current = sectionIdOfNode.get(n);
      if(n.matches && n.matches("p,pre,dl,table,ol,ul")){
        SG.blocks.push(n);
        SG.sectionOf.push(current);
      }
    }
  }

  function tokenize(s){
    return s.toLowerCase().match(/[a-z0-9_]+/g) || [];
  }

  function buildIndex(){
    SG.textCache = new Array(SG.blocks.length);
    for(var i=0;i<SG.blocks.length;i++){
      var t = SG.blocks[i].textContent.replace(/\s+/g," ").trim().toLowerCase();
      SG.textCache[i] = t;
      var seen = new Set();
      tokenize(t).forEach(function(tok){
        if(seen.has(tok)) return;
        seen.add(tok);
        var arr = SG.index.get(tok);
        if(!arr){ arr = []; SG.index.set(tok, arr); }
        arr.push(i);
      });
    }
    SG.ready = true;
  }

  function query(q){
    var tokens = [];
    var phrases = [];
    q = q.trim();
    if(!q){ return showAll(); }
    q.replace(/"([^"]+)"/g, function(_,ph){ phrases.push(ph.toLowerCase()); return " "; });
    tokenize(q).forEach(function(t){ tokens.push(t); });

    var cand = null;
    tokens.forEach(function(t){
      var list = SG.index.get(t) || [];
      if(cand===null) cand = new Set(list);
      else {
        var next = new Set();
        list.forEach(function(id){ if(cand.has(id)) next.add(id); });
        cand = next;
      }
    });
    if(cand===null) cand = new Set(SG.textCache.map(function(_,i){ return i; }));

    var ids = Array.from(cand);
    if(phrases.length){
      ids = ids.filter(function(id){
        var text = SG.textCache[id];
        for(var j=0;j<phrases.length;j++){
          if(text.indexOf(phrases[j])===-1) return false;
        }
        return true;
      });
    }
    render(ids);
  }

  function render(visibleIds){
    var vis = new Uint8Array(SG.blocks.length);
    for(var i=0;i<visibleIds.length;i++){ vis[visibleIds[i]] = 1; }
    // Context escalation: keep section heading siblings near matches
    // Minimal v1: ensure heading element of each matched block remains visible
    for(var i=0;i<visibleIds.length;i++){
      var sec = SG.sectionOf[visibleIds[i]];
      // find the first block that belongs to this section and mark it visible
      // and ensure the nearest preceding heading remains visible via CSS toggle on heading parent
    }
    batchToggle(vis);
  }

  function batchToggle(vis){
    var total = SG.blocks.length, shown = 0;
    for(var i=0;i<total;i++){
      var el = SG.blocks[i];
      var on = !!vis[i];
      if(on){ shown++; el.classList.remove("sg-hidden"); }
      else el.classList.add("sg-hidden");
    }
    $("#sg-counter").textContent = shown + " shown of " + total;
  }

  function showAll(){
    var total = SG.blocks.length;
    for(var i=0;i<total;i++){ SG.blocks[i].classList.remove("sg-hidden"); }
    $("#sg-counter").textContent = total + " shown of " + total;
  }

  function main(){
    injectCSS();
    injectBar();
    collect();
    buildIndex();

    var input = $("#sg-q");
    var only = $("#sg-only");
    var clear = $("#sg-clear");
    var timer = 0;
    function onInput(){
      window.clearTimeout(timer);
      timer = window.setTimeout(function(){ query(input.value); }, 200);
    }
    input.addEventListener("input", onInput);
    clear.addEventListener("click", function(){ input.value=""; showAll(); input.focus(); });
    only.addEventListener("click", function(){
      var pressed = this.getAttribute("aria-pressed")==="true";
      this.setAttribute("aria-pressed", String(!pressed));
      document.body.classList.toggle("sg-only", !pressed);
    });
    document.addEventListener("keydown", function(e){
      if(e.key==="/"){ e.preventDefault(); input.focus(); }
      if(e.key==="Escape"){ input.value=""; showAll(); input.blur(); }
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", main);
  else main();

})();
```

## Acceptance criteria

* Only one new tag is added to the HTML: a defer script tag referencing c99-semgrep.js.
* With no query, the document renders exactly as before except for the fixed search bar.
* Typing printf updates the view within an acceptable debounce window and shows whole blocks and their headings that contain the term. The Library formatted I/O section 7.19.6 is discoverable by searching printf, snprintf, or vsnprintf. ([port70.net][1])
* Clearing the input restores the full document.
* The URL hash reflects the current query and toggles.
* All injected UI is accessible via keyboard and screen reader labels.
* No external network requests are made.

## Test plan

* Load performance on a cold cache and verify the bar appears quickly.
* Functional tests for single token, multi token, and quoted phrase.
* Case sensitivity checks for printf vs PRINTF.
* Large result set behavior for common tokens like function.
* Debounce correctness while typing quickly.
* Accessibility checks for focus order and aria labels.
* Hash deep link reload with q and m parameters.
* Cross browser verification on Chromium, Firefox, WebKit.

## Rollout plan

* Ship c99-semgrep.js to the same server that serves the HTML.
* Add the single defer script tag to the HTML.
* Verify on a staging copy, then promote.

## Future extensions

* Optional worker for indexing if main thread budget is tight.
* Optional regex mode behind a toggle.
* Section summarization chips to jump between matches.

[1]: https://port70.net/~nsz/c/c99/n1256.html "WG14/N1256   Septermber 7, 2007  ISO/IEC 9899:TC3"
