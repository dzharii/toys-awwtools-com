import {MEDIA_LIMITS} from '../config/media.js';
import {supportedAudioHeader} from '../media/audio-header.js';
import {imageHeader} from '../media/image-header.js';
const abortError = () => new DOMException('Операция отменена.', 'AbortError');
const imageCandidate = file => /^image\/(?:jpeg|png|webp|gif)$/iu.test(file.type) || /\.(?:jpe?g|png|webp|gif)$/iu.test(file.name||'');
const audioCandidate = file => !/^video\//iu.test(file.type) && (/^audio\//iu.test(file.type) || /\.(?:mp3|wav|ogg|oga|opus|m4a|aac|flac|webm)$/iu.test(file.name||''));

export async function inspectImage(url, {signal}={}) {
  const image = new Image();
  try {
    await new Promise((resolve,reject)=>{
      const finish=(error)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);image.onload=null;image.onerror=null;error?reject(error):resolve();};
      const abort=()=>finish(abortError()), timer=setTimeout(()=>finish(Error('Не удалось открыть изображение.')),10000);
      image.onload=()=>{if(image.decode)image.decode().then(()=>finish(),()=>finish(Error('Изображение повреждено.')));else finish();}; image.onerror=()=>finish(Error('Изображение повреждено или не поддерживается.'));
      signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}image.src=url;
    });
    return {width:image.naturalWidth,height:image.naturalHeight};
  } finally { image.removeAttribute('src'); }
}

export async function inspectAudio(url, {signal,recordedDuration}={}) {
  const audio=document.createElement('video');audio.preload='auto';
  try {
    return await new Promise((resolve,reject)=>{
      let seeking=false;
      const finish=(error,duration)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);audio.onloadeddata=null;audio.oncanplay=null;audio.ondurationchange=null;audio.ontimeupdate=null;audio.onerror=null;error?reject(error):resolve({duration});};
      const abort=()=>finish(abortError()), timer=setTimeout(()=>finish(Error('Не удалось воспроизвести аудиофайл.')),10000);
      const check=()=>{
        if(audio.readyState<2)return;
        if(audio.videoWidth>0){finish(Error('Этот файл содержит видео.'));return;}
        const duration=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:recordedDuration;
        if(Number.isFinite(duration)&&duration>0){finish(null,duration);return;}
        // Some local WebM containers omit duration. Probe their end in this disposable element.
        if(!seeking){seeking=true;try{audio.currentTime=1e10;}catch{finish(Error('Не удалось определить длительность аудио.'));}}
      };
      audio.onloadeddata=check;audio.oncanplay=check;audio.ondurationchange=check;audio.ontimeupdate=check;
      audio.onerror=()=>finish(Error('Браузер не поддерживает этот аудиофайл.'));
      signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}audio.src=url;audio.load();
    });
  } finally {audio.pause();audio.removeAttribute('src');audio.load();}
}

export function createMediaStore({urls=globalThis.URL,inspectImage:decodeImage=inspectImage,inspectAudio:decodeAudio=inspectAudio,id=()=>crypto.randomUUID(),limits=MEDIA_LIMITS}={}) {
  const entries=new Map();let reserved=0,pending=0,generation=0;const owners=new Map();
  const usage=()=>[...entries.values()].reduce((n,e)=>n+e.cost,0);
  const descriptor=e=>({id:e.id,type:e.type,name:e.name,size:e.size,...(e.url?{url:e.url}:{}),...(e.duration?{duration:e.duration}:{}),...(e.width?{width:e.width,height:e.height}:{})});
  function release(key){const entry=entries.get(key);if(!entry)return;if(entry.url)urls.revokeObjectURL(entry.url);entries.delete(key);}
  return {
    get size(){return entries.size;},get bytes(){return usage()+reserved;},
    get(key){const e=entries.get(key);return e?descriptor(e):null;},
    isDraft(key){return entries.get(key)?.state==='draft';},
    async prepare(file,{owner=null,signal,recordedDuration,recorded=false}={}){
      if(signal?.aborted)throw abortError();
      if(!file || !Number.isFinite(file.size) || file.size<0 || typeof file.type!=='string')throw Error('Не удалось выбрать файл.');
      if(file.size>limits.fileBytes)throw Error('Файл слишком большой. Максимум 25 МБ.');
      if(entries.size+pending>=limits.sessionItems)throw Error('Слишком много вложений. Удали ненужный чат и попробуй снова.');
      const epoch=generation,ownerEpoch=owners.get(owner)||0;
      let reservation=0,sourceBlob=file;
      let type=recorded?'audio':imageCandidate(file)?'image':audioCandidate(file)?'audio':'file',cost=0,url=null,metadata={};
      if(type==='image' && (file.size===0 || file.size>limits.imageBytes))throw Error('Изображение должно быть не больше 12 МБ и содержать данные.');
      if(type==='audio' && (file.size===0 || file.size>limits.audioBytes)){
        if(recorded || file.size>limits.audioBytes)throw Error('Аудиозапись должна быть не больше 20 МБ и содержать звук.');
        type='file';
      }
      pending++;
      try {
        if(type==='image'){
          metadata=imageHeader(await file.slice(0,262144).arrayBuffer());
          if(!metadata || !metadata.width || !metadata.height)throw Error('Не удалось открыть изображение. Выбери JPEG, PNG, WebP или GIF.');
          if(metadata.width>limits.imageSide || metadata.height>limits.imageSide || metadata.width*metadata.height>limits.imagePixels)throw Error('Изображение слишком большое. Максимум 20 мегапикселей.');
          cost=file.size+metadata.width*metadata.height*4;
          sourceBlob=new Blob([file],{type:metadata.mime});
        } else if(type==='audio'){
          if(!supportedAudioHeader(await file.slice(0,32).arrayBuffer())){
            if(recorded)throw Error('Запись повреждена или не поддерживается. Запиши сообщение ещё раз.');
            type='file';
          }else {cost=file.size;const safe=/^audio\/(?:mpeg|mp4|webm|ogg|wav|x-wav|aac|flac|x-flac|aiff|x-aiff|basic|amr)(?:;|$)/iu.test(file.type);sourceBlob=new Blob([file],{type:safe?file.type:'application/octet-stream'});}
        }
        if(usage()+reserved+cost>limits.sessionBytes)throw Error('Недостаточно памяти для вложения. Удали ненужный чат и попробуй снова.');
        reserved+=cost;reservation=cost;
        if(signal?.aborted)throw abortError();
        if(type!=='file')url=urls.createObjectURL(sourceBlob);
        if(type==='image'){
          const decoded=await decodeImage(url,{signal});
          if(!decoded.width || !decoded.height || decoded.width*decoded.height>limits.imagePixels || decoded.width>limits.imageSide || decoded.height>limits.imageSide)throw Error('Изображение слишком большое или повреждено.');
          // JPEG orientation can swap the dimensions without changing their memory cost.
          if(decoded.width*decoded.height>metadata.width*metadata.height)throw Error('Не удалось проверить размер изображения.');
          metadata=decoded;
        }
        if(type==='audio'){
          try {metadata=await decodeAudio(url,{signal,recordedDuration});}
          catch(error){if(recorded || error.name==='AbortError')throw error;urls.revokeObjectURL(url);url=null;type='file';metadata={};}
          if(type==='audio' && (!Number.isFinite(metadata.duration)||metadata.duration<=0||metadata.duration>limits.audioSeconds+.25))throw Error('Аудиозапись должна быть не длиннее 3 минут.');
        }
        if(signal?.aborted)throw abortError();
        if(epoch!==generation || ownerEpoch!==(owners.get(owner)||0))throw abortError();
        const key=id(),entry={id:key,type,name:String(file.name|| (type==='audio'?'Голосовое сообщение':'Файл')).slice(0,180),size:file.size,url,owner,state:'draft',cost:type==='file'?0:cost,...metadata};
        entries.set(key,entry);url=null;return descriptor(entry);
      } finally {pending--;reserved-=reservation;if(url)urls.revokeObjectURL(url);}
    },
    claim(key,chatId){const entry=entries.get(key);if(!entry || entry.state!=='draft')return null;entry.state='sent';entry.owner=chatId;return descriptor(entry);},
    releaseDraft(key){if(entries.get(key)?.state==='draft')release(key);},
    releaseChat(chatId){owners.set(chatId,(owners.get(chatId)||0)+1);for(const [key,entry]of entries)if(entry.owner===chatId)release(key);},
    clear(){generation++;owners.clear();for(const key of [...entries.keys()])release(key);}
  };
}
