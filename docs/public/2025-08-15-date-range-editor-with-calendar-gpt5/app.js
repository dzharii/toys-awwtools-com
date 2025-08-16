/* Calendar Estimate Tool - Vanilla JS
   Security: sanitize input/paste (NFKC + ASCII whitelist), escape text nodes, never inject unsanitized HTML.
   Accessibility: aria labels, focus outlines, keyboard day navigation.
*/
(function(){
  'use strict';

  // ===== Utilities =====
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function sanitizePlain(text){
    // Normalize, allow-only ASCII letters/digits/space and permitted punctuation
    const normalized = text.normalize('NFKC');
    // Replace disallowed with spaces
    return normalized.replace(/[^\x20-\x7E]/g, ' ') // non-ASCII → space
      .replace(/[^0-9A-Za-z\s\-\/\.\,\:\;\#\(\)\[\]\{\}]/g, ' ');
  }

  function clamp(val, lo, hi){ return Math.max(lo, Math.min(hi, val)); }

  function parseISODate(str){
    // yyyy-mm-dd
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if(!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    const dt = new Date(y, mo-1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo-1 || dt.getDate() !== d) return null;
    dt.setHours(0,0,0,0);
    return dt;
  }
  function parseMDY(str){
    // m/d/yyyy or mm/dd/yyyy
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(str);
    if(!m) return null;
    const mo = +m[1], d = +m[2], y = +m[3];
    const dt = new Date(y, mo-1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo-1 || dt.getDate() !== d) return null;
    dt.setHours(0,0,0,0);
    return dt;
  }
  function parseDate(str){
    return parseISODate(str) || parseMDY(str);
  }
  function fmtISO(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function addDays(d, n){
    const x = new Date(d); x.setDate(x.getDate()+n); x.setHours(0,0,0,0); return x;
  }
  function monthKey(y, m0){ return `${y}-${String(m0+1).padStart(2,'0')}`; }
  function monthIndex(y, m0){ return y*12 + m0; }
  function monthIndexToYM(mi){ const y = Math.floor(mi/12), m0 = mi%12; return {y, m0}; }

  // Hash 32 (FNV-1a)
  function hash32(str){
    let h = 2166136261 >>> 0;
    for (let i=0;i<str.length;i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Contrast calculation WCAG
  function hexToRgb(hex){
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    return {r,g,b};
  }
  function srgbToLinear(c){ const cs = c/255; return cs <= 0.04045 ? cs/12.92 : Math.pow((cs+0.055)/1.055, 2.4); }
  function relLum(rgb){
    const r = srgbToLinear(rgb.r);
    const g = srgbToLinear(rgb.g);
    const b = srgbToLinear(rgb.b);
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }
  function contrastRatio(bgHex, fgHex){
    const L1 = relLum(hexToRgb(bgHex)) + 0.05;
    const L2 = relLum(hexToRgb(fgHex)) + 0.05;
    const ratio = L1 > L2 ? L1/L2 : L2/L1;
    return ratio;
  }
  function pickTextColor(bgHex){
    const w = contrastRatio(bgHex, "#ffffff");
    const k = contrastRatio(bgHex, "#000000");
    return w >= k ? "#ffffff" : "#000000";
  }
  function blendHex(hexes){
    // Average components (deterministic order of hexes from caller)
    let r=0,g=0,b=0;
    for (const h of hexes){
      const {r:rr,g:gg,b:bb} = hexToRgb(h);
      r+=rr; g+=gg; b+=bb;
    }
    const n = hexes.length;
    const R = Math.round(r/n), G = Math.round(g/n), B = Math.round(b/n);
    return '#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join('');
  }

  // ===== Elements =====
  const editor = $('#editorInput');
  const overlay = $('#editorOverlay');
  const statsList = $('#statsList');
  const totals = {
    days: $('#totalDays'),
    work: $('#totalWorkdays'),
    weekends: $('#totalWeekends'),
    holidays: $('#totalHolidays'),
  };
  const monthsStrip = $('#monthsStrip');
  const errArea = $('#editorError');

  const fromInp = $('#viewportFrom');
  const toInp = $('#viewportTo');
  const todayBtn = $('#todayBtn');
  const fitToggle = $('#fitToggle');

  // ===== State =====
  const state = {
    lines: [], // sanitized text lines
    parsed: [], // per line: {ok, error?, range?}
    ranges: [], // valid range objects: {id,lineIndex,begin,end,desc,colorIndex}
    cover: new Map(), // date ISO -> [range.id]
    rangeDayCache: new Map(), // range.id -> string[] iso dates
    enabledHolidayRuleIds: new Set(window.US_HOLIDAYS?.DEFAULT_ENABLED || []),
    customHolidays: [], // {id, dateISO, name, enabled:true}
    observedHolidaySet: new Set(), // Set of ISO dates (observed + custom)
    holidayNamesByDate: new Map(), // dateISO -> [names]
    viewport: {
      startMonthIdx: 0,
      endMonthIdx: 0,
      fit: false,
    },
    todayISO: fmtISO(new Date(new Date().setHours(0,0,0,0))),
  };

  // ===== Initialization =====
  function initToolbar(){
    const now = new Date(); now.setHours(0,0,0,0);
    const ym = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    fromInp.value = ym(now);
    toInp.value = ym(now);
    const mi = monthIndex(now.getFullYear(), now.getMonth());
    state.viewport.startMonthIdx = mi;
    state.viewport.endMonthIdx = mi;

    fromInp.addEventListener('change', ()=>{
      const d = new Date(fromInp.value + '-01T00:00:00');
      if (isFinite(d)){
        const idx = monthIndex(d.getFullYear(), d.getMonth());
        state.viewport.startMonthIdx = idx;
        if (idx > state.viewport.endMonthIdx) state.viewport.endMonthIdx = idx;
        state.viewport.fit = false; fitToggle.checked = false;
        renderAll();
      }
    });
    toInp.addEventListener('change', ()=>{
      const d = new Date(toInp.value + '-01T00:00:00');
      if (isFinite(d)){
        const idx = monthIndex(d.getFullYear(), d.getMonth());
        state.viewport.endMonthIdx = idx;
        if (idx < state.viewport.startMonthIdx) state.viewport.startMonthIdx = idx;
        state.viewport.fit = false; fitToggle.checked = false;
        renderAll();
      }
    });
    todayBtn.addEventListener('click', ()=>{
      const now = new Date(); now.setHours(0,0,0,0);
      const idx = monthIndex(now.getFullYear(), now.getMonth());
      state.viewport.startMonthIdx = idx;
      state.viewport.endMonthIdx = idx;
      state.viewport.fit = false; fitToggle.checked = false;
      fromInp.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      toInp.value = fromInp.value;
      renderAll(()=>scrollMonthIntoView(idx));
    });
    fitToggle.addEventListener('change', ()=>{
      state.viewport.fit = !!fitToggle.checked;
      fitViewportToRanges();
      renderAll();
    });
  }

  function initEditor(){
    // Synchronize stats scroll with editor scroll
    $('#editorWrapper').addEventListener('scroll', (e)=>{
      statsList.scrollTop = e.currentTarget.scrollTop;
      // Overlay is positioned within same scroll container, so no action needed
    }, {passive:true});

    // Sanitize key input
    editor.addEventListener('beforeinput', (e)=>{
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') return; // handled in paste
      if (e.data){
        const sanitized = sanitizePlain(e.data);
        if (sanitized !== e.data){
          e.preventDefault();
          insertTextAtCursor(sanitized);
        }
      }
    });

    // Sanitize on paste (strip HTML)
    editor.addEventListener('paste', (e)=>{
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      const sanitized = sanitizePlain(text);
      insertTextAtCursor(sanitized);
    });

    // Parse on input (debounced)
    let t;
    const schedule = ()=>{
      clearTimeout(t);
      t = setTimeout(()=> {
        parseEditor();
        renderAll();
      }, 150);
    };
    editor.addEventListener('input', schedule);
    editor.addEventListener('keyup', handleEditorSelectionChange);
    editor.addEventListener('click', handleEditorSelectionChange);
  }

  function initHolidayPanel(){
    const listEl = $('#holidayList');
    try{
      const rules = window.US_HOLIDAYS?.HOLIDAY_RULES || [];
      listEl.innerHTML = '';
      for (const rule of rules){
        const row = document.createElement('div');
        row.className = 'holiday-item';
        const label = document.createElement('label');
        label.textContent = rule.name;
        label.htmlFor = `h-${rule.id}`;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = `h-${rule.id}`;
        cb.checked = state.enabledHolidayRuleIds.has(rule.id);
        cb.addEventListener('change', ()=>{
          if (cb.checked) state.enabledHolidayRuleIds.add(rule.id);
          else state.enabledHolidayRuleIds.delete(rule.id);
          recomputeObservedHolidays();
          renderAll();
        });
        row.append(label, cb);
        listEl.appendChild(row);
      }
    }catch(err){
      console.error(err);
      $('#holidayLoadError').hidden = false;
    }

    $('#addCustomHoliday').addEventListener('click', ()=>{
      const dateVal = $('#customDate').value;
      const nameVal = sanitizePlain($('#customName').value).trim();
      if (!dateVal){
        alert('Select a date.');
        return;
      }
      if (!nameVal){
        alert('Enter a label.');
        return;
      }
      const id = `custom-${hash32(dateVal + '|' + nameVal)}`;
      // Avoid duplicates
      if (state.customHolidays.some(h=>h.id===id)){
        alert('Custom date already added.');
        return;
      }
      state.customHolidays.push({ id, dateISO: dateVal, name: nameVal, enabled: true });
      renderCustomHolidays();
      recomputeObservedHolidays();
      renderAll();
      $('#customDate').value = '';
      $('#customName').value = '';
    });
  }

  function renderCustomHolidays(){
    const cont = $('#customHolidayList');
    cont.innerHTML = '';
    for (const h of state.customHolidays){
      const row = document.createElement('div');
      row.className = 'custom-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = h.enabled;
      cb.addEventListener('change', ()=>{ h.enabled = cb.checked; recomputeObservedHolidays(); renderAll(); });
      const label = document.createElement('label'); label.textContent = `${h.dateISO} — ${h.name}`;
      const del = document.createElement('button'); del.type='button'; del.className='btn'; del.textContent='Remove';
      del.addEventListener('click', ()=>{
        const idx = state.customHolidays.findIndex(x=>x.id===h.id);
        if (idx>=0){ state.customHolidays.splice(idx,1); recomputeObservedHolidays(); renderCustomHolidays(); renderAll(); }
      });
      row.append(cb, label, del);
      cont.appendChild(row);
    }
  }

  // Insert sanitized text at current caret in contenteditable
  function insertTextAtCursor(text){
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) { editor.appendChild(document.createTextNode(text)); return; }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node); range.setEndAfter(node);
    sel.removeAllRanges(); sel.addRange(range);
  }

  // ===== Parsing & Lines =====
  function getEditorLines(){
    // innerText preserves line breaks with '\n'
    const txt = sanitizePlain(editor.innerText).replace(/\r/g,'');
    return txt.split('\n');
  }

  function parseLine(line){
    const trimmed = line.trim();
    if (!trimmed) return { ok: false, empty: true };
    if (trimmed.startsWith('#')) return { ok: false, comment: true };

    // Find begin and end dates using regex for yyyy-mm-dd or m/d/yyyy
    const dateRe = /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/g;
    const m1 = dateRe.exec(trimmed);
    if (!m1) return { ok:false, error: "Missing begin date" };
    const m2 = dateRe.exec(trimmed);
    if (!m2) return { ok:false, error: "Missing end date" };

    const begin = parseDate(m1[0]); if (!begin) return { ok:false, error:"Invalid begin date" };
    const end = parseDate(m2[0]); if (!end) return { ok:false, error:"Invalid end date" };
    if (end < begin) return { ok:false, error:"End before begin" };

    const desc = trimmed.slice(dateRe.lastIndex).trim(); // may be empty
    const colorIndex = colorIndexForRange(begin, end);
    const id = `r${hash32(fmtISO(begin) + '|' + fmtISO(end))}`;
    return { ok:true, range: { id, begin, end, desc, colorIndex } };
  }

  function colorIndexForRange(begin, end){
    const key = `${fmtISO(begin)}|${fmtISO(end)}`;
    return hash32(key) % (window.COLORS?.length || 20);
  }

  function parseEditor(){
    state.lines = getEditorLines();
    state.parsed = [];
    const ranges = [];
    let firstError = null;
    overlay.innerHTML = '';
    const frag = document.createDocumentFragment();

    for (let i=0; i<state.lines.length; i++){
      const res = parseLine(state.lines[i]);
      state.parsed[i] = res;
      const lineDiv = document.createElement('div');
      lineDiv.className = 'line-overlay';
      lineDiv.style.top = `${i*lineHeight()}px`;
      if (res.ok){
        const color = COLORS[res.range.colorIndex] || NEUTRAL;
        lineDiv.classList.add('valid');
        lineDiv.style.background = color.bg + '33'; // translucent line tint
      } else if (!res.empty && !res.comment){
        lineDiv.classList.add('invalid');
        if (!firstError) firstError = res.error;
      }
      frag.appendChild(lineDiv);

      if (res.ok) ranges.push({...res.range, lineIndex: i});
    }
    overlay.appendChild(frag);

    state.ranges = ranges;
    // Error area
    if (firstError) {
      errArea.textContent = firstError;
      errArea.style.background = 'var(--error-bg)';
    } else {
      errArea.textContent = '';
      errArea.style.background = 'transparent';
    }

    // Fit viewport if requested
    if (state.viewport.fit) fitViewportToRanges();

    // Recompute coverage caches
    buildRangeCaches();
    recomputeObservedHolidays(); // also rebuilds calendar tooltips with holiday names
  }

  // ===== Holidays =====
  function relevantYears(){
    const years = new Set();
    if (state.ranges.length){
      let minY = 9999, maxY = 0;
      for (const r of state.ranges){
        minY = Math.min(minY, r.begin.getFullYear(), r.end.getFullYear());
        maxY = Math.max(maxY, r.begin.getFullYear(), r.end.getFullYear());
      }
      for (let y=minY-1; y<=maxY+1; y++) years.add(y); // padding
    } else {
      // Use viewport years at least
      const a = monthIndexToYM(state.viewport.startMonthIdx).y;
      const b = monthIndexToYM(state.viewport.endMonthIdx).y;
      for (let y=Math.min(a,b)-1; y<=Math.max(a,b)+1; y++) years.add(y);
    }
    return years;
  }

  function recomputeObservedHolidays(){
    // Build observed holiday set from enabled rules + custom (enabled)
    const yrs = relevantYears();
    const { expandHolidays } = window.US_HOLIDAYS || {};
    const observed = new Set();
    const namesBy = new Map();
    if (expandHolidays){
      const { list, observedMap } = expandHolidays(yrs, state.enabledHolidayRuleIds);
      // Add names from observedMap
      for (const [k,v] of observedMap.entries()){
        if (v && v.length){
          observed.add(k);
          namesBy.set(k, v.slice());
        }
      }
    }
    // Add customs (no observance shifting)
    for (const c of state.customHolidays){
      if (c.enabled){
        observed.add(c.dateISO);
        const arr = namesBy.get(c.dateISO) || [];
        arr.push(c.name);
        namesBy.set(c.dateISO, arr);
      }
    }
    state.observedHolidaySet = observed;
    state.holidayNamesByDate = namesBy;
  }

  // ===== Range coverage & stats =====
  function buildRangeCaches(){
    state.cover.clear();
    state.rangeDayCache.clear();
    for (const r of state.ranges){
      const days = [];
      let d = new Date(r.begin);
      while (d <= r.end){
        const k = fmtISO(d);
        days.push(k);
        if (!state.cover.has(k)) state.cover.set(k, []);
        state.cover.get(k).push(r.id);
        d = addDays(d, 1);
      }
      state.rangeDayCache.set(r.id, days);
    }
  }

  function countWorkdays(begin, end){
    let total = 0, weekends = 0, holidays = 0;
    let d = new Date(begin);
    while (d <= end){
      const dow = d.getDay();
      const k = fmtISO(d);
      const isWeekend = (dow === 0 || dow === 6);
      const isHoliday = state.observedHolidaySet.has(k);
      if (isWeekend) weekends++;
      if (isHoliday) holidays++;
      if (!isWeekend && !isHoliday) total++;
      d = addDays(d, 1);
    }
    return { total, weekends, holidays };
  }

  function recomputeStats(){
    const frag = document.createDocumentFragment();
    let sumDays=0, sumWork=0, sumWknd=0, sumHol=0;
    for (const r of state.ranges){
      const { total, weekends, holidays } = countWorkdays(r.begin, r.end);
      const row = document.createElement('div');
      row.className = 'stats-row';
      row.dataset.rangeId = r.id;
      const desc = document.createElement('div'); desc.className = 'col desc';
      const descText = r.desc ? `${fmtISO(r.begin)} - ${fmtISO(r.end)} ${r.desc}` : `${fmtISO(r.begin)} - ${fmtISO(r.end)}`;
      desc.textContent = descText;

      const daysAll = (state.rangeDayCache.get(r.id) || []).length;
      const colDays = document.createElement('div'); colDays.className='col metric'; colDays.textContent = String(daysAll);
      const colWork = document.createElement('div'); colWork.className='col metric'; colWork.textContent = String(total);
      const colWknd = document.createElement('div'); colWknd.className='col metric'; colWknd.textContent = String(weekends);
      const colHol = document.createElement('div'); colHol.className='col metric'; colHol.textContent = String(holidays);

      row.append(desc,colDays,colWork,colWknd,colHol);
      frag.appendChild(row);

      sumDays += daysAll; sumWork+=total; sumWknd+=weekends; sumHol+=holidays;
    }
    statsList.innerHTML = '';
    statsList.appendChild(frag);
    totals.days.textContent = String(sumDays);
    totals.work.textContent = String(sumWork);
    totals.weekends.textContent = String(sumWknd);
    totals.holidays.textContent = String(sumHol);
  }

  // ===== Calendar rendering =====
  function fitViewportToRanges(){
    if (!state.viewport.fit){ return; }
    if (!state.ranges.length){
      // Keep as-is when no ranges
      return;
    }
    let minD = state.ranges[0].begin;
    let maxD = state.ranges[0].end;
    for (const r of state.ranges){
      if (r.begin < minD) minD = r.begin;
      if (r.end > maxD) maxD = r.end;
    }
    let startIdx = monthIndex(minD.getFullYear(), minD.getMonth());
    let endIdx = monthIndex(maxD.getFullYear(), maxD.getMonth());
    // Auto context if short span
    if ((endIdx - startIdx) < 1){
      startIdx = startIdx-1;
      endIdx = endIdx+1;
    }
    state.viewport.startMonthIdx = startIdx;
    state.viewport.endMonthIdx = endIdx;
    const startYM = monthIndexToYM(startIdx);
    const endYM = monthIndexToYM(endIdx);
    fromInp.value = `${startYM.y}-${String(startYM.m0+1).padStart(2,'0')}`;
    toInp.value = `${endYM.y}-${String(endYM.m0+1).padStart(2,'0')}`;
  }

  function monthDaysMatrix(year, month0){
    // Prepare 6 rows * 7 columns (some cells empty)
    const first = new Date(year, month0, 1);
    const daysInMonth = new Date(year, month0+1, 0).getDate();
    const startDow = first.getDay(); // Sunday=0
    const cells = [];
    for (let i=0;i<42;i++){
      const dayNum = i - startDow + 1;
      if (dayNum < 1 || dayNum > daysInMonth) cells.push(null);
      else cells.push(new Date(year, month0, dayNum));
    }
    return cells;
  }

  function renderCalendar(){
    monthsStrip.innerHTML = '';
    const start = state.viewport.startMonthIdx;
    const end = state.viewport.endMonthIdx;
    const frag = document.createDocumentFragment();

    for (let mi=start; mi<=end; mi++){
      const {y, m0} = monthIndexToYM(mi);
      const monthEl = document.createElement('div');
      monthEl.className = 'month';
      monthEl.dataset.monthIndex = String(mi);
      const header = document.createElement('div');
      header.className = 'month-header';
      const title = document.createElement('div');
      title.textContent = new Date(y, m0, 1).toLocaleDateString(undefined, {month:'long', year:'numeric'});
      const sub = document.createElement('div');
      sub.style.color = '#93a5b1';
      sub.style.fontSize = '.85rem';
      sub.textContent = `${y}-${String(m0+1).padStart(2,'0')}`;
      header.append(title, sub);

      const grid = document.createElement('div');
      grid.className = 'month-grid';

      // Weekday headers
      const wk = ['S','M','T','W','T','F','S'];
      for (const w of wk){
        const d = document.createElement('div');
        d.className = 'weekday'; d.textContent = w;
        grid.appendChild(d);
      }
      const cells = monthDaysMatrix(y, m0);
      const todayISO = state.todayISO;

      for (const d of cells){
        const cell = document.createElement('button');
        cell.type='button';
        cell.className = 'day';
        cell.setAttribute('aria-label', d ? new Date(d).toDateString() : 'Empty');
        cell.tabIndex = d ? 0 : -1;

        if (d){
          const iso = fmtISO(d);
          const num = document.createElement('div'); num.className='num'; num.textContent = String(d.getDate());
          const isToday = (iso === todayISO);
          if (isToday) cell.classList.add('today');

          // Holiday badge (observed)
          if (state.observedHolidaySet.has(iso)){
            cell.classList.add('holiday');
            const badge = document.createElement('div'); badge.className='badge'; badge.setAttribute('aria-label', 'Holiday');
            cell.appendChild(badge);
          }

          // Coverage
          const cover = state.cover.get(iso) || [];
          if (cover.length){
            const colors = cover.map(id=>{
              const r = state.ranges.find(x=>x.id===id);
              return r ? COLORS[r.colorIndex] : NEUTRAL;
            });
            if (cover.length === 1){
              const c = colors[0];
              cell.classList.add('cover-1');
              cell.style.background = c.bg;
              cell.style.color = c.fg;
            } else {
              const blend = blendHex(colors.map(c=>c.bg));
              const fg = pickTextColor(blend);
              const ratio = contrastRatio(blend, fg);
              cell.classList.add('cover-2plus');
              cell.style.background = blend;
              cell.style.color = fg;
              if (ratio < 4.5){
                const stripe = document.createElement('div'); stripe.className='stripe';
                cell.appendChild(stripe);
              }
            }
            // Tooltip descriptions
            let tip;
            if (cover.length === 1){
              const r = state.ranges.find(x=>x.id===cover[0]);
              tip = r && r.desc ? r.desc : `${fmtISO(d)} covered by range`;
            } else {
              const names = cover.map(id=>{
                const r = state.ranges.find(x=>x.id===id);
                return r ? (r.desc || `${fmtISO(r.begin)} - ${fmtISO(r.end)}`) : id;
              });
              tip = `Overlaps:\n- ` + names.join('\n- ');
            }
            // Holidays info appended in tooltip
            if (state.observedHolidaySet.has(iso)){
              const hnames = state.holidayNamesByDate.get(iso) || ['Holiday'];
              tip += `\nHoliday: ${hnames.join(', ')}`;
            }
            cell.title = tip;
            cell.dataset.ranges = cover.join(',');
            // Hover highlight -> editor lines
            cell.addEventListener('mouseenter', ()=>{
              highlightEditorLines(cover);
              highlightStatsRows(cover, true);
            });
            cell.addEventListener('mouseleave', ()=>{
              highlightEditorLines([]);
              highlightStatsRows([], false);
            });
            // Click -> scroll editor to first range line
            cell.addEventListener('click', ()=>{
              if (cover.length){
                const rid = cover[0];
                const r = state.ranges.find(x=>x.id===rid);
                if (r) scrollEditorToLine(r.lineIndex);
              }
            });
          } else {
            // Holiday tooltip when no coverage
            if (state.observedHolidaySet.has(iso)){
              const names = state.holidayNamesByDate.get(iso) || ['Holiday'];
              cell.title = names.join(', ');
            }
          }

          // Key navigation across days
          cell.addEventListener('keydown', (e)=>{
            const code = e.key;
            if (code === 'ArrowRight' || code === 'ArrowLeft' || code === 'ArrowUp' || code === 'ArrowDown'){
              e.preventDefault();
              const delta = (code === 'ArrowRight') ? 1 : (code === 'ArrowLeft') ? -1 : (code === 'ArrowUp') ? -7 : 7;
              const nd = addDays(d, delta);
              const target = monthsStrip.querySelector(`.day[data-iso="${fmtISO(nd)}"]`);
              if (target) target.focus();
            }
          });

          cell.dataset.iso = iso;
          cell.setAttribute('data-iso', iso);
          cell.appendChild(num);
        } else {
          cell.disabled = true;
          cell.classList.add('other-month');
          cell.tabIndex = -1;
        }

        grid.appendChild(cell);
      }

      monthEl.append(header, grid);
      frag.appendChild(monthEl);
    }
    monthsStrip.appendChild(frag);

    // Ensure each day has aria-label enriched with holiday info
    $$('.day[data-iso]').forEach(el=>{
      const iso = el.dataset.iso;
      let label = el.getAttribute('aria-label') || iso;
      if (state.observedHolidaySet.has(iso)){
        const names = state.holidayNamesByDate.get(iso) || [];
        label += `. Holiday: ${names.join(', ')}`;
      }
      const cover = el.dataset.ranges ? el.dataset.ranges.split(',').filter(Boolean) : [];
      if (cover.length){
        label += `. Covered by ${cover.length} range${cover.length>1?'s':''}.`;
      }
      el.setAttribute('aria-label', label);
    });

    // Scroll into view current month if within viewport
    const now = new Date();
    const nowIdx = monthIndex(now.getFullYear(), now.getMonth());
    if (nowIdx >= state.viewport.startMonthIdx && nowIdx <= state.viewport.endMonthIdx){
      // Optionally center on today
      scrollMonthIntoView(nowIdx);
    }
  }

  function scrollMonthIntoView(mi){
    const target = monthsStrip.querySelector(`.month[data-month-index="${mi}"]`);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const stripRect = monthsStrip.getBoundingClientRect();
    monthsStrip.scrollBy({ left: rect.left - stripRect.left - 16, behavior: 'smooth' });
  }

  // ===== Linking editor & calendar =====
  function lineHeight(){
    const cs = getComputedStyle(editor);
    return parseFloat(cs.lineHeight) || 27.2; // fallback
  }

  function scrollEditorToLine(index){
    const wrapper = $('#editorWrapper');
    const y = index * lineHeight();
    wrapper.scrollTo({ top: y - wrapper.clientHeight/2 + lineHeight()/2, behavior: 'smooth' });
    // highlight overlay line for a moment
    const ov = overlay.children[index];
    if (ov){
      ov.classList.add('hover');
      setTimeout(()=>ov.classList.remove('hover'), 600);
    }
  }

  function highlightEditorLines(rangeIds){
    // Clear all first
    $$('.line-overlay.hover', overlay).forEach(el=>el.classList.remove('hover'));
    for (const rid of rangeIds){
      const r = state.ranges.find(x=>x.id===rid);
      if (!r) continue;
      const ov = overlay.children[r.lineIndex];
      if (ov) ov.classList.add('hover');
    }
  }
  function highlightStatsRows(rangeIds, on){
    const set = new Set(rangeIds);
    $$('.stats-row', statsList).forEach(row=>{
      const rid = row.dataset.rangeId;
      row.classList.toggle('highlight', on && set.has(rid));
    });
  }

  function handleEditorSelectionChange(){
    // Determine current line index from selection caret
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(editor);
    pre.setEnd(range.endContainer, range.endOffset);
    const text = pre.toString();
    const idx = text.split('\n').length - 1;
    // Highlight calendar days for that line
    const res = state.parsed[idx];
    if (res && res.ok){
      const days = state.rangeDayCache.get(res.range.id) || [];
      // Add outline on covered days
      $$('.day[data-iso]').forEach(el=>{
        el.style.outline = '';
      });
      for (const k of days){
        const el = monthsStrip.querySelector(`.day[data-iso="${k}"]`);
        if (el) el.style.outline = '2px dashed #94a3b8';
      }
      // Highlight stats row
      highlightStatsRows([res.range.id], true);
      setTimeout(()=>highlightStatsRows([], false), 400); // gentle pulse
    } else {
      $$('.day[data-iso]').forEach(el=>{ el.style.outline=''; });
      highlightStatsRows([], false);
    }
  }

  // ===== Render All =====
  function renderAll(after){
    recomputeStats();
    renderCalendar();
    if (typeof after === 'function') after();
  }

  // ===== Boot =====
  initToolbar();
  initEditor();
  initHolidayPanel();

  // First parse & render
  parseEditor();
  renderAll();

  // ===== Keyboard nav enhancements for days =====
  monthsStrip.addEventListener('keydown', (e)=>{
    // Page scroll with Shift+Arrow to jump months
    if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const idx = clamp(
        state.viewport.startMonthIdx + delta,
        -120000, 120000
      );
      state.viewport.startMonthIdx = idx;
      state.viewport.endMonthIdx = idx;
      fromInp.value = `${monthIndexToYM(idx).y}-${String(monthIndexToYM(idx).m0+1).padStart(2,'0')}`;
      toInp.value = fromInp.value;
      state.viewport.fit = false; fitToggle.checked = false;
      renderAll(()=>scrollMonthIntoView(idx));
    }
  });

})();

