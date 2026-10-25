import test from 'node:test';
import assert from 'node:assert/strict';
import {load, read, validate} from '../scripts/catalog.mjs';
import {createEngine} from '../src/domain/engine.js';
import {analyze} from '../src/domain/analyzer.js';
import {contextualOpening, sentences} from '../src/domain/composer.js';
import {isImmediateDanger} from '../src/domain/safety.js';
import {validState} from '../src/domain/chat-state.js';
const catalog=load(), engine=createEngine(catalog);
const seeded=initial=>{let seed=initial;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};

test('existential and motion words are not food, day is not money, bathing is not purchasing',()=>{
 for(const [input,wrong]of [['У меня есть велосипед','food'],['У меня есть пять рублей','food'],['У меня есть своё мнение','food'],['Я еду в школу','food'],['Сегодня хороший день','money'],['Хочу купаться в море','purchase'],['У других условия лучше','study'],['Если дождь начнётся, я приду','curiosity']])assert.ok(!analyze(input,catalog.topics).topics.some(t=>t.id===wrong),input);
 assert.equal(analyze('Хочу вкусную еду',catalog.topics).topics[0].id,'food');
});

test('a completed duty is acknowledged, negation and a conditional are not accomplishments',()=>{
 for(const input of ['Я сделал все уроки','Я уже сделала уроки','Уроки сделал','Я уже помыла посуду']){
  for(let seed=1;seed<=20;seed++){
   const reply=engine.generate({input,random:seeded(seed)});
   assert.equal(reply.situation,'accomplished',input);
   assert.ok(!/Уроки сделал|Посуду помыл/u.test(reply.text));
  }
 }
 for(const input of ['Я не сделал уроки','Я не помыла посуду','Если я сделал уроки, можно гулять?','Завтра я помою посуду'])assert.notEqual(analyze(input,catalog.topics).situation,'accomplished',input);
});

test('completed lessons remain in the episode and do not become a new prerequisite',()=>{
 const random=seeded(52),history=[];
 for(const input of ['Я сделал все уроки','Можно гулять?','Всего на полчаса','Можно мультик?']){
  const reply=engine.generate({input,history,random});
  assert.ok(!reply.expressionIds.some(id=>['common.study.001','common.leisure.005','common.outing.specific3'].includes(id)));
  history.push({role:'user',text:input},{role:'assistant',...reply});
 }
 const closing=engine.generate({input:'Спасибо, пока',history,random});history.push({role:'assistant',...closing});
 assert.deepEqual(engine.generate({input:'Хочу гулять',history,random}).completedTopics,[]);
});

test('specific additions cover thirst, bedtime, clothing, fears, repair and offers',()=>{
 for(const [input,expected]of [['Я хочу пить','thirst'],['Я не хочу спать','sleep'],['Мне страшно в темноте','fear'],['Я не хочу надевать шапку','clothing'],['Помоги её починить','repair']]){
  for(let seed=1;seed<=25;seed++){const reply=engine.generate({input,random:seeded(seed)});assert.equal(reply.topic,expected,input);}
 }
 assert.equal(engine.generate({input:'Можно я помогу готовить?',random:seeded(8)}).situation,'offer');
});

test('grammar uses the highest priority reviewed transform and preserves uncertain captures',()=>{
 const rules=catalog.rules.filter(r=>r.library==='common'&&r.topic==='purchase');
 for(const input of ['Хочу купить новую книгу','Хочу купить новый компьютер'])assert.ok(contextualOpening(input,rules,()=>.99).ruleId.includes('.buy.'));
 const quote=contextualOpening('Хочу купить iPhone',rules,()=>0);
 assert.equal(quote.text,'«купить iPhone»?');
 assert.equal(contextualOpening('Хочу купить новую компьютер',rules.filter(r=>r.id.includes('.buy.')),()=>0),null);
});

test('every hint has its own edited interpretation and no provenance boilerplate or template title',()=>{
 const review=read('research/reviews/hint-review.json');
 assert.equal(review.length,catalog.origins.length);
 assert.equal(review.filter(r=>r.action==='rewritten').length,640);
 for(const origin of catalog.origins){
  assert.ok(origin.summary.length>=50&&origin.summary.length<=350,origin.id);
  assert.ok(!/атрибуци|не проверен|не является|СоветРДТЛ|движок|редакционн.*сценари/iu.test(origin.summary),origin.id);
  assert.ok(!origin.title.includes('{{'),origin.id);
 }
 assert.deepEqual(validate(catalog),[]);
});

test('20 exploratory chats have 12 turns each; 10 seeds preserve traces, parts and grammar invariants',()=>{
 const cases=read('tests/fixtures/exploratory-chats.json');assert.equal(cases.length,20);assert.equal(new Set(cases.map(c=>c.persona)).size,10);
 for(let seed=1;seed<=10;seed++)for(const chat of cases){
  assert.equal(chat.messages.length,12);const random=seeded(seed*1000+Number(chat.id));const history=[{role:'assistant',...engine.opening({random})}];
  for(const input of chat.messages){
   const reply=engine.generate({input,history,random});
   assert.ok(reply.expressionIds.every(id=>catalog.expressions.some(e=>e.id===id)));
   assert.ok(!/\{\{|[а-я]\([а-я]+\)/iu.test(reply.text));
   assert.ok(sentences(reply.text)<=3);
   if(reply.parts){assert.equal(reply.parts.map(p=>p.text).join(' '),reply.text);assert.deepEqual(reply.parts.map(p=>p.expressionId),reply.expressionIds);}
   history.push({role:'user',text:input},{role:'assistant',...reply});
  }
 }
});

test('current persisted parts reject corrupt fragments',()=>{
 const state={schemaVersion:2,nextChatNumber:2,selectedChatId:'c',chats:[{id:'c',number:1,title:'Новый чат 1',backgroundId:'room-01-lamp',createdAt:'2026-10-24',updatedAt:'2026-10-24',messages:[{id:'m',role:'assistant',kind:'reply',tone:'ironic',sourceLibrary:'common',tier:'core',familyIds:['e'],text:'Пример',createdAt:'2026-10-24',expressionIds:['e']}]}]};
 assert.ok(validState(state));state.chats[0].messages[0].parts='broken';assert.equal(validState(state),false);
 state.chats[0].messages[0].parts=[{text:'Пример',expressionId:'e'}];assert.ok(validState(state));
 state.chats[0].messages[0].parts[0].expressionId='wrong';assert.equal(validState(state),false);
});

test('imminent intent is not masked by unrelated refusal, a roof location or a third-person report',()=>{
 for(const input of ['Я сейчас на крыше и собираюсь прыгнуть','Я не хочу разговаривать и сейчас прыгну с крыши','Он собирается прямо сейчас прыгнуть с крыши'])assert.equal(isImmediateDanger(input),true,input);
 for(const input of ['Я не собираюсь прыгать с крыши сейчас','А если все с крыши прыгнут, я тоже должен?','В фильме он собирается сейчас прыгнуть с крыши'])assert.equal(isImmediateDanger(input),false,input);
});
