export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const paths = {
  search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
  social:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 5a3 3 0 0 1 0 6m2 3a6 6 0 0 1 3 5v2"/>',
  writing:'<path d="m4 17 12-13 4 4L8 21l-5 1 1-5Zm10-11 4 4M4 17l4 4"/>',
  images:'<rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8" cy="8" r="1.5"/><path d="m4 19 6-7 4 4 3-3 4 5"/>',
  shopping:'<path d="M5 8h14l2 13H3L5 8Zm3 0V6a4 4 0 0 1 8 0v2"/>',
  browsing:'<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4.5" ry="10"/><path d="M2 12h20M4 6h16M4 18h16"/>',
  video:'<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
  reading:'<path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-3-1-7-2-10 1Zm0 0v16"/>',
  translation:'<path d="M2 5h12M8 2v3M4 5c0 6 4 9 9 10M12 5c-1 6-5 10-10 12m12 4 4-12 4 12m-7-4h6"/>',
  maps:'<path d="m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3V5Zm7-3v17m6-14v17"/>',
  weather:'<circle cx="12" cy="12" r="5"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  utilities:'<path d="m4 3 5 4-2 4-4-2 1-6Zm4 8 11 11 3-3L11 8M16 4a5 5 0 0 1 6-1l-4 4 1 3 3 1a5 5 0 0 1-7 4l-9 9-4-4 9-9a5 5 0 0 1 5-7Z"/>',
  saved:'<path d="M6 3h12v19l-6-4-6 4V3Z"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 10v7m0-11v1"/>',
  arrow:'<path d="M3 12h18m-7-7 7 7-7 7"/>',
  back:'<path d="M21 12H3m7-7-7 7 7 7"/>',
  close:'<path d="m5 5 14 14M5 19 19 5"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
  sound:'<path d="m3 9 5 0 5-5v16l-5-5H3V9Zm14-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',
  off:'<path d="M12 2v10M7 5a9 9 0 1 0 10 0"/>',
  avoid:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>',
  replace:'<path d="M20 8A8 8 0 0 0 6 5L3 8m0-6v6h6m-5 8a8 8 0 0 0 14 3l3-3m0 6v-6h-6"/>',
  star:'<path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z"/>',
  menu:'<path d="M3 5h18M3 12h18M3 19h18"/>',
  minus:'<path d="M5 12h14"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  copy:'<rect x="8" y="7" width="13" height="15" rx="2"/><path d="M16 7V2H3v15h5"/>'
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
}
export const intents = {off:'Turn it off',avoid:'Find a way around',replace:'Use something else'};
export const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
export function animate(node, frames, options) {
  if (motion()) return node.animate(frames, options);
}
export async function createApp(id) {
  const response = await fetch('./catalogue.json');
  if (!response.ok) throw new Error(`The catalogue could not be loaded (${response.status}). Reload the page to try again.`);
  const catalogue = await response.json();
  const {entries, categories} = catalogue;
  const key = `ilud.${id}.v1`;
  let memory = {saved:[],recent:[],sound:false}, storageWarned = false, audio;
  const toastNode = document.createElement('div');
  toastNode.className = 'toast'; toastNode.setAttribute('role', 'status'); document.body.append(toastNode);
  let toastTimer;
  function toast(text) {
    toastNode.textContent = text; toastNode.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastNode.classList.remove('visible'), 5000);
  }
  function storageError(error) {
    console.warn('ILUD storage unavailable:', error);
    if (!storageWarned) { setTimeout(() => toast('Browser storage is unavailable. Changes will last only until this page closes.'), 800); storageWarned = true; }
  }
  try {
    const raw = localStorage.getItem(key);
    let saved;
    try { saved = JSON.parse(raw || 'null'); }
    catch (error) {
      console.warn('ILUD saved data could not be read:', error);
      setTimeout(() => toast('Saved data could not be read. This session starts with an empty case; saving a fix will replace the damaged data.'), 800);
    }
    if (saved) {
      const validIds = list => Array.isArray(list) ? [...new Set(list.filter(v => typeof v === 'string' && entries.some(e => e.id === v)))] : [];
      memory = {saved:validIds(saved.saved),recent:validIds(saved.recent).slice(0,8),sound:saved.sound === true};
    }
  } catch (error) { storageError(error); }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(memory)); } catch (error) { storageError(error); }
    document.dispatchEvent(new CustomEvent('ilud:state'));
  }
  async function sound() {
    if (!memory.sound) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('This browser does not provide Web Audio.');
      audio ||= new Context();
      if (audio.state === 'suspended') await audio.resume();
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = id === 'folio' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(id === 'dial' ? 460 : 640, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(180, audio.currentTime + .035);
      gain.gain.setValueAtTime(.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .06);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + .065);
    } catch (error) {
      console.warn('ILUD audio could not start:', error);
      memory.sound = false; persist(); toast('Sound is unavailable in this browser. All controls still work.');
    }
  }
  async function toggleSound() {
    memory.sound = !memory.sound; persist();
    if (memory.sound) { await sound(); if (memory.sound) toast('Quiet interaction sounds on'); }
    else toast('Sound off');
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'remedy-dialog'; dialog.setAttribute('aria-labelledby','dialog-title');
  document.body.append(dialog);
  let returnFocus, view = null, libraryState = null, hashOwned = false;
  const closeButton = `<button class="close-dialog" data-close aria-label="Close">${icon('close')}</button>`;
  function shell(html, title) {
    if (!dialog.open) returnFocus = document.activeElement;
    dialog.innerHTML = `<div class="dialog-body">${closeButton}${html}</div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    const heading = $('#dialog-title', dialog);
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
    dialog.dataset.view = title;
  }
  function close() {
    dialog.close(); view = null; libraryState = null;
    if (location.hash.startsWith('#fix=')) {
      if (hashOwned) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    hashOwned = false;
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    }
  });
  function byId(entryId) { return entries.find(e => e.id === entryId); }
  function byCategory(category) { return entries.filter(e => e.category === category); }
  function search(query = '', options = {}) {
    const terms = query.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').split(/\s+/).filter(Boolean);
    return entries.filter(e => {
      const hay = `${e.title} ${e.short} ${e.service} ${e.summary} ${e.keywords} ${e.category}`.toLocaleLowerCase();
      return terms.every(t => hay.includes(t)) && (!options.category || e.category === options.category) &&
        (!options.intent || e.intent === options.intent) && (!options.mobile || e.mobile) &&
        (!options.noInstall || !e.install) && (!options.saved || memory.saved.includes(e.id));
    });
  }
  function urlFor(entry, phrase = '') {
    const url = new URL(entry.url);
    if (entry.query) {
      if (entry.query.path) url.pathname += encodeURIComponent(phrase.trim());
      else url.searchParams.set(entry.query.key, phrase.trim() + (entry.query.suffix || ''));
      for (const [key, value] of Object.entries(entry.query.params)) url.searchParams.set(key, value);
    }
    return url.href;
  }
  const reviewed = new Date(`${catalogue.reviewed}T12:00:00Z`);
  const stale = Date.now() - reviewed.getTime() > 90 * 86400000;
  function savedButton(entry) {
    const saved = memory.saved.includes(entry.id);
    return `<button class="secondary save-button" data-save="${entry.id}" aria-pressed="${saved}">${icon('saved')} ${saved ? 'Saved' : 'Save fix'}</button>`;
  }
  function resultHTML(entry) {
    return `<button class="library-result" data-fix="${entry.id}"><span class="result-symbol">${icon(entry.category)}</span><span><span class="eyebrow">${escapeHTML(entry.service)} <span class="result-status">${escapeHTML(entry.status)}</span></span><strong>${escapeHTML(entry.title)}</strong><small>${escapeHTML(entry.summary)}</small></span>${icon('arrow')}</button>`;
  }
  function showFix(entryId, updateHash = true) {
    const e = byId(entryId);
    if (!e) { toast('That fix is not in this edition of the catalogue.'); return; }
    if (updateHash && location.hash !== `#fix=${e.id}`) {
      const next = `#fix=${e.id}`;
      if (location.hash.startsWith('#fix=')) history.replaceState(null, '', next);
      else { history.pushState(null, '', next); hashOwned = true; }
    }
    view = {type:'fix',id:entryId};
    memory.recent = [e.id,...memory.recent.filter(v => v !== e.id)].slice(0,8); persist(); sound();
    const back = libraryState ? '<button class="text-button" data-library-back>Back to results</button>' : '';
    shell(`${back}<div class="detail-kicker">${icon(e.category)}<span class="eyebrow">${escapeHTML(e.service)} / ${escapeHTML(e.kind)}</span></div>
      <h2 id="dialog-title">${escapeHTML(e.title)}</h2><p class="detail-summary">${escapeHTML(e.summary)}</p>
      <div class="detail-facts"><span>${icon(e.mobile ? 'phone':'browsing')}${e.mobile ? 'Phone & web guidance':'Desktop guidance'}</span><span>${escapeHTML(e.cost)}</span><span>${e.install ? 'Installation needed':'No new install'}</span></div>
      <section class="action-well" aria-label="Use this fix">
      ${e.query ? `<form class="action-form" action="${e.url}" method="get" target="_blank">
        <label for="action-query">${escapeHTML(e.query.label)}</label><div class="action-input"><input id="action-query" name="${e.query.key || 'word'}" type="search" required maxlength="1000" placeholder="${escapeHTML(e.query.placeholder)}" autocomplete="off"><button class="primary" type="submit">Open ${escapeHTML(e.service)} ${icon('arrow')}</button></div><p class="micro">Opens prepared results in a new tab. Your words go to ${escapeHTML(new URL(e.url).hostname)} only when you open it.</p></form>` :
      `<a class="primary external-action" href="${e.url}" target="_blank" rel="noopener noreferrer">Open ${e.kind === 'Setting' || e.kind === 'Player setting' || e.kind === 'Browser feature' ? 'the guide / service' : escapeHTML(e.service)} ${icon('arrow')}</a><p class="micro">Opens in a new tab. ILUD cannot change another app's settings for you.</p>`}
      </section><div class="detail-actions">${savedButton(e)}<button class="secondary" data-copy="${e.id}">${icon('copy')} Copy fix link</button></div>
      <section><h3>What changes</h3><p>${escapeHTML(e.changes)}</p></section>
      <section><h3>Your next steps</h3><ol class="step-list">${e.steps.map((step,i) => `<li><label><input type="checkbox"><span><b>${String(i+1).padStart(2,'0')}</b>${escapeHTML(step)}</span></label></li>`).join('')}</ol></section>
      <aside class="caveat"><span class="eyebrow">${escapeHTML(e.status)} / Good to know</span><p>${escapeHTML(e.caveat)}</p></aside>
      <details><summary>How it works & sources</summary><p>${escapeHTML(e.mechanism)}</p><p class="micro">${stale ? 'Due for review. Last source review' : 'Source-reviewed'}: <time datetime="${catalogue.reviewed}">${catalogue.reviewed}</time>. Not independently live-tested on every device or account.</p><ul class="sources">${e.sources.map(s=>`<li><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)} <span aria-label="opens in new tab">&#8599;</span></a></li>`).join('')}</ul></details>
      <section class="alternatives"><h3>Another way</h3>${entries.filter(v => v.category === e.category && v.id !== e.id).slice(0,2).map(resultHTML).join('') || '<p>Browse all fixes for other approaches.</p>'}</section>`, 'fix');
    const form = $('.action-form', dialog);
    if (form) form.addEventListener('submit', event => {
      event.preventDefault();
      const phrase = $('#action-query',dialog).value.trim();
      if (!phrase) { $('#action-query',dialog).setCustomValidity('Enter a word or phrase first.'); $('#action-query',dialog).reportValidity(); return; }
      const link = document.createElement('a'); link.href = urlFor(e, phrase); link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
    });
    $('#action-query',dialog)?.addEventListener('input', event => event.target.setCustomValidity(''));
  }
  function showLibrary(options = {}) {
    if (location.hash.startsWith('#fix=')) history.replaceState(null, '', location.pathname + location.search);
    libraryState = {...options}; view = {type:'library'};
    shell(`<span class="eyebrow">The ILUDIST collection</span><h2 id="dialog-title">${options.saved ? 'Your saved fixes' : options.title || 'Find your next small fix'}</h2>
      <p>${options.saved ? 'A little travelling case of useful things. Saved only in this browser.' : 'Search a service, a task, or something you want less of.'}</p>
      <label class="library-search">${icon('search')}<input type="search" aria-label="Search fixes" placeholder="Try Google, email, images..." value="${escapeHTML(options.query || '')}"></label>
      <div class="library-filters"><label>Activity<select aria-label="Activity"><option value="">All activities</option>${categories.map(c=>`<option value="${c.id}" ${options.category === c.id ? 'selected':''}>${c.name}</option>`).join('')}</select></label><label>Approach<select aria-label="Approach"><option value="">Any approach</option>${Object.entries(intents).map(([key,value])=>`<option value="${key}" ${options.intent === key ? 'selected':''}>${value}</option>`).join('')}</select></label></div>
      <div class="filter-checks"><label><input type="checkbox" name="mobile" ${options.mobile ? 'checked':''}> Phone-friendly</label><label><input type="checkbox" name="no-install" ${options.noInstall ? 'checked':''}> No install</label></div>
      <p class="result-count micro" role="status"></p><div class="library-results"></div>`, 'library');
    function refresh() {
      libraryState = {...libraryState,query:$('.library-search input',dialog).value,category:$('[aria-label="Activity"]',dialog).value,intent:$('[aria-label="Approach"]',dialog).value,mobile:$('[name="mobile"]',dialog).checked,noInstall:$('[name="no-install"]',dialog).checked};
      const found = search(libraryState.query,libraryState);
      $('.result-count',dialog).textContent = `${found.length} ${found.length === 1 ? 'fix' : 'fixes'}${stale ? ' - source review due' : ''}`;
      $('.library-results',dialog).innerHTML = found.map(resultHTML).join('') || `<div class="empty-state">${icon('saved')}<h3>${options.saved && !memory.saved.length ? 'Your case is empty, for now.' : 'No matching fixes.'}</h3><p>${options.saved && !memory.saved.length ? 'Open any fix and choose Save fix to keep it here.' : 'Try a shorter phrase or clear the filters.'}</p><button class="secondary" data-reset-filters>Browse all fixes</button></div>`;
    }
    $('.library-search input',dialog).addEventListener('input',refresh);
    $$('.library-filters select, .filter-checks input',dialog).forEach(el => el.addEventListener('change',refresh)); refresh();
  }
  function showAbout() {
    view = {type:'about'};
    shell(`<span class="eyebrow">ILUD / ILUDIST</span><h2 id="dialog-title">A useful door to a quieter internet.</h2>
      <p>Not a verdict on AI. A little more choice in how your everyday tools behave.</p>
      <h3>${entries.length} considered fixes. Twelve everyday activities.</h3><p>Some turn a feature off. Some go around it. Some lead to a different service. Each explains what changes, what does not, and where the advice comes from.</p>
      <aside class="caveat"><h3>Honest about what we know</h3><p>${escapeHTML(catalogue.method)}</p><p>${stale ? 'This edition is due for another source review.' : 'Sources reviewed'}: ${catalogue.reviewed}.</p></aside>
      <h3>Private by design</h3><p>No accounts, trackers, analytics, or permission requests. Catalogue searches stay here. Saved fixes, recent choices, and sound preferences use this browser's storage only. External services receive information when you follow their links.</p>
      <h3>Make yourself comfortable</h3><p>Every gesture has a button or keyboard alternative. Reduced-motion settings are respected. Sound starts off and is never necessary.</p><button class="secondary" data-sound aria-pressed="${memory.sound}">${icon('sound')} Sound ${memory.sound ? 'on' : 'off'}</button>
      <h3>Your browser data</h3><button class="secondary" data-clear-data>Clear saved fixes and recent choices</button>
      <p class="micro">This edition is ${escapeHTML(id)}. Each interpretation stands on its own. Nothing is shared with the other editions at runtime.</p>`, 'about');
  }
  dialog.addEventListener('click', async event => {
    const el = event.target.closest('button');
    if (!el) return;
    if (el.hasAttribute('data-close')) close();
    if (el.dataset.fix) showFix(el.dataset.fix);
    if (el.hasAttribute('data-library-back')) showLibrary(libraryState || {});
    if (el.hasAttribute('data-reset-filters')) showLibrary();
    if (el.dataset.save) {
      const id = el.dataset.save;
      const saved = memory.saved.includes(id);
      memory.saved = saved ? memory.saved.filter(v=>v!==id) : [...memory.saved,id];
      persist(); sound();
      el.setAttribute('aria-pressed', String(!saved)); el.innerHTML = `${icon('saved')} ${saved ? 'Save fix':'Saved'}`;
      toast(saved ? 'Removed from your saved fixes' : 'Saved to this browser');
    }
    if (el.dataset.copy) {
      const link = new URL(location.href); link.hash = `fix=${el.dataset.copy}`;
      try { await navigator.clipboard.writeText(link.href); toast('Fix link copied'); }
      catch (error) {
        console.warn('ILUD clipboard unavailable:',error);
        let fallback = $('.copy-fallback',dialog);
        if (!fallback) { fallback = document.createElement('p'); fallback.className='copy-fallback'; $('.detail-actions',dialog).after(fallback); }
        fallback.textContent = `Automatic copy is unavailable. Select and copy this link: ${link.href}`;
        toast('Copy is unavailable. The selectable link is shown below the buttons.');
      }
    }
    if (el.hasAttribute('data-sound')) { await toggleSound(); el.setAttribute('aria-pressed',memory.sound); el.innerHTML=`${icon('sound')} Sound ${memory.sound?'on':'off'}`; }
    if (el.hasAttribute('data-clear-data')) {
      if (el.dataset.confirm === 'yes') { memory.saved=[];memory.recent=[];persist();toast('Saved fixes and recent choices cleared');el.textContent='Data cleared';delete el.dataset.confirm; }
      else { el.dataset.confirm='yes';el.textContent='Confirm: clear this edition’s saved fixes'; }
    }
  });
  document.addEventListener('click', e => {
    if (dialog.contains(e.target)) return;
    const button = e.target.closest('[data-fix],[data-library],[data-saved],[data-about],[data-sound]');
    if (!button) return;
    if (!dialog.open) button.focus({preventScroll:true});
    if (button.dataset.fix) showFix(button.dataset.fix);
    if (button.hasAttribute('data-library')) showLibrary(button.dataset.category ? {category:button.dataset.category} : {});
    if (button.hasAttribute('data-saved')) showLibrary({saved:true});
    if (button.hasAttribute('data-about')) showAbout();
    if (button.hasAttribute('data-sound')) toggleSound();
  });
  document.addEventListener('keydown', e => {
    if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) && !e.target.matches('input,textarea,select') && !dialog.open) {
      e.preventDefault();showLibrary();$('.library-search input',dialog).focus();
    }
  });
  function openHash() {
    let entryId;
    try { entryId = decodeURIComponent(location.hash.slice(5)); }
    catch (error) {
      console.warn('ILUD fix link could not be decoded:', error);
      toast('This fix link is malformed. Search the collection to find the remedy.');
      return;
    }
    showFix(entryId, false);
  }
  addEventListener('popstate', () => {
    if (location.hash.startsWith('#fix=')) openHash();
    else if (dialog.open && view?.type === 'fix') { dialog.close(); view=null; returnFocus?.focus({preventScroll:true}); }
  });
  const initial = location.hash;
  if (initial.startsWith('#fix=')) setTimeout(openHash,50);
  document.documentElement.classList.add('ready');
  let repeat = false;
  try { repeat = sessionStorage.getItem(`${key}.entered`) === '1';sessionStorage.setItem(`${key}.entered`,'1'); }
  catch (error) { storageError(error); }
  if (!repeat && motion()) document.body.classList.add('first-entry');
  setTimeout(()=>document.body.classList.remove('first-entry'),1400);
  return {entries,categories,catalogue,byId,byCategory,search,showFix,showLibrary,showAbout,toast,sound,toggleSound,urlFor,
    get saved(){return memory.saved;},get recent(){return memory.recent;},get soundEnabled(){return memory.sound;}};
}
export function fail(error) {
  console.error(error);
  const alert = document.createElement('section'); alert.className='fatal-error'; alert.setAttribute('role','alert');
  alert.innerHTML=`<h1>Something did not load.</h1><p>${escapeHTML(error.message)}</p><button onclick="location.reload()">Reload ILUD</button>`;
  document.body.prepend(alert);
}
export function swipe(element, onSwipe, {visual = true} = {}) {
  let start = null, dx = 0;
  element.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button,a,input,select,summary')) return;
    start = {x:e.clientX,y:e.clientY,time:performance.now(),id:e.pointerId};dx=0;
    element.setPointerCapture(e.pointerId);
  });
  element.addEventListener('pointermove', e => {
    if (!start || start.id !== e.pointerId) return;
    dx=e.clientX-start.x;
    if (Math.abs(e.clientY-start.y)>Math.abs(dx)+15) { reset();return; }
    if (visual && motion()) element.style.transform=`translateX(${dx*.35}px) rotate(${dx*.018}deg)`;
  });
  function reset(){ start=null;dx=0;element.style.transform=''; }
  element.addEventListener('pointerup', () => {
    const travel=dx; const changed=start && Math.abs(travel)>45;
    reset();if(changed)onSwipe(travel<0?1:-1);
  });
  element.addEventListener('pointercancel',reset);
  element.addEventListener('lostpointercapture',reset);
}
