// One stationary, non-interactive preview shared by every problem row.
export function setupIllustrationPreview(rows) {
 const eligible=matchMedia('(min-width:1280px) and (min-height:480px) and (hover:hover) and (pointer:fine)');
 const overlay=document.createElement('div');
 overlay.className='illustration-preview';
 overlay.setAttribute('aria-hidden','true');
 const cloud=document.createElement('div');cloud.className='preview-cloud';
 const artwork=document.createElement('div');artwork.className='preview-artwork';
 const layers=[0,1].map(()=>{
  const img=document.createElement('img');img.width=960;img.height=160;img.alt='';
  img.decoding='async';artwork.append(img);return img;
 });
 cloud.append(artwork);overlay.append(cloud);
 const bubbles=[0,1,2].map(i=>{
  const bubble=document.createElement('div');bubble.className='preview-tail preview-tail-'+i;
  overlay.append(bubble);return bubble;
 });
 document.body.append(overlay);
 let target=null,active=-1,request=0,openTimer,closeTimer;
 function dismiss(){
  clearTimeout(openTimer);clearTimeout(closeTimer);request++;target=null;
  overlay.classList.remove('is-visible');
 }
 function positionTail(image){
  const from=image.getBoundingClientRect(),panel=cloud.getBoundingClientRect();
  const x=from.left+from.width/2,y=from.top+from.height*.25;
  const endX=Math.max(panel.left+80,Math.min(panel.right-80,x)),endY=panel.bottom+7;
  // No tail through the panel when the hovered row is behind or above it.
  const show=y>endY+30;
  bubbles.forEach((bubble,i)=>{
   const t=[.18,.46,.76][i];bubble.hidden=!show;
   bubble.style.left=(x+(endX-x)*t)+'px';
   bubble.style.top=(y+(endY-y)*t)+'px';
  });
 }
 async function reveal(image,token){
  if(token!==request||target!==image||!eligible.matches||document.querySelector('dialog[open]'))return;
  const next=active===0?1:0,layer=layers[next];
  layer.src=image.currentSrc||image.src;
  try{await layer.decode();}catch{if(token===request)dismiss();return;}
  if(token!==request||target!==image||!image.isConnected||!eligible.matches)return;
  positionTail(image);
  layers.forEach((img,i)=>img.classList.toggle('is-active',i===next));active=next;
  overlay.dataset.problemId=image.closest('tr').querySelector('.number').textContent;
  overlay.classList.add('is-visible');
 }
 rows.addEventListener('pointerover',event=>{
  const image=event.target.closest('.problem-illustration');
  if(!image||!eligible.matches||event.pointerType!=='mouse'||image===target)return;
  clearTimeout(closeTimer);clearTimeout(openTimer);target=image;
  const token=++request;
  // A brief dwell avoids flashing the preview while merely crossing the list.
  openTimer=setTimeout(()=>reveal(image,token),110);
 });
 rows.addEventListener('pointerout',event=>{
  if(!event.target.closest('.problem-illustration'))return;
  if(event.relatedTarget?.closest?.('.problem-illustration'))return;
  clearTimeout(openTimer);request++;target=null;
  // Bridge the gap between neighboring rows without fading the cloud away.
  closeTimer=setTimeout(dismiss,180);
 });
 document.addEventListener('keydown',event=>{if(event.key==='Escape')dismiss();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)dismiss();});
 window.addEventListener('scroll',dismiss,{passive:true});
 window.addEventListener('resize',dismiss,{passive:true});
 window.addEventListener('blur',dismiss);
 eligible.addEventListener('change',dismiss);
 return {dismiss};
}
