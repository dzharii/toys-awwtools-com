(function(){
'use strict';
const catalog=window.COURTESY_CATALOG||[];
// Passages are stored as they were written. Their plain reading is derived once,
// here, so nothing downstream has to know about the marks.
if(window.CourtesyPassage)window.CourtesyPassage.hydrate(catalog);
const groups=[
{id:'all',title:'All occasions',desc:'Find the right words for the moment. Borrow a phrase, explore a pattern, or compose a complete message.',cats:[],plate:0},
{id:'entrance',title:'A courteous entrance',desc:'Apologies, interruptions and regretful reports. A fitting beginning, before the facts.',cats:['apology','attention','regret'],plate:0},
{id:'difficulty',title:'Difficult circumstances',desc:'Awkward predicaments, gentle corrections and recognition of a reasonable request.',cats:['predicament','correction','recognition','responsibility'],plate:1},
{id:'boundaries',title:'Permission & restraint',desc:'Courteous refusals, deliberate confirmations and a reluctance to presume.',cats:['refusal','confirmation'],plate:1},
{id:'state',title:'Certainty & caution',desc:'What happened, what did not, and what cannot yet be established.',cats:['assurance','uncertainty','caution'],plate:2},
{id:'remedy',title:'Remedies & recovery',desc:'The next useful step, a graceful retirement, or the account of a successful recovery.',cats:['remedy','recovery','cancellation'],plate:3},
{id:'character',title:'A little character',desc:'Institutional metaphors, elegant understatement and a suitably embarrassed machine.',cats:['personification','confession','understatement'],plate:0},
{id:'conclusion',title:'A gracious conclusion',desc:'Success, empty states and respectful endings. Personality need not be reserved for failure.',cats:['success','empty','closure'],plate:3},
{id:'grammar',title:'Patterns & particulars',desc:'Compositional formulas, technical particulars and the vocabulary that holds a message together.',cats:['grammar','technical'],plate:2}
];
const $=id=>document.getElementById(id);let group='all',view='library',limit=30,filtered=[],timer;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusNames={ready:'Ready to adapt',context:'Use with context',avoid:'Counterexample'};
const kindNames={phrase:'Phrase',example:'Example',pattern:'Pattern',avoid:'Counterexample',passage:'Passage'};
// Two brackets around a small sign of making: the mark for "write this as code".
const codeIcon='<svg class="codegen-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.6 6.5 3.2 11.4a.9.9 0 0 0 0 1.2l4.4 4.9"/><path d="M16.4 6.5 20.8 11.4a.9.9 0 0 1 0 1.2l-4.4 4.9"/><path d="M12 8.6c.3 1.9 1.2 2.8 3.1 3.1-1.9.3-2.8 1.2-3.1 3.1-.3-1.9-1.2-2.8-3.1-3.1 1.9-.3 2.8-1.2 3.1-3.1Z"/></svg>';
// One sheet laid over another, and the tick that briefly replaces it. Both are
// present in the button at once; which one shows is settled in the stylesheet,
// so a successful copy changes nothing about the button's size or position.
const copyMark='<svg class="copy-glyph copy-glyph-rest" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.6 8.4V6.1a1.7 1.7 0 0 0-1.7-1.7H6.1A1.7 1.7 0 0 0 4.4 6.1v7.8a1.7 1.7 0 0 0 1.7 1.7h2.3"/><rect x="8.4" y="8.4" width="11.2" height="11.2" rx="1.7"/></svg><svg class="copy-glyph copy-glyph-done" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5.2 12.6 4.6 4.6L18.8 7.4"/></svg>';
/* A compact control placed beside the text it has authority over. The visible
 * mark is small; the button around it is not, so it stays comfortable to hit. */
function copyControl(id, what, label){
  return `<button type="button" class="copy-icon" data-copy="${esc(id)}" data-copy-what="${esc(what)}" aria-label="${esc(label)}" title="Copy">${copyMark}</button>`;
}
/* The example is a specimen, not decoration, so it is presented as one: a
 * header naming it, a fine rule, and the text itself in a native text field.
 *
 * A textarea is used deliberately, because only a real text control gives the
 * reader a caret, word-wise movement, keyboard selection, Select All and the
 * platform's own copy command. Its default wrapping is also exactly what these
 * specimens need: every deliberate space and line break is kept, and a line is
 * folded only when the measure is genuinely too narrow.
 *
 * It is not marked `readonly`, though it behaves as if it were. Chrome, tested
 * directly, refuses to move the caret inside a readonly textarea at all: the
 * field takes focus and Select All works, but arrow keys, Home, and Shift-
 * selection do nothing. That would cost the reader most of the repertoire the
 * specimen exists to offer. So the field is left editable to the browser and
 * every attempted change is refused in one place instead - see the beforeinput
 * rule below - which is a single semantic veto rather than a catalogue of
 * individual keystrokes, and so survives other keyboards, layouts, input
 * methods and assistive technologies. `aria-readonly` tells the same story to
 * anything reading the page, and `inputmode="none"` keeps the on-screen
 * keyboard away on touch devices while leaving the caret and selection intact.
 */
function specimen(label, text, copyId, what, copyLabel){
  const rows=Math.max(1,String(text).split('\n').length);
  // The parser discards a single newline immediately after the opening tag, so
  // one is supplied deliberately. Everything after it - including the leading
  // spaces that align the small tables in many of these specimens - survives
  // exactly as stored, whatever the text happens to begin with.
  return `<section class="card-example"><div class="example-head"><span class="example-label">${esc(label)}</span>${copyControl(copyId,what,copyLabel)}</div><textarea class="example-text" rows="${rows}" aria-readonly="true" inputmode="none" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="${esc(label)}">\n${esc(text)}</textarea></section>`;
}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('show'),3000)}
function navigate(target){view=target;document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!=='view-'+target);document.querySelectorAll('.top-tab').forEach(el=>{const on=el.dataset.view===target;el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on))});}
function nav(){ $('category-nav').innerHTML=groups.map((g,i)=>{const count=catalog.filter(x=>(g.id==='all'||g.cats.includes(x.category))&&x.status!=='avoid').length;return `<button class="category-button ${group===g.id?'active':''}" data-group="${g.id}" aria-pressed="${group===g.id}"><span class="num">${String(i).padStart(2,'0')}</span><span>${g.title}</span><span class="count">${count}</span></button>`}).join('');}
function selectGroup(id){group=id;limit=30;navigate('library');nav();const g=groups.find(g=>g.id===id);$('category-title').textContent=id==='all'?'A little more gracious.':g.title;$('category-description').textContent=g.desc;const plate=document.querySelector('.mini-plate');plate.className='mini-plate plate-'+g.plate;plate.setAttribute('aria-label',['A mechanical clerk presenting a letter','A gatekeeper holding a key','An archivist protecting files','Two couriers exchanging a letter'][g.plate]);render();}
function filter(){const query=$('search').value.toLowerCase().trim().split(/\s+/).filter(Boolean),g=groups.find(g=>g.id===group);return catalog.filter(x=>{const hay=[x.text,x.originalText,x.category,x.note,x.editorialNote,x.sources.join(' '),x.register,x.announcement,x.summary].filter(Boolean).join(' ').toLowerCase();return (group==='all'||g.cats.includes(x.category))&&(!$('kind').value||x.kind===$('kind').value)&&(!$('register').value||x.register===$('register').value)&&(!$('origin').value||($('origin').value==='v2'?x.addedVersion===2:x.origin===$('origin').value))&&($('editorial').value==='all'||($('editorial').value?x.status===$('editorial').value:x.status!=='avoid'))&&query.every(term=>hay.includes(term));});}
// A passage keeps its marks in storage; this is where they become typography.
// A control label is set in the interface's own voice, a literal is set as
// code, and a blank is set as code that is visibly still waiting for a value.
function passageBody(passage){const P=window.CourtesyPassage;return P.paragraphs(passage).map((paragraph,i)=>`<p class="${i?'passage-line':'passage-lede'}">${P.runs(paragraph).map(run=>{let html=esc(run.v);if(run.c)html=`<code class="${run.p?'param':'literal'}">${html}</code>`;if(run.s)html=`<strong class="ui-label">${html}</strong>`;return html;}).join('')}</p>`).join('');}
function passageCard(x){const P=window.CourtesyPassage,blanks=P.blanks(x.passage);
// The announcement repeats the folio for most passages, so it is printed only
// where it says something the folio does not.
const occasion=x.announcement.toLowerCase()===x.category?esc(x.summary):`<span class="passage-announcement">${esc(x.announcement)}</span> ${esc(x.summary)}`;
return `<article class="phrase-card passage-card" id="phrase-${esc(x.id)}"><button class="codegen-open" data-codegen="${esc(x.id)}" title="Generate code for this message" aria-label="Generate code for entry ${esc(x.id)}">${codeIcon}</button><div class="card-meta"><span class="folio">${esc(x.category.replace(/-/g,' '))}</span><span>${esc(kindNames[x.kind])}</span><span>${esc(x.register)}</span>${x.origin==='new'?'<span>NEW</span>':''}</div><div class="passage-head"><p class="passage-occasion">${occasion}</p>${copyControl(x.id,'phrase','Copy passage')}</div><div class="phrase-passage">${passageBody(x.passage)}</div>${blanks.length?`<details class="card-sample"><summary>Read it with sample values (${blanks.length} ${blanks.length===1?'blank':'blanks'})</summary>${specimen('With sample values',P.fill(x.passage),x.id,'sample','Copy passage with sample values')}</details>`:''}<details class="card-note"><summary>${statusNames[x.status]}</summary><p>${esc(x.editorialNote)}</p></details><div class="card-actions"><span class="source-ref">${esc(x.sources.join(', '))}</span><button class="use-button" data-use="${esc(x.id)}">Compose with this &gt;</button></div></article>`;}
function card(x){if(x.kind==='passage')return passageCard(x);let note=x.editorialNote;if(x.status==='ready'&&note.startsWith('Suitable when the described fact'))note=x.kind==='phrase'?'Pair this phrase with a specific fact and, where useful, a next step.':x.note;if(note==='Source draft; retained for editorial selection.')note='Adapt the particulars to the observed situation.';const preferred=x.kind==='avoid';return `<article class="phrase-card" id="phrase-${esc(x.id)}">${x.kind!=='avoid'?`<button class="codegen-open" data-codegen="${esc(x.id)}" title="Generate code for this message" aria-label="Generate code for entry ${esc(x.id)}">${codeIcon}</button>`:''}<div class="card-meta"><span class="folio">${esc(x.category.replace(/-/g,' '))}</span><span>${esc(kindNames[x.kind])}</span><span>${esc(x.register)}</span>${x.origin==='new'?'<span>NEW</span>':''}</div><div class="phrase-line"><p class="phrase-text ${x.text.length>200?'long ':''}${x.kind==='pattern'?'pattern':''}">${esc(x.text)}</p>${copyControl(x.id,'phrase','Copy phrase')}</div>${x.example?specimen(preferred?'Preferred instead':'Example in use',x.example,x.id,'example',preferred?'Copy preferred wording':'Copy example message'):''}<details class="card-note"><summary>${statusNames[x.status]}</summary><p>${esc(note)}</p></details>${x.edited?`<details class="original"><summary>View original draft wording</summary><p>${esc(x.originalText)}</p></details>`:''}<div class="card-actions"><span class="source-ref">${esc(x.sources.join(', '))}</span>${x.kind!=='avoid'?`<button class="use-button" data-use="${esc(x.id)}">Compose with this &gt;</button>`:''}</div></article>`;}
/* A specimen should show all of itself. The rows attribute gets the height
 * roughly right before paint; this settles it exactly, allowing for whatever
 * wrapping the current measure has imposed. */
function autosize(box){if(!box||!box.isConnected)return;box.style.height='auto';const chrome=box.offsetHeight-box.clientHeight;box.style.height=(box.scrollHeight+chrome)+'px';}
function autosizeAll(root){(root||document).querySelectorAll('.example-text').forEach(box=>{if(box.clientWidth)autosize(box);});}
function render(){filtered=filter();$('result-count').textContent=`${filtered.length} ${filtered.length===1?'entry':'entries'}${group==='all'?' in the reference':' in this collection'}`;$('cards').innerHTML=filtered.slice(0,limit).map(card).join('');$('empty').hidden=!!filtered.length;$('load-more').hidden=limit>=filtered.length;$('shown-count').textContent=filtered.length?`Showing ${Math.min(limit,filtered.length)} of ${filtered.length}`:'';autosizeAll($('cards'));}
function reset(){['search','kind','register','origin','editorial'].forEach(id=>$(id).value='');limit=30;selectGroup('all');}
/* The clipboard arrangements are unchanged in substance: the asynchronous API
 * where it is available, the selection-and-execCommand fallback where it is
 * not. Two things are new. It now reports whether it succeeded, so that a
 * control never claims an operation it did not perform; and it puts focus back
 * where it found it, since the fallback has to borrow the selection. */
async function copyText(text){
  const returnTo=document.activeElement;
  try{
    if(!navigator.clipboard)throw Error();
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    const area=document.createElement('textarea');
    area.value=text;area.setAttribute('readonly','');
    area.style.position='fixed';area.style.top='-999px';
    document.body.appendChild(area);area.select();
    let ok=false;
    try{ok=document.execCommand('copy')}catch(e){}
    area.remove();
    if(returnTo&&returnTo.focus)returnTo.focus();
    return ok;
  }
}
/* The success is shown on the control that performed it, so there is never a
 * question of which text was copied. The announcement is separate and silent,
 * for readers who cannot see the mark change; focus is not disturbed. */
function announce(message){const node=$('copy-status');if(!node)return;node.textContent='';window.requestAnimationFrame(()=>{node.textContent=message;});}
function copyFrom(button){
  const entry=catalog.find(x=>x.id===button.dataset.copy);
  if(!entry)return;
  // A specimen is copied from the field the reader can see, so the control and
  // the visible text can never disagree about what was taken.
  const panel=button.closest('.card-example');
  const box=panel&&panel.querySelector('.example-text');
  const text=box?box.value:entry.text;
  const what=button.dataset.copyWhat==='phrase'?'Wording':'Example';
  copyText(text).then(ok=>{
    if(!ok){toast('Clipboard unavailable. Select the wording and copy it manually.');return;}
    button.classList.add('copied');
    clearTimeout(button.copyTimer);
    button.copyTimer=setTimeout(()=>button.classList.remove('copied'),1500);
    announce(what+' copied.');
  });
}
document.addEventListener('click',e=>{const target=e.target.closest('button');if(!target)return;if(target.dataset.view){navigate(target.dataset.view);window.scrollTo({top:0});}if(target.dataset.group)selectGroup(target.dataset.group);if(target.dataset.copy){copyFrom(target);}if(target.dataset.codegen){const x=catalog.find(x=>x.id===target.dataset.codegen);if(x&&window.CourtesyCodegen)window.CourtesyCodegen.open({text:x.text,id:x.id,category:x.category,register:x.register,kind:x.kind,example:x.example,passage:x.passage});}if(target.dataset.use){const x=catalog.find(x=>x.id===target.dataset.use);navigate('constructor');window.CourtesyConstructor.load(x.text);$('ctor-status').textContent=x.status==='context'?'Usage note: '+x.editorialNote:'Library wording loaded. Fill the placeholders or adapt the draft.';window.scrollTo({top:0});}});
// A specimen inside a closed disclosure has no height to measure, so it is
// measured when the disclosure opens. The toggle event does not bubble.
document.addEventListener('toggle',e=>{if(e.target.open)autosizeAll(e.target);},true);
/* Every way of altering a specimen - typing, deletion, cut, paste, a dropped
 * payload, autocorrect, undo, a composed character from an input method -
 * arrives as one beforeinput event, and one refusal covers them all. Nothing
 * here looks at which key was pressed, so no keyboard, layout or input method
 * can find a way round it. */
document.addEventListener('beforeinput',e=>{if(e.target.classList&&e.target.classList.contains('example-text'))e.preventDefault();},true);
/* A few input methods commit text through an event that cannot be refused.
 * The stored text is the element's own default value, which editing never
 * touches, so it can always be put back. */
document.addEventListener('input',e=>{const box=e.target;if(box.classList&&box.classList.contains('example-text')&&box.value!==box.defaultValue)box.value=box.defaultValue;},true);
// The measure changes with the viewport, and so does the wrapping.
let sizeTimer;window.addEventListener('resize',()=>{clearTimeout(sizeTimer);sizeTimer=setTimeout(()=>autosizeAll($('cards')),120);});
['search','kind','register','origin','editorial'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{if(id==='kind'&&$('kind').value==='avoid')$('editorial').value='all';limit=30;render();}));
$('clear').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);$('load-more').addEventListener('click',()=>{limit+=30;render();});
$('print').addEventListener('click',()=>{limit=filtered.length;render();window.print();});
$('back-top').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();navigate('library');$('search').focus();}if(e.key==='Escape'&&document.activeElement===$('search')){$('search').value='';render();}});
$('collection-size').textContent=`${catalog.length} entries / ${catalog.filter(x=>x.origin==='new').length} new additions / 4 registers`;
nav();render();
})();
