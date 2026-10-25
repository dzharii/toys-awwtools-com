import {MEDIA_LIMITS} from '../config/media.js';
const abortError=()=>new DOMException('Запись отменена.','AbortError');
export function recordingError(error) {
  if(['NotAllowedError','SecurityError'].includes(error?.name))return 'Нет доступа к микрофону. Разреши его использование в настройках браузера.';
  if(error?.name==='NotFoundError')return 'Микрофон не найден. Подключи его и попробуй снова.';
  if(['NotReadableError','AbortError'].includes(error?.name))return 'Не удалось включить микрофон. Проверь, не занят ли он другим приложением.';
  return error?.message || 'Не удалось записать звук. Попробуй ещё раз.';
}
export function createRecorder({mediaDevices=globalThis.navigator?.mediaDevices,Recorder=globalThis.MediaRecorder,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext,secure=globalThis.isSecureContext!==false,now=()=>performance.now(),every=setInterval,stopEvery=clearInterval,onState=()=>{},onLevel=()=>{},onError=()=>{},onLimit=()=>{},limits=MEDIA_LIMITS}={}) {
  let current=null;
  const state=value=>onState(value);
  function cleanup(c){
    if(c.timer!=null)stopEvery(c.timer);c.timer=null;
    for(const track of c.stream?.getTracks()||[]){track.onended=null;track.stop();}
    try{c.source?.disconnect();}catch{}
    try{c.context?.close()?.catch(()=>{});}catch{}
    c.source=null;c.context=null;c.stream=null;
  }
  function finish(c,error,result){
    if(c.finished)return;c.finished=true;cleanup(c);c.chunks=[];
    if(current===c){current=null;state('idle');if(error && !c.cancelled)onError(recordingError(error));}
    error?c.reject(error):c.resolve(result);
  }
  function stop(){
    const c=current;if(!c)return Promise.reject(Error('Запись не начата.'));
    if(c.status==='requesting')return Promise.reject(Error('Дождись доступа к микрофону.'));
    if(c.status==='stopping')return c.done;
    c.status='stopping';c.stopped=now();state('stopping');
    try{c.recorder.stop();cleanup(c);}catch(error){finish(c,error);}
    return c.done;
  }
  return {
    get status(){return current?.status||'idle';},
    async start(){
      if(current)return false;
      if(!secure || !mediaDevices?.getUserMedia || !Recorder){onError('Запись с микрофона недоступна в этом браузере. Открой сайт по HTTPS в поддерживаемом браузере.');return false;}
      let resolve,reject;const done=new Promise((a,b)=>{resolve=a;reject=b;});done.catch(()=>{});
      const c={status:'requesting',chunks:[],bytes:0,resolve,reject,done,finished:false};current=c;state('requesting');
      try{
        const stream=await mediaDevices.getUserMedia({audio:true,video:false});
        if(current!==c || c.finished){for(const track of stream.getTracks())track.stop();return false;}
        c.stream=stream;
        const mime=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(type=>Recorder.isTypeSupported?.(type));
        try{c.recorder=new Recorder(stream,{...(mime?{mimeType:mime}:{}),audioBitsPerSecond:64000});}
        catch{c.recorder=new Recorder(stream);}
        c.recorder.ondataavailable=event=>{
          if(c.finished || !event.data?.size)return;c.bytes+=event.data.size;c.chunks.push(event.data);
          if(c.bytes>limits.audioBytes){const error=Error('Запись слишком большая. Максимум 20 МБ.');try{if(c.recorder.state!=='inactive')c.recorder.stop();}catch{}finish(c,error);}
        };
        c.recorder.onerror=()=>finish(c,Error('Во время записи произошла ошибка. Запиши сообщение ещё раз.'));
        c.recorder.onstop=()=>{
          if(c.finished)return;
          const duration=((c.stopped??now())-c.started)/1000;
          const blob=new Blob(c.chunks,{type:c.recorder.mimeType||c.chunks[0]?.type||'audio/webm'});
          if(!blob.size || duration<.2){finish(c,Error('Запись слишком короткая или не содержит звука. Попробуй ещё раз.'));return;}
          if(duration>limits.audioSeconds+.25){finish(c,Error('Запись должна быть не длиннее 3 минут.'));return;}
          finish(c,null,{blob,duration:Math.min(duration,limits.audioSeconds)});
        };
        for(const track of stream.getTracks())track.onended=()=>{if(c.status==='recording')finish(c,Error('Микрофон отключился. Запиши сообщение ещё раз.'));};
        c.started=now();c.recorder.start(250);c.status='recording';state('recording');
        if(AudioContext){try{c.context=new AudioContext();c.source=c.context.createMediaStreamSource(stream);c.analyser=c.context.createAnalyser();c.analyser.fftSize=256;c.source.connect(c.analyser);c.samples=new Uint8Array(c.analyser.fftSize);c.context.resume()?.catch(()=>{});}catch{c.analyser=null;/* Meter is optional; recording remains available. */}}
        c.timer=every(()=>{
          if(c.finished || c.status!=='recording')return;
          const elapsed=(now()-c.started)/1000;
          let level=0;
          if(c.analyser){c.analyser.getByteTimeDomainData(c.samples);level=Math.sqrt(c.samples.reduce((n,v)=>n+((v-128)/128)**2,0)/c.samples.length);}
          onLevel({elapsed,level:Math.min(1,level*4)});
          if(elapsed>=limits.audioSeconds-.1){onLimit(stop());}
        },80);
        return true;
      }catch(error){if(!c.finished)finish(c,error);return false;}
    },
    stop,
    cancel(){const c=current;if(!c)return;const recorder=c.recorder;c.cancelled=true;finish(c,abortError());try{if(recorder && recorder.state!=='inactive')recorder.stop();}catch{}}
  };
}
