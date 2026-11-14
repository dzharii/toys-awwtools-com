export function completionControl(problem,onComplete){
 const control=document.createElement('div');control.className='completion-control';
 const trigger=document.createElement('button');trigger.className='completion-trigger state';trigger.type='button';
 trigger.append(Object.assign(document.createElement('span'),{className:'state-icon',textContent:'○'}),document.createTextNode('Unsolved'));
 trigger.setAttribute('aria-label',`Completion options for ${problem.id}. ${problem.title}, unsolved`);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','complete-'+problem.id);
 const callout=document.createElement('div');callout.className='completion-callout';callout.id='complete-'+problem.id;callout.setAttribute('role','group');callout.setAttribute('aria-label','Mark problem solved');callout.setAttribute('aria-hidden','true');callout.inert=true;
 const current=document.createElement('span');current.className='completion-current';current.textContent='○ Unsolved';current.setAttribute('aria-hidden','true');
 const confirm=document.createElement('button');confirm.type='button';confirm.className='complete-confirm';
 const party=document.createElement('span');party.textContent='🎉';party.setAttribute('aria-hidden','true');confirm.append(party,document.createTextNode(' Solved'));confirm.setAttribute('aria-label',`Mark ${problem.id}. ${problem.title} as solved`);
 callout.append(current,confirm);control.append(trigger,callout);
 let openTimer,closeTimer,suppressFocus=false;
 function show(){if(confirm.disabled||!control.isConnected)return;clearTimeout(openTimer);clearTimeout(closeTimer);const rect=control.getBoundingClientRect();callout.style.left=Math.max(12-rect.left,Math.min(-8,document.documentElement.clientWidth-12-rect.left-callout.offsetWidth))+'px';callout.style.right='auto';control.classList.add('is-open');callout.inert=false;callout.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');}
 function close(){clearTimeout(openTimer);clearTimeout(closeTimer);control.classList.remove('is-open');callout.inert=true;callout.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');}
 control.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse')return;clearTimeout(closeTimer);openTimer=setTimeout(show,400);});
 control.addEventListener('pointerleave',()=>{clearTimeout(openTimer);closeTimer=setTimeout(close,120);});
 control.addEventListener('focusin',()=>{if(!suppressFocus)show();});
 control.addEventListener('focusout',e=>{if(!control.contains(e.relatedTarget))close();});
 trigger.onclick=()=>{show();confirm.focus();};
 control.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();suppressFocus=true;close();trigger.focus();suppressFocus=false;}});
 confirm.onclick=event=>onComplete(problem,control.closest('tr'),confirm,event.detail===0);
 return control;
}
