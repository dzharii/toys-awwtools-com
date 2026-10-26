import{el}from'../dom.js';import'./sov-message.js';
export class SovChat extends HTMLElement{
 connectedCallback(){if(this.ready)return;this.ready=true;this.setAttribute('role','log');this.setAttribute('aria-label','Сообщения');this.setAttribute('aria-live','polite');this.scrollBox=this.closest('.conversation-scroll');}
 update(chat,pendingId){const oldChat=this.chatId;this.chatId=chat?.id;const messages=chat?.messages||[];const atBottom=!this.scrollBox||this.scrollBox.scrollHeight-this.scrollBox.scrollTop-this.scrollBox.clientHeight<100;const existing=new Map([...this.querySelectorAll('sov-message')].map(n=>[n.dataset.id,n]));const visible=messages.filter(m=>m.id!==pendingId);
  this.querySelector('.empty-state')?.remove();this.querySelector('.thinking')?.remove();
  if(!messages.length){this.replaceChildren(el('section',{class:'empty-state'},el('button',{class:'text-button',onclick:()=>this.dispatchEvent(new CustomEvent('new-chat',{bubbles:true,composed:true}))},'Новый чат')));return;}
  const allowed=new Set(visible.map(m=>m.id));for(const [id,n]of existing)if(!allowed.has(id))n.remove();
  for(const message of visible){if(existing.has(message.id))continue;const node=document.createElement('sov-message');node.dataset.id=message.id;node.data=message;this.append(node);}
  if(messages.some(m=>m.id===pendingId))this.append(el('div',{class:'thinking',role:'status','aria-label':'Формируется ответ'},el('i'),el('i'),el('i')));
  if(atBottom||oldChat!==this.chatId)requestAnimationFrame(()=>{if(this.scrollBox)this.scrollBox.scrollTop=this.scrollBox.scrollHeight;});
 }
}
customElements.define('sov-chat',SovChat);
