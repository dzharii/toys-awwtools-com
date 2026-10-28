import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ExperimentEngine} from '../src/core/experiment-engine.js';
import {solve,pathXor,validPath} from '../src/model.js';
import {optimalRouteGraph,enumerateOptimalRoutes,countOptimalRoutes} from '../src/core/optimal-paths.js';
import {selectPresentation,normalizeViewPreferences} from '../src/views/selection.js';
import {cellMarkup,mixRouteColors,routeColor} from '../src/views/cells.js';
const experiment = grid => ({grid:structuredClone(grid),path:[0],reference:null});
test('route traces include the start, every XOR transformation and final result without changing manual exploration',()=>{
 const e=new ExperimentEngine(experiment([[1,2,3],[2,3,4],[3,4,5]]));
 const routes=e.optimalRoutes().paths;
 const first=e.tracePath(routes[0]),other=e.tracePath(routes[2]);
 assert.deepEqual(first.map(s=>s.xor),[1,3,0,4,1]);
 assert.deepEqual(other.map(s=>s.xor),[1,3,0,4,1]);
 assert.notDeepEqual(first.map(s=>s.cell),other.map(s=>s.cell));
 for(const path of routes){const trace=e.tracePath(path);for(let i=0;i<trace.length;i++){const step=trace[i];assert.equal(step.xor,pathXor(e.grid,path.slice(0,i+1)));assert.equal(step.previous^step.value,step.xor);assert.equal(parseInt(step.binary,2),step.xor);assert.equal(step.step,i+1);assert.equal(step.from,i?path[i-1]:null);assert.equal(step.final,i===path.length-1);}assert.equal(trace.at(-1).xor,1);}
 assert.deepEqual(e.path,[0]);assert.equal(e.xor,1);
 e.setValue(0,1023);assert.equal(e.tracePath(routes[0])[0].xor,1023);
 assert.throws(()=>e.tracePath([0,4]));
 const single=new ExperimentEngine(experiment([[1023]])).tracePath();assert.equal(single[0].final,true);assert.equal(single[0].binary,'1111111111');
 const long=new ExperimentEngine(experiment([Array(1000).fill(3)])).tracePath(Array.from({length:1000},(_,i)=>i));assert.equal(long.length,1000);assert.equal(long.at(-1).xor,0);
});
test('focused route cells show their own running XOR separately from a manual next-move preview',()=>{
 const trace={step:3,previous:6,xor:4,binary:'0000000100',final:false};
 const html=cellMarkup({index:2,row:0,col:2,value:2,size:80,left:0,top:0,preview:{xor:7,binary:'0000000111'},routeTrace:trace,routeIds:[0]});
 assert.ok(html.includes('data-route-xor="4"'));assert.ok(html.includes('data-preview-xor="7"'));assert.ok(html.includes('#3 running XOR'));assert.ok(html.includes('class="preview-binary">0000000100'));assert.ok(html.includes('6 XOR 2 = 4'));assert.ok(!html.includes('class="preview-binary">0000000111'));
 const final=cellMarkup({index:0,row:0,col:0,value:9,size:80,left:0,top:0,routeTrace:{step:1,previous:0,xor:9,binary:'0000001001',final:true}});assert.ok(final.includes('#1 final XOR'));assert.ok(final.includes('0 XOR 9 = 9'));
});
function enumerate(grid) {
  const paths=[];const n=grid[0].length;
  function walk(r,c,path,xor) {path=[...path,r*n+c];xor^=grid[r][c];if(r===grid.length-1&&c===n-1)paths.push({path,xor});else{if(c+1<n)walk(r,c+1,path,xor);if(r+1<grid.length)walk(r+1,c,path,xor);}}
  walk(0,0,[],0);return paths;
}
function binomial(n,k){let result=1n;for(let i=1;i<=k;i++)result=result*BigInt(n-k+i)/BigInt(i);return result;}
test('next moves expose exact decimal and 10-bit XOR, and update after move/undo/reset',()=>{
 const e=new ExperimentEngine(experiment([[3,5,2],[6,1,4]]));
 assert.deepEqual(e.nextMoves(),[{cell:1,value:5,xor:6,binary:'0000000110'},{cell:3,value:6,xor:5,binary:'0000000101'}]);
 assert.ok(e.move(1));assert.equal(e.xor,6);assert.deepEqual(e.nextMoves().map(m=>[m.cell,m.xor]),[[2,4],[4,7]]);
 e.undo();assert.equal(e.xor,3);assert.equal(e.nextMoves()[0].xor,6);e.move(3);e.reset();assert.equal(e.position,0);
});
test('invalid moves cannot wrap rows, move diagonally, or corrupt state',()=>{
 const e=new ExperimentEngine(experiment([[1,2],[3,4]]));assert.equal(e.move(3),false);e.move(1);assert.equal(e.move(2),false);assert.deepEqual(e.path,[0,1]);e.move(3);assert.ok(e.complete);assert.deepEqual(e.nextMoves(),[]);
});
test('edits and resize recompute previews and invalidate cached solutions and routes',()=>{
 const e=new ExperimentEngine(experiment([[1,2],[3,4]])),first=e.solution();assert.equal(first.min,6);e.optimalRoutes();e.setValue(0,5);assert.equal(e.xor,5);assert.equal(e.nextMoves()[0].xor,7);assert.notEqual(e.solution(),first);assert.equal(e.optimalRoutes().minimum,2);e.resize(1,1);assert.ok(e.complete);assert.equal(e.xor,5);assert.equal(e.optimalRoutes().count,1n);assert.throws(()=>e.setValue(0,1024));assert.throws(()=>e.resize(1000,2));
});
test('all optimal routes are returned for small grids, with exact overlap membership',()=>{
 const grid=[[0,0],[0,0]],analysis=enumerateOptimalRoutes(grid,optimalRouteGraph(grid,solve(grid)),8);
 assert.equal(analysis.count,2n);assert.equal(analysis.truncated,false);assert.deepEqual(analysis.paths,[[0,1,3],[0,2,3]]);assert.deepEqual(analysis.membership,[[0,1],[0],[1],[0,1]]);assert.deepEqual([...analysis.cells],[1,1,1,1]);
});
test('bounded colored samples do not truncate the exact cell union or route count',()=>{
 const grid=[[0,0],[0,0]],analysis=enumerateOptimalRoutes(grid,optimalRouteGraph(grid,solve(grid)),1);assert.equal(analysis.paths.length,1);assert.equal(analysis.count,2n);assert.equal(analysis.truncated,true);assert.equal(analysis.cells[2],1);assert.deepEqual(analysis.membership[2],[]);
});
test('official sample 1 has one optimal route',()=>{const grid=[[1,2],[3,4]],result=new ExperimentEngine(experiment(grid)).optimalRoutes();assert.equal(result.count,1n);assert.equal(result.minimum,6);assert.deepEqual(result.paths,[[0,2,3]]);assert.deepEqual([...result.cells],[1,0,1,1]);});
test('optimal count, union, and every route agree with exhaustive enumeration on 200 random grids',()=>{
 let state=816;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state>>>16;};
 for(let trial=0;trial<200;trial++){const m=1+random()%4,n=1+random()%4,grid=Array.from({length:m},()=>Array.from({length:n},()=>random()%16));const all=enumerate(grid),minimum=Math.min(...all.map(p=>p.xor)),optimal=all.filter(p=>p.xor===minimum),result=new ExperimentEngine(experiment(grid)).optimalRoutes(32);assert.equal(result.minimum,minimum);assert.equal(result.count,BigInt(optimal.length));assert.deepEqual(result.paths.map(p=>p.join(',')).sort(),optimal.map(p=>p.path.join(',')).sort());const union=new Set(optimal.flatMap(p=>p.path));for(let i=0;i<m*n;i++)assert.equal(!!result.cells[i],union.has(i));}
});
test('maximum grids retain exact BigInt counts while enumerating at most 32 routes',()=>{
 const grid=Array.from({length:25},()=>Array(40).fill(0)),e=new ExperimentEngine(experiment(grid)),result=e.optimalRoutes(1000);assert.equal(result.count,binomial(63,24));assert.ok(result.count>BigInt(Number.MAX_SAFE_INTEGER));assert.equal(result.paths.length,32);assert.equal(result.truncated,true);assert.equal(new Set(result.paths.map(p=>p.join(','))).size,32);for(const p of result.paths){assert.ok(validPath(grid,p));assert.equal(pathXor(grid,p),0);}assert.equal(result.active.byteLength,1024000);
});
test('one-thousand-cell narrow routes never depend on recursive path reconstruction',()=>{for(const grid of [[Array(1000).fill(3)],Array.from({length:1000},()=>[3])]){const r=new ExperimentEngine(experiment(grid)).optimalRoutes();assert.equal(r.count,1n);assert.equal(r.paths.length,1);assert.equal(r.paths[0].length,1000);assert.equal(countOptimalRoutes(grid,0),1n);}});
test('overlap colors use equal-weight native CSS color mixing with distinct route colors',()=>{assert.notEqual(routeColor(0),routeColor(1));assert.equal(mixRouteColors([]),'transparent');assert.equal(mixRouteColors([0]),routeColor(0));assert.match(mixRouteColors([0,1]),/color-mix\(in oklab,.*50\.000%/);assert.match(mixRouteColors([0,1,2]),/66\.667%/);assert.equal(new Set(Array.from({length:32},(_,i)=>routeColor(i))).size,32);});
test('rendered next-cell value, projected binary, decimal, and overlap data stay distinct',()=>{const html=cellMarkup({index:1,row:0,col:1,value:5,size:88,left:0,top:0,preview:{xor:6,binary:'0000000110'},routeIds:[0,1],optimalCell:true});assert.ok(html.includes('class="cell-value">5</span>'));assert.ok(html.includes('class="preview-binary">0000000110</code>'));assert.ok(html.includes('class="preview-decimal">6'));assert.ok(html.includes('data-optimal-routes="1,2"'));assert.ok(html.includes('running XOR 6'));});
test('mobile and desktop are independently selected and keep separate normalized preferences',()=>{assert.equal(selectPresentation('auto',true),'mobile');assert.equal(selectPresentation('auto',false),'desktop');assert.equal(selectPresentation('desktop',true),'desktop');assert.equal(selectPresentation('mobile',false),'mobile');const prefs=normalizeViewPreferences({}, {zoom:1.5,layout:'reading',split:64,mode:'edit'});assert.equal(prefs.desktop.zoom,1.5);assert.equal(prefs.mobile.zoom,1);assert.equal(prefs.desktop.mode,'edit');assert.equal(prefs.mobile.mode,'explore');prefs.mobile.zoom=1.2;assert.equal(prefs.desktop.zoom,1.5);assert.equal(prefs.desktop.layout,'reading');assert.equal(prefs.mobile.tab,'explore');});

test('dense maximum-value grids keep route analysis bounded and reconstruct only valid optimal paths',()=>{let seed=3882;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed>>>16;};const grid=Array.from({length:31},()=>Array.from({length:32},()=>random()%1024));const engine=new ExperimentEngine(experiment(grid));const start=performance.now(),routes=engine.optimalRoutes(32);assert.ok(performance.now()-start<3000);assert.ok(routes.count>0n);assert.equal(routes.paths.length,32);for(const path of routes.paths){assert.ok(validPath(grid,path));assert.equal(pathXor(grid,path),engine.solution().min);}assert.equal(routes.active.byteLength,31*32*1024);});
