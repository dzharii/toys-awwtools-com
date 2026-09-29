import {createApp,icon,$,$$,escapeHTML as esc,swipe,animate,fail} from './core.js';
try {
  const app=await createApp('folio');
  $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  let category='search',index=0;
  const favorites=['google-web','instagram-following','duck-images','docs-compose'];
  let notes=[...favorites.map(id=>app.byId(id)),...app.entries.filter(e=>!favorites.includes(e.id))];
  $('#tabs').innerHTML=app.categories.slice(0,6).map(c=>`<button data-tab="${c.id}" aria-pressed="${c.id===category}">${c.name}</button>`).join('')+'<button data-tab="all">All subjects</button>';
  function render(turn=false) {
    const e=notes[index];
    $('.note-number').textContent=String(app.entries.indexOf(e)+1).padStart(2,'0');
    $('#paper-content').innerHTML=`<p class="service-line">${esc(e.service)} / ${esc(e.kind)}</p><h2>${esc(e.title)}</h2><p class="summary">${esc(e.summary)}</p><button class="primary" data-fix="${e.id}">Use this fix ${icon('arrow')}</button>`;
    $('#position').textContent=`${String(index+1).padStart(2,'0')} / ${String(notes.length).padStart(2,'0')}`;
    $('#under-notes').innerHTML=Array.from({length:Math.min(3,notes.length-1)},(_,i)=>{
      const n=notes[(index+i+1)%notes.length];
      return `<button class="note-peek" data-note="${(index+i+1)%notes.length}"><span class="eyelet" aria-hidden="true"></span><small>${String(app.entries.indexOf(n)+1).padStart(2,'0')}</small><strong>${esc(n.title)}</strong></button>`;
    }).join('');
    $$('[data-tab]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.tab===e.category));
    if(turn){app.sound();animate($('#paper'),[{opacity:.3,transform:'translateX(22px) rotate(1deg)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});}
  }
  function step(amount){index=(index+amount+notes.length)%notes.length;render(true);}
  $('#next').onclick=()=>step(1);$('#previous').onclick=()=>step(-1);
  $('#under-notes').onclick=e=>{const b=e.target.closest('[data-note]');if(b){index=Number(b.dataset.note);render(true);}};
  $('#tabs').onclick=e=>{
    const b=e.target.closest('[data-tab]');if(!b)return;
    if(b.dataset.tab==='all'){app.showLibrary();return;}
    category=b.dataset.tab;notes=app.byCategory(category);index=0;render(true);
  };
  swipe($('#paper'),step);
  $('#main').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}});
  const updateSaved=()=>$('#saved-count').textContent=app.saved.length?`(${app.saved.length})`:'';
  document.addEventListener('ilud:state',updateSaved);updateSaved();render();
} catch(error){fail(error);}
