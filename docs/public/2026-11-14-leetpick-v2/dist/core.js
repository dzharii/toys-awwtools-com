export const KEY='clearpick.progress.v1';
export function validate(value, now=Date.now()) {
 if(!value || value.version!==1 || value.source!=='leetcode.com') throw Error('Unsupported progress format. Use a LeetPick version 1 export.');
 if(typeof value.username!=='string'||!(/^[a-zA-Z0-9_.-]{1,100}$/).test(value.username)) throw Error('The export has an invalid account name.');
 if(typeof value.exportedAt!=='string'||!Number.isFinite(Date.parse(value.exportedAt))||Date.parse(value.exportedAt)>now+86400000) throw Error('The export has an invalid date.');
 if(!Array.isArray(value.solvedIds)||value.solvedIds.length>20000||!value.solvedIds.every(id=>Number.isSafeInteger(id)&&id>0&&id<=1000000)) throw Error('The export has an invalid solved problem list.');
 return {version:1,source:'leetcode.com',username:value.username,exportedAt:value.exportedAt,solvedIds:[...new Set(value.solvedIds)].sort((a,b)=>a-b)};
}
export function parseJSON(text) {if(typeof text!=='string'||text.length>200000)throw Error('This export is too large. Maximum size is 200 KB.');try{return validate(JSON.parse(text));}catch(e){if(e instanceof SyntaxError)throw Error('This file does not contain valid progress JSON.');throw e;}}
export function decodeFragment(hash) {
 if(!hash.startsWith('#import='))throw Error('Unknown import link.');const input=hash.slice(8);if(!/^[A-Za-z0-9_-]+$/.test(input)||input.length>270000)throw Error('Invalid import link. Use a fresh bookmarklet export.');
 try{return parseJSON(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(input.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));}catch(e){if(e.name==='InvalidCharacterError'||e.name==='TypeError')throw Error('Invalid import encoding. Use a fresh export.');throw e;}
}
export function merge(previous,incoming,replaceAccount=false,now=new Date().toISOString()) {
 const next=validate(incoming);let before=previous?validate(previous):null;
 if(before&&before.username.toLowerCase()!==next.username.toLowerCase()){if(!replaceAccount)throw Error('Account switch requires confirmation.');before=null;}
 const ids=[...new Set([...(before?.solvedIds||[]),...next.solvedIds])].sort((a,b)=>a-b);if(ids.length>20000)throw Error('Merged progress exceeds 20,000 IDs.');
 return {...next,exportedAt:before&&Date.parse(before.exportedAt)>Date.parse(next.exportedAt)?before.exportedAt:next.exportedAt,solvedIds:ids,lastImportedAt:now};
}
export function filterCatalog(catalog,solved,{search='',difficulty='all',status='all'}={}) {
 const q=search.trim().toLowerCase();return catalog.filter(p=>(difficulty==='all'||p.difficulty===difficulty)&&(status==='all'||(status==='solved')===solved.has(p.id))&&(!q||`${p.id} ${p.title} ${p.summary}`.toLowerCase().includes(q))).sort((a,b)=>Number(solved.has(a.id))-Number(solved.has(b.id))||a.id-b.id);
}
export function randomIndex(length,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]){if(!Number.isInteger(length)||length<1||length>20000)throw Error('No unsolved problems match these filters.');const ceiling=4294967296-4294967296%length;let n;do{n=random();}while(n>=ceiling);return n%length;}
