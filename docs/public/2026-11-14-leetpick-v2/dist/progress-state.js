import {validate,merge} from './core.js';

// Version1 LeetCode transfers remain unchanged. Version2 is the browser/backup
// envelope, separating imported evidence from the user's manual completions.
function normalizeManualIds(ids){
 if(!Array.isArray(ids)||ids.length>20000||!ids.every(id=>Number.isSafeInteger(id)&&id>0&&id<=1000000))throw Error('Invalid manual solved problem list.');
 return [...new Set(ids)].sort((a,b)=>a-b);
}
export function emptyProgressState(){return {version:2,source:'leetpick',imported:null,manualSolvedIds:[]};}
export function readProgressState(value){
 if(!value||typeof value!=='object')throw Error('Invalid saved progress.');
 if(value.version===1)return readProgressState({version:2,source:'leetpick',imported:value,manualSolvedIds:[]});
 if(value.version!==2||value.source!=='leetpick'||!Object.hasOwn(value,'imported'))throw Error('Unsupported progress format. Use a LeetPick export.');
 const imported=value.imported===null?null:{...validate(value.imported),lastImportedAt:typeof value.imported.lastImportedAt==='string'&&Number.isFinite(Date.parse(value.imported.lastImportedAt))?value.imported.lastImportedAt:null};
 const verified=new Set(imported?.solvedIds||[]);
 const manualSolvedIds=normalizeManualIds(value.manualSolvedIds).filter(id=>!verified.has(id));
 if(verified.size+manualSolvedIds.length>20000)throw Error('Combined progress exceeds 20,000 IDs.');
 return {version:2,source:'leetpick',imported,manualSolvedIds};
}
export function getSolvedIds(state){return new Set([...(state.imported?.solvedIds||[]),...state.manualSolvedIds]);}
export function markProblemSolved(state,id){
 const before=readProgressState(state);normalizeManualIds([id]);
 if(getSolvedIds(before).has(id))return before;
 return readProgressState({...before,manualSolvedIds:[...before.manualSolvedIds,id]});
}
export function mergeProgressStates(previous,incoming,replaceAccount=false,now=new Date().toISOString()){
 const before=readProgressState(previous),next=readProgressState(incoming);
 const switching=before.imported&&next.imported&&before.imported.username.toLowerCase()!==next.imported.username.toLowerCase();
 // merge enforces confirmation for a different LeetCode account. Unbound local
 // marks join the first account; another account never inherits them silently.
 const imported=next.imported?merge(before.imported,next.imported,replaceAccount,now):before.imported;
 const manualSolvedIds=[...(switching?[]:before.manualSolvedIds),...next.manualSolvedIds];
 return readProgressState({version:2,source:'leetpick',imported,manualSolvedIds:[...new Set(manualSolvedIds)]});
}
export function parseProgressJSON(text){
 if(typeof text!=='string'||text.length>200000)throw Error('This export is too large. Maximum size is 200 KB.');
 try{return readProgressState(JSON.parse(text));}catch(error){if(error instanceof SyntaxError)throw Error('This file does not contain valid progress JSON.');throw error;}
}
