import{createApp,icon,$,$$,escapeHTML as esc,animate,fail}from'./core.js';
try{
 const app=await createApp('current');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 const branches=[
  {name:'Answering',note:'Less unsolicited<br>conversation',cats:['search','translation','utilities','weather']},
  {name:'Recommending',note:'More deliberate<br>destinations',cats:['social','shopping','maps','browsing']},
  {name:'Generating',note:'A clearer path<br>to the source',cats:['images','writing','video','reading']}
 ];
 const notes={search:'Ordinary results',translation:'Just the words',utilities:'Quieter daily tools',weather:'Straight to a forecast',social:'People you choose',shopping:'A known maker',maps:'Choose your route',browsing:'Fewer distractions',images:'Check the provenance',writing:'Your own words',video:'The original voice',reading:'Go to the source'};
 const names={translation:'Words',utilities:'Tools',browsing:'Browse',maps:'Maps'};
 let category='search',index=0,drag=null;
 $('#stars').innerHTML=Array.from({length:95},(_,i)=>`<i style="left:${(i*61.79+17)%100}%;top:${(i*39.13+5)%100}%;opacity:${.1+(i%6)/15}"></i>`).join('');
 $('#branches').innerHTML=branches.map((b,i)=>`<section class="branch" data-branch="${i}"><button class="branch-header" data-branch-select="${i}" aria-label="Explore ${b.name.toLowerCase()}"><span class="branch-orb">${icon(i===0?'star':i===1?'avoid':'replace')}</span><strong>${b.name}</strong><small>${b.note}</small></button><div class="branch-destinations">${b.cats.map(id=>{const c=app.categories.find(v=>v.id===id);return`<button class="current-node" data-node="${id}" aria-pressed="${id===category}"><span class="node-orb">${icon(id)}</span><span class="node-text"><strong>${names[id]||esc(c.name)}</strong><small>${notes[id]}</small></span></button>`;}).join('')}</div></section>`).join('');
 function point(element){const r=element.getBoundingClientRect(),root=$('.river-map').getBoundingClientRect();return{x:r.x+r.width/2-root.x,y:r.y+r.height/2-root.y};}
 function curve(a,b){return`C${a.x} ${a.y+(b.y-a.y)*.55} ${b.x} ${a.y+(b.y-a.y)*.45} ${b.x} ${b.y}`;}
 function river(points){return`M${points[0].x} ${points[0].y}`+points.slice(1).map((p,i)=>curve(points[i],p)).join('');}
 function draw(){
  const origin=point($('#lantern')),end=point($('.confluence'));
  const lines=branches.map((b,i)=>{
   const orb=point($(`[data-branch="${i}"] .branch-orb`));
   const nodes=b.cats.map(id=>point($(`[data-node="${id}"] .node-orb`)));
   const d=river([origin,orb,...nodes,end]);
   return`<path d="${d}"/><path class="echo" d="${d}" transform="translate(${i===0?-15:15} 0)"/>`;
  });
  $('#river-lines').innerHTML=lines.join('');
  const branch=branches.findIndex(b=>b.cats.includes(category)),orb=point($(`[data-branch="${branch}"] .branch-orb`)),target=point($(`[data-node="${category}"] .node-orb`));
  const rail=target.x-30;
  const d=river([origin,orb,target,{x:rail,y:target.y+30},{x:rail,y:end.y-50},end]);$('#active-path').setAttribute('d',d);$('#active-glow').setAttribute('d',d);
 }
 function render(turn=true){
  const list=app.byCategory(category),e=list[index],c=app.categories.find(v=>v.id===category),b=branches.find(v=>v.cats.includes(category));
  $$('[data-node]').forEach(n=>n.setAttribute('aria-pressed',n.dataset.node===category));$$('.branch').forEach((n,i)=>n.classList.toggle('active',branches[i].cats.includes(category)));
  $('#destination-label').textContent=`${c.name} / A USEFUL WAY THROUGH`;$('#destination-counter').textContent=`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;
  $('#destination-content').innerHTML=`<h2>${esc(e.title)}</h2><p>${esc(e.summary)}</p><button class="primary" data-fix="${e.id}">${icon('utilities')} Use this fix ${icon('arrow')}</button>`;
  $('#destination-status').textContent=e.mobile?'Phone guidance':'Desktop guidance';$('#current-caveat').textContent=e.caveat;
  $('#current-description').textContent=`Your thread: ${b.name} / ${c.name} / ${e.service}. Source notes are inside the fix.`;
  $('#previous-fix').disabled=$('#next-fix').disabled=list.length<2;
  requestAnimationFrame(draw);
  if(turn){app.sound();animate($('#destination-content'),[{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350});}
 }
 function select(id){if(category!==id){category=id;index=0;render();}}
 $('#branches').onclick=e=>{const node=e.target.closest('[data-node]'),b=e.target.closest('[data-branch-select]');if(node)select(node.dataset.node);else if(b)select(branches[Number(b.dataset.branchSelect)].cats[0]);};
 $('#previous-fix').onclick=()=>{const n=app.byCategory(category).length;index=(index-1+n)%n;render();};
 $('#next-fix').onclick=()=>{index=(index+1)%app.byCategory(category).length;render();};
 const lantern=$('#lantern');
 lantern.onkeydown=e=>{const all=branches.flatMap(b=>b.cats);let n=all.indexOf(category);if(e.key==='ArrowRight'||e.key==='ArrowDown')n++;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n--;else if(e.key==='Home')n=0;else if(e.key==='End')n=all.length-1;else return;e.preventDefault();select(all[(n+all.length)%all.length]);};
 lantern.onpointerdown=e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};lantern.setPointerCapture(e.pointerId);};
 lantern.onpointermove=e=>{
  if(!drag||drag.id!==e.pointerId)return;drag.x=e.clientX;drag.y=e.clientY;drag.moved=true;
  const r=$('.river-map').getBoundingClientRect(),origin=point(lantern),target={x:e.clientX-r.x,y:e.clientY-r.y};
  $('#drag-thread').setAttribute('d',river([origin,target]));
  let closest=null,distance=Infinity;$$('[data-node]').forEach(n=>{const p=point($('.node-orb',n)),d=Math.hypot(p.x-target.x,p.y-target.y);if(d<distance){closest=n;distance=d;}});
  if(closest&&distance<90)select(closest.dataset.node);
 };
 function release(){drag=null;$('#drag-thread').setAttribute('d','');}
 lantern.onpointerup=e=>{if(lantern.hasPointerCapture(e.pointerId))lantern.releasePointerCapture(e.pointerId);release();};lantern.onpointercancel=release;lantern.onlostpointercapture=release;
 new ResizeObserver(()=>requestAnimationFrame(draw)).observe($('.river-map'));document.fonts.ready.then(draw);
 render(false);
}catch(error){fail(error);}
