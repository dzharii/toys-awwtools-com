import fs from 'node:fs';
import {load} from './catalog.mjs';
import {createEngine} from '../src/domain/engine.js';
import {analyze} from '../src/domain/analyzer.js';
const catalog=load(), engine=createEngine(catalog);
const cases=JSON.parse(fs.readFileSync('tests/fixtures/exploratory-chats.json','utf8'));
export function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
const label=process.argv[2]||'after';
const runs=cases.map(c=>{const random=seeded(17000+Number(c.id)),history=[];const opening=engine.opening({random});history.push({role:'assistant',...opening});return {...c,opening,turns:c.messages.map(input=>{const matched=analyze(input,catalog.topics,history).topics.map(t=>t.id);const reply=engine.generate({input,history,random});history.push({role:'user',text:input},{role:'assistant',...reply});return {input,matched,reply};})};});
fs.mkdirSync('docs/exploratory',{recursive:true});
fs.writeFileSync(`docs/exploratory/${label}.json`,JSON.stringify(runs,null,2)+'\n');
fs.writeFileSync(`docs/exploratory/${label}.md`,runs.map(c=>`## ${c.id}. ${c.scene}\n\n${c.persona}.\n\nРодитель: ${c.opening.text}\n\n`+c.turns.map((t,i)=>`${i+1}. Пользователь: ${t.input}\n\n   Родитель: ${t.reply.text}\n\n   Выбор: ${t.reply.kind}; тема ${t.reply.topic}; ${t.reply.sourceLibrary}; ${t.reply.tone}; выражения ${t.reply.expressionIds.join(', ')}; правило ${t.reply.ruleId||'event'}. Распознано: ${t.matched.join(', ')||'нет'}.`).join('\n\n')).join('\n\n')+'\n');
console.log(`${runs.length} chats, ${runs.reduce((n,c)=>n+c.turns.length,0)} turns -> docs/exploratory/${label}.json`);
