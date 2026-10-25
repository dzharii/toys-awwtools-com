import {choose} from './selector.js';
export function contextualOpening(input,rules,random) {
  if(input.length>240 || /[\n<>«»"“”]/u.test(input))return null;
  const candidates=[];
  for(const rule of rules){
    const match=new RegExp(rule.pattern,'iu').exec(input.trim());
    if(!match)continue;
    let capture=match.groups?.fragment?.trim();
    if(rule.id.includes('.why.') && /^бы(?:\s|$)/iu.test(capture||''))continue;
    if(!capture || capture.length>100 || /[,;:!?]/u.test(capture))continue;
    if(rule.captureMap){capture=rule.captureMap[capture.toLowerCase()];if(!capture)continue;}
    if(rule.capitalizeCapture)capture=capture[0].toLocaleUpperCase()+capture.slice(1);
    for(const template of rule.templates)candidates.push({priority:rule.priority||0,text:template.replace('{{fragment}}',()=>capture),ruleId:rule.id,expressionId:rule.expressionId});
  }
  const best=candidates.filter(c=>c.priority===Math.max(...candidates.map(x=>x.priority)));
  return best.length?choose(best,random):null;
}
export function sentences(text){return text.match(/[^.!?]+(?:[.!?]+|$)/gu)?.filter(s=>s.trim()).length||0;}
