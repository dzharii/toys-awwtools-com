import {MEDIA_TYPES} from '../config/media.js';
import {choices,weighted,repetitionWeight} from './selector.js';
export function mediaReply({expressions,type,history=[],random=Math.random}) {
  if(!MEDIA_TYPES.includes(type))throw Error('Неизвестная категория вложения.');
  const previous=history.filter(message=>message.role==='assistant').at(-1);
  // A text exchange or another category starts a fresh episode of persistence.
  const irritation=previous?.kind===type?Math.min(3,(previous.irritation||0)+1):0;
  const requested=choices(random);
  const available=expressions.filter(e=>e.scenarios?.includes(type)&&e.tones.includes(requested.tone)&&(e.irritation||0)<=irritation);
  let pool=available.filter(e=>e.library===requested.library&&e.tier===requested.tier);
  if(!pool.length)pool=available.filter(e=>e.library===requested.library);
  if(!pool.length)pool=available;
  const recent=history.filter(m=>m.role==='assistant').slice(-3).flatMap(m=>m.familyIds||[]);
  const fresh=pool.filter(e=>!recent.includes(e.familyId));if(fresh.length)pool=fresh;
  const expression=weighted(pool,random,e=>e.weight*repetitionWeight(e,history)*(e.irritation?1+irritation*3:1));
  if(!expression)throw Error('Нет подходящих отказов для вложения.');
  const gender=expression.forms?(random()<.5?'masculine':'feminine'):null;
  const text=gender?expression.forms[gender]:expression.canonical;
  return {kind:type,text,topic:'universal',tone:requested.tone,sourceLibrary:expression.library,tier:expression.tier,
    expressionIds:[expression.id],familyIds:[expression.familyId],parts:[{expressionId:expression.id,text}],gender,
    irritation,continuation:irritation>0,requested,libraryFallback:expression.library!==requested.library,ruleId:`media.${type}`};
}
