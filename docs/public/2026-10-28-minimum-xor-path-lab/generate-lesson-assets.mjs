import {writeFile} from 'node:fs/promises';
import {walkthroughGrid,walkthroughSteps} from './src/advanced-lessons.js';
const ink='#263d36',green='#176b60',amber='#a66928';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(x,y,s,size=17,color=ink)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}">${escape(s)}</text>`;
const box=(x,y,w,h,fill='#fff')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" stroke="#b6cabe"/>`;
const arrow=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${green}" stroke-width="2" marker-end="url(#a)"/>`;
const frame=(name,desc,height,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 ${height}" role="img" aria-labelledby="title desc"><title id="title">${escape(name)}</title><desc id="desc">${escape(desc)}</desc><defs><marker id="a" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="${green}" stroke-width="1.5"/></marker></defs><rect width="480" height="${height}" rx="10" fill="#f1f5f0"/><g font-family="ui-monospace,monospace">${body}</g></svg>`;
let body=text(20,29,'A node = (cell, running XOR)',18);
body+=box(140,48,200,65,'#e1eee7')+text(157,73,'(0,0) · value 1',16)+text(157,98,'running XOR 1',19);
body+=arrow(180,113,120,166)+arrow(300,113,360,166)+text(28,143,'XOR 2',15)+text(365,143,'XOR 3',15);
body+=box(20,171,200,65)+text(37,196,'(0,1) · value 2',16)+text(37,221,'running XOR 3',19);
body+=box(260,171,200,65)+text(277,196,'(1,0) · value 3',16)+text(277,221,'running XOR 2',19);
body+=arrow(120,236,120,291)+arrow(360,236,360,291)+text(139,270,'XOR 4',15)+text(379,270,'XOR 4',15);
body+=box(20,296,200,65,'#f4e9d8')+text(37,321,'(1,1) · value 4',16)+text(37,346,'final XOR 7',20);
body+=box(260,296,200,65,'#d4e8dc')+text(277,321,'(1,1) · value 4',16)+text(277,346,'final XOR 6',20);
body+=text(20,394,'Same cell. Two reachable situations.',16)+text(20,422,'Compare labels only at the destination.',16);
await writeFile('public/assets/expanded-states.svg',frame('Explore cell-and-XOR situations','Grid [[1,2],[3,4]] expands to five reachable nodes. Start XOR 1 branches to XOR 3 at (0,1) and XOR 2 at (1,0). The shared destination (1,1) has two nodes, with final XOR 7 and 6.',442,body));
body=text(20,30,'A running XOR summarizes earlier bits.',17);
const rows=[['start value','0000000101','5'],['XOR next 3','0000000011','3'],['prefix result','0000000110','6'],['XOR next 5','0000000101','5'],['new result','0000000011','3']];
rows.forEach((row,i)=>{let y=52+i*47;body+=box(16,y,448,41,i===2||i===4?'#dfeee4':'#fff')+text(27,y+26,row[0],15)+text(215,y+26,row[1],19)+text(420,y+26,row[2],19);});
body+=text(20,312,'(5 XOR 3) XOR 5 = 6 XOR 5 = 3',18)+text(20,342,'Two flips cancel in each bit column.',16);
await writeFile('public/assets/accumulated-xor.svg',frame('Extend an accumulated XOR','The ten-bit calculation is 5 XOR 3 equals 6, then 6 XOR 5 equals 3. Prefix result 6 replaces the earlier calculation without repeating its cells.',362,body));
body=text(20,30,'Entering value 4: extend each option.',17);
for(const [i,x,y] of [[0,3,7],[1,2,6]]){const top=55+i*105;body+=box(20,top,155,66)+text(31,top+24,i?'left prefix':'top prefix',15)+text(31,top+51,`x = ${x}`,22)+arrow(175,top+33,287,top+33)+text(190,top+21,'XOR 4',15)+box(300,top,160,66,'#e0eee5')+text(315,top+39,`${x} XOR 4 = ${y}`,17);}
body+=text(20,291,'Store the alternatives: {6, 7}',20)+text(20,323,'Do not combine the two histories.',16);
await writeFile('public/assets/incoming-alternatives.svg',frame('Alternative predecessor states','The upper predecessor has accumulated XOR 3 and the left predecessor has XOR 2. Each is separately XORed with 4. The results 7 and 6 are kept as a set; the alternatives themselves are not XORed together.',344,body));
body=text(20,28,'cell value above; reachable set below',16);
for(const s of walkthroughSteps){const [r,c]=s.cell,x=20+c*155,y=49+r*150;body+=box(x,y,130,104,s.states.includes(0)&&r===1&&c===2?'#d9eadd':'#fff')+text(x+10,y+23,`(${r},${c})`,14,'#61776a')+text(x+10,y+53,`value ${s.value}`,18)+text(x+10,y+84,`{${s.states.join(',')}}`,23,green);if(c<2)body+=arrow(x+131,y+51,x+152,y+51);if(r===0)body+=arrow(x+65,y+105,x+65,y+145);}
body+=text(20,335,'Destination: incoming {1,2}',18)+text(20,366,'1 XOR 2 = 3;  2 XOR 2 = 0',19)+text(20,396,'Keep {0,3}. Choose 0 only now.',18);
await writeFile('public/assets/reachable-walkthrough.svg',frame('All reachable sets in the counterexample',`Grid ${JSON.stringify(walkthroughGrid)} has row-major sets {0}, {1}, {1}, {2}, {1,2}, {0,3}. At the destination, incoming state 1 produces 3 and incoming state 2 produces 0.`,418,body));
body=text(20,28,'Two prefixes at the same cell (1,1)',17);
body+=box(20,48,220,67)+text(31,73,'right, down',16)+text(31,99,'1 XOR 2 XOR 3 = 0',16);
body+=box(20,144,220,67)+text(31,169,'down, right',16)+text(31,195,'1 XOR 2 XOR 3 = 0',16);
body+=arrow(240,82,286,125)+arrow(240,177,286,134)+box(291,92,170,77,'#dfeee4')+text(304,119,'same (cell, x)',15)+text(304,148,'x = 0',23);
body+=arrow(375,170,375,239)+text(20,247,'Suffix starts AFTER the shared cell.',16);
body+=box(20,266,440,61,'#fff')+text(33,291,'Choose next values 2, then 5:',16)+text(33,316,'both finish: 0 XOR 2 XOR 5 = 7',18);
await writeFile('public/assets/same-state-suffix.svg',frame('Equivalent states have the same future','In grid [[1,2],[2,3]], both paths reach cell (1,1) with XOR 0. If extended through cells 2 and 5, both finish at 7. The continuation excludes the shared cell, which is already included in the prefix.',348,body));

body=text(20,30,'One move: enter cell (1,1)',18);
body+=box(20,48,440,90,'#fff')+text(34,74,'Earlier cells: 1, then 2',17)+text(34,102,'incomingXor = 1 XOR 2 = 3',19,green)+text(34,125,'0000000001 XOR 0000000010',15);
body+=arrow(240,139,240,170);
body+=box(20,175,440,65,'#f6ecdc')+text(34,200,'Current cell (1,1) has number 4',17,amber)+text(34,225,'cellNumber = 4  (0000000100)',18,amber);
body+=arrow(240,241,240,272);
body+=box(20,277,440,100,'#dfeee4')+text(34,303,'newXor = incomingXor XOR cellNumber',17)+text(34,331,'       = 3 XOR 4 = 7',22,green)+text(34,358,'0000000011 XOR 0000000100',15)+text(34,395,'Result bits: 0000000111',18,green);
await writeFile('public/assets/one-transition.svg',frame('Name each number in one transition','Earlier cell numbers 1 and 2 have incomingXor 3. Current cell (1,1) has fixed cellNumber 4. The new running result is newXor 3 XOR 4 equals 7, binary 0000000111.',416,body));


body=text(20,30,'Same information, two representations',17);
body+=box(20,49,440,66,'#e0eee5')+text(34,77,'cell (1,1), printed number 4',17)+text(34,101,'reachable set S(1,1) = {6,7}',20,green);
body+=text(20,148,'x: result index   dp[1][1][x]',17);
for(const [i,x,flag] of [[0,5,false],[1,6,true],[2,7,true],[3,8,false]]){const y=162+i*41;body+=box(20,y,440,35,flag?'#dcebe0':'#fff')+text(38,y+24,String(x),18)+text(265,y+24,flag?'true':'false',18,flag?green:'#718276');}
body+=text(20,354,'Other result indices are also false.',16);
await writeFile('public/assets/set-to-flags.svg',frame('A set and Boolean flags represent the same states','At cell (1,1), printed number 4, the reachable set is {6,7}. Boolean entries dp[1][1][6] and dp[1][1][7] are true. Every other result index, including 5 and 8, is false.',375,body));

console.log('Created seven exact educational SVGs.');
