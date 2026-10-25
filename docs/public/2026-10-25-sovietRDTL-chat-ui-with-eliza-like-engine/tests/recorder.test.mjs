import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecorder,recordingError} from '../src/media/recorder.js';
function setup(options={}){
 let clock=0,tick,stops=0,recorder;const states=[],errors=[],limits=[];
 const track={stop(){stops++;},onended:null};const stream={getTracks:()=>[track]};
 class Recorder{
  static isTypeSupported(type){return type==='audio/mp4';}
  constructor(stream,options){this.state='inactive';this.mimeType=options?.mimeType||'audio/webm';recorder=this;}
  start(){this.state='recording';}
  stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['sound'],{type:this.mimeType})});this.onstop?.();});}
 }
 const api=createRecorder({Recorder,AudioContext:null,mediaDevices:{getUserMedia:async()=>stream},now:()=>clock,every:callback=>{tick=callback;return 7;},stopEvery:()=>{tick=null;},onState:value=>states.push(value),onError:error=>errors.push(error),onLimit:promise=>limits.push(promise),...options});
 return {api,track,stream,states,errors,limits,get recorder(){return recorder;},get stops(){return stops;},advance(ms){clock+=ms;tick?.();}};
}
test('record starts after permission, negotiates a supported MIME, waits for final data and stops tracks',async()=>{
 const x=setup();assert.equal(await x.api.start(),true);assert.equal(x.api.status,'recording');assert.equal(x.recorder.mimeType,'audio/mp4');x.advance(1850);
 const stopped=x.api.stop();assert.equal(x.api.status,'stopping');assert.equal(x.stops,1);const result=await stopped;assert.equal(result.duration,1.85);assert.equal(result.blob.size,5);assert.equal(x.api.status,'idle');assert.deepEqual(x.states,['requesting','recording','stopping','idle']);assert.deepEqual(x.errors,[]);assert.equal(x.stops,1);
});
test('cancelling a recording produces no media and leaves no active microphone',async()=>{
 const x=setup();await x.api.start();x.advance(500);x.api.cancel();await new Promise(resolve=>setImmediate(resolve));assert.equal(x.api.status,'idle');assert.equal(x.stops,1);assert.deepEqual(x.errors,[]);
});
test('cancelling pending permission stops a late stream and cannot replace another recording',async()=>{
 let resolve;const x=setup({mediaDevices:{getUserMedia:()=>new Promise(r=>resolve=r)}});const started=x.api.start();assert.equal(x.api.status,'requesting');x.api.cancel();resolve(x.stream);assert.equal(await started,false);assert.equal(x.stops,1);assert.equal(x.api.status,'idle');
});
test('permission denial, missing microphone, hardware abort and unsupported APIs return the normal technical path',async()=>{
 for(const name of ['NotAllowedError','NotFoundError','NotReadableError','AbortError']){
  const x=setup({mediaDevices:{getUserMedia:async()=>{throw new DOMException('device',name);}}});assert.equal(await x.api.start(),false);assert.equal(x.api.status,'idle');assert.equal(x.errors.length,1);assert.equal(x.stops,0);
 }
 const x=setup({Recorder:null});assert.equal(await x.api.start(),false);assert.equal(x.errors.length,1);
 const insecure=setup({secure:false});assert.equal(await insecure.api.start(),false);
});
test('a disconnected track fails the recording, stops its stream and does not create a preview',async()=>{
 const x=setup();await x.api.start();x.track.onended();assert.equal(x.api.status,'idle');assert.equal(x.stops,1);assert.equal(x.errors.length,1);await assert.rejects(x.api.stop());
});
test('empty/too short recordings are rejected; a valid stop duration excludes asynchronous event delay',async()=>{
 const x=setup();await x.api.start();x.advance(100);await assert.rejects(x.api.stop());assert.equal(x.errors.length,1);assert.equal(x.stops,1);
 const y=setup();await y.api.start();y.advance(1000);const stop=y.api.stop();y.advance(10000);assert.equal((await stop).duration,1);
});
test('duration limit stops into a playable preview rather than silently continuing to record',async()=>{
 const x=setup();await x.api.start();x.advance(179950);assert.equal(x.api.status,'stopping');assert.equal(x.limits.length,1);assert.ok((await x.limits[0]).blob.size>0);assert.equal(x.stops,1);
});
test('a recorder error releases tracks even if no stop event arrives',async()=>{
 const x=setup();await x.api.start();x.recorder.onerror();assert.equal(x.api.status,'idle');assert.equal(x.stops,1);assert.equal(x.errors.length,1);
});
test('friendly errors describe the failing device without a parent reaction',()=>{
 assert.match(recordingError({name:'NotAllowedError'}),/доступа к микрофону/);assert.match(recordingError({name:'NotFoundError'}),/не найден/);assert.match(recordingError({name:'NotReadableError'}),/другим приложением/);
});
test('a completed stop with no encoded data is a technical failure, not a sendable recording',async()=>{
 const x=setup();await x.api.start();x.advance(1200);
 x.recorder.stop=function(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable({data:new Blob([])});this.onstop();});};
 await assert.rejects(x.api.stop());assert.equal(x.api.status,'idle');assert.equal(x.errors.length,1);assert.equal(x.stops,1);
});
