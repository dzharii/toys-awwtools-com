import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('every catalog entry has a unique reserved-space illustration and completed review',async()=>{
 const {problems}=JSON.parse(await read('dist/catalog.json'));
 const assets=JSON.parse(await read('dist/illustrations.json'));
 const checks=JSON.parse(await read('docs/illustrations/checklist.json'));
 assert.equal(Object.keys(assets).length,problems.length);
 assert.equal(new Set(Object.values(assets).map(a=>a.src)).size,problems.length);
 for(const p of problems){const a=assets[p.id];assert.ok(a);assert.equal(a.width/a.height,6);assert.equal(a.alt,'');assert.ok(checks.find(c=>c.id===p.id)?.integrated);await readFile(new URL('../dist/'+a.src,import.meta.url));}
});
test('offline entry has valid executable JavaScript and all local asset mappings',async()=>{
 const html=await read('offline.html');
 assert.ok(!html.includes('src="/app.js"'));
 assert.ok(!html.includes('href="/styles.css"'));
 const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
 new vm.Script(script);
 const assets=JSON.parse(await read('dist/illustrations.json'));
 for(const a of Object.values(assets))assert.ok(script.includes('dist/'+a.src));
 assert.ok(!script.includes("await fetch('/catalog.json')"));
 assert.ok(html.includes('href="docs/SPECIFICATION.md"'));
});
