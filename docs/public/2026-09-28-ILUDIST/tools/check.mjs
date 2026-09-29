import{readdir,readFile,stat,access,realpath}from'node:fs/promises';
import path from'node:path';
import{createHash}from'node:crypto';
import{fileURLToPath}from'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function applications(){
 return(await readdir(root,{withFileTypes:true})).filter(e=>e.isDirectory()&&/^\d{2}-[a-z]+$/.test(e.name)).map(e=>e.name).sort();
}
export async function walk(directory){
 const files=[];
 for(const item of await readdir(directory,{withFileTypes:true})){
  if(item.name.startsWith('experiment-'))throw new Error('Excluded directory encountered; refusing to inspect it.');
  const file=path.join(directory,item.name);
  if(item.isSymbolicLink())throw new Error(`Unexpected symbolic link: ${file}`);
  if(item.isDirectory())files.push(...await walk(file));else files.push(file);
 }
 return files;
}
export function jpegSize(bytes){
 if(bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error('Not a JPEG');
 let i=2;
 while(i<bytes.length){
  if(bytes[i]!==0xff)throw new Error('Invalid JPEG marker');
  const marker=bytes[i+1];i+=2;
  if(marker===0xd9||marker===0xda)break;
  const length=bytes.readUInt16BE(i);
  if([0xc0,0xc1,0xc2].includes(marker))return{width:bytes.readUInt16BE(i+5),height:bytes.readUInt16BE(i+3)};
  i+=length;
 }
 throw new Error('JPEG dimensions not found');
}
function ensure(condition,message){if(!condition)throw new Error(message);}
async function localReferences(file,boundary){
 const text=await readFile(file,'utf8'),refs=[];
 if(file.endsWith('.html'))refs.push(...[...text.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]));
 if(file.endsWith('.css'))refs.push(...[...text.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map(m=>m[1]));
 if(file.endsWith('.js'))refs.push(...[...text.matchAll(/(?:from\s*|import\s*|fetch\()\s*['"](\.[^'"]+)['"]/g)].map(m=>m[1]));
 for(const ref of refs){
  if(/^(?:https?:|data:|#|mailto:)/.test(ref))continue;
  const relative=decodeURIComponent(ref.split(/[?#]/)[0]),target=path.resolve(path.dirname(file),relative);
  ensure(target===boundary||target.startsWith(boundary+path.sep),`Escaping local reference: ${file}: ${ref}`);
  const info=await stat(target).catch(error=>{throw new Error(`Missing local resource: ${file}: ${ref}`,{cause:error});});
  if(info.isDirectory())await access(path.join(target,'index.html'));
 }
}
export async function check(){
 const apps=await applications();ensure(apps.length===10,'Exactly ten applications are required.');
 const master=await readFile(path.join(root,'research','catalogue.json'));
 const catalogue=JSON.parse(master),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
 ensure(catalogue.entries.length===31&&catalogue.categories.length===12,'Catalogue coverage changed; review counts and documentation.');
 const ids=new Set();
 for(const e of catalogue.entries){
  ensure(!ids.has(e.id),`Duplicate entry ${e.id}`);ids.add(e.id);
  ensure(catalogue.categories.some(c=>c.id===e.category),`Unknown category: ${e.id}`);
  ensure(['off','avoid','replace'].includes(e.intent),`Unknown intent: ${e.id}`);
  for(const key of ['title','short','service','summary','changes','caveat','mechanism','kind','status','cost'])ensure(typeof e[key]==='string'&&e[key].length,`Missing ${key}: ${e.id}`);
  ensure(e.steps.length&&e.sources.length,`Missing instructions/provenance: ${e.id}`);
  for(const url of [e.url,...e.sources.map(s=>s.url)])ensure(new URL(url).protocol==='https:',`Unsafe destination: ${e.id}`);
 }
 let bytes=0,files=0;
 for(const folder of apps){
  const dir=path.join(root,folder),identity=JSON.parse(await readFile(path.join(dir,'identity.json'),'utf8'));
  const html=await readFile(path.join(dir,'index.html'),'utf8');
  for(const item of ['README.md','app.js','style.css','core.js','base.css','catalogue.json','reference.png','assets\\icon.svg','assets\\apple-touch-icon.png','assets\\cormorant-OFL.txt','assets\\cinzel-OFL.txt','assets\\unifraktur-OFL.txt'])await access(path.join(dir,...item.split('\\')));
  ensure(hash(await readFile(path.join(dir,'catalogue.json')))===hash(master),`Outdated catalogue: ${folder}`);
  ensure(identity.reference===Number(folder.slice(0,2)),`Wrong reference: ${folder}`);
  for(const meta of ['og:title','og:description','og:url','og:image','og:image:width','og:image:height','og:image:alt','twitter:card','twitter:image','twitter:image:alt'])ensure(html.includes(`"${meta}"`),`Missing ${meta}: ${folder}`);
  ensure(html.includes(`/${folder}/social.jpg`),`Wrong social URL: ${folder}`);
  ensure(html.includes('OpenAI GPT-6 Astra')&&html.includes('Powered by Microsoft GitHub Copilot'),`Missing maker identity: ${folder}`);
  for(const [image,width,height] of [['social.jpg',1200,630],['social-x.jpg',1200,600],['social-square.jpg',1080,1080]]){
   const imageBytes=await readFile(path.join(dir,image)),size=jpegSize(imageBytes);
   ensure(size.width===width&&size.height===height,`Wrong dimensions: ${folder}/${image}`);
   ensure(imageBytes.length<5_000_000,`Sharing asset exceeds 5 MB: ${folder}/${image}`);
  }
  for(const [image,width] of [['screenshot.jpg',390],['screenshot-desktop.jpg',1440]])ensure(jpegSize(await readFile(path.join(dir,image))).width===width,`Wrong screenshot width: ${folder}/${image}`);
  const apple=await readFile(path.join(dir,'assets','apple-touch-icon.png'));ensure(apple.readUInt32BE(16)===180&&apple.readUInt32BE(20)===180,`Wrong touch icon size: ${folder}`);
  for(const file of await walk(dir)){
   files++;bytes+=(await stat(file)).size;
   if(/\.(html|css|js)$/.test(file))await localReferences(file,dir);
  }
 }
 await localReferences(path.join(root,'index.html'),root);await localReferences(path.join(root,'collection.css'),root);
 const collection=await readFile(path.join(root,'index.html'),'utf8');
 for(const folder of apps)ensure(collection.includes(`href="./${folder}/"`)&&collection.includes(`src="./${folder}/screenshot.jpg"`),`Missing finished catalogue representation: ${folder}`);
 for(const file of ['README.md','package.json','package-lock.json','playwright.config.js','social.jpg','screenshot.jpg','screenshot-desktop.jpg','assets\\icon.svg','tools\\package.mjs'])await access(path.join(root,...file.split('\\')));
 ensure(jpegSize(await readFile(path.join(root,'social.jpg'))).width===1200,'Root share image missing or invalid.');
 console.log(`Checked ${apps.length} independent apps, ${catalogue.entries.length} sourced remedies, local resources and publishing assets (${files} files; ${(bytes/1_000_000).toFixed(1)} MB).`);
 return apps;
}
if(process.argv[1]&&await realpath(process.argv[1])===await realpath(fileURLToPath(import.meta.url)))await check();
