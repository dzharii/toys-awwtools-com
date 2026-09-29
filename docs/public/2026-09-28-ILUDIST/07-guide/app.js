import{createApp,icon,$,$$,escapeHTML as esc,animate,fail}from'./core.js';
try{
 const app=await createApp('guide');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 const concerns=[{id:'answer',icon:'star',title:'Answering<br>for me',note:'I want to find my own answer',categories:['search','writing','utilities','translation','weather','maps']},{id:'choose',icon:'avoid',title:'Deciding<br>what I see',note:'I want a little more control',categories:['social','video','reading','shopping','browsing']},{id:'generate',icon:'reading',title:'Generated<br>content',note:'I want a clearer source',categories:['images','writing','video','reading','shopping']}];
 let concern=0,category='search',selected='google-web';
 const outline=`<svg class="ornate-outline" viewBox="0 0 240 270" preserveAspectRatio="none" aria-hidden="true"><path class="fill" d="M120 3C93 35 31 37 9 75v151c25 25 85 9 111 40 26-31 86-15 111-40V75c-22-38-84-40-111-72Z"/><path class="outer" d="M120 3C93 35 31 37 9 75v151c25 25 85 9 111 40 26-31 86-15 111-40V75c-22-38-84-40-111-72Z"/><path class="inner" d="M120 16C90 45 36 49 18 80v140c27 20 74 11 102 33 28-22 75-13 102-33V80c-18-31-72-35-102-64Z"/><path d="m120 17 4 9 8 4-8 4-4 9-4-9-8-4 8-4Z" fill="#a6885b"/></svg>`;
 $('#concerns').innerHTML=concerns.map((c,i)=>`<button class="concern" data-concern="${i}" aria-pressed="${i===0}">${outline}${icon(c.icon)}<strong>${c.title}</strong><small>${c.note}</small></button>`).join('');
 function eligible(){return app.byCategory(category).filter(e=>!$('#phone-only').checked||e.mobile);}
 function render(turn=true){
  const c=concerns[concern];
  if(!c.categories.includes(category))category=c.categories[0];
  $('#activities').innerHTML=c.categories.map(id=>{const cat=app.categories.find(c=>c.id===id);return`<button class="activity" data-activity="${id}" aria-pressed="${id===category}">${icon(id)}<span>${esc(cat.name.replace(' & travel','').replace('Everyday tools','Everyday'))}</span></button>`;}).join('');
  const found=eligible();if(!found.some(e=>e.id===selected))selected=found[0]?.id;
  const e=app.byId(selected),name=app.categories.find(v=>v.id===category).name;
  $('#result-art').innerHTML=`<div class="preview-card"><div class="preview-brand">ILUD / ${name.toUpperCase()}</div><div class="preview-search">${icon('search')} Your intention</div>${icon(category)}<div class="preview-rule"></div><div class="preview-rule"></div><div class="preview-rule"></div></div>`;
  $('#result-content').innerHTML=e?`<span class="eyebrow">03 / A USEFUL NEXT STEP</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><button class="primary" data-fix="${e.id}">Use this fix ${icon('arrow')}</button>`:`<span class="eyebrow">03 / A DIFFERENT PATH</span><h2>No phone-specific fix here.</h2><p>Turn the phone-only filter off or choose another activity.</p>`;
  $('#result-platform').innerHTML=icon(e?.mobile?'phone':'browsing')+(e?(e.mobile?'Phone guidance':'Desktop guidance'):'No matching route');
  $('#options').innerHTML=found.filter(v=>v.id!==selected).map(v=>`<button class="guided-option" data-option="${v.id}"><span><small>${esc(v.service)} / ${esc(v.kind)}</small>${esc(v.short)}</span>${icon('arrow')}</button>`).join('')||'<p class="micro">This is the considered route for these choices. The full collection has other approaches.</p>';
  $$('[data-concern]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.concern)===concern));
  $('#lit-branch').setAttribute('d',['M150 0v20q0 25 30 25h240q30 0 30 25v30','M450 0v100','M750 0v20q0 25-30 25H480q-30 0-30 25v30'][concern]);
  $('#trail').textContent=`Your path: ${c.title.replace('<br>',' ')} / ${name}${e?` / ${e.service}`:''}`;
  if(turn){app.sound();animate($('.illuminated-result'),[{opacity:.3,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:350});}
 }
 $('#concerns').onclick=e=>{const b=e.target.closest('[data-concern]');if(b){concern=Number(b.dataset.concern);category=concerns[concern].categories[0];selected=null;render();}};
 $('#activities').onclick=e=>{const b=e.target.closest('[data-activity]');if(b){category=b.dataset.activity;selected=null;render();$(`[data-activity="${category}"]`).focus({preventScroll:true});}};
 $('#options').onclick=e=>{const b=e.target.closest('[data-option]');if(b){selected=b.dataset.option;render();const heading=$('#result-content h2');heading.tabIndex=-1;heading.focus({preventScroll:true});app.toast('A different route is now in the illuminated panel.');}};
 $('#phone-only').onchange=()=>render();
 $('#restart').onclick=()=>{concern=0;category='search';selected='google-web';$('#phone-only').checked=false;render();$('#concerns button').focus();};
 render(false);
}catch(error){fail(error);}
