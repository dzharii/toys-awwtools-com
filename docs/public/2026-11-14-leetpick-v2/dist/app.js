import {KEY,decodeFragment,filterCatalog,randomIndex} from './core.js';
import {readProgressState,emptyProgressState,getSolvedIds,markProblemSolved,mergeProgressStates,parseProgressJSON} from './progress-state.js';
import {setupCelebration} from './celebration.js';
import {completionControl} from './completion-control.js';
import bookmarklet from './bookmarklet-link.js';
import {setupIllustrationPreview} from './illustration-preview.js';
const $=id=>document.getElementById(id);
let pendingHash=location.hash.startsWith('#import=')?location.hash:null;
if(pendingHash)history.replaceState(null,'',location.pathname+location.search);
let catalog=[],illustrations={},progress=null,manualSolvedIds=[],storageBroken=false,illustrationPreview=null,celebration=null,completionRenderTimer;
const currentState=()=>({version:2,source:'leetpick',imported:progress,manualSolvedIds});
const solved=()=>getSolvedIds(currentState());
function notice(message,error=false){$('notice').textContent=message;$('notice').className=error?'error':'';$('notice').hidden=false;}
function loadProgress(){try{const raw=localStorage.getItem(KEY);const state=raw?readProgressState(JSON.parse(raw)):emptyProgressState();progress=state.imported;manualSolvedIds=state.manualSolvedIds;storageBroken=false;}catch{progress=null;manualSolvedIds=[];storageBroken=true;notice('Saved progress could not be read. Browsing still works. Allow local storage, or clear this site\'s browser data if it is corrupted.',true);}}
function persistState(next){const state=readProgressState(next);localStorage.setItem(KEY,JSON.stringify(state));progress=state.imported;manualSolvedIds=state.manualSolvedIds;}
function withProgressLock(action){return location.protocol==='https:'&&navigator.locks?.request?navigator.locks.request('leetpick-progress',action):Promise.resolve().then(action);}
function updateSummary(){const ids=solved(),rows=filterCatalog(catalog,ids,options()),eligible=rows.filter(p=>!ids.has(p.id));
 const count=catalog.filter(p=>ids.has(p.id)).length;$('progress-label').textContent=`${count} / ${catalog.length}`;$('progress-bar').style.width=`${catalog.length?count/catalog.length*100:0}%`;$('rail-count').textContent=String(catalog.length);$('edition-count').textContent=String(catalog.length);$('progress-note').textContent=progress?`${catalog.length-count} left to explore. Synced as ${progress.username}.`:(count?`${catalog.length-count} left to explore. Saved in this browser.`:'Sync progress or mark a problem solved.');
 $('last-sync').textContent=progress?.lastImportedAt?'Last imported '+new Date(progress.lastImportedAt).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'No sync yet';
 $('result-count').textContent=`${rows.length} ${rows.length===1?'problem':'problems'} shown / ${catalog.length} reviewed`;$('empty').hidden=rows.length>0;$('pick').disabled=!eligible.length;$('pick').title=eligible.length?'Choose an unsolved problem':'No unsolved problems match your filters';$('clear').hidden=!($('search').value||$('difficulty').value!=='all'||$('status').value!=='all');$('backup-export').disabled=!(progress||manualSolvedIds.length);
}
async function completeProblem(p,row,button,keyboard){
 if(button.disabled)return;button.disabled=true;celebration.prepareSound();
 try{const changed=await withProgressLock(()=>{loadProgress();if(storageBroken)throw Error('Progress could not be saved. Allow local storage before marking a problem solved.');if(solved().has(p.id))return false;persistState(markProblemSolved(currentState(),p.id));return true;});
  if(!changed||!row.isConnected){render();return;}
  const cell=row.querySelector('.state-cell');const done=node('span','state solved','✓ Solved');done.title='Marked solved in this browser';cell.replaceChildren(done);row.classList.add('completion-saved');
  if(keyboard){done.tabIndex=-1;done.dataset.completedFocus=String(p.id);done.focus({preventScroll:true});}
  $('picked').hidden=true;updateSummary();notice(`Marked #${p.id} as solved. Saved in this browser.`);
  illustrationPreview?.dismiss();celebration.play(row.querySelector('.illustration-wrap'),cell.getBoundingClientRect());
  clearTimeout(completionRenderTimer);completionRenderTimer=setTimeout(render,850);
 }catch(error){button.disabled=false;notice(error.name==='QuotaExceededError'||error.name==='SecurityError'?'Progress could not be saved. Existing progress was kept.':error.message,true);}
}
function options(){return {search:$('search').value,difficulty:$('difficulty').value,status:$('status').value};}
function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;}
function problemLink(p){const a=node('a','problem-title',p.title);a.href=`https://leetcode.com/problems/${p.slug}/`;a.target='_blank';a.rel='noopener noreferrer';a.append(node('span','external','↗'));return a;}
function shareLink(p){const a=node('a','share-problem','Share');const path=`share/${p.id}-${p.slug}/`;a.href=location.protocol==='file:'?'dist/'+path+'index.html':'/'+path;a.setAttribute('aria-label','Share '+p.title);return a;}
function render(){const restoreFocus=document.activeElement?.dataset.completedFocus;clearTimeout(completionRenderTimer);celebration?.cancel();illustrationPreview?.dismiss();const ids=solved(),rows=filterCatalog(catalog,ids,options()),eligible=rows.filter(p=>!ids.has(p.id));$('rows').replaceChildren();let group=null;
 for(const p of rows){const done=ids.has(p.id);if(group!==done){group=done;const r=node('tr','group'+(done?' solved-group':''));const cell=node('td','',done?'Already solved':'Ready to solve');cell.colSpan=5;r.append(cell);$('rows').append(r);}
 const row=node('tr',done?'solved-row':'');row.dataset.problemId=String(p.id);row.append(node('td','number',String(p.id)));const title=node('td');const heading=node('div','problem-heading');heading.append(problemLink(p),shareLink(p));title.append(heading,node('p','summary',p.summary));row.append(title);const art=node('td','illustration-cell');const asset=illustrations[p.id];if(asset){const img=node('img','problem-illustration');img.src=asset.src;img.width=asset.width;img.height=asset.height;img.alt=asset.alt;img.loading='lazy';img.decoding='async';const wrap=node('div','illustration-wrap');wrap.append(img);art.append(wrap);}row.append(art);const difficulty=node('td','difficulty-cell');difficulty.append(node('span','badge'+(p.difficulty==='Hard'?' hard':''),p.difficulty));row.append(difficulty);const status=node('td','state-cell');if(done){const state=node('span','state solved','✓ Solved');state.title=manualSolvedIds.includes(p.id)?'Marked solved in this browser':'Imported as solved from LeetCode';status.append(state);}else status.append(completionControl(p,completeProblem));row.append(status);$('rows').append(row);}
 updateSummary();
 if(restoreFocus){const target=$('rows').querySelector(`tr[data-problem-id="${restoreFocus}"] .state.solved`)||$('rows').querySelector('.completion-trigger')||$('status');if(target.matches('.state.solved'))target.tabIndex=-1;target.focus({preventScroll:true});}
}
function resetFilters(){$('search').value='';$('difficulty').value='all';$('status').value='all';$('picked').hidden=true;render();}
async function receive(incoming){try{
 const incomingState=readProgressState(incoming);loadProgress();if(storageBroken)throw Error('Saved progress is unavailable. Import was not saved.');
 let approvedFrom=null;const username=incomingState.imported?.username;
 if(progress&&username&&progress.username.toLowerCase()!==username.toLowerCase()){
  const previous=progress.username;$('account-message').textContent=`This export belongs to ${username}. Switching replaces ${previous}'s imported and manually marked progress. Export a backup first if you want to keep it.`;
  $('account-dialog').showModal();const replace=await new Promise(resolve=>{const finish=value=>{$('account-dialog').close();resolve(value);};$('account-cancel').onclick=()=>finish(false);$('account-confirm').onclick=()=>finish(true);$('account-dialog').oncancel=()=>resolve(false);});
  if(!replace){notice('Account switch cancelled. Existing progress was kept.');return;}approvedFrom=previous.toLowerCase();
 }
 const result=await withProgressLock(()=>{
  loadProgress();if(storageBroken)throw Error('Saved progress is unavailable. Import was not saved.');
  if(approvedFrom&&progress?.username.toLowerCase()!==approvedFrom)throw Error('The active account changed in another tab. Import again to review the account switch.');
  const changing=progress&&username&&progress.username.toLowerCase()!==username.toLowerCase();const before=changing?new Set():solved();
  const next=mergeProgressStates(currentState(),incomingState,!!approvedFrom);persistState(next);
  return {added:[...solved()].filter(id=>!before.has(id)).length,count:catalog.filter(p=>solved().has(p.id)).length};
 });
 $('picked').hidden=true;render();notice(`${username?'Progress imported for '+username:'Local progress imported'}. ${result.added} newly recorded solved problems; ${result.count} of ${catalog.length} on this shortlist solved.`);
 }catch(error){notice(error.name==='QuotaExceededError'||error.name==='SecurityError'?'Progress could not be saved. Existing progress was kept.':error.message,true);}}
async function importHash(){const hash=pendingHash||location.hash;pendingHash=null;if(!hash.startsWith('#import='))return;history.replaceState(null,'',location.pathname+location.search);try{await receive(decodeFragment(hash));}catch(e){notice(e.message,true);}}
$('bookmark').href=bookmarklet;$('bookmark').onclick=e=>{e.preventDefault();$('copy-state').textContent='Drag this to your bookmarks bar, then run the saved bookmark on LeetCode.';};
$('copy-bookmark').onclick=async()=>{try{await navigator.clipboard.writeText(bookmarklet);$('copy-state').textContent='Code copied. Paste it into a bookmark URL.';}catch{$('copy-state').textContent='Clipboard unavailable. Drag the bookmark button to your bookmarks bar instead.';}};
$('sync-open').onclick=()=>$('sync-dialog').showModal();$('method-open').onclick=()=>$('method-dialog').showModal();document.querySelectorAll('.close').forEach(button=>button.onclick=()=>button.closest('dialog').close());
for(const id of ['search','difficulty','status'])$(id).addEventListener(id==='search'?'input':'change',()=>{$('picked').hidden=true;render();});$('clear').onclick=resetFilters;$('empty-clear').onclick=resetFilters;
$('pick').onclick=()=>{const choices=filterCatalog(catalog,solved(),options()).filter(p=>!solved().has(p.id));try{const p=choices[randomIndex(choices.length)];const panel=$('picked');panel.replaceChildren();const dismiss=node('button','','Dismiss');dismiss.onclick=()=>panel.hidden=true;const heading=node('h2','',`${p.id}. ${p.title}`);const a=node('a','','Open on LeetCode ↗');a.href=`https://leetcode.com/problems/${p.slug}/`;a.target='_blank';a.rel='noopener noreferrer';panel.append(dismiss,node('div','selection-label','Your next problem'),heading,node('p','',p.summary),a,shareLink(p));panel.hidden=false;}catch(e){notice(e.message);}};
$('backup-export').onclick=()=>{if(!progress&&!manualSolvedIds.length)return;const text=JSON.stringify(readProgressState(currentState()),null,2);const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=node('a');a.href=url;a.download='leetpick-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);};
$('file-import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>200000)throw Error('This export is too large. Maximum size is 200 KB.');const payload=parseProgressJSON(await file.text());$('sync-dialog').close();await receive(payload);}catch(error){$('sync-dialog').close();notice(error.message,true);}finally{e.target.value='';}};
window.addEventListener('hashchange',importHash);window.addEventListener('storage',e=>{if(e.key===KEY){loadProgress();$('picked').hidden=true;render();}});
illustrationPreview=setupIllustrationPreview($('rows'));
celebration=setupCelebration(()=>$('celebration-sound').checked);
try{$('celebration-sound').checked=localStorage.getItem('leetpick.celebrationSound')!=='off';}catch{}
$('celebration-sound').onchange=()=>{try{localStorage.setItem('leetpick.celebrationSound',$('celebration-sound').checked?'on':'off');}catch{}};
loadProgress();
try{const response=await fetch('catalog.json');if(!response.ok)throw Error('Catalog failed to load. Reload to try again.');const data=await response.json();const artResponse=await fetch('illustrations.json');if(!artResponse.ok)throw Error('Illustrations failed to load. Reload to try again.');illustrations=await artResponse.json();catalog=data.problems;if(!Array.isArray(catalog)||!catalog.every(p=>Number.isSafeInteger(p.id)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)))throw Error('Catalog data is invalid.');$('coverage').textContent=data.coverage;render();await importHash();}catch(e){$('result-count').textContent='Catalog unavailable';$('pick').disabled=true;notice(e.message,true);}

const themeButton=$('theme-toggle');function applyTheme(theme){document.documentElement.dataset.theme=theme;themeButton.textContent=theme==='dark'?'Light theme':'Dark theme';themeButton.setAttribute('aria-label',theme==='dark'?'Switch to light theme':'Switch to dark theme');}let savedTheme='dark';try{savedTheme=localStorage.getItem('clearpick.theme')==='light'?'light':'dark';}catch{}applyTheme(savedTheme);themeButton.onclick=()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';applyTheme(next);try{localStorage.setItem('clearpick.theme',next);}catch{}};
