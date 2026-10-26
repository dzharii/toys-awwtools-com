import {chooseBackground} from '../config/backgrounds.js';
import {emptyState} from '../domain/chat-state.js';
export function createChatService({engine,storage,media,random=Math.random,backgroundRandom=Math.random,clock=()=>new Date().toISOString(),id=()=>crypto.randomUUID(),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
  const loaded=storage.load();let state=loaded.state,error=loaded.error||'',busy=false,pendingId=null;
  const listeners=new Set(),notify=()=>listeners.forEach(fn=>fn());
  const save=()=>{try{storage.save(state);error='';}catch(e){error=e.message;}notify();};
  const selected=()=>state.chats.find(chat=>chat.id===state.selectedChatId);
  function newChat(){
    const now=clock(),number=state.nextChatNumber++;
    const chat={id:id(),number,title:`Новый чат ${number}`,createdAt:now,updatedAt:now,backgroundId:chooseBackground(backgroundRandom,state.chats.slice(0,3).map(chat=>chat.backgroundId)),messages:[]};
    if(engine.opening){const history=state.chats.slice(0,5).reverse().flatMap(chat=>chat.messages.filter(message=>message.kind==='opening'));chat.messages.push({...engine.opening({history,random}),id:id(),role:'assistant',createdAt:now});}
    state.chats.unshift(chat);state.selectedChatId=chat.id;save();return chat;
  }
  return {
    get state(){return state;},get error(){return error;},get busy(){return busy;},get pendingId(){return pendingId;},get chat(){return selected();},
    subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},newChat,
    start(){if(!state.chats.length)newChat();},retrySave(){save();},
    select(chatId){if(!state.chats.some(chat=>chat.id===chatId))return;state.selectedChatId=chatId;save();},
    remove(chatId){state.chats=state.chats.filter(chat=>chat.id!==chatId);media?.releaseChat(chatId);if(state.selectedChatId===chatId)state.selectedChatId=state.chats[0]?.id||null;save();},
    clear(){
      const next={...emptyState(),nextChatNumber:state.nextChatNumber};
      try{storage.reset(next);state=next;media?.clear();error='';notify();return true;}
      catch(e){error=e.message;notify();return false;}
    },
    async send(value){
      const text=typeof value==='string'?value.trim():typeof value?.text==='string'?value.text.trim():'';
      const attachmentId=typeof value==='object'?value?.attachmentId:null;
      if(busy || text.length>6000 || (!text&&!attachmentId))return false;
      const attachment=attachmentId?media?.get(attachmentId):null;
      if(attachmentId && (!attachment || !media.isDraft(attachmentId))){error='Вложение больше недоступно. Выберите его заново.';notify();return false;}
      const chat=selected()||newChat();let result;
      try{result=engine.generate({input:text,history:chat.messages.slice(-12).map(({attachment,...message})=>message),random,...(attachment?{attachmentType:attachment.type}:{})});}
      catch{error='Не удалось сформировать ответ. Попробуй ещё раз.';notify();return false;}
      const episode=attachment?{temporary:true,episodeId:id()}:{};
      const accepted=attachment?media.claim(attachmentId,chat.id):null;
      if(attachment&&!accepted){error='Не удалось отправить вложение. Попробуй ещё раз.';notify();return false;}
      busy=true;const now=clock();
      const user={id:id(),role:'user',kind:accepted?'attachment':'input',text,createdAt:now,...episode,...(accepted?{attachment:accepted}:{})};
      const reply={...result,id:id(),role:'assistant',createdAt:clock(),...episode};
      chat.messages.push(user,reply);chat.updatedAt=now;pendingId=reply.id;save();
      try{await delay(500+Math.floor(random()*1001));}
      finally{pendingId=null;busy=false;notify();}
      return true;
    }
  };
}
