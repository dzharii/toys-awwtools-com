import{createApp,icon,$,$$,escapeHTML as esc,animate,fail}from'./core.js';
try{
 const app=await createApp('cabinet');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 let category='search',index=0;
 function toolSVG(id,suffix=''){
  const g=`metal-${id}${suffix}`,w=`handle-${id}${suffix}`,glass=`glass-${id}${suffix}`;
  const stem=`<path d="M53 132h14l6 112q-12 9-26 0Z" fill="url(#${w})" stroke="#22180d" stroke-width="2"/><path d="M50 141h20v7H50zm-2 92h24v9H48z" fill="url(#${g})" stroke="#5a3b18"/><ellipse cx="60" cy="247" rx="16" ry="4" fill="url(#${g})" stroke="#4d361b"/>`;
  const heads={
   search:`<circle cx="60" cy="75" r="48" fill="url(#${glass})" stroke="url(#${g})" stroke-width="10"/><circle cx="60" cy="75" r="40" fill="none" stroke="#d3caaf" stroke-width="1.5"/><path d="M27 62a35 35 0 0 1 34-23l-9 14q-15 1-21 16Z" fill="#fff" opacity=".38"/><path d="M87 80a30 30 0 0 1-20 25" stroke="#ddd7c8" stroke-width="8" opacity=".3" fill="none"/><path d="M55 126h10v12H55z" fill="url(#${g})"/>`,
   social:`<g fill="url(#${g})" stroke="#725126"><circle cx="60" cy="66" r="15"/><circle cx="29" cy="81" r="11"/><circle cx="91" cy="81" r="11"/><path d="M14 122v-19q15-19 30 0v19zm62 0v-19q15-19 30 0v19zM39 130V99q21-24 42 0v31Z"/></g>`,
   writing:`<path d="m60 17 27 74-19 44H51L33 91Z" fill="url(#${g})" stroke="#dbb572" stroke-width="1.5"/><path d="M60 18v86m-9 31 2-33m15 33-1-33" stroke="#4b361a" stroke-width="1.5"/><circle cx="60" cy="91" r="4" fill="#171510"/><path d="M40 132h40v6H40z" fill="url(#${g})"/>`,
   images:`<rect x="15" y="48" width="90" height="85" rx="5" fill="url(#${g})" stroke="#442e15" stroke-width="2"/><rect x="22" y="55" width="76" height="70" fill="#282a22" stroke="#d5b379"/><path d="m27 115 25-30 12 11 18-23 13 42Z" fill="url(#${g})" stroke="#c9a872"/><circle cx="40" cy="72" r="5" fill="#a8864b"/><g fill="#392a14"><circle cx="20" cy="53" r="1.5"/><circle cx="99" cy="53" r="1.5"/><circle cx="20" cy="127" r="1.5"/><circle cx="99" cy="127" r="1.5"/></g>`,
   shopping:`<g fill="none" stroke="url(#${g})" stroke-width="4"><path d="M9 52h15l14 59h57l11-47H29m6 16h67M38 96h59M48 65l6 46m16-46v46m18-46-4 46m-46 0-5 16h64"/></g><g fill="url(#${g})"><circle cx="44" cy="134" r="6"/><circle cx="89" cy="134" r="6"/></g>`,
   browsing:`<circle cx="60" cy="82" r="43" fill="#1a2421" stroke="url(#${g})" stroke-width="4"/><g fill="none" stroke="url(#${g})" stroke-width="1.8"><ellipse cx="60" cy="82" rx="19" ry="43"/><ellipse cx="60" cy="82" rx="34" ry="43"/><ellipse cx="60" cy="82" rx="43" ry="16"/><path d="M20 65h80M20 100h80M60 38v89m-9-92 4-9 26 9"/><path d="M91 40q54 60-16 92H50"/></g>`
  };
  const defaultHead=`<circle cx="60" cy="86" r="42" fill="#242a22" stroke="url(#${g})" stroke-width="6"/><g transform="translate(32 58) scale(2.33)" color="#d8b775">${icon(id).replace('<svg ','<svg width="24" height="24" ')}</g><path d="M55 129h10v9H55z" fill="url(#${g})"/>`;
  return`<svg class="tool-art" viewBox="0 0 120 258" aria-hidden="true"><defs><linearGradient id="${g}"><stop stop-color="#5a3b17"/><stop offset=".19" stop-color="#b88843"/><stop offset=".32" stop-color="#f9df99"/><stop offset=".48" stop-color="#a5793a"/><stop offset=".75" stop-color="#c69954"/><stop offset="1" stop-color="#452c12"/></linearGradient><linearGradient id="${w}"><stop stop-color="#171612"/><stop offset=".3" stop-color="#5d3d25"/><stop offset=".48" stop-color="#916036"/><stop offset=".65" stop-color="#412b1a"/><stop offset="1" stop-color="#100f0c"/></linearGradient><radialGradient id="${glass}" cx=".3" cy=".25"><stop stop-color="#727669" stop-opacity=".6"/><stop offset=".5" stop-color="#1a2019" stop-opacity=".35"/><stop offset=".83" stop-color="#272e29" stop-opacity=".8"/><stop offset="1" stop-color="#929383" stop-opacity=".7"/></radialGradient></defs>${stem}${heads[id]||defaultHead}</svg>`;
 }
 const names={translation:'Words',utilities:'Tools',browsing:'Browse',reading:'Reading'};
 function rack(cats){return cats.map(c=>`<button class="tool" data-tool="${c.id}" aria-pressed="${c.id===category}" aria-label="${esc(c.name)} tool">${toolSVG(c.id)}<span class="tool-label">${names[c.id]||esc(c.name)}</span></button>`).join('');}
 $('#upper-rack').innerHTML=rack(app.categories.slice(0,6));$('#lower-rack').innerHTML=rack(app.categories.slice(6));
 function render(lift=true){
  const list=app.byCategory(category),e=list[index],name=app.categories.find(v=>v.id===category).name;
  $$('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===category));
  $('#bench-content').innerHTML=`<span class="eyebrow">${esc(name)} / ON YOUR BENCH</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><div class="bench-facts"><span>${icon(e.mobile?'phone':'browsing')}${e.mobile?'Phone guidance':'Desktop guidance'}</span><span>${icon('shield')}Source-reviewed</span></div><button class="primary" data-fix="${e.id}">Use fix ${icon('arrow')}</button>`;
  $('#bench-preview').innerHTML=toolSVG(category,'-bench')+`<span>${esc(e.service)}</span>`;
  $('#bench-choices').innerHTML=`<button id="prev-fix" ${list.length<2?'disabled':''} aria-label="Previous fix">${icon('back')} Previous</button><span class="choice-info">${index+1} OF ${list.length}<br>${esc(e.kind)}</span><button id="next-fix" ${list.length<2?'disabled':''} aria-label="Next fix">Next ${icon('arrow')}</button>`;
  $('#prev-fix').onclick=()=>{index=(index-1+list.length)%list.length;render();$('#prev-fix').focus({preventScroll:true});};
  $('#next-fix').onclick=()=>{index=(index+1)%list.length;render();$('#next-fix').focus({preventScroll:true});};
  if(lift){app.sound();animate($('.bench-paper'),[{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:280});}
 }
 $$('.tools').forEach(r=>r.onclick=e=>{const b=e.target.closest('[data-tool]');if(b){category=b.dataset.tool;index=0;render();}});
 $('#drawer-toggle').onclick=()=>{const open=$('#lower-drawer').hidden;$('#lower-drawer').hidden=!open;$('#drawer-toggle').setAttribute('aria-expanded',open);$('#drawer-label').textContent=open?'Close lower drawer':'Open lower drawer';if(open)animate($('#lower-drawer'),[{opacity:0,transform:'translateY(-15px)'},{opacity:1,transform:'none'}],{duration:350});app.sound();};
 function notes(){
  $('#saved-count').textContent=app.saved.length;
  $('#pinned-notes').innerHTML=app.saved.length?app.saved.slice(-2).map(id=>{const e=app.byId(id);return`<button class="pin-note" data-fix="${e.id}"><small>${esc(e.service)}</small>${esc(e.short)}</button>`;}).join(''):`<p class="notes-empty">An empty pinboard is a beginning. Open a fix and save it here.</p>`;
 }
 document.addEventListener('ilud:state',notes);render(false);notes();
}catch(error){fail(error);}
