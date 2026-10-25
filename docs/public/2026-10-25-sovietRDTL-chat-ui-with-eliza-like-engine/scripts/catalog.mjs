import {formalAddress} from './address-policy.mjs';
import{allowedSourceUrl}from'../src/domain/source-policy.js';
import fs from 'node:fs';
import {validateSchema} from './json-schema.mjs';
const expressionSchema=JSON.parse(fs.readFileSync(new URL('../data/schema/expression.schema.json',import.meta.url),'utf8'));
export const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
export function load(){return {expressions:['common','odessa'].flatMap(l=>read(`data/source/${l}.json`).expressions),origins:['common','odessa'].flatMap(l=>read(`data/source/origins/${l}.json`).origins),topics:read('data/scenarios/topics.json'),rules:['common','odessa'].flatMap(l=>read(`data/rules/${l}.json`))};}
const allowed=new Set(['id','library','canonical','variants','topics','tones','tier','weight','roles','originId','familyId','irritation','isTemplate','scenarios','category','forms','closingContext','requiresTopics','contextPattern','situations','appendable','repeatClosing','pendingTopics']);
export function validate(data,{production=false}={}){
 const errors=[],ids=new Set(),origins=new Map(),topics=new Set(data.topics.map(t=>t.id)),texts=new Map();
 for(const o of data.origins){if(origins.has(o.id))errors.push('Duplicate origin '+o.id);origins.set(o.id,o);}
 for(const e of data.expressions){
  errors.push(...validateSchema(expressionSchema,e,e.id));
  const fail=m=>errors.push(e.id+': '+m);
  if(ids.has(e.id))fail('Duplicate ID');ids.add(e.id);
  if(!/^(common|odessa)\.[a-z0-9.-]+$/u.test(e.id)||!e.id.startsWith(e.library+'.'))fail('Invalid ID');
  if(e.requiresTopics?.some(t=>!topics.has(t)))fail('Invalid contextual topic');
  if(e.pendingTopics?.some(t=>!topics.has(t)))fail('Invalid pending topic');
  if(e.contextPattern){try{new RegExp(e.contextPattern,'iu');}catch{fail('Invalid context regex');}}
  if(Object.keys(e).some(k=>!allowed.has(k)))fail('Unknown field');
  if([e.canonical,...(Array.isArray(e.variants)?e.variants:[]),...Object.values(e.forms&&typeof e.forms==='object'?e.forms:{})].some(text=>typeof text==='string'&&formalAddress(text)))fail('Parent address must be singular informal');
  if(typeof e.canonical!=='string'||!e.canonical.trim())fail('Missing canonical');
  if(!e.familyId||!Array.isArray(e.variants)||e.variants.some(x=>typeof x!=='string'))fail('Invalid family/variants');
  if(!Array.isArray(e.topics)||!e.topics.length||e.topics.some(t=>!topics.has(t)))fail('Invalid topics');
  if(!Array.isArray(e.tones)||!e.tones.length||e.tones.some(t=>!['ironic','strict','sarcastic'].includes(t)))fail('Invalid tones');
  if(!['core','extended'].includes(e.tier)||typeof e.weight!=='number'||!Number.isFinite(e.weight)||e.weight<=0)fail('Invalid tier/weight');
  if(!Array.isArray(e.roles)||!e.roles.length||e.roles.some(r=>!['standalone','opening','closing'].includes(r)))fail('Invalid roles');
  const o=origins.get(e.originId);if(!o||o.expressionId!==e.id)fail('Missing/wrong origin');
  if(!e.isTemplate){const key=e.library+':'+e.canonical.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(texts.has(key))fail('Duplicate text '+texts.get(key));texts.set(key,e.id);}
 }
 for(const o of data.origins){
  if(!ids.has(o.expressionId))errors.push('Orphan origin '+o.id);
  if(!['documented','adapted','original','unverified'].includes(o.kind)||typeof o.summary!=='string'||o.summary.length<50)errors.push('Invalid origin '+o.id);
  if(!Array.isArray(o.sources)||(o.kind==='documented'&&!o.sources.length))errors.push('Missing evidence '+o.id);
  for(const s of o.sources||[]){try{if(s.url&&!allowedSourceUrl(s.url))throw Error();}catch{errors.push('Unsafe source '+o.id);}if(!s.title||!s.evidence||!s.checkedAt)errors.push('Incomplete source '+o.id);}
 }
 const ruleIds=new Set();for(const r of data.rules){if(Array.isArray(r.templates)&&r.templates.some(text=>formalAddress(text)))errors.push('Formal address in rule '+r.id);if(ruleIds.has(r.id))errors.push('Duplicate rule '+r.id);ruleIds.add(r.id);if(!ids.has(r.expressionId)||!topics.has(r.topic))errors.push('Invalid rule ref '+r.id);try{new RegExp(r.pattern,'iu');}catch{errors.push('Invalid regex '+r.id);}}
 for(const e of data.expressions)if(e.forms&&Object.values(e.forms).some(t=>/[а-я]\([а-я]+\)/iu.test(t)))errors.push('Bracketed gender form '+e.id);
 for(const l of ['common','odessa']){const all=data.expressions.filter(e=>e.library===l&&!e.isTemplate);if(all.length<(l==='common'?400:100))errors.push('Not enough standalone '+l);const core=all.filter(e=>e.tier==='core'&&(!e.scenarios||e.scenarios.includes('normal')||e.scenarios.some(k=>['opening','closing'].includes(k))));if(l==='common'&&(core.length<150||core.length>250))errors.push('Invalid common core size');if(production){const verified=core.filter(e=>['documented','adapted'].includes(origins.get(e.originId)?.kind)).length/core.length;if(verified<(l==='common'?.85:.8))errors.push(`Core evidence ${l}: ${(verified*100).toFixed(1)}% below required`);}}
 if(production&&data.origins.some(o=>o.kind==='unverified'))errors.push('Unverified origins remain');
 return errors;
}
export function stats(data){return {schemaVersion:1,libraries:Object.fromEntries(['common','odessa'].map(l=>[l,{standalone:data.expressions.filter(e=>e.library===l&&!e.isTemplate).length,templates:data.expressions.filter(e=>e.library===l&&e.isTemplate).length,core:data.expressions.filter(e=>e.library===l&&!e.isTemplate&&e.tier==='core').length}])),origins:data.origins.length,originKinds:Object.fromEntries(['documented','adapted','original','unverified'].map(k=>[k,data.origins.filter(o=>o.kind===k).length])),topicCounts:Object.fromEntries(data.topics.map(t=>[t.id,data.expressions.filter(e=>!e.isTemplate&&e.topics.includes(t.id)).length]))};}
