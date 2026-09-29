import{createApp,icon,$,$$,escapeHTML as esc,swipe,animate,fail}from'./core.js';
try{
 const app=await createApp('journal');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 let chapter=0;
 const marginNames={shopping:'Shop',browsing:'Browse',reading:'Read',translation:'Words',maps:'Maps',utilities:'Tools'};
 $('#chapters').innerHTML=app.categories.map((c,i)=>`<button data-chapter="${i}" aria-label="Chapter ${i+1}: ${esc(c.name)}" aria-pressed="${i===0}"><i>${String(i+1).padStart(2,'0')}</i><span>${esc(marginNames[c.id]||c.name)}</span></button>`).join('');
 function render(turn=false){
  const c=app.categories[chapter],items=app.byCategory(c.id),e=items[0];
  const title=e.title.replace('without AI summaries','<em>without AI summaries</em>');
  $('#feature-text').innerHTML=`<p class="chapter-numeral">${String(chapter+1).padStart(2,'0')} /</p><h1>${title}</h1><p class="standfirst">${esc(c.line)}</p><p class="feature-meta">${esc(e.service)}<br>${esc(e.status)}</p><button class="primary" data-fix="${e.id}">Use this fix ${icon('arrow')}</button>`;
  const additional=items.slice(1);
  $('#editorial-list').innerHTML=additional.map((e,i)=>`<button class="editorial-entry" data-fix="${e.id}"><figure><img src="./assets/${i%2?'stilllife':'shadow'}.svg" alt="" width="500" height="500" loading="lazy"></figure><span class="entry-copy"><span class="eyebrow">${String(i+2).padStart(2,'0')} / ${esc(e.service)}</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><span class="entry-date">${icon('shield')}Sources reviewed ${app.catalogue.reviewed}</span>${icon('arrow')}</span></button>`).join('')||`<article class="chapter-essay"><span class="eyebrow">A CONSIDERED CHOICE</span><h2>One useful door is enough.</h2><p>We have not filled this chapter with weak alternatives to make it look fuller. This is the route we can explain, with its sources and limits intact.</p><button class="text-button" data-library>Explore the other chapters</button></article>`;
  $('#chapter-position').textContent=`CHAPTER ${String(chapter+1).padStart(2,'0')} / ${String(app.categories.length).padStart(2,'0')}`;
  $$('[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.chapter)===chapter));
  if(turn){app.sound();animate($('#feature-text'),[{opacity:0,transform:'translateX(20px)'},{opacity:1,transform:'none'}],{duration:450,easing:'ease-out'});}
 }
 function step(n){chapter=(chapter+n+app.categories.length)%app.categories.length;render(true);}
 $('#chapters').onclick=e=>{const b=e.target.closest('[data-chapter]');if(b){chapter=Number(b.dataset.chapter);render(true);}};
 $('#prev-chapter').onclick=()=>step(-1);$('#next-chapter').onclick=()=>step(1);
 swipe($('#feature'),step,{visual:false});render();
}catch(error){fail(error);}
