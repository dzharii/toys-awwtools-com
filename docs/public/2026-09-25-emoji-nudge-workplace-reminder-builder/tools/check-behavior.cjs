const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').resolve(__dirname,'..');
const dataSource=fs.readFileSync(root+'/catalog.js','utf8');
class Element {
 constructor(id=''){this.id=id;this.value='';this.children=[];this.events={};this.hidden=true;this.style={setProperty(){}};this.classList={add(){},remove(){}};this.attrs={};this.textContent='';this.disabled=true;}
 addEventListener(name,fn){this.events[name]=fn;} append(...nodes){this.children.push(...nodes);} replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k];} focus(){} select(){} querySelector(){return new Element();} contains(){return true;}
}
function start({hash='',stored=null,blocked=false}={}){
 const elements={};const get=id=>elements[id]??=new Element(id);
 const events={};let registered;
 const document={getElementById:get,createElement:()=>new Element(),addEventListener:(name,fn)=>events[name]=fn,querySelectorAll:()=>[],createRange:()=>({selectNodeContents(){},toString(){return 'range'}}),execCommand:()=>false,modelContext:{registerTool:t=>{registered=t}}};
 const localStorage={getItem(){if(blocked)throw Error();return stored},setItem(k,v){if(blocked)throw Error();stored=v}};
 const context={window:null,document,localStorage,location:{hash,search:'?debug',href:'https://example.test/?debug'+hash},history:{replaceState(a,b,h){context.location.hash=h}},CSS:{supports:()=>false},matchMedia:()=>({matches:true}),navigator:{platform:'Linux'},URL,URLSearchParams,Blob,setTimeout:()=>0,clearTimeout(){},console};
 context.window=context;context.addEventListener=(name,fn)=>events[name]=fn;context.getSelection=()=>({removeAllRanges(){},addRange(){},toString:()=>''});
 vm.createContext(context);vm.runInContext(dataSource,context);vm.runInContext(fs.readFileSync(root+'/app.js','utf8'),context);
 return {context,get,events,registered,click:id=>get(id).events.click({}),change:(id,value)=>{get(id).value=value;get(id).events.change();},state:()=>context.nudgeDebug.getState()};
}
(async()=>{
 let app=start();assert.equal(app.state().h,'cap');assert.equal(app.get('character').children.length,5);
 app.change('preset','urgent');assert.equal(app.state().x,'hourglass');assert.equal(app.get('character-name').textContent,'Time-sensitive');
 app.change('x','none');assert.equal(app.get('preset').value,'custom');
 app.change('size','56');app.change('spacing','relaxed');let clip=app.context.nudgeDebug.clipboardContent();assert(clip.html.includes('font-size:56pt'));assert(clip.html.includes('line-height:67.20pt'));assert.equal(clip.plain.split('\n').length,5);
 app.click('reset');assert.equal(app.state().size,44);assert.equal(app.state().spacing,'normal');
 app=start({hash:'#v=1&h=crown&e=patient&g=request-hands&c=coat&f=ballet&x=hourglass'});assert.equal(app.get('character-name').textContent,'Royal Patience');assert.equal(app.get('discovery').hidden,false);
 app=start({hash:'#v=1&e=none&size=999&h=invalid&spacing=__proto__',blocked:true});assert.equal(app.state().e,'request');assert.equal(app.state().size,44);assert.equal(app.state().h,'cap');assert.equal(app.state().spacing,'normal');
 app=start({stored:JSON.stringify({h:'helmet',e:'focused',size:50}),hash:'#v=1&h=crown'});assert.equal(app.state().h,'crown');assert.equal(app.state().size,44);
 app=start({stored:JSON.stringify({h:'helmet',e:'focused',size:50})});assert.equal(app.state().h,'helmet');assert.equal(app.state().size,50);
 app.context.location.hash='#v=1&e=positive&h=none&g=none&c=none&f=none&x=none';app.events.hashchange();assert.equal(app.get('character').children.length,1);
 app.click('shuffle');assert(app.context.nudgeDebug.catalog.e.items.some(i=>i.id===app.state().e));
 await app.click('copy');assert(app.get('status').textContent.includes('Ctrl+C'));
 await app.click('share');assert.equal(app.get('link-fallback').hidden,false);assert(app.get('link-value').value.includes('#v=1'));
 app.registered.execute({preset:'approved'});assert.equal(app.state().x,'check');assert.throws(()=>app.registered.execute({preset:'invalid'}));
 console.log('PASS: actual app.js state transitions, presets, recognition, hidden discovery, fragment precedence, invalid-state recovery, blocked storage, output sizing, optional rows, shuffle, blocked clipboard/link fallback, and optional tool validation. DOM mock only; browser rendering not covered.');
})();
