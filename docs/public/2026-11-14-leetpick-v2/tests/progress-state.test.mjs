import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgressState,readProgressState,getSolvedIds,markProblemSolved,mergeProgressStates,parseProgressJSON} from '../dist/progress-state.js';
import {filterCatalog} from '../dist/core.js';
const transfer=(ids=[],username='example',exportedAt='2026-01-01T00:00:00Z')=>({version:1,source:'leetcode.com',username,exportedAt,solvedIds:ids});
const ids=state=>[...getSolvedIds(state)].sort((a,b)=>a-b);
test('legacy storage migrates without losing imported IDs or receipt time',()=>{
 const old={...transfer([151,42,42,99999]),lastImportedAt:'2026-11-01T12:00:00Z'};
 const next=readProgressState(old);assert.equal(next.version,2);assert.deepEqual(ids(next),[42,151,99999]);assert.equal(next.imported.lastImportedAt,old.lastImportedAt);assert.deepEqual(next.manualSolvedIds,[]);assert.equal(old.version,1);
});
test('manual completion works without an account and has no reverse transition',()=>{
 const empty=emptyProgressState(),once=markProblemSolved(empty,73),twice=markProblemSolved(once,73);
 assert.equal(once.imported,null);assert.deepEqual(once.manualSolvedIds,[73]);assert.deepEqual(twice,once);assert.deepEqual(empty.manualSolvedIds,[]);
 const stale=mergeProgressStates(once,empty);assert.deepEqual(ids(stale),[73]);
});
test('same-account imports preserve manual completion and older imported evidence',()=>{
 let state=markProblemSolved(readProgressState(transfer([42],'Example','2026-06-01T00:00:00Z')),151);
 state=mergeProgressStates(state,transfer([73],'example'));assert.deepEqual(ids(state),[42,73,151]);assert.deepEqual(state.manualSolvedIds,[151]);assert.equal(state.imported.exportedAt,'2026-06-01T00:00:00Z');
 state=mergeProgressStates(state,transfer([151],'example'));assert.deepEqual(ids(state),[42,73,151]);assert.deepEqual(state.manualSolvedIds,[]);
});
test('anonymous marks join first sync, different accounts require explicit replacement',()=>{
 const local=markProblemSolved(emptyProgressState(),73);
 const a=mergeProgressStates(local,transfer([42],'alice'));assert.deepEqual(ids(a),[42,73]);
 const b=markProblemSolved(readProgressState(transfer([151],'bob')),299);
 assert.throws(()=>mergeProgressStates(a,b));assert.deepEqual(ids(a),[42,73]);
 const switched=mergeProgressStates(a,b,true);assert.equal(switched.imported.username,'bob');assert.deepEqual(ids(switched),[151,299]);
});
test('v2 JSON backups round-trip local-only and imported progress and merge monotonically',()=>{
 for(const initial of [emptyProgressState(),readProgressState(transfer([42]))]){
  const state=markProblemSolved(initial,73),backup=parseProgressJSON(JSON.stringify(state));assert.deepEqual(backup,state);
  const next=mergeProgressStates(markProblemSolved(state,151),backup);assert.deepEqual(ids(next),initial.imported?[42,73,151]:[73,151]);
 }
 assert.deepEqual(ids(parseProgressJSON(JSON.stringify(transfer([42])))),[42]);
});
test('invalid backup fields and limits reject the entire update',()=>{
 for(const bad of [null,{}, {...emptyProgressState(),version:3},{...emptyProgressState(),source:'other'}, {...emptyProgressState(),imported:undefined},...[[0],[-1],[1.1],['73'],[1000001],null,Array(20001).fill(1)].map(manualSolvedIds=>({...emptyProgressState(),manualSolvedIds}))])assert.throws(()=>readProgressState(bad));
 const full=readProgressState(transfer(Array.from({length:20000},(_,i)=>i+1)));assert.throws(()=>markProblemSolved(full,20001));assert.equal(getSolvedIds(full).size,20000);
 assert.throws(()=>parseProgressJSON('{'));assert.throws(()=>parseProgressJSON(' '.repeat(200001)));
});
test('manual completions participate in filtering and numeric solved partitioning',()=>{
 const catalog=[42,73,151].map(id=>({id,title:String(id),summary:'Task',difficulty:'Medium'}));
 const state=markProblemSolved(emptyProgressState(),73),solved=getSolvedIds(state);
 assert.deepEqual(filterCatalog(catalog,solved).map(p=>p.id),[42,151,73]);assert.deepEqual(filterCatalog(catalog,solved,{status:'unsolved'}).map(p=>p.id),[42,151]);assert.deepEqual(filterCatalog(catalog,solved,{status:'solved'}).map(p=>p.id),[73]);
});
