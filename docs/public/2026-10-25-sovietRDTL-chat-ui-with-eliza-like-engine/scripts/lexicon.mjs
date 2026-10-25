import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {load,validate,stats,read} from './catalog.mjs';
export function query(data,{id,q,library,topic,tone,tier,origin,fields='id,canonical,topics',offset=0,limit=20,full=false}={}){
 if(!Number.isInteger(Number(limit))||Number(limit)<1||Number(limit)>100||!Number.isInteger(Number(offset))||Number(offset)<0)throw Error('limit must be 1..100; offset must be a nonnegative integer');
 if(fields.split(',').some(k=>!['id','library','canonical','variants','topics','tones','tier','weight','roles','originId','familyId','irritation','isTemplate'].includes(k)))throw Error('Unknown projection field');
 const origins=new Map(data.origins.map(o=>[o.id,o]));
 const records=data.expressions.filter(e=>(!id||e.id===id)&&(!q||e.canonical.toLocaleLowerCase().includes(q.toLocaleLowerCase()))&&(!library||e.library===library)&&(!topic||e.topics.includes(topic))&&(!tone||e.tones.includes(tone))&&(!tier||e.tier===tier)&&(!origin||origins.get(e.originId)?.kind===origin));
 return {total:records.length,offset:Number(offset),limit:Number(limit),records:records.slice(Number(offset),Number(offset)+Number(limit)).map(e=>full?{...e,origin:origins.get(e.originId)}:Object.fromEntries(fields.split(',').map(k=>[k,e[k]])))};
}
export function mutate(data,command,id,record){
 const next=structuredClone(data);const index=next.expressions.findIndex(e=>e.id===id);
 if(command==='add'){if(index>=0)throw Error('ID already exists');if(!record.expression||!record.origin)throw Error('Add requires {expression,origin}');next.expressions.push(record.expression);next.origins.push(record.origin);}
 else {if(index<0)throw Error('ID not found');if(command==='remove'){const expression=next.expressions[index];if(next.rules.some(r=>r.expressionId===id))throw Error('Referenced by a rule');next.expressions.splice(index,1);next.origins=next.origins.filter(o=>o.id!==expression.originId);}else{if(record.id&&record.id!==id)throw Error('ID is immutable');Object.assign(next.expressions[index],record);}}
 const errors=validate(next);if(errors.length)throw Error(errors.join('\n'));return next;
}
// A paired catalog/origin write uses backup rollback; each file replacement is atomic.
export function persist(next,library){
 const files=[`data/source/${library}.json`,`data/source/origins/${library}.json`];const old=files.map(f=>fs.readFileSync(f));
 const values=[{...read(files[0]),expressions:next.expressions.filter(e=>e.library===library)},{...read(files[1]),origins:next.origins.filter(o=>o.expressionId.startsWith(library+'.'))}];
 try{for(let i=0;i<files.length;i++)fs.writeFileSync(files[i]+'.tmp',JSON.stringify(values[i],null,2)+'\n');for(const f of files)fs.renameSync(f+'.tmp',f);}catch(error){for(let i=0;i<files.length;i++){fs.writeFileSync(files[i]+'.rollback',old[i]);fs.renameSync(files[i]+'.rollback',files[i]);}throw error;}finally{for(const f of files)fs.rmSync(f+'.tmp',{force:true});}
}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href){
 try{const [command='list',...args]=process.argv.slice(2);const flags={};let positional;
 for(let i=0;i<args.length;i++){if(args[i].startsWith('--')){const k=args[i].slice(2);flags[k]=['full','production'].includes(k)?true:args[++i];}else positional=args[i];}
 const data=load();let result;
 if(command==='validate'){const errors=validate(data,flags);result={valid:!errors.length,errors,...stats(data)};if(errors.length)process.exitCode=1;}
 else if(command==='stats')result=stats(data);
 else if(command==='sources'){const e=data.expressions.find(e=>e.id===positional);if(!e)throw Error('ID not found');result=data.origins.find(o=>o.id===e.originId);}
 else if(['add','update','remove'].includes(command)){const record=flags.file?read(flags.file):null;const id=positional||record?.expression?.id;const next=mutate(data,command,id,record);const library=(data.expressions.find(e=>e.id===id)||record.expression).library;persist(next,library);result={ok:true,id};}
 else{result=query(data,{...flags,id:command==='get'?positional:undefined,q:command==='search'?positional:flags.q,full:command==='get'||flags.full});if(command==='get'&&!result.total)throw Error('ID not found');}
 console.log(JSON.stringify(result));}catch(e){console.error(e.message);process.exitCode=1;}
}
