import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {lessons} from '../src/lessons.js';
import {walkthroughGrid,walkthroughSteps} from '../src/advanced-lessons.js';
import {solve,pathXor} from '../src/model.js';
import {usedAssets} from '../scripts/audit-assets.mjs';
test('the entire worked state table agrees with independently computed grid reachability',()=>{
 const result=solve(walkthroughGrid);
 for(const step of walkthroughSteps){const [r,c]=step.cell,index=r*3+c;assert.equal(walkthroughGrid[r][c],step.value);assert.deepEqual(result.reachable(index),step.states);if(index){const incoming=new Set();if(r)for(const x of result.reachable(index-3))incoming.add(x);if(c)for(const x of result.reachable(index-1))incoming.add(x);assert.deepEqual([...incoming].sort((a,b)=>a-b),step.incoming);assert.deepEqual([...new Set(step.incoming.map(x=>x^step.value))].sort((a,b)=>a-b),step.states);}}
 assert.equal(pathXor(walkthroughGrid,[0,1,2,5]),3);assert.equal(pathXor(walkthroughGrid,[0,1,4,5]),3);assert.equal(pathXor(walkthroughGrid,[0,3,4,5]),0);
});
test('self-check results, cancellation, reverse XOR and representative histories are numerically correct',()=>{
 assert.equal((5^3)^5,3);assert.equal((5^3)^3,5);assert.equal(3^4,7);assert.equal(2^4,6);assert.equal(3^2^4,5);
 assert.deepEqual(solve([[1,2],[3,4]]).reachable(3),[6,7]);assert.deepEqual(solve([[1,2],[2,3]]).reachable(3),[0]);
 assert.deepEqual(solve([[0,1,0],[2,0,1]]).reachable(5),[0,3]);assert.deepEqual(solve([[0,1,0],[2,0,3]]).reachable(5),[1,2]);
 assert.equal(0^2,2);assert.equal((0^2)^5,7);assert.equal(solve([[9]]).min,9);
});
test('advanced hints give structured explanations, exact diagram references and explicit pseudocode vocabulary',()=>{
 assert.equal(lessons.length,8);for(const hint of lessons.slice(6)){assert.ok(hint.sections.length>=7);assert.ok(hint.sections.some(s=>s.figure));assert.ok(hint.sections.some(s=>s.check));}
 const pseudo=lessons[7].sections.find(s=>s.pseudocode).pseudocode;for(const word of ['cellNumber','incomingXor','newXor','reachableXors'])assert.ok(pseudo.includes(word));assert.ok(!pseudo.includes('that value'));
});
test('production assets have no unused files, missing diagrams or unoptimized PNG originals',async()=>{
 const used=await usedAssets(),files=await readdir('public/assets');assert.deepEqual(files.sort(),[...used].sort());assert.ok(!files.some(f=>/\.png$/i.test(f)));
 for(const hint of lessons.slice(6))for(const section of hint.sections)if(section.figure){const f=section.figure;const svg=await readFile('public/assets/'+f.name+'.svg','utf8');assert.ok(svg.includes(`viewBox="0 0 ${f.width} ${f.height}"`),f.name);}
 for(const name of files.filter(f=>f.endsWith('.svg'))){const svg=await readFile('public/assets/'+name,'utf8');assert.ok(svg.includes('viewBox='),name);if(name!=='mark.svg'){assert.ok(svg.includes('<title'),name);assert.ok(svg.includes('<desc'),name);}}
});
