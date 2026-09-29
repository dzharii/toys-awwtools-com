import{createApp,icon,$,$$,escapeHTML as esc,animate,motion,fail}from'./core.js';
try{
 const app=await createApp('routes');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 let line='avoid',selected='google-web',activity='';
 const descriptions={off:['An off switch.','A setting you can change in a tool you already use.'],avoid:['A way around.','Keep a familiar service. Take a route with less of the part you do not want.'],replace:['Another door.','Sometimes the simpler answer is a different instrument.']};
 $('#activity').innerHTML+=app.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
 function render(travel=true){
  const found=app.entries.filter(e=>e.intent===line&&(!activity||e.category===activity));
  if(!found.some(e=>e.id===selected))selected=found[0]?.id;
  const e=app.byId(selected);
  $('#line-title').textContent=descriptions[line][0];$('#line-description').textContent=descriptions[line][1];
  $$('[data-line]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.line===line));
  $('#departures').innerHTML=found.map((v,i)=>`<button class="departure" data-stop="${v.id}" aria-pressed="${v.id===selected}"><span>${String(i+1).padStart(2,'0')}</span><span><small>${esc(v.service)} / ${esc(v.status)}</small>${esc(v.short)}</span>${icon('arrow')}</button>`).join('')||'<div class="empty-state"><h3>No route on this line.</h3><p>Try another approach or activity.</p><button class="secondary" id="reset-route">Show every destination</button></div>';
  const stations=found.slice(0,5);
  if(e&&!stations.includes(e))stations[stations.length-1]=e;
  $('#station-buttons').innerHTML=stations.map(v=>`<button class="station" data-stop="${v.id}" aria-pressed="${v.id===selected}"><span class="station-dot">${icon(v.category)}</span><span>${esc(v.service.replace(' Images','').replace(' desktop','').replace(' / King Arthur Baking',''))}</span></button>`).join('');
  $('#ticket').innerHTML=e?`<span class="eyebrow">YOUR SELECTED ROUTE</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><button class="primary" data-fix="${e.id}">Use this fix ${icon('arrow')}</button>`:'<h2>A different line?</h2><p>No matching route here. Choose another activity.</p>';
  const track=$(`[data-track="${line}"]`),active=$('#active-route');
  active.setAttribute('d',track.getAttribute('d'));active.setAttribute('stroke',getComputedStyle(document.documentElement).getPropertyValue(`--${line}`));
  if(travel&&motion()){const length=active.getTotalLength();animate(active,[{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:650});animate($('#ticket'),[{opacity:.4,transform:'translateX(-8px)'},{opacity:1,transform:'none'}],{duration:300});}
  if(travel)app.sound();
 }
 document.addEventListener('click',e=>{const l=e.target.closest('[data-line]'),s=e.target.closest('[data-stop]');if(l){line=l.dataset.line;render();}if(s){selected=s.dataset.stop;render();app.toast('Route selected. Use the ticket on the map to open the fix.');}if(e.target.closest('#reset-route')){activity='';$('#activity').value='';render();}});
 $('#activity').onchange=e=>{activity=e.target.value;render();};render(false);
}catch(error){fail(error);}
