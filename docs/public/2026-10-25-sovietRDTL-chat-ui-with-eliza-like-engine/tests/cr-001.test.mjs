import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {load,read} from '../scripts/catalog.mjs';
import {analyze} from '../src/domain/analyzer.js';
import {createEngine} from '../src/domain/engine.js';
import {readableState,emptyState,validMessage,validState} from '../src/domain/chat-state.js';
import {createStorage} from '../src/adapters/local-storage.js';
import {createChatService} from '../src/app/chat-service.js';
import {BACKGROUNDS,chooseBackground} from '../src/config/backgrounds.js';
const data=load(), engine=createEngine(data), options={expressions:new Map(data.expressions.map(e=>[e.id,e]))};
const seeded=start=>{let seed=start;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
const now='2026-10-24T20:00:00Z';
const opening=()=>({...engine.opening({random:seeded(7)}),id:'opening',role:'assistant',createdAt:now});
const chat=()=>({id:'chat',number:1,title:'Новый чат 1',createdAt:now,updatedAt:now,backgroundId:BACKGROUNDS[0].id,messages:[opening()]});
const state=()=>({...emptyState(),nextChatNumber:2,selectedChatId:'chat',chats:[chat()]});
const memory=()=>{let value=null;return {getItem:()=>value,setItem:(key,next)=>value=next};};

test('current history filters individual corrupt messages and malformed chats without hiding valid neighbors',()=>{
 const s=state();s.chats[0].messages.unshift(null,{id:'wrong',role:'assistant',text:17});
 s.chats[0].messages.push({id:'user',role:'user',kind:'input',text:'Привет',createdAt:now},{...opening(),id:'second-opening'});
 s.chats.push(null,{...chat(),id:'bad',backgroundId:'unknown'},chat());
 const restored=readableState(s,options);
 assert.equal(restored.chats.length,1);assert.deepEqual(restored.chats[0].messages.map(m=>m.id),['opening','user']);assert.ok(validState(restored,options));
});
test('unreadable roots and unsupported formats produce a usable current empty state',()=>{
 for(const value of [null,7,[],{}, {...state(),schemaVersion:1}, {...state(),nextChatNumber:Infinity}])assert.deepEqual(readableState(value,options),emptyState());
});
test('bad source, emotion, role, function, family and fragments cannot enter current history',()=>{
 const original=opening();
 for(const mutation of [{sourceLibrary:'unknown'},{tone:'unknown'},{role:'parent'},{kind:'normal'},{familyIds:['invented']},{expressionIds:['missing']},{parts:[{expressionId:original.expressionIds[0],text:'Несовпадающий текст'}]}])assert.equal(validMessage({...original,...mutation},options),false,JSON.stringify(mutation));
 const silence={id:'quiet',role:'assistant',kind:'silence',text:'(молчит)',expressionIds:[],familyIds:[],createdAt:now};assert.ok(validMessage(silence,options));assert.equal(validMessage({...silence,tone:'strict'},options),false);
});
test('background identity and opening metadata survive switching and storage reload without RNG consumption',async()=>{
 const store=memory();let calls=0,id=0;
 const service=createChatService({engine,storage:createStorage(store,options),random:seeded(55),backgroundRandom:()=>{calls++;return .2;},id:()=>String(++id),clock:()=>now,delay:async()=>{}});
 service.start();const first=structuredClone(service.chat);await service.send('Можно гулять?');service.newChat();const second=service.chat;
 assert.notEqual(first.backgroundId,second.backgroundId);service.select(first.id);assert.equal(service.chat.messages[0].text,first.messages[0].text);assert.equal(service.chat.messages[0].tone,first.messages[0].tone);assert.equal(service.chat.messages[0].kind,'opening');
 const loaded=createStorage(store,options).load();assert.equal(loaded.state.chats.find(c=>c.id===first.id).backgroundId,first.backgroundId);assert.equal(calls,2);assert.equal(service.error,'');
});
test('background selection avoids three recent rooms and cannot change engine randomness',()=>{
 const recent=BACKGROUNDS.slice(0,3).map(b=>b.id);for(let n=0;n<=100;n++)assert.ok(!recent.includes(chooseBackground(()=>n/100,recent)));
 const response=bg=>{let id=0;const s=createChatService({engine,storage:createStorage(memory(),options),random:seeded(7),backgroundRandom:bg,id:()=>String(++id),clock:()=>now});s.start();return s.chat.messages[0];};
 assert.deepEqual(response(()=>0),response(()=>.99));
});
test('40 optimized artworks have correct hashes, sizes, dimensions and complete registry pairs',()=>{
 const manifest=read('docs/cr-001-assets.json');assert.equal(manifest.length,40);assert.equal(BACKGROUNDS.length,20);
 for(const b of BACKGROUNDS)for(const variant of ['desktop','mobile']){
  const row=manifest.find(r=>r.id===b.id&&r.variant===variant);assert.equal(b[variant],'./'+row.path);const bytes=fs.readFileSync(row.path);
  assert.equal(bytes.length,row.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert.equal(row.width,variant==='mobile'?768:1672);assert.ok(row.bytes<(variant==='mobile'?25000:100000));
 }
});
test('all 2400 exploratory replies can be persisted with their actual unified tone and expression traces',()=>{
 for(let seed=1;seed<=10;seed++)for(const c of read('tests/fixtures/exploratory-chats.json')){
  const random=seeded(seed*1000+Number(c.id)),history=[{role:'assistant',...engine.opening({random})}];
  for(const input of c.messages){const reply=engine.generate({input,history,random});assert.ok(validMessage({...reply,id:'reply',role:'assistant',createdAt:now},options),`${c.id}: ${input} ${JSON.stringify(reply)}`);history.push({role:'user',text:input},{role:'assistant',...reply});}
 }
});
test('clarification, initiative and parent meta questions retain their intent across random variants',()=>{
 for(const [input,expected] of [['Объясни попроще, я не понимаю','clarification'],['Покажи хотя бы один раз','clarification'],['Нет, я не понял','clarification'],['Можно я сам посмотрю в книжке?','initiative'],['Я попробую по-другому','initiative'],['Почему ты всё время спрашиваешь про уроки?','meta_parent'],['Мой друг поехал на море','news']])for(let seed=1;seed<=30;seed++){
  const r=engine.generate({input,random:seeded(seed)});assert.equal(r.situation,expected,input);assert.ok(r.expressionIds.every(id=>options.expressions.get(id).situations?.includes(expected)),r.text);
 }
});
test('curated fear responses preserve their subject without sarcastic presentation',()=>{
 for(let seed=1;seed<=100;seed++){const r=engine.generate({input:'Мне страшно в темноте',random:seeded(seed)});assert.equal(r.topic,'fear');assert.notEqual(r.tone,'sarcastic');assert.ok(r.expressionIds.every(id=>options.expressions.get(id).topics.includes('fear')));assert.equal(r.toneFallback,r.requested.tone!==r.tone);}
});
test('social arguments always use an applicable counterargument even on secondary topic selection',()=>{
 for(const input of ['Почему сестре можно, а мне нельзя?','У всех моих друзей новые телефоны','Все мои друзья ложатся позже'])for(let seed=1;seed<=80;seed++){
  const r=engine.generate({input,random:seeded(seed)});assert.equal(r.kind,'social_imitation');assert.ok(r.expressionIds.every(id=>options.expressions.get(id).topics.includes('social_imitation')));if(!/телефон/u.test(input))assert.ok(!r.text.includes('список покупок'));
 }
});
test('unmentioned discounts, tea, earlier permission and working old purchases are excluded',()=>{
 for(const input of ['Можно новый телефон?','Купишь велосипед?','Почему нельзя взять двух?','А сок можно?'])for(let seed=1;seed<=100;seed++){
  const r=engine.generate({input,random:seeded(seed)});assert.ok(!r.expressionIds.some(id=>['common.purchase.009','common.food.012','odessa.purchase.003','odessa.purchase.007','odessa.prohibition.004'].includes(id)),`${input}: ${r.text}`);
 }
});
const rgb=hex=>hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16));
const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05);};
test('tone text, speaker labels and information controls exceed 4.5:1 even over a white image behind the matte surface',()=>{
 const css=fs.readFileSync('styles.css','utf8');
 for(const tone of ['ironic','strict','sarcastic']){
  const text=rgb(css.match(new RegExp(`--tone-${tone}-text: (#\\w+)`))[1]);const values=css.match(new RegExp(`--tone-${tone}-surface: rgba\\(([^)]+)`))[1].split(',').map(Number);const bg=values.slice(0,3).map(v=>v*values[3]+255*(1-values[3]));
  for(const fg of [text,rgb('#b8b6b4'),rgb('#b9b7b5')])assert.ok(contrast(fg,bg)>=4.5,`${tone} ${contrast(fg,bg)}`);
 }
});

test('another person completing a duty cannot mark the user duty as completed',()=>{
 for(const input of ['Мой друг сделал уроки','Сестра уже помыла посуду','Маша прочитала книжку','Папа убрал комнату'])assert.notEqual(analyze(input,data.topics).situation,'accomplished',input);
 for(const input of ['Уроки сделал','Посуду помыла','Я уже сделал уроки','А я наелась'])assert.equal(analyze(input,data.topics).situation,'accomplished',input);
});
