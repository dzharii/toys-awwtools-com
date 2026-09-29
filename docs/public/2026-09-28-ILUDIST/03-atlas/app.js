import{createApp,icon,$,$$,escapeHTML as esc,animate,motion,fail}from'./core.js';
try{
 const app=await createApp('atlas');$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 const spots=[{x:215,y:285},{x:620,y:305},{x:164,y:703},{x:640,y:700},{x:329,y:954},{x:656,y:993}];
 const banks=[['search','social','writing','images','shopping','browsing'],['video','reading','translation','maps','weather','utilities']];
 let bank=0,selected=0,zoom=1,pan={x:0,y:0},drag=null,moved=false;
 const viewport=$('#viewport'),chart=$('#chart');
 function draw(){
  $('#islands').innerHTML=banks[bank].map((id,i)=>{const c=app.categories.find(c=>c.id===id),lines={search:'Ordinary search results.',social:'People you chose.',writing:'Space for your words.',images:'Pictures with a source.',shopping:'Find the real thing.',browsing:'A clearer way through.',video:'The original voice.',reading:'Read the source.',translation:'Find the right word.',maps:'Find your own way.',weather:'Just the forecast.',utilities:'Everyday instruments.'};return`<button class="island-marker" data-island="${i}" style="left:${spots[i].x/8}%;top:${spots[i].y/11}%" aria-pressed="${i===selected}">${icon(id)}<strong>${esc(c.name.replace(' & travel','').replace('Everyday tools','Tools'))}</strong><small>${lines[id]}</small></button>`;}).join('');
 }
 function choose(i,travel=true){
  selected=i;const category=app.categories.find(c=>c.id===banks[bank][i]),items=app.byCategory(category.id),first=items[0];
  $('#island-title').textContent=category.name;$('#island-intro').textContent=category.line;$('#harbor-icon').innerHTML=icon(category.id);$('#coordinate').textContent=`${String(i+1+bank*6).padStart(2,'0')} / ${['NW','NE','W','E','SW','SE'][i]}`;
  $('#landings').innerHTML=`<article class="landing"><span class="eyebrow">FIRST LANDING / ${esc(first.service)}</span><h2>${esc(first.title)}</h2><p>${esc(first.summary)}</p><button class="primary" data-fix="${first.id}">Take this route ${icon('arrow')}</button></article>`+items.slice(1).map(e=>`<article class="landing"><button data-fix="${e.id}"><span><small>${esc(e.service)}</small>${esc(e.short)}</span>${icon('arrow')}</button></article>`).join('');
  const p=spots[i],path=$('#voyage');path.setAttribute('d',`M400 545 Q${(400+p.x)/2+(i%2?80:-80)} ${(545+p.y)/2} ${p.x} ${p.y}`);
  const vessel=$('#vessel');vessel.setAttribute('cx',p.x);vessel.setAttribute('cy',p.y);
  if(travel&&motion()){const length=path.getTotalLength();animate(path,[{strokeDasharray:`${length} ${length}`,strokeDashoffset:length},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0}],{duration:750,easing:'ease-out'});animate($('#harbor'),[{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350});}
  draw();if(travel){app.sound();app.toast(`${category.name} island selected. Its routes are below the chart.`);}
 }
 $('#islands').onclick=e=>{const b=e.target.closest('[data-island]');if(b&&!moved)choose(Number(b.dataset.island));};
 $$('[data-sea]').forEach(b=>b.onclick=()=>{bank=Number(b.dataset.sea);$$('[data-sea]').forEach(el=>el.setAttribute('aria-pressed',el===b));choose(0);});
 function transform(){const maxX=viewport.clientWidth*(zoom-1)/2,maxY=viewport.clientHeight*(zoom-1)/2;pan.x=Math.max(-maxX,Math.min(maxX,pan.x));pan.y=Math.max(-maxY,Math.min(maxY,pan.y));chart.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;viewport.classList.toggle('zoomed',zoom>1);$('#zoom-out').disabled=zoom<=1;$('#zoom-in').disabled=zoom>=2;$('#reset-map').textContent=zoom===1?'Reset chart':`${Math.round(zoom*100)}% / Reset`;}
 $('#zoom-in').onclick=()=>{zoom=Math.min(2,zoom+.25);transform();};$('#zoom-out').onclick=()=>{zoom=Math.max(1,zoom-.25);transform();};$('#reset-map').onclick=()=>{zoom=1;pan={x:0,y:0};transform();};
 viewport.addEventListener('pointerdown',e=>{if(zoom<=1||e.button!==0)return;if(!e.target.closest('button'))e.preventDefault();drag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y,id:e.pointerId};moved=false;});
 viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5){moved=true;viewport.setPointerCapture(e.pointerId);}pan={x:drag.px+dx,y:drag.py+dy};transform();});
 function release(){const id=drag?.id;drag=null;if(id!==undefined&&viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);setTimeout(()=>moved=false,100);}
 viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);viewport.addEventListener('lostpointercapture',release);
 new ResizeObserver(transform).observe(viewport);choose(0,false);transform();
}catch(error){fail(error);}
