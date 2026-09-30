/* Shared catalogue operations. Each application owns its visual layout and gestures. */
(() => {
  'use strict';
  const data = window.ILUD_DATA;
  const key = 'ilud.v1.' + document.body.dataset.app;
  let stored = {};
  let storageOK = true;
  try { stored = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { storageOK = false; }
  const validIds = new Set(data.entries.map(e => e.id));
  const ids = value => Array.isArray(value) ? value.filter(x => validIds.has(x)) : [];
  const state = {saved: ids(stored.saved), recent: ids(stored.recent), flagged: ids(stored.flagged), sound: stored.sound === true, still: stored.still === true};
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => media.matches || state.still;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iconPaths = {
    Search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
    Social:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5v2"/>',
    Writing:'<path d="m4 17-1 5 5-1L21 8l-4-4ZM14 7l4 4M5 17l3 3"/>',
    Images:'<rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8" cy="8" r="1.5"/><path d="m4 19 6-7 4 4 3-4 4 6"/>',
    Shopping:'<path d="M3 3h3l3 13h11l2-9H7M10 20h.01M19 20h.01"/><circle cx="10" cy="20" r="1"/><circle cx="19" cy="20" r="1"/>',
    Browsing:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
    saved:'<path d="M6 3h12v19l-6-4-6 4Z"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>',
    arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>', left:'<path d="M20 12H5m6-6-6 6 6 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
    sound:'<path d="M4 9h4l5-5v16l-5-5H4ZM17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="M3 9h4l5-5v16l-5-5H3Zm13 0 6 6m0-6-6 6"/>',
    phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
    shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 9 3 3 5-5"/>',
    off:'<path d="M12 2v10m-5-7a9 9 0 1 0 10 0"/>',
    avoid:'<path d="M2 12S6 5 12 5s10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    replace:'<path d="M21 8a9 9 0 0 0-15-3L3 8m0-6v6h6M3 16a9 9 0 0 0 15 3l3-3m0 6v-6h-6"/>',
    human:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
    Video:'<circle cx="12" cy="12" r="9"/><path d="m10 7 7 5-7 5Z"/>',
    check:'<path d="m5 12 4 4L20 5"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    tune:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>'
  };
  const icon = (name,cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.info}</svg>`;
  const groups = ['Search','Social','Writing','Images','Shopping','Browsing'];
  const preferred = {Search:'google-web',Social:'reddit-feed',Writing:'docs-compose',Images:'unsplash',Shopping:'shop-web',Browsing:'firefox-ai'};
  const get = id => data.entries.find(e => e.id === id) || data.entries[0];
  const group = name => data.entries.filter(e => e.group === name);
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); storageOK = true; }
    catch (_) { storageOK = false; toast('Saved for this visit only. Browser storage is unavailable.'); }
  }
  let toastTimer;
  function toast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    const dialog = document.getElementById('sheet');
    (dialog?.open ? dialog : document.body).appendChild(el);
    el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
  }
  let audio;
  let lastTone = 0;
  function tick(freq = 520) {
    if (!state.sound || performance.now()-lastTone < 65) return;
    lastTone = performance.now();
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio ||= new Audio();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
      const o = audio.createOscillator(), gain = audio.createGain(), time = audio.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(freq,time); o.frequency.exponentialRampToValueAtTime(freq*.6,time+.035);
      gain.gain.setValueAtTime(.0001,time); gain.gain.exponentialRampToValueAtTime(.035,time+.004); gain.gain.exponentialRampToValueAtTime(.0001,time+.055);
      o.connect(gain); gain.connect(audio.destination); o.start(time); o.stop(time+.065);
      o.onended = () => {o.disconnect();gain.disconnect();};
    } catch (_) { /* Sound is optional; silence must never block an action. */ }
  }
  function motionClass() { document.documentElement.classList.toggle('still', reduced()); }
  media.addEventListener?.('change', motionClass); motionClass();
  const brand = (small=false) => `<div class="brand ${small?'small':''}" aria-label="ILUD, tools for a quieter internet"><span>ILUD</span><small>ILUDIST</small></div>`;
  const button = (label,attr='',cls='primary') => `<button class="${cls}" ${attr}>${label}</button>`;
  function header() { return `<header class="app-header"><button class="icon-button" data-catalog aria-label="Browse all fixes">${icon('menu')}</button>${brand()}<button class="icon-button" data-settings aria-label="Preferences and information">${icon('tune')}</button></header>`; }
  const dock = () => `<nav class="dock" aria-label="Quick access"><button data-catalog>${icon('Search')}<span>All fixes</span></button><button data-saved>${icon('saved')}<span>Saved <b class="saved-count">${state.saved.length || ''}</b></span></button><button data-settings>${icon('info')}<span>Info</span></button></nav>`;
  const actionLabel = e => e.kind === 'guide' ? 'Show me how' : e.kind === 'query' ? 'Use this fix' : 'Explore this option';
  const compatibility = e => e.platforms.includes('ios') ? 'iPhone' : e.platforms.includes('android') ? 'Android' : 'Desktop';
  const reviewDue = e => Date.now() - Date.parse(e.sourceReviewed+'T00:00:00Z') > e.reviewAfterDays*86400000;
  const status = e => state.flagged.includes(e.id) ? 'Marked for review' : reviewDue(e) ? 'Review due' : e.status;
  function card(e,cls='') {
    return `<article class="fix-card ${cls}" data-entry="${e.id}"><div class="card-kicker"><span>${esc(e.service)} / ${esc(e.category)}</span><button class="icon-button save-button" data-save="${e.id}" aria-label="${state.saved.includes(e.id)?'Unsave':'Save'} ${esc(e.title)}" aria-pressed="${state.saved.includes(e.id)}">${icon('saved')}</button></div><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><button class="primary" data-open="${e.id}">${actionLabel(e)} ${icon('arrow')}</button><div class="card-meta"><span>${icon('phone')}${compatibility(e)}</span><span>${icon(e.install==='none'?'shield':'info')}${e.install==='none'?'No install':e.install==='optional'?'App or web':'Install '+e.install}</span><span>${esc(status(e))}</span></div></article>`;
  }
  function tabs(active,cls='') { return `<nav class="category-tabs ${cls}" aria-label="Choose a tool">${groups.map(g=>`<button data-group="${g}" class="${g===active?'active':''}" aria-pressed="${g===active}">${icon(g)}<span>${g}</span></button>`).join('')}</nav>`; }
  const more = (g) => `<button class="text-button" data-catalog="${g}">Explore all ${group(g).length} ${g.toLowerCase()} fixes ${icon('arrow')}</button>`;
  function mount(html) {
    document.getElementById('app').innerHTML = html;
    document.body.insertAdjacentHTML('beforeend','<dialog id="sheet" aria-labelledby="sheet-title"><div class="sheet-head"><button id="sheet-back" class="icon-button" aria-label="Back to results" hidden>'+icon('left')+'</button><h2 id="sheet-title"></h2><button class="icon-button" data-close aria-label="Close">'+icon('close')+'</button></div><div id="sheet-body"></div></dialog><div id="toast" role="status" aria-live="polite"></div><div id="announce" class="sr-only" role="status" aria-live="polite"></div>');
    const dialog = document.getElementById('sheet');
    dialog.addEventListener('click',e=>{if(e.target===dialog) { const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(); }});
    dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');dialog.removeAttribute('data-page');returnFocus?.focus?.({preventScroll:true});});
  }
  let returnFocus;
  let back = null;
  function show(title,html,backFn=null) {
    const dialog = document.getElementById('sheet');
    if (!dialog.open) returnFocus = document.activeElement;
    const heading=document.getElementById('sheet-title');
    heading.textContent = title;
    heading.tabIndex=-1;
    document.getElementById('sheet-body').innerHTML = html;
    const b = document.getElementById('sheet-back'); b.hidden = !backFn; back = backFn;
    document.body.classList.add('modal-open');
    if (!dialog.open) dialog.showModal();
    document.getElementById('sheet-body').scrollTop=0;
    heading.focus({preventScroll:true});
  }
  function close() { document.getElementById('sheet').close(); }
  function announce(text) {document.getElementById('announce').textContent=text;}
  function save(id) {
    if(!validIds.has(id))return;
    const exists = state.saved.includes(id);
    state.saved = exists ? state.saved.filter(x=>x!==id) : [...state.saved,id];
    persist(); tick(); updateSaves();
    toast(exists?'Removed from saved fixes.':storageOK?'Saved on this device.':'Saved for this visit only.');
    document.dispatchEvent(new CustomEvent('ilud:saved'));
  }
  function updateSaves() {
    document.querySelectorAll('[data-save]').forEach(b=>{const yes=state.saved.includes(b.dataset.save);b.setAttribute('aria-pressed',yes);b.setAttribute('aria-label',(yes?'Unsave ':'Save ')+get(b.dataset.save).title); if(b.classList.contains('save-text'))b.innerHTML=icon('saved')+(yes?'Saved':'Save fix');});
    document.querySelectorAll('.saved-count').forEach(el=>el.textContent=state.saved.length||'');
  }
  function markUsed(id) {state.recent = [id,...state.recent.filter(x=>x!==id)].slice(0,8);persist();}
  function buildURL(e,q='') {
    const url = new URL(e.url);
    const query = q.trim();
    switch(e.query){
      case 'google':url.searchParams.set('q',query);url.searchParams.set('udm','14');break;
      case 'duck':url.searchParams.set('q',query);break;
      case 'images':url.searchParams.set('q',query);url.searchParams.set('ia','images');url.searchParams.set('iax','images');break;
      case 'mojeek':url.searchParams.set('q',query);break;
      case 'unsplash':url.pathname='/s/photos/'+encodeURIComponent(query);break;
      case 'osm':url.searchParams.set('query',query);break;
      case 'voyage':url.searchParams.set('search',query);break;
      case 'wordreference':url.pathname='/definition/'+encodeURIComponent(query);break;
    }
    return url.href;
  }
  function detail(id,backFn=null) {
    const e=get(id), saved=state.saved.includes(id), sourceHTML=e.sources.map(s=>{const v=data.sources[s];return `<a class="source-link" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ${icon('arrow')}</a><small>${esc(v.evidence)}</small>`;}).join('');
    const query = e.kind==='query';
    const label = e.query==='osm'?'Place or address':e.query==='voyage'?'Destination':e.query==='wordreference'?'English word':'What would you like to find?';
    show(e.service,`<section class="detail"><div class="eyebrow">${esc(e.category)} / ${esc(status(e))}</div><h3>${esc(e.title)}</h3><p class="lead">${esc(e.summary)}</p><div class="detail-tags"><span>${e.platforms.map(x=>({ios:'iPhone / iPad',android:'Android',desktop:'Desktop'})[x]).join(' · ')}</span><span>${e.install==='none'?'No installation':e.install==='optional'?'Web or optional app':'Requires '+e.install}</span></div>${query?`<form id="query-form" data-id="${e.id}"><label for="outgoing-query">${label}</label><div class="query-field">${icon('Search')}<input id="outgoing-query" name="q" required maxlength="500" autocomplete="off" enterkeyhint="search" placeholder="${e.query==='osm'?'Kyoto, Japan':e.query==='voyage'?'Lisbon':e.query==='wordreference'?'serendipity':'e.g. best coffee beans'}"></div><button class="primary" type="submit">Open ${esc(e.service)} ${icon('arrow')}</button><small>Your query is sent only when you open the destination.</small></form>`:`<div class="steps">${e.steps.map((s,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${esc(s)}</p></div>`).join('')}</div><a class="primary external-action" href="${esc(e.url)}" data-use="${e.id}" target="_blank" rel="noopener noreferrer">${e.kind==='guide'?'Open '+(e.url.includes('support.')?'official instructions':e.service):'Open '+e.service}${icon('arrow')}</a><small class="new-tab">Opens an external site in a new tab. Settings must be changed there.</small>`}<div class="detail-tools"><button class="secondary save-text" data-save="${e.id}" aria-pressed="${saved}">${icon('saved')}${saved?'Saved':'Save fix'}</button><button class="secondary" data-copy="${e.id}">Copy ${query?'prepared link':'link'}</button></div><aside class="limit"><strong>What to expect</strong><p>${esc(e.caveat)}</p></aside><details ${state.flagged.includes(id)?'open':''}><summary>How it works and sources</summary><p>${esc(e.mechanism)}</p>${query?`<div class="steps">${e.steps.map((s,i)=>`<div><span>${i+1}</span><p>${esc(s)}</p></div>`).join('')}</div>`:''}<p class="review-note">Sources reviewed ${e.sourceReviewed}. No hands-on service test was performed. ${reviewDue(e)?'This entry is due for another source review.':'Settings and external pages can change.'}</p><div class="sources">${sourceHTML}</div><label for="destination-url">Destination preview</label><input id="destination-url" class="url-preview" readonly value="${esc(e.url)}"><button class="text-button" data-flag="${e.id}">${state.flagged.includes(e.id)?'Remove my review flag':'Mark as needing review on this device'}</button></details><div class="alternatives"><h4>Another way</h4>${data.entries.filter(x=>x.group===e.group&&x.id!==e.id).slice(0,2).map(x=>`<button data-open="${x.id}">${esc(x.title)}${icon('arrow')}</button>`).join('')}</div></section>`,backFn);
    document.getElementById('sheet').dataset.page='detail';
    const input=document.getElementById('outgoing-query');
    if(input){input.addEventListener('input',()=>{document.getElementById('destination-url').value=buildURL(e,input.value);});}
  }
  const browseState={mode:'all',q:'',category:'All',platform:'any',method:'all'};
  const stopWords=new Set('i me my want to a an the with without less more no please find use normal ordinary stop remove turn off for of in and results ai'.split(' '));
  function score(e,q){
    let normalized=q.toLowerCase();
    const synonyms={photos:'images',pictures:'images',photographs:'images',email:'gmail',videos:'youtube',shorts:'unhook',forecast:'weather',translate:'translation',directions:'maps',newsfeed:'social',summaries:'summary',autocompletion:'compose'};
    const tokens=normalized.split(/\W+/).filter(t=>t&&!stopWords.has(t));
    if(!tokens.length)return q.trim()?1:1;
    const hay=(e.tags+' '+e.caveat+' '+e.mechanism).toLowerCase();
    return tokens.reduce((n,t)=>n+(hay.includes(t)?3:hay.includes(synonyms[t]||'\u0000')?2:0),0);
  }
  function browse(mode='all',category='All',preserve=false){
    if(!preserve){Object.assign(browseState,{mode,q:'',category,platform:'any',method:'all'});}
    const title=mode==='saved'?'Your saved fixes':mode==='recent'?'Recently opened':'Find your fix';
    show(title,`<section class="catalogue"><label class="sr-only" for="catalog-query">Search by purpose, service, or category</label><div class="query-field">${icon('Search')}<input id="catalog-query" type="search" autocomplete="off" placeholder="Try: normal search, photos, maps" value="${esc(browseState.q)}"></div><div class="catalog-modes"><button data-mode="all" aria-pressed="${mode==='all'}">All ${data.entries.length}</button><button data-mode="saved" aria-pressed="${mode==='saved'}">Saved ${state.saved.length}</button><button data-mode="recent" aria-pressed="${mode==='recent'}">Recent</button></div><div class="filter-grid"><label>Everyday task<select id="filter-category"><option>All</option>${[...new Set([...groups,...data.entries.map(e=>e.category)])].sort().map(c=>`<option ${c===browseState.category?'selected':''}>${c}</option>`).join('')}</select></label><label>Device<select id="filter-platform"><option value="any">Any device</option><option value="ios">iPhone / iPad</option><option value="android">Android</option><option value="desktop">Desktop</option></select></label><label>Approach<select id="filter-method"><option value="all">Any approach</option><option value="off">Turn it off</option><option value="avoid">Avoid it</option><option value="replace">Use another tool</option><option value="human">Find original sources</option></select></label></div><div class="result-heading"><span id="result-count" role="status"></span><button class="text-button" id="clear-filters">Reset filters</button></div><div id="catalog-results"></div></section>`);
    document.getElementById('sheet').dataset.page='catalog';
    document.getElementById('filter-platform').value=browseState.platform;
    document.getElementById('filter-method').value=browseState.method;
    document.getElementById('catalog-query').addEventListener('input',e=>{browseState.q=e.target.value;results();});
    for(const [el,field] of [['filter-category','category'],['filter-platform','platform'],['filter-method','method']])document.getElementById(el).addEventListener('change',e=>{browseState[field]=e.target.value;results();});
    document.getElementById('clear-filters').onclick=()=>browse(mode);
    results();
  }
  function results(){
    const b=browseState;
    let entries=b.mode==='saved'?state.saved.map(get):b.mode==='recent'?state.recent.map(get):data.entries;
    entries=entries.filter(e=>(b.category==='All'||e.group===b.category||e.category===b.category)&&(b.platform==='any'||e.platforms.includes(b.platform))&&(b.method==='all'||e.route===b.method)).map(e=>({e,score:score(e,b.q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.e);
    document.getElementById('result-count').textContent=`${entries.length} ${entries.length===1?'way':'ways'} forward`;
    document.getElementById('catalog-results').innerHTML=entries.length?entries.map(e=>`<article class="catalog-row"><button class="row-open" data-open="${e.id}" data-from-catalog><span class="row-icon">${icon(e.group)}</span><span><small>${esc(e.service)} / ${esc(e.category)}</small><strong>${esc(e.title)}</strong><span class="row-summary">${esc(e.summary)}</span><em>${esc(status(e))}${e.install==='extension'?' · Desktop extension':''}</em></span>${icon('arrow')}</button><button class="icon-button" data-save="${e.id}" aria-label="Save ${esc(e.title)}" aria-pressed="${state.saved.includes(e.id)}">${icon('saved')}</button></article>`).join(''):`<div class="empty">${icon('Search')}<h3>${b.mode==='saved'?'Your travelling case is empty.':b.mode==='recent'?'No destinations opened yet.':'No exact match yet.'}</h3><p>${b.mode==='saved'?'Save a useful fix with its bookmark button.':b.mode==='recent'?'A fix appears here when you open its destination.':'Try a service name, a broader task, or reset the filters.'}</p><button class="secondary" data-mode="all">Explore all fixes</button></div>`;
    updateSaves();
  }
  function settings(){
    show('About your ILUD',`<section class="settings"><div class="eyebrow">Practical agency, quietly.</div><h3>A quieter internet.<br>Your own way.</h3><p>ILUD connects everyday intentions to useful settings, simpler tools, and original sources. It cannot change another app's settings for you.</p><div class="setting-row"><div><strong>Quiet sound</strong><small>A soft click when you choose. Off by default.</small></div><button class="toggle" id="sound-toggle" role="switch" aria-checked="${state.sound}" aria-label="Quiet sound">${state.sound?'On':'Off'}</button></div><div class="setting-row"><div><strong>Less movement</strong><small>${media.matches?'Your device already requests reduced motion.':'Reduce transitions and remove momentum.'}</small></div><button class="toggle" id="motion-toggle" role="switch" aria-checked="${state.still||media.matches}" aria-label="Less movement" ${media.matches?'disabled':''}>${reduced()?'On':'Off'}</button></div><h4>What the labels mean</h4><p><strong>Documented</strong> means the linked publisher describes the feature. <strong>Unofficial shortcut</strong> means a useful implementation is not a guaranteed API.</p><p>Sources reviewed September 29, 2026. External services were not tested end to end. Entries become marked Review due after 90 days, and your review flags stay local.</p><h4>Private by construction</h4><p>No account, analytics, tracking scripts, or permissions. Searches in this catalogue stay in your browser. An outgoing search is sent to its destination when you choose to open it. Saved fixes and recent entry IDs stay on this device; query text is not saved.</p><p>Local storage: ${storageOK?'available':'unavailable; changes last for this visit'}.</p><details><summary>About the illustrations</summary><p>The decorative cabinet, island map, and landscape were AI-generated to interpret the supplied art direction. They are not examples of human-made catalogue content. No image-generation service is contacted by this app.</p></details><details><summary>What about unusual Google tricks?</summary><p>Query suffixes, including the Russian profanity example in the brief, were considered. The research did not establish reproducibility for that exact token. ILUD uses the documented Web view and labels its URL shortcut as unofficial. It does not silently modify the meaning of your search.</p></details><button class="secondary danger" id="reset-local">Clear saved fixes and recent actions</button><p class="micro">Only this design's local records are affected. Your external accounts are never changed.</p></section>`);
    document.getElementById('sheet').dataset.page='settings';
    document.getElementById('sound-toggle').onclick=e=>{state.sound=!state.sound;persist();e.currentTarget.textContent=state.sound?'On':'Off';e.currentTarget.setAttribute('aria-checked',state.sound);tick();};
    document.getElementById('motion-toggle').onclick=e=>{state.still=!state.still;persist();motionClass();e.currentTarget.textContent=reduced()?'On':'Off';e.currentTarget.setAttribute('aria-checked',reduced());document.dispatchEvent(new CustomEvent('ilud:motion'));};
    document.getElementById('reset-local').onclick=()=>show('Clear local records?',`<section class="settings"><h3>Empty this travelling case?</h3><p>This clears ${state.saved.length} saved fixes, recent entry IDs, and your local review flags for this design. Sound and movement preferences are kept.</p><button class="primary" id="confirm-clear">Clear local records</button><button class="secondary" data-settings>Keep my records</button></section>`,settings);
  }
  function swipe(el,next,previous){
    let start=null;
    el.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('button,a,input,select,summary'))return;start={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};el.setPointerCapture(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>Math.abs(dy)&&!reduced())el.style.setProperty('--swipe',Math.max(-100,Math.min(100,dx))+'px');});
    const end=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;const moved=Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4;start=null;el.style.removeProperty('--swipe');if(e.type==='pointerup'&&moved){tick();dx<0?next():previous();}};
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  }
  async function copy(id){
    const e=get(id), input=document.getElementById('outgoing-query');
    if(e.kind==='query'&&!input?.value.trim()){input?.focus();toast('Enter a query first to prepare your link.');return;}
    const url=buildURL(e,input?.value||'');
    try {if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(url);toast('Link copied.');}
    catch(_){const preview=document.getElementById('destination-url');preview.value=url;preview.closest('details').open=true;preview.focus();preview.select();toast('Select and copy the destination link.');}
  }
  document.addEventListener('click',e=>{
    const t=e.target.closest('button,a'); if(!t)return;
    if(t.id==='sheet-back'){back?.();return;}
    if(t.id==='confirm-clear'){state.saved=[];state.recent=[];state.flagged=[];persist();updateSaves();document.dispatchEvent(new CustomEvent('ilud:saved'));settings();toast('Local records cleared.');return;}
    if(t.hasAttribute('data-close')){close();return;}
    if(t.hasAttribute('data-settings')){settings();return;}
    if(t.hasAttribute('data-catalog')){browse('all',t.dataset.catalog||'All');return;}
    if(t.hasAttribute('data-saved')){browse('saved');return;}
    if(t.dataset.mode){browse(t.dataset.mode);return;}
    if(t.dataset.save){save(t.dataset.save);if(document.getElementById('sheet').dataset.page==='catalog')results();return;}
    if(t.dataset.open){tick();const fromCatalog=t.hasAttribute('data-from-catalog');detail(t.dataset.open,fromCatalog?()=>browse(browseState.mode,browseState.category,true):null);return;}
    if(t.dataset.use){markUsed(t.dataset.use);return;}
    if(t.dataset.copy){copy(t.dataset.copy);return;}
    if(t.dataset.flag){const id=t.dataset.flag;state.flagged=state.flagged.includes(id)?state.flagged.filter(x=>x!==id):[...state.flagged,id];persist();t.textContent=state.flagged.includes(id)?'Remove my review flag':'Mark as needing review on this device';toast('Local review flag updated.');return;}
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='query-form')return;e.preventDefault();
    const input=e.target.querySelector('input'),q=input.value.trim();
    if(!q){input.setCustomValidity('Enter something to search for.');input.reportValidity();input.oninput=()=>input.setCustomValidity('');return;}
    input.setCustomValidity('');const entry=get(e.target.dataset.id);markUsed(entry.id);
    // Same-tab navigation is reliable on mobile and preserves a browser Back path.
    location.assign(buildURL(entry,q));
  });
  window.ILUD={data,state,esc,icon,groups,preferred,get,group,brand,header,dock,button,card,tabs,more,mount,detail,browse,settings,tick,toast,announce,reduced,swipe,updateSaves,buildURL};
})();
