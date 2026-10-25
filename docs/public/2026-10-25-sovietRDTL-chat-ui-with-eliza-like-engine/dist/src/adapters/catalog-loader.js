export async function loadCatalog(fetcher=fetch){
 const get=async path=>{const r=await fetcher(path);if(!r.ok)throw Error('Каталог недоступен');return r.json();};
 const manifest=await get('./data/manifest.json');
 if(manifest.schemaVersion!==1||manifest.applicationVersion!==1)throw Error('Несовместимая версия каталога');
 const runtime=await get('./'+manifest.files.runtime.path);
 if(runtime.schemaVersion!==1||runtime.contentVersion!==manifest.contentVersion)throw Error('Несогласованные версии данных');
 const {expressions,topics,rules}=runtime;const ids=new Set(expressions.map(e=>e.id));
 if(ids.size!==expressions.length||expressions.some(e=>!e.canonical||!e.originId)||rules.some(r=>!ids.has(r.expressionId)))throw Error('Повреждённый каталог');
 const cache=new Map();
 return {expressions,topics,rules,manifest,async origins(expressionIds){
  const chunkIds=[...new Set(expressionIds.map(id=>{const e=expressions.find(x=>x.id===id);if(!e)throw Error('Выражение отсутствует в этой версии каталога');return e.library;}))];
  const loaded=await Promise.all(chunkIds.map(async key=>{if(!cache.has(key)){const promise=get('./'+manifest.files[key+'Origins'].path).then(d=>{if(d.schemaVersion!==1||d.contentVersion!==manifest.contentVersion)throw Error('Несовместимая справочная статья');return d.origins;}).catch(e=>{cache.delete(key);throw e;});cache.set(key,promise);}return cache.get(key);}));
  const all=loaded.flat();return expressionIds.map(id=>{const expression=expressions.find(e=>e.id===id);const origin=all.find(o=>o.id===expression.originId);if(!origin)throw Error('Справочная статья отсутствует');return origin;});
 }};
}
