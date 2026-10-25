import test from 'node:test';
import assert from 'node:assert/strict';
import {read,load,validate} from '../scripts/catalog.mjs';
import {formalAddress,deferentialRequest} from '../scripts/address-policy.mjs';
import {createEngine} from '../src/domain/engine.js';
const catalog=load(),engine=createEngine(catalog),byId=new Map(catalog.expressions.map(e=>[e.id,e]));
const seeded=initial=>{let seed=initial;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
test('every parent phrase, variant, prepared form and rule addresses one child informally',()=>{
 let checked=0;
 for(const e of catalog.expressions)for(const text of [e.canonical,...e.variants,...Object.values(e.forms||{})]){assert.equal(formalAddress(text),false,`${e.id}: ${text}`);assert.equal(deferentialRequest(text),false,`${e.id}: ${text}`);checked++;}
 assert.ok(checked>=886);
 for(const rule of catalog.rules)for(const text of rule.templates)assert.equal(formalAddress(text),false,rule.id);
 for(const o of catalog.origins){assert.equal(formalAddress(o.title),false,o.id);assert.equal(formalAddress(o.summary),false,o.id);}
});
test('address policy rejects polite plurals without corrupting real plurals, imperative пришли or place names',()=>{
 for(const text of ['Вы мне скажите','Что вам надо?','У вас файл','Ваша работа','Скажите нормально','Идите уже','Здравcтвуйте. Говорите.','Не делайте мне нервы'])assert.equal(formalAddress(text),true,text);
 for(const text of ['Вместе посмотрим','В комнате порядок?','В твоём возрасте','Мы с тобой решили','Родители пришли','Пришли мне тетрадь','Я знаю Вашингтон','Не проси готового ответа'])assert.equal(formalAddress(text),false,text);
 const copy=structuredClone(catalog);copy.expressions[0].canonical='Скажите словами';assert.ok(validate(copy).some(e=>e.includes('singular informal')));
});
test('repeated refusals use a firm parental statement instead of a courteous request',()=>{
 assert.equal(byId.get('common.media.audio.005').canonical,'Опять эфир? Я же тебе сказал: говори нормально.');
 assert.equal(byId.get('common.media.image.013').canonical,'Я же сказал: без картинок. Говори нормально.');
 assert.ok(!byId.get('odessa.media.audio.003').canonical.includes('извиняюсь'));
 for(const e of catalog.expressions)assert.ok(!/сделай (?:мне )?одолжение|сделай мне приятно/iu.test(e.canonical),e.id);
 assert.ok(byId.get('common.fear.extra1').canonical.includes('Я рядом')||byId.get('common.fear.extra1').canonical.includes('вместе посмотрим'));
});
test('media uses a complete prepared child form, records gender and keeps actual part text',()=>{
 const e=byId.get('odessa.media.image.009'),only={...e,tones:['ironic','strict','sarcastic'],tier:'core',irritation:0};
 const custom=createEngine({...catalog,expressions:[only]});
 for(const [value,gender]of [[0,'masculine'],[.99,'feminine']]){const r=custom.generate({input:'',attachmentType:'image',random:()=>value});assert.equal(r.gender,gender);assert.equal(r.text,e.forms[gender]);assert.equal(r.parts[0].text,r.text);assert.equal(formalAddress(r.text),false);}
});
test('opening, closing, normal and media outputs stay informal across current conversations and random variants',()=>{
 const cases=read('tests/fixtures/exploratory-chats.json');
 for(let seed=1;seed<=10;seed++)for(const c of cases){const random=seeded(seed*1000+Number(c.id)),history=[];const o=engine.opening({random});assert.equal(formalAddress(o.text),false);history.push({role:'assistant',...o});
  for(const input of c.messages){const r=engine.generate({input,history,random});assert.equal(formalAddress(r.text),false,`${input}: ${r.text}`);history.push({role:'user',text:input},{role:'assistant',...r});}
 }
 for(const type of ['audio','image','file'])for(let seed=1;seed<=200;seed++){const random=seeded(seed),history=[];for(let i=0;i<5;i++){const r=engine.generate({input:'',attachmentType:type,history,random});assert.equal(formalAddress(r.text),false,r.text);history.push({role:'assistant',...r});}}
});
