export function setupCelebration(soundEnabled){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let context=null,lastSound=-Infinity,variant=-1,ready=Promise.resolve();
 const active=new Set();
 function prepareSound(){
  if(!soundEnabled())return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   context??=new Audio();if(context.state==='suspended')ready=context.resume().catch(()=>{});
  }catch{}
 }
 async function sound(){
  await ready;
  if(!soundEnabled()||!context||context.state!=='running'||performance.now()-lastSound<800)return;
  lastSound=performance.now();variant=(variant+1+Math.floor(Math.random()*2))%3;
  try{
   const t=context.currentTime,root=[523.25,587.33,659.25][variant];
   const master=context.createGain();master.gain.value=.075;master.connect(context.destination);
   [1,1.25,1.5].forEach((ratio,i)=>{
    const start=t+i*.075,osc=context.createOscillator(),gain=context.createGain(),wah=context.createBiquadFilter();
    osc.type='triangle';osc.frequency.setValueAtTime(root*ratio*.94,start);osc.frequency.exponentialRampToValueAtTime(root*ratio*1.03,start+.1);osc.frequency.exponentialRampToValueAtTime(root*ratio,start+.29);
    wah.type='lowpass';wah.Q.value=.65;wah.frequency.setValueAtTime(650,start);wah.frequency.exponentialRampToValueAtTime(2600,start+.1);wah.frequency.exponentialRampToValueAtTime(1000,start+.35);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.22,start+.018);gain.gain.exponentialRampToValueAtTime(.0001,start+.42);
    osc.connect(wah);wah.connect(gain);gain.connect(master);osc.start(start);osc.stop(start+.44);
    osc.onended=()=>{osc.disconnect();wah.disconnect();gain.disconnect();if(i===2){master.disconnect();context.suspend().catch(()=>{});}};
   });
  }catch{}
 }
 function cancel(){for(const clean of [...active])clean();}
 function play(wrapper,origin){
  sound();if(reduced.matches)return;
  const layer=document.createElement('div');layer.className='completion-confetti';layer.setAttribute('aria-hidden','true');document.body.append(layer);
  const rect=wrapper?.getBoundingClientRect()||origin;
  const x=Math.max(20,Math.min(innerWidth-20,rect.left+rect.width/2)),y=Math.max(20,Math.min(innerHeight-20,rect.top+rect.height/2));
  const colors=['#f2ba58','#85c8ae','#f4b8a1','#86bce2'];
  for(let i=0;i<22;i++){
   const piece=document.createElement('i');piece.className='confetti-piece'+(i%5===0?' confetti-star':'');
   piece.style.left=x+'px';piece.style.top=y+'px';piece.style.backgroundColor=colors[i%4];
   piece.style.setProperty('--dx',(Math.random()-.5)*230+'px');piece.style.setProperty('--dy',(-45-Math.random()*85)+'px');piece.style.setProperty('--fall',(15+Math.random()*65)+'px');piece.style.setProperty('--spin',((Math.random()-.5)*580)+'deg');piece.style.animationDuration=(650+Math.random()*250)+'ms';layer.append(piece);
  }
  let wave=null;
  if(wrapper?.isConnected){
   const image=wrapper.querySelector('.problem-illustration');
   if(image){wave=document.createElement('div');wave.className='art-wave';wave.setAttribute('aria-hidden','true');
    for(let i=0;i<14;i++){const slice=document.createElement('i');slice.style.backgroundImage=`url("${image.currentSrc||image.src}")`;slice.style.backgroundPosition=(i/13*100)+'% center';slice.style.animationDelay=(i*19)+'ms';wave.append(slice);}
    wrapper.append(wave);wrapper.classList.add('is-celebrating');
   }
  }
  let timer;const clean=()=>{clearTimeout(timer);layer.remove();wave?.remove();wrapper?.classList.remove('is-celebrating');active.delete(clean);};
  active.add(clean);timer=setTimeout(clean,950);
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)cancel();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 return {prepareSound,play,cancel};
}
