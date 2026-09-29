// Original deterministic SVG cartography; no third-party map tiles or imagery.
import {writeFile} from 'node:fs/promises';
const islands=[
 {x:208,y:235,rx:162,ry:205,seed:5},
 {x:614,y:262,rx:125,ry:168,seed:18},
 {x:160,y:671,rx:119,ry:173,seed:32},
 {x:642,y:669,rx:112,ry:169,seed:46},
 {x:330,y:934,rx:152,ry:126,seed:71},
 {x:662,y:970,rx:83,ry:104,seed:97}
];
let seed=8;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function coast(island,scale=1){const points=Array.from({length:70},(_,i)=>{const a=i/70*Math.PI*2;const r=1+.11*Math.sin(a*7+island.seed)+.08*Math.sin(a*13+island.seed*2)+.04*Math.cos(a*23);return `${(island.x+Math.cos(a)*island.rx*r*scale).toFixed(1)},${(island.y+Math.sin(a)*island.ry*r*scale).toFixed(1)}`;});return `M${points.join('L')}Z`;}
let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100"><defs>
<radialGradient id="sea"><stop stop-color="#183637"/><stop offset="1" stop-color="#081517"/></radialGradient>
<linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#52604a"/><stop offset=".4" stop-color="#353e29"/><stop offset=".8" stop-color="#293728"/><stop offset="1" stop-color="#697054"/></linearGradient>
<linearGradient id="rock"><stop stop-color="#ad9a74"/><stop offset=".47" stop-color="#746b52"/><stop offset=".48" stop-color="#343a2e"/><stop offset="1" stop-color="#151f1b"/></linearGradient>
<radialGradient id="mist"><stop stop-color="#c4cbb0" stop-opacity=".22"/><stop offset="1" stop-color="#c4cbb0" stop-opacity="0"/></radialGradient>
<filter id="grain"><feTurbulence baseFrequency=".045" numOctaves="4" seed="12" type="fractalNoise"/><feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="soft-light"/></filter>
<filter id="shadow"><feDropShadow dx="3" dy="10" stdDeviation="5" flood-color="#020b0d" flood-opacity=".9"/></filter>
${islands.map((a,i)=>`<clipPath id="land${i}"><path d="${coast(a)}"/></clipPath>`).join('')}
<g id="tree"><path d="M0 2v15" stroke="#1b2015"/><path d="m0-15-7 17h4l-6 8h18L3 2h4Z" fill="#1b3027" stroke="#76816b" stroke-width=".35"/><path d="M0-13 0 8-5 8" fill="none" stroke="#899273" stroke-opacity=".4"/></g>
<g id="mountain"><path d="m-27 23 14-24 5 8L7-32l12 25 15 30Z" fill="url(#rock)" stroke="#9c9b7a" stroke-width=".65"/><path d="M7-32 1-13l5 7-8 16M7-32 17-6 12 0l9 13M-13-1-9 12" stroke="#d1c7a0" stroke-width=".5" fill="none"/><path d="m1-17 6-15 6 14-6-4Z" fill="#c7c2a2" opacity=".7"/></g>
<g id="house"><path d="M-7 1h14v12H-7z" fill="#85775c" stroke="#c3ae82" stroke-width=".6"/><path d="m-10 1 10-8 10 8Z" fill="#634e37" stroke="#bea477" stroke-width=".5"/><path d="M-2 6h4v7M-5 4v3m10-3v3" stroke="#252d26" stroke-width="2"/></g>
<g id="tower"><path d="M-8 2h16v34H-8z" fill="#81765b" stroke="#c5b088"/><path d="m-11 2 11-20L11 2Z" fill="#5b4a36" stroke="#b39c71"/><path d="M-2 9h4v7h-4zm0 15h4v12h-4z" fill="#1e2923"/></g>
</defs><path fill="url(#sea)" d="M0 0h800v1100H0z"/>`;
for(let i=0;i<680;i++){let x=random()*800,y=random()*1100,w=random()*26+3;svg+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}q${w/2} -3 ${w} 0" fill="none" stroke="#719591" stroke-width=".6" opacity="${(.06+random()*.13).toFixed(2)}"/>`;}
svg+=`<g fill="none" stroke="#bd9f68" opacity=".43" stroke-width="1" stroke-dasharray="3 7"><path d="M245 205C505 5 414 292 601 260M210 302C80 462 425 436 402 525S207 463 161 688M609 268C538 440 503 449 404 526S598 496 642 660M174 708C357 700 339 796 327 935M629 713C491 822 440 836 362 915M363 963C508 1054 536 941 660 974"/></g>`;
for(let i=0;i<islands.length;i++){
 const a=islands[i],d=coast(a);
 svg+=`<g filter="url(#shadow)"><path d="${coast(a,1.055)}" fill="none" stroke="#7b9a8a" stroke-opacity=".22" stroke-width="5"/><path d="${coast(a,1.025)}" fill="#4b6660" stroke="#9eb6a0" stroke-opacity=".35" stroke-width="3"/><path d="${d}" fill="#b4a17b" stroke="#cfc0a1" stroke-width="1.4"/><path d="${coast(a,.966)}" fill="url(#land)" stroke="#736d4d" stroke-width="4"/></g><g clip-path="url(#land${i})">`;
 for(let k=0;k<12;k++)svg+=`<path d="${coast({...a,x:a.x+k*2,y:a.y-k*2,seed:a.seed+k},.2+k*.068)}" fill="none" stroke="${k%2?'#a9a783':'#152c22'}" opacity=".22" stroke-width=".9"/>`;
 for(let k=0;k<150;k++){const x=a.x+(random()-.5)*a.rx*2,y=a.y+(random()-.5)*a.ry*2,s=.3+random()*.55;svg+=`<use href="#tree" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})" opacity="${(.4+random()*.5).toFixed(2)}"/>`;}
 for(let k=0;k<10;k++){const x=a.x+(random()-.5)*a.rx,y=a.y-a.ry*.48+(random()-.5)*a.ry*.5,s=.7+random()*.6;svg+=`<use href="#mountain" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})"/>`;}
 svg+=`<path d="M${a.x-40} ${a.y-90}q70 60 25 120t50 65" fill="none" stroke="#768f7d" stroke-width="4" opacity=".55"/><path d="M${a.x-40} ${a.y-90}q70 60 25 120t50 65" fill="none" stroke="#c1d0b5" stroke-width="1" opacity=".6"/>`;
 for(let k=0;k<14;k++){const x=a.x+a.rx*.35+(random()-.5)*60,y=a.y-a.ry*.30+(random()-.5)*50;svg+=`<use href="#house" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(.7)"/>`;}
 svg+=`<use href="#tower" transform="translate(${a.x+a.rx*.25} ${a.y-a.ry*.36})"/><ellipse cx="${a.x-30}" cy="${a.y-a.ry*.5}" rx="${a.rx*.8}" ry="20" fill="url(#mist)"/></g>`;
}
for(let i=0;i<22;i++){const x=380+random()*150,y=70+random()*960;svg+=`<path d="m${x} ${y} 7-14 6 5 6 10-8 5Z" fill="#706e51" stroke="#b0a37c" stroke-width=".7"/><path d="m${x-4} ${y+4}q15 10 27-2" fill="none" stroke="#718f80" opacity=".5"/>`;}
svg+=`<g transform="translate(400 540)" stroke="#bca06b" fill="none"><circle r="112" stroke-opacity=".4"/><circle r="100" stroke-opacity=".5"/><circle r="86" stroke-opacity=".25"/><path d="M-138 0h276M0-165v330" stroke-opacity=".7"/><path d="m0-160 11 142 24 18-24 11L0 160-10 12-24 0-10-18Z" fill="#a18652" stroke="#d7bd85"/><path d="m0-160 0 160 11-18ZM0 160V0l-10 12Z" fill="#ebd7a8"/><path d="m-100-100 94 93 106 107-93-95Z" stroke-opacity=".3"/></g>
<g transform="translate(76 1000)" fill="none" stroke="#958867" stroke-width=".8" opacity=".45"><circle r="35"/><circle r="28"/><path d="M0-50v100M-50 0H50m-35-35 70 70m0-70-70 70"/><path d="m0-43 8 36 35 7-35 8L0 43-8 8-43 0-8-7Z"/></g>
<g transform="translate(491 322)" stroke="#c4b089" fill="#5a614d"><path d="m-18 16 40-1-9 8h-20Z"/><path d="M1-34v48m0-46-20 40H0Zm4 6 19 28H5Z" stroke-width=".7"/></g>
<rect width="800" height="1100" fill="#4f5a44" opacity=".065" filter="url(#grain)"/>
<rect x="8" y="8" width="784" height="1084" rx="14" fill="none" stroke="#ab9262" stroke-opacity=".4"/></svg>`;
await writeFile(new URL('./archipelago.svg',import.meta.url),svg);
