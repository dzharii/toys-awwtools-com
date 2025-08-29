/*
  Zen Text Timer — Single-file JS (ESM) implementing:
  - contenteditable text editor with per-line parsing
  - inline highlighted duration token with controls
  - timer store with persistence and resume
  - Web Audio alarm
  - requestAnimationFrame tick + coarse 1s UI updates
*/

// ---------- Utilities ----------
const LS_KEYS = {
  doc: 'ztt.doc',
  state: 'ztt.state',
  lineIds: 'ztt.lineIds',
  prefs: 'ztt.prefs',
};

const now = () => Date.now();
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const pad2 = (n) => n.toString().padStart(2, '0');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));

function debounce(fn, ms){
  let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), ms); };
}

function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.hidden = false;
  setTimeout(()=>{ el.hidden = true; }, 3000);
}

// ---------- Parser ----------
const Parser = {
  // Returns { ms, consumed, labelStart, kind } or null
  parseLine(line){
    const original = line; if(!line) return null;
    let i = 0;
    while(i < line.length && line[i] === ' ') i++;
    const start = i;
    // Try unit groups e.g. 2h 30m 15s or any order
    let ms = 0, matched = false, j = i;
    while(true){
      const m = /^(\d+)\s*([hms])\b/i.exec(line.slice(j));
      if(!m) break;
      matched = true;
      const val = parseInt(m[1], 10); const u = m[2].toLowerCase();
      if(u === 'h') ms += val * 3600_000;
      else if(u === 'm') ms += val * 60_000;
      else if(u === 's') ms += val * 1000;
      j += m[0].length;
      const sp = /^\s+/.exec(line.slice(j)); if(sp) j += sp[0].length;
    }
    if(matched){
      if(ms > 0){
        const consumed = j - start; return { ms, consumed, labelStart: start + consumed, kind: 'units' };
      }
      return null;
    }
    // Try colon syntax
    // 3-part H:M:S (flex digits)
    let m3 = /^(\d+):(\d{1,2}):(\d{1,2})\b/.exec(line.slice(i));
    if(m3){
      const h = parseInt(m3[1],10), m = parseInt(m3[2],10), s = parseInt(m3[3],10);
      if(m < 60 && s < 60){
        ms = h*3600_000 + m*60_000 + s*1000;
        if(ms>0) return { ms, consumed: m3[0].length, labelStart: i+m3[0].length, kind: 'hms' };
      }
      return null;
    }
    // 2-part: nuanced rule to match examples in spec:
    // - If first part has two digits (e.g., 00:05 or 01:00) interpret as H:MM
    // - If first part has one digit (e.g., 0:45) interpret as M:S
    const m2 = /^(\d+):(\d{1,2})\b/.exec(line.slice(i));
    if(m2){
      const aRaw = m2[1], bRaw = m2[2];
      const a = parseInt(aRaw,10), b = parseInt(bRaw,10);
      if(aRaw.length >= 2){ // treat as H:MM
        if(b < 60){ ms = a*3600_000 + b*60_000; }
      }else{ // treat as M:S
        if(b < 60){ ms = a*60_000 + b*1000; }
      }
      if(ms>0) return { ms, consumed: m2[0].length, labelStart: i+m2[0].length, kind: 'hm_or_ms' };
      return null;
    }
    // Bare number = minutes
    const mNum = /^(\d+)\b/.exec(line.slice(i));
    if(mNum){
      const m = parseInt(mNum[1],10);
      ms = m * 60_000; if(ms>0) return { ms, consumed: mNum[0].length, labelStart: i+mNum[0].length, kind: 'minutes' };
    }
    return null;
  },
  formatMs(ms){
    const neg = ms < 0; const t = Math.abs(ms);
    const h = Math.floor(t/3600_000);
    const m = Math.floor((t%3600_000)/60_000);
    const s = Math.floor((t%60_000)/1000);
    // produce structured groups
    const parts = [];
    if(h>0) parts.push({num: String(h), mark:'h'});
    if(h>0 || m>0) parts.push({num: h>0? pad2(m): String(m), mark:'m'});
    if(h>0 || m>0 || s>0) parts.push({num: (h>0||m>0)? pad2(s): String(s), mark:'s'});
    return { neg, parts };
  }
};

// ---------- Audio ----------
const AudioMod = (()=>{
  let ctx = null, masterGain = null, unlocked = false;
  let playing = false, nodes = [];

  function ensure(){
    if(!ctx){ ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    if(!masterGain){ masterGain = ctx.createGain(); masterGain.gain.value = Prefs.volume; masterGain.connect(ctx.destination); }
  }
  async function unlock(){
    ensure();
    if(ctx.state === 'suspended'){
      try{ await ctx.resume(); unlocked = true; }catch{ /* ignore */ }
    } else { unlocked = true; }
  }
  function setVolume(v){ ensure(); masterGain.gain.value = v; }

  function playAlarm(){
    ensure(); if(!unlocked){ showToast('Click once to enable audio'); }
    if(playing) return; playing = true;
    // Simple repeating triad pattern: A4 -> C5 -> E5 blips
    const pattern = [440, 523.25, 659.25];
    let step = 0;
    function tick(){
      if(!playing) return;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = pattern[step % pattern.length];
      gain.gain.value = 0.0001; // ramp up quickly then down
      osc.connect(gain).connect(masterGain);
      const t0 = ctx.currentTime; const dur = 0.2;
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, Prefs.volume), t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.start(t0); osc.stop(t0+dur);
      nodes.push(osc, gain);
      step++;
      setTimeout(tick, 260); // ~4Hz
    }
    tick();
  }
  function stopAlarm(){ playing = false; nodes.forEach(n=>{ try{ n.disconnect(); }catch{} }); nodes = []; }
  return { ensure, unlock, setVolume, playAlarm, stopAlarm, get unlocked(){ return unlocked; } };
})();

// ---------- Preferences ----------
const Prefs = {
  volume: 0.15,
  load(){ try{ const p = JSON.parse(localStorage.getItem(LS_KEYS.prefs)||'{}'); if(typeof p.volume==='number') this.volume = clamp(p.volume,0,1); }catch{} },
  save(){ localStorage.setItem(LS_KEYS.prefs, JSON.stringify({ volume: this.volume })); }
};

// ---------- Timer Store ----------
const Store = (()=>{
  // id -> state
  const map = new Map();
  // transient: ids per line index
  let lineIds = [];

  function load(){
    try{
      const raw = localStorage.getItem(LS_KEYS.state);
      if(raw){ const obj = JSON.parse(raw); Object.values(obj).forEach(st=> map.set(st.id, st)); }
      const lid = localStorage.getItem(LS_KEYS.lineIds);
      if(lid){ lineIds = JSON.parse(lid); }
    }catch{}
  }
  function save(){
    const obj = {}; map.forEach((v,k)=>{ obj[k]=v; });
    localStorage.setItem(LS_KEYS.state, JSON.stringify(obj));
    localStorage.setItem(LS_KEYS.lineIds, JSON.stringify(lineIds));
  }
  const saveDebounced = debounce(save, 150);

  function get(id){ return map.get(id); }
  function set(st){ map.set(st.id, st); saveDebounced(); }
  function remove(id){ map.delete(id); saveDebounced(); }
  function getLineIds(){ return lineIds; }
  function setLineIds(arr){ lineIds = arr; saveDebounced(); }

  return { load, save, get, set, remove, getLineIds, setLineIds };
})();

// ---------- Editor / Renderer ----------
const Editor = (()=>{
  const el = document.getElementById('editor');
  const titleBase = document.title;
  let rafId = 0; let lastSecond = -1;
  const pop = document.getElementById('ctrl-pop');
  let popForId = null; let popPinned = false;

  function getLines(){
    return Array.from(el.children).filter(n=> n.classList.contains('line'));
  }
  function getActiveLine(){ return document.activeElement && document.activeElement.closest ? document.activeElement.closest('.line') : null; }

  function setDocText(text){
    el.innerHTML = '';
    const lines = text.split(/\r?\n/);
    const ids = Store.getLineIds();
    const nextIds = [];
    lines.forEach((lineText, i)=>{
      const div = document.createElement('div');
      div.className = 'line';
      div.setAttribute('data-index', String(i));
      // initially plain; render pass will build token/controls
      div.textContent = lineText;
      el.appendChild(div);
      nextIds[i] = ids && ids[i] || null;
    });
    Store.setLineIds(nextIds);
    renderAll();
  }
  function getDocText(){
    return getLines().map(line => line.textContent || '').join('\n');
  }

  const saveDocDebounced = debounce(()=>{
    localStorage.setItem(LS_KEYS.doc, getDocText());
  }, 150);

  function ensureLineStructure(line){
    // Keep the user's text; render token as wrappers only and float controls elsewhere.
    const raw = (line.textContent || '');
    // Strip children first but preserve raw text
    while(line.firstChild) line.removeChild(line.firstChild);
    const parsed = Parser.parseLine(raw);
    if(!parsed){
      const prevId = line.getAttribute('data-id');
      if(prevId){ Store.remove(prevId); line.removeAttribute('data-id'); const ids = Store.getLineIds().slice(); ids[Number(line.dataset.index)] = null; Store.setLineIds(ids); }
      line.classList.remove('has-timer','running','paused','finished','overtime');
      line.appendChild(document.createTextNode(raw));
      return;
    }
    // Build token wrapping the exact duration substring from the raw text
    const before = raw.slice(0, parsed.labelStart - parsed.consumed);
    const durText = raw.slice(parsed.labelStart - parsed.consumed, parsed.labelStart);
    const after = raw.slice(parsed.labelStart);

    line.classList.add('has-timer');
    const id = line.getAttribute('data-id') || Store.getLineIds()[Number(line.dataset.index)] || uuid();
    line.setAttribute('data-id', id);
    const ids = Store.getLineIds().slice(); ids[Number(line.dataset.index)] = id; Store.setLineIds(ids);

    // Prepare or update timer state
    let st = Store.get(id); const ms = parsed.ms;
    if(!st){ st = { id, defaultDurationMs: ms, status: 'idle', startEpochMs: null, remainingMs: ms, editsAppliedMs: 0, lastChangedEpochMs: now(), acknowledged: true }; Store.set(st); }
    else if(st.status==='idle'){ st.defaultDurationMs = ms; st.remainingMs = ms; Store.set(st); }
    else if(st.status==='running' || st.status==='paused'){ st.remainingMs = ms; if(st.status==='running'){ st.startEpochMs = now(); st.remainingMsAtStart = ms; } Store.set(st); }

    updateStatusClasses(line, st.status);

    // Append before text
    if(before) line.appendChild(document.createTextNode(before));
    // Token span containing the original characters; divide into h/m/s groups for decorative markers
    const token = document.createElement('span'); token.className = 'token'; token.setAttribute('data-id', id); token.setAttribute('contenteditable','true');
    // Split durText into groups based on formatted ms to decide which markers to show
    const fmt = Parser.formatMs(ms);
    // Recreate visible groups but using the original durText characters; fallback to raw
    // For robustness, just place durText as-is, and for markers use the computed parts count to attach classes to slices if lengths match
    // Simple approach: create one span per part with the raw durText split by spaces/colons
    const rawParts = durText.split(/\s+/);
    if(fmt.parts.length === rawParts.length){
      rawParts.forEach((rp, idx)=>{
        const sp = document.createElement('span'); sp.className = 't '+fmt.parts[idx].mark; sp.textContent = rp.trim(); token.appendChild(sp);
        if(idx < rawParts.length-1) token.appendChild(document.createTextNode(' '));
      });
    } else {
      // Fallback: single span but mark seconds for decoration
      const sp = document.createElement('span'); sp.className = 't s'; sp.textContent = durText; token.appendChild(sp);
    }

    // Overtime display via data attribute so it doesn't alter text content
    if(st.status==='finished' || st.status==='overtime'){
      const elapsed = st.finishedAtMs ? now() - st.finishedAtMs : 0;
      token.setAttribute('data-over', '+'+overFormat(elapsed));
      token.classList.add('pulse');
    } else {
      token.removeAttribute('data-over'); token.classList.remove('pulse');
    }

    line.appendChild(token);
    if(after) line.appendChild(document.createTextNode(after));
  }

  function buildControls(st){
    const c = document.createElement('span'); c.className='controls'; c.setAttribute('aria-label','Timer controls');
    function btn(text, aria, cls){ const b = document.createElement('button'); b.className = 'btn' + (cls? ' '+cls:''); b.type='button'; b.textContent = text; b.setAttribute('aria-label', aria || text); return b; }

    const start = btn('Start'); const pause = btn('Pause'); const resume = btn('Resume'); const stop = btn('Stop'); const reset = btn('Reset');
    const alarmOff = btn('Alarm off','Silence alarm','warn'); const snooze = btn('Snooze','Snooze 1 minute','warn');

    // Quick steps
    const stepsWrap = document.createElement('span'); stepsWrap.style.display='inline-flex'; stepsWrap.style.gap='4px';
    const steps = stepSizes(st.remainingMs);
    const incs = steps.map(ms=> btn('+'+formatShort(ms), `Add ${formatLong(ms)}`));
    const decs = steps.map(ms=> btn('-'+formatShort(ms), `Subtract ${formatLong(ms)}`));
    decs.forEach(b=> b.classList.add('danger'));

    // Wire handlers
    const line = findLineById(st.id);
    start.onclick = ()=> startTimer(st.id);
    pause.onclick = ()=> pauseTimer(st.id);
    resume.onclick = ()=> resumeTimer(st.id);
    stop.onclick = ()=> stopTimer(st.id);
    reset.onclick = ()=> resetTimer(st.id);
    alarmOff.onclick = ()=> acknowledge(st.id);
    snooze.onclick = ()=> snoozeTimer(st.id);
    incs.forEach((b,i)=> b.onclick = ()=> adjustRemaining(st.id, steps[i]));
    decs.forEach((b,i)=> b.onclick = ()=> adjustRemaining(st.id, -steps[i]));

    // State-based visibility
    c.appendChild(start); c.appendChild(pause); c.appendChild(resume); c.appendChild(stop); c.appendChild(reset);
    c.appendChild(stepsWrap);
    decs.forEach(b=> stepsWrap.appendChild(b));
    incs.forEach(b=> stepsWrap.appendChild(b));
    c.appendChild(alarmOff); c.appendChild(snooze);

    if(st.status==='idle'){ start.hidden=false; pause.hidden=true; resume.hidden=true; stop.hidden=true; reset.disabled=true; snooze.hidden=true; alarmOff.hidden=true; }
    if(st.status==='running'){ start.hidden=true; pause.hidden=false; resume.hidden=true; stop.hidden=false; reset.disabled=false; snooze.hidden=true; alarmOff.hidden=true; }
    if(st.status==='paused'){ start.hidden=true; pause.hidden=true; resume.hidden=false; stop.hidden=false; reset.disabled=false; snooze.hidden=true; alarmOff.hidden=true; }
    if(st.status==='finished' || st.status==='overtime'){ start.hidden=true; pause.hidden=true; resume.hidden=true; stop.hidden=false; reset.disabled=false; snooze.hidden=false; alarmOff.hidden=false; }

    return c;
  }

  function updateStatusClasses(line, status){
    line.classList.toggle('running', status==='running');
    line.classList.toggle('paused', status==='paused');
    line.classList.toggle('finished', status==='finished');
    line.classList.toggle('overtime', status==='overtime');
  }

  function renderAll(){ getLines().forEach(ensureLineStructure); updateTitleBadge(); }

  function renderLineById(id){ const line = findLineById(id); if(line){ ensureLineStructure(line); updateTitleBadge(); } }

  function findLineById(id){ return getLines().find(l => l.getAttribute('data-id') === id); }

  function findTokenById(id){ const line = findLineById(id); if(!line) return null; return line.querySelector('.token'); }

  function showPopoverFor(id){
    const st = Store.get(id); const token = findTokenById(id); if(!st || !token) return;
    pop.innerHTML = '';
    const elems = buildPopoverButtons(st);
    elems.forEach(e=> pop.appendChild(e));
    pop.hidden = false; popForId = id; positionPopover(token);
  }
  function hidePopover(){ if(popPinned) return; pop.hidden = true; popForId = null; }
  function positionPopover(token){
    const r = token.getBoundingClientRect();
    let top = window.scrollY + r.top - (pop.offsetHeight || 40) - 8;
    const minTop = window.scrollY + 8;
    if(top < minTop){ top = window.scrollY + r.bottom + 8; }
    const left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - (pop.offsetWidth || 240) - 8));
    pop.style.position = 'absolute';
    pop.style.top = `${top}px`; pop.style.left = `${left}px`;
  }

  function buildPopoverButtons(st){
    function btn(label, aria, cls){ const b = document.createElement('button'); b.className='btn'+(cls? ' '+cls:''); b.type='button'; b.textContent=label; b.setAttribute('aria-label', aria||label); b.tabIndex = 0; return b; }
    const out = [];
    const start = btn('Start'); const pause = btn('Pause'); const resume = btn('Resume'); const stop = btn('Stop'); const reset = btn('Reset');
    const alarmOff = btn('Alarm off','Silence alarm','warn'); const snooze = btn('Snooze','Snooze 1m','warn');
    const stepsWrapDec = document.createElement('span'); stepsWrapDec.className='group';
    const stepsWrapInc = document.createElement('span'); stepsWrapInc.className='group';
    const steps = stepSizes(st.remainingMs);
    steps.map(ms=>{ const b = btn('-'+formatShort(ms),`Subtract ${formatLong(ms)}`,'danger'); b.onclick = ()=> adjustRemaining(st.id, -ms); stepsWrapDec.appendChild(b); });
    steps.map(ms=>{ const b = btn('+'+formatShort(ms),`Add ${formatLong(ms)}`); b.onclick = ()=> adjustRemaining(st.id, ms); stepsWrapInc.appendChild(b); });

    start.onclick = ()=> startTimer(st.id);
    pause.onclick = ()=> pauseTimer(st.id);
    resume.onclick = ()=> resumeTimer(st.id);
    stop.onclick = ()=> stopTimer(st.id);
    reset.onclick = ()=> resetTimer(st.id);
    alarmOff.onclick = ()=> acknowledge(st.id);
    snooze.onclick = ()=> snoozeTimer(st.id);

    if(st.status==='idle'){ out.push(start, reset); reset.disabled = true; }
    if(st.status==='running'){ out.push(pause, stop, reset); }
    if(st.status==='paused'){ out.push(resume, stop, reset); }
    if(st.status==='finished' || st.status==='overtime'){ out.push(alarmOff, snooze, stop, reset); }
    out.push(stepsWrapDec, stepsWrapInc);
    return out;
  }

  function tick(){
    rafId = requestAnimationFrame(tick);
    const sec = Math.floor(performance.now()/1000);
    if(sec === lastSecond) return; lastSecond = sec;
    // Update running and finished/overtime displays
    getLines().forEach(line=>{
      const id = line.getAttribute('data-id'); if(!id) return;
      const st = Store.get(id); if(!st) return;
      if(st.status==='running'){
        const remaining = computeRemainingMs(st);
        if(remaining <= 0){ finishTimer(id); renderLineById(id); }
        else { st.remainingMs = remaining; Store.set(st); renderLineById(id); }
      } else if(st.status==='overtime' || st.status==='finished'){
        renderLineById(id);
      }
    });
    if(popForId){ const token = findTokenById(popForId); if(token) positionPopover(token); }
  }

  function computeRemainingMs(st){
    if(st.status!=='running') return st.remainingMs;
    const elapsed = now() - (st.startEpochMs || now());
    return Math.max(0, st.remainingMsAtStart - elapsed);
  }

  function updateTitleBadge(){
    const n = Array.from(Store.getLineIds()||[]).filter(Boolean).map(id=>Store.get(id)).filter(st=> st && (st.status==='finished' || st.status==='overtime') && !st.acknowledged).length;
    document.title = n>0 ? `(${n}) ${titleBase}` : titleBase;
  }

  // Public API used by handlers
  function startTimer(id){
    const st = Store.get(id); if(!st) return;
    if(st.status==='running') return;
    st.status = 'running'; st.startEpochMs = now(); st.remainingMsAtStart = st.remainingMs;
    st.defaultAtStartMs = st.defaultDurationMs;
    st.acknowledged = true;
    Store.set(st); renderLineById(id);
  }
  function pauseTimer(id){ const st = Store.get(id); if(!st) return; if(st.status!=='running') return; st.remainingMs = computeRemainingMs(st); st.status='paused'; Store.set(st); renderLineById(id); }
  function resumeTimer(id){ const st = Store.get(id); if(!st) return; if(st.status!=='paused') return; st.status='running'; st.startEpochMs = now(); st.remainingMsAtStart = st.remainingMs; Store.set(st); renderLineById(id); }
  function stopTimer(id){ const st = Store.get(id); if(!st) return; st.status='idle'; st.remainingMs = st.defaultDurationMs; st.acknowledged=true; AudioMod.stopAlarm(); Store.set(st); renderLineById(id); }
  function resetTimer(id){ const st = Store.get(id); if(!st) return; const baseline = st.defaultAtStartMs ?? st.defaultDurationMs; st.status='idle'; st.remainingMs = baseline; st.defaultDurationMs = baseline; st.acknowledged=true; AudioMod.stopAlarm(); Store.set(st); renderLineById(id); }
  function finishTimer(id){ const st = Store.get(id); if(!st) return; st.status='overtime'; st.remainingMs=0; st.acknowledged = false; st.finishedAtMs = now(); Store.set(st); AudioMod.playAlarm(); renderLineById(id); updateTitleBadge(); }
  function acknowledge(id){ const st = Store.get(id); if(!st) return; st.acknowledged = true; if(st.status==='overtime') st.status='finished'; Store.set(st); AudioMod.stopAlarm(); renderLineById(id); updateTitleBadge(); }
  function snoozeTimer(id){ const st = Store.get(id); if(!st) return; st.remainingMs = Math.max(0, st.remainingMs) + 60_000; st.status='running'; st.startEpochMs = now(); st.remainingMsAtStart = st.remainingMs; st.acknowledged=true; AudioMod.stopAlarm(); Store.set(st); renderLineById(id); }
  function adjustRemaining(id, delta){ const st = Store.get(id); if(!st) return; const base = st.status==='running' ? computeRemainingMs(st) : st.remainingMs; const next = Math.max(0, base + delta); st.remainingMs = next; if(st.status==='running'){ st.startEpochMs = now(); st.remainingMsAtStart = next; } Store.set(st); renderLineById(id); }

  function stepSizes(rem){ if(rem < 60_000) return [1_000, 5_000, 10_000]; if(rem < 3_600_000) return [10_000, 30_000, 60_000]; return [600_000, 1_800_000, 3_600_000]; }
  function formatShort(ms){ if(ms%3_600_000===0) return `${ms/3_600_000}h`; if(ms%60_000===0) return `${ms/60_000}m`; if(ms%1000===0) return `${ms/1000}s`; return `${ms}ms`; }
  function formatLong(ms){ if(ms%3_600_000===0){ const n=ms/3_600_000; return `${n} hour${n===1?'':'s'}`;} if(ms%60_000===0){ const n=ms/60_000; return `${n} minute${n===1?'':'s'}`;} if(ms%1000===0){ const n=ms/1000; return `${n} second${n===1?'':'s'}`;} return `${ms} ms`; }
  function overFormat(ms){ const h=Math.floor(ms/3600_000), m=Math.floor((ms%3600_000)/60_000), s=Math.floor((ms%60_000)/1000); const parts=[]; if(h>0) parts.push(String(h).padStart(2,'0')); parts.push((h>0? pad2(m): String(m))); parts.push(pad2(s)); return parts.join(':'); }

  function handleActiveState(){
    getLines().forEach(l=> l.classList.remove('active'));
    const sel = document.getSelection(); if(!sel || sel.rangeCount===0){ hidePopover(); return; }
    const node = sel.anchorNode; if(!node){ hidePopover(); return; }
    const line = node.nodeType===1? node.closest('.line'): node.parentElement && node.parentElement.closest && node.parentElement.closest('.line');
    if(line){
      line.classList.add('active');
      const id = line.getAttribute('data-id'); if(id){ showPopoverFor(id); }
    }
  }

  function onInput(e){ // re-render only the affected line
    const line = (e.target && e.target.closest) ? e.target.closest('.line') : null;
    if(!line) return;
    // sanitize: strip any accidental elements within the line, keep text only
    const txt = line.textContent || '';
    line.innerHTML = '';
    line.textContent = txt;
    ensureLineStructure(line);
    saveDocDebounced();
  }

  function onKeyDown(e){
    handleActiveState();
    const line = getActiveLine(); if(!line) return;
    const id = line.getAttribute('data-id'); const st = id? Store.get(id): null;
    // Ctrl/Cmd+Enter => toggle start/pause
    if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
      e.preventDefault(); if(st){ if(st.status==='running') pauseTimer(id); else if(st.status==='paused') resumeTimer(id); else startTimer(id); }
      return;
    }
    // Alt + +/- for smallest step
    if(e.altKey && (e.key==='-' || e.key==='+')){
      if(st){ const size = stepSizes(st.remainingMs)[0]; adjustRemaining(id, e.key==='+'? size : -size); e.preventDefault(); }
      return;
    }
    // Enter: create new line below
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      const newDiv = document.createElement('div'); newDiv.className='line'; newDiv.setAttribute('data-index','0'); newDiv.textContent='';
      line.after(newDiv);
      // reindex
      reindexLines();
      placeCaretAt(newDiv);
      saveDocDebounced();
      return;
    }
    // Backspace on empty line -> remove line
    if(e.key === 'Backspace'){
      const text = (line.textContent||'').trim();
      if(text.length===0){ e.preventDefault(); const idx = Number(line.dataset.index); const ids = Store.getLineIds().slice(); const idToRemove = line.getAttribute('data-id'); if(idToRemove) Store.remove(idToRemove); line.remove(); ids.splice(idx,1); Store.setLineIds(ids); reindexLines(); saveDocDebounced(); }
    }
  }

  function reindexLines(){ getLines().forEach((l,i)=> l.setAttribute('data-index', String(i))); }

  function placeCaretAt(div){
    const range = document.createRange(); range.selectNodeContents(div); range.collapse(true); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); div.focus(); handleActiveState(); }

  function onPaste(e){ // sanitize to plain text
    e.preventDefault(); const text = (e.clipboardData || window.clipboardData).getData('text'); document.execCommand('insertText', false, text.replace(/\r/g,'')); }

  // Public lifecycle
  function init(){
    Prefs.load();
    Store.load();
    const volEl = document.getElementById('pref-volume'); volEl.value = String(Prefs.volume);
    volEl.addEventListener('input', (e)=>{ Prefs.volume = parseFloat(volEl.value); Prefs.save(); AudioMod.setVolume(Prefs.volume); });

    const saved = localStorage.getItem(LS_KEYS.doc);
    const text = saved ?? '';
    setDocText(text);

    // Resume running timers logically
    resumeFromState();

    // Listeners
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('keyup', handleActiveState);
    el.addEventListener('click', handleActiveState);
    el.addEventListener('paste', onPaste);
    el.addEventListener('mouseover', (e)=>{ const t = e.target.closest && e.target.closest('.token'); if(t){ showPopoverFor(t.getAttribute('data-id')); } });
    el.addEventListener('mouseleave', ()=> hidePopover());
    window.addEventListener('scroll', ()=>{ if(popForId){ const token = findTokenById(popForId); if(token) positionPopover(token); } }, { passive: true });
    window.addEventListener('resize', ()=>{ if(popForId){ const token = findTokenById(popForId); if(token) positionPopover(token); } });
    window.addEventListener('click', ()=> AudioMod.unlock(), { once: true });

    cancelAnimationFrame(rafId); rafId = requestAnimationFrame(tick);

    // Placeholder
    if(!text){ const sample = '00:10 boil eggs\n5 tea\n0:45 steep leaves\n2h 30m beef stock'; setDocText(sample); localStorage.setItem(LS_KEYS.doc, sample); }
  }

  function resumeFromState(){
    // For each line with ID and a store state, adjust remaining based on elapsed
    getLines().forEach(line=>{
      const id = line.getAttribute('data-id') || Store.getLineIds()[Number(line.dataset.index)]; if(!id) return;
      const st = Store.get(id); if(!st) return;
      if(st.status==='running'){
        const elapsed = now() - (st.startEpochMs || now());
        const rem = Math.max(0, st.remainingMsAtStart ? (st.remainingMsAtStart - elapsed) : (st.defaultDurationMs - elapsed));
        st.remainingMs = rem; st.startEpochMs = now(); st.remainingMsAtStart = rem; st.status = rem>0? 'running':'overtime'; st.acknowledged = rem>0? true : false; if(rem<=0) st.finishedAtMs = now(); Store.set(st);
        if(rem<=0) AudioMod.playAlarm();
      }
      if(st.status==='paused'){
        // keep paused; nothing to do
      }
      ensureLineStructure(line);
    });
    updateTitleBadge();
  }

  return { init, startTimer, pauseTimer, resumeTimer, stopTimer, resetTimer, acknowledge, snoozeTimer, adjustRemaining };
})();

// ---------- Boot ----------
window.addEventListener('DOMContentLoaded', ()=>{
  Editor.init();
});
