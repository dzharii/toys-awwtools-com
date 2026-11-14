import {test} from 'node:test';import assert from 'node:assert/strict';
import {setupCelebration} from '../dist/celebration.js';
test('audio is gesture-prepared, bounded, rate limited, optional and failure tolerant',async()=>{
 let created=0,resumed=0,enabled=true;const oscillators=[],ramps=[];
 globalThis.matchMedia=()=>({matches:true,addEventListener(){}});globalThis.document={addEventListener(){}};
 const param=()=>({value:0,setValueAtTime(value,time){ramps.push({value,time});},exponentialRampToValueAtTime(value,time){assert.ok(value>0);ramps.push({value,time});}});
 const base=()=>({connect(){},disconnect(){}});
 class AudioContext{constructor(){created++;this.state='suspended';this.currentTime=2;this.destination={};}async resume(){resumed++;this.state='running';}async suspend(){this.state='suspended';}createGain(){return {...base(),gain:param()};}createBiquadFilter(){return {...base(),frequency:param(),Q:param()};}createOscillator(){const osc={...base(),frequency:param(),start(time){this.startTime=time;},stop(time){this.stopTime=time;}};oscillators.push(osc);return osc;}}
 globalThis.window={AudioContext};const effect=setupCelebration(()=>enabled);
 effect.play(null,null);await Promise.resolve();assert.equal(created,0);
 effect.prepareSound();effect.play(null,null);await Promise.resolve();await Promise.resolve();
 assert.equal(created,1);assert.equal(resumed,1);assert.equal(oscillators.length,3);
 assert.ok(Math.max(...oscillators.map(o=>o.stopTime))-2<.6);assert.ok(ramps.every(r=>Number.isFinite(r.time)));
 effect.play(null,null);await Promise.resolve();assert.equal(oscillators.length,3);
 enabled=false;effect.prepareSound();effect.play(null,null);await Promise.resolve();assert.equal(oscillators.length,3);
 window.AudioContext=class{constructor(){throw Error('Audio denied');}};enabled=true;const denied=setupCelebration(()=>enabled);assert.doesNotThrow(()=>denied.prepareSound());denied.play(null,null);await Promise.resolve();
});
test('visual celebration preserves the source asset and removes every temporary node',()=>{
 let onMotion;globalThis.matchMedia=()=>({matches:false,addEventListener(event,fn){onMotion=fn;}});
 const element=()=>({children:[],style:{setProperty(key,value){this[key]=value;}},classes:new Set(),setAttribute(){},append(child){child.parent=this;this.children.push(child);},remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);},classList:{add(){},remove(){}}});
 const body=element();globalThis.document={body,createElement:element,addEventListener(){}};globalThis.innerWidth=1363;globalThis.innerHeight=936;
 const image={src:'https://example.test/42.png',currentSrc:'https://example.test/42.png'},wrapper=element();wrapper.isConnected=true;wrapper.querySelector=()=>image;wrapper.getBoundingClientRect=()=>({left:900,top:400,width:240,height:40});
 wrapper.classList={add:name=>wrapper.classes.add(name),remove:name=>wrapper.classes.delete(name)};
 const effect=setupCelebration(()=>false);effect.play(wrapper,null);
 assert.equal(body.children.length,1);assert.equal(body.children[0].children.length,22);assert.equal(wrapper.children[0].children.length,14);assert.ok(wrapper.classes.has('is-celebrating'));assert.equal(image.src,'https://example.test/42.png');
 assert.ok(wrapper.children[0].children.every(s=>s.style.backgroundImage.includes(image.src)));
 effect.cancel();assert.equal(body.children.length,0);assert.equal(wrapper.children.length,0);assert.equal(wrapper.classes.size,0);effect.cancel();assert.equal(typeof onMotion,'function');
});
