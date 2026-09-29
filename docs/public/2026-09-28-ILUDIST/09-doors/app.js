import{createApp,icon,$,$$,escapeHTML as esc,animate,fail}from'./core.js';
try{
 const app=await createApp('doors');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 const doors=[{id:'off',title:'Turn it off',note:'Find the switch. Keep the service.'},{id:'avoid',title:'Avoid it',note:'Same intention. A different route.'},{id:'replace',title:'Use something else',note:'Open a simpler alternative.'}];
 const state=Object.fromEntries(doors.map(d=>[d.id,{category:app.entries.find(e=>e.intent===d.id).category,index:0}]));
 let opened='avoid';
 $('#portals').innerHTML=doors.map((d,i)=>`<section class="portal ${d.id===opened?'open':''}" data-intent="${d.id}"><span class="arch-rim" aria-hidden="true"></span><h2><button class="door-top" id="door-${d.id}" aria-expanded="${d.id===opened}" aria-controls="room-${d.id}"><span class="door-number">0${i+1}</span><span class="door-title">${d.title}</span><span class="door-caption">${d.note}</span>${icon('arrow')}</button></h2><div class="room" id="room-${d.id}" role="region" aria-labelledby="door-${d.id}" ${d.id!==opened?'hidden':''}><div class="side-leaf left" aria-hidden="true"></div><div class="side-leaf right" aria-hidden="true"></div><nav class="room-tabs" aria-label="${esc(d.title)} activities"></nav><div class="room-detail"></div><div class="room-floor" aria-hidden="true"></div></div></section>`).join('');
 function renderRoom(id,turn=false){
  const s=state[id],list=app.entries.filter(e=>e.intent===id&&e.category===s.category),e=list[s.index],room=$(`#room-${id}`);
  const cats=app.categories.filter(c=>app.entries.some(e=>e.intent===id&&e.category===c.id));
  $('.room-tabs',room).innerHTML=cats.map(c=>`<button class="room-tab" data-category="${c.id}" aria-pressed="${s.category===c.id}">${esc(c.name)}</button>`).join('');
  $('.room-detail',room).innerHTML=`<span class="room-service">${esc(e.service)} / ${esc(e.kind)}</span><h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><button class="primary" data-fix="${e.id}">Use this fix ${icon('arrow')}</button><div class="room-navigation"><button data-room-prev ${list.length===1?'disabled':''} aria-label="Previous fix">${icon('back')} Previous</button><span>${s.index+1} OF ${list.length} FIXES</span><button data-room-next ${list.length===1?'disabled':''} aria-label="Next fix">Next ${icon('arrow')}</button></div>`;
  $('.room-tabs',room).onclick=ev=>{const b=ev.target.closest('[data-category]');if(b){s.category=b.dataset.category;s.index=0;renderRoom(id,true);$(`[data-category="${s.category}"]`,room).focus({preventScroll:true});}};
  $('[data-room-prev]',room).onclick=()=>{s.index=(s.index-1+list.length)%list.length;renderRoom(id,true);$('[data-room-prev]',room).focus({preventScroll:true});};
  $('[data-room-next]',room).onclick=()=>{s.index=(s.index+1)%list.length;renderRoom(id,true);$('[data-room-next]',room).focus({preventScroll:true});};
  if(turn){app.sound();animate($('.room-detail',room),[{opacity:0,transform:'translateZ(-20px)'},{opacity:1,transform:'none'}],{duration:300});}
 }
 doors.forEach(d=>{
  renderRoom(d.id);
  $(`#door-${d.id}`).onclick=()=>{
   const next=opened===d.id?null:d.id;opened=next;
   doors.forEach(v=>{const open=v.id===next,p=$(`[data-intent="${v.id}"]`),room=$(`#room-${v.id}`);p.classList.toggle('open',open);$(`#door-${v.id}`).setAttribute('aria-expanded',open);room.hidden=!open;
    if(open){animate($('.room-detail',room),[{opacity:0,transform:'translateY(-10px) scale(.96)'},{opacity:1,transform:'none'}],{duration:500});$$('.side-leaf',room).forEach((leaf,i)=>animate(leaf,[{transform:`rotateY(${i?85:-85}deg)`},{transform:`rotateY(${i?-32:32}deg)`}],{duration:700,easing:'cubic-bezier(.2,.7,.2,1)'}));}
   });app.sound();$(`#door-${d.id}`).focus({preventScroll:true});
  };
 });
}catch(error){fail(error);}
