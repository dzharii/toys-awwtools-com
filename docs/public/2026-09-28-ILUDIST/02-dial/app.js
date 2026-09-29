import {createApp,icon,$,$$,escapeHTML as esc,motion,animate,fail} from './core.js';
try{
  const app=await createApp('dial');
  $$('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  let bank=0,index=0,angle=0,drag=null,velocity=0,raf=0,lastDetent=0,suppressClick=false;
  const dial=$('#dial'),housing=$('.dial-housing'),labels=$('#dial-labels'),radius=208;
  const point=(degrees,r)=>[300+Math.sin(degrees*Math.PI/180)*r,300-Math.cos(degrees*Math.PI/180)*r];
  $('#ticks').innerHTML=Array.from({length:120},(_,i)=>{const a=point(i*3,282),b=point(i*3,i%5===0?269:275);return `<path d="M${a.join(' ')}L${b.join(' ')}" stroke="${i%5===0?'#c9af7d':'#837254'}" stroke-width="${i%5===0?1.5:.7}"/>`;}).join('');
  function bankCategories(){return app.categories.slice(bank*6,bank*6+6);}
  function draw(){
    const cats=bankCategories();
    $('#sectors').innerHTML=cats.map((c,i)=>{const a=point(i*60-29.8,263),b=point(i*60+29.8,263),d=point(i*60+29.8,145),e=point(i*60-29.8,145);return `<path data-sector="${i}" d="M${a.join(' ')} A263 263 0 0 1 ${b.join(' ')} L${d.join(' ')} A145 145 0 0 0 ${e.join(' ')} Z" fill="${i===index?'url(#brass)':'transparent'}" stroke="${i===index?'#f4ddaf':'#55503e'}" stroke-width="${i===index?2:1}"/>`;}).join('');
    labels.innerHTML=cats.map((c,i)=>`<button class="engraving" data-index="${i}" aria-pressed="${i===index}" aria-label="Select ${c.name}">${icon(c.id)}<span>${c.name.replace(' & travel','').replace('Everyday tools','Tools')}</span></button>`).join('');
    rotate();
  }
  function rotate(){
    dial.style.transform=`rotate(${angle}deg)`;
    $$('[data-index]').forEach((el,i)=>{
      const r=dial.clientWidth*radius/600,rad=(i*60+angle)*Math.PI/180;
      el.style.transform=`translate(${Math.sin(rad)*r}px,${-Math.cos(rad)*r}px)`;
    });
    const nearest=((Math.round(-angle/60)%6)+6)%6;
    if(nearest!==lastDetent){lastDetent=nearest;app.sound();}
  }
  function select(next,turn=true){
    index=(next+6)%6;
    const target=-index*60;
    angle=target+Math.round((angle-target)/360)*360;
    if(turn&&motion()){dial.style.transition='transform .5s cubic-bezier(.2,.9,.2,1)';setTimeout(()=>dial.style.transition='',520);}
    const c=bankCategories()[index],items=app.byCategory(c.id),e=items[0];
    dial.setAttribute('aria-valuenow',index);dial.setAttribute('aria-valuetext',c.name);
    $('#tuning-label').textContent=`TUNED TO ${c.name.toUpperCase()}`;
    $('#output').innerHTML=`<h1>${esc(e.title)}</h1><p>${esc(e.summary)}</p><button class="primary" data-fix="${e.id}">Use this fix ${icon('arrow')}</button>`;
    $('#platform').textContent=e.mobile?'Phone-friendly':'Desktop guidance';
    $('#option-count').textContent=String(items.length-1).padStart(2,'0');
    $('#options').innerHTML=items.slice(1).map(v=>`<button class="frequency-option" data-fix="${v.id}"><span><small>${esc(v.service)} / ${esc(v.kind)}</small><strong>${esc(v.short)}</strong></span>${icon('arrow')}</button>`).join('')||`<button class="frequency-option" data-library><span><small>THE WHOLE INSTRUMENT</small><strong>Explore another activity</strong></span>${icon('arrow')}</button>`;
    draw();if(turn)animate($('#output'),[{opacity:0},{opacity:1}],{duration:230});
  }
  const pointerAngle=e=>{const r=housing.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;};
  housing.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;cancelAnimationFrame(raf);dial.style.transition='';
    drag={angle:pointerAngle(e),time:performance.now(),distance:0,pointer:e.pointerId};velocity=0;
  });
  housing.addEventListener('pointermove',e=>{
    if(!drag||drag.pointer!==e.pointerId)return;
    const now=performance.now(),a=pointerAngle(e);let delta=a-drag.angle;
    if(delta>180)delta-=360;if(delta< -180)delta+=360;
    velocity=delta/Math.max(8,now-drag.time);angle+=delta;drag.distance+=Math.abs(delta);drag.angle=a;drag.time=now;
    if(drag.distance>4&&!housing.hasPointerCapture(e.pointerId))housing.setPointerCapture(e.pointerId);
    rotate();
  });
  function settle(cancelled=false){
    if(!drag)return;const moved=drag.distance>4;drag=null;
    if(!moved&&!cancelled)return;
    suppressClick=true;setTimeout(()=>suppressClick=false,100);
    if(cancelled||!motion()){select(Math.round(-angle/60),false);return;}
    let speed=Math.max(-1.4,Math.min(1.4,velocity))*16;
    function coast(){angle+=speed;speed*=.88;rotate();if(Math.abs(speed)>.25)raf=requestAnimationFrame(coast);else select(Math.round(-angle/60));}
    coast();
  }
  housing.addEventListener('pointerup',()=>settle());
  housing.addEventListener('pointercancel',()=>settle(true));
  housing.addEventListener('lostpointercapture',()=>{if(drag)settle(true);});
  labels.addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b&&!suppressClick)select(Number(b.dataset.index));});
  dial.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();cancelAnimationFrame(raf);select(e.key==='Home'?0:e.key==='End'?5:index+(['ArrowRight','ArrowUp'].includes(e.key)?1:-1));}});
  $('#clockwise').onclick=()=>select(index+1);$('#counterclockwise').onclick=()=>select(index-1);
  $$('[data-bank]').forEach(b=>b.onclick=()=>{bank=Number(b.dataset.bank);$$('[data-bank]').forEach(el=>el.setAttribute('aria-pressed',el===b));select(0);});
  const update=()=>{$('[data-sound]').setAttribute('aria-pressed',app.soundEnabled);};document.addEventListener('ilud:state',update);update();
  new ResizeObserver(rotate).observe(dial);select(0,false);
}catch(error){fail(error);}
