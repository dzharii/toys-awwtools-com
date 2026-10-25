import {el,button,emit} from '../dom.js';
import {createRecorder} from '../../media/recorder.js';
import {mediaTime} from '../../config/media.js';
import './sov-audio.js';
export class SovComposer extends HTMLElement {
  connectedCallback(){
    if(this.ready){document.addEventListener('visibilitychange',this.visibility);window.addEventListener('resize',this.viewportResize);window.visualViewport?.addEventListener('resize',this.viewportResize);return;}this.ready=true;this.drafts=new Map();this.chatId=null;this.draft=this.getDraft(null);this.levels=[];
    this.textarea=el('textarea',{placeholder:'Напиши сообщение…','aria-label':'Сообщение',rows:1,maxlength:6000});
    this.fileInput=el('input',{type:'file',hidden:true,tabindex:-1,'aria-label':'Выбрать файл'});
    this.attachButton=button('Прикрепить файл','plus',()=>{this.ensureContext();this.fileTarget=this.draft;this.fileInput.click();},'icon-button attach-button');
    this.micButton=button('Записать голосовое сообщение','mic',()=>this.startRecording(),'icon-button microphone-button');
    this.send=button('Отправить сообщение','arrow',()=>this.submit(),'send-button');
    this.preview=el('div',{class:'attachment-preview',hidden:true});
    this.normal=el('div',{class:'composer-input-row'},this.attachButton,this.textarea,this.micButton,this.send);
    this.cancelRecording=button('Отменить запись','close',()=>this.cancelRecordingNow(),'icon-button recording-cancel');
    this.stopRecording=button('Остановить запись','stop',()=>this.finishRecording(false),'icon-button recording-stop');
    this.sendRecording=button('Отправить запись','arrow',()=>this.finishRecording(true),'send-button recording-send');
    this.recordLabel=el('span',{class:'recording-label',role:'status'},'Запись сообщения');
    this.recordTime=el('span',{class:'recording-time','aria-hidden':'true'},'00:00');
    this.wave=el('canvas',{class:'recording-wave','aria-hidden':'true',width:400,height:32});
    this.recordPanel=el('div',{class:'recording-panel',hidden:true},this.recordLabel,el('div',{class:'recording-controls'},this.cancelRecording,this.wave,this.recordTime,this.stopRecording,this.sendRecording));
    this.error=el('p',{class:'composer-error',role:'alert',hidden:true});
    this.form=el('form',{class:'composer-form',onsubmit:event=>{event.preventDefault();this.submit();}},this.preview,this.normal,this.recordPanel,this.fileInput);
    this.append(this.form,this.error);
    this.textarea.addEventListener('input',()=>{this.draft.text=this.textarea.value;this.resize();});
    this.textarea.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();this.submit();}});
    this.textarea.addEventListener('paste',event=>this.paste(event));
    this.fileInput.addEventListener('change',()=>{const file=this.fileInput.files?.[0];this.fileInput.value='';const draft=this.fileTarget||this.draft;this.fileTarget=null;if(file)this.prepare(file,{draft});});
    this.recorder=createRecorder({onState:()=>this.render(),onError:message=>{if(this.recordingDraft&&!this.recordingDraft.disposed)this.recordingDraft.error=message;this.render();},onLevel:({elapsed,level})=>{this.recordTime.textContent=mediaTime(elapsed);this.levels.push(level);if(this.levels.length>64)this.levels.shift();this.draw();},onLimit:promise=>this.finishRecording(false,promise)});
    this.visibility=()=>{if(document.hidden&&this.recorder.status==='recording')this.finishRecording(false);};document.addEventListener('visibilitychange',this.visibility);
    this.viewportResize=()=>this.keepControlsVisible();window.addEventListener('resize',this.viewportResize);window.visualViewport?.addEventListener('resize',this.viewportResize);
    this.render();
  }
  disconnectedCallback(){document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('resize',this.viewportResize);window.visualViewport?.removeEventListener('resize',this.viewportResize);this.clearDrafts();}
  keepControlsVisible(){requestAnimationFrame(()=>{const area=this.closest('.composer-area');if(area)area.scrollTop=area.scrollHeight;});}
  configure(media){this.media=media;}
  getDraft(id){if(!this.drafts.has(id))this.drafts.set(id,{text:'',attachmentId:null,preparing:false,error:'',disposed:false});return this.drafts.get(id);}
  ensureContext(){if(this.chatId===null)emit(this,'ensure-chat');}
  setContext(id){
    id=id??null;if(id===this.chatId)return;
    const previous=this.draft;previous.text=this.textarea.value;
    if(this.recordingDraft===previous&&this.recorder.status==='recording')this.finishRecording(false);
    else if(this.recordingDraft===previous&&this.recorder.status==='requesting')this.cancelRecordingNow();
    if(this.chatId===null&&id!==null){this.drafts.delete(null);this.drafts.set(id,previous);}
    this.chatId=id;this.draft=this.getDraft(id);this.textarea.value=this.draft.text;this.render();this.resize();
  }
  dropContext(id){const draft=this.drafts.get(id);if(!draft)return;if(this.recordingDraft===draft)this.cancelRecordingNow();draft.disposed=true;draft.controller?.abort();this.media?.releaseDraft(draft.attachmentId);this.drafts.delete(id);}
  clearDrafts(){this.recorder?.cancel();this.recordingDraft=null;for(const id of [...this.drafts?.keys()||[]])this.dropContext(id);if(this.drafts){this.draft=this.getDraft(this.chatId);this.textarea.value='';this.render();}}
  resize(){this.textarea.style.height='auto';this.textarea.style.height=Math.min(180,this.textarea.scrollHeight)+'px';this.setBusy(this.busy);}
  showError(message,draft=this.draft){if(!draft.disposed)draft.error=message;this.render();}
  async prepare(file,{recordedDuration,recorded=false,draft=this.draft}={}){
    if(!this.media || draft.disposed)return false;
    if(draft.attachmentId||draft.preparing){this.showError('Можно добавить одно вложение. Сначала удали выбранное.',draft);return false;}
    const controller=new AbortController();draft.controller=controller;draft.preparing=true;draft.error='';this.render();
    try{
      const media=await this.media.prepare(file,{owner:[...this.drafts].find(([,value])=>value===draft)?.[0]??null,signal:controller.signal,recordedDuration,recorded});
      if(draft.disposed||controller.signal.aborted){this.media.releaseDraft(media.id);return false;}
      draft.attachmentId=media.id;return true;
    }catch(error){if(error.name!=='AbortError')this.showError(error.message||'Не удалось подготовить вложение.',draft);return false;}
    finally{if(draft.controller===controller){draft.preparing=false;draft.controller=null;}this.render();}
  }
  paste(event){
    const files=[...event.clipboardData?.items||[]].filter(item=>item.kind==='file'&&item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);
    if(!files.length)return;event.preventDefault();this.ensureContext();
    if(this.busy||files.length!==1){this.showError(this.busy?'Дождись ответа перед отправкой вложения.':'Можно вставить только одно изображение за раз.');return;}
    const text=event.clipboardData.getData('text/plain');
    if(text){const start=this.textarea.selectionStart,end=this.textarea.selectionEnd;this.textarea.setRangeText(text.slice(0,6000-(this.textarea.value.length-end+start)),start,end,'end');this.draft.text=this.textarea.value;this.resize();}
    this.prepare(files[0]);
  }
  removeAttachment(){this.draft.controller?.abort();this.media?.releaseDraft(this.draft.attachmentId);this.draft.attachmentId=null;this.draft.preparing=false;this.draft.error='';this.render();}
  async startRecording(){
    if(this.busy||this.draft.preparing||this.recorder.status!=='idle')return;this.ensureContext();
    if(this.draft.attachmentId){this.showError('Сначала удали выбранное вложение.');return;}
    const attempt=this.recordAttempt=(this.recordAttempt||0)+1;this.recordingDraft=this.draft;this.draft.error='';this.levels=[];this.recordTime.textContent='00:00';this.textarea.blur();
    const started=await this.recorder.start();
    if(attempt===this.recordAttempt&&!started&&this.recorder.status==='idle'){this.recordingDraft=null;this.render();}
  }
  cancelRecordingNow(){this.recordAttempt=(this.recordAttempt||0)+1;const draft=this.recordingDraft;this.recorder.cancel();this.recordingDraft=null;if(draft){draft.controller?.abort();draft.preparing=false;}this.render();}
  async finishRecording(send=false,promise){
    const draft=this.recordingDraft;if(!draft||draft.finishing)return;
    draft.finishing=true;draft.autoSend=send;
    try{
      const {blob,duration}=await (promise||this.recorder.stop());
      if(draft.disposed)return;
      const extension=blob.type.includes('mp4')?'m4a':blob.type.includes('ogg')?'ogg':blob.type.includes('wav')?'wav':blob.type.includes('mpeg')?'mp3':'webm';
      const file=new File([blob],`voice-${new Date().toISOString().replace(/[:.]/gu,'-')}.${extension}`,{type:blob.type});
      const prepared=await this.prepare(file,{recordedDuration:duration,recorded:true,draft});
      if(prepared&&draft.autoSend&&this.draft===draft)this.submit();
    }catch(error){if(error.name!=='AbortError')this.showError(error.message||'Не удалось записать звук.',draft);}
    finally{draft.finishing=false;if(this.recordingDraft===draft)this.recordingDraft=null;this.render();}
  }
  submit(){
    if(this.busy||this.draft.preparing||this.recorder.status!=='idle')return;
    const text=this.textarea.value;if(!text.trim()&&!this.draft.attachmentId)return;
    this.draft.text=text;emit(this,'send-message',this.draft.attachmentId?{text,attachmentId:this.draft.attachmentId}:text);
  }
  accepted(){const hadMedia=!!this.draft.attachmentId;this.draft.text='';this.draft.attachmentId=null;this.draft.error='';this.textarea.value='';this.render();this.resize();if(!hadMedia)this.textarea.focus({preventScroll:true});}
  setBusy(value){
    this.busy=!!value;if(!this.send)return;
    const recording=this.recorder?.status!=='idle';
    this.send.disabled=this.busy||this.draft.preparing||recording||(!this.textarea.value.trim()&&!this.draft.attachmentId);
    this.attachButton.disabled=this.busy||recording||this.draft.preparing;
    this.micButton.disabled=this.busy||recording||this.draft.preparing;
    this.textarea.setAttribute('aria-busy',String(this.busy));
  }
  render(){
    if(!this.ready)return;
    const status=this.recorder?.status||'idle',recording=this.recordingDraft===this.draft&&status!=='idle';
    this.dataset.mode=recording?status:this.draft.preparing?'preparing':this.draft.attachmentId?'preview':'text';
    this.normal.hidden=recording;this.recordPanel.hidden=!recording;this.preview.hidden=recording||(!this.draft.attachmentId&&!this.draft.preparing);
    this.recordLabel.textContent=status==='requesting'?'Разреши доступ к микрофону':status==='stopping'?'Подготовка записи…':'Запись сообщения';
    this.stopRecording.disabled=status!=='recording';this.sendRecording.disabled=status!=='recording';
    if(!recording){
      const media=this.media?.get(this.draft.attachmentId),key=this.draft.preparing?'preparing':media?.id||'';
      if(key!==this.previewKey){
        this.previewKey=key;this.preview.replaceChildren();
        if(this.draft.preparing)this.preview.append(el('span',{class:'attachment-status',role:'status'},'Подготовка вложения…'),button('Отменить вложение','close',()=>this.removeAttachment(),'icon-button attachment-remove'));
        else if(media){
          if(media.type==='image')this.preview.append(el('img',{src:media.url,alt:'Предпросмотр изображения',class:'attachment-image'}));
          else if(media.type==='audio'){const player=document.createElement('sov-audio');player.data=media;this.preview.append(player);}
          else this.preview.append(el('span',{class:'attachment-name'},media.name));
          this.preview.append(button('Удалить вложение','close',()=>this.removeAttachment(),'icon-button attachment-remove'));
        }
      }
    }
    this.error.textContent=this.draft.error;this.error.hidden=!this.draft.error;this.setBusy(this.busy);if(recording)this.draw();this.keepControlsVisible();
  }
  draw(){
    const canvas=this.wave,context=canvas.getContext('2d');if(!context)return;
    const width=Math.max(60,canvas.clientWidth||200),height=32;canvas.width=width;canvas.height=height;
    context.clearRect(0,0,width,height);context.fillStyle='#bfc0c6';
    const count=Math.floor(width/5),values=this.levels.slice(-count);
    for(let i=0;i<count;i++){const value=values[i-(count-values.length)]||0,bar=Math.max(2,value*27);context.fillRect(i*5,(height-bar)/2,2,bar);}
  }
}
customElements.define('sov-composer',SovComposer);
