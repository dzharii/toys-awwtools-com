import {samples,validateGrid,validPath,pathXor,solve,binary,decodeExperiment,encodeExperiment,makeExport} from './model.js';
import {lessons} from './lessons.js';
import { ExperimentEngine } from './core/experiment-engine.js';
import { MOBILE_QUERY, selectPresentation, normalizeViewPreferences } from './views/selection.js';
import { mountPresentation } from './views/registry.js';
import { cellMarkup, routeColor, formatRouteCount } from './views/cells.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE='xor-path-lab-v1';
let data={cases:samples.map((s,i)=>({...structuredClone(s),id:'case-'+i,path:[0],reference:null})),selected:'case-0',hints:[],revealed:false,layout:'standard',split:60,height:65,zoom:1,mode:'explore'};
let storageWarning='',restoreError='';
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved){if(!Array.isArray(saved.cases)||!saved.cases.length)throw Error();for(const c of saved.cases){validateGrid(c.grid);if(!validPath(c.grid,c.path))c.path=[0];}data={...data,...saved};if(!data.cases.some(c=>c.id===data.selected))data.selected=data.cases[0].id;data.split=Math.max(35,Math.min(75,Number(data.split)||60));data.height=Math.max(25,Math.min(80,Number(data.height)||65));data.hints=Array.isArray(data.hints)?data.hints.filter(i=>Number.isInteger(i)&&i>=0&&i<8):[];data.zoom=Math.max(.4,Math.min(2,Number(data.zoom)||1));data.layout=['standard','reading','debugging'].includes(data.layout)?data.layout:'standard';data.mode=data.mode==='edit'?'edit':'explore';}}catch{storageWarning='Saved workspace could not be restored. This session is still usable.';}
if(location.hash.startsWith('#experiment=')){try{const experiment=decodeExperiment(location.hash);const c={...experiment,id:'shared-'+Date.now(),name:'Shared experiment',reference:null};data.cases.push(c);data.selected=c.id;data.hints=[];data.revealed=false;data.layout='standard';}catch(e){restoreError='Experiment link is invalid: '+e.message;}}
const mobileMedia = matchMedia(MOBILE_QUERY);
data.viewPreferences = normalizeViewPreferences(data.viewPreferences, data);
data.presentationOverride = ['desktop', 'mobile'].includes(data.presentationOverride) ? data.presentationOverride : 'auto';
let presentationKind = selectPresentation(data.presentationOverride, mobileMedia.matches), currentView, boardObserver;
for (const key of ['layout', 'split', 'height', 'zoom', 'mode']) {
  Object.defineProperty(data, key, {
    enumerable: false, configurable: true,
    get() { const prefs = data.viewPreferences[presentationKind]; return key in prefs ? prefs[key] : data.viewPreferences.desktop[key]; },
    set(value) { const prefs = data.viewPreferences[presentationKind]; (key in prefs ? prefs : data.viewPreferences.desktop)[key] = value; }
  });
}
let optimalVisible = false, optimalAnalysis = null, optimalLimit = 8, optimalFocus = 'all', optimalRequest = 0, optimalComputing = false;
let debug={cell:0,transition:0,mode:'cell',selected:null,query:'',playing:false,speed:600},verdict='',hover=null,representative=[],timer=null,toastTimer,dirty=false,saveTimer;
const current=()=>data.cases.find(c=>c.id===data.selected),grid=()=>current().grid,ncols=()=>grid()[0].length,total=()=>grid().length*ncols(),end=()=>current().path.at(-1),coord=i=>`(${Math.floor(i/ncols())}, ${i%ncols()})`,value=i=>grid()[Math.floor(i/ncols())][i%ncols()];
const workspace = new ExperimentEngine(current());
function persist(){dirty=false;try{localStorage.setItem(STORAGE,JSON.stringify(data));$('#save-status').textContent='Saved locally';}catch{$('#save-status').textContent='Storage unavailable';storageWarning='Browser storage is unavailable. Use JSON export to keep your work.';}if(storageWarning){$('#storage-warning').hidden=false;$('#storage-warning').textContent=storageWarning;}}
function save(){dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(persist,120);}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4500);}
function invalidate(){pause();workspace.invalidate();optimalRequest++;optimalComputing=false;optimalVisible=false;optimalAnalysis=null;optimalFocus='all';debug.cell=0;debug.furthest=0;debug.transition=0;debug.selected=null;representative=[];verdict='';current().reference=null;}
function engine(){const result=workspace.solution();current().reference=result.min;save();return result;}
function button(action,label,cls='',attrs=''){return `<button type="button" data-action="${action}" class="${cls}" ${attrs}>${label}</button>`;}
function dialog(title,body,onSubmit,label='Apply'){pause();const d=$('#dialog');d.dataset.kind='form';d.innerHTML=`<form id="modal-form"><div class="dialog-title"><h2>${title}</h2>${button('close-dialog','&#215;','icon','aria-label="Close dialog"')}</div>${body}<p id="dialog-error" role="alert"></p><div class="dialog-actions">${button('close-dialog','Cancel')}<button class="primary" type="submit">${label}</button></div></form>`;d.showModal();$('#modal-form').onsubmit=e=>{e.preventDefault();try{if(onSubmit(new FormData(e.target))!==false)d.close();}catch(err){$('#dialog-error').textContent=err.message;}};}
function confirmAction(title,text,callback,label='Continue'){dialog(title,`<p>${text}</p>`,()=>callback(),label);}
function renderShell() {
  document.title = 'Minimum XOR Path Lab';
  boardObserver?.disconnect();
  const mounted = mountPresentation($('#app'), { override: data.presentationOverride, mobileMatches: mobileMedia.matches, dependencies: { button, onTabChange: setMobileTab } });
  currentView = mounted.view;
  presentationKind = mounted.kind;
  renderCases(); renderLessons(); applyLayout(); renderAll();
  $('#case-select').onchange = event => selectCase(event.target.value);
  if ($('#layout')) $('#layout').onchange = event => { data.layout = event.target.value; applyLayout(); save(); };
  $('#board-viewport').onscroll = () => requestAnimationFrame(renderBoard);
  boardObserver = new ResizeObserver(() => renderBoard());
  boardObserver.observe($('#board-viewport'));
  if (presentationKind === 'desktop') setupDividers();
  setupBoardInteractions();
  if (storageWarning) persist();
}
function setMobileTab(tab) {
  if (presentationKind !== 'mobile' || !['explore','inspect','learn','debug'].includes(tab)) return;
  pause(); data.viewPreferences.mobile.tab = tab; currentView.setTab(tab); save();
  requestAnimationFrame(renderBoard);
}
function refreshPresentation() {
  const kind = selectPresentation(data.presentationOverride, mobileMedia.matches);
  if (kind !== presentationKind) { pause(); renderShell(); }
  else { applyLayout(); renderAll(); }
}
mobileMedia.addEventListener('change', refreshPresentation);
function renderCases(){$('#case-select').innerHTML=data.cases.map(c=>`<option value="${esc(c.id)}" ${c.id===data.selected?'selected':''}>${esc(c.name)}</option>`).join('');}
function applyLayout(){currentView.applySettings(data.viewPreferences[presentationKind]);}
function renderAll(){renderCases();$('#grid-meta').textContent=`${grid().length} rows × ${ncols()} cols`;$$('.segmented button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.action===data.mode));$('#mode-status').textContent=data.mode==='edit'?'Edit mode':'Explore mode';$('#path-status').textContent=`${current().path.length} / ${grid().length+ncols()-1} cells visited`;const complete=end()===total()-1;$('[data-action="check"]').disabled=!complete;$('[data-action="undo"]').disabled=current().path.length===1;$('[data-action="move-right"]').disabled=end()%ncols()===ncols()-1||data.mode==='edit';$('[data-action="move-down"]').disabled=end()+ncols()>=total()||data.mode==='edit';$('#verdict').textContent=verdict;$('#verdict').hidden=!verdict;renderOptimalControls();renderBoard();renderManual();renderDebugger();if($('#mobile-xor'))$('#mobile-xor').textContent=workspace.xor;$('#zoom-label').textContent=Math.round(data.zoom*100)+'%';save();}
let cellSize=76,boardOffsets={x:0,y:0};
function renderOptimalControls() {
  const panel = $('#optimal-controls');
  const toggle = $('[data-action="toggle-optimal"]');
  toggle.textContent = optimalComputing ? 'Calculating...' : optimalVisible ? 'Hide optimal paths' : 'Show optimal paths';
  toggle.disabled = optimalComputing;
  toggle.setAttribute('aria-pressed', String(optimalVisible));
  panel.hidden = !optimalVisible;
  if (!optimalVisible || !optimalAnalysis) { panel.innerHTML = ''; return; }
  const result = optimalAnalysis;
  panel.innerHTML = `<div class="optimal-summary"><strong>Optimal XOR ${result.minimum}</strong><span title="${result.count.toString()}">${formatRouteCount(result.count)} optimal ${result.count === 1n ? 'route' : 'routes'}</span>${result.truncated ? `<span>Showing ${result.paths.length}</span>${optimalLimit < 32 ? button('more-optimal','Show more') : ''}` : ''}</div><div class="optimal-route-controls"><label for="route-focus">Highlight <select id="route-focus"><option value="all">All displayed routes</option>${result.paths.map((path, id) => `<option value="${id}">Route ${id + 1} · final XOR ${pathXor(grid(), path)}</option>`).join('')}</select></label><span class="route-swatches">${result.paths.map((_, id) => `<span title="Route ${id+1}: final XOR ${result.minimum}" style="--swatch:${routeColor(id)}"><i></i>${id+1}</span>`).join('')}</span></div><div id="optimal-route-detail"></div><p id="optimal-route-help"></p>`;
  $('#route-focus').value = optimalFocus;
  $('#route-focus').onchange = event => { optimalFocus = event.target.value; renderRouteDetail(); renderBoard(); };
  renderRouteDetail();
}
function focusedRouteTrace() {
  if (!optimalVisible || !optimalAnalysis || optimalFocus === 'all') return [];
  const path = optimalAnalysis.paths[Number(optimalFocus)];
  return path ? workspace.tracePath(path) : [];
}
function renderRouteDetail() {
  const panel = $('#optimal-route-detail');
  const trace = focusedRouteTrace();
  const limitNote = optimalAnalysis.truncated ? ' Route colors are limited to 32; the total count and cell coverage are exact.' : '';
  $('#optimal-route-help').textContent = (trace.length ? "Cells show this route's running XOR; your manual path stays independent." : 'Shared cells blend route colors. Outlines cover every optimal route. Select one route to see its running XOR.') + limitNote;
  if (!trace.length) { panel.innerHTML = ''; return; }
  const final = trace.at(-1);
  panel.innerHTML = `<div class="route-result"><strong>Route ${Number(optimalFocus)+1} final XOR: ${final.xor}</strong><code>${final.binary}</code></div><details class="route-transformations"><summary>All ${trace.length} XOR steps</summary><ol aria-label="Selected route XOR transformations"></ol></details>`;
  const details = panel.querySelector('details');
  details.ontoggle = () => {
    details.querySelector('ol').innerHTML = details.open ? trace.map(step => `<li data-route-trace-cell="${step.cell}"><span><b>#${step.step}</b> ${coord(step.cell)}${step.final ? ' · final' : step.from === null ? ' · start' : ''}</span><code>${step.previous} XOR ${step.value} = <strong>${step.xor}</strong></code><code class="route-step-binary">${binary(step.previous)} XOR ${binary(step.value)} = <strong>${step.binary}</strong></code></li>`).join('') : '';
  };
}
function renderBoard() {
  const vp = $('#board-viewport');
  if (!vp || vp.clientWidth <= 0 || vp.clientHeight <= 0) return;
  $('#representative-legend').hidden = !representative.length;
  const m = grid().length, n = ncols();
  const minimum = presentationKind === 'mobile' ? (data.viewPreferences.mobile.density === 'comfortable' ? 104 : 88) : 80;
  const fit = Math.min(112, Math.max(minimum, Math.min((vp.clientWidth - 58) / n, (vp.clientHeight - 54) / m)));
  cellSize = Math.max(minimum, Math.round(fit * data.zoom));
  const size = cellSize, width = n * size + 54, height = m * size + 54;
  const board = $('#board');
  const boardWidth = Math.max(width, vp.clientWidth), boardHeight = Math.max(height, vp.clientHeight);
  board.style.width = boardWidth + 'px'; board.style.height = boardHeight + 'px';
  const ox = Math.max(36, (vp.clientWidth - n * size) / 2), oy = Math.max(32, (vp.clientHeight - m * size) / 2);
  boardOffsets = { x: ox, y: oy };
  const x0 = Math.max(0, Math.floor((vp.scrollLeft - ox) / size) - 1), x1 = Math.min(n, Math.ceil((vp.scrollLeft + vp.clientWidth - ox) / size) + 1);
  const y0 = Math.max(0, Math.floor((vp.scrollTop - oy) / size) - 1), y1 = Math.min(m, Math.ceil((vp.scrollTop + vp.clientHeight - oy) / size) + 1);
  const path = new Set(current().path), rep = new Set(representative), previews = new Map(workspace.nextMoves().map(move => [move.cell, move]));
  const routeTrace = new Map(focusedRouteTrace().map(step => [step.cell, step]));
  let html = '';
  if (optimalVisible && optimalAnalysis) {
    const shown = optimalAnalysis.paths.map((path, id) => ({ path, id })).filter(({id}) => optimalFocus === 'all' || String(id) === optimalFocus);
    html += `<svg class="route-lines" aria-hidden="true" width="${boardWidth}" height="${boardHeight}">${shown.map(({path,id}) => `<polyline points="${path.map(i => `${ox + i % n * size + (size-6)/2},${oy + Math.floor(i/n)*size+(size-6)/2}`).join(' ')}" fill="none" stroke="${routeColor(id)}" stroke-width="3" stroke-opacity=".75" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
  }
  for (let c = x0; c < x1; c++) html += `<span class="coordinate" style="left:${ox+c*size}px;top:${oy-25}px;width:${size}px">${c}</span>`;
  for (let r = y0; r < y1; r++) {
    html += `<span class="coordinate row-coordinate" style="left:${ox-31}px;top:${oy+r*size}px;height:${size}px">${r}</span>`;
    for (let c = x0; c < x1; c++) {
      const index = r * n + c;
      const ids = optimalVisible && optimalAnalysis ? optimalAnalysis.membership[index].filter(id => optimalFocus === 'all' || String(id) === optimalFocus) : [];
      html += cellMarkup({ index, row: r, col: c, value: value(index), size, left: ox+c*size, top: oy+r*size, current: index===end(), visited:path.has(index), finish:index===total()-1, preview:previews.get(index), routeTrace:routeTrace.get(index), representative:rep.has(index), debug:data.revealed&&index===debug.cell, routeIds:ids, optimalCell:optimalVisible&&!!optimalAnalysis?.cells[index] });
    }
  }
  board.innerHTML = html;
  $('#zoom-label').textContent = Math.round(data.zoom*100) + '%';
}
function xorView(a,b,label='XOR result'){const bits=(x,y)=>binary(x).split('').map((v,i)=>`<span class="bit ${binary(a)[i]!==binary(b)[i]?'different':''}">${v}</span>`).join('');return `<div class="xor-box"><div class="xor-row"><span class="xor-op">A</span><span class="bits">${bits(a)}</span><strong>${a}</strong></div><div class="xor-row"><span class="xor-op">XOR</span><span class="bits">${bits(b)}</span><strong>${b}</strong></div><div class="xor-row result"><span class="xor-op">=</span><span class="bits">${bits(a^b)}</span><strong>${a^b}</strong></div><div class="xor-caption">${label} <span>Highlighted columns differ</span></div></div>`;}
function renderManual(){const path=current().path,x=pathXor(grid(),path),last=end(),complete=last===total()-1;const next=hover!==null&&(hover===last+ncols()||hover===last+1&&Math.floor(hover/ncols())===Math.floor(last/ncols()))?hover:null;let a,b,label;if(next!==null){a=x;b=value(next);label=`Preview: next cell ${coord(next)}`;}else{b=value(last);a=x^b;label=path.length===1?'Starting value: 0 XOR start':`Last move into ${coord(last)}`;}
 $('#manual').innerHTML=`<div class="inspector-section"><div class="section-title"><h2>Manual path</h2><span class="tag">${complete?'Complete':'In progress'}</span></div><div class="metrics"><div><label>Current cell</label><strong>${coord(last)}</strong></div><div><label>Path length</label><strong>${path.length}<small> / ${grid().length+ncols()-1}</small></strong></div><div class="xor-metric"><label>${complete?'Final path XOR':'Intermediate XOR'}</label><strong id="manual-xor">${x}</strong></div></div><div class="section-title operation-title"><h3>${next!==null?'Next move preview':'Most recent operation'}</h3><span class="muted">10-bit binary</span></div>${xorView(a,b,label)}<div class="path-strip"><span>Path</span><div>${path.slice(-18).map((i,j)=>`<span>${coord(i)}</span>`).join('<b>&rarr;</b>')}${path.length>18?'<em>Last 18 cells</em>':''}</div></div></div>`;}
function visibleDebugStates(){const e=engine();if(debug.mode==='cell')return e.reachable(debug.cell);const seen=new Set();for(const t of e.transitions(debug.cell).slice(0,debug.transition))seen.add(t.y);return [...seen].sort((a,b)=>a-b);}
function renderDebugger(){const d=$('#debugger');if(!data.revealed){d.innerHTML=`<div class="locked-debug"><div class="section-title"><h2>Algorithm debugger</h2><span class="tag">Hidden</span></div><p>Inspect the algorithm's internal states when you're ready. Your manual experiment stays independent.</p>${button('reveal','Reveal algorithm internals','reveal')}<span class="muted small">This reveals the solution approach.</span></div>`;return;}
 const e=engine(),states=visibleDebugStates(),trans=e.transitions(debug.cell),t=debug.mode==='transition'?trans[debug.transition-1]:null; if(debug.selected!==null&&!states.includes(debug.selected)){debug.selected=null;representative=[];}
 const incoming=debug.cell===0?'Start: no predecessor':trans.length+' incoming transitions';
 d.innerHTML=`<div class="inspector-section debug-section"><div class="section-title"><h2>Algorithm debugger</h2>${button('hide-debug','Hide','quiet')}</div><div class="debug-toolbar"><label class="sr-only" for="step-mode">Stepping mode</label><select id="step-mode"><option value="cell">Cell stepping</option><option value="transition">Transition stepping</option></select>${button('debug-prev','Previous','','aria-label="Previous debug step"')}${button('debug-next','Next','','aria-label="Next debug step"')}${button('play',debug.playing?'Pause':'Play')}${button('debug-reset','Reset')}</div><div class="debug-navigation"><label>Cell <select id="debug-cell">${Array.from({length:Math.max(debug.cell+1,debug.furthest+1||1)},(_,i)=>`<option value="${i}" ${i===debug.cell?'selected':''}>${coord(i)}</option>`).join('')}</select></label><label>Speed <select id="speed"><option value="1200">0.5x</option><option value="600">1x</option><option value="200">3x</option></select></label><span>${states.length} reachable ${debug.mode==='transition'?` / ${debug.transition} of ${trans.length} transitions`:''}</span></div><p class="debug-note">Cell ${coord(debug.cell)} &middot; value ${value(debug.cell)} &middot; ${incoming}</p>${debug.mode==='cell'&&debug.cell>0?`<div class="incoming-states">${[debug.cell-ncols(),debug.cell%ncols()?debug.cell-1:-1].filter(i=>i>=0).map(i=>{const v=e.reachable(i);return `<p>From ${coord(i)}: <code>${v.slice(0,24).join(', ')}${v.length>24?' ... ('+v.length+' states)':''}</code></p>`;}).join('')}</div>`:''}${t?`<p class="transition-note">${t.from<0?'Initialize start':'From '+coord(t.from)}: ${t.x} XOR ${t.value} = ${t.y}</p>${xorView(t.x,t.value,'Transition result')}`:''}<div class="state-layout"><div><canvas id="state-matrix" width="320" height="320" aria-label="32 by 32 XOR matrix. Use the reachable-state list to select a value." role="img"></canvas><div class="matrix-caption">0 &rarr; 1023 &middot; filled = reachable</div></div><div class="state-list-column"><label for="state-search">Reachable states</label><input id="state-search" placeholder="Search decimal or binary" value="${esc(debug.query)}"><div id="state-list" role="list" aria-label="Reachable XOR values"></div></div></div><div id="state-detail"></div><div class="debug-result">${debug.cell===total()-1&&states.length?button('reveal-answer','Reveal minimum and an optimal path','reveal'): '<span class="muted">Step through cells to reach the destination.</span>'}</div></div>`;
 $('#step-mode').value=debug.mode;$('#speed').value=String(debug.speed);$('#step-mode').onchange=e=>{pause();debug.mode=e.target.value;debug.transition=0;debug.selected=null;representative=[];renderDebugger();renderBoard();};$('#speed').onchange=e=>{debug.speed=+e.target.value;if(debug.playing){pause();play();}};$('#debug-cell').onchange=e=>{pause();debug.cell=+e.target.value;debug.transition=0;debug.selected=null;representative=[];renderDebugger();renderBoard();};$('#state-search').oninput=e=>{debug.query=e.target.value;renderStateList(states);};$('#state-matrix').onclick=ev=>{const rect=ev.target.getBoundingClientRect(),x=Math.floor((ev.clientX-rect.left)/rect.width*32),y=Math.floor((ev.clientY-rect.top)/rect.height*32),v=y*32+x;if(states.includes(v))selectState(v);else toast('That XOR value is not reachable in the displayed step.');};drawMatrix(states);renderStateList(states);renderStateDetail();}
function drawMatrix(states){const canvas=$('#state-matrix');if(!canvas)return;const ctx=canvas.getContext('2d'),set=new Set(states);ctx.clearRect(0,0,320,320);for(let i=0;i<1024;i++){ctx.fillStyle=i===debug.selected?'#d69243':set.has(i)?'#176b60':'#e4e9e6';ctx.fillRect(i%32*10+1,Math.floor(i/32)*10+1,8,8);}}
function renderStateList(states){const filtered=states.filter(x=>!debug.query||String(x).includes(debug.query)||binary(x).includes(debug.query));$('#state-list').innerHTML=filtered.length?filtered.map(x=>`<div role="listitem"><button aria-pressed="${debug.selected===x}" data-state="${x}" class="state-item ${debug.selected===x?'selected':''}"><strong>${x}</strong><span>${binary(x)}</span></button></div>`).join(''):'<p class="muted">No matching reachable states.</p>';}
function selectState(x){debug.selected=x;representative=engine().reconstruct(debug.cell,x);drawMatrix(visibleDebugStates());renderStateList(visibleDebugStates());renderStateDetail();renderBoard();}
function renderStateDetail(){const el=$('#state-detail');if(!el)return;if(debug.selected===null){el.innerHTML='<p class="muted small">Select a filled matrix square or a list item to trace one representative path.</p>';return;}const x=debug.selected,p=representative.at(-2),prev=x^value(debug.cell);el.innerHTML=`<div class="state-detail"><strong>State ${x}</strong><code>${binary(x)}</code><p>${p===undefined?'Start state':`Representative predecessor ${coord(p)}, XOR ${prev}; ${prev} XOR ${value(debug.cell)} = ${x}.`}</p><p>Representative path: ${representative.map(coord).join(' &rarr; ')}</p>${presentationKind==='mobile'?button('show-trace','View path on grid'):''}</div>`;}
function lessonFigure(figure) {
  return `<figure class="lesson-diagram"><img src="assets/${figure.name}.svg" alt="${esc(figure.caption)}" width="${figure.width}" height="${figure.height}" loading="lazy"><figcaption>${esc(figure.caption)}</figcaption></figure>`;
}
function lessonTable(table) {
  return `<div class="lesson-table-scroll" role="region" aria-label="${esc(table.caption)}" tabindex="0"><table><caption>${esc(table.caption)}</caption><thead><tr>${table.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function lessonPractice(i, text='') {
  return `<div class="lesson-practice"><div class="lesson-practice-guide"><h3>Try the calculation yourself</h3>${text?`<p>${esc(text)}</p>`:''}<p class="muted">This example is isolated. Loading it into the workspace requires an explicit action.</p></div><div class="lesson-visual"><div class="example" data-example="${i}"></div><div class="example-actions">${button('load-example','Load into workspace','','data-example-id="'+i+'"')}${button('inspect-example','Inspect in debugger','','data-example-id="'+i+'"')}</div></div></div>`;
}
function lessonContent(l,i) {
  if(l.sections) return `<div class="lesson-content lesson-advanced"><div class="lesson-advanced-intro"><h2>${esc(l.title)}</h2><p>${esc(l.intro)}</p></div>${l.sections.map(section=>`<section class="lesson-section ${section.figure?'with-diagram':''}"><div class="lesson-section-text"><h3>${esc(section.heading)}</h3>${section.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}${section.formula?`<div class="lesson-formula"><code>${esc(section.formula)}</code></div>`:''}${section.table?lessonTable(section.table):''}${section.pseudocode?`<pre aria-label="Language-independent pseudocode">${esc(section.pseudocode)}</pre>`:''}${section.check?`<details class="lesson-check"><summary>${esc(section.check.question)}</summary><p>${esc(section.check.answer)}</p></details>`:''}</div>${section.figure?lessonFigure(section.figure):''}</section>`).join('')}${lessonPractice(i,l.practice)}</div>`;
  return `<div class="lesson-content"><div class="lesson-text"><h2>${l.title}</h2><p>${l.intro}</p><p>${l.body}</p><p class="thought">${l.question}</p></div><div class="lesson-visual"><figure><img src="assets/${l.diagram}.svg" alt="${esc(l.caption)}"><figcaption>${l.caption}</figcaption></figure>${i===5?'<img src="assets/states.svg" alt="Reachable XOR values occupy a bounded matrix; empty entries are unreachable.">':''}<div class="example" data-example="${i}"></div><div class="example-actions">${button('load-example','Load into workspace','','data-example-id="'+i+'"')}${button('inspect-example','Inspect in debugger','','data-example-id="'+i+'"')}</div></div></div>`;
}
function renderLessons(){
  $('#lessons').innerHTML=lessons.map((l,i)=>`<details data-hint="${i}" ${data.hints.includes(i)?'open':''}><summary><span class="hint-number">${String(i+1).padStart(2,'0')}</span>Hint ${i+1}<span class="hint-status">${data.hints.includes(i)?'Opened':'Reveal at your pace'}</span></summary>${lessonContent(l,i)}</details>`).join('');
  $$('details[data-hint]').forEach(el=>el.addEventListener('toggle',()=>{const i=+el.dataset.hint;data.hints=data.hints.filter(x=>x!==i);if(el.open)data.hints.push(i);el.querySelector('.hint-status').textContent=el.open?'Opened':'Reveal at your pace';$('#hint-count').textContent=`${data.hints.length} / 8 opened`;save();}));
  lessons.forEach((_,i)=>renderExample(i));$('#hint-count').textContent=`${data.hints.length} / 8 opened`;
}
const examples=lessons.map(l=>({grid:structuredClone(l.grid),path:[0],mode:'explore'}));
function renderExample(i){const ex=examples[i],cols=ex.grid[0].length,last=ex.path.at(-1),x=pathXor(ex.grid,ex.path);$(`[data-example="${i}"]`).innerHTML=`<div class="example-title"><strong>Try it here</strong><span>Isolated example</span></div><div class="example-tools">${button('example-mode',ex.mode==='edit'?'Explore example':'Edit values','','data-example-id="'+i+'"')}${button('example-reset','Reset','','data-example-id="'+i+'"')}</div><div class="mini-grid" style="grid-template-columns:repeat(${cols},44px)">${ex.grid.flat().map((v,c)=>ex.mode==='edit'?`<input aria-label="Hint ${i+1} cell ${Math.floor(c/cols)}, ${c%cols}" type="number" min="0" max="1023" value="${v}" data-example-input="${i}" data-example-cell="${c}">`:`<button data-example-move="${i}" data-example-cell="${c}" class="${ex.path.includes(c)?'visited':''} ${c===last?'current':''}">${v}</button>`).join('')}</div><p class="example-result">Your example XOR: <strong>${x}</strong> &middot; ${ex.path.length} cells</p>${xorView(x^ex.grid[Math.floor(last/cols)][last%cols],ex.grid[Math.floor(last/cols)][last%cols],'Example operation')}`;}
function selectCase(id){pause();data.selected=id;workspace.load(current());data.zoom=1;invalidate();$('#board-viewport').scrollTo(0,0);renderAll();}
function move(i){if(data.mode!=='explore')return;if(workspace.move(i)){hover=null;verdict='';representative=[];renderAll();requestAnimationFrame(()=>ensureVisible(i));}else toast('Move one cell right or down from the current cell.');}
function ensureVisible(i){const vp=$('#board-viewport'),x=boardOffsets.x+i%ncols()*cellSize,y=boardOffsets.y+Math.floor(i/ncols())*cellSize;if(x<vp.scrollLeft||x+cellSize>vp.scrollLeft+vp.clientWidth)vp.scrollLeft=Math.max(0,x-vp.clientWidth/2);if(y<vp.scrollTop||y+cellSize>vp.scrollTop+vp.clientHeight)vp.scrollTop=Math.max(0,y-vp.clientHeight/2);}
function pause(){debug.playing=false;clearInterval(timer);timer=null;}
function debugStep(direction){const e=engine();if(debug.mode==='cell'){debug.cell=Math.max(0,Math.min(total()-1,debug.cell+direction));debug.furthest=Math.max(debug.furthest||0,debug.cell);}else{const count=e.transitions(debug.cell).length;if(direction>0){if(debug.transition<count)debug.transition++;else if(debug.cell<total()-1){debug.cell++;debug.transition=1;}}else{if(debug.transition>0)debug.transition--;else if(debug.cell>0){debug.cell--;debug.transition=e.transitions(debug.cell).length;}}debug.furthest=Math.max(debug.furthest||0,debug.cell);}debug.selected=null;representative=[];renderDebugger();renderBoard();if(debug.cell===total()-1&&(debug.mode==='cell'||debug.transition===e.transitions(debug.cell).length)){pause();const b=$('[data-action="play"]');if(b)b.textContent='Play';}}
function play(){debug.playing=true;timer=setInterval(()=>debugStep(1),debug.speed);renderDebugger();}
function addCase(name,g,path=[0]){validateGrid(g);const c={id:crypto.randomUUID(),name,grid:structuredClone(g),path:[...path],reference:null};data.cases.push(c);selectCase(c.id);if(presentationKind==='mobile')setMobileTab('explore');}
function resizeDialog(){dialog('Grid dimensions',`<p>Resize this test case. Existing cells are retained where possible; new cells start at zero. The manual path and debugger will reset.</p><div class="form-row"><label>Rows<input name="rows" type="number" min="1" max="1000" value="${grid().length}" required></label><label>Columns<input name="cols" type="number" min="1" max="1000" value="${ncols()}" required></label></div>`,f=>{const m=+f.get('rows'),n=+f.get('cols');if(!Number.isInteger(m)||!Number.isInteger(n)||m<1||n<1||m*n>1000)throw Error('Use positive dimensions with at most 1,000 cells.');workspace.resize(m,n);invalidate();data.zoom=1;renderAll();},'Resize grid');}
function cellEditor(i){dialog(`Edit cell ${coord(i)}`,`<label>Integer value<input name="value" type="number" min="0" max="1023" value="${value(i)}" required autofocus></label>`,f=>{const v=+f.get('value');if(!Number.isInteger(v)||v<0||v>1023)throw Error('Enter an integer from 0 to 1023.');workspace.setValue(i,v);invalidate();renderAll();},'Save value');}
function caseDialog(){dialog('Test cases',`<p class="muted">Switch cases in the header. Each case keeps its own grid and manual path.</p><div class="case-list">${data.cases.map(c=>`<div><span><strong>${esc(c.name)}</strong><small>${c.grid.length} × ${c.grid[0].length}</small></span>${button('open-case','Open','','data-case-id="'+esc(c.id)+'"')}${button('rename-case','Rename','','data-case-id="'+esc(c.id)+'"')}${button('duplicate-case','Duplicate','','data-case-id="'+esc(c.id)+'"')}${button('delete-case','Delete','danger','data-case-id="'+esc(c.id)+'"')}</div>`).join('')}</div><div class="form-row"><label>New case name<input name="name" value="Untitled experiment" maxlength="120" required></label></div>`,f=>addCase(String(f.get('name')).trim()||'Untitled experiment',[[0,0,0],[0,0,0],[0,0,0]]),'Create case');}
async function copyText(text,message){try{await navigator.clipboard.writeText(text);toast(message);}catch{dialog('Copy text',`<p>Clipboard access is unavailable. Select and copy this text.</p><textarea readonly rows="6">${esc(text)}</textarea>`,()=>{},'Done');}}
function exportCases(include){const payload=makeExport(data.cases,include);const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='xor-path-experiments.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Exported '+data.cases.length+' test cases'+(include?' with expected results.':' without expected results.'));}
function transferDialog(){dialog('Import / Export',`<p>Exported inputs keep algorithm results hidden by default.</p><div class="transfer-actions">${button('copy-input','Copy LeetCode input')}${button('export','Export all cases as JSON')}</div><label class="checkbox"><input id="include-results" type="checkbox"> Include expected results in the exported file (spoiler)</label><hr><label>Import JSON or a LeetCode grid<textarea name="json" rows="6" placeholder="[[1,2],[3,4]]"></textarea></label><label>Or choose a JSON file<input type="file" id="import-file" accept=".json,application/json"></label><p class="muted small">Imports add new cases. Existing experiments are preserved.</p>`,f=>{const raw=String(f.get('json')).trim();if(!raw)throw Error('Paste JSON or choose a file first.');const parsed=JSON.parse(raw);const items=Array.isArray(parsed)?[{name:'Imported grid',grid:parsed}]:Array.isArray(parsed.cases)?parsed.cases:[parsed];if(!items.length||items.length>100)throw Error('Import between 1 and 100 cases at a time.');for(const c of items)validateGrid(c.grid);for(const c of items){const p=validPath(c.grid,c.path)?c.path:[0];addCase(String(c.name||'Imported experiment').slice(0,120),c.grid,p);}toast('Imported '+items.length+' test cases.');},'Import');$('#import-file').onchange=async e=>{const file=e.target.files[0];if(file){if(file.size>2000000){$('#dialog-error').textContent='Choose a JSON file smaller than 2 MB.';return;}$('textarea[name="json"]').value=await file.text();}};}
function setupDividers(){for(const [id,vertical] of [['vertical-divider',true],['horizontal-divider',false]]){const el=$('#'+id);el.onpointerdown=e=>{el.setPointerCapture(e.pointerId);el.classList.add('dragging');};el.onpointermove=e=>{if(!el.hasPointerCapture(e.pointerId))return;const rect=$(vertical?'#upper':'#main').getBoundingClientRect();if(vertical)data.split=Math.max(35,Math.min(75,(e.clientX-rect.left)/rect.width*100));else{data.layout='standard';data.height=Math.max(25,Math.min(80,(e.clientY-rect.top)/rect.height*100));}applyLayout();};el.onpointerup=e=>{el.releasePointerCapture(e.pointerId);el.classList.remove('dragging');save();};el.onkeydown=e=>{const d=['ArrowRight','ArrowDown'].includes(e.key)?2:['ArrowLeft','ArrowUp'].includes(e.key)?-2:0;if(!d)return;e.preventDefault();e.stopPropagation();if(vertical)data.split=Math.max(35,Math.min(75,data.split+d));else{data.layout='standard';data.height=Math.max(25,Math.min(80,data.height+d));}applyLayout();save();};}}
document.addEventListener('click',e=>{const cell=e.target.closest('[data-cell]');if(cell){const i=+cell.dataset.cell;if(data.mode==='edit')cellEditor(i);else move(i);return;}const state=e.target.closest('[data-state]');if(state){selectState(+state.dataset.state);return;}const moveExample=e.target.closest('[data-example-move]');if(moveExample){const i=+moveExample.dataset.exampleMove,ex=examples[i],c=+moveExample.dataset.exampleCell,last=ex.path.at(-1),n=ex.grid[0].length;if(c===last+n||c===last+1&&Math.floor(c/n)===Math.floor(last/n)){ex.path.push(c);renderExample(i);}else toast('In this example, move right or down from the current cell.');return;}const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,exampleId=+b.dataset.exampleId;if($('#dialog').open&&$('#dialog').dataset.kind==='menu'&&action!=='close-dialog')$('#dialog').close();
 switch(action){
 case 'mobile-tab':setMobileTab(b.dataset.tab);break;
 case 'mobile-menu':mobileMenu();break;
 case 'grid-tools':gridTools();break;
 case 'view-settings':viewSettings();break;
 case 'show-trace':if(presentationKind==='mobile')setMobileTab('explore');break;
 case 'toggle-optimal':toggleOptimalPaths();break;
 case 'more-optimal':optimalLimit=Math.min(32,optimalLimit+8);optimalAnalysis=workspace.optimalRoutes(optimalLimit);renderAll();break;

 case 'close-dialog':$('#dialog').close();break;
 case 'save':persist();toast(storageWarning||'Workspace saved in this browser.');break;
 case 'explore':case 'edit':data.mode=action;hover=null;renderAll();break;
 case 'move-right':move(end()+1);break;case 'move-down':move(end()+ncols());break;
 case 'undo':if(current().path.length>1){workspace.undo();hover=null;verdict='';renderAll();}break;
 case 'reset-path':workspace.reset();hover=null;verdict='';representative=[];renderAll();$('#board-viewport').scrollTo(0,0);break;
 case 'check':if(end()===total()-1){const optimal=pathXor(grid(),current().path)===engine().min;verdict=optimal?'Your path is optimal. You found a minimum-XOR route.':'Your path is valid, but a path with a smaller XOR exists. Try another route.';renderAll();}break;
 case 'resize':resizeDialog();break;
 case 'zoom-in':data.zoom=Math.min(2,data.zoom+.2);renderBoard();save();break;
 case 'zoom-out':data.zoom=Math.max(.4,data.zoom-.2);renderBoard();save();break;
 case 'fit':data.zoom=1;$('#board-viewport').scrollTo(0,0);renderBoard();save();break;
 case 'jump':dialog('Go to cell',`<div class="form-row"><label>Row (zero based)<input name="row" type="number" min="0" max="${grid().length-1}" value="0" required></label><label>Column (zero based)<input name="col" type="number" min="0" max="${ncols()-1}" value="0" required></label></div>`,f=>{const r=+f.get('row'),c=+f.get('col');if(!Number.isInteger(r)||!Number.isInteger(c)||r<0||r>=grid().length||c<0||c>=ncols())throw Error('That coordinate is outside this grid.');ensureVisible(r*ncols()+c);toast(`Cell (${r}, ${c}) is in view.`);});break;
 case 'random':dialog('Generate an experiment',`<p>Create a new test case. Your current experiment is preserved.</p><div class="form-row"><label>Rows<input name="rows" type="number" min="1" max="1000" value="5" required></label><label>Columns<input name="cols" type="number" min="1" max="1000" value="6" required></label><label>Maximum value<input name="max" type="number" min="0" max="1023" value="15" required></label></div>`,f=>{const m=+f.get('rows'),n=+f.get('cols'),max=+f.get('max');if(!Number.isInteger(m)||!Number.isInteger(n)||m<1||n<1||m*n>1000||!Number.isInteger(max)||max<0||max>1023)throw Error('Use at most 1,000 cells and values from 0 to 1023.');addCase(`Generated ${m} × ${n}`,Array.from({length:m},()=>Array.from({length:n},()=>crypto.getRandomValues(new Uint32Array(1))[0]%(max+1))));},'Generate');break;
 case 'reveal':confirmAction('Reveal algorithm internals?','The debugger shows the solution approach, reachable XOR states, and representative paths. Hints remain independent. Continue when you are ready.',()=>{data.revealed=true;engine();renderAll();},'Reveal internals');break;
 case 'hide-debug':pause();data.revealed=false;representative=[];renderAll();break;
 case 'debug-next':pause();debugStep(1);break;case 'debug-prev':pause();debugStep(-1);break;
 case 'debug-reset':pause();debug.cell=0;debug.transition=0;debug.selected=null;representative=[];renderDebugger();renderBoard();break;
 case 'play':if(debug.playing){pause();renderDebugger();}else play();break;
 case 'reveal-answer':confirmAction('Reveal the minimum?','This will disclose the minimum XOR and highlight an optimal route on the grid.',()=>{const e=engine();debug.mode='cell';debug.cell=total()-1;debug.selected=e.min;representative=e.reconstruct(total()-1,e.min);renderDebugger();renderBoard();toast('Minimum final XOR: '+e.min);},'Reveal minimum');break;
 case 'cases':caseDialog();break;
 case 'open-case':$('#dialog').close();selectCase(b.dataset.caseId);break;
 case 'rename-case':{const c=data.cases.find(c=>c.id===b.dataset.caseId);$('#dialog').close();dialog('Rename test case',`<label>Name<input name="name" maxlength="120" value="${esc(c.name)}" required></label>`,f=>{c.name=String(f.get('name')).trim();if(!c.name)throw Error('Enter a name.');renderCases();save();},'Rename');break;}
 case 'duplicate-case':{const c=data.cases.find(c=>c.id===b.dataset.caseId);$('#dialog').close();addCase(c.name+' copy',c.grid,c.path);toast('Test case duplicated.');break;}
 case 'delete-case':{const c=data.cases.find(c=>c.id===b.dataset.caseId);if(data.cases.length===1){toast('Keep at least one test case.');break;}$('#dialog').close();confirmAction('Delete test case?',`Delete ${esc(c.name)} from this browser? Export it first if you want to keep a copy.`,()=>{data.cases=data.cases.filter(item=>item.id!==c.id);if(data.selected===c.id)selectCase(data.cases[0].id);else{renderCases();save();}},'Delete case');break;}
 case 'transfer':transferDialog();break;
 case 'copy-input':copyText(JSON.stringify(grid()),'Copied LeetCode-compatible grid input.');break;
 case 'export':exportCases($('#include-results').checked);break;
 case 'share':{const hash=encodeExperiment(grid(),current().path),url=location.origin+location.pathname+hash;if(url.length>7500){toast('This experiment link is too long. Use JSON export instead.');break;}copyText(url,'Experiment link copied. Hints and algorithm reveals are excluded.');break;}
 case 'reset-learning':confirmAction('Reset learning progress?','Close all hints and hide the debugger. Saved test cases and your manual path will be preserved.',()=>{pause();data.hints=[];data.revealed=false;representative=[];optimalRequest++;optimalComputing=false;optimalVisible=false;optimalAnalysis=null;renderLessons();renderAll();},'Reset progress');break;
 case 'example-mode':examples[exampleId].mode=examples[exampleId].mode==='edit'?'explore':'edit';renderExample(exampleId);break;
 case 'example-reset':examples[exampleId].path=[0];renderExample(exampleId);break;
 case 'load-example':case 'inspect-example':confirmAction(action==='inspect-example'?'Inspect this example?':'Load this example?',action==='inspect-example'?'Create a new test case from this isolated example and reveal its algorithm debugger. Your existing cases are preserved.':'Create a new test case from this isolated example. Your existing cases are preserved.',()=>{const ex=examples[exampleId];addCase('Hint '+(exampleId+1)+' experiment',ex.grid,ex.path);if(action==='inspect-example'){data.revealed=true;renderAll();if(presentationKind==='mobile')setMobileTab('debug');}},action==='inspect-example'?'Load and reveal':'Load example');break;
 case 'help':dialog('Problem rules and shortcuts',`<p>Begin at (0, 0). Move right or down, including both endpoints in your XOR. Find the smallest final XOR.</p><p><kbd>Right</kbd> or <kbd>Down</kbd> Move &nbsp; <kbd>Backspace</kbd> Undo &nbsp; <kbd>R</kbd> Reset</p><p>Shortcuts apply outside text fields and dialogs. In Edit mode, click a cell to change its value. Scroll to pan large grids, or drag the grid background. Use Go to cell for distant coordinates.</p><p>All values are integers from 0 to 1023; the grid contains at most 1,000 cells. Hints and debugger internals stay hidden until explicitly opened.</p>`,()=>{},'Done');break;
 }
});
document.addEventListener('change',e=>{if(e.target.matches('[data-example-input]')){const i=+e.target.dataset.exampleInput,c=+e.target.dataset.exampleCell,v=Number(e.target.value),ex=examples[i],n=ex.grid[0].length;if(e.target.value===''||!Number.isInteger(v)||v<0||v>1023){toast('Example values must be integers from 0 to 1023.');e.target.value=ex.grid[Math.floor(c/n)][c%n];return;}ex.grid[Math.floor(c/n)][c%n]=v;renderExample(i);}});
document.addEventListener('keydown',e=>{if($('#dialog').open||e.target.closest('input,textarea,select,[contenteditable="true"]')||e.target.closest('#learning,#inspector,#mobile-debug-panel,header,nav,[role="separator"]')||data.mode!=='explore')return;if(['ArrowRight','ArrowDown','Backspace','r','R'].includes(e.key)){e.preventDefault();if(e.key==='ArrowRight')move(end()+1);else if(e.key==='ArrowDown')move(end()+ncols());else if(e.key==='Backspace'){if(current().path.length>1){workspace.undo();verdict='';hover=null;renderAll();}}else{workspace.reset();verdict='';hover=null;representative=[];renderAll();}}});
document.addEventListener('pointerover',e=>{const cell=e.target.closest('[data-cell]');if(cell&&data.mode==='explore'){hover=+cell.dataset.cell;renderManual();}});document.addEventListener('pointerout',e=>{if(e.target.closest('[data-cell]')&&!e.relatedTarget?.closest('[data-cell]')){hover=null;renderManual();}});
window.addEventListener('beforeunload',()=>{if(dirty)persist();});

let pan=null;
function setupBoardInteractions() {
  const viewport = $('#board-viewport');
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.target.closest('button') || event.button !== 0) return;
    pan={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',event=>{if(pan){viewport.scrollLeft=pan.left+pan.x-event.clientX;viewport.scrollTop=pan.top+pan.y-event.clientY;}});
  viewport.addEventListener('pointerup',()=>{pan=null;});
  viewport.addEventListener('pointercancel',()=>{pan=null;});
}
// Keep article calculations reactive without replacing an input while it is being typed.
document.addEventListener('input',e=>{if(!e.target.matches('[data-example-input]'))return;const i=+e.target.dataset.exampleInput,c=+e.target.dataset.exampleCell,v=Number(e.target.value),ex=examples[i],n=ex.grid[0].length;if(e.target.value===''||!Number.isInteger(v)||v<0||v>1023)return;ex.grid[Math.floor(c/n)][c%n]=v;const container=e.target.closest('.example'),x=pathXor(ex.grid,ex.path),last=ex.path.at(-1),b=ex.grid[Math.floor(last/n)][last%n];container.querySelector('.example-result').innerHTML=`Your example XOR: <strong>${x}</strong> &middot; ${ex.path.length} cells`;container.querySelector('.xor-box').outerHTML=xorView(x^b,b,'Example operation');});


function menuDialog(title, content) {
  dialog(title, content, () => {}, 'Done');
  $('#dialog').dataset.kind = 'menu';
}
function mobileMenu() {
  menuDialog('Workspace menu', `<div class="mobile-menu-grid">${button('save','Save workspace')}${button('cases','Test cases')}${button('transfer','Import / Export')}${button('share','Copy experiment link')}${button('grid-tools','Grid tools')}${button('view-settings','View settings')}${button('help','Rules and shortcuts')}${button('reset-learning','Reset learning progress')}</div>`);
}
function gridTools() {
  menuDialog('Grid tools', `<div class="mobile-menu-grid">${button('resize','Dimensions')}${button('random','Generate grid')}${button('jump','Go to cell')}${button('fit','Fit grid')}${button('zoom-out','Zoom out')}${button('zoom-in','Zoom in')}</div><p class="muted">Scroll the grid in either direction. Valid next cells show your projected running XOR.</p>`);
}
function viewSettings() {
  dialog('View settings', `<label>Presentation<select name="presentation"><option value="auto">Automatic for this screen</option><option value="mobile">Mobile view</option><option value="desktop">Desktop view</option></select></label><p class="muted">Your grid and path stay the same when switching views. Layout, zoom, and mobile cell density are saved separately.</p><label>Mobile cell density<select name="density"><option value="compact">Compact</option><option value="comfortable">Comfortable</option></select></label>`, form => {
    data.presentationOverride = String(form.get('presentation'));
    data.viewPreferences.mobile.density = String(form.get('density')) === 'comfortable' ? 'comfortable' : 'compact';
    refreshPresentation(); save();
  }, 'Apply view');
  $('select[name="presentation"]').value = data.presentationOverride;
  $('select[name="density"]').value = data.viewPreferences.mobile.density;
}
renderShell();
if(storageWarning)persist();
if(restoreError)toast(restoreError);

async function toggleOptimalPaths() {
  if (optimalVisible) { optimalVisible = false; renderAll(); return; }
  const request = ++optimalRequest;
  optimalComputing = true; renderOptimalControls();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (request !== optimalRequest) return;
  try {
    optimalAnalysis = workspace.optimalRoutes(optimalLimit);
    optimalVisible = true; optimalFocus = 'all';
    if (presentationKind === 'mobile') setMobileTab('explore');
  } catch (error) { toast('Could not calculate optimal paths: ' + error.message); }
  finally { optimalComputing = false; renderAll(); }
}
