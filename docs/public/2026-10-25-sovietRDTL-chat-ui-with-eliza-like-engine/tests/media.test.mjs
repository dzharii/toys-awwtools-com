import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load,read,validate} from '../scripts/catalog.mjs';
import {createEngine} from '../src/domain/engine.js';
import {createMediaStore} from '../src/adapters/media-store.js';
import {createStorage,STORAGE_KEY} from '../src/adapters/local-storage.js';
import {createChatService} from '../src/app/chat-service.js';
import {MEDIA_LIMITS} from '../src/config/media.js';
import {imageHeader} from '../src/media/image-header.js';
const catalog=load(),engine=createEngine(catalog),expressions=new Map(catalog.expressions.map(e=>[e.id,e]));
const seeded=start=>{let seed=start;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
function urlTracker(){let n=0;const created=[],revoked=[];return {created,revoked,createObjectURL:blob=>{created.push(blob);return `blob:local-${++n}`;},revokeObjectURL:url=>revoked.push(url)};}
function store(options={}){let n=0;const urls=urlTracker();return {urls,media:createMediaStore({urls,id:()=>`media-${++n}`,inspectImage:async()=>({width:2,height:3}),inspectAudio:async()=>({duration:3}),...options})};}
function picture({width=2,height=3}={}){const b=new Uint8Array(32);b.set([137,80,78,71,13,10,26,10]);b.set([73,72,68,82],12);const v=new DataView(b.buffer);v.setUint32(16,width);v.setUint32(20,height);return new File([b],'photo.png',{type:'image/png'});}
const voice=()=>new File([new Uint8Array([26,69,223,163]),'voice'],'voice.webm',{type:'audio/webm'});
function memory(){let value=null;return {getItem:()=>value,setItem:(key,next)=>{value=next;},get value(){return value;}};}
function service(media,storage=memory(),extra={}){let n=0;return {storage,app:createChatService({engine,media,storage:createStorage(storage,{expressions}),random:seeded(91),id:()=>`id-${++n}`,clock:()=>new Date(1).toISOString(),delay:async()=>{},...extra})};}

test('media catalog has 24/12 independent refusals per category, actual tones, origins and stage-zero tier coverage',()=>{
 assert.deepEqual(validate(catalog),[]);
 const ledger=read('research/reviews/cr-002-catalog-review.json');assert.equal(ledger.entries.length,108);
 for(const type of ['audio','image','file'])for(const [lib,min]of [['common',24],['odessa',12]]){
  const rows=catalog.expressions.filter(e=>e.library===lib&&e.scenarios?.includes(type));assert.ok(rows.length>=min);
  assert.equal(new Set(rows.map(e=>e.familyId)).size,rows.length);
  for(const tone of ['ironic','strict','sarcastic'])for(const tier of ['core','extended'])assert.ok(rows.some(e=>e.tones.includes(tone)&&e.tier===tier&&!e.irritation),`${lib} ${type} ${tone} ${tier}`);
  for(const e of rows){const o=catalog.origins.find(o=>o.id===e.originId);assert.equal(o.kind,'original');const review=ledger.entries.find(r=>r.expressionId===e.id);assert.equal(review.text,e.canonical);assert.equal(review.summary,o.summary);assert.equal(review.tone,e.tones[0]);}
 }
});
const captions=['','Посмотри','Что скажешь?','Помоги','Спасибо, пока','Я всё объяснил','Можно так?','Хочу новый телефон','У всех друзей есть','Объясни, что здесь','Вот','Мои уроки','Это тебе','Попробуй открыть','Послушай','Проверь','Прочитай','Где ошибка?','Я не понимаю','Я сам сделал','Почему нельзя?','Опять не получилось','Вот ещё','Что делать?','Я хочу гулять','Я уже сделал уроки','Можно без объяснений?','Это важно','Я потом расскажу','<script>alert(1)</script>'];
for(const type of ['audio','image','file'])test(`${type}: 30 captions and ten random variants stay in category without content claims`,()=>{
 for(const input of captions)for(let seed=1;seed<=10;seed++){
  const reply=engine.generate({input,attachmentType:type,random:seeded(seed)});
  assert.equal(reply.kind,type,input);assert.equal(reply.expressionIds.length,1);assert.equal(reply.parts[0].text,reply.text);
  assert.ok(expressions.get(reply.expressionIds[0]).scenarios.includes(type));assert.equal(reply.irritation,0);
  assert.ok(!/прочитал|прослушал|увидел|на фотографии (?:кот|кошка|собака)|в записи сказано/iu.test(reply.text),reply.text);
 }
});
test('media safety precedes category selection and randomness; binary content is never an engine input',()=>{
 for(const attachmentType of ['audio','image','file'])assert.equal(engine.generate({input:'Я сейчас прыгну с крыши',attachmentType,random:()=>{throw Error('must not draw');}}).text,'(молчит)');
 assert.throws(()=>engine.generate({input:'',attachmentType:'video'}));
});
test('media persistence grows only for successive same-category sends, resets on a real text exchange or different category',()=>{
 const random=seeded(28),history=[];
 for(let i=0;i<5;i++){const r=engine.generate({input:'',attachmentType:'audio',history,random});assert.equal(r.irritation,Math.min(i,3));assert.ok(expressions.get(r.expressionIds[0]).irritation<=r.irritation);history.push({role:'assistant',...r});}
 assert.equal(engine.generate({input:'',attachmentType:'image',history,random}).irritation,0);
 history.push({role:'assistant',...engine.generate({input:'Можно гулять?',history,random})});assert.equal(engine.generate({input:'',attachmentType:'audio',history,random}).irritation,0);
});
test('10000 real generations per media category preserve tone/library/tier distributions and prohibit immediate repeats when alternatives exist',()=>{
 const report={trialsPerCategory:10000,categories:{}};
 for(const type of ['audio','image','file']){
  const random=seeded(57+['audio','image','file'].indexOf(type)*913),counts={common:0,core:0,ironic:0,strict:0,sarcastic:0},seen=new Set();
  for(let i=0;i<10000;i++){const r=engine.generate({input:'',attachmentType:type,random});counts.common+=r.sourceLibrary==='common';counts.core+=r.tier==='core';counts[r.tone]++;seen.add(r.expressionIds[0]);}
  assert.ok(Math.abs(counts.common/10000-.5)<.03);assert.ok(Math.abs(counts.core/10000-.7)<.03);for(const tone of ['ironic','strict','sarcastic'])assert.ok(Math.abs(counts[tone]/10000-1/3)<.03);
  assert.equal(seen.size,catalog.expressions.filter(e=>e.scenarios?.includes(type)&&!e.irritation).length);report.categories[type]=counts;
  for(let i=0;i<30;i++){const r=engine.generate({input:'',attachmentType:type,random});const next=engine.generate({input:'',attachmentType:type,history:[{role:'assistant',...r}],random});const pool=catalog.expressions.filter(e=>e.scenarios?.includes(type)&&e.library===next.sourceLibrary&&e.tones.includes(next.tone)&&e.tier===next.tier&&!e.irritation);if(pool.length>1)assert.notEqual(next.expressionIds[0],r.expressionIds[0]);}
 }
 fs.writeFileSync('docs/media-statistics.json',JSON.stringify(report,null,2)+'\n');
});
test('ordinary files retain metadata only, do not read bytes, and video stays a file',async()=>{
 const {media,urls}=store();const file={name:'homework.pdf',type:'application/pdf',size:512,slice(){throw Error('must not read');},arrayBuffer(){throw Error('must not read');}};
 const a=await media.prepare(file,{owner:'chat'});assert.equal(a.type,'file');assert.equal(a.url,undefined);assert.equal(urls.created.length,0);assert.equal(media.bytes,0);
 const video=await media.prepare({name:'clip.webm',type:'video/webm',size:512,slice(){throw Error('must not read');}});assert.equal(video.type,'file');
});
test('images require valid headers AND decoding; dimensions are bounded before decoding',async()=>{
 let decodes=0;const {media,urls}=store({inspectImage:async()=>{decodes++;return {width:2,height:3};}});
 await assert.rejects(media.prepare(new File(['not an image'],'photo.png',{type:'image/png'})));assert.equal(decodes,0);
 await assert.rejects(media.prepare(picture({width:12000,height:12000})));assert.equal(decodes,0);
 const image=await media.prepare(picture());assert.equal(image.type,'image');assert.equal(decodes,1);assert.equal(urls.created.length,1);
 const broken=store({inspectImage:async()=>{throw Error('decode');}});await assert.rejects(broken.media.prepare(picture()));assert.equal(broken.media.size,0);assert.equal(broken.media.bytes,0);assert.equal(broken.urls.revoked.length,1);
});
test('unsupported imported audio becomes a file; a broken recording produces a technical error without a dead player',async()=>{
 const {media,urls}=store({inspectAudio:async()=>{throw Error('unsupported');}});
 const imported=await media.prepare(voice());assert.equal(imported.type,'file');assert.equal(imported.url,undefined);assert.equal(urls.revoked.length,1);
 await assert.rejects(media.prepare(voice(),{recorded:true,recordedDuration:3}));assert.equal(media.size,1);assert.equal(media.bytes,0);assert.equal(urls.revoked.length,2);
});
test('oversized, overlong and decoded-memory limits leave resources and reservations intact',async()=>{
 const limited=store({limits:{...MEDIA_LIMITS,sessionBytes:12}});await assert.rejects(limited.media.prepare(picture()));assert.equal(limited.media.bytes,0);assert.equal(limited.urls.created.length,0);
 const tooLong=store({inspectAudio:async()=>({duration:181})});await assert.rejects(tooLong.media.prepare(voice()));assert.equal(tooLong.media.bytes,0);assert.equal(tooLong.urls.revoked.length,1);
 await assert.rejects(tooLong.media.prepare({name:'huge.pdf',type:'application/pdf',size:MEDIA_LIMITS.fileBytes+1}));
});
test('deletion or clear during async decoding cannot resurrect a URL, and cancellation releases its reservation',async()=>{
 for(const action of ['delete','clear','abort']){
  let finish;const {media,urls}=store({inspectImage:()=>new Promise(resolve=>finish=resolve)});const controller=new AbortController();const preparing=media.prepare(picture(),{owner:'chat',signal:controller.signal});
  await new Promise(resolve=>setImmediate(resolve));if(action==='delete')media.releaseChat('chat');if(action==='clear')media.clear();if(action==='abort')controller.abort();finish({width:2,height:3});
  await assert.rejects(preparing,{name:'AbortError'});assert.equal(media.size,0);assert.equal(media.bytes,0);assert.equal(urls.revoked.length,1);
 }
});
test('resource ownership transfers once; cancelling a stale draft cannot revoke a sent attachment',async()=>{
 const {media,urls}=store();const attachment=await media.prepare(picture(),{owner:'chat'});assert.ok(media.claim(attachment.id,'chat'));assert.equal(media.claim(attachment.id,'chat'),null);media.releaseDraft(attachment.id);assert.equal(urls.revoked.length,0);media.releaseChat('chat');assert.equal(urls.revoked.length,1);assert.equal(media.size,0);
});
test('mixed history keeps text, removes complete temporary episodes including accompanying text and safety replies',async()=>{
 const {media}=store(),{app,storage}=service(media);app.start();await app.send('Первый текст');
 for(const [file,text]of [[picture(),'Посмотри на картинку'],[voice(),'Я всё сказал в записи'],[new File(['secret'],'secret.pdf'),'Мои документы']]){const a=await media.prepare(file,{owner:app.chat.id});assert.equal(await app.send({text,attachmentId:a.id}),true);}
 const danger=await media.prepare(picture(),{owner:app.chat.id});await app.send({text:'Я сейчас прыгну с крыши',attachmentId:danger.id});assert.equal(app.chat.messages.at(-1).kind,'silence');
 await app.send('Последний текст');assert.equal(app.chat.messages.length,13);
 const serialized=storage.value;for(const forbidden of ['blob:','Посмотри на картинку','Я всё сказал в записи','Мои документы','secret.pdf','episodeId','temporary','attachment','прыгну с крыши'])assert.ok(!serialized.includes(forbidden),forbidden);
 const loaded=createStorage(storage,{expressions}).load().state;assert.equal(loaded.chats[0].messages.length,5);assert.equal(loaded.chats[0].messages[1].text,'Первый текст');assert.equal(loaded.chats[0].messages[3].text,'Последний текст');
});
test('one accepted media send owns one pair, visible child precedes delay, reload never regenerates media',async()=>{
 let release;const {media}=store(),{app,storage}=service(media,undefined,{delay:()=>new Promise(resolve=>release=resolve)});app.start();const a=await media.prepare(voice(),{owner:app.chat.id});
 const sending=app.send({text:'',attachmentId:a.id});assert.equal(app.busy,true);assert.equal(app.chat.messages.length,3);assert.equal(app.chat.messages.at(-2).attachment.id,a.id);assert.ok(app.pendingId);assert.equal(await app.send({text:'',attachmentId:a.id}),false);
 const reloaded=createStorage(storage,{expressions}).load().state;assert.equal(reloaded.chats[0].messages.length,1);release();assert.equal(await sending,true);assert.equal(app.pendingId,null);
});
test('switching preserves sent URLs; deleting and clearing release them; a failed clear preserves media',async()=>{
 const {media,urls}=store(),{app}=service(media);app.start();const first=app.chat.id,a=await media.prepare(picture(),{owner:first});await app.send({text:'',attachmentId:a.id});app.newChat();app.select(first);assert.equal(media.get(a.id).url,a.url);assert.equal(urls.revoked.length,0);app.remove(first);assert.equal(media.get(a.id),null);assert.equal(urls.revoked.length,1);
 const b=await media.prepare(voice(),{owner:app.chat.id});await app.send({text:'',attachmentId:b.id});assert.equal(app.clear(),true);assert.equal(media.size,0);assert.equal(urls.revoked.length,2);
});
test('a technical media failure creates no messages, reaction or consumed draft',async()=>{
 const {media}=store(),{app}=service(media,undefined,{engine:{generate(){throw Error('domain failure');}}});app.start();const a=await media.prepare(voice(),{owner:app.chat.id});const before=app.chat.messages.length;
 assert.equal(await app.send({text:'',attachmentId:a.id}),false);assert.equal(app.chat.messages.length,before);assert.equal(app.busy,false);assert.equal(media.isDraft(a.id),true);
});
test('PNG/GIF/WebP/JPEG header parser rejects truncation and extracts reviewed dimensions',()=>{
 assert.equal(imageHeader(new Uint8Array([1,2,3])),null);
 const gif=new Uint8Array(10);gif.set([...Buffer.from('GIF89a')]);new DataView(gif.buffer).setUint16(6,32,true);new DataView(gif.buffer).setUint16(8,24,true);assert.deepEqual(imageHeader(gif),{mime:'image/gif',width:32,height:24});
 const jpeg=new Uint8Array([255,216,255,192,0,8,8,0,24,0,32,0]);assert.deepEqual(imageHeader(jpeg),{mime:'image/jpeg',width:32,height:24});
});

test('failed clearing preserves the live media episode and every URL',async()=>{
 const {media,urls}=store();let value=null,fail=false;
 const storage={getItem:()=>value,setItem:(key,next)=>{if(fail)throw Error('quota');value=next;}};
 const {app}=service(media,storage);app.start();const a=await media.prepare(voice(),{owner:app.chat.id});await app.send({text:'',attachmentId:a.id});fail=true;
 assert.equal(app.clear(),false);assert.equal(app.chat.messages.length,3);assert.equal(media.get(a.id).url,a.url);assert.equal(urls.revoked.length,0);
});

test('domain receives a category and text context but never filenames, blobs or local resource URLs',async()=>{
 const {media}=store();let payload;
 const spy={...engine,generate(value){payload=value;return engine.generate(value);}};
 const {app}=service(media,undefined,{engine:spy});app.start();const first=await media.prepare(voice(),{owner:app.chat.id});await app.send({text:'',attachmentId:first.id});
 const second=await media.prepare(picture(),{owner:app.chat.id});await app.send({text:'Посмотри',attachmentId:second.id});
 assert.equal(payload.attachmentType,'image');assert.equal(payload.input,'Посмотри');assert.ok(!JSON.stringify(payload).includes('blob:'));assert.ok(!JSON.stringify(payload).includes('voice.webm'));assert.ok(payload.history.every(m=>!m.attachment));
});
test('every category has observable but gated escalation across a multi-message episode',()=>{
 for(const type of ['audio','image','file']){
  let escalated=0;
  for(let seed=1;seed<=50;seed++){
   const random=seeded(seed),history=[];
   for(let turn=0;turn<5;turn++){const r=engine.generate({input:'',attachmentType:type,history,random});const e=expressions.get(r.expressionIds[0]);assert.equal(r.irritation,Math.min(turn,3));assert.ok((e.irritation||0)<=r.irritation);if(turn>=2&&e.irritation>=2)escalated++;history.push({role:'user',kind:'attachment',text:''},{role:'assistant',...r});}
  }
  assert.ok(escalated>20,type);
 }
});

test('an audio-labelled playlist becomes an inert file without native decoding or an object URL',async()=>{
 let calls=0;const {media,urls}=store({inspectAudio:async()=>{calls++;return {duration:3};}});
 const a=await media.prepare(new File(['#EXTM3U\nhttps://example.com/private'],'listen.mp3',{type:'audio/mpeg'}));assert.equal(a.type,'file');assert.equal(calls,0);assert.equal(urls.created.length,0);
});

test('image URLs use the validated raster MIME even if a renamed file claims HTML',async()=>{
 const {media,urls}=store();const file=new File([await picture().arrayBuffer()],'renamed.png',{type:'text/html'});const a=await media.prepare(file);assert.equal(a.type,'image');assert.equal(urls.created[0].type,'image/png');
});
